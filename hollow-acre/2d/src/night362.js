/* ================= t362: real night (owner: "I want the darkness to be basically you cant see in night what isn't being lit up by
   your flashlight", then: "it has to be realistic though, like it's dark and it feels natural for it to be that way").
   In full night outdoors, and down the mine, what no light reaches is moonlit only: a faint cold grade of the world, its colour
   mostly gone and shifted blue, soft and low in contrast (the way eyes see by moonlight), so you make out big shapes (the road's edge,
   the tree line, roofs, your cabin) and no detail. The moon waxes and wanes over the month, overcast nights are darker, storm nights
   all but black, and the mine has no moon at all. What a light reaches keeps its real colours, warmed by it.
   Your lantern's light falls off like a flame's: bright close, quickly dimmer, a long faint tail, amber, deeper amber as it fades.
   Houses, walls, trees, the car, the wreck, the well and fences near you throw their shadows away from it (the far side of a house
   stays dark). With the hood or Dunn's flashlight a long lobe reaches the way you face. The real lights light their own spot: street
   lamps a warm pool on the ground under each and the walls near them (the dead ones flicker), lit windows a warm patch on the ground
   in front, fires, altars, mushrooms, the crossroads, the phone booth, your friends' lanterns, the townsfolk's red eyes, the Hollow's.
   The eyes adjust: out of a lit house, out from under a lamp, or when the lantern dies, the dark is darker at first and eases over a
   few seconds. Dusk and dawn ramp as before; the deep dark comes with full night. Rooms keep their own light, the mine excepted.
   Cursors, names, bubbles and the fishing gauge are drawn after the light, over the dark, so they stay readable.
   Cheap enough for phones: the moonlit grade is made at half size with three canvas operations, the lantern's shadows are a few
   polygons a frame from a list of nearby shapes refreshed only when you move; no pixel loops. ================= */
const NIGHT={dk:0,ad:.6,room:null,occ:null,occAt:null,occT:0,moon:0,car:null};
// how deep the night is right now: 0 by day and through dusk, rising as nightK goes from .5 to 1 (19.3 h to 20.2 h; back out from
// 5.0 h to 5.8 h), 1 in full night outdoors and always in the mine; 0 in every other room and on the title
function nightDeep(dt){let k=0;
  if(S.mode!=='title'&&!(S.room&&S.room!=='mine')){if(S.room==='mine')k=1;else{const u=clamp((nightK-.5)/.5,0,1);k=u*u*(3-2*u);}}
  dt=Math.min(.1,dt||0);
  // the eyes: how used to the dark they are (0 just out of the light, 1 fully adjusted). A lit room, a lamp or a lit window close by
  // and your own lantern all hold them back; they adjust slowly (a few seconds) and lose it quickly
  let tg=(LI_ON?liPowered():S.fuel>0)?(LI_ON&&liCur()==='flash'?.7:.55):1;   /* (t364) a narrow beam leaves your eyes more used to the dark */const lit=S.room&&S.room!=='mine';
  if(!S.room&&k>0){for(const l of lamps){if(!l.dead&&Math.abs(l.x-P.x)<3.4&&Math.abs(l.z-P.z)<3.4&&Math.hypot(l.x-P.x,l.z-P.z)<3.2){tg=Math.min(tg,.18);break;}}
    if(tg>.3)for(const h of HOUSES){if(h.lit&&Math.abs(h.x-P.x)<(h.w||6)/2+1.5&&P.z>h.z-.5&&P.z<h.z+3){tg=Math.min(tg,.32);break;}}}
  if(lit)tg=0;
  if(NIGHT.room&&!S.room&&NIGHT.room!=='mine')NIGHT.ad=Math.min(NIGHT.ad,.04);   // out of a lit house into the night
  NIGHT.room=S.room||null;
  NIGHT.ad+=(tg-NIGHT.ad)*Math.min(1,dt*(tg>NIGHT.ad?.62:3.2));
  return NIGHT.dk=k;}
// the ambient under the lights sinks to nothing in full night: what is seen outside the lights is the moonlit grade below
function nightAmb(amb,DK){return [amb[0]*(1-DK),amb[1]*(1-DK),amb[2]*(1-DK)];}
// the moon: a 28-day cycle on the calendar's month (full on the 14th, new at the month's turn), dimmer under cloud, nearly gone in a storm
function nightMoonLevel(){if(S.room==='mine')return 0;let dom=14;try{if(typeof dayOfMonth==='function')dom=dayOfMonth();}catch(e){}
  const ph=(1-Math.cos(dom/28*Math.PI*2))/2;let w=1;try{if(S.storm)w=.1;else if(typeof rainDay==='function'&&rainDay(S.day))w=.42;}catch(e){}
  return .12*(.55+.45*ph)*w*(.5+.95*NIGHT.ad*NIGHT.ad);}   // eyes used to the dark (the lantern dry) see half again as much
