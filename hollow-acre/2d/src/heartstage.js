/* ================= #216 heart events get the staged cutscenes' physicality. Each iconic heart scene now plays in the place
   it is about, with the thing it describes actually happening in the world: Agnes winds the music box and a child stands at the
   well and points down into it; Silas digs an open grave your size in the rain and puts the shovel in your hands; Otto's weighted
   line goes down and down and something tugs it three times; the countdown on Cora's board is counting to your birthday; June's
   street has a figure with its back to every lit window, and the last window is yours, facing out. Built on stage() (stage.js).
   Everything not hand-staged still plays through stgGeneric (the person walks to you in the world). ================= */

// ---------- a kit of props drawn straight into the world (screen space) ----------
// shared material ramps — the GAME's conventions: 4-5 hue-shifted steps (cool-dark → warm-light), one bold outline a darker version of the colour, one light direction (top-left)
const HSP={
  woodO:'#140d08', wood:['#3a2614','#523418','#6e4824','#8a5e32','#a87a44'],
  stoneO:'#15151b', stone:['#3a3a42','#52525a','#6c686e','#86828a','#a2a2a8'], moss:'#46542e',
  steelO:'#14141a', steel:['#2b3844','#46586a','#6a7e90','#9fb2c2','#e8f0f8'],
  paleO:'#86816f', pale:['#8e8a7c','#b0ac9e','#c8c4b6','#dcd8cc','#efeade'],
  earthO:'#1a1016', earth:['#2c1d14','#46301c','#664526','#8a6338','#a67c48'],
  ironO:'#0e0e12', iron:['#222228','#34343c','#4a4a52','#64646c'],
  brass:['#5a3c14','#8a6420','#c49636','#e8c468'],
  cloth:['#20365e','#2a4a7a','#3a5f9a','#5a82bc'],   // Ruth's blue ribbon
  SH:'rgba(50,33,37,.55)'   // the game's #322125 drop shadow at ~55%
};
function hsSh(X,Y,rx,ry){ctx2.fillStyle=HSP.SH;ctx2.beginPath();ctx2.ellipse(X,Y,rx,ry,0,0,6.283);ctx2.fill();}   // a flattened drop shadow
function hsBoxO(x,y,w,h,r,o){   // an outlined box: bold outline, mid body, lit top+left, shaded bottom+right (light top-left)
  ctx2.fillStyle=o;ctx2.fillRect(x-1,y-1,w+2,h+2);ctx2.fillStyle=r[1];ctx2.fillRect(x,y,w,h);
  ctx2.fillStyle=r[2];ctx2.fillRect(x,y,w,2);ctx2.fillStyle=r[3];ctx2.fillRect(x,y,w,1);ctx2.fillStyle=r[2];ctx2.fillRect(x,y,2,h);
  ctx2.fillStyle=r[0];ctx2.fillRect(x+w-2,y,2,h);ctx2.fillRect(x,y+h-2,w,2);}
function hsRain(t,heavy){   // the engine only draws storm-rain at night; a daytime grave scene draws its own, with a cold wash + vignette
  ctx2.fillStyle='rgba(28,40,58,.34)';ctx2.fillRect(0,0,VW,VH);                                          // the storm greys the whole scene
  const n=heavy?160:95;ctx2.strokeStyle=heavy?'rgba(188,206,232,.5)':'rgba(172,192,222,.32)';ctx2.lineWidth=1;ctx2.beginPath();
  for(let i=0;i<n;i++){const x=(hash(i,1)*VW+t*74)%VW,y=(hash(i,3)*VH+t*780)%VH;ctx2.moveTo(x,y);ctx2.lineTo(x-3,y+9);}ctx2.stroke();
  const g=ctx2.createRadialGradient(VW/2,VH*.4,VH*.16,VW/2,VH*.52,VH*.82);g.addColorStop(0,'rgba(8,10,14,0)');g.addColorStop(1,'rgba(5,8,12,.6)');ctx2.fillStyle=g;ctx2.fillRect(0,0,VW,VH);}
function hsVignette(a){const g=ctx2.createRadialGradient(VW/2,VH*.46,VH*.16,VW/2,VH*.5,VH*.8);g.addColorStop(0,'rgba(4,4,8,0)');g.addColorStop(1,`rgba(3,3,7,${a})`);ctx2.fillStyle=g;ctx2.fillRect(0,0,VW,VH);}
function hsWell(X,Y){   // a round stone well: outlined stones with a top-left-lit ramp + moss, wood posts, a shingle roof — game conventions
  const SO=HSP.stoneO,S=HSP.stone,WO=HSP.woodO,W=HSP.wood;
  hsSh(X,Y+4,16,4);
  ctx2.fillStyle='#050406';ctx2.beginPath();ctx2.ellipse(X,Y-5,10,5,0,0,6.283);ctx2.fill();                 // the black mouth
  for(let a=0;a<6.283;a+=.4){const rx=Math.round(X+Math.cos(a)*13),ry=Math.round(Y-5+Math.sin(a)*7),top=Math.sin(a)<0;   // the ring of stones, each outlined, lit top-left, some mossy
    ctx2.fillStyle=SO;ctx2.fillRect(rx-3,ry-3,6,6);ctx2.fillStyle=top?S[3]:S[1];ctx2.fillRect(rx-2,ry-2,4,4);ctx2.fillStyle=top?S[4]:S[2];ctx2.fillRect(rx-2,ry-2,2,1);
    if((a*10|0)%7===0){ctx2.fillStyle=HSP.moss;ctx2.fillRect(rx-1,ry+1,2,2);}}
  for(const px of [X-13,X+9]){ctx2.fillStyle=WO;ctx2.fillRect(px,Y-36,4,31);ctx2.fillStyle=W[1];ctx2.fillRect(px+1,Y-35,3,30);ctx2.fillStyle=W[3];ctx2.fillRect(px+1,Y-35,1,30);}   // two wood posts, lit on the left
  ctx2.fillStyle=WO;ctx2.fillRect(X-20,Y-44,40,9);ctx2.fillStyle=W[1];ctx2.fillRect(X-19,Y-43,38,7);ctx2.fillStyle=W[2];ctx2.fillRect(X-19,Y-43,38,2);ctx2.fillStyle=W[3];ctx2.fillRect(X-19,Y-43,38,1);
  ctx2.fillStyle=WO;for(let i=-16;i<18;i+=5)ctx2.fillRect(X+i,Y-41,1,5);ctx2.fillStyle=W[0];ctx2.fillRect(X-19,Y-37,38,1);}   // the shingle seams + eave shade
function hsChild(X,Y,a,point){   // a small faceless child in a pale dress; point 0..1 extends one arm down over the well rim
  if(a<=0)return;ctx2.save();ctx2.globalAlpha=Math.min(1,a);
  const dr='#d6d2c6',drS='#9a94a0',sh='#6a6670',sk='#c6b69a',skS='#9e8a70',hair='#4e3c2c';   // light from top-left: lit left, plum-leaning shadow on the right
  ctx2.fillStyle='rgba(18,12,14,.5)';ctx2.beginPath();ctx2.ellipse(X,Y+4,7,2.2,0,0,6.283);ctx2.fill();   // a drop shadow, so she stands on the ground and doesn't float
  ctx2.fillStyle=sk;ctx2.fillRect(X-3,Y-1,2,4);ctx2.fillRect(X+1,Y-1,2,4);ctx2.fillStyle=skS;ctx2.fillRect(X-1,Y-1,1,4);ctx2.fillRect(X+3,Y-1,1,4);ctx2.fillStyle='#2a1c12';ctx2.fillRect(X-3,Y+2,2,1);ctx2.fillRect(X+1,Y+2,2,1);   // two little legs with a shaded inner edge
  ctx2.fillStyle=sh;ctx2.beginPath();ctx2.moveTo(X-4,Y-14);ctx2.lineTo(X+4,Y-14);ctx2.lineTo(X+7,Y-1);ctx2.lineTo(X-7,Y-1);ctx2.closePath();ctx2.fill();   // the dress: a triangle, narrow at the shoulders, flaring to the hem
  ctx2.fillStyle=dr;ctx2.beginPath();ctx2.moveTo(X-3,Y-13);ctx2.lineTo(X+3,Y-13);ctx2.lineTo(X+5,Y-2);ctx2.lineTo(X-5,Y-2);ctx2.closePath();ctx2.fill();
  ctx2.fillStyle=drS;ctx2.beginPath();ctx2.moveTo(X+2,Y-12);ctx2.lineTo(X+3,Y-13);ctx2.lineTo(X+5,Y-2);ctx2.lineTo(X+2,Y-2);ctx2.closePath();ctx2.fill();   // the dress' plum shadow side (light is top-left, so the right falls dark)
  ctx2.fillStyle='#e6e2d6';ctx2.beginPath();ctx2.moveTo(X-3,Y-13);ctx2.lineTo(X-1,Y-13);ctx2.lineTo(X-3,Y-2);ctx2.lineTo(X-5,Y-2);ctx2.closePath();ctx2.fill();   // the lit left side
  ctx2.fillStyle=hair;ctx2.beginPath();ctx2.ellipse(X,Y-18,5,5.5,0,0,6.283);ctx2.fill();ctx2.fillStyle=sk;ctx2.beginPath();ctx2.ellipse(X-0.3,Y-17,3.4,4,0,0,6.283);ctx2.fill();ctx2.fillStyle=skS;ctx2.beginPath();ctx2.ellipse(X+1.6,Y-16,1.6,3,0,0,6.283);ctx2.fill();   // round head, lit left / shaded right
  ctx2.fillStyle='rgba(28,20,24,.6)';ctx2.fillRect(X-2,Y-19,1,3);ctx2.fillRect(X+1,Y-19,1,3);   // two hollow, featureless eyes — it reads as a face, and it is wrong
  ctx2.fillStyle=hair;ctx2.fillRect(X-5,Y-22,10,5);ctx2.fillRect(X-5,Y-19,2,6);ctx2.fillRect(X+3,Y-19,2,6);   // hair frames the face
  {ctx2.fillStyle='#2a2024';ctx2.fillRect(X-7,Y-12,2,7);ctx2.fillStyle=sk;ctx2.fillRect(X-6.5,Y-11,1.4,6);ctx2.fillStyle=skS;ctx2.fillRect(X-6.5,Y-6,2,2);}   // the LEFT arm, resting at her side (so she isn't one-armed), tapered and shaded
  if(point>0){const hy=Y-8+Math.round(point*6);   // a short BENT arm at the right side pointing down at the well — tapered, connected at the shoulder, not a reaching tube
    ctx2.fillStyle='#2a2024';ctx2.beginPath();ctx2.moveTo(X+3,Y-13);ctx2.lineTo(X+6,Y-12);ctx2.lineTo(X+8,hy);ctx2.lineTo(X+5,hy);ctx2.closePath();ctx2.fill();   // a soft dark edge, outside the dress
    ctx2.fillStyle=sk;ctx2.beginPath();ctx2.moveTo(X+4,Y-12);ctx2.lineTo(X+6,Y-11.5);ctx2.lineTo(X+7.5,hy-1);ctx2.lineTo(X+5.5,hy-1);ctx2.closePath();ctx2.fill();   // the arm, tapering shoulder→wrist
    ctx2.fillStyle=skS;ctx2.fillRect(X+6,Y-10,1.5,hy-Y+9);   // its shaded right side
    ctx2.fillStyle=sk;ctx2.fillRect(X+5,hy-1,3,3);ctx2.fillStyle=skS;ctx2.fillRect(X+5,hy+1,3,1);}   // the little hand, pointing down
  ctx2.restore();}
