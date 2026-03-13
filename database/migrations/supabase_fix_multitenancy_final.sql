-- ==============================================================================
-- PARCHE FINAL DE MULTI-TENANCY: UNIFICACIÓN POR TENANT_ID
-- Objetivo: Asegurar que todos los registros pertenezcan al Salón (Tenant)
-- y no solo al usuario individual, permitiendo visibilidad compartida.
-- ==============================================================================

-- 1. ASEGURAR COLUMNA tenant_id EN TODAS LAS TABLAS CRÍTICAS
DO $$ 
BEGIN 
    -- Clientes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clientes_fidelizacion' AND column_name='tenant_id') THEN
        ALTER TABLE public.clientes_fidelizacion ADD COLUMN tenant_id UUID REFERENCES auth.users(id);
    END IF;
    -- Bonos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bonos' AND column_name='tenant_id') THEN
        ALTER TABLE public.bonos ADD COLUMN tenant_id UUID REFERENCES auth.users(id);
    END IF;
    -- Empleados
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='empleados' AND column_name='tenant_id') THEN
        ALTER TABLE public.empleados ADD COLUMN tenant_id UUID REFERENCES auth.users(id);
    END IF;
    -- Facturas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facturas' AND column_name='tenant_id') THEN
        ALTER TABLE public.facturas ADD COLUMN tenant_id UUID REFERENCES auth.users(id);
    END IF;
    -- Factura Items
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='factura_items' AND column_name='tenant_id') THEN
        ALTER TABLE public.factura_items ADD COLUMN tenant_id UUID REFERENCES auth.users(id);
    END IF;
    -- Pagos Comisiones
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pagos_comisiones' AND column_name='tenant_id') THEN
        ALTER TABLE public.pagos_comisiones ADD COLUMN tenant_id UUID REFERENCES auth.users(id);
    END IF;
    -- Citas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='tenant_id') THEN
        ALTER TABLE public.appointments ADD COLUMN tenant_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. FUNCIÓN PARA OBTENER EL TENANT_ID DEL USUARIO ACTUAL (REFORZADA)
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 3. ASIGNAR tenant_id POR DEFECTO AUTOMÁTICAMENTE
-- Esto garantiza que CUALQUIER registro creado tenga el ID del salón, no del usuario.
ALTER TABLE public.clientes_fidelizacion ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.bonos ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.empleados ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.facturas ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.factura_items ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.pagos_comisiones ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.appointments ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();

-- 4. MIGRACIÓN DE DATOS EXISTENTES (Recuperar visibilidad)
-- Seteamos el tenant_id actual del salón conocido para los registros que tengan el user_id del owner o staff.
-- Owner: dda1a738-a9cf-4a70-8343-bce886cf1fa2
-- Staff: a703d5de-ef7a-4706-9c1b-edd8728e2d66
-- Registros antiguos hardcoded: 7de4c9ac-6897-4f0f-9989-e38ed9629bdc

DO $$
DECLARE
    target_tenant UUID := 'dda1a738-a9cf-4a70-8343-bce886cf1fa2';
BEGIN
    UPDATE public.clientes_fidelizacion SET tenant_id = target_tenant WHERE tenant_id IS NULL OR user_id IN (target_tenant, 'a703d5de-ef7a-4706-9c1b-edd8728e2d66', '7de4c9ac-6897-4f0f-9989-e38ed9629bdc');
    UPDATE public.bonos SET tenant_id = target_tenant WHERE tenant_id IS NULL OR user_id IN (target_tenant, 'a703d5de-ef7a-4706-9c1b-edd8728e2d66', '7de4c9ac-6897-4f0f-9989-e38ed9629bdc');
    UPDATE public.empleados SET tenant_id = target_tenant WHERE tenant_id IS NULL OR user_id IN (target_tenant, 'a703d5de-ef7a-4706-9c1b-edd8728e2d66', '7de4c9ac-6897-4f0f-9989-e38ed9629bdc');
    UPDATE public.facturas SET tenant_id = target_tenant WHERE tenant_id IS NULL OR user_id IN (target_tenant, 'a703d5de-ef7a-4706-9c1b-edd8728e2d66', '7de4c9ac-6897-4f0f-9989-e38ed9629bdc');
    UPDATE public.factura_items SET tenant_id = target_tenant WHERE tenant_id IS NULL OR user_id IN (target_tenant, 'a703d5de-ef7a-4706-9c1b-edd8728e2d66', '7de4c9ac-6897-4f0f-9989-e38ed9629bdc');
    UPDATE public.pagos_comisiones SET tenant_id = target_tenant WHERE tenant_id IS NULL OR user_id IN (target_tenant, 'a703d5de-ef7a-4706-9c1b-edd8728e2d66', '7de4c9ac-6897-4f0f-9989-e38ed9629bdc');
    UPDATE public.appointments SET tenant_id = target_tenant WHERE tenant_id IS NULL OR user_id IN (target_tenant, 'a703d5de-ef7a-4706-9c1b-edd8728e2d66', '7de4c9ac-6897-4f0f-9989-e38ed9629bdc');
