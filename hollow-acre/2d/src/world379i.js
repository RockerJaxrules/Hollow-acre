/* ================= #379i W6, part three: the station (story plan chapter 3, "Marrow Halt"; the railway's one station, beside the
   platform TRANSIT built at the Crossroads, rail380.js). Nothing here sits on the line (x 15.6-18.2) or on TRANSIT's bench and boards.
   - On the platform's north post, the flag lamp, smashed (a Look); beside the platform, the rusted signal lever in its iron frame
     (a Look; the story frees it with Hollis and Wes);
   - a trapdoor in the platform's planks; under it, the lamp room: lamps on their shelves, oil cans, and the last stationmaster in his chair, a grown man, long
     dead, his cap still on, his own lamp at his feet (the story's Look). No blood is drawn here;
   - for the 2 a.m. wait: you can crawl under the platform's south end. Hidden there you see the planks over you, moonlight in the
     gaps, and if something walks the platform its feet darken the gaps above you.
   All of it waits until the railway's platform is in the world. Anchors: the platform hide at (13.45, 16.6) (outdoors), the cellar
   'w79_lamproom' (its trapdoor at (13.9, 7.5)), the Looks: lamp (13.55, 2.1), lever (12.4, 1.2), the stationmaster (room-local 4.6, 2.2). ================= */
const W79S={};
// ---- small things drawn by hand in code
function w79sCv(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn((x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(x,y,ww||1,hh||1);},g);return c;}
function w79sReg(k,c,ax,ay){const src='w79s:'+k;IMG[src]=c;SPR[k]={src,fw:c.width,fh:c.height,ax,ay,foot:[0,0,0,0]};return k;}
const W79S_WD=['#20140c','#3a2616','#5a3c24','#7a5636','#96704a'],W79S_IR=['#16161a','#2c2c34','#46464f','#62626c'],W79S_RU=['#3a1e10','#5c3218','#7e4a22'];
// the flag lamp on its post: a square iron lamp on a bracket, its red glass smashed out, a few teeth of glass left in the frame
function w79sLampArt(){return w79sCv(22,58,(P)=>{const W=W79S_WD,I=W79S_IR;P(9,52,8,3,'rgba(50,33,37,.55)');
  P(9,12,4,44,W[2]);P(9,12,1,44,W[3]);P(12,12,1,44,W[1]);P(8,12,1,44,W[0]);P(13,12,1,44,W[0]);P(9,11,4,1,W[4]);   /* the post */
  P(13,16,6,2,I[2]);P(13,16,6,1,I[3]);P(17,18,1,3,I[1]);   /* the bracket */
  P(13,20,8,12,I[1]);P(14,21,6,10,'#0c0a0c');P(13,20,8,1,I[3]);P(13,20,1,12,I[2]);P(20,20,1,12,I[0]);   /* the lamp's iron box, its glass gone */
  for(const [x,y,h] of [[14,21,3],[15,21,2],[19,28,3],[18,29,2],[14,29,2]])P(x,y,1,h,'#9a2a20');P(15,21,1,1,'#d85a40');P(19,28,1,1,'#d85a40');   /* the teeth of red glass left in the frame */
  P(15,24,2,3,I[2]);P(15,24,2,1,I[3]);   /* the burner, cold */
  P(14,32,6,2,I[2]);P(13,34,1,1,I[1]);P(20,34,1,1,I[1]);for(const [x,y] of [[6,55],[4,54],[18,56],[16,55]])P(x,y,1,1,'#b8362a');});}   /* the glass on the boards below */
