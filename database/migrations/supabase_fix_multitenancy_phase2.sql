-- ==============================================================================
-- PARCHE FINAL DE MULTI-TENANCY: FASE 2 (RPC y CONFIGURACIÓN)
-- Objetivo: Refinar el RPC de facturación y las políticas de tenant_config
-- para asegurar que el personal (Staff) tenga acceso a la configuración del salón.
-- ==============================================================================

-- 1. ACTUALIZAR RLS PARA tenant_config
-- Permitir que cualquier usuario vea la configuración si su tenant_id coincide con el user_id de la config.
ALTER TABLE public.tenant_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant config access" ON public.tenant_config;
CREATE POLICY "Tenant config access" ON public.tenant_config
    FOR ALL TO authenticated
    USING (public.is_superadmin() OR user_id = public.get_my_tenant_id())
    WITH CHECK (public.is_superadmin() OR user_id = public.get_my_tenant_id());

-- 2. ACTUALIZAR RLS PARA user_roles
DROP POLICY IF EXISTS "Usuarios pueden ver su propio rol" ON public.user_roles;
CREATE POLICY "Usuarios pueden ver su propio rol" ON public.user_roles
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR tenant_id = public.get_my_tenant_id());

-- 3. ACTUALIZAR RPC DE FACTURACIÓN (Asegurar que sea Multi-Tenant)
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
        user_id,
        tenant_id,
        cliente_id,
        subtotal,
        descuento,
        total,
        metodo_pago
    ) VALUES (
        auth.uid(),
        v_my_tenant_id,
        p_cliente_id,
        p_subtotal,
        p_descuento,
        p_total,
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
            user_id,
            tenant_id,
            factura_id,
            empleado_id,
            descripcion,
            cantidad,
            precio_unitario,
            precio_total,
            comision_monto
        ) VALUES (
            auth.uid(),
            v_my_tenant_id,
            v_factura_id,
            v_empleado_id,
            v_item->>'description',
            (v_item->>'quantity')::INTEGER,
            (v_item->>'price')::NUMERIC,
            v_precio_bruto_total,
            v_comision_monto
        );
    END LOOP;

    IF p_bono_id IS NOT NULL THEN
        UPDATE public.bonos
        SET estado = 'Canjeado',
            fecha_canje = timezone('utc'::text, now())
        WHERE id = p_bono_id AND client_id = p_cliente_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'factura_id', v_factura_id);
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al procesar la factura: %', SQLERRM;
END;
$$;
