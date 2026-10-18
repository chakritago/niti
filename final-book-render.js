/* NITI | textbook law-school exam practice.
 * The 12 textbook questions and ORIGINAL section references remain unchanged.
 * Render each statutory principle on its own line and in its own reading block;
 * distinguish newly-written model analyses from the source textbook questions.
 * Safely render highlights with DOM nodes (never unsanitized innerHTML).
 */
(function(){
"use strict";
var list=window.NITI_FINAL_BOOK_QUESTIONS||[];
var root=document.getElementById("final-book-list");
if(!root)return;
var selected=document.getElementById("book-filter");
var search=document.getElementById("book-search");
var count=document.getElementById("book-count");
var highlight=window.NITI_EXAM_KEYWORDS||null;
var scope=["139","144","145","146","147","148","1298","1299","1382","1387","1401","1304","1307","1367","1368","1373","1375","1377"];
var covered=new Set(list.reduce(function(a,q){return a.concat(q.sections||[]);},[]));
var basicKeywords=["กรรมสิทธิ์","ทรัพยสิทธิ","อสังหาริมทรัพย์","สังหาริมทรัพย์","ส่วนควบ","อุปกรณ์","ดอกผลธรรมดา","ดอกผลนิตินัย","สิทธิครอบครอง","ครอบครองปรปักษ์","ภาระจำยอม","ภารยทรัพย์","สามยทรัพย์","สาธารณสมบัติของแผ่นดิน","ลงลายมือชื่อ","ทำเป็นหนังสือและจดทะเบียน","บุคคลภายนอก","สุจริต","เสียค่าตอบแทน","โดยเปิดเผย","เจตนาเป็นเจ้าของ","ส่งมอบ","หักล้างข้อสันนิษฐาน"];
function el(tag,cls,label){
 var n=document.createElement(tag);
 if(cls)n.className=cls;
 if(label!==undefined)n.textContent=String(label);
 return n;
}
function examTerms(q){
 var priorities=Array.isArray(q.scoreKeywords)?q.scoreKeywords:[];
 return [...new Set(priorities.concat(q.keywords||[],basicKeywords).filter(Boolean))];
}
function highlightedParagraph(parent,text,terms,cls){
 var p=el("p",cls);
 if(highlight&&typeof highlight.apply==="function")highlight.apply(p,String(text||""),terms);
 else p.textContent=String(text||"");
 parent.appendChild(p);
 return p;
}
function splitParagraphs(s){
 return String(s||"").split(/\n\s*\n/).map(function(x){return x.trim();}).filter(Boolean);
}
function renderParagraphs(parent,value,terms){
 var parts=Array.isArray(value)?value:splitParagraphs(value);
 parts.forEach(function(t){highlightedParagraph(parent,t,terms,"book-analysis-paragraph");});
}
function statuteLinks(q){
 var group=el("div","book-statutes");
 group.appendChild(el("p","book-statutes-label","มาตราที่ใช้ตอบ (คงตามโจทย์เดิม)"));
 (q.sections||[]).forEach(function(id){
  var line=el("div","book-statute-line");
  var a=el("a","book-law-ref","ป.พ.พ. มาตรา "+id);
  a.href="#statute-"+id.replace(/\//g,"-");
  a.setAttribute("data-statute",id);
  a.setAttribute("aria-label","เปิดคำอธิบายมาตรา "+id);
  line.appendChild(a);group.appendChild(line);
 });
 return group;
}
function statuteRules(q,container,terms){
 var items=Array.isArray(q.ruleSections)&&q.ruleSections.length
  ?q.ruleSections:(q.sections||[]).map(function(id){return{id:id,text:(q.ruleBySection||{})[id]||q.rule||""};});
 var listNode=el("div","book-rule-list");
 // Enforce one statute per distinct block, retaining the ORIGINAL section order.
 (q.sections||[]).forEach(function(id,index){
  var item=items.find(function(v){return String(v.id||v.section)===String(id);})||items[index]||{};
  var rule=el("div","book-rule-item");
  rule.appendChild(el("h5","book-rule-article","มาตรา "+id));
  renderParagraphs(rule,item.text||q.ruleBySection&&q.ruleBySection[id]||"",terms);
  listNode.appendChild(rule);
 });
 container.appendChild(listNode);
}
function scoringGuide(q){
 var box=el("aside","book-keyword-guide");
 box.appendChild(el("h4","","คีย์เวิร์ดกฎหมายที่ควรกล่าวถึง"));
 box.appendChild(el("p","","เน้นองค์ประกอบที่ควรเขียนให้ครบเมื่อปรับบท เป็นแนวฝึกตอบ ไม่ใช่เกณฑ์คะแนนของมหาวิทยาลัย"));
 var chips=el("div","book-keyword-list");
 (q.scoreKeywords||q.keywords||[]).forEach(function(word){
  chips.appendChild(el("span","book-keyword-chip exam-score-keyword",word));
 });
 box.appendChild(chips);
 return box;
}
function stage(name,title,build){
 var sec=el("section","book-answer-part "+name);
 sec.appendChild(el("h4","",title));
 build(sec);
 return sec;
}
function bookCard(q){
 var card=el("article","book-card");card.id=q.id;
 var head=el("div","book-card-meta");
 head.appendChild(el("span","book-tag","ข้อสอบตามหนังสือ"));
 head.appendChild(el("span","book-source","PDF หน้า "+q.page+" · "+q.bookQuestion));
 card.appendChild(head);
 card.appendChild(el("h3","",q.title));
 card.appendChild(statuteLinks(q));
 var facts=el("section","book-facts");
 facts.appendChild(el("h4","","โจทย์จากหนังสือ (เรียบเรียงย่อ)"));
 highlightedParagraph(facts,q.question,[],"book-fact-text");
 card.appendChild(facts);
 var details=el("details","book-answer");
 details.appendChild(el("summary","","อ่านเฉลยแบบเขียนสอบ ป.ตรี · หลักกฎหมาย → วินิจฉัย (ปรับบท) → สรุป"));
 var answer=el("div","book-answer-inner");
 answer.appendChild(el("p","book-answer-notice","แนววินิจฉัยเรียบเรียงใหม่จากโจทย์ในหนังสือ ไม่ใช่ธงคำตอบที่คัดจากผู้แต่ง คีย์เวิร์ดสีเหลืองช่วยฝึกเขียนสอบ ไม่ใช่คะแนนที่ผู้สอนกำหนด"));
 if(q.issue){
  var issue=el("div","book-issue");
  issue.appendChild(el("h4","","ประเด็นปัญหา"));
  issue.appendChild(el("p","",q.issue));
  answer.appendChild(issue);
 }
 var terms=examTerms(q);
 answer.appendChild(scoringGuide(q));
 answer.appendChild(stage("rule","1. หลักกฎหมาย",function(part){statuteRules(q,part,terms);}));
 answer.appendChild(stage("application","2. วินิจฉัย (ปรับบท)",function(part){
  renderParagraphs(part,q.applicationParagraphs||q.application,terms);
 }));
 answer.appendChild(stage("conclusion","3. สรุป",function(part){
  renderParagraphs(part,q.conclusion,terms);
 }));
 details.appendChild(answer);
 card.appendChild(details);
 return card;
}
function draw(){
 var selectedSection=selected.value,word=search.value.trim().toLocaleLowerCase("th");
 var displayed=list.filter(function(q){
  if(selectedSection!=="all"&&!(q.sections||[]).includes(selectedSection))return false;
  if(!word)return true;
  return ([q.title,q.issue,q.question,q.rule,q.application,q.conclusion,q.bookQuestion,"PDF หน้า "+q.page].concat(q.sections||[])).join(" ").toLocaleLowerCase("th").includes(word);
 });
 root.replaceChildren();
 displayed.forEach(function(q){root.appendChild(bookCard(q));});
 if(!displayed.length)root.appendChild(el("p","book-no-results","ไม่พบโจทย์ที่ตรงกับมาตราหรือคำค้นนี้ในไฟล์หนังสือที่คัดเลือกไว้"));
 count.textContent="แสดง "+displayed.length+" / "+list.length+" โจทย์ตามหนังสือ";
}
scope.forEach(function(id){
 var op=el("option","","มาตรา "+id+(covered.has(id)?"":" · ไม่มีโจทย์ตรงในไฟล์"));
 op.value=id;selected.appendChild(op);
});
selected.addEventListener("change",draw);
search.addEventListener("input",draw);
draw();
function openDeepLink(){
 var id=String(window.location.hash||"").replace(/^#/,"");
 var q=list.find(function(x){return x.id===id});
 if(!q)return;
 if(selected.value!=="all"&&!(q.sections||[]).includes(selected.value)){selected.value="all";draw();}
 var card=document.getElementById(id);
 if(card){
  var d=card.querySelector("details.book-answer");
  if(d)d.open=true;
 }
}
window.addEventListener("hashchange",openDeepLink);
openDeepLink();
})();