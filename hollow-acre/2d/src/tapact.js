/* ================= using things, the Stardew way. Pick a tool (or seeds) on the toolbar, then click or tap the spot you want to use it
   on. Nothing ever switches tools for you.
     Left click · tap · Space · C   use what you're holding on that spot (from the keyboard: the spot in front of you)
     Right click · X                interact: talk, open, read, harvest, sleep, shop. Tapping a person, door or sign does this too.
   If the spot is out of reach you walk over first. Dragging still walks you like before. ================= */
const TAP={auto:null,mark:null,mouse:null,hint:0,quiet:false};
const tSay=(m,t)=>{if(!TAP.quiet)toast(m,t);};const tDeny=()=>{if(!TAP.quiet)SFX.deny&&SFX.deny();};
const fineP=()=>matchMedia('(pointer:fine)').matches;
const screenToWorld=(cx,cy)=>{const r=view.getBoundingClientRect();const X=(cx-r.left)*VW/r.width,Y=(cy-r.top)*VH/r.height;return [(X+cam.px-(VW>>1))/PPM,(Y+cam.pz-Math.round(VH*.56))/PPM];};
// ---- what you're holding, and what a thing needs
function heldKind(){const it=selectedItem();if(!it)return 'hand';if(it.type==='T')return it.id;if(it.type==='S')return 'seed';if(it.key==='I:fert')return 'fert';if(it.food)return 'food';return 'item';}
const TOOL_NAME={hoe:'hoe',can:'watering can',pick:'pickaxe',axe:'axe',rod:'fishing rod',seed:'seeds',fert:'bone meal'};
// read from the action's own name, so things added later (new stumps, regrown rocks) are understood too
function labelNeed(L){L=String(L||'');
  if(/^Chop\b/.test(L))return 'axe';if(/^(Break|Mine)\b/.test(L))return 'pick';if(/^(Fish|Cast!|Hook it!|Waiting)/.test(L))return 'rod';
  if(/^Till\b/.test(L))return 'hoe';if(/^(Water\b|Can empty)/.test(L))return 'can';if(/^(Plant\b|No seeds)/.test(L))return 'seed';if(/^Bone meal/.test(L))return 'fert';if(/^Growing/.test(L))return 'info';return null;}
function toolNeed(it){let L='';try{L=typeof it.label==='function'?it.label():it.label;}catch(e){}return labelNeed(L);}
// ---- "hold your axe": the right toolbar slot blinks, and a short hint says which key
function slotOf(kind){for(let i=0;i<12;i++){const it=itemInfo(S.slots[i]);if(!it)continue;
    if(kind==='seed'?(it.type==='S'&&it.qty>0):kind==='fert'?it.key==='I:fert':it.key==='T:'+kind)return i;}return -1;}
const slotKey=i=>i<9?String(i+1):i===9?'0':i===10?'-':'=';
function needHint(kind,why){if(TAP.quiet)return;SFX.deny&&SFX.deny();const i=slotOf(kind);const n=slotsVisible();
  if(i>=0&&i<n){const b=$('hotbar')&&$('hotbar').children[i];if(b){b.classList.remove('hint');void b.offsetWidth;b.classList.add('hint');clearTimeout(b._ht);b._ht=setTimeout(()=>b.classList.remove('hint'),1700);}}
  const now=performance.now();if(now-TAP.hint<1100)return;TAP.hint=now;
  const where=i<0?(kind==='seed'?' You have no seeds. Caitlyn sells them.':kind==='fert'?' Make bone meal at the farming bench.':''):i<n?(fineP()?` Press <b>${slotKey(i)}</b>.`:' It’s blinking on your toolbar.'):' It’s in your backpack: drag it to the top row.';
  toast(`${why?why+' ':''}Hold your <b>${TOOL_NAME[kind]}</b>.${where}`,2.2);}
