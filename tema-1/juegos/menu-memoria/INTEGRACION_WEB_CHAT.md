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
- **Test Radar**: el banco heredado conserva ejercicios educativos y preguntas procedentes de exámenes públicos con sus fuentes; el modo gratuito actual utiliza las **5 filas aprobadas** y el mixto de demostración añade 30 ejercicios educativos propios. Cada modalidad conserva su repaso propio, con compatibilidad de registros anteriores. La distribución comercial de las 55 restantes corresponde a Web Chat.

**Rutas y navegación**
- Centro aprobado: `/tema-1/juegos/menu-memoria/`; 9 tarjetas, 2 por fila desde móviles habituales.
- El acceso desde Radar Digital se ha añadido en la propuesta de Temario, sin modificar QR.
- Los enlaces a GitHub Pages añaden `volver=<URL de menú>` cuando se accede desde nuestro menú. Las aplicaciones externas aceptan únicamente URL HTTPS con ruta `/tema-1/juegos/menu-memoria/` o `vocabulario-juridico.html`, así que el regreso no depende del `Referer` recortado por el navegador. Los accesos directos sin parámetro siguen disponibles.
- Archivos JS compilados sin errores en los cambios; rutas 9+3 y recursos gráficos comprobados frente a árboles de GitHub. Vista previa HTML autónoma comprobada con Chromium a 320/390/430/768 px, sin desbordamientos, 9 tarjetas, y juego visual; NO equivale a desplegar el HTML de las PR ni a una prueba en un móvil físico.

**Bloqueadores finales para usar en el libro**: fusionar solo después de revisar cambios y pruebas de integración, desplegar vista previa no pública o staging, confirmar HTTP y funcionamiento en Chrome Android/Safari iPhone sobre ambas apps, verificar retornos entre dominios, asegurar la aprobación de Preguntas Chat antes de habilitar preguntas reales. No se ha modificado producción, el libro, PDF, QR, banco, pagos ni convocatorias.

## Selección definitiva de Preguntas Chat · 19/10/2026 — vigente

**60 preguntas de exámenes públicos verificadas; no reauditar el banco.** La distinción de 5 gratuitas y 55 restantes es comercial y corresponde gestionarla a **Web Chat**. No añadir autenticación, pagos ni controles de acceso en Juegos Chat; conservar fuentes y trazabilidad.

**Cinco gratuitas definitivas:** filas `20 (C)`, `224 (A)`, `413 (B)`, `473 (B)`, `651 (C)` de `BANCO_PREGUNTAS` en «Preguntas y test - Subalterno y Conserje». **La fila 473** es «La soberanía nacional, conforme al artículo 1.2 CE, implica que:», opción **B**, «Todo poder del Estado emana del pueblo español». La fila 472 forma parte de las otras 55; no es la quinta gratuita. Confirmación expresa de la usuaria, sin modificación del Sheet de origen.

**Implementación:** la PR de `Tarjetas-repaso` contiene las cinco gratuitas en `juegos/centro-radar/tema-1/app.js`, con enunciado, opciones, respuesta y URL original. El entrenamiento mixto de demostración combina esas cinco con los **30 ejercicios educativos propios**. El `bank.js` heredado conserva las preguntas originales de exámenes públicos y sus fuentes; no debe borrarse por una supuesta confidencialidad.

**Avance funcional:** responder, leer la respuesta, pulsar `Siguiente`, repasar fallos y volver al menú, sin avance automático que oculte las explicaciones. Las preguntas originales públicas se identifican por procedencia; los ejercicios propios se distinguen como educativos.

**Prueba final pendiente antes de fusionar/publicar:** navegador real en dispositivos móviles y navegación HTTP completa entre `/tema-1/radar/`, `/tema-1/juegos/menu-memoria/` y GitHub Pages; revisar que el parámetro de retorno `volver` funciona tras saltos entre dominios. No se ha desplegado ni modificado el PDF, QR, banco original o web de convocatorias.

## Bibliotecas de vídeos y pódcast · M-074 · 25/10/2026

