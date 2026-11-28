// ================================================================ the interface sized by the real screen, not just its pixels (owner:
// "Steam deck map is not good enough design the ui so it works well with the resolution not just fit think if some screens are
// smaller ui needs to be bigger so people can read it and interact with it well").
// The menus and the HUD used to grow only with the window's pixels. A Steam Deck is 1280 x 800 like a laptop, but on a 7-inch
// screen: each pixel is less than half a laptop's, so everything came out small. Now the game works out how big a pixel really is
// and how far away the screen is held, and sets a floor under the interface so text reads at the same size to your eye as it
// does on a phone (the Deck's own guide: the smallest letters at least 9 pixels tall at 1280 x 800):
//   - a Steam Deck (its screen 7 inches, held at about 38 cm): about 1.6 times;
//   - a phone or tablet: its browser's pixels are already sized for the hand, so it stays as it was (and touch targets reach 9 mm);
//   - a laptop or a monitor: as before, filled to the window (their pixels are not known to the page).
// Settings > Display > Interface size still makes it bigger or smaller on top of that, and shows what it was sized for.
// Touch targets are at least 9 mm on a touchscreen (76 pixels on a Deck, about 50 on a phone) wherever a button is sized for touch.
const PHYS={k:1,mmpx:.25,dist:600,kind:'desk',tap:46,why:''};
function physEstimate(){const sw=screen.width||innerWidth,sh=screen.height||innerHeight,dpr=window.devicePixelRatio||1,ua=navigator.userAgent||'';
  const touch=(navigator.maxTouchPoints||0)>0,coarse=matchMedia('(pointer:coarse)').matches,fineAny=matchMedia('(any-pointer:fine)').matches;
  const big=Math.max(sw,sh),small=Math.min(sw,sh);let mmpx=.25,dist=600,kind='desk',T=.00042,why='a monitor or laptop';
  // the Deck's own screen (not a TV or monitor it's docked to): 7 inches across the corner
  const deckScr=typeof DECK!=='undefined'&&DECK.on&&Math.abs(big*dpr-1280)<4&&Math.abs(small*dpr-800)<4;
  if(deckScr){mmpx=7*25.4/Math.hypot(sw,sh);dist=380;kind='deck';T=.0005;why='a Steam Deck’s 7-inch screen';}
  else if(/Android|iPhone|iPad|iPod|Mobile/i.test(ua)||(touch&&coarse&&!fineAny)||(touch&&/Macintosh/.test(ua)&&navigator.maxTouchPoints>1)){
    // a phone or tablet browser's pixels are sized for the hand already (Android: about 1/160 inch, Apple's a touch smaller)
    const tab=small>=600;mmpx=/iPhone|iPod/.test(ua)?.166:tab?.185:.18;dist=tab?400:320;kind=tab?'tablet':'phone';T=.0005;why=tab?'a tablet':'a phone';}
  let k=T*dist/mmpx;const tap=Math.round(9/mmpx);if(kind==='phone'||kind==='tablet')k=Math.min(1,k);   // (a phone's or tablet's own layouts are made for its pixels as they are)
  return {k:Math.round(k*100)/100,mmpx,dist,kind,tap,why};}
function physUpdate(){const p=physEstimate();const ch=p.k!==PHYS.k||p.tap!==PHYS.tap||p.kind!==PHYS.kind;Object.assign(PHYS,p);
  const r=document.documentElement.style,t=PHYS.tap+'px';if(r.getPropertyValue('--tap')!==t)r.setProperty('--tap',t);
  const b=document.body.classList;for(const [c,on] of [['physDeck',PHYS.kind==='deck'],['physSmall',PHYS.k>1.25]])if(b.contains(c)!==on)b.toggle(c,on);return ch;}
