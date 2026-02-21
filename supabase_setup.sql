-- 1. Tabla: empleados
CREATE TABLE IF NOT EXISTS public.empleados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL,
    comision_porcentaje NUMERIC NOT NULL DEFAULT 0, -- ej. 30.00 para 30%
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla: facturas
CREATE TABLE IF NOT EXISTS public.facturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes_fidelizacion(id) ON DELETE SET NULL,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    descuento NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    metodo_pago TEXT,
    fecha_venta TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla: factura_items (los servicios individuales dentro de una factura)
CREATE TABLE IF NOT EXISTS public.factura_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factura_id UUID NOT NULL REFERENCES public.facturas(id) ON DELETE CASCADE,
    empleado_id UUID REFERENCES public.empleados(id) ON DELETE SET NULL, -- Quién hizo el servicio
    descripcion TEXT NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario NUMERIC NOT NULL DEFAULT 0,
    precio_total NUMERIC NOT NULL DEFAULT 0, -- cantidad * precio_unitario
    comision_monto NUMERIC NOT NULL DEFAULT 0, -- Calculado al momento de facturar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla: pagos_comisiones (Historial de pagos que se le hacen al empleado)
CREATE TABLE IF NOT EXISTS public.pagos_comisiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID NOT NULL REFERENCES public.empleados(id) ON DELETE CASCADE,
    monto_pagado NUMERIC NOT NULL,
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notas TEXT
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factura_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_comisiones ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad: Permitir a cualquier usuario autenticado ver y editar los datos
-- Nota: En un entorno de producción estricto, esto debería restringirse basado en roles de usuario.
-- Empleados
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.empleados FOR ALL TO authenticated USING (true);
-- Facturas
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.facturas FOR ALL TO authenticated USING (true);
-- Factura Items
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.factura_items FOR ALL TO authenticated USING (true);
-- Pagos Comisiones
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.pagos_comisiones FOR ALL TO authenticated USING (true);
