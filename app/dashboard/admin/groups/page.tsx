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
import { Edit, Plus, Search, Trash, Users } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

interface Group {
  id: number
  name: string
  specialization_id: number
  level_id: number
  academic_year_id: number
  max_students: number
  current_students?: number
  specialization_name?: string
  level_name?: string
  academic_year_name?: string
}

interface Level {
  id: number
  name: string
}

interface Specialization {
  id: number
  name: string
  level_id: number
}

interface AcademicYear {
  id: number
  name: string
}

// Create Supabase client
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  return createClient(supabaseUrl, supabaseKey)
}

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedSpecialization, setSelectedSpecialization] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [groups, setGroups] = useState<Group[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [specializations, setSpecializations] = useState<Specialization[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])

  const [formData, setFormData] = useState({
    name: "",
    specialization_id: "",
    level_id: "",
    academic_year_id: "",
    max_students: "30",
  })

  // Load data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createSupabaseClient()

        if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
          throw new Error("Supabase not configured")
        }

        // Fetch all reference data
        const [levelsRes, specializationsRes, academicYearsRes, groupsRes, usersRes] = await Promise.all([
          supabase.from("levels").select("*"),
          supabase.from("specializations").select("*"),
          supabase.from("academic_years").select("*"),
          supabase.from("groups").select("*"),
          supabase.from("users").select("id, group_id").eq("user_type", "student"),
        ])

        if (levelsRes.error) throw levelsRes.error
        if (specializationsRes.error) throw specializationsRes.error
        if (academicYearsRes.error) throw academicYearsRes.error
        if (groupsRes.error) throw groupsRes.error
        if (usersRes.error) throw usersRes.error

        // Count students per group
        const studentCounts = usersRes.data.reduce((acc: any, user: any) => {
          if (user.group_id) {
            acc[user.group_id] = (acc[user.group_id] || 0) + 1
          }
          return acc
        }, {})

        // Enrich groups with related data
        const enrichedGroups = groupsRes.data.map((group: any) => {
          const level = levelsRes.data.find((l: any) => l.id === group.level_id)
          const specialization = specializationsRes.data.find((s: any) => s.id === group.specialization_id)
          const academicYear = academicYearsRes.data.find((y: any) => y.id === group.academic_year_id)

          return {
            ...group,
            level_name: level?.name || "",
            specialization_name: specialization?.name || "",
            academic_year_name: academicYear?.name || "",
            current_students: studentCounts[group.id] || 0,
          }
        })

        setLevels(levelsRes.data)
        setSpecializations(specializationsRes.data)
        setAcademicYears(academicYearsRes.data)
        setGroups(enrichedGroups)
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      !searchQuery ||
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.specialization_name && group.specialization_name.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesLevel = selectedLevel === "all" || group.level_name === selectedLevel
    const matchesSpecialization =
      selectedSpecialization === "all" || group.specialization_name === selectedSpecialization

    return matchesSearch && matchesLevel && matchesSpecialization
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddGroup = () => {
    setFormData({
      name: "",
      specialization_id: "",
      level_id: "",
      academic_year_id: "",
      max_students: "30",
    })
    setIsAddDialogOpen(true)
  }

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group)
    setFormData({
      name: group.name,
      specialization_id: group.specialization_id.toString(),
      level_id: group.level_id.toString(),
      academic_year_id: group.academic_year_id.toString(),
      max_students: group.max_students.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteGroup = (group: Group) => {
    setSelectedGroup(group)
    setIsDeleteDialogOpen(true)
  }

  const submitAddGroup = async () => {
    if (!formData.name || !formData.specialization_id || !formData.level_id || !formData.academic_year_id) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createSupabaseClient()

      const newGroup = {
        name: formData.name,
        specialization_id: Number.parseInt(formData.specialization_id),
        level_id: Number.parseInt(formData.level_id),
        academic_year_id: Number.parseInt(formData.academic_year_id),
        max_students: Number.parseInt(formData.max_students),
      }

      const { data, error } = await supabase.from("groups").insert(newGroup).select()

      if (error) throw error

      if (data && data.length > 0) {
        const level = levels.find((l) => l.id === Number.parseInt(formData.level_id))
        const specialization = specializations.find((s) => s.id === Number.parseInt(formData.specialization_id))
        const academicYear = academicYears.find((y) => y.id === Number.parseInt(formData.academic_year_id))

        const createdGroup = {
          ...data[0],
          level_name: level?.name || "",
          specialization_name: specialization?.name || "",
          academic_year_name: academicYear?.name || "",
          current_students: 0,
        }

        setGroups((prev) => [...prev, createdGroup])
      }

      setIsAddDialogOpen(false)
    } catch (err: any) {
      console.error("Error adding group:", err)
      alert(`Failed to add group: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitEditGroup = async () => {
    if (!selectedGroup) return

    setIsSubmitting(true)

    try {
      const supabase = createSupabaseClient()

      const updatedGroup = {
        name: formData.name,
        specialization_id: Number.parseInt(formData.specialization_id),
        level_id: Number.parseInt(formData.level_id),
        academic_year_id: Number.parseInt(formData.academic_year_id),
        max_students: Number.parseInt(formData.max_students),
      }

      const { error } = await supabase.from("groups").update(updatedGroup).eq("id", selectedGroup.id)

      if (error) throw error

      // Update local state
      setGroups((prev) =>
        prev.map((group) =>
          group.id === selectedGroup.id
            ? {
                ...group,
                ...updatedGroup,
                level_name: levels.find((l) => l.id === Number.parseInt(formData.level_id))?.name || "",
                specialization_name:
                  specializations.find((s) => s.id === Number.parseInt(formData.specialization_id))?.name || "",
                academic_year_name:
                  academicYears.find((y) => y.id === Number.parseInt(formData.academic_year_id))?.name || "",
              }
            : group,
        ),
      )

      setIsEditDialogOpen(false)
      setSelectedGroup(null)
    } catch (err: any) {
      console.error("Error updating group:", err)
      alert(`Failed to update group: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitDeleteGroup = async () => {
    if (!selectedGroup) return

    setIsSubmitting(true)

    try {
      const supabase = createSupabaseClient()

      const { error } = await supabase.from("groups").delete().eq("id", selectedGroup.id)

      if (error) throw error

      setGroups((prev) => prev.filter((group) => group.id !== selectedGroup.id))
      setIsDeleteDialogOpen(false)
      setSelectedGroup(null)
    } catch (err: any) {
      console.error("Error deleting group:", err)
      alert(`Failed to delete group: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCapacityBadge = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) {
      return (
        <Badge className="bg-red-100 text-red-800">
          Full ({current}/{max})
        </Badge>
      )
    } else if (percentage >= 70) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          Almost Full ({current}/{max})
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-green-100 text-green-800">
          Available ({current}/{max})
        </Badge>
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading groups...</p>
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
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Group Management</h1>
        <Button onClick={handleAddGroup}>
          <Plus className="mr-2 h-4 w-4" />
          Add Group
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search and Filter Groups</CardTitle>
          <CardDescription>Search by name or specialization and filter by level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
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
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="All specializations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec.id} value={spec.name}>
                    {spec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Groups List</CardTitle>
          <CardDescription>
            Showing {filteredGroups.length} of {groups.length} groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {group.name}
                      </div>
                    </TableCell>
                    <TableCell>{group.level_name}</TableCell>
                    <TableCell>{group.specialization_name}</TableCell>
                    <TableCell>{group.academic_year_name}</TableCell>
                    <TableCell>
                      {group.current_students}/{group.max_students} students
                    </TableCell>
                    <TableCell>{getCapacityBadge(group.current_students || 0, group.max_students)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditGroup(group)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteGroup(group)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No groups found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Group Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Group</DialogTitle>
            <DialogDescription>Create a new student group</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level_id">Level</Label>
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
                <Label htmlFor="specialization_id">Specialization</Label>
                <Select
                  value={formData.specialization_id}
                  onValueChange={(value) => handleSelectChange("specialization_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations
                      .filter((spec) => !formData.level_id || spec.level_id === Number.parseInt(formData.level_id))
                      .map((spec) => (
                        <SelectItem key={spec.id} value={spec.id.toString()}>
                          {spec.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academic_year_id">Academic Year</Label>
                <Select
                  value={formData.academic_year_id}
                  onValueChange={(value) => handleSelectChange("academic_year_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id.toString()}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_students">Maximum Students</Label>
                <Input
                  id="max_students"
                  name="max_students"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.max_students}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitAddGroup} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>Update group information</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Group Name</Label>
              <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-level_id">Level</Label>
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
                <Label htmlFor="edit-specialization_id">Specialization</Label>
                <Select
                  value={formData.specialization_id}
                  onValueChange={(value) => handleSelectChange("specialization_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations
                      .filter((spec) => !formData.level_id || spec.level_id === Number.parseInt(formData.level_id))
                      .map((spec) => (
                        <SelectItem key={spec.id} value={spec.id.toString()}>
                          {spec.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-academic_year_id">Academic Year</Label>
                <Select
                  value={formData.academic_year_id}
                  onValueChange={(value) => handleSelectChange("academic_year_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id.toString()}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-max_students">Maximum Students</Label>
                <Input
                  id="edit-max_students"
                  name="max_students"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.max_students}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitEditGroup} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this group? This action cannot be undone and will affect all students in
              this group.
            </DialogDescription>
          </DialogHeader>

          {selectedGroup && (
            <div className="py-4">
              <p className="font-medium">{selectedGroup.name}</p>
              <p className="text-sm text-muted-foreground">Level: {selectedGroup.level_name}</p>
              <p className="text-sm text-muted-foreground">Specialization: {selectedGroup.specialization_name}</p>
              <p className="text-sm text-muted-foreground">
                Current Students: {selectedGroup.current_students}/{selectedGroup.max_students}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitDeleteGroup} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
