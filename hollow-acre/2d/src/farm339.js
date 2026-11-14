/* ================= t339/t340 the farm in one piece. The owner: "Cabin needs to moved closer to all those fields and make it so
   you can't buy those other ones that are on story ground and than move grandpas cabin close to there and the other cabins",
   "Or maybe put the fields to the side of the map so I can be closer to the town like in stardew", and "remove fences on all
   fields". Chosen: Grandpa's place stays where the story needs it; the friends' cabins come in right behind it; and all the
   land for sale moves up beside the farm, a short walk from Grandpa's door and from town.
   - THE WEST FIELDS: the fifteen plots the bank sells, laid out on the open ground west of the creek, between Route 9 and the
     river: two rows between the road and the farm road (the old lane west from Mill Road, carried on to the west woods), two
     rows below the farm road, a strip at the bottom and two pieces north of the road. Farm tracks between the rows. Each plot
     keeps its id, size and price, so a plot someone owns stays theirs and its squares (saved by where they sit inside the plot)
     come with it, crops and all. None of it is story ground: the crash site, the west woods stone, the pond, the Tithe House,
     the motel and Greyfield all keep their distance.
   - NO FENCES: a plot is marked the way land is marked: four stakes driven at its corners and, while it's for sale, a FOR SALE
     board planted in its front corner. The Low Fields' rail fences, gates and gateposts are gone (their hedgerows stay, as
     hedgerows do); the Low Fields themselves stay as countryside, with nothing on them for sale.
   - HOMESTEAD LANE: the farm track behind the barn now runs on north to the friends' cabins, three in a row in the meadow behind
     Grandpa's place, doors to the south, each with its garden plot in front.
   - Everything that knows where land is follows: the land office, the farm book's map, the world map, the farmhands, the
     machines and sprinklers already set down on moved land, the FOR SALE boards' close-ups, Tobias's glowcaps (they grow in the
     west woods round the stone now, not in the fields).
   - Nothing already in the world is removed: trees on the new fields and tracks are hidden, never taken out of the list, and the
     Low Fields are built exactly as before (with their old plot lines) before anything is moved, so saves line up. ========= */
const F39={built:false,old:{},objs:[],sign:null,
  // the tracks: [x1,z1,x2,z2,width]
  tracks:[[-45.5,-3.4,-45.5,18.9,1.6],[-45.5,18.9,-153.2,18.9,1.6],[-153.2,18.9,-153.2,125.2,1.6],[-52,46,-153.2,46,2],[-153.2,81.2,-43,81.2,1.6],
    [-90.3,-7.4,-90.3,-38.4,1.4],
    // the bottom track carries on east past the river field and joins the Tithe House lane to Mill Road (no track stops short)
    [-43,81.2,-34,88,1.6],[-34,88,-20,88,1.6],
    // the west lane goes on south: a causeway of packed earth through the reeds and across the river at the willows, then
    // through the woods to the Greyfield road, so it never stops dead at the bank
    [-153.2,125.2,-153.2,147,1.6],[-153.2,147,-150.4,177.4,1.6]],
  // the farm track behind the barn and the cabins' path (the path runs two paces out from the cabin fronts, leaving each
  // cabin a strip of front yard for its kitchen bed)
  lane:{x:6.8,z0:-12.6,z1:-29.4,px0:-11,px1:13.5}};
// id: [x0, z0, side (where its track is), name, description]
const F39_P={
  longacre:[-151,5.5,'N','The long acre','Seventy-four paces of open ground along Route 9, the first field you pass coming in. Enough to feed the valley, if anyone would let you.'],
  hollow:[-75,5.5,'N','The hollow piece','A long shallow dip by the bent oak where your car went off the road. It holds the morning mist longest.'],
  bend:[-151,20.3,'N','The big field','The biggest clearing in the west woods, cleared by somebody’s grandfather and let go by his son.'],
  farcorner:[-109,20.3,'N','The middle piece','Square and sheltered, with woods on two sides. The deer cross it at dusk and stop halfway to look at you.'],
  eastbank:[-85,24.3,'S','The woodlot','Cut over for firewood the winter the power went, and never planted since. The stumps are long gone; the stones aren’t.'],
  willow:[-151,110.6,'W','The willow piece','At the bottom of the west track, where the willows lean over the fen pools. Good black soil, and never short of water.'],
  southsection:[-151,47.7,'N','The south section','A full section south of the farm road: more ground than Grandpa ever worked, all of it waiting.'],
  millforty:[-101,47.7,'N','The road forty','Forty-odd paces along the farm road, flat as a table. The old furrows still show when the sun is low.'],
  patch:[-63,34.3,'S','The patch','A small, cheap square below the pond, a stone’s throw from the farm: enough to start on.'],
  creekside:[-151,82.6,'N','The far field','The far end of the track, against the west woods. Quiet. Too quiet, the hands say.'],
  ash:[-109,82.6,'N','Ash bottom','Named for the ash trees that stood here before the clearance. Deep, sweet loam running down toward the river.'],
  pondfield:[-77,82.6,'N','The river field','The last field before the river bottoms. You can hear the water from the middle of it, and the bell from the Tithe House on a still night.'],
  weststrip:[-151,100.4,'W','The west strip','A narrow strip at the bottom of the track, against the west woods.'],
  lowerash:[-122,-36,'E','The north piece','North of Route 9, in a clearing the pines are trying to take back.'],
  fenedge:[-88.6,-36,'W','The pine piece','North of the road, where the pines give way. Needles in the soil; it wants lime, and patience.']};
const F39_CABINS=[{x:-11,z:-32,side:-1},{x:.5,z:-32,side:-1},{x:13.5,z:-32,side:-1}];
/*KIT>*/
// the farm's hand-drawn kit (t339/kit/kit.py): eight long-grass clumps, four small bushes, six lying leaves and four turns of a
// leaf in the air, frozen as pixel grids. g: k root, d dark, m mid, l lit, h tip, s seed, "," contact shadow. b: o outline, 0-4
// deep to highlight, t twig, b berry. l/t: h lit, m body, d shade, v stem.
const F39_KIT={"gpal":{"straw":{"k":"#2e2914","d":"#55491f","m":"#867235","l":"#b09a52","h":"#cdb877","s":"#cdb877"},"olive":{"k":"#222914","d":"#38421f","m":"#59662c","l":"#808a42","h":"#a4a963","s":"#c4bd84"},"mix":{"k":"#212814","d":"#3a4420","m":"#5f6a2c","l":"#8a8c44","h":"#b0a964","s":"#b0a964"},"rust":{"k":"#2c1a10","d":"#50301a","m":"#7a4c27","l":"#a26f3c","h":"#c4945a","s":"#d4b07e"}},"bpal":{"russet":{"o":"#2a140e","0":"#3e1c12","1":"#62301a","2":"#8a4a24","3":"#b06a32","4":"#cc8f4c","t":"#3a2416","b":"#7a1e18"},"olive":{"o":"#1c2010","0":"#2a3216","1":"#3e4a20","2":"#58662c","3":"#76843a","4":"#97a254","t":"#3a2a18","b":"#8a2a1a"},"gold":{"o":"#2a2010","0":"#3e3014","1":"#64501e","2":"#8c7228","3":"#b09436","4":"#ccb258","t":"#3a2a18","b":"#8a3a18"},"dry":{"o":"#241a10","0":"#3a2a18","1":"#56402a","2":"#76583a","3":"#987650","4":"#b4966a","t":"#3a2616","b":"#6a2418"}},"lpal":{"rust":{"h":"#c07a3a","m":"#9a5428","d":"#6a3418","v":"#4a2412"},"ochre":{"h":"#cca24a","m":"#a47c2c","d":"#6e5018","v":"#4a3612"},"brown":{"h":"#a07a4e","m":"#7a5a36","d":"#523a22","v":"#3a2816"},"red":{"h":"#b0503a","m":"#863424","d":"#5a2016","v":"#3e1610"}},"g":[[".........","....h....","....l.m..",".m..l.d..",".m..ldd..","..m.ld...","..mmld...","...ml,,..","..,kkk,,,","...,,,,,."],["............",".....m......","...h.m.h....","...l.m.l.m..",".m.l.m.l.d..",".mm.lm.ld...","..m.lm.ld.m.","..mmlmldddd.","...mlllddd..","....mmld,,..","..,kkkkk,,,.","...,,,,,,,.."],[".......m.......","....m..m.......","...hm..m..m....","...ld.hm..d....",".m.ll.lm.ddm...",".m..l.lmddmm...","..m.ldl..dm...m","..mmlll.dmm.m.d","...m.lmddm..mdd","....mlmdm...md.","....dmdddm,mdd.","...kkkkkkk,dk,.","....,,,,,,,,,.."],[".........m........","......m..m........",".....hm..m...m....","...m.ldh.m..md....","...m.ldl.m..m.....","...mmldlmm..m..m..","..m.mlllm..md.dm..","..mmmmllm.dm..d...",".h.mmmllmllm.d....",".l.mm.mlllmmd.....",".l.mmmlldmmdm.....",".l.m.llmdmmkdm....","..lm.dmdkddkdd,...","..ddkkkkkkkkkkk,,.",".....,,,,,,,,,,,.."],[".............m.........","..........m..m.........","......m...m..m.........","......dh..dm.m....m....","...m..dl..dm.m...mm....","...mm.dllhdm.md..m.....","....h..dlldmmd..mm...m.","....lm.dlldmm..mm...d..",".h..llmddllmm.ddm.dd...",".l..mlllllmll.mkmdd....",".ll.m.lllmmmdldkmd....m","..l.m.lmmdmmdmdkdm...dd","..llm.dmdkddkmdddd,..d.","...ddkkkkkkkkkkkkkk,k..",".....,,,,,,,,,,,,,,,..."],[".........m..........",".........m...m......","......m..m...m......","......m..m.m.d......","......dh.m.m.dm.....","...m..dl.m.md.m.m...","...m..dl.mdmdmmdm...","....m..l.m.mdm.d....","....m..llmmdm.dd....","...h.mddlmmdm.d..m..","...llmmdlmlmld.dd...","....l.m.dlmldmdd....",".....l.mldmmdmd...m.","..h...llldmmddm...m.","..l....lmdmmdddm.mm.","..l...lmmkddkddk.m..","..ll..dmdddddddkmm..","...d,kkkkkkkkkkkk,,.",".....,,,,,,,,,,,,,.."],["..............m...........","..........m...m...........",".........mm.m.d....m......","......m..md.m.d.m..m......","......m..mh.m.d.m.md......","....m.dd.ml.mhdmm.m...m...","....m.hd.ml.mldm.mm..dm...",".....mll.mllml.m.m...d....",".....m.llkmlmlmmdm..dm....","....h.mdlkmlmlllmm.dmm....","....llmmllldllmlmmdmm.....",".h...l.m.dllmlmmlmmm......",".l..m.l.mlmlmdmmddmm.....m",".ll.m..lllmlmdmmdddd...m.d","..l.m...lldmmdmmdddkm..mdd","..l.m..lmmkmdkddkddkd..md.","..ldm.,dmmdddddddddddmmdd.","...dd,kkkkkkkkkkkkkkkkdk,.","......,,,,,,,,,,,,,,,,,..."],["................m..............","............m...m..............","............m.m.d.....m........","...........md.m.d..m..m........",".......m...md.m.d..m.md...mm...",".......m...mh.mhd..m.m..mmm....",".....m.d...ml.mld.mm.m.mm.m....",".....m..h..ml.mld.m.mmmd.dm....",".....mm.ll.ml.mld.m.mmd..d.....","......m.dl..llmldlm.m...dm.....",".....hmmdll.mllldllmm..dmm.....",".....llmddl.llmldmlmm..dm......","......lmmddllldmldmmm.dmm......","..h...llm.dllmdmmdmmddmm.......","..l..m.l.mlmlmdmmdmdkmm......m.","..ll.m..lllmmmdmmdmdkdm....m.d.","...m.m...lmdmmdmmdmdkdm....mdd.","...d.m..lmmkddddddddkddm...md..","...ddm.,dmmddddddddddddk,,mdd..","...kdd,kkkkkkkkkkkkkkkkkk,dk,,.","......,,,,,,,,,,,,,,,,,,,,,,..."]],"b":[[".......oo3oo3o..........",".....oo443443o.o........","....o444344333o3oo......","....o4433333333322o.....","....o4333323223222o.....","....o3333222222222o.....",".ooo332223322232322o....","o33222222b222323222ooo..","o322222213323222222211o.","o03322b323222222112111o.","oo323322122222211112211o","03233222b221221122111111","o11122221211221121111110","o0002221111221121111110o",".ooo221111121121110110o.","...o11111101111111o00o..","...o011100o0000000ooo,,.","....o000oo,ooooooo,,,,,.",".....ooo,,,,,,,,,,,....."],["..........oo........",".........o32o.......","......o.o3222o......","....oo3o322233o.....","...o33322223322o....","....o32223322322o...","....o23233233222o...","....o33232332222o...","...o332223322221o...","...o3222233222212oo.","..o3322323322212211o","..o3223222221122111o",".oo22332222111111100","o33323222111112211oo","o13222222111112221o.","o02221121111122211o.",".o12111111211111110o",".o0111111212211000o.","..o011022122111ooo..","...o00o11121111o....","....ooo01011110o,,..","....,,,o0o0110o,,,,.","....,,,,o,o00o,,,,,.",".......,,,,oo,,,...."],["...............o3o..........",".....o.........o3o..........","....o3oo.....oo322o.........","...o3332o...o33323oo........","...o33222o..o3322223o.oo....","..o332222oooo3233233oo32ooo.",".o3322323322332223322322211o",".o3223233222322223222112111o",".o3223223222232222121112212o","o323322222221222211111222111","o333222102222112121111211111","01322221o1221111212111111110","o01112111011111011111011110o",".o0001110o00100o00111o0000o.","..ooo000o,oo0oo,oo000ooooo..",".....ooo,,,,o,,,,,ooo,......"],["........................","........................",".................2......","...............t3t......",".............3tooot2....",".....2t2.....to...ot....","....3toot....t.....o1...","...1oo..t....t..........","...t....ot..to..........","...o.....t..t.....tt.2..",".........ot.t...ttoott1.","......tt..t.t..too..oot.","......oot.t.t.to......t.",".......,ottttto,,,,...o.",".....,,,,ootto,,,,,,,...","......,,,,,oo,,,,,,,...."],["........................","..........oo............","........oo23oooooooo....",".......o332322332332oo..",".......o32322332332222o.","...o.oo332333322322222o.","..o3o2o3233222233222211o","..o332o2332222222222111o",".o333322332221111121111o","o033322232221111112110o.",".o3322222221111122111ooo",".o3222211112122121122111",".o2222111111121221211111",".o2211111000121211111111",".o2111110ooo211111100111",".o111100o,,o1110100oo000",".o0000oo,,,o000o0oo,,ooo","..oooo..,,,,ooo,o,,,...."]],"l":[["...hhhm..","vvhmmmmmd","...mddd.."],[".....hm","....hmd","...hmmd","..hmmd.",".vmdd..","v......"],[".h.hm.m..","hmmmmmmdv",".mdmmdd..","..d..d..."],[".hhm....","hmmmmd..",".mmmmdd.","..mddd..",".....dv.","......v."],["..hhhm..","vvmmmddd"],["..hm...",".hmmhm.","vmmddd.","..ddd.."]],"t":[["..hhm..",".hmmmd.","hmmmmd.",".mmdd..","v......"],["..hm...",".hmmd..","vmmd..."],["....hm.","vhmmd.."],["..mm...",".hhmm..","hhhmd..",".vdd..."]]};
/*<KIT*/
const F39_HOME_DZ=1.4;   // each cabin's garden plot starts this much further out than it used to (beyond the path)
const f39Plots=()=>LAND_PARCELS.filter(P=>P.f39);
const f39In=(P,x,z,m)=>x>P.x0-m&&x<P.x0+P.w+m&&z>P.z0-m&&z<P.z0+P.h+m;
const f39InAny=(x,z,m)=>LAND_PARCELS.some(P=>P.f39&&f39In(P,x,z,m));
const f39OnTrack=(x,z,m)=>{for(const q of F39.tracks)if(segDist(x,z,q[0],q[1],q[2],q[3])<q[4]/2+(m||0))return true;return false;};
// hedgerows in the gaps between neighbouring plots (and behind the ones that back onto open ground): [x1,z1,x2,z2,seed]
const F39_HEDGES=[[-76,5.6,-76,17.4,'h1'],[-110,20.4,-110,44.2,'h2'],[-86,20.4,-86,44.2,'h3'],[-64,34.4,-64,44.2,'h4'],[-102,47.8,-102,79.6,'h5'],
  [-100.8,70.9,-57.2,70.9,'h7'],[-110,82.7,-110,98.5,'h9'],[-78,82.7,-78,100.5,'h10'],[-150.8,99.5,-111.2,99.5,'h11']];
// the FOR SALE board stands on the headland just in from the plot's front corner (the corner keeps its own stake, so you see
// the stake and the board together), at the end of the front edge with no hedge coming in; never against a hedge
const f39HedgeNear=(x,z,m)=>F39_HEDGES.some(h=>segDist(x,z,h[0],h[1],h[2],h[3])<m);
const f39Sign=(P)=>{const s=P.side,I=1.7;
  if(s==='N'||s==='S'){const z=s==='N'?P.z0+.55:P.z0+P.h-.3;const R=[P.x0+P.w-I,z],L=[P.x0+I,z];return f39HedgeNear(P.x0+P.w,z,2.4)&&!f39HedgeNear(P.x0,z,2.4)?L:R;}
  const x=s==='W'?P.x0+.6:P.x0+P.w-.6;const T=[x,P.z0+I],Bm=[x,P.z0+P.h-I];return f39HedgeNear(x,P.z0,2.4)&&!f39HedgeNear(x,P.z0+P.h,2.4)?Bm:T;};
// ---------------------------------------------------------------- the plots move (now, before the world is built)
for(const P of LAND_PARCELS){const id=String(P.id||'').replace(/^lf_/,'');const d=P.low&&F39_P[id];if(!d)continue;
  F39.old[P.id]={x0:P.x0,z0:P.z0,sign:P.sign.slice(),side:P.side,name:P.name};
  P.x0=d[0];P.z0=d[1];P.side=d[2];P.name=d[3];P.desc=`${d[4]} In the West Fields, west of the farm off Route 9.`;P.f39=true;P.sign=f39Sign(P);}
// the FOR SALE boards' "Read" (pushed with the old boards' places): to the new boards
for(const P of f39Plots()){const o=F39.old[P.id];const it=interact.find(q=>q&&q.x===o.sign[0]&&Math.abs(q.z-(o.sign[1]+.3))<.01);if(it){it.x=P.sign[0];it.z=P.sign[1]+.3;}}
if(vendors.land)vendors.land.sub='Agnes Abernathy keeps the deeds in a tin box under the counter. The land for sale is all in the West Fields now, west of the farm along Route 9: walk out past the bent oak and you’re on it.';
// ---------------------------------------------------------------- the cabins come in behind Grandpa's
for(let i=0;i<LANE_SPOTS.length&&i<F39_CABINS.length;i++){Object.assign(LANE_SPOTS[i],F39_CABINS[i],{z:F39_CABINS[i].z+F39_HOME_DZ});if(FH_SPOTS[i]){FH_SPOTS[i].x=F39_CABINS[i].x;FH_SPOTS[i].z=F39_CABINS[i].z;}}
for(let i=0;i<FH_SPOTS.length;i++)if(ROOMS['fcab'+i])ROOMS['fcab'+i].out={x:FH_SPOTS[i].x,z:FH_SPOTS[i].z+.9};
LANE.z0=LANE.z1=0;            // (the old lane west of the creek: no path drawn any more)
LAND.cleared=true;            // (and no HOMESTEAD LANE board out on Route 9: it goes up at the new lane instead)
for(const s of (typeof FH_STEPS!=='undefined'?FH_STEPS:[]))if(s&&typeof s.text==='string')s.text=s.text.replace('on Homestead Lane, across the creek from Grandpa’s','on Homestead Lane, in the meadow behind Grandpa’s');
// ---------------------------------------------------------------- the Low Fields are built exactly as before, then their fences come down
{const _b=l35Build;l35Build=function(){if(L35.built)return _b.apply(this,arguments);
  const moved=f39Plots(),now=moved.map(P=>({P,x0:P.x0,z0:P.z0,sign:P.sign,side:P.side}));
  for(const P of moved){const o=F39.old[P.id];P.x0=o.x0;P.z0=o.z0;P.sign=o.sign;P.side=o.side;}
  const n0=OBJ.length,s0=segs.length,c0=circles.length,f0=typeof fenceDefs!=='undefined'?fenceDefs.length:0;let r;
  try{r=_b.apply(this,arguments);}finally{
    // every rail, gatepost, gate and bone chime round an old plot: hidden, and its colliders gone
    const ring=(x,z)=>moved.some(P=>x>P.x0-1.5&&x<P.x0+P.w+1.5&&z>P.z0-1.5&&z<P.z0+P.h+1.5&&!(x>P.x0+.2&&x<P.x0+P.w-.2&&z>P.z0+.2&&z<P.z0+P.h-.2));
    const FEN=/^(fence_[hv]|l35_post|l35_hingepost|l35_gate_n|l35_gateleaf|l35_chime)$/;let nh=0;
    for(let i=n0;i<OBJ.length;i++){const o=OBJ[i];if(!o||o.hide||!FEN.test(o.spr||''))continue;if(!ring(o.x,o.z-(/_h$/.test(o.spr)?.1:0)))continue;o.hide=true;o.f39fence=1;nh++;}
    for(let i=segs.length-1;i>=s0;i--){const q=segs[i];if(ring((q.x1+q.x2)/2,(q.z1+q.z2)/2)&&ring(q.x1,q.z1)&&ring(q.x2,q.z2))segs.splice(i,1);}
    for(let i=circles.length-1;i>=c0;i--){const q=circles[i];if(q.r<=.21&&ring(q.x,q.z))circles.splice(i,1);}
    if(typeof fenceDefs!=='undefined')for(let i=fenceDefs.length-1;i>=f0;i--){const q=fenceDefs[i];if(ring((q[0]+q[2])/2,(q[1]+q[3])/2))fenceDefs.splice(i,1);}
    F39.fencesDown=nh;
    for(const q of now){Object.assign(q.P,{x0:q.x0,z0:q.z0,sign:q.sign,side:q.side});}
    for(const P of moved)P.low=false;   // (from here on they're farm land, not Low Fields land)
    try{f39LowCountry();}catch(e){console.warn('low fields country',e);}}
  return r;};}
