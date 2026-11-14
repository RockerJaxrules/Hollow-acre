/* ================= #235 butchering. A butcher's block you build like any bench and carry out to the yard; a hen from the coop
   or a cow from the barn, when it comes to that. The making game is the knife: joint the bird, or break the side down along
   its seams, then weigh it out. It gives meat for the stove (and the stove has new things to make with it), a hide for the
   armour bench, and bone meal. It costs something too: one fewer layer or milker, Ezra Bell hears about it, the ground by
   the block stays dark, and the night after, something comes to the block. Nothing the story needs is behind it. ====== */
Object.assign(ITEMS,{poultry:{name:'Dressed hen',icon:'poultry',sell:26,desc:'Plucked and jointed. Roast it at the stove, or it won’t keep.'},
  beef:{name:'Beef',icon:'beef',sell:30,desc:'A good thick cut. The stove can make a stew of it.'},
  hide:{name:'Cowhide',icon:'hide',sell:60,desc:'Scraped and salted. The armour bench can make a coat that turns teeth.'}});
BENCHES.push(['butcher','bench_butcher','Butcher’s block',{wood:25,iron_bar:2,stone:6},'An end-grain block, a cleaver and a rack of hooks. For the animals, when it comes to that.']);
BENCH_FP.butcher=[1.8,.6];Object.assign(CRAFT_ICON,{hen:'poultry',cow:'beef'});CRAFT_VENDORS.add('b_butcher');CRAFT_ART.b_butcher='bench_butcher';RECIPE_WHERE.b_butcher='the butcher’s block';
// the hens are saved now (a hen bought from Ezra used to be gone after a reload)
S.henN=S.henN==null?HENS.length:S.henN;
function henSync(){const want=Math.max(0,Math.min(8,S.henN|0));while(HENS.length<want)HENS.push({x:10.5,z:-2.2,tx:10,tz:-2,t:rand()*5,wait:rand()*2,peck:0,flip:false});while(HENS.length>want)HENS.pop();}
{const _vf=vendors.v_feed.rows;vendors.v_feed.rows=()=>_vf().map(r=>{if(r.k!=='hen'||r._bt)return r;const b=r.buy;return Object.assign({},r,{_bt:1,buy(){b.apply(this,arguments);S.henN=HENS.length;}});});}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);try{if(S.henN==null)S.henN=HENS.length;henSync();}catch(e){}return r;};}
// ---- the block
const butcherCost=kind=>{S.butchered=(S.butchered||0)+1;S.blockNight=S.day;
  if(typeof addFriend==='function')addFriend('ezra',kind==='cow'?-14:-6);S.ezraHeard=kind;
  const p=BENCH_POS.butcher;if(p&&typeof goreDecal==='function')goreDecal(p.x+.2,p.z+.5,.45,kind==='cow'?4:2);
  if(typeof addXP==='function')addXP('farming',kind==='cow'?20:8);};
vendors.b_butcher={name:'Butcher’s block',sub:'The block is older than Grandpa. The hollow worn into it is the shape of a great many years.',rows:()=>[
  {k:'hen',name:'A hen from the coop',desc:HENS.length?`She stops pecking when you lift her, as if she knows. Two dressed hens and a little bone meal. One fewer egg each morning. You have ${HENS.length}.${HENS.length===1?' She is the last one.':''}`:'The coop is empty.',
    price:0,btn:'Take her',can:S.coop&&HENS.length>0,buy(){S.henN=Math.max(0,HENS.length-1);henSync();addInv('poultry',2);addInv('fert',1);butcherCost('hen');}},
  {k:'cow',name:'A cow from the barn',desc:S.cows?`She follows you out without a rope. Four cuts of beef, her hide, and bone meal. One fewer bottle of milk each morning. You have ${S.cows}.`:'The barn is empty.',
    price:0,btn:'Lead her out',can:S.cows>0,buy(){S.cows--;S.milk=Math.min(S.milk,S.cows*2);if(typeof placeFarmCows==='function')placeFarmCows();addInv('beef',4);addInv('hide',1);addInv('fert',2);butcherCost('cow');}}]};
