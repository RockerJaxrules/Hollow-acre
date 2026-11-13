/* ================= t335 the Low Fields: new land, a bigger map. The owner: "make new land to sell, not land that was already
   there (there may be story on it); make the map bigger and add a lot of new, empty land."
   - The valley runs on south past the old edge (z 290) to z 410. Below the Deep Corn's woods and the dam lies the Low Fields:
     flat bottomland the county emptied when the reservoir went in (1931) and sold to the bank, unfarmed since. Open meadow gone
     to straw in the dry places and still green along the stream, a farm pond with the old windpump on its bank, hedgerows and
     fenced fields, a windbreak, copses, and woods closing it in at the north, west and east, scrub and saplings stepping out of
     them into the grass.
   - The last man to farm here left his plough where it stopped, three furrows into a field nobody has touched since.
   - Ways in: Mill Road carries on south from the Deep Corn (it used to stop dead in the woods), and a dam road runs down from
     the reservoir's overlook. Bottom Road and South Road cross it east to west, with plank bridges over the stream, and two
     lanes run north to south. A county milestone stands at the corner of the Mill Road junction (known from the start: travel
     there from any other milestone).
   - Fifteen plots for sale, from a 140-square patch to a 1,536-square section. Each shows on the ground: old furrows under the
     grass and a worn headland round the edge, a rail fence with a gate on its road side, a hedgerow at its back, stakes at its
     corners and a FOR SALE sign at the gate. Sold at the land office and on the bank's money like the old ones; the farm book
     shows them on their own map.
   - The old plots round the farm (the west meadow, the east paddock, the south acre, the long field, the bottom field) are off
     the market: no signs, no stakes, no rows at the land office. A plot you already own stays yours and works as before.
   - Nothing already in the world moves: the region is laid after everything else with its own dice, the old ground keeps its
     exact look above the old edge, and only trees standing in the two new roads are taken down (hidden, never removed from the
     list, so saves line up). ================= */
const L35={Z0:290,Z1:410,XW:-96,built:false,reg:{k:'low',name:'The Low Fields',x0:-310,x1:218,z0:290,z1:410},
  pond:{x:70,z:380,rx:7,rz:4.3},pump:{x:64.4,z:376.2},junction:{x:20,z:302},mile:{k:'low',name:'The Low Fields',x:17.9,z:300.3},
  bridges:[],copses:[[-10,341,5],[-45,338,4],[128,343,4.5],[184,342,5],[2,389,4],[118,392,4.5]],
  plough:{x:5.2,z:334.2},scars:[[-13,333.3,4.2,333.6],[-12.2,334.1,4.4,334.4],[-11,334.9,3.9,335.1]],fenceDown:{x:58.6,z:368.6}};
// ---------------------------------------------------------------- the roads: gentle bends, flat over the bridges
const l35StreamX=z=>RGP.dam.x+(fbm(z*.2,3)-.5)*3;      // the dam's spillway (regions.js inSpill), running on south
{const S1=l35StreamX(302),S2=l35StreamX(354);
  L35.lines=[
    {w:2.4,p:[[20,236],[20.5,252],[19.6,270],[20,290],[20,302],[20.8,318],[21,330],[20.4,344],[20,354],[19.3,368],[19,382],[19.5,398]]},   // Mill Road
    {w:1.6,p:[[118,255],[119.5,268],[122.4,282],[125.3,294],[127,302]]},                                                                  // the dam road
    {w:2,p:[[-62,302.4],[-44,302.1],[-20,301.6],[0,301.7],[20,302],[40,302.4],[62,302.3],[90,302],[110,301.7],[127,302],[S1-3.6,302],[S1+3.6,302],[156,302.3],[170,302],[184,301.7],[196,301.9]]},   // Bottom Road
    {w:1.8,p:[[-62,353.5],[-36,354.2],[-8,354.5],[20,354],[44,353.5],[66,353.7],[90,354],[112,354.3],[S2-3.6,354],[S2+3.6,354],[158,353.6],[170,354],[186,354.4],[196,354.1]]},   // South Road
    {w:1.6,p:[[90,302],[90.7,318],[90.9,336],[90,354],[89.3,372],[89.6,386],[90.2,398]]},                                                  // the lanes
    {w:1.6,p:[[170,302],[169.3,320],[169.6,338],[170,354]]}];
  // as straight pieces for everything that asks "is this on a road" (narrower than the dirt: the verges wander out from it)
  L35.roads=[];for(const L of L35.lines)for(let i=0;i<L.p.length-1;i++)L35.roads.push([L.p[i][0],L.p[i][1],L.p[i+1][0],L.p[i+1][1],L.w*.72,L.w]);
  L35.junctions=[[20,302],[20,354],[90,302],[90,354],[170,302],[170,354],[127,302]];}
const l35OnRoad=(x,z,m)=>{for(const q of L35.roads)if(segDist(x,z,q[0],q[1],q[2],q[3])<q[5]/2+(m||0))return true;return false;};
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
  sign:[x0+.3,z0-1.15],desc:`${desc} Out in the Low Fields, south down Mill Road past the Deep Corn.`};LAND_PARCELS.push(P);});
const l35Old=P=>P.retired&&!landOwns(P.id);
const l35Hash=(s,n)=>{let h=2166136261^n;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return ((h>>>0)%10007)/10007;};
// the land office: the old plots aren't sold any more; with the free code there's no need of the bank's money
vendors.land.sub='Agnes Abernathy keeps the deeds in a tin box under the counter. The plots for sale now are all out in the Low Fields, south down Mill Road past the Deep Corn.';
{const _r=vendors.land.rows;vendors.land.rows=()=>_r().filter(q=>{if(!q)return false;const m=/^(land|mort)_(.+)$/.exec(String(q.k||''));if(!m)return true;
  const P=LAND_PARCELS.find(p=>p.id===m[2]);if(!P)return true;if(l35Old(P))return false;if(m[1]==='mort'&&typeof free6==='function'&&free6())return false;return true;});}
// FOR SALE signs and stakes: only on plots that are for sale. A stake is driven in by hand: never quite on the corner, never
// quite upright the same way twice
landMarkers=function(){for(const P of LAND_PARCELS){const sale=!landOwns(P.id)&&!P.retired;
    if(sale&&!LAND.signs[P.id]){const s=obj('signpost',P.sign[0],P.sign[1],{kind:'prop',label:'FOR SALE',face:'P',landSign:P.id});try{s.spr=signSprite('FOR SALE','plain');}catch(e){}LAND.signs[P.id]=s;
      LAND.stakes[P.id]=[[P.x0,P.z0],[P.x0+P.w,P.z0],[P.x0,P.z0+P.h],[P.x0+P.w,P.z0+P.h]].map(([x,z],k)=>{const j=P.low?[(l35Hash(P.id,k)-.5)*.5,(l35Hash(P.id,k+7)-.5)*.35]:[0,0];
        return obj(SPR.land_stake?'land_stake':'rock_0',x+j[0],z+.05+j[1],{kind:'prop',noCol:true,landStake:P.id,flip:P.low&&l35Hash(P.id,k+3)<.5});});}
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
  return a+(low.length?'<h4 style="margin:6px 0 0">The Low Fields</h4>'+l35Map(low)+l35Key():'');};}
