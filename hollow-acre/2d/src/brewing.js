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
// ---- the making games: the press and the quern are the crank in new clothes (steady circles), drawn for the job (below)
// ---- (t382) the copper still, drawn as the station you built (brick firebox, onion pot, ball head, swan neck, worm tub, the jar under
// the worm's tap). The run is still the simmer game (hold for more draught, keep the heat in the green); what changed is what you see
// and hear: the fire in the firebox door answers your hand on the draught lever, the head chatters and steam spits at the seam when it
// runs too hot, the worm's tap drips clear spirit into the jar (faster as it heats, a cloudy stream when it boils, nothing when it's cold)
// and the jar fills as the run goes. The bench work after it (chop, filter, bottle, cork) happens at a bench in the same still house.
const ALC={};
{const C=CA_P.copper,I=CA_P.iron,O=CA_P.oak,B=CA_P.brick,BR=CA_P.brass,G=CA_P.glass,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  const LN=Math.hypot(-.56,-.62,.55),Lx=-.56/LN,Ly=-.62/LN,Lz=.55/LN;
  // a lathe-turned body (radius rf(y) on each row), lit from the top left in toon bands, with a hard specular spot
  ALC.lathe=(K,cx,y0,y1,rf,P,o)=>{o=o||{};const n=P.length,amb=o.amb!=null?o.amb:1,rng=o.rng||(n-2.6);
    for(let y=y0;y<=y1;y++){const r=rf(y);if(r<=0)continue;const rp=rf(y+.5)-rf(y-.5),R=Math.round(r);
      for(let x=-R;x<=R;x++){const s=x/(r+.35);if(Math.abs(s)>1)continue;const c=Math.sqrt(1-s*s);let nx=s,ny=-rp,nz=c;const nl=Math.hypot(nx,ny,nz);nx/=nl;ny/=nl;nz/=nl;
        const d=Math.max(0,nx*Lx+ny*Ly+nz*Lz),spc=Math.pow(Math.max(0,2*d*nz-Lz),o.shin||10);let k=Math.round(amb+d*rng);
        if(o.metal){k-=Math.round(Math.max(0,ny)*3.2+Math.max(0,s-.35)*2.2);if(Math.abs(s+.42)<.07&&ny<.35)k=n-1;else if(Math.abs(s+.42)<.14&&ny<.35)k=Math.max(k,n-2);if(Math.abs(s-.62)<.05)k=Math.max(k,3);}
        if(spc>.55)k=n-1;else if(spc>.25)k=Math.max(k,n-2);if(o.dark&&s>.55&&ny>-.2)k=Math.min(k,o.dark);K.px(cx+x,y,1,1,P[cl(k,0,n-1)]);}}};
  // the copper pot: an onion on the firebox, a riveted seam round its belly, the brass flange its head sits on
  const potR=y=>{const t=(y-64)/48;if(t<0||t>1.02)return 0;if(t<.6)return 8+28*Math.pow(Math.sin(Math.PI/2*t/.6),.85);const u=(t-.6)/.4;return 36-10*Math.pow(u,1.6);};
  ALC.pot=()=>M4.pre('alc_pot',84,56,(k,g)=>{ALC.lathe(k,42,4,52,y=>potR(y+60),C,{amb:1.1,shin:12,dark:2});
      for(let x=-35;x<=35;x++){const r=potR(88),s=x/r;if(Math.abs(s)>=1)continue;const y=28+Math.round(2.5*Math.sqrt(1-s*s));k.px(42+x,y,1,1,C[x<-10?3:2]);if((x+36)%6===0&&Math.abs(s)<.93){k.px(42+x,y-1,1,1,C[x<0?7:5]);}}
      // the flange the head sits on
      for(let x=-9;x<=9;x++){const s=x/9;k.px(42+x,2,1,3,BR[x<-4?6:x<3?5:x<7?4:3]);}k.px(33,2,19,1,BR[7]);k.px(33,5,19,1,BR[1]);
      // the filling port on the left shoulder, its brass plug in
      k.px(20,14,7,2,BR[5]);k.px(20,14,7,1,BR[7]);k.px(21,12,5,2,BR[4]);k.px(21,12,5,1,BR[6]);
      M4.outline(k.g.canvas,C[0]);});
  // the head: a ball on a short neck (it lifts off at the flange)
  ALC.head=()=>M4.pre('alc_head',30,34,(k,g)=>{ALC.lathe(k,15,1,25,y=>{const d=y-13;return Math.sqrt(Math.max(0,144-d*d));},C,{amb:1.2,shin:14});
      ALC.lathe(k,15,24,32,y=>5.2,C,{amb:1.1});M4.outline(k.g.canvas,C[0]);});
  // the thermometer on the head: a brass dial, green where the run is good
  ALC.dial=(K,x,y,v,lo,hi)=>{const g=K.g;K.ball(x,y,5,BR);K.ell(x,y,4,4,'#f4ead0');g.strokeStyle='#3a7a28';g.lineWidth=1.4;g.beginPath();const a=v=>Math.PI*.75+v*Math.PI*1.5;g.arc(x,y,3,a(lo),a(hi));g.stroke();
    const av=a(cl(v,0,1));K.line(x,y,x+Math.cos(av)*3.6,y+Math.sin(av)*3.6,'#2a0e06',1);K.px(x,y,1,1,'#2a0e06');};
  // the swan neck from the head to the worm tub, tapering, lit along its upper side
  ALC.arm=(K,pts,w0,w1)=>{const L=pts.length-1;const seg=(f,c,off)=>{for(let i=0;i<L;i++){const [ax,ay]=pts[i],[bx,by]=pts[i+1];const dx=bx-ax,dy=by-ay,l=Math.hypot(dx,dy)||1;let nx=-dy/l,ny=dx/l;if(nx+ny>0){nx=-nx;ny=-ny;}
        const W=w0+(w1-w0)*(i/L),o=off*(W/2-.5);K.line(ax+nx*o,ay+ny*o,bx+nx*o,by+ny*o,c,f(W));}};
    seg(W=>W+2,C[0],0);seg(W=>W,C[3],0);seg(()=>1,C[2],-1);seg(()=>1,C[5],.75);seg(()=>1,C[6],.4);};
  // the worm tub: an oak barrel of water, iron hoops, the coil's top showing under the surface, a tap low on its front
  ALC.tub=()=>M4.pre('alc_tub',54,82,(k,g)=>{const cx=27,top=6,bot=78;
      for(let y=top;y<=bot;y++){const u=(y-top)/(bot-top),r=23+2.2*Math.sin(Math.PI*u);for(let x=-Math.round(r);x<=Math.round(r);x++){const s=x/r;if(Math.abs(s)>1)continue;const th=Math.asin(s),c=Math.cos(th);
          const d=Math.max(0,s*Lx+c*Lz*1.05);let kk=Math.round(1.2+d*4.2);const st=Math.round((th+Math.PI/2)/(Math.PI/7)*100)%100;if(st<9&&Math.abs(s)<.97)kk=1;if(y>bot-6)kk=Math.max(1,kk-1);k.px(cx+x,y,1,1,O[cl(kk,0,6)]);}}
      for(const hy of [14,42,68]){for(let x=-25;x<=25;x++){const r=23+2.2*Math.sin(Math.PI*(hy-top)/(bot-top))+.8,s=x/r;if(Math.abs(s)>1)continue;const yy=hy+Math.round(2*Math.sqrt(1-s*s));const d=Math.max(0,s*Lx+Math.sqrt(1-s*s)*Lz);
          k.px(cx+x,yy,1,1,I[cl(Math.round(2+d*3.6),1,6)]);k.px(cx+x,yy+1,1,1,I[cl(Math.round(1.4+d*3),1,5)]);k.px(cx+x,yy+2,1,1,I[1]);}}
      // the rim, the dark water, the coil under it, the moon on the water
      k.ell(cx,top,24,6,O[2]);k.ell(cx,top,23,5,O[5]);k.ell(cx,top+.5,21,4,O[1]);k.ell(cx,top+1,20,3.4,'#16262c');k.ell(cx+2,top+1.6,12,1.6,'#24404a');
      for(let a=Math.PI*.15;a<Math.PI*.95;a+=.05)k.px(cx+Math.cos(a)*14,top+1.5+Math.sin(a)*2.3,1,1,C[2]);k.px(cx-12,top-1,9,1,'#5a7a84');k.px(cx-9,top,4,1,'#8aa4ac');
      k.px(cx-23,top-1,6,1,O[6]);
      M4.outline(k.g.canvas,O[0]);
      // the tap: a copper collar, a short spout bent down, a brass key on top
      k.px(cx-5,32,8,4,C[2]);k.px(cx-5,32,8,1,C[5]);k.px(cx-5,35,8,1,C[1]);k.px(cx-2,35,3,6,C[3]);k.px(cx-2,35,1,6,C[5]);k.px(cx-2,40,3,1,C[1]);
      k.px(cx-4,29,7,2,BR[5]);k.px(cx-4,29,7,1,BR[7]);k.px(cx-1,30,1,2,BR[3]);});
  // a mason jar on the floor catching the run: dark glass, pale edges, one glint, the spirit a bright line over a step-paler fill
  ALC.jar=(K,x,base,lv,col,glow,cloud)=>{const g=K.g,w=16,h=20,top=base-h;K.pa(x-w/2-1,base,w+4,2,'#000',.4);K.pa(x-w/2,top+3,w,h-3,'#0c1418',.42);
    const fh=Math.round((h-5)*cl(lv,0,1));if(fh>0){K.px(x-w/2+1,base-fh,w-2,fh,col[0]);K.px(x-w/2+1,base-fh,w-2,1,col[1]);if(cloud>0)K.pa(x-w/2+1,base-fh,w-2,fh,'#e8e0c8',cloud*.55);if(glow)K.glow(x,base-fh/2,14,glow,.35);}
    K.px(x-w/2,top+3,1,h-3,G[4]);K.px(x+w/2-1,top+3,1,h-3,G[1]);K.px(x-w/2,base-1,w,1,G[2]);K.px(x-w/2+1,top+2,w-2,1,G[3]);
    K.px(x-w/2+2,top,w-4,3,G[2]);K.px(x-w/2+2,top,w-4,1,G[4]);K.px(x-w/2+2,top+2,w-4,1,G[1]);K.px(x-w/2+2,top+5,2,8,G[5]);K.px(x-w/2+2,top+14,1,2,G[4]);};
  // the brick firebox under the pot: a fire door (open, its door swung aside), an ash pit, the iron plate the pot sits in
  ALC.firebox=()=>M4.pre('alc_firebox',116,74,(k,g)=>{const X=4,Y=6,W=108,H=64;
      for(let y=0;y<H;y++){const row=(y/5)|0,off=row%2?5:0;for(let x=0;x<W;x++){const bx=((x+off)/11)|0,inB=(x+off)%11,inR=y%5;const n=k.H32(bx,row,23);let kk=n>.7?3:n>.3?2:1;
          if(inR===4||inB===10){k.px(X+x,Y+y,1,1,'#1a0c08');continue;}if(inR===0||inB===0)kk++;if(inR===3||inB===9)kk--;if(x>W-14)kk--;if(x<10)kk++;k.px(X+x,Y+y,1,1,B[cl(kk,0,5)]);}}
      // soot over the mouth
      for(let y=0;y<26;y++)for(let x=30;x<78;x++){const d=Math.hypot((x-54)/24,(y-24)/22);if(d<1&&k.H32(x,y,5)<.85-d*.6)k.pa(X+x,Y+y,1,1,'#120806',.55*(1-d));}
      // the mouth: an iron frame round a dark hollow, grate bars at its foot
      const mx=X+36,my=Y+14,mw=36,mh=28;k.px(mx-3,my-3,mw+6,mh+6,I[1]);k.px(mx-3,my-3,mw+6,1,I[5]);k.px(mx-3,my-2,1,mh+5,I[4]);k.px(mx-2,my-2,mw+4,mh+4,I[3]);k.px(mx,my,mw,mh,'#120604');
      for(const rx of [mx-2,mx+mw+1])for(const ry of [my-1,my+mh])k.px(rx,ry,1,1,I[6]);
      // the door hanging open to the right, seen edge on
      k.px(mx+mw+3,my-1,5,mh+2,I[2]);k.px(mx+mw+3,my-1,1,mh+2,I[5]);k.px(mx+mw+7,my-1,1,mh+2,I[0]);for(const ry of [my+4,my+mh-6])k.px(mx+mw+2,ry,2,3,I[4]);
      // the ash pit under it
      k.px(mx+4,Y+H-9,mw-8,6,'#0e0604');k.px(mx+3,Y+H-10,mw-6,1,I[3]);k.px(mx+3,Y+H-3,mw-6,1,I[4]);
      // the plate on top, its ring round the pot
      k.px(0,0,116,7,I[3]);k.px(0,0,116,1,I[6]);k.px(0,1,116,1,I[5]);k.px(0,6,116,1,I[1]);k.px(0,7,116,2,'#000000');k.pa(0,7,116,2,'#000',.5);});
  ALC.plateLip=(K,x)=>{K.px(x,106,116,3,I[3]);K.px(x,106,116,1,I[5]);K.px(x,108,116,1,I[1]);};
  // the hearts on the floor: a sack of cracked corn, a coal scuttle, split logs
  const sack=ALC.sack=k=>{const S=['#2a2014','#463822','#625034','#7c6a48','#968460','#b0a07c'];for(let y=0;y<40;y++){const w=Math.round(15+Math.sin(Math.min(1,y/30)*Math.PI*.6)*3+(y>34?-(y-34)*.6:0));for(let x=-w;x<=w;x++){const s=x/w;let kk=Math.round(1.5+Math.max(0,-s*.7+.5)*3.2);if(k.H32(x>>2,y>>3,7)>.8)kk--;k.px(18+x,6+y,1,1,S[cl(kk,0,5)]);}}
    for(let x=-15;x<=15;x++){k.px(18+x,6,1,3,S[x<-5?5:4]);k.px(18+x,9,1,1,S[1]);}for(let i=0;i<26;i++){const x=6+(i*7)%24,y=3-((i*3)%4);k.px(x,y+((x+i)%3===0?1:0),2,2,i%3?'#e6c260':'#c89e3c');k.px(x,y,1,1,'#f6dc84');}
    for(let y=14;y<40;y+=6)k.px(10+(y%4),y,8,1,S[2]);};
  const scuttle=k=>{for(let y=0;y<16;y++){const w=12-Math.round(y*.15);for(let x=-w;x<=w;x++)k.px(14+x,6+y,1,1,I[cl(Math.round(1.6+Math.max(0,-x/w*.8+.4)*3)-(y>12?1:0),0,6)]);}k.px(2,6,25,2,I[5]);k.px(2,6,25,1,I[6]);
    for(let i=0;i<9;i++){const x=4+i*2.4,y=2+(i%3);k.px(x,y,4,4,'#141416');k.px(x,y,2,1,'#4a4c56');}};
  const crate=k=>{const W=CA_P.wood;for(let y=0;y<17;y++)for(let x=0;x<30;x++){let kk=y<4?(x<2?6:5):(x<2?4:3);if(y===4||y===10)kk=2;if(x===0||x===29||y===16)kk=1;if(y>4&&(x===9||x===20))kk=2;k.px(x,y,1,1,W[kk]);}k.px(0,0,30,1,W[7]);k.px(3,6,1,1,W[1]);k.px(26,12,1,1,W[1]);};
  // the still house: dark boards, a small window with the moon in it, a beam, flagstones lit by the fire, the lantern
  ALC.room=(K,win,lamp)=>{const W=['#0e0806','#180e08','#22140c','#2c1a10','#362114','#40281a','#4a2f1e'],F=['#141210','#1e1b18','#282420','#322d28','#3c362f','#463f36'];
    K.planks(0,0,320,120,W,15,31,true);for(let y=0;y<50;y++)K.pa(0,y,320,1,'#040202',.5-y/110);
    K.px(0,0,320,8,W[2]);K.px(0,7,320,1,W[0]);K.px(0,0,320,1,W[4]);for(let x=0;x<320;x+=37)K.px(x,1,1,6,W[1]);
    {const [wx,wy]=win;K.px(wx-3,wy-3,46,38,W[1]);for(let y=0;y<32;y++){const u=y/32;K.px(wx,wy+y,40,1,`rgb(${30+u*26|0},${38+u*30|0},${58+u*26|0})`);}
      K.ell(wx+28,wy+9,5,5,'#dfe6e8');K.ell(wx+30,wy+8,4.4,4.6,`rgb(${36|0},${44|0},${64|0})`);for(let x=0;x<40;x++){const h=4+Math.round(Math.sin(x*.27)*2+Math.sin(x*.71)*1.2+(x%11===5?3:0));K.px(wx+x,wy+32-h,1,h,'#0c0e10');}
      K.px(wx+19,wy,2,32,W[1]);K.px(wx,wy+15,40,2,W[1]);K.px(wx-5,wy+32,50,3,W[5]);K.px(wx-5,wy+32,50,1,W[6]);K.px(wx-5,wy+35,50,1,W[0]);}
    // the floor: big uneven flags, dark at the back
    for(let y=120;y<180;y++){const row=y<136?0:y<156?1:2,ry=[120,136,156][row],rh=[16,20,24][row],off=[7,23,13][row],bw=[34,44,58][row];for(let x=0;x<320;x++){const b=((x+off)/bw)|0,ix=(x+off)%bw,iy=y-ry;
        const n=K.H32(b,row,41);let kk=n>.66?3:n>.33?2:1;if(iy===0||ix===0)kk++;if(iy===rh-1||ix===bw-1)kk=0;K.px(x,y,1,1,F[cl(kk,0,5)]);}}
    K.px(0,119,320,2,'#0a0806');for(let y=121;y<128;y++)K.pa(0,y,320,1,'#000',.4-(y-121)*.05);};
  MG4ART.paint.stillhouse=K=>{ALC.room(K,[26,20]);const g=K.g;
    g.drawImage(M4.pre('alc_sack',38,48,sack),26,126);g.drawImage(M4.pre('alc_scut',30,24,scuttle),70,150);K.pa(70,172,30,2,'#000',.4);K.pa(28,171,36,2,'#000',.4);
    K.pa(108,172,116,4,'#000',.45);g.drawImage(ALC.firebox(),102,104);
    K.pa(224,158,54,5,'#000',.45);g.drawImage(ALC.tub(),223,78);g.drawImage(M4.pre('alc_crate',30,18,crate),235,148);K.pa(234,165,32,2,'#000',.5);
    ALC.arm(K,[[170,40],[188,36],[206,34],[224,36],[238,42],[246,52],[249,64],[250,84]],5,3);
    g.drawImage(ALC.pot(),118,60);ALC.plateLip(K,102);
    // the lantern hangs from the beam
    K.line(98,8,98,16,'#2a2a2c',1);K.px(93,16,11,3,I[4]);K.px(94,19,9,13,'#2a1a0a');K.px(95,20,7,11,'#e8a040');K.px(96,21,2,9,'#fce07c');K.px(93,32,11,2,I[3]);K.px(94,19,1,13,I[5]);K.px(102,19,1,13,I[2]);};
  MG4ART.anim.stillhouse=(K,t)=>{const f=.5+Math.sin(t*6.3)*.1+Math.sin(t*13.1)*.06;K.glow(98,25,34,'255,190,110',.16+f*.06);};
  // the bench end of the same house: the still stands behind it on the left, its worm tub at the wall
  MG4ART.paint.stillbench=K=>{ALC.room(K,[232,20]);const g=K.g;
    g.drawImage(ALC.tub(),-16,78);ALC.arm(K,[[64,40],[48,36],[30,35],[18,38],[11,46],[10,60],[11,84]],5,3);g.drawImage(ALC.pot(),32,60);g.drawImage(ALC.head(),59,29);K.line(79,55,84,55,BR[3],2);ALC.dial(K,89,55,.6,.55,.66);
    // the bench: a lit top edge, the front in dark boards
    const O2=['#140c06','#24160c','#342012','#442a18','#54361e','#644226','#744e2e','#845a36'];K.plank(0,112,320,8,M4.sh(O2,1),5);K.px(0,112,320,1,O2[7]);K.planks(0,120,320,60,O2,8,13);K.px(0,120,320,1,O2[0]);K.pa(0,121,320,4,'#000',.45);
    for(let y=160;y<180;y++)K.pa(0,y,320,1,'#000',(y-160)/60);
    K.line(100,8,100,14,'#2a2a2c',1);K.px(95,14,11,3,I[4]);K.px(96,17,9,13,'#2a1a0a');K.px(97,18,7,11,'#e8a040');K.px(98,19,2,9,'#fce07c');K.px(95,30,11,2,I[3]);K.px(96,17,1,13,I[5]);K.px(104,17,1,13,I[2]);};
  MG4ART.anim.stillbench=(K,t)=>{const f=.5+Math.sin(t*6.3)*.1+Math.sin(t*13.1)*.06;K.glow(100,23,44,'255,190,110',.15+f*.06);K.glow(56,114,30,'255,120,50',.12+f*.08);};
}
{const _sm=S4.simmer;S4.simmer=(sp,K)=>{const o=_sm(sp,K);if(sp.look!=='still')return o;const st=o.st,g=K.g,LO=sp.lo||.55,HI=sp.hi||.75,SPC=sp.spirit||['#4e6670','#dff2f6'];
  const adds=(sp.adds||[]).map(a=>Object.assign({},a));const s2={acc:0,drops:[],rip:[],lastDrip:0,rat:0,ratT:0,stT:0,cloud:0,flow:0,steam:[]};
  o.how='Hold to open the draught and build the fire under the pot; let go to close it. The pot is slow to answer, so think ahead. Keep the heat in the green and the worm runs clear: too cool and nothing comes over, too hot and the head chatters and it runs cloudy.';
  o.hint='Hold to open the draught. Keep the heat in the green.';
  try{if(typeof MF_FOCUS!=='undefined'&&!MF_FOCUS.alcStill)MF_FOCUS.alcStill={r:[104,36,282,150],nh:1};Object.defineProperty(o,'__mfk',{get:()=>'alcStill',set(){},configurable:true});}catch(e){}
  // the update is the simmer's own; its steam and its boil-over spurt are moved to where a still shows them
  const u0=o.update;o.update=function(dt,I){const n0=K.parts.length,jj=K.judge;K.judge=(s,x,y,q)=>jj(s,208,72,q);let r;try{r=u0.apply(this,arguments);}finally{K.judge=jj;}const T=st.T;
    for(let i=K.parts.length-1;i>=n0;i--){const p=K.parts[i];if(p.kind==='steam'){if(T>HI){p.x=160+(Math.random()-.5)*16;p.y=63;p.vx*=1.6;}else if(T>LO&&Math.random()<.35){p.x=236+Math.random()*28;p.y=82;}else K.parts.splice(i,1);}
      else if(Math.abs(p.y-72)<.01){p.x=160+(p.x-160)*.35;p.y=62;s2.cloud=1;}else if(Math.abs(p.y-74)<.01&&Math.abs(p.x-142)<12){p.x=148+(p.x-142)*.4;p.y=72;}}
    if(st.end)return r;
    // the run: drops at the worm's tap, faster as it heats, a thin stream when it boils, nothing when it's cold
    const rate=T<LO-.07?0:T<=HI?1.1+2.6*(T-LO+.07)/(HI-LO+.07):0;s2.flow+=((T>HI+.02?1:0)-s2.flow)*Math.min(1,dt*4);s2.cloud=Math.max(0,s2.cloud-dt*.6);
    if(s2.flow<.3&&rate>0){s2.acc+=rate*dt;if(s2.acc>=1){s2.acc-=1;s2.drops.push({y:0,v:0,hang:.16});}}
    for(let i=s2.drops.length-1;i>=0;i--){const d=s2.drops[i];if(d.hang>0){d.hang-=dt;continue;}d.v+=260*dt;d.y+=d.v*dt;if(d.y>=s2.surf()){s2.drops.splice(i,1);s2.rip.push(0);if(st.t-s2.lastDrip>.12){s2.lastDrip=st.t;MS.drip();}}}
    for(let i=s2.rip.length-1;i>=0;i--){s2.rip[i]+=dt;if(s2.rip[i]>.4)s2.rip.splice(i,1);}
    if(s2.flow>.3&&Math.random()<dt*6)MS.glug();
    // too hot: the head chatters on its flange, and steam spits at the seam
    if(T>HI){s2.ratT-=dt;if(s2.ratT<=0){s2.ratT=.09+Math.random()*.08;s2.rat=s2.rat?0:1;if(s2.rat&&Math.random()<.3)MS.knock();}}else s2.rat=0;
    if(T>HI+.03){s2.stT-=dt;if(s2.stT<=0){s2.stT=1.3;MS.steam();}}else s2.stT=Math.min(s2.stT,.25);
    for(const a of adds){if(a.fall==null&&st.t>=a.at-.6)a.fall=0;if(a.fall!=null&&a.fall<1)a.fall=Math.min(1,a.fall+dt/.6);}
    return r;};
  const TAP=[249,120],JAR=[249,151];s2.surf=()=>JAR[1]-1-Math.round(15*Math.min(1,.06+st.prog*.94))-TAP[1];
  const h0=o.hud;o.hud=function(){const lb=K.label;K.label=function(t,x,y){if(t==='IN IT GOES'){x=92;y=66;}return lb.apply(this,[t,x,y].concat([].slice.call(arguments,3)));};try{return h0.apply(this,arguments);}finally{K.label=lb;}};
  const a0=o.auto;o.auto=function(dt,AP){const r=a0.apply(this,arguments);AP.hand=[128,132];return r;};
  o.draw=function(t){const f=st.f,T=st.T,lv=Math.min(1,.06+st.prog*.94);
    // the fire in the mouth: it grows as the draught opens; its light on the bricks and the floor
    MG4ART.fire(K,142,151,36,24,.28+f*.72+(T>HI?.08:0),t,[142,124,36,28]);K.glow(160,142,30+f*26,'255,140,60',.1+f*.2);K.glow(160,96,46,'255,120,50',.05+f*.07+Math.max(0,T-.3)*.08);
    // the head, chattering when too hot; the dial on it
    const hx=Math.round(s2.rat?(Math.random()<.5?-1:1):0),hy=s2.rat?-1:0;g.drawImage(ALC.head(),145+hx,29+hy);K.line(165+hx,55+hy,170+hx,55+hy,CA_P.brass[3],2);ALC.dial(K,175+hx,55+hy,T/1.1,LO/1.1,HI/1.1);
    // steam spitting at the seam
    if(T>HI){const k=Math.min(1,(T-HI)/.12);for(let i=0;i<3;i++){const ph=(t*1.8+i/3)%1,sx=i===1?175:145,dir=i===1?1:-1;g.globalAlpha=k*.7*(1-ph);K.ell(sx+dir*ph*14,62-ph*12,2+ph*5,1.5+ph*4,'#e8e4dc');g.globalAlpha=1;}}
    // the run from the tap: hanging drops, falling drops, a thin stream when it boils (cloudy when it puked)
    const [tx,ty]=TAP,surf=JAR[1]-1-Math.round(15*lv),cloud=Math.max(s2.cloud,s2.flow>.3?.5:0);
    ALC.jar(K,JAR[0],JAR[1],lv,sp.spirit||SPC,sp.glow?'120,255,220':null,cloud);
    for(const r of s2.rip){const u=r/.4;g.globalAlpha=.7*(1-u);K.px(JAR[0]-2-u*4,surf,5+u*8,1,SPC[1]);g.globalAlpha=1;}
    for(const d of s2.drops){if(d.hang>0){const s=1-d.hang/.16;K.px(tx-1,ty+1,2,1+Math.round(s*2),SPC[1]);K.px(tx-1,ty+1,1,1,'#ffffff');}else{K.px(tx-1,ty+1+d.y,2,3,SPC[1]);K.px(tx-1,ty+1+d.y,1,1,'#ffffff');}}
    if(s2.flow>.05){g.globalAlpha=Math.min(1,s2.flow*1.4);for(let y=ty+1;y<surf;y++){K.px(tx-1+(y%5===0?1:0),y,2,1,cloud>.2?'#e4dcc4':SPC[1]);}K.px(tx-2,surf,5,1,'#ffffff');g.globalAlpha=1;}
    // the draught lever on the ash pit: your right fist turns it up as you hold
    const kx=128,ky=136,ka=-2.6+f*1.9,ex=kx+Math.cos(ka)*11,ey=ky+Math.sin(ka)*11;K.ball(kx,ky,4,CA_P.brass);K.line(kx,ky,ex,ey,'#1a0e06',4);K.line(kx,ky,ex,ey,CA_P.brass[3],2);K.line(kx,ky-1,ex,ey-1,CA_P.brass[5],1);K.px(kx-1,ky-1,2,2,CA_P.brass[6]);
    m4grip(K,kx+Math.cos(ka)*9,ky+Math.sin(ka)*9,ka,{side:1});
    // what goes in (the glowcaps for the gin): held over the filling port in your left fist, the plug out, let go, falling in
    for(const a of adds)if(a.fall!=null&&a.fall<1){const u=a.fall,PX=141,PY=74,Y0=30,d=u<.5?0:Math.pow((u-.5)/.5,2),y=Y0+d*(PY-Y0);K.px(PX-3,PY-2,6,2,'#120604');K.px(146,76,5,2,CA_P.brass[4]);K.px(146,76,5,1,CA_P.brass[6]);
      g.save();g.translate(PX,y);g.rotate(d*2);K.icon(a.icon,-7,-7,.45);g.restore();if(u<.5)m4grip(K,PX,Y0-10+Math.sin(u*20)*.5,0,{side:-1});else{const q=Math.min(1,(u-.5)/.25);g.globalAlpha=1-q;m4grip(K,PX-q*6,Y0-10-q*10,0,{side:-1,kind:'palm'});g.globalAlpha=1;}}};
  return o;};}
