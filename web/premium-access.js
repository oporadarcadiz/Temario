'use strict';
/* M-083/M-084: SESIÓN PRÉMIUM por código email.
   NO concede ningún derecho: la autorización real se consulta en Supabase.
   Se usa sessionStorage para que abrir una sesión nueva exija un OTP nuevo.
   La plantilla de Magic Link de Supabase DEBE incluir {{ .Token }} antes de desplegar. */
(()=>{
  const url='https://jtyjdrrxmuppulbekfai.supabase.co';
  const key='sb_publishable_-9m9ilEwGsM4tEBTVXS3FA_aRlVhNNc';
  if(!window.supabase?.createClient){window.OpoPremium={error:'Servicio de autenticación no disponible'};return;}
  const client=window.supabase.createClient(url,key,{auth:{
    storage:window.sessionStorage,storageKey:'oporadarcadiz-premium-session-v1',
    persistSession:true,autoRefreshToken:true,detectSessionInUrl:false
  }});
  window.OpoPremium={
    client,
    async send(email){if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Introduce un correo válido.');const {error}=await client.auth.signInWithOtp({email});if(error)throw error;},
    async verify(email,code){if(!/^[0-9]{6}$/.test(code))throw Error('El código debe tener seis cifras.');const {error}=await client.auth.verifyOtp({email,token:code,type:'email'});if(error)throw error;},
    async signOut(){const {error}=await client.auth.signOut();if(error)throw error;},
    async user(){const {data,error}=await client.auth.getUser();if(error)throw error;return data.user;},
    async bankRight(){
      const {data:{user},error:authError}=await client.auth.getUser();
      if(authError||!user)return false;
      // Una cuenta gratuita ni una compra Amazon conceden Banco Vivo.
      const {data,error}=await client.from('user_entitlements')
        .select('active,expires_at').eq('user_id',user.id).eq('route','banco-vivo').maybeSingle();
      if(error)throw error;
      return data?.active===true&&(!data.expires_at||Date.parse(data.expires_at)>Date.now());
    }
  };
})();
