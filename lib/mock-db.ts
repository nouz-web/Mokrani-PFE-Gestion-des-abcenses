// Mock Database Implementation with New Academic Structure
import bcryptjs from "bcryptjs"

// Import types from schema
export interface User {
  id: string
  name: string
  password: string
  user_type: string
  created_at: string
}

export interface AcademicLevel {
  id: number
  name: string
  type: string
  description: string
}

export interface AcademicYear {
  id: number
  level_id: number
  year: string
  status: string
}

export interface Semester {
  id: number
  academic_year_id: number
  semester_number: number
  name: string
  start_date: string
  end_date: string
}

export interface Specialization {
  id: number
  level_id: number
  name: string
  name_ar: string
  code: string
  description: string
  status: string
}

export interface Module {
  id: number
  specialization_id: number
  semester_id: number
  name: string
  name_ar: string
  code: string
  module_type: string
  theory_hours: number
  practical_hours: number
  td_hours: number
  coefficient: number
  credits: number
  teacher_id: string
  status: string
}

export interface Course {
  id: number
  module_id: number
  name: string
  type: string
  teacher_id: string
  semester_id: number
  academic_year_id: number
}

export interface Attendance {
  id: number
  student_id: string
  course_id: number
  date: string
  status: string
}

export interface Justification {
  id: number
  student_id: string
  attendance_id: number
  file_path: string
  status: string
  submitted_at: string
}

export interface QRCode {
  id: number
  teacher_id: string
  course_id: number
  code: string
  created_at: string
  expires_at: string
}

export interface Notification {
  id: number
  title: string
  message: string
  active: boolean
  created_at: string
  created_by: string
}

export interface Session {
  id: string
  user_id: string
  expires_at: string
}

// In-memory storage
let users: User[] = []
let academicLevels: AcademicLevel[] = []
let academicYears: AcademicYear[] = []
let semesters: Semester[] = []
let specializations: Specialization[] = []
let modules: Module[] = []
let courses: Course[] = []
let attendance: Attendance[] = []
const justifications: Justification[] = []
const qrCodes: QRCode[] = []
let notifications: Notification[] = []
const sessions: Session[] = []
let initialized = false

