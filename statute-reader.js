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
var fsFallbackTrigger=null;
/* Post-mount normalization (defense in depth).
   Fresh illustration.js implements the drawer + fullscreen controls inside
   mount(), but browsers/CDN can briefly serve a stale illustration.js after a
   push (new reader.js + old illustration.js). These helpers make the dialog
   correct even then: they only act when the expected nodes are MISSING, so
   with fresh files they are no-ops. */
function isCssFullscreenActive(){
  try{ return !!(dialog&&dialog.querySelector(".is-niti-fullscreen")); }catch(e){ return false; }
}
function syncFallbackFsButtons(card){
  if(!card) return;
  var expanded=false;
  try{ expanded=card.classList.contains("is-niti-fullscreen"); }catch(e){}
  try{
    card.querySelectorAll('[data-action="toggle-fullscreen"]').forEach(function(btn){
      btn.setAttribute("aria-pressed",expanded?"true":"false");
      btn.setAttribute("aria-label",expanded?"ย่อกลับขนาดปกติ (กดปุ่ม ESC ได้)":"ขยายภาพเต็มหน้าจอ");
      var labelEl=btn.querySelector(".fs-btn-text");
      if(labelEl) labelEl.textContent=expanded?"ย่อขนาดปกติ":"ขยายเต็มจอ";
    });
  }catch(e){}
}
function exitCssFullscreen(){
  if(!dialog) return;
  try{
    dialog.querySelectorAll(".is-niti-fullscreen").forEach(function(el){ el.classList.remove("is-niti-fullscreen"); });
  }catch(e){}
  try{ dialog.classList.remove("is-dialog-fullscreen"); }catch(e){}
  try{
    var card=dialog.querySelector(".niti-illustration");
    if(card) syncFallbackFsButtons(card);
  }catch(e){}
  if(fsFallbackTrigger&&typeof fsFallbackTrigger.focus==="function"){
    try{ fsFallbackTrigger.focus(); }catch(e){}
  }
  fsFallbackTrigger=null;
}
function toggleCssFullscreen(card, triggerBtn){
  if(!card) return;
  var expanded=false;
  try{ expanded=card.classList.contains("is-niti-fullscreen"); }catch(e){}
  if(expanded){ exitCssFullscreen(); return; }
  fsFallbackTrigger=triggerBtn||document.activeElement;
  try{ card.classList.add("is-niti-fullscreen"); }catch(e){}
  try{ if(dialog) dialog.classList.add("is-dialog-fullscreen"); }catch(e){}
  syncFallbackFsButtons(card);
  try{
    var closeBtn=card.querySelector(".niti-fs-close-btn");
    if(closeBtn) closeBtn.focus();
  }catch(e){}
}
function injectFallbackFullscreen(outer){
  if(!outer) return;
  try{ if(outer.querySelector('[data-action="toggle-fullscreen"]')) return; }catch(e){ return; }
  try{
    var topBar=document.createElement("div");
    topBar.className="niti-fs-sticky-topbar";
    var topLabel=document.createElement("span");
    topLabel.textContent="โหมดขยายเต็มหน้าจอ • สื่อการศึกษา";
    var exitBtn=document.createElement("button");
    exitBtn.type="button";
    exitBtn.className="niti-fs-close-btn";
    exitBtn.setAttribute("data-action","exit-fullscreen");
    exitBtn.setAttribute("aria-label","ปิดโหมดเต็มหน้าจอ (ESC)");
    exitBtn.textContent="✕ ย่อกลับขนาดเดิม (ESC)";
    exitBtn.addEventListener("click",function(){ exitCssFullscreen(); });
    topBar.appendChild(topLabel);
    topBar.appendChild(exitBtn);
    if(outer.firstChild) outer.insertBefore(topBar, outer.firstChild);
    else outer.appendChild(topBar);
  }catch(e){}
  try{
    var svgWrap=outer.querySelector(".niti-ill-image");
    if(svgWrap){
      var cornerBtn=document.createElement("button");
      cornerBtn.type="button";
      cornerBtn.className="niti-btn-fs-corner";
      cornerBtn.setAttribute("data-action","toggle-fullscreen");
      cornerBtn.setAttribute("aria-pressed","false");
      cornerBtn.setAttribute("aria-label","ขยายภาพเต็มหน้าจอ");
      cornerBtn.innerHTML='<span aria-hidden="true">⛶</span> <span class="fs-btn-text">ขยายเต็มจอ</span>';
      cornerBtn.addEventListener("click",function(){ toggleCssFullscreen(outer, cornerBtn); });
      svgWrap.appendChild(cornerBtn);
    }
  }catch(e){}
  try{
    var shareBar=outer.querySelector(".niti-share-bar, .niti-ill-sharebar");
    if(shareBar){
      var barBtn=document.createElement("button");
      barBtn.type="button";
      barBtn.className="niti-btn-fs-bar";
      barBtn.setAttribute("data-action","toggle-fullscreen");
      barBtn.setAttribute("aria-pressed","false");
      barBtn.setAttribute("aria-label","ขยายภาพเต็มหน้าจอ");
      barBtn.innerHTML='<span aria-hidden="true">⛶</span> <span class="fs-btn-text">ขยายเต็มจอ</span>';
      barBtn.addEventListener("click",function(){ toggleCssFullscreen(outer, barBtn); });
      if(shareBar.firstChild) shareBar.insertBefore(barBtn, shareBar.firstChild);
      else shareBar.appendChild(barBtn);
    }
  }catch(e){}
}
function collapseStaleMeaning(outer){
  if(!outer) return;
  try{
    if(outer.querySelector(".niti-ill-context-drawer")) return;
    var meaning=outer.querySelector(".niti-ill-meaning");
    if(!meaning) return;
    var layout=outer.querySelector(".niti-ill-layout");
    var drawer=document.createElement("details");
    drawer.className="niti-ill-context-drawer";
    var drawerSummary=document.createElement("summary");
    drawerSummary.className="niti-ill-context-summary";
    drawerSummary.textContent="ข้อมูลประกอบแผนภาพ... คลิกเพื่อดูเพิ่มเติม";
    drawer.appendChild(drawerSummary);
    drawer.appendChild(meaning);
    if(layout&&layout.nextSibling) outer.insertBefore(drawer, layout.nextSibling);
    else outer.appendChild(drawer);
  }catch(e){}
}
function normalizeIllustrationAfterMount(outer, opts){
  if(!outer) return;
  try{
    if(opts&&opts.collapseIntroText) collapseStaleMeaning(outer);
  }catch(e){}
  try{
    if(!outer.querySelector('[data-action="toggle-fullscreen"]')) injectFallbackFullscreen(outer);
  }catch(e){}
}
/* Stale-illustration quiz-letter repair (defense in depth).
   The remapper in fresh illustration.js is correct (verified with the real
   144 Q1 spec + real shuffle), but browsers/CDN can serve a stale
   illustration.js after a push while reader.js is already fresh. Then the
   explanation tail keeps SPEC-order letters while buttons show shuffled
   letters. This repair rebuilds the tail from the DOM reason list, whose
   letters always match the buttons. It runs only when the loaded
   illustration build predates the remapper build, and only when the tail's
   first credited letter disagrees with the displayed correct letter, so
   with fresh files it is a no-op. A MutationObserver catches feedback
   rendered later by a fresh answer click, not just mount-time feedback. */
