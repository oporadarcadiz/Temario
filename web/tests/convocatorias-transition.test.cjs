'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const backup=JSON.parse(fs.readFileSync(path.join(root,'assets/convocatorias.json'),'utf8'));
const items=backup.opportunities;
const ctx={window:{},URL,Date,fetch:async()=>{throw Error('offline')},AbortSignal};
vm.runInNewContext(fs.readFileSync(path.join(root,'supabase-data.js'),'utf8'),ctx);
const normalize=x=>ctx.window.OpoData.normalize(x);
const url=x=>x.slug?'/convocatorias/'+encodeURIComponent(x.slug):'/convocatoria.html?id='+encodeURIComponent(x.id);
test('ocho registros originales del respaldo',()=>assert.equal(items.length,8));
test('IDs únicos y campos mínimos en los ocho',()=>{assert.equal(new Set(items.map(x=>x.id)).size,8);for(const x of items){assert.ok(x.id&&x.title&&x.organism);assert.match(x.url,/^https:\/\//)}});
test('conservar IDs OPO-0001 a OPO-0008',()=>assert.deepEqual(items.map(x=>x.id),Array.from({length:8},(_,i)=>'OPO-'+String(i+1).padStart(4,'0'))));
test('favoritos siguen asociados al ID, no al slug',()=>{const saved=new Set(['OPO-0001','OPO-0003']);const mapped=normalize({...items[0],slug:'auxiliar-opo-0001'});assert.equal(saved.has(mapped.id),true)});
test('sin slug conserva ruta antigua',()=>{for(const x of items)assert.equal(url(x),'/convocatoria.html?id='+x.id)});
test('con slug utiliza ruta permanente',()=>assert.equal(url({id:'OPO-0001',slug:'auxiliar-opo-0001'}),'/convocatorias/auxiliar-opo-0001'));
test('ambas rutas corresponden al mismo expediente y favorito',()=>{const x=normalize({...items[0],slug:'auxiliar-opo-0001'});assert.equal(x.id,'OPO-0001');assert.equal(url({id:x.id}),'/convocatoria.html?id=OPO-0001');assert.equal(url(x),'/convocatorias/auxiliar-opo-0001')});
const base={id:'OPO-0001',title:'Auxiliar',organism:'Ayuntamiento',published:true};
const event=(override={})=>({id:'EVT-OPO-0001-AAA',approved:true,publicationStatus:'approved',publicado:true,officialPublishedOn:'2026-10-10',title:'Lista provisional',url:'https://example.org/anuncio',...override});
test('evento pendiente no visible',()=>assert.equal(normalize({...base,events:[event({approved:false,publicationStatus:'pending',publicado:false})]}).events.length,0));
test('evento aprobado y publicado visible',()=>assert.equal(normalize({...base,events:[event()]}).events.length,1));
test('evento retirado no visible',()=>assert.equal(normalize({...base,events:[event({retirado_en:'2026-10-11T00:00:00Z'})]}).events.length,0));
test('evento repetido se descarta en adaptador',()=>{const result=normalize({...base,events:[event(),event()]});assert.equal(result.events.length,1)});
test('fecha_ultima_consulta no debe convertirse en fecha oficial',()=>{const r=normalize({...base,publishedOn:'2026-09-01',fecha_ultima_consulta:'2026-10-18T12:00:00Z'});assert.equal(r.publishedOn,'2026-09-01');assert.equal(r.events.length,0)});
test('lista y examen conservan convocatoria_id',()=>{const r=normalize({...base,events:[event({type:'lista_provisional'}),event({id:'EVT-OPO-0001-BBB',type:'fecha_examen'})]});assert.equal(r.id,base.id);assert.equal(r.events.length,2)});
test('anuncios antiguos pendientes, rechazados y retirados se excluyen',()=>{const r=normalize({...base,announcements:[{title:'ok',approved:true,publicado:true},{title:'pendiente',publicationStatus:'pending'},{title:'rechazado',approved:false},{title:'retirado',retirado_en:'2026-10-11'}]});assert.equal(r.announcements.length,1)});

test('evento nuevo sin publicado true no es visible',()=>assert.equal(normalize({...base,events:[event({publicado:undefined})]}).events.length,0));
test('evento nuevo sin aprobación explícita no es visible',()=>assert.equal(normalize({...base,events:[event({approved:undefined})]}).events.length,0));

test('un anuncio aprobado pero no publicado nunca aparece',()=>{
 const r=normalize({...base,announcements:[{title:'Pendiente',approved:true,publicado:false,date:'2026-10-23',url:'https://example.org/doc'}]});
 assert.equal(r.announcements.length,0);
});
test('plazas textuales se convierten sin inventar plazas para bolsas',()=>{
 assert.equal(normalize({...base,places:'13'}).places,13);
 assert.equal(normalize({...base,places:null,processType:'pool'}).places,null);
});
test('no confundir comienzo y final del plazo',()=>{
 const r=normalize({id:'OPO-DEMO',fecha_inicio_plazo:'2026-11-01',data:{title:'Prueba',publishedOn:'2026-10-28'}});
 assert.equal(r.applicationsStartOn,'2026-11-01');
 assert.equal(r.applicationsEndOn,undefined);
});
test('evento de Supabase aprobado pero publicado=false no se muestra',()=>{
 const r=normalize({id:'OPO-2026-e54dcb70',published:true,data:{title:'Monitor/a'}},[{evento_id:'EVT-BOP-CADIZ-e54dcb70-348532',convocatoria_id:'OPO-2026-e54dcb70',publicado:false,estado_validacion:'aprobado',fecha_oficial:'2026-10-23',titulo_evento:'Bases',url_evento:'https://example.org/bases'}]);
 assert.equal(r.events.length,0);
});


test('carga Supabase solo expedientes aprobados y publicados, incluso si el backend devuelve filas extra',async()=>{
 const queries=[];
 const rows=[
  {id:'OPO-APROBADO',published:true,estado_validacion:'aprobado',data:{title:'Aprobada',organism:'Organismo'}},
  {id:'OPO-PENDIENTE',published:true,estado_validacion:'pendiente',data:{title:'Pendiente',organism:'Organismo'}},
  {id:'OPO-OCULTO',published:false,estado_validacion:'aprobado',data:{title:'Oculta',organism:'Organismo'}}
 ];
 const previousClient=ctx.window.OpoSupabaseClient,previousReady=ctx.window.OpoAccountReady;
 ctx.window.OpoAccountReady=Promise.resolve();
 ctx.window.OpoSupabaseClient={from(table){const filters=[];queries.push({table,filters});return{
  select(){return this},eq(k,v){filters.push([k,v]);return this},is(){return this},
  order(){return Promise.resolve({data:table==='opportunities'?rows:[],error:null})}
 }}};
 try{
  const result=await ctx.window.OpoData.loadOpportunities();
  assert.equal(result.source,'supabase');
  assert.deepEqual(Array.from(result.opportunities,x=>x.id),['OPO-APROBADO']);
  assert.ok(queries.some(x=>x.table==='opportunities'&&x.filters.some(([k,v])=>k==='estado_validacion'&&v==='aprobado')));
  assert.ok(queries.some(x=>x.table==='opportunity_events'&&x.filters.some(([k,v])=>k==='publicado'&&v===true)));
 }finally{ctx.window.OpoSupabaseClient=previousClient;ctx.window.OpoAccountReady=previousReady}
});

test('respaldo nunca muestra registros expresamente pendientes ni sin publicar',async()=>{
 const previousClient=ctx.window.OpoSupabaseClient,previousFetch=ctx.fetch;
 ctx.window.OpoSupabaseClient=undefined;
 ctx.fetch=async url=>String(url).includes('/assets/convocatorias.json')?{
  ok:true,json:async()=>({opportunities:[
   {id:'F-ANTIGUO',title:'Legado'},
   {id:'F-PENDIENTE',published:true,estado_validacion:'pendiente',title:'No aprobado'},
   {id:'F-OCULTO',published:false,title:'No publicado'}
  ]})
 }:{ok:false,status:503};
 try{
  const result=await ctx.window.OpoData.loadOpportunities();
  assert.equal(result.source,'respaldo');
  assert.deepEqual(Array.from(result.opportunities,x=>x.id),['F-ANTIGUO']);
 }finally{ctx.fetch=previousFetch;ctx.window.OpoSupabaseClient=previousClient}
});