- Centro de Juegos existente `tema-1/juegos/menu-memoria/index.html`: **dos accesos arriba**, `../../videos/` y `../../audios/`, mientras las **nueve tarjetas originales permanecen inalteradas**. No se cambia Radar Digital ni QR.
- Reutilizadas páginas existentes `tema-1/videos/index.html` y `tema-1/audios/index.html`; no hay nuevos workflows ni repositorios. Diseño adaptativo azul noche, títulos blancos y acento dorado.
- Vídeos: biblioteca ordenable por `tema` (T1 = Constitución Española). El vídeo largo p.1–6 figura **en revisión**, sin enlace ni reproducción pública. El navegador expone `window.OpoRadarVideos.cargar([{tema:1, titulo:'Título aprobado', src:'URL HTTPS temporal con acceso comprobado'}])` únicamente como *interfaz de presentación* para Web Chat; HTML5 controla pausa, play y progreso. `vaciar()` retira la lista y detiene la reproducción.
- Pódcast: único listado vertical, no hay duraciones ni tarjetas. `window.OpoRadarPodcasts.cargar([{tema:1,episodio:1,version:'Largo',src:'URL HTTPS temporal con acceso comprobado'}])`; ordena tema/episodio y Largo→Corto, con numeración reiniciada por tema. **Sin material aprobado el listado es vacío**, no contiene episodios inventados. Audio HTML5 nativo: play/pausa, barra de progreso; botones Anterior/Siguiente, selección manual y autocontinuación optativa; `vaciar()` limpia lista y fuente.
- **Contrato de seguridad (responsable Web Chat, meta M-075):** el código de estas páginas NO autentica, NO autoriza, NO firma ni concede acceso. Web Chat deberá validar compra en servidor y retornar archivos aprobados mediante URL temporal a partir de Storage PRIVADO; después suministrar solo esos objetos al método `cargar`. Nunca incrustar URLs de Drive, Descript, Canva ni públicas de Storage en HTML. Verificar denegación a invitado/no comprador y éxito real de comprador. El `src` de ejemplo anterior es texto descriptivo, NO una URL existente.
- **Inventario (Vídeos Creación Chat, M-072):** entrega nombres reales, tema, número, Largo/Corto, estado de aprobación y ubicación; audios de NotebookLM y vídeo largo en revisión NO se consideran reproducibles sin aprobación. La locución del vídeo largo aún no constituye archivo premium final aprobado.
- Pruebas completadas en lógica JavaScript/DOM simulada: 9 tarjetas preservadas, rutas de bibliotecas existentes, reproductor pódcast (orden, anterior/siguiente, autoplay, vacío, validación HTTPS), reproductor de vídeo (por tema, selección, play, vacío). **No** prueba en dispositivos Android/iPhone reales, acceso comprador ni despliegue HTTP. Ambas PR deben permanecer sin fusionar/publicar hasta comprobarlo.
- Centro de Control: actualizar solo M-074 (Juegos Chat), mantener **En revisión**; consultar sin modificar los estados de M-072 (inventario Vídeos Chat) y M-075 (seguridad Web Chat).

## Corrección de alcance confirmada por usuaria · 25/10/2026

**Única parte en preparación: Parte 1 del Tema 1, páginas 1–6.** Los dos pódcast de NotebookLM, Largo y Corto, han sido confirmados por la usuaria como definitivos. Los archivos encontrados en la carpeta **«páginas 7 a 12» pertenecen a otra parte** y **NO** deben asociarse a T1 · Ep. 1 — Largo/Corto para Parte 1. En la carpeta «páginas 1 a 6» se verifica un M4A llamado «Claves_para_memorizar_la_Constitución_Española.m4a», sin confirmar su modalidad ni localizar de forma inequívoca el segundo archivo de la pareja. Mantener las dos filas en la biblioteca **sin URL de reproducción**, hasta que Vídeos Creación Chat confirme sus IDs/versión y Web Chat valide el comprador y la reproducción segura. La anterior asociación de dos M4A de páginas 7–12 fue un error y queda expresamente anulada; no corresponde revisar ni rehacer audios.

