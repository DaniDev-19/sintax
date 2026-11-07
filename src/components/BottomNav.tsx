import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Home,
  BookOpen,
  Award,
  CalendarCheck2,
  TableProperties,
  PlusCircle,
  Users,
  Shield,
  UserCheck,
  FileText,
} from 'lucide-react';

export type TabType =
  | 'home'
  | 'evaluations'
  | 'grades'
  | 'attendance'
  | 'matrix-grades'
  | 'matrix-attendance'
  | 'create-eval'
  | 'academic-manager'
  | 'documents'
  | 'admin'
  | 'settings';

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { currentUser, evaluations, submissions } = useStore();
  const isStudent = currentUser.role === 'student';
  const isAdmin = currentUser.role === 'admin';

  const pendingCount = isStudent
    ? evaluations.filter(
        (e) =>
          e.status === 'published' &&
          !submissions.some(
            (s) => s.evaluationId === e.id && s.studentId === currentUser.id
          )
      ).length
    : 0;

  const studentTabs: TabItem[] = [
    { id: 'home', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    {
      id: 'evaluations',
      label: 'Exámenes',
      icon: <BookOpen className="w-5 h-5" />,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { id: 'documents', label: 'Guías', icon: <FileText className="w-5 h-5 text-indigo-500" /> },
    { id: 'grades', label: 'Notas', icon: <Award className="w-5 h-5" /> },
    { id: 'attendance', label: 'Asistencia', icon: <CalendarCheck2 className="w-5 h-5" /> },
    { id: 'settings', label: 'Perfil', icon: <UserCheck className="w-5 h-5" /> },
  ];

  const teacherTabs: TabItem[] = [
    { id: 'home', label: 'Panel', icon: <Home className="w-5 h-5" /> },
    { id: 'create-eval', label: 'Crear', icon: <PlusCircle className="w-5 h-5 text-emerald-500" /> },
    { id: 'documents', label: 'Recursos', icon: <FileText className="w-5 h-5 text-indigo-500" /> },
    { id: 'academic-manager', label: 'Materias', icon: <Users className="w-5 h-5 text-cyan-500" /> },
    { id: 'matrix-grades', label: 'Sábana', icon: <TableProperties className="w-5 h-5" /> },
    ...(isAdmin ? [{ id: 'admin' as TabType, label: 'Admin', icon: <Shield className="w-5 h-5 text-amber-500" /> }] : []),
    { id: 'settings', label: 'Perfil', icon: <UserCheck className="w-5 h-5" /> },
  ];

  const tabs = isStudent ? studentTabs : teacherTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card)]/95 backdrop-blur-lg border-t-2 border-[var(--border-main)] px-1 py-2 sm:hidden transition-colors duration-150">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition cursor-pointer ${
                isActive ? 'text-indigo-600 dark:text-emerald-400 font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[var(--border-main)]">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight font-semibold">{tab.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-emerald-400 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