physUpdate();
// ---- the scale. hud2's layout multiplies its own window-fit sizes by dispUi(); that is now your setting times the floor, and the
// largest it may reach still leaves the menu its own width and a phone's height of room (the panels scroll beyond that)
function physFitSu(){const W=innerWidth,H=innerHeight,fine=matchMedia('(pointer:fine)').matches;return fine?clamp(Math.min(W/1000,H/680),1,4):(Math.min(W,H)>=700?1.2:1);}
function physMan(){try{const v=+DISP.ui;return isFinite(v)?Math.max(.7,Math.min(2.2,v)):1;}catch(e){return 1;}}
dispUi=function(){const man=physMan(),base=physFitSu(),W=innerWidth,H=innerHeight;const want=Math.max(base,PHYS.k)*man*(PHYS.textK||1);   // (textK: the phone's own text size, when it's set larger)
  const cap=Math.max(base,Math.min((W-16)/640,(H-16)/440));const su=man*(PHYS.textK||1)>1?Math.min(want,Math.max(cap,Math.max(base,PHYS.k))):want;return su/base;};
// what Settings shows and steps is your own setting, not the floor under it
if(typeof set7Val==='function'){const _v=set7Val;set7Val=function(r){if(r&&r.type==='pref'&&r.k==='ui')return Math.round(physMan()*100)+'%';return _v.apply(this,arguments);};}
if(typeof set7Act==='function'){const _a=set7Act;set7Act=function(r,d,el){if(r&&r.type==='pref'&&r.k==='ui'){try{SFX.click&&SFX.click();}catch(e){}const cur=physMan();let i=0;
    SET7_UI.forEach((v,j)=>{if(Math.abs(v-cur)<Math.abs(SET7_UI[i]-cur))i=j;});DISP.ui=SET7_UI[Math.max(0,Math.min(SET7_UI.length-1,i+d))];dispSave();dispApply();set7Refresh();return;}return _a.apply(this,arguments);};}
if(typeof set7Rows==='function'){const _r=set7Rows;set7Rows=function(g){const R=_r.apply(this,arguments);try{if(g==='display'){const q=R.find(r=>r.type==='pref'&&r.k==='ui');
    if(q)q.sub=PHYS.k>1.05?`Sized for ${PHYS.why}: 100% is already larger there`:'100% fits your window';}}catch(e){}return R;};}
if(typeof dispPick==='function'){const _dp=dispPick;dispPick=function(){const r=_dp.apply(this,arguments);try{const p=$('dispPick');const l=$('dUi');const s=Math.round(physMan()*100)+'%';if(l&&l.textContent!==s)l.textContent=s;
    p.querySelectorAll('.dstep').forEach(b=>{if(b._p7)return;const n=b.cloneNode(true);n._p7=true;b.replaceWith(n);n.addEventListener('click',e=>{e.stopPropagation();DISP.ui=Math.round(Math.max(.7,Math.min(2.2,physMan()+(+n.dataset.d)*.1))*10)/10;dispSave();dispApply();
      const l2=$('dUi');if(l2)l2.textContent=Math.round(physMan()*100)+'%';p.querySelectorAll('.dopt[data-k="ui"]').forEach(o=>o.classList.toggle('on',DISP.ui===1));});});
    if(PHYS.k>1.05&&!p.querySelector('.physNote')){const d=p.querySelector('.dsize');if(d){const sm=document.createElement('small');sm.className='dnote physNote';sm.textContent=`Sized for ${PHYS.why}. 100% is already larger there; this changes it from that.`;d.after(sm);}}}catch(e){}return r;};}
// the screen can change under the game (a Deck docked to a TV, a phone folded or turned): look again, lay out again
{let last='';const chk=()=>{try{const s=screen.width+'x'+screen.height+'@'+(window.devicePixelRatio||1)+(typeof DECK!=='undefined'&&DECK.on?'d':'');if(s===last)return;last=s;if(physUpdate())dispApply();}catch(e){}};
  addEventListener('resize',chk);setInterval(chk,1500);setTimeout(chk,600);setTimeout(chk,2500);}   /* (the desktop app says it's a Deck a moment after the start) */
try{dispApply();}catch(e){}

