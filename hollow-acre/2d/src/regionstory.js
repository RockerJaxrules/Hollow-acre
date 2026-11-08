/* ================= what the new land means. Every region is part of the story: each has a beat in the chapters, sent to by the goal
   bar and the guide arrow like the rest, that plays when you get there and goes in your journal.
     Chapter One   the Pine Rest register (your name, in your hand, the night you crashed); the county line (it lets you go, and you
                   come in at your own gate)
     Chapter Two   the dolls in the Weeping Birches; the intake book at Greyfield (the town bought orphans for the Tithe); then,
                   before the stones will sit, the Covenant on Old Marrow's altar, what the fen keeps, the wheel seen from the
                   lookout, and the drowned street under the reservoir
     Chapter Three the scarecrow in the Deep Corn that wears your clothes
   And each place is worth going back to: something to gather there every day, fish in the fen and the reservoir, and the old
   county milestones, chalked with a wheel, that take you between any two you have found. ================= */
S.rg=S.rg||{seen:{},f:[],fday:0,gaveDoll:0};
const RG_LINE={r9w:'The road you came in on. It goes on, and on, to the county line.',grey:'Red brick behind an iron fence. Someone has kept the children’s graves weeded.',
  fen:'The river gives out here into black water. What goes in, stays.',corn:'Harlan’s fields, grown into a maze. Something is walking the next row over, keeping pace.',
  drown:'Marrow Reservoir, 1931. A steeple stands up out of the water.',ridge:'Dark pines and granite. Up on the rise, the fire lookout.',
  marrow:'The first town, burnt in 1872. The ground is still ash.',birch:'White trees, and in them, little shapes turning on strings.'};
