/* ================= declutter: after the whole world is built, nothing small stands inside something else. A pumpkin inside a
   barrel, a gravestone through a shed wall, a hedge through a porch, a sapling in a boulder: the inspector finds these by their
   footprints. The smaller, purely decorative piece is taken away (and any collider it brought with it), so the bigger thing
   reads cleanly. Wall and fence runs overlap on purpose and are left alone, as is the bucket by the well. ================= */
const DECLUTTER={removed:[]};
{const _bw=buildWorld;buildWorld=function(){_bw();try{grovePass();}catch(e){console.error('groves',e);}try{frontWalks();}catch(e){console.error('walks',e);}try{declutter();}catch(e){console.error('declutter',e);}
  for(const o of OBJ)if(o.keep){o.hide=false;if(o.keepR&&!circles.some(c=>Math.abs(c.x-o.x)<.3&&Math.abs(c.z-(o.z-.1))<.3))addCircle(o.x,o.z-.1,o.keepR);}};}   // story pieces (the crash oak) are never decluttered
/* front walks: every house has a way to its door. From the doorstep a narrow stone walk runs to the nearest lane or street,
   straight down if it can, otherwise down a step and along; never through a wall, a fence or another building. */
const WALKS=[];
function frontWalks(){
  const st0=LAYERS.stone;
  const hard=(x,z)=>onRoad(x,z,0)||st0(x,z);
  const FEN=OBJ.filter(o=>!o.hide&&o.kind==='fence'&&o.x<250);
  const inRect=(x,z)=>rects.some(r=>x>r.x0-.15&&x<r.x1+.15&&z>r.z0-.15&&z<r.z1+.15)||segs.some(q=>segDist(x,z,q.x1,q.z1,q.x2,q.z2)<(q.r||.2)+.15)||
    FEN.some(o=>o.spr.endsWith('_h')?(Math.abs(z-o.z)<.35&&x>o.x-.2&&x<o.x+(o.clipw||2)+.2):(Math.abs(x-o.x)<.35&&z>o.z-1.2&&z<o.z+.2));
  for(const h of HOUSES){const o=h.e;if(!o||o.hide||o.x>=250||o.room)continue;
    if(!/^(house|h_|wk_house|wk_ward|wk_pike|wk_schoolh|cabin|schoolhouse|inn|tavern|townhall|postoffice|store|shop_|rg_logcabin)/.test(o.spr))continue;
    const dx=o.x,dz=o.z+.45;if(hard(dx,dz+.6))continue;
    let seg=null;
    for(let k=.5;k<=9;k+=.25){const z=dz+k;if(inRect(dx,z))break;if(hard(dx,z)){seg=[[dx,dz,dx,z+.3]];break;}}
    if(!seg){const z1=dz+1.4;if(!inRect(dx,z1))for(const s of [1,-1]){for(let k=.5;k<=10;k+=.25){const x=dx+s*k;if(inRect(x,z1))break;if(hard(x,z1)){seg=[[dx,dz,dx,z1],[dx,z1,x+s*.3,z1]];break;}}if(seg)break;}}
    if(!seg)continue;
    for(const q of seg){WALKS.push([q[0],q[1],q[2],q[3]]);
      for(const p of OBJ)if(!p.hide&&/^(pumpkin|jack|weeds|fern|bush_|rock_)/.test(p.spr)&&segDist(p.x,p.z,q[0],q[1],q[2],q[3])<.75){p.hide=true;
        for(let k=circles.length-1;k>=0;k--)if(Math.abs(circles[k].x-p.x)<.5&&Math.abs(circles[k].z-p.z)<.5)circles.splice(k,1);}}}
  // the walks are laid as stepping stones (the ground can't draw anything narrower than a tile cleanly)
  for(const q of WALKS){const L=Math.hypot(q[2]-q[0],q[3]-q[1]);const n=Math.max(1,Math.round(L/.62));
    for(let i=0;i<=n;i++){const t=i/n;if(i===n&&L>.8)continue;const x=q[0]+(q[2]-q[0])*t+(floraH(q[0]+i,q[1],71)-.5)*.14,z=q[1]+(q[3]-q[1])*t+(floraH(q[0],q[1]+i,72)-.5)*.1;
      if(PORCH_DECKS.some(d=>x>d.x0-.3&&x<d.x1+.3&&z>d.z0-.2&&z<d.sz1+.15))continue;   // not on a porch deck or its steps
      obj('stepstone_'+Math.floor(floraH(x,z,73)*3),x,z+.1,{kind:'flat'});}}
}
/* groves, not sprinkles: the open land had its trees scattered evenly, one every few steps, everywhere. Real country (and good
   game maps) has groves and stands with meadows between them. A slow field decides where the groves are; lone trees out in
   the meadows are taken away, and the groves fill in with more of the same tree. Deep woods, the farm, the towns and the
   story's own trees are left as they are. Everything is decided by position, so every player in a shared game sees the
   same groves. */
