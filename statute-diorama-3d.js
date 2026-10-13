/* NITI Three.js statute-specific legal dioramas — never renders a tree.
 * Scene subjects differ by article: land, servitudes, registry, trade, credit,
 * guarantee, rental, mortgage, pledge and time/possession.
 * Selection via Raycaster AND accessible HTML buttons.
 */
import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

const C={grass:0x6eab81,earth:0x855f43,ground:0x213951,wood:0x966446,
  paper:0xfaf1dc,ink:0x37566e,blue:0x66c4eb,water:0x2986bc,
  gold:0xe9b856,roof:0xeb8571,cream:0xece2ca,road:0x586678,
  green:0x42b8a4,red:0xe97776,steel:0xacc3cb,skin:0xe9b58e};
const mat=(color,roughness=.75)=>new THREE.MeshStandardMaterial({color,roughness,metalness:.05});
const block=(g,w,h,d,color)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));g.add(mesh);return mesh;};
const sphere=(g,r,color)=>{const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat(color));g.add(mesh);return mesh;};
const cylinder=(g,r,h,color,segments=24)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),mat(color));g.add(mesh);return mesh;};
function addHouse(g,scale=1){
 const group=new THREE.Group();g.add(group);
 const base=block(group,.9,.78,.74,C.cream);base.position.y=.4;
 const roof=new THREE.Mesh(new THREE.ConeGeometry(.72,.53,4),mat(C.roof));roof.rotation.y=Math.PI/4;roof.position.y=1.05;group.add(roof);
 const door=block(group,.2,.42,.045,C.wood);door.position.set(.13,.21,.4);
 const window=block(group,.21,.2,.048,C.blue);window.position.set(-.23,.58,.4);
 group.scale.setScalar(scale);return group;
}
function addPerson(g){
 const avatar=new THREE.Group();g.add(avatar);
 const body=cylinder(avatar,.22,.5,0x446aa2);body.position.y=.45;
 const head=sphere(avatar,.22,C.skin);head.position.y=.91;
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.22,14,10,0,Math.PI*2,0,Math.PI*.55),mat(C.ink));
 hair.position.y=.94;avatar.add(hair);
 return avatar;
}
function addPaper(g){
 const holder=new THREE.Group();g.add(holder);
 const page=block(holder,.75,.06,.95,C.paper);page.position.y=.18;page.rotation.y=-.16;
 for(let i=0;i<4;i++){
  const line=block(holder,.52,.007,.024,C.ink);line.position.set(-.05,.225,.14+i*.13);line.rotation.y=-.16;
 }
 return holder;
}
function addClock(g){
 const face=cylinder(g,.42,.11,C.paper,32);face.rotation.x=Math.PI/2;face.position.y=.55;
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.43,.045,9,40),mat(C.gold));rim.position.y=.55;g.add(rim);
 const hand=block(g,.032,.27,.035,C.ink);hand.position.set(0,.66,.12);hand.rotation.z=.65;
 return face;
}
function addCoins(g){
 for(let i=0;i<3;i++){
  const coin=cylinder(g,.24,.12,C.gold,22);coin.position.set(i*.19-.2,.17+(i%2)*.11,.02+i*.07);
 }
}
function addPlot(g){
 const plot=block(g,1.22,.12,.9,C.grass);plot.position.y=.07;
 const soil=block(g,1.24,.1,.93,C.earth);soil.position.y=-.04;
 return plot;
}
function addRoad(g){
 const road=block(g,1.45,.08,.34,C.road);road.position.y=.09;road.rotation.y=-.25;
 const dash=block(g,.9,.012,.033,C.paper);dash.position.set(0,.14,0);dash.rotation.y=-.25;
}
function addRegistry(g){
 const desk=block(g,1.12,.5,.54,C.wood);desk.position.y=.3;
 const sign=block(g,1.1,.35,.1,C.blue);sign.position.set(0,.95,-.22);
 const stamp=cylinder(g,.15,.23,C.red);stamp.position.set(.28,.65,.04);
}
function addBank(g){
 const hall=block(g,1.16,.65,.76,C.cream);hall.position.y=.37;
 for(let i=0;i<3;i++){const pillar=cylinder(g,.10,.72,C.steel);pillar.position.set(-.38+i*.38,.56,.45);}
 const top=block(g,1.45,.15,.92,C.blue);top.position.y=.82;
}
function addWatch(g){
 const caseRing=new THREE.Mesh(new THREE.TorusGeometry(.23,.07,10,28),mat(C.gold));caseRing.position.y=.48;g.add(caseRing);
 const dial=cylinder(g,.18,.11,C.paper,24);dial.rotation.x=Math.PI/2;dial.position.y=.48;
 const strap=block(g,.27,.09,.8,C.wood);strap.position.y=.3;
}
function addCar(g){
 const chassis=block(g,1.12,.3,.55,C.blue);chassis.position.y=.38;
 const cab=block(g,.66,.33,.46,C.paper);cab.position.set(-.03,.65,0);
 for(const x of [-.38,.38])for(const z of [-.30,.30]){
  const wheel=cylinder(g,.17,.09,C.ink,18);wheel.rotation.x=Math.PI/2;wheel.position.set(x,.21,z);
 }
}
function addBike(g){
 for(const x of [-.38,.38]){
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.22,.033,8,24),mat(C.ink));
  rim.rotation.y=Math.PI/2;rim.position.set(x,.28,.02);g.add(rim);
 }
 const frame=block(g,.74,.035,.045,C.blue);frame.position.y=.53;frame.rotation.z=.3;
}
function addWarning(g){
 const triangle=new THREE.Mesh(new THREE.ConeGeometry(.36,.6,3),mat(C.red));
 triangle.rotation.z=Math.PI;triangle.position.y=.58;g.add(triangle);
 const stem=block(g,.045,.24,.055,C.paper);stem.position.set(0,.55,.2);
}
function addDocumentFile(g){const folder=block(g,.75,.12,.58,C.blue);folder.position.y=.24;const sheet=addPaper(g);sheet.position.y=.24;}
function addFence(g){
 for(const x of [-.5,-.17,.17,.5]){const post=block(g,.055,.45,.065,C.wood);post.position.set(x,.27,.12);}
 const rail=block(g,1.15,.064,.065,C.wood);rail.position.set(0,.35,.12);
}
function addGavel(g){
 const handle=block(g,.13,.75,.13,C.wood);handle.position.set(0,.37,0);handle.rotation.z=-.55;
 const head=cylinder(g,.22,.4,C.wood,12);head.rotation.z=Math.PI/2;head.position.set(.24,.74,0);
}
function addHandOver(g){
 const left=block(g,.64,.12,.2,C.skin);left.position.set(-.25,.3,0);left.rotation.z=.12;
 const right=block(g,.64,.12,.2,C.skin);right.position.set(.25,.35,0);right.rotation.z=-.12;
 const gift=block(g,.24,.23,.25,C.gold);gift.position.set(0,.45,.0);
}
function buildProp(kind,parent){
 switch(kind){
 case "house":addHouse(parent);break;
 case "parcel":addPlot(parent);addHouse(parent,.40);parent.children[parent.children.length-1].position.set(.25,.11,-.08);break;
 case "path":addRoad(parent);break;
 case "tent":{const cone=new THREE.Mesh(new THREE.ConeGeometry(.57,.81,4),mat(C.gold));cone.position.y=.48;cone.rotation.y=Math.PI/4;parent.add(cone);break;}
 case "tool":{const handle=block(parent,.14,.9,.12,C.wood);handle.position.y=.45;const tool=block(parent,.4,.16,.16,C.steel);tool.position.set(0,.9,0);break;}
 case "document":case "letter":addPaper(parent);break;
 case "calendar":addPaper(parent);addClock(parent);break;
 case "clock":addClock(parent);break;
 case "handshake":case "handover":addHandOver(parent);break;
 case "person":addPerson(parent);break;
 case "registry":case "stamp":addRegistry(parent);break;
 case "coins":addCoins(parent);break;
 case "goods":{const carton=block(parent,.65,.58,.55,C.wood);carton.position.y=.33;const tape=block(parent,.12,.02,.55,C.paper);tape.position.y=.63;break;}
 case "selector":{for(let i=0;i<3;i++){const obj=block(parent,.25,.26,.26,i===0?C.gold:C.cream);obj.position.set(i*.35-.35,.19,.03);}break;}
 case "warning":addWarning(parent);break;
 case "crack":{const slab=block(parent,.7,.55,.5,C.cream);slab.position.y=.35;const fissure=block(parent,.05,.40,.06,C.red);fissure.position.set(.05,.46,.27);fissure.rotation.z=.45;break;}
 case "eye":{const pupil=sphere(parent,.19,C.ink);pupil.position.y=.47;const iris=new THREE.Mesh(new THREE.TorusGeometry(.32,.09,8,30),mat(C.blue));iris.position.y=.47;parent.add(iris);break;}
 case "shield":case "lock":{const guard=block(parent,.58,.63,.24,C.blue);guard.position.y=.46;const bar=block(parent,.35,.14,.30,C.gold);bar.position.y=.85;break;}
 case "auction":addGavel(parent);break;
 case "gavel":addGavel(parent);break;
 case "gift":{const present=block(parent,.63,.55,.6,C.red);present.position.y=.3;const ribbon=block(parent,.12,.58,.65,C.gold);ribbon.position.y=.3;break;}
 case "car":addCar(parent);break;
 case "bike":addBike(parent);break;
 case "bank":addBank(parent);break;
 case "watch":addWatch(parent);break;
 case "flag":{const pole=cylinder(parent,.04,.98,C.steel);pole.position.y=.53;const cloth=block(parent,.51,.26,.03,C.green);cloth.position.set(.26,.82,0);break;}
 case "fence":addFence(parent);break;
 case "permission":{const permit=addPaper(parent);const tick=cylinder(parent,.15,.07,C.green);tick.position.set(.21,.32,.22);break;}
 default:addDocumentFile(parent);break;
 }
}
function backdrop(scene,kind){
 // Low-poly themed environment behind the clickable, article-specific objects.
 const back=new THREE.Group();back.position.set(0,0,-1.75);scene.add(back);
 switch(kind){
 case "servitude":case "possession":case "boundary":case "property":{
  const a=new THREE.Group(),b=new THREE.Group();a.position.x=-1.5;b.position.x=1.5;
  addPlot(a);addPlot(b);back.add(a,b);
  addHouse(a,.6);a.children[a.children.length-1].position.y=.11;
  addHouse(b,.48);b.children[b.children.length-1].position.y=.11;
  if(kind==="servitude")addRoad(back);else if(kind==="boundary")addFence(back);
  break;
 }
 case "registry":case "mortgage":{const left=new THREE.Group();left.position.x=-1.6;addHouse(left,.7);back.add(left);
  const right=new THREE.Group();right.position.x=1.6;addRegistry(right);back.add(right);break;}
 case "guarantee":case "loan":{const left=new THREE.Group();left.position.x=-1.6;addPerson(left);back.add(left);
  const right=new THREE.Group();right.position.x=1.6;addBank(right);back.add(right);break;}
 case "trade":case "exchange":case "gift":{const counter=block(back,4.2,.28,.72,C.wood);counter.position.y=.1;
  const a=new THREE.Group();a.position.x=-1.2;addHouse(a,.42);back.add(a);
  const b=new THREE.Group();b.position.x=1.2;addCoins(b);back.add(b);break;}
 case "pledge":{const counter=block(back,4.15,.38,.77,C.wood);counter.position.y=.22;addWatch(back);break;}
 case "lease":case "hire":{const house=new THREE.Group();house.position.x=-1;addHouse(house,.93);back.add(house);
  const clock=new THREE.Group();clock.position.x=1.2;addClock(clock);back.add(clock);break;}
 case "time":{const face=new THREE.Group();face.position.y=.0;addClock(face);face.scale.setScalar(1.9);back.add(face);break;}
 case "borrow":case "obligation":{const a=new THREE.Group();a.position.x=-1.3;addPerson(a);back.add(a);
  const b=new THREE.Group();b.position.x=1.3;addPerson(b);back.add(b);break;}
 }
}
const element=(t,c,s)=>{const e=document.createElement(t);if(c)e.className=c;if(s)e.textContent=s;return e;};
function details(panel,model,index){
 const p=model.parts[index];if(!p)return;
 panel.replaceChildren();
 panel.appendChild(element("span","niti-scene-number","ประเด็น "+(index+1)+" / "+model.parts.length));
 panel.appendChild(element("h4","",p.label));
 panel.appendChild(element("p","niti-scene-explanation",p.explanation));
 panel.appendChild(element("strong","","ลองคิดจากเหตุการณ์สมมติ"));
 panel.appendChild(element("p","",p.ask));
 panel.appendChild(element("p","niti-scene-alert","จุดต้องระวัง: "+model.exception));
 panel.appendChild(element("small","niti-scene-caption",p.caution));
}
export function mount(container,model){
 const screen=container.querySelector(".niti-scene-viewport");
 const panel=container.querySelector(".niti-scene-detail");
 const controlsList=container.querySelector(".niti-scene-buttons");
 const status=container.querySelector(".niti-scene-status");
 if(!screen||!panel||!controlsList||!model.parts.length)throw Error("Missing diorama UI");
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"low-power"});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
 renderer.setClearColor(0x000000,0);
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(43,1,.1,80);
 camera.position.set(0,3.4,9.2);
 const orbit=new OrbitControls(camera,renderer.domElement);
 const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
 orbit.target.set(0,.4,-.6);orbit.enablePan=false;orbit.minDistance=6;orbit.maxDistance=13;
 orbit.maxPolarAngle=Math.PI*.68;orbit.minPolarAngle=Math.PI*.20;orbit.enableDamping=!reduce;
 orbit.update();
 scene.add(new THREE.HemisphereLight(0xd8f4ff,0x594434,2.7));
 const light=new THREE.DirectionalLight(0xffffff,3.2);light.position.set(-3,8,6);scene.add(light);
 const pedestal=block(scene,7.9,.20,5.0,C.ground);pedestal.position.set(0,-.27,-.52);
 const inlay=block(scene,7.75,.035,4.85,0x3c6376);inlay.position.set(0,-.16,-.52);
 backdrop(scene,model.kind);
 const selectable=[],buttons=[];let selected=0,hovered=-1,down=null,disposed=false,raf=null,observer=null;
 const n=model.parts.length;
 const span=n>4?1.05:1.35;
 model.parts.forEach((part,i)=>{
  const item=new THREE.Group();
  item.userData.index=i;
  item.position.set((i-(n-1)/2)*span,0,.85+((i%2)*.22));
  const plinth=block(item,.94,.12,.99,i===selected?C.gold:C.steel);plinth.position.y=-.04;
  const art=new THREE.Group();buildProp(part.shape,art);item.add(art);
  item.userData.mats=[];
  art.traverse(obj=>{
   if(!obj.isMesh)return;
   obj.material=obj.material.clone();
   if("emissive" in obj.material){obj.material.emissive.setHex(0x25b8aa);obj.material.emissiveIntensity=0;}
   item.userData.mats.push(obj.material);
  });
  item.userData.baseScale=1;
  scene.add(item);selectable.push(item);
  const btn=element("button","niti-scene-button",(i+1)+". "+part.label);
  btn.type="button";btn.setAttribute("aria-pressed",String(i===0));
  btn.addEventListener("click",()=>select(i,true));controlsList.appendChild(btn);buttons.push(btn);
 });
 const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
 function recolor(){
  selectable.forEach((g,i)=>{
   const active=i===selected,hover=i===hovered;
   g.scale.setScalar(active?1.15:hover?1.11:1);
   g.userData.mats.forEach(m=>{if("emissiveIntensity" in m)m.emissiveIntensity=active?.52:hover?.70:0;});
  });
  buttons.forEach((b,i)=>b.setAttribute("aria-pressed",String(selected===i)));
 }
 function select(i,focus){
  if(i<0||i>=n)return;
  selected=i;recolor();details(panel,model,i);
  if(focus){panel.tabIndex=-1;panel.focus({preventScroll:true});}
 }
 function target(ev){
  const box=renderer.domElement.getBoundingClientRect();
  if(!box.width||!box.height)return -1;
  mouse.set((ev.clientX-box.left)/box.width*2-1,-((ev.clientY-box.top)/box.height*2-1));
  ray.setFromCamera(mouse,camera);
  const hit=ray.intersectObjects(selectable,true)[0];
  if(!hit)return -1;
  let x=hit.object;while(x&&!Number.isInteger(x.userData.index))x=x.parent;
  return x?x.userData.index:-1;
 }
 const move=ev=>{const i=target(ev);if(i!==hovered){hovered=i;recolor();}renderer.domElement.style.cursor=i>=0?"pointer":"grab";};
 const start=ev=>{down=[ev.clientX,ev.clientY];};
 const end=ev=>{if(!down)return;const d=Math.hypot(ev.clientX-down[0],ev.clientY-down[1]);down=null;if(d<7){const i=target(ev);if(i>=0)select(i,true);}};
 const leave=()=>{hovered=-1;down=null;recolor();};
 renderer.domElement.addEventListener("pointermove",move);
 renderer.domElement.addEventListener("pointerdown",start);
 renderer.domElement.addEventListener("pointerup",end);
 renderer.domElement.addEventListener("pointerleave",leave);
 renderer.domElement.setAttribute("aria-label","ฉากจำลอง "+model.kindLabel+" ประกอบมาตรา "+model.id+" เลือกวัตถุด้วยปุ่มข้อความใต้ภาพได้");
 renderer.domElement.setAttribute("role","img");
 screen.appendChild(renderer.domElement);
 function resize(){
  if(disposed)return;
  const w=Math.max(10,screen.clientWidth),h=Math.max(10,screen.clientHeight);
  camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
 }
 resize();
 if(typeof ResizeObserver!=="undefined"){observer=new ResizeObserver(resize);observer.observe(screen);}
 else window.addEventListener("resize",resize);
 function tick(){
  if(disposed)return;
  raf=requestAnimationFrame(tick);
  if(document.hidden)return;
  if(!reduce)orbit.update();
  renderer.render(scene,camera);
 }
 tick();select(0,false);
 if(status)status.textContent="ลากหมุนฉาก · ชี้เพื่อไฮไลต์ · คลิกวัตถุเพื่ออ่านหลักกฎหมาย หรือใช้ปุ่มด้านล่าง";
 return {dispose(){
  if(disposed)return;disposed=true;
  if(raf!==null)cancelAnimationFrame(raf);
  if(observer)observer.disconnect();else window.removeEventListener("resize",resize);
  renderer.domElement.removeEventListener("pointermove",move);
  renderer.domElement.removeEventListener("pointerdown",start);
  renderer.domElement.removeEventListener("pointerup",end);
  renderer.domElement.removeEventListener("pointerleave",leave);
  orbit.dispose();
  const geometries=new Set(),materials=new Set();
  scene.traverse(x=>{if(x.isMesh){geometries.add(x.geometry);(Array.isArray(x.material)?x.material:[x.material]).forEach(m=>materials.add(m));}});
  geometries.forEach(g=>g?.dispose());materials.forEach(m=>m?.dispose());
  renderer.dispose();renderer.domElement.remove();
 }};
}