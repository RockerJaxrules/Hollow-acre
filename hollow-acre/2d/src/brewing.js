/* ================= #234 the brewery. Ale, wine and spirits, made the slow way and across more than one station:
   - the BREW KETTLE mashes and boils: ale wort (barley + hops), pumpkin ale wort, corn mash, potato mash;
   - the FRUIT PRESS presses grapes into must;
   - a KEG (set down anywhere on the farm) ferments over days: wort into ale, must into wine, mash into wash;
   - the COPPER STILL runs wash into spirit: white dog from corn, vodka from potatoes, and Hollow gin (vodka run back with
     glowcaps);
   - an OAK CASK ages over a week: white dog into whiskey, wine into old wine, a grade better than it went in.
   Every step at a station is its own short game, built from the kitchen's and the forge's parts (the press and the quern
   are new looks for the crank). Kegs and casks show they're working (bubbles at the bung) and when they're ready (a glint).
   Drinks restore a little energy and leave you tipsy for a while; Hollow gin pushes the dark back a little. ========== */
const BREW_ITEMS={
  wort_ale:{name:'Ale wort',sell:14,desc:'Barley mashed and boiled with hops, cooling in the bucket. Pour it into a keg and give it three days.'},
  wort_pump:{name:'Pumpkin ale wort',sell:18,desc:'Wort with a pumpkin boiled into it. Four days in a keg.'},
  mash_corn:{name:'Corn mash',sell:10,desc:'Cracked corn cooked with a little barley. Two days in a keg turns it into wash for the still.'},
  mash_potato:{name:'Potato mash',sell:10,desc:'Potatoes cooked to a paste with a little barley. Two days in a keg turns it into wash for the still.'},
  must_grape:{name:'Grape must',sell:16,desc:'Pressed grapes, skins and all. Five days in a keg turns it into wine.'},
  wash_corn:{name:'Corn wash',sell:14,desc:'Sour, cloudy and about as strong as beer. Run it through the copper still.'},
  wash_potato:{name:'Potato wash',sell:14,desc:'Thin and sour. Run it through the copper still for vodka.'},
  ale:{name:'Hollow ale',sell:48,food:[14,0],drink:1,desc:'A brown ale that tastes of woodsmoke and October.'},
  pumpkin_ale:{name:'Pumpkin ale',sell:66,food:[16,0],drink:1,desc:'Amber, a little sweet, spiced like the harvest supper. Sells well.'},
  wine:{name:'Grape wine',sell:85,food:[12,4],drink:1,desc:'Young and dark. A week in an oak cask would make it something else.'},
  old_wine:{name:'Old wine',sell:170,food:[14,8],drink:1,desc:'Aged in oak until it went quiet and deep. Sealed with wax.'},
  white_dog:{name:'White dog',sell:75,food:[8,0],drink:2,desc:'Corn whiskey straight off the still, clear as water and twice as honest. Six days in an oak cask makes it whiskey.'},
  whiskey:{name:'Hollow whiskey',sell:190,food:[18,0],drink:2,desc:'Aged in oak to the colour of the leaves outside. The best thing the valley makes.'},
  vodka:{name:'Potato vodka',sell:95,food:[6,0],drink:2,desc:'Clean and cold. Run it back through the still with glowcaps and it becomes something stranger.'},
  hollow_gin:{name:'Hollow gin',sell:220,food:[20,10],drink:3,desc:'Vodka run back through the still with glowcaps. It glows faintly in the dark. While it’s in you, the dark seems further off.'},
  brew_keg:{name:'Keg',icon:'in_keg',sell:0,desc:'Hold it out on the farm and set it down. Fill it with wort, must or mash, and it does the rest over a few days.'},
  brew_cask:{name:'Oak cask',icon:'cask_oak',sell:0,desc:'Hold it out on the farm and set it down. Spirit and wine age in it for a week and come out a grade better.'}};
