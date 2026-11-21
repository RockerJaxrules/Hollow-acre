/* ================= Blender asset library ================= */
const LIBR=window.LIB||{};
function HAS(n){const [f]=n.split(':');return !!LIBR[f];}
const NIGHT_MATS=[];const MIXERS=[];
const NIGHT_COL={window:0xffa040,lanternglass:0xffa040,headlight:0xfff0c8,taillight:0xff2010,jackglow:0xff8020,glow:0x60ffd0,flame:0xffd080};
function prepMat(m){if(!m||m.userData.prepped)return m;m.userData.prepped=true;const n=(m.name||'').split('.')[0];
  for(const k in NIGHT_COL)if(n.startsWith(k)){m.emissive=new THREE.Color(NIGHT_COL[k]);m.emissiveIntensity=k==='glow'||k==='flame'?1.2:0;if((k==='window'||k==='jackglow')&&!NIGHT_MATS.includes(m))NIGHT_MATS.push(m);m.userData.nightKind=k;}
  if(m.map)m.map.anisotropy=MAXANI;return m;}
function model(n,sub){const [f,node]=n.split(':');const g=LIBR[f];let src=g.scene;if(node||sub){src=g.scene.getObjectByName(node||sub);if(!src)return new THREE.Group();}
  const skinned=g.animations&&g.animations.length&&!node;const o=skinned?THREE.SkeletonUtils.clone(src):src.clone(true);
  if(node){o.position.set(0,0,0);o.rotation.set(0,0,0);}
  o.traverse(m=>{if(m.isMesh||m.isSkinnedMesh){m.castShadow=true;m.receiveShadow=true;m.frustumCulled=!m.isSkinnedMesh;const ms=Array.isArray(m.material)?m.material:[m.material];ms.forEach(prepMat);}});return o;}
function meshesOf(n){const [f,node]=n.split(':');const g=LIBR[f];const src=node?g.scene.getObjectByName(node):g.scene;const out=[];if(!src)return out;src.updateMatrixWorld(true);
  const inv=new THREE.Matrix4().copy(src.matrixWorld).invert();src.traverse(m=>{if(m.isMesh){const geo=m.geometry.clone();geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld));out.push({geo,mat:prepMat(m.material)});}});return out;}
function findMesh(root,prefix){let r=null;root.traverse(m=>{if(!r&&m.isMesh){const ms=Array.isArray(m.material)?m.material:[m.material];if(ms.some(x=>(x.name||'').startsWith(prefix)))r=m;}});return r;}
function hideMeshes(g){g.traverse(o=>{if(o.isMesh)o.visible=false;});}
function swapIn(g,n,opts){if(!HAS(n))return null;hideMeshes(g);const m=model(n);if(opts&&opts.rot)m.rotation.y=opts.rot;if(opts&&opts.scale)m.scale.setScalar(opts.scale);if(opts&&opts.y!==undefined)m.position.y=opts.y;g.add(m);return m;}
function instanced(n,count,setter,opts){const parts=meshesOf(n);const out=[];for(const {geo,mat:m} of parts){let mm=m;if(opts&&opts.wind){mm=m.clone();addWind(mm,opts.wind);}
    const im=new THREE.InstancedMesh(geo,mm,count);im.castShadow=!(opts&&opts.noShadow);im.receiveShadow=true;im.frustumCulled=false;out.push(im);scene.add(im);}
  const mtx=new THREE.Matrix4();for(let i=0;i<count;i++){setter(i,mtx);for(const im of out)im.setMatrixAt(i,mtx);}return out;}
function addWind(m,k){m.onBeforeCompile=sh=>{sh.uniforms.uTime=windU;sh.vertexShader='uniform float uTime;\n'+sh.vertexShader.replace('#include <begin_vertex>',
  `#include <begin_vertex>
   #ifdef USE_INSTANCING
   vec4 ip=instanceMatrix[3];
   #else
   vec4 ip=vec4(0.0);
   #endif
   float hh=max(position.y,0.);transformed.x+=sin(uTime*1.6+ip.x*.5+ip.z*.3)*hh*${k.toFixed(3)};transformed.z+=cos(uTime*1.2+ip.x*.3)*hh*${(k*.6).toFixed(3)};`);};m.needsUpdate=true;}
