"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileCheck,
  Home,
  QrCode,
  Settings,
  Users,
  BookOpenCheck,
  GraduationCap,
  School,
  UserSquare2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps {
  user: {
    id: string
    name: string
    userType: string
  }
}

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const renderNavItems = () => {
    switch (user.userType) {
      case "student":
        return (
          <>
            <NavItem
              href="/dashboard/student"
              icon={<Home className="h-5 w-5" />}
              isActive={isActive("/dashboard/student")}
            >
              Dashboard
            </NavItem>
            <NavItem
              href="/dashboard/student/timetable"
              icon={<Calendar className="h-5 w-5" />}
              isActive={isActive("/dashboard/student/timetable")}
            >
              Timetable
            </NavItem>
            <NavItem
              href="/dashboard/student/lessons"
              icon={<BookOpen className="h-5 w-5" />}
              isActive={isActive("/dashboard/student/lessons")}
            >
              Lessons
            </NavItem>
            <NavItem
              href="/dashboard/student/absences"
              icon={<ClipboardCheck className="h-5 w-5" />}
              isActive={isActive("/dashboard/student/absences")}
            >
              Absences
            </NavItem>
            <NavItem
              href="/dashboard/student/justifications"
              icon={<FileCheck className="h-5 w-5" />}
              isActive={isActive("/dashboard/student/justifications")}
            >
              Justifications
            </NavItem>
            <NavItem
              href="/dashboard/student/scan"
              icon={<QrCode className="h-5 w-5" />}
              isActive={isActive("/dashboard/student/scan")}
            >
              Scan QR
            </NavItem>
          </>
        )
      case "teacher":
        return (
          <>
            <NavItem
              href="/dashboard/teacher"
              icon={<Home className="h-5 w-5" />}
              isActive={isActive("/dashboard/teacher")}
            >
              Dashboard
            </NavItem>
            <NavItem
              href="/dashboard/teacher/attendance"
              icon={<ClipboardCheck className="h-5 w-5" />}
              isActive={isActive("/dashboard/teacher/attendance")}
            >
              Attendance
            </NavItem>
            <NavItem
              href="/dashboard/teacher/justifications"
              icon={<FileCheck className="h-5 w-5" />}
              isActive={isActive("/dashboard/teacher/justifications")}
            >
              Justifications
            </NavItem>
            <NavItem
              href="/dashboard/teacher/qr-code"
              icon={<QrCode className="h-5 w-5" />}
              isActive={isActive("/dashboard/teacher/qr-code")}
            >
              Generate QR
            </NavItem>
          </>
        )
      case "admin":
        return (
          <>
            <NavItem
              href="/dashboard/admin"
              icon={<Home className="h-5 w-5" />}
              isActive={isActive("/dashboard/admin")}
            >
              Dashboard
            </NavItem>
            <NavItem
              href="/dashboard/admin/programs"
              icon={<BookOpenCheck className="h-5 w-5" />}
              isActive={isActive("/dashboard/admin/programs")}
            >
              Programs
            </NavItem>
            <NavItem
              href="/dashboard/admin/modules"
              icon={<BookOpen className="h-5 w-5" />}
              isActive={isActive("/dashboard/admin/modules")}
            >
              Modules
            </NavItem>
            <NavItem
              href="/dashboard/admin/users"
              icon={<Users className="h-5 w-5" />}
              isActive={isActive("/dashboard/admin/users")}
            >
              Users
            </NavItem>
            <NavItem
              href="/dashboard/admin/groups"
              icon={<UserSquare2 className="h-5 w-5" />}
              isActive={isActive("/dashboard/admin/groups")}
            >
              Groups
            </NavItem>
            <NavItem
              href="/dashboard/admin/reports"
              icon={<BarChart3 className="h-5 w-5" />}
              isActive={isActive("/dashboard/admin/reports")}
            >
              Reports
            </NavItem>
          </>
        )
      case "tech-admin":
        return (
          <>
            <NavItem
              href="/dashboard/tech-admin"
              icon={<Home className="h-5 w-5" />}
              isActive={isActive("/dashboard/tech-admin")}
            >
              Dashboard
            </NavItem>
            <NavItem
              href="/dashboard/tech-admin/users"
              icon={<Users className="h-5 w-5" />}
              isActive={isActive("/dashboard/tech-admin/users")}
            >
              Users
            </NavItem>
            <NavItem
              href="/dashboard/tech-admin/statistics"
              icon={<BarChart3 className="h-5 w-5" />}
              isActive={isActive("/dashboard/tech-admin/statistics")}
            >
              Statistics
            </NavItem>
            <NavItem
              href="/dashboard/tech-admin/notifications"
              icon={<ClipboardCheck className="h-5 w-5" />}
              isActive={isActive("/dashboard/tech-admin/notifications")}
            >
              Notifications
            </NavItem>
            <NavItem
              href="/dashboard/tech-admin/settings"
              icon={<Settings className="h-5 w-5" />}
              isActive={isActive("/dashboard/tech-admin/settings")}
            >
              Settings
            </NavItem>
            <NavItem
              href="/dashboard/tech-admin/env"
              icon={<School className="h-5 w-5" />}
              isActive={isActive("/dashboard/tech-admin/env")}
            >
              Environment
            </NavItem>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-full flex-col border-r bg-white dark:bg-gray-950 dark:border-gray-800">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {user.userType === "student" && "Student Portal"}
          {user.userType === "teacher" && "Teacher Portal"}
          {user.userType === "admin" && "Admin Portal"}
          {user.userType === "tech-admin" && "Tech Admin Portal"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your activities</p>
      </div>
      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col gap-1">{renderNavItems()}</nav>
      </ScrollArea>
      <div className="p-4 border-t dark:border-gray-800">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 user-themed-bg/10">
            <GraduationCap className="h-5 w-5 user-themed-text" />
          </div>
          <div className="truncate">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  isActive: boolean
  children: React.ReactNode
}

function NavItem({ href, icon, isActive, children }: NavItemProps) {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 px-3 py-2 h-auto",
        isActive && "bg-gray-100 dark:bg-gray-800 user-themed-text",
      )}
    >
      <Link href={href}>
        {icon}
        <span>{children}</span>
      </Link>
    </Button>
  )
}
