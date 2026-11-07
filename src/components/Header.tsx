import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { ReviewFeedbackModal } from './reviews/ReviewFeedbackModal';
import {
  Bell,
  Terminal,
  Sparkles,
  Shield,
  GraduationCap,
  LogOut,
  Sun,
  Moon,
  User,
  Settings,
  Star,
  FileText,
  BookOpen,
} from 'lucide-react';
import type { UserRole } from '../types';

interface HeaderProps {
  onOpenNotifications: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications, onNavigateTab }) => {
  const { currentUser, notifications } = useStore();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.userId === currentUser.id && !n.read).length;

  const handleLogout = () => {
    logout();
    toast.info('Has cerrado sesión correctamente. ¡Hasta pronto!', 'Sesión Finalizada');
  };

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    student: {
      label: 'Estudiante',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
      color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-2 border-emerald-500/50 shadow-[2px_2px_0px_var(--shadow-color)]',
    },
    teacher: {
      label: 'Profesor',
      icon: <User className="w-3.5 h-3.5" />,
      color: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-2 border-indigo-500/50 shadow-[2px_2px_0px_var(--shadow-color)]',
    },
    admin: {
      label: 'Admin',
      icon: <Shield className="w-3.5 h-3.5" />,
      color: 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-2 border-amber-500/50 shadow-[2px_2px_0px_var(--shadow-color)]',
    },
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--bg-card)]/95 backdrop-blur-md border-b-2 border-[var(--border-main)] px-3 sm:px-4 py-2.5 transition-colors duration-150">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Motto */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-0.5 shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
              <div className="w-full h-full bg-[var(--bg-card)] rounded-[10px] flex items-center justify-center text-emerald-500">
                <Terminal className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-[var(--text-main)] flex items-center">
                  Sintax<span className="text-emerald-500">.</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black border border-amber-300 shadow-[1.5px_1.5px_0px_var(--shadow-color)]">
                  LMS
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-300 flex items-center gap-1 line-clamp-1">
                <Sparkles className="w-3 h-3 text-amber-500 inline" />
                Aprender Creando, Crear Aprendiendo
              </p>
            </div>
          </div>

          {/* Right actions: Review, Theme Toggle, Admin/Profile, Notifications & Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Access to Materias for teachers and admins */}
            {(currentUser.role === 'teacher' || currentUser.role === 'admin') && onNavigateTab && (
              <button
                onClick={() => onNavigateTab('academic-manager')}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--bg-app)] hover:border-cyan-500 border-2 border-[var(--border-main)] text-[var(--text-main)] text-xs font-bold transition shadow-[2px_2px_0px_var(--shadow-color)] cursor-pointer active:scale-95"
                title="Gestión de Materias y Alumnos"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
                <span>Materias</span>
              </button>
            )}

            {/* Quick Access to Documents */}
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('documents')}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--bg-app)] border-2 border-[var(--border-main)] text-[var(--text-main)] text-xs font-bold transition shadow-[2px_2px_0px_var(--shadow-color)] cursor-pointer active:scale-95"
                title="Banco de Recursos y Documentos"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Documentos</span>
              </button>
            )}

            {/* Leave Review & Feedback Modal Button */}
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 border-2 border-[var(--border-main)] text-xs font-black transition active:scale-95 shadow-[2px_2px_0px_var(--shadow-color)] cursor-pointer"
              title="Dejar Reseña & Sugerencia"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Dar Reseña</span>
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[var(--bg-app)] border-2 border-[var(--border-main)] text-[var(--text-main)] transition-all active:scale-95 shadow-[2px_2px_0px_var(--shadow-color)] cursor-pointer"
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-180 duration-200" />
              )}
            </button>

            {/* Admin shortcut badge if Admin */}
            {currentUser.role === 'admin' && onNavigateTab && (
              <button
                onClick={() => onNavigateTab('admin')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black border-2 border-[var(--border-main)] transition shadow-[2px_2px_0px_var(--shadow-color)] cursor-pointer active:scale-95"
                title="Panel de Administración"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            {/* User Profile / Settings Button */}
            <button
              onClick={() => onNavigateTab && onNavigateTab('settings')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${roleLabels[currentUser.role].color}`}
              title="Ver / Editar Perfil"
            >
              {roleLabels[currentUser.role].icon}
              <span className="hidden sm:inline font-bold">{currentUser.name}</span>
              <span className="sm:hidden font-mono text-[11px]">{roleLabels[currentUser.role].label}</span>
              <Settings className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            {/* Notifications */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-[var(--bg-app)] hover:bg-slate-500/10 border-2 border-[var(--border-main)] text-[var(--text-main)] transition active:scale-95 shadow-[2px_2px_0px_var(--shadow-color)] cursor-pointer"
              aria-label="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center animate-pulse border border-[var(--border-main)]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-[var(--bg-app)] hover:bg-rose-500/20 border-2 border-[var(--border-main)] hover:border-rose-500 text-[var(--text-muted)] hover:text-rose-500 transition active:scale-95 shadow-[2px_2px_0px_var(--shadow-color)] cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Review Modal */}
      <ReviewFeedbackModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </>
  );
};
