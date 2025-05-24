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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Plus, Search, Trash, User, GraduationCap, Users, UserCheck } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

interface UserType {
  id: string
  name: string
  email?: string
  phone?: string
  user_type: string
  level_id?: number
  specialization_id?: number
  group_id?: number
  academic_year_id?: number
  department?: string
  status: string
  created_at: string
  level_name?: string
  specialization_name?: string
  group_name?: string
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

interface Group {
  id: number
  name: string
  specialization_id: number
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

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("students")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedSpecialization, setSelectedSpecialization] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [users, setUsers] = useState<UserType[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [specializations, setSpecializations] = useState<Specialization[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    user_type: "student",
    level_id: "",
    specialization_id: "",
    group_id: "",
    academic_year_id: "",
    department: "",
    password: "password123",
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
        const [levelsRes, specializationsRes, groupsRes, academicYearsRes, usersRes] = await Promise.all([
          supabase.from("levels").select("*"),
          supabase.from("specializations").select("*"),
          supabase.from("groups").select("*"),
          supabase.from("academic_years").select("*"),
          supabase.from("users").select("*"),
        ])

        if (levelsRes.error) throw levelsRes.error
        if (specializationsRes.error) throw specializationsRes.error
        if (groupsRes.error) throw groupsRes.error
        if (academicYearsRes.error) throw academicYearsRes.error
        if (usersRes.error) throw usersRes.error

        // Enrich users with related data
        const enrichedUsers = usersRes.data.map((user: any) => {
          const level = levelsRes.data.find((l: any) => l.id === user.level_id)
          const specialization = specializationsRes.data.find((s: any) => s.id === user.specialization_id)
          const group = groupsRes.data.find((g: any) => g.id === user.group_id)

          return {
            ...user,
            level_name: level?.name || "",
            specialization_name: specialization?.name || "",
            group_name: group?.name || "",
            status: user.status || "active",
          }
        })

        setLevels(levelsRes.data)
        setSpecializations(specializationsRes.data)
        setGroups(groupsRes.data)
        setAcademicYears(academicYearsRes.data)
        setUsers(enrichedUsers)
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesTab = user.user_type === activeTab.slice(0, -1) // Remove 's' from tab name
    const matchesSearch =
      !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesLevel = selectedLevel === "all" || user.level_name === selectedLevel
    const matchesSpecialization =
      selectedSpecialization === "all" || user.specialization_name === selectedSpecialization

    return matchesTab && matchesSearch && matchesLevel && matchesSpecialization
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddUser = () => {
    setFormData({
      id: "",
      name: "",
      email: "",
      phone: "",
      user_type: activeTab.slice(0, -1), // Remove 's' from tab name
      level_id: "",
      specialization_id: "",
      group_id: "",
      academic_year_id: "",
      department: "",
      password: "password123",
    })
    setIsAddDialogOpen(true)
  }

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user)
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      user_type: user.user_type,
      level_id: user.level_id?.toString() || "",
      specialization_id: user.specialization_id?.toString() || "",
      group_id: user.group_id?.toString() || "",
      academic_year_id: user.academic_year_id?.toString() || "",
      department: user.department || "",
      password: "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteUser = (user: UserType) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const submitAddUser = async () => {
    if (!formData.id || !formData.name) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createSupabaseClient()

      const newUser = {
        id: formData.id,
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        user_type: formData.user_type,
        level_id: formData.level_id ? Number.parseInt(formData.level_id) : null,
        specialization_id: formData.specialization_id ? Number.parseInt(formData.specialization_id) : null,
        group_id: formData.group_id ? Number.parseInt(formData.group_id) : null,
        academic_year_id: formData.academic_year_id ? Number.parseInt(formData.academic_year_id) : null,
        department: formData.department || null,
        password: await hashPassword(formData.password),
        status: "active",
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("users").insert(newUser).select()

      if (error) throw error

      if (data && data.length > 0) {
        const level = levels.find((l) => l.id === Number.parseInt(formData.level_id))
        const specialization = specializations.find((s) => s.id === Number.parseInt(formData.specialization_id))
        const group = groups.find((g) => g.id === Number.parseInt(formData.group_id))

        const createdUser = {
          ...data[0],
          level_name: level?.name || "",
          specialization_name: specialization?.name || "",
          group_name: group?.name || "",
        }

        setUsers((prev) => [...prev, createdUser])
      }

      setIsAddDialogOpen(false)
    } catch (err: any) {
      console.error("Error adding user:", err)
      alert(`Failed to add user: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitEditUser = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)

    try {
      const supabase = createSupabaseClient()

      const updatedUser: any = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        user_type: formData.user_type,
        level_id: formData.level_id ? Number.parseInt(formData.level_id) : null,
        specialization_id: formData.specialization_id ? Number.parseInt(formData.specialization_id) : null,
        group_id: formData.group_id ? Number.parseInt(formData.group_id) : null,
        academic_year_id: formData.academic_year_id ? Number.parseInt(formData.academic_year_id) : null,
        department: formData.department || null,
      }

      if (formData.password) {
        updatedUser.password = await hashPassword(formData.password)
      }

      const { error } = await supabase.from("users").update(updatedUser).eq("id", selectedUser.id)

      if (error) throw error

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                ...updatedUser,
                level_name: levels.find((l) => l.id === Number.parseInt(formData.level_id))?.name || "",
                specialization_name:
                  specializations.find((s) => s.id === Number.parseInt(formData.specialization_id))?.name || "",
                group_name: groups.find((g) => g.id === Number.parseInt(formData.group_id))?.name || "",
              }
            : user,
        ),
      )

      setIsEditDialogOpen(false)
      setSelectedUser(null)
    } catch (err: any) {
      console.error("Error updating user:", err)
      alert(`Failed to update user: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitDeleteUser = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)

    try {
      const supabase = createSupabaseClient()

      const { error } = await supabase.from("users").delete().eq("id", selectedUser.id)

      if (error) throw error

      setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id))
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch (err: any) {
      console.error("Error deleting user:", err)
      alert(`Failed to delete user: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Simple password hashing (in production, use proper hashing)
  const hashPassword = async (password: string) => {
    // This is a simple implementation - in production use bcrypt or similar
    return btoa(password)
  }

  const getUserTypeBadge = (userType: string) => {
    const colors = {
      student: "bg-blue-100 text-blue-800",
      teacher: "bg-green-100 text-green-800",
      admin: "bg-purple-100 text-purple-800",
      "tech-admin": "bg-red-100 text-red-800",
    }
    return <Badge className={colors[userType as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{userType}</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "students":
        return <GraduationCap className="h-4 w-4" />
      case "teachers":
        return <User className="h-4 w-4" />
      case "admins":
        return <UserCheck className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getTabCount = (tab: string) => {
    return users.filter((user) => user.user_type === tab.slice(0, -1)).length
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading users...</p>
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
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={handleAddUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add {activeTab.slice(0, -1)}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students" className="flex items-center gap-2">
            {getTabIcon("students")}
            Students ({getTabCount("students")})
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center gap-2">
            {getTabIcon("teachers")}
            Teachers ({getTabCount("teachers")})
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            {getTabIcon("admins")}
            Admins ({getTabCount("admins")})
          </TabsTrigger>
          <TabsTrigger value="tech-admins" className="flex items-center gap-2">
            {getTabIcon("tech-admins")}
            Tech Admins ({getTabCount("tech-admins")})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search and Filter</CardTitle>
              <CardDescription>Search by name, ID, or email and filter by level/specialization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {(activeTab === "students" || activeTab === "teachers") && (
                  <>
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
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} List</CardTitle>
              <CardDescription>
                Showing {filteredUsers.length} of {getTabCount(activeTab)} {activeTab}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    {(activeTab === "students" || activeTab === "teachers") && (
                      <>
                        <TableHead>Level</TableHead>
                        <TableHead>Specialization</TableHead>
                      </>
                    )}
                    {activeTab === "students" && <TableHead>Group</TableHead>}
                    {(activeTab === "teachers" || activeTab === "admins") && <TableHead>Department</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email || "-"}</TableCell>
                        {(activeTab === "students" || activeTab === "teachers") && (
                          <>
                            <TableCell>{user.level_name || "-"}</TableCell>
                            <TableCell>{user.specialization_name || "-"}</TableCell>
                          </>
                        )}
                        {activeTab === "students" && <TableCell>{user.group_name || "-"}</TableCell>}
                        {(activeTab === "teachers" || activeTab === "admins") && (
                          <TableCell>{user.department || "-"}</TableCell>
                        )}
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                        No {activeTab} found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New {formData.user_type}</DialogTitle>
            <DialogDescription>Create a new {formData.user_type} account</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id">User ID</Label>
                <Input id="id" name="id" value={formData.id} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
              </div>
            </div>

            {(formData.user_type === "student" || formData.user_type === "teacher") && (
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
            )}

            {formData.user_type === "student" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="group_id">Group</Label>
                  <Select value={formData.group_id} onValueChange={(value) => handleSelectChange("group_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups
                        .filter(
                          (group) =>
                            !formData.specialization_id ||
                            group.specialization_id === Number.parseInt(formData.specialization_id),
                        )
                        .map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
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
              </div>
            )}

            {(formData.user_type === "teacher" || formData.user_type === "admin") && (
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" value={formData.department} onChange={handleInputChange} />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitAddUser} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-id">User ID</Label>
                <Input id="edit-id" name="id" value={formData.id} onChange={handleInputChange} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" name="phone" value={formData.phone} onChange={handleInputChange} />
              </div>
            </div>

            {(formData.user_type === "student" || formData.user_type === "teacher") && (
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
            )}

            {formData.user_type === "student" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-group_id">Group</Label>
                  <Select value={formData.group_id} onValueChange={(value) => handleSelectChange("group_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups
                        .filter(
                          (group) =>
                            !formData.specialization_id ||
                            group.specialization_id === Number.parseInt(formData.specialization_id),
                        )
                        .map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
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
              </div>
            )}

            {(formData.user_type === "teacher" || formData.user_type === "admin") && (
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (leave empty to keep current)</Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitEditUser} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="py-4">
              <p className="font-medium">{selectedUser.name}</p>
              <p className="text-sm text-muted-foreground">ID: {selectedUser.id}</p>
              <p className="text-sm text-muted-foreground">Type: {selectedUser.user_type}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitDeleteUser} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