// ---- touch targets: 9 mm wherever a button is sized for touch. The menus size their touch buttons as "46 px after the menu's
// scale" (calc(46px / var(--su))); those read the screen's own 9 mm now (--tap), never less than they were
function physTapCss(st){try{const s=st.textContent;if(!s||st._ptap===s.length||!/px \/ var\(--su/.test(s))return;
  const n=s.replace(/calc\((4[0-9]|5[0-6])px \/ var\(--su,1\)\)/g,'calc(max($1px, var(--tap, 0px)) / var(--su,1))');if(n!==s){st.textContent=n;}st._ptap=st.textContent.length;}catch(e){}}
for(const st of document.querySelectorAll('style'))physTapCss(st);
try{new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.tagName==='STYLE')physTapCss(n);}).observe(document.head,{childList:true});}catch(e){}

// ---- the map's names and pictures grow with the interface (they're drawn in the screen's own pixels, so the menu's scale
// passed them by): on a Deck the place names are 20 pixels tall and the icons a third bigger
function physMapK(){const su=parseFloat(document.documentElement.style.getPropertyValue('--su'))||1;return Math.max(1,su/1.2);}
if(typeof m6Scale==='function'){m6Scale=function(kk){const f=physMapK();let d=M6.dpr*f;if(f>1.05&&d>=1.25&&d<1.5)d=1.5;const far=(kk||M6.v.k)<.5;
  return {ic:Math.max(2,Math.round(d*1.7)),tx:d<1.5?13:Math.round(d*1.4)*10,hd:Math.max(1,Math.round(d*1.1)),rg:far?(d<1.5?10:Math.round(d*1.2)*10):(d<1.5?20:Math.round(d*2)*10)};};}

// ---- the map on a Deck: the whole screen (the frame, the names and the buttons all a size you can read at arm's length)
{const css=document.createElement('style');css.textContent=`
body.physDeck #bag.m6on{width:calc((100vw - 12px) / var(--su,1))!important;max-width:none!important;height:calc((100vh - 12px) / var(--su,1))!important;max-height:none!important}
body.physDeck #bag.m6on #mapWrap{min-height:0}
`;document.head.appendChild(css);}

// ---- on a small, dense screen (a Deck) no letter is drawn under 18 pixels (9 pixels for a small letter: the Deck's guide), wherever
// it is: a note in a panel, a count, a hint. Each piece of text is measured once as it appears (and again if the window changes)
// and only one that is too small is changed; nothing is written while it reads well.
const PMF={seen:new WeakSet(),set:new Set(),min:18,dirty:true,sig:''};
const PMF_ROOTS='#hud,#buttons,#bag,#shop,#talk,#note,#craft,#cgame,.sheet,[data-modal],#mg4,#m6Pop,#gpCtl,#dispPick,#sndPick,#toast,.toast,#subs,#placeBar,#title,#creator,#mindBanner,#lvlUp,#saleSlip,#shipBin,#fGame,#tut';
function physMinFont(){if(!document.body.classList.contains('physSmall')){if(PMF.set.size){for(const el of PMF.set)el.style.removeProperty('font-size');PMF.set.clear();PMF.seen=new WeakSet();}return;}
  const sig=innerWidth+'x'+innerHeight+'|'+(document.documentElement.style.getPropertyValue('--su'))+'|'+(document.documentElement.style.getPropertyValue('--u'));
  if(sig!==PMF.sig){PMF.sig=sig;for(const el of PMF.set)el.style.removeProperty('font-size');PMF.set.clear();PMF.seen=new WeakSet();}
  for(const root of document.querySelectorAll(PMF_ROOTS)){if(root.hidden||!root.getClientRects().length)continue;
    for(const el of root.querySelectorAll('*')){if(PMF.seen.has(el))continue;const tg=el.tagName;if(tg==='SCRIPT'||tg==='STYLE'||tg==='CANVAS'||tg==='svg'||el.closest('svg'))continue;
      let tx=false;for(const n of el.childNodes)if(n.nodeType===3&&n.textContent.trim()){tx=true;break;}if(!tx)continue;   /* (no words of its own yet: looked at again when it has some) */
      const oh=el.offsetHeight;if(!oh||!el.getClientRects().length)continue;PMF.seen.add(el);if(el.closest('#hotbar'))continue;
      const fs=parseFloat(getComputedStyle(el).fontSize)||0;const r=el.getBoundingClientRect();const sc=r.height/oh;if(!(sc>0)||!fs)continue;
      if(fs*sc<PMF.min-.5){el.style.setProperty('font-size',(PMF.min/sc).toFixed(2)+'px','important');PMF.set.add(el);}}}
  for(const el of PMF.set)if(!el.isConnected)PMF.set.delete(el);}
