// ── Servicio de Logging Centralizado ────────────────────────────────────────
// En desarrollo: loguea a la consola del navegador.
// En producción: puede extenderse para enviar a Sentry, LogRocket, Datadog, etc.
//
// Uso:
//   import { logger } from '../lib/logger';
//   logger.error('Contexto descriptivo', error);
//   logger.warn('Mensaje de advertencia');
//   logger.info('Operación completada');
// ─────────────────────────────────────────────────────────────────────────────

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  error?: unknown;
  timestamp: string;
}

const IS_DEV = import.meta.env.DEV;

/**
 * Formatea un error desconocido a un mensaje legible.
 */
const formatError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return JSON.stringify(error);
};

/**
 * Procesa una entrada de log.
 * En desarrollo loguea a la consola.
 * En producción se puede extender para enviar a servicios externos.
 */
const processLog = (entry: LogEntry): void => {
  if (IS_DEV) {
    const prefix = entry.context ? `[${entry.context}]` : '';
    const msg = `${prefix} ${entry.message}`.trim();

    switch (entry.level) {
      case 'error':
        console.error(msg, entry.error ?? '');
        break;
      case 'warn':
        console.warn(msg, entry.error ?? '');
        break;
      case 'info':
        console.info(msg);
        break;
    }
    return;
  }

  // ── Producción ──────────────────────────────────────────────────────────
  // Aquí se integra con servicios de monitoreo:
  //
  // Sentry:
  //   if (entry.level === 'error' && entry.error instanceof Error) {
  //     Sentry.captureException(entry.error);
  //   }
  //
  // Custom API:
  //   fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) });
};

/**
 * Logger centralizado de la aplicación.
 */
export const logger = {
  /**
   * Loguea un mensaje informativo (operaciones completadas, eventos normales).
   */
  info: (message: string, context?: string): void => {
    processLog({
      level: 'info',
      message,
      context,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Loguea una advertencia (situaciones recuperables, datos inesperados).
   */
  warn: (message: string, error?: unknown, context?: string): void => {
    processLog({
      level: 'warn',
      message: error ? `${message}: ${formatError(error)}` : message,
      context,
      error,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Loguea un error (fallos de operación, excepciones capturadas).
   */
  error: (message: string, error?: unknown, context?: string): void => {
    processLog({
      level: 'error',
      message: error ? `${message}: ${formatError(error)}` : message,
      context,
      error,
      timestamp: new Date().toISOString(),
    });
  },
};
