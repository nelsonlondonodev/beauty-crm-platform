-- ==============================================================================
-- MIGRACIÓN DE SEGURIDAD (RLS) MULTI-TENANT
-- Objetivo: Restringir el acceso a los datos de forma que cada usuario 
-- (dueño de salón/SaaS tenant) solo pueda leer, editar y eliminar su propia data.
-- ==============================================================================

-- 1. Agregar la columna 'user_id' a todas las tablas para asociarlas a auth.users
-- Nota: Usamos gen_random_uuid() como fallback, pero principalmente auth.uid() se encargará de llenarlo automáticamente cuando se inserte desde la API.
ALTER TABLE public.clientes_fidelizacion ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE public.bonos ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE public.empleados ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE public.facturas ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE public.factura_items ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE public.pagos_comisiones ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();

-- OPCIONAL: Si ya tienes registros existentes (ej: Narbo's) y quieres asignarlos
-- a tu usuario administrador maestro actual, comenta las siguientes líneas y reemplaza
-- "TU-USER-ID" por el ID actual de tu usuario en Supabase (Auth -> Users).
UPDATE public.clientes_fidelizacion SET user_id = '7de4c9ac-6897-4f0f-9989-e38ed9629bdc';
UPDATE public.bonos SET user_id = '7de4c9ac-6897-4f0f-9989-e38ed9629bdc';
UPDATE public.empleados SET user_id = '7de4c9ac-6897-4f0f-9989-e38ed9629bdc';
UPDATE public.facturas SET user_id = '7de4c9ac-6897-4f0f-9989-e38ed9629bdc';
UPDATE public.factura_items SET user_id = '7de4c9ac-6897-4f0f-9989-e38ed9629bdc';
UPDATE public.pagos_comisiones SET user_id = '7de4c9ac-6897-4f0f-9989-e38ed9629bdc';
UPDATE public.appointments SET user_id = '7de4c9ac-6897-4f0f-9989-e38ed9629bdc';

-- 2. Eliminar las políticas inseguras y permisivas antiguas
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON public.empleados;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON public.facturas;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON public.factura_items;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON public.pagos_comisiones;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.appointments;

-- Nota: Si tienes políticas nombradas diferente en clientes y bonos, elimínalas también.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.clientes_fidelizacion;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.clientes_fidelizacion;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.bonos;

-- 3. Asegurar que RLS esté habilitado en todas las tablas
ALTER TABLE public.clientes_fidelizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factura_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_comisiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 4. Crear las nuevas políticas estrictas de Tenant (Multi-inquilino)
-- Solo se pueden hacer operaciones si auth.uid() coincide con el user_id de la fila.

-- Empleados
CREATE POLICY "Tenant Isolation: Empleados" ON public.empleados 
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Facturas
CREATE POLICY "Tenant Isolation: Facturas" ON public.facturas 
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Factura Items
CREATE POLICY "Tenant Isolation: Factura_items" ON public.factura_items 
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Pagos Comisiones
CREATE POLICY "Tenant Isolation: Pagos" ON public.pagos_comisiones 
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Citas (Appointments)
CREATE POLICY "Tenant Isolation: Citas" ON public.appointments 
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Clientes Fidelización
CREATE POLICY "Tenant Isolation: Clientes" ON public.clientes_fidelizacion 
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Bonos
CREATE POLICY "Tenant Isolation: Bonos" ON public.bonos 
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- IMPORTANTE PARA N8N: 
-- n8n utiliza generalmente el token Service Role, el cual hace bypass de RLS 
-- y tendrá acceso completo. Si tu n8n usa tokens de API del lado del cliente,
-- fallará, y requerirás enviarle el JWT de tu usuario o crear APIs Edge de Supabase.
-- ==============================================================================