// the Low Fields with nothing for sale: the two cart tracks that only ran to plots are taken up, and the ground where each plot
// lay is framed the way old fields are: a field tree at one corner, a broken run of hedge along the side the fence stood on,
// the stones picked off it heaped at a corner by the road, long grass where the plough no longer goes
function f39LowCountry(){
  const dead=L35.lines.filter(L=>L.w===1.1);for(const L of dead)L35.lines.splice(L35.lines.indexOf(L),1);
  {const spur=(q)=>Math.min(q[0],q[2])>86&&Math.max(q[0],q[2])<94&&Math.min(q[1],q[3])>=353.5;
    for(const L of L35.lines)if(L.p.length&&Math.abs(L.p[0][0]-90)<3&&L.p[0][1]<310)L.p=L.p.filter(p=>p[1]<=354.5);
    for(let i=L35.roads.length-1;i>=0;i--)if(spur(L35.roads[i]))L35.roads.splice(i,1);
    if(L35.roadRefs)for(let i=L35.roadRefs.length-1;i>=0;i--){const r=L35.roadRefs[i];if(spur(r)){const k=ROADS.indexOf(r);if(k>=0)ROADS.splice(k,1);L35.roadRefs.splice(i,1);}}}
  for(let i=L35.roads.length-1;i>=0;i--)if(L35.roads[i][5]===1.1)L35.roads.splice(i,1);
  if(L35.roadRefs)for(let i=L35.roadRefs.length-1;i>=0;i--){const r=L35.roadRefs[i];if(Math.abs(r[4]-.792)<.01){const k=ROADS.indexOf(r);if(k>=0)ROADS.splice(k,1);L35.roadRefs.splice(i,1);}}
  const o0=F39.objs.length;let n=0;for(const P of f39Plots()){const o=F39.old[P.id];if(!o)continue;const X0=o.x0,Z0=o.z0,W=P.w,H=P.h,id=P.id;const h=k=>l35Hash(id,200+k);
    const free=(x,z,r)=>!LAYERS.water(x,z)&&!l35OnRoad(x,z,.9)&&l35Free(x,z,r);
    // the field tree, at a back corner
    {const cx=h(1)<.5?X0+1.2+h(2)*2:X0+W-1.2-h(2)*2,cz=o.side==='N'?Z0+H-1.5-h(3)*2:Z0+1.5+h(3)*2;if(free(cx,cz,1.2)){l35Put(['oak_russet','maple_gold','maple_orange','oak_green'][(h(4)*4)|0],cx,cz,{kind:'tree',flip:h(5)<.5},.4);n++;}}
    {const cx=o.side==='W'?X0+1.4+h(11)*2:X0+1.6+h(11)*3,cz=o.side==='N'?Z0+1.6+h(12)*1.5:Z0+H-1.6-h(12)*1.5;if(free(cx,cz,1.2)){l35Put(['maple_gold','oak_russet','maple_orange','birch_gold'][(h(13)*4)|0],cx,cz,{kind:'tree',flip:h(14)<.5},.4);n++;}}
    // a broken run of hedge where the fence stood (the road side), a third to a half of its length
    {const len=(o.side==='N'?W:H)*(.32+h(6)*.2),a0=(o.side==='N'?X0:Z0)+(h(7)<.5?.6:(o.side==='N'?W:H)-len-.6);
      if(o.side==='N')f39Hedge(a0,Z0-.15,a0+len,Z0-.15,id+'lh');else{const xs=o.side==='W'?X0-.15:X0+W+.15;f39Hedge(xs,a0,xs,a0+len,id+'lh');}}
    // and a run down its east side, where it met the next field (the drifts keep clear of it)
    if(o.side==='N'&&H>12){const zA=Z0+H*(.22+h(41)*.1),zB=Z0+H*(.7+h(42)*.12),xs=X0+W+.35;f39Hedge(xs,zA,xs,zB,id+'eh');for(let z=zA;z<zB;z+=.9)l35Take(xs,z,.9);}
    // the stones picked off it, heaped at the road corner
    {const cx=o.side==='W'?X0+2.4:X0+W-2.6-h(8)*3,cz=o.side==='N'?Z0+3.0:Z0+H-2.2;for(let t=0;t<8;t++){const x=cx+(h(10+t)-.5)*2.4,z=cz+(h(20+t)-.5)*1.2;if(free(x,z,1.1)&&!LAYERS.dirt(x,z)&&!LAYERS.dirt(x,z-1.2)&&!LAYERS.dirt(x+1,z)&&!LAYERS.dirt(x-1,z)){f39Heap(x,z,id+'lowheap','huge');l35Take(x,z,1.6);{const bx=x-1.5-h(36)*.4,bz=z+.25;if(free(bx,bz,.4)){f39Bush(bx,bz,3,h(37)<.5?'dry':'russet');l35Take(bx,bz,.6);}}
        if(h(30)<.7){const s2=h(31)<.5?-1:1;f39Heap(x+s2*(1.5+h(32)*.6),z+.3+h(33)*.4,id+'lowheap2','small');}break;}}}
    // long grass in drifts across it, placed with intent: two big drifts and a few smaller ones, each graded from a dense
    // heart to loose wisps at its rim (f39Drift), with open meadow between them
    {const nd=clamp(Math.round(W*H/150),3,8);for(let k=0;k<nd;k++){const x=X0+4+h(60+k)*(W-8),z=Z0+3.5+h(80+k)*(H-7),r=k<2?2.1+h(90+k)*1.3:.8+h(90+k)*1.4;
      if(!free(x,z,.5))continue;f39Drift(x,z,r,id+'dr'+k,(px,pz)=>free(px,pz,.15),['mix','straw','mix','olive'][(h(97+k)*4)|0]);l35Take(x,z,r*1.15);}}
    // a field tree standing on its own out in the old field
    if(h(150)<.85){for(let t=0;t<16;t++){const x=X0+4+h(151+t)*(W-8),z=Z0+3+h(171+t)*(H-6);if(!free(x,z,1.6))continue;l35Put(['oak_russet','maple_gold','oak_green','maple_orange'][(h(191+t)*4)|0],x,z,{kind:'tree',flip:h(195+t)<.5},.4);l35Take(x,z,3);n++;
      {const bx=x+(h(196)<.5?-1:1)*(1.1+h(197)*.4),bz=z+.35+h(198)*.3;if(!LAYERS.water(bx,bz)&&!l35OnRoad(bx,bz,.8))f39Bush(bx,bz,(h(199)*4)|0,['russet','gold','olive','dry'][(h(201)*4)|0]);}break;}}}
  for(let i=o0;i<F39.objs.length;i++)F39.objs[i].f39low=1;   // (on the valley map a run of hedge in open country reads as a path that stops: it isn't drawn there)
  F39.lowFramed=n;}
// ---------------------------------------------------------------- the West Fields and Homestead Lane go down after everything else
function f39Hide(o){o.hide=true;o.f39=1;o.goneDay=null;for(let j=circles.length-1;j>=0;j--)if(Math.hypot(circles[j].x-o.x,circles[j].z-(o.z-.1))<.7)circles.splice(j,1);}
const F39_CLEAR=/^(tree|pine|bush|deco|anim|grass|plant)$/;
// each hedge is mostly one shrub, as a hedge that was planted and then let go is: the odd other shrub seeded in, a field tree
// standing up out of it now and then, its line wandering a little either side, thick in places (a second bush tucked in
// behind), long grass and fern at its foot on both sides, and a gap here and there where it has died back
const F39_HB=['bush_gold','elder','bush_green','bush_gold','elder'],F39_HB2=['sumac','holly','bush_green','bush_gold'];
function f39Pick(r,mix){const tot=mix.reduce((a,m)=>a+m[1],0);let q=r*tot;for(const m of mix){q-=m[1];if(q<=0)return m[0];}return mix[0][0];}
// ---------------------------------------------------------------- the kit (round 5): drawn by hand, placed with intent
// the long grass, the small bushes and the leaves are no longer generated: each is one of the kit's hand-drawn grids above
// (F39_KIT), coloured from its own small palette, never mirrored (the light stays on the upper left)
// (the hedges still draw the grass at their own foot from these ramps)
const F39_GRP={straw:[[70,56,26],[104,84,40],[146,122,62],[186,162,96],[214,196,132]],olive:[[44,52,24],[66,78,34],[96,108,48],[130,142,70],[162,170,98]],rust:[[66,36,20],[100,58,30],[138,88,46],[176,128,74],[204,166,112]]};
const F39_KSH='rgba(16,22,10,.43)';
function f39KitSpr(t,i,pal){const key='f39k_'+t+i+'_'+pal;if(SPR[key])return key;const G=F39_KIT[t][i],H=G.length,W=G[0].length;
  const PAL=(t==='g'?F39_KIT.gpal:t==='b'?F39_KIT.bpal:F39_KIT.lpal)[pal];let ay=H-1,ax=W/2;
  // its foot: grass stands on its root row, a bush on the bottom of its outline, a leaf lies on its middle
  if(t==='g'){for(let y=H-1;y>=0;y--){let n=0,sx=0;for(let x=0;x<W;x++)if(G[y][x]==='k'){n++;sx+=x;}if(n>=2){ay=y;ax=sx/n+.5;break;}}}
  else if(t==='b'){for(let y=H-1;y>=0;y--){let a=-1,b=-1;for(let x=0;x<W;x++)if(G[y][x]!=='.'&&G[y][x]!==','){if(a<0)a=x;b=x;}if(a>=0){ay=y-1;ax=(a+b+1)/2;break;}}}   /* (its lowest row: the outline under a bush, the root of a bramble) */
  else{ay=H/2;ax=W/2;}
  return l35Spr(key,W,H,ax,ay,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const ch=G[y][x];if(ch==='.')continue;P(x,y,1,1,ch===','?F39_KSH:PAL[ch]);}});}
// mostly straw tips over an olive root, some all straw, some still olive, the odd rust one
const f39KPal=h=>h<.5?'mix':h<.75?'straw':h<.96?'olive':'rust';
// one clump of long grass, from small (0) to big (4)
function f39Tuft(x,z,k,seed,size){const h=l35Hash(seed,k),sz=size==null?((h*3)|0):Math.max(0,Math.min(4,size));
  const OPT=[[0,1],[1,2],[2,3],[3,4,5],[5,6,7]][sz],i=OPT[(l35Hash(seed,k+11)*OPT.length)|0];
  const o=obj(f39KitSpr('g',i,f39KPal(l35Hash(seed,k+5))),x,z,{kind:'grass',noCol:true,f39gr:1});F39.objs.push(o);return o;}
// a drift of long grass: one to three big dense clumps at its heart, a ring of middling ones round them, small tufts beyond, and
// single wisps at its rim thinning out into the meadow (LESSONS: grade a drift by density, big at the core, loose at the rim);
// the drift an uneven oval lying the way the wind takes it, its rim wandering, no clump on top of another, no two neighbours
// alike, one dominant colour with the odd other one through it
function f39Drift(x,z,r,seed,free,pal0){const h=k=>l35Hash(seed,k),an=h(1)*Math.PI,asp=.55+h(2)*.35,ca=Math.cos(an),sa=Math.sin(an);
  const placed=[],out=[];let last=-1,k=10;
  const RINGS=[[0,.32,r>2.2?5:r>1.3?3:2,[6,7,5],.2],[.3,.64,Math.round(4+r*2.4),[3,4,5,6],.28],[.62,.97,Math.round(4+r*2.6),[1,2,3],.36],[.97,1.4,Math.round(3+r*2.2),[0,1,0],.4]];
  for(const [r0,r1,n,G,ov] of RINGS){const a0=h(k++)*6.28;for(let j=0;j<n;j++){
    for(let t=0;t<6;t++){const a=a0+(j+h(k++)*.8)*6.28/n,wob=1+(fbm(Math.cos(a)*1.3+h(3)*40,Math.sin(a)*1.3+3)-.5)*.7,rr=(r0+(r1-r0)*h(k++))*r*wob;
      const u=Math.cos(a)*rr,v=Math.sin(a)*rr*asp,px=x+u*ca-v*sa,pz=z+(u*sa+v*ca)*.75;
      let gi=G[(h(k++)*G.length)|0];if(gi===last)gi=G[(G.indexOf(gi)+1)%G.length];
      const wd=F39_KIT.g[gi][0].length/32*ov;
      if(placed.some(p=>Math.hypot(p[0]-px,(p[1]-pz)*1.7)<p[2]+wd))continue;if(free&&!free(px,pz,.1))continue;
      placed.push([px,pz,wd,gi,r0<.62]);last=gi;const pal=pal0&&h(k++)<.82?pal0:f39KPal(h(k++));
      out.push(obj(f39KitSpr('g',gi,pal),px,pz,{kind:'grass',noCol:true,f39gr:1}));break;}}}
  // the grass under the thick of it is shaded: one flat patch, the union of the dense clumps' feet, a step darker where they
  // crowd (two flat tones, its edge as ragged as the clumps that make it)
  {const core=placed.filter(p=>p[4]);if(core.length>1){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of core){const hw=F39_KIT.g[p[3]][0].length/64;x0=Math.min(x0,p[0]-hw-.2);x1=Math.max(x1,p[0]+hw+.3);z0=Math.min(z0,p[1]-.3);z1=Math.max(z1,p[1]+.3);}
    const W=Math.ceil((x1-x0)*32),H=Math.ceil((z1-z0)*32),key='f39dp_'+seed;
    l35Spr(key,W,H,0,H,(P,g)=>{const n=new Uint8Array(W*H);for(const p of core){const rx=F39_KIT.g[p[3]][0].length*.55,ry=4.2,cx=(p[0]-x0)*32+2,cy=(p[1]-z0)*32+1.5;
        for(let y=Math.max(0,Math.floor(cy-ry));y<Math.min(H,Math.ceil(cy+ry));y++)for(let x=Math.max(0,Math.floor(cx-rx));x<Math.min(W,Math.ceil(cx+rx));x++)if(((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2<1)n[y*W+x]++;}
      for(let i=0;i<W*H;i++)if(n[i]){g.fillStyle=n[i]>1?'rgba(14,20,8,.24)':'rgba(14,20,8,.13)';g.fillRect(i%W,(i/W)|0,1,1);}});
    F39.objs.push(obj(key,x0,z1,{kind:'flat',f39dp:1}));}}
  for(const o of out)F39.objs.push(o);return out;}
// a small bush from the kit: four shapes, four colours (russet, olive, gold, and the dead bramble)
function f39Bush(x,z,i,pal){const o=obj(f39KitSpr('b',i,pal),x,z,{kind:'bush',f39kb:1});addCircle(x,z-.1,.32);F39.objs.push(o);return o;}
// the stones picked off a field, heaped: each heap its own (no two alike, never a mirror copy), the big stones at the bottom and
// back and the small ones thrown on top, every stone lit on its top and upper left, dark on its lower right, an outline round
// the heap and a dark crack where one stone sits on another, and a soft shadow on the ground under it
const F39_STONE=[[[164,158,146],[128,123,114],[94,90,84],[62,59,55]],[[158,146,128],[122,111,96],[90,81,70],[60,54,46]],[[148,150,140],[114,116,107],[84,86,79],[56,58,53]]];
function f39HeapSpr(seed,size){const key='f39heap_'+seed;if(SPR[key])return key;const R=l35Rng(((l35Hash(seed,5)*2147483647)|0)^0x2c1b3c6d);
  const LAY=size==='huge'?[10+((R()*3)|0),8+((R()*2)|0),5+((R()*2)|0),2+((R()*2)|0)]:size==='big'?[7+((R()*3)|0),5+((R()*2)|0),2+((R()*2)|0)]:size==='mid'?[5+((R()*2)|0),3+((R()*2)|0),R()<.5?1:0]:[3+((R()*2)|0),R()<.6?1:0];
  const rx=size==='huge'?30:size==='big'?19:size==='mid'?12:6,ry=size==='huge'?10:size==='big'?7:size==='mid'?5:3,sc=size==='huge'?1.75:size==='big'?1.45:size==='mid'?1.15:.85;
  const W=rx*2+18,H=ry*2+30,cx=W/2,base=H-7;const st=[];
  // a mound: a ring of the biggest stones on the ground, a smaller ring on them, a stone or two on top
  LAY.forEach((n,l)=>{const a0=R()*6.28;for(let k=0;k<n;k++){const an=a0+k*6.28/n+(R()-.5)*.7,f=(1-l*.42)*(.55+R()*.45),w=(2.3+R()*2.1)*sc*(1-.12*l),h=w*(.6+R()*.18);
    st.push({x:cx+Math.cos(an)*rx*f,y:base-ry+Math.sin(an)*ry*f*.9-l*(size==='huge'?5.6:3.4)*sc-h*.3,w,h,p:R()*6.28,t:F39_STONE[(R()<.6?0:R()<.5?1:2)],lic:R()<.22});}});
  st.sort((a,b)=>(a.y+a.h)-(b.y+b.h));
  const own=new Int16Array(W*H).fill(-1),col=[];
  st.forEach((S0,si)=>{for(let y=Math.floor(S0.y-S0.h-1);y<=S0.y+S0.h+1;y++)for(let x=Math.floor(S0.x-S0.w-1);x<=S0.x+S0.w+1;x++){if(x<0||y<0||x>=W||y>=H)continue;
    const dx=(x+.5-S0.x)/S0.w,dy=(y+.5-S0.y)/S0.h,an=Math.atan2(dy,dx),r=1+.12*Math.sin(3*an+S0.p)+.06*Math.sin(5*an+S0.p*2);if(dx*dx+dy*dy>r*r)continue;
    const k=y*W+x;const l=-dx*.55-dy*.85;let c=l>.42?0:l>-.15?1:2;if(dy>.62||dx+dy>1.05)c=2;if(S0.lic&&l>.2&&hash(x>>1,y>>1)<.3)c=-1;
    own[k]=si;col[k]=c<0?[132,140,92]:S0.t[c];}});
  return l35Spr(key,W,H,cx,base,(P,g)=>{
    for(let x=0;x<W;x++){const e=((x+.5-cx-rx*.32)/(rx*.95+4))**2;if(e<1){const h=Math.round(ry*.5*Math.sqrt(1-e)+(1-e)*1.2)+1;g.fillStyle='rgba(10,16,8,.3)';g.fillRect(x,base-Math.round(h*.4)+1,1,Math.round(h*1.4));}}
    const im=g.getImageData(0,0,W,H),D=im.data;
    const inMass=(x,y)=>{const dx=(x+.5-cx)/(rx*.8),dy=(y+.5-(base-ry*1.05))/(ry*.95);return dx*dx+dy*dy<1;};
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=y*W+x,o=k*4;if(own[k]<0&&size!=='small'&&inMass(x,y)){const t=F39_STONE[0],up=y<base-ry*1.2,c=(own[k+1]>=0||own[k-W]>=0)?t[3]:up?t[1]:t[2];D[o]=c[0];D[o+1]=c[1];D[o+2]=c[2];D[o+3]=255;continue;}   // (between the big stones the heap is rubble and small stones, lit on top, never grass)
      if(own[k]<0){
        // the outline round the heap, and the crack where a stone sits on the one below it
        let nb=-1;for(const q of [k-1,k+1,k-W,k+W])if(q>=0&&q<W*H&&own[q]>=0){nb=own[q];break;}if(nb<0)continue;const t=st[nb].t;D[o]=t[3][0]*.7;D[o+1]=t[3][1]*.7;D[o+2]=t[3][2]*.7;D[o+3]=255;continue;}
      let c=col[k];if(y+1<H&&own[k+W]>=0&&own[k+W]!==own[k]&&st[own[k+W]].y>st[own[k]].y)c=st[own[k]].t[3];
      D[o]=c[0];D[o+1]=c[1];D[o+2]=c[2];D[o+3]=255;}
    g.putImageData(im,0,0);});}
function f39Heap(x,z,seed,size){const k=f39HeapSpr(seed,size);const e=obj(k,x,z,{kind:'prop',noCol:true,f39heap:1});F39.objs.push(e);if(size!=='small')addCircle(x,z-.1,size==='huge'?.9:size==='big'?.55:.32);return e;}
// a hedge is drawn as one growth, not stamped bushes: every run is built from a few hundred overlapping clumps of its own
// sizes (never on a fixed step), each clump shaded as a ball of leaf clusters lit from the upper left, its crevices dark and its
// lower right rim dark where it sits in front of the clump behind; two or three shrubs drift into one another along the run;
// the top line rises and falls; low growth bulges at the foot; the whole growth has an outline (softer on its lit top and left),
// a dark underside, and its own shadow on the ground down to the right. The run is painted once, then cut into pieces the
// engine can sort (each pixel goes to the piece of the clump that painted it, so no seam ever shows).
const F39_HPAL={green:[[21,36,15],[33,55,26],[44,74,34],[59,95,42],[81,122,51],[110,148,66]],
  olive:[[29,35,15],[45,54,23],[65,76,31],[88,100,42],[115,128,57],[147,158,76]],
  gold:[[42,34,10],[72,58,18],[106,86,26],[146,120,36],[188,158,52],[226,198,92]],
  rust:[[32,11,9],[60,20,16],[94,33,24],[132,52,32],[174,84,46],[214,130,74]]};
const F39_HTY=['green','olive','gold','rust','green','olive'];
for(const k of ['green','olive'])F39_HPAL[k+'O']=F39_HPAL[k].map((c,i)=>{const g=F39_HPAL.gold[i];return [Math.round((c[0]+g[0])/2),Math.round((c[1]+g[1])/2),Math.round((c[2]+g[2])/2)];});
let F39_HN=0;const F39_IMG=new Map();
// a hedge picture, once painted: kept, and put where the engine looks for it
function f39Img(k,cv){F39_IMG.set(k,cv);try{delete IMG['mem:'+k];}catch(e){}IMG['mem:'+k]=cv;}
// paint the hedges a few at a time once the world is up, nearest to you first
function f39HedgeIdle(){const q=(F39.hq||[]).filter(r=>!r.done);if(!q.length)return;const t0=performance.now();
  q.sort((a,b)=>(a.d=Math.hypot(a.x-P.x,a.z-P.z))-(b.d=Math.hypot(b.x-P.x,b.z-P.z)));for(const r of q){r.gen();if(performance.now()-t0>12)break;}setTimeout(f39HedgeIdle,40);}