// ---- the targets: what is under the cursor or finger
function debrisItem(o){return interact.find(q=>q.x===o.x&&q.z===o.z&&(!q.on||q.on()));}
function tileAtW(wx,wz){for(const t of tiles){if(!!t.gh!==(S.room==='greenhouse'))continue;if(Math.abs(t.x-wx)<.5&&Math.abs(t.z-wz)<.5)return t;}return null;}
function tapTarget(wx,wz){
  if(S.room==='mine'&&typeof MINE!=='undefined'){
    for(const m of MINE.mobs||[])if(!m.dead&&Math.hypot(m.x-wx,(m.z-.3)-wz)<.7)return {kind:'mob',m,x:m.x,z:m.z,r:.9};
    const L=MINE.ladder;if(L&&!L.hide&&Math.hypot(L.x-wx,L.z-wz)<.7)return {kind:'ladder',x:L.x,z:L.z,r:.7};
    let bo=null,bd=.62;for(const o of MINE.ores||[]){if(o.hide)continue;const d=Math.hypot(o.x-wx,(o.z-.2)-wz);if(d<bd){bd=d;bo=o;}}if(bo)return {kind:'ore',o:bo,x:bo.x,z:bo.z,r:.85};}
  let best=null,bd=1e9;for(const it of interact){if(it.on&&!it.on())continue;if(it.npc!==undefined&&npcs[it.npc]){it.x=npcs[it.npc].x;it.z=npcs[it.npc].z;}
    if(!isFinite(it.x)||!isFinite(it.z))continue;const up=(it.z-.3)-wz;const d=Math.hypot(it.x-wx,up>0?up*.55:up);if(d<Math.max(.75,(it.r||1)*.6)&&d<bd){bd=d;best=it;}}
  // a hoe, can or seeds over a free tile works that tile: a stone or weed on the next tile (its tap box reaches up over its sprite)
  // used to win the tap, and you had to break it before you could till beside it
  if(best&&['hoe','can','seed','fert'].includes(heldKind())){const tt=tileAtW(wx,wz);if(tt&&!(tt.debris&&!tt.debris.hide)&&!(Math.abs(best.x-tt.x)<.5&&Math.abs(best.z-tt.z)<.5))best=null;}
  if(best)return {kind:'item',it:best,x:best.x,z:best.z,r:Math.min(1.1,(best.r||1)*.8),reach:(best.r||1)+.3};
  const t=tileAtW(wx,wz);if(t){if(t.debris&&!t.debris.hide){const q=debrisItem(t.debris);if(q)return {kind:'item',it:q,x:q.x,z:q.z,r:.8};}return {kind:'tile',t,x:t.x,z:t.z,r:.85};}
  if(!S.room&&typeof waterAt==='function'&&waterAt(wx,wz)){// stand on the nearest dry ground between you and where you clicked
    let x=wx,z=wz;const dx=P.x-wx,dz=P.z-wz,d=Math.hypot(dx,dz)||1;for(let s=0;s<d;s+=.25){x=wx+dx/d*s;z=wz+dz/d*s;if(!waterAt(x,z))break;}
    return {kind:'water',x:wx,z:wz,sx:x,sz:z,r:.6};}
  return null;}
// the same, but for the spot in front of you (keyboard and the touch Use button)
function frontTarget(){
  if(S.room==='mine'){const m=typeof mobAhead==='function'&&mobAhead();if(m)return {kind:'mob',m,x:m.x,z:m.z};const o=typeof mineTarget==='function'&&mineTarget();if(o)return {kind:'ore',o,x:o.x,z:o.z};}
  // the spot your tool lands on: just in front of your feet. Whatever is closest to that spot gets hit, like Stardew's facing square.
  const fx=P.x+P.fx*.85,fz=P.z+P.fz*.85+.1;const ft=tileAtW(fx,fz);
  if(ft&&ft.debris&&!ft.debris.hide){const q=debrisItem(ft.debris);if(q)return {kind:'item',it:q,x:q.x,z:q.z};}
  let best=null,bd=1e9;for(const it of interact){if(it.on&&!it.on())continue;const need=toolNeed(it);if(!need||need==='info')continue;
    const d=Math.hypot(fx-it.x,fz-it.z),lim=Math.max(.55,(it.r||1)*.5);if(d<lim&&d<bd){bd=d;best=it;}}
  if(best)return {kind:'item',it:best,x:best.x,z:best.z};
  const t=targetTile();if(t)return {kind:'tile',t,x:t.x,z:t.z};
  if(!S.room&&typeof waterAhead==='function'){const w=waterAhead();if(w)return {kind:'water',x:w[0],z:w[1],sx:P.x,sz:P.z};}
  return null;}
