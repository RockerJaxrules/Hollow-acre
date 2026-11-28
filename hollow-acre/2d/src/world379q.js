/* ================= #379q W6, door scares, stage C (story plan 6.3: "chapter 9, once, scripted. No knock. Scratching inside the wall. The
   cat hisses at the door and backs under the table. The window shows nothing. Open the door: it is there, crouched, filling the frame.
   A real chase in and around the cabin. Hide under the bed (where the floor is warm) or run for the lit barn, until the bell").
   Once, from the story's ninth chapter (today's last week), at night in the cabin, alone: scratching in the wall by the bed; then the
   window shows nothing, and the door opens on it, crouched in the doorway. It comes in after you. Get under the bed (the floor there is
   warm) and it searches the room and can't find you; or get out past it and run for the barn, where the light stops it at the edge.
   Far off the church bell rings, by hand, and it goes. If it reaches you, you black out and wake on the floor at first light (no wound,
   no blood). Fear through the Fear bar: +25 when the door opens ('chase'), by the second while it hunts you, 'caught' if it gets you.
   STORY can start it with W79P.stageC(). ================= */
const W79Q={};
// the thing itself, crouched, drawn by hand in code: a long dark coat, the carved head hung forward, embers for eyes, long arms to the
// floor with straw at the cuffs; two steps of its creeping walk
function w79qArt(f){const W=40,H=52,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};
  const K=['#050406','#0e0c12','#1a1720','#26222e','#34303e'],F=['#2a1608','#502c10','#784216','#8e5420'],E=['#c84a10','#ffb050'],b=f?1:0;
  for(let x=6;x<34;x++)P(x,49,1,2,'rgba(50,33,37,.55)');
  // the coat: the back humped up high behind the head, the skirts down to the floor round its bent knees
  for(let y=8+b;y<49;y++)for(let x=2;x<38;x++){const hump=((x-20)/15.5)**2+((y-21-b)/12.5)**2<1,skirt=y>=21&&Math.abs(x-20)<=12+(y-21)*.22;if(!hump&&!skirt)continue;
    const up=!((((x-20)/15.5)**2+((y-22-b)/12.5)**2<1)||(y>=22&&Math.abs(x-20)<=12+(y-22)*.22)),edge=!(((((x-21)/15.5)**2+((y-21-b)/12.5)**2<1)||(y>=21&&Math.abs(x-19)<=12+(y-21)*.22)));
    P(x,y,1,1,up?K[4]:edge?K[0]:x<14?K[3]:x>27?K[1]:K[2]);}
  for(const [fx,y0] of [[12,30],[17,34],[24,33],[29,29]])for(let y=y0;y<48;y++)P(fx+((y>>3)%2),y,1,1,K[1]);   /* its folds */
  for(let x=9;x<32;x+=2)P(x+(x%4?0:1),47+(x%3?1:0),1,2,K[0]);   /* the ragged hem */
  // the long arms, hung from the hump to the floor in front of it, the straw at the cuffs splayed like fingers
  for(const [ax,s] of [[5,-1],[33,1]]){const o=(s<0)===!!f?1:0;for(let y=16;y<46;y++){const x=ax+Math.round((y-16)*.03*s)+(y>38?o*s:0);P(x,y,3,1,K[1]);P(x+(s<0?0:2),y,1,1,K[3]);}
    for(let i=0;i<5;i++){const x=ax-1+i+(o*s);P(x,46+(i%2),1,3+(i%3===1?1:0),i%2?'#c8a050':'#8a6a28');}}
  // the carved head, hung forward and low between the shoulders
  for(let y=17;y<34;y++)for(let x=11;x<30;x++){const e=((x-20)/8.6)**2+((y-25.5)/7.8)**2;if(e<1)P(x,y,1,1,e>.78?F[0]:e>.45?F[1]:(x<18&&y<24)?F[3]:F[2]);}
  P(13,22,5,3,E[0]);P(14,22,3,1,E[1]);P(22,22,5,3,E[0]);P(23,22,3,1,E[1]);   /* the ember eyes */
  P(13,28,15,1,'#1e0804');for(let x=13;x<28;x+=2)P(x,29,1,2,'#d8ccb0');P(14,31,13,1,'#1e0804');   /* the cut grin and its teeth */
  P(19,17,2,1,'#2a1a0a');P(20,16,1,1,'#3a2a12');   /* the stalk */
  for(let i=0;i<10;i++)P(11+i*2,33+(i%2),1,3,i%2?'#c8a050':'#9a7a34');   /* straw at the collar */
  return c;}
