/* ================= #309 The console. Press T (not while typing in a box, or in a menu, scene or minigame) and a little console
   opens at the top of the screen. The owner's code is checked by its hash, like the profile codes, so it isn't written in the
   game in plain text: Jaxon0419 puts 5,000 coins in your purse. Enter to run it, Esc to close. ================= */
const CONSOLE_CODES={[perkHash('jaxon0419')]:'coins5k'};
(function(){const css=document.createElement('style');css.textContent=`#cheatBox{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 70px);transform:translateX(-50%);z-index:90;display:none;
 background:#2a1a0e;border:3px solid #c89a5a;box-shadow:inset 0 0 0 2px #1a0e06,0 0 0 2px #1a0e06,0 6px 18px rgba(0,0,0,.6);padding:9px 12px;font:14px 'Hollow Pixel',monospace;color:#f0e4c8;gap:8px;align-items:center}
#cheatBox span{color:#e8923a;font-size:16px}
#cheatBox.on{display:flex}#cheatBox input{font:14px 'Hollow Pixel',monospace;background:#1a0e06;color:#f6eedc;border:2px solid #8a6440;padding:5px 8px;width:min(60vw,260px);outline:none;caret-color:#e8923a}`;document.head.appendChild(css);
  const b=document.createElement('div');b.id='cheatBox';b.innerHTML='<span>&gt;</span><input id="cheatIn" maxlength="40" autocomplete="off" spellcheck="false" placeholder="type a code, Enter">';document.body.appendChild(b);
  const inp=b.querySelector('input');const close=()=>{b.classList.remove('on');inp.value='';inp.blur();if(cheatOpen.paused){S.paused=false;cheatOpen.paused=false;}};
  inp.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key==='Enter'){e.preventDefault();const k=CONSOLE_CODES[perkHash(String(inp.value||'').replace(/\s+/g,'').toLowerCase())];
      if(k==='coins5k'){S.coins+=5000;SFX.coin&&SFX.coin();updateHud&&updateHud();toast('5,000 coins. Spend it before anyone asks where it came from.',2.6);try{saveGame(true);}catch(er){}}
      else{SFX.deny&&SFX.deny();toast('Nothing happens.',1.4);}close();}});
  inp.addEventListener('keyup',e=>e.stopPropagation());inp.addEventListener('keypress',e=>e.stopPropagation());
  window.cheatOpen=function(){if(b.classList.contains('on'))return;b.classList.add('on');cheatOpen.paused=!S.paused;S.paused=true;setTimeout(()=>inp.focus(),0);};
  addEventListener('keydown',e=>{if(e.code!=='KeyT'||e.repeat||(typeof typing==='function'&&typing(e)))return;if(S.mode!=='play'||S.paused||(typeof STG!=='undefined'&&STG))return;e.preventDefault();cheatOpen();});})();
/* ================= #310 Missions keep their progress over the night. Three holes, closed:
   - a lesson step finished just before bed was only counted on the next unpaused frame, and some steps check things that reset
     overnight (who you've talked to today and so on), so going straight to bed could wipe it: the steps are checked once more
     before the night turns;
   - the game saves the moment you get into bed, not only after the morning comes (closing it during the night lost the day);
   - on a shared farm the host's morning brought the whole farm over yours, quests and story steps included: a step you'd done that
     hadn't reached the host yet was undone. Now your progress and the host's are put together, and the furthest along wins. === */
{const _nd=newDay;newDay=function(){try{const p=S.paused;S.paused=false;try{lessonsUpdate&&lessonsUpdate(0);}catch(e){}try{lsSideUpdate&&lsSideUpdate();}catch(e){}S.paused=p;}catch(e){}return _nd.apply(this,arguments);};}
{const _sl=sleep;sleep=function(){try{if(S.mode==='play'&&S.readLetter&&!(typeof HOST!=='undefined'&&HOST.role==='guest'&&!HOST.joined))saveGame(true);}catch(e){}return _sl.apply(this,arguments);};}
const PROG_KEYS=['q','pages','parts','carFixed','looped','carStage','ward','iq','count','first','foundCabin','visitedTown','mineFloor','mineDeep','saga'];
function progMerge(a,b){   // b is ours: the furthest along of the two
  if(typeof b==='number'&&isFinite(b))return typeof a==='number'&&isFinite(a)?Math.max(a,b):b;
  if(typeof b==='boolean')return a===true||b;
  if(Array.isArray(b)){const A=Array.isArray(a)?a.slice():[];const seen=new Set(A.map(x=>JSON.stringify(x)));for(const x of b){const k=JSON.stringify(x);if(!seen.has(k)){seen.add(k);A.push(x);}}return A;}
  if(b&&typeof b==='object'){const o=a&&typeof a==='object'&&!Array.isArray(a)?a:{};for(const k of Object.keys(b))o[k]=progMerge(o[k],b[k]);return o;}
  return a===undefined?b:a;}
if(typeof applySnap==='function'){const _as=applySnap;applySnap=function(data,first){const mine=(typeof HOST!=='undefined'&&HOST.role==='guest'&&!first)?Object.fromEntries(PROG_KEYS.filter(k=>S[k]!==undefined).map(k=>[k,JSON.parse(JSON.stringify(S[k]))])):null;
  const r=_as.apply(this,arguments);if(mine)try{for(const [k,v] of Object.entries(mine))S[k]=progMerge(S[k],v);if(typeof SS!=='undefined')SS.last='';}catch(e){}return r;};}
/* ================= #311 People in scenes walk round the furniture. A walk in a scene used to go in a straight line from mark to
   mark, through counters and tables; now every leg of it is routed round whatever stands in the way (the same route-finder as
   tap-to-walk), and only goes straight where nothing is in the way. ================= */
{const _b=stgBeat;stgBeat=function(i){const r=_b.apply(this,arguments);try{const st=STG,b=st&&st.def.beats[i];if(!b||!b.go||typeof tapRoute!=='function')return r;
  for(const id of Object.keys(b.go)){const m=st.movers[id],a=stgActor(id);if(!m||!a)continue;const pts=[[m.x,m.z]].concat(m.next||[]);let cx=a.x,cz=a.z;const out=[];
    for(const p of pts){let R=null;try{R=tapRoute(cx,cz,p[0],p[1]);}catch(e){}if(R&&R.length){for(const q of R)out.push([q[0],q[1]]);const L=out[out.length-1];if(Math.hypot(L[0]-p[0],L[1]-p[1])>.05)out.push([p[0],p[1]]);}else out.push([p[0],p[1]]);cx=p[0];cz=p[1];}
    const f=out.shift();if(f){m.x=f[0];m.z=f[1];m.next=out;}}}catch(e){}return r;};}
