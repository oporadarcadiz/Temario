// OpoRadarCádiz · alerta de solicitudes de compra. Origen exclusivo: webhook interno de Supabase.
// NO comprueba ni concede compras, NO expone datos de compradores y NO usa n8n para correo.
import { createClient } from "npm:@supabase/supabase-js@2.87.0";

const adminPanel = "https://oporadarcadiz.github.io/Temario/tema-1/admin/pedidos/";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const str = (x: unknown) => typeof x === "string" ? x : "";
const answer = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

function matchesSecret(received: string, expected: string) {
  const a = new TextEncoder().encode(received);
  const b = new TextEncoder().encode(expected);
  if (!a.length || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return answer({ error: "Método no permitido" }, 405);
  const expected = Deno.env.get("OPORADAR_ALERT_WEBHOOK_SECRET") || "";
  if (!expected) return answer({ error: "Avisos aún no configurados" }, 503);
  if (!matchesSecret(req.headers.get("x-oporadar-alert-secret") || "", expected))
    return answer({ error: "No autorizado" }, 401);
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return answer({ error: "Servicio no disponible" }, 503);
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const payload = await req.json().catch(() => null);
  const id = str(payload?.record?.claim_id);
  const isInsert = payload?.type === "INSERT" && payload?.table === "tema1_claim_alert_outbox" && payload?.schema === "public";
  if (!isInsert || !uuid.test(id)) return answer({ error: "Evento no válido" }, 400);

  const { data: outbox, error: queueError } = await supabase.from("tema1_claim_alert_outbox")
    .select("claim_id,email_sent_at,telegram_sent_at,email_attempts,telegram_attempts")
    .eq("claim_id", id).maybeSingle();
  const { data: claim, error: claimError } = await supabase.from("tema1_order_claims")
    .select("id,status,submitted_at").eq("id", id).maybeSingle();
  if (queueError || claimError || !outbox || !claim) return answer({ error: "Solicitud no disponible" }, 404);
  // No enviar recordatorios por solicitudes aprobadas/rechazadas.
  if (claim.status !== "pending") return answer({ ok: true, skipped: "Solicitud ya revisada" });

  const date = new Date(claim.submitted_at).toLocaleString("es-ES", { timeZone: "Europe/Madrid" });
  const description = "Nueva solicitud de acceso pendiente del Tema 1 de OpoRadarCádiz, registrada el " + date + ".";
  const emailApiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("OPORADAR_ALERT_EMAIL_FROM");
  const to = Deno.env.get("OPORADAR_ALERT_EMAIL_TO") || "oporadarcadiz@gmail.com";
  const telegramWebhook = Deno.env.get("OPORADAR_ALERT_N8N_WEBHOOK_URL");
  const result: Record<string,string> = { email: "pendiente", telegram: "pendiente" };

  // Correo directo a Resend: no depende del resultado de Telegram ni de n8n.
  if (!outbox.email_sent_at && emailApiKey && from && outbox.email_attempts < 10) {
    try {
      const mail = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "authorization": "Bearer " + emailApiKey,
          "content-type": "application/json",
          "idempotency-key": "tema1-pedido-" + id,
        },
        body: JSON.stringify({
          from, to: [to],
          subject: "OpoRadarCádiz · Nueva solicitud de acceso al Tema 1",
          text: description + "\nEstado: pendiente de verificación.\nRevisar (solo administración): " + adminPanel + "\nNo autorices sin comprobar el justificante.",
        }),
      });
      if (!mail.ok) throw new Error("Resend HTTP " + mail.status);
      const { error } = await supabase.from("tema1_claim_alert_outbox")
        .update({ email_sent_at: new Date().toISOString(), email_last_error: null, email_attempts: outbox.email_attempts + 1 })
        .eq("claim_id", id).is("email_sent_at", null);
      if (error) throw new Error("No se pudo registrar el estado del correo");
      result.email = "enviado";
    } catch (error) {
      await supabase.from("tema1_claim_alert_outbox").update({
        email_attempts: outbox.email_attempts + 1,
        email_last_error: String(error).slice(0, 120),
      }).eq("claim_id", id).is("email_sent_at", null);
      result.email = "error";
    }
  } else if (outbox.email_sent_at) result.email = "ya enviado";

  // Telegram es opcional e independiente: n8n recibe solo metadatos no sensibles.
  if (!outbox.telegram_sent_at && telegramWebhook && outbox.telegram_attempts < 10) {
    try {
      const url = new URL(telegramWebhook);
      if (url.protocol !== "https:") throw new Error("El webhook de Telegram debe usar HTTPS");
      const response = await fetch(url.toString(), {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ event_id: "tema1-" + id, tipo: "solicitud_tema1", fecha: date, estado: "pending", admin_url: adminPanel }),
      });
      if (!response.ok) throw new Error("n8n HTTP " + response.status);
      const { error } = await supabase.from("tema1_claim_alert_outbox")
        .update({ telegram_sent_at: new Date().toISOString(), telegram_last_error: null, telegram_attempts: outbox.telegram_attempts + 1 })
        .eq("claim_id", id).is("telegram_sent_at", null);
      if (error) throw new Error("No se pudo registrar el aviso de Telegram");
      result.telegram = "enviado";
    } catch (error) {
      await supabase.from("tema1_claim_alert_outbox").update({
        telegram_attempts: outbox.telegram_attempts + 1,
        telegram_last_error: String(error).slice(0, 120),
      }).eq("claim_id", id).is("telegram_sent_at", null);
      result.telegram = "error";
    }
  } else if (outbox.telegram_sent_at) result.telegram = "ya enviado";

  return answer({ ok: true, ...result });
});
