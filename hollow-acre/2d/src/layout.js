/* ================= screen layout for phones in portrait and landscape, and a fullscreen button.
   Landscape phones have very little height (about 320 to 430 pixels), so there the HUD shrinks and moves to the edges,
   panels become scrollable, and the title and creator screens reflow side by side. ================= */
{const c=document.createElement('style');c.textContent=`
/* keep everything clear of the notch, the camera cut-out and the home bar, in both orientations */
#bars{right:calc(env(safe-area-inset-right,0px) + 10px)!important}
#btnBag,#btnJournal{left:calc(env(safe-area-inset-left,0px) + 12px)!important}
#hotbar{margin-left:env(safe-area-inset-left,0px)}
html,body{background:#07070a;overscroll-behavior:none}
:fullscreen,::backdrop{background:#07070a}
/* fullscreen button */
#fsBtn{position:fixed;z-index:31;top:calc(env(safe-area-inset-top,0px) + 10px);left:calc(env(safe-area-inset-left,0px) + 158px);width:34px;height:34px;padding:0;display:flex;align-items:center;justify-content:center;
  background:var(--px-panel,#2a1a0e);color:#f4e6c8;border:0;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 3px #6a4a2a;cursor:pointer}
#fsBtn svg{width:18px;height:18px;flex:none}#fsBtn .lbl{display:none;font-size:13px;margin-left:7px;letter-spacing:.04em}
#fsBtn.title{left:auto;right:calc(env(safe-area-inset-right,0px) + 12px);width:auto;padding:0 12px;height:36px}#fsBtn.title .lbl{display:inline}
#fsTip{position:fixed;z-index:999;left:50%;top:50%;transform:translate(-50%,-50%);width:min(360px,88vw);background:#2a1a0e;color:#f4e6c8;padding:16px 18px;font-size:14px;line-height:1.5;box-shadow:0 0 0 2px #1a0e06,0 0 0 4px #b8521c,0 10px 40px rgba(0,0,0,.6);display:none}
#fsTip b{color:#ffd27a}#fsTip button{margin-top:10px}
:fullscreen #fsBtn .on{display:none}#fsBtn .off{display:none}:fullscreen #fsBtn .off{display:block}
/* wide screens only for the big hotbar: never on a phone lying sideways */
@media (min-width:900px) and (max-height:540px){#hotbar{transform:translateX(-50%) scale(1)!important;bottom:calc(env(safe-area-inset-bottom,0px) + 8px)!important}}

/* ---------- phones in landscape ---------- */
@media (orientation:landscape) and (max-height:540px){
  #clock{zoom:.72;left:calc(env(safe-area-inset-left,0px) + 10px)}
  #inv{zoom:.62}
  #fsBtn{left:calc(env(safe-area-inset-left,0px) + 108px);top:calc(env(safe-area-inset-top,0px) + 8px);width:28px;height:28px}
  #objective{zoom:.8;max-width:calc((100vw - 380px)/.8)!important;left:50%!important;transform:translateX(-50%)!important;top:calc(env(safe-area-inset-top,0px) + 8px)!important;padding:6px 10px!important;
    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  #objective[hidden]{display:none!important}
  #lesson{zoom:.82;max-width:calc((100vw - 380px)/.82)!important}
  #toast{zoom:.78;width:min(70vw,560px)!important}
  #bars{zoom:.7;bottom:auto!important;top:calc((env(safe-area-inset-top,0px) + 62px)/.7)!important;right:calc(env(safe-area-inset-right,0px) + 12px)!important}
  #hotbar{zoom:.78;left:50%!important;transform:translateX(-50%)!important;bottom:calc(env(safe-area-inset-bottom,0px) + 4px)!important}
  #btnAct{zoom:.78}
  #buttons{right:calc(env(safe-area-inset-right,0px) + 8px)!important;bottom:calc(env(safe-area-inset-bottom,0px) + 6px)!important}
  #btnBag{left:calc(env(safe-area-inset-left,0px) + 10px)!important;bottom:calc(env(safe-area-inset-bottom,0px) + 92px)!important;top:auto!important}
  #btnJournal{left:calc(env(safe-area-inset-left,0px) + 10px)!important;bottom:calc(env(safe-area-inset-bottom,0px) + 60px)!important;top:auto!important}
  #maecard{zoom:.82;left:calc(env(safe-area-inset-left,0px) + 12px)!important;transform:none!important;bottom:calc((env(safe-area-inset-bottom,0px) + 128px)/.82)!important;width:min(380px,48vw)!important}
  #htip{zoom:.8;top:calc(env(safe-area-inset-top,0px) + 60px)!important}
  #saved{bottom:calc(env(safe-area-inset-bottom,0px) + 100px)!important}
  /* panels fit the short screen and scroll */
  .sheet{max-height:calc(100vh - 24px)!important;overflow:auto!important;padding:14px 18px!important;width:min(640px,86vw)!important}
  .sheet h2{margin-top:0!important}
  #scene{align-items:center!important}#scene>div{max-height:calc(100vh - 20px);overflow:auto}
  #tut{zoom:.8;top:calc(env(safe-area-inset-top,0px) + 64px)!important}
  /* the title screen: smaller heading, the how-to beside the buttons */
  #title{justify-content:safe center!important;padding:10px 24px!important;overflow:auto;gap:4px!important}
  #title #credits,#title .small{font-size:10px!important;margin:2px 0!important;max-width:80vw}#title #credits{display:none}
  #title h1{font-size:clamp(30px,9vh,56px)!important;margin:0!important}
  #title .kicker{margin:0!important}#title .tag{margin:4px 0 8px!important;font-size:14px!important}
  #title .howto{display:grid!important;grid-template-columns:1fr 1fr;gap:2px 18px;font-size:12px!important;margin-top:8px!important}
  #title .begin{padding-top:8px!important;padding-bottom:8px!important}
  /* the creator: preview on the left, options on the right */
  #creator{padding:max(6px,env(safe-area-inset-top)) 12px 6px!important;justify-content:safe center!important;overflow:auto}
  #creator .cwrap{display:grid!important;grid-template-columns:auto 1fr;grid-auto-rows:auto;column-gap:16px;row-gap:6px;width:min(760px,96vw)!important;align-items:start}
  #creator .cwrap>*{grid-column:2}
  #creator .cwrap>canvas,#creator .cwrap>.turn,#creator .cwrap>.kick,#creator #cKick{grid-column:1}
  #creator canvas{width:96px!important;height:128px!important;grid-row:2 / span 3}
  #creator .cpanel{max-height:calc(100vh - 150px)!important;gap:6px!important}
  #creator .chip{height:28px!important;min-width:28px!important;font-size:12px!important}#creator .chip.sw{width:28px!important}
  #creator .cbtns{margin-top:2px!important}#creator .cbtns .begin{padding-top:6px!important;padding-bottom:6px!important;font-size:18px!important}
  #creator #cName{padding:5px 8px!important}
  #end,#death,#credits2{overflow:auto}
  #end h1{font-size:clamp(28px,8vh,48px)!important}#end .story{font-size:14px!important;max-height:34vh;overflow:auto}
}
/* very short landscape screens (small phones): hide the stats panel until you tap the clock */
@media (orientation:landscape) and (max-height:380px){
  #inv{zoom:.56}#hotbar{zoom:.7}#btnAct{zoom:.7}#objective{zoom:.74}
}
/* ---------- phones in portrait: keep the bottom row clear of the home bar ---------- */
@media (orientation:portrait) and (max-width:500px){
  #fsBtn{left:calc(env(safe-area-inset-left,0px) + 12px);top:auto;bottom:calc(env(safe-area-inset-bottom,0px) + 182px)}
  #fsBtn.title{left:auto;right:calc(env(safe-area-inset-right,0px) + 12px);top:calc(env(safe-area-inset-top,0px) + 12px);bottom:auto}
}
`;document.head.appendChild(c);}
// ---- fullscreen: the real thing where the browser allows it; on iPhone, Add to Home Screen does it instead
const fsOK=()=>!!(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen);
const fsOn=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function fsToggle(){if(fsOn()){(document.exitFullscreen||document.webkitExitFullscreen).call(document);return;}
  if(fsOK()){const el=document.documentElement;const p=(el.requestFullscreen||el.webkitRequestFullscreen).call(el,{navigationUI:'hide'});if(p&&p.catch)p.catch(()=>fsHelp());return;}fsHelp();}