function f39Hedge(){const t0=performance.now();try{return f39Hedge0.apply(this,arguments);}finally{F39.hb=(F39.hb||0)+performance.now()-t0;}}
function f39Hedge0(x1,z1,x2,z2,seed){const vert=Math.abs(x2-x1)<Math.abs(z2-z1),a0=vert?Math.min(z1,z2):Math.min(x1,x2),a1=vert?Math.max(z1,z2):Math.max(x1,x2),c=vert?x1:z1,L=a1-a0;
  if(L<1)return;const R=l35Rng(((l35Hash(seed,71)*2147483647)|0)^0x5bd1e995),k0=l35Hash(seed,999)*50;const tag=seed+'_'+(F39_HN++);
  // one shrub the whole run (two or three blended read as camouflage), with the odd clump turning ochre in the same ramp
  const CMB=[['green'],['olive'],['green'],['olive'],['olive'],['green']],cm=CMB[(R()*CMB.length)|0];
  const dom=cm[0],sec=dom+'O',third=null;
  // the odd gap where it has died back (never at an end)
  const gaps=[];if(L>7){const ng=L>18?(R()<.6?2:1):(R()<.75?1:0);for(let i=0;i<ng;i++)for(let t=0;t<14;t++){const w=.9+R()*.6,g0=a0+2+R()*(L-4-w);if(gaps.every(g=>g0>g[1]+2.5||g0+w<g[0]-2.5)){gaps.push([g0,g0+w]);break;}}}
  const gapD=a=>{let d=1e9;for(const g of gaps){if(a>=g[0]&&a<=g[1])return 0;d=Math.min(d,a-g[1]>0?a-g[1]:g[0]-a);}return d;};
  const endD=a=>Math.min(a-a0,a1-a);
  const wan=a=>(fbm(a*.21+k0,c*.11+7)-.5)*.85,hh=a=>.7+.6*fbm(a*.19+k0+3,c*.13+1);
  // how full the hedge is here: thin in places, in others a second row tucked in behind it on one side
  const wf=a=>fbm(a*.16+k0+9,c*.07+4),side=a=>fbm(a*.05+k0+21,c*.05)>.5?1:-1;
  const world=(al,ac)=>vert?[c+ac,al]:[al,c+ac];
  const bad=(al,ac)=>{const [x,z]=world(al,ac);return f39OnTrack(x,z,.25)||LAYERS.water(x,z)||(typeof l35OnRoad==='function'&&z>L35.Z0-2&&l35OnRoad(x,z,.3));};
  // the clumps: [along, across, height of centre, radius, shrub]
  const B=[];const pickT=a=>R()<.06?sec:dom;   /* rust only as the odd single clump: in patches it read as camouflage */
  for(let a=a0+.16;a<a1-.12;a+=.22+R()*.24){const gd=gapD(a);if(gd<=0)continue;const tp=clamp(Math.min(gd,endD(a)+.15)/1.6,.34,1),h=hh(a),w=wan(a),f=wf(a);
    const st=pickT(a),tt=()=>R()<.72?st:pickT(a+.6),thin=f<.38?.82:1;
    {const r=(.32+R()*.22)*tp*thin*(.86+.22*h),al=a+(R()-.5)*.1,ac=w+(R()-.5)*.2;if(!bad(al,ac))B.push([al,ac,r*.9+(.1+R()*.22)*h*tp,r,st]);}
    if(f>.36&&R()<.55*tp){const r=(.24+R()*.16)*tp,al=a+(R()-.5)*.2,ac=w+(R()<.5?-1:1)*(.24+R()*.12);if(!bad(al,ac))B.push([al,ac,r*.9+(.06+R()*.16)*h*tp,r,tt()]);}   // a bulge to one side: the hedge's width comes and goes
    if(f>.54&&tp>.6){const sd=side(a),r=(.26+R()*.14)*tp,al=a+(R()-.5)*.18,ac=w+sd*(.42+(f-.54)*1.2+R()*.12);if(!bad(al,ac))B.push([al,ac,r*.85+(.05+R()*.12)*h,r,tt()]);}   // a second row, tucked in behind
    if(tp>.85&&R()<.6){const r=(.19+R()*.13)*(.82+.3*h),al=a+(R()-.5)*.18,ac=w+(R()-.5)*.18;if(!bad(al,ac))B.push([al,ac,.46*h+.36+R()*.28*h,r,tt()]);}   // the crown: an uneven top line
    if(R()<.45){const r=.17+R()*.12,al=a+(R()-.5)*.2,ac=w+(R()<.5?-1:1)*(.3+R()*.14);if(!bad(al,ac))B.push([al,ac,r*.72,r,tt()]);}}               // low growth at the foot
  if(!B.length)return;
  // screen space, relative to the run's start on its centre line
  const S=b=>vert?[b[1]*32,(b[0]-a0)*32-b[2]*32]:[(b[0]-a0)*32,b[1]*32-b[2]*32],G=b=>vert?[b[1]*32+b[2]*12,(b[0]-a0)*32+b[2]*6]:[(b[0]-a0)*32+b[2]*12,b[1]*32+b[2]*6];
  let mx=1e9,Mx=-1e9,my=1e9,My=-1e9;for(const b of B){const [sx,sy]=S(b),[gx,gy]=G(b),r=b[3]*32*1.25;mx=Math.min(mx,sx-r,gx-r);Mx=Math.max(Mx,sx+r,gx+r*1.3);my=Math.min(my,sy-r);My=Math.max(My,sy+r,gy+r);}
  mx=Math.floor(mx)-3;my=Math.floor(my)-3;const W=Math.ceil(Mx-mx)+4,H=Math.ceil(My-my)+4;
  // the pieces: short ones along a hedge that runs up the screen (so it sorts against you), longer across
  const cuts=[a0];for(let a=a0;;){a+=vert?1.1+R()*.7:2.6+R()*1.6;if(a>=a1-.5)break;cuts.push(a);}cuts.push(a1+1);
  const pieceOf=al=>{let k=0;while(k<cuts.length-2&&al>=cuts[k+1])k++;return k;};
  // the pieces stand in the world now (so they sort, block and cast their shade from the start); their pictures are painted
  // the first time one is needed, or in a quiet moment soon after the world is built (painting every hedge at once held the
  // world's building up by a second or more)
  const NP=cuts.length-1,objs=[],AR=[];
  for(let pc=0;pc<NP;pc++){const ar=vert?[c,Math.min(a1,(cuts[pc]+Math.min(a1,cuts[pc+1]))/2+.15)]:[(cuts[pc]+Math.min(a1,cuts[pc+1]))/2,c];AR.push(ar);
    const key='f39hg_'+tag+'_'+pc;SPR[key]={src:'mem:'+key,fw:1,fh:1,ax:0,ay:0,foot:[0,0,0,0]};const e=obj(key,ar[0],ar[1],{kind:'bush',f39h:1,f39hg:1});F39.objs.push(e);objs.push(e);}
  {const step=160;for(let s0=0;s0<(vert?H:W);s0+=step){const x0=vert?0:s0,y0=vert?s0:0,cw=vert?W:Math.min(step,W-s0),ch=vert?Math.min(step,H-s0):H;const key='f39hs_'+tag+'_'+s0;
    // anchored at its bottom left, so it is drawn while any of it is on screen
    const wx=vert?c+(x0+mx)/32:a0+(x0+mx)/32,wz=vert?a0+(y0+ch+my)/32:c+(y0+ch+my)/32;SPR[key]={src:'mem:'+key,fw:cw,fh:ch,ax:0,ay:ch,foot:[0,0,0,0]};
    F39.objs.push(obj(key,wx,wz,{kind:'flat',f39hs:1}));}}
  const run={done:false,x:vert?c:(a0+a1)/2,z:vert?(a0+a1)/2:c};const keys=[];for(let pc=0;pc<NP;pc++)keys.push('f39hg_'+tag+'_'+pc);for(let s0=0;s0<(vert?H:W);s0+=160)keys.push('f39hs_'+tag+'_'+s0);
  run.gen=()=>{if(run.done)return;run.done=true;const t0=performance.now();
  const own=new Int16Array(W*H).fill(-1),ty=new Uint8Array(W*H),ix=new Uint8Array(W*H);const TY=[dom,sec,third||dom];
  // back to front: further from you first, and the higher clumps after the lower at the same place
  const order=B.map((b,i)=>i).sort((p,q)=>{const zp=vert?B[p][0]:B[p][1],zq=vert?B[q][0]:B[q][1];return (zp*32+B[p][2]*9)-(zq*32+B[q][2]*9);});
  for(const bi of order){const b=B[bi],[sx,sy]=S(b),rp=b[3]*32,cx=sx-mx,cy=sy-my,p1=hash(bi*7+3,11)*6.28,p2=hash(bi*3+1,5)*6.28,pc=pieceOf(b[0]),t=TY.indexOf(b[4]),hy=clamp(b[2]/.95,0,1);
    const tone=(dx,dy,rr)=>{const nx=dx/rr,ny=dy/rr,nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny)),lam=-.5*nx-.62*ny+.6*nz;return .95+3.1*(lam*.5+.5)+(hy-.45)*.8;};
    // the clump's outline once: for each pixel round it, how far in from its lumpy edge it is (worked out once, used three times)
    const R2=Math.ceil(rp*1.2)+1,SZ=R2*2+1,ox0=Math.floor(cx)-R2,oy0=Math.floor(cy)-R2,IN=new Float32Array(SZ*SZ).fill(-1);
    for(let v=0;v<SZ;v++)for(let u=0;u<SZ;u++){const dx=ox0+u+.5-cx,dy=oy0+v+.5-cy,d=Math.hypot(dx,dy);if(d>rp*1.2)continue;const an=Math.atan2(dy,dx),rr=rp*(1+.11*Math.sin(3*an+p1)+.06*Math.sin(5*an+p2));if(d<=rr)IN[v*SZ+u]=rr-d;}
    // the clump's body (what shows between its leaf clusters: a step darker)
    for(let v=0;v<SZ;v++){const y=oy0+v;if(y<0||y>=H)continue;for(let u=0;u<SZ;u++){const x=ox0+u;if(x<0||x>=W)continue;const e=IN[v*SZ+u];if(e<0)continue;
      const dx=x+.5-cx,dy=y+.5-cy;let vv=tone(dx,dy,rp)-1.1;if(e<1.4&&dx*.7+dy>0)vv=Math.min(vv,1.2);const k=y*W+x;own[k]=pc;ty[k]=t;ix[k]=clamp(Math.round(vv),1,5);}}
    // its leaf clusters, top ones first so each lower one overlaps the one above it
    const CL=[];const sp=4.3;for(let gy=-rp;gy<=rp;gy+=sp)for(let gx=-rp;gx<=rp;gx+=sp){const jx=gx+(hash(((gx+40)*3)|0,bi*7+((gy+40)|0))-.5)*2.6,jy=gy+(hash(bi*11+((gx+40)|0),((gy+40)*5)|0)-.5)*2.6;
      const u=Math.floor(cx+jx)-ox0,v=Math.floor(cy+jy)-oy0;if(u>=0&&v>=0&&u<SZ&&v<SZ&&IN[v*SZ+u]>1.6)CL.push([jx,jy,2.5+hash(bi*5+((gx+40)|0),((gy+40)|0)+3)*1.5]);}
    CL.sort((p,q)=>p[1]-q[1]);
    for(const [lx0,ly0,rd] of CL){const tc=tone(lx0,ly0,rp);
      for(let y=Math.floor(cy+ly0-rd-1);y<=cy+ly0+rd+1;y++){if(y<0||y>=H)continue;const v=y-oy0;if(v<0||v>=SZ)continue;for(let x=Math.floor(cx+lx0-rd-1);x<=cx+lx0+rd+1;x++){if(x<0||x>=W)continue;const u=x-ox0;if(u<0||u>=SZ||IN[v*SZ+u]<0)continue;
        const ex=(x+.5-cx-lx0)/rd,ey=(y+.5-cy-ly0)/rd,e2=ex*ex+ey*ey;if(e2>1)continue;
        let vv=tc;if(ex+ey<-.62&&e2>.22)vv+=1;else if(ey>.42&&e2>.42)vv-=.9;
        const k=y*W+x;own[k]=pc;ty[k]=t;ix[k]=clamp(Math.round(vv),1,5);}}}
    }
  // no single stray pixels: a pixel none of its neighbours share takes the commonest of theirs
  {const I2=ix.slice();for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const k=y*W+x;if(own[k]<0)continue;const v=ix[k];let same=0;const cnt=[0,0,0,0,0,0];for(const q of [k-1,k+1,k-W,k+W]){if(own[q]<0)continue;if(ix[q]===v)same++;cnt[ix[q]]++;}
    if(!same){let b=v,bc=0;for(let u=1;u<6;u++)if(cnt[u]>bc){bc=cnt[u];b=u;}I2[k]=b;}}ix.set(I2);}
  // the underside: the last pixels of growth above the ground in each column are in deep shade
  for(let x=0;x<W;x++)for(let y=H-1;y>=0;y--){const k=y*W+x;if(own[k]<0||(y+1<H&&own[k+W]>=0))continue;ix[k]=1;if(y>0&&own[k-W]>=0)ix[k-W]=Math.min(ix[k-W],2);}
  // the outline (the darkest of the shrub's colours on the shaded sides, one step lighter on the lit top and left)
  const out=new Int16Array(W*H).fill(-1),outC=new Uint8Array(W*H),outT=new Uint8Array(W*H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=y*W+x;if(own[k]>=0)continue;let q=-1,lit=false;
    if(x+1<W&&own[k+1]>=0){q=k+1;lit=true;}else if(y+1<H&&own[k+W]>=0){q=k+W;lit=true;}else if(x>0&&own[k-1]>=0)q=k-1;else if(y>0&&own[k-W]>=0)q=k-W;
    if(q<0)continue;out[k]=own[q];outT[k]=ty[q];outC[k]=lit?1:0;}
  // the underside all along the shaded side (a hedge running up the screen shows its dark foot down its right-hand side)
  if(vert)for(let y=0;y<H;y++){let xr=-1;for(let x=W-1;x>=0;x--)if(own[y*W+x]>=0){xr=x;break;}if(xr<1)continue;ix[y*W+xr]=1;if(own[y*W+xr-1]>=0)ix[y*W+xr-1]=Math.min(ix[y*W+xr-1],2);}
  // long grass at its foot the whole way along, both sides, thick and thin by turns (blades rooted at their own depths)
  const gOwn=new Int16Array(W*H).fill(-1),gCol=[];const GP=[F39_GRP.straw,F39_GRP.olive,F39_GRP.straw,F39_GRP.rust];
  const blade=(x0,y0,h,lean,pal,pc)=>{for(let t=0;t<h;t++){const x=Math.round(x0+lean*t),y=Math.round(y0-t);if(x<0||y<0||x>=W||y>=H)continue;const k=y*W+x;gOwn[k]=pc;gCol[k]=pal[t<1?0:t>=h-1?4:t>h*.55?3:2];}};
  // (in clumps: a run of blades taller in its middle, then a gap, never a bead on every pixel)
  const pick=v=>GP[Math.min(GP.length-1,(Math.abs(v)*GP.length)|0)];
  if(vert){for(const sd of [-1,1]){let y=2;while(y<H){const n0=fbm(y*.08+k0+(sd>0?5:9),c*.3+2);if(n0<.4){y+=3+((hash(y,sd+30)*6)|0);continue;}
      const len=3+((hash(y*3,sd+21)*5)|0),pal=pick(hash(y*5+1,sd+40+(k0|0)));
      for(let t=0;t<len;t++){const yy=y+t;if(yy>=H)break;let xe=-1;if(sd>0){for(let x=W-1;x>=0;x--)if(own[yy*W+x]>=0){xe=x;break;}}else{for(let x=0;x<W;x++)if(own[yy*W+x]>=0){xe=x;break;}}if(xe<0)continue;
        const mid=1-Math.abs(t-(len-1)/2)/Math.max(1,len/2),pc=own[yy*W+xe],nb=1+((hash(yy,sd+50)*2)|0);
        for(let q=0;q<nb;q++){const h=Math.max(2,Math.round((3+hash(yy*7+q,sd+60)*4)*(.45+.55*mid)));blade(xe+sd*(((hash(yy+q,sd+70)*3)|0)-0),yy,h,sd*hash(yy,q+80)*.45,pal,pc);}}
      y+=len+1+((hash(y,sd+90)*4)|0);}}}
  else{let x=0;while(x<W){const n0=fbm(x*.08+k0,c*.3+3);if(n0<.4){x+=3+((hash(x,31)*6)|0);continue;}const len=3+((hash(x*3,22)*5)|0),pal=pick(hash(x*5+1,41+(k0|0)));
      for(let t=0;t<len;t++){const xx=x+t;if(xx>=W)break;let yb=-1;for(let y=H-1;y>=0;y--)if(own[y*W+xx]>=0){yb=y;break;}if(yb<0)continue;
        const mid=1-Math.abs(t-(len-1)/2)/Math.max(1,len/2),pc=own[yb*W+xx],h=Math.max(2,Math.round((3+hash(xx*7,61)*5)*(.45+.55*mid)));
        blade(xx,Math.min(H-1,yb+1+((hash(xx*5,71)*2)|0)),h,(hash(xx,81)-.5)*.6,pal,pc);}
      x+=len+1+((hash(x,91)*4)|0);}}
  // the shadow on the ground, down and to the right of each clump, darker close in
  const sh=new Uint8Array(W*H);for(const b of B){const [gx,gy]=G(b),rp=b[3]*32,cx=gx-mx,cy=gy-my;
    for(let y=Math.max(0,Math.floor(cy-rp));y<Math.min(H,Math.ceil(cy+rp));y++)for(let x=Math.max(0,Math.floor(cx-rp*1.15));x<Math.min(W,Math.ceil(cx+rp*1.15));x++){const e=((x+.5-cx)/(rp*1.12))**2+((y+.5-cy)/(rp*.66))**2;if(e<1)sh[y*W+x]=1;}}
  // paint the pieces
  const BB=[];for(let pc=0;pc<NP;pc++)BB.push([W,H,-1,-1]);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=y*W+x;for(const pc of [own[k],out[k],gOwn[k]]){if(pc<0)continue;const b=BB[pc];if(x<b[0])b[0]=x;if(x>b[2])b[2]=x;if(y<b[1])b[1]=y;if(y>b[3])b[3]=y;}}
  for(let pc=0;pc<NP;pc++){let [bx0,by0,bx1,by1]=BB[pc];if(bx1<0){bx0=by0=bx1=by1=0;}const cw=bx1-bx0+1,ch=by1-by0+1,cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const g=cv.getContext('2d'),im=g.createImageData(cw,ch),D=im.data;
    for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const k=(y+by0)*W+x+bx0,o=(y*cw+x)*4;let col=null;
      if(gOwn[k]===pc)col=gCol[k];else if(own[k]===pc)col=F39_HPAL[TY[ty[k]]][ix[k]];else if(out[k]===pc)col=F39_HPAL[TY[outT[k]]][outC[k]?1:0];if(!col)continue;D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=255;}
    g.putImageData(im,0,0);
    const ar=AR[pc];
    const [rx,ry]=vert?[0,(ar[1]-a0)*32]:[(ar[0]-a0)*32,0];const key='f39hg_'+tag+'_'+pc;f39Img(key,cv);Object.assign(SPR[key],{fw:cw,fh:ch,ax:rx-mx-bx0,ay:ry-my-by0});}
  // the shadow, laid on the ground in strips (flat, under everything)
  {const step=160;for(let s0=0;s0<(vert?H:W);s0+=step){const x0=vert?0:s0,y0=vert?s0:0,cw=vert?W:Math.min(step,W-s0),ch=vert?Math.min(step,H-s0):H;
    const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const g=cv.getContext('2d'),im=g.createImageData(cw,ch),D=im.data;let any=0;
    for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const k=(y+y0)*W+x+x0;if(!sh[k]||own[k]>=0)continue;const o=(y*cw+x)*4;D[o]=10;D[o+1]=18;D[o+2]=8;D[o+3]=84;any++;}
    if(any)g.putImageData(im,0,0);f39Img('f39hs_'+tag+'_'+s0,cv);}}
  F39.hms=(F39.hms||0)+performance.now()-t0;};
  for(const k of keys)Object.defineProperty(IMG,'mem:'+k,{configurable:true,enumerable:true,get(){run.gen();const v=F39_IMG.get(k);return v;}});
  (F39.hq=F39.hq||[]).push(run);
  // it stops you, with gaps you can walk through
  for(let a=a0+.25;a<a1-.1;a+=.5){if(gapD(a)<.3)continue;const [x,z]=world(a,wan(a));if(bad(a,wan(a)))continue;addCircle(x,z-.05,.32);}
  // a field tree standing up out of it now and then
  if(L>12&&R()<.55){for(let t=0;t<8;t++){const a=a0+3+R()*(L-6);if(gapD(a)<1.5)continue;const [x,z]=world(a,wan(a));if(bad(a,wan(a))||!clearSpot(x,z,.2))continue;
    const e=obj(['oak_russet','maple_gold','maple_orange'][(R()*3)|0],x,z+.05,{kind:'tree',flip:R()<.5,f39h:1});addCircle(x,z-.05,.4);F39.objs.push(e);break;}}
  // where a run ends in open ground it often finishes in a small shrub of its own kind standing off the end (the kit's bushes)
  {const BP={green:'olive',olive:'olive',gold:'gold',rust:'russet'};for(const [al,dir] of [[a0,-1],[a1,1]]){if(R()<.4)continue;const ax=al+dir*(.6+R()*.3),ac=wan(al)+(R()-.5)*.3,[bx,bz]=world(ax,ac);
    if(bad(ax,ac)||f39OnTrack(bx,bz,.7)||(typeof clearSpot==='function'&&!clearSpot(bx,bz,.3)))continue;f39Bush(bx,bz,(R()*3)|0,BP[R()<.7?dom:sec]||'olive');}}
  // long grass and fern at its foot, both sides, in clumps (not all along it)
  for(const sd of [-1,1])for(let a=a0+.4+R()*1.2;a<a1-.3;a+=2.4+R()*3.4){if(R()<.45||gapD(a)<.2)continue;const n=1+((R()*2)|0);
    for(let q=0;q<n;q++){const al=a+(R()-.5)*.9,ac=wan(al)+sd*(.58+R()*.3);if(bad(al,ac))continue;const [tx,tz]=world(al,ac);f39Tuft(tx,tz,(R()*1e6)|0,seed);}}
  return objs;}
