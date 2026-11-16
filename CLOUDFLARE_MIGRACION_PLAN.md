# Migración a Cloudflare Pages · OpoRadarCádiz

**Estado:** preparación en rama de revisión; no se ha conectado Cloudflare ni sustituido Netlify.

## Crear el proyecto

- Plataforma: **Cloudflare Pages**, integración **GitHub**.
- Repositorio: `oporadarcadiz/Temario`.
- Rama de producción inicial: `migracion-cloudflare-web-20261116` (lanzamiento de prueba; cambiar a rama aprobada después).
- Framework preset: **None**.
- Root directory: directorio raíz del repositorio (vacío o `/`).
- Build command: `bash scripts/build-cloudflare-pages.sh`.
- Build output directory: `.cloudflare-dist`.
- No se necesitan variables de entorno ni claves secretas para construir la web estática.

Esta compilación publica únicamente las páginas y preguntas GRATUITAS de `web/`.
**No** publica PDF originales, material del Centro de Estudio, Banco Vivo, rutas de administración, SQL, Edge Functions, ni juegos privados.

## QR del libro

Mantener `https://oporadarcadiz.github.io/Temario/tema-1/...` y Supabase activos; los QR no dependen de Netlify si están impresos con esas direcciones.
Los enlaces internos `/tema-1/*` de Cloudflare se redirigen temporalmente a GitHub Pages.

Los QR impresos con un dominio Netlify **no sobrevivirán si se da de baja ese dominio**, salvo que se cambien en la copia del libro o se conserve el host / redirección. Validar los siete QR de la revisión antes de cortar Netlify.

## Pruebas antes de sustituir Netlify

1. Revisar URL `.pages.dev`, inicio, convocatorias, cuentas y cinco preguntas de cada ruta.
2. Confirmar que Banco Vivo, compras y recursos privados no están en la salida publicada.
3. Verificar Google Pages/OTP y la política de redirecciones; el Aula OpoRadar conserva GitHub Pages y Supabase.
4. Probar comprador aprobado y comprador sin permiso; NO confundir email OTP con compra verificada.
5. Mantener Netlify hasta comprobar todas las rutas antiguas, especialmente QR.
6. Para notificaciones: email independiente desde Supabase Edge Function + proveedor de correo (requiere cuenta/API secret y remitente autorizado), Telegram separado mediante n8n. Nunca aprobar pedidos desde un aviso.

**Ninguna configuración de Cloudflare se ha aplicado ni se han desplegado cambios de credenciales.**
