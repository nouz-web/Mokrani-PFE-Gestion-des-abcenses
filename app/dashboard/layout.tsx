"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { userTypeColors } from "@/lib/theme-config"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for user in localStorage
    const userJson = localStorage.getItem("user")

    if (!userJson) {
      console.log("No user found in localStorage, redirecting to login")
      router.push("/login")
      return
    }

    try {
      const userData = JSON.parse(userJson)
      setUser(userData)
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  // Get user type colors
  const colors = userTypeColors[user.userType as keyof typeof userTypeColors] || userTypeColors.student

  return (
    <div className="flex min-h-screen flex-col">
      <style jsx global>{`
        :root {
          --user-primary: ${colors.primary};
          --user-secondary: ${colors.secondary};
          --user-accent: ${colors.accent};
        }
        
        .user-themed-bg {
          background-color: var(--user-primary);
        }
        
        .user-themed-text {
          color: var(--user-primary);
        }
        
        .user-themed-border {
          border-color: var(--user-primary);
        }
        
        .user-themed-button {
          background-color: var(--user-primary);
          color: white;
        }
        
        .user-themed-button:hover {
          background-color: var(--user-accent);
        }
      `}</style>

      <DashboardHeader user={user} />
      <div className="flex flex-1 relative">
        <aside className="hidden md:block w-64 border-r border-gray-200 dark:border-gray-800 shrink-0">
          <DashboardSidebar user={user} />
        </aside>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