// ---- the knife: the trace game drawn on a board, on the bird or the side of beef
{const _tr=S4.trace;S4.trace=(sp,K)=>{const o=_tr(sp,K);if(sp.surface!=='hen'&&sp.surface!=='beef')return o;const st=o.st,g=K.g,paths=sp.paths;
  const P=()=>paths[st.pi];
  const board=m4blk('butchboard',260,120,k=>{k.planks(0,0,260,120,CA_P.wood,12,5,true);for(let i=0;i<5;i++){const x=20+i*52,y=20+(i*37)%70;k.px(x,y,14,6,'#3a160e');k.px(x+2,y+1,10,4,'#4a1c12');}});
  const hen=m4blk('carcass_hen',150,96,k=>{const SK=['#6a3c30','#94584a','#c08470','#dca896','#f0ccb8','#fae6d8'];
    const blob=(cx,cy,rx,ry)=>{for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=x*x/(rx*rx)+y*y/(ry*ry);if(d>1)continue;const l=-x/rx*.55-y/ry*.7;k.px(cx+x,cy+y,1,1,SK[Math.max(0,Math.min(5,Math.round(2.6+l*2.2-(d>.8?1:0))))]);}};
    blob(70,50,46,30);blob(118,28,18,10);blob(122,72,18,10);blob(26,38,16,9);for(const [x,y] of [[136,22],[140,76]]){k.px(x,y,6,6,'#f0e8d4');k.px(x,y,6,2,'#ffffff');}});
  const beef=m4blk('carcass_beef',220,100,k=>{const M=['#3a0c0e','#5e1418','#8a2024','#b0363a','#cc5450','#e07a6e'],F=['#d8ccb4','#efe6d4','#fbf6ea'];
    for(let y=0;y<100;y++)for(let x=0;x<220;x++){const u=(x-110)/108,v=(y-50)/46;const d=Math.abs(u)**2.2+Math.abs(v)**2.6;if(d>1)continue;const rim=d>.8;const l=-u*.4-v*.6;
      k.px(x,y,1,1,rim?F[(x+y)%7?1:2]:M[Math.max(1,Math.min(5,Math.round(3+l*2)))]);}
    for(const [x0,y0,x1] of [[30,30,90],[120,60,190],[60,72,110]])for(let x=x0;x<x1;x++)k.px(x,y0+Math.round(Math.sin(x*.1)*3),1,1,F[1]);
    for(let i=0;i<5;i++){k.px(20+i*42,8,10,8,'#efe6d4');k.px(20+i*42,8,10,2,'#ffffff');}});
  o.how='Follow the dotted line with the knife, start to end: '+(K.fine?'hold the mouse button and draw along it':'drag along it with your finger')+'. Stay on the joint and don’t rush.';
  o.draw=function(t){K.pa(34,40,260,120,'#000',.3);g.drawImage(board,30,36);
    if(sp.surface==='hen')g.drawImage(hen,85,46);else g.drawImage(beef,50,46);
    paths.forEach((p,pi)=>{if(pi<st.pi)return;const L=m4len(p);for(let s=pi===st.pi?st.s:0;s<L;s+=4){const [x,y]=m4at(p,s);K.px(x,y,2,1,'#2a0e08');}});
    for(const [x,y,pi,f] of st.cut){K.px(x,y,2,1,'#3a0a08');K.px(x,y+1,2,1,f?'#7a2a20':'#5a1610');}
    if(!st.end){M4.rot(g,M4S.knife(),st.tx,st.ty,-.5,8,44);const [hx,hy]=M4.tr(st.tx,st.ty,-.5,0,-38);m4sleeve(K,hx+3,hy,hx+30,hy+20);m4hand(K,hx,hy);}
    if(st.jump>0){const [x,y]=P()[0];K.pa(x-3,y-3,6,6,'#ffd27a',.6+Math.sin(t*20)*.3);}};
  return o;};}
Object.assign(MG4R,{
  'b_butcher:hen':{scene:'barn',reveal:m4ico('poultry'),steps:[{k:'trace',t:'Joint the bird along the dotted lines',surface:'hen',tool:'knife',paths:[[[200,64],[190,74],[184,88]],[[204,122],[192,110],[184,98]],[[160,66],[160,94],[160,124]]]},{k:'scale',t:'Weigh it out',col:['#f0ccb8','#dca896']}]},
  'b_butcher:cow':{scene:'barn',reveal:m4ico('beef'),steps:[{k:'trace',t:'Break the side down along its seams',surface:'beef',tool:'knife',paths:[[[110,56],[114,96],[110,138]],[[160,52],[156,96],[160,140]],[[210,56],[206,96],[212,138]],[[70,98],[160,94],[250,100]]]},{k:'scale',t:'Weigh the cuts',col:['#b0363a','#cc5450']}]},
  'build:bench_butcher':{scene:'yard',reveal:m4ico('bench_butcher'),steps:[{k:'saw',t:'Saw a round off the oak',n:10,seed:44,wood:CA_P.oak},{k:'plane',t:'Plane the end grain flat',wood:CA_P.oak,seed:12},{k:'hammer',t:'Hang the hooks',n:3}]}});
