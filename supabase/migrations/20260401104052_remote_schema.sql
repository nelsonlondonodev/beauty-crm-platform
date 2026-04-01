


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_role" AS ENUM (
    'owner',
    'admin',
    'staff',
    'superadmin'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_tenant_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$ SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid(); $$;


ALTER FUNCTION "public"."get_my_tenant_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_superadmin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'superadmin'); END; $$;


ALTER FUNCTION "public"."is_superadmin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."procesar_factura_completa"("p_cliente_id" "uuid", "p_subtotal" numeric, "p_descuento" numeric, "p_total" numeric, "p_metodo_pago" "text", "p_items" "jsonb", "p_bono_id" "uuid" DEFAULT NULL::"uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."procesar_factura_completa"("p_cliente_id" "uuid", "p_subtotal" numeric, "p_descuento" numeric, "p_total" numeric, "p_metodo_pago" "text", "p_items" "jsonb", "p_bono_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "fecha_cita" timestamp with time zone NOT NULL,
    "client_id" "uuid" NOT NULL,
    "servicio" "text" NOT NULL,
    "estado" "text" DEFAULT 'programada'::"text",
    "pago_estado" "text" DEFAULT 'pendiente'::"text",
    "nota" "text",
    "empleado_id" "uuid",
    "duracion_minutos" integer DEFAULT 60,
    "notas" "text",
    "reminder_24h_sent" boolean DEFAULT false,
    "reminder_2h_sent" boolean DEFAULT false,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "tenant_id" "uuid" DEFAULT "public"."get_my_tenant_id"(),
    CONSTRAINT "appointments_estado_check" CHECK (("estado" = ANY (ARRAY['programada'::"text", 'confirmada'::"text", 'completada'::"text", 'cancelada'::"text"]))),
    CONSTRAINT "appointments_pago_estado_check" CHECK (("pago_estado" = ANY (ARRAY['pendiente'::"text", 'pagado'::"text"])))
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bonos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "client_id" "uuid" NOT NULL,
    "codigo" "text" NOT NULL,
    "tipo" "text" DEFAULT 'Bienvenida'::"text" NOT NULL,
    "estado" "text" DEFAULT 'Pendiente'::"text" NOT NULL,
    "fecha_vencimiento" timestamp with time zone,
    "fecha_canje" timestamp with time zone,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "tenant_id" "uuid" DEFAULT "public"."get_my_tenant_id"(),
    CONSTRAINT "bonos_estado_check" CHECK (("estado" = ANY (ARRAY['Pendiente'::"text", 'Canjeado'::"text", 'Expirado'::"text"]))),
    CONSTRAINT "bonos_tipo_check" CHECK (("tipo" = ANY (ARRAY['Bienvenida'::"text", 'Cumpleaños'::"text", 'Reactivacion'::"text", 'Especial'::"text"])))
);


ALTER TABLE "public"."bonos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clientes_fidelizacion" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "nombre" "text" NOT NULL,
    "email" "text",
    "whatsapp" "text" NOT NULL,
    "birthday" "date",
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "tenant_id" "uuid" DEFAULT "public"."get_my_tenant_id"(),
    "notas" "text" DEFAULT ''::"text"
);


ALTER TABLE "public"."clientes_fidelizacion" OWNER TO "postgres";


COMMENT ON COLUMN "public"."clientes_fidelizacion"."notas" IS 'Ficha técnica o historial de notas generales del cliente (preferencias del salón).';



CREATE TABLE IF NOT EXISTS "public"."empleados" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" "text" NOT NULL,
    "rol" "text" NOT NULL,
    "comision_porcentaje" numeric DEFAULT 0 NOT NULL,
    "activo" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "tenant_id" "uuid" DEFAULT "public"."get_my_tenant_id"()
);


ALTER TABLE "public"."empleados" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."factura_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "factura_id" "uuid" NOT NULL,
    "empleado_id" "uuid",
    "descripcion" "text" NOT NULL,
    "cantidad" integer DEFAULT 1 NOT NULL,
    "precio_unitario" numeric DEFAULT 0 NOT NULL,
    "precio_total" numeric DEFAULT 0 NOT NULL,
    "comision_monto" numeric DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "tenant_id" "uuid" DEFAULT "public"."get_my_tenant_id"()
);


ALTER TABLE "public"."factura_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."facturas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cliente_id" "uuid",
    "subtotal" numeric DEFAULT 0 NOT NULL,
    "descuento" numeric DEFAULT 0 NOT NULL,
    "total" numeric DEFAULT 0 NOT NULL,
    "metodo_pago" "text",
    "fecha_venta" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "appointment_id" "uuid",
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "tenant_id" "uuid" DEFAULT "public"."get_my_tenant_id"()
);


