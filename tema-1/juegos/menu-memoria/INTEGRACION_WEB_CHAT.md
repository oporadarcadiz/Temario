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
| Precisión y examen | Completa la frase | `https://oporadarcadiz.github.io/Tarjetas-repaso/juegos/centro-radar/tema-1/?modo=completa&radar=4` |
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

## Presentación final solicitada para tarjetas de menú
- Dos tarjetas por fila en móvil habitual desde 351 px de anchura; una sola en pantallas especialmente estrechas.
- Número de grupo `01/02/03` pequeño, arriba a la derecha del encabezado, sin cifras grandes.
- Nombres de juegos en blanco; subtítulos muy cortos y dorados; el enlace sigue siendo toda la tarjeta.
- Eliminar el rótulo técnico «Código existente · En revisión» **del frontal de las tarjetas**. Los recursos que requieren conexión siguen identificados correctamente en la vista de detalles de la demo, sin presentarlos como publicados.
- Renombre exclusivamente visible: `Completa la frase` -> enlace original modo `completa` (no renombrar ruta de aplicación ni bancos).
- Vista previa móvil autocontenida actualizada para revisión: `OpoRadarCadiz_Tema1_Menu_9_Juegos_Vista_Previa_v2.html` en Drive `JUEGOS_LIBRO/TEMA_1/VISTAS_PREVIAS`.

## Actualización funcional 18/10/2026 — Caza la trampa y regresión de cuatro juegos
- `/tema-1/juegos/caza-la-trampa.html` conserva el banco existente (35 rondas educativas).
- **Nueva función:** después de contestar correctamente puede pulsarse `Marcar como duda para repasar`. No cuenta la duda como fallo ni modifica la puntuación de la respuesta. Usa `oporadar-tema1-caza-trampa-dudas-v1`, distinta de la clave preexistente `oporadar-tema1-caza-trampa-fallos-v1`.
- Inicio y resultados ofrecen repetir la **unión única** de fallos y dudas propios del juego; los datos previos de fallos se conservan. Al acertar una pregunta previamente difícil sin marcar duda, sale de la cola de repaso.
- La explicación nunca desaparece por seleccionar una respuesta o calificar una duda: el usuario pulsa `Siguiente ronda` manualmente.
- **Pruebas JS por DOM simulado, satisfactorias:** Caza (respuesta correcta, no avance automático, marcar duda, guardar y recuperar un fallo, repaso de ambos, eliminación después de acertar), Fichas Radar (revelar, marcar Dudé, leer explicación, pulsar Siguiente), Traduce el jurídico (girar, calificar, explicación visible, pulsar Siguiente) y Artículo en imagen (cargar imagen 18.2, error, explicación y repaso de ese error).
- **Sin integración transversal:** no se modifica `mis-fallos` ni `resources.js`. Cada juego conserva su propio almacenamiento local y no necesita contraseñas.
- **Limitación:** las pruebas son de lógica simulada. La prueba táctil en dispositivos físicos, la respuesta pública HTTP de GitHub Pages y la visualización tras desplegar Netlify siguen pendientes. La corrección de Traduce el jurídico reside en la PR en borrador `Tarjetas-repaso#1`, no en la rama principal publicada.

## Actualización del repositorio Tarjetas-repaso · 19/10/2026

La PR **https://github.com/oporadarcadiz/Tarjetas-repaso/pull/1** contiene ahora ajustes para **tres** recursos que ya existían, no solo Traduce el jurídico:

- `juegos/centro-radar/traduce-juridico/`: mantener explicación visible al valorar, botón Siguiente, botón Volver contextual, marca azul noche y dorado.
- `juegos/tarjetas-radar/vocabulario-tema-1/`: sus **13 tarjetas** siguen intactas; añade el botón `Dudé`, repaso local y avance únicamente con `Siguiente tarjeta`, sin perder fallos anteriores. Simulación completada: 13 tarjetas, marcar duda, cerrar ronda, repetirla y eliminarla al acertar.
- `juegos/centro-radar/tema-1/`: regreso al Centro de Juegos únicamente cuando se entra desde su menú; no modifica la ruta QR ni la navegación directa. Mismos colores de la web. Modo `completa` renombrado visualmente a `Completa la frase`, sin cambiar sus datos ni parámetros.

