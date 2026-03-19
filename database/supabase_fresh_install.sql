-- ==============================================================================
-- SCHEMA COMPLETO: LONDY CRM - FRESH INSTALL
-- Última actualización: 2026-03-19
--
-- Ejecutar en el SQL Editor de un proyecto Supabase NUEVO.
-- Este script crea TODO el esquema necesario desde cero:
--   - Tablas de datos
--   - Roles y RBAC
--   - Multi-tenancy (tenant_config + user_roles)
--   - RLS y políticas de seguridad
--   - Funciones RPC (facturación atómica)
--   - Storage para avatares
-- ==============================================================================

-- =====================
-- 1. TABLAS BASE
-- =====================

-- 1.1 Clientes
CREATE TABLE public.clientes_fidelizacion (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nombre TEXT NOT NULL,
    email TEXT,
    whatsapp TEXT NOT NULL,
    birthday DATE,
    user_id UUID DEFAULT auth.uid(),
    tenant_id UUID
);

-- 1.2 Bonos de fidelización
CREATE TABLE public.bonos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clientes_fidelizacion(id) ON DELETE CASCADE,
    codigo TEXT UNIQUE NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'Bienvenida' CHECK (tipo IN ('Bienvenida', 'Cumpleaños', 'Reactivacion', 'Especial')),
    estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Canjeado', 'Expirado')),
    fecha_vencimiento TIMESTAMP WITH TIME ZONE,
    fecha_canje TIMESTAMP WITH TIME ZONE,
    user_id UUID DEFAULT auth.uid(),
    tenant_id UUID
);

-- 1.3 Empleados
CREATE TABLE public.empleados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL,
    comision_porcentaje NUMERIC NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID DEFAULT auth.uid(),
    tenant_id UUID
);

-- 1.4 Citas (Appointments)
CREATE TABLE public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    fecha_cita TIMESTAMP WITH TIME ZONE NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clientes_fidelizacion(id) ON DELETE CASCADE,
    servicio TEXT NOT NULL,
    estado TEXT DEFAULT 'programada' CHECK (estado IN ('programada', 'confirmada', 'completada', 'cancelada')),
    pago_estado TEXT DEFAULT 'pendiente' CHECK (pago_estado IN ('pendiente', 'pagado')),
    nota TEXT,
    empleado_id UUID REFERENCES public.empleados(id) ON DELETE SET NULL,
    duracion_minutos INTEGER DEFAULT 60,
    notas TEXT,
    reminder_24h_sent BOOLEAN DEFAULT FALSE,
    reminder_2h_sent BOOLEAN DEFAULT FALSE,
    user_id UUID DEFAULT auth.uid(),
    tenant_id UUID
);

CREATE INDEX IF NOT EXISTS idx_appointments_empleado ON public.appointments(empleado_id);

-- 1.5 Facturas
CREATE TABLE public.facturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes_fidelizacion(id) ON DELETE SET NULL,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    descuento NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    metodo_pago TEXT,
    fecha_venta TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    user_id UUID DEFAULT auth.uid(),
    tenant_id UUID
);

CREATE INDEX IF NOT EXISTS idx_facturas_appointment_id ON public.facturas(appointment_id);
COMMENT ON COLUMN public.facturas.appointment_id IS 'ID de la cita reservada en el calendario, para cruce automático.';

-- 1.6 Factura Items
CREATE TABLE public.factura_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factura_id UUID NOT NULL REFERENCES public.facturas(id) ON DELETE CASCADE,
    empleado_id UUID REFERENCES public.empleados(id) ON DELETE SET NULL,
    descripcion TEXT NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario NUMERIC NOT NULL DEFAULT 0,
    precio_total NUMERIC NOT NULL DEFAULT 0,
    comision_monto NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID DEFAULT auth.uid(),
    tenant_id UUID
);

-- 1.7 Pagos de Comisiones
CREATE TABLE public.pagos_comisiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID NOT NULL REFERENCES public.empleados(id) ON DELETE CASCADE,
    monto_pagado NUMERIC NOT NULL,
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notas TEXT,
    user_id UUID DEFAULT auth.uid(),
    tenant_id UUID
);

-- =====================
-- 2. RBAC (Roles)
-- =====================