// a plot's name on the map: "The" dropped, the first letter capitalised, so every tag reads the same way
const l35Tag=P=>{const n=P.name.replace(/^The /,'');return n.charAt(0).toUpperCase()+n.slice(1);};
function l35Key(){const sw=(c,l)=>`<span class="l35k"><svg viewBox="0 0 10 7" width="18" height="12"><rect x=".5" y=".5" width="9" height="6" fill="${c}" stroke="#6a4a2a" stroke-width=".6"/></svg>${l}</span>`;
  return `<div class="l35key">${sw('url(#l35kh)','For sale')}${sw('#5a8a3c','Yours')}${sw('#d8a050','Owed to the bank')}<span class="l35k"><svg viewBox="0 0 10 7" width="18" height="12"><line x1="0" y1="3.5" x2="10" y2="3.5" stroke="#e8d8b0" stroke-width="2.4"/><line x1="0" y1="3.5" x2="10" y2="3.5" stroke="#6a4a2a" stroke-width=".5" stroke-dasharray="0"/></svg>Road</span>`+
    `<svg width="0" height="0" style="position:absolute"><defs><pattern id="l35kh" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="3" fill="#d8c49a"/><rect width="1.1" height="3" fill="#a8885a"/></pattern></defs></svg></div>`;}
function l35Map(ps){const X0=-66,X1=202,Z0=291,Z1=404,E=EMP();
  const esc=s=>String(s).replace(/[<&>]/g,'');
  let g=`<svg class="emmap l35map" viewBox="${X0} ${Z0} ${X1-X0} ${Z1-Z0}" preserveAspectRatio="xMidYMid meet"><defs><pattern id="l35h" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="3" fill="#d8c49a"/><rect width="1.1" height="3" fill="#a8885a"/></pattern></defs>`;
  g+=`<rect x="${X0}" y="${Z0}" width="${X1-X0}" height="${Z1-Z0}" fill="#c8b07a"/>`;
  g+=`<rect x="${X0}" y="${Z0}" width="${X1-X0}" height="4" fill="#5a6a3a"/><rect x="${X0}" y="${Z0}" width="3" height="${Z1-Z0}" fill="#5a6a3a"/><rect x="${X1-3}" y="${Z0}" width="3" height="${Z1-Z0}" fill="#5a6a3a"/>`;
  for(const pass of [0,1])for(const L of L35.lines){const pts=L.p.filter(q=>q[1]>=Z0-12).map(q=>`${q[0]},${Math.max(Z0,q[1])}`).join(' ');
    g+=`<polyline points="${pts}" fill="none" stroke="${pass?'#e8d8b0':'#6a4a2a'}" stroke-width="${pass?L.w*1.2:L.w*1.2+1}" stroke-linecap="round" stroke-linejoin="round"/>`;}
  let pts=[];for(let z=Z0;z<=Z1;z+=3)pts.push(`${l35StreamX(z).toFixed(1)},${z}`);g+=`<polyline points="${pts.join(' ')}" fill="none" stroke="#3a78a8" stroke-width="2.2"/>`;
  g+=`<ellipse cx="${L35.pond.x}" cy="${L35.pond.z}" rx="${L35.pond.rx}" ry="${L35.pond.rz}" fill="#3a78a8"/>`;
  const FS=3.3,CW=2.5;
  for(const P of ps){const mine=landOwns(P.id),owe=E.loans.some(L=>L.p===P.id);
    g+=`<a href="#emrow_${P.id}" data-emjump="${P.id}"><rect x="${P.x0}" y="${P.z0}" width="${P.w}" height="${P.h}" fill="${owe?'#d8a050':mine?'#5a8a3c':'url(#l35h)'}" stroke="${mine?'#2a4a1a':'#6a4a2a'}" stroke-width=".6"/></a>`;
    // the name, inside its own plot: one line if it fits, else two (and a size smaller if it must)
    const words=l35Tag(P).split(' ');let lines=[words.join(' ')],fs=FS;
    if(lines[0].length*CW+3>P.w){let best=null;for(let k=1;k<words.length;k++){const a=words.slice(0,k).join(' '),b=words.slice(k).join(' ');const m=Math.max(a.length,b.length);if(!best||m<best.m)best={m,l:[a,b]};}if(best)lines=best.l;}
    const longest=Math.max(...lines.map(s=>s.length));if(longest*CW+3>P.w)fs=FS*(P.w-3)/(longest*CW);
    const lh=fs*1.15,bw=longest*CW*fs/FS+2.2,bh=lines.length*lh+1.4,cx=P.x0+P.w/2,cy=P.z0+P.h/2;
    g+=`<rect x="${cx-bw/2}" y="${cy-bh/2}" width="${bw}" height="${bh}" fill="#f4e6c8" stroke="#6a4a2a" stroke-width=".3" opacity=".92" pointer-events="none"/>`;
    lines.forEach((s,i)=>{g+=`<text x="${cx}" y="${cy-bh/2+.9+lh*(i+.78)}" class="t2" style="font-size:${fs.toFixed(2)}px">${esc(s)}</text>`;});}
  g+=`<text x="${L35.junction.x-1.6}" y="${Z0+9}" class="t2" style="text-anchor:end">MILL RD</text>`;
  return g+'</svg>';}
{const css=document.createElement('style');css.textContent=`#noteText .l35map{max-height:300px}#noteText .l35map .t2{font:3.3px 'Hollow Pixel',monospace;fill:#3a2414;text-anchor:middle;pointer-events:none}#noteText h4.l35h{margin-top:10px}
#noteText .l35key{display:flex;flex-wrap:wrap;gap:4px 14px;margin:4px 0 2px;font-size:13px;color:#4a2e16}#noteText .l35k{display:inline-flex;align-items:center;gap:5px}`;document.head.appendChild(css);}
// ---------------------------------------------------------------- the ground
const l35InPond=(x,z)=>{const Q=L35.pond;const dx=(x-Q.x)/Q.rx,dz=(z-Q.z)/Q.rz;return dx*dx+dz*dz<1+(fbm(x*.5+9,z*.5)-.5)*.35;};
const l35InPlot=(x,z,m)=>LAND_PARCELS.some(P=>P.low&&x>P.x0-m&&x<P.x0+P.w+m&&z>P.z0-m&&z<P.z0+P.h+m);
const l35Low=z=>z>=L35.Z0;
// where the north woods give way to the meadow: a ragged line with tongues of wood reaching out into the grass
const l35EdgeZ=x=>L35.Z0+Math.min(9.5,1.2+5.2*fbm(x*.045+5,2.3)+Math.max(0,fbm(x*.09+2,9.1)-.5)*16);
const l35WestX=z=>-63-5*fbm(z*.06,3)-Math.max(0,fbm(z*.13+4,5)-.5)*10;
const l35EastX=z=>199+4*fbm(z*.07,9)+Math.max(0,fbm(z*.12+8,2)-.5)*8;
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
// the dirt: the pond's trodden rim, and the verges of the new roads wandering out from their straight middles; the corners of
// every junction worn off by carts cutting them
{const Dt=LAYERS.dirt;LAYERS.dirt=(x,z)=>{if(Dt(x,z))return true;if(z<232||x<-66||x>200)return false;
  if(L35.built){const e=.12+.55*fbm(x*.13+3,z*.13+7);
  for(const q of L35.roads){if(x<Math.min(q[0],q[2])-3||x>Math.max(q[0],q[2])+3||z<Math.min(q[1],q[3])-3||z>Math.max(q[1],q[3])+3)continue;if(segDist(x,z,q[0],q[1],q[2],q[3])<q[5]*.36+e)return true;}
  for(const j of L35.junctions)if(Math.abs(x-j[0])+Math.abs(z-j[1])<1.9+e*1.1)return true;}   // (only once the region is laid: the old valley's build must see the ground it always saw)
  if(!l35Low(z))return false;
  const Q=L35.pond,d=Math.hypot((x-Q.x)/(Q.rx+1.3),(z-Q.z)/(Q.rz+1.3));if(d<1&&!l35InPond(x,z))return fbm(x*.9,z*.9)>.3;
  return false;};}
{const Dk=LAYERS.dark;LAYERS.dark=(x,z)=>{
  if(!l35Low(z)){if(z>230&&L35.built&&l35OnRoad(x,z,.05+1.25*Math.max(0,fbm(x*.21+5,z*.21+2)-.3)+.5*Math.max(0,fbm(x*.9+1,z*.9+3)-.55)))return false;   // the new roads through the old woods: a verge that comes and goes
    const k=REGS.indexOf(L35.reg),s=NEWB.z1;if(k>=0)REGS.splice(k,1);NEWB.z1=L35.Z0;try{return Dk(x,z);}finally{if(k>=0)REGS.splice(k,0,L35.reg);NEWB.z1=s;}}
  if(Math.max(NEWB.x0-x,x-NEWB.x1,z-NEWB.z1)>-1.5-2.5*fbm(x*.3+11,z*.3+7))return true;
  if(x<L35.XW+2)return true;
  if(l35OnRoad(x,z,.3)||LAYERS.water(x,z))return false;
  if(z<l35EdgeZ(x)+1.6*(fbm(x*.33+1,z*.33+8)-.5))return true;                                        // the north woods' ragged edge
  for(const c of L35.copses){const d=Math.hypot((x-c[0])/c[2],(z-c[1])/(c[2]*.7))+(fbm(x*.5+c[0],z*.5)-.5)*.5;if(d<1)return true;}   // copses on the open ground
  if(x<l35WestX(z)||x>l35EastX(z))return true;                                                      // woods at the west and east ends
  return false;};}