// ---- doing it
function faceAt(x,z){const dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz)||1;P.fx=dx/d;P.fz=dz/d;P.dir=dirOf(dx,dz);}
function waterSoil(t){if(!spend(1))return;startAnim('water',1.1,t,()=>{if(!t.tilled||S.water<=0)return;S.water--;t.wet=true;S.everWatered=true;SFX.water&&SFX.water();
  for(let i=0;i<14;i++)parts.push({x:t.x+(Math.random()-.5)*.5,z:t.z+(Math.random()-.5)*.3,y:.8,vx:0,vz:0,vy:-1-Math.random(),t:0,life:.4,col:'#9cc8e8',size:1});
  if(S.water===0)toast('The can is empty. Refill it at the well, or dip it in the pond.',2.2);});}
function untill(t){if(!spend(1))return;startAnim('pick',.55,t,()=>{if(t.crop)return;t.tilled=false;t.wet=false;SFX.thud&&SFX.thud(0,.25);burst(t.x,t.z,8,'#6a4a30',1.2,.5,2);});}
function boneMeal(t){takeInv('fert');t.crop.growth=(t.crop.stage+1)*SEEDS[t.crop.type].grow;t.crop.stage++;burst(t.x,t.z,10,'#e8e0cc',1,.6,2);SFX.plant();}
function tileUse(t,kind,mode){const c=t.crop;faceAt(t.x,t.z);
  if(c&&c.stage>=3){doHarvest(t);return true;}
  if(mode==='interact'){if(c)toast(`${SEEDS[c.type].name}: ${c.watered?'watered today':'needs water'}, ${Math.floor(c.growth/(SEEDS[c.type].grow*3)*100)}% grown.`,1.6);return false;}
  if(kind==='hoe'){if(t.tilled||c)return false;doTill(t);return true;}
  if(kind==='can'){if(!t.tilled&&!c){tSay('Water tilled soil or crops.',1.2);return false;}if(S.water<=0){tDeny();tSay('The can is empty. Refill it at the well, or dip it in the pond.',2);return false;}
    if(c){if(c.watered)return false;doWater(t);return true;}tSay('Nothing’s growing there yet. Plant something, then water it.',1.6);return false;}
  if(kind==='seed'){const it=selectedItem();if(c)return false;if(!t.tilled){needHint('hoe','Till the soil first.');return false;}if(!it||it.qty<=0){tSay('Out of those seeds. Caitlyn sells more.',1.6);return false;}S.sel=it.id;doPlant(t);return true;}
  if(kind==='fert'){if(!c){tSay('Bone meal goes on a growing crop.',1.4);return false;}boneMeal(t);return true;}
  if(kind==='pick'){if(t.tilled&&!c){untill(t);return true;}return false;}
  // holding something that doesn't work here: say what would
  if(!t.tilled&&!c)needHint('hoe','This soil needs tilling.');else if(!c)needHint('seed','Ready to plant.');else if(!c.watered)needHint('can','This needs water.');
  else tSay(`${SEEDS[c.type].name}: ${Math.floor(c.growth/(SEEDS[c.type].grow*3)*100)}% grown.`,1.2);return false;}
function itemUse(it,kind,mode){const need=toolNeed(it);faceAt(it.x,it.z);
  if(need&&need!=='info'&&kind!==need){needHint(need,{axe:'That needs an axe.',pick:'That needs a pickaxe.',rod:'To fish here,',hoe:'',can:'',seed:'',fert:''}[need]);return false;}
  if(it.ok&&!it.ok()){tDeny();return false;}it.act();return true;}
function waterUse(T,kind){faceAt(T.x,T.z);
  if(kind==='rod'){if(fish.state==='off'){const w=waterAhead();if(!w){toast('Stand at the edge and face the water.',1.4);return false;}}fishAct();return true;}
  if(kind==='can'){if(S.water>=S.waterMax){toast('The can is already full.',1);return false;}startAnim('plant',.55,null,()=>{S.water=S.waterMax;SFX.refill&&SFX.refill();burst(T.x,T.z,8,'#9fc0e0',1,.5,2);toast('You dip the can. Full. The water is very cold.',1.6);});return true;}
  needHint('rod','To fish,');return false;}
