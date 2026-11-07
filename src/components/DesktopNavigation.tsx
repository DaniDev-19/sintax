import React from 'react';
import { useStore } from '../context/StoreContext';
import type { TabType } from './BottomNav';
import {
  Home,
  BookOpen,
  Award,
  CalendarCheck2,
  TableProperties,
  PlusCircle,
  FileCheck2,
  Users,
  Shield,
  UserCheck,
  FileText,
} from 'lucide-react';

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface DesktopNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const DesktopNavigation: React.FC<DesktopNavProps> = ({ activeTab, onTabChange }) => {
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
    { id: 'home', label: 'Mi Panel', icon: <Home className="w-4 h-4" /> },
    {
      id: 'evaluations',
      label: 'Exámenes & Retos',
      icon: <BookOpen className="w-4 h-4" />,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { id: 'documents', label: 'Guías & Recursos', icon: <FileText className="w-4 h-4 text-indigo-400" /> },
    { id: 'grades', label: 'Mis Calificaciones & Diagnósticos', icon: <Award className="w-4 h-4" /> },
    { id: 'attendance', label: 'Mi Asistencia', icon: <CalendarCheck2 className="w-4 h-4" /> },
    { id: 'settings', label: 'Mi Perfil', icon: <UserCheck className="w-4 h-4" /> },
  ];

  const teacherTabs: TabItem[] = [
    { id: 'home', label: 'Panel General', icon: <Home className="w-4 h-4" /> },
    { id: 'academic-manager', label: 'Materias & Alumnos', icon: <Users className="w-4 h-4 text-cyan-400" /> },
    { id: 'documents', label: 'Banco de Recursos', icon: <FileText className="w-4 h-4 text-indigo-400" /> },
    { id: 'evaluations', label: 'Banco de Evaluaciones', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'create-eval', label: '+ Crear Evaluación', icon: <PlusCircle className="w-4 h-4 text-emerald-400" /> },
    { id: 'matrix-grades', label: 'Sábana de Notas', icon: <TableProperties className="w-4 h-4" /> },
    { id: 'matrix-attendance', label: 'Matriz de Asistencia', icon: <CalendarCheck2 className="w-4 h-4" /> },
    ...(isAdmin ? [{ id: 'admin' as TabType, label: 'Control Admin', icon: <Shield className="w-4 h-4 text-amber-400" /> }] : []),
    { id: 'settings', label: 'Configuración Perfil', icon: <UserCheck className="w-4 h-4" /> },
  ];

  const tabs = isStudent ? studentTabs : teacherTabs;

  return (
    <div className="hidden sm:block border-b-2 border-[var(--border-main)] bg-[var(--bg-card)] px-4 transition-colors duration-150">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white border-2 border-indigo-500 shadow-[2px_2px_0px_var(--shadow-color)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-slate-500/10 border-2 border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="bg-emerald-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-md shadow-[1px_1px_0px_var(--shadow-color)]">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
