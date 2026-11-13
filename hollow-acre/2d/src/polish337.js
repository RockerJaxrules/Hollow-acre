/* ================= t337 the final polish pass, from the whole-game review (t337/run_m1/NOTES.md).
   Toasts: a message that isn't the answer to something you just did waits while a letter, a shop, a talk, a close-up, a
   minigame, a chapter card or a scene is open, then plays when it closes, in order (it used to land on top of Grandpa's first
   letter, on dialog titles, and vanish behind minigames). A message that answers a click or a key you just pressed still shows
   at once, but low on the screen, clear of the open panel's title row. "Journal updated." is a pulse on the Menu button and a
   page sound instead of a box over the scene. ================= */
const PL37={lastIn:0,q:[],
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
      if(fresh){ui.toast.classList.add('pl37low');return _toast.apply(this,arguments);}
      if(!PL37.q.some(q=>q[0]===msg))PL37.q.push([msg,dur,red]);if(PL37.q.length>5)PL37.q.shift();return;}
    ui.toast.classList.remove('pl37low');return _toast.apply(this,arguments);};
  // play what waited, one at a time, once nothing is open
  setInterval(()=>{if(!PL37.q.length)return;if(pl37Busy())return;if(toastT>.35)return;const q=PL37.q.shift();
    ui.toast.classList.remove('pl37low');_toast(q[0],q[1],q[2]);},350);}
function pl37Pulse(){try{A.page&&A.page();}catch(e){}
  const b=document.getElementById('btnBag');if(!b)return;
  b.classList.remove('pl37pulse');void b.offsetWidth;b.classList.add('pl37pulse');}
{const css=document.createElement('style');css.textContent=
  '#toast.pl37low{top:auto!important;bottom:calc(120px * var(--u,1))!important}'+
  '@keyframes pl37p{0%{filter:none}30%{filter:brightness(1.6) drop-shadow(0 0 4px #ffd27a)}100%{filter:none}}.pl37pulse{animation:pl37p .9s steps(6) 2}';
  document.head.appendChild(css);}
