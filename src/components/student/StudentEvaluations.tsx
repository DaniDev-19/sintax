import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { Evaluation } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { BookOpen, Clock, Play, BarChart2 } from 'lucide-react';

interface StudentEvaluationsProps {
  onStartExam: (evaluation: Evaluation) => void;
  onViewResult: (submission: any) => void;
}

export const StudentEvaluations: React.FC<StudentEvaluationsProps> = ({
  onStartExam,
  onViewResult,
}) => {
  const { currentUser, evaluations, submissions } = useStore();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvals = evaluations.filter((e) => {
    if (e.status !== 'published') return false;
    if (filterType === 'all') return true;
    return e.type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4 pb-24">
      {/* Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-[var(--text-main)] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Evaluaciones, Retos y Encuestas
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Exámenes multidisciplinarios, retos prácticos y diagnósticos formativos
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'exam', label: 'Exámenes' },
            { id: 'exercise', label: 'Ejercicios' },
            { id: 'survey', label: 'Encuestas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer border-2 border-[var(--border-main)] ${
                filterType === tab.id
                  ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0px_var(--shadow-color)]'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] shadow-[1px_1px_0px_var(--shadow-color)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Evaluations List */}
      <div className="space-y-3">
        {filteredEvals.length === 0 ? (
          <Card className="p-8 text-center text-[var(--text-muted)] text-sm">
            No se encontraron evaluaciones disponibles en esta categoría.
          </Card>
        ) : (
          filteredEvals.map((item) => {
            const submission = submissions.find(
              (s) => s.evaluationId === item.id && s.studentId === currentUser.id
            );
            const isCompleted = Boolean(submission);
            const displayScore = submission ? (submission.score100 ?? submission.percentage) : 0;

            return (
              <Card
                key={item.id}
                interactive={false}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={item.type === 'survey' ? 'playful' : 'syntax'}>
                      {item.type === 'exam' ? 'Examen' : item.type === 'exercise' ? 'Práctica' : 'Encuesta'}
                    </Badge>
                    {item.discipline && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                        {item.discipline}
                      </span>
                    )}
                    <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.timeLimitMinutes} min
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      • {item.questions.length} preguntas
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      • Escala 1% a 100%
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-main)] leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Status & CTA */}
                <div className="flex items-center gap-3 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-main)]">
                  {isCompleted ? (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold block">
                          Calificación
                        </span>
                        <span className="text-base font-black text-emerald-500">
                          {displayScore}%
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onViewResult(submission)}
                        icon={<BarChart2 className="w-3.5 h-3.5 text-emerald-500" />}
                      >
                        Ver Diagnóstico
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="accent"
                      onClick={() => onStartExam(item)}
                      icon={<Play className="w-3.5 h-3.5 fill-current" />}
                      className="w-full sm:w-auto"
                    >
                      Comenzar
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
