// ================================================================ Samsung phones, tablets, foldables and Samsung Internet (owner: "Add
// better Samsung support"). What a Galaxy does to a web game, and what the game does about it:
//   - DARK MODE: Samsung Internet (and Chrome's own) can recolour pages dark. The game is dark already and says so in every way the
//     browsers read (the color-scheme tag and the page's own colour scheme, "only dark"), so its parchment cards and the journal's
//     paper keep their colours instead of being turned over. (Tested with the browser's forced dark: nothing changes.)
//   - TEXT SIZE: the browser's text scaling (Samsung Internet's slider, Android's font size) used to grow only the letters, so they
//     spilled out of their buttons. Now the game reads the size you chose and grows the whole interface by it instead.
//   - THE BACK GESTURE and back button: a swipe in from the side (or Back) in the middle of play no longer leaves the game: it closes
//     what's open, or opens the menu (the game pauses), like a game from the store. On the title screen Back works as it always did.
//   - FOLDING: a Fold opened or closed, a Flip turned, a window in DeX resized: the game lays itself out again at once, every open
//     panel and map card included. Half-folded (Flex mode), pop-ups sit in the upper half, clear of the fold.
//   - DeX: a Galaxy on a monitor is a computer (the mouse's hints and hover names), never mistaken for a Steam Deck.
//   - 120 Hz: on a phone that draws 120 frames a second the game holds 60 unless you choose otherwise (Settings > Display > Frame
//     rate): half the work for the same game, so the phone stays cool and the battery lasts. A choice you made is kept.
//   - S PEN: hovering the pen over the map shows the name under it, as a mouse does.
//   - GAME BOOSTER: installed from the browser (Add to Home screen) the game is a full-screen app the Game Launcher can list as a game.
const SAM={ua:navigator.userAgent||''};
SAM.browser=/SamsungBrowser/i.test(SAM.ua);SAM.android=/Android/i.test(SAM.ua);SAM.galaxy=/SM-[A-Z]\d|SAMSUNG|Galaxy/i.test(SAM.ua)||SAM.browser;
SAM.dex=SAM.browser&&!SAM.android&&/X11|Linux x86_64/.test(SAM.ua);
if(SAM.galaxy)document.body.classList.add('samsung');if(SAM.dex)document.body.classList.add('samDex');

// ---- dark mode: the page is dark, and says so (a tag in the head for the browsers that read only that, and the root's own scheme)
{const head=document.head;const meta=(n,c)=>{let m=head.querySelector(`meta[name="${n}"]`);if(!m){m=document.createElement('meta');m.name=n;head.prepend(m);}if(m.content!==c)m.content=c;};
  meta('color-scheme','dark');meta('supported-color-schemes','dark');
  const st=document.createElement('style');st.textContent=':root{color-scheme:only dark}';head.appendChild(st);}
// is the browser darkening pages at all? (for the record and the tests: the page itself stays as it is)
function samForcedDark(){try{const d=document.createElement('div');d.style.cssText='display:none;background-color:canvas;color-scheme:light';document.body.appendChild(d);const c=getComputedStyle(d).backgroundColor;d.remove();
  const m=/(\d+),\s*(\d+),\s*(\d+)/.exec(c);return !!m&&(+m[1]+ +m[2]+ +m[3])<300;}catch(e){return false;}}
SAM.fdark=samForcedDark();

// ---- the browser's text size, read once (and again when you come back to the game), then given to the whole interface
function samTextScale(){try{const p=document.createElement('div');p.id='samTextProbe';p.setAttribute('aria-hidden','true');
    p.style.cssText='position:absolute;left:0;top:-9999px;width:100%;visibility:hidden;pointer-events:none;font:20px/1 sans-serif;-webkit-text-size-adjust:auto;text-size-adjust:auto';
    p.textContent='The quick brown fox jumps over the lazy dog. '.repeat(12);document.body.appendChild(p);const fs=parseFloat(getComputedStyle(p).fontSize)||20;p.remove();
    return Math.max(1,Math.min(1.8,Math.round(fs/20*20)/20));}catch(e){return 1;}}
function samTextApply(){const r=samTextScale();if(r!==(PHYS.textK||1)){PHYS.textK=r;try{dispApply();}catch(e){}}
  // a small window can't grow its panels that far (a phone held sideways): what's left over goes to the game's own larger text
  // (Settings > Accessibility > Bigger text: the reading parts of the panels, laid out for it), unless the panels took it all
  try{const got=(parseFloat(document.documentElement.style.getPropertyValue('--su'))||1)/Math.max(.5,(typeof physFitSu==='function'?physFitSu():1)*Math.max(1,PHYS.k>1?1:1));
    const big=r>1.08&&got<r*.92;if(document.body.classList.contains('samBig')!==big)document.body.classList.toggle('samBig',big);}catch(e){}}
{const st=document.createElement('style');st.textContent='body.samBig #bagBody,body.samBig #noteText,body.samBig #talk,body.samBig .toast,body.samBig #m6Tip,body.samBig #mapCard{zoom:1.14}';document.head.appendChild(st);}
addEventListener('resize',()=>setTimeout(()=>{try{samTextApply();}catch(e){}},200));
// (the letters then stay the size the panels were made for: the larger size comes from the panels growing with them)
{const st=document.createElement('style');st.textContent='html,body{-webkit-text-size-adjust:none;text-size-adjust:none}#samTextProbe{-webkit-text-size-adjust:auto!important;text-size-adjust:auto!important}';
  samTextApply();document.head.appendChild(st);}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>{try{samTextApply();}catch(e){}},300);});