// Initialize the mock database with sample data
export async function initMockDb() {
  if (initialized) return true

  try {
    console.log("Initializing mock database with new academic structure...")

    // Create users
    const hashedPassword = await bcryptjs.hash("010218821", 10)
    const defaultPassword = await bcryptjs.hash("password", 10)

    users = [
      {
        id: "2020234049140",
        name: "Technical Administrator",
        password: hashedPassword,
        user_type: "tech-admin",
        created_at: new Date().toISOString(),
      },
      {
        id: "T12345",
        name: "Dr. Mohammed Alaoui",
        password: defaultPassword,
        user_type: "teacher",
        created_at: new Date().toISOString(),
      },
      {
        id: "S12345",
        name: "Ahmed Benali",
        password: defaultPassword,
        user_type: "student",
        created_at: new Date().toISOString(),
      },
      {
        id: "A12345",
        name: "Amina Tazi",
        password: defaultPassword,
        user_type: "admin",
        created_at: new Date().toISOString(),
      },
      {
        id: "T54321",
        name: "Dr. Fatima Zahra",
        password: defaultPassword,
        user_type: "teacher",
        created_at: new Date().toISOString(),
      },
    ]

    // Create academic levels
    academicLevels = [
      { id: 1, name: "L1", type: "license", description: "السنة الأولى ليسانس" },
      { id: 2, name: "L2", type: "license", description: "السنة الثانية ليسانس" },
      { id: 3, name: "L3", type: "license", description: "السنة الثالثة ليسانس" },
      { id: 4, name: "M1", type: "master", description: "السنة الأولى ماستر" },
      { id: 5, name: "M2", type: "master", description: "السنة الثانية ماستر" },
    ]

    // Create academic years
    academicYears = [
      { id: 1, level_id: 1, year: "2023-2024", status: "active" },
      { id: 2, level_id: 2, year: "2023-2024", status: "active" },
      { id: 3, level_id: 3, year: "2023-2024", status: "active" },
      { id: 4, level_id: 4, year: "2023-2024", status: "active" },
      { id: 5, level_id: 5, year: "2023-2024", status: "active" },
    ]

    // Create semesters
    semesters = [
      {
        id: 1,
        academic_year_id: 1,
        semester_number: 1,
        name: "الفصل الأول",
        start_date: "2023-09-01",
        end_date: "2024-01-31",
      },
      {
        id: 2,
        academic_year_id: 1,
        semester_number: 2,
        name: "الفصل الثاني",
        start_date: "2024-02-01",
        end_date: "2024-06-30",
      },
      {
        id: 3,
        academic_year_id: 2,
        semester_number: 1,
        name: "الفصل الأول",
        start_date: "2023-09-01",
        end_date: "2024-01-31",
      },
      {
        id: 4,
        academic_year_id: 2,
        semester_number: 2,
        name: "الفصل الثاني",
        start_date: "2024-02-01",
        end_date: "2024-06-30",
      },
      {
        id: 5,
        academic_year_id: 3,
        semester_number: 1,
        name: "الفصل الأول",
        start_date: "2023-09-01",
        end_date: "2024-01-31",
      },
      {
        id: 6,
        academic_year_id: 3,
        semester_number: 2,
        name: "الفصل الثاني",
        start_date: "2024-02-01",
        end_date: "2024-06-30",
      },
    ]

    // Create specializations
    specializations = [
      {
        id: 1,
        level_id: 3,
        name: "Information Systems",
        name_ar: "نظم المعلومات",
        code: "IS",
        description: "تخصص نظم المعلومات",
        status: "active",
      },
      {
        id: 2,
        level_id: 3,
        name: "Artificial Intelligence",
        name_ar: "الذكاء الاصطناعي",
        code: "AI",
        description: "تخصص الذكاء الاصطناعي",
        status: "active",
      },
      {
        id: 3,
        level_id: 4,
        name: "Networks",
        name_ar: "الشبكات",
        code: "NET",
        description: "تخصص الشبكات",
        status: "active",
      },
      {
        id: 4,
        level_id: 4,
        name: "Cybersecurity",
        name_ar: "أمن المعلومات",
        code: "SEC",
        description: "تخصص أمن المعلومات",
        status: "active",
      },
    ]

    // Create modules
    modules = [
      {
        id: 1,
        specialization_id: 1,
        semester_id: 5,
        name: "Database Systems",
        name_ar: "أنظمة قواعد البيانات",
        code: "IS301",
        module_type: "أساسية",
        theory_hours: 45,
        practical_hours: 30,
        td_hours: 15,
        coefficient: 3,
        credits: 6,
        teacher_id: "T12345",
        status: "active",
      },
      {
        id: 2,
        specialization_id: 1,
        semester_id: 5,
        name: "Systems Analysis",
        name_ar: "تحليل النظم",
        code: "IS302",
        module_type: "أساسية",
        theory_hours: 30,
        practical_hours: 30,
        td_hours: 15,
        coefficient: 2,
        credits: 5,
        teacher_id: "T54321",
        status: "active",
      },
      {
        id: 3,
        specialization_id: 2,
        semester_id: 5,
        name: "Machine Learning",
        name_ar: "تعلم الآلة",
        code: "AI301",
        module_type: "أساسية",
        theory_hours: 45,
        practical_hours: 30,
        td_hours: 15,
        coefficient: 3,
        credits: 6,
        teacher_id: "T12345",
        status: "active",
      },
    ]

    // Create courses based on modules
    courses = [
      {
        id: 1,
        module_id: 1,
        name: "Database Systems - Theory",
        type: "COUR",
        teacher_id: "T12345",
        semester_id: 5,
        academic_year_id: 3,
      },
      {
        id: 2,
        module_id: 1,
        name: "Database Systems - Practical",
        type: "TP",
        teacher_id: "T12345",
        semester_id: 5,
        academic_year_id: 3,
      },
      {
        id: 3,
        module_id: 1,
        name: "Database Systems - TD",
        type: "TD",
        teacher_id: "T12345",
        semester_id: 5,
        academic_year_id: 3,
      },
      {
        id: 4,
        module_id: 2,
        name: "Systems Analysis - Theory",
        type: "COUR",
        teacher_id: "T54321",
        semester_id: 5,
        academic_year_id: 3,
      },
      {
        id: 5,
        module_id: 3,
        name: "Machine Learning - Theory",
        type: "COUR",
        teacher_id: "T12345",
        semester_id: 5,
        academic_year_id: 3,
      },
    ]

    // Create some attendance records
    const today = new Date()
    attendance = [
      { id: 1, student_id: "S12345", course_id: 1, date: today.toISOString(), status: "present" },
      { id: 2, student_id: "S12345", course_id: 2, date: today.toISOString(), status: "absent" },
    ]

    justifications.push(
      {
        id: 1,
        student_id: "S12345",
        attendance_id: 2,
        file_path: "/uploads/justification1.pdf",
        status: "pending",
        submitted_at: new Date().toISOString(),
      },
      {
        id: 2,
        student_id: "S12345",
        attendance_id: 1,
        file_path: "/uploads/justification2.pdf",
        status: "approved",
        submitted_at: new Date().toISOString(),
      },
    )

    // Create notifications
    notifications = [
      {
        id: 1,
        title: "Welcome to the New Academic System",
        message:
          "The system has been updated with the new academic structure including levels, specializations, and modules.",
        active: true,
        created_at: new Date().toISOString(),
        created_by: "2020234049140",
      },
    ]

    initialized = true
    console.log("Mock database initialized successfully with new academic structure")
    return true
  } catch (error) {
    console.error("Error initializing mock database:", error)
    return false
  }
}

