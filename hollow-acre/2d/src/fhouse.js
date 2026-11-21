/* ================= #291/#292 a friend's cabin is a house that grows. Each cabin on Homestead Lane starts as a run-down shack
   (its owner's colour under the grime), and its owner orders the same steps from Nell Hartley as Grandpa's place: mend it,
   build it out, put a kitchen in, lay a hearth. Each step takes Nell a few days, and the morning it's done the cabin is bigger
   inside AND out. The cabins sit far enough apart on the lane for the biggest of them, and the bins stand clear of the widest
   walls. (Cabins built before this keep the mending they already had.) ================= */
const FHH_STEP=[{ext:'cabin_s0',shell:'room_cabin0'},{ext:'cabin_s1',shell:'room_cabin0m'},{ext:'cabin_t1',shell:'room_cabin1'},{ext:'cabin_t2',shell:'room_cabin2'},{ext:'cabin_t3',shell:'room_cabin2'}];
const FHH={rect:{},built:{}};
if(typeof WORLD_KEYS!=='undefined'&&!WORLD_KEYS.includes('fhh'))WORLD_KEYS.push('fhh');
const fhhS=()=>(S.fhh=S.fhh&&typeof S.fhh==='object'?S.fhh:{});
const fhhE=i=>{const A=fhhS();if(!A[i])A[i]={t:0,b:null};return A[i];};
const fhhTier=i=>Math.max(0,Math.min(4,(fhhE(i).t|0)));
// the owner's colour, on whichever cabin it is now (the boards of the bigger cabins are warm brown; they take the colour too)
async function fhhSprite(i,base){const key='fhh_'+i+'_'+base;if(SPR[key])return key;if(!SPR[base])return SPR.cabin_s1?'cabin_s1':'cabin';
  try{const need=[base,base+'_n'].map(k=>SPR[k]&&SPR[k].src).filter(s=>s&&!IMG[s]);if(need.length&&typeof loadImages==='function')await loadImages(need);}catch(e){}
  const P=FH_PAINT[i%FH_PAINT.length],warm=/^cabin_t/.test(base);
  for(const suf of ['','_n']){const m=SPR[base+suf];const im=m&&IMG[m.src];if(!im||!im.width)continue;
    const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);
    const d=g.getImageData(0,0,c.width,c.height),a=d.data;
    for(let p=0;p<a.length;p+=4){if(a[p+3]<8)continue;const [h,l,s]=mpHls(a[p],a[p+1],a[p+2]);let o=null;
      const wall=warm?(h>.04&&h<.13&&s>.28&&s<.75&&l>.34&&l<.72):(l>.36&&l<.82&&s<.3&&((h>.03&&h<.17)||s<.08));
      if(wall)o=mpRgb(P.wall[0],Math.min(.86,l*P.wall[2]*(warm?1.05:1)),P.wall[1]+(warm?s*.2:s*.4));
      else if(P.roof&&(warm?(h>.0&&h<.1&&l>.12&&l<.34&&s>.12):(l>.13&&l<.48&&s<.13&&h>.58&&h<.95)))o=mpRgb(P.roof[0],l*P.roof[2],P.roof[1]);
      // each cabin's own door: the green door painted its owner's door colour (navy, oxblood, mustard)
      if(!o&&h>.38&&h<.55&&s>.2&&l>.08&&l<.42){const D=[[.62,.55],[.98,.55],[.12,.62]][i%3];o=mpRgb(D[0],l*1.05,D[1]);}
      if(o){a[p]=o[0];a[p+1]=o[1];a[p+2]=o[2];}}
    g.putImageData(d,0,0);IMG['mem:'+key+suf]=c;SPR[key+suf]=Object.assign({},m,{src:'mem:'+key+suf});}
  return key;}