// ---- the beats
const RG_BEATS=[
 {after:'graves',id:'motel',gate:'c1',name:'The Pine Rest register',at:()=>({x:RGP.motel.x-2.8,z:RGP.motel.z+.7}),r:2,
  goal:'West along Route 9, past where you crashed, the Pine Rest Motel was lit the night you arrived. Go and look in the office.',
  title:'The Pine Rest register',text:`The office door is unlocked. The bell over it has had its clapper pulled out. On the board behind the desk, seven hooks, six keys. Room 6 is missing.<br><br>The register lies open on the counter. One guest a year, every autumn, back to 1952, each in a different hand. All of them in Room 6. None of them signed out.<br><br>The last line is in your handwriting. Your name, your car, your plate. The date is the night you crashed. Under <i>purpose of visit</i> you have written, neatly: <i>coming home.</i><br><br>You didn’t stop here. You’re sure you didn’t stop here. The ink is still wet.`,
  lore:'The Pine Rest register has one guest a year since 1952, all in Room 6, none signed out. The last line is yours, in your hand, dated the night you crashed: coming home.',hit:6,fx:'cold',key:'room6'},
 {after:'motel',id:'county',gate:'c1',name:'The county line',at:()=>({x:RGP.county.x+1,z:-6}),r:4,
  goal:'Route 9 runs on west past the motel to the county line. Walk to the sign and see if it lets you go.',
  title:'The county line',text:`LEAVING MARROW COUNTY. COME BACK SOON. Something has run down the second board in two long stripes and dried brown.<br><br>Past the sign the road goes on the way roads do. You walk. The trees either side are the same trees. The crack in the asphalt is the same crack. You walk faster.<br><br>The sign on your left says HOLLOW ACRE. E. Marsh, prop. Your mailbox. Your lane. The gravel is printed with boot prints, hundreds of them, going out and coming back, and every one of them is yours.`,
  lore:'Route 9 doesn’t leave. Walk past the county line and you come in at your own gate. The prints on the lane, going and coming, are all yours.',hit:7,fx:'cold',home:true},
 {after:'ferry',id:'birches',gate:'c2a',name:'The Weeping Birches',at:()=>({x:RGP.dolls.x,z:RGP.dolls.z+2}),r:4,
  goal:'Bram keeps drawing a white wood full of little hanging shapes. It’s north-west, up the path from the motel. Go and see.',
  title:'The dolls in the birches',text:`The birches stand round the clearing in a ring, and every branch has something hanging from it on a string. Dolls. Rag and button, stitched faces, a dress each. A hundred and fifty of them at least, turning slowly, though there is no wind.<br><br>Every doll has a birthday stitched on its hem. You find Ruth’s by the ribbon: blue, faded, tied in its wool hair the way Agnes ties it.<br><br>The newest doll hangs lowest, at the height of your face. Its hair is a braid the colour of yours, wound off at the end with baling twine. Its dress isn’t finished. The needle is still in it, threaded, waiting.`,
  lore:'The Weeping Birches hold a doll for every child the Tithe took, a birthday on each hem. Ruth’s wears Agnes’s ribbon. The newest has your hair, and its dress isn’t finished.',hit:8,fx:'cold',key:'ruthdoll'},
 {after:'birches',id:'greyfield',gate:'c2a',name:'The intake book',at:()=>({x:RGP.home.x,z:RGP.home.z+1.2}),r:2.4,
  goal:'Off Route 9 West is Greyfield, the old Home for Children. Dunn says it closed in 1951. Go to its door and find out why.',
  title:'The intake book',text:`The doors aren’t locked. Inside it smells of damp plaster and sour milk. The intake book is on the matron’s desk where she left it.<br><br>Name, age, where from, where sent. Ninety-one names, 1902 to 1951. And every autumn one line says the same thing under <i>where sent</i>: <i>Marrow Hollow, for the harvest.</i> Paid for. The receipts are pinned to the page, signed by the town clerk. A child a year, so that Marrow Hollow could keep its own.<br><br>The last entry is 1951. Under it, in another hand, pressed so hard it went through three pages: <i>It sent them back. It wants its own.</i><br><br>Upstairs, very quietly, something small is walking from one end of the dormitory to the other. And back.`,
  lore:'For fifty years Marrow Hollow bought Greyfield’s orphans and sent one a year to the Tithe, so its own were spared. In 1951 it sent them back. It wants its own.',hit:9,fx:'cold'},
 {after:'scare',id:'oldmarrow',gate:'c2b',name:'The Covenant',at:()=>({x:RGP.chapel.x+3.9,z:RGP.chapel.z+.9}),r:2.4,
  goal:'Up the old road north of the graveyard, the first Marrow Hollow burned in 1872. Go to its chapel.',
  title:'The Covenant',text:`The chapel has no roof and no doors. The altar is one block of quarry stone, black with soot except where hands have rubbed it clean.<br><br>The Covenant is cut into it. 1871. <i>One of ours each autumn, given in the house without windows; and the valley keeps us. No blight, no fever, no flood, no leaving.</i> Nine names under it. Abernathy. Dunn. Fenn. Hale. Pike. Quill. Thorne. Vale.<br><br>And Marsh. Your name is first. The first child given was a Marsh.<br><br>Someone tried to burn the Covenant out of the stone in 1872, and the chapel with it, and every house round it. The fire went out at the altar. Under the soot the letters are sharp, as if they were cut this morning.`,
  lore:'The Covenant of 1871 is cut into Old Marrow’s altar: one child each autumn, and the valley keeps them. Nine families signed it. Marsh signed first, and gave first.',hit:8,fx:'cold',key:'covenant'},
 {after:'oldmarrow',id:'fen',gate:'c2b',name:'What the peat keeps',at:()=>({x:RGP.bog.x+1.5,z:RGP.bog.z+.6}),r:2.6,
  goal:'Where the river gives out in the south-west there is a fen. Nan says the river always gives back what it’s given. Go and look.',
  title:'What the peat keeps',text:`It is lying where the peat has shrunk back from the edge of a pool. A child, brown and soft as an old glove, curled on its side the way children sleep. There is a rope round its neck plaited from grass, and on the rope a wooden token with a year burnt into it: 1872.<br><br>The peat keeps everything. Now you know how to look you can see more of them under the black water, curled up, dozens, each with its rope.<br><br>The one nearest the hut is not old. Its coat is your coat: the same colour, the same torn pocket. Its face is turned down into the peat. You don’t turn it over.`,
  lore:'Before there was a Tithe House the Tithe went into the fen, roped, a year burnt on a token. The peat keeps them all. The newest, by the hut, wears your coat.',hit:11,fx:'blood'},
 {after:'fen',id:'lookout',gate:'c2b',name:'The wheel',at:()=>({x:RGP.tower.x,z:RGP.tower.z+1.3}),r:2.2,
  goal:'Up Lookout Road past the quarry, a fire tower watches over Pine Ridge. From the top you would see the whole valley. Climb it.',
  title:'The wheel',text:`Seventy-two steps. The cab at the top has windows all round and a logbook on the fire-finder table, rangers’ handwriting back to 1923.<br><br>From up here you can see what Bram drew. The roads, the creek, the river, the fences: none of it was laid out for farming. It runs out from one point like the spokes of a wheel, and the woods round the edge of the valley are the rim.<br><br>The point is your field.<br><br>Every ranger noted it, every autumn, the same line: <i>Tithe night. Light in the Marsh field, 2 am. Did not investigate.</i> The last entry is next month’s. It is already written.`,
  lore:'From the fire lookout the valley’s roads and water run out like the spokes of a wheel. The hub is your field. Every ranger since 1923 logged a light there on Tithe night.',hit:7,fx:'cold'},
 {after:'lookout',id:'drowned',gate:'c2b',name:'The bell under the water',at:()=>({x:RGP.dock.x,z:RGP.dock.z+.4}),r:1.8,night:true,
  goal:'They drowned Old Wickham under Marrow Reservoir in 1931. Tess says its church bell still rings after dark. Go out on the reservoir dock tonight.',
  title:'The bell under the water',text:`The water is flat as a plate. Out past the steeple, the bell rings once.<br><br>You look down off the end of the dock and the water is clear all the way to the bottom, clearer than water should be. There is the old street, the roofs, the lamp posts, a bicycle on its side. They flooded the village to drown what lives under the valley. They thought water would hold it.<br><br>The people are still in the street. Standing, their hair lifting, in their Sunday clothes. Every one of them has turned to face the same way: north-west, toward your farm.<br><br>As you watch, one of them lifts its hand and waves.`,
  lore:'They flooded Old Wickham in 1931 to drown what lives under the valley. It didn’t hold. The drowned still stand in the street under the reservoir, facing your farm.',hit:9,fx:'cold'},
 {after:'jars',id:'corn',gate:'c3',day:5,name:'The scarecrow that wears you',at:()=>({x:RGP.cornC.x,z:RGP.cornC.z+1.4}),r:3.2,
  goal:'Something has been put up in the middle of Harlan’s corn, south of the river. Find your way through the maze to it.',
  title:'The scarecrow that wears you',text:`The scarecrows stand in a ring in the middle of the corn, a dozen of them, facing in. Their clothes are children’s clothes, sun-faded, a hundred and fifty years of them: smocks, knickerbockers, a Scout shirt, a Little League jersey.<br><br>The one in the middle is new. It is your size. It is wearing your clothes, the ones you came in, the ones you couldn’t find. Its sack face has been painted with your face, carefully, by somebody who has watched you for a long time.<br><br>Pinned to its chest, a label in Grandpa’s hand: <i>stand-in. if they won’t come quietly.</i>`,
  lore:'In the middle of the Deep Corn a ring of scarecrows wears the drawn children’s clothes. The newest wears yours, your face painted on: a stand-in, if you won’t come quietly.',hit:10,fx:'blood'}];