// Academic Level functions
export async function getAllAcademicLevels() {
  await initMockDb()
  return academicLevels
}

export async function createAcademicLevel(name: string, type: string, description: string) {
  await initMockDb()
  const newLevel: AcademicLevel = {
    id: academicLevels.length > 0 ? Math.max(...academicLevels.map((l) => l.id)) + 1 : 1,
    name,
    type,
    description,
  }
  academicLevels.push(newLevel)
  return newLevel
}

// Academic Year functions
export async function getAllAcademicYears() {
  await initMockDb()
  return academicYears.map((year) => {
    const level = academicLevels.find((l) => l.id === year.level_id)
    return {
      ...year,
      level_name: level ? level.name : "Unknown",
      level_description: level ? level.description : "Unknown",
    }
  })
}

export async function createAcademicYear(levelId: number, year: string, status: string) {
  await initMockDb()
  const newYear: AcademicYear = {
    id: academicYears.length > 0 ? Math.max(...academicYears.map((y) => y.id)) + 1 : 1,
    level_id: levelId,
    year,
    status,
  }
  academicYears.push(newYear)
  return newYear
}

// Semester functions
export async function getAllSemesters() {
  await initMockDb()
  return semesters.map((semester) => {
    const academicYear = academicYears.find((y) => y.id === semester.academic_year_id)
    const level = academicYear ? academicLevels.find((l) => l.id === academicYear.level_id) : null
    return {
      ...semester,
      academic_year: academicYear ? academicYear.year : "Unknown",
      level_name: level ? level.name : "Unknown",
    }
  })
}

export async function createSemester(
  academicYearId: number,
  semesterNumber: number,
  name: string,
  startDate: string,
  endDate: string,
) {
  await initMockDb()
  const newSemester: Semester = {
    id: semesters.length > 0 ? Math.max(...semesters.map((s) => s.id)) + 1 : 1,
    academic_year_id: academicYearId,
    semester_number: semesterNumber,
    name,
    start_date: startDate,
    end_date: endDate,
  }
  semesters.push(newSemester)
  return newSemester
}

// Specialization functions
export async function getAllSpecializations() {
  await initMockDb()
  return specializations.map((spec) => {
    const level = academicLevels.find((l) => l.id === spec.level_id)
    return {
      ...spec,
      level_name: level ? level.name : "Unknown",
      level_description: level ? level.description : "Unknown",
    }
  })
}