// ---- (t382) the bench steps: lifted to stand on the bench (they were lowered for long arms that are gone), each told by what you see
const alcFocus=(o,key,r)=>{try{if(typeof MF_FOCUS!=='undefined'&&!MF_FOCUS[key])MF_FOCUS[key]={r,nh:1};Object.defineProperty(o,'__mfk',{get:()=>key,set(){},configurable:true});}catch(e){}};
// bottling: the flask stands on the bench under the funnel; as it fills, the cut you're pouring is named and coloured: the first of it
// hazy (heads), the middle clear and bright (hearts), anything past the line cloudy and yellow (tails)
{const _po=S4.pour;S4.pour=(sp,K)=>{const o=_po(sp,K);if(sp.look!=='bottle')return o;const st=o.st,g=K.g,LT=sp.line||.78,LIFT=72;
  alcFocus(o,'alcBottle',[100,22,250,122]);
  const u0=o.update;o.update=function(dt,I){const j=K.judge;K.judge=(s,x,y,q)=>j(s,118,64,q);try{return u0.apply(this,arguments);}finally{K.judge=j;}};
  const d0=o.draw;o.draw=function(t){g.save();g.translate(0,-LIFT);d0.apply(this,arguments);
    const [s1x]=M4.tr(214,50,-1.05,3-19,4-20),bx=Math.round(s1x-10)-(st.slide>0?st.slide*140:0),BY=130,y0=BY-2,h=42,L=Math.min(1.05,st.L);
    if(L>.01){for(let y=Math.round(y0-h*L);y<=y0;y++){const ry=y-(BY-68);if(ry<26||ry>67)continue;const r=Math.round(25*Math.sqrt(Math.max(0,1-((ry-47)/22)**2)))-1,Lr=(y0-y)/h;if(r<1)continue;
        if(Lr<.12)K.pa(bx-r+1,y,r*2-2,1,'#c4d0e8',.28);else if(Lr>LT+.02)K.pa(bx-r+1,y,r*2-2,1,'#d8b870',.5);}
      const yl=Math.round(y0-h*L);if(L>.12&&L<=LT+.02){K.px(bx-8,yl+2,2,6,'#ffffff');}}
    // the name of the cut, by the flask, while it runs
    if(st.q>.01||(st.L>.02&&st.still<.6&&!st.end)){const c=L<.12?['HEADS','#c8d8f0']:L<=LT+.035?['HEARTS','#9be07a']:['TAILS','#e8a040'];K.label(c[0],bx-46,Math.round(y0-h*Math.max(.1,L))-2,c[1]);}
    g.restore();};
  return o;};}