for(const b of RG_BEATS){const i=SAGA.findIndex(q=>q.id===b.after);SAGA.splice(i>=0?i+1:SAGA.length,0,b);SG[b.id]=b;}
// the county line sends you home
{const _sp=sgPlay;sgPlay=function(b){if(!b||!b.home||S.saga.done[b.id])return _sp.apply(this,arguments);
  const _no=openNote;openNote=function(html,btn,cb){openNote=_no;return _no(html,btn,()=>{if(cb)cb();rgHome('The farm sign goes by. HOLLOW ACRE. You never turned round.');});};
  try{return _sp.apply(this,arguments);}finally{openNote=_no;}};}
function rgHome(msg){fade(1);setTimeout(()=>{P.x=farmSignPos.x+1;P.z=farmSignPos.z+1.4;P.dir='E';fade(0);if(msg)toast(msg,3.4,true);A.hiss&&A.hiss(1.2,.06,'bandpass',700,{q:2,wobble:true});},450);}
// Agnes knows the doll
{const _t=talk;talk=function(n){if(n&&n.def&&n.def.id==='agnes'&&!isNight()&&stHas('ruthdoll')&&!S.rg.gaveDoll&&!(sgCurrent()&&sgCurrent().npc==='agnes')){S.rg.gaveDoll=1;
    playScene('agnes','Ruth’s doll',`You hold out the doll. Agnes doesn’t take it at first. Then she does, in both hands, the way you hold something asleep.<br><br><q>Every mother makes one. Hale’s grandmother started it. I made Ruth’s the night they brought the ribbon back, and I walked it up to the birches in my nightgown.</q><br><br>She unties the ribbon and ties it again, tighter. <q>Somebody has to keep count.</q><br><br>Then, very quietly, looking at the braid you didn’t mention: <q>The one with your hair. Nobody here made that one.</q>`,
      ()=>{addFriend&&addFriend('agnes',120);addLore('Every mother in Marrow Hollow makes a doll for the birches. Agnes made Ruth’s. Nobody in the valley made the one with your hair.');});return;}
  return _t.apply(this,arguments);};}