// the barn lantern on its hook by the barn door, lit (the night it comes, somebody has lit it): an iron arm, the hood, the glass, the flame
function w79qLantArt(){const c=document.createElement('canvas');c.width=12;c.height=18;const g=c.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};
  P(0,1,9,1,'#2a2420');P(0,0,1,3,'#3a322a');P(8,1,1,3,'#2a2420');   /* the iron arm off the jamb */
  P(6,4,5,1,'#1e1a16');P(5,5,7,2,'#3a3026');P(6,5,4,1,'#5a4a38');   /* the hood */
  for(let y=7;y<14;y++){P(5,y,1,1,'#2a2218');P(11,y,1,1,'#2a2218');P(6,y,5,1,y<9?'#ffd890':y<12?'#ffb050':'#e08a30');}   /* the glass, lit */
  P(8,9,1,3,'#fff4d0');P(7,10,3,1,'#ffe8b0');P(5,14,7,2,'#3a3026');P(6,14,5,1,'#5a4a38');
  return c;}
function w79qReg(){for(const f of [0,1]){const k='w79q_crouch'+f;if(SPR[k])continue;const c=w79qArt(f),src='w79q:c'+f;IMG[src]=c;SPR[k]={src,fw:c.width,fh:c.height,ax:20,ay:50,foot:[0,0,0,0]};}
  if(!SPR.w79q_lant){const c=w79qLantArt();IMG['w79q:l']=c;SPR.w79q_lant={src:'w79q:l',fw:c.width,fh:c.height,ax:0,ay:c.height+30,foot:[0,0,0,0]};}}
const W79Q_LX=16.78,W79Q_LZ=-9.02;   /* on the barn's front, just right of its door */
function w79qLamp(on){w79qReg();if(!W79Q.lamp)W79Q.lamp=obj('w79q_lant',W79Q_LX,W79Q_LZ,{kind:'prop',noCol:true});W79Q.lamp.hide=!on;}
// its light: a warm pool on the yard in front of the barn door, in the night's light map (drawn with the other lights each frame)
{const _g=glowObjs;glowObjs=function(){const r=_g.apply(this,arguments);try{const o=W79Q.o;if(o&&!o.hide&&(o.room||null)===(S.room||null)){const X=sx(o.x)+(o.flip?1:-1)*0,Y=sz(o.z)-27,fl=.85+.15*Math.sin(performance.now()/130);for(const d of [-4.5,4.5])glowAt(X+d,Y,7,[255,120,40],.85*fl);}   /* its ember eyes, in the dark */
  if(W79Q.lamp&&!W79Q.lamp.hide&&!S.room){const X=sx(W79Q_LX)+8,Y=sz(W79Q_LZ)-38,fl=.94+.06*Math.sin(performance.now()/90);
  glowAt(X,Y,44,[255,176,90],.55*fl);glowAt(X,Y,10,[255,236,190],.9*fl);if(NIGHT.dk>0)nightPool(lctx,sx(16.2),sz(-8.3),3.8*PPM,.95*NIGHT.dk*fl,NIGHT_LCOL);}}catch(e){}return r;};}
