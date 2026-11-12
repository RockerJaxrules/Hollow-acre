/* ================= #299 The land office, inside the town hall (owner: "land office should be inside town hall with a desk ...
   like a real land office"). The hall's front office opens on weekdays: a long clerk's counter with the deed ledger, filing
   cabinets, the survey plat of the Marsh land on the wall with every parcel ruled out in ink (the ones you own hatched in red),
   a LAND OFFICE board hanging over it, and a bench to wait on. Agnes Abernathy keeps the deeds, nine till three; when she's
   out the counter has a card on it. Across the room are the meeting hall's double doors, chained since the vote in 1952, and
   beside them the town works board (#298). ================= */
// ---- pictures made here, in the furniture's style: dark outline, flat tones, light from the top left
const HALL_SPR={};
function hallSprite(key,w,h,ax,ay,fn){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const P=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(x,y,ww||1,hh||1);};fn(P,g,w,h);IMG['mem:'+key]=c;SPR[key]={src:'mem:'+key,fw:w,fh:h,ax,ay,foot:[0,0,0,0]};HALL_SPR[key]=1;return c;}
const HT=(P,s,x,y,col)=>{if(typeof sgtT==='function')return sgtT(P,s,x,y,col);return x;};
const HW=['#1e140c','#4a3220','#6a4a2e','#8a6440','#a8804e'];   // wood ramp, dark to light
function hallFrame(P,w,h){P(0,0,w,h,'#120c08');P(1,1,w-2,h-2,HW[2]);P(1,1,w-2,1,HW[4]);P(1,1,1,h-2,HW[3]);P(1,h-2,w-2,1,HW[1]);P(w-2,1,1,h-2,HW[1]);P(3,3,w-6,h-6,'#120c08');}
// the survey plat: the farm, the creek, the road and every parcel, ruled in ink; yours hatched red
function hallPlat(){const own=Object.keys((S.land&&S.land.own)||{}).sort().join(',');const key='hall_plat';if(HALL_SPR[key]&&hallPlat.sig===own)return;hallPlat.sig=own;
  hallSprite(key,60,66,30,63,(P,g,w,H)=>{const h=44;for(const lx of [8,50]){P(lx,40,3,26,'#120c08');P(lx+1,40,1,25,HW[3]);}P(28,40,4,24,'#120c08');P(29,40,2,23,HW[2]);P(6,60,48,2,'#120c08');P(7,60,46,1,HW[3]);P(4,63,52,3,'rgba(0,0,0,.35)');   // the easel
    hallFrame(P,w,h);P(4,4,w-8,h-8,'#e4d6b4');P(4,4,w-8,1,'#f2e8cc');P(4,h-5,w-8,1,'#c8b890');
    const X=x=>Math.round(8+(x+24)*1.0),Z=z=>Math.round(10+z*.78);
    P(4,Z(-1.6),w-8,1,'#9a8a6a');P(4,Z(-1.6)+1,w-8,1,'#b8a888');   // the road along the top
    for(let x=4;x<w-4;x++)P(x,Z(36)+Math.round(Math.sin(x*.5)),1,1,'#6a8aa0');   // the creek along the bottom
    const box=(x0,z0,x1,z1,col,hatch)=>{const a=X(x0),b=Z(z0),c=X(x1),d=Z(z1);if(hatch)for(let y=b+1;y<d;y++)for(let x=a+1;x<c;x++)if((x+y)%3===0)P(x,y,1,1,'#c8705a');
      for(let x=a;x<=c;x+=2){P(x,b,1,1,col);P(x,d,1,1,col);}for(let y=b;y<=d;y+=2){P(a,y,1,1,col);P(c,y,1,1,col);}};
    P(X(-5),Z(0),X(5)-X(-5)+1,Z(8)-Z(0)+1,'#c8b48a');box(-5,0,5,8,'#3a2a1a');   // the home field, solid
    const all=(typeof LAND_PARCELS!=='undefined'?LAND_PARCELS:[]);for(const p of all){const mine=!!(S.land&&S.land.own&&S.land.own[p.id]);box(p.x0,p.z0,p.x0+p.w,p.z0+p.h,mine?'#8a2416':'#3a3a48',mine);}
    P(w-11,6,1,5,'#3a2a1a');P(w-12,7,3,1,'#3a2a1a');HT(P,'N',w-12,12,'#3a2a1a');   // north
    HT(P,'MARSH',7,6,'#3a2a1a');P(7,12,19,1,'#8a2416');});}
