/* ================= #273 display settings. The game used to size itself one way for every screen, so on a big monitor (1440p,
   4K, ultrawide) the world filled the screen but the menus, the title screen and the character maker stayed small in the
   middle, and the desktop app always opened in a 1280x800 window. Now a Display button (on the title screen beside Sound, and
   in the corner of the HUD) sets:
   - RESOLUTION. Auto uses your screen as it is (the game reads it and shows it: "Your screen: 3840 x 2160"), or pick one.
     In the desktop app a resolution in a window sizes the window; in full screen, or in a browser, it is the resolution the
     game draws at (lower is lighter on an older computer), scaled up to fill the screen with sharp pixels.
   - WINDOW or FULL SCREEN.
   - INTERFACE SIZE: the HUD, menus, title screen and dialogue, from 70% to 220% of what suits your screen.
   - WORLD ZOOM: closer, normal or wider (how much of the farm fits on screen).
   Everything is kept on this device and applies straight away. ================= */
const DISP_KEY='hollowDisplay',DISP_DEF={res:'auto',ui:1,zoom:'normal',mode:'window'};
function dispLoad(){try{return Object.assign({},DISP_DEF,JSON.parse(localStorage.getItem(DISP_KEY)||'{}'));}catch(e){return Object.assign({},DISP_DEF);}}
var DISP=dispLoad();   // var: the HUD asks for the interface size before this file has run
function dispSave(){try{localStorage.setItem(DISP_KEY,JSON.stringify(DISP));}catch(e){}}
function dispUi(){try{const v=+DISP.ui;return isFinite(v)?Math.max(.7,Math.min(2.2,v)):1;}catch(e){return 1;}}   // 1 until this file has run (the HUD lays out first)
const DISP_RES=[[1280,720],[1600,900],[1920,1080],[2560,1080],[2560,1440],[3440,1440],[3840,2160],[5120,1440]];
const DISP_ZOOM={closer:300,normal:360,wider:450};
const DESK=(typeof window!=='undefined'&&window.hollowDesktop)||null;
// the screen as it really is, in physical pixels (the desktop app knows it exactly; a browser works it out from the zoom)
let DISP_SCR=null;
function dispScreen(){if(DISP_SCR)return DISP_SCR;const d=window.devicePixelRatio||1;return {w:Math.round(screen.width*d),h:Math.round(screen.height*d),sf:d};}
if(DESK&&DESK.info)DESK.info().then(i=>{if(i&&i.w)DISP_SCR=i;}).catch(()=>{});
// ---- the world: how big each game pixel is drawn
resize=function(){const dpr=Math.min(3,window.devicePixelRatio||1);let W=innerWidth*dpr,H=innerHeight*dpr;
  if(DISP.res!=='auto'&&!(DESK&&DISP.mode==='window')){const [rw,rh]=String(DISP.res).split('x').map(Number);if(rw&&rh&&rh<H){W=W*(rh/H);H=rh;}}
  const port=innerWidth<innerHeight,div=(DISP_ZOOM[DISP.zoom]||360)*(port?400/360:1);
  SCALE=Math.max(1,Math.round(Math.min(W,H)/div));VW=Math.ceil(W/SCALE);VH=Math.ceil(H/SCALE);
  view.width=VW;view.height=VH;view.style.width=innerWidth+'px';view.style.height=innerHeight+'px';ctx2.imageSmoothingEnabled=false;
  for(const c of [lightC,fogC,fxC]){c.width=VW;c.height=VH;}lctx.imageSmoothingEnabled=false;};
function dispApply(){try{resize();}catch(e){}try{vig=null;}catch(e){}try{hudLayout();}catch(e){}try{renderHotbar&&renderHotbar();}catch(e){}}
function dispSetMode(m){DISP.mode=m;dispSave();
  if(DESK&&DESK.setFullScreen){DESK.setFullScreen(m==='full');if(m==='window')dispSetRes(DISP.res,true);}
  else if(m==='full'&&!fsOn()){try{fsToggle();}catch(e){}}else if(m==='window'&&fsOn()){try{fsExit();}catch(e){}}
  setTimeout(dispApply,350);}