// ---- Back (the side swipe, or the button) while you play: close what's open, or open the menu; never out of the game by accident
SAM.back={armed:false};
function samBackOn(){return (SAM.android||(navigator.maxTouchPoints||0)>0&&matchMedia('(pointer:coarse)').matches)&&!SAM.dex;}
function samArm(){if(SAM.back.armed||!samBackOn())return;try{history.pushState({hollowPlay:1},'');SAM.back.armed=true;}catch(e){}}
function samBack(){try{if(typeof S==='undefined'||S.mode!=='play')return false;
    if(typeof M6!=='undefined'&&M6.on&&(M6.card||M6.pinMode||($('mapLegend')&&!$('mapLegend').hidden))){if(M6.pinMode){M6.pinMode=false;const b=$('m6PinB');if(b)b.classList.remove('on');}else if(M6.card)m6Card(null);else m6Legend(false);return true;}
    if(typeof gpCands==='function'){gpCands();if(GP.root&&GP.root.id!=='title'){gpBack();return true;}}
    if(!S.paused&&typeof openBag==='function'){openBag((typeof M66!=='undefined'&&M66.lastTab)||'items');return true;}}catch(e){console.warn(e);}return true;}
addEventListener('popstate',()=>{if(!SAM.back.armed)return;SAM.back.armed=false;if(typeof S!=='undefined'&&S.mode==='play'){samBack();samArm();}});
setInterval(()=>{try{if(typeof S!=='undefined'&&S.mode==='play')samArm();}catch(e){}},1000);

// ---- folding, turning, resizing: everything laid out again at once (the window's size changes in one step on a Fold)
{let last='';const relayout=()=>{const k=innerWidth+'x'+innerHeight+'|'+(screen.width||0)+'x'+(screen.height||0);if(k===last)return;last=k;
    try{if(typeof physUpdate==='function')physUpdate();}catch(e){}try{dispApply();}catch(e){}try{if(typeof M6!=='undefined'&&M6.on){m6Size();m6Kick();}}catch(e){}try{if(typeof mpopSync==='function'){MPOP.sig='';mpopSync();}}catch(e){}};
  addEventListener('resize',relayout);try{if(screen.orientation)screen.orientation.addEventListener('change',()=>setTimeout(relayout,60));}catch(e){}
  try{if(navigator.devicePosture)navigator.devicePosture.addEventListener('change',()=>setTimeout(relayout,60));}catch(e){}
  try{if(window.visualViewport)visualViewport.addEventListener('resize',relayout);}catch(e){}}
// half-folded with the fold across the screen (a Flip or a Fold in Flex mode): the map's pop-ups and the menus in the upper half
{const st=document.createElement('style');st.textContent=`@media (vertical-viewport-segments:2){
#m6Pop{bottom:auto!important;height:env(viewport-segment-height 0 0,50vh)!important}
.sheet{top:calc(env(viewport-segment-height 0 0,50vh) / 2)!important;max-height:calc((env(viewport-segment-height 0 0,50vh) - 12px) / var(--su,1))!important}}`;document.head.appendChild(st);}

// ---- DeX: a computer, not a Deck
if(SAM.dex&&typeof DECK!=='undefined'&&DECK.on&&DECK.why==='screen'){DECK.on=false;document.body.classList.remove('deck');try{physUpdate();dispApply();}catch(e){}}

// ---- 120 Hz phones: 60 frames a second unless you chose otherwise
{const saved=(()=>{try{const o=JSON.parse(localStorage.getItem('hollowSettings')||'null');return !!(o&&'fpsCap' in o);}catch(e){return true;}})();
  if(!saved&&(SAM.android||/iPhone|iPad/.test(SAM.ua))&&typeof SET7!=='undefined'&&SET7.fpsCap==='off'){const T=[];let n=0;const f=t=>{T.push(t);if(++n<70)requestAnimationFrame(f);else{
      const d=[];for(let i=11;i<T.length;i++)d.push(T[i]-T[i-1]);d.sort((a,b)=>a-b);const med=window.__hollowHz?1000/__hollowHz:(d[d.length>>1]||16.7);SAM.hz=Math.round(1000/med);
      if(SAM.hz>75&&SET7.fpsCap==='off'){SET7.fpsCap='60';SAM.capped=true;}}};setTimeout(()=>requestAnimationFrame(f),4000);}}

// ---- the S Pen hovering over the map: the name under it, as with a mouse
{const hook=()=>{const cv=$('mapView');if(!cv||cv._samPen)return;cv._samPen=true;
    cv.addEventListener('pointermove',e=>{if(e.pointerType!=='pen'||e.buttons||M6.ptr.size)return;const r=cv.getBoundingClientRect(),f=M6.cw/Math.max(1,r.width);const x=(e.clientX-r.left)*f,y=(e.clientY-r.top)*f;
      const it=m6HitAt(x,y);if((it&&it.id)!==(M6.hover&&M6.hover.id)){M6.hover=it;m6Kick();}m6Tip(it,x,y);});
    cv.addEventListener('pointerleave',e=>{if(e.pointerType!=='pen')return;if(M6.hover&&!M6.card){M6.hover=null;m6Kick();}m6Tip(null);});};
  if(typeof renderMap==='function'){const _rm=renderMap;renderMap=function(){const r=_rm.apply(this,arguments);try{hook();}catch(e){}return r;};}}
