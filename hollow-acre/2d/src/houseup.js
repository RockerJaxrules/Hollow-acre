/* ================= house upgrades: Grandpa's place starts as a small run-down shack, and Nell Hartley rebuilds it in four steps:
   mends it, builds it out into the two-storey cabin, adds a kitchen, lays a stone hearth. You order at her counter, pay, and she
   works on it for a few days (scaffolding goes up round the cabin); the morning it's done, the cabin is different inside and out. ================= */
S.house=S.house||{tier:0,build:null,v:2};
const HOUSE_TIERS=[null,
  {name:'Mend the shack',cost:200,need:{wood:50,stone:20},days:2,ext:'cabin_s1',shell:'room_cabin0m',
   desc:'Nell patches the roof with new cedar shingles, takes the boards off the windows and glazes them, rehangs the door, lays new floorboards and puts up paper. No more bucket under the leak. +20 max energy, and the cabin settles your mind twice as fast.',
   done:'Nell’s finished. The roof doesn’t leak, the windows open, the door shuts. It’s still small. For the first time it smells like someone lives in it.'},
  {name:'Build it out',cost:450,need:{wood:120,stone:40},days:3,ext:'cabin_t1',shell:'room_cabin1',
   desc:'Nell takes the shack back to its frame and builds it out into a proper two-storey cabin with a porch: a room half again as big, a loft above, room for the furniture you make.',
   done:'Nell’s built it out. A porch, a loft, a room you can turn round in. She stands back from it a long time. “That’s how it looked,” she says, “before.”'},
  {name:'Build a kitchen',cost:500,need:{wood:120,iron_bar:4},days:3,ext:'cabin_t2',shell:'room_cabin2',
   desc:'Nell knocks out the east wall and builds on a kitchen: a counter and a sink with a pump. Cooking at home burns no fuel, and every dish comes out as two.',
   done:'The kitchen’s done. The pump handle squeaks. The water that comes up is warm, which Nell says is impossible, and then doesn’t say anything else.'},
  {name:'Lay a stone hearth',cost:800,need:{stone:100,wood:40,copper_bar:4},days:3,ext:'cabin_t3',shell:'room_cabin2',
   desc:'A real fireplace with a stone chimney. Sleep by it and you wake with full health and a quiet mind; it lights the cabin all night.',
   done:'The hearth is laid. Nell lit the first fire herself and sat watching it a long time. “Keep it going in October,” she says. “All of October.”'}];
const houseTier=()=>S.house&&S.house.tier||0;

// ---- the outside: swap the cabin's sprite, widen its walls when the kitchen goes on, and move the porch pumpkins out to the new corners
const HCAB={bld:null,rect:null,pumps:[]};
// found the first time it's needed: the world is built after every script has loaded
function hcab(){if(HCAB.bld)return HCAB.bld;HCAB.bld=HOUSES.find(h=>h.e.spr==='cabin'||/^cabin_t/.test(h.e.spr))||null;if(HCAB.bld){const h=HCAB.bld,f=SPR.cabin.foot;
  HCAB.rect=rects.find(r=>Math.abs(r.x0-(h.x+f[0]+.1))<1e-6&&Math.abs(r.x1-(h.x+f[2]-.1))<1e-6&&Math.abs(r.z1-(h.z-.15))<1e-6)||null;
  for(const o of OBJ)if(/^(pumpkin|pumpkin_b|jack)$/.test(o.spr)&&Math.abs(Math.abs(o.x-h.x)-2.4)<.01&&Math.abs(o.z-(h.z+.55))<.01)HCAB.pumps.push({o,c:circles.find(c=>c.x===o.x&&c.z===o.z),x0:o.x});}
  return HCAB.bld;}
