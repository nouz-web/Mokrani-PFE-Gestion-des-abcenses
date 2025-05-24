"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { createClient } from "@supabase/supabase-js"
import { Clock, MapPin, User } from "lucide-react"

interface TimetableEntry {
  id: number
  day_of_week: number
  start_time: string
  end_time: string
  room: string
  session_type: string
  module_name: string
  module_code: string
  teacher_name: string
}

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const timeSlots = ["08:00-09:30", "09:45-11:15", "11:30-13:00", "13:15-14:45", "15:00-16:30", "16:45-18:15"]

// Create Supabase client
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  return createClient(supabaseUrl, supabaseKey)
}

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [selectedWeek, setSelectedWeek] = useState<string>("current")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTimetable = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createSupabaseClient()

        // Get current user
        const userJson = localStorage.getItem("user")
        if (!userJson) {
          throw new Error("User not found")
        }

        const user = JSON.parse(userJson)

        // Fetch timetable for the user's group
        const { data, error } = await supabase
          .from("timetable")
          .select(
            `
            id,
            day_of_week,
            start_time,
            end_time,
            room,
            session_type,
            modules!inner(id, name, code),
            teacher_id,
            group_id
          `,
          )
          .eq("group_id", user.group_id)

        if (error) throw error

        // Fetch teacher names
        const teacherIds = [...new Set(data.map((entry: any) => entry.teacher_id))]
        const { data: teachers, error: teachersError } = await supabase
          .from("users")
          .select("id, name")
          .in("id", teacherIds)

        if (teachersError) throw teachersError

        // Map teacher names to timetable entries
        const teacherMap = new Map(teachers.map((teacher: any) => [teacher.id, teacher.name]))

        const formattedTimetable = data.map((entry: any) => ({
          id: entry.id,
          day_of_week: entry.day_of_week,
          start_time: entry.start_time,
          end_time: entry.end_time,
          room: entry.room,
          session_type: entry.session_type,
          module_name: entry.modules.name,
          module_code: entry.modules.code,
          teacher_name: teacherMap.get(entry.teacher_id) || "Unknown Teacher",
        }))

        setTimetable(formattedTimetable)
      } catch (err: any) {
        console.error("Error fetching timetable:", err)
        setError(err.message)

        // Mock data for development
        const mockTimetable: TimetableEntry[] = [
          {
            id: 1,
            day_of_week: 1,
            start_time: "08:00",
            end_time: "09:30",
            room: "A101",
            session_type: "COUR",
            module_name: "Database Systems",
            module_code: "IS301",
            teacher_name: "Dr. Hassan Alami",
          },
          {
            id: 2,
            day_of_week: 1,
            start_time: "09:45",
            end_time: "11:15",
            room: "Lab1",
            session_type: "TP",
            module_name: "Database Systems",
            module_code: "IS301",
            teacher_name: "Dr. Hassan Alami",
          },
          {
            id: 3,
            day_of_week: 2,
            start_time: "08:00",
            end_time: "09:30",
            room: "A103",
            session_type: "COUR",
            module_name: "Systems Analysis",
            module_code: "IS302",
            teacher_name: "Dr. Leila Benkirane",
          },
          {
            id: 4,
            day_of_week: 3,
            start_time: "13:15",
            end_time: "14:45",
            room: "A102",
            session_type: "TD",
            module_name: "Database Systems",
            module_code: "IS301",
            teacher_name: "Dr. Hassan Alami",
          },
          {
            id: 5,
            day_of_week: 4,
            start_time: "09:45",
            end_time: "11:15",
            room: "Lab2",
            session_type: "TP",
            module_name: "Systems Analysis",
            module_code: "IS302",
            teacher_name: "Dr. Leila Benkirane",
          },
        ]

        setTimetable(mockTimetable)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimetable()
  }, [selectedWeek])

  const getSessionTypeBadge = (type: string) => {
    switch (type) {
      case "COUR":
        return <Badge className="bg-blue-100 text-blue-800">Lecture</Badge>
      case "TD":
        return <Badge className="bg-green-100 text-green-800">Tutorial</Badge>
      case "TP":
        return <Badge className="bg-purple-100 text-purple-800">Practical</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const getTimetableCell = (day: number, timeSlot: string) => {
    const [startTime, endTime] = timeSlot.split("-")
    const entries = timetable.filter(
      (entry) => entry.day_of_week === day && entry.start_time <= startTime && entry.end_time >= endTime,
    )

    if (entries.length === 0) {
      return <div className="h-full"></div>
    }

    return entries.map((entry) => (
      <div key={entry.id} className="p-2 h-full rounded-md border bg-white dark:bg-gray-800 shadow-sm">
        <div className="font-medium text-sm">{entry.module_name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{entry.module_code}</div>
        <div className="mt-1 flex items-center gap-1 text-xs">
          <User className="h-3 w-3" />
          <span>{entry.teacher_name}</span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs">
          <MapPin className="h-3 w-3" />
          <span>{entry.room}</span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" />
          <span>
            {entry.start_time} - {entry.end_time}
          </span>
        </div>
        <div className="mt-1">{getSessionTypeBadge(entry.session_type)}</div>
      </div>
    ))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading timetable...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Weekly Timetable</h1>
        <div className="w-48">
          <Label htmlFor="week-select" className="sr-only">
            Select Week
          </Label>
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger id="week-select">
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Week</SelectItem>
              <SelectItem value="next">Next Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200">Error Loading Timetable</CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 dark:text-red-300">
              Showing mock data instead. Please try again later or contact support.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Class Schedule</CardTitle>
          <CardDescription>
            Your weekly schedule for {selectedWeek === "current" ? "current" : "next"} week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-1"></div>
            {dayNames.slice(0, 5).map((day, index) => (
              <div key={day} className="font-medium text-center">
                {day}
              </div>
            ))}
          </div>

          {timeSlots.map((timeSlot) => (
            <div key={timeSlot} className="grid grid-cols-6 gap-4 mt-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{timeSlot}</div>
              {[1, 2, 3, 4, 5].map((day) => (
                <div key={day} className="min-h-24 border rounded-md p-1 bg-gray-50 dark:bg-gray-900">
                  {getTimetableCell(day, timeSlot)}
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