// what stands in the room at each size (the bed always where the sleep spot is)
function fhhFurn(t){const small=[['in_bed',1.3,2.6,[-.85,-2.1,.85,0]],['in_stove',4.9,.95,[-.68,-.5,.68,0]],['in_table',4.3,3.7,[-.85,-.45,.85,0]],['in_chair',3.2,3.75,[-.3,-.25,.3,0]],['barrel',5.3,5.2,[-.4,-.3,.4,0]]];
  if(t<=1)return t===0?small.filter(q=>q[0]!=='in_chair'):small;
  let f=[['in_bed',1.3,2.6,[-.85,-2.1,.85,0]],['in_shelf_books',3.2,.62,[-.8,-.4,.8,0]],['in_stove',7.9,.95,[-.68,-.5,.68,0]],['in_rug',4.4,4.0,null,'flat'],['in_table',6.3,3.5,[-.85,-.45,.85,0]],['in_chair',5.2,3.55,[-.3,-.25,.3,0]],['barrel',8.4,5.2,[-.4,-.3,.4,0]],['in_clock',4.6,.55,[-.3,-.3,.3,0]]];
  if(t>=3)f.push(['in_kcounter',10.2,1.05,[-1.19,-.55,1.19,0]],['sacks',11.3,5.3,[-.5,-.3,.5,0]]);
  if(t>=4){f=f.filter(q=>q[0]!=='in_shelf_books'&&q[0]!=='in_clock');f.push(['in_hearth',3.3,.85,[-.9,-.4,.9,0]],['in_clock',11.68,.55,[-.3,-.3,.3,0]]);}
  return f;}
function fhhRoom(i,t){const k='fcab'+i,R=ROOMS[k];if(!R)return;const shell=FHH_STEP[t].shell;if(FHH.built[i]===t&&R.shell===shell)return;
  for(const a of roomWalls(R))dropRect(a);
  for(const [spr,lx,lz,f] of R.furn||[]){const x=R.ox+lx,z=R.oz+lz;const o=OBJ.find(o=>!o.hide&&o.room===k&&!o.furnKey&&o.spr===spr&&Math.abs(o.x-x)<1e-6&&Math.abs(o.z-z)<1e-6);if(o)o.hide=true;if(f)dropRect([x+f[0],z+f[1],x+f[2],z+f[3]]);}
  R.shell=shell;const m=SPR[shell];if(m&&m.room){R.w=m.room.w;R.d=m.room.d;R.door=m.room.door;}R.furn=fhhFurn(t);
  for(const a of roomWalls(R))addRect(...a);
  for(const [spr,lx,lz,f,kind] of R.furn){if(!SPR[spr])continue;const o=obj(spr,R.ox+lx,R.oz+lz,{kind:kind||'furn',night:SPR[spr+'_n']?spr+'_n':null,room:k});if(f)addRect(o.x+f[0],o.z+f[1],o.x+f[2],o.z+f[3]);}
  FHH.built[i]=t;}
async function fhhApply(i){const e=MPC.objs[i];if(!e||!FH_SPOTS[i])return;const t=fhhTier(i),s=FH_SPOTS[i];
  const key=await fhhSprite(i,FHH_STEP[t].ext);const m=SPR[key];if(!m)return;e.spr=key;e.night=SPR[key+'_n']?key+'_n':null;
  const f=m.foot||[-2.3,-2.8,2.3,0];let R=FHH.rect[i];if(!R){R=rects.find(r=>Math.abs((r.x0+r.x1)/2-s.x)<.2&&r.z1<=s.z+.01&&r.z1>s.z-.5);FHH.rect[i]=R||null;}
  if(R){R.x0=s.x+f[0];R.x1=s.x+f[2];R.z0=s.z+f[1];R.z1=s.z+f[3]-.12;}
  const H=typeof HOUSES!=='undefined'&&HOUSES.find(h=>h.e===e);if(H)H.w=m.bw||4.6;
  try{fhhRoom(i,t);}catch(err){console.warn('cabin room',err);}if(typeof NAV!=='undefined')NAV.sig='';}
