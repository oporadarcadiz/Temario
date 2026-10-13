'use strict';

/* Activa la vista concentrada solo mientras hay una pregunta en curso. */
const quizContent=document.getElementById('quiz-content');
const resultContent=document.getElementById('result-content');
function updatePracticeViewport(){
  const active=Boolean(quizContent&&!quizContent.hidden&&resultContent?.hidden);
  document.body.classList.toggle('session-active',active);
}
new MutationObserver(updatePracticeViewport).observe(quizContent,{attributes:true,attributeFilter:['hidden']});
new MutationObserver(updatePracticeViewport).observe(resultContent,{attributes:true,attributeFilter:['hidden']});
updatePracticeViewport();
