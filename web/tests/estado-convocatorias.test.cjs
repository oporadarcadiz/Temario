'use strict';
// Pruebas del motor único de estados. Ejecutar:
//   node web/tests/estado-convocatorias.test.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const file=path.join(__dirname,'..','supabase-data.js');
const sandbox={window:{},console,URL,Intl,Date,Number,String,Object,Array,Set,Map,RegExp,Error,
  AbortSignal:{timeout:()=>{}},fetch:async()=>{throw Error('fetch no disponible en pruebas');}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});
const Opo=sandbox.window.OpoData;
const DATE='2026-11-24';
const BASE='https://www.bopcadiz.es/bases.pdf';
const BOE='https://www.boe.es/boe.pdf';
const DOC='https://www.bopcadiz.es/lista.pdf';
const FINAL='https://www.bopcadiz.es/lista-definitiva.pdf';
const EXAM='https://www.bopcadiz.es/examen.pdf';
const KEY='https://www.bopcadiz.es/plantilla.pdf';
const RESULTS='https://www.bopcadiz.es/resultados.pdf';
const CANCEL='https://www.bopcadiz.es/anulacion.pdf';

const base=(over={})=>({id:'OPO-2026-TEST',state:'open',processType:'opposition',published:true,
  publicationStatus:'aprobado',title:'Puesto de prueba · 1 plaza',organism:'Ayuntamiento de Ubrique',
  places:1,publishedOn:'2026-09-09',boePublishedOn:'2026-09-28',reviewedOn:DATE,
  applicationsStartOn:'2026-09-20',applicationsEndOn:'2026-11-30',url:BASE,boeUrl:BOE,
  applicationStatus:'open',events:[],milestones:{},...over});
const event=(type,title,url,date='2026-11-23',id)=>({id,type,title,officialPublishedOn:date,url,
  approved:true,publicado:true,publicationStatus:'approved'});
const milestone=(text,url=DOC,date='2026-11-23')=>({text,url,publishedOn:date,approved:true,
  publicado:true,publicationStatus:'approved'});
const stateOf=record=>Opo.deriveState(record,DATE);
const cases=[];
const check=(name,fn)=>{fn();cases.push(name);};

check('etiquetas principales exactas',()=>{
  assert.equal(JSON.stringify(Opo.STATE_LABELS),JSON.stringify({
    published:'Convocatoria publicada',open:'Plazo abierto',closed:'Plazo cerrado',
    review:'Plazo pendiente de verificar',lists:'Listas provisionales publicadas',
    lists_final:'Listas definitivas publicadas',exam:'Fecha de examen publicada',
    key:'Examen realizado / plantilla publicada',results:'Resultados publicados',
    finished:'Proceso finalizado',cancelled:'Suspendida o bases anuladas'}));
});

check('abierto → cerrado conserva la misma ficha',()=>{
  const before=base();
  const after=base({applicationsEndOn:'2026-11-20',applicationStatus:'closed'});
  assert.equal(stateOf(before),'open');
  assert.equal(stateOf(after),'closed');
  assert.equal(after.id,before.id);
});

check('cerrado → listas provisionales',()=>{
  const closed=base({state:'closed',applicationStatus:'closed'});
  const lists=base({state:'closed',applicationStatus:'closed',
    events:[event('lista_provisional','Lista provisional de admitidos y excluidos',DOC,'2026-11-23','EVT-37C8A41C')],
    milestones:{lists:milestone('Lista provisional de admitidos y excluidos. Diez días hábiles de subsanación.')}});
  assert.equal(stateOf(closed),'closed');
  assert.equal(stateOf(lists),'lists');
  assert.equal(Opo.stateLabel(stateOf(lists)),'Listas provisionales publicadas');
});

check('listas provisionales → listas definitivas',()=>{
  const provisional=base({state:'lists',applicationStatus:'closed',lastEventType:'lista_provisional'});
  const definitive=base({state:'lists',applicationStatus:'closed',
    events:[event('lista_provisional','Lista provisional de admitidos y excluidos',DOC),
      event('lista_definitiva','Lista definitiva de admitidos y excluidos',FINAL,'2026-11-24','EVT-D')],
    milestones:{lists:milestone('Lista provisional')}});
  assert.equal(stateOf(provisional),'lists');
  assert.equal(stateOf(definitive),'lists_final');
  assert.equal(Opo.stateLabel(stateOf(definitive)),'Listas definitivas publicadas');
});

check('listas definitivas → fecha de examen',()=>{
  const record=base({state:'lists_final',applicationStatus:'closed',
    events:[event('lista_definitiva','Lista definitiva de admitidos y excluidos',FINAL),
      event('fecha_examen','Fecha y lugar del examen',EXAM,'2026-11-24','EVT-E')]});
  assert.equal(stateOf(record),'exam');
  assert.equal(Opo.stateLabel(stateOf(record)),'Fecha de examen publicada');
});

check('examen anunciado → examen realizado / plantilla',()=>{
  const record=base({state:'exam',applicationStatus:'closed',
    events:[event('fecha_examen','Fecha y lugar del examen',EXAM),
      event('plantilla','Plantilla de respuestas publicada',KEY,'2026-11-24','EVT-K')]});
  assert.equal(stateOf(record),'key');
  assert.equal(Opo.stateLabel(stateOf(record)),'Examen realizado / plantilla publicada');
});