// the pond: you can't walk into it
{const _c=collide;collide=function(p,r){_c(p,r);if(!(p.z>=L35.Z0&&p.x<250&&p.x>L35.XW)||!l35InPond(p.x,p.z))return;
  for(let rr=.25;rr<4;rr+=.25)for(let a=0;a<16;a++){const x=p.x+Math.cos(a/16*Math.PI*2)*rr,z=p.z+Math.sin(a/16*Math.PI*2)*rr;if(!l35InPond(x,z)){p.x=x;p.z=z;return;}}};}
// ---------------------------------------------------------------- the meadow's colour
// The grass of the old valley is one olive with tufts sprinkled evenly. Down here the colour is laid by where you stand: dry
// ground gone to straw and tawny in big drifts, greener toward the stream and the pond, cooler in the low damp patches; the
// tufts come thick in some places and thin out in others; and the plots show through it: old furrows under the grass, a worn
// headland round each one, and the three scars where the plough stopped.
const L35_RAMP={
  olive:{sh:[58,74,52],dk:[72,88,54],b:[88,102,56],lt:[114,124,66],hi:[150,156,84]},
  tawny:{sh:[76,74,50],dk:[92,90,54],b:[106,102,58],lt:[136,126,70],hi:[172,156,88]},
  straw:{sh:[86,78,52],dk:[104,94,58],b:[122,110,62],lt:[154,136,76],hi:[188,166,98]},
  green:{sh:[48,70,54],dk:[60,84,58],b:[72,98,58],lt:[94,122,66],hi:[128,150,82]}};
const L35_WORN=[118,100,66];
function l35Zone(wx,wz){   // [dryness 0..1 (wetness already taken off), wetness, patch noise, tuft density]
  const sx=l35StreamX(wz),ws=clamp(1-Math.abs(wx-sx)/13,0,1),Q=L35.pond,wp=clamp(1-(Math.hypot((wx-Q.x)/Q.rx,(wz-Q.z)/Q.rz)-1)/1.9,0,1);const wet=Math.max(ws,wp);
  const d=clamp((fbm(wx*.028+11,wz*.028+5)-.36)/.32+(fbm(wx*.15+2,wz*.15+4)-.5)*.34,0,1);
  return [d*(1-wet*.9),wet,fbm(wx*.09+31,wz*.09+17),fbm(wx*.11+5,wz*.11+23)];}