// the signal lever in its frame: a cast-iron quadrant, a long lever rusted fast at the top of its throw, a dull red handle
function w79sLeverArt(){return w79sCv(30,46,(P)=>{const I=W79S_IR,R=W79S_RU;P(4,41,24,3,'rgba(50,33,37,.55)');
  P(3,34,24,8,I[1]);P(3,34,24,1,I[3]);P(3,41,24,1,I[0]);P(5,36,20,1,R[1]);P(9,38,3,2,R[0]);P(18,37,4,2,R[0]);   /* the frame, rusted along its seams */
  for(let i=0;i<9;i++){const x=12+Math.round(Math.cos(Math.PI*(.2+i*.07))*10),y=34-Math.round(Math.sin(Math.PI*(.2+i*.07))*10);P(x,y,2,2,I[2]);}   /* the quadrant */
  for(let i=0;i<30;i++){const x=14-Math.round(i*.28),y=34-i;P(x,y,2,1,i%7===3?R[2]:I[2]);P(x,y,1,1,I[3]);}P(5,3,4,3,'#7a2018');P(5,3,4,1,'#a83a2a');   /* the lever, thrown, and its handle */
  P(12,31,3,3,R[1]);P(12,31,1,1,R[2]);});}
// the stationmaster in his chair: a grown man long dead, slumped, his cap on, his coat buttoned, his hands in his lap, his lamp at his feet
function w79sManArt(){return w79sCv(30,50,(P)=>{const W=W79S_WD,C=['#141824','#222a3c','#33405a'],SK=['#4a4038','#7a6c5c','#9a8a76'];P(4,46,24,3,'rgba(50,33,37,.55)');
  P(6,22,18,4,W[2]);P(6,22,18,1,W[4]);P(6,26,2,20,W[1]);P(22,26,2,20,W[1]);P(8,8,14,16,W[2]);P(8,8,14,1,W[3]);P(8,8,1,16,W[3]);   /* the chair */
  P(10,14,11,14,C[1]);P(10,14,3,14,C[2]);P(19,14,2,14,C[0]);for(const y of [16,20,24])P(15,y,1,1,'#b89a48');   /* the coat, its brass buttons */
  P(9,27,13,6,C[1]);P(9,27,13,1,C[2]);P(10,33,4,12,C[0]);P(17,33,4,12,C[0]);P(10,44,5,2,'#0c0a0c');P(17,44,5,2,'#0c0a0c');   /* the knees and the legs to the floor */
  P(11,25,4,3,SK[1]);P(16,25,4,3,SK[1]);P(11,25,4,1,SK[2]);   /* the hands in his lap */
  P(12,9,8,6,SK[1]);P(12,9,8,1,SK[2]);P(13,13,6,2,SK[0]);P(11,6,10,4,C[0]);P(10,9,12,1,C[0]);P(12,6,8,1,C[2]);P(15,7,2,1,'#b89a48');   /* the head bowed on his chest under the cap */
  P(23,40,5,6,W79S_IR[1]);P(23,40,5,1,W79S_IR[3]);P(24,42,3,3,'#3a2a14');   /* his lamp at his feet, out */
  for(const [x,y,l] of [[2,4,9],[26,2,7],[4,2,1]])for(let i=0;i<l;i++)P(x+i,y+(i%3),1,1,'rgba(200,200,210,.35)');});}   /* cobweb strands */
function w79sArt(){if(W79S.art)return;w79sReg('w79s_lamp',w79sLampArt(),10,54);w79sReg('w79s_lever',w79sLeverArt(),15,42);w79sReg('w79s_man',w79sManArt(),15,46);W79S.art=1;}
w79sArt();
// ---- the lamp room, under the platform, by a trapdoor in its planks
{let ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;
  if(SPR.room_cellar_hale)ROOMS.w79_lamproom={ox,oz:-60,name:'The lamp room',shell:'room_cellar_hale',out:{x:13.9,z:8.05},furn:[
      BF('in_shelf_jars',1.6,.62,.4),BF('in_shelf_jars',6.6,.62,.4),BF('drum',.8,3.8,.3),BF('barrel',7.3,3.9,.3),['w79s_man',4.6,1.7,[-.45,-.4,.45,0]],BF('in_candles',2.9,1.0,.3)]};}