function houseExterior(t){const h=hcab();if(!h)return;const spr=t?HOUSE_TIERS[t].ext:(SPR.cabin_s0?'cabin_s0':'cabin'),m=SPR[spr];if(!m)return;h.e.spr=spr;h.e.night=SPR[spr+'_n']?spr+'_n':null;h.w=m.bw||6;
  const f=m.foot||[-(m.bw||6)/2,-3.3,(m.bw||6)/2,0];if(HCAB.rect){HCAB.rect.x0=h.x+f[0]+.1;HCAB.rect.x1=h.x+f[2]-.1;}
  const half=(m.bw||6)/2;for(const p of HCAB.pumps){const s=Math.sign(p.x0-h.x);p.o.x=h.x+s*(half-.6);if(p.c)p.c.x=p.o.x;}
  // the barrels, the woodpile and the two bushes by the walls step out of the way of the wider cabin (with their collision)
  if(!HCAB.side){HCAB.side=[];for(const o of OBJ){if(o.hide||o.room||o===h.e||o.kind==='bin')continue;const ax=Math.abs(o.x-h.x);if(ax>2.8&&ax<5&&o.z>h.z-1.8&&o.z<h.z+.1&&/^(barrel|firewood|bush_|crate|sacks)/.test(o.spr)){
    HCAB.side.push({o,x0:o.x,cs:circles.filter(c=>Math.hypot(c.x-o.x,c.z-o.z)<.6).map(c=>({c,x0:c.x})),rs:rects.filter(r=>Math.abs((r.x0+r.x1)/2-o.x)<.9&&Math.abs((r.z0+r.z1)/2-o.z)<.7).map(r=>({r,a:r.x0,b:r.x1}))});}}}
  const push=(m.bw||6)>6?1:0;for(const q of HCAB.side){const dx=Math.sign(q.x0-h.x)*push;q.o.x=q.x0+dx;for(const c of q.cs)c.c.x=c.x0+dx;for(const r of q.rs){r.r.x0=r.a+dx;r.r.x1=r.b+dx;}}}

// ---- the inside: a new room shell (paper, then the wider kitchen room), and the cabin's own furniture rebuilt to match
const CABIN_BASE=ROOMS.cabin.furn.map(q=>q.slice());
function cabinFurn(t){if(t<=1)return smallFurn(t);let f=CABIN_BASE.map(q=>q.slice());
  if(t>=3)f.push(['in_kcounter',10.2,1.05,[-1.19,-.55,1.19,0]],['sacks',11.3,5.3,[-.5,-.3,.5,0]]);
  if(t>=4){f=f.filter(q=>q[0]!=='in_shelf_books'&&q[0]!=='in_clock');f.push(['in_hearth',3.3,.85,[-.9,-.4,.9,0]],['in_clock',11.68,.55,[-.3,-.3,.3,0]]);}
  return f;}
function roomWalls(R){const x0=R.ox,z0=R.oz,x1=x0+R.w,z1=z0+R.d;
  return [[x0-3,z0-4,x1+3,z0+.3],[x0-3,z0-4,x0+.12,z1+3],[x1-.12,z0-4,x1+3,z1+3],[x0-3,z1,x0+R.door-.62,z1+3],[x0+R.door+.62,z1,x1+3,z1+3],[x0-3,z1+.5,x1+3,z1+3]];}
