'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const today=()=>'2026-11-17';
const safeUrl=s=>{try{return new URL(s).protocol==='https:'}catch{return false}};
const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'');
const source='https://www.bopcadiz.es/.boletines_pdf/2026/11_noviembre/BOP220_16-11-26.pdf';
const close={reason:'cancelled',text:'Anulado y dejado sin efectos el anuncio 366.841 del BOP 217. Se aprobarán nuevas bases.',publishedOn:'2026-11-16',verifiedOn:'2026-11-17',url:source};
const variants=[
 ['OPO-2026-9db0eed3','9 plazas de Trabajo Social A2'],
 ['OPO-2026-036c5483','2 plazas de Arquitectura A1'],
 ['OPO-2026-217b5225','1 plaza de Psicología A1'],
 ['OPO-2026-91716214','1 plaza de Veterinaria A1'],
];
const record=(id,title,override={})=>({
 id,title,published:true,publicationStatus:'aprobado',
 closure:{...close},events:[{id:'EVT-'+id+'-INC',type:'incidencia',title:'Anulado el anuncio de bases · '+title,officialPublishedOn:'2026-11-16',url:source,approved:true,publicado:true,publicationStatus:'approved'}],
 ...override
});
function predicateFrom(file,next){
 const code=fs.readFileSync(path.join(root,file),'utf8');
 const start=code.indexOf('function verifiedCancellation(record){');
 assert.notEqual(start,-1,'El archivo debe contener la comprobación de anulación');
 const end=code.indexOf(next,start);
 assert.ok(end>start,'La función de anulación debe terminar antes de '+next);
 const fn=code.slice(start,end).trim();
 return vm.runInNewContext('('+fn+')',{today,safeUrl,validDate,Intl,Date,URL});
}
const predicates=[
 ['convocatorias.js',predicateFrom('convocatorias.js','function effectiveState')],
 ['convocatoria.js',predicateFrom('convocatoria.js','function isArchived')]
];
for(const [page,check] of predicates){
 test(page+': cuatro anulaciones confirmadas',()=>{
  for(const [id,title] of variants)assert.equal(check(record(id,title))?.reason,'cancelled');
 });
 test(page+': no basta con tener un campo closure',()=>{
  const [id,title]=variants[0];
  assert.equal(check(record(id,title,{events:[]})),null);
  assert.equal(check(record(id,title,{publicationStatus:'pendiente'})),null);
  assert.equal(check(record(id,title,{published:false})),null);
 });
 test(page+': evento no aprobado / no publicado / URL diferente',()=>{
  const [id,title]=variants[0],r=record(id,title);
  const base=r.events[0];
  for(const e of [{...base,approved:false},{...base,publicado:false},{...base,url:'https://otro-ejemplo.org/'},{...base,officialPublishedOn:'2026-11-15'}]){
   assert.equal(check({...r,events:[e]}),null);
  }
 });
 test(page+': no confundir plazas con bases anuladas',()=>{
  const [id,title]=variants[0];
  assert.equal(check(record(id,title,{closure:{...close,reason:'completed'}})),null);
 });
 test(page+': anulación futura no se anuncia prematuramente',()=>{
  const [id,title]=variants[0];
  assert.equal(check(record(id,title,{closure:{...close,publishedOn:'2026-12-01'}})),null);
 });
}
test('el listado muestra la advertencia y la fuente oficial',()=>{
 const s=fs.readFileSync(path.join(root,'convocatorias.js'),'utf8');
 assert.match(s,/Bases anuladas · sin plazo de solicitudes/);
 assert.match(s,/Consultar anulación publicada en el BOP de Cádiz/);
 const html=fs.readFileSync(path.join(root,'convocatorias.html'),'utf8');
 assert.match(html,/<option value="cancelled">Bases anuladas<\/option>/);
});
test('la ficha no ofrece presentar solicitud con bases anuladas',()=>{
 const s=fs.readFileSync(path.join(root,'convocatoria.js'),'utf8');
 assert.match(s,/Aviso oficial: bases anuladas/);
 assert.match(s,/cancellation\?\[\['Anulación oficial de las bases'/);
 assert.match(s,/\['Presentar solicitud'/);
});