function dispSetRes(r,quiet){DISP.res=r;dispSave();
  if(DESK&&DESK.setWindow&&DISP.mode==='window'){const s=dispScreen();const [w,h]=r==='auto'?[Math.round(s.w*.86),Math.round(s.h*.86)]:String(r).split('x').map(Number);DESK.setWindow(w,h);}
  setTimeout(dispApply,quiet?0:250);dispApply();}
// ---- the panel
const DISP_ICON='<path d="M2 3h16v10H2z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M7 17h6M10 13v4" stroke="currentColor" stroke-width="1.7"/>';
function dispPick(){const p=$('dispPick');const s=dispScreen(),d=window.devicePixelRatio||1,win=`${Math.round(innerWidth*d)} × ${Math.round(innerHeight*d)}`;
  const opt=(k,v,label,small)=>`<button class="dopt${String(DISP[k])===String(v)?' on':''}" data-k="${k}" data-v="${v}"><b>${label}</b>${small?`<small>${small}</small>`:''}</button>`;
  const fits=DISP_RES.filter(([w,h])=>w<=s.w+8&&h<=s.h+8);
  p.innerHTML=`<b class="hd">Display</b>
    <div class="dinfo">Your screen: <b>${s.w} × ${s.h}</b>${Math.abs(s.sf-1)>.01?` <small>(Windows/Mac scaling ${Math.round(s.sf*100)}%)</small>`:''}<br><small>The game is using ${win} right now.</small></div>
    <div class="dsec">Resolution</div><div class="drow">${opt('res','auto','Auto','your screen')}${fits.map(([w,h])=>opt('res',`${w}x${h}`,`${w} × ${h}`,w===s.w&&h===s.h?'your screen':'')).join('')}</div>
    <div class="dsec">Screen</div><div class="drow">${opt('mode','window','Window','')}${opt('mode','full','Full screen','')}</div>
    <div class="dsec">Interface size</div><div class="drow dsize"><button class="dstep" data-d="-1" aria-label="Smaller">−</button><b id="dUi">${Math.round(dispUi()*100)}%</b><button class="dstep" data-d="1" aria-label="Bigger">+</button>${opt('ui',1,'Fit my screen','')}</div>
    <div class="dsec">World zoom</div><div class="drow">${opt('zoom','closer','Closer','')}${opt('zoom','normal','Normal','')}${opt('zoom','wider','Wider','see more')}</div>
    <small class="dnote">${DESK?'In a window, a resolution sizes the window. In full screen, it is what the game draws at.':'A browser can’t change your screen, so a resolution here is what the game draws at, scaled to fill the window. Lower is easier on an older computer.'}</small>
    <button class="btn" id="dispClose">Done</button>`;
  p.style.display='block';
  p.querySelectorAll('.dopt').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const k=b.dataset.k,v=b.dataset.v;
    if(k==='res')dispSetRes(v);else if(k==='mode')dispSetMode(v);else if(k==='zoom'){DISP.zoom=v;dispSave();dispApply();}else if(k==='ui'){DISP.ui=1;dispSave();dispApply();}
    setTimeout(()=>{if(p.style.display==='block')dispPick();},400);}));
  p.querySelectorAll('.dstep').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();DISP.ui=Math.round(Math.max(.7,Math.min(2.2,dispUi()+(+b.dataset.d)*.1))*10)/10;dispSave();dispApply();
    const l=$('dUi');if(l)l.textContent=Math.round(dispUi()*100)+'%';p.querySelectorAll('.dopt[data-k="ui"]').forEach(o=>o.classList.toggle('on',DISP.ui===1));}));
  $('dispClose').onclick=e=>{e.stopPropagation();p.style.display='none';};}
{const b=document.createElement('button');b.id='dispBtn';b.innerHTML=`<svg viewBox="0 0 20 20">${DISP_ICON}</svg><span class="lbl">Display</span>`;b.title='Display: resolution, full screen, interface size';
  b.setAttribute('aria-label','Display settings');b.addEventListener('click',e=>{e.stopPropagation();dispPick();});b.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
  document.body.appendChild(b);const p=document.createElement('div');p.id='dispPick';p.addEventListener('click',e=>e.stopPropagation());p.addEventListener('keydown',e=>{if(e.key==='Escape'){p.style.display='none';}});document.body.appendChild(p);
  const st=document.createElement('style');st.textContent=`
#dispBtn{position:fixed;z-index:31;display:flex;align-items:center;justify-content:center;padding:0;border:0;cursor:pointer;color:#f4e6c8;background:transparent;opacity:.8}
#dispBtn svg{width:15px;height:15px;flex:none}#dispBtn .lbl{display:none}
#dispBtn.inhud{position:absolute;top:4px;right:52px;width:24px;height:24px;pointer-events:auto}
#dispBtn.title{top:calc(env(safe-area-inset-top,0px) + 10px);height:36px;padding:0 12px;opacity:1;background:var(--px-panel,#2a1a0e);box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 3px #6a4a2a;zoom:var(--tu,1)}
#dispBtn.title svg{width:18px;height:18px}#dispBtn.title .lbl{display:inline;font-size:13px;margin-left:7px;letter-spacing:.04em}
#dispPick{position:fixed;z-index:1000;left:50%;top:50%;transform:translate(-50%,-50%);width:min(440px,92vw);max-height:92vh;overflow:auto;background:#2a1a0e;color:#f4e6c8;
  padding:14px 16px;font-size:14px;line-height:1.4;box-shadow:0 0 0 2px #1a0e06,0 0 0 4px #b8521c,0 10px 40px rgba(0,0,0,.6);display:none;zoom:var(--su,1)}
#dispPick .hd{display:block;font-size:16px;margin-bottom:8px;color:#ffd27a}
#dispPick .dinfo{background:#1e130a;padding:8px 10px;margin-bottom:6px;box-shadow:inset 0 0 0 2px #3a2616}
#dispPick .dsec{margin:10px 0 5px;color:#e0b070;font-size:13px;letter-spacing:.06em;text-transform:uppercase}
#dispPick .drow{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
#dispPick .dopt{display:flex;flex-direction:column;align-items:flex-start;padding:6px 9px;font:inherit;font-size:13px;color:inherit;cursor:pointer;background:#3a2616;border:2px solid #5a3e24;border-radius:3px;min-height:36px;justify-content:center}
#dispPick .dopt small{opacity:.75;font-size:11px}#dispPick .dopt.on{border-color:#e0b070;background:#5a3a1c}
#dispPick .dstep{width:36px;height:36px;font:inherit;font-size:20px;color:inherit;background:#3a2616;border:2px solid #5a3e24;border-radius:3px;cursor:pointer}
#dispPick #dUi{min-width:52px;text-align:center;font-size:16px}
#dispPick .dnote{display:block;margin:10px 0 4px;opacity:.75}
#dispPick #dispClose{display:block;margin:8px auto 0}
/* the hotbar and the Menu button live inside the button bar, which is already scaled: scaling them again squared it
   (3 x 3 = 9 on a 4K screen, off both edges) */
#buttons>#hotbar,#buttons>#btnBag{zoom:1!important}`;document.head.appendChild(st);
  // on the title screen beside Sound; in the HUD's corner beside the speaker during play
  const sync=()=>{const onTitle=!$('title').hidden||($('creator')&&!$('creator').hidden);const stat=$('stat');
    if(onTitle){b.className='title';if(b.parentElement!==document.body)document.body.appendChild(b);b.style.display='flex';
      const sb=$('sndBtn'),tu=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tu'))||1;
      const r=sb&&sb.style.display!=='none'?sb.getBoundingClientRect():null;b.style.left=r&&r.width>0?Math.round((r.right+8*tu)/tu)+'px':'12px';return;}   // (offsetParent is always null for a fixed button)
    if(b.className!=='inhud')b.className='inhud';if(b.style.left)b.style.left='';if(stat&&b.parentElement!==stat)stat.appendChild(b);{const _d=(S.paused||S.mode!=='play')&&$('dispPick').style.display!=='block'?'none':'flex';if(b.style.display!==_d)b.style.display=_d;}};  /* (t349) write only on change */
  setInterval(sync,300);sync();}
// apply what was chosen last time (full screen needs a click, so a browser asks again with the next one)
setTimeout(()=>{dispApply();if(DESK&&DESK.setFullScreen&&DISP.mode==='full')DESK.setFullScreen(true);},50);
addEventListener('pointerdown',function once(){removeEventListener('pointerdown',once,true);if(!DESK&&DISP.mode==='full'&&!fsOn()&&matchMedia('(pointer:fine)').matches){try{fsToggle();}catch(e){}}},true);
