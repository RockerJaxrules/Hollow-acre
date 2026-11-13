/* ================= t335 the Low Fields: new land, a bigger map. The owner: "make new land to sell, not land that was already
   there (there may be story on it); make the map bigger and add a lot of new, empty land."
   - The valley runs on south past the old edge (z 290) to z 410. Below the Deep Corn's woods and the dam lies the Low Fields:
     flat bottomland the county emptied when the reservoir went in (1931) and sold to the bank, unfarmed since. Open meadow, a
     stream (the dam's spillway, running on south), a farm pond with the old windpump, a hedgerow and a windbreak, field stones
     and tall gold grass; woods closing it in at the west and east ends.
   - Ways in: Mill Road carries on south from the Deep Corn (it used to stop dead in the woods), and a dam road runs down from
     the reservoir's overlook. Bottom Road and South Road cross it east to west, with plank bridges over the stream, and two
     lanes run north to south. A county milestone stands at the Mill Road junction (known from the start: travel there from any
     other milestone).
   - Fifteen plots for sale, from a 140-square patch to a 1,536-square section, every one staked out with a FOR SALE sign,
     sold at the land office and on the bank's money like the old ones. The farm book shows them on their own map.
   - The old plots round the farm (the west meadow, the east paddock, the south acre, the long field, the bottom field) are off
     the market: no signs, no stakes, no rows at the land office. A plot you already own stays yours and works as before.
   - Nothing already in the world moves: the region is laid after everything else with its own dice, the old ground keeps its
     exact look above the old edge, and only trees standing in the two new roads are taken down (hidden, never removed from the
     list, so saves line up). ================= */
const L35={Z0:290,Z1:410,XW:-96,built:false,reg:{k:'low',name:'The Low Fields',x0:-310,x1:218,z0:290,z1:410},
  pond:{x:70,z:380,rx:6.5,rz:4},pump:{x:66.5,z:373.4},junction:{x:20,z:302},mile:{k:'low',name:'The Low Fields',x:15.4,z:299.2},
  roads:[[20,236,20,398,2.4],[118,255,127,302,1.6],[-62,302,196,302,2],[-62,354,196,354,1.8],[90,302,90,398,1.6],[170,302,170,398,1.6]],
  bridges:[],copses:[[-10,341,5],[-45,338,4],[128,343,4.5],[184,342,5],[2,389,4],[118,392,4.5]]};
// ---------------------------------------------------------------- the plots
const L35_PLOTS=[
  ['fenedge','The fen edge',-58,305,26,18,'Where the fen gives out and the ground firms up: black soil, wet in the spring, the best of it nearest the road.'],
  ['millforty','The Mill Road forty',-28,305,44,22,'The big piece west of Mill Road. Flat as a table; the old furrows still show under the grass when the sun is low.'],
  ['ash','Ash bottom',24,305,30,20,'Named for the ash trees that stood here before the flood clearance. Deep, sweet loam.'],
  ['hollow','The hollow piece',58,305,28,12,'A long shallow dip that holds the morning mist. Frost lies last here, and the soil is the darker for it.'],
  ['creekside','Creekside',94,305,40,16,'Along the stream from the dam. Never short of water; never quite dry underfoot, either.'],
  ['eastbank','The east bank',147,305,20,20,'Across the stream on the plank bridge. Square and sheltered, with the east woods at its back.'],
  ['farcorner','The far corner',174,305,22,24,'The last of the bank’s land before the east woods. Nobody has walked it in years.'],
  ['patch','The patch',58,322,14,10,'A small, cheap square by the lane: enough to start on.'],
  ['willow','The willow piece',94,326,24,14,'Where the willows were, below Creekside. Good bottom soil.'],
  ['lowerash','Lower Ash bottom',24,330,30,18,'The south half of the old ash ground, running down to the hedgerow.'],
  ['longacre','The long acre',-58,357,74,12,'Seventy-four paces of open ground along South Road. Enough to feed the valley, if anyone would let you.'],
  ['pondfield','Pond field',24,357,32,18,'Beside the farm pond and the old windpump. The pond never dries.'],
  ['bend','The bend',94,357,40,24,'Inside the stream’s long bend. The richest ground in the Low Fields, the bank says, and charges for it.'],
  ['southsection','The south section',147,357,48,32,'A full section east of the stream: more ground than Grandpa ever worked, all of it waiting.'],
  ['weststrip','The west strip',-58,374,30,9,'A narrow strip below the long acre, against the west woods.']];
