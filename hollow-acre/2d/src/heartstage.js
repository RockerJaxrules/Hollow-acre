/* ================= #216 heart events get the staged cutscenes' physicality. Each iconic heart scene now plays in the place
   it is about, with the thing it describes actually happening in the world: Agnes winds the music box and a child stands at the
   well and points down into it; Silas digs an open grave your size in the rain and puts the shovel in your hands; Otto's weighted
   line goes down and down and something tugs it three times; the countdown on Cora's board is counting to your birthday; June's
   street has a figure with its back to every lit window, and the last window is yours, facing out. Built on stage() (stage.js).
   Everything not hand-staged still plays through stgGeneric (the person walks to you in the world). ================= */

// ---------- a kit of props drawn straight into the world (screen space) ----------
function hsRain(t,heavy){   // the engine only draws storm-rain at night; a daytime grave scene draws its own, with a cold wash + vignette
  ctx2.fillStyle='rgba(28,40,58,.34)';ctx2.fillRect(0,0,VW,VH);                                          // the storm greys the whole scene
  const n=heavy?160:95;ctx2.strokeStyle=heavy?'rgba(188,206,232,.5)':'rgba(172,192,222,.32)';ctx2.lineWidth=1;ctx2.beginPath();
  for(let i=0;i<n;i++){const x=(hash(i,1)*VW+t*74)%VW,y=(hash(i,3)*VH+t*780)%VH;ctx2.moveTo(x,y);ctx2.lineTo(x-3,y+9);}ctx2.stroke();
  const g=ctx2.createRadialGradient(VW/2,VH*.4,VH*.16,VW/2,VH*.52,VH*.82);g.addColorStop(0,'rgba(8,10,14,0)');g.addColorStop(1,'rgba(5,8,12,.6)');ctx2.fillStyle=g;ctx2.fillRect(0,0,VW,VH);}
function hsVignette(a){const g=ctx2.createRadialGradient(VW/2,VH*.46,VH*.16,VW/2,VH*.5,VH*.8);g.addColorStop(0,'rgba(4,4,8,0)');g.addColorStop(1,`rgba(3,3,7,${a})`);ctx2.fillStyle=g;ctx2.fillRect(0,0,VW,VH);}
function hsWell(X,Y){   // a round stone well: a dark mouth, a low ring of stones, two posts and a shingle roof
  const o='#120c08',st=['#6b6256','#847b6b','#565049','#756c5e'];
  ctx2.fillStyle='#070506';ctx2.beginPath();ctx2.ellipse(X,Y-5,11,6,0,0,6.283);ctx2.fill();                 // the black mouth
  for(let a=0;a<6.283;a+=.42){const rx=X+Math.cos(a)*13,ry=Y-5+Math.sin(a)*7;ctx2.fillStyle=o;ctx2.fillRect(Math.round(rx)-3,Math.round(ry)-3,6,6);ctx2.fillStyle=st[(a*3|0)%4];ctx2.fillRect(Math.round(rx)-2,Math.round(ry)-2,4,4);}
  ctx2.fillStyle=o;ctx2.fillRect(X-13,Y-36,4,31);ctx2.fillRect(X+9,Y-36,4,31);ctx2.fillStyle='#4a3626';ctx2.fillRect(X-12,Y-35,2,30);ctx2.fillRect(X+10,Y-35,2,30);
  ctx2.fillStyle=o;ctx2.fillRect(X-19,Y-43,38,8);ctx2.fillStyle='#53351f';ctx2.fillRect(X-18,Y-42,36,6);ctx2.fillStyle='#6a452a';ctx2.fillRect(X-18,Y-42,36,2);for(let i=-16;i<18;i+=4){ctx2.fillStyle='#3c2817';ctx2.fillRect(X+i,Y-42,1,6);}}
function hsChild(X,Y,a,point){   // a small figure in a pale dress, no face; point 0..1 raises one arm toward the ground
  if(a<=0)return;ctx2.save();ctx2.globalAlpha=Math.min(1,a);
  const dr='#dcd8cc',sh='#9c988c',sk='#c4b49c',hair='#4e3c2c';
  ctx2.fillStyle=sh;ctx2.fillRect(X-6,Y-13,12,11);ctx2.fillStyle=dr;ctx2.fillRect(X-5,Y-13,9,10);ctx2.fillRect(X-6,Y-3,12,2);
  ctx2.fillStyle='#8a8578';ctx2.fillRect(X-3,Y-1,2,3);ctx2.fillRect(X+1,Y-1,2,3);
  ctx2.fillStyle=hair;ctx2.fillRect(X-4,Y-22,8,9);ctx2.fillStyle=sk;ctx2.fillRect(X-3,Y-20,6,6);ctx2.fillStyle=hair;ctx2.fillRect(X-4,Y-22,8,3);ctx2.fillRect(X-4,Y-20,2,7);ctx2.fillRect(X+2,Y-20,2,7);
  if(point>0){const ex=X+7,ey=Y-8+Math.round(point*9);ctx2.strokeStyle='#120c08';ctx2.lineWidth=3;ctx2.beginPath();ctx2.moveTo(X+4,Y-12);ctx2.lineTo(ex,ey);ctx2.stroke();   // dark outline so the arm reads against the dress
    ctx2.strokeStyle=sk;ctx2.lineWidth=2;ctx2.beginPath();ctx2.moveTo(X+4,Y-12);ctx2.lineTo(ex,ey);ctx2.stroke();ctx2.fillStyle=sk;ctx2.fillRect(ex-1,ey-1,3,3);
    if(point>.6){ctx2.fillStyle='rgba(216,228,232,.5)';for(let i=0;i<3;i++)ctx2.fillRect(ex-1,ey+3+i*4,2,2);}}   // a faint line of light dripping down into the well
  ctx2.restore();}
function hsMusicBox(X,Y,open){   // a little wooden box on the rail; lid open shows a turning brass cylinder
  const o='#120c08';ctx2.fillStyle=o;ctx2.fillRect(X-7,Y-5,15,6);ctx2.fillStyle='#6a3f22';ctx2.fillRect(X-6,Y-4,13,4);ctx2.fillStyle='#8a5a30';ctx2.fillRect(X-6,Y-4,13,1);ctx2.fillStyle='#4a2c18';ctx2.fillRect(X-6,Y-1,13,1);
  if(open){ctx2.fillStyle=o;ctx2.fillRect(X-7,Y-12,15,4);ctx2.fillStyle='#7a4a28';ctx2.fillRect(X-6,Y-11,13,2);ctx2.fillStyle='#caa24a';ctx2.fillRect(X-5,Y-5,11,1);ctx2.fillStyle='#e6c968';ctx2.fillRect(X-4+((Date.now()/90|0)%10),Y-5,1,1);}}
