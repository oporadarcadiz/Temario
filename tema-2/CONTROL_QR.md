# OpoRadarCádiz — Contrato de QR único por tema

**Decisión vigente:** exactamente **un Centro de Juegos y un único QR por cada tema**. Todos los juegos, test, ejercicios, vídeos, pódcasts, Saber más y futuras ampliaciones se incorporarán dentro del centro de su tema, sin nuevos QR ni portadas independientes.

## Direcciones canónicas (rutas inmutables)

| Libro | Única URL de QR del Centro de Juegos |
| --- | --- |
| Tema 1 | `/tema-1/radar/` |
| Tema 2 | `/tema-2/radar/` |

**Importante:** son rutas, no URLs finales completas. Antes de convertirlas en QR impresos, Web Chat debe confirmar el dominio definitivo, HTTPS válido y respuestas HTTP 200 en producción. El Tema 1 conserva su URL ya existente; no se cambia ni se reimprime su QR.

## Cómo están preparadas las páginas

- `tema-1/radar/index.html`: sigue siendo el único punto de entrada canónico del Tema 1. Contiene navegación hacia sus actividades y recursos, y un enlace al Centro Tema 2. Las rutas internas antiguas siguen vigentes.
- `tema-2/radar/index.html`: contiene **9 actividades** inicialmente rotuladas «En preparación» y **la sección `#recursos`** con vídeo, pódcasts y Saber más (tres fichas pendientes). Todo en la misma página con adaptación móvil, acceso de vuelta al Tema 1 y sin juegos premium liberados.
- `tema-2/extras/index.html`: se conserva **solo como redirección técnica de compatibilidad** hacia `../radar/#recursos`. No es un segundo centro, no se anuncia y **NO se crea un QR para /tema-2/extras/**.
- `tema-1/juegos/menu-memoria/index.html`: submenú/actividad histórica del Tema 1 conservado para evitar enlaces rotos. **No usarlo como QR principal**.
- `netlify.toml` en la rama Juegos: copia `tema-1` y `tema-2` en el build y conserva la exclusión de PDF en ambos. No reemplazar la seguridad en `preventa-tema1-seguridad`.

## Límites editoriales y de seguridad

- Tema 2: no hay preguntas ni juegos completos certificados para activar. Las nueve fichas son marcadores visuales no clicables; no hay datos premium ni archivos multimedia.
- Tema 1: banco 120 pendiente de certificación editorial para el Test Final. El código de juegos ya existente en repos públicos **NO** se considera protegido por ocultar botones. Las rutas premium solo se habilitarán tras protección comprobada en servidor con autenticación y permisos por edición.
- Ningún cambio en QR originales, pedidos Amazon, Supabase, ventas, contratos, PDFs originales, PR de otros equipos o producción.

## Pruebas y acción para Web Chat

1. Comprobar la única ruta canónica de cada tema después de integrar selectivamente las páginas en la rama segura, conservando rutas anteriores, sin fusionar indiscriminadamente PR.
2. Verificar desde móvil y ordenador: `/tema-1/radar/` y `/tema-2/radar/`, regreso entre ambos, secciones, ausencia de contenido premium público, HTTP 200 y HTTPS.
3. Confirmar que un acceso legado a `/tema-2/extras/` lleva a la sección `/tema-2/radar/#recursos`, nunca lo entregar como QR nuevo.
4. Dar a PDF Chat **solo dos URLs completas finales** (una por tema), una vez verificada producción y autorizada publicación.

**Estado:** páginas modificadas en PR de Juegos Chat, sin fusión ni despliegue. QR del Tema 2 **NO listo para imprimir** hasta verificación del dominio y de la ruta pública.