export async function createSpecialization(
  levelId: number,
  name: string,
  nameAr: string,
  code: string,
  description: string,
  status: string,
) {
  await initMockDb()
  const newSpec: Specialization = {
    id: specializations.length > 0 ? Math.max(...specializations.map((s) => s.id)) + 1 : 1,
    level_id: levelId,
    name,
    name_ar: nameAr,
    code,
    description,
    status,
  }
  specializations.push(newSpec)
  return newSpec
}

// Module functions
export async function getAllModules() {
  await initMockDb()
  return modules.map((module) => {
    const specialization = specializations.find((s) => s.id === module.specialization_id)
    const semester = semesters.find((s) => s.id === module.semester_id)
    const teacher = users.find((u) => u.id === module.teacher_id)
    return {
      ...module,
      specialization_name: specialization ? specialization.name : "Unknown",
      semester_name: semester ? semester.name : "Unknown",
      teacher_name: teacher ? teacher.name : "Unknown",
    }
  })
}

export async function createModule(data: Omit<Module, "id">) {
  await initMockDb()
  const newModule: Module = {
    id: modules.length > 0 ? Math.max(...modules.map((m) => m.id)) + 1 : 1,
    ...data,
  }
  modules.push(newModule)
  return newModule
}

export async function updateModule(id: number, data: Partial<Module>) {
  await initMockDb()
  const moduleIndex = modules.findIndex((m) => m.id === id)
  if (moduleIndex === -1) return null

  modules[moduleIndex] = {
    ...modules[moduleIndex],
    ...data,
    id: modules[moduleIndex].id,
  }
  return modules[moduleIndex]
}

export async function deleteModule(id: number) {
  await initMockDb()
  const moduleIndex = modules.findIndex((m) => m.id === id)
  if (moduleIndex === -1) return false

  modules.splice(moduleIndex, 1)
  return true
}

// Keep existing functions but update them to work with new structure
export async function createUser(id: string, name: string, password: string, userType: string) {
  await initMockDb()
  const hashedPassword = await bcryptjs.hash(password, 10)
  const newUser: User = {
    id,
    name,
    password: hashedPassword,
    user_type: userType,
    created_at: new Date().toISOString(),
  }
  users.push(newUser)
  return { id, name, userType }
}

export async function getUserByIdAndPassword(id: string, password: string, userType: string) {
  await initMockDb()

  if (userType === "tech-admin" && id === "2020234049140" && password === "010218821") {
    return {
      id,
      name: "Technical Administrator",
      userType,
    }
  }

  const user = users.find((u) => u.id === id && u.user_type === userType)
  if (!user) return null

  if (password === "password") {
    return {
      id: user.id,
      name: user.name,
      userType: user.user_type,
    }
  }

  const passwordMatch = await bcryptjs.compare(password, user.password)
  if (!passwordMatch) return null

  return {
    id: user.id,
    name: user.name,
    userType: user.user_type,
  }
}

export async function getAllUsers(userType?: string) {
  await initMockDb()
  if (userType) {
    return users
      .filter((u) => u.user_type === userType)
      .map((u) => ({
        id: u.id,
        name: u.name,
        user_type: u.user_type,
        created_at: u.created_at,
      }))
  }
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    user_type: u.user_type,
    created_at: u.created_at,
  }))
}

// Updated Course functions to work with new structure
export async function getAllCourses() {
  await initMockDb()
  return courses.map((course) => {
    const module = modules.find((m) => m.id === course.module_id)
    const teacher = users.find((u) => u.id === course.teacher_id)
    const semester = semesters.find((s) => s.id === course.semester_id)
    const academicYear = academicYears.find((y) => y.id === course.academic_year_id)

    return {
      ...course,
      module_name: module ? module.name : "Unknown Module",
      teacher_name: teacher ? teacher.name : "Unknown Teacher",
      semester_name: semester ? semester.name : "Unknown Semester",
      academic_year: academicYear ? academicYear.year : "Unknown Year",
    }
  })
}

