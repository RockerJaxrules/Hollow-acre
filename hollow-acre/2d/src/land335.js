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
  pond:{x:70,z:380,rx:7,rz:4.3},pump:{x:63.6,z:375.6},junction:{x:20,z:302},mile:{k:'low',name:'The Low Fields',x:17.9,z:300.3},
  bridges:[],copses:[[-10,341,5],[-45,338,4],[128,343,4.5],[184,342,5],[2,389,4],[118,392,4.5]],
  plough:{x:5.2,z:334.2},scars:[[-6.4,333.3,4.2,333.6],[-5.6,334.1,4.4,334.4],[-4.5,334.9,3.9,335.1]],fenceDown:{x:68.8,z:372.6}};
// ---------------------------------------------------------------- the roads: gentle bends, flat over the bridges
const l35StreamX=z=>RGP.dam.x+(fbm(z*.2,3)-.5)*3;      // the dam's spillway (regions.js inSpill), running on south
{const S1=l35StreamX(302),S2=l35StreamX(354);
  L35.lines=[
    {w:2.4,p:[[20,236],[20.5,252],[19.6,270],[20,290],[20,302],[20.8,318],[21,330],[20.4,344],[20,354],[19.3,368],[19,382],[19.5,398]]},   // Mill Road
    {w:1.6,p:[[118,255],[119.5,268],[122.4,282],[125.3,294],[127,302]]},                                                                  // the dam road
    {w:2,p:[[-62,302.4],[-44,302.1],[-20,301.6],[0,301.7],[20,302],[40,302.4],[62,302.3],[90,302],[110,301.7],[127,302],[S1-3.6,302],[S1+3.6,302],[156,302.3],[170,302],[184,301.7],[196,301.9]]},   // Bottom Road
    {w:1.8,p:[[-62,353.5],[-36,354.2],[-8,354.5],[20,354],[44,353.5],[66,353.7],[90,354],[112,354.3],[S2-3.6,354],[S2+3.6,354],[158,353.6],[170,354],[186,354.4],[196,354.1]]},   // South Road
    {w:1.6,p:[[90,302],[90.7,318],[90.9,336],[90,354],[89.3,372],[89.6,386],[90.2,398]]},                                                  // the lanes
    {w:1.6,p:[[170,302],[169.3,320],[169.6,338],[170,354]]},
    {w:1.1,p:[[90.2,327.4],[84,327.1],[78,327.7],[73.4,327.3]]},                                                                           // a cart track to the patch
    {w:1.1,p:[[19.7,378.6],[10,378.2],[0,378.9],[-12,378.4],[-27.2,378.6]]}];                                                                // and to the west strip
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
// which side of a plot faces a road or track: the gate goes there, the fences run round the rest, the hedge grows at its back
function l35Side(x0,z0,w,h){let best='N',bd=1e9;for(const [s,x,z] of [['N',x0+w/2,z0-2.2],['W',x0-2.2,z0+h/2],['E',x0+w+2.2,z0+h/2]]){let d=1e9;for(const q of L35.roads)d=Math.min(d,segDist(x,z,q[0],q[1],q[2],q[3]));if(d<bd-.01){bd=d;best=s;}}return best;}
L35_PLOTS.forEach(([id,name,x0,z0,w,h,desc],i)=>{const side=l35Side(x0,z0,w,h);
  const sign=side==='N'?[x0+.25,z0-1.35]:side==='W'?[x0-1.45,z0+.55]:[x0+w+1.45,z0+.55];
  const P={id:'lf_'+id,name,x0,z0,w,h,price:l35Price(w*h),kk:20+i,low:true,bank:true,side,sign,desc:`${desc} Out in the Low Fields, south down Mill Road past the Deep Corn.`};LAND_PARCELS.push(P);});
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
  // the plank bridges, the copses (a knot of crowns each) and every plot's hedgerow, as on the world map
  for(const z of [302,354]){const cx=l35StreamX(z);g+=`<rect x="${(cx-2.3).toFixed(1)}" y="${z-1}" width="4.6" height="2" fill="#8a6038" stroke="#4a3018" stroke-width=".35"/>`;}
  for(const c of L35.copses)for(let k=0;k<7;k++){const a=k*2.4+c[0]*.1,d=(k%3)*.32*c[2];const x=c[0]+Math.cos(a)*d,z=c[1]+Math.sin(a)*d*.7;g+=`<circle cx="${x.toFixed(1)}" cy="${z.toFixed(1)}" r="${(1.5+(k%2)*.6).toFixed(1)}" fill="${k%3===1?'#9a6a2a':'#5a6a32'}" stroke="#2e3a1a" stroke-width=".3"/>`;}
  const hedge=(x1,z1,x2,z2)=>{const n=Math.max(2,Math.round(Math.hypot(x2-x1,z2-z1)/2.2));for(let k=0;k<=n;k++){const x=x1+(x2-x1)*k/n,z=z1+(z2-z1)*k/n;if(fbm(x*.16,z*.16)<.36)continue;g+=`<circle cx="${x.toFixed(1)}" cy="${z.toFixed(1)}" r="1.05" fill="#5a6a32"/>`;}};
  for(const P of ps){if(P.side==='N')hedge(P.x0,P.z0+P.h+1.2,P.x0+P.w,P.z0+P.h+1.2);else if(P.side==='W')hedge(P.x0+P.w+1.25,P.z0,P.x0+P.w+1.25,P.z0+P.h);else hedge(P.x0-1.25,P.z0,P.x0-1.25,P.z0+P.h);}
  {const Q=L35.pond,pp=[];for(let k=0;k<36;k++){const t=k/36*6.283,e=l35PondEdge(t);pp.push(`${(Q.x+Math.cos(t)*Q.rx*e).toFixed(1)},${(Q.z+Math.sin(t)*Q.rz*e).toFixed(1)}`);}g+=`<polygon points="${pp.join(' ')}" fill="#3a78a8"/>`;}
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
// the pond: lobed and bitten, never an ellipse (f<0 is water)
const l35PondF=(x,z)=>{const Q=L35.pond;const dx=(x-Q.x)/Q.rx,dz=(z-Q.z)/Q.rz;return dx*dx+dz*dz-(1+.2*Math.sin(Math.atan2(dz,dx)*3+1.3)+(fbm(x*.18+4,z*.18+2)-.5)*.5+(fbm(x*.5+9,z*.5)-.5)*.3);};
const l35InPond=(x,z)=>l35PondF(x,z)<0;
// how far out the shore lies along an angle (in pond radii): march out from the middle until the water stops
const l35PondEdge=t=>{const Q=L35.pond;let d=.3;while(d<2&&l35InPond(Q.x+Math.cos(t)*Q.rx*d,Q.z+Math.sin(t)*Q.rz*d))d+=.03;return d;};
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
  const Q=L35.pond;if(Math.abs(x-Q.x)<Q.rx*1.5&&Math.abs(z-Q.z)<Q.rz*1.6){const f=l35PondF(x,z);if(f>=0&&f<.42+(fbm(x*.9,z*.9)-.5)*.5)return true;}
  return false;};}
{const Dk=LAYERS.dark;LAYERS.dark=(x,z)=>{
  if(!l35Low(z)){if(z>230&&L35.built&&l35OnRoad(x,z,.02+.75*Math.max(0,fbm(x*.21+5,z*.21+2)-.46)+.35*Math.max(0,fbm(x*.9+1,z*.9+3)-.6)))return false;   // the new roads through the old woods: the woods floor up to the road, a scrap of grass verge here and there
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
  // 2. the zone fields on a coarse grid (a quarter of a pace), read back smoothly; Zn is a finer wander for every border
  const G=N*4+1,Zd=new Float32Array(G*G),Zw=new Float32Array(G*G),Zp=new Float32Array(G*G),Zt=new Float32Array(G*G),Zn=new Float32Array(G*G);
  for(let j=0;j<G;j++)for(let i=0;i<G;i++){const wx=x0+i/4,wz=z0+j/4,z=l35Zone(wx,wz),k=j*G+i;Zd[k]=z[0];Zw[k]=z[1];Zp[k]=z[2];Zt[k]=z[3];Zn[k]=fbm(wx*.85+13,wz*.85+3);}
  const at=(A,px,py)=>{const fx=px/8,fy=py/8,i=Math.min(G-2,fx|0),j=Math.min(G-2,fy|0),u=fx-i,v=fy-j,k=j*G+i;return A[k]*(1-u)*(1-v)+A[k+1]*u*(1-v)+A[k+G]*(1-u)*v+A[k+G+1]*u*v;};
  // every border (zone to zone, patch, headland) wanders with Zn and breaks up in 3-pixel clumps, so none is a ruled line
  const jitAt=(px,py,wx,wz)=>(at(Zn,px,py)-.5)*.16+(hash((wx*10.67)|0,(wz*10.67)|0)-.5)*.06;
  const plots=LAND_PARCELS.filter(P=>P.low&&P.x0<x0+N+1&&P.x0+P.w>x0-1&&P.z0<z0+N+1&&P.z0+P.h>z0-1);
  const plotAt=(wx,wz)=>{for(const P of plots)if(wx>=P.x0&&wx<P.x0+P.w&&wz>=P.z0&&wz<P.z0+P.h)return P;return null;};
  const edgeOf=(P,wx,wz)=>Math.min(wx-P.x0,P.x0+P.w-wx,wz-P.z0,P.z0+P.h-wz);
  const onHead=(P,wx,wz,px,py,h3)=>edgeOf(P,wx,wz)+(at(Zn,px,py)-.5)*1.1+(h3-.5)*.3<.62;   // the trodden headland: a band that wanders
  // 3. tufts: the bright clusters, thinned where the grass is thin and off the trodden headlands; shadows only under the kept ones
  const core=new Uint8Array(n);for(let i=0;i<n;i++)if(grass[i]&&L[i]>=base+20)core[i]=1;
  const comp=new Int32Array(n).fill(-1),keep=[];const stack=[];
  for(let s0=0;s0<n;s0++){if(!core[s0]||comp[s0]>=0)continue;const c=keep.length;let cx=0,cy=0,m=0;stack.push(s0);comp[s0]=c;
    while(stack.length){const p=stack.pop(),px=p%W,py=(p/W)|0;cx+=px;cy+=py;m++;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const qx=px+dx,qy=py+dy;if(qx<0||qy<0||qx>=W||qy>=W)continue;const q=qy*W+qx;if(core[q]&&comp[q]<0){comp[q]=c;stack.push(q);}}}
    cx/=m;cy/=m;const wx=x0+cx/32,wz=z0+cy/32,P=plotAt(wx,wz);const dens=at(Zt,cx,cy);
    let pk=clamp(.15+(dens-.3)*1.7,0,1);if(P&&onHead(P,wx,wz,cx,cy,.5))pk*=.15;
    keep.push(m>=2&&hash((wx*7)|0,(wz*7)|0)<pk);}
  const shade=new Uint8Array(n);for(let i=0;i<n;i++){if(!core[i]||!keep[comp[i]])continue;const px=i%W,py=(i/W)|0;for(let dy=1;dy<=3;dy++)for(let dx=-1;dx<=1;dx++){const qx=px+dx,qy=py+dy;if(qx>=0&&qy<W&&qx<W)shade[qy*W+qx]=1;}}
  // 4. paint
  const TH=[.34,.63],mixc=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  const ZR=[L35_RAMP.olive,L35_RAMP.tawny,L35_RAMP.straw];
  const rampAt=(px,py,wx,wz)=>{const j=jitAt(px,py,wx,wz),wt=at(Zw,px,py);if(wt+j*1.3>.5)return L35_RAMP.green;const d=at(Zd,px,py)+j;return ZR[d<TH[0]?0:d<TH[1]?1:2];};
  for(let py=0;py<W;py++){const wz=z0+(py+.5)/32;if(wz<L35.Z0)continue;const wl=clamp((wz-L35.Z0)/5,0,1);
    for(let px=0;px<W;px++){const i=py*W+px;if(!grass[i])continue;const wx=x0+(px+.5)/32;
      const R=rampAt(px,py,wx,wz),pick=k=>R[k],pn=at(Zp,px,py),h3=hash((wx*10.67)|0,(wz*10.67)|0);
      let c;const P=plotAt(wx,wz);
      if(core[i]&&keep[comp[i]])c=pick(L[i]>=base+44?'hi':'lt');
      else if(shade[i]&&L[i]<=base-6)c=pick('sh');
      else c=pn+jitAt(px,py,wx,wz)*.8>.64?pick('dk'):pick('b');
      if(P){if(onHead(P,wx,wz,px,py,h3))c=mixc(c,L35_WORN,.3);                                   // the headland, trodden round the edge
        else if(edgeOf(P,wx,wz)>1.1){                                                             // old furrows: low wavy ridges that come and go
          const m=clamp((at(Zp,px,py)-.36)*3.2,0,1);if(m>0){const v=((wz-P.z0)+.22*Math.sin(wx*.45+P.x0)+(at(Zn,px,py)-.5)*.35)/1.3,f=v-Math.floor(v);
            if(f<.09)c=mixc(c,pick('lt'),.26*m);else if(f>.44&&f<.6)c=mixc(c,pick('dk'),.4*m);}}}
      // the plough's three scars: worn earth tapering out raggedly at both ends
      for(const s2 of L35.scars){const dx=s2[2]-s2[0],dz=s2[3]-s2[1],L2=dx*dx+dz*dz;const t=clamp(((wx-s2[0])*dx+(wz-s2[1])*dz)/L2,0,1);
        const tap=Math.min(1,t/.25,(1-t)/.1)*(.7+.6*hash((wx*6)|0,(wz*5)|0));const q=segDist(wx,wz,s2[0],s2[1],s2[2],s2[3]);
        if(q<.13*tap){c=mixc(L35_WORN,[84,64,42],.45);break;}else if(q<.21*tap){c=mixc(c,L35_WORN,.5);break;}}
      const o=i*4;if(wl<1){D[o]=D[o]+(c[0]-D[o])*wl;D[o+1]=D[o+1]+(c[1]-D[o+1])*wl;D[o+2]=D[o+2]+(c[2]-D[o+2])*wl;}else{D[o]=c[0];D[o+1]=c[1];D[o+2]=c[2];}}}
  // 5. thick places get more tufts than the old ground ever had: a small three-tone clump on a jittered grid
  const ST=[[2,0,'hi'],[1,1,'hi'],[2,1,'lt'],[4,1,'hi'],[0,2,'lt'],[1,2,'lt'],[2,2,'lt'],[3,2,'hi'],[4,2,'lt'],[0,3,'lt'],[1,3,'lt'],[2,3,'lt'],[3,3,'lt'],[4,3,'lt'],[1,4,'sh'],[2,4,'sh'],[3,4,'sh'],[4,4,'sh']];
  const gx0=Math.floor((x0*32-8)/13),gx1=Math.floor((x0*32+W+8)/13),gy0=Math.floor((z0*32-8)/13),gy1=Math.floor((z0*32+W+8)/13);
  for(let gy=gy0;gy<=gy1;gy++)for(let gx=gx0;gx<=gx1;gx++){const ax=gx*13+Math.floor(hash(gx,gy*7+1)*9),ay=gy*13+Math.floor(hash(gx*3+5,gy)*9);const wx=ax/32,wz=ay/32;if(wz<L35.Z0+3)continue;
    const lx=ax-x0*32,ly=ay-z0*32;const cxp=clamp(lx,0,W-1),cyp=clamp(ly,0,W-1);const dens=at(Zt,cxp,cyp);if(dens<.55||hash(gx*11,gy*13)>(dens-.55)*2.6)continue;
    const P=plotAt(wx,wz);if(P&&onHead(P,wx,wz,cxp,cyp,.5))continue;if(LAYERS.dirt(wx,wz)||LAYERS.water(wx,wz)||LAYERS.dark(wx,wz))continue;
    const R=rampAt(cxp,cyp,wx,wz);const fl=hash(gx,gy)<.5;
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
  l35PondF(x,z)>1.1&&Math.hypot(x-L35.pump.x,z-L35.pump.z)>3.2&&l35Free(x,z,r);}
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
// a sapling: a leaning stick of a trunk that forks into three thin limbs, leaves in loose clumps along and at the end of each,
// daylight between and through them, a few leaves already down. The limbs aren't outlined (an outline makes them clubs).
function l35Sapling(v){const CR=[['#4a2e0e','#8a5a18','#c08a2c','#e8c060'],['#4a1e0c','#8a3a16','#c0662a','#e89a50'],['#20341a','#3a5626','#5a7634','#86a04a']][v%3];
  const WD=40,wood=new Set();
  return l35Spr('l35_sapling'+v,WD,52,20,50,(P)=>{const r=l35Rng(5300+v*131),side=v%2?1:-1,lean=side*(1+r()*2);
    const pw=(x,y,c)=>{P(x,y,1,1,c);wood.add(y*WD+x);};
    const limb=(x1,y1,x2,y2)=>{const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1));for(let k=0;k<=n;k++)pw(Math.round(x1+(x2-x1)*k/n),Math.round(y1+(y2-y1)*k/n),k<n*.5?'#3a2a1c':'#4e3a26');};
    for(let y=50;y>=30;y--){const t=(50-y)/20,x=Math.round(20+lean*t);pw(x,y,'#3a2a1c');if(y>43){pw(x+1,y,'#5e4630');}}
    const fx=Math.round(20+lean),fy=30;
    const ends=[[fx-side*(7+r()*3),fy-11-r()*4],[fx+side*(6+r()*3),fy-15-r()*4],[fx+(r()-.5)*4,fy-20-r()*3]];
    for(const [ex,ey] of ends)limb(fx,fy,Math.round(ex),Math.round(ey));
    const blobs=[];for(const [ex,ey] of ends){for(let i=0;i<3;i++)blobs.push([ex+(r()-.5)*6,ey+(r()-.5)*4,1.6+r()*1.9]);
      blobs.push([(ex+fx)/2+(r()-.5)*3,(ey+fy)/2+(r()-.5)*2,1.2+r()*1.3]);}
    for(let y=1;y<40;y++)for(let x=1;x<WD-1;x++){let best=-9;for(const [bx,by,br] of blobs){const dx=x-bx,dy=y-by,d=Math.hypot(dx,dy*1.15);if(d<br)best=Math.max(best,(-dx-dy*1.2)/br);}
      if(best<=-9)continue;if(hash(x*7+v*3,y*5+v)<.13)continue;const n=hash(x*7+v,y*5);P(x,y,1,1,best>.5?CR[3]:best>0?(n<.14?CR[3]:CR[2]):best>-.6?(n<.12?CR[1]:CR[2]):CR[1]);wood.delete(y*WD+x);}
    for(let i=0;i<3;i++)P(10+((r()*20)|0),49+((r()*2)|0),1,1,CR[2]);},{c:[30,20,10],skip:(x,y)=>y>40||wood.has(y*WD+x)});}
