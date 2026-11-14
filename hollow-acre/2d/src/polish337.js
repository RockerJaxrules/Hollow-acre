/* ================= t337 the final polish pass, from the whole-game review (t337/run_m1/NOTES.md).
   Toasts: a message that isn't the answer to something you just did waits while a letter, a shop, a talk, a close-up, a
   minigame, a chapter card or a scene is open, then plays when it closes, in order (it used to land on top of Grandpa's first
   letter, on dialog titles, and vanish behind minigames). A message that answers a click or a key you just pressed still shows
   at once, but low on the screen, clear of the open panel's title row. "Journal updated." is a pulse on the Menu button and a
   page sound instead of a box over the scene. ================= */
const PL37={lastIn:0,q:[],seen:{},gap:0,
  modal:['note','shop','bag','talk','craft','cgame','fishMG','scene','crash','credits2','death','shipBin','saleSlip','lvlUp','mg4','acctPanel','chCard','scare','end','creator']};
for(const ev of ['pointerdown','keydown','touchstart'])window.addEventListener(ev,()=>{PL37.lastIn=performance.now();},true);
function pl37Vis(id){const e=document.getElementById(id);if(!e||e.hidden)return false;const cs=getComputedStyle(e);
  return cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>.05;}
function pl37Busy(){try{if(S.mode&&/^(cine|scene|ritual|scare|trans|end|dead|title)$/.test(S.mode))return true;
    if(typeof RU!=='undefined'&&RU&&(RU.on||RU.open))return true;
    return PL37.modal.some(pl37Vis);}catch(e){return false;}}
{const _toast=toast;
  toast=function(msg,dur,red){
    if(msg==='Journal updated.'){pl37Pulse();return;}
    const fresh=performance.now()-PL37.lastIn<450;
    if(pl37Busy()){
      if(fresh){ui.toast.classList.add('pl37low');PL37.seen[String(msg)]=performance.now();return _toast.apply(this,arguments);}
      if(!PL37.q.some(q=>q[0]===msg))PL37.q.push([msg,dur,red]);if(PL37.q.length>5)PL37.q.shift();return;}
    // (t349) one message at a time: a new one never cuts off the one you're reading (that was the flicker after a craft and on
    // waking, four messages replacing each other inside two seconds); it waits its turn unless it answers a tap you just made
    const showing=ui.toast.classList.contains('show')&&toastT>.3;
    if(showing&&ui.toast.textContent===String(msg))return;
    if(showing&&!fresh){if(!PL37.q.some(q=>q[0]===String(msg)))PL37.q.push([String(msg),dur,red]);if(PL37.q.length>5)PL37.q.shift();return;}
    ui.toast.classList.remove('pl37low');PL37.seen[String(msg)]=performance.now();return _toast.apply(this,arguments);};
  // play what waited, one at a time, once nothing is open: after the last message has faded out, with a short gap; a message
  // that was already on screen for a second (put back in line when a panel opened over it) is not played again
  setInterval(()=>{if(!PL37.q.length)return;if(pl37Busy())return;const now=performance.now();
    if(toastT>0||ui.toast.classList.contains('show')){PL37.gap=now;return;}if(now-(PL37.gap||0)<450)return;
    PL37.q=PL37.q.filter(q=>{const t=PL37.seen[q[0]];return !(t&&now-t>1000&&now-t<30000);});if(!PL37.q.length)return;
    let i=PL37.q.findIndex(q=>/^Day \d/.test(q[0]));if(i<0)i=0;const q=PL37.q.splice(i,1)[0];
    ui.toast.classList.remove('pl37low');PL37.seen[q[0]]=now;_toast(q[0],Math.max(2.2,q[1]||0),q[2]);},120);}
function pl37Pulse(){try{A.page&&A.page();}catch(e){}
  const b=document.getElementById('btnBag');if(!b)return;
  b.classList.remove('pl37pulse');void b.offsetWidth;b.classList.add('pl37pulse');}
{const css=document.createElement('style');css.textContent=
  '#toast.pl37low{top:auto!important;bottom:calc(120px * var(--u,1))!important}'+
  /* (t349) iPhone flicker: the old .panel and .btn styles blurred what was behind every HUD piece (backdrop-filter). Every piece now has a
     solid fill, so the blur showed nothing, but Safari re-composited it over the game every frame and flickered it whenever a
     pop-up faded in or out. Pop-ups also get their own stable layer so a fade never re-draws them mid-way. */
  '.panel,.btn,#clock,#stat,#objective,#inv,#skip,#btnBag,#btnJournal,#btnSeed,#btnTurn,#btnAct,#btnUse,#btnDecor,#buttons .btn,.sheet,#toast{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}'+
  '#toast,.sheet,#mindBanner{-webkit-backface-visibility:hidden;backface-visibility:hidden}'+
  '@keyframes pl37p{0%{filter:none}30%{filter:brightness(1.6) drop-shadow(0 0 4px #ffd27a)}100%{filter:none}}.pl37pulse{animation:pl37p .9s steps(6) 2}';
  document.head.appendChild(css);}
