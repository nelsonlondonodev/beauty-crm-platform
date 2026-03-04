// ── Configuración de Marca ──────────────────────────────────────────────────
// Punto ÚNICO de verdad para toda referencia a la marca en la aplicación.
// Para white-label, este archivo es lo único que el cliente necesita cambiar.
// ─────────────────────────────────────────────────────────────────────────────

const BRAND_NAME = 'Londy';

export const APP_CONFIG = {
  /** Nombre comercial de la aplicación */
  brandName: BRAND_NAME,

  /** Tagline que acompaña al nombre en el login y headers */
  tagline: 'Beauty Industry CRM',

  /** Texto del título de la pestaña del navegador */
  pageTitle: `${BRAND_NAME} | Beauty Industry CRM`,

  /** Textos legales y soporte */
  legal: {
    copyright: (year: number) =>
      `© ${year} ${BRAND_NAME}. Todos los derechos reservados.`,
    supportText: `Si deseas cambiar tu correo electrónico principal o tienes problemas de acceso, por favor contacta a soporte técnico de ${BRAND_NAME}.`,
    supportUrl: 'https://wa.me/34663975428?text=Hola%2C%20necesito%20ayuda%20con%20mi%20cuenta',
  },

  /** Fallbacks cuando no hay datos del usuario */
  defaults: {
    userName: 'Usuario',
    userFullName: 'Usuario',
  },
} as const;