function fsHelp(){const t=$('fsTip');const ios=/iPhone|iPod/.test(navigator.userAgent);
  t.innerHTML=ios?`<b>Full screen on iPhone</b><br>iPhone browsers don’t allow web pages to go full screen. Instead: tap <b>Share</b> <span aria-hidden="true">⬆︎</span> in Safari, then <b>Add to Home Screen</b>. Open Hollow Acre from your home screen and it fills the whole screen, like an app. Your save comes with it.<br><button class="btn" id="fsOk">Got it</button>`
    :`<b>Full screen</b><br>This browser won’t go full screen from here. Try your browser’s menu, or press <b>F11</b> on a computer.<br><button class="btn" id="fsOk">Got it</button>`;
  t.style.display='block';$('fsOk').onclick=()=>{t.style.display='none';};}
{const b=document.createElement('button');b.id='fsBtn';b.setAttribute('aria-label','Full screen');b.title='Full screen';
  b.innerHTML='<svg class="on" viewBox="0 0 20 20"><path d="M2 7V2h5M13 2h5v5M18 13v5h-5M7 18H2v-5" fill="none" stroke="currentColor" stroke-width="2"/></svg><svg class="off" viewBox="0 0 20 20"><path d="M7 2v5H2M18 7h-5V2M13 18v-5h5M2 13h5v5" fill="none" stroke="currentColor" stroke-width="2"/></svg><span class="lbl">Full screen</span>';
  b.addEventListener('click',e=>{e.stopPropagation();fsToggle();});b.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});document.body.appendChild(b);
  const t=document.createElement('div');t.id='fsTip';document.body.appendChild(t);
  // already full screen as an installed app: no button needed
  const sync=()=>{const onTitle=!$('title').hidden||!$('creator')||!$('creator').hidden;b.classList.toggle('title',onTitle);const busy=!onTitle&&(S.paused||S.mode!=='play');b.style.display=standalone()||busy?'none':'flex';};
  setInterval(sync,250);sync();}
