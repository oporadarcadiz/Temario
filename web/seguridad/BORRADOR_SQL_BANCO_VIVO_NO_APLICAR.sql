-- M-084 / WEB CHAT · 2026-11-05
-- BORRADOR DE REVISIÓN, NO EJECUTADO. NO APLICAR SIN COPIA, QA Y AUTORIZACIÓN.
-- Mantiene rutas de preguntas existentes 'aux' y 'sub', sin migrar el banco ni sus fuentes.
-- El producto Stripe Banco Vivo tendrá entitlement propio 'banco-vivo'.
-- Compensación por renovación/reembolso/chargeback exige contrato comercial antes de GO.

BEGIN;

-- Supabase existente, 05/11/2026:
-- user_entitlements (user_id uuid, route text, active bool, expires_at timestamptz)
-- CHECK actual route IN ('aux','sub'); modificar SOLO para añadir el producto independiente.
ALTER TABLE public.user_entitlements
  DROP CONSTRAINT IF EXISTS user_entitlements_route_check;
ALTER TABLE public.user_entitlements
  ADD CONSTRAINT user_entitlements_route_check
    CHECK (route IN ('aux','sub','banco-vivo'));

-- Los datos de preguntas/soluciones solo se consultarán mediante RLS si son de la
-- tabla editorialmente publicada. No exponer ni opo_master_questions ni staging.
DROP POLICY IF EXISTS read_verified_if_free_or_entitled ON public.published_questions;
CREATE POLICY read_verified_if_free_or_entitled
  ON public.published_questions FOR SELECT TO anon,authenticated
  USING (
    verification_status IN ('VERIFICADA','VERIFICADA_RESERVA')
    AND (
      sample_free IS TRUE
      OR EXISTS (
        SELECT 1 FROM public.user_entitlements e
        WHERE e.user_id = (SELECT auth.uid())
          AND e.active IS TRUE
          AND (e.expires_at IS NULL OR e.expires_at > now())
          AND (e.route = published_questions.route OR e.route='banco-vivo')
      )
    )
  );

-- Idempotencia mínima de cobro, sin datos bancarios.
-- Esta tabla NO debe tener políticas para anon ni authenticated.
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

-- NO conceder derechos automáticamente desde el cliente: la Edge de webhook debe
-- verificar firma Stripe sobre RAW BODY, livemode TEST, price esperado, paid,
-- client_reference_id propio y evitar replay/duplicados con stripe_event_id.
-- En producción separar precio TEST de LIVE y aplicar cancelación/revocación.
-- El esquema es solo un contrato pendiente de auditoría.
COMMIT;

-- PLAN DE ROLLBACK PREVIO A APLICAR, NO EJECUTAR SIN BACKUP:
-- 1) exportar definiciones originales de políticas, CHECK y filas/privilegios;
-- 2) validar que ningún usuario tiene route='banco-vivo' antes de revertir;
-- 3) restaurar política SELECT original, CHECK ['aux','sub'] y eliminar tabla
--    de eventos SOLO si no tiene operaciones reales retenibles;
-- 4) repetir verificaciones RLS anon/authenticated y auditoría de funciones.
