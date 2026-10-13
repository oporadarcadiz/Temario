'use strict';
(async()=>{
  await window.OpoAccountReady;
  const account=window.OpoAccount.get();if(!account)return;
  const $=id=>document.getElementById(id),savedKey='oporadar:radar:saved:v1',profileKey='oporadar:profile:v1';
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return fallback;}};
  const profile=()=>read(profileKey,{});
  const saved=()=>{const value=read(savedKey,[]);return Array.isArray(value)?value:[];};
  const text=(tag,value,className='')=>{const e=document.createElement(tag);e.textContent=value;e.className=className;return e;};
  const link=(title,url)=>{const a=text('a',title);a.href=url;if(url.startsWith('https:')){a.target='_blank';a.rel='noopener noreferrer';}return a;};
  const button=(title,action)=>{const b=text('button',title);b.type='button';b.onclick=action;return b;};
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const p=profile();$('profile-level').value=p.level||'';$('profile-town').value=p.town||'';$('profile-short').checked=!!p.short;
  $('profile-form').addEventListener('submit',async e=>{e.preventDefault();localStorage.setItem(profileKey,JSON.stringify({...profile(),level:$('profile-level').value,town:$('profile-town').value,short:$('profile-short').checked}));await window.OpoAccount.save();});
  $('import-local').onclick=()=>window.OpoAccount.importLocal();$('retry-cloud').onclick=()=>window.OpoAccount.save();
  $('export-account').onclick=()=>{try{const data={format:'oporadar-account-v1',exportedAt:new Date().toISOString(),email:account.email,data:{}};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(/^oporadar:(radar:saved:v1|profile:v1|study-tools:v1|(?:aux|sub|auxiliar|subalterno):(?:progress|history|session):v1)$/.test(key))data.data[key]=read(key,null);}const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='oporadar-mis-datos.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('export-status').textContent='Copia descargada con los datos disponibles en este navegador, incluidos cambios pendientes de guardar.';}catch{$('export-status').textContent='No se ha podido descargar la copia. Reintenta.';}};
  $('delete-account').onclick=async()=>{if(!confirm('¿Borrar tus preferencias, progreso y procesos de OpoRadarCádiz?'))return;try{await window.OpoAccount.deleteAccountData();$('delete-status').textContent='Datos borrados. Tu cuenta de acceso se mantiene hasta que cierres sesión.';}catch(e){$('delete-status').textContent=e.message;}};
  let records=[];
  function render(){
    const ids=saved(),followed=records.filter(o=>ids.includes(o.id)),query=fold($('account-search').value),visible=followed.filter(o=>fold(o.title+' '+o.organism).includes(query));
    $('account-saved').replaceChildren();$('account-saved-count').textContent=`${visible.length} de ${followed.length} convocatorias seguidas`;
    for(const o of visible){const card=text('article','','account-process');card.append(text('p',o.organism,'eyebrow'),text('h3',o.title),text('p',`${o.places} plazas · Última revisión: ${o.reviewedOn}`),link('Abrir ficha y seguimiento','/convocatorias.html#'+encodeURIComponent(o.id)),button('Dejar de seguir',()=>{localStorage.setItem(savedKey,JSON.stringify(saved().filter(id=>id!==o.id)));render();}));$('account-saved').append(card);}
    if(!visible.length)$('account-saved').append(text('p',followed.length?'No hay coincidencias. Prueba otro puesto u organismo.':'Todavía no sigues ninguna convocatoria. Puedes elegirlas en Convocatorias.'));
    const readIds=new Set(profile().newsRead||[]),events=followed.flatMap(o=>window.OpoRadarEvents.collect(o)).sort((a,b)=>b.date.localeCompare(a.date)),unread=events.filter(e=>!readIds.has(e.id)),shown=$('account-unread').checked?unread:events;
    $('account-news-count').textContent=`${unread.length} documentos sin leer · ${events.length} documentos disponibles`;$('account-news').replaceChildren();
    const mark=ids=>{localStorage.setItem(profileKey,JSON.stringify({...profile(),newsRead:[...new Set([...readIds,...ids])].slice(-1000)}));render();};
    for(const e of shown){const card=text('article','','account-process');card.append(text('p',e.organism,'eyebrow'),text('h3',e.opportunityTitle),link(e.date+' · '+e.title,e.url));if(!readIds.has(e.id))card.append(button('Marcar como leído',()=>mark([e.id])));else card.append(text('span','Leído','account-read'));$('account-news').append(card);}
    if(!shown.length)$('account-news').append(text('p',followed.length?'No hay documentos sin leer en esta selección.':'Sigue una convocatoria para consultar aquí sus documentos.'));
    if(unread.length)$('account-news').append(button('Marcar todos como leídos',()=>mark(unread.map(e=>e.id))));
  }
  $('account-search').oninput=render;$('account-unread').onchange=render;
  try{const data=await window.OpoData.loadOpportunities();records=data.opportunities;render();}catch{$('account-saved').textContent='No se han podido cargar las convocatorias. Tus favoritos siguen guardados.';$('account-news').textContent='No se han podido cargar los documentos.';$('account-news').append(button('Reintentar',()=>location.reload()));}
})();
