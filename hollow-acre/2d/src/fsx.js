/* ================= full screen that Esc doesn't throw you out of. Esc closes the game's menus, so in full screen the game
   locks the Esc key (the browser's Keyboard Lock): a quick press reaches the game and closes whatever is open, and only
   holding Esc down leaves full screen (the browser says so when you go full screen). And while you're in full screen an
   X sits in the top-right corner, above everything, menus and scenes included, to leave it with one click or tap.
   Keyboard Lock works in Chrome and Edge when the game is its own page (and in the desktop app); where the browser doesn't
   allow it (Safari, Firefox, or the game shown inside another page) Esc still leaves straight away, and the X is there. ================= */
const FSX={locked:false,told:false};
const fsExit=()=>{try{(document.exitFullscreen||document.webkitExitFullscreen).call(document);}catch(e){}};
function fsLockEsc(on){try{if(!navigator.keyboard||!navigator.keyboard.lock)return Promise.resolve(false);
    if(!on){navigator.keyboard.unlock();FSX.locked=false;return Promise.resolve(false);}
    return navigator.keyboard.lock(['Escape']).then(()=>(FSX.locked=true)).catch(()=>(FSX.locked=false));}catch(e){return Promise.resolve(false);}}
function fsChanged(){const on=fsOn();fsLockEsc(on).then(ok=>{if(!on||FSX.told||!matchMedia('(pointer:fine)').matches)return;FSX.told=true;
  toast(ok?'Esc closes menus now. Hold Esc down, or click ✕ in the top-right corner, to leave full screen.':'Click ✕ in the top-right corner to leave full screen.',3.6);});}
document.addEventListener('fullscreenchange',fsChanged);document.addEventListener('webkitfullscreenchange',fsChanged);
{const x=document.createElement('button');x.id='fsX';x.title='Leave full screen';x.setAttribute('aria-label','Leave full screen');
  x.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2.6" stroke-linecap="square" fill="none"/></svg>';
  x.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();fsExit();});x.addEventListener('pointerdown',e=>e.stopPropagation());x.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
  document.body.appendChild(x);
  const st=document.createElement('style');st.textContent=`#fsX{position:fixed;z-index:5000;top:calc(env(safe-area-inset-top,0px) + 3px);right:calc(env(safe-area-inset-right,0px) + 3px);width:30px;height:30px;padding:0;
  display:none;align-items:center;justify-content:center;cursor:pointer;color:#f4e6c8;background:rgba(30,16,8,.86);border:0;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 3px #8a5a2a}
#fsX svg{width:15px;height:15px}#fsX:hover{background:#7a2a18;color:#fff}`;document.head.appendChild(st);
  const sync=()=>{const on=fsOn();x.style.display=on?'flex':'none';const f=$('fsBtn');if(f)f.style.visibility=on&&!f.classList.contains('title')?'hidden':'';};
  document.addEventListener('fullscreenchange',sync);document.addEventListener('webkitfullscreenchange',sync);setInterval(sync,400);sync();}
