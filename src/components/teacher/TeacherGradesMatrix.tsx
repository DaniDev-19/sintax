import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { CustomSelect } from '../ui/CustomSelect';
import { TableProperties, Download, Eye } from 'lucide-react';

interface TeacherGradesMatrixProps {
  onViewResult: (submission: any) => void;
}

export const TeacherGradesMatrix: React.FC<TeacherGradesMatrixProps> = ({ onViewResult }) => {
  const { courses, evaluations, submissions, users, currentUser } = useStore();

  const isAdmin = currentUser.role === 'admin';
  const availableCourses = isAdmin
    ? courses
    : courses.filter((c) => c.teacherId === currentUser.id);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    availableCourses[0]?.id || courses[0]?.id || ''
  );

  const activeCourse = courses.find((c) => c.id === selectedCourseId);
  const courseEvals = evaluations.filter((e) => e.courseId === selectedCourseId && e.status === 'published');

  // Enrolled students in course
  const enrolledStudents = users.filter((u) =>
    activeCourse?.studentIds.includes(u.id)
  );

  const getStudentGrade = (studentId: string, evalId: string) => {
    return submissions.find(
      (s) => s.studentId === studentId && s.evaluationId === evalId
    );
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined) return 'text-[var(--text-muted)] bg-[var(--bg-app)]';
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400 font-black bg-emerald-500/15 border-emerald-500/40';
    if (score >= 75) return 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/15 border-indigo-500/40';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/15 border-amber-500/40';
    return 'text-rose-600 dark:text-rose-400 font-bold bg-rose-500/15 border-rose-500/40';
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!activeCourse) return;
    const headers = ['Estudiante', 'Correo', ...courseEvals.map((e) => `"${e.title}"`), 'Promedio (%)'];

    const rows = enrolledStudents.map((st) => {
      let sum = 0;
      let count = 0;
      const grades = courseEvals.map((e) => {
        const sub = getStudentGrade(st.id, e.id);
        if (sub) {
          const score = sub.score100 ?? sub.percentage;
          sum += score;
          count += 1;
          return `${score}%`;
        }
        return 'N/A';
      });

      const avg = count > 0 ? `${Math.round(sum / count)}%` : 'N/A';
      return [`"${st.name}"`, st.email, ...grades, avg].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sabana_Notas_${activeCourse.code || 'Curso'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4 pb-24">
      {/* Header & Course Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-[var(--text-main)] flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-emerald-500" />
            Sábana de Calificaciones (1% al 100%)
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Matriz centralizada de notas porcentuales por materia y estudiante con diagnóstico integrado
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Course select */}
          <div className="w-56">
            <CustomSelect
              value={selectedCourseId}
              onChange={setSelectedCourseId}
              options={availableCourses.map((c) => ({
                value: c.id,
                label: c.name,
                sublabel: c.code,
              }))}
              size="sm"
            />
          </div>

          {/* Export CSV button */}
          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportCSV}
            icon={<Download className="w-3.5 h-3.5 text-emerald-500" />}
          >
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Matrix Table Container */}
      <div className="bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-2xl shadow-[4px_4px_0px_var(--shadow-color)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-app)] text-[var(--text-muted)] uppercase text-[10px] font-black tracking-wider border-b-2 border-[var(--border-main)]">
              <tr>
                <th className="py-3 px-4 sticky left-0 bg-[var(--bg-app)] z-10 min-w-[170px] border-r-2 border-[var(--border-main)]">
                  Estudiante
                </th>
                {courseEvals.map((e) => (
                  <th key={e.id} className="py-3 px-4 text-center min-w-[130px] border-r border-[var(--border-main)]">
                    <div className="font-bold text-[var(--text-main)] line-clamp-1">{e.title}</div>
                    <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono font-bold lowercase">
                      {e.type} • 100%
                    </span>
                  </th>
                ))}
                <th className="py-3 px-4 text-center bg-indigo-500/10 min-w-[110px] text-indigo-600 dark:text-indigo-300 font-black">
                  Promedio
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-main)]">
              {enrolledStudents.length === 0 ? (
                <tr>
                  <td colSpan={courseEvals.length + 2} className="py-8 text-center text-[var(--text-muted)]">
                    No hay estudiantes inscritos en esta materia.
                  </td>
                </tr>
              ) : (
                enrolledStudents.map((st) => {
                  let sum = 0;
                  let count = 0;

                  return (
                    <tr key={st.id} className="hover:bg-slate-500/5 transition">
                      {/* Student info (Sticky on mobile scroll) */}
                      <td className="py-3 px-4 font-semibold text-[var(--text-main)] sticky left-0 bg-[var(--bg-card)] z-10 border-r-2 border-[var(--border-main)]">
                        <div className="font-bold">{st.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono">{st.email}</div>
                      </td>

                      {/* Evaluations columns */}
                      {courseEvals.map((e) => {
                        const sub = getStudentGrade(st.id, e.id);
                        if (sub) {
                          const score = sub.score100 ?? sub.percentage;
                          sum += score;
                          count += 1;
                        }

                        const score = sub ? (sub.score100 ?? sub.percentage) : undefined;

                        return (
                          <td key={e.id} className="py-3 px-4 text-center border-r border-[var(--border-main)]">
                            {sub && score !== undefined ? (
                              <button
                                onClick={() => onViewResult(sub)}
                                className={`px-2.5 py-1 rounded-xl border-2 text-xs transition active:scale-95 inline-flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_var(--shadow-color)] ${getScoreColor(
                                  score
                                )}`}
                                title={`Ver diagnóstico de ${st.name}`}
                              >
                                {score}%
                                <Eye className="w-2.5 h-2.5 opacity-70" />
                              </button>
                            ) : (
                              <span className="text-[var(--text-muted)] font-mono text-[11px]">-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Average */}
                      <td className="py-3 px-4 text-center bg-indigo-500/5 font-black">
                        {count > 0 ? (
                          <span className={`text-xs px-2.5 py-0.5 rounded-xl border-2 shadow-[1px_1px_0px_var(--shadow-color)] ${getScoreColor(sum / count)}`}>
                            {Math.round(sum / count)}%
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)] font-mono">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend / Guía de Escala */}
      <Card className="flex items-center justify-between flex-wrap gap-2 text-[11px] text-[var(--text-muted)]">
        <span className="font-bold text-[var(--text-main)]">Escala de 1% a 100%:</span>
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> 90% - 100% (Profesional)
        </span>
        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-indigo-500" /> 75% - 89% (Avanzado)
        </span>
        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> 50% - 74% (En Desarrollo)
        </span>
        <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-rose-500" /> 01% - 49% (Refuerzo)
        </span>
      </Card>
    </div>
  );
};