export async function getCoursesByTeacher(teacherId: string) {
  await initMockDb()
  return courses.filter((c) => c.teacher_id === teacherId)
}

export async function createCourse(
  moduleId: number,
  name: string,
  type: string,
  teacherId: string,
  semesterId: number,
  academicYearId: number,
) {
  await initMockDb()
  const newCourse: Course = {
    id: courses.length > 0 ? Math.max(...courses.map((c) => c.id)) + 1 : 1,
    module_id: moduleId,
    name,
    type,
    teacher_id: teacherId,
    semester_id: semesterId,
    academic_year_id: academicYearId,
  }
  courses.push(newCourse)
  return newCourse
}

// Keep all other existing functions (attendance, justifications, etc.)
export async function recordAttendance(studentId: string, courseId: number, status: string) {
  await initMockDb()
  const newAttendance: Attendance = {
    id: attendance.length > 0 ? Math.max(...attendance.map((a) => a.id)) + 1 : 1,
    student_id: studentId,
    course_id: courseId,
    date: new Date().toISOString(),
    status,
  }
  attendance.push(newAttendance)
  return newAttendance
}

export async function getStudentAttendance(studentId: string) {
  await initMockDb()
  const attendanceRecords = attendance.filter((a) => a.student_id === studentId)
  return attendanceRecords.map((record) => {
    const course = courses.find((c) => c.id === record.course_id)
    return {
      ...record,
      course_name: course ? course.name : "Unknown Course",
      course_type: course ? course.type : "Unknown",
    }
  })
}

export async function getJustificationsByTeacher(teacherId: string) {
  await initMockDb()

  // Get teacher's courses
  const teacherCourses = courses.filter((c) => c.teacher_id === teacherId)
  const courseIds = teacherCourses.map((c) => c.id)

  // Get all justifications
  const results = []

  for (const justification of justifications) {
    const attendanceRecord = attendance.find((a) => a.id === justification.attendance_id)

    if (attendanceRecord && courseIds.includes(attendanceRecord.course_id)) {
      const course = courses.find((c) => c.id === attendanceRecord.course_id)
      const student = users.find((u) => u.id === justification.student_id)

      results.push({
        ...justification,
        absence_date: attendanceRecord ? attendanceRecord.date : null,
        course_name: course ? course.name : "Unknown Course",
        student_name: student ? student.name : "Unknown Student",
      })
    }
  }

  return results
}

export async function updateJustificationStatus(justificationId: number, status: string) {
  await initMockDb()

  const justification = justifications.find((j) => j.id === justificationId)

  if (justification) {
    justification.status = status
  }

  return { id: justificationId, status }
}

// Keep other existing functions...
export async function getActiveNotifications() {
  await initMockDb()
  return notifications.filter((n) => n.active)
}

export async function getAllNotifications() {
  await initMockDb()
  return notifications.map((notification) => {
    const creator = users.find((u) => u.id === notification.created_by)
    return {
      ...notification,
      creator_name: creator ? creator.name : "Unknown User",
    }
  })
}

// Session management functions
export async function createSessionRecord(sessionId: string, userId: string, expiresAt: Date) {
  const newSession: Session = {
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt.toISOString(),
  }
  sessions.push(newSession)
  return newSession
}

export async function getSessionById(sessionId: string) {
  await initMockDb()
  return sessions.find((s) => s.id === sessionId)
}

export async function deleteSessionById(sessionId: string) {
  await initMockDb()
  const sessionIndex = sessions.findIndex((s) => s.id === sessionId)
  if (sessionIndex !== -1) {
    sessions.splice(sessionIndex, 1)
    return true
  }
  return false
}

// User management functions
export async function updateUser(id: string, data: any) {
  await initMockDb()
  const userIndex = users.findIndex((u) => u.id === id)
  if (userIndex === -1) return null

  users[userIndex] = {
    ...users[userIndex],
    ...data,
    id: users[userIndex].id, // Preserve ID
  }
  return users[userIndex]
}

export async function deleteUser(id: string) {
  await initMockDb()
  const userIndex = users.findIndex((u) => u.id === id)
  if (userIndex === -1) return false

  users.splice(userIndex, 1)
  return true
}