// the moonlit grade, made from the frame before the lights are applied: quarter size (soft, no surface detail), its colour mostly
// replaced by a cold blue at its own brightness, squared (the dark ground falls away, pale walls, roofs and paths stay as shapes),
// then dimmed to the moon's level; added back over the lit frame afterwards
const moonC=document.createElement('canvas'),mctx=moonC.getContext('2d'),moonT=document.createElement('canvas'),mtx=moonT.getContext('2d');
function nightMoonGrab(DK){const m=NIGHT.moon=nightMoonLevel();if(!(m>.002)||DK<=0)return;
  const w=Math.max(1,Math.ceil(VW/4)),h=Math.max(1,Math.ceil(VH/4));if(moonC.width!==w||moonC.height!==h){moonC.width=moonT.width=w;moonC.height=moonT.height=h;}
  mctx.globalAlpha=1;mctx.globalCompositeOperation='source-over';mctx.imageSmoothingEnabled=true;mctx.drawImage(view,0,0,VW,VH,0,0,w,h);
  mctx.globalCompositeOperation='color';mctx.fillStyle='rgba(112,134,190,.86)';mctx.fillRect(0,0,w,h);   // the Purkinje shift: blue, little colour
  mtx.globalCompositeOperation='copy';mtx.drawImage(moonC,0,0);mctx.globalCompositeOperation='multiply';mctx.drawImage(moonT,0,0);   // squared: more contrast, so only the big pale shapes survive
  const g=Math.round(255*m);mctx.globalCompositeOperation='multiply';mctx.fillStyle=`rgb(${g},${g},${Math.min(255,Math.round(g*1.08))})`;mctx.fillRect(0,0,w,h);
  const f=Math.round(m*10);if(f>0){mctx.globalCompositeOperation='lighter';mctx.fillStyle=`rgb(${Math.round(f*.35)},${Math.round(f*.5)},${f})`;mctx.fillRect(0,0,w,h);}   // never quite crushed black
  mctx.globalCompositeOperation='source-over';}
function nightMoonAdd(DK){const b=NIGHT.bloom;NIGHT.bloom=null;
  // the flame's own warmth over what it lights: a faint amber haze close round the lantern, so the grass in its light reads warm, not green
  if(b&&b.k>0){ctx2.save();ctx2.globalCompositeOperation='screen';ctx2.translate(b.x,b.y);ctx2.scale(1,.8);const gr=ctx2.createRadialGradient(0,0,0,0,0,b.r);
    gr.addColorStop(0,`rgba(255,150,60,${(.16*b.k).toFixed(3)})`);gr.addColorStop(.45,`rgba(255,130,46,${(.07*b.k).toFixed(3)})`);gr.addColorStop(1,'rgba(255,120,40,0)');ctx2.fillStyle=gr;ctx2.fillRect(-b.r,-b.r,b.r*2,b.r*2);ctx2.restore();}
  if(!(NIGHT.moon>.002)||DK<=0)return;ctx2.save();ctx2.globalCompositeOperation='lighter';ctx2.globalAlpha=DK;ctx2.imageSmoothingEnabled=true;
  ctx2.drawImage(moonC,0,0,moonC.width,moonC.height,0,0,VW,VH);ctx2.restore();}

// ---- light that falls off like a real flame's: the stops of an inverse-square fall, eased to nothing at the rim so there is no edge;
// the colour deepens toward amber as it fades
const NIGHT_FALL=[[0,1],[.05,.95],[.1,.85],[.17,.68],[.25,.5],[.33,.36],[.42,.24],[.5,.16],[.6,.095],[.7,.055],[.8,.03],[.9,.012],[1,0]];
const NIGHT_LCOL=[[0,[255,206,140]],[.13,[255,172,92]],[.38,[255,140,60]],[.7,[224,108,42]],[1,[188,84,32]]];   // a lantern flame, ~1900 K: amber, deeper as it fades
const NIGHT_ICOL=[[0,[255,220,170]],[.3,[255,198,134]],[.7,[248,170,104]],[1,[220,140,84]]];                       // an incandescent bulb, warmer than daylight
const nightColAt=(C,u)=>{let i=1;while(i<C.length-1&&C[i][0]<u)i++;const a=C[i-1],b=C[i],k=clamp((u-a[0])/(b[0]-a[0]),0,1);return [0,1,2].map(j=>Math.round(a[1][j]+(b[1][j]-a[1][j])*k));};
const NIGHT_GSTOPS={};
function nightStops(C){const k=C===NIGHT_ICOL?'i':C===NIGHT_LCOL?'l':(typeof LI_WCOL!=='undefined'&&C===LI_WCOL)?'w':'f';if(NIGHT_GSTOPS[k])return NIGHT_GSTOPS[k];return NIGHT_GSTOPS[k]=NIGHT_FALL.map(([u,f])=>[u,f,nightColAt(C,u)]);}
// a pool of light on the ground (an ellipse: the ground is seen at an angle) into the light map or another layer
function nightPool(g,x,y,r,a,C,squash){if(!(a>0)||!(r>1))return;g.save();g.translate(x,y);g.scale(1,squash||.78);const gr=g.createRadialGradient(0,0,0,0,0,r);
  for(const [u,f,c] of nightStops(C||NIGHT_LCOL))gr.addColorStop(u,`rgba(${c[0]},${c[1]},${c[2]},${Math.min(1,f*a).toFixed(3)})`);
  g.fillStyle=gr;g.fillRect(-r,-r,r*2,r*2);g.restore();}