// it, filling the doorway, for a moment, when the door opens
function w79qDoorFlash(){const v=document.getElementById('view');if(!v)return;w79qReg();const c=document.createElement('canvas');c.width=VW;c.height=VH;
  c.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated;image-rendering:crisp-edges';v.insertAdjacentElement('afterend',c);
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#020203';g.fillRect(0,0,VW,VH);const im=IMG['w79q:c0'];const k=Math.max(2,Math.floor(VH*.8/im.height)),w=im.width*k,h=im.height*k,x=Math.round(VW/2-w/2),y=Math.round(VH*.9-h);
  g.fillStyle='#3a2616';g.fillRect(x-k*6,y-k*4,w+k*12,h+k*4);g.fillStyle='#0a0a10';g.fillRect(x-k*3,y-k*2,w+k*6,h+k*2);g.drawImage(im,x,y,w,h);g.fillStyle='#5a3c24';g.fillRect(x-k*6,y-k*4,k*3,h+k*4);g.fillRect(x+w+k*3,y-k*4,k*3,h+k*4);
  SFX.stinger&&SFX.stinger();setTimeout(()=>c.remove(),750);}
function w79qOk(){try{if(typeof mpOn==='function'&&mpOn())return false;S.w79p=S.w79p||{};return !S.w79p.c&&(typeof wk79Ch==='function'?wk79Ch():1)>=9&&S.room==='cabin'&&(S.hour>=21||S.hour<1.5)&&S.mode==='play'&&!S.paused;}catch(e){return false;}}
W79P.stageC=function(){if(W79Q.on||S.room!=='cabin')return false;S.w79p=S.w79p||{};S.w79p.c=S.day;S.w79p.a=S.day;W79Q.on={ph:'scratch',t:0};
  toast('Something is scratching inside the wall, by the bed. Slowly, and then not slowly.',4,true);return true;};