function l35Ground(g,x0,z0,N){const W=N*32;if(z0+N<=L35.Z0||x0+N<L35.XW||x0>NEWB.x1)return;
  const id=g.getImageData(0,0,W,W),D=id.data,n=W*W;
  // 1. which pixels are grass, and the grass's own middle tone (everything else: roads, water, woods floor, stays as it is)
  const grass=new Uint8Array(n),L=new Float32Array(n);const hist=new Uint32Array(64);
  for(let i=0,o=0;i<n;i++,o+=4){const r=D[o],gg=D[o+1],b=D[o+2];L[i]=r*.3+gg*.59+b*.11;if(gg>=r+4&&gg>=b+26){grass[i]=1;hist[Math.min(63,L[i]>>2)]++;}}
  let mode=0;for(let k=1;k<64;k++)if(hist[k]>hist[mode])mode=k;if(!hist[mode])return;const base=mode*4+2;
  // 2. the zone fields on a coarse grid (a quarter of a pace), read back smoothly
  const G=N*4+1,Zd=new Float32Array(G*G),Zw=new Float32Array(G*G),Zp=new Float32Array(G*G),Zt=new Float32Array(G*G);
  for(let j=0;j<G;j++)for(let i=0;i<G;i++){const z=l35Zone(x0+i/4,z0+j/4),k=j*G+i;Zd[k]=z[0];Zw[k]=z[1];Zp[k]=z[2];Zt[k]=z[3];}
  const at=(A,px,py)=>{const fx=px/8,fy=py/8,i=Math.min(G-2,fx|0),j=Math.min(G-2,fy|0),u=fx-i,v=fy-j,k=j*G+i;return A[k]*(1-u)*(1-v)+A[k+1]*u*(1-v)+A[k+G]*(1-u)*v+A[k+G+1]*u*v;};
  // 3. tufts: the bright clusters, kept or thinned by the density field; their shadows stay only under the tufts that stay
  const core=new Uint8Array(n);for(let i=0;i<n;i++)if(grass[i]&&L[i]>=base+20)core[i]=1;
  const comp=new Int32Array(n).fill(-1),keep=[];const stack=[];
  const plots=LAND_PARCELS.filter(P=>P.low&&P.x0<x0+N+1&&P.x0+P.w>x0-1&&P.z0<z0+N+1&&P.z0+P.h>z0-1);
  const plotAt=(wx,wz)=>{for(const P of plots)if(wx>=P.x0&&wx<P.x0+P.w&&wz>=P.z0&&wz<P.z0+P.h)return P;return null;};
  for(let s=0;s<n;s++){if(!core[s]||comp[s]>=0)continue;const c=keep.length;let cx=0,cy=0,m=0;stack.push(s);comp[s]=c;
    while(stack.length){const p=stack.pop(),px=p%W,py=(p/W)|0;cx+=px;cy+=py;m++;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const qx=px+dx,qy=py+dy;if(qx<0||qy<0||qx>=W||qy>=W)continue;const q=qy*W+qx;if(core[q]&&comp[q]<0){comp[q]=c;stack.push(q);}}}
    cx/=m;cy/=m;const wx=x0+cx/32,wz=z0+cy/32,P=plotAt(wx,wz);let dens=at(Zt,cx,cy);
    let pk=clamp(.15+(dens-.3)*1.7,0,1);if(P){const e=Math.min(wx-P.x0,P.x0+P.w-wx,wz-P.z0,P.z0+P.h-wz);pk=e<.9?0:pk*.6;}
    keep.push(m>=2&&hash((wx*7)|0,(wz*7)|0)<pk);}
  const shade=new Uint8Array(n);for(let i=0;i<n;i++){if(!core[i]||!keep[comp[i]])continue;const px=i%W,py=(i/W)|0;for(let dy=1;dy<=3;dy++)for(let dx=-1;dx<=1;dx++){const qx=px+dx,qy=py+dy;if(qx>=0&&qy<W&&qx<W)shade[qy*W+qx]=1;}}
  // 4. paint
  const TH=[.34,.63],mixc=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  for(let py=0;py<W;py++){const wz=z0+(py+.5)/32;if(wz<L35.Z0)continue;const wl=clamp((wz-L35.Z0)/5,0,1);
    for(let px=0;px<W;px++){const i=py*W+px;if(!grass[i])continue;const wx=x0+(px+.5)/32;
      const d=at(Zd,px,py),wt=at(Zw,px,py),pn=at(Zp,px,py);
      // the zone: green near water, else olive / tawny / straw by dryness; a pixel's worth of mixed tone where two zones meet
      let R,R2=null,t2=0;if(wt>.5){R=L35_RAMP.green;if(wt<.56){R2=L35_RAMP.olive;t2=.5;}}
      else{const z=d<TH[0]?0:d<TH[1]?1:2;R=[L35_RAMP.olive,L35_RAMP.tawny,L35_RAMP.straw][z];const th=z===0?TH[0]:z===1?(d-TH[0]<TH[1]-d?TH[0]:TH[1]):TH[1];
        if(Math.abs(d-th)<.018){R2=[L35_RAMP.olive,L35_RAMP.tawny,L35_RAMP.straw][d<th?Math.min(2,z+1):Math.max(0,z-1)];t2=.5;}}
      const pick=k=>R2?mixc(R[k],R2[k],t2):R[k];
      let c;const P=plotAt(wx,wz);
      if(core[i]&&keep[comp[i]])c=pick(L[i]>=base+44?'hi':'lt');
      else if(shade[i]&&L[i]<=base-6)c=pick('sh');
      else{const low=pn>.64,edge=Math.abs(pn-.64)<.012;c=low?pick('dk'):pick('b');if(edge)c=mixc(pick('b'),pick('dk'),.5);}
      if(P){const e=Math.min(wx-P.x0,P.x0+P.w-wx,wz-P.z0,P.z0+P.h-wz);
        if(e<.85)c=mixc(c,L35_WORN,.34);                                                   // the headland, trodden round the edge
        else{const v=(wz-P.z0+(fbm(wx*.4+P.x0,wz*.4)-.5)*.16)%1;if(v>.44&&v<.52)c=mixc(c,pick('dk'),.75);}}   // the old furrows
      for(const s of L35.scars){const q=segDist(wx,wz,s[0],s[1],s[2],s[3]);if(q<.13){c=mixc(L35_WORN,[84,64,42],.45);break;}else if(q<.2){c=mixc(c,L35_WORN,.5);break;}}
      const o=i*4;if(wl<1){D[o]=D[o]+(c[0]-D[o])*wl;D[o+1]=D[o+1]+(c[1]-D[o+1])*wl;D[o+2]=D[o+2]+(c[2]-D[o+2])*wl;}else{D[o]=c[0];D[o+1]=c[1];D[o+2]=c[2];}}}
  // 5. thick places get more tufts than the old ground ever had: a small three-tone clump on a jittered grid
  const ST=[[2,0,'hi'],[1,1,'hi'],[2,1,'lt'],[4,1,'hi'],[0,2,'lt'],[1,2,'lt'],[2,2,'lt'],[3,2,'hi'],[4,2,'lt'],[0,3,'lt'],[1,3,'lt'],[2,3,'lt'],[3,3,'lt'],[4,3,'lt'],[1,4,'sh'],[2,4,'sh'],[3,4,'sh'],[4,4,'sh']];
  const gx0=Math.floor((x0*32-8)/13),gx1=Math.floor((x0*32+W+8)/13),gy0=Math.floor((z0*32-8)/13),gy1=Math.floor((z0*32+W+8)/13);
  for(let gy=gy0;gy<=gy1;gy++)for(let gx=gx0;gx<=gx1;gx++){const ax=gx*13+Math.floor(hash(gx,gy*7+1)*9),ay=gy*13+Math.floor(hash(gx*3+5,gy)*9);const wx=ax/32,wz=ay/32;if(wz<L35.Z0+3)continue;
    const lx=ax-x0*32,ly=ay-z0*32;const cxp=clamp(lx,0,W-1),cyp=clamp(ly,0,W-1);const dens=at(Zt,cxp,cyp);if(dens<.55||hash(gx*11,gy*13)>(dens-.55)*2.6)continue;
    if(plotAt(wx,wz)||LAYERS.dirt(wx,wz)||LAYERS.water(wx,wz)||LAYERS.dark(wx,wz))continue;
    const d=at(Zd,cxp,cyp),wt=at(Zw,cxp,cyp);const R=wt>.5?L35_RAMP.green:[L35_RAMP.olive,L35_RAMP.tawny,L35_RAMP.straw][d<TH[0]?0:d<TH[1]?1:2];const fl=hash(gx,gy)<.5;
    for(const [sx,sy,k] of ST){const qx=lx+(fl?4-sx:sx),qy=ly+sy;if(qx<0||qy<0||qx>=W||qy>=W)continue;const q=qy*W+qx;if(!grass[q])continue;const o=q*4,c=R[k];D[o]=c[0];D[o+1]=c[1];D[o+2]=c[2];}}
  g.putImageData(id,0,0);}
// the ground, and the water under the plank bridges taken out of the water mask (nothing is reflected through a deck)
{const _gp=groundPixels;groundPixels=function(g,x0,z0,N){const wm=_gp.apply(this,arguments);try{l35Ground(g,x0,z0,N);}catch(e){console.warn('low fields ground',e);}
  try{if(wm&&wm.getContext&&z0+N>L35.Z0)for(const b of L35.bridges){const X=(b[0]-1.75-x0)*32,Y=(b[1]-.95-z0)*32;if(X>N*32||Y>N*32||X+112<0||Y+61<0)continue;wm.getContext('2d').clearRect(Math.floor(X),Math.floor(Y),112,61);}}catch(e){}
  return wm;};}
// standing on a plank bridge, the deck is between you and the water: no reflection of you below it
{const _mr=mindReflection;mindReflection=function(){if(P&&P.z>L35.Z0&&L35.bridges.some(b=>Math.abs(P.x-b[0])<2.6&&Math.abs(P.z-b[1])<1.3))return;return _mr.apply(this,arguments);};}
// ---------------------------------------------------------------- names, the map, the milestone
REGIONS.push(['THE LOW FIELDS',60,316]);
if(typeof RG_LINE!=='undefined')RG_LINE.low='Bottomland below the dam, emptied when the reservoir went in and sold off by the bank a plot at a time. Someone farmed it once. His plough is still out there.';
if(typeof RG_HINT!=='undefined')RG_HINT.low='South down Mill Road, through the woods past the Deep Corn; or the dam road down from the reservoir.';
RG_MILES.push(L35.mile);if(typeof RG_MILE_K!=='undefined')RG_MILE_K.add('low');
// the world map: the plots laid over the ground (each its own tone, its fence and hedge), the roads redrawn in the map's own
// ink on top of the region's colour wash
{const _mp=mapPaint;mapPaint=function(){
  // the base map rules every road straight; the Low Fields' roads are drawn here instead, bending with the land
  const keep=ROADS.slice();if(L35.roadRefs){const R=new Set(L35.roadRefs);for(let i=ROADS.length-1;i>=0;i--)if(R.has(ROADS[i]))ROADS.splice(i,1);}
  let c;try{c=_mp.apply(this,arguments);}finally{ROADS.length=0;for(const q of keep)ROADS.push(q);}
  try{if(L35.built)l35MapPaint(c);}catch(e){console.warn('low fields map',e);}return c;};}