function fhhApplyAll(){for(const k of Object.keys(MPC.objs||{}))fhhApply(+k);}
{const _fp=fhPlace;fhPlace=async function(i){const had=!!MPC.placed[i];const r=await _fp.apply(this,arguments);if(!had){fhhE(i);await fhhApply(i);}return r;};}
// cabins already standing before this: they were mended when they went up, so they stay mended
{const _lg=loadGame;loadGame=function(d){const old=d&&d.S&&!d.S.fhh&&d.S.world&&d.S.world.slots;const r=_lg.apply(this,arguments);
  try{if(old){for(const k of Object.values(d.S.world.slots||{}))if(Number.isInteger(k)){const e=fhhE(k);if(!e.t)e.t=1;}}setTimeout(fhhApplyAll,0);}catch(e){}return r;};}
{const _wr=worldRebuild;worldRebuild=function(keys){const r=_wr.apply(this,arguments);try{if(!keys||keys.has('fhh'))fhhApplyAll();}catch(e){}return r;};}
// the bin stands clear of the widest walls the cabin will ever have

// ---- ordering at Nell's: your own cabin's next step
const fhhMine=()=>{try{const i=mySlot();return i>=0&&MPC.objs[i]?i:-1;}catch(e){return -1;}};
function fhhRow(where){const i=fhhMine();if(i<0)return null;const E=fhhE(i),t=fhhTier(i);
  if(E.b){const T=HOUSE_TIERS[E.b.tier];const left=Math.max(0,E.b.done-S.day);return {k:'fhh',name:`Your cabin: ${T.name.toLowerCase().replace('the shack','it')}`,desc:`Nell’s working on it. ${left<=1?'Done tomorrow morning.':`Done in ${left} days.`}`,price:0,can:false,btn:'Building',why:'Nell’s already building it.'};}
  if(t>=4)return {k:'fhh',name:'Your cabin',desc:'“As good as Grandpa Marsh’s,” Nell says. “Don’t tell him I said so.”',price:0,can:false,btn:'Done',why:'Your cabin is finished.'};
  const T=HOUSE_TIERS[t+1];const lines=['Your cabin on Homestead Lane is a shack: the roof leaks and the windows are boarded. Nell mends it.','Nell builds your cabin out: a room half again as big, a loft, a porch.','Nell puts a kitchen in your cabin: a counter and a cold store. It gets wider.','Nell lays a stone hearth in your cabin and raises a second storey over it.'];
  return {k:'fhh',name:`Your cabin: ${T.name.toLowerCase().replace('the shack','it')}`,desc:`${where==='plans'?'Nell Hartley builds it (Hartley Carpentry on Market Lane). ':''}${lines[t]} Takes ${T.days} days.`,price:T.cost,need:T.need,can:true,btn:'Order',
    buy(){fhhE(i).b={tier:t+1,done:S.day+T.days};toast('Nell writes it in her book under your name. “Homestead Lane. I’ll be there in the morning.”',3);}};}
{const _c=vendors.v_carp.rows;vendors.v_carp.rows=()=>{const r=_c();const x=fhhRow('carp');if(x)r.splice(1,0,x);return r;};}
if(vendors.plans){const _p=vendors.plans.rows;vendors.plans.rows=()=>{const r=_p();const x=fhhRow('plans');if(x)r.unshift(x);return r;};}
// Nell's days on the lane: the morning a job is done, the cabin is bigger inside and out
{const _nd=newDay;newDay=function(m,p){const r=_nd.apply(this,arguments);try{if(!(typeof HOST!=='undefined'&&HOST.role==='guest')){const A=fhhS();for(const [k,E] of Object.entries(A)){if(!E||!E.b||S.day<E.b.done)continue;E.t=E.b.tier;E.b=null;fhhApply(+k);
      const who=fhOwner(+k);if(who&&who===NAME())setTimeout(()=>openNote(`<h3>${HOUSE_TIERS[E.t].name}</h3><p>Nell’s finished your cabin. ${['','It doesn’t leak, and the windows open.','It’s a proper cabin now, with a loft and a porch.','There’s a kitchen in it now.','A hearth and a second storey. It’s a house.'][E.t]}</p>`),900);}}}catch(e){console.warn('cabins',e);}return r;};}
