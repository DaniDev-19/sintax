import React, { useState } from 'react';
import { Button } from '../ui/Button';
import {
  AlertTriangle,
  ShieldAlert,
  SearchX,
  ServerCrash,
  Home,
  RefreshCw,
  ArrowLeft,
  Terminal,
  ChevronDown,
  ChevronUp,
  FileCode2,
} from 'lucide-react';

export type ErrorCode = 400 | 403 | 404 | 500;

export interface ErrorScreenProps {
  code: ErrorCode;
  title?: string;
  description?: string;
  details?: string;
  onGoHome?: () => void;
  onRetry?: () => void;
  showBack?: boolean;
}

interface ErrorConfig {
  icon: React.ReactNode;
  statusBadge: string;
  defaultTitle: string;
  defaultDescription: string;
  colorScheme: {
    accent: string;
    border: string;
    bgBadge: string;
    textBadge: string;
    btnVariant: 'primary' | 'accent' | 'secondary';
  };
  logCode: string;
}

const ERROR_CONFIGS: Record<ErrorCode, ErrorConfig> = {
  400: {
    icon: <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500" />,
    statusBadge: 'HTTP 400 • Solicitud Inválida',
    defaultTitle: 'Parámetros o Solicitud Incorrecta',
    defaultDescription:
      'El sistema no pudo procesar la solicitud debido a un formato no reconocido, parámetros faltantes o una operación no permitida.',
    colorScheme: {
      accent: 'amber',
      border: 'border-amber-500',
      bgBadge: 'bg-amber-500/15 border-amber-500/30',
      textBadge: 'text-amber-600 dark:text-amber-400',
      btnVariant: 'primary',
    },
    logCode: 'ERR_BAD_REQUEST_SYNTAX',
  },
  403: {
    icon: <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-rose-500" />,
    statusBadge: 'HTTP 403 • Acceso Prohibido',
    defaultTitle: 'Permisos Insuficientes para este Módulo',
    defaultDescription:
      'No dispones del nivel de privilegios o el rol académico requerido para acceder a esta sección. Si consideras que esto es un error, contacta al Administrador de tu institución.',
    colorScheme: {
      accent: 'rose',
      border: 'border-rose-500',
      bgBadge: 'bg-rose-500/15 border-rose-500/30',
      textBadge: 'text-rose-600 dark:text-rose-400',
      btnVariant: 'primary',
    },
    logCode: 'ERR_SECURITY_FORBIDDEN_ROLE',
  },
  404: {
    icon: <SearchX className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-500" />,
    statusBadge: 'HTTP 404 • No Encontrado',
    defaultTitle: 'Página o Recurso No Encontrado',
    defaultDescription:
      'La evaluación, módulo curricular o recurso solicitado no existe, ha sido trasladado de sección o fue archivado por el cuerpo docente.',
    colorScheme: {
      accent: 'indigo',
      border: 'border-indigo-500',
      bgBadge: 'bg-indigo-500/15 border-indigo-500/30',
      textBadge: 'text-indigo-600 dark:text-indigo-400',
      btnVariant: 'primary',
    },
    logCode: 'ERR_RESOURCE_NOT_FOUND',
  },
  500: {
    icon: <ServerCrash className="w-10 h-10 sm:w-12 sm:h-12 text-rose-500" />,
    statusBadge: 'HTTP 500 • Error Interno',
    defaultTitle: 'Falla Inesperada en el Servidor',
    defaultDescription:
      'Se produjo una excepción interna imprevista al procesar los datos académicos. La plataforma ha registrado el evento para su resolución.',
    colorScheme: {
      accent: 'rose',
      border: 'border-rose-500',
      bgBadge: 'bg-rose-500/15 border-rose-500/30',
      textBadge: 'text-rose-600 dark:text-rose-400',
      btnVariant: 'primary',
    },
    logCode: 'ERR_INTERNAL_SERVER_FAULT',
  },
};

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  code,
  title,
  description,
  details,
  onGoHome,
  onRetry,
  showBack = true,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const config = ERROR_CONFIGS[code] || ERROR_CONFIGS[404];

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      handleGoHome();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 w-full animate-in fade-in duration-200">
      <div className="w-full max-w-xl relative">
        {/* Código grande difuminado de fondo estilo neo-brutalista */}
        <div className="absolute -top-10 sm:-top-16 left-1/2 -translate-x-1/2 select-none pointer-events-none opacity-10 dark:opacity-15">
          <span className="font-mono font-black text-8xl sm:text-[140px] tracking-tighter text-[var(--text-main)]">
            {code}
          </span>
        </div>

        {/* Tarjeta Principal Neo-Brutalista */}
        <div className="relative z-10 bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_var(--shadow-color)] space-y-6">
          {/* Header Superior con Icono y Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[var(--border-main)]">
            <div className="flex items-center gap-3.5">
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[var(--bg-app)] border-2 border-[var(--border-main)] shadow-[3px_3px_0px_var(--shadow-color)] flex-shrink-0">
                {config.icon}
              </div>
              <div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-lg border text-[10px] sm:text-[11px] font-black uppercase font-mono tracking-wider ${config.colorScheme.bgBadge} ${config.colorScheme.textBadge}`}
                >
                  {config.statusBadge}
                </span>
                <p className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                  Sintax LMS • Runtime Protection
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--bg-app)] border border-[var(--border-main)] text-[10px] font-mono text-[var(--text-muted)]">
              <Terminal className="w-3.5 h-3.5 text-indigo-500" />
              <span>{config.logCode}</span>
            </div>
          </div>

          {/* Título y Mensaje */}
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-main)] tracking-tight leading-snug">
              {title || config.defaultTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              {description || config.defaultDescription}
            </p>
          </div>

          {/* Botonera de Acciones (Mobile-First: apiladas en móvil, línea en tablet/desktop) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleGoHome}
              icon={<Home className="w-4 h-4" />}
              className="flex-1 justify-center"
            >
              Volver al Inicio
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleRetry}
              icon={<RefreshCw className="w-4 h-4 text-emerald-500" />}
              className="flex-1 justify-center"
            >
              Reintentar
            </Button>

            {showBack && (
              <Button
                variant="secondary"
                size="md"
                onClick={handleBack}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="justify-center"
                title="Regresar a la pantalla anterior"
              >
                Atrás
              </Button>
            )}
          </div>

          {/* Sección de Diagnóstico Técnico / Stack Trace desplegable */}
          <div className="pt-2 border-t border-[var(--border-main)]">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between py-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition cursor-pointer select-none"
            >
              <span className="flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Detalles técnicos del diagnóstico</span>
              </span>
              {showDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showDetails && (
              <div className="mt-2 p-3.5 rounded-xl bg-[var(--bg-app)] border-2 border-[var(--border-main)] font-mono text-[11px] text-[var(--text-muted)] overflow-x-auto space-y-1.5 shadow-[2px_2px_0px_var(--shadow-color)] animate-in fade-in duration-100">
                <div className="flex items-center justify-between text-[10px] text-indigo-400 font-bold border-b border-[var(--border-main)] pb-1 mb-1">
                  <span>LOG_EVENT: {config.logCode}</span>
                  <span>TIMESTAMP: {new Date().toISOString()}</span>
                </div>
                <p className="text-[var(--text-main)]">
                  CODE: {code} ({config.statusBadge.split('•')[1]?.trim() || 'ERROR'})
                </p>
                <p>
                  ORIGIN: {typeof window !== 'undefined' ? window.location.pathname : '/'}
                </p>
                {details && (
                  <div className="mt-2 pt-1 border-t border-[var(--border-main)]/50 text-rose-400 whitespace-pre-wrap">
                    {details}
                  </div>
                )}
                {!details && (
                  <p className="text-[10px] text-slate-500 italic">
                    Sin excepciones críticas no controladas. El estado se ha recuperado correctamente.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

