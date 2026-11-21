import json,os,re
out=open('base2.html').read()
def S1(a,b,cnt=1):
    global out
    n=out.count(a)
    assert n==cnt,(n,a[:90])
    out=out.replace(a,b)
LIB=open('part_lib.js').read()
ASSETS={'hollow':'assets/hollow.json'}
for d,names in (('b','cabin house_a house_b house_c house_d store church garage gas_pump phone_booth well ship_bin lamp_post grave_0 grave_1 grave_2 altar scarecrow fence car car_wreck'),
                ('n','nature crops props'),('c','mae hale tobias hollis agnes dunn ruth'),('x','fp crow cat deer')):
    for n in names.split(): ASSETS[n]=f'assets/{d}/{n}.json'
TEX={k:f'assets/n/tex_{k}.jpg' for k in ('grass','dirt','soil','cobble')}
# --- scripts + loader overlay
S1('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>',
 '''<div id="loadScr" role="status" aria-live="polite"><div class="lt">Hollow Acre</div><div class="lb"><i id="loadBar"></i></div><div class="ls" id="loadTxt">Loading the valley…</div></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js"></script>''')
S1('</style>','''#loadScr{position:fixed;inset:0;z-index:999;background:#07070a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;color:#cdbf9f;font-family:Georgia,serif;transition:opacity .8s}
#loadScr .lt{font-size:30px;letter-spacing:.12em;text-transform:uppercase;color:#e8dcc0}
#loadScr .lb{width:min(260px,70vw);height:3px;background:#221d18;overflow:hidden}#loadScr .lb i{display:block;height:100%;width:0;background:#b8521c;transition:width .2s}
#loadScr .ls{font-size:14px;opacity:.75}
</style>''')
S1("<script>\n(function(){\n'use strict';","<script>\nwindow.MAIN=function(){\n'use strict';")
i=out.rindex("\n})();\n</script>")
BOOT='''
<script>
(function(){const LIST=%s,TEX=%s;window.LIB={};window.LIBTEX={};const keys=Object.keys(LIST),tk=Object.keys(TEX);let done=0;const total=keys.length+tk.length;
const bar=document.getElementById('loadBar'),txt=document.getElementById('loadTxt');
const tick=()=>{done++;bar.style.width=(done/total*100).toFixed(0)+'%%';txt.textContent=done<total?'Loading the valley… '+done+' / '+total:'Opening the gate…';};
function glb(js){const u=js.buffers[0].uri;const b64=u.slice(u.indexOf(',')+1);const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));delete js.buffers[0].uri;js.buffers[0].byteLength=bin.length;
  const enc=new TextEncoder().encode(JSON.stringify(js));const jl=(enc.length+3)&~3,bl=(bin.length+3)&~3;const o=new Uint8Array(12+8+jl+8+bl);const dv=new DataView(o.buffer);
  dv.setUint32(0,0x46546C67,true);dv.setUint32(4,2,true);dv.setUint32(8,o.length,true);dv.setUint32(12,jl,true);dv.setUint32(16,0x4E4F534A,true);o.fill(32,20,20+jl);o.set(enc,20);
  dv.setUint32(20+jl,bl,true);dv.setUint32(24+jl,0x004E4942,true);o.set(bin,28+jl);return o.buffer;}
const one=k=>fetch(LIST[k]).then(r=>{if(!r.ok)throw 0;return r.json();}).then(js=>new Promise(res=>{try{new THREE.GLTFLoader().parse(glb(js),'',g=>{LIB[k]=g;res();},()=>res());}catch(e){res();}})).catch(()=>{}).then(tick);
const img=k=>new Promise(res=>{const im=new Image();im.onload=()=>{LIBTEX[k]=im;res();};im.onerror=()=>res();im.src=TEX[k];}).then(tick);
const has=!!(THREE.GLTFLoader&&THREE.SkeletonUtils);
let q=has?keys.slice():[];const run=()=>{const k=q.shift();return k?one(k).then(run):null;};
Promise.all([...[0,1,2,3,4,5].map(run),...(has?tk.map(img):[])]).then(()=>{try{window.MAIN();}catch(e){console.error(e);txt.textContent='Something went wrong: '+e.message;return;}
  const s=document.getElementById('loadScr');s.style.opacity=0;setTimeout(()=>s.remove(),900);});})();
</script>'''%(json.dumps(ASSETS),json.dumps(TEX))
out=out[:i]+"\n};\n</script>"+BOOT+out[i+len("\n})();\n</script>"):]
# --- library after T
S1("jack:tex(jackC),shadow:tex(shadowC,1,1,false),face:tex(faceC)};","jack:tex(jackC),shadow:tex(shadowC,1,1,false),face:tex(faceC)};\n"+LIB+"\nT.grass=LTEX('grass',T.grass);T.dirt=LTEX('dirt',T.dirt);T.soil=LTEX('soil',T.soil);\n")
S1("T.cobble=tex(cobbleC);","T.cobble=LTEX('cobble',tex(cobbleC));")
# --- farm
S1("addRect(0,-12,6.6,5.4,0);addCircle(-3.1,-7.9,.15);","addRect(0,-12,6.6,5.4,0);swapIn(cabin,'cabin');addCircle(-3.1,-7.9,.15);")
S1("const f=new THREE.Mesh(new THREE.PlaneGeometry(s*1.6,s*1.6),mat.jack);f.position.z=s*.98;g.add(f);jacks.push(g);}",
   "const f=new THREE.Mesh(new THREE.PlaneGeometry(s*1.6,s*1.6),mat.jack);f.position.z=s*.98;g.add(f);jacks.push(g);\n  if(HAS('props')){hideMeshes(g);const jm=model('props:jack');jm.scale.setScalar(s/.43);jm.position.y=-s*.6;g.add(jm);}}")
