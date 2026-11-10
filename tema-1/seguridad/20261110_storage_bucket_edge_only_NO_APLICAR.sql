-- P0 2026-11-10 · PROPUESTA, NO APLICAR EN PRODUCCION.
-- Complementa 20261107_amazon_ediciones_ACCESO_NO_APLICAR.sql.
-- Hallazgo: una Edge con ASIN no protege archivos si storage.objects conserva
-- SELECT amplio para usuarios authenticated en el bucket tema1-premium.
-- Objetivo: lectura de PDF exclusivamente por Edge con service_role tras
-- validar JWT+OTP+pedido verificado+ASIN+edicion+parte+vigencia.
-- ANTES: backup de pg_policies y storage.objects, snapshot de bucket,
-- identificar TODAS las politicas existentes (no asumir solo una),
-- probar en clon y obtener GO expreso.
BEGIN;
SET LOCAL lock_timeout='4s';
SET LOCAL statement_timeout='20s';
-- Abortamos si no existe el bucket privado.
DO $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM storage.buckets
               WHERE id='tema1-premium' AND public=false)
 THEN RAISE EXCEPTION 'Bucket no existe o es publico: NO aplicar'; END IF;
END $$;
-- Revocar SOLO la politica conocida tras inventariar las demas.
DROP POLICY IF EXISTS tema1_premium_read_paid ON storage.objects;
-- No crear politica SELECT para authenticated/anon en este bucket.
-- Service role omite RLS y la Edge firma URLs de 60s SOLO despues de
-- autorizar el recurso individual. Las firmas existentes pueden sobrevivir
-- hasta su expiracion: no prometer revocacion instantanea.
COMMIT;
-- QA obligatorio en entorno aislado:
-- 1 anon SELECT/download -> denegado
-- 2 authenticated con compra verificada SELECT/download directo -> denegado
-- 3 authenticated sin compra -> denegado
-- 4 Edge: OTP reciente, compra activa, ASIN/edicion/parte concordantes -> firma
-- 5 Edge: otra edicion, expirado, revocado, pending -> sin firma
-- 6 URL firmada vence; cache-control no-store; QR publico sigue funcional.
-- 7 Revisar TODAS las otras politicas storage.objects: una politica permisiva
--   adicional puede seguir otorgando SELECT. NO considerar seguro hasta
--   confirmar que no queda ninguna para tema1-premium.
-- REVERSIÓN: restaurar exactamente la definicion original desde backup
-- de pg_policies y repetir pruebas de roles. NO restaurar permiso amplio
-- si se han activado recursos premium; preferir mantener acceso cerrado.
