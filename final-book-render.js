/* NITI · textbook exercise gallery in the 18-section final-exam menu.
 * Each card carries the original PDF page/question reference. No fake scores.
 * Highlights are pedagogical indicators, not an official grading rubric.
 */
(function(){
"use strict";
var list=window.NITI_FINAL_BOOK_QUESTIONS||[],root=document.getElementById("final-book-list");
if(!root)return;
var selected=document.getElementById("book-filter"),search=document.getElementById("book-search"),count=document.getElementById("book-count");
var highlighter=window.NITI_EXAM_KEYWORDS||null;
var scope=["139","144","145","146","147","148","1298","1299","1382","1387","1401","1304","1307","1367","1368","1373","1375","1377"];
var found=[...new Set(list.reduce(function(acc,q){return acc.concat(q.sections);},[]))];
function el(tag,cls,label){var n=document.createElement(tag);if(cls)n.className=cls;if(label!==undefined)n.textContent=String(label);return n;}
function paragraph(parent,string,words){
 var p=el("p");
 if(highlighter&&typeof highlighter.apply==="function")highlighter.apply(p,string,words);else p.textContent=string;
 parent.appendChild(p);return p;
}
function bookCard(q){
 var card=el("article","book-card");card.id=q.id;
 var top=el("div","book-card-meta");
 top.appendChild(el("span","book-tag","ข้อสอบตามหนังสือ"));
 top.appendChild(el("span","book-source","ไฟล์ PDF หน้า "+q.page+" · "+q.bookQuestion));
 card.appendChild(top);
 card.appendChild(el("h3","",q.title));
 var refs=el("div","book-statutes");
 q.sections.forEach(function(id){
  var a=el("a","book-law-ref","มาตรา "+id);
  a.href="#statute-"+id;
  a.setAttribute("data-statute",id);
  a.setAttribute("aria-label","เปิดคำอธิบายมาตรา "+id);
  refs.appendChild(a);
 });card.appendChild(refs);
 var facts=el("section","book-facts");
 facts.appendChild(el("h4","","โจทย์จากหนังสือ (เรียบเรียงย่อ)"));
 paragraph(facts,q.question,[]);
 card.appendChild(facts);
 var details=el("details","book-answer");
 details.appendChild(el("summary","","อ่านแนววินิจฉัยระดับปริญญาตรี · หลักกฎหมาย → วินิจฉัย (ปรับบท) → สรุป"));
 var answer=el("div","book-answer-inner");
 var issue=el("p","book-answer-notice","แนวตอบเพื่อการศึกษา · เน้นข้อความที่ควรกล่าวถึงในการสอบด้วยสีเหลือง ไม่ใช่เกณฑ์ให้คะแนนของผู้สอน");
 answer.appendChild(issue);
 ["rule","application","conclusion"].forEach(function(field){
  var headings={rule:"หลักกฎหมาย",application:"วินิจฉัย (ปรับบท)",conclusion:"สรุป"};
  var sec=el("section","book-answer-part "+field);sec.appendChild(el("h4","",headings[field]));
  paragraph(sec,q[field],(q.keywords||[]).concat(["ทำเป็นหนังสือและจดทะเบียน","กรรมสิทธิ์","สิทธิครอบครอง","ภาระจำยอม","สาธารณสมบัติของแผ่นดิน","ส่วนควบ","อุปกรณ์","ดอกผลธรรมดา","ดอกผลนิตินัย","ทรัพยสิทธิ","ครอบครองปรปักษ์","บุคคลภายนอก","สุจริต","จดทะเบียน"]));
  answer.appendChild(sec);
 });
 details.appendChild(answer);card.appendChild(details);
 return card;
}
function draw(){
 var chosen=selected.value,word=search.value.trim().toLocaleLowerCase("th");
 var visible=list.filter(function(q){
  if(chosen!=="all"&&q.sections.indexOf(chosen)<0)return false;
  if(!word)return true;
  return ([q.title,q.question,q.rule,q.application,q.conclusion,q.bookQuestion,"PDF หน้า "+q.page].concat(q.sections)).join(" ").toLocaleLowerCase("th").includes(word);
 });
 root.replaceChildren();
 visible.forEach(function(q){root.appendChild(bookCard(q));});
 if(!visible.length)root.appendChild(el("p","book-no-results","ไม่พบโจทย์ตามมาตราหรือคำค้นนี้ในไฟล์หนังสือที่คัดเลือกไว้"));
 count.textContent="แสดง "+visible.length+" / "+list.length+" โจทย์ตามหนังสือ";
}
scope.forEach(function(id){
 var op=el("option","",("มาตรา "+id)+(found.indexOf(id)<0?" · ยังไม่มีโจทย์ตรงในไฟล์":""));
 op.value=id;
 selected.appendChild(op);
});
selected.addEventListener("change",draw);
search.addEventListener("input",draw);
draw();
function openDeepLink(){
 var id=String(window.location.hash||"").replace(/^#/,"");
 var q=list.find(function(x){return x.id===id});
 if(!q)return;
 if(selected.value!=="all"&&q.sections.indexOf(selected.value)<0){selected.value="all";draw();}
 var card=document.getElementById(id);
 if(card){var d=card.querySelector("details.book-answer");if(d)d.open=true;}
}
window.addEventListener("hashchange",openDeepLink);
openDeepLink();
})();
