import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import * as kit from '../vendor/anatomy/iso-kit.mjs';

const base = {x:-60,y:-40,w:120,d:98,r:5};
const templates = {};
const context={window:{}};
vm.createContext(context);
for(const file of ['statute-sources.js','statute-notes.js','statute-notes-extra.js'])vm.runInContext(readFileSync(new URL('../'+file,import.meta.url),'utf8'),context);
const sizes=[...new Set(context.window.NITI_STATUTE_NOTES.map(note=>note.conditions.split(/\s+\/\s+/).filter(Boolean).length))];
for (const count of sizes) {
  const height=count*16+6;
  const projection = kit.fitProjection([...kit.boxCorners(base,-8,height+3),[60,90,height+3]],560,390,{pad:22,azimuth:38,elevation:28});
  const body=[];
  const slab=(x,y,width,depth,z,thickness,tone='mid')=>kit.solidSvg(kit.slabOf({x,y,w:width,d:depth,r:1},z,thickness,projection,4,.5),{tone});
  body.push(`<path class="iso-halo" d="${kit.haloOf(base,-8,8,projection)}"/>`);
  for(const [x,y] of kit.corners(base,12)) {
    body.push(slab(x-5,y-5,10,10,-8,1,'lo'),slab(x-4,y-4,8,8,-7,3,'lo'),slab(x-5,y-5,10,10,-4,1,'mid'));
    body.push(slab(x-4,y-4,8,8,0,1,'lo'));
  }
  body.push(kit.solidSvg(kit.slabOf(base,-3,3,projection,8,1),{tone:'lo'}));
  body.push(slab(-44,-25,88,3,0,height),slab(-44,-22,3,63,0,height));
  for(let index=0;index<count;index++) {
    const level=index*16+3;
    body.push(slab(-41,-22,82,62,level-3,2,'lo'));
    body.push(slab(-40,-20,2,59,level,2,'lo'),slab(38,-20,2,59,level,2,'lo'));
    const drawer=[];
    drawer.push(slab(-37,-20,74,58,level,2));
    drawer.push(slab(-37,-20,74,2,level+2,10));
    drawer.push(slab(-37,-18,2,55,level+2,10));
    for(let sheet=0;sheet<3;sheet++) drawer.push(slab(-30+sheet,-12+sheet,59,39,level+2+sheet*.65,.6,'hi'));
    drawer.push(slab(35,-18,2,55,level+2,10));
    drawer.push(slab(-39,37,78,3,level,13,'hi'));
    drawer.push(slab(-15,40,3,4,level+5,3),slab(12,40,3,4,level+5,3),slab(-15,44,30,2,level+5,3));
    drawer.push(slab(-7,40,14,.5,level+9,2,'lo'));
    drawer.push(kit.dotsSvg(kit.pointsAt([[-34,39,level+13],[34,39,level+13]],projection),{size:.5,tone:'hi'}));
    body.push(`<g class="anatomy-drawer" data-drawer="${index}" data-open="${kit.translateAlong(projection,[0,30,0])}">${drawer.join('')}</g>`);
  }
  body.push(slab(41,-22,3,63,0,height));
  body.push(slab(-46,-27,92,71,height,3,'hi'));
  for(const [x,y] of kit.corners({x:-46,y:-27,w:92,d:71,r:1},5)) {
    body.push(slab(x-2,y-2,4,4,height+3,.5,'lo'));
    body.push(kit.dotsSvg([kit.iso([x,y,height+3.5],projection)],{size:.6,tone:'hi'}));
  }
  templates[count]=kit.figureSvg({width:560,height:390,label:'ตู้แฟ้มแยกประเด็นของบทบัญญัติ แต่ละลิ้นชักแทนประเด็นหนึ่ง',body:body.join('')});
}
writeFileSync(new URL('../statute-art.js',import.meta.url),'window.NITI_STATUTE_ART='+JSON.stringify(templates)+';\n');
writeFileSync(new URL('../statute-art.css',import.meta.url),kit.ISO_CSS.replaceAll('.iso[data-theme="light"]','html:not([data-theme="dark"]) .statute-anatomy.iso'));
console.log('Built '+sizes.length+' Anatomy cabinet sizes for all '+context.window.NITI_STATUTE_NOTES.length+' statutes.');