function l35MapPaint(c){const s=MAPX.s,pad=MAPX.pad,g=c.getContext('2d'),X=x=>pad+(x-B.x0)*s,Y=z=>pad+(z-B.z0)*s;g.save();
  // one smooth bend laid over the whole region, the same at every point for roads and field edges alike, so the roads
  // wander like a surveyor's sketch instead of a ruled grid and the fields follow them
  const DX=(x,z)=>(fbm(x*.022+3,z*.022+1)-.5)*16+(fbm(x*.08+8,z*.08)-.5)*3,DZ=(x,z)=>(fbm(x*.022+11,z*.022+5)-.5)*16+(fbm(x*.08,z*.08+6)-.5)*3;
  const W=(x,z)=>[X(x+DX(x,z)),Y(z+DZ(x,z))];
  for(const P of LAND_PARCELS){if(!P.low)continue;const h=l35Hash(P.id,1);
    g.beginPath();const pts=[];const sx2=Math.max(4,Math.round(P.w/3)),sz2=Math.max(3,Math.round(P.h/3));
    for(let i=0;i<=sx2;i++)pts.push([P.x0+P.w*i/sx2,P.z0]);for(let i=1;i<=sz2;i++)pts.push([P.x0+P.w,P.z0+P.h*i/sz2]);for(let i=sx2-1;i>=0;i--)pts.push([P.x0+P.w*i/sx2,P.z0+P.h]);for(let i=sz2-1;i>=1;i--)pts.push([P.x0,P.z0+P.h*i/sz2]);
    pts.forEach(([x,z],i)=>{const [xx,yy]=W(x,z);i?g.lineTo(xx,yy):g.moveTo(xx,yy);});g.closePath();
    g.globalAlpha=.42;g.fillStyle=h<.33?'#c8b46a':h<.66?'#b8a65c':'#a8a058';g.fill();g.globalAlpha=1;
    g.save();g.clip();g.strokeStyle='rgba(90,70,36,.28)';g.lineWidth=1;for(let z=P.z0+1.5;z<P.z0+P.h;z+=2.2){g.beginPath();for(let k=0;k<=6;k++){const [xx,yy]=W(P.x0+P.w*k/6,z);k?g.lineTo(xx,yy):g.moveTo(xx,yy);}g.stroke();}g.restore();
    g.strokeStyle='rgba(74,48,24,.75)';g.lineWidth=1.2;g.beginPath();for(let k=0;k<=6;k++){const [xx,yy]=W(P.x0+P.w*k/6,P.z0-.5);k?g.lineTo(xx,yy):g.moveTo(xx,yy);}g.stroke();}
  // the roads: each piece cut into short steps that follow the bend, so they curve; same ink as the old roads
  for(const pass of [0,1])for(const L of L35.lines){g.lineCap='round';g.lineJoin='round';g.beginPath();let first=true;
    for(let i=0;i<L.p.length-1;i++){const [ax,az]=L.p[i],[bx,bz]=L.p[i+1],n=Math.max(1,Math.round(Math.hypot(bx-ax,bz-az)/2));
      for(let k=i?1:0;k<=n;k++){const x=ax+(bx-ax)*k/n,z=az+(bz-az)*k/n,f=z<L35.Z0?clamp((z-L35.Z0+30)/30,0,1):1,xx=X(x+DX(x,z)*f),yy=Y(z+DZ(x,z)*f);first?g.moveTo(xx,yy):g.lineTo(xx,yy);first=false;}}
    g.strokeStyle=pass?'#e8d4a4':'#5a3a20';g.lineWidth=pass?L.w*s*.9:L.w*s*.9+3;g.stroke();}
  g.restore();}
// ---------------------------------------------------------------- the build: after everything else, with its own dice
const l35R=(()=>{let a=0x335c0de|0;return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();
const L35_TAKEN=new Map();let L35_RMAX=.6;const l35Key2=(i,j)=>i*100003+j;
function l35Free(x,z,r){const R=r+L35_RMAX,i0=Math.floor((x-R)/4),i1=Math.floor((x+R)/4),j0=Math.floor((z-R)/4),j1=Math.floor((z+R)/4);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const L=L35_TAKEN.get(l35Key2(i,j));if(!L)continue;for(const q of L)if(Math.hypot(q[0]-x,q[1]-z)<q[2]+r)return false;}return true;}
function l35Take(x,z,r){const k=l35Key2(Math.floor(x/4),Math.floor(z/4));let L=L35_TAKEN.get(k);if(!L){L=[];L35_TAKEN.set(k,L);}L.push([x,z,r]);if(r>L35_RMAX)L35_RMAX=r;}
function l35Open(x,z,r,m){return z>L35.Z0+1&&z<L35.Z1-1&&x>L35.XW+1&&x<NEWB.x1-1&&!LAYERS.water(x,z)&&!l35OnRoad(x,z,(m==null?.9:m))&&!l35InPlot(x,z,1.4)&&
  Math.hypot((x-L35.pond.x)/(L35.pond.rx+2),(z-L35.pond.z)/(L35.pond.rz+2))>1&&Math.hypot(x-L35.pump.x,z-L35.pump.z)>3.2&&l35Free(x,z,r);}
function l35Put(spr,x,z,o,r){const e=obj(spr,x,z,o);if(r)addCircle(x,z-.1,r);l35Take(x,z,Math.max(.4,r||.4));return e;}
function l35Hide(o){o.hide=true;for(let j=circles.length-1;j>=0;j--)if(Math.hypot(circles[j].x-o.x,circles[j].z-(o.z-.1))<.7)circles.splice(j,1);}
const L35_WOODS=[['willow',2],['maple_gold',1.5],['maple_orange',1.5],['oak_russet',2],['oak_green',1],['birch_gold',1],['deadtree',.5],['spruce_0',.8]];
function l35Pick(mix){const tot=mix.reduce((a,m)=>a+m[1],0);let q=l35R()*tot;for(const m of mix){q-=m[1];if(q<=0)return m[0];}return mix[0][0];}
// ---------------------------------------------------------------- new things drawn here: reeds, saplings, a plough, a gate, a fallen fence
// (each drawn once into a canvas, light from the top left, a dark outline round the solid parts)
function l35Spr(key,W,H,ax,ay,draw,outline){if(SPR[key])return key;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w||1,h||1);};draw(P,g);
  if(outline){const d=g.getImageData(0,0,W,H),a=d.data,o=new Uint8Array(W*H);for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(a[(y*W+x)*4+3]>40)continue;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const qx=x+dx,qy=y+dy;if(qx<0||qy<0||qx>=W||qy>=H)continue;if(a[(qy*W+qx)*4+3]>40&&!(outline.skip&&outline.skip(qx,qy))){o[y*W+x]=1;break;}}}
    for(let i=0;i<W*H;i++)if(o[i]){a[i*4]=outline.c[0];a[i*4+1]=outline.c[1];a[i*4+2]=outline.c[2];a[i*4+3]=255;}g.putImageData(d,0,0);}
  IMG['mem:'+key]=c;SPR[key]={src:'mem:'+key,fw:W,fh:H,ax,ay};return key;}
