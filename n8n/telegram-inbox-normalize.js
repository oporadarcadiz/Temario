function hash(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function firstUrl(value = '') {
  const match = String(value).match(/https?:\/\/[^\s<>"']+/i);
  if (!match) return '';
  return match[0].replace(/[),.;!?]+$/, '');
}

function normalizeTelegramItem(input, binary = {}, now = new Date()) {
  const update = input || {};
  const message = update.message || update.edited_message || {};
  const chatId = String(message.chat?.id || '');
  const userId = String(message.from?.id || '');
  const allowed = '466646695';
  if (chatId !== allowed || userId !== allowed) return null;

  const text = String(message.text || message.caption || '').trim();
  const url = firstUrl(text);
  const fileKey = Object.keys(binary || {})[0] || '';
  const isPdf = Boolean(fileKey) && /pdf/i.test(String(binary[fileKey]?.mimeType || binary[fileKey]?.fileExtension || ''));
  const date = now.toISOString();

  if (!url && !isPdf) {
    return {
      guardar: false,
      chat_id: chatId,
      respuesta: 'Envíame el enlace oficial de la oferta o un PDF. También puedes añadir una nota en el mismo mensaje.',
    };
  }

  const source = url || `telegram-pdf:${message.document?.file_unique_id || message.document?.file_id || fileKey}`;
  const id = `TG-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${hash(source)}`;
  return {
    guardar: true,
    chat_id: chatId,
    id_cola: `COLA-${id}`,
    id_candidato: id,
    organismo: 'Pendiente de identificar',
    titulo: text.replace(url, '').trim() || (isPdf ? 'PDF enviado por Telegram' : 'Oferta enviada por Telegram'),
    url_fuente: url,
    motivo_bloqueo: 'Entrada manual recibida por Telegram. Falta validar la fuente oficial y completar los datos antes de publicar.',
    campos_pendientes: 'Organismo; puesto; vigencia; plazo; requisitos; retribución',
    correccion_manual: text,
    estado_revision: 'Bloqueada — corrección necesaria',
    aprobacion: 'Pendiente',
    notas_auditoria: `Recibida por Telegram. chat_id=${chatId}; user_id=${userId}; message_id=${message.message_id || ''}; tipo=${isPdf ? 'PDF' : 'URL'}`,
    ultima_actualizacion: date,
    url_bases: url,
    fecha_revision: date.slice(0, 10),
    binary_key: fileKey,
    tipo_entrada: isPdf ? 'PDF' : 'URL',
    respuesta: `✅ Recibida para revisar\n\nID: ${id}\n${url || 'PDF adjunto'}\n\nNo se publicará hasta completar la ficha y aprobarla.`,
  };
}

if (typeof module !== 'undefined') module.exports = { firstUrl, normalizeTelegramItem };

