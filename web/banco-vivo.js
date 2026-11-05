'use strict';
/* M-084: contador de SOLO preguntas publicadas y verificadas.
   El endpoint público es un agregado de servidor; nunca expone las preguntas,
   claves ni el banco maestro. Si el endpoint no está desplegado, falla cerrado. */
(async()=>{
  const countElement=document.getElementById('bv-count');
  const statusElement=document.getElementById('bv-count-status');
  if(!countElement||!statusElement)return;
  const endpoint='https://jtyjdrrxmuppulbekfai.supabase.co/functions/v1/banco-vivo-catalogo';
  try{
    const response=await fetch(endpoint,{method:'GET',cache:'no-store',headers:{'accept':'application/json'}});
    if(!response.ok)throw new Error('Catálogo aún no disponible');
    const data=await response.json();
    if(!Number.isSafeInteger(data?.count)||data.count<0||data?.source!=='published_questions')throw new Error('Respuesta de catálogo inválida');
    countElement.textContent=new Intl.NumberFormat('es-ES').format(data.count);
    statusElement.textContent=data.count===0?'Todavía no hay preguntas autorizadas para venta.':'Preguntas revisadas y publicadas en el catálogo digital.';
  }catch(_){
    countElement.textContent='—';
    statusElement.textContent='Contador pendiente de conexión con Supabase. No se anuncia una cifra sin verificar.';
  }
})();
