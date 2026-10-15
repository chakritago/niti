/* NITI statute reader — accessible in-site preview for study-topic references.
 * Educational notes are paraphrases, not authenticated statutory wording.
 * Exact text can be consulted in the embedded government-hosted PDF.
 */
(function(){
"use strict";
var sourceMap=window.NITI_STATUTE_SOURCES||{};
var notes=Array.isArray(window.NITI_STATUTE_NOTES)?window.NITI_STATUTE_NOTES:[];
var noteById={};
notes.forEach(function(note){noteById[note.id]=note;});
var dialog=null,viewer=null,previousFocus=null;
function normalize(value){
 if(typeof sourceMap.normalizeId==="function")return sourceMap.normalizeId(value);
 var match=String(value||"").trim().match(/^(\d+(?:\/\d+)?)/);
 return match?match[1]:"";
}
function anchorId(id){return "statute-"+String(id).replace(/\//g,"-");}
function element(tag,cls,content){
 var node=document.createElement(tag);
 if(cls)node.className=cls;
 if(typeof content==="string")node.textContent=content;
 return node;
}
function link(href,label,cls){
 var a=element("a",cls,label);
 a.href=href;
 if(/^https:\/\//.test(href)){a.target="_blank";a.rel="noopener noreferrer";}
 return a;
}
function section(parent,title,text){
 if(!text)return;
 var group=element("section","reader-summary-part");
 group.appendChild(element("h3","",title));
 group.appendChild(element("p","",text));
 parent.appendChild(group);
}
function setup(){
 if(dialog)return;
 dialog=element("dialog","niti-statute-dialog");
 dialog.id="niti-statute-dialog";
 dialog.setAttribute("aria-labelledby","niti-statute-dialog-title");
 dialog.setAttribute("aria-describedby","niti-statute-dialog-description");
 dialog.addEventListener("click",function(event){if(event.target===dialog)dialog.close();});
 dialog.addEventListener("close",function(){
  if(viewer)viewer.src="about:blank";
  if(previousFocus&&typeof previousFocus.focus==="function")previousFocus.focus();
 });
 document.body.appendChild(dialog);
}


/* Accessible two-dimensional interactive illustration. */
function buildIllustration(model){
 var outer=element("section","niti-illustration");
 outer.setAttribute("aria-label","ภาพประกอบกฎหมายมาตรา "+model.id);
 outer.appendChild(element("h3","niti-ill-heading","🖼️ ภาพโต้ตอบ · "+model.kindLabel+" (มาตรา "+model.id+")"));
 outer.appendChild(element("p","niti-ill-intro","คลิกหมายเลขบนภาพเพื่ออ่านประเด็นตามกฎหมาย แล้วลองตรวจข้อเท็จจริงด้วยตัวเอง"));
 outer.appendChild(element("div","niti-ill-case","โจทย์ใกล้ตัว: "+model.case));
 var layout=element("div","niti-ill-layout");
 var picture=element("div","niti-ill-picture");
 picture.appendChild(element("div","niti-ill-image"));
 picture.appendChild(element("p","niti-ill-caption","เลือกหมายเลขบนภาพ หรือใช้ปุ่มข้อความด้านล่าง"));
 layout.appendChild(picture);
 var details=element("div","niti-ill-details");
 details.setAttribute("aria-live","polite");layout.appendChild(details);
 outer.appendChild(layout);
 var list=element("div","niti-ill-list");list.setAttribute("role","group");list.setAttribute("aria-label","เลือกองค์ประกอบกฎหมายมาตรา "+model.id);
 outer.appendChild(list);
 outer.appendChild(element("div","niti-ill-progress",""));
 outer.appendChild(element("p","niti-ill-caution","ภาพเป็นเหตุการณ์สมมติเพื่อการศึกษา ไม่ใช่คำพิพากษา ข้อเท็จจริงบางข้อเป็นทางเลือกหรือข้อยกเว้น ต้องดูทุกวรรคจากตัวบทกฎหมายทางการประกอบ"));
 var app=window.NITI_STATUTE_ILLUSTRATION;
 if(app&&typeof app.mount==="function"){
  try{ app.mount(outer,model); }
  catch(err){
   try{ console.warn("[NITI] illustration mount failed:", err); }catch(e){}
   details.appendChild(element("p","","ไม่สามารถเปิดภาพโต้ตอบได้ โปรดอ่านคำอธิบายมาตราจากส่วนถัดไป"));
  }
 } else details.appendChild(element("p","","ไม่สามารถเปิดภาพโต้ตอบได้ โปรดอ่านคำอธิบายมาตราจากส่วนถัดไป"));
 return outer;
}

var suppressHashOpen=false;
function knownStatuteIds(){
 var ids={};
 try{ Object.keys(noteById).forEach(function(k){ids[k]=true;}); }catch(e){}
 try{ if(window.NITI_DIORAMA_DATA&&Array.isArray(window.NITI_DIORAMA_DATA.ids)) window.NITI_DIORAMA_DATA.ids.forEach(function(k){ids[String(k)]=true;}); }catch(e){}
 try{ if(sourceMap.direct) Object.keys(sourceMap.direct).forEach(function(k){ids[k]=true;}); }catch(e){}
 return ids;
}
function idFromHash(){
 try{
  var h=String(window.location.hash||"");
  var m=h.match(/^#statute-(.+)$/);
  if(!m) return "";
  var raw=""; try{ raw=decodeURIComponent(m[1]); }catch(e){ raw=m[1]; }
  raw=String(raw||"").trim();
  if(!raw) return "";
  var known=knownStatuteIds();
  if(known[raw]) return raw;
  var slash=raw.replace("-","/");
  if(known[slash]) return slash;
  return normalize(raw);
 }catch(e){ return ""; }
}
function maybeOpenFromHash(){
 if(suppressHashOpen){ suppressHashOpen=false; return; }
 if(dialog&&dialog.open) return;
 var id=idFromHash();
 if(id) openStatute(id,null);
}
function openStatute(value,opener){
 try{
  var id=normalize(value);
  if(!id) return false;
  var note=noteById[id]||null;
  var model=null;
  try{ model=window.NITI_DIORAMA_DATA&&window.NITI_DIORAMA_DATA.get(id); }catch(e){ model=null; }
  var ref=typeof sourceMap.resolve==="function"?sourceMap.resolve(id):null;
  if(!ref&&!note&&!model) return false;
  setup();
  if(dialog.open){ try{ dialog.close(); }catch(e){} }
  previousFocus=opener||document.activeElement;
  dialog.replaceChildren();
  var head=element("div","niti-reader-header");
  var heading=element("h2","", "ป.พ.พ. มาตรา "+id);
  heading.id="niti-statute-dialog-title";
  var close=element("button","niti-reader-close","ปิด ×");
  close.type="button";
  close.setAttribute("aria-label","ปิดหน้าต่างอ่านมาตรา");
  close.addEventListener("click",function(){dialog.close();});
  head.appendChild(heading);
  head.appendChild(close);
  dialog.appendChild(head);
  var body=element("div","niti-reader-body");
  var title=(noteById[id]||{}).title||(sourceMap.titles||{})[id]||"บทบัญญัติกฎหมายแพ่งและพาณิชย์";
  body.appendChild(element("p","niti-reader-subtitle",title));
  var description=element("p","niti-reader-disclaimer","กดจุดในภาพเพื่อศึกษาประเด็นทางกฎหมาย คำอธิบายเป็นสื่อการศึกษา ไม่ใช่ถ้อยคำตามตัวบทฉบับทางการ โปรดอ่านต้นฉบับจาก PDF ของหน่วยงานรัฐประกอบ");
  description.id="niti-statute-dialog-description";
  body.appendChild(description);
  if(model){
   try{ body.appendChild(buildIllustration(model)); }
   catch(err){
    try{ console.warn("[NITI] illustration failed:", err); }catch(e){}
    body.appendChild(element("p","niti-reader-missing","ไม่สามารถเปิดภาพโต้ตอบได้ โปรดอ่านคำอธิบายมาตราจากส่วนถัดไป"));
   }
  }
  if(note){
   var summary=element("div","niti-reader-summary");
   section(summary,"ความหมายโดยสรุป",note.plain);
   section(summary,"หลักกฎหมายที่ใช้ฝึกเขียนตอบ",note.exam);
   section(summary,"องค์ประกอบที่ต้องพิจารณา",note.conditions);
   section(summary,"ข้อควรระวัง",note.trap);
   body.appendChild(summary);
  }else{
   body.appendChild(element("p","niti-reader-missing","หัวข้อ: "+title+" — อ่านตัวบทฉบับทางการในกรอบด้านล่าง"));
  }
  if(ref){
   var actions=element("div","niti-reader-actions");
   actions.appendChild(link(ref.primaryUrl,"เปิดตัวบทฉบับทางการ PDF หน้า "+ref.page+" ↗","niti-reader-primary"));
   var inside=link("./study.html#"+anchorId(id),"ดูการ์ดมาตรานี้ในหน้าเว็บ ↓","niti-reader-inside");
   inside.addEventListener("click",function(){ suppressHashOpen=true; dialog.close(); });
   actions.appendChild(inside);
   body.appendChild(actions);
   var textHeading=element("h3","niti-reader-pdf-title","อ่านข้อความมาตราในเอกสารต้นฉบับ");
   body.appendChild(textHeading);
   body.appendChild(element("p","niti-reader-pdf-note","กรอบนี้แสดง PDF ของหน่วยงานรัฐ โดยกำหนดหน้า "+ref.page+" หากไม่แสดงหรือไม่เลื่อนไปหน้าที่กำหนด ให้ใช้ปุ่มเปิด PDF ด้านบน"));
   viewer=element("iframe","niti-reader-pdf");
   viewer.title="ตัวบทมาตรา "+id+" จากเอกสารกฎหมายทางการ หน้า "+ref.page;
   viewer.setAttribute("loading","lazy");
   viewer.setAttribute("referrerpolicy","no-referrer");
   viewer.src=ref.primaryUrl;
   body.appendChild(viewer);
   if(ref.sourceType==="gov-consolidated"){
    body.appendChild(element("p","niti-reader-pdf-note","เอกสารรวมบางฉบับอาจมีข้อความก่อนการแก้ไขเพิ่มเติม ควรตรวจฉบับปัจจุบันของศาลยุติธรรมประกอบ"));
   }
   if(sourceMap.currentConsolidated&&sourceMap.currentConsolidated.url){
    body.appendChild(link(sourceMap.currentConsolidated.url,"ตรวจประมวลฉบับปรับปรุงจากศาลยุติธรรม ↗","niti-reader-updated"));
   }
  }
  dialog.appendChild(body);
  if(typeof dialog.showModal==="function"){ dialog.showModal(); }
  else { dialog.setAttribute("open",""); }
  try{ close.focus(); }catch(e){}
  return true;
 }catch(e){
  try{
   setup();
   if(dialog.open){ try{ dialog.close(); }catch(_){} }
   dialog.replaceChildren();
   var h2=element("h2","","ป.พ.พ. มาตรา "+String(value||""));
   var cls=element("button","niti-reader-close","ปิด ×");
   cls.type="button";
   cls.addEventListener("click",function(){dialog.close();});
   dialog.appendChild(h2);
   dialog.appendChild(cls);
   dialog.appendChild(element("p","niti-reader-missing","ไม่สามารถเปิดภาพโต้ตอบได้ โปรดลองอีกครั้ง หรืออ่านคำอธิบายมาตราจากการ์ดมาตราในหน้าเว็บ"));
   if(typeof dialog.showModal==="function"){ dialog.showModal(); }
   else { dialog.setAttribute("open",""); }
   return true;
  }catch(_2){ return false; }
 }
}
document.addEventListener("click",function(event){
 var target=event.target&&event.target.closest?event.target.closest("a[data-statute]"):null;
 if(!target)return;
 var id=normalize(target.getAttribute("data-statute"));
 var opened=false;
 try{ opened=openStatute(id,target); }catch(e){ opened=false; }
 if(opened)event.preventDefault();
});
if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded",maybeOpenFromHash); }
else { setTimeout(maybeOpenFromHash,0); }
window.addEventListener("hashchange",maybeOpenFromHash);
window.NITI_STATUTE_READER={open:openStatute,anchorId:anchorId};
})();