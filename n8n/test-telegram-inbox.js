const assert = require('node:assert/strict');
const { firstUrl, normalizeTelegramItem } = require('./telegram-inbox-normalize');

const when = new Date('2026-10-15T15:00:00.000Z');

assert.equal(firstUrl('Mira https://example.org/bases.pdf.'), 'https://example.org/bases.pdf');

const link = normalizeTelegramItem({
  message: {
    message_id: 91,
    text: 'Bolsa de limpieza https://www.bopcadiz.es/bases.pdf',
    chat: { id: 466646695 },
    from: { id: 466646695 },
  },
}, {}, when);
assert.equal(link.guardar, true);
assert.equal(link.tipo_entrada, 'URL');
assert.equal(link.url_fuente, 'https://www.bopcadiz.es/bases.pdf');
assert.equal(link.aprobacion, 'Pendiente');
assert.match(link.id_candidato, /^TG-20261015-[0-9a-f]{8}$/);

const duplicate = normalizeTelegramItem({
  message: {
    message_id: 92,
    text: 'Otra nota https://www.bopcadiz.es/bases.pdf',
    chat: { id: 466646695 },
    from: { id: 466646695 },
  },
}, {}, when);
assert.equal(duplicate.id_candidato, link.id_candidato);

const pdf = normalizeTelegramItem({
  message: {
    message_id: 93,
    caption: 'Bases que he encontrado',
    document: { file_unique_id: 'PDF-UNICO-1' },
    chat: { id: 466646695 },
    from: { id: 466646695 },
  },
}, { data: { mimeType: 'application/pdf', fileExtension: 'pdf' } }, when);
assert.equal(pdf.guardar, true);
assert.equal(pdf.tipo_entrada, 'PDF');

const intruder = normalizeTelegramItem({
  message: { text: 'https://example.org', chat: { id: 99 }, from: { id: 99 } },
}, {}, when);
assert.equal(intruder, null);

const help = normalizeTelegramItem({
  message: { text: 'hola', chat: { id: 466646695 }, from: { id: 466646695 } },
}, {}, when);
assert.equal(help.guardar, false);

console.log('telegram-inbox: 5 pruebas superadas');