## Solicitud de publicación de tres piezas · 25/10/2026

La usuaria solicita **publicar dos pódcast de la Parte 1, páginas 1–6** y **el vídeo corto 4-9-1-1 ya publicado en Instagram** dentro del Centro de Juegos. Rectificación explícita: **el pódcast Largo es la pista de audio del vídeo largo**, NO uno de los audios de páginas 7–12; el Corto procede del audio de estudio en la carpeta páginas 1–6.

- **Vídeo corto público**: copiado sin alterar desde el archivo original de Drive `OpoRadarCadiz_Reel_Instagram_4911_18s_YouTube_PENDIENTE.mp4` (18,317 s) al repositorio, solo en rama de propuesta, ubicación `tema-1/videos/media/reel-4911-18s.mp4`; se integró con reproductor HTML5 en `tema-1/videos/index.html`. El nombre original indica que YouTube sigue pendiente, no que el vídeo de Instagram esté por publicar. FALTA comprobar que es el mismo Reel publicado y desplegar la PR con pruebas reales.
- **Largo premium**: fuente existente en el montaje del vídeo largo V6 en Descript (pista `voz_mia_238s.m4a` de referencia). No convertir una revisión de vídeo en «final» sin verificar el corte definitivo del audio. Mantener fuente privada; no publicar enlace directo.
- **Corto premium**: en Drive, carpeta `Audios videos youtube y libro/páginas 1 a 6/`, aparece `Claves_para_memorizar_la_Constitución_Española.m4a`. La usuaria confirmó que hay un pódcast Corto definitivo, por lo que corresponde verificar que este es el archivo de la versión corta antes de la subida.
- **Estado comprobado en Supabase:** bucket **privado** `tema1-premium` existe, pero en el momento de la consulta tiene **0 objetos**; tablas de control de acceso de Tema 1 sin compradores registrados y funciones existentes de acceso sin prueba positiva de comprador. No se dispone en la integración Chat de un método operativo de **subida binaria a Supabase Storage**. Por tanto, no afirmar que los pódcast están subidos o se reproducen en la web. Web Chat, responsable de M-075, debe subir y firmar los objetos y comprobar tanto acceso denegado como acceso autorizado antes de activar `OpoRadarPodcasts.cargar`.
- Los nueve juegos y QR no cambian. **PR #1 se conserva en borrador**, no fusionada ni desplegada hasta verificación. M-074 continúa **En revisión**. Los estados de M-072 y M-075 no se alteran.

## Comprobación final de bibliotecas en Chat · 25/10/2026

Responsable **Juegos Chat / M-074**. Se continúa únicamente el código existente de **Temario PR #1**. Dos accesos multimedia arriba de los **9 juegos**, rutas `../../videos/` y `../../audios/`; vídeo corto público 4-9-1-1 en `tema-1/videos/media/reel-4911-18s.mp4`, sin cambio de QR, juegos ni Convocatorias. Biblioteca de vídeos por tema y pódcast como **único listado vertical**: `T1 · Ep. 1 — Largo`, `T1 · Ep. 1 — Corto`. Largo = audio del vídeo largo Parte 1 (páginas 1–6), Corto = audio NotebookLM de la misma parte; NO usar páginas 7–12.

**Pruebas de lógica ejecutadas sobre el HTML/JS real de la rama (DOM simulado): PASS:** estado inicial de dos filas desactivadas sin acceso; carga de dos URLs firmadas de prueba de Storage privado; rechazo de enlace Drive y Storage público; orden Largo/Corto; selección y `play()`; avance y retroceso; `ended` con continuación opcional; `vaciar()` limpia fuente y vuelve a bloquear filas. Vídeos: acepta únicamente URL firmada del bucket privado; rechaza origen público no autorizado; selecciona, reproduce y limpia. Menú: 9 accesos originales y ambas bibliotecas en la parte superior. Los tokens y URLs empleados en las pruebas son **ficticios**, no contenido premium real ni prueba de compra.

