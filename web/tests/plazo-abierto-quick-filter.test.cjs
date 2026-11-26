'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'convocatorias.html'),'utf8');
const list=fs.readFileSync(path.join(root,'convocatorias.js'),'utf8');
const shared=fs.readFileSync(path.join(root,'supabase-data.js'),'utf8');
const sandbox={window:{},console,URL,Intl,Date,Number,String,Object,Array,Set,Map,RegExp,Error,
  AbortSignal:{timeout:()=>{}},fetch:async()=>{throw Error('offline test');}};
vm.runInNewContext(shared,sandbox);
const {applicationsOpenNow,deriveState}=sandbox.window.OpoData;
const TODAY='2026-11-26';
const base={state:'open',applicationStatus:'open',applicationsStartOn:'2026-11-20',applicationsEndOn:'2026-11-30',events:[],milestones:{}};
const open=changes=>({...base,...changes});

test('muestra solicitudes abiertas hoy según fechas verificadas',()=>{
  assert.equal(applicationsOpenNow(open({}),TODAY),true);
  assert.equal(applicationsOpenNow(open({state:'published'}),TODAY),true);
});
test('incluye el primer y último día del plazo',()=>{
  assert.equal(applicationsOpenNow(open({applicationsStartOn:TODAY,applicationsEndOn:TODAY}),TODAY),true);
});
test('excluye plazos todavía no iniciados, vencidos o sin fechas completas',()=>{
  assert.equal(applicationsOpenNow(open({applicationsStartOn:'2026-11-27'}),TODAY),false);
  assert.equal(applicationsOpenNow(open({applicationsEndOn:'2026-11-25'}),TODAY),false);
  assert.equal(applicationsOpenNow(open({applicationsStartOn:null}),TODAY),false);
  assert.equal(applicationsOpenNow(open({applicationsEndOn:null}),TODAY),false);
  assert.equal(applicationsOpenNow(open({applicationsStartOn:'fecha desconocida'}),TODAY),false);
});
test('no trata listas, anulaciones ni revisiones pendientes como abiertas',()=>{
  for(const record of [
    open({state:'lists'}),
    open({state:'cancelled'}),
    open({state:'finished'}),
    open({reviewBefore:'2026-11-25'})
  ])assert.equal(applicationsOpenNow(record,TODAY),false);
  assert.equal(deriveState(open({state:'lists'}),TODAY),'lists');
});
test('botón visible y accesible, independiente de los filtros avanzados ocultos',()=>{
  assert.match(html,/id="opportunity-open-only"[^>]*aria-controls="opportunity-results"[^>]*aria-pressed="false"/);
  assert.match(html,/id="opportunity-open-count"/);
  assert.ok(html.indexOf('id="opportunity-open-only"')<html.indexOf('class="opportunity-archive-controls"'));
  assert.match(list,/radarFields\.hidden=true/);
});
test('botón y selector comparten el filtro por plazo, sin duplicar un segundo criterio',()=>{
  assert.match(list,/openOnlyButton\?\.addEventListener\('click'/);
  assert.match(list,/fields\.deadline\.value=activate\?'open':'all'/);
  assert.match(list,/openOnlyButton\?\.setAttribute\('aria-pressed',String\(openFilter\)\)/);
  assert.match(list,/window\.OpoData\.applicationsOpenNow\(record,today\(\)\)/);
  assert.match(list,/archiveView=false/);
  assert.match(list,/fields\.status\.value=''/);
  assert.match(list,/Sin plazos abiertos confirmados en esta selección/);
});