for(const k of ['b_butcher:hen','b_butcher:cow','build:bench_butcher'])CG3_RECIPES[k]=CG3_RECIPES[k]||{butcher:k};
// ---- what it costs, later
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);try{
  if(S.blockNight===S.day-1){setTimeout(()=>toast('Something came to the block in the night. The stain is licked clean in a long smooth stripe, and there are no tracks.',5),5200);S.blockNight=-1;}
  if(S.ezraHeard){const k=S.ezraHeard;S.ezraHeard=null;setTimeout(()=>toast(k==='cow'?'Ezra heard about the cow. He doesn’t say anything when you pass the feed barn, which is worse.':'Ezra heard. “Hens,” he says, “sleep easier than anything in this valley. Did.”',4.6),9200);}}catch(e){}return r;};}
// a cabbage for the chopping board (the stew needs one)
VEG.cabbage={L:40,R:u=>Math.max(2,13.5*Math.sqrt(Math.max(0,1-((u-20)/20)**2))),w0:6,skin:['#163a32','#2e6a50','#5a9a72','#94c4a2','#c4e0c4'],flesh:['#c8e0b8','#e0f0d0','#f4fbec'],rings:1,crunch:1,
  deco(K,x,u,cy,r){if(u%6<1)K.px(x,cy-r+1,1,r*2-2,'#3e7a5c');}};
// ---- the stove can cook it, and the armour bench can work the hide
RECIPE_LV['b_butcher:cow']=['farming',4];
{const _rc=vendors.cook.rows;vendors.cook.rows=()=>{const r=_rc();
  r.push({k:'roast_hen',name:'Roast hen',desc:'A dressed hen roasted with potatoes and carrots. +90 energy, +40 health.',price:0,btn:'Cook',need:{poultry:1,wood:2},produce:{potato:1,carrot:1},can:true,buy(){takeProduce({potato:1,carrot:1});addInv('roast_hen',1);}},
    {k:'beef_stew',name:'Beef stew',desc:'Beef stewed slow with cabbage and ale. +120 energy, +60 health.',price:0,btn:'Cook',need:{beef:1,ale:1,wood:2},produce:{cabbage:1},can:true,buy(){takeProduce({cabbage:1});addInv('beef_stew',1);}});return r;};}
Object.assign(ITEMS,{roast_hen:{name:'Roast hen',icon:'roast_hen',food:[90,40],sell:110,desc:'Golden skin, the potatoes gone soft in the drippings. +90 energy, +40 health.'},
  beef_stew:{name:'Beef stew',icon:'beef_stew',food:[120,60],sell:160,desc:'Dark and thick, with ale in it. +120 energy, +60 health.'}});
Object.assign(MG4R,{'cook:roast_hen':{scene:'kitchen',reveal:m4ico('roast_hen'),steps:[{k:'chop',t:'Chop the potatoes and carrots',veg:['potato','carrot','potato']},{k:'bake',t:'Roast it golden'}]},
  'cook:beef_stew':{scene:'kitchen',reveal:m4ico('beef_stew'),steps:[{k:'chop',t:'Chop the cabbage',veg:['cabbage']},{k:'pour',t:'Pour in the ale',col:['#6e3810','#a8641e'],bowl:'clay',line:.6},{k:'simmer',t:'Stew it low and slow',scene:'stove',col:['#5a2a14','#8a4a24'],lo:.45,hi:.62,slow:.7,bits:['#b0363a','#7aa868','#e8d8a8']}]}});
for(const k of ['cook:roast_hen','cook:beef_stew'])CG3_RECIPES[k]=CG3_RECIPES[k]||{cook:k};
{const _ra=vendors.b_armor.rows;vendors.b_armor.rows=()=>{const r=_ra();
  r.push({k:'hidecoat',name:'Cowhide coat',desc:'A long coat cut from your own cowhide, waxed. Turns teeth better than anything Ezra sells.',price:0,btn:'Make',need:{hide:1,fiber:6},can:!inv('hidecoat'),buy(){addInv('hidecoat',1);}});return r;};}
ITEMS.hidecoat={name:'Cowhide coat',icon:'it_coat',sell:180,desc:'Heavy, waxed, cut from your own cowhide. Whatever lives below the farm has to bite through it.'};
MG4R['b_armor:hidecoat']=Object.assign({},MG4R['b_armor:coat']||{scene:'workshop',steps:[{k:'trace',t:'Cut the panels',paths:[[[80,60],[240,60]]],surface:'leather',tool:'knife'},{k:'sew',t:'Sew the seams'}]},{reveal:m4ico('it_coat')});
CG3_RECIPES['b_armor:hidecoat']=CG3_RECIPES['b_armor:hidecoat']||{armor:'hidecoat'};
