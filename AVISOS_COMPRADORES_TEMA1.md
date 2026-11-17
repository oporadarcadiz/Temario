# Alertas de compradores: preparar conexión (no activado el envío)
Fecha: 2026-11-17.

## Estado
- En Supabase ya existe la tabla protegida `public.tema1_claim_alert_outbox`.
- Un trigger `tema1_claim_alert_enqueue` encola cada nuevo INSERT en `tema1_order_claims`.
- La solicitud previa se ha incluido sin enviarse todavía.
- La Edge Function `tema1-alerta-pedido` está preparada en esta rama, NO desplegada.
- Ningún comprador se autoriza por este sistema.

## Datos del correo
Destino previsto: `oporadarcadiz@gmail.com`.
Proveedor recomendado: Resend (https://resend.com/). Crear cuenta gratuita con el correo administrador.
En Resend, crear API Key de permisos de envío; guardar solo en Supabase Edge Functions Secrets:
- `RESEND_API_KEY`: clave privada.
- `OPORADAR_ALERT_EMAIL_FROM`: remitente validado por Resend (en pruebas, remitente permitido de Resend según sus restricciones).
- `OPORADAR_ALERT_EMAIL_TO`: `oporadarcadiz@gmail.com`.
- `OPORADAR_ALERT_WEBHOOK_SECRET`: una cadena aleatoria privada larga, creada en Dashboard y almacenada también en el encabezado protegido del webhook.

No pegar claves en ChatGPT, GitHub ni Cloudflare Pages. No activar ningún pago.

## Habilitar función
1. Desplegar Edge Function `tema1-alerta-pedido` con `verify_jwt=false` solo cuando se hayan configurado las cuatro variables anteriores. 
2. Validar que devuelve 401 sin cabecera `x-oporadar-alert-secret` y 503 cuando falten secretos. No conceder acceso al invocarla.
3. Crear Database Webhook en Supabase → Database → Webhooks: tabla `public.tema1_claim_alert_outbox`, evento INSERT, HTTP POST `https://jtyjdrrxmuppulbekfai.supabase.co/functions/v1/tema1-alerta-pedido`; configurar cabecera `x-oporadar-alert-secret` con mismo valor de Edge Functions Secrets, proteger secret con Vault si se crea por SQL. 
4. Para la solicitud pendiente original, disparar UNA prueba manual autenticada de la función usando los datos de la cola; los webhooks solo notifican nuevos INSERT. 
5. Verificar entrega real del email y que `email_sent_at` se actualiza. Nunca suponer que una respuesta HTTP 200 garantiza llegada a Bandeja de entrada.
6. Telegram: reutilizar el bot y n8n existentes. Configurar `OPORADAR_ALERT_N8N_WEBHOOK_URL` únicamente cuando el endpoint HTTPS esté probado y use `event_id` para evitar duplicados.
7. Retries: el webhook procesa cada alta nueva una vez. Configurar además un reintento programado de pendientes cuando se hayan validado email/Telegram. No marcar como enviado en errores.
8. Para emails comerciales permanentes podría requerirse un dominio remitente verificado. Probar primero envío a la cuenta propia; no garantizar que el dominio de pruebas de Resend sea válido para producción.

## Seguridad
- La cola contiene solo el ID de la solicitud. No guarda emails ni números de pedido de Amazon.
- La función consulta el estado real en Supabase y nunca aprueba compras.
- La función no habilita CORS. Exige un secreto de webhook.
- RLS activa en la cola, sin acceso anónimo ni usuarios autenticados.
- El correo enlaza al panel privado de GitHub Pages.
- Mantener Netlify/GitHub/Supabase hasta completar pruebas.

## Limitación
La Edge Function deja pendiente la reentrega cuando algún servicio falla. No hay cron configurado ni garantía de aviso al instante hasta conectar ambos canales y el mecanismo de reintentos.