try{new MutationObserver(()=>{PMF.dirty=true;}).observe(document.body,{childList:true,subtree:true});}catch(e){}
setInterval(()=>{if(!PMF.dirty&&PMF.sig)return;PMF.dirty=false;try{physMinFont();}catch(e){}},400);
addEventListener('resize',()=>{PMF.dirty=true;PMF.sig='';});

// ---- the rest of a small, dense screen: the panels may use all of it, and the pieces drawn outside the menus' own scale (the
// making games' notes and Skip, the corner X, the toolbar's numbers) are a size you can read and press
{const css=document.createElement('style');css.textContent=`
.sheet.pop7fit{max-height:calc((100vh - 16px) / var(--su,1))!important;max-width:calc((100vw - 16px) / var(--su,1))!important}   /* (a panel drawn scaled: the guard's limit in its own pixels) */
body.physSmall #bag{width:min(800px,calc((100vw - 16px) / var(--su,1)))!important;max-width:none!important;max-height:calc((100vh - 12px) / var(--su,1))!important}
body.physSmall .sheet{max-height:calc((100vh - 12px) / var(--su,1))!important;max-width:calc((100vw - 12px) / var(--su,1))!important}
body.physSmall #mg4.mgfit .t{font-size:20px!important;padding:3px 10px!important}
body.physSmall #mg4.mgfit .h{font-size:20px!important;line-height:1.3!important;padding:5px 12px!important}
body.physSmall #mg4.mgfit #mg4Skip{font-size:20px!important;padding:0 10px!important}
body.physSmall #mg4.mgfit #mgfTurn{font-size:20px}
body.physSmall #fsX{width:calc(34px * var(--u,1))!important;height:calc(34px * var(--u,1))!important}body.physSmall #fsX svg{width:calc(15px * var(--u,1))!important;height:calc(15px * var(--u,1))!important}
body.physSmall #hotbar .slot b{font-size:14px!important}
body.physDeck #mg4:not(.mgfit) canvas{width:min(calc(100vw - 64px),calc((100vh - 224px)*16/9))!important}
`;document.head.appendChild(css);}
// ---- a finger on a Deck: every button in a panel at least 9 mm (76 pixels) each way; the corner X to leave full screen steps aside
// while a menu is open (the menu's own X is right there)
{const css=document.createElement('style');css.textContent=`
body.physDeck.in-touch :is(#bag,#shop,#talk,#craft,#note,#m6Pop,#gpCtl,#dispPick,#sndPick,.sheet,[data-modal]) :is(button,[role=button],select){min-height:calc(var(--tap,76px) / var(--su,1));min-width:calc(var(--tap,76px) / var(--su,1))}
body.physDeck.in-touch :is(#sndBtn,#dispBtn){min-width:var(--tap,76px)!important;min-height:var(--tap,76px)!important}
body.physDeck:has(#bag:not([hidden]),#shop:not([hidden]),#talk:not([hidden]),#craft:not([hidden]),#note:not([hidden]),#m6Pop:not([hidden])) #fsX{visibility:hidden!important}
body.physSmall #mg4.mgfit #mg4Skip{min-height:64px!important;height:64px!important;min-width:64px!important}
body.physSmall #mg4.mgfit .t{translate:18px 8px}
`;document.head.appendChild(css);}