function hsGrave(X,Y,dug){   // an open grave: a dark rectangular pit, a heaped mound of wet earth to one side
  const w=26,h=Math.round(6+dug*8);
  ctx2.fillStyle='#2a1d12';ctx2.fillRect(X-w/2-2,Y-2,w+4,h+5);                       // the cut earth wall
  ctx2.fillStyle='#0a0705';ctx2.fillRect(X-w/2,Y,w,h);                               // the pit, black
  ctx2.fillStyle='#07100b';ctx2.fillRect(X-w/2+2,Y+2,w-4,h-3);
  for(const [mx,my,mw] of [[X+w/2+6,Y+2,12],[X+w/2+9,Y-2,8]]){ctx2.fillStyle='#3a2816';ctx2.beginPath();ctx2.ellipse(mx,my+4,mw,5,0,0,6.283);ctx2.fill();ctx2.fillStyle='#4a3420';ctx2.beginPath();ctx2.ellipse(mx,my+2,mw-2,4,0,0,6.283);ctx2.fill();ctx2.fillStyle='#593f26';ctx2.fillRect(mx-mw+2,my,2,2);ctx2.fillRect(mx+1,my-1,2,2);}}
function hsShovel(X,Y,ang){const o='#120c08';ctx2.save();ctx2.translate(X,Y);ctx2.rotate(ang);ctx2.fillStyle='#5a4028';ctx2.fillRect(-1,-16,2,16);ctx2.fillStyle='#7a5a38';ctx2.fillRect(-1,-16,1,16);
  ctx2.fillStyle=o;ctx2.fillRect(-4,0,8,8);ctx2.fillStyle='#8e949c';ctx2.fillRect(-3,1,6,6);ctx2.fillStyle='#b4bac2';ctx2.fillRect(-3,1,6,2);ctx2.restore();}
function hsRowboat(X,Y,t){   // a clinker rowboat seen three-quarter on dark water, with the two of you sat in it
  const o='#0c0908',hull='#5a3c22',hi='#2e1d10',rim='#7c5230';
  ctx2.fillStyle='rgba(6,10,12,.5)';ctx2.beginPath();ctx2.ellipse(X,Y+10,34,8,0,0,6.283);ctx2.fill();                 // the boat's shadow on the water
  ctx2.fillStyle=o;ctx2.beginPath();ctx2.ellipse(X,Y+2,32,12,0,0,6.283);ctx2.fill();
  ctx2.fillStyle=hull;ctx2.beginPath();ctx2.ellipse(X,Y,30,10,0,0,6.283);ctx2.fill();
  ctx2.fillStyle=hi;ctx2.beginPath();ctx2.ellipse(X,Y-1,24,6,0,0,6.283);ctx2.fill();
  ctx2.fillStyle=rim;for(let i=-28;i<=28;i+=5)ctx2.fillRect(X+i,Y-7+Math.round(Math.abs(i)*.14),3,2);
  ctx2.fillStyle='#3a2616';ctx2.fillRect(X-16,Y-3,32,2);ctx2.fillRect(X-4,Y-4,2,4);                                   // a thwart
  // two seated figures: you nearer, Otto at the far oars
  const fig=(fx,fy,coat,skin,cap)=>{ctx2.fillStyle=o;ctx2.fillRect(fx-5,fy-14,11,14);ctx2.fillStyle=coat;ctx2.fillRect(fx-4,fy-13,9,12);ctx2.fillStyle=skin;ctx2.fillRect(fx-3,fy-19,6,6);ctx2.fillStyle=o;ctx2.fillRect(fx-3,fy-19,6,2);if(cap){ctx2.fillStyle=cap;ctx2.fillRect(fx-4,fy-21,8,3);}};
  fig(X+9,Y-2,'#3a4a5a','#c6a886',null);              // you
  fig(X-10,Y-3,'#45321f','#b89a78','#2a1d12');         // Otto, in his cap
  ctx2.strokeStyle='#3a2616';ctx2.lineWidth=2;const oa=Math.sin(t*1.2)*.3;ctx2.beginPath();ctx2.moveTo(X-12,Y-4);ctx2.lineTo(X-30,Y-2+oa*14);ctx2.moveTo(X-8,Y-4);ctx2.lineTo(X+10,Y-16);ctx2.stroke();}
function hsLine(X,Y,run,tug){   // a taut line from the boat straight down into black water; tug jolts it
  const jx=tug>0?Math.round(Math.sin(tug*40)*2):0;ctx2.strokeStyle='rgba(220,220,210,.75)';ctx2.lineWidth=1;ctx2.beginPath();ctx2.moveTo(X,Y);ctx2.lineTo(X+jx,Y+run);ctx2.stroke();
  ctx2.fillStyle='#d8d4c6';ctx2.fillRect(X-2,Y-2,4,3);                                                                // the reel knot at the gunwale
  for(let i=0;i<4;i++){ctx2.strokeStyle=`rgba(90,120,120,${.3-i*.06})`;ctx2.beginPath();ctx2.ellipse(X+jx,Y+run,4+i*5,2+i*2,0,0,6.283);ctx2.stroke();}}  // ripples where it enters
function hsFacade(X,Y,w){   // just the tall dark house front that hides the world behind it; the lit window is drawn in the light pass
  const o='#07060a',H=132;ctx2.fillStyle=o;ctx2.fillRect(X-w/2,Y-H,w,H+4);ctx2.fillStyle='#13101a';ctx2.fillRect(X-w/2+3,Y-H+3,w-6,H);
  for(let i=1;i<4;i++){ctx2.fillStyle='rgba(6,5,9,.6)';ctx2.fillRect(X-w/2+3,Y-H+3+i*Math.round(H/4),w-6,2);}
  ctx2.fillStyle=o;ctx2.fillRect(X-w/2-7,Y-H-14,w+14,18);ctx2.fillStyle='#1a1622';ctx2.fillRect(X-w/2-5,Y-H-12,w+10,13);}   // the eave/roof
function hsLitWin(X,Y,eyes){   // a bright, warm lit window with a dark figure; drawn in the light pass so it glows over the night
  ctx2.save();ctx2.globalCompositeOperation='source-over';ctx2.globalAlpha=1;
  const ww=30,wh=36,wx=X-ww/2,wy=Y-96;ctx2.fillStyle='#060507';ctx2.fillRect(wx-4,wy-4,ww+8,wh+8);
  ctx2.fillStyle='#e7b85c';ctx2.fillRect(wx,wy,ww,wh);ctx2.fillStyle='#f7d98a';ctx2.fillRect(wx+1,wy+1,ww-2,wh-2);ctx2.fillStyle='#ffeeb4';ctx2.fillRect(wx+2,wy+2,ww-4,7);
  const fx=X,fb=wy+wh;ctx2.fillStyle='#0a0709';ctx2.fillRect(fx-10,fb-27,20,27);ctx2.fillStyle='#0f0b0d';ctx2.fillRect(fx-9,fb-26,18,26);
  ctx2.fillStyle='#0a0709';ctx2.fillRect(fx-7,fb-36,14,12);ctx2.fillStyle='#120d10';ctx2.fillRect(fx-6,fb-35,12,11);           // head + shoulders
  if(eyes){ctx2.fillStyle='#070405';ctx2.fillRect(fx-6,fb-36,14,3);ctx2.fillStyle='#e8f0f2';ctx2.fillRect(fx-4,fb-31,3,2);ctx2.fillRect(fx+2,fb-31,3,2);}   // facing out: two pale eyes
  ctx2.fillStyle='#060507';ctx2.fillRect(wx+ww/2-1,wy,2,wh);ctx2.fillRect(wx,wy+wh/2-1,ww,2);ctx2.restore();}                   // mullions
