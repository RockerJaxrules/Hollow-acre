/* ================= #260 your own marks on the map. "Mark a place", tap the map, give it a name and a sign (a star, a heart, a
   fish, a cross for danger, a tick for done), and it stays: a pin on the map with its name under it, a little flag on a stake in
   the world, and a line in the list under the map. Tap a pin (or its line) to head there: the arrow and the bar at the top point
   you to it until you arrive or stop it. Your marks are your own, in a shared world too. ================= */
const MK_SIGNS={star:{g:'★',c:'#e0a820',name:'a star'},heart:{g:'♥',c:'#c8402a',name:'a heart'},fish:{g:'~',c:'#3a88c8',name:'a fish'},
  danger:{g:'✕',c:'#2a1a12',name:'a cross'},done:{g:'✓',c:'#4a8a2a',name:'a tick'}};
const MMK={mode:false,draft:null,down:null,sel:null};
const mmMarks=()=>{if(!Array.isArray(S.marks))S.marks=[];return S.marks;};
const mmEsc=t=>String(t||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
if(typeof PERSONAL!=='undefined')for(const k of ['marks','markGo'])if(!PERSONAL.includes(k))PERSONAL.push(k);
function mmGo(){const g=S.markGo;return g?mmMarks().find(m=>m.id===g)||null:null;}
// ---- heading somewhere: the bar and the arrow point at your mark until you get there (or stop it)
{const _o=objective;objective=function(){const r=_o.apply(this,arguments);try{const m=mmGo();if(m&&S.mode==='play'){const t={x:m.x,z:m.z};return ['Your mark',`${mmEsc(m.n)}.`+(typeof wayChip==='function'?wayChip(t):''),t];}}catch(e){}return r;};}
{let t=0;const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);t+=dt;if(t<.5)return;t=0;try{const m=mmGo();if(m&&!S.room&&Math.hypot(P.x-m.x,P.z-m.z)<1.8){S.markGo=null;toast(`You’re there: ${m.n}.`,2.2);}}catch(e){}};}
// ---- the map screen
function mmPct(x,z){const base=MAPX.cv;return [(MAPX.pad+(x-B.x0)*MAPX.s)/base.width*100,(MAPX.pad+(z-B.z0)*MAPX.s)/base.height*100];}
function mmWorldAt(inner,cx,cy){const r=inner.getBoundingClientRect(),base=MAPX.cv;const px=(cx-r.left)/r.width*base.width,py=(cy-r.top)/r.height*base.height;
  return {x:(px-MAPX.pad)/MAPX.s+B.x0,z:(py-MAPX.pad)/MAPX.s+B.z0};}
function mmPanel(html){let p=$('mmPanel');if(!p){p=document.createElement('div');p.id='mmPanel';const lg=$('mapLegend');(lg&&lg.parentNode?lg.parentNode:$('bagBody')).insertBefore(p,lg||null);}p.innerHTML=html;p.hidden=!html;return p;}
function mmDraftPanel(){const d=MMK.draft;if(!d)return mmPanel('');
  const p=mmPanel(`<div class="mmrow"><b>${d.id?'Change this mark':'A new mark'}</b><input id="mmName" maxlength="28" placeholder="Good fishing, iron here, don’t go at night…" value="${mmEsc(d.n||'')}"></div>
    <div class="mmrow mmsigns">${Object.entries(MK_SIGNS).map(([k,s])=>`<button data-mmsign="${k}" class="${d.k===k?'on':''}" title="${s.name}" style="--c:${s.c}">${s.g}</button>`).join('')}</div>
    <div class="mmrow"><button class="btn" data-mmsave="1">Save the mark</button><button class="btn" data-mmcancel="1">Cancel</button></div>`);
  p.querySelectorAll('[data-mmsign]').forEach(b=>b.onclick=()=>{d.k=b.dataset.mmsign;d.n=$('mmName').value;mmDraftPanel();mmPins();});
  p.querySelector('[data-mmsave]').onclick=()=>{const n=String($('mmName').value||'').replace(/\s+/g,' ').trim().slice(0,28)||'My mark';const L=mmMarks();
    if(d.id){const m=L.find(q=>q.id===d.id);if(m){m.n=n;m.k=d.k;}}else{if(L.length>=40){toast('That’s forty marks. Take one off first.',2.4);return;}L.push({id:Date.now().toString(36)+Math.floor(rand()*1e4),x:+d.x.toFixed(2),z:+d.z.toFixed(2),n,k:d.k});}
    MMK.draft=null;MMK.mode=false;SFX.page&&SFX.page();try{saveGame&&saveGame();}catch(e){}renderMap(true);};
  p.querySelector('[data-mmcancel]').onclick=()=>{MMK.draft=null;MMK.mode=false;renderMap(true);};
  setTimeout(()=>{try{p.scrollIntoView({block:'nearest',behavior:'smooth'});}catch(e){}const i=$('mmName');if(i&&!d.id&&!('ontouchstart' in window))i.focus();},30);}