const sameRect=(r,a)=>Math.abs(r.x0-Math.min(a[0],a[2]))<1e-6&&Math.abs(r.z0-Math.min(a[1],a[3]))<1e-6&&Math.abs(r.x1-Math.max(a[0],a[2]))<1e-6&&Math.abs(r.z1-Math.max(a[1],a[3]))<1e-6;
function dropRect(a){const i=rects.findIndex(r=>sameRect(r,a));if(i>=0)rects.splice(i,1);}
function rebuildCabin(t){const R=ROOMS.cabin;
  // take down the old walls and Grandpa's furniture (never the pieces you placed yourself)
  for(const a of roomWalls(R))dropRect(a);
  for(const [spr,lx,lz,f] of R.furn){const x=R.ox+lx,z=R.oz+lz;const o=OBJ.find(o=>!o.hide&&o.room==='cabin'&&!o.furnKey&&o.spr===spr&&Math.abs(o.x-x)<1e-6&&Math.abs(o.z-z)<1e-6);
    if(o)o.hide=true;if(f)dropRect([x+f[0],z+f[1],x+f[2],z+f[3]]);}
  R.shell=t>=3?'room_cabin2':t>=2?'room_cabin1':t>=1?'room_cabin0m':'room_cabin0';const m=SPR[R.shell||'room_cabin'];R.w=m.room.w;R.d=m.room.d;R.door=m.room.door;R.furn=cabinFurn(t);
  for(const a of roomWalls(R))addRect(...a);
  for(const [spr,lx,lz,f,kind] of R.furn){const o=obj(spr,R.ox+lx,R.oz+lz,{kind:kind||'furn',night:SPR[spr+'_n']?spr+'_n':null,room:'cabin'});if(f)addRect(o.x+f[0],o.z+f[1],o.x+f[2],o.z+f[3]);}}
function houseApply(){const t=houseTier();houseExterior(t);if(t!==HCAB.built){rebuildCabin(t);HCAB.built=t;houseFit(t);}}

// ---- what each step does for you
{const _u=update;update=function(dt){_u(dt);if(houseTier()>=1&&S.room==='cabin'&&S.mode==='play')M.v=Math.min(100,M.v+.25*dt);};}
{const _cook=vendors.cook.rows;vendors.cook.rows=()=>_cook().map(r=>{if(houseTier()<3)return r;const b=r.buy;
  return Object.assign(r,{need:{},desc:String(r.desc||'').replace(/ Burns [^.]*\./,'')+' Nell’s kitchen: no fuel, and it makes two.',buy(){b.apply(this,arguments);if(ITEMS[r.k])addInv(r.k);}});});}
{const _il=interiorLight;interiorLight=function(L){_il(L);if(houseTier()>=4&&S.room==='cabin'){const R=ROOMS.cabin,t=performance.now()/1000;const fl=.85+.1*Math.sin(t*7)+.05*Math.sin(t*13);
  glowAt(sx(R.ox+3.3),sz(R.oz+.85)-20,150*fl,[255,150,60],Math.max(.35,L)*.9);glowAt(sx(R.ox+3.3),sz(R.oz+.85)-14,40,[255,210,120],.9);}};}

// ---- ordering it: at Nell's counter in Hartley Carpentry, or from the Farm Plans (board by the field or Nell's "Look"), which sends her the order
function houseRow(where){const t=houseTier(),B=S.house.build;
  if(B){const T=HOUSE_TIERS[B.tier];const left=Math.max(0,B.done-S.day);return {k:'house',name:`Cabin: ${T.name.toLowerCase()}`,desc:`Nell’s working on it. ${left<=1?'Done tomorrow morning.':`Done in ${left} days.`}`,price:0,can:false,btn:'Building',why:'Nell’s already building it. One job at a time.'};}
  if(t>=4)return {k:'house',name:'The cabin',desc:'“That’s as good as I can make it,” Nell says. “Better than it was. Better than he ever let me.”',price:0,can:false,btn:'Done',why:'The cabin is finished.'};
  const T=HOUSE_TIERS[t+1];return {k:'house',name:`Cabin: ${T.name.toLowerCase()}`,desc:`${where==='plans'?'Nell Hartley builds it (Hartley Carpentry on Market Lane, just east of the crossroads).':''}${T.desc} Takes ${T.days} days.`,price:T.cost,need:T.need,can:true,btn:'Order',
    buy(){S.house.build={tier:t+1,done:S.day+T.days};toast(where==='plans'?'You pin the order to the board. By evening Nell has taken it: “Morning, then. Don’t mind the hammering.”':'Nell writes it in her book. “I’ll start in the morning. Don’t mind the hammering.”',3);}};}
{const _carp=vendors.v_carp.rows;vendors.v_carp.rows=()=>{const r=_carp();r.splice(1,0,houseRow('carp'));return r;};}
{const _pl=vendors.plans.rows;vendors.plans.rows=()=>{const r=_pl();r.unshift(houseRow('plans'));return r;};}
if(typeof CRAFT_ICON!=='undefined')CRAFT_ICON.house='lumber';

