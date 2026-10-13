/* NITI illustrated legal scenarios: accessible 2D SVG and no external rendering dependencies.
 * Each section uses its own source-backed learning issues, scenario and props.
 * SVG selection and HTML controls explain facts, not issue an automated legal judgment.
 */
(function(){
"use strict";
var NS="http://www.w3.org/2000/svg";
function node(tag,cls,txt){
 var e=document.createElement(tag);if(cls)e.className=cls;
 if(typeof txt==="string")e.textContent=txt;
 return e;
}
function svg(parent,tag,attrs,txt){
 var e=document.createElementNS(NS,tag);
 Object.keys(attrs||{}).forEach(function(k){e.setAttribute(k,String(attrs[k]));});
 if(typeof txt==="string")e.textContent=txt;
 parent.appendChild(e);return e;
}
function shape(g,tag,attrs){return svg(g,tag,attrs);}
function label(g,x,y,text,style){
 return svg(g,"text",{x:x,y:y,fill:style||"#20415b","font-size":17,"font-weight":750,"text-anchor":"middle","font-family":"Sarabun, Tahoma, sans-serif"},text);
}
function rect(g,x,y,w,h,fill,rx,stroke){
 return shape(g,"rect",{x:x,y:y,width:w,height:h,rx:rx||0,fill:fill,stroke:stroke||"none","stroke-width":2});
}
function circle(g,x,y,r,fill,stroke){
 return shape(g,"circle",{cx:x,cy:y,r:r,fill:fill,stroke:stroke||"none","stroke-width":3});
}
function line(g,x1,y1,x2,y2,stroke,width,dash){
 return shape(g,"line",{x1:x1,y1:y1,x2:x2,y2:y2,stroke:stroke,"stroke-width":width||4,"stroke-linecap":"round","stroke-dasharray":dash||"none"});
}
function polygon(g,points,fill){
 return shape(g,"polygon",{points:points,fill:fill,stroke:"#496477","stroke-width":2,"stroke-linejoin":"round"});
}
function drawHouse(g,x,y,s,color){
 var h=svg(g,"g",{transform:"translate("+x+","+y+") scale("+s+")"});
 rect(h,-36,-26,72,57,color||"#fff5df",6,"#577a7a");
 polygon(h,"-47,-26 0,-67 47,-26","#f29370");
 rect(h,-11,-2,22,33,"#926b52",3);
 rect(h,-31,-12,15,14,"#83c8df",3);
 rect(h,17,-12,15,14,"#83c8df",3);
 return h;
}
function drawParcel(g,x,y,w,h,fill,house){
 rect(g,x,y,w,h,fill,18,"#569578");
 if(house)drawHouse(g,x+w*.5,y+h*.62,.68,"#fff4d8");
}
function drawPaper(g,x,y,s){
 var p=svg(g,"g",{transform:"translate("+x+","+y+") scale("+s+")"});
 rect(p,-34,-47,68,94,"#fff9ed",7,"#8aa2b2");
 for(var i=0;i<4;i++)line(p,-24,-23+i*17,25,-23+i*17,"#7395ae",4);
 rect(p,-20,27,38,7,"#b2d8ce",2);
 return p;
}
function drawCoins(g,x,y,s){
 var p=svg(g,"g",{transform:"translate("+x+","+y+") scale("+s+")"});
 for(var i=0;i<3;i++){rect(p,-40+i*25,20-i*12,38,13,"#e9bc57",6,"#a27a2c");}
 circle(p,12,-12,20,"#ffd66e","#ae822e");label(p,12,-6,"฿","#684917");
 return p;
}
function drawPerson(g,x,y,s,color){
 var p=svg(g,"g",{transform:"translate("+x+","+y+") scale("+s+")"});
 circle(p,0,-38,18,"#f4c9a4");
 shape(p,"path",{d:"M-28 33 Q-28 -11 0 -12 Q28 -11 28 33Z",fill:color||"#457caf"});
 shape(p,"path",{d:"M-18 -48 Q0 -72 18 -48",stroke:"#314254","stroke-width":10,"stroke-linecap":"round",fill:"none"});
 return p;
}
function drawClock(g,x,y,s){
 var p=svg(g,"g",{transform:"translate("+x+","+y+") scale("+s+")"});
 circle(p,0,0,38,"#fff4d8","#658aa1");
 line(p,0,0,0,-22,"#33516c",5);line(p,0,0,18,9,"#33516c",5);
 circle(p,0,0,5,"#33516c");return p;
}
function drawArrow(g,x1,y1,x2,y2,color){
 var p=shape(g,"path",{d:"M"+x1+" "+y1+" L"+x2+" "+y2,fill:"none",stroke:color||"#278b93","stroke-width":6,"stroke-linecap":"round","marker-end":"url(#niti-svg-arrow)"});
 return p;
}
function drawObject(g,kind,x,y,s){
 var p=svg(g,"g",{transform:"translate("+x+","+y+") scale("+s+")"});
 switch(kind){
 case "parcel":drawParcel(p,-53,-33,106,72,"#b9e3ac",true);break;
 case "house":drawHouse(p,0,18,1);break;
 case "path":rect(p,-62,-14,124,30,"#98b1c0",10);line(p,-47,1,48,1,"#fff7e8",4,"14 12");break;
 case "registry":rect(p,-53,-13,106,68,"#c1eaf4",10,"#698999");rect(p,-60,-35,120,28,"#367da0",6);label(p,0,-15,"ทะเบียน","#ffffff");rect(p,-20,12,40,45,"#fbf3de",4);break;
 case "document":case "letter":case "stamp":drawPaper(p,0,0,1);break;
 case "coins":drawCoins(p,0,0,1);break;
 case "person":drawPerson(p,0,18,1);break;
 case "bank":rect(p,-57,-24,114,78,"#cde9ea",8,"#6b969c");polygon(p,"-64,-24 0,-57 64,-24","#5f91b0");for(var i=0;i<3;i++)rect(p,-42+i*30,-8,16,57,"#f7f0db",3);break;
 case "clock":case "calendar":drawClock(p,0,7,1);break;
 case "watch":drawClock(p,0,0,.8);rect(p,-17,-62,34,31,"#648d9e",6);rect(p,-17,31,34,31,"#648d9e",6);break;
 case "pledge":drawObject(p,"watch",-20,2,.55);drawObject(p,"handshake",26,23,.53);break;
 case "fence":for(var i=0;i<5;i++)rect(p,-52+i*27,-34,9,75,"#b98569",3);line(p,-58,12,62,12,"#805c45",9);break;
 case "permission":case "shield":case "lock":rect(p,-42,-34,84,76,"#d6f1e1",16,"#5a9b84");label(p,0,10,"✓","#277957");break;
 case "warning":case "crack":polygon(p,"0,-49 -52,46 52,46","#ffe1a1");label(p,0,29,"!","#b56637");break;
 case "goods":case "selector":case "gift":rect(p,-48,-27,96,74,"#eac48a",9,"#ab7c52");rect(p,-5,-27,12,74,"#fff1c7",2);break;
 case "car":rect(p,-62,-15,126,46,"#79b4dc",12);rect(p,-25,-42,62,30,"#cde9ff",8);circle(p,-39,32,14,"#415267");circle(p,39,32,14,"#415267");break;
 case "bike":circle(p,-46,18,23,"none","#4c6679");circle(p,46,18,23,"none","#4c6679");polygon(p,"-46,18 -11,-15 12,18 -46,18","#91c7ea");break;
 case "handshake":drawPerson(p,-29,8,.62,"#6592b8");drawPerson(p,29,8,.62,"#75ab8b");line(p,-10,23,12,23,"#ad7a5d",12);break;
 case "flag":line(p,-22,-47,-22,48,"#5f8294",6);polygon(p,"-18,-45 49,-32 -18,-8","#ec9478");break;
 case "eye":circle(p,0,1,26,"#e6f3fa","#4f8cad");circle(p,0,1,12,"#4c6687");break;
 case "auction":case "gavel":line(p,-38,39,24,-16,"#946448",12);rect(p,-3,-48,60,23,"#ac7959",5);break;
 case "tent":polygon(p,"-61,43 0,-48 61,43","#edbf84");line(p,0,-48,0,43,"#d47a60",4);break;
 case "tool":line(p,-35,42,31,-40,"#956b4f",13);rect(p,3,-47,58,15,"#8ba8af",3);break;
 default:drawPaper(p,0,0,.86);
 }
 return p;
}
function backdrop(g,model){
 rect(g,0,0,880,430,"#e9f5fa",20);
 circle(g,758,71,36,"#ffe2a4");
 shape(g,"path",{d:"M0 304 Q160 241 312 293 T620 275 T880 296 L880 430 L0 430 Z",fill:"#cde9cf"});
 var kind=model.kind;
 if(kind==="servitude"){
  drawParcel(g,70,172,320,175,"#a8deaa",true);
  drawParcel(g,490,172,320,175,"#adddbf",true);
  rect(g,395,168,78,183,"#b5bec2",6);
  line(g,433,195,433,332,"#fefaf0",4,"12 12");
  label(g,230,370,"ที่ดินแปลงที่ 1");label(g,655,370,"ที่ดินแปลงที่ 2");
 }else if(kind==="registry"||kind==="mortgage"||kind==="boundary"){
  drawParcel(g,75,170,315,166,"#b9dfaa",true);
  if(kind==="boundary"){rect(g,433,171,8,171,"#cc7e68",3);drawParcel(g,485,172,302,165,"#c5e2c1",false);drawHouse(g,444,296,1.10,"#ffe0c2");label(g,440,402,"ตัวบ้านรุกล้ำแนวเขต");}
  else{drawObject(g,kind==="mortgage"?"bank":"registry",642,270,1.15);}
  label(g,230,371,"ทรัพย์และเจ้าของ");label(g,650,371,kind==="mortgage"?"เจ้าหนี้ / หลักประกัน":"หลักฐาน / สำนักงานที่ดิน");
 }else if(kind==="pledge"||kind==="trade"||kind==="exchange"||kind==="gift"||kind==="borrow"||kind==="obligation"){
  drawPerson(g,133,253,1.38,"#4c84aa");drawPerson(g,749,253,1.38,"#6ea68a");
  rect(g,250,301,388,38,"#bd9576",8);
  label(g,136,351,"ผู้ให้ / ผู้ขาย");label(g,748,351,"ผู้รับ / ผู้ซื้อ");
  if(kind==="pledge")drawObject(g,"watch",444,250,.67);
  else if(kind==="exchange")drawObject(g,"goods",444,245,.67);
  else drawObject(g,"handshake",444,236,.80);
 }else if(kind==="loan"){
  drawPerson(g,195,255,1.38,"#6792c5");drawPerson(g,687,255,1.38,"#85b5a3");drawObject(g,"coins",442,267,1.10);
  label(g,195,360,"ผู้กู้");label(g,687,360,"ผู้ให้กู้");
 }else if(kind==="guarantee"){
  drawPerson(g,162,255,1.30,"#6792c5");drawPerson(g,434,255,1.30,"#85b5a3");
  drawObject(g,"bank",710,259,1.1);
  label(g,150,360,"ลูกหนี้");label(g,432,360,"ผู้ค้ำ");label(g,710,360,"เจ้าหนี้");
 }else if(kind==="lease"||kind==="hire"){
  drawHouse(g,225,265,1.48);drawPerson(g,647,280,1.30,"#719bc7");
  drawArrow(g,340,231,528,231);label(g,435,204,"สัญญา / การใช้ทรัพย์");
 }else if(kind==="possession"||kind==="property"){
  drawParcel(g,77,184,720,169,"#b5dba8",true);
  drawPerson(g,685,267,1.10,"#739ac0");
  label(g,453,373,kind==="possession"?"ใครยึดถือ · ถือแทนใคร · นานเท่าไร":"ใครเป็นเจ้าของ · ทรัพย์นั้นมีสถานะใด");
 }else if(kind==="time"){
  drawClock(g,248,266,1.55);drawPaper(g,625,269,.96);
  drawArrow(g,370,263,501,263);label(g,442,224,"นับเวลาและใช้สิทธิ");
 }else{
  drawPaper(g,268,273,1.0);drawPerson(g,644,269,1.15);
  drawArrow(g,377,261,511,261);
 }
}
function specialized(g,model){
 // Large, meaningful visual legal distinction in the center of the scene.
 if(model.id==="1299"||model.id==="456"){
  rect(g,274,78,335,62,"#fffdfa",14,"#80b8bf");
  label(g,440,103,model.id==="1299"?"ได้โดยนิติกรรม  /  ได้โดยทางอื่น":"ตรวจประเภทสัญญาและทรัพย์");
  label(g,440,129,"หนังสือ · จดทะเบียน · สิทธิบุคคลภายนอก");
 }
 if(model.id==="728"){
  rect(g,96,89,684,72,"#fff8ec",14,"#ca9b59");
  label(g,438,115,"ผิดนัด → หนังสือบอกกล่าว → ระยะเวลาไม่น้อยกว่า 60 วัน");
  label(g,438,144,"กรณีผู้จำนองเป็นบุคคลภายนอกต้องตรวจการแจ้งเพิ่มเติม");
 }
 if(model.id==="1382"){
  rect(g,164,75,550,68,"#fffdf4",12,"#88a5ac");
  label(g,440,103,"สงบ · เปิดเผย · เจตนาเป็นเจ้าของ · ต่อเนื่อง");
  label(g,440,131,"อสังหาริมทรัพย์ 10 ปี  /  สังหาริมทรัพย์ 5 ปี");
 }
 if(model.id==="747"){
  rect(g,286,86,309,49,"#fffaf0",12,"#82b4ae");
  label(g,440,117,"ของจำนำต้องส่งมอบจริง");
 }
 if(model.id==="1401"){
  rect(g,285,78,313,51,"#fffaf0",12,"#82b4ae");
  label(g,440,109,"ใช้ทางเป็นสิทธิ หรือแค่ได้รับอนุญาต?");
 }
 if(model.id==="144"){
  rect(g,230,250,395,26,"#ad805b",7);
  for(var i=0;i<4;i++){rect(g,252+i*109,275,19,60,"#a97853",4);}
  drawObject(g,"tool",710,265,.75);
  label(g,435,376,"โต๊ะและขาที่แยกออกแล้วอาจเสียรูป");
 }
 if(model.id==="146"){
  drawObject(g,"tent",450,269,1.35);
  label(g,443,376,"สิ่งปลูกสร้างชั่วคราวบนที่ดิน");
 }
 if(model.id==="1401"){
  drawObject(g,"clock",293,280,.55);drawObject(g,"permission",589,280,.53);
 }
 if(model.id==="1332"){
  drawObject(g,"goods",447,254,.70);
  label(g,438,383,"สุจริต · แหล่งซื้อ · ชดใช้ราคาก่อนคืน");
 }
 if(model.id==="574"){
  drawObject(g,"car",440,286,.9);drawObject(g,"calendar",624,264,.55);
 }
 if(model.id==="640"||model.id==="641"){
  drawObject(g,"bike",440,270,1.02);
 }
 if(model.id==="193/27"){
  drawObject(g,"pledge",442,286,.85);
 }

}
function pointSlots(model){
 var n=model.parts.length;
 // Stage cards are around the physical fact illustration, not conceptual tree branches.
 var x=[100,300,500,700],positions=[];
 if(n===1)return [{x:440,y:177}];
 if(n===2)return [{x:285,y:163},{x:590,y:163}];
 if(n===3)return [{x:166,y:153},{x:444,y:153},{x:712,y:153}];
 if(n===4)return x.map(function(v,i){return {x:v,y:153};});
 for(var i=0;i<n;i++)positions.push({x:95+(i%4)*225,y:i<4?149:378});
 return positions;
}
function renderPartMarker(g,part,index,coords,select){
 var a=svg(g,"g",{"class":"niti-ill-hotspot",role:"button",tabindex:"0","aria-label":"ประเด็น "+(index+1)+" "+part.label,"aria-pressed":"false"});
 // No text is injected as HTML; all content is set through DOM textContent.
 rect(a,coords.x-91,coords.y-29,182,55,"#ffffff",16,"#a5c8d0");
 circle(a,coords.x-68,coords.y-2,19,"#247d9b");
 label(a,coords.x-68,coords.y+4,String(index+1),"#ffffff");
 // The tiny illustrated object corresponds to this particular legal issue.
 drawObject(a,part.shape,coords.x+61,coords.y+61,.32);
 var split=part.label.length>20?part.label.slice(0,19)+"…":part.label;
 svg(a,"text",{x:coords.x-44,y:coords.y+4,fill:"#214457","font-size":14.5,"font-weight":700,"font-family":"Sarabun, Tahoma, sans-serif"},split);
 a.addEventListener("click",function(){select(index,true);});
 a.addEventListener("keydown",function(ev){if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();select(index,true);}});
 return a;
}
function mount(host,model){
 var image=host.querySelector(".niti-ill-image");
 var details=host.querySelector(".niti-ill-details");
 var list=host.querySelector(".niti-ill-list");
 var counter=host.querySelector(".niti-ill-progress");
 if(!image||!details||!list||!model.parts?.length)return {dispose:function(){}};
 image.replaceChildren();list.replaceChildren();
 var illustration=svg(image,"svg",{viewBox:"0 0 880 430",role:"group","aria-label":"ภาพเหตุการณ์ "+model.kindLabel+" มีจุดให้คลิกอ่านองค์ประกอบ "+model.parts.length+" ประเด็น",preserveAspectRatio:"xMidYMid meet",class:"niti-law-svg"});
 var defs=svg(illustration,"defs",{});
 var marker=svg(defs,"marker",{id:"niti-svg-arrow",markerWidth:8,markerHeight:8,refX:6,refY:3,orient:"auto"});polygon(marker,"0,0 6,3 0,6","#278b93");
 backdrop(illustration,model);specialized(illustration,model);
 var places=pointSlots(model);
 var mark=[],buttons=[],states=model.parts.map(function(){return "unknown";}),current=0;
 var layout=svg(illustration,"g",{class:"niti-law-stages"});
 model.parts.forEach(function(part,i){
  var coord=places[i]||{x:440,y:153};
  var item=renderPartMarker(layout,part,i,coord,select);
  mark.push(item);
  var button=node("button","niti-ill-pick",(i+1)+". "+part.label);
  button.type="button";button.setAttribute("aria-pressed","false");
  button.addEventListener("click",function(){select(i,true);});
  list.appendChild(button);buttons.push(button);
 });
 function updateCounter(){
  var found=states.filter(function(s){return s==="yes";}).length;
  var missing=states.filter(function(s){return s==="no";}).length;
  var unsure=states.filter(function(s){return s==="unknown";}).length;
  if(counter)counter.textContent="บันทึกข้อเท็จจริง: พบ "+found+" · ไม่พบ "+missing+" · ยังไม่แน่ใจ "+unsure+" (ไม่ได้ตัดสินผลคดีอัตโนมัติ)";
 }
 function choose(i,status){
  states[i]=status;
  select(i,false);
 }
 function select(i,focus){
  var p=model.parts[i];if(!p)return;current=i;
  mark.forEach(function(e,j){e.setAttribute("aria-pressed",String(j===i));});
  buttons.forEach(function(e,j){e.setAttribute("aria-pressed",String(j===i));});
  details.replaceChildren();
  details.appendChild(node("span","niti-ill-step","ประเด็น "+(i+1)+" จาก "+model.parts.length));
  details.appendChild(node("h4","",p.label));
  details.appendChild(node("p","",p.explanation));
  details.appendChild(node("strong","","ลองวิเคราะห์จากสถานการณ์"));
  details.appendChild(node("p","",p.ask));
  details.appendChild(node("p","niti-ill-warning","ข้อควรระวัง: "+model.exception));
  details.appendChild(node("p","niti-ill-hint","บางประเด็นเป็นทางเลือกหรือข้อยกเว้น จึงไม่จำเป็นต้องมีครบพร้อมกัน"));
  var controls=node("div","niti-ill-answers");
  [["yes","พบข้อเท็จจริงนี้"],["no","ไม่พบ"],["unknown","ยังไม่แน่ใจ"]].forEach(function(choice){
   var b=node("button","niti-ill-answer",choice[1]);
   b.type="button";b.setAttribute("aria-pressed",String(states[i]===choice[0]));
   b.addEventListener("click",function(){choose(i,choice[0]);});
   controls.appendChild(b);
  });
  details.appendChild(controls);
  updateCounter();
  if(focus){details.tabIndex=-1;details.focus({preventScroll:true});}
 }
 select(0,false);
 return {dispose:function(){image.replaceChildren();}};
}
window.NITI_STATUTE_ILLUSTRATION={mount:mount,draw:backdrop};
})();