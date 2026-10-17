# Hallazgos de preventa - Tema 1

Fecha: 17 de octubre de 2026.

## Decisión editorial

No usar como fuente de publicación ninguno de los PDF locales etiquetados como KDP:

- `OpoRadarCadiz_Tema_1_KDP_LISTO_PARA_PUBLICAR.pdf` tiene 27 páginas y en su página 1 no está el QR de Radar Digital.
- `OpoRadarCadiz_Tema_1_KDP_DOS_QR_FINAL.pdf` tiene 26 páginas, pero recupera la cuadrícula de iconos retirada de la guía de uso. No coincide con la versión editorial actual.

El original `OpoRadarCadiz_Tema_1_DOS_QR_EXTRAS_SABER_MAS.pdf` no está en la copia del proyecto ni en la carpeta de Drive actualmente accesible. Recuperarlo es un bloqueo previo a cualquier exportación KDP o digital.

## Web y seguridad

- El sitio publicado `web-oporadarcadiz.netlify.app` sirve la página de inicio, pero devuelve 404 en `/tema-1/radar/` y `/tema-1/saber-mas/`. La rama `preventa-tema1-seguridad` contiene las rutas, pero no está desplegada en ese sitio.
- Se ha retirado del comando de compilación de Netlify la copia automática de los PDF complementarios al destino estático. Esto evita que una futura publicación de esta rama cree nuevas URL públicas en Netlify.
- El bucket privado `tema1-premium` existe en Supabase, no es público y su política de lectura exige una autorización activa en `tema1_access`. Está vacío; no se deben eliminar del repositorio los PDF actuales hasta que se hayan migrado y se haya verificado una descarga autorizada.
- Los tres PDF complementarios aún están versionados en el repositorio público y algunos HTML mantienen enlaces directos históricos. Esto sigue siendo un bloqueo de venta premium hasta completar la migración privada y retirar los binarios del historial público accesible.

## No activar todavía

No activar venta, pagos, entregas ni publicación KDP hasta recuperar el PDF fuente correcto, superar su revisión integral y completar una prueba de acceso autorizado de extremo a extremo.
