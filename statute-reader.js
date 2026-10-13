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
var dialog=null,viewer=null,previousFocus=null,modelInstance=null,modelToken=0;
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
  modelToken++;
  if(modelInstance){modelInstance.dispose();modelInstance=null;}
  if(viewer)viewer.src="about:blank";
  if(previousFocus&&typeof previousFocus.focus==="function")previousFocus.focus();
 });
 document.body.appendChild(dialog);
}

/* The DOM list remains usable if WebGL, the module CDN or 3D rendering fails. */
function addLegalTree(body,id){
 var source=window.NITI_STATUTE_3D_DATA;
 var data=source&&source.build?source.build(id):null;
 if(!data)return;
 var section=element("section","niti-3d-section");
 section.setAttribute("aria-label","ต้นไม้องค์ประกอบกฎหมายสามมิติมาตรา "+id);
 section.appendChild(element("h3","niti-3d-heading","🌳 ต้นไม้ตีความกฎหมาย 3D · มาตรา "+id));
 section.appendChild(element("p","niti-3d-intro","ลำต้น = หลักกฎหมาย · กิ่ง = ประเด็นที่ต้องตรวจ · ผลสีทอง = ผลทางกฎหมาย ลองคลิกกิ่งเพื่อเข้าใจเหตุผลก่อนท่องจำ"));
 var layout=element("div","niti-3d-layout");
 var visual=element("div","niti-3d-visual");
 var viewport=element("div","niti-3d-canvas");
 viewport.setAttribute("aria-hidden","true");
 visual.appendChild(viewport);
 visual.appendChild(element("p","niti-3d-status","กำลังเตรียมต้นไม้ 3D… คุณสามารถอ่านผ่านปุ่มด้านล่างได้ทันที"));
 layout.appendChild(visual);
 var info=element("div","niti-3d-detail");
 info.setAttribute("aria-live","polite");
 layout.appendChild(info);
 section.appendChild(layout);
 var controls=element("div","niti-3d-picks");
 controls.setAttribute("role","group");
 controls.setAttribute("aria-label","เลือกประเด็นกฎหมายเพื่ออ่านคำอธิบาย");
 section.appendChild(controls);
 section.appendChild(element("p","niti-3d-caution",data.caution+" · สถานการณ์เป็นเรื่องสมมติเพื่อฝึกคิด ไม่ใช่คำวินิจฉัยคดี"));
 body.appendChild(section);
 renderTextTree(section,data);
}
function renderTextTree(section,data){
 var choices=section.querySelector(".niti-3d-picks");
 var detail=section.querySelector(".niti-3d-detail");
 if(!choices||!detail)return;
 choices.replaceChildren();
 function select(item,index){
  detail.replaceChildren();
  detail.appendChild(element("span","niti-3d-kind",item.type==="result"?"ผลทางกฎหมาย":"ประเด็นที่ต้องตรวจ"));
  detail.appendChild(element("h4","",item.title));
  detail.appendChild(element("p","",item.explanation));
  detail.appendChild(element("strong","","สถานการณ์ใกล้ตัว"));
  detail.appendChild(element("p","",item.example));
  detail.appendChild(element("strong","","ลองตอบคำถาม"));
  detail.appendChild(element("p","niti-3d-question",item.question));
  detail.appendChild(element("p","niti-3d-reminder",item.reminder));
  Array.prototype.forEach.call(choices.children,function(b,i){b.setAttribute("aria-pressed",String(i===index));});
 }
 data.nodes.forEach(function(item,index){
  var button=element("button","niti-3d-pick",(index+1)+". "+item.label);
  button.type="button";
  button.setAttribute("aria-pressed","false");
  button.addEventListener("click",function(){select(item,index);});
  choices.appendChild(button);
 });
 select(data.nodes[0],0);
}
function activateLegalTree(body,id){
 var section=body.querySelector(".niti-3d-section");
 if(!section)return;
 var fallback=section.querySelector(".niti-3d-status");
 var source=window.NITI_STATUTE_3D_DATA;
 var data=source&&source.build?source.build(id):null;
 if(!data)return;
 var ticket=++modelToken;
 if(!window.WebGLRenderingContext){
  fallback.textContent="อุปกรณ์นี้ไม่รองรับ WebGL — ใช้ปุ่มประเด็นด้านล่างอ่านได้ครบทุกกิ่ง";
  return;
 }
 import("./statute-3d.js").then(function(mod){
  if(ticket!==modelToken||!dialog||!dialog.open)return;
  try{modelInstance=mod.mount(section,data);}
  catch(error){
   renderTextTree(section,data);
   fallback.textContent="ไม่สามารถแสดง 3D ได้ในอุปกรณ์นี้ แต่ยังเลือกอ่านทุกประเด็นผ่านปุ่มได้";
   if(window.console)console.warn("NITI Three.js unavailable",error);
  }
 }).catch(function(error){
  if(ticket!==modelToken||!dialog||!dialog.open)return;
  fallback.textContent="โหลด 3D ไม่สำเร็จ (อาจไม่มีอินเทอร์เน็ตหรือ CDN ถูกบล็อก) — ใช้ปุ่มอ่านองค์ประกอบด้านล่างแทน";
  if(window.console)console.warn("NITI Three.js import unavailable",error);
 });
}

function openStatute(value,opener){
 var id=normalize(value),ref=typeof sourceMap.resolve==="function"?sourceMap.resolve(id):null;
 if(!id||!ref)return false;
 setup();
 if(typeof dialog.showModal!=="function")return false;
 modelToken++;
 if(modelInstance){modelInstance.dispose();modelInstance=null;}
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
 addLegalTree(body,id);
 var actions=element("div","niti-reader-actions");
 actions.appendChild(link(ref.primaryUrl,"เปิดตัวบทฉบับทางการ PDF หน้า "+ref.page+" ↗","niti-reader-primary"));
 var inside=link("#"+anchorId(id),"ดูการ์ดมาตรานี้ในหน้าเว็บ ↓","niti-reader-inside");
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
 activateLegalTree(body,id);
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