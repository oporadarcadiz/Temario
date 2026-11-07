-- M-084 · BORRADOR REPARADO 07/11/2026, NO APLICAR SIN BACKUP Y AUTORIZACION
-- Reutiliza user_entitlements, published_questions y el producto Stripe TEST.
-- No migra ni publica question_staging. Ejecutar antes del script documental
-- 20261107_banco_vivo_biblioteca_DOCUMENTAL_NO_APLICAR.sql.
BEGIN;
SET LOCAL lock_timeout='4s';
SET LOCAL statement_timeout='25s';

ALTER TABLE public.user_entitlements
 DROP CONSTRAINT IF EXISTS user_entitlements_route_check;
ALTER TABLE public.user_entitlements
 ADD CONSTRAINT user_entitlements_route_check
 CHECK(route IN ('aux','sub','banco-vivo'));

-- Solo las preguntas publicadas y verificadas quedan accesibles.
-- Los samples siguen gratuitos; los datos premium exigen OTP fresco + grant.
DROP POLICY IF EXISTS read_verified_if_free_or_entitled ON public.published_questions;
CREATE POLICY read_verified_if_free_or_entitled
 ON public.published_questions FOR SELECT TO anon,authenticated
 USING (
 verification_status IN ('VERIFICADA','VERIFICADA_RESERVA')
 AND (
   sample_free IS TRUE
   OR EXISTS (
    SELECT 1 FROM public.user_entitlements e
    WHERE e.user_id=(SELECT auth.uid()) AND e.active=true
      AND (e.expires_at IS NULL OR e.expires_at>now())
      AND (e.route=published_questions.route OR e.route='banco-vivo')
      AND EXISTS (
       SELECT 1 FROM jsonb_array_elements(
         COALESCE((SELECT auth.jwt())->'amr','[]'::jsonb)) m
       WHERE m->>'method'='otp'
         AND m->>'timestamp' ~ '^[0-9]{9,13}$'
         AND (m->>'timestamp')::bigint >= EXTRACT(EPOCH FROM now())::bigint-8*3600
         AND (m->>'timestamp')::bigint <= EXTRACT(EPOCH FROM now())::bigint+60
      )
   )
 )
 );

-- Única tabla de auditoría de pagos, NO una base de preguntas duplicada.
CREATE TABLE IF NOT EXISTS public.banco_vivo_stripe_events (
 stripe_event_id text PRIMARY KEY,
 checkout_session_id text NOT NULL,
 stripe_price_id text NOT NULL,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 event_type text NOT NULL,
 processed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.banco_vivo_stripe_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.banco_vivo_stripe_events FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON public.banco_vivo_stripe_events TO service_role;
CREATE UNIQUE INDEX IF NOT EXISTS banco_vivo_checkout_once_idx
 ON public.banco_vivo_stripe_events(checkout_session_id);

-- Webhook confirma firma/paid/price/product EN STRIPE antes de invocar RPC.
-- Registrar el ID de evento y conceder derechos atómicamente.
CREATE OR REPLACE FUNCTION public.banco_vivo_registrar_pago_test(
 p_event_id text,p_session_id text,p_price_id text,
 p_user_id uuid,p_days integer,p_event_type text
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
DECLARE inserted_count integer;
BEGIN
 IF p_event_id !~ '^evt_[A-Za-z0-9]+$' OR
    p_session_id !~ '^cs_test_[A-Za-z0-9]+$' OR
    p_price_id !~ '^price_[A-Za-z0-9]+$' OR
    p_event_type NOT IN ('checkout.session.completed','checkout.session.async_payment_succeeded') OR
    p_days NOT BETWEEN 1 AND 365
 THEN RAISE EXCEPTION 'Evento TEST o duración inválidos'; END IF;

 INSERT INTO public.banco_vivo_stripe_events(
  stripe_event_id,checkout_session_id,stripe_price_id,user_id,event_type)
 VALUES(p_event_id,p_session_id,p_price_id,p_user_id,p_event_type)
 ON CONFLICT DO NOTHING;
 GET DIAGNOSTICS inserted_count = ROW_COUNT;
 IF inserted_count=0 THEN RETURN false; END IF;

 INSERT INTO public.user_entitlements(user_id,route,active,expires_at)
 VALUES(p_user_id,'banco-vivo',true,now()+p_days*interval '1 day')
 ON CONFLICT(user_id,route) DO UPDATE
 SET active=true,
 expires_at=CASE WHEN public.user_entitlements.expires_at IS NULL THEN NULL
 ELSE GREATEST(public.user_entitlements.expires_at,now())+p_days*interval '1 day' END;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.banco_vivo_registrar_pago_test(
 text,text,text,uuid,integer,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.banco_vivo_registrar_pago_test(
 text,text,text,uuid,integer,text) TO service_role;
COMMIT;

-- ESTADO: NO EJECUTADO. Usuario decide precio/periodo, tributación y reembolsos.
-- REVERSIÓN: copia previa de políticas, constraints, funciones y filas.
-- No eliminar eventos pagados ni acortar derechos sin reconciliación.