// ---- building days: scaffolding round the cabin; the morning it's finished, the change and Nell's note
{const _nd=newDay;newDay=function(m,p){_nd(m,p);const B=S.house.build;if(!B)return;
  if(S.day>=B.done){S.house.tier=B.tier;S.house.build=null;if(B.tier===1){S.energyMax+=20;S.energy=Math.min(S.energyMax,S.energy+20);}houseApply();
    setTimeout(()=>openNote(`<h3>${HOUSE_TIERS[B.tier].name}</h3><p>${HOUSE_TIERS[B.tier].done}</p>`),900);}
  else setTimeout(()=>toast('Hammering from the roof. Nell’s been here since dawn.',2.4),1200);};}
// a good night by the hearth
{const _nd2=newDay;newDay=function(m,p){_nd2(m,p);if(houseTier()>=4){S.hp=S.hpMax;M.v=100;}};}
// the scaffold: poles, two plank decks, braces and a ladder, as wide as the cabin is going to be
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);const B=S.house&&S.house.build;if(!B||S.room||!hcab())return;const h=HCAB.bld;
  const half=(SPR[HOUSE_TIERS[B.tier].ext].bw||6)/2+.35;D.push({z:h.z+.05,mind:1,draw(){const X0=Math.round(sx(h.x-half)),X1=Math.round(sx(h.x+half)),Y=Math.round(sz(h.z+.05)),H=Math.round(4.6*PPM);
    const WDc=['#24180f','#5c3f29','#7d5636','#9e7146','#bf9361'];const n=Math.max(3,Math.round((X1-X0)/52));const px=[];for(let i=0;i<=n;i++)px.push(Math.round(X0+(X1-X0)*i/n));
    for(const x of px){ctx2.fillStyle=WDc[0];ctx2.fillRect(x-2,Y-H,5,H);ctx2.fillStyle=WDc[2];ctx2.fillRect(x-1,Y-H,3,H);ctx2.fillStyle=WDc[3];ctx2.fillRect(x-1,Y-H,1,H);}
    for(const lv of [.36,.72]){const y=Math.round(Y-H*lv);ctx2.fillStyle=WDc[0];ctx2.fillRect(X0-4,y-1,X1-X0+8,6);ctx2.fillStyle=WDc[3];ctx2.fillRect(X0-3,y,X1-X0+6,4);ctx2.fillStyle=WDc[4];ctx2.fillRect(X0-3,y,X1-X0+6,1);
      for(let x=X0;x<X1;x+=18){ctx2.fillStyle=WDc[1];ctx2.fillRect(x,y,1,4);}}
    ctx2.fillStyle=WDc[1];for(let i=0;i<px.length-1;i++){const a=px[i],b=px[i+1],y0=Math.round(Y-H*.36),y1=Math.round(Y-H*.72);for(let s=0;s<=1;s+=1/Math.max(1,(b-a))){ctx2.fillRect(Math.round(a+(b-a)*s),Math.round(i%2?y0+(y1-y0)*s:y1+(y0-y1)*s),1,1);}}
    const lx=X1+6;ctx2.fillStyle=WDc[1];ctx2.fillRect(lx,Y-Math.round(H*.74),2,Math.round(H*.74));ctx2.fillRect(lx+9,Y-Math.round(H*.74),2,Math.round(H*.74));ctx2.fillStyle=WDc[3];for(let y=Y-6;y>Y-H*.74;y-=7)ctx2.fillRect(lx,y,11,2);}});};}
