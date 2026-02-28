import { supabase } from '../lib/supabase';

export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  // 1. Subir al Storage (Bucket: avatars)
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${Math.random()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) {
    // Si el bucket no existe, es probable que no podamos crear uno desde el cliente (depende de los permisos).
    // Suponemos que ya existe o que el usuario lo creará.
    throw new Error(`Error uploading image: ${uploadError.message}`);
  }

  // 2. Obtener URL pública
  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData.publicUrl;

  // 3. Actualizar la metadata del usuario en Auth
  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl }
  });

  if (updateError) throw new Error(`Error updating metadata: ${updateError.message}`);

  return publicUrl;
};

export const updateUserInfo = async (data: { full_name?: string }): Promise<void> => {
  const { error } = await supabase.auth.updateUser({
    data: data
  });

  if (error) throw new Error(`Error updating user info: ${error.message}`);
};
