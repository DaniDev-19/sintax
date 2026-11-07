import React from 'react';
import { useStore } from '../../context/StoreContext';
import type { Evaluation } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Award,
  BookOpen,
  CalendarCheck2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

interface StudentHomeProps {
  onStartExam: (evaluation: Evaluation) => void;
  onNavigateTab: (tab: any) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  onStartExam,
  onNavigateTab,
}) => {
  const { currentUser, courses, evaluations, submissions, attendances } = useStore();

  const userSubmissions = submissions.filter((s) => s.studentId === currentUser.id);

  // Compute average score 1-100%
  const avgScore =
    userSubmissions.length > 0
      ? Math.round(
          userSubmissions.reduce(
            (acc, curr) => acc + (curr.score100 ?? curr.percentage),
            0
          ) / userSubmissions.length
        )
      : 0;

  // Compute attendance percentage
  let totalSessions = 0;
  let presentCount = 0;
  attendances.forEach((att) => {
    if (att.records[currentUser.id]) {
      totalSessions += 1;
      const status = att.records[currentUser.id];
      if (status === 'present') presentCount += 1;
      else if (status === 'late') presentCount += 0.8;
      else if (status === 'excused') presentCount += 1;
    }
  });
  const attendancePct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

  // Pending evaluations
  const pendingEvals = evaluations.filter(
    (e) =>
      e.status === 'published' &&
      !userSubmissions.some((s) => s.evaluationId === e.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-5 pb-24">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-main)] p-5 sm:p-6 shadow-[4px_4px_0px_var(--shadow-color)]">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider mb-2 border border-amber-300 shadow-[1.5px_1.5px_0px_var(--shadow-color)]">
            <Sparkles className="w-3.5 h-3.5" /> Portal del Estudiante
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-main)] tracking-tight">
            ¡Hola, {currentUser.name}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 mt-1 font-bold italic">
            «Aprender Creando, Crear Aprendiendo»
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
            Bienvenido a tu panel de formación. Resuelve evaluaciones teóricas y prácticas en tus asignaturas inscritas, monitorea tu diagnóstico en escala 1% a 100% y genera tus reportes académicos oficiales.
          </p>
        </div>
      </div>

      {/* Metric Cards (Mobile Grid) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Metric 1: Average */}
        <div
          onClick={() => onNavigateTab('grades')}
          className="p-3 sm:p-4 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-main)] shadow-[3px_3px_0px_var(--shadow-color)] transition-all cursor-pointer hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
        >
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Promedio</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-3xl font-black text-emerald-500">
            {avgScore}
            <span className="text-[10px] sm:text-xs text-[var(--text-muted)] font-normal">%</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block truncate font-medium">
            {userSubmissions.length} entregas
          </span>
        </div>

        {/* Metric 2: Pending Evals */}
        <div
          onClick={() => onNavigateTab('evaluations')}
          className="p-3 sm:p-4 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-main)] shadow-[3px_3px_0px_var(--shadow-color)] transition-all cursor-pointer hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
        >
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Pendientes</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-3xl font-black text-[var(--text-main)]">
            {pendingEvals.length}
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block truncate font-medium">
            {pendingEvals.length > 0 ? 'Por responder' : 'Al día'}
          </span>
        </div>

        {/* Metric 3: Attendance */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-3 sm:p-4 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-main)] shadow-[3px_3px_0px_var(--shadow-color)] transition-all cursor-pointer hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
        >
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Asistencia</span>
            <CalendarCheck2 className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-xl sm:text-3xl font-black text-cyan-500">
            {attendancePct}%
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block truncate font-medium">
            {totalSessions} sesiones
          </span>
        </div>
      </div>

      {/* Pending Evaluations Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-[var(--text-main)] flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            Evaluaciones y Retos Disponibles
          </h2>
          <button
            onClick={() => onNavigateTab('evaluations')}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingEvals.length === 0 ? (
          <Card className="p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[var(--text-main)]">¡Estás al día!</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              No tienes evaluaciones pendientes en este momento.
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {pendingEvals.slice(0, 3).map((evalItem) => (
              <Card
                key={evalItem.id}
                interactive
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant={evalItem.type === 'survey' ? 'playful' : 'syntax'}>
                      {evalItem.type === 'exam' ? 'Examen Oficial' : evalItem.type === 'exercise' ? 'Práctica' : 'Encuesta'}
                    </Badge>
                    {evalItem.discipline && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                        {evalItem.discipline}
                      </span>
                    )}
                    <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {evalItem.timeLimitMinutes} min
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-main)] leading-snug">
                    {evalItem.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">
                    {evalItem.description}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="accent"
                  onClick={() => onStartExam(evalItem)}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  iconPosition="right"
                  className="w-full sm:w-auto flex-shrink-0"
                >
                  Rendir Evaluación
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Enrolled Courses */}
      <div className="space-y-3">
        <h2 className="text-sm sm:text-base font-black text-[var(--text-main)]">
          Mis Cursos y Materias
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {course.code && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-app)] text-[var(--text-main)] font-bold border border-[var(--border-main)]">
                      {course.code}
                    </span>
                  )}
                  {course.discipline && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                      {course.discipline}
                    </span>
                  )}
                </div>
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  {course.teacherName}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                {course.name}
              </h3>
              <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                {course.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