check('plantilla → resultados publicados',()=>{
  const record=base({state:'key',applicationStatus:'closed',
    events:[event('plantilla','Plantilla de respuestas publicada',KEY),
      event('resultados','Resultados publicados',RESULTS,'2026-11-24','EVT-R')]});
  assert.equal(stateOf(record),'results');
  assert.equal(Opo.stateLabel(stateOf(record)),'Resultados publicados');
});

check('resultados → proceso finalizado',()=>{
  const record=base({state:'results',applicationStatus:'closed',
    events:[event('resultados','Resultados publicados',RESULTS),
      event('resolucion_final','Resolución final del proceso',CANCEL,'2026-11-24','EVT-F')]});
  assert.equal(stateOf(record),'finished');
  assert.equal(Opo.stateLabel(stateOf(record)),'Proceso finalizado');
});

check('bases anuladas → suspendida o bases anuladas',()=>{
  const record=base({state:'published',
    closure:{reason:'cancelled',text:'Anulación de las bases publicada en el BOP',publishedOn:'2026-11-23',
      verifiedOn:'2026-11-23',url:CANCEL},
    events:[event('incidencia','Anulación de bases',CANCEL,'2026-11-23','EVT-A')]});
  assert.equal(stateOf(record),'cancelled');
  assert.equal(Opo.stateLabel(stateOf(record)),'Suspendida o bases anuladas');
});

check('duplicado sin novedad → ningún cambio de estado ni de historial',()=>{
  const dbEvent=event('lista_provisional','Lista provisional de personas admitidas y excluidos',DOC,'2026-11-23','EVT-37C8A41C');
  const legacy=milestone('Lista provisional de personas admitidas y excluidos. Diez días hábiles de subsanación.');
  const record=base({state:'lists',applicationStatus:'closed',events:[dbEvent],milestones:{lists:legacy}});
  const duplicate=base({state:'lists',applicationStatus:'closed',events:[dbEvent,{...dbEvent}],milestones:{lists:legacy}});
  assert.equal(stateOf(record),stateOf(duplicate));
  assert.equal(stateOf(record),'lists');
  const dedup=Opo.dedupeHistory([legacy,dbEvent]);
  assert.equal(dedup.length,1);
  assert.equal(dedup[0].id,'EVT-37C8A41C');
});

check('Ubrique real: una ficha, estado lists, historial sin duplicar y subsanación separada',()=>{
  const row={id:'OPO-2026-36643646',published:true,estado_validacion:'aprobado',reviewed_at:'2026-11-24',
    municipio:'Ubrique',canonical_url:DOC,
    data:{id:'OPO-2026-36643646',state:'lists',processStatus:'provisional_admissions',
      applicationStatus:'closed',lastEventType:'lista_provisional',originalCandidateId:'CAN-20261010-UBR-DIN',
      processType:'opposition',title:'Dinamizador/a de Programas, Proyectos y Eventos · 1 plaza',
      organism:'Ayuntamiento de Ubrique',places:1,publishedOn:'2026-09-09',boePublishedOn:'2026-09-28',
      reviewedOn:'2026-11-24',url:BASE,boeUrl:'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20059',
      source_reference:'BOP Cádiz 225 · 405.377',applicationStatus:'closed',
      period:'Plazo de inscripción cerrado. Lista provisional de admitidos y excluidos publicada en el BOP de 23/11/2026; 10 días hábiles para subsanación en los términos del anuncio y del tablón municipal.',
      milestones:{lists:milestone('Lista provisional de personas admitidas y excluidos. Diez días hábiles de subsanación desde la publicación oficial; comprobar tablón electrónico municipal.')}}};
  const dbEvents=[{evento_id:'EVT-37C8A41C',convocatoria_id:'OPO-2026-36643646',
    tipo_evento:'lista_provisional',titulo_evento:'Lista provisional de personas admitidas y excluidos · Dinamizador/a · Ubrique',
    fecha_oficial:'2026-11-23',url_evento:DOC,resumen:'BOP Cádiz 225 · anuncio 405.377',
    publicado:true,estado_validacion:'aprobado',retirado_en:null}];
  const normalized=Opo.normalize(row,dbEvents);
  assert.equal(normalized.id,'OPO-2026-36643646');
  assert.equal(Opo.deriveState(normalized,DATE),'lists');
  assert.equal(Opo.stateLabel(normalized.derivedState),'Listas provisionales publicadas');
  assert.equal(normalized.events.length,1);
  const info=Opo.periodInfo(normalized,'lists',DATE);
  assert.match(info.inscription,/Inscripción: cerrada/);
  assert.match(info.rectification,/Subsanación: abierta/);
  assert.match(info.rectification,/No consta una fecha final verificada/);
  assert.doesNotMatch(info.rectification,/\d{2}\/\d{2}\/2026/);
  const withoutApplicationStatus=Opo.periodInfo({state:'lists',title:'Listas',organism:'Ubrique'},'lists',DATE);
  assert.match(withoutApplicationStatus.inscription,/Inscripción: cerrada/);
});

console.log('PRUEBAS ESTADO CONVOCATORIAS: OK ('+cases.length+' casos)');
cases.forEach((name,i)=>console.log((i+1)+'. '+name));