**Pendiente de Web Chat (M-075):** subir ambos audios definitivos a `tema1-premium` (Storage privado), generar URLs firmadas **solo después** de comprobar `tema1_access` en servidor, demostrar denegación sin compra y reproducción real con comprador; validar navegador móvil y escritorio con archivos auténticos. **Pendiente de integración:** resolver únicamente conflictos GitHub cuando sean comprobables, sin fusionar ni desplegar por ahora; la prioridad de la web del 9/11 se mantiene ajena a este trabajo. M-074 permanece `En revisión`. **Sin cambios a M-072 ni M-075.**

## Corrección funcional y verificación · Juegos Chat · 27/10/2026

Se consultaron las metas **M-072/M-074/M-075** antes de trabajar. Se mantiene la estructura aprobada, sin tocar Convocatorias, pagos ni la prioridad de la web del 9 de noviembre. **Cambio mínimo en `tema-1/videos/index.html`:** antes, al recibir un vídeo premium T1 con URL firmada, `OpoRadarVideos.cargar` ocultaba el bloque T1 completo, incluyendo **el vídeo corto público 4-9-1-1**. Ahora solo oculta el aviso «vídeo largo en revisión», preserva el vídeo corto y evita un segundo encabezado T1 redundante. Al revocar el catálogo premium (`vaciar()`), recupera el aviso y mantiene siempre visible el vídeo corto.

**Prueba de regresión con JS real y DOM simulado: OK.** Comprobados accesos multimedia arriba, **9 juegos** sin cambios, audio inicial con dos filas desactivadas, orden Largo/Corto, reproducción manual, siguiente/anterior y `ended` con autocontinuación opcional, revocación a estado sin acceso. En vídeos: corto permanece visible al cargar un vídeo T1 privado, título T2 conservado, `play` y `vaciar` funcionan. Para probar se utilizaron direcciones firmadas *ficticias*, no archivos reales ni cuentas de compradores. Sin URLs premium hardcodeadas, sin fusión ni despliegue. Validación real móvil/escritorio y autorización comprador/no comprador permanecen a cargo de **Web Chat / M-075**. **M-074 continúa En revisión.**


## Test Final Tema 1 · integración pendiente de Banco de Preguntas · 01/11/2026

**No se crea un nuevo juego.** El acceso existente `tema-1/juegos/nivel3-test.html` sigue siendo la ruta permanente y su redirección en la PR de Temario apunta ahora a `Tarjetas-repaso/juegos/centro-radar/tema-1/?modo=final&radar=4` en la PR de Tarjetas-repaso `mejora-traduce-juridico-continuar`. Se conserva íntegro el diseño CSS y la lógica anterior de los demás modos/juegos. No cambiar QR ni los ocho juegos restantes.

**Implementación preparada, NO publicada:** `juegos/centro-radar/tema-1/app.js` solo activa Test Final cuando recibe exactamente 120 preguntas verificadas, **60 `official` y 60 `original`**. Para entregar el banco, Banco de Preguntas debe agregar al módulo `RadarBank` la propiedad `testFinal120` o suministrar antes de `app.js` el array global `window.OpoRadarTestFinalBank`, con estos campos **por cada pregunta**: `id` (único y estable), `q` (enunciado literal revisado), `choices` (opciones de texto sin duplicados), `correct` (índice 0-based de la opción correcta), `type` (`official` o `original`), `verified:true`; opcional `explanation` revisada. Para `official`, también `source` y `sourceUrl` verificables. Este es un **contrato de datos**, no un banco creado por Juegos Chat; Banco de Preguntas mantiene la responsabilidad de validar preguntas, claves, procedencia y vigencia. No sustituir datos antiguos por cuestiones inventadas ni tomar las 30+5 de demostración como banco final.

**Sorteo y corrección:** inicio de cada intento = permutación Fisher–Yates nueva de los 120, primeras 40, **sin reemplazo ni cuotas 20+20**; se permite solapamiento entre intentos. Las opciones se mezclan mediante índices que conservan su respuesta correcta. `Dejar sin responder` contabiliza blancos. Al terminar: aciertos, fallos, blancos, nota proporcional **0–10 sin penalización** (a falta de regla de penalización aprobada), respuesta correcta y explicación original cuando exista; nuevo inicio con sorteo independiente. La selección del Test Final NO utiliza prioridades ni ciclos de `RadarProgress.select`, y no altera sus otros modos.