// the chaser and its walk: in the room, and outside after you if you get past it
function w79qChaser(){w79qReg();if(!W79Q.o){W79Q.o=obj('w79q_crouch0',0,0,{kind:'prop',noCol:true,room:'cabin'});}W79Q.o.hide=false;return W79Q.o;}
function w79qEnd(msg){const o=W79Q.o;if(o)o.hide=true;if(W79Q.lamp)W79Q.lamp.hide=true;W79Q.on=null;if(W79H.hid&&W79H.hid.w79q)W79H.unhide();if(msg)toast(msg,4.6,true);}
const W79Q_BED={room:'cabin',label:'',text:'You get under the bed. The floor there is warm, as if somebody had been lying on it.',view:'bed',w79q:1};
// the view from under the bed: the slats over you, the bed's side rail, and under it a strip of the firelit floor, where its coat's hem and
// the straw at its cuffs go by, one way and then back, searching
{const _d=w79hDraw;w79hDraw=function(){if(!(W79H.hid&&W79H.hid.w79q))return _d.apply(this,arguments);
  const c=w79hLayer();if(!c)return;if(c.width!==VW||c.height!==VH){c.width=VW;c.height=VH;}const g=c.getContext('2d'),t=performance.now()/1000;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
  const fy=Math.round(VH*.66),fh=Math.round(VH*.22);
  if(!W79Q.bg||W79Q.bg.width!==VW||W79Q.bg.height!==VH){const B=document.createElement('canvas');B.width=VW;B.height=VH;const q=B.getContext('2d');const Q=(x,y,w,h,col)=>{q.fillStyle=col;q.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
    Q(0,0,VW,VH,'#040202');const sl=Math.round(VH*.075);
    for(let i=0;i<5;i++){const y=Math.round(VH*.06)+i*Math.round(VH*.105);Q(0,y,VW,sl,'#160d08');Q(0,y,VW,1,'#22150c');Q(0,y+sl-1,VW,1,'#0a0604');for(let x=(i*37)%53;x<VW;x+=53)Q(x,y+2,1,sl-4,'#0e0805');}   /* the slats */
    Q(0,fy-Math.round(VH*.05),VW,Math.round(VH*.05),'#1e130b');Q(0,fy-1,VW,1,'#2c1c10');   /* the side rail */
    for(let y=0;y<fh;y++){const k=y/fh;for(let x=0;x<VW;x+=4){const e=1-Math.abs(x/VW-.62)*1.5;const a=Math.max(0,e)*(.35+.65*k);Q(x,fy+y,4,1,`rgb(${(20+a*90)|0},${(11+a*44)|0},${(6+a*16)|0})`);}}   /* the floor in the stove's light */
    for(let y=fy+6;y<fy+fh;y+=Math.round(VH*.045))Q(0,y,VW,1,'rgba(0,0,0,.35)');Q(0,fy+fh,VW,VH-fy-fh,'#030202');W79Q.bg=B;}
  g.drawImage(W79Q.bg,0,0);R(0,fy,VW,fh,`rgba(255,150,70,${(.035+.03*Math.sin(t*7)).toFixed(3)})`);   /* the stove's light, moving */
  const o=W79Q.o,b=OBJ.find(x=>x.room==='cabin'&&!x.hide&&/^in_bed/.test(x.spr));
  if(o&&!o.hide&&o.room==='cabin'&&b){const X=VW*.5+(o.x-b.x)*VW*.3,w=VW*.2,near=Math.max(0,1-Math.abs(o.z-b.z-.9)*.8);const y0=fy-2,y1=fy+fh*(.62+.3*near);
    R(X-w/2,y0,w,y1-y0,'#050406');for(let x=X-w/2;x<X+w/2;x+=3)R(x,y1,2,2+((x|0)%7)%3,'#050406');   /* its hem */
    for(const sd of [-1,1]){const hx=X+sd*(w/2+VW*.03);R(hx-VW*.015,y0,VW*.03,y1-y0-4,'#0e0c12');for(let i=0;i<6;i++)R(hx-VW*.02+i*VW*.008,y1-3+(i%2)*2,1,6+(i%3),i%2?'#c8a050':'#8a6a28');}}   /* its arms to the floor, the straw at the cuffs */
};}
interact.push({get x(){const b=OBJ.find(o=>o.room==='cabin'&&!o.hide&&/^in_bed/.test(o.spr));return b?b.x:0;},get z(){const b=OBJ.find(o=>o.room==='cabin'&&!o.hide&&/^in_bed/.test(o.spr));return b?b.z+.5:0;},r:1.2,
  on:()=>!!W79Q.on&&W79Q.on.ph==='chase'&&S.room==='cabin'&&!W79H.hid,label:()=>'Get under the bed',ok:()=>true,act(){W79H.hide(W79Q_BED);}});
interact.push({get x(){return ROOMS.cabin?ROOMS.cabin.ox+Math.max(.8,ROOMS.cabin.door-1.6):0;},get z(){return ROOMS.cabin?ROOMS.cabin.oz+ROOMS.cabin.d-.45:0;},r:1,
  on:()=>!!W79Q.on&&W79Q.on.ph==='wait'&&S.room==='cabin'&&!W79Q.on.looked,label:()=>'Look through the window',ok:()=>true,act(){W79Q.on.looked=true;toast('Nothing at the window. Nothing at all. That is worse.',3.4);}});
interact.push({get x(){return ROOMS.cabin?ROOMS.cabin.ox+ROOMS.cabin.door:0;},get z(){return ROOMS.cabin?ROOMS.cabin.oz+ROOMS.cabin.d-.45:0;},r:.95,
  on:()=>!!W79Q.on&&W79Q.on.ph==='wait'&&S.room==='cabin',label:()=>'Open the door',ok:()=>true,act(){w79qChase();}});
function w79qChase(){const R=ROOMS.cabin,q=W79Q.on;if(!q)return;q.ph='chase';q.t=0;q.g=9;w79qDoorFlash();w79qLamp(true);w79Fear(25,'chase');
  if(S.room==='cabin'&&P.z>R.oz+R.d-1.9){P.z=R.oz+R.d-1.9;P.x+=P.x<R.ox+R.door?-.5:.5;}   /* you stumble back from it */
  setTimeout(()=>{const o=w79qChaser();o.room='cabin';o.x=R.ox+R.door;o.z=R.oz+R.d-.35;q.g=q.t+1.6;toast('It is there, crouched in the doorway, filling it. Then it comes in.',3.2,true);},800);}
{const _u=update;update=function(dt){_u(dt);try{const q=W79Q.on;if(!q)return;if(S.hour>=5&&S.hour<20){w79qEnd();return;}q.t+=dt;if(S.hour>25.7)S.hour=25.7;   /* the clock waits for the bell */
  if(q.ph==='scratch'){if(Math.floor(q.t*2.2)!==Math.floor((q.t-dt)*2.2))SFX.thud&&SFX.thud(0,.06);if(q.t>7){q.ph='wait';q.t=0;toast('The cat hisses at the door and backs away under the table, flat to the boards.',3.6,true);}if(S.room!=='cabin')w79qEnd();return;}
  if(q.ph==='wait'){if(q.t>40||S.room!=='cabin')w79qChase();return;}
  if(typeof H!=='undefined'){H.vis=false;H.state='gone';H.timer=Math.max(H.timer||0,4);}   /* the scarecrow keeps away tonight: this is the other one */
  if(q.ph!=='chase'||S.mode!=='play')return;const o=W79Q.o;if(!o)return;
  const inside=S.room==='cabin',R=ROOMS.cabin;w79Rate('chase',2.5,!W79H.hid);
  if(!inside&&!S.room&&o.room==='cabin'&&!q.app){o.hide=true;q.app={t:q.t+1.5,room:null,x:doorPos.x,z:doorPos.z+.6,say:'Behind you the cabin door bangs open, and it comes out after you. Across the yard the barn lantern is lit. You did not light it.'};}   /* out past it: it comes out after you */
  if(inside&&o.room!=='cabin'&&!q.app){o.hide=true;q.app={t:q.t+1.3,room:'cabin',x:R.ox+R.door,z:R.oz+R.d-.35};}
  if(q.app){if(q.t<q.app.t)return;const a=q.app;q.app=null;if((a.room==='cabin')!==inside)return;o.room=a.room;o.x=a.x;o.z=a.z;o.hide=false;q.g=q.t+.9;if(a.say)toast(a.say,3,true);}
  if(o.hide)return;
  let tx=P.x,tz=P.z,v=inside?1.5:2.1;
  if(W79H.hid){const b=OBJ.find(x=>x.room==='cabin'&&!x.hide&&/^in_bed/.test(x.spr));tx=b?b.x+Math.sin(q.t*.6)*1.2:o.x;tz=b?b.z+.9:o.z;v=.5;}   /* it searches round the bed, and can't find you */
  const barn=!inside&&Math.hypot(P.x-16,P.z+8.6)<3.6;if(barn){const dx=o.x-16,dz=o.z+8.6,d=Math.hypot(dx,dz)||1;tx=16+dx/d*4.8;tz=-8.6+dz/d*4.8;if(!q.barnSaid){q.barnSaid=1;toast('In the barn’s light it stops at the edge, and will not come in. It waits there.',3.6,true);}}
  const dx=tx-o.x,dz=tz-o.z,L=Math.hypot(dx,dz);if(L>.03){const st=Math.min(L,v*dt);o.x+=dx/L*st;o.z+=dz/L*st;if(Math.abs(dx)>.05)o.flip=dx<0;}o.spr='w79q_crouch'+(Math.floor(q.t*3)%2);
  if(!W79H.hid&&!barn&&q.t>q.g&&Math.hypot(P.x-o.x,P.z-o.z)<.55&&(inside===(o.room==='cabin'))){w79Fear(10,'caught');SFX.stinger&&SFX.stinger();w79qEnd();S.mode='trans';fade(1);
    setTimeout(()=>{try{newDay('Day '+(S.day+1)+'. You wake on the floor at first light. Your nails are full of splinters, and you do not remember why.');}catch(e){S.mode='play';fade(0);}},900);return;}
  if(q.t>55){SFX.bell&&SFX.bell();w79qEnd('Far off, the church bell, rung by hand. It turns its head toward the sound, and then it is gone, and the night is only the night.');}}catch(e){}};}
// once, at night in the cabin, from the ninth chapter on
setInterval(()=>{try{if(W79Q.on||!w79qOk())return;W79Q.wait=(W79Q.wait||0)+1;if(W79Q.wait>=30&&rand()<.06){W79Q.wait=0;W79P.stageC();}}catch(e){}},1000);