for(const [k,d] of Object.entries(BREW_ITEMS))ITEMS[k]=Object.assign({icon:k},d);
const DRINKS=Object.keys(BREW_ITEMS).filter(k=>BREW_ITEMS[k].drink);
// ---- the stations: three benches you build from the plans and carry out to the yard like the others
BENCHES.push(['brew','bench_brew','Brew kettle',{copper_bar:4,stone:20,wood:15},'A copper kettle on a firebox and a mash tun. Where every ale and every spirit starts.'],
  ['press','bench_press','Fruit press',{wood:30,iron_bar:2},'An oak screw press. Grapes go in, must comes out for the keg.'],
  ['still','bench_still','Copper still',{copper_bar:8,iron_bar:2,stone:20},'Runs fermented wash into spirit. The wash has to come out of a keg first.']);
Object.assign(BENCH_FP,{brew:[1.9,.7],press:[1.7,.6],still:[2.0,.7]});
for(const k of ['brew','press','still']){CRAFT_VENDORS.add('b_'+k);CRAFT_ART['b_'+k]='bench_'+k;}
// recipes that need produce from the basket: they list it and check it like the stove does
{const _cn=craftNeeds;craftNeeds=function(v,r){const out=_cn.apply(this,arguments);if(r&&r.produce)for(const [k,n] of Object.entries(r.produce))out.push({k,n,have:basketCount(k),name:(PRODUCE_NAMES&&PRODUCE_NAMES[k])||k,icon:k});return out;};}
const takeProduce=p=>{for(const [k,n] of Object.entries(p))takeBasket(k,n);};
// the better recipes come with skill (and say so), like the rest of the game's
Object.assign(RECIPE_LV,{'b_brew:wort_pump':['farming',3],'b_brew:mash_potato':['farming',2],'b_still:vodka':['farming',3],'b_still:hollow_gin':['foraging',4],'b_furn:brew_cask':['foraging',2]});
Object.assign(RECIPE_WHERE,{b_brew:'the brew kettle',b_press:'the fruit press',b_still:'the copper still'});
const brewLock=(v,r)=>{const q=RECIPE_LV[v+':'+r.k];if(!q||skLvl(q[0])>=q[1])return r;return Object.assign({},r,{can:false,locked:q,desc:`Learned at ${skName(q[0])} level ${q[1]} (you’re ${skLvl(q[0])}). `+(r.desc||'')});};
const brewRow=(k,name,desc,need,produce,btn,out)=>({k,name,desc,price:0,btn,need:need&&Object.keys(need).length?need:undefined,produce,can:true,buy(){if(produce)takeProduce(produce);addInv(out||k,1);updateHud&&updateHud();}});
vendors.b_brew={name:'Brew kettle',sub:'Grandpa’s mash bill is chalked on the firebox. Under it, in another hand: NEVER ON A NIGHT WITH NO MOON.',rows:()=>[
  brewRow('wort_ale','Ale wort','3 barley and 1 hops: crack the grain, hold the mash warm, run it off, boil in the hops. Burns 2 wood. Then into a keg.',{wood:2},{barley:3,hops:1},'Brew'),
  brewRow('wort_pump','Pumpkin ale wort','2 barley, 1 pumpkin and 1 hops. Burns 2 wood. Four days in a keg.',{wood:2},{barley:2,pumpkin:1,hops:1},'Brew'),
  brewRow('mash_corn','Corn mash','3 corn and 1 barley, ground and cooked. Burns 2 wood. A keg makes it wash for the still.',{wood:2},{corn:3,barley:1},'Mash'),
  brewRow('mash_potato','Potato mash','4 potatoes and 1 barley, cooked to a paste. Burns 2 wood. A keg makes it wash for the still.',{wood:2},{potato:4,barley:1},'Mash')].map(r=>brewLock('b_brew',r))};
vendors.b_press={name:'Fruit press',sub:'The oak is stained purple to the grain. It smells of September, which this valley hasn’t had in a long time.',rows:()=>[
  brewRow('must_grape','Grape must','4 bunches of grapes: crush them, turn the screw, strain the skins. Five days in a keg makes wine.',{},{grapes:4},'Press')].map(r=>brewLock('b_press',r))};