const l35Price=n=>Math.round((n*5.2+350)/50)*50;
// the old plots: off the market (kept exactly as they are for anyone who already owns one)
for(const P of LAND_PARCELS){P.retired=true;if(P.kk==null)P.kk=LAND_PARCELS.indexOf(P);}
L35_PLOTS.forEach(([id,name,x0,z0,w,h,desc],i)=>{const P={id:'lf_'+id,name,x0,z0,w,h,price:l35Price(w*h),kk:20+i,low:true,bank:true,
  sign:[x0+2.2,z0<340?304.3:356.3],desc:`${desc} Out in the Low Fields, south down Mill Road past the Deep Corn.`};
  if(id==='patch'||id==='willow'||id==='lowerash')P.sign=[x0+2.2,z0-1.2];
  LAND_PARCELS.push(P);});
const l35Old=P=>P.retired&&!landOwns(P.id);
// the land office: the old plots aren't sold any more; with the free code there's no need of the bank's money
vendors.land.sub='Agnes Abernathy keeps the deeds in a tin box under the counter. The plots for sale now are all out in the Low Fields, south down Mill Road past the Deep Corn.';
{const _r=vendors.land.rows;vendors.land.rows=()=>_r().filter(q=>{if(!q)return false;const m=/^(land|mort)_(.+)$/.exec(String(q.k||''));if(!m)return true;
  const P=LAND_PARCELS.find(p=>p.id===m[2]);if(!P)return true;if(l35Old(P))return false;if(m[1]==='mort'&&typeof free6==='function'&&free6())return false;return true;});}
// FOR SALE signs and stakes: only on plots that are for sale
landMarkers=function(){for(const P of LAND_PARCELS){const sale=!landOwns(P.id)&&!P.retired;
    if(sale&&!LAND.signs[P.id]){const s=obj('signpost',P.sign[0],P.sign[1],{kind:'prop',label:'FOR SALE',face:'P',landSign:P.id});try{s.spr=signSprite('FOR SALE','plain');}catch(e){}LAND.signs[P.id]=s;
      LAND.stakes[P.id]=[[P.x0,P.z0],[P.x0+P.w,P.z0],[P.x0,P.z0+P.h],[P.x0+P.w,P.z0+P.h]].map(([x,z])=>obj(SPR.land_stake?'land_stake':'rock_0',x,z+.05,{kind:'prop',noCol:true,landStake:P.id}));}
    if(!sale&&LAND.signs[P.id]){LAND.signs[P.id].hide=true;delete LAND.signs[P.id];for(const o of LAND.stakes[P.id]||[])o.hide=true;delete LAND.stakes[P.id];}}};
// the old signs' "Read" goes with them; the new ones get their own
for(const P of LAND_PARCELS){if(!P.retired)continue;const it=interact.find(q=>q&&q.x===P.sign[0]&&Math.abs(q.z-(P.sign[1]+.3))<.01&&q.label&&String(q.label())==='Read');if(!it)continue;const on=it.on;it.on=()=>!P.retired&&on();}
for(const P of LAND_PARCELS){if(!P.low)continue;interact.push({x:P.sign[0],z:P.sign[1]+.3,r:1.1,on:()=>!S.room&&!landOwns(P.id),label:()=>'Read',ok:()=>true,
  act(){toast(`FOR SALE: ${P.name.replace(/^The /,'the ')}, ${P.w*P.h} squares of ground. ${typeof free6==='function'&&free6()?'Free to you':P.price+' coins'}, or a fifth down on the bank’s money. Deeds at the land office in the Town Hall.`,4.6);}});}
