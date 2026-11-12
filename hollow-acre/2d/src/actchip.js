/* ================= the story's moments, said out loud. When you're standing where the story needs you to do something you might
   not know about (a stone's hiding place, a letter in the mailbox, the Tithe House door, the Ward ledger, Grandpa's pages, the
   altars), a small wooden tag floats over your head with what to do: on a computer it shows the key (X), on a phone you tap
   the tag. Everyday things (people, doors, signs, tools) don't get one. ================= */
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
  // the same choice X makes (the nearest thing you're facing, people included); the tag only shows when that's one of the
  // story's own moments: the stones, a letter in the mailbox, the Tithe House door, the ledger, Grandpa's pages, the altars
  const pick=()=>{let best=null,bd=1e9;for(const it of icNear()){if(it.npc!==undefined&&npcs[it.npc]){it.x=npcs[it.npc].x;it.z=npcs[it.npc].z;}
      if(it.on&&!it.on())continue;if(!isFinite(it.x)||!isFinite(it.z))continue;const d=Math.hypot(P.x-it.x,P.z-it.z);if(d<it.r+.3){const dot=((it.x-P.x)*P.fx+(it.z-P.z)*P.fz)/(d||1);if(d>1&&dot<.3)continue;const sc=d*(1.6-dot);if(sc<bd){bd=sc;best=it;}}}return best;};
  const show=()=>{if(S.mode!=='play'||busy()||fishing()||(typeof PLACE!=='undefined'&&PLACE.on))return '';
    const it=pick();if(!it||!it.story||(typeof it.story==='function'&&!it.story()))return '';
    try{return String(typeof it.label==='function'?it.label():it.label||'');}catch(e){return '';}};
  setInterval(()=>{const L=show();if(L!==cur){cur=L;el.querySelector('.l').textContent=L;}
    const fine=fineP();el.classList.toggle('tap',!fine);el.querySelector('.k').textContent=fine?'X':'✋';el.style.display=L?'flex':'none';},120);
  const pos=()=>{if(cur){const r=view.getBoundingClientRect();const X=sx(P.x),Y=sz(P.z)-58;el.style.left=Math.round(r.left+X*r.width/VW)+'px';el.style.top=Math.round(r.top+Y*r.height/VH)+'px';}requestAnimationFrame(pos);};pos();}
// the tag is gone for good: nothing pops up over your head when you can use something. X (or the Use button on a phone) still
// works on whatever you're facing, and the goal bar and its arrow still point you to the story's moments.
{const st=document.createElement('style');st.textContent='#actChip{display:none!important}';document.head.appendChild(st);}
