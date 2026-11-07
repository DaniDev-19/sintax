import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CustomSelect } from '../ui/CustomSelect';
import { Terminal, Sun, Moon, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import type { UserRole } from '../../types';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [institution, setInstitution] = useState('');
  const [section, setSection] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Opciones de registro público: Solo Docente o Estudiante
  const roleOptions = [
    { value: 'teacher', label: 'Tutor / Profesor / Docente', badge: 'Evaluador' },
    { value: 'student', label: 'Estudiante / Alumno', badge: 'Evaluado' },
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Error al iniciar sesión.');
      toast.error(res.message || 'No se pudo iniciar sesión.', 'Credenciales Inválidas');
    } else {
      toast.success('¡Bienvenido a Sintax LMS!', 'Sesión Iniciada');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }
    setLoading(true);
    const res = await register(
      name.trim(),
      email.trim(),
      role,
      section.trim() || 'Sección General',
      institution.trim() || 'Academia Sintax',
      password
    );
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Error al crear la cuenta.');
      toast.error(res.message || 'Error en el registro.', 'Fallo de Creación');
    } else {
      toast.success(
        `Cuenta de ${role === 'teacher' ? 'Docente' : 'Estudiante'} creada exitosamente.`,
        '¡Bienvenido a Sintax!'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md relative z-10">
        {/* Header & Theme switcher */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-0.5 shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
              <div className="w-full h-full bg-[var(--bg-card)] rounded-[10px] flex items-center justify-center text-emerald-500">
                <Terminal className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-[var(--text-main)] flex items-center">
                Sintax<span className="text-emerald-500">.</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 ml-1 rounded-md bg-amber-400 text-slate-950 font-black border border-amber-300">
                  LMS PLATFORM
                </span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[var(--bg-card)] border-2 border-[var(--border-main)] text-[var(--text-main)] shadow-[2px_2px_0px_var(--shadow-color)] active:scale-95 transition cursor-pointer"
            title="Alternar Modo Claro / Oscuro"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>

        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-6 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> «Aprender Creando, Crear Aprendiendo»
        </p>

        {/* Card Neo-brutalista de Autenticación */}
        <div className="bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-2xl p-6 sm:p-7 shadow-[4px_4px_0px_var(--shadow-color)]">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[var(--bg-app)] border-2 border-[var(--border-main)] rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-[2px_2px_0px_var(--shadow-color)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-[2px_2px_0px_var(--shadow-color)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border-2 border-rose-500 text-rose-500 text-xs font-bold rounded-xl animate-shake flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="CORREO ELECTRÓNICO"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej: usuario@institucion.edu"
                required
              />

              <Input
                label="CONTRASEÑA"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                loading={loading}
              >
                Ingresar al Sistema
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <Input
                label="NOMBRE COMPLETO"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre y apellido"
                required
              />

              <Input
                label="CORREO ELECTRÓNICO"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej: tutor@institucion.edu"
                required
              />

              <Input
                label="CONTRASEÑA"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <CustomSelect
                label="TIPO DE USUARIO / ROL"
                options={roleOptions}
                value={role}
                onChange={(v) => setRole(v as UserRole)}
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="INSTITUCIÓN"
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Colegio / Academia"
                />

                <Input
                  label="SECCIÓN / CURSO"
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="Sección A, B..."
                />
              </div>

              <Button
                type="submit"
                variant="accent"
                className="w-full mt-2"
                loading={loading}
              >
                Registrar Cuenta y Entrar
              </Button>
            </form>
          )}

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-[var(--border-main)] flex items-center justify-center gap-2 text-[10px] text-[var(--text-muted)] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sintax Learning Systems</span>
          </div>
        </div>
      </div>
    </div>
  );
};