// boards and stakes: their shadow joins the post's foot and runs down and to the right (one contact shadow at the foot, then
// the post and board thrown long and low down-right, whatever the hour), never a bar floating under the board
if(typeof sunShadow==='function'){const _s3=sunShadow;sunShadow=function(o,X,Y){if(o&&(o.landSign||o.landStake||o.f39sign)&&typeof DX!=='undefined'&&DX.sun&&!DX.sun.lamp){
    const s=DX.sun,a=s.sx,b=s.sy;s.sx=.62;s.sy=.36;let r;try{r=_s3.apply(this,arguments);}finally{s.sx=a;s.sy=b;}
    try{const g=DX.sg;g.setTransform(1,0,0,1,0,0);g.fillStyle='#0a1206';g.beginPath();g.ellipse(Math.round(X)+2,Math.round(Y),o.landStake?3:5,o.landStake?1.2:1.8,0,0,Math.PI*2);g.fill();
      const hb=o.landStake?10:18;g.strokeStyle='#0a1206';g.lineWidth=o.landStake?2:3;g.lineCap='round';g.beginPath();g.moveTo(Math.round(X)+1,Math.round(Y));g.lineTo(Math.round(X)+1+.62*hb,Math.round(Y)+.36*hb);g.stroke();}catch(e){}return r;}
  return _s3.apply(this,arguments);};}
// the hedge sprites draw their own shadow on the ground; the engine's per-sprite sun shadow would cut it into a dashed line
if(typeof sunShadow==='function'){const _s2=sunShadow;sunShadow=function(o){if(o&&o.f39hg)return true;return _s2.apply(this,arguments);};}

// the West Fields are one cleared stretch: meadow out to a few paces round the outside plots, with a ragged woods edge (never
// a ruled one), and no woods floor or trees left in the gaps between plots
const f39RectD=(P,x,z)=>Math.hypot(Math.max(P.x0-x,0,x-P.x0-P.w),Math.max(P.z0-z,0,z-P.z0-P.h));
function f39Meadow(x,z){if(x<-160||x>-34||z<-42||z>130)return false;let d=1e9;for(const P of LAND_PARCELS)if(P.f39){const q=f39RectD(P,x,z);if(q<d)d=q;}
  return d<4.3+2.6*(fbm(x*.13+31,z*.13+17)-.5)+1.2*(fbm(x*.5+3,z*.5+9)-.5);}
function f39Clearing(x,z){
  if(f39Meadow(x,z))return true;
  for(const q of F39.tracks)if(segDist(x,z,q[0],q[1],q[2],q[3])<q[4]/2+2.3+1.4*(fbm(x*.21+7,z*.21+3)-.5))return true;   // (wide and ragged: no sliver of woods floor left between a track and a field)
  const L=F39.lane;if(Math.abs(x-L.x)<1.9&&z<L.z0+.6&&z>L.z1-.6)return true;if(Math.abs(z-L.z1)<1.5&&x>L.px0-1&&x<L.px1+1)return true;
  for(const s of F39_CABINS)if(x>s.x-5.4&&x<s.x+5.9&&z>s.z-4.2&&z<s.z+7.8)return true;
  return false;}
function f39Build(){if(F39.built)return;F39.built=true;const t0=performance.now();let n=0;
  for(const o of OBJ){if(o.hide||o.room||o.town||o.story||o.mile||o.keep||o.landDeb||o.crashOak)continue;if(!F39_CLEAR.test(o.kind||''))continue;
    if(o.x>-160&&o.x<20&&o.z>-45&&o.z<180&&f39Clearing(o.x,o.z)){f39Hide(o);n++;}}
  F39.hidden=n;
  // hedgerows in the gaps between neighbouring plots (and behind the two that back onto open ground): that's how you see where
  // one field stops and the next starts, with no fence anywhere; gaps where it has died back, so you can always get through
  for(const [x1,z1,x2,z2,seed] of F39_HEDGES)f39Hedge(x1,z1,x2,z2,seed);
  // the tracks are dirt, the same as every road (and the farm road carries on west from where it stopped)
  F39.farmRoad=ROADS.find(q=>q[0]===20&&q[1]===46&&q[2]===-52&&q[3]===46)||null;
  F39.roadRefs=[];F39.trackRefs=[];for(const q of F39.tracks){const r=q.slice();ROADS.push(r);F39.roadRefs.push(r);F39.trackRefs.push(r);}
  const L=F39.lane;for(const r of [[L.x,L.z0-1,L.x,L.z1,1.4],[L.px0,L.z1,L.px1,L.z1,1.2]]){ROADS.push(r);F39.roadRefs.push(r);}
  // the short paths from the lane to each cabin's steps are worn only once someone lives there (see landSync below)
  // stepping stones from the lane to each cabin's steps (set out once someone lives there): a worn spur that short read as a stain
  F39.spurs=[];F39.stones=F39_CABINS.map((c,i)=>{const n=2,out=[];for(let k=0;k<n;k++){const z=c.z+.95+k*(L.z1-.75-c.z-.95)/Math.max(1,n-1),x=c.x+(l35Hash('ss'+i,k)-.5)*.3;
    const e=obj('stepstone_'+((l35Hash('ss'+i,k+5)*3)|0),x,z,{kind:'flat',hide:true,flip:l35Hash('ss'+i,k+9)<.5,f39ss:i});F39.objs.push(e);out.push(e);}return out;});
  // the west lane ends at a hay cart pulled off at the bottom, by the willows, with its load half forked off
  {const tx=-153.2,tz=124.4;
    if(SPR.cart&&!LAYERS.water(tx+2.6,tz+1.6)){F39.objs.push(obj('cart',tx+2.6,tz+1.7,{kind:'prop',flip:true}));addRect(tx+2.6-1.2,tz+1.7-.5,tx+2.6+1.2,tz+1.7);}
    if(SPR.hay)for(const [dx,dz] of [[-2.5,.9],[-3.1,1.9]])if(!LAYERS.water(tx+dx,tz+dz)){F39.objs.push(obj('hay',tx+dx,tz+dz,{kind:'prop'}));addRect(tx+dx-.8,tz+dz-1.2,tx+dx+.8,tz+dz);}}
  try{f39Beds();}catch(e){console.warn('kitchen beds',e);}
  // the lane between the North piece and the Pine piece ends at a field gate: a hedge has grown up along the back of both
  // pieces against the burnt wood (two paces back from them: no fence round any field), and the lane goes through it by a
  // gateway, its gate swung open into the lane
  try{const gz=-38.2,gx0=-91.35,gx1=-89.25;f39Hedge(-121.8,gz,gx0-.35,gz,'hb1');f39Hedge(gx1+.35,gz,-62.6,gz,'hb2');
    if(typeof l35Post==='function'&&SPR.l35_gate_n){l35Post(gx0,gz,true);l35Post(gx1,gz);const e=obj('l35_gate_n',gx0,gz+.375,{kind:'prop',noCol:true});F39.objs.push(e);F39.gate=[gx0,gx1,gz];}}catch(e){console.warn('north gate',e);}
  // the west lane goes through a field gate too, where the causeway leaves the fields for the willows and the river
  try{const gz=126.7,gx0=-154.35,gx1=-152.05;if(typeof l35Post==='function'&&SPR.l35_gate_n){l35Post(gx0,gz,true);l35Post(gx1,gz);F39.objs.push(obj('l35_gate_n',gx0,gz+.375,{kind:'prop',noCol:true}));}}catch(e){console.warn('west gate',e);}
  // the boards
  const sign=(x,z,label)=>{const o=obj('signpost',x,z,{kind:'prop',label,face:'P',noCol:true,f39sign:1});try{o.spr=signSprite(label,'plain');}catch(e){}addCircle(x,z,.18);F39.objs.push(o);return o;};
  sign(-43.6,-2.6,'WEST FIELDS');sign(-50.4,44.1,'WEST FIELDS');sign(-92.1,-8.6,'WEST FIELDS');
  F39.sign=sign(8.4,-13.2,'HOMESTEAD LANE');
  // the yard: the track from the steps forks round the well, one way to Grandpa's door and the other to the barn
  for(const q of F39_YARDLANES){if(q[4]>2)continue;const r=q.slice();ROADS.push(r);F39.roadRefs.push(r);}   // (on past the cart to the foot of the barn's steps)
  // every plot's front edge, along its track: stones the last man picked off the field, heaped by the edge every so often
  for(const P of f39Plots()){const s=P.side,len=s==='N'||s==='S'?P.w:P.h;const nh=Math.max(1,Math.round(len/14));
    for(let i=0;i<nh;i++){const t=(i+.3+l35Hash(P.id,300+i)*.4)/nh,a=s==='N'||s==='S'?P.x0+P.w*t:P.z0+P.h*t;
      const [cx,cz]=s==='N'?[a,P.z0-.32]:s==='S'?[a,P.z0+P.h+.3]:s==='W'?[P.x0-.35,a]:[P.x0+P.w+.35,a];
      const q=l35Hash(P.id,320+i),sz=q<.45?'small':q<.85?'mid':'big';if(f39OnTrack(cx,cz,.6))continue;f39Heap(cx,cz,P.id+'fh'+i,sz);
      if(l35Hash(P.id,330+i)<.4){const o2=(l35Hash(P.id,331+i)<.5?-1:1)*(1.1+l35Hash(P.id,332+i)*.8);const [x2,z2]=s==='N'||s==='S'?[cx+o2,cz+.12]:[cx+.1,cz+o2];if(!f39OnTrack(x2,z2,.4))f39Heap(x2,z2,P.id+'fs'+i,'small');}}}
  for(const o of OBJ)if(!o.hide&&o.spr==='mud_a'&&Math.abs(o.x-8.6)<1&&Math.abs(o.z+7.8)<1)o.hide=true;
  try{f39Steps();}catch(e){console.warn('ridge steps',e);}
  setTimeout(f39HedgeIdle,400);
  if(typeof NAV!=='undefined')NAV.sig='';
  F39.ms=Math.round(performance.now()-t0);}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{f39Build();}catch(e){console.error('west fields',e);}try{landSync();}catch(e){}return r;};}
// the lane's board only stands while there are cabins up the lane
{const _ls=landSync;landSync=function(){const r=_ls.apply(this,arguments);try{if(F39.sign)F39.sign.hide=!landActiveHomes().length;}catch(e){}return r;};}
// ---------------------------------------------------------------- the ground: grass over the fields and tracks, not woods floor
{const W0=LAYERS.water;LAYERS.water=(x,z)=>{if(x>-155.4&&x<-151&&z>126&&z<148&&Math.abs(x+153.2)<1.05+.25*(fbm(z*.6,3)-.5))return false;return W0(x,z);};}
{const Dk=LAYERS.dark;LAYERS.dark=(x,z)=>{if(F39.built&&x>-162&&x<22&&z>-46&&z<180&&f39Clearing(x,z))return false;return Dk(x,z);};}
// the plots show on the ground. Round each one a worn headland (paler, drier grass where the plough turned and people walk),
// its inner edge wandering in lobes, never ruled; inside it the old furrows, a lit ridge and a shaded trough: each row at the
// plot's own spacing, the spacing drifting across the field, each row its own strength, and the rows coming and going along
// their length and gone altogether over whole patches of the field (an old field shows its furrows in places, not like cloth)
function f39Despeck(D,W){const O=new Uint8ClampedArray(D),W4=W*4;
  for(let py=1;py<W-1;py++)for(let px=1;px<W-1;px++){const o=(py*W+px)*4;if(O[o+1]<O[o]+2)continue;const lc=O[o]*3+O[o+1]*6+O[o+2]-70;let n=0,pick=-1;
    for(const q of [o-4,o+4,o-W4,o+W4,o-W4-4,o-W4+4,o+W4-4,o+W4+4]){if(O[q]*3+O[q+1]*6+O[q+2]<lc){n++;if(pick<0)pick=q;}}
    if(n>=6){D[o]=O[pick];D[o+1]=O[pick+1];D[o+2]=O[pick+2];}}}
function f39Ground(g,x0,z0,N){if(!F39.built)return;const ps=f39Plots().filter(P=>P.x0<x0+N+1&&P.x0+P.w>x0-1&&P.z0<z0+N+1&&P.z0+P.h>z0-1);
  const trk=F39.tracks.concat(F39_YARDTRK).filter(q=>Math.min(q[0],q[2])-2<x0+N&&Math.max(q[0],q[2])+2>x0&&Math.min(q[1],q[3])-2<z0+N&&Math.max(q[1],q[3])+2>z0);
  const W=N*32,id=g.getImageData(0,0,W,W),D=id.data;
  // the tracks' edges, redrawn at the pixel: each edge wanders along the track in lobes of a few paces (never ruled, never in
  // square bites), the old dark lip the ground drew along the square-bitten edge is taken out wherever it now lies inside the
  // track, and a new lip is drawn along the new edge: dark where the bank shades the sunken track (top and left), a pale crumb
  // where it catches the light (bottom and right)
  if(trk.length){const O=new Uint8ClampedArray(D);const sum=o=>O[o]+O[o+1]+O[o+2];
    // the track's own dirt tone here (its middle value); anything on the track well darker than that is the old lip
    let dm=0;{const hs=new Uint32Array(256);let n=0;for(let o=0;o<O.length;o+=16)if(O[o]>O[o+1]+4&&sum(o)>150){hs[(sum(o)/3)|0]++;n++;}let c=0;for(let v=0;v<256;v++){c+=hs[v];if(c>=n/2){dm=v*3;break;}}}
    let gm=0;{const hs=new Uint32Array(256);let n=0;for(let o=0;o<O.length;o+=16)if(O[o+1]>=O[o]+4&&sum(o)>150){hs[(sum(o)/3)|0]++;n++;}let c=0;for(let v=0;v<256;v++){c+=hs[v];if(c>=n/2){gm=v*3;break;}}}
    const isLite=o=>O[o]>O[o+1]+4&&sum(o)>dm*1.13,isDirt=o=>O[o]>O[o+1]+4&&sum(o)>Math.max(190,dm*.84)&&sum(o)<=dm*1.13,isGrass=o=>O[o+1]>=O[o]+4&&sum(o)>Math.max(150,gm*.8),isLip=o=>O[o]+3>=O[o+1]&&sum(o)<dm*.84;
    const at=(x,y)=>(x<0||y<0||x>=W||y>=W)?-1:(y*W+x)*4;
    for(let py=0;py<W;py++){const wz=z0+(py+.5)/32;for(let px=0;px<W;px++){const wx=x0+(px+.5)/32;let best=null,bd=9;
      for(const q of trk){const dx=q[2]-q[0],dz=q[3]-q[1],L2=dx*dx+dz*dz||1,t=clamp(((wx-q[0])*dx+(wz-q[1])*dz)/L2,0,1),cx=q[0]+dx*t,cz=q[1]+dz*t,d=Math.hypot(wx-cx,wz-cz);if(d<bd){bd=d;best=[q,cx,cz,t*Math.sqrt(L2),dx/Math.sqrt(L2),dz/Math.sqrt(L2)];}}
      if(!best)continue;const q=best[0],hw=q[4]/2;if(bd>hw+1.7)continue;
      const wan=Math.max(-.42,(fbm(best[3]*.22+q[0]*.1,q[1]*.1+3)-.5)*1.0+(fbm(best[3]*.7+q[0]*.05+7,q[1]*.07+5)-.5)*.85+(fbm(wx*1.1+5,wz*1.1)-.5)*.2)*(q[4]<1.5?.3:1);
      const sd=bd-(hw+wan),want=sd<0,o=(py*W+px)*4;const nx=bd>.01?(wx-best[1])/bd:0,nz=bd>.01?(wz-best[2])/bd:0,tx=best[4],tz=best[5];
      const near=sd>-1.1;
      if(want&&(near?(!isDirt(o)||sum(o)>dm*1.07||sum(o)<dm*.92):(isLip(o)||isGrass(o)||isLite(o)))){let got=-1;
        for(const k of [9,-9,17,-17,25,-25,33,-33]){const r=at(Math.round(px+tx*k),Math.round(py+tz*k));if(r>=0&&isDirt(r)&&(!near||(sum(r)<=dm*1.07&&sum(r)>=dm*.92))){got=r;break;}}
        if(got<0)for(const k of [14,24,34,46]){const r=at(Math.round(px-nx*k),Math.round(py-nz*k));if(r>=0&&isDirt(r)){got=r;break;}}
        if(got>=0){D[o]=O[got];D[o+1]=O[got+1];D[o+2]=O[got+2];}}
      else if(!want&&!isGrass(o)){let got=-1;
        for(const k of [36,28,46,58,20]){const r=at(Math.round(px+nx*k),Math.round(py+nz*k));if(r>=0&&isGrass(r)){got=r;break;}}
        if(got<0)for(const k of [9,-9,17,-17,25,-25]){const r=at(Math.round(px+tx*k+nx*30),Math.round(py+tz*k+nz*30));if(r>=0&&isGrass(r)){got=r;break;}}
        if(got>=0){D[o]=O[got];D[o+1]=O[got+1];D[o+2]=O[got+2];}}
      if(want&&sd>-2.2/32){const lit=nx+nz>.2,edge=sd>-1.1/32,k=lit?(edge?1.16:1.06):(edge?.56:.76),a=lit&&edge?10:0;
        D[o]=Math.min(255,D[o]*k+a);D[o+1]=Math.min(255,D[o+1]*k+a*.8);D[o+2]=Math.min(255,D[o+2]*k+a*.5);}}}}
  const mix=(o,c,t)=>{D[o]+=(c[0]-D[o])*t;D[o+1]+=(c[1]-D[o+1])*t;D[o+2]+=(c[2]-D[o+2])*t;};
  const SPC={};for(const P of f39Plots())SPC[P.id]=.82+l35Hash(P.id,5)*.46;
  // the headland and the field are painted in their own tones, keeping only the ground's fine texture (its blades) and dropping
  // its broad zones, which showed through as dark islands with square steps; each edge is one line that wanders in lobes of a
  // few paces: the headland's outer edge into the meadow, and its inner edge, where the field starts, drawn as a dark turf line
  const pz=f39Plots().filter(P=>P.x0<x0+N+3&&P.x0+P.w>x0-3&&P.z0<z0+N+3&&P.z0+P.h>z0-3);
  if(pz.length){const n=W*W,Lu=new Float32Array(n),Bl=new Float32Array(n),T=new Float32Array(n),R2=4;
    for(let i=0;i<n;i++){const o=i*4;Lu[i]=D[o]*.3+D[o+1]*.59+D[o+2]*.11;}
    for(let y=0;y<W;y++){let acc=0;for(let x=-R2;x<=R2;x++)acc+=Lu[y*W+clamp(x,0,W-1)];for(let x=0;x<W;x++){T[y*W+x]=acc/(2*R2+1);acc+=Lu[y*W+Math.min(W-1,x+R2+1)]-Lu[y*W+Math.max(0,x-R2)];}}
    for(let x=0;x<W;x++){let acc=0;for(let y=-R2;y<=R2;y++)acc+=T[clamp(y,0,W-1)*W+x];for(let y=0;y<W;y++){Bl[y*W+x]=acc/(2*R2+1);acc+=T[Math.min(W-1,y+R2+1)*W+x]-T[Math.max(0,y-R2)*W+x];}}
    const th=v=>Math.tanh(v);
    for(let py=0;py<W;py++){const wz=z0+(py+.5)/32;for(let px=0;px<W;px++){const wx=x0+(px+.5)/32,i=py*W+px,o=i*4;
      let P=null,e=-1e9;for(const q of pz){const ex=Math.min(wx-q.x0,q.x0+q.w-wx),ez=Math.min(wz-q.z0,q.z0+q.h-wz),ee=ex<0||ez<0?-Math.hypot(Math.min(0,ex),Math.min(0,ez)):Math.min(ex,ez);if(ee>e){e=ee;P=q;}}
      if(!P||e<-2.7)continue;
      const r=D[o],gg=D[o+1],b=D[o+2];if(r>gg+6||b>gg+4||(Math.abs(r-gg)<10&&Math.abs(gg-b)<16&&gg>96))continue;   // the track, water, stones: left as they are
      {const rc=1.6,ex=Math.min(wx-P.x0,P.x0+P.w-wx),ez=Math.min(wz-P.z0,P.z0+P.h-wz);if(ex>0&&ez>0&&ex<rc&&ez<rc)e=rc-Math.hypot(rc-ex,rc-ez);}   // rounded corners
      const eo=clamp(-(.55+.38*th((fbm(wx*.15+P.z0+5,wz*.15+P.x0)-.5)*5))+(fbm(wx*.42+7,wz*.42+2)-.5)*1.3+(fbm(wx*1.6,wz*1.6+9)-.5)*.4,-1.25,-.08);
      // the meadow beside a track is its verge, trodden pale like the headlands either side of it (no dark tongue of hedge
      // strip reaching the road)
      if(e<eo){let vd=9;for(const q of trk){const d=segDist(wx,wz,q[0],q[1],q[2],q[3])-q[4]/2;if(d<vd)vd=d;}if(vd>(.85+.55*fbm(wx*.3+1,wz*.3+4))*clamp((e+2.6)/1.3,0,1))continue;}   /* (the verge thins out away from the fields; no edge where it stops) */                                                                                // the meadow
      const ei=clamp(1.0+.6*th((fbm(wx*.16+P.x0,wz*.16+P.z0)-.5)*5)+(fbm(wx*.42+3,wz*.42+1)-.5)*1.7+(fbm(wx*1.5+5,wz*1.5+2)-.5)*.5,.35,2.3),det=(Lu[i]-Bl[i])*.85;
      if(e<ei){const t=fbm(wx*.05+P.x0,wz*.05+9);const c=[126+t*12,120+t*10,74+t*6];                    // the headland: dry, pale, trodden
        D[o]=clamp(c[0]+det,0,255);D[o+1]=clamp(c[1]+det,0,255);D[o+2]=clamp(c[2]+det*.8,0,255);continue;}
      // the field: a step darker and greener than its headland (a value step you can see in grey), its edge a dark line of turf
      const t=fbm(wx*.05+P.z0,wz*.05+3)+(fbm(wx*.18+4,wz*.18+P.x0)-.5)*.5,zn=(Bl[i]-92)*.22;let c=[66+t*14+zn,74+t*14+zn,45+t*8+zn*.7];if(e<ei+1.6/32)c=[c[0]*.78,c[1]*.8,c[2]*.78];
      let R=clamp(c[0]+det,0,255),G=clamp(c[1]+det,0,255),B=clamp(c[2]+det*.8,0,255);
      const fade=clamp((e-ei-.15)/1.4,0,1);
      if(fade>0){const across=false,sp=SPC[P.id],v=wz-P.z0,al=wx;   /* rows run across the screen in every field: rows running up the screen are seen end-on as thin ruled lines (scanlines) */
        // furrows: the rows bend together across the field (the plough followed the ground), the spacing drifts; each row wavers on its own a little (a hand at the plough) as well as bending with the field, comes and goes in runs of
        // two or three paces, and is drawn as a low ridge: a soft lit crest and its shade just below it, both narrowing to
        // nothing at the run's ends; never one pixel line the length of the field
        const u0=v+.45*Math.sin(al*.19+P.x0*.7)+(fbm(al*.05+P.x0*.1,P.z0*.1+v*.03)-.5)*2.2,row0=Math.floor(u0/sp),u=u0+.16*Math.sin(al*.85+row0*2.3)+(fbm(al*.6+row0*5.1,row0)-.5)*.3,row=Math.floor(u/sp),f=u/sp-row;
        const rs=.35+.65*hash(row*7+((P.x0*13)|0),((P.z0*5)|0)+3),on=clamp((fbm(al*.42+row*3.7,row*1.3+P.z0)-.5)*4.2,0,1),m=fade*rs*on;
        if(m>.08){const cw=.035+.05*m;if(f<cw){const k=1+.16*m;R=R*k+5*m;G=G*k+4*m;B=B*(1+.06*m);}                       // the crest, catching the light
          else if(f<cw+.05+.06*m){const k=1-.3*m;R*=k;G*=k+.02;B*=k;}}}                                                  // its shade, just below it
      D[o]=clamp(R,0,255);D[o+1]=clamp(G,0,255);D[o+2]=clamp(B,0,255);}}}
  // the friends' garden plots, once their cabins stand: dug ground (lumps of turned earth, drier and paler than tilled soil),
  // its edge wandering, a dark lip of turf along its top and left and a pale crumb along its bottom and right
  {const hn=F39.homesN||0;for(let i=0;i<hn;i++){let hp;try{hp=homePlot(i);}catch(e){break;}if(hp.x0>x0+N+1||hp.x0+hp.w<x0-1||hp.z0>z0+N+1||hp.z0+hp.h<z0-1)continue;
    for(let py=0;py<W;py++){const wz=z0+(py+.5)/32;if(wz<hp.z0-1.1||wz>hp.z0+hp.h+1.1)continue;for(let px=0;px<W;px++){const wx=x0+(px+.5)/32;if(wx<hp.x0-1.1||wx>hp.x0+hp.w+1.1)continue;
      const ex1=wx-hp.x0,ex2=hp.x0+hp.w-wx,ez1=wz-hp.z0,ez2=hp.z0+hp.h-wz,e=Math.min(ex1,ex2,ez1,ez2),wob=(fbm(wx*.55+i*7,wz*.55)-.5)*1.7+(fbm(wx*1.9,wz*1.9+i)-.5)*.7+(fbm(wx*5,wz*5+i)-.5)*.25;if(e+wob<0)continue;
      const o=(py*W+px)*4,[v,hc]=f39Clod(Math.floor(wx*32),Math.floor(wz*32),5);let c=F39_DUG[v];const t=hc<.2?.92:hc>.84?1.06:1;c=[c[0]*t,c[1]*t,c[2]*t];
      if(e+wob<.07){const tl=Math.min(ex1,ez1)<Math.min(ex2,ez2);c=tl?[52,40,24]:[176,140,96];}
      D[o]=c[0];D[o+1]=c[1];D[o+2]=c[2];}}}}
  // the ground's own grass has pale flecks sprinkled through it (a pixel or two each); out here they're taken out (no speckle):
  // any grass pixel brighter than the middle of its 3x3 by a margin takes the middle one's colour; bigger shapes keep theirs
  f39Despeck(D,W);
  g.putImageData(id,0,0);}
{const _gp=groundPixels;groundPixels=function(g,x0,z0,N){const r=_gp.apply(this,arguments);if((z0+N>-44&&z0<180&&x0+N>-162&&x0<-32)||(z0+N>-46&&z0<2&&x0+N>-22&&x0<32)){try{f39Ground(g,x0,z0,N);}catch(e){console.warn('west fields ground',e);}}
  try{f39LowGround(g,x0,z0,N);}catch(e){console.warn('low fields ground',e);}return r;};}