// ---- in the world: the house, the lamp, the lever; nothing on the line, nothing on TRANSIT's bench or boards
function w79sWorld(){if(W79S.world||typeof OBJ==='undefined'||OBJ.length<1000||!OBJ.some(o=>o.spr==='r80_plat'))return;W79S.world=1;   /* only once the railway's platform is there */
  obj('in_trapdoor',13.9,7.5,{kind:'prop',noCol:true});   /* (a prop, so the platform's own deck, a flat drawn after it, does not cover it) */
  obj('w79s_lamp',13.55,1.75,{kind:'prop',noCol:true});addCircle(13.55,1.65,.15);
  obj('w79s_lever',12.4,1.0,{kind:'prop',noCol:true});addRect(11.95,.6,12.9,1.0);
  interact.push({x:13.9,z:7.55,r:.8,on:()=>!S.room&&!W79H.hid,label:()=>'Go down',ok:()=>true,act(){SFX.thud&&SFX.thud(0,.3);enterRoom('w79_lamproom');}});
  interact.push({x:13.55,z:2.15,r:.9,on:()=>!S.room,label:()=>'Look',ok:()=>true,act(){SFX.page&&SFX.page();toast('The flag lamp on the platform post, its red glass smashed out from the inside of the frame. Whoever broke it wanted the train to see nothing here, and go by.',5.2,true);}});
  interact.push({x:12.4,z:1.35,r:.9,on:()=>!S.room,label:()=>'Look',ok:()=>true,act(){SFX.page&&SFX.page();toast('The signal lever, thrown to STOP and rusted there. It would take two people and a bar to free it. Someone has wired the handle to the frame as well.',5.2);}});
  W79H.hideAt(13.45,16.6,'Crawl under the platform','You crawl in under the platform boards, into the smell of creosote and old rain.','planks');}
setInterval(()=>{try{w79sWorld();}catch(e){}},1200);
if(ROOMS.w79_lamproom){
  interact.push({get x(){return ROOMS.w79_lamproom.ox+4.6;},get z(){return ROOMS.w79_lamproom.oz+2.25;},r:1.05,on:()=>S.room==='w79_lamproom',label:()=>'Look',ok:()=>true,act(){SFX.page&&SFX.page();
    toast('The last stationmaster, in his chair among the lamps, his cap on, his coat buttoned to the throat. He has been dead a very long time. His own lamp is at his feet, trimmed and full, as if he meant to go up and light the platform and never did.',6,true);if(typeof mindHit==='function')mindHit(5);}});}
// ---- the platform hide: under its south end; the hidden view is the planks over you
W79H.hideAt=function(x,z,label,text,view){const s={room:null,x,z,label,text,view};W79H.spots.push(s);
  interact.push({x,z,r:1,on:()=>!S.room&&!W79H.hid,label:()=>label,ok:()=>true,act(){W79H.hide(s);}});return s;};
{const _d=w79hDraw;w79hDraw=function(){if(!(W79H.hid&&W79H.hid.view==='planks'))return _d.apply(this,arguments);
  const c=w79hLayer();if(!c)return;if(c.width!==VW||c.height!==VH){c.width=VW;c.height=VH;}const g=c.getContext('2d'),th=W79H.th,t=performance.now()/1000;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
  R(0,0,VW,VH,'#020103');const gaps=6,y0=Math.round(VH*.16),step=Math.round(VH*.1),x0=Math.round(VW*.12),w=Math.round(VW*.76);
  let fx=null;if(th&&(th.phase==='in'||th.phase==='leave')){const u=th.phase==='in'?Math.min(1,th.t/2.6):1-Math.min(1,th.t/1.6);fx=x0+w*(th.phase==='in'?u*.5:.5+(1-u)*.5);}
  for(let i=0;i<gaps;i++){const y=y0+i*step,a=.32+.1*Math.sin(t*.3+i);R(x0,y,w,1,`rgba(150,170,200,${a.toFixed(3)})`);R(x0+w*.1,y+1,w*.8,1,`rgba(90,104,130,${(a*.5).toFixed(3)})`);
    if(fx!==null&&(i===2||i===3)){for(const sd of [-1,1])R(fx+sd*w*.03-w*.025,y-1,w*.05,3,'#020103');}}
  for(let i=0;i<5;i++){const u=(t*(.02+i*.005)+i*.31)%1;R(x0+w*((i*.23+.1)%1),y0+step*2.5+u*step*2,1,1,`rgba(200,210,230,${((1-u)*.35).toFixed(3)})`);}};}