function oreUse(o,kind){faceAt(o.x,o.z);if(kind!=='pick'){needHint('pick','Ore needs a pickaxe.');return false;}const c=computeContext();if(c&&c.label==='Mine'&&c.act){c.act();return true;}return false;}
function mobUse(m){faceAt(m.x,m.z);const c=computeContext();if(c&&/Strike|Shove/.test(c.label||'')&&c.act){c.act();return true;}return false;}
function ladderUse(){const c=computeContext();if(c&&c.label==='Climb down'&&c.act){c.act();return true;}return false;}
// one entry point: a target, and whether this is a tool use or an interaction
function useOn(T,mode){if(!T)return false;const kind=heldKind();
  if(T.kind==='tile')return tileUse(T.t,kind,mode);
  if(T.kind==='item'){const need=toolNeed(T.it);
    // tapping or left-clicking a person, a door or a sign just uses it, whatever you're holding
    if(mode==='interact'&&need&&need!=='info'&&kind!==need){faceAt(T.x,T.z);needHint(need,{axe:'That needs an axe.',pick:'That needs a pickaxe.',rod:'To fish here,'}[need]||'');return false;}
    return itemUse(T.it,kind,mode);}
  if(T.kind==='water')return waterUse(T,kind);
  if(T.kind==='ore')return oreUse(T.o,kind);
  if(T.kind==='mob')return mobUse(T.m);
  if(T.kind==='ladder')return ladderUse();
  return false;}
const busy=()=>S.mode!=='play'||S.paused||P.anim||(typeof MG!=='undefined'&&MG.on)||(typeof PLACE!=='undefined'&&PLACE.on);
// while a line is out, any use goes to the rod: cast, reel in, strike
const fishing=()=>typeof fish!=='undefined'&&fish.state!=='off';
// the stones: using the right tool on the spot does it too (the rod on the dock's cord, the axe on the hollow tree, the pickaxe at your bed)
function storyToolAt(){const k=heldKind();for(const it of interact){if(!it.tool||it.tool!==k)continue;if(it.toolOn?!it.toolOn():(it.on&&!it.on()))continue;if(Math.hypot(P.x-it.x,P.z-it.z)<it.r+.3)return it;}return null;}
function useFront(){A.init&&A.init();if(typeof PLACE!=='undefined'&&PLACE.on){placeConfirm();return;}if(busy())return;if(fishing()){fishAct();return;}
  {const si=storyToolAt();if(si){si.act();return;}}
  const T=frontTarget();if(T){useOn(T,'tool');return;}
  // nothing to use a tool on: if you're facing someone or a door, use that instead
  interactFront(true);}
function interactFront(quiet){A.init&&A.init();if(typeof PLACE!=='undefined'&&PLACE.on){placeConfirm();return;}if(busy())return;if(fishing()){fishAct();return;}
  const c=computeContext();const need=labelNeed(c.label);
  if(!need||need==='info'){if(c.ok&&c.act)c.act();else if(c.label&&!quiet)SFX.deny&&SFX.deny();return;}
  const T=frontTarget();if(T&&T.kind==='tile'){tileUse(T.t,heldKind(),'interact');return;}
  if(heldKind()===need&&c.act){c.act();return;}if(!quiet)needHint(need,'');}
// ---- walking over first when it's out of reach
function tapDo(T){TAP.mark=null;if(busy())return;if(fishing()&&T.mode==='tool'){fishAct();return;}useOn(T,T.mode);}
// is there water within casting reach, looking toward where you clicked?
function waterNear(T){const dx=T.x-P.x,dz=T.z-P.z,d=Math.hypot(dx,dz)||1;for(const k of [.9,1.4,1.9,2.4]){if(waterAt(P.x+dx/d*k,P.z+dz/d*k))return true;}return false;}
function tapGo(T){const sxp=T.sx!=null?T.sx:T.x,szp=T.sz!=null?T.sz:T.z;const dx=P.x-sxp,dz=P.z-szp,d=Math.hypot(dx,dz);
  if(T.kind==='water'){if(waterNear(T)){tapDo(T);return;}TAP.auto={x:T.sx,z:T.sz,T,t:0};TAP.mark={x:T.x,z:T.z,t:0};return;}
  const reach=T.reach||T.r+.35;if(d<=reach){tapDo(T);return;}
  // (#281) a square of soil: stand on whichever side of it is free (a stone or stump beside it used to sit right where you walked
  // to, so you pushed against it and gave up)
  let gx,gz;if(T.kind==='tile'){const st=tapStand(T.t);if(st){gx=st.x;gz=st.z;}}
  // stand just short of it, on the side you're coming from
  if(gx==null){const k=(T.r)/(d||1);gx=T.x+dx*k;gz=T.z+dz*k;}
  // (#281) and find a way there round the stones, stumps and fences in between, instead of pushing straight into the first one
  const path=T.kind==='mob'?null:tapRoute(P.x,P.z,gx,gz);
  TAP.auto=path&&path.length>1?{x:path[0][0],z:path[0][1],path,T,t:0}:{x:gx,z:gz,T,t:0};TAP.mark={x:T.x,z:T.z,t:0};}
