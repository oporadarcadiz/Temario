'use strict';
(()=>{
  const labels={all:'Todos',opposition:'Oposición',combined:'Concurso-oposición',merit:'Concurso de méritos',pool:'Bolsa de trabajo'};
  const stateLabels={published:'Convocatoria publicada',open:'Plazo abierto según última revisión',lists:'Lista de admisión verificada',exam:'Fecha de examen verificada'};
  const results=document.getElementById('opportunity-results'),summary=document.getElementById('opportunity-summary');
  const revision=document.getElementById('opportunity-revision'),savedFilter=document.getElementById('saved-filter'),savedCount=document.getElementById('saved-count');
  const storageKey='oporadar:radar:saved:v1';
  const requestedPhase=window.location?.hash?.slice(1);
  let pageSize=25,opportunities=[],phase=Object.hasOwn(labels,requestedPhase)?requestedPhase:'all',ready=false,onlySaved=false,archiveView=false;
  const archiveControls=[...document.querySelectorAll('[data-archive]')];
  const fields={search:document.getElementById('radar-search'),place:document.getElementById('radar-place'),level:document.getElementById('radar-level'),deadline:document.getElementById('radar-deadline'),municipality:document.getElementById('radar-municipality'),category:document.getElementById('radar-category'),status:document.getElementById('radar-status'),sort:document.getElementById('radar-sort')};
  const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function matches(record){const text=fold(fields.search?.value),place=fields.place?.value,level=fields.level?.value,deadline=fields.deadline?.value;if(text&&!fold(record.organism+' '+record.title+' '+record.location+' '+(record.requirements||'')).includes(text))return false;if(place&&record.location!==place)return false;if(fields.municipality?.value&&record.location!==fields.municipality.value)return false;if(fields.category?.value&&record.qualificationFilter!==fields.category.value)return false;if(fields.status?.value&&effectiveState(record)!==fields.status.value)return false;if(level&&record.qualificationFilter!==level)return false;if(deadline&&deadline!=='all'){if(effectiveState(record)!=='open')return false;if(deadline==='soon'){const days=(Date.parse(record.applicationsEndOn)-Date.parse(today()))/86400000;if(!Number.isFinite(days)||days<0||days>7)return false;}}return true;}
  const expanded=new Set();let saved=new Set();
  try { const ids=JSON.parse(localStorage.getItem(storageKey));if(Array.isArray(ids))saved=new Set(ids.filter(id=>typeof id==='string')); }catch{}
  const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  // A passed review date is unknown, never silently promoted to a later stage.
  function effectiveState(record,date=today()){return record.state==='open'&&record.reviewBefore&&date>=record.reviewBefore?'review':record.state;}
  function isArchived(record){const c=record.closure;return !!(c&&['completed','cancelled','expired','replaced'].includes(c.reason)&&c.text?.trim()&&safeUrl(c.url)&&/^\d{4}-\d{2}-\d{2}$/.test(c.publishedOn)&&/^\d{4}-\d{2}-\d{2}$/.test(c.verifiedOn)&&c.publishedOn<=c.verifiedOn&&c.verifiedOn<=record.reviewedOn&&c.verifiedOn<=today());}
  function selectedRecords(){return opportunities.filter(o=>isArchived(o)===archiveView);}
  function dateLabel(iso){return new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Madrid'}).format(new Date(iso+'T12:00:00Z'));}
  function reviewAge(record,date=today()){return Math.floor((Date.parse(date+'T12:00:00Z')-Date.parse(record.reviewedOn+'T12:00:00Z'))/86400000);}
  function countFor(key){const records=selectedRecords();return key==='all'?records.length:records.filter(o=>o.processType===key).length;}
  function addText(tag,className,value){const el=document.createElement(tag);el.className=className;el.textContent=value;return el;}
  function safeUrl(url){try{return new URL(url).protocol==='https:';}catch{return false;}}
  function officialLink(title,url){const a=document.createElement('a');a.textContent=title;a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
  function save(){try{localStorage.setItem(storageKey,JSON.stringify([...saved]));}catch{}}
  function toggleSaved(id){saved.has(id)?saved.delete(id):saved.add(id);save();render();}
  function trackStep(label,detail,status,url){const item=document.createElement('li');item.className='tracking-step tracking-'+status;item.append(addText('span','tracking-mark',status==='done'?'✓':'·'));const body=document.createElement('div');body.append(addText('strong','',label),addText('p','',detail));if(safeUrl(url))body.append(officialLink('Ver documento',url));item.append(body);return item;}
  function officialHistory(record){
    const events=[{date:record.publishedOn,title:'Convocatoria en el organismo',url:record.url},{date:record.boePublishedOn,title:'Publicación en el '+(record.officialBulletin||'BOE'),url:record.boeUrl},...(record.announcements||[])];
    const names={lists:'Lista de admisión',exam:'Fecha del examen',key:'Plantilla de respuestas',results:'Resultados'};
    for(const [stage,item] of Object.entries(record.milestones||{}))if(item.publishedOn&&safeUrl(item.url))events.push({date:item.publishedOn,title:names[stage],url:item.url});
    if(isArchived(record))events.push({date:record.closure.publishedOn,title:'Cierre verificado: '+record.closure.text,url:record.closure.url});
    const box=document.createElement('div');box.className='announcement-history';box.append(addText('h4','','Historial de anuncios oficiales'));
    const list=document.createElement('ol');list.className='announcement-list';
    events.filter(item=>item.date&&item.title&&safeUrl(item.url)).sort((a,b)=>b.date.localeCompare(a.date)).forEach(item=>{const row=document.createElement('li');row.append(addText('time','',dateLabel(item.date)),addText('span','',item.title),officialLink('Documento',item.url));row.children[0].dateTime=item.date;list.append(row);});
    box.append(list);return box;
  }
  function trackingPanel(record,state){
    const panel=document.createElement('div');panel.className='tracking-panel';panel.id=`tracking-${record.id}`;panel.hidden=!expanded.has(record.id);
    const list=document.createElement('ol');list.className='tracking-list';
    list.append(trackStep('Bases y convocatoria',`Publicadas el ${dateLabel(record.publishedOn)}.`,'done',record.url));
    const applications=state==='open'?'Plazo abierto según la última revisión. '+record.period:state==='review'?'Fecha de revisión alcanzada. Comprueba en el organismo si el plazo sigue abierto.':record.period;
    list.append(trackStep('Solicitudes',applications,state==='open'?'now':state==='review'?'review':'done',record.boeUrl));
    const stages=record.selectionSystem==='merit'?[['lists','Listas de admisión'],['results','Resultados del concurso de méritos']]:[['lists','Listas de admisión'],['exam','Fecha y lugar del examen'],['key','Plantilla de respuestas'],['results','Resultados']];
    for(const [key,label] of stages){const event=record.milestones?.[key];const verified=event&&typeof event.text==='string'&&event.text.trim()&&safeUrl(event.url);list.append(trackStep(label,verified?event.text:'Sin documento verificado en el radar. Consulta el expediente oficial.',verified?'done':'pending',verified?event.url:null));}
    panel.append(addText('p','eyebrow','SEGUIMIENTO DEL PROCESO'),list,officialHistory(record),addText('p','tracking-note','El estado procede de la última revisión indicada abajo. Si hay un anuncio nuevo, prevalece siempre la fuente oficial.'));
    const application=document.createElement('section');application.className='application-guide';application.append(addText('h4','','Cómo presentar la solicitud'),addText('p','tracking-note',record.applicationNote||'Consulta la presentación de solicitudes en las bases oficiales.'),addText('p','tracking-note','1. Comprueba titulación y requisitos. 2. Prepara la documentación y paga la tasa si corresponde. 3. Presenta la solicitud en el registro indicado. 4. Guarda el justificante de presentación.'),addText('p','tracking-note','Tasa: '+(record.fees||'Pendiente de comprobar en las bases; no se presume gratuita.')),officialLink(record.applicationUrl?'Abrir sede de solicitudes':'Consultar instrucciones oficiales',record.applicationUrl||record.url),...(record.applicationSourceUrl?[officialLink('Nota oficial sobre la solicitud',record.applicationSourceUrl)]:[]),addText('p','tracking-note','Crear una cuenta en OpoRadarCádiz no presenta tu solicitud al organismo.'));panel.append(application);
    if(isArchived(record)){panel.append(addText('p','tracking-note',`Archivada tras verificar el cierre el ${dateLabel(record.closure.verifiedOn)}: ${record.closure.text}`),officialLink('Documento de cierre',record.closure.url));}
    if(record.selectionSystem==='merit'){panel.append(addText('p','tracking-note','Selección por méritos, sin examen ni plantilla de respuestas.'));if(record.details)panel.append(addText('p','tracking-note',record.details));if(Array.isArray(record.categories)){const breakdown=document.createElement('ul');breakdown.className='announcement-list';for(const category of record.categories)breakdown.append(addText('li','',category.title+': '+category.places+' plazas'));panel.append(addText('h4','','Plazas por categoría'),breakdown);}if(safeUrl(record.applicationUrl))panel.append(officialLink('Sede de solicitudes',record.applicationUrl));}
    return panel;
  }
  function verifiedEvents(record){
    const events=[{date:record.publishedOn,title:'Convocatoria publicada'},{date:record.boePublishedOn,title:'Publicación oficial'},...(Array.isArray(record.announcements)?record.announcements:[]).filter(x=>x.date&&x.title&&safeUrl(x.url))];
    for(const [key,item] of Object.entries(record.milestones||{}))if(item?.publishedOn&&safeUrl(item.url))events.push({date:item.publishedOn,title:{lists:'Listas',exam:'Fecha de examen',key:'Plantilla',results:'Resultados'}[key]||key});
    if(isArchived(record))events.push({date:record.closure.publishedOn,title:'Cierre documentado'});
    return events.filter(e=>/^\\d{4}-\\d{2}-\\d{2}$/.test(e.date)).sort((a,b)=>b.date.localeCompare(a.date));
  }
  function lastChange(record){return verifiedEvents(record)[0]||{date:record.publishedOn,title:'Convocatoria publicada'};}
  function sorting(a,b){
    const mode=fields.sort?.value||'news';
    if(mode==='published')return b.publishedOn.localeCompare(a.publishedOn)||a.id.localeCompare(b.id);
    if(mode==='modified')return lastChange(b).date.localeCompare(lastChange(a).date)||a.id.localeCompare(b.id);
    if(mode==='deadline')return (a.applicationsEndOn||'9999-12-31').localeCompare(b.applicationsEndOn||'9999-12-31')||a.id.localeCompare(b.id);
    const x=lastChange(a),y=lastChange(b);
    const xNew=Object.values(a.milestones||{}).filter(m=>m?.publishedOn&&safeUrl(m.url)).length+(a.announcements||[]).filter(e=>e.date&&safeUrl(e.url)).length+(isArchived(a)?1:0);
    const yNew=Object.values(b.milestones||{}).filter(m=>m?.publishedOn&&safeUrl(m.url)).length+(b.announcements||[]).filter(e=>e.date&&safeUrl(e.url)).length+(isArchived(b)?1:0);
    return y.date.localeCompare(x.date)||yNew-xNew||a.id.localeCompare(b.id);
  }
  function renderRow(record){
    const article=document.createElement('article');article.className='opportunity-row';article.id=record.id;
    const places=addText('div','opportunity-places','');places.append(addText('strong','',record.places==null?'Bolsa':record.places),addText('span','',record.places==null?'sin nº fijo':'plazas'));
    const content=addText('div','opportunity-details','');content.append(addText('p','eyebrow',record.organism),addText('h3','',record.title));
    const bases=officialLink(/\.pdf(?:[?#]|$)/i.test(record.url)?'↗ Abrir las bases de la convocatoria':'↗ Consultar bases y documentos oficiales',record.url);bases.className='opportunity-bases';content.append(bases,addText('p','opportunity-offer',`${labels[record.processType]} · ${record.turn} · ${record.offer}`));
    const state=effectiveState(record);
    content.append(addText('span','opportunity-state'+(!isArchived(record)&&state==='open'?' state-open':''),isArchived(record)?'Archivada · cierre verificado':state==='review'?'Estado pendiente de actualizar':stateLabels[state]||'Publicada'));
    if(record.requirements)content.append(addText('p','opportunity-requirements',record.requirements));
    content.append(addText('p','opportunity-period',`${record.officialBulletin||'BOE'}: ${dateLabel(record.boePublishedOn)}. ${record.period}`),addText('p','opportunity-review',`Revisado el ${dateLabel(record.reviewedOn)}.`));
    if(!isArchived(record)&&reviewAge(record)>7)content.append(addText('p','opportunity-stale','Revisión pendiente: confirma las novedades en el expediente oficial.'));
    const links=addText('div','opportunity-links','');links.append(officialLink('Ver convocatoria',record.url),officialLink('Consultar '+(record.officialBulletin||'BOE'),record.boeUrl));
    const follow=addText('button','opportunity-follow',saved.has(record.id)?'✦ Siguiendo':'✧ Seguir');follow.type='button';follow.setAttribute('aria-pressed',String(saved.has(record.id)));follow.setAttribute('aria-label',`${saved.has(record.id)?'Quitar de mis procesos':'Guardar'} ${record.title} de ${record.organism}`);follow.addEventListener('click',()=>toggleSaved(record.id));
    const details=addText('button','opportunity-expand',expanded.has(record.id)?'Ocultar seguimiento':'Ver seguimiento');details.type='button';details.setAttribute('aria-expanded',String(expanded.has(record.id)));details.setAttribute('aria-controls',`tracking-${record.id}`);
    const panel=trackingPanel(record,state);
    details.addEventListener('click',()=>{const open=!expanded.has(record.id);open?expanded.add(record.id):expanded.delete(record.id);panel.hidden=!open;details.setAttribute('aria-expanded',String(open));details.textContent=open?'Ocultar seguimiento':'Ver seguimiento';});
    links.append(follow,details);
    const meta=addText('div','compact-meta',record.location+' · '+labels[record.processType]+(record.places!=null?' · '+record.places+' plazas':''));
    const status=addText('div','compact-state',isArchived(record)?'Archivada':state==='review'?'Plazo por verificar':stateLabels[state]||'Publicada');
    status.append(addText('small','', 'Publicado: '+dateLabel(record.publishedOn)),addText('small','',record.applicationsEndOn?'Fin de plazo: '+dateLabel(record.applicationsEndOn):'Fin de plazo: consultar bases'));
    const change=lastChange(record),news=addText('div','compact-news',change.title);news.append(addText('small','',dateLabel(change.date)));
    const title=content.querySelector('h3');if(title){const button=addText('button','compact-title',record.title);button.type='button';button.setAttribute('aria-expanded',String(expanded.has(record.id)));button.setAttribute('aria-controls',`tracking-${record.id}`);button.addEventListener('click',()=>details.click());title.replaceChildren(button);}
    article.append(places,content,meta,status,news,links,panel);return article;
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
    visible.slice(0,pageSize).forEach(record=>results.append(renderRow(record)));if(more){more.hidden=visible.length<=pageSize;more.textContent='Cargar más convocatorias ('+Math.max(0,visible.length-pageSize)+' restantes)';}
  }
  document.querySelectorAll('[data-phase]').forEach(button=>button.addEventListener('click',()=>{if(!ready)return;phase=button.dataset.phase;render();if(button.classList.contains('stage-select'))document.getElementById('convocatorias').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}));
  savedFilter.addEventListener('click',()=>{onlySaved=!onlySaved;render();});
  archiveControls.forEach(button=>button.addEventListener('click',()=>{archiveView=button.dataset.archive==='archived';render();}));
  Object.values(fields).filter(Boolean).forEach(el=>el.addEventListener('input',()=>{pageSize=25;render();}));document.getElementById('opportunity-more')?.addEventListener('click',()=>{pageSize+=25;render();});
  async function load(){try{await window.OpoAccountReady;try{saved=new Set(JSON.parse(localStorage.getItem(storageKey)||'[]'));}catch{saved=new Set();}const data=await window.OpoData.loadOpportunities();const seen=new Set();opportunities=data.opportunities.filter(o=>{if(!o.id||seen.has(o.id)||(o.publicationStatus!=null&&!['published','approved','publicada','validada'].includes(String(o.publicationStatus).toLowerCase()))||o.approved===false||!o.title||!(Number.isInteger(o.places)&&o.places>=1||o.processType==='pool'&&o.places==null)||!stateLabels[o.state]||!labels[o.processType]||o.processType==='all'||!/^\d{4}-\d{2}-\d{2}$/.test(o.publishedOn)||!/^\d{4}-\d{2}-\d{2}$/.test(o.boePublishedOn)||!/^\d{4}-\d{2}-\d{2}$/.test(o.reviewedOn))return false;try{if(new URL(o.url).protocol!=='https:'||new URL(o.boeUrl).protocol!=='https:')return false;}catch{return false;}seen.add(o.id);return true;});if(opportunities.some(o=>o.id===requestedPhase)){onlySaved=false;archiveView=isArchived(opportunities.find(o=>o.id===requestedPhase));}ready=true;
    const towns=[...new Set(opportunities.map(o=>o.location).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));const municipal=fields.municipality;if(municipal)for(const town of towns){const option=document.createElement('option');option.value=town;option.textContent=town;municipal.append(option);}
    revision.textContent=`Selección publicada (última revisión de la base: ${dateLabel(data.reviewedOn)}). Las fechas de consulta no se consideran novedades.${data.notice?' '+data.notice:''}`;render();if(opportunities.some(o=>o.id===requestedPhase))document.getElementById(requestedPhase)?.scrollIntoView({block:'start'});}catch{summary.textContent='No se han podido cargar las convocatorias.';results.replaceChildren(addText('p','opportunity-empty','Recarga la página para volver a intentarlo.'));}}
  load();
})();