ALTER TABLE "public"."facturas" OWNER TO "postgres";


COMMENT ON COLUMN "public"."facturas"."appointment_id" IS 'ID de la cita reservada en el calendario, para cruce automático.';



CREATE TABLE IF NOT EXISTS "public"."pagos_comisiones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empleado_id" "uuid" NOT NULL,
    "monto_pagado" numeric NOT NULL,
    "fecha_pago" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "notas" "text",
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "tenant_id" "uuid" DEFAULT "public"."get_my_tenant_id"()
);


ALTER TABLE "public"."pagos_comisiones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenant_config" (
    "user_id" "uuid" NOT NULL,
    "brand_name" "text" DEFAULT 'Londy'::"text",
    "tagline" "text" DEFAULT 'Beauty Industry CRM'::"text",
    "support_email" "text",
    "logo_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "commission_policy" "text" DEFAULT 'gross'::"text",
    CONSTRAINT "tenant_config_commission_policy_check" CHECK (("commission_policy" = ANY (ARRAY['gross'::"text", 'net'::"text"])))
);


ALTER TABLE "public"."tenant_config" OWNER TO "postgres";


COMMENT ON COLUMN "public"."tenant_config"."commission_policy" IS 'Define si las comisiones se calculan sobre el total bruto o sobre el neto después de descuentos.';



CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" DEFAULT 'staff'::"public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "tenant_id" "uuid"
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bonos"
    ADD CONSTRAINT "bonos_codigo_key" UNIQUE ("codigo");



ALTER TABLE ONLY "public"."bonos"
    ADD CONSTRAINT "bonos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clientes_fidelizacion"
    ADD CONSTRAINT "clientes_fidelizacion_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."empleados"
    ADD CONSTRAINT "empleados_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."factura_items"
    ADD CONSTRAINT "factura_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."facturas"
    ADD CONSTRAINT "facturas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pagos_comisiones"
    ADD CONSTRAINT "pagos_comisiones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenant_config"
    ADD CONSTRAINT "tenant_config_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_key" UNIQUE ("user_id");



CREATE INDEX "idx_appointments_empleado" ON "public"."appointments" USING "btree" ("empleado_id");



