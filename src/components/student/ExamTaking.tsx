import React, { useState, useEffect } from 'react';
import type { Evaluation } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { calculateGrade } from '../../utils/grading';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Copy,
  Check,
  Code2,
  AlertTriangle,
} from 'lucide-react';

interface ExamTakingProps {
  evaluation: Evaluation;
  onFinish: (submission: any) => void;
  onCancel: () => void;
}

export const ExamTaking: React.FC<ExamTakingProps> = ({ evaluation, onFinish, onCancel }) => {
  const { currentUser, recordSubmission } = useStore();
  const toast = useToast();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [copiedCode, setCopiedCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(evaluation.timeLimitMinutes * 60);

  // Timer countdown
  useEffect(() => {
    if (evaluation.timeLimitMinutes <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedOptions]);

  const currentQ = evaluation.questions[currentIdx];
  const totalQuestions = evaluation.questions.length;
  const progressPct = Math.round(((currentIdx + 1) / totalQuestions) * 100);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [currentQ.id]: optId,
    }));
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.info('Código copiado al portapapeles.', 'Copiado');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSubmit = () => {
    const result = calculateGrade(evaluation.questions, selectedOptions);

    const submissionData = {
      evaluationId: evaluation.id,
      evaluationTitle: evaluation.title,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      courseId: evaluation.courseId,
      score100: result.score100,
      percentage: result.percentage,
      performanceTier: result.performanceTier,
      skillBreakdown: result.skillBreakdown,
      selectedOptions,
      recommendations: result.recommendations,
    };

    recordSubmission(submissionData);
    toast.success(`Evaluación finalizada con nota: ${result.score100}%.`, 'Entrega Registrada');
    onFinish(submissionData);
  };

  const answeredCount = Object.keys(selectedOptions).length;
  const isAllAnswered = answeredCount === totalQuestions;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-24">
      {/* Top Bar: Timer, Progress & Exit */}
      <Card className="mb-4 flex items-center justify-between gap-3 p-3.5">
        <button
          onClick={onCancel}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1 font-bold transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Salir
        </button>

        {/* Evaluation Title & Progress */}
        <div className="text-center flex-1">
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 block font-bold">
            Pregunta {currentIdx + 1} de {totalQuestions}
          </span>
          <div className="w-full max-w-xs mx-auto bg-slate-300 dark:bg-slate-800 rounded-full h-2 mt-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Timer */}
        {evaluation.timeLimitMinutes > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[var(--border-main)] bg-[var(--bg-app)] text-xs font-mono font-black text-amber-600 dark:text-amber-400 shadow-[1.5px_1.5px_0px_var(--shadow-color)]">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(timeLeft)}
          </div>
        )}
      </Card>

      {/* Main Question Card */}
      <Card className="mb-4 space-y-4">
        {/* Skill tag & points */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="logic">#{currentQ.skillTag}</Badge>
          <span className="text-xs font-mono text-[var(--text-muted)] font-bold">
            {currentQ.points || 25} Puntos
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-base sm:text-lg font-black text-[var(--text-main)] leading-relaxed">
          {currentQ.text}
        </h2>

        {/* Optional Code Snippet */}
        {currentQ.codeSnippet && (
          <div className="relative rounded-2xl overflow-hidden border-2 border-[var(--border-main)] bg-[#070b13] shadow-[2px_2px_0px_var(--shadow-color)]">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 font-bold">
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                {currentQ.language || 'código'}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(currentQ.codeSnippet!)}
                className="flex items-center gap-1 hover:text-white transition cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copiar
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 sm:p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed scrollbar-thin">
              <code>{currentQ.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((option, index) => {
            const isSelected = selectedOptions[currentQ.id] === option.id;
            const letter = String.fromCharCode(65 + index);

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectOption(option.id)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition flex items-start gap-3 active:scale-[0.99] cursor-pointer shadow-[2px_2px_0px_var(--shadow-color)] ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                    : 'bg-[var(--bg-app)] border-[var(--border-main)] hover:border-indigo-400 text-[var(--text-main)]'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-black font-mono flex items-center justify-center flex-shrink-0 transition border ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-main)]'
                  }`}
                >
                  {letter}
                </span>
                <span className="text-xs sm:text-sm font-semibold leading-relaxed">
                  {option.text}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
          icon={<ChevronLeft className="w-4 h-4" />}
        >
          Anterior
        </Button>

        {currentIdx < totalQuestions - 1 ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setCurrentIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
            icon={<ChevronRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Siguiente
          </Button>
        ) : (
          <Button
            type="button"
            variant="accent"
            size="md"
            onClick={handleSubmit}
            icon={<CheckCircle className="w-4 h-4" />}
          >
            Finalizar Examen
          </Button>
        )}
      </div>

      {/* Unanswered warning */}
      {currentIdx === totalQuestions - 1 && !isAllAnswered && (
        <div className="mt-3 p-3 rounded-2xl bg-amber-500/15 border-2 border-amber-500 text-xs text-amber-700 dark:text-amber-300 font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500" />
          Tienes preguntas sin responder ({answeredCount}/{totalQuestions} contestadas). Puedes responderlas o finalizar ahora.
        </div>
      )}
    </div>
  );
};