function l35Rng(seed){let a=seed|0;return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// a clump of reeds and sedge: blades leaning every which way, some dry at the tips, a few cattails standing out of them
function l35Reeds(v){return l35Spr('l35_reeds'+v,34,48,17,45,(P)=>{const r=l35Rng(4100+v*977);
  const blade=(bx,h,lean,cols,w2)=>{for(let k=0;k<=h;k++){const t=k/h,x=bx+lean*Math.pow(t,1.6),y=45-k;const c=t<.3?cols[0]:t<.64?cols[1]:t<.86?cols[2]:cols[3];P(x,y,1,1,c);if(w2&&t<.45)P(x+(lean<0?1:-1),y,1,1,t<.2?cols[0]:cols[1]);}};
  const back=['#24361e','#3a5028','#5a6834','#7a7440'],front=['#2e4426','#4e6a34','#7a8a46','#a8925a'],dry=['#4a4228','#6e6438','#9a8a52','#c0a868'];
  const n=6+((r()*4)|0);for(let i=0;i<n;i++)blade(10+r()*14,14+r()*16,(r()-.5)*14,back,false);
  const heads=v===2?0:2+((r()*2)|0);for(let i=0;i<heads;i++){const bx=11+r()*12,h=28+r()*12,lean=(r()-.5)*4;const tx=Math.round(bx+lean),ty=Math.round(45-h);
    for(let k=0;k<h-6;k++){const t=k/h;P(bx+lean*t,45-k,1,1,k<h*.4?'#3e5428':'#6a7a3a');}
    P(tx-1,ty,3,7,'#2a180c');P(tx,ty+1,1,5,'#7a4a26');P(tx-1+1,ty+1,1,1,'#a0683a');P(tx+1,ty+2,1,4,'#4a2a14');P(tx,ty-2,1,2,'#8a7a4a');}
  const m=5+((r()*4)|0);for(let i=0;i<m;i++)blade(9+r()*16,12+r()*14,(r()-.5)*16,r()<.35?dry:front,r()<.6);
  for(let x=10;x<25;x++)if(r()<.7)P(x,45+((r()*2)|0),1,1,'#1e2c18');},null);}
// a sapling: a thin trunk and a small autumn crown, its own shape each time
function l35Sapling(v){const CR=[['#4a2e0e','#8a5a18','#c08a2c','#e8c060'],['#4a1e0c','#8a3a16','#c0662a','#e89a50'],['#20341a','#3a5626','#5a7634','#86a04a']][v%3];
  return l35Spr('l35_sapling'+v,30,48,15,46,(P)=>{const r=l35Rng(5300+v*131);
    for(let y=46;y>=22;y--){const x=15+Math.round((46-y)*.04*(v%2?1:-1));P(x,y,2,1,'#3a2a1c');P(x,y,1,1,'#5e4630');}
    P(16,32,1,1,'#3a2a1c');P(17,31,1,1,'#3a2a1c');P(13,29,1,1,'#3a2a1c');P(12,28,1,1,'#3a2a1c');
    const blobs=[[15,17,7],[10,22,5],[20,21,5],[15,11,5]].map(([x,y,rr])=>[x+(r()-.5)*3,y+(r()-.5)*2,rr+(r()-.5)*1.5]);
    for(let y=2;y<34;y++)for(let x=1;x<29;x++){let inside=false,best=-9;for(const [bx,by,br] of blobs){const dx=x-bx,dy=y-by,d=Math.hypot(dx,dy*1.12);if(d<br){inside=true;best=Math.max(best,(-dx-dy*1.2)/br);}}
      if(!inside)continue;const n=hash(x*7+v,y*5);P(x,y,1,1,best>.55?CR[3]:best>.05?(n<.12?CR[3]:CR[2]):best>-.6?(n<.1?CR[1]:CR[2]):CR[1]);}},{c:[30,20,10],skip:(x,y)=>y>33});}
// the plough: a rusted walking plough left in its last furrow, the handles still up as if somebody had only just let go
function l35Plough(){return l35Spr('l35_plough',56,36,30,31,(P,g)=>{
  const line=(x1,y1,x2,y2,c,w)=>{const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1));for(let k=0;k<=n;k++)P(x1+(x2-x1)*k/n,y1+(y2-y1)*k/n,w||1,w||1,c);};
  // earth thrown up at the share, and the grass round it
  for(let x=30;x<52;x++){const h=Math.round(3-Math.abs(x-40)*.22);for(let y=0;y<h;y++)P(x,31-y,1,1,y===h-1?'#8a6a40':y===0?'#4a3020':'#6a4a2c');}
  // handles: two ash poles from the beam back and up to the grips
  line(26,23,6,6,'#4a3020',2);line(26,22,6,5,'#7a5434');line(30,22,11,4,'#4a3020',2);line(30,21,11,3,'#a07448');P(5,5,3,2,'#3a2414');P(10,2,3,2,'#3a2414');
  line(9,13,14,12,'#5e4028');line(16,15,21,14,'#5e4028');
  // the beam, wood with an iron strap
  line(22,23,48,15,'#3e2a18',3);line(22,22,48,14,'#7a5434');line(30,20,31,20,'#8a8a90');line(40,17,41,17,'#8a8a90');
  // the mouldboard: a twisted iron plate gone to rust, lit along its top curve
  const mb=[[29,22],[40,19],[44,25],[39,31],[30,30]];g.fillStyle='#6a3018';g.beginPath();mb.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
  for(let x=30;x<43;x++)P(x,22-Math.round((x-29)*.25),1,1,'#b0602e');for(let x=32;x<40;x++)P(x,23-Math.round((x-29)*.25),1,1,'#8a4422');P(34,21,2,1,'#d08048');
  for(let y=26;y<31;y++)P(41-(y-26),y,1,1,'#3e1a0c');
  // the share and the coulter, iron, the point down in the earth
  line(39,30,47,29,'#4a4038',2);P(47,28,2,1,'#8a7a6a');line(43,15,44,27,'#4a4038');line(42,15,42,22,'#8a8070');
  // the little gauge wheel at the front
  for(let a=0;a<6.3;a+=.25){P(50+Math.cos(a)*3.6,21+Math.sin(a)*3.6,1,1,'#3a2a20');}line(50,18,50,24,'#5a4a3a');line(47,21,53,21,'#5a4a3a');P(48,18,2,1,'#9a8a70');
  // grass grown up through it
  for(const [x,h] of [[24,5],[27,7],[33,4],[36,6],[45,5],[48,4],[52,6]]){for(let k=0;k<h;k++)P(x+(k>h/2?1:0),31-k,1,1,k<2?'#3a5028':'#7a7a3e');}
  },{c:[30,18,10],skip:(x,y)=>y>=31});}
// a five-bar field gate, swung back against the fence beside the gateway
function l35Gate(){return l35Spr('l35_gate',66,26,0,23,(P)=>{const W=['#3e3428','#62584a','#867a62','#a89c80'];
  for(const x of [0,62]){P(x,2,4,22,W[1]);P(x,2,1,22,W[3]);P(x+3,2,1,22,W[0]);P(x,2,4,1,W[2]);}
  for(const y of [5,9,13,17,21]){P(4,y,58,2,W[1]);P(4,y,58,1,W[2]);}
  for(let k=0;k<54;k++){const x=6+k,y=Math.round(21-k*.3);P(x,y,2,2,W[1]);P(x,y,1,1,W[3]);}
  P(56,10,3,2,'#3a3a40');P(56,10,1,1,'#8a8a90');},{c:[26,20,14]});}
// a length of old fence down in the grass: one post still standing, the rails slid off it, the next post lying beside them
function l35FenceDown(){return l35Spr('l35_fencedown',72,34,36,30,(P)=>{const W=['#3a3228','#5e5446','#827660','#a49880'];
  const line=(x1,y1,x2,y2,w)=>{const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1));for(let k=0;k<=n;k++){const x=x1+(x2-x1)*k/n,y=y1+(y2-y1)*k/n;P(x,y,1,w,W[1]);P(x,y,1,1,W[3]);P(x,y+w-1,1,1,W[0]);}};
  P(8,6,4,25,W[1]);P(8,6,1,25,W[3]);P(11,6,1,25,W[0]);P(8,6,4,1,W[2]);P(12,12,5,2,W[1]);P(12,12,5,1,W[2]);
  line(12,9,62,27,3);line(16,28,58,26,3);
  P(46,29,22,4,W[1]);P(46,29,22,1,W[3]);P(46,32,22,1,W[0]);P(67,29,1,4,W[2]);
  for(const [x,h] of [[20,4],[26,6],[33,3],[40,5],[52,4],[57,6]]){for(let k=0;k<h;k++)P(x+(k>h/2?1:0),31-k,1,1,k<2?'#3a5028':'#7a7a3e');}},{c:[26,20,14]});}