// corking: the flask stands on the same bench
{const _co=S4.cork;S4.cork=(sp,K)=>{const o=_co(sp,K);if(sp.look!=='bench')return o;const g=K.g,LIFT=51;alcFocus(o,'alcCork',[104,16,236,122]);
  const d0=o.draw;o.draw=function(t){g.save();g.beginPath();g.rect(0,-(K.dy||0),320,118);g.clip();g.translate(0,-LIFT);d0.apply(this,arguments);g.restore();K.pa(126,117-(K.dy||0),68,2,'#000',.35);};
  return o;};}
// straining and filtering through the riddle: the riddle and your fists as they were; what's on it is the job (spent grain, grape skins
// in a cloth, charcoal in a cloth), the run under it is the liquid it is, and it goes into a vessel that holds liquid (an oak tub, a crock)
{const _sv=S4.sieve;S4.sieve=(sp,K)=>{const o=_sv(sp,K);const LK=sp.look;if(LK!=='lauter'&&LK!=='skins'&&LK!=='charcoal')return o;const st=o.st,g=K.g,LO=1.4,HI=3.2;
  const LQ=LK==='lauter'?['#5a2c0c','#8a4c16','#c08030']:LK==='skins'?['#3a0c30','#5a1a50','#8a3a7a']:['#4e6670','#7e98a2','#dff2f6'];
  const cloth=LK!=='lauter';const bits=[];for(let i=0;i<46;i++){const a=i*2.4,r=Math.sqrt((i%23+.5)/23);bits.push([Math.cos(a)*48*r,Math.sin(a)*7*r,i]);}
  const vessel=LK==='charcoal'?M4.pre('alc_crock',112,40,k=>{const S=['#2a2622','#4a443c','#6e665a','#948a78','#b4aa96','#d2c8b2'];for(let y=6;y<38;y++){const r=46-Math.round(Math.pow((y-6)/32,2)*6);for(let x=-r;x<=r;x++){const s=x/r,d=Math.max(0,-s*.6+Math.sqrt(1-s*s)*.6);let kk=Math.round(1.4+d*4);if(y<12)kk=Math.max(1,kk-2);k.px(56+x,y,1,1,(y<12?['#2a160a','#4a2810','#6a3c1a','#8a5226','#a86a34','#c08848']:S)[cl0(kk)]);}}
      k.ell(56,6,47,6,'#6a3c1a');k.ell(56,6,45,5,'#a86a34');k.ell(56,6.5,42,4,'#2a1a10');for(let x=-30;x<=30;x+=2)k.px(56+x,20+Math.round(3*Math.sqrt(1-(x/46)**2)),2,1,'#7e7464');M4.outline(k.g.canvas,'#1a120c');})
    :M4.pre('alc_tubw',112,40,k=>{const O=CA_P.oak,I=CA_P.iron;for(let y=6;y<38;y++){const r=48-Math.round((y-6)/32*4);for(let x=-r;x<=r;x++){const s=x/r,th=Math.asin(Math.max(-1,Math.min(1,s))),d=Math.max(0,-s*.6+Math.cos(th)*.6);let kk=Math.round(1.2+d*4.4);if(Math.round((th+Math.PI/2)/(Math.PI/11)*100)%100<10&&Math.abs(s)<.96)kk=1;k.px(56+x,y,1,1,O[cl0(kk)]);}}
      for(const hy of [13,30])for(let x=-47;x<=47;x++){const s=x/48,yy=hy+Math.round(2*Math.sqrt(1-s*s)),d=Math.max(0,-s*.6+Math.sqrt(1-s*s)*.6);k.px(56+x,yy,1,1,I[Math.round(2+d*3.5)]);k.px(56+x,yy+1,1,1,I[1]);}
      k.ell(56,6,49,6,O[2]);k.ell(56,6,47,5,O[5]);k.ell(56,6.5,44,4,'#1a0e06');M4.outline(k.g.canvas,O[0]);});
  const VX=160,VY=126;   // the vessel's mouth (it sits on the floor in front of you)
  const u0=o.update;o.update=function(dt,I){const n0=K.parts.length,r=u0.apply(this,arguments);for(let i=K.parts.length-1;i>=n0;i--){const p=K.parts[i];if(Math.abs(p.y-88)<.01&&p.g<0)K.parts.splice(i,1);else p.c=[LQ[0],LQ[1],LQ[2]];}return r;};
  o.draw=function(t){const cx=160+st.x,inb=st.rate>=LO&&st.rate<=HI,slow=st.rate>0&&st.rate<LO,wild=st.rate>HI;
    K.pa(VX-54,VY+36,108,3,'#000',.45);g.drawImage(vessel,VX-56,VY-6);
    // the liquid in it rises as the run goes; rings where the run lands
    const lv=Math.min(1,st.prog),ly=VY+Math.round(3-lv*3);if(lv>.02){K.ell(VX,ly,Math.round(30+lv*13),Math.round(2+lv*2),LQ[1]);K.ell(VX-6,ly-.5,Math.round(14+lv*10),1,LQ[2]);}
    if(inb||slow)for(let k=0;k<2;k++){const rr=((t*1.3+k*.5)%1);g.strokeStyle=`rgba(255,250,230,${.35*(1-rr)})`;g.lineWidth=1;g.beginPath();g.ellipse(cx+(k?14:-10),ly,3+rr*9,1+rr*2,0,0,6.29);g.stroke();}
    // the run: steady threads when the pace is right, a few drops when it's slow
    const yb=110,yt=ly;if(inb)for(let i=0;i<5;i++){const sx=Math.round(cx-28+i*14+Math.sin(i*2.1)*3);if(sx<VX-42||sx>VX+42)continue;for(let y=yb;y<yt;y+=2){const ph=((y+Math.floor(t*70)+i*5)%10);K.px(sx,y,1,2,ph<6?LQ[1]:LQ[2]);}}
    else if(slow||(st.prog>0&&st.rate===0))for(let i=0;i<4;i++){const ph=(t*1.1+i*.27)%1,sx=Math.round(cx-24+i*16);K.px(sx,yb+ph*(yt-yb),1,2,LQ[2]);}
    // the riddle rocks as you shake it, what's on it rocking with it; your fists round the rim's sides
    const vx=(st.x-(st.px0==null?st.x:st.px0))*60;st.px0=st.x;st.tl=(st.tl||0)+(M4.cl(vx*.0012,-.07,.07)-(st.tl||0))*.35;const tl=st.tl;
    K.pa(cx-62,110,124,3,'#000',.3);M4.rot(g,m4riddle(),cx,95,tl,70,17);
    if(cloth){g.save();g.translate(cx,93);g.rotate(tl);const cc=['#8a8070','#b0a690','#cfc6ae'];K.ell(0,0,50,8,cc[0]);K.ell(-1,-.5,48,6.6,cc[1]);K.ell(-5,-1.5,30,3.5,cc[2]);for(const [dx,dy] of [[-30,1],[8,-2],[26,2]])K.line(dx,dy,dx+10,dy+1,cc[0],1);g.restore();}
    const wet=1-Math.min(1,st.prog)*.6;
    for(const [bx0,by0,i] of bits){const jx=Math.round(Math.sin(t*22+i)*.6),x=cx+Math.round(bx0)+jx,y=93+Math.round(by0+bx0*tl);
      if(LK==='lauter'){K.px(x,y,3,1,i%3?M4KE[4]:M4KE[3]);K.px(x,y+1,2,1,M4KE[1]);if(i%7===0)K.px(x,y,1,1,'#f8e6a4');}
      else if(LK==='skins'){if(i%5===0){K.px(x,y,1,2,'#4a6a2a');continue;}K.px(x-1,y,4,2,i%3?'#4a1450':'#2a0c2a');K.px(x,y,2,1,i%2?'#8a4a9a':'#6a2a72');if(i%6===1&&wet>.5)K.px(x,y,1,1,'#c8a0d0');}
      else{K.px(x-1,y-1,4,3,'#141416');K.px(x-1,y-1,3,1,i%3?'#3a3c44':'#4e525e');K.px(x+2,y,1,2,'#08080a');if(i%9===2)K.px(x,y-1,1,1,'#8a90a0');}}
    if(wild&&Math.floor(t*8)%2)for(let k=0;k<3;k++)K.px(cx+(st.dir>0?60:-62)+k*2*(st.dir>0?1:-1),100+k*3,2,2,LQ[1]);
    m4grip(K,cx-67,94-67*tl,Math.PI/2+tl-.25,{side:-1});m4grip(K,cx+67,94+67*tl,-Math.PI/2+tl+.25,{side:1});};
  if(LK==='charcoal')o.how='Shake the riddle to keep the spirit running through the charcoal: '+(K.fine?'move the mouse left and right while holding, or tap A and D in turn.':'drag left and right.')+' A steady pace runs it clean; too wild and it slops over.';
  return o;};}