vendors.b_still={name:'Copper still',sub:'The worm in the tub is older than the farm. Somebody scratched a tally into the copper and stopped at forty.',rows:()=>[
  brewRow('white_dog','White dog','1 corn wash and 1 coal: keep the pot just under the boil, catch the hearts in the jar. Six days in an oak cask makes whiskey.',{wash_corn:1,coal:1},null,'Run it'),
  brewRow('vodka','Potato vodka','1 potato wash and 2 coal (one to fire it, one to filter through).',{wash_potato:1,coal:2},null,'Run it'),
  brewRow('hollow_gin','Hollow gin','1 vodka run back through the still with 2 glowcaps.',{vodka:1,coal:1},{mushroom:2},'Run it')].map(r=>brewLock('b_still',r))};
// kegs and casks are made at the furniture bench
{const _rf=vendors.b_furn.rows;vendors.b_furn.rows=()=>{const r=_rf();
  r.push(brewLock('b_furn',{k:'brew_keg',name:'Keg',desc:'Staves, two iron hoops and a tap. Set it down on the farm to ferment wort, must and mash.',price:0,btn:'Make',need:{wood:18,iron_bar:1},can:true,buy(){addInv('brew_keg',1);}}),
    brewLock('b_furn',{k:'brew_cask',name:'Oak cask',desc:'A charred oak cask for ageing spirit and wine. Set it down on the farm.',price:0,btn:'Make',need:{wood:30,iron_bar:2},can:true,buy(){addInv('brew_cask',1);}}));return r;};}
// ---- the making games. The press and the quern are the crank in new clothes (steady circles), drawn for the job
{const _ck=S4.crank;S4.crank=(sp,K)=>{const o=_ck(sp,K);if(sp.look!=='press'&&sp.look!=='quern')return o;const st=o.st;
  o.how=(sp.look==='press'?'Turn the press bar round: draw circles':'Turn the quern by its handle: draw circles')+(K.fine?' with the mouse (or hold Space)':' with your finger')+' at an even, steady pace. Too fast '+(sp.look==='press'?'and the basket splits.':'and the grain flies.');
  o.draw=function(t){const g=K.g,n=st.coils.length,N=sp.n||14,cx=160,cy=96,f=Math.min(1,n/N);
    if(sp.look==='press'){const O=CA_P.oak,I=CA_P.iron;
      K.px(cx-70,126,140,8,O[3]);K.px(cx-70,126,140,2,O[5]);K.px(cx-70,133,140,2,O[1]);                       // the tray
      for(const px_ of [cx-62,cx+56]){K.px(px_,28,7,98,O[2]);K.px(px_,28,2,98,O[4]);}K.px(cx-66,22,134,10,O[3]);K.px(cx-66,22,134,3,O[5]);   // the frame
      const top=70+f*22;for(let x=-36;x<=36;x+=6){K.px(cx+x-2,top,5,126-top,O[x<0?4:2]);}                    // the slatted basket, sinking as it presses
      for(let x=-34;x<=34;x+=6)for(let y=top+3;y<124;y+=5)K.px(cx+x+2,y,2,2,y%10<5?'#6a2e78':'#9a5ab0');
      K.px(cx-40,top-6,80,6,O[3]);K.px(cx-40,top-6,80,2,O[5]);                                               // the pressing board
      K.px(cx-3,30,6,top-36,I[3]);for(let y=32;y<top-6;y+=4)K.px(cx-3,y,6,1,I[5]);                            // the screw
      const bx=Math.cos(st.ang)*44,by=Math.sin(st.ang)*6;K.line(cx-bx,40-by,cx+bx,40+by,I[4],4);m4hand(K,cx+bx,40+by);
      const flow=Math.min(1,st.spd/6)*(n<N?1:0);if(flow>.05){K.px(cx+72,128,4,2,'#5a1a50');for(let y=130;y<150;y+=2)K.px(cx+74,y,2,2,'#7a2a6a');}
      K.px(cx+66,146,18,18,CA_P.clay?CA_P.clay[3]:'#a85a32');K.px(cx+68,148+(1-f)*12,14,Math.max(1,f*12),'#4a1440');}
    else{const S=CA_P.stone;K.ell(cx,cy+22,56,14,'#2a2420');for(let y=0;y<14;y++)K.px(cx-52+y*.2,cy+8+y,104-y*.4,1,S[y<3?5:y<10?3:2]);   // the bottom stone
      K.ell(cx,cy+6,50,12,S[4]);K.ell(cx,cy+4,46,10,S[5]);K.ell(cx,cy+4,8,3,'#3a3028');                          // the turning top stone and its eye
      for(let i=0;i<Math.max(0,10-n);i++)K.px(cx-4+(i*7)%9,cy-2-(i%3)*3,2,2,'#e6c87a');                        // grain trickling into the eye
      const hx=cx+Math.cos(st.ang)*38,hy=cy+4+Math.sin(st.ang)*9;K.px(hx-3,hy-22,6,22,CA_P.wood[4]);K.px(hx-3,hy-22,2,22,CA_P.wood[5]);m4hand(K,hx,hy-20);
      const heap=Math.round(f*16);for(let i=0;i<heap;i++)K.px(cx+56+(i%6)*3-(i>>2),cy+30-(i>>1),4,3,i%3?'#d8b468':'#b08a40');}};
  return o;};}
