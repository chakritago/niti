/* NITI illustrated legal scenarios: accessible 2D SVG and no external rendering dependencies.
 * Zero-collision build v3: SVG viewBox 0 0 880 380, strict Y-zoning Header 0-48 / Visual Strip 58-145 / Auto-Slot Cards 155-340.
 * SVG holds ONLY short role/verb/number badges (wrapped, measured, opaque backing + clipPath). Long Thai lives in HTML only.
 * Features: share PNG + copy link, mini-quiz ก/ข with instant feedback (safe distractors, no invented rules), localStorage read/unread + quiz status.
 * Legal texts rendered verbatim only; no new legal facts.
 */
(function(){
"use strict";

var FOOTER_DISCLAIMER="สื่อการศึกษาเพื่อความเข้าใจโครงสร้างตัวบท ไม่ใช่คำวินิจฉัยคดี";
var TYPE_STYLES={
  mandatory:{label:"ต้องทำ",color:"#047857",bg:"#ECFDF5"},
  time:{label:"เงื่อนไขเวลา",color:"#B45309",bg:"#FFFBEB"},
  exception:{label:"ข้อยกเว้น",color:"#B91C1C",bg:"#FEF2F2",dashed:true},
  alternative:{label:"ทางเลือก",color:"#0369A1",bg:"#EFF6FF"}
};
var ROLE_STYLES=[
  {label:"เจ้าหนี้ / ผู้มีสิทธิ",color:"#1E40AF",bg:"#DBEAFE"},
  {label:"ลูกหนี้ / ผู้มีหน้าที่",color:"#C2410C",bg:"#FFEDD5"},
  {label:"บุคคลภายนอก / ทะเบียน",color:"#6D28D9",bg:"#EDE9FE"}
];

/* ---------- localStorage read/unread (unchanged behaviour) ---------- */
var READ_KEY="niti-statute-read-v1";
var readMem={};
function loadReadMap(){
  try{
    if(typeof localStorage==="undefined") return {};
    var raw=localStorage.getItem(READ_KEY);
    if(!raw) return {};
    var parsed=JSON.parse(raw);
    if(!parsed||typeof parsed!=="object"||Array.isArray(parsed)) return {};
    return parsed;
  }catch(e){ return {}; }
}
function saveReadMap(map){
  try{
    if(typeof localStorage==="undefined") return false;
    localStorage.setItem(READ_KEY, JSON.stringify(map));
    return true;
  }catch(e){ return false; }
}
function getReadStatus(id){
  var key=String(id==null?"":id);
  var map=loadReadMap();
  var entry=map[key];
  if(entry&&typeof entry==="object") return {read:entry.read===true, updatedAt:typeof entry.updatedAt==="string"?entry.updatedAt:null};
  if(entry===true) return {read:true, updatedAt:null};
  if(entry===false) return {read:false, updatedAt:null};
  return {read:false, updatedAt:null};
}
function isRead(id){ return getReadStatus(id).read; }
function countReadFromMap(map){
  var n=0; Object.keys(map||{}).forEach(function(k){ var e=map[k]; if(e&&typeof e==="object"?e.read===true:e===true) n++; });
  return n;
}
function setReadStatus(id, read){
  var key=String(id==null?"":id);
  var want=read===true;
  var updatedAt=new Date().toISOString();
  var map=loadReadMap();
  map[key]={read:want, updatedAt:updatedAt};
  readMem[key]=map[key];
  saveReadMap(map);
  try{
    if(typeof window!=="undefined"&&typeof window.CustomEvent==="function"&&typeof window.dispatchEvent==="function"){
      window.dispatchEvent(new window.CustomEvent("niti:statute-read-change",{detail:{id:key,read:want,updatedAt:updatedAt}}));
    }
  }catch(e){}
  return {read:want, updatedAt:updatedAt};
}
function overallReadText(){
  var map=loadReadMap();
  Object.keys(readMem).forEach(function(k){ if(!map[k]) map[k]=readMem[k]; });
  var ids=null;
  try{ if(typeof window!=="undefined"&&window.NITI_DIORAMA_DATA&&Array.isArray(window.NITI_DIORAMA_DATA.ids)) ids=window.NITI_DIORAMA_DATA.ids; }catch(e){}
  if(ids&&ids.length){
    var c=0; ids.forEach(function(id){ var e=map[String(id)]; if(e&&typeof e==="object"?e.read===true:e===true) c++; });
    return "อ่านแล้ว "+c+" จาก "+ids.length+" มาตรา";
  }
  var keys=Object.keys(map);
  if(!keys.length) return "";
  return "อ่านแล้ว "+countReadFromMap(map)+" จาก "+keys.length+" มาตราที่เคยเปิด";
}

/* ---------- Quiz persistence (separate from read key) ---------- */
var QUIZ_KEY="niti_quiz_status_v1";
var quizMem={};
function loadQuizMap(){
  try{
    if(typeof localStorage==="undefined") return {};
    var raw=localStorage.getItem(QUIZ_KEY);
    if(!raw) return {};
    var p=JSON.parse(raw);
    if(!p||typeof p!=="object"||Array.isArray(p)) return {};
    return p;
  }catch(e){ return {}; }
}
function saveQuizMap(m){
  try{ if(typeof localStorage!=="undefined") localStorage.setItem(QUIZ_KEY, JSON.stringify(m)); return true; }catch(e){ return false; }
}
function getQuizStatus(id){
  var k=String(id==null?"":id);
  var m=loadQuizMap();
  var e=m[k];
  if(e&&typeof e==="object") return {choice:typeof e.choice==="string"?e.choice:null, isCorrect:e.isCorrect===true, updatedAt:typeof e.updatedAt==="string"?e.updatedAt:null};
  return {choice:null, isCorrect:false, updatedAt:null};
}
function setQuizStatus(id, choice, isCorrect){
  var k=String(id==null?"":id);
  var at=new Date().toISOString();
  var m=loadQuizMap();
  m[k]={choice:choice, isCorrect:isCorrect===true, updatedAt:at};
  quizMem[k]=m[k];
  saveQuizMap(m);
  return {choice:choice, isCorrect:isCorrect===true, updatedAt:at};
}
/* ---------- Universal slots: strict Y-zoning, gap >=16, all 64 sections ---------- */
function computeUniversalSlots(n){
  var total=Number(n)||0;
  if(total<=0) return [];
  var margin=16, gap=16, top=155, availH=185, availW=880-32;
  var cols, rows;
  if(total<=1){ cols=1; rows=1; }
  else if(total<=3){ cols=total; rows=1; }
  else if(total===4){ cols=2; rows=2; }
  else { cols=3; rows=2; }
  var w=Math.floor((availW-(cols-1)*gap)/cols);
  var h=Math.floor((availH-(rows-1)*gap)/rows);
  var out=[];
  for(var i=0;i<total;i++){
    var col=i%cols, row=Math.floor(i/cols);
    var rowCount=(row===rows-1 && (total%cols)!==0) ? (total%cols) : cols;
    // For full rows rowCount==cols; for last partial row center it.
    if(row<rows-1) rowCount=cols;
    var rowW=rowCount*w+(rowCount-1)*gap;
    var x0=Math.floor((880-rowW)/2);
    out.push({x:x0+col*(w+gap), y:top+row*(h+gap), w:w, h:h});
  }
  return out;
}
function computePointSlotsUniversal(n){ return computeUniversalSlots(n); }
/* Opaque pill backing helper: every SVG text sits on #FFFFFF opacity 100% + clipPath */
function pillBacking(g, x, y, w, h, fill, stroke, dashed, clipId){
  // clipPath to guarantee no text bleeds outside card
  var defs=g.ownerDocument?null:null;
  var clip=null;
  try{
    var svgRoot=g.ownerSVGElement||g;
    // find nearest svg ancestor via parent chain
    var p=g;
    while(p && p.tagName!=="svg") p=p.parentNode;
    if(p){
      var d=p.querySelector("defs");
      if(d){
        clip=document.createElementNS(NS,"clipPath");
        clip.setAttribute("id",clipId);
        var cr=document.createElementNS(NS,"rect");
        cr.setAttribute("x",String(x)); cr.setAttribute("y",String(y));
        cr.setAttribute("width",String(w)); cr.setAttribute("height",String(h));
        cr.setAttribute("rx","12");
        clip.appendChild(cr); d.appendChild(clip);
      }
    }
  }catch(e){}
  var r=rect(g,x,y,w,h,"#FFFFFF",12,"none");
  r.setAttribute("opacity","1");
  r.setAttribute("fill","#FFFFFF");
  r.setAttribute("fill-opacity","1");
  if(clipId) r.setAttribute("clip-path","url(#"+clipId+")");
  var border=rect(g,x,y,w,h,fill||"#FFFFFF",12,stroke||"#CBD5E1");
  border.setAttribute("fill","none");
  border.setAttribute("stroke-width","2");
  if(dashed) border.setAttribute("stroke-dasharray","6 4");
  return {backing:r, border:border, clipId:clipId};
}
function truncateDisplay(s, maxChars){
  var t=String(s||"").replace(/\s+/g," ").trim();
  var m=maxChars||180;
  if(t.length<=m) return t;
  return t.slice(0,m-1)+"…";
}

function inferPartType(part){
  var s=(part&&part.label)||"";
  if(/ข้อยกเว้น|ยกเว้น|เว้นแต่|ไม่ต้อง|ไม่จำเป็น/.test(s))return "exception";
  if(/เวลา|วัน|เดือน|ปี|อายุความ|กำหนด|ภายใน|ระยะ|60 วัน|10 ปี|5 ปี/.test(s))return "time";
  if(/หรือ|ทางเลือก|อย่างใด|เลือก/.test(s))return "alternative";
  return "mandatory";
}

/* ---------- Thai text measurement + wrapping (zero-collision) ---------- */
var _measureCtx=null;
function measureThaiTextWidth(text, fontSize, fontWeight){
  var s=String(text||"");
  try{
    if(typeof document!=="undefined"&&document.createElement){
      if(!_measureCtx){ var cv=document.createElement("canvas"); _measureCtx=cv.getContext("2d"); }
      if(_measureCtx){
        _measureCtx.font=(fontWeight||"700")+" "+fontSize+"px Sarabun, Tahoma, sans-serif";
        return _measureCtx.measureText(s).width;
      }
    }
  }catch(e){}
  return s.length*fontSize*0.62;
}
function segmentThai(text){
  var s=String(text||"");
  try{
    if(typeof Intl!=="undefined"&&typeof Intl.Segmenter==="function"){
      var seg=new Intl.Segmenter("th",{granularity:"word"});
      var out=[]; var it=seg.segment(s);
      for(var segItem of it){ out.push(segItem.segment); }
      if(out.length) return out;
    }
  }catch(e){}
  // Fallback: split keeping spaces, then split long tokens by chars
  var parts=s.split(/(\s+)/).filter(function(x){return x.length;});
  var res=[];
  parts.forEach(function(p){ if(p.length<=12) res.push(p); else { for(var i=0;i<p.length;i+=12) res.push(p.slice(i,i+12)); } });
  return res;
}
function wrapThaiSvgLines(text, maxWidth, fontSize, maxLines){
  var s=String(text||"").replace(/\s+/g," ").trim();
  if(!s) return [""];
  var words=segmentThai(s);
  var lines=[]; var cur="";
  function fits(t){ return measureThaiTextWidth(t, fontSize, "700")<=maxWidth; }
  for(var i=0;i<words.length;i++){
    var w=words[i];
    if(!cur){ 
      if(fits(w)){ cur=w; } else {
        // hard-break a single overlong word by chars
        var chunk="";
        for(var c=0;c<w.length;c++){
          var trial=chunk+w[c];
          if(fits(trial)) chunk=trial; else { lines.push(chunk); chunk=w[c]; }
        }
        cur=chunk;
      }
    } else {
      var trial2=cur+w;
      if(fits(trial2)) cur=trial2;
      else { lines.push(cur); cur=w; }
    }
    if(lines.length>= (maxLines||2)){
      // overflow: ellipsis on last visible line
      var last=lines[lines.length-1]||"";
      while(last.length>1 && !fits(last+"…")) last=last.slice(0,-1);
      lines[lines.length-1]=last+"…";
      return lines.slice(0,maxLines||2);
    }
  }
  if(cur) lines.push(cur);
  if(lines.length>(maxLines||2)){
    var truncated=lines.slice(0,maxLines||2);
    var l=truncated[truncated.length-1];
    while(l.length>1 && !fits(l+"…")) l=l.slice(0,-1);
    truncated[truncated.length-1]=l+"…";
    return truncated;
  }
  return lines;
}
function shortBadge(text, maxChars){
  var s=String(text||"").trim();
  if(s.length<= (maxChars||16)) return s;
  return s.slice(0, Math.max(1,(maxChars||16)-1))+"…";
}
/* Short verb badges for SVG only — truncated display of existing part labels, never new legal text */
function svgVerbForPart(part, index){
  var label=String((part&&part.label)||"");
  // Keep SVG to ~2 short tokens: prefer first clause before / or ,
  var first=label.split(/[\/,·;]/)[0].trim();
  return shortBadge(first, 16);
}

/* ---------- SVG primitives ---------- */
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
/* Wrapped multi-line SVG text: lineHeight 20 avoids tone-mark collision */
function svgMultiline(g, x, y, text, opts){
  var o=opts||{};
  var fontSize=o.fontSize||14;
  var maxWidth=o.maxWidth||160;
  var maxLines=o.maxLines||2;
  var fill=o.fill||"#1F2937";
  var weight=o.weight||"700";
  var anchor=o.anchor||"middle";
  var lines=wrapThaiSvgLines(text, maxWidth, fontSize, maxLines);
  var el=svg(g,"text",{x:x,y:y,fill:fill,"font-size":fontSize,"font-weight":weight,"text-anchor":anchor,"font-family":"Sarabun, Tahoma, sans-serif","text-size-adjust":"none"});
  lines.forEach(function(ln, idx){
    var tsp=svg(el,"tspan",{x:x, dy: idx===0?0:20}, ln);
    void tsp;
  });
  return el;
}
function svgBadge(g, cx, cy, w, h, text, style){
  var st=style||{color:"#047857",bg:"#ECFDF5"};
  var r=rect(g, cx-w/2, cy-h/2, w, h, st.bg, h/2, st.color);
  r.setAttribute("stroke-width","2");
  if(st.dashed) r.setAttribute("stroke-dasharray","6 4");
  svgMultiline(g, cx, cy+5, text, {fontSize:12.5, maxWidth:w-14, maxLines:1, fill:st.color, weight:"800"});
  return r;
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
 circle(p,12,-12,20,"#ffd66e","#ae822e");
 svgMultiline(p,12,-6,"฿",{fontSize:16,maxWidth:20,maxLines:1,fill:"#684917",weight:"800"});
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
 return shape(g,"path",{d:"M"+x1+" "+y1+" L"+x2+" "+y2,fill:"none",stroke:color||"#278b93","stroke-width":5,"stroke-linecap":"round","marker-end":"url(#niti-svg-arrow)"});
}
function drawEnvelope(g,x,y,s){
  var p=svg(g,"g",{transform:"translate("+x+","+y+") scale("+s+")"});
  rect(p,-44,-28,88,56,"#FFFFFF",6,"#367DA0");
  shape(p,"path",{d:"M-44 -28 L0 8 L44 -28",fill:"none",stroke:"#367DA0","stroke-width":3});
  svgMultiline(p,0,26,"หนังสือ",{fontSize:11,maxWidth:70,maxLines:1,fill:"#1E40AF",weight:"800"});
  return p;
}
function drawGavel(g,x,y,s){
  var p=svg(g,"g",{transform:"translate("+x+","+y+") scale("+s+")"});
  line(p,-30,30,18,-12,"#946448",11);
  rect(p,-2,-38,52,20,"#AC7959",5);
  rect(p,-38,38,76,8,"#8B5E3C",3);
  return p;
}
function drawObject(g,kind,x,y,s){
 var p=svg(g,"g",{transform:"translate("+x+","+y+") scale("+s+")"});
 switch(kind){
 case "parcel":drawParcel(p,-53,-33,106,72,"#b9e3ac",true);break;
 case "house":drawHouse(p,0,18,1);break;
 case "path":rect(p,-62,-14,124,30,"#98b1c0",10);line(p,-47,1,48,1,"#fff7e8",4,"14 12");break;
 case "registry":rect(p,-53,-13,106,68,"#c1eaf4",10,"#698999");rect(p,-60,-35,120,28,"#367da0",6);svgMultiline(p,0,-15,"ทะเบียน",{fontSize:12,maxWidth:80,maxLines:1,fill:"#ffffff",weight:"800"});rect(p,-20,12,40,45,"#fbf3de",4);break;
 case "document":case "letter":case "stamp":drawPaper(p,0,0,1);break;
 case "coins":drawCoins(p,0,0,1);break;
 case "person":drawPerson(p,0,18,1);break;
 case "bank":rect(p,-57,-24,114,78,"#cde9ea",8,"#6b969c");polygon(p,"-64,-24 0,-57 64,-24","#5f91b0");for(var i=0;i<3;i++)rect(p,-42+i*30,-8,16,57,"#f7f0db",3);break;
 case "clock":case "calendar":drawClock(p,0,7,1);break;
 case "watch":drawClock(p,0,0,.8);rect(p,-17,-62,34,31,"#648d9e",6);rect(p,-17,31,34,31,"#648d9e",6);break;
 case "pledge":drawObject(p,"watch",-20,2,.55);drawObject(p,"handshake",26,23,.53);break;
 case "fence":for(var i=0;i<5;i++)rect(p,-52+i*27,-34,9,75,"#b98569",3);line(p,-58,12,62,12,"#805c45",9);break;
 case "permission":case "shield":case "lock":rect(p,-42,-34,84,76,"#d6f1e1",16,"#5a9b84");svgMultiline(p,0,10,"✓",{fontSize:20,maxWidth:30,maxLines:1,fill:"#277957",weight:"800"});break;
 case "warning":case "crack":polygon(p,"0,-49 -52,46 52,46","#ffe1a1");svgMultiline(p,0,29,"!",{fontSize:20,maxWidth:30,maxLines:1,fill:"#b56637",weight:"800"});break;
 case "goods":case "selector":case "gift":rect(p,-48,-27,96,74,"#eac48a",9,"#ab7c52");rect(p,-5,-27,12,74,"#fff1c7",2);break;
 case "car":rect(p,-62,-15,126,46,"#79b4dc",12);rect(p,-25,-42,62,30,"#cde9ff",8);circle(p,-39,32,14,"#415267");circle(p,39,32,14,"#415267");break;
 case "bike":circle(p,-46,18,23,"none","#4c6679");circle(p,46,18,23,"none","#4c6679");polygon(p,"-46,18 -11,-15 12,18 -46,18","#91c7ea");break;
 case "handshake":drawPerson(p,-29,8,.62,"#6592b8");drawPerson(p,29,8,.62,"#75ab8b");line(p,-10,23,12,23,"#ad7a5d",12);break;
 case "flag":line(p,-22,-47,-22,48,"#5f8294",6);polygon(p,"-18,-45 49,-32 -18,-8","#ec9478");break;
 case "eye":circle(p,0,1,26,"#e6f3fa","#4f8cad");circle(p,0,1,12,"#4c6687");break;
 case "auction":case "gavel":drawGavel(p,0,0,1);break;
 case "tent":polygon(p,"-61,43 0,-48 61,43","#edbf84");line(p,0,-48,0,43,"#d47a60",4);break;
 case "tool":line(p,-35,42,31,-40,"#956b4f",13);rect(p,3,-47,58,15,"#8ba8af",3);break;
 default:drawPaper(p,0,0,.86);
 }
 return p;
}

/* ---------- Compact header (measured, no overlap) ---------- */
function drawHeader(g,model){
  // Strict zone Header 0-48, opaque backing, measured legend, no overlap
  rect(g,0,0,880,48,"#FFFFFF",0,"#CBD5E1");
  rect(g,16,10,104,28,"#1E40AF",14);
  svgMultiline(g,68,28,"มาตรา "+String(model.id||""),{fontSize:13,maxWidth:96,maxLines:1,fill:"#FFFFFF",weight:"800"});
  var title=String(model.title||("มาตรา "+String(model.id||"")));
  svgMultiline(g,132,22,title,{fontSize:16,maxWidth:500,maxLines:1,fill:"#111827",weight:"800",anchor:"start"});
  svgMultiline(g,132,40,"หมวด: "+String(model.kindLabel||model.kind||""),{fontSize:11,maxWidth:500,maxLines:1,fill:"#4B5563",weight:"600",anchor:"start"});
  // Legend right-aligned, measured, gap >=8
  var lx=880-16;
  var pills=ROLE_STYLES.slice().reverse();
  pills.forEach(function(r){
    var w=Math.ceil(measureThaiTextWidth(r.label,10,"700"))+24;
    lx-=w;
    var rr=rect(g,lx,12,w,24,r.bg,12,r.color); rr.setAttribute("stroke-width","1.5");
    svgMultiline(g,lx+w/2,28,r.label,{fontSize:10,maxWidth:w-10,maxLines:1,fill:r.color,weight:"700"});
    lx-=8;
  });
}
function drawFooter(g){
  // Footer zone 340-380, opaque backing
  rect(g,0,340,880,40,"#FFFFFF",0,"#E5E7EB");
  svgMultiline(g,440,364,FOOTER_DISCLAIMER,{fontSize:11,maxWidth:800,maxLines:1,fill:"#6B7280",weight:"600"});
}

/* ---------- Action-based stages: WHO does WHAT to WHOM + consequence ---------- */
function actionBox(g, cx, cy, w, h, fill, stroke, titleText, subText){
  var r=rect(g,cx-w/2,cy-h/2,w,h,fill,14,stroke); r.setAttribute("stroke-width","2.5");
  svgMultiline(g,cx,cy-8,titleText,{fontSize:14,maxWidth:w-16,maxLines:1,fill:"#111827",weight:"800"});
  if(subText) svgMultiline(g,cx,cy+14,subText,{fontSize:12,maxWidth:w-16,maxLines:1,fill:"#475569",weight:"600"});
  return r;
}
function drawStage728(g){
  // Timeline: house+chain -> letter -> calendar >=60 -> court. Dashed branch for third-party mortgagor.
  rect(g,0,0,880,296,"#F8FAFD",0);
  // Node 1: house with chain
  actionBox(g,120,150,190,110,"#FFEDD5","#C2410C","บ้านจำนอง","หนี้ถึงกำหนด");
  drawHouse(g,120,205,0.55,"#fff4d8");
  svgBadge(g,120,240,120,26,"ไม่ชำระ",{color:"#C2410C",bg:"#FFEDD5"});
  drawArrow(g,220,150,275,150,"#047857");
  // Node 2: envelope
  actionBox(g,375,150,200,110,"#DBEAFE","#1E40AF","บอกกล่าว","เป็นหนังสือ");
  drawEnvelope(g,375,205,0.6);
  drawArrow(g,480,150,535,150,"#047857");
  // Node 3: calendar >=60
  actionBox(g,640,150,200,110,"#FEF3C7","#B45309","≥ 60 วัน","นับแต่ได้รับหนังสือ");
  drawClock(g,640,205,0.55);
  drawArrow(g,740,150,790,150,"#047857");
  // Node 4: enforcement (compact, right edge) — use badge + gavel icon below to avoid overlap
  actionBox(g,820,110,110,64,"#D1FAE5","#047857","บังคับจำนอง","ฟ้องศาล");
  drawGavel(g,820,205,0.7);
  // Dashed branch: third-party mortgagor — generic wording only, NO invented deadline
  var br=rect(g,240,268,400,28,"#FEF2F2",14,"#B91C1C"); br.setAttribute("stroke-dasharray","6 4"); br.setAttribute("stroke-width","2");
  svgMultiline(g,440,286,"กรณีผู้จำนองบุคคลภายนอก — ตรวจการแจ้งเพิ่มเติม",{fontSize:12,maxWidth:384,maxLines:1,fill:"#B91C1C",weight:"700"});
}
function drawStage1387(g){
  rect(g,0,0,880,296,"#F8FAFD",0);
  // Plot B (left) = สามยทรัพย์, Plot A (right) = ภารยทรัพย์, public road bottom
  rect(g,40,90,340,150,"#DBEAFE",14,"#1E40AF");
  svgMultiline(g,210,118,"สามยทรัพย์",{fontSize:15,maxWidth:200,maxLines:1,fill:"#1E40AF",weight:"800"});
  svgMultiline(g,210,140,"ที่ดินได้ประโยชน์",{fontSize:12,maxWidth:280,maxLines:1,fill:"#1E3A8A",weight:"600"});
  drawHouse(g,210,195,0.7,"#EFF6FF");
  rect(g,500,90,340,150,"#FFEDD5",14,"#C2410C");
  svgMultiline(g,670,118,"ภารยทรัพย์",{fontSize:15,maxWidth:200,maxLines:1,fill:"#C2410C",weight:"800"});
  svgMultiline(g,670,140,"ที่ดินรับภาระ",{fontSize:12,maxWidth:280,maxLines:1,fill:"#7C2D12",weight:"600"});
  drawHouse(g,670,195,0.7,"#FFF7ED");
  // Passage arrow through A to public road
  rect(g,380,150,120,28,"#D1FAE5",14,"#047857");
  svgMultiline(g,440,168,"ทางผ่าน",{fontSize:12,maxWidth:100,maxLines:1,fill:"#047857",weight:"800"});
  drawArrow(g,380,190,500,190,"#047857");
  rect(g,40,256,800,28,"#E2E8F0",8,"#64748B");
  svgMultiline(g,440,274,"ถนนสาธารณะ",{fontSize:12,maxWidth:200,maxLines:1,fill:"#334155",weight:"700"});
  svgBadge(g,210,292,220,26,"ยอมรับกรรม",{color:"#047857",bg:"#D1FAE5"});
  svgBadge(g,670,292,220,26,"งดเว้นใช้สิทธิ",{color:"#B91C1C",bg:"#FEE2E2"});
}
function drawStage1382(g){
  rect(g,0,0,880,296,"#F8FAFD",0);
  actionBox(g,190,130,300,96,"#F1F5F9","#64748B","เจ้าของเดิม","มีโฉนด แต่ไม่ใช้ที่ดิน");
  drawPerson(g,190,215,0.8,"#94A3B8");
  svgMultiline(g,190,262,"ไม่ดูแล",{fontSize:12,maxWidth:120,maxLines:1,fill:"#475569",weight:"700"});
  drawArrow(g,350,130,420,130,"#047857");
  actionBox(g,600,130,320,96,"#D1FAE5","#047857","ผู้ครอบครอง","สงบ · เปิดเผย · เจตนาเป็นเจ้าของ");
  // Fence + tree icons for possession
  drawObject(g,"fence",520,215,0.6);
  drawObject(g,"flag",690,215,0.6);
  // Time bar
  rect(g,120,272,640,28,"#FEF3C7",14,"#B45309");
  svgMultiline(g,440,290,"ที่ดิน 10 ปี / สังหาริมทรัพย์ 5 ปี → ได้กรรมสิทธิ์",{fontSize:12.5,maxWidth:600,maxLines:1,fill:"#92400E",weight:"800"});
}
function drawStageGeneric(g, model){
  // Generic action template: Actor A -> verb -> Actor B + consequence, using kind only
  rect(g,0,0,880,296,"#F8FAFD",0);
  var kind=String(model.kind||"");
  var left="ฝ่ายหนึ่ง", right="อีกฝ่ายหนึ่ง", verb="ทำนิติกรรม", conseq="ตรวจผลตามมาตรา";
  if(kind==="guarantee"){ left="เจ้าหนี้"; right="ผู้ค้ำ + ลูกหนี้"; verb="ค้ำประกัน"; conseq="รับผิดตามหนี้หลัก"; }
  else if(kind==="lease"||kind==="hire"){ left="ผู้ให้เช่า"; right="ผู้เช่า"; verb="ให้ใช้ทรัพย์"; conseq="ใช้ตามสัญญา"; }
  else if(kind==="pledge"){ left="ผู้จำนำ"; right="ผู้รับจำนำ"; verb="ส่งมอบทรัพย์"; conseq="เป็นหลักประกัน"; }
  else if(kind==="mortgage"){ left="ผู้จำนอง"; right="ผู้รับจำนอง"; verb="ตราจำนอง"; conseq="ไม่ต้องส่งมอบ"; }
  else if(kind==="loan"){ left="ผู้ให้กู้"; right="ผู้กู้"; verb="ให้กู้เงิน"; conseq="คืนเงิน + ดอกเบี้ย"; }
  else if(kind==="registry"){ left="คู่กรณี"; right="พนักงานเจ้าหน้าที่"; verb="จดทะเบียน"; conseq="สมบูรณ์ตามแบบ"; }
  else if(kind==="time"){ left="เจ้าหนี้"; right="ลูกหนี้"; verb="นับเวลา"; conseq="อายุความ"; }
  else if(kind==="possession"||kind==="property"){ left="ผู้ยึดถือ"; right="เจ้าของ"; verb="ครอบครอง"; conseq="ตรวจเจตนา + เวลา"; }
  else if(kind==="trade"||kind==="exchange"||kind==="gift"||kind==="borrow"){ left="ผู้ให้ / ผู้ขาย"; right="ผู้รับ / ผู้ซื้อ"; verb="ส่งมอบ"; conseq="ตรวจกรรมสิทธิ์"; }
  actionBox(g,190,150,260,110, "#DBEAFE","#1E40AF", left, "ผู้ทรงสิทธิ / ผู้ให้");
  drawPerson(g,190,230,0.9,"#4C84AA");
  drawArrow(g,330,150,450,150,"#047857");
  svgBadge(g,390,120,140,28,verb,{color:"#047857",bg:"#D1FAE5"});
  actionBox(g,640,150,260,110, "#FFEDD5","#C2410C", right, "ผู้มีหน้าที่ / ผู้รับ");
  drawPerson(g,640,230,0.9,"#6EA68A");
  svgBadge(g,440,270,260,28,conseq,{color:"#1E40AF",bg:"#DBEAFE"});
}
function drawActionStage(g, model){
  if(String(model.id)==="728") drawStage728(g);
  else if(String(model.id)==="1387") drawStage1387(g);
  else if(String(model.id)==="1382") drawStage1382(g);
  else drawStageGeneric(g, model);
}

/* Legacy: keep backdrop for API compat (not used in new mount) */
function backdrop(g,model){ drawActionStage(g, model); }
function specialized(g,model){ /* kept as no-op: action stage already encodes meaning */ }

/* ---------- SVG markers: small numbered dots only (no long text in SVG) ---------- */
function renderSvgMarkers(g, model, select){
  var n=model.parts.length;
  var y=330;
  var gap=16;
  var dotR=14;
  var totalW=n*(dotR*2)+ (n-1)*gap;
  var startX=(880-totalW)/2 + dotR;
  var marks=[];
  for(var i=0;i<n;i++){
    var cx=startX + i*(dotR*2+gap);
    var type=inferPartType(model.parts[i]);
    var st=TYPE_STYLES[type]||TYPE_STYLES.mandatory;
    var grp=svg(g,"g",{"class":"niti-ill-hotspot",role:"button",tabindex:"0","aria-label":"ประเด็น "+(i+1)+" "+model.parts[i].label+" — "+st.label,"aria-pressed":"false","data-type":type});
    var c=circle(grp,cx,y,dotR,st.color);
    c.setAttribute("stroke","#FFFFFF"); c.setAttribute("stroke-width","2");
    svgMultiline(grp,cx,y+5,String(i+1),{fontSize:13,maxWidth:24,maxLines:1,fill:"#FFFFFF",weight:"800"});
    (function(idx,el){ el.addEventListener("click",function(){select(idx,true);}); el.addEventListener("keydown",function(ev){if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();select(idx,true);}}); })(i,grp);
    marks.push(grp);
  }
  return marks;
}


/* ---------- Visual Strip 58-145: icons/arrows only, NO long sentences, pointer-events none on decor ---------- */
function setNoPointer(el){
  try{ if(el&&el.setAttribute) el.setAttribute("pointer-events","none"); }catch(e){}
  return el;
}
function drawVisualStrip(g, model){
  // Background
  rect(g,0,58,880,87,"#F8FAFD",0);
  var id=String(model.id||"");
  var kind=String(model.kind||"");
  // Helper to place icon with no-pointer
  function icon(kindName, x, y, s){
    var p=drawObject(g,kindName,x,y,s);
    setNoPointer(p);
    // also set children
    try{ p.querySelectorAll("*").forEach(function(c){ c.setAttribute("pointer-events","none"); }); }catch(e){}
    return p;
  }
  function arrow(x1,y1,x2,y2){
    var a=drawArrow(g,x1,y1,x2,y2,"#047857");
    setNoPointer(a);
    return a;
  }
  var cy=102;
  if(id==="728"){
    icon("house",110,cy,0.55);
    arrow(165,cy,235,cy);
    icon("letter",300,cy,0.6);
    arrow(365,cy,435,cy);
    icon("calendar",500,cy,0.6);
    arrow(565,cy,635,cy);
    icon("gavel",700,cy,0.7);
    // small verb badges (short only, opaque backing)
    svgBadge(g,110,138,110,20,"บ้านจำนอง",{color:"#C2410C",bg:"#FFEDD5"});
    svgBadge(g,300,138,110,20,"บอกกล่าว",{color:"#1E40AF",bg:"#DBEAFE"});
    svgBadge(g,500,138,110,20,"≥ 60 วัน",{color:"#B45309",bg:"#FEF3C7"});
    svgBadge(g,700,138,110,20,"บังคับจำนอง",{color:"#047857",bg:"#D1FAE5"});
  } else if(id==="1387"){
    icon("parcel",180,cy,0.6);
    arrow(280,cy,360,cy);
    icon("path",440,cy,0.6);
    arrow(520,cy,600,cy);
    icon("parcel",690,cy,0.6);
    svgBadge(g,180,138,120,20,"สามยทรัพย์",{color:"#1E40AF",bg:"#DBEAFE"});
    svgBadge(g,440,138,120,20,"ทางผ่าน",{color:"#047857",bg:"#D1FAE5"});
    svgBadge(g,690,138,120,20,"ภารยทรัพย์",{color:"#C2410C",bg:"#FFEDD5"});
  } else if(id==="1382"){
    icon("person",170,cy,0.6);
    arrow(240,cy,320,cy);
    icon("fence",410,cy,0.55);
    arrow(500,cy,580,cy);
    icon("clock",670,cy,0.6);
    svgBadge(g,170,138,120,20,"ครอบครอง",{color:"#1E40AF",bg:"#DBEAFE"});
    svgBadge(g,410,138,120,20,"สงบ เปิดเผย",{color:"#047857",bg:"#D1FAE5"});
    svgBadge(g,670,138,120,20,"10 ปี / 5 ปี",{color:"#B45309",bg:"#FEF3C7"});
  } else if(kind==="guarantee"){
    icon("person",170,cy,0.6); arrow(240,cy,320,cy); icon("person",410,cy,0.6); arrow(480,cy,560,cy); icon("bank",680,cy,0.6);
    svgBadge(g,410,138,120,20,"ค้ำประกัน",{color:"#047857",bg:"#D1FAE5"});
  } else if(kind==="mortgage"){
    icon("house",200,cy,0.6); arrow(280,cy,360,cy); icon("document",440,cy,0.6); arrow(520,cy,600,cy); icon("bank",690,cy,0.6);
    svgBadge(g,440,138,120,20,"ตราจำนอง",{color:"#1E40AF",bg:"#DBEAFE"});
  } else if(kind==="pledge"){
    icon("watch",220,cy,0.6); arrow(300,cy,380,cy); icon("handshake",470,cy,0.6); arrow(550,cy,630,cy); icon("coins",700,cy,0.6);
    svgBadge(g,470,138,120,20,"ส่งมอบ",{color:"#047857",bg:"#D1FAE5"});
  } else if(kind==="lease"||kind==="hire"){
    icon("house",200,cy,0.6); arrow(280,cy,360,cy); icon("document",440,cy,0.6); arrow(520,cy,600,cy); icon("person",690,cy,0.6);
    svgBadge(g,440,138,120,20,"ให้ใช้ทรัพย์",{color:"#1E40AF",bg:"#DBEAFE"});
  } else if(kind==="time"){
    icon("document",220,cy,0.6); arrow(300,cy,380,cy); icon("clock",470,cy,0.6); arrow(550,cy,630,cy); icon("gavel",700,cy,0.6);
    svgBadge(g,470,138,120,20,"นับเวลา",{color:"#B45309",bg:"#FEF3C7"});
  } else {
    icon("person",200,cy,0.6); arrow(280,cy,360,cy); icon("handshake",440,cy,0.6); arrow(520,cy,600,cy); icon("person",690,cy,0.6);
    svgBadge(g,440,138,120,20,"ทำนิติกรรม",{color:"#047857",bg:"#D1FAE5"});
  }
}
/* ---------- Universal Auto-Slot Cards 155-340 ---------- */
function renderUniversalCards(g, model, select, current){
  var slots=computeUniversalSlots(model.parts.length);
  var marks=[];
  model.parts.forEach(function(part, i){
    var slot=slots[i]||{x:16,y:155,w:200,h:80};
    var type=inferPartType(part);
    var st=TYPE_STYLES[type]||TYPE_STYLES.mandatory;
    var clipId="niti-clip-"+String(model.id||"x").replace(/[^A-Za-z0-9_-]/g,"-")+"-"+i;
    var grp=svg(g,"g",{"class":"niti-ill-hotspot",role:"button",tabindex:"0","aria-label":"ประเด็น "+(i+1)+" "+part.label+" — "+st.label,"aria-pressed":String(i===current),"data-type":type});
    // Opaque pill backing + clipPath
    pillBacking(grp, slot.x, slot.y, slot.w, slot.h, "#FFFFFF", st.color, !!st.dashed, clipId);
    // Number circle
    var cx=slot.x+22, cyy=slot.y+24;
    var circ=circle(grp,cx,cyy,14,st.color);
    circ.setAttribute("stroke","#FFFFFF"); circ.setAttribute("stroke-width","2");
    svgMultiline(grp,cx,cyy+5,String(i+1),{fontSize:12,maxWidth:24,maxLines:1,fill:"#FFFFFF",weight:"800"});
    // Type badge (short)
    var badgeW=Math.ceil(measureThaiTextWidth(st.label,10,"700"))+18;
    var bx=slot.x+42, by=slot.y+10;
    var br=rect(grp,bx,by,badgeW,20,st.bg,10,st.color); br.setAttribute("stroke-width","1.5"); if(st.dashed) br.setAttribute("stroke-dasharray","6 4");
    svgMultiline(grp,bx+badgeW/2,by+14,st.label,{fontSize:10,maxWidth:badgeW-8,maxLines:1,fill:st.color,weight:"700"});
    // Title: max 2 lines, wrapped, inside opaque backing (clip ensures no overflow)
    var titleLines=wrapThaiSvgLines(part.label, slot.w-24, 13, 2);
    var titleY=slot.y+52;
    titleLines.forEach(function(ln, li){
      svgMultiline(grp, slot.x+slot.w/2, titleY+li*20, ln, {fontSize:13, maxWidth:slot.w-24, maxLines:1, fill:"#111827", weight:"700"});
    });
    // Tiny verb hint (first clause, truncated) — still short, inside card
    var verb=svgVerbForPart(part,i);
    if(verb && titleLines.length<2){
      svgMultiline(grp, slot.x+slot.w/2, slot.y+slot.h-12, verb, {fontSize:11, maxWidth:slot.w-24, maxLines:1, fill:"#4B5563", weight:"600"});
    }
    // Click / keyboard
    (function(idx,el){ el.addEventListener("click",function(){select(idx,true);}); el.addEventListener("keydown",function(ev){if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();select(idx,true);}}); })(i,grp);
    marks.push(grp);
  });
  return marks;
}

