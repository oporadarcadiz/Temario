'use strict';
window.OpoData={
  async loadOpportunities(){
    const fallback=async()=>{const response=await fetch('/assets/convocatorias.json',{cache:'no-store'});if(!response.ok)throw Error('No se han podido cargar las convocatorias.');return response.json();};
    try{
      await window.OpoAccountReady;
      const client=window.OpoSupabaseClient;
      if(!client)return fallback();
      const {data,error}=await client.from('opportunities').select('data,reviewed_at').eq('published',true).order('reviewed_at',{ascending:false});
      if(error||!data?.length)return fallback();
      const opportunities=data.map(row=>row.data).filter(value=>value&&typeof value==='object');
      if(!opportunities.length)return fallback();
      return {reviewedOn:data[0].reviewed_at,opportunities};
    }catch{return fallback();}
  }
};
