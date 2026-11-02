# OpoRadarCádiz — Auditoría de juegos del Tema 1

**Actualización:** 15 de octubre de 2026.

## Referencia pedagógica permanente

https://mad.es/blog/apps-para-estudiar/

Inspirarse en fichas, repaso espaciado, simulacros, microjuegos, progreso y técnicas de concentración. No copiar contenidos ni interfaces ajenas.

## Arquitectura y páginas principales

- PDF impreso: **exactamente dos QR inmutables**, «Radar Digital» (p. 1) y «Saber más» (p. 2). Los cambios aquí no deben exigir reimprimir.
- Centro Radar: `oporadarcadiz/Tarjetas-repaso/juegos/centro-radar/tema-1/`.
- Fichas Radar: `oporadarcadiz/Temario/tema-1/juegos/fichas-radar.html`.
- Las rutas públicas de juegos o PDF no equivalen a protección de pago. **Pendiente** mover contenido exclusivo tras una comprobación de autorización realizada por servidor; no llamar «seguro» al acceso solo porque el menú requiera iniciar sesión.

## Cambios realizados (verificar de nuevo al desplegar)

1. Las Fichas Radar conservan el resultado de cada pregunta en `localStorage`, ordenan al inicio fallos y dudas y permiten repetir las pendientes. Es un historial **solo de este navegador**, no está sincronizado entre dispositivos.
2. El Centro Radar muestra un resumen final por bloque: aciertos, dudas, fallos y sin responder.
3. El Centro Radar permite repetir las preguntas falladas, dudosas **o sin contestar**.
4. El Centro Radar muestra la explicación jurídica del banco cuando existe; la nota de procedencia del examen no se utiliza como explicación.
5. El banco incorpora explicaciones breves para 23 conceptos, basadas en el texto constitucional; revisar periódicamente la versión consolidada y cualquier nueva reforma.
6. La afirmación de que hay cinco preguntas literales está **pendiente de cotejo directo** con los PDF originales y no debe presentarse como verificada.
7. Las etiquetas de origen diferencian la creación propia, la adaptación y los bancos atribuidos a exámenes; no certificar literalidad sin cotejar la fuente.

## Auditoría de fuentes jurídicas y documentales

- Texto constitucional de consulta: https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229 (texto consolidado informativo; atención a cambios legislativos).
- Procedencias incluidas en el banco: Cádiz 2025, Sanlúcar 2022, Fuenlabrada 2026, Gran Canaria 2026, Barakaldo 2026.
- **No basta** la fila de un Google Sheet para afirmar que una pregunta es literal. Hay que conservar URL documental, organismo, convocatoria, año, modelo, pregunta, opciones, solución de plantilla y resultado del cotejo humano.
- Las preguntas adaptadas deben identificarse claramente y no atribuir la redacción a la institución.

## Pruebas pendientes antes de venta

- Probar con navegador real Chrome/Safari el flujo completo de los cinco modos del Centro Radar: empezar, marcar respuesta, ver explicación, siguiente, finalizar, repasar.
- Verificar 20/30/40 preguntas según disponibilidad real; no inventar para rellenar y no duplicar opciones.
- Revisar accesibilidad móvil: foco, lectura, botones, contraste.
- Confirmar que Netlify y GitHub Pages publican los commits recientes (el lector web automatizado no logró abrir ambos sitios el 15/10/2026).
- Ensayar usuario sin permiso: comprobar que no accede a contenido premium con enlace directo.
- Prueba de regresión del PDF y de los **dos QR** con móvil, bajo supervisión de Libro Work.

## Prioridades siguientes

1. Cotejar cuadernillos y plantillas de preguntas originales, en especial las cinco marcadas provisionalmente como literales.
2. Completar explicaciones jurídicas donde no existen.
3. Mover contenido premium a una ruta protegida en servidor; eliminar referencias directas públicas.
4. Sincronización opcional del progreso con una cuenta autorizada, respetando privacidad y minimización de datos.

## Principios de diseño

Sesiones cortas; comprensión antes que memorización; corrección explicada; repetir fallos y dudas; modo concentración; progreso visible sin premios vacíos. Preguntas oficiales, adaptadas y creadas siempre diferenciadas.

## Revisión de procedencia y mensajes del juego (16/10/2026)

- En Centro Radar, las cinco preguntas marcadas provisionalmente como literales en `literalIds` **no se presentan como literalidad verificada**. La interfaz muestra ahora `BANCO ATRIBUIDO · LITERALIDAD SIN COTEJAR`, con explicación de que debe contrastarse el cuadernillo.
- Las fichas tipo tarjeta del Centro Radar, al marcarlas como fallo o duda, emplean una explicación constitucional disponible (`q.explanation`) en vez de presentar la nota documental de procedencia como explicación.
- Cambios verificados mediante lectura del código actualizado en GitHub; **no equivalen a prueba funcional en Safari/Chrome ni a cotejo jurídico exhaustivo**.
- Preguntas a cotejar prioritariamente antes de certificarlas literales: `g26-01`, `c25-01`, `s22-08`, `s22-09` y `s22-13`. Deben compararse con PDF fuente, opciones, plantilla correctora y organismo.

