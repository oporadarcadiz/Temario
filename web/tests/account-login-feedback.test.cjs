'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../account-login.js'),'utf8');
const page=fs.readFileSync(path.join(__dirname,'../cuenta.html'),'utf8');
const authSource=fs.readFileSync(path.join(__dirname,'../supabase-account.js'),'utf8');

function setup({configured=true,authError=null}={}){
  const elements={};
  for(const id of ['account-login','account-user','account-private','login-email-status','login-email-form',
    'login-email','login-email-submit','login-code-form','login-code','login-code-submit',
    'login-code-status','login-google','account-email','logout']){
    elements[id]={textContent:'',dataset:{},hidden:false,disabled:false,value:'',onclick:null,onsubmit:null,
      checkValidity:()=>true,reportValidity:()=>true,focus:()=>{}};
  }
  elements['login-email'].value='test@example.invalid';
  elements['login-code'].value='123456';
  let called=0,verified=0,reloaded=0;
  const OpoAccount={
    isConfigured:()=>configured,
    get:()=>null,
    signInEmail:async()=>{called++;if(authError)throw authError;},
    verifyEmailCode:async(email,token)=>{verified++;if(authError)throw authError;return {email,token};},
    signInGoogle:async()=>{}
  };
  const context={document:{getElementById:id=>elements[id]},window:{OpoAccountReady:Promise.resolve(),OpoAccount},
    navigator:{onLine:true},location:{reload:()=>{reloaded++;}},Error,String,Promise};
  vm.runInNewContext(source,context);
  return {elements,getCalls:()=>called,getVerifications:()=>verified,getReloads:()=>reloaded};
}

test('la página de acceso muestra el estado dentro del formulario público',()=>{
  assert.match(page,/id="login-email-submit"/);
  assert.match(page,/id="login-email-status" role="status" aria-live="polite"/);
  assert.match(page,/id="login-code-form"/);
  assert.match(page,/id="login-code"[^>]*autocomplete="one-time-code"/);
  assert.match(page,/id="login-code-status" role="status" aria-live="polite"/);
  assert.doesNotMatch(authSource,/if\(!client\)return status\('Supabase todavía no está conectado\.'\)/);
});

test('enlace solicitado: muestra confirmación visible y recupera el botón',async()=>{
  const {elements,getCalls}=setup();
  let prevented=false;
  await elements['login-email-form'].onsubmit({preventDefault:()=>{prevented=true;}});
  assert.equal(prevented,true);
  assert.equal(getCalls(),1);
  assert.match(elements['login-email-status'].textContent,/Solicitud procesada/);
  assert.equal(elements['login-email-status'].dataset.state,'success');
  assert.equal(elements['login-email-submit'].disabled,false);
});

test('rate-limit Supabase: explica el error sin afirmar que se envió el correo',async()=>{
  const error=Object.assign(new Error('For security purposes'),{code:'over_email_send_rate_limit',status:429});
  const {elements,getCalls}=setup({authError:error});
  await elements['login-email-form'].onsubmit({preventDefault:()=>{}});
  assert.equal(getCalls(),1);
  assert.match(elements['login-email-status'].textContent,/Espera al menos un minuto/);
  assert.doesNotMatch(elements['login-email-status'].textContent,/Solicitud procesada/);
  assert.equal(elements['login-email-status'].dataset.state,'error');
  assert.equal(elements['login-email-submit'].disabled,false);
});

test('si Supabase no está disponible, no se intenta enviar y se muestra aviso',async()=>{
  const {elements,getCalls}=setup({configured:false});
  await elements['login-email-form'].onsubmit({preventDefault:()=>{}});
  assert.equal(getCalls(),0);
  assert.match(elements['login-email-status'].textContent,/no está disponible/);
  assert.equal(elements['login-email-status'].dataset.state,'error');
});

test('OTP válido: verifica con el mismo email y entra en la cuenta',async()=>{
  const {elements,getVerifications,getReloads}=setup();
  await elements['login-code-form'].onsubmit({preventDefault:()=>{}});
  assert.equal(getVerifications(),1);
  assert.equal(getReloads(),1);
  assert.match(elements['login-code-status'].textContent,/Código confirmado/);
  assert.equal(elements['login-code-submit'].disabled,false);
});

test('OTP incorrecto o caducado: informa sin entrar',async()=>{
  const error=Object.assign(new Error('Token expired'),{code:'otp_expired',status:403});
  const {elements,getVerifications,getReloads}=setup({authError:error});
  await elements['login-code-form'].onsubmit({preventDefault:()=>{}});
  assert.equal(getVerifications(),1);
  assert.equal(getReloads(),0);
  assert.match(elements['login-code-status'].textContent,/no haya caducado/);
  assert.equal(elements['login-code-status'].dataset.state,'error');
});

test('verificación con correo vacío: no llama al servicio y pide el mismo email',async()=>{
  const {elements,getVerifications}=setup();
  elements['login-email'].checkValidity=()=>false;
  await elements['login-code-form'].onsubmit({preventDefault:()=>{}});
  assert.equal(getVerifications(),0);
  assert.match(elements['login-code-status'].textContent,/mismo correo electrónico/);
});

test('acceso compacto: correo, código y Google en un mismo bloque sin textos extensos',()=>{
  assert.match(page,/<body class="account-compact">/);
  assert.match(page,/<h1>Mi cuenta<\/h1>/);
  assert.match(page,/class="login-steps"/);
  for(const id of ['login-email','login-code','login-email-submit','login-code-submit','login-google']){
    assert.match(page,new RegExp('id="'+id+'"'));
  }
  assert.match(page,/\.login-steps\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(page,/@media\(max-width:650px\)/);
  assert.match(page,/\.login-steps\{grid-template-columns:1fr;gap:9px\}/);
  assert.doesNotMatch(page,/overflow:hidden|height:100vh/);
});