CREATE INDEX "idx_facturas_appointment_id" ON "public"."facturas" USING "btree" ("appointment_id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clientes_fidelizacion"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bonos"
    ADD CONSTRAINT "bonos_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clientes_fidelizacion"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."factura_items"
    ADD CONSTRAINT "factura_items_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."factura_items"
    ADD CONSTRAINT "factura_items_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "public"."facturas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."facturas"
    ADD CONSTRAINT "facturas_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."facturas"
    ADD CONSTRAINT "facturas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes_fidelizacion"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."pagos_comisiones"
    ADD CONSTRAINT "pagos_comisiones_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenant_config"
    ADD CONSTRAINT "tenant_config_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant_config"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "SuperAdmins manage roles" ON "public"."user_roles" TO "authenticated" USING ("public"."is_superadmin"()) WITH CHECK ("public"."is_superadmin"());



CREATE POLICY "SuperAdmins manage tenants" ON "public"."tenant_config" TO "authenticated" USING ("public"."is_superadmin"()) WITH CHECK ("public"."is_superadmin"());



CREATE POLICY "Tenant Isolation: Bonos" ON "public"."bonos" TO "authenticated" USING (("public"."is_superadmin"() OR ("tenant_id" = "public"."get_my_tenant_id"()))) WITH CHECK (("public"."is_superadmin"() OR ("tenant_id" = "public"."get_my_tenant_id"())));



CREATE POLICY "Tenant Isolation: Citas" ON "public"."appointments" TO "authenticated" USING (("public"."is_superadmin"() OR ("tenant_id" = "public"."get_my_tenant_id"()))) WITH CHECK (("public"."is_superadmin"() OR ("tenant_id" = "public"."get_my_tenant_id"())));



CREATE POLICY "Tenant Isolation: Clientes" ON "public"."clientes_fidelizacion" TO "authenticated" USING (("public"."is_superadmin"() OR ("tenant_id" = "public"."get_my_tenant_id"()))) WITH CHECK (("public"."is_superadmin"() OR ("tenant_id" = "public"."get_my_tenant_id"())));



CREATE POLICY "Tenant Isolation: Empleados" ON "public"."empleados" TO "authenticated" USING (("public"."is_superadmin"() OR ("tenant_id" = "public"."get_my_tenant_id"()))) WITH CHECK (("public"."is_superadmin"() OR ("tenant_id" = "public"."get_my_tenant_id"())));



CREATE POLICY "Tenant Isolation: Factura_items" ON "public"."factura_items" TO "authenticated" USING (("public"."is_superadmin"() OR ("tenant_id" = "public"."get_my_tenant_id"()))) WITH CHECK (("public"."is_superadmin"() OR ("tenant_id" = "public"."get_my_tenant_id"())));



CREATE POLICY "Tenant Isolation: Facturas" ON "public"."facturas" TO "authenticated" USING (("public"."is_superadmin"() OR ("tenant_id" = "public"."get_my_tenant_id"()))) WITH CHECK (("public"."is_superadmin"() OR ("tenant_id" = "public"."get_my_tenant_id"())));



CREATE POLICY "Tenant Isolation: Pagos" ON "public"."pagos_comisiones" TO "authenticated" USING (("public"."is_superadmin"() OR ("tenant_id" = "public"."get_my_tenant_id"()))) WITH CHECK (("public"."is_superadmin"() OR ("tenant_id" = "public"."get_my_tenant_id"())));



CREATE POLICY "Tenant config access" ON "public"."tenant_config" TO "authenticated" USING (("public"."is_superadmin"() OR ("user_id" = "public"."get_my_tenant_id"()))) WITH CHECK (("public"."is_superadmin"() OR ("user_id" = "public"."get_my_tenant_id"())));



CREATE POLICY "Usuarios pueden ver su propio rol" ON "public"."user_roles" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user_id") OR ("tenant_id" = "public"."get_my_tenant_id"())));



ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bonos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clientes_fidelizacion" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."empleados" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."factura_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."facturas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pagos_comisiones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenant_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_my_tenant_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_tenant_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_tenant_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_superadmin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_superadmin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_superadmin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."procesar_factura_completa"("p_cliente_id" "uuid", "p_subtotal" numeric, "p_descuento" numeric, "p_total" numeric, "p_metodo_pago" "text", "p_items" "jsonb", "p_bono_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."procesar_factura_completa"("p_cliente_id" "uuid", "p_subtotal" numeric, "p_descuento" numeric, "p_total" numeric, "p_metodo_pago" "text", "p_items" "jsonb", "p_bono_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."procesar_factura_completa"("p_cliente_id" "uuid", "p_subtotal" numeric, "p_descuento" numeric, "p_total" numeric, "p_metodo_pago" "text", "p_items" "jsonb", "p_bono_id" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."appointments" TO "anon";
GRANT ALL ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";



GRANT ALL ON TABLE "public"."bonos" TO "anon";
GRANT ALL ON TABLE "public"."bonos" TO "authenticated";
GRANT ALL ON TABLE "public"."bonos" TO "service_role";



GRANT ALL ON TABLE "public"."clientes_fidelizacion" TO "anon";
GRANT ALL ON TABLE "public"."clientes_fidelizacion" TO "authenticated";
GRANT ALL ON TABLE "public"."clientes_fidelizacion" TO "service_role";



GRANT ALL ON TABLE "public"."empleados" TO "anon";
GRANT ALL ON TABLE "public"."empleados" TO "authenticated";
GRANT ALL ON TABLE "public"."empleados" TO "service_role";



GRANT ALL ON TABLE "public"."factura_items" TO "anon";
GRANT ALL ON TABLE "public"."factura_items" TO "authenticated";
GRANT ALL ON TABLE "public"."factura_items" TO "service_role";



GRANT ALL ON TABLE "public"."facturas" TO "anon";
GRANT ALL ON TABLE "public"."facturas" TO "authenticated";
GRANT ALL ON TABLE "public"."facturas" TO "service_role";



GRANT ALL ON TABLE "public"."pagos_comisiones" TO "anon";
GRANT ALL ON TABLE "public"."pagos_comisiones" TO "authenticated";
GRANT ALL ON TABLE "public"."pagos_comisiones" TO "service_role";



GRANT ALL ON TABLE "public"."tenant_config" TO "anon";
GRANT ALL ON TABLE "public"."tenant_config" TO "authenticated";
GRANT ALL ON TABLE "public"."tenant_config" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


  create policy "Avatar update/delete for owner"
  on "storage"."objects"
  as permissive
  for all
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Avatar upload for authenticated users"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Avatar view for everyone"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