// the still: the simmer game (keep the heat in the band) with a copper head on the pot and the swan neck running to the jar
{const _sm=S4.simmer;S4.simmer=(sp,K)=>{const o=_sm(sp,K);if(sp.look!=='still')return o;const d0=o.draw;
  o.draw=function(t){d0.apply(this,arguments);const g=K.g,C=CA_P.copper||['#4a1e10','#7a3418','#a8522a','#cc7440','#e89a62','#f6c08e'];
    for(let y=-12;y<=0;y++){const w=Math.round(28*Math.sqrt(1-(y/13)**2));for(let x=-w;x<=w;x++){const l=-x/w*.6-(y+6)/12*.5;K.px(160+x,70+y,1,1,C[Math.max(0,Math.min(C.length-1,Math.round(2.4+l*2.6)))]);}}   // the copper dome on the pot
    for(let y=-9;y<=9;y++){const w=Math.round(9*Math.sqrt(Math.max(0,1-(y/9.5)**2)));for(let x=-w;x<=w;x++){const l=-x/9-y/9;K.px(160+x,48+y,1,1,C[Math.max(0,Math.min(C.length-1,Math.round(2.5+l*1.8)))]);}}
    K.px(158,56,5,6,C[2]);K.px(158,56,2,6,C[4]);
    const pts=[[167,44],[200,38],[240,40],[278,52],[286,70],[286,98]];for(let i=0;i<pts.length-1;i++){K.line(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],C[3],4);K.line(pts[i][0],pts[i][1]-1,pts[i+1][0],pts[i+1][1]-1,C[5],1);}
    const drip=(t*2.2)%1;K.px(285,100+drip*12,2,3,'#d8eef4');
    K.px(276,112,20,22,'#2a3640');K.px(276,112,2,22,'#c4d4e0');K.px(294,112,2,22,'#5a6a78');K.px(278,124,16,10,'#b8c8c0');K.px(276,110,20,3,CA_P.iron?CA_P.iron[4]:'#6f7480');};
  return o;};}