function hsTallFig(X,Y,h,k){   // a too-tall dark figure in a window; k=0 a plain man, k=1 the carved-pumpkin Hollow
  ctx2.fillStyle='rgba(8,6,6,.96)';ctx2.fillRect(X-6,Y-h,12,h);ctx2.fillStyle='#120b0a';ctx2.fillRect(X-5,Y-h,10,h);
  if(k){ctx2.fillStyle='#3a1b12';ctx2.fillRect(X-6,Y-h-9,12,11);ctx2.fillStyle='#5a2a16';ctx2.fillRect(X-5,Y-h-8,10,9);   // the rotting pumpkin head
    ctx2.fillStyle='#1a0d08';ctx2.fillRect(X-3,Y-h-5,2,2);ctx2.fillRect(X+1,Y-h-5,2,2);ctx2.fillRect(X-1,Y-h-2,2,2);}
  else{ctx2.fillStyle='#0a0606';ctx2.fillRect(X-4,Y-h-7,8,8);}}
function hsLoom(X,Y,h,k){   // the Tall Man looming behind you: a smear of dark, almost a man, no light on it
  ctx2.fillStyle='rgba(4,3,5,.5)';ctx2.fillRect(X-12,Y-h-6,24,h+6);                                // its shadow bleeding out
  ctx2.fillStyle='rgba(6,5,8,.96)';ctx2.fillRect(X-7,Y-h,14,h);ctx2.fillStyle='#0d0a10';ctx2.fillRect(X-6,Y-h,12,h);
  ctx2.fillStyle='#070509';ctx2.fillRect(X-5,Y-h-13,10,15);                                        // a long head
  if(k){ctx2.fillStyle='#14212a';ctx2.fillRect(X-3,Y-h-9,2,2);ctx2.fillRect(X+1,Y-h-9,2,2);}}      // when it is close, two cold eyes
function hsEnvelope(X,Y){ctx2.fillStyle='#0f0a07';ctx2.fillRect(X-9,Y-6,19,12);ctx2.fillStyle='#e6dabd';ctx2.fillRect(X-8,Y-5,17,10);
  ctx2.fillStyle='#ccbc96';for(let i=0;i<=8;i++){ctx2.fillRect(X-8+i,Y-5+Math.round(i*.55),1,1);ctx2.fillRect(X+8-i,Y-5+Math.round(i*.55),1,1);}   // the flap crease
  ctx2.fillStyle='#8a2a22';ctx2.fillRect(X-1,Y-1,3,3);}
function hsLetter(X,Y,k){const w=30,h=40;ctx2.fillStyle='#0f0a07';ctx2.fillRect(X-w/2-1,Y-h-1,w+2,h+2);ctx2.fillStyle='#ece2cc';ctx2.fillRect(X-w/2,Y-h,w,h);ctx2.fillStyle='#ddd1b6';ctx2.fillRect(X-w/2,Y-h,w,2);
  ctx2.fillStyle='#9a8f74';ctx2.fillRect(X-w/2+4,Y-h+5,w-14,2);                                     // a child's heading
  ctx2.fillStyle='#5a5240';const n=Math.floor(k*10);for(let i=0;i<n;i++){const ww=[w-8,w-12,w-7,w-16,w-9][i%5];ctx2.fillRect(X-w/2+4,Y-h+12+i*3,ww,1);}}
function hsFog(X,Y,w,t){for(let i=0;i<5;i++){ctx2.fillStyle=`rgba(202,208,216,${.16-i*.025})`;ctx2.fillRect(X-w/2,Y-8-i*7,w,9);}
  for(let i=0;i<7;i++){const px=X-w/2+((i*97+t*16)%(w+40))-20,py=Y-6-(i%3)*10;ctx2.fillStyle='rgba(212,218,226,.12)';ctx2.beginPath();ctx2.ellipse(px,py,18,6,0,0,6.283);ctx2.fill();}}
function hsWaterBand(X,Y,w,h,t){ctx2.fillStyle='#0a1418';ctx2.fillRect(X-w/2,Y,w,h);ctx2.fillStyle='#0d1b20';ctx2.fillRect(X-w/2,Y,w,Math.round(h*.5));
  for(let i=0;i<w;i+=18){const yy=Y+6+((i*7+t*30|0)%(h-8));ctx2.fillStyle='rgba(120,150,160,.18)';ctx2.fillRect(X-w/2+i+(t*10|0)%12,yy,8,1);}}
function hsFarShore(X,Y,t,wave){   // a thin far bank across the black lake: a steeple, lit windows, one porch with a figure waving
  ctx2.fillStyle='#070c0f';ctx2.fillRect(X-220,Y-8,440,12);ctx2.fillStyle='#0b1216';ctx2.fillRect(X-220,Y-13,440,6);
  for(const dx of [-150,-120,-78,-30,36,96,150]){ctx2.fillStyle='#0d141a';ctx2.fillRect(X+dx-8,Y-20,16,12);ctx2.fillStyle='#0a0f14';ctx2.fillRect(X+dx-10,Y-24,20,5);ctx2.fillStyle='#f0c25e';ctx2.fillRect(X+dx-2,Y-17,4,5);}   // cottages, lit
  ctx2.fillStyle='#0d141a';ctx2.fillRect(X-6,Y-30,12,22);ctx2.beginPath();ctx2.moveTo(X-6,Y-30);ctx2.lineTo(X,Y-40);ctx2.lineTo(X+6,Y-30);ctx2.fill();ctx2.fillStyle='#e8d090';ctx2.fillRect(X-2,Y-24,4,5);   // the steeple
  const px=X+78;ctx2.fillStyle='#0d141a';ctx2.fillRect(px-11,Y-22,22,14);ctx2.fillStyle='#ffdf9a';ctx2.fillRect(px-7,Y-18,6,7);ctx2.fillRect(px+2,Y-18,5,7);   // your farmhouse, every window lit
  ctx2.fillStyle='#0a0a0c';ctx2.fillRect(px-1,Y-9,2,6);const a=wave?Math.sin(t*3)*4:0;ctx2.fillStyle='#0a0a0c';ctx2.save();ctx2.translate(px,Y-8);ctx2.fillRect(-1,-1,2,2);ctx2.fillRect(2,-3+Math.round(a),2,4);ctx2.restore();}   // a small figure, waving