// a small route search over just the ground between you and where you're going (quarter-pace squares)
function tapRoute(x0,z0,x1,z1){const c=.25,R=.31,m=2.5;const bx0=Math.min(x0,x1)-m,bz0=Math.min(z0,z1)-m,bx1=Math.max(x0,x1)+m,bz1=Math.max(z0,z1)+m;
  const W=Math.ceil((bx1-bx0)/c),H=Math.ceil((bz1-bz0)/c);if(W*H>60000)return null;const g=new Uint8Array(W*H);
  const box=(ax,az,cx2,cz2,fn)=>{const i0=Math.max(0,Math.floor((ax-bx0)/c)),i1=Math.min(W-1,Math.floor((cx2-bx0)/c)),j0=Math.max(0,Math.floor((az-bz0)/c)),j1=Math.min(H-1,Math.floor((cz2-bz0)/c));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){if(g[j*W+i])continue;const x=bx0+(i+.5)*c,z=bz0+(j+.5)*c;if(fn(x,z))g[j*W+i]=1;}};
  for(const q of circles){const r=q.r+R;if(q.x+r<bx0||q.x-r>bx1||q.z+r<bz0||q.z-r>bz1)continue;box(q.x-r,q.z-r,q.x+r,q.z+r,(x,z)=>Math.hypot(x-q.x,z-q.z)<r);}
  for(const q of rects){if(q.x1+R<bx0||q.x0-R>bx1||q.z1+R<bz0||q.z0-R>bz1)continue;box(q.x0-R,q.z0-R,q.x1+R,q.z1+R,(x,z)=>Math.hypot(x-clamp(x,q.x0,q.x1),z-clamp(z,q.z0,q.z1))<R);}
  for(const q of segs){const r=(q.r||.15)+R;if(Math.max(q.x1,q.x2)+r<bx0||Math.min(q.x1,q.x2)-r>bx1||Math.max(q.z1,q.z2)+r<bz0||Math.min(q.z1,q.z2)-r>bz1)continue;
    box(Math.min(q.x1,q.x2)-r,Math.min(q.z1,q.z2)-r,Math.max(q.x1,q.x2)+r,Math.max(q.z1,q.z2)+r,(x,z)=>{const dx=q.x2-q.x1,dz=q.z2-q.z1,L=dx*dx+dz*dz||1;const t=clamp(((x-q.x1)*dx+(z-q.z1)*dz)/L,0,1);return Math.hypot(x-(q.x1+dx*t),z-(q.z1+dz*t))<r;});}
  if(!S.room&&typeof waterAt==='function')for(let j=0;j<H;j++)for(let i=0;i<W;i++){if(!g[j*W+i]&&waterAt(bx0+(i+.5)*c,bz0+(j+.5)*c))g[j*W+i]=1;}
  const cell=(x,z)=>[clamp(Math.floor((x-bx0)/c),0,W-1),clamp(Math.floor((z-bz0)/c),0,H-1)];const free=(i,j)=>i>=0&&j>=0&&i<W&&j<H&&!g[j*W+i];
  const near=([i,j])=>{if(free(i,j))return [i,j];for(let r=1;r<6;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;if(free(i+di,j+dj))return [i+di,j+dj];}return null;};
  const s0=near(cell(x0,z0)),e0=near(cell(x1,z1));if(!s0||!e0)return null;const S0=s0[1]*W+s0[0],E0=e0[1]*W+e0[0];
  const line=(a,b)=>{const n=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]))*2||1;for(let k=0;k<=n;k++){if(!free(Math.round(a[0]+(b[0]-a[0])*k/n),Math.round(a[1]+(b[1]-a[1])*k/n)))return false;}return true;};
  if(line(s0,e0))return [[x1,z1]];
  const N=W*H,gs=new Float32Array(N).fill(1e9),from=new Int32Array(N).fill(-1),done=new Uint8Array(N),heap=[];
  const push=(k,f)=>{heap.push([f,k]);let i=heap.length-1;while(i>0){const q=(i-1)>>1;if(heap[q][0]<=heap[i][0])break;[heap[q],heap[i]]=[heap[i],heap[q]];i=q;}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=i*2+1,r=l+1;let mm=i;if(l<heap.length&&heap[l][0]<heap[mm][0])mm=l;if(r<heap.length&&heap[r][0]<heap[mm][0])mm=r;if(mm===i)break;[heap[mm],heap[i]]=[heap[i],heap[mm]];i=mm;}}return top;};
  const hh=(i,j)=>{const a=Math.abs(i-e0[0]),b=Math.abs(j-e0[1]);return Math.max(a,b)+.414*Math.min(a,b);};
  gs[S0]=0;push(S0,hh(...s0));let ok=false,it=0;
  while(heap.length&&it++<40000){const [,k]=pop();if(done[k])continue;done[k]=1;if(k===E0){ok=true;break;}const i=k%W,j=(k/W)|0;
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=i+di,nj=j+dj;if(!free(ni,nj))continue;if(di&&dj&&(!free(i+di,j)||!free(i,j+dj)))continue;
      const nk=nj*W+ni;if(done[nk])continue;const ng=gs[k]+(di&&dj?1.414:1);if(ng<gs[nk]){gs[nk]=ng;from[nk]=k;push(nk,ng+hh(ni,nj));}}}
  if(!ok)return null;const cells=[];for(let k=E0;k!==-1;k=from[k])cells.push([k%W,(k/W)|0]);cells.reverse();
  const out=[];let a=cells[0];for(let k=1;k<cells.length;k++){if(!line(a,cells[k])){a=cells[k-1];out.push([bx0+(a[0]+.5)*c,bz0+(a[1]+.5)*c]);}}
  out.push([x1,z1]);return out;}