// the old plots in the Low Fields, with nothing for sale now: their ground is one field again. The Low Fields' grass is drawn in
// hard-edged zones (olive, tawny, straw, green) with darker patches, which over a whole cleared field read as camouflage; over
// the old plots (and a ragged margin round them) every pixel keeps its place in its ramp, but the ramp is one that drifts
// slowly from olive to tawny across the field in four close steps, and the dark patches go
function f39LowGround(g,x0,z0,N){if(typeof L35_RAMP==='undefined'||z0+N<290)return;const olds=f39Plots().map(P=>{const o=F39.old[P.id];return o&&{x0:o.x0,z0:o.z0,w:P.w,h:P.h};}).filter(Boolean)
    .filter(o=>o.x0-6<x0+N&&o.x0+o.w+6>x0&&o.z0-6<z0+N&&o.z0+o.h+6>z0);if(!olds.length)return;
  if(!F39.rampIx){F39.rampIx=new Map();for(const zn of ['olive','tawny','straw','green'])for(const k of ['sh','dk','b','lt','hi']){const c=L35_RAMP[zn][k];F39.rampIx.set((c[0]<<16)|(c[1]<<8)|c[2],k);}}
  const W=N*32,id=g.getImageData(0,0,W,W),D=id.data,A=L35_RAMP.olive,Bt=L35_RAMP.tawny,IN=new Uint8Array(W*W);let n=0;
  for(let py=0;py<W;py++){const wz=z0+(py+.5)/32;for(let px=0;px<W;px++){const wx=x0+(px+.5)/32;
    let d=1e9;for(const o of olds){const q=Math.hypot(Math.max(o.x0-wx,0,wx-o.x0-o.w),Math.max(o.z0-wz,0,wz-o.z0-o.h));if(q<d)d=q;}
    if(d>3.2+2.4*(fbm(wx*.13+5,wz*.13+9)-.5))continue;IN[py*W+px]=1;const i=(py*W+px)*4,key=F39.rampIx.get((D[i]<<16)|(D[i+1]<<8)|D[i+2]);if(!key)continue;
    let k=key==='dk'?'b':key;const t=.16+.36*fbm(wx*.035+3,wz*.035+8);if((k==='hi'||k==='lt'||k==='sh')&&fbm(wx*.07+31,wz*.07+11)+(fbm(wx*.3,wz*.3)-.5)*.2<.34)k='b';   /* tufts kept over most of it (a quiet tuft layer), bare only in patches; the olive drifts to tawny in soft zones */   // the ground's tufts come in patches, thick to bare
    D[i]=Math.round(A[k][0]+(Bt[k][0]-A[k][0])*t);D[i+1]=Math.round(A[k][1]+(Bt[k][1]-A[k][1])*t);D[i+2]=Math.round(A[k][2]+(Bt[k][2]-A[k][2])*t);n++;}}
  // and the pale straw stalks the old stubble left (single straw-coloured pixels a step or more brighter than their neighbours
  // either side, one to three tall; the green tufts stay) go: the old field is meadow now, quiet between its drifts
  if(n){const Lm=o=>D[o]*3+D[o+1]*6+D[o+2];for(let py=0;py<W;py++)for(let px=1;px<W-1;px++){if(!IN[py*W+px])continue;const o=(py*W+px)*4,l=Lm(o);
      if(D[o]+4>=D[o+1]&&l>Lm(o-4)+150&&l>Lm(o+4)+150){D[o]=D[o-4];D[o+1]=D[o-3];D[o+2]=D[o-2];}}
    f39Despeck(D,W);g.putImageData(id,0,0);}}
// ---------------------------------------------------------------- Grandpa's yard: grass between worn lanes
// (the yard was one bare sheet of dirt from the cabin to the road; now the grass has taken it back, and what's left bare is the
// lanes people actually walk: to the door, to the well, and on to the barn's steps, and Route 9's own verge)
// every lane joins another or ends at something: the track down from the steps forks behind the well; the left fork goes round
// the well to the foot of the cabin's porch steps (with a spur to the well's front), the right one down past the noticeboard and
// along to the barn's steps; the barn's doors have their own apron
const F39_YARDLANES=[[6.8,-15.5,6.8,-12.1,1.3],[6.8,-12.1,5.2,-11.4,.95],[5.2,-11.4,4.5,-9.4,1.05],[4.5,-9.4,1.2,-8.95,1.1],[1.2,-8.95,-1.2,-7.9,1.2],[-1.2,-7.9,-2.6,-7.3,1.2],
  [2,-9,6,-9,1.2],[6.8,-12.1,9.2,-11.7,.95],[9.2,-11.7,9.7,-8.6,1.05],[9.7,-8.6,14.4,-7.6,1.1],
  [14.4,-7.6,17.3,-7.6,1.1],[17.3,-7.6,18.8,-8.1,1.1],[16,-9.4,16,-7.2,2.2],[18.8,-8.1,18.8,-7.2,1.2]];
const F39_YARDTRK=[[-6,-6,23,-6,3]].concat(F39_YARDLANES);
{const Dt=LAYERS.dirt;LAYERS.dirt=(x,z)=>{if(x>-6&&x<21.5&&z>-13.5&&z<-7.4){for(const q of F39_YARDLANES)if(segDist(x,z,q[0],q[1],q[2],q[3])<q[4]/2)return true;return false;}return Dt(x,z);};}
// ---------------------------------------------------------------- the stakes and FOR SALE boards: on the plots that are for sale
landMarkers=function(){for(const P of LAND_PARCELS){const sale=!landOwns(P.id)&&!P.retired;
    if(sale&&!LAND.signs[P.id]){const s=obj('signpost',P.sign[0],P.sign[1],{kind:'prop',label:'FOR SALE',face:'P',landSign:P.id,noCol:true});try{s.spr=signSprite('FOR SALE','plain');}catch(e){}LAND.signs[P.id]=s;s.f39col={x:s.x,z:s.z,r:.18};circles.push(s.f39col);}
    if(!sale&&LAND.signs[P.id]){const sg=LAND.signs[P.id];sg.hide=true;if(sg.f39col){const k=circles.indexOf(sg.f39col);if(k>=0)circles.splice(k,1);}delete LAND.signs[P.id];}
    const want=sale||(P.f39&&!P.retired);   // a West Field keeps its corner stakes once it's yours
    if(want&&!LAND.stakes[P.id]){const J=(k)=>P.f39||P.low?[(l35Hash(P.id,k)-.5)*.3,(l35Hash(P.id,k+7)-.5)*.22]:[0,0];const bc=-1;   /* (every corner keeps its stake; the board stands just in from the front one) */
      LAND.stakes[P.id]=[[P.x0,P.z0,2],[P.x0+P.w,P.z0,0],[P.x0,P.z0+P.h,3],[P.x0+P.w,P.z0+P.h,1]].filter(q=>q[2]!==bc||!sale).map(([x,z],k)=>{const j=J(k);
        return obj(SPR.land_stake?'land_stake':'rock_0',x+j[0],z+.05+j[1],{kind:'prop',noCol:true,landStake:P.id,flip:(P.f39||P.low)&&l35Hash(P.id,k+3)<.5});});}
    else if(want&&sale!==!!LAND.stakes[P.id].sale&&P.f39){for(const o of LAND.stakes[P.id])o.hide=true;delete LAND.stakes[P.id];landMarkers();return;}
    if(!want&&LAND.stakes[P.id]){for(const o of LAND.stakes[P.id])o.hide=true;delete LAND.stakes[P.id];}
    if(LAND.stakes[P.id])LAND.stakes[P.id].sale=sale;}};
// ---------------------------------------------------------------- the stones and weeds on new land come in clumps: a stony patch
// here, a weedy corner there, the odd stick between them, each one sitting anywhere on its square, never in rows
{const _lb=landBuild;landBuild=function(P,k){const had=!!LAND.built[P.id];const B=_lb.apply(this,arguments);if(had||!P||!P.f39||!B)return B;try{f39Debris(B,k);}catch(e){console.warn('debris',e);}return B;};}
// the weeds on a West Field are the kit's own: a dry clump of long grass or a dead bramble, each its own shape and colour
function f39WeedLook(o,spr,h2,c,r,k){if(!/^weeds/.test(spr)||typeof F39_KIT==='undefined')return;const q=hash(c*11+k*5+3,r*7+k+1),pick=[['g',4,'straw'],['g',5,'mix'],['g',6,'rust'],['b',3,'dry'],['g',3,'olive'],['g',7,'straw'],['b',3,'russet'],['g',5,'rust']][(q*8)|0];
  try{o.spr=f39KitSpr(pick[0],pick[1],pick[2]);o.flip=false;}catch(e){}}
function f39Debris(B,k){const P=B.P,old=new Map();for(const o of B.debris)old.set(o,1);const keep=[];
  for(const t of B.tiles){const wx=t.x,wz=t.z,c=t.pc,r=t.pr;
    const n=fbm(wx*.27+k*3.1+11,wz*.27+k*1.7+5),h=hash(c*31+k*977+11,r*17+k*131+9),h2=hash(c*13+k*7+3,r*29+k*5+1);
    const on=n>.62?h<.62:n>.54?h<.26:h<.04;const o=t.debris;
    if(!on){if(o){o.hide=true;o.debris=null;o.landDeb=0;if(o.col){const q=circles.indexOf(o.col);if(q>=0)circles.splice(q,1);}t.debris=null;}continue;}
    const m=fbm(wx*.16+40+k,wz*.16+k*2);const spr=h2<.12?'twig':m>.52?(h2<.6?'rock_0':'rock_1'):(h2<.55?'weeds_0':'weeds_1');
    const x=wx+(hash(c+5,r*3+k)-.5)*.62,z=wz+.18+(hash(c*3+k,r+7)-.5)*.5;
    if(o&&o.debris===spr.split('_')[0]){const it=interact.find(q=>q&&q.x===o.x&&q.z===o.z&&q.r===.75);if(it){it.x=x;it.z=z;}o.spr=spr;o.x=x;o.z=z;o.flip=h2>.5;f39WeedLook(o,spr,h2,c,r,k);if(o.col){o.col.x=x;o.col.z=z-.1;}keep.push(o);continue;}
    if(o){o.hide=true;o.debris=null;o.landDeb=0;if(o.col){const q=circles.indexOf(o.col);if(q>=0)circles.splice(q,1);}t.debris=null;}
    const d=makeDebris(spr,x,z,t);d.landDeb=1;d.flip=h2>.5;f39WeedLook(d,spr,h2,c,r,k);keep.push(d);}
  B.debris=keep;}
