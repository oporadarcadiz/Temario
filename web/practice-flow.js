'use strict';

const answerAction=document.getElementById('check-answer');
const continueAction=document.getElementById('continue');
const signalRoom=document.getElementById('signal-room');

function updateActionCopy(){
  if(continueAction.textContent.trim()==='Siguiente señal')continueAction.textContent='Siguiente pregunta';
  if(continueAction.textContent.trim()==='Dejar en blanco'&&!answerAction.disabled&&!answerAction.hidden)continueAction.textContent='Guardar sin responder';
}

document.addEventListener('change',event=>{
  if(!event.target.matches('input[name="answer"]'))return;
  if(answerAction.hidden){
    answerAction.hidden=false;
    answerAction.disabled=false;
    answerAction.dataset.practiceAction='simulation';
    answerAction.textContent='Guardar respuesta y continuar';
    return;
  }
  answerAction.dataset.practiceAction='guided';
  answerAction.textContent='Responder y comprobar';
});

document.addEventListener('click',event=>{
  if(event.target!==answerAction||answerAction.dataset.practiceAction!=='simulation')return;
  event.preventDefault();
  event.stopImmediatePropagation();
  continueAction.click();
},true);

new MutationObserver(updateActionCopy).observe(signalRoom,{childList:true,subtree:true});