const GROVES={cut:0,added:0,groves:0};
function grovePass(){
  const CORE={x0:-74,x1:72,z0:-46,z1:44};const inCore=(x,z)=>x>CORE.x0&&x<CORE.x1&&z>CORE.z0&&z<CORE.z1;
  const farm=(x,z)=>x>-14&&x<23&&z>-21&&z<25;                                  // the whole farm, fence to fence: never planted, never cleared
  const kept=(x,z)=>farm(x,z)||Math.hypot(x,z+10)<15||(typeof inTown==='function'&&inTown(x,z,3))||(typeof inWick==='function'&&inWick(x,z))||
    (typeof HOLLOW_TREE!=='undefined'&&Math.hypot(x-HOLLOW_TREE.x,z-HOLLOW_TREE.z)<6)||(typeof TITHE!=='undefined'&&Math.hypot(x-TITHE.x,z-TITHE.z)<12);
  const field=(x,z)=>fbm(x*.07+31,z*.07+17);
  const G=new Map();const key=(x,z)=>Math.floor(x/2)+','+Math.floor(z/2);
  for(const o of OBJ){if(o.hide||o.room||o.x>=250)continue;if(!(o.solid||['tree','pine','bld','prop','fence','lamp','bush','wreck','well','plant'].includes(o.kind)))continue;const k=key(o.x,o.z);(G.get(k)||G.set(k,[]).get(k)).push(o);}
  const near=(x,z,r)=>{for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const L=G.get((Math.floor(x/2)+i)+','+(Math.floor(z/2)+j));if(L)for(const o of L)if(!o.hide&&Math.abs(o.x-x)<r&&Math.abs(o.z-z)<r)return true;}return false;};
  const free=(x,z)=>inCore(x,z)&&!kept(x,z)&&!onAsphalt(x,z,1)&&!onRoad(x,z,1.4)&&!LAYERS.water(x,z)&&!LAYERS.dirt(x,z)&&!(typeof inQuarry==='function'&&inQuarry(x,z))&&!BLOCK.some(r=>x>r[0]-1&&x<r[2]+1&&z>r[1]-1&&z<r[3]+1)&&!near(x,z,1.7);
  // 1. the meadows: lone trees out in the open go (one in ten stays, a landmark on its own)
  for(const o of OBJ){if(o.hide||o.room||!(o.kind==='tree'||o.kind==='pine')||o.town||!inCore(o.x,o.z)||kept(o.x,o.z))continue;
    if(o.spr==='deadtree'||o.spr==='willow'||/^apple/.test(o.spr)||LAYERS.dark(o.x,o.z))continue;
    if(field(o.x,o.z)<.55&&floraH(o.x,o.z,21)>.1){o.hide=true;GROVES.cut++;for(let k=circles.length-1;k>=0;k--)if(Math.abs(circles[k].x-o.x)<.3&&Math.abs(circles[k].z-o.z)<.3)circles.splice(k,1);}}
  // 2. the groves: where the field peaks, a stand of one or two kinds of tree round a big one
  const PINES=['pine_0','pine_1','spruce_0','spruce_1','pine_o0'],BROAD=['maple_orange','maple_red','maple_gold','maple_green','oak_russet','oak_green','birch_gold','birch_green'];
  const budget=Math.round(GROVES.cut*1.15);
  for(let gz=CORE.z0+2;gz<CORE.z1-2&&GROVES.added<budget;gz+=7)for(let gx=CORE.x0+2;gx<CORE.x1-2&&GROVES.added<budget;gx+=7){
    const cx=gx+floraH(gx,gz,60)*5,cz=gz+floraH(gx,gz,61)*5;const g=field(cx,cz);if(g<.6||!free(cx,cz))continue;
    const kindP=fbm(cx*.03+5,cz*.03+9)<.48;const L=kindP?PINES:BROAD;const s1=L[Math.floor(floraH(cx,cz,62)*L.length)],s2=L[Math.floor(floraH(cx,cz,63)*L.length)];
    const n=Math.min(9,4+Math.floor((g-.6)*30));let made=0;
    for(let i=0;i<n*3&&made<n;i++){const a=i*2.39996+floraH(cx,cz,64)*6,r=i===0?0:1.7+Math.sqrt(i)*1.05;const x=Math.round((cx+Math.cos(a)*r)*2)/2,z=Math.round((cz+Math.sin(a)*r*.8)*2)/2;
      if(!free(x,z))continue;const spr=(i===0||floraH(x,z,65)<.7)?s1:s2;const e=obj(spr,x,z,{kind:/^(pine|spruce)/.test(spr)?'pine':'tree',solid:1});addCircle(x,z,.4);
      const kk=key(x,z);(G.get(kk)||G.set(kk,[]).get(kk)).push(e);made++;GROVES.added++;}
    if(made)GROVES.groves++;}
}
// Route 9's asphalt is drawn ten tiles wide west of the farm, wider than its road entry: nothing grows on it
const onAsphalt=(x,z,m)=>x<-12.5+(m||0)&&Math.abs(z+6)<4.6+(m||0);
function clearAsphalt(){let n=0;for(const o of OBJ){if(o.hide||o.room||!(o.kind==='tree'||o.kind==='pine'||o.kind==='bush'||o.kind==='plant'))continue;
    if(!onAsphalt(o.x,o.z,.4))continue;o.hide=true;n++;for(let k=circles.length-1;k>=0;k--)if(Math.abs(circles[k].x-o.x)<.5&&Math.abs(circles[k].z-o.z)<.5)circles.splice(k,1);}
  DECLUTTER.asphalt=n;}
