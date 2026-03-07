-- =========================================================================================
-- SECURITY ADVISOR FIX: Function Search Path Mutable
-- =========================================================================================
-- Soluciona la alerta de seguridad "Function Search Path Mutable" en Supabase.
-- Al usar SECURITY DEFINER (que ejecuta la función con los permisos de su creador/owner),
-- es mandatorio establecer un `search_path` estricto (ej. `public`) para prevenir que 
-- usuarios atacantes creen tablas/funciones locales en su propio schema con el mismo nombre y
-- engañen a la BD para ejecutarlas con permisos elevados.

-- 1. Asegurar la función principal de facturación
ALTER FUNCTION public.procesar_factura_completa(UUID, NUMERIC, NUMERIC, NUMERIC, TEXT, JSONB, UUID) 
SET search_path = public;

-- 2. Asegurar las funciones base de RLS/RBAC (si se declararon como SECURITY DEFINER)
ALTER FUNCTION public.is_owner() 
SET search_path = public;

ALTER FUNCTION public.is_admin() 
SET search_path = public;

-- =========================================================================================
-- SOLUCIÓN PERMANENTE PARA FUTURAS MIGRACIONES
-- =========================================================================================
-- Para el futuro código, siempre añadir `SET search_path = public`
-- Ejemplo:
-- CREATE OR REPLACE FUNCTION my_func() RETURNS boolean 
-- LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ ... $$;