function mmMarkPanel(m){const go=S.markGo===m.id;const s=MK_SIGNS[m.k]||MK_SIGNS.star;const d=Math.round(Math.hypot(P.x-m.x,P.z-m.z));
  const p=mmPanel(`<div class="mmrow"><span class="mmg" style="--c:${s.c}">${s.g}</span><b>${mmEsc(m.n)}</b><small>${d} paces from you</small></div>
    <div class="mmrow"><button class="btn" data-mmgo="1">${go?'Stop heading there':'Head here'}</button><button class="btn" data-mmedit="1">Rename</button><button class="btn" data-mmdel="1">Take it off</button><button class="btn" data-mmclose="1">Close</button></div>`);
  p.querySelector('[data-mmgo]').onclick=()=>{S.markGo=go?null:m.id;toast(go?'Stopped.':`Heading to ${m.n}. The arrow points the way.`,2.2);try{updateHud&&updateHud();}catch(e){}renderMap(true);};
  p.querySelector('[data-mmedit]').onclick=()=>{MMK.draft={id:m.id,x:m.x,z:m.z,n:m.n,k:m.k};mmDraftPanel();};
  p.querySelector('[data-mmdel]').onclick=()=>{S.marks=mmMarks().filter(q=>q.id!==m.id);if(S.markGo===m.id)S.markGo=null;try{saveGame&&saveGame();}catch(e){}renderMap(true);};
  p.querySelector('[data-mmclose]').onclick=()=>mmPanel('');setTimeout(()=>{try{p.scrollIntoView({block:'nearest',behavior:'smooth'});}catch(e){}},30);}
function mmPins(){const inner=$('mapInner');if(!inner||!MAPX.cv)return;inner.querySelectorAll('.umk').forEach(e=>e.remove());
  const all=mmMarks().concat(MMK.draft&&!MMK.draft.id?[Object.assign({id:'draft',n:MMK.draft.n||'…'},MMK.draft)]:[]);
  for(const m of all){const s=MK_SIGNS[m.k]||MK_SIGNS.star;const [l,t]=mmPct(m.x,m.z);const b=document.createElement('button');b.className='umk'+(S.markGo===m.id?' go':'')+(m.id==='draft'?' draft':'');
    b.style.left=l+'%';b.style.top=t+'%';b.style.setProperty('--c',s.c);b.innerHTML=`<span class="g">${s.g}</span><span class="n">${mmEsc(m.n)}</span>`;b.title=m.n;
    if(m.id!=='draft')b.onclick=e=>{e.stopPropagation();if(MMK.mode)return;mmMarkPanel(m);};inner.appendChild(b);}}
{const _rm=renderMap;renderMap=function(keep){const r=_rm.apply(this,arguments);try{const bar=$('mapBar'),inner=$('mapInner'),wrap=$('mapWrap');if(!bar||!inner||!MAPX.cv)return r;
    // the button, and what the bar says while you're marking
    const b=document.createElement('button');b.className='btn mmbtn'+(MMK.mode?' on':'');b.textContent=MMK.mode?'Cancel':'Mark a place';
    b.onclick=()=>{MMK.mode=!MMK.mode;if(!MMK.mode)MMK.draft=null;renderMap(true);};bar.insertBefore(b,bar.firstChild.nextSibling);
    if(MMK.mode)bar.firstChild.textContent='Tap the map where you want the mark.';
    mmPins();
    inner.addEventListener('pointerdown',e=>{MMK.down=[e.clientX,e.clientY];});
    inner.addEventListener('click',e=>{if(!MMK.mode)return;const d=MMK.down;if(d&&Math.hypot(e.clientX-d[0],e.clientY-d[1])>8)return;const w=mmWorldAt(inner,e.clientX,e.clientY);
      if(w.x<B.x0||w.x>B.x1||w.z<B.z0||w.z>B.z1)return;MMK.draft={x:w.x,z:w.z,n:MMK.draft?MMK.draft.n:'',k:MMK.draft?MMK.draft.k:'star'};mmPins();mmDraftPanel();});
    if(MMK.draft)mmDraftPanel();
    // the list of your marks, under the map
    const L=mmMarks();if(L.length){const lg=$('mapLegend');const box=document.createElement('div');box.id='mmList';
      box.innerHTML=`<b>Your marks</b>`+L.map(m=>{const s=MK_SIGNS[m.k]||MK_SIGNS.star;return `<button data-mmpick="${m.id}" class="${S.markGo===m.id?'go':''}" style="--c:${s.c}"><span class="g">${s.g}</span>${mmEsc(m.n)}${S.markGo===m.id?' · heading here':''}</button>`;}).join('');
      if(lg&&lg.parentNode)lg.parentNode.insertBefore(box,lg);box.querySelectorAll('[data-mmpick]').forEach(x=>x.onclick=()=>{const m=L.find(q=>q.id===x.dataset.mmpick);if(!m)return;mmMarkPanel(m);
        const [l,t]=mmPct(m.x,m.z);wrap.scrollLeft=l/100*wrap.scrollWidth-wrap.clientWidth/2;wrap.scrollTop=t/100*wrap.scrollHeight-wrap.clientHeight/2;});}
  }catch(e){console.warn('marks',e);}return r;};}
