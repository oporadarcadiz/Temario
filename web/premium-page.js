'use strict';
document.addEventListener('DOMContentLoaded',async()=>{
 const $=id=>document.getElementById(id);
 const show=(id,on)=>{$(id).hidden=!on};
 const msg=t=>{$('premium-message').textContent=t};
 const auth=window.OpoPremium;
 if(!auth?.client){msg('Acceso en preparación: autenticación todavía no configurada.');return;}
 let pendingEmail='';
 async function refresh(){
  try{
   const user=await auth.user();
   show('premium-session',!!user);
   show('premium-email-form',!user);
   show('premium-code-form',false);
   if(!user){msg('Introduce tu correo para iniciar una sesión prémium.');return;}
   $('premium-identity').textContent='Identificado: '+(user.email||'cuenta verificada');
   const entitled=await auth.bankRight();
   $('premium-right').textContent=entitled?'Permiso de Banco Vivo registrado. La entrega de preguntas exige autorización del servidor.':'Aún no tienes un permiso Banco Vivo activo. Identificarse no concede una compra.';
   msg('Sesión de identidad activa en esta pestaña.');
  }catch{msg('No ha sido posible comprobar tu sesión o permiso.');show('premium-session',false);}
 }
 $('premium-email-form').onsubmit=async event=>{
  event.preventDefault();const email=$('premium-email').value.trim();
  const button=$('premium-send');button.disabled=true;
  try{await auth.send(email);pendingEmail=email;show('premium-code-form',true);
   msg('Código solicitado. Revisa el correo; si recibes un enlace en vez de seis cifras, falta configurar la plantilla OTP en Supabase.');
  }catch{msg('No se pudo enviar el código. Comprueba el correo o inténtalo más tarde.');}
  finally{button.disabled=false;}
 };
 $('premium-code-form').onsubmit=async event=>{
  event.preventDefault();const code=$('premium-code').value.trim();
  if(!pendingEmail||!/^[0-9]{6}$/.test(code)){msg('Introduce el código completo de seis cifras.');return;}
  const button=$('premium-verify');button.disabled=true;
  try{await auth.verify(pendingEmail,code);pendingEmail='';$('premium-code').value='';await refresh();}
  catch{msg('Código incorrecto, caducado o usado. Solicita uno nuevo.');}
  finally{button.disabled=false;}
 };
 $('premium-logout').onclick=async()=>{try{await auth.signOut();pendingEmail='';$('premium-code').value='';await refresh();}catch{msg('No se ha podido cerrar sesión.');}};
 await refresh();
});