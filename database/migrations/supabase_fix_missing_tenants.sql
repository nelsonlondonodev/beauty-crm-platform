-- ==============================================================================
-- DIAGNÓSTICO Y ARREGLO: VISIBILIDAD DE NUEVOS CLIENTES
-- Propósito: Identificar y corregir registros que no tienen tenant_id assigned,
-- lo cual ocurre cuando las inserciones vienen de n8n o servicios externos.
-- ==============================================================================

-- 1. IDENTIFICAR REGISTROS HUÉRFANOS (Sin tenant_id)
-- Esto nos dirá cuántos clientes no son visibles por los owners.
SELECT id, nombre, email, created_at, tenant_id 
FROM public.clientes_fidelizacion 
WHERE tenant_id IS NULL;

-- 2. ARREGLO MANUAL (Para tus pruebas actuales)
-- Asignamos el tenant_id del owner Nelson Londoño a los registros huérfanos.
-- Owner/Salon: dda1a738-a9cf-4a70-8343-bce886cf1fa2
UPDATE public.clientes_fidelizacion 
SET tenant_id = 'dda1a738-a9cf-4a70-8343-bce886cf1fa2' 
WHERE tenant_id IS NULL;

-- Repetir para bonos si es necesario
UPDATE public.bonos 
SET tenant_id = 'dda1a738-a9cf-4a70-8343-bce886cf1fa2' 
WHERE tenant_id IS NULL;

-- 3. MEJORA DE ROBUSTEZ (Log de Advertencia)
-- Si get_my_tenant_id() devuelve NULL, significa que el sistema no sabe a quién
-- pertenece el cliente. En una app multi-tenant, el origen (n8n/form) DEBE enviar el tenant_id.
