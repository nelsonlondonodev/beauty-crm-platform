-- =========================================================================================
-- FUNCIÓN RPC TRANSACCIONAL: procesar_factura_completa
-- =========================================================================================
-- Propósito: Garantizar atomicidad (Todo o Nada) al guardar una factura, sus items y el canje
-- de bono en una sola transacción SQL. Previene estados corruptos si la conexión falla a la mitad.

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
SECURITY DEFINER -- Ejecuta con privilegios del creador (owner), previene bucles de RLS
SET search_path = public
AS $$
DECLARE
    v_factura_id UUID;
    v_item JSONB;
    v_empleado_id UUID;
    v_comision_porcentaje NUMERIC;
    v_comision_monto NUMERIC;
    v_tenant_id UUID;
    v_commission_policy TEXT;
    v_ratio NUMERIC;
    v_precio_bruto_total NUMERIC;
    v_precio_base_comision NUMERIC;
BEGIN
    -- 0. Obtener el tenant actual (quien llama a la función)
    v_tenant_id := auth.uid();
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado.';
    END IF;

    -- Obtener la política de facturación (gross o net) del tenant
    SELECT commission_policy INTO v_commission_policy
    FROM public.tenant_config
    WHERE user_id = v_tenant_id;
    
    -- Manejo por defecto por si no existe
    IF v_commission_policy IS NULL THEN
        v_commission_policy := 'gross';
    END IF;

    -- 1. Crear la cabecera de la factura
    INSERT INTO public.facturas (
        user_id,
        cliente_id,
        subtotal,
        descuento,
        total,
        metodo_pago
    ) VALUES (
        v_tenant_id,
        p_cliente_id,
        p_subtotal,
        p_descuento,
        p_total,
        COALESCE(p_metodo_pago, 'Efectivo')
    ) RETURNING id INTO v_factura_id;

    -- Calcular el ratio para prorratear descuentos (para política 'net')
    IF p_subtotal > 0 THEN
        v_ratio := p_total / p_subtotal;
    ELSE
        v_ratio := 1;
    END IF;

    -- 2. Recorrer e Insertar cada Ítem de Factura
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Extraer el ID del empleado desde el JSON (si hay)
        v_empleado_id := (v_item->>'empleado_id')::UUID;
        v_comision_porcentaje := 0;

        -- Si hay empleado, buscar su porcentaje (solo en el scope del tenant actual)
        IF v_empleado_id IS NOT NULL THEN
            SELECT comision_porcentaje INTO v_comision_porcentaje
            FROM public.empleados
            WHERE id = v_empleado_id AND user_id = v_tenant_id;
            
            IF v_comision_porcentaje IS NULL THEN
                 v_comision_porcentaje := 0; -- Fallback si el empleado fue alterado / es de otro tenant
            END IF;
        END IF;

        -- Matemáticas de Comisiones
        v_precio_bruto_total := (v_item->>'price')::NUMERIC * (v_item->>'quantity')::NUMERIC;
        
        IF v_commission_policy = 'net' THEN
            v_precio_base_comision := v_precio_bruto_total * v_ratio;
        ELSE
            v_precio_base_comision := v_precio_bruto_total;
        END IF;

        v_comision_monto := v_precio_base_comision * (v_comision_porcentaje / 100);

        -- Insertar el ítem
        INSERT INTO public.factura_items (
            user_id,
            factura_id,
            empleado_id,
            descripcion,
            cantidad,
            precio_unitario,
            precio_total,
            comision_monto
        ) VALUES (
            v_tenant_id,
            v_factura_id,
            v_empleado_id,
            v_item->>'description',
            (v_item->>'quantity')::INTEGER,
            (v_item->>'price')::NUMERIC,
            v_precio_bruto_total,
            v_comision_monto
        );
    END LOOP;

    -- 3. Canjear el Bono (Si existe)
    IF p_bono_id IS NOT NULL THEN
        UPDATE public.bonos
        SET estado = 'Canjeado',
            fecha_canje = timezone('utc'::text, now())
        WHERE id = p_bono_id AND client_id = p_cliente_id; -- Seguridad adicional
    END IF;

    -- Retornar el ID de la factura creada como confirmación
    RETURN jsonb_build_object(
        'success', true,
        'factura_id', v_factura_id
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Cualquier error hará un ROLLBACK automático de todo lo anterior
        RAISE EXCEPTION 'Error al procesar la factura: %', SQLERRM;
END;
$$;
