import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CustomSelect } from '../ui/CustomSelect';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { Course } from '../../types';
import {
  BookOpen,
  Users,
  PlusCircle,
  Trash2,
  GraduationCap,
  Sparkles,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Pencil,
  X,
  AlertTriangle,
} from 'lucide-react';

export const AcademicManager: React.FC = () => {
  const {
    courses,
    users,
    disciplines,
    addCourse,
    updateCourse,
    deleteCourse,
    updateCourseStatus,
    addStudent,
    deleteStudent,
    currentUser,
  } = useStore();

  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'courses' | 'students'>('courses');

  // Form states for new course
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState(disciplines[0]?.name || 'Desarrollo Web & Programación');
  const [customTopic, setCustomTopic] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseColor, setCourseColor] = useState('#6366f1');
  const [courseSuccess, setCourseSuccess] = useState(false);

  // Modal states for editing course
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editDiscipline, setEditDiscipline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('#6366f1');

  // Modal state for deleting course
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Form states for new student
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentCourseId, setStudentCourseId] = useState(courses[0]?.id || '');
  const [studentSection, setStudentSection] = useState('Sección A');
  const [studentInstitution, setStudentInstitution] = useState('Sintax Academy');
  const [studentSuccess, setStudentSuccess] = useState(false);

  const studentList = users.filter((u) => u.role === 'student');

  const courseSelectOptions = courses.map((c) => ({
    value: c.id,
    label: c.name,
    sublabel: c.code || 'Sin código',
    badge: `${c.studentIds?.length || 0} alumnos`,
  }));

  const disciplineOptions = disciplines.map((d) => ({
    value: d.name,
    label: d.name,
    sublabel: d.description,
  }));

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) {
      toast.error('Ingresa el nombre de la materia.', 'Campo requerido');
      return;
    }

    const chosenDiscipline = customTopic.trim() || selectedDiscipline;

    addCourse({
      name: courseName.trim(),
      code: courseCode.trim() ? courseCode.trim().toUpperCase() : undefined,
      discipline: chosenDiscipline,
      description:
        courseDescription.trim() ||
        `Curso y temática especializada en ${chosenDiscipline}.`,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      color: courseColor,
    });

    setCourseName('');
    setCourseCode('');
    setCustomTopic('');
    setCourseDescription('');
    setCourseSuccess(true);
    toast.success(`Materia "${courseName.trim()}" guardada exitosamente.`, 'Materia Creada');
    setTimeout(() => setCourseSuccess(false), 3000);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setEditName(c.name);
    setEditCode(c.code || '');
    setEditDiscipline(c.discipline);
    setEditDescription(c.description || '');
    setEditColor(c.color || '#6366f1');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editName.trim()) return;

    updateCourse(editingCourse.id, {
      name: editName.trim(),
      code: editCode.trim() ? editCode.trim().toUpperCase() : undefined,
      discipline: editDiscipline,
      description: editDescription.trim(),
      color: editColor,
    });

    toast.success(`Materia "${editName.trim()}" actualizada con éxito.`, 'Cambios Guardados');
    setEditingCourse(null);
  };

  const handleConfirmDelete = () => {
    if (!courseToDelete) return;
    deleteCourse(courseToDelete.id);
    toast.info(`Materia "${courseToDelete.name}" eliminada del sistema.`, 'Materia Eliminada');
    setCourseToDelete(null);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentEmail.trim()) return;

    addStudent(
      studentName.trim(),
      studentEmail.trim(),
      studentCourseId,
      studentSection.trim() || 'General',
      studentInstitution.trim() || 'Sintax Academy'
    );

    setStudentName('');
    setStudentEmail('');
    setStudentSuccess(true);
    toast.success(`Estudiante "${studentName.trim()}" matriculado correctamente.`, 'Alumno Registrado');
    setTimeout(() => setStudentSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black border-2 border-[var(--border-main)] shadow-[2px_2px_0px_var(--shadow-color)]">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-main)] tracking-tight">
              Gestión Académica & Materias
            </h1>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Crea, edita o elimina asignaturas en cualquier disciplina (Matemática, Historia, Idiomas, Ciencias, Código) y matricula estudiantes.
          </p>
        </div>

        {/* Pill switcher */}
        <div className="flex items-center p-1 bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-2xl shadow-[2px_2px_0px_var(--shadow-color)]">
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'courses'
                ? 'bg-indigo-600 text-white shadow-[2px_2px_0px_var(--shadow-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Materias ({courses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'students'
                ? 'bg-emerald-500 text-slate-950 shadow-[2px_2px_0px_var(--shadow-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Users className="w-4 h-4" />
            Alumnos ({studentList.length})
          </button>
        </div>
      </div>

      {activeTab === 'courses' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form to create course */}
          <div className="lg:col-span-1">
            <Card accentColor="indigo" className="space-y-4">
              <h2 className="text-sm font-black text-[var(--text-main)] flex items-center gap-2 uppercase tracking-wider">
                <PlusCircle className="w-4 h-4 text-indigo-500" />
                Nueva Materia o Asignatura
              </h2>

              {courseSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Materia creada y lista para asignaciones.
                </div>
              )}

              <form onSubmit={handleCreateCourse} className="space-y-3.5">
                <Input
                  label="Nombre de la Materia"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Ej: Álgebra Lineal, Historia Universal, Python"
                  required
                />

                <Input
                  label="Código de Asignatura (Opcional)"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="Ej: MAT-201 (Opcional)"
                />

                <CustomSelect
                  label="Disciplina / Rama Académica"
                  options={disciplineOptions}
                  value={selectedDiscipline}
                  onChange={setSelectedDiscipline}
                />

                <Input
                  label="Tema o Lenguaje Específico (Opcional)"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Ej: Cálculo Diferencial, Gramática Inglesa B2, Rust"
                />

                <div>
                  <label className="block text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-1.5">
                    Descripción / Enfoque Pedagógico
                  </label>
                  <textarea
                    rows={2}
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    placeholder="Objetivos pedagógicos del curso o temario..."
                    className="w-full py-2 px-3 rounded-xl border-2 border-[var(--border-main)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 shadow-[2px_2px_0px_var(--shadow-color)]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--text-muted)]">Color distintivo:</span>
                  <input
                    type="color"
                    value={courseColor}
                    onChange={(e) => setCourseColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  icon={<PlusCircle className="w-4 h-4" />}
                >
                  Guardar Materia
                </Button>
              </form>
            </Card>
          </div>

          {/* List of existing courses */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-[var(--text-main)] flex items-center gap-2 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                Catálogo de Materias Registradas ({courses.length})
              </h2>
            </div>

            {courses.length === 0 ? (
              <Card className="p-8 text-center space-y-3 border-2 border-dashed">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 w-12 h-12 mx-auto flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-[var(--text-main)]">
                  Aún no has registrado ninguna materia
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  Crea tu primera asignatura usando el formulario para poder diseñar evaluaciones, matricular alumnos y pasar asistencia.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courses.map((c) => {
                  const isActive = (c.status ?? 'active') === 'active';
                  return (
                    <Card key={c.id} className="space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {c.code && <Badge variant="playful">{c.code}</Badge>}
                            {c.discipline && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                                {c.discipline}
                              </span>
                            )}
                          </div>

                          {/* Status toggle */}
                          <button
                            type="button"
                            onClick={() => updateCourseStatus(c.id, isActive ? 'inactive' : 'active')}
                            className={`text-[10px] font-black px-2.5 py-1 rounded-lg border flex items-center gap-1 cursor-pointer transition ${
                              isActive
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40'
                            }`}
                            title="Haz clic para activar o desactivar la materia"
                          >
                            {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {isActive ? 'Activa' : 'Inactiva'}
                          </button>
                        </div>

                        <div>
                          <h3 className="text-sm font-black text-[var(--text-main)] flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: c.color || '#6366f1' }}
                            />
                            {c.name}
                          </h3>
                          <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
                            {c.description || 'Sin descripción pedagógica ingresada.'}
                          </p>
                        </div>
                      </div>

                      {/* Footer Actions: Edit, Delete, Stats */}
                      <div className="pt-2 border-t border-[var(--border-main)] flex items-center justify-between gap-2">
                        <div className="text-[11px] text-[var(--text-muted)] font-mono flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-cyan-500" />
                          <span>{c.studentIds?.length || 0} alumnos</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg border border-[var(--border-main)] bg-[var(--bg-app)] hover:border-indigo-400 text-[var(--text-muted)] hover:text-indigo-400 transition cursor-pointer shadow-[1px_1px_0px_var(--shadow-color)]"
                            title="Editar Materia"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setCourseToDelete(c)}
                            className="p-1.5 rounded-lg border border-[var(--border-main)] bg-[var(--bg-app)] hover:border-rose-400 text-[var(--text-muted)] hover:text-rose-400 transition cursor-pointer shadow-[1px_1px_0px_var(--shadow-color)]"
                            title="Eliminar Materia"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Students Management Tab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form to register student */}
          <div className="lg:col-span-1">
            <Card accentColor="emerald" className="space-y-4">
              <h2 className="text-sm font-black text-[var(--text-main)] flex items-center gap-2 uppercase tracking-wider">
                <PlusCircle className="w-4 h-4 text-emerald-500" />
                Matricular Nuevo Alumno
              </h2>

              {studentSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Estudiante matriculado con éxito.
                </div>
              )}

              <form onSubmit={handleCreateStudent} className="space-y-3.5">
                <Input
                  label="Nombre y Apellido"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Ej: Sofía Velásquez"
                  required
                />

                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="ej: sofia@estudiante.edu"
                  required
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Sección / Curso"
                    value={studentSection}
                    onChange={(e) => setStudentSection(e.target.value)}
                    placeholder="Ej: Sección A"
                  />
                  <Input
                    label="Institución"
                    value={studentInstitution}
                    onChange={(e) => setStudentInstitution(e.target.value)}
                    placeholder="Ej: Sintax Academy"
                  />
                </div>

                <CustomSelect
                  label="Materia Asignada"
                  options={courseSelectOptions}
                  value={studentCourseId}
                  onChange={setStudentCourseId}
                />

                <Button
                  type="submit"
                  variant="accent"
                  className="w-full mt-2"
                  icon={<PlusCircle className="w-4 h-4" />}
                >
                  Matricular Estudiante
                </Button>
              </form>
            </Card>
          </div>

          {/* List of enrolled students */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-black text-[var(--text-main)] flex items-center gap-2 uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              Alumnos Registrados en la Plataforma
            </h2>

            {studentList.length === 0 ? (
              <Card className="p-8 text-center text-[var(--text-muted)] text-sm">
                No hay estudiantes registrados aún. Utiliza el formulario lateral para matricular alumnos.
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {studentList.map((st) => (
                  <Card key={st.id} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={st.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.name}`}
                          alt={st.name}
                          className="w-10 h-10 rounded-xl bg-[var(--bg-app)] border border-[var(--border-main)] object-cover shadow-[1px_1px_0px_var(--shadow-color)]"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-[var(--text-main)]">{st.name}</h4>
                          <span className="text-[11px] text-[var(--text-muted)] font-mono">{st.email}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          deleteStudent(st.id);
                          toast.info(`Estudiante ${st.name} eliminado de la nómina.`);
                        }}
                        className="p-1.5 rounded-lg border border-[var(--border-main)] hover:border-rose-400 text-[var(--text-muted)] hover:text-rose-400 transition cursor-pointer shadow-[1px_1px_0px_var(--shadow-color)]"
                        title="Eliminar Estudiante"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-main)] text-[11px] text-[var(--text-muted)] flex items-center justify-between">
                      <span>{st.institution || 'Sintax Academy'}</span>
                      <span className="font-bold text-[var(--text-main)]">{st.section || 'General'}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para Editar Materia */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-[6px_6px_0px_var(--shadow-color)] animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[var(--border-main)] mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider">
                    Editar Materia o Asignatura
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Modifica los datos pedagógicos del curso
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-slate-500/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <Input
                label="Nombre de la Materia"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />

              <Input
                label="Código de Asignatura (Opcional)"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                placeholder="Ej: MAT-201"
              />

              <CustomSelect
                label="Disciplina / Rama Académica"
                options={disciplineOptions}
                value={editDiscipline}
                onChange={setEditDiscipline}
              />

              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-1.5">
                  Descripción / Enfoque Pedagógico
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border-2 border-[var(--border-main)] bg-[var(--bg-app)] text-xs text-[var(--text-main)] focus:outline-none focus:border-indigo-500 shadow-[2px_2px_0px_var(--shadow-color)]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-muted)]">Color distintivo:</span>
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingCourse(null)}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación de Materia */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border-2 border-rose-500 rounded-3xl w-full max-w-md p-6 shadow-[6px_6px_0px_var(--shadow-color)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[var(--text-main)]">
                  ¿Eliminar Asignatura?
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Esta acción es permanente
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-main)] leading-relaxed mb-5">
              Estás a punto de eliminar la materia <strong className="text-rose-500 font-bold">"{courseToDelete.name}"</strong>. Se desvincularán los registros y evaluaciones asociadas.
            </p>

            <div className="flex justify-end gap-2.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setCourseToDelete(null)}
              >
                Cancelar
              </Button>

              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Eliminar Materia
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