END $$;

-- 5. ACTUALIZAR POLÍTICAS RLS (Usar tenant_id en lugar de user_id)
-- Esto permite que cualquier usuario cuyo user_roles.tenant_id coincida con el registro pueda verlo.

-- Clientes
DROP POLICY IF EXISTS "Tenant Isolation: Clientes" ON public.clientes_fidelizacion;
CREATE POLICY "Tenant Isolation: Clientes" ON public.clientes_fidelizacion 
    FOR ALL TO authenticated 
    USING (public.is_superadmin() OR tenant_id = public.get_my_tenant_id()) 
    WITH CHECK (public.is_superadmin() OR tenant_id = public.get_my_tenant_id());

-- Bonos
DROP POLICY IF EXISTS "Tenant Isolation: Bonos" ON public.bonos;
CREATE POLICY "Tenant Isolation: Bonos" ON public.bonos 
    FOR ALL TO authenticated 
    USING (public.is_superadmin() OR tenant_id = public.get_my_tenant_id()) 
    WITH CHECK (public.is_superadmin() OR tenant_id = public.get_my_tenant_id());

-- Citas
DROP POLICY IF EXISTS "Tenant Isolation: Citas" ON public.appointments;
CREATE POLICY "Tenant Isolation: Citas" ON public.appointments 
    FOR ALL TO authenticated 
    USING (public.is_superadmin() OR tenant_id = public.get_my_tenant_id()) 
    WITH CHECK (public.is_superadmin() OR tenant_id = public.get_my_tenant_id());

-- Facturas
DROP POLICY IF EXISTS "Tenant Isolation: Facturas" ON public.facturas;
CREATE POLICY "Tenant Isolation: Facturas" ON public.facturas 
    FOR ALL TO authenticated 
    USING (public.is_superadmin() OR tenant_id = public.get_my_tenant_id()) 
    WITH CHECK (public.is_superadmin() OR tenant_id = public.get_my_tenant_id());

-- Factura Items
DROP POLICY IF EXISTS "Tenant Isolation: Factura_items" ON public.factura_items;
CREATE POLICY "Tenant Isolation: Factura_items" ON public.factura_items 
    FOR ALL TO authenticated 
    USING (public.is_superadmin() OR tenant_id = public.get_my_tenant_id()) 
    WITH CHECK (public.is_superadmin() OR tenant_id = public.get_my_tenant_id());

-- Empleados
DROP POLICY IF EXISTS "Tenant Isolation: Empleados" ON public.empleados;
CREATE POLICY "Tenant Isolation: Empleados" ON public.empleados 
    FOR ALL TO authenticated 
    USING (public.is_superadmin() OR tenant_id = public.get_my_tenant_id()) 
    WITH CHECK (public.is_superadmin() OR tenant_id = public.get_my_tenant_id());

-- Pagos Comisiones
DROP POLICY IF EXISTS "Tenant Isolation: Pagos" ON public.pagos_comisiones;
CREATE POLICY "Tenant Isolation: Pagos" ON public.pagos_comisiones 
    FOR ALL TO authenticated 
    USING (public.is_superadmin() OR tenant_id = public.get_my_tenant_id()) 
    WITH CHECK (public.is_superadmin() OR tenant_id = public.get_my_tenant_id());

-- 6. VERIFICACIÓN DE SEGURIDAD (search_path)
ALTER FUNCTION public.get_my_tenant_id() SET search_path = public;
ALTER FUNCTION public.is_superadmin() SET search_path = public;
