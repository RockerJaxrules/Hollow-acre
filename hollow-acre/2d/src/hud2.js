/* ================= the HUD, redesigned: one symmetrical layout that rearranges itself for portrait phones, landscape phones,
   tablets and computers.
   Top:    [clock] [objective] [status]   (on a portrait phone the objective drops to its own row under the two cards)
   Bottom: [Menu] [hotbar] [act]          (on a portrait phone the hotbar gets its own row, the two buttons sit above its ends)
   Only the things that matter right now are shown; seeds and water live on the hotbar. Sizes come from one scale, --u. ================= */
{const c=document.createElement('style');c.textContent=`
:root{--u:1;--g:10px;--btn:64px;--slot:44px;--gl:max(var(--g),env(safe-area-inset-left,0px));--gr:max(var(--g),env(safe-area-inset-right,0px));--gt:calc(env(safe-area-inset-top,0px) + 8px);--gb:calc(env(safe-area-inset-bottom,0px) + 8px)}
/* ---------- the top bar ---------- */
#hud{position:fixed!important;top:var(--gt)!important;left:var(--gl)!important;right:var(--gr)!important;padding:0!important;margin:0!important;display:grid!important;
  grid-template-columns:1fr 1fr;grid-template-areas:"l r" "c c";gap:6px;align-items:stretch;pointer-events:none;zoom:var(--u)!important}
#hud[hidden]{display:none!important}
#hud>#clock{grid-area:l;margin:0!important;min-width:0!important;display:flex;flex-direction:column;justify-content:center;padding:6px 12px!important;position:static!important}
#stat{grid-area:r;display:flex;flex-direction:column;justify-content:center;gap:4px;padding:6px 12px;min-width:0;position:relative}
#stat .row1{display:flex;align-items:center;justify-content:space-between;gap:8px}
#stat .chip.coins{display:flex;align-items:center;gap:6px;font-size:18px;background:none!important;box-shadow:none!important;padding:0!important;border:0!important}
#stat .chip.coins svg{width:18px;height:18px}
#stat #bars{position:static!important;display:flex!important;flex-direction:column;gap:3px;pointer-events:none;zoom:1!important;right:auto!important;top:auto!important;bottom:auto!important}
#stat #bars .wrap{display:flex;align-items:center;gap:6px}#stat #bars b{font-size:10px;width:10px;line-height:1}
#stat #bars .bv{position:relative;flex:1;width:auto!important;height:7px!important;background:#1a0e06;box-shadow:inset 0 0 0 1px #000,0 0 0 1px #6a4a2a}
#stat #bars .bv i{position:absolute!important;left:0;top:0;bottom:0;height:100%!important;width:var(--pct,100%)}
#hudC{grid-area:c;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0}
#hudC>#objective{position:static!important;transform:none!important;left:auto!important;top:auto!important;width:100%!important;max-width:none!important;margin:0!important;zoom:1!important;
  text-align:center;padding:6px 10px!important;display:-webkit-box!important;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#hudC>#objective[hidden]{display:none!important}
#hudC>#inv{display:flex!important;flex-wrap:wrap;justify-content:center;gap:4px;padding:0!important;background:none!important;box-shadow:none!important;border:0!important;position:static!important;zoom:1!important}
#hudC>#inv .chip{padding:2px 7px!important;font-size:12px}#hudC>#inv .chip.off{display:none!important}#hudC>#inv .chip svg{width:14px;height:14px}
#hudC>#lesson{position:static!important;transform:none!important;zoom:1!important;max-width:100%!important;pointer-events:auto}
/* landscape and wide screens: one row */
@media (orientation:landscape),(min-width:700px){#hud{grid-template-columns:minmax(118px,180px) minmax(0,1fr) minmax(118px,180px);grid-template-areas:"l c r"}}
/* ---------- the bottom bar ---------- */
#btnBag{position:fixed!important;left:var(--gl)!important;right:auto!important;top:auto!important;bottom:var(--gb)!important;width:var(--btn)!important;height:var(--btn)!important;padding:0!important;zoom:var(--u)!important;
  display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:12px!important;z-index:7}
#btnBag[hidden]{display:none!important}
#btnBag .ico{font-size:22px;line-height:1}
#btnJournal{display:none!important}
#buttons{position:fixed!important;right:var(--gr)!important;left:auto!important;top:auto!important;bottom:var(--gb)!important;zoom:var(--u)!important;width:auto!important;height:auto!important;padding:0!important;display:flex!important}
#buttons[hidden]{display:none!important}
#btnAct{width:var(--btn)!important;height:var(--btn)!important;min-width:0!important;font-size:13px!important;zoom:1!important;padding:2px!important;line-height:1.1!important}
#hotbar{position:fixed!important;left:50%!important;right:auto!important;top:auto!important;bottom:var(--gb)!important;transform:translateX(-50%)!important;margin:0!important;zoom:var(--u)!important;gap:4px!important}
#hotbar .slot{width:var(--slot)!important;height:var(--slot)!important}
#hotbar .slot img{width:calc(var(--slot) - 12px)!important;height:calc(var(--slot) - 12px)!important;left:6px!important;top:6px!important}
/* portrait phones: the hotbar gets the whole bottom row, Menu and the act button sit above its ends */
@media (orientation:portrait) and (max-width:699px){
  #btnBag,#buttons{bottom:calc(var(--gb) + var(--slot) + 12px)!important}}
/* panels, screens and scenes scale with the screen too, and stay centred: scale by transform, not zoom */
.sheet{transform:translate(-50%,-50%) scale(var(--su,1))!important;transform-origin:50% 50%;max-height:calc(88vh / var(--su,1))!important;max-width:calc(94vw / var(--su,1))!important;overflow:auto!important}
#title>*,#creator>.cwrap{zoom:var(--tu,1)}#end>*,#death>*{zoom:var(--su,1)}
#scene .box{zoom:var(--su,1)}#credits2 .roll,#credits2 .sting{zoom:var(--su,1)}
#fsTip,#crash .dlg{zoom:var(--su,1)}#fsBtn.title{zoom:var(--tu,1)}
/* things that float over the world */
#toast{left:50%!important;transform:translateX(-50%)!important;top:var(--toastTop,30%)!important;width:min(560px,calc(100vw - 2*var(--g) - 20px))!important;zoom:var(--u)}
#maecard{left:50%!important;transform:translateX(-50%)!important;width:min(420px,calc(100vw - 2*var(--g) - 16px))!important;bottom:var(--floatBottom,140px)!important;zoom:var(--u)!important}
#tut,#htip{top:var(--toastTop,30%)!important;zoom:var(--u)!important}
@media (orientation:landscape) and (max-height:540px){#maecard{width:min(460px,56vw)!important;font-size:12px!important;padding:6px 10px!important;gap:8px!important}#maecard canvas{width:36px!important;height:36px!important}
  #toast{font-size:15px!important;width:min(460px,56vw)!important}}
body.maeTalking #hudC>#lesson{display:none!important}
#saved{left:50%!important;right:auto!important;transform:translateX(-50%);bottom:var(--floatBottom,140px)!important}
#fsBtn:not(.title){position:absolute!important;top:4px!important;right:4px!important;left:auto!important;bottom:auto!important;width:24px!important;height:24px!important;box-shadow:none!important;background:transparent!important;opacity:.8;pointer-events:auto}
#fsBtn:not(.title) svg{width:14px;height:14px}
`;document.head.appendChild(c);}
// ---- build the layout from the existing pieces
{const hud=$('hud'),clock=$('clock'),inv=$('inv');
  const stat=document.createElement('div');stat.id='stat';stat.className='panel';stat.innerHTML='<div class="row1"></div>';hud.appendChild(stat);
  const coins=inv.querySelector('.chip.coins');if(coins)stat.querySelector('.row1').appendChild(coins);
  const C=document.createElement('div');C.id='hudC';hud.appendChild(C);C.appendChild($('objective'));C.appendChild(inv);
  const mv=()=>{const b=$('bars');if(b&&b.parentElement!==stat)stat.appendChild(b);const l=$('lesson');if(l&&l.parentElement!==C)C.appendChild(l);
    const f=$('fsBtn');if(f&&!f.classList.contains('title')&&f.parentElement!==stat)stat.appendChild(f);if(f&&f.classList.contains('title')&&f.parentElement!==document.body)document.body.appendChild(f);};
  mv();setInterval(mv,400);
  const bb=$('btnBag');if(bb)bb.innerHTML='<span class="ico" aria-hidden="true">☰</span><span>Menu</span>';}
