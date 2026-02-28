-- ==========================================
-- CONFIGURACIÓN DE STORAGE PARA AVATARES
-- ==========================================

-- 1. Crear el bucket 'avatars' como PÚBLICO
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Eliminar políticas previas si existen (evita errores al re-ejecutar)
DROP POLICY IF EXISTS "Avatar upload for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Avatar view for everyone" ON storage.objects;
DROP POLICY IF EXISTS "Avatar update/delete for owner" ON storage.objects;

-- 3. Política: Permitir subida a usuarios autenticados
-- Restringe a que solo puedan subir al bucket 'avatars'
CREATE POLICY "Avatar upload for authenticated users"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Política: Acceso de lectura pública (ya que el bucket es public:true)
CREATE POLICY "Avatar view for everyone"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 5. Política: Permitir que el dueño actualice o elimine su propia foto
CREATE POLICY "Avatar update/delete for owner"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