// ---------------------------------------------------------------- the farm book: the old ground on one map, the Low Fields on another
function l35Shown(fn,list){const all=LAND_PARCELS.slice();LAND_PARCELS.length=0;for(const P of list)LAND_PARCELS.push(P);try{return fn();}finally{LAND_PARCELS.length=0;for(const P of all)LAND_PARCELS.push(P);}}
{const _eo=empOpen;empOpen=function(tab){const vis=LAND_PARCELS.filter(P=>!l35Old(P));const r=l35Shown(()=>_eo.apply(this,arguments),vis);
  try{if((tab||'land')==='land'){const N=$('noteText');if(N&&typeof free6==='function'&&free6())N.querySelectorAll('[data-emmort]').forEach(b=>b.remove());const first=LAND_PARCELS.find(P=>P.low);const row=N&&first&&N.querySelector('#emrow_'+first.id);
    if(row&&!N.querySelector('.l35h')){const h=document.createElement('h4');h.className='l35h';h.textContent='The Low Fields (south down Mill Road)';row.parentNode.insertBefore(h,row);
      const p=h.previousElementSibling;if(p&&p.tagName==='H4'&&/^The land$/i.test(p.textContent.trim()))p.remove();}}}catch(e){}return r;};}
{const _em=empMap;empMap=function(){const near=LAND_PARCELS.filter(P=>!P.low),low=LAND_PARCELS.filter(P=>P.low);let a=l35Shown(()=>_em.apply(this,arguments),near);
  // the home map keeps the scale it always had (with the old plots off the market it would otherwise zoom right in on the home field)
  try{a=a.replace(/viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"/,(m,x,z,w,h)=>{x=+x;z=+z;w=+w;h=+h;const few=!near.length,X0=few?-16:Math.min(x,-25),Z0=few?-6:Math.min(z,-6),X1=few?16:Math.max(x+w,19),Z1=few?12:Math.max(z+h,45);
    l35Map.bg=`<rect x="${X0}" y="${Z0}" width="${X1-X0}" height="${Z1-Z0}" fill="#c8b07a"/>`;return `viewBox="${X0} ${Z0} ${X1-X0} ${Z1-Z0}"`+(few?' style="max-height:150px"':'');}).replace(/(<\/defs>)/,'$1'+(l35Map.bg||''));}catch(e){}
  return a+(low.length?'<h4 style="margin:6px 0 0">The Low Fields</h4>'+l35Map(low):'');};}
