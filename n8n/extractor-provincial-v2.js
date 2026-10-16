function clean(s = '') {
  return String(s)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function abs(href, base) {
  const h = String(href || '').trim().replace(/&amp;/gi, '&');
  const b = String(base || '').trim();
  if (!h || h.startsWith('#')) return '';
  if (/^https?:\/\/[^\s/?#]+(?:[/?#]|$)/i.test(h)) return h;
  const m = b.match(/^(https?):\/\/([^\s/?#]+)(\/[^?#]*)?/i);
  if (!m) return '';
  if (h.startsWith('//')) return m[1] + ':' + h;
  if (/^[a-z][a-z0-9+.-]*:/i.test(h)) return '';
  if (h.startsWith('?')) return m[1] + '://' + m[2] + (m[3] || '/') + h;
  const raw = (h.startsWith('/') ? '' : (m[3] || '/').replace(/[^/]*$/, '')) + h;
  const cut = raw.search(/[?#]/);
  const path = cut < 0 ? raw : raw.slice(0, cut);
  const suffix = cut < 0 ? '' : raw.slice(cut);
  const parts = [];
  for (const part of path.split('/')) {
    if (part === '..') parts.pop();
    else if (part && part !== '.') parts.push(part);
  }
  return m[1] + '://' + m[2] + '/' + parts.join('/') + suffix;
}

function relevance(title, url) {
  const t = title.toLowerCase();
  const u = url.toLowerCase();
  if (title.length < 14 || title.length > 260) return 0;
  if (/^(inicio|empleo|empleo público|ofertas? de empleo|convocatorias?|más información|ver más|leer más|noticias?|tablón|sede electrónica)$/i.test(title)) return 0;
  if (/\b(20(?:0\d|1\d|2[0-4]))\b/.test(t)) return 0;
  if (/\b(curso|jornada|noticia|agenda)\b/i.test(t) && !/remunerad|empleo y formación|taller de empleo/i.test(t)) return 0;

  let score = 0;
  if (/\b(convocatoria|convoca|bases?|proceso selectivo|oposici[oó]n|concurso[- ]oposici[oó]n)\b/i.test(t)) score += 2;
  if (/\b(bolsa de (empleo|trabajo)|lista de reserva|selecci[oó]n de personal|oferta p[uú]blica de empleo)\b/i.test(t)) score += 2;
  if (/\b(personal funcionario|personal laboral|contrataci[oó]n temporal|interinidad|plan de empleo)\b/i.test(t)) score += 2;
  if (/\b(programa de empleo y formaci[oó]n|escuela taller|taller de empleo|pr[aá]cticas remuneradas|beca remunerada)\b/i.test(t)) score += 2;
  if (/\b(auxiliar administrativ|administrativ[oa]|subaltern|conserje|ordenanza|operari[oa]|limpieza|monitor|t[eé]cnic[oa])\b/i.test(t)) score += 1;
  if (/\.(pdf|doc|docx)(?:$|[?#])/i.test(u)) score += 1;
  if (/(convocatoria|empleo-publico|oferta-publica|seleccion|oposicion|bolsa|bases|bop)/i.test(u)) score += 1;
  if (/\b(2025|2026|2027)\b/.test(t)) score += 1;
  return score;
}

const inputs = $input.all();
const src = $('Preparar fuentes provinciales').all();
const out = [];
let errors = 0;
let candidates = 0;

for (let i = 0; i < inputs.length; i++) {
  const meta = src[i]?.json || {};
  const raw = inputs[i]?.json || {};
  if (raw.error || raw.statusCode >= 400) {
    errors++;
    out.push({ json: {
      id_candidato: `ERR-${meta.id}-${new Date().toISOString().slice(0, 10)}`,
      organismo: meta.organismo || meta.id,
      titulo: 'No se pudo consultar la fuente',
      url: meta.url,
      fuente: meta.tipo || 'fuente oficial',
      fecha_detectada: new Date().toISOString(),
      estado_revision: 'Error de fuente',
      criterio_automatico: String(raw.error?.message || raw.message || `HTTP ${raw.statusCode || 'desconocido'}`).slice(0, 400),
      html_fingerprint: hash(JSON.stringify(raw.error || raw.statusCode || raw.message)),
      tipo_evento: 'ERROR_FUENTE'
    }});
    continue;
  }

  const html = String(raw.body ?? raw.data ?? raw);
  const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const local = new Set();
  for (const m of anchors) {
    const title = clean(m[2]);
    const url = abs(m[1], meta.url);
    if (!title || !url || relevance(title, url) < 2) continue;
    const key = (meta.organismo + '|' + title + '|' + url.replace(/[?#].*$/, '')).toUpperCase().replace(/\s+/g, ' ').trim();
    if (local.has(key)) continue;
    local.add(key);
    candidates++;
    out.push({ json: {
      id_candidato: `${meta.id}-${hash(key)}`,
      organismo: meta.organismo,
      titulo: title,
      url,
      fuente: meta.url,
      fecha_detectada: new Date().toISOString(),
      estado_revision: 'Pendiente de validar',
      criterio_automatico: /subaltern|auxiliar administrativ|bolsa|interin|conserje|ordenanza/i.test(title) ? 'Prioridad inicial' : 'Revisar',
      html_fingerprint: hash(key),
      tipo_evento: 'CANDIDATO'
    }});
  }
}

const store = $getWorkflowStaticData('global');
store.ultimo_barrido_ok = new Date().toISOString();
store.fuentes_consultadas = inputs.length;
store.candidatos_detectados = candidates;
store.errores_fuente = errors;

return out;
