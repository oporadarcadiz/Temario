'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../supabase-account.js'),'utf8');
const pageSource=fs.readFileSync(path.join(__dirname,'../account-page.js'),'utf8');
const profileKey='oporadar:profile:v1';

function environment({session=null,remoteState=null,online=true,initial={}}={}){
  const store=new Map(Object.entries(initial));
  class Storage{
    getItem(k){return store.has(k)?store.get(k):null;}
    setItem(k,v){store.set(k,String(v));}
    removeItem(k){store.delete(k);}
    key(i){return [...store.keys()][i]||null;}
    get length(){return store.size;}
  }
  const status={textContent:''};
  const listeners={};
  const calls={};
  const EventClass=class Event{constructor(type){this.type=type;}};
  const client={
    auth:{
      getSession:async()=>({data:{session:session?{user:session}:null},error:null}),
      signInWithOAuth:async options=>{calls.oauth=options;return {error:null};},
      signInWithOtp:async credentials=>{calls.otp=credentials;return {error:null};},
      signOut:async()=>{calls.signOut=true;return {error:null};}
    },
    from:()=>({
      select:()=>({eq:()=>({maybeSingle:async()=>({data:remoteState,error:null})})}),
      upsert:async row=>{calls.upsert=row;return {error:null};},
      delete:()=>({eq:async(...args)=>{calls.delete=args;return {error:null};}})
    })
  };
  const window={
    OPO_SUPABASE:{url:'https://example.supabase.co',anonKey:'public-key'},
    supabase:{createClient:()=>client},
    addEventListener:(name,fn)=>{listeners['window:'+name]=fn;},
    dispatchEvent:()=>{},
    location:{origin:'https://example.test',pathname:'/cuenta.html'},
    Event:EventClass
  };
  const document={
    querySelectorAll:selector=>selector.includes('data-cloud-status')||selector.includes('#account-status')?[status]:[],
    addEventListener:(name,fn)=>{listeners[name]=fn;},
    querySelector:()=>null
  };
  const context={window,document,Storage,localStorage:new Storage(),location:window.location,
    navigator:{onLine:online},setTimeout,clearTimeout,Date,JSON,Object,Array,String,Boolean,Error,Promise,Event:EventClass};
  context.globalThis=context;
  vm.createContext(context);
  vm.runInContext(source,context);
  return {context,window,client,calls,listeners,status,store};
}

test('cuenta configurada: descarga estado remoto y expone sesión',async()=>{
  const env=environment({session:{id:'user-1',email:'opositor@example.test'},
    remoteState:{state:{[profileKey]:'{"level":"eso"}'}}});
  await env.window.OpoAccountReady;
  assert.equal(env.window.OpoAccount.get().email,'opositor@example.test');
  assert.equal(env.store.get(profileKey),'{"level":"eso"}');
  assert.equal(env.status.textContent,'Tu cuenta está sincronizada.');
});

test('sin sesión: se borran datos locales de otro usuario',async()=>{
  const env=environment({initial:{'oporadar:account-owner:v1':'otro',[profileKey]:'{"level":"eso"}'}});
  await env.window.OpoAccountReady;
  assert.equal(env.store.get('oporadar:account-owner:v1'),undefined);
  assert.equal(env.store.get(profileKey),undefined);
  assert.equal(env.status.textContent,'Modo gratuito · inicia sesión para sincronizar.');
});

test('acceso por correo: OTP con redirect seguro a cuenta.html',async()=>{
  const env=environment();
  await env.window.OpoAccountReady;
  await env.window.OpoAccount.signInEmail('opositor@example.test');
  assert.equal(env.calls.otp.email,'opositor@example.test');
  assert.equal(env.calls.otp.options.emailRedirectTo,'https://example.test/cuenta.html');
  assert.match(env.status.textContent,/Revisa tu correo/);
});

test('acceso con Google: redirect seguro y cierre de sesión local',async()=>{
  const env=environment({session:{id:'user-1',email:'opositor@example.test'}});
  await env.window.OpoAccountReady;
  await env.window.OpoAccount.signInGoogle();
  assert.equal(env.calls.oauth.options.redirectTo,'https://example.test/cuenta.html');
  await env.window.OpoAccount.signOut();
  assert.equal(env.calls.signOut,true);
  assert.equal(env.window.OpoAccount.get(),null);
  assert.equal(env.store.get('oporadar:account-owner:v1'),undefined);
});

test('borrado de datos: elimina fila remota y deja el acceso intacto',async()=>{
  const env=environment({session:{id:'user-1',email:'opositor@example.test'},
    remoteState:{state:{[profileKey]:'{"level":"eso"}'}}});
  await env.window.OpoAccountReady;
  await env.window.OpoAccount.deleteAccountData();
  assert.deepEqual(env.calls.delete,['user_id','user-1']);
  assert.equal(env.store.get(profileKey),undefined);
  assert.equal(env.window.OpoAccount.get().email,'opositor@example.test');
});

test('sin conexión: guarda localmente y reintenta al volver online',async()=>{
  const env=environment({session:{id:'user-1',email:'opositor@example.test'},online:false});
  await env.window.OpoAccountReady;
  await env.window.OpoAccount.save();
  assert.equal(env.calls.upsert,undefined);
  assert.match(env.status.textContent,/Sin conexión/);
  env.context.navigator.onLine=true;
  assert.ok(env.listeners['window:online'],'listener online');
  env.listeners['window:online']();
  await new Promise(resolve=>setTimeout(resolve,0));
  assert.ok(env.calls.upsert,'upsert al recuperar conexión');
  assert.equal(env.status.textContent,'Guardado en tu cuenta.');
});

test('Mi cuenta controla errores de sincronización sin excepciones sueltas',()=>{
  assert.match(pageSource,/profile-form[\s\S]*?try\s*\{\s*await window\.OpoAccount\.save\(\);?\s*\}\s*catch/);
  assert.match(pageSource,/const retry=action=>\s*\(\)=>Promise\.resolve\(\)\.then\(action\)\.catch/);
});
