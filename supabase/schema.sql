-- ====================================================================
-- PROYECTO: SINTAX LMS
-- LEMA: "Aprender Creando, Crear Aprendiendo"
-- ESQUEMA COMPLETO CON INTEGRIDAD REFERENCIAL Y SEGURIDAD RLS HABILITADA
-- ====================================================================

-- 0. Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. TABLA: perfiles de usuarios (Profiles)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  status TEXT NOT NULL DEFAULT 'active',
  institution TEXT DEFAULT 'Sintax Academy',
  section TEXT DEFAULT 'General',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT chk_profile_role CHECK (role IN ('student', 'teacher', 'admin')),
  CONSTRAINT chk_profile_status CHECK (status IN ('active', 'inactive'))
);

-- Migración segura si la tabla ya existía previamente sin estas columnas:
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution TEXT DEFAULT 'Sintax Academy';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'General';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir acceso total a profiles" ON public.profiles;
CREATE POLICY "Permitir acceso total a profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 2. TABLA: cursos / materias (Courses)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT,
  name TEXT NOT NULL,
  discipline TEXT DEFAULT 'General',
  description TEXT,
  teacher_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT fk_courses_teacher FOREIGN KEY (teacher_id)
    REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT chk_course_status CHECK (status IN ('active', 'inactive'))
);

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS discipline TEXT DEFAULT 'General';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir acceso total a courses" ON public.courses;
CREATE POLICY "Permitir acceso total a courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 3. TABLA: inscripciones (Course Enrollments - Relación N:M)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  student_id UUID NOT NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id)
    REFERENCES public.courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT uq_course_student UNIQUE(course_id, student_id)
);

ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir acceso total a course_enrollments" ON public.course_enrollments;
CREATE POLICY "Permitir acceso total a course_enrollments" ON public.course_enrollments FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 4. TABLA: evaluaciones (Evaluations: Exámenes, Ejercicios, Encuestas)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'exam',
  time_limit_minutes INTEGER NOT NULL DEFAULT 20,
  max_score NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  status TEXT NOT NULL DEFAULT 'published',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT fk_evaluations_course FOREIGN KEY (course_id)
    REFERENCES public.courses(id) ON DELETE CASCADE,
  CONSTRAINT chk_eval_type CHECK (type IN ('exam', 'exercise', 'survey')),
  CONSTRAINT chk_eval_status CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT chk_eval_max_score CHECK (max_score > 0 AND max_score <= 100),
  CONSTRAINT chk_eval_time_limit CHECK (time_limit_minutes >= 0)
);

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir acceso total a evaluations" ON public.evaluations;
CREATE POLICY "Permitir acceso total a evaluations" ON public.evaluations FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 5. TABLA: preguntas (Questions)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL,
  text TEXT NOT NULL,
  code_snippet TEXT,
  language TEXT DEFAULT 'general',
  type TEXT NOT NULL DEFAULT 'single_choice',
  skill_tag TEXT NOT NULL,
  points NUMERIC(5,2) NOT NULL DEFAULT 25.00,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT fk_questions_evaluation FOREIGN KEY (evaluation_id)
    REFERENCES public.evaluations(id) ON DELETE CASCADE,
  CONSTRAINT chk_question_points CHECK (points >= 0)
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir acceso total a questions" ON public.questions;
CREATE POLICY "Permitir acceso total a questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 6. TABLA: opciones de respuesta (Question Options)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,

  CONSTRAINT fk_options_question FOREIGN KEY (question_id)
    REFERENCES public.questions(id) ON DELETE CASCADE
);

ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir acceso total a question_options" ON public.question_options;
CREATE POLICY "Permitir acceso total a question_options" ON public.question_options FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 7. TABLA: entregas y notas de estudiantes (Submissions)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL,
  student_id UUID NOT NULL,
  score_100 NUMERIC(5,2) NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  performance_tier TEXT NOT NULL,
  skill_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  selected_options JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT fk_submissions_evaluation FOREIGN KEY (evaluation_id)
    REFERENCES public.evaluations(id) ON DELETE CASCADE,
  CONSTRAINT fk_submissions_student FOREIGN KEY (student_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT chk_sub_score CHECK (score_100 >= 0 AND score_100 <= 100),
  CONSTRAINT chk_sub_percentage CHECK (percentage >= 0 AND percentage <= 100)
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir acceso total a submissions" ON public.submissions;
CREATE POLICY "Permitir acceso total a submissions" ON public.submissions FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 8. TABLA: sesiones de asistencia (Attendance Sessions)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  session_date DATE NOT NULL,
  records JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT fk_attendance_course FOREIGN KEY (course_id)
    REFERENCES public.courses(id) ON DELETE CASCADE,
  CONSTRAINT uq_attendance_course_date UNIQUE (course_id, session_date)
);

ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir acceso total a attendance_sessions" ON public.attendance_sessions;
CREATE POLICY "Permitir acceso total a attendance_sessions" ON public.attendance_sessions FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 9. TABLA: banco de documentos y guías académicas (Academic Documents)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.academic_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'guide',
  course_id UUID,
  target_section TEXT DEFAULT 'all',
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  file_size TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT fk_docs_course FOREIGN KEY (course_id)
    REFERENCES public.courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_docs_uploader FOREIGN KEY (uploaded_by)
    REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT chk_docs_category CHECK (category IN ('guide', 'book', 'theory', 'grades_report', 'exam_template'))
);