// ---- #292 Grandpa's house grows outside as it grows inside. Past the hearth the cabin's rooms went on growing (the big house's
// long front room, a dining room, an upstairs, an attic, a cellar) while the house outside stayed the same size. Now:
//   the big house       one more bay of the house, wall, windows up and down, roof, built on to the west of the door;
//   the dining room     another bay beyond it;
//   the upstairs        a dormer over the first new bay;  the attic   a dormer over the second (or a roof light, if there's no second);
//   the cellar          cellar doors on a slant at the front corner.
// The new bays are the house's own boards and windows, laid in at the same spacing, so it reads as one house. The door stays
// where it is; the barrels and sacks, the bush and the maple on that side step back out of the way.
const HXO={key:'',moved:new Map()};
const HXO_INS=120,HXO_BAY=86;
function hxoSig(t){const E=(S.house&&S.house.ext)||{};if(t<5)return '';return 'B'+(E.dining?'D':'')+(E.upstairs?'U':'')+(E.attic?'A':'')+(E.cellar?'C':'');}
function hxoCompose(sig,night){const base=SPR['cabin_t3'+(night?'_n':'')],im=base&&IMG[base.src];if(!im||!im.width)return null;
  const nb=sig.includes('D')?2:1,W0=base.fw,H0=base.fh,W=W0+nb*HXO_BAY,H=H0+16;
  const src=document.createElement('canvas');src.width=W0;src.height=H0;const sg=src.getContext('2d');sg.drawImage(im,base.sx||0,base.sy||0,W0,H0,0,0,W0,H0);
  const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const col=(sx,dx)=>g.drawImage(src,sx,0,1,H0,dx,0,1,H0);const EAVE=129;
  for(let x=0;x<HXO_INS;x++)col(x,x);
  for(let b=0;b<nb;b++){const x0=HXO_INS+b*HXO_BAY;
    for(let j=0;j<HXO_BAY;j++){g.drawImage(src,124+(j%48),0,1,EAVE,x0+j,0,1,EAVE);const s=j<48?205+j:181+((j-48)%22);g.drawImage(src,s,EAVE,1,H0-EAVE,x0+j,EAVE,1,H0-EAVE);}}
  for(let x=HXO_INS;x<W0;x++)col(x,x+nb*HXO_BAY);
  // added dormers go evenly between the two old ones (the west one at 99, the east one moved along with its half)
  const dormerAt=cx=>g.drawImage(src,80,78,38,42,Math.round(cx-19),78,38,42);
  {const add=(sig.includes('U')?1:0)+(sig.includes('A')?1:0),a=99,b=200+nb*HXO_BAY;for(let k=1;k<=add;k++)dormerAt(a+(b-a)*k/(add+1));}
  // the dining room's bay has a wide window of its own on the ground floor: two lights side by side
  if(nb>1){const bx=HXO_INS+29-18;g.drawImage(src,216,176,38,52,bx-16,176,38,52);g.drawImage(src,216,176,38,52,bx+16,176,38,52);}
  // the cellar doors: two plank doors on a slant out from the foot of the wall, iron straps, a stone cheek each side
  if(sig.includes('C')){const cx=114,y0=base.ay-3,hgt=14,wt=24,wb=34;const P=(a,b,w,h,cl)=>{g.fillStyle=cl;g.fillRect(a,b,w,h);};
    // the shadow where it meets the ground, the stone cheeks (triangles), then the sloping doors, narrow at the wall, wide at the ground
    P(cx-wb/2-5,y0+hgt,wb+10,3,'rgba(0,0,0,.4)');
    for(let r=0;r<=hgt;r++){const u=r/hgt,w=Math.round(wt+(wb-wt)*u),L=Math.round(cx-w/2),cw=Math.round(1+u*4);
      P(L-cw,y0+r,cw,1,r===0?'#9a9aa2':u>.85?'#3a3a42':'#5a5a62');P(L+w,y0+r,cw,1,r===0?'#8a8a92':u>.85?'#34343c':'#4e4e56');
      for(let x=0;x<w;x++){const v=(x/w);const seam=Math.abs(x-w/2)<.6;const plank=Math.round(v*6)!==Math.round((x+1)/w*6);
        P(L+x,y0+r,1,1,seam?'#1a1008':r===0?'#d8aa66':r<3?'#a8804c':plank?'#5a3c20':u>.7?'#7a5630':'#8c6638');}
      if(r===hgt)P(L,y0+r,w,1,'#2a1a0e');}
    P(cx-wt/2,y0-1,wt,1,'#1a1008');
    // iron straps running down each door, and the two pull rings by the seam
    for(const f of [-.3,.3])for(let r=1;r<hgt;r++){const u=r/hgt,w=wt+(wb-wt)*u;P(Math.round(cx+f*w),y0+r,2,1,r%3===0?'#7a7a84':'#3a3a42');}
    P(cx-3,y0+7,2,2,'#b8b8c0');P(cx+1,y0+7,2,2,'#b8b8c0');}
  return {c,W,H,ax:base.ax+nb*HXO_BAY,ay:base.ay,nb};}
