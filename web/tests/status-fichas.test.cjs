'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const files=['convocatorias.js','convocatoria.js'];
const today=()=>'2026-11-17';
const validDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'');
function extract(file){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  const a=source.indexOf('function effectiveState('),b=source.indexOf(file==='convocatorias.js'?'function isEligibleOpportunity':'function isArchived',a);
  assert.ok(a>=0&&b>a,'Debe existir cálculo de estado para '+file);
  const fn=source.slice(a,b).trim().replace(/(?:\n\s*\/\/[^\n]*)+$/,'').trim();
  return vm.runInNewContext('('+fn+')',{today,validDate,verifiedCancellation:record=>record.testCancellation?{reason:'cancelled'}:null,Intl,Date});
}
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
 [{state:'open',applicationsEndOn:'2026-12-09',testCancellation:true},'cancelled','anulación verificada prevalece'],
];
for(const file of files){
 const status=extract(file);
 for(const [record,expected,caseName] of values){
   test(file+' / '+caseName,()=>assert.equal(status(record),expected));
 }
}
test('las fichas no invitan a presentar solicitudes sin plazo verificado',()=>{
 const detail=fs.readFileSync(path.join(root,'convocatoria.js'),'utf8');
 assert.match(detail,/state==='open'\?\[\['Presentar solicitud en la sede oficial'/);
 assert.match(detail,/No debe considerarse abierto hasta consultar al organismo/);
 assert.match(detail,/Bases anuladas: no existe un plazo vigente/);
});
test('listado permite filtrar plazos finalizados y anulaciones',()=>{
 const html=fs.readFileSync(path.join(root,'convocatorias.html'),'utf8');
 assert.match(html,/<option value="closed">Plazo finalizado<\/option>/);
 assert.match(html,/<option value="cancelled">Bases anuladas<\/option>/);
});