/* ---------- mount ---------- */
function mount(host,model){
  var image=host.querySelector(".niti-ill-image");
  var details=host.querySelector(".niti-ill-details");
  var list=host.querySelector(".niti-ill-list");
  var counter=host.querySelector(".niti-ill-progress");
  if(!image||!details||!list||!model.parts||!model.parts.length)return {dispose:function(){}};
  host.querySelectorAll(".niti-ill-readbar,.niti-ill-meaning,.niti-ill-elements,.niti-conditions-grid,.niti-ill-sharebar,.niti-ill-quiz").forEach(function(el){el.remove();});
  image.replaceChildren();list.replaceChildren();
  // Read/unread
  var readBar=node("div","niti-ill-readbar");
  var readBadge=node("span","niti-ill-read-badge","");
  readBadge.setAttribute("aria-live","polite");
  var readOverall=node("span","niti-ill-read-overall","");
  var btnRead=node("button","niti-ill-read-btn","ทำเครื่องหมายว่าอ่านแล้ว");
  btnRead.type="button";
  var btnUnread=node("button","niti-ill-read-btn","ทำเครื่องหมายว่ายังไม่ได้อ่าน");
  btnUnread.type="button";
  var readControls=node("div","niti-ill-read-controls");
  readControls.appendChild(btnRead);readControls.appendChild(btnUnread);
  readBar.appendChild(readBadge);readBar.appendChild(readOverall);readBar.appendChild(readControls);
  host.insertBefore(readBar,host.firstChild);
  function refreshRead(){
    var st=getReadStatus(model.id);
    readBadge.textContent=st.read?"อ่านแล้ว ✓":"ยังไม่ได้อ่าน";
    readBadge.setAttribute("data-read",String(st.read));
    btnRead.setAttribute("aria-pressed",String(st.read===true));
    btnUnread.setAttribute("aria-pressed",String(st.read===false));
    readOverall.textContent=overallReadText();
  }
  btnRead.addEventListener("click",function(){setReadStatus(model.id,true);refreshRead();});
  btnUnread.addEventListener("click",function(){setReadStatus(model.id,false);refreshRead();});
  function onReadChange(ev){
    try{ if(ev&&ev.detail&&String(ev.detail.id)===String(model.id)) refreshRead(); }catch(e){}
  }
  try{ if(typeof window!=="undefined"&&window.addEventListener) window.addEventListener("niti:statute-read-change",onReadChange); }catch(e){}
  refreshRead();
  // Meaning (verbatim)
  var meaning=node("div","niti-ill-meaning");
  meaning.appendChild(node("h3","niti-ill-meaning-title","ความหมายของมาตรา"));
  if(model.principle) meaning.appendChild(node("p","niti-ill-meaning-text",String(model.principle)));
  if(model.case){
    meaning.appendChild(node("strong","niti-ill-meaning-case-label","สถานการณ์ตัวอย่าง"));
    meaning.appendChild(node("p","niti-ill-meaning-case",String(model.case)));
  }
  if(model.rule){
    meaning.appendChild(node("strong","niti-ill-meaning-rule-label","หลักสำหรับเขียนตอบ"));
    meaning.appendChild(node("p","niti-ill-meaning-rule",String(model.rule)));
  }
  host.insertBefore(meaning,image);
  // Elements (verbatim)
  var elements=node("div","niti-ill-elements");
  elements.appendChild(node("h3","niti-ill-elements-title","องค์ประกอบที่ต้องตรวจ"));
  var elemProgress=node("p","niti-ill-elements-progress","");
  elements.appendChild(elemProgress);
  var elemList=node("ol","niti-ill-elements-list");
  elements.appendChild(elemList);
  if(image.nextSibling) host.insertBefore(elements,image.nextSibling); else host.appendChild(elements);
  // Strict Y-zoning SVG: viewBox 0 0 880 380 — Header 0-48 / Visual Strip 58-145 / Auto-Slot Cards 155-340 / Footer 340-380
  var illustration=svg(image,"svg",{viewBox:"0 0 880 380",role:"group","aria-label":"ภาพเหตุการณ์ "+(model.kindLabel||"")+" มีจุดให้คลิกอ่านองค์ประกอบ "+model.parts.length+" ประเด็น",preserveAspectRatio:"xMidYMid meet",class:"niti-law-svg"});
  var defs=svg(illustration,"defs",{});
  var marker=svg(defs,"marker",{id:"niti-svg-arrow",markerWidth:8,markerHeight:8,refX:6,refY:3,orient:"auto"});polygon(marker,"0,0 6,3 0,6","#278b93");
  drawHeader(illustration,model);
  drawVisualStrip(illustration,model);
  drawFooter(illustration);
  var mark=[]; var buttons=[]; var elemButtons=[]; var condCards=[];
  var states=model.parts.map(function(){return "unknown";});
  var current=0;
  // HTML Conditions Grid BELOW SVG (zero-collision: Thai flows in HTML)
  var grid=node("div","niti-conditions-grid");
  grid.setAttribute("role","list");
  grid.appendChild(node("h3","niti-conditions-title","เงื่อนไข / ประเด็นที่ต้องตรวจ — คลิกเพื่ออ่านรายละเอียด"));
  var gridList=node("div","niti-conditions-list");
  grid.appendChild(gridList);
  image.appendChild(grid);
  // Wire markers after grid exists (select defined below, markers need select)
  function select(i,focus){
    var p=model.parts[i];if(!p)return;current=i;
    mark.forEach(function(e,j){e.setAttribute("aria-pressed",String(j===i));});
    buttons.forEach(function(e,j){e.setAttribute("aria-pressed",String(j===i));});
    elemButtons.forEach(function(e,j){
      e.setAttribute("aria-pressed",String(j===i));
      e.classList.toggle("is-active",j===i);
      var li=e.parentElement; if(li) li.classList.toggle("is-active",j===i);
    });
    condCards.forEach(function(e,j){
      e.setAttribute("aria-pressed",String(j===i));
      e.classList.toggle("is-active",j===i);
    });
    details.replaceChildren();
    details.appendChild(node("span","niti-ill-step","ประเด็น "+(i+1)+" จาก "+model.parts.length));
    var tb=node("span","niti-ill-type-badge",TYPE_STYLES[inferPartType(p)].label);
    tb.setAttribute("data-type",inferPartType(p));
    details.appendChild(tb);
    details.appendChild(node("h4","",p.label));
    details.appendChild(node("p","",p.explanation));
    details.appendChild(node("strong","","ลองวิเคราะห์จากสถานการณ์"));
    details.appendChild(node("p","",p.ask));
    details.appendChild(node("p","niti-ill-warning","ข้อควรระวัง: "+model.exception));
    details.appendChild(node("p","niti-ill-hint","บางประเด็นเป็นทางเลือกหรือข้อยกเว้น จึงไม่จำเป็นต้องมีครบพร้อมกัน"));
    details.appendChild(node("p","niti-ill-disclaimer",FOOTER_DISCLAIMER));
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
  function choose(i,status){ states[i]=status; select(i,false); }
  function updateCounter(){
    var found=states.filter(function(s){return s==="yes";}).length;
    var missing=states.filter(function(s){return s==="no";}).length;
    var unsure=states.filter(function(s){return s==="unknown";}).length;
    if(counter)counter.textContent="บันทึกข้อเท็จจริง: พบ "+found+" · ไม่พบ "+missing+" · ยังไม่แน่ใจ "+unsure+" (ไม่ได้ตัดสินผลคดีอัตโนมัติ)";
    var checked=found+missing;
    elemProgress.textContent="ตรวจแล้ว "+checked+" / "+states.length+" ประเด็น";
  }
  // Build SVG dot markers now that select exists
  // Universal Auto-Slot Cards 155-340 (gap >=16, opaque backing + clipPath)
  var cardGroup=svg(illustration,"g",{class:"niti-law-markers"});
  // mark will be filled after select is defined; placeholder, real cards built below via renderUniversalCards after select exists
  // We build cards now with a forward-ref select wrapper
  var selectRef={fn:null};
  mark=renderUniversalCards(cardGroup,model,function(idx,focus){ if(selectRef.fn) selectRef.fn(idx,focus); },0);
  selectRef.fn=select;
  // Build HTML lists + conditions grid
  model.parts.forEach(function(part,i){
    var button=node("button","niti-ill-pick",(i+1)+". "+part.label);
    button.type="button";button.setAttribute("aria-pressed","false");
    button.addEventListener("click",function(){select(i,true);});
    list.appendChild(button);buttons.push(button);
    var li=document.createElement("li");
    li.className="niti-ill-element-item";
    var eb=document.createElement("button");
    eb.type="button"; eb.className="niti-ill-element-btn"; eb.setAttribute("aria-pressed","false"); eb.setAttribute("title",String(part.label));
    var ebHead=node("span","niti-ill-element-head");
    ebHead.appendChild(node("span","niti-ill-element-num",String(i+1)));
    ebHead.appendChild(node("span","niti-ill-element-label",String(part.label)));
    var tb2=node("span","niti-ill-type-badge",TYPE_STYLES[inferPartType(part)].label);
    tb2.setAttribute("data-type",inferPartType(part));
    ebHead.appendChild(tb2);
    eb.appendChild(ebHead);
    eb.appendChild(node("span","niti-ill-element-expl",String(part.explanation||"")));
    eb.addEventListener("click",function(){select(i,true);});
    li.appendChild(eb); elemList.appendChild(li); elemButtons.push(eb);
    // Conditions grid card (HTML, full label flows, no SVG overlap)
    var card=document.createElement("button");
    card.type="button"; card.className="niti-condition-card"; card.setAttribute("role","listitem"); card.setAttribute("aria-pressed","false");
    var cardHead=node("span","niti-condition-head");
    cardHead.appendChild(node("span","niti-condition-num",String(i+1)));
    cardHead.appendChild(node("span","niti-condition-verb",svgVerbForPart(part,i)));
    var tb3=node("span","niti-ill-type-badge",TYPE_STYLES[inferPartType(part)].label);
    tb3.setAttribute("data-type",inferPartType(part));
    cardHead.appendChild(tb3);
    card.appendChild(cardHead);
    card.appendChild(node("span","niti-condition-label",String(part.label)));
    card.addEventListener("click",function(){select(i,true);});
    gridList.appendChild(card); condCards.push(card);
  });
  // ---------- Share image ----------
  var shareBar=node("div","niti-ill-sharebar");
  var shareTitle=node("span","niti-ill-share-title","แชร์ภาพมาตรานี้");
  var btnShare=node("button","niti-ill-share-btn","แชร์รูป / ดาวน์โหลด PNG");
  btnShare.type="button";
  var btnCopyLink=node("button","niti-ill-share-btn","คัดลอกลิงก์มาตรานี้");
  btnCopyLink.type="button";
  var shareStatus=node("span","niti-ill-share-status","");
  shareStatus.setAttribute("aria-live","polite");
  shareBar.appendChild(shareTitle); shareBar.appendChild(btnShare); shareBar.appendChild(btnCopyLink); shareBar.appendChild(shareStatus);
  // Insert shareBar after image (SVG container)
  if(image.nextSibling) host.insertBefore(shareBar, image.nextSibling); else host.appendChild(shareBar);
  function sectionLink(){
    try{
      var origin=window.location.origin||"";
      var path=window.location.pathname||"";
      return origin+path+"#statute-"+String(model.id||"");
    }catch(e){ return "#statute-"+String(model.id||""); }
  }
  function setShareStatus(msg){ try{ shareStatus.textContent=msg||""; }catch(e){} }
  function exportPng(){
    try{
      var svgEl=image.querySelector("svg.niti-law-svg");
      if(!svgEl){ setShareStatus("ไม่สามารถสร้างรูปได้"); return; }
      var clone=svgEl.cloneNode(true);
      clone.setAttribute("xmlns","http://www.w3.org/2000/svg");
      clone.setAttribute("width","880"); clone.setAttribute("height","380");
      // Ensure title + disclaimer present in clone (already in SVG header/footer)
      var xml=new XMLSerializer().serializeToString(clone);
      var blob=new Blob([xml],{type:"image/svg+xml;charset=utf-8"});
      var url=URL.createObjectURL(blob);
      var img=new Image();
      img.onload=function(){
        try{
          var canvas=document.createElement("canvas");
          canvas.width=1760; canvas.height=760;
          var ctx=canvas.getContext("2d");
          ctx.fillStyle="#FFFFFF"; ctx.fillRect(0,0,1760,760);
          ctx.drawImage(img,0,0,1760,760);
          URL.revokeObjectURL(url);
          var fileName="NITI-มาตรา-"+String(model.id||"")+".png";
          if(canvas.toBlob){
            canvas.toBlob(function(b){
              if(!b){ setShareStatus("ไม่สามารถสร้าง PNG ได้"); return; }
              try{
                var file=new File([b], fileName, {type:"image/png"});
                if(window.navigator && window.navigator.share && window.navigator.canShare && window.navigator.canShare({files:[file]})){
                  window.navigator.share({files:[file], title:"NITI มาตรา "+String(model.id||""), text:"ภาพอธิบายมาตรา "+String(model.id||"")+" — "+FOOTER_DISCLAIMER}).then(function(){ setShareStatus("แชร์รูปแล้ว"); }).catch(function(err){ if(err && err.name==="AbortError"){ /* silent */ } else { // fallback download
                    var a=document.createElement("a"); var u=URL.createObjectURL(b); a.href=u; a.download=fileName; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(u); }, 1000); setShareStatus("ดาวน์โหลด PNG แล้ว"); } });
                } else {
                  var a2=document.createElement("a"); var u2=URL.createObjectURL(b); a2.href=u2; a2.download=fileName; document.body.appendChild(a2); a2.click(); a2.remove(); setTimeout(function(){ URL.revokeObjectURL(u2); }, 1000); setShareStatus("ดาวน์โหลด PNG แล้ว");
                }
              }catch(e){ setShareStatus("แชร์ไม่สำเร็จ ลองดาวน์โหลดแทน"); }
            },"image/png");
          } else { setShareStatus("เบราว์เซอร์นี้ไม่รองรับการส่งออก PNG"); }
        }catch(e){ setShareStatus("สร้างรูปไม่สำเร็จ"); }
      };
      img.onerror=function(){ try{ URL.revokeObjectURL(url); }catch(e){} setShareStatus("โหลดภาพสำหรับแชร์ไม่สำเร็จ"); };
      img.src=url;
    }catch(e){ setShareStatus("แชร์รูปไม่สำเร็จ"); }
  }
  btnShare.addEventListener("click", exportPng);
  btnCopyLink.addEventListener("click", function(){
    var link=sectionLink();
    function fallback(){
      try{
        var ta=document.createElement("textarea"); ta.value=link; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select();
        var ok=false; try{ ok=document.execCommand("copy"); }catch(e){ ok=false; } ta.remove();
        setShareStatus(ok?("คัดลอกลิงก์แล้ว: "+link):("ลิงก์มาตรานี้: "+link));
      }catch(e){ setShareStatus("ลิงก์มาตรานี้: "+link); }
    }
    if(window.navigator && window.navigator.clipboard && window.navigator.clipboard.writeText){
      window.navigator.clipboard.writeText(link).then(function(){ setShareStatus("คัดลอกลิงก์แล้ว"); }).catch(function(){ fallback(); });
    } else { fallback(); }
  });
  // ---------- Mini-quiz ก / ข (SAFE: correct = principle/rule verbatim, distractor = generic, never invented rule) ----------
  var quizWrap=node("div","niti-ill-quiz");
  quizWrap.appendChild(node("h3","niti-ill-quiz-title","ลองตอบ: สถานการณ์มาตรา "+String(model.id||"")));
  var quizQ=node("p","niti-ill-quiz-q","สถานการณ์: "+String(model.case||""));
  quizWrap.appendChild(quizQ);
  quizWrap.appendChild(node("p","niti-ill-quiz-instr","เลือกคำตอบที่ตรงกับหลักของมาตรานี้ที่สุด (ข้อ ก / ข้อ ข)"));
  var quizOpts=node("div","niti-ill-quiz-opts");
  quizWrap.appendChild(quizOpts);
  var quizFeedback=node("div","niti-ill-quiz-feedback","");
  quizFeedback.setAttribute("aria-live","polite");
  quizWrap.appendChild(quizFeedback);
  // Insert quiz after shareBar
  if(shareBar.nextSibling) host.insertBefore(quizWrap, shareBar.nextSibling); else host.appendChild(quizWrap);
  var correctText=String(model.rule||model.principle||"").trim();
  var distractorText="ไม่ต้องพิจารณาเงื่อนไขอื่นเลย";
  var numericPart=parseInt(String(model.id||""),10);
  if(isNaN(numericPart)) numericPart=0;
  var correctIsA=(numericPart%2===0);
  var quizOptions=[];
  if(correctIsA){ quizOptions=[{key:"ก", text:correctText, isCorrect:true},{key:"ข", text:distractorText, isCorrect:false}]; }
  else { quizOptions=[{key:"ก", text:distractorText, isCorrect:false},{key:"ข", text:correctText, isCorrect:true}]; }
  var quizButtons=[];
  quizOptions.forEach(function(opt){
    var b=node("button","niti-ill-quiz-btn","ข้อ "+opt.key+" — "+truncateDisplay(opt.text,180));
    b.type="button"; b.setAttribute("data-quiz-key",opt.key); b.setAttribute("aria-pressed","false");
    b.addEventListener("click", function(){ answerQuiz(opt.key); });
    quizOpts.appendChild(b); quizButtons.push(b);
  });
  function renderQuizFeedback(choiceKey, isCorrect){
    quizFeedback.replaceChildren();
    var correctKey=correctIsA?"ก":"ข";
    var head=node("p","niti-ill-quiz-result", isCorrect?("ตอบถูกต้อง! (ข้อ "+choiceKey+")") : ("ยังไม่ตรงตามหลักมาตรา "+String(model.id||"")+" (คำตอบที่ถูกคือ ข้อ "+correctKey+")"));
    quizFeedback.appendChild(head);
    var expl=node("p","niti-ill-quiz-expl","");
    var fullCorrect=correctText;
    expl.textContent="เฉลย: "+fullCorrect;
    quizFeedback.appendChild(expl);
    if(model.exception){
      var exc=node("p","niti-ill-quiz-exc","ข้อควรระวัง: "+String(model.exception));
      quizFeedback.appendChild(exc);
    }
    quizFeedback.appendChild(node("p","niti-ill-quiz-disc",FOOTER_DISCLAIMER));
    quizButtons.forEach(function(btn){
      var k=btn.getAttribute("data-quiz-key");
      var isCorr=(k===correctKey);
      btn.classList.toggle("is-correct", isCorr);
      btn.classList.toggle("is-picked", k===choiceKey);
      btn.classList.toggle("is-wrong-picked", k===choiceKey && !isCorrect);
      btn.setAttribute("aria-pressed", String(k===choiceKey));
    });
  }
  function answerQuiz(choiceKey){
    var isCorrect=(choiceKey===(correctIsA?"ก":"ข"));
    try{ setQuizStatus(model.id, choiceKey, isCorrect); }catch(e){}
    renderQuizFeedback(choiceKey, isCorrect);
  }
  // Restore on reload
  try{
    var saved=getQuizStatus(model.id);
    if(saved && saved.choice){ renderQuizFeedback(saved.choice, saved.isCorrect); }
  }catch(e){}

  function onKeys(ev){
    if(!ev||!ev.key) return;
    if(ev.key==="ArrowRight"||ev.key==="ArrowDown"){ ev.preventDefault(); select((current+1)%model.parts.length,true); }
    else if(ev.key==="ArrowLeft"||ev.key==="ArrowUp"){ ev.preventDefault(); select((current-1+model.parts.length)%model.parts.length,true); }
  }
  host.addEventListener("keydown",onKeys);
  select(0,false);
  return {dispose:function(){
    try{ if(typeof window!=="undefined"&&window.removeEventListener) window.removeEventListener("niti:statute-read-change",onReadChange); }catch(e){}
    try{ host.removeEventListener("keydown",onKeys); }catch(e){}
    image.replaceChildren();
    host.querySelectorAll(".niti-ill-readbar,.niti-ill-meaning,.niti-ill-elements,.niti-conditions-grid,.niti-ill-sharebar,.niti-ill-quiz").forEach(function(el){el.remove();});
  }};
}
function computePointSlots(model){
  // Back-compat: now returns HTML-grid-like slots (not used for SVG strip, kept for API)
  var n=model.parts?model.parts.length:0;
  var out=[];
  for(var i=0;i<n;i++) out.push({x:440,y:330,w:200,h:40});
  return out;
}
function pointSlots(model){return computePointSlots(model);}
window.NITI_STATUTE_ILLUSTRATION={mount:mount,draw:backdrop,computePointSlots:computePointSlots,pointSlots:computePointSlots,computeUniversalSlots:computeUniversalSlots,inferPartType:inferPartType,wrapThaiSvgLines:wrapThaiSvgLines,measureThaiTextWidth:measureThaiTextWidth,getReadStatus:getReadStatus,setReadStatus:setReadStatus,isRead:isRead,READ_KEY:READ_KEY,getQuizStatus:getQuizStatus,setQuizStatus:setQuizStatus,QUIZ_KEY:QUIZ_KEY};
})();
