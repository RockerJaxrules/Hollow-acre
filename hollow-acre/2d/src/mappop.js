// ================================================================ the map's pop-ups, front and centre (owner: "pin pop up isn't fully on
// screen on pc in fact a bunch of them aren't showing up it seems they aren't designed to be put front and centre no matter what
// including pins you don't place or just locations"). A place's card, a pin you dropped, a pin on the map you didn't (your goal, a
// milestone, a stop, someone you know), a region's note and the Show list all open in the middle of the screen, over a dimmed map,
// the whole of it on screen at any window size, on a phone and on the Deck. (They used to float beside the place inside the map's
// frame, placed in screen pixels inside a panel drawn scaled up, so on a big window they landed past the frame's edge and were cut
// off or never seen.) The place itself slides into view above or below the card, framed in gold. A tap on the dim, Esc or B
// closes it.
const MPOP={host:null,sig:''};
{const css=document.createElement('style');css.textContent=`
#m6Pop{position:fixed;inset:0;z-index:1200;display:flex;align-items:center;justify-content:center;background:rgba(14,8,4,.5);touch-action:none}
#m6Pop[hidden]{display:none!important}
#m6Pop.lg{background:rgba(14,8,4,.22)}
#m6Pop>#mapCard,#m6Pop>#mapLegend{position:relative!important;left:auto!important;top:auto!important;right:auto!important;bottom:auto!important;margin:0!important;flex:none;
  transform:scale(var(--mpk,1));transform-origin:50% 50%;box-sizing:border-box;overflow:auto;overscroll-behavior:contain;
  width:min(var(--mpw,380px),calc((100vw - 24px - env(safe-area-inset-left,0px) - env(safe-area-inset-right,0px)) / var(--mpk,1)))!important;
  max-width:none!important;max-height:calc((100vh - 24px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px)) / var(--mpk,1))!important;
  max-height:calc((100dvh - 24px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px)) / var(--mpk,1))!important;touch-action:pan-y}
#m6Pop>#mapLegend{--mpw:330px}
#m6Pop #m6CardClose{position:sticky!important;float:right;top:0;right:auto!important;margin:-4px -5px 4px 8px;z-index:2}
#m6Pop #mapCard .hd{padding-right:0!important}
#m6Pop #mapCard .acts2 button{flex:1 1 auto}
`;document.head.appendChild(css);}
// how big a pop-up is drawn: the menu's own scale
function mpopK(){const v=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--su'))||1;return Math.max(.6,Math.min(4,v));}
function mpopHost(){let h=MPOP.host;if(h&&h.isConnected)return h;h=MPOP.host=document.createElement('div');h.id='m6Pop';h.hidden=true;h.setAttribute('role','dialog');h.setAttribute('aria-modal','true');
  // a tap on the dim closes what's open; nothing under it moves
  h.addEventListener('pointerdown',e=>{if(e.target!==h)return;e.preventDefault();e.stopPropagation();h._down=true;});
  h.addEventListener('click',e=>{e.stopPropagation();if(e.target!==h||!h._down)return;h._down=false;mpopDismiss();});
  h.addEventListener('wheel',e=>{if(e.target===h)e.preventDefault();},{passive:false});
  document.body.appendChild(h);return h;}
function mpopDismiss(){try{if(M6.card)m6Card(null);else if($('mapLegend')&&!$('mapLegend').hidden)m6Legend(false);}catch(e){}mpopSync();}
// what's showing, moved into the host (or back into the map's frame when it closes)
function mpopSync(){const h=mpopHost(),card=$('mapCard'),lg=$('mapLegend'),wrap=$('mapWrap');
  const on=!!(M6.on&&wrap&&wrap.isConnected&&!$('bag').hidden);if(card&&!card.hidden&&!M6.card)card.hidden=true;   // (a card left open when the menu closed)
  const cOn=on&&card&&!card.hidden,lOn=on&&lg&&!lg.hidden&&!cOn;
  for(const [el,show] of [[card,cOn],[lg,lOn]]){if(!el)continue;if(show){if(el.parentElement!==h)h.appendChild(el);}else if(el.parentElement===h){if(wrap&&wrap.isConnected)wrap.appendChild(el);else el.remove();}}
  if(lg&&lg.parentElement===h&&cOn&&!lg.hidden)lg.hidden=true;   // (a card opened from the list: the list steps aside)
  const show=cOn||lOn;if(h.hidden===show)h.hidden=!show;if(h.classList.contains('lg')!==lOn)h.classList.toggle('lg',lOn);
  const k=mpopK().toFixed(3);if(h.style.getPropertyValue('--mpk')!==k)h.style.setProperty('--mpk',k);
  const w=(typeof GP!=='undefined'&&GP.mode==='touch'?420:380)+'px';if(h.style.getPropertyValue('--mpw')!==w)h.style.setProperty('--mpw',w);
  if(!show&&MPOP.sig){MPOP.sig='';}
  // a phone's keyboard up (typing a pin's note): the pop-up sits in what's left of the screen above it
  const vv=window.visualViewport;let T='',Hh='';if(show&&vv&&document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName)&&vv.height<innerHeight-60){T=Math.round(vv.offsetTop)+'px';Hh=Math.round(vv.height)+'px';}
  if(h.style.top!==T){h.style.top=T;h.style.bottom=T?'auto':'';}if(h.style.height!==Hh)h.style.height=Hh;}