function l35Map(ps){const X0=-66,X1=202,Z0=291,Z1=404,E=EMP();
  const esc=s=>String(s).replace(/[<&>]/g,'');
  let g=`<svg class="emmap l35map" viewBox="${X0} ${Z0} ${X1-X0} ${Z1-Z0}" preserveAspectRatio="xMidYMid meet"><defs><pattern id="l35h" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="3" fill="#d8c49a"/><rect width="1.1" height="3" fill="#a8885a"/></pattern></defs>`;
  g+=`<rect x="${X0}" y="${Z0}" width="${X1-X0}" height="${Z1-Z0}" fill="#c8b07a"/>`;
  g+=`<rect x="${X0}" y="${Z0}" width="${X1-X0}" height="4" fill="#5a6a3a"/><rect x="${X0}" y="${Z0}" width="3" height="${Z1-Z0}" fill="#5a6a3a"/><rect x="${X1-3}" y="${Z0}" width="3" height="${Z1-Z0}" fill="#5a6a3a"/>`;
  for(const q of L35.roads){let x1=q[0],y1=q[1];if(y1<Z0){const t=(Z0-y1)/(q[3]-y1);x1=q[0]+(q[2]-q[0])*t;y1=Z0;}g+=`<line x1="${x1}" y1="${y1}" x2="${q[2]}" y2="${q[3]}" stroke="#e8d8b0" stroke-width="${q[4]*1.3}" stroke-linecap="round"/>`;}
  let pts=[];for(let z=Z0;z<=Z1;z+=3)pts.push(`${l35StreamX(z).toFixed(1)},${z}`);g+=`<polyline points="${pts.join(' ')}" fill="none" stroke="#3a78a8" stroke-width="2.2"/>`;
  g+=`<ellipse cx="${L35.pond.x}" cy="${L35.pond.z}" rx="${L35.pond.rx}" ry="${L35.pond.rz}" fill="#3a78a8"/>`;
  const tag=(t,cx,cy)=>{const w=t.length*2.55+2.4;return `<rect x="${cx-w/2}" y="${cy-3.4}" width="${w}" height="5.2" fill="#f4e6c8" stroke="#6a4a2a" stroke-width=".35"/><text x="${cx}" y="${cy+.4}" class="t2">${esc(t)}</text>`;};
  const labels=[];
  for(const P of ps){const mine=landOwns(P.id),owe=E.loans.some(L=>L.p===P.id);
    g+=`<a href="#emrow_${P.id}" data-emjump="${P.id}"><rect x="${P.x0}" y="${P.z0}" width="${P.w}" height="${P.h}" fill="${owe?'#d8a050':mine?'#5a8a3c':'url(#l35h)'}" stroke="${mine?'#2a4a1a':'#6a4a2a'}" stroke-width=".6"/></a>`;
    const nm=P.name.replace(/^The /,'');const fit=nm.length*2.55+3<P.w;labels.push([nm,P.x0+P.w/2,fit?P.z0+P.h/2+1:P.z0+P.h+3.6]);}
  for(const [t,x,y] of labels)g+=tag(t,x,y);
  g+=`<text x="${L35.junction.x+3}" y="${Z0+8}" class="t2" style="text-anchor:start">MILL RD</text>`;
  return g+'</svg>';}
{const css=document.createElement('style');css.textContent=`#noteText .l35map{max-height:300px}#noteText .l35map .t2{font:3.3px 'Hollow Pixel',monospace;fill:#3a2414;text-anchor:middle;pointer-events:none}#noteText h4.l35h{margin-top:10px}`;document.head.appendChild(css);}
// ---------------------------------------------------------------- the ground
const l35StreamX=z=>RGP.dam.x+(fbm(z*.2,3)-.5)*3;      // the dam's spillway (regions.js inSpill), running on south
const l35InPond=(x,z)=>{const Q=L35.pond;const dx=(x-Q.x)/Q.rx,dz=(z-Q.z)/Q.rz;return dx*dx+dz*dz<1+(fbm(x*.5+9,z*.5)-.5)*.35;};
const l35InPlot=(x,z,m)=>LAND_PARCELS.some(P=>P.low&&x>P.x0-m&&x<P.x0+P.w+m&&z>P.z0-m&&z<P.z0+P.h+m);
const l35Low=z=>z>=L35.Z0;
// (the region joins REGS only after the old regions are built: in the build their dice must fall exactly as before)
RG_TINT.low=(r,g,b,l,h)=>[lerp(r,l*1.1,.42)*1.0+2,lerp(g,l*1.1,.42)*1.0,lerp(b,l*.68,.42)*.94];
// above the old edge every region keeps exactly the weights it had; below it, the Low Fields take over within a few paces
{const _w=rgWeights;const K=()=>REGS.indexOf(L35.reg);
  rgWeights=function(x,z,out){const k=K();if(k<0)return _w(x,z,out);
    const s=NEWB.z1;REGS.splice(k,1);NEWB.z1=L35.Z0;let r;try{r=_w(x,z,out);}finally{REGS.splice(k,0,L35.reg);NEWB.z1=s;}
    for(let i=REGS.length-1;i>k;i--)out[i]=out[i-1];out[k]=0;
    if(z>=L35.Z0){const wl=clamp((z-L35.Z0+(fbm(x*.06+4,z*.06)-.5)*6)/8,0,1);if(wl>0){for(let i=0;i<REGS.length;i++)if(i!==k)out[i]*=(1-wl);out[k]=wl;}}
    return out;};}
{const W=LAYERS.water;LAYERS.water=(x,z)=>W(x,z)||(l35Low(z)&&x>L35.XW&&l35InPond(x,z));}
{const Dt=LAYERS.dirt;LAYERS.dirt=(x,z)=>{if(Dt(x,z))return true;if(!l35Low(z))return false;
  const Q=L35.pond,d=Math.hypot((x-Q.x)/(Q.rx+1.3),(z-Q.z)/(Q.rz+1.3));if(d<1&&!l35InPond(x,z))return fbm(x*.9,z*.9)>.3;   // the trodden rim of the pond
  return false;};}
{const Dk=LAYERS.dark;LAYERS.dark=(x,z)=>{
  if(!l35Low(z)){if(z>230&&L35.built&&L35.roads.some(q=>segDist(x,z,q[0],q[1],q[2],q[3])<q[4]/2+.25))return false;   // the new roads through the old woods
    const k=REGS.indexOf(L35.reg),s=NEWB.z1;if(k>=0)REGS.splice(k,1);NEWB.z1=L35.Z0;try{return Dk(x,z);}finally{if(k>=0)REGS.splice(k,0,L35.reg);NEWB.z1=s;}}
  if(Math.max(NEWB.x0-x,x-NEWB.x1,z-NEWB.z1)>-1.5-2.5*fbm(x*.3+11,z*.3+7))return true;
  if(x<L35.XW+2)return true;
  if(onRoad(x,z,.25)||LAYERS.water(x,z))return false;
  if(z<L35.Z0+1+4.5*fbm(x*.07+5,2.3)+2.2*fbm(x*.41+1,z*.41+8))return true;                       // the old woods' ragged edge
  for(const c of L35.copses){const d=Math.hypot((x-c[0])/c[2],(z-c[1])/(c[2]*.7))+(fbm(x*.5+c[0],z*.5)-.5)*.5;if(d<1)return true;}   // a few copses on the open ground
  if(x<-65-4*fbm(z*.08,3)||x>199+4*fbm(z*.08,9))return true;                                       // woods at the west and east ends
  return false;};}
