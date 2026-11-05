# M-083 — Contrato de autorización por edición (BORRADOR, NO DESPLEGADO)
Fecha: 2026-11-05. Rama de preparación. Ningún acceso se concede por este documento.

## Hallazgo reproducible por inspección de código
La migración `20261102_amazon_solo_acceso.sql` crea/actualiza `tema1_access` mediante `ON CONFLICT(user_id)`; por tanto solo representa un derecho por usuario. No diferencia ASIN, edición, recurso ni compra múltiple. `p_review_note` no sustituye evidencia independiente de compra. **NO APLICAR** esta migración como está.

## Contrato mínimo previo a implementación
- Identidad: JWT válido de Supabase Auth, email verificado mediante OTP nuevo para cada sesión premium; el OTP prueba identidad, nunca pago. Caducidad corta y límites de envío/intentonas; SMTP y antiabuso verificados.
- Solicitud: usuario propietario, canal amazon, referencia normalizada, edición identificada por ASIN real de catálogo aprobado, estado pending/verified/rejected y registro administrativo de comprobación individual. Rechazar duplicado/reutilización entre cuentas; revisión manual no equivale a garantía antifraude de Amazon.
- Derecho: entidad por (user_id, product_edition, resource_scope), con fuente de solicitud verificada y estado activo, vencimiento/revocación. No sustituir derechos previos mediante conflicto solo en user_id. Un libro individual solo habilita Tema 1; un libro general no habilita automáticamente recursos no terminados.
- Autorización: para cada solicitud al backend, validar JWT, usuario, derecho específico, solicitud vinculada verificada, edición y recurso solicitado, bandera editorial ready. Denegar por defecto; no confiar en campos enviados por navegador.
- Entrega: preguntas/soluciones corregidas en servidor; multimedia en bucket privado con firma breve y sin objetos premium públicos. Una firma emitida puede seguir funcionando hasta vencer; no prometer revocación instantánea.
- Stripe: servicio Banco Vivo separado de libro físico KDP. Checkout TEST + webhook con firma, idempotencia y concesión por producto únicamente tras evento de pago válido. No usar confirmación de navegador como pago.

## Pruebas negativas obligatorias (pendientes)
1. Anónimo sin JWT -> 401, sin contenido.
2. JWT de otro usuario -> 403.
3. OTP correcto pero sin compra -> 403.
4. Pedido pending/rejected -> 403.
5. Referencia duplicada de otra cuenta -> denegación y revisión.
6. ASIN ausente/desconocido o edición no concordante -> 403.
7. Compra individual pide material exclusivo general -> 403.
8. General pide material aún no certificado -> 403/503, nunca descarga.
9. Dos compras legítimas del mismo usuario -> derechos independientes.
10. Permiso caducado/revocado -> 403.
11. URL directa pública de PDF/JS/MP3/MP4 premium -> 403/404 sin sesión.
12. URL firmada vencida -> denegación.
13. Webhook Stripe duplicado o falsificado -> no doble concesión.
14. OTP vencido/reutilizado o demasiados intentos -> denegación/rate-limit.
15. Acceso QR público a demos y BOE -> funciona sin conceder premium.

## Puertas GO/NO-GO
NO-GO hasta: decisión editorial de ASIN y alcance, esquema probado en entorno aislado con rollback, SMTP real y OTP, auditoría de rutas públicas, Storage privado, pruebas por rol, verificación administrativa Amazon, pruebas Stripe TEST para Banco Vivo y autorización expresa. No modificar SQL/RLS/Edge de producción ni fusionar o desplegar antes de GO. Vídeo largo y audios asociados: intocables.

## Implementación preparada hoy — solo en rama, no publicada
- El acceso por correo de `tema-1/acceso/index.html` y la puerta de Saber Más utilizan la misma clave de `sessionStorage` (`oporadarcadiz-premium-session-v1`) para no heredar la sesión gratuita persistida por Google/OAuth y solicitar OTP al abrir nueva sesión premium. La misma clave se utiliza en el formulario independiente `web/acceso-premium.html` del Banco Vivo cuando se sirve desde el mismo origen.
- Borrador Edge `tema-1/seguridad/edge/tema1-games-access/index.ts`: mapa de nueve identificadores: **ocho rutas privadas futuras y un identificador de Test Final expresamente bloqueado**; no incluye banco, claves ni respuestas, y no altera los juegos. Cada uno tiene bandera propia `TEMA1_GAME_READY_<ID>` y configuración por edición/ASIN. El simulacro `simulacro-final` NO tiene archivo estático que entregar ni se habilita con una bandera: necesita selección aleatoria SIN reemplazo de 40 entre 120 preguntas certificadas, ejecutada en el servidor. Su bloqueo no interfiere con las ocho rutas privadas de los demás juegos.
- Borrador Edge `tema-1/seguridad/edge/tema1-saber-mas/index.ts`: distingue partes 1–3 y ediciones/ASIN; ambos endpoints comprueban con `admin.auth.getUser(jwt)` la identidad y después exigen el método **OTP** en `amr` del JWT y una antigüedad máxima de ocho horas. Son controles adicionales: falta prueba real con JWT de Supabase para comprobar comportamiento en sesiones renovadas y que la plantilla envíe códigos de seis cifras. Si la tabla sigue sin edición/ASIN, el SELECT falla CERRADO y no hay entrega.
- El backend **no está desplegado**. Ningún juego ni PDF se entrega desde estos borradores. Para autorizar un recurso concreto, Juegos Chat debe aportar su dataset **privado** y su visto bueno funcional y Editorial debe confirmar la revisión pertinente de ese recurso; **la espera del Test Final no bloquea por sí misma las otras ocho actividades**.
- Las muestras y el código de juego siguen públicos; retirar del origen público solo los bancos, claves y soluciones considerados exclusivos. El mero hecho de esconder botones no sirve para un paywall. Mantener el QR y la ruta pública del Centro de Juegos.
- Contrato de integración para Juegos Chat: `GET /functions/v1/tema1-games-access?resource=<slug>` con JWT de sesión premium OTP y objeto privado existente; devuelve `allowed, content_ready, resource, url, expires_in_seconds` únicamente al titular autorizado o error sin URL. Identificadores autorizados: `articulo-imagen`, `mapa-constitucional`, `fichas-radar`, `vocabulario-juridico`, `candado-4911`, `caza-trampa`, `completa-frase`, `test-radar`, `simulacro-final`. No habilitar JSON premium hasta comprobar que no hay copia pública.
- QA V8 de fecha 05/11: **16/16 casos** del comprobador OTP sobre los dos borradores (método otp, OAuth, caducado, futuro, sujeto distinto, sin session_id, mal formado, renovación) y **8/8** invariantes de estructura; pruebas sobre JWT simulado **no equivalen** a Deno, Supabase real ni navegador. Pruebas Node preparadas en `web/tests/premium-security-contract.test.cjs`; no ejecutadas en Node real. La separación por ASIN y las políticas RLS siguen pendientes de migración y prueba de rollback.
