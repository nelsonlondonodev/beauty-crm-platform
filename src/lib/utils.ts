import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Envuelve una promesa con un timeout de seguridad.
 * Evita que promesas estancadas (Supabase, fetch, etc.) congelen la UI.
 * @param promise - La promesa a ejecutar
 * @param ms - Tiempo máximo en milisegundos (default: 5000)
 */
export function fetchWithTimeout<T>(
  promise: Promise<T>,
  ms: number = 5000
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}
