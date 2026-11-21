/* ================= the scarecrow can kill you. The first time it catches you at night it opens you up and lets you go, because it
   wants you to run. If it catches you again before you've healed, you die, and you wake on the morning of the same day having lost it. ================= */
S.deaths=S.deaths||0;
const DEATH_LINES=['It takes its time. It wants you to see its face, so you will recognise it next year in the mirror.','The last thing you hear is your own voice, from inside the straw, saying it is sorry.',
  'It is gentle, at the end. It folds you up very small, the way you would fold a letter.','The field drinks. The corn stands a little straighter in the morning.'];
{const c=document.createElement('style');c.textContent=`#death{position:fixed;inset:0;z-index:996;display:none;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:radial-gradient(circle at 50% 45%,#3a0806,#050203 70%);color:#e8dcc0;text-align:center;padding:28px;font-family:var(--font-display,Georgia,serif)}
#death h1{font-size:clamp(38px,10vw,72px);color:#d23a1e;letter-spacing:.06em;margin:0;text-shadow:0 0 24px rgba(210,40,20,.5)}#death p{max-width:520px;line-height:1.55;font-size:16px;opacity:.9}#death .k{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#b8521c}`;document.head.appendChild(c);
  const d=document.createElement('div');d.id='death';d.innerHTML='<div class="k"></div><h1>You died</h1><p class="t"></p><button class="begin" id="deathWake">Wake up</button>';document.body.appendChild(d);}
const armorCut=()=>{const a=S.gear&&S.gear.armor&&ARMORS[S.gear.armor];return a?a[1]:0;};
caught=(function(){return function(){if(S.mode!=='play')return;S.caught++;fish.state='off';const dmg=Math.round(58*(1-armorCut()));
  try{navigator.vibrate&&navigator.vibrate([200,60,300]);}catch(e){}
  const dx=H.x-P.x,dz=H.z-P.z,d=Math.hypot(dx,dz)||1;P.fx=dx/d;P.fz=dz/d;P.dir=dirOf(dx,dz);H.clip='lunge';H.ft=0;SFX.scream();cam.shake=.9;
  if(S.hp-dmg>0){S.mode='scare';faceSlam(1.1,true);S.hp-=dmg;mindHit(12);
    setTimeout(()=>{$('scare').hidden=true;$('scare').classList.remove('on');S.mode='play';H.x=P.x+dx/d*7;H.z=P.z+dz/d*7;collide(H,.4);H.grace=7;flashT=Math.max(flashT,.4);
      toast(`It opens you up from shoulder to hip, then lets go. It wants you to run. Health ${Math.round(S.hp)}. If it catches you again, you die.`,4.6,true);},1250);return;}
  die();};})();
function die(){S.mode='dead';S.deaths++;S.hp=0;faceSlam(2.6,true);SFX.shriek&&SFX.shriek(0);
  setTimeout(()=>{$('scare').hidden=true;$('scare').classList.remove('on');const el=$('death');el.querySelector('.k').textContent=`Day ${S.day} · ${fmtTime(S.hour)} · death ${S.deaths}`;
    el.querySelector('.t').textContent=pick(DEATH_LINES)+(typeof HOST!=='undefined'&&HOST.role==='guest'?' You will wake at the farm.':' You will wake on the morning of this day. Everything since then is gone.');el.style.display='flex';SFX.bell&&SFX.bell();},2300);}
$('deathWake').addEventListener('click',()=>{$('death').style.display='none';
  if(typeof HOST!=='undefined'&&HOST.role==='guest'){S.hp=Math.max(30,S.hpMax*.4);S.energy=Math.max(S.energy,30);S.room=null;P.x=0;P.z=-7.6;H.state='gone';H.timer=10;H.vis=false;S.mode='play';toast('You wake on the porch. Your own blood is dry on the boards. Nobody else remembers.',4.2,true);return;}
  let m=null;try{m=JSON.parse(localStorage.getItem(SAVE_KEY+'_morning')||'null');}catch(e){}
  if(m&&m.v===1){m.mid=null;localStorage.setItem(SAVE_KEY,JSON.stringify(m));S.mode='trans';fade(1);setTimeout(()=>{location.reload();},500);try{sessionStorage.setItem('hollowAutoCont','died');}catch(e){}return;}
  S.hp=S.hpMax*.5;S.mode='play';newDay('You wake in your bed. You remember dying. Your body doesn’t. Somebody washed your clothes.');});
// after a death the game reopens straight into the morning
{let f=null;try{f=sessionStorage.getItem('hollowAutoCont');sessionStorage.removeItem('hollowAutoCont');}catch(e){}
  if(f==='died'||f==='update'){const go=()=>{if($('loadScr')||S.mode!=='title'){setTimeout(go,250);return;}const b=$('cont');if(b){b.click();setTimeout(()=>f==='died'?toast(`Day ${S.day}. Morning. You remember dying. Nobody else does.`,4.6,true):toast('Updated to the newest version. Right where you left off.',3.6),900);}};setTimeout(go,300);}}