const BG=(scene,steps,icon)=>({scene,reveal:m4ico(icon),steps});
const WORT=['#6e3810','#a8641e'],CORNC=['#c89e3c','#e6c260'],POTC=['#c4b892','#e2d8b6'],GRAPEC=['#4a1a52','#7a3a88'],CLEARC=['#c8d8dc','#eef6f6'];
Object.assign(MG4R,{
  'b_brew:wort_ale':BG('kitchen',[{k:'crank',t:'Crack the barley in the quern',look:'quern',n:10},{k:'simmer',t:'Hold the mash warm, not hot',scene:'stove',col:CORNC,lo:.42,hi:.6,bits:['#e6c87a','#c8a050']},{k:'sieve',t:'Run the wort off the grain'},{k:'simmer',t:'Boil it hard and drop in the hops',scene:'stove',col:WORT,lo:.66,hi:.86,adds:[{at:2.6,icon:'hops'}],bits:['#e8d8a8','#7aa040']}],'wort_ale'),
  'b_brew:wort_pump':BG('kitchen',[{k:'scoop',t:'Scoop out the pumpkin',n:20},{k:'crank',t:'Crack the barley in the quern',look:'quern',n:8},{k:'simmer',t:'Boil it with the hops',scene:'stove',col:['#a8501a','#d87a2a'],lo:.62,hi:.84,adds:[{at:2.2,icon:'pumpkin'},{at:4.8,icon:'hops'}],bits:['#f0c070','#7aa040']}],'wort_pump'),
  'b_brew:mash_corn':BG('kitchen',[{k:'crank',t:'Grind the corn in the quern',look:'quern',n:12},{k:'simmer',t:'Cook the mash low and slow',scene:'stove',col:CORNC,lo:.5,hi:.7,slow:.8,adds:[{at:3,icon:'barley'}],bits:['#f4dc84','#b08a40']}],'mash_corn'),
  'b_brew:mash_potato':BG('kitchen',[{k:'chop',t:'Chop the potatoes',veg:['potato','potato','potato']},{k:'simmer',t:'Cook them to a paste',scene:'stove',col:POTC,lo:.5,hi:.7,slow:.8,adds:[{at:3,icon:'barley'}],bits:['#f2ecd4','#a89a74']}],'mash_potato'),
  'b_press:must_grape':BG('barn',[{k:'crank',t:'Turn the press screw down',look:'press',n:14},{k:'sieve',t:'Strain out the skins',look:'rinse'},{k:'pour',t:'Run the must into the jug',col:GRAPEC,bowl:'wood',line:.75}],'must_grape'),
  'b_still:white_dog':BG('stove',[{k:'simmer',t:'Keep the still just under the boil',scene:'stove',look:'still',col:CORNC,lo:.6,hi:.72,bits:['#f4dc84']},{k:'pour',t:'Catch the hearts in the jar, stop at the line',col:CLEARC,bowl:'flask',line:.75},{k:'cork',t:'Lid it',col:CLEARC}],'white_dog'),
  'b_still:vodka':BG('stove',[{k:'simmer',t:'Keep the still just under the boil',scene:'stove',look:'still',col:POTC,lo:.6,hi:.72,bits:['#f2ecd4']},{k:'sieve',t:'Filter it through the charcoal',look:'rinse'},{k:'pour',t:'Bottle it to the line',col:CLEARC,bowl:'flask',line:.8},{k:'cork',t:'Cap it',col:CLEARC}],'vodka'),
  'b_still:hollow_gin':BG('stove',[{k:'chop',t:'Chop the glowcaps',veg:['shroom','shroom']},{k:'simmer',t:'Run the vodka back over them, gently',scene:'stove',look:'still',col:['#5aa884','#a6dcc8'],lo:.55,hi:.68,adds:[{at:2.4,icon:'mushroom'}],bits:['#c0ecd4','#f0fce0']},{k:'pour',t:'Bottle it while it still glows',col:['#5aa884','#c0ecd4'],bowl:'flask',line:.8},{k:'cork',t:'Cork it',col:['#5aa884','#c0ecd4']}],'hollow_gin'),
  'b_furn:brew_keg':BG('workshop',[{k:'saw',t:'Cut the staves',n:8,seed:52},{k:'plane',t:'Bevel their edges',seed:9},{k:'hammer',t:'Drive the hoops down',n:4}],'in_keg'),
  'b_furn:brew_cask':BG('workshop',[{k:'saw',t:'Cut the oak staves',n:10,seed:61},{k:'hammer',t:'Drive the hoops down',n:5},{k:'light',t:'Char the inside',look:'lantern'}],'cask_oak'),
  'build:bench_brew':BG('yard',[{k:'drop',t:'Lay the firebox stones',item:'brick',n:6},{k:'hammer',t:'Rivet the kettle’s seams',n:4},{k:'level',t:'Set the kettle level',look:'post'}],'bench_brew'),
  'build:bench_press':BG('workshop',[{k:'saw',t:'Saw the oak frame',n:9,seed:33},{k:'hammer',t:'Peg the frame together',n:4},{k:'crank',t:'Thread the iron screw',look:'press',n:8}],'bench_press'),
  'build:bench_still':BG('forge',[{k:'anvil',t:'Raise the copper pot',shape:'blade'},{k:'crank',t:'Wind the copper worm',n:14},{k:'drop',t:'Lay the firebox bricks',item:'brick',n:6}],'bench_still')});
