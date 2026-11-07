// M-048/M-083 · BORRADOR NO DESPLEGADO
// Reemplaza EN CONJUNTO con la migración 20261107_amazon_ediciones_ACCESO_NO_APLICAR.sql.
// Conserva el panel administrativo existente y el correo del proyecto;
// jamás acredita la compra por un número con formato válido solamente.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2";
const origins=new Set([
 "https://web-oporadarcadiz.netlify.app",
 "https://tema-1-parte-1.netlify.app"
]);
const ADMIN_EMAIL="oporadarcadiz@gmail.com";
function response(status:number,origin:string,payload:Record<string,unknown>){
 const headers:Record<string,string>={"content-type":"application/json; charset=utf-8",
 "cache-control":"private, no-store, max-age=0","x-content-type-options":"nosniff"};
 if(origins.has(origin)){headers["access-control-allow-origin"]=origin;headers.vary="Origin";}
 return new Response(JSON.stringify(payload),{status,headers});
}
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS"){
  if(!origins.has(origin))return new Response(null,{status:403});
  return new Response(null,{status:204,headers:{"access-control-allow-origin":origin,
   "access-control-allow-methods":"GET,POST,OPTIONS",
   "access-control-allow-headers":"authorization,apikey,content-type,x-client-info",
   vary:"Origin"}});
 }
 if(!["GET","POST"].includes(req.method))return response(405,origin,{error:"Método no permitido"});
 const jwt=req.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
 if(!jwt)return response(401,origin,{error:"Sesión requerida"});
 const url=Deno.env.get("SUPABASE_URL"),secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!secret)return response(503,origin,{error:"Administración pendiente de configuración"});
 const admin=createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
 const {data:{user},error:authError}=await admin.auth.getUser(jwt);
 if(authError||!user||user.email?.toLowerCase()!==ADMIN_EMAIL||!user.email_confirmed_at)
   return response(403,origin,{error:"Acceso administrativo denegado"});
 if(req.method==="GET"){
  const {data,error}=await admin.from("tema1_order_claims")
   .select("id,user_id,channel,order_reference,status,product_edition,asin,submitted_at,reviewed_at,reviewer_note")
   .order("submitted_at",{ascending:false}).limit(50);
  if(error)return response(503,origin,{error:"Solicitudes no disponibles"});
  return response(200,origin,{claims:data||[]});
 }
 const body=await req.json().catch(()=>null);
 const id=typeof body?.id==="string"?body.id:"";
 const action=body?.action;
 const note=typeof body?.note==="string"?body.note.trim():"";
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)||
    !["approve","reject"].includes(action)||note.length<15||note.length>400)
   return response(400,origin,{error:"Solicitud o comprobación administrativa inválida"});
 if(action==="reject"){
  const {error}=await admin.rpc("tema1_reject_claim",{p_claim_id:id,p_review_note:note});
  return error?response(409,origin,{error:"No se pudo rechazar solicitud"}):response(200,origin,{ok:true,status:"rejected"});
 }
 const {data:claim,error:claimError}=await admin.from("tema1_order_claims")
  .select("id,status,channel,product_edition").eq("id",id).maybeSingle();
 if(claimError||!claim||claim.status!=="pending"||claim.channel!=="amazon")
   return response(409,origin,{error:"Pedido no pendiente o edición no configurada"});
 const edition=claim.product_edition;
 const allowed:Record<string,string>={
  tema1_individual:Deno.env.get("TEMA1_KDP_ASIN_INDIVIDUAL")||"",
  general_10_temas:Deno.env.get("TEMA1_KDP_ASIN_GENERAL")||""
 };
 const asin=typeof body?.verified_asin==="string"?body.verified_asin.trim().toUpperCase():"";
 if(!Object.prototype.hasOwnProperty.call(allowed,edition)||!allowed[edition]||allowed[edition]!==asin)
   return response(403,origin,{error:"ASIN físico de edición no coincide con catálogo KDP aprobado"});
 // El administrador debe cotejar fuera del sistema la prueba real de compra
 // Amazon antes de confirmar; esta función no tiene acceso a pedidos de Amazon.
 // La referencia, email o nota por sí solos NO prueban una compra.
 const {error}=await admin.rpc("tema1_approve_claim_v2",{
  p_claim_id:id,p_verified_asin:asin,p_review_note:note
 });
 return error?response(409,origin,{error:"No se pudo aprobar: verificar pedido y versión de base de datos"})
 :response(200,origin,{ok:true,status:"verified",product_edition:edition});
});