// a gatepost: thicker than the rail posts, its top cut at a slant
function l35PostSpr(){return l35Spr('l35_post',10,32,5,30,(P)=>{const W=['#3e3428','#62584a','#867a62','#a89c80'];
  P(3,4,4,27,W[1]);P(3,4,1,27,W[3]);P(6,4,1,27,W[0]);P(3,3,4,1,W[2]);P(3,2,2,1,W[2]);P(4,10,2,1,W[0]);P(4,19,2,1,W[0]);},{c:[26,20,14]});}
// the gate of a road-side gateway, swung open into the field at an angle, so its bars show: hinged on the post at the top left
function l35GateN(){return l35Spr('l35_gate_n',58,80,4,54,(P)=>{const W=['#3e3428','#62584a','#867a62','#a89c80'];
  const hx=4,hy=30,tx=48,ty=74;
  const line=(x1,y1,x2,y2,c,w)=>{const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1));for(let k=0;k<=n;k++)P(Math.round(x1+(x2-x1)*k/n),Math.round(y1+(y2-y1)*k/n),w||1,1,c);};
  for(const h of [4,8,12,16,20]){line(hx,hy-h,tx,ty-h,W[1],2);line(hx,hy-h-1,tx,ty-h-1,W[3]);line(hx+1,hy-h+1,tx+1,ty-h+1,W[0]);}
  line(hx+1,hy-4,tx-1,ty-20,W[2],2);                                                   // the brace
  for(let y=ty-23;y<=ty;y++){P(tx-1,y,3,1,W[1]);P(tx-1,y,1,1,W[3]);P(tx+1,y,1,1,W[0]);}P(tx-3,ty-14,2,2,'#3a3a40');   // the far stile and its latch
  for(let y=hy-23;y<=hy;y++){P(hx,y,2,1,W[1]);P(hx,y,1,1,W[3]);}},{c:[26,20,14]});}