// the pond: you can't walk into it
{const _c=collide;collide=function(p,r){_c(p,r);if(!(p.z>=L35.Z0&&p.x<250&&p.x>L35.XW)||!l35InPond(p.x,p.z))return;
  for(let rr=.25;rr<4;rr+=.25)for(let a=0;a<16;a++){const x=p.x+Math.cos(a/16*Math.PI*2)*rr,z=p.z+Math.sin(a/16*Math.PI*2)*rr;if(!l35InPond(x,z)){p.x=x;p.z=z;return;}}};}
// ---------------------------------------------------------------- names, the map, the milestone
REGIONS.push(['THE LOW FIELDS',60,316]);
if(typeof RG_LINE!=='undefined')RG_LINE.low='Bottomland below the dam, emptied when the reservoir went in and sold off by the bank a plot at a time. The quietest ground in the county.';
if(typeof RG_HINT!=='undefined')RG_HINT.low='South down Mill Road, through the woods past the Deep Corn; or the dam road down from the reservoir.';
RG_MILES.push(L35.mile);if(typeof RG_MILE_K!=='undefined')RG_MILE_K.add('low');
// ---------------------------------------------------------------- the build: after everything else, with its own dice
const l35R=(()=>{let a=0x335c0de|0;return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();
const L35_TAKEN=new Map();let L35_RMAX=.6;const l35Key=(i,j)=>i*100003+j;
function l35Free(x,z,r){const R=r+L35_RMAX,i0=Math.floor((x-R)/4),i1=Math.floor((x+R)/4),j0=Math.floor((z-R)/4),j1=Math.floor((z+R)/4);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const L=L35_TAKEN.get(l35Key(i,j));if(!L)continue;for(const q of L)if(Math.hypot(q[0]-x,q[1]-z)<q[2]+r)return false;}return true;}
function l35Take(x,z,r){const k=l35Key(Math.floor(x/4),Math.floor(z/4));let L=L35_TAKEN.get(k);if(!L){L=[];L35_TAKEN.set(k,L);}L.push([x,z,r]);if(r>L35_RMAX)L35_RMAX=r;}
function l35Open(x,z,r,m){return z>L35.Z0+1&&z<L35.Z1-1&&x>L35.XW+1&&x<NEWB.x1-1&&!LAYERS.water(x,z)&&!onRoad(x,z,(m==null?.9:m))&&!l35InPlot(x,z,1.4)&&
  Math.hypot((x-L35.pond.x)/(L35.pond.rx+2),(z-L35.pond.z)/(L35.pond.rz+2))>1&&Math.hypot(x-L35.pump.x,z-L35.pump.z)>3.2&&l35Free(x,z,r);}
function l35Put(spr,x,z,o,r){const e=obj(spr,x,z,o);if(r)addCircle(x,z-.1,r);l35Take(x,z,Math.max(.4,r||.4));return e;}
function l35Hide(o){o.hide=true;for(let j=circles.length-1;j>=0;j--)if(Math.hypot(circles[j].x-o.x,circles[j].z-(o.z-.1))<.7)circles.splice(j,1);}
const L35_WOODS=[['willow',2],['maple_gold',1.5],['maple_orange',1.5],['oak_russet',2],['oak_green',1],['birch_gold',1],['deadtree',.5],['spruce_0',.8]];
function l35Pick(mix){const tot=mix.reduce((a,m)=>a+m[1],0);let q=l35R()*tot;for(const m of mix){q-=m[1];if(q<=0)return m[0];}return mix[0][0];}
function l35Build(){if(L35.built)return;L35.built=true;const t0=performance.now();if(!REGS.includes(L35.reg))REGS.push(L35.reg);RGK.low=L35.reg;
  // 1. the edge of the world moves south; the fen's side stays shut
  for(let i=rects.length-1;i>=0;i--){const q=rects[i];if(Math.abs(q.z0-(L35.Z0+.5))<.01&&q.z1>L35.Z0+5&&q.x1-q.x0>300)rects.splice(i,1);}
  addRect(NEWB.x0-12,L35.Z0+.5,L35.XW,L35.Z0+14);                     // under the fen, as before
  addRect(L35.XW-1,L35.Z0,L35.XW,L35.Z1+14);                           // the west woods: as far as anyone goes
  NEWB.z1=L35.Z1;B.z1=L35.Z1;
  addRect(NEWB.x0-12,L35.Z1+.5,NEWB.x1+12,L35.Z1+14);addRect(NEWB.x1+2.5,L35.Z0,NEWB.x1+14,L35.Z1+14);
  // 2. the roads in: trees standing in them come down
  for(const q of L35.roads)ROADS.push(q);
  for(const o of OBJ){if(o.hide||o.room||o.story||o.mile||o.town)continue;if(!/^(tree|pine|bush|deco|anim|grass)$/.test(o.kind||''))continue;if(o.z<230||o.x<L35.XW-4)continue;
    for(const q of L35.roads)if(segDist(o.x,o.z,q[0],q[1],q[2],q[3])<q[4]/2+1.1){l35Hide(o);break;}}
  for(const o of OBJ)if(!o.hide&&o.z>L35.Z0-6&&o.x>L35.XW-4&&o.x<250)l35Take(o.x,o.z,.6);
  // 3. plank bridges where the roads cross the stream
  for(const z of [302,354]){const cx=l35StreamX(z);put('footbridge',cx,z,0,{kind:'flat'});put('footbridge_rail',cx,z+.5,0,{kind:'prop',noCol:true});
    for(const s of [-1,1])addSeg(cx-2.3,z+s*.95,cx+2.3,z+s*.95,.12);DOCKS.push({x:cx,z,x0:cx-2.3,x1:cx+2.3,z0:z-.9,z1:z+.9});L35.bridges.push([cx,z]);l35Take(cx,z,2.6);}
  // 4. the pond, the old windpump and its trough, two bales left from somebody's last haying
  {const W=L35.pump;put('windpump',W.x,W.z,.45);obj('blades',W.x,W.z+.02,{kind:'anim',fps:6,yoff:135});put('barrel',W.x+1.1,W.z+.25,.3);l35Take(W.x,W.z,1.8);
    put('hay',W.x-3.6,W.z+1.6,.7);put('hay',W.x-5.2,W.z+2.6,.7);l35Take(W.x-4.4,W.z+2.1,1.6);
    let n=0;for(let a=0;a<120&&n<26;a++){const t=l35R()*6.283,d=1.02+l35R()*.16;const x=L35.pond.x+Math.cos(t)*L35.pond.rx*d,z=L35.pond.z+Math.sin(t)*L35.pond.rz*d;if(l35InPond(x,z)||!l35Free(x,z,.25))continue;
      obj('reeds',x,z,{kind:'anim',grass:1,fps:1.2,ph:l35R()*2});l35Take(x,z,.25);n++;}}
  // 5. reeds along the stream, both banks, clear of the bridges
  for(let z=L35.Z0+1;z<L35.Z1-2;z+=1.15){if(L35.bridges.some(b=>Math.abs(b[1]-z)<2.4))continue;const cx=l35StreamX(z);
    for(const s of [-1,1]){if(l35R()<.35)continue;const x=cx+s*(1.35+l35R()*.9);if(LAYERS.water(x,z)||!l35Free(x,z,.2))continue;obj('reeds',x,z+(l35R()-.5)*.3,{kind:'anim',grass:1,fps:1.2,ph:l35R()*2});l35Take(x,z,.2);}}
  // 6. a hedgerow along the north side of South Road, a windbreak along the south edge
  for(let x=-56;x<194;x+=1.7){if(Math.abs(x-20)<3.2||Math.abs(x-90)<2.6||Math.abs(x-170)<2.6||Math.abs(x-l35StreamX(352))<3.2)continue;if(l35R()<.12)continue;
    const z=351.6+(l35R()-.5)*.3;if(!l35Open(x,z,.5,.6))continue;l35Put(l35Pick([['bush_gold',3],['sumac',2],['holly',1],['bush_red',1.5],['elder',1]]),x,z,{kind:'bush'},.3);}
  for(let x=-54;x<196;x+=4.2){if(Math.abs(x-20)<4||Math.abs(x-90)<3.5||Math.abs(x-170)<3.5||Math.abs(x-l35StreamX(398))<3.5)continue;
    const z=397.5+(l35R()-.5)*1.4,xx=x+(l35R()-.5)*1.2;if(!l35Open(xx,z,1.1))continue;l35Put(l35Pick([['maple_gold',2],['oak_russet',2],['maple_orange',1.5],['oak_green',1]]),xx,z,{kind:'tree'},.4);}
  // 7. woods: the west and east ends and the ragged northern edge, thick where the ground is dark
  {let placed=0;for(let t=0;t<9000&&placed<600;t++){const x=lerp(L35.XW+.8,NEWB.x1-1,l35R()),z=lerp(L35.Z0+.6,L35.Z1-1,l35R());if(!LAYERS.dark(x,z)||onRoad(x,z,.9)||LAYERS.water(x,z))continue;
    if(l35InPlot(x,z,1.6)||!l35Free(x,z,1.1))continue;const sp=l35Pick(L35_WOODS);l35Put(sp,x+(l35R()-.5)*.3,z,{kind:/^spruce|^pine/.test(sp)?'pine':'tree'},.4);placed++;}
    L35.woods=placed;}
  // 8. lone field trees, field stones and tall gold grass on the open ground (none of it on a plot)
  {let n=0;for(let t=0;t<2000&&n<26;t++){const x=lerp(-60,196,l35R()),z=lerp(296,404,l35R());if(LAYERS.dark(x,z)||!l35Open(x,z,3.4))continue;l35Put(l35Pick([['oak_russet',3],['maple_gold',2],['oak_green',1],['maple_red',1]]),x,z,{kind:'tree'},.4);l35Take(x,z,4);n++;}}
  {let n=0;for(let t=0;t<3000&&n<46;t++){const x=lerp(-60,196,l35R()),z=lerp(294,404,l35R());if(LAYERS.dark(x,z)||!l35Open(x,z,.6,.6))continue;l35Put(l35R()<.6?'rock_0':'rock_1',x,z,{kind:'prop'},0);n++;}}
  {let n=0;for(let t=0;t<6000&&n<170;t++){const cx=lerp(-60,196,l35R()),cz=lerp(294,404,l35R());if(LAYERS.dark(cx,cz)||!l35Open(cx,cz,.8,.5))continue;const gold=l35R()<.7;
    const k=2+((l35R()*4)|0);for(let j=0;j<k;j++){const x=cx+(l35R()-.5)*2.4,z=cz+(l35R()-.5)*1.3;if(!l35Open(x,z,.15,.4))continue;obj(gold?'tgold':'tgrass',x,z,{kind:'anim',grass:1,fps:1.4,ph:hash(x*9|0,z*9|0)*2});l35Take(x,z,.15);}n++;}}
  // 9. signs and the milestone
  const sign=(x,z,label)=>{const o=put('signpost',x,z,.2,{kind:'prop',label,face:'P'});try{o.spr=signSprite(label,'plain');}catch(e){}l35Take(x,z,.6);return o;};
  sign(22.9,239.4,'LOW FIELDS');sign(23.2,299.2,'THE LOW FIELDS');sign(129.4,298.6,'LOW FIELDS');sign(-60.4,300,'BOTTOM ROAD');
  {const m=L35.mile;l35Put('rg_mile',m.x,m.z,{kind:'prop',mile:m.k},.28);
    interact.push({x:m.x,z:m.z+.5,r:1.3,on:()=>!S.room,label:()=>'Milestone',ok:()=>true,act(){rgTravel(m);}});}
  if(typeof NAV!=='undefined')NAV.sig='';
  L35.ms=Math.round(performance.now()-t0);console.log('low fields built',L35.ms+'ms',OBJ.length);}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{l35Build();}catch(e){console.error('low fields',e);}try{landSync();}catch(e){}return r;};}
