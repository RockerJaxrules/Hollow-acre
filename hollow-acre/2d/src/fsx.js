/* ================= leaving full screen. Esc leaves it straight away when nothing else is open (some pages lock the keyboard
   in full screen and the browser then wants Esc held down; the game now does it on a normal press). And while you're in
   full screen an X sits in the top-right corner, above everything, menus and scenes included. ================= */
const fsExit=()=>{try{(document.exitFullscreen||document.webkitExitFullscreen).call(document);}catch(e){}};
function fsSomethingOpen(){
  for(const id of ['bag','shop','note','talk','craft','shipBin','saleSlip','lvlUp','fsTip','sndPick']){const el=$(id);if(el&&!el.hidden&&getComputedStyle(el).display!=='none')return true;}
  if(typeof SCENE!=='undefined'&&SCENE)return true;if(document.querySelector('.sheet:not([hidden])'))return true;
  if((typeof PLACE!=='undefined'&&PLACE.on)||(typeof CG!=='undefined'&&CG.on)||(typeof MG!=='undefined'&&MG.on))return true;
  if(typeof fish!=='undefined'&&fish.state&&fish.state!=='off')return true;return false;}
addEventListener('keydown',e=>{if(e.code!=='Escape'||e.repeat||!fsOn())return;if(fsSomethingOpen())return;e.preventDefault();fsExit();},true);
{const x=document.createElement('button');x.id='fsX';x.title='Leave full screen (Esc)';x.setAttribute('aria-label','Leave full screen');
  x.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2.6" stroke-linecap="square" fill="none"/></svg>';
  x.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();fsExit();});x.addEventListener('pointerdown',e=>e.stopPropagation());x.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
  document.body.appendChild(x);
  const st=document.createElement('style');st.textContent=`#fsX{position:fixed;z-index:5000;top:calc(env(safe-area-inset-top,0px) + 3px);right:calc(env(safe-area-inset-right,0px) + 3px);width:30px;height:30px;padding:0;
  display:none;align-items:center;justify-content:center;cursor:pointer;color:#f4e6c8;background:rgba(30,16,8,.86);border:0;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 3px #8a5a2a}
#fsX svg{width:15px;height:15px}#fsX:hover{background:#7a2a18;color:#fff}`;document.head.appendChild(st);
  const sync=()=>{const on=fsOn();x.style.display=on?'flex':'none';const f=$('fsBtn');if(f)f.style.visibility=on&&!f.classList.contains('title')?'hidden':'';};
  document.addEventListener('fullscreenchange',sync);document.addEventListener('webkitfullscreenchange',sync);setInterval(sync,400);sync();}