function libNight(n,t){for(const m of NIGHT_MATS)m.emissiveIntensity=n*1.6;}
function libUpdate(dt){for(const x of MIXERS){if(x.fn)x.fn(dt);x.mixer.update(dt);}}
function actionsFor(root,name){const g=LIBR[name];const mixer=new THREE.AnimationMixer(root);const A={};for(const c of g.animations){A[c.name]=mixer.clipAction(c);}return {mixer,A};}
function playA(o,name,fade){const a=o.A[name];if(!a||o.cur===a)return;a.reset().play();if(o.cur)o.cur.crossFadeTo(a,fade===undefined?.3:fade,false);o.cur=a;}
// ---------- the Hollow
function hollowModel(){const root=model('hollow');root.scale.setScalar(1.3);const g=new THREE.Group();g.add(root);const {mixer,A}=actionsFor(root,'hollow');
  for(const k of['lunge','scream','headsnap']){if(A[k]){A[k].setLoop(THREE.LoopOnce);A[k].clampWhenFinished=true;}}
  const bone=n=>root.getObjectByName(n)||new THREE.Object3D();const dum=()=>new THREE.Object3D();
  const m={g,root,mixer,A,cur:null,model:true,head:bone('head'),jaw:dum(),hips:dum(),spine:dum(),chest:dum(),legL:dum(),legR:dum(),knL:dum(),knR:dum(),armL:{p:dum(),fore:dum(),f:[]},armR:{p:dum(),fore:dum(),f:[]},eyes:[],st:{snap:0,snapT:99,ph:0,jaw:0}};
  const eye=new THREE.Sprite(new THREE.SpriteMaterial({map:T.dot,color:0xff2a14,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.5}));eye.scale.set(.22,.22,1);
  for(const sx of[-1,1]){const e=eye.clone();e.material=eye.material.clone();e.position.set(sx*.083,.24,.23);m.head.add(e);m.eyes.push(e);}
  m.jawB=root.getObjectByName('jaw');m.bones={};for(const n of['thighL','thighR','shinL','shinR','chest','spine2','pelvis'])m.bones[n]=root.getObjectByName(n);
  playA(m,'idle',0);return m;}
const _qx=new THREE.Quaternion(),_ax=new V3(1,0,0);
function addX(b,a){if(b){_qx.setFromAxisAngle(_ax,a);b.quaternion.multiply(_qx);}}
function poseHollowModel(m,dt,o){const k=o.crawl||0,amp=o.amp||0;let want='idle';
  if(o.jitter)want='frozen';else if(k>.5)want='crawl';else if(amp>0)want=(o.reach||0)<-.9?'lunge':'walk';
  playA(m,want,want==='frozen'?.1:.3);if(m.A.walk)m.A.walk.timeScale=Math.max(.6,amp*1.1);m.mixer.update(dt);
  const jt=o.jaw!==undefined?o.jaw:(k>.4?1:.12);m.st.jaw=lerp(m.st.jaw,jt,.14);addX(m.jawB,-m.st.jaw*.95-(m.st.jaw>.5?Math.sin(performance.now()*.05)*.06:0));
  if(m.sit){const B=m.bones;addX(B.thighL,1.45);addX(B.thighR,1.45);addX(B.shinL,-1.55);addX(B.shinR,-1.55);addX(B.chest,.35);addX(B.spine2,.25);m.root.position.y=-1.35;}
  if(o.jitter&&Math.random()<.5){m.head.rotation.z+=(Math.random()-.5)*.5;m.head.rotation.x+=(Math.random()-.5)*.3;}}
