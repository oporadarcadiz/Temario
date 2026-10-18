# Coordinación Juegos ↔ Web Chat · Tema 1

Actualizado: 18/10/2026. Esta rama es una propuesta. No se ha modificado la rama de Web Chat ni los QR del PDF.

## Menú de juegos terminado a nivel de archivos

- Menú: `/tema-1/juegos/menu-memoria/` (archivo `tema-1/juegos/menu-memoria/index.html`).
- Pendientes: `/tema-1/juegos/menu-memoria/en-construccion.html?juego=<identificador>`.
- Cada tarjeta pulsa una URL existente o una ficha «En construcción», con estado visible.
- Estilo adulto, centrado en recuperación de memoria y vocabulario; sin contraseña ni cobro.
- El recurso «Artículo en imagen» está EN CONSTRUCCIÓN: no confundirlo con «Mapa constitucional» existente, que no exige siempre identificar el número del artículo.

## Integración solicitada a Web Chat

1. Integrar **solo los dos HTML nuevos** de esta rama en el despliegue del repositorio `Temario`, conservando el resto del trabajo de Web Chat (`preventa-tema1-seguridad`).
2. En la sección **Juegos y actividades** de `tema-1/radar/index.html` añadir **un enlace destacado** a `../juegos/menu-memoria/` («Ver todos los entrenamientos de memoria»). Mantener enlaces individuales ya existentes o sustituirlos solo tras inspección de accesibilidad.
3. No alterar la ruta permanente del QR Radar Digital `/tema-1/radar/`, Saber más `/tema-1/saber-mas/`, ni la maquetación de las 47 páginas. El menú es un destino secundario y no requiere QR nuevo.
4. No añadir Audios/Vídeos al menú de juegos. No configurar contraseñas, pasarela ni Supabase en esta tarea.
5. Mantener el menú como **propuesta/noindex** hasta aprobarlo. Antes de incorporar enlaces comerciales, comprobar qué contenido debe ser demo público y cuál de pago.

## Destinos de código enlazados

**Temario**: `../fichas-radar.html`, `../nivel1-conceptos.html`, `../caza-la-trampa.html`, `../nivel2-disposiciones.html`, `../nivel3-test.html`, `../../simulacro/`, `../../mis-fallos/`.

**Tarjetas-repaso / Centro Radar** (actuales en código):
- `.../juegos/centro-radar/tema-1/?modo=visual&radar=4`
- `.../juegos/centro-radar/tema-1/?modo=tarjetas&radar=4`
- `.../juegos/centro-radar/tema-1/?modo=completa&radar=4`
- `.../juegos/centro-radar/tema-1/?modo=real&radar=4`
- `.../juegos/centro-radar/tema-1/` (selector general)
- `.../juegos/centro-radar/traduce-juridico/`

El parámetro `modo` está reconocido en `juegos/centro-radar/tema-1/app.js`. El modo `real` contiene preguntas atribuidas que no deben certificarse como literalmente verificadas sin auditoría.

## Comprobaciones antes de publicar

- Probar con viewport 390px y 320px, orientación móvil vertical, scroll y foco de teclado.
- Desde Radar Digital -> menú -> fichas/vocabulario/trampas/disposiciones/test -> volver; desde cada juego pendiente -> «En construcción» -> volver.
- Comprobar respuestas y botones en Chrome y Safari (si es posible dispositivo físico).
- Confirmar publicación de las rutas Github Pages y Netlify. El estado «archivo existente» no equivale a contenido editorial validado.
- Las rutas publicadas actualmente no garantizan protección premium; no presentarlas como contenido exclusivo.

## Inventario pendiente

En construcción: «Artículo en imagen», «Imagen y concepto», «¿Quién hace qué?», «Empareja», «Radar Express». Estas actividades no inventan preguntas ni resultados.
