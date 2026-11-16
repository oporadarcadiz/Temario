import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
const allowedOrigins=new Set([
  "https://tema-1-parte-1.netlify.app",
  "https://web-oporadarcadiz.netlify.app",
  "https://oporadarcadiz.github.io"
]);
const adminEmail="oporadarcadiz@gmail.com";
function reply(body:Record<string,unknown>,status=200,origin=""){
  const cors=allowedOrigins.has(origin)?{"Access-Control-Allow-Origin":origin,"Vary":"Origin"}:{};
  return new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",...cors}});
}
Deno.serve(async(req)=>{
  const origin=req.headers.get("origin")||"";
  if(req.method==="OPTIONS"){
    if(!allowedOrigins.has(origin))return new Response(null,{status:403});
    return new Response(null,{status:204,headers:{
      "Access-Control-Allow-Origin":origin,
      "Access-Control-Allow-Methods":"GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
      "Access-Control-Max-Age":"600","Vary":"Origin"
    }});
  }
  if(!["GET","POST"].includes(req.method))return reply({error:"Método no permitido"},405,origin);
  const token=(req.headers.get("authorization")||"").match(/^Bearer\s+([^\s]+)$/i)?.[1];
  if(!token)return reply({error:"Identificación requerida"},401,origin);
  const url=Deno.env.get("SUPABASE_URL"),secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!secret)return reply({error:"Configuración del servidor incompleta"},500,origin);
  const admin=createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:{user},error:authError}=await admin.auth.getUser(token);
  if(authError||!user)return reply({error:"Sesión no válida"},401,origin);
  if(user.email?.toLowerCase()!==adminEmail||!user.email_confirmed_at)
    return reply({error:"Cuenta sin autorización administrativa"},403,origin);
  try{
    if(req.method==="GET"){
      const {data,error}=await admin.from("tema1_order_claims")
        .select("id,user_id,channel,order_reference,status,submitted_at,reviewed_at,reviewer_note")
        .order("submitted_at",{ascending:false}).limit(50);
      if(error)throw error;
      const claims=await Promise.all((data||[]).map(async item=>{
        const r=await admin.auth.admin.getUserById(item.user_id);
        return {...item,buyer_email:r.data.user?.email||null};
      }));
      return reply({claims},200,origin);
    }
    const body=await req.json().catch(()=>null);
    const id=typeof body?.id==="string"?body.id:"";
    const action=body?.action;
    const note=typeof body?.note==="string"?body.note.trim():"";
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))
      return reply({error:"Identificador de solicitud no válido"},400,origin);
    if(!["approve","reject"].includes(action)||note.length<8||note.length>400)
      return reply({error:"Indica aprobar/rechazar y el motivo comprobado (8-400 caracteres)"},400,origin);
    const rpc=action==="approve"?"tema1_approve_claim":"tema1_reject_claim";
    const {error}=await admin.rpc(rpc,{p_claim_id:id,p_review_note:note});
    if(error)return reply({error:"No se pudo revisar la solicitud. Comprueba que siga pendiente."},409,origin);
    return reply({ok:true,status:action==="approve"?"verified":"rejected"},200,origin);
  }catch(e){
    return reply({error:"Error temporal del sistema de revisión"},500,origin);
  }
});