const cl0=k=>Math.max(0,Math.min(5,k));
// ---- (t382) the quern on the brew bench: a bedstone on a sacking cloth, the runner turning on it by its upright handle (your fist on
// it), whole grain heaped in the eye going down as you grind, cracked meal working out of the gap between the stones onto the cloth and
// building up round it. The stones rumble as they turn and crunch on each half turn.
{const _ck=S4.crank;S4.crank=(sp,K)=>{const o=_ck(sp,K);if(sp.look!=='quern')return o;const st=o.st,g=K.g,N=sp.n||14,GR=sp.grain||['#b08a40','#d8b468','#f0d890'],S=CA_P.stone;
  o.how='Turn the quern by its handle: draw circles'+(K.fine?' with the mouse (or hold Space)':' with your finger')+' at an even, steady pace. Too fast and the grain flies.';
  try{if(typeof MF_FOCUS!=='undefined'&&!MF_FOCUS.alcQuern)MF_FOCUS.alcQuern={r:[92,40,228,124],nh:1};Object.defineProperty(o,'__mfk',{get:()=>'alcQuern',set(){},configurable:true});}catch(e){}
  const u0=o.update;let first=true,half=0;o.update=function(dt,I){let r;if(first){first=false;const L=MS.loop;MS.loop=()=>L('lowpass',520,1.2);try{r=u0.apply(this,arguments);}finally{MS.loop=L;}}else r=u0.apply(this,arguments);
    const h=Math.floor(st.ang/Math.PI);if(h!==half){half=h;if(st.spd>1.5&&!st.end)MS.crunch();}return r;};
  const cx=160,BY=78,RY=70;   // the bedstone's top, the runner's top (the step is drawn 25 px lower on the stage)
  const cyl=(k,x0,top,rx,ry,hh,P)=>{for(let y=0;y<hh;y++)for(let x=-rx;x<=rx;x++){const s=x/rx,yb=Math.round(ry*Math.sqrt(1-s*s));const d=Math.max(0,-s*.6+Math.sqrt(1-s*s)*.62);k.px(x0+x,top+yb+y,1,1,P[Math.max(1,Math.min(5,Math.round(1.3+d*3.4)-(y===hh-1?1:0)))]);}
    k.ell(x0,top,rx,ry,P[4]);k.ell(x0-2,top-.5,rx-4,ry-1.4,P[5]);};
  const bed=()=>M4.pre('alc_qbed2',90,26,k=>{cyl(k,45,8,41,7,9,S);M4.outline(k.g.canvas,S[0]);});
  const run=()=>M4.pre('alc_qrun2',80,24,k=>{cyl(k,40,8,36,6,8,S.map((c,i)=>S[Math.min(6,i+1)]));M4.outline(k.g.canvas,S[0]);});
  o.draw=function(t){const n=st.coils.length,f=Math.min(1,(n+st.ang/(Math.PI*2))/N),spin=st.spd>.6;
    // the sacking cloth, the meal heaped round the stones as it comes out
    K.ell(cx,BY+16,64,9,'#2a2016');K.ell(cx,BY+15,62,8,'#7c6a48');K.ell(cx-6,BY+14,44,5,'#968460');for(let x=-50;x<=50;x+=13)K.line(cx+x,BY+7,cx+x*1.1,BY+20,'#625034',1);
    const hp=Math.round(f*5);if(hp>0)for(let x=-50;x<=50;x++){const s=x/50,yb=BY+13+Math.round(6*Math.sqrt(1-s*s)),hh=Math.max(1,Math.round(hp*(.6+.4*Math.sin(x*.7)+.25*Math.sin(x*.23))));K.px(cx+x,yb-hh,1,hh,x<-10?GR[2]:GR[1]);K.px(cx+x,yb-hh,1,1,GR[2]);if(x%5===0)K.px(cx+x,yb-1,1,1,GR[0]);}
    g.drawImage(bed(),cx-45,BY-8);
    // meal working out of the gap on the near side while it turns
    if(spin&&n<N)for(let i=0;i<7;i++){const ph=(t*1.6+i/7)%1,a=.2+i*.4,x=cx+Math.cos(a)*37*(i%2?1:-1),y=BY+3+Math.round(ph*9);K.px(x,y,1+(i%2),1,GR[2]);}
    g.drawImage(run(),cx-40,RY-8);
    // the runner's face: dressing grooves turning with it, the eye with whole grain heaped in it
    for(let k=0;k<6;k++){const a=st.ang+k*Math.PI/3;for(let r=9;r<32;r+=1.5){const x=cx+Math.cos(a)*r,y=RY+Math.sin(a)*r*.17;K.px(x,y,1,1,S[2]);K.px(x-1,y-1,1,1,S[6]);}}
    K.ell(cx,RY,7,2.4,'#1a1612');const left=Math.max(0,1-n/N);for(let i=0;i<Math.round(6+left*22);i++){const a=i*2.4,r=Math.sqrt(i/28)*6;const x=cx+Math.cos(a)*r,y=RY-1+Math.sin(a)*r*.3-left*2*(1-r/5);K.px(x,y,2,1,i%3?GR[1]:GR[2]);K.px(x,y+1,1,1,GR[0]);}
    // the handle: an upright peg near the runner's rim; your fist round it
    const hx=cx+Math.cos(st.ang)*29,hy=RY+Math.sin(st.ang)*5;K.px(hx-2,hy-17,5,18,'#24140a');K.px(hx-1,hy-16,3,17,CA_P.wood[5]);K.px(hx-1,hy-16,1,17,CA_P.wood[7]);K.px(hx+1,hy-16,1,17,CA_P.wood[3]);K.px(hx-2,hy-18,5,2,CA_P.wood[6]);
    m4grip(K,hx,hy-11,-Math.PI/2,{side:1});};
  return o;};}