function declutter(){clearAsphalt();
  const DECOR=/^(pumpkin|jack|sacks|crate|barrel|bucket|weeds|fern|deadtree|spruce|pine_|hedge|grave_|tyres|drum|firewood|hay|bush_|holly|juniper|elder|sumac|mushroom|rock_)/;
  const SKIP=/^(twall|fence|picket|rgiron|stonewall)/;
  const foot=o=>{const m=SPR[o.spr];if(!m||!m.foot)return null;const f=m.foot;if(!(f[2]-f[0]>.05&&f[3]-f[1]>.02))return null;return [o.x+f[0],o.z+f[1],o.x+f[2],o.z+f[3]];};
  const L=OBJ.filter(o=>!o.hide&&!o.room&&o.x<250&&o.spr&&!SKIP.test(o.spr)&&!['deco','flat','grass','anim'].includes(o.kind)&&!o.grass).map(o=>[o,foot(o)]).filter(q=>q[1]);
  const cell=new Map();const key=(x,z)=>Math.floor(x/4)+','+Math.floor(z/4);
  for(const q of L){const k=key(q[0].x,q[0].z);(cell.get(k)||cell.set(k,[]).get(k)).push(q);}
  const area=f=>(f[2]-f[0])*(f[3]-f[1]);
  for(const [a,fa] of L){if(a.hide)continue;
    for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const C=cell.get((Math.floor(a.x/4)+i)+','+(Math.floor(a.z/4)+j));if(!C)continue;
      for(const [b,fb] of C){if(b===a||b.hide||a.hide)continue;
        const w=Math.min(fa[2],fb[2])-Math.max(fa[0],fb[0]),h=Math.min(fa[3],fb[3])-Math.max(fa[1],fb[1]);if(w<=0||h<=0)continue;
        const small=area(fa)<=area(fb)?a:b,big=small===a?b:a;if(w*h<=Math.min(area(fa),area(fb))*.3)continue;
        if(big.spr==='well'&&small.spr==='bucket')continue;
        if(!DECOR.test(small.spr)){if(DECOR.test(big.spr)){gone(big);}continue;}
        gone(small);}}}
  function gone(o){o.hide=true;DECLUTTER.removed.push(o.spr+'@'+o.x.toFixed(1)+','+o.z.toFixed(1));
    if(typeof circles!=='undefined')for(let k=circles.length-1;k>=0;k--)if(Math.abs(circles[k].x-o.x)<.5&&Math.abs(circles[k].z-o.z)<.5)circles.splice(k,1);}
}
// ---- the woods (judge, trees 5/10: "about 17 identical pines at one size, spaced almost on a grid, their hems lining up into
//      rows"): every pine takes one of seven outlines by its position (tall with its trunk showing, short and wide, a thin top
//      bent by the wind, and the two older ones), and where a slow noise dips, one pine in two goes, so the woods stand in clumps
//      with gaps between instead of an even plantation
{const _bw=buildWorld;buildWorld=function(){_bw();
  const G=['pine_0','pine_1','pine_2','pine_3','pine_4'],O=['pine_o0','pine_o1','pine_o2','pine_o3'];
  for(const o of OBJ){if(o.hide||o.room||!o.spr)continue;   // maples and birches: a second outline each, by position
    if(/^(maple_(orange|red|gold|green)|birch_(green|gold))$/.test(o.spr)&&SPR[o.spr+'_b']&&hash((o.x*11)|0,(o.z*19)|0)<.5)o.spr+='_b';}
  for(const o of OBJ){if(o.hide||o.room)continue;const g=o.spr==='pine_0'||o.spr==='pine_1',r=o.spr==='pine_o0'||o.spr==='pine_o1';if(!g&&!r)continue;
    if(!SPR.pine_2)break;
    const L=g?G:O;o.spr=L[Math.floor(hash((o.x*13)|0,(o.z*17)|0)*L.length)%L.length];
    if(!o.town&&LAYERS.dark(o.x,o.z)&&fbm(o.x*.11+71,o.z*.11+29)<.38&&hash((o.x*7)|0,(o.z*5)|0)<.55){o.hide=true;
      for(let k=circles.length-1;k>=0;k--)if(Math.abs(circles[k].x-o.x)<.3&&Math.abs(circles[k].z-o.z)<.3)circles.splice(k,1);}}};}
