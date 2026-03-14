-- Limpieza de Datos de Prueba (Operativa)
-- Este script elimina clientes, citas, facturas y bonos para reducir ruido visual.
-- Mantiene: Personal (empleados), Roles de Usuario y Configuración de Marca.

-- 1. Eliminar detalles de facturas (items)
TRUNCATE TABLE public.factura_items CASCADE;

-- 2. Eliminar facturas (cabeceras)
TRUNCATE TABLE public.facturas CASCADE;

-- 3. Eliminar citas (agenda del calendario)
TRUNCATE TABLE public.appointments CASCADE;

-- 4. Eliminar bonos y cupones de fidelización
TRUNCATE TABLE public.bonos CASCADE;

-- 5. Eliminar historial de pagos de comisiones a empleados
TRUNCATE TABLE public.pagos_comisiones CASCADE;

-- 6. Eliminar clientes (esto limpiará también lo que dependa de ellos por CASCADE)
TRUNCATE TABLE public.clientes_fidelizacion CASCADE;

-- OPCIONAL: Si deseas eliminar también a los empleados de prueba, descomenta la siguiente línea:
-- TRUNCATE TABLE public.empleados CASCADE;
