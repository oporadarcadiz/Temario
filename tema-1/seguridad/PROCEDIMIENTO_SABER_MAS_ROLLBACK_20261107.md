# Ejecución controlada de Saber Más — lote preparado 07/11/2026
**Estado: NO EJECUTADO.** Plan reproducible de puesta en servicio, no autorización.
No alterar PDF originales ni sus QR; n8n, Tema 2, vídeo largo y Banco Vivo quedan fuera.

## Referencia de respaldo de la versión pública
- Repositorio: `oporadarcadiz/Temario`
- Commit `main` comprobado: `ff31af9497fcf7f2412f4457179f01a36d243483` (inmutable).
- Los tres PDF originales están referenciados en ese commit:
  1. `tema-1-constitucion-parte1-saber-mas.pdf.pdf` (doble extensión ORIGINAL, no renombrar).
  2. `tema-1-constitucion-parte2-saber-mas.pdf`.
  3. `tema-1-constitucion-parte3-saber-mas.pdf`.
- QR públicos INMUTABLES: `/Temario/tema-1/saber-mas/` y `/Temario/tema-1/radar/`.
- Antes de retirar contenido público: realizar copia física de los tres binarios desde el commit anterior,
  conservar fuera de un directorio público con HASH SHA-256 individual, permisos privados y registro
  de tamaño, fecha y custodio. **No se ha efectuado todavía esta copia**: el commit remoto es
  referencia verificable, pero no sustituye un respaldo privado.
- Nunca usar como copia de seguridad un enlace público o una rama que vuelva a publicar los PDF.

## Estado del almacenamiento privado comprobado 07/11
- Supabase proyecto `jtyjdrrxmuppulbekfai`, bucket `tema1-premium` con `public=false`.
- Contiene actualmente `podcast-corto.m4a`; NO contiene ninguno de los tres PDF de Saber Más.
- Upload futuro autorizado al mismo bucket privado, sin sobrescribir ningún objeto existente:
  `saber-mas/parte-1.pdf`, `saber-mas/parte-2.pdf`, `saber-mas/parte-3.pdf`.
- Comparar SHA-256/tamaño por parte frente al respaldo ANTES de activar su disponibilidad.
  No añadir esos PDFs al build de Netlify, rama main, GitHub Pages ni a URL pública.

## Orden de implementación en un ensayo aislado, con autorización separada
1. Guardar dump de esquema, funciones, grants y filas de `tema1_order_claims` y
   `tema1_access`; guardar definiciones de las tres Edge actuales y la configuración
   Auth (sin compartir secretos). Ensayar restauración y documentar hashes.
2. Revisar `20261107_amazon_ediciones_ACCESO_NO_APLICAR.sql` y aplicar SOLO en entorno de
   prueba autorizado; NO ejecutar el borrador anterior
   `20261102_amazon_solo_acceso.sql` (concede por `ON CONFLICT(user_id)`).
   Comprobar columnas `product_edition`, `asin`, PK compuesta y RPC
   `tema1_approve_claim_v2`, sin conceder permisos a `anon`/`authenticated`.
3. Configurar **ASIN KDP reales** `TEMA1_KDP_ASIN_INDIVIDUAL`,
   `TEMA1_KDP_ASIN_GENERAL` en secretos del servidor, tras comprobar origen y edición.
   Definir por escrito y aprobar scopes permitidos para cada edición.
   Por defecto, `TEMA1_APPROVED_EDITION_SABER_MAS_SCOPES_JSON={}` => NINGÚN acceso.
4. Preparar Auth → Email Templates → Magic Link con `{{ .Token }}`, expiración
   breve, limitación de envíos/intentonas y SMTP. Verificar OTP con correo REAL
   bajo autorización; también código erróneo, vencido, reutilizado, OAuth y sin compra.
5. Subir los originales aprobados a Storage privado y verificar bytes/paths.
   Desplegar en ensayo el borrador `tema1-saber-mas` con JWT obligatorio; usar
   clientes `tema-1/acceso/index.html` y `tema-1/saber-mas/index.html` de la rama.
   Mantener `TEMA1_SABER_MAS_CONTENT_READY=false` hasta que todo el paso 6
   y la autorización editorial estén documentados.
6. Probar: invitado 401, OTP sin compra 403, pedido pending/rejected 403,
   ASIN incorrecto 403, edición sin scope 403, permiso caducado/revocado 403,
   OTP antiguo/reutilizado 401, fallo Storage 503, comprador legítimo 200
   con URL firmada 60 segundos. Probar URL temporal vencida y logout,
   acceso directo/cache de PDF y descarga en dispositivo real.
7. Solo tras aceptación: fusionar/desplegar una vez la ruta pública con botones
   que llamen al servidor y la retirada de las tres copias PDF de ramas
   publicadas y de cualquier espejo/caché controlable. Mantener QR y rutas.
   Comprobar GET anónimo de cada URL antigua con y sin cache-busting y desde
   navegador SIN sesión: 404/403, no PDF. Comprobar cabeceras Content-Type,
   Content-Disposition, Cache-Control y que ninguna página publique el binario.
8. Solo cuando el punto 7 sea real, aprobar `TEMA1_SABER_MAS_CONTENT_READY=true`
   y alcance/edición específico. Repetir prueba de compra real y URL firmada.

## Marcha atrás SEGURA (sin reexponer los PDF)
- En fallo, poner el interruptor editorial en false, revocar/suspender la entrega
  de URLs nuevas, conservar PDFs privados y los QR visibles hacia una pantalla
  `Disponible en breve`. No restaurar páginas con href a PDF públicos.
- Revertir los commits de la landing y Edge solo a una versión **sin archivos
  públicos**, no al commit main inseguro como producción.
- Si falla SQL, desactivar el administrador de aprobaciones primero, restaurar
  esquema/funciones desde copia ensayada. No revertir PK compuesta si ya hay dos
  compras de un mismo usuario: reconciliar y respaldar antes, sin perder derechos.
- Mantener registro del incidente/roles probados y esperar nueva aprobación.

## Evidencias ya comprobadas / pendientes
- V8 con la fuente de GitHub y clientes Supabase/Storage simulados: 13/13 casos
  401/403/503/200 correctos y sin URL en denegaciones. **NO HTTP ni Deno reales**.
- Test Node preparado: `node --test web/tests/saber-mas-private.test.cjs`.
  **No ejecutado aún en Node contra checkout/servidor reales.**
- PENDIENTES: respaldo físico, ASIN/aprobación editorial, migración SQL de ensayo,
  carga privada, correo real, retiro de copias públicas y prueba HTTP real.