-- 2.1 Tipo enum para roles
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'staff', 'superadmin');

-- 2.2 Tabla de roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id UUID,
    UNIQUE(user_id)
);

-- =====================
-- 3. TENANT CONFIG (Marca Blanca)
-- =====================

CREATE TABLE public.tenant_config (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_name TEXT DEFAULT 'Londy',
    tagline TEXT DEFAULT 'Beauty Industry CRM',
    support_email TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    commission_policy TEXT DEFAULT 'gross' CHECK (commission_policy IN ('gross', 'net'))
);

COMMENT ON COLUMN public.tenant_config.commission_policy IS 'Define si las comisiones se calculan sobre el total bruto o sobre el neto después de descuentos.';

-- 3.1 FK de user_roles.tenant_id → tenant_config (para JOINs de SuperAdmin)
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_tenant_id_fkey
FOREIGN KEY (tenant_id) REFERENCES public.tenant_config(user_id) ON DELETE CASCADE;

-- =====================
-- 4. FUNCIONES DE SEGURIDAD (SECURITY DEFINER)
-- =====================

-- 4.1 Verificar si el usuario es superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'superadmin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4.2 Obtener el tenant_id del usuario actual
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- =====================
-- 5. DEFAULTS AUTOMÁTICOS (tenant_id)
-- =====================

ALTER TABLE public.clientes_fidelizacion ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.bonos ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.empleados ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.facturas ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.factura_items ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.pagos_comisiones ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.appointments ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();

-- =====================
-- 6. RLS Y POLÍTICAS
-- =====================

-- 6.1 Habilitar RLS en todas las tablas
ALTER TABLE public.clientes_fidelizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factura_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_comisiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_config ENABLE ROW LEVEL SECURITY;

-- 6.2 Políticas Multi-Tenant (Superadmin ve todo, otros ven su salón)
CREATE POLICY "Tenant Isolation: Clientes" ON public.clientes_fidelizacion
    FOR ALL TO authenticated
    USING (public.is_superadmin() OR tenant_id = public.get_my_tenant_id())
    WITH CHECK (public.is_superadmin() OR tenant_id = public.get_my_tenant_id());

CREATE POLICY "Tenant Isolation: Bonos" ON public.bonos
    FOR ALL TO authenticated
    USING (public.is_superadmin() OR tenant_id = public.get_my_tenant_id())
    WITH CHECK (public.is_superadmin() OR tenant_id = public.get_my_tenant_id());

CREATE POLICY "Tenant Isolation: Empleados" ON public.empleados
    FOR ALL TO authenticated
    USING (public.is_superadmin() OR tenant_id = public.get_my_tenant_id())
    WITH CHECK (public.is_superadmin() OR tenant_id = public.get_my_tenant_id());

CREATE POLICY "Tenant Isolation: Citas" ON public.appointments
    FOR ALL TO authenticated
    USING (public.is_superadmin() OR tenant_id = public.get_my_tenant_id())
    WITH CHECK (public.is_superadmin() OR tenant_id = public.get_my_tenant_id());

CREATE POLICY "Tenant Isolation: Facturas" ON public.facturas
    FOR ALL TO authenticated
    USING (public.is_superadmin() OR tenant_id = public.get_my_tenant_id())
    WITH CHECK (public.is_superadmin() OR tenant_id = public.get_my_tenant_id());

CREATE POLICY "Tenant Isolation: Factura_items" ON public.factura_items
    FOR ALL TO authenticated
    USING (public.is_superadmin() OR tenant_id = public.get_my_tenant_id())
    WITH CHECK (public.is_superadmin() OR tenant_id = public.get_my_tenant_id());

CREATE POLICY "Tenant Isolation: Pagos" ON public.pagos_comisiones
    FOR ALL TO authenticated
    USING (public.is_superadmin() OR tenant_id = public.get_my_tenant_id())
    WITH CHECK (public.is_superadmin() OR tenant_id = public.get_my_tenant_id());

-- 6.3 Política de user_roles (ver propio + compañeros del mismo tenant)
CREATE POLICY "Usuarios pueden ver su propio rol" ON public.user_roles
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR tenant_id = public.get_my_tenant_id());