for(const k of Object.keys(MG4R))if(/^(b_brew|b_press|b_still):|^b_furn:brew_|^build:bench_(brew|press|still)$/.test(k)&&!CG3_RECIPES[k])CG3_RECIPES[k]={brew:k};
// ---- kegs and casks on the farm: set down by holding them, they work while you sleep
S.kegs=S.kegs||[];
const KEG={brew_keg:{spr:'in_keg',w:1.2,d:.45,name:'keg',rules:{wort_ale:['ale',3],wort_pump:['pumpkin_ale',4],must_grape:['wine',5],mash_corn:['wash_corn',2],mash_potato:['wash_potato',2]},verb:'ferments'},
  brew_cask:{spr:'cask_oak',w:.9,d:.4,name:'oak cask',rules:{white_dog:['whiskey',6],wine:['old_wine',7]},verb:'ages',up:1}};
const KEGW={made:[]};
function kegSync(){for(const m of KEGW.made){for(const o of m.objs){o.hide=true;const i=OBJ.indexOf(o);if(i>=0)OBJ.splice(i,1);}for(const r of m.rects){const i=rects.indexOf(r);if(i>=0)rects.splice(i,1);}
    for(const it of m.its){const i=interact.indexOf(it);if(i>=0)interact.splice(i,1);}}KEGW.made=[];
  for(const k of S.kegs){const D=KEG[k.t];if(!D)continue;const o=obj(SPR[D.spr]?D.spr:'in_keg',k.x,k.z,{kind:'prop'});const r0=rects.length;addRect(k.x-D.w/2,k.z-D.d,k.x+D.w/2,k.z);
    const it={x:k.x,z:k.z+.35,r:1.0,label:()=>kegLabel(k),ok:()=>true,act(){kegAct(k);}};interact.push(it);KEGW.made.push({k,objs:[o],rects:rects.slice(r0),its:[it]});}}