// ---- (t382) the brew kettle, drawn as the station: an open copper kettle on a stone firebox, the mash tun beside it with its paddle,
// hops hung from the beam. The simmer game as it was; the wort rolls and foams when it boils, the mash sits thick and steams when it's
// warm, the barley and hops go in from your hand, and the fire in the firebox door answers the draught lever.
{const C=CA_P.copper,I=CA_P.iron,O=CA_P.oak,S=CA_P.stone,BR=CA_P.brass,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ketR=y=>{const t=(y-70)/40;if(t<0||t>1)return 0;return 42+5*Math.sin(Math.PI*t*.8)-6*t*t;};
  ALC.kettle=()=>M4.pre('alc_kettle',100,52,(k,g)=>{ALC.lathe(k,50,10,50,y=>ketR(y+60),C,{amb:1.4,rng:5.4,shin:16,metal:1});
      // the rim: a rolled lip round the dark mouth
      k.ell(50,10,44,8.5,C[1]);k.ell(50,10,43,7.6,C[4]);k.ell(50,9.6,41,6.6,C[6]);k.ell(50,10.4,39.5,6,C[2]);k.ell(50,11,38,5.4,'#1c0a04');
      // a riveted band and the tap on the belly
      for(let x=-44;x<=44;x++){const r=ketR(84),s=x/r;if(Math.abs(s)>=1)continue;const y=24+Math.round(3*Math.sqrt(1-s*s));k.px(50+x,y,1,1,C[x<-10?3:2]);if((x+45)%7===0&&Math.abs(s)<.92)k.px(50+x,y-1,1,1,C[x<0?7:5]);}
      M4.outline(k.g.canvas,C[0]);k.px(88,30,6,4,BR[4]);k.px(88,30,6,1,BR[6]);k.px(93,31,3,6,BR[3]);k.px(93,31,1,6,BR[5]);k.px(87,27,4,3,BR[5]);k.px(87,27,4,1,BR[7]);});
  ALC.kettleLip=()=>M4.pre('alc_ketlip',100,22,k=>{for(let x=-44;x<=44;x++){const s=x/44,yo=Math.round(8.5*Math.sqrt(Math.max(0,1-s*s)));const yi=Math.round(6.6*Math.sqrt(Math.max(0,1-(x/41)**2)));
      if(Math.abs(x)<=41){k.px(50+x,10+yi,1,Math.max(1,yo-yi),C[x<-20?6:x<15?5:4]);k.px(50+x,10+yo,1,1,C[1]);k.px(50+x,10+yi,1,1,C[7]);}else k.px(50+x,10,1,yo+1,C[3]);}});
  // the stone firebox (grey field stones, as the station has), its door open, an ash pit
  ALC.firebox2=()=>M4.pre('alc_firebox2',116,74,(k,g)=>{const X=4,Y=6,W=108,H=64;k.px(X,Y,W,H,'#18161a');
      for(let r=0;r<8;r++){const y0=Y+r*8,off=(r*13)%17;let x=X-off;let i=0;while(x<X+W){const w=12+Math.round(k.H32(r,i,61)*10),h=7;const n=k.H32(r,i,62);const base=n>.66?4:n>.33?3:2;
          for(let yy=0;yy<h;yy++)for(let xx=0;xx<w-1;xx++){const px_=x+xx,py=y0+yy;if(px_<X||px_>=X+W)continue;const corner=(xx===0||xx===w-2)&&(yy===0||yy===h-1);if(corner)continue;
            let kk=base;if(yy===0||xx===0)kk++;if(yy===h-1||xx===w-2)kk--;if(px_>X+W-14)kk--;if(px_<X+10)kk++;k.px(px_,py,1,1,S[cl(kk,0,6)]);}
          x+=w;i++;}}
      for(let y=0;y<26;y++)for(let x=30;x<78;x++){const d=Math.hypot((x-54)/24,(y-20)/20);if(d<1&&k.H32(x,y,5)<.85-d*.6)k.pa(X+x,Y+y,1,1,'#0a0808',.55*(1-d));}
      const mx=X+36,my=Y+14,mw=36,mh=28;k.px(mx-3,my-3,mw+6,mh+6,I[1]);k.px(mx-3,my-3,mw+6,1,I[5]);k.px(mx-3,my-2,1,mh+5,I[4]);k.px(mx-2,my-2,mw+4,mh+4,I[3]);k.px(mx,my,mw,mh,'#120604');
      for(const rx of [mx-2,mx+mw+1])for(const ry of [my-1,my+mh])k.px(rx,ry,1,1,I[6]);
      k.px(mx+mw+3,my-1,5,mh+2,I[2]);k.px(mx+mw+3,my-1,1,mh+2,I[5]);k.px(mx+mw+7,my-1,1,mh+2,I[0]);for(const ry of [my+4,my+mh-6])k.px(mx+mw+2,ry,2,3,I[4]);
      k.px(mx+4,Y+H-9,mw-8,6,'#0e0604');k.px(mx+3,Y+H-10,mw-6,1,I[3]);k.px(mx+3,Y+H-3,mw-6,1,I[4]);
      k.px(0,0,116,7,I[3]);k.px(0,0,116,1,I[6]);k.px(0,1,116,1,I[5]);k.px(0,6,116,1,I[1]);k.pa(0,7,116,2,'#000',.5);});
  // the mash tun: a squat oak tub, a heap of spent grain in it, the paddle leaning out
  ALC.tun=()=>M4.pre('alc_tun',58,70,(k,g)=>{const cx=28,top=22,bot=66;
      for(let y=top;y<=bot;y++){const u=(y-top)/(bot-top),r=24+1.6*Math.sin(Math.PI*u);for(let x=-Math.round(r);x<=Math.round(r);x++){const s=x/r;if(Math.abs(s)>1)continue;const th=Math.asin(s),c=Math.cos(th);
          const d=Math.max(0,s*-.56+c*.6);let kk=Math.round(1.2+d*4.2);const st=Math.round((th+Math.PI/2)/(Math.PI/8)*100)%100;if(st<9&&Math.abs(s)<.97)kk=1;k.px(cx+x,y,1,1,O[cl(kk,0,6)]);}}
      for(const hy of [28,56]){for(let x=-25;x<=25;x++){const r=25.4,s=x/r;if(Math.abs(s)>1)continue;const yy=hy+Math.round(2*Math.sqrt(1-s*s));const d=Math.max(0,s*-.56+Math.sqrt(1-s*s)*.6);
          k.px(cx+x,yy,1,1,I[cl(Math.round(2+d*3.6),1,6)]);k.px(cx+x,yy+1,1,1,I[cl(Math.round(1.4+d*3),1,5)]);k.px(cx+x,yy+2,1,1,I[1]);}}
      k.ell(cx,top,25,6,O[2]);k.ell(cx,top,24,5,O[5]);k.ell(cx,top+.5,22,4,O[1]);
      for(let i=0;i<70;i++){const a=i*2.4,r=Math.sqrt((i%35+.5)/35);const x=cx+Math.cos(a)*19*r,y=top+Math.sin(a)*3.2*r-(1-r)*2;k.px(x,y,2,1,i%3?M4KE[3]:M4KE[2]);if(i%5===0)k.px(x,y,1,1,M4KE[5]);}
      k.line(cx+10,top-2,cx+22,2,'#2a1608',3);k.line(cx+10,top-2,cx+22,2,O[5],1);k.px(cx+19,0,6,4,O[4]);k.px(cx+19,0,6,1,O[6]);
      M4.outline(k.g.canvas,O[0]);});
  // hops on the beam: a few green cone clusters on twine
  ALC.hops=(K,x0,n)=>{for(let i=0;i<n;i++){const hx=x0+i*11,len=8+(i%3)*4;K.line(hx,7,hx,7+len,'#4a3a22',1);for(let j=0;j<5;j++){const cx=hx-3+(j%3)*3,cy=7+len+(j>2?5:0)+(j%2);K.px(cx,cy,3,4,j%2?'#4e6a2a':'#6a8a34');K.px(cx,cy,2,1,'#9ab454');K.px(cx+2,cy+3,1,1,'#2a3a18');}}};
  MG4ART.paint.brewhouse=K=>{ALC.room(K,[26,20]);const g=K.g;ALC.hops(K,104,4);
    g.drawImage(M4.pre('alc_sack',38,48,ALC.sack),30,126);K.pa(32,171,36,2,'#000',.4);
    K.pa(108,172,116,4,'#000',.45);g.drawImage(ALC.firebox2(),102,104);
    K.pa(222,160,58,5,'#000',.45);g.drawImage(ALC.tun(),222,94);
    g.drawImage(ALC.kettle(),110,60);ALC.plateLip(K,102);};
  MG4ART.anim.brewhouse=(K,t)=>{};
  MG4ART.paint.brewbench=K=>{ALC.room(K,[232,20]);const g=K.g;ALC.hops(K,150,4);
    g.drawImage(ALC.tun(),-14,94);g.drawImage(ALC.kettle(),24,60);K.ell(74,71.5,36,4.4,'#5a2c0c');K.ell(70,71,22,2,'#8a4c16');g.drawImage(ALC.kettleLip(),24,60);
    const O2=['#140c06','#24160c','#342012','#442a18','#54361e','#644226','#744e2e','#845a36'];K.plank(0,112,320,8,M4.sh(O2,1),5);K.px(0,112,320,1,O2[7]);K.planks(0,120,320,60,O2,8,13);K.px(0,120,320,1,O2[0]);K.pa(0,121,320,4,'#000',.45);
    for(let y=160;y<180;y++)K.pa(0,y,320,1,'#000',(y-160)/60);
    K.line(100,8,100,14,'#2a2a2c',1);K.px(95,14,11,3,I[4]);K.px(96,17,9,13,'#2a1a0a');K.px(97,18,7,11,'#e8a040');K.px(98,19,2,9,'#fce07c');K.px(95,30,11,2,I[3]);K.px(96,17,1,13,I[5]);K.px(104,17,1,13,I[2]);};
  MG4ART.anim.brewbench=(K,t)=>{const f=.5+Math.sin(t*6.3)*.1+Math.sin(t*13.1)*.06;K.glow(100,23,44,'255,190,110',.15+f*.06);K.glow(70,114,30,'255,120,50',.1+f*.08);
};
}
{const _sm=S4.simmer;S4.simmer=(sp,K)=>{const o=_sm(sp,K);if(sp.look!=='kettle')return o;const st=o.st,g=K.g,CX=160,LO=sp.lo||.55,HI=sp.hi||.75,COL=sp.col||['#c8a040','#e8c868'],boil=LO>=.6;
  const adds=(sp.adds||[{at:2.6,icon:'turnip'},{at:6,icon:'turnip'}]).map(a=>Object.assign({fall:-1},a));const SY=73;
  const bits=[];for(let i=0;i<22;i++)bits.push({r:.25+((i*37)%70)/100,a:i*2.39,c:(sp.bits||[COL[1]])[i%((sp.bits||[1]).length)],w:i%3?3:2});
  const roll=[];for(let i=0;i<14;i++)roll.push({a:i*2.1,ph:(i*.37)%1});
  o.how='Hold to open the draught and build the fire under the kettle; let go to close it. The kettle is slow to answer, so think ahead. Keep the heat in the green until it’s done.'+(boil?' Too hot and it foams over the rim.':' Too hot and the mash scorches and foams.');
  o.hint='Hold to open the draught. Keep the heat in the green.';
  try{if(typeof MF_FOCUS!=='undefined'&&!MF_FOCUS.alcKettle)MF_FOCUS.alcKettle={r:[100,24,282,150],nh:1};Object.defineProperty(o,'__mfk',{get:()=>'alcKettle',set(){},configurable:true});}catch(e){}
  const u0=o.update;o.update=function(dt,I){const jj=K.judge;K.judge=(s,x,y,q)=>jj(s,226,70,q);let r;try{r=u0.apply(this,arguments);}finally{K.judge=jj;}
    for(const a of adds){if(a.fall<0&&st.t>=a.at-.6)a.fall=0;if(a.fall>=0&&a.fall<1)a.fall=Math.min(1,a.fall+dt/.6);}return r;};
  const h0=o.hud;o.hud=function(){const lb=K.label;K.label=function(t,x,y){if(t==='IN IT GOES'){x=64;y=52;}return lb.apply(this,[t,x,y].concat([].slice.call(arguments,3)));};try{return h0.apply(this,arguments);}finally{K.label=lb;}};
  const a0=o.auto;o.auto=function(dt,AP){const r=a0.apply(this,arguments);AP.hand=[128,132];return r;};
  o.draw=function(t){const f=st.f,T=st.T;
    MG4ART.fire(K,142,151,36,24,.28+f*.72,t,[142,124,36,28]);K.glow(160,142,30+f*26,'255,140,60',.1+f*.2);
    // the liquid: two flat tones, a sheen at the back left, the foam hugging the back rim; bubbles, a rolling boil, the grain or hops going round
    g.save();g.beginPath();g.ellipse(CX,71,38,5.4,0,0,6.29);g.clip();K.px(CX-40,64,80,14,COL[0]);K.ell(CX-6,SY-1,26,3,COL[1]);K.px(CX-30,SY-3,8,1,'#fff4d0');
    const hot=M4.cl((T-.35)/.6,0,1),fm=boil?['#f4ecd4','#d8c8a0']:['#efe4c4','#c8b488'];
    for(let x=-36;x<=36;x+=2){const yb=SY-4.2*Math.sqrt(Math.max(0,1-(x/38)**2));if(Math.sin(x*.9+t*2)>.2-hot*.6)K.px(CX+x,yb,2,1+(hot>.5&&x%4===0?1:0),x%6?fm[0]:fm[1]);}
    if(boil&&T>LO-.08){const k=M4.cl((T-LO+.08)/.3,0,1);K.ell(CX+Math.sin(t*5)*2,SY,8+k*6,1.6+k,COL[1]);for(const r of roll){const u=(r.ph+t*(.5+k*.7))%1,rr=u*34,x=CX+Math.cos(r.a)*rr,y=SY+Math.sin(r.a)*rr*.15;if(u<.9){K.px(x,y,3,1,fm[0]);K.px(x+1,y+1,2,1,fm[1]);}}}
    for(const b of bits){const a=b.a+st.stir*.6,x=CX+Math.cos(a)*b.r*32,y=SY+Math.sin(a)*b.r*4.6;K.px(x,y,b.w,1,b.c);K.px(x,y+1,b.w-1,1,COL[0]);}
    const nb=T<.42?0:T<LO?3:T<=HI?7:12;for(let i=0;i<nb;i++){const ph=(t*(1+T*3)+i*.37)%1,ang=i*2.3+Math.floor(t*(1+T*3)+i*.37)*1.7,rr=.2+((i*29)%60)/100,bx=CX+Math.cos(ang)*rr*33,by=SY+Math.sin(ang)*rr*4.5;
      if(ph<.7){K.px(bx,by-1,2,1,fm[0]);K.px(bx,by,2,1,COL[0]);}else{const q=(ph-.7)/.3;K.px(bx-1-q*2,by,1,1,fm[0]);K.px(bx+2+q*2,by,1,1,fm[0]);}}
    g.restore();g.drawImage(ALC.kettleLip(),CX-50,60);
    // too hot: foam climbs the rim and over the lip
    if(st.foam>0){const fh=st.foam*9;for(let x=-38;x<=38;x+=2){const h=fh*(.7+.3*Math.sin(x*.7+t*6)),yb=SY-4.2*Math.sqrt(Math.max(0,1-(x/40)**2));K.px(CX+x,yb-h,2,h+1,x%4?fm[0]:fm[1]);}}
    if(st.T>.4){for(let i=0;i<2+Math.round(hot*3);i++){const ph=(t*.45+i/5)%1;g.globalAlpha=(.18+hot*.25)*Math.sin(Math.PI*ph);K.ell(CX-24+i*12+Math.sin(t*1.3+i)*4,SY-6-ph*30,3+ph*8,2+ph*5,'#e8e2d8');g.globalAlpha=1;}}
    // your left hand stirs: the spoon's bowl goes round in the kettle, the handle leans with it, the fist round its top
    const ang=st.stir;const sx=CX+Math.cos(ang)*18,syy=SY-Math.abs(Math.sin(ang))*1,tx=CX+8+Math.cos(ang)*7,ty=SY-33+Math.sin(ang)*1.5;
    K.line(sx,syy,tx,ty,'#2a1808',4);K.line(sx,syy,tx,ty,CA_P.wood[4],2);K.line(sx-1,syy,tx-1,ty,CA_P.wood[6],1);K.px(sx-2,syy-1,5,2,CA_P.wood[3]);
    {const busy=adds.some(a=>a.fall>=0&&(a.fall<1||(a.sp||0)<.3)),ha=Math.atan2(ty-syy,tx-sx),[gx,gy]=M4.tr(tx,ty,ha,-3,0);if(!busy)m4grip(K,gx,gy,ha,{side:-1});}
    for(const a of adds)if(a.fall>=0&&a.fall<1){const Y0=24,u=a.fall,d=u<.5?0:Math.pow((u-.5)/.5,2),y=Y0+d*(SY+2-Y0),rot=d*2;g.save();g.translate(CX-18,y-6);g.rotate(rot);K.icon(a.icon,-8,-8,.7);g.restore();
      if(u<.5)m4grip(K,CX-18,Y0-15+Math.sin(u*20)*.5,0,{side:-1});else{const q=Math.min(1,(u-.5)/.25);g.globalAlpha=1-q;m4grip(K,CX-18-q*6,Y0-15-q*10,0,{side:-1,kind:'palm'});g.globalAlpha=1;}}
    for(const a of adds)if(a.fall>=1&&(a.sp=(a.sp||0)+1/60)<.45){const u=a.sp/.45,rx=6+Math.min(1,u*2.5)*16;g.globalAlpha=.8*(1-u);g.strokeStyle='#fff8e0';g.lineWidth=1;g.beginPath();g.ellipse(CX-18,SY,rx,1.5+rx*.12,0,0,6.29);g.stroke();g.globalAlpha=1;
      if(u<.6)for(let k=0;k<7;k++){const ph=u/.6,an=Math.PI+(k/6)*Math.PI,dx=Math.cos(an)*(3+ph*9),dy=-Math.sin(ph*Math.PI)*(7+(k%3)*4)+Math.sin(an)*2;K.px(CX-18+dx,SY+dy-1,2,2,k%2?COL[1]:'#fff8e0');}}
    // the draught lever on the ash pit: your right fist turns it up as you hold
    const kx=128,ky=136,ka=-2.6+f*1.9,ex=kx+Math.cos(ka)*11,ey=ky+Math.sin(ka)*11;K.ball(kx,ky,4,CA_P.brass);K.line(kx,ky,ex,ey,'#1a0e06',4);K.line(kx,ky,ex,ey,CA_P.brass[3],2);K.line(kx,ky-1,ex,ey-1,CA_P.brass[5],1);K.px(kx-1,ky-1,2,2,CA_P.brass[6]);
    m4grip(K,kx+Math.cos(ka)*9,ky+Math.sin(ka)*9,ka,{side:1});};
  return o;};}
