import { supabase } from '../lib/supabase';
import {
  AVATAR_STORAGE_BUCKET,
  getAvatarStoragePath,
  validateAvatarFile,
} from '../lib/avatar';

// ── Avatar ──────────────────────────────────────────────────────────────────

/**
 * Sube un avatar al Storage de Supabase y actualiza la metadata del usuario.
 * Valida tipo y tamaño antes de subir.
 */
export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  // 1. Validar archivo
  validateAvatarFile(file);

  // 2. Subir al Storage (upsert reemplaza el anterior)
  const filePath = getAvatarStoragePath(userId);

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_STORAGE_BUCKET)
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) throw new Error(`Error en Storage: ${uploadError.message}`);

  // 3. Obtener URL pública con cache-buster
  const { data: publicUrlData } = supabase.storage
    .from(AVATAR_STORAGE_BUCKET)
    .getPublicUrl(filePath);

  const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

  // 4. Guardar en custom_avatar_url (Google OAuth no lo sobrescribe)
  const { error: updateError } = await supabase.auth.updateUser({
    data: { custom_avatar_url: publicUrl },
  });

  if (updateError) throw new Error(`Error en Auth: ${updateError.message}`);

  // 5. Refrescar sesión para persistir la metadata
  await supabase.auth.refreshSession();

  return publicUrl;
};

/**
 * Elimina el avatar personalizado del Storage y limpia la metadata del usuario.
 * Después de esto, se mostrará el avatar de Google OAuth o las iniciales.
 */
export const removeAvatar = async (userId: string): Promise<void> => {
  const filePath = getAvatarStoragePath(userId);

  // 1. Eliminar archivo del Storage (ignorar error si no existe)
  await supabase.storage.from(AVATAR_STORAGE_BUCKET).remove([filePath]);

  // 2. Limpiar la metadata
  const { error } = await supabase.auth.updateUser({
    data: { custom_avatar_url: null },
  });

  if (error) throw new Error(`Error limpiando avatar: ${error.message}`);

  await supabase.auth.refreshSession();
};

// ── Perfil ──────────────────────────────────────────────────────────────────

/**
 * Actualiza la información de perfil del usuario (nombre, etc.)
 */
export const updateUserInfo = async (data: { full_name?: string }): Promise<void> => {
  const { error } = await supabase.auth.updateUser({ data });

  if (error) throw new Error(`Error updating user info: ${error.message}`);
};
