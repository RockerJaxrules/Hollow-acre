// ================================================================ t377 (owner: "the minigame window is too small on mobile, it should fill the whole
// screen and zoom in so you can do it easily"). On a phone or a tablet the making games, and the butcher's block (it runs on the same
// stage), leave their wooden frame and take the whole screen, edge to edge, and the camera closes in on the part of the bench you work
// with. A PC keeps the framed window exactly as it was: nothing here runs unless the screen is a phone's or a tablet's.
//  - The stage is drawn as before, at its own size, into the same canvas; what changes is how that canvas is shown. It is scaled up
//    and moved so the step's work fills the screen, easing between steps. On a phone the room always covers the screen, except where the
//    work sits at the room's own edge (dents low on the panel): there the room may stop short under a plate, so nothing you work on is
//    hidden. On a tablet (squarer than the stage) a wide piece of work keeps its whole width and the room stops short above and below.
//  - Each step has a focus box: where its tool, your hands and its targets are. It is measured from the step itself (the hands' positions
//    as they are drawn, the places the auto-player presses and drags, recorded while every step was played through) and kept in MF_FOCUS.
//    Where a hand moves by itself (the hammer's swing), a hand seen past the box widens it, smoothly, for the rest of the step; where
//    your finger moves the hand, the view stays put under it. The crow shy shows its three rails whole and still (a view that followed
//    the sight would slide under a resting finger and hide the crows coming on at the ends, and every shot counts).
//  - The marks the game draws over the work (the WORK bar, TRIES, STEPS, gauges and their names, the plaques, the verdicts) go on a
//    layer of their own at the stage's whole-picture size, so none of it is ever cut off by the zoom; marks that sit on the work itself
//    (the beat ring on the cut, TAP over it, LOAD by the brush) stay on the work.
//  - A phone held upright turns the stage on its side, so it uses the long side of the screen (turn the phone and it reads straight; with
//    rotation unlocked the page turns with you and stays straight). A tablet upright keeps it straight, in a band across the middle.
//  - The title, the hint and Skip are small see-through plates at the edges, inside the notch, the home bar and the rounded corners
//    (Skip keeps a whole 48px to tap). Over the verdict the hint goes up beside the title, so the stars stay clear.
//  - The farm behind is not drawn while a game covers the whole screen, so a phone spends its time on the game.
//  - A tap or a drag lands on the stage point it covers on screen: the game is handed that point, zoom, pan, turn and insets included.
const MF={act:false,mode:null,hud:false,inDraw:0,inHud:0,kd:0,frame:false,h2:false,shakeNext:false,z:3,wx:0,wy:0,snap:true,L:null,ak:'',dirty:true,lst:[2,0,0,2,0,0],HX:0,HY:0};
// ---------------------------------------------------------------- the focus box of every step (stage pixels: x0,y0,x1,y1, the work's own
// lowering already in). nh: the live hands are not added: where your finger moves the hand, it is on the screen already, and the view
// must not shift under a finger; where a hand only rests far off, it would undo the zoom
const MF_FOCUS={
  saw:{r:[168,92,300,162],nh:1},plane:{r:[4,95,301,136]},hammer:{r:[40,90,300,166]},brush:{r:[44,100,316,180],nh:1},chop:{r:[120,96,304,160]},
  simmer:{r:[86,0,236,150]},pour:{r:[60,88,292,176]},crack:{r:[104,96,284,160]},flip:{r:[96,56,250,150],nh:1},fillet:{r:[66,104,220,154],nh:1},
  bellows:{r:[90,60,240,160],hud:[[130,58,170,64]]},anvil:{r:[112,68,272,150],nh:1},quench:{r:[70,40,260,172]},grind:{r:[60,76,240,166],nh:1},skim:{r:[56,52,256,138],nh:1},
  crank:{r:[150,70,306,166],nh:1},links:{r:[120,90,240,164]},trace:{r:[64,88,260,176],nh:1},sew:{r:[96,70,236,150],nh:1},braid:{r:[86,86,234,160],nh:1},
  scoop:{r:[64,104,296,180],nh:1},scale:{r:[120,70,240,160]},sieve:{r:[23,70,297,130],nh:1},flail:{r:[150,80,260,150]},knot:{r:[80,80,240,150]},
  dip:{r:[96,60,250,176]},cork:{r:[110,60,230,170]},roll:{r:[80,104,240,180],nh:1},crimp:{r:[100,90,220,150]},bake:{r:[88,40,232,176]},
  stuff:{r:[96,70,224,140],nh:1},drop:{r:[60,80,260,180]},level:{r:[100,56,240,160],nh:1},dig:{r:[130,90,240,178]},light:{r:[130,90,240,150]},
  smoulder:{r:[100,60,230,150]},car:{r:[200,50,300,150],nh:1},crDents:{r:[56,81,320,178],nh:1},crBelt:{r:[120,60,300,170],nh:1},crClamps:{r:[110,80,250,160]},
  crHang:{r:[20,100,270,180],nh:1},crLugs:{r:[130,90,250,180],hud:[[11,29,65,83]],nh:1},crGlass:{r:[100,90,308,180],nh:1},crSeal:{r:[56,70,290,180],nh:1},crBattery:{r:[70,90,290,180],nh:1},
  crCables:{r:[29,90,290,178],nh:1},crFuel:{r:[110,70,300,180]},crKey:{r:[100,80,280,170],hud:[[68,25,102,32]]},
  f2toss:{r:[30,20,300,176],nh:1},f2bell:{r:[20,20,260,160]},f2crows:{r:[0,30,320,176],nh:1},f2bob:{r:[80,56,240,166],nh:1},f2carve:{r:[96,90,230,180],nh:1},f2dance:{r:[20,20,300,176]},
  bgPin:{r:[100,50,260,150]},bgChop:{r:[90,50,240,130]},bgStun:{r:[120,60,260,160]},bgThroat:{r:[80,80,200,170],nh:1},
  hnScald:{r:[60,10,270,176]},hnPluck:{r:[110,0,210,110]},hnGut:{r:[100,40,230,176],nh:1},hnRinse:{r:[90,30,260,170]},
  cwHead:{r:[40,60,300,176]},cwSkin:{r:[140,50,290,179],nh:1},cwGut:{r:[110,20,200,156],nh:1},cwSplit:{r:[100,0,230,150],nh:1},cwWash:{r:[20,20,120,143]}};