function nightLanternCol(){return [255,200,138];}
// friends' pools and any other lantern pool drawn with the night's flag use the same falloff
{const _lp=lanternPool;lanternPool=function(x,y,r,col,a,dk){if(!(dk>0))return _lp.apply(this,arguments);nightPool(lctx,x,y,r*1.08,a*dk,NIGHT_LCOL);if(dk<1)_lp.call(this,x,y,r,col,a*(1-dk));};}

// ---- your lantern in the dark, with shadows: drawn on its own layer, the shapes near you cut out of it, then added to the light map
const lanternC=document.createElement('canvas'),nlx=lanternC.getContext('2d');
// what can throw a shadow, near where you stand: footprints of buildings, walls, the car, the wreck, the well, the booth; tree trunks;
// fence runs. Gathered again only when you've moved a little or now and then
function nightOccluders(){const now=performance.now();const a=NIGHT.occAt;
  if(NIGHT.occ&&a&&a.room===(S.room||'')&&Math.hypot(a.x-P.x,a.z-P.z)<.6&&now-NIGHT.occT<1200)return NIGHT.occ;
  const out=[],R=10.5;const src=typeof objView==='function'?objView(260):OBJ;
  for(const o of src){if(o.hide||o.room||!o.spr||typeof o.spr!=='string')continue;const dx=o.x-P.x,dz=o.z-P.z;if(dx*dx+dz*dz>R*R*1.6)continue;const K=o.kind,m=SPR[o.spr];if(!m)continue;
    if(K==='tree'||K==='pine'){const f=m.foot||[0,0,0,0];const r=Math.max(.2,Math.min(.5,((f[2]-f[0])||.5)/2));out.push({t:'c',x:o.x,z:o.z,r,o,m,long:1});continue;}
    if(K==='fence'){if(/_h$/.test(o.spr)){const w=m.fw/PPM;out.push({t:'s',x0:o.x,z0:o.z,x1:o.x+w,z1:o.z,o,m});}else if(/_v$/.test(o.spr))out.push({t:'s',x0:o.x,z0:o.z-1,x1:o.x,z1:o.z,o,m});continue;}
    if(['anim','flat','deco','deco2','grass','plant','bush','corn','lamp','cow'].includes(K))continue;
    const f=m.foot;if(!f)continue;let x0=f[0],x1=f[2];if(o.flip){x0=-f[2];x1=-f[0];}const w=x1-x0,d=f[3]-f[1];if(w*d<.6&&!(K==='wall'||K==='booth'))continue;
    const tall=K==='bld'||K==='wall'||K==='booth'||K==='wreck'||m.fh>60;out.push({t:'r',x0:o.x+x0,z0:o.z+f[1],x1:o.x+x1,z1:o.z+f[3],o,m,long:tall?1:0,bld:K==='bld'});}
  NIGHT.occ=out;NIGHT.occAt={x:P.x,z:P.z,room:S.room||''};NIGHT.occT=now;return out;}
// one shadow quad: from the edge p..q away from the light at (lx,lz), len metres (in screen pixels on the light map)
function nightQuad(g,lx,lz,ax,az,bx,bz,len){let ux=ax-lx,uz=az-lz,ul=Math.hypot(ux,uz)||1,vx=bx-lx,vz=bz-lz,vl=Math.hypot(vx,vz)||1;
  g.moveTo(sx(ax),sz(az));g.lineTo(sx(bx),sz(bz));g.lineTo(sx(bx+vx/vl*len),sz(bz+vz/vl*len));g.lineTo(sx(ax+ux/ul*len),sz(az+uz/ul*len));g.closePath();}
