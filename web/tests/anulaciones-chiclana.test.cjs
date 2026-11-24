'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const today='2026-11-17';
const source=file=>fs.readFileSync(path.join(root,file),'utf8');
// El cálculo de anulaciones vive en el motor compartido; listado y ficha delegan en él.
function loadEngine(){
  const sandbox={window:{},console,URL,Intl,Date,Number,String,Object,Array,Set,Map,RegExp,Error,
    AbortSignal:{timeout:()=>{}},fetch:async()=>{throw Error('fetch no disponible en pruebas');}};
  vm.runInNewContext(source('supabase-data.js'),sandbox);
  return sandbox.window.OpoData;
}
const Opo=loadEngine();
const check=record=>Opo.verifiedCancellation(record,today);
const origin='https://www.bopcadiz.es/.boletines_pdf/2026/11_noviembre/BOP220_16-11-26.pdf';
const close={reason:'cancelled',text:'Anulado y dejado sin efectos el anuncio 366.841 del BOP 217. Se aprobarán nuevas bases.',publishedOn:'2026-11-16',verifiedOn:'2026-11-17',url:origin};
const variants=[
  ['OPO-2026-9db0eed3','9 plazas de Trabajo Social A2'],
  ['OPO-2026-036c5483','2 plazas de Arquitectura A1'],
  ['OPO-2026-217b5225','1 plaza de Psicología A1'],
  ['OPO-2026-91716214','1 plaza de Veterinaria A1'],
];
const record=(id,title,override={})=>({
  id,title,published:true,publicationStatus:'aprobado',
  closure:{...close},events:[{id:'EVT-'+id+'-INC',type:'incidencia',title:'Anulado el anuncio de bases · '+title,officialPublishedOn:'2026-11-16',url:origin,approved:true,publicado:true,publicationStatus:'approved'}],
  ...override
});
test('cuatro anulaciones confirmadas',()=>{
  for(const [id,title] of variants)assert.equal(check(record(id,title))?.reason,'cancelled');
});
test('no basta con tener un campo closure',()=>{
  const [id,title]=variants[0];
  assert.equal(check(record(id,title,{events:[]})),null);
  assert.equal(check(record(id,title,{publicationStatus:'pendiente'})),null);
  assert.equal(check(record(id,title,{published:false})),null);
});
test('evento no aprobado / no publicado / retirado / URL o fecha diferentes',()=>{
  const [id,title]=variants[0],r=record(id,title);
  const base=r.events[0];
  for(const e of [{...base,approved:false},{...base,publicado:false},{...base,retirado_en:today},
    {...base,url:'https://otro-ejemplo.org/'},{...base,officialPublishedOn:'2026-11-15'}]) {
    assert.equal(check({...r,events:[e]}),null);
  }
});
test('no confundir plazas con bases anuladas',()=>{
  const [id,title]=variants[0];
  assert.equal(check(record(id,title,{closure:{...close,reason:'completed'}})),null);
});
test('anulación futura no se anuncia prematuramente',()=>{
  const [id,title]=variants[0];
  assert.equal(check(record(id,title,{closure:{...close,publishedOn:'2026-12-01'}})),null);
});
test('el listado muestra la advertencia y la fuente oficial',()=>{
  const list=source('convocatorias.js');
  assert.match(list,/Consultar anulación publicada en el BOP de Cádiz/);
  assert.match(list,/window\.OpoData\.verifiedCancellation\(/);
  const html=source('convocatorias.html');
  assert.match(html,/<option value="cancelled">Suspendida o bases anuladas<\/option>/);
  assert.match(source('supabase-data.js'),/Inscripción: sin plazo vigente derivado de unas bases anuladas o suspendidas/);
});
test('la ficha no ofrece presentar solicitud con bases anuladas',()=>{
  const detail=source('convocatoria.js');
  assert.match(detail,/Aviso oficial: bases anuladas/);
  assert.match(detail,/cancellation\?\[\['Anulación oficial de las bases'/);
  assert.match(detail,/state==='open'\?\[\['Presentar solicitud en la sede oficial'/);
  assert.match(detail,/window\.OpoData\.verifiedCancellation\(/);
});
