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
