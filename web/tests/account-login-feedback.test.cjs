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
    'login-email','login-email-submit','login-google','account-email','logout']){
    elements[id]={textContent:'',dataset:{},hidden:false,disabled:false,value:'',onclick:null,onsubmit:null,
      checkValidity:()=>true,reportValidity:()=>true};
  }
  elements['login-email'].value='test@example.invalid';
  let called=0;
  const OpoAccount={
    isConfigured:()=>configured,
    get:()=>null,
    signInEmail:async()=>{called++;if(authError)throw authError;},
    signInGoogle:async()=>{}
  };
  const context={document:{getElementById:id=>elements[id]},window:{OpoAccountReady:Promise.resolve(),OpoAccount},
    navigator:{onLine:true},location:{reload:()=>{}},Error,String,Promise};
  vm.runInNewContext(source,context);
  return {elements,getCalls:()=>called};
}

test('la página de acceso muestra el estado dentro del formulario público',()=>{
  assert.match(page,/id="login-email-submit"/);
  assert.match(page,/id="login-email-status" role="status" aria-live="polite"/);
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
