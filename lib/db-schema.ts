import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core"

// Define types for our database entities
export interface User {
  id: string
  name: string
  password: string
  user_type: string
  created_at: string
}

// New Academic Structure
export interface AcademicLevel {
  id: number
  name: string // L1, L2, L3, M1, M2
  type: string // license, master
  description: string
}

export interface AcademicYear {
  id: number
  level_id: number
  year: string // 2023-2024
  status: string // active, archived
}

export interface Semester {
  id: number
  academic_year_id: number
  semester_number: number // 1 or 2
  name: string // الفصل الأول، الفصل الثاني
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
  status: string // active, inactive
}

export interface Module {
  id: number
  specialization_id: number
  semester_id: number
  name: string
  name_ar: string
  code: string
  module_type: string // أساسية، منهجية، استكشافية، أفقية
  theory_hours: number
  practical_hours: number
  td_hours: number // أعمال موجهة
  coefficient: number
  credits: number
  teacher_id: string
  status: string // active, inactive
}

export interface Course {
  id: number
  module_id: number
  name: string
  type: string // COUR, TD, TP
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

// Database Tables
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  user_type: text("user_type").notNull(),
  created_at: text("created_at").notNull(),
})

export const academic_levels = sqliteTable("academic_levels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), // L1, L2, L3, M1, M2
  type: text("type").notNull(), // license, master
  description: text("description").notNull(),
})

export const academic_years = sqliteTable("academic_years", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  level_id: integer("level_id").notNull(),
  year: text("year").notNull(), // 2023-2024
  status: text("status").notNull(), // active, archived
})

export const semesters = sqliteTable("semesters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  academic_year_id: integer("academic_year_id").notNull(),
  semester_number: integer("semester_number").notNull(), // 1 or 2
  name: text("name").notNull(), // الفصل الأول، الفصل الثاني
  start_date: text("start_date").notNull(),
  end_date: text("end_date").notNull(),
})

export const specializations = sqliteTable("specializations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  level_id: integer("level_id").notNull(),
  name: text("name").notNull(),
  name_ar: text("name_ar").notNull(),
  code: text("code").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // active, inactive
})

export const modules = sqliteTable("modules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  specialization_id: integer("specialization_id").notNull(),
  semester_id: integer("semester_id").notNull(),
  name: text("name").notNull(),
  name_ar: text("name_ar").notNull(),
  code: text("code").notNull(),
  module_type: text("module_type").notNull(), // أساسية، منهجية، استكشافية، أفقية
  theory_hours: integer("theory_hours").notNull(),
  practical_hours: integer("practical_hours").notNull(),
  td_hours: integer("td_hours").notNull(), // أعمال موجهة
  coefficient: real("coefficient").notNull(),
  credits: integer("credits").notNull(),
  teacher_id: text("teacher_id").notNull(),
  status: text("status").notNull(), // active, inactive
})

export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  module_id: integer("module_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // COUR, TD, TP
  teacher_id: text("teacher_id").notNull(),
  semester_id: integer("semester_id").notNull(),
  academic_year_id: integer("academic_year_id").notNull(),
})

export const attendance = sqliteTable("attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  student_id: text("student_id").notNull(),
  course_id: integer("course_id").notNull(),
  date: text("date").notNull(),
  status: text("status").notNull(),
})

export const justifications = sqliteTable("justifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  student_id: text("student_id").notNull(),
  attendance_id: integer("attendance_id").notNull(),
  file_path: text("file_path").notNull(),
  status: text("status").notNull(),
  submitted_at: text("submitted_at").notNull(),
})

export const qr_codes = sqliteTable("qr_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teacher_id: text("teacher_id").notNull(),
  course_id: integer("course_id").notNull(),
  code: text("code").notNull(),
  created_at: text("created_at").notNull(),
  expires_at: text("expires_at").notNull(),
})

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  active: integer("active", { mode: "boolean" }).notNull(),
  created_at: text("created_at").notNull(),
  created_by: text("created_by").notNull(),
})

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  expires_at: text("expires_at").notNull(),
})