function hsMusicBox(X,Y,open){   // a little wooden box on the rail; lid open shows a turning brass cylinder
  const WO=HSP.woodO,W=HSP.wood,B=HSP.brass;hsSh(X,Y+2,9,2.5);
  hsBoxO(X-7,Y-5,15,6,W,WO);   // the box body: outline, ramp, lit top+left
  if(open){ctx2.fillStyle=WO;ctx2.fillRect(X-7,Y-12,15,4);ctx2.fillStyle=W[2];ctx2.fillRect(X-6,Y-11,13,2);ctx2.fillStyle=W[3];ctx2.fillRect(X-6,Y-11,13,1);   // the raised lid
    ctx2.fillStyle=B[0];ctx2.fillRect(X-5,Y-5,11,2);ctx2.fillStyle=B[2];ctx2.fillRect(X-5,Y-5,11,1);ctx2.fillStyle=B[3];ctx2.fillRect(X-4+((Date.now()/90|0)%10),Y-5,1,1);}}   // the brass cylinder + a turning pin
function hsGrave(X,Y,dug){   // a freshly dug grave, drawn to the GAME's sprite conventions: a 5-step hue-shifted dirt ramp, bold outlines, hand-placed clod texture, strong lit-top vs shaded-sides, a #322125 drop shadow, no gradients
  const w=28,h=Math.round(16+dug*5);
  const OUT='#1a1016',D='#2c1d14',M='#46301c',L='#664526',HI='#8a6338',PIT='#0a0a10';
  ctx2.fillStyle='rgba(50,33,37,.55)';ctx2.beginPath();ctx2.ellipse(X+2,Y+h,w*0.6,5,0,0,6.283);ctx2.fill();   // the drop shadow (#322125 @ ~55%)
  ctx2.fillStyle=OUT;ctx2.fillRect(X-w*0.5-2,Y-3,w+4,h+6);                                                     // one bold outline round the whole rim
  ctx2.fillStyle=M;ctx2.fillRect(X-w*0.5,Y-1,w,h+2);                                                           // the mid dirt mass
  ctx2.fillStyle=L;ctx2.fillRect(X-w*0.5,Y-1,w,3);ctx2.fillStyle=HI;ctx2.fillRect(X-w*0.5,Y-1,w,1);            // the top lip, lit warmest
  ctx2.fillStyle=L;ctx2.fillRect(X-w*0.5,Y-1,3,h);                                                             // the left face, lit
  ctx2.fillStyle=D;ctx2.fillRect(X+w*0.5-3,Y,3,h+1);ctx2.fillRect(X-w*0.5,Y+h-2,w,3);                          // the right + bottom, in shadow
  const tn=w*0.36,tf=w*0.30;
  ctx2.fillStyle=OUT;ctx2.beginPath();ctx2.moveTo(X-tf-1,Y+2);ctx2.lineTo(X+tf+1,Y+2);ctx2.lineTo(X+tn+1,Y+h-2);ctx2.lineTo(X-tn-1,Y+h-2);ctx2.closePath();ctx2.fill();
  ctx2.fillStyle=PIT;ctx2.beginPath();ctx2.moveTo(X-tf,Y+3);ctx2.lineTo(X+tf,Y+3);ctx2.lineTo(X+tn,Y+h-3);ctx2.lineTo(X-tn,Y+h-3);ctx2.closePath();ctx2.fill();   // the pit mouth, near-black
  ctx2.fillStyle=D;ctx2.beginPath();ctx2.moveTo(X-tf,Y+3);ctx2.lineTo(X+tf,Y+3);ctx2.lineTo(X+tf-1,Y+5);ctx2.lineTo(X-tf+1,Y+5);ctx2.closePath();ctx2.fill();   // a lit sliver of the far wall (depth)
  ctx2.fillStyle=HI;for(const[cx,cy]of[[-11,0],[-4,-1],[4,0],[10,-1]])ctx2.fillRect(X+cx,Y+cy,1,1);            // hand-placed clod crumbs on the lit rim
  ctx2.fillStyle=D;for(const[cx,cy]of[[-8,h-2],[2,h-1],[9,h-2]])ctx2.fillRect(X+cx,Y+cy,1,1);                  // and on the shaded edge
  const gx=X+w*0.5+9,gy=Y+h*0.42;                                                                             // the dug spoil: stacked clod bundles (back darker, front lit), one outline each, its own shadow
  ctx2.fillStyle='rgba(50,33,37,.5)';ctx2.beginPath();ctx2.ellipse(gx,gy+6,12,3.5,0,0,6.283);ctx2.fill();
  const clod=(cx,cy,r,lit)=>{ctx2.fillStyle=OUT;ctx2.beginPath();ctx2.ellipse(cx,cy,r+1,r*0.8+1,0,0,6.283);ctx2.fill();
    ctx2.fillStyle=lit?M:D;ctx2.beginPath();ctx2.ellipse(cx,cy,r,r*0.8,0,0,6.283);ctx2.fill();
    ctx2.fillStyle=lit?L:M;ctx2.beginPath();ctx2.ellipse(cx-r*0.3,cy-r*0.3,r*0.55,r*0.42,0,0,6.283);ctx2.fill();
    if(lit){ctx2.fillStyle=HI;ctx2.fillRect(Math.round(cx-r*0.4),Math.round(cy-r*0.5),1,1);}};
  clod(gx+5,gy+2,4,false);clod(gx-5,gy+2,4,false);clod(gx+2,gy-2,5,true);clod(gx-3,gy-1,4.5,true);clod(gx+7,gy+2,3.5,true);}
function hsShovel(X,Y,ang){const WO=HSP.woodO,W=HSP.wood,IO=HSP.ironO,I=HSP.iron;ctx2.save();ctx2.translate(X,Y);ctx2.rotate(ang);
  ctx2.fillStyle=WO;ctx2.fillRect(-2,-16,4,16);ctx2.fillStyle=W[2];ctx2.fillRect(-1,-16,2,16);ctx2.fillStyle=W[3];ctx2.fillRect(-1,-16,1,16);   // the handle, lit on the left
  ctx2.fillStyle=IO;ctx2.fillRect(-4,-1,8,9);ctx2.fillStyle=I[1];ctx2.fillRect(-3,0,6,7);ctx2.fillStyle=I[3];ctx2.fillRect(-3,0,6,2);ctx2.fillStyle=I[2];ctx2.fillRect(-3,0,1,7);ctx2.restore();}   // the blade, lit top-left
