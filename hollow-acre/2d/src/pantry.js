/* ================= #237 many more things to make, each with its making game. Similar things share a game, and every game is
   built from parts the others use: the kitchen churns butter (a new churn for the crank), sets cheese, bakes cornbread and
   carrot cake (one mix-and-bake game for both), boils grape jam, makes potato soup and salts cabbage that a keg turns into
   sauerkraut; the workbench braids rope and weaves a basket; the farm bench turns a compost heap that gives a growing crop
   a better chance to come out fine or prize, and saves seed from each of the six new crops (one threshing game for all). == */
Object.assign(ITEMS,{
  butter:{name:'Butter',icon:'butter',food:[15,0],sell:30,desc:'Churned from your own milk. Cornbread and carrot cake want it.'},
  cheese:{name:'Farmhouse cheese',icon:'cheese',food:[40,10],sell:75,desc:'Pressed and waxed. It keeps all winter, if there is a winter.'},
  cornbread:{name:'Cornbread',icon:'cornbread',food:[45,10],sell:55,desc:'Golden and crumbly, baked in Grandpa’s square tin. +45 energy.'},
  carrot_cake:{name:'Carrot cake',icon:'carrot_cake',food:[60,20],sell:95,desc:'Two layers and a thick cream between. Someone in town would love this.'},
  jam:{name:'Grape jam',icon:'jam',food:[25,5],sell:60,desc:'Dark and sweet, under a gingham cap.'},
  kraut_raw:{name:'Salted cabbage',icon:'kraut_raw',sell:20,desc:'Cabbage packed down in salt in a crock. Three days in a keg and it’s sauerkraut.'},
  sauerkraut:{name:'Sauerkraut',icon:'sauerkraut',food:[30,15],sell:55,desc:'Sour and bright. Good for you, Agnes says, in a voice that means it.'},
  potato_soup:{name:'Potato soup',icon:'potato_soup',food:[50,20],sell:70,desc:'Thick, creamy, a little carrot in it. +50 energy, +20 health.'},
  rope:{name:'Rope',icon:'rope',sell:24,desc:'Braided from fibre. Somebody always needs rope.'},
  basket:{name:'Woven basket',icon:'basket',sell:65,desc:'Over-and-under, with a good handle. A fine gift, or a fine thing to sell.'},
  compost:{name:'Compost',icon:'compost',sell:8,desc:'Turned and sifted. Spread it on a growing crop: it’s likelier to come out fine or prize.'}});
// ---- the churn: the crank's steady circles, drawn as the dasher going up and down in an upright churn
{const _ck=S4.crank;S4.crank=(sp,K)=>{const o=_ck(sp,K);if(sp.look!=='churn')return o;const st=o.st;
  o.how='Work the dasher: draw circles'+(K.fine?' with the mouse (or hold Space)':' with your finger')+' at an even, steady pace. Too fast and it splashes; too slow and it never comes.';
  o.draw=function(t){const O=CA_P.oak,I=CA_P.iron,n=st.coils.length,N=sp.n||14,f=Math.min(1,n/N),cx=160;
    K.ell(cx,146,40,7,'#00000040');
    for(let y=60;y<144;y++){const w=Math.round(26+(y-60)*.12);for(let x=-w;x<=w;x++){const u=x/w;K.px(cx+x,y,1,1,O[u<-.6?4:u<-.1?3:u<.5?2:1]);}if(y===72||y===132){K.px(cx-w,y,w*2+1,2,I[3]);K.px(cx-w,y,8,1,I[5]);}}
    K.ell(cx,60,26,6,O[1]);K.ell(cx,59,24,5,f>.5?'#f0d470':'#efe6d4');
    const lift=Math.sin(st.ang)*16,hy=34-lift;K.px(cx-2,hy,4,46,O[4]);K.px(cx-2,hy,1,46,O[5]);K.px(cx-7,hy-4,14,5,O[3]);K.px(cx-7,hy-4,14,1,O[5]);
    if(st.spd>9)for(let i=0;i<4;i++)K.px(cx-20+i*12,52-((t*40+i*9)%14),2,2,'#f6f0e2');
    for(let i=0;i<Math.round(f*8);i++)K.px(cx-14+i*4,57+(i%2),3,2,'#f0d470');
    m4hand(K,cx,hy-2);};
  return o;};}
