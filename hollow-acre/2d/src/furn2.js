/* ================= more furniture, and a choice of finish. Ten new pieces at the furniture bench (and from Nell, made to
   order): a bookcase, a writing desk, a grandfather clock, a dining table, a chess table, an upright piano, a globe on its
   stand, a candelabra, a cider keg, and a cradle you don't remember deciding to make. Each has its own making game.
   Wooden pieces come in five finishes: while you're placing one, Finish (or F) turns it natural, dark walnut, white, sage or
   red; move a piece to change it again. The clock ticks while you're home. The cradle rocks at night, when your mind is going,
   with nobody near it. ================= */
Object.assign(FURN,{
  bookcase:['Bookcase','in_shelf_books',{wood:14},[1.6,.62],null],
  desk:['Writing desk','in_desk',{wood:12},[3.2,.95],null],
  clock:['Grandfather clock','in_clock',{wood:10,copper_bar:1},[5.6,.55],null],
  table:['Dining table','in_table',{wood:10},[4.2,3.4],null],
  chess:['Chess table','in_chess',{wood:8,stone:4},[2.5,3.5],null],
  piano:['Upright piano','in_piano',{wood:30,copper_bar:2},[3,.95],null],
  globe:['Globe on a stand','in_globe',{wood:4,copper_bar:1},[1.2,4],null],
  candles:['Candelabra','in_candles',{wood:2,fiber:6},[3,3],null],
  keg:['Cider keg','in_keg',{wood:8,iron_bar:1},[5.4,5],null],
  cradle:['Cradle','in_cradle',{wood:8},[2,4.5],null]});
Object.assign(FURN_FP,{bookcase:[1.6,.45],desk:[1.76,.45],clock:[.6,.3],table:[1.7,.45],chess:[1.2,.45],piano:[2.2,.55],globe:[.7,.35],candles:[1.1,.35],keg:[1.2,.45],cradle:[1.1,.5]});
const FURN_DESC={bookcase:'Grandpa’s books, off the floor at last. Some of the spines have your name on them.',desk:'Somewhere to write the letters you might not send.',
  clock:'It runs a little behind. Wind it anyway; the house feels wrong without the ticking.',table:'Room for two. Room for guests, if anyone comes.',
  chess:'Someone keeps moving the pieces while you sleep. They’re winning.',piano:'Out of tune in a way you start to like. Copper strings, a brass frame.',
  globe:'The valley isn’t on it. Nowhere near here is.',candles:'Light that doesn’t need oil. Seven candles; you only lit six.',
  keg:'Orchard cider, if Orla will sell you the apples. It keeps a long time in the dark.',cradle:'You don’t know why you made it. It’s the right size for something.'};
{const _r=vendors.b_furn.rows;vendors.b_furn.rows=()=>_r().map(r=>FURN_DESC[r.k]?Object.assign(r,{desc:FURN_DESC[r.k]+(r.desc.match(/ You have \d+\./)||[''])[0]}):r);}
// ---- each one's own making game
Object.assign(MG4R,{
  'b_furn:bookcase':{scene:'workshop',reveal:m4spr('in_shelf_books',2),steps:[{k:'saw',t:'Cut the uprights and the shelves',n:10,seed:21,wood:CA_P.oak},{k:'plane',t:'Plane the faces flat',wood:CA_P.oak,seed:9},{k:'brush',t:'Wax it to a shine',look:'wax',wood:CA_P.oak}]},
  'b_furn:desk':{scene:'workshop',reveal:m4spr('in_desk',2),steps:[{k:'plane',t:'Plane the writing top dead flat',wood:CA_P.oak,seed:14},{k:'saw',t:'Cut the drawer front',n:6,seed:23},{k:'hammer',t:'Fit the drawer runners',n:4,edge:1,wood:CA_P.oak}]},
  'b_furn:clock':{scene:'workshop',reveal:m4spr('in_clock',2.4),steps:[{k:'saw',t:'Cut the case',n:8,seed:27},{k:'level',t:'Stand the case plumb',look:'door',dur:3.2},{k:'crank',t:'Wind the movement',n:12}]},
  'b_furn:table':{scene:'workshop',reveal:m4spr('in_table',2),steps:[{k:'plane',t:'Plane the tabletop',wood:CA_P.wood,seed:31},{k:'hammer',t:'Peg the legs in',n:4,edge:1},{k:'brush',t:'Stain it dark',col:'#3a2010',time:15}]},
  'b_furn:chess':{scene:'workshop',reveal:m4spr('in_chess',2.4),steps:[{k:'saw',t:'Cut the board square',n:6,seed:41},{k:'brush',t:'Paint the dark squares',col:'#24140e',time:14},{k:'brush',t:'Wax the board',look:'wax'}]},
  'b_furn:piano':{scene:'workshop',reveal:m4spr('in_piano',1.8),steps:[{k:'saw',t:'Cut the case panels',n:10,seed:44,wood:CA_P.oak},{k:'hammer',t:'Pin the strings to the frame',n:6,look:'rivet',metal:'brass'},{k:'crank',t:'Tune the strings, one by one',n:16}]},
  'b_furn:globe':{scene:'workshop',reveal:m4spr('in_globe',2.6),steps:[{k:'brush',t:'Paint the oceans',col:'#3a6a8a',time:14},{k:'hammer',t:'Fit the brass meridian',n:3,look:'rivet',metal:'brass'},{k:'crank',t:'Set it spinning true',n:8}]},
  'b_furn:candles':{scene:'workshop',reveal:m4spr('in_candles_n',2.4),steps:[{k:'pour',t:'Pour the wax into the moulds',col:['#e8dcc0','#f8f0dc'],bowl:'tin',line:.8},{k:'knot',t:'Tie off the wicks'},{k:'light',t:'Light them',look:'lamp'}]},
  'b_furn:keg':{scene:'workshop',reveal:m4spr('in_keg',2.6),steps:[{k:'saw',t:'Cut the staves',n:8,seed:51},{k:'hammer',t:'Drive the iron hoops on',n:4,look:'rivet',metal:'iron'},{k:'pour',t:'Fill it with cider',col:['#c8902a','#e8b44a'],bowl:'wood',line:.75}]},
  'b_furn:cradle':{scene:'workshop',reveal:m4spr('in_cradle',2.6),steps:[{k:'saw',t:'Cut the rockers',n:6,seed:61},{k:'plane',t:'Sand it smooth, for small hands',wood:CA_P.wood,seed:6},{k:'sew',t:'Stitch the little blanket',n:12}]}});
