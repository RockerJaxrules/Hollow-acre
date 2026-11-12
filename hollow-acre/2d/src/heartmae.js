/* ================= #267 Caitlyn's heart events as real scenes. Five of her seven were still read out as captions while she
   stood next to you. Now each one happens in the store (or on its porch) and you see it:
     The photo behind the counter   she lifts the face-down frame, turns it round, and the photo fills the view; then she lays it back down;
     The lots                       her hands keep folding the same dish towel; the hat and the slip with Danny's name come up close;
     Walt's lantern                 she brings the brass lantern round the counter, puts it in your arms, the worn engraving up close, and it lights;
     After hours                    CLOSED on the counter, the radio on, the bread rack pushed back; the two of you dance between the shelves, she
                                    steps on your foot, the song ends, the radio says its line, she switches it off, and you dance once more;
     The porch light                out on the porch at dusk, the light over the door; she walks to the switch and turns it off; the street goes
                                    dark; something far out in the corn sighs; she comes back and asks you to promise.
   Props are drawn in the heart events' house style: ramps, one bold outline, lit from the top left, a flat drop shadow. ================= */
const HM={};
// ---- a close-up: a small picture drawn once, shown pixel-doubled in a card at the top of the view
function hmCard(key,w,h,fn){if(HM[key])return HM[key];const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const P=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(x,y,ww||1,hh||1);};fn(P,g,w,h);return HM[key]=c;}
function hmShowCard(img,k,cap){if(k<=0)return;const sc=Math.max(2,Math.min(3,Math.floor(VH*.42/img.height))),w=img.width*sc,h=img.height*sc,x=Math.round(VW/2-w/2),y=Math.round((typeof STG!=='undefined'&&STG?VH*.105:VH*.08)+(1-k)*8);   // (below the letterbox bar in a scene)
  ctx2.save();ctx2.globalAlpha=Math.min(1,k);ctx2.fillStyle='rgba(8,6,10,.45)';ctx2.fillRect(0,0,VW,VH);
  ctx2.fillStyle='#120c08';ctx2.fillRect(x-4,y-4,w+8,h+8);ctx2.fillStyle=HSP.wood[3];ctx2.fillRect(x-3,y-3,w+6,h+6);ctx2.fillStyle=HSP.wood[4];ctx2.fillRect(x-3,y-3,w+6,1);ctx2.fillStyle=HSP.wood[1];ctx2.fillRect(x-3,y+h+2,w+6,1);
  ctx2.imageSmoothingEnabled=false;ctx2.drawImage(img,x,y,w,h);ctx2.restore();}
// letters from the game's 3x5 pixel font; a slant shifts the upper rows right, for handwriting
function hmText(P,str,x,y,col,slant,lip,sc){sc=sc||1;let X=x;for(const ch of String(str).toUpperCase()){const f=(typeof PXFONT!=='undefined'&&PXFONT[ch])||null;if(!f){X+=3*sc;continue;}
    for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(f[j*3+i]==='1'){const sx=slant?Math.round((4-j)*.5):0;P(X+i*sc+sx,y+j*sc,sc,sc,col);if(lip)P(X+i*sc+sx,y+j*sc+sc,sc,1,lip);}X+=4*sc;}return X;}
