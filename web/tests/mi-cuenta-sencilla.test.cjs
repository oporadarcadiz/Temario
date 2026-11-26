'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'cuenta.html'),'utf8');
const page=fs.readFileSync(path.join(root,'account-page.js'),'utf8');
const login=fs.readFileSync(path.join(root,'account-login.js'),'utf8');

test('la sesión visible contiene correo y solo cerrar sesión',()=>{
  const section=html.split('<section id="account-user"')[1].split('</section>')[0];
  assert.match(section,/id="account-email"/);
  assert.match(section,/id="logout"[^>]*>Cerrar sesión/);
  assert.doesNotMatch(section,/id="(?:import-local|retry-cloud|export-account|delete-account)"/);
});

test('convocatorias favoritas aparecen inmediatamente después de la sesión',()=>{
  const user=html.indexOf('id="account-user"');
  const fav=html.indexOf('id="account-following-title"');
  const count=html.indexOf('id="account-saved-count"');
  const saved=html.indexOf('id="account-saved"');
  const settings=html.indexOf('class="account-settings"');
  assert.ok(user>=0&&user<fav&&fav<count&&count<saved&&saved<settings);
  assert.match(html,/Convocatorias en seguimiento/);
  assert.match(html,/marcado con el corazón/);
  assert.match(html,/Ver todas las convocatorias/);
});

test('sincronización y privacidad quedan accesibles pero replegadas',()=>{
  assert.match(html,/<details class="account-settings"><summary>Ajustes y privacidad<\/summary>/);
  for(const id of ['account-extra-content','account-status','import-local','retry-cloud','export-account','delete-account']){
    assert.ok(html.includes('id="'+id+'"'),id);
  }
  assert.match(page,/extra\.insertBefore\(newsletter,extra\.lastElementChild\)/);
  assert.match(page,/window\.OpoAccount\.save\(\)/);
});

test('se conservan favoritos por ID y se enlaza directamente a su ficha',()=>{
  assert.match(page,/savedKey='oporadar:radar:saved:v1'/);
  assert.match(page,/ids\.includes\(o\.id\)/);
  assert.match(page,/\/convocatoria\.html\?id=/);
  assert.match(page,/♡ Dejar de seguir/);
  assert.match(page,/Aún no has marcado ninguna convocatoria con el corazón/);
});

test('el estilo firmado se ensancha y mantiene responsive sin exponer áreas privadas',()=>{
  assert.match(html,/:has\(#account-user:not\(\[hidden\]\)\) \.account-page/);
  assert.match(html,/#account-user\[hidden\][^\n]*#account-private\[hidden\]/);
  assert.match(html,/#account-saved\{display:grid/);
  assert.match(html,/@media\(max-width:600px\)/);
  assert.doesNotMatch(login,/signInWithOtp\(/);
});
