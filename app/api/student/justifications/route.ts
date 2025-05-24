import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection error" }, { status: 500 })
    }

    // Get current user from cookie
    const userCookie = cookies().get("user")
    if (!userCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    const studentId = user.id

    const { data: justifications, error } = await supabase
      .from("justifications")
      .select(`
        *,
        modules (
          id,
          name,
          name_ar,
          code
        ),
        attendance (
          id,
          date,
          status
        )
      `)
      .eq("student_id", studentId)
      .order("submitted_at", { ascending: false })

    if (error) {
      console.error("Error fetching justifications:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ justifications })
  } catch (error: any) {
    console.error("Error in GET /api/student/justifications:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection error" }, { status: 500 })
    }

    const formData = await request.formData()

    // Get current user from cookie
    const userCookie = cookies().get("user")
    if (!userCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    const studentId = user.id

    const moduleId = formData.get("moduleId") as string
    const absenceDate = formData.get("absenceDate") as string
    const reason = formData.get("reason") as string
    const file = formData.get("file") as File | null

    if (!moduleId || !absenceDate || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // البحث عن سجل الغياب المطابق
    const { data: attendanceRecord, error: attendanceError } = await supabase
      .from("attendance")
      .select("id")
      .eq("student_id", studentId)
      .eq("module_id", Number.parseInt(moduleId))
      .eq("status", "absent")
      .gte("date", absenceDate)
      .lt("date", new Date(new Date(absenceDate).getTime() + 24 * 60 * 60 * 1000).toISOString())
      .single()

    if (attendanceError || !attendanceRecord) {
      return NextResponse.json({ error: "No matching absence record found" }, { status: 404 })
    }

    // رفع الملف (في التطبيق الحقيقي، سيتم رفعه إلى خدمة تخزين)
    let filePath = reason

    if (file) {
      // في حالة وجود ملف، يمكن استخدام Supabase Storage
      const fileName = `${Date.now()}_${file.name}`
      const buffer = await file.arrayBuffer()

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("justifications")
        .upload(`${studentId}/${fileName}`, buffer, {
          contentType: file.type,
          cacheControl: "3600",
        })

      if (uploadError) {
        console.error("Error uploading file:", uploadError)
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
      }

      // الحصول على URL العام للملف
      const { data: publicURL } = supabase.storage.from("justifications").getPublicUrl(`${studentId}/${fileName}`)

      filePath = publicURL.publicUrl
    }

    // إنشاء التبرير
    const { data: justification, error: justificationError } = await supabase
      .from("justifications")
      .insert({
        student_id: studentId,
        module_id: Number.parseInt(moduleId),
        attendance_id: attendanceRecord.id,
        file_path: filePath,
        status: "pending",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (justificationError) {
      console.error("Error creating justification:", justificationError)
      return NextResponse.json({ error: "Failed to submit justification" }, { status: 500 })
    }

    // إرسال إشعار للأستاذ المسؤول
    // الحصول على معرف الأستاذ المسؤول عن الوحدة
    const { data: moduleData, error: moduleError } = await supabase
      .from("modules")
      .select("teacher_id")
      .eq("id", Number.parseInt(moduleId))
      .single()

    if (!moduleError && moduleData.teacher_id) {
      // إنشاء إشعار للأستاذ
      await supabase.from("notifications").insert({
        title: "تبرير غياب جديد",
        message: `قام الطالب ${user.name} بتقديم تبرير غياب جديد يحتاج إلى مراجعة`,
        active: true,
        created_at: new Date().toISOString(),
        created_by: studentId,
        target_user_type: "teacher",
      })
    }

    return NextResponse.json({
      message: "Justification submitted successfully",
      justification,
    })
  } catch (error: any) {
    console.error("Error in POST /api/student/justifications:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
