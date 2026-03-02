import type { User } from '@supabase/supabase-js';

// ── Constantes ──────────────────────────────────────────────────────────────
export const AVATAR_MAX_SIZE_MB = 5;
export const AVATAR_MAX_SIZE_BYTES = AVATAR_MAX_SIZE_MB * 1024 * 1024;
export const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const AVATAR_STORAGE_BUCKET = 'avatars';

// ── Utilidades ──────────────────────────────────────────────────────────────

/**
 * Resuelve la URL del avatar a mostrar, priorizando el avatar personalizado
 * sobre el de Google OAuth. Si no hay ninguno, retorna null.
 * 
 * Orden de prioridad:
 * 1. custom_avatar_url (subido manualmente por el usuario)
 * 2. avatar_url (proveído por Google OAuth u otro provider)
 * 3. null (se mostrarán las iniciales)
 */
export const getAvatarUrl = (user: User | null): string | null => {
  if (!user) return null;
  const metadata = user.user_metadata;
  return metadata?.custom_avatar_url || metadata?.avatar_url || null;
};

/**
 * Genera las iniciales del nombre del usuario (máximo 2 caracteres).
 * Ej: "Nelson Londono" → "NL", "María" → "MA"
 */
export const getInitials = (fullName: string): string => {
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Genera la ruta fija en Supabase Storage para el avatar de un usuario.
 * Usa una ruta sin extensión para que el upsert siempre reemplace el anterior.
 */
export const getAvatarStoragePath = (userId: string): string => {
  return `${userId}/avatar`;
};

/**
 * Valida un archivo antes de subirlo como avatar.
 * Lanza un Error descriptivo si la validación falla.
 */
export const validateAvatarFile = (file: File): void => {
  if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
    const allowed = AVATAR_ALLOWED_TYPES.map((t) => t.split('/')[1]).join(', ');
    throw new Error(`Formato no permitido. Usa: ${allowed}`);
  }

  if (file.size > AVATAR_MAX_SIZE_BYTES) {
    throw new Error(`La imagen supera el límite de ${AVATAR_MAX_SIZE_MB}MB.`);
  }
};
