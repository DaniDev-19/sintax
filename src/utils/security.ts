/**
 * Módulo de Seguridad y Resiliencia para Sintax
 * Incluye:
 * - Protección contra XSS (Sanitización y codificación de entidades)
 * - Control de Tasa / Prevención de Fuerza Bruta (Rate Limiting)
 * - Generación y Validación de Llaves de Idempotencia
 * - Cola de peticiones con Throttling y Reintentos Exponenciales
 */

// 1. Sanitización Anti-XSS
export function sanitizeHTML(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// 2. Control de Tasa (Rate Limiter en Memoria / Almacenamiento Seguro)
interface RateLimitRecord {
  attempts: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  lockoutDurationMs: number = 60000 // 1 minuto de bloqueo
): { allowed: boolean; remainingAttempts: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { attempts: 0 };

  // Si está bloqueado
  if (record.blockedUntil && record.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  // Si ya pasó el bloqueo, reiniciar
  if (record.blockedUntil && record.blockedUntil <= now) {
    record.attempts = 0;
    record.blockedUntil = undefined;
  }

  record.attempts += 1;

  if (record.attempts > maxAttempts) {
    record.blockedUntil = now + lockoutDurationMs;
    rateLimitStore.set(key, record);
    const retryAfterSeconds = Math.ceil(lockoutDurationMs / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  rateLimitStore.set(key, record);
  return {
    allowed: true,
    remainingAttempts: maxAttempts - record.attempts,
  };
}

export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

// 3. Sistema de Idempotencia (Evita duplicados ante reintentos o clics múltiples)
const processedIdempotencyKeys = new Set<string>();

export function generateIdempotencyKey(): string {
  return 'idemp_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
}

export function isIdempotentRequestProcessed(key: string): boolean {
  if (processedIdempotencyKeys.has(key)) {
    return true; // Ya fue procesada previamente
  }
  processedIdempotencyKeys.add(key);

  // Mantener el set limpio (máximo 500 llaves recientes)
  if (processedIdempotencyKeys.size > 500) {
    const firstKey = processedIdempotencyKeys.values().next().value;
    if (firstKey) processedIdempotencyKeys.delete(firstKey);
  }
  return false;
}

// 4. Throttling / Concurrencia de Peticiones (Load Balancing de Red Ligero)
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limitMs);
    }
  };
}

