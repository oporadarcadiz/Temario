-- M-084 · SOLO RAMA. No ejecutar sin respaldo, RLS y aprobación.
-- Complemento de BORRADOR_SQL_BANCO_VIVO_NO_APLICAR.sql (entitlement).
-- Los 433 registros de question_staging NO se tocan.
BEGIN;
SET LOCAL lock_timeout='4s';
ALTER TABLE public.published_questions
 ADD COLUMN IF NOT EXISTS publication_mode text NOT NULL DEFAULT 'test',
 ADD COLUMN IF NOT EXISTS subject text;
ALTER TABLE public.published_questions ALTER COLUMN correct_index DROP NOT NULL;
ALTER TABLE public.published_questions DROP CONSTRAINT IF EXISTS published_questions_verification_status_check;
ALTER TABLE public.published_questions ADD CONSTRAINT published_questions_verification_status_check
 CHECK (verification_status IN ('VERIFICADA','VERIFICADA_RESERVA','DOCUMENTAL_REVISADA'));
ALTER TABLE public.published_questions ADD CONSTRAINT published_questions_mode_check
 CHECK ((publication_mode='test' AND verification_status IN ('VERIFICADA','VERIFICADA_RESERVA') AND correct_index BETWEEN 0 AND 3)
 OR (publication_mode='documental' AND verification_status='DOCUMENTAL_REVISADA'
 AND correct_index IS NULL AND sample_free=false
 AND (source_url IS NOT NULL OR source_document IS NOT NULL)));
ALTER TABLE public.published_questions ADD CONSTRAINT published_questions_subject_length
 CHECK (subject IS NULL OR char_length(subject) BETWEEN 2 AND 120);
CREATE INDEX IF NOT EXISTS published_questions_filters_idx
 ON public.published_questions(route,organism,exam_year,subject,publication_mode);

-- Lectura premium con OTP reciente y derecho propio banco-vivo.
DROP POLICY IF EXISTS read_verified_if_free_or_entitled ON public.published_questions;
CREATE POLICY read_verified_if_free_or_entitled ON public.published_questions
 FOR SELECT TO anon,authenticated USING (
 ( (publication_mode='test' AND verification_status IN ('VERIFICADA','VERIFICADA_RESERVA') AND correct_index IS NOT NULL)
 OR (publication_mode='documental' AND verification_status='DOCUMENTAL_REVISADA' AND correct_index IS NULL AND sample_free=false) )
 AND (
 (sample_free=true AND publication_mode='test')
 OR EXISTS(
  SELECT 1 FROM public.user_entitlements e
  WHERE e.user_id=(SELECT auth.uid()) AND e.active=true
   AND (e.expires_at IS NULL OR e.expires_at>now())
   AND (e.route=published_questions.route OR e.route='banco-vivo')
   AND EXISTS(
    SELECT 1 FROM jsonb_array_elements(COALESCE((SELECT auth.jwt())->'amr','[]'::jsonb)) m
    WHERE m->>'method'='otp' AND m->>'timestamp' ~ '^[0-9]{9,13}$'
    AND (m->>'timestamp')::bigint >= EXTRACT(EPOCH FROM now())::bigint-8*3600
    AND (m->>'timestamp')::bigint <= EXTRACT(EPOCH FROM now())::bigint+60
   )
 )
 ));

-- Facetas públicas agregadas, SIN pregunta ni respuesta. Solo service_role.
CREATE OR REPLACE FUNCTION public.banco_vivo_facetas_publicas()
RETURNS TABLE(route text,organism text,exam text,exam_year integer,
 subject text,publication_mode text,questions bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_temp'
AS $$
 SELECT p.route,p.organism,p.exam,p.exam_year,
 coalesce(p.subject,'Pendiente de materia'),p.publication_mode,count(DISTINCT p.id)::bigint
 FROM public.published_questions p
 WHERE (p.publication_mode='test' AND p.verification_status IN ('VERIFICADA','VERIFICADA_RESERVA') AND p.correct_index IS NOT NULL)
 OR (p.publication_mode='documental' AND p.verification_status='DOCUMENTAL_REVISADA' AND p.correct_index IS NULL)
 GROUP BY p.route,p.organism,p.exam,p.exam_year,p.subject,p.publication_mode
 ORDER BY count(DISTINCT p.id) DESC,p.exam_year DESC LIMIT 1000
$$;
REVOKE ALL ON FUNCTION public.banco_vivo_facetas_publicas() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.banco_vivo_facetas_publicas() TO service_role;
COMMIT;

-- Reversión: restaurar policy/constraints desde backup; NO restablecer
-- correct_index NOT NULL si ya existen documentales. Exportar antes.
-- Nunca copiar ni publicar los 433 staging automáticamente.
