/* High-scoring legal terms are styled as study aids, NOT official grading rubrics.
 * Safe DOM text rendering: no innerHTML or HTML interpretation of legal content. */
(function(){
"use strict";
var fallback=["ทำเป็นหนังสือและจดทะเบียน","หลักฐานเป็นหนังสือ","หนังสือบอกกล่าว","ครบองค์ประกอบ","จดทะเบียน","ขายทอดตลาด","กรรมสิทธิ์","ผู้ค้ำประกัน","มัดจำ","บุริมสิทธิ","ส่งมอบ","สิทธิเรียกร้อง","ผิดนัด","โมฆะ","ขาดอายุความ","หลักประกัน","สัญญาจะซื้อจะขาย","สัญญาจะซื้อจะขาย","บอกเลิกสัญญา"];
function termsFor(topic){
 var guides=window.NITI_SUBJECT_EXAM_GUIDES||[];
 var item=guides.find(function(g){return g.topic===topic||g.id===topic;});
 return (item&&item.keywords||[]).concat(fallback);
}
function apply(parent,value,terms){
 if(!parent)return;
 parent.replaceChildren();
 var s=String(value==null?"":value);
 var arr=[...new Set((terms||fallback).filter(Boolean))].sort(function(a,b){return b.length-a.length;});
 var pos=0;
 while(pos<s.length){
  var match=-1,term="";
  arr.forEach(function(t){
   var at=s.indexOf(t,pos);
   if(at>=0&&(match<0||at<match||(at===match&&t.length>term.length))){match=at;term=t;}
  });
  if(match<0){parent.appendChild(document.createTextNode(s.slice(pos)));break;}
  if(match>pos)parent.appendChild(document.createTextNode(s.slice(pos,match)));
  var mark=document.createElement("strong");
  mark.className="exam-score-keyword";
  mark.textContent=term;
  parent.appendChild(mark);
  pos=match+term.length;
 }
}
window.NITI_EXAM_KEYWORDS={apply:apply,termsFor:termsFor};
})();