// ---- walking past the county line any other time
setInterval(()=>{try{if(S.mode!=='play'||S.room||S.paused)return;if(P.x<RGP.loopX&&Math.abs(P.z+6)<10){if(!S.saga.done.county&&sgCurrent()&&sgCurrent().id==='county')return;rgHome('The farm sign goes by. Again.');}}catch(e){}},300);
// ---- finding each place
setInterval(()=>{try{if(S.mode!=='play'||S.room)return;const r=rgAt(P.x,P.z);if(!r||S.rg.seen[r.k])return;S.rg.seen[r.k]=S.day;
  toast(`${r.name}. ${RG_LINE[r.k]}`,4.6);journalNote(`Found ${r.name}.`);SFX.page&&SFX.page();}catch(e){}},700);
// ---- the old county milestones: from any one you've found, to any other
const RG_MILE_K=new Set(['farm','town','wick']);
const rgMileKnown=m=>RG_MILE_K.has(m.k)||!!S.rg.seen[m.k];
function rgTravel(from){const list=RG_MILES.filter(m=>m!==from&&rgMileKnown(m));
  if(!list.length){toast('The other posts are out there somewhere. Find them first.',2.6);return;}
  const cost=m=>clamp(Math.hypot(m.x-from.x,m.z-from.z)/160,.25,2.5);
  openNote('<h3>The county milestone</h3><p>An old stone post, a wheel chalked on it. Somebody has kept the chalk fresh. Follow the old roads to:</p><p style="text-align:center">'+
    list.map(m=>`<button class="btn rgGo" data-k="${m.k}" style="margin:3px 4px">${m.name} <span style="opacity:.7">${(()=>{const h=cost(m);return h<1?Math.round(h*60)+' min':h.toFixed(1)+' h';})()}</span></button>`).join('')+'</p>','Not now',()=>{});
  document.querySelectorAll('#noteText .rgGo').forEach(btn=>btn.addEventListener('click',()=>{const m=RG_MILES.find(q=>q.k===btn.dataset.k);if(!m)return;const h=cost(m);
    if(S.hour+h>25.6){toast('Not this late. You’d drop in the road.',2.4,true);return;}
    $('note').hidden=true;noteCb=null;fade(1);setTimeout(()=>{S.hour+=h;P.x=m.x+.2;P.z=m.z+1.3;P.dir='S';S.paused=false;fade(0);toast(`${m.name}. ${h<1?Math.round(h*60)+' minutes':h.toFixed(1)+' hours'} on the old roads.`,2.6);},500);},{once:true}));}
{const _bw=buildWorld;buildWorld=function(){_bw();for(const o of OBJ){if(!o.mile)continue;const m=RG_MILES.find(q=>q.k===o.mile);if(!m)continue;
  interact.push({x:m.x,z:m.z+.5,r:1.3,on:()=>!S.room,label:()=>'Milestone',ok:()=>true,act(){rgTravel(m);}});}};}