// ---- (t382) the fruit press, drawn as the station: an oak frame, the iron screw through the beam with its bar on top (your fist on the
// bar's end), the pressing board going down into a hooped basket of grapes as you turn, the grapes squeezed out through the slats, the
// must running off the tray's lip into the clay jug. The screw creaks round and the grapes squelch.
{const _ck=S4.crank;S4.crank=(sp,K)=>{const o=_ck(sp,K);if(sp.look!=='press')return o;const st=o.st,g=K.g,N=sp.n||14,O=CA_P.oak,I=CA_P.iron,cx=160;
  const GP=['#24081e','#3e1236','#5a1a50','#7a3a88','#a070b0'];
  o.how='Turn the press bar round: draw circles'+(K.fine?' with the mouse (or hold Space)':' with your finger')+' at an even, steady pace. Too fast and the basket splits.';
  try{if(typeof MF_FOCUS!=='undefined'&&!MF_FOCUS.alcPress)MF_FOCUS.alcPress={r:[96,12,256,134],nh:1};Object.defineProperty(o,'__mfk',{get:()=>'alcPress',set(){},configurable:true});}catch(e){}
  const u0=o.update;let first=true,q4=0;o.update=function(dt,I){const jj=K.judge;K.judge=(s,x,y,q)=>jj(s,58,40,q);let r;try{if(first){first=false;const L=MS.loop;MS.loop=()=>L('lowpass',380,1.2);try{r=u0.apply(this,arguments);}finally{MS.loop=L;}}else r=u0.apply(this,arguments);}finally{K.judge=jj;}
    const q=Math.floor(st.ang/(Math.PI/2));if(q!==q4){q4=q;if(st.spd>1.5&&!st.end){MS.creak();if(q%2===0&&st.coils.length<N)MS.squish();}}return r;};
  const frame=()=>M4.pre('alc_pframe',140,104,k=>{// posts, the beam, the base the tray sits on (drawn at cx-70, 16)
      for(const x of [8,124]){k.px(x,6,9,96,O[3]);k.px(x,6,2,96,O[5]);k.px(x+7,6,2,96,O[1]);for(let y=14;y<96;y+=19)k.px(x+3,y,3,1,O[2]);}
      k.px(0,0,140,11,O[4]);k.px(0,0,140,2,O[6]);k.px(0,9,140,2,O[2]);for(const x of [12,128])k.ell(x,5,2,2,I[4]);k.px(66,0,8,11,I[2]);k.px(66,0,8,1,I[5]);
      M4.outline(k.g.canvas,O[0]);});
  o.draw=function(t){const n=st.coils.length,f=Math.min(1,(n+st.ang/(Math.PI*2))/N),turning=st.spd>1;
    // draw coords are 25 px above the stage: the beam sits at 20-30, the tray top at 104
    const yb=7+f*11,yt=46+f*22,rim=60,trayY=104;
    g.drawImage(frame(),cx-70,27);
    // the tray, the must pooling on it, its lip spout to the right
    K.pa(cx-72,trayY+12,150,3,'#000',.45);K.px(cx-66,trayY,132,10,O[3]);K.px(cx-66,trayY,132,2,O[5]);K.px(cx-66,trayY+9,132,1,O[1]);K.px(cx+66,trayY+2,12,4,O[4]);K.px(cx+66,trayY+2,12,1,O[6]);K.px(cx+76,trayY+3,3,2,O[2]);
    const pool=Math.min(1,f*1.6);if(pool>.02){K.px(cx-60*pool,trayY+1,120*pool,2,GP[2]);K.px(cx-40*pool,trayY+1,50*pool,1,GP[3]);}
    // the basket: oak slats with grapes bulging through the gaps, two iron hoops; the grapes inside go down with the board
    const bw=44,top=Math.max(rim,yt+5);K.px(cx-bw,rim,bw*2,trayY-rim,'#14060f');for(let x=-bw;x<bw;x+=9){const lit=x<-10;K.px(cx+x,rim,6,trayY-rim,O[lit?4:3]);K.px(cx+x,rim,1,trayY-rim,O[lit?6:5]);K.px(cx+x+5,rim,1,trayY-rim,O[1]);
      for(let y=rim+3;y<trayY-2;y+=7+((x+y)%3))K.px(cx+x+2+((y>>2)%2),y,1,3+((x*y)%3),O[2]);
      for(let y=top+1,i=0;y<trayY-2;i++){const c=(x*3+i*5)%3,bx=cx+x+5+((i+x)%2);K.px(bx,y,4,3,GP[1+c]);K.px(bx+1,y-1,2,1,GP[1+c]);K.px(bx,y,1,1,GP[4]);K.px(bx+1,y,1,1,GP[3]);K.px(bx+3,y+2,1,1,GP[0]);y+=3+((x+i*7)%2);}
      if(f>.05)for(let y=rim+4;y<trayY;y+=1)if(((y*7+x)%13)<Math.round(1+f*5))K.px(cx+x+((y+x)%2?0:5),y,1,1,GP[2]);}
    for(const hy of [rim+8,trayY-10]){K.px(cx-bw-1,hy,bw*2+1,3,I[3]);K.px(cx-bw-1,hy,bw*2+1,1,I[5]);K.px(cx-bw-1,hy+2,bw*2+1,1,I[1]);}
    // grapes heaped above the rim before the board bears down
    if(yt+5<rim)for(let i=0;i<60;i++){const x=cx-bw+2+((i*13)%(bw*2-5)),y=rim-1-((i*7)%Math.max(1,rim-yt-5));K.px(x,y,3,3,GP[1+(i%3)]);K.px(x,y,1,1,GP[4]);K.px(x+2,y+2,1,1,GP[0]);if(i%9===0)K.px(x+1,y-1,1,2,'#4a6a2a');}
    // the pressing board and the block on it
    K.px(cx-bw+2,yt,bw*2-4,6,O[3]);K.px(cx-bw+2,yt,bw*2-4,2,O[5]);K.px(cx-bw+2,yt+5,bw*2-4,1,O[1]);K.px(cx-10,yt-6,20,6,O[4]);K.px(cx-10,yt-6,20,1,O[6]);
    // the screw: iron, its thread turning as it goes down through the beam
    const sTop=yb+4;K.px(cx-4,sTop,8,yt-6-sTop,I[3]);K.px(cx-4,sTop,2,yt-6-sTop,I[5]);K.px(cx+3,sTop,1,yt-6-sTop,I[1]);const ph=((st.ang/(Math.PI*2))*4)%1;for(let y=sTop+ph*4;y<yt-6;y+=4){K.px(cx-4,y,8,1,I[1]);K.px(cx-3,y+1,6,1,I[6]);}
    K.px(cx-7,27,14,11,O[4]);K.px(cx-7,27,14,2,O[6]);K.px(cx-4,29,8,8,I[2]);K.px(cx-4,29+((ph*4)|0)%4,8,1,I[6]);
    // the must runs off the lip into the jug while the screw is turning
    const flow=turning&&n<N?Math.min(1,st.spd/6)*Math.min(1,f*4):0;const jx=cx+77,jy=trayY+14;K.pa(jx-16,jy+33,36,3,'#000',.45);g.drawImage(M4S.jug(),jx-19,jy-5);
    if(flow>.05){for(let y=trayY+5;y<jy;y++)K.px(jx-1,y,2,1,y%3?GP[2]:GP[3]);K.px(jx-3,jy,6,1,GP[4]);}
    const lv=Math.min(1,f);K.ell(jx,jy,6,1,lv>.1?GP[2]:'#3a3428');if(lv>.1)K.px(jx-4,jy,3,1,GP[3]);
    // the bar across the screw's head, seen turning; your fist round its near end
    const bx=Math.cos(st.ang)*44,by=Math.sin(st.ang)*6,y0=yb+4;K.line(cx-bx,y0-by,cx+bx,y0+by,'#141418',5);K.line(cx-bx,y0-by,cx+bx,y0+by,I[4],3);K.line(cx-bx,y0-by-1,cx+bx,y0+by-1,I[6],1);
    K.ball(cx,y0,4,I);m4grip(K,cx+bx*.9,y0+by*.9,Math.atan2(by,bx),{side:1});};
  return o;};}