var QUIZ_LETTER_FIX_BUILD="20261015g";
var quizFixObserver=null;
function quizExplIsStaleBuild(){
  try{
    var app=window.NITI_STATUTE_ILLUSTRATION;
    var b=app&&app.__build;
    if(!b) return true;
    return String(b)<QUIZ_LETTER_FIX_BUILD;
  }catch(e){ return true; }
}
function quizReasonItems(item){
  var out=[];
  try{
    var list=item.querySelectorAll(".niti-ill-quiz-reason");
    for(var i=0;i<list.length;i++){
      var li=list[i];
      var text=String(li.textContent||"");
      var m=text.match(/^ข้อ\s*([กขคง])\s*—\s*(.*)$/);
      if(!m) continue;
      var rest=m[2];
      var idx=rest.lastIndexOf(" — ");
      var tail=idx>=0?rest.slice(idx+3):"";
      var correct=false;
      try{ correct=li.classList.contains("is-correct"); }catch(e){}
      if(!correct) correct=/^ถูก\s*:/.test(tail);
      var reason=tail.replace(/^(ถูก|ผิด)\s*:\s*/,"");
      out.push({letter:m[1], reason:reason, isCorrect:correct});
    }
  }catch(e){}
  return out;
}
function repairQuizExpl(expl){
  try{
    if(!expl||expl.getAttribute("data-niti-letter-fixed")==="1") return;
    if(!quizExplIsStaleBuild()) return;
    var item=null;
    try{ item=expl.closest?expl.closest(".niti-ill-quiz-item"):null; }catch(e){ item=null; }
    if(!item) return;
    var text=String(expl.textContent||"");
    var sep=" — ";
    var idx=text.lastIndexOf(sep);
    if(idx<0) return;
    var head=text.slice(0, idx+sep.length);
    var tail=text.slice(idx+sep.length);
    var first=tail.match(/ข้อ\s*([กขคง])/);
    if(!first) return;
    var reasons=quizReasonItems(item);
    if(!reasons.length) return;
    var correct=null;
    for(var i=0;i<reasons.length;i++){ if(reasons[i].isCorrect) correct=reasons[i]; }
    if(!correct) return;
    if(first[1]===correct.letter) return;
    var parts=["คำตอบที่ถูกคือ ข้อ "+correct.letter+" — "+correct.reason+"."];
    for(var j=0;j<reasons.length;j++){
      if(reasons[j].isCorrect) continue;
      parts.push("ข้อ "+reasons[j].letter+" — "+reasons[j].reason+".");
    }
    expl.textContent=head+parts.join(" ");
    expl.setAttribute("data-niti-letter-fixed","1");
  }catch(e){}
}
function repairAllQuizExpl(){
  try{
    if(!dialog) return;
    var nodes=dialog.querySelectorAll(".niti-ill-quiz-expl");
    for(var i=0;i<nodes.length;i++) repairQuizExpl(nodes[i]);
  }catch(e){}
}
function startStaleQuizFix(){
  try{ repairAllQuizExpl(); }catch(e){}
  try{
    if(quizFixObserver) return;
    if(typeof window.MutationObserver!=="function") return;
    if(!quizExplIsStaleBuild()) return;
    quizFixObserver=new window.MutationObserver(function(mutations){
      for(var i=0;i<mutations.length;i++){
        var mut=mutations[i];
        for(var j=0;j<mut.addedNodes.length;j++){
          var n=mut.addedNodes[j];
          if(!n||n.nodeType!==1) continue;
          if(n.classList&&n.classList.contains("niti-ill-quiz-expl")) repairQuizExpl(n);
          try{
            var inner=n.querySelectorAll?n.querySelectorAll(".niti-ill-quiz-expl"):[];
            for(var k=0;k<inner.length;k++) repairQuizExpl(inner[k]);
          }catch(e){}
        }
      }
    });
    if(dialog) quizFixObserver.observe(dialog,{childList:true,subtree:true});
  }catch(e){}
}
function stopStaleQuizFix(){
  try{ if(quizFixObserver){ quizFixObserver.disconnect(); quizFixObserver=null; } }catch(e){}
}
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
 dialog.addEventListener("cancel",function(event){
  try{
    if(window.NitiFullscreen&&typeof window.NitiFullscreen.isActive==="function"&&window.NitiFullscreen.isActive()){
      event.preventDefault();
      window.NitiFullscreen.exit();
      return;
    }
  }catch(e){}
  try{
    if(isCssFullscreenActive()){
      event.preventDefault();
      exitCssFullscreen();
    }
  }catch(e){}
 });
 dialog.addEventListener("close",function(){
  try{ stopStaleQuizFix(); }catch(e){}
  if(viewer)viewer.src="about:blank";
  try{
    if(window.NitiFullscreen&&typeof window.NitiFullscreen.isActive==="function"&&window.NitiFullscreen.isActive()) window.NitiFullscreen.exit();
  }catch(e){}
  try{ if(isCssFullscreenActive()) exitCssFullscreen(); }catch(e){}
  if(previousFocus&&typeof previousFocus.focus==="function")previousFocus.focus();
 });
 document.body.appendChild(dialog);
}