function tapStand(t){const C=[[0,-.78],[0,.78],[-.78,0],[.78,0],[-.62,-.62],[.62,-.62],[-.62,.62],[.62,.62]];let best=null,bd=1e9;
  for(const [ox,oz] of C){const q={x:t.x+ox,z:t.z+oz};try{collide(q,.3);}catch(e){}if(Math.hypot(q.x-(t.x+ox),q.z-(t.z+oz))>.08)continue;
    if(!S.room&&typeof waterAt==='function'&&waterAt(q.x,q.z))continue;
    // a little extra for the corners, and for a spot whose straight way in runs into something
    let d=Math.hypot(q.x-P.x,q.z-P.z)+(ox&&oz?.3:0);const L=Math.hypot(q.x-P.x,q.z-P.z)||1;
    for(const c of circles){const u=Math.max(0,Math.min(1,((c.x-P.x)*(q.x-P.x)+(c.z-P.z)*(q.z-P.z))/(L*L)));if(Math.hypot(P.x+(q.x-P.x)*u-c.x,P.z+(q.z-P.z)*u-c.z)<c.r+.25&&Math.hypot(c.x-P.x,c.z-P.z)>c.r+.3){d+=1.5;break;}}
    if(d<bd){bd=d;best=q;}}
  return best;}
{const _mi=mindInput;mindInput=function(mx,mz){const a=TAP.auto;if(a){if(Math.hypot(mx,mz)>.15||S.paused||S.mode!=='play'||P.anim){if(Math.hypot(mx,mz)>.15)TAP.auto=null;}
    else{a.t+=1/60;if(a.T.kind==='mob'){a.x=a.T.m.x;a.z=a.T.m.z;}if(a.path&&a.path.length>1&&Math.hypot(a.x-P.x,a.z-P.z)<.3){a.path.shift();a.x=a.path[0][0];a.z=a.path[0][1];a.lp=null;}const dx=a.x-P.x,dz=a.z-P.z,d=Math.hypot(dx,dz);
      // stuck against something? (a fence, the pond's edge)
      if(!a.lp||a.t-a.lt>.5){const mv=a.lp?Math.hypot(P.x-a.lp[0],P.z-a.lp[1]):1;a.lp=[P.x,P.z];a.lt=a.t;if(mv<.05&&a.t>.6)a.stuck=1;}
      const dT=Math.hypot(P.x-a.T.x,P.z-a.T.z);const reach=a.T.reach||a.T.r+.3;const near=a.T.kind==='water'?(d<.35||waterNear(a.T)):((d<.22&&!(a.path&&a.path.length>1))||dT<reach||(a.T.kind==='tile'&&a.t>1.2&&dT<1.35&&a.lp&&Math.hypot(P.x-a.lp[0],P.z-a.lp[1])<.12));
      if(near||a.t>7||a.stuck){TAP.auto=null;if(near||dT<(a.T.reach||a.T.r)+(a.T.kind==='item'&&a.stuck?1.3:.6))tapDo(a.T);else{TAP.mark=null;if(a.stuck)tSay('Can’t get there from here.',1);}}
      else{const k=Math.min(1,d*1.6)*.82;return _mi(dx/d*k,dz/d*k);}}}return _mi(mx,mz);};}
