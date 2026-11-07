import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CustomSelect } from '../ui/CustomSelect';
import type { EvaluationType, SkillTag } from '../../types';
import {
  PlusCircle,
  Trash2,
  Code2,
  CheckCircle,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';

interface EvaluationCreatorProps {
  onSuccess: () => void;
}

export const EvaluationCreator: React.FC<EvaluationCreatorProps> = ({ onSuccess }) => {
  const { courses, createEvaluation, currentUser } = useStore();

  const isAdmin = currentUser.role === 'admin';
  const availableCourses = isAdmin
    ? courses
    : courses.filter((c) => c.teacherId === currentUser.id);

  // Form state
  const [courseId, setCourseId] = useState(availableCourses[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EvaluationType>('exam');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20);
  const [dueDate, setDueDate] = useState('');

  // Questions state
  const [questions, setQuestions] = useState<
    Array<{
      id: string;
      text: string;
      codeSnippet: string;
      language: string;
      skillTag: SkillTag;
      points: number;
      explanation: string;
      options: Array<{ id: string; text: string; isCorrect: boolean }>;
    }>
  >([
    {
      id: 'q-new-1',
      text: '',
      codeSnippet: '',
      language: 'javascript',
      skillTag: 'syntax',
      points: 25,
      explanation: '',
      options: [
        { id: 'opt-1', text: '', isCorrect: true },
        { id: 'opt-2', text: '', isCorrect: false },
        { id: 'opt-3', text: '', isCorrect: false },
        { id: 'opt-4', text: '', isCorrect: false },
      ],
    },
  ]);

  const [errorMessage, setErrorMessage] = useState('');

  const addQuestion = () => {
    const newQId = `q-new-${Date.now()}`;
    setQuestions((prev) => [
      ...prev,
      {
        id: newQId,
        text: '',
        codeSnippet: '',
        language: 'javascript',
        skillTag: 'logic',
        points: 25,
        explanation: '',
        options: [
          { id: `opt-${Date.now()}-1`, text: '', isCorrect: true },
          { id: `opt-${Date.now()}-2`, text: '', isCorrect: false },
          { id: `opt-${Date.now()}-3`, text: '', isCorrect: false },
          { id: `opt-${Date.now()}-4`, text: '', isCorrect: false },
        ],
      },
    ]);
  };

  const removeQuestion = (qIndex: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
  };

  const updateQuestion = (qIndex: number, field: string, value: any) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex] = { ...updated[qIndex], [field]: value };
      return updated;
    });
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const opts = [...updated[qIndex].options];
      opts[optIndex] = { ...opts[optIndex], text };
      updated[qIndex] = { ...updated[qIndex], options: opts };
      return updated;
    });
  };

  const setCorrectOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const opts = updated[qIndex].options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === optIndex,
      }));
      updated[qIndex] = { ...updated[qIndex], options: opts };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Por favor ingresa un título para la evaluación.');
      return;
    }
    if (!courseId) {
      setErrorMessage('Por favor selecciona una materia.');
      return;
    }

    // Validate each question has text and at least 2 filled options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setErrorMessage(`La pregunta #${i + 1} no tiene texto.`);
        return;
      }
      const filledOpts = q.options.filter((o) => o.text.trim() !== '');
      if (filledOpts.length < 2) {
        setErrorMessage(`La pregunta #${i + 1} debe tener al menos 2 opciones con texto.`);
        return;
      }
      const hasCorrect = q.options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        setErrorMessage(`Marca cuál opción es la correcta en la pregunta #${i + 1}.`);
        return;
      }
    }

    const selectedCourse = courses.find((c) => c.id === courseId);

    // Save evaluation
    createEvaluation({
      courseId,
      courseName: selectedCourse?.name || '',
      title,
      description,
      type,
      timeLimitMinutes: Number(timeLimitMinutes),
      maxScore: 100,
      status: 'published',
      dueDate: dueDate || undefined,
      questions: questions.map((q) => ({
        ...q,
        type: 'single_choice',
        evaluationId: '',
      })),
    });

    onSuccess();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-5 pb-24">
      {/* Title */}
      <div>
        <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-emerald-400" />
          Crear Nueva Evaluación / Examen
        </h1>
        <p className="text-xs text-slate-400">
          Diseña exámenes, ejercicios o encuestas con preguntas interactivas, código y diagnóstico (Escala 1% a 100%)
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#10182b] border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Configuración General
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <CustomSelect
                label="Materia / Curso"
                value={courseId}
                onChange={setCourseId}
                options={availableCourses.map((c) => ({
                  value: c.id,
                  label: c.name,
                  sublabel: c.code,
                }))}
                size="sm"
              />
            </div>

            <div>
              <CustomSelect
                label="Tipo de Evaluación"
                value={type}
                onChange={(v) => setType(v as EvaluationType)}
                options={[
                  { value: 'exam', label: 'Examen Calificado (1% a 100%)' },
                  { value: 'exercise', label: 'Ejercicio Práctico de Código' },
                  { value: 'survey', label: 'Encuesta / Diagnóstico' },
                ]}
                size="sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Título de la Evaluación:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Desafío de Algoritmos y Manejo del DOM"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Instrucciones / Descripción para el Alumno:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica el objetivo de la evaluación y lo que se espera analizar..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Límite de Tiempo (Minutos):
              </label>
              <input
                type="number"
                min="0"
                max="180"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Fecha Límite (Opcional):
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Questions Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              Preguntas ({questions.length})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold flex items-center gap-1 transition active:scale-95 border border-slate-700"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              + Agregar Pregunta
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div
              key={q.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#10182b] border border-slate-800 space-y-3.5 relative shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-emerald-400">
                  Pregunta #{qIdx + 1}
                </span>

                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIdx)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition"
                    title="Eliminar pregunta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Question Text */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Enunciado:
                </label>
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                  placeholder="Ej: ¿Qué imprime en consola el siguiente fragmento?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Snippet & Config */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <CustomSelect
                    label="Área de Diagnóstico (Habilidad)"
                    value={q.skillTag}
                    onChange={(val) => updateQuestion(qIdx, 'skillTag', val)}
                    options={[
                      { value: 'syntax', label: '#syntax (Sintaxis y Estructura)' },
                      { value: 'logic', label: '#logic (Lógica y Algoritmos)' },
                      { value: 'best_practices', label: '#best_practices (Buenas Prácticas)' },
                      { value: 'dom', label: '#dom (Manipulación del DOM)' },
                      { value: 'architecture', label: '#architecture (Arquitectura y Estado)' },
                    ]}
                    size="sm"
                  />
                </div>

                <div>
                  <CustomSelect
                    label="Lenguaje del Snippet"
                    value={q.language}
                    onChange={(val) => updateQuestion(qIdx, 'language', val)}
                    options={[
                      { value: 'javascript', label: 'JavaScript' },
                      { value: 'typescript', label: 'TypeScript' },
                      { value: 'html', label: 'HTML' },
                      { value: 'css', label: 'CSS' },
                      { value: 'python', label: 'Python' },
                      { value: 'sql', label: 'SQL' },
                    ]}
                    size="sm"
                  />
                </div>
              </div>

              {/* Code Snippet Box */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Fragmento de Código (Opcional):
                </label>
                <textarea
                  rows={3}
                  value={q.codeSnippet}
                  onChange={(e) => updateQuestion(qIdx, 'codeSnippet', e.target.value)}
                  placeholder={`const greeting = "Hola Mundo";\nconsole.log(greeting);`}
                  className="w-full p-3 rounded-xl bg-[#070b13] border border-slate-700 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Options */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Opciones de Respuesta (Marca el radio botón de la correcta):
                </span>
                {q.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border transition ${
                        opt.isCorrect
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`correct-opt-${q.id}`}
                        checked={opt.isCorrect}
                        onChange={() => setCorrectOption(qIdx, optIdx)}
                        className="w-4 h-4 text-emerald-500 focus:ring-0 cursor-pointer"
                        title="Marcar como correcta"
                      />
                      <span className="font-mono font-bold text-xs text-slate-400 w-4">
                        {letter}
                      </span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                        placeholder={`Opción ${letter}...`}
                        className="flex-1 bg-transparent border-0 text-xs text-white focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Explicación Pedagógica (Para la retroalimentación del alumno):
                </label>
                <input
                  type="text"
                  value={q.explanation}
                  onChange={(e) => updateQuestion(qIdx, 'explanation', e.target.value)}
                  placeholder="Ej: Se utiliza delegación de eventos para optimizar memoria..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-xl shadow-emerald-500/20"
          >
            <CheckCircle className="w-4 h-4" />
            Publicar Evaluación y Notificar Alumnos
          </button>
        </div>
      </form>
    </div>
  );
};
