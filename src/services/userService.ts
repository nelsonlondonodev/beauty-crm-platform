import { supabase } from '../lib/supabase';

export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  // 1. Ruta fija sin extensión para que el upsert SIEMPRE reemplace el anterior,
  //    independientemente del formato del archivo (.jpg, .png, .webp, etc.)
  const filePath = `${userId}/avatar`;

  // 2. Subir al Storage (Upsert para reemplazar el anterior)
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { 
      upsert: true,
      contentType: file.type 
    });

  if (uploadError) throw new Error(`Error en Storage: ${uploadError.message}`);

  // 3. Obtener URL pública con cache-buster para evitar que el navegador muestre la imagen vieja
  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

  // 4. Actualizar metadata del usuario
  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl }
  });

  if (updateError) throw new Error(`Error en Auth: ${updateError.message}`);

  // 5. Opcional: Refrescar sesión local para asegurar que la metadata persista
  await supabase.auth.refreshSession();

  return publicUrl;
};

export const updateUserInfo = async (data: { full_name?: string }): Promise<void> => {
  const { error } = await supabase.auth.updateUser({
    data: data
  });

  if (error) throw new Error(`Error updating user info: ${error.message}`);
};