// the same gate swung open along a side fence (a side gateway), seen side-on
function l35GateLeaf(){return l35Spr('l35_gateleaf',62,26,1,23,(P)=>{const W=['#3e3428','#62584a','#867a62','#a89c80'];
  P(1,2,3,22,W[1]);P(1,2,1,22,W[3]);P(56,2,3,22,W[1]);P(56,2,1,22,W[3]);
  for(const y of [5,9,13,17,21]){P(4,y,52,2,W[1]);P(4,y,52,1,W[2]);}
  for(let k=0;k<50;k++){const x=5+k,y=Math.round(21-k*.32);P(x,y,2,2,W[1]);P(x,y,1,1,W[3]);}P(52,10,3,2,'#3a3a40');P(52,10,1,1,'#8a8a90');},{c:[26,20,14]});}
// two crows on a rail, one hunched, one with its head down to look at you
function l35Crows(){return l35Spr('l35_crows',34,36,17,34,(P)=>{const B=['#0e0c12','#1c1a24','#2e2c3a','#4a4a5e'];
  const crow=(x,y,fl,down)=>{const s=fl?-1:1;for(let j=0;j<5;j++)for(let i=-4;i<=3;i++){if(Math.abs(i+.5)+Math.abs(j-2)*.8>4.6)continue;P(x+i*s,y+j,1,1,j<1?B[2]:B[1]);}
    P(x-5*s,y+3,1,1,B[1]);P(x-6*s,y+4,2,1,B[0]);P(x-7*s,y+5,1,1,B[0]);                                         // tail
    const hx=x+(down?4:3)*s,hy=y+(down?2:-2);P(hx,hy,3*s>0?3:1,3,B[1]);if(s<0)P(hx-2,hy,3,3,B[1]);P(hx+(s>0?1:-1),hy,1,1,B[3]);   // head, an eye that catches the light
    P(hx+(s>0?3:-3),hy+1,2*s>0?2:1,1,'#5a5a64');if(s<0)P(hx-4,hy+1,2,1,'#5a5a64');                             // beak
    P(x-1*s,y+5,1,2,B[0]);P(x+1*s,y+5,1,2,B[0]);P(x-2*s,y+2,3,1,B[3]);};
  crow(9,8,false,false);crow(24,9,true,true);},{c:[8,6,10]});}