S1("{const g=new THREE.Group();g.position.set(wellPos.x,0,wellPos.z);scene.add(g);","{const g=new THREE.Group();g.position.set(wellPos.x,0,wellPos.z);scene.add(g);SWAPS.push([g,'well']);")
S1("{const g=new THREE.Group();g.position.set(binPos.x,0,binPos.z);scene.add(g);","{const g=new THREE.Group();g.position.set(binPos.x,0,binPos.z);scene.add(g);SWAPS.push([g,'ship_bin']);")
S1("function barrel(x,z){","function barrel(x,z){if(HAS('props')){const m=model('props:barrel');m.position.set(x,0,z);m.rotation.y=rand()*6;scene.add(m);addCircle(x,z,.4);blob(x,z,1.3);return;}")
S1("function crate(x,z,r,s){s=s||.7;","function crate(x,z,r,s){s=s||.7;if(HAS('props')){const m=model('props:crate');m.position.set(x,0,z);m.rotation.y=r||0;m.scale.setScalar(s/.7);scene.add(m);addCircle(x,z,s*.6);blob(x,z,s*1.8);return;}")
S1("function hay(x,z,r){","function hay(x,z,r){if(HAS('props')){const m=model('props:hay');m.position.set(x,0,z);m.rotation.y=r;scene.add(m);addCircle(x,z,.65);blob(x,z,2);return;}")
S1("{const pos=[];const tri=(a,b,c)=>pos.push(...a,...b,...c);","if(HAS('nature'))CORN_MODEL();else{const pos=[];const tri=(a,b,c)=>pos.push(...a,...b,...c);")
# --- town
S1("function makeHouse(x,z,face,o){o=o||{};","""function makeHouse(x,z,face,o){o=o||{};
  if(o.model&&HAS(o.model)){const w=o.mw||o.w||6,d=o.md||o.d||5,ms=o.ms||1,rot=face>0?0:Math.PI;const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);
    const m=model(o.model);m.scale.setScalar(ms);g.add(m);g.userData.model=m;addRect(x,z,(w+.3)*ms,(d+.3)*ms,rot);houses.push({x,z,w:w*ms,mats:[],o:1});blob(x,z,Math.max(w,d)*ms*1.6);return g;}""")
