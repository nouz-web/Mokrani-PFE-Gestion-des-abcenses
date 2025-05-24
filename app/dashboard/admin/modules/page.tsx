"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Edit, Plus, Search, Trash, Clock } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

interface Module {
  id: number
  name: string
  specialization_id: number
  semester_id: number
  lecture_hours: number
  practical_hours: number
  tutorial_hours: number
  coefficient: number
  credits: number
  specialization_name?: string
  semester_name?: string
  status?: string
}

interface Specialization {
  id: number
  name: string
  level_id: number
}

interface Semester {
  id: number
  name: string
}

// Static mock data as fallback
const MOCK_MODULES: Module[] = [
  {
    id: 1,
    name: "Database Systems",
    specialization_id: 1,
    semester_id: 1,
    lecture_hours: 45,
    practical_hours: 30,
    tutorial_hours: 15,
    coefficient: 3,
    credits: 6,
    specialization_name: "Information Systems",
    semester_name: "Semester 1",
    status: "active",
  },
  {
    id: 2,
    name: "Systems Analysis",
    specialization_id: 1,
    semester_id: 1,
    lecture_hours: 30,
    practical_hours: 30,
    tutorial_hours: 15,
    coefficient: 2,
    credits: 5,
    specialization_name: "Information Systems",
    semester_name: "Semester 1",
    status: "active",
  },
  {
    id: 3,
    name: "Machine Learning",
    specialization_id: 2,
    semester_id: 1,
    lecture_hours: 45,
    practical_hours: 30,
    tutorial_hours: 15,
    coefficient: 3,
    credits: 6,
    specialization_name: "Artificial Intelligence",
    semester_name: "Semester 1",
    status: "active",
  },
]

const MOCK_SPECIALIZATIONS: Specialization[] = [
  { id: 1, name: "Information Systems", level_id: 3 },
  { id: 2, name: "Artificial Intelligence", level_id: 3 },
  { id: 3, name: "Networks", level_id: 4 },
  { id: 4, name: "Cybersecurity", level_id: 4 },
]

const MOCK_SEMESTERS: Semester[] = [
  { id: 1, name: "Semester 1" },
  { id: 2, name: "Semester 2" },
]

// Create Supabase client
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  return createClient(supabaseUrl, supabaseKey)
}

