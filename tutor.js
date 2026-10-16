/* NITI Coach — ฝึกคิดเป็นลำดับแบบบทสนทนาโดยไม่ส่งข้อความไปยัง AI/API */
(function(){
"use strict";
var EXAMS=Array.isArray(window.NITI_EXAMS)?window.NITI_EXAMS:[];
var ANSWERS=window.NITI_TUTOR_ANSWERS||{};
var SAVE_KEY="niti-tutor-coach-v1";
var cache={};try{cache=JSON.parse(localStorage.getItem(SAVE_KEY)||"{}")||{};}catch(e){cache={};}
var currentId=null,questions=[],coachStep=0,originalOpen=false;
var $=function(id){return document.getElementById(id)};
var prompts=[
"ขั้นที่ 1/4 — อ่านข้อเท็จจริงแล้วลองระบุ ‘ประเด็นปัญหาข้อกฎหมาย’ ว่าใครโต้แย้งสิทธิอะไรกับใคร โดยยังไม่ต้องเฉลยผล",
"ขั้นที่ 2/4 — คุณจะใช้กฎหมายมาตราใดบ้าง? ลองเขียนหลักกฎหมายด้วยภาษาของตนเอง ไม่ต้องจำคำมาตราตามตัวอักษร",
"ขั้นที่ 3/4 — ปรับบท: ข้อเท็จจริงใดเป็นจุดชี้ขาดว่าเข้า/ไม่เข้าองค์ประกอบของกฎหมาย? อธิบายเหตุและผลอย่างน้อย 2 ประโยค",
"ขั้นที่ 4/4 — สรุปให้ชัดว่าใครมีสิทธิหรือหน้าที่อย่างไร และผลนั้นเกิดจากเงื่อนไขทางกฎหมายข้อใด"
];
var names=["issue","rule","apply","conclude"];
var safe=function(s){return String(s==null?"":s)};
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(cache));}catch(e){$("coach-status").textContent="พื้นที่เก็บข้อมูลเต็ม: ข้อความที่พิมพ์ในโหมดสนทนาอาจไม่ถูกบันทึก";}}
function question(){return EXAMS.find(function(q){return q.id===currentId})||null}
function meta(){return ANSWERS[currentId]||null}
function session(){if(!cache[currentId]||typeof cache[currentId]!=="object"){cache[currentId]={step:0,entries:[]};}return cache[currentId];}
function push(role,text){var s=session();if(!Array.isArray(s.entries))s.entries=[];s.entries.push({role:role,text:safe(text)});s.entries=s.entries.slice(-48);persist();}
function addBubble(role,text){
var log=$("coach-log"),line=document.createElement("div");line.className="coach-line "+role;
var bubble=document.createElement("div");bubble.className="coach-bubble";
var who=document.createElement("span");who.className="coach-who";who.textContent=role==="student"?"คุณ":"NITI ผู้ช่วยติว";
var body=document.createElement("p");body.textContent=text;
bubble.appendChild(who);bubble.appendChild(body);line.appendChild(bubble);log.appendChild(line);
log.scrollTop=log.scrollHeight;
}
function answerArea(){return document.getElementById("answer-"+names[Math.min(coachStep,3)]);}
function currentPrompt(){return prompts[Math.min(coachStep,3)];}
function intro(){var q=question();return "สวัสดีครับ เราจะฝึก"+((window.NITI_SUBJECT_PRACTICE_IDS||[window.NITI_SUBJECT_FEATURED_ID]).includes(q.id)?"โจทย์ที่ผู้ใช้ส่งมา (ไม่ใช่ข้อสอบย้อนหลัง)":q.kind==="practice"?"โจทย์แต่งใหม่ (ไม่ใช่ข้อสอบย้อนหลัง)":"ข้อ "+q.number+" ภาค "+q.semester+"/"+q.year)+" เรื่อง "+q.topic+" แบบถามตอบทีละขั้น ผมเป็นระบบแนะแนวอัตโนมัติ ไม่ใช่โมเดล AI จึงไม่สามารถตัดสินถูกผิดทางกฎหมายจากภาษาธรรมชาติได้ \n\n"+prompts[0];}
function render(){
if(!currentId)return;
var q=question(),a=meta();if(!q||!a)return;
var s=session();s.step=Number.isInteger(s.step)?Math.max(0,Math.min(4,s.step)):0;coachStep=s.step;
$("coach-log").replaceChildren();var entries=Array.isArray(s.entries)?s.entries:[];
if(!entries.length){push("coach",intro());entries=session().entries;}
entries.forEach(function(m){addBubble(m.role==="student"?"student":"coach",m.text)});
$("coach-progress").textContent=coachStep>=4?"ฝึกตอบครบ 4 ขั้นแล้ว":"กำลังฝึกขั้น "+(coachStep+1)+" จาก 4";
$("coach-input").disabled=coachStep>=4;$("coach-send").disabled=coachStep>=4;$("coach-skip").disabled=coachStep>=4;
$("coach-input").placeholder=coachStep>=4?"ฝึกครบแล้ว เปิดเฉลยหรือเริ่มใหม่ได้เลย":"พิมพ์คำตอบของคุณแล้วกดส่ง...";
$("coach-input").value="";
$("coach-hint").disabled=coachStep>=4;
$("coach-status").textContent=coachStep>=4?"ครบ 4 ขั้นแล้ว — คุณสามารถเปิดเฉลยตัวอย่างด้านล่าง และเทียบกับคำตอบของตน":"คำตอบที่ส่งจะใส่ลงกระดาษคำตอบ 4 ส่วนให้อัตโนมัติ";
$("original-caption").textContent=(window.NITI_SUBJECT_PRACTICE_IDS||[window.NITI_SUBJECT_FEATURED_ID]).includes(q.id)?"โจทย์จากผู้ใช้ ไม่มีธงคำตอบเก่าจากมหาวิทยาลัย":q.kind==="practice"?"โจทย์แต่งใหม่ ไม่มีต้นฉบับข้อสอบย้อนหลัง":"ข้อ "+q.number+" · ภาค "+q.semester+"/"+q.year+" · อ่านเนื้อหาต้นฉบับและธงคำตอบในหน้าเดียวกัน (หากเว็บไซต์ปลายทางอนุญาตให้ฝัง)";
$("original-link").href=q.sourceUrl||q.lawSourceUrl;
$("tutor-answer-source").href=q.sourceUrl||q.lawSourceUrl;
$("tutor-answer-source").textContent=q.kind==="practice"?"ตรวจตัวบทกฎหมายทางการ ↗":"อ่านธงคำตอบต้นทาง ↗";
setAnswerContent(q,a);closeOriginal();
}
function publishCoach(text){push("coach",text);addBubble("coach",text)}
function saveToWorksheet(text){
var el=answerArea();if(!el)return;
if(el.value.trim()&&el.value.trim()!==text.trim())el.value+="\n"+text;else el.value=text;
el.dispatchEvent(new Event("input",{bubbles:true}));
}
function responseForStep(step,text,q,a){
if(step===0)return "รับประเด็นของคุณแล้ว ให้ย้อนถามตนเองว่าได้ระบุคู่กรณี สิทธิที่อ้าง และข้อพิพาทครบหรือไม่?\n\n"+prompts[1];
if(step===1){
var mentions=q.sections.some(function(x){return text.includes(x.split(" ")[0])});
return (mentions?"เห็นว่าคุณได้อ้างตัวเลขมาตราที่อยู่ในชุดแนวศึกษาแล้ว แต่ระบบยังไม่สามารถตรวจว่าคุณอธิบายบทบัญญัติได้ถูกต้อง":"ลองตรวจอีกครั้งว่ามาตราที่คุณเลือกครอบคลุมข้อพิพาทหรือไม่ และอย่าลืมเขียนเงื่อนไขของหลักกฎหมายให้ครบ")+"\n\n"+prompts[2]+"\nคำถามต่อยอดเฉพาะข้อนี้: "+a.probe;
}
if(step===2)return "รับเหตุผลการปรับบทแล้ว โปรดตรวจว่าอธิบายเหตุเชื่อมข้อเท็จจริงกับองค์ประกอบของมาตรา และไม่ได้เพียงลอกข้อเท็จจริงจากโจทย์\n\n"+prompts[3];
return "คุณเขียนครบทั้งสี่ขั้นแล้ว ขั้นต่อไปคือเทียบ 'ประเด็น → กฎหมาย → ปรับบท → สรุป' กับเฉลยตัวอย่าง ตรวจข้อที่ยังตกหล่น และปรับกระดาษคำตอบจนได้คำตอบที่สมบูรณ์\n\nนี่เป็นคำแนะนำตามขั้นตอน ไม่ได้ยืนยันว่าคำตอบที่พิมพ์ถูกต้องตามกฎหมาย";
}
function submit(){
var q=question(),a=meta();if(!q||!a||coachStep>=4)return;
var text=$("coach-input").value.trim();if(!text){$("coach-status").textContent="กรุณาพิมพ์คำตอบก่อนส่ง";return;}
if(text.length<8){$("coach-status").textContent="ขอคำอธิบายยาวขึ้นอีกนิด เพื่อใช้ฝึกเขียนอัตนัย";return;}
push("student",text);addBubble("student",text);
saveToWorksheet(text);
var step=coachStep;session().step=step+1;coachStep=step+1;
publishCoach(responseForStep(step,text,q,a));persist();
$("coach-progress").textContent=coachStep>=4?"ฝึกตอบครบ 4 ขั้นแล้ว":"กำลังฝึกขั้น "+(coachStep+1)+" จาก 4";
$("coach-input").value="";$("coach-input").disabled=coachStep>=4;$("coach-send").disabled=coachStep>=4;$("coach-skip").disabled=coachStep>=4;$("coach-hint").disabled=coachStep>=4;
$("coach-status").textContent=coachStep>=4?"เรียบร้อยแล้ว เปิดเฉลยตัวอย่างเพื่อเทียบกับสิ่งที่คุณเขียน":"ส่งคำตอบแล้วและบันทึกในกระดาษคำตอบ";
$("coach-input").focus();
}
function hint(){
var q=question(),a=meta();if(!q||!a||coachStep>=4)return;
var t=[
"แนวคิด: "+q.issue+" ลองเรียบเรียงเป็นคำถามว่าใครมีสิทธิอะไรเหนือใคร",
"ลองพิจารณา ป.พ.พ. มาตรา "+q.sections.join(", ")+" และเขียน ‘องค์ประกอบ’ ของแต่ละมาตราให้ครบ",
"แนวพิจารณา: "+q.roadmap.join(" → ")+" ระบุข้อเท็จจริงให้สัมพันธ์กับแต่ละเงื่อนไข",
"ดูผลทางกฎหมายแบบย่อ: "+q.conclusion+" แต่การได้คะแนนต้องแสดงเหตุผลก่อนสรุป"
][coachStep];
publishCoach("คำใบ้ขั้น "+(coachStep+1)+": "+t);
}
function skip(){
if(coachStep>=4)return;
var step=coachStep;session().step=step+1;coachStep=step+1;
publishCoach("ข้ามขั้น "+(step+1)+" ได้ แต่ควรกลับมาเติมเหตุผลลงกระดาษคำตอบภายหลัง\n\n"+(coachStep>=4?"ครบสี่ขั้นแล้ว เปิดเฉลยตัวอย่างเพื่อตรวจองค์ประกอบได้เลย":prompts[coachStep]));
persist();$("coach-progress").textContent=coachStep>=4?"ฝึกตอบครบ 4 ขั้นแล้ว":"กำลังฝึกขั้น "+(coachStep+1)+" จาก 4";
$("coach-input").disabled=coachStep>=4;$("coach-send").disabled=coachStep>=4;$("coach-skip").disabled=coachStep>=4;$("coach-hint").disabled=coachStep>=4;
}
function restart(){if(!currentId||!confirm("เริ่มบทสนทนาของข้อนี้ใหม่? กระดาษคำตอบที่บันทึกไว้จะไม่ถูกลบ"))return;delete cache[currentId];persist();render();}
function addAnswerSection(parent,heading,text){
var div=document.createElement("section");div.className="model-part";var h=document.createElement("h4");h.textContent=heading;var p=document.createElement("p");p.textContent=text;div.appendChild(h);div.appendChild(p);parent.appendChild(div);
}
function setAnswerContent(q,a){
var el=$("tutor-answer-parts");el.replaceChildren();
addAnswerSection(el,"1. ประเด็นที่ต้องวินิจฉัย",q.issue);
addAnswerSection(el,"2. หลักกฎหมาย",a.rule);
addAnswerSection(el,"3. วินิจฉัยปรับบท",a.application);
addAnswerSection(el,"4. สรุปคำตอบ",a.bottomLine);
var note=document.createElement("p");note.className="model-caution";note.textContent="ข้อควรระวัง: "+q.pitfall;el.appendChild(note);
$("tutor-answer-meta").textContent=q.course+" · "+((window.NITI_SUBJECT_PRACTICE_IDS||[window.NITI_SUBJECT_FEATURED_ID]).includes(q.id)?"โจทย์จากผู้ใช้ (ไม่ใช่ข้อสอบย้อนหลัง)":q.kind==="practice"?"โจทย์ฝึกแต่งใหม่ (ไม่ใช่ข้อสอบเก่า)":"ภาค "+q.semester+"/"+q.year+" · ข้อ "+q.number)+" · เฉลยเรียบเรียงใหม่เพื่อการศึกษา";
}
function toggleAnswer(force){
var panel=$("tutor-answer-body"),button=$("tutor-answer-toggle");var open=typeof force==="boolean"?force:panel.hidden;panel.hidden=!open;
button.textContent=open?"ซ่อนเฉลยตัวอย่าง ↑":"แสดงเฉลยแบบเขียนตอบ 4 ส่วน ↓";button.setAttribute("aria-expanded",String(open));if(open)panel.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function closeOriginal(){
originalOpen=false;$("original-wrapper").hidden=true;$("original-toggle").textContent="แสดงโจทย์ต้นฉบับ + ธงคำตอบในกรอบ ↓";$("original-toggle").setAttribute("aria-expanded","false");
$("original-iframe").src="about:blank";
}
function toggleOriginal(){
if(originalOpen){closeOriginal();return;}
var q=question();if(!q||q.kind==="practice")return;
originalOpen=true;$("original-wrapper").hidden=false;$("original-toggle").textContent="ซ่อนกรอบต้นฉบับ ↑";$("original-toggle").setAttribute("aria-expanded","true");
$("original-iframe").src=q.sourceUrl;$("original-wrapper").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function currentFromMain(){return window.NITI_CURRENT_QUESTION||((($("question-id")||{}).textContent||"").match(/รหัสโจทย์:\s*([^\s]+)/)||[])[1]}
window.addEventListener("niti-question-change",function(e){
var id=e&&e.detail&&e.detail.id;if(!id||id===currentId)return;
currentId=id;toggleAnswer(false);render();
});
$("coach-send").addEventListener("click",submit);
$("coach-input").addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){e.preventDefault();submit();}});
$("coach-hint").addEventListener("click",hint);
$("coach-skip").addEventListener("click",skip);
$("coach-restart").addEventListener("click",restart);
$("original-toggle").addEventListener("click",toggleOriginal);
$("tutor-answer-toggle").addEventListener("click",function(){toggleAnswer()});
$("coach-show-answer").addEventListener("click",function(){toggleAnswer(true)});
$("coach-copy-chatgpt").addEventListener("click",function(){
var q=question();if(!q)return;
var task=[
"คุณคือผู้ช่วยติวสอบกฎหมายแพ่งและพาณิชย์ของประเทศไทย วิชา "+q.course+" เรื่อง "+q.topic,
"ขอให้สอนแบบ Socratic เหมือน Study Mode: เริ่มถามผู้เรียนทีละคำถาม ห้ามเฉลยทันที ปรับคำถามตามคำตอบของผู้เรียน",
"เน้น 4 ส่วน: ประเด็นปัญหา หลักกฎหมายพร้อมเลขมาตรา การปรับบทข้อเท็จจริง และสรุป โดยตรวจเหตุผลและชี้ส่วนที่ยังไม่ครบ",
"ถ้าไม่แน่ใจเรื่องตัวบทหรือฎีกา ห้ามแต่งขึ้น ให้แนะนำแหล่งกฎหมายที่ตรวจสอบได้",
"",
(q.kind==="practice"?"โจทย์ฝึกแต่งใหม่ ไม่ใช่ข้อสอบย้อนหลัง: "+q.course:"ข้อสอบ: "+q.course+" ภาค "+q.semester+"/"+q.year+" ข้อ "+q.number),
(q.kind==="practice"?"แหล่งตรวจตัวบทกฎหมาย: "+q.lawSourceUrl:"แหล่งต้นทางพร้อมธงคำตอบ: "+q.sourceUrl),
"โจทย์สรุปเรียบเรียงใหม่เพื่อการศึกษา: "+q.synopsis,
"",
"เริ่มต้นด้วยคำถามชี้นำสั้นๆ เพียงข้อเดียว และรอคำตอบของฉันก่อน"
].join("\n");
function success(){$("coach-status").textContent="คัดลอกโจทย์พร้อมคำสั่งสอนแล้ว เปิด ChatGPT ด้านล่างและวางข้อความได้เลย";}
function fail(){$("coach-status").textContent="ไม่สามารถคัดลอกอัตโนมัติได้ โปรดลองเปิดเว็บผ่าน HTTPS หรืออนุญาต Clipboard ในเบราว์เซอร์";}
if(navigator.clipboard&&navigator.clipboard.writeText){
navigator.clipboard.writeText(task).then(success).catch(fail);
}else{
var t=document.createElement("textarea");t.value=task;t.style.position="fixed";t.style.opacity="0";document.body.appendChild(t);t.select();
try{document.execCommand("copy")?success():fail();}catch(e){fail();}t.remove();
}
});

if(currentFromMain()){currentId=currentFromMain();render();}
})();