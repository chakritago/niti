/* NITI | Final-exam revision menu for LAW2001 / LAW2101.
 * Original self-test prompts (not historical university exam papers).
 * Nine new explanations paraphrase CCC text checked against a government-hosted consolidation, 2026-10-16.
 */
(function(){
"use strict";
var groups=[
 {title:"กลุ่ม 1 · ประเภททรัพย์ ส่วนควบ อุปกรณ์ และดอกผล",subtitle:"ป.พ.พ. บรรพ 1 · มาตรา 139–148",ids:["139","144","145","146","147","148"]},
 {title:"กลุ่ม 2 · ทรัพยสิทธิ การจดทะเบียน ครอบครองปรปักษ์ และภาระจำยอม",subtitle:"ป.พ.พ. บรรพ 4",ids:["1298","1299","1382","1387","1401"]},
 {title:"กลุ่ม 3 · สาธารณสมบัติของแผ่นดิน",subtitle:"ป.พ.พ. บรรพ 4 · มาตรา 1304 และ 1307",ids:["1304","1307"]},
 {title:"กลุ่ม 4 · สิทธิครอบครองและการคุ้มครองการครอบครอง",subtitle:"ป.พ.พ. บรรพ 4 · มาตรา 1367–1377",ids:["1367","1368","1373","1375","1377"]}
];
var additions=[
 {id:"139",title:"ความหมายของอสังหาริมทรัพย์",plain:"อสังหาริมทรัพย์รวมที่ดิน สิ่งที่ติดที่ดินเป็นการถาวรหรือประกอบเป็นอันเดียวกับที่ดิน ตลอดจนทรัพยสิทธิที่เกี่ยวข้อง",exam:"ตาม ป.พ.พ. มาตรา 139 อสังหาริมทรัพย์ได้แก่ที่ดิน ทรัพย์ที่ติดหรือประกอบเป็นอันเดียวกับที่ดินอย่างถาวร และทรัพยสิทธิอันเกี่ยวกับทรัพย์ดังกล่าว",conditions:"เป็นที่ดิน / ติดที่ดินอย่างถาวรหรือเป็นอันเดียวกัน / ทรัพยสิทธิที่เกี่ยวข้อง",trap:"อย่าเหมารวมว่าสิ่งของที่วางอยู่บนที่ดินทุกชนิดเป็นอสังหาริมทรัพย์"},
 {id:"145",title:"ไม้ยืนต้นและพืชผลกับส่วนควบของที่ดิน",plain:"ไม้ยืนต้นเป็นส่วนควบของที่ดิน ส่วนไม้ล้มลุกหรือธัญชาติที่เก็บเกี่ยวได้คราวหนึ่งหรือหลายคราวต่อปีไม่เป็นส่วนควบ",exam:"ตาม ป.พ.พ. มาตรา 145 ไม้ยืนต้นเป็นส่วนควบของที่ดินที่ขึ้นอยู่ แต่ไม้ล้มลุกหรือธัญชาติที่เก็บเกี่ยวผลผลิตได้เป็นคราว ๆ ไม่เป็นส่วนควบของที่ดิน",conditions:"ชนิดพืช / เป็นไม้ยืนต้นหรือไม้ล้มลุก-ธัญชาติ / ลักษณะการเก็บเกี่ยว",trap:"แยกกรรมสิทธิ์ต้นไม้ยืนต้นออกจากสิทธิในผลผลิตที่ขาดจากต้นแล้ว"},
 {id:"147",title:"อุปกรณ์ของทรัพย์ประธาน",plain:"อุปกรณ์เป็นสังหาริมทรัพย์ที่เจ้าของจัดไว้ใช้ประจำเพื่อการดูแล ใช้สอย หรือรักษาทรัพย์ประธาน แม้ถอดออกชั่วคราวก็ยังเป็นอุปกรณ์ และโดยหลักตกติดไปกับทรัพย์ประธาน เว้นแต่กำหนดอย่างอื่น",exam:"ตาม ป.พ.พ. มาตรา 147 อุปกรณ์ต้องเป็นสังหาริมทรัพย์ซึ่งเจ้าของใช้ประกอบกับทรัพย์ประธานเป็นอาจิณเพื่อการดูแล ใช้สอย หรือรักษาทรัพย์ และโดยหลักตกติดไปกับทรัพย์ประธาน เว้นแต่ตกลงไว้เป็นอย่างอื่น",conditions:"มีทรัพย์ประธาน / เป็นสังหาริมทรัพย์ใช้ประกอบเป็นอาจิณ / เจ้าของนำมาใช้กับทรัพย์ประธาน / ไม่ได้กำหนดไว้เป็นอย่างอื่น",trap:"อุปกรณ์แยกจากทรัพย์ประธานได้ ต่างจากส่วนควบตามมาตรา 144"},
 {id:"148",title:"ดอกผลธรรมดาและดอกผลนิตินัย",plain:"ดอกผลธรรมดาเกิดจากทรัพย์ตามธรรมชาติและถือเอาได้เมื่อขาดจากทรัพย์ ส่วนดอกผลนิตินัยเป็นประโยชน์ที่ได้รับเป็นคราว ๆ จากผู้อื่นเพื่อการใช้ทรัพย์ เช่น ค่าเช่า",exam:"ตาม ป.พ.พ. มาตรา 148 ดอกผลมีสองประเภท คือดอกผลธรรมดาซึ่งเกิดจากทรัพย์ตามธรรมชาติและถือเอาได้เมื่อขาดจากทรัพย์ กับดอกผลนิตินัยซึ่งเป็นทรัพย์หรือประโยชน์ที่เจ้าของได้รับจากผู้อื่นเป็นระยะเพราะการใช้ทรัพย์",conditions:"ที่มาของผลประโยชน์ / เกิดตามธรรมชาติหรือได้รับจากผู้อื่น / เวลาที่ถือเอาหรือคำนวณสิทธิได้",trap:"ค่าเช่าเป็นดอกผลนิตินัย ไม่ใช่ดอกผลธรรมดา"},
 {id:"1298",title:"ทรัพยสิทธิก่อตั้งได้ตามกฎหมายเท่านั้น",plain:"บุคคลจะสร้างทรัพยสิทธิชนิดใหม่ตามใจตกลงกันเองไม่ได้ ต้องมีบทกฎหมายรองรับ",exam:"ตาม ป.พ.พ. มาตรา 1298 ทรัพยสิทธิก่อตั้งขึ้นได้แต่โดยอาศัยอำนาจแห่งประมวลกฎหมายแพ่งและพาณิชย์หรือกฎหมายอื่น",conditions:"ตรวจว่าข้อตกลงมุ่งก่อทรัพยสิทธิ / มีบทกฎหมายให้อำนาจหรือไม่ / อย่าสับสนกับสิทธิเรียกร้องระหว่างคู่สัญญา",trap:"ข้อตกลงผูกพันบุคคลได้ ไม่ได้แปลว่าก่อทรัพยสิทธิชนิดใหม่ให้ผูกบุคคลภายนอกได้เสมอ"},
 {id:"1304",title:"สาธารณสมบัติของแผ่นดิน",plain:"ทรัพย์สินของแผ่นดินที่ใช้เพื่อสาธารณประโยชน์หรือสงวนไว้เพื่อประโยชน์ร่วมกัน รวมถึงที่ดินรกร้างตามกฎหมาย ที่ประชาชนใช้ร่วมกัน และทรัพย์เพื่อประโยชน์ของแผ่นดินโดยเฉพาะ",exam:"ตาม ป.พ.พ. มาตรา 1304 สาธารณสมบัติของแผ่นดินหมายถึงทรัพย์สินของแผ่นดินที่ใช้เพื่อสาธารณประโยชน์หรือสงวนไว้เพื่อประโยชน์ร่วมกัน โดยมีตัวอย่างตาม (1) ถึง (3)",conditions:"ทรัพย์สินเป็นของแผ่นดิน / ใช้เพื่อสาธารณประโยชน์หรือสงวนเพื่อประโยชน์ร่วมกัน / จำแนกกรณี (1)–(3)",trap:"อย่าสับสนทรัพย์ของแผ่นดินทุกชนิดกับสาธารณสมบัติของแผ่นดินทุกชนิด"},
 {id:"1307",title:"ห้ามยึดทรัพย์สินของแผ่นดิน",plain:"กฎหมายห้ามยึดทรัพย์สินของแผ่นดิน ไม่ว่าจะเป็นสาธารณสมบัติของแผ่นดินหรือไม่",exam:"ตาม ป.พ.พ. มาตรา 1307 ห้ามมิให้ยึดทรัพย์สินของแผ่นดินไม่ว่าทรัพย์นั้นจะเป็นสาธารณสมบัติของแผ่นดินหรือไม่",conditions:"ทรัพย์ที่ประสงค์ยึดเป็นทรัพย์ของแผ่นดินหรือไม่ / แยกจากทรัพย์ของหน่วยงานที่มีฐานะนิติบุคคลอื่นตามกฎหมายเฉพาะ",trap:"มาตรา 1307 ใช้ถ้อยคำ 'ทรัพย์สินของแผ่นดิน' กว้างกว่าสาธารณสมบัติของแผ่นดินตามมาตรา 1304"},
 {id:"1373",title:"ข้อสันนิษฐานสิทธิครอบครองของผู้มีชื่อในทะเบียนที่ดิน",plain:"หากเป็นอสังหาริมทรัพย์ที่จดไว้ในทะเบียนที่ดิน กฎหมายสันนิษฐานไว้ก่อนว่าผู้มีชื่อในทะเบียนเป็นผู้มีสิทธิครอบครอง",exam:"ตาม ป.พ.พ. มาตรา 1373 สำหรับอสังหาริมทรัพย์ที่ได้จดไว้ในทะเบียนที่ดิน ให้สันนิษฐานไว้ก่อนว่าผู้มีชื่อในทะเบียนมีสิทธิครอบครอง",conditions:"เป็นอสังหาริมทรัพย์ / จดไว้ในทะเบียนที่ดิน / ระบุผู้มีชื่อ / พิจารณาพยานหลักฐานหักล้างข้อสันนิษฐาน",trap:"เป็นข้อสันนิษฐานเบื้องต้นที่หักล้างได้ ไม่เท่ากับมีสิทธิเด็ดขาดทุกกรณี"},
 {id:"1375",title:"เรียกคืนการครอบครองเมื่อถูกแย่งโดยมิชอบ",plain:"ผู้ถูกแย่งการครอบครองโดยมิชอบมีสิทธิฟ้องเรียกคืนภายในหนึ่งปีนับแต่ถูกแย่ง เว้นแต่อีกฝ่ายมีสิทธิเหนือทรัพย์ดีกว่าจนเรียกคืนจากผู้ครอบครองได้",exam:"ตาม ป.พ.พ. มาตรา 1375 ผู้ครอบครองที่ถูกแย่งการครอบครองโดยมิชอบมีสิทธิเรียกคืน แต่ต้องฟ้องภายในหนึ่งปีนับแต่เวลาถูกแย่ง และต้องพิจารณาข้อยกเว้นหากอีกฝ่ายมีสิทธิเหนือทรัพย์ดีกว่า",conditions:"มีสิทธิครอบครอง / ถูกแย่งโดยมิชอบ / ฟ้องภายในหนึ่งปี / ตรวจสิทธิที่ดีกว่าของคู่กรณี",trap:"อย่าสับสน 'ถูกแย่งการครอบครอง' ตามมาตรา 1375 กับ 'ถูกรบกวน' ตามมาตรา 1374"}
];
var cases={
"139":["บ้านก่ออิฐติดกับที่ดินถาวร กับตู้สินค้าที่ยกย้ายได้วางไว้ข้างบ้าน","ทรัพย์ใดเป็นอสังหาริมทรัพย์ตามนิยาม และควรใช้เกณฑ์อะไรแยก?"],
"144":["เจ้าของอาคารขายอาคารแต่ต้องการถอดคานรับน้ำหนักไปด้วย","คานที่เป็นสาระสำคัญของอาคารเป็นส่วนควบหรือไม่ และเจ้าของทรัพย์มีสิทธิอย่างไร?"],
"145":["สวนมีต้นมะม่วงอายุหลายปีและแปลงข้าวที่เก็บเกี่ยวเป็นฤดูกาล","ต้นมะม่วงกับต้นข้าวเป็นส่วนควบของที่ดินเหมือนกันหรือไม่?"],
"146":["ผู้มีสิทธิก่อสร้างบนที่ดินผู้อื่นสร้างอาคารตามสิทธินั้น และมีร้านเคลื่อนย้ายได้ตั้งชั่วคราว","สิ่งใดอาจไม่เป็นส่วนควบของที่ดิน และเพราะอะไร?"],
"147":["เจ้าของโรงงานจัดเครื่องมือหนึ่งชุดไว้ใช้ประจำเครื่องจักรหลัก แล้วถอดออกซ่อมชั่วคราว","เครื่องมือยังเป็นอุปกรณ์หรือไม่ และเมื่อโอนทรัพย์ประธานจะมีผลอย่างไร?"],
"148":["เจ้าของสวนได้รับผลมะม่วงจากต้นและได้รับค่าเช่าที่ดินทุกเดือน","รายการใดเป็นดอกผลธรรมดา รายการใดเป็นดอกผลนิตินัย?"],
"1298":["คู่สัญญาเขียนข้อตกลงตั้ง 'ทรัพยสิทธิถาวร' แบบใหม่โดยไม่อ้างกฎหมายใดรองรับ","ข้อตกลงสามารถทำให้เกิดทรัพยสิทธิประเภทใหม่ที่ผูกพันคนทั่วไปได้เองหรือไม่?"],
"1299":["ผู้หนึ่งได้กรรมสิทธิ์อสังหาริมทรัพย์โดยทางอื่นนอกจากนิติกรรมแต่ยังไม่จดทะเบียน ต่อมามีบุคคลภายนอกซื้อโดยเสียค่าตอบแทนและจดทะเบียนโดยสุจริต","ผู้ได้สิทธิก่อนแต่ไม่ได้จดทะเบียนยกสิทธิต่อสู้ผู้ซื้อภายหลังได้เพียงใด?"],
"1382":["นาย ก ครอบครองที่ดินเอกชนของผู้อื่นโดยสงบ เปิดเผย และเจตนาเป็นเจ้าของติดต่อกัน 11 ปี","ต้องตรวจองค์ประกอบใดก่อนวินิจฉัยว่าได้กรรมสิทธิ์โดยครอบครองปรปักษ์?"],
"1387":["เจ้าของบ้านต้องใช้ทางเดินผ่านที่ดินข้างเคียงเพื่อประโยชน์ของบ้านตน","หากจะจัดตั้งภาระจำยอมต้องมีอสังหาริมทรัพย์ฝ่ายใดได้ประโยชน์และฝ่ายใดรับภาระ?"],
"1401":["เจ้าของแปลงหนึ่งใช้ทางผ่านอีกแปลงอย่างเปิดเผย สงบ และต่อเนื่องมานานกว่า 10 ปี","การได้ภาระจำยอมโดยอายุความต้องพิสูจน์องค์ประกอบใดบ้าง?"],
"1304":["ที่ดินชายตลิ่งและอาคารราชการซึ่งเป็นทรัพย์ของแผ่นดินถูกถามว่าอยู่ในกลุ่มสาธารณสมบัติหรือไม่","จัดประเภททรัพย์ตามข้อ (1)–(3) ของมาตรา 1304 อย่างไร?"],
"1307":["เจ้าหนี้ตามคำพิพากษาขอให้ยึดทรัพย์ที่เป็นกรรมสิทธิ์ของแผ่นดินเพื่อชำระหนี้","มาตรา 1307 ห้ามยึดทรัพย์นี้หรือไม่ แม้ไม่ใช่สาธารณสมบัติที่ประชาชนใช้ร่วมกัน?"],
"1367":["นาง ข เข้าอยู่บ้านที่ผู้อื่นทิ้งไว้และยึดถือเพื่อประโยชน์ของตน","อะไรเป็นข้อเท็จจริงที่บ่งว่ามีการครอบครองตามมาตรา 1367?"],
"1368":["ลูกจ้างดูแลทรัพย์ของนายจ้างตามคำสั่งโดยไม่เคยยึดถือเพื่อตน","ผู้ยึดถือแทนผู้อื่นต้องถือว่าครอบครองเพื่อตนหรือไม่?"],
"1373":["หนังสือรับรองการทำประโยชน์มีชื่อนาย ก แต่บุคคลอื่นอ้างว่าเข้าครอบครองทำประโยชน์จริง","ผู้มีชื่อในทะเบียนได้ประโยชน์จากข้อสันนิษฐานใด และอีกฝ่ายหักล้างได้หรือไม่?"],
"1375":["นาง ข ถูกผู้อื่นเข้ายึดที่ดินแทนเมื่อวันที่ 1 มกราคม ปีที่แล้ว และจะฟ้องคืนเมื่อพ้นหนึ่งปี","ฟ้องคืนการครอบครองต้องดูระยะเวลาและสิทธิของคู่กรณีอย่างไร?"],
"1377":["เจ้าของสวนไม่ได้เข้าสวนสามเดือนเพราะน้ำท่วม แต่ยังประสงค์กลับไปครอบครองต่อ","เหตุขัดขวางชั่วคราวทำให้การครอบครองสิ้นสุดหรือไม่?"]
};
/* Add only missing sections; retain all prior study notes and real exam data. */
var existing=Array.isArray(window.NITI_STATUTE_NOTES)?window.NITI_STATUTE_NOTES:[];
var known=new Set(existing.map(function(n){return String(n.id);}));
var sources=window.NITI_STATUTE_SOURCES||{};
var pages={"139":27,"145":28,"147":28,"148":28,"1298":206,"1304":207,"1307":207,"1373":217,"1375":217};
var governmentPDF="https://www.sbpac.go.th/home/wp-content/uploads/2024/02/%E0%B8%9B.%E0%B8%9E.%E0%B8%9E.pdf";
var updatedPDF=sources.currentConsolidated&&sources.currentConsolidated.url;
if(!Array.isArray(sources.ids))sources.ids=[];
if(!sources.titles)sources.titles={};
if(!sources.direct)sources.direct={};
additions.forEach(function(n){
 var id=n.id,page=pages[id],url=governmentPDF+"#page="+page;
 if(!sources.ids.includes(id))sources.ids.push(id);
 sources.titles[id]=n.title;
 if(!sources.direct[id]){
  sources.direct[id]={id:id,page:page,primaryUrl:url,sourceType:"gov-consolidated",verifiedOn:"2026-10-16",officialUrls:[
   {url:url,label:"ตัวบทมาตรา "+id+" · PDF หน้า "+page+" (หน่วยงานรัฐ)",sourceType:"gov-consolidated"}
  ].concat(updatedPDF?[{url:updatedPDF,label:"ตรวจประมวลฉบับอัปเดต · ศาลยุติธรรม",sourceType:"gov-current-consolidated"}]:[]),
  caution:"ข้อความสรุปเป็นคำอธิบายเพื่อศึกษา โปรดตรวจแก้ไขฉบับใช้บังคับปัจจุบัน"};
 }
 if(!known.has(id)){
  n.fullTextUrl=url;n.officialPortal="https://www.ocs.go.th/searchlaw";n.reviewDate="2026-10-16";
  n.provenance="สรุปความจากเอกสาร ป.พ.พ. ที่หน่วยงานรัฐเผยแพร่ มิใช่การคัดข้อความตัวบท";
  existing.push(n);known.add(id);
 }
});
window.NITI_STATUTE_NOTES=existing;
window.NITI_FINAL_EXAM_GROUPS=groups;
window.NITI_FINAL_PRACTICE=cases;
var container=document.getElementById("final-groups");
if(!container)return;
var byId={};existing.forEach(function(n){byId[n.id]=n;});
var exams=Array.isArray(window.NITI_EXAMS)?window.NITI_EXAMS.filter(function(q){return q&&q.id&&q.course&&/LAW2001|LAW2101/.test(q.course)&&q.kind!=="practice";}):[];
var ids=groups.reduce(function(acc,g){return acc.concat(g.ids);},[]);
var key="niti-final-exam-2026-progress-v1",saved={};
try{saved=JSON.parse(localStorage.getItem(key)||"{}")||{};}catch(e){saved={};}
function el(tag,cls,txt){
 var v=document.createElement(tag);if(cls)v.className=cls;if(txt!==undefined)v.textContent=txt;return v;
}
function anchor(url,label,cls,external){
 var a=el("a",cls,label);a.href=url;if(external){a.target="_blank";a.rel="noopener noreferrer";}return a;
}
function findExams(id){return exams.filter(function(q){return(q.sections||[]).some(function(s){var m=String(s).match(/^\d+(?:\/\d+)?/);return m&&m[0]===id;});});}
function tally(){
 var count=ids.filter(function(id){return !!saved[id];}).length;
 var out=document.getElementById("final-progress");if(out)out.textContent="อ่านแล้ว "+count+" / "+ids.length+" มาตรา";
 var bar=document.getElementById("final-progress-bar");if(bar)bar.value=count;
}
function render(){
 var query=(document.getElementById("final-search").value||"").trim().toLocaleLowerCase("th");
 var filter=document.getElementById("final-filter").value;
 container.replaceChildren();var total=0;
 groups.forEach(function(group,index){
  var found=group.ids.filter(function(id){
   var note=byId[id]||{id:id,title:"บทบัญญัติที่ควรอ่าน"};
   var match=!query||(id+" "+note.title+" "+(note.plain||"")+" "+(cases[id]||[]).join(" ")).toLocaleLowerCase("th").includes(query);
   return match&&(filter==="all"||filter==="unread"&&!saved[id]||filter==="done"&&saved[id]);
  });
  if(!found.length)return;total+=found.length;
  var section=el("section","final-group");section.id="final-group-"+(index+1);
  var head=el("div","final-group-head");
  head.appendChild(el("h2","",group.title));head.appendChild(el("p","",group.subtitle));
  section.appendChild(head);
  var grid=el("div","final-card-grid");
  found.forEach(function(id){
   var note=byId[id]||{id:id,title:"อ่านตัวบทกฎหมาย"};
   var card=el("article","final-card");card.id="final-section-"+id;
   var top=el("div","final-card-top");top.appendChild(el("span","final-statute","มาตรา "+id));
   var cbLabel=el("label","final-check");var cb=document.createElement("input");cb.type="checkbox";cb.checked=!!saved[id];cb.setAttribute("aria-label","อ่านมาตรา "+id+" แล้ว");
   cb.addEventListener("change",function(){saved[id]=cb.checked;try{localStorage.setItem(key,JSON.stringify(saved));}catch(e){}tally();if(filter!=="all")render();});
   cbLabel.appendChild(cb);cbLabel.appendChild(document.createTextNode(" อ่านแล้ว"));top.appendChild(cbLabel);card.appendChild(top);
   card.appendChild(el("h3","",note.title));card.appendChild(el("p","final-summary",note.plain||"โปรดตรวจตัวบทมาตรานี้"));
   var line=el("div","final-links");
   line.appendChild(anchor("./study.html#statute-"+id,"สรุปมาตรา + ตัวบทในเว็บไซต์ ↗","final-link"));
   var direct=sources.direct&&sources.direct[id];
   line.appendChild(anchor(direct?direct.primaryUrl:"https://www.ocs.go.th/searchlaw","PDF ตัวบทจากหน่วยงานรัฐ ↗","final-link secondary",true));
   card.appendChild(line);
   var match=findExams(id);
   if(match.length){
    var historic=el("div","final-history");historic.appendChild(el("strong","","ข้อสอบย้อนหลังในคลัง ("+match.length+" ข้อ)"));
    match.forEach(function(q){historic.appendChild(anchor("./quiz.html?exam="+encodeURIComponent(q.id),q.title+" · ภาค "+q.semester+"/"+q.year,"final-exam-link"));});card.appendChild(historic);
   }else card.appendChild(el("p","final-no-history","ยังไม่มีข้อสอบย้อนหลังที่อ้างมาตรานี้โดยตรงในคลัง"));
   var pq=cases[id]||[];
   var details=el("details","final-practice");var summary=el("summary","","โจทย์ฝึกแต่งใหม่ · ฝึกเขียนตอบ ↓");details.appendChild(summary);
   var wrap=el("div","final-practice-body");
   wrap.appendChild(el("p","",pq[0]||"ศึกษาตัวบทและตั้งประเด็นวินิจฉัย"));wrap.appendChild(el("p","final-question",pq[1]||"หลักกฎหมายในมาตรานี้มีองค์ประกอบใดบ้าง?"));
   var ans=el("details","final-answer");ans.appendChild(el("summary","","ดูแนวตอบสั้น ๆ"));
   ans.appendChild(el("p","",note.exam||note.plain||"ตรวจตัวบทและองค์ประกอบตามข้อเท็จจริง"));
   if(note.trap)ans.appendChild(el("p","final-trap","จุดระวัง: "+note.trap));
   wrap.appendChild(ans);details.appendChild(wrap);card.appendChild(details);grid.appendChild(card);
  });
  section.appendChild(grid);container.appendChild(section);
 });
 var status=document.getElementById("final-results");if(status)status.textContent="แสดง "+total+" จาก "+ids.length+" มาตรา";
 if(!total)container.appendChild(el("p","final-empty","ไม่พบมาตราตามคำค้นหาหรือตัวกรอง"));
 tally();
}
document.getElementById("final-search").addEventListener("input",render);
document.getElementById("final-filter").addEventListener("change",render);
render();
})();