**Pruebas de lógica (sin archivos comerciales):** 200 simulacros sobre fixture sintético 120 (60/60) → 200 selecciones de 40 IDs únicos, todos los intentos diferentes; el número de oficiales varía entre sorteos (sin cuota fija); bloquea banco ausente, incompleto o no verificado. Prueba de corrección 20 correctas + 10 incorrectas + 10 blancas → **5,00/10**, 40 diagnósticos y nuevo sorteo; las respuestas correctas permanecen vinculadas a las opciones tras el mezclado.

**Pendiente y bloqueo:** Banco de Preguntas entregará el conjunto definitivo de 120 validado. **NO fusionar ni desplegar** los cambios de las dos PR hasta recibirlo, revisar integridad y efectuar prueba real en móvil/escritorio coordinada con Web Chat. No intervenir en Convocatorias ni la web prioritaria del 9 de noviembre. Meta propia a actualizar: **M-045**; **M-042** (banco) y demás metas ajenas solo se consultan.


## Conciliación de 60 reales + 60 originales · Juegos Chat · 01/11/2026

**Ámbito:** solo coordinación del Test Final Tema 1, sin modificar preguntas, claves, modo de juego, otros juegos ni QR. Se recupera el listado histórico cerrado el 19/10/2026 y se reconcilia **sin re-seleccionar** con la hoja `BANCO_PREGUNTAS` de `Preguntas y test - Subalterno y Conserje`: https://docs.google.com/spreadsheets/d/1ARWf5ux20DYs9BCoiitZNvFxha7OaL_6jv5PNt6OnLw/edit

**Las 60 referencias históricas exactas (fila de BANCO_PREGUNTAS):** `20,214,215,216,217,224,225,226,228,232,233,234,236,237,241,242,243,245,247,249,250,252,255,256,257,258,261,262,313,322,323,324,325,326,327,328,392,393,403,412,413,414,415,416,417,472,473,552,555,597,651,654,668,670,675,691,692,696,700,711`. No inferir ID permanente del número de fila.

**Identificadores compuestos del origen** `ingestion_id|numero_pregunta` (son únicos 60/60 y sirven para conciliación; Banco de Preguntas debe asignar o confirmar IDs estables definitivos):

| ingestion_id | numero_pregunta original | Filas |
| --- | --- | --- |
| fuenlabrada_2_conserje_pmc_2024 | 1 | 20 |
| sanlucar_conserje_relevo_2022 | 1,2,3,4,11,12,13,15,19,20,21,23,24,28,29,30,32,34,36,37,39,42,43,44,45,48,49,100 | 214–217,224–226,228,232–234,236–237,241–243,245,247,249–250,252,255–258,261–262,313 |
| cadiz_12_subalternos_oep_2021_2022_2023_2025 | 1,2,3,4,5,6,7 | 322–328 |
| fuenlabrada_20_conserje_2026 | 1,2,13 | 392,393,403 |
| cabildo_grancanaria_5_subalterno_2026 | 1,2,3,4,5,6 | 412–417 |
| barakaldo_1_subalterno_2026 | 1,2 | 472,473 |
| alcobendas_2_subalterno_2026 | 1,4 | 552,555 |
| fene_1_conserje_2026 | 1 | 597 |
| santa_cruz_tenerife_subalterno_2026_modelo1 | 7,10,24,27,32,49 | 651,654,668,670,675,691 |
| arganda_conserje_educacion_2026 | 1,5,9,R3 | 692,696,700,711 |