// the card goes in the middle; the place it's about is slid into the clear part of the map and framed
m6CardPlace=function(){const c=$('mapCard');if(!c)return;for(const p of ['left','top','right','bottom','width'])if(c.style[p])c.style[p]='';mpopSync();
  if(!M6.card||c.hidden)return;const it=M6.card.it;if(!it||!isFinite(it.x)||!isFinite(it.z))return;const sig=(it.id||it.t)+'|'+Math.round(it.x)+','+Math.round(it.z);if(sig===MPOP.sig)return;MPOP.sig=sig;
  requestAnimationFrame(()=>{try{const wrap=$('mapWrap');if(!wrap||!M6.card)return;const W=wrap.getBoundingClientRect(),C=c.getBoundingClientRect();const sx=W.width/Math.max(1,M6.cw);
    const above=[W.top,Math.min(W.bottom,C.top)],below=[Math.max(W.top,C.bottom),W.bottom];const band=(above[1]-above[0])>=(below[1]-below[0])?above:below;if(band[1]-band[0]<44*sx)return;
    const ax=M6.cw/2,ay=((band[0]+band[1])/2-W.top)/sx;const v=M6.v;M6.z={k1:v.k,ax,ay,wx:m6BX(it.x),wy:m6BY(it.z)};M6.vel=[0,0];M6.hover=it.t==='draft'?null:it;m6Kick();}catch(e){}});};
{const _c=m6Card;m6Card=function(it,sx,sy){const r=_c.apply(this,arguments);if(!it)MPOP.sig='';mpopSync();return r;};}
{const _l=m6Legend;m6Legend=function(on){const r=_l.apply(this,arguments);mpopSync();return r;};}
// the name under the mouse: placed in the frame's own pixels (it's drawn scaled with the menu), kept inside the frame
m6Tip=function(it,sx,sy){const t=$('m6Tip');if(!t)return;if(!it||M6.card){if(!t.hidden)t.hidden=true;return;}
  let s=`<b>${m6Esc(it.t==='mile'?it.m.name:it.name)}</b>`;if(it.shop){const op=m6Open(it.shop);if(op!=null)s+=` <small>${op?'open now':'closed now'}</small>`;}else if(it.t==='folk')s+=` <small>${it.f.where}</small>`;else if(it.t==='region'&&it.rk&&!m6Found(it.rk))s+=' <small>not found yet</small>';
  if(t._s!==s){t._s=s;t.innerHTML=s;}if(t.hidden)t.hidden=false;const wrap=$('mapWrap');const lw=wrap?wrap.clientWidth:M6.cw,lh=wrap?wrap.clientHeight:M6.ch,f=lw/Math.max(1,M6.cw);
  const lx=sx*f,ly=sy*f,tw=t.offsetWidth,th=t.offsetHeight;let x=lx+14;if(x+tw>lw-4)x=lx-14-tw;x=Math.max(4,Math.min(lw-tw-4,x));let y=ly-th-10;if(y<4)y=ly+16;y=Math.max(4,Math.min(lh-th-4,y));
  const X=Math.round(x)+'px',Y=Math.round(y)+'px';if(t.style.left!==X)t.style.left=X;if(t.style.top!==Y)t.style.top=Y;};
// the host follows the map: closed with it, and a rebuilt page takes its new card
{const _rm=renderMap;renderMap=function(keep){const h=MPOP.host;if(h)for(const el of [...h.children])if(el.id==='mapCard'||el.id==='mapLegend'){const W=$('mapWrap');if(W&&W.isConnected&&!W.querySelector('#'+el.id))W.appendChild(el);else el.remove();}
  const r=_rm.apply(this,arguments);mpopSync();return r;};}
setInterval(()=>{try{if(MPOP.host&&(!MPOP.host.hidden||(M6.on&&(M6.card||($('mapLegend')&&!$('mapLegend').hidden)))))mpopSync();}catch(e){}},200);
addEventListener('resize',()=>{try{MPOP.sig='';mpopSync();}catch(e){}});
try{if(window.visualViewport)visualViewport.addEventListener('resize',()=>{try{mpopSync();}catch(e){}});}catch(e){}
// clicks inside the pop-up stay in it (the menu behind doesn't read them as a click outside)
mpopHost().addEventListener('click',e=>e.stopPropagation());
