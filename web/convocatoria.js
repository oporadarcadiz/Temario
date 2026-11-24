'use strict';
(()=>{
 const mount=document.getElementById('detail-content'),message=document.getElementById('detail-message');
 const params=new URLSearchParams(location.search);const id=params.get('id');const slug=params.get('slug');
 const labels={opposition:'Oposición',combined:'Concurso-oposición',merit:'Concurso de méritos',pool:'Bolsa de trabajo'};
 const statuses=window.OpoData.STATE_LABELS;
 const savedKey='oporadar:radar:saved:v1';
 const validDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')&&!Number.isNaN(Date.parse(v+'T12:00:00Z'));
 const saved=()=>{try{return new Set(JSON.parse(localStorage.getItem(savedKey)||'[]'))}catch{return new Set()}};
 const save=async list=>{try{localStorage.setItem(savedKey,JSON.stringify([...list]));await window.OpoAccount?.save?.();return true;}catch{return false}};
 const niceDate=v=>validDate(v)?new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric',timeZone:'Europe/Madrid'}).format(new Date(v+'T12:00:00Z')):'Sin fecha confirmada';
 const visibleEvent=e=>e?.approved===true&&e?.publicado===true&&!e?.retirado_en&&!e?.retiredAt&&(!e?.publicationStatus||['published','approved','publicada','validada'].includes(String(e.publicationStatus).toLowerCase()));
 const safeUrl=v=>{try{return new URL(v).protocol==='https:'}catch{return false}};
 const el=(tag,cls,value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!=null)x.textContent=value;return x};
 const official=(title,url)=>{const a=el('a','',title+' ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a};
 function events(r){
  const all=[{date:r.publishedOn,title:'Convocatoria publicada',url:r.url,type:'published',approved:true},{date:r.boePublishedOn,title:'Publicación en '+(/^https:\/\/(?:www\.)?boe\.es\//i.test(r.boeUrl||'')?'BOE':r.officialBulletin||'boletín oficial'),url:r.boeUrl,type:'bulletin',approved:true}];
  for(const a of Array.isArray(r.announcements)?r.announcements:[])all.push({date:a.date,title:a.title,url:a.url,id:a.id,type:a.type||'announcement',approved:visibleEvent(a)});
  for(const a of Array.isArray(r.events)?r.events:[])if(a.approved===true&&a.publicado===true&&!a.retirado_en&&['approved','published'].includes(String(a.publicationStatus||a.estado_validacion||'').toLowerCase()))all.push({date:a.officialPublishedOn||a.date,title:a.title,url:a.url,id:a.id,type:a.type||'other',approved:true});
  const names={lists:'Lista de admisión',exam:'Fecha de examen',key:'Plantilla de respuestas',results:'Resultados'};
  for(const [type,a] of Object.entries(r.milestones||{}))if(a)all.push({date:a.publishedOn,title:a.text||names[type]||'Anuncio',url:a.url,type,id:a.id,approved:visibleEvent(a)});
  if(r.closure?.url&&r.closure?.publishedOn)all.push({date:r.closure.publishedOn,title:r.closure.text||'Resolución de cierre',url:r.closure.url,type:'closure',approved:visibleEvent(r.closure)});
  // El mismo anuncio puede venir como evento de BD y como hito heredado:
  // se conserva una sola entrada, priorizando la que tiene ID y texto oficial.
  return window.OpoData.dedupeHistory(all.filter(e=>e.approved&&validDate(e.date)&&safeUrl(e.url)&&e.title)).sort((a,b)=>b.date.localeCompare(a.date));
 }
 const verifiedCancellation=record=>window.OpoData.verifiedCancellation(record);
 function effectiveState(record,date=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())){
  return window.OpoData.deriveState(record,date);
 }
 function isArchived(r){const c=r.closure;const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());return !!(c&&c.approved===true&&c.publicado===true&&['completed','cancelled','expired','replaced'].includes(c.reason)&&c.text?.trim()&&validDate(c.publishedOn)&&validDate(c.verifiedOn)&&safeUrl(c.url)&&c.publishedOn<=c.verifiedOn&&c.verifiedOn<=r.reviewedOn&&c.verifiedOn<=today)}
 function followBlock(r){
  const block=el('section','detail-block detail-follow');const list=saved();const button=document.createElement('button');button.type='button';
  const render=following=>{button.textContent=following?'♥ Siguiendo':'♡ Seguir esta convocatoria';button.setAttribute('aria-pressed',String(following));};render(list.has(r.id));
  const note=el('p','detail-notice','Guarda esta convocatoria para seguir sus novedades oficiales. Los avisos por correo se activarán cuando conectemos el servicio de suscripciones.');
  button.addEventListener('click',async()=>{await window.OpoAccountReady;const account=window.OpoAccount?.get?.();if(!account){location.href='/cuenta.html';return}const following=list.has(r.id);if(following)list.delete(r.id);else list.add(r.id);const persisted=await save(list);render(!following);note.textContent=persisted?(following?'Has dejado de seguir esta convocatoria. Puedes volver a marcar el corazón cuando quieras.':'Te has inscrito correctamente. Cuando actives los avisos por correo, recibirás novedades verificadas. No dejes de consultar manualmente el expediente oficial.'): 'La convocatoria se ha guardado en este navegador. Reintenta la sincronización desde Mi cuenta.';});
  block.append(el('h2','','Sigue esta convocatoria'),el('p','detail-muted','Marca el corazón para tenerla localizada.'),button,note);return block;
 }
 function show(r){
  message.hidden=true;mount.hidden=false;
  const cancellation=verifiedCancellation(r);
  const state=effectiveState(r);
  const history=events(r);const head=el('section','detail-head');head.append(el('p','eyebrow',r.organism),el('h1','',r.title),el('p','detail-muted',r.location||'Ámbito no indicado'));
  const meta=el('div','detail-meta');for(const value of [labels[r.processType]||'Tipo no indicado',isArchived(r)?'Archivada':statuses[state]||'En seguimiento',r.opportunityType==='temporary_roster'&&r.places==null&&Number.isSafeInteger(r.rosterCapacity)&&r.rosterCapacity>0?'Listado de '+r.rosterCapacity+' aspirantes · no son plazas':r.places!=null?r.places+' plazas':null])if(value)meta.append(el('span','detail-tag',value));head.append(meta);mount.append(head);
  if(cancellation){
    const alert=el('section','detail-block detail-annulment');
    alert.setAttribute('role','note');
    alert.append(el('h2','','Aviso oficial: bases anuladas'),
     el('p','','El anuncio de bases ha quedado sin efectos. No existe un plazo vigente para solicitar estas plazas al amparo de las bases anuladas.'),
     el('p','',cancellation.text),
     el('p','detail-muted','Anulación publicada el '+niceDate(cancellation.publishedOn)+'. La anulación no significa que las plazas hayan sido eliminadas.'));
    alert.append(official('Consultar anulación en el BOP de Cádiz',cancellation.url));
    mount.append(alert);
  }
  mount.append(followBlock(r));
  const news=el('section','detail-block');news.append(el('h2','','Última novedad confirmada'));if(history.length){const latest=history[0];news.append(el('p','',latest.title),el('p','detail-muted',niceDate(latest.date)),official('Ver anuncio oficial',latest.url))}else news.append(el('p','detail-muted','Aún no se ha registrado un anuncio verificable.'));mount.append(news);
  const essentials=el('section','detail-block');essentials.append(el('h2','','Datos del proceso'));
  const facts=[['Estado actual',statuses[state]],['Referencia',r.expediente_oficial||r.source_reference||r.reference||r.id],['Organismo',r.organism],['Municipio',r.municipio||r.location],['Provincia',r.provincia],['Ámbito',r.ambito],['Categoría',r.categoria],['Grupo profesional',r.grupo_profesional],['Sistema de acceso',r.selectionSystem||r.sistema_acceso],['Plazas',r.places!=null?String(r.places):null],['Listado temporal (sin plazas garantizadas)',r.opportunityType==='temporary_roster'&&r.places==null&&Number.isSafeInteger(r.rosterCapacity)&&r.rosterCapacity>0?String(r.rosterCapacity)+' aspirantes':null],['Retribución',r.retribucion]];
  const factList=el('dl','detail-facts');for(const [key,value] of facts)if(value!=null&&String(value).trim()){const term=el('dt','',key),definition=el('dd','',String(value));factList.append(term,definition)}essentials.append(factList);mount.append(essentials);
  const imageUrl=r.imageUrl||r.imagen_url; if(safeUrl(imageUrl)&&r.imageApproved===true){const figure=el('figure','detail-figure'),image=document.createElement('img');image.src=imageUrl;image.alt=r.imageAlt||'Imagen documental de la convocatoria';image.loading='lazy';image.decoding='async';figure.append(image);if(r.imageCredit)figure.append(el('figcaption','detail-muted',r.imageCredit));head.append(figure)}
  const requirements=el('section','detail-block');requirements.append(el('h2','','Requisitos de participación'),el('p','',r.requirements||r.requisitos||'Consulta los requisitos y la titulación exigida en las bases oficiales.'));mount.append(requirements);
  const period=el('section','detail-block');
  const periodInfo=window.OpoData.periodInfo(r,state);
  period.append(el('h2','','Plazos y subsanación'));
  period.append(el('p','detail-period-state',periodInfo.inscription));
  if(periodInfo.rectification)period.append(el('p','detail-period-rectification',periodInfo.rectification));
  period.append(el('p','detail-muted',r.period||r.details||'Consultar las bases oficiales'));
  if(validDate(r.applicationsStartOn||r.fecha_inicio_plazo))period.append(el('p','detail-muted','Inicio del plazo: '+niceDate(r.fecha_inicio_plazo||r.applicationsStartOn)));
  if(validDate(r.applicationsEndOn))period.append(el('p','detail-muted','Fecha de fin publicada: '+niceDate(r.applicationsEndOn)));
  if(safeUrl(r.url))period.append(official('Consultar convocatoria y bases',r.url));mount.append(period);
  const docs=el('section','detail-block');docs.append(el('h2','','Documentos y trámites oficiales'));const officialDocs=[
   [cancellation?'Bases originales (sin efectos)':'Bases y convocatoria',r.url_bases||r.url],
   ['Boletín oficial de referencia',r.boeUrl],
   ...(cancellation?[['Anulación oficial de las bases',cancellation.url]]:
       state==='open'?[['Presentar solicitud en la sede oficial',r.url_solicitud||r.applicationUrl]]:
       state==='review'?[['Consultar sede y plazo oficial',r.url_solicitud||r.applicationUrl]]:[])
  ];const unique=new Set();for(const [text,url] of officialDocs)if(safeUrl(url)&&!unique.has(url)){unique.add(url);docs.append(el('p','',null));docs.lastChild.append(official(text,url))}if(unique.size===0)docs.append(el('p','detail-muted','No hay enlaces oficiales comprobados.'));mount.append(docs);
  const detail=el('section','detail-block');detail.append(el('h2','','Historial de anuncios oficiales'));if(!history.length)detail.append(el('p','detail-empty','Todavía no hay novedades confirmadas.'));
  else{const list=el('ol','detail-events');for(const event of history){const row=el('li','');const date=el('time','',niceDate(event.date));date.dateTime=event.date;row.append(date,el('p','detail-event-title',event.title),official('Consultar publicación',event.url));list.append(row)}detail.append(list)}mount.append(detail);
  const stages=r.selectionSystem==='merit'?[['lists','Listas de admisión'],['results','Resultados']]:[['lists','Listas de admisión'],['exam','Examen'],['key','Plantilla'],['results','Resultados']];
  const stageSection=el('section','detail-block');stageSection.append(el('h2','','Fases del proceso'));const stageList=el('div','detail-phase-list');for(const [key,label] of stages){const item=r.milestones?.[key];const box=el('div','detail-phase');box.append(el('strong','',label),el('span','',item&&visibleEvent(item)&&validDate(item.publishedOn)&&safeUrl(item.url)?'Publicado: '+niceDate(item.publishedOn):'Pendiente de publicación'));stageList.append(box)}stageSection.append(stageList);mount.append(stageSection);
  const notice=el('section','detail-block');notice.append(el('p','detail-notice','Consulta siempre el expediente oficial antes de presentar una solicitud.'));mount.append(notice);
 }
 async function init(){
  if(!(id&&/^[A-Za-z0-9][A-Za-z0-9._:-]{0,119}$/.test(id))&&!(slug&&/^[a-z0-9][a-z0-9-]{0,160}$/.test(slug))){message.textContent='El enlace no contiene un identificador válido de convocatoria.';return}
  try{const data=await window.OpoData.loadOpportunities();const r=data.opportunities.find(x=>id?x.id===id:x.slug===slug);if(!r||r.published!==true||!r.title||!r.organism||!safeUrl(r.url)||r.approved===false||(r.publicationStatus!=null&&!['published','approved','publicada','validada','aprobado'].includes(String(r.publicationStatus).toLowerCase()))){message.textContent=data.source==='respaldo'?'No se ha podido consultar Supabase. La copia local puede estar desactualizada y no incluir este expediente. Inténtalo de nuevo más tarde.':'No se encuentra este expediente entre las convocatorias publicadas. Puedes volver al listado.';return}document.title=r.title+' · OpoRadarCádiz';show(r);if(data.source==='respaldo')mount.prepend(el('p','detail-notice','Aviso: se muestra la copia local de respaldo porque Supabase no está disponible. Comprueba siempre el expediente oficial.'))}catch{message.textContent='No ha sido posible cargar la ficha. Vuelve al listado e inténtalo de nuevo.'}
 }init();
})();
