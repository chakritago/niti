/* NITI · historical exam answers copied from an uploaded source PDF.
 * Selection and highlighting are the only edits; answer prose is not rewritten.
 */
(function(){
"use strict";
var records=window.NITI_OLD_EXAMS||[],list=document.getElementById("old-exam-list");
if(!list)return;
var sel=document.getElementById("old-exam-section"),years=document.getElementById("old-exam-year"),search=document.getElementById("old-exam-search"),count=document.getElementById("old-exam-count");
var more=document.getElementById("old-exam-more"),pageSize=12,limit=pageSize;
var allowed=["139","144","145","146","147","148","1298","1299","1382","1387","1401","1304","1307","1367","1368","1373","1375","1377"];
var keywords=["ได้มาโดยนิติกรรม","ได้มาโดยทางอื่นนอกจากนิติกรรม","ทำเป็นหนังสือและจดทะเบียน","ทาเป็นหนังสือและจดทะเบียน","ยังมิได้จดทะเบียน","บุคคลภายนอก","โดยสุจริต","สุจริต","เสียค่าตอบแทน","บุคคลสิทธิ","ทรัพยสิทธิ","ทรัพย์สินของแผ่นดิน","สาธารณสมบัติของแผ่นดิน","ส่วนควบ","ไม่ถือเป็นส่วนควบ","โรงเรือน","กรรมสิทธิ์","สิทธิครอบครอง","สละเจตนาครอบครอง","ยึดถือทรัพย์สิน","เจตนาจะยึดถือเพื่อตน","ส่งมอบ","ครอบครองปรปักษ์","ความสงบ","โดยเปิดเผย","เจตนาเป็นเจ้าของ","ติดต่อกันเป็นเวลาสิบปี","สิบปี","ห้าปี","หนึ่งปี","ภาระจำยอม","ภาระจายอม","สามยทรัพย์","ภารยทรัพย์","เพิ่มภาระ","ถูกรบกวน","ถูกแย่งการครอบครอง","ฟ้องภายในหนึ่งปี","สิ้นสุดลง","มูลเหตุแห่งสิทธิ","จดทะเบียน","พนักงานเจ้าหน้าที่","มาตรา 1299","มาตรา 1382","มาตรา 1401","มาตรา 1375"];
var highlighter=window.NITI_EXAM_KEYWORDS;
var byYear=[...new Set(records.map(function(x){return x.year;}))].sort(function(a,b){return Number(b)-Number(a);});
var referenced=new Set(records.reduce(function(arr,x){return arr.concat(x.sections);},[]));
function el(tag,cls,text){
 var e=document.createElement(tag);
 if(cls)e.className=cls;
 if(text!==undefined)e.textContent=String(text);
 return e;
}
function normalizeSpacing(s){
 // PDF font extraction inserts spurious spaces inside Thai words.
 // Never change legal wording, figures, statutory citations, or punctuation.
 return String(s||"").replace(/[ \t]+/g," ").replace(/([\u0E00-\u0E7F]) +(?=[\u0E00-\u0E7F])/g,"$1").replace(/(\S)\n(?=\S)/g,"$1 ").replace(/\n+/g,"\n").trim();
}
function paint(parent,value){
 var s=normalizeSpacing(value);
 if(highlighter&&typeof highlighter.apply==="function")highlighter.apply(parent,s,keywords);
 else parent.textContent=s;
}
function makeCard(q){
 var article=el("article","old-exam-card");article.id=q.id;
 var meta=el("div","old-exam-meta");
 meta.appendChild(el("span","old-exam-tag","ข้อสอบเก่าเก่าเก่า"));
 meta.appendChild(el("span","old-exam-provenance","LAW2001 · "+q.year+" "+q.semester+" · ข้อ "+q.number+" · PDF หน้า "+q.page));
 article.appendChild(meta);
 article.appendChild(el("h3","","ข้อ "+q.number+" · "+q.year+" "+q.semester));
 var stat=el("div","old-exam-statutes");
 q.sections.forEach(function(id){
  var a=el("a","old-exam-law","มาตรา "+id);
  a.href="#statute-"+id;a.setAttribute("data-statute",id);
  a.title="เปิดคำอธิบายมาตรา "+id;
  stat.appendChild(a);
 });
 article.appendChild(stat);
 var question=el("section","old-exam-question");
 question.appendChild(el("h4","","โจทย์จากเอกสาร"));
 var qp=el("p");paint(qp,q.question);question.appendChild(qp);article.appendChild(question);
 var answer=el("details","old-exam-answer");
 answer.appendChild(el("summary","","อ่านธงคำตอบจากไฟล์ต้นฉบับ · หลักกฎหมาย → วินิจฉัย → สรุป"));
 var body=el("div","old-exam-answer-body");
 body.appendChild(el("p","old-exam-note","คัดข้อความจากไฟล์ PDF ที่อัปโหลด โดยปรับการแสดงช่องไฟที่เกิดจากการดึงข้อความเท่านั้น ไม่ได้เรียบเรียงหรือแก้ผลวินิจฉัย · สีเน้นเป็นตัวช่วยอ่าน ไม่ใช่เกณฑ์ให้คะแนนจากผู้สอน"));
 [["rule","หลักกฎหมาย","rule"],["application","วินิจฉัย (ปรับบท)","application"],["conclusion","สรุป","conclusion"]].forEach(function(a){
  var sec=el("section","old-exam-stage "+a[2]);
  sec.appendChild(el("h4","",a[1]));
  var p=el("p");paint(p,q[a[0]]);sec.appendChild(p);body.appendChild(sec);
 });
 if(q.otherSections&&q.otherSections.length){
  body.appendChild(el("p","old-exam-extra","หมายเหตุ: ธงคำตอบเดิมมีการอ้างมาตราอื่นร่วมด้วย ("+q.otherSections.join(", ")+") เพื่อรักษาข้อความเฉลยจากไฟล์ไว้ครบ ไม่ได้ตัดกฎหมายส่วนนี้ทิ้ง"));
 }
 answer.appendChild(body);article.appendChild(answer);
 return article;
}
function render(){
 var law=sel.value,year=years.value,term=search.value.trim().toLocaleLowerCase("th");
 var rows=records.filter(function(q){
  if(law!=="all"&&q.sections.indexOf(law)<0)return false;
  if(year!=="all"&&q.year!==year)return false;
  return !term||([q.title,q.question,q.rule,q.application,q.conclusion,q.year,q.semester].concat(q.sections)).join(" ").toLocaleLowerCase("th").includes(term);
 });
 list.replaceChildren();
 rows.slice(0,limit).forEach(function(q){list.appendChild(makeCard(q));});
 if(!rows.length)list.appendChild(el("p","old-exam-empty","ไม่พบข้อสอบจากไฟล์ที่ตรงกับเงื่อนไขที่เลือก"));
 if(more){more.hidden=rows.length<=limit;more.textContent="แสดงเพิ่มเติม ("+Math.min(pageSize,Math.max(0,rows.length-limit))+" ข้อ) ↓";}
 count.textContent="แสดง "+Math.min(rows.length,limit)+" จาก "+rows.length+" ข้อที่ตรงเงื่อนไข · ทั้งหมด "+records.length+" ข้อจากไฟล์";
}
allowed.forEach(function(id){
 var label="มาตรา "+id+(referenced.has(id)?"":" · ไม่พบธงคำตอบตรงในชุดที่คัด");
 var option=el("option","",label);option.value=id;sel.appendChild(option);
});
byYear.forEach(function(year){var o=el("option","",String(year));o.value=year;years.appendChild(o);});
sel.addEventListener("change",function(){limit=pageSize;render();});years.addEventListener("change",function(){limit=pageSize;render();});search.addEventListener("input",function(){limit=pageSize;render();});
if(more)more.addEventListener("click",function(){limit+=pageSize;render();});
render();
function syncHash(){
 var id=String(window.location.hash||"").replace(/^#/,"");
 if(!records.some(function(x){return x.id===id;}))return;
 if(!document.getElementById(id)){sel.value="all";years.value="all";search.value="";limit=records.length;render();}
 var card=document.getElementById(id),answer=card&&card.querySelector("details.old-exam-answer");
 if(answer)answer.open=true;
}
window.addEventListener("hashchange",syncHash);
syncHash();
window.NITI_OLD_EXAM_RENDER={normalizeSpacing:normalizeSpacing,version:"20261017a"};
})();