**Importante:** Los enlaces de GitHub Pages siguen sin verificarse por HTTP; no se ha desplegado esta PR. El conector Firecrawl no tiene créditos actualmente. Web Chat deberá confirmar las URLs públicas al integrar la propuesta y comprobar el aspecto en móvil. La PR de Temario nº1 debe integrarse sin sobrescribir el trabajo de `preventa-tema1-seguridad`.

## Cierre técnico de juegos · 19/10/2026 (solo propuestas, no publicación)

**PR Temario**: la rama de propuesta incorpora mediante commit `587bd88e7b6ed500af12de647db8bfb403ff5a9e` como segundo progenitor el commit base de Web Chat `bc7a6cb17a05f6233524901f697024a8254996ca`, manteniendo sus archivos web intactos. El único archivo solapado era `tema-1/radar/index.html`: sobre el HTML de Web Chat se agregó una tarjeta «Abrir Centro de Juegos» que apunta a `../juegos/menu-memoria/`, y se ocultó el enlace general «Mis errores», sin borrar esa ruta histórica. PR no fusionada ni desplegada.

**Correcciones verificadas con scripts del repositorio y simulación de DOM**
- **Caza la trampa / Detecta el error**: conservar explicación, «Siguiente» manual, valorar duda acertada, guardar error, repetir ambas y descartarlas después de acertar.
- **Fichas Radar**: «Acerté / Dudé / Fallé», explicación visible y avance manual. Solo diez fichas educativas habilitadas; las cuatro atribuidas a exámenes sin cotejo se mantienen en código, con botones de modos «real/ambos» deshabilitados.
- **Memoriza vocabulario**: 13 tarjetas intactas; tras valorar queda la definición hasta «Siguiente». Prueba de 13, repetición de duda y limpieza al acertar.
- **Traduce el jurídico**: girar, valorar, leer respuesta, botón siguiente, vuelta al menú a través de parámetro de retorno y respaldo Centro Radar.
- **Artículo en imagen**: 8 imágenes JPG presentes; se probó especialmente la imagen de artículo 18.2, marcar fallo, leer explicación y repetir únicamente esa imagen.
- **Candado 4-9-1-1**: eliminado salto automático tras último mecanismo; ahora «Ver resultados» manual. Prueba de cuatro mecanismos sin temporizadores y navegación posterior.
- **Simulacro**: utiliza sus tres preguntas didácticas propias, muestra corrección de errores y permite repetir los fallos dentro del mismo juego; ya no enlaza al apartado general.
- **Mapa constitucional y Completa la frase**: modo visual con 12 ejercicios e imágenes existentes; modo completar con 36 ejercicios, todos con respuesta esperada. Su motor aplica valoración y siguiente manual, sin cambiar el banco.
- **Test Radar**: el banco mixto conserva 30 preguntas atribuidas a exámenes y 30 propias, pero la aplicación solo **muestra las 30 propias** hasta la aprobación expresa de Preguntas Chat. El modo real queda bloqueado; sin modificar `bank.js`. Cada modalidad ahora conserva y repasa sus errores por separado mediante identificadores específicos por modo, con lectura de registros antiguos compatibles.

**Rutas y navegación**
- Centro aprobado: `/tema-1/juegos/menu-memoria/`; 9 tarjetas, 2 por fila desde móviles habituales.
- El acceso desde Radar Digital se ha añadido en la propuesta de Temario, sin modificar QR.
- Los enlaces a GitHub Pages añaden `volver=<URL de menú>` cuando se accede desde nuestro menú. Las aplicaciones externas aceptan únicamente URL HTTPS con ruta `/tema-1/juegos/menu-memoria/` o `vocabulario-juridico.html`, así que el regreso no depende del `Referer` recortado por el navegador. Los accesos directos sin parámetro siguen disponibles.
- Archivos JS compilados sin errores en los cambios; rutas 9+3 y recursos gráficos comprobados frente a árboles de GitHub. Vista previa HTML autónoma comprobada con Chromium a 320/390/430/768 px, sin desbordamientos, 9 tarjetas, y juego visual; NO equivale a desplegar el HTML de las PR ni a una prueba en un móvil físico.