hallSprite('hall_landsign',54,22,27,20,(P,g,w,h)=>{P(9,0,1,6,'#5a5a60');P(44,0,1,6,'#5a5a60');P(8,1,3,1,'#8a8a90');P(43,1,3,1,'#8a8a90');P(8,4,3,1,'#8a8a90');P(43,4,3,1,'#8a8a90');   // chains
  P(0,6,w,h-6,'#120c08');P(1,7,w-2,h-8,HW[2]);P(1,7,w-2,1,HW[4]);P(1,h-2,w-2,1,HW[1]);P(3,9,w-6,h-12,HW[1]);P(3,9,w-6,1,'#120c08');
  HT(P,'LAND OFFICE',5,11,'#f0dca8');HT(P,'LAND OFFICE',5,12,'#2a1a0e');HT(P,'LAND OFFICE',5,11,'#e8c878');});
// the meeting hall's double doors, chained since the vote; a yellowed notice on them. Once the town is mended, the chains are off.
function hallDoors(open){const key=open?'hall_doors_o':'hall_doors';if(HALL_SPR[key])return key;hallSprite(key,46,60,23,57,(P,g,w,h)=>{
  P(0,0,w,h,'#120c08');P(2,2,w-4,h-2,'#2a1a10');P(1,1,w-2,1,HW[4]);
  for(const x0 of [3,24]){P(x0,3,19,h-3,HW[1]);P(x0,3,19,1,HW[3]);P(x0,3,1,h-3,HW[2]);for(const [y,hh] of [[7,18],[29,24]]){P(x0+3,y,13,hh,HW[2]);P(x0+3,y,13,1,'#120c08');P(x0+3,y,1,hh,'#120c08');P(x0+4,y+hh-1,12,1,HW[3]);P(x0+15,y+1,1,hh-1,HW[3]);}}
  P(22,3,2,h-3,'#120c08');P(19,30,2,4,'#c8a04a');P(25,30,2,4,'#c8a04a');   // the meeting, the handles
  if(!open){for(let i=0;i<34;i++){const a=8+i,b=14+Math.round(i*1.05);P(a,b,2,1,i%3===0?'#9a9aa0':'#5a5a62');P(w-a-2,b,2,1,i%3===0?'#9a9aa0':'#5a5a62');}   // the chains, crossed
    P(19,36,8,7,'#120c08');P(20,37,6,5,'#8a8a90');P(20,37,6,1,'#c0c0c8');P(22,33,3,4,'#120c08');P(23,34,1,3,'#8a8a90');P(22,39,2,1,'#2a2a30');   // padlock
    P(5,8,12,15,'#120c08');P(6,9,10,13,'#d8c898');P(6,9,10,1,'#ece0b8');for(let y=12;y<20;y+=2)P(7,y,7+(y%3),1,'#8a7a5a');P(8,10,6,1,'#8a2416');}   // the 1952 notice
  else{P(21,10,4,1,'#5a5a62');P(20,46,6,1,'#5a5a62');}});return key;}
