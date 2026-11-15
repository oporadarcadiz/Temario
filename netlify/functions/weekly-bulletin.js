'use strict';

const {enabled,jsonState,usersById,userStates,currentEvents,sendMail,eventDate,eventItem,layout,siteUrl}=require('./email-utils');
const noticeKey='oporadar:notifications:v1';

exports.handler=async()=>{
  if(!enabled())return {statusCode:204,body:''};
  const [states,emails,events]=await Promise.all([userStates(),usersById(),currentEvents()]);
  const since=new Date(Date.now()-7*24*60*60*1000).toISOString();
  const recent=events.filter(event=>eventDate(event)>=since);let sent=0;
  if(!recent.length)return {statusCode:200,body:JSON.stringify({sent})};
  for(const row of states||[]){
    const preferences=jsonState(row.state,noticeKey,{}),email=emails.get(row.user_id);
    if(!preferences?.weekly||!email)continue;
    const body=`<p>Estas son las novedades verificadas de la última semana:</p><ul>${recent.map(eventItem).join('')}</ul><p><a style="color:#efca79" href="${siteUrl}/convocatorias.html">Abrir el radar de convocatorias</a></p>`;
    await sendMail({to:email,subject:'Boletín semanal · OpoRadar Cádiz',html:layout('Novedades de la semana',body)});
    sent++;
  }
  return {statusCode:200,body:JSON.stringify({sent})};
};