**Bloqueadores finales para usar en el libro**: fusionar solo después de revisar cambios y pruebas de integración, desplegar vista previa no pública o staging, confirmar HTTP y funcionamiento en Chrome Android/Safari iPhone sobre ambas apps, verificar retornos entre dominios, asegurar la aprobación de Preguntas Chat antes de habilitar preguntas reales. No se ha modificado producción, el libro, PDF, QR, banco, pagos ni convocatorias.

## Integración de selección verificada por Preguntas Chat · 19/10/2026

Preguntas Chat declara cerrada una selección de **60 filas** del Google Sheet privado `Preguntas y test - Subalterno y Conserje`, hoja `BANCO_PREGUNTAS`: 20, 214, 215, 216, 217, 224, 225, 226, 228, 232, 233, 234, 236, 237, 241, 242, 243, 245, 247, 249, 250, 252, 255, 256, 257, 258, 261, 262, 313, 322, 323, 324, 325, 326, 327, 328, 392, 393, 403, 412, 413, 414, 415, 416, 417, 472, 473, 552, 555, 597, 651, 654, 668, 670, 675, 691, 692, 696, 700, 711. No se modificó el Sheet ni se volvió a auditar la selección.

**Demo pública preparada en la PR de Tarjetas-repaso:** el modo `?modo=real&radar=4` admite las filas **20, 224, 413 y 651**, con enunciado, opciones, clave, organismo y URL documental originales extraídos de `BANCO_PREGUNTAS`. El modo `?modo=mixto&radar=4` combina esas cuatro con **30 preguntas educativas propias** del banco didáctico existente. El modo conserva respuesta/explicación visible hasta `Siguiente`, con repaso por modalidad.

**Discrepancia de la quinta gratuita (NO RESUELTA):** la usuaria identifica «fila 472: soberanía nacional, B»; sin embargo, en la hoja `BANCO_PREGUNTAS` la **fila 472** es la pregunta de valor superior no recogido en art. 1.1, **D**, y la **fila 473** es soberanía nacional, **B**. Ambas figuran entre las 60 seleccionadas. No se ha alterado ninguna fila ni decidido cuál debe ser la quinta gratuita. **No se publica esa quinta pregunta hasta recibir confirmación explícita de cuál de las dos autoriza.**

**Explicaciones aprobadas:** la hoja `BANCO_PREGUNTAS` no dispone de columna de explicación jurídica; conserva la clave oficial y las fuentes. La hoja de apoyo antigua `SOLUCIONARIO_T1_CONTROL` tiene algunas notas doctrinales, pero no un conjunto consolidado de explicaciones aprobadas de las cinco gratuitas; no atribuirle esta condición. Por eso en la demo se muestra la opción correcta literal, sin fabricar explicaciones ni alterarlas. La integración de las explicaciones textuales aprobadas requiere recibir su ubicación exacta desde Preguntas Chat.

**55 reservadas:** sus enunciados, opciones, soluciones y explicaciones NO se han añadido al menú HTML, a un JSON/JS, a una PR pública ni a GitHub Pages. Se mantienen en el Sheet privado hasta que exista distribución protegida autorizada. Sin autenticación, pagos ni endpoint protegido, no deben servirse a clientes. No se ha implementado ninguno de esos sistemas.

**Corrección de exposición heredada:** el JS público anterior `juegos/centro-radar/tema-1/bank.js` contenía 30 preguntas atribuidas a exámenes, de las cuales 29 coincidían con la selección de 60. Se ha retirado ese array de la **rama de propuesta** (ahora `official=[]`), preservando los 30 ejercicios originales propios y el Sheet fuente. La corrección evita su presencia en el artefacto JS futuro de esta PR, pero NO elimina versiones que existan en el historial, la rama `main` o una publicación de GitHub Pages. Eso constituye un bloqueo real de protección comercial que debe resolver el responsable de distribución ANTES de afirmar que las 55 están protegidas.

**Prueba ejecutada (código real en entorno JS simulado):** 4 preguntas en modo oficial gratuito, 30 propias y 4 oficiales en pool mixto, cero preguntas heredadas en `RadarBank.official`, corrección visible y avance solo con `Siguiente`, resultado correcto. Prueba móvil/publicación definitiva pendiente. No desplegar, fusionar ni modificar PDF, QR, libro o convocatorias.
