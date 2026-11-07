import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CustomSelect } from '../ui/CustomSelect';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  BookOpen,
  FileCheck2,
  Bookmark,
  Layers,
  Search,
  Filter,
  CheckCircle,
} from 'lucide-react';
import type { AcademicDocument, DocumentCategory } from '../../types';

export const DocumentBank: React.FC = () => {
  const { currentUser, courses, documents, addDocument, deleteDocument } = useStore();
  const toast = useToast();

  const isTeacherOrAdmin = currentUser.role === 'teacher' || currentUser.role === 'admin';

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  // Form states for uploading a document
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('practice');
  const [docCourseId, setDocCourseId] = useState(courses[0]?.id || '');
  const [docSection, setDocSection] = useState('all');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState('');

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    // Format file size
    const sizeInKb = file.size / 1024;
    const formattedSize =
      sizeInKb > 1024
        ? `${(sizeInKb / 1024).toFixed(1)} MB`
        : `${Math.round(sizeInKb)} KB`;
    setFileSize(formattedSize);

    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docCourseId) {
      toast.error('Por favor completa el título y la materia del documento.', 'Campos requeridos');
      return;
    }

    const targetCourse = courses.find((c) => c.id === docCourseId);

    const finalFileName = fileName.trim() || `${docTitle.trim().replace(/\s+/g, '_')}.pdf`;
    const finalFileSize = fileSize.trim() || '1.2 MB';

    addDocument({
      title: docTitle.trim(),
      description: docDescription.trim() || 'Material académico oficial cargado para la asignatura.',
      category: docCategory,
      courseId: docCourseId,
      courseName: targetCourse?.name || 'Materia General',
      targetSection: docSection.trim() || 'all',
      fileName: finalFileName,
      fileSize: finalFileSize,
      fileDataUrl: fileDataUrl || undefined,
      uploadedById: currentUser.id,
      uploadedByName: currentUser.name,
    });

    toast.success(`"${docTitle}" ha sido cargado con éxito para los estudiantes.`, 'Documento Publicado');

    // Reset form
    setDocTitle('');
    setDocDescription('');
    setFileName('');
    setFileSize('');
    setFileDataUrl('');
    setShowUploadForm(false);
  };

  const handleDownload = (doc: AcademicDocument) => {
    if (doc.fileDataUrl) {
      const a = document.createElement('a');
      a.href = doc.fileDataUrl;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create a dummy document download for sample files
      const dummyContent = `SINTAX LMS - RECURSO ACADÉMICO OFICIAL\n\nDocumento: ${doc.title}\nMateria: ${doc.courseName}\nCategoría: ${doc.category}\nSección: ${doc.targetSection}\nSubido por: ${doc.uploadedByName}\nFecha: ${doc.createdAt}\n\nDescripción pedagógica:\n${doc.description}\n\n[Contenido académico protegido y certificado por Sintax LMS]`;
      const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName.endsWith('.pdf') ? doc.fileName.replace('.pdf', '.txt') : doc.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    toast.success(`Descargando "${doc.fileName}" (${doc.fileSize}).`, 'Descarga Iniciada');
  };

  const handleDelete = (doc: AcademicDocument) => {
    deleteDocument(doc.id);
    toast.info(`El documento "${doc.title}" ha sido eliminado.`, 'Recurso Eliminado');
  };

  // Filter accessible documents
  const accessibleDocuments = documents.filter((doc) => {
    // If student, check if document belongs to student's course and student's section
    if (currentUser.role === 'student') {
      const isEnrolledInCourse = currentUser.courseIds?.includes(doc.courseId) || courses.some(c => c.id === doc.courseId && c.studentIds.includes(currentUser.id));
      if (!isEnrolledInCourse) return false;

      // Section check
      if (doc.targetSection !== 'all') {
        const studentSec = currentUser.section || 'Sección General';
        if (doc.targetSection.toLowerCase() !== studentSec.toLowerCase()) {
          return false;
        }
      }
    }

    // Category filter
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
      return false;
    }

    // Course filter
    if (selectedCourseFilter !== 'all' && doc.courseId !== selectedCourseFilter) {
      return false;
    }

    // Search query
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(term);
      const matchDesc = doc.description.toLowerCase().includes(term);
      const matchCourse = doc.courseName.toLowerCase().includes(term);
      if (!matchTitle && !matchDesc && !matchCourse) return false;
    }

    return true;
  });

  const categoryLabels: Record<DocumentCategory, { label: string; icon: React.ReactNode; color: string }> = {
    guide: { label: 'Guía de Estudio', icon: <FileText className="w-4 h-4" />, color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
    practice: { label: 'Guía Práctica', icon: <FileCheck2 className="w-4 h-4" />, color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
    theory: { label: 'Guía Teórica', icon: <BookOpen className="w-4 h-4" />, color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
    book: { label: 'Libro / Texto', icon: <Bookmark className="w-4 h-4" />, color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
    grades_sheet: { label: 'Sábana de Notas', icon: <Layers className="w-4 h-4" />, color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
  };

  const courseSelectOptions = courses.map((c) => ({
    value: c.id,
    label: c.name,
    sublabel: c.code || c.discipline,
  }));

  const categoryOptions = [
    { value: 'practice', label: 'Guía Práctica y Ejercicios' },
    { value: 'theory', label: 'Guía Teórica y Temario' },
    { value: 'book', label: 'Libro o Material Bibliográfico' },
    { value: 'grades_sheet', label: 'Sábana de Notas Parciales / Finales' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-600 text-white font-black border-2 border-[var(--border-main)] shadow-[2px_2px_0px_var(--shadow-color)]">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-main)] tracking-tight">
              Banco de Documentos & Recursos Académicos
            </h1>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Descarga guías teóricas, ejercicios prácticos, libros de texto y sábanas de notas asignadas a tu curso y sección.
          </p>
        </div>

        {isTeacherOrAdmin && (
          <Button
            variant="accent"
            size="md"
            onClick={() => setShowUploadForm(!showUploadForm)}
            icon={<Upload className="w-4 h-4" />}
          >
            {showUploadForm ? 'Cerrar Formulario' : '+ Subir Documento'}
          </Button>
        )}
      </div>

      {/* Upload Form Modal/Card for Teachers */}
      {isTeacherOrAdmin && showUploadForm && (
        <Card accentColor="indigo" className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[var(--border-main)]">
            <h2 className="text-sm font-black text-[var(--text-main)] flex items-center gap-2 uppercase tracking-wider">
              <Upload className="w-4 h-4 text-indigo-500" />
              Cargar Nuevo Recurso para Sección
            </h2>
            <button
              onClick={() => setShowUploadForm(false)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer font-bold"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Título del Documento"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Ej: Guía Práctica de Álgebra N° 2"
                required
              />

              <CustomSelect
                label="Tipo de Recurso"
                options={categoryOptions}
                value={docCategory}
                onChange={(val) => setDocCategory(val as DocumentCategory)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomSelect
                label="Materia Asignada"
                options={courseSelectOptions}
                value={docCourseId}
                onChange={setDocCourseId}
              />

              <Input
                label="Acceso por Sección (Opcional)"
                value={docSection}
                onChange={(e) => setDocSection(e.target.value)}
                placeholder="Ej: all (Todas), Sección A, Sección B..."
                hint="Escribe 'all' para que todos los alumnos de la materia tengan acceso."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-1.5">
                Descripción / Instrucciones para el Estudiante
              </label>
              <textarea
                rows={2}
                value={docDescription}
                onChange={(e) => setDocDescription(e.target.value)}
                placeholder="Indicaciones sobre este documento, ejercicios a resolver o fechas de entrega..."
                className="w-full py-2.5 px-3.5 rounded-xl border-2 border-[var(--border-main)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 shadow-[2px_2px_0px_var(--shadow-color)]"
              />
            </div>

            {/* File Upload Box */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-1.5">
                Archivo Adjunto (PDF, DOCX, ZIP, etc.)
              </label>
              <div className="border-2 border-dashed border-[var(--border-main)] rounded-2xl p-4 text-center bg-[var(--bg-app)] hover:border-indigo-500 transition cursor-pointer relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-7 h-7 mx-auto text-indigo-500 mb-1" />
                <p className="text-xs font-bold text-[var(--text-main)]">
                  {fileName ? (
                    <span className="text-emerald-500 font-black flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 inline" /> {fileName} ({fileSize})
                    </span>
                  ) : (
                    'Haz clic o arrastra un archivo aquí para cargarlo'
                  )}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Archivos de lectura, exámenes en PDF o material complementario
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setShowUploadForm(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="accent"
                size="md"
                icon={<CheckCircle className="w-4 h-4" />}
              >
                Publicar Recurso
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters Bar */}
      <Card className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box & Course Select */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título, contenido o materia..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-[var(--border-main)] bg-[var(--bg-app)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 shadow-[2px_2px_0px_var(--shadow-color)]"
              />
            </div>

            <div className="w-full sm:w-64">
              <CustomSelect
                value={selectedCourseFilter}
                onChange={setSelectedCourseFilter}
                options={[
                  { value: 'all', label: 'Todas las Materias' },
                  ...courses.map((c) => ({
                    value: c.id,
                    label: c.name,
                    sublabel: c.code,
                  })),
                ]}
                size="sm"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'practice', label: 'Prácticas' },
              { id: 'theory', label: 'Teoría' },
              { id: 'book', label: 'Libros' },
              { id: 'grades_sheet', label: 'Notas' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer border-2 border-[var(--border-main)] ${
                  selectedCategory === cat.id
                    ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0px_var(--shadow-color)]'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] shadow-[1px_1px_0px_var(--shadow-color)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Document Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-500" />
            Documentos Disponibles ({accessibleDocuments.length})
          </h2>
        </div>

        {accessibleDocuments.length === 0 ? (
          <Card className="p-8 text-center text-[var(--text-muted)] text-sm">
            No se encontraron documentos o guías que coincidan con los filtros seleccionados.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accessibleDocuments.map((doc) => {
              const catCfg = categoryLabels[doc.category] || categoryLabels.practice;
              return (
                <Card
                  key={doc.id}
                  className="space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {/* Top badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[11px] font-bold ${catCfg.color}`}
                      >
                        {catCfg.icon}
                        {catCfg.label}
                      </span>

                      <div className="flex items-center gap-1.5 text-[10px] font-bold">
                        <span className="px-2 py-0.5 rounded-md bg-[var(--bg-app)] border border-[var(--border-main)] text-[var(--text-main)]">
                          {doc.targetSection === 'all' ? 'Todas las secciones' : doc.targetSection}
                        </span>
                        <span className="font-mono text-[var(--text-muted)]">
                          {doc.fileSize}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-[var(--text-main)] leading-snug">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                        {doc.description}
                      </p>
                    </div>

                    <div className="text-[11px] text-[var(--text-muted)] font-mono flex items-center justify-between pt-1">
                      <span className="truncate">Curso: <strong className="text-[var(--text-main)]">{doc.courseName}</strong></span>
                      <span>{doc.createdAt}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t-2 border-[var(--border-main)]">
                    <span className="text-[11px] text-[var(--text-muted)] truncate">
                      Por: {doc.uploadedByName}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isTeacherOrAdmin && (
                        <button
                          onClick={() => handleDelete(doc)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 rounded-lg transition cursor-pointer"
                          title="Eliminar documento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => handleDownload(doc)}
                        icon={<Download className="w-3.5 h-3.5" />}
                      >
                        Descargar
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

