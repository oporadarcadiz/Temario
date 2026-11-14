'use strict';
(async()=>{
  const login=document.getElementById('account-login'),userPanel=document.getElementById('account-user'),privatePanel=document.getElementById('account-private'),googleButton=document.getElementById('login-google');
  const message=text=>{let status=document.getElementById('account-status')||document.getElementById('login-status');if(!status&&login){status=document.createElement('p');status.id='login-status';status.setAttribute('role','status');login.append(status);}if(status)status.textContent=text;};
  googleButton.onclick=async()=>{message('Abriendo el acceso seguro de Google…');try{await window.OpoAccount.signInGoogle();}catch(error){message(error?.message||'No se ha podido iniciar el acceso con Google. Usa el enlace seguro por correo.');}};
  document.getElementById('login-email-form').onsubmit=async event=>{event.preventDefault();message('Enviando el enlace de acceso…');try{await window.OpoAccount.signInEmail(document.getElementById('login-email').value.trim());}catch(error){message(error?.message||'No se ha podido enviar el enlace de acceso.');}};
  await window.OpoAccountReady;
  const account=window.OpoAccount.get();if(account){login.hidden=true;userPanel.hidden=false;privatePanel.hidden=false;document.getElementById('account-email').textContent=account.email||'Cuenta OpoRadarCádiz';document.getElementById('logout').onclick=async()=>{await window.OpoAccount.signOut();location.reload();};return;}
  try{const config=window.OPO_SUPABASE||{};if(config.url&&config.anonKey){const response=await fetch(config.url+'/auth/v1/settings',{headers:{apikey:config.anonKey}}),settings=await response.json();if(response.ok&&settings?.external?.google!==true){googleButton.disabled=true;googleButton.title='El acceso con Google está en preparación';googleButton.textContent='Google · próximamente';message('Puedes entrar ahora mismo con un enlace seguro enviado a tu correo.');}}}catch{}
})();
