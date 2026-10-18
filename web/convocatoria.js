'use strict';
(()=>{
 const mount=document.getElementById('detail-content'),message=document.getElementById('detail-message');
 const params=new URLSearchParams(location.search);const id=params.get('id');const slug=params.get('slug');const savedKey='oporadar:radar:saved:v1';
 const labels={opposition:'Oposición',combined:'Concurso-oposición',merit:'Concurso de méritos',pool:'Bolsa de trabajo'};
 const statuses={published:'Convocatoria publicada',open:'Plazo abierto según última revisión',lists:'Listas publicadas',exam:'Examen anunciado'};
 const validDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')&&!Number.isNaN(Date.parse(v+'T12:00:00Z'));
 const niceDate=v=>validDate(v)?new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric',timeZone:'Europe/Madrid'}).format(new Date(v+'T12:00:00Z')):'Sin fecha confirmada';
 const visibleEvent=e=>e?.approved!==false&&(!e?.publicationStatus||['published','approved','publicada','validada'].includes(String(e.publicationStatus).toLowerCase()));
 const safeUrl=v=>{try{return new URL(v).protocol==='https:'}catch{return false}};
 const el=(tag,cls,value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!=null)x.textContent=value;return x};
 const official=(title,url)=>{const a=el('a','',title+' ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a};
 function events(r){
  const all=[{date:r.publishedOn,title:'Convocatoria publicada',url:r.url,type:'published',approved:true},{date:r.boePublishedOn,title:'Publicación en '+(r.officialBulletin||'BOE'),url:r.boeUrl,type:'bulletin',approved:true}];
  for(const a of Array.isArray(r.announcements)?r.announcements:[])all.push({date:a.date,title:a.title,url:a.url,id:a.id,type:a.type||'announcement',approved:visibleEvent(a)});
  for(const a of Array.isArray(r.events)?r.events:[])if(a.approved===true&&['approved','published'].includes(String(a.publicationStatus||'').toLowerCase()))all.push({date:a.officialPublishedOn||a.date,title:a.title,url:a.url,id:a.id,type:a.type||'other',approved:true});
  const names={lists:'Lista de admisión',exam:'Fecha de examen',key:'Plantilla de respuestas',results:'Resultados'};
  for(const [type,a] of Object.entries(r.milestones||{}))if(a)all.push({date:a.publishedOn,title:a.text||names[type]||'Anuncio',url:a.url,type,id:a.id,approved:visibleEvent(a)});
  if(r.closure?.url&&r.closure?.publishedOn)all.push({date:r.closure.publishedOn,title:r.closure.text||'Resolución de cierre',url:r.closure.url,type:'closure',approved:visibleEvent(r.closure)});
  const seen=new Set();return all.filter(e=>e.approved&&validDate(e.date)&&safeUrl(e.url)&&e.title).filter(e=>{const k=e.id||[e.type,e.date,e.url].join('|');if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>b.date.localeCompare(a.date));
 }
 function isArchived(r){const c=r.closure;return !!(c&&['completed','cancelled','expired','replaced'].includes(c.reason)&&validDate(c.publishedOn)&&validDate(c.verifiedOn)&&safeUrl(c.url)&&c.verifiedOn<=r.reviewedOn)}
 function show(r){
  message.hidden=true;mount.hidden=false;
  const state=r.state==='open'&&r.reviewBefore&&r.reviewBefore<=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())?'review':r.state;
  const history=events(r);const head=el('section','detail-head');head.append(el('p','eyebrow',r.organism),el('h1','',r.title),el('p','detail-muted',r.location||'Ámbito no indicado'));
  const meta=el('div','detail-meta');for(const value of [labels[r.processType]||'Tipo no indicado',isArchived(r)?'Archivada':state==='review'?'Plazo pendiente de revisión':statuses[state]||'En seguimiento',r.places!=null?r.places+' plazas':null])if(value)meta.append(el('span','detail-tag',value));head.append(meta);mount.append(head);
  const news=el('section','detail-block');news.append(el('h2','','Última novedad confirmada'));if(history.length){const latest=history[0];news.append(el('p','',latest.title),el('p','detail-muted',niceDate(latest.date)),official('Ver anuncio oficial',latest.url))}else news.append(el('p','detail-muted','Aún no se ha registrado un anuncio verificable.'));mount.append(news);
  const period=el('section','detail-block');period.append(el('h2','','Plazo de solicitudes'),el('p','',r.period||'Consultar las bases oficiales'));if(validDate(r.applicationsEndOn))period.append(el('p','detail-muted','Fecha de fin publicada: '+niceDate(r.applicationsEndOn)));if(safeUrl(r.url))period.append(official('Consultar convocatoria y bases',r.url));mount.append(period);
  const detail=el('section','detail-block');detail.append(el('h2','','Historial de anuncios oficiales'));if(!history.length)detail.append(el('p','detail-empty','Todavía no hay novedades confirmadas.'));
  else{const list=el('ol','detail-events');for(const event of history){const row=el('li','');const date=el('time','',niceDate(event.date));date.dateTime=event.date;row.append(date,el('p','detail-event-title',event.title),official('Consultar publicación',event.url));list.append(row)}detail.append(list)}mount.append(detail);
  const stages=r.selectionSystem==='merit'?[['lists','Listas de admisión'],['results','Resultados']]:[['lists','Listas de admisión'],['exam','Examen'],['key','Plantilla'],['results','Resultados']];
  const stageSection=el('section','detail-block');stageSection.append(el('h2','','Fases del proceso'));const stageList=el('div','detail-phase-list');for(const [key,label] of stages){const item=r.milestones?.[key];const box=el('div','detail-phase');box.append(el('strong','',label),el('span','',item&&visibleEvent(item)&&validDate(item.publishedOn)&&safeUrl(item.url)?'Publicado: '+niceDate(item.publishedOn):'Pendiente de publicación'));stageList.append(box)}stageSection.append(stageList);mount.append(stageSection);
  const actions=el('section','detail-block');actions.append(el('h2','','Guardar este expediente'));const actionRow=el('div','detail-actions'),button=el('button','');button.type='button';const read=()=>{try{const v=JSON.parse(localStorage.getItem(savedKey)||'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string'):[]}catch{return []}};const update=()=>{const isSaved=read().includes(r.id);button.textContent=isSaved?'✦ Quitar de favoritos':'✧ Guardar en favoritos';button.setAttribute('aria-pressed',String(isSaved))};button.addEventListener('click',()=>{try{const list=new Set(read());list.has(r.id)?list.delete(r.id):list.add(r.id);localStorage.setItem(savedKey,JSON.stringify([...list]));update()}catch{button.textContent='No se pudo guardar en este navegador'}});update();actionRow.append(button);actions.append(actionRow,el('p','detail-notice','Los favoritos se conservan en este navegador. Verifica los detalles y requisitos en el organismo oficial.'));mount.append(actions);
 }
 async function init(){
  if(!(id&&/^[A-Za-z0-9][A-Za-z0-9._:-]{0,119}$/.test(id))&&!(slug&&/^[a-z0-9][a-z0-9-]{0,160}$/.test(slug))){message.textContent='El enlace no contiene un identificador válido de convocatoria.';return}
  try{const data=await window.OpoData.loadOpportunities();const r=data.opportunities.find(x=>id?x.id===id:x.slug===slug);if(!r||!r.title||!r.organism||!safeUrl(r.url)||r.approved===false||(r.publicationStatus!=null&&!['published','approved','publicada','validada'].includes(String(r.publicationStatus).toLowerCase()))){message.textContent='No se encuentra este expediente entre las convocatorias publicadas. Puedes volver al listado.';return}document.title=r.title+' · OpoRadarCádiz';show(r)}catch{message.textContent='No ha sido posible cargar la ficha. Vuelve al listado e inténtalo de nuevo.'}
 }init();
})();