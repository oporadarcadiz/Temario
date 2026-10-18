'use strict';
window.OpoData={
 normalize(r){
  const d=r.data&&typeof r.data==='object'?r.data:r;
  return {...d,id:r.id||d.id,slug:r.slug||d.slug||null,title:d.title||d.titulo,organism:d.organism||d.organismo,
   location:d.location||d.municipio||d.ambito||d.provincia||'',municipio:d.municipio||null,
   processType:d.processType||d.tipo_proceso,places:d.places??d.numero_plazas,state:d.state||d.estado_proceso,
   publishedOn:d.publishedOn||d.fecha_publicacion_inicial,applicationsEndOn:d.applicationsEndOn||d.fecha_fin_plazo,
   url:d.url||d.url_bases,boeUrl:d.boeUrl||d.url_bases,
   reviewedOn:d.reviewedOn||r.reviewed_at||d.fecha_ultima_consulta?.slice(0,10)||d.publishedOn,
   publicationStatus:d.publicationStatus||d.estado_validacion,
   published:r.published??d.publicada??true,
   events:Array.isArray(d.events)?d.events:[]};
 },
 async loadOpportunities(){
  const fallback=async(reason)=>{
   const response=await fetch('/assets/convocatorias.json',{cache:'no-store'});
   if(!response.ok)throw Error('No se han podido cargar las convocatorias.');
   const data=await response.json();
   return {...data,opportunities:(data.opportunities||[]).map(x=>this.normalize(x)).filter(x=>x.published!==false),source:'respaldo',notice:reason?'Conexión al radar no disponible. Se muestra una copia de respaldo que puede estar desactualizada.':''};
  };
  try{
   try{await window.OpoAccountReady}catch{}
   const client=window.OpoSupabaseClient;let rows;
   if(client){const result=await client.from('opportunities').select('id,data,published,reviewed_at').eq('published',true);if(result.error)throw result.error;rows=result.data||[]}
   else{
    const response=await fetch('https://jtyjdrrxmuppulbekfai.supabase.co/rest/v1/opportunities?select=id,data,published,reviewed_at&published=eq.true',{headers:{apikey:'sb_publishable_-9m9ilEwGsM4tEBTVXS3FA_aRlVhNNc'},cache:'no-store',signal:AbortSignal.timeout(12000)});
    if(!response.ok)throw Error('HTTP '+response.status);rows=await response.json();
   }
   if(!Array.isArray(rows))throw Error('Respuesta de radar inválida');
   // Compatibilidad: antes de ejecutar SQL la columna slug no existe. Usar consulta antigua, sin degradar validación editorial.
   const opportunities=rows.map(r=>this.normalize(r)).filter(x=>x.published===true);
   return {opportunities,source:'supabase',reviewedOn:rows[0]?.reviewed_at?.slice(0,10)||new Date().toISOString().slice(0,10),notice:''};
  }catch{return fallback(true)}
 },
 async loadPublishedEvents(convocatoriaId){
  // Requiere tabla migrada y política RLS. Si no existe, continuar con anuncios legacy.
  const client=window.OpoSupabaseClient;if(!client)return [];
  try{const {data,error}=await client.from('opportunity_events').select('evento_id,convocatoria_id,tipo_evento,titulo_evento,fecha_oficial,url_evento,resumen,publicado,estado_validacion').eq('convocatoria_id',convocatoriaId).eq('publicado',true).eq('estado_validacion','aprobado').order('fecha_oficial',{ascending:false});if(error)return [];return (data||[]).map(e=>({id:e.evento_id,opportunityId:e.convocatoria_id,type:e.tipo_evento,title:e.titulo_evento,officialPublishedOn:e.fecha_oficial,url:e.url_evento,approved:true,publicationStatus:'approved'}))}
  catch{return []}
 }
};