export default function ModulesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modules, setModules] = useState<Module[]>([])
  const [specializations, setSpecializations] = useState<Specialization[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])

  const [formData, setFormData] = useState({
    name: "",
    specialization_id: "",
    semester_id: "",
    lecture_hours: "30",
    practical_hours: "15",
    tutorial_hours: "15",
    coefficient: "2",
    credits: "4",
  })

  // Load data from Supabase after component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createSupabaseClient()

        // Check if Supabase is configured
        if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
          throw new Error("Supabase not configured")
        }

        // Fetch modules
        const { data: modulesData, error: modulesError } = await supabase.from("modules").select("*")

        if (modulesError) throw modulesError

        // Fetch specializations
        const { data: specializationsData, error: specializationsError } = await supabase
          .from("specializations")
          .select("*")

        if (specializationsError) throw specializationsError

        // Fetch semesters
        const { data: semestersData, error: semestersError } = await supabase.from("semesters").select("*")

        if (semestersError) throw semestersError

        // Enrich modules with related data
        const enrichedModules = modulesData.map((module: any) => {
          const specialization = specializationsData.find((s: any) => s.id === module.specialization_id)
          const semester = semestersData.find((s: any) => s.id === module.semester_id)

          return {
            ...module,
            specialization_name: specialization?.name || "Unknown",
            semester_name: semester?.name || "Unknown",
            status: "active",
          }
        })

        setModules(enrichedModules)
        setSpecializations(specializationsData)
        setSemesters(semestersData)
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message)

        // Fallback to mock data
        setModules(MOCK_MODULES)
        setSpecializations(MOCK_SPECIALIZATIONS)
        setSemesters(MOCK_SEMESTERS)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredModules = modules.filter((module) => {
    return (
      !searchQuery ||
      module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.specialization_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddModule = () => {
    setFormData({
      name: "",
      specialization_id: "",
      semester_id: "",
      lecture_hours: "30",
      practical_hours: "15",
      tutorial_hours: "15",
      coefficient: "2",
      credits: "4",
    })
    setIsAddDialogOpen(true)
  }

  const handleEditModule = (module: Module) => {
    setSelectedModule(module)
    setFormData({
      name: module.name,
      specialization_id: module.specialization_id.toString(),
      semester_id: module.semester_id.toString(),
      lecture_hours: module.lecture_hours.toString(),
      practical_hours: module.practical_hours.toString(),
      tutorial_hours: module.tutorial_hours.toString(),
      coefficient: module.coefficient.toString(),
      credits: module.credits.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteModule = (module: Module) => {
    setSelectedModule(module)
    setIsDeleteDialogOpen(true)
  }

  const submitAddModule = async () => {
    if (!formData.name || !formData.specialization_id || !formData.semester_id) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createSupabaseClient()

      const newModule = {
        name: formData.name,
        specialization_id: Number.parseInt(formData.specialization_id),
        semester_id: Number.parseInt(formData.semester_id),
        lecture_hours: Number.parseInt(formData.lecture_hours),
        practical_hours: Number.parseInt(formData.practical_hours),
        tutorial_hours: Number.parseInt(formData.tutorial_hours),
        coefficient: Number.parseInt(formData.coefficient),
        credits: Number.parseInt(formData.credits),
      }

      const { data, error } = await supabase.from("modules").insert(newModule).select()

      if (error) throw error

      if (data && data.length > 0) {
        const specialization = specializations.find((s) => s.id === Number.parseInt(formData.specialization_id))
        const semester = semesters.find((s) => s.id === Number.parseInt(formData.semester_id))

        const createdModule = {
          ...data[0],
          specialization_name: specialization?.name || "Unknown",
          semester_name: semester?.name || "Unknown",
          status: "active",
        }

        setModules((prev) => [...prev, createdModule])
      }

      setIsAddDialogOpen(false)
    } catch (err: any) {
      console.error("Error adding module:", err)
      alert(`Failed to add module: ${err.message}`)

      // Fallback to client-side update
      const newModule: Module = {
        id: Math.max(...modules.map((m) => m.id)) + 1,
        name: formData.name,
        specialization_id: Number.parseInt(formData.specialization_id),
        semester_id: Number.parseInt(formData.semester_id),
        lecture_hours: Number.parseInt(formData.lecture_hours),
        practical_hours: Number.parseInt(formData.practical_hours),
        tutorial_hours: Number.parseInt(formData.tutorial_hours),
        coefficient: Number.parseInt(formData.coefficient),
        credits: Number.parseInt(formData.credits),
        specialization_name: specializations.find((s) => s.id === Number.parseInt(formData.specialization_id))?.name,
        semester_name: semesters.find((s) => s.id === Number.parseInt(formData.semester_id))?.name,
        status: "active",
      }

      setModules((prev) => [...prev, newModule])
      setIsAddDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitEditModule = async () => {
    if (!selectedModule) return

    setIsSubmitting(true)

    try {
      const supabase = createSupabaseClient()

      const updatedModule = {
        name: formData.name,
        specialization_id: Number.parseInt(formData.specialization_id),
        semester_id: Number.parseInt(formData.semester_id),
        lecture_hours: Number.parseInt(formData.lecture_hours),
        practical_hours: Number.parseInt(formData.practical_hours),
        tutorial_hours: Number.parseInt(formData.tutorial_hours),
        coefficient: Number.parseInt(formData.coefficient),
        credits: Number.parseInt(formData.credits),
      }

      const { error } = await supabase.from("modules").update(updatedModule).eq("id", selectedModule.id)

      if (error) throw error

      // Update local state
      setModules((prev) =>
        prev.map((module) =>
          module.id === selectedModule.id
            ? {
                ...module,
                ...updatedModule,
                specialization_name: specializations.find((s) => s.id === Number.parseInt(formData.specialization_id))
                  ?.name,
                semester_name: semesters.find((s) => s.id === Number.parseInt(formData.semester_id))?.name,
              }
            : module,
        ),
      )

      setIsEditDialogOpen(false)
      setSelectedModule(null)
    } catch (err: any) {
      console.error("Error updating module:", err)
      alert(`Failed to update module: ${err.message}`)

      // Fallback to client-side update
      setModules((prev) =>
        prev.map((module) =>
          module.id === selectedModule.id
            ? {
                ...module,
                name: formData.name,
                specialization_id: Number.parseInt(formData.specialization_id),
                semester_id: Number.parseInt(formData.semester_id),
                lecture_hours: Number.parseInt(formData.lecture_hours),
                practical_hours: Number.parseInt(formData.practical_hours),
                tutorial_hours: Number.parseInt(formData.tutorial_hours),
                coefficient: Number.parseInt(formData.coefficient),
                credits: Number.parseInt(formData.credits),
                specialization_name: specializations.find((s) => s.id === Number.parseInt(formData.specialization_id))
                  ?.name,
                semester_name: semesters.find((s) => s.id === Number.parseInt(formData.semester_id))?.name,
              }
            : module,
        ),
      )
      setIsEditDialogOpen(false)
      setSelectedModule(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitDeleteModule = async () => {
    if (!selectedModule) return

    setIsSubmitting(true)

    try {
      const supabase = createSupabaseClient()

      const { error } = await supabase.from("modules").delete().eq("id", selectedModule.id)

      if (error) throw error

      setModules((prev) => prev.filter((module) => module.id !== selectedModule.id))
      setIsDeleteDialogOpen(false)
      setSelectedModule(null)
    } catch (err: any) {
      console.error("Error deleting module:", err)
      alert(`Failed to delete module: ${err.message}`)

      // Fallback to client-side update
      setModules((prev) => prev.filter((module) => module.id !== selectedModule.id))
      setIsDeleteDialogOpen(false)
      setSelectedModule(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading modules...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading data</div>
          <p className="text-muted-foreground">{error}</p>
          <p className="mt-4">Using mock data instead</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Module Management</h1>
        <Button onClick={handleAddModule}>
          <Plus className="mr-2 h-4 w-4" />
          Add Module
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Modules</CardTitle>
          <CardDescription>Search by name or specialization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modules List</CardTitle>
          <CardDescription>
            Showing {filteredModules.length} of {modules.length} modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Coefficient</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModules.length > 0 ? (
                filteredModules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell className="font-medium">{module.name}</TableCell>
                    <TableCell>{module.specialization_name}</TableCell>
                    <TableCell>{module.semester_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        <span>L:{module.lecture_hours}</span>
                        <span>P:{module.practical_hours}</span>
                        <span>T:{module.tutorial_hours}</span>
                      </div>
                    </TableCell>
                    <TableCell>{module.coefficient}</TableCell>
                    <TableCell>{module.credits}</TableCell>
                    <TableCell>{getStatusBadge(module.status || "active")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditModule(module)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteModule(module)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    No modules found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Module Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
            <DialogDescription>Create a new module</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Module Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialization_id">Specialization</Label>
                <Select
                  value={formData.specialization_id}
                  onValueChange={(value) => handleSelectChange("specialization_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((spec) => (
                      <SelectItem key={spec.id} value={spec.id.toString()}>
                        {spec.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester_id">Semester</Label>
                <Select
                  value={formData.semester_id}
                  onValueChange={(value) => handleSelectChange("semester_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id.toString()}>
                        {semester.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lecture_hours">Lecture Hours</Label>
                <Input
                  id="lecture_hours"
                  name="lecture_hours"
                  type="number"
                  value={formData.lecture_hours}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="practical_hours">Practical Hours</Label>
                <Input
                  id="practical_hours"
                  name="practical_hours"
                  type="number"
                  value={formData.practical_hours}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tutorial_hours">Tutorial Hours</Label>
                <Input
                  id="tutorial_hours"
                  name="tutorial_hours"
                  type="number"
                  value={formData.tutorial_hours}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coefficient">Coefficient</Label>
                <Input
                  id="coefficient"
                  name="coefficient"
                  type="number"
                  step="0.5"
                  value={formData.coefficient}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  name="credits"
                  type="number"
                  value={formData.credits}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitAddModule} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>Update module information</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Module Name</Label>
              <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-specialization_id">Specialization</Label>
                <Select
                  value={formData.specialization_id}
                  onValueChange={(value) => handleSelectChange("specialization_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((spec) => (
                      <SelectItem key={spec.id} value={spec.id.toString()}>
                        {spec.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-semester_id">Semester</Label>
                <Select
                  value={formData.semester_id}
                  onValueChange={(value) => handleSelectChange("semester_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id.toString()}>
                        {semester.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-lecture_hours">Lecture Hours</Label>
                <Input
                  id="edit-lecture_hours"
                  name="lecture_hours"
                  type="number"
                  value={formData.lecture_hours}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-practical_hours">Practical Hours</Label>
                <Input
                  id="edit-practical_hours"
                  name="practical_hours"
                  type="number"
                  value={formData.practical_hours}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tutorial_hours">Tutorial Hours</Label>
                <Input
                  id="edit-tutorial_hours"
                  name="tutorial_hours"
                  type="number"
                  value={formData.tutorial_hours}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-coefficient">Coefficient</Label>
                <Input
                  id="edit-coefficient"
                  name="coefficient"
                  type="number"
                  step="0.5"
                  value={formData.coefficient}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-credits">Credits</Label>
                <Input
                  id="edit-credits"
                  name="credits"
                  type="number"
                  value={formData.credits}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitEditModule} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Module Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this module? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedModule && (
            <div className="py-4">
              <p className="font-medium">{selectedModule.name}</p>
              <p className="text-sm text-muted-foreground">Specialization: {selectedModule.specialization_name}</p>
              <p className="text-sm text-muted-foreground">Semester: {selectedModule.semester_name}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitDeleteModule} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete Module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
