import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get session ID from cookie
    const sessionId = cookies().get("session_id")?.value

    // Delete session from database if exists
    if (sessionId && supabase) {
      await supabase.from("sessions").delete().eq("id", sessionId)
    }

    // Clear cookies
    cookies().delete("user")
    cookies().delete("session_id")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, message: "Logout failed" }, { status: 500 })
  }
}
