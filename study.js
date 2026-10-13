/* NITI Study Guide: derived counts (not predictions), 7-day checklists and 15 source-linked tactics */
(function(){
  "use strict";
  var data=Array.isArray(window.NITI_EXAMS)?window.NITI_EXAMS.filter(function(q){return q&&q.id&&q.sourceUrl&&/^https:\/\/mjsheetramfree\.com\//.test(q.sourceUrl)}):[];
  var guide=window.NITI_STUDY_GUIDE||{};
  var topics=Array.isArray(guide.topics)?guide.topics:[];
  var daily=Array.isArray(guide.daily)?guide.daily:[];
  var tips=guide.examTips||{};
  var $=function(id){return document.getElementById(id);};
  var escapeHTML=function(t){return String(t==null?"":t).replace(/[&<>"']/g,function(x){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x];});};
  var count=function(arr,key){var out={};arr.forEach(function(item){var values=key(item);(Array.isArray(values)?new Set(values):[values]).forEach(function(v){out[v]=(out[v]||0)+1;});});return out;};
  var topicCounts=count(data,function(q){return q.topic;});
  var sectionCounts=count(data,function(q){return q.sections;});
  var examLink=function(q){return "./quiz.html?exam="+encodeURIComponent(q.id)};
  function renderFrequency(){
    $("total-exams").textContent=data.length;
    $("total-topics").textContent=Object.keys(topicCounts).length;
    $("count-note").textContent=data.length;
    var entries=Object.entries(topicCounts).sort(function(a,b){return b[1]-a[1]||a[0].localeCompare(b[0],"th");});
    var max=Math.max(1,...entries.map(function(x){return x[1];}));
    var root=$("topic-frequency");root.replaceChildren();
    entries.forEach(function(e){
      var row=document.createElement("div");row.className="count-row";row.setAttribute("role","listitem");
      row.innerHTML='<span class="count-name">'+escapeHTML(e[0])+'</span><div class="meter" role="img" aria-label="'+escapeHTML(e[0])+": "+e[1]+' ข้อ"><i style="--bar-width:'+(e[1]/max*100).toFixed(1)+'%"></i></div><b>'+e[1]+'</b>';
      root.appendChild(row);
    });
    var statutes=Object.entries(sectionCounts).sort(function(a,b){return b[1]-a[1]||a[0].localeCompare(b[0],"th");}).slice(0,10);
    var cells=$("article-frequency");cells.replaceChildren();
    statutes.forEach(function(e){
      var sourceMap=window.NITI_STATUTE_SOURCES;
      var source=sourceMap&&typeof sourceMap.resolveLabel==="function"?sourceMap.resolveLabel(e[0]):null;
      var span=document.createElement(source?"a":"span");span.className="article-chip";
      if(source){
        var id=sourceMap.normalizeId(e[0]);
        span.href="#statute-"+id.replace(/\//g,"-");
        span.setAttribute("data-statute",id);
        span.title="อ่านมาตรา "+e[0]+" ในหน้าต่างภายในเว็บไซต์";
      }
      var isKnown=/^(\d+)/.exec(e[0]);var article= isKnown?isKnown[1]:e[0];
      span.innerHTML='<b>ม. '+escapeHTML(e[0])+'</b><span>'+e[1]+' ข้อ</span>';
      if(!source)span.title="พบการอ้างอิงในชุดข้อสอบจำนวน "+e[1]+" ข้อ";
      cells.appendChild(span);
    });
  }
  function renderTopics(){
    var root=$("topic-cards");root.replaceChildren();
    var sorted=topics.slice().sort(function(a,b){return (topicCounts[b.name]||0)-(topicCounts[a.name]||0)});
    sorted.forEach(function(topic){
      var matching=data.filter(function(q){return q.topic===topic.name});
      if(!matching.length)return;
      var first=matching[0];
      var box=document.createElement("article");box.className="topic-card accent-"+topic.accent;
      box.innerHTML='<div class="topic-heading"><h3>'+escapeHTML(topic.name)+'</h3><span class="topic-count">'+matching.length+' ข้อ</span></div>'+
        '<p class="topic-sub">'+escapeHTML(topic.headline)+'</p>'+
        '<dl><div><dt>โจทย์ที่พบในคลัง</dt><dd>'+escapeHTML(topic.pattern)+'</dd></div>'+
        '<div><dt>มาตราที่ควรอ่าน:</dt><dd class="statute-topic-links">'+topic.sections.map(function(sec){
          var mapping=window.NITI_STATUTE_SOURCES;
          var id=mapping&&typeof mapping.normalizeId==="function"?mapping.normalizeId(sec):String(sec).trim();
          return '<a class="statute-topic-link" href="#statute-'+escapeHTML(id.replace(/\//g,"-"))+'" data-statute="'+escapeHTML(id)+'" title="กดอ่านมาตรา '+escapeHTML(sec)+' ภายในเว็บไซต์">ม. '+escapeHTML(sec)+' ↗</a>';
        }).join(" ")+
        '</dd><dd class="statute-topic-hint">แตะเลขมาตราเพื่ออ่านสรุปและตัวบทในหน้าต่างลอย โดยไม่ออกจากเว็บไซต์</dd><dd>'+escapeHTML(topic.focus)+'</dd></div></dl>'+
        '<div class="trick-box"><strong>จำสั้น ๆ:</strong> '+escapeHTML(topic.trick)+'</div>'+
        '<p><strong>ข้อควรระวัง:</strong> '+escapeHTML(topic.trap)+'</p>'+
        '<a class="start-link" href="'+examLink(first)+'">เริ่มฝึกข้อแรกของหมวดนี้ ↗</a>';
      root.appendChild(box);
    });
  }
  function renderMethod(){
    var root=$("writing-method");root.replaceChildren();
    (guide.method||[]).forEach(function(step,i){
      var card=document.createElement("article");card.className="timeline-card";
      card.innerHTML='<div class="minute">'+Number(step.minutes)+' นาที</div><h3>'+(i+1)+'. '+escapeHTML(step.title)+'</h3><p>'+escapeHTML(step.detail)+'</p>';
      root.appendChild(card);
    });
  }
  var PLAN_KEY="niti-study-plan-v1";
  var saved={};try{saved=JSON.parse(localStorage.getItem(PLAN_KEY)||"{}")||{};}catch(e){saved={};}
  function save(){try{localStorage.setItem(PLAN_KEY,JSON.stringify(saved));}catch(e){}}
  function progress(){
    var completed=daily.filter(function(_,i){return saved[String(i+1)]===true}).length;
    $("plan-progress").textContent="ทำแล้ว "+completed+"/"+daily.length+" วัน";
  }
  function renderDays(){
    var root=$("day-grid");root.replaceChildren();
    daily.forEach(function(day,i){
      var n=String(i+1);
      var card=document.createElement("article");card.className="day-card"+(saved[n]===true?" done":"");
      var check=document.createElement("input");check.type="checkbox";check.className="day-check";check.checked=saved[n]===true;
      check.id="day-"+n;check.setAttribute("aria-label","อ่านครบวันที่ "+n);
      var body=document.createElement("div");
      var relevant=data.find(function(q){return day.topics.includes(q.topic)});
      var link=relevant?'<p><a href="'+examLink(relevant)+'">เปิดข้อสอบที่เกี่ยวข้อง ↗</a></p>':"";
      body.innerHTML='<span class="day-meta">วันที่ '+n+' / 7 · มาตรา '+escapeHTML(day.articles.join(", "))+'</span><h3>'+escapeHTML(day.title)+'</h3><p>'+escapeHTML(day.task)+'</p>'+link;
      card.appendChild(check);card.appendChild(body);root.appendChild(card);
      check.addEventListener("change",function(){saved[n]=check.checked;card.classList.toggle("done",check.checked);save();progress();});
    });
    progress();
  }
  var enriched=data.filter(function(q){return tips[q.id]});
  function renderTricks(term){
    term=(term||"").trim().toLocaleLowerCase("th");
    var list=$("trick-list");list.replaceChildren();
    var subset=enriched.filter(function(q){
      var t=tips[q.id];
      return !term||[q.title,q.topic,q.id,q.sections.join(" "),t.hook,t.first,t.test,t.memory].join(" ").toLocaleLowerCase("th").includes(term);
    });
    $("trick-count").textContent="พบ "+subset.length+" จาก "+enriched.length+" ข้อ";
    if(!subset.length){var p=document.createElement("p");p.textContent="ไม่พบข้อสอบที่ตรงกับคำค้น";list.appendChild(p);}
    subset.forEach(function(q){
      var t=tips[q.id];
      var details=document.createElement("details");details.className="trick-row";
      var sourceURL=q.sourceUrl;
      details.innerHTML='<summary><span>'+escapeHTML(q.title)+'<span class="trick-meta">'+escapeHTML(q.topic)+' · ภาค '+escapeHTML(q.semester)+'/'+escapeHTML(q.year)+' ข้อ '+escapeHTML(q.number)+'</span></span></summary>'+
       '<div class="trick-body"><p><strong>คำถามชี้ขาด:</strong> '+escapeHTML(t.hook)+'</p>'+
       '<p><strong>เริ่มเขียนอย่างไร:</strong> '+escapeHTML(t.first)+'</p>'+
       '<p><strong>เช็กเงื่อนไข:</strong> '+escapeHTML(t.test)+'</p>'+
       '<div class="trick-memory"><strong>เทคนิคจำ:</strong> '+escapeHTML(t.memory)+'</div>'+
       '<div class="trick-actions"><a href="'+examLink(q)+'">ฝึกเขียนข้อนี้ ↗</a><a href="'+escapeHTML(sourceURL)+'" target="_blank" rel="noopener noreferrer">ดูข้อสอบและธงคำตอบต้นทาง ↗</a></div></div>';
      list.appendChild(details);
    });
  }
  if(!data.length){$("topic-frequency").textContent="ไม่สามารถโหลดข้อมูลข้อสอบได้ กรุณารีเฟรชหน้าเว็บ";return;}
  renderFrequency();renderTopics();renderMethod();renderDays();renderTricks("");
  $("trick-search").addEventListener("input",function(){renderTricks(this.value)});
}());