// ---------------------------------------------------------------- fallen leaves out here come down rust-brown, never red (red on
// grass reads as blood), the same as in the Low Fields
{const _lu=leavesUpdate;leavesUpdate=function(dt){_lu.apply(this,arguments);for(const L of LEAVES){if(L.f39)continue;if(!((L.x>-162&&L.x<-30&&L.z>-46&&L.z<132)||(L.x>-18&&L.x<22&&L.z>-46&&L.z<-20)))continue;L.f39=1;if(L.col&&/^#c8402a|^#c8642a/i.test(L.col[0]))L.col=['#a8682e','#6a3e1c'];}};}
// ---------------------------------------------------------------- Tobias's glowcaps grow in the woods, never in a field
{const _sm=spawnMushrooms;spawnMushrooms=function(){const r=_sm.apply(this,arguments);try{for(const m of mushrooms){if(!f39InAny(m.x,m.z,.8)&&!f39OnTrack(m.x,m.z,1))continue;
    let k=0,x,z;do{x=lerp(-46,-17,rand());z=lerp(6,40,rand());k++;}while(k<80&&(f39InAny(x,z,.8)||f39OnTrack(x,z,1)||!clearSpot(x,z,.5)||Math.hypot(x-pond.x,z-pond.z)<pond.r+2||Math.hypot(x+27,z-8)<2.2));m.x=x;m.z=z;}}catch(e){}return r;};}
// ---------------------------------------------------------------- old saves: land that moved takes what stood on it along
// (squares are saved by where they sit in their plot, so they come by themselves; the list of squares the old ground blocked
// is worked out again on the new ground; machines and work benches set down on an old plot move with it)
function f39Shift(x,z){for(const P of f39Plots()){const o=F39.old[P.id];if(!o)continue;if(x>o.x0-6&&x<o.x0+P.w+6&&z>o.z0-6&&z<o.z0+P.h+6)return [P.x0-o.x0,P.z0-o.z0];}return null;}
function f39Migrate(d){const s=d&&d.S;if(!s||s.f339)return 0;let n=0;
  try{const own=s.land&&s.land.own;if(own)for(const P of f39Plots())if(own[P.id]&&own[P.id].skip){delete own[P.id].skip;n++;}}catch(e){}
  try{const mc=s.emp&&s.emp.mc;if(mc)for(const k of Object.keys(mc)){const m=mc[k];if(!m||m.x==null)continue;const sh=f39Shift(m.x,m.z);if(sh){m.x+=sh[0];m.z+=sh[1];n++;}}}catch(e){}
  try{const bp=s.benchPos;if(bp)for(const k of Object.keys(bp)){const b=bp[k];if(!b||b.x==null)continue;const sh=f39Shift(b.x,b.z);if(sh){b.x+=sh[0];b.z+=sh[1];n++;}}}catch(e){}
  try{const T=s.emp&&s.emp.tractor;if(T&&T.x!=null){const sh=f39Shift(T.x,T.z);if(sh){T.x+=sh[0];T.z+=sh[1];n++;}}}catch(e){}
  s.f339=1;F39.migrated=n;return n;}
{const _lg=loadGame;loadGame=function(d){try{f39Migrate(d);}catch(e){console.warn('west fields migrate',e);}return _lg.apply(this,arguments);};}
{const _sd=saveData;saveData=function(){const d=_sd.apply(this,arguments);try{if(d&&d.S)d.S.f339=1;}catch(e){}return d;};}
S.f339=1;
// ---------------------------------------------------------------- the farm book: one map of the whole farm
function f39Map(){const X0=-160,X1=40,Z0=-44,Z1=130,E=EMP(),esc=s=>String(s).replace(/[<&>]/g,'');
  let g=`<svg class="emmap f39map" viewBox="${X0} ${Z0} ${X1-X0} ${Z1-Z0}" preserveAspectRatio="xMidYMid meet"><defs><pattern id="f39h" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="3" fill="#d8c49a"/><rect width="1.1" height="3" fill="#a8885a"/></pattern></defs>`;
  g+=`<rect x="${X0}" y="${Z0}" width="${X1-X0}" height="${Z1-Z0}" fill="#b8a46e"/>`;
  // the woods round the fields, as knots of crowns
  for(let i=0;i<150;i++){const x=X0+hash(i,3)*(X1-X0),z=Z0+hash(i,7)*(Z1-Z0);if(f39InAny(x,z,2.5)||f39OnTrack(x,z,2)||(x>-36&&z<46)||Math.hypot(x-pond.x,z-pond.z)<pond.r+2)continue;g+=`<circle cx="${x.toFixed(1)}" cy="${z.toFixed(1)}" r="${(1.6+hash(i,9)*1.4).toFixed(1)}" fill="${hash(i,5)<.3?'#8a6a2a':'#6a6e3a'}" opacity=".55"/>`;}
  {const R=[[20,104],[-30,112],[-90,118],[-140,134],[-178,150]];g+=`<polyline points="${R.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#5f7f8c" stroke-width="3"/>`;
    g+=`<polyline points="${CREEK.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#5f7f8c" stroke-width="1.6"/><circle cx="${pond.x}" cy="${pond.z}" r="${pond.r}" fill="#5f7f8c"/>`;}
  const road=(pts,w)=>{for(const pass of [0,1])g+=`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${pass?'#e8d8b0':'#6a4a2a'}" stroke-width="${pass?w:w+1}" stroke-linecap="round" stroke-linejoin="round"/>`;};
  road([[X0,-6],[X1,-6]],3.4);road([[20,-6],[20,Z1]],2.4);road([[20,46],[-153.2,46]],2.2);road([[-20,88],[20,88]],1.4);
  for(const q of F39.tracks)if(q[4]<2)road([[q[0],q[1]],[q[2],q[3]]],1.4);
  road([[-153.2,125],[-153.2,Z1+2]],1.4);   // (the west lane carries on south over the river, off the page)
  road([[F39.lane.x,-9],[F39.lane.x,F39.lane.z1]],1.2);road([[F39.lane.px0,F39.lane.z1],[F39.lane.px1,F39.lane.z1]],1.1);
  // the plots: hatched for sale with the price, green yours, amber owed to the bank; each name inside its own plot
  for(const P of f39Plots()){const mine=landOwns(P.id),owe=E.loans.some(L=>L.p===P.id);
    g+=`<a href="#emrow_${P.id}" data-emjump="${P.id}"><rect x="${P.x0}" y="${P.z0}" width="${P.w}" height="${P.h}" fill="${owe?'#d8a050':mine?'#5a8a3c':'url(#f39h)'}" stroke="${mine?'#2a4a1a':'#6a4a2a'}" stroke-width=".6"/></a>`;
    const n=P.name.replace(/^The /,''),nm=n.charAt(0).toUpperCase()+n.slice(1),words=nm.split(' ');let lines=[nm];const CW=2.5;
    if(nm.length*CW+3>P.w&&words.length>1){let best=null;for(let k=1;k<words.length;k++){const a=words.slice(0,k).join(' '),b=words.slice(k).join(' ');const m=Math.max(a.length,b.length);if(!best||m<best.m)best={m,l:[a,b]};}lines=best.l;}
    const st=owe?'Owed':mine?'Yours':(typeof free6==='function'&&free6()?'Free':P.price.toLocaleString('en-US'));
    const longest=Math.max(...lines.map(s=>s.length),st.length);let fs=3.3;if(longest*CW+3>P.w)fs=3.3*(P.w-3)/(longest*CW);if(lines.length===2&&P.h<12)fs=Math.min(fs,2.9);
    const lh=fs*1.15,bw=longest*CW*fs/3.3+2.2,bh=(lines.length+1)*lh+1.4,cx=P.x0+P.w/2,cy=P.z0+P.h/2;
    g+=`<rect x="${cx-bw/2}" y="${cy-bh/2}" width="${bw}" height="${bh}" fill="#f4e6c8" stroke="#6a4a2a" stroke-width=".3" opacity=".94" pointer-events="none"/>`;
    lines.forEach((s,i)=>{g+=`<text x="${cx}" y="${cy-bh/2+.9+lh*(i+.78)}" class="t2" style="font-size:${fs.toFixed(2)}px">${esc(s)}</text>`;});
    g+=`<text x="${cx}" y="${cy-bh/2+.9+lh*(lines.length+.78)}" class="t2" style="font-size:${(fs*.92).toFixed(2)}px;fill:${mine?'#2a5a1a':owe?'#7a4a10':'#7a2a14'}">${esc(st)}</text>`;}
  // Grandpa's place, the anchor: the cabin, the barn and the home field, with its name on a paper tag
  const house=(x,z,w,h,col)=>`<rect x="${x-w/2}" y="${z-h}" width="${w}" height="${h}" fill="${col}" stroke="#2a1608" stroke-width=".4"/><polygon points="${x-w/2-.8},${z-h} ${x},${z-h-w*.38} ${x+w/2+.8},${z-h}" fill="#3a2414" stroke="#2a1608" stroke-width=".3"/>`;
  {const own=tiles.filter(t=>!t.parcel&&!t.gh);let fx0=-5,fx1=5,fz0=0,fz1=8;if(own.length){fx0=Math.min(...own.map(t=>t.x))-.5;fx1=Math.max(...own.map(t=>t.x))+.5;fz0=Math.min(...own.map(t=>t.z))-.5;fz1=Math.max(...own.map(t=>t.z))+.5;}
    g+=`<rect x="${fx0}" y="${fz0}" width="${fx1-fx0}" height="${fz1-fz0}" fill="#5a8a3c" stroke="#2a4a1a" stroke-width=".5"/>`;}
  g+=house(0,-8.6,8,5,'#5a3418')+house(15,-8.6,10,6,'#7a2a1a');
  for(let i=0;i<F39_CABINS.length;i++){const s=F39_CABINS[i];const on=landActiveHomes().length>i;g+=on?house(s.x,s.z,6,3.4,'#6a4a2a'):`<rect x="${s.x-3}" y="${s.z-3}" width="6" height="3" fill="none" stroke="#6a4a2a" stroke-width=".35" stroke-dasharray="1 1"/>`;}
  const tag=(x,z,t,fs)=>{const w=t.length*2.5*fs/3.3+2.6,h=fs*1.5;g+=`<rect x="${x-w/2}" y="${z-h/2}" width="${w}" height="${h}" fill="#f4e6c8" stroke="#3a2414" stroke-width=".4"/><text x="${x}" y="${z+fs*.36}" class="t2" style="font-size:${fs}px">${t}</text>`;};
  tag(5,-19.5,'GRANDPA’S',3.6);
  const lab=(x,z,t,a)=>{g+=`<text x="${x}" y="${z}" class="t2" style="text-anchor:${a||'middle'};font-size:3px">${t}</text>`;};
  // the Tithe House at the end of its lane, and the field gate where the lane between the north pieces goes into the wood
  g+=house(-26,86.6,7,4,'#5a4636');
  g+=`<polyline points="-121.8,-38.2 -91.7,-38.2" fill="none" stroke="#3e5a26" stroke-width="1.3" stroke-linecap="round"/><polyline points="-88.9,-38.2 -62.6,-38.2" fill="none" stroke="#3e5a26" stroke-width="1.3" stroke-linecap="round"/>`;
  g+=F39_GATE(-90.3,-38.5,1.6)+F39_GATE(-153.2,126.7,1.6);
  lab(-30,-8.6,'ROUTE 9');lab(22,30,'MILL RD','start');lab(1.5,-39,'HOMESTEAD LANE');lab(26,-12,'TOWN →','start');lab(-26,92.6,'TITHE HOUSE');lab(-24,44.4,'FARM ROAD');
  return g+'</svg>';}
{const css=document.createElement('style');css.textContent=`#noteText .f39map{max-height:400px;display:block;margin:0 auto}#noteText .f39map .t2{font:3.3px 'Hollow Pixel',monospace;fill:#3a2414;text-anchor:middle;pointer-events:none}`;document.head.appendChild(css);}
// the key: what the dashed boxes behind Grandpa's are
// a field gate in a hedge, drawn the same on the page and in its key
const F39_GATE=(x,z,k)=>`<g transform="translate(${x} ${z}) scale(${k})"><rect x="-1.9" y="-1.1" width=".55" height="2.2" fill="#3a2414"/><rect x="1.35" y="-1.1" width=".55" height="2.2" fill="#3a2414"/><path d="M-1.35,-.75H1.35M-1.35,0H1.35M-1.35,.7H1.35" fill="none" stroke="#c8a060" stroke-width=".42"/><line x1="-1.35" y1=".7" x2="1.35" y2="-.75" stroke="#c8a060" stroke-width=".38"/></g>`;
const F39_KEYMORE=`<span class="l35k"><svg viewBox="0 0 10 7" width="18" height="12"><rect x="2.2" y="3" width="5.6" height="3.4" fill="#5a4636" stroke="#2a1608" stroke-width=".4"/><polygon points="1.4,3 5,.6 8.6,3" fill="#3a2414"/></svg>A house or barn</span><span class="l35k"><svg viewBox="-5 -3.5 10 7" width="18" height="12"><line x1="-5" y1="0" x2="5" y2="0" stroke="#3e5a26" stroke-width="1.3"/>${F39_GATE(0,0,1.25)}</svg>Hedge and field gate</span>`;
const F39_KEYCAB=`<span class="l35k"><svg viewBox="0 0 10 7" width="18" height="12"><rect x="1" y="1" width="8" height="5" fill="none" stroke="#6a4a2a" stroke-width=".7" stroke-dasharray="1.2 .9"/></svg>A friend’s cabin, once they move in</span>`;
empMap=function(){const k=typeof l35Key==='function'?l35Key():'';return f39Map()+(k.includes('<svg width="0"')?k.replace('<svg width="0"',F39_KEYCAB+F39_KEYMORE+'<svg width="0"'):k);};
{const _eo=empOpen;empOpen=function(tab){const r=_eo.apply(this,arguments);
  try{if((tab||'land')==='land'){const N=$('noteText');const first=f39Plots().find(P=>N&&N.querySelector('#emrow_'+P.id));const row=first&&N.querySelector('#emrow_'+first.id);
    if(row&&!N.querySelector('.f39h')){const h=document.createElement('h4');h.className='f39h';h.textContent='The West Fields (west of the farm, off Route 9)';row.parentNode.insertBefore(h,row);
      const p=h.previousElementSibling;if(p&&p.tagName==='H4'&&/^The land$/i.test(p.textContent.trim()))p.remove();}}}catch(e){}return r;};}
// ---------------------------------------------------------------- the world map: the fields over the ground
REGIONS.push(['THE WEST FIELDS',-100,64]);
{const _mp=mapPaint;mapPaint=function(){const H=[],hedge=[];
  // the Low Fields' hedge bushes and lanes are drawn by hand below (irregular hedge strokes, lanes that bend), not as dashes on
  // a grid; hidden things never show
  for(const o of OBJ){if(o.room)continue;if(o.hide||o.f39low){o.room='_f39';H.push(o);continue;}if(o.kind==='bush'&&o.z>292&&!o.f39hg){hedge.push(o);o.room='_f39';H.push(o);}}
  const keep=ROADS.slice(),low=[];if(F39.trackRefs){const R=new Set(F39.trackRefs.concat(F39.farmRoad?[F39.farmRoad]:[]));for(let i=ROADS.length-1;i>=0;i--)if(R.has(ROADS[i]))ROADS.splice(i,1);}
  for(let i=ROADS.length-1;i>=0;i--){const q=ROADS[i];if(Math.max(q[1],q[3])>292){low.push(q);ROADS.splice(i,1);}}
  const lines=typeof L35!=='undefined'&&L35.lines?L35.lines.slice():null;if(lines)L35.lines.length=0;   // (the Low Fields' lanes: drawn below, bending more)
  let c;try{c=_mp.apply(this,arguments);}finally{for(const o of H)delete o.room;ROADS.length=0;for(const q of keep)ROADS.push(q);if(lines){L35.lines.length=0;for(const L of lines)L35.lines.push(L);}}
  try{if(F39.built){f39MapPaint(c);f39LowMap(c,low.filter(q=>!(L35.roadRefs&&L35.roadRefs.includes(q))),hedge,lines||[]);f39MapDespeck(c,-165,-46,32,180);}}catch(e){console.warn('west fields map',e);}return c;};}
// the bend: the same smooth displacement the bottomland is drawn through (a few paces), and none at all where a track meets a
// road that stays ruled (so they still join); the farm road from Mill Road is taken out of the base pass and bent with them
const F39_JOIN=[[-45.5,-6],[20,46],[-90.3,-6],[-20,88],[-150.4,177.4]];
const f39Bend=(x,z)=>{let d=1e9;for(const [jx,jz] of F39_JOIN)d=Math.min(d,Math.hypot(x-jx,z-jz));const f=clamp((d-1.5)/11,0,1);
  return [((fbm(x*.022+3,z*.022+1)-.5)*16+(fbm(x*.08+8,z*.08)-.5)*3)*f,((fbm(x*.022+11,z*.022+5)-.5)*16+(fbm(x*.08,z*.08+6)-.5)*3)*f];};   // (the bottomland's own bend)
function f39MapPaint(c){const s=MAPX.s,pad=MAPX.pad,g=c.getContext('2d'),X=x=>pad+(x-B.x0)*s,Y=z=>pad+(z-B.z0)*s;g.save();
  const W=(x,z)=>{const b=f39Bend(x,z);return [X(x+b[0]),Y(z+b[1])];};
  // (a field's own outline and rows also waver a pace or so by hand, on top of the bend they share with the tracks)
  const WP=(x,z)=>{const b=f39Bend(x,z),f=clamp((Math.min(...F39_JOIN.map(([jx,jz])=>Math.hypot(x-jx,z-jz)))-1.5)/8,0,1);return [X(x+b[0]+(fbm(x*.16+2,z*.16+9)-.5)*3.2*f),Y(z+b[1]+(fbm(x*.16+7,z*.16+3)-.5)*3.2*f)];};
  const PLC=['#b49a56','#8c6e44','#a48c4e','#7c7a46','#9c7c48','#c0a464'];let pi=0;
  for(const P of f39Plots()){const col=PLC[(pi++)%PLC.length],across=l35Hash(P.id,1)>.5;
    g.beginPath();const pts=[];const sx2=Math.max(4,Math.round(P.w/3)),sz2=Math.max(3,Math.round(P.h/3));
    for(let i=0;i<=sx2;i++)pts.push([P.x0+P.w*i/sx2,P.z0]);for(let i=1;i<=sz2;i++)pts.push([P.x0+P.w,P.z0+P.h*i/sz2]);for(let i=sx2-1;i>=0;i--)pts.push([P.x0+P.w*i/sx2,P.z0+P.h]);for(let i=sz2-1;i>=1;i--)pts.push([P.x0,P.z0+P.h*i/sz2]);
    pts.forEach(([x,z],i)=>{const [xx,yy]=WP(x,z);i?g.lineTo(xx,yy):g.moveTo(xx,yy);});g.closePath();
    g.globalAlpha=.62;g.fillStyle=col;g.fill();g.globalAlpha=1;
    g.save();g.clip();g.strokeStyle='rgba(70,52,28,.34)';g.lineWidth=1;
    if(across)for(let x=P.x0+1.2;x<P.x0+P.w;x+=2.2){g.beginPath();for(let k=0;k<=5;k++){const [xx,yy]=WP(x,P.z0+P.h*k/5);k?g.lineTo(xx,yy):g.moveTo(xx,yy);}g.stroke();}
    else for(let z=P.z0+1.5;z<P.z0+P.h;z+=2.2){g.beginPath();for(let k=0;k<=6;k++){const [xx,yy]=WP(P.x0+P.w*k/6,z);k?g.lineTo(xx,yy):g.moveTo(xx,yy);}g.stroke();}g.restore();
    g.strokeStyle='rgba(60,40,20,.55)';g.lineWidth=1;g.beginPath();pts.forEach(([x,z],i)=>{const [xx,yy]=WP(x,z);i?g.lineTo(xx,yy):g.moveTo(xx,yy);});g.closePath();g.stroke();}
  // the hedge along the back of the two north pieces, and the field gate where their lane goes through it
  {for(const [xa,xb] of [[-121.8,-91.7],[-88.9,-62.6]]){g.lineCap='round';for(const pass of [0,1]){g.beginPath();for(let x=xa;x<=xb+.01;x+=1.5){const [xx,yy]=W(x,-38.2);x===xa?g.moveTo(xx,yy):g.lineTo(xx,yy);}g.strokeStyle=pass?'#556a2c':'#2c3418';g.lineWidth=pass?s*.9:s*.9+2;g.stroke();}}
    const [gx,gy]=W(-90.3,-38.4);g.fillStyle='#3a2414';g.fillRect(Math.round(gx)-4,Math.round(gy)-3,1,5);g.fillRect(Math.round(gx)+3,Math.round(gy)-3,1,5);g.fillStyle='#c8a060';g.fillRect(Math.round(gx)-3,Math.round(gy)-2,6,1);g.fillRect(Math.round(gx)-3,Math.round(gy),6,1);}
  // the tracks, in short steps that follow the bend; the same ink as every other road
  for(const pass of [0,1])for(const q of F39.tracks.concat(F39.farmRoad?[F39.farmRoad]:[])){g.lineCap='round';g.lineJoin='round';g.beginPath();const n=Math.max(1,Math.round(Math.hypot(q[2]-q[0],q[3]-q[1])/2));
    for(let k=0;k<=n;k++){const x=q[0]+(q[2]-q[0])*k/n,z=q[1]+(q[3]-q[1])*k/n,[xx,yy]=W(x,z);k?g.lineTo(xx,yy):g.moveTo(xx,yy);}
    g.strokeStyle=pass?'#e8d4a4':'#5a3a20';g.lineWidth=pass?q[4]*s*.9:q[4]*s*.9+3;g.stroke();}
  g.restore();}
// the Low Fields on the valley map: countryside now, so its lanes are drawn bending like the farm tracks (they leave the straight
// road south untouched where they meet it), and its hedgerows as irregular strokes of hedge with autumn colour in them, broken
// where the hedge is broken, instead of rows of dashes on the old plot grid; the maze's lane ends at a gate
function f39LowMap(c,low,hedge,lines){const s=MAPX.s,pad=MAPX.pad,g=c.getContext('2d'),X=x=>pad+(x-B.x0)*s,Y=z=>pad+(z-B.z0)*s;g.save();
  // the Low Fields' lanes, bending like a surveyor's sketch (one bend field for all of them, so where they cross they still meet)
  const DX=(x,z)=>(fbm(x*.022+3,z*.022+1)-.5)*34+(fbm(x*.07+8,z*.07)-.5)*9,DZ=(x,z)=>(fbm(x*.022+11,z*.022+5)-.5)*34+(fbm(x*.07,z*.07+6)-.5)*9;
  const BD=(x,z)=>{const f=z<L35.Z0?clamp((z-L35.Z0+30)/30,0,1):1;return [X(x+DX(x,z)*f),Y(z+DZ(x,z)*f)];};
  {
    for(const pass of [0,1])for(const L of lines){g.lineCap='round';g.lineJoin='round';g.beginPath();let first=true;
      for(let i=0;i<L.p.length-1;i++){const [ax,az]=L.p[i],[bx,bz]=L.p[i+1],n=Math.max(1,Math.round(Math.hypot(bx-ax,bz-az)/2));
        for(let k=i?1:0;k<=n;k++){const x=ax+(bx-ax)*k/n,z=az+(bz-az)*k/n,f=z<L35.Z0?clamp((z-L35.Z0+30)/30,0,1):1,xx=X(x+DX(x,z)*f),yy=Y(z+DZ(x,z)*f);first?g.moveTo(xx,yy):g.lineTo(xx,yy);first=false;}}
      g.strokeStyle=pass?'#e8d4a4':'#5a3a20';g.lineWidth=pass?L.w*s*.9:L.w*s*.9+3;g.stroke();}}
  const LB=(x,z)=>{const f=clamp((z-292)/16,0,1)*clamp(Math.abs(x-19.6)/10,0,1);return [((fbm(x*.03+5,z*.03+2)-.5)*9+(fbm(x*.1,z*.1+4)-.5)*3)*f,((fbm(x*.03+13,z*.03+7)-.5)*9+(fbm(x*.1+6,z*.1)-.5)*3)*f];};
  const W=(x,z)=>{const b=LB(x,z);return [X(x+b[0]),Y(z+b[1])];};
  for(const pass of [0,1])for(const q of low){g.lineCap='round';g.lineJoin='round';g.beginPath();const n=Math.max(1,Math.round(Math.hypot(q[2]-q[0],q[3]-q[1])/2));
    for(let k=0;k<=n;k++){const x=q[0]+(q[2]-q[0])*k/n,z=q[1]+(q[3]-q[1])*k/n,[xx,yy]=W(x,z);k?g.lineTo(xx,yy):g.moveTo(xx,yy);}
    g.strokeStyle=pass?'#e8d4a4':'#5a3a20';g.lineWidth=pass?q[4]*s*.9:q[4]*s*.9+3;g.stroke();}
  // hedges: chain each bush to its neighbours, then draw each chain as one uneven stroke
  const N=hedge.length,par=new Int32Array(N).map((_,i)=>i),fd=i=>{while(par[i]!==i)i=par[i]=par[par[i]];return i;};
  const cell=new Map();hedge.forEach((o,i)=>{const k=Math.floor(o.x/2)+','+Math.floor(o.z/2);(cell.get(k)||cell.set(k,[]).get(k)).push(i);});
  hedge.forEach((o,i)=>{const cx=Math.floor(o.x/2),cz=Math.floor(o.z/2);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const j of cell.get((cx+dx)+','+(cz+dz))||[])if(j>i&&Math.hypot(o.x-hedge[j].x,o.z-hedge[j].z)<1.8)par[fd(i)]=fd(j);});
  const grp=new Map();hedge.forEach((o,i)=>{const r=fd(i);(grp.get(r)||grp.set(r,[]).get(r)).push(o);});
  for(const L of grp.values()){if(L.length<3){for(const o of L){const [px,py]=BD(o.x,o.z);g.fillStyle='#4a5a2a';g.beginPath();g.arc(px+.5,py+.5,s*.5,0,6.29);g.fill();}continue;}
    // the run's own direction, and its bushes in order along it
    let mx=0,mz=0;for(const o of L){mx+=o.x;mz+=o.z;}mx/=L.length;mz/=L.length;let sxx=0,szz=0,sxz=0;for(const o of L){sxx+=(o.x-mx)**2;szz+=(o.z-mz)**2;sxz+=(o.x-mx)*(o.z-mz);}
    const an=.5*Math.atan2(2*sxz,sxx-szz),ux=Math.cos(an),uz=Math.sin(an);L.sort((a,b)=>((a.x-mx)*ux+(a.z-mz)*uz)-((b.x-mx)*ux+(b.z-mz)*uz));
    {const C=[];for(let i=0;i<L.length;i++){const o=L[i];C.push([o.x,o.z,.5+.35*hash((o.x*13)|0,(o.z*11)|0)]);const n=L[i+1];if(n&&Math.hypot(o.x-n.x,o.z-n.z)<2.6&&Math.hypot(o.x-n.x,o.z-n.z)>1.1)C.push([(o.x+n.x)/2,(o.z+n.z)/2,.42+.3*hash((n.x*7)|0,(o.z*9)|0)]);}
      const P2=C.map(([x,z,r])=>{const [px,py]=BD(x,z);return [px,py,Math.max(1.6,r*s)];}).sort((a,b)=>a[1]-b[1]);
      for(const [px,py,r] of P2){g.fillStyle='#2c3418';g.beginPath();g.arc(px+.4,py+.5,r+1,0,6.29);g.fill();}
      for(const [px,py,r] of P2){g.fillStyle='#4f622a';g.beginPath();g.arc(px,py,r,0,6.29);g.fill();g.fillStyle='#6f8238';g.beginPath();g.arc(px-r*.35,py-r*.35,Math.max(.8,r*.45),0,6.29);g.fill();}}
    for(const o of L)if(hash((o.x*7)|0,(o.z*7)|0)<.28){const [px,py]=BD(o.x,o.z);g.fillStyle=hash((o.x*3)|0,(o.z*5)|0)<.5?'#b4542a':'#c8a040';g.fillRect(Math.round(px),Math.round(py)-1,1,1);}}
  // the maze lane's end: a gate in the maze's hedge
  {const gx=X(7.6),gz=Y(197);g.fillStyle='#3a2414';g.fillRect(Math.round(gx)-3,Math.round(gz)-4,1,5);g.fillRect(Math.round(gx)+2,Math.round(gz)-4,1,5);g.fillRect(Math.round(gx)-3,Math.round(gz)-4,6,1);g.fillStyle='#c8a060';g.fillRect(Math.round(gx)-2,Math.round(gz)-3,4,1);}
  g.restore();}
// the valley map's own meadow has pale flecks sprinkled over it; over the farm they're taken out (small pale specks only:
// anything bigger than a few pixels, a road or a tree, keeps its colour)
function f39MapDespeck(c,wx0,wz0,wx1,wz1){const s=MAPX.s,pad=MAPX.pad,X=x=>Math.round(pad+(x-B.x0)*s),Y=z=>Math.round(pad+(z-B.z0)*s);
  const x0=Math.max(2,X(wx0)),y0=Math.max(2,Y(wz0)),x1=Math.min(c.width-3,X(wx1)),y1=Math.min(c.height-3,Y(wz1));if(x1<=x0||y1<=y0)return;
  const g=c.getContext('2d'),w=x1-x0+4,h=y1-y0+4,id=g.getImageData(x0-2,y0-2,w,h),D=id.data,O=new Uint8ClampedArray(D),L=k=>O[k]*3+O[k+1]*6+O[k+2];
  const mark=new Uint8Array(w*h);
  for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){const k=(y*w+x)*4;let bg=0,n=0;for(let d=-2;d<=2;d++){bg+=L(((y-2)*w+x+d)*4)+L(((y+2)*w+x+d)*4);n+=2;}for(let d=-1;d<=1;d++){bg+=L((((y+d)*w)+x-2)*4)+L((((y+d)*w)+x+2)*4);n+=2;}
    if(L(k)>bg/n+90&&O[k+1]>=O[k+2])mark[y*w+x]=1;}
  const seen=new Uint8Array(w*h),st=[];
  for(let i=0;i<w*h;i++){if(!mark[i]||seen[i])continue;const comp=[];st.push(i);seen[i]=1;while(st.length&&comp.length<9){const j=st.pop();comp.push(j);const x=j%w,y=(j/w)|0;
      for(const q of [j-1,j+1,j-w,j+w])if(q>=0&&q<w*h&&mark[q]&&!seen[q]){seen[q]=1;st.push(q);}}
    if(comp.length>6||st.length){st.length=0;continue;}
    for(const j of comp){const x=j%w,y=(j/w)|0,q=((y)*w+Math.max(0,x-2))*4,k=j*4;D[k]=O[q];D[k+1]=O[q+1];D[k+2]=O[q+2];}}
  g.putImageData(id,x0-2,y0-2);}
// ---------------------------------------------------------------- the town hall's plat: the West Fields ruled in, the farm beside them
if(typeof hallPlat==='function'){const _hp=hallPlat;hallPlat=function(){const own=Object.keys((S.land&&S.land.own)||{}).sort().join(',');const key='hall_plat';if(HALL_SPR[key]&&hallPlat.sig===own)return;hallPlat.sig=own;
  hallSprite(key,60,66,30,63,(P,g,w,H)=>{const h=44;for(const lx of [8,50]){P(lx,40,3,26,'#120c08');P(lx+1,40,1,25,HW[3]);}P(28,40,4,24,'#120c08');P(29,40,2,23,HW[2]);P(6,60,48,2,'#120c08');P(7,60,46,1,HW[3]);P(4,63,52,3,'rgba(0,0,0,.35)');
    hallFrame(P,w,h);P(4,4,w-8,h-8,'#e4d6b4');P(4,4,w-8,1,'#f2e8cc');P(4,h-5,w-8,1,'#c8b890');P(4,4,w-8,9,'#ece0c0');P(4,13,w-8,1,'#8a7a5a');
    // x -155..25 and z -38..112 into the sheet below the title band
    const X=x=>Math.round(6+(x+155)*.27),Z=z=>Math.round(15+(z+38)*.16);
    P(5,Z(-6),w-10,1,'#3a2a1a');P(5,Z(-6)+1,w-10,1,'#c8b48a');                                  // Route 9
    for(let x=X(-153);x<=X(20);x++)P(x,Z(46),1,1,'#8a7050');                                       // the farm road
    for(let x=5;x<w-5;x++){const y=Math.min(h-7,Z(112)-Math.round((x-5)*.06))+Math.round(Math.sin(x*.32)*.6);P(x,y,1,1,'#3a78a8');}   // the river
    P(X(-5),Z(0),Math.max(1,X(5)-X(-5)),Math.max(1,Z(8)-Z(0)),'#8a6a40');                            // the home field
    f39Plots().forEach((p,i)=>{const mine=!!(S.land&&S.land.own&&S.land.own[p.id]);const a=X(p.x0),b=Z(p.z0),c=Math.max(a+1,X(p.x0+p.w)),d=Math.max(b+1,Z(p.z0+p.h));
      P(a,b,c-a+1,d-b+1,mine?'#e0b8a0':['#d4c08c','#b8c49a','#cdb888','#a8b88e','#c4c896'][i%5]);
      for(let x=a;x<=c;x++){P(x,b,1,1,mine?'#8a2416':'#3a2a1a');P(x,d,1,1,mine?'#8a2416':'#3a2a1a');}for(let y=b;y<=d;y++){P(a,y,1,1,mine?'#8a2416':'#3a2a1a');P(c,y,1,1,mine?'#8a2416':'#3a2a1a');}});
    const cx=w-10,cy=8;P(cx,cy-4,1,9,'#3a2a1a');P(cx-4,cy,9,1,'#3a2a1a');P(cx-1,cy-2,3,5,'#3a2a1a');P(cx-2,cy-1,5,3,'#3a2a1a');P(cx,cy-4,1,4,'#8a2416');HT(P,'N',cx-8,cy-2,'#3a2a1a');
    HT(P,'MARSH',7,6,'#3a2a1a');});};}

// ---------------------------------------------------------------- dug soil: clods, not speckle
// a clod field on a jittered grid in world pixels: each clod lit on its upper left and shaded on its lower right, with a dark
// crack between clods; its own tint, a little greyer or warmer than the next
// dug soil drawn as lumps of their own sizes lying on loose earth, not a net of cells: on a jittered grid, most cells hold a clod
// (from a crumb to a fist), lit on its upper left, dark round its lower right, with its own little shadow on the earth below
// right; between them the earth is plain, a shade lighter or darker in broad patches
function f39Clod(wx,wy,S){const C=5,gx=Math.floor(wx/C),gy=Math.floor(wy/C);let best=null,bd=1e9,sh=false;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const cx=gx+i,cy=gy+j,h0=hash(cx*7+3,cy*13+1);if(h0<.3)continue;const r=1.1+hash(cx*17+5,cy*19+3)*hash(cx*3+9,cy*7+2)*3.6;
    const px=cx*C+C*(.15+.7*hash(cx*5+11,cy*3+7)),py=cy*C+C*(.15+.7*hash(cx*11+2,cy*5+9)),e=Math.hypot(wx-px,(wy-py)*1.15);
    if(e<r&&e/r<bd){bd=e/r;best=[px,py,r,h0];}else if(Math.hypot(wx-px-1.2,(wy-py-1.1)*1.15)<r)sh=true;}
  if(best){const [px,py,r,h0]=best,ox=(wx-px)/r,oy=(wy-py)/r,l=-(ox+oy);return [bd>.72&&ox+oy>.2?1:l>.38?3:l<-.5?1:2,h0];}
  const n=fbm(wx*.05,wy*.05);return [sh?1:2,n<.42?.1:n>.6?.9:.5];}
const F39_DUG=[[74,52,32],[100,72,46],[124,92,60],[150,116,78]];
const F39_SOIL={dry:[[70,44,26],[96,64,38],[120,82,50],[148,104,64]],wet:[[44,27,16],[62,40,25],[80,52,33],[102,68,44]]};
const f39SoilCol=(v,hc,wet)=>{const c=F39_SOIL[wet?'wet':'dry'][v];const t=hc<.2?.9:hc>.84?1.07:1;return [c[0]*t,c[1]*t,c[2]*t];};
// tilled squares on bought land: the clods, and an edge that wanders in lobes along each open side (worked out in world
// pixels, so the edges of neighbouring squares meet), rounded at an outside corner, a dark rim where the bed is dug in along
// its top and left, and a pale crumb along its bottom and right where the turned earth catches the light
function f39TileAt(i,j){if(!F39.tmap||F39.tmapN!==tiles.length){F39.tmap=new Map();for(const t of tiles)if(t.i>=1000)F39.tmap.set(t.i+','+t.j,t);F39.tmapN=tiles.length;}return F39.tmap.get(i+','+j);}
{const _st=soilTile;soilTile=function(i,j,up,dn,lf,rt,wet){if(i<1000)return _st.apply(this,arguments);const tl=f39TileAt(i,j);
  if(!tl||!(String(tl.parcel||'').startsWith('lf_')||/^home\d/.test(tl.parcel||'')))return _st.apply(this,arguments);
  const key='f39:'+i+','+j+','+(up?1:0)+(dn?2:0)+(lf?4:0)+(rt?8:0)+(wet?'w':'');let c=SOIL_CACHE.get(key);if(c)return c;if(SOIL_CACHE.size>4000)SOIL_CACHE.clear();
  c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),im=g.createImageData(32,32),D=im.data;const X0=Math.round((tl.x-.5)*32),Y0=Math.round((tl.z-.5)*32);
  const ew=(u,k)=>1.2+4*Math.pow(clamp(.5+.5*Math.sin(u*.19+k*2.1+5*fbm(u*.025+k,k*1.7)),0,1),1.5)+2*(fbm(u*.3+k,5+k)-.5)+1.4*(fbm(u*.9+k*3,2+k)-.5);   // 0 to 6 pixels in, in lobes about a pace long, broken small (the crumbs outside it are f39Crumbs)
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){const wx=X0+x,wy=Y0+y;let e=99,side=0;
    if(!up){const q=y-ew(wx,1);if(q<e){e=q;side=1;}}if(!lf){const q=x-ew(wy,3);if(q<e){e=q;side=1;}}
    if(!dn){const q=31-y-ew(wx,2);if(q<e){e=q;side=2;}}if(!rt){const q=31-x-ew(wy,4);if(q<e){e=q;side=2;}}
    const Rr=6;const cor=(a,b)=>{if(a<Rr&&b<Rr){const q=Rr-Math.hypot(Rr-a,Rr-b)-1;if(q<e)e=q;}};
    if(!up&&!lf)cor(x,y);if(!up&&!rt)cor(31-x,y);if(!dn&&!lf)cor(x,31-y);if(!dn&&!rt)cor(31-x,31-y);
    // the edge crumbles: clods broken off the bed lie out on the grass beyond it (a lump of soil, lit on its upper left, its
    // shaded side below right), thick right by the edge and fewer further out; no line drawn round the bed
    if(e<0){if(e<-4.5)continue;const cx=wx>>1,cy=wy>>1,hh=hash(cx*7+1,cy*5+3);if(hh>.34+e*.07)continue;const ox=wx&1,oy=wy&1;if(ox&&oy&&hash(cx+9,cy+2)<.5)continue;
      const cc=F39_SOIL[wet?'wet':'dry'][ox+oy===0?3:ox+oy===2?0:hh<.2?1:2];const o=(y*32+x)*4;D[o]=cc[0];D[o+1]=cc[1];D[o+2]=cc[2];D[o+3]=255;continue;}
    const [v,hc]=f39Clod(wx,wy,5.5);let col=f39SoilCol(v,hc,wet);
    if(e<2.2&&fbm((side===1?wx+wy:wx-wy)*.12,side*7)>.44){if(side===1)col=e<1.1?F39_SOIL[wet?'wet':'dry'][0].map(q=>q*.86):f39SoilCol(Math.min(v,1),hc,wet);else col=e<1.1?(wet?[110,76,50]:[150,112,74]):f39SoilCol(Math.max(v,2),hc,wet);}
    const o=(y*32+x)*4;D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=255;}
  g.putImageData(im,0,0);SOIL_CACHE.set(key,c);return c;};}