// ---- something to gather in every place, new spots every morning
const RG_FOR={r9w:['chicory',6],grey:['rosehip',6],fen:['cranberry',7],corn:['ghostcorn',6],drown:['pearl',2],ridge:['resin',6],marrow:['coin',4],birch:['chaga',6]};
Object.assign(ITEMS,{
  chicory:{name:'Roadside chicory',sell:12,icon:'it_chicory',desc:'Blue flowers off the verge of Route 9. They close up at noon and open again at dusk, which isn’t how chicory works. Sells for 12.'},
  rosehip:{name:'Greyfield rose hips',sell:15,food:[12,6],icon:'it_rosehip',desc:'From the roses round the numbered graves. Somebody planted one rose per child. +12 energy, +6 health. Sells for 15.'},
  cranberry:{name:'Bog cranberries',sell:14,food:[18,4],icon:'it_cranberry',desc:'Tart, red, picked off the fen’s moss. The water they grow in is black. +18 energy. Sells for 14.'},
  ghostcorn:{name:'Ghost corn',sell:22,icon:'it_ghostcorn',desc:'A cob with white kernels and no colour in it at all, from the middle rows of the Deep Corn. Sells for 22.'},
  pearl:{name:'Reservoir pearl',sell:65,icon:'it_pearl',desc:'From a mussel on the drawdown mud. Grey, faintly warm. Old Wickham’s women wore them to church. Sells for 65.'},
  resin:{name:'Pine resin',sell:18,icon:'it_resin',desc:'Amber tears off the ridge pines. Smells of Christmas and of something burning. Sells for 18.'},
  coin:{name:'Founders’ coin',sell:40,icon:'it_coin',desc:'An 1871 penny out of Old Marrow’s ash, blackened, stamped with a wheel instead of a head. Sells for 40.'},
  chaga:{name:'Birch chaga',sell:24,icon:'it_chaga',desc:'A black clinker of fungus off a white birch. Inside it is the orange of a coal. Sells for 24.'}});
cicoMake('it_chicory',(p)=>{for(let k=0;k<5;k++)p(15+k%2,14+k*3,1,4,'#4a7a2e');for(const [x,y] of [[11,10],[19,8],[15,15],[22,15]]){for(let a=0;a<8;a++){const dx=Math.round(Math.cos(a*.785)*3),dy=Math.round(Math.sin(a*.785)*3);p(x+dx,y+dy,2,2,a<4?'#7aa8e8':'#4a78c8');}p(x,y,2,2,'#e8e0f8');}});
cicoMake('it_rosehip',(p)=>{p(15,6,2,8,'#5a6a2e');for(const [x,y] of [[10,14],[18,12],[14,20]]){for(let i=-4;i<=4;i++)for(let j=-5;j<=5;j++)if(i*i/16+j*j/25<1)p(x+i,y+j,1,1,i<-1&&j<0?'#f06a4a':i>1?'#9a2418':'#d0402a');p(x-1,y-6,3,2,'#3a4a1e');}});
cicoMake('it_cranberry',(p)=>{for(const [x,y] of [[10,18],[17,14],[21,21],[13,24],[22,10]]){for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++)if(i*i+j*j<10)p(x+i,y+j,1,1,i<0&&j<0?'#e85a6a':i>1||j>1?'#7a1020':'#b8243a');p(x-1,y-1,1,1,'#ffd0d8');}p(8,8,14,2,'#4a6a3a');});
cicoMake('it_ghostcorn',(p)=>{for(let y=6;y<27;y++){const w=Math.round(5*Math.sin((y-5)/22*Math.PI))+1;for(let x=-w;x<=w;x++)p(16+x,y,1,1,(x+y)%2?'#f4f0e4':x<0?'#ffffff':'#c8c4b8');}
  for(let y=14;y<29;y++){p(9+(y-14)*.3,y,2,1,'#8a9a5a');p(21-(y-14)*.3,y,2,1,'#6a7a3a');}});