const kegReady=k=>k.f&&S.day>=k.f.d;
function kegLabel(k){const D=KEG[k.t];if(!k.f)return `Fill the ${D.name}`;const nm=ITEMS[k.f.o].name;if(kegReady(k))return `Draw the ${nm.toLowerCase()}`;const left=k.f.d-S.day;return `${nm}: ${left} ${left===1?'day':'days'}`;}
function kegAct(k){const D=KEG[k.t];
  if(k.f&&kegReady(k)){const q=Math.min(3,(k.f.q||0)+(D.up||0));addInv(k.f.o,1);if(typeof iqAdd==='function')iqAdd(k.f.o,q,1);const nm=ITEMS[k.f.o].name;k.f=null;kegSync();
    SFX.refill&&SFX.refill();toast(`${nm}${q?' '+'★'.repeat(q):''}. ${D.up?'It went in plainer than it came out.':'It smells right.'}`,2.2);if(typeof addXP==='function')addXP('farming',6);return;}
  if(k.f){toast(`The ${D.name} ${D.verb}. ${ITEMS[k.f.o].name} on day ${k.f.d}. ${D.up?'It ticks as the wood breathes.':'It bubbles at the bung.'}`,2.4);return;}
  const can=Object.keys(D.rules).filter(i=>inv(i)>0);
  let h=`<p class="date">The ${D.name}</p><p>${D.up?'Spirit and wine go in; a week later they come out a grade better.':'Pour in what you brewed or pressed. It takes a few days.'}</p>`;
  for(const [i,[o,days]] of Object.entries(D.rules)){const have=inv(i);h+=`<div style="display:flex;align-items:center;gap:8px;margin:5px 0;${have?'':'opacity:.5'}"><img src="${iconOf(ITEMS[i].icon)}" width="28" height="28" style="image-rendering:pixelated" alt=""><span style="flex:1">${ITEMS[i].name} → ${ITEMS[o].name}, ${days} days <small>(${have})</small></span>${have?`<button class="btn" data-fill="${i}">Fill</button>`:''}</div>`;}
  h+=`<p style="margin-top:10px"><button class="chip" id="kegLift">Pick it up</button></p>`;
  openNote(h,can.length?'Not now':'Close');
  $('noteText').querySelectorAll('button[data-fill]').forEach(b=>b.onclick=()=>{const i=b.dataset.fill;if(inv(i)<1)return;const q=typeof iqTakeBest==='function'?iqTakeBest(i):0;takeInv(i,1);
    const [o,days]=D.rules[i];k.f={i,o,d:S.day+days,q};kegSync();$('note').hidden=true;S.paused=false;SFX.refill&&SFX.refill();toast(`In it goes. ${ITEMS[o].name} in ${days} days.`,2);});
  const lb=$('kegLift');if(lb)lb.onclick=()=>{const j=S.kegs.indexOf(k);if(j>=0)S.kegs.splice(j,1);addInv(k.t,1);kegSync();$('note').hidden=true;S.paused=false;toast(`The ${D.name} is back in your bag.`,1.6);};}
// holding a keg or cask out on the farm shows where it goes (the same placing as the benches)
function startKegPlace(id,key){const D=KEG[id];startPlace({spr:SPR[D.spr]?D.spr:'in_keg',w:D.w,d:D.d,name:D.name,held:key,cancel(){},
  done(x,z){if(inv(id)<1)return;takeInv(id,1);S.kegs.push({t:id,x,z,f:null});kegSync();SFX.thud&&SFX.thud(0,.3);toast(`The ${D.name} is set down. ${id==='brew_keg'?'Fill it with wort, must or mash.':'Fill it with white dog or wine.'}`,2.4);}});}
{const _ht=heldTick;heldTick=function(){_ht.apply(this,arguments);try{if(S.mode!=='play'||S.paused||PLACE.on||S.room)return;const it=selectedItem();
  if(!it||it.type!=='I'||!KEG[it.id]||inv(it.id)<=0||HELD.skip===it.key)return;startKegPlace(it.id,it.key);}catch(e){}};}
{const _ii=itemInfo;itemInfo=function(key){const o=_ii.apply(this,arguments);if(o&&o.type==='I'&&KEG[o.id])o.desc+=' Pick it on your toolbar to hold it.';return o;};}
// working and ready, at a glance: bubbles at the bung while it works, a slow glint when it's ready
{const _hd=holdDraw;holdDraw=function(){_hd.apply(this,arguments);try{if(S.room)return;const t=performance.now()/1000;
  for(const k of S.kegs){if(!k.f)continue;const X=Math.round(sx(k.x)),Y=Math.round(sz(k.z)),D=KEG[k.t];const top=Y-(k.t==='brew_keg'?24:30);
    if(kegReady(k)){const b=Math.round(Math.sin(t*3)*1.5);ctx2.fillStyle='#2a1a08';ctx2.fillRect(X-2,top-9+b,5,5);ctx2.fillStyle='#ffd870';ctx2.fillRect(X-1,top-8+b,3,3);ctx2.fillStyle='#fff6d0';ctx2.fillRect(X-1,top-8+b,1,1);}
    else for(let i=0;i<3;i++){const u=((t*.6+i/3)%1);ctx2.globalAlpha=.75*(1-u);ctx2.fillStyle=D.up?'#d8c8a8':'#f0e6c8';ctx2.fillRect(X+(i-1)*2+Math.round(Math.sin(t*2+i)*1),top-2-Math.round(u*9),i===1?2:1,i===1?2:1);}
    ctx2.globalAlpha=1;}}catch(e){ctx2.globalAlpha=1;}};}
