/* NITI study extensions: observed ranking of 15 example exams and short exam-ready statute paraphrases.
 * Not AI prediction. Full-text URLs are verified third-party pages. Official portal is linked separately.
 */
(function(){
"use strict";
var allExams=Array.isArray(window.NITI_EXAMS)?window.NITI_EXAMS:[];
var exams=allExams.filter(function(q){return q.kind!=="practice";});
var notes=Array.isArray(window.NITI_STATUTE_NOTES)?window.NITI_STATUTE_NOTES:[];
var $=function(id){return document.getElementById(id)};
var countByTopic={};
exams.forEach(function(q){countByTopic[q.topic]=(countByTopic[q.topic]||0)+1;});
var entries=Object.entries(countByTopic).sort(function(a,b){return b[1]-a[1]||a[0].localeCompare(b[0],"th")});
var rankForTopic=function(name){var n=countByTopic[name]||0;return 1+entries.filter(function(x){return x[1]>n}).length};
function band(n){return n>=3?"A":n===2?"B":"C"}
function bandName(b){return b==="A"?"เริ่มจำก่อน":b==="B"?"ควรทวนให้แม่น":"อ่านให้ครบ"}
function newNode(tag,cl,textContent){
 var el=document.createElement(tag);
 if(cl)el.className=cl;
 if(typeof textContent==="string")el.textContent=textContent;
 return el;
}
function makeLink(url,text){
 var a=newNode("a","",text);a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a;
}
function renderRanking(){
 var root=$("rank-grid");if(!root)return;root.replaceChildren();
 entries.forEach(function(entry){
 var topic=entry[0],n=entry[1],r=rankForTopic(topic),b=band(n);
 var card=newNode("article","rank-card rank-"+b.toLowerCase());
 var topline=newNode("div","rank-top");
 topline.appendChild(newNode("span","rank-position","อันดับ "+r+(entries.filter(function(x){return x[1]===n}).length>1?" (ร่วม)":"")));
 topline.appendChild(newNode("span","rank-band","กลุ่ม "+b+" · "+bandName(b)));
 card.appendChild(topline);
 card.appendChild(newNode("h3","",topic));
 card.appendChild(newNode("p","",n+" จาก "+exams.length+" ข้อในชุดตัวอย่าง ("+Math.round(n/exams.length*100)+"% ของคลังชุดนี้)"));
 var list=newNode("div","rank-exams");
 exams.filter(function(q){return q.topic===topic}).forEach(function(q){
 var a=newNode("a","",q.title+" · "+q.semester+"/"+q.year+" ข้อ "+q.number);
 a.href="./quiz.html?exam="+encodeURIComponent(q.id);list.appendChild(a);
 });
 card.appendChild(list);
 root.appendChild(card);
 });
}
function statutesFor(q){var wanted=(q.sections||[]).map(function(s){return String(s).trim().split(" ")[0]});return notes.filter(function(n){return wanted.includes(n.id)});}
function makeStatuteCard(note,small){
 var detail=newNode("article",small?"statute-small":"statute-card");
 var head=newNode("div","statute-head");
 var title=newNode("h3","", "มาตรา "+note.id+" — "+note.title);head.appendChild(title);
 var source=makeLink(note.fullTextUrl,"อ่านตัวบทเต็ม ↗");source.className="statute-link";head.appendChild(source);
 detail.appendChild(head);
 detail.appendChild(newNode("p","statute-plain",note.plain));
 var example=newNode("div","statute-example");
 example.appendChild(newNode("strong","","ประโยคหลักกฎหมายที่ใช้เขียนข้อสอบ"));
 example.appendChild(newNode("p","",note.exam));
 detail.appendChild(example);
 if(!small){
 detail.appendChild(newNode("p","statute-conditions","องค์ประกอบที่ต้องตรวจ: "+note.conditions));
 detail.appendChild(newNode("p","statute-warning","จุดระวัง: "+note.trap));
 }
 return detail;
}
function renderLibrary(query){
 var root=$("statute-list");if(!root)return;
 var term=String(query||"").trim().toLocaleLowerCase("th");
 var filtered=notes.filter(function(note){
 return !term||[note.id,note.title,note.plain,note.exam,note.conditions].join(" ").toLocaleLowerCase("th").includes(term);
 });
 $("statute-count").textContent="พบ "+filtered.length+" จาก "+notes.length+" มาตรา";
 root.replaceChildren();
 if(!filtered.length){root.appendChild(newNode("p","","ไม่พบมาตราที่ตรงกับคำค้น"));return}
 filtered.forEach(function(note){root.appendChild(makeStatuteCard(note,false))});
}
function currentQ(){
 var id=window.NITI_CURRENT_QUESTION;
 if(!id){
 var el=$("question-id");
 id=el?(el.textContent.match(/รหัสโจทย์:\s*([^\s]+)/)||[])[1]:null;
 }
 return allExams.find(function(q){return q.id===id})||null;
}
function renderQuiz(id){
 var q=allExams.find(function(item){return item.id===id});if(!q)return;
 var box=$("exam-statute-list");
 if(box){
 box.replaceChildren();
 var wanted=(q.sections||[]).map(function(s){return String(s).trim().split(" ")[0]});
 wanted.forEach(function(n){
 var found=notes.find(function(x){return x.id===n});
 if(found)box.appendChild(makeStatuteCard(found,true));
 });
 if(!box.children.length){
 var info=newNode("p","statute-conditions","บทสรุปมาตรา "+wanted.join(", ")+" ยังไม่อยู่ในคลังสรุปมาตราฉบับนี้ โปรดตรวจตัวบทฉบับใช้บังคับล่าสุดจาก ");
 info.appendChild(makeLink("https://www.krisdika.go.th/","สำนักงานคณะกรรมการกฤษฎีกา ↗"));box.appendChild(info);
 }
 }
 var value=$("exam-ranking-value"),desc=$("exam-ranking-description");
 if(value&&desc){
 if(q.kind==="practice"){
 value.textContent="โจทย์ฝึกแต่งใหม่ — ไม่จัดอันดับ";
 desc.textContent="โจทย์เรื่องแลกเปลี่ยนแต่งขึ้นเพื่อฝึกทักษะ ไม่ใช่ข้อสอบย้อนหลัง จึงไม่รวมในการนับความถี่ "+exams.length+" ข้อสอบที่มีแหล่งต้นทาง";
 }else{
 var count=countByTopic[q.topic]||0, b=band(count);
 value.textContent="กลุ่ม "+b+" · "+bandName(b)+" — อันดับ "+rankForTopic(q.topic)+" ในคลังตัวอย่าง";
 desc.textContent="หัวข้อ “"+q.topic+"” พบ "+count+" จาก "+exams.length+" ข้อสอบย้อนหลังที่คัดเลือก การจัดกลุ่มนี้ใช้วางแผนอ่าน ไม่ใช่โอกาสออกสอบหรือคำยืนยันว่าข้อนี้จะออกสอบอีก";
 }
 }
}
renderRanking();renderLibrary("");
var input=$("statute-search");
if(input)input.addEventListener("input",function(){renderLibrary(input.value)});
window.addEventListener("niti-question-change",function(ev){if(ev&&ev.detail&&ev.detail.id)renderQuiz(ev.detail.id)});
var selected=currentQ();if(selected)renderQuiz(selected.id);
}());