cicoMake('it_pearl',(p)=>{for(let i=-7;i<=7;i++)for(let j=-6;j<=6;j++)if(i*i/49+j*j/36<1)p(16+i,18+j,1,1,j<0?'#3a4a5a':'#2a3240');for(let i=-4;i<=4;i++)for(let j=-4;j<=4;j++)if(i*i+j*j<17)p(16+i,15+j,1,1,i<-1&&j<-1?'#ffffff':i>1||j>1?'#9aa4b0':'#d8dce4');});
cicoMake('it_resin',(p)=>{for(let i=-7;i<=7;i++)for(let j=-8;j<=8;j++)if(i*i/49+j*j/64<1)p(16+i,17+j,1,1,i<-2&&j<-2?'#ffd890':i>2||j>3?'#a85a10':'#e09a30');p(12,12,2,3,'#fff4d0');p(16,4,2,5,'#6a4a2a');});
cicoMake('it_coin',(p)=>{for(let i=-8;i<=8;i++)for(let j=-8;j<=8;j++){const d=i*i+j*j;if(d<70)p(16+i,16+j,1,1,d>48?'#3a2a1a':i<-2&&j<-2?'#9a7a4a':'#6a4a2a');}
  for(let a=0;a<6;a++){const c=Math.cos(a*1.047),s=Math.sin(a*1.047);for(let r=1;r<5;r++)p(16+Math.round(c*r),16+Math.round(s*r),1,1,'#c8a060');}});
cicoMake('it_chaga',(p)=>{for(let i=-9;i<=9;i++)for(let j=-6;j<=6;j++)if(i*i/81+j*j/36<1)p(16+i,17+j,1,1,(i+j)%3===0?'#1a1410':'#2e2420');for(let i=-4;i<=4;i++)p(16+i,23,1,2,'#d87a2a');p(20,12,2,2,'#4a3a30');});
function rgForageSpot(k){const r=RGK[k];for(let t=0;t<200;t++){const x=lerp(r.x0+3,r.x1-3,Math.random()),z=lerp(r.z0+3,r.z1-3,Math.random());if(!inNewLand(x,z)||rgAt(x,z)!==r)continue;
    if(LAYERS.water(x,z)||onRoad(x,z,.6))continue;if(k==='drown'&&!LAYERS.dirt(x,z))continue;if(k==='corn'&&!(x>DCF.x0&&x<DCF.x1&&z>DCF.z0&&z<DCF.z1&&dcPath(x,z)))continue;
    const A=cgNear(x,z,.6);if(A.c.some(c=>Math.hypot(c.x-x,c.z-z)<c.r+.5)||A.r.some(q=>x>q.x0-.5&&x<q.x1+.5&&z>q.z0-.5&&z<q.z1+.5))continue;return [x,z];}return null;}