if(typeof CRAFT_ICON!=='undefined')for(const k of Object.keys(FURN_DESC))CRAFT_ICON[k]=CRAFT_ICON[k]||FURN[k][1];

// ---- finishes: the wood of a piece re-coloured, worked out once per sprite and kept
const FINS=['natural','walnut','white','sage','red'];
const FIN_NAME={natural:'natural wood',walnut:'dark walnut',white:'white paint',sage:'sage paint',red:'barn-red paint'};
const FIN_RAMP={walnut:['#160d08','#2a190f','#3f2617','#573521','#71462c','#8c5a39'],white:['#3e3d4a','#6d6c78','#9c9ba4','#c6c4c4','#e2ded4','#f4f1e8'],
  sage:['#222b1b','#36452b','#4f633e','#6d8355','#90a674','#b6c69a'],red:['#2e1214','#4d1c1d','#6e2a25','#913b31','#b25645','#cc7a60']};
const FINISHABLE=new Set(['chair','shelf','crates','bookcase','desk','clock','table','chess','piano','globe','keg','cradle']);
function finishSpr(spr,fin){if(!spr||!fin||fin==='natural')return spr;const key=spr+'~'+fin;if(SPR[key])return key;const m=SPR[spr],im=m&&IMG[m.src];if(!im||!im.width)return spr;
  const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height),D=d.data;
  const R=FIN_RAMP[fin].map(h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
  for(let i=0;i<D.length;i+=4){if(D[i+3]<10)continue;const r=D[i]/255,gg=D[i+1]/255,b=D[i+2]/255,mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),v=mx,s=mx?(mx-mn)/mx:0;
    if(v<.13||s<.22)continue;let h=0;if(mx!==mn){if(mx===r)h=((gg-b)/(mx-mn))%6;else if(mx===gg)h=(b-r)/(mx-mn)+2;else h=(r-gg)/(mx-mn)+4;h*=60;if(h<0)h+=360;}
    if(h<12||h>46)continue;   // only the browns of the wood: not the brass, the glass, the books' cloth or the outline
    const q=R[Math.max(0,Math.min(5,Math.round((v-.12)/.72*5)))];D[i]=q[0];D[i+1]=q[1];D[i+2]=q[2];}
  g.putImageData(d,0,0);IMG['fin:'+key]=c;SPR[key]=Object.assign({},m,{src:'fin:'+key});return key;}
