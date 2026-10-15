# Automatizaciones de OpoRadarCádiz

## Bandeja de Telegram v1

`OpoRadarCadiz_Bandeja_Telegram_v1.json` recibe enlaces y PDF enviados al bot de OpoRadarCádiz y los guarda en `COLA_REVISION`.

Controles incluidos:

- restringe la entrada al usuario y chat autorizados;
- genera un identificador estable para deduplicar el mismo enlace;
- deja la publicación en estado pendiente y bloqueado;
- no usa modelos de IA;
- confirma en Telegram que el material se ha recibido.

El flujo se importa desactivado. Antes de publicarlo hay que probar un enlace, un PDF, un mensaje sin enlace y un mensaje de un usuario no autorizado. La aprobación y la escritura en la web deben añadirse después de verificar las credenciales de Telegram, Google Sheets y Supabase en la instancia real.