// the photo: a boy with a gap in his teeth holding up a fish longer than he is wide, on a dock, in faded sepia, the white border gone soft at one corner
const hmPhoto=()=>hmCard('photo2',64,50,(P,g,w,h)=>{const S=['#3a2a1c','#5a4430','#7a6046','#9a7e5e','#b89c78','#d4bc96','#ece0c4'];
  P(0,0,w,h,'#f2e8d0');P(w-6,0,6,2,S[5]);P(w-3,0,3,6,S[5]);P(w-4,1,2,2,S[6]);
  for(let y=3;y<h-3;y++){const u=(y-3)/(h-6);P(3,y,w-6,1,u<.34?S[5]:u<.4?S[2]:u<.66?S[4]:S[2]);}   // sky, the far trees, the lake, the dock
  for(let x=3;x<w-3;x++){const t=Math.round(Math.sin(x*.4)*1.2+Math.sin(x*.13)*1.5);P(x,18-t,1,2+t,S[2]);}
  for(let x=5;x<w-3;x+=7)P(x,34,1,h-37,S[1]);P(3,34,w-6,1,S[3]);
  const cx=32;
  P(cx-6,34,5,4,S[1]);P(cx+1,34,5,4,S[1]);P(cx-5,38,3,6,S[5]);P(cx+2,38,3,6,S[5]);P(cx-6,43,4,2,S[0]);P(cx+2,43,4,2,S[0]);   // shorts, thin legs, shoes
  for(let y=21;y<34;y++){P(cx-7,y,14,1,(y%3===0)?S[2]:S[4]);}P(cx-2,20,4,2,S[5]);   // a striped shirt, a neck
  P(cx-6,8,12,12,S[5]);P(cx-6,8,12,1,S[6]);P(cx-7,11,1,4,S[5]);P(cx+6,11,1,4,S[4]);   // the face
  P(cx-7,6,14,4,S[1]);P(cx-6,5,10,2,S[1]);P(cx-5,9,3,2,S[1]);P(cx+2,9,4,1,S[1]);P(cx-7,9,1,3,S[1]);   // a mop of hair
  P(cx-3,12,2,2,S[0]);P(cx+2,12,2,2,S[0]);P(cx-3,12,1,1,S[6]);P(cx+2,12,1,1,S[6]);   // eyes
  P(cx-4,16,9,2,S[0]);P(cx-3,16,7,1,S[6]);P(cx,16,1,1,S[0]);   // a wide grin, one front tooth gone
  // the fish: long as his arms spread, its back dark, its belly pale, a forked tail, a fin, an eye
  for(let x=0;x<38;x++){const u=x/37,r=Math.round(4.6*Math.sin(Math.min(1,u*1.15)*Math.PI*.92)+.5);const X=cx-21+x;
    for(let y=-r;y<=r;y++)P(X,26+y,1,1,y<-r*.4?S[2]:y<r*.3?S[4]:S[5]);if(r>0)P(X,26-r,1,1,S[1]);}
  P(cx-26,21,4,2,S[2]);P(cx-25,23,3,2,S[2]);P(cx-26,29,4,2,S[2]);P(cx-25,27,3,2,S[2]);P(cx-23,24,2,4,S[3]);   // the tail
  P(cx-6,20,7,1,S[1]);P(cx-4,19,4,1,S[1]);P(cx+12,25,2,2,S[0]);P(cx+12,25,1,1,S[6]);P(cx+9,23,1,6,S[2]);   // the fin, the eye, the gill
  P(cx-12,25,3,3,S[5]);P(cx-12,25,3,1,S[6]);P(cx+5,25,3,3,S[5]);P(cx+5,25,3,1,S[6]);});   // his hands holding it up
// inside the hat: folded slips, one opened on top with the name printed large in a sheriff's careful capitals
const hmSlip=()=>hmCard('slip3',68,46,(P,g,w,h)=>{const F=['#140e0c','#22181a','#30242a','#3e3038'];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const e=((x-34)/33)**2+((y-23)/22)**2;if(e<=1)P(x,y,1,1,F[e>.8?3:e>.5?2:e>.25?1:0]);}
  for(const [x,y,r] of [[6,30,0],[54,30,1],[16,38,1],[48,6,0],[8,10,1],[56,18,0]]){P(x,y,8,4,'#d8ccb0');P(x,y,8,1,'#f0e6cc');P(x+(r?4:3),y,1,4,'#b0a488');}
  P(10,7,48,32,'#ece2c8');P(10,7,48,1,'#fffaea');P(10,38,48,1,'#b8ac90');P(34,7,1,32,'#ddd3b8');
  const ink='#2a1a2e';hmText(P,'DANNY',14,10,ink,0,0,2);hmText(P,'COYLE',14,23,ink,0,0,2);hmText(P,"'99",45,32,'#7a5a4a',0);});
// Walt's lantern up close: the wire bail, the cap, the glass globe round a trimmed wick, and the brass base with W. COYLE cut into it, polished soft
const hmEngrave=()=>hmCard('engrave3',64,70,(P,g,w,h)=>{const B=['#4a300c','#6a4812','#8e641c','#b48228','#d4a03c','#e8c060','#f6dc94','#fff2c8'];const o='#120c08';
  for(let i=0;i<=22;i++){const a=Math.PI+i/22*Math.PI,x=Math.round(32+Math.cos(a)*14),y=Math.round(12+Math.sin(a)*10);P(x,y,1,1,o);}   // the bail
  P(18,10,28,8,o);for(let y=11;y<17;y++)P(19,y,26,1,B[y<13?6:y<15?4:3]);P(26,7,12,4,B[2]);P(26,7,12,1,B[5]);   // the cap
  P(17,18,30,24,o);for(let y=19;y<41;y++)for(let x=18;x<46;x++){const u=(x-18)/28;P(x,y,1,1,u<.2?'#9aa8a8':u<.3?'#d8e4e0':'#5a6a6a');}   // the glass
  P(31,30,2,10,B[1]);P(30,28,4,3,'#2a2420');P(31,27,2,2,'#4a4038');for(const xx of [24,40])P(xx,18,1,24,B[2]);   // the wick, the guard wires
  P(12,42,40,22,o);for(let y=43;y<63;y++){const u=(y-43)/19;const k=u<.1?7:u<.25?6:u<.6?5:u<.85?4:3;P(13,y,38,1,B[k]);}   // the brass base, lit along its top
  for(let x=13;x<51;x+=1)if((x*7)%13===0)P(x,46,1,14,B[6]);
  hmText(P,'W.COYLE',17,50,B[1],0,B[7]);});