ALTER TABLE public.academic_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir acceso total a academic_documents" ON public.academic_documents;
CREATE POLICY "Permitir acceso total a academic_documents" ON public.academic_documents FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 10. TABLA: reseñas y valoraciones de la comunidad (App Reviews)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  good_points TEXT NOT NULL,
  improvement_points TEXT NOT NULL,
  comment TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT chk_reviews_rating CHECK (rating >= 1 AND rating <= 5)
);

ALTER TABLE public.app_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir acceso total a app_reviews" ON public.app_reviews;
CREATE POLICY "Permitir acceso total a app_reviews" ON public.app_reviews FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 11. TABLA: notificaciones (Notifications)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  read BOOLEAN NOT NULL DEFAULT false,
  link_tab TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT chk_notif_type CHECK (type IN ('evaluation', 'grade', 'attendance', 'system'))
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir acceso total a notifications" ON public.notifications;
CREATE POLICY "Permitir acceso total a notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- ÍNDICES DE ALTO RENDIMIENTO
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON public.courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_course ON public.evaluations(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_evaluation ON public.questions(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_options_question ON public.question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_submissions_evaluation ON public.submissions(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course ON public.attendance_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_docs_course ON public.academic_documents(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.app_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- ====================================================================
-- SEED / USUARIO ADMINISTRADOR PRINCIPAL
-- ====================================================================
INSERT INTO public.profiles (email, full_name, role, status, institution, section, avatar_url)
VALUES (
  'baddevprograming@gmail.com',
  'Administrador Principal',
  'admin',
  'active',
  'Sintax Academy',
  'Dirección General',
  'https://api.dicebear.com/7.x/bottts/svg?seed=BadDevAdmin&backgroundColor=f59e0b'
)
ON CONFLICT (email) DO UPDATE 
SET role = 'admin', status = 'active';

-- ====================================================================
-- TRIGGER AUTOMÁTICO: SINCRONIZAR AUTH.USERS CON PUBLIC.PROFILES
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status, institution, section, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email = 'baddevprograming@gmail.com' THEN 'admin'
      ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    END,
    'active',
    COALESCE(NEW.raw_user_meta_data->>'institution', 'Sintax Academy'),
    COALESCE(NEW.raw_user_meta_data->>'section', 'General'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || encode(NEW.email::bytea, 'hex'))
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = CASE WHEN EXCLUDED.email = 'baddevprograming@gmail.com' THEN 'admin' ELSE EXCLUDED.role END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
