-- M-083 · CAMBIO PREPARADO EN RAMA, NO EJECUTADO EN SUPABASE.
-- Antes de aplicar: revisar editorialmente la referencia del pedido, RLS, permisos,
-- backups, política de atención a compradores y pruebas con cuentas de ensayo.
-- Afecta solo a las tablas y funciones existentes de acceso al Tema 1.
-- No concede permisos, no activa juegos, no modifica QR ni altera el banco.
BEGIN;

CREATE OR REPLACE FUNCTION public.tema1_canonizar_solicitud_amazon()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  ref text;
BEGIN
  IF NEW.channel IS DISTINCT FROM 'amazon' THEN
    RAISE EXCEPTION 'Solo se admiten pedidos del libro en papel de Amazon'
      USING ERRCODE = '23514';
  END IF;
  ref := regexp_replace(
    translate(coalesce(NEW.order_reference, ''), '‐‑‒–—−', '------'),
    '[[:space:]]', '', 'g'
  );
  IF ref ~ '^[0-9]{17}$' THEN
    ref := substring(ref from 1 for 3) || '-' ||
           substring(ref from 4 for 7) || '-' ||
           substring(ref from 11 for 7);
  END IF;
  IF ref !~ '^[0-9]{3}-[0-9]{7}-[0-9]{7}$' THEN
    RAISE EXCEPTION 'Referencia Amazon con formato inválido'
      USING ERRCODE = '23514';
  END IF;
  NEW.order_reference := ref;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tema1_claims_amazon_guard ON public.tema1_order_claims;
CREATE TRIGGER tema1_claims_amazon_guard
BEFORE INSERT OR UPDATE OF channel, order_reference ON public.tema1_order_claims
FOR EACH ROW
EXECUTE FUNCTION public.tema1_canonizar_solicitud_amazon();

CREATE OR REPLACE FUNCTION public.tema1_approve_claim(
  p_claim_id uuid, p_review_note text DEFAULT 'Compra comprobada'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE p public.tema1_order_claims%rowtype;
BEGIN
  SELECT * INTO p FROM public.tema1_order_claims WHERE id = p_claim_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Solicitud inexistente'; END IF;
  IF p.status <> 'pending' THEN RAISE EXCEPTION 'Solicitud ya revisada'; END IF;
  IF p.channel <> 'amazon' THEN
    RAISE EXCEPTION 'Solo se permite aprobar compras del libro en papel de Amazon';
  END IF;
  IF p.order_reference !~ '^[0-9]{3}-[0-9]{7}-[0-9]{7}$' THEN
    RAISE EXCEPTION 'Formato de referencia Amazon no verificado';
  END IF;
  IF p_review_note IS NULL OR length(btrim(p_review_note)) < 8 THEN
    RAISE EXCEPTION 'Documenta la verificación manual de la compra';
  END IF;
  UPDATE public.tema1_order_claims
     SET status='verified',reviewed_at=now(),reviewer_note=p_review_note
   WHERE id=p_claim_id;
  INSERT INTO public.tema1_access(user_id,active,granted_at,expires_at,source_claim_id)
  VALUES(p.user_id,true,now(),null,p.id)
  ON CONFLICT(user_id) DO UPDATE
    SET active=true,granted_at=now(),expires_at=null,source_claim_id=excluded.source_claim_id;
  RETURN true;
END;
$$;

-- Conserva la denegación a visitantes y clientes autenticados.
REVOKE ALL ON FUNCTION public.tema1_approve_claim(uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tema1_approve_claim(uuid,text) TO service_role;
REVOKE ALL ON FUNCTION public.tema1_canonizar_solicitud_amazon() FROM PUBLIC, anon, authenticated;

-- Tras aplicar, verificar permisos: has_function_privilege('anon',...,'EXECUTE')
-- y has_function_privilege('authenticated',...,'EXECUTE') deben devolver FALSE.
-- NO aplicar esta migración sin revisar QA comprador, referencia y reversión.
COMMIT;
