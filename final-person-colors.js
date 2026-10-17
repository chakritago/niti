/* NITI — consistent, readable person-name colours in final-exam examples.
 * A person always keeps the same hue throughout questions and analyses.
 * Rendered as textContent only; preserves statute links and keyword emphasis.
 */
(function(){
"use strict";
var palette={
 "แดง":"red", "ขาว":"yellow", "ดำ":"blue", "เขียว":"green",
 "ศักดิ์":"purple", "เดช":"teal",
 "เทพ":"violet", "กรุง":"teal", "ครบ":"orange", "บุรี":"pink",
 "กล้า":"orange", "เข้ม":"teal", "แก้ว":"purple",
 "ทอง":"gold", "เทียม":"indigo", "เอก":"pink", "สอด":"teal",
 "แก้ว":"purple","ขวด":"teal","ถ้วย":"orange","แห้ว":"violet","มัน":"teal",
 "เสือ":"red","ช้าง":"blue","กลม":"green","เบี้ยว":"orange","มั่น":"violet",
 "ป้อม":"pink","พลอย":"violet","เพชร":"gold","แรม":"pink","รุ่ง":"orange",
 "แสง":"gold","โสม":"teal","สด":"purple","สวย":"pink","สี":"violet",
 "ต้น":"green","ตั้ม":"blue","แสด":"orange","ศุกร์":"violet","พุธ":"teal",
 "อาทิตย์":"gold","จันทร์":"purple","ฟ้า":"blue","ฝน":"teal","นาค":"orange",
 "สาราญ":"green","สารวย":"violet","อิ่ม":"pink","สอน":"blue",
 "ท้วม":"orange","เท่ง":"gold","น้า":"blue","เปลว":"red","พลิง":"orange",
 "ดา":"blue","ขาว":"yellow","ดำ":"blue","เหลือง":"gold",
 "ก":"violet", "ข":"green", "ค":"orange", "ง":"purple"
};
var fullNames=Object.keys(palette).filter(function(n){return n.length>1;}).sort(function(a,b){return b.length-a.length;});
var pattern=new RegExp("(นางสาว|นาย|นาง)([ \\t\\u00a0]*?)("+fullNames.join("|")+")","g");
var initials=/(นางสาว|นาย|นาง)([ \t\u00a0]+)([กขคง])(?=[ \t\u00a0]*[.．]|[\s,;:()\u2014–-]|$)/g;
var ignore="a,button,script,style,textarea,input,select,option,code,pre,svg,math,[contenteditable],.niti-person,.niti-statute-dialog";
function findNames(value){
 var items=[],m;
 pattern.lastIndex=0;
 while((m=pattern.exec(value)))items.push({start:m.index,end:pattern.lastIndex,value:m[0],key:m[3]});
 initials.lastIndex=0;
 while((m=initials.exec(value))){
  var a=m.index,b=initials.lastIndex;
  if(!items.some(function(x){return a<x.end&&b>x.start;}))items.push({start:a,end:b,value:m[0],key:m[3]});
 }
 items.sort(function(a,b){return a.start-b.start||b.end-a.end});
 return items.filter(function(x,i){return i===0||x.start>=items[i-1].end;});
}
function colorText(node){
 if(!node||node.nodeType!==3||!node.parentNode||!node.parentElement)return false;
 if(node.parentElement.closest(ignore))return false;
 var value=node.nodeValue||"";
 if(!value.includes("นาย")&&!value.includes("นาง"))return false;
 var matches=findNames(value);
 if(!matches.length)return false;
 var doc=node.ownerDocument||document,frag=doc.createDocumentFragment(),at=0;
 matches.forEach(function(m){
  if(m.start<at)return;
  if(at<m.start)frag.appendChild(doc.createTextNode(value.slice(at,m.start)));
  var span=doc.createElement("span");
  span.className="niti-person niti-person--"+palette[m.key];
  span.setAttribute("data-niti-person",m.key);
  span.textContent=m.value;
  frag.appendChild(span);at=m.end;
 });
 if(at<value.length)frag.appendChild(doc.createTextNode(value.slice(at)));
 node.parentNode.replaceChild(frag,node);
 return true;
}
function scan(root){
 if(!root)return;
 if(root.nodeType===3){colorText(root);return;}
 if(root.nodeType!==1||root.matches(ignore)||root.closest(".niti-person,.niti-statute-dialog"))return;
 var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[],node;
 while((node=walker.nextNode()))nodes.push(node);
 nodes.forEach(colorText);
}
function init(){
 var main=document.querySelector("main");
 if(!main)return;
 scan(main);
 if(typeof MutationObserver==="undefined")return;
 var observer=new MutationObserver(function(records){
  records.forEach(function(r){
   if(r.type==="characterData")scan(r.target);
   else r.addedNodes.forEach(scan);
  });
 });
 observer.observe(main,{childList:true,characterData:true,subtree:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
else init();
window.NITI_PERSON_COLORS={findNames:findNames,scan:scan,palette:palette};
})();