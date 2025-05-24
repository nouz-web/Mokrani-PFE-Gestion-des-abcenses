"use server"

import { cookies } from "next/headers"
import { createServerClient } from "./supabase"

export async function getCurrentUser() {
  const userCookie = cookies().get("user")

  if (!userCookie) {
    return null
  }

  try {
    return JSON.parse(userCookie.value)
  } catch {
    return null
  }
}

export async function logout() {
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

  return { success: true }
}