// (t382) the new rooms' light (the fire in the firebox door; the lantern over the bench) and their sound (the forge's fire, the barn's boards)
Object.assign(MG4ART.LIGHT,{stillhouse:{x:160,y:136,r:250,c:'255,140,60',a:.34},brewhouse:{x:160,y:136,r:250,c:'255,140,60',a:.34},
  stillbench:{x:100,y:24,r:280,c:'255,196,130',a:.32,mote:'#d8c8a8'},brewbench:{x:100,y:24,r:280,c:'255,196,130',a:.32,mote:'#d8c8a8'}});
if(typeof MAMB!=='undefined')Object.assign(MAMB,{stillhouse:MAMB.forge,brewhouse:MAMB.forge,stillbench:MAMB.barn,brewbench:MAMB.barn});
// (t382) a stoneware crock for the must, the same size and mouth as the kitchen's bowls
{const _bw=M4S.bowl;M4S.bowl=c=>c!=='crock'?_bw(c):M4.pre('bowlcrock',60,26,k=>{const S=['#2a2622','#4a443c','#6e665a','#948a78','#b4aa96','#d2c8b2'],Gz=['#2a160a','#4a2810','#6a3c1a','#8a5226','#a86a34','#c08848'];
  for(let y=5;y<26;y++){const r=28-Math.round(Math.max(0,y-18)*.6);for(let x=-r;x<=r;x++){const s_=x/r,d=Math.max(0,-s_*.6+Math.sqrt(1-s_*s_)*.6);const P=y<11?Gz:S;let kk=Math.round(1.3+d*4);if(y===25)kk=1;k.px(30+x,y,1,1,P[Math.max(0,Math.min(5,kk))]);}}
  k.ell(30,5,29,5,Gz[2]);k.ell(30,5,28,4.4,Gz[4]);k.ell(30,5.4,26,3.8,'#2a1a10');for(let x=-20;x<=20;x+=2)k.px(30+x,15+Math.round(2*Math.sqrt(1-(x/28)**2)),2,1,'#7e7464');M4.outline(k.g.canvas,'#1a120c');});}