// (t365) the hood's own shadow: the ground behind you (the side the tin is on) darker, cut from the lantern's light on its own layer
function nightHoodShade(g,lp){const m=Math.hypot(P.fx,P.fz*.82)||1,bx=-P.fx/m,by=-P.fz*.82/m,x0=lp.gx-bx*4,y0=lp.gy-by*4,L=90;
  const gr=g.createLinearGradient(x0,y0,x0+bx*L,y0+by*L);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.35,'rgba(0,0,0,.3)');gr.addColorStop(.7,'rgba(0,0,0,.6)');gr.addColorStop(1,'rgba(0,0,0,.74)');
  g.save();g.globalCompositeOperation='destination-out';g.fillStyle=gr;g.fillRect(0,0,g.canvas.width,g.canvas.height);g.restore();}
function nightLantern(lp,a,fk,DK,o){if(!(a>0))return;const k=a*DK;o=o||{};const beam=!!o.beam,walt=!!o.walt;   /* (t364) which light: o.walt (Walt's lantern), o.beam (the flashlight) */
  const hood=LI_ON?liHoodOn():!!S.flashlight,R=(hood?8:10)*(walt?1.16:1)*PPM*(.985+.015*fk),cx=lp.gx+P.fx*(hood?2.2:.4)*PPM,cy=lp.gy+P.fz*(hood?1.8:.32)*PPM;   /* (t365) with the hood the pool is pushed ahead of you: ahead brighter, behind darker */
  const draw=beam?(gg)=>{liBeamDraw(gg,lp.x,lp.y,P.fx,P.fz,k);}:(gg)=>{nightPool(gg,cx,cy,R,(walt?1.24:1.15)*k,walt?LI_WCOL:NIGHT_LCOL);if(hood){nightLobe(gg,lp.gx,lp.gy,P.fx,P.fz,k);nightHoodShade(gg,lp);nightPool(gg,lp.gx,lp.gy-12,1.6*PPM,.5*k,NIGHT_LCOL,1.2);}};   /* (and a little light back off the ground ahead onto you, so the hood never hides you) */
  NIGHT.bloom=beam?null:{x:cx,y:cy,r:(walt?4.6:4.2)*PPM,k:Math.min(1,k)};
  // the shadows: the light is the lantern at your hip, a little off your feet. First what throws one, then (only if anything does)
  // the lantern is drawn on its own layer, within the box it lights, the shadows cut out of it, and added to the light map
  const h=LANTERN_HIP[P.dir]||LANTERN_HIP.S,lx=beam?P.x+(lp.x-sx(P.x))/PPM:P.x+h[0]/PPM,lz=beam?P.z+.05+P.fz*.25:P.z+.05;const occ=nightOccluders();const reach=beam?12.5:hood?12:10;   /* the shadows fall from where the light really is: the lantern at your hip, the flashlight in your hand */
  const long=[],low=[],restore=[],cutBox=[];
  for(const q of occ){
    if(q.t==='r'&&q.long){if(lx>q.x0-.1&&lx<q.x1+.1&&lz>q.z0-.1&&lz<q.z1+.1)continue;const cxq=clamp(lx,q.x0,q.x1),czq=clamp(lz,q.z0,q.z1);if(Math.hypot(cxq-lx,czq-lz)>reach)continue;
      long.push(q);if(lz>=q.z1-.15)restore.push(q);else if(q.bld&&lz<q.z0)cutBox.push(q);continue;}
    // the low things (fences, crates, the woodpile) and tree trunks: a shorter shadow that fades out. A trunk's shadow is only thrown on
    // the ground toward you or to the side; one behind its tree is hidden by its own crown (and a long one would stripe the crowns beyond)
    let ax,az,bx,bz;
    if(q.t==='c'){const dx=q.x-lx,dz=q.z-lz,d=Math.hypot(dx,dz);if(d<=q.r+.2||d>7.5||lz>q.z+.35)continue;const r=Math.min(.24,q.r),px=-dz/d*r,pz=dx/d*r;ax=q.x+px;az=q.z+pz;bx=q.x-px;bz=q.z-pz;}
    else if(q.t==='s'){ax=q.x0;az=q.z0;bx=q.x1;bz=q.z1;}else if(q.t==='r'){if(lx>q.x0-.1&&lx<q.x1+.1&&lz>q.z0-.1&&lz<q.z1+.1)continue;
      // the edge facing away from the light is enough for something low
      if(Math.abs(lz-(q.z0+q.z1)/2)>Math.abs(lx-(q.x0+q.x1)/2)){const zz=lz>q.z1?q.z0:q.z1;ax=q.x0;az=zz;bx=q.x1;bz=zz;}else{const xx=lx>q.x1?q.x0:q.x1;ax=xx;az=q.z0;bx=xx;bz=q.z1;}}else continue;
    const mx=(ax+bx)/2,mz=(az+bz)/2,d=Math.hypot(mx-lx,mz-lz);if(d<.35||d>8)continue;low.push([q,ax,az,bx,bz,mx,mz,d]);}
  if(!long.length&&!low.length&&!(hood&&!beam)){draw(lctx);return;}   // nothing near enough to throw a shadow: straight into the light map (the hood's shade is cut from its own layer)
  const RB=beam?12.6*PPM:hood?12*PPM:R;const x0=Math.max(0,Math.floor(cx-RB)),y0=Math.max(0,Math.floor(cy-RB*.8)),x1=Math.min(VW,Math.ceil(cx+RB)),y1=Math.min(VH,Math.ceil(cy+RB*.8));
  if(x1<=x0||y1<=y0)return;
  if(lanternC.width!==VW||lanternC.height!==VH){lanternC.width=VW;lanternC.height=VH;}
  const g=nlx;g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(x0,y0,x1-x0,y1-y0);draw(g);
  g.globalCompositeOperation='destination-out';
  if(long.length){g.fillStyle='rgba(0,0,0,.88)';g.beginPath();
    for(const q of long){if(lz>q.z0)nightQuad(g,lx,lz,q.x0,q.z0,q.x1,q.z0,reach*1.5);if(lz<q.z1)nightQuad(g,lx,lz,q.x1,q.z1,q.x0,q.z1,reach*1.5);
      if(lx>q.x0)nightQuad(g,lx,lz,q.x0,q.z1,q.x0,q.z0,reach*1.5);if(lx<q.x1)nightQuad(g,lx,lz,q.x1,q.z0,q.x1,q.z1,reach*1.5);}
    g.fill();}
  for(const [q,ax,az,bx,bz,mx,mz,d] of low){const len=Math.min(3.2,.8+d*.55),ux=(mx-lx)/d,uz=(mz-lz)/d;const gr=g.createLinearGradient(sx(mx),sz(mz),sx(mx+ux*len),sz(mz+uz*len));const al=q.t==='s'?.5:q.t==='c'?.62:.72;
    gr.addColorStop(0,`rgba(0,0,0,${al})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();nightQuad(g,lx,lz,ax,az,bx,bz,len);g.fill();}
  // the faces turned toward you keep their light (a house's front wall); a house you stand behind shows you its dark side
  if(restore.length||cutBox.length){const box=q=>{const m=q.m,X=sx(q.o.x),Y=sz(q.o.z),ax=q.o.flip?m.fw-m.ax:m.ax;return [Math.round(X-ax),Math.round(Y-m.ay),m.fw,Math.max(0,Math.round(m.ay)+2)];};
    if(cutBox.length){g.fillStyle='rgba(0,0,0,.8)';for(const q of cutBox){const b=box(q);g.fillRect(b[0],b[1],b[2],b[3]);}}
    if(restore.length){g.save();g.beginPath();for(const q of restore){const b=box(q);g.rect(b[0],b[1],b[2],b[3]);}g.clip();g.globalCompositeOperation='source-over';g.clearRect(x0,y0,x1-x0,y1-y0);draw(g);g.restore();}}
  g.globalCompositeOperation='source-over';
  lctx.save();lctx.globalCompositeOperation='lighter';lctx.drawImage(lanternC,x0,y0,x1-x0,y1-y0,x0,y0,x1-x0,y1-y0);lctx.restore();}
// the hood's beam: a long soft lobe from your feet the way you face, reaching 11 m (its reach against the Hollow), narrower than long
function nightLobe(g,gx,gy,fx,fz,a){if(!(a>0))return;const m=Math.hypot(fx,fz)||1;fx/=m;fz/=m;
  const sl=Math.hypot(fx,fz*.78)||1,ang=Math.atan2(fz*.78,fx);const len=6*PPM*sl+1.8*PPM*(1-sl),wid=2.6*PPM,cx=gx+fx*5*PPM,cy=gy+fz*5*PPM*.78;
  g.save();g.translate(cx,cy);g.rotate(ang);g.scale(len/wid,1);nightPool(g,0,0,wid,.62*a,NIGHT_LCOL,1);g.restore();}
// a street lamp in the dark: a warm pool on the ground under it, a halo that catches the walls near it, the bulb
function nightLamp(X,footY,bulbY,a){nightPool(lctx,X,footY-4,3.6*PPM,.95*a,NIGHT_ICOL,.7);glowAt(X,bulbY+8,70,[255,190,126],.3*a);glowAt(X,bulbY,14,[255,236,190],.9*a);}
// a lit window throws a warm patch on the ground in front of it
function nightWindow(X,footY,a){nightPool(lctx,X,footY+14,1.5*PPM,.5*a,NIGHT_ICOL,.55);}

// ---- after the light: what is a cursor, a name or a bubble is drawn over the dark, never in it
const NIGHT_UIQ=[];
function nightUIBegin(){NIGHT_UIQ.length=0;}
function nightUI(fn){if(nightK>.25)NIGHT_UIQ.push(fn);else fn();}
function nightUIFlush(){if(!NIGHT_UIQ.length)return;const q=NIGHT_UIQ.splice(0);
  for(const f of q){ctx2.save();ctx2.globalAlpha=1;ctx2.globalCompositeOperation='source-over';try{f();}catch(e){}ctx2.restore();}}
// the placing ghost, the build grid: drawn over the dark so you can see where it goes
{const _pd=placeDraw;placeDraw=function(){const a=arguments;nightUI(()=>_pd.apply(this,a));};}

// ---- the lights that light their own spot
{const _ll=lifeLight;lifeLight=function(t,L){const r=_ll.apply(this,arguments);try{if(L<.15)return r;
  const out=!S.room,mine=S.room==='mine';
  // the phone booth's tube, always on after dark: a cold small light on the corner
  if(out&&typeof boothPos!=='undefined'){const X=sx(boothPos.x),Y=sz(boothPos.z+.5);if(X>-80&&X<VW+80&&Y>-40&&Y<VH+120){const f=.94+.06*Math.sin(t*31)*Math.sin(t*7);
    glowAt(X,Y-34,40,[196,218,255],.62*L*f);glowAt(X,Y+2,34,[176,200,240],.3*L*f);}}
  // the Hollow, held in your light: the lantern catches all of it, not just the ground at its feet (left in the dark, only its eyes show)
  if(H.vis&&H.lit&&NIGHT.dk>0&&(out||mine)){const d=Math.hypot(P.x-H.x,P.z-H.z),rg=LI_ON?liRange():S.flashlight?11:8.5,k=clamp(1.3-d/rg,.35,1)*NIGHT.dk*H.alpha,X=sx(H.x),Y=sz(H.z)+(1-H.rise)*40;
    const c=LI_ON&&liCur()==='flash'?[214,226,252]:nightLanternCol(NIGHT.dk);glowAt(X,Y-34,46,c,.5*k);glowAt(X,Y-96,62,c,.42*k);}
  // the Tithe House's cold lamp throws its light down the door and onto the trodden ground in front
  if(out&&typeof TITHE!=='undefined'){const X=sx(TITHE.x+.6),Y=sz(TITHE.z-1.5);if(X>-200&&X<VW+200&&Y>-120&&Y<VH+260){glowAt(X+8,Y-30,70,[150,206,250],.3*L);glowAt(X,Y+44,120,[140,190,236],.26*L);}}
  // the car on the drive out: its dash lights and the spill off its own headlights keep its shape in the dark
  if(cine&&cine.escape&&NIGHT.dk>0&&NIGHT.car&&NIGHT.car.f===FRAME_NO){const c=NIGHT.car;glowAt(c.x,c.y-20,84,[132,126,120],.34*NIGHT.dk);glowAt(c.x-40,c.y-6,46,[200,196,186],.22*NIGHT.dk);}
  // the crash: the wreck in the oak keeps its dome light on, cold through the steam, until the screen goes black
  if(cine&&cine._st&&cine._st.crashed&&!cine.phase2&&NIGHT.dk>0){const X=sx(-60.9),Y=sz(2.32);glowAt(X,Y-24,100,[150,154,168],.36*NIGHT.dk);glowAt(X+6,Y-34,34,[220,222,230],.3*NIGHT.dk);}
  // placing something outside after dark: you hold the lantern over the spot to see where it goes
  if(out&&NIGHT.dk>0&&typeof PLACE!=='undefined'&&PLACE.on&&PLACE.spec&&!PLACE.spec.room){const [x,z]=placeSpot();lanternPool(sx(x),sz(z-(PLACE.spec.d||1)/2),4.6*PPM,nightLanternCol(NIGHT.dk),.62*NIGHT.dk,NIGHT.dk);}
  // a float on the water after dark: its white tip catches the lantern, so a bite can still be seen wherever it lands
  if((out||mine)&&NIGHT.dk>0&&typeof fish!=='undefined'&&fish.state!=='off'&&fish.state!=='power'&&isFinite(fish.bx)){const X=sx(fish.bx),Y=sz(fish.bz);if(X>-20&&X<VW+20&&Y>-20&&Y<VH+20)glowAt(X,Y-3,14,[255,236,200],.6*NIGHT.dk);}
  // the ghost girl at dusk: a pale glow of her own
  if(out&&typeof ruth!=='undefined'&&ruth.vis)glowAt(sx(ruth.x),sz(ruth.z)-22,30,[176,190,214],.42*L);
  // the townsfolk who stand and watch after the bell: their eyes catch your light, and burn
  if(out&&S.day>=2&&nightK>.5)for(const n of npcs){if(!n.vis||n.clip!=='stand')continue;const X=Math.round(sx(n.x)),Y=Math.round(sz(n.z)-35);if(X<-20||X>VW+20||Y<-20||Y>VH+20)continue;
    if(typeof npcEyeGlow==='function')npcEyeGlow(n,L);else{glowAt(X-2.5,Y+.5,3,[255,60,30],.9*L);glowAt(X+2.5,Y+.5,3,[255,60,30],.9*L);}}
  // friends carry lanterns too: the same round pool round each of them, and their flame
  if((out||mine)&&typeof others==='function'&&NIGHT.dk>0){const here=S.room||'';for(const p of others()){const q=p.presence;if(!q||(q.r||'')!==here||q.c==='tractor')continue;
    const rs=typeof PEER_RS!=='undefined'?PEER_RS[p.peer]:null,x=rs?rs.x:q.x,z=rs?rs.z:q.z;const X=sx(x),Y=sz(z);if(X<-320||X>VW+320||Y<-260||Y>VH+300)continue;
    const fk=lanternFlicker(t+p.peer.length);const h=LANTERN_HIP[q.d]||LANTERN_HIP.S;const li=String(q.li||'t');if(/0/.test(li))continue;
    if(li[0]==='f'){const fa=(q.fa!=null&&isFinite(+q.fa)?+q.fa:90)*Math.PI/180,fx=Math.cos(fa),fz=Math.sin(fa),hh=LI_HAND[q.d]||LI_HAND.S;const fc=liFlashCanvas(q.d||'S',true),ox=X+hh[0]-fc.ax+fc.lx,oy=Y+hh[1]-fc.ay+fc.ly;liBeamDraw(lctx,ox,oy,fx,fz,.85*L*NIGHT.dk);glowAt(ox,oy,3.2,[236,242,255],.9*L);continue;}   /* (t365) from their torch's lens */
    const w=li[0]==='w';lanternPool(X,Y-2,8.6*(w?1.1:1)*PPM*(.97+.03*fk*(w?.45:1)),nightLanternCol(),.9*L*(.92+.08*fk)*(w?1.08:1),NIGHT.dk);if(/h/.test(li))nightLobe(lctx,X,Y-2,Math.cos((q.fa!=null&&isFinite(+q.fa)?+q.fa:90)*Math.PI/180),Math.sin((q.fa!=null&&isFinite(+q.fa)?+q.fa:90)*Math.PI/180),.8*L*NIGHT.dk);glowAt(X+h[0],Y+h[1]+5,18+2*fk,[255,232,170],.9*L);}}
  }catch(e){}return r;};}
// the cast's power gauge and the bite's "!" are the game talking, not the world: drawn over the dark
{const _fm=fishMeter;fishMeter=function(){const a=arguments,th=this;nightUI(()=>_fm.apply(th,a));};const _fb=fishBang;fishBang=function(){const a=arguments,th=this;nightUI(()=>_fb.apply(th,a));};}
// friends' lanterns hang at their belt like yours (the copy the valley sends of one of them carries none)
{const _dp=drawPeer;drawPeer=function(x,z,look,dir,clip,t,label,bubble,alpha){const r=_dp.apply(this,arguments);
  try{if(alpha==null&&clip!=='tractor'&&nightK>.15&&(!S.room||S.room==='mine')&&typeof lanternCanvas==='function'){const li=String(window.__liPeer||'t'),on=!/0/.test(li),d=dir||'S';
    if(LI_ON&&li[0]==='f'){const f=liFlashCanvas(d,on),hh=LI_HAND[d]||LI_HAND.S;ctx2.drawImage(f.c,Math.round(sx(x)+hh[0]-f.ax),Math.round(sz(z)+hh[1]-f.ay));}
    else if(LI_ON){const h=LANTERN_HIP[d]||LANTERN_HIP.S,k=li[0]==='w'?'walt':'tin',cv=liLanternCanvas(k,d,/h/.test(li),on,on?lanternFlicker(performance.now()/1000+String(label||'').length):0);ctx2.drawImage(cv,Math.round(sx(x)+h[0])-(cv.width>>1),Math.round(sz(z)+h[1])-1-(k==='walt'?1:0));}
    else{const h=LANTERN_HIP[dir]||LANTERN_HIP.S;const cv=lanternCanvas(true,lanternFlicker(performance.now()/1000+String(label||'').length));ctx2.drawImage(cv,Math.round(sx(x)+h[0])-3,Math.round(sz(z)+h[1])-1);}}}catch(e){}return r;};}
// where the car is drawn this frame (the drive out has no light on its body of its own)
{const _ds=drawSpr;drawSpr=function(name,x,y){if(name==='car_beaten')NIGHT.car={x,y,f:FRAME_NO};return _ds.apply(this,arguments);};}
// snow in the dark is only seen where a light falls on it (the summer fireflies are their own light, and stay)
{const _ss=seasonSky;seasonSky=function(dt,t){if(NIGHT.dk>0&&!S.room&&typeof outdoorSeason==='function'&&outdoorSeason()==='winter'){ctx2.save();ctx2.globalAlpha=1-.8*NIGHT.dk;try{_ss.apply(this,arguments);}finally{ctx2.restore();}return;}return _ss.apply(this,arguments);};}
// storm rain in the dark: the streaks and rings drawn over the frame (story337) are seen only where there is light to see them by,
// your lantern, a lamp, a window, a flash of lightning; in the black between they are gone ('color-dodge': a glint on lit, nothing on black)
{const _ms=mindScreen;mindScreen=function(t){const storm=S.storm&&isNight()&&!S.room&&(S.mode==='play'||S.mode==='cine');
  if(!storm||!(NIGHT.dk>0))return _ms.apply(this,arguments);
  try{ctx2.save();ctx2.globalCompositeOperation='color-dodge';const fl=Math.min(1,typeof flashT!=='undefined'?flashT:0);
    ctx2.fillStyle=`rgba(150,170,205,${(.2+.4*fl).toFixed(3)})`;for(let i=0;i<260;i++){const x=((hash(i,7)*VW*1.2+t*70)%(VW*1.2))-VW*.1,y=(hash(i,8)*VH+t*(560+hash(i,9)*160))%VH;const X=Math.round(x),Y=Math.round(y);for(let k=0;k<8;k++)ctx2.fillRect(X-(k>>2),Y+k,2,1);}
    ctx2.fillStyle='rgba(200,214,236,.4)';for(let i=0;i<46;i++){const ph=(t*2.2+hash(i,21))%1;if(ph>.45)continue;const X=Math.round(hash(i,22)*VW),Y=Math.round((hash(i,23)*VH+Math.floor(t*2.2+hash(i,21))*53)%VH);const r=1+Math.round(ph*8);
      for(let a=0;a<6.283;a+=.5)ctx2.fillRect(Math.round(X+Math.cos(a)*r),Math.round(Y+Math.sin(a)*r*.4),1,1);}
    ctx2.fillStyle='rgba(170,190,225,.3)';for(let i=0;i<120;i++){const len=6+Math.round(hash(i,41)*8),x=((hash(i,42)*VW*1.3+t*140)%(VW*1.3))-VW*.15,y=(hash(i,43)*VH+t*(620+hash(i,44)*200))%VH;for(let k=0;k<len;k++)ctx2.fillRect(Math.round(x-k*.55),Math.round(y+k),1,1);}
    ctx2.globalCompositeOperation='source-over';
    if(lanternOn()){const lp=lanternPos();ctx2.fillStyle='rgba(255,226,170,.5)';for(let i=0;i<10;i++){const ph=(t*.8+hash(i,31))%1,X=Math.round(lp.gx+(hash(i,32)-.5)*70),Y=Math.round(lp.gy+(hash(i,33)-.5)*30);ctx2.fillRect(X,Y,3+Math.round(ph*4),1);}}
    ctx2.restore();}catch(e){}
  S.storm=false;try{return _ms.apply(this,arguments);}finally{S.storm=true;}};}

// Corwin's far shore is "nights like this": a clear moon over the Black Lake lights the two of you on the near bank, cold and soft
{const K='corwin|The far shore';if(typeof HS_SCENES!=='undefined'&&HS_SCENES[K]){const _f=HS_SCENES[K];HS_SCENES[K]=function(){const r=_f.apply(this,arguments);
  try{const st=STG;if(st&&st.def){const _l=st.def.light;st.def.light=function(L){if(_l)_l.call(this,L);if(NIGHT.dk>0){glowAt(sx(186),sz(4.9)-22,150,[118,138,182],.45*NIGHT.dk);glowAt(sx(186),sz(3.6),190,[90,110,150],.22*NIGHT.dk);}};}}catch(e){}return r;};}}

// ---- on a pad, the hotbar's keyboard numbers (1 … 0, -, =) aren't yours to press: hidden while the pad is in use, back with the
// keyboard, mouse or touch (gamepad361 sets body.gp-pad only when the input changes, so nothing is written per frame)
{const css=document.createElement('style');css.textContent='body.gp-pad #hotbar .slot>i{display:none!important}';document.head.appendChild(css);}