// a placed piece wears its finish (and remembers where it stands, for the cradle)
{const _pf=placeFurnAt;placeFurnAt=function(k,x,z,rot){const made=_pf.apply(this,arguments);try{const p=(S.furnPlaced||[]).find(q=>q.k===k&&q.x===x&&q.z===z);const o=made&&made.o;
  if(o){o.bx=x;if(p&&p.fin&&p.fin!=='natural'){o.spr=finishSpr(o.spr,p.fin);if(o.night)o.night=finishSpr(o.night,p.fin);}}}catch(e){}return made;};}
// choosing it while you place: a Finish button on the placement bar, F on a keyboard
function placeFinish(){const sp=PLACE.on&&PLACE.spec;if(!sp||!sp.furn||!FINISHABLE.has(sp.furn))return;const i=FINS.indexOf(sp.fin||'natural');sp.fin=FINS[(i+1)%FINS.length];
  const v=furnView(sp.furn,sp.rot||'S');sp.spr=finishSpr(v.spr,sp.fin);SFX.page&&SFX.page();toast(`Finish: ${FIN_NAME[sp.fin]}.`,1);}
{const b=document.createElement('button');b.className='close';b.id='placeFin';b.textContent='Finish';b.style.display='none';$('placeOk').before(b);
  b.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();placeFinish();});
  addEventListener('keydown',e=>{if(PLACE.on&&e.code==='KeyF'&&!e.repeat){placeFinish();e.stopImmediatePropagation();e.preventDefault();}},true);
  const _ps=startPlace;startPlace=function(spec){_ps.apply(this,arguments);const ok=spec&&spec.furn&&FINISHABLE.has(spec.furn);$('placeFin').style.display=ok?'':'none';
    if(ok){if(spec.fin&&spec.fin!=='natural')spec.spr=finishSpr(spec.spr,spec.fin);$('placeHint').innerHTML+=matchMedia('(pointer:fine)').matches?' <b>F</b> changes the finish.':' <b>Finish</b> changes the wood.';}};
  const _pr=placeRotate;placeRotate=function(){_pr.apply(this,arguments);const sp=PLACE.on&&PLACE.spec;if(sp&&sp.fin&&sp.fin!=='natural')sp.spr=finishSpr(sp.spr,sp.fin);};}
// lifting a piece to move it starts it in its own finish
{const _sf=startFurn;startFurn=function(k,opt){_sf.apply(this,arguments);if(opt&&opt.fin&&PLACE.on&&PLACE.spec&&PLACE.spec.furn===k){PLACE.spec.fin=opt.fin;PLACE.spec.spr=finishSpr(PLACE.spec.spr,opt.fin);}};}
// ---- the clock ticks while you're home; at night, with your mind going, the cradle rocks with nobody near it
let FURN_LIFE={t:0,tick:0,clock:false,cradles:[]};
{const _lu=lifeUpdate;lifeUpdate=function(dt){_lu(dt);if(S.room!=='cabin'){FURN_LIFE.clock=false;return;}
  FURN_LIFE.t-=dt;if(FURN_LIFE.t<=0){FURN_LIFE.t=.5;FURN_LIFE.cradles=OBJ.filter(o=>o.room==='cabin'&&!o.hide&&o.furnKey==='cradle');FURN_LIFE.clock=OBJ.some(o=>o.room==='cabin'&&!o.hide&&o.furnKey==='clock');}
  const rock=isNight()&&typeof tierOf==='function'&&tierOf(M.v)>=1;
  for(const o of FURN_LIFE.cradles){if(o.bx===undefined)continue;o.x=o.bx+(rock&&Math.hypot(P.x-o.bx,P.z-o.z)>1.6?Math.sin(performance.now()/650)*.06:0);}
  if(FURN_LIFE.clock&&S.mode==='play'){FURN_LIFE.tick-=dt;if(FURN_LIFE.tick<=0){FURN_LIFE.tick=1;FURN_LIFE.tock=!FURN_LIFE.tock;if(typeof A!=='undefined'&&A.ok)A.tone(FURN_LIFE.tock?1900:1500,.018,'square',.005);}}};}