// a wind-chime of bones hung from a gatepost: knuckle bones and a bird's skull on twine below a crossed stick
function l35Chime(){return l35Spr('l35_chime',14,34,3,32,(P)=>{const T='#6a5a3a',Bn=['#a8a088','#d8d0b4','#f0ead4'];
  P(1,3,11,1,'#4a3a24');P(2,2,1,3,'#4a3a24');
  for(const [x,len,end] of [[3,9,'k'],[6,13,'s'],[9,8,'k'],[11,11,'k']]){for(let y=4;y<4+len;y++)P(x,y,1,1,T);
    const y=4+len;if(end==='s'){P(x-1,y,3,3,Bn[1]);P(x-1,y,1,1,Bn[2]);P(x,y+1,1,1,'#3a3428');P(x,y+3,1,2,Bn[0]);}else{P(x,y,1,3,Bn[1]);P(x,y,1,1,Bn[2]);P(x-1,y+3,3,1,Bn[0]);}}},{c:[34,28,20]});}
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
function l35Hedge(a0,a1,c,seed,skip,vert){const k0=l35Hash(String(seed),11)*50;let dom=l35Pick(L35_HEDGE),run=0;
  const XY=(a,b)=>vert?[b,a]:[a,b];   // a runs along the hedge, b across it
  for(let a=a0;a<a1;){const gap=fbm(a*.16+k0,c*.05+3);if(gap<.36){a+=1.4+l35R()*1.6;continue;}   // a gap where it died back
    if(skip&&skip(a)){a+=1;continue;}
    if(run<=0){dom=l35R()<.62?dom:l35Pick(L35_HEDGE);run=2+((l35R()*4)|0);}run--;
    const tr=l35R()<.07,sp=tr?l35Pick([['oak_russet',2],['maple_gold',1],['maple_orange',1]]):(l35R()<.78?dom:l35Pick(L35_HEDGE));
    const [x,hz]=XY(a+(l35R()-.5)*.25,c+(l35R()-.5)*.55+(fbm(a*.3,k0)-.5)*.4);
    if(!l35OnRoad(x,hz,.6)&&!LAYERS.water(x,hz)&&l35Free(x,hz,tr?.6:.32))l35Put(sp,x,hz,{kind:tr?'tree':'bush',flip:l35R()<.5},tr?.4:.3);
    // now and then a second one tucked in behind, so the line thickens
    if(!tr&&l35R()<.3){const [bx,bz]=vert?[x+(l35R()-.5)*.6,hz+(l35R()-.5)*.9]:[x+(l35R()-.5)*.9,hz-.45-l35R()*.2];if(!l35OnRoad(bx,bz,.6)&&!LAYERS.water(bx,bz)&&l35Free(bx,bz,.2))l35Put(l35R()<.7?dom:l35Pick(L35_HEDGE),bx,bz,{kind:'bush',flip:l35R()<.5},.25);}
    a+=tr?2.6:.95+l35R()*1.15;}}
