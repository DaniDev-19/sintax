import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { Submission } from '../../types';
import { SKILL_LABELS } from '../../utils/grading';
import { openAcademicReportInNewTab } from '../../utils/reportGenerator';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Award, CheckCircle2, AlertCircle, ArrowRight, ExternalLink, X } from 'lucide-react';

interface ExamResultsModalProps {
  submission: Submission | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExamResultsModal: React.FC<ExamResultsModalProps> = ({
  submission,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen && submission && (submission.score100 ?? submission.percentage) >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // fallback
      }
    }
  }, [isOpen, submission]);

  if (!isOpen || !submission) return null;

  const scoreDisplay = submission.score100 ?? submission.percentage;

  const handleOpenOfficialReport = () => {
    openAcademicReportInNewTab(submission);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-[6px_6px_0px_var(--shadow-color)] animate-in fade-in zoom-in-95 duration-150 my-auto space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b-2 border-[var(--border-main)]">
          <div className="text-center w-full">
            <div className="inline-flex p-3 rounded-2xl bg-amber-400 text-slate-950 font-black border-2 border-amber-300 shadow-[3px_3px_0px_var(--shadow-color)] mb-2">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] tracking-tight">
              Diagnóstico de Evaluación
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1 font-semibold">
              {submission.evaluationTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer absolute right-5 top-5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score & Tier Box */}
        <div className="p-4 rounded-2xl bg-[var(--bg-app)] border-2 border-[var(--border-main)] text-center shadow-[2px_2px_0px_var(--shadow-color)]">
          <div className="flex items-center justify-center gap-5">
            <div>
              <div className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400">
                {scoreDisplay}
                <span className="text-2xl font-extrabold">%</span>
              </div>
              <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-1 font-bold">
                Puntuación Porcentual
              </div>
            </div>

            <div className="h-14 w-0.5 bg-[var(--border-main)]" />

            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold block">
                Nivel Obtenido
              </span>
              <div className="mt-1">
                <Badge variant={scoreDisplay >= 75 ? 'logic' : 'playful'}>
                  {submission.performanceTier}
                </Badge>
              </div>
              <span className={`text-[11px] font-bold block mt-1 ${scoreDisplay >= 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {scoreDisplay >= 50 ? 'Aprobado con éxito' : 'Requiere refuerzo'}
              </span>
            </div>
          </div>
        </div>

        {/* Competency & Skill Breakdown */}
        {submission.skillBreakdown && Object.keys(submission.skillBreakdown).length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-black text-[var(--text-main)] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Desglose por Competencias
            </h3>

            <div className="space-y-2">
              {Object.entries(submission.skillBreakdown).map(([tag, data]) => {
                if (!data) return null;
                const label = SKILL_LABELS[tag as keyof typeof SKILL_LABELS] || tag;
                return (
                  <div key={tag} className="p-2.5 rounded-xl bg-[var(--bg-app)] border-2 border-[var(--border-main)] text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[var(--text-main)]">{label}</span>
                      <span className="font-mono text-[11px] text-[var(--text-muted)] font-bold">
                        {data.correct}/{data.total} ({data.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-300 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-[var(--border-main)]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          data.percentage >= 70
                            ? 'bg-emerald-500'
                            : data.percentage >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
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

        {/* Actionable Feedback */}
        {submission.recommendations && submission.recommendations.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-indigo-500/15 border-2 border-indigo-500/30 text-xs shadow-[2px_2px_0px_var(--shadow-color)]">
            <h4 className="font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <AlertCircle className="w-4 h-4 text-indigo-500" />
              Ruta Pedagógica de Mejora:
            </h4>
            <ul className="space-y-1.5">
              {submission.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-[var(--text-main)] font-medium leading-relaxed">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Official Report & Print Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <Button
            type="button"
            variant="accent"
            className="w-full sm:flex-1"
            onClick={handleOpenOfficialReport}
            icon={<ExternalLink className="w-4 h-4" />}
          >
            Abrir Boletín Oficial (PDF)
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