// ---- the old desktop zoom is replaced by one scale for everything
uiScale=function(){for(const id of ['hud','objective','buttons','bars','hotbar','toast','placeBar','subs'])if($(id))$(id).style.zoom='';for(const el of document.querySelectorAll('.sheet'))el.style.zoom='';};
function hudLayout(){const W=innerWidth,H=innerHeight,fine=matchMedia('(pointer:fine)').matches;const r=document.documentElement.style;
  let u=1;if(fine)u=clamp(Math.min(W/1150,H/720),1,1.8);else if(Math.min(W,H)>=700)u=1.15;r.setProperty('--u',u.toFixed(3));
  const su=fine?clamp(Math.min(W/1000,H/680),1,1.9):(Math.min(W,H)>=700?1.2:1);r.setProperty('--su',su.toFixed(3));const tu=fine?clamp(Math.min(W/760,H/620),1,2.1):(Math.min(W,H)>=700?1.25:1);r.setProperty('--tu',tu.toFixed(3));
  const port=H>W&&W<700;const short=H<480;const btn=short?54:port?60:66;r.setProperty('--btn',btn+'px');
  // how many hotbar slots fit, and how big
  const vw=W/u,gut=20;let avail=port?vw-gut:vw-gut-2*(btn+14);const n=clamp(Math.floor(avail/50),6,12);const slot=clamp(Math.floor(avail/n)-4,34,52);
  HUD_N=n;r.setProperty('--slot',slot+'px');
  // floating things sit clear of the bars
  requestAnimationFrame(()=>{const top=$('hud')&&!$('hud').hidden?$('hud').getBoundingClientRect().bottom:60;r.setProperty('--toastTop',Math.round(top+8)+'px');
    const bot=port?(slot+btn+28)*u:(Math.max(slot,btn)+20)*u;r.setProperty('--floatBottom',Math.round(bot+8)+'px');});}