for a,b in (("makeHouse(40,2,-1,{","model:'store',"),("makeHouse(40,-14,1,{","model:'house_a',"),("makeHouse(57,2,-1,{","model:'house_c',"),("makeHouse(62,-14,1,{","model:'house_b',"),
            ("makeHouse(57,12.5,-1,{","model:'house_d',"),("makeHouse(30,10,-1,{","model:'house_b',ms:.9,mw:6,md:5.5,"),("makeHouse(64,4.2,-1,{","model:'house_c',ms:.72,mw:6.5,md:5,"),
            ("makeHouse(-36,-14.5,1,{","model:'garage',"),("makeHouse(-46,4.5,-1,{","model:'house_a',mw:6.5,md:5.5,")):
    S1(a,a+b)
S1("{const door=box(4.2,3.2,.1,MS({map:rep(T.woodGrey,2,2),color:0x8a8070}),-1.6,2.05,3.56,garage);for(let i=0;i<6;i++)box(4.2,.04,.13,mat.iron,-1.6,.4+i*.5,3.57,garage);",
   "{if(!garage.userData.model){const door=box(4.2,3.2,.1,MS({map:rep(T.woodGrey,2,2),color:0x8a8070}),-1.6,2.05,3.56,garage);for(let i=0;i<6;i++)box(4.2,.04,.13,mat.iron,-1.6,.4+i*.5,3.57,garage);}")
S1(" {const hm=houses[houses.length-1].mats;garage.traverse("," if(!garage.userData.model){const hm=houses[houses.length-1].mats;garage.traverse(")
S1("addRect(48,-27,7.4,11.4,0);addRect(48,-20.8,3.4,3.4,0);",
   "addRect(48,-27,7.4,11.4,0);addRect(48,-20.8,3.4,3.4,0);if(HAS('church'))addRect(48,-20,3.4,3.4,0);\nSWAPS.push([church,g=>{hideMeshes(g);const m=model('church');g.add(m);g.updateMatrixWorld(true);const b=m.getObjectByName('bell');if(b)bellPivot.attach(b);},'church']);")
S1("g.rotation.set((rand()-.5)*.25,r,(rand()-.5)*.25);scene.add(g);",
   "g.rotation.set((rand()-.5)*.25,r,(rand()-.5)*.25);scene.add(g);SWAPS.push([g,(k=>gg=>{for(const c of gg.children)c.visible=false;gg.add(model('grave_'+k));})(SWAPS.length%3),'grave_0']);")
S1("lamps.push({gl,sp,ph:rand()*10,dead:rand()<.25});",
   "lamps.push({gl,sp,ph:rand()*10,dead:rand()<.25});SWAPS.push([g,gg=>{gg.children[0].visible=gg.children[1].visible=false;const m=model('lamp_post');const gm=findMesh(m,'window');if(gm)gm.visible=false;gg.add(m);},'lamp_post']);")
S1("{const g=new THREE.Group();g.position.set(pumpPos.x,0,pumpPos.z);scene.add(g);","{const g=new THREE.Group();g.position.set(pumpPos.x,0,pumpPos.z);scene.add(g);SWAPS.push([g,'gas_pump']);")
S1("{const g=new THREE.Group();g.position.set(boothPos.x,0,boothPos.z);scene.add(g);",
   "{const g=new THREE.Group();g.position.set(boothPos.x,0,boothPos.z);scene.add(g);SWAPS.push([g,gg=>{for(const c of gg.children)if(c.isMesh&&c.material!==boothLight&&!c.material.map)c.visible=false;gg.add(model('phone_booth'));},'phone_booth']);")
