'use strict';

const {enabled,jsonState,usersById,userStates,currentEvents,updateState,sendMail,eventDate,eventItem,layout,siteUrl}=require('./email-utils');
const savedKey='oporadar:radar:saved:v1',noticeKey='oporadar:notifications:v1',deliveryKey='oporadar:email-delivery:v1';

exports.handler=async()=>{
  if(!enabled())return {statusCode:204,body:''};
  const [states,emails,events]=await Promise.all([userStates(),usersById(),currentEvents()]);
  const now=new Date().toISOString();let sent=0,primed=0;
  for(const row of states||[]){
    const preferences=jsonState(row.state,noticeKey,{}),saved=jsonState(row.state,savedKey,[]),delivery=jsonState(row.state,deliveryKey,{});
    if(!preferences?.followed||!Array.isArray(saved)||!saved.length||!emails.get(row.user_id))continue;
    const watermark=delivery.followedCheckedAt;
    const matching=events.filter(event=>saved.includes(event.convocatoria_id)&&(!watermark||eventDate(event)>watermark));
    const nextState={...(row.state||{}),[deliveryKey]:JSON.stringify({...delivery,followedCheckedAt:now})};
    if(!watermark){await updateState(row.user_id,nextState);primed++;continue;}
    if(matching.length){
      const body=`<p>Hemos detectado novedades verificadas en las convocatorias que sigues:</p><ul>${matching.map(eventItem).join('')}</ul><p><a style="color:#efca79" href="${siteUrl}/cuenta.html">Ver mis convocatorias seguidas</a></p>`;
      await sendMail({to:emails.get(row.user_id),subject:'Novedades en tus convocatorias seguidas · OpoRadar',html:layout('Hay novedades en tus convocatorias',body)});
      sent++;
    }
    await updateState(row.user_id,nextState);
  }
  return {statusCode:200,body:JSON.stringify({sent,primed})};
};