const BG=(scene,steps,icon)=>({scene,reveal:m4ico(icon),steps});
const SPIRC=['#3e525c','#d8eef4'],WORT=['#6e3810','#a8641e'],CORNC=['#c89e3c','#e6c260'],POTC=['#c4b892','#e2d8b6'],GRAPEC=['#4a1a52','#7a3a88'],CLEARC=['#c8d8dc','#eef6f6'];
Object.assign(MG4R,{
  'b_brew:wort_ale':BG('brewbench',[{k:'crank',t:'Crack the barley in the quern',look:'quern',n:10},{k:'simmer',t:'Hold the mash warm, not hot',scene:'brewhouse',look:'kettle',col:CORNC,lo:.42,hi:.6,adds:[{at:2.6,icon:'barley'},{at:6,icon:'barley'}],bits:['#e6c87a','#c8a050']},{k:'sieve',t:'Run the wort off the grain',look:'lauter'},{k:'simmer',t:'Boil it hard and drop in the hops',scene:'brewhouse',look:'kettle',col:WORT,lo:.66,hi:.86,adds:[{at:2.6,icon:'hops'}],bits:['#e8d8a8','#7aa040']}],'wort_ale'),
  'b_brew:wort_pump':BG('brewbench',[{k:'scoop',t:'Scoop out the pumpkin',n:20},{k:'crank',t:'Crack the barley in the quern',look:'quern',n:8},{k:'simmer',t:'Boil it with the hops',scene:'brewhouse',look:'kettle',col:['#a8501a','#d87a2a'],lo:.62,hi:.84,adds:[{at:2.2,icon:'pumpkin'},{at:4.8,icon:'hops'}],bits:['#f0c070','#7aa040']}],'wort_pump'),
  'b_brew:mash_corn':BG('brewbench',[{k:'crank',t:'Grind the corn in the quern',look:'quern',n:12,grain:['#b08a2c','#e6c260','#f6dc84']},{k:'simmer',t:'Cook the mash low and slow',scene:'brewhouse',look:'kettle',col:CORNC,lo:.5,hi:.7,slow:.8,adds:[{at:3,icon:'barley'}],bits:['#f4dc84','#b08a40']}],'mash_corn'),
  'b_brew:mash_potato':BG('brewbench',[{k:'chop',t:'Chop the potatoes',veg:['potato','potato','potato']},{k:'simmer',t:'Cook them to a paste',scene:'brewhouse',look:'kettle',col:POTC,lo:.5,hi:.7,slow:.8,adds:[{at:3,icon:'barley'}],bits:['#f2ecd4','#a89a74']}],'mash_potato'),
  'b_press:must_grape':BG('barn',[{k:'crank',t:'Turn the press screw down',look:'press',n:14},{k:'sieve',t:'Strain out the skins',look:'skins'},{k:'pour',t:'Pour the must into the crock, to the line',col:GRAPEC,bowl:'crock',line:.75}],'must_grape'),
  'b_still:white_dog':BG('stillbench',[{k:'simmer',t:'Keep the still just under the boil',scene:'stillhouse',look:'still',col:CORNC,lo:.6,hi:.72,adds:[],bits:['#f4dc84']},{k:'pour',t:'Catch the hearts in the flask, stop at the line',col:SPIRC,bowl:'flask',line:.75,look:'bottle'},{k:'cork',t:'Cork it',col:SPIRC,look:'bench'}],'white_dog'),
  'b_still:vodka':BG('stillbench',[{k:'simmer',t:'Keep the still just under the boil',scene:'stillhouse',look:'still',col:POTC,lo:.6,hi:.72,adds:[],bits:['#f2ecd4']},{k:'sieve',t:'Filter it through the charcoal',look:'charcoal'},{k:'pour',t:'Bottle it to the line',col:SPIRC,bowl:'flask',line:.8,look:'bottle'},{k:'cork',t:'Cork it',col:SPIRC,look:'bench'}],'vodka'),
  'b_still:hollow_gin':BG('stillbench',[{k:'chop',t:'Chop the glowcaps',veg:['shroom','shroom']},{k:'simmer',t:'Run the vodka back over them, gently',scene:'stillhouse',look:'still',col:['#5aa884','#a6dcc8'],spirit:['#2f6a58','#a6f0d0'],glow:1,lo:.55,hi:.68,adds:[{at:2.4,icon:'mushroom'}],bits:['#c0ecd4','#f0fce0']},{k:'pour',t:'Bottle it while it still glows',col:['#5aa884','#c0ecd4'],bowl:'flask',line:.8,look:'bottle'},{k:'cork',t:'Cork it',col:['#5aa884','#c0ecd4'],look:'bench'}],'hollow_gin'),
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