// ---- props in the world (screen space)
function hmFrameFlat(X,Y){ctx2.fillStyle='#120c08';ctx2.fillRect(X-5,Y-2,11,4);ctx2.fillStyle=HSP.wood[2];ctx2.fillRect(X-4,Y-1,9,2);ctx2.fillStyle=HSP.wood[4];ctx2.fillRect(X-4,Y-1,9,1);}
function hmFrameUp(X,Y,front){ctx2.fillStyle='#120c08';ctx2.fillRect(X-5,Y-12,10,13);ctx2.fillStyle=HSP.wood[3];ctx2.fillRect(X-4,Y-11,8,11);ctx2.fillStyle=HSP.wood[4];ctx2.fillRect(X-4,Y-11,8,1);
  if(front){ctx2.fillStyle='#d4bc96';ctx2.fillRect(X-3,Y-10,6,9);ctx2.fillStyle='#7a6046';ctx2.fillRect(X-1,Y-8,2,3);ctx2.fillRect(X-2,Y-5,4,3);ctx2.fillStyle='#b89c78';ctx2.fillRect(X-3,Y-4,6,1);}
  else{ctx2.fillStyle=HSP.wood[1];ctx2.fillRect(X-3,Y-10,6,9);ctx2.fillStyle=HSP.wood[2];ctx2.fillRect(X-1,Y-9,2,7);}}
function hmTowel(X,Y,k){const w=Math.round(8+k*12),hh=Math.round(10-k*4);X=Math.round(X);ctx2.fillStyle='#14100c';ctx2.fillRect(X-w/2-1,Y-hh,w+2,hh+2);ctx2.fillStyle='#d8d0bc';ctx2.fillRect(X-w/2,Y-hh+1,w,hh);
  ctx2.fillStyle='#b23a2a';for(let y=Y-hh+3;y<Y;y+=3)ctx2.fillRect(X-w/2,y,w,1);ctx2.fillStyle='#f0ead8';ctx2.fillRect(X-w/2,Y-hh+1,w,1);ctx2.fillStyle='#a89e88';ctx2.fillRect(X-w/2,Y,w,1);
  ctx2.fillStyle='#e8c0a0';ctx2.fillRect(X-w/2-3,Y-hh+2,3,4);ctx2.fillRect(X+w/2,Y-hh+2,3,4);}
function hmLantern(X,Y,lit,t){const B=HSP.brass;ctx2.fillStyle='#120c08';ctx2.fillRect(X-5,Y-16,11,17);
  ctx2.fillStyle=B[1];ctx2.fillRect(X-4,Y-3,9,3);ctx2.fillStyle=B[2];ctx2.fillRect(X-4,Y-3,9,1);   // the base
  ctx2.fillStyle=lit?'#ffe8a8':'#4a4438';ctx2.fillRect(X-3,Y-11,7,8);if(lit){ctx2.fillStyle='#fff8e0';ctx2.fillRect(X-1,Y-9,2,4+Math.round(Math.sin(t*14)));}ctx2.fillStyle=B[1];ctx2.fillRect(X,Y-11,1,8);   // the globe, the guard
  ctx2.fillStyle=B[2];ctx2.fillRect(X-4,Y-14,9,3);ctx2.fillStyle=B[3];ctx2.fillRect(X-4,Y-14,9,1);ctx2.fillStyle='#120c08';ctx2.fillRect(X-3,Y-19,7,1);ctx2.fillRect(X-3,Y-19,1,5);ctx2.fillRect(X+3,Y-19,1,5);}   // the cap, the wire bail
function hmRadio(X,Y,on,t){ctx2.fillStyle='#120c08';ctx2.fillRect(X-10,Y-13,21,13);ctx2.fillStyle=HSP.wood[2];ctx2.fillRect(X-9,Y-12,19,11);ctx2.fillStyle=HSP.wood[4];ctx2.fillRect(X-9,Y-12,19,1);ctx2.fillStyle=HSP.wood[1];ctx2.fillRect(X-9,Y-2,19,1);
  ctx2.fillStyle='#2a1a10';for(let i=0;i<4;i++)ctx2.fillRect(X-7,Y-10+i*2,7,1);   // the speaker cloth
  ctx2.fillStyle=on?'#f0b048':'#3a2a18';ctx2.fillRect(X+2,Y-10,6,4);if(on){ctx2.fillStyle='#fff0b8';ctx2.fillRect(X+3+Math.round((Math.sin(t*.7)+1)*1.5),Y-10,1,4);}
  ctx2.fillStyle=HSP.brass[2];ctx2.fillRect(X+3,Y-5,2,2);ctx2.fillRect(X+6,Y-5,2,2);}
function hmNotes(X,Y,t){for(let i=0;i<3;i++){const a=(t*.45+i/3)%1;const x=Math.round(X+Math.sin(a*6+i)*7+i*4-4),y=Math.round(Y-14-a*34);ctx2.globalAlpha=Math.min(1,(1-a)*1.8);
    ctx2.fillStyle='#120c08';ctx2.fillRect(x-1,y-1,6,5);ctx2.fillRect(x+3,y-9,3,9);ctx2.fillRect(x+3,y-10,6,3);ctx2.fillStyle='#ffe08a';ctx2.fillRect(x,y,4,3);ctx2.fillRect(x+4,y-8,1,8);ctx2.fillRect(x+4,y-9,4,1);ctx2.fillStyle='#fff6d0';ctx2.fillRect(x,y,2,1);ctx2.globalAlpha=1;}}