function hsLongTable(X,Y){const o='#120c08';ctx2.fillStyle=o;ctx2.fillRect(X-88,Y-6,176,16);ctx2.fillStyle='#5a3c22';ctx2.fillRect(X-86,Y-5,172,13);ctx2.fillStyle='#6e4a2a';ctx2.fillRect(X-86,Y-5,172,3);
  for(const lx of [-78,-20,20,78]){ctx2.fillStyle=o;ctx2.fillRect(X+lx-2,Y+8,5,10);ctx2.fillStyle='#4a3218';ctx2.fillRect(X+lx-1,Y+8,3,10);}
  for(let i=-80;i<84;i+=10){ctx2.fillStyle='rgba(20,14,8,.4)';ctx2.fillRect(X+i,Y-4,1,10);}}   // plank seams
function hsPlate(X,Y,eaten){ctx2.fillStyle='#120c08';ctx2.beginPath();ctx2.ellipse(X,Y,11,5,0,0,6.283);ctx2.fill();ctx2.fillStyle='#d8d2c4';ctx2.beginPath();ctx2.ellipse(X,Y,9,4,0,0,6.283);ctx2.fill();ctx2.fillStyle='#b4ad9c';ctx2.beginPath();ctx2.ellipse(X,Y,5,2,0,0,6.283);ctx2.fill();
  if(!eaten){ctx2.fillStyle='#6a3426';ctx2.beginPath();ctx2.ellipse(X,Y-1,4,2,0,0,6.283);ctx2.fill();ctx2.fillStyle='#813f2c';ctx2.fillRect(X-2,Y-2,4,2);}}   // the best cut, then gone
function hsCandle(X,Y,lean,lit){const lx=Math.round(lean*5);ctx2.fillStyle='#1a120c';ctx2.fillRect(X-2,Y-12,4,12);ctx2.fillStyle='#e8dcc0';ctx2.fillRect(X-2,Y-12,3,12);
  if(lit){ctx2.fillStyle='#ffd070';ctx2.fillRect(X-1+lx,Y-17,2,5);ctx2.fillStyle='#fff2c0';ctx2.fillRect(X+lx,Y-16,1,2);}}
function hsSkipStone(X,Y){ctx2.fillStyle='rgba(220,224,228,.9)';ctx2.fillRect(X-1,Y-1,3,2);ctx2.fillStyle='rgba(150,170,180,.5)';ctx2.fillRect(X-2,Y+2,5,1);}   // a stone mid-skip + its splash

// ---------- 1. Caitlyn — "Closing time": the store locked at noon, the keys, the man at the window ----------
function hsClosingTime(done){const R=ROOMS.store,ox=R.ox,oz=R.oz;MAEV.on=false;
  const cz=oz+2.66,counter=oz+4.1,you0={x:ox+14,z:oz+6.0},beside={x:ox+15.6,z:cz+.1};
  let sign=0,keys=0,fig=-1,figK=0;const CAM={x:ox+14,z:oz+4.5};
  stage({room:'store',hour:Math.min(Math.max(S.hour,11.5),13),player:{x:you0.x,z:you0.z,dir:'N'},cast:{mae:{x:ox+14,z:cz,dir:'S'}},cam:CAM,lead:700,
    light(L){glowAt(sx(ox+9),sz(oz+2.4)-40,120,[255,186,110],.30);if(fig>=0)glowAt(sx(ox+14),sz(oz+1.5)-24,66,[150,170,190],.2+.12*Math.sin(STG.t*3));},
    props:[{x:ox+14,z:oz+1.5,draw(X,Y,t){   // a window set in the wall behind the counter; the figure rises in it, becomes the Hollow, then is gone
        ctx2.fillStyle='#06060a';ctx2.fillRect(X-20,Y-46,40,42);
        ctx2.fillStyle=fig>=0?'#5c6672':'#161b24';ctx2.fillRect(X-17,Y-43,34,36);ctx2.fillStyle=fig>=0?'#6e7886':'#1e2630';ctx2.fillRect(X-17,Y-43,34,7);   // the pane: dusk sky, moonlit when it is there
        if(fig>=0)hsTallFig(X,Y-9,26+fig*11,figK);
        ctx2.fillStyle='#06060a';ctx2.fillRect(X-1,Y-43,2,36);ctx2.fillRect(X-17,Y-26,34,2);}},   // mullions over the figure
      {x:ox+14.9,z:counter-.02,draw(X,Y,t){   // a little OPEN / CLOSED placard on the counter edge
        ctx2.fillStyle='#120c08';ctx2.fillRect(X+6,Y-16,16,9);ctx2.fillStyle=sign?'#7a2420':'#2d5a30';ctx2.fillRect(X+7,Y-15,14,7);ctx2.fillStyle='#f0e4c8';ctx2.font='6px monospace';ctx2.textAlign='center';ctx2.fillText(sign?'CLOSED':'OPEN',X+14,Y-9);ctx2.textAlign='left';}},
      {get x(){return P.x;},get z(){return P.z+.01;},draw(X,Y){if(keys<=0)return;const yy=Y-26-Math.round(keys*4);ctx2.fillStyle='#caa24a';ctx2.fillRect(X-1,yy,2,5);ctx2.fillStyle='#e6c968';ctx2.fillRect(X-2,yy+4,5,3);ctx2.fillRect(X-3,yy+5,2,2);ctx2.fillRect(X+2,yy+5,2,2);}}],
    beats:[
      {hold:.9,face:{mae:'S',you:'N'},act(){stgTitle('Caitlyn — Closing time');}},
      {who:'mae',text:'Lock that behind you, would you. The bolt sticks.',expr:'neutral',act(){sign=1;SFX.thud&&SFX.thud(0,.25);}},
      {who:'mae',text:'Twenty years I’ve run this store. I have never once closed it at noon.',expr:'sad',wait:.3},
      {hold:.2,go:{you:[[ox+15.6,oz+5.4],[beside.x,beside.z]]},face:{you:'W',mae:'E'},wait:'arrive'},
      {who:'mae',text:'Come here. Behind the counter. Where he can’t see your hands.',expr:'scared'},
      {who:'mae',text:'These were my dad’s. The truck’s still in the shed, under a tarp, full of gas.',act(){keys=1;SFX.coin&&SFX.coin();stgEmote('you','!',1.4);},expr:'think'},
      {who:'mae',text:'Take Tobias. Not tonight — the night of the drawing, when they’re all in the church.',expr:'angry'},
      {who:'mae',text:'Nobody counts the children that night. Nobody ever has.',expr:'sad',wait:.4},
      {hold:1.6,act(){sign=0;fig=.55;figK=0;SFX.breath&&SFX.breath();},face:{mae:'N'},emote:{mae:'!'}},
      {who:'you',text:'There’s a man at the back window. He’s been there the whole time.',expr:'scared'},
      {hold:2.6,update(dt){fig=Math.min(1,fig+dt*.35);},act(){setTimeout(()=>{figK=1;SFX.stinger&&SFX.stinger();stgEmote('you','!',1.6);},1100);}},
      {hold:1.8,act(){fig=-1;figK=0;},face:{mae:'S'}},
      {who:'mae',text:'…It’s only the scarecrow. From your field.',expr:'wrong'},
      {who:'mae',text:'Which is two miles away. Go home before dark. Please.',expr:'sad',wait:.3},
    ],
    done(){maeCome(6,true);done&&done();}});}