// put everything back when a save is loaded
{const _lg=loadGame;loadGame=function(d){_lg(d);S.house=S.house||{tier:0,build:null,v:2};houseMigrate();houseApply();};}

// ---- a greyed-out button says what's missing instead of doing nothing. It's swapped for a copy with no purchase on it, so nothing can be bought by accident.
{const css=document.createElement('style');css.textContent='#shopRows button.nope{opacity:.55;filter:grayscale(.5);cursor:help}';document.head.appendChild(css);}
function whyNot(r){const out=[];if(r.need)for(const [k,n] of Object.entries(r.need)){const h=inv(k);if(h<n)out.push(`${n-h} more ${((ITEMS[k]||{name:k}).name).toLowerCase()}`);}
  if(r.price&&S.coins<r.price)out.push(`${r.price-S.coins} more coins`);
  if(out.length)return 'You need '+(out.length>1?out.slice(0,-1).join(', ')+' and '+out[out.length-1]:out[0])+'.';
  return r.why||String(r.desc||'Not right now.').replace(/<[^>]+>/g,'');}
renderShop=(function(prev){return function(){prev();const rows=vendors[shopV].rows();const els=[...$('shopRows').children];
  rows.forEach((r,i)=>{const b=els[i]&&els[i].querySelector('button');if(!b||!b.disabled)return;const nb=b.cloneNode(true);nb.disabled=false;nb.classList.add('nope');
    nb.addEventListener('click',()=>{SFX.deny&&SFX.deny();toast(whyNot(r),2.8);});b.replaceWith(nb);});};})(renderShop);

// ================= the small house: the shack you find, and the shack mended =================
// one room, six metres square: Grandpa's bed, his desk, the stove, a table and a chair, the cellar hatch and a barrel
function smallFurn(t){const f=[['in_bed',1.3,2.6,[-.85,-2.1,.85,0]],['in_desk',3.2,.95,[-.88,-.45,.88,0]],['in_stove',4.9,.95,[-.68,-.5,.68,0]],['in_mirror',2.3,-.45,null,'flat'],
    ['in_table',4.2,3.4,[-.85,-.45,.85,0]],['in_chair',5.55,3.45,[-.3,-.25,.3,0]],['in_cellar',1.2,5.4,null,'flat'],['barrel',5.4,5.2,[-.4,-.3,.4,0]]];
  if(t>=1)f.push(['in_rug',2.9,4.0,null,'flat'],['in_clock',5.65,1.9,[-.3,-.3,.3,0]]);return f;}
// older saves had the big cabin from the start: their steps move up one (mended -> built out, and so on); a fresh start is the shack
function houseMigrate(){const h=S.house;if(!h||h.v===2)return;if(h.tier>=1)h.tier+=1;if(h.build)h.build.tier+=1;h.v=2;}
// the desk, the mirror and the stove are where Grandpa's things stand in each room
const CAB_IT=(()=>{const R=ROOMS.cabin,f=(lx,lz)=>interact.find(i=>Math.abs(i.x-(R.ox+lx))<.01&&Math.abs(i.z-(R.oz+lz))<.01);
  return {desk:f(5.85,1.4),mirror:f(8.45,.3),mirror2:f(8.45,.5),stove:f(7.9,1.4)};})();
