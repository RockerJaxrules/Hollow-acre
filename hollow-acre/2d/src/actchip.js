/* ================= what you can do here, said out loud. Whenever there's something to talk to, open, read or pull on within reach,
   a small wooden tag floats over your head with its name: on a computer it shows the key (X, or right-click), on a phone you tap
   the tag itself. Tool jobs (till, water, chop, mine, fish) don't get one: the highlighted square already says those. ================= */
{const css=document.createElement('style');css.textContent=`
#actChip{position:fixed;z-index:30;left:0;top:0;transform:translate(-50%,-100%);display:none;align-items:center;gap:7px;padding:5px 10px 6px 6px;
  background:var(--px-wood);color:#f6e8c8;font-family:var(--font-display);font-size:15px;line-height:1;white-space:nowrap;pointer-events:none;
  box-shadow:inset 0 0 0 2px var(--px-dark),inset 0 0 0 4px var(--px-wood2),inset 0 -5px 0 0 rgba(0,0,0,.25),0 3px 0 rgba(0,0,0,.35)}
#actChip .k{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 4px;background:#f0e2c0;color:#2a1608;font-size:13px;
  box-shadow:inset 0 0 0 2px #2a1608,inset 0 -3px 0 0 #b89a68}
#actChip.tap{pointer-events:auto;cursor:pointer;padding:8px 12px 9px 8px;font-size:16px}#actChip.tap .k{background:#f0a040;color:#2a1608}
#actChip::after{content:'';position:absolute;left:50%;bottom:-6px;margin-left:-5px;border:5px solid transparent;border-top-color:var(--px-dark);border-bottom:0}`;
  document.head.appendChild(css);
  const el=document.createElement('div');el.id='actChip';el.innerHTML='<span class="k"></span><span class="l"></span>';document.body.appendChild(el);
  const go=e=>{e.preventDefault();e.stopPropagation();interactFront();};el.addEventListener('pointerdown',go);
  let cur='';
  const show=()=>{if(S.mode!=='play'||busy()||fishing())return '';
    let c=null;try{c=computeContext();}catch(e){return '';}if(!c||!c.label)return '';const L=String(c.label);
    if(labelNeed(L)||/^(Place|Can’t place|Strike|Shove)$/.test(L))return '';return L;};
  setInterval(()=>{const L=show();if(L!==cur){cur=L;el.querySelector('.l').textContent=L;}
    const fine=fineP();el.classList.toggle('tap',!fine);el.querySelector('.k').textContent=fine?'X':'✋';el.style.display=L?'flex':'none';},120);
  const pos=()=>{if(cur){const r=view.getBoundingClientRect();const X=sx(P.x),Y=sz(P.z)-58;el.style.left=Math.round(r.left+X*r.width/VW)+'px';el.style.top=Math.round(r.top+Y*r.height/VH)+'px';}requestAnimationFrame(pos);};pos();}
