-- ==============================================================================
-- FIX: RELACIÓN PARA JOIN DE SUPERADMIN
-- Propósito: Permitir que PostgREST detecte la relación entre tenant_config y user_roles
-- para poder listar los salones y sus propietarios en el panel de SuperAdmin.
-- ==============================================================================

-- 1. Asegurar que tenant_config tenga una PK o Unique en user_id (PostgREST lo requiere para joins)
-- Normalmente user_id ya es la PK, pero lo reforzamos.
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name='tenant_config' AND constraint_type='PRIMARY KEY'
    ) THEN
        ALTER TABLE public.tenant_config ADD PRIMARY KEY (user_id);
    END IF;
END $$;

-- 2. Asegurar que todos los tenant_id en user_roles tengan una entrada en tenant_config
-- Esto evita el error de "insert or update violates foreign key constraint"
INSERT INTO public.tenant_config (user_id, brand_name)
SELECT DISTINCT tenant_id, 'Mi Salón'
FROM public.user_roles 
WHERE tenant_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- 3. Corregir la Clave Foránea en user_roles
-- Actualmente apunta a auth.users(id). La cambiamos para que apunte directamente a public.tenant_config(user_id).
-- Esto "enseña" a PostgREST cómo hacer el join automático.

ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_tenant_id_fkey;

ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_tenant_id_fkey 
FOREIGN KEY (tenant_id) REFERENCES public.tenant_config(user_id)
ON DELETE CASCADE;

-- 4. Recargar el esquema de PostgREST para que detecte el cambio inmediatamente
NOTIFY pgrst, 'reload schema';
