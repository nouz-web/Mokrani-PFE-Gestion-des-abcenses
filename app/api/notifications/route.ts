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
    const userType = user.userType
    const levelId = user.level_id
    const specializationId = user.specialization_id

    // Build query for notifications
    let query = supabase.from("notifications").select("*").eq("active", true).order("created_at", { ascending: false })

    // Filter by target user type if specified
    if (userType) {
      query = query.or(`target_user_type.eq.${userType},target_user_type.is.null`)
    }

    // Filter by level if student has a level
    if (levelId && userType === "student") {
      query = query.or(`target_level_id.eq.${levelId},target_level_id.is.null`)
    }

    // Filter by specialization if student has a specialization
    if (specializationId && userType === "student") {
      query = query.or(`target_specialization_id.eq.${specializationId},target_specialization_id.is.null`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching notifications:", error)
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }

    return NextResponse.json({ notifications: data })
  } catch (error: any) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const userId = user.id
    const userType = user.userType

    // Only admin and tech-admin can create notifications
    if (userType !== "admin" && userType !== "tech-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { title, message, targetUserType, targetLevelId, targetSpecializationId } = body

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        title,
        message,
        active: true,
        created_at: new Date().toISOString(),
        created_by: userId,
        target_user_type: targetUserType || null,
        target_level_id: targetLevelId || null,
        target_specialization_id: targetSpecializationId || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating notification:", error)
      return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
    }

    return NextResponse.json({ notification: data })
  } catch (error: any) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
