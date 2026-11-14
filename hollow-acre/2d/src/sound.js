/* ================= sound: on, alongside your own music, or off. A speaker button beside the full-screen button.
   "Off" shuts the game's audio down completely, so a phone gives the speaker back to whatever else was playing (music,
   a podcast, a call). "Alongside my music" keeps the game's sounds but mixes them in under other apps instead of
   pausing them (and follows the phone's silent switch). The choice is kept on this device. ================= */
const sndMode=()=>{try{return localStorage.getItem('hollowSound')||'on';}catch(e){return 'on';}};
function sndSession(t){try{if(navigator.audioSession)navigator.audioSession.type=t;}catch(e){}}
{const _ai=A.init;A.init=function(){const m=sndMode();if(m==='off'){sndSession('ambient');return;}
  const r=_ai.apply(this,arguments);if(m==='mix')sndSession('ambient');return r;};}
function sndSet(m){try{localStorage.setItem('hollowSound',m);}catch(e){}
  if(m==='off'){A.ok=false;A.eng=null;const c=A.ctx;A.ctx=null;if(c){try{c.close();}catch(e){}}sndSession('ambient');}
  else if(A.ctx){sndSession(m==='mix'?'ambient':'playback');const c=A.ctx;try{c.suspend().then(()=>c.resume()).catch(()=>{});}catch(e){}}
  else A.init();
  sndIcon();}
const SND_ICON={on:'<path d="M3 7h3l4-3v12l-4-3H3z" fill="currentColor"/><path d="M13 7.5a3.5 3.5 0 010 5M15 5a7 7 0 010 10" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  mix:'<path d="M2 7h3l3.5-3v12L5 13H2z" fill="currentColor"/><path d="M13 4v8.2a2 2 0 11-1.4-1.9V4l5-1v7.2a2 2 0 11-1.4-1.9V4.6z" fill="currentColor"/>',
  off:'<path d="M3 7h3l4-3v12l-4-3H3z" fill="currentColor"/><path d="M13 7l5 6M18 7l-5 6" fill="none" stroke="currentColor" stroke-width="1.8"/>'};
const SND_NAME={on:'Sound on',mix:'Play alongside my music',off:'Sound off'};
function sndIcon(){const b=$('sndBtn');if(!b)return;const m=sndMode();b.innerHTML=`<svg viewBox="0 0 20 20">${SND_ICON[m]||SND_ICON.on}</svg><span class="lbl">${m==='off'?'Sound off':m==='mix'?'With my music':'Sound'}</span>`;
  b.title=SND_NAME[m];b.setAttribute('aria-label',SND_NAME[m]+'. Change sound');}
function sndPick(){const p=$('sndPick');const m=sndMode();
  const row=(k,desc)=>`<button class="sndopt${k===m?' on':''}" data-m="${k}"><svg viewBox="0 0 20 20">${SND_ICON[k]}</svg><span><b>${SND_NAME[k]}</b><br><small>${desc}</small></span></button>`;
  p.innerHTML=`<b class="hd">Sound</b>`+row('on','Music, the wind and every sound in the game. On a phone, other apps’ audio pauses while you play.')+
    row('mix','The game’s sounds play quietly under your own music or podcast instead of stopping it. Follows the phone’s silent switch.')+
    row('off','The game makes no sound at all, so whatever else you’re listening to keeps playing.')+'<button class="btn" id="sndClose">Done</button>';
  p.style.display='block';
  p.querySelectorAll('.sndopt').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();sndSet(b.dataset.m);p.querySelectorAll('.sndopt').forEach(o=>o.classList.toggle('on',o===b));
    if(b.dataset.m!=='off'&&SFX.coin)setTimeout(()=>SFX.coin(),60);}));
  $('sndClose').onclick=e=>{e.stopPropagation();p.style.display='none';};}
{const b=document.createElement('button');b.id='sndBtn';b.addEventListener('click',e=>{e.stopPropagation();sndPick();});b.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
  document.body.appendChild(b);const p=document.createElement('div');p.id='sndPick';p.addEventListener('click',e=>e.stopPropagation());document.body.appendChild(p);sndIcon();
  const st=document.createElement('style');st.textContent=`
#sndBtn{position:fixed;z-index:31;display:flex;align-items:center;justify-content:center;padding:0;border:0;cursor:pointer;color:#f4e6c8;background:transparent;opacity:.8}
#sndBtn svg{width:15px;height:15px;flex:none}#sndBtn .lbl{display:none}
#sndBtn.inhud{position:absolute;top:4px;right:28px;width:24px;height:24px;pointer-events:auto}
#sndBtn.title{top:calc(env(safe-area-inset-top,0px) + 10px);left:calc(env(safe-area-inset-left,0px) + 12px);height:36px;padding:0 12px;opacity:1;
  background:var(--px-panel,#2a1a0e);box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 3px #6a4a2a;zoom:var(--tu,1)}
#sndBtn.title svg{width:18px;height:18px}#sndBtn.title .lbl{display:inline;font-size:13px;margin-left:7px;letter-spacing:.04em}
#sndPick{position:fixed;z-index:1000;left:50%;top:50%;transform:translate(-50%,-50%);width:min(380px,90vw);max-height:90vh;overflow:auto;background:#2a1a0e;color:#f4e6c8;
  padding:14px 16px;font-size:14px;line-height:1.4;box-shadow:0 0 0 2px #1a0e06,0 0 0 4px #b8521c,0 10px 40px rgba(0,0,0,.6);display:none;zoom:var(--su,1)}
#sndPick .hd{display:block;font-size:16px;margin-bottom:8px;color:#ffd27a}
#sndPick .sndopt{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;margin:0 0 8px;padding:9px 10px;font:inherit;color:inherit;cursor:pointer;
  background:#3a2616;border:2px solid #5a3e24;border-radius:3px}
#sndPick .sndopt svg{width:22px;height:22px;flex:none;margin-top:2px}#sndPick .sndopt small{opacity:.78}
#sndPick .sndopt.on{border-color:#e0b070;background:#5a3a1c}#sndPick .sndopt.on b::after{content:'  ✓';color:#ffd27a}
#sndPick #sndClose{display:block;margin:4px auto 0}`;document.head.appendChild(st);
  // in the HUD's corner panel during play, on the title screen at the top left, hidden while a menu or scene is up
  const sync=()=>{const onTitle=!$('title').hidden||($('creator')&&!$('creator').hidden);const stat=$('stat');
    if(onTitle){b.className='title';if(b.parentElement!==document.body)document.body.appendChild(b);b.style.display='flex';return;}
    if(b.className!=='inhud')b.className='inhud';if(stat&&b.parentElement!==stat)stat.appendChild(b);{const _d=(S.paused||S.mode!=='play')&&$('sndPick').style.display!=='block'?'none':'flex';if(b.style.display!==_d)b.style.display=_d;}};  /* (t349) write only on change */
  setInterval(sync,300);sync();}
