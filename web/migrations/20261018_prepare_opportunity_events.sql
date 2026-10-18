-- PREPARACIÓN / NO EJECUTAR SIN REVISIÓN Y BACKUP
-- Migración aditiva: conserva opportunities.id, data JSONB, favoritos y nueve registros.
BEGIN;
ALTER TABLE public.opportunities
 ADD COLUMN IF NOT EXISTS slug text,
 ADD COLUMN IF NOT EXISTS dedupe_key text,
 ADD COLUMN IF NOT EXISTS source_id text,
 ADD COLUMN IF NOT EXISTS source_reference text,
 ADD COLUMN IF NOT EXISTS canonical_url text,
 ADD COLUMN IF NOT EXISTS expediente_oficial text,
 ADD COLUMN IF NOT EXISTS municipio text,
 ADD COLUMN IF NOT EXISTS provincia text,
 ADD COLUMN IF NOT EXISTS ambito text,
 ADD COLUMN IF NOT EXISTS categoria text,
 ADD COLUMN IF NOT EXISTS grupo_profesional text,
 ADD COLUMN IF NOT EXISTS retribucion text,
 ADD COLUMN IF NOT EXISTS fecha_inicio_plazo date,
 ADD COLUMN IF NOT EXISTS fecha_ultima_novedad date,
 ADD COLUMN IF NOT EXISTS fecha_ultima_consulta timestamptz,
 ADD COLUMN IF NOT EXISTS estado_validacion text,
 ADD COLUMN IF NOT EXISTS aprobado_por text,
 ADD COLUMN IF NOT EXISTS aprobado_en timestamptz,
 ADD COLUMN IF NOT EXISTS retirada_en timestamptz,
 ADD COLUMN IF NOT EXISTS motivo_retirada text;
-- No restringir estado_validacion de los nueve registros heredados hasta auditarlos.
-- La restricción de oportunidades puede añadirse NOT VALID tras la revisión editorial.
-- No generar slug automáticamente a partir de nombres: asignación única e inmutable desde proceso editorial.
CREATE UNIQUE INDEX IF NOT EXISTS opportunities_slug_unique_idx ON public.opportunities(slug) WHERE slug IS NOT NULL;
-- El slug puede asignarse una vez, pero nunca renombrarse.
CREATE OR REPLACE FUNCTION public.opportunities_immutable_slug() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.slug IS NOT NULL AND NEW.slug IS DISTINCT FROM OLD.slug THEN
  RAISE EXCEPTION 'Slug permanente: no se permite modificarlo';
 END IF;
 RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS opportunities_immutable_slug_trigger ON public.opportunities;
CREATE TRIGGER opportunities_immutable_slug_trigger BEFORE UPDATE ON public.opportunities
FOR EACH ROW EXECUTE FUNCTION public.opportunities_immutable_slug();
CREATE UNIQUE INDEX IF NOT EXISTS opportunities_dedupe_unique_idx ON public.opportunities(dedupe_key) WHERE dedupe_key IS NOT NULL;
CREATE TABLE IF NOT EXISTS public.opportunity_events (
 evento_id text PRIMARY KEY,
 convocatoria_id text NOT NULL REFERENCES public.opportunities(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
 evento_dedupe_key text NOT NULL UNIQUE,
 tipo_evento text NOT NULL CHECK (tipo_evento IN ('convocatoria_publicada','apertura_plazo','correccion_bases','lista_provisional','lista_definitiva','fecha_examen','cambio_fecha_examen','resultado_examen','valoracion_meritos','propuesta_nombramiento','resolucion_final','plazo_finalizado','incidencia','otro')),
 titulo_evento text NOT NULL,
 fecha_oficial date,
 fecha_detectada timestamptz,
 source_id text,
 source_reference text,
 canonical_url text,
 url_evento text,
 resumen text,
 estado_validacion text NOT NULL DEFAULT 'pendiente' CHECK (estado_validacion IN ('pendiente','aprobado','corregir','rechazado')),
 publicado boolean NOT NULL DEFAULT false,
 aprobado_por text,
 aprobado_en timestamptz,
 retirado_en timestamptz,
 motivo_retirada text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT event_publish_requires_approval CHECK (
    NOT publicado OR (estado_validacion='aprobado' AND aprobado_en IS NOT NULL AND retirado_en IS NULL)
 )
);
CREATE OR REPLACE FUNCTION public.opportunity_events_touch_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
 NEW.updated_at = now();
 RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS opportunity_events_touch_updated_at_trigger ON public.opportunity_events;
CREATE TRIGGER opportunity_events_touch_updated_at_trigger
 BEFORE UPDATE ON public.opportunity_events
 FOR EACH ROW EXECUTE FUNCTION public.opportunity_events_touch_updated_at();
CREATE INDEX IF NOT EXISTS opportunity_events_convocatoria_fecha_idx ON public.opportunity_events(convocatoria_id,fecha_oficial DESC);
ALTER TABLE public.opportunity_events ENABLE ROW LEVEL SECURITY;
-- Sólo lectura pública de eventos publicados, aprobados, no retirados y asociados a convocatoria publicada.
DROP POLICY IF EXISTS opportunity_events_public_read ON public.opportunity_events;
CREATE POLICY opportunity_events_public_read ON public.opportunity_events
 FOR SELECT TO anon, authenticated USING (
  publicado IS TRUE AND estado_validacion='aprobado' AND retirado_en IS NULL
  AND EXISTS (SELECT 1 FROM public.opportunities o WHERE o.id=convocatoria_id AND o.published IS TRUE)
 );
REVOKE ALL ON TABLE public.opportunity_events FROM anon, authenticated;
GRANT SELECT ON TABLE public.opportunity_events TO anon, authenticated;
-- opportunities: restringir lectura pública también a no retiradas SIN sustituir aprobaciones históricas antes de auditarlas.
-- Aplicar endurecimiento adicional de opportunities tras confirmar la migración editorial de los 9 existentes.
COMMIT;