let HUD_N=8;slotsVisible=function(){return HUD_N;};
addEventListener('resize',()=>{hudLayout();renderHotbar&&renderHotbar();});addEventListener('orientationchange',()=>setTimeout(()=>{hudLayout();renderHotbar&&renderHotbar();},300));
hudLayout();setInterval(hudLayout,1000);
// the bars run sideways now
setInterval(()=>{const e=$('barE'),h=$('barH');if(!e||!h)return;e.style.setProperty('--pct',Math.max(0,S.energy/S.energyMax*100)+'%');h.style.setProperty('--pct',Math.max(0,S.hp/S.hpMax*100)+'%');},250);
// only the chips that matter right now
setInterval(()=>{const inv=$('inv');if(!inv)return;const night=isNight();
  for(const ch of inv.querySelectorAll('.chip')){const t=(ch.getAttribute('title')||'').toLowerCase();let on=false;
    if(/basket/.test(t))on=S.basket.length>0;else if(/oil/.test(t))on=night||S.fuel<35;else if(/candle/.test(t))on=S.looped&&!S.bound;
    else if(/diary/.test(t))on=S.pages.length>0&&!S.bound;else if(/car parts/.test(t))on=!!(S.q&&S.q.hollis)&&!S.carFixed;else on=false;
    ch.classList.toggle('off',!on);}},500);

setInterval(()=>{const m=$('maecard');document.body.classList.toggle('maeTalking',!!m&&m.style.display==='flex');},200);
