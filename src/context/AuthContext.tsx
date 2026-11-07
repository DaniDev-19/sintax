import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Asegurar que el usuario admin principal esté configurado
const ADMIN_USER: User = {
  id: 'user-admin-baddev',
  name: 'Administrador Principal',
  email: 'baddevprograming@gmail.com',
  role: 'admin',
  status: 'active',
  institution: 'Sintax Academy',
  section: 'Dirección General',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BadDevAdmin&backgroundColor=f59e0b',
  courseIds: [],
  createdAt: '2026-11-06',
};

interface AuthContextType {
  user: User | null;
  jwtToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (
    name: string,
    email: string,
    role: UserRole,
    section?: string,
    institution?: string,
    password?: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateCurrentUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sintax_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email === 'profesor@sintax.edu' || parsed.id === 'user-teacher-1') {
          localStorage.removeItem('sintax_auth_user');
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [jwtToken, setJwtToken] = useState<string | null>(() => {
    return localStorage.getItem('sintax_jwt_token') || null;
  });

  // Sincronizar token y usuario en localStorage
  useEffect(() => {
    if (user && jwtToken) {
      localStorage.setItem('sintax_auth_user', JSON.stringify(user));
      localStorage.setItem('sintax_jwt_token', jwtToken);
    } else {
      localStorage.removeItem('sintax_auth_user');
      localStorage.removeItem('sintax_jwt_token');
    }
  }, [user, jwtToken]);

  // Verificar sesión existente en Supabase Auth al iniciar
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    client.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email) {
        setJwtToken(session.access_token);
        // Intentar recuperar el perfil desde la base de datos
        try {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('email', session.user.email)
            .maybeSingle();

          if (profile) {
            const mappedUser: User = {
              id: profile.id,
              name: profile.full_name || profile.name || session.user.email.split('@')[0],
              email: profile.email,
              role: profile.role || (session.user.email === ADMIN_USER.email ? 'admin' : 'student'),
              status: profile.status || 'active',
              institution: profile.institution || 'Sintax Academy',
              section: profile.section || 'General',
              avatar: profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(session.user.email)}`,
              courseIds: [],
              createdAt: profile.created_at ? profile.created_at.split('T')[0] : '2026-11-06',
            };
            setUser(mappedUser);
          }
        } catch {
          // Ignorar si aún no hay conexión o no existe
        }
      }
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.email) {
        setJwtToken(session.access_token);
      } else {
        // No forzar logout si hay sesión local activa
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, _password?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Manejo especial y prioritario del Administrador Principal
    if (cleanEmail === ADMIN_USER.email) {
      // Guardar en la lista de usuarios si no está
      const savedUsers: User[] = JSON.parse(
        localStorage.getItem('sintax_users') || JSON.stringify(INITIAL_USERS)
      );
      if (!savedUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
        savedUsers.unshift(ADMIN_USER);
        localStorage.setItem('sintax_users', JSON.stringify(savedUsers));
      }

      // Si Supabase está disponible, sincronizar el perfil admin en la tabla profiles
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('profiles').upsert(
            {
              email: cleanEmail,
              full_name: 'Administrador Principal',
              role: 'admin',
              status: 'active',
              institution: 'Sintax Academy',
              section: 'Dirección General',
              avatar_url: ADMIN_USER.avatar,
            },
            { onConflict: 'email' }
          );
        } catch {
          // Continuar con autenticación local
        }
      }

      const token = 'jwt_stx_' + btoa(ADMIN_USER.id + ':admin:' + Date.now());
      localStorage.setItem('sintax_jwt_token', token);
      localStorage.setItem('sintax_auth_user', JSON.stringify(ADMIN_USER));
      setJwtToken(token);
      setUser(ADMIN_USER);
      return { success: true };
    }

    // 2. Autenticar mediante tabla profiles de Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        // Consultar perfil en la tabla profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (profile) {
          if (profile.status === 'inactive') {
            return {
              success: false,
              message: 'Tu cuenta ha sido desactivada por el Administrador. Contacta a tu institución.',
            };
          }

          const matchedUser: User = {
            id: profile.id,
            name: profile.full_name || profile.name || cleanEmail.split('@')[0],
            email: profile.email,
            role: profile.role || 'student',
            status: profile.status || 'active',
            institution: profile.institution || 'Sintax Academy',
            section: profile.section || 'General',
            avatar: profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
            courseIds: [],
            createdAt: profile.created_at ? profile.created_at.split('T')[0] : '2026-11-06',
          };

          const token = 'jwt_stx_' + btoa(matchedUser.id + ':' + matchedUser.role + ':' + Date.now());
          localStorage.setItem('sintax_jwt_token', token);
          localStorage.setItem('sintax_auth_user', JSON.stringify(matchedUser));
          setJwtToken(token);
          setUser(matchedUser);

          // Sincronizar en localStorage sintax_users
          const savedUsers: User[] = JSON.parse(
            localStorage.getItem('sintax_users') || JSON.stringify(INITIAL_USERS)
          );
          if (!savedUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
            savedUsers.push(matchedUser);
            localStorage.setItem('sintax_users', JSON.stringify(savedUsers));
          }

          return { success: true };
        }
      } catch {
        // Continuar a fallback de localStorage
      }
    }

    // 3. Fallback a usuarios registrados (INITIAL_USERS + localStorage)
    const rawLocalUsers: User[] = JSON.parse(
      localStorage.getItem('sintax_users') || '[]'
    );
    const combinedUsers = [...INITIAL_USERS];
    for (const u of rawLocalUsers) {
      if (!combinedUsers.some((c) => c.email.toLowerCase() === u.email.toLowerCase())) {
        combinedUsers.push(u);
      }
    }

    const found = combinedUsers.find((u) => u.email.toLowerCase().trim() === cleanEmail);

    if (!found) {
      return { success: false, message: 'No existe una cuenta registrada con este correo electrónico.' };
    }

    if (found.status === 'inactive') {
      return { success: false, message: 'Tu cuenta ha sido desactivada por el Administrador. Contacta a tu institución.' };
    }

    const token = 'jwt_stx_' + btoa(found.id + ':' + found.role + ':' + Date.now());
    localStorage.setItem('sintax_jwt_token', token);
    localStorage.setItem('sintax_auth_user', JSON.stringify(found));
    setJwtToken(token);
    setUser(found);

    // Asegurar que sintax_users guarde este usuario en localStorage
    if (!rawLocalUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      rawLocalUsers.push(found);
      localStorage.setItem('sintax_users', JSON.stringify(rawLocalUsers));
    }

    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    role: UserRole,
    section: string = 'Sección General',
    institution: string = 'Sintax Academy',
    _password?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.toLowerCase().trim();

    // Forzar rol admin si es baddevprograming@gmail.com
    const effectiveRole: UserRole = cleanEmail === ADMIN_USER.email ? 'admin' : role;

    const rawLocalUsers: User[] = JSON.parse(
      localStorage.getItem('sintax_users') || '[]'
    );
    const combinedUsers = [...INITIAL_USERS];
    for (const u of rawLocalUsers) {
      if (!combinedUsers.some((c) => c.email.toLowerCase() === u.email.toLowerCase())) {
        combinedUsers.push(u);
      }
    }

    const existing = combinedUsers.find((u) => u.email.toLowerCase().trim() === cleanEmail);
    if (existing) {
      return { success: false, message: 'Ya existe un usuario con este correo electrónico.' };
    }

    const cleanSeed = encodeURIComponent(name || cleanEmail.split('@')[0]);
    const newUser: User = {
      id: `user-${effectiveRole}-${Date.now()}`,
      name: name || cleanEmail.split('@')[0],
      email: cleanEmail,
      role: effectiveRole,
      status: 'active',
      section,
      institution,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanSeed}&backgroundColor=6366f1,10b981,f59e0b`,
      courseIds: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Si es un estudiante, matricularlo automáticamente en las materias activas existentes
    if (effectiveRole === 'student') {
      try {
        const savedCoursesRaw = localStorage.getItem('sintax_courses');
        if (savedCoursesRaw) {
          const parsedCourses = JSON.parse(savedCoursesRaw);
          if (Array.isArray(parsedCourses) && parsedCourses.length > 0) {
            const activeCourses = parsedCourses.filter((c: any) => c.status === 'active');
            const targetCourses = activeCourses.length > 0 ? activeCourses : parsedCourses;
            const targetCourseIds = targetCourses.map((c: any) => c.id);
            newUser.courseIds = targetCourseIds;

            const updatedCourses = parsedCourses.map((c: any) => {
              if (targetCourseIds.includes(c.id)) {
                return {
                  ...c,
                  studentIds: [...new Set([...(c.studentIds || []), newUser.id])],
                };
              }
              return c;
            });
            localStorage.setItem('sintax_courses', JSON.stringify(updatedCourses));
          }
        }
      } catch {
        // Continuar si no hay materias aún
      }
    }

    // Registrar en Supabase tabla profiles si está activo
    if (isSupabaseConfigured && supabase) {
      try {
        // Insertar en tabla pública profiles con reintento seguro si faltan columnas
        const { error: upsertErr } = await supabase.from('profiles').upsert(
          {
            email: cleanEmail,
            full_name: newUser.name,
            role: effectiveRole,
            status: 'active',
            institution,
            section,
            avatar_url: newUser.avatar,
          },
          { onConflict: 'email' }
        );

        if (upsertErr) {
          // Si el esquema de Supabase aún no tiene institution/section, guardar columnas base
          await supabase.from('profiles').upsert(
            {
              email: cleanEmail,
              full_name: newUser.name,
              role: effectiveRole,
              avatar_url: newUser.avatar,
            },
            { onConflict: 'email' }
          );
        }
      } catch {
        // Fallback exitoso a almacenamiento local
      }
    }

    const updatedList = [...rawLocalUsers, newUser];
    localStorage.setItem('sintax_users', JSON.stringify(updatedList));

    const token = 'jwt_stx_' + btoa(newUser.id + ':' + newUser.role + ':' + Date.now());
    localStorage.setItem('sintax_jwt_token', token);
    localStorage.setItem('sintax_auth_user', JSON.stringify(newUser));
    setJwtToken(token);
    setUser(newUser);

    return { success: true };
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      try {
        supabase.auth.signOut();
      } catch {
        // Ignorar error al desconectar
      }
    }
    localStorage.removeItem('sintax_auth_user');
    localStorage.removeItem('sintax_jwt_token');
    localStorage.removeItem('sintax_current_user_id');
    setUser(null);
    setJwtToken(null);
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('sintax_auth_user', JSON.stringify(updated));

    // Actualizar en el registro general de usuarios
    const savedUsers: User[] = JSON.parse(
      localStorage.getItem('sintax_users') || JSON.stringify(INITIAL_USERS)
    );
    const updatedList = savedUsers.map((u) => (u.id === user.id ? updated : u));
    localStorage.setItem('sintax_users', JSON.stringify(updatedList));

    // Si Supabase está conectado, actualizar la tabla profiles
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('profiles')
        .update({
          full_name: updated.name,
          institution: updated.institution,
          section: updated.section,
          avatar_url: updated.avatar,
          status: updated.status,
          role: updated.role,
        })
        .eq('email', updated.email)
        .then();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        jwtToken,
        isAuthenticated: Boolean(user && jwtToken),
        login,
        register,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