// ---------- 2. Agnes — "The music box, played": the box on the rail, a child at the well, pointing down ----------
function hsMusicBoxScene(done){const px=-46,pz=-8.6;
  const agn={x:px,z:pz-.3},you={x:px+1.4,z:pz+1.1},well={x:px-3.6,z:pz+2.2},child={x:well.x,z:well.z-.7};
  let open=0,ca=0,pt=0,song=0;const CAM={x:px-1.1,z:pz+.4};
  stage({hour:Math.min(Math.max(S.hour,16),18),player:{x:you.x,z:you.z,dir:'W'},cast:{agnes:{x:agn.x,z:agn.z,dir:'S'}},cam:CAM,lead:700,
    light(L){if(ca>0)glowAt(sx(child.x)+5,sz(child.z)-18,54,[150,160,180],.14*ca);hsVignette(.22);},
    props:[{x:well.x,z:well.z,draw(X,Y){hsWell(X,Y);}},
      {x:child.x,z:child.z+.01,draw(X,Y,t){hsChild(X,Y,ca,pt);}},
      {get x(){return agn.x-.55;},get z(){return agn.z-.02;},draw(X,Y){if(open>0)hsMusicBox(X,Y-30,open>.4);}}],
    tick(dt){if(song>0){song-=dt;}},
    beats:[
      {hold:.9,face:{agnes:'S',you:'W'},act(){stgTitle('Agnes — The music box');}},
      {who:'agnes',text:'Ruth loved this. I wound it every night for a year after. Then I couldn’t.',expr:'sad'},
      {hold:1.6,update(dt){open=Math.min(1,open+dt*1.2);},act(){song=9;SFX.page&&SFX.page();},emote:{agnes:'♪'}},
      {who:'agnes',text:'I don’t look at the yard when it plays. You look. Tell me what you see.',expr:'think',face:{agnes:'E'}},
      {hold:1.8,update(dt){ca=Math.min(1,ca+dt*.7);},act(){SFX.breath&&SFX.breath();},face:{you:'W'},emote:{you:'!'}},
      {who:'you',text:'There’s a girl by the well. White dress. She’s looking right at me.',expr:'scared'},
      {hold:2.0,update(dt){pt=Math.min(1,pt+dt*1.1);},act(){stgEmote('agnes','…',2.2);}},
      {who:'you',text:'She’s lifting her arm. She’s… pointing. Down. Into the well.',expr:'scared'},
      {hold:2.2,update(dt){ca=Math.max(0,ca-dt*.6);pt=Math.max(0,pt-dt*.6);},act(){song=0;}},
      {who:'agnes',text:'She never pointed before. Thirty-seven years. She never did anything before.',expr:'cry',face:{agnes:'S'}},
      {who:'agnes',text:'She’s been waiting for you, then. For someone who’d look.',expr:'sad',wait:.3},
    ],
    done(){done&&done();}});}

// ---------- 3. Silas — "The fresh hole": an open grave your size, in the rain; the shovel put in your hands ----------
function hsFreshHole(done){const gx=62,gz=-36.2;
  const pit={x:gx,z:gz},sil={x:gx,z:gz-.05},you={x:gx+2.0,z:gz+1.0},out={x:gx+1.2,z:gz+.5};
  let dug=.4,swing=0,digging=1,shov=0,inpit=1;const CAM={x:gx+.5,z:gz+.9};
  stage({hour:Math.min(Math.max(S.hour,13),16),storm:true,player:{x:you.x,z:you.z,dir:'W'},cast:{silas:{x:sil.x,z:sil.z,dir:'S'}},cam:CAM,lead:800,
    tick(dt,st){const n=npcById('silas');if(!n)return;if(digging){swing+=dt*3.2;n.z=sil.z-Math.abs(Math.sin(swing))*.12;}else if(!inpit){n.z=out.z;}},
    props:[{x:0,z:9e5,draw(X,Y,t){hsRain(t,true);}},   // the storm: a cold wash and rain over the whole frame, drawn on top
      {x:pit.x,z:pit.z+.12,draw(X,Y){hsGrave(X,Y-6,dug);}},   // the pit draws just in front of Silas, so he stands waist-deep in it
      {get x(){const n=npcById('silas');return n?n.x+.5:gx;},get z(){const n=npcById('silas');return (n?n.z:gz)-.01;},draw(X,Y,t){if(digging){const a=Math.sin(swing)*.8-.3;hsShovel(X+2,Y-16,a);}else if(shov>0){hsShovel(sx(you.x)-2,sz(you.z)-18,.5);}}}],
    beats:[
      {hold:1.0,face:{silas:'S',you:'W'},act(){stgTitle('Silas — The fresh hole');}},
      {who:'silas',text:'Don’t mind the rain. The ground gives easier when it’s wet. Kinder that way.',expr:'neutral'},
      {who:'you',text:'Silas… this one’s my size.',expr:'scared',wait:.4},
      {who:'silas',text:'It’s not for you. It’s for what comes back wearing you, if it comes to that.',expr:'sad'},
      {who:'silas',text:'Bury that deep enough and it can’t climb out wrong. I’ve had to, before.',expr:'wrong',wait:.3},
      {hold:1.4,act(){digging=0;inpit=0;shov=0;},go:{silas:[[gx+.8,gz+.2],[out.x,out.z]]},face:{silas:'E'},wait:'arrive'},
      {who:'silas',text:'Here. Dig the last foot yourself.',act(){shov=1;stgEmote('you','!',1.4);},expr:'think'},
      {who:'silas',text:'It has to be your hands in the dirt, or the ground doesn’t take it. Those are the rules. I didn’t write them.',expr:'neutral',wait:.3},
    ],
    done(){done&&done();}});}