function hmRack(X,Y){ctx2.fillStyle='#120c08';ctx2.fillRect(X-9,Y-26,19,27);ctx2.fillStyle='#5a5a62';for(let y=0;y<4;y++){ctx2.fillRect(X-8,Y-24+y*7,17,1);}ctx2.fillRect(X-8,Y-25,1,26);ctx2.fillRect(X+8,Y-25,1,26);
  ctx2.fillStyle='#c89050';for(const [dx,dy] of [[-5,-27],[1,-27],[-3,-20],[3,-13],[-6,-13]]){ctx2.fillRect(X+dx,Y+dy+4,5,2);ctx2.fillStyle='#e0b070';ctx2.fillRect(X+dx,Y+dy+4,5,1);ctx2.fillStyle='#c89050';}}
function hmClosed(X,Y){ctx2.fillStyle='#120c08';ctx2.fillRect(X-8,Y-11,17,9);ctx2.fillStyle='#7a2420';ctx2.fillRect(X-7,Y-10,15,7);ctx2.fillStyle='#f0e4c8';ctx2.font='6px monospace';ctx2.textAlign='center';ctx2.fillText('CLOSED',X+1,Y-4);ctx2.textAlign='left';}
// the porch lamp over the store door: an iron cage with a bulb, and the switch plate on the frame
function hmPorchLamp(X,Y,on){const o='#120c08';ctx2.fillStyle=o;ctx2.fillRect(X-1,Y-2,3,8);ctx2.fillRect(X-6,Y-12,13,16);   // the bracket, the cage
  ctx2.fillStyle=on?'#ffe0a0':'#3a3630';ctx2.fillRect(X-5,Y-10,11,12);if(on){ctx2.fillStyle='#fff6d8';ctx2.fillRect(X-2,Y-8,5,8);ctx2.fillStyle='#ffffff';ctx2.fillRect(X-1,Y-6,2,3);}
  ctx2.fillStyle=o;ctx2.fillRect(X,Y-10,1,12);ctx2.fillRect(X-5,Y-4,11,1);ctx2.fillStyle='#2a2420';ctx2.fillRect(X-7,Y-14,15,3);ctx2.fillStyle='#4a4038';ctx2.fillRect(X-7,Y-14,15,1);}
function hmSwitch(X,Y,on){ctx2.fillStyle='#120c08';ctx2.fillRect(X-2,Y-4,5,7);ctx2.fillStyle='#d8d0bc';ctx2.fillRect(X-1,Y-3,3,5);ctx2.fillStyle='#5a5040';ctx2.fillRect(X,on?Y-3:Y,1,2);}
// a slow tune for the radio: a waltz out of somebody's past, played softly
const HM_TUNE=[392,0,330,392,440,0,392,330,294,0,262,294,330,0,0,0,392,0,330,392,523,0,494,440,392,0,330,294,262,0,0,0];
function hmTune(st){if(!A||!A.ok||!A.tone)return;st._tn=(st._tn||0);st._tc=(st._tc||0)+1;const f=HM_TUNE[st._tn%HM_TUNE.length];st._tn++;if(f)A.tone(f,.42,'triangle',.022,{filter:['lowpass',1800]});if(st._tn%4===1)A.tone(f?f/2:131,.6,'sine',.014);}
const hmStore=()=>{const R=ROOMS.store;return {ox:R.ox,oz:R.oz,cz:R.oz+2.66,counter:R.oz+4.1};};
const HM_CAM=o=>({x:o.ox+14,z:o.oz+4.5});
// ================================================================= 1. The photo behind the counter
function hsMaePhoto(done){const o=hmStore(),ox=o.ox,oz=o.oz;MAEV.on=false;const R0=ROOMS.store,door={x:R0.ox+R0.door,z:R0.oz+R0.d};let tob=null;const tobOff=st=>{tob=npcById('tobias');if(tob){tob.vis=false;delete st.pin.tobias;}};let fr=0,look=0;const img=hmPhoto();
  stage({show:true,room:'store',hour:Math.min(Math.max(S.hour,9.5),16.5),player:{x:ox+14,z:oz+5.7,dir:'N'},cast:{tobias:{x:ROOMS.store.ox+ROOMS.store.door,z:ROOMS.store.oz+ROOMS.store.d-.3,dir:'N'},mae:{x:ox+14,z:o.cz,dir:'S'}},cam:HM_CAM(o),lead:700,
    light(L){glowAt(sx(ox+9),sz(oz+2.4)-40,110,[255,186,110],.28);},
    props:[{x:ox+14.7,z:o.counter-.02,draw(X,Y){if(fr===0||fr===3){ctx2.save();ctx2.translate(X,Y-28);ctx2.scale(1.6,1.6);hmFrameFlat(0,0);ctx2.restore();}}},
      {get x(){const n=npcById('mae');return n?n.x:0;},get z(){const n=npcById('mae');return n?n.z+.02:0;},draw(X,Y){if(fr===1||fr===2){ctx2.save();ctx2.translate(X+(fr===2?0:4),Y-14);ctx2.scale(1.6,1.6);hmFrameUp(0,0,fr===2);ctx2.restore();}}},
      {x:0,z:9e5,draw(){hmShowCard(img,look);}}],
    beats:[

      {hold:.9,face:{mae:'S',you:'N'},act(st){tobOff(st);stgTitle('Caitlyn — The photo behind the counter');}},
      {hold:.5,face:{mae:'N'}},
      {hold:.9,act(){fr=1;SFX.page&&SFX.page();},pose:{mae:'spellcast'}},
      {hold:.5,face:{mae:'S'},act(){fr=2;},pose:{mae:null}},
      {hold:1.6,update(dt){look=Math.min(1,look+dt*1.4);}},
      {who:'mae',text:'That’s Danny. My big brother.',expr:'sad'},
      {hold:.9,update(dt){look=Math.max(0,look-dt*1.6);},emote:{mae:'💧'}},
      {hold:.2,act(){if(tob)tob.vis=true;SFX.thud&&SFX.thud(0,.15);}},
      {hold:0,go:{tobias:[[door.x,door.z-1.6],[ox+12.6,o.counter+.9]]},face:{tobias:'N'},wait:'arrive',act(){fr=3;SFX.thud&&SFX.thud(0,.22);},emote:{mae:'!'}},
      {hold:.7,emote:{tobias:'?'}},
      {who:'mae',text:'Homework. Now.',expr:'angry'},
      {hold:0,go:{tobias:[[door.x,door.z-1.4],[door.x,door.z-.3]]},wait:'arrive',act(){}},
      {hold:.5,act(st){tobOff(st);}},
      {hold:.8,face:{mae:'S'},emote:{mae:'…'}},
      {who:'mae',text:'He doesn’t know. Let’s keep it that way.',expr:'sad',linger:.6}],
    done(){maeCome(6,true);done&&done();}});}