## Ajustes de uso (16/10/2026)

- En modo Tarjetas del Centro Radar, pulsar **Acerté** ya no salta de inmediato a la siguiente pregunta: ahora el alumno debe pulsar **Siguiente**, igual que con **Dudé** y **Fallé**. Evita avances accidentales y mantiene una interacción coherente.
- Mensajes de repaso y resultados corregidos para mencionar también las preguntas **sin responder**.
- Verificado a nivel de código fuente y commit en GitHub; pendiente prueba integral en navegador y móvil.

## Cotejo documental y control premium — 16/10/2026

### Cuadernillo recuperado

Fuente pública directa: https://www.sanlucardebarrameda.es/sites/default/files/EXAMEN%20CONSERJE%20CORREGIDO.pdf

- `s22-08` corresponde a la **pregunta 23** del cuadernillo (169 artículos, opciones 167/166/169/168).
- `s22-09` corresponde a la **pregunta 24** (nombre del Título I, con cuatro opciones).
- `s22-13` corresponde a la **pregunta 48** (nombre del Título X, con cuatro opciones).
- Enunciados y opciones cotejados contra el texto del PDF; **la solución marcada en la plantilla de respuestas todavía no se ha verificado de forma independiente**. No equiparar «texto cotejado» y «respuesta oficialmente validada».
- Se retiraron provisionalmente de `literalIds` las preguntas `c25-01` y `g26-01` al no disponer de cotejo directo documental. Las demás preguntas se mantienen con estado de comprobación pendiente.
- El Centro Radar muestra un estado documental específico, no un falso sello «EXAMEN REAL VERIFICADO».
- Este cotejo no garantiza ausencia de erratas o pequeñas diferencias de normalización tipográfica; revalidar antes de uso editorial definitivo.

### Protección de contenidos

- Función desplegada en Supabase: `tema1-games-access` (`verify_jwt=true`) en el proyecto `jtyjdrrxmuppulbekfai`.
- Valida JWT con Supabase Auth y consulta el permiso activo en `tema1_access` desde el servidor; deniega a personas sin autorización vigente.
- **No entrega contenido de pago**: responde `content_ready:false`. Es únicamente una base de autorización preparada para integrar un banco privado.
- **BLOQUEANTE DE VENTA COMO PREMIUM:** Los HTML y bancos de preguntas siguen públicos en GitHub/GitHub Pages/Netlify. Cualquier persona con el enlace puede acceder. No prometer exclusividad ni protección hasta trasladar preguntas y juegos fuera del repositorio público y probar autorización de extremo a extremo.
- Las demostraciones actuales pueden seguir siendo públicas y accesibles para pruebas. Separar inequívocamente DEMO pública de paquete COMPLETO protegido cuando se complete la migración.


## 02/11/2026 · Auditoría funcional de las nueve actividades (Juegos Chat)

**Estado:** PR en borrador, sin fusión ni despliegue. Referencias de coordinación: M-045 y M-083 propias; consultadas M-074 y M-081. La revisión R3/R2 del libro no certifica las 120 preguntas ni derechos sobre ilustraciones. No se ha modificado el banco comercial, sus IDs, QR, plantillas de examen, configuración Supabase ni contenidos multimedia privados.

### Matriz de pruebas realizadas sobre HTML/JS de las ramas de GitHub (entorno DOM simulado)

| Entrada de los nueve juegos | Prueba realizada | Resultado |
| --- | --- | --- |
| Artículo en imagen | Arranque y 8 tarjetas con identificación/corrección y avance hasta final | 8/8, OK en simulación |
| Mapa constitucional | Inicio en modo `visual` del Centro Radar con banco existente, imagen, opción correcta y resultado | OK, 12 imágenes mapeadas, prueba de 1 pregunta |
| Fichas Radar | 10 fichas de práctica propia: girar, marcar acierto, siguiente, resumen; otras 4 fichas oficiales quedaron intactas | 10/10, resumen correcto |
| Vocabulario jurídico | Tres enlaces de modalidades: Conceptos (8 parejas en 2 rondas), Memoriza vocabulario (13 tarjetas), Traduce el Jurídico (30 tarjetas); retorno desde GitHub Pages | 8/8 parejas + 13/13 + 30/30 en simulación; rutas presentes |
| Candado 4-9-1-1 | Ajustar cuatro diales, descifrar código y acertar los cuatro mecanismos | OK, puntuación 880 |
| Detecta el error | Elegir trampa correcta en una ronda de cinco desde las 35 disponibles y consultar resultados | 5/5, OK |
| Completa la frase | Inicio en modo `completa` con banco existente, respuesta correcta, siguiente y resumen | OK, 36 ejercicios preparados, prueba de 1 |
| Test Radar | Entrada sin redirección automática a test completo, 5 gratuitas existentes `free-20/free-224/free-413/free-473/free-651`, responder y terminar | 5/5, OK; sin 120 del banco final |
| Simulacro | Mini-prueba de 3 preguntas; primera ronda con un error; repetir únicamente el fallo; calcular la nota de esa ronda | Primera ronda 67 %, repaso de 1 pregunta 100 %, OK |

