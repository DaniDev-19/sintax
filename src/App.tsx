import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import type { TabType } from './components/BottomNav';
import { DesktopNavigation } from './components/DesktopNavigation';
import { NotificationModal } from './components/NotificationModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { AcademicManager } from './components/admin/AcademicManager';
import { AdminPanel } from './components/admin/AdminPanel';
import { ProfileSettings } from './components/settings/ProfileSettings';
import { DocumentBank } from './components/documents/DocumentBank';
import { StudentHome } from './components/student/StudentHome';
import { StudentEvaluations } from './components/student/StudentEvaluations';
import { StudentGrades } from './components/student/StudentGrades';
import { StudentAttendance } from './components/student/StudentAttendance';
import { ExamTaking } from './components/student/ExamTaking';
import { ExamResultsModal } from './components/student/ExamResultsModal';
import { TeacherHome } from './components/teacher/TeacherHome';
import { TeacherEvaluationsList } from './components/teacher/TeacherEvaluationsList';
import { TeacherGradesMatrix } from './components/teacher/TeacherGradesMatrix';
import { TeacherAttendanceMatrix } from './components/teacher/TeacherAttendanceMatrix';
import { DynamicEvaluationBuilder } from './components/teacher/DynamicEvaluationBuilder';
import { ErrorScreen } from './components/common/ErrorScreen';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import type { Evaluation, Submission } from './types';

const MainAppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { currentUser } = useStore();

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [activeExam, setActiveExam] = useState<Evaluation | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // If not logged in, show Auth Screen
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const isStudent = currentUser.role === 'student';
  const isAdmin = currentUser.role === 'admin';

  // If a student is actively taking an evaluation
  if (activeExam) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-200">
        <ExamTaking
          evaluation={activeExam}
          onCancel={() => setActiveExam(null)}
          onFinish={(newSubmission) => {
            setActiveExam(null);
            setSelectedSubmission(newSubmission);
            setActiveTab('grades');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      {/* Top Header with Neo-brutalist styling & Logout */}
      <Header
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Desktop Horizontal Navigation Bar */}
      <DesktopNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Dynamic View */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {/* Common Settings Tab */}
        {activeTab === 'settings' && <ProfileSettings />}

        {/* Common Academic Documents & Resource Bank Tab */}
        {activeTab === 'documents' && <DocumentBank />}

        {/* Admin Panel Tab (con protección de acceso 403 Forbidden) */}
        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminPanel />
          ) : (
            <ErrorScreen
              code={403}
              title="Acceso Restringido al Panel Administrativo"
              description="Este módulo central de gobernanza está reservado exclusivamente para cuentas con rol de Administrador. Tu perfil no cuenta con permisos para modificar usuarios o parámetros del sistema."
              onGoHome={() => setActiveTab('home')}
            />
          )
        )}

        {/* Student Specific Views */}
        {isStudent ? (
          <>
            {activeTab === 'home' && (
              <StudentHome
                onStartExam={(e) => setActiveExam(e)}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}
            {activeTab === 'evaluations' && (
              <StudentEvaluations
                onStartExam={(e) => setActiveExam(e)}
                onViewResult={(s) => setSelectedSubmission(s)}
              />
            )}
            {activeTab === 'grades' && (
              <StudentGrades onViewResult={(s) => setSelectedSubmission(s)} />
            )}
            {activeTab === 'attendance' && <StudentAttendance />}

            {/* Protección 403 si un estudiante intenta abrir rutas de profesor */}
            {['academic-manager', 'create-eval', 'matrix-grades', 'matrix-attendance'].includes(activeTab) && (
              <ErrorScreen
                code={403}
                title="Módulo de Gestión Reservado a Docentes"
                description="La creación de evaluaciones, control de asistencia en vivo y sábanas de notas están disponibles únicamente para profesores y tutores."
                onGoHome={() => setActiveTab('home')}
              />
            )}
          </>
        ) : (
          /* Teacher / Admin Specific Views */
          <>
            {activeTab === 'home' && (
              <TeacherHome
                onNavigateTab={(tab) => setActiveTab(tab)}
                onViewResult={(s) => setSelectedSubmission(s)}
              />
            )}
            {activeTab === 'academic-manager' && <AcademicManager />}
            {activeTab === 'evaluations' && (
              <TeacherEvaluationsList
                onNavigateTab={(tab) => setActiveTab(tab)}
                onViewResult={(s) => setSelectedSubmission(s)}
              />
            )}
            {activeTab === 'create-eval' && (
              <DynamicEvaluationBuilder onSuccess={() => setActiveTab('evaluations')} />
            )}
            {activeTab === 'matrix-grades' && (
              <TeacherGradesMatrix onViewResult={(s) => setSelectedSubmission(s)} />
            )}
            {activeTab === 'matrix-attendance' && <TeacherAttendanceMatrix />}
          </>
        )}
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Exam Result & Diagnostic Modal */}
      <ExamResultsModal
        isOpen={Boolean(selectedSubmission)}
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <StoreProvider>
            <ToastProvider>
              <MainAppContent />
            </ToastProvider>
          </StoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