// ================================================================= 2. The lots
function hsMaeLots(done){const o=hmStore(),ox=o.ox,oz=o.oz;MAEV.on=false;let fold=0,look=0,towel=1,open=0;const img=hmSlip();
  stage({show:true,room:'store',hour:Math.min(Math.max(S.hour,10),17),player:{x:ox+14,z:oz+5.7,dir:'N'},cast:{mae:{x:ox+14,z:o.cz,dir:'S'}},cam:HM_CAM(o),lead:700,
    light(L){glowAt(sx(ox+9),sz(oz+2.4)-40,110,[255,186,110],.26);},
    props:[{get x(){const n=npcById('mae');return n?n.x:0;},get z(){const n=npcById('mae');return n?n.z+.02:0;},draw(X,Y,t){if(towel===1)hmTowel(X,Y-16,fold?(Math.sin(t*2.6)+1)/2:.5);}},
      {x:ox+14.3,z:o.counter-.02,draw(X,Y){if(towel===2){const y=Y-29;   // crumpled on the counter top beside her hands: one fold, its stripes, lit from the top left
          ctx2.fillStyle='#14100c';ctx2.fillRect(X-11,y-1,22,8);ctx2.fillRect(X-6,y-4,12,4);ctx2.fillStyle='#c8c0aa';ctx2.fillRect(X-10,y,20,6);ctx2.fillStyle='#e8e0cc';ctx2.fillRect(X-10,y,20,2);ctx2.fillRect(X-5,y-3,10,3);
          ctx2.fillStyle='#f6f0e0';ctx2.fillRect(X-5,y-3,10,1);ctx2.fillStyle='#a89e88';ctx2.fillRect(X-10,y+5,20,1);ctx2.fillRect(X+4,y-3,1,3);ctx2.fillStyle='#b23a2a';ctx2.fillRect(X-10,y+2,20,1);ctx2.fillRect(X-5,y-1,10,1);ctx2.fillStyle='#82261c';ctx2.fillRect(X-10,y+4,20,1);}}},
      {x:0,z:9e5,draw(){if(look<=0)return;hmShowCard(img,look);if(open<1){const sc=Math.max(2,Math.min(3,Math.floor(VH*.42/img.height))),w=img.width*sc,x=Math.round(VW/2-w/2),y=Math.round(VH*.08+(1-look)*8);
          ctx2.save();ctx2.globalAlpha=Math.min(1,look)*(1-open);ctx2.fillStyle='#d8ccb0';ctx2.fillRect(x+10*sc,y+12*sc,36*sc,16*sc);ctx2.fillStyle='#b0a488';ctx2.fillRect(x+27*sc,y+12*sc,1*sc,16*sc);ctx2.restore();}}}],
    beats:[

      {hold:.9,face:{mae:'S',you:'N'},act(){stgTitle('Caitlyn — The lots');fold=1;}},
      {hold:1.4},
      {who:'mae',text:'Every September, they draw a name.',expr:'think'},
      {hold:.6,face:{mae:'N'},act(){fold=0;}},
      {hold:.8,act(){A.tone&&A.tone(1400,.05,'square',.02);SFX.coin&&SFX.coin();},pose:{mae:'thrust'}},
      {hold:.4,face:{mae:'S'},pose:{mae:null}},
      {hold:1.5,update(dt){look=Math.min(1,look+dt*1.3);}},
      {hold:1.6,update(dt){open=Math.min(1,open+dt*1.1);},act(){SFX.page&&SFX.page();}},
      {who:'mae',text:'Danny’s. In Dunn’s handwriting.',expr:'sad',linger:.4},
      {hold:.8,update(dt){look=Math.max(0,look-dt*1.4);}},
      {hold:.7,act(){towel=2;SFX.thud&&SFX.thud(0,.3);cam.shake=Math.max(cam.shake||0,.12);},pose:{mae:'slash'},emote:{mae:'!'}},
      {hold:1.0,pose:{mae:null},face:{mae:'E'}},
      {hold:.6,face:{mae:'S'}},
      {who:'mae',text:'I’ve never said that out loud.',expr:'sad',linger:.6}],
    done(){maeCome(6,true);done&&done();}});}
