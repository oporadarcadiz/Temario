// BORRADOR M-084: catálogo público agregado, sin preguntas ni claves.
// NO DESPLEGAR hasta revisión de seguridad, configuración y autorización.
// Supabase Edge Functions: al desplegar, verify_jwt=false SOLO para ESTA función
// de contador anónimo. Las funciones que entregan preguntas exigirán JWT.
const ALLOWED_ORIGINS=new Set([
  'https://oporadarcadiz.github.io',
  'https://web-oporadarcadiz.netlify.app',
  'https://oporadar-cadiz.rosidekai.chatgpt.site'
]);
function reply(origin:string,status:number,data:Record<string,unknown>){
  const headers:Record<string,string>={
    'content-type':'application/json; charset=utf-8',
    'x-content-type-options':'nosniff',
    'cache-control':'public,max-age=60,s-maxage=120',
    'vary':'Origin'
  };
  if(ALLOWED_ORIGINS.has(origin))headers['access-control-allow-origin']=origin;
  return new Response(JSON.stringify(data),{status,headers});
}
Deno.serve(async req=>{
  const origin=req.headers.get('origin')||'';
  if(origin&&!ALLOWED_ORIGINS.has(origin))return reply('',403,{error:'Origen no autorizado'});
  if(req.method==='OPTIONS'){
    return new Response(null,{status:204,headers:{
      'access-control-allow-origin':origin,'access-control-allow-methods':'GET,OPTIONS',
      'access-control-allow-headers':'accept,content-type','vary':'Origin'
    }});
  }
  if(req.method!=='GET')return reply(origin,405,{error:'Método no permitido'});
  const base=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!base||!key)return reply(origin,503,{error:'Catálogo no configurado'});
  // PostgREST HEAD + count=exact devuelve sólo el número; no retorna filas.
  // La tabla published_questions ya está restringida a route aux/sub y
  // verificación VERIFICADA/VERIFICADA_RESERVA por sus CHECK del esquema actual.
  // 1.939 filas del banco maestro SIN_CLASIFICAR no se suman nunca.
  try{
    const url=new URL('/rest/v1/published_questions',base);
    url.searchParams.set('select','id');
    url.searchParams.set('route','in.(aux,sub)');
    url.searchParams.set('verification_status','in.(VERIFICADA,VERIFICADA_RESERVA,DOCUMENTAL_REVISADA)');
    const upstream=await fetch(url.toString(),{
      method:'HEAD',
      headers:{'apikey':key,'authorization':`Bearer ${key}`,'prefer':'count=exact'}
    });
    if(!upstream.ok)return reply(origin,503,{error:'Catálogo temporalmente no disponible'});
    const header=upstream.headers.get('content-range')||'';
    const match=header.match(/\/(\d+)$/);
    if(!match)return reply(origin,503,{error:'Sin recuento validado'});
    const count=Number(match[1]);
    if(!Number.isSafeInteger(count)||count<0)return reply(origin,503,{error:'Recuento inválido'});
    // Resumen de facetas agregado por organismo, convocatoria, año y materia.
    // La RPC sólo está disponible para service_role y nunca retorna preguntas,
    // opciones ni claves; si aún no existe, el contador sigue siendo válido.
    let facets:Record<string,unknown>[]=[];
    let facets_ready=false;
    try{
      const facetURL=new URL('/rest/v1/rpc/banco_vivo_facetas_publicas',base);
      const facetResponse=await fetch(facetURL.toString(),{
        method:'POST',
        headers:{'apikey':key,'authorization':`Bearer ${key}`,
          'content-type':'application/json','accept':'application/json'},
        body:'{}'
      });
      if(facetResponse.ok){
        const raw=await facetResponse.json();
        if(Array.isArray(raw)){
          facets=raw.slice(0,1000).filter(x=>x&&typeof x==='object'
            &&Number.isSafeInteger(Number(x.questions))&&Number(x.questions)>0)
            .map(x=>({
              route:String(x.route||''),organism:String(x.organism||''),
              exam:String(x.exam||''),exam_year:x.exam_year??null,
              subject:String(x.subject||'Pendiente de materia'),
              publication_mode:String(x.publication_mode||'documental'),
              questions:Number(x.questions)
            }));
          facets_ready=true;
        }
      }
    }catch{facets_ready=false;}
    return reply(origin,200,{
      count,facets,facets_ready,source:'published_questions',catalog_published:true,
      checkout_enabled:false,checked_at:new Date().toISOString()
    });
  }catch(_){return reply(origin,503,{error:'Servicio temporalmente no disponible'});}
});
