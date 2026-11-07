import type {
  User,
  Course,
  Evaluation,
  Submission,
  AttendanceSession,
  AppNotification,
  AcademicDiscipline,
  AcademicDocument,
  AppReview,
} from '../types';

export const INITIAL_DISCIPLINES: AcademicDiscipline[] = [
  { id: 'disc-1', name: 'Desarrollo Web & Programación', description: 'Algoritmos, Frontend, Backend y Arquitectura de Software', color: '#6366f1' },
  { id: 'disc-2', name: 'Matemáticas & Lógica', description: 'Álgebra, Cálculo, Probabilidad y Razonamiento Analítico', color: '#eab308' },
  { id: 'disc-3', name: 'Historia & Ciencias Sociales', description: 'Historia Universal, Geografía y Pensamiento Crítico', color: '#f97316' },
  { id: 'disc-4', name: 'Idiomas & Lingüística (Inglés)', description: 'Gramática, Vocabulario y Comprensión Lectora', color: '#06b6d4' },
  { id: 'disc-5', name: 'Ciencias Naturales & Física', description: 'Física, Química, Biología y Método Científico', color: '#10b981' },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-baddev',
    name: 'Administrador Principal',
    email: 'baddevprograming@gmail.com',
    role: 'admin',
    status: 'active',
    institution: 'Sintax Academy',
    section: 'Dirección General',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BadDevAdmin&backgroundColor=f59e0b',
    courseIds: [],
    createdAt: new Date().toISOString().split('T')[0],
  },
];

export const INITIAL_COURSES: Course[] = [];

export const INITIAL_EVALUATIONS: Evaluation[] = [];

export const INITIAL_SUBMISSIONS: Submission[] = [];

export const INITIAL_ATTENDANCE: AttendanceSession[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome',
    userId: 'user-admin-baddev',
    title: '¡Bienvenido a Sintax LMS!',
    message: 'Sistema configurado con éxito en Supabase. Registra docentes, crea materias y configura evaluaciones a tu medida.',
    type: 'system',
    read: false,
    createdAt: 'Ahora',
  },
];

export const INITIAL_DOCUMENTS: AcademicDocument[] = [];

export const INITIAL_REVIEWS: AppReview[] = [];