const CAB_AT={small:{desk:[3.2,1.4],mirror:[2.3,.3],mirror2:[2.3,.5],stove:[4.9,1.4]},big:{desk:[5.85,1.4],mirror:[8.45,.3],mirror2:[8.45,.5],stove:[7.9,1.4]}};
let BUCKET=null;
function houseFit(t){const R=ROOMS.cabin,at=CAB_AT[t<=1?'small':'big'];
  for(const k in CAB_IT){const it=CAB_IT[k];if(!it)continue;it.x=R.ox+at[k][0];it.z=R.oz+at[k][1];}
  // the bucket under the leak stands in the shack's floor until the roof is mended
  if(BUCKET){const i=rects.indexOf(BUCKET);if(i>=0)rects.splice(i,1);BUCKET=null;}
  if(t===0){addRect(R.ox+3.45,R.oz+2.05,R.ox+3.95,R.oz+2.35);BUCKET=rects[rects.length-1];}
  // anything you set down that the smaller room can't hold goes back in your bag
  if(t<=1&&S.furnPlaced&&S.furnPlaced.length){let n=0;
    for(let i=S.furnPlaced.length-1;i>=0;i--){const p=S.furnPlaced[i],lx=p.x-R.ox,lz=p.z-R.oz;if(lx>.3&&lx<R.w-.3&&lz>.3&&lz<R.d-.1)continue;
      const o=OBJ.find(o=>o.room==='cabin'&&!o.hide&&o.furnKey===p.k&&Math.abs(o.x-p.x)<1e-6&&Math.abs(o.z-p.z)<1e-6);if(o)o.hide=true;
      const ff=typeof furnFoot==='function'?furnFoot(p.k,p.rot):[1,.5];const r=rects.findIndex(r=>Math.abs(r.x0-(p.x-ff[0]/2))<1e-6&&Math.abs(r.x1-(p.x+ff[0]/2))<1e-6);if(r>=0)rects.splice(r,1);
      const it=interact.findIndex(q=>Math.abs(q.x-p.x)<1e-6&&Math.abs(q.z-(p.z-.25))<1e-6);if(it>=0)interact.splice(it,1);
      S.furnPlaced.splice(i,1);S.furnBag.push(p.k);n++;}
    if(n)setTimeout(()=>toast(`The shack is too small for ${n>1?'some of your furniture':'one of your pieces'}. It’s back in your bag.`,3),1500);}}
// the house is set up as soon as the farm is: a fresh game starts in the shack
{const _bb=benchesBoot;benchesBoot=function(){_bb.apply(this,arguments);try{houseMigrate();houseApply();}catch(e){}};}
// the leak: a drop every second or so from the bad patch in the roof into the bucket, and a small sound when it lands
const LEAK={t:0,drops:[]};
{const _lu=lifeUpdate;lifeUpdate=function(dt){_lu(dt);if(S.room!=='cabin'||houseTier()!==0){LEAK.drops.length=0;return;}
  LEAK.t-=dt;if(LEAK.t<=0){LEAK.t=.9+Math.random()*1.1;LEAK.drops.push({h:96,v:0});}
  for(let i=LEAK.drops.length-1;i>=0;i--){const d=LEAK.drops[i];if(d.h>0){d.v+=dt*420;d.h-=d.v*dt;if(d.h<=0){d.h=0;d.ring=0;if(typeof A!=='undefined'&&A.ok)A.tone(1700+Math.random()*300,.05,'sine',.025,{slide:1200});}}
    else{d.ring+=dt;if(d.ring>.45)LEAK.drops.splice(i,1);}}};}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);if(S.room!=='cabin'||houseTier()!==0)return;const R=ROOMS.cabin,x=R.ox+3.7,z=R.oz+2.3;
  D.push({z:z+.01,mind:1,draw(){const X=Math.round(sx(x)),Y=Math.round(sz(z))-9;
    for(const d of LEAK.drops){if(d.h>0){ctx2.fillStyle='rgba(170,200,230,.85)';ctx2.fillRect(X,Math.round(Y-d.h),1,3);}
      else{const k=d.ring/.45;ctx2.strokeStyle=`rgba(200,225,250,${.7*(1-k)})`;ctx2.lineWidth=1;ctx2.beginPath();ctx2.ellipse(X+.5,Y+1.5,1+k*4,.5+k*1.4,0,0,Math.PI*2);ctx2.stroke();}}}});};}