-- 6.4 Política de tenant_config
CREATE POLICY "Tenant config access" ON public.tenant_config
    FOR ALL TO authenticated
    USING (public.is_superadmin() OR user_id = public.get_my_tenant_id())
    WITH CHECK (public.is_superadmin() OR user_id = public.get_my_tenant_id());

-- =====================
-- 7. RPC: FACTURACIÓN ATÓMICA
-- =====================

CREATE OR REPLACE FUNCTION public.procesar_factura_completa(
    p_cliente_id UUID,
    p_subtotal NUMERIC,
    p_descuento NUMERIC,
    p_total NUMERIC,
    p_metodo_pago TEXT,
    p_items JSONB,
    p_bono_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_factura_id UUID;
    v_item JSONB;
    v_empleado_id UUID;
    v_comision_porcentaje NUMERIC;
    v_comision_monto NUMERIC;
    v_my_tenant_id UUID;
    v_commission_policy TEXT;
    v_ratio NUMERIC;
    v_precio_bruto_total NUMERIC;
    v_precio_base_comision NUMERIC;
BEGIN
    v_my_tenant_id := public.get_my_tenant_id();
    IF v_my_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No se pudo identificar el Tenant del usuario.';
    END IF;

    SELECT commission_policy INTO v_commission_policy
    FROM public.tenant_config
    WHERE user_id = v_my_tenant_id;

    IF v_commission_policy IS NULL THEN
        v_commission_policy := 'gross';
    END IF;

    INSERT INTO public.facturas (
        user_id, tenant_id, cliente_id, subtotal, descuento, total, metodo_pago
    ) VALUES (
        auth.uid(), v_my_tenant_id, p_cliente_id, p_subtotal, p_descuento, p_total,
        COALESCE(p_metodo_pago, 'Efectivo')
    ) RETURNING id INTO v_factura_id;

    IF p_subtotal > 0 THEN
        v_ratio := p_total / p_subtotal;
    ELSE
        v_ratio := 1;
    END IF;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_empleado_id := (v_item->>'empleado_id')::UUID;
        v_comision_porcentaje := 0;

        IF v_empleado_id IS NOT NULL THEN
            SELECT comision_porcentaje INTO v_comision_porcentaje
            FROM public.empleados
            WHERE id = v_empleado_id AND tenant_id = v_my_tenant_id;

            IF v_comision_porcentaje IS NULL THEN
                v_comision_porcentaje := 0;
            END IF;
        END IF;

        v_precio_bruto_total := (v_item->>'price')::NUMERIC * (v_item->>'quantity')::NUMERIC;

        IF v_commission_policy = 'net' THEN
            v_precio_base_comision := v_precio_bruto_total * v_ratio;
        ELSE
            v_precio_base_comision := v_precio_bruto_total;
        END IF;

        v_comision_monto := v_precio_base_comision * (v_comision_porcentaje / 100);

        INSERT INTO public.factura_items (
            user_id, tenant_id, factura_id, empleado_id,
            descripcion, cantidad, precio_unitario, precio_total, comision_monto
        ) VALUES (
            auth.uid(), v_my_tenant_id, v_factura_id, v_empleado_id,
            v_item->>'description', (v_item->>'quantity')::INTEGER,
            (v_item->>'price')::NUMERIC, v_precio_bruto_total, v_comision_monto
        );
    END LOOP;

    IF p_bono_id IS NOT NULL THEN
        UPDATE public.bonos
        SET estado = 'Canjeado', fecha_canje = timezone('utc'::text, now())
        WHERE id = p_bono_id AND client_id = p_cliente_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'factura_id', v_factura_id);
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al procesar la factura: %', SQLERRM;
END;
$$;

-- =====================
-- 8. STORAGE (Avatares)
-- =====================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar upload for authenticated users"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Avatar view for everyone"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Avatar update/delete for owner"
ON storage.objects FOR ALL TO authenticated
USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================
-- 9. NOTIFICAR A POSTGREST
-- =====================
NOTIFY pgrst, 'reload schema';

-- ==============================================================================
-- 🎉 INSTALACIÓN COMPLETA
-- Siguiente paso: Crear usuarios de prueba y asignarles roles.
-- Ejecutar el script "supabase_dev_seed.sql" después de que los usuarios
-- se hayan registrado via Google OAuth.
-- ==============================================================================