hallDoors(false);hallDoors(true);
// the town works board: a sheet pinned up for every job the town wants doing; ticked when done, tagged while it's being done
function hallWorks(){const st=typeof mendS==='function'?mendS():{};const open=typeof mendOpen==='function'&&mendOpen();const L=(typeof MEND!=='undefined'?MEND:[]).slice(0,10);
  const sig=(open?1:0)+':'+L.map(m=>{const v=st[m.k];return v?(typeof v==='object'&&v.ready>S.day?'b':'d'):'-';}).join('');if(HALL_SPR.hall_works&&hallWorks.sig===sig)return;hallWorks.sig=sig;
  hallSprite('hall_works',68,70,34,67,(P,g,w,H)=>{const h=46;for(const lx of [6,58]){P(lx,44,4,24,'#120c08');P(lx+1,44,2,23,HW[3]);P(lx+1,44,1,23,HW[4]);}P(3,67,62,3,'rgba(0,0,0,.35)');   // two posts
    hallFrame(P,w,h);P(4,4,w-8,h-8,'#9a6a3a');P(4,4,w-8,1,'#b07e48');for(let i=0;i<40;i++)P(5+((i*37)%(w-10)),5+((i*23)%(h-10)),1,1,'#8a5c30');
    L.forEach((m,i)=>{const cx=7+(i%5)*12,cy=7+Math.floor(i/5)*18,v=st[m.k],done=v&&!(typeof v==='object'&&v.ready>S.day),doing=v&&!done;
      P(cx,cy,10,14,'#120c08');P(cx+1,cy+1,8,12,'#e8dcc0');P(cx+1,cy+1,8,1,'#f6eed8');P(cx+4,cy-1,2,2,'#b02a20');   // the sheet and its pin
      const ic=HALL_ICON[m.k]||HALL_ICON.dflt;ic(P,cx+2,cy+3);
      if(done){P(cx+5,cy+10,1,1,'#2a7a3a');P(cx+6,cy+11,1,1,'#2a7a3a');P(cx+7,cy+10,1,1,'#2a7a3a');P(cx+8,cy+9,1,1,'#2a7a3a');}
      if(doing){P(cx+1,cy+11,8,2,'#d8a830');}});
    if(!open){for(let i=0;i<w-8;i++){const y=h-8-Math.round(i*.55);P(4+i,y,1,4,'#8a2416');}HT(P,'NOT YET',22,24,'#f0dca8');}});}
const HALL_ICON={dflt:(P,x,y)=>{P(x,y,6,1,'#5a5a62');P(x,y+2,5,1,'#5a5a62');P(x,y+4,6,1,'#5a5a62');},
  lamps:(P,x,y)=>{P(x+2,y,2,1,'#3a3a40');P(x+1,y+1,4,3,'#e8b840');P(x+2,y+4,2,4,'#3a3a40');},
  roofs:(P,x,y)=>{P(x,y+3,6,1,'#8a2416');P(x+1,y+2,4,1,'#8a2416');P(x+2,y+1,2,1,'#8a2416');P(x+1,y+4,4,4,'#6a4a2e');},
  church:(P,x,y)=>{P(x+2,y,1,3,'#3a3a40');P(x+1,y+3,3,1,'#3a3a40');P(x+1,y+4,4,4,'#8a8a90');P(x+2,y+6,1,2,'#3a2a1a');},
  school:(P,x,y)=>{P(x+2,y,2,2,'#c8a04a');P(x,y+2,6,1,'#8a2416');P(x,y+3,6,5,'#a83a2a');P(x+2,y+5,2,3,'#3a2a1a');},
  streets:(P,x,y)=>{P(x+3,y,1,6,'#6a4a2e');P(x+1,y+6,5,2,'#c8a04a');},
  blood:(P,x,y)=>{P(x+1,y+1,4,4,'#4a6a8a');P(x+2,y+5,2,2,'#4a6a8a');},
  curtains:(P,x,y)=>{P(x,y,6,7,'#3a2a1a');P(x+1,y+1,4,5,'#e8c060');},
  clock:(P,x,y)=>{P(x+1,y+1,5,5,'#3a3a40');P(x+2,y+2,3,3,'#e8dcc0');P(x+3,y+2,1,2,'#3a3a40');},
  pell:(P,x,y)=>{P(x,y+2,6,6,'#6a4a2e');P(x+1,y+3,2,2,'#e8c060');P(x+3,y,1,2,'#8a2416');},
  slate:(P,x,y)=>{P(x,y+1,6,5,'#2a3a3a');P(x+1,y+2,3,1,'#e8e8e0');}};