function hxOutside(t){const h=hcab();if(!h)return;const sig=hxoSig(t);
  const back=()=>{for(const [o,v] of HXO.moved){o.x=v.x;for(const q of v.cs)q.c.x=q.x0;for(const q of v.rs){q.r.x0=q.a;q.r.x1=q.b;}}HXO.moved.clear();};
  if(!sig){if(HXO.key){back();HXO.key='';}return;}
  const key='cabin_x_'+sig;
  if(!SPR[key]){const d=hxoCompose(sig,false),n=hxoCompose(sig,true);if(!d)return;const m0=SPR.cabin_t3,ext=d.nb*HXO_BAY/(typeof PPM!=='undefined'?PPM:32);
    IMG['mem:'+key]=d.c;SPR[key]=Object.assign({},m0,{src:'mem:'+key,sx:0,sy:0,fw:d.W,fh:d.H,ax:d.ax,ay:d.ay,bw:(m0.bw||8)+ext,foot:[(m0.foot?m0.foot[0]:-4)-ext,-3.3,m0.foot?m0.foot[2]:4,0],ext});
    if(n){IMG['mem:'+key+'_n']=n.c;SPR[key+'_n']=Object.assign({},SPR[key],{src:'mem:'+key+'_n'});}}
  const m=SPR[key];h.e.spr=key;h.e.night=SPR[key+'_n']?key+'_n':null;h.w=m.bw;
  if(HCAB.rect){HCAB.rect.x0=h.x+m.foot[0]+.1;HCAB.rect.x1=h.x+m.foot[2]-.1;}
  // what stands where the house now is steps west by as much
  back();const ext=m.ext,L=h.x+m.foot[0]-.9;
  for(const o of OBJ){if(o.hide||o.room||o===h.e||o.kind==='bin'||o.kind==='bld'||o.flat||/^(leaves|mud|path|grass)/.test(o.spr||''))continue;
    if(o.x>h.x-2.6||o.x<L-.4||o.z<h.z-4.4||o.z>h.z+.25)continue;
    HXO.moved.set(o,{x:o.x,cs:circles.filter(c=>Math.hypot(c.x-o.x,c.z-o.z)<.7).map(c=>({c,x0:c.x})),rs:rects.filter(r=>Math.abs((r.x0+r.x1)/2-o.x)<.9&&Math.abs((r.z0+r.z1)/2-o.z)<.7&&r!==HCAB.rect).map(r=>({r,a:r.x0,b:r.x1}))});}
  for(const [o,v] of HXO.moved){o.x=v.x-ext;for(const q of v.cs)q.c.x=q.x0-ext;for(const q of v.rs){q.r.x0=q.a-ext;q.r.x1=q.b-ext;}}
  HXO.key=key;if(typeof NAV!=='undefined')NAV.sig='';}
{const _he=houseExterior;houseExterior=function(t){const r=_he.apply(this,arguments);try{hxOutside(t);}catch(e){console.warn('house outside',e);}return r;};}
// a room added in the night (Nell's last morning on a job) changes the outside too
setInterval(()=>{try{if(S.mode!=='play'||typeof houseTier!=='function')return;const t=houseTier();if(('cabin_x_'+hxoSig(t))!==(HXO.key||'cabin_x_'))houseExterior(t);}catch(e){}},2000);