**Resultado de la conciliación estructural:** 60/60 filas existentes y marcadas `VERIFICADA`; 60/60 claves registradas que apuntan a una alternativa poblada; 60/60 con organismo, año, URLs de examen y plantilla; 60/60 claves compuestas diferentes; **43/60 cuatro alternativas y 17/60 solo tres**, específicamente filas `20,392,393,403,412,413,414,415,416,417,552,555,597,692,696,700,711`. La fila 20 carece de hash de pregunta; conserva `ingestion_id` y número. **24/60 enlaces de examen y plantilla conducen a copias en Google Drive**, no directamente a páginas del organismo: la procedencia oficial debe mantenerse documentada y poder auditarse, no dar por certificado el destino solo por la existencia de URL.

**Incidencias editoriales detectadas en comparación entre los 60 oficiales:**

1. **Duplicado de enunciado equivalente:** filas **234 y 700** (art. 1.3, monarquía parlamentaria): misma pregunta sustancial con puntuación diferente, 4 opciones en 234 y 3 en 700. No contar ambos como ítems conceptualmente únicos sin resolución de Banco. **Ambos originales permanecen sin tocar**.
2. **Incompatibilidad jurídica de clave/enunciado:** fila **552** pregunta por *forma política del Estado*, pero marca B = *Estado social y democrático de Derecho*. El art. 1.1 define al Estado en estos términos; **el art. 1.3 dice Monarquía parlamentaria** y ninguna de las tres opciones de la fila 552 ofrece esa respuesta. Revisar el cuadernillo y la plantilla en origen; no corregir silenciosamente.
3. **Posibles solapamientos semánticos** que requieren decisión, NO duplicados acreditados: **215/597** (art. 35, derecho/deber al trabajo, segunda en gallego); **322/472** (valores no recogidos art. 1.1, alternativas diferentes); **651/668** (art. 11, nacionalidad y regulación por ley); **250/691** (disposiciones generales/adicionales). Los distractores y enfoques pueden justificar coexistencia; determinar caso a caso.
4. **Encaje temático a revisar** (no inválidas por sí solas): filas **228** (LO 3/2007), **241** (LO 3/2018, protección de datos), **313** (Ley 31/1995, PRL): citan normas externas aunque relacionadas con derechos o mandatos constitucionales. Fila 597 está en gallego; conservar literal oficial y decidir tratamiento editorial sin traducir la fuente.
5. **Formato de cuatro alternativas:** no inventar opción D ni atribuir a un examen oficial cuatro opciones si este contenía solo tres; Banco decidirá una solución editorial explícita antes de aceptar las 120.

**Originales:** Banco Maestro https://docs.google.com/spreadsheets/d/1sLFGfYdvKszvZPBiGKDUnb1e6p6LwHsuWWzlBDRTP2Q/edit#gid=861105002 pestaña `TEST_FINAL_T1_ORIGINALES`, `CE-T1-ORG-001` a `CE-T1-ORG-060`, 60 IDs únicos; todas con 4 alternativas, clave `A/B/C/D` válida, explicación, referencia jurídica y etiqueta `COTEJADA_NORMA_BOE_2026_REVISION_EDITORIAL_PENDIENTE`. Las 60 **siguen pendientes de revisión editorial final**. Comprobación automática de enunciados: **sin coincidencias exactas entre las originales y las 60 reales** y sin similitudes léxicas altas en comparación básica; esto NO certifica ausencia de solapamiento semántico.

**Normativa:** consulta del texto consolidado BOE-A-1978-31229, última actualización indicada por el BOE 20/05/2026: https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229 ; cotejo puntual del error de 552 con art.1.1/1.3. Este control no equivale a auditoría jurídica exhaustiva de todas las plantillas oficiales ni a validación editorial definitiva.

**Estado final:** `NO CONCILIADO PARA PUBLICAR`: se conserva la **selección histórica de 60 sin sustituciones** y las 60 originales sin cambios. Banco de Preguntas debe resolver duplicidad e incidencia 552, 17 registros de 3 alternativas, trazabilidad 24 URLs Drive, posibles solapamientos, revisión editorial, y dar aprobación expresa del lote de 120. No cargar al Test Final ni abrir el test antes de esa autorización. M-045 Juegos Chat = en curso; no modificar M-042 ni hojas de Banco Maestro desde este chat.