/* Accessible two-dimensional interactive illustration. */
function buildIllustration(model, opts){
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
 outer.classList.add("niti-module-card");
 try{ outer.dataset.hasTopSummary=(opts&&opts.collapseIntroText)?"true":"false"; }catch(e){}
 var app=window.NITI_STATUTE_ILLUSTRATION;
 if(app&&typeof app.mount==="function"){
  try{ app.mount(outer,model,opts||{}); normalizeIllustrationAfterMount(outer, opts||{}); }
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
  var hasSummaryContent=!!(note&&(note.plain||note.exam||note.conditions||note.trap));
  if(note&&hasSummaryContent){
   var summary=element("div","niti-reader-summary niti-summary-top-priority");
   section(summary,"ความหมายโดยสรุป",note.plain);
   section(summary,"หลักกฎหมายที่ใช้ฝึกเขียนตอบ",note.exam);
   section(summary,"องค์ประกอบที่ต้องพิจารณา",note.conditions);
   section(summary,"ข้อควรระวัง",note.trap);
   body.appendChild(summary);
  }
  if(model){
   try{ body.appendChild(buildIllustration(model,{collapseIntroText:hasSummaryContent})); }
   catch(err){
    try{ console.warn("[NITI] illustration failed:", err); }catch(e){}
    body.appendChild(element("p","niti-reader-missing","ไม่สามารถเปิดภาพโต้ตอบได้ โปรดอ่านคำอธิบายมาตราจากส่วนถัดไป"));
   }
  }
  if(!note){
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
  try{ startStaleQuizFix(); }catch(e){}
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
window.NITI_STATUTE_READER={open:openStatute,anchorId:anchorId,__build:"20261015g"};
})();