// a little ring where you clicked
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);const m=TAP.mark;if(!m)return;m.t+=1/60;if(m.t>.9&&!TAP.auto){TAP.mark=null;return;}
  D.push({z:m.z-.5,mind:1,draw(){const X=sx(m.x),Y=sz(m.z)+2,k=(Math.sin(m.t*8)+1)/2;ctx2.strokeStyle=`rgba(255,230,140,${.5+k*.4})`;ctx2.lineWidth=2;ctx2.beginPath();ctx2.ellipse(X,Y,10+k*3,4+k,0,0,Math.PI*2);ctx2.stroke();}});};}
// ---- the square your tool will hit: under the mouse on a computer, in front of you on a phone. Bright when it's in reach.
const TILE_TOOLS=new Set(['hoe','can','seed','fert','pick']);
{const _cc=computeContext;computeContext=function(){const c=_cc.apply(this,arguments);let h=null,col=null;
  if(S.mode==='play'&&!S.paused&&!(typeof PLACE!=='undefined'&&PLACE.on)&&TILE_TOOLS.has(heldKind())){
    if(TAP.mouse&&fineP()){const [wx,wz]=screenToWorld(TAP.mouse.x,TAP.mouse.y);const t=tileAtW(wx,wz);if(t&&!(t.debris&&!t.debris.hide)){h=t;col=Math.hypot(t.x-P.x,t.z-.1-P.z)<1.6?'rgba(255,240,200,.9)':'rgba(255,240,200,.35)';}}
    else{const t=targetTile();if(t){h=t;col='rgba(255,240,200,.8)';}}}
  hlTile=h;TAP.hlCol=col;return c;};}
// ---- input
{let down=null;const onWorld=e=>e.target===view||(e.target&&e.target.id==='c');
  addEventListener('contextmenu',e=>{if(onWorld(e))e.preventDefault();});
  addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;if(!onWorld(e)){TAP.mouse=null;return;}TAP.mouse={x:e.clientX,y:e.clientY};},{passive:true});
  addEventListener('pointerleave',()=>{TAP.mouse=null;});
  addEventListener('pointerdown',e=>{if(!onWorld(e))return;if(PLACE&&PLACE.on)return;if(e.pointerType==='mouse'&&e.button!==0&&e.button!==2)return;A.init&&A.init();
    down={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId,btn:e.button};});
  addEventListener('pointerup',e=>{const d0=down;down=null;if(!d0||e.pointerId!==d0.id)return;if(PLACE&&PLACE.on)return;if(S.mode!=='play'||S.paused)return;
    if(Math.hypot(e.clientX-d0.x,e.clientY-d0.y)>14||performance.now()-d0.t>420)return;
    const right=e.pointerType==='mouse'&&d0.btn===2;
    if(fishing()&&!right){if(!P.anim)fishAct();return;}if(P.anim||(typeof MG!=='undefined'&&MG.on))return;
    const [wx,wz]=screenToWorld(e.clientX,e.clientY);const T=tapTarget(wx,wz);
    if(!T){if(!right&&TILE_TOOLS.has(heldKind())&&!S.room){faceAt(wx,wz);const now=performance.now();if(now-TAP.hint>4000){TAP.hint=now;toast('Use it on the field: the brown squares by the cabin.',1.6);}}return;}
    T.mode=right?'interact':(T.kind==='item'&&!toolNeed(T.it))?'interact':'tool';tapGo(T);});
  // the pointer shows what a click would do
  setInterval(()=>{if(!fineP()||!TAP.mouse||S.mode!=='play'||S.paused){if(view.style.cursor)view.style.cursor='';return;}
    const [wx,wz]=screenToWorld(TAP.mouse.x,TAP.mouse.y);const T=tapTarget(wx,wz);const cur=T&&(T.kind==='item'&&!toolNeed(T.it)||T.kind==='ladder')?'pointer':'';
    if(view.style.cursor!==cur)view.style.cursor=cur;const c=$('c');if(c&&c.style.cursor!==cur)c.style.cursor=cur;},120);}
