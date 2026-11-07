import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Card } from '../ui/Card';
import { CalendarCheck2, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import type { AttendanceStatus } from '../../types';

export const StudentAttendance: React.FC = () => {
  const { currentUser, attendances, courses } = useStore();

  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  let excusedCount = 0;

  const recordsList: { date: string; courseName: string; status: AttendanceStatus }[] = [];

  attendances.forEach((att) => {
    const status = att.records[currentUser.id];
    if (status) {
      const course = courses.find((c) => c.id === att.courseId);
      recordsList.push({
        date: att.date,
        courseName: course?.name || 'Materia General',
        status,
      });

      if (status === 'present') presentCount += 1;
      else if (status === 'late') lateCount += 1;
      else if (status === 'absent') absentCount += 1;
      else if (status === 'excused') excusedCount += 1;
    }
  });

  const total = recordsList.length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount * 0.8 + excusedCount) / total) * 100) : 100;

  const statusConfig: Record<AttendanceStatus, { label: string; icon: React.ReactNode; color: string }> = {
    present: { label: 'Presente', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40' },
    late: { label: 'Tardanza', icon: <Clock className="w-3.5 h-3.5" />, color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40' },
    absent: { label: 'Inasistencia', icon: <XCircle className="w-3.5 h-3.5" />, color: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40' },
    excused: { label: 'Justificado', icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/40' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4 pb-24">
      <div>
        <h1 className="text-lg sm:text-xl font-black text-[var(--text-main)] flex items-center gap-2">
          <CalendarCheck2 className="w-5 h-5 text-cyan-500" />
          Mi Registro de Asistencia
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Control de sesiones de clase, puntualidad y porcentaje de participación
        </p>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-main)] shadow-[3px_3px_0px_var(--shadow-color)] text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Índice Global
          </span>
          <div className="text-2xl sm:text-3xl font-black text-cyan-500 mt-1">
            {attendanceRate}%
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">{total} sesiones</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-main)] shadow-[3px_3px_0px_var(--shadow-color)] text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block">
            Asistencias
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-main)] mt-1">
            {presentCount}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Puntuales</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-main)] shadow-[3px_3px_0px_var(--shadow-color)] text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
            Tardanzas
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-main)] mt-1">
            {lateCount}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Retardos</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-main)] shadow-[3px_3px_0px_var(--shadow-color)] text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">
            Inasistencias
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-main)] mt-1">
            {absentCount}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Faltas</span>
        </div>
      </div>

      {/* History list */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-[var(--text-main)]">Historial de Clases</h2>
        {recordsList.length === 0 ? (
          <Card className="p-8 text-center text-[var(--text-muted)] text-sm">
            No hay registros de asistencia para tu cuenta aún.
          </Card>
        ) : (
          recordsList.map((rec, i) => {
            const cfg = statusConfig[rec.status];
            return (
              <Card
                key={i}
                className="p-3.5 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-[var(--text-main)]">{rec.courseName}</div>
                  <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">{rec.date}</div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border-2 font-bold text-[11px] ${cfg.color}`}
                >
                  {cfg.icon}
                  {cfg.label}
                </span>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
