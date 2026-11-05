// M-083 · BORRADOR INERTE, NO DESPLEGAR: sustituir la actual
// tema1-games-access solo después de auditoría de RLS, Amazon/ASIN y datos privados.
// No modifica, duplica ni contiene preguntas de ninguno de los nueve juegos.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2";

const ORIGINS=new Set([
  "https://oporadarcadiz.github.io",
  "https://web-oporadarcadiz.netlify.app",
  "https://tema-1-parte-1.netlify.app"
]);
const BUCKET="tema1-premium";
const TTL_SECONDS=60;
const RESOURCES:Record<string,string|null>=Object.freeze({
  "articulo-imagen":"juegos/tema-1/articulo-imagen-extra.json",
  "mapa-constitucional":"juegos/tema-1/mapa-constitucional-extra.json",
  "fichas-radar":"juegos/tema-1/fichas-radar-extra.json",
  "vocabulario-juridico":"juegos/tema-1/vocabulario-juridico-extra.json",
  "candado-4911":"juegos/tema-1/candado-4911-extra.json",
  "caza-trampa":"juegos/tema-1/caza-trampa-extra.json",
  "completa-frase":"juegos/tema-1/completa-frase-extra.json",
  "test-radar":"juegos/tema-1/test-radar-extra.json",
  "simulacro-final":null // No contiene un lote fijo: futuro sorteo 40/120 en servidor
});
// Solo rutas de CONTENIDO ADICIONAL privado: el código del juego y sus demos
// pueden seguir públicos, pero nunca las preguntas/soluciones reservadas.
function reply(status:number,origin:string,payload:Record<string,unknown>){
  const headers:Record<string,string>={
    "content-type":"application/json; charset=utf-8",
    "cache-control":"private, no-store, max-age=0",
    "referrer-policy":"no-referrer",
    "x-content-type-options":"nosniff"
  };
  if(ORIGINS.has(origin)){headers["access-control-allow-origin"]=origin;headers["vary"]="Origin";}
  return new Response(JSON.stringify(payload),{status,headers});
}
function configuredApproval(slug:string,edition:string,asin:string){
  // La tabla actual NO tiene product_edition ni asin. Mientras no exista
  // una migración respaldada y aprobada, el SELECT falla y no entrega URL.
  const expected={
    tema1_individual:Deno.env.get("TEMA1_KDP_ASIN_INDIVIDUAL")||"",
    general_10_temas:Deno.env.get("TEMA1_KDP_ASIN_GENERAL")||""
  }[edition];
  if(!expected||asin!==expected)return false;
  // La autorización editorial y el derecho por edición SON POR RECURSO.
  // No permitir que el Test Final impida habilitar otros 8 cuando estén listos.
  if(Deno.env.get("TEMA1_GAMES_PUBLIC_COPIES_REMOVED")!=="true")return false;
  if(Deno.env.get("TEMA1_GAME_READY_"+slug.toUpperCase().replace(/-/g,"_"))!=="true")return false;
  try{
    const policy=JSON.parse(Deno.env.get("TEMA1_APPROVED_EDITION_GAME_SCOPES_JSON")||"{}");
    return Array.isArray(policy[edition])&&policy[edition].includes(slug);
  }catch{return false;}
}
// admin.auth.getUser(jwt) must succeed before inspecting these signed claims.
function recentOtpJwt(jwt:string,userId:string):boolean{
  try{
    const base=jwt.split(".")[1];if(!base)return false;
    const normalized=base.replace(/-/g,"+").replace(/_/g,"/");
    const bytes=Uint8Array.from(atob(normalized.padEnd(Math.ceil(normalized.length/4)*4,"=")),c=>c.charCodeAt(0));
    const claims=JSON.parse(new TextDecoder().decode(bytes));
    if(claims.sub!==userId||!claims.session_id||claims.role!=="authenticated")return false;
    const now=Math.floor(Date.now()/1000),amr=Array.isArray(claims.amr)?claims.amr:[];
    return amr.some((m:{method?:string;timestamp?:number})=>
      m.method==="otp" && typeof m.timestamp==="number" &&
      m.timestamp<=now+60 && now-m.timestamp<=8*3600
    );
  }catch{return false;}
}

