# Coordinación Juegos ↔ Web Chat · Tema 1

Actualizado: 18/10/2026. Esta rama es una propuesta. No se ha modificado la rama de Web Chat ni los QR del PDF.

## Menú de juegos terminado a nivel de archivos

- Menú: `/tema-1/juegos/menu-memoria/` (archivo `tema-1/juegos/menu-memoria/index.html`).
- Prototipo creado: `/tema-1/juegos/menu-memoria/articulo-en-imagen.html`. Ocho dibujos vectoriales sobrios y respuestas abiertas por número de artículo; pista opcional, explicación de apartado y registro local de aciertos, dudas y fallos. Requiere prueba funcional en móvil y aprobación editorial; NO anunciar como versión final y reemplazar ilustraciones por Gemini solo cuando estén verificadas.
- Pendientes: `/tema-1/juegos/menu-memoria/en-construccion.html?juego=<identificador>`.
- Cada tarjeta pulsa una URL existente o una ficha «En construcción», con estado visible.
- Estilo adulto, centrado en recuperación de memoria y vocabulario; sin contraseña ni cobro.
- El recurso «Artículo en imagen» está EN CONSTRUCCIÓN: no confundirlo con «Mapa constitucional» existente, que no exige siempre identificar el número del artículo.

## Integración solicitada a Web Chat

1. Integrar **los archivos modificados y nuevos de esta rama** de esta rama en el despliegue del repositorio `Temario`, conservando el resto del trabajo de Web Chat (`preventa-tema1-seguridad`).
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

Prototipo jugable EN REVISIÓN: «Artículo en imagen». En construcción: «Imagen y concepto», «¿Quién hace qué?», «Empareja», «Radar Express». Estas actividades no inventan preguntas ni resultados.

## Verificaciones estáticas del prototipo (18/10/2026)

- Se verificó desde GitHub la existencia de 8 tarjetas con ID único, número de artículo y apartado coherentes.
- Menú enlaza al HTML real; los 4 pendientes restantes enlazan a su ficha; sin contraseñas.
- Pruebas de navegación por navegador móvil real, sincronización, y lectura de todos los gráficos SVG siguen **pendientes**. No equivale a prueba de uso en iOS/Android.
- El ejemplo de soberanía art. 1.2, bandera 4.1, igualdad 14, domicilio 18.2, participación 23.1, enseñanza 27.4, Cortes 66.1 y municipio 140 proviene de los bloques del PDF de 47 páginas (nivel 3). No adicionar artículos ni presentar preguntas como exámenes oficiales.

## Avance funcional adicional · 18/10/2026

- Entrada histórica `tema-1/juegos/index.html`: sustituido el texto antiguo «no hay índice público» por redirección accesible al menú `menu-memoria/`. **La decisión actual es que SÍ habrá menú de juegos**.
- `tema-1/juegos/fichas-radar.html`: pulsar Acerté/Dudé/Fallé registra la valoración pero deja visible la respuesta hasta pulsar el botón nuevo «Siguiente ficha». No se modifica su banco.
- Repo `Tarjetas-repaso`, PR https://github.com/oporadarcadiz/Tarjetas-repaso/pull/1: `Traduce el jurídico` mantiene su explicación visible tras marcar; botón manual «Siguiente tarjeta». Esta PR es **separada y en borrador**; no asumir desplegada.
- Menú ampliado a **20 recursos**: añade detector verdadero/falso y las 13 tarjetas de vocabulario existentes; no crea una colección nueva.
- Están redactados 8 encargos coherentes para Gemini en `PROMPTS_ILUSTRACIONES_GEMINI.md`, para los artículos 1.2, 4.1, 14, 18.2, 23.1, 27.4, 66.1 y 140. Reemplazo de SVG solo tras validación de imágenes, no automático.
- En `Tarjetas-repaso` también existe un Test Radar antiguo alimentado por Google Sheets. No se ha integrado directamente como entrada nueva hasta verificar demo/banco y no exponer preguntas comerciales: el menú enlaza el Test Tema 1 existente.
- Verificaciones de código fuente: el JS modificado compila, no hay IDs HTML duplicados ni referencias DOM a IDs ausentes. Esto NO equivale a ejecutar los juegos en Chrome/Safari.
- Todas las operaciones están en ramas y solicitudes de integración en borrador; no se tocaron bancos, PDF, QR, autenticación, pagos ni flujos n8n.
