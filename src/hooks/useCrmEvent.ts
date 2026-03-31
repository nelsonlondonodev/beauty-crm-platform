import { useEffect, useRef } from 'react';

/**
 * Hook que suscribe un callback a un evento global del CRM.
 * Usa un ref interno para siempre ejecutar la versión más reciente
 * del callback sin causar re-suscripciones innecesarias.
 */
export const useCrmEvent = (eventName: string, callback: () => void): void => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = () => savedCallback.current();
    window.addEventListener(eventName, handler);
    return () => window.removeEventListener(eventName, handler);
  }, [eventName]);
};
