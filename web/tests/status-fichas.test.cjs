'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const files=['convocatorias.js','convocatoria.js'];
const source=file=>fs.readFileSync(path.join(root,file),'utf8');

function loadEngine(){
  const sandbox={window:{},console,URL,Intl,Date,Number,String,Object,Array,Set,Map,RegExp,Error,
    AbortSignal:{timeout:()=>{}},fetch:async()=>{throw Error('fetch no disponible en pruebas');}};
  vm.runInNewContext(source('supabase-data.js'),sandbox);
  return sandbox.window.OpoData;
}
const Opo=loadEngine();
const CANCEL_URL='https://www.bopcadiz.es/anulacion.pdf';
const values=[
  [{state:'open',applicationsEndOn:'2026-10-29'},'closed','fecha vencida'],
  [{state:'closed',applicationsEndOn:'2026-10-29'},'closed','estado ya cerrado'],
  [{state:'open',applicationsEndOn:'2026-12-09',applicationsStartOn:'2026-11-17'},'open','plazo vigente'],
  [{state:'published',applicationsEndOn:'2026-12-09',applicationsStartOn:'2026-11-17'},'open','UCA con inicio y fin oficial'],
  [{state:'open',applicationsStartOn:'2026-11-30',applicationsEndOn:'2026-12-09'},'published','todavía no abierto'],
  [{state:'open',applicationsEndOn:null},'review','sin fecha final'],
  [{state:'open',applicationsEndOn:null,reviewBefore:'2026-10-12'},'review','Cádiz antiguo sin fecha final'],
  [{state:'published',applicationsEndOn:null,applicationsStartOn:'2026-11-17'},'published','publicado sin cierre verificado'],
  [{state:'lists',applicationsEndOn:'2026-06-10'},'lists','listas de admitidos'],
  [{state:'cancelled'},'cancelled','estado anulado heredado'],
  [{state:'open',applicationsEndOn:'2026-12-09',published:true,publicationStatus:'aprobado',
    closure:{reason:'cancelled',text:'Anulación de las bases publicada en el BOP',publishedOn:'2026-11-17',url:CANCEL_URL},
    events:[{type:'incidencia',title:'Anulación de bases',officialPublishedOn:'2026-11-17',url:CANCEL_URL,
      approved:true,publicado:true,publicationStatus:'approved'}]},'cancelled','anulación verificada prevalece'],
];
for(const [record,expected,caseName] of values){
  test('motor compartido / '+caseName,()=>assert.equal(Opo.deriveState(record,'2026-11-17'),expected));
}
for(const file of files){
  test(file+' delega el estado en el motor compartido',()=>{
    const js=source(file);
    assert.match(js,/window\.OpoData\.deriveState\(/);
    assert.match(js,/window\.OpoData\.dedupeHistory\(/);
  });
}
test('las fichas no invitan a presentar solicitudes sin plazo verificado',()=>{
  const detail=source('convocatoria.js'),shared=source('supabase-data.js');
  assert.match(detail,/const periodInfo=window\.OpoData\.periodInfo\(r,state\)/);
  assert.doesNotMatch(detail,/Convocatoria publicada\. Comprueba en la fuente oficial/);
  assert.doesNotMatch(detail,/Bases anuladas · sin plazo de solicitudes/);
  assert.match(detail,/No existe un plazo vigente para solicitar/);
  assert.match(shared,/Inscripción: cerrada/);
  assert.match(shared,/Subsanación: abierta/);
  assert.match(shared,/No consta una fecha final verificada/);
});
test('listado permite filtrar todos los estados principales',()=>{
  const html=source('convocatorias.html');
  assert.match(html,/<option value="closed">Plazo cerrado<\/option>/);
  assert.match(html,/<option value="lists">Listas provisionales publicadas<\/option>/);
  assert.match(html,/<option value="lists_final">Listas definitivas publicadas<\/option>/);
  assert.match(html,/<option value="results">Resultados publicados<\/option>/);
  assert.match(html,/<option value="cancelled">Suspendida o bases anuladas<\/option>/);
});
