'use strict';
// Guardas estáticas del Aula OpoRadar y del Tema 1. No crean usuarios, no envían correos
// y no sustituyen a las pruebas HTTP reales de Supabase, Storage o permisos.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const repo=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(repo,p),'utf8');

test('Aula: noindex y rutas publicas sin promesa de acceso privado',()=>{
  const index=read('web/aulas/index.html');
  const t1=read('web/aulas/tema-1/index.html');
  const t2=read('web/aulas/tema-2/index.html');
  for(const [name,html] of [['aulas/index',index],['aulas/tema-1',t1],['aulas/tema-2',t2]]){
    assert.match(html,/<meta name="robots" content="noindex,nofollow">/i,name+' noindex');
  }
  assert.match(index,/href="\/aulas\/tema-1\/"/);
  assert.match(index,/href="\/tema-2\/radar\/"/);
  assert.match(index,/ruta pública permanente/i);
  assert.match(index,/el acceso no se activa desde esta página/i);
  assert.doesNotMatch(index,/href="\/aulas\/tema-2\//);
  assert.doesNotMatch(index,/tema-1\/centro/);
  assert.match(t1,/location\.replace\("\/tema-1\/radar\/"\)/);
  assert.doesNotMatch(t1,/tema-1\/centro/);
});

test('QR aprobados y mensaje del libro permanecen intactos',()=>{
  const radar=read('tema-1/radar/index.html');
  const control=read('tema-2/CONTROL_QR.md');
  const juegos=read('tema-1/juegos/nivel3-test.html');
  assert.match(radar,/Enlace QR permanente: <strong>\/tema-1\/radar\/<\/strong>/);
  assert.match(radar,/href="\.\.\/saber-mas\/"/);
  assert.match(control,/\| Tema 1 \| `\/tema-1\/radar\/` \|/);
  assert.match(juegos,/oporadarcadiz\.github\.io\/Tarjetas-repaso\/juegos\/centro-radar\/tema-1\/\?modo=mixto&(?:amp;)?radar=4/);
  const venta=read('web/tema1-venta.html');
  assert.match(venta,/No vayas al examen/);
  assert.match(venta,/tres niveles en el libro/i);
  assert.match(venta,/PRÁCTICA ONLINE · CUARTA VUELTA/);
});

test('Saber Más no expone PDF ni Storage publico y exige server ready',()=>{
  const page=read('tema-1/saber-mas/index.html');
  assert.doesNotMatch(page,/href="[^"]*\.pdf/i);
  assert.doesNotMatch(page,/storage\/v1\/object\/public\//i);
  assert.match(page,/result\?\.allowed!==true\|\|result\?\.ready!==true/);
  assert.match(page,/signed\.pathname\.startsWith\("\/storage\/v1\/object\/sign\/tema1-premium\/"\)/);
  assert.match(page,/link\.setTimeout|window\.setTimeout\(\(\)=>link\.remove\(\)/);
  const edge=read('tema-1/seguridad/edge/tema1-saber-mas/index.ts');
  assert.match(edge,/BORRADOR INERTE\. NO DESPLEGAR/);
  assert.match(edge,/TEMA1_SABER_MAS_CONTENT_READY/);
  assert.match(edge,/created signed URL|createSignedUrl/);
});

test('Catalogo multimedia y juegos: solo metadatos, sin archivos privados',()=>{
  const media=read('tema-1/media-catalog.js');
  assert.match(media,/nunca contiene URLs privadas/);
  assert.doesNotMatch(media,/https?:\/\//);
  assert.doesNotMatch(media,/\.pdf|\.mp3|\.mp4/i);
  assert.match(media,/type="button" disabled/);
  const recursos=read('tema-1/resources.js');
  assert.doesNotMatch(recursos,/https?:\/\/[^\s"']*\.(pdf|mp3|mp4)/i);
});

test('Acceso del Tema 1 no activa permisos por introducir un pedido',()=>{
  const acceso=read('tema-1/acceso/index.html');
  assert.match(acceso,/El número de pedido no activa el acceso automáticamente/);
  assert.match(acceso,/status==='pending'/);
  assert.match(acceso,/status==='verified'/);
  assert.match(acceso,/signInWithOtp/);
  assert.match(acceso,/verifyOtp/);
  const storage=read('tema-1/seguridad/20261110_storage_bucket_edge_only_NO_APLICAR.sql');
  assert.match(storage,/NO APLICAR/i);
});

test('Compilacion publica excluye Aula privada y recursos del Tema 1',()=>{
  const build=read('scripts/build-cloudflare-pages.sh');
  assert.match(build,/cp web\/aulas\/index\.html/);
  assert.match(build,/cp web\/aulas\/tema-1\/index\.html/);
  assert.doesNotMatch(build,/cp web\/aulas\/tema-2\/index\.html/);
  assert.match(build,/\/tema-1\/\* https:\/\/oporadarcadiz\.github\.io\/Temario\/tema-1\/:splat 302/);
  assert.match(build,/\/saber-mas https:\/\/oporadarcadiz\.github\.io\/Temario\/tema-1\/saber-mas\/ 302/);
  assert.match(build,/\/\(banco-vivo\|acceso-premium\|seguridad\|tests\|migrations\|admin\|juegos\)\//);
});
