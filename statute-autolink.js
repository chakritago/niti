/* NITI inline statute and paragraph citations → existing dialog reader.
 * Examples: มาตรา 456 วรรคสอง, มาตรา 456 วรรคหนึ่ง–สอง,
 * มาตรา 453 และ 456 วรรคสอง, มาตรา 473(3), มาตรา 681/1 วรรคสอง.
 * Handles dynamically rendered lessons without copying legal summaries.
 */
(function(){
"use strict";
var ORD="(?:แรก|หนึ่ง|สอง|สาม|สี่|ห้า|หก|ท้าย|สุดท้าย|[1-6๑-๖])";
var PAR="วรรค\s*(?:ที่\s*)?"+ORD+"(?:\s*(?:–|—|-|ถึง|และ|,|\/)\s*(?:วรรค\s*(?:ที่\s*)?)?"+ORD+")*";
var PARA_SUFFIX=new RegExp("^(\s*("+PAR+"))");
var HEAD=new RegExp("(?:มาตรา|ม\\.)[\\s\\u00a0]*(\\d{1,4}(?:\\/\\d{1,3})?)(\\([1-9]\\))?([\\s\\u00a0]*"+PAR+")?","g");
var TAIL=new RegExp("^(\\s*(?:,|;|และ|หรือ|กับ|ถึง|–|—|-)\\s*)(\\d{1,4}(?:\\/\\d{1,3})?)(\\([1-9]\\))?([\\s\\u00a0]*"+PAR+")?");
var SPLIT_NUMBER=/^(\s*)(\d{1,4}(?:\/\d{1,3})?)/;
var SPLIT_PREFIX=/(?:มาตรา|ม\.)[\s\u00a0]*$/;
var SKIP="a,button,textarea,input,select,option,script,style,code,pre,summary,svg,math,[contenteditable],[data-statute],.niti-statute-dialog";
var THAI={"แรก":1,"หนึ่ง":1,"สอง":2,"สาม":3,"สี่":4,"ห้า":5,"หก":6};
var THAIDIGITS={"๑":"1","๒":"2","๓":"3","๔":"4","๕":"5","๖":"6"};
function paragraphIds(value,id){
 if(!value)return [];
 var normalized=String(value).replace(/[๑-๖]/g,function(c){return THAIDIGITS[c];}).replace(/วรรค\s*(?:ที่\s*)?/g,"").trim();
 var words=normalized.split(/\s*(?:ถึง|และ|,|\/|–|—|-)\s*/).filter(Boolean);
 var db=window.NITI_STATUTE_PARAGRAPHS&&window.NITI_STATUTE_PARAGRAPHS.get(id);
 var n=db&&db.paragraphs?Object.keys(db.paragraphs).length:0;
 var nums=words.map(function(w){return THAI[w]||(/^[1-6]$/.test(w)?Number(w):((w==="ท้าย"||w==="สุดท้าย")&&n?n:0));}).filter(Boolean);
 if(nums.length===2&&/ถึง|–|—|-/.test(normalized)&&nums[0]<nums[1]){
  var expanded=[];for(var j=nums[0];j<=Math.min(nums[1],6);j++)expanded.push(j);return expanded;
 }
 return nums.filter(function(v,i){return nums.indexOf(v)===i;});
}
function linkStatute(id,label,item,paragraphText){
 var a=document.createElement("a");
 var paras=paragraphIds(paragraphText,id);
 var itemId=item?item.replace(/[()]/g,""):"";
 a.dataset.statute=id;
 if(paras.length)a.dataset.paragraphs=paras.join(",");
 if(itemId)a.dataset.statuteItem=itemId;
 a.href="#statute-"+id.replace(/\//g,"-")+(paras.length?"-p"+paras.join("_"):"")+(itemId?"-i"+itemId:"");
 a.className="niti-inline-statute";
 a.textContent=label;
 a.setAttribute("aria-label","อ่านคำอธิบายประมวลกฎหมายแพ่งและพาณิชย์ มาตรา "+id+(paragraphText||"")+(itemId?" ข้อ ("+itemId+")":"")+" ในหน้าต่าง");
 a.setAttribute("aria-haspopup","dialog");
 a.title="คลิกอ่านคำอธิบาย "+label;
 return a;
}
function eligible(node){
 var parent=node&&node.parentElement;
 return !!(parent&&!parent.closest(SKIP)&&parent.closest("main"));
}
function appendTail(frag,txt,cursor){
 while(cursor<txt.length){
  var next=txt.slice(cursor).match(TAIL);
  if(!next)break;
  frag.appendChild(document.createTextNode(next[1]));
  frag.appendChild(linkStatute(next[2],next[2]+(next[3]||"")+(next[4]||""),next[3],next[4]));
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
  frag.appendChild(linkStatute(id,m[0],m[2],m[3]));
  changed=true;
  cursor=appendTail(frag,txt,end);
  HEAD.lastIndex=cursor;
 }
 if(!changed)return false;
 if(cursor<txt.length)frag.appendChild(document.createTextNode(txt.slice(cursor)));
 node.parentNode.replaceChild(frag,node);
 return true;
}
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
 var frag=document.createDocumentFragment(),id=m[2],suffix=context==="number"?"":(m[3]||"")+(m[4]||"");
 if(m[1])frag.appendChild(document.createTextNode(m[1]));
 frag.appendChild(linkStatute(id,id+suffix,context==="number"?"":m[3],context==="number"?"":m[4]));
 var cursor=appendTail(frag,txt,m[0].length);
 if(cursor<txt.length)frag.appendChild(document.createTextNode(txt.slice(cursor)));
 node.parentNode.replaceChild(frag,node);
}
/* "มาตรา <strong>456</strong> วรรคสอง" is split across nodes.
 * Attach the following paragraph text to the same link target without
 * changing the surrounding HTML / meaning. */
function attachFollowingParagraph(anchor){
 if(!anchor||anchor.dataset.paragraphs||anchor.dataset.statuteItem)return;
 var candidate=anchor;
 while(candidate&&candidate.parentElement&&!candidate.nextSibling&&!candidate.parentElement.matches("main,p,div,li,section,article,h1,h2,h3,h4,h5,h6,td,th"))candidate=candidate.parentElement;
 var next=candidate&&candidate.nextSibling;
 if(!next||next.nodeType!==3)return;
 var txt=next.nodeValue||"",m=txt.match(PARA_SUFFIX);
 if(!m)return;
 var p=paragraphIds(m[2],anchor.dataset.statute);
 if(!p.length)return;
 anchor.dataset.paragraphs=p.join(",");
 anchor.href="#statute-"+anchor.dataset.statute.replace(/\//g,"-")+"-p"+p.join("_");
 anchor.setAttribute("aria-label","อ่านคำอธิบายมาตรา "+anchor.dataset.statute+" "+m[2]);
 var sibling=linkStatute(anchor.dataset.statute,m[2],"",m[2]);
 sibling.classList.add("niti-inline-paragraph");
 var frag=document.createDocumentFragment();
 if(m[1].startsWith(" "))frag.appendChild(document.createTextNode(m[1].match(/^\s*/)[0]));
 frag.appendChild(sibling);
 if(txt.length>m[1].length)frag.appendChild(document.createTextNode(txt.slice(m[1].length)));
 next.parentNode.replaceChild(frag,next);
}
function scan(node){
 if(!node)return;
 if(node.nodeType===3){if(!linkText(node))linkSplitReference(node);return;}
 if(node.nodeType!==1||node.matches(SKIP)||node.closest(".niti-statute-dialog"))return;
 var walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT),nodes=[],next;
 while((next=walker.nextNode()))nodes.push(next);
 nodes.forEach(function(n){if(!linkText(n))linkSplitReference(n);});
 var anchors=node.matches("a.niti-inline-statute")?[node]:Array.from(node.querySelectorAll("a.niti-inline-statute"));
 anchors.forEach(attachFollowingParagraph);
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
window.NITI_STATUTE_AUTOLINK={paragraphIds:paragraphIds,__build:"20261017c"};
})();