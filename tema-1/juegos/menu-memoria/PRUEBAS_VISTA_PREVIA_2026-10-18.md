# Vista previa móvil autónoma · pruebas 18/10/2026

## Entrega de prueba
- Archivo de prueba de una sola pieza: `OpoRadarCadiz_Tema1_Vista_Previa_Movil.html`; copia guardada en Google Drive Opo Radar Cádiz / OpoRadarCádiz / JUEGOS_LIBRO / TEMA_1 / VISTAS_PREVIAS.
- El HTML incluye por sí solo las ocho imágenes optimizadas de memoria visual, con JS y CSS, y funciona sin servidores ni recursos externos.
- Menú de 20 recursos navegables: «Artículo en imagen» es jugable; los cuatro nuevos muestran «En construcción»; los demás aparecen como código existente con nota «pendiente de enlace público verificado». Esta preview no sustituye ni duplica los archivos de producción.
- La demo **no es un enlace hospedado públicamente**. Para jugar en el móvil, descargar el archivo y abrirlo en un navegador que permita JavaScript local. Google Drive puede mostrar código o una vista limitada, por lo que es preferible descargarlo.
- Los cambios del juego fuente siguen en `tema-1/juegos/menu-memoria/articulo-en-imagen.html`; esta versión autocontenida sirve para experimentar sin afectar a Netlify.

## Pruebas con Chromium automatizado (tamaños de pantalla simulados)
Se ha ejecutado la prueba de UI mediante Playwright y Chromium a 320×700, 390×844 y 768×1024 px:
1. Se presentan 20 tarjetas en el menú.
2. No hay desbordamiento horizontal.
3. «En construcción» abre una ficha contextual y permite volver al menú.
4. Los juegos existentes muestran su condición de «código existente» sin inventar URL pública.
5. «Artículo en imagen» carga un JPG real de 750 px; el usuario responde sin alternativas.
6. Una respuesta correcta presenta explicación sin avanzar automáticamente; tras «Lo sabía» aparece «Siguiente imagen».
7. Un error muestra el artículo correcto y queda pendiente en historial local.
8. «Repasar mis dudas» recupera solo ese ejercicio; después de acertar se borra de pendientes.
9. Se llega a la pantalla de resultados.
10. No se detectaron excepciones JavaScript en las pruebas.

Esta validación emplea un navegador real con **tamaños simulados**, no equivale a Safari en iPhone ni prueba física en Android.

## Integración con Web Chat
- No alterar la ruta QR original `/tema-1/radar/`.
- La ruta prevista del menú para la web sigue siendo `/tema-1/juegos/menu-memoria/`.
- Fusionar solo con revisión de la PR borrador #1 y sus conflictos; mantener la versión de Web Chat de `tema-1/radar/index.html`.
- Para ofrecer una URL de prueba compartible, desplegar una **vista previa de rama** en el alojamiento conectado (Netlify u otro), sin modificar la URL de producción ni contenido comercial; antes verificar si permite proteger el acceso.
- No implementar contraseñas ni pagos todavía; no exponer bancos completos de preguntas oficiales.
- La imagen del artículo 140 es conceptual y no es cartografía fiable para preguntas geográficas.