// a hedgerow as one grows: runs of the same shrub with now and then another pushed in, clumps that touch and overlap, gaps
// where it has died back, the odd field tree standing up out of it; never one bush at every step
const L35_HEDGE=[['bush_gold',3],['sumac',2],['holly',1],['bush_red',1.5],['elder',1.5],['bush_green',1.2]];
function l35Hedge(x0,x1,z,seed,skip){const k0=l35Hash(String(seed),11)*50;let dom=l35Pick(L35_HEDGE),run=0;
  for(let x=x0;x<x1;){const gap=fbm(x*.16+k0,z*.05+3);if(gap<.36){x+=1.4+l35R()*1.6;continue;}   // a gap where it died back
    if(skip&&skip(x)){x+=1;continue;}
    if(run<=0){dom=l35R()<.62?dom:l35Pick(L35_HEDGE);run=2+((l35R()*4)|0);}run--;
    const tr=l35R()<.07,sp=tr?l35Pick([['oak_russet',2],['maple_gold',1],['maple_orange',1]]):(l35R()<.78?dom:l35Pick(L35_HEDGE));
    const hz=z+(l35R()-.5)*.55+(fbm(x*.3,k0)-.5)*.4;
    if(!l35OnRoad(x,hz,.6)&&!LAYERS.water(x,hz)&&l35Free(x,hz,tr?.6:.32))l35Put(sp,x+(l35R()-.5)*.25,hz,{kind:tr?'tree':'bush',flip:l35R()<.5},tr?.4:.3);
    // now and then a second one tucked in behind, so the line thickens
    if(!tr&&l35R()<.3){const bx=x+(l35R()-.5)*.9,bz=hz-.45-l35R()*.2;if(!l35OnRoad(bx,bz,.6)&&!LAYERS.water(bx,bz)&&l35Free(bx,bz,.2))l35Put(l35R()<.7?dom:l35Pick(L35_HEDGE),bx,bz,{kind:'bush',flip:l35R()<.5},.25);}
    x+=tr?2.6:.95+l35R()*1.15;}}
