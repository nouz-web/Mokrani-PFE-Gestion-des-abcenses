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
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Edit, Plus, Search, Trash, GraduationCap } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

interface Specialization {
  id: number
  name: string
  code?: string
  level_id: number
  department?: string
  duration?: number
  program_type?: string
  group_name?: string
  description?: string
  status?: string
  level_name?: string
}

interface Level {
  id: number
  name: string
}

// Static mock data as fallback
const MOCK_SPECIALIZATIONS: Specialization[] = [
  {
    id: 1,
    name: "Information Systems",
    code: "IS",
    level_id: 3,
    department: "Computer Science",
    duration: 3,
    program_type: "license",
    group_name: "Group A",
    description: "Information Systems specialization focusing on database management and system analysis",
    status: "active",
    level_name: "L3",
  },
  {
    id: 2,
    name: "Artificial Intelligence",
    code: "AI",
    level_id: 3,
    department: "Computer Science",
    duration: 3,
    program_type: "license",
    group_name: "Group B",
    description: "AI specialization covering machine learning, neural networks, and data science",
    status: "active",
    level_name: "L3",
  },
  {
    id: 3,
    name: "Networks and Security",
    code: "NET",
    level_id: 4,
    department: "Computer Science",
    duration: 2,
    program_type: "master",
    group_name: "Group M1",
    description: "Advanced networking and cybersecurity program",
    status: "active",
    level_name: "M1",
  },
]

const MOCK_LEVELS: Level[] = [
  { id: 1, name: "L1" },
  { id: 2, name: "L2" },
  { id: 3, name: "L3" },
  { id: 4, name: "M1" },
  { id: 5, name: "M2" },
]

// Create Supabase client
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  return createClient(supabaseUrl, supabaseKey)
}