// ---- the room: the tavern's panelled shell, fitted out as the clerk's office and the hall's lobby
{const ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;hallPlat();hallWorks();
  ROOMS.hall={ox,oz:-60,name:'Marrow Hollow Town Hall',shell:'room_tavern',out:tbOut('hall'),furn:[
    ['hall_landsign',4.2,-.05,null,'flat'],BF('in_ctr_motel',4.2,3.2,.5),BF('in_chair',4.2,2.0,.25),BF('in_filecab',1.0,1.0,.35),BF('in_filecab',1.9,1.0,.35),BF('hall_plat',7.2,1.7,.3),
    BF('in_desk_roll',2.0,5.0,.45),BF('in_clock',.6,2.4,.3),BF('in_plant',.8,8.0,.3),
    ['hall_doors',13.0,-.45,null,'flat'],BF('hall_works',10.2,1.7,.3),BF('in_pew',12.6,5.0,.4),BF('in_pew',12.6,6.8,.4),BF('in_plant',15.2,8.0,.3),['in_rugrect',8,7.4,null,'flat']]};}
// Agnes Abernathy clerks for the town, nine till three, on her way from the porch to the graves
if(typeof INDOOR!=='undefined'){const d=tbDoor('hall');INDOOR.hall={room:'hall',door:[d[0],d[1]],spots:{agnes:[4.2,2.45]},browse:[[12.6,4.2],[9.0,6.0],[8,6.2]]};}
if(typeof LIFE!=='undefined'&&LIFE.agnes){LIFE.agnes.day=[[6,'home'],[8,'porch_agnes'],[9,'hall'],[15,'graves'],[16.5,'porch_agnes'],[18.5,'home']];LIFE.agnes.job='Retired; clerks the land office at the town hall, nine till three';}
const hallClerkIn=()=>{const n=npcById('agnes');return !!(n&&n.loc==='in'&&n.inWant==='hall');};
const hallOpen=()=>S.hour>=7.5&&S.hour<18.5;
{const _bw=buildWorld;buildWorld=function(){_bw();try{
  const [hx,hz]=tbDoor('hall');
  // the hall door now opens (the old knock and the outdoor land office go)
  for(const it of interact){if(it._hall)continue;if((Math.abs(it.x-hx)<.05&&Math.abs(it.z-hz)<.2)&&it.r<=1.25&&!S.room){it._hall=1;it.on=()=>false;}}
  interact.push({x:hx,z:hz+.05,r:1.2,_hall:2,on:()=>!S.room,label:()=>'Town hall',ok:()=>true,act(){
    if(!hallOpen()){SFX.deny&&SFX.deny();toast('Locked for the night. A card in the glass: LAND OFFICE · WEEKDAYS NINE TILL THREE · A. ABERNATHY, CLERK.',3.4);return;}enterRoom('hall');}});
  const R=ROOMS.hall;if(!R)return;
  interact.push({x:R.ox+4.2,z:R.oz+4.15,r:1.3,on:()=>S.room==='hall',label:()=>hallClerkIn()?'Land office':'The counter',ok:()=>true,act(){
    if(!hallClerkIn()){toast(S.hour<9?'A card on the counter, in a sharp hand: OPEN AT NINE. DON’T TOUCH THE LEDGER.':'A card on the counter: GONE TO THE GRAVES. BACK TOMORROW AT NINE. — A.A.',3);return;}openShop('land');}});
  interact.push({x:R.ox+7.2,z:R.oz+2.4,r:1.2,on:()=>S.room==='hall',label:()=>'Survey plat',ok:()=>true,act(){hallPlat();SFX.page&&SFX.page();
    const own=Object.keys((S.land&&S.land.own)||{}).filter(k=>typeof LAND_PARCELS!=='undefined'&&LAND_PARCELS.some(p=>p.id===k));
    toast(`The Marsh plat, surveyed 1952 and ruled out by hand: the home field, and around it ${typeof LAND_PARCELS!=='undefined'?LAND_PARCELS.length:'the'} parcels in dotted ink. ${own.length?`${own.length===1?'One is':own.length+' are'} hatched red: yours.`:'None of them hatched yet. The deeds are at the counter.'}`,4.2);}});
  interact.push({x:R.ox+13.0,z:R.oz+.9,r:1.2,on:()=>S.room==='hall',label:()=>hallDoorsOpen()?'The meeting hall':'Chained doors',ok:()=>true,act(){
    toast(hallDoorsOpen()?'The chains are off. Inside, the chairs are still set out in rows for the meeting of October 1952, and somebody has opened the windows.':'Chained since the vote. The notice on them: TOWN MEETING ON THE QUESTION OF THE TITHE — POSTPONED. Through the gap, rows of chairs facing a stage, and the smell of a room nobody has breathed in for seventy years.',4.4);}});
  interact.push({x:R.ox+10.2,z:R.oz+2.4,r:1.2,on:()=>S.room==='hall',label:()=>'Town works',ok:()=>true,act(){
    if(typeof mendOpen==='function'&&mendOpen()&&typeof mendLedger==='function'){mendLedger();return;}
    toast('Plans for mending the town, pinned up and gone yellow: new glass for the chapel at Old Marrow, the schoolhouse open, the lamps lit, the roofs done. A red ribbon across all of them, and a note: NOT WHILE THE TITHE STANDS.',4.6);}});
  }catch(e){console.warn('town hall',e);}};}