S1("addCircle(x,z,.85);blob(x,z,3);return {x,z,name,g,em,flame,","addCircle(x,z,.85);blob(x,z,3);return {x,z,name,g,em:altarEm(g,em,[flame,gl,light]),flame,")
S1("blob(scarePos.x,scarePos.z,1.6,scare).position.set(0,.03,0);",
   "blob(scarePos.x,scarePos.z,1.6,scare).position.set(0,.03,0);\nif(HAS('scarecrow')){hideMeshes(scare);const sm=model('scarecrow');scare.add(sm);const hn=sm.getObjectByName('head');if(hn){scare.updateMatrixWorld(true);scareHead.attach(hn);}}")
# --- nature
S1("function deadTree(x,z,s){","function deadTree(x,z,s){if(HAS('nature')){const g=model('nature:dead');g.position.set(x,0,z);g.scale.setScalar(s*.85);g.rotation.y=rand()*6;scene.add(g);addCircle(x,z,.35*s);blob(x,z,2.5*s);return;}")
S1("{const n=50,im=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.5,1)","if(HAS('nature'))NATURE_ROCKS();else{const n=50,im=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.5,1)")
S1("{const n=170,im=new THREE.InstancedMesh(","if(HAS('nature'))NATURE_BUSH();else{const n=170,im=new THREE.InstancedMesh(")
S1("{const pts=[];let tries=0;while(pts.length<760","if(HAS('nature'))NATURE_PINES();else{const pts=[];let tries=0;while(pts.length<760")
S1("{const g=new THREE.BufferGeometry(),pos=[],nor=[];for(let b=0;b<7;b++)","if(HAS('nature'))NATURE_GRASS();else{const g=new THREE.BufferGeometry(),pos=[],nor=[];for(let b=0;b<7;b++)")
S1("{const n=treeSpots.length;const trunkG","if(HAS('nature'))NATURE_AUTUMN(treeSpots);else{const n=treeSpots.length;const trunkG")
S1("const gl=glow(0x60ffd0,.8,g,0,.2,0);gl.material.opacity=.5;mushrooms.push(",
   "if(HAS('nature')){hideMeshes(g);g.add(model('nature:mushroom'));}const gl=glow(0x60ffd0,.8,g,0,.2,0);gl.material.opacity=.5;mushrooms.push(")
# --- vehicles
S1("function makeCar(color,opts){opts=opts||{};","function makeCar(color,opts){opts=opts||{};{const nm=opts.wreck?'car_wreck':'car';if(HAS(nm))return carModel(nm,opts);}")
S1("const wreck=makeCar(0x6e1f1a);","const wreck=makeCar(0x6e1f1a,{wreck:true});")
S1("for(const w of car.wheels)w.rotation.z-=","for(const w of car.wheels)w.rotation[car.model?'x':'z']-=")
# --- creatures and people
S1("function buildHollow(){","function buildHollow(){if(HAS('hollow'))return hollowModel();")
S1("function poseHollow(m,dt,o){","function poseHollow(m,dt,o){if(m.model)return poseHollowModel(m,dt,o);")
S1("const c=HM.g.clone(true);","const c=HM.model?ghostModel():HM.g.clone(true);")
S1("const back=buildHollow();","const back=buildHollow();back.sit=true;")
S1("const npcs=NPCDEF.map(d=>{const p=buildPerson(d.look);","const npcs=NPCDEF.map(d=>{const p=HAS(d.id)?personModel(d.id):buildPerson(d.look);")
S1("const ruth=buildPerson({kid:true,","const ruth=HAS('ruth')?personModel('ruth'):buildPerson({kid:true,")
S1("function animPerson(p,dt,spd,o){o=o||{};","function animPerson(p,dt,spd,o){o=o||{};if(p.model)return animPersonModel(p,dt,spd,o);")
S1("function makeCrow(){","function makeCrow(){if(HAS('crow'))return crowModel();")
S1("function makeCat(){","function makeCat(){if(HAS('cat'))return catModel();")
S1("   deer.traverse(o=>{if(o.isMesh)o.castShadow=true;});}","   deer.traverse(o=>{if(o.isMesh)o.castShadow=true;});if(HAS('deer')){for(const o of deer.children)if(o!==bl)o.visible=false;const dm=model('deer');dm.rotation.y=Math.PI;deer.add(dm);}}")
# --- crops
S1("c.group=g;g.userData.grow=0;g.scale.setScalar(.05);","c.group=g;g.userData.grow=0;g.scale.setScalar(.05);\n  if(HAS('crops')){const cm=model('crops:'+c.type+'_'+c.stage);cm.position.y=-.01;g.add(cm);return;}")
# --- first person
S1("function vmArmGeo(side,grip){","function vmArmGeo(side,grip){if(HAS('fp'))return fpPart(side>0?'armL':'armR');")
S1("vmLan.userData.glass=glass;const gl=glow(0xffa040,.5,vmLan,0,-.17,0);vmLan.userData.glow=gl;}",
   "vmLan.userData.glass=glass;const gl=glow(0xffa040,.5,vmLan,0,-.17,0);vmLan.userData.glow=gl;\n if(HAS('fp')){hideMeshes(vmLan);const lm=fpPart('lantern');vmLan.add(lm);const lg=findMesh(lm,'lanternglass');if(lg){lg.material=lg.material.clone();lg.material.emissive=new THREE.Color(0xffa040);lg.material.emissiveIntensity=2;vmLan.userData.glass=lg;}\n  const fm=findMesh(lm,'flame');if(fm)vmLan.userData.flame=fm;}}")
