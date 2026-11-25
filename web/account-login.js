'use strict';
(async()=>{
  const login=document.getElementById('account-login');
  const userPanel=document.getElementById('account-user');
  const privatePanel=document.getElementById('account-private');
  const feedback=document.getElementById('login-email-status');
  const emailForm=document.getElementById('login-email-form');
  const emailInput=document.getElementById('login-email');
  const submit=document.getElementById('login-email-submit');
  const google=document.getElementById('login-google');

  const notice=(text,state='')=>{
    feedback.textContent=text;
    feedback.dataset.state=state;
  };
  const explanation=error=>{
    const code=String(error?.code||'');
    const message=String(error?.message||'');
    if(error?.status===429||/rate.?limit|over_email_send_rate_limit|too many|security purposes/i.test(code+' '+message)){
      return 'Has solicitado varios enlaces en poco tiempo. Espera al menos un minuto antes de intentarlo de nuevo.';
    }
    if(error?.message==='auth_unavailable'||!window.OpoAccount?.isConfigured()){
      return 'El servicio de acceso no está disponible ahora. Inténtalo más tarde.';
    }
    if(navigator.onLine===false){
      return 'Parece que no tienes conexión. Comprueba Internet e inténtalo de nuevo.';
    }
    return 'No se ha podido solicitar el enlace. Inténtalo de nuevo más tarde.';
  };

  google.onclick=async()=>{
    notice('Abriendo el acceso con Google…');
    google.disabled=true;
    try{
      await window.OpoAccountReady;
      if(!window.OpoAccount?.isConfigured())throw Error('auth_unavailable');
      await window.OpoAccount.signInGoogle();
    }catch(error){
      notice(explanation(error),'error');
    }finally{
      google.disabled=false;
    }
  };

  emailForm.onsubmit=async event=>{
    event.preventDefault();
    if(submit.disabled)return;
    if(!emailInput.checkValidity()){
      emailInput.reportValidity();
      return;
    }
    const email=emailInput.value.trim();
    submit.disabled=true;
    notice('Solicitando el enlace de acceso…');
    try{
      await window.OpoAccountReady;
      if(!window.OpoAccount?.isConfigured())throw Error('auth_unavailable');
      await window.OpoAccount.signInEmail(email);
      notice('Solicitud procesada. Comprueba tu correo, incluido el spam. Si no llega, espera antes de solicitar otro enlace.','success');
    }catch(error){
      notice(explanation(error),'error');
    }finally{
      submit.disabled=false;
    }
  };

  await window.OpoAccountReady;
  const account=window.OpoAccount?.get();
  if(!account)return;
  login.hidden=true;
  userPanel.hidden=false;
  privatePanel.hidden=false;
  document.getElementById('account-email').textContent=account.email||'Cuenta OpoRadarCádiz';
  document.getElementById('logout').onclick=async()=>{
    await window.OpoAccount.signOut();
    location.reload();
  };
})();
