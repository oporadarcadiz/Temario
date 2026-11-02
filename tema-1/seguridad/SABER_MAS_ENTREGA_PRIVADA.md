# M-048 / M-083 — Saber Más privado (plan de integración, NO desplegado)

**Estado: borrador técnico en rama `preventa-tema1-seguridad`. NO ES UNA PROTECCIÓN ACTIVA EN PRODUCCIÓN.**

## Diagnóstico confirmado el 02/11/2026

La ruta del QR `/Temario/tema-1/saber-mas/` sigue existiendo. En producción, los PDF `tema-1-constitucion-parte1-saber-mas.pdf.pdf`, `tema-1-constitucion-parte2-saber-mas.pdf` y `tema-1-constitucion-parte3-saber-mas.pdf` de GitHub Pages devolvieron HTTP 200 sin sesión. Ocultar un enlace en HTML no protege el archivo: **siguen expuestos mientras las copias estáticas estén servidas**.

En esta rama:
- `tema-1/saber-mas/index.html` ya no incluye los `href` públicos. Conserva la ruta QR, identificación, diseño, texto BOE gratuito y acceso al Radar gratuito.
- Los tres botones piden un enlace temporal al endpoint `/functions/v1/tema1-saber-mas?part=N`. Si no existe, no está autorizado o el PDF aún no está cargado, fallan cerrados sin entregar enlace.
- `tema-1/seguridad/edge/tema1-saber-mas/index.ts` es un **borrador no desplegado**. Reutiliza el patrón de `tema1-premium-video`, Auth JWT, `tema1_access`, `tema1_order_claims` y Storage `tema1-premium` privado.
- Requiere `active=true`, `expires_at` vigente, `source_claim_id` asociado al usuario, `channel=amazon` y `status=verified`; solo entonces firma el objeto correspondiente durante 60 segundos. No confundir formato de pedido con compra real.

**No hay PDF cargado** en las tres rutas privadas de destino:
`saber-mas/parte-1.pdf`, `saber-mas/parte-2.pdf`, `saber-mas/parte-3.pdf`.
No subir nada hasta autorización editorial y comprobación de edición/alcance. **Las tres copias PDF se han eliminado únicamente de la rama de preparación** (commits 7729f69f, 2670628e, 44d1564c), y se ha verificado que siguen intactas en la rama principal: no hay retirada ni protección de producción todavía. No borrar fuentes maestras ni activar la retirada pública hasta verificar respaldos y aprobar el despliegue.

## Secuencia de puesta en marcha (requiere revisión y autorización separadas)

1. Revisión Editorial certifica las tres versiones, derechos y acceso por edición. Conservar maestros originales privados y verificar respaldos.
2. Revisar el código Edge con pruebas negativas, permisos de service role, CORS, límites y almacenamiento. Mantener `verify_jwt=true` al desplegar; no cambiar RLS ni conceder permisos masivos.
3. Tras aprobación, subir únicamente PDFs certificados al bucket **privado** `tema1-premium`, nunca a GitHub, Drive público ni a archivos web. Verificar `public=false`.
4. Desplegar la función con autorización específica y comprobar su respuesta real por rol. No publicar la página con botones activos si la función no está lista.
5. Retirar de la rama y, en el despliegue autorizado, de la fuente publicada **las tres copias estáticas**. Comprobar los tres enlaces históricos anónimos con HTTP 403/404 (incluidas variantes/caché/CDN). Revisar otros mirrors/hosts y el historial; las copias ya descargadas no pueden revocarse.
6. Probar las URLs QR originales, enlaces BOE y demos gratuitas, la descarga temporal del comprador y su caducidad. No prometer protección absoluta contra redistribución durante el plazo de firma.
7. Solo después de todas las pruebas, valorar integrar la rama en el despliegue único del 10/11, sujeto a aprobación expresa.

## Matriz mínima de QA pendiente (no declarar aprobada sin ejecución real)

| Caso | Resultado esperado |
|---|---|
| Visitante sin JWT | 401, sin URL |
| JWT inválido/expirado o usuario anónimo | 401, sin URL |
| Usuario registrado, pedido pendiente | 403, sin URL |
| Pedido rechazado | 403, sin URL |
| Acceso activo sin solicitud Amazon verificada | 403, sin URL |
| Permiso revocado o caducado | 403, sin URL |
| Comprador aprobado y archivo aún no cargado | 503, `ready:false`, sin URL |
| Comprador aprobado, archivo certificado y privado | 200, URL firmada con TTL 60 s |
| Petición `part` desconocida | 400, sin URL |
| CORS origen no permitido | preflight 403 |
| PDF antiguo de GitHub Pages tras retirada autorizada | 403/404 sin sesión |
| QR /tema-1/saber-mas/ y /tema-1/radar/ | rutas intactas; BOE y demos sin compra |
| Dispositivo móvil/ordenador y cierre de sesión | probar navegadores reales, no solo DOM emulado |

**Validación ejecutada en esta preparación:** lectura de vuelta desde GitHub; análisis estático V8 del módulo cliente (sintaxis correcta); 10 comprobaciones de invariantes: ausencia de enlaces directos, 3 botones, BOE y Radar libres, rutas estables, JWT, verificación Amazon, cierre por defecto, TTL y no despliegue. **No son pruebas de servidor, navegador real ni comprador real.**

## Dependencias y límites

- La tabla `tema1_access` actual es un permiso general del Tema 1; antes de conceder permisos a compradores de dos ediciones distintas, revisar ASIN/edición y alcance contractual, sin abrir acceso a otros tomos.
- Las 120 preguntas del simulacro y los juegos premium siguen pendientes de certificación; `tema1-games-access` debe permanecer con `content_ready:false`.
- No modificar libros, preguntas, QR, permisos de producción, funciones Edge desplegadas, RLS, cobros ni Netlify en esta fase.
- No anunciar PDF/eBook/Kindle: **venta comercial prevista exclusivamente de libros físicos Amazon KDP**.
