'use strict';

const siteName='OpoRadarCádiz';
const siteUrl='https://web-oporadarcadiz.netlify.app';

function enabled(){
  return process.env.OPORADAR_EMAIL_ENABLED==='true'&&Boolean(process.env.GMAIL_CLIENT_ID&&process.env.GMAIL_CLIENT_SECRET&&process.env.GMAIL_REFRESH_TOKEN&&process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function config(){
  return {
    url:process.env.SUPABASE_URL||'https://jtyjdrrxmuppulbekfai.supabase.co',
    serviceKey:process.env.SUPABASE_SERVICE_ROLE_KEY
  };
}

function jsonState(state,key,fallback){
  try{return JSON.parse(state?.[key]||'');}catch{return fallback;}
}

function encodeHeader(value){
  return `=?UTF-8?B?${Buffer.from(String(value),'utf8').toString('base64')}?=`;
}

function encodeText(value){
  return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function message({to,subject,html}){
  const plain=html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const sender=process.env.GMAIL_SENDER_EMAIL||'oporadarcadiz@gmail.com';
  return [
    `From: ${siteName} <${sender}>`,
    `To: ${to}`,
    `Subject: ${encodeHeader(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(html||plain,'utf8').toString('base64')
  ].join('\r\n');
}

async function gmailAccessToken(){
  const body=new URLSearchParams({
    client_id:process.env.GMAIL_CLIENT_ID,
    client_secret:process.env.GMAIL_CLIENT_SECRET,
    refresh_token:process.env.GMAIL_REFRESH_TOKEN,
    grant_type:'refresh_token'
  });
  const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
  if(!response.ok)throw Error(`No se ha podido autorizar el envío (${response.status}).`);
  const data=await response.json();
  if(!data.access_token)throw Error('Google no ha devuelto una autorización de envío.');
  return data.access_token;
}

async function sendMail(input){
  const token=await gmailAccessToken();
  const raw=Buffer.from(message(input),'utf8').toString('base64url');
  const response=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({raw})});
  if(!response.ok)throw Error(`Gmail no ha aceptado el envío (${response.status}).`);
}

async function supabase(path,options={}){
  const {url,serviceKey}=config();
  const response=await fetch(url+path,{...options,headers:{apikey:serviceKey,Authorization:`Bearer ${serviceKey}`,'Content-Type':'application/json',...(options.headers||{})}});
  if(!response.ok)throw Error(`No se han podido consultar los avisos (${response.status}).`);
  return response.status===204?null:response.json();
}

async function usersById(){
  const users=[];
  for(let page=1;page<=20;page++){
    const data=await supabase(`/auth/v1/admin/users?page=${page}&per_page=1000`);
    const batch=Array.isArray(data?.users)?data.users:[];
    users.push(...batch);
    if(batch.length<1000)break;
  }
  return new Map(users.filter(user=>user?.id&&user?.email).map(user=>[user.id,user.email]));
}

async function userStates(){
  return supabase('/rest/v1/user_state?select=user_id,state,updated_at');
}

async function currentEvents(){
  return supabase('/rest/v1/opportunity_events?select=evento_id,convocatoria_id,tipo_evento,titulo_evento,fecha_oficial,url_evento,canonical_url,resumen,created_at&publicado=eq.true&estado_validacion=eq.aprobado&retirado_en=is.null&order=created_at.desc');
}

async function updateState(userId,state){
  await supabase('/rest/v1/user_state?on_conflict=user_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify({user_id:userId,state,updated_at:new Date().toISOString()})});
}

function eventUrl(event){return event.url_evento||event.canonical_url||`${siteUrl}/convocatorias.html`;}
function eventDate(event){return event.created_at||event.fecha_oficial||new Date(0).toISOString();}
function eventItem(event){return `<li><a href="${encodeText(eventUrl(event))}">${encodeText(event.titulo_evento||'Novedad publicada')}</a>${event.resumen?`<br><span>${encodeText(event.resumen)}</span>`:''}</li>`;}
function layout(title,body){return `<!doctype html><html lang="es"><body style="font-family:Arial,sans-serif;background:#08182d;color:#f6f1e8;padding:24px"><main style="max-width:620px;margin:auto;background:#102640;padding:28px;border:1px solid #d9aa4f"><p style="color:#efca79;letter-spacing:.12em;font-size:12px">OPORADAR CÁDIZ</p><h1 style="font-size:26px">${encodeText(title)}</h1>${body}<p style="margin-top:26px"><a style="color:#efca79" href="${siteUrl}/cuenta.html#avisos">Gestionar mis avisos</a></p><p style="font-size:12px;color:#b9c5d5">Este aviso no sustituye la consulta del expediente oficial.</p></main></body></html>`;}

module.exports={enabled,jsonState,usersById,userStates,currentEvents,updateState,sendMail,eventDate,eventItem,layout,siteUrl};