// ---- captions ([The church bell tolls]) never cover the HUD: under the objective bar when that's clear, else the first clear strip
// down the screen (above the toolbar, between a menu and the bars). With a menu open over the whole screen, the caption sits on the
// menu's frame where it has no words or buttons, never on the bars. Worked out each time one shows, and while it's up.
const CAPP_HUD='#clock,#objective,#hudC,#stat,#hotbar,#btnBag,#btnAct,#btnUse,#btnSeed,#btnTurn,#btnDecor,#joy.on,#toast,.toast,#subs,#mindBanner,#tut,#placeBar,#maecard,#fsX,#sndBtn,#dispBtn,#fsBtn,#actChip';
const CAPP_PANEL='#bag,#shop,#note,#talk,#craft,#cgame,.sheet,#m6Pop>*,#gpCtl,#dispPick,#sndPick,[data-modal],#mg4 .box,#mg4 .t,#mg4 .h,#mg4 .row,#scene .box,#lvlUp,#saleSlip,#osk7';
function capVis(e){if(e.id==='cap7'||e.hidden||!e.getClientRects().length)return null;const c=getComputedStyle(e);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<.05)return null;
  const r=e.getBoundingClientRect();return r.width<4||r.height<4||r.bottom<=0||r.top>=innerHeight?null:r;}
function capRects(){const P=[],T=[],Hd=[];for(const e of document.querySelectorAll(CAPP_PANEL)){const r=capVis(e);if(!r)continue;P.push(r);
    for(const q of e.querySelectorAll('button,input,select,textarea,b,strong,small,span,p,li,h1,h2,h3,div,a,label,em,i')){let t=/^(BUTTON|INPUT|SELECT|TEXTAREA)$/.test(q.tagName);
      if(!t)for(const n of q.childNodes)if(n.nodeType===3&&n.textContent.trim()){t=true;break;}if(!t)continue;const rr=capVis(q);if(!rr)continue;
      // (words scrolled out of their list aren't on the screen: each is cut to what its scrolling boxes show)
      let x0=rr.left,y0=rr.top,x1=rr.right,y1=rr.bottom;for(let a=q.parentElement;a&&a!==document.body;a=a.parentElement){const c=getComputedStyle(a);if(c.overflowX!=='visible'||c.overflowY!=='visible'){const ar=a.getBoundingClientRect();x0=Math.max(x0,ar.left);y0=Math.max(y0,ar.top);x1=Math.min(x1,ar.right);y1=Math.min(y1,ar.bottom);}if(a===e)break;}
      if(x1-x0>1&&y1-y0>1)T.push({left:x0,top:y0,right:x1,bottom:y1});}}
  for(const e of document.querySelectorAll(CAPP_HUD)){const r=capVis(e);if(!r)continue;if(P.some(p=>r.left>=p.left&&r.right<=p.right&&r.top>=p.top&&r.bottom<=p.bottom))continue;Hd.push(r);}
  return {P,T,Hd};}
function capPlace(){const el=typeof CAP7!=='undefined'&&CAP7.el;if(!el||!el.classList.contains('on'))return;const W=innerWidth,H=innerHeight,w=el.offsetWidth,h=el.offsetHeight;if(!w||!h)return;
  const {P,T,Hd}=capRects(),x0=(W-w)/2,x1=x0+w,G=4;const ov=(L,y)=>{let a=0;for(const r of L){const ox=Math.min(x1,r.right+G)-Math.max(x0,r.left-G),oy=Math.min(y+h,r.bottom+G)-Math.max(y,r.top-G);if(ox>0&&oy>0)a+=ox*oy;}return a;};
  const score=y=>ov(Hd,y)*1000+ov(T,y)*20+ov(P,y);
  const top=(()=>{let b=0;for(const id of ['objective','hudC','clock','stat']){const e=$(id);const r=e&&capVis(e);if(r&&r.top<H*.3&&r.right>x0-G&&r.left<x1+G)b=Math.max(b,r.bottom);}return b+6;})();
  const cands=[top];for(let y=6;y<=H-h-6;y+=4)cands.push(y);let best=null,bs=1e18;for(const y of cands){if(y<2||y>H-h-2)continue;const sc=score(y);if(sc<bs-.5){bs=sc;best=y;}if(sc===0)break;}
  if(best==null)return;const Tp=Math.round(best)+'px';if(el.style.top!==Tp){el.style.setProperty('top',Tp,'important');el.style.setProperty('bottom','auto','important');}}
