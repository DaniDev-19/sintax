import React from 'react';
import { useStore } from '../../context/StoreContext';
import type { TabType } from '../BottomNav';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Users,
  BookOpen,
  Award,
  CalendarCheck2,
  PlusCircle,
  TableProperties,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface TeacherHomeProps {
  onNavigateTab: (tab: TabType) => void;
  onViewResult: (submission: any) => void;
}

export const TeacherHome: React.FC<TeacherHomeProps> = ({ onNavigateTab, onViewResult }) => {
  const { currentUser, courses, evaluations, submissions } = useStore();

  const isAdmin = currentUser.role === 'admin';

  // Filter courses for teacher or all if admin
  const managedCourses = isAdmin
    ? courses
    : courses.filter((c) => c.teacherId === currentUser.id);

  // Total students enrolled in teacher's courses
  const studentSet = new Set<string>();
  managedCourses.forEach((c) => c.studentIds.forEach((id) => studentSet.add(id)));
  const totalStudents = studentSet.size;

  // Submissions for teacher's courses
  const managedCourseIds = managedCourses.map((c) => c.id);
  const relevantSubmissions = submissions.filter((s) =>
    managedCourseIds.includes(s.courseId)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-5 pb-24">
      {/* Banner */}
      <div className="rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-main)] p-5 sm:p-6 shadow-[4px_4px_0px_var(--shadow-color)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-[11px] font-black uppercase tracking-wider mb-2">
              {isAdmin ? 'Panel de Administrador' : 'Panel de Profesor / Tutor'}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-main)]">
              {currentUser.name}
            </h1>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              «Aprender Creando, Crear Aprendiendo»
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2 max-w-xl">
              Gestiona tus asignaturas y materias, pasa asistencia en vivo, revisa la sábana de notas del 1% al 100% y diseña evaluaciones personalizadas sin límites.
            </p>
          </div>

          <Button
            variant="accent"
            size="md"
            onClick={() => onNavigateTab('create-eval')}
            icon={<PlusCircle className="w-4 h-4" />}
            className="flex-shrink-0"
          >
            Nueva Evaluación
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => onNavigateTab('academic-manager')}
          className="p-4 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-main)] hover:border-indigo-500 shadow-[3px_3px_0px_var(--shadow-color)] cursor-pointer transition active:scale-95 group"
          title="Ver y Gestionar Materias"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] group-hover:text-indigo-400 flex items-center justify-between">
            Materias
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-main)] mt-1">
            {managedCourses.length}
          </div>
          <span className="text-[10px] text-indigo-500 font-bold">Gestionar Asignaturas →</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-main)] shadow-[3px_3px_0px_var(--shadow-color)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
            Alumnos
            <Users className="w-4 h-4 text-emerald-500" />
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-500 mt-1">
            {totalStudents}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Inscritos en tus cursos</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-main)] shadow-[3px_3px_0px_var(--shadow-color)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
            Evaluaciones
            <Award className="w-4 h-4 text-amber-500" />
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-main)] mt-1">
            {evaluations.length}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Publicadas</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-main)] shadow-[3px_3px_0px_var(--shadow-color)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
            Entregas
            <TrendingUp className="w-4 h-4 text-cyan-500" />
          </span>
          <div className="text-2xl sm:text-3xl font-black text-cyan-500 mt-1">
            {relevantSubmissions.length}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Calificadas</span>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card
          interactive
          onClick={() => onNavigateTab('academic-manager')}
          className="flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">Materias & Alumnos</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Crear, editar, eliminar materias y alumnos
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-indigo-500 transition" />
        </Card>

        <Card
          interactive
          onClick={() => onNavigateTab('matrix-attendance')}
          className="flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-500">
              <CalendarCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">Matriz de Asistencia</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Pasar lista rápida por curso con 1 toque
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-cyan-500 transition" />
        </Card>

        <Card
          interactive
          onClick={() => onNavigateTab('matrix-grades')}
          className="flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500">
              <TableProperties className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">Sábana de Calificaciones</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Tabla de notas del 1% al 100%
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-emerald-500 transition" />
        </Card>
      </div>

      {/* Recent Submissions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-[var(--text-main)]">
            Últimas Entregas Recibidas
          </h2>
          <button
            onClick={() => onNavigateTab('matrix-grades')}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
          >
            Ver sábana completa
          </button>
        </div>

        {relevantSubmissions.length === 0 ? (
          <Card className="p-8 text-center text-[var(--text-muted)] text-sm">
            No hay entregas registradas aún.
          </Card>
        ) : (
          <div className="space-y-2">
            {relevantSubmissions.slice(0, 4).map((sub) => {
              const displayScore = sub.score100 ?? sub.percentage;
              return (
                <Card
                  key={sub.id}
                  interactive
                  onClick={() => onViewResult(sub)}
                  className="p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-[var(--text-main)]">{sub.studentName}</div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {sub.evaluationTitle} • <span className="font-mono">{sub.submittedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="font-black text-emerald-500 text-sm">
                        {displayScore}%
                      </span>
                      <span className="block text-[10px] text-[var(--text-muted)]">
                        {sub.performanceTier}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
