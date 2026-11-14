# Contrato final Web–Radar · Transición (NO PUBLICADO)

## Estado comprobado (18/10/2026)
- Tabla existente: `public.opportunities(id text,data jsonb,published boolean,reviewed_at date,updated_at timestamptz)`.
- Nueve expedientes; nueve IDs únicos; `data.id` coincide en los nueve; nueve con `published=true`; cero slugs establecidos.
- Tabla `public.opportunity_events`: **no creada**. SQL preparado en `web/migrations/20261018_prepare_opportunity_events.sql`, sin ejecutar.
- Política RLS existente `published_opportunities_read`, permite SELECT público solo si `published=true`.
- El adaptador experimental `web/supabase-data-next.js` **no está enlazado al HTML**: su activación requiere una fase posterior con las pruebas y la migración aplicadas.

## IDs, slugs y favoritos
- `opportunities.id` permanece sin cambios. Los favoritos usan `oporadar:radar:saved:v1` con dicho ID.
- El slug es único, se asigna una vez y no se regenera. La ruta `/convocatorias/:slug` está preparada en `web/_redirects`, con destino a `/convocatoria.html?slug=:slug`.
- La ficha acepta parámetro `id` o `slug`. Si no hay slug, el listado mantiene `/convocatoria.html?id=OPO-0001`.
- No hay slugs reales: no es posible probar todavía una ficha real por slug sin migración o datos de ensayo independientes.

## Normalización temporal
- Conserva JSON legacy (`id,title,organism,location,processType,places,state,publishedOn,applicationsEndOn,url,announcements,milestones`).
- Admite en `supabase-data-next.js` alias normalizados (`titulo,organismo,municipio,ambito,provincia,tipo_proceso,numero_plazas,estado_proceso,fecha_publicacion_inicial,fecha_fin_plazo,url_bases`).
- No elimina ni transforma permanentemente datos actuales. `reviewed_at` es revisión técnica y **no es novedad**.
- Para nuevos EVENTOS sólo se presentan eventos con `aprobado` + `publicado`; aprobación Telegram debe ser implementada por el RADAR con credenciales de servidor.

## Tabla independiente de EVENTOS
Campos: `evento_id`, `convocatoria_id` (FK `opportunities.id`), `evento_dedupe_key`, `tipo_evento`, `titulo_evento`, `fecha_oficial`, `fecha_detectada`, `source_id`, `source_reference`, `canonical_url`, `url_evento`, `resumen`, `estado_validacion`, `publicado`, `aprobado_por`, `aprobado_en`, `retirado_en`, `motivo_retirada`, `created_at`, `updated_at`.
- La política pública RLS deja leer exclusivamente `publicado=true AND estado_validacion='aprobado' AND retirado_en IS NULL`, con convocatoria publicada.
- Las escrituras son sólo de un proceso privilegiado tras confirmación Telegram; nunca del navegador.
- Nuevas listas, exámenes y resoluciones agregan EVENTOS al ID estable; no duplican CONVOCATORIAS.
- `fecha_ultima_consulta` es actividad de n8n, `fecha_ultima_novedad` deriva de `fecha_oficial` de eventos publicados aprobados.

## Comprobaciones realizadas sin navegador
1. Consultada base real: 9 filas / 9 IDs únicos / 0 inconsistencias ID JSON / 0 slugs. **Superada**.
2. Sintaxis de `convocatorias.js`, `convocatoria.js` y `supabase-data-next.js`. **Superada**.
3. Rutas/redirect escritos en rama. **Preparado**, no desplegado.
4. Los favoritos continúan indexados por `id`, no por slug. **Revisado en código**.

## Pruebas pendientes
- Ejecutar migración en entorno de prueba, verificar RLS con rol `anon` y credenciales autenticadas; insertar un evento pendiente y comprobar que **no aparece en respuesta de red**; aprobar y comprobar que sí.
- Probar 9 fichas existentes, historial vacío, fases no aplicables, eventos duplicados y enlaces oficiales HTTPS.
- Crear slug inmutable de prueba y abrir ruta nueva y antigua hacia la misma ficha y favorito.
- Activar el adaptador `supabase-data-next.js` solo tras verificar consulta de nueve datos.
- Contrastar en pantalla escritorio/móvil 25 resultados, filtros, ordenación y favoritos.
- No activar publicación automática; verificar aprobación previa por Telegram y retirar eventos.
- No desplegar a Netlify mientras esté pendiente la revisión.

## Impacto y riesgos a revisar antes de ejecutar
- Índices únicos `slug`/`dedupe_key`: garantizar asignación sin colisiones.
- No sustituir aún `published=true` con una condición que oculte retrospectivamente los 9 expedientes antes de auditar su aprobación.
- La copia de respaldo JSON es pública y necesita un proceso editorial fiable; nunca incorporar candidatos pendientes.
- La tabla de eventos debe quedar en RLS restrictiva antes de conectar cualquier productor.

## IDs y claves para n8n — contrato de generación
- Los 9 IDs actuales (ocho `OPO-0001` a `OPO-0008`, más el expediente BOP existente) son inmutables; sus favoritos se mantienen por `opportunities.id`.
- Procesos nuevos: `OPO-{AÑO}-{HUELLA_ESTABLE}`. Eventos: `EVT-{convocatoria_id}-{HUELLA_ESTABLE}`.
- Nunca generar `MAX(id)+1`. Canonicalizar las claves con normalización Unicode, espacios, URL sin parámetros de rastreo y casefolding coherente. La HUELLA_ESTABLE se deriva de una función hash determinista de `dedupe_key`, con longitud acordada y detección de colisiones. No volver a generar después de asignar el ID.
- `dedupe_key` de convocatoria: (1) organismo normalizado + expediente oficial; si falta (2) boletín + número de anuncio; si falta (3) URL canónica de bases; si no es inequívoco (4) cola de revisión manual.
- `evento_dedupe_key`: convocatoria_id + tipo_evento + fecha_oficial + (referencia_oficial o URL canónica). Si no hay fecha o referencia segura, revisión manual. No tratar fecha_detectada como fecha_oficial.
- Los nuevos eventos nacen `estado_validacion='pendiente'`, `publicado=false`; solo aprobación Telegram autorizada puede pasar a `aprobado` y publicado con marca `aprobado_en`.
- Contrato público: `publicado=true`, `estado_validacion='aprobado'`, `retirado_en IS NULL`. El navegador no debe recibir otros eventos. Fecha de última consulta y `updated_at` jamás son novedades.
- Estados permitidos de validación: `pendiente`, `aprobado`, `corregir`, `rechazado`. Tipos de evento: `convocatoria_publicada`, `apertura_plazo`, `correccion_bases`, `lista_provisional`, `lista_definitiva`, `fecha_examen`, `cambio_fecha_examen`, `resultado_examen`, `valoracion_meritos`, `propuesta_nombramiento`, `resolucion_final`, `plazo_finalizado`, `incidencia`, `otro`.
- Trigger de `opportunity_events.updated_at` solo actualiza control técnico; no afecta a la fecha oficial.
