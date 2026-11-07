// M-048 / M-083 · BORRADOR INERTE. NO DESPLEGAR SIN AUTORIZACIÓN EDITORIAL Y DE SEGURIDAD.
// Extiende el patrón de tema1-premium-video; no contiene PDFs, claves ni preguntas.
// Requiere que los PDF aprobados se suban al bucket PRIVADO tema1-premium,
// se retiren de GitHub Pages y se verifique su inaccesibilidad sin autorización.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const ORIGINS = new Set([
  "https://oporadarcadiz.github.io",
  "https://web-oporadarcadiz.netlify.app",
  "https://tema-1-parte-1.netlify.app",
  "https://oporadar-cadiz.rosidekai.chatgpt.site",
]);
const BUCKET = "tema1-premium";
const FILES: Record<string, string> = Object.freeze({
  "1": "saber-mas/parte-1.pdf",
  "2": "saber-mas/parte-2.pdf",
  "3": "saber-mas/parte-3.pdf",
});
const TTL_SECONDS = 60;

function reply(status: number, payload: Record<string, unknown>, origin: string): Response {
  const headers: Record<string, string> = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "private, no-store, max-age=0",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
  };
  if (ORIGINS.has(origin)) {
    headers["access-control-allow-origin"] = origin;
    headers["vary"] = "Origin";
  }
  return new Response(JSON.stringify(payload), { status, headers });
}

// admin.auth.getUser(token) must validate the JWT before these claims are inspected.
function recentOtpJwt(jwt: string, userId: string): boolean {
  try {
    const raw=jwt.split(".")[1]; if (!raw) return false;
    const base=raw.replace(/-/g,"+").replace(/_/g,"/");
    const bytes=Uint8Array.from(atob(base.padEnd(Math.ceil(base.length/4)*4,"=")),c=>c.charCodeAt(0));
    const claims=JSON.parse(new TextDecoder().decode(bytes));
    if (claims.sub!==userId || !claims.session_id || claims.role!=="authenticated") return false;
    const now=Math.floor(Date.now()/1000), amr=Array.isArray(claims.amr)?claims.amr:[];
    return amr.some((m:{method?:string; timestamp?:number})=>
      m.method==="otp" && typeof m.timestamp==="number" &&
      m.timestamp<=now+60 && now-m.timestamp<=8*3600
    );
  } catch { return false; }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  if (req.method === "OPTIONS") {
    if (!ORIGINS.has(origin)) return new Response(null, { status: 403 });
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": origin,
        "access-control-allow-headers": "authorization,apikey,content-type,x-client-info",
        "access-control-allow-methods": "GET,OPTIONS",
        "vary": "Origin",
      },
    });
  }
  if (req.method !== "GET") return reply(405, { allowed: false, ready: false }, origin);

  const part = new URL(req.url).searchParams.get("part");
  if (!part || !Object.prototype.hasOwnProperty.call(FILES, part)) {
    return reply(400, { allowed: false, ready: false, error: "Documento inválido" }, origin);
  }

  const token = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return reply(401, { allowed: false, ready: false, error: "Identificación requerida" }, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return reply(503, { allowed: false, ready: false, error: "Servicio no disponible" }, origin);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user || user.is_anonymous) {
    return reply(401, { allowed: false, ready: false, error: "Sesión no válida" }, origin);
  }
  if (!recentOtpJwt(token,user.id)) {
    return reply(401, { allowed: false, ready: false, error: "Se requiere un código OTP reciente" }, origin);
  }

  // Varias ediciones pueden pertenecer al mismo comprador. Nunca asumir
  // un único grant por user_id: cada permiso apunta al pedido que lo originó.
  const { data: grants, error: grantError } = await admin
    .from("tema1_access")
    .select("active,expires_at,source_claim_id")
    .eq("user_id", user.id);
  if (grantError) {
    return reply(503, { allowed: false, ready: false, error: "No se pudo verificar el permiso" }, origin);
  }
  const activeClaims=(grants||[]).filter(g =>
    g.active===true && g.source_claim_id &&
    (!g.expires_at || Date.parse(g.expires_at)>Date.now())
  );
  if (!activeClaims.length) {
    return reply(403, { allowed: false, ready: false, error: "Sin compra autorizada" }, origin);
  }

  // La matriz de ediciones y el catálogo de ASIN proceden exclusivamente
  // de configuración de servidor aprobada. Sin configuración: denegar.
  const asins:Record<string,string>={
    tema1_individual:Deno.env.get("TEMA1_KDP_ASIN_INDIVIDUAL")||"",
    general_10_temas:Deno.env.get("TEMA1_KDP_ASIN_GENERAL")||""
  };
  let scope:Record<string,unknown>={};
  try {
    const parsed=JSON.parse(Deno.env.get("TEMA1_APPROVED_EDITION_SABER_MAS_SCOPES_JSON")||"{}");
    if(parsed&&typeof parsed==="object"&&!Array.isArray(parsed))scope=parsed;
  }catch{return reply(503,{allowed:false,ready:false,error:"Alcances no configurados"},origin);}

  let entitled=false;
  for (const grant of activeClaims) {
    const { data: claim, error: claimError } = await admin
      .from("tema1_order_claims")
      .select("id,user_id,channel,status,product_edition,asin")
      .eq("id", grant.source_claim_id)
      .eq("user_id", user.id)
      .maybeSingle();
    // Una tabla sin migrar o un error de permisos nunca permite entregar PDFs.
    if (claimError) {
      return reply(503,{allowed:false,ready:false,error:"Validación de edición no disponible"},origin);
    }
    if (!claim || claim.channel!=="amazon" || claim.status!=="verified") continue;
    const edition=claim.product_edition;
    if (edition!=="tema1_individual" && edition!=="general_10_temas") continue;
    const allowedParts=scope[edition];
    if (!asins[edition] || claim.asin!==asins[edition] ||
        !Array.isArray(allowedParts) || !allowedParts.includes(part)) continue;
    entitled=true;
    break;
  }
  if (!entitled) {
    return reply(403,{allowed:false,ready:false,error:"Edición o recurso no autorizado"},origin);
  }

  // Interruptor editorial de seguridad: incluso con JWT, compra y objeto cargado,
  // NO firmar archivos hasta aprobación editorial y pruebas de retirada pública.
  // Ausente o distinto de "true" => acceso cerrado por defecto.
  if (Deno.env.get("TEMA1_SABER_MAS_CONTENT_READY") !== "true") {
    return reply(503, { allowed: false, ready: false, error: "Contenido pendiente de aprobación" }, origin);
  }

  // No existe ningún enlace público ni contenido premium en el repositorio.
  // La ausencia del archivo privado debe fallar CERRADA (sin URL).
  const { data: signed, error: storageError } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(FILES[part], TTL_SECONDS);
  if (storageError || !signed?.signedUrl) {
    return reply(503, { allowed: false, ready: false, error: "Documento pendiente de aprobación y carga" }, origin);
  }
  return reply(200, {
    allowed: true,
    ready: true,
    url: signed.signedUrl,
    expires_in_seconds: TTL_SECONDS,
  }, origin);
});