// ================================================================= 3. Walt's lantern
function hsMaeLantern(done){const o=hmStore(),ox=o.ox,oz=o.oz;MAEV.on=false;let lan=0,lit=0,look=0;const img=hmEngrave();const you={x:ox+13.6,z:oz+5.7};
  stage({show:true,room:'store',hour:Math.min(Math.max(S.hour,17.6),19.4),player:{x:you.x,z:you.z,dir:'N'},cast:{mae:{x:ox+14,z:o.cz,dir:'S'}},cam:HM_CAM(o),lead:700,
    light(L){glowAt(sx(ox+9),sz(oz+2.4)-40,100,[255,180,100],.24);if(lit){const X=sx(P.x)+7,Y=sz(P.z)-26;glowAt(X,Y,150+Math.sin(STG.t*9)*4,[255,210,130],.85);glowAt(X,sz(P.z)+2,110,[255,190,110],.5);const m=npcById('mae');if(m)glowAt(sx(m.x),sz(m.z)-24,60,[255,210,140],.35);}},
    props:[{get x(){const n=npcById('mae');return n?n.x:0;},get z(){const n=npcById('mae');return n?n.z+.02:0;},draw(X,Y,t){if(lan===1)hmLantern(X+4,Y-14,0,t);}},
      {get x(){return P.x;},get z(){return P.z+.02;},draw(X,Y,t){if(lan===2){ctx2.save();ctx2.translate(X+7,Y-12);ctx2.scale(1.5,1.5);hmLantern(0,0,lit,t);ctx2.restore();}}},
      {x:0,z:9e5,draw(){hmShowCard(img,look);}}],
    beats:[

      {hold:.8,face:{mae:'S',you:'N'},act(){stgTitle('Caitlyn — Walt’s lantern');}},
      {hold:.5,face:{mae:'N'}},
      {hold:.8,act(){lan=1;SFX.thud&&SFX.thud(0,.2);},pose:{mae:'spellcast'}},
      {hold:0,go:{mae:[[ox+15.6,o.cz+.1],[ox+15.6,oz+5.2],[you.x+.75,you.z]]},face:{mae:'W',you:'E'},wait:'arrive',pose:{mae:null}},
      {hold:.8,act(){lan=2;SFX.thud&&SFX.thud(0,.3);stgEmote('you','!',1.2);},pose:{mae:'thrust'}},
      {hold:1.5,update(dt){look=Math.min(1,look+dt*1.3);},pose:{mae:null}},
      {who:'mae',text:'Dad’s. He took it the night he went after Danny.',expr:'sad'},
      {hold:1.0,update(dt){look=Math.max(0,look-dt*1.6);},act(){setTimeout(()=>{lit=1;A.tone&&A.tone(180,.3,'sine',.04,{slide:260});},600);}},
      {hold:1.4,emote:{mae:'…'}},
      {hold:.9,face:{mae:'S'}},
      {hold:.7,face:{mae:'W'}},
      {who:'mae',text:'If it comes to it, don’t let them choose Tobias.',expr:'scared',linger:.6}],
    done(){maeCome(6,true);done&&done();}});}