// ---- in the world: a little flag on a stake where each mark is
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);if(S.room)return;for(const m of mmMarks()){if(Math.abs(m.x-P.x)>16||Math.abs(m.z-P.z)>11)continue;const s=MK_SIGNS[m.k]||MK_SIGNS.star;
  D.push({z:m.z,mind:1,draw(){const X=Math.round(sx(m.x)),Y=Math.round(sz(m.z)),w=Math.round(Math.sin(t*3+m.x)*1);const g=ctx2;
    g.fillStyle='rgba(0,0,0,.25)';g.fillRect(X-3,Y,7,2);g.fillStyle='#2a1a0c';g.fillRect(X,Y-18,2,19);g.fillStyle='#5a3a1c';g.fillRect(X,Y-18,1,19);
    g.fillStyle='#1a0e06';g.fillRect(X+2,Y-18,9+w,7);g.fillStyle=s.c;g.fillRect(X+2,Y-17,8+w,5);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(X+2,Y-17,8+w,1);
    if(S.markGo===m.id){g.fillStyle='rgba(255,210,122,'+(.5+.4*Math.sin(t*5))+')';g.fillRect(X-1,Y-21,4,2);}}});}};}
{const css=document.createElement('style');css.textContent=`
#mapBar .mmbtn{margin-left:auto;margin-right:6px}#mapBar .mmbtn.on{background:#a8502a!important;color:#fff}
#mapWrap .umk{position:absolute;z-index:3;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;gap:1px;background:none;border:0;padding:0;cursor:pointer;font:inherit}
#mapWrap .umk .g{display:grid;place-items:center;width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:var(--c);box-shadow:0 0 0 2px #f4e6c8,1px 2px 0 2px rgba(0,0,0,.35);color:#fff;font:13px/1 'Hollow Pixel',monospace}
#mapWrap .umk .n{font:11px/1.1 'Hollow Pixel',monospace;color:#2a1608;background:rgba(244,230,200,.95);border:1px solid #6a4422;padding:1px 4px;white-space:nowrap;margin-top:3px}
#mapWrap .umk.go .g{box-shadow:0 0 0 2px #ffd27a,0 0 8px 3px rgba(255,210,122,.8)}#mapWrap .umk.draft{opacity:.8;pointer-events:none}
#mmPanel{margin:6px 0;padding:8px;background:#e8d6a8;color:#3a2414;box-shadow:inset 0 0 0 2px #b89860}#mmPanel .mmrow{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:3px 0}
#mmPanel input{font:inherit;flex:1;min-width:160px;padding:5px;background:#fbf3e0;color:#3a2414;border:1px solid #6a4a2a}#mmPanel small{opacity:.75}
#mmPanel .mmsigns button{width:34px;height:30px;font:16px/1 'Hollow Pixel',monospace;color:#fff;background:var(--c);border:0;box-shadow:inset 0 0 0 2px rgba(0,0,0,.35);cursor:pointer}#mmPanel .mmsigns button.on{box-shadow:inset 0 0 0 2px #fff,0 0 0 2px #3a2414}
#mmPanel .mmg,#mmList .g{display:inline-grid;place-items:center;width:18px;height:18px;background:var(--c);color:#fff;font:12px/1 'Hollow Pixel',monospace;margin-right:4px;border-radius:3px}
#mmList{display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;margin:6px 0;font-size:12px}#mmList button{font:inherit;font-size:12px;display:inline-flex;align-items:center;background:rgba(0,0,0,.18);color:inherit;border:0;padding:3px 7px;cursor:pointer}#mmList button.go{background:rgba(255,210,122,.3)}`;
document.head.appendChild(css);}
// the pin's sign is drawn from a data attribute (the rotated pin would otherwise turn the sign too)
{const _p=mmPins;mmPins=function(){_p();document.querySelectorAll('#mapWrap .umk .g').forEach(e=>{e.dataset.g=e.textContent;const sp=document.createElement('span');sp.textContent=e.dataset.g;sp.style.cssText='transform:rotate(45deg);font-size:13px;display:block';e.textContent='';e.appendChild(sp);});};}
