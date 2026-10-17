/* NITI · statute references → shared in-site reader.
 * Converts references such as "มาตรา 1336", "มาตรา 453 และ 456",
 * "มาตรา 680, 681/1, 686, 688–690", and "ม. 1336" to popup links.
 * Also handles section numbers separated from "มาตรา" by inline markup
 * and late-rendered exam/answer content. Never duplicates legal notes.
 */
(function(){
"use strict";
var HEAD=/(?:มาตรา|ม\.)[\s\u00a0]*(\d{1,4}(?:\/\d{1,3})?)/g;
var TAIL=/^(\s*(?:,|;|และ|หรือ|กับ|ถึง|–|—|-)\s*)(\d{1,4}(?:\/\d{1,3})?)/;
var SPLIT_NUMBER=/^(\s*)(\d{1,4}(?:\/\d{1,3})?)/;
var SPLIT_PREFIX=/(?:มาตรา|ม\.)[\s\u00a0]*$/;
var SKIP="a,button,textarea,input,select,option,script,style,code,pre,summary,svg,math,[contenteditable],[data-statute],.niti-statute-dialog";
function statuteLink(id,label){
 var a=document.createElement("a");
 a.href="#statute-"+id.replace(/\//g,"-");
 a.dataset.statute=id;
 a.className="niti-inline-statute";
 a.textContent=label;
 a.setAttribute("aria-label","อ่านคำอธิบายประมวลกฎหมายแพ่งและพาณิชย์ มาตรา "+id+" ในหน้าต่าง");
 a.setAttribute("aria-haspopup","dialog");
 a.title="คลิกอ่านคำอธิบายมาตรา "+id;
 return a;
}
function eligible(node){
 var parent=node&&node.parentElement;
 return !!(parent && !parent.closest(SKIP) && parent.closest("main"));
}
function appendTail(frag,txt,cursor){
 while(cursor<txt.length){
  var next=txt.slice(cursor).match(TAIL);
  if(!next)break;
  frag.appendChild(document.createTextNode(next[1]));
  frag.appendChild(statuteLink(next[2],next[2]));
  cursor+=next[0].length;
 }
 return cursor;
}
function linkText(node){
 if(!node||node.nodeType!==3||!eligible(node))return false;
 var txt=node.nodeValue||"";
 if(!txt.includes("มาตรา")&&!txt.includes("ม."))return false;
 var m,cursor=0,changed=false,frag=document.createDocumentFragment();
 HEAD.lastIndex=0;
 while((m=HEAD.exec(txt))){
  var id=m[1],start=m.index,end=HEAD.lastIndex;
  if(start<cursor)continue;
  if(start>cursor)frag.appendChild(document.createTextNode(txt.slice(cursor,start)));
  frag.appendChild(statuteLink(id,m[0]));
  changed=true;
  cursor=appendTail(frag,txt,end);
  HEAD.lastIndex=cursor;
 }
 if(!changed)return false;
 if(cursor<txt.length)frag.appendChild(document.createTextNode(txt.slice(cursor)));
 node.parentNode.replaceChild(frag,node);
 return true;
}
/* "มาตรา <strong>1336</strong>" still opens the same reader.
 * Continuations separated by inline elements also remain clickable.
 * Stop at block boundaries to avoid linking unrelated numerals. */
function precedingContext(node){
 var current=node;
 for(var hops=0;current&&current.parentNode&&hops<6;hops++){
  var prev=current.previousSibling;
  while(prev&&prev.nodeType===8)prev=prev.previousSibling;
  if(prev){
   if(prev.nodeType===1&&prev.matches&&prev.matches("a[data-statute]"))return "continuation";
   var value=prev.textContent||"";
   if(SPLIT_PREFIX.test(value))return "number";
   return "";
  }
  current=current.parentNode;
  if(!current||current.nodeType!==1||current.matches("main,p,div,li,section,article,h1,h2,h3,h4,h5,h6,td,th"))break;
 }
 return "";
}
function linkSplitReference(node){
 if(!node||node.nodeType!==3||!eligible(node))return;
 var txt=node.nodeValue||"";
 if(!/^\s*(?:\d|[,;–—-]|และ|หรือ|กับ|ถึง)/.test(txt))return;
 var context=precedingContext(node);
 if(!context)return;
 var m=context==="number"?txt.match(SPLIT_NUMBER):txt.match(TAIL);
 if(!m)return;
 var frag=document.createDocumentFragment();
 if(m[1])frag.appendChild(document.createTextNode(m[1]));
 frag.appendChild(statuteLink(m[2],m[2]));
 var cursor=appendTail(frag,txt,m[0].length);
 if(cursor<txt.length)frag.appendChild(document.createTextNode(txt.slice(cursor)));
 node.parentNode.replaceChild(frag,node);
}
function scan(node){
 if(!node)return;
 if(node.nodeType===3){if(!linkText(node))linkSplitReference(node);return;}
 if(node.nodeType!==1||node.matches(SKIP)||node.closest(".niti-statute-dialog"))return;
 var walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
 var nodes=[],next;
 while((next=walker.nextNode()))nodes.push(next);
 nodes.forEach(function(n){if(!linkText(n))linkSplitReference(n);});
}
function init(){
 var main=document.querySelector("main");
 if(!main)return;
 scan(main);
 if(typeof MutationObserver!=="function")return;
 var observer=new MutationObserver(function(records){
  var changed=new Set();
  records.forEach(function(record){
   if(record.type==="characterData"){changed.add(record.target);return;}
   record.addedNodes.forEach(function(n){changed.add(n);});
  });
  changed.forEach(function(n){scan(n);});
 });
 observer.observe(main,{subtree:true,childList:true,characterData:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
else init();
})();