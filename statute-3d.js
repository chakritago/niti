/* Three.js visual legal tree: semantic nodes, orbit controls, raycasting and glow.
 * Loaded only when a statute reader dialog is opened. No external textures.
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const palette={
  branch:0x9d6c48,trunk:0x65452f,
  issue:0x22c4ab,result:0xf1ba50,ground:0x243e53,
  leaf:0x55ab8d,highlight:0xffffff
};
const create=(tag,className,content)=>{
 const el=document.createElement(tag);
 if(className)el.className=className;
 if(typeof content==="string")el.textContent=content;
 return el;
};
function makeLabel(text){
 const canvas=document.createElement("canvas");
 canvas.width=768;canvas.height=160;
 const ctx=canvas.getContext("2d");
 if(!ctx)return null;
 ctx.clearRect(0,0,768,160);
 ctx.fillStyle="rgba(10,31,43,.90)";
 ctx.beginPath();ctx.roundRect(8,10,752,136,32);ctx.fill();
 ctx.strokeStyle="rgba(208,237,238,.60)";ctx.lineWidth=3;ctx.stroke();
 ctx.fillStyle="#fff";ctx.font='bold 56px "Sarabun",Tahoma,sans-serif';
 ctx.textAlign="center";ctx.textBaseline="middle";
 const line=text.length>19?text.slice(0,18)+"…":text;
 ctx.fillText(line,384,78,710);
 const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.SpriteMaterial({map:texture,depthWrite:false,transparent:true});
 const label=new THREE.Sprite(material);
 label.scale.set(2.05,.43,1);
 label.userData.texture=texture;
 return label;
}
const connect=(start,end,radius,mat)=>{
 const delta=new THREE.Vector3().subVectors(end,start);
 const length=delta.length();
 const item=new THREE.Mesh(new THREE.CylinderGeometry(radius*.64,radius,length,7),mat);
 item.position.copy(start).add(end).multiplyScalar(.5);
 item.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
 return item;
};
export function mount(root,data){
 const viewport=root.querySelector(".niti-3d-canvas");
 const detail=root.querySelector(".niti-3d-detail");
 const pickList=root.querySelector(".niti-3d-picks");
 const status=root.querySelector(".niti-3d-status");
 if(!viewport||!detail||!pickList||!data?.nodes?.length)throw Error("3D container or model unavailable");
 const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true;
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(42,1,.1,80);
 camera.position.set(0,2.8,9.5);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"low-power"});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
 renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 viewport.appendChild(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=!reduced;
 controls.enablePan=false;
 controls.minDistance=5.5;controls.maxDistance=14;
 controls.minPolarAngle=.35;controls.maxPolarAngle=Math.PI*.67;
 controls.target.set(0,1.1,0);
 controls.update();
 scene.add(new THREE.HemisphereLight(0xe6fff8,0x4a4436,2.3));
 const spot=new THREE.DirectionalLight(0xffffff,2.8);
 spot.position.set(4,7,6);scene.add(spot);
 const groundMat=new THREE.MeshStandardMaterial({color:palette.ground,roughness:.88,metalness:.05});
 const ground=new THREE.Mesh(new THREE.CylinderGeometry(2.1,2.3,.2,48),groundMat);
 ground.position.y=-.88;scene.add(ground);
 const ringMat=new THREE.MeshStandardMaterial({color:0x34a897,metalness:.28,roughness:.44});
 const ring=new THREE.Mesh(new THREE.TorusGeometry(1.89,.037,10,60),ringMat);
 ring.rotation.x=Math.PI/2;ring.position.y=-.77;scene.add(ring);
 const trunkMat=new THREE.MeshStandardMaterial({color:palette.trunk,roughness:.9});
 const branchMat=new THREE.MeshStandardMaterial({color:palette.branch,roughness:.85});
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.27,.41,2.1,10),trunkMat);
 trunk.position.set(0,.26,0);scene.add(trunk);
 const rootGlow=new THREE.Mesh(new THREE.SphereGeometry(.39,20,16),new THREE.MeshStandardMaterial({color:0x2aafa0,emissive:0x176a59,emissiveIntensity:.2,metalness:.16,roughness:.5}));
 rootGlow.position.set(0,1.24,0);scene.add(rootGlow);

 pickList.replaceChildren();
 const selectable=[],modelObjects=[],buttons=[];
 let current=0,hover=-1,disposed=false,frame=null,lastPointer=null,resizeObs=null;
 const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();
 const count=data.nodes.length;
 const petals=count>8?3:5;
 const sphereGeo=new THREE.SphereGeometry(count>8?.25:.32,24,18);
 function labelPoint(i){
  const angle=(i/count)*Math.PI*2+Math.PI*.12;
  const radius=count>8?2.36:2.08;
  const y=1.3+(i%3)*.54+(i%2)*.16;
  return new THREE.Vector3(Math.cos(angle)*radius,y,Math.sin(angle)*radius*.78);
 }
 data.nodes.forEach((node,i)=>{
  const p=labelPoint(i);
  scene.add(connect(new THREE.Vector3(0,1.05,0),p,.065,branchMat));
  const material=new THREE.MeshStandardMaterial({
   color:node.type==="result"?palette.result:palette.issue,
   emissive:node.type==="result"?0xa16b0d:0x0c6b69,
   emissiveIntensity:.18,roughness:.28,metalness:.18
  });
  const orb=new THREE.Mesh(sphereGeo,material);
  orb.position.copy(p);
  orb.userData.index=i;
  scene.add(orb);selectable.push(orb);
  const sprite=makeLabel(node.label);
  if(sprite){
    sprite.position.copy(p).add(new THREE.Vector3(0,.49,0));
    scene.add(sprite);modelObjects.push(sprite);
  }
  const leaves=new THREE.MeshStandardMaterial({color:node.type==="result"?0xc5ba65:palette.leaf,roughness:.76,transparent:true,opacity:.56});
  for(let j=0;j<petals;j++){
   const a=(j/petals)*Math.PI*2;
   const leaf=new THREE.Mesh(new THREE.OctahedronGeometry(.14,0),leaves);
   leaf.position.copy(p).add(new THREE.Vector3(Math.cos(a)*.46,Math.sin(a*2)*.14,Math.sin(a)*.36));
   leaf.rotation.set(a,.4,a*.2);scene.add(leaf);
  }
  const button=create("button","niti-3d-pick",(i+1)+". "+node.label);
  button.type="button";button.setAttribute("aria-pressed","false");
  button.addEventListener("click",()=>select(i,true));
  pickList.appendChild(button);buttons.push(button);
 });
 function updateVisual(){
  selectable.forEach((mesh,i)=>{
   const active=i===current,over=i===hover;
   mesh.scale.setScalar(active?1.31:over?1.17:1);
   mesh.material.emissiveIntensity=active?.95:over?.65:.18;
  });
  buttons.forEach((button,i)=>button.setAttribute("aria-pressed",String(i===current)));
 }
 function select(i,focus){
  if(i<0||i>=count)return;
  current=i;const node=data.nodes[i];
  detail.replaceChildren();
  detail.appendChild(create("span","niti-3d-kind",node.type==="result"?"ผลทางกฎหมาย":"ประเด็นที่ต้องตรวจ"));
  detail.appendChild(create("h4","",node.title));
  detail.appendChild(create("p","",node.explanation));
  detail.appendChild(create("strong","","ลองนึกภาพจากชีวิตประจำวัน"));
  detail.appendChild(create("p","",node.example));
  detail.appendChild(create("strong","","คำถามชวนคิด"));
  detail.appendChild(create("p","niti-3d-question",node.question));
  detail.appendChild(create("p","niti-3d-reminder",node.reminder));
  updateVisual();
  if(focus)detail.setAttribute("tabindex","-1"),detail.focus({preventScroll:true});
 }
 function hit(event){
  const rect=renderer.domElement.getBoundingClientRect();
  if(!rect.width||!rect.height)return -1;
  mouse.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
  raycaster.setFromCamera(mouse,camera);
  return raycaster.intersectObjects(selectable,false)[0]?.object.userData.index??-1;
 }
 const onMove=ev=>{
  if(disposed)return;
  const i=hit(ev);if(i!==hover){hover=i;updateVisual();}
  renderer.domElement.style.cursor=i>=0?"pointer":"grab";
 };
 const onDown=ev=>{lastPointer={x:ev.clientX,y:ev.clientY};};
 const onUp=ev=>{
  if(!lastPointer)return;
  const d=Math.hypot(ev.clientX-lastPointer.x,ev.clientY-lastPointer.y);
  lastPointer=null;
  if(d<7){const i=hit(ev);if(i>=0)select(i,true);}
 };
 const onLeave=()=>{hover=-1;updateVisual();lastPointer=null;};
 renderer.domElement.addEventListener("pointermove",onMove);
 renderer.domElement.addEventListener("pointerdown",onDown);
 renderer.domElement.addEventListener("pointerup",onUp);
 renderer.domElement.addEventListener("pointerleave",onLeave);
 renderer.domElement.setAttribute("role","img");
 renderer.domElement.setAttribute("aria-label","ต้นไม้สามมิติแสดงองค์ประกอบกฎหมายของมาตรา "+data.id+" สามารถเลือกประเด็นด้วยปุ่มข้อความใต้ภาพ");
 function resize(){
  if(disposed)return;
  const w=Math.max(1,viewport.clientWidth),h=Math.max(1,viewport.clientHeight);
  camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
 }
 resize();
 if("ResizeObserver" in window){resizeObs=new ResizeObserver(resize);resizeObs.observe(viewport);}
 else window.addEventListener("resize",resize);
 function tick(){
  if(disposed)return;
  frame=requestAnimationFrame(tick);
  if(document.hidden)return;
  if(!reduced){controls.update();rootGlow.rotation.y+=.003;}
  renderer.render(scene,camera);
 }
 tick();select(0,false);
 if(status)status.textContent="โมเดล 3D พร้อมแล้ว · ลากเพื่อหมุน / คลิกทรงกลมเพื่ออ่าน / ใช้ปุ่มรายการสำหรับคีย์บอร์ด";
 return {dispose(){
  if(disposed)return;disposed=true;
  if(frame!==null)cancelAnimationFrame(frame);
  resizeObs?.disconnect();
  window.removeEventListener("resize",resize);
  renderer.domElement.removeEventListener("pointermove",onMove);
  renderer.domElement.removeEventListener("pointerdown",onDown);
  renderer.domElement.removeEventListener("pointerup",onUp);
  renderer.domElement.removeEventListener("pointerleave",onLeave);
  controls.dispose();
  scene.traverse(obj=>{
   if(obj.isMesh){obj.geometry?.dispose();if(Array.isArray(obj.material))obj.material.forEach(m=>m.dispose());else obj.material?.dispose();}
   if(obj.isSprite){obj.material?.map?.dispose();obj.material?.dispose();}
  });
  modelObjects.length=0;renderer.dispose();renderer.domElement.remove();
 }};
}