// ---------------------------------------------------------------- each friend's kitchen bed, by the steps
// a small bed for the kitchen in each cabin's front yard, right beside the steps, each its own size, side and crop: boards
// pegged at the corners (lit on top, a shaded front edge, never a black frame), dug earth in clods, and what's growing
// (all on the sunny side of the steps, out of the cabin's own shadow: a wide one, a square one, a long narrow one past the corner)
const F39_BEDDEF=[{dx:-3.15,dz:.2,w:2.4,h:1.55,crop:'cabbage'},{dx:-2.55,dz:.15,w:1.8,h:1.8,crop:'chard'},{dx:-3.75,dz:.35,w:3.0,h:1.15,crop:'herb'}];
function f39BedSpr(i){const B=F39_BEDDEF[i],W=Math.round(B.w*32),H=Math.round(B.h*32)+3,key='f39bed'+i;const R=l35Rng(9001+i*77);
  return l35Spr(key,W+3,H+2,0,H,(P,g)=>{const im=g.createImageData(W+3,H+2),D=im.data;const put=(x,y,c)=>{if(x<0||y<0||x>=W||y>=H)return;const o=(y*(W+3)+x)*4;D[o]=c[0];D[o+1]=c[1];D[o+2]=c[2];D[o+3]=255;};
    for(let y=3;y<H+2;y++)for(let x=3;x<W+3;x++){if(x<W&&y<H)continue;const o=(y*(W+3)+x)*4;D[o]=12;D[o+1]=18;D[o+2]=8;D[o+3]=70;}
    const WD={top:[200,160,106],topSh:[168,128,82],face:[138,98,60],faceDk:[110,76,46],line:[92,62,38],peg:[82,56,34]},T=3,F=3,h0=H-F;   // board width, front face height
    // the earth inside
    for(let y=T;y<h0-1;y++)for(let x=T;x<W-T;x++){const [v,hc]=f39Clod(x+i*400,y+i*90,4.6);let c=f39SoilCol(v,hc,false);if(y===T||x===T)c=f39SoilCol(Math.min(v,1),hc,false);put(x,y,c);}
    // the boards: lit along the top, a shaded inner edge, the front board's face below, a dark line where each board meets the earth
    for(let x=0;x<W;x++){for(let y=0;y<T;y++)put(x,y,y===0?WD.top:y===T-1?WD.topSh:WD.top);for(let y=h0-1-T+1;y<h0;y++)put(x,y,y===h0-T?WD.top:WD.topSh);for(let y=h0;y<H;y++)put(x,y,y===H-1?WD.line:(x+((y*3)|0))%11===0?WD.faceDk:WD.face);}
    for(let y=0;y<h0;y++){for(let x=0;x<T;x++)put(x,y,x===0?WD.top:x===T-1?WD.topSh:WD.top);for(let x=W-T;x<W;x++)put(x,y,x===W-1?WD.faceDk:WD.topSh);}
    for(let x=T;x<W-T;x++)put(x,T,WD.line);for(let y=T;y<h0-T;y++)put(T,y,WD.line);
    for(const [x,y] of [[0,0],[W-2,0],[0,h0-2],[W-2,h0-2]]){put(x,y,WD.peg);put(x+1,y,WD.peg);put(x,y+1,WD.peg);put(x+1,y+1,WD.line);}
    for(let x=W-T;x<W;x++)for(let y=h0;y<H;y++)put(x,y,WD.faceDk);
    // what's growing, in rows, each plant its own size, with a little shade on the earth under it to the lower right
    const iw=W-2*T-2,ih=h0-2*T-2;const shade=(x,y,r)=>{for(let k=0;k<r;k++){const o=((y+1)*(W+3)+x+k+1)*4;if(D[o+3])for(let c=0;c<3;c++)D[o+c]*=.72;}};
    if(B.crop==='cabbage'){const nx=Math.max(2,Math.floor(iw/16)),ny=Math.max(1,Math.floor(ih/14));for(let r=0;r<ny;r++)for(let c=0;c<nx;c++){const cx=T+2+Math.round((c+.5)*iw/nx+(R()-.5)*3),cy=T+2+Math.round((r+.5)*ih/ny+(R()-.5)*2),rr=4.2+R()*1.6;
        shade(Math.round(cx-rr*.4),Math.round(cy+rr*.6),Math.round(rr*1.4));
        for(let y=-6;y<=6;y++)for(let x=-7;x<=7;x++){const d=Math.hypot(x,y*1.15);if(d>rr+.4)continue;const lam=-x*.5-y*.8;
          let col=d<rr*.45?(lam>0?[172,206,128]:[140,182,104]):lam>1.5?[108,160,78]:lam>-1.6?[78,128,62]:[52,92,46];if(d>rr-.8&&x+y>0)col=[38,70,36];put(cx+x,cy+y,col);}}}
    else if(B.crop==='chard'){const nx=Math.max(2,Math.floor(iw/14)),ny=Math.max(1,Math.floor(ih/15));for(let r=0;r<ny;r++)for(let c=0;c<nx;c++){const cx=T+2+Math.round((c+.5)*iw/nx+(R()-.5)*3),cy=T+3+Math.round((r+.6)*ih/ny+(R()-.5)*2);
        shade(cx-2,cy+1,6);const nl=5+((R()*2)|0),a0=R()*6.28;
        for(let l=0;l<nl;l++){const an=a0+l*6.28/nl+(R()-.5)*.5,len=5+R()*2,ux=Math.cos(an),uy=Math.sin(an)*.75-.35;
          for(let t=0;t<len;t++){const x=Math.round(cx+ux*t),y=Math.round(cy+uy*t);put(x,y,t<2?[176,40,44]:[54,104,52]);}       // the red stem
          for(let t=1.5;t<len+1.5;t+=.5)for(const w of [-1.2,0,1.2]){const x=Math.round(cx+ux*t-uy*w),y=Math.round(cy+uy*t+ux*w*.8);const lit=w*(ux+uy)<0||(ux+uy)<-.3;if(Math.abs(w)>1&&t>len)continue;
            put(x,y,w===0?[168,60,56]:lit?[132,190,92]:[74,134,62]);}}
        put(cx,cy,[132,36,40]);}}
    else{for(let k=0;k<Math.floor((iw-14)/9);k++){const cx=T+6+k*9+((R()*3)|0),cy=T+5+((R()*Math.max(1,ih-10))|0),rr=3.6+R()*1.4;shade(cx-2,cy+3,6);
        for(let y=-5;y<=5;y++)for(let x=-5;x<=5;x++){const d=Math.hypot(x,y)*(1+.18*Math.sin(Math.atan2(y,x)*5+k));if(d>rr)continue;const lam=-x-y;put(cx+x,cy+y,d>rr-1&&x+y>0?[58,84,54]:lam>1.5?[160,188,136]:lam>-1.5?[118,150,104]:[82,110,76]);}}
      // and a pumpkin on its vine at the end of the bed
      const px=W-T-11,py=h0-T-8;for(let y=-6;y<=6;y++)for(let x=-8;x<=8;x++){const d=Math.hypot(x/8,y/5.6);if(d>1)continue;const lam=-x*.45-y;put(px+x,py+y,d>.86&&x+y>0?[120,52,16]:Math.abs(x)===3||Math.abs(x)===6?[166,76,24]:lam>2.5?[246,166,76]:lam>-2?[218,118,42]:[170,80,28]);}
      put(px,py-6,[96,70,30]);put(px,py-7,[96,70,30]);put(px+1,py-7,[96,70,30]);for(let k=0;k<10;k++){put(px-9-k,py-4+((k/3)|0),[70,116,56]);if(k%4===1){put(px-9-k,py-5+((k/3)|0),[96,150,72]);put(px-10-k,py-5+((k/3)|0),[96,150,72]);}}}
    g.putImageData(im,0,0);});}
function f39Beds(){for(let i=0;i<F39_CABINS.length&&i<F39_BEDDEF.length;i++){const s=F39_CABINS[i],B=F39_BEDDEF[i];const x0=s.x+B.dx,z0=s.z+B.dz,x1=x0+B.w,z1=z0+B.h;
    const key=f39BedSpr(i);const o=obj(key,x0,z1+3/32,{kind:'flat',f39bed:i,hide:true});F39.objs.push(o);F39.beds=F39.beds||[];F39.beds[i]={o,rect:[x0,z0,x1,z1],col:null};}}
// a bed is there while its cabin is
{const _ls2=landSync;landSync=function(){const r=_ls2.apply(this,arguments);try{const n=landActiveHomes().length;
  (F39.stones||[]).forEach((L,i)=>{for(const e of L)e.hide=i>=n;});
  // the garden plots are dug ground once their cabins stand: their picture is in the ground, so it is drawn again when that changes
  if(F39.homesN!==n){F39.homesN=n;try{chunks.clear();}catch(e){}}for(let i=0;i<(F39.beds||[]).length;i++){const b=F39.beds[i];if(!b)continue;const on=i<n;b.o.hide=!on;
    if(on&&!b.col){b.col={x0:b.rect[0],z0:b.rect[1],x1:b.rect[2],z1:b.rect[3]};rects.push(b.col);if(typeof CGRID!=='undefined'&&CGRID)CGRID.dirty=true;}
    else if(!on&&b.col){const k=rects.indexOf(b.col);if(k>=0)rects.splice(k,1);b.col=null;if(typeof CGRID!=='undefined'&&CGRID)CGRID.dirty=true;}}}catch(e){}return r;};}
// ---------------------------------------------------------------- the friends' cabins, finished
if(typeof sunShadow==='function'){const _ss=sunShadow;sunShadow=function(o,X,Y){if(o&&o.fhcab!=null&&typeof DX!=='undefined'&&DX.sun&&!DX.sun.lamp){const S0=DX.sun.sx;DX.sun.sx=Math.abs(S0);let r;try{r=_ss.apply(this,arguments);}finally{DX.sun.sx=S0;}
    // the cabin's shadow is its own silhouette thrown down and to the right; its outer edges (the long side and the far end,
    // thrown by the ridge) are never ruled: they come ragged in lobes a few pixels deep where the grass breaks the shade, and
    // soft-stepped, the outer two pixels a lighter shade than the core
    try{const m=SPR[o.spr],s=DX.sun,shx=Math.abs(s.sx),shy=s.sy,g=DX.sg;if(m&&r&&!(o.kind==='tree'||o.kind==='pine'||o.kind==='bush')){
      if(m.f39top==null){m.f39top=0;try{const c=dxSil(o.spr),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;outer:for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>0){m.f39top=y;break outer;}}catch(e){}}
      const hgt=m.ay-m.f39top,bx0=Math.max(0,Math.round(X-m.ax)),bx1=Math.min(g.canvas.width,Math.round(X-m.ax+m.fw+shx*hgt+6)),by0=Math.max(0,Math.round(Y-m.ay*.35)),by1=Math.min(g.canvas.height,Math.round(Y+shy*hgt+6));
      const w=bx1-bx0,h=by1-by0;if(w>4&&h>4){g.setTransform(1,0,0,1,0,0);const id=g.getImageData(bx0,by0,w,h),D=id.data,n=w*h,dist=new Float32Array(n);
        for(let i=0;i<n;i++)dist[i]=D[i*4+3]>0?1e4:0;
        const q=1.41;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!dist[i])continue;let v=dist[i];if(x>0)v=Math.min(v,dist[i-1]+1);if(y>0){v=Math.min(v,dist[i-w]+1);if(x>0)v=Math.min(v,dist[i-w-1]+q);if(x<w-1)v=Math.min(v,dist[i-w+1]+q);}dist[i]=v;}
        for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){const i=y*w+x;if(!dist[i])continue;let v=dist[i];if(x<w-1)v=Math.min(v,dist[i+1]+1);if(y<h-1){v=Math.min(v,dist[i+w]+1);if(x<w-1)v=Math.min(v,dist[i+w+1]+q);if(x>0)v=Math.min(v,dist[i+w-1]+q);}dist[i]=v;}
        const ox=Math.round(o.x*32-X),oz=Math.round(o.z*32-Y);
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,d=dist[i];if(!d||d>9)continue;const wx=bx0+x+ox,wy=by0+y+oz;if(by0+y<Y-2&&bx0+x<X-m.ax+m.fw-4)continue;   // (under the cabin itself: hidden anyway)
          const jag=1+8*Math.max(0,fbm(wx*.1+.3,wy*.1+.7)-.22)+2.6*(fbm(wx*.33+5,wy*.33+2)-.5);if(d<jag){D[i*4+3]=0;continue;}if(d<jag+1.6)D[i*4+3]=Math.round(D[i*4+3]*.45);else if(d<jag+3.2)D[i*4+3]=Math.round(D[i*4+3]*.75);}
        g.putImageData(id,bx0,by0);}}}catch(e){}
    return r;}return _ss.apply(this,arguments);};}
