'use strict';
// Ejecutar desde repo: node --test web/tests/saber-mas-private.test.cjs
// Son pruebas Node con Supabase/Storage simulados; NO sustituyen pruebas HTTP reales.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const edge=fs.readFileSync(path.resolve(__dirname,'../../tema-1/seguridad/edge/tema1-saber-mas/index.ts'),'utf8');
const page=fs.readFileSync(path.resolve(__dirname,'../../tema-1/saber-mas/index.html'),'utf8');
function javascript(s){
 return s.replace(/^import[^\n]*\n/gm,'')
  .replace(/const FILES:\s*Record<string,\s*string>/g,'const FILES')
  .replace(/const headers:\s*Record<string,\s*string>/g,'const headers')
  .replace(/function reply\(status:\s*number,\s*payload:\s*Record<string,\s*unknown>,\s*origin:\s*string\):\s*Response/g,'function reply(status,payload,origin)')
  .replace(/function recentOtpJwt\(jwt:\s*string,\s*userId:\s*string\):\s*boolean/g,'function recentOtpJwt(jwt,userId)')
  .replace(/\(m:\s*\{method\?:\s*string;\s*timestamp\?:\s*number\}\)/g,'(m)')
  .replace(/\(req:\s*Request\)/g,'(req)')
  .replace(/const asins:\s*Record<string,\s*string>/g,'const asins')
  .replace(/let scope:\s*Record<string,\s*unknown>/g,'let scope');
}
function bearer(method='otp',agoSeconds=45){
 const claims={sub:'u1',session_id:'s1',role:'authenticated',
   amr:[{method,timestamp:Math.floor(Date.now()/1000)-agoSeconds}]};
 return 'header.'+Buffer.from(JSON.stringify(claims)).toString('base64url')+'.signature';
}
async function run(opts={}){
 const grants=opts.grants===undefined?[{active:true,expires_at:null,source_claim_id:'c1'}]:opts.grants;
 const claims=opts.claims||[{id:'c1',user_id:'u1',channel:'amazon',status:'verified',
      product_edition:'tema1_individual',asin:'B012345678'}];
 let signedCount=0,handler;
 const env={SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'FAKE',
  TEMA1_KDP_ASIN_INDIVIDUAL:'B012345678',
  TEMA1_KDP_ASIN_GENERAL:'B098765432',
  TEMA1_APPROVED_EDITION_SABER_MAS_SCOPES_JSON:JSON.stringify(
    opts.scopes||{tema1_individual:['1'],general_10_temas:[]}),
  TEMA1_SABER_MAS_CONTENT_READY:opts.ready===false?'false':'true'};
 const admin={
  auth:{getUser:async()=>({data:{user:opts.unknownUser?null:{id:'u1',is_anonymous:false}},error:null})},
  from(table){
   const filters={};
   const builder={
    select(){return builder},
    eq(k,v){filters[k]=v;return builder},
    then(resolve,reject){return Promise.resolve({data:grants,error:null}).then(resolve,reject)},
    maybeSingle(){return Promise.resolve({data:claims.find(c=>c.id===filters.id)||null,
      error:opts.schemaError?{message:'column missing'}:null})}
   };
   assert.ok(['tema1_access','tema1_order_claims'].includes(table));
   return builder;
  },
  storage:{from(bucket){assert.equal(bucket,'tema1-premium');return{
   createSignedUrl:async(file,seconds)=>{
    signedCount++;assert.equal(file,'saber-mas/parte-1.pdf');assert.equal(seconds,60);
    return opts.storageMissing?{data:null,error:{message:'not found'}}:
     {data:{signedUrl:'https://example.supabase.co/storage/v1/object/sign/tema1-premium/saber-mas/parte-1.pdf?token=MOCK'},error:null};
   }
  }}}
 };
 const deno={env:{get:key=>env[key]||null},serve:fn=>handler=fn};
 vm.runInNewContext(javascript(edge),{Deno:deno,createClient:()=>admin,Response,URL,
   atob,TextDecoder,Uint8Array,Date,Math,Number,JSON});
 const req=new Request('https://example.supabase.co/functions/v1/tema1-saber-mas?part='+(opts.part||1),{
  method:'GET',
  headers:{origin:'https://oporadarcadiz.github.io',...(opts.noJwt?{}:{authorization:'Bearer '+(opts.jwt||bearer(opts.method||'otp',opts.agoSeconds||45))})}
 });
 const res=await handler(req);
 return {status:res.status,body:await res.json(),signedCount};
}
test('PDF originales NO están enlazados desde la nueva portada',()=>{
 assert.doesNotMatch(page,/href="[^"]*parte[123]-saber-mas\.pdf/i);
 assert.match(page,/data-premium-pdf="1"/);
 assert.match(page,/data-premium-pdf="2"/);
 assert.match(page,/data-premium-pdf="3"/);
});
test('denegaciones: anónimo, OAuth, sesión caducada, permiso revocado, pedido pendiente, ASIN distinto',async()=>{
 const tests=[
 [{noJwt:true},401],
 [{method:'oauth'},401],
 [{agoSeconds:9*3600},401],
 [{grants:[]},403],
 [{grants:[{active:false,source_claim_id:'c1'}]},403],
 [{claims:[{id:'c1',channel:'amazon',status:'pending',product_edition:'tema1_individual',asin:'B012345678'}]},403],
 [{claims:[{id:'c1',channel:'amazon',status:'verified',product_edition:'tema1_individual',asin:'B999999999'}]},403],
 [{scopes:{tema1_individual:['2']}},403],
 [{schemaError:true},503],
 [{ready:false},503],
 [{storageMissing:true},503]
 ];
 for(const [opts,expected] of tests){
  const result=await run(opts);assert.equal(result.status,expected,JSON.stringify(opts));
  assert.equal(result.body.url,undefined,'Una denegación nunca incluye URL');
 }
});
test('dos compras no se pisan: edición válida y permiso autorizado entregan URL temporal',async()=>{
 const res=await run({grants:[
  {active:true,expires_at:null,source_claim_id:'wrong'},
  {active:true,expires_at:null,source_claim_id:'c1'}
 ],claims:[{id:'wrong',channel:'amazon',status:'rejected'},
  {id:'c1',channel:'amazon',status:'verified',product_edition:'tema1_individual',asin:'B012345678'}]});
 assert.equal(res.status,200);assert.equal(res.body.allowed,true);
 assert.equal(res.body.expires_in_seconds,60);assert.equal(res.signedCount,1);
 assert.match(res.body.url,/storage\/v1\/object\/sign\/tema1-premium/);
});
