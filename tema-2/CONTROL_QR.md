# OpoRadarCádiz · Tema 2 · Control de páginas y QR

**Estado:** páginas HTML y enlaces preparados en rama; **NO publicados**, **NO verificados por HTTP en producción**, **NO generar/imprimir QR finales hasta comprobar el destino público**.

## Dos destinos estables reservados

- **Centro de Juegos (QR de entrada del libro):** ruta `/tema-2/radar/`, archivo `tema-2/radar/index.html`.
- **Extras del Tema 2 (QR de material complementario):** ruta `/tema-2/extras/`, archivo `tema-2/extras/index.html`.
- **Tema 1 (QR existente, INALTERADO):** `/tema-1/radar/`.

Se conocen referencias históricas al subdominio `web-oporadarcadiz.netlify.app`, pero antes de maquetar el QR impreso **Web Chat debe confirmar cuál es el dominio de producción actual** y obtener HTTP 200 con TLS válido, redirecciones correctas y página real sin autenticación para ambas rutas. No usar URLs de una rama GitHub como destino de impresión. Las direcciones relativas están preparadas para mantener estables los QR cuando se añadan los juegos.

## Archivos en rama existente de Juegos Chat

- `tema-2/radar/index.html`: portada visual del Centro de Juegos Tema 2 con nueve modalidades previstas, **todas marcadas «En preparación» y no clicables**, navegación a Tema 1, Extras y Estudiar; diseño adaptable a móvil.
- `tema-2/extras/index.html`: destino estable del QR para vídeo, pódcast y Saber más. Son tres fichas **sin medios, PDF ni enlaces privados** hasta revisión editorial y despliegue seguro.
- `tema-1/radar/index.html` y `tema-1/juegos/menu-memoria/index.html`: enlaces al Tema 2 añadidos sin cambiar los nueve juegos, el QR ni los destinos existentes.
- `netlify.toml`: conserva compilación desde `web/`, copia `tema-1` y `tema-2`, y excluye PDF en ambos directorios. Se reutiliza la protección de copia PDF de la rama Web `preventa-tema1-seguridad`. **No desplegar sin comprobar que la configuración de producción real coincide y supera la seguridad.**

**No se ha creado ningún banco ni ninguna pregunta Tema 2.** Revisión Editorial sigue pendiente de certificar su temario. Ni etiquetas de preguntas oficiales, ni ventas, ni contenido premium se anuncian como disponibles.

## Pruebas de código (no sustituyen navegación real)

Verificación posterior a los commits con relectura GitHub: **12/12 controles estáticos PASS**: ambas páginas nuevas, nueve tarjetas de juegos, sin scripts ni ficheros privados, sin material extra, CSS responsive, QR Tema 1 conservado, enlaces T1/T2 cruzados, nueve accesos T1 conservados, copia de Tema 1 y 2 a salida Netlify, exclusión de PDF de ambos, rutas internas resueltas a archivos previstos. **No se ha ejecutado build Netlify, navegador físico ni pruebas HTTP 200 de la rama en sitio web.**

## Bloqueo para Web Chat antes de entregar QR al libro

1. Revisar la PR existente de Juegos Chat `propuesta-menu-memoria-visual` frente a `preventa-tema1-seguridad`, asegurando que los cambios de seguridad existentes no se revierten.
2. Integrar **únicamente las dos páginas estáticas de Tema 2 y su navegación segura** cuando se autorice, sin fusionar contenido del Tema 1 aún bloqueado por razones editoriales/de seguridad.
3. Desplegar solo tras aprobación y comprobar `https://DOMINIO_CONFIRMADO/tema-2/radar/` y `/tema-2/extras/`, sin mostrar materiales no aprobados.
4. Verificar en móvil y ordenador la navegación de entrada y regreso, HTTP 200, certificado HTTPS, y que los QR existentes de Tema 1 mantienen sus destinos. Solo entonces entregar las **dos URLs completas y exactas** a PDF Chat para generar y verificar códigos QR de portada y cierre del Tema 2.

No modificar original del libro ni los QR ya impresos. No hay coste, fusión ni publicación realizada por Juegos Chat.