// ---------- 4. Otto — "The lake below the pond": the weighted line that goes down and down, three tugs ----------
function hsLakeBelow(done){const bx=pond.x,bz=pond.z;
  let run=0,drop=0,tug=0,cut=0;const CAM={x:bx,z:bz+.6};
  stage({hour:Math.min(Math.max(S.hour,14),17),player:{x:bx,z:bz,dir:'E',hide:true},cast:{},cam:CAM,lead:850,restore:true,
    light(L){hsVignette(.26);},
    tick(dt){if(drop>0&&run<96)run+=dt*34;if(tug>0)tug+=dt;},
    props:[{x:bx,z:bz+.4,draw(X,Y,t){hsRowboat(X,Y,t);}},
      {x:bx+.02,z:bz+.5,draw(X,Y,t){if(drop>0&&!cut)hsLine(X+9,Y-4,Math.min(run,VH-Y-8),tug>0?tug:0);}}],
    beats:[
      {hold:1.2,act(){stgTitle('Otto — The lake below');}},
      {who:'otto',text:'Easy now. Don’t rock her. Watch the line.',expr:'neutral',act(){drop=1;SFX.splash&&SFX.splash();}},
      {hold:2.0,update(){},},
      {who:'otto',text:'Count it. Two hundred feet of line. This pond is eleven feet deep.',expr:'think',wait:.4},
      {hold:1.6},
      {who:'otto',text:'There’s another lake under this one. Black water. No bottom anyone’s found.',expr:'sad'},
      {who:'otto',text:'That’s where they come up from. Your grandfather’s knife. Ruth’s ribbon. All of it.',expr:'wrong',wait:.3},
      {hold:1.8,act(){tug=.01;SFX.thud&&SFX.thud(0,.2);stgEmote('you','!',1.6);}},
      {who:'you',text:'Something’s pulling. Three times — gentle. Like it knows I’m here.',expr:'scared'},
      {hold:1.2,act(){cut=1;tug=0;SFX.deny&&SFX.deny();},emote:{otto:'!'}},
      {who:'otto',text:'We don’t answer that. Not today. Row us in.',expr:'scared',wait:.3},
    ],
    done(){done&&done();}});}

// ---------- 5. Cora — "The countdown": the number on the board, counting down to your birthday ----------
function hsCountdown(done){const R=ROOMS.home_cora,ox=R.ox,oz=R.oz;
  const bd={x:ox+4.3,z:oz+.1},cora={x:ox+4.3,z:oz+1.4},you={x:ox+5.9,z:oz+2.0};
  let num=7,reveal=0,chalk=0;const CAM={x:ox+4.6,z:oz+1.8};
  stage({room:'home_cora',hour:Math.min(Math.max(S.hour,16),18.2),player:{x:you.x,z:you.z,dir:'N'},cast:{cora:{x:cora.x,z:cora.z,dir:'N'}},cam:CAM,lead:700,
    light(L){glowAt(sx(ox+6),sz(oz+1.1)-34,70,[255,196,120],.32);hsVignette(.2);},
    props:[{x:bd.x,z:oz-.2,draw(X,Y,t){   // the countdown chalked on the blackboard
        ctx2.fillStyle='#e8e2d0';ctx2.font='bold 15px monospace';ctx2.textAlign='center';
        ctx2.fillStyle='rgba(232,226,208,.9)';ctx2.fillText(reveal?'YOU':String(num),X,Y-26);
        if(chalk>0){ctx2.fillStyle='rgba(240,236,220,.8)';ctx2.fillRect(X+12+Math.round(Math.sin(t*20)*3),Y-30,2,2);}ctx2.textAlign='left';}}],
    beats:[
      {hold:.8,face:{cora:'N',you:'N'},act(){stgTitle('Cora — The countdown');}},
      {who:'cora',text:'I write this number every morning before the children come. It’s habit now.',expr:'neutral',act(){chalk=1;}},
      {who:'cora',text:'Go on. Do the arithmetic. You’re a farmer, you can count days.',expr:'think',wait:.4},
      {hold:1.8,act(){chalk=0;},emote:{you:'?'}},
      {who:'you',text:'It’s not counting to the Tithe at all. It’s… that’s my birthday.',expr:'scared'},
      {who:'cora',text:'The day you were born and the day the lots are drawn. The same day. They always were.',expr:'sad'},
      {hold:1.2,act(){reveal=1;SFX.page&&SFX.page();},face:{cora:'E'}},
      {who:'cora',text:'I teach them to subtract so they’ll know when to stop asking where people went.',expr:'cry',wait:.4},
      {who:'cora',text:'I’m sorry. You should have been told the day you arrived. Nobody here tells anybody anything.',expr:'sad'},
    ],
    done(){done&&done();}});}

// ---------- 6. June — "The route": the street after dark, a back at every lit window, the last window yours ----------
function hsRoute(done){const rx=-70,z0=-5.4;   // staged out on open Route 9 west, so only the lit windows and the two of you read in the dark
  const stops=[{x:rx+9},{x:rx+4},{x:rx-1},{x:rx-6}],cabin={x:rx-11};
  const you={x:rx+15,z:z0+1.1},jun={x:rx+13.6,z:z0+1.3};
  stage({hour:21.4,player:{x:you.x,z:you.z,dir:'W'},cast:{june:{x:jun.x,z:jun.z,dir:'W'}},cam:{x:rx+10,z:z0+.4},lead:850,restore:true,
    light(L){for(const s of stops){glowAt(sx(s.x),sz(z0-2.2)-50,58,[255,198,112],.5);hsLitWin(sx(s.x),sz(z0-2.2),false);}
      glowAt(sx(cabin.x),sz(z0-2.2)-50,62,[232,166,116],.6);hsLitWin(sx(cabin.x),sz(z0-2.2),true);hsVignette(.5);},
    props:[{x:0,z:z0-3.2,draw(){ctx2.fillStyle='rgba(4,4,8,.95)';ctx2.fillRect(0,0,VW,VH);   // a blackout behind the houses swallows the open road's clutter
        ctx2.fillStyle='rgba(16,16,22,.6)';ctx2.fillRect(0,VH*.66,VW,VH*.34);ctx2.fillStyle='rgba(26,26,32,.4)';for(let i=0;i<VW;i+=46)ctx2.fillRect(i,VH*.72,40,2);}},   // a hint of wet cobbles
      ...stops.map(s=>({x:s.x,z:z0-2.2,draw(X,Y){hsFacade(X,Y,58);}})),
      {x:cabin.x,z:z0-2.2,draw(X,Y){hsFacade(X,Y,58);}}],
    beats:[
      {hold:1.0,face:{june:'W',you:'W'},act(){stgTitle('June — The route');}},
      {who:'june',text:'I never walk the route after dark. Not once in fifteen years. Tonight I want you to see it.',expr:'scared'},
      {hold:.2,go:{you:[[rx+6,z0+1.1]],june:[[rx+4.6,z0+1.3]]},cam:{x:rx+1,z:z0+.4},face:{june:'W',you:'W'},speed:{you:.7,june:.7},wait:'arrive',camSpeed:.5},
      {who:'june',text:'Every porch light on. And in every window — look — somebody standing with their back to the glass.',expr:'sad'},
      {hold:.2,go:{you:[[rx-4,z0+1.1]],june:[[rx-5.4,z0+1.3]]},cam:{x:rx-8,z:z0+.4},face:{june:'W',you:'W'},speed:{you:.7,june:.7},wait:'arrive',camSpeed:.5},
      {who:'june',text:'They do it the last week. So they can’t see it pass. So they can tell themselves they didn’t.',expr:'wrong',wait:.3},
      {hold:1.8,face:{you:'W'},emote:{you:'!'},act(){SFX.breath&&SFX.breath();}},
      {who:'you',text:'That last one — that’s my cabin. And the figure in it is facing out. Facing us.',expr:'scared'},
      {who:'june',text:'Yes. That’s your window. And you’re here, beside me. So who’s home, do you think?',expr:'cry',wait:.4},
    ],
    done(){done&&done();}});}

