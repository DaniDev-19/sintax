import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CustomSelect } from '../ui/CustomSelect';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  PlusCircle,
  Trash2,
  Code2,
  CheckCircle,
  AlertTriangle,
  FileQuestion,
  Split,
  Layers,
} from 'lucide-react';
import type { EvaluationType, SkillTag } from '../../types';
import { generateIdempotencyKey, isIdempotentRequestProcessed } from '../../utils/security';

interface DynamicQuestion {
  id: string;
  kind: 'choice' | 'code' | 'true_false' | 'survey';
  text: string;
  codeSnippet: string;
  language: string;
  skillTag: SkillTag;
  points: number;
  explanation: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
}

interface DynamicEvaluationBuilderProps {
  onSuccess: () => void;
}

export const DynamicEvaluationBuilder: React.FC<DynamicEvaluationBuilderProps> = ({ onSuccess }) => {
  const { courses, createEvaluation, currentUser } = useStore();

  const isAdmin = currentUser.role === 'admin';
  const availableCourses = isAdmin
    ? courses
    : courses.filter((c) => c.teacherId === currentUser.id);

  const [courseId, setCourseId] = useState(availableCourses[0]?.id || courses[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EvaluationType>('exam');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(25);
  const [dueDate, setDueDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Dynamic question list
  const [questions, setQuestions] = useState<DynamicQuestion[]>([
    {
      id: `q-${Date.now()}-1`,
      kind: 'choice',
      text: '',
      codeSnippet: '',
      language: 'javascript',
      skillTag: 'syntax',
      points: 50,
      explanation: '',
      options: [
        { id: 'opt-1', text: '', isCorrect: true },
        { id: 'opt-2', text: '', isCorrect: false },
      ],
    },
    {
      id: `q-${Date.now()}-2`,
      kind: 'code',
      text: '',
      codeSnippet: '',
      language: 'javascript',
      skillTag: 'logic',
      points: 50,
      explanation: '',
      options: [
        { id: 'opt-21', text: '', isCorrect: true },
        { id: 'opt-22', text: '', isCorrect: false },
      ],
    },
  ]);

  // Compute total points
  const totalPoints = questions.reduce((acc, q) => acc + (Number(q.points) || 0), 0);

  const distributePointsEqually = () => {
    if (questions.length === 0) return;
    const each = Math.floor(100 / questions.length);
    const remainder = 100 - each * questions.length;

    setQuestions((prev) =>
      prev.map((q, idx) => ({
        ...q,
        points: idx === 0 ? each + remainder : each,
      }))
    );
  };

  // Add question with specific kind
  const addQuestion = (kind: 'choice' | 'code' | 'true_false' | 'survey') => {
    const newId = `q-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    let initialOptions: Array<{ id: string; text: string; isCorrect: boolean }> = [];

    if (kind === 'true_false') {
      initialOptions = [
        { id: `opt-${Date.now()}-t`, text: 'Verdadero', isCorrect: true },
        { id: `opt-${Date.now()}-f`, text: 'Falso', isCorrect: false },
      ];
    } else if (kind === 'survey') {
      initialOptions = [
        { id: `opt-${Date.now()}-1`, text: 'Excelente / Totalmente de acuerdo', isCorrect: true },
        { id: `opt-${Date.now()}-2`, text: 'Bueno / De acuerdo', isCorrect: true },
        { id: `opt-${Date.now()}-3`, text: 'Neutro / Regular', isCorrect: true },
        { id: `opt-${Date.now()}-4`, text: 'En desacuerdo / Necesito reforzar', isCorrect: true },
      ];
    } else {
      initialOptions = [
        { id: `opt-${Date.now()}-1`, text: '', isCorrect: true },
        { id: `opt-${Date.now()}-2`, text: '', isCorrect: false },
      ];
    }

    setQuestions((prev) => [
      ...prev,
      {
        id: newId,
        kind,
        text: '',
        codeSnippet: kind === 'code' ? '// Escribe o pega aquí el código a evaluar...\n' : '',
        language: 'javascript',
        skillTag: kind === 'code' ? 'logic' : kind === 'survey' ? 'best_practices' : 'syntax',
        points: 20,
        explanation: '',
        options: initialOptions,
      },
    ]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Dynamic options inside a question
  const addOptionToQuestion = (qIdx: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const currentOpts = updated[qIdx].options;
      updated[qIdx] = {
        ...updated[qIdx],
        options: [
          ...currentOpts,
          { id: `opt-${Date.now()}-${currentOpts.length + 1}`, text: '', isCorrect: false },
        ],
      };
      return updated;
    });
  };

  const removeOptionFromQuestion = (qIdx: number, optIdx: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      if (updated[qIdx].options.length <= 2) return prev;
      const opts = updated[qIdx].options.filter((_, i) => i !== optIdx);
      updated[qIdx] = { ...updated[qIdx], options: opts };
      return updated;
    });
  };

  const setCorrectOption = (qIdx: number, optIdx: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const opts = updated[qIdx].options.map((opt, i) => ({
        ...opt,
        isCorrect: i === optIdx,
      }));
      updated[qIdx] = { ...updated[qIdx], options: opts };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Idempotency check
    const idempKey = generateIdempotencyKey();
    if (isIdempotentRequestProcessed(idempKey)) return;

    if (!title.trim()) {
      setErrorMessage('Por favor asigna un título para la evaluación.');
      return;
    }
    if (!courseId) {
      setErrorMessage('Por favor selecciona la materia a la que pertenece.');
      return;
    }

    // Validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setErrorMessage(`La pregunta #${i + 1} no tiene texto de enunciado.`);
        return;
      }
      if (q.kind !== 'survey') {
        const filled = q.options.filter((o) => o.text.trim() !== '');
        if (filled.length < 2) {
          setErrorMessage(`La pregunta #${i + 1} necesita al menos 2 opciones de respuesta válidas.`);
          return;
        }
        const hasCorrect = q.options.some((o) => o.isCorrect);
        if (!hasCorrect) {
          setErrorMessage(`Marca cuál opción es la correcta en la pregunta #${i + 1}.`);
          return;
        }
      }
    }

    const selCourse = courses.find((c) => c.id === courseId);

    createEvaluation({
      courseId,
      courseName: selCourse?.name || '',
      discipline: selCourse?.discipline,
      title: title.trim(),
      description: description.trim(),
      type,
      timeLimitMinutes: Number(timeLimitMinutes),
      maxScore: 100,
      status: 'published',
      dueDate: dueDate || undefined,
      questions: questions.map((q) => ({
        id: q.id,
        evaluationId: '',
        text: q.text.trim(),
        codeSnippet: q.codeSnippet.trim() || undefined,
        language: q.language,
        type: 'single_choice',
        skillTag: q.skillTag,
        points: Number(q.points) || 10,
        explanation: q.explanation.trim(),
        options: q.options,
      })),
    });

    onSuccess();
  };

  const courseSelectOptions = availableCourses.map((c) => ({
    value: c.id,
    label: c.name,
    sublabel: c.code,
  }));

  const typeOptions = [
    { value: 'exam', label: 'Examen Oficial (Ponderación 100%)', badge: 'Calificado' },
    { value: 'exercise', label: 'Reto Práctico de Código', badge: 'Desafío' },
    { value: 'survey', label: 'Encuesta de Diagnóstico & Opinión', badge: 'Feedback' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-600 text-white font-black border-2 border-indigo-400 shadow-[2px_2px_0px_0px_#312e81]">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Constructor Libre de Evaluaciones
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Diseña cuestionarios, retos de código o encuestas dinámicas sin plantillas rígidas
          </p>
        </div>

        {/* Total Points Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-xl border-2 font-mono text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#111827] ${
              totalPoints === 100
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                : 'bg-amber-500/20 text-amber-300 border-amber-500'
            }`}
          >
            <span>Total:</span>
            <span>{totalPoints}% / 100%</span>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={distributePointsEqually}
            icon={<Split className="w-3.5 h-3.5" />}
            title="Repartir puntos equitativamente entre las preguntas"
          >
            Equilibrar
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border-2 border-rose-500 text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Config Card */}
        <Card accentColor="indigo" className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
            1. Datos del Examen o Encuesta
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <CustomSelect
              label="Materia Destino"
              options={courseSelectOptions}
              value={courseId}
              onChange={setCourseId}
            />

            <CustomSelect
              label="Modalidad"
              options={typeOptions}
              value={type}
              onChange={(v) => setType(v as EvaluationType)}
            />
          </div>

          <Input
            label="Título de la Evaluación"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Reto de Arquitectura, Hooks y Depuración"
            required
          />

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Instrucciones y Objetivos para el Alumno
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué competencias se medirán y recomendaciones antes de comenzar..."
              className="w-full py-2.5 px-3.5 rounded-xl border-2 border-slate-700/80 bg-[#0e1424] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tiempo Límite (Minutos)"
              type="number"
              min="0"
              max="240"
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
            />

            <Input
              label="Fecha de Entrega (Opcional)"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </Card>

        {/* Dynamic Questions Builder */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-emerald-400" />
              Bloques de Preguntas ({questions.length})
            </h2>

            {/* Kind buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Añadir:</span>
              <button
                type="button"
                onClick={() => addQuestion('choice')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-950 border-2 border-indigo-500/40 text-indigo-300 text-[11px] font-bold transition cursor-pointer"
              >
                + Opción Múltiple
              </button>
              <button
                type="button"
                onClick={() => addQuestion('code')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-950 border-2 border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition cursor-pointer"
              >
                + Reto de Código
              </button>
              <button
                type="button"
                onClick={() => addQuestion('true_false')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-950 border-2 border-amber-500/40 text-amber-300 text-[11px] font-bold transition cursor-pointer"
              >
                + V / F
              </button>
              <button
                type="button"
                onClick={() => addQuestion('survey')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-950 border-2 border-cyan-500/40 text-cyan-300 text-[11px] font-bold transition cursor-pointer"
              >
                + Encuesta
              </button>
            </div>
          </div>

          {questions.map((q, qIdx) => (
            <Card key={q.id} className="space-y-4 relative">
              {/* Question Top Header */}
              <div className="flex items-center justify-between gap-2 border-b-2 border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center font-mono border-2 border-indigo-400 shadow-[2px_2px_0px_0px_#312e81]">
                    #{qIdx + 1}
                  </span>
                  <Badge variant={q.kind === 'code' ? 'logic' : q.kind === 'survey' ? 'best_practices' : 'syntax'}>
                    {q.kind === 'choice'
                      ? 'Opción Múltiple'
                      : q.kind === 'code'
                      ? 'Reto de Código'
                      : q.kind === 'true_false'
                      ? 'Verdadero o Falso'
                      : 'Encuesta Libre'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-slate-400">Puntos (%):</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={q.points}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setQuestions((prev) => {
                          const updated = [...prev];
                          updated[qIdx] = { ...updated[qIdx], points: val };
                          return updated;
                        });
                      }}
                      className="w-16 py-1 px-2 rounded-lg bg-slate-900 border-2 border-slate-700 text-xs font-mono font-bold text-emerald-400 text-center focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIdx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                      title="Eliminar este bloque"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Enunciado */}
              <Input
                label="Enunciado de la Pregunta o Reto"
                value={q.text}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuestions((prev) => {
                    const updated = [...prev];
                    updated[qIdx] = { ...updated[qIdx], text: val };
                    return updated;
                  });
                }}
                placeholder="Escribe la consigna claramente..."
                required
              />

              {/* Tag & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <CustomSelect
                    label="Competencia de Diagnóstico"
                    value={q.skillTag}
                    onChange={(val) => {
                      setQuestions((prev) => {
                        const updated = [...prev];
                        updated[qIdx] = { ...updated[qIdx], skillTag: val as SkillTag };
                        return updated;
                      });
                    }}
                    options={[
                      { value: 'syntax', label: '#syntax', sublabel: 'Sintaxis y Estructura' },
                      { value: 'logic', label: '#logic', sublabel: 'Lógica y Algoritmos' },
                      { value: 'best_practices', label: '#best_practices', sublabel: 'Buenas Prácticas' },
                      { value: 'dom', label: '#dom', sublabel: 'Manipulación del DOM' },
                      { value: 'architecture', label: '#architecture', sublabel: 'Arquitectura & Estado' },
                    ]}
                    size="sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Lenguaje / Entorno
                  </label>
                  <input
                    type="text"
                    value={q.language}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuestions((prev) => {
                        const updated = [...prev];
                        updated[qIdx] = { ...updated[qIdx], language: val };
                        return updated;
                      });
                    }}
                    placeholder="javascript, python, php, sql, css..."
                    className="w-full py-2 px-3 rounded-xl border-2 border-slate-700/80 bg-[#0e1424] text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              {/* Code Snippet if applicable */}
              {(q.kind === 'code' || q.codeSnippet) && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                      Snippet de Código Asociado
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    value={q.codeSnippet}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuestions((prev) => {
                        const updated = [...prev];
                        updated[qIdx] = { ...updated[qIdx], codeSnippet: val };
                        return updated;
                      });
                    }}
                    placeholder={`function test() {\n  // código...\n}`}
                    className="w-full p-3 rounded-xl border-2 border-slate-700/80 bg-[#070b13] font-mono text-xs text-emerald-300 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              )}

              {/* Options Section */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {q.kind === 'survey' ? 'Opciones de Valoración / Respuesta' : 'Opciones (Marca la Correcta)'}
                  </span>

                  {q.kind !== 'true_false' && (
                    <button
                      type="button"
                      onClick={() => addOptionToQuestion(qIdx)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> + Añadir Opción
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border-2 transition ${
                          opt.isCorrect && q.kind !== 'survey'
                            ? 'bg-emerald-500/10 border-emerald-500/60 shadow-[2px_2px_0px_0px_#064e3b]'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        {q.kind !== 'survey' && (
                          <input
                            type="radio"
                            name={`correct-radio-${q.id}`}
                            checked={opt.isCorrect}
                            onChange={() => setCorrectOption(qIdx, optIdx)}
                            className="w-4 h-4 text-emerald-500 cursor-pointer"
                            title="Marcar como respuesta correcta"
                          />
                        )}

                        <span className="font-mono font-bold text-xs text-slate-400 w-4">
                          {letter}.
                        </span>

                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuestions((prev) => {
                              const updated = [...prev];
                              const opts = [...updated[qIdx].options];
                              opts[optIdx] = { ...opts[optIdx], text: val };
                              updated[qIdx] = { ...updated[qIdx], options: opts };
                              return updated;
                            });
                          }}
                          placeholder={`Texto de la opción ${letter}...`}
                          className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-white focus:outline-none"
                        />

                        {q.kind !== 'true_false' && q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOptionFromQuestion(qIdx, optIdx)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Eliminar opción"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation note for diagnostic */}
              <Input
                label="Retroalimentación / Explicación del Docente"
                value={q.explanation}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuestions((prev) => {
                    const updated = [...prev];
                    updated[qIdx] = { ...updated[qIdx], explanation: val };
                    return updated;
                  });
                }}
                placeholder="Por qué esta es la respuesta o qué principio técnico respalda la solución..."
              />
            </Card>
          ))}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end pt-3">
          <Button
            type="submit"
            variant="accent"
            size="lg"
            icon={<CheckCircle className="w-5 h-5" />}
          >
            Publicar Evaluación ({totalPoints}%)
          </Button>
        </div>
      </form>
    </div>
  );
};
