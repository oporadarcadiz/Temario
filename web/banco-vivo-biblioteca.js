'use strict';
// Banco Vivo: los objetos privados NUNCA viven en este archivo público.
// Los datos completos se recuperan sólo después del JWT OTP y de RLS en Supabase.
document.addEventListener('DOMContentLoaded',()=>{
 const $=id=>document.getElementById(id);
 const status=$('library-status'),privateStatus=$('private-status');
 const catalogURL='https://jtyjdrrxmuppulbekfai.supabase.co/functions/v1/banco-vivo-catalogo';
 let facets=[],offset=0,busy=false;
 const search=$('bv-search'),route=$('bv-route'),year=$('bv-year'),mode=$('bv-mode');
 function text(tag,value,className){
  const node=document.createElement(tag);node.textContent=String(value??'');
  if(className)node.className=className;return node;
 }
 function formatCount(n){return new Intl.NumberFormat('es-ES').format(n);}
 function validFacet(x){return x&&typeof x.organism==='string'&&typeof x.exam==='string'
  &&Number.isSafeInteger(x.questions)&&x.questions>0
  &&['test','documental'].includes(x.publication_mode);}
 function filtered(){
  const term=search.value.trim().toLocaleLowerCase('es');
  return facets.filter(f=>(!route.value||route.value===f.route)
   &&(!year.value||year.value===String(f.exam_year))
   &&(!mode.value||mode.value===f.publication_mode)
   &&(!term||[f.organism,f.exam,f.subject].some(v=>String(v||'').toLocaleLowerCase('es').includes(term))));
 }
 function updateYears(){
  const years=[...new Set(facets.map(f=>f.exam_year).filter(v=>Number.isInteger(v)))].sort((a,b)=>b-a);
  for(const y of years){const opt=document.createElement('option');opt.value=String(y);opt.textContent=String(y);year.append(opt);}
 }
 function showCatalog(){
  const list=$('bv-list');list.replaceChildren();
  const items=filtered();
  if(!items.length){
    const p=text('p',facets.length?'No hay resultados para estos filtros.':'Disponible en breve: aún no hay preguntas publicadas.','bv-empty');list.append(p);return;
  }
  for(const f of items){
   const card=text('article','','bv-item');
   card.append(text('h3',f.organism||'Organismo sin definir'));
   card.append(text('p',f.exam||'Oposición','bv-meta'));
   card.append(text('p',[f.exam_year||'Año pendiente',f.subject||'Materia pendiente'].join(' · '),'bv-meta'));
   card.append(text('p',(f.publication_mode==='test'?'Test autocorregible':'Consulta histórica')+' · '+formatCount(f.questions)+' pregunta(s)'));
   list.append(card);
  }
 }
 for(const input of [search,route,year,mode])input.addEventListener('input',showCatalog);
 (async()=>{
  try{
   const res=await fetch(catalogURL,{method:'GET',cache:'no-store',headers:{accept:'application/json'}});
   if(!res.ok)throw Error('no catalogo');
   const data=await res.json();
   if(data?.source!=='published_questions'||!Number.isSafeInteger(data.count)||data.count<0)throw Error('recuento inválido');
   facets=Array.isArray(data.facets)?data.facets.filter(validFacet):[];
   if(data.facets_ready!==true)facets=[];
   updateYears();showCatalog();
   status.textContent=data.count===0?'0 preguntas publicadas. La biblioteca queda preparada y se ampliará con cada publicación autorizada.':
    formatCount(data.count)+' preguntas publicadas. '+(data.facets_ready===true?'Explora organismos, oposiciones y materias.':'Los filtros estarán disponibles en breve.');
  }catch{
   facets=[];showCatalog();
   status.textContent='Biblioteca en preparación. No mostramos preguntas ni cifras sin una consulta válida al servidor.';
  }
 })();
 function safeUrl(raw){try{const u=new URL(raw);return u.protocol==='https:'?u.href:null;}catch{return null;}}
 function questionCard(q){
  const card=text('article','','bv-item');
  card.append(text('h3',q.body||'Pregunta sin texto'));
  card.append(text('p',[q.organism,q.exam,q.exam_year,q.subject].filter(Boolean).join(' · '),'bv-meta'));
  const src=safeUrl(q.source_url);
  if(src){const a=text('a','Consultar fuente oficial');a.href=src;a.target='_blank';a.rel='noopener noreferrer';card.append(a);}
  const options=Array.isArray(q.options)?q.options:[];
  const testReady=q.publication_mode==='test'
   &&['VERIFICADA','VERIFICADA_RESERVA'].includes(q.verification_status)
   &&Number.isInteger(q.correct_index)&&q.correct_index>=0&&q.correct_index<options.length;
  if(!testReady){
   card.append(text('p','Consulta documental · respuesta oficial todavía no disponible para autocorrección.','bv-note'));
   return card;
  }
  let selected=null;
  const feedback=text('div','Selecciona una opción y pulsa Corregir.','bv-answer');feedback.setAttribute('role','status');
  const buttons=[];
  options.forEach((option,index)=>{
   const content=typeof option==='string'?option:String(option?.text??option?.value??'Opción '+(index+1));
   const b=text('button',String.fromCharCode(65+index)+'. '+content,'bv-choice');
   b.type='button';b.setAttribute('aria-pressed','false');
   b.addEventListener('click',()=>{selected=index;buttons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));feedback.textContent='Opción seleccionada.';});
   buttons.push(b);card.append(b);
  });
  const correct=text('button','Corregir respuesta','bv-btn');correct.type='button';
  correct.addEventListener('click',()=>{
   if(selected===null){feedback.textContent='Selecciona primero una respuesta.';return;}
   const answer=String.fromCharCode(65+q.correct_index);
   feedback.textContent=selected===q.correct_index?'Correcto. Respuesta oficial: '+answer+'.':
    'Respuesta incorrecta. La clave oficial contrastada es '+answer+'.';
  });
  card.append(correct,feedback);return card;
 }
 async function loadPrivate(reset){
  if(busy)return;
  const auth=window.OpoPremium;
  if(!auth?.client){privateStatus.textContent='Acceso por código todavía no configurado.';return;}
  busy=true;$('bv-load-private').disabled=true;$('bv-more').disabled=true;
  if(reset){offset=0;$('bv-private-list').replaceChildren();$('bv-more').hidden=true;}
  try{
   const user=await auth.user();
   if(!user||!(await auth.bankRight())){
    privateStatus.textContent='Sin compra digital verificada o sin sesión OTP. Identifícate y comprueba tu permiso de Banco Vivo.';
    return;
   }
   let query=auth.client.from('published_questions')
    .select('id,body,options,correct_index,organism,exam,exam_year,subject,route,publication_mode,verification_status,source_url')
    .order('created_at',{ascending:false});
   if(route.value)query=query.eq('route',route.value);
   if(year.value)query=query.eq('exam_year',Number(year.value));
   if(mode.value)query=query.eq('publication_mode',mode.value);
   const {data,error}=await query.range(offset,offset+19);
   if(error)throw Error('No se pudo consultar el contenido autorizado');
   const items=Array.isArray(data)?data:[];
   for(const item of items)$('bv-private-list').append(questionCard(item));
   offset+=items.length;
   $('bv-more').hidden=items.length<20;
   privateStatus.textContent=offset===0?'Todavía no hay preguntas publicadas disponibles para tu permiso.':
    formatCount(offset)+' preguntas cargadas. Las nuevas publicaciones se incorporan automáticamente a tu biblioteca.';
  }catch{privateStatus.textContent='No se han podido recuperar preguntas: permiso, catálogo o sesión pendiente de activación.';}
  finally{busy=false;$('bv-load-private').disabled=false;$('bv-more').disabled=false;}
 }
 $('bv-load-private').addEventListener('click',()=>loadPrivate(true));
 $('bv-more').addEventListener('click',()=>loadPrivate(false));
});