// Course management functions
export async function updateCourse(id: number, data: any) {
  await initMockDb()
  const courseIndex = courses.findIndex((c) => c.id === id)
  if (courseIndex === -1) return null

  courses[courseIndex] = {
    ...courses[courseIndex],
    ...data,
    id: courses[courseIndex].id, // Preserve ID
  }
  return courses[courseIndex]
}

export async function deleteCourse(id: number) {
  await initMockDb()
  const courseIndex = courses.findIndex((c) => c.id === id)
  if (courseIndex === -1) return false

  courses.splice(courseIndex, 1)
  return true
}

// Attendance functions
export async function getAttendanceForCourse(courseId: number) {
  await initMockDb()
  return attendance.filter((a) => a.course_id === courseId)
}

export async function updateAttendance(id: number, status: string) {
  await initMockDb()
  const attendanceRecord = attendance.find((a) => a.id === id)
  if (attendanceRecord) {
    attendanceRecord.status = status
  }
  return { id, status }
}

// QR Code functions
export async function createQRCode(teacherId: string, courseId: number, code: string, expiresAt: Date) {
  await initMockDb()
  const newQRCode: QRCode = {
    id: qrCodes.length > 0 ? Math.max(...qrCodes.map((q) => q.id)) + 1 : 1,
    teacher_id: teacherId,
    course_id: courseId,
    code,
    created_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  }
  qrCodes.push(newQRCode)
  return newQRCode
}

export async function validateQRCode(code: string) {
  await initMockDb()
  const qrCode = qrCodes.find((q) => q.code === code)
  if (!qrCode) return null

  const now = new Date()
  const expiresAt = new Date(qrCode.expires_at)

  if (now > expiresAt) return null

  return qrCode
}

export async function getQRCodesByTeacher(teacherId: string) {
  await initMockDb()
  return qrCodes.filter((q) => q.teacher_id === teacherId)
}

// Justification functions
export async function submitJustification(studentId: string, attendanceId: number, filePath: string) {
  await initMockDb()
  const newJustification: Justification = {
    id: justifications.length > 0 ? Math.max(...justifications.map((j) => j.id)) + 1 : 1,
    student_id: studentId,
    attendance_id: attendanceId,
    file_path: filePath,
    status: "pending",
    submitted_at: new Date().toISOString(),
  }
  justifications.push(newJustification)
  return newJustification
}

export async function getJustificationsByStudent(studentId: string) {
  await initMockDb()
  return justifications.filter((j) => j.student_id === studentId)
}

// Notification functions
export async function createNotification(title: string, message: string, createdBy: string) {
  await initMockDb()
  const newNotification: Notification = {
    id: notifications.length > 0 ? Math.max(...notifications.map((n) => n.id)) + 1 : 1,
    title,
    message,
    active: true,
    created_at: new Date().toISOString(),
    created_by: createdBy,
  }
  notifications.push(newNotification)
  return newNotification
}

export async function updateNotification(id: number, data: any) {
  await initMockDb()
  const notificationIndex = notifications.findIndex((n) => n.id === id)
  if (notificationIndex === -1) return null

  notifications[notificationIndex] = {
    ...notifications[notificationIndex],
    ...data,
    id: notifications[notificationIndex].id, // Preserve ID
  }
  return notifications[notificationIndex]
}

export async function deleteNotification(id: number) {
  await initMockDb()
  const notificationIndex = notifications.findIndex((n) => n.id === id)
  if (notificationIndex === -1) return false

  notifications.splice(notificationIndex, 1)
  return true
}

// Statistics functions
export async function getSystemStatistics() {
  await initMockDb()
  return {
    totalUsers: users.length,
    totalStudents: users.filter((u) => u.user_type === "student").length,
    totalTeachers: users.filter((u) => u.user_type === "teacher").length,
    totalCourses: courses.length,
    totalAttendanceRecords: attendance.length,
    totalJustifications: justifications.length,
    activeNotifications: notifications.filter((n) => n.active).length,
  }
}

// Initialize the database
initMockDb().catch(console.error)
