import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CustomSelect } from '../ui/CustomSelect';
import { ErrorScreen, type ErrorCode } from '../common/ErrorScreen';
import {
  Star,
  Globe,
  Lock,
  Search,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  AlertOctagon,
} from 'lucide-react';
import type { UserRole } from '../../types';

export const AdminPanel: React.FC = () => {
  const {
    users,
    courses,
    disciplines,
    reviews,
    updateUserStatus,
    updateUserRole,
    updateCourseStatus,
    addDiscipline,
    toggleReviewPublic,
  } = useStore();

  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'disciplines' | 'reviews' | 'errors'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'public' | 'private'>('all');
  const [previewErrorCode, setPreviewErrorCode] = useState<ErrorCode>(404);

  // New discipline form
  const [newDiscName, setNewDiscName] = useState('');
  const [newDiscDesc, setNewDiscDesc] = useState('');
  const [newDiscColor, setNewDiscColor] = useState('#6366f1');
  const [discSuccess, setDiscSuccess] = useState(false);

  const handleCreateDiscipline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscName.trim()) return;
    addDiscipline(newDiscName.trim(), newDiscDesc.trim(), newDiscColor);
    setNewDiscName('');
    setNewDiscDesc('');
    setDiscSuccess(true);
    toast.success(`Disciplina "${newDiscName}" agregada al catálogo.`, 'Área Creada');
    setTimeout(() => setDiscSuccess(false), 3000);
  };

  const handleToggleUserStatus = (userId: string, currentStatus: string, name: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateUserStatus(userId, newStatus);
    if (newStatus === 'active') {
      toast.success(`El usuario ${name} ha sido reactivado.`, 'Usuario Activo');
    } else {
      toast.warning(`El usuario ${name} ha sido suspendido e inhabilitado.`, 'Usuario Inactivo');
    }
  };

  const handleChangeRole = (userId: string, newRole: UserRole, name: string) => {
    updateUserRole(userId, newRole);
    toast.info(`El rol de ${name} cambió a ${newRole.toUpperCase()}.`, 'Rol Actualizado');
  };

  const handleToggleReview = (revId: string, isCurrentlyPublic: boolean) => {
    toggleReviewPublic(revId);
    if (!isCurrentlyPublic) {
      toast.success('Reseña marcada como pública para la landing promocional.', 'Visible en Landing');
    } else {
      toast.info('Reseña ocultada de la landing promocional.', 'Reseña Privada');
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearch) {
      const q = userSearch.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.institution && u.institution.toLowerCase().includes(q)) ||
        (u.section && u.section.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter === 'public') return r.isPublic;
    if (reviewFilter === 'private') return !r.isPublic;
    return true;
  });

  const avgReviewRating =
    reviews.length > 0
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6 pb-24">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-950 bg-amber-400 px-3 py-1 rounded-xl border-2 border-[var(--border-main)] shadow-[2px_2px_0px_var(--shadow-color)]">
              PANEL ADMIN
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-main)] tracking-tight">
              Control Total del Sistema & Landing
            </h1>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Gestión integral de usuarios, asignación de roles, activación de materias y moderación de reseñas para promoción.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-2xl shadow-[2px_2px_0px_var(--shadow-color)] overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0px_var(--shadow-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Usuarios ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'courses'
                ? 'bg-indigo-600 text-white shadow-[2px_2px_0px_var(--shadow-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Materias ({courses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('disciplines')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'disciplines'
                ? 'bg-emerald-500 text-slate-950 shadow-[2px_2px_0px_var(--shadow-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Disciplinas ({disciplines.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'reviews'
                ? 'bg-amber-500 text-slate-950 shadow-[2px_2px_0px_var(--shadow-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            Reseñas ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('errors')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'errors'
                ? 'bg-rose-500 text-white shadow-[2px_2px_0px_var(--shadow-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Simulador de Errores
          </button>
        </div>
      </div>

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-main)]">
                Directorio de Usuarios y Control de Acceso
              </h2>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {users.filter((u) => u.status === 'active').length} Activos •{' '}
                {users.filter((u) => u.status === 'inactive').length} Inactivos
              </span>
            </div>

            {/* User Search & Role Filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Buscar usuario..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border-main)] bg-[var(--bg-app)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <CustomSelect
                value={userRoleFilter}
                onChange={setUserRoleFilter}
                options={[
                  { value: 'all', label: 'Todos los Roles' },
                  { value: 'student', label: 'Estudiantes' },
                  { value: 'teacher', label: 'Profesores' },
                  { value: 'admin', label: 'Administradores' },
                ]}
                className="w-44"
                size="sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-app)] text-[var(--text-muted)] uppercase text-[10px] font-black tracking-wider border-b-2 border-[var(--border-main)]">
                <tr>
                  <th className="py-2.5 px-3">Usuario</th>
                  <th className="py-2.5 px-3">Rol del Sistema</th>
                  <th className="py-2.5 px-3">Institución / Sección</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-main)]">
                {filteredUsers.map((u) => {
                  const isActive = u.status !== 'inactive';
                  return (
                    <tr key={u.id} className="hover:bg-slate-500/5 transition">
                      <td className="py-3 px-3 font-semibold text-[var(--text-main)]">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                            alt={u.name}
                            className="w-9 h-9 rounded-xl bg-[var(--bg-app)] border border-[var(--border-main)] object-cover shadow-[1px_1px_0px_var(--shadow-color)]"
                          />
                          <div>
                            <div className="font-bold text-[var(--text-main)]">{u.name}</div>
                            <div className="text-[11px] text-[var(--text-muted)] font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <CustomSelect
                          value={u.role}
                          onChange={(val) => handleChangeRole(u.id, val as UserRole, u.name)}
                          options={[
                            { value: 'student', label: 'Estudiante' },
                            { value: 'teacher', label: 'Profesor' },
                            { value: 'admin', label: 'Administrador' },
                          ]}
                          className="w-36"
                          size="sm"
                        />
                      </td>

                      <td className="py-3 px-3 text-[var(--text-muted)]">
                        <div className="font-semibold text-[var(--text-main)]">{u.institution || 'Sintax Academy'}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono">{u.section || 'General'}</div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40'
                          }`}
                        >
                          {isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(u.id, u.status, u.name)}
                            className={`px-3 py-1 rounded-xl text-[11px] font-black border-2 transition cursor-pointer shadow-[1.5px_1.5px_0px_var(--shadow-color)] ${
                              isActive
                                ? 'bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border-rose-500'
                                : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-slate-950 border-emerald-500'
                            }`}
                          >
                            {isActive ? 'Suspender' : 'Activar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab: Courses Management */}
      {activeTab === 'courses' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-main)]">
              Gestión de Materias y Estado Académico
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {courses.map((c) => {
              const isActive = c.status !== 'inactive';
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-[var(--bg-app)] border-2 border-[var(--border-main)] space-y-2.5 shadow-[2px_2px_0px_var(--shadow-color)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-card)] text-[var(--text-main)] font-bold border border-[var(--border-main)]">
                      {c.code || 'SIN CÓDIGO'}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCourseStatus(c.id, isActive ? 'inactive' : 'active')}
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-black border transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/50'
                          : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/50'
                      }`}
                    >
                      {isActive ? '● ACTIVA' : '○ INACTIVA'}
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-main)]">{c.name}</h3>
                    <span className="text-[10px] text-amber-500 font-bold block mt-0.5">
                      {c.discipline || 'General'}
                    </span>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">{c.description}</p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-main)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                    <span>Prof: {c.teacherName}</span>
                    <span>{c.studentIds?.length || 0} alumnos</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tab: Disciplines Catalog */}
      {activeTab === 'disciplines' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card accentColor="emerald" className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-main)]">
                Añadir Nueva Disciplina / Área
              </h2>

              {discSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-bold">
                  ¡Área temática agregada al catálogo!
                </div>
              )}

              <form onSubmit={handleCreateDiscipline} className="space-y-3">
                <Input
                  label="Nombre de la Disciplina"
                  value={newDiscName}
                  onChange={(e) => setNewDiscName(e.target.value)}
                  placeholder="Ej: Literatura Universal, Biología, etc."
                  required
                />

                <div>
                  <label className="block text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-1.5">
                    Descripción del Área
                  </label>
                  <textarea
                    rows={2}
                    value={newDiscDesc}
                    onChange={(e) => setNewDiscDesc(e.target.value)}
                    placeholder="Enfoque de la materia..."
                    className="w-full py-2 px-3 rounded-xl border-2 border-[var(--border-main)] bg-[var(--bg-app)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--text-muted)]">Color distintivo:</span>
                  <input
                    type="color"
                    value={newDiscColor}
                    onChange={(e) => setNewDiscColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>

                <Button type="submit" variant="accent" className="w-full mt-2">
                  Guardar Disciplina
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-main)]">
              Catálogo de Áreas Académicas Disponibles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {disciplines.map((d) => (
                <Card key={d.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold">
                      {courses.filter((c) => c.discipline === d.name).length} materias
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[var(--text-main)]">{d.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">{d.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Reviews & Landing Promotion */}
      {activeTab === 'reviews' && (
        <div className="space-y-5">
          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] block">
                  Promedio de Satisfacción
                </span>
                <div className="text-2xl sm:text-3xl font-black text-amber-500 mt-0.5 flex items-center gap-1.5">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
                  {avgReviewRating} / 5.0
                </div>
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {reviews.length} opiniones
              </span>
            </Card>

            <Card className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] block">
                  Publicadas en Landing
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-500 mt-0.5 flex items-center gap-1.5">
                  <Globe className="w-6 h-6 text-emerald-500" />
                  {reviews.filter((r) => r.isPublic).length}
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-500 font-bold">
                Listas para promocionar
              </span>
            </Card>

            <Card className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] block">
                  Reseñas Privadas / Internas
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <Lock className="w-6 h-6 text-slate-400" />
                  {reviews.filter((r) => !r.isPublic).length}
                </div>
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Solo visibles en admin
              </span>
            </Card>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Gestión de Testimonios y Feedback de Usuarios
            </h2>

            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'public', label: 'En Landing' },
                { id: 'private', label: 'Privadas' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setReviewFilter(p.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer border-2 border-[var(--border-main)] ${
                    reviewFilter === p.id
                      ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0px_var(--shadow-color)]'
                      : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            {filteredReviews.length === 0 ? (
              <Card className="p-8 text-center text-[var(--text-muted)] text-sm">
                No hay reseñas en este filtro.
              </Card>
            ) : (
              filteredReviews.map((rev) => (
                <Card
                  key={rev.id}
                  className="space-y-3 border-2 border-[var(--border-main)]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border-main)]">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[var(--text-main)]">
                            {rev.userName}
                          </span>
                          <Badge variant={rev.userRole === 'admin' ? 'playful' : rev.userRole === 'teacher' ? 'logic' : 'syntax'}>
                            {rev.userRole}
                          </Badge>
                          <span className="text-[11px] text-[var(--text-muted)] font-mono">
                            {rev.userEmail}
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">
                          {rev.createdAt}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating and Landing Toggle Button */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              rev.rating >= s
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleReview(rev.id, rev.isPublic)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_var(--shadow-color)] ${
                          rev.isPublic
                            ? 'bg-emerald-500 text-slate-950 border-emerald-600'
                            : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border-main)]'
                        }`}
                        title="Haz clic para publicar o quitar de la landing"
                      >
                        {rev.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        {rev.isPublic ? 'Pública en Landing' : 'Hacer Pública'}
                      </button>
                    </div>
                  </div>

                  {/* Feedback Content */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                        <ThumbsUp className="w-3.5 h-3.5" /> Lo Bueno:
                      </span>
                      <p className="text-[var(--text-main)] leading-relaxed">{rev.goodPoints}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <span className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1">
                        <ThumbsDown className="w-3.5 h-3.5" /> Por Mejorar:
                      </span>
                      <p className="text-[var(--text-main)] leading-relaxed">{rev.improvements}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Simulador y Vista Previa de Pantallas de Error (400, 403, 404, 500) */}
      {activeTab === 'errors' && (
        <div className="space-y-4">
          <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-500" />
                Auditoría y Vista Previa de Pantallas de Error HTTP
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Verifica el diseño caricaturesco, neo-brutalista y mobile-first para cada código de error
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {([400, 403, 404, 500] as ErrorCode[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setPreviewErrorCode(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black font-mono transition cursor-pointer border-2 border-[var(--border-main)] ${
                    previewErrorCode === c
                      ? 'bg-rose-500 text-white shadow-[2px_2px_0px_var(--shadow-color)]'
                      : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  Error {c}
                </button>
              ))}
            </div>
          </Card>

          {/* Renderizado en Vivo del ErrorScreen */}
          <div className="p-2 sm:p-4 rounded-3xl bg-[var(--bg-app)] border-2 border-[var(--border-main)]">
            <ErrorScreen
              code={previewErrorCode}
              onGoHome={() => setActiveTab('users')}
              onRetry={() => toast.info(`Simulación de reintento para error ${previewErrorCode} ejecutada.`)}
              details={
                previewErrorCode === 500
                  ? 'RuntimeDiagnosticError: Exception intercepted at Component.render\n  at SintaxLMS.dispatchAction (sintax-kernel.ts:42:15)\n  at processQueue (async-scheduler.js:108:9)'
                  : undefined
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
