export type UserRole = 'student' | 'teacher' | 'admin';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  institution?: string; // Institución educativa o academia
  section?: string;     // Sección, cohorte o aula
  courseIds?: string[];
  createdAt?: string;
}

export type CourseStatus = 'active' | 'inactive';

export interface Course {
  id: string;
  code?: string; // Opcional
  name: string;
  discipline: string; // Matemáticas, Historia, Idiomas, Programación, etc.
  description: string;
  teacherId: string;
  teacherName: string;
  studentIds: string[];
  status: CourseStatus;
  color: string;
  iconName?: string;
}

export type EvaluationType = 'exam' | 'exercise' | 'survey';
export type SkillTag = 'syntax' | 'logic' | 'best_practices' | 'dom' | 'architecture' | 'conceptual' | 'problem_solving' | 'reading_comprehension';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  evaluationId: string;
  text: string;
  codeSnippet?: string;
  language?: string;
  type: 'single_choice' | 'multiple_choice';
  options: QuestionOption[];
  skillTag: SkillTag;
  points: number;
  explanation: string;
}

export interface Evaluation {
  id: string;
  courseId: string;
  courseName?: string;
  discipline?: string;
  title: string;
  description: string;
  type: EvaluationType;
  timeLimitMinutes: number;
  maxScore: number;
  status: 'draft' | 'published';
  dueDate?: string;
  questions: Question[];
  createdAt: string;
}

export type PerformanceTier = 'Inicial / Refuerzo' | 'En Desarrollo' | 'Avanzado' | 'Profesional';

export interface SkillScore {
  correct: number;
  total: number;
  percentage: number;
}

export interface Submission {
  id: string;
  evaluationId: string;
  evaluationTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  score100: number; // 1 a 100%
  score20?: number;
  percentage: number;
  performanceTier: PerformanceTier;
  skillBreakdown: Partial<Record<SkillTag, SkillScore>>;
  selectedOptions: Record<string, string>;
  recommendations: string[];
  submittedAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceSession {
  id: string;
  courseId: string;
  date: string;
  records: Record<string, AttendanceStatus>;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'evaluation' | 'grade' | 'attendance' | 'system' | 'document' | 'review';
  read: boolean;
  createdAt: string;
  linkTab?: string;
}

export interface AcademicDiscipline {
  id: string;
  name: string;
  description: string;
  color: string;
}

export type DocumentCategory = 'guide' | 'theory' | 'book' | 'grades_sheet' | 'practice';

export interface AcademicDocument {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  courseId: string;
  courseName: string;
  targetSection: string; // 'all' o nombre de sección ej 'Sección A'
  fileName: string;
  fileSize: string;
  fileDataUrl?: string;
  downloadUrl?: string;
  uploadedById: string;
  uploadedByName: string;
  createdAt: string;
}

export interface AppReview {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userEmail: string;
  rating: number; // 1 a 5
  category: 'general' | 'platform' | 'teaching' | 'evaluations';
  goodPoints: string;    // Lo bueno
  improvements: string;  // Lo que se puede mejorar
  comment?: string;
  isPublic: boolean;     // Permitir mostrar en landing promocional
  createdAt: string;
}