// ---- the recipes, and their games
const takeP=p=>{for(const [k,n] of Object.entries(p))takeBasket(k,n);};
const pRow=(k,name,desc,need,produce,btn)=>({k,name,desc,price:0,btn,need:need&&Object.keys(need).length?need:undefined,produce,can:true,buy(){if(produce)takeP(produce);addInv(k,1);updateHud&&updateHud();}});
{const _rc=vendors.cook.rows;vendors.cook.rows=()=>{const r=_rc();r.push(
  pRow('butter','Butter','2 milk, churned until it comes. Butter for the cornbread and the cake.',{milk:2},null,'Churn'),
  pRow('cheese','Farmhouse cheese','3 milk: warm it, strain the curds, press it in the mould.',{milk:3,wood:1},null,'Make'),
  pRow('cornbread','Cornbread','2 corn, an egg and butter, mixed and baked in the square tin.',{butter:1,wood:1},{corn:2,egg:1},'Bake'),
  pRow('carrot_cake','Carrot cake','2 carrots, an egg and butter, mixed and baked, with cream between the layers.',{butter:1,milk:1,wood:1},{carrot:2,egg:1},'Bake'),
  pRow('jam','Grape jam','3 bunches of grapes boiled down and bottled.',{wood:1},{grapes:3},'Boil'),
  pRow('kraut_raw','Salted cabbage','2 cabbages, shredded and packed in salt. A keg turns it to sauerkraut in three days.',{stone:1},{cabbage:2},'Pack'),
  pRow('potato_soup','Potato soup','2 potatoes, a carrot and a bottle of milk.',{milk:1,wood:1},{potato:2,carrot:1},'Cook'));return r;};}
CRAFT.push(['rope','Rope',{fiber:6},'Braid six handfuls of fibre into a good rope.',()=>addInv('rope',1)],
  ['basket','Woven basket',{fiber:10,wood:2},'Weave a basket over a frame of split wood.',()=>addInv('basket',1)]);
{const _rf=vendors.b_farm.rows;vendors.b_farm.rows=()=>{const r=_rf();
  r.push({k:'compost',name:'Compost ×3',desc:'Turn a heap of fibre and bone meal and sift it fine. Spread on a growing crop for a better chance of fine or prize.',price:0,btn:'Make',need:{fiber:6,fert:1},can:true,buy(){addInv('compost',3);}});
  for(const id of ['potato','carrot','cabbage','barley','hops','grapes'])r.push({k:'seed_'+id,name:`${ITEMS[id]?ITEMS[id].name:(PRODUCE_NAMES[id]||id)} seeds ×4`,desc:`Save seed from one ${(PRODUCE_NAMES[id]||id).toLowerCase()}.`,price:0,btn:'Make',produce:{[id]:1},can:true,buy(){takeP({[id]:1});S.seeds[id]=(S.seeds[id]||0)+4;updateHud&&updateHud();}});
  return r;};}
