'use strict';
// Explicit, device-to-device transfer. Never sends student data to a server.
(()=>{
  const keys=[
    'oporadar:auxiliar:session:v1','oporadar:subalterno:session:v1',
    'oporadar:aux:progress:v1','oporadar:sub:progress:v1',
    'oporadar:aux:history:v1','oporadar:sub:history:v1',
    'oporadar:radar:saved:v1'
  ];
  const status=document.getElementById('backup-status');
  const input=document.getElementById('import-map');
  const isObject=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
  const validId=v=>typeof v==='string'&&v.length>0&&v.length<200;
  const validSession=s=>{
    if(!isObject(s)||!Array.isArray(s.ids)||s.ids.length<1||s.ids.length>500||new Set(s.ids).size!==s.ids.length||!s.ids.every(validId)||!['guided','sim'].includes(s.mode||'guided')||typeof s.complete!=='boolean'||!Number.isInteger(s.current)||s.current<0||s.current>=s.ids.length||s.id!==undefined&&!validId(s.id))return false;
    const n=s.ids.length;
    if(!['answers','checked','skipped'].every(k=>Array.isArray(s[k])&&s[k].length===n))return false;
    for(let i=0;i<n;i++)if(!(s.answers[i]===null||Number.isInteger(s.answers[i])&&s.answers[i]>=0&&s.answers[i]<4)||typeof s.checked[i]!=='boolean'||typeof s.skipped[i]!=='boolean'||s.checked[i]&&s.skipped[i]||s.checked[i]&&s.answers[i]===null||s.skipped[i]&&s.answers[i]!==null)return false;
    return !s.complete||s.checked.every((checked,i)=>checked||s.skipped[i]);
  };
  const validProgress=p=>isObject(p)&&isObject(p.entries)&&Object.keys(p.entries).length<=10000&&Object.entries(p.entries).every(([id,v])=>validId(id)&&isObject(v)&&Number.isInteger(v.attempts)&&v.attempts>0&&v.attempts<1000000&&typeof v.correct==='boolean');
  const validHistory=h=>Array.isArray(h)&&h.length<=20&&h.every(v=>isObject(v)&&validId(v.id)&&typeof v.endedAt==='string'&&!Number.isNaN(Date.parse(v.endedAt))&&['guided','sim'].includes(v.mode)&&Number.isInteger(v.total)&&v.total>0&&v.total<=500&&Number.isInteger(v.correct)&&v.correct>=0&&v.correct<=v.total&&Number.isInteger(v.blank)&&v.blank>=0&&v.blank<=v.total-v.correct);
  const validSaved=s=>Array.isArray(s)&&s.length<=10000&&s.every(id=>typeof id==='string'&&/^OPO-\d{4,}$/.test(id));
  function validate(data){
    if(!isObject(data)||data.product!=='OpoRadarCádiz'||data.version!==1||!isObject(data.values)||Object.keys(data.values).some(k=>!keys.includes(k)))throw new Error('No es una copia compatible de OpoRadarCádiz.');
    for(const key of keys){const v=data.values[key];if(v===undefined)throw new Error('La copia está incompleta.');if(v===null)continue;const okay=key.includes(':session:')?validSession(v):key.includes(':progress:')?validProgress(v):key.includes(':history:')?validHistory(v):validSaved(v);if(!okay)throw new Error('La copia contiene datos de estudio no válidos.');}
    return data.values;
  }
  function snapshot(){const values={};for(const key of keys){const raw=localStorage.getItem(key);values[key]=raw===null?null:JSON.parse(raw);}return {product:'OpoRadarCádiz',version:1,exportedAt:new Date().toISOString(),values};}
  function download(data,prefix='oporadar-cadiz-mapa'){
    const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`${prefix}-${new Date().toISOString().slice(0,10)}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  document.getElementById('export-map').addEventListener('click',()=>{
    try{const data=snapshot();validate(data);download(data);status.textContent='Copia descargada. Guárdala en un lugar privado.';}
    catch{status.textContent='No se pudo crear la copia. Comprueba que el navegador permite guardar datos y archivos.';}
  });
  input.addEventListener('change',async()=>{
    const file=input.files?.[0];input.value='';if(!file)return;
    try{
      if(file.size>2_000_000)throw new Error('El archivo supera el tamaño admitido (2 MB).');
      const values=validate(JSON.parse(await file.text()));
      if(!window.confirm('La copia sustituirá tus sesiones, progreso y procesos guardados en este navegador. Antes se descargará una copia de seguridad. ¿Continuar?')){status.textContent='Importación cancelada; no se ha cambiado nada.';return;}
      const before=snapshot();validate(before);
      if(Object.values(before.values).some(v=>v!==null))download(before,'oporadar-cadiz-antes-de-importar');
      try{for(const key of keys){if(values[key]===null)localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify(values[key]));}}
      catch(error){for(const key of keys){try{if(before.values[key]===null)localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify(before.values[key]));}catch{}}throw error;}
      status.textContent='Copia importada. Actualizando tu mapa…';window.location.reload();
    }catch(error){status.textContent=error instanceof SyntaxError?'El archivo no es un JSON válido.':error.message||'No se pudo importar la copia.';}
  });
  // Exposed only for deterministic local checks; no application data is exposed.
  if(typeof module!=='undefined'&&module.exports)module.exports={validate,validSession,validHistory,validProgress,validSaved};
})();
