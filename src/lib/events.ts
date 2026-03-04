/**
 * Sistema de eventos ligero para sincronización cruzada entre módulos del CRM.
 *
 * Cuando una acción en un módulo (ej: canjear un bono) necesita refrescar
 * datos en otros módulos (ej: lista de clientes, dashboard), se emite
 * un evento global que los hooks correspondientes escuchan.
 */

export const CRM_EVENTS = {
  /** Emitido cuando un bono es canjeado exitosamente */
  BONO_REDEEMED: 'crm:bono-redeemed',
} as const;

/** Despacha un evento CRM para que otros módulos reaccionen */
export const emitCrmEvent = (eventName: string): void => {
  window.dispatchEvent(new CustomEvent(eventName));
};