// ---------- 7. Caitlyn — "Danny's last letter": the store at dusk, the envelope, the boy who is still pushing ----------
function hsDannyLetter(done){const R=ROOMS.store,ox=R.ox,oz=R.oz;MAEV.on=false;
  const cz=oz+2.66,you0={x:ox+14,z:oz+5.3};let env=0,read=0;const CAM={x:ox+14,z:oz+4.4};
  stage({room:'store',hour:18.4,keepHour:true,player:{x:you0.x,z:you0.z,dir:'N'},cast:{mae:{x:ox+14,z:cz,dir:'S'}},cam:CAM,lead:750,
    light(L){glowAt(sx(ox+9),sz(oz+2.4)-40,110,[255,180,104],.3);},
    props:[{x:0,z:9e5,draw(){hsVignette(.3);}},
      {get x(){return P.x;},get z(){return P.z+.01;},draw(X,Y){if(read>0){ctx2.save();ctx2.globalAlpha=Math.min(1,read);hsLetter(X,Y-26,read);ctx2.restore();}   // the letter, held up in your hands
        else if(env>0){ctx2.save();ctx2.globalAlpha=Math.min(1,env);hsEnvelope(X,Y-24);ctx2.restore();}}}],
    beats:[
      {hold:.9,face:{mae:'S',you:'N'},act(){stgTitle('Caitlyn — Danny’s last letter');}},
      {who:'mae',text:'He wrote this the night before he was taken. He was ten. He knew — children always know.',expr:'sad',act(){env=1;SFX.page&&SFX.page();}},
      {who:'mae',text:'It’s addressed “To whoever comes after me.” That’s you. I think it was always going to be you.',expr:'sad'},
      {hold:1.8,update(dt){read=Math.min(1,read+dt*.5);},act(){SFX.page&&SFX.page();}},
      {who:'you',text:'“It is not a man. It is a door. Everyone it takes is still inside, holding it shut.”',expr:'scared'},
      {who:'you',text:'“If enough of us push at once, it opens the other way. Tell Mom I pushed.”',expr:'sad',wait:.3},
      {hold:1.0,update(dt){read=Math.max(0,read-dt*.8);},face:{mae:'S'}},
      {who:'mae',text:'I don’t cry about it any more. I think he’s still in there. Twenty-five years, still pushing.',expr:'cry'},
      {who:'mae',text:'Maybe that’s where Mom went. Not giving up. Going to help him push. …Would you? When it comes to it?',expr:'sad',wait:.4},
    ],
    done(){maeCome(7,true);done&&done();}});}

// ---------- 8. Finn — "Skipping stones": the river, and a stone that skips back out of the fog ----------
function hsSkipStones(done){const rx=133.1,rz=64.1;
  const you={x:rx-1.2,z:rz+.4},fin={x:rx+.3,z:rz+.5},wz=rz-1.4;
  let sx0=0,sy=0,skip=0,dir=1,back=0;const CAM={x:rx-.2,z:rz+.2};
  stage({hour:Math.min(Math.max(S.hour,9),16),player:{x:you.x,z:you.z,dir:'N'},cast:{finn:{x:fin.x,z:fin.z,dir:'N'}},cam:CAM,lead:750,
    light(L){hsVignette(.16);},
    tick(dt){if(skip>0){skip+=dt;sx0+=dir*180*dt;sy=Math.abs(Math.sin(skip*7))*-10;if(skip>1.4)skip=0;}if(back>0){back+=dt;if(back>1.8)back=0;}},
    props:[{x:rx,z:wz,draw(X,Y,t){hsWaterBand(X,Y-6,460,70,t);}},   // the river, sliced across
      {x:rx,z:wz-.9,draw(X,Y,t){hsFog(X,Y,460,t);}},               // the far side is fog
      {x:rx,z:rz-.2,draw(X,Y,t){if(skip>0)hsSkipStone(sx(you.x)+28+sx0,sz(wz)+6+sy);
        if(back>0){const bx=sx(you.x)+120-back*150,by=sz(wz)+4+Math.abs(Math.sin(back*7))*-8;hsSkipStone(bx,by);}}}],
    beats:[
      {hold:.9,face:{finn:'N',you:'N'},act(){stgTitle('Finn — Skipping stones');}},
      {who:'finn',text:'Watch this! Flat ones skip best. You have to throw it low, like you’re mad at the water.',expr:'happy',act(){sx0=0;skip=.01;dir=1;SFX.splash&&SFX.splash();}},
      {hold:1.6},
      {who:'finn',text:'Seven! Did you see? Sometimes Ollie throws one back. Watch the fog.',expr:'happy',act(){back=.01;}},
      {hold:1.8,act(){stgEmote('you','!',1.6);SFX.splash&&SFX.splash();}},
      {who:'you',text:'Finn — a stone just came back. Out of the fog. On its own.',expr:'scared'},
      {who:'finn',text:'That’s Ollie! He’s my best friend. He’s been in the river ages and ages.',expr:'happy'},
      {who:'finn',text:'He says you’re nice. He says… don’t go in the house. He always says that one.',expr:'neutral',wait:.4},
    ],
    done(){done&&done();}});}

// ---------- 9. Corwin — "The far shore": the Black Lake at night, another Marrow Hollow, someone waving from your porch ----------
function hsFarShoreScene(done){const dx=186,dz=4.6;
  const you={x:dx-.6,z:dz+.3},cor={x:dx+.7,z:dz+.2},wz=dz-1.0;let wave=0;const CAM={x:dx,z:dz+.3};
  stage({hour:21.6,player:{x:you.x,z:you.z,dir:'N'},cast:{corwin:{x:cor.x,z:cor.z,dir:'N'}},cam:CAM,lead:850,restore:true,
    light(L){const FX=sx(dx),FY=sz(wz-1.2);ctx2.save();ctx2.globalCompositeOperation='source-over';   // the far shore's lights, bright over the night
      for(const ddx of [-150,-120,-78,-30,36,96,150]){glowAt(FX+ddx,FY-22,22,[255,205,120],.5);ctx2.fillStyle='#ffd37a';ctx2.fillRect(FX+ddx-2,FY-17,4,5);}
      glowAt(FX+78,FY-24,34,[255,214,130],.65);ctx2.fillStyle='#ffe6a0';ctx2.fillRect(FX+71,FY-18,6,7);ctx2.fillRect(FX+80,FY-18,5,7);   // your farmhouse, every window lit
      glowAt(FX,FY-36,20,[240,220,150],.4);ctx2.restore();hsVignette(.5);},
    tick(dt){wave+=dt;},
    props:[{x:0,z:9e5,draw(){ctx2.fillStyle='rgba(4,5,9,.72)';ctx2.fillRect(0,0,VW,VH*.52);}},   // the night sky over the lake
      {x:dx,z:wz,draw(X,Y,t){hsWaterBand(X,Y,520,120,t);}},
      {x:dx,z:wz-1.2,draw(X,Y,t){hsFarShore(X,Y,wave,1);}}],
    beats:[
      {hold:1.0,face:{corwin:'N',you:'N'},act(){stgTitle('Corwin — The far shore');}},
      {who:'corwin',text:'Look across. Nights like this you can see the lights on the far shore. People don’t believe me.',expr:'neutral'},
      {who:'corwin',text:'It’s Marrow Hollow. Ours, exactly — but over there the bell’s silent and the corn is cut.',expr:'sad',wait:.3},
      {hold:1.6,emote:{you:'?'}},
      {who:'you',text:'There’s a farm with every window lit. And someone on the porch… waving. At us.',expr:'scared'},
      {who:'corwin',text:'That’s your place. That’s where they go, the ones who get through the door. I think. I hope.',expr:'sad'},
      {who:'corwin',text:'They always look so happy over there. Forty-five years I’ve watched them wave. I never wave back.',expr:'wrong',wait:.4},
    ],
    done(){done&&done();}});}

