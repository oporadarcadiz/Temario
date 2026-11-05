'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const catalog=read('media-catalog.js');
test('catálogo: solo el Vídeo 1 consta finalizado y no publica URLs',()=>{
 const context={document:{getElementById:()=>null}};vm.runInNewContext(catalog+';globalThis.catalog=TEMA1_MEDIA_CATALOG',context);
 assert.equal(context.catalog.videos.filter(x=>x.state==='pending_delivery').map(x=>x.id).join(','),'video-01-panorama');
 assert.ok(context.catalog.videos.every(x=>!Object.hasOwn(x,'url')&&!Object.hasOwn(x,'path')));
 assert.ok(context.catalog.audios.every(x=>x.state==='coming_soon'));
});
test('rutas de catálogo y Radar no crean enlaces de Storage desde el navegador',()=>{
 for(const file of ['videos/index.html','audios/index.html','radar/biblioteca/index.html','radar/reproductor/index.html']){
  const source=read(file);assert.doesNotMatch(source,/createSignedUrl|\.storage\.from\(|signedUrl/);
 }
 const radar=read('radar/index.html');assert.match(radar,/\.\.\/videos\//);assert.match(radar,/\.\.\/audios\//);
});
test('el contrato Edge falla cerrado y solo firma tras flags por recurso',()=>{
 const edge=read('seguridad/edge/tema1-media-access/index.ts');
 assert.match(edge,/admin\.auth\.getUser\(jwt\)/);assert.match(edge,/recentOtp\(jwt,user\.id\)/);
 assert.match(edge,/TEMA1_MEDIA_PUBLIC_COPIES_REMOVED/);assert.match(edge,/TEMA1_MEDIA_READY_/);assert.match(edge,/TEMA1_APPROVED_EDITION_MEDIA_SCOPES_JSON/);
 assert.match(edge,/createSignedUrl\(path,TTL_SECONDS\)/);assert.doesNotMatch(edge,/\.list\(/);
});
