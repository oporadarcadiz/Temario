# Contrato para Web Chat — Centro de Juegos del Tema 1

Actualizado 18/10/2026. Este documento sustituye el listado anterior de 20 tarjetas visibles. **El repositorio conserva los recursos; el menú principal se ha reducido a 9 accesos.**

## Decisiones definitivas de diseño
- Sí hay menú de juegos, en `/tema-1/juegos/menu-memoria/`. La ruta histórica `/tema-1/juegos/` redirige al nuevo menú.
- **Marca**: mismos colores que `web/styles.css`: azul noche `#08182d`, azul profundo `#061222`, dorado `#f6cb78`, texto `#f3f3f0`, texto secundario `#b4c1d0`. Tipografía DM Sans y Playfair Display. No usar la paleta antigua del menú.
- **No habrá «Mis errores» centralizado** en el menú ni agregación de datos entre juegos. Cada actividad conserva sus fallos y dudas por separado, según su propio funcionamiento.
- No duplicar bancos ni juegos, no implementar contraseñas/pagos, no modificar PDF, QR ni convocatorias.
- Recursos alojados en GitHub Pages usan otro origen de navegador. No anunciar sincronización del progreso con Netlify.

## Menú actual (9 accesos)
| Grupo | Nombre visible | Ruta |
| --- | --- | --- |
| Memoria visual | Artículo en imagen | `/tema-1/juegos/menu-memoria/articulo-en-imagen.html` |
| Memoria visual | Mapa constitucional | `https://oporadarcadiz.github.io/Tarjetas-repaso/juegos/centro-radar/tema-1/?modo=visual&radar=4` |
| Fichas y vocabulario | Fichas Radar | `/tema-1/juegos/fichas-radar.html` |
| Fichas y vocabulario | Vocabulario jurídico | `/tema-1/juegos/menu-memoria/vocabulario-juridico.html` |
| Fichas y vocabulario | El candado 4-9-1-1 | `/tema-1/juegos/nivel2-disposiciones.html` |
| Precisión y examen | Detecta el error (Caza la trampa) | `/tema-1/juegos/caza-la-trampa.html` |
| Precisión y examen | Completa la norma | `https://oporadarcadiz.github.io/Tarjetas-repaso/juegos/centro-radar/tema-1/?modo=completa&radar=4` |
| Precisión y examen | Test Radar | `/tema-1/juegos/nivel3-test.html` — redirige al modo mixto de Centro Radar |
| Precisión y examen | Simulacro | `/tema-1/simulacro/` |

El recurso **Vocabulario jurídico** es una puerta de entrada, no un banco duplicado. Integra:
- `/tema-1/juegos/nivel1-conceptos.html` — Conceptos constitucionales.
- `https://oporadarcadiz.github.io/Tarjetas-repaso/juegos/tarjetas-radar/vocabulario-tema-1/` — Tarjetas de vocabulario.
- `https://oporadarcadiz.github.io/Tarjetas-repaso/juegos/centro-radar/traduce-juridico/` — Traduce el jurídico, con arreglo funcional pendiente en PR https://github.com/oporadarcadiz/Tarjetas-repaso/pull/1.

## Recursos pendientes, NO visibles como juegos disponibles
«Imagen y concepto», «¿Quién hace qué?», «Empareja» y «Radar Express» se mencionan en una única nota **En construcción**. Mantener sus fichas antiguas para compatibilidad, pero no mostrarlas como cuatro nuevas tarjetas. Otras modalidades del Centro Radar se conservan en sus propios archivos y submenús.

## Cambios realizados en rama de propuesta
- Menú rediseñado y reducido, nueva pantalla de vocabulario `vocabulario-juridico.html`.
- Fichas Radar y Traduce el jurídico: controles de valoración no avanzan automáticamente, la explicación queda visible y debe pulsarse Siguiente (Traduce en PR aparte).
- Caza la trampa: respuesta + explicación hasta pulsar Continuar, acceso visible al menú y teclado sin secuestrar el foco de enlaces.
- Artículo en imagen: 8 JPG aprobados, SVG de respaldo, memoria activa, revisión de dudas y errores en el propio juego. El mapa de Cádiz es ilustración de concepto, NO cartografía exacta.
- Conceptos, disposiciones y simulacro tienen enlace de regreso al menú. Las aplicaciones externas deberán comprobarse en su propio dominio antes de afirmar que tienen enlace de vuelta.
- Otros juegos no se han reconstruido ni se han movido sus bancos.

## Integración segura por Web Chat
1. Mantener la rama de Web Chat `preventa-tema1-seguridad` como base de su trabajo. Revisar PR borrador https://github.com/oporadarcadiz/Temario/pull/1: puede haber conflictos de fusión y hay que resolverlos conservando el trabajo de ambas ramas.
2. Desde Radar Digital `/tema-1/radar/`, enlazar «Entrena tu memoria» a `../juegos/menu-memoria/`; **no cambiar las URL de QR del libro**.
3. Verificar respuesta HTTP y carga efectiva de las aplicaciones externas GitHub Pages. Encontrar un archivo en GitHub no demuestra que su URL esté publicada y sea accesible.
4. Probar en Chrome/Safari móvil: navegación de las 9 tarjetas; ir y volver de las actividades locales; responder, ver explicación, marcar dudas, continuar y repetir errores; comprobar contrastes de la marca.
5. Hasta entonces PR en borrador, sin despliegue en producción y sin acceso comercial protegido.

## Pruebas y límites
- Verificado el código y rutas relativas de archivos GitHub; las comprobaciones de lógica previas de Fichas Radar, Traduce el jurídico y Artículo en imagen usaron simulación de DOM.
- **No se ha certificado la carga pública en Netlify**, ni la accesibilidad real de GitHub Pages, ni pruebas físicas en iOS/Android. Esto queda pendiente.

## Comprobaciones ejecutadas en Chat · 18/10/2026
- Menú reducido: 9 tarjetas únicas; las 9 rutas corresponden a archivos existentes en `Temario` o `Tarjetas-repaso` según sus respectivos árboles Git. Las tres rutas internas de «Vocabulario jurídico» también se localizaron en los repositorios. 4 recursos futuros figuran solo en nota «En construcción».
- No hay acceso `Mis errores` central. El registro de fallos no se ha unificado y ninguno de los bancos ha cambiado.
- Simulación de Caza la trampa: iniciar ronda, acertar, **quedarse en la misma pregunta con explicación visible**, pulsar «Siguiente», fallar, almacenar un error y permitir continuar. Resultado conforme.
- Fichas Radar, Traduce el jurídico y Artículo en imagen: simulaciones anteriores de valoración y avance manual satisfactorias; los cambios recientes de Fichas y Artículo solo afectan a colores/retroceso.
- No verificado desde un navegador externo: las URLs publicadas de GitHub Pages devolvieron error en la herramienta de consulta web. No atribuir disponibilidad HTTP sin prueba en navegador real.