// ---- turning the phone: give the canvas a moment, then make sure nothing is left off screen
addEventListener('orientationchange',()=>setTimeout(()=>{dispatchEvent(new Event('resize'));},350));

const isTouch=()=>matchMedia('(pointer:coarse)').matches;
function fsPref(){try{return localStorage.getItem('hollowFS');}catch(e){return null;}}
function fsSetPref(v){try{localStorage.setItem('hollowFS',v);}catch(e){}}
let fsByUs=false;
document.addEventListener('fullscreenchange',()=>{const l=$('fsBtn').querySelector('.lbl');if(l)l.textContent=fsOn()?'Exit full screen':'Full screen';
  if(!fsOn()&&fsByUs&&S.mode==='play')fsSetPref('off');if(fsOn())fsSetPref('on');fsByUs=fsOn();
  setTimeout(()=>dispatchEvent(new Event('resize')),120);});
document.addEventListener('webkitfullscreenchange',()=>setTimeout(()=>dispatchEvent(new Event('resize')),120));
// on a phone, starting or continuing the game goes full screen (the tap that starts the game is what the browser needs to allow it)
for(const id of ['begin','cont','cGo'])addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('#'+id);if(!t)return;
  if(isTouch()&&fsOK()&&!fsOn()&&fsPref()!=='off'&&!standalone()){try{const el=document.documentElement;const p=(el.requestFullscreen||el.webkitRequestFullscreen).call(el,{navigationUI:'hide'});if(p&&p.catch)p.catch(()=>{});}catch(x){}}},true);
// a one-time tip on phones that can't go full screen from the page (iPhone)
setTimeout(function tip(){if(S.mode!=='play'){setTimeout(tip,4000);return;}let seen=null;try{seen=localStorage.getItem('hollowFSTip');}catch(e){}
  if(seen||standalone()||!isTouch()||fsOK())return;try{localStorage.setItem('hollowFSTip','1');}catch(e){}toast('Tip: tap the ⛶ button to learn how to play full screen.',4);},20000);
