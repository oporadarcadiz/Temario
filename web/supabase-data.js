'use strict';
window.OpoData={
 normalize(record,dbEvents=[]){
  const d=record?.data&&typeof record.data==='object'?record.data:(record||{});
  const id=record?.id||d.id;
  const legacyEvents=Array.isArray(d.events)?d.events:[];
  const approvedLegacy=legacyEvents.filter(e=>e?.approved===true&&e?.publicado===true&&['approved','published'].includes(String(e.publicationStatus||e.estado_validacion||'').toLowerCase())&&!e.retirado_en&&!e.retiredAt);
  const approvedDb=(Array.isArray(dbEvents)?dbEvents:[]).filter(e=>e?.convocatoria_id===id&&e?.publicado===true&&e?.estado_validacion==='aprobado'&&!e?.retirado_en).map(e=>({
   id:e.evento_id,opportunityId:e.convocatoria_id,type:e.tipo_evento,title:e.titulo_evento,
   officialPublishedOn:e.fecha_oficial||null,url:e.url_evento||e.canonical_url,
   summary:e.resumen||'',approved:true,publicado:true,publicationStatus:'approved'
  }));
  const seen=new Set();
  const events=[...approvedDb,...approvedLegacy].filter(e=>{const key=e.id||[id,e.type,e.officialPublishedOn,e.url].join('|');if(seen.has(key))return false;seen.add(key);return true});
  return {...d,
   id,slug:record?.slug||d.slug||null,
   title:d.title||d.titulo||'',organism:d.organism||d.organization||d.organismo||'',
   location:d.location||record?.municipio||d.municipio||record?.ambito||d.ambito||record?.provincia||d.provincia||'',
   municipio:record?.municipio||d.municipio||null,
   processType:d.processType||d.tipo_proceso,places:(()=>{const v=d.places??d.numero_plazas;if(v==null||v==='')return null;const n=Number(v);return Number.isSafeInteger(n)&&n>=0?n:null;})(),state:d.state||d.estado_proceso,
   publishedOn:d.publishedOn||d.fecha_publicacion_inicial,boePublishedOn:d.boePublishedOn||d.fecha_publicacion_boletin||d.publishedOn||d.fecha_publicacion_inicial,applicationsStartOn:d.applicationsStartOn||record?.fecha_inicio_plazo||d.fecha_inicio_plazo,applicationsEndOn:d.applicationsEndOn||d.fecha_fin_plazo||record?.fecha_fin_plazo,
   url:d.url||record?.canonical_url||d.url_bases,boeUrl:d.boeUrl||d.url_bases||d.url||record?.canonical_url,
   reviewedOn:d.reviewedOn||String(record?.reviewed_at||record?.fecha_ultima_consulta||d.fecha_ultima_consulta||'').slice(0,10)||d.publishedOn||d.fecha_publicacion_inicial,
   publicationStatus:d.publicationStatus||record?.estado_validacion||d.estado_validacion,
   published:record?.published??d.publicada??true,events,
   announcements:(Array.isArray(d.announcements)?d.announcements:[]).filter(e=>e?.approved===true&&!e.retirado_en&&!e.retiredAt&&(!e.publicationStatus||['approved','published','publicada','validada'].includes(String(e.publicationStatus).toLowerCase()))),
   milestones:Object.fromEntries(Object.entries(d.milestones||{}).filter(([,e])=>e&&e.approved===true&&!e.retirado_en&&!e.retiredAt&&(!e.publicationStatus||['approved','published','publicada','validada'].includes(String(e.publicationStatus).toLowerCase()))))
  };
 },
 async loadOpportunities(){
  const fallback=async(reason)=>{const response=await fetch('/assets/convocatorias.json',{cache:'no-store'});if(!response.ok)throw Error('No se han podido cargar las convocatorias.');const data=await response.json();return {...data,opportunities:(data.opportunities||[]).map(x=>this.normalize(x)).filter(x=>x.published!==false),source:'respaldo',notice:reason?'Conexión al radar no disponible. Se muestra una copia de respaldo que puede estar desactualizada.':''};};
  try{
   try{await window.OpoAccountReady}catch{}
   const client=window.OpoSupabaseClient;let rows=[],eventRows=[];
   if(client){
    const opportunities=await client.from('opportunities').select('id,slug,data,published,reviewed_at,municipio,provincia,ambito,canonical_url,fecha_inicio_plazo,fecha_ultima_consulta,estado_validacion').eq('published',true).order('reviewed_at',{ascending:false});
    if(opportunities.error)throw opportunities.error;rows=opportunities.data||[];
    const events=await client.from('opportunity_events').select('evento_id,convocatoria_id,tipo_evento,titulo_evento,fecha_oficial,url_evento,canonical_url,resumen,publicado,estado_validacion,retirado_en,created_at').eq('publicado',true).eq('estado_validacion','aprobado').is('retirado_en',null).order('fecha_oficial',{ascending:false});
    if(events.error)throw events.error;eventRows=events.data||[];
   }else{
    const base='https://jtyjdrrxmuppulbekfai.supabase.co/rest/v1/';const headers={apikey:'sb_publishable_-9m9ilEwGsM4tEBTVXS3FA_aRlVhNNc'};
    const [opportunities,events]=await Promise.all([
     fetch(base+'opportunities?select=id,slug,data,published,reviewed_at,municipio,provincia,ambito,canonical_url,fecha_inicio_plazo,fecha_ultima_consulta,estado_validacion&published=eq.true&order=reviewed_at.desc',{headers,cache:'no-store',signal:AbortSignal.timeout(12000)}),
     fetch(base+'opportunity_events?select=evento_id,convocatoria_id,tipo_evento,titulo_evento,fecha_oficial,url_evento,canonical_url,resumen,publicado,estado_validacion,retirado_en,created_at&publicado=eq.true&estado_validacion=eq.aprobado&retirado_en=is.null&order=fecha_oficial.desc',{headers,cache:'no-store',signal:AbortSignal.timeout(12000)})
    ]);
    if(!opportunities.ok||!events.ok)throw Error('HTTP '+opportunities.status+'/'+events.status);rows=await opportunities.json();eventRows=await events.json();
   }
   if(!Array.isArray(rows)||!Array.isArray(eventRows))throw Error('Respuesta de radar inválida');
   const opportunities=rows.map(r=>this.normalize(r,eventRows)).filter(x=>x.published===true);
   return {opportunities,source:'supabase',reviewedOn:String(rows[0]?.reviewed_at||rows[0]?.fecha_ultima_consulta||new Date().toISOString()).slice(0,10),notice:''};
  }catch{return fallback(true)}
 },
 async loadPublishedEvents(convocatoriaId){const data=await this.loadOpportunities();return data.opportunities.find(x=>x.id===convocatoriaId)?.events||[];}
};