const hallDoorsOpen=()=>typeof mendOpen==='function'&&mendOpen();
// the plat, the works board and the doors keep up with what's happened
setInterval(()=>{try{if(S.room!=='hall')return;hallPlat();hallWorks();const want=hallDoors(hallDoorsOpen());for(const o of OBJ)if(o.room==='hall'&&(o.spr==='hall_doors'||o.spr==='hall_doors_o'))o.spr=want;}catch(e){}},700);
// the guide arrow and the FOR SALE signs already point at the hall door; the land tutorial now says to go in
/* ================= #298 Mending the town means mending it (owner: "when I say improve the town I mean you fix it, clean it,
   fix the buildings, fix the burnt down church, open the school, that kind of stuff"). Three big jobs join the mending ledger,
   now pinned to the town works board in the hall, and each one is built, not just written down: you pay and bring the
   materials, Nell Hartley's crew put up ladders, sawhorses and stacks of lumber at the site, and a few mornings later it's done.
   The streets: the dead cars, tyres and drums behind Pruitt's hauled off, the cracks and oil scrubbed out of the blacktop.
   The schoolhouse: opened up again, a schoolroom inside, and Miss Vance teaching in it instead of out in the yard.
   The chapel at Old Marrow: the fire put out of its windows the day work starts, and a new chapel standing where the burnt one
   stood. (The older jobs on the board now show too: the tarps come off, the lamps light, the curtains open.) ================= */
const TW_DAYS={streets:1,school:2,church:3};
const twV=k=>(typeof mendS==='function'?mendS()[k]:null);
const twStarted=k=>!!twV(k);
const twReady=k=>{const v=twV(k);if(!v)return false;return typeof v==='object'?S.day>=v.ready:true;};
const twDone=twReady;
if(typeof MEND!=='undefined'){const at=Math.max(0,MEND.findIndex(m=>m.k==='curtains'));MEND.splice(at,0,
  {k:'streets',name:'Clean up the streets',need:{fiber:20,stone:20},coins:300,
    say:'Hollis tows the dead cars out from behind the garage one at a time, and Wes rolls the tyres down to the dump. You and half the street scrub the oil and the cracks out of the blacktop on your knees. By tomorrow it will look like a street people drive down on purpose.',
    apply(){twApply('streets');}},
  {k:'school',name:'Open the schoolhouse',need:{wood:40,iron_bar:2},coins:600,
    say:'Nell Hartley’s crew are on the schoolhouse by the afternoon: new hinges, the stove pipe swept, the stuck windows planed. Cora Vance stands in the yard with her arms folded, watching, and says it will never be ready by Monday. It will be ready in two days.',
    apply(){twApply('school');}},
  {k:'church',name:'Rebuild the chapel at Old Marrow',need:{wood:120,stone:80,iron_bar:6},coins:2000,
    say:'The fire in the chapel windows goes out the morning the first ladder goes up, as if it had been waiting to be asked. Nell’s crew will need three days. Pastor Hale walks up the old road to watch them and stands a long time with his hat in his hands.',
    apply(){twApply('church');}});}
