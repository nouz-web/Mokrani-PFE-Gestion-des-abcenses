-- Enable Row Level Security on all tables
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE justifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create a function to get the current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT user_type FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Create policies for levels table
CREATE POLICY "Allow read access to levels for all authenticated users"
  ON levels FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all access to levels for admins and tech_admins"
  ON levels FOR ALL
  USING (get_user_role() IN ('admin', 'tech_admin'));

-- Create policies for academic_years table
CREATE POLICY "Allow read access to academic_years for all authenticated users"
  ON academic_years FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all access to academic_years for admins and tech_admins"
  ON academic_years FOR ALL
  USING (get_user_role() IN ('admin', 'tech_admin'));

-- Create policies for semesters table
CREATE POLICY "Allow read access to semesters for all authenticated users"
  ON semesters FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all access to semesters for admins and tech_admins"
  ON semesters FOR ALL
  USING (get_user_role() IN ('admin', 'tech_admin'));

-- Create policies for specializations table
CREATE POLICY "Allow read access to specializations for all authenticated users"
  ON specializations FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all access to specializations for admins and tech_admins"
  ON specializations FOR ALL
  USING (get_user_role() IN ('admin', 'tech_admin'));

-- Create policies for modules table
CREATE POLICY "Allow read access to modules for all authenticated users"
  ON modules FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all access to modules for admins and tech_admins"
  ON modules FOR ALL
  USING (get_user_role() IN ('admin', 'tech_admin'));

CREATE POLICY "Allow teachers to update their modules"
  ON modules FOR UPDATE
  USING (get_user_role() = 'teacher' AND teacher_id = auth.uid());

-- Create policies for users table
CREATE POLICY "Allow users to read their own data"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Allow admins and tech_admins to read all users"
  ON users FOR SELECT
  USING (get_user_role() IN ('admin', 'tech_admin'));

CREATE POLICY "Allow admins and tech_admins to manage users"
  ON users FOR ALL
  USING (get_user_role() IN ('admin', 'tech_admin'));

-- Create policies for courses table
CREATE POLICY "Allow read access to courses for all authenticated users"
  ON courses FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow teachers to update their courses"
  ON courses FOR UPDATE
  USING (get_user_role() = 'teacher' AND teacher_id = auth.uid());

CREATE POLICY "Allow all access to courses for admins and tech_admins"
  ON courses FOR ALL
  USING (get_user_role() IN ('admin', 'tech_admin'));

-- Create policies for timetable table
CREATE POLICY "Allow read access to timetable for all authenticated users"
  ON timetable FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow teachers to update their timetable entries"
  ON timetable FOR UPDATE
  USING (get_user_role() = 'teacher' AND teacher_id = auth.uid());

CREATE POLICY "Allow all access to timetable for admins and tech_admins"
  ON timetable FOR ALL
  USING (get_user_role() IN ('admin', 'tech_admin'));

-- Create policies for attendance table
CREATE POLICY "Allow students to read their own attendance"
  ON attendance FOR SELECT
  USING (get_user_role() = 'student' AND student_id = auth.uid());

CREATE POLICY "Allow teachers to read and update attendance for their courses"
  ON attendance FOR SELECT
  USING (get_user_role() = 'teacher' AND EXISTS (
    SELECT 1 FROM courses WHERE id = attendance.course_id AND teacher_id = auth.uid()
  ));

CREATE POLICY "Allow teachers to insert attendance for their courses"
  ON attendance FOR INSERT
  WITH CHECK (get_user_role() = 'teacher' AND EXISTS (
    SELECT 1 FROM courses WHERE id = attendance.course_id AND teacher_id = auth.uid()
  ));

CREATE POLICY "Allow teachers to update attendance for their courses"
  ON attendance FOR UPDATE
  USING (get_user_role() = 'teacher' AND EXISTS (
    SELECT 1 FROM courses WHERE id = attendance.course_id AND teacher_id = auth.uid()
  ));

CREATE POLICY "Allow all access to attendance for admins and tech_admins"
  ON attendance FOR ALL
  USING (get_user_role() IN ('admin', 'tech_admin'));

-- Create policies for justifications table
CREATE POLICY "Allow students to read and insert their own justifications"
  ON justifications FOR SELECT
  USING (get_user_role() = 'student' AND student_id = auth.uid());

CREATE POLICY "Allow students to insert their own justifications"
  ON justifications FOR INSERT
  WITH CHECK (get_user_role() = 'student' AND student_id = auth.uid());

CREATE POLICY "Allow teachers to read and update justifications for their courses"
  ON justifications FOR SELECT
  USING (get_user_role() = 'teacher' AND EXISTS (
    SELECT 1 FROM attendance a
    JOIN courses c ON a.course_id = c.id
    WHERE a.id = justifications.attendance_id AND c.teacher_id = auth.uid()
  ));

CREATE POLICY "Allow teachers to update justifications for their courses"
  ON justifications FOR UPDATE
  USING (get_user_role() = 'teacher' AND EXISTS (
    SELECT 1 FROM attendance a
    JOIN courses c ON a.course_id = c.id
    WHERE a.id = justifications.attendance_id AND c.teacher_id = auth.uid()
  ));

CREATE POLICY "Allow all access to justifications for admins and tech_admins"
  ON justifications FOR ALL
  USING (get_user_role() IN ('admin', 'tech_admin'));

-- Create policies for qr_codes table
CREATE POLICY "Allow teachers to manage their own QR codes"
  ON qr_codes FOR ALL
  USING (get_user_role() = 'teacher' AND teacher_id = auth.uid());

CREATE POLICY "Allow students to read QR codes"
  ON qr_codes FOR SELECT
  USING (get_user_role() = 'student' AND is_active = true);

CREATE POLICY "Allow all access to qr_codes for admins and tech_admins"
  ON qr_codes FOR ALL
  USING (get_user_role() IN ('admin', 'tech_admin'));

-- Create policies for notifications table
CREATE POLICY "Allow read access to notifications for all authenticated users"
  ON notifications FOR SELECT
  USING (auth.role() = 'authenticated' AND (
    target_user_type IS NULL OR 
    target_user_type = get_user_role() OR
    (target_level_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND level_id = target_level_id
    )) OR
    (target_specialization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND specialization_id = target_specialization_id
    ))
  ));

CREATE POLICY "Allow all access to notifications for admins and tech_admins"
  ON notifications FOR ALL
  USING (get_user_role() IN ('admin', 'tech_admin'));

-- Create policies for sessions table
CREATE POLICY "Allow users to read their own sessions"
  ON sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Allow users to delete their own sessions"
  ON sessions FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Allow all access to sessions for admins and tech_admins"
  ON sessions FOR ALL
  USING (get_user_role() IN ('admin', 'tech_admin'));
