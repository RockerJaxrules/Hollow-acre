/* ================= pixel autumn UI + desktop controls ================= */
{const lk=document.createElement('link');lk.rel='stylesheet';lk.href='https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&display=swap';document.head.appendChild(lk);
  // a pixel maple leaf, drawn once, used as a corner ornament on every panel
  const leaf=(c1,c2)=>{const c=document.createElement('canvas');c.width=c.height=11;const g=c.getContext('2d');const L=['....1.1....','...111.1...','.1.11111.1.','.111111111.','..1111111..','.111222111.','111112111111'.slice(0,11),'..1112111..','....121....','.....2.....','.....2.....'];
    L.forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch==='1'){g.fillStyle=c1;g.fillRect(x,y,1,1);}if(ch==='2'){g.fillStyle=c2;g.fillRect(x,y,1,1);}}));return c.toDataURL();};
  const L1=leaf('#d8682a','#7a3214'),L2=leaf('#e8a83a','#8a5a1a');
  const css=document.createElement('style');css.textContent=`
  :root{--font-display:'Pixelify Sans',ui-monospace,monospace;--px-dark:#140a04;--px-wood:#5a3416;--px-wood2:#8a5426;--px-light:#d89a50;--px-panel:#2c1a0e;--px-panel2:#3a2414;--ember:#f0a040;--bone:#f4e4c0;--dim:#c8a878}
  body,button,.sheet,.panel,#toast,#subs,#objective{font-family:'Pixelify Sans',ui-monospace,monospace!important;-webkit-font-smoothing:none}
  .panel,.sheet,#objective,#toast,.screen .row .begin,.close,.btn,.begin,.chip,#talk,.buy,#bag .it,#creator .chip{border-radius:0!important}
  .panel,#objective,#toast{background:var(--px-panel)!important;border:0!important;box-shadow:0 0 0 2px var(--px-dark),inset 0 0 0 2px var(--px-light),inset 0 0 0 4px var(--px-wood),4px 4px 0 2px rgba(0,0,0,.35)!important}
  .sheet{background:linear-gradient(var(--px-panel2),var(--px-panel))!important;border:0!important;box-shadow:0 0 0 3px var(--px-dark),inset 0 0 0 3px var(--px-light),inset 0 0 0 6px var(--px-wood),inset 0 0 0 8px var(--px-wood2),6px 6px 0 3px rgba(0,0,0,.4)!important;padding:24px!important}
  .sheet::before,.sheet::after{content:'';position:absolute;width:22px;height:22px;background:url(${L1}) 0 0/22px 22px;image-rendering:pixelated;top:-8px;left:-8px;transform:rotate(-20deg)}
  .sheet::after{background-image:url(${L2});left:auto;right:-8px;top:-8px;transform:rotate(25deg)}
  .sheet h2,.screen h1{font-family:'Pixelify Sans',monospace!important;letter-spacing:.04em;color:var(--ember)!important;text-shadow:2px 2px 0 var(--px-dark)}
  .btn,.close,.buy,#hotbar .slot,.chip:not(.sw){background:var(--px-wood)!important;color:var(--bone)!important;border:0!important;box-shadow:inset 0 0 0 2px var(--px-dark),inset 0 0 0 4px var(--px-wood2),inset 0 -6px 0 0 rgba(0,0,0,.25)!important;text-shadow:1px 1px 0 #000}
  .close.hot,.btn.hot,.begin,#btnAct.hot{background:#a8502a!important;box-shadow:inset 0 0 0 2px var(--px-dark),inset 0 0 0 4px #e8903a,inset 0 -6px 0 0 rgba(0,0,0,.25)!important}
  .begin{color:var(--bone)!important;border:0!important;font-family:'Pixelify Sans',monospace!important;letter-spacing:.08em}
  .buy:disabled,.close:disabled{opacity:.45}
  #btnAct{border-radius:0!important;background:var(--px-wood)!important;border:0!important;box-shadow:inset 0 0 0 3px var(--px-dark),inset 0 0 0 6px var(--px-wood2),inset 0 -10px 0 0 rgba(0,0,0,.25)!important}
  .paper,#noteText{background:#e8d6a8!important;color:#3a2414!important;box-shadow:inset 0 0 0 2px #b89860,inset 0 0 0 4px #f4e4c0,3px 3px 0 0 rgba(0,0,0,.35)!important;border-radius:0!important;padding:18px!important;
    background-image:repeating-linear-gradient(transparent 0 21px,rgba(90,60,30,.18) 21px 22px)!important;font-family:'Pixelify Sans',monospace!important}
  .shop-row{border-bottom:2px dashed rgba(216,154,80,.25)!important}
  #bars .bv{border-radius:0!important;background:var(--px-panel)!important;border:0!important;box-shadow:0 0 0 2px var(--px-dark),inset 0 0 0 2px var(--px-wood2)!important}#bars .bv i{border-radius:0!important}
  #bars b{font-family:'Pixelify Sans',monospace!important;text-shadow:1px 1px 0 #000}
  #joy .ring,#joy{border-radius:50%}
  @media (min-width:900px){#hotbar{left:50%!important;transform:translateX(-50%) scale(1.25);transform-origin:bottom center;bottom:18px!important}#hotbar .slot{width:48px!important;height:48px!important}#hotbar .slot img{left:8px!important;top:8px!important}
    #btnBag{bottom:24px!important;left:16px!important}#btnJournal{bottom:24px!important;left:80px!important}.sheet{width:min(560px,80vw)!important}}
  #creator .chip.sw{border:0!important;box-shadow:inset 0 0 0 2px #140a04,inset 0 0 0 4px rgba(255,255,255,.18)!important}#creator .chip.sw.on{outline:3px solid var(--ember)!important;outline-offset:2px}
  #pcHint{font-size:12px;opacity:.7;margin-top:6px}`;document.head.appendChild(css);
  // a little falling leaf drifting across the title screen
  const ts=$('title');if(ts){const h=document.createElement('div');h.id='pcHint';h.className='small';h.textContent='On a computer: WASD or arrows to walk · Space / E / click to act · 1-6 hotbar · B bag · J journal · F fullscreen';ts.appendChild(h);}}
// ---- desktop controls
addEventListener('keydown',e=>{if(e.repeat)return;const k=e.code;
  if(k==='Escape'){for(const id of ['bag','shop','note','talk']){const el=$(id);if(el&&!el.hidden){const c=el.querySelector('.close');if(c)c.click();else{el.hidden=true;S.paused=false;}e.preventDefault();return;}}const j=document.querySelector('.sheet:not([hidden]) .close');if(j)j.click();return;}
  if(k==='KeyF'){if(typeof fsToggle==='function')fsToggle();return;}
  if(S.mode!=='play')return;
  if(/^Digit[1-6]$/.test(k)){hotbarUse(['hoe','can','pick','axe','seed','food'][+k.slice(5)-1]);return;}
  if(k==='KeyB'&&!S.paused)openBag();else if(k==='KeyB'&&!$('bag').hidden)$('bagClose').click();
  if(k==='KeyJ'&&!S.paused&&typeof openJournal==='function')openJournal();});
// clicking the world with a mouse does the big-button action (touch keeps its drag-to-walk joystick)
view.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;if(S.mode==='play'&&!S.paused)onAct();});
view.addEventListener('contextmenu',e=>e.preventDefault());
