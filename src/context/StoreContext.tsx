import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  User,
  UserRole,
  UserStatus,
  Course,
  CourseStatus,
  Evaluation,
  Submission,
  AttendanceSession,
  AttendanceStatus,
  AppNotification,
  AcademicDiscipline,
  AcademicDocument,
  AppReview,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_EVALUATIONS,
  INITIAL_SUBMISSIONS,
  INITIAL_ATTENDANCE,
  INITIAL_NOTIFICATIONS,
  INITIAL_DISCIPLINES,
  INITIAL_DOCUMENTS,
  INITIAL_REVIEWS,
} from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface StoreContextType {
  currentUser: User;
  users: User[];
  courses: Course[];
  disciplines: AcademicDiscipline[];
  evaluations: Evaluation[];
  submissions: Submission[];
  attendances: AttendanceSession[];
  notifications: AppNotification[];
  documents: AcademicDocument[];
  reviews: AppReview[];
  switchUser: (userId: string) => void;
  createEvaluation: (evaluation: Omit<Evaluation, 'id' | 'createdAt'>) => void;
  deleteEvaluation: (evalId: string) => void;
  recordSubmission: (submission: Omit<Submission, 'id' | 'submittedAt'>) => void;
  saveAttendance: (courseId: string, date: string, records: Record<string, AttendanceStatus>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addCourse: (course: Omit<Course, 'id' | 'studentIds' | 'status'>) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  updateCourseStatus: (courseId: string, status: CourseStatus) => void;
  addStudent: (name: string, email: string, courseId: string, section?: string, institution?: string) => void;
  deleteStudent: (studentId: string) => void;
  updateUserStatus: (userId: string, status: UserStatus) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  updateUserProfile: (userId: string, updates: Partial<User>) => void;
  addDiscipline: (name: string, description: string, color?: string) => void;
  addDocument: (doc: Omit<AcademicDocument, 'id' | 'createdAt'>) => void;
  deleteDocument: (docId: string) => void;
  addReview: (review: Omit<AppReview, 'id' | 'createdAt' | 'isPublic'>) => void;
  toggleReviewPublic: (reviewId: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, updateCurrentUser } = useAuth();

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sintax_users');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        // Filtrar datos mock legacy si existen
        const clean = parsed.filter(
          (u) =>
            u.id !== 'user-teacher-1' &&
            u.email !== 'profesor@sintax.edu' &&
            u.id !== 'user-admin' &&
            u.email !== 'admin@sintax.edu'
        );
        // Garantizar que baddevprograming@gmail.com siempre esté
        if (!clean.some((u) => u.email.toLowerCase() === 'baddevprograming@gmail.com')) {
          clean.unshift(INITIAL_USERS[0]);
        }
        return clean;
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return authUser?.id || INITIAL_USERS[0]?.id || 'user-admin-baddev';
  });

  // Mantener currentUserId sincronizado con authUser
  useEffect(() => {
    if (authUser?.id) {
      setCurrentUserId(authUser.id);
    }
  }, [authUser]);

  const [disciplines, setDisciplines] = useState<AcademicDiscipline[]>(() => {
    const saved = localStorage.getItem('sintax_disciplines');
    return saved ? JSON.parse(saved) : INITIAL_DISCIPLINES;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('sintax_courses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : INITIAL_COURSES;
      } catch {
        return INITIAL_COURSES;
      }
    }
    return INITIAL_COURSES;
  });

  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => {
    const saved = localStorage.getItem('sintax_evaluations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : INITIAL_EVALUATIONS;
      } catch {
        return INITIAL_EVALUATIONS;
      }
    }
    return INITIAL_EVALUATIONS;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('sintax_submissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Limpiar entregas mock legacy
        return Array.isArray(parsed)
          ? parsed.filter((s: Submission) => s.studentId !== 'user-student-1')
          : INITIAL_SUBMISSIONS;
      } catch {
        return INITIAL_SUBMISSIONS;
      }
    }
    return INITIAL_SUBMISSIONS;
  });

  const [attendances, setAttendances] = useState<AttendanceSession[]>(() => {
    const saved = localStorage.getItem('sintax_attendances');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : INITIAL_ATTENDANCE;
      } catch {
        return INITIAL_ATTENDANCE;
      }
    }
    return INITIAL_ATTENDANCE;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('sintax_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [documents, setDocuments] = useState<AcademicDocument[]>(() => {
    const saved = localStorage.getItem('sintax_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [reviews, setReviews] = useState<AppReview[]>(() => {
    const saved = localStorage.getItem('sintax_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Persistencia en LocalStorage
  useEffect(() => {
    localStorage.setItem('sintax_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('sintax_current_user_id', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('sintax_disciplines', JSON.stringify(disciplines));
  }, [disciplines]);

  useEffect(() => {
    localStorage.setItem('sintax_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('sintax_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('sintax_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('sintax_attendances', JSON.stringify(attendances));
  }, [attendances]);

  useEffect(() => {
    localStorage.setItem('sintax_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('sintax_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('sintax_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Cargar datos de Supabase si existen tablas y conexión
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Sincronizar perfiles desde Supabase
    supabase.from('profiles').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        setUsers((prev) => {
          const remoteUsers: User[] = data.map((p: any) => ({
            id: p.id,
            name: p.full_name || p.name || p.email.split('@')[0],
            email: p.email,
            role: p.role,
            status: p.status || 'active',
            institution: p.institution || 'Sintax Academy',
            section: p.section || 'General',
            avatar: p.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.email)}`,
            courseIds: [],
            createdAt: p.created_at ? p.created_at.split('T')[0] : '2026-11-06',
          }));

          // Mezclar sin duplicados por email
          const emailMap = new Map<string, User>();
          prev.forEach((u) => emailMap.set(u.email.toLowerCase(), u));
          remoteUsers.forEach((u) => emailMap.set(u.email.toLowerCase(), u));
          return Array.from(emailMap.values());
        });
      }
    });

    // Suscripción Realtime para nuevas entregas
    const channel = supabase
      .channel('sintax-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newSub = payload.new as any;
          setSubmissions((prev) => [
            {
              id: newSub.id,
              evaluationId: newSub.evaluation_id,
              evaluationTitle: 'Evaluación Sincronizada',
              studentId: newSub.student_id,
              studentName: 'Estudiante',
              studentEmail: newSub.student_email || 'estudiante@sintax.edu',
              courseId: 'course-1',
              score100: Number(newSub.score_100),
              percentage: Number(newSub.percentage),
              performanceTier: newSub.performance_tier || 'Profesional',
              skillBreakdown: newSub.skill_breakdown || {},
              selectedOptions: newSub.selected_options || {},
              recommendations: newSub.recommendations || [],
              submittedAt: newSub.submitted_at ? newSub.submitted_at.replace('T', ' ').substring(0, 19) : '',
            },
            ...prev,
          ]);
        }
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  // Determinar usuario activo
  const currentUser: User =
    (authUser && users.find((u) => u.id === authUser.id)) ||
    authUser ||
    users.find((u) => u.id === currentUserId) ||
    users[0] ||
    INITIAL_USERS[0];

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  const addDiscipline = (name: string, description: string, color: string = '#6366f1') => {
    const newDisc: AcademicDiscipline = {
      id: `disc-${Date.now()}`,
      name,
      description,
      color,
    };
    setDisciplines((prev) => [...prev, newDisc]);
  };

  const addCourse = (courseData: Omit<Course, 'id' | 'studentIds' | 'status'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
      studentIds: [],
      status: 'active',
    };
    setCourses((prev) => [newCourse, ...prev]);

    // Persistir en Supabase si está disponible
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('courses')
        .insert({
          name: newCourse.name,
          code: newCourse.code || null,
          discipline: newCourse.discipline,
          description: newCourse.description || null,
          color: newCourse.color,
          status: 'active',
        })
        .then();
    }
  };

  const updateCourseStatus = (courseId: string, status: CourseStatus) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status } : c))
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from('courses').update({ status }).eq('id', courseId).then();
    }
  };

  const updateCourse = (courseId: string, updates: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...updates } : c))
    );
    if (isSupabaseConfigured && supabase) {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.code !== undefined) dbUpdates.code = updates.code;
      if (updates.discipline !== undefined) dbUpdates.discipline = updates.discipline;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      supabase.from('courses').update(dbUpdates).eq('id', courseId).then();
    }
  };

  const deleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    // Eliminar referencias en evaluaciones y documentos asociados
    setEvaluations((prev) => prev.filter((e) => e.courseId !== courseId));
    setDocuments((prev) => prev.filter((d) => d.courseId !== courseId));
    if (isSupabaseConfigured && supabase) {
      supabase.from('courses').delete().eq('id', courseId).then();
    }
  };

  const addStudent = (
    name: string,
    email: string,
    courseId: string,
    section: string = 'General',
    institution: string = 'Sintax Academy'
  ) => {
    const cleanEmail = email.toLowerCase().trim();
    const existing = users.find((u) => u.email.toLowerCase().trim() === cleanEmail);
    if (existing) {
      if (courseId) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === courseId
              ? { ...c, studentIds: [...new Set([...c.studentIds, existing.id])] }
              : c
          )
        );
      }
      return;
    }

    const newStudentId = `user-student-${Date.now()}`;
    const cleanSeed = encodeURIComponent(name);
    const newStudent: User = {
      id: newStudentId,
      name,
      email: cleanEmail,
      role: 'student',
      status: 'active',
      institution,
      section,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanSeed}&backgroundColor=6366f1,10b981,f59e0b`,
      courseIds: courseId ? [courseId] : [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [...prev, newStudent]);

    if (courseId) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? { ...c, studentIds: [...new Set([...c.studentIds, newStudentId])] }
            : c
        )
      );
    }

    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').insert({
        email: newStudent.email,
        full_name: newStudent.name,
        role: 'student',
        status: 'active',
        institution: newStudent.institution,
        section: newStudent.section,
        avatar_url: newStudent.avatar,
      }).then();
    }
  };

  const deleteStudent = (studentId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== studentId));
    setCourses((prev) =>
      prev.map((c) => ({
        ...c,
        studentIds: c.studentIds.filter((id) => id !== studentId),
      }))
    );
  };

  const updateUserStatus = (userId: string, status: UserStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );
    if (authUser && authUser.id === userId) {
      updateCurrentUser({ status });
    }
    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').update({ status }).eq('id', userId).then();
    }
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
    if (authUser && authUser.id === userId) {
      updateCurrentUser({ role });
    }
    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').update({ role }).eq('id', userId).then();
    }
  };

  const updateUserProfile = (userId: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
    if (authUser && authUser.id === userId) {
      updateCurrentUser(updates);
    }
  };

  const createEvaluation = (evalData: Omit<Evaluation, 'id' | 'createdAt'>) => {
    const newEval: Evaluation = {
      ...evalData,
      id: `eval-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setEvaluations((prev) => [newEval, ...prev]);

    // Enviar notificaciones a estudiantes inscritos
    const targetCourse = courses.find((c) => c.id === newEval.courseId);
    if (targetCourse) {
      const newNotifs: AppNotification[] = targetCourse.studentIds.map((sId) => ({
        id: `notif-${Date.now()}-${sId}`,
        userId: sId,
        title: `Nueva evaluación: ${newEval.title}`,
        message: `Se ha publicado un nuevo reto en ${targetCourse.name}. ¡Demuestra tus habilidades!`,
        type: 'evaluation',
        read: false,
        createdAt: 'Justo ahora',
        linkTab: 'evaluations',
      }));
      setNotifications((prev) => [...newNotifs, ...prev]);
    }
  };

  const deleteEvaluation = (evalId: string) => {
    setEvaluations((prev) => prev.filter((e) => e.id !== evalId));
  };

  const recordSubmission = (subData: Omit<Submission, 'id' | 'submittedAt'>) => {
    const newSub: Submission = {
      ...subData,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setSubmissions((prev) => [newSub, ...prev]);

    // Notificar al docente
    const targetCourse = courses.find((c) => c.id === newSub.courseId);
    if (targetCourse) {
      const teacherNotif: AppNotification = {
        id: `notif-${Date.now()}-${targetCourse.teacherId}`,
        userId: targetCourse.teacherId,
        title: `Nueva entrega de ${newSub.studentName}`,
        message: `Completó "${newSub.evaluationTitle}" con nota del ${newSub.score100}%.`,
        type: 'grade',
        read: false,
        createdAt: 'Justo ahora',
        linkTab: 'matrix-grades',
      };
      setNotifications((prev) => [teacherNotif, ...prev]);
    }
  };

  const saveAttendance = (
    courseId: string,
    date: string,
    records: Record<string, AttendanceStatus>
  ) => {
    const existingIndex = attendances.findIndex(
      (a) => a.courseId === courseId && a.date === date
    );
    if (existingIndex >= 0) {
      const updated = [...attendances];
      updated[existingIndex] = {
        ...updated[existingIndex],
        records,
      };
      setAttendances(updated);
    } else {
      const newSession: AttendanceSession = {
        id: `att-${Date.now()}`,
        courseId,
        date,
        records,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
      setAttendances((prev) => [newSession, ...prev]);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addDocument = (docData: Omit<AcademicDocument, 'id' | 'createdAt'>) => {
    const newDoc: AcademicDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setDocuments((prev) => [newDoc, ...prev]);

    // Notificar a estudiantes
    const targetCourse = courses.find((c) => c.id === newDoc.courseId);
    if (targetCourse) {
      const newNotifs: AppNotification[] = targetCourse.studentIds.map((sId) => ({
        id: `notif-${Date.now()}-${sId}`,
        userId: sId,
        title: `Nuevo documento: ${newDoc.title}`,
        message: `El docente cargó un nuevo material (${newDoc.category}) en ${targetCourse.name}.`,
        type: 'document',
        read: false,
        createdAt: 'Justo ahora',
        linkTab: 'documents',
      }));
      setNotifications((prev) => [...newNotifs, ...prev]);
    }
  };

  const deleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const addReview = (reviewData: Omit<AppReview, 'id' | 'createdAt' | 'isPublic'>) => {
    const newReview: AppReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      isPublic: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setReviews((prev) => [newReview, ...prev]);
  };

  const toggleReviewPublic = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, isPublic: !r.isPublic } : r))
    );
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        users,
        courses,
        disciplines,
        evaluations,
        submissions,
        attendances,
        notifications,
        documents,
        reviews,
        switchUser,
        createEvaluation,
        deleteEvaluation,
        recordSubmission,
        saveAttendance,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addCourse,
        updateCourse,
        deleteCourse,
        updateCourseStatus,
        addStudent,
        deleteStudent,
        updateUserStatus,
        updateUserRole,
        updateUserProfile,
        addDiscipline,
        addDocument,
        deleteDocument,
        addReview,
        toggleReviewPublic,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore debe usarse dentro de un StoreProvider');
  }
  return context;
};
