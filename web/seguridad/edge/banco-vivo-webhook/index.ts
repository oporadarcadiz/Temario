// Banco Vivo · WEBHOOK STRIPE TEST · BORRADOR NO DESPLEGADO.
// Al desplegar: verify_jwt=false SOLO AQUI; autorizar exclusivamente con
// Stripe-Signature validada contra el CUERPO RAW. Nunca confiar en success_url.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import{createClient}from"npm:@supabase/supabase-js@2";
const PRODUCT="prod_VZcwkmYtZiCkzF";
const encoder=new TextEncoder();
function reply(status:number,body:Record<string,unknown>){
 return new Response(JSON.stringify(body),{status,headers:{
 "content-type":"application/json","cache-control":"no-store","x-content-type-options":"nosniff"}});
}
function eqHex(a:string,b:string){
 if(!/^[0-9a-f]{64}$/i.test(a)||!/^[0-9a-f]{64}$/i.test(b))return false;
 let diff=0;for(let i=0;i<64;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;
}
async function verified(raw:string,header:string,secret:string){
 const entries=header.split(",").map(x=>x.trim().split("="));
 const stamps=entries.filter(x=>x[0]==="t");
 const signs=entries.filter(x=>x[0]==="v1").map(x=>x[1]);
 const t=Number(stamps[0]?.[1]);
 if(stamps.length!==1||!Number.isSafeInteger(t)||Math.abs(Math.floor(Date.now()/1000)-t)>300||!signs.length)return false;
 const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const mac=await crypto.subtle.sign("HMAC",key,encoder.encode(String(t)+"."+raw));
 const digest=[...new Uint8Array(mac)].map(b=>b.toString(16).padStart(2,"0")).join("");
 return signs.some(s=>eqHex(digest,s));
}
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return reply(405,{error:"Método no permitido"});
 const sk=Deno.env.get("BANK_STRIPE_TEST_SECRET")||"";
 const whsec=Deno.env.get("BANK_STRIPE_TEST_WEBHOOK_SECRET")||"";
 const price=Deno.env.get("BANK_STRIPE_TEST_PRICE_ID")||"";
 const days=Number(Deno.env.get("BANK_ENTITLEMENT_DAYS")||0);
 if(!sk.startsWith("sk_test_")||!whsec.startsWith("whsec_")||
    !/^price_[A-Za-z0-9]+$/.test(price)||!Number.isSafeInteger(days)||days<1||days>365||
    Deno.env.get("BANK_TERMS_APPROVED")!=="true")
  return reply(503,{error:"Webhook TEST pendiente de configuración comercial"});
 const raw=await req.text();
 const signature=req.headers.get("stripe-signature")||"";
 if(raw.length>1048576||!await verified(raw,signature,whsec))
  return reply(400,{error:"Firma Stripe no válida"});
 let event:any;
 try{event=JSON.parse(raw)}catch{return reply(400,{error:"Evento inválido"});}
 if(event?.livemode!==false)return reply(400,{error:"No aceptar eventos LIVE"});
 if(!["checkout.session.completed","checkout.session.async_payment_succeeded"].includes(event.type))
  return reply(200,{received:true,ignored:true});
 const session=event.data?.object;
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 if(!/^evt_[A-Za-z0-9]+$/.test(event.id||"")||
    !/^cs_test_[A-Za-z0-9]+$/.test(session?.id||"")||
    session?.livemode!==false||session.mode!=="payment"||
    session.payment_status!=="paid"||
    session.metadata?.product_code!=="banco_vivo"||
    !uuid.test(session.client_reference_id||""))
  return reply(400,{error:"Pago TEST no verificable"});
 // No confiar en price, cantidad ni pago enviados desde navegador/webhook
 // hasta consultarlos nuevamente en Stripe TEST por API autenticada.
 const lookup=await fetch("https://api.stripe.com/v1/checkout/sessions/"+
   encodeURIComponent(session.id)+"/line_items?limit=5",{
   headers:{authorization:"Bearer "+sk}
 }).catch(()=>null);
 if(!lookup?.ok)return reply(503,{error:"No se pudieron comprobar las líneas de pago"});
 const detail=await lookup.json().catch(()=>null),items=detail?.data;
 const line=Array.isArray(items)&&items.length===1?items[0]:null;
 if(!line||line.quantity!==1||line.price?.id!==price||
    line.price?.product!==PRODUCT)
  return reply(400,{error:"Producto o precio incorrectos"});
 const url=Deno.env.get("SUPABASE_URL"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!service)return reply(503,{error:"Supabase no configurado"});
 const admin=createClient(url,service,{auth:{autoRefreshToken:false,persistSession:false}});
 const {error}=await admin.rpc("banco_vivo_registrar_pago_test",{
  p_event_id:event.id,p_session_id:session.id,p_price_id:price,
  p_user_id:session.client_reference_id,p_days:days
 });
 if(error)return reply(503,{error:"No se pudo registrar el permiso; Stripe reintentará"});
 return reply(200,{received:true,test_mode:true});
});
