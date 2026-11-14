# OpoRadarCádiz — contrato de datos para novedades y fichas

Este documento propone el formato que enviará n8n a la **cola privada de revisión**. No es una orden para publicar.

## Convocatoria (expediente estable)

```json
{
  "id": "OPO-0001",
  "organism": "Organismo emisor",
  "title": "Denominación publicada",
  "location": "Municipio o ámbito expresamente anunciado",
  "processType": "opposition",
  "state": "published",
  "publishedOn": "AAAA-MM-DD",
  "applicationsEndOn": null,
  "url": "https://enlace-oficial-al-expediente",
  "lastCheckedAt": "AAAA-MM-DDTHH:mm:ss+02:00",
  "lastOfficialChangeOn": "AAAA-MM-DD",
  "publicationStatus": "approved",
  "events": []
}
```

**No utilizar datos ficticios del ejemplo como anuncios reales.** Conservar los ID ya publicados (`OPO-0001`, etc.) y sus favoritos. Si una fuente cambia su identificador, mantener un mapa de alias privados `source_id → stable_id` y no generar una ficha duplicada.

## Evento (una novedad por expediente)

```json
{
  "id": "identificador-estable-de-evento",
  "opportunityId": "OPO-0001",
  "type": "lists",
  "officialPublishedOn": "AAAA-MM-DD",
  "title": "Lista provisional publicada",
  "url": "https://documento-oficial",
  "publicationStatus": "pending",
  "approved": false,
  "detectedAt": "AAAA-MM-DDTHH:mm:ss+02:00"
}
```

Tipos sugeridos: `published`, `open`, `deadline`, `lists`, `exam`, `key`, `results`, `resolution`, `closure` y `other`.

**Reglas:**
1. Los eventos detectados se registran en `COLA_REVISION`, nunca en una API pública. No publicar hasta aprobación.
2. El backend público debe filtrar `publicationStatus = 'approved'`, además de `published = true` en el expediente. La validación de JS es una segunda barrera, no seguridad.
3. `lastCheckedAt` es actividad técnica: nunca se usa para clasificar novedades ni para ordenar el resultado.
4. `lastOfficialChangeOn` se calcula desde eventos oficiales aprobados. No inventar fechas ni completar hitos vacíos.
5. Deduplicar eventos preferentemente por ID oficial y, como respaldo, `opportunityId + tipo + fecha + URL canónica`.
6. Cerrar solicitudes no significa archivar. Exigir resolución o evidencia de fin del proceso.
7. En la web pública solo se proyectarán campos permitidos y enlaces HTTPS oficiales. No exponer borradores, errores de fuente, notas privadas o datos de personas aspirantes.
8. Las fichas usan `/convocatoria.html?id=<ID_ESTABLE>`; no se crean nuevas URLs al añadir eventos.

## Adaptador actual

La web consume `OpoData.loadOpportunities()` desde `web/supabase-data.js`, con respaldo `web/assets/convocatorias.json`.

Las páginas actuales reconocen los campos anteriores `announcements[]` y `milestones{}`. Un futuro adaptador puede convertir solo los eventos aprobados de `events[]` a la lista de anuncios, sin cambiar los identificadores.

## Pruebas pendientes antes de publicar

- Verificar la consulta pública y las políticas de acceso en Supabase.
- Contrastar estados aprobados de los nueve expedientes existentes.
- Abrir cada ficha y comprobar enlaces, fechas, ausencia de hitos, favoritos y navegación.
- Validar búsqueda, filtros, ordenación y paginación en móvil y escritorio.
- Probar una URL de ficha inexistente y la carga de respaldo.
- Revisar preview Netlify y no publicar datos en revisión.
