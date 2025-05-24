"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { createClient } from "@supabase/supabase-js"
import { AlertCircle, Calendar, Clock, FileUp } from "lucide-react"
import Link from "next/link"

interface Absence {
  id: number
  date: string
  module_name: string
  module_code: string
  session_type: string
  status: string
  justified: boolean
  justification_status?: string
}

// Create Supabase client
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  return createClient(supabaseUrl, supabaseKey)
}

export default function AbsencesPage() {
  const [absences, setAbsences] = useState<Absence[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string>("all")
  const [selectedModule, setSelectedModule] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modules, setModules] = useState<{ id: number; name: string; code: string }[]>([])
  const [semesters, setSemesters] = useState<{ id: number; name: string }[]>([])
  const [stats, setStats] = useState({
    total: 0,
    justified: 0,
    unjustified: 0,
    pending: 0,
  })

  useEffect(() => {
    const fetchAbsences = async () => {
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

        // Fetch semesters
        const { data: semestersData, error: semestersError } = await supabase.from("semesters").select("*")

        if (semestersError) throw semestersError

        setSemesters(semestersData)

        // Fetch modules for the student
        const { data: modulesData, error: modulesError } = await supabase
          .from("student_enrollments")
          .select("modules(id, name, code)")
          .eq("student_id", user.id)

        if (modulesError) throw modulesError

        const uniqueModules = Array.from(
          new Map(modulesData.map((item: any) => [item.modules.id, item.modules])).values(),
        )

        setModules(uniqueModules)

        // Fetch absences
        let query = supabase
          .from("attendance")
          .select(
            `
            id,
            date,
            status,
            modules(id, name, code),
            timetable(session_type),
            justifications(id, status)
          `,
          )
          .eq("student_id", user.id)
          .eq("status", "absent")

        if (selectedSemester !== "all") {
          query = query.eq("modules.semester_id", selectedSemester)
        }

        if (selectedModule !== "all") {
          query = query.eq("module_id", selectedModule)
        }

        const { data, error: absencesError } = await query

        if (absencesError) throw absencesError

        const formattedAbsences = data.map((absence: any) => ({
          id: absence.id,
          date: absence.date,
          module_name: absence.modules.name,
          module_code: absence.modules.code,
          session_type: absence.timetable?.session_type || "COUR",
          status: absence.status,
          justified: absence.justifications && absence.justifications.length > 0,
          justification_status:
            absence.justifications && absence.justifications.length > 0 ? absence.justifications[0].status : undefined,
        }))

        setAbsences(formattedAbsences)

        // Calculate statistics
        const total = formattedAbsences.length
        const justified = formattedAbsences.filter((a) => a.justified && a.justification_status === "approved").length
        const pending = formattedAbsences.filter((a) => a.justified && a.justification_status === "pending").length
        const unjustified = total - justified - pending

        setStats({
          total,
          justified,
          unjustified,
          pending,
        })
      } catch (err: any) {
        console.error("Error fetching absences:", err)
        setError(err.message)

        // Mock data for development
        const mockAbsences: Absence[] = [
          {
            id: 1,
            date: "2023-10-05T08:00:00",
            module_name: "Database Systems",
            module_code: "IS301",
            session_type: "COUR",
            status: "absent",
            justified: false,
          },
          {
            id: 2,
            date: "2023-10-12T10:00:00",
            module_name: "Database Systems",
            module_code: "IS301",
            session_type: "TP",
            status: "absent",
            justified: true,
            justification_status: "approved",
          },
          {
            id: 3,
            date: "2023-10-19T14:00:00",
            module_name: "Systems Analysis",
            module_code: "IS302",
            session_type: "TD",
            status: "absent",
            justified: true,
            justification_status: "pending",
          },
          {
            id: 4,
            date: "2023-11-02T08:00:00",
            module_name: "Database Systems",
            module_code: "IS301",
            session_type: "COUR",
            status: "absent",
            justified: false,
          },
          {
            id: 5,
            date: "2023-11-09T10:00:00",
            module_name: "Systems Analysis",
            module_code: "IS302",
            session_type: "TP",
            status: "absent",
            justified: false,
          },
        ]

        setAbsences(mockAbsences)

        // Mock modules
        setModules([
          { id: 1, name: "Database Systems", code: "IS301" },
          { id: 2, name: "Systems Analysis", code: "IS302" },
        ])

        // Mock semesters
        setSemesters([
          { id: 1, name: "Semester 1" },
          { id: 2, name: "Semester 2" },
        ])

        // Mock statistics
        setStats({
          total: 5,
          justified: 1,
          unjustified: 3,
          pending: 1,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAbsences()
  }, [selectedSemester, selectedModule])

  const getStatusBadge = (absence: Absence) => {
    if (absence.justified) {
      if (absence.justification_status === "approved") {
        return <Badge className="bg-green-100 text-green-800">Justified</Badge>
      } else if (absence.justification_status === "pending") {
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      } else if (absence.justification_status === "rejected") {
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      }
    }
    return <Badge className="bg-red-100 text-red-800">Unjustified</Badge>
  }

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading absences...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Absences Record</h1>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200">Error Loading Absences</CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 dark:text-red-300">
              Showing mock data instead. Please try again later or contact support.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Absences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Justified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.justified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Unjustified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.unjustified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Absences</CardTitle>
          <CardDescription>Filter by semester and module</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="semester-select">Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger id="semester-select">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {semesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id.toString()}>
                      {semester.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="module-select">Module</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger id="module-select">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id.toString()}>
                      {module.code} - {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Absences List</CardTitle>
          <CardDescription>
            Showing {absences.length} absences
            {selectedModule !== "all" && ` for ${modules.find((m) => m.id.toString() === selectedModule)?.name}`}
            {selectedSemester !== "all" && ` in ${semesters.find((s) => s.id.toString() === selectedSemester)?.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {absences.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Session Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {absences.map((absence) => (
                  <TableRow key={absence.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(absence.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(absence.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{absence.module_name}</div>
                      <div className="text-sm text-muted-foreground">{absence.module_code}</div>
                    </TableCell>
                    <TableCell>{getSessionTypeBadge(absence.session_type)}</TableCell>
                    <TableCell>{getStatusBadge(absence)}</TableCell>
                    <TableCell className="text-right">
                      {!absence.justified && (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dashboard/student/justifications/new?absence=${absence.id}`}>
                            <FileUp className="h-4 w-4 mr-2" />
                            Justify
                          </Link>
                        </Button>
                      )}
                      {absence.justified && absence.justification_status === "rejected" && (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dashboard/student/justifications/new?absence=${absence.id}`}>
                            <FileUp className="h-4 w-4 mr-2" />
                            Resubmit
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No absences found</h3>
              <p className="text-muted-foreground mt-2">You don't have any absences matching the selected filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
