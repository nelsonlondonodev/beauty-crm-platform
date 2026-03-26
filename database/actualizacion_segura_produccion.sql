-- ==============================================================================
-- ACTUALIZACIÓN ATÓMICA Y SEGURA PARA PRODUCCIÓN "NARBO'S PRO"
-- Este script NO BORRA DATOS. Solo añade la infraestructura SaaS faltante.
-- ==============================================================================

-- 1. Crear Tipo de Rol (Maneja el error en silencio si ya existe)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'staff', 'superadmin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tabla Base de Seguridad y Configuración
CREATE TABLE IF NOT EXISTS public.tenant_config (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_name TEXT DEFAULT 'Mi Salón',
    tagline TEXT,
    support_email TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    commission_policy TEXT DEFAULT 'gross'
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id UUID,
    UNIQUE(user_id)
);

DO $$ BEGIN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenant_config(user_id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Crear Nuevas Tablas del CRM (Si no existían en la versión vieja de Producción)
CREATE TABLE IF NOT EXISTS public.bonos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clientes_fidelizacion(id) ON DELETE CASCADE,
    codigo TEXT UNIQUE NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'Bienvenida',
    estado TEXT NOT NULL DEFAULT 'Pendiente',
    fecha_vencimiento TIMESTAMP WITH TIME ZONE,
    fecha_canje TIMESTAMP WITH TIME ZONE,
    user_id UUID DEFAULT auth.uid(),
    tenant_id UUID
);

CREATE TABLE IF NOT EXISTS public.empleados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL,
    comision_porcentaje NUMERIC NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID DEFAULT auth.uid(),
    tenant_id UUID
);

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    fecha_cita TIMESTAMP WITH TIME ZONE NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clientes_fidelizacion(id) ON DELETE CASCADE,
    servicio TEXT NOT NULL,
    estado TEXT DEFAULT 'programada',
    pago_estado TEXT DEFAULT 'pendiente',
    empleado_id UUID REFERENCES public.empleados(id) ON DELETE SET NULL,
    user_id UUID DEFAULT auth.uid(),
    tenant_id UUID
);

CREATE TABLE IF NOT EXISTS public.facturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes_fidelizacion(id) ON DELETE SET NULL,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    descuento NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    fecha_venta TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    user_id UUID DEFAULT auth.uid(),
    tenant_id UUID
);

-- 4. Modificar la Tabla de Clientes Vieja (Para que hable con el Multi-tenant)
ALTER TABLE public.clientes_fidelizacion ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE public.clientes_fidelizacion ADD COLUMN IF NOT EXISTS birthday DATE;

-- Migración segura de cupones viejos a la tabla nueva (Solo si tenían la estructura vieja)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='clientes_fidelizacion' AND column_name='codigo_descuento') THEN 
        INSERT INTO public.bonos (created_at, client_id, codigo, tipo, estado, fecha_canje)
        SELECT created_at, id as client_id, codigo_descuento, 'Bienvenida' as tipo, CASE WHEN canjeado = true THEN 'Canjeado' ELSE 'Pendiente' END as estado, fecha_canje
        FROM public.clientes_fidelizacion WHERE codigo_descuento IS NOT NULL ON CONFLICT (codigo) DO NOTHING;
        
        ALTER TABLE public.clientes_fidelizacion DROP COLUMN IF EXISTS codigo_descuento, DROP COLUMN IF EXISTS canjeado, DROP COLUMN IF EXISTS fecha_canje;
    END IF;
END $$;

-- 5. Funciones atómicas de seguridad actualizadas al estándar de hoy
CREATE OR REPLACE FUNCTION public.get_my_tenant_id() RETURNS UUID AS $$ SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid(); $$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
CREATE OR REPLACE FUNCTION public.is_superadmin() RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'superadmin'); END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. RLS Habilitado para protección de datos
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes_fidelizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden ver su propio rol" ON public.user_roles;
CREATE POLICY "Usuarios pueden ver su propio rol" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "Tenant config access" ON public.tenant_config;
CREATE POLICY "Tenant config access" ON public.tenant_config FOR ALL TO authenticated USING (public.is_superadmin() OR user_id = public.get_my_tenant_id()) WITH CHECK (public.is_superadmin() OR user_id = public.get_my_tenant_id());