function rgForageRoll(){S.rg.f=[];for(const [k,[it,n]] of Object.entries(RG_FOR))for(let i=0;i<n;i++){const p=rgForageSpot(k);if(p)S.rg.f.push({k:it,x:+p[0].toFixed(2),z:+p[1].toFixed(2),t:0});}S.rg.fday=S.day;rgForageHook();}
const RG_FI=[];
function rgForageHook(){for(let i=0;i<S.rg.f.length;i++){let it=RG_FI[i];if(!it){const j=i;it={x:0,z:0,r:.9,on:()=>{const f=S.rg.f[j];return !!f&&!f.t&&!S.room;},label:()=>'Gather',ok:()=>true,
      act(){const f=S.rg.f[j];if(!f||f.t)return;f.t=1;addInv(f.k);SFX.harvest&&SFX.harvest();toast(`+1 ${ITEMS[f.k].name}.`,1.8);}};RG_FI.push(it);interact.push(it);}
    it.x=S.rg.f[i].x;it.z=S.rg.f[i].z;}}
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);try{rgForageRoll();}catch(e){}return r;};}
{const _lg=loadGame;loadGame=function(d){const r=_lg.apply(this,arguments);try{S.rg=Object.assign({seen:{},f:[],fday:0,gaveDoll:0},S.rg||{});if(!S.rg.f.length||S.rg.fday!==S.day)rgForageRoll();else rgForageHook();}catch(e){}return r;};}
setTimeout(()=>{try{if(!S.rg.f||!S.rg.f.length)rgForageRoll();}catch(e){}},1500);
// ---- fish of the fen and the reservoir
FISH.push(['Peat eel',24,.55,'floater','fen','any',40,95],['Bog-blind minnow',9,.2,'smooth','fen','day',6,12],['Black pike',34,.75,'dart','fen','night',55,115],
  ['Reservoir perch',11,.25,'smooth','res','day',16,30],['Lake trout',22,.5,'dart','res','day',30,60],['Bell carp',46,.82,'mixed','res','night',60,130]);
