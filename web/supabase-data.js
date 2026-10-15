'use strict';
window.OpoData={
  async loadOpportunities(){
    const fallback=async(reason)=>{
      const response=await fetch('/assets/convocatorias.json',{cache:'no-store'});
      if(!response.ok)throw Error('No se han podido cargar las convocatorias.');
      const data=await response.json();
      return {...data,notice:reason?'Conexión al radar no disponible. Se muestra la copia de respaldo; puede no incluir las últimas novedades.':'',source:'respaldo'};
    };
    try{
      try{await window.OpoAccountReady;}catch{}
      const client=window.OpoSupabaseClient;
      let rows;
      if(client){
        const result=await client.from('opportunities').select('data,reviewed_at').eq('published',true).order('reviewed_at',{ascending:false});
        if(result.error)throw result.error;
        rows=result.data||[];
      }else{
        const response=await fetch('https://jtyjdrrxmuppulbekfai.supabase.co/rest/v1/opportunities?select=data,reviewed_at&published=eq.true&order=reviewed_at.desc',{
          headers:{apikey:'sb_publishable_-9m9ilEwGsM4tEBTVXS3FA_aRlVhNNc'},
          cache:'no-store',signal:AbortSignal.timeout(12000)
        });
        if(!response.ok)throw Error('HTTP '+response.status);
        rows=await response.json();
      }
      if(!Array.isArray(rows))throw Error('Respuesta de radar inválida');
      const opportunities=rows.map(row=>row.data).filter(value=>value&&typeof value==='object');
      if(rows.length&&opportunities.length!==rows.length)throw Error('Registros de radar inválidos');
      return {reviewedOn:rows[0]?.reviewed_at?.slice(0,10)||new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid'}).format(new Date()),opportunities,source:'supabase',notice:opportunities.length?'':'No hay convocatorias publicadas en la base de datos.'};
    }catch{return fallback(true);}
  }
};
