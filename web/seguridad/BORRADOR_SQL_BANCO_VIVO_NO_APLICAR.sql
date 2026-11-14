-- M-084 · BORRADOR. NO EJECUTAR NI DESPLEGAR SIN COPIA, QA Y AUTORIZACIÓN.
-- Banco Vivo es independiente de Amazon/Tema 1. Lee exclusivamente
-- published_questions: nunca opo_master_questions, staging ni sus fuentes.
BEGIN;

-- Añade el derecho comercial separado sin convertirlo en aux/sub ni en Tema 1.
ALTER TABLE public.user_entitlements DROP CONSTRAINT IF EXISTS user_entitlements_route_check;
ALTER TABLE public.user_entitlements ADD CONSTRAINT user_entitlements_route_check
  CHECK (route IN ('aux','sub','banco-vivo'));

-- Biblioteca documental: solo metadatos y documentos autorizados por la misma
-- tabla publicada. Test autocorregible: solo filas de preguntas aprobadas.
-- La aplicación debe solicitar columnas explícitas para cada vista y no combinar
-- respuestas con la biblioteca documental en una carga pública.
DROP POLICY IF EXISTS read_verified_if_free_or_entitled ON public.published_questions;
CREATE POLICY read_verified_if_free_or_entitled ON public.published_questions
  FOR SELECT TO anon,authenticated
  USING (
    verification_status IN ('VERIFICADA','VERIFICADA_RESERVA')
    AND (
      sample_free IS TRUE
      OR EXISTS (
        SELECT 1 FROM public.user_entitlements e
        WHERE e.user_id=(SELECT auth.uid()) AND e.active IS TRUE
          AND (e.expires_at IS NULL OR e.expires_at>now())
          AND (e.route=published_questions.route OR e.route='banco-vivo')
          -- Una sesión OAuth/Google gratuita no acredita acceso prémium.
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements(COALESCE((SELECT auth.jwt())->'amr','[]'::jsonb)) AS method
            WHERE method->>'method'='otp'
              AND method->>'timestamp' ~ '^[0-9]{9,13}$'
              AND (method->>'timestamp')::bigint >= EXTRACT(EPOCH FROM now())::bigint-8*3600
              AND (method->>'timestamp')::bigint <= EXTRACT(EPOCH FROM now())::bigint+60
          )
      )
    )
  );

-- Idempotencia de webhook, sin datos bancarios y sin acceso del navegador.
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

-- El webhook futuro debe validar firma sobre cuerpo RAW, event.id idempotente,
-- livemode=false, price Banco Vivo exacto, payment_status=paid y
-- client_reference_id del usuario. La redirección del navegador jamás concede acceso.
COMMIT;

-- Antes de aplicar: exportar políticas/CHECK/GRANT originales, comprobar el
-- esquema real de published_questions y ensayar anon, OTP sin derecho, derecho
-- banco-vivo, expirado y revocado en entorno aislado. Preparar rollback explícito.