Deno.serve(async req=>{
  const origin=req.headers.get("origin")||"";
  if(req.method==="OPTIONS"){
    if(!ORIGINS.has(origin))return new Response(null,{status:403});
    return new Response(null,{status:204,headers:{
      "access-control-allow-origin":origin,
      "access-control-allow-headers":"authorization,apikey,x-client-info,content-type",
      "access-control-allow-methods":"GET,OPTIONS","vary":"Origin"
    }});
  }
  if(req.method!=="GET")return reply(405,origin,{allowed:false,error:"Método no permitido"});
  const slug=new URL(req.url).searchParams.get("resource")||"";
  if(!Object.prototype.hasOwnProperty.call(RESOURCES,slug))
    return reply(400,origin,{allowed:false,error:"Actividad desconocida"});
  const jwt=req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if(!jwt)return reply(401,origin,{allowed:false,error:"Sesión prémium requerida"});

  const url=Deno.env.get("SUPABASE_URL"),serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!serviceKey)return reply(503,origin,{allowed:false,content_ready:false,error:"Servicio no configurado"});
  const admin=createClient(url,serviceKey,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:{user},error:authError}=await admin.auth.getUser(jwt);
  if(authError||!user||user.is_anonymous)return reply(401,origin,{allowed:false,error:"Identidad inválida"});
  if(!recentOtpJwt(jwt,user.id))return reply(401,origin,{allowed:false,content_ready:false,error:"Se requiere un código OTP reciente"});

  const {data:grant,error:grantError}=await admin.from("tema1_access")
    .select("active,expires_at,source_claim_id").eq("user_id",user.id).maybeSingle();
  if(grantError)return reply(503,origin,{allowed:false,content_ready:false,error:"Autorización no disponible"});
  if(!grant?.active||(grant.expires_at&&!(Date.parse(grant.expires_at)>Date.now()))||!grant.source_claim_id)
    return reply(403,origin,{allowed:false,content_ready:false,error:"Sin permiso válido"});

  // Estas columnas requieren una migración APROBADA que todavía no existe.
  // Fail-closed ante esquema ausente, error de consulta, edición errónea
  // o autorización por pedido no comprobado manualmente.
  const {data:claim,error:claimError}=await admin.from("tema1_order_claims")
    .select("id,user_id,channel,status,product_edition,asin")
    .eq("id",grant.source_claim_id).eq("user_id",user.id).maybeSingle();
  if(claimError)return reply(503,origin,{allowed:false,content_ready:false,error:"Edición sin configurar"});
  if(!claim||claim.channel!=="amazon"||claim.status!=="verified")
    return reply(403,origin,{allowed:false,content_ready:false,error:"Pedido no validado"});
  if(!configuredApproval(slug,claim.product_edition,claim.asin))
    return reply(403,origin,{allowed:false,content_ready:false,error:"Recurso no autorizado para la edición"});

  const privatePath=RESOURCES[slug];
  // El simulacro NO es un archivo estático de 40 preguntas: requiere 40 aleatorias
  // sin reemplazo tomadas del banco autorizado de 120, en el servidor.
  // No desbloquearlo con una bandera hasta implementar y probar el sorteo.
  if(!privatePath)return reply(503,origin,{allowed:false,content_ready:false,error:"Simulacro pendiente de certificación y sorteo seguro"});
  const {data:signed,error:storageError}=await admin.storage.from(BUCKET).createSignedUrl(privatePath,TTL_SECONDS);
  if(storageError||!signed?.signedUrl)return reply(503,origin,{allowed:false,content_ready:false,error:"Contenido no disponible"});
  return reply(200,origin,{allowed:true,content_ready:true,resource:slug,url:signed.signedUrl,expires_in_seconds:TTL_SECONDS});
});
