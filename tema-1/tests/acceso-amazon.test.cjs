'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'acceso/index.html'),'utf8');
const sql=fs.readFileSync(path.join(root,'seguridad/20261102_amazon_solo_acceso.sql'),'utf8');
const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
if(!script)throw Error('Falta el script de acceso');
const helpers=script.match(/const normalizeAmazonOrder=[^\n]+;\nconst validAmazonOrder=[^\n]+;/)?.[0];
if(!helpers)throw Error('Faltan los validadores de Amazon');
const {normalizeAmazonOrder,validAmazonOrder}=vm.runInNewContext(helpers+'\n({normalizeAmazonOrder,validAmazonOrder})');

test('solo se presenta Amazon como canal de compra',()=>{
 assert.match(html,/channel:'amazon'/);
 assert.doesNotMatch(html,/<option value="web">/);
});
test('canoniza el formato del pedido y sus variantes',()=>{
 for(const value of ['123-1234567-1234567','12312345671234567',' 123 - 1234567 - 1234567 ','123–1234567–1234567']){
  assert.equal(normalizeAmazonOrder(value),'123-1234567-1234567');
 }
});
test('rechaza referencias con formatos inesperados',()=>{
 for(const value of ['','123-ABC-1234567','123-123456-1234567','123-1234567-1234567x'])
  assert.equal(validAmazonOrder(normalizeAmazonOrder(value)),false);
});
test('evita reenvíos mientras haya una solicitud pendiente',()=>{
 assert.match(script,/show\('claim',!active&&!pending\)/);
});
test('la identidad OTP no es una concesión de compra',()=>{
 assert.match(script,/signInWithOtp/);
 assert.match(script,/from\('tema1_access'\)/);
 assert.match(script,/grant\?\.active===true/);
});
test('el servidor bloqueará canales distintos de Amazon al aplicar la migración',()=>{
 assert.match(sql,/NEW.channel IS DISTINCT FROM 'amazon'/);
 assert.match(sql,/p.channel <> 'amazon'/);
 assert.match(sql,/ON CONFLICT\(user_id\)/);
});
test('las referencias se canonizarán ANTES de la restricción única existente',()=>{
 assert.match(sql,/BEFORE INSERT OR UPDATE OF channel, order_reference/);
 assert.match(sql,/NEW.order_reference := ref/);
});
test('sin secrets del rol de servicio ni enlace de cobro en cliente',()=>{
 assert.doesNotMatch(html,/sb_secret_|service_role|buy\.stripe\.com/i);
});
