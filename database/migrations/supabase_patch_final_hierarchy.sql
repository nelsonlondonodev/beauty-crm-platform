-- ==============================================================================
-- PARCHE FINAL: VÍNCULO DE STAFF CON OWNER Y RLS COMPARTIDO
-- Ejecuta este script completo en el SQL Editor de Supabase.
-- ==============================================================================

-- 1. AGREGAR COLUMNA DE TENANT (Si no existe)
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES auth.users(id);

-- 2. ASIGNAR TENANTS A LOS USUARIOS ACTUALES
-- Tu nuevo OWNER (nelsonlo2682@gmail.com)
UPDATE public.user_roles 
SET tenant_id = 'dda1a738-a9cf-4a70-8343-bce886cf1fa2' 
WHERE user_id = 'dda1a738-a9cf-4a70-8343-bce886cf1fa2';

-- Tu STAFF (selonel26@gmail.com) vinculado al salón del nuevo OWNER
UPDATE public.user_roles 
SET tenant_id = 'dda1a738-a9cf-4a70-8343-bce886cf1fa2' 
WHERE user_id = 'a703d5de-ef7a-4706-9c1b-edd8728e2d66';

-- Para el SuperAdmin, podemos dejar el tenant_id opcional o asignarle uno por defecto
UPDATE public.user_roles 
SET tenant_id = user_id 
WHERE role = 'superadmin' AND tenant_id IS NULL;

-- 3. FUNCIÓN MAESTRA PARA OBTENER EL TENANT DEL USUARIO ACTUAL
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 4. ACTUALIZAR POLÍTICAS RLS PARA PERMITIR ACCESO COMPARTIDO (OWNER + STAFF)
-- Estas políticas permiten que el SuperAdmin vea todo, y que Owner/Staff vean lo de su salón.

-- Clientes
DROP POLICY IF EXISTS "Tenant Isolation: Clientes" ON public.clientes_fidelizacion;
CREATE POLICY "Tenant Isolation: Clientes" ON public.clientes_fidelizacion 
    FOR ALL TO authenticated 
    USING (is_superadmin() OR user_id = get_my_tenant_id()) 
    WITH CHECK (is_superadmin() OR user_id = get_my_tenant_id());

-- Bonos
DROP POLICY IF EXISTS "Tenant Isolation: Bonos" ON public.bonos;
CREATE POLICY "Tenant Isolation: Bonos" ON public.bonos 
    FOR ALL TO authenticated 
    USING (is_superadmin() OR user_id = get_my_tenant_id()) 
    WITH CHECK (is_superadmin() OR user_id = get_my_tenant_id());

-- Citas (Appointments)
DROP POLICY IF EXISTS "Tenant Isolation: Citas" ON public.appointments;
CREATE POLICY "Tenant Isolation: Citas" ON public.appointments 
    FOR ALL TO authenticated 
    USING (is_superadmin() OR user_id = get_my_tenant_id()) 
    WITH CHECK (is_superadmin() OR user_id = get_my_tenant_id());

-- Facturas
DROP POLICY IF EXISTS "Tenant Isolation: Facturas" ON public.facturas;
CREATE POLICY "Tenant Isolation: Facturas" ON public.facturas 
    FOR ALL TO authenticated 
    USING (is_superadmin() OR user_id = get_my_tenant_id()) 
    WITH CHECK (is_superadmin() OR user_id = get_my_tenant_id());

-- Empleados
DROP POLICY IF EXISTS "Tenant Isolation: Empleados" ON public.empleados;
CREATE POLICY "Tenant Isolation: Empleados" ON public.empleados 
    FOR ALL TO authenticated 
    USING (is_superadmin() OR user_id = get_my_tenant_id()) 
    WITH CHECK (is_superadmin() OR user_id = get_my_tenant_id());

-- Roles (Permitir lectura propia)
DROP POLICY IF EXISTS "Usuarios pueden ver su propio rol" ON public.user_roles;
CREATE POLICY "Usuarios pueden ver su propio rol" ON public.user_roles
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 5. OPCIONAL: TRANSFERIR DATOS CREADOS ANTERIORMENTE AL NUEVO OWNER
-- Ejecuta esto solo si quieres que el nuevo owner herede los datos que creaste antes.
-- UPDATE public.clientes_fidelizacion SET user_id = 'dda1a738-a9cf-4a70-8343-bce886cf1fa2';
-- UPDATE public.bonos SET user_id = 'dda1a738-a9cf-4a70-8343-bce886cf1fa2';
-- UPDATE public.appointments SET user_id = 'dda1a738-a9cf-4a70-8343-bce886cf1fa2';
-- UPDATE public.facturas SET user_id = 'dda1a738-a9cf-4a70-8343-bce886cf1fa2';
-- UPDATE public.empleados SET user_id = 'dda1a738-a9cf-4a70-8343-bce886cf1fa2';
