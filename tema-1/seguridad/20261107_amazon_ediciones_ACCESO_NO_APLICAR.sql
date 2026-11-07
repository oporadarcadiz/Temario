-- M-048/M-083 · 2026-11-07 · SOLO RAMA DE DESARROLLO
-- NO EJECUTAR EN PRODUCCION SIN: backup comprobado, ASIN oficiales, auditoria
-- de funciones/RLS, pruebas QA y autorizacion expresa.
-- Reutiliza las tablas existentes, sin crear otra base de datos.
-- Antes de aplicar: probar en copia aislada, y desplegar coordinadamente
-- formulario/Edge admin/Edge juegos/Edge Saber Mas. No ejecutar migracion previa
-- 20261102_amazon_solo_acceso.sql: su ON CONFLICT(user_id) es incompatible.
BEGIN;
SET LOCAL lock_timeout = '4s';
SET LOCAL statement_timeout = '25s';

ALTER TABLE public.tema1_order_claims
  ADD COLUMN IF NOT EXISTS product_edition text,
  ADD COLUMN IF NOT EXISTS asin text;

ALTER TABLE public.tema1_order_claims
  ADD CONSTRAINT tema1_claim_edition_check
  CHECK (product_edition IS NULL OR product_edition IN ('tema1_individual','general_10_temas'));

ALTER TABLE public.tema1_order_claims
  ADD CONSTRAINT tema1_claim_asin_check
  CHECK (asin IS NULL OR asin ~ '^[A-Z0-9]{10}$');

-- Las compras pendientes pueden no tener ASIN hasta ser verificadas.
-- Ninguna compra verificada puede existir sin edición y ASIN comprobados.
ALTER TABLE public.tema1_order_claims
  ADD CONSTRAINT tema1_claim_verified_requires_edition
  CHECK (status <> 'verified' OR (product_edition IS NOT NULL AND asin IS NOT NULL));

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.tema1_access WHERE source_claim_id IS NULL)
  THEN RAISE EXCEPTION 'Hay grants sin pedido vinculado: migracion cancelada'; END IF;
  IF EXISTS (SELECT 1 FROM public.tema1_order_claims WHERE status='verified'
           AND (product_edition IS NULL OR asin IS NULL))
  THEN RAISE EXCEPTION 'Compras antiguas sin ASIN; reconciliar antes'; END IF;
END $$;

-- Permite DOS compras de un mismo usuario sin que una revoque a la otra:
-- la procedencia verificable es (user_id,source_claim_id), no solo user_id.
ALTER TABLE public.tema1_access ALTER COLUMN source_claim_id SET NOT NULL;
ALTER TABLE public.tema1_access DROP CONSTRAINT tema1_access_pkey;
ALTER TABLE public.tema1_access
  ADD CONSTRAINT tema1_access_pkey PRIMARY KEY(user_id,source_claim_id);

-- Desactiva la firma antigua de aprobación de 2 argumentos, que no valida ASIN.
CREATE OR REPLACE FUNCTION public.tema1_approve_claim(
 p_claim_id uuid,p_review_note text DEFAULT NULL
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  RAISE EXCEPTION 'Aprobacion antigua deshabilitada. Usar tema1_approve_claim_v2 con ASIN confirmado';
END $$;
REVOKE ALL ON FUNCTION public.tema1_approve_claim(uuid,text) FROM PUBLIC,anon,authenticated;

-- El ASIN se introduce SOLO por un administrador, después de verificar el pedido.
-- Nunca se toma del comprador como evidencia de pago.
CREATE OR REPLACE FUNCTION public.tema1_approve_claim_v2(
 p_claim_id uuid,p_verified_asin text,p_review_note text
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
DECLARE c public.tema1_order_claims%ROWTYPE;
BEGIN
  SELECT * INTO c FROM public.tema1_order_claims WHERE id=p_claim_id FOR UPDATE;
  IF NOT FOUND OR c.status<>'pending' OR c.channel<>'amazon'
  THEN RAISE EXCEPTION 'Solicitud Amazon inexistente o no pendiente'; END IF;
  IF c.product_edition NOT IN ('tema1_individual','general_10_temas') OR c.product_edition IS NULL
  THEN RAISE EXCEPTION 'Edicion de libro no identificada'; END IF;
  IF c.order_reference !~ '^[0-9]{3}-[0-9]{7}-[0-9]{7}$'
  THEN RAISE EXCEPTION 'Numero de pedido no normalizado'; END IF;
  IF p_verified_asin IS NULL OR upper(trim(p_verified_asin)) !~ '^[A-Z0-9]{10}$'
  THEN RAISE EXCEPTION 'ASIN de libro fisico no valido'; END IF;
  IF p_review_note IS NULL OR length(trim(p_review_note)) NOT BETWEEN 15 AND 400
  THEN RAISE EXCEPTION 'Documentar comprobacion humana del pedido (15-400 caracteres)'; END IF;
  IF lower(trim(p_review_note)) IN ('compra comprobada','compra verificada','pedido verificado')
  THEN RAISE EXCEPTION 'Nota de verificacion demasiado generica'; END IF;
  -- La comprobación humana y comparacion con catalogo KDP/ASIN aprobado se
  -- realizan EN EL ADMIN ANTES de invocar esta funcion; una nota o patron no
  -- sustituye consultar de verdad el pedido. La Edge sigue fail-closed
  -- si el ASIN no coincide con sus variables de catálogo verificado.
  UPDATE public.tema1_order_claims SET
      status='verified',asin=upper(trim(p_verified_asin)),
      reviewed_at=now(),reviewer_note=trim(p_review_note)
    WHERE id=c.id;
  INSERT INTO public.tema1_access(user_id,active,granted_at,expires_at,source_claim_id)
    VALUES(c.user_id,true,now(),NULL,c.id)
  ON CONFLICT(user_id,source_claim_id) DO UPDATE
    SET active=true,granted_at=now(),expires_at=NULL;
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.tema1_approve_claim_v2(uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.tema1_approve_claim_v2(uuid,text,text) TO service_role;

-- Conserva RLS de lectura propia y la prohibición de INSERT/UPDATE
-- sobre tema1_access para el usuario autenticado.
COMMIT;

-- REVERSIÓN SOLO CON BACKUP Y SIN GRANTS NUEVOS:
-- 1) deshabilitar nuevas aprobaciones (Edge admin); conservar registros.
-- 2) si hay >1 grant por usuario, NO volver a PK(user_id), reconciliar primero.
-- 3) revertir firma admin v2, constraints y columnas solo tras exportar ASIN.
-- 4) restaurar funciones y permisos originales desde backup versionado.
-- 5) verificar que las Edge deniegan acceso y no hay URL firmada nueva.
