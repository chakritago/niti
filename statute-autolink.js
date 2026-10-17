/* NITI · statute citations → existing in-site statute reader.
 * Auto-links genuine "มาตรา 1336" mentions, including grouped citations such
 * as "มาตรา 680, 681/1, 686, 688–690". Updates with dynamic exam cards.
 * This module does not invent legal explanations: the reader uses the
 * existing NITI_STATUTE_NOTES and government document references.
 */
(function(){
"use strict";
var HEAD=/มาตรา[\s\u00a0]*(\d{1,4}(?:\/\d{1,3})?)/g;
var TAIL=/^(\s*(?:,|และ|หรือ|กับ|ถึง|–|—|-)\s*)(\d{1,4}(?:\/\d{1,3})?)/;
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
function linkText(node){
 if(!node||node.nodeType!==3||!node.parentNode)return;
 var txt=node.nodeValue||"";
 if(!txt.includes("มาตรา"))return;
 var parent=node.parentElement;
 if(!parent||parent.closest(SKIP)||!parent.closest("main"))return;
 var m, cursor=0, changed=false, frag=document.createDocumentFragment();
 HEAD.lastIndex=0;
 while((m=HEAD.exec(txt))){
  var id=m[1],start=m.index,end=HEAD.lastIndex;
  if(start<cursor)continue;
  if(start>cursor)frag.appendChild(document.createTextNode(txt.slice(cursor,start)));
  frag.appendChild(statuteLink(id,m[0]));
  changed=true;
  cursor=end;
  while(cursor<txt.length){
   var next=txt.slice(cursor).match(TAIL);
   if(!next)break;
   frag.appendChild(document.createTextNode(next[1]));
   frag.appendChild(statuteLink(next[2],next[2]));
   cursor+=next[0].length;
  }
  HEAD.lastIndex=cursor;
 }
 if(!changed)return;
 if(cursor<txt.length)frag.appendChild(document.createTextNode(txt.slice(cursor)));
 node.parentNode.replaceChild(frag,node);
}
function scan(node){
 if(!node)return;
 if(node.nodeType===3){linkText(node);return;}
 if(node.nodeType!==1||node.matches(SKIP)||node.closest(".niti-statute-dialog"))return;
 var walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
 var nodes=[],next;
 while((next=walker.nextNode()))nodes.push(next);
 nodes.forEach(linkText);
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