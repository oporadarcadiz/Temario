# Tema 1 — Control de salida a venta (17-10-2026)

**NO PUBLICAR / NO COBRAR** hasta superar los controles pendientes.

## Comprobado
- En GitHub existen las rutas `tema-1/radar/`, `tema-1/saber-mas/` y los cinco juegos HTML.
- Tres archivos PDF Saber más están almacenados en la raíz del repositorio y copiados al despliegue por `netlify.toml`: **no constituyen entrega privada**.
- Enlace BOE consolidado comprobado, con última actualización 20/05/2026.
- Supabase tiene `tema1_access`, `tema1_order_claims`, `user_state` con RLS; no implica que una compra real haya sido probada.
- Se ha preparado ficha `web/tema1-venta.html` y rutas alternativas `web/_redirects` en esta rama.
- En Saber más se ha preparado el bloque Tests finales.

## Bloqueos indispensables
1. Obtener los bytes del PDF de 26 páginas DOS_QR, ejecutar preflight página a página, cotejar artículo 49 y reforma del 20/05/2026, corregir páginas 1, 2, 4 y 20, verificar QR, sangrados, tipografías, dimensiones y enlaces. Mantener el original.
2. Definir diferencia **PDF KDP imprimible** / **PDF digital vendible** y verificar ambos; no dar por finalizado sin sus pruebas.
3. Mover PDF comercial y todo material protegido a almacenamiento privado de Supabase; emitir descarga temporal firmada desde servicio autorizado después de comprobar compra; retirar archivos sensibles del destino estático de Netlify sin romper enlaces públicos de los QR.
4. Probar inicio sesión por correo/Google, acceso sin sesión, usuario sin compra, usuario con compra y caducidad/revocación.
5. Integrar pasarela de pagos en modo prueba, webhook firmado, idempotencia, control de reembolsos y entrega tras pago. Los cobros reales siguen desactivados.
6. Revisar aviso legal, desistimiento de descarga digital, impuestos y condiciones comerciales.
7. Probar todos los URL antiguos impresos y nuevos en móvil. Redirecciones de un dominio Netlify anterior deben configurarse en el *sitio anterior* o mantenerse ese dominio bajo control.

## Restricciones
- Audios y vídeos: Próximamente.
- No rehacer páginas ni juegos ya existentes.
- No publicar material sin cotejar como «examen real».
- Ningún archivo premium debe ser obtenible por URL pública directa.
