'use strict';
(()=>{
  // Etiqueta principal, única y excluyente, compartida por listado y ficha.
  const STATE_LABELS=Object.freeze({
    published:'Convocatoria publicada',
    open:'Plazo abierto',
    closed:'Plazo cerrado',
    review:'Plazo pendiente de verificar',
    lists:'Listas provisionales publicadas',
    lists_final:'Listas definitivas publicadas',
    exam:'Fecha de examen publicada',
    key:'Examen realizado / plantilla publicada',
    results:'Resultados publicados',
    finished:'Proceso finalizado',
    cancelled:'Suspendida o bases anuladas'
  });
  const APPROVED=['approved','published','publicada','validada','aprobado'];
  const EVENT_TYPES=Object.freeze({
    lista_provisional:'lists',listas_provisionales:'lists',admission_lists:'lists',lists:'lists',
    lista_definitiva:'lists_final',listas_definitivas:'lists_final',lists_definitive:'lists_final',final_lists:'lists_final',
    fecha_examen:'exam',examen:'exam',exam_scheduled:'exam',exam_date:'exam',exam:'exam',
    examen_plantilla:'key',examen_realizado:'key',exam_held:'key',plantilla:'key',key:'key',
    publicacion_resultados:'results',resultados:'results',results:'results',
    resolucion_final:'finished',finalizado:'finished',finished:'finished',
    anulacion:'cancelled',anulada:'cancelled',suspendida:'cancelled',suspension:'cancelled',cancelled:'cancelled'
  });
  const GENERIC_TYPES=new Set(['','announcement','announcement_generic','other','generic','unknown']);
  const text=v=>String(v||'').trim();
  const lower=v=>text(v).toLowerCase();
  const validDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')&&!Number.isNaN(Date.parse(v+'T12:00:00Z'));
  const safeUrl=v=>{try{return new URL(v).protocol==='https:';}catch{return false;}};
  const todayISO=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const stateLabel=state=>STATE_LABELS[state]||STATE_LABELS.published;

  function approvedItem(e){
    return !!e&&e.approved===true&&e.publicado===true&&!e.retirado_en&&!e.retiredAt&&
      (!e.publicationStatus||APPROVED.includes(lower(e.publicationStatus)));
  }
  function canonicalType(type){const k=lower(type).replace(/[\s-]+/g,'_');return EVENT_TYPES[k]||k;}
  const eventDate=e=>e?.officialPublishedOn||e?.publishedOn||e?.date||'';
  const eventUrl=e=>e?.url||e?.url_evento||e?.canonical_url||'';
  const eventTitle=e=>text(e?.title||e?.titulo_evento||e?.text);
  function sameEvent(a,b){
    if(eventDate(a)!==eventDate(b)||eventUrl(a)!==eventUrl(b))return false;
    const ta=canonicalType(a?.type||a?.tipo_evento),tb=canonicalType(b?.type||b?.tipo_evento);
    return ta===tb||GENERIC_TYPES.has(ta)||GENERIC_TYPES.has(tb);
  }
  function eventScore(e){return (e?.id?2:0)+(e?.officialPublishedOn?1:0)+Math.min(10,eventTitle(e).length/40);}
  // Un mismo anuncio oficial puede llegar como evento de BD y como hito antiguo.
  // Se conserva una sola entrada: se prefiere la que tiene identificador y texto oficial.
  function dedupeHistory(items){
    const result=[];
    for(const item of Array.isArray(items)?items:[]){
      if(!item)continue;
      const index=result.findIndex(existing=>sameEvent(existing,item));
      if(index<0){result.push(item);continue;}
      if(eventScore(item)>eventScore(result[index]))result[index]=item;
    }
    return result;
  }
  const milestoneNames=Object.freeze({
    lists:'Lista provisional de personas admitidas y excluidos',
    lists_final:'Lista definitiva de personas admitidas y excluidos',
    exam:'Fecha de examen',key:'Plantilla de respuestas',results:'Resultados',
    finished:'Resolución final',cancelled:'Anulación o suspensión'
  });
  function officialEvents(record){
    const milestones=Object.entries(record?.milestones||{}).map(([type,item])=>{
      const m=item||{};
      return {id:m.id,type:m.type||type,title:m.title||m.text||milestoneNames[type]||type,
        officialPublishedOn:m.publishedOn||m.date||null,url:m.url||m.url_evento||null,
        summary:m.summary||m.resumen||'',approved:m.approved===true,publicado:m.publicado===true,
        publicationStatus:m.publicationStatus||m.estado_validacion,retirado_en:m.retirado_en,retiredAt:m.retiredAt};
    });
    const all=[...(Array.isArray(record?.events)?record.events:[]),
      ...(Array.isArray(record?.announcements)?record.announcements:[]),...milestones];
    return dedupeHistory(all).filter(e=>approvedItem(e)&&validDate(eventDate(e))&&safeUrl(eventUrl(e))&&eventTitle(e));
  }
  function hasEvent(record,types,pattern){
    const wanted=new Set(types);
    return officialEvents(record).some(e=>{
      const type=canonicalType(e.type||e.tipo_evento);
      return wanted.has(type)||(pattern&&pattern.test(eventTitle(e)+' '+text(e.summary||e.resumen)));
    });
  }
  function verifiedCancellation(record,date=todayISO()){
    const c=record?.closure;
    if(c?.reason!=='cancelled'||!text(c.text)||!safeUrl(c.url)||!validDate(c.publishedOn)||
       c.publishedOn>date||record?.published!==true||!APPROVED.includes(lower(record?.publicationStatus)))return null;
    const official=officialEvents(record).some(e=>canonicalType(e.type||e.tipo_evento)==='incidencia'&&
      eventUrl(e)===c.url&&eventDate(e)===c.publishedOn&&/anulad|sin efectos|suspendid/i.test(eventTitle(e)));
    return official?c:null;
  }
  // Prioridad excluyente: la novedad oficial más avanzada gana, sin crear otra ficha.
  function deriveState(record,date=todayISO()){
    if(verifiedCancellation(record,date))return 'cancelled';
    const raw=lower(record?.state),status=lower(record?.processStatus||record?.estado_proceso_detalle);
    const app=lower(record?.applicationStatus||record?.estado_inscripcion);
    const last=lower(record?.lastEventType||record?.ultimo_tipo_evento);
    const start=record?.applicationsStartOn,end=record?.applicationsEndOn;

    if(raw==='cancelled'||status==='cancelled'||status==='suspended'||status==='anulada'||status==='anuladas'||
       hasEvent(record,['anulacion','suspendida','suspension','cancelled','incidencia'],/anulad|sin efectos|suspendid/i))return 'cancelled';
    if(raw==='finished'||status==='finished'||status==='finalizado'||
       hasEvent(record,['resolucion_final','finished','finalizado']))return 'finished';
    if(raw==='results'||status==='results'||status==='resultados'||
       hasEvent(record,['publicacion_resultados','resultados','results'],/resultados publicados/i))return 'results';
    if(raw==='key'||status==='key_published'||status==='exam_held'||status==='plantilla_publicada'||
       hasEvent(record,['examen_plantilla','examen_realizado','exam_held','plantilla','key'],/plantilla publicada/i))return 'key';
    if(raw==='exam'||status==='exam_scheduled'||status==='fecha_examen'||
       hasEvent(record,['fecha_examen','examen','exam_scheduled','exam_date','exam'],/fecha (del |de )?examen/i))return 'exam';
    if(raw==='lists_final'||status==='definitive_admissions'||status==='listas_definitivas'||
       hasEvent(record,['lista_definitiva','listas_definitivas','lists_definitive','final_lists'],/lista definitiva/i))return 'lists_final';
    if(raw==='lists'||status==='provisional_admissions'||last==='lista_provisional'||
       hasEvent(record,['lista_provisional','listas_provisionales','admission_lists','lists'],/lista provisional/i))return 'lists';

    if(app==='closed'||app==='cerrado'||status==='closed'||raw==='closed'||(validDate(end)&&end<date))return 'closed';
    if(raw==='open'||status==='open'){
      if(validDate(start)&&start>date)return 'published';
      if(!validDate(end))return 'review';
      if(validDate(record?.reviewBefore)&&record.reviewBefore<=date&&record.reviewBefore<end)return 'review';
      if(end<date)return 'closed';
      return 'open';
    }
    if(raw==='review')return 'review';
    if(validDate(start)&&validDate(end)&&start<=date&&date<=end)return 'open';
    return 'published';
  }
  const ADVANCED_STATES=new Set(['lists','lists_final','exam','key','results','finished']);
  function periodInfo(record,state=deriveState(record),date=todayISO()){
    const end=record?.applicationsEndOn;
    let inscription;
    if(state==='cancelled')inscription='Inscripción: sin plazo vigente derivado de unas bases anuladas o suspendidas.';
    else if(ADVANCED_STATES.has(state)||lower(record?.applicationStatus)==='closed'||lower(record?.applicationStatus)==='cerrado'||
            state==='closed'||(validDate(end)&&end<date))inscription='Inscripción: cerrada. La ficha original sigue activa para el seguimiento de las novedades oficiales.';
    else if(state==='open')inscription='Inscripción: abierta según las fechas publicadas en la fuente oficial.';
    else if(state==='review')inscription='Inscripción: pendiente de verificar en el organismo; no se presenta como abierta.';
    else inscription='Inscripción: convocatoria publicada; consulta el organismo para confirmar el plazo.';

    const candidates=[
      ...(Array.isArray(record?.events)?record.events:[]),
      ...(Array.isArray(record?.announcements)?record.announcements:[]),
      ...Object.entries(record?.milestones||{}).map(([type,m])=>({...m,type:m?.type||type,
        title:m?.title||m?.text||milestoneNames[type]||type,
        officialPublishedOn:m?.publishedOn||m?.date||null,url:m?.url||null}))
    ];
    const rectificationItem=candidates.find(e=>approvedItem(e)&&/subsanaci/i.test(
      eventTitle(e)+' '+text(e.summary||e.resumen)+' '+text(e.text||e.period)));
    const rectification=rectificationItem?('Subsanación: abierta según el anuncio oficial. '+
      text(rectificationItem.text||rectificationItem.summary||rectificationItem.resumen||eventTitle(rectificationItem))+
      ' No consta una fecha final verificada en el radar; consulta el tablón municipal.'):null;
    return {inscription,rectification};
  }

  window.OpoData={
    STATE_LABELS,stateLabel,deriveState,dedupeHistory,verifiedCancellation,periodInfo,
    normalize(record,dbEvents=[]){
      const d=record?.data&&typeof record.data==='object'?record.data:(record||{});
      const id=record?.id||d.id;
      const legacyEvents=Array.isArray(d.events)?d.events:[];
      const approvedLegacy=legacyEvents.filter(e=>approvedItem(e));
      const approvedDb=(Array.isArray(dbEvents)?dbEvents:[]).filter(e=>e?.convocatoria_id===id&&e?.publicado===true&&e?.estado_validacion==='aprobado'&&!e?.retirado_en).map(e=>({
        id:e.evento_id,opportunityId:e.convocatoria_id,type:e.tipo_evento,title:e.titulo_evento,
        officialPublishedOn:e.fecha_oficial||null,url:e.url_evento||e.canonical_url,
        summary:e.resumen||'',approved:true,publicado:true,publicationStatus:'approved'
      }));
      const events=dedupeHistory([...approvedDb,...approvedLegacy]).filter(e=>e?.id||(eventDate(e)&&eventTitle(e)));
      const base={
        ...d,
        id,slug:record?.slug||d.slug||null,
        title:d.title||d.titulo||'',organism:d.organism||d.organization||d.organismo||'',
        location:d.location||record?.municipio||d.municipio||record?.ambito||d.ambito||record?.provincia||d.provincia||'',
        municipio:record?.municipio||d.municipio||null,
        processType:d.processType||d.tipo_proceso,
        places:(()=>{const v=d.places??d.numero_plazas;if(v==null||v==='')return null;const n=Number(v);return Number.isSafeInteger(n)&&n>=0?n:null;})(),
        state:d.state||d.estado_proceso,
        processStatus:d.processStatus||d.estado_proceso_detalle||record?.process_status||null,
        applicationStatus:d.applicationStatus||d.estado_inscripcion||record?.application_status||null,
        lastEventType:d.lastEventType||d.ultimo_tipo_evento||record?.ultimo_tipo_evento||null,
        closure:d.closure||record?.closure||null,
        sourceReference:d.source_reference||record?.source_reference||null,
        expedienteOficial:d.expediente_oficial||record?.expediente_oficial||null,
        publishedOn:d.publishedOn||d.fecha_publicacion_inicial,
        boePublishedOn:d.boePublishedOn||d.fecha_publicacion_boletin||d.publishedOn||d.fecha_publicacion_inicial,
        applicationsStartOn:d.applicationsStartOn||record?.fecha_inicio_plazo||d.fecha_inicio_plazo,
        applicationsEndOn:d.applicationsEndOn||d.fecha_fin_plazo||record?.fecha_fin_plazo,
        url:d.url||record?.canonical_url||d.url_bases,
        boeUrl:d.boeUrl||d.url_bases||d.url||record?.canonical_url,
        reviewedOn:d.reviewedOn||String(record?.reviewed_at||record?.fecha_ultima_consulta||d.fecha_ultima_consulta||'').slice(0,10)||d.publishedOn||d.fecha_publicacion_inicial,
        publicationStatus:d.publicationStatus||record?.estado_validacion||d.estado_validacion,
        published:record?.published??d.publicada??true,events,
        announcements:(Array.isArray(d.announcements)?d.announcements:[]).filter(e=>approvedItem(e)),
        milestones:Object.fromEntries(Object.entries(d.milestones||{}).filter(([,e])=>e&&approvedItem(e)))
      };
      base.derivedState=deriveState(base);
      return base;
    },
    async loadOpportunities(){
      const fallback=async(reason)=>{const response=await fetch('/assets/convocatorias.json',{cache:'no-store'});if(!response.ok)throw Error('No se han podido cargar las convocatorias.');const data=await response.json();return {...data,opportunities:(data.opportunities||[]).map(x=>this.normalize(x)).filter(x=>x.published!==false&&(x.publicationStatus==null||APPROVED.includes(lower(x.publicationStatus)))),source:'respaldo',notice:reason?'Conexión al radar no disponible. Se muestra una copia de respaldo que puede estar desactualizada.':''};};
      try{
        try{await window.OpoAccountReady}catch{}
        const client=window.OpoSupabaseClient;let rows=[],eventRows=[];
        if(client){
          const opportunities=await client.from('opportunities').select('id,slug,data,published,reviewed_at,municipio,provincia,ambito,canonical_url,fecha_inicio_plazo,fecha_ultima_consulta,estado_validacion').eq('published',true).eq('estado_validacion','aprobado').order('reviewed_at',{ascending:false});
          if(opportunities.error)throw opportunities.error;rows=opportunities.data||[];
          const events=await client.from('opportunity_events').select('evento_id,convocatoria_id,tipo_evento,titulo_evento,fecha_oficial,url_evento,canonical_url,resumen,publicado,estado_validacion,retirado_en,created_at').eq('publicado',true).eq('estado_validacion','aprobado').is('retirado_en',null).order('fecha_oficial',{ascending:false});
          if(events.error)throw events.error;eventRows=events.data||[];
        }else{
          const base='https://jtyjdrrxmuppulbekfai.supabase.co/rest/v1/';const headers={apikey:'sb_publishable_-9m9ilEwGsM4tEBTVXS3FA_aRlVhNNc'};
          const [opportunities,events]=await Promise.all([
            fetch(base+'opportunities?select=id,slug,data,published,reviewed_at,municipio,provincia,ambito,canonical_url,fecha_inicio_plazo,fecha_ultima_consulta,estado_validacion&published=eq.true&estado_validacion=eq.aprobado&order=reviewed_at.desc',{headers,cache:'no-store',signal:AbortSignal.timeout(12000)}),
            fetch(base+'opportunity_events?select=evento_id,convocatoria_id,tipo_evento,titulo_evento,fecha_oficial,url_evento,canonical_url,resumen,publicado,estado_validacion,retirado_en,created_at&publicado=eq.true&estado_validacion=eq.aprobado&retirado_en=is.null&order=fecha_oficial.desc',{headers,cache:'no-store',signal:AbortSignal.timeout(12000)})
          ]);
          if(!opportunities.ok||!events.ok)throw Error('HTTP '+opportunities.status+'/'+events.status);rows=await opportunities.json();eventRows=await events.json();
        }
        if(!Array.isArray(rows)||!Array.isArray(eventRows))throw Error('Respuesta de radar inválida');
        const opportunities=rows.filter(r=>r?.published===true&&r?.estado_validacion==='aprobado').map(r=>this.normalize(r,eventRows)).filter(x=>x.published===true);
        return {opportunities,source:'supabase',reviewedOn:String(rows[0]?.reviewed_at||rows[0]?.fecha_ultima_consulta||new Date().toISOString()).slice(0,10),notice:''};
      }catch{return fallback(true)}
    },
    async loadPublishedEvents(convocatoriaId){const data=await this.loadOpportunities();return data.opportunities.find(x=>x.id===convocatoriaId)?.events||[];}
  };
  if(typeof module!=='undefined'&&module.exports)module.exports=window.OpoData;
})();
