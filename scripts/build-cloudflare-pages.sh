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

# Solo scripts utilizados por la web pública; se excluye Banco Vivo y checkout.
for name in account-events.js account-login.js account-page.js account-sync.js app.js backup.js calendar.js convocatoria.js convocatorias.js practice-flow.js practice-viewport.js study-library-cleanup.js study-routes.js study-tools.js supabase-account.js supabase-config.js supabase-data-next.js supabase-data.js ruta.js; do
  test -f "web/$name"
  cp "web/$name" "$OUT/$name"
done
test -f web/styles.css
cp web/styles.css "$OUT/styles.css"

# Recursos públicos mínimos; las preguntas prémium se entregan exclusivamente desde Supabase.
for name in content-sources.json convocatorias.json favicon.svg identidad-oporadar.jpg marca-faro-dorado.jpg preguntas.json subalterno.json; do
  test -f "web/assets/$name"
  cp "web/assets/$name" "$OUT/assets/$name"
done
cp web/aulas/index.html "$OUT/aulas/index.html"
cp web/aulas/tema-1/index.html "$OUT/aulas/tema-1/index.html"

# Compatibilidad: Aula OpoRadar sigue en GitHub Pages y los recursos privados en Supabase.
cat > "$OUT/_redirects" <<'REDIRECTS'
/radar-digital https://oporadarcadiz.github.io/Temario/tema-1/radar/ 302
/saber-mas https://oporadarcadiz.github.io/Temario/tema-1/saber-mas/ 302
/tema-1/* https://oporadarcadiz.github.io/Temario/tema-1/:splat 302
/tema-2/* https://oporadarcadiz.github.io/Temario/tema-2/:splat 302
/convocatorias/:slug /convocatoria.html?slug=:slug 200
REDIRECTS

# Fallar cerrando el build ante archivos reservados o ausencias inesperadas.
for required in index.html estudiar.html convocatorias.html assets/preguntas.json assets/subalterno.json _redirects; do
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
echo "OpoRadarCádiz: compilación pública segura preparada para Cloudflare Pages."
