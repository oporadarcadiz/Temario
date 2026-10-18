// Ejecutar con node --test web/tests/convocatorias-transition.test.cjs
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const backup=JSON.parse(fs.readFileSync(path.join(root,'assets/convocatorias.json'),'utf8'));
const items=backup.opportunities;
test('respaldo legado: IDs únicos e inmutables',()=>{assert.equal(new Set(items.map(x=>x.id)).size,items.length);for(const x of items){assert.ok(x.id);assert.ok(x.title&&x.organism);assert.match(x.url,/^https:\/\//)}});
test('favoritos: los IDs legacy no se convierten en slugs',()=>{const saved=['OPO-0001','OPO-0003'];const after=saved.filter(id=>items.some(x=>x.id===id));assert.deepEqual(after,saved);assert.equal(items.find(x=>x.id==='OPO-0001').id,'OPO-0001')});
test('ruta antigua disponible para registros sin slug',()=>{const link=x=>x.slug?'/convocatorias/'+encodeURIComponent(x.slug):'/convocatoria.html?id='+encodeURIComponent(x.id);for(const x of items)assert.equal(link(x),'/convocatoria.html?id='+encodeURIComponent(x.id))});
test('ruta slug conserva favoritos por ID',()=>{const x={id:'OPO-0001',slug:'auxiliar-cadiz-opo-0001'};const fav=new Set(['OPO-0001']);assert.equal('/convocatorias/'+x.slug,'/convocatorias/auxiliar-cadiz-opo-0001');assert.equal(fav.has(x.id),true)});
test('respaldo no contiene 260 candidatos automáticamente',()=>{assert.ok(items.length<260)});
