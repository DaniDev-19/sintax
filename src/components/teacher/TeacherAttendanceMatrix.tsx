import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CustomSelect } from '../ui/CustomSelect';
import type { AttendanceStatus } from '../../types';
import {
  CalendarCheck2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Save,
  CheckCheck,
  Calendar,
} from 'lucide-react';

export const TeacherAttendanceMatrix: React.FC = () => {
  const { courses, users, attendances, saveAttendance, currentUser } = useStore();
  const toast = useToast();

  const isAdmin = currentUser.role === 'admin';
  const availableCourses = isAdmin
    ? courses
    : courses.filter((c) => c.teacherId === currentUser.id);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    availableCourses[0]?.id || courses[0]?.id || ''
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const activeCourse = courses.find((c) => c.id === selectedCourseId);
  const enrolledStudents = users.filter((u) =>
    activeCourse?.studentIds.includes(u.id)
  );

  // Look for existing attendance for this course & date
  const existingSession = attendances.find(
    (a) => a.courseId === selectedCourseId && a.date === selectedDate
  );

  // State for attendance records for the active date
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>(() => {
    return existingSession?.records || {};
  });

  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // When course or date changes, sync local state
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const session = attendances.find(
      (a) => a.courseId === selectedCourseId && a.date === newDate
    );
    setRecords(session?.records || {});
    setIsSavedNotice(false);
  };

  const handleCourseChange = (newCourseId: string) => {
    setSelectedCourseId(newCourseId);
    const session = attendances.find(
      (a) => a.courseId === newCourseId && a.date === selectedDate
    );
    setRecords(session?.records || {});
    setIsSavedNotice(false);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setIsSavedNotice(false);
  };

  const markAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    enrolledStudents.forEach((st) => {
      updated[st.id] = 'present';
    });
    setRecords(updated);
    setIsSavedNotice(false);
    toast.info('Se han marcado todos los alumnos como presentes en borrador.', 'Lista Rápida');
  };

  const handleSave = () => {
    saveAttendance(selectedCourseId, selectedDate, records);
    setIsSavedNotice(true);
    toast.success(`Asistencia guardada con éxito para la fecha ${selectedDate}.`, 'Asistencia Confirmada');
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const statuses: { id: AttendanceStatus; label: string; icon: React.ReactNode; activeClass: string }[] = [
    { id: 'present', label: 'Presente', icon: <CheckCircle className="w-3.5 h-3.5" />, activeClass: 'bg-emerald-500 text-slate-950 font-black border-2 border-emerald-600 shadow-[2px_2px_0px_var(--shadow-color)]' },
    { id: 'late', label: 'Tarde', icon: <Clock className="w-3.5 h-3.5" />, activeClass: 'bg-amber-400 text-slate-950 font-black border-2 border-amber-500 shadow-[2px_2px_0px_var(--shadow-color)]' },
    { id: 'absent', label: 'Ausente', icon: <XCircle className="w-3.5 h-3.5" />, activeClass: 'bg-rose-500 text-white font-black border-2 border-rose-600 shadow-[2px_2px_0px_var(--shadow-color)]' },
    { id: 'excused', label: 'Justificado', icon: <AlertCircle className="w-3.5 h-3.5" />, activeClass: 'bg-cyan-500 text-slate-950 font-black border-2 border-cyan-600 shadow-[2px_2px_0px_var(--shadow-color)]' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-[var(--text-main)] flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-cyan-500" />
            Matriz de Asistencia de Alumnos
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Pasa lista diaria con un toque por estudiante y mantén el historial del curso
          </p>
        </div>

        {/* Action Save button */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={markAllPresent}
            icon={<CheckCheck className="w-3.5 h-3.5 text-emerald-500" />}
          >
            Todos Presentes
          </Button>
          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={handleSave}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            Guardar Asistencia
          </Button>
        </div>
      </div>

      {/* Filters (Course & Date) */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-[var(--text-muted)] font-bold">Materia:</span>
          <div className="flex-1 max-w-xs">
            <CustomSelect
              value={selectedCourseId}
              onChange={handleCourseChange}
              options={availableCourses.map((c) => ({
                value: c.id,
                label: c.name,
                sublabel: c.code,
              }))}
              size="sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] font-bold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-500" /> Fecha:
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl border-2 border-[var(--border-main)] bg-[var(--bg-app)] text-xs text-[var(--text-main)] font-mono font-bold focus:outline-none focus:border-cyan-500 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
          />
        </div>
      </Card>

      {isSavedNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          ¡Asistencia guardada exitosamente para la fecha {selectedDate}!
        </div>
      )}

      {/* Student List with Mobile-First Pill Buttons */}
      <div className="space-y-2.5">
        {enrolledStudents.length === 0 ? (
          <Card className="p-8 text-center text-[var(--text-muted)] text-sm">
            No hay estudiantes inscritos en este curso.
          </Card>
        ) : (
          enrolledStudents.map((st) => {
            const currentStatus = records[st.id] || 'present';

            return (
              <Card
                key={st.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Student Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={st.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.name}`}
                    alt={st.name}
                    className="w-10 h-10 rounded-xl object-cover border-2 border-[var(--border-main)] bg-[var(--bg-app)] shadow-[1px_1px_0px_var(--shadow-color)]"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-main)]">{st.name}</h3>
                    <p className="text-[11px] text-[var(--text-muted)] font-mono">{st.email}</p>
                  </div>
                </div>

                {/* 1-Touch Pill Status Switcher (Mobile First) */}
                <div className="grid grid-cols-4 gap-1.5 sm:flex sm:items-center sm:gap-2">
                  {statuses.map((s) => {
                    const isSelected = currentStatus === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleStatusChange(st.id, s.id)}
                        className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer ${
                          isSelected
                            ? s.activeClass
                            : 'bg-[var(--bg-app)] text-[var(--text-muted)] border-2 border-[var(--border-main)] hover:border-indigo-400'
                        }`}
                      >
                        {s.icon}
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
