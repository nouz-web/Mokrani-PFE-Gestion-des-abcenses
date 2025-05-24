import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import bcryptjs from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, password, userType } = body

    console.log("Login attempt:", { id, userType })

    if (!id || !password || !userType) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ success: false, message: "Database connection error" }, { status: 500 })
    }

    // For the Technical Administrator, use hardcoded credentials
    if (userType === "tech-admin" && id === "2020234049140" && password === "010218821") {
      console.log("Technical Administrator login successful")

      try {
        // Check if user exists in database
        const { data: existingUser, error: userError } = await supabase.from("users").select("*").eq("id", id).single()

        // Only try to create user if it doesn't exist
        if (userError && userError.code === "PGRST116") {
          console.log("User not found, creating tech admin account")

          // If user doesn't exist, create it
          const hashedPassword = await bcryptjs.hash(password, 10)

          // Insert with simplified error handling
          await supabase.from("users").insert({
            id,
            name: "Technical Administrator",
            password: hashedPassword,
            user_type: userType,
            created_at: new Date().toISOString(),
          })
        } else {
          console.log("Tech admin user already exists")
        }
      } catch (dbError) {
        console.error("Database operation error:", dbError)
        // Continue with login even if DB operation fails
      }

      // Return user data for client-side storage
      return NextResponse.json({
        success: true,
        user: {
          id,
          userType,
          name: "Technical Administrator",
        },
      })
    }

    // For demo users, accept "password" as the password
    if (
      ((userType === "student" && id === "S12345") ||
        (userType === "teacher" && id === "T12345") ||
        (userType === "admin" && id === "A12345")) &&
      password === "password"
    ) {
      const name =
        userType === "student" ? "Ahmed Benali" : userType === "teacher" ? "Dr. Mohammed Alaoui" : "Amina Tazi"

      try {
        // Check if user exists
        const { data: existingUser, error: userError } = await supabase.from("users").select("*").eq("id", id).single()

        // Only try to create user if it doesn't exist
        if (userError && userError.code === "PGRST116") {
          console.log("Demo user not found, creating account")

          // Create user if not exists
          const hashedPassword = await bcryptjs.hash(password, 10)

          await supabase.from("users").insert({
            id,
            name,
            password: hashedPassword,
            user_type: userType,
            created_at: new Date().toISOString(),
          })
        } else {
          console.log("Demo user already exists")
        }
      } catch (dbError) {
        console.error("Database operation error:", dbError)
        // Continue with login even if DB operation fails
      }

      // Return user data for client-side storage
      return NextResponse.json({
        success: true,
        user: {
          id,
          userType,
          name,
        },
      })
    }

    // Regular user authentication
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .eq("user_type", userType)
        .single()

      if (error) {
        console.error("Error fetching user:", error)
        return NextResponse.json(
          {
            success: false,
            message: "Invalid credentials",
          },
          { status: 401 },
        )
      }

      // For demo purposes, accept "password" for all users
      if (password === "password" || (await bcryptjs.compare(password, user.password))) {
        // Create a session in the database
        const sessionId = crypto.randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

        await supabase.from("sessions").insert({
          id: sessionId,
          user_id: user.id,
          expires_at: expiresAt.toISOString(),
        })

        // Return user data for client-side storage
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            userType: user.user_type,
            name: user.name,
            level_id: user.level_id,
            specialization_id: user.specialization_id,
            group_id: user.group_id,
          },
        })
      }

      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        {
          success: false,
          message: "Database connection error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Authentication failed",
      },
      { status: 500 },
    )
  }
}