// a gatepost (and its collider)
function l35Post(x,z){obj('l35_post',x,z+.02,{kind:'prop',noCol:true});addCircle(x,z,.16);l35Take(x,z,.3);}
function l35ChimeAt(x,z){obj('l35_chime',x,z+.04,{kind:'prop',noCol:true});
  interact.push({x,z:z+.4,r:1,on:()=>!S.room,label:()=>'Look',ok:()=>true,act(){toast('Bird bones and knuckle bones strung on twine from the gatepost. They knock together when the wind comes down off the dam. Somebody hung them to keep something out. Or in.',4.8);}});}
function l35Build(){if(L35.built)return;L35.built=true;const t0=performance.now();if(!REGS.includes(L35.reg))REGS.push(L35.reg);RGK.low=L35.reg;
  for(let v=0;v<3;v++){l35Reeds(v);l35Sapling(v);}l35Plough();l35Gate();l35FenceDown();l35PostSpr();l35GateN();l35GateLeaf();l35Crows();l35Chime();
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
  {const W=L35.pump;put('windpump',W.x,W.z,.45);obj('blades',W.x,W.z+.02,{kind:'anim',fps:6,yoff:135});put('barrel',W.x-1.25,W.z+.35,.3);l35Take(W.x,W.z,1.8);
    put('hay',W.x-3.6,W.z-1.9,.7);put('hay',W.x-5.1,W.z-1.0,.7);l35Take(W.x-4.4,W.z-1.4,1.6);
    // his paddock fence above the pond, gone to pieces: a run still standing with crows on it, then a gap where one post
    // still stands and the rails lie in the grass, then two posts on their own
    {const F=L35.fenceDown,z=F.z;fenceLine(F.x+6.2,z,F.x+18,z,0,'fence');l35Take(F.x+12,z,.6);
      l35Post(F.x+4.6,z);put('l35_fencedown',F.x,z+.15,0,{kind:'prop',noCol:true});l35Take(F.x,z,1.6);
      l35Post(F.x-5.4,z+.05);l35Post(F.x-7.6,z-.08);
      obj('l35_crows',F.x+11.3,z+.08,{kind:'prop',noCol:true});}
    // on the shore, one small shoe, buckled, the leather gone hard
    {const t=-1.05,e=l35PondEdge(t),x=L35.pond.x+Math.cos(t)*L35.pond.rx*(e+.1),z=L35.pond.z+Math.sin(t)*L35.pond.rz*(e+.1);put('rem_shoe',x,z,0,{kind:'prop',noCol:true});l35Take(x,z,.5);
      interact.push({x,z:z+.3,r:1,on:()=>!S.room,label:()=>'Look',ok:()=>true,act(){toast('A child’s shoe, buckled, the leather gone hard as wood. It’s been left side by side with nothing, the way you’d leave a shoe to step into the water.',4.8);}});}
    let n=0;for(let a=0;a<160&&n<30;a++){const t=l35R()*6.283,e=l35PondEdge(t),d=e+l35R()*.16;const x=L35.pond.x+Math.cos(t)*L35.pond.rx*d,z=L35.pond.z+Math.sin(t)*L35.pond.rz*d;if(l35InPond(x,z)||!l35Free(x,z,.3))continue;
      if(Math.hypot(x-W.x,z-W.z)<1.6)continue;obj('l35_reeds'+((l35R()*3)|0),x,z,{kind:'prop',noCol:true,flip:l35R()<.5});l35Take(x,z,.3);n++;}}
  // 5. reeds along the stream, both banks, in clumps with gaps between, clear of the bridges
  for(let z=L35.Z0+1;z<L35.Z1-2;z+=1.3){if(L35.bridges.some(b=>Math.abs(b[1]-z)<2.6))continue;if(fbm(z*.18,7)<.42)continue;const cx=l35StreamX(z);
    for(const s of [-1,1]){if(l35R()<.45)continue;const x=cx+s*(1.35+l35R()*.9);if(LAYERS.water(x,z)||!l35Free(x,z,.3))continue;obj('l35_reeds'+((l35R()*3)|0),x,z+(l35R()-.5)*.3,{kind:'prop',noCol:true,flip:l35R()<.5});l35Take(x,z,.3);}}
  // 6. the fields: every plot a closed yard. Its road side is fenced corner to corner with a gateway by its FOR SALE sign and
  //    the gate swung open into the field; its two flanks and its back are fenced; a hedgerow has grown up along the back.
  //    Two gateposts carry a wind-chime of bones.
  const CHIME=new Set(['lf_hollow','lf_farcorner']);
  for(const P of LAND_PARCELS){if(!P.low)continue;const m=.55,X0=P.x0-m,X1=P.x0+P.w+m,Z0=P.z0-m,Z1=P.z0+P.h+m,GW=2.3;
    if(P.side==='N'){const g0=P.x0+.9,g1=g0+GW;
      fenceLine(X0,Z0,g0,Z0,0,'fence');fenceLine(g1,Z0,X1,Z0,0,'fence');l35Post(g0,Z0);l35Post(g1,Z0);
      obj('l35_gate_n',g1,Z0+.75,{kind:'prop',noCol:true});addSeg(g1,Z0,g1+1.45,Z0+1.45,.1);
      fenceLine(X0,Z0,X0,Z1,0,'fence');fenceLine(X1,Z0,X1,Z1,0,'fence');fenceLine(X0,Z1,X1,Z1,0,'fence');
      l35Hedge(P.x0-.2,P.x0+P.w+.2,Z1+.65,P.id);
      if(CHIME.has(P.id))l35ChimeAt(g0+.16,Z0+.03);}
    else{const W=P.side==='W',RX=W?X0:X1,BX=W?X1:X0,g0=P.z0+.9,g1=g0+GW;
      fenceLine(RX,Z0,RX,g0,0,'fence');fenceLine(RX,g1,RX,Z1,0,'fence');l35Post(RX,g0);l35Post(RX,g1);
      obj('l35_gateleaf',RX,g1+.02,{kind:'prop',noCol:true,flip:!W});addSeg(RX,g1,RX+(W?1.9:-1.9),g1,.1);
      fenceLine(X0,Z0,X1,Z0,0,'fence');fenceLine(X0,Z1,X1,Z1,0,'fence');fenceLine(BX,Z0,BX,Z1,0,'fence');
      l35Hedge(P.z0-.2,P.z0+P.h+.2,BX+(W?.7:-.7),P.id,null,true);
      if(CHIME.has(P.id))l35ChimeAt(RX+.16,g0+.03);}
    l35Take(P.x0+P.w/2,Z0,.3);}
  l35Hedge(-56,194,351.4,'southroad',x=>Math.abs(x-20)<3.6||Math.abs(x-90)<3||Math.abs(x-170)<3||Math.abs(x-l35StreamX(352))<3.4);
  for(let x=-54;x<196;x+=4.2){if(Math.abs(x-20)<4||Math.abs(x-90)<3.5||Math.abs(x-170)<3.5||Math.abs(x-l35StreamX(398))<3.5)continue;
    const z=397.5+(l35R()-.5)*1.4,xx=x+(l35R()-.5)*1.2;if(!l35Open(xx,z,1.1))continue;l35Put(l35Pick([['maple_gold',2],['oak_russet',2],['maple_orange',1.5],['oak_green',1]]),xx,z,{kind:'tree'},.4);}
  // (the plough and its three scars are kept clear: nothing grows up through his last furrows)
  l35Take(L35.plough.x,L35.plough.z,1.2);for(const q of L35.scars)for(let t=0;t<=1.001;t+=.1)l35Take(lerp(q[0],q[2],t),lerp(q[1],q[3],t),1.5);
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
    for(const [ex,ez,dx,dz] of edge){const s=.9+Math.pow(l35R(),1.25)*9,x=ex+dx*s+(dz?(l35R()-.5)*1.2:0),z=ez+dz*s+(dx?(l35R()-.5)*1.2:0);if(l35R()>1.08-s*.085)continue;
      if(LAYERS.dark(x,z)||!l35Open(x,z,.5,.8))continue;const q=l35R();
      if(q<.3)l35Put(l35Pick([['bush_gold',2],['elder',2],['sumac',1.5],['bush_green',1],['holly',.6],['bush_red',.8]]),x,z,{kind:'bush'},.3);
      else if(q<.5)l35Put('l35_sapling'+((l35R()*3)|0),x,z,{kind:'prop',flip:l35R()<.5},.15);
      else if(q<.74)l35Put(l35Pick([['stump_oak',2],['stump_maple',1.5],['stump',1]]),x,z,{kind:'prop'},.25);
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