if(typeof cap7Show==='function'){const _cs=cap7Show;cap7Show=function(){const r=_cs.apply(this,arguments);try{capPlace();requestAnimationFrame(capPlace);}catch(e){}return r;};}
setInterval(()=>{try{capPlace();}catch(e){}},250);
{const css=document.createElement('style');css.textContent=`#cap7{max-width:calc(100vw - 16px);white-space:normal!important;text-align:center;box-sizing:border-box}body.physSmall #cap7{font-size:20px}body.physSmall.s7capS #cap7{font-size:18px}body.physSmall.s7capL #cap7{font-size:26px}`;document.head.appendChild(css);}

// ---- the popup guard's close button (settings367.js: pop7Fit adds an X to a panel taller than the window) belongs in the panel's top
// right corner. A backdrop that covers the whole window with the panel in its middle (Profiles and its Codes, the demo's feedback)
// was taken for the panel itself, so its X landed beside the real panel, outside its left edge: a backdrop now never gets one, and
// in a panel laid out in a row or a grid the X keeps to the top right corner
function p7Backdrop(e){try{if(!e||e.classList.contains('sheet'))return false;const c=getComputedStyle(e);if(c.position!=='fixed')return false;const r=e.getBoundingClientRect();
    const full=(r.width>=innerWidth*.85&&r.height>=innerHeight*.85)||(c.top==='0px'&&c.left==='0px'&&c.right==='0px'&&c.bottom==='0px');if(!full)return false;
    for(const k of e.children){if(k.classList.contains('pop7x'))continue;const q=k.getBoundingClientRect();if(q.width>40&&q.height>40&&q.width<r.width*.9)return true;}}catch(x){}return false;}
if(typeof pop7Visible==='function'){const _pv=pop7Visible;pop7Visible=function(e){if(p7Backdrop(e)){
    // (a backdrop the guard already dressed: its X and its limits come off, once)
    if(e._p7x!==true||e.classList.contains('pop7fit')){e._p7x=true;for(const x of e.querySelectorAll(':scope>.pop7x'))x.remove();if(e.classList.contains('pop7fit')||e.classList.contains('pop7more'))e.classList.remove('pop7fit','pop7more');
      for(const p of ['max-height','max-width','overflow'])if(e.style.getPropertyValue(p))e.style.removeProperty(p);if(e.style.translate){e.style.translate='';e._p7=null;}}
    // (and the panel inside it is kept inside the window, scrolling if it must)
    for(const k of e.children){if(k.classList.contains('p7inner')||k.classList.contains('pop7x'))continue;const q=k.getBoundingClientRect();if(q.height>innerHeight-12||q.width>innerWidth-12)k.classList.add('p7inner');}
    return false;}return _pv.apply(this,arguments);};}
if(typeof pop7Fit==='function'){const _pf=pop7Fit;pop7Fit=function(){const r=_pf.apply(this,arguments);
  for(const x of document.querySelectorAll('.pop7x:not(.p7at)')){const p=x.parentElement;if(!p)continue;const c=getComputedStyle(p),d=c.display;x.classList.add('p7at',/flex/.test(d)&&/row/.test(c.flexDirection)?'p7row':/flex|grid/.test(d)?'p7col':'p7blk');}
  return r;};}
{const css=document.createElement('style');css.textContent=`.pop7x.p7col{float:none!important;align-self:flex-end;justify-self:end;grid-column:1/-1;margin:-4px -4px -30px auto!important;display:block;flex:none}
.pop7x.p7row{float:none!important;order:999;align-self:flex-start;margin:-4px -4px 0 auto!important;flex:none}
.p7inner{max-height:calc(100vh - 16px)!important;max-height:calc(100dvh - 16px)!important;max-width:calc(100vw - 16px)!important;overflow:auto!important;box-sizing:border-box}`;document.head.appendChild(css);}