function ghostModel(){const m=hollowModel();playA(m,'frozen',0);MIXERS.push({mixer:m.mixer});return m.g;}
// ---------- people
function personModel(name){const root=model(name);const g=new THREE.Group();g.add(root);const {mixer,A}=actionsFor(root,name);
  const bone=n=>root.getObjectByName(n)||new THREE.Object3D();const dum=()=>new THREE.Object3D();let mat0=null;
  root.traverse(x=>{if(x.isSkinnedMesh||x.isMesh){x.frustumCulled=false;if(!mat0)mat0=Array.isArray(x.material)?x.material[0]:x.material;}});
  if(name==='ruth')root.traverse(x=>{if(x.isMesh){const ms=Array.isArray(x.material)?x.material:[x.material];ms.forEach(mm=>{mm.transparent=true;mm.opacity=.55;mm.depthWrite=false;mm.emissive=new THREE.Color(0x303840);});}});
  const p={g,root,mixer,A,cur:null,model:true,head:bone('head'),eyes:[dum(),dum()],material:mat0,hips:dum(),spine:dum(),chest:dum(),shL:dum(),shR:dum(),elL:dum(),elR:dum(),hdL:dum(),hdR:dum(),hipL:dum(),hipR:dum(),knL:dum(),knR:dum(),st:{ph:0,hunch:0}};
  if(name==='ruth')p.material={set opacity(v){root.traverse(x=>{if(x.isMesh){const ms=Array.isArray(x.material)?x.material:[x.material];ms.forEach(mm=>mm.opacity=v);}});},get opacity(){return .5;}};
  playA(p,'idle',0);if(A.idle)A.idle.time=Math.random()*3;return p;}
function animPersonModel(p,dt,spd,o){const want=spd>.2?'walk':(o.armR?'talk':(o.headZ?'stand':'idle'));playA(p,want,.35);if(p.A.walk)p.A.walk.timeScale=clamp(spd/1.15,.6,2.2);
  p.mixer.update(dt);if(o.look)p.head.rotation.y+=clamp(o.look,-1.1,1.1)*.8;if(o.headZ)p.head.rotation.z+=o.headZ*.6;}
// ---------- cars
function carModel(name,opts){opts=opts||{};const root=model(name);const g=new THREE.Group();root.rotation.y=Math.PI;root.scale.x=-1;g.add(root);const inner=new THREE.Group();inner.add(new THREE.Object3D());g.add(inner);
  const wheels=['wheel_FL','wheel_FR','wheel_RL','wheel_RR'].map(n=>root.getObjectByName(n)).filter(Boolean);const steer=root.getObjectByName('steering')||new THREE.Object3D();const sq0=steer.quaternion.clone(),_qy=new THREE.Quaternion(),_ay=new V3(0,1,0);
  const wheelProxy={rotation:{set x(v){_qy.setFromAxisAngle(_ay,v);steer.quaternion.copy(sq0).multiply(_qy);},get x(){return 0;}}};
  root.traverse(x=>{if(x.isMesh){const mm=x.material;if((mm.name||'').startsWith('glass')){x.material=mm.clone();x.material.transparent=true;x.material.opacity=opts.glassOpacity||.35;x.material.depthWrite=false;x.castShadow=false;}}});
  const hl=findMesh(root,'headlight'),tl=findMesh(root,'taillight');const hm=hl?hl.material:new THREE.MeshStandardMaterial(),tm=tl?tl.material:new THREE.MeshStandardMaterial();
  if(hl){hl.material=hm.clone();hl.material.emissive=new THREE.Color(0xfff0c8);}if(tl){tl.material=tm.clone();tl.material.emissive=new THREE.Color(0xff2010);}
  steer.traverse(x=>{if(x.isMesh)x.material=new THREE.MeshStandardMaterial({color:0x141414,roughness:.55,metalness:.2});});const seats=findMesh(root,'seat');
  const H={material:hl?hl.material:hm},TT={material:tl?tl.material:tm};
  return {g,inner,wheels,heads:[H,H],tails:[TT,TT],wheel:wheelProxy,dashGlow:{material:new THREE.MeshStandardMaterial()},paint:null,model:true,seats};}