// paying for one of these starts the building (it's finished a few mornings later)
let TW_PAYING=null;
if(typeof mendGive==='function'){const _g=mendGive;mendGive=function(k){TW_PAYING=k;let r;try{r=_g.apply(this,arguments);}finally{TW_PAYING=null;}try{if(TW_DAYS[k]&&typeof mendS()[k]==='number'){mendS()[k]={day:S.day,ready:S.day+TW_DAYS[k]};twApply(k);}}catch(e){}return r;};}
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);try{for(const k of Object.keys(TW_DAYS)){const v=twV(k);if(v&&typeof v==='object'&&S.day>=v.ready&&!v.told){v.told=1;twApply(k);
    setTimeout(()=>toast(k==='church'?'Word from Old Marrow: the new chapel is finished.':k==='school'?'The schoolhouse is open. The bell rang at eight.':'The streets are clean.',3.4),1500);}else if(v)twApply(k);}}catch(e){}return r;};}
// ---- what each job does to the world
const TW_SCAF={};
function twScaffold(k,on,x,z){const L=TW_SCAF[k]=TW_SCAF[k]||[];if(on&&!L.length){
    for(const [s,dx,dz,o] of [['ladder',-3.2,.25,{}],['ladder',3.4,.25,{flip:true}],['lumber',-5.6,1.6,{}],['in_lumberstack',5.4,1.5,{}],['in_sawhorse',-1.8,1.9,{}],['in_sawhorse',2.2,2.1,{flip:true}]]){
      if(!SPR[s])continue;L.push(obj(s,x+dx,z+dz,Object.assign({kind:'prop',noCol:true,tw:k},o)));}}
  else if(!on&&L.length){for(const o of L)o.hide=true;L.length=0;}}
function twApply(k){try{if(TW_PAYING===k)return;const ready=twReady(k),started=twStarted(k);if(!started)return;
  if(k==='streets'&&ready){for(const o of OBJ){if(o.hide||o.room)continue;const s=String(o.spr||'');
      if((/^tar_(crack|oil)_/.test(s))||((s==='rg_car_b'||s==='rg_car_c'||s==='tyres'||s==='drum')&&o.x>-42&&o.x<-29&&o.z>-18&&o.z<-13)||s==='applespill'||s==='wheel'){o.hide=true;if(o.col){const q=circles.indexOf(o.col);if(q>=0)circles.splice(q,1);}}}
    if(typeof NAV!=='undefined')NAV.sig='';}
  if(k==='school'){const sb=TB.school;twScaffold('school',!ready,sb[1],sb[2]);if(ready&&typeof INDOOR!=='undefined'&&ROOMS.school){const d=tbDoor('school');INDOOR.school={room:'school',door:[d[0],d[1]],spots:{cora:[4.3,1.5]},browse:[[2.6,3.0],[4.0,3.0],[5.4,3.0],[2.6,4.4],[4.0,4.4],[5.4,4.4]]};}}
  if(k==='church'){const o=OBJ.find(q=>q.spr==='rg_chapel'||q.spr==='rg_chapel_new');if(!o)return;twScaffold('church',!ready,o.x,o.z);if(ready)twChapel(o);}
  }catch(e){console.warn('town works',k,e);}}
