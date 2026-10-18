/* NITI study extensions: observed ranking of 15 example exams and short exam-ready statute paraphrases.
 * Not AI prediction. Full-text URLs are verified third-party pages. Official portal is linked separately.
 */
(function(){
"use strict";
var allExams=Array.isArray(window.NITI_EXAMS)?window.NITI_EXAMS:[];
var exams=allExams.filter(function(q){return q.kind!=="practice";});
var notes=Array.isArray(window.NITI_STATUTE_NOTES)?window.NITI_STATUTE_NOTES:[];
var referenceData=window.NITI_STATUTE_SOURCES||{};
var sourceList=referenceData.sources||{};
var noteIndex={};notes.forEach(function(n){noteIndex[n.id]=n;});
var allNotes=(Array.isArray(referenceData.ids)&&referenceData.ids.length?referenceData.ids:notes.map(function(n){return n.id;})).map(function(id){
 return noteIndex[id]||{id:id,title:(referenceData.titles||{})[id]||"บทบัญญัติที่โจทย์อ้างถึง",reviewed:false};
});
function normalizeSection(value){var match=String(value||"").trim().match(/^(\d+(?:\/\d+)?)/);return match?match[1]:"";}

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

function examKeywordText(tag,cls,text,id){
 var target=newNode(tag,cls),helper=window.NITI_STATUTE_HIGHLIGHTS;
 if(helper&&typeof helper.apply==="function")helper.apply(target,text,id);
 else target.textContent=String(text||"");
 return target;
}
function makeStatuteCard(note,small,reference){
 var detail=newNode("article",small?"statute-small":"statute-card");
 if(!small)detail.id="statute-"+String(note.id).replace(/\//g,"-");
 var direct=referenceData&&typeof referenceData.resolve==="function"?referenceData.resolve(note.id):null;
 var hasIllustration=false;try{hasIllustration=!!(window.NITI_DIORAMA_DATA&&typeof window.NITI_DIORAMA_DATA.get==="function"&&window.NITI_DIORAMA_DATA.get(note.id));}catch(e){}
 var head=newNode("div","statute-head");
 var title=newNode("h3","","");
 var textTitle="มาตรา "+(reference||note.id)+" — "+note.title;
 if(direct){
  var titleLink=makeLink("./study.html#statute-"+String(note.id).replace(/\//g,"-"),textTitle+(hasIllustration?" · ดูภาพโต้ตอบ":" · ดูสรุปมาตรา"));
  titleLink.className="statute-heading-link";
  titleLink.target="_self";
  titleLink.setAttribute("data-statute",note.id);
  titleLink.title=(hasIllustration?"เปิดภาพประกอบโต้ตอบของมาตรา ":"เปิดสรุปและตัวบทมาตรา ")+note.id+" ภายในเว็บไซต์";
  title.appendChild(titleLink);
 }else{
  title.textContent=textTitle;
 }
 head.appendChild(title);
 detail.appendChild(head);
 if(note.plain)detail.appendChild(examKeywordText("p","statute-plain",note.plain,note.id));
 else detail.appendChild(newNode("p","statute-plain","หัวข้อกฎหมาย: "+note.title+" — โปรดตรวจข้อความตามตัวบทและฉบับแก้ไขจากเอกสารทางการด้านล่าง"));
 if(note.exam){
  var example=newNode("div","statute-example");
  example.appendChild(newNode("strong","","ประโยคหลักกฎหมายสำหรับเขียนข้อสอบ (สรุปเรียบเรียงใหม่)"));
  example.appendChild(examKeywordText("p","",note.exam,note.id));
  detail.appendChild(example);
 }
 if(!small){
  if(note.conditions)detail.appendChild(examKeywordText("p","statute-conditions","องค์ประกอบที่ต้องตรวจ: "+note.conditions,note.id));
  if(note.trap)detail.appendChild(examKeywordText("p","statute-warning","จุดระวัง: "+note.trap,note.id));
 }
 var links=newNode("div","statute-sources");
 links.appendChild(newNode("strong","statute-sources-title","แหล่งตัวบทกฎหมาย"));
 if(direct){
  var sceneLink=makeLink("./study.html#statute-"+String(note.id).replace(/\//g,"-"),(hasIllustration?"🖼️ เปิดภาพอธิบายมาตรา ":"📖 เปิดสรุปมาตรา ")+note.id+(hasIllustration?" · คลิกดูองค์ประกอบ":" · อ่านหลักกฎหมาย"));
  sceneLink.target="_self";sceneLink.setAttribute("data-statute",note.id);
  sceneLink.className="statute-source-illustration";
  links.appendChild(sceneLink);
  var main=makeLink(direct.primaryUrl,"เปิดตัวบทมาตรา "+note.id+" โดยตรง — PDF หน้า "+direct.page+" ↗");
  main.className="statute-source-link statute-source-primary";
  links.appendChild(main);
  (direct.officialUrls||[]).forEach(function(ref){
   if(!ref.url||ref.url===direct.primaryUrl)return;
   var copy=makeLink(ref.url,ref.label+" ↗");
   copy.className="statute-source-link statute-source-secondary";
   links.appendChild(copy);
  });
  var hint=direct.sourceType==="official-amendment-copy"
    ?"ข้อความฉบับแก้ไข พ.ศ. 2557: ปุ่มหลักเปิดสำเนาทางการของกรมบังคับคดี ส่วนลิงก์ราชกิจจาฯ อาจเปิดไม่ได้ในบางเครือข่าย"
    :"ปุ่มหลักเปิดเอกสารรวมจากหน่วยงานรัฐที่หน้าซึ่งมีมาตรานี้; ให้ตรวจฉบับอัปเดตของศาลยุติธรรมด้วยก่อนใช้อ้างกฎหมายปัจจุบัน";
  links.appendChild(newNode("p","statute-source-note",hint+" · การเลื่อนสู่หน้า PDF อาจไม่ทำงานในเบราว์เซอร์มือถือบางรุ่น"));
 }else{
  links.appendChild(newNode("p","statute-source-note","ยังไม่มี URL ที่ยืนยันหน้าของตัวบทกฎหมาย ไม่แสดงลิงก์ที่อาจนำไปผิดมาตรา"));
 }
 detail.appendChild(links);
 return detail;
}
function renderLibrary(query){
 var root=$("statute-list");if(!root)return;
 var term=String(query||"").trim().toLocaleLowerCase("th");
 var filtered=allNotes.filter(function(note){
 return !term||[note.id,note.title,note.plain||"",note.exam||"",note.conditions||""].join(" ").toLocaleLowerCase("th").includes(term);
 });
 $("statute-count").textContent="พบ "+filtered.length+" จาก "+allNotes.length+" มาตรา";
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
 var wanted=(q.sections||[]).map(function(s){return {raw:String(s),id:normalizeSection(s)};});
 wanted.forEach(function(item){
  var found=noteIndex[item.id]||allNotes.find(function(x){return x.id===item.id;});
  if(found)box.appendChild(makeStatuteCard(found,true,item.raw));
 });
 if(!box.children.length){
  var info=newNode("p","statute-conditions","ไม่พบข้อมูลเลขมาตราที่อ้างในโจทย์ โปรดค้นจากฐานข้อมูลกฤษฎีกา");
  if(sourceList.ocs)info.appendChild(makeLink(sourceList.ocs.url," สำนักงานคณะกรรมการกฤษฎีกา ↗"));
  box.appendChild(info);
 }
 }
 var value=$("exam-ranking-value"),desc=$("exam-ranking-description");
 if(value&&desc){
 if(q.kind==="practice"){
 value.textContent="โจทย์ฝึก (ไม่ใช่ข้อสอบย้อนหลัง) — ไม่จัดอันดับ";
 desc.textContent="โจทย์ฝึกข้อนี้ไม่ใช่ข้อสอบย้อนหลังที่ยืนยันต้นทางได้ จึงไม่รวมในการนับความถี่ "+exams.length+" ข้อสอบที่มีแหล่งต้นทาง";
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