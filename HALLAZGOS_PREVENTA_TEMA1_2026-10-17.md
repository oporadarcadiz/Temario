# Hallazgos de preventa - Tema 1

Fecha: 17 de octubre de 2026.

## Decisión editorial

La revisión posterior ha identificado un modelo editorial más reciente que el PDF de 26 páginas con cuadrícula de iconos.

- `OpoRadarCadiz_Tema_1_KDP_LISTO_PARA_PUBLICAR.pdf` es la base visual moderna: mantiene la guía sin iconos, pero tiene 27 páginas, no incorpora el QR de Radar Digital en la página 1 y contiene QR heredados que no cumplen la regla de dos QR.
- `OpoRadarCadiz_Tema_1_KDP_DOS_QR_FINAL.pdf` tiene 26 páginas, pero recupera la cuadrícula de iconos retirada de la guía de uso. No coincide con la versión editorial actual.

De la base visual moderna se ha generado localmente un candidato de 26 páginas, conservando las dos páginas de notas y limitando los QR a Radar Digital (página 1) y Saber más (página 2). Aún no debe publicarse: los dos destinos exigidos siguen sin estar operativos en Netlify.

El original `OpoRadarCadiz_Tema_1_DOS_QR_EXTRAS_SABER_MAS.pdf` no está en la copia del proyecto ni en la carpeta de Drive actualmente accesible. Su ausencia no impide conservar la composición moderna, pero sí impide comparar contra ese archivo histórico concreto.

## Web y seguridad

- El sitio publicado `web-oporadarcadiz.netlify.app` sirve la página de inicio, pero devuelve 404 en `/tema-1/radar/` y `/tema-1/saber-mas/`. La rama `preventa-tema1-seguridad` contiene las rutas, pero no está desplegada en ese sitio.
- Se ha retirado del comando de compilación de Netlify la copia automática de los PDF complementarios al destino estático. Esto evita que una futura publicación de esta rama cree nuevas URL públicas en Netlify.
- El bucket privado `tema1-premium` existe en Supabase, no es público y su política de lectura exige una autorización activa en `tema1_access`. Está vacío; no se deben eliminar del repositorio los PDF actuales hasta que se hayan migrado y se haya verificado una descarga autorizada.
- Los tres PDF complementarios aún están versionados en el repositorio público y algunos HTML mantienen enlaces directos históricos. Esto sigue siendo un bloqueo de venta premium hasta completar la migración privada y retirar los binarios del historial público accesible.

## No activar todavía

No activar venta, pagos, entregas ni publicación KDP hasta que los dos destinos QR vuelvan a responder, se complete la revisión integral del PDF candidato y se supere una prueba de acceso autorizado de extremo a extremo.
