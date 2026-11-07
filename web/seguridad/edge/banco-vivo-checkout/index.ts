// Banco Vivo Stripe TEST · BORRADOR NO DESPLEGADO.
// Producto TEST preexistente inactivo. Precio y vigencia SIN APROBAR.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import{createClient}from"npm:@supabase/supabase-js@2";
const origins=new Set(["https://web-oporadarcadiz.netlify.app","https://tema-1-parte-1.netlify.app","https://oporadarcadiz.github.io"]);
function reply(status:number,origin:string,data:Record<string,unknown>){
 const h:Record<string,string>={"content-type":"application/json","cache-control":"no-store"};
 if(origins.has(origin)){h["access-control-allow-origin"]=origin;h.vary="Origin";}
 return new Response(JSON.stringify(data),{status,headers:h});
}
function otpFresh(jwt:string,uid:string){
 try{
 const raw=jwt.split(".")[1];if(!raw)return false;
 const b64=raw.replace(/-/g,"+").replace(/_/g,"/");
 const bytes=Uint8Array.from(atob(b64.padEnd(Math.ceil(b64.length/4)*4,"=")),c=>c.charCodeAt(0));
 const c=JSON.parse(new TextDecoder().decode(bytes)),now=Math.floor(Date.now()/1000);
 return c.sub===uid&&!!c.session_id&&c.role==="authenticated"&&
 Array.isArray(c.amr)&&c.amr.some((m:{method?:string;timestamp?:number})=>
 m.method==="otp"&&typeof m.timestamp==="number"&&m.timestamp<=now+60&&now-m.timestamp<=8*3600);
 }catch{return false;}
}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return origins.has(origin)?new Response(null,{status:204,headers:{
 "access-control-allow-origin":origin,"access-control-allow-headers":"authorization,apikey,content-type",
 "access-control-allow-methods":"POST,OPTIONS",vary:"Origin"}}):new Response(null,{status:403});
 if(req.method!=="POST")return reply(405,origin,{error:"Método no permitido"});
 if(!origins.has(origin))return reply(403,origin,{error:"Origen prohibido"});
 const jwt=req.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
 if(!jwt)return reply(401,origin,{error:"OTP requerido"});
 const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!key)return reply(503,origin,{error:"Servicio sin configurar"});
 const sb=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
 const {data:{user},error}=await sb.auth.getUser(jwt);
 if(error||!user||user.is_anonymous||!user.email_confirmed_at||!otpFresh(jwt,user.id))
 return reply(401,origin,{error:"Código OTP caducado o sesión no válida"});
 const sk=Deno.env.get("BANK_STRIPE_TEST_SECRET")||"";
 const price=Deno.env.get("BANK_STRIPE_TEST_PRICE_ID")||"";
 if(!sk.startsWith("sk_test_")||!/^price_[A-Za-z0-9]+$/.test(price)
 ||Deno.env.get("BANK_TERMS_APPROVED")!=="true"||
 Deno.env.get("BANK_CATALOG_READY")!=="true")
 return reply(503,origin,{error:"Checkout TEST aún no autorizado"});
 const p=new URLSearchParams();
 p.set("mode","payment");p.set("line_items[0][price]",price);p.set("line_items[0][quantity]","1");
 p.set("client_reference_id",user.id);p.set("customer_email",user.email||"");
 p.set("metadata[product_code]","banco_vivo");
 p.set("success_url",origin+"/acceso-premium.html?checkout=prueba&session_id={CHECKOUT_SESSION_ID}");
 p.set("cancel_url",origin+"/banco-vivo.html");
 const out=await fetch("https://api.stripe.com/v1/checkout/sessions",{
 method:"POST",headers:{"authorization":"Bearer "+sk,"content-type":"application/x-www-form-urlencoded"},
 body:p.toString()}).catch(()=>null);
 if(!out?.ok)return reply(503,origin,{error:"Stripe TEST no disponible"});
 const session=await out.json().catch(()=>null);
 if(!session?.url?.startsWith("https://checkout.stripe.com/")||session.livemode!==false||session.mode!=="payment")
 return reply(503,origin,{error:"Sesión de checkout inválida"});
 return reply(200,origin,{url:session.url,test_mode:true});
});