// ---------- 10. Ada — "What stands behind you": she takes your hands, and the Tall Man leans closer ----------
function hsBehindYou(done){const R=ROOMS.home_kerrigan||ROOMS.store,ox=R.ox,oz=R.oz;
  const ada={x:ox+2.2,z:oz+2.8},you={x:ox+4.2,z:oz+4.2},loomAt={x:ox+5.4,z:oz+3.7};
  let loom=0,eyes=0;const CAM={x:ox+3.6,z:oz+3.9};
  stage({room:ROOMS.home_kerrigan?'home_kerrigan':'store',hour:Math.min(Math.max(S.hour,10),13),player:{x:you.x,z:you.z,dir:'N'},cast:{ada:{x:ada.x,z:ada.z,dir:'S'}},cam:CAM,lead:800,
    tick(dt){if(loom>0)loom=Math.min(1,loom+dt*.22);},
    props:[{x:0,z:9e5,draw(){if(loom>0){ctx2.fillStyle=`rgba(5,4,8,${.3*loom})`;ctx2.fillRect(0,0,VW,VH);}hsVignette(.26+.22*loom);}},
      {x:loomAt.x,z:loomAt.z,draw(X,Y){if(loom<=0)return;hsLoom(X,Y-4,52+loom*46,eyes);}}],   // it rises behind your shoulder, taller than the room
    beats:[
      {hold:.9,face:{ada:'S',you:'N'},act(){stgTitle('Ada — What stands behind you');}},
      {who:'ada',text:'Give me your hands, child. There. Let an old blind woman see you properly.',expr:'neutral'},
      {who:'ada',text:'Oh. Oh, he’s tall. Taller than the door. He stands behind every one of them, the month before.',expr:'scared',act(){loom=.01;SFX.breath&&SFX.breath();}},
      {who:'ada',text:'He doesn’t touch. He just waits. He’s behind you right now. Don’t turn round —',expr:'scared',wait:.3},
      {hold:1.8,act(){eyes=1;stgEmote('you','!',2);SFX.stinger&&SFX.stinger();}},
      {who:'ada',text:'— it only makes him lean closer. There. He’s backing off. He doesn’t like me seeing him.',expr:'neutral',act(){eyes=0;}},
      {who:'ada',text:'On the night, look at him. Straight at him. Don’t look away, whatever it costs. It cost me my eyes. Worth it.',expr:'sad',wait:.4},
    ],
    done(){done&&done();}});}

// ---------- 11. Hob — "Who eats it": the inn's long table at three in the morning, and the guest nobody sees ----------
function hsTheGuest(done){const R=ROOMS.home_harlow||ROOMS.store,ox=R.ox,oz=R.oz;
  const tz=oz+4.6,you={x:ox+5.4,z:oz+6.0},hob={x:ox+3.2,z:oz+5.8};
  let lean=0,eaten=0,fork=0;const CAM={x:ox+6,z:oz+5.0};
  stage({room:ROOMS.home_harlow?'home_harlow':'store',hour:3.0,keepHour:true,player:{x:you.x,z:you.z,dir:'N'},cast:{hob:{x:hob.x,z:hob.z,dir:'E'}},cam:CAM,lead:850,
    light(L){glowAt(sx(ox+6)+66,sz(tz)-16,38,[255,196,120],.36-.12*lean);hsVignette(.5);},
    props:[{x:0,z:9e5,draw(){ctx2.fillStyle='rgba(5,5,9,.62)';ctx2.fillRect(0,0,VW,VH);}},   // the dead of night
      {x:ox+6,z:tz,draw(X,Y,t){hsLongTable(X,Y);const px=X+66,py=Y-5;hsPlate(px,py,eaten);hsCandle(px+15,py+2,lean,1);   // the plate + candle at the far end, on the same table
        if(fork>0&&!eaten){ctx2.fillStyle='#b8b0a0';ctx2.fillRect(px-8+Math.round(fork*3),py-2,1,5);}}}],
    beats:[
      {hold:1.0,face:{hob:'E',you:'N'},act(){stgTitle('Hob — Who eats it');}},
      {who:'hob',text:'Every night I set the best cut at the end of the table. For the guest. Don’t you sit there.',expr:'neutral'},
      {who:'hob',text:'Stay up with me. Just watch the candle. Three in the morning’s when he comes.',expr:'sad',wait:.4},
      {hold:2.2,update(dt){lean=Math.min(1,lean+dt*.5);},act(){SFX.breath&&SFX.breath();}},
      {who:'you',text:'The candle’s leaning. Like someone just sat down beside it. There’s no one there.',expr:'scared'},
      {hold:1.8,act(){fork=.01;setTimeout(()=>{eaten=1;SFX.thud&&SFX.thud(0,.2);stgEmote('you','!',1.6);},900);},update(dt){fork=Math.min(1,fork+dt);}},
      {who:'hob',text:'Gone. All at once, the way a dog takes it. He was a boy, once. The first one. 1871.',expr:'sad'},
      {who:'hob',text:'Nobody fed him on the night they drew him. So I feed him. Every night since. Somebody has to.',expr:'cry',wait:.4,act(){lean=0;}},
    ],
    done(){done&&done();}});}

// ---------- route the iconic heart events to their staged versions; everything else still plays via stgGeneric ----------
const HS_SCENES={
  'mae|Closing time':hsClosingTime,'agnes|The music box, played':hsMusicBoxScene,'silas|The fresh hole':hsFreshHole,
  'otto|The lake below the pond':hsLakeBelow,'cora|The countdown':hsCountdown,'june|The route':hsRoute,
  'mae|Danny’s last letter':hsDannyLetter,'corwin|The far shore':hsFarShoreScene,
  'ada|What stands behind you':hsBehindYou,'hob|Who eats it':hsTheGuest};
{const _ps=playScene;playScene=function(id,title,html,done){
  const fn=HS_SCENES[id+'|'+title];
  if(fn&&!STG&&S.mode==='play'&&!S.paused&&typeof stage==='function')return fn(done);
  return _ps(id,title,html,done);};}
window.__hs=HS_SCENES;
