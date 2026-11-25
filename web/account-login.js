'use strict';
(async()=>{
  const login=document.getElementById('account-login');
  const userPanel=document.getElementById('account-user');
  const privatePanel=document.getElementById('account-private');
  const feedback=document.getElementById('login-email-status');
  const codeFeedback=document.getElementById('login-code-status');
  const emailForm=document.getElementById('login-email-form');
  const codeForm=document.getElementById('login-code-form');
  const emailInput=document.getElementById('login-email');
  const codeInput=document.getElementById('login-code');
  const submit=document.getElementById('login-email-submit');
  const verifyButton=document.getElementById('login-code-submit');
  const google=document.getElementById('login-google');

  const notice=(element,text,state='')=>{
    element.textContent=text;
    element.dataset.state=state;
  };
  const explanation=(error,verification=false)=>{
    const code=String(error?.code||'');
    const message=String(error?.message||'');
    if(error?.status===429||/rate.?limit|over_email_send_rate_limit|too many|security purposes/i.test(code+' '+message)){
      return 'Has hecho demasiados intentos. Espera al menos un minuto antes de volver a intentarlo.';
    }
    if(error?.message==='auth_unavailable'||!window.OpoAccount?.isConfigured()){
      return 'El servicio de acceso no está disponible ahora. Inténtalo más tarde.';
    }
    if(navigator.onLine===false){
      return 'Parece que no tienes conexión. Comprueba Internet e inténtalo de nuevo.';
    }
    if(verification){
      return 'No hemos podido verificar el código. Comprueba que sea el último recibido y que no haya caducado.';
    }
    return 'No se ha podido solicitar el enlace o código. Inténtalo de nuevo más tarde.';
  };

  google.onclick=async()=>{
    notice(feedback,'Abriendo el acceso con Google…');
    google.disabled=true;
    try{
      await window.OpoAccountReady;
      if(!window.OpoAccount?.isConfigured())throw Error('auth_unavailable');
      await window.OpoAccount.signInGoogle();
    }catch(error){
      notice(feedback,explanation(error),'error');
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
    notice(feedback,'Solicitando el código de acceso…');
    try{
      await window.OpoAccountReady;
      if(!window.OpoAccount?.isConfigured())throw Error('auth_unavailable');
      await window.OpoAccount.signInEmail(email);
      notice(feedback,'Solicitud procesada. Revisa tu correo e introduce el código recibido en el formulario de abajo.','success');
    }catch(error){
      notice(feedback,explanation(error),'error');
    }finally{
      submit.disabled=false;
    }
  };

  codeForm.onsubmit=async event=>{
    event.preventDefault();
    if(verifyButton.disabled)return;
    if(!emailInput.checkValidity()){
      notice(codeFeedback,'Introduce arriba el mismo correo electrónico al que llegó el código.','error');
      emailInput.focus();
      return;
    }
    if(!codeInput.checkValidity()){
      codeInput.reportValidity();
      return;
    }
    const email=emailInput.value.trim();
    const token=codeInput.value.trim();
    if(!/^[0-9]{6,8}$/.test(token)){
      notice(codeFeedback,'Introduce únicamente las cifras del código recibido.','error');
      return;
    }
    verifyButton.disabled=true;
    notice(codeFeedback,'Comprobando el código…');
    try{
      await window.OpoAccountReady;
      if(!window.OpoAccount?.isConfigured())throw Error('auth_unavailable');
      await window.OpoAccount.verifyEmailCode(email,token);
      codeInput.value='';
      notice(codeFeedback,'Código confirmado. Entrando en tu cuenta…','success');
      location.reload();
    }catch(error){
      notice(codeFeedback,explanation(error,true),'error');
    }finally{
      verifyButton.disabled=false;
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
