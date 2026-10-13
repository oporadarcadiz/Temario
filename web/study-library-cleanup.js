'use strict';

const library=document.getElementById('archivo');
function simplifyLibrary(){
  const summary=document.getElementById('library-summary');
  const summaryText='Elige un cuadernillo oficial para practicar sus preguntas de muestra.';
  if(summary&&summary.textContent!==summaryText)summary.textContent=summaryText;
  library?.querySelectorAll('.library-group h3').forEach(el=>{const text=el.textContent.replace(/^\d+\s*\/\s*/, '');if(el.textContent!==text)el.textContent=text;});
  library?.querySelectorAll('.library-index').forEach(el=>el.remove());
  library?.querySelectorAll('.library-actions p').forEach(el=>{const text='Preguntas gratuitas de muestra';if(el.textContent!==text)el.textContent=text;});
  library?.querySelectorAll('.library-links a').forEach(el=>{if(el.textContent==='Cuadernillo oficial')el.textContent='Abrir cuadernillo oficial';if(el.textContent==='Plantilla oficial')el.textContent='Abrir plantilla oficial';});
}
new MutationObserver(simplifyLibrary).observe(library,{childList:true,subtree:true});
simplifyLibrary();