// ---------- animals
function crowModel(){const root=model('crow');const g=new THREE.Group();g.add(root);const ax=actionsFor(root,'crow');const c={g,wings:[new THREE.Object3D(),new THREE.Object3D()],...ax,cur:null};playA(c,'idle',0);
  MIXERS.push({mixer:c.mixer,fn:()=>playA(c,c.state==='fly'?'fly':'idle',.15)});return c;}
function catModel(){const root=model('cat');const g=new THREE.Group();g.add(root);const ax=actionsFor(root,'cat');const c={g,head:new THREE.Object3D(),legs:[0,0,0,0].map(()=>new THREE.Object3D()),tail:new THREE.Object3D(),...ax,cur:null,last:new V3()};
  playA(c,'idle',0);MIXERS.push({mixer:c.mixer,fn:dt=>{const d=g.position.distanceTo(c.last);c.last.copy(g.position);playA(c,d/Math.max(dt,.001)>.2?'walk':'idle',.2);}});return c;}
// ---------- first person
function fpPart(n){const o=model('fp:'+n);const w=new THREE.Group();o.rotation.y=Math.PI;w.add(o);w.traverse(m=>{if(m.isMesh){m.castShadow=false;m.renderOrder=5;}});return w;}
// ---------- nature (instanced from the Blender models)
function NATURE_PINES(){const pts=[];let tries=0;while(pts.length<560&&tries<24000){tries++;const x=lerp(B.x0-22,B.x1+22,rand()),z=lerp(B.z0-22,B.z1+22,rand());
    const o=edgeOut(x,z);const woods=(x<-14)||(z>24&&x<30)||(x>8&&x<27&&z>8)||(z<-20&&x<26);if(o<-2&&!woods&&rand()<.85)continue;
    if(!clearSpot(x,z,1.5))continue;if(pts.some(p=>Math.abs(p[0]-x)<2.2&&Math.abs(p[1]-z)<2.2))continue;pts.push([x,z,.75+rand()*.7,rand()*6,rand()<.4]);}
  const inB=p=>p[0]>B.x0-4&&p[0]<B.x1+4&&p[1]>B.z0-4&&p[1]<B.z1+4;
  for(const [nm,flag,near] of[['nature:pine',false,true],['nature:pine_b',true,true],['nature:pine',false,false],['nature:pine_b',true,false]]){const sel=pts.filter(p=>p[4]===flag&&inB(p)===near);
    instanced(nm,sel.length,(i,m)=>{const [x,z,s,r]=sel[i];m.compose(new V3(x,heightAt(x,z),z),new THREE.Quaternion().setFromAxisAngle(new V3(0,1,0),r),new V3(s,s*(.9+((i*7)%5)*.05),s));},{noShadow:!near});}
  for(const [x,z,s] of pts)if(edgeOut(x,z)<1)addCircle(x,z,.4*s);}
function NATURE_GRASS(){const n=2400;const ps=[];let tries=0;while(ps.length<n&&tries<24000){tries++;const x=lerp(B.x0,B.x1,rand()),z=lerp(B.z0,B.z1,rand());if(!clearSpot(x,z,-.8))continue;ps.push([x,z,.8+rand()*1.3,rand()*6]);}
  instanced('nature:grass',ps.length,(i,m)=>{const [x,z,s,r]=ps[i];m.compose(new V3(x,0,z),new THREE.Quaternion().setFromAxisAngle(new V3(0,1,0),r),new V3(s,s,s));},{wind:.3,noShadow:true});}