// ================================================================= 4. After hours
// the dance itself: the two of you face each other close, her hand on your shoulder, yours at her waist, the other two joined and held out;
// you sway side to side, stepping round each other a half-turn at a time; when she treads on your boot you hop
HM.hop=0;{const _al=actLean;actLean=function(){const r=_al();return HM.hop>0?[r[0],r[1]-Math.round(HM.hop)]:r;};}
function hmArms(ax,ay,bx,by,skinA,skinB){const o='#120c08';const line=(x0,y0,x1,y1,c)=>{const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));for(let k=0;k<=n;k++){const x=Math.round(x0+(x1-x0)*k/n),y=Math.round(y0+(y1-y0)*k/n);ctx2.fillStyle=o;ctx2.fillRect(x-1,y-1,3,3);}
    for(let k=0;k<=n;k++){const x=Math.round(x0+(x1-x0)*k/n),y=Math.round(y0+(y1-y0)*k/n);ctx2.fillStyle=c;ctx2.fillRect(x,y,1,1);}};
  const dir=bx>ax?1:-1;
  line(ax+dir*3,ay-24,bx-dir*4,by-17,skinA);   // your hand at her waist
  line(bx-dir*3,by-27,ax+dir*4,ay-28,skinB);   // hers on your shoulder
  const hx=(ax+bx)/2,hy=Math.min(ay,by)-30;line(ax+dir*2,ay-25,hx,hy,skinA);line(bx-dir*2,by-25,hx,hy,skinB);ctx2.fillStyle=o;ctx2.fillRect(hx-2,hy-2,5,5);ctx2.fillStyle=skinA;ctx2.fillRect(hx-1,hy-1,3,3);}   // the other two hands, joined and held out
