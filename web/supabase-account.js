'use strict';
(() => {
  const config=window.OPO_SUPABASE||{},keys=['oporadar:radar:saved:v1','oporadar:study-tools:v1','oporadar:profile:v1','oporadar:notifications:v1',...['aux','sub','auxiliar','subalterno'].flatMap(r=>['progress','history','session'].map(k=>`oporadar:${r}:${k}:v1`))];
  const nativeSet=Storage.prototype.setItem,nativeRemove=Storage.prototype.removeItem,ownerKey='oporadar:account-owner:v1';
  let client=null,user=null,loading=true,applyingRemote=false,timer;
  const status=t=>document.querySelectorAll('[data-cloud-status],#account-status').forEach(e=>e.textContent=t);
  const state=()=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]).filter(([,v])=>v!==null));
  const configured=()=>Boolean(config.url&&config.anonKey&&window.supabase);
  async function load(){
    if(!configured()){status('Modo local · Supabase pendiente de conectar.');loading=false;return;}
    client=window.supabase.createClient(config.url,config.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});window.OpoSupabaseClient=client;
    const session=await client.auth.getSession();if(session.error)throw session.error;user=session.data.session?.user||null;
    const previousOwner=localStorage.getItem(ownerKey);
    if(!user){
      if(previousOwner){keys.forEach(k=>nativeRemove.call(localStorage,k));nativeRemove.call(localStorage,ownerKey);}
      status('Modo gratuito · inicia sesión para sincronizar.');loading=false;return;
    }
    if(previousOwner&&previousOwner!==user.id)keys.forEach(k=>nativeRemove.call(localStorage,k));
    const response=await client.from('user_state').select('state').eq('user_id',user.id).maybeSingle();if(response.error)throw response.error;
    applyingRemote=true;try{
      if(response.data){
        keys.forEach(k=>nativeRemove.call(localStorage,k));
        for(const [k,v] of Object.entries(response.data.state||{}))if(keys.includes(k)&&typeof v==='string')nativeSet.call(localStorage,k,v);
      }
      nativeSet.call(localStorage,ownerKey,user.id);
    }finally{applyingRemote=false;}
    loading=false;
    if(!response.data&&previousOwner!==user.id)await save();
    status('Tu cuenta está sincronizada.');window.dispatchEvent(new Event('oporadar:account-ready'));
  }
  async function save(){if(loading)return;if(!client||!user){status('Guardado en este navegador.');return;}const {error}=await client.from('user_state').upsert({user_id:user.id,state:state(),updated_at:new Date().toISOString()});if(error)throw error;status('Guardado en tu cuenta.');}
  function schedule(){if(applyingRemote)return;clearTimeout(timer);timer=setTimeout(()=>save().catch(()=>status('Guardado localmente; sincronización pendiente.')),700);}
  Storage.prototype.setItem=function(k,v){nativeSet.call(this,k,v);if(this===localStorage&&keys.includes(k))schedule();};
  Storage.prototype.removeItem=function(k){nativeRemove.call(this,k);if(this===localStorage&&keys.includes(k))schedule();};
  window.OpoAccount={
    get:()=>user?{id:user.id,email:user.email}:null,isConfigured:configured,save,importLocal:save,
    signInGoogle:async()=>{if(!client)return status('Supabase todavía no está conectado.');const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${location.origin}/cuenta.html`}});if(error)throw error;},
    signInEmail:async email=>{if(!client)return status('Supabase todavía no está conectado.');const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:`${location.origin}/cuenta.html`}});if(error)throw error;status('Revisa tu correo: te hemos enviado un enlace de acceso.');},
    signOut:async()=>{if(client){const {error}=await client.auth.signOut();if(error)throw error;}user=null;clearTimeout(timer);keys.forEach(k=>nativeRemove.call(localStorage,k));nativeRemove.call(localStorage,ownerKey);},
    deleteAccountData:async()=>{if(!client||!user)throw Error('Inicia sesión para borrar los datos sincronizados.');const {error}=await client.from('user_state').delete().eq('user_id',user.id);if(error)throw error;keys.forEach(k=>nativeRemove.call(localStorage,k));status('Datos de OpoRadarCádiz borrados.');},
    deleteLocal:()=>keys.forEach(k=>nativeRemove.call(localStorage,k))
  };
  window.OpoAccountReady=load().catch(()=>{loading=false;status('No se ha podido sincronizar. Tus datos locales se conservan.');});
})();

document.addEventListener('DOMContentLoaded',()=>{
  const nav=document.querySelector('.masthead nav');
  if(!nav||nav.querySelector('[data-tema-1-nav]'))return;
  const link=document.createElement('a');
  link.href='/tema-1/';
  link.dataset.tema1Nav='';
  link.textContent='Tema 1';
  if(location.pathname.startsWith('/tema-1/'))link.setAttribute('aria-current','page');
  nav.append(link);
});

document.addEventListener('DOMContentLoaded',()=>{
  if(!/^\/(?:index\.html)?$/.test(location.pathname)||document.getElementById('free-radar-cta'))return;
  const main=document.querySelector('main'),footer=document.querySelector('footer');if(!main)return;
  const section=document.createElement('aside');section.id='free-radar-cta';section.className='free-radar-cta wrap';
  const copy=document.createElement('div'),eyebrow=document.createElement('p'),title=document.createElement('h2'),description=document.createElement('p'),actions=document.createElement('div');
  eyebrow.className='eyebrow';eyebrow.textContent='RADAR GRATUITO';title.textContent='Que no se te escape una novedad.';description.textContent='Guarda las convocatorias que te interesan y elige si quieres recibir un resumen semanal o avisos de cambios verificados.';
  for(const [href,label,kind] of [['/convocatorias.html','Ver convocatorias','gold'],['/cuenta.html#avisos','Configurar mis avisos','outline']]){const link=document.createElement('a');link.href=href;link.className='button '+kind;link.textContent=label;actions.append(link);}
  copy.append(eyebrow,title,description);section.append(copy,actions);if(footer)footer.before(section);else main.after(section);
});
