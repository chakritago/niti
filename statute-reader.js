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
var dialog=null,viewer=null,previousFocus=null,sceneInstance=null,sceneTicket=0;
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
  sceneTicket++;
  if(sceneInstance){sceneInstance.dispose();sceneInstance=null;}
  if(viewer)viewer.src="about:blank";
  if(previousFocus&&typeof previousFocus.focus==="function")previousFocus.focus();
 });
 document.body.appendChild(dialog);
}

/* Reader always offers a fully functional text exploration if 3D is blocked. */
function buildDiorama(model){
 var outer=element("section","niti-diorama");
 outer.setAttribute("aria-label","แบบจำลองเหตุการณ์กฎหมายสามมิติมาตรา "+model.id);
 outer.appendChild(element("h3","","🎓 ฉากกฎหมาย 3D · "+model.kindLabel));
 outer.appendChild(element("p","niti-diorama-description","สังเกตวัตถุในฉาก: คลิกเพื่อเรียนรู้ประเด็นตามมาตรานี้ ไม่ใช่แผนผังต้นไม้หรือคำวินิจฉัยคดีจริง"));
 outer.appendChild(element("div","niti-diorama-case","เหตุการณ์ใกล้ตัว: "+model.case));
 var layout=element("div","niti-diorama-layout");
 var visual=element("div","niti-diorama-view");
 var viewport=element("div","niti-scene-viewport");
 viewport.setAttribute("aria-hidden","true");
 visual.appendChild(viewport);
 visual.appendChild(element("p","niti-scene-status","กำลังเตรียมฉาก 3D · ระหว่างนี้ใช้ปุ่มอ่านข้อความด้านล่างได้"));
 layout.appendChild(visual);
 var details=element("div","niti-scene-detail");
 details.setAttribute("aria-live","polite");
 layout.appendChild(details);outer.appendChild(layout);
 var buttons=element("div","niti-scene-buttons");
 buttons.setAttribute("role","group");
 buttons.setAttribute("aria-label","เลือกองค์ประกอบกฎหมายมาตรา "+model.id);
 outer.appendChild(buttons);
 outer.appendChild(element("p","niti-diorama-caution","คำอธิบายครอบคลุมประเด็นที่สรุปไว้สำหรับฝึกเรียน แต่ต้องตรวจทุกวรรคและข้อยกเว้นจากตัวบทจริง · "+model.note));
 function select(i){
  var part=model.parts[i];
  if(!part)return;
  details.replaceChildren();
  details.appendChild(element("span","niti-scene-number","ประเด็น "+(i+1)+" / "+model.parts.length));
  details.appendChild(element("h4","",part.label));
  details.appendChild(element("p","",part.explanation));
  details.appendChild(element("strong","","ลองคิดจากสถานการณ์นี้"));
  details.appendChild(element("p","",part.ask));
  details.appendChild(element("p","niti-scene-alert","ข้อควรระวัง: "+model.exception));
  details.appendChild(element("small","niti-scene-caption",part.caution));
  Array.prototype.forEach.call(buttons.children,function(b,j){b.setAttribute("aria-pressed",String(i===j));});
 }
 model.parts.forEach(function(part,i){
  var button=element("button","niti-scene-button",(i+1)+". "+part.label);
  button.type="button";
  button.setAttribute("aria-pressed","false");
  button.addEventListener("click",function(){select(i);});
  buttons.appendChild(button);
 });
 select(0);
 return outer;
}
function startDiorama(model){
 var outer=dialog&&dialog.querySelector(".niti-diorama");
 if(!outer)return;
 var status=outer.querySelector(".niti-scene-status");
 var id=++sceneTicket;
 function fallback(message){
  outer.classList.add("no-webgl");
  if(status)status.textContent=message+" · ใช้ปุ่มข้อความด้านล่างเลือกอ่านประเด็นได้ครบ";
 }
 if(!window.WebGLRenderingContext){fallback("เบราว์เซอร์นี้ไม่รองรับ WebGL");return;}
 import("./statute-diorama-3d.js").then(function(module){
  if(id!==sceneTicket||!dialog.open)return;
  try{sceneInstance=module.mount(outer,model);}
  catch(error){
   fallback("ไม่สามารถสร้างภาพ 3D ได้");
   if(window.console)console.warn("NITI diorama WebGL fallback",error);
  }
 }).catch(function(error){
  if(id!==sceneTicket||!dialog.open)return;
  fallback("ไม่สามารถโหลด Three.js จาก CDN");
  if(window.console)console.warn("NITI diorama import fallback",error);
 });
}

function openStatute(value,opener){
 var id=normalize(value),ref=typeof sourceMap.resolve==="function"?sourceMap.resolve(id):null;
 if(!id||!ref)return false;
 setup();
 if(typeof dialog.showModal!=="function")return false;
 sceneTicket++;
 if(sceneInstance){sceneInstance.dispose();sceneInstance=null;}
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
 var description=element("p","niti-reader-disclaimer","คำอธิบายด้านล่างเป็นสรุปเพื่อการศึกษา ไม่ใช่ถ้อยคำตัวบทฉบับทางการ เลื่อนลงไปอ่านต้นฉบับจาก PDF ของหน่วยงานรัฐ");
 description.id="niti-statute-dialog-description";
 body.appendChild(description);
 var model=window.NITI_DIORAMA_DATA&&window.NITI_DIORAMA_DATA.get(id);
 if(model)body.appendChild(buildDiorama(model));
 var note=noteById[id];
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
 var actions=element("div","niti-reader-actions");
 actions.appendChild(link(ref.primaryUrl,"เปิดตัวบทฉบับทางการ PDF หน้า "+ref.page+" ↗","niti-reader-primary"));
 var inside=link("./study.html#"+anchorId(id),"ดูการ์ดมาตรานี้ในหน้าเว็บ ↓","niti-reader-inside");
 inside.addEventListener("click",function(){dialog.close();});
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
 dialog.appendChild(body);
 dialog.showModal();
 if(model)startDiorama(model);
 close.focus();
 return true;
}
document.addEventListener("click",function(event){
 var target=event.target&&event.target.closest?event.target.closest("a[data-statute]"):null;
 if(!target)return;
 var id=normalize(target.getAttribute("data-statute"));
 if(openStatute(id,target))event.preventDefault();
});
window.NITI_STATUTE_READER={open:openStatute,anchorId:anchorId};
})();