function l35Build(){if(L35.built)return;L35.built=true;const t0=performance.now();if(!REGS.includes(L35.reg))REGS.push(L35.reg);RGK.low=L35.reg;
  for(let v=0;v<3;v++){l35Reeds(v);l35Sapling(v);}l35Plough();l35Gate();l35FenceDown();
  // 1. the edge of the world moves south; the fen's side stays shut
  for(let i=rects.length-1;i>=0;i--){const q=rects[i];if(Math.abs(q.z0-(L35.Z0+.5))<.01&&q.z1>L35.Z0+5&&q.x1-q.x0>300)rects.splice(i,1);}
  addRect(NEWB.x0-12,L35.Z0+.5,L35.XW,L35.Z0+14);                     // under the fen, as before
  addRect(L35.XW-1,L35.Z0,L35.XW,L35.Z1+14);                           // the west woods: as far as anyone goes
  NEWB.z1=L35.Z1;B.z1=L35.Z1;
  addRect(NEWB.x0-12,L35.Z1+.5,NEWB.x1+12,L35.Z1+14);addRect(NEWB.x1+2.5,L35.Z0,NEWB.x1+14,L35.Z1+14);
  // 2. the roads in: trees standing in them come down
  L35.roadRefs=[];for(const q of L35.roads){const r=q.slice(0,5);ROADS.push(r);L35.roadRefs.push(r);}
  for(const o of OBJ){if(o.hide||o.room||o.story||o.mile||o.town)continue;if(!/^(tree|pine|bush|deco|anim|grass)$/.test(o.kind||''))continue;if(o.z<230||o.x<L35.XW-4)continue;
    for(const q of L35.roads)if(segDist(o.x,o.z,q[0],q[1],q[2],q[3])<q[5]/2+1.1){l35Hide(o);break;}}
  for(const o of OBJ)if(!o.hide&&o.z>L35.Z0-6&&o.x>L35.XW-4&&o.x<250)l35Take(o.x,o.z,.6);
  // 3. plank bridges where the roads cross the stream
  for(const z of [302,354]){const cx=l35StreamX(z);put('footbridge',cx,z,0,{kind:'flat'});put('footbridge_rail',cx,z+.5,0,{kind:'prop',noCol:true});
    for(const s of [-1,1])addSeg(cx-2.3,z+s*.95,cx+2.3,z+s*.95,.12);DOCKS.push({x:cx,z,x0:cx-2.3,x1:cx+2.3,z0:z-.9,z1:z+.9});L35.bridges.push([cx,z]);l35Take(cx,z,2.6);}
  // 4. the pond, the old windpump on its bank with its trough, two bales left from somebody's last haying, and his fence down
  {const W=L35.pump;put('windpump',W.x,W.z,.45);obj('blades',W.x,W.z+.02,{kind:'anim',fps:6,yoff:135});put('barrel',W.x+1.15,W.z+.3,.3);l35Take(W.x,W.z,1.8);
    put('hay',W.x-3.4,W.z-1.6,.7);put('hay',W.x-4.9,W.z-.7,.7);l35Take(W.x-4.2,W.z-1.1,1.6);
    {const F=L35.fenceDown;put('l35_fencedown',F.x,F.z,0,{kind:'prop',noCol:true});l35Take(F.x,F.z,1.4);}
    let n=0;for(let a=0;a<160&&n<30;a++){const t=l35R()*6.283,d=1.0+l35R()*.18;const x=L35.pond.x+Math.cos(t)*L35.pond.rx*d,z=L35.pond.z+Math.sin(t)*L35.pond.rz*d;if(l35InPond(x,z)||!l35Free(x,z,.3))continue;
      if(Math.hypot(x-W.x,z-W.z)<1.6)continue;obj('l35_reeds'+((l35R()*3)|0),x,z,{kind:'prop',noCol:true,flip:l35R()<.5});l35Take(x,z,.3);n++;}}
  // 5. reeds along the stream, both banks, in clumps with gaps between, clear of the bridges
  for(let z=L35.Z0+1;z<L35.Z1-2;z+=1.3){if(L35.bridges.some(b=>Math.abs(b[1]-z)<2.6))continue;if(fbm(z*.18,7)<.42)continue;const cx=l35StreamX(z);
    for(const s of [-1,1]){if(l35R()<.45)continue;const x=cx+s*(1.35+l35R()*.9);if(LAYERS.water(x,z)||!l35Free(x,z,.3))continue;obj('l35_reeds'+((l35R()*3)|0),x,z+(l35R()-.5)*.3,{kind:'prop',noCol:true,flip:l35R()<.5});l35Take(x,z,.3);}}
  // 6. the fields: a rail fence along each plot's road side with a gateway by its FOR SALE sign and the gate swung back, a
  //    hedgerow at its back; the hedgerow along South Road and the windbreak along the south edge as before
  for(const P of LAND_PARCELS){if(!P.low)continue;const z=P.z0-.55,g0=P.x0+.6,g1=P.x0+3.4;
    fenceLine(g1+2.06,z,P.x0+P.w,z,0,'fence');addSeg(g1+2.06,z+.05,P.x0+P.w,z+.05,.1);
    obj('fence_v',g0,z+.12,{kind:'fence'});obj('fence_v',g1,z+.12,{kind:'fence'});addCircle(g0,z,.14);addCircle(g1,z,.14);
    obj('l35_gate',g1,z+.12,{kind:'prop',noCol:true});addSeg(g1,z+.05,g1+2.06,z+.05,.1);l35Take(P.x0+P.w/2,z,.3);
    l35Hedge(P.x0+.8,P.x0+P.w-.4,P.z0+P.h+1.05,P.id);}
  l35Hedge(-56,194,351.4,'southroad',x=>Math.abs(x-20)<3.6||Math.abs(x-90)<3||Math.abs(x-170)<3||Math.abs(x-l35StreamX(352))<3.4);
  for(let x=-54;x<196;x+=4.2){if(Math.abs(x-20)<4||Math.abs(x-90)<3.5||Math.abs(x-170)<3.5||Math.abs(x-l35StreamX(398))<3.5)continue;
    const z=397.5+(l35R()-.5)*1.4,xx=x+(l35R()-.5)*1.2;if(!l35Open(xx,z,1.1))continue;l35Put(l35Pick([['maple_gold',2],['oak_russet',2],['maple_orange',1.5],['oak_green',1]]),xx,z,{kind:'tree'},.4);}
  // 7. the copses: each a knot of trees with brush under them, not a lone tree on a dark patch
  for(const c of L35.copses){let n=0;for(let t=0;t<300&&n<9;t++){const a=l35R()*6.283,d=Math.sqrt(l35R())*.85;const x=c[0]+Math.cos(a)*c[2]*d,z=c[1]+Math.sin(a)*c[2]*.7*d;
      if(!LAYERS.dark(x,z)||l35InPlot(x,z,1.2)||l35OnRoad(x,z,.9)||!l35Free(x,z,1.15))continue;l35Put(l35Pick(L35_WOODS),x,z,{kind:'tree'},.4);n++;}
    let m=0;for(let t=0;t<200&&m<6;t++){const a=l35R()*6.283,d=.85+l35R()*.45;const x=c[0]+Math.cos(a)*c[2]*d,z=c[1]+Math.sin(a)*c[2]*.7*d;
      if(l35InPlot(x,z,1)||l35OnRoad(x,z,.9)||!l35Free(x,z,.55))continue;l35Put(l35Pick([['bush_gold',2],['elder',2],['sumac',1],['holly',1]]),x,z,{kind:'bush'},.3);m++;}}
  // 8. woods: the west and east ends and the ragged northern edge, thick where the ground is dark
  {let placed=0;for(let t=0;t<9000&&placed<600;t++){const x=lerp(L35.XW+.8,NEWB.x1-1,l35R()),z=lerp(L35.Z0+.6,L35.Z1-1,l35R());if(!LAYERS.dark(x,z)||l35OnRoad(x,z,.9)||LAYERS.water(x,z))continue;
    if(L35.copses.some(c=>Math.hypot((x-c[0])/c[2],(z-c[1])/(c[2]*.7))<1.3))continue;
    if(l35InPlot(x,z,1.6)||!l35Free(x,z,1.1))continue;const sp=l35Pick(L35_WOODS);l35Put(sp,x+(l35R()-.5)*.3,z,{kind:/^spruce|^pine/.test(sp)?'pine':'tree'},.4);placed++;}
    L35.woods=placed;}
  // 9. scrub stepping out of the woods into the grass: brush and saplings thinning away from the edge, old stumps from the
  //    clearance, tall grass in the lee
  {const edge=[];for(let x=-60;x<197;x+=1.25)edge.push([x,l35EdgeZ(x),0,1]);for(let z=L35.Z0+8;z<L35.Z1-4;z+=1.25){edge.push([l35WestX(z),z,1,0]);edge.push([l35EastX(z),z,-1,0]);}
    for(const [ex,ez,dx,dz] of edge){const s=.6+Math.pow(l35R(),1.7)*6,x=ex+dx*s+(dz?(l35R()-.5)*.8:0),z=ez+dz*s+(dx?(l35R()-.5)*.8:0);if(l35R()>1.05-s*.14)continue;
      if(LAYERS.dark(x,z)||!l35Open(x,z,.5,.8))continue;const q=l35R();
      if(q<.36)l35Put(l35Pick([['bush_gold',2],['elder',2],['sumac',1.5],['bush_green',1],['holly',.6],['bush_red',.8]]),x,z,{kind:'bush'},.3);
      else if(q<.62)l35Put('l35_sapling'+((l35R()*3)|0),x,z,{kind:'prop',flip:l35R()<.5},.15);
      else if(q<.76)l35Put(l35Pick([['stump_oak',2],['stump_maple',1.5],['stump',1]]),x,z,{kind:'prop'},.25);
      else for(let k=0;k<3;k++){const xx=x+(l35R()-.5)*1.6,zz=z+(l35R()-.5)*.8;if(!l35Open(xx,zz,.15,.5))continue;obj(l35R()<.6?'tgold':'tgrass',xx,zz,{kind:'anim',grass:1,fps:1.4,ph:hash(xx*9|0,zz*9|0)*2});l35Take(xx,zz,.15);}}}
  // 10. lone field trees, field stones and tall gold grass on the open ground (none of it on a plot)
  {let n=0;for(let t=0;t<2000&&n<22;t++){const x=lerp(-60,196,l35R()),z=lerp(296,404,l35R());if(LAYERS.dark(x,z)||!l35Open(x,z,3.4))continue;l35Put(l35Pick([['oak_russet',3],['maple_gold',2],['oak_green',1],['maple_red',1]]),x,z,{kind:'tree'},.4);l35Take(x,z,4);n++;}}
  {let n=0;for(let t=0;t<3000&&n<40;t++){const x=lerp(-60,196,l35R()),z=lerp(294,404,l35R());if(LAYERS.dark(x,z)||!l35Open(x,z,.6,.6))continue;l35Put(l35R()<.6?'rock_0':'rock_1',x,z,{kind:'prop'},0);n++;}}
  {let n=0;for(let t=0;t<6000&&n<110;t++){const cx=lerp(-60,196,l35R()),cz=lerp(294,404,l35R());if(LAYERS.dark(cx,cz)||!l35Open(cx,cz,.8,.5))continue;if(l35Zone(cx,cz)[3]<.45)continue;const gold=l35Zone(cx,cz)[0]>.4||l35R()<.4;
    const k=2+((l35R()*3)|0);for(let j=0;j<k;j++){const x=cx+(l35R()-.5)*2.4,z=cz+(l35R()-.5)*1.3;if(!l35Open(x,z,.15,.4))continue;obj(gold?'tgold':'tgrass',x,z,{kind:'anim',grass:1,fps:1.4,ph:hash(x*9|0,z*9|0)*2});l35Take(x,z,.15);}n++;}}
  // 11. the plough, where its furrows stop
  {const Pl=L35.plough;l35Put('l35_plough',Pl.x,Pl.z,{kind:'prop'},.35);
    for(const [x,z] of [[Pl.x-2.2,Pl.z+.6],[Pl.x+1.6,Pl.z-.4],[Pl.x-.6,Pl.z+1.1]]){if(!l35Free(x,z,.15))continue;obj('tgold',x,z,{kind:'anim',grass:1,fps:1.4,ph:hash(x*9|0,z*9|0)*2});l35Take(x,z,.15);}
    interact.push({x:Pl.x,z:Pl.z+.4,r:1.3,on:()=>!S.room,label:()=>'Look',ok:()=>true,act(){toast('A walking plough, rusted into its last furrow. Three furrows, and then he stopped. The handles are worn bright where somebody held them, and the reins are still knotted to the hook, cut through.',5.2);}});}
  // 12. signs and the milestone, at the corner of the junction where you'd look for it
  const sign=(x,z,label)=>{const o=put('signpost',x,z,.2,{kind:'prop',label,face:'P'});try{o.spr=signSprite(label,'plain');}catch(e){}l35Take(x,z,.6);return o;};
  sign(22.9,239.4,'LOW FIELDS');sign(22.6,299.4,'THE LOW FIELDS');sign(129.2,298.8,'LOW FIELDS');sign(-60.4,300,'BOTTOM ROAD');
  {const m=L35.mile;l35Put('rg_mile',m.x,m.z,{kind:'prop',mile:m.k},.28);
    interact.push({x:m.x,z:m.z+.5,r:1.3,on:()=>!S.room,label:()=>'Milestone',ok:()=>true,act(){rgTravel(m);}});}
  if(typeof NAV!=='undefined')NAV.sig='';
  L35.ms=Math.round(performance.now()-t0);console.log('low fields built',L35.ms+'ms',OBJ.length);}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{l35Build();}catch(e){console.error('low fields',e);}try{landSync();}catch(e){}return r;};}
