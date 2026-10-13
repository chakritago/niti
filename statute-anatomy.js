(function(){
'use strict';
var sequence=0;
function node(tag,cls,text){
 var result=document.createElement(tag);
 if(cls)result.className=cls;
 if(text)result.textContent=text;
 return result;
}
function paragraph(parent,title,text){
 var part=node('section','anatomy-explanation');
 part.appendChild(node('h4','',title));
 part.appendChild(node('p','',text));
 parent.appendChild(part);
}
function create(note){
 var scenario=(window.NITI_STATUTE_SCENARIOS||{})[note.id];
 if(!scenario)return document.createDocumentFragment();
 var disclosure=node('details','statute-visual');
 disclosure.appendChild(node('summary','','ดูภาพจำลองและตัวอย่าง · ม. '+note.id));
 var built=false;
 disclosure.addEventListener('toggle',function(){
  if(!disclosure.open||built)return;
  built=true;
  var parts=note.conditions.split(/\s+\/\s+/).filter(Boolean);
  var artwork=(window.NITI_STATUTE_ART||{})[parts.length];
  var card=node('figure','statute-anatomy iso');
  var header=node('div','anatomy-heading');
  header.appendChild(node('span','','ภาพจำ ม. '+note.id));
  header.appendChild(node('strong','',note.title));
  card.appendChild(header);
  var layout=node('div','anatomy-layout');
  var visual=node('div','anatomy-visual');
  if(artwork)visual.innerHTML=artwork;
  layout.appendChild(visual);
  var controls=node('div','anatomy-controls');
  controls.setAttribute('role','group');
  controls.setAttribute('aria-label','เลือกประเด็นมาตรา '+note.id);
  var readout=node('p','anatomy-readout');
  readout.id='anatomy-readout-'+(++sequence);
  readout.setAttribute('aria-live','polite');
  var buttons=[];
  function select(index){
   buttons.forEach(function(button,position){button.setAttribute('aria-pressed',String(position===index));});
   visual.querySelectorAll('[data-drawer]').forEach(function(drawer){
    var active=Number(drawer.dataset.drawer)===index;
    var shift=drawer.dataset.open.match(/translate\(([-\d.]+)[, ]+([-\d.]+)\)/);
    drawer.style.transform=active&&shift?'translate('+shift[1]+'px, '+shift[2]+'px)':'translate(0px, 0px)';
    drawer.setAttribute('data-active',String(active));
   });
   readout.textContent='ประเด็น '+(index+1)+' / '+parts.length+' — '+parts[index];
  }
  parts.forEach(function(part,index){
   var button=node('button','anatomy-step',(index+1)+'. '+part);
   button.type='button';
   button.setAttribute('aria-controls',readout.id);
   button.addEventListener('click',function(){select(index);});
   controls.appendChild(button);buttons.push(button);
  });
  controls.addEventListener('keydown',function(event){
   var index=buttons.indexOf(document.activeElement);
   if(index<0)return;
   var next=event.key==='ArrowDown'||event.key==='ArrowRight'?(index+1)%buttons.length:event.key==='ArrowUp'||event.key==='ArrowLeft'?(index+buttons.length-1)%buttons.length:event.key==='Home'?0:event.key==='End'?buttons.length-1:-1;
   if(next<0)return;
   event.preventDefault();buttons[next].focus();select(next);
  });
  layout.appendChild(controls);card.appendChild(layout);
  card.appendChild(readout);
  var caption=node('figcaption','','แตะประเด็นเพื่อเปิดแฟ้มที่เกี่ยวข้อง · ใช้ Tab หรือปุ่มลูกศรได้ แต่ละแฟ้มเป็นหัวข้อให้พิจารณา อาจเป็นเงื่อนไขร่วม ทางเลือก หรือข้อยกเว้นตามตัวบท การเปิดครบทุกแฟ้มไม่ได้แปลว่าได้สิทธิแล้ว');
  card.appendChild(caption);disclosure.appendChild(card);
  var explanation=node('div','anatomy-case');
  paragraph(explanation,'ลองนึกภาพเหตุการณ์',scenario[0]);
  paragraph(explanation,'เชื่อมกับหลักกฎหมาย',note.plain);
  paragraph(explanation,'เปลี่ยนข้อเท็จจริงแล้วคิดต่อ',scenario[1]);
  var answer=node('details','anatomy-answer');
  answer.appendChild(node('summary','','เปิดแนวคิดและจุดที่มักสับสน'));
  paragraph(answer,'ประเด็นที่ต้องระวัง',note.trap);
  paragraph(answer,'แนวหลักกฎหมายสำหรับปรับบท',note.exam);
  explanation.appendChild(answer);
  explanation.appendChild(node('p','anatomy-source-note','สถานการณ์สมมติเพื่อการเรียน เรียบเรียงประกอบสรุปเดิมในคลัง ไม่ใช่คำพิพากษาหรือผลตัดสินคดี อ่านตัวบทและข้อยกเว้นจากลิงก์แหล่งทางการประกอบ'));
  disclosure.appendChild(explanation);select(0);
 });
 return disclosure;
}
window.NITI_STATUTE_ANATOMY={create:create};
})();