S1("for(const k in vmTools)if(vmTools[k].isObject3D&&k!=='rtip')vmTools[k].visible=false;",
   "for(const k in vmTools)if(vmTools[k].isObject3D&&k!=='rtip')vmTools[k].visible=false;\n if(HAS('fp'))for(const k of['hoe','can','rod','pouch']){const o=vmTools[k];if(o.isMesh){o.material=o.material.clone();o.material.visible=false;}else hideMeshes(o);o.add(fpPart(k));}")
S1("const s=new THREE.Mesh(shockG,shockM);s.position.set(x,.95,z);","const s=HAS('props')?model('props:cornshock'):new THREE.Mesh(shockG,shockM);s.position.set(x,HAS('props')?0:.95,z);")
S1("tie.position.set(x,1.35,z);scene.add(tie);","tie.position.set(x,1.35,z);scene.add(tie);tie.visible=!HAS('props');")
S1(" const im=new THREE.InstancedMesh(G_PUMP,mat.pumpkinRib,pumps.length)"," if(HAS('props'))instanced('props:pumpkin',pumps.length,(i,m)=>{const [x,z,s]=pumps[i];const k=s/.43;m.compose(new V3(x,0,z),new THREE.Quaternion().setFromAxisAngle(new V3(0,1,0),i*2.1),new V3(k,k,k));});else{const im=new THREE.InstancedMesh(G_PUMP,mat.pumpkinRib,pumps.length)")
S1("im.setMatrixAt(i,m);});im.castShadow=true;im.frustumCulled=false;scene.add(im);}\nhay(46.4","im.setMatrixAt(i,m);});im.castShadow=true;im.frustumCulled=false;scene.add(im);}}\nhay(46.4")
S1("  if(mShot){cam.layers.enable(1);","  if(c.car.seats)c.car.seats.visible=!mShot;if(mShot){cam.layers.enable(1);")
S1("c.hemiC.intensity=.3;c.look.copy(lw(-.3,1.1,-6));","c.hemiC.intensity=.5;c.look.copy(lw(-.3,1.1,-6));")
S1("c.backL.intensity=.55;","c.backL.intensity=2.2;c.backL.distance=3.2;")
# --- run swaps + per-frame
S1("const P=buildFarmer();","runSwaps();\nconst P=buildFarmer();")
S1("applyTime(S.hour);const p=P.g.position,n=env.night;","applyTime(S.hour);const p=P.g.position,n=env.night;libUpdate(dt);libNight(n);")
open('hollow-acre.html','w').write(out)
open('assets_list.json','w').write(json.dumps({**ASSETS,**TEX}))
print('ok',len(out))
