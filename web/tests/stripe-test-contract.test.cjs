'use strict';
// node --test web/tests/stripe-test-contract.test.cjs
// Node/WebCrypto REAL con firmas y payloads sintéticos. NO pago Stripe real.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHmac,webcrypto}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const checkout=fs.readFileSync(path.join(root,'web/seguridad/edge/banco-vivo-checkout/index.ts'),'utf8');
const webhook=fs.readFileSync(path.join(root,'web/seguridad/edge/banco-vivo-webhook/index.ts'),'utf8');
const sql=fs.readFileSync(path.join(root,'web/seguridad/BORRADOR_SQL_BANCO_VIVO_NO_APLICAR.sql'),'utf8');

function helpersFromActualWebhook(){
 const start=webhook.indexOf('function eqHex(');
 const end=webhook.indexOf('Deno.serve(',start);
 assert.ok(start>=0&&end>start,'Firma HMAC no localizada');
 const src=webhook.slice(start,end)
  .replace(/eqHex\(a:string,b:string\)/g,'eqHex(a,b)')
  .replace(/verified\(raw:string,header:string,secret:string\)/g,'verified(raw,header,secret)');
 return new Function('crypto','TextEncoder','Uint8Array','Date','Math',
   'const encoder=new TextEncoder();'+src+';return {eqHex,verified};')(
   webcrypto,TextEncoder,Uint8Array,Date,Math);
}
function sign(t,raw,secret){return createHmac('sha256',secret).update(t+'.'+raw).digest('hex')}
test('firmas Stripe: válida, alterada, falsa, vencida y futura',async()=>{
 const {verified}=helpersFromActualWebhook();
 const raw='{"id":"evt_test_123","type":"checkout.session.completed","livemode":false}';
 const t=Math.floor(Date.now()/1000),secret='whsec_test_qa_solo_local';
 const cases=[
  [raw,'t='+t+',v1='+sign(t,raw,secret),secret,true],
  [raw+' ','t='+t+',v1='+sign(t,raw,secret),secret,false],
  [raw,'t='+t+',v1='+'0'.repeat(64),secret,false],
  [raw,'t='+(t-301)+',v1='+sign(t-301,raw,secret),secret,false],
  [raw,'t='+(t+301)+',v1='+sign(t+301,raw,secret),secret,false],
  [raw,'t='+t+',v1='+sign(t,raw,secret),'whsec_incorrecta',false]
 ];
 for(const [body,signature,key,expected] of cases)
  assert.equal(await verified(body,signature,key),expected,signature.slice(0,30));
});
test('checkout siempre TEST: JWT, OTP, precio del servidor y flags de bloqueo',()=>{
 assert.match(checkout,/sb\.auth\.getUser\(jwt\)/);
 assert.match(checkout,/otpFresh\(jwt,user\.id\)/);
 assert.match(checkout,/BANK_STRIPE_TEST_PRICE_ID/);
 assert.match(checkout,/sk_test_/);
 assert.match(checkout,/BANK_TERMS_APPROVED/);
 assert.match(checkout,/BANK_CATALOG_READY/);
 assert.doesNotMatch(checkout,/price_1UWzgF7p7lu2mp18evRevPou/);
});
test('webhook no concede derecho por URL de éxito: comprueba paid/producto y sesión de Stripe',()=>{
 assert.match(webhook,/req\.text\(\)/);
 assert.match(webhook,/stripe-signature/);
 assert.match(webhook,/payment_status!=="paid"/);
 assert.match(webhook,/session\.client_reference_id/);
 assert.match(webhook,/line_items\?limit=5/);
 assert.match(webhook,/line\.price\?\.product!==PRODUCT/);
 assert.match(webhook,/banco_vivo_registrar_pago_test/);
 assert.doesNotMatch(webhook,/sk_live_/);
});
test('grant idempotente en una transacción y protegido para service_role',()=>{
 assert.equal((sql.match(/^BEGIN;$/gm)||[]).length,1);
 assert.equal((sql.match(/^COMMIT;$/gm)||[]).length,1);
 assert.equal((sql.match(/CREATE TABLE IF NOT EXISTS public\.banco_vivo_stripe_events/g)||[]).length,1);
 assert.match(sql,/banco_vivo_checkout_once_idx/);
 assert.match(sql,/ON CONFLICT DO NOTHING/);
 assert.match(sql,/GET DIAGNOSTICS inserted_count = ROW_COUNT/);
 assert.match(sql,/REVOKE ALL ON FUNCTION public\.banco_vivo_registrar_pago_test/);
 assert.match(sql,/GRANT EXECUTE ON FUNCTION public\.banco_vivo_registrar_pago_test/);
});