Object.assign(CRAFT_ICON,{seed_potato:'seed_potato',seed_carrot:'seed_carrot',seed_cabbage:'seed_cabbage',seed_barley:'seed_barley',seed_hops:'seed_hops',seed_grapes:'seed_grapes'});
Object.assign(RECIPE_LV,{'cook:cheese':['farming',3],'cook:carrot_cake':['farming',4],'cook:potato_soup':['farming',2],'craft:basket':['foraging',2],'b_farm:compost':['farming',2]});
const BAKE=(icon,t1,col)=>({scene:'kitchen',reveal:m4ico(icon),steps:[{k:'roll',t:t1},{k:'bake',t:'Bake it golden'}]});
Object.assign(MG4R,{
  'cook:butter':{scene:'kitchen',reveal:m4ico('butter'),steps:[{k:'crank',t:'Churn it until it comes',look:'churn',n:14},{k:'scale',t:'Pat it into a block',col:['#f0d470','#f8e8a4'],mark:.6}]},
  'cook:cheese':{scene:'kitchen',reveal:m4ico('cheese'),steps:[{k:'simmer',t:'Warm the milk, gently',scene:'stove',col:['#efe6d4','#fbf6ea'],lo:.35,hi:.5,bits:['#f8f2e4']},{k:'sieve',t:'Strain off the curds',look:'rinse'},{k:'scale',t:'Press it into the mould',col:['#e6bc52','#f4d684'],mark:.7}]},
  'cook:cornbread':BAKE('cornbread','Mix the batter and spread it in the tin'),
  'cook:carrot_cake':BAKE('carrot_cake','Mix the batter and spread it in the tin'),
  'cook:jam':{scene:'kitchen',reveal:m4ico('jam'),steps:[{k:'simmer',t:'Boil the grapes down',scene:'stove',col:['#4a1450','#7a3a88'],lo:.6,hi:.8,adds:[{at:2.4,icon:'grapes'}],bits:['#8a3a96','#b066bc']},{k:'pour',t:'Fill the jar to the line',col:['#4a1450','#7a3a88'],bowl:'flask',line:.8},{k:'cork',t:'Tie on the cap',col:['#4a1450','#7a3a88']}]},
  'cook:kraut_raw':{scene:'kitchen',reveal:m4ico('kraut_raw'),steps:[{k:'chop',t:'Shred the cabbage',veg:['cabbage','cabbage']},{k:'scale',t:'Weigh in the salt',col:['#f4f0ea','#ffffff'],mark:.4}]},
  'cook:potato_soup':{scene:'kitchen',reveal:m4ico('potato_soup'),steps:[{k:'chop',t:'Dice the potatoes and carrot',veg:['potato','carrot','potato']},{k:'simmer',t:'Simmer it thick with the milk',scene:'stove',col:['#f0e2b8','#fbf2da'],bits:['#f8eec8','#e4741e','#7aa64c'],slow:.85},{k:'pour',t:'Ladle it into the bowl',vessel:'ladle',col:['#f0e2b8','#fbf2da']}]},
  'craft:rope':{scene:'workshop',reveal:m4ico('rope'),steps:[{k:'braid',t:'Braid the fibre',n:12,cols:['#a4864c','#c4a868','#7e6238']}]},
  'craft:basket':{scene:'workshop',reveal:m4ico('basket'),steps:[{k:'braid',t:'Weave the sides over and under',n:14,cols:['#b08a48','#ccaa64','#8e6a34']},{k:'knot',t:'Bind the handle on tight'}]},
  'b_farm:compost':{scene:'barn',reveal:m4ico('compost'),steps:[{k:'scoop',t:'Turn the heap',n:24},{k:'sieve',t:'Sift it fine'}]}});
for(const id of ['potato','carrot','cabbage','barley','hops','grapes'])MG4R['b_farm:seed_'+id]=Object.assign({},MG4R['b_farm:ts'],{reveal:m4ico('seed_'+id)});
for(const k of Object.keys(MG4R))if(/^(cook:(butter|cheese|cornbread|carrot_cake|jam|kraut_raw|potato_soup)|craft:(rope|basket)|b_farm:(compost|seed_\w+))$/.test(k)&&!CG3_RECIPES[k])CG3_RECIPES[k]={pantry:k};
// salted cabbage ferments in a keg
if(typeof KEG!=='undefined')KEG.brew_keg.rules.kraut_raw=['sauerkraut',3];
// ---- compost: spread it on a growing crop (once); it shifts the odds at harvest one grade up, a third of the time
{const _cc=computeContext;computeContext=function(){const r=_cc.apply(this,arguments);try{if(!r||!/^(Growing|Water|Bone meal)/.test(r.label||'')||inv('compost')<1)return r;const t=targetTile();if(!t||!t.crop||t.crop.comp||t.crop.stage>=3)return r;
  return {label:'Spread compost',ok:true,act(){takeInv('compost',1);t.crop.comp=1;burst(t.x,t.z,8,'#4a3424',.8,.5,1.5);SFX.plant&&SFX.plant();toast('Worked in round the roots.',1.2);}};}catch(e){}return r;};}
if(typeof cropQuality==='function'){const _q=cropQuality;cropQuality=function(c){const q=_q.apply(this,arguments);return c&&c.comp&&q<2&&rand()<.35?q+1:q;};}
{const _ii=itemInfo;itemInfo=function(key){const o=_ii.apply(this,arguments);try{if(o&&o.type==='P'&&typeof CROP2!=='undefined'){}}catch(e){}return o;};}
// ---- they sell in the compete market too
if(typeof MK_K!=='undefined'){Object.assign(MK_K,{butter:14,cheese:8,cornbread:10,carrot_cake:6,jam:8,sauerkraut:8,potato_soup:8,rope:12,basket:6});
  const C=MK_BUYERS.find(b=>b[0]==='Coyle’s store');if(C)C[1].push('butter','cheese','jam','rope','basket');const L=MK_BUYERS.find(b=>b[0]==='The Lamplighter');if(L)L[1].push('cornbread','carrot_cake','sauerkraut','potato_soup');}
