import React from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BookOpen, PlusCircle, Trash2, Clock, Users, Award } from 'lucide-react';
import type { TabType } from '../BottomNav';

interface TeacherEvaluationsListProps {
  onNavigateTab: (tab: TabType) => void;
  onViewResult: (submission: any) => void;
}

export const TeacherEvaluationsList: React.FC<TeacherEvaluationsListProps> = ({
  onNavigateTab,
}) => {
  const { evaluations, deleteEvaluation, submissions, currentUser, courses } = useStore();
  const toast = useToast();

  const isAdmin = currentUser.role === 'admin';
  const managedCourses = isAdmin
    ? courses
    : courses.filter((c) => c.teacherId === currentUser.id);

  const managedCourseIds = managedCourses.map((c) => c.id);
  const relevantEvals = evaluations.filter((e) => managedCourseIds.includes(e.courseId));

  const handleDelete = (evalId: string, title: string) => {
    deleteEvaluation(evalId);
    toast.info(`La evaluación "${title}" ha sido eliminada.`, 'Evaluación Suprimida');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-[var(--text-main)] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Banco de Evaluaciones & Retos
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Gestiona tus exámenes, ejercicios prácticos y encuestas de diagnóstico (1% al 100%)
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => onNavigateTab('create-eval')}
          icon={<PlusCircle className="w-4 h-4" />}
        >
          Nueva Evaluación
        </Button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {relevantEvals.length === 0 ? (
          <Card className="p-8 text-center text-[var(--text-muted)] text-sm">
            No tienes evaluaciones creadas aún. Haz clic en "Nueva Evaluación" para diseñar la primera.
          </Card>
        ) : (
          relevantEvals.map((e) => {
            const evalSubs = submissions.filter((s) => s.evaluationId === e.id);
            const avgScore =
              evalSubs.length > 0
                ? `${Math.round(
                    evalSubs.reduce(
                      (acc, curr) => acc + (curr.score100 ?? curr.percentage),
                      0
                    ) / evalSubs.length
                  )}%`
                : 'N/A';

            return (
              <Card
                key={e.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={e.type === 'survey' ? 'playful' : 'syntax'}>
                      {e.type === 'exam' ? 'Examen Oficial' : e.type === 'exercise' ? 'Práctica' : 'Encuesta'}
                    </Badge>
                    {e.discipline && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                        {e.discipline}
                      </span>
                    )}
                    <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {e.timeLimitMinutes} min
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      • {e.questions.length} preguntas
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] font-mono">
                      Creado: {e.createdAt}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
                    {e.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                    {e.description}
                  </p>
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center gap-4 justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-main)]">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="text-center">
                      <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">
                        Entregas
                      </span>
                      <span className="font-bold text-[var(--text-main)] flex items-center justify-center gap-1">
                        <Users className="w-3 h-3 text-cyan-500" />
                        {evalSubs.length}
                      </span>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">
                        Promedio
                      </span>
                      <span className="font-black text-emerald-500 flex items-center justify-center gap-0.5">
                        <Award className="w-3 h-3 text-emerald-500" />
                        {avgScore}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(e.id, e.title)}
                    className="p-2 rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Eliminar evaluación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
