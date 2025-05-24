export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      academic_years: {
        Row: {
          id: number
          name: string
          start_date: string
          end_date: string
          is_current: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          start_date: string
          end_date: string
          is_current?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          start_date?: string
          end_date?: string
          is_current?: boolean
          created_at?: string
        }
      }
      attendance: {
        Row: {
          id: number
          student_id: string
          module_id: number
          course_id: number
          date: string
          status: string
          created_at: string
          timetable_id?: number
        }
        Insert: {
          id?: number
          student_id: string
          module_id: number
          course_id: number
          date: string
          status: string
          created_at?: string
          timetable_id?: number
        }
        Update: {
          id?: number
          student_id?: string
          module_id?: number
          course_id?: number
          date?: string
          status?: string
          created_at?: string
          timetable_id?: number
        }
      }
      courses: {
        Row: {
          id: number
          name: string
          type: string
          teacher_id: string
          semester: number
          year: string
          created_at: string
          module_id: number
        }
        Insert: {
          id?: number
          name: string
          type: string
          teacher_id: string
          semester: number
          year: string
          created_at?: string
          module_id: number
        }
        Update: {
          id?: number
          name?: string
          type?: string
          teacher_id?: string
          semester?: number
          year?: string
          created_at?: string
          module_id?: number
        }
      }
      justifications: {
        Row: {
          id: number
          student_id: string
          attendance_id: number
          file_path: string
          status: string
          submitted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          comments: string | null
          module_id: number
        }
        Insert: {
          id?: number
          student_id: string
          attendance_id: number
          file_path: string
          status: string
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          comments?: string | null
          module_id: number
        }
        Update: {
          id?: number
          student_id?: string
          attendance_id?: number
          file_path?: string
          status?: string
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          comments?: string | null
          module_id?: number
        }
      }
      levels: {
        Row: {
          id: number
          name: string
          code: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          code: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          code?: string
          description?: string | null
          created_at?: string
        }
      }
      modules: {
        Row: {
          id: number
          name: string
          name_ar: string | null
          code: string
          type: string
          lecture_hours: number
          practical_hours: number
          td_hours: number
          coefficient: number
          credits: number
          teacher_id: string | null
          specialization_id: number
          semester_id: number
          created_at: string
          description: string | null
        }
        Insert: {
          id?: number
          name: string
          name_ar?: string | null
          code: string
          type: string
          lecture_hours: number
          practical_hours: number
          td_hours: number
          coefficient: number
          credits: number
          teacher_id?: string | null
          specialization_id: number
          semester_id: number
          created_at?: string
          description?: string | null
        }
        Update: {
          id?: number
          name?: string
          name_ar?: string | null
          code?: string
          type?: string
          lecture_hours?: number
          practical_hours?: number
          td_hours?: number
          coefficient?: number
          credits?: number
          teacher_id?: string | null
          specialization_id?: number
          semester_id?: number
          created_at?: string
          description?: string | null
        }
      }
      notifications: {
        Row: {
          id: number
          title: string
          message: string
          active: boolean
          created_at: string
          created_by: string
          target_user_type: string | null
          target_level_id: number | null
          target_specialization_id: number | null
        }
        Insert: {
          id?: number
          title: string
          message: string
          active?: boolean
          created_at?: string
          created_by: string
          target_user_type?: string | null
          target_level_id?: number | null
          target_specialization_id?: number | null
        }
        Update: {
          id?: number
          title?: string
          message?: string
          active?: boolean
          created_at?: string
          created_by?: string
          target_user_type?: string | null
          target_level_id?: number | null
          target_specialization_id?: number | null
        }
      }
      qr_codes: {
        Row: {
          id: number
          teacher_id: string
          course_id: number
          code: string
          created_at: string
          expires_at: string
          is_active: boolean
          timetable_id: number | null
        }
        Insert: {
          id?: number
          teacher_id: string
          course_id: number
          code: string
          created_at?: string
          expires_at: string
          is_active?: boolean
          timetable_id?: number | null
        }
        Update: {
          id?: number
          teacher_id?: string
          course_id?: number
          code?: string
          created_at?: string
          expires_at?: string
          is_active?: boolean
          timetable_id?: number | null
        }
      }
      semesters: {
        Row: {
          id: number
          name: string
          academic_year_id: number
          start_date: string
          end_date: string
          is_current: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          academic_year_id: number
          start_date: string
          end_date: string
          is_current?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          academic_year_id?: number
          start_date?: string
          end_date?: string
          is_current?: boolean
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          expires_at?: string
          created_at?: string
        }
      }
      specializations: {
        Row: {
          id: number
          name: string
          name_ar: string | null
          code: string
          level_id: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          name_ar?: string | null
          code: string
          level_id: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          name_ar?: string | null
          code?: string
          level_id?: number
          description?: string | null
          created_at?: string
        }
      }
      timetable: {
        Row: {
          id: number
          module_id: number
          day_of_week: number
          start_time: string
          end_time: string
          room: string
          teacher_id: string
          group_id: number | null
          session_type: string
          created_at: string
        }
        Insert: {
          id?: number
          module_id: number
          day_of_week: number
          start_time: string
          end_time: string
          room: string
          teacher_id: string
          group_id?: number | null
          session_type: string
          created_at?: string
        }
        Update: {
          id?: number
          module_id?: number
          day_of_week?: number
          start_time?: string
          end_time?: string
          room?: string
          teacher_id?: string
          group_id?: number | null
          session_type?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          password: string
          user_type: string
          created_at: string
          email: string | null
          level_id: number | null
          specialization_id: number | null
          group_id: number | null
        }
        Insert: {
          id: string
          name: string
          password: string
          user_type: string
          created_at?: string
          email?: string | null
          level_id?: number | null
          specialization_id?: number | null
          group_id?: number | null
        }
        Update: {
          id?: string
          name?: string
          password?: string
          user_type?: string
          created_at?: string
          email?: string | null
          level_id?: number | null
          specialization_id?: number | null
          group_id?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