// ---- keys, Stardew's layout: C or Space uses your tool, X interacts, E or Tab opens the menu
addEventListener('keydown',e=>{if(e.repeat||S.mode!=='play')return;const k=e.code;const tag=(e.target&&e.target.tagName)||'';if(/INPUT|TEXTAREA/.test(tag))return;
  if(k==='Space'||k==='KeyC'){e.preventDefault();useFront();}else if(k==='KeyX'){e.preventDefault();interactFront();}});
// hold the mouse button (or C / Space) and you keep working, one swing after another, like Stardew
{let held=null;addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0&&(e.target===view||(e.target&&e.target.id==='c')))held={x:e.clientX,y:e.clientY,t:performance.now()};});
  addEventListener('pointerup',()=>{held=null;});addEventListener('pointermove',e=>{if(held&&Math.hypot(e.clientX-held.x,e.clientY-held.y)>14)held=null;});
  setInterval(()=>{const kb=keys.Space||keys.KeyC;if(busy()||fishing()||TAP.auto)return;
    if(kb){const T=frontTarget();if(T){TAP.quiet=true;try{useOn(T,'tool');}finally{TAP.quiet=false;}}return;}
    if(held&&performance.now()-held.t>480&&TAP.mouse){const [wx,wz]=screenToWorld(TAP.mouse.x,TAP.mouse.y);const T=tapTarget(wx,wz);if(T&&T.kind!=='water'&&!(T.kind==='item'&&!toolNeed(T.it))&&Math.hypot(P.x-T.x,P.z-T.z)<T.r+.4){T.mode='tool';TAP.quiet=true;try{useOn(T,'tool');}finally{TAP.quiet=false;}}}},120);}
// ---- the old do-everything button is gone. On a phone there's a small Use button instead: it shows what you're holding and uses it
//      on the square in front of you (handy while you walk with the other thumb). It never picks a tool for you.
{const css=document.createElement('style');css.textContent=`
#btnAct{display:none!important}
#btnUse{width:var(--btn);height:var(--btn);padding:0;border-radius:0!important;background:var(--px-wood)!important;border:0!important;color:#f4e6c8;box-shadow:inset 0 0 0 3px var(--px-dark),inset 0 0 0 6px var(--px-wood2),inset 0 -10px 0 0 rgba(0,0,0,.25)!important;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;font-size:11px;line-height:1;position:relative}
#btnUse img{width:30px;height:30px;image-rendering:pixelated}#btnUse .n{position:absolute;right:5px;bottom:4px;font-size:10px;color:#f4e4c0;text-shadow:1px 1px 0 #000}
@media (pointer:fine){#btnUse{display:none!important}}
#hotbar .slot.hint{animation:slotHint .25s steps(2) 6}@keyframes slotHint{50%{box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 4px #ffe08a,inset 0 0 0 6px #f0a040,0 0 0 3px #ffe08a}}
#hotbar .slot.on{box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 4px #8a5a2a,inset 0 0 0 6px #5a3818!important}`;document.head.appendChild(css);
  const b=document.createElement('button');b.id='btnUse';b.className='btn';b.setAttribute('aria-label','Use what you are holding');b.innerHTML='<img alt=""><span class="l">Use</span><span class="n"></span>';
  $('buttons').appendChild(b);press(b,useFront);
  setInterval(()=>{const it=selectedItem();const im=b.querySelector('img');const src=it?iconOf(it.icon):'';if(im._src!==src){im._src=src;if(src)im.src=src;else im.removeAttribute('src');}
    {const _l=b.querySelector('.l'),_t=fishing()?(fish.state==='bite'?'Strike!':fish.state==='power'?'Cast':fish.state==='reel'?'Reel':'Wait…'):it?(it.type==='T'?'Use':it.type==='S'?'Plant':it.food?'Hold':'Use'):'Hand';if(_l.textContent!==_t)_l.textContent=_t;}
    {const _n=b.querySelector('.n'),_v=String(it&&it.id==='can'?S.water:'');if(_n.textContent!==_v)_n.textContent=_v;}},150);}  /* (t349) write only on change: the label was rewritten 7 times a second, which made the button blink on phones */
// seeds planted in soil you've already watered start the day watered
setInterval(()=>{for(const t of tiles)if(t.wet&&t.crop&&!t.crop.watered&&t.crop.stage<3)t.crop.watered=true;},250);
