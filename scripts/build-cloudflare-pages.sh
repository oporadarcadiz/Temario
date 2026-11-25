#!/usr/bin/env bash
# OpoRadarCádiz: compilación pública para Cloudflare Pages.
# Publicación por lista positiva: ningún PDF, SQL, juego prémium, archivo interno ni secreto.
set -euo pipefail
OUT=".cloudflare-dist"
rm -rf "$OUT"
mkdir -p "$OUT/assets" "$OUT/aulas/tema-1"

# Las páginas públicas del radar y de las muestras gratuitas.
for name in index.html convocatorias.html convocatoria.html estudiar.html ruta.html cuenta.html planes.html tema1-venta.html condiciones.html privacidad.html; do
  test -f "web/$name"
  cp "web/$name" "$OUT/$name"
done

# La campaña T-Acompañamos ya ha terminado y no forma parte del radar público.
perl -0pi -e 's#<aside class="wrap employment-alert"[^>]*>.*?</aside>##s' "$OUT/convocatorias.html"
# El radar se presenta en una sola cabecera; la búsqueda se abre con lupa o "+".
perl -0pi -e 's#</head>#<link rel="stylesheet" href="/convocatorias-compact.css"></head>#' "$OUT/convocatorias.html"
perl -0pi -e 's#</body>#<script src="/convocatorias-compact.js" defer></script></body>#' "$OUT/convocatorias.html"

# Solo scripts utilizados por la web pública; se excluye Banco Vivo y checkout.
for name in account-events.js account-login.js account-page.js account-sync.js app.js backup.js calendar.js convocatoria.js convocatorias.js convocatorias-compact.js practice-flow.js practice-viewport.js study-library-cleanup.js study-routes.js study-tools.js supabase-account.js supabase-config.js supabase-data-next.js supabase-data.js ruta.js; do
  test -f "web/$name"
  cp "web/$name" "$OUT/$name"
done
test -f web/styles.css
cp web/styles.css "$OUT/styles.css"
test -f web/radar-atlantico.css
cp web/radar-atlantico.css "$OUT/radar-atlantico.css"
cp web/convocatorias-compact.css "$OUT/convocatorias-compact.css"

# Recursos públicos mínimos; las preguntas prémium se entregan exclusivamente desde Supabase.
for name in content-sources.json convocatorias.json favicon.svg identidad-oporadar.jpg marca-faro-dorado.jpg preguntas.json subalterno.json; do
  test -f "web/assets/$name"
  cp "web/assets/$name" "$OUT/assets/$name"
done
cp web/aulas/index.html "$OUT/aulas/index.html"
cp web/aulas/tema-1/index.html "$OUT/aulas/tema-1/index.html"
cp web/robots.txt "$OUT/robots.txt"
cp web/sitemap.xml "$OUT/sitemap.xml"

# Compatibilidad: Aula OpoRadar sigue en GitHub Pages y los recursos privados en Supabase.
cat > "$OUT/_redirects" <<'REDIRECTS'
/radar-digital https://oporadarcadiz.github.io/Temario/tema-1/radar/ 302
/saber-mas https://oporadarcadiz.github.io/Temario/tema-1/saber-mas/ 302
/tema-1/* https://oporadarcadiz.github.io/Temario/tema-1/:splat 302
/tema-2/* https://oporadarcadiz.github.io/Temario/tema-2/:splat 302
/convocatorias/:slug /convocatoria?slug=:slug 302
REDIRECTS

# Respuesta 404 real para rutas ausentes, sin recurrir a la portada.
# Los enlaces QR /tema-1/* y los slugs de convocatorias se resuelven por _redirects.
cat > "$OUT/404.html" <<'HTML404'
<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Página no encontrada · OpoRadarCádiz</title></head><body style="font:16px/1.5 system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem"><h1>Página no encontrada</h1><p>La dirección solicitada no existe o no está disponible.</p><p><a href="/">Volver a OpoRadarCádiz</a></p></body></html>
HTML404

# Fallar cerrando el build ante archivos reservados o ausencias inesperadas.
for required in index.html estudiar.html convocatorias.html assets/preguntas.json assets/subalterno.json robots.txt sitemap.xml _redirects 404.html; do
  test -f "$OUT/$required"
done
if find "$OUT" -type f \( -iname '*.pdf' -o -iname '*.sql' -o -iname '*.md' -o -iname '*.ts' -o -iname '*.cjs' -o -iname '*.zip' -o -iname '*.env' \) | grep -q .; then
  echo "ERROR: se ha incluido un archivo interno o privado" >&2
  exit 1
fi
if find "$OUT" -type f | grep -Ei '/(banco-vivo|acceso-premium|seguridad|tests|migrations|admin|juegos)/'; then
  echo "ERROR: ruta reservada en salida pública" >&2
  exit 1
fi
if grep -R -E 'href="/(banco-vivo|acceso-premium)\.html"' "$OUT"; then
  echo "ERROR: enlace de producto no aprobado" >&2
  exit 1
fi
if grep -qi 'T.?Acompañamos' "$OUT/convocatorias.html"; then
  echo "ERROR: se ha publicado una campaña no aprobada" >&2
  exit 1
fi
if ! grep -q 'convocatorias-compact.js' "$OUT/convocatorias.html"; then
  echo "ERROR: no se ha preparado el radar compacto" >&2
  exit 1
fi
echo "OpoRadarCádiz: compilación pública segura preparada para Cloudflare Pages."
