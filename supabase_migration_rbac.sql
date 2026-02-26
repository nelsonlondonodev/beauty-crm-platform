-- ==============================================================================
-- MIGRACIÓN DE ROLES Y PERMISOS (RBAC)
-- Objetivo: Crear una tabla para asignar roles a los usuarios autenticados
-- y dejar de depender de correos electrónicos en duro en el código frontend.
-- ==============================================================================

-- 1. Crear el TIPO de dato enumerado para los roles soportados
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'staff');

-- 2. Crear la tabla de user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id) -- Un usuario solo puede tener un rol primario en este sistema
);

-- 3. Habilitar Row Level Security en la nueva tabla
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Crear Política: Los usuarios autenticados pueden ver ÚNICAMENTE SU PROPIO ROL
CREATE POLICY "Usuarios pueden ver su propio rol" ON public.user_roles
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Opcional (Depende de tu flujo futuro): Los owners podrían ver y cambiar los roles de otros
-- Pero por ahora, para mantenerlo súper seguro, las asignaciones de rol se harán
-- manualmente en el panel de Supabase desde el SQL Editor o Table Editor.

-- ==============================================================================
-- 5. ASIGNAR TU USUARIO ACTUAL COMO DUEÑO (OWNER)
-- Reemplaza '7de4c9ac-6897-4f0f-9989-e38ed9629bdc' con tu UUID si es diferente.
-- Al ejecutar esto, tendrás acceso maestro (Dashboard y Configuración).
-- ==============================================================================

INSERT INTO public.user_roles (user_id, role)
VALUES ('7de4c9ac-6897-4f0f-9989-e38ed9629bdc', 'owner')
ON CONFLICT (user_id) DO UPDATE SET role = 'owner';