**Chequeos estructurales:** 9/9 tarjetas del menú y destinos presentes, dos accesos multimedia arriba; JS de los cinco juegos HTML de Temario compila; todos los identificadores estáticos consultados por sus scripts existen. Los archivos públicos externos del vocabulario y las imágenes requeridas por Mapa están en el árbol GitHub de Tarjetas-repaso. `viewport`, estilos responsive existentes y botones accesibles se revisaron a nivel de código, **NO con dispositivo físico, lector de pantalla o navegador real**. Estas pruebas de simulación no sustituyen QA visual ni de accesibilidad.

### Correcciones de funcionamiento en las mismas ramas

- **Temario PR #1** `tema-1/resources.js`: en `startMock()`, al repetir fallos, comparar contra `deck[i]` y utilizar `deck.length` para nota porcentual y contador. Antes se utilizaba `mock[i]`/`mock.length` aun con subconjunto. El contenido de las tres preguntas es idéntico antes/después.
- **Temario PR #1** `tema-1/juegos/fichas-radar.html`: se cambió solo la **etiqueta de estado** de cuatro preguntas de procedencia de examen. Ya no dice `VERIFICADA`, porque M-081 mantiene revisión editorial final; los enunciados, claves y fuentes no cambiaron.
- **Tarjetas-repaso PR #1** `juegos/centro-radar/tema-1/app.js`: plural correcto en resumen para una pregunta (`1 acierto`, `1 pregunta`) sin tocar cálculo ni elección; simulación de Mapa/Completa OK.
- **Tarjetas-repaso PR #1** `juegos/tarjetas-radar/vocabulario-tema-1/index.html` y `juegos/centro-radar/traduce-juridico/app.js`: admitir regreso a `/Temario/tema-1/juegos/menu-memoria/vocabulario-juridico.html` y al destino web equivalente, con validación de host HTTPS permitido. Antes el retorno desde GitHub Pages no reconocía el prefijo `/Temario`. Sin cambios en tarjetas ni contenidos.

### Separación gratis / privado — pendiente obligatorio para Web Chat

- **NO ESTÁ CERTIFICADA:** páginas y bancos actuales siguen en repos públicos `Temario` y `Tarjetas-repaso`, incluyendo `juegos/centro-radar/tema-1/bank.js`, recursos de Fichas/Trampa/Imagen y rutas externas. Parte es material de entrenamiento anterior, **no afirmar que son las 120 preguntas finales**. El botón deshabilitado y los avisos de «premio» no impiden descargar código/datos públicos mediante URL directa. Además de las cinco preguntas gratuitas y el minisimulacro de tres, **no calificar todavía los otros juegos completos como privados**.
- **Web Chat M-083:** conservar las 9 rutas y los dos QR permanentes, separar datasets DEMO autocontenidos de datasets de contenido reservado; servir exclusivamente lo premium desde servidor/Storage privado después de autenticar con OTP/JWT y comprobar `tema1_access` y canal Amazon validado **por petición**, impedir también URL directa a JS/HTML/JSON/media de pago. Revisar cachés y antiguas URLs, confirmar estados anon/usuario sin compra/pendiente/rechazado/activo/revocado, referencias duplicadas Amazon, dos ediciones del libro y sus derechos de acceso. `tema1-games-access` debe conservar `content_ready:false` hasta superar esas pruebas. **Sin aplicar SQL ni desplegar desde Juegos Chat.**
- **Banco/Revisión Editorial M-081:** no entregar 120 al cliente público, no hacer cargo de pago; lote 60 oficiales y 60 originales todavía sin certificación global. El algoritmo de 40 no ha cambiado. Los medios premium Largo/Corto siguen desactivados; vídeo corto público se conserva.

**Cierre de esta ronda:** pruebas del código realizadas y ajustes puntuales preparados; **pendiente QA navegador móvil/escritorio, auditoría jurídica de los ejercicios que se elijan como demo, autorización real de servidor y validación editorial**. No fusionar PR, no abrir ventas, no crear un nuevo juego o banco.
