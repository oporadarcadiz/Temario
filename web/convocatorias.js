'use strict';
(()=>{
  const labels={all:'Todos',opposition:'Oposición',combined:'Concurso-oposición',merit:'Concurso de méritos',pool:'Bolsa de trabajo'};
  const stateLabels={published:'Convocatoria publicada',open:'Plazo abierto según última revisión',closed:'Plazo finalizado · en seguimiento',lists:'Lista de admisión verificada',exam:'Fecha de examen verificada'};
  const results=document.getElementById('opportunity-results'),summary=document.getElementById('opportunity-summary');
  const revision=document.getElementById('opportunity-revision'),savedFilter=document.getElementById('saved-filter'),savedCount=document.getElementById('saved-count');
  const storageKey='oporadar:radar:saved:v1';
  const requestedPhase=window.location?.hash?.slice(1);
  let pageSize=25,opportunities=[],phase=Object.hasOwn(labels,requestedPhase)?requestedPhase:'all',ready=false,onlySaved=false,archiveView=false;
  const archiveControls=[...document.querySelectorAll('[data-archive]')];
  const fields={search:document.getElementById('radar-search'),place:document.getElementById('radar-place'),level:document.getElementById('radar-level'),deadline:document.getElementById('radar-deadline'),municipality:document.getElementById('radar-municipality'),category:document.getElementById('radar-category'),status:document.getElementById('radar-status'),sort:document.getElementById('radar-sort')};
  const radarFields=document.querySelector('.radar-fields');
  const legacyFavoriteNote=[...document.querySelectorAll('.opportunity-local-note')].find(note=>note.textContent.includes('Los favoritos estarán disponibles próximamente'));
  if(legacyFavoriteNote)legacyFavoriteNote.textContent='Pulsa el corazón de una ficha para seguirla. Inicia sesión para guardar tus convocatorias; los avisos por correo se activarán al conectar el servicio de suscripciones.';
  if(radarFields){
    radarFields.hidden=true;
    const controls=document.createElement('div');controls.className='radar-disclosure';
    controls.append(addText('p','radar-disclosure-copy','Buscar y filtrar convocatorias'));
    for(const [symbol,label] of [['⌕','Abrir el buscador'],['＋','Mostrar los filtros']]){const button=document.createElement('button');button.type='button';button.className='radar-disclosure-button';button.textContent=symbol;button.setAttribute('aria-label',label);button.setAttribute('aria-expanded','false');button.addEventListener('click',()=>{const open=radarFields.hidden;radarFields.hidden=!open;button.setAttribute('aria-expanded',String(open));if(open)fields.search?.focus();});controls.append(button);}
    radarFields.before(controls);
  }
  if(fields.sort?.value==='news')fields.sort.value='published';
  const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function matches(record){const text=fold(fields.search?.value),place=fields.place?.value,level=fields.level?.value,deadline=fields.deadline?.value;if(text&&!fold(record.organism+' '+record.title+' '+record.location+' '+(record.requirements||'')).includes(text))return false;if(place&&record.location!==place)return false;if(fields.municipality?.value&&record.location!==fields.municipality.value)return false;if(fields.category?.value&&record.qualificationFilter!==fields.category.value)return false;if(fields.status?.value&&effectiveState(record)!==fields.status.value)return false;if(level&&record.qualificationFilter!==level)return false;if(deadline&&deadline!=='all'){if(effectiveState(record)!=='open')return false;if(deadline==='soon'){const days=(Date.parse(record.applicationsEndOn)-Date.parse(today()))/86400000;if(!Number.isFinite(days)||days<0||days>7)return false;}}return true;}
  const expanded=new Set();let saved=new Set();
  try { const ids=JSON.parse(localStorage.getItem(storageKey));if(Array.isArray(ids))saved=new Set(ids.filter(id=>typeof id==='string')); }catch{}
  const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  // Una fecha de fin vencida nunca se muestra como plazo abierto. El proceso
  // permanece en seguimiento hasta que exista un cierre oficial verificable.
  function effectiveState(record,date=today()){
    if(record.state==='open'&&/^\d{4}-\d{2}-\d{2}$/.test(record.applicationsEndOn||'')&&record.applicationsEndOn<date)return 'closed';
    return record.state==='open'&&record.reviewBefore&&date>=record.reviewBefore?'review':record.state;
  }
  // Excluir ofertas privadas ordinarias. También se admiten programas públicos
  // remunerados aunque los gestione una entidad colaboradora.
  function isEligibleOpportunity(record){
    const publicBody=/\b(ayuntamiento|diputaci[oó]n|junta de andaluc[ií]a|universidad|consorcio|mancomunidad|agencia p[uú]blica|entidad local|empresa p[uú]blica|empresa municipal|grupo energ[eé]tico|servicio andaluz de salud|administraci[oó]n p[uú]blica)\b/i;
    if(publicBody.test(record.organism||''))return true;
    const kind=String(record.opportunityType||record.tipo_oportunidad||'').toLowerCase();
    const sponsor=record.publicSponsor||record.organismo_financiador||record.organismo_publico||'';
    return ['public_program','programa_publico'].includes(kind)&&record.remunerated===true&&publicBody.test(sponsor);
  }
  function addDays(date,days){const value=new Date(date+'T12:00:00Z');value.setUTCDate(value.getUTCDate()+days);return value.toISOString().slice(0,10);}
  function archiveInfo(record,date=today()){
    const c=record.closure;
    if(c&&c.approved===true&&c.publicado===true&&['completed','cancelled','expired','replaced'].includes(c.reason)&&c.text?.trim()&&safeUrl(c.url)&&/^\d{4}-\d{2}-\d{2}$/.test(c.publishedOn)&&/^\d{4}-\d{2}-\d{2}$/.test(c.verifiedOn)&&c.publishedOn<=c.verifiedOn&&c.verifiedOn<=record.reviewedOn&&c.verifiedOn<=date)return c;
    const final=(record.events||[]).filter(e=>e?.type==='resolucion_final'&&e.approved===true&&e.publicado===true&&!e.retirado_en&&/^\d{4}-\d{2}-\d{2}$/.test(e.officialPublishedOn||'')&&safeUrl(e.url)).sort((a,b)=>b.officialPublishedOn.localeCompare(a.officialPublishedOn))[0];
    return final&&addDays(final.officialPublishedOn,14)<=date?{publishedOn:final.officialPublishedOn,verifiedOn:final.officialPublishedOn,text:'Resultado definitivo publicado. Visible durante dos semanas antes de archivo.',url:final.url}:null;
  }
  function isArchived(record,date=today()){return !!archiveInfo(record,date);}
  function selectedRecords(){return opportunities.filter(o=>isArchived(o)===archiveView);}
  function dateLabel(iso){return new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Madrid'}).format(new Date(iso+'T12:00:00Z'));}
  function reviewAge(record,date=today()){return Math.floor((Date.parse(date+'T12:00:00Z')-Date.parse(record.reviewedOn+'T12:00:00Z'))/86400000);}
  function countFor(key){const records=selectedRecords();return key==='all'?records.length:records.filter(o=>o.processType===key).length;}
  function addText(tag,className,value){const el=document.createElement(tag);el.className=className;el.textContent=value;return el;}
  function safeUrl(url){try{return new URL(url).protocol==='https:';}catch{return false;}}
  function officialLink(title,url){const a=document.createElement('a');a.textContent=title;a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
  function followNotice(record,followed=false){
    let dialog=document.getElementById('follow-notice');
    if(!dialog){dialog=document.createElement('dialog');dialog.id='follow-notice';dialog.className='follow-notice';dialog.innerHTML='<form method="dialog"><button class="follow-close" aria-label="Cerrar">×</button><p class="eyebrow">SEGUIMIENTO PERSONAL</p><h2 data-follow-title></h2><p data-follow-copy></p><a class="button gold" data-follow-action href="/cuenta.html"></a><p class="follow-note" data-follow-note></p></form>';document.body.append(dialog);}
    dialog.querySelector('[data-follow-title]').textContent=followed?'Te has inscrito correctamente.':'Recibe las novedades oficiales.';
    dialog.querySelector('[data-follow-copy]').textContent=followed?`Seguiremos esta convocatoria en tu cuenta. No dejes de consultar manualmente el expediente oficial de “${record.title}”.`:`Inicia sesión y recibe un email cuando haya una novedad verificada sobre “${record.title}”.`;
    const action=dialog.querySelector('[data-follow-action]');action.textContent=followed?'Entendido':'Inicia sesión o crea tu cuenta';action.href=followed?'#':'/cuenta.html';action.onclick=followed?event=>{event.preventDefault();dialog.close();}:null;
    dialog.querySelector('[data-follow-note]').textContent=followed?'El aviso por correo se activará cuando conectemos el servicio de suscripciones.':'Podrás seguir esta convocatoria y elegir avisos por correo. Nunca presentaremos una solicitud en tu nombre.';
    if(typeof dialog.showModal==='function')dialog.showModal();else window.alert('Inicia sesión y recibe un email cuando haya novedades verificadas sobre esta oferta.');
  }
  function save(){try{localStorage.setItem(storageKey,JSON.stringify([...saved]));}catch{}}
  function toggleSaved(id){saved.has(id)?saved.delete(id):saved.add(id);save();render();}
  function trackStep(label,detail,status,url){const item=document.createElement('li');item.className='tracking-step tracking-'+status;item.append(addText('span','tracking-mark',status==='done'?'✓':'·'));const body=document.createElement('div');body.append(addText('strong','',label),addText('p','',detail));if(safeUrl(url))body.append(officialLink('Ver documento',url));item.append(body);return item;}
  function officialHistory(record){
    const events=[{date:record.publishedOn,title:'Convocatoria en el organismo',url:record.url},{date:record.boePublishedOn,title:'Publicación en el '+(record.officialBulletin||'BOE'),url:record.boeUrl},...(record.announcements||[])];
    const names={lists:'Lista de admisión',exam:'Fecha del examen',key:'Plantilla de respuestas',results:'Resultados'};
    for(const [stage,item] of Object.entries(record.milestones||{}))if(item.publishedOn&&safeUrl(item.url))events.push({date:item.publishedOn,title:names[stage],url:item.url});
    const archived=archiveInfo(record);if(archived)events.push({date:archived.publishedOn,title:'Cierre verificado: '+archived.text,url:archived.url});
    const box=document.createElement('div');box.className='announcement-history';box.append(addText('h4','','Historial de anuncios oficiales'));
    const list=document.createElement('ol');list.className='announcement-list';
    events.filter(item=>item.date&&item.title&&safeUrl(item.url)).sort((a,b)=>b.date.localeCompare(a.date)).forEach(item=>{const row=document.createElement('li');row.append(addText('time','',dateLabel(item.date)),addText('span','',item.title),officialLink('Documento',item.url));row.children[0].dateTime=item.date;list.append(row);});
    box.append(list);return box;
  }
  function trackingPanel(record,state){
    const panel=document.createElement('div');panel.className='tracking-panel';panel.id=`tracking-${record.id}`;panel.hidden=!expanded.has(record.id);
    const list=document.createElement('ol');list.className='tracking-list';
    list.append(trackStep('Bases y convocatoria',`Publicadas el ${dateLabel(record.publishedOn)}.`,'done',record.url));
    const applications=state==='open'?'Plazo abierto según la última revisión. '+record.period:state==='review'?'Fecha de revisión alcanzada. Comprueba en el organismo si el plazo sigue abierto.':state==='closed'?'El plazo de solicitudes ha finalizado según la fecha publicada. Seguimos pendientes de listas, examen o resultado oficial.':record.period;
    list.append(trackStep('Solicitudes',applications,state==='open'?'now':state==='review'?'review':'done',record.boeUrl));
    const stages=record.selectionSystem==='merit'?[['lists','Listas de admisión'],['results','Resultados del concurso de méritos']]:[['lists','Listas de admisión'],['exam','Fecha y lugar del examen'],['key','Plantilla de respuestas'],['results','Resultados']];
    for(const [key,label] of stages){const event=record.milestones?.[key];const verified=event&&typeof event.text==='string'&&event.text.trim()&&safeUrl(event.url);list.append(trackStep(label,verified?event.text:'Sin documento verificado en el radar. Consulta el expediente oficial.',verified?'done':'pending',verified?event.url:null));}
    panel.append(addText('p','eyebrow','SEGUIMIENTO DEL PROCESO'),list,officialHistory(record),addText('p','tracking-note','El estado procede de la última revisión indicada abajo. Si hay un anuncio nuevo, prevalece siempre la fuente oficial.'));
    const application=document.createElement('section');application.className='application-guide';application.append(addText('h4','','Cómo presentar la solicitud'),addText('p','tracking-note',record.applicationNote||'Consulta la presentación de solicitudes en las bases oficiales.'),addText('p','tracking-note','1. Comprueba titulación y requisitos. 2. Prepara la documentación y paga la tasa si corresponde. 3. Presenta la solicitud en el registro indicado. 4. Guarda el justificante de presentación.'),addText('p','tracking-note','Tasa: '+(record.fees||'Pendiente de comprobar en las bases; no se presume gratuita.')),officialLink(record.applicationUrl?'Abrir sede de solicitudes':'Consultar instrucciones oficiales',record.applicationUrl||record.url),...(record.applicationSourceUrl?[officialLink('Nota oficial sobre la solicitud',record.applicationSourceUrl)]:[]),addText('p','tracking-note','Crear una cuenta en OpoRadarCádiz no presenta tu solicitud al organismo.'));panel.append(application);
    const archived=archiveInfo(record);if(archived){panel.append(addText('p','tracking-note',`Archivada tras verificar el cierre el ${dateLabel(archived.verifiedOn)}: ${archived.text}`),officialLink('Documento de cierre',archived.url));}
    if(record.selectionSystem==='merit'){panel.append(addText('p','tracking-note','Selección por méritos, sin examen ni plantilla de respuestas.'));if(record.details)panel.append(addText('p','tracking-note',record.details));if(Array.isArray(record.categories)){const breakdown=document.createElement('ul');breakdown.className='announcement-list';for(const category of record.categories)breakdown.append(addText('li','',category.title+': '+category.places+' plazas'));panel.append(addText('h4','','Plazas por categoría'),breakdown);}if(safeUrl(record.applicationUrl))panel.append(officialLink('Sede de solicitudes',record.applicationUrl));}
    return panel;
  }
  function verifiedEvents(record){
    const events=[{date:record.publishedOn,title:'Convocatoria publicada'},{date:record.boePublishedOn,title:'Publicación oficial'},...(Array.isArray(record.announcements)?record.announcements:[]).filter(x=>x.date&&x.title&&safeUrl(x.url)&&x.approved===true&&x.publicado===true&&(!x.publicationStatus||['approved','published','publicada','validada'].includes(String(x.publicationStatus).toLowerCase())))];
    for(const [key,item] of Object.entries(record.milestones||{}))if(item?.publishedOn&&safeUrl(item.url)&&item.approved===true&&item.publicado===true&&(!item.publicationStatus||['approved','published','publicada','validada'].includes(String(item.publicationStatus).toLowerCase())))events.push({date:item.publishedOn,title:{lists:'Listas',exam:'Fecha de examen',key:'Plantilla',results:'Resultados'}[key]||key});
    for(const item of Array.isArray(record.events)?record.events:[])if(item?.approved===true&&item.publicado===true&&!item.retirado_en&&['approved','published'].includes(String(item.publicationStatus||item.estado_validacion||'').toLowerCase())&&item.officialPublishedOn&&item.title&&safeUrl(item.url))events.push({date:item.officialPublishedOn,title:item.title,url:item.url});
    const archived=archiveInfo(record);if(archived)events.push({date:archived.publishedOn,title:'Cierre documentado'});
    return events.filter(e=>/^\d{4}-\d{2}-\d{2}$/.test(e.date)).sort((a,b)=>b.date.localeCompare(a.date));
  }
  function lastChange(record){return verifiedEvents(record)[0]||{date:record.publishedOn,title:'Convocatoria publicada'};}
  function sorting(a,b){
    const mode=fields.sort?.value||'published';
    if(mode==='published')return b.publishedOn.localeCompare(a.publishedOn)||a.id.localeCompare(b.id);
    if(mode==='modified')return lastChange(b).date.localeCompare(lastChange(a).date)||a.id.localeCompare(b.id);
    if(mode==='deadline')return (a.applicationsEndOn||'9999-12-31').localeCompare(b.applicationsEndOn||'9999-12-31')||a.id.localeCompare(b.id);
    const x=lastChange(a),y=lastChange(b);
    return y.date.localeCompare(x.date)||a.id.localeCompare(b.id);
  }
  function renderRow(record){
    const detail=record.slug?'/convocatorias/'+encodeURIComponent(record.slug):'/convocatoria.html?id='+encodeURIComponent(record.id);
    const card=document.createElement('article');card.className='opportunity-row';card.id=record.id;
    const link=document.createElement('a');link.className='opportunity-card-link';link.href=detail;link.setAttribute('aria-label','Ver convocatoria '+record.title+' de '+record.organism);
    const head=addText('div','opportunity-card-head','');
    head.append(addText('h3','',record.title||'Puesto sin especificar'),addText('p','opportunity-card-organism',record.organism||'Organismo no indicado'));
    const reference=record.expediente_oficial||record.source_reference||record.reference||record.convocationNumber||record.id;
    const count=record.places==null?'Plazas sin determinar':record.places+' '+(Number(record.places)===1?'plaza':'plazas');
    const meta=addText('p','opportunity-card-reference','Ref. '+reference+' · '+count);
    const state=effectiveState(record);
    const status=addText('p','opportunity-card-status',isArchived(record)?'Archivada':state==='review'?'Estado pendiente de verificar':stateLabels[state]||'Convocatoria publicada');
    link.append(head,meta,status);
    const heart=document.createElement('button');heart.type='button';heart.className='opportunity-card-heart';heart.style.setProperty('pointer-events','auto','important');heart.style.zIndex='3';const followed=saved.has(record.id);heart.textContent=followed?'♥':'♡';heart.classList.toggle('is-following',followed);heart.setAttribute('aria-pressed',String(followed));heart.setAttribute('aria-label','Seguir '+record.title);heart.title='Seguir esta convocatoria';heart.addEventListener('click',async event=>{event.preventDefault();event.stopPropagation();await window.OpoAccountReady;const account=window.OpoAccount?.get?.();if(!account){followNotice(record);return;}saved.add(record.id);save();heart.textContent='♥';heart.classList.add('is-following');heart.setAttribute('aria-pressed','true');followNotice(record,true);});
    card.append(link,heart);
    return card;
  }
  function newsletterCard(){
    const section=document.createElement('aside');section.className='weekly-newsletter';section.innerHTML='<div><p class="eyebrow">BOLETÍN GRATUITO</p><h2>Novedades de la semana, cada lunes.</h2><p>Recibirás una selección de convocatorias y anuncios oficiales publicados durante la semana.</p></div><div><a class="button gold" href="/cuenta.html">Suscríbete al boletín semanal</a><p class="weekly-note">Disponible al activar el sistema de correo y el consentimiento de suscripción.</p></div>';
    return section;
  }
  function render(){
    if(!ready)return;
    archiveControls.forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.archive==='archived')===archiveView)));
    document.querySelectorAll('[data-phase]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.phase===phase)));
    document.querySelectorAll('[data-count]').forEach(el=>el.textContent=countFor(el.dataset.count));
    savedFilter.setAttribute('aria-pressed',String(onlySaved));savedCount.textContent=selectedRecords().filter(o=>saved.has(o.id)).length;
    const visible=selectedRecords().filter(o=>(phase==='all'||o.processType===phase)&&(!onlySaved||saved.has(o.id))&&matches(o)).sort(sorting);
    summary.textContent=`${visible.length} ${visible.length===1?'convocatoria revisada':'convocatorias revisadas'}`;
    results.replaceChildren();
    const more=document.getElementById('opportunity-more');if(more)more.hidden=true;
    if(!visible.length){const empty=document.createElement('div');empty.className='opportunity-empty';const heading=onlySaved?'Aún no sigues procesos en esta selección':archiveView?'Sin convocatorias archivadas en esta selección':`Sin procesos verificados en «${labels[phase]}»`;const copy=onlySaved?'Pulsa «Seguir» en una convocatoria. Inicia sesión para conservarla en tu cuenta.':archiveView?'Se archivan cuando se verifica el cierre, la cancelación o el fin de vigencia. El cierre de solicitudes no termina el seguimiento.':'Consulta «Todos» para ver los procesos registrados. Se incorporarán nuevos procesos tras verificar sus documentos oficiales.';empty.append(addText('h3','',heading),addText('p','',copy));results.append(empty);return;}
    if(!archiveView&&!onlySaved&&phase==='all'&&!fields.search?.value&&!fields.place?.value&&!fields.level?.value&&!fields.deadline?.value&&!fields.municipality?.value&&!fields.category?.value&&!fields.status?.value){results.append(newsletterCard());}
    visible.slice(0,pageSize).forEach(record=>results.append(renderRow(record)));if(more){more.hidden=visible.length<=pageSize;more.textContent='Cargar más convocatorias ('+Math.max(0,visible.length-pageSize)+' restantes)';}
  }
  document.querySelectorAll('[data-phase]').forEach(button=>button.addEventListener('click',()=>{if(!ready)return;phase=button.dataset.phase;render();if(button.classList.contains('stage-select'))document.getElementById('convocatorias').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}));
  savedFilter.addEventListener('click',()=>{onlySaved=!onlySaved;render();});
  archiveControls.forEach(button=>button.addEventListener('click',()=>{archiveView=button.dataset.archive==='archived';render();}));
  Object.values(fields).filter(Boolean).forEach(el=>el.addEventListener('input',()=>{pageSize=25;render();}));document.getElementById('opportunity-more')?.addEventListener('click',()=>{pageSize+=25;render();});
  async function load(){try{await window.OpoAccountReady;try{saved=new Set(JSON.parse(localStorage.getItem(storageKey)||'[]'));}catch{saved=new Set();}const data=await window.OpoData.loadOpportunities();const seen=new Set();opportunities=data.opportunities.filter(o=>{if(!o.id||seen.has(o.id)||o.published!==true||(o.publicationStatus!=null&&!['published','approved','publicada','validada','aprobado'].includes(String(o.publicationStatus).toLowerCase()))||o.approved===false||!isEligibleOpportunity(o)||!o.title||!(Number.isInteger(o.places)&&o.places>=1||o.processType==='pool'&&o.places==null)||!stateLabels[o.state]||!labels[o.processType]||o.processType==='all'||!/^\d{4}-\d{2}-\d{2}$/.test(o.publishedOn)||!/^\d{4}-\d{2}-\d{2}$/.test(o.boePublishedOn)||!/^\d{4}-\d{2}-\d{2}$/.test(o.reviewedOn))return false;try{if(new URL(o.url).protocol!=='https:'||new URL(o.boeUrl).protocol!=='https:')return false;}catch{return false;}seen.add(o.id);return true;});if(opportunities.some(o=>o.id===requestedPhase)){onlySaved=false;archiveView=isArchived(opportunities.find(o=>o.id===requestedPhase));}ready=true;
    const towns=[...new Set(opportunities.map(o=>o.location).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));const municipal=fields.municipality;if(municipal)for(const town of towns){const option=document.createElement('option');option.value=town;option.textContent=town;municipal.append(option);}
    revision.textContent=`Selección publicada (última revisión de la base: ${dateLabel(data.reviewedOn)}). Las fechas de consulta no se consideran novedades.${data.notice?' '+data.notice:''}`;render();if(opportunities.some(o=>o.id===requestedPhase))document.getElementById(requestedPhase)?.scrollIntoView({block:'start'});}catch{summary.textContent='No se han podido cargar las convocatorias.';results.replaceChildren(addText('p','opportunity-empty','Recarga la página para volver a intentarlo.'));}}
  load();
})();
