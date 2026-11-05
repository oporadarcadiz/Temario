/* Catálogo de metadatos: nunca contiene URLs privadas ni nombres de archivos. */
const TEMA1_MEDIA_CATALOG=Object.freeze({
  videos:Object.freeze([
    {id:'video-01-panorama',title:'Vídeo 1 · Panorama y estructura',tramo:'Tramo 1 · Orientación',meta:'Vídeo breve · finalizado oficialmente',state:'pending_delivery',rights:'tema1-amazon',description:'Primera visión de conjunto del Tema 1. Su reproducción se habilitará solo desde una entrega privada aprobada.'},
    {id:'video-02-preliminar',title:'Vídeo 2 · Título Preliminar',tramo:'Tramo 2 · Bases constitucionales',meta:'Vídeo breve',state:'coming_soon',rights:'tema1-amazon',description:'Principios, valores y soberanía.'},
    {id:'video-03-derechos',title:'Vídeo 3 · Derechos y libertades',tramo:'Tramo 3 · Título I',meta:'Vídeo breve',state:'coming_soon',rights:'tema1-amazon',description:'Derechos, garantías y límites.'},
    {id:'video-04-organos',title:'Vídeo 4 · Órganos constitucionales',tramo:'Tramo 4 · Instituciones',meta:'Vídeo breve',state:'coming_soon',rights:'tema1-amazon',description:'Corona, Cortes, Gobierno y Poder Judicial.'},
    {id:'video-05-territorio',title:'Vídeo 5 · Territorio y cierre',tramo:'Tramo 5 · Organización y reforma',meta:'Vídeo breve',state:'coming_soon',rights:'tema1-amazon',description:'Territorio, Tribunal Constitucional, reforma y disposiciones.'},
    {id:'video-06-repaso',title:'Vídeo final · Repaso completo',tramo:'Tramo final · Integración',meta:'Vídeo largo',state:'coming_soon',rights:'tema1-amazon',description:'Reserva para el repaso completo. No existe archivo ni enlace público.'}
  ]),
  audios:Object.freeze([
    {id:'podcast-01-orientacion',title:'Pódcast 1 · Orientación',tramo:'Tramo 1 · Orientación',meta:'Microaudio',state:'coming_soon',rights:'tema1-amazon',description:'Fechas, mapa y estructura general.'},
    {id:'podcast-02-preliminar',title:'Pódcast 2 · Título Preliminar',tramo:'Tramo 2 · Bases constitucionales',meta:'Microaudio',state:'coming_soon',rights:'tema1-amazon',description:'Principios y valores constitucionales.'},
    {id:'podcast-03-derechos',title:'Pódcast 3 · Derechos y libertades',tramo:'Tramo 3 · Título I',meta:'Microaudio',state:'coming_soon',rights:'tema1-amazon',description:'Derechos, deberes y garantías.'},
    {id:'podcast-04-instituciones',title:'Pódcast 4 · Instituciones',tramo:'Tramo 4 · Instituciones',meta:'Microaudio',state:'coming_soon',rights:'tema1-amazon',description:'Corona, Cortes, Gobierno y Poder Judicial.'},
    {id:'podcast-05-cierre',title:'Pódcast 5 · Territorio y cierre',tramo:'Tramo 5 · Organización y reforma',meta:'Microaudio',state:'coming_soon',rights:'tema1-amazon',description:'Territorio, Tribunal Constitucional, reforma y disposiciones.'},
    {id:'podcast-06-repaso',title:'Pódcast final · Repaso completo',tramo:'Tramo final · Integración',meta:'Audio largo',state:'coming_soon',rights:'tema1-amazon',description:'Reserva para un repaso final cuando esté producido y aprobado.'}
  ])
});
function escapeMediaHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function mountMediaCatalog(id,kind){const root=document.getElementById(id),items=TEMA1_MEDIA_CATALOG[kind]||[];if(!root)return;root.innerHTML=items.map(item=>{const ready=item.state==='pending_delivery',label=ready?'Finalizado · entrega privada pendiente':'Disponible en breve',button=ready?'Preparando acceso seguro':'Disponible en breve';return `<article class="item media-item" data-resource-id="${escapeMediaHtml(item.id)}"><p class="tramo">${escapeMediaHtml(item.tramo)}</p><h2>${escapeMediaHtml(item.title)}</h2><p>${escapeMediaHtml(item.description)}</p><div class="meta"><span class="chip">${escapeMediaHtml(item.meta)}</span><span class="chip ${ready?'gold':'gray'}">${escapeMediaHtml(label)}</span></div><button class="resource-button" type="button" disabled>${escapeMediaHtml(button)}</button></article>`;}).join('');}