// the morning after something finishes, you hear about it
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);try{const ready=S.kegs.filter(k=>k.f&&S.day===k.f.d);if(ready.length){const names=[...new Set(ready.map(k=>ITEMS[k.f.o].name.toLowerCase()))];
  setTimeout(()=>toast(`Ready this morning: ${names.join(', ')}. Draw it off at the ${ready.some(k=>k.t==='brew_cask')?'cask':'keg'}.`,4),4200);}}catch(e){}return r;};}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);try{S.kegs=S.kegs||[];kegSync();}catch(e){}return r;};}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{KEGW.made=[];if(S.kegs&&S.kegs.length)kegSync();}catch(e){}return r;};}
// ---- drinking: a little energy, a while tipsy (the world sways), and Hollow gin pushes the dark back
S.tipsy=S.tipsy||0;
{const _eat=eat;eat=function(e,h,name){const k=DRINKS.find(q=>ITEMS[q].name===name);if(!k)return _eat.apply(this,arguments);const D=BREW_ITEMS[k];
  S.tipsy=Math.min(150,(S.tipsy||0)+D.drink*30);
  if(k==='hollow_gin'&&typeof M!=='undefined'&&typeof M.v==='number')M.v=Math.max(0,M.v-18);
  const line={ale:'The ale goes down warm',pumpkin_ale:'It tastes like the harvest supper',wine:'Dark and young',old_wine:'Deep and quiet, like a cellar',white_dog:'It burns all the way down',whiskey:'Oak and smoke and October',vodka:'Cold as the creek',hollow_gin:'It glows going down. The dark steps back'}[k]||'You drink it';
  return _eat.call(this,e,h,line+(S.tipsy>90?'. The ground is less sure of itself':''));};}
{const _hu=hotbarUse;hotbarUse=function(k){if(k!=='food')return _hu.apply(this,arguments);const saved={};for(const d of DRINKS){saved[d]=ITEMS[d].food;delete ITEMS[d].food;}
  try{return _hu.apply(this,arguments);}finally{for(const d in saved)ITEMS[d].food=saved[d];}};}   // the quick-eat button never reaches for a bottle
{const _u=update;update=function(dt){_u(dt);if(S.tipsy>0){S.tipsy=Math.max(0,S.tipsy-dt);const a=Math.min(1,S.tipsy/60),t=performance.now()/1000;
    view.style.transform=S.tipsy>0?`rotate(${(Math.sin(t*.7)*.6*a).toFixed(3)}deg) translateX(${(Math.sin(t*1.1)*3*a).toFixed(2)}px)`:'';}else if(view.style.transform)view.style.transform='';};}
// "Drink", not "Eat", on a bottle
new MutationObserver(()=>{const T=$('invTip');if(!T)return;const b=T.querySelector('[data-eat]');if(!b||b.textContent==='Drink')return;const it=itemInfo(S.slots[+b.dataset.eat]);if(it&&DRINKS.includes(it.id))b.textContent='Drink';}).observe(document.body,{childList:true,subtree:true});
// ---- they sell: the inn buys drink in the compete market, and the farming skill counts what you brew
if(typeof MK_K!=='undefined'){Object.assign(MK_K,{ale:12,pumpkin_ale:10,wine:8,old_wine:5,white_dog:8,whiskey:5,vodka:8,hollow_gin:4});
  const L=MK_BUYERS.find(b=>b[0]==='The Lamplighter');if(L)L[1].push('ale','pumpkin_ale','wine','old_wine','whiskey','white_dog','vodka','hollow_gin');}