function hsMaeAfter(done){const o=hmStore(),ox=o.ox,oz=o.oz;MAEV.on=false;let radio=1,dance=0,ang=Math.PI,spd=0,tuneT=0,hopT=0,stomp=0;const C={x:ox+13.4,z:oz+6.2};
  const skin=()=>{const L=(S&&S.look)||{};return /^#[0-9a-f]{6}$/i.test(L.skin||'')?L.skin:'#e8b48c';};
  stage({show:true,room:'store',hour:21.6,player:{x:C.x-.6,z:C.z,dir:'E'},cast:{mae:{x:ox+14,z:o.cz,dir:'S'}},cam:{x:C.x+.3,z:C.z-.6},lead:700,
    light(L){glowAt(sx(ox+13.2),sz(o.counter)-26,80,[255,190,110],radio?.5:.12);glowAt(sx(C.x),sz(C.z)-20,130,[255,200,140],.2);},
    props:[{x:ox+13.2,z:o.counter-.02,draw(X,Y,t){hmRadio(X,Y-12,radio,t);}},
      {x:ox+13.2,z:9e5-1,draw(X,Y,t){if(radio)hmNotes(sx(ox+13.2)+2,sz(o.counter)-24,t);}},
      {x:ox+15.2,z:o.counter-.02,draw(X,Y){hmClosed(X,Y-12);}},
      {x:ox+17.2,z:oz+1.9,draw(X,Y){hmRack(X,Y);}},
      {get x(){return C.x;},get z(){const m=npcById('mae');return Math.max(P.z,m?m.z:P.z)+.05;},draw(){if(!dance&&spd<.2)return;const m=npcById('mae');if(!m)return;hmArms(sx(P.x),sz(P.z)-Math.round(HM.hop),sx(m.x),sz(m.z),skin(),'#ecc4a4');}},
      {get x(){return P.x;},get z(){return P.z+.04;},draw(X,Y){if(stomp>0){ctx2.fillStyle='#f0e4c8';for(let k=0;k<5;k++){const a=k/5*6.283;ctx2.fillRect(Math.round(X+Math.cos(a)*(4+(1-stomp)*6)),Math.round(Y-1+Math.sin(a)*2),2,1);}}}}],
    tick(dt,st){if(radio){tuneT-=dt;if(tuneT<=0){tuneT=.5;hmTune(st);}}
      if(hopT>0){hopT-=dt;HM.hop=Math.max(0,Math.sin((1-hopT/.45)*Math.PI)*5);}else HM.hop=0;if(stomp>0)stomp-=dt*2.5;
      spd+=((dance?.55:0)-spd)*Math.min(1,dt*2);if(spd<.02&&!dance)return;ang+=dt*spd;const m=npcById('mae');if(!m)return;
      const r=.36,sw=Math.sin(st.t*1.9)*.1;const ax=C.x+Math.cos(ang)*r+sw,az=C.z+Math.sin(ang)*r*.4,bx=C.x-Math.cos(ang)*r+sw,bz=C.z-Math.sin(ang)*r*.4;
      P.x=ax;P.z=az;m.x=bx;m.z=bz;st.pin.mae={x:bx,z:bz};P.dir=bx>ax?'E':'W';m.dir=bx>ax?'W':'E';const moving=Math.abs(Math.cos(st.t*1.9))>.35;P.clip=moving?'walk':'idle';m.clip=P.clip;P.spd=moving?.4:0;},
    beats:[
      {hold:.9,face:{mae:'S'},act(){stgTitle('Caitlyn — After hours');}},
      {hold:0,go:{mae:[[ox+15.6,o.cz+.1],[ox+15.6,oz+5.4],[C.x+.5,C.z]]},face:{mae:'W',you:'E'},wait:'arrive'},
      {who:'mae',text:'Don’t make it weird.',expr:'neutral'},
      {hold:1.8,act(){dance=1;},emote:{mae:'♪'}},
      {hold:1.6},
      {hold:.9,act(){hopT=.45;stomp=1;stgEmote('you','!',1);A.tone&&A.tone(120,.08,'square',.03);}},
      {hold:1.6},
      {hold:.9,act(){hopT=.45;stomp=1;stgEmote('you','!',1);A.tone&&A.tone(120,.08,'square',.03);}},
      {who:'mae',text:'Sorry.',expr:'neutral'},
      {hold:2.4},
      {hold:1.2,act(){dance=0;tuneT=99;}},
      {who:'radio',at:{x:ox+13.2,z:o.counter,h:30},text:'…and that one goes out to the two of you, from everybody in the corn.',act(){SFX.stinger&&setTimeout(()=>SFX.stinger(),400);},linger:.6},
      {hold:.8,emote:{mae:'!'}},
      {hold:.9,act(){radio=0;A.tone&&A.tone(900,.03,'square',.03);},face:{mae:'N'}},
      {hold:.6,face:{mae:'W',you:'E'}},
      {who:'mae',text:'One more. Without the radio.',expr:'neutral',act(){dance=1;}},
      {hold:2.8,emote:{mae:'♥'}}],
    done(){HM.hop=0;maeCome(6,true);done&&done();}});}
// ================================================================= 5. The porch light
function hsMaePorch(done){const D=ROOMS.store.out,dx=D.x,dz=D.z;MAEV.on=false;let lamp=1,dark=0,sigh=0;
  stage({show:true,room:null,hour:18.9,player:{x:dx-.45,z:dz-.1,dir:'S'},cast:{mae:{x:dx+.45,z:dz-.1,dir:'S'}},cam:{x:dx,z:dz+1.3},lead:700,
    light(L){if(lamp){glowAt(sx(dx+.62),sz(dz-1.15)-30,70,[255,214,140],.85);glowAt(sx(dx),sz(dz+.6)-6,120,[255,200,130],.45);}if(sigh>0){glowAt(sx(dx-7.5),sz(dz+6)-20,40,[240,220,200],sigh*.35);}},
    props:[{x:dx+.62,z:dz-1.15,draw(X,Y){hmPorchLamp(X,Y-28,lamp);hmSwitch(X-4,Y-14,lamp);}},
      {x:dx-7.5,z:dz+6,draw(X,Y){if(sigh<=.05)return;const a=sigh*.55,x=Math.round(X),y=Math.round(Y);ctx2.fillStyle=`rgba(210,218,232,${a})`;   // a pale woman standing in the corn, there and gone
        ctx2.fillRect(x-2,y-31,5,5);ctx2.fillRect(x-3,y-26,7,9);ctx2.fillRect(x-4,y-17,9,17);ctx2.fillStyle=`rgba(60,64,80,${a*.8})`;ctx2.fillRect(x-3,y-32,7,3);ctx2.fillRect(x-3,y-29,1,6);ctx2.fillRect(x+3,y-29,1,6);ctx2.fillStyle=`rgba(20,20,30,${a})`;ctx2.fillRect(x-1,y-29,1,1);ctx2.fillRect(x+1,y-29,1,1);}},
      {x:0,z:9e5,draw(){if(dark>0){ctx2.fillStyle=`rgba(4,6,14,${dark*.42})`;ctx2.fillRect(0,0,VW,VH);}}}],
    beats:[

      {hold:.8,act(){stgTitle('Caitlyn — The porch light');}},
      {hold:0,go:{mae:[[dx+.5,dz+.9]],you:[[dx-.5,dz+.9]]},face:{mae:'S',you:'S'},wait:'arrive'},
      {hold:.8,face:{mae:'N',you:'N'}},
      {who:'mae',text:'Two years that light’s burned. Since Mom walked into the corn.',expr:'sad'},
      {hold:0,go:{mae:[[dx+.45,dz-.05]]},face:{mae:'N'},wait:'arrive'},
      {hold:.6,pose:{mae:'thrust'}},
      {hold:1.4,act(){lamp=0;A.tone&&A.tone(700,.03,'square',.04);},update(dt){dark=Math.min(1,dark+dt*1.4);},pose:{mae:null}},
      {hold:2.6,act(){A.hiss&&A.hiss(1.8,.05,'lowpass',500);},update(dt,st){sigh=Math.sin(Math.min(1,st.bt/2.6)*Math.PI);},cam:{x:dx-3,z:dz+3}},
      {hold:.6,emote:{you:'!'}},
      {hold:0,go:{mae:[[dx-.05,dz+.95]]},face:{mae:'W',you:'E'},wait:'arrive',cam:{x:dx,z:dz+1.3}},
      {who:'mae',text:'I’m done waiting for people.',expr:'think'},
      {hold:.5,emote:{mae:'♥'}},
      {who:'mae',text:'Promise you won’t leave without me.',expr:'sad',linger:.6}],
    done(){maeCome(6,true);done&&done();}});}
// ---- they play instead of the captions
Object.assign(HS_SCENES,{'mae|The photo behind the counter':hsMaePhoto,'mae|The lots':hsMaeLots,'mae|Walt’s lantern':hsMaeLantern,'mae|After hours':hsMaeAfter,'mae|The porch light':hsMaePorch});