Object.assign(FISH_ODD,{'Peat eel':'It is stained the colour of tea all the way through. It smells of the hut.','Black pike':'Its stomach is full of small round stones, each with a hole worn through it.',
  'Bell carp':'When it thrashes on the bank, somewhere out on the water, very faintly, a bell rings.','Bog-blind minnow':'No eyes. It turns toward you anyway.'});
{const _fw=fishWhere;fishWhere=function(x,z){if(inNewLand(x,z)){if(inRes(x,z))return 'res';if(inFenPool(x,z)||rgAt(x,z)===RGK.fen)return 'fen';}return _fw.apply(this,arguments);};}
// ---- each place's own life: ash on the wind in Old Marrow, lights over the fen at night, the bell, the birches creaking, wind on the ridge
const RGA={snd:0,acc:0,wisps:[]};
function rgAmbient(dt){const r=rgAt(P.x,P.z);if(!r||S.room)return;const night=isNight();RGA.acc+=dt;if(RGA.acc>.1){RGA.acc=0;
    if(r.k==='marrow'){for(let i=0;i<3;i++)parts.push({x:P.x+(Math.random()-.5)*26,z:P.z+(Math.random()-.5)*16,y:2.6+Math.random(),vx:.3+Math.random()*.3,vz:.1,vy:-.25,t:0,life:5,col:Math.random()<.08?'rgba(240,110,40,.9)':'rgba(200,196,190,.75)',size:Math.random()<.5?1:2});}
    else if(r.k==='birch'&&Math.random()<.5)parts.push({x:P.x+(Math.random()-.5)*24,z:P.z+(Math.random()-.5)*14,y:3,vx:.2,vz:.05,vy:-.35,t:0,life:5,col:'#e8c040',size:2});
    else if(r.k==='ridge'&&Math.random()<.3)parts.push({x:P.x+(Math.random()-.5)*24,z:P.z+(Math.random()-.5)*14,y:3.4,vx:.6,vz:.1,vy:-.5,t:0,life:4,col:'#5a4a2a',size:1});
    else if(r.k==='drown'&&(night||S.hour<8)){const x=P.x+(Math.random()-.5)*28,z=P.z+(Math.random()-.5)*18;if(inRes(x,z))parts.push({x,z,y:.1,vx:.2,vz:0,vy:.02,t:0,life:4,col:'rgba(220,228,232,.5)',size:6});}
    else if(r.k==='fen'&&!night&&Math.random()<.3){const x=P.x+(Math.random()-.5)*20,z=P.z+(Math.random()-.5)*14;if(inFenPool(x,z))parts.push({x,z,y:.05,vx:0,vz:0,vy:.1,t:0,life:1,col:'rgba(120,110,80,.7)',size:2});}}
  // lights over the fen at night: they drift, and they go out when you get close
  if(r.k==='fen'&&night){if(RGA.wisps.length<7)RGA.wisps.push({x:P.x+(Math.random()-.5)*30,z:P.z+(Math.random()-.5)*20,ph:Math.random()*6,a:0});
    for(const w of RGA.wisps){w.ph+=dt;w.x+=Math.sin(w.ph*.7)*dt*.6;w.z+=Math.cos(w.ph*.5)*dt*.4;const d=Math.hypot(w.x-P.x,w.z-P.z);w.a=clamp(w.a+(d<5?-dt:dt*.5),0,1);if(d>26||(d<5&&w.a<=0)){w.x=P.x+(Math.random()-.5)*30;w.z=P.z+(Math.random()-.5)*20;w.a=0;}}}
  else RGA.wisps.length=0;
  RGA.snd-=dt;if(RGA.snd>0||!A.ok)return;RGA.snd=3+Math.random()*4;
  if(r.k==='drown'&&night)A.tone&&A.tone(196,2.6,'sine',.03,{filter:['lowpass',600]});
  else if(r.k==='birch')A.tone&&A.tone(140+Math.random()*40,.5,'sawtooth',.012,{slide:110,filter:['bandpass',600,6]});
  else if(r.k==='ridge')A.hiss&&A.hiss(2.4,.03,'bandpass',500,{q:.8,wobble:true});
  else if(r.k==='fen'){A.tone&&A.tone(90,.12,'square',.02);A.tone&&A.tone(80,.12,'square',.02,{delay:.18});}
  else if(r.k==='corn')A.hiss&&A.hiss(1.6,.03,'highpass',2400,{wobble:true});
  else if(r.k==='grey'&&Math.random()<.4)A.tone&&A.tone(1200,.18,'triangle',.008,{slide:1500});
  else if(r.k==='r9w'&&night)A.hiss&&A.hiss(.3,.02,'highpass',5000);
  else if(r.k==='marrow')A.hiss&&A.hiss(1.4,.025,'lowpass',300,{wobble:true});}
{const _u=update;update=function(dt){_u(dt);if(S.mode!=='play')return;try{rgAmbient(dt);}catch(e){}};}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);if(S.room)return;
  for(const f of S.rg.f||[]){if(f.t||!onScreen(f.x,f.z,40))continue;const ic=CICO[ITEMS[f.k].icon];if(!ic)continue;
    D.push({z:f.z,draw(){const X=Math.round(sx(f.x)),Y=Math.round(sz(f.z));ctx2.fillStyle='rgba(10,10,8,.32)';ctx2.fillRect(X-6,Y-1,12,3);const b=Math.round(Math.sin(t*2+f.x)*1);ctx2.drawImage(ic,X-9,Y-17+b,18,18);
      if(Math.sin(t*3+f.z*7)>.85){ctx2.fillStyle='#fff8e0';ctx2.fillRect(X+4,Y-15+b,1,1);ctx2.fillRect(X+3,Y-14+b,3,1);ctx2.fillRect(X+4,Y-13+b,1,1);}}});}
  for(const w of RGA.wisps){if(w.a<=0||!onScreen(w.x,w.z,30))continue;D.push({z:w.z,mind:1,draw(){const X=Math.round(sx(w.x)),Y=Math.round(sz(w.z))-18-Math.sin(w.ph*2)*4;
    ctx2.fillStyle=`rgba(150,255,170,${.25*w.a})`;ctx2.fillRect(X-3,Y-3,7,7);ctx2.fillStyle=`rgba(210,255,220,${.8*w.a})`;ctx2.fillRect(X-1,Y-1,3,3);}});}};}
