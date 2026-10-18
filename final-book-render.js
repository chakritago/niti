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
 var refs=el("section","book-statutes");
 refs.appendChild(el("h4","book-statutes-title","มาตราที่ใช้วินิจฉัย (คงตามโจทย์เดิม)"));
 var laws=el("div","book-law-lines");
 q.sections.forEach(function(id){
  var line=el("div","book-law-line");
  var a=el("a","book-law-ref","มาตรา "+id+" ↗");
  a.href="#statute-"+id;
  a.setAttribute("data-statute",id);
  a.setAttribute("aria-label","เปิดคำอธิบายมาตรา "+id);
  line.appendChild(a);
  laws.appendChild(line);
 });
 refs.appendChild(laws);card.appendChild(refs);
 var facts=el("section","book-facts");
 facts.appendChild(el("h4","","โจทย์จากหนังสือ (เรียบเรียงย่อ)"));
 paragraph(facts,q.question,[]);
 card.appendChild(facts);
 var details=el("details","book-answer");
 details.appendChild(el("summary","","อ่านแนววินิจฉัยระดับปริญญาตรี · หลักกฎหมาย → วินิจฉัย (ปรับบท) → สรุป"));
 var answer=el("div","book-answer-inner");
 answer.appendChild(el("p","book-answer-notice","ตัวอย่างแนวเขียนตอบระดับปริญญาตรี · ไฮไลต์คำสำคัญที่ควรกล่าวถึงเพื่อช่วยเก็บประเด็นในการสอบ ไม่ใช่เกณฑ์ให้คะแนนอย่างเป็นทางการ"));
 var terms=(q.scoreKeywords||q.keywords||[]).filter(Boolean);
 function keyTerms(text){return [...new Set(terms.concat(q.keywords||[],["อสังหาริมทรัพย์","กรรมสิทธิ์","สิทธิครอบครอง","ภาระจำยอม","สาธารณสมบัติของแผ่นดิน","ส่วนควบ","อุปกรณ์","ดอกผลธรรมดา","ดอกผลนิตินัย","ทรัพยสิทธิ","ครอบครองปรปักษ์","สุจริต"]))];}
 var issue=el("section","book-issue");
 issue.appendChild(el("h4","","ประเด็นปัญหาที่ต้องวินิจฉัย"));
 paragraph(issue,q.issue||q.title,[]);
 answer.appendChild(issue);
 if(terms.length){
  var guide=el("aside","book-scoreguide");
  guide.appendChild(el("h4","","คีย์เวิร์ดที่ควรเขียนให้ครบ"));
  guide.appendChild(el("p","","ข้อความเน้นสีเป็นแนวจำองค์ประกอบกฎหมาย ไม่ใช่ธงคะแนนทางการของผู้ตรวจข้อสอบ"));
  var chips=el("div","book-scorechips");
  terms.forEach(function(term){chips.appendChild(el("span","exam-score-keyword book-scorechip",term));});
  guide.appendChild(chips);answer.appendChild(guide);
 }
 var rules=el("section","book-answer-part rule");
 rules.appendChild(el("h4","","1. หลักกฎหมาย"));
 var byStatute=q.ruleBySection||{};
 if(q.sections&&q.sections.length){
  q.sections.forEach(function(id){
   var part=el("div","book-rule-clause");
   var head=el("h5","book-rule-heading");
   var ref=el("a","book-rule-link","ประมวลกฎหมายแพ่งและพาณิชย์ มาตรา "+id+" ↗");
   ref.href="#statute-"+id;
   ref.setAttribute("data-statute",id);
   ref.setAttribute("aria-label","เปิดคำอธิบายมาตรา "+id);
   head.appendChild(ref);part.appendChild(head);
   var text=byStatute[id]||q.rule||"";
   String(text).split(/\\n\\n+/).filter(Boolean).forEach(function(chunk){paragraph(part,chunk,keyTerms(chunk));});
   rules.appendChild(part);
  });
 }else paragraph(rules,q.rule||"",keyTerms(q.rule||""));
 answer.appendChild(rules);
 var analysis=el("section","book-answer-part application");
 analysis.appendChild(el("h4","","2. วินิจฉัย (ปรับบท)"));
 (Array.isArray(q.applicationParagraphs)?q.applicationParagraphs:[q.application||""]).forEach(function(part,i){
  paragraph(analysis,part,keyTerms(part));
 });
 answer.appendChild(analysis);
 var conclusion=el("section","book-answer-part conclusion");
 conclusion.appendChild(el("h4","","3. สรุป"));
 var result=String(q.conclusion||"").replace(/^สรุป[\\s:：-]*/,"");
 paragraph(conclusion,result,keyTerms(result));
 answer.appendChild(conclusion);
 details.appendChild(answer);card.appendChild(details);
 return card;
}
function draw(){
 var chosen=selected.value,word=search.value.trim().toLocaleLowerCase("th");
 var visible=list.filter(function(q){
  if(chosen!=="all"&&q.sections.indexOf(chosen)<0)return false;
  if(!word)return true;
  return ([q.title,q.question,q.issue,q.rule,q.application,q.conclusion,q.bookQuestion,"PDF หน้า "+q.page].concat(q.scoreKeywords||[],q.sections)).join(" ").toLocaleLowerCase("th").includes(word);
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