export default function SpecializationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [specializations, setSpecializations] = useState<Specialization[]>([])
  const [levels, setLevels] = useState<Level[]>([])

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    level_id: "",
    department: "",
    duration: "3",
    program_type: "license",
    group_name: "",
    description: "",
    status: "active",
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

        // Fetch levels
        const { data: levelsData, error: levelsError } = await supabase.from("levels").select("*")

        if (levelsError) throw levelsError

        // Fetch specializations
        const { data: specializationsData, error: specializationsError } = await supabase
          .from("specializations")
          .select("*")

        if (specializationsError) throw specializationsError

        // Enrich specializations with level names
        const enrichedSpecializations = specializationsData.map((spec: any) => {
          const level = levelsData.find((l: any) => l.id === spec.level_id)

          return {
            ...spec,
            level_name: level?.name || "Unknown",
            // Set default values for fields that might not exist in the database
            department: spec.department || "Computer Science",
            duration: spec.duration || (spec.level_id <= 3 ? 3 : 2),
            program_type: spec.program_type || (spec.level_id <= 3 ? "license" : "master"),
            group_name: spec.group_name || "Group A",
            status: spec.status || "active",
          }
        })

        setLevels(levelsData)
        setSpecializations(enrichedSpecializations)
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message)

        // Fallback to mock data
        setLevels(MOCK_LEVELS)
        setSpecializations(MOCK_SPECIALIZATIONS)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredSpecializations = specializations.filter((spec) => {
    return (
      (selectedLevel === "all" || spec.level_name === selectedLevel) &&
      (!searchQuery ||
        spec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (spec.code && spec.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (spec.department && spec.department.toLowerCase().includes(searchQuery.toLowerCase())))
    )
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSpecialization = () => {
    setFormData({
      name: "",
      code: "",
      level_id: "",
      department: "",
      duration: "3",
      program_type: "license",
      group_name: "",
      description: "",
      status: "active",
    })
    setIsAddDialogOpen(true)
  }

  const handleEditSpecialization = (specialization: Specialization) => {
    setSelectedSpecialization(specialization)
    setFormData({
      name: specialization.name,
      code: specialization.code || "",
      level_id: specialization.level_id.toString(),
      department: specialization.department || "",
      duration: specialization.duration?.toString() || "3",
      program_type: specialization.program_type || "license",
      group_name: specialization.group_name || "",
      description: specialization.description || "",
      status: specialization.status || "active",
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteSpecialization = (specialization: Specialization) => {
    setSelectedSpecialization(specialization)
    setIsDeleteDialogOpen(true)
  }

  const submitAddSpecialization = async () => {
    if (!formData.name || !formData.level_id) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createSupabaseClient()

      const newSpecialization = {
        name: formData.name,
        code: formData.code,
        level_id: Number.parseInt(formData.level_id),
        department: formData.department,
        duration: Number.parseInt(formData.duration),
        program_type: formData.program_type,
        group_name: formData.group_name,
        description: formData.description,
        status: formData.status,
      }

      const { data, error } = await supabase.from("specializations").insert(newSpecialization).select()

      if (error) throw error

      if (data && data.length > 0) {
        const level = levels.find((l) => l.id === Number.parseInt(formData.level_id))

        const createdSpecialization = {
          ...data[0],
          level_name: level?.name || "Unknown",
        }

        setSpecializations((prev) => [...prev, createdSpecialization])
      }

      setIsAddDialogOpen(false)
    } catch (err: any) {
      console.error("Error adding specialization:", err)
      alert(`Failed to add specialization: ${err.message}`)

      // Fallback to client-side update
      const newSpecialization: Specialization = {
        id: Math.max(...specializations.map((s) => s.id)) + 1,
        name: formData.name,
        code: formData.code,
        level_id: Number.parseInt(formData.level_id),
        department: formData.department,
        duration: Number.parseInt(formData.duration),
        program_type: formData.program_type,
        group_name: formData.group_name,
        description: formData.description,
        status: formData.status,
        level_name: levels.find((l) => l.id === Number.parseInt(formData.level_id))?.name,
      }

      setSpecializations((prev) => [...prev, newSpecialization])
      setIsAddDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitEditSpecialization = async () => {
    if (!selectedSpecialization) return

    setIsSubmitting(true)

    try {
      const supabase = createSupabaseClient()

      const updatedSpecialization = {
        name: formData.name,
        code: formData.code,
        level_id: Number.parseInt(formData.level_id),
        department: formData.department,
        duration: Number.parseInt(formData.duration),
        program_type: formData.program_type,
        group_name: formData.group_name,
        description: formData.description,
        status: formData.status,
      }

      const { error } = await supabase
        .from("specializations")
        .update(updatedSpecialization)
        .eq("id", selectedSpecialization.id)

      if (error) throw error

      // Update local state
      setSpecializations((prev) =>
        prev.map((spec) =>
          spec.id === selectedSpecialization.id
            ? {
                ...spec,
                ...updatedSpecialization,
                level_name: levels.find((l) => l.id === Number.parseInt(formData.level_id))?.name,
              }
            : spec,
        ),
      )

      setIsEditDialogOpen(false)
      setSelectedSpecialization(null)
    } catch (err: any) {
      console.error("Error updating specialization:", err)
      alert(`Failed to update specialization: ${err.message}`)

      // Fallback to client-side update
      setSpecializations((prev) =>
        prev.map((spec) =>
          spec.id === selectedSpecialization.id
            ? {
                ...spec,
                name: formData.name,
                code: formData.code,
                level_id: Number.parseInt(formData.level_id),
                department: formData.department,
                duration: Number.parseInt(formData.duration),
                program_type: formData.program_type,
                group_name: formData.group_name,
                description: formData.description,
                status: formData.status,
                level_name: levels.find((l) => l.id === Number.parseInt(formData.level_id))?.name,
              }
            : spec,
        ),
      )
      setIsEditDialogOpen(false)
      setSelectedSpecialization(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitDeleteSpecialization = async () => {
    if (!selectedSpecialization) return

    setIsSubmitting(true)

    try {
      const supabase = createSupabaseClient()

      const { error } = await supabase.from("specializations").delete().eq("id", selectedSpecialization.id)

      if (error) throw error

      setSpecializations((prev) => prev.filter((spec) => spec.id !== selectedSpecialization.id))
      setIsDeleteDialogOpen(false)
      setSelectedSpecialization(null)
    } catch (err: any) {
      console.error("Error deleting specialization:", err)
      alert(`Failed to delete specialization: ${err.message}`)

      // Fallback to client-side update
      setSpecializations((prev) => prev.filter((spec) => spec.id !== selectedSpecialization.id))
      setIsDeleteDialogOpen(false)
      setSelectedSpecialization(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "planned":
        return <Badge className="bg-blue-100 text-blue-800">Planned</Badge>
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getProgramTypeBadge = (type?: string) => {
    const colors = {
      license: "bg-blue-100 text-blue-800",
      master: "bg-purple-100 text-purple-800",
      doctorate: "bg-red-100 text-red-800",
    }
    return <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{type}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading specializations...</p>
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
        <h1 className="text-2xl font-bold">Specialization Management</h1>
        <Button onClick={handleAddSpecialization}>
          <Plus className="mr-2 h-4 w-4" />
          Add Specialization
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Specializations</CardTitle>
          <CardDescription>Search by name, code, or department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Academic Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.name}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Label htmlFor="search">Search</Label>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, code, or department"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specializations List</CardTitle>
          <CardDescription>
            Showing {filteredSpecializations.length} of {specializations.length} specializations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSpecializations.length > 0 ? (
                filteredSpecializations.map((specialization) => (
                  <TableRow key={specialization.id}>
                    <TableCell className="font-medium">{specialization.code || "-"}</TableCell>
                    <TableCell>{specialization.name}</TableCell>
                    <TableCell>{specialization.level_name}</TableCell>
                    <TableCell>{specialization.department}</TableCell>
                    <TableCell>{getProgramTypeBadge(specialization.program_type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {specialization.duration} years
                      </div>
                    </TableCell>
                    <TableCell>{specialization.group_name}</TableCell>
                    <TableCell>{getStatusBadge(specialization.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditSpecialization(specialization)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteSpecialization(specialization)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                    No specializations found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Specialization Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Specialization</DialogTitle>
            <DialogDescription>Create a new specialization program</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Specialization Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" name="code" value={formData.code} onChange={handleInputChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level_id">Academic Level</Label>
                <Select value={formData.level_id} onValueChange={(value) => handleSelectChange("level_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.id} value={level.id.toString()}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" value={formData.department} onChange={handleInputChange} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="program_type">Program Type</Label>
                <Select
                  value={formData.program_type}
                  onValueChange={(value) => handleSelectChange("program_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="license">License</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="doctorate">Doctorate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (years)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  max="8"
                  value={formData.duration}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group_name">Group Name</Label>
                <Input id="group_name" name="group_name" value={formData.group_name} onChange={handleInputChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitAddSpecialization} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Specialization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Specialization Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Specialization</DialogTitle>
            <DialogDescription>Update specialization information</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Specialization Name</Label>
                <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">Code</Label>
                <Input id="edit-code" name="code" value={formData.code} onChange={handleInputChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-level_id">Academic Level</Label>
                <Select value={formData.level_id} onValueChange={(value) => handleSelectChange("level_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.id} value={level.id.toString()}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-program_type">Program Type</Label>
                <Select
                  value={formData.program_type}
                  onValueChange={(value) => handleSelectChange("program_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="license">License</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="doctorate">Doctorate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (years)</Label>
                <Input
                  id="edit-duration"
                  name="duration"
                  type="number"
                  min="1"
                  max="8"
                  value={formData.duration}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-group_name">Group Name</Label>
                <Input
                  id="edit-group_name"
                  name="group_name"
                  value={formData.group_name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitEditSpecialization} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Specialization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Specialization Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Specialization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this specialization? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedSpecialization && (
            <div className="py-4">
              <p className="font-medium">{selectedSpecialization.name}</p>
              <p className="text-sm text-muted-foreground">Code: {selectedSpecialization.code || "-"}</p>
              <p className="text-sm text-muted-foreground">Department: {selectedSpecialization.department}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitDeleteSpecialization} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete Specialization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
