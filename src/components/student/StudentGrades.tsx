import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Award, BarChart3, ArrowRight, Printer } from 'lucide-react';
import { SKILL_LABELS } from '../../utils/grading';
import { openAcademicReportInNewTab } from '../../utils/reportGenerator';

interface StudentGradesProps {
  onViewResult: (submission: any) => void;
}

export const StudentGrades: React.FC<StudentGradesProps> = ({ onViewResult }) => {
  const { currentUser, submissions } = useStore();

  const userSubmissions = submissions.filter((s) => s.studentId === currentUser.id);

  const avg =
    userSubmissions.length > 0
      ? Math.round(
          userSubmissions.reduce(
            (acc, curr) => acc + (curr.score100 ?? curr.percentage),
            0
          ) / userSubmissions.length
        )
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-black text-[var(--text-main)] flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-500" />
          Mis Calificaciones y Diagnóstico de Rendimiento
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Revisa tu progreso en la escala oficial de 1% a 100% y genera tus certificados académicos
        </p>
      </div>

      {/* Overview Card */}
      <Card className="flex items-center justify-between">
        <div>
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold block">
            Promedio General Acumulado
          </span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-500 mt-1">
            {avg}
            <span className="text-[var(--text-muted)] text-xl font-semibold">%</span>
          </div>
          <span className="text-xs text-[var(--text-muted)] mt-0.5 block">
            {userSubmissions.length} evaluaciones presentadas
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500">
          <BarChart3 className="w-8 h-8" />
        </div>
      </Card>

      {/* Submissions List */}
      <div className="space-y-3">
        {userSubmissions.length === 0 ? (
          <Card className="p-8 text-center text-[var(--text-muted)] text-sm">
            Aún no has completado ninguna evaluación. Ve a la pestaña de Exámenes para comenzar.
          </Card>
        ) : (
          userSubmissions.map((sub) => {
            const displayScore = sub.score100 ?? sub.percentage;
            return (
              <Card
                key={sub.id}
                className="space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
                      {sub.evaluationTitle}
                    </h3>
                    <span className="text-[11px] text-[var(--text-muted)] font-mono">
                      Entregado el: {sub.submittedAt}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-black text-emerald-500">
                      {displayScore}
                      <span className="text-sm text-emerald-500 font-bold">%</span>
                    </div>
                    <Badge variant={displayScore >= 75 ? 'logic' : 'syntax'}>
                      {sub.performanceTier}
                    </Badge>
                  </div>
                </div>

                {/* Skills preview bars */}
                {sub.skillBreakdown && Object.keys(sub.skillBreakdown).length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-[var(--text-muted)]">
                      Desglose por competencia:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(sub.skillBreakdown).map(([tag, data]) => {
                        if (!data) return null;
                        const label = SKILL_LABELS[tag as keyof typeof SKILL_LABELS] || tag;
                        return (
                          <div key={tag} className="p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-main)] text-[11px]">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[var(--text-main)] font-semibold">{label}</span>
                              <span className="font-mono text-[var(--text-muted)]">{data.percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-300 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  data.percentage >= 70 ? 'bg-emerald-500' : data.percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.max(5, data.percentage)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recommendations snippet */}
                {sub.recommendations && sub.recommendations.length > 0 && (
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                    <span className="font-bold text-indigo-600 dark:text-indigo-300 block mb-1">
                      Diagnóstico y Recomendaciones:
                    </span>
                    <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">
                      {sub.recommendations[0]}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openAcademicReportInNewTab(sub)}
                    icon={<Printer className="w-3.5 h-3.5" />}
                  >
                    Boletín PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onViewResult(sub)}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                    iconPosition="right"
                  >
                    Ver Ficha Completa
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
