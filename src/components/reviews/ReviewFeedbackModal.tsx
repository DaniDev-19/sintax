import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CustomSelect } from '../ui/CustomSelect';
import { Star, MessageSquareHeart, ThumbsUp, ThumbsDown, X, Sparkles } from 'lucide-react';

interface ReviewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewFeedbackModal: React.FC<ReviewFeedbackModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, addReview } = useStore();
  const toast = useToast();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<'general' | 'platform' | 'teaching' | 'evaluations'>('platform');
  const [goodPoints, setGoodPoints] = useState('');
  const [improvements, setImprovements] = useState('');
  const [comment, setComment] = useState('');
  const [userEmail, setUserEmail] = useState(currentUser.email);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goodPoints.trim()) {
      toast.warning('Por favor indícanos qué es lo que más te ha gustado.', 'Completa tu reseña');
      return;
    }

    addReview({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userEmail: userEmail.trim() || currentUser.email,
      rating,
      category,
      goodPoints: goodPoints.trim(),
      improvements: improvements.trim() || 'Ninguna por el momento. ¡Excelente experiencia!',
      comment: comment.trim() || undefined,
    });

    toast.success('¡Muchas gracias por tu reseña! Tu opinión ayuda a crecer la plataforma Sintax LMS.', 'Reseña Registrada');
    onClose();
  };

  const categoryOptions = [
    { value: 'platform', label: 'Experiencia General de la Plataforma' },
    { value: 'evaluations', label: 'Exámenes, Retos y Sábana de Notas' },
    { value: 'teaching', label: 'Metodología y Gestión de Cursos' },
    { value: 'general', label: 'Sugerencias Generales y Soporte' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-[6px_6px_0px_var(--shadow-color)] animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[var(--border-main)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black border border-amber-300 shadow-[2px_2px_0px_var(--shadow-color)]">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[var(--text-main)] flex items-center gap-1.5">
                Reseñas & Feedback de la Comunidad
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Dinos lo bueno y lo que podemos mejorar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-slate-500/10 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Star Rating Interactive Selector */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-1.5 text-center">
              Tu Calificación General
            </label>
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform active:scale-90 cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        isFilled
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[2px_2px_0px_#78350f]'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-center text-xs font-bold text-amber-500">
              {rating === 5 && '¡Excelente! Nivel Óptimo'}
              {rating === 4 && 'Muy Bueno'}
              {rating === 3 && 'Aceptable'}
              {rating === 2 && 'Por Mejorar'}
              {rating === 1 && 'Experiencia Regular'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Correo de Contacto"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />

            <CustomSelect
              label="Área Evaluada"
              options={categoryOptions}
              value={category}
              onChange={(val) => setCategory(val as any)}
            />
          </div>

          {/* Lo Bueno */}
          <div>
            <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ThumbsUp className="w-3.5 h-3.5" />
              ¿Qué es lo que más te gusta? (Lo Bueno)
            </label>
            <textarea
              rows={2}
              value={goodPoints}
              onChange={(e) => setGoodPoints(e.target.value)}
              placeholder="Ej: La claridad de la escala 1-100%, la rapidez en el móvil, los reportes en PDF..."
              required
              className="w-full py-2 px-3 rounded-xl border-2 border-emerald-500/50 bg-[var(--bg-app)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_var(--shadow-color)]"
            />
          </div>

          {/* Lo que se puede mejorar */}
          <div>
            <label className="block text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ThumbsDown className="w-3.5 h-3.5" />
              ¿Qué podemos mejorar o qué función te gustaría ver?
            </label>
            <textarea
              rows={2}
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="Ej: Poder reintentar exámenes, sonido en el temporizador, más materias..."
              className="w-full py-2 px-3 rounded-xl border-2 border-amber-500/50 bg-[var(--bg-app)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-amber-500 shadow-[2px_2px_0px_var(--shadow-color)]"
            />
          </div>

          {/* Comentario adicional opcional */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-1.5">
              Comentarios Adicionales (Opcional)
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cualquier otro detalle que quieras compartir con la comunidad..."
              className="w-full py-2 px-3 rounded-xl border-2 border-[var(--border-main)] bg-[var(--bg-app)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 shadow-[2px_2px_0px_var(--shadow-color)]"
            />
          </div>

          {/* Footer CTA */}
          <div className="flex items-center justify-between pt-3 border-t-2 border-[var(--border-main)]">
            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Las mejores reseñas se destacan en la landing
            </span>

            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="playful" size="sm">
                Enviar Reseña
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

