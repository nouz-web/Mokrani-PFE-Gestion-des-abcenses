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
    const specializationId = user.specialization_id
    const groupId = user.group_id

    if (!specializationId) {
      return NextResponse.json({ error: "Student specialization not found" }, { status: 404 })
    }

    // Get student's specialization and level information
    const { data: specialization, error: specializationError } = await supabase
      .from("specializations")
      .select(`
        *,
        level:level_id(*)
      `)
      .eq("id", specializationId)
      .single()

    if (specializationError) {
      console.error("Error fetching specialization:", specializationError)
      return NextResponse.json({ error: "Failed to fetch student specialization" }, { status: 500 })
    }

    // Get current semester
    const { data: currentSemester, error: semesterError } = await supabase
      .from("semesters")
      .select("*")
      .eq("is_current", true)
      .single()

    if (semesterError) {
      console.error("Error fetching current semester:", semesterError)
      return NextResponse.json({ error: "Failed to fetch current semester" }, { status: 500 })
    }

    // Get modules for the student's specialization and current semester
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("*")
      .eq("specialization_id", specializationId)
      .eq("semester_id", currentSemester.id)

    if (modulesError) {
      console.error("Error fetching modules:", modulesError)
      return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 })
    }

    // Get timetable entries for these modules
    const moduleIds = modules.map((module) => module.id)

    let timetableQuery = supabase
      .from("timetable")
      .select(`
        *,
        modules:module_id(*),
        users:teacher_id(name)
      `)
      .in("module_id", moduleIds)

    // If student has a group, filter by group
    if (groupId) {
      timetableQuery = timetableQuery.or(`group_id.eq.${groupId},group_id.is.null`)
    }

    const { data: timetableEntries, error: timetableError } = await timetableQuery

    if (timetableError) {
      console.error("Error fetching timetable:", timetableError)
      return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 })
    }

    // Organize timetable by day of week
    const timetableByDay: Record<string, any[]> = {
      "1": [], // Monday
      "2": [], // Tuesday
      "3": [], // Wednesday
      "4": [], // Thursday
      "5": [], // Friday
      "6": [], // Saturday
      "7": [], // Sunday
    }

    timetableEntries.forEach((entry) => {
      timetableByDay[entry.day_of_week.toString()].push(entry)
    })

    return NextResponse.json({
      specialization,
      currentSemester,
      modules,
      timetable: timetableByDay,
    })
  } catch (error: any) {
    console.error("Error fetching timetable:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
