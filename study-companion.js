/* NITI per-question study assistant: explanatory hints without revealing the solution */
(function(){
"use strict";
var dataset=Array.isArray(window.NITI_EXAMS)?window.NITI_EXAMS:[];
var source=window.NITI_STUDY_GUIDE||{};
var tips=source.examTips||{};
var get=function(id){return document.getElementById(id);};
function render(id){
 var q=dataset.find(function(v){return v.id===id;});
 var t=tips[id];var area=get("exam-insight");
 if(!area)return;
 if(!q||!t){area.hidden=true;return;}
 get("exam-insight-hook").textContent=t.hook;
 get("exam-insight-first").textContent=t.first;
 get("exam-insight-memory").textContent=t.memory;
 get("exam-insight-source").href=q.sourceUrl;
 get("exam-insight-guide").href="./study.html#tricks";
 area.hidden=false;
}
window.addEventListener("niti-question-change",function(e){if(e&&e.detail&&e.detail.id)render(e.detail.id);});
if(window.NITI_CURRENT_QUESTION)render(window.NITI_CURRENT_QUESTION);
}());