const MF_REVEAL=[64,46,256,165];   // the made thing and its stars, edge to edge (no margin: on a phone they must fit above the home bar)
// ---------------------------------------------------------------- which screens: a touch screen (phones, tablets); never a PC or a pad
MF.want=()=>{const f=window.MGFIT_FORCE;if(f==='off')return null;const w=innerWidth,h=innerHeight;
  // a touch screen only (the game's own test for a phone): a PC, even in a small window, and a pad keep the framed window
  if(!f&&!matchMedia('(pointer:coarse)').matches)return null;
  if(f==='land'||f==='rot'||f==='tall')return f;return w>=h?'land':(w<600?'rot':'tall');};
// the screen's safe insets (notch, home bar, rounded corners), measured once from the page's own env() values
MF.safe=()=>{const o=window.MGFIT_SAFE;if(o)return {t:o.t||0,r:o.r||0,b:o.b||0,l:o.l||0};let p=MF.probe;if(!p){p=MF.probe=document.createElement('div');
    p.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';document.body.appendChild(p);}
  const s=getComputedStyle(p);return {t:parseFloat(s.paddingTop)||0,r:parseFloat(s.paddingRight)||0,b:parseFloat(s.paddingBottom)||0,l:parseFloat(s.paddingLeft)||0};};
{const st=document.createElement('style');st.textContent=`
#mg4.mgfit{background:#07070a!important;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
#mg4.mgfit .box{position:fixed!important;left:0;top:0;display:block!important;padding:0!important;gap:0!important;margin:0!important;background:#07070a!important;box-shadow:none!important;transform-origin:0 0;overflow:hidden;grid-template-columns:none!important}
#mg4.mgfit #mgfV{position:absolute;overflow:hidden;background:#07070a;touch-action:none}
#mg4.mgfit #mgfV canvas{position:absolute;left:0;top:0;margin:0!important;max-width:none!important;max-height:none!important;aspect-ratio:auto!important;box-shadow:none!important;transform-origin:0 0;image-rendering:pixelated;image-rendering:crisp-edges}
#mg4.mgfit #mg4C{background:#1a110a}
#mg4.mgfit #mgfHud{pointer-events:none;background:transparent!important}
#mg4.mgfit .t{position:absolute!important;z-index:3;margin:0!important;font:13px/1.3 'Hollow Pixel',monospace!important;padding:2px 8px!important;color:#f2e2bc!important;background:rgba(20,10,4,.6)!important;
  box-shadow:0 0 0 1px rgba(90,52,24,.75)!important;pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:1px 1px 0 #000;box-sizing:border-box;text-align:center;grid-column:auto!important;grid-row:auto!important}
#mg4.mgfit .h{position:absolute!important;z-index:3;margin:0!important;font-size:14px!important;line-height:1.28!important;padding:3px 10px!important;max-width:none!important;background:rgba(20,10,4,.62)!important;
  box-shadow:0 0 0 1px rgba(74,42,16,.75)!important;pointer-events:none;box-sizing:border-box;grid-column:auto!important;grid-row:auto!important}
#mg4.mgfit .row{position:absolute!important;z-index:4;margin:0!important;grid-column:auto!important;grid-row:auto!important;display:block!important}
#mg4.mgfit #mg4Skip{position:static!important;display:flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:48px!important;min-height:48px!important;width:auto!important;height:48px!important;
  padding:0 6px!important;margin:0!important;font:13px 'Hollow Pixel',monospace!important;background:rgba(20,10,4,.62)!important;border:1px solid rgba(184,130,60,.75)!important;color:#f4e6c8!important;border-radius:4px!important;flex:none!important;text-shadow:1px 1px 0 #000}
#mg4.mgfit #mgfTurn{position:absolute;z-index:5;pointer-events:none;font:14px/1.3 'Hollow Pixel',monospace;color:#fff4dc;background:rgba(20,10,4,.72);box-shadow:0 0 0 1px rgba(184,130,60,.75);padding:6px 10px;
  text-shadow:1px 1px 0 #000;opacity:0;transition:opacity .4s;white-space:nowrap}
#mg4.mgfit #mgfTurn.on{opacity:1}
body.mgfitOn #fsX{visibility:hidden!important}`;document.head.appendChild(st);}
// ---------------------------------------------------------------- the context the game draws with: the stage's own canvas for the work,
// the marks' layer for the marks; it hands every call on to whichever is current
MF.PROPS=['fillStyle','strokeStyle','lineWidth','globalAlpha','globalCompositeOperation','font','textAlign','textBaseline','lineCap','lineJoin','imageSmoothingEnabled'];
MF.mkF=()=>{const F={};const P=CanvasRenderingContext2D.prototype;
  for(const n of Object.getOwnPropertyNames(P)){if(n==='constructor'||n==='canvas')continue;const d=Object.getOwnPropertyDescriptor(P,n);if(!d)continue;
    if(typeof d.value==='function')F[n]=function(){const T=MF.T;return T[n].apply(T,arguments);};
    else if(d.get)Object.defineProperty(F,n,{get(){return MF.T[n];},set(v){MF.T[n]=v;},enumerable:true,configurable:true});}
  Object.defineProperty(F,'canvas',{get(){return MF.cv;}});
  F.fillRect=function(x,y,w,h){const T=MF.T;if(T===MF.H&&x<=0&&y<=0&&x+w>=320&&y+h>=180){T.save();T.setTransform(1,0,0,1,0,0);T.fillRect(0,0,T.canvas.width,T.canvas.height);T.restore();return;}T.fillRect(x,y,w,h);};
  F.clearRect=function(x,y,w,h){if(x===0&&y===0&&w===320&&h===180&&!MF.inDraw)MF.frameStart();MF.T.clearRect(x,y,w,h);};
  F.setTransform=function(a,b,c,d,e,f){if(a&&typeof a==='object'){const m=a;a=m.a;b=m.b;c=m.c;d=m.d;e=m.e;f=m.f;}if(a===undefined){a=1;b=0;c=0;d=1;e=0;f=0;}
    MF.lst=[a,b,c,d,e,f];if(!MF.inDraw&&MF.frame&&!MF.h2){if(MF.shakeNext)MF.shakeNext=false;else{MF.h2=true;MF.toHUD();}}
    const T=MF.T;if(T===MF.H)T.setTransform(a,b,c,d,e+MF.HX,f+MF.HY);else T.setTransform(a,b,c,d,e,f);};
  F.resetTransform=function(){const T=MF.T;if(T===MF.H)T.setTransform(1,0,0,1,MF.HX,MF.HY);else T.resetTransform();};
  F.getTransform=function(){const m=MF.T.getTransform();if(MF.T===MF.H){m.e-=MF.HX;m.f-=MF.HY;}return m;};
  // the calls a frame makes thousands of times, handed on directly (a phone at a quarter speed must not draw slower than before)
  F.beginPath=function(){MF.T.beginPath();};F.closePath=function(){MF.T.closePath();};F.save=function(){MF.T.save();};F.restore=function(){MF.T.restore();};
  F.moveTo=function(x,y){MF.T.moveTo(x,y);};F.lineTo=function(x,y){MF.T.lineTo(x,y);};F.rect=function(x,y,w,h){MF.T.rect(x,y,w,h);};
  F.strokeRect=function(x,y,w,h){MF.T.strokeRect(x,y,w,h);};F.translate=function(x,y){MF.T.translate(x,y);};F.rotate=function(a){MF.T.rotate(a);};F.scale=function(x,y){MF.T.scale(x,y);};
  F.arc=function(x,y,r,a,b,c){if(arguments.length>5)MF.T.arc(x,y,r,a,b,c);else MF.T.arc(x,y,r,a,b);};
  F.fill=function(a,b){const T=MF.T,n=arguments.length;if(!n)T.fill();else if(n===1)T.fill(a);else T.fill(a,b);};
  F.stroke=function(a){if(arguments.length)MF.T.stroke(a);else MF.T.stroke();};
  F.drawImage=function(i,a,b,c,d,e,f,g,h){const T=MF.T,n=arguments.length;if(n===3)T.drawImage(i,a,b);else if(n===5)T.drawImage(i,a,b,c,d);else T.drawImage(i,a,b,c,d,e,f,g,h);};
  Object.defineProperties(F,{fillStyle:{get(){return MF.T.fillStyle;},set(v){MF.T.fillStyle=v;},enumerable:true},globalAlpha:{get(){return MF.T.globalAlpha;},set(v){MF.T.globalAlpha=v;},enumerable:true},
    strokeStyle:{get(){return MF.T.strokeStyle;},set(v){MF.T.strokeStyle=v;},enumerable:true},lineWidth:{get(){return MF.T.lineWidth;},set(v){MF.T.lineWidth=v;},enumerable:true},
    globalCompositeOperation:{get(){return MF.T.globalCompositeOperation;},set(v){MF.T.globalCompositeOperation=v;},enumerable:true}});
  return F;};
MF.toHUD=()=>{if(MF.hud)return;const W=MF.W,H=MF.H;for(const p of MF.PROPS)H[p]=W[p];const m=W.getTransform();H.setTransform(m.a,m.b,m.c,m.d,m.e+MF.HX,m.f+MF.HY);MF.T=H;MF.hud=true;};
MF.toWorld=()=>{if(!MF.hud)return;const W=MF.W,H=MF.H;for(const p of MF.PROPS)W[p]=H[p];MF.T=W;MF.hud=false;};
// each frame starts with the stage cleared: the marks' layer is cleared with it, and once the frame is drawn the camera moves
MF.frameStart=()=>{MF.toWorld();const l=MF.lst;MF.W.setTransform(l[0],l[1],l[2],l[3],l[4],l[5]);const H=MF.H;H.save();H.setTransform(1,0,0,1,0,0);H.clearRect(0,0,H.canvas.width,H.canvas.height);H.restore();
  MF.frame=true;MF.h2=false;MF.shakeNext=!!(MF.K&&MF.K.shk>0);if(!MF.q){MF.q=true;queueMicrotask(MF.tick);}};
// ---------------------------------------------------------------- the marks: which go on their own layer
MF.inR=(x,y)=>{const r=MF.R;return !!r&&x>=r[0]-2&&x<=r[2]+2&&y>=r[1]-2&&y<=r[3]+2;};
MF.wrapK=K=>{MF.K=K;
  const H=f=>function(){if(MF.kd||MF.hud||!MF.act)return f.apply(this,arguments);MF.kd++;MF.toHUD();try{return f.apply(this,arguments);}finally{MF.toWorld();MF.kd--;}};
  K.meter=H(K.meter);K.gauge=H(K.gauge);K.plaque=H(K.plaque);
  for(const n of ['label','text','textO']){const f=K[n],toH=H(f);K[n]=function(t,x,y){if(MF.kd||MF.hud||!MF.act)return f.apply(this,arguments);
    if(n==='textO'&&!MF.inDraw&&MF.dz&&K.pops&&K.pops.some(p=>p.txt===t&&p.x===x))return MF.pop(f,this,arguments);
    if(!MF.inDraw)return f.apply(this,arguments);
    const top=n==='label'&&y<32,dy=top?0:(K.dy||0);   // a step's names along the top (NAIL 1/4, WASH, ...) always go with the marks
    if((MF.wl(t)||MF.inR(x,y+dy)&&!(top&&MF.inHud))&&!(MF.hr&&MF.hrIn(x-2,y,x+2,y+5))){MF.kd++;try{return f.apply(this,arguments);}finally{MF.kd--;}}
    return toH.apply(this,arguments);};}
  // a step's own bars drawn beside its marks (the battery's charge by its name, ...) go with them
  const hrIn=(x0,y0,x1,y1)=>{const hr=MF.hr;if(!hr||!MF.inDraw||MF.kd||MF.hud)return false;for(const r of hr)if(x0>=r[0]&&y0>=r[1]&&x1<=r[2]&&y1<=r[3])return true;return false;};MF.hrIn=hrIn;
  const px=K.px,pxH=H(px);K.px=function(x,y,w,h,c){return MF.hr&&hrIn(x,y,x+w,y+h)?pxH.call(this,x,y,w,h,c):px(x,y,w,h,c);};
  const ln=K.line;if(ln){const lnH=H(ln);K.line=function(x0,y0,x1,y1,c,w){return MF.hr&&hrIn(Math.min(x0,x1),Math.min(y0,y1),Math.max(x0,x1),Math.max(y0,y1))?lnH.call(this,x0,y0,x1,y1,c,w):ln(x0,y0,x1,y1,c,w);};}
  return K;};
MF.wl=t=>{const w=MF.fo&&MF.fo.wl;return !!w&&w.test(String(t));};
// a verdict rising from where you worked: drawn on the marks' layer over that spot, kept inside the screen and under the names along the top
MF.pop=(f,self,a)=>{const L=MF.L,K=MF.K;if(!L)return f.apply(self,a);let [t,x,y,c,sc]=a;sc=sc||1;const sx=x,sy=y+(K.dy||0);
  const lx=(sx-MF.dwx)*MF.dz,ly=(sy-MF.dwy)*MF.dz;let hx=lx/L.s-L.hox,hy=ly/L.s-L.hoy;const hw=String(t).length*2*sc+3,F=L.Fr;
  const x0=F.x/L.s-L.hox+hw,x1=(F.x+F.w)/L.s-L.hox-hw,y0=Math.max(40,F.y/L.s-L.hoy+2),y1=(F.y+F.h)/L.s-L.hoy-5*sc-3;hx=Math.max(x0,Math.min(x1,hx));hy=Math.max(y0,Math.min(y1,hy));
  MF.kd++;MF.toHUD();const H=MF.H;H.save();H.setTransform(2,0,0,2,MF.HX,MF.HY);try{return f.call(self,t,Math.round(hx),Math.round(hy),c,sc);}finally{H.restore();MF.toWorld();MF.kd--;}};
// every step's drawing is marked, so the frame's own parts (the room, the verdicts, the plaques) can be told from the step's
{const wrapS=()=>{for(const k of Object.keys(S4)){const f=S4[k];if(typeof f!=='function'||f.__mf)continue;
    const w=function(sp,K){const o=f.apply(this,arguments);try{if(o&&typeof o==='object'){o.__mfk=k;for(const n of ['draw','hud']){const d=o[n];if(typeof d!=='function')continue;
      o[n]=function(){if(!MF.act)return d.apply(this,arguments);MF.inDraw++;if(n==='hud')MF.inHud++;try{return d.apply(this,arguments);}finally{MF.inDraw--;if(n==='hud')MF.inHud--;}};}}}catch(e){}return o;};
    w.__mf=1;S4[k]=w;}};MF.wrapS=wrapS;}   // (done when a game opens on a phone: a PC's steps are never touched)
{const _k=mg4Kit;mg4Kit=function(g){const K=_k.apply(this,arguments);if(MF.F&&g===MF.F)MF.wrapK(K);return K;};}
// ---------------------------------------------------------------- the window, laid out for the screen
MF.build=()=>{if(MF.V)return;const cv=$('mg4C');MF.cv=cv;MF.W=HTMLCanvasElement.prototype.getContext.call(cv,'2d');
  const V=MF.V=document.createElement('div');V.id='mgfV';const hc=MF.hc=document.createElement('canvas');hc.id='mgfHud';hc.width=640;hc.height=360;V.appendChild(hc);
  MF.H=hc.getContext('2d');MF.H.imageSmoothingEnabled=false;MF.T=MF.W;MF.F=MF.mkF();
  const tn=MF.tn=document.createElement('div');tn.id='mgfTurn';tn.textContent='Turn your phone sideways';
  // the game asks its canvas for a context once per game: on a phone it gets the one that splits the work from the marks
  cv.getContext=function(t,o){return MF.act&&t==='2d'?MF.F:HTMLCanvasElement.prototype.getContext.call(this,t,o);};
  const mo=new MutationObserver(()=>{MF.dirty=true;});for(const id of ['mg4H','mg4T'])mo.observe($(id),{childList:true,characterData:true,subtree:true});
  addEventListener('resize',()=>{MF.dirty=true;});
  // a touch in the window but beside the room (where the room stops short of the screen's edge) is the game's too
  for(const n of ['pointerdown','pointermove','pointerup','pointercancel'])V.addEventListener(n,e=>{if(!MF.act||e.target===cv)return;const f=cv['on'+n];if(typeof f==='function')f.call(cv,e);});};
MF.on=mode=>{MF.build();const box=$('mg4'),bx=box.querySelector('.box'),cv=MF.cv;MF.mode=mode;MF.act=true;MF.snap=true;MF.dirty=true;MF.ak='';MF.frame=false;MF.h2=false;MF.hud=false;MF.T=MF.W;MF.inDraw=MF.inHud=MF.kd=0;
  if(cv.parentNode!==MF.V){bx.insertBefore(MF.V,cv);MF.V.insertBefore(cv,MF.hc);}if(MF.tn.parentNode!==box)box.appendChild(MF.tn);
  box.classList.add('mgfit');document.body.classList.add('mgfitOn');MF.wrapS();};
MF.off=()=>{if(!MF.V)return;const box=$('mg4'),bx=box.querySelector('.box'),cv=MF.cv;MF.act=false;MF.mode=null;box.classList.remove('mgfit');document.body.classList.remove('mgfitOn');
  if(cv.parentNode===MF.V){bx.insertBefore(cv,MF.V);MF.V.remove();}MF.tn.remove();for(const p of ['width','height','transform'])cv.style.removeProperty(p);
  bx.removeAttribute('style');for(const id of ['mg4T','mg4H'])$(id).removeAttribute('style');const r=bx.querySelector('.row');if(r)r.removeAttribute('style');
  MF.W.setTransform(1,0,0,1,0,0);MF.T=MF.W;MF.hud=false;MF.L=null;};
MF.layout=()=>{const mode=MF.mode,Ws=innerWidth,Hs=innerHeight,rot=mode==='rot';MF.sw=Ws;MF.sh=Hs;MF.dirty=false;
  const box=$('mg4'),bx=box.querySelector('.box'),Lw=rot?Hs:Ws,Lh=rot?Ws:Hs,s0=MF.safe(),sf=rot?{l:s0.t,r:s0.b,t:s0.r,b:s0.l}:s0;
  bx.style.width=Lw+'px';bx.style.height=Lh+'px';bx.style.transform=rot?`translate(${Ws}px,0) rotate(90deg)`:'none';
  const SX=sf.l,SY=sf.t,SW=Lw-sf.l-sf.r,SH=Lh-sf.t-sf.b,G=6,C=60;const T=$('mg4T'),Hn=$('mg4H'),row=bx.querySelector('.row');
  const run=MF.run||{n:1};let V,hs,hx,hy,col=false;const s=(w,h)=>Math.min(w/320,h/180);
  if(mode==='tall'){// a tablet upright: the work in a band across the middle, the title and Skip above it, the hint below it
    const bh=Math.round(Math.min(SH-190,SW*.78));V={x:0,y:Math.round(SY+Math.max(70,(SH-bh)/2-10)),w:Lw,h:bh};hs=s(SW,bh);hx=Math.round(SX+(SW-320*hs)/2);hy=Math.round(V.y+(bh-180*hs)/2);}
  else{V={x:0,y:0,w:Lw,h:Lh};// Skip and the title in a column at the left (the marks then sit flush right, so the WORK bar covers only the room's
    // last sliver and not the hand at work), or in a strip along the top, whichever leaves the marks bigger
    const sa=s(SW-C,SH),sb=s(SW,SH-C);col=sa>=sb;hs=col?sa:sb;
    if(col){hx=Math.round(SX+SW-320*hs);hy=Math.round(SY+(SH-180*hs)/2);}else{hx=Math.round(SX+(SW-320*hs)/2);hy=Math.round(SY+C+(SH-C-180*hs)/2);}}
  // the marks' layer covers the work's whole window, the stage's marks placed in it where they fit
  const L={mode,Lw,Lh,V,s:hs,hx,hy,hox:(hx-V.x)/hs,hoy:(hy-V.y)/hs};
  const hc=MF.hc,bw=Math.max(2,Math.round(V.w/hs*2)),bh=Math.max(2,Math.round(V.h/hs*2));if(hc.width!==bw)hc.width=bw;if(hc.height!==bh)hc.height=bh;MF.H.imageSmoothingEnabled=false;
  hc.style.setProperty('width',V.w+'px','important');hc.style.setProperty('height',V.h+'px','important');MF.HX=Math.round(L.hox*2);MF.HY=Math.round(L.hoy*2);
  const Vd=MF.V.style;Vd.left=V.x+'px';Vd.top=V.y+'px';Vd.width=V.w+'px';Vd.height=V.h+'px';
  // Skip: top left; the title beside it, short of the marks' first names
  const ky=mode==='tall'?V.y-48-G:SY+G;row.style.left=(SX+G)+'px';row.style.right='auto';row.style.top=ky+'px';
  const tx=SX+G+48+G,th=T.textContent?T.offsetHeight:0;T.style.left=tx+'px';T.style.top=(ky+Math.round((48-th)/2))+'px';
  T.style.maxWidth=Math.max(90,mode==='tall'?SW-2*(48+2*G):(col?hx+25*hs:SX+SW-G)-tx-G)+'px';
  // the hint: below the marks if there is room, else along the bottom between TRIES and STEPS; over the verdict (the made thing and its
  // stars) it goes up beside the title instead, so the stars at the bottom stay clear
  const n=run.n||1,belowY=hy+180*hs+G,roomBelow=SY+SH-belowY,rev=mode!=='tall'&&(window.CG2_NOW||'')==='reveal';let pw,px0,up=false;
  if(mode==='tall'){pw=Math.min(SW-2*G,620);px0=Math.round(SX+(SW-pw)/2);}
  else{const a=hx+44*hs,b=hx+(320-18-11*n)*hs;pw=Math.round(Math.min(560,Math.max(180,b-a)));px0=Math.round((a+b)/2-pw/2);
    if(rev){const x0=tx+(th?T.offsetWidth:0)+G,x1=SX+SW-G;if(x1-x0>=180){up=true;pw=Math.round(Math.min(560,x1-x0));px0=Math.round(x0+(x1-x0-pw)/2);}}}
  Hn.style.width=pw+'px';Hn.style.left=px0+'px';const ph=Hn.offsetHeight;
  let py;if(mode==='tall')py=V.y+V.h+G+4;else if(up)py=Math.round(ky+Math.max(0,(48-ph)/2));else if(roomBelow>=ph+G)py=Math.round(belowY);else py=Math.round(SY+SH-ph-4);Hn.style.top=py+'px';
  // the camera frames the work inside what the plates and the marks' edges leave clear
  let fx0=Math.max(V.x,SX)+4,fy0=Math.max(V.y,SY)+4,fx1=Math.min(V.x+V.w,SX+SW)-4,fy1=Math.min(V.y+V.h,SY+SH)-4;
  fx1=Math.min(fx1,hx+306*hs);if(mode!=='tall'){if(!col)fy0=Math.max(fy0,SY+C);if(up)fy0=Math.max(fy0,ky+48+2,py+ph+4);else{const pt=py-6;if(pt<fy1&&pt>fy0+80)fy1=pt;}}
  L.Fr={x:fx0-V.x,y:fy0-V.y,w:Math.max(40,fx1-fx0),h:Math.max(40,fy1-fy0)};L.n=n;MF.L=L;
  // a phone held upright: say once that turning it shows the stage straight
  const tn=MF.tn;if(rot){tn.style.left='50%';tn.style.transform='translateX(-50%)';tn.style.top=(s0.t+70)+'px';}
  MF.ak='';return L;};
// ---------------------------------------------------------------- the camera
MF.region=()=>{const ph=window.CG2_NOW||'';if(ph==='reveal')return {r:MF_REVEAL,rev:1};const cur=window.__mg4cur,k=cur&&cur.__mfk,fo=MF_FOCUS[k];MF.fo=fo||null;MF.hr=fo&&fo.hud||null;
  let r=fo?fo.r.slice():[60,60,260,176];const K=MF.K,dy=(K&&K.dy)||0,fr=(typeof M4G!=='undefined'&&M4G.fr)||[];
  // a hand seen past the box widens it for the rest of the step (it only ever grows, so the view settles instead of breathing)
  if(!fo||!fo.nh){if(MF.srk!==cur){MF.sr=r.slice();MF.srk=cur;}const q=MF.sr;
    for(const [x,y] of fr){const Y=y+dy;if(!isFinite(x)||!isFinite(Y))continue;q[0]=Math.min(q[0],x-12);q[1]=Math.min(q[1],Y-12);q[2]=Math.max(q[2],x+12);q[3]=Math.max(q[3],Y+12);}r=q.slice();}
  // a controller's hand is kept in view too
  try{if(typeof GP!=='undefined'&&GP.ctx==='mg4'&&GP.hand&&GP.hand.on){const I=window.__mg4I;if(I){r[0]=Math.min(r[0],I.x-14);r[1]=Math.min(r[1],I.y-14);r[2]=Math.max(r[2],I.x+14);r[3]=Math.max(r[3],I.y+14);}}}catch(e){}
  r[0]=Math.max(0,r[0]);r[1]=Math.max(0,r[1]);r[2]=Math.min(320,r[2]);r[3]=Math.min(180,r[3]);return {r,base:fo?fo.r:null};};
MF.tick=()=>{MF.q=false;if(!MF.act||!MG4.on)return;
  // the phone turned (rotation unlocked): upright becomes sideways and back; the camera jumps to its new place
  if(MF.dirty||innerWidth!==MF.sw||innerHeight!==MF.sh){const m=MF.want();if(m&&m!==MF.mode){MF.mode=m;MF.snap=true;MF.tn.classList.remove('on');MF.tnOn=null;}MF.layout();}const L=MF.L;if(!L)return;
  const now=performance.now(),dt=Math.min(.1,Math.max(0,(now-(MF.lt||now))/1000));MF.lt=now;
  const g=MF.region(),r=g.r;MF.R=g.rev?null:(g.base||r);const F=L.Fr,V=L.V,m=g.rev?0:6,rw=r[2]-r[0]+2*m,rh=r[3]-r[1]+2*m;
  // the zoom: the focus box fills the clear part of the screen; on a phone never so little that the room stops short of the screen's edges
  // (a screen squarer than the stage, a tablet's: covering it would cut the work at its sides, so there the work keeps its whole width
  // and the room stops short above and below instead)
  const zc=Math.max(V.w/320,V.h/180),zx=F.w/rw;let z=Math.min(zx,F.h/rh);
  if(z<zc&&V.w<V.h*16/9)z=Math.max(Math.min(V.w/320,V.h/180),Math.min(zc,zx));else z=Math.max(zc,z);z=Math.min(z,Math.max(zc,6.5));
  if(MF.snap)MF.z=z;else MF.z+=(z-MF.z)*(1-Math.exp(-dt/.32));const Z=MF.z;
  // where: the focus box in the middle of the clear part, the room covering the screen; where the box sits at the room's own edge
  // (dents low on the panel), the room's edge may come in as far as the clear part's edge, so nothing you work on is under a plate
  const cl=(v,a,b)=>a>b?(a+b)/2:Math.max(a,Math.min(b,v));let wx=(r[0]+r[2])/2-(F.x+F.w/2)/Z,wy=(r[1]+r[3])/2-(F.y+F.h/2)/Z;
  wx=cl(wx,0,320-V.w/Z);wy=cl(wy,0,180-V.h/Z);
  const nR=r[2]+m-(F.x+F.w)/Z,nL=r[0]-m-F.x/Z,nB=r[3]+m-(F.y+F.h)/Z,nT=r[1]-m-F.y/Z;
  if(wx<nR)wx=Math.min(nR,Math.max(wx,320-(F.x+F.w)/Z));if(wx>nL)wx=Math.max(nL,Math.min(wx,-F.x/Z));
  if(wy<nB)wy=Math.min(nB,Math.max(wy,180-(F.y+F.h)/Z));if(wy>nT)wy=Math.max(nT,Math.min(wy,-F.y/Z));
  if(MF.snap){MF.wx=wx;MF.wy=wy;MF.snap=false;}else{const k=1-Math.exp(-dt/.26);MF.wx+=(wx-MF.wx)*k;MF.wy+=(wy-MF.wy)*k;}
  wx=MF.wx;wy=MF.wy;
  if(MF.apply(Z,wx,wy))MF.repoint();
  // the turn hint shows over the title of the first step, once per game
  if(L.mode==='rot'){const ph=window.CG2_NOW||'',on=/^title:0$|^demo:0$/.test(ph)&&!MF.turned;if(on!==MF.tnOn){MF.tnOn=on;MF.tn.classList.toggle('on',on);}if(/^(ready|[a-zA-Z0-9]+):\d/.test(ph)&&!/^(title|demo):/.test(ph))MF.turned=true;}};
MF.apply=(z,wx,wy)=>{const cv=MF.cv,dpr=devicePixelRatio||1,tx=Math.round(-wx*z*dpr)/dpr,ty=Math.round(-wy*z*dpr)/dpr,w=(320*z).toFixed(2),h=(180*z).toFixed(2);
  const key=w+','+h+','+tx+','+ty;if(key===MF.ak)return false;MF.ak=key;cv.style.setProperty('width',w+'px','important');cv.style.setProperty('height',h+'px','important');cv.style.transform=`translate(${tx}px,${ty}px)`;
  MF.dz=+w/320;MF.dwx=-tx/MF.dz;MF.dwy=-ty/MF.dz;return true;};
// ---------------------------------------------------------------- the pointer: where it is on the screen, which stage point that shows
MF.toLocal=(X,Y)=>MF.L&&MF.L.mode==='rot'?[Y,innerWidth-X]:[X,Y];
MF.toStage=(X,Y)=>{const L=MF.L;const [lx,ly]=MF.toLocal(X,Y);return [MF.dwx+(lx-L.V.x)/MF.dz,MF.dwy+(ly-L.V.y)/MF.dz];};
MF.toScreen=(sx,sy)=>{const L=MF.L;const lx=L.V.x+(sx-MF.dwx)*MF.dz,ly=L.V.y+(sy-MF.dwy)*MF.dz;return L.mode==='rot'?[innerWidth-ly,lx]:[lx,ly];};
MF.mapEv=e=>{if(!MF.act||!MF.L||!e||!e.isTrusted)return e;const [sx,sy]=MF.toStage(e.clientX,e.clientY);const r=MF.cv.getBoundingClientRect();MF.lastS=[sx,sy];
  return {clientX:r.left+sx/320*r.width,clientY:r.top+sy/180*r.height,pointerId:e.pointerId,pointerType:e.pointerType,button:e.button,buttons:e.buttons,isPrimary:e.isPrimary,
    target:e.target,currentTarget:e.currentTarget,type:e.type,timeStamp:e.timeStamp,isTrusted:true,preventDefault(){e.preventDefault();},stopPropagation(){e.stopPropagation();}};};
MF.hookInput=()=>{const cv=MF.cv;for(const n of ['onpointerdown','onpointermove','onpointerup','onpointercancel']){const f=cv[n];if(!f||f.__mf)continue;
    const w=function(e){if(e&&e.isTrusted&&MF.act){if(n==='onpointerdown'||n==='onpointermove'){MF.pe={clientX:e.clientX,clientY:e.clientY,pointerId:e.pointerId,pointerType:e.pointerType,
        held:n==='onpointerdown'||e.buttons>0||(MF.pe&&MF.pe.held&&e.pointerType!=='mouse'),t:performance.now()};}else MF.pe=null;}return f.call(this,MF.mapEv(e));};
    w.__mf=1;w.__orig=f;cv[n]=w;}};
// when the camera moves under a finger that is still down (or a mouse over the stage), the game is told the point under it now
MF.repoint=()=>{const p=MF.pe,cv=MF.cv;if(!p||!MF.L)return;if(!p.held&&p.pointerType!=='mouse')return;const f=cv.onpointermove;if(!f||!f.__orig)return;
  const [sx,sy]=MF.toStage(p.clientX,p.clientY),r=cv.getBoundingClientRect();try{f.__orig.call(cv,{clientX:r.left+sx/320*r.width,clientY:r.top+sy/180*r.height,pointerId:p.pointerId,pointerType:p.pointerType,preventDefault(){},stopPropagation(){}});}catch(e){}};
// ---------------------------------------------------------------- every game: on a phone or a tablet it opens this way
{const _run=mg4Run;mg4Run=function(def,name,done,icon){const mode=MF.want();
  if(!mode){if(MF.act)MF.off();return _run.apply(this,arguments);}
  MF.on(mode);MF.run={n:(def&&def.steps&&def.steps.length)||1};MF.turned=false;MF.tnOn=null;MF.tn.classList.remove('on');
  const a=[...arguments];a[2]=function(){try{if(MF.act)MF.off();}catch(e){}return typeof done==='function'?done.apply(this,arguments):undefined;};
  const r=_run.apply(this,a);MF.hookInput();MF.layout();return r;};}
// the farm behind is wholly covered while a game fills a phone's screen, so it is not drawn under it (as under the full-screen map): the
// phone's time goes to the game. (It is drawn again on the frame the game closes.)
if(typeof render==='function'){const _rd=render;render=function(){if(MF.act&&MG4.on&&MF.L)return;return _rd.apply(this,arguments);};}
window.MGFIT=MF;