function f39CrateCover(){const key='f39crate_cov';if(SPR[key])return key;const m=SPR.crate,im=m&&IMG[m.src];if(!im||!im.complete||!im.naturalWidth)return null;
  return l35Spr(key,m.fw,m.fh,m.ax,m.ay,(P,g)=>{g.drawImage(im,0,0,m.fw,m.fh,0,0,m.fw,m.fh);
    // a sack thrown over the lid and hanging down the front, folded, lit on its top and tied with twine
    const C={hi:'#d8c08a',lt:'#b89a62',md:'#957a48',dk:'#6a5230',ln:'#3e2e1a',tw:'#5a3e22'};const top=5,x0=2,x1=m.fw-2;
    for(let x=x0;x<x1;x++){const hang=12+Math.round(3*Math.sin(x*.7)+2*Math.sin(x*.29+1));for(let y=top;y<top+hang;y++){let c=y<top+6?C.lt:C.md;if(y===top)c=C.hi;if((x-x0)%7===3&&y>top+3)c=C.dk;if(y===top+hang-1)c=C.ln;P(x,y,1,1,c);}}
    for(let y=top;y<top+6;y++){P(x0-1,y,1,1,C.ln);P(x1,y,1,1,C.ln);}for(let x=x0;x<x1;x++)P(x,top-1,1,1,C.ln);
    for(let x=x0+2;x<x1-2;x++)P(x,top+7,1,1,C.tw);P(x0+5,top+7,2,2,C.tw);});}
if(typeof fhBin==='function'){const _fb=fhBin;fhBin=function(i){const had=!!(FHB.bins&&FHB.bins[i]);const r=_fb.apply(this,arguments);try{const B=FHB.bins&&FHB.bins[i];if(!had&&B&&B.o){B.o.flip=i===1;if(i===1){const k=f39CrateCover();if(k)B.o.spr=k;}
    const add=[['sacks',.85,.05],['firewood',-.9,-.05],['hay',.95,-.1]][i%3];if(add&&SPR[add[0]]){const e=obj(add[0],B.x+add[1],B.z+add[2],{kind:'prop',noCol:true,flip:i===2});F39.objs.push(e);B.extra=e;}}}catch(e){}return r;};}
// ---------------------------------------------------------------- the ridge behind the barn: timber steps up to the meadow
// (the ridge is a cliff the height of a man the whole way along; the lane climbs it where its top runs level, by six steps of
// packed earth held back with planks between two cheeks of the ridge's own stone)
const F39_STEPS={x:6.8,hw:1.0};
function f39StepsSpr(){const W=96,H=88,top=4,foot=63,X0=16,X1=80;
  return l35Spr('f39_steps5',W,H,48,foot,(P)=>{
    const WD={nose:'#e6c282',tread:'#c79a5c',seam:'#a97845',back:'#9a6c3e',lip:'#1e120a',riser:'#5a3624',riserLt:'#74482c',endL:'#b08452',endR:'#6a4228'};
    const ST={lit:'#8a7262',sh:'#3a2e28',ln:'#40332f'},GR={md:'#5a6a2c',dk:'#3a4420'},ER={md:'#7a5a34',dk:'#5e4428',sh:'rgba(20,12,6,.45)'};
    // the landing at the top, where the lane comes over the lip
    for(let x=X0;x<X1;x++){P(x,top-3,1,1,ER.dk);P(x,top-2,1,2,ER.md);}
    // the two cut ends of the ridge either side of the flight: the left one in shade, the right one in the light
    for(let y=top-2;y<foot;y++){P(X0-2,y,2,1,ST.lit);P(X1,y,2,1,ST.sh);if((y-top)%6===5){P(X0-2,y,2,1,ST.ln);P(X1,y,2,1,ST.ln);}}
    for(let x=X0-3;x<X0;x++)P(x,top-3,1,1,GR.md);for(let x=X1;x<X1+3;x++)P(x,top-3,1,1,GR.md);
    // eight steps: six in the cut, two jutting out past the foot of the ridge, each a little wider than the one above, so the
    // sides go down in a zig-zag and each step shows its own end
    const ys=[];for(let i=0;i<=6;i++)ys.push(Math.round(top+i*(foot-top)/6));ys.push(foot+10,foot+20);
    // every step stands three pixels proud of the one above it, so the whole flight zig-zags down its sides; in the cut the
    // ridge's stone fills in beside the narrower steps at the top
    const INS=[15,12,9,6,3,0],EA=i=>i<6?X0+INS[i]:X0-(i-5)*4,EB=i=>i<6?X1-INS[i]:X1+(i-5)*4;
    for(let i=0;i<6;i++)for(let y=ys[i];y<ys[i+1];y++){for(let x=X0-2;x<EA(i);x++)P(x,y,1,1,(y-top)%6===5?ST.ln:ST.lit);for(let x=EB(i);x<X1+2;x++)P(x,y,1,1,(y-top)%6===5?ST.ln:ST.sh);}
    for(let i=0;i<8;i++){const y0=ys[i],y1=ys[i+1],h=y1-y0,a=EA(i),b=EB(i),jut=i>0?Math.max(1,EA(i-1)-a):0;
      const tr=Math.max(4,h-4);   // a deep tread, a short riser
      for(let y=y0;y<y1;y++){const k=y-y0;
        for(let x=a;x<b;x++){let c;
          if(k<tr){c=k===0?WD.back:k===tr-1?WD.nose:WD.tread;if(k>0&&k<tr-1&&((x-a+i*5)%17===0))c=WD.seam;}
          else c=k===tr?WD.lip:(k===tr+1?WD.riserLt:WD.riser);
          P(x,y,1,1,c);}
        // the step's own ends, where it stands out past the one above
        if(jut){P(a,y,jut,1,k<tr?WD.endL:WD.riser);P(b-jut,y,jut,1,k<tr?WD.endR:WD.lip);}}
      // a peg at each end of the riser
      if(i<6){P(X0+3,y0+tr,2,h-tr,'#3a2218');P(X1-5,y0+tr,2,h-tr,'#3a2218');}}
    // the contact shadow under the bottom step, and the worn earth it stands on
    for(let x=X0-10;x<X1+10;x++){P(x,ys[8],1,1,ER.sh);if(x>X0-8&&x<X1+8&&(x%3))P(x,ys[8]+1,1,1,'rgba(20,12,6,.25)');}
    for(const [x,y] of [[X0-14,foot+6],[X1+12,foot+9],[X0-12,foot+16],[X1+13,foot+17]]){P(x,y,1,3,GR.md);P(x+1,y+1,1,2,GR.dk);}
  });}
function f39Steps(){const X=F39_STEPS.x,hw=F39_STEPS.hw,top=ridgeZ(X),foot=top+RIDGE.h;
  // the ridge face is open where the steps go: its colliders come out across the gap, and the two cheeks get theirs
  for(let i=segs.length-1;i>=0;i--){const q=segs[i];if(q.r!==.5)continue;const mx=(q.x1+q.x2)/2;if(Math.abs(q.z1-(ridgeZ(q.x1)+.9))>.05)continue;if(Math.max(q.x1,q.x2)>X-hw-.4&&Math.min(q.x1,q.x2)<X+hw+.4)segs.splice(i,1);}
  for(const s of [-1,1]){const cx=X+s*(hw+.1);addSeg(cx,top-.3,cx,foot+.1,.16);addSeg(cx,ridgeZ(cx)+.9,X+s*(hw+1.1),ridgeZ(X+s*(hw+1.1))+.9,.5);}
  f39StepsSpr();const o=obj('f39_steps5',X,foot,{kind:'flat',stairs:1,f39:1});F39.objs.push(o);F39.steps=o;}
// ---------------------------------------------------------------- building on the West Fields: machines and benches can go on the
// meadow beside land you own (not in the field itself, not on a track), the same as in the yard
function f39FarmSpot(x,z){if(!f39Meadow(x,z))return false;return LAND_PARCELS.some(P=>P.f39&&landOwns(P.id)&&f39RectD(P,x,z)<10);}
{const _pv=placeValid;placeValid=function(x,z){const r=_pv.apply(this,arguments);if(r!=='Off the farm.')return r;const sp=PLACE.spec;if(!sp||sp.room||!f39FarmSpot(x,z))return r;
  const x0=x-sp.w/2,x1=x+sp.w/2,z0=z-sp.d,z1=z;
  for(let i=x0;i<=x1+.01;i+=.5)for(let j=z0;j<=z1+.01;j+=.5){const t=terr(i,j);if(t==='water'||t==='stone')return 'Not on that ground.';if(f39OnTrack(i,j,.2))return 'Not on the track.';}
  for(const P of LAND_PARCELS)if(landOwns(P.id)&&x1>P.x0-.2&&x0<P.x0+P.w+.2&&z>P.z0-.2&&z0<P.z0+P.h+.2)return 'Not in the field.';
  for(const q of rects)if(q.x1>x0+.05&&q.x0<x1-.05&&q.z1>z0+.05&&q.z0<z1-.05)return 'Something is in the way.';
  for(const c of circles)if(c.x+c.r>x0&&c.x-c.r<x1&&c.z+c.r>z0&&c.z-c.r<z1)return 'Something is in the way.';
  for(const o of OBJ){if(o.hide||['deco','anim','grass','flat'].includes(o.kind))continue;const m=SPR[o.spr],f=m&&m.foot&&(m.foot[0]||m.foot[2])?m.foot:null,hw=Math.min(.34,Math.max(.12,(m?m.fw:20)/PPM*.3));
    const ox0=o.x+(f?f[0]:-hw),ox1=o.x+(f?f[2]:hw),oz0=o.z+(f?f[1]:-.3),oz1=o.z+(f?f[3]:.02);if(ox1>x0+.03&&ox0<x1-.03&&oz1>z0+.03&&oz0<z1-.03)return 'Something is in the way.';}
  if(Math.abs(P.x-x)<sp.w/2+.3&&P.z>z0-.3&&P.z<z1+.4)return 'You are standing there.';
  return null;};}
// ---------------------------------------------------------------- round 5: the farm's small things from the kit
// the farm reaches from the West Fields to Grandpa's yard and the cabins' meadow, and down to the Low Fields
const f39Farmish=(x,z)=>(x>-165&&x<32&&z>-48&&z<182)||(typeof L35!=='undefined'&&z>L35.Z0-8);
function f39KitDraw(g,t,i,pal,dx,dy){const G=F39_KIT[t][i],PAL=(t==='g'?F39_KIT.gpal:t==='b'?F39_KIT.bpal:F39_KIT.lpal)[pal];
  for(let y=0;y<G.length;y++)for(let x=0;x<G[y].length;x++){const ch=G[y][x];if(ch==='.')continue;g.fillStyle=ch===','?F39_KSH:PAL[ch];g.fillRect(dx+x,dy+y,1,1);}}
// the ground's own clutter over the farm: the lime tufts and the flowers on their lime stems give way to the odd wisp of straw
// or olive from the kit (fewer than before: lone marks spread evenly read as stickers); the stones and the twig stay
function f39Decor(){if(F39.decor)return F39.decor;const o=F39.decor0,im=o&&IMG[o.src];if(!im||(im.complete===false)||!(im.width||im.naturalWidth))return null;
  const c=document.createElement('canvas');c.width=128;c.height=16;const g=c.getContext('2d');for(const v of [3,4,7])g.drawImage(im,v*16,0,16,16,v*16,0,16,16);
  f39KitDraw(g,'g',1,'mix',1*16+2,3);f39KitDraw(g,'g',0,'olive',5*16+4,5);
  f39KitDraw(g,'g',0,'mix',6*16+4,5);
  IMG['mem:f39decor']=c;return F39.decor={src:'mem:f39decor',fw:128,fh:16,ax:0,ay:0,foot:[0,0,0,0]};}
{const _gp=groundPixels;groundPixels=function(g,x0,z0,N){if(!F39.decor0)F39.decor0=SPR.decor;
  const farm=F39.built&&((z0+N>-48&&z0<182&&x0+N>-165&&x0<32)||(typeof L35!=='undefined'&&z0+N>L35.Z0-8));let d=null;try{d=farm&&f39Decor();}catch(e){}
  SPR.decor=d||F39.decor0;
  // the ridge's grass lip over the farm is olive like its meadow, not the lime that was the loudest green on screen
  if(!F39.cliff0)F39.cliff0=SPR.cliff;let cl=null;try{cl=farm&&f39Cliff();}catch(e){}if(F39.cliff0)SPR.cliff=cl||F39.cliff0;
  return _gp.apply(this,arguments);};}
function f39Cliff(){if(F39.cliffO)return F39.cliffO;const o=F39.cliff0,im=o&&IMG[o.src];if(!im||(im.complete===false)||!(im.width||im.naturalWidth))return null;
  const c=document.createElement('canvas');c.width=im.width||im.naturalWidth;c.height=im.height||im.naturalHeight;const g=c.getContext('2d');g.drawImage(im,0,0);
  const id=g.getImageData(0,0,c.width,c.height),D=id.data;for(let i=0;i<D.length;i+=4){const r=D[i],gg=D[i+1],b=D[i+2];if(D[i+3]&&gg>r+18&&gg>b+10){const L=r*.3+gg*.59+b*.11;D[i]=L*.95+4;D[i+1]=L*1.02+6;D[i+2]=L*.56;}}
  g.putImageData(id,0,0);IMG['mem:f39cliff']=c;return F39.cliffO=Object.assign({},o,{src:'mem:f39cliff'});}
// the leaves: what blows past the camera over the farm, and what comes down off its maples, are the kit's drawn leaves (a stem,
// one long axis, lit on one edge; tumbling through four turns in the air), never the little cross that read as a sparkle
const F39_LC={'#c8642a':'rust','#d8a030':'ochre','#a83a1e':'brown','#e0b848':'ochre'};   /* (no red leaf over the farm: alone on the grass it reads as blood) */
function f39LeafPal(c){if(!c||c[0]!=='#')return 'rust';const r=parseInt(c.slice(1,3),16),g=parseInt(c.slice(3,5),16),b=parseInt(c.slice(5,7),16);let best='rust',bd=1e9;
  for(const [k,p] of Object.entries(F39_KIT.lpal)){if(k==='red')continue;const q=p.m,d=(parseInt(q.slice(1,3),16)-r)**2+(parseInt(q.slice(3,5),16)-g)**2+(parseInt(q.slice(5,7),16)-b)**2;if(d<bd){bd=d;best=k;}}return best;}
function f39LeafBlit(t,i,pal,X,Y){const key=f39KitSpr(t,i,pal),m=SPR[key],im=IMG[m.src];if(im)ctx2.drawImage(im,Math.round(X-m.fw/2),Math.round(Y-m.fh/2));}
if(typeof NEAR!=='undefined'&&typeof nearLeaf==='function'){const _nl=nearLeaf;nearLeaf=function(){const l=_nl.apply(this,arguments);if(!S.room&&f39Farmish(cam.x,cam.z)){l.f39s=l.s;l.s=0;}return l;};
  const _dx=depthOver;depthOver=function(t){const farm=!S.room&&S.mode==='play'&&f39Farmish(cam.x,cam.z);
    for(const l of NEAR.leaves){if(farm){if(l.s>0){l.f39s=l.s;l.s=0;}}else if(!(l.s>0)&&l.f39s)l.s=l.f39s;}
    const r=_dx.apply(this,arguments);
    try{if(farm&&!DX.off){const day=clamp(1-nightK*1.4,0,1);if(day>.05){const P1=1.55;
      for(const l of NEAR.leaves){const X=(sx(l.x)-VW/2)*P1+VW/2,Y=(sz(l.z)-VH*.5)*P1+VH*.5,fr=(((l.ph*2.4+l.rot*.25)%4)+4)%4|0;f39LeafBlit('t',fr,F39_LC[l.c]||'rust',X,Y);}}}}catch(e){}
    return r;};}
if(typeof leafPaint==='function'){const _lp=leafPaint;leafPaint=function(L){if(S.room||!f39Farmish(L.x,L.z))return _lp.apply(this,arguments);
  const X=Math.round(sx(L.x)),Y=Math.round(sz(L.z)),pal=f39LeafPal(L.col&&L.col[0]);
  if(L.h>0){ctx2.fillStyle='rgba(20,16,10,.45)';ctx2.fillRect(X-1,Y,3,1);f39LeafBlit('t',((L.t*5+L.ph)|0)%4,pal,X,Y-Math.round(L.h));return;}
  f39LeafBlit('l',((L.ph*7)|0)%F39_KIT.l.length,pal,X,Y);};}

// the tilled bed's edge crumbles outward too: along every side of the bed that meets untilled ground, a strip laid on the grass
// with the soil bulging out past the dug line in low lobes and clods broken off it lying a few pixels out, thick by the edge and
// fewer further away (the dug squares themselves can only draw inside their own square)
function f39CrumbSpr(side,v){const key='f39cr_'+side+v;if(SPR[key])return key;const hz=side==='u'||side==='d',W=hz?40:12,H=hz?12:40,L=hz?W:H;
  const pos=(a,k)=>side==='u'?[a,H-1-k]:side==='d'?[a,k]:side==='l'?[W-1-k,a]:[k,a];
  return l35Spr(key,W,H,0,H,(P)=>{const R=l35Rng(9300+v*17+side.charCodeAt(0)*131),SO=F39_SOIL.dry,c=i=>'rgb('+SO[i].map(q=>q|0).join(',')+')',lit=side==='d'||side==='r';
    for(let a=3;a<L-3;a++){const lobe=Math.max(0,Math.round((Math.sin(a*.33+v*1.7)+.2)*1.5+(R()-.5)*1.4));
      for(let k=0;k<lobe;k++){const [x,y]=pos(a,k);P(x,y,1,1,c(k===lobe-1?(lit?3:0):k===0?1:2));}}
    for(let i=0;i<13;i++){const a=2+R()*(L-4),k=Math.round(1.5+Math.pow(R(),1.7)*8),big=R()<.4;const [x,y]=pos(a,k);
      P(x,y,1,1,c(3));P(x+1,y,1,1,c(2));if(big){P(x,y+1,1,1,c(2));P(x+1,y+1,1,1,c(0));}else P(x+1,y+1,1,1,'rgba(20,14,8,.35)');}});}
const F39_CRUMB=new Map();
function f39Crumbs(){if(!F39.built||S.room)return;const want=new Set(),T=(t,di,dj)=>{const q=typeof tileNb==='function'?tileNb(t,di,dj):tileAt(t.i+di,t.j+dj);return !!(q&&q.tilled);};
  for(const t of tiles){if(!t.tilled||!(String(t.parcel||'').startsWith('lf_')||/^home\d/.test(t.parcel||'')))continue;if(Math.abs(t.x-P.x)>40||Math.abs(t.z-P.z)>30)continue;
    for(const [sd,di,dj] of [['u',0,-1],['d',0,1],['l',-1,0],['r',1,0]]){if(T(t,di,dj))continue;const k=t.i+','+t.j+sd;want.add(k);if(F39_CRUMB.has(k)){F39_CRUMB.get(k).hide=false;continue;}
      const v=(hash(t.i*7+sd.charCodeAt(0),t.j*13+3)*6)|0,spr=f39CrumbSpr(sd,v),x0=t.x-.5,z0=t.z-.5;
      const [x,z]=sd==='u'?[x0-.125,z0]:sd==='d'?[x0-.125,z0+1.375]:sd==='l'?[x0-.375,z0+1.125]:[x0+1,z0+1.125];F39_CRUMB.set(k,obj(spr,x,z,{kind:'flat',f39cr:1}));}}
  for(const [k,o] of F39_CRUMB)if(!want.has(k))o.hide=true;}
setInterval(()=>{try{f39Crumbs();}catch(e){}},700);
// the weeds on the farm's other ground (the friends' garden plots) are the kit's too
if(typeof makeDebris==='function'){const _md=makeDebris;makeDebris=function(spr,x,z,t){const d=_md.apply(this,arguments);try{if(d&&/^weeds/.test(spr||'')&&t&&/^home\d/.test(t.parcel||''))f39WeedLook(d,spr,hash((x*7)|0,(z*5)|0),t.i||0,t.j||0,3);}catch(e){}return d;};}

// the leaf litter heaped against trees and walls over the farm: drifts of the kit's drawn leaves (dense in the middle, a few
// loose ones at the rim, each lying with its stem and its own shade under it), instead of the old litter's little crosses
function f39LitterSpr(n){const key='leaves_f39'+n;if(SPR[key])return key;const R=l35Rng(4400+n*97),W=56,H=23;
  return l35Spr(key,W,H,28,21,(P,g)=>{const L=[];const N=16+((R()*10)|0);
    for(let i=0;i<N;i++){const a=R()*6.283,r=Math.pow(R(),.75),x=28+Math.cos(a)*r*22,y=13+Math.sin(a)*r*7;L.push([x,y]);}
    L.sort((a,b)=>a[1]-b[1]);
    for(const [x,y] of L){const li=(R()*F39_KIT.l.length)|0,G=F39_KIT.l[li],pal=F39_KIT.lpal[['brown','ochre','rust','brown','ochre'][(R()*5)|0]],X=Math.round(x-G[0].length/2),Y=Math.round(y-G.length/2);
      for(let yy=0;yy<G.length;yy++)for(let xx=0;xx<G[yy].length;xx++){if(G[yy][xx]==='.')continue;g.fillStyle='rgba(18,14,8,.3)';g.fillRect(X+xx+1,Y+yy+1,1,1);}
      for(let yy=0;yy<G.length;yy++)for(let xx=0;xx<G[yy].length;xx++){const ch=G[yy][xx];if(ch==='.')continue;g.fillStyle=pal[ch];g.fillRect(X+xx,Y+yy,1,1);}}});}
function f39Litter(){let n=0;for(const o of OBJ){if(o.kind!=='deco'||o.room||!f39Farmish(o.x,o.z))continue;const k=(hash((o.x*7)|0,(o.z*5)|0)*4)|0;f39LitterSpr(k);o.v='f39'+k;n++;}F39.litter=n;}
{const _fb=f39Build;f39Build=function(){const r=_fb.apply(this,arguments);try{f39Litter();}catch(e){console.warn('farm litter',e);}return r;};}
