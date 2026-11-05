'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const repo=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(repo,p),'utf8');
const gameSource=read('tema-1/seguridad/edge/tema1-games-access/index.ts');
const pdfSource=read('tema-1/seguridad/edge/tema1-saber-mas/index.ts');
const loginSource=read('tema-1/acceso/index.html'),saberSource=read('tema-1/saber-mas/index.html');

function otpHelper(source){
 const match=source.match(/function recentOtpJwt\([\s\S]*?\n\}/);
 assert.ok(match,'Missing OTP JWT validator');
 const js=match[0]
  .replace(/function recentOtpJwt\(jwt:\s*string,\s*userId:\s*string\):\s*boolean/,'function recentOtpJwt(jwt,userId)')
  .replace(/\(m:\s*\{method\?:\s*string;\s*timestamp\?:\s*number\}\)/g,'(m)');
 return vm.runInNewContext(js+';recentOtpJwt',{atob,TextDecoder,Uint8Array,Date,Math,Number,JSON});
}
function token(payload){
 return 'unused.'+Buffer.from(JSON.stringify(payload)).toString('base64url')+'.unused';
}
const sub='00000000-0000-4000-8000-000000000000';
function claims(method,stamp){
 return {sub,session_id:'11111111-1111-4111-8111-111111111111',role:'authenticated',
         amr:[{method,timestamp:stamp}]};
}
test('Edge valida el JWT con Supabase ANTES de leer claims OTP',()=>{
 for(const source of [gameSource,pdfSource]){
  const verified=source.indexOf('admin.auth.getUser(');
  const check=source.indexOf('recentOtpJwt(',source.indexOf('Deno.serve('));
  assert.ok(verified>=0&&check>verified,'Missing verified JWT before OTP method check');
 }
});
test('OTP reciente: permite inicio con código y rechaza OAuth, expirado y sujeto ajeno',()=>{
 const now=Math.floor(Date.now()/1000);
 for(const source of [gameSource,pdfSource]){
  const check=otpHelper(source);
  assert.equal(check(token(claims('otp',now-60)),sub),true);
  assert.equal(check(token(claims('oauth',now-60)),sub),false);
  assert.equal(check(token(claims('otp',now-9*3600)),sub),false);
  assert.equal(check(token(claims('otp',now+120)),sub),false);
  assert.equal(check(token(claims('otp',now-60)),'otro-usuario'),false);
  assert.equal(check('basura',sub),false);
 }
});
test('sesión premium por pestaña compartida entre acceso y Saber Más',()=>{
 for(const s of [loginSource,saberSource]){
  assert.match(s,/storage:sessionStorage/);
  assert.match(s,/oporadarcadiz-premium-session-v1/);
  assert.match(s,/detectSessionInUrl:false/);
 }
 assert.match(loginSource,/verifyOtp\(\{email:otpEmail,token,type:'email'\}\)/);
});
test('9 juegos: Test Final suspendido sin bloquear otros ocho',()=>{
 assert.equal(Object.keys(gameSource.match(/"[^"]+":"juegos\/tema-1\/[^"]+"/g)||{}).length,9);
 assert.match(gameSource,/TEMA1_GAME_READY_/);
 assert.match(gameSource,/simulacro-final/);
 assert.match(gameSource,/TEMA1_APPROVED_EDITION_GAME_SCOPES_JSON/);
 assert.match(gameSource,/TEMA1_GAMES_PUBLIC_COPIES_REMOVED/);
});
test('derechos de Amazon y Banco Vivo no se cruzan',()=>{
 assert.match(gameSource,/tema1_access/);
 assert.match(gameSource,/tema1_order_claims/);
 assert.match(gameSource,/product_edition,asin/);
 assert.doesNotMatch(gameSource,/user_entitlements/);
 const sql=read('web/seguridad/BORRADOR_SQL_BANCO_VIVO_NO_APLICAR.sql');
 assert.match(sql,/e\.route='banco-vivo'/);
 assert.match(sql,/auth\.jwt\(\)/);
 assert.match(sql,/method->>'method'='otp'/);
});
test('sin publicar archivos exclusivos ni activar funciones Edge',()=>{
 const client=read('web/premium-access.js');
 assert.doesNotMatch(client,/SUPABASE_SERVICE_ROLE_KEY|sb_secret_|sk_live_/);
 assert.match(client,/storage:window\.sessionStorage/);
 assert.match(pdfSource,/TEMA1_SABER_MAS_CONTENT_READY/);
});