// the new chapel: Wickham's sister chapel, built new in Old Marrow's own stone-grey; the burnt trees round it cleared
async function twChapel(o){if(o.spr==='rg_chapel_new')return;const m=SPR.wk_chapel;if(!m)return;
  try{if(!IMG[m.src]&&typeof loadImages==='function')await loadImages([m.src]);}catch(e){}const im=IMG[m.src];if(!im||!im.width)return;
  const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.filter='saturate(.7) brightness(1.06) sepia(.12)';g.drawImage(im,0,0);
  IMG['mem:rg_chapel_new']=c;SPR.rg_chapel_new=Object.assign({},m,{src:'mem:rg_chapel_new'});o.spr='rg_chapel_new';o.night=SPR.wk_chapel_n?'wk_chapel_n':null;
  if(!o._twRect){o._twRect=1;addRect(o.x-4.9,o.z-4.2,o.x+4.9,o.z-3.3);}
  for(const q of OBJ)if(!q.hide&&/^rg_burnt_/.test(String(q.spr))&&Math.hypot(q.x-o.x,q.z-o.z)<14){q.hide=true;if(q.col){const i=circles.indexOf(q.col);if(i>=0)circles.splice(i,1);}}
  try{const h=HOUSES.find(h=>h.e===o);if(h)h.lit=true;}catch(e){}}
// ---- the schoolroom (only open once the job is done): Miss Vance's desk, the blackboard, rows of small desks, the stove
{const ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;
  if(SPR.room_home_ward)ROOMS.school={ox,oz:-60,name:'The schoolhouse',shell:'room_home_ward',out:tbOut('school'),furn:[['in_blackboard',4.3,-.95,null,'flat'],
    ['in_schooldesk',2.6,3.4,[-.45,-.3,.45,0]],['in_schooldesk',4.0,3.4,[-.45,-.3,.45,0]],['in_schooldesk',5.4,3.4,[-.45,-.3,.45,0]],['in_schooldesk',2.6,4.8,[-.45,-.3,.45,0]],['in_schooldesk',4.0,4.8,[-.45,-.3,.45,0]],['in_schooldesk',5.4,4.8,[-.45,-.3,.45,0]],
    ['in_desk',6.1,1.0,[-.88,-.45,.88,0]],['in_globe',7.5,1.0,[-.3,-.3,.3,0]],['in_stove',1.0,1.2,[-.68,-.5,.68,0]],['in_primers',8.15,4.6,[-.6,-.3,.6,0]]]};}
{const _bw=buildWorld;buildWorld=function(){_bw();try{
  const [sx0,sz0]=tbDoor('school');const it=interact.find(q=>Math.abs(q.x-sx0)<.05&&Math.abs(q.z-sz0)<.05&&!q._tw);
  if(it){it._tw=1;const lb=it.label,ac=it.act;it.label=function(){return twReady('school')&&ROOMS.school?'Schoolhouse':lb.apply(this,arguments);};
    it.act=function(){if(twReady('school')&&ROOMS.school){if(S.hour<7||S.hour>=18){toast('Locked till morning. A note in Miss Vance’s hand: SCHOOL AT EIGHT. BE ON TIME.',3);return;}enterRoom('school');return;}return ac.apply(this,arguments);};}
  if(ROOMS.school)interact.push({x:ROOMS.school.ox+4.3,z:ROOMS.school.oz+.6,r:1.1,on:()=>S.room==='school',label:()=>'Blackboard',ok:()=>true,act(){toast(S.mend&&S.mend.slate?'SPELLING TEST FRIDAY, in Miss Vance’s best hand, and a chalk cat in the corner nobody has rubbed out.':'DAYS LEFT, and the tally marks under it. Somebody has started rubbing them out.',3.4);}});
  for(const k of Object.keys(TW_DAYS))twApply(k);
  }catch(e){console.warn('town works build',e);}};}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);setTimeout(()=>{try{for(const k of Object.keys(TW_DAYS))twApply(k);}catch(e){}},300);return r;};}
