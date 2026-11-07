import type { Question, PerformanceTier, SkillTag, SkillScore } from '../types';

export const SKILL_LABELS: Record<SkillTag, string> = {
  syntax: 'Sintaxis y Estructura',
  logic: 'Lógica y Algoritmos',
  best_practices: 'Buenas Prácticas y Metodología',
  dom: 'Manipulación e Integración',
  architecture: 'Arquitectura y Organización',
  conceptual: 'Fundamentos Conceptuales y Teóricos',
  problem_solving: 'Resolución de Problemas y Aplicación',
  reading_comprehension: 'Comprensión Lectora e Interpretación',
};

export interface GradingResult {
  score100: number;
  percentage: number;
  performanceTier: PerformanceTier;
  skillBreakdown: Partial<Record<SkillTag, SkillScore>>;
  recommendations: string[];
  totalQuestions: number;
  correctAnswersCount: number;
}

export function calculateGrade(
  questions: Question[],
  selectedOptions: Record<string, string>
): GradingResult {
  let earnedPoints = 0;
  let totalPoints = 0;
  let correctCount = 0;

  const skillData: Partial<Record<SkillTag, { correct: number; total: number }>> = {};

  questions.forEach((q) => {
    const points = q.points || 1;
    totalPoints += points;

    if (!skillData[q.skillTag]) {
      skillData[q.skillTag] = { correct: 0, total: 0 };
    }
    skillData[q.skillTag]!.total += 1;

    const correctOption = q.options.find((opt) => opt.isCorrect);
    const chosenOptionId = selectedOptions[q.id];

    if (correctOption && chosenOptionId === correctOption.id) {
      earnedPoints += points;
      correctCount += 1;
      skillData[q.skillTag]!.correct += 1;
    }
  });

  // Escala de 1% a 100%
  const ratio = totalPoints > 0 ? earnedPoints / totalPoints : 0;
  const rawScore = ratio * 100;
  const score100 = Math.max(1, Math.round(rawScore));
  const percentage = score100;

  // Ponderación cualitativa en base a 100%
  let performanceTier: PerformanceTier = 'Inicial / Refuerzo';
  if (score100 >= 90) {
    performanceTier = 'Profesional';
  } else if (score100 >= 75) {
    performanceTier = 'Avanzado';
  } else if (score100 >= 50) {
    performanceTier = 'En Desarrollo';
  } else {
    performanceTier = 'Inicial / Refuerzo';
  }

  // Desglose por habilidades
  const skillBreakdown: Partial<Record<SkillTag, SkillScore>> = {};
  const recommendations: string[] = [];

  for (const key in skillData) {
    const tag = key as SkillTag;
    const { correct, total } = skillData[tag]!;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    skillBreakdown[tag] = { correct, total, percentage: pct };

    if (pct < 60) {
      if (tag === 'syntax') {
        recommendations.push('Reforzar sintaxis moderna: repasa la declaración de variables, template literals y desestructuración.');
      } else if (tag === 'logic') {
        recommendations.push('Entrenar resolución de algoritmos: practica iteraciones (map, filter, reduce) y condiciones.');
      } else if (tag === 'best_practices') {
        recommendations.push('Cuidar las buenas prácticas: evita mutación directa, nombra variables semánticamente y sigue el principio DRY.');
      } else if (tag === 'dom') {
        recommendations.push('Profundizar en el DOM: repasa event listeners, propagación (bubbling) y manejo de estados visuales.');
      } else if (tag === 'architecture') {
        recommendations.push('Estructura modular: repasa la separación de responsabilidades y la composición de componentes.');
      }
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('¡Nivel sobresaliente! Mantén la práctica explorando patrones avanzados de diseño y testing unitario.');
  }

  return {
    score100,
    percentage,
    performanceTier,
    skillBreakdown,
    recommendations,
    totalQuestions: questions.length,
    correctAnswersCount: correctCount,
  };
}
