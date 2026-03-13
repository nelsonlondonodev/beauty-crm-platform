-- ==============================================================================
-- PARCHE: AGREGAR ROL SUPERADMIN Y AJUSTAR RLS
-- Objetivo: Permitir que el sistema reconozca el rol 'superadmin' en la base de datos
-- y asegurar que este rol tenga acceso global.
-- ==============================================================================

-- 1. Agregar el valor 'superadmin' al enumerado app_role
-- Nota: En Postgres (Supabase), los valores de ENUM se agregan así.
-- Si recibes un error de "ALTER TYPE ... ADD VALUE cannot run inside a transaction block",
-- ejecútalo fuera de un BEGIN/COMMIT si estás haciéndolo manualmente.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'superadmin';

-- 2. Actualizar políticas de RLS para dar acceso global al SuperAdmin
-- Actualmente las políticas usan (auth.uid() = user_id).
-- Para que el SuperAdmin pueda ver TODO, necesitamos checkear su rol.

-- Función helper para verificar si el usuario es superadmin de forma eficiente
-- Usamos SECURITY DEFINER para evitar problemas de recursión en RLS
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'superadmin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Actualizar políticas de Tenant Isolation para incluir bypass de SuperAdmin
-- (Ejemplo con Clientes, repetir para otras tablas críticas si es necesario)

DROP POLICY IF EXISTS "Tenant Isolation: Clientes" ON public.clientes_fidelizacion;
CREATE POLICY "Tenant Isolation: Clientes" ON public.clientes_fidelizacion 
    FOR ALL TO authenticated 
    USING (auth.uid() = user_id OR public.is_superadmin()) 
    WITH CHECK (auth.uid() = user_id OR public.is_superadmin());

DROP POLICY IF EXISTS "Tenant Isolation: Facturas" ON public.facturas;
CREATE POLICY "Tenant Isolation: Facturas" ON public.facturas 
    FOR ALL TO authenticated 
    USING (auth.uid() = user_id OR public.is_superadmin()) 
    WITH CHECK (auth.uid() = user_id OR public.is_superadmin());

-- Nota: Para este MVP, el SuperAdmin solo necesita ver el Dashboard Global. 
-- Si se requiere que gestione salones ajenos, activaríamos las políticas de arriba para todas las tablas.

-- 4. INSERTAR/ACTUALIZAR USUARIO SUPERADMIN (OPCIONAL/MANUAL)
-- Reemplaza 'TU_UUID' con el ID del usuario que quieres que sea SuperAdmin.
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('TU_UUID', 'superadmin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin';