function hsRowboat(X,Y,t){   // a clinker rowboat seen three-quarter on dark water, with the two of you sat in it
  const WO=HSP.woodO,W=HSP.wood,o=WO,hull=W[1],hi=W[0],rim=W[3];
  ctx2.fillStyle='rgba(6,10,12,.5)';ctx2.beginPath();ctx2.ellipse(X,Y+10,34,8,0,0,6.283);ctx2.fill();                 // the boat's shadow on the water
  ctx2.fillStyle=o;ctx2.beginPath();ctx2.ellipse(X,Y+2,32,12,0,0,6.283);ctx2.fill();
  ctx2.fillStyle=hull;ctx2.beginPath();ctx2.ellipse(X,Y,30,10,0,0,6.283);ctx2.fill();
  ctx2.fillStyle=W[2];ctx2.beginPath();ctx2.ellipse(X,Y-1,27,7,0,0,6.283);ctx2.fill();                                // the lit upper strake
  ctx2.fillStyle=hi;ctx2.beginPath();ctx2.ellipse(X,Y+1,22,5,0,0,6.283);ctx2.fill();                                  // the dark interior
  ctx2.fillStyle=rim;for(let i=-28;i<=28;i+=5)ctx2.fillRect(X+i,Y-7+Math.round(Math.abs(i)*.14),3,2);                 // the lit gunwale
  ctx2.fillStyle=WO;ctx2.fillRect(X-16,Y-3,32,2);ctx2.fillStyle=W[2];ctx2.fillRect(X-16,Y-3,32,1);ctx2.fillStyle=WO;ctx2.fillRect(X-4,Y-4,2,4);   // a thwart
  // two seated figures: you nearer, Otto at the far oars
  const fig=(fx,fy,coat,skin,cap)=>{ctx2.fillStyle=o;ctx2.fillRect(fx-5,fy-14,11,14);ctx2.fillStyle=coat;ctx2.fillRect(fx-4,fy-13,9,12);ctx2.fillStyle=skin;ctx2.fillRect(fx-3,fy-19,6,6);ctx2.fillStyle=o;ctx2.fillRect(fx-3,fy-19,6,2);if(cap){ctx2.fillStyle=cap;ctx2.fillRect(fx-4,fy-21,8,3);}};
  fig(X+9,Y-2,'#3a4a5a','#c6a886',null);              // you
  fig(X-10,Y-3,'#45321f','#b89a78','#2a1d12');         // Otto, in his cap
  ctx2.fillStyle='#b89a78';ctx2.fillRect(X-15,Y-6,3,2);ctx2.fillRect(X+13,Y-5,3,2);   // a hand on the gunwale each: Otto reaching to the oar, you steadying the rail
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
function hsTallFig(X,Y,h,k){   // a too-tall figure in a window; k=0 a plain man, k=1 the carved-pumpkin Hollow lit from within
  const hy=Y-h-1,sy=Y-h+8;   // the head centre, and the shoulder line below a thin neck
  if(k){ctx2.fillStyle='#14141e';ctx2.beginPath();ctx2.moveTo(X-12,sy+1);ctx2.lineTo(X-11,hy-5);ctx2.lineTo(X-6,hy-10);ctx2.lineTo(X,hy-11);ctx2.lineTo(X+6,hy-10);ctx2.lineTo(X+11,hy-5);ctx2.lineTo(X+12,sy+1);ctx2.closePath();ctx2.fill();   // a cloth HOOD framing the head — hard-edged (not a gradient halo), so the head reads attached to a cloaked body
    ctx2.fillStyle='#2e3050';ctx2.beginPath();ctx2.moveTo(X-12,sy+1);ctx2.lineTo(X-11,hy-5);ctx2.lineTo(X-6,hy-10);ctx2.lineTo(X-4,hy-9);ctx2.lineTo(X-8,hy-4);ctx2.lineTo(X-9,sy);ctx2.closePath();ctx2.fill();}   // the hood's hard top-left-lit rim
  ctx2.fillStyle='rgba(150,160,200,.42)';ctx2.beginPath();ctx2.moveTo(X-11,Y+1);ctx2.lineTo(X-10,sy);ctx2.lineTo(X+10,sy);ctx2.lineTo(X+11,Y+1);ctx2.closePath();ctx2.fill();   // a cool rim so the black robe holds against the bright pane
  ctx2.fillStyle='#07070d';ctx2.fillRect(X-2,hy+5,4,sy-hy-4);   // a thin NECK, so the head sits above a shoulder break, not merged into a keyhole
  ctx2.fillStyle='#0b0b12';ctx2.beginPath();ctx2.moveTo(X-9,Y+1);ctx2.lineTo(X-10,sy+1);ctx2.lineTo(X-4,sy-1);ctx2.lineTo(X+4,sy-1);ctx2.lineTo(X+10,sy+1);ctx2.lineTo(X+9,Y+1);ctx2.closePath();ctx2.fill();   // wide shoulders dropping to a tapering robe
  ctx2.fillStyle='#2e3050';ctx2.beginPath();ctx2.moveTo(X-9,Y+1);ctx2.lineTo(X-10,sy+1);ctx2.lineTo(X-6.5,sy);ctx2.lineTo(X-5.5,Y+1);ctx2.closePath();ctx2.fill();   // ONE clean cool-lit edge down the robe's left side — no stripes (vertical bars read as a barrel)
  if(k){ctx2.fillStyle='#160a06';ctx2.beginPath();ctx2.ellipse(X,hy,8,7.5,0,0,6.283);ctx2.fill();   // the rotting pumpkin head — a dark plum rind, so only the carved light glows (not a Halloween lantern)
    ctx2.fillStyle='#2e1810';ctx2.beginPath();ctx2.ellipse(X,hy,7,6.5,0,0,6.283);ctx2.fill();ctx2.fillStyle='#3e2214';ctx2.beginPath();ctx2.ellipse(X-2,hy-2,3.5,2.6,0,0,6.283);ctx2.fill();
    for(let i=-6;i<=6;i+=3){ctx2.fillStyle='rgba(16,10,5,.6)';ctx2.fillRect(X+i,hy-6,1,13);}   // carved ribs
    ctx2.fillStyle='#ffb43a';ctx2.beginPath();ctx2.moveTo(X-5,hy-1);ctx2.lineTo(X-1,hy-3);ctx2.lineTo(X-1,hy+1);ctx2.closePath();ctx2.fill();   // two carved candle-eyes
    ctx2.beginPath();ctx2.moveTo(X+5,hy-1);ctx2.lineTo(X+1,hy-3);ctx2.lineTo(X+1,hy+1);ctx2.closePath();ctx2.fill();
    ctx2.fillStyle='#ff8a1e';for(let i=0;i<4;i++)ctx2.fillRect(X-4+i*2,hy+3+(i%2),2,2);ctx2.fillStyle='#ffe0a0';ctx2.fillRect(X-1,hy-1,1,1);ctx2.fillRect(X+3,hy-1,1,1);}   // the jagged lit mouth + eye sparks
  else{ctx2.fillStyle='#07070d';ctx2.beginPath();ctx2.ellipse(X,hy,6,7,0,0,6.283);ctx2.fill();}}
function hsLoom(X,Y,h,k){   // the Tall Man looming behind you: a smear of dark, almost a man, no light on it
  ctx2.fillStyle='rgba(4,3,5,.5)';ctx2.fillRect(X-12,Y-h-6,24,h+6);                                // its shadow bleeding out
  ctx2.fillStyle='rgba(6,5,8,.96)';ctx2.fillRect(X-7,Y-h,14,h);ctx2.fillStyle='#0d0a10';ctx2.fillRect(X-6,Y-h,12,h);
  ctx2.fillStyle='#070509';ctx2.fillRect(X-5,Y-h-13,10,15);                                        // a long head
  if(k){ctx2.fillStyle='#14212a';ctx2.fillRect(X-3,Y-h-9,2,2);ctx2.fillRect(X+1,Y-h-9,2,2);}}      // when it is close, two cold eyes
function hsEnvelope(X,Y){const PO=HSP.paleO,P=HSP.pale;ctx2.fillStyle=PO;ctx2.fillRect(X-9,Y-6,19,12);ctx2.fillStyle=P[2];ctx2.fillRect(X-8,Y-5,17,10);ctx2.fillStyle=P[3];ctx2.fillRect(X-8,Y-5,17,1);ctx2.fillStyle=P[1];ctx2.fillRect(X-8,Y+4,17,1);
  ctx2.fillStyle=P[1];for(let i=0;i<=8;i++){ctx2.fillRect(X-8+i,Y-5+Math.round(i*.55),1,1);ctx2.fillRect(X+8-i,Y-5+Math.round(i*.55),1,1);}   // the flap crease
  ctx2.fillStyle='#7a241c';ctx2.fillRect(X-1,Y-1,3,3);ctx2.fillStyle='#9a3a2e';ctx2.fillRect(X-1,Y-1,2,1);}   // the wax seal, lit
function hsLetter(X,Y,k){const w=30,h=40,PO=HSP.paleO,P=HSP.pale;ctx2.fillStyle=PO;ctx2.fillRect(X-w/2-1,Y-h-1,w+2,h+2);ctx2.fillStyle=P[3];ctx2.fillRect(X-w/2,Y-h,w,h);ctx2.fillStyle=P[4];ctx2.fillRect(X-w/2,Y-h,w,2);ctx2.fillStyle=P[2];ctx2.fillRect(X-w/2,Y-h,2,h);ctx2.fillStyle=P[1];ctx2.fillRect(X+w/2-2,Y-h,2,h);
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
function hsLongTable(X,Y){const WO=HSP.woodO,W=HSP.wood;hsSh(X,Y+16,92,5);
  ctx2.fillStyle=WO;ctx2.fillRect(X-88,Y-6,176,16);ctx2.fillStyle=W[1];ctx2.fillRect(X-86,Y-5,172,13);ctx2.fillStyle=W[2];ctx2.fillRect(X-86,Y-5,172,3);ctx2.fillStyle=W[3];ctx2.fillRect(X-86,Y-5,172,1);ctx2.fillStyle=W[0];ctx2.fillRect(X-86,Y+6,172,2);
  for(const lx of [-78,-20,20,78]){ctx2.fillStyle=WO;ctx2.fillRect(X+lx-2,Y+8,5,10);ctx2.fillStyle=W[1];ctx2.fillRect(X+lx-1,Y+8,3,10);ctx2.fillStyle=W[2];ctx2.fillRect(X+lx-1,Y+8,1,10);}   // legs, lit left
  for(let i=-80;i<84;i+=12){ctx2.fillStyle=WO;ctx2.fillRect(X+i,Y-4,1,9);}}   // hand-placed plank seams
function hsPlate(X,Y,eaten){const PO=HSP.paleO,P=HSP.pale;ctx2.fillStyle=PO;ctx2.beginPath();ctx2.ellipse(X,Y,11,5,0,0,6.283);ctx2.fill();
  ctx2.fillStyle=P[2];ctx2.beginPath();ctx2.ellipse(X,Y,9,4,0,0,6.283);ctx2.fill();ctx2.fillStyle=P[3];ctx2.beginPath();ctx2.ellipse(X-1,Y-1,7,2.6,0,0,6.283);ctx2.fill();   // the rim, lit top-left
  ctx2.fillStyle=P[1];ctx2.beginPath();ctx2.ellipse(X,Y,5,2,0,0,6.283);ctx2.fill();   // the well of the plate, shaded
  if(!eaten){ctx2.fillStyle='#5a2c1e';ctx2.beginPath();ctx2.ellipse(X,Y-1,4,2,0,0,6.283);ctx2.fill();ctx2.fillStyle='#7a3c28';ctx2.fillRect(X-2,Y-2,4,2);ctx2.fillStyle='#9a5038';ctx2.fillRect(X-2,Y-2,2,1);}}   // the best cut (a meat ramp), then gone
function hsCandle(X,Y,lean,lit){const lx=Math.round(lean*5),PO=HSP.paleO,P=HSP.pale;ctx2.fillStyle=PO;ctx2.fillRect(X-2,Y-12,4,12);ctx2.fillStyle=P[2];ctx2.fillRect(X-2,Y-12,3,12);ctx2.fillStyle=P[3];ctx2.fillRect(X-2,Y-12,1,12);ctx2.fillStyle=P[1];ctx2.fillRect(X+1,Y-12,1,12);   // wax: lit left, shaded right
  if(lit){ctx2.fillStyle='#ff9e2a';ctx2.fillRect(X-1+lx,Y-16,2,4);ctx2.fillStyle='#ffd070';ctx2.fillRect(X-1+lx,Y-17,2,3);ctx2.fillStyle='#fff2c0';ctx2.fillRect(X+lx,Y-17,1,2);}}   // the flame, hard steps
function hsSkipStone(X,Y){ctx2.fillStyle='rgba(220,224,228,.9)';ctx2.fillRect(X-1,Y-1,3,2);ctx2.fillStyle='rgba(150,170,180,.5)';ctx2.fillRect(X-2,Y+2,5,1);}   // a stone mid-skip + its splash
function hsCarvedBox(X,Y){   // a dovetailed oak box on a cloth; carved on the lid, your farmhouse with one lit window and a figure turned away inside it
  const WO=HSP.woodO,W=HSP.wood,B=HSP.brass;hsSh(X,Y+6,24,5);
  ctx2.fillStyle=WO;ctx2.fillRect(X-21,Y-17,43,23);ctx2.fillStyle=W[1];ctx2.fillRect(X-20,Y-16,41,21);ctx2.fillStyle=W[2];ctx2.fillRect(X-20,Y-16,41,4);ctx2.fillStyle=W[3];ctx2.fillRect(X-20,Y-16,41,1);ctx2.fillStyle=W[0];ctx2.fillRect(X-20,Y+3,41,2);
  ctx2.fillStyle=WO;for(let x=-20;x<21;x+=7)ctx2.fillRect(X+x,Y-16,1,21);   // dovetail seams
  ctx2.fillStyle=B[1];ctx2.fillRect(X+15,Y-6,3,3);ctx2.fillStyle=B[3];ctx2.fillRect(X+15,Y-6,2,1);   // a brass clasp
  ctx2.fillStyle='#241607';ctx2.fillRect(X-13,Y-13,24,13);ctx2.fillStyle=W[0];ctx2.fillRect(X-13,Y-13,24,1);   // the carved panel, sunk
  ctx2.fillStyle='#1c1208';ctx2.fillRect(X-7,Y-9,14,9);ctx2.beginPath();ctx2.moveTo(X-9,Y-9);ctx2.lineTo(X,Y-15);ctx2.lineTo(X+9,Y-9);ctx2.fill();   // the little house + gable roof
  ctx2.fillStyle=W[0];ctx2.fillRect(X-9,Y-9,18,1);ctx2.fillStyle='#e8c050';ctx2.fillRect(X-3,Y-6,6,6);ctx2.fillStyle='#120c06';ctx2.fillRect(X-1,Y-5,3,5);}   // the lit window, a dark figure turned away in it
function hsBellRope(X,Y,t){   // a new white rope hanging from above, swaying; a coil of old rope cut into yard-pieces on the floor
  const sw=Math.round(Math.sin(t*1.3)*2);ctx2.fillStyle='#e8e2d2';ctx2.fillRect(X-1+sw,Y-80,3,66);ctx2.fillStyle='#cfc8b6';ctx2.fillRect(X-1+sw,Y-80,1,66);
  ctx2.fillStyle='#b8ad94';ctx2.fillRect(X-2+sw,Y-16,5,5);ctx2.fillStyle='#8a7e64';ctx2.fillRect(X-2+sw,Y-12,5,1);   // the handle knot
  const piece=(cx,cy,len,ang,col)=>{ctx2.save();ctx2.translate(cx,cy);ctx2.rotate(ang);
    ctx2.strokeStyle=col;ctx2.lineWidth=3;ctx2.lineCap='round';ctx2.beginPath();ctx2.moveTo(-len/2,0);ctx2.quadraticCurveTo(0,-2,len/2,0);ctx2.stroke();   // one cut length of old rope, a shallow curve
    ctx2.strokeStyle='#8a7c5c';ctx2.lineWidth=1;ctx2.lineCap='butt';for(const e of [-1,1])for(let f=0;f<3;f++){ctx2.beginPath();ctx2.moveTo(e*len/2,0);ctx2.lineTo(e*len/2+e*3,(f-1)*1.6);ctx2.stroke();}   // the frayed ends
    ctx2.restore();};
  piece(X-15,Y+7,16,.18,'#6a5838');piece(X+3,Y+9,14,-.12,'#5e4e32');piece(X-6,Y+13,12,.3,'#625234');piece(X+14,Y+6,13,-.24,'#6a5838');}   // four separate cut pieces on the floor
function hsNailBlade(X,Y,wrap,glow){   // oilcloth bundle, then a short black blade, warm from the forge, that sometimes points
  if(wrap<1){ctx2.fillStyle='#3a3630';ctx2.fillRect(X-9,Y-4,18,8);ctx2.fillStyle='#4a463e';ctx2.fillRect(X-9,Y-4,18,2);ctx2.fillStyle='#2a2620';ctx2.fillRect(X-2,Y-5,4,10);return;}
  ctx2.fillStyle='rgba(6,4,2,.4)';ctx2.beginPath();ctx2.ellipse(X+5,Y+9,9,2.6,0,0,6.283);ctx2.fill();   // a soft drop shadow so the blade sits where it's laid/held, not floating
  ctx2.save();ctx2.translate(X,Y);ctx2.rotate(-.5);
  ctx2.fillStyle='#120c08';ctx2.fillRect(-2,2,5,9);ctx2.fillStyle='#3a2a18';ctx2.fillRect(-1,3,3,7);ctx2.fillStyle='#4e3a24';ctx2.fillRect(-1,3,1,7);   // short wrapped-leather grip, lit on the left
  for(let w=4;w<10;w+=2){ctx2.fillStyle='#241a10';ctx2.fillRect(-1,w,3,1);}   // the wrap seams
  ctx2.fillStyle='#241a12';ctx2.fillRect(-2,10,5,2);ctx2.fillStyle='#3a3228';ctx2.fillRect(-2,10,5,1);   // the pommel cap
  ctx2.fillStyle='#14141a';ctx2.fillRect(-4,1,9,2);ctx2.fillStyle='#2a2a34';ctx2.fillRect(-4,1,9,1);   // the cross-guard
  ctx2.fillStyle='#46586a';ctx2.beginPath();ctx2.moveTo(-3,1);ctx2.lineTo(3,1);ctx2.lineTo(1,-13);ctx2.lineTo(-1,-13);ctx2.closePath();ctx2.fill();   // the blade: one cool steel ramp
  ctx2.fillStyle='#2b3844';ctx2.beginPath();ctx2.moveTo(0,1);ctx2.lineTo(3,1);ctx2.lineTo(1,-13);ctx2.lineTo(0,-13);ctx2.closePath();ctx2.fill();   // the shadow (right) half, purple-leaning
  ctx2.fillStyle='#e8f0f8';ctx2.beginPath();ctx2.moveTo(-3,1);ctx2.lineTo(-2,1);ctx2.lineTo(-1,-13);ctx2.lineTo(-1.7,-13);ctx2.closePath();ctx2.fill();   // a narrow near-white lit edge, TOP-LEFT only
  ctx2.fillStyle='#8fa6b6';ctx2.fillRect(-2,-12,1,12);ctx2.fillStyle='#cdd8e2';ctx2.fillRect(-1,-13,1,3);   // the inner bevel + a glint at the point
  if(glow>0){ctx2.save();ctx2.globalAlpha=Math.min(1,glow)*.8;ctx2.globalCompositeOperation='lighter';
    ctx2.fillStyle='#ff7a22';for(const gy of [-11,-7,-3]){ctx2.fillRect(1,gy,1,2);}   // forge heat in broken patches along the spine (not a clean rust line)
    ctx2.fillStyle='#ffb152';ctx2.fillRect(-1,-13,2,3);ctx2.restore();}   // the tip still glowing hot
  ctx2.restore();}
function hsBook(X,Y,page){   // a ledger laid open: two cream pages, ruled lines of births, one entry on the right page underlined
  const WO=HSP.woodO,W=HSP.wood,P=HSP.pale;hsSh(X,Y+4,21,3.5);
  ctx2.fillStyle=WO;ctx2.fillRect(X-20,Y-14,40,18);ctx2.fillStyle=W[1];ctx2.fillRect(X-19,Y-13,38,16);ctx2.fillStyle=W[2];ctx2.fillRect(X-19,Y-13,38,1);   // the leather cover, lit top
  ctx2.fillStyle=P[1];ctx2.fillRect(X-18,Y-12,17,14);ctx2.fillRect(X+1,Y-12,17,14);ctx2.fillStyle=P[3];ctx2.fillRect(X-18,Y-12,17,1);ctx2.fillRect(X+1,Y-12,17,1);   // two cream pages
  ctx2.fillStyle=WO;ctx2.fillRect(X-1,Y-13,2,16);   // the spine
  ctx2.fillStyle='#b0a584';for(let i=0;i<5;i++){ctx2.fillRect(X-16,Y-9+i*3,13,1);ctx2.fillRect(X+3,Y-9+i*3,13,1);}   // ruled birth-lines
  if(page>0){const yy=Y-9+Math.min(4,Math.floor(page*4))*3;ctx2.fillStyle='#b05438';ctx2.fillRect(X+3,yy-1,13,2);ctx2.fillStyle='#8a2a1e';ctx2.fillRect(X+3,yy+1,13,1);}}   // your entry, underlined in rust
function hsSheriffHat(X,Y,slips){   // a wide-brim hat held at the chest, brim up, full of folded paper slips
  const WO=HSP.woodO,W=HSP.wood,P=HSP.pale;hsSh(X,Y+5,16,4);
  ctx2.fillStyle=WO;ctx2.fillRect(X-15,Y-2,31,6);ctx2.fillStyle=W[0];ctx2.fillRect(X-14,Y-1,29,4);ctx2.fillStyle=W[1];ctx2.fillRect(X-14,Y-1,29,1);   // the felt brim, a lit edge
  ctx2.fillStyle=WO;ctx2.fillRect(X-9,Y-13,19,12);ctx2.fillStyle=W[0];ctx2.fillRect(X-8,Y-12,17,11);ctx2.fillStyle=W[1];ctx2.fillRect(X-8,Y-12,17,2);ctx2.fillStyle='#120c08';ctx2.fillRect(X-8,Y-4,17,2);   // the crown + band
  if(slips>0)for(let i=0;i<11;i++){const px=X-7+(i%6)*3,py=Y-10-((i*7)%4);ctx2.fillStyle=i%3?P[4]:P[3];ctx2.fillRect(px,py,2,3);ctx2.fillStyle=P[2];ctx2.fillRect(px,py+2,2,1);}}   // the folded slips
function hsStove(X,Y,burn){   // a little cast-iron stove, a door of fire; burn>0 flares as slips go in
  const IO=HSP.ironO,I=HSP.iron;hsSh(X,Y+2,11,3);
  ctx2.fillStyle=IO;ctx2.fillRect(X-10,Y-22,20,24);ctx2.fillStyle=I[1];ctx2.fillRect(X-9,Y-21,18,22);ctx2.fillStyle=I[2];ctx2.fillRect(X-9,Y-21,18,3);ctx2.fillStyle=I[3];ctx2.fillRect(X-9,Y-21,18,1);ctx2.fillStyle=I[0];ctx2.fillRect(X+7,Y-21,2,22);   // the iron body, lit top, shaded right
  ctx2.fillStyle=IO;ctx2.fillRect(X-3,Y-29,6,7);ctx2.fillStyle=I[1];ctx2.fillRect(X-2,Y-28,4,6);ctx2.fillStyle=I[2];ctx2.fillRect(X-2,Y-28,1,6);   // the flue
  ctx2.fillStyle=IO;ctx2.fillRect(X-6,Y-14,12,10);ctx2.fillStyle='#c24a16';ctx2.fillRect(X-5,Y-13,10,8);ctx2.fillStyle='#e0601a';ctx2.fillRect(X-5,Y-13,10,5);ctx2.fillStyle='#ffb040';ctx2.fillRect(X-3,Y-11,6,4);ctx2.fillStyle='#fff0a0';ctx2.fillRect(X-1,Y-9,2,2);   // the fire door, hard steps
  if(burn>0){ctx2.save();ctx2.globalAlpha=Math.min(1,burn);ctx2.fillStyle='#ffd867';ctx2.fillRect(X-6,Y-18-burn*8,12,8);ctx2.fillStyle='#ff8c2a';ctx2.fillRect(X-4,Y-16-burn*10,8,6);ctx2.restore();}}
function hsRibbon(X,Y,t){   // Ruth's blue hair ribbon held out, a bow, always damp (a slow drip)
  const C=HSP.cloth,o='#141f36';ctx2.fillStyle=o;ctx2.fillRect(X-7,Y-2,14,5);ctx2.fillStyle=C[1];ctx2.fillRect(X-7,Y-1,14,3);ctx2.fillStyle=C[2];ctx2.fillRect(X-7,Y-1,14,1);   // the band, outlined + lit
  ctx2.fillStyle=o;ctx2.fillRect(X-4,Y-5,8,10);ctx2.fillStyle=C[1];ctx2.fillRect(X-3,Y-4,6,8);ctx2.fillStyle=C[0];ctx2.fillRect(X-6,Y+2,3,5);ctx2.fillRect(X+3,Y+2,3,5);ctx2.fillStyle=C[3];ctx2.fillRect(X-1,Y-4,2,8);   // the bow + tails + a lit knot
  const dy=(t*26)%14;ctx2.fillStyle='#96c3eb';ctx2.fillRect(X,Y+6+dy,1,2);}   // the slow drip
function hsBackTracks(X,Y){   // bare footprints receding up-left into the woods, but every print's TOES point back DOWN at you — a dark foot pressed into a matte mud patch, lit only on its top-left rim
  for(let i=0;i<5;i++){const sc=1.14-i*0.06,cx=X-i*20,cy=Y-i*13;
    // a MATTE mud patch, only a shade above the forest floor (never a bright glowing mound)
    ctx2.fillStyle='#352a1a';ctx2.beginPath();ctx2.ellipse(cx,cy,5.6*sc,9*sc,0,0,6.283);ctx2.fill();
    // the pressed-in foot — the DARKEST shape, with hard edges: heel (far), ball (near), arch, five toes toward you
    ctx2.fillStyle='#120c07';
    ctx2.beginPath();ctx2.ellipse(cx,cy-3*sc,2.6*sc,3.8*sc,0,0,6.283);ctx2.fill();          // heel
    ctx2.beginPath();ctx2.ellipse(cx+0.3*sc,cy+2.4*sc,3.1*sc,2.9*sc,0,0,6.283);ctx2.fill();  // ball
    ctx2.beginPath();ctx2.moveTo(cx-1*sc,cy-3*sc);ctx2.lineTo(cx+1*sc,cy-3*sc);ctx2.lineTo(cx+1.4*sc,cy+3*sc);ctx2.lineTo(cx-1.4*sc,cy+3*sc);ctx2.closePath();ctx2.fill();   // the narrow arch
    for(let k=0;k<5;k++){const tx=cx-3.1*sc+k*1.6*sc,tr=(k===0?1.6:k===4?0.95:1.25)*sc;ctx2.beginPath();ctx2.ellipse(tx,cy+6.2*sc,tr,1.5*sc,0,0,6.283);ctx2.fill();}   // five graduated toes at the NEAR end
    // a single hard-edged lit rim on the TOP-LEFT of the depression (one light step, offset — the raised mud catching light on one side only)
    ctx2.fillStyle='#6a5230';ctx2.beginPath();ctx2.ellipse(cx-2.3*sc,cy-2.5*sc,1.3*sc,4*sc,-0.3,0,6.283);ctx2.fill();
    ctx2.fillStyle='#8a6c40';ctx2.fillRect(Math.round(cx-3*sc),Math.round(cy-5*sc),1,Math.round(5*sc));   // the brightest sliver, top-left
    // a hard dark contact at the bottom-right, so the print sits IN the ground
    ctx2.fillStyle='#0a0704';ctx2.beginPath();ctx2.ellipse(cx+2.6*sc,cy+5.5*sc,2.2*sc,1.3*sc,0,0,6.283);ctx2.fill();}}
function hsHeadstone(X,Y){   // Fergus's headstone — matched to the game's real graveyard headstones: outlined slab, stone ramp, carved cross, moss, a base plinth
  const SO=HSP.stoneO,S=HSP.stone;hsSh(X,Y+3,12,3.5);
  ctx2.fillStyle=SO;ctx2.fillRect(X-10,Y-18,20,19);ctx2.beginPath();ctx2.arc(X,Y-18,10,Math.PI,0);ctx2.fill();                     // the slab outline, rounded top
  ctx2.fillStyle=S[1];ctx2.fillRect(X-8,Y-17,16,17);ctx2.beginPath();ctx2.arc(X,Y-17,8,Math.PI,0);ctx2.fill();                     // the stone face
  ctx2.fillStyle=S[3];ctx2.fillRect(X-8,Y-17,16,3);ctx2.beginPath();ctx2.arc(X,Y-17,8,Math.PI,Math.PI*1.5);ctx2.fill();           // lit top + top-left
  ctx2.fillStyle=S[0];ctx2.fillRect(X+6,Y-15,2,15);                                                                               // shaded right edge
  ctx2.fillStyle=S[0];ctx2.fillRect(X-1,Y-14,2,6);ctx2.fillRect(X-3,Y-12,6,2);                                                     // a carved cross
  ctx2.fillStyle=S[0];ctx2.fillRect(X-5,Y-5,10,1);ctx2.fillRect(X-5,Y-3,7,1);                                                      // two epitaph lines
  ctx2.fillStyle=HSP.moss;ctx2.fillRect(X-7,Y-4,3,3);ctx2.fillRect(X+4,Y-15,2,2);                                                  // moss
  ctx2.fillStyle=SO;ctx2.fillRect(X-11,Y-1,22,3);ctx2.fillStyle=S[1];ctx2.fillRect(X-10,Y,20,1);ctx2.fillStyle='#3a5a2a';ctx2.fillRect(X-9,Y+1,18,2);}   // a base plinth + grass at the foot
function hsAppleHeld(X,Y){ctx2.fillStyle='#4a0e10';ctx2.beginPath();ctx2.arc(X,Y,5,0,6.283);ctx2.fill();   // apple ramp, lit top-left, one outline
  ctx2.fillStyle='#8e1a1a';ctx2.beginPath();ctx2.arc(X,Y,4,0,6.283);ctx2.fill();ctx2.fillStyle='#c23030';ctx2.beginPath();ctx2.arc(X-1,Y-1,2.6,0,6.283);ctx2.fill();ctx2.fillStyle='#e85c5c';ctx2.beginPath();ctx2.arc(X-1.5,Y-1.5,1.2,0,6.283);ctx2.fill();ctx2.fillStyle='#fff0f0';ctx2.fillRect(X-2,Y-2,1,1);
  ctx2.fillStyle='#2a1808';ctx2.fillRect(X,Y-7,1,4);ctx2.fillStyle='#4a7a2a';ctx2.fillRect(X+1,Y-7,3,2);ctx2.fillStyle='#6a9a3a';ctx2.fillRect(X+1,Y-7,2,1);}   // stem + a lit leaf

// ---------- 1. Caitlyn — "Closing time": the store locked at noon, the keys, the man at the window ----------
function hsClosingTime(done){const R=ROOMS.store,ox=R.ox,oz=R.oz;MAEV.on=false;
  const cz=oz+2.66,counter=oz+4.1,you0={x:ox+14,z:oz+6.0},beside={x:ox+15.6,z:cz+.1};
  let sign=0,keys=0,fig=-1,figK=0;const CAM={x:ox+14,z:oz+4.5};
  stage({room:'store',hour:Math.min(Math.max(S.hour,11.5),13),player:{x:you0.x,z:you0.z,dir:'N'},cast:{mae:{x:ox+14,z:cz,dir:'S'}},cam:CAM,lead:700,
    light(L){glowAt(sx(ox+9),sz(oz+2.4)-40,120,[255,186,110],.30);if(fig>=0)glowAt(sx(ox+14),sz(oz+1.5)-24,66,[150,170,190],.2+.12*Math.sin(STG.t*3));},
    props:[{x:ox+14,z:oz+1.5,draw(X,Y,t){   // a window set in the wall behind the counter; the figure rises in it, becomes the Hollow, then is gone
        ctx2.fillStyle='#06060a';ctx2.fillRect(X-20,Y-46,40,42);
        ctx2.fillStyle=fig>=0?'#5c6672':'#161b24';ctx2.fillRect(X-17,Y-43,34,36);ctx2.fillStyle=fig>=0?'#6e7886':'#1e2630';ctx2.fillRect(X-17,Y-43,34,7);   // the pane: dusk sky, moonlit when it is there
        if(fig>=0)drawSpr('hollow',X,Y+8,'walk','S',0,{scale:.32+fig*.14,alpha:Math.min(1,.4+fig)});   // the real Hollow, small and distant in the back window
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
  let open=0,ca=0,pt=0,song=0;const CAM={x:px-2.0,z:pz+1.0};   // framed between Agnes's porch and the well, so the child + well read as the focal
  stage({hour:Math.min(Math.max(S.hour,16),18),player:{x:you.x,z:you.z,dir:'W'},cast:{agnes:{x:agn.x,z:agn.z,dir:'S'}},cam:CAM,lead:700,
    light(L){if(ca>0)glowAt(sx(child.x)+5,sz(child.z)-18,54,[150,160,180],.14*ca);hsVignette(.22);},
    props:[{x:well.x,z:well.z,draw(X,Y){shadow(X,Y,16);drawSpr('well',X,Y);}},
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
      {x:pit.x,z:pit.z+.12,draw(X,Y){drawSpr('g_grave',X,Y);}},   // the real open-grave sprite, drawn just in front of Silas so he stands waist-deep in it
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
    props:[{x:bx,z:bz+.4,draw(X,Y,t){shadow(X,Y+9,30);drawSpr('otto',X,Y-2,'walk','S',0);drawSpr('wk_boat',X,Y+6);}},   // the real rowboat with a contact shadow; Otto sits so the boat's near rim crosses his lap
      {x:bx+.02,z:bz+.5,draw(X,Y,t){if(drop>0&&!cut)hsLine(X+9,Y-8,Math.min(run,VH-Y-8),tug>0?tug:0);}}],
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
      {x:loomAt.x,z:loomAt.z,draw(X,Y){if(loom<=0)return;drawSpr('hollow',X,Y,'walk','S',0,{scale:.85+loom*.5,alpha:Math.min(1,.5+loom*.6)});}}],   // the real Hollow rises behind your shoulder, taller than the room
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
      {x:ox+6,z:tz,draw(X,Y,t){shadow(X,Y,28);drawSpr('in_goodstable',X,Y);const px=X+26,py=Y-26;hsPlate(px,py,eaten);hsCandle(px+14,py+1,lean,1);   // the real laden banquet table (grounded); the player's plate + candle sit ON the table top
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

// ---------- 12. Nell — "The box is finished": the carpentry, a box carved with your house and a figure in the window ----------
function hsNellBox(done){const R=ROOMS.shop_carp||ROOMS.store,ox=R.ox,oz=R.oz;
  const nell={x:ox+5,z:oz+2.5},you={x:ox+5,z:oz+4.6},box={x:ox+5,z:oz+3.55};let show=0;const CAM={x:ox+5,z:oz+3.5};
  stage({room:ROOMS.shop_carp?'shop_carp':'store',hour:Math.min(Math.max(S.hour,10),16),player:{x:you.x,z:you.z,dir:'N'},cast:{nell:{x:nell.x,z:nell.z,dir:'S'}},cam:CAM,lead:750,
    light(L){glowAt(sx(box.x),sz(box.z)-18,34,[255,214,140],.26);hsVignette(.22);},
    props:[{x:box.x,z:box.z,draw(X,Y){if(show>0){ctx2.save();ctx2.globalAlpha=Math.min(1,show);shadow(X,Y,16);drawSpr('in_hopechest',X,Y);ctx2.restore();}}}],   // the real carved hope-chest, grounded
    beats:[
      {hold:.9,face:{nell:'S',you:'N'},act(){stgTitle('Nell — The box is finished');}},
      {who:'nell',text:'It’s done. Oak, dovetailed, lined with felt. Best thing these hands ever made.',expr:'happy',act(){show=.01;},update(dt){show=Math.min(1,show+dt*1.4);}},
      {who:'nell',text:'Thing is — I don’t remember making it. I carved that lid in my sleep. Look what’s on it.',expr:'think',wait:.3},
      {hold:1.6,emote:{you:'?'}},
      {who:'you',text:'That’s… my farmhouse. With someone in the window. Turned away, looking into the house.',expr:'scared'},
      {who:'nell',text:'At something behind them, I’d say. I didn’t carve a face. My hands knew not to.',expr:'wrong'},
      {who:'nell',text:'Take it. I can’t have it on the bench. It watches the shop when my back’s turned. Felt-lined, mind. For keeping something soft.',expr:'sad',wait:.4},
    ],
    done(){done&&done();}});}

// ---------- 13. Hale — "The bell rope": the church, the new rope, and the coil of old rope cut by the Tithe ----------
function hsBellRopeScene(done){const R=ROOMS.church,ox=R.ox,oz=R.oz;
  const hale={x:ox+5.9,z:oz+3.0},you={x:ox+4.2,z:oz+3.6},rope={x:ox+5,z:oz+3.2};const CAM={x:ox+5,z:oz+3.2};
  stage({room:'church',hour:Math.min(Math.max(S.hour,9),17),player:{x:you.x,z:you.z,dir:'N'},cast:{hale:{x:hale.x,z:hale.z,dir:'S'}},cam:{x:CAM.x,z:CAM.z+.4},lead:850,
    light(L){glowAt(sx(ox+5),sz(oz+1.6)-20,90,[255,196,120],.26);hsVignette(.28);},
    props:[{x:rope.x,z:rope.z,draw(X,Y,t){shadow(X,Y,20);drawSpr('wk_bell',X,Y);shadow(X+26,Y+7,9);drawSpr('wk_rope',X+26,Y+6);}}],   // the real bell on its frame, grounded, with one coil of the cut old rope on the floor
    beats:[
      {hold:1.0,face:{hale:'S',you:'N'},act(){stgTitle('Hale — The bell rope');}},
      {who:'hale',text:'This rope is new. White, smooth. I replace it every year. Do you want to know why?',expr:'neutral'},
      {hold:1.2,emote:{you:'…'}},
      {who:'hale',text:'Every Tithe night it wears clean through. Exactly through. I keep the pieces. I don’t know why I keep them.',expr:'sad'},
      {who:'you',text:'There’s a whole coil of them. All cut to a yard. You’ve counted them.',expr:'scared'},
      {who:'hale',text:'A hundred and fifty-three. You’ve been here less than a month. So tell me —',expr:'wrong',wait:.3},
      {who:'hale',text:'— why are you so sure you’ve counted them before?',expr:'scared',wait:.4},
    ],
    done(){done&&done();}});}

// ---------- 14. Gideon — "A blade that remembers": the forge, a knife made from thirty years of Tithe nails ----------
function hsNailBladeScene(done){const R=ROOMS.shop_forge||ROOMS.store,ox=R.ox,oz=R.oz;
  const gid={x:ox+3.4,z:oz+4.0},you={x:ox+5.8,z:oz+4.2},blade={x:ox+5.1,z:oz+3.5};let wrap=0,glow=0;const CAM={x:ox+4.6,z:oz+3.6};
  stage({room:ROOMS.shop_forge?'shop_forge':'store',hour:Math.min(Math.max(S.hour,9),17),player:{x:you.x,z:you.z,dir:'N'},cast:{gideon:{x:gid.x,z:gid.z,dir:'E'}},cam:CAM,lead:800,
    light(L){glowAt(sx(ox+2.2),sz(oz+1.3)-16,70,[255,150,60],.5+.12*Math.sin(STG.t*5));hsVignette(.3);},
    props:[{get x(){return P.x;},get z(){return P.z+.01;},draw(X,Y){if(wrap<=0)return;
        if(wrap<1){ctx2.fillStyle='#3a3630';ctx2.fillRect(X-9,Y-30,18,8);ctx2.fillStyle='#4a463e';ctx2.fillRect(X-9,Y-30,18,2);ctx2.fillStyle='#2a2620';ctx2.fillRect(X-2,Y-31,4,10);return;}   // the oilcloth bundle
        drawSpr('icon32_blade',X,Y-30,'','',0,{scale:.9});   // the real forged blade, held up
        if(glow>0){ctx2.save();ctx2.globalAlpha=Math.min(1,glow)*.5;ctx2.globalCompositeOperation='lighter';ctx2.fillStyle='#ff8a2a';ctx2.fillRect(Math.round(X)-1,Math.round(Y)-42,2,16);ctx2.restore();}}}],   // forge-warm along the blade
    beats:[
      {hold:1.0,face:{gideon:'E',you:'N'},act(){stgTitle('Gideon — A blade that remembers');}},
      {who:'gideon',text:'Made you something. Don’t thank me yet. Here — it’s wrapped in oilcloth for a reason.',expr:'neutral',act(){wrap=.3;},update(dt){wrap=Math.min(.95,wrap+dt*1.5);}},
      {hold:1.0,act(){wrap=1;setTimeout(()=>{glow=1;SFX.till&&SFX.till();},400);},update(dt){if(glow>0)glow=Math.max(.35,glow-dt*.3);}},
      {who:'gideon',text:'Forged from the nails. Every nail ever pulled from the Tithe House door. Thirty years of them, melted down.',expr:'sad'},
      {who:'you',text:'It’s warm. It’s always warm, isn’t it. And it just… moved. In my hand.',expr:'scared'},
      {who:'gideon',text:'Iron remembers. It remembers every hand that was held shut by it. Cut the thing with that and it’ll feel every one of them at once.',expr:'wrong',wait:.3},
      {who:'gideon',text:'Keep it on you. When it points — and it will — don’t argue with it.',expr:'neutral',wait:.4},
    ],
    done(){done&&done();}});}

// ---------- 15. Della — "Your birth": the midwife's book, the page thirty years old, why it wants you ----------
function hsBirthScene(done){const R=ROOMS.home_fenn||ROOMS.store,ox=R.ox,oz=R.oz;
  const del={x:ox+4,z:oz+2.6},you={x:ox+4,z:oz+4.4},book={x:ox+4,z:oz+3.5};let open=0,page=0;const CAM={x:ox+4,z:oz+3.5};
  stage({room:ROOMS.home_fenn?'home_fenn':'store',hour:Math.min(Math.max(S.hour,16),18.4),player:{x:you.x,z:you.z,dir:'N'},cast:{della:{x:del.x,z:del.z,dir:'S'}},cam:CAM,lead:750,
    light(L){glowAt(sx(ox+1),sz(oz+1.1)-30,60,[255,196,120],.3);hsVignette(.22);},
    props:[{x:book.x,z:book.z,draw(X,Y,t){if(open>0){ctx2.save();ctx2.globalAlpha=Math.min(1,open);drawSpr('t_books',X,Y);if(page>0){ctx2.fillStyle='#b05438';ctx2.fillRect(Math.round(X)+1,Math.round(Y)-6+Math.min(4,Math.floor(page*4)),8,1);}ctx2.restore();}}}],   // the real ledger, your entry underlined in rust
    beats:[
      {hold:.9,face:{della:'S',you:'N'},act(){stgTitle('Della — Your birth');}},
      {who:'della',text:'I write down every baby I ever catch. Name, weight, time, and one line about the first cry.',expr:'neutral',act(){open=.01;},update(dt){open=Math.min(1,open+dt*1.4);}},
      {who:'della',text:'Let me turn to a page thirty years old. There. Read your own first cry.',expr:'think',act(){page=.01;},update(dt){page=Math.min(1,page+dt*.7);}},
      {hold:1.4,emote:{you:'!'}},
      {who:'you',text:'“Loud. Very loud. Angry at the whole valley.” …This is me. I was born here?',expr:'scared'},
      {who:'della',text:'Your mother was visiting Elias. You came early. You were born in this valley, child. One of ours.',expr:'sad'},
      {who:'della',text:'That’s why it wants you. And that’s why it can’t have you without a fight. I’ve seen how you cry.',expr:'neutral',wait:.4},
    ],
    done(){done&&done();}});}

// ---------- 16. Dunn — "His own name": the hat full of your name, burned, and one slip he writes instead ----------
function hsDunnSlips(done){const R=ROOMS.home_dunn||ROOMS.store,ox=R.ox,oz=R.oz;
  const dunn={x:ox+3.4,z:oz+3.0},you={x:ox+3.4,z:oz+4.6},stove={x:ox+6.2,z:oz+3.0};let hat=0,burn=0,slip=0;const CAM={x:ox+4.4,z:oz+3.4};
  stage({room:ROOMS.home_dunn?'home_dunn':'store',hour:Math.min(Math.max(S.hour,17),19),player:{x:you.x,z:you.z,dir:'N'},cast:{dunn:{x:dunn.x,z:dunn.z,dir:'S'}},cam:CAM,lead:800,
    light(L){glowAt(sx(stove.x),sz(stove.z)-14,40,[255,150,60],.3+(burn>0?.3*burn:0));hsVignette(.3);},
    props:[{get x(){const n=npcById('dunn');return n?n.x:dunn.x;},get z(){const n=npcById('dunn');return (n?n.z:dunn.z)+.01;},draw(X,Y){if(hat>0){ctx2.save();ctx2.globalAlpha=Math.min(1,hat);hsSheriffHat(X,Y-20,slip<2?1:0);ctx2.restore();}}},
      {x:stove.x,z:stove.z,draw(X,Y,t){shadow(X,Y,13);drawSpr('in_stove',X,Y);if(burn>0){ctx2.save();ctx2.globalAlpha=Math.min(1,burn);ctx2.fillStyle='#ffd867';ctx2.fillRect(Math.round(X)-6,Math.round(Y)-34-burn*8,12,8);ctx2.fillStyle='#ff8c2a';ctx2.fillRect(Math.round(X)-4,Math.round(Y)-32-burn*10,8,6);ctx2.restore();}}}],   // the real cast-iron stove; the slips flare up the flue as they burn
    tick(dt){if(burn>0)burn=Math.max(0,burn-dt*.7);},
    beats:[
      {hold:.9,face:{dunn:'S',you:'N'},act(){stgTitle('Dunn — His own name');}},
      {who:'dunn',text:'Came to show you the hat before the drawing. Go on. Every slip in it. Read a few.',expr:'sad',act(){hat=.01;},update(dt){hat=Math.min(1,hat+dt*1.3);}},
      {hold:1.4,emote:{you:'!'}},
      {who:'you',text:'They all say my name. Every one. In your handwriting.',expr:'scared'},
      {who:'dunn',text:'Sixty of them. I write them myself, every year. Watch.',expr:'neutral',act(){burn=1;slip=1;SFX.till&&SFX.till();}},
      {hold:1.8,who:'dunn',text:'There. Your name, burning. Now I write one more, and I don’t show you whose it is. You don’t need telling.',expr:'wrong',act(){slip=2;}},
      {who:'dunn',text:'Look after my boy. And don’t you let it wear me — I’d hate to come up your lane next year with a smile on.',expr:'sad',wait:.4},
    ],
    done(){done&&done();}});}

// ---------- 17. Agnes — "Let her go": Ruth's ribbon, always damp, to burn at the stones so she can leave ----------
function hsRibbonScene(done){const px=-46,pz=-8.6;
  const agn={x:px,z:pz-.3},you={x:px+1.4,z:pz+1.1};let rib=0;const CAM={x:px+.6,z:pz+.4};
  stage({hour:Math.min(Math.max(S.hour,16),18),player:{x:you.x,z:you.z,dir:'W'},cast:{agnes:{x:agn.x,z:agn.z,dir:'S'}},cam:CAM,lead:700,
    light(L){hsVignette(.22);},
    props:[{x:0,z:9e5,draw(){}},
      {get x(){return (P.x+agn.x)/2;},get z(){return (P.z+agn.z)/2+.01;},draw(X,Y,t){if(rib>0){ctx2.save();ctx2.globalAlpha=Math.min(1,rib);hsRibbon(X,Y-26,t);ctx2.restore();}}}],
    beats:[
      {hold:.9,face:{agnes:'S',you:'W'},act(){stgTitle('Agnes — Let her go');}},
      {who:'agnes',text:'I want you to do something I can’t. Here. Ruth’s ribbon. Mind — it’s damp.',expr:'sad',act(){rib=.01;},update(dt){rib=Math.min(1,rib+dt*1.3);}},
      {who:'you',text:'It’s been in a drawer thirty-seven years. How is it still wet?',expr:'scared'},
      {who:'agnes',text:'It always is. When you light the stones, burn this in the flame. She’ll be able to leave.',expr:'cry'},
      {who:'agnes',text:'She’ll leave me too. I know that. Don’t tell me when you do it. Let me keep thinking she’s at the window a little longer.',expr:'sad',wait:.4},
    ],
    done(){done&&done();}});}

// ---------- 18. Moss — "The wrong tracks": small bare footprints at the woods' edge, walking backwards ----------
function hsBackTracksScene(done){const mx=96,mz=30;
  const moss={x:mx+.9,z:mz+.3},you={x:mx-.9,z:mz+.4},tr={x:mx+.6,z:mz-.2};let show=0;const CAM={x:mx,z:mz+.2};
  stage({hour:Math.min(Math.max(S.hour,9),16),player:{x:you.x,z:you.z,dir:'N'},cast:{moss:{x:moss.x,z:moss.z,dir:'W'}},cam:CAM,lead:800,
    light(L){glowAt(VW*.5,VH*.4,Math.max(VW,VH)*.6,[26,24,34],.3);hsVignette(.3);},
    props:[{x:tr.x,z:tr.z,draw(X,Y){if(show>0){ctx2.save();ctx2.globalAlpha=Math.min(1,show);hsBackTracks(X,Y+6);ctx2.restore();}}}],
    beats:[
      {hold:1.0,face:{moss:'W',you:'N'},act(){stgTitle('Moss — The wrong tracks');}},
      {who:'moss',text:'Here. In the mud. Every October I find them at the edge of the trees.',expr:'neutral',act(){show=.01;},update(dt){show=Math.min(1,show+dt*1.2);}},
      {hold:1.2,emote:{you:'?'}},
      {who:'you',text:'Bare feet. Small. But the toes point this way — like whoever it was walked backwards, into the woods.',expr:'scared'},
      {who:'moss',text:'Never find what makes them. Never find where they start. This set’s new. This year.',expr:'wrong'},
      {who:'moss',text:'Your size, about. A bit smaller. I’d keep to the lit paths, if I were you.',expr:'sad',wait:.4},
    ],
    done(){done&&done();}});}

// ---------- 19. Orla — "The husband tree": the oldest tree in the orchard, where Fergus is buried ----------
function hsHusbandTree(done){const tx=46,tz=58;
  const orla={x:tx+1.1,z:tz+.4},you={x:tx-1.2,z:tz+.6},grave={x:tx,z:tz-.6};let ap=0;const CAM={x:tx,z:tz+.3};
  stage({hour:Math.min(Math.max(S.hour,10),16),player:{x:you.x,z:you.z,dir:'E'},cast:{orla:{x:orla.x,z:orla.z,dir:'W'}},cam:CAM,lead:800,
    light(L){hsVignette(.2);},
    props:[{x:grave.x,z:grave.z,draw(X,Y){shadow(X,Y,12);drawSpr('grave_0',X,Y);}},
      {get x(){const n=npcById('orla');return n?n.x:orla.x;},get z(){const n=npcById('orla');return (n?n.z:orla.z)+.01;},draw(X,Y){if(ap>0){ctx2.save();ctx2.globalAlpha=Math.min(1,ap);hsAppleHeld(X-6,Y-20);ctx2.restore();}}}],
    beats:[
      {hold:1.0,face:{orla:'W',you:'E'},act(){stgTitle('Orla — The husband tree');}},
      {who:'orla',text:'Fergus. My husband. He planted every tree in this orchard with his own hands.',expr:'sad'},
      {who:'orla',text:'Then the year he was drawn, he planted himself. Asked to be buried right here, under the oldest one.',expr:'cry'},
      {who:'orla',text:'It gives the sweetest apples in the valley. See?',expr:'neutral',act(){ap=.01;},update(dt){ap=Math.min(1,ap+dt*1.3);}},
      {hold:1.2},
      {who:'orla',text:'Thirty years. I’ve never once eaten one. I pick them, and I hold them, and I put them back.',expr:'sad',wait:.4},
    ],
    done(){done&&done();}});}

// ---------- route the iconic heart events to their staged versions; everything else still plays via stgGeneric ----------
const HS_SCENES={
  'mae|Closing time':hsClosingTime,'agnes|The music box, played':hsMusicBoxScene,'silas|The fresh hole':hsFreshHole,
  'otto|The lake below the pond':hsLakeBelow,'cora|The countdown':hsCountdown,'june|The route':hsRoute,
  'mae|Danny’s last letter':hsDannyLetter,'corwin|The far shore':hsFarShoreScene,
  'ada|What stands behind you':hsBehindYou,'hob|Who eats it':hsTheGuest,
  'nell|The box is finished':hsNellBox,'hale|The bell rope':hsBellRopeScene,
  'gideon|A blade that remembers':hsNailBladeScene,'della|Your birth':hsBirthScene,
  'dunn|His own name':hsDunnSlips,'agnes|Let her go':hsRibbonScene,
  'moss|The wrong tracks':hsBackTracksScene,'orla|The husband tree':hsHusbandTree};
{const _ps=playScene;playScene=function(id,title,html,done){
  const fn=HS_SCENES[id+'|'+title];
  if(fn&&!STG&&S.mode==='play'&&!S.paused&&typeof stage==='function')return fn(done);
  return _ps(id,title,html,done);};}
window.__hs=HS_SCENES;
