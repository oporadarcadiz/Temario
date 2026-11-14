'use strict';
const { test }=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('dos fichas comerciales y pagos inactivos',()=>{
 const plans=read('planes.html'),bank=read('banco-vivo.html'),book=read('tema1-venta.html');
 assert.match(plans,/banco-vivo\.html/);
 assert.match(plans,/tema1-venta\.html/);
 assert.match(bank,/disabled aria-disabled="true"/);
 assert.match(book,/Amazon KDP/);
 assert.doesNotMatch(bank,/buy\.stripe\.com|checkout\.stripe\.com/);
});
test('sin claves privadas incrustadas en el navegador',()=>{
 for(const file of ['banco-vivo.html','banco-vivo.js','premium-access.js','premium-page.js','acceso-premium.html']){
  assert.doesNotMatch(read(file),/sb_secret_|service_role|sk_live_|sk_test_/i,file);
 }
});
test('OTP real de seis cifras configurado en cliente; no se fía de un correo como compra',async()=>{
 const calls=[];
 const fake={
  auth:{
   signInWithOtp:async arg=>{calls.push(['send',arg]);return {error:null};},
   verifyOtp:async arg=>{calls.push(['verify',arg]);return {error:null};},
   getUser:async()=>({data:{user:{id:'usuario-prueba'}}}),
   signOut:async()=>({error:null})
  },
  from:table=>{
   calls.push(['table',table]);
   return {select:()=>({eq:()=>({eq:()=>({maybeSingle:async()=>({data:{active:true,expires_at:null},error:null})})})})};
  }
 };
 const win={sessionStorage:{},supabase:{createClient:(url,key,options)=>{calls.push(['client',options]);return fake;}}};
 vm.runInNewContext(read('premium-access.js'),{window:win});
 await win.OpoPremium.send('usuario@example.com');
 await win.OpoPremium.verify('usuario@example.com','123456');
 assert.equal(await win.OpoPremium.bankRight(),true);
 assert.ok(calls.some(([type,v])=>type==='verify'&&v.type==='email'&&v.token==='123456'));
 assert.ok(calls.some(([type,v])=>type==='client'&&v.auth.storage===win.sessionStorage));
 assert.ok(calls.some(([type,v])=>type==='table'&&v==='user_entitlements'));
 await assert.rejects(()=>win.OpoPremium.verify('usuario@example.com','12345'));
});
test('contador solo admite agregados publicados y no copia 1939 del maestro',async()=>{
 const script=read('banco-vivo.js');
 async function show(payload,ok=true){
  const fields={'bv-count':{textContent:'inicial'},'bv-count-status':{textContent:'inicial'}};
  vm.runInNewContext(script,{document:{getElementById:id=>fields[id]},
    fetch:async()=>({ok,json:async()=>payload}),Intl,Number,Error});
  await new Promise(setImmediate);
  return fields;
 }
 const valid=await show({count:23,source:'published_questions'});
 assert.equal(valid['bv-count'].textContent,'23');
 const invalid=await show({count:1939,source:'opo_master_questions'});
 assert.equal(invalid['bv-count'].textContent,'—');
 const unavailable=await show({},false);
 assert.equal(unavailable['bv-count'].textContent,'—');
});
test('Edge contador no entrega filas ni usa banco maestro',()=>{
 const edge=read('seguridad/edge/banco-vivo-catalogo/index.ts');
 assert.match(edge,/method:'HEAD'/);
 assert.match(edge,/published_questions/);
 assert.match(edge,/verification_status/);
 assert.match(edge,/content-range/);
 assert.doesNotMatch(edge,/'question_text'|"question_text"|correct_option|\boptions\s*[:=]/);
});
test('la comercialización de Banco Vivo no concede automáticamente juegos Amazon',()=>{
 const premium=read('premium-access.js');
 assert.match(premium,/\.eq\('route','banco-vivo'\)/);
 assert.doesNotMatch(premium,/tema1_access|tema1_order_claims/);
});
test('borrador Banco Vivo mantiene banco publicado y flujos de estudio separados',()=>{
 const sql=read('seguridad/BORRADOR_SQL_BANCO_VIVO_NO_APLICAR.sql');
 assert.match(sql,/published_questions/);
 assert.doesNotMatch(sql,/FROM\s+public\.opo_master_questions/i);
 assert.match(sql,/Biblioteca documental/);
 assert.match(sql,/Test autocorregible/);
 assert.equal((sql.match(/CREATE TABLE IF NOT EXISTS public\.banco_vivo_stripe_events/g)||[]).length,1);
 assert.match(sql,/method->>'method'='otp'/);
});