function NATURE_AUTUMN(spots){const A=spots.filter((_,i)=>i%2===0),Bb=spots.filter((_,i)=>i%2===1);
  for(const [nm,list] of[['nature:autumn_a',A],['nature:autumn_b',Bb]])instanced(nm,list.length,(i,m)=>{const [x,z]=list[i];const s=.8+((i*13)%7)*.06;m.compose(new V3(x,0,z),new THREE.Quaternion().setFromAxisAngle(new V3(0,1,0),i*2.3),new V3(s,s,s));});
  for(const [x,z] of spots){addCircle(x,z,.35);blob(x,z,4.5);autumnLeafSpots.push([x,z,AUTUMN[(rand()*AUTUMN.length)|0]]);}}
function NATURE_SET(nm,n,fn){const ps=[];let tries=0;while(ps.length<n&&tries<6000){tries++;const r=fn();if(r)ps.push(r);}
  instanced(nm,ps.length,(i,m)=>{const [x,z,s,r,y]=ps[i];m.compose(new V3(x,y||0,z),new THREE.Quaternion().setFromAxisAngle(new V3(0,1,0),r),new V3(s,s,s));});return ps;}
const SWAPS=[];
function runSwaps(){for(const [g,n,o] of SWAPS){if(typeof n==='function'){if(HAS(o))n(g);}else swapIn(g,n,o);}
  if(HAS('fence')&&fenceDefs.length)instanced('fence',fenceDefs.length,(i,m)=>{const [x1,z1,x2,z2]=fenceDefs[i];const dx=x2-x1,dz=z2-z1,L=Math.hypot(dx,dz);
    m.compose(new V3(x1,0,z1),new THREE.Quaternion().setFromAxisAngle(new V3(0,1,0),Math.atan2(-dz,dx)),new V3(L/2,1,1));});}
function CORN_MODEL(){const pts=[];for(let x=CORN.x0+.4;x<CORN.x1;x+=.85)for(let z=CORN.z0+.4;z<CORN.z1;z+=.75){if(Math.abs(x+.5)<.9&&z<20)continue;if(rand()<.06)continue;pts.push([x+(rand()-.5)*.3,z+(rand()-.5)*.3,.85+rand()*.35,rand()*6]);}
  instanced('nature:corn',pts.length,(i,m)=>{const [x,z,s,r]=pts[i];m.compose(new V3(x,0,z),new THREE.Quaternion().setFromAxisAngle(new V3(0,1,0),r),new V3(s,s*(.9+(i%5)*.06),s));},{wind:.05});}
function NATURE_ROCKS(){for(let k=0;k<3;k++)NATURE_SET('nature:rock_'+k,17,()=>{const x=lerp(B.x0,B.x1,rand()),z=lerp(B.z0,B.z1,rand());if(!clearSpot(x,z,1.5))return null;const s=.45+rand()*.9;if(s>.8)addCircle(x,z,s*.5);return [x,z,s,rand()*6,s*.12];});}
function NATURE_BUSH(){NATURE_SET('nature:bush',140,()=>{const x=lerp(B.x0,B.x1,rand()),z=lerp(B.z0,B.z1,rand());if(!clearSpot(x,z,.5))return null;return [x,z,.55+rand()*.6,rand()*6,-.05];});}
function altarEm(g,em,keep){if(!HAS('altar'))return em;for(const c of g.children)if(!keep.includes(c))c.visible=false;const am=model('altar');g.add(am);const rm=findMesh(am,'window');if(!rm)return em;
  const i=NIGHT_MATS.indexOf(rm.material);if(i>=0)NIGHT_MATS.splice(i,1);rm.material=rm.material.clone();rm.material.emissive=new THREE.Color(0xff8a30);rm.material.emissiveIntensity=0;return rm.material;}
function LTEX(k,old){const im=window.LIBTEX&&LIBTEX[k];if(!im)return old;const t=new THREE.Texture(im);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.copy(old.repeat);t.encoding=THREE.sRGBEncoding;t.anisotropy=MAXANI;t.needsUpdate=true;return t;}
