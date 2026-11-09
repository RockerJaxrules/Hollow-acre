/* ================= the horror director. Fear builds from what people expect a game to do and what it suddenly won't.
   It escalates with the story: the drive in, the loop, the binding, the Tithe, the last week. Most of it happens once.
   Nothing here is random noise: each scare is placed where the player has learned to feel safe (the cabin, the menus,
   the save, the tutorial, the real clock on their own device). ================= */
S.hz=S.hz||{once:{},crows:0,lore:0,knock:0};
const HZ={follow:0,followStop:0,lastStep:0,silence:0,cd:{},sessionT:0,tall:null,crash:null};
const NAME=()=>(S.look&&S.look.name||'').trim();
// how far the story has gone: 0 the first days, 4 the last week
const hl=()=>S.st&&S.st.done?1:!S.looped?0:!S.bound?1:S.st.act<=2?2:(stLeft()>6?3:4);
const once=k=>{if(S.hz.once[k])return false;S.hz.once[k]=1;return true;};
const cdReady=(k,sec)=>{const t=performance.now()/1000;if(HZ.cd[k]&&t<HZ.cd[k])return false;HZ.cd[k]=t+sec;return true;};
const realClock=()=>{const d=new Date();let h=d.getHours(),m=d.getMinutes();const ap=h>=12?'PM':'AM';h=h%12||12;return `${h}:${String(m).padStart(2,'0')} ${ap}`;};
function gainTo(v,t){if(!A.ok||!A.master)return;const g=A.master.gain,n=A.ctx.currentTime;g.cancelScheduledValues(n);g.setValueAtTime(g.value,n);g.linearRampToValueAtTime(v,n+(t||.3));}

// ---- 1. the footsteps that follow yours, a quarter-second late. When you stop, they take one more.
{const _st=SFX.step;SFX.step=function(c){_st.call(SFX,c);if(HZ.follow>0&&!S.room)setTimeout(()=>{A.ok&&A.hiss(c?.1:.045,.05,c?'bandpass':'lowpass',c?2300:520,{q:1});},230+rand()*40);};}

// ---- 2. the scarecrows: after the binding, one more stands in your field every night, all facing the cabin
const CROW_SPOTS=[[-4.2,8.6],[4.6,8.8],[-5.6,4.4],[6.2,3.8],[-2,9.4],[2.4,9.6],[-6.4,1.2],[7,1],[0.2,10.2],[-3.6,-0.6],[4.2,-0.4],[-7.2,6.6],[7.8,6.4],[-1,11]];
function crowDraw(x,z){const X=sx(x),Y=sz(z);shadow(X,Y,8);if(SPR.scarecrow){drawSpr('scarecrow',X,Y,'idle','N',Math.floor(performance.now()/1000*2.2+x*1.7+z)%4);return;}ctx2.fillStyle='#4a3020';ctx2.fillRect(Math.round(X)-1,Math.round(Y)-70,3,70);ctx2.fillRect(Math.round(X)-22,Math.round(Y)-56,45,3);drawSpr('hollow',X,Y-6,'walk','N',0,{scale:.62});}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);
  if(!S.room&&S.bound&&!(S.st&&S.st.done)&&!(stTitheNight&&stTitheNight()))for(let i=0;i<Math.min(S.hz.crows,CROW_SPOTS.length);i++){const [x,z]=CROW_SPOTS[i];if(!onScreen(x,z,80))continue;D.push({z,mind:1,draw(){crowDraw(x,z);}});}
  if(HZ.tall){const q=HZ.tall;D.push({z:q.z,mind:1,draw(){drawSpr('hollow',sx(q.x),sz(q.z),'walk',q.dir||'S',q.moving?frameOf('hollow','walk',q.t*1.4):0,{scale:1.35,alpha:.92});}});}};}

// ---- 3. the cabin: knocking in your own voice, the mirror, the bed
const CAB=ROOMS.cabin;
interact.push({x:CAB.ox+8.45,z:CAB.oz+.5,r:1,on:()=>S.room==='cabin',label:()=>'Mirror',ok:()=>true,act(){const L=hl();SFX.breath&&SFX.breath();
  const t=[`You look tired. You look like someone who has been driving all night.`,
    `Your reflection blinks a moment after you do. You blink again to check. It doesn’t blink at all.`,
    `Your reflection is already looking at the door. You turn. Nothing. When you look back it is looking at you again, smiling slightly, as if you missed something.`,
    `The mirror shows the room behind you: the bed, the covers pulled up over someone. Breathing slowly. You do not turn around. You do not turn around.`,
    `The mirror shows the cabin empty. Your coat is gone from the hook. The bed is made. It is tomorrow in there, and you aren’t in it.`][L];
  toast(t,4.6,L>=2);if(L>=2)mindHit(3+L);if(L>=3&&once('mirrorSlam'))setTimeout(()=>faceSlam(.5,false),1400);}});
{const _lr=leaveRoom;leaveRoom=function(a){if(S.room==='cabin'&&S.hz.knock&&performance.now()-S.hz.knock<25000){S.hz.knock=0;mindHit(8);SFX.stinger&&SFX.stinger();
    toast('You open the door. Nobody. Wet footprints lead from the step, past your feet, across the floor. They stop at your bed.',5,true);return;}return _lr.apply(this,arguments);};}

// ---- 4. the menus: a neighbour who isn't one, a journal you didn't write
{const _rs=renderSocial;renderSocial=function(){_rs();if(hl()<2)return;const B=$('bagBody').querySelector('.soc');if(!B)return;const nm=NAME()||'You';
  const d=document.createElement('div');d.className='p';d.innerHTML=`<canvas width="40" height="40" style="background:#000"></canvas><div style="flex:1"><b>${nm}</b><div class="h">${'♥'.repeat(HEART_MAX())}</div><small>Lives under your bed</small><span class="tk">✓ talked today · 🎂 birthday today</span></div>`;
  B.appendChild(d);d.addEventListener('click',()=>{$('socInfo').innerHTML=`<b>${nm}</b> loves you; likes you; is you. Something will happen at ${HEART_MAX()+1} hearts.`;SFX.whisper&&SFX.whisper(0);mindHit(2);});};}
const INTRUDE=['I sat on the end of your bed last night. You looked so peaceful I didn’t wake you.','You talk in your sleep. You said my name. I didn’t know you knew it.',
  'I moved the scarecrow back for you. You were tired. You looked like you needed one less thing.','I’ve been practising your walk. Caitlyn waved at me today. She thought I was you.',
  'Your window doesn’t lock. Did you know? It never has.','I counted your breaths. You stopped for a while around three. Then you started again. I was so relieved.',
  'Tomorrow, when you go out, I’ll stay in. Someone should keep your place warm.'];
// ---- 5. the tips that stop being helpful
const HTIPS=['Tip: Don’t turn around.','Tip: Hold your breath when you pass the corn. It can hear it.','Tip: If someone says your name from inside the cabin, you are not inside the cabin.',
  'Tip: Count the people in the square. Then count them again.','Tip: You can stop playing at any time.','Tip: You can’t stop playing at any time.','Tip: It is standing where the camera doesn’t go.'];
{const c=document.createElement('style');c.textContent=`#htip{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 150px);z-index:41;width:min(380px,88vw);background:rgba(42,26,14,.94);color:#f4e6c8;padding:10px 14px;font-size:14px;line-height:1.4;box-shadow:0 0 0 2px #1a0e06,0 0 0 4px #b8521c;display:none}
#htip .tk{color:var(--ember);font-size:12px;letter-spacing:.14em;text-transform:uppercase;margin-bottom:3px}
#crash{position:fixed;inset:0;z-index:998;display:none;background:#000}#crash img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(.7) brightness(.75);image-rendering:pixelated}
#crash .dlg{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:min(340px,86vw);background:#f2f2f2;color:#111;font:14px/1.45 -apple-system,Segoe UI,Roboto,sans-serif;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.6);padding:18px 18px 12px}
#crash .dlg b{display:block;font-size:16px;margin-bottom:6px}#crash .dlg .r{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}#crash .dlg button{font:inherit;border:0;border-radius:6px;padding:7px 14px;background:#ddd;color:#111}#crash .dlg button.p{background:#2a6fdb;color:#fff}
#crash canvas{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(70vw,420px);image-rendering:pixelated;opacity:0;transition:opacity 2.8s}`;document.head.appendChild(c);
  const t=document.createElement('div');t.id='htip';$('app').appendChild(t);const k=document.createElement('div');k.id='crash';k.innerHTML='<img alt=""><canvas width="48" height="64"></canvas><div class="dlg"></div>';document.body.appendChild(k);}
function htip(txt){const el=$('htip');el.innerHTML=`<div class="tk">Tutorial</div>${txt}`;el.style.display='block';SFX.coin&&SFX.coin();setTimeout(()=>{el.style.display='none';},5200);}

// ---- 6. the game stops responding
function fakeCrash(){if(HZ.crash)return;HZ.crash=1;S.paused=true;let img='';try{img=$('view').toDataURL('image/jpeg',.7);}catch(e){}
  const k=$('crash');k.querySelector('img').src=img;const dlg=k.querySelector('.dlg');const cv=k.querySelector('canvas');cv.style.opacity=0;
  const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,48,64);const m=SPR.hollow,im=m&&IMG[m.src];if(im){const r=m.clips.walk.S[0];g.drawImage(im,0,r*m.fh,m.fw,m.fh,0,0,48,64);}
  dlg.innerHTML='<b>“Hollow Acre” isn’t responding</b>You can wait for it to respond, or close it. You may lose unsaved progress.<div class="r"><button data-a="close">Close app</button><button class="p" data-a="wait">Wait</button></div>';
  k.style.display='block';gainTo(0,.05);
  const finish=()=>{setTimeout(()=>{faceSlam(.9,true);setTimeout(()=>{k.style.display='none';gainTo(.9,.4);S.paused=false;HZ.crash=null;mindHit(14);toast(NAME()?`Don’t leave, ${NAME()}. You only just got here.`:'Don’t leave. You only just got here.',4,true);},900);},300);};
  dlg.onclick=e=>{const a=e.target.dataset&&e.target.dataset.a;if(!a)return;
    if(a==='close'){dlg.innerHTML='<b>“Hollow Acre” isn’t responding</b>You can’t close it from in here.';setTimeout(finish,2200);}
    else{dlg.innerHTML='<b>“Hollow Acre” isn’t responding</b>Waiting…';dlg.style.opacity=.85;setTimeout(()=>{dlg.style.display='none';cv.style.opacity=.95;SFX.breath&&SFX.breath();},1600);setTimeout(()=>{dlg.style.display='';dlg.style.opacity='';finish();},5200);}};}

// ---- 7. the line under "Saved"
function saveLine(){const L=hl();if(L>=4)return pick(['Saved. Both of you.','Saved.','Saved. One of you.']);if(L>=3&&rand()<.3)return 'Saved. (2 profiles found)';return 'Saved';}

// ---- the director, every frame
{const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);horrorUpdate(dt);};}
function horrorUpdate(dt){if(S.mode!=='play'||S.paused)return;HZ.sessionT+=dt;const L=hl(),night=isNight(),out=!S.room;
  const pv=HZ.pv||(HZ.pv={x:P.x,z:P.z});const mv=Math.hypot(P.x-pv.x,P.z-pv.z)/Math.max(dt,1e-3);pv.x=P.x;pv.z=P.z;HZ.pspd=mv>40?0:lerp(HZ.pspd||0,mv,.3);const moving=HZ.pspd>.4;
  // footsteps behind you at night
  if(L>=1&&night&&out){if(HZ.follow<=0&&moving&&cdReady('follow',150+rand()*120)&&rand()<.5)HZ.follow=18+rand()*10;}
  if(HZ.follow>0){HZ.follow-=dt;if(moving)HZ.followStop=1;else if(HZ.followStop){HZ.followStop=0;HZ.follow=0;setTimeout(()=>{A.ok&&A.hiss(.06,.06,'lowpass',520,{q:1});},640);
      if(once('oneMore'))setTimeout(()=>toast('Something behind you takes one more step than you do.',3.4,true),900);mindHit(3);}}
  // the real time, on their own device
  const rh=new Date().getHours();if(L>=1&&night&&out&&(rh>=22||rh<5)&&!HZ.cd.clock&&HZ.sessionT>120){HZ.cd.clock=1;mindHit(5);setTimeout(()=>toast(`It’s ${realClock()} where you are too. You should be asleep. It’s easier when you’re asleep.`,5,true),300);}
  if(HZ.sessionT>35*60&&!HZ.cd.session){HZ.cd.session=1;toast(`You’ve been here ${Math.round(HZ.sessionT/60)} minutes. It has been watching for ${Math.round(HZ.sessionT/60)-1}.`,4.6,true);}
  // the silence
  if(L>=2&&out&&HZ.silence<=0&&cdReady('silence',360+rand()*240)&&rand()<.6){HZ.silence=9;gainTo(0,.6);}
  if(HZ.silence>0){HZ.silence-=dt;if(HZ.silence<=0){gainTo(.9,.05);SFX.thud(0,.7);setTimeout(()=>SFX.thud(0,.7),420);setTimeout(()=>SFX.thud(0,.7),840);mindHit(4);}}
  // knocking while you're inside at night
  if(L>=2&&S.room==='cabin'&&night&&!S.hz.knocked&&cdReady('knockCheck',20)&&rand()<.5){S.hz.knocked=S.day;S.hz.knock=performance.now();SFX.thud(0,.6);setTimeout(()=>SFX.thud(0,.6),500);setTimeout(()=>SFX.thud(0,.6),1000);
    setTimeout(()=>toast(NAME()?`“${NAME()}? Let me in. It’s cold. It’s me.” It is your voice.`:'“Let me in. It’s cold. It’s me.” It is your voice.',4.6,true),1500);}
  // the game stops responding, once
  if(L>=2&&night&&out&&HZ.sessionT>240&&!S.hz.once.crash&&cdReady('crashCheck',45)&&rand()<.25){S.hz.once.crash=1;fakeCrash();}
  // the tips
  if(L>=3&&!night&&out&&cdReady('tip',220+rand()*200)&&rand()<.5){const i=S.hz.tip||0;if(i<HTIPS.length){S.hz.tip=i+1;htip(HTIPS[i]);}}
  // Tithe night: the Tall Man walks behind you down the Mill Road, as fast as you do. Never faster. Unless you turn back.
  if(stTitheNight()&&night&&out&&!S.st.done){const onRoad=P.x>14&&P.x<26&&P.z>30&&P.z<86;
    if(!HZ.tall&&onRoad&&P.z<50){HZ.tall={x:20,z:P.z-6.5,t:0,dir:'S',moving:false};SFX.shriek&&SFX.shriek(0);toast('Behind you, at the top of the road, something very tall has started walking. Don’t turn back.',4.4,true);mindHit(8);}
    if(HZ.tall){const q=HZ.tall;q.t+=dt;const dx=P.x-q.x,dz=P.z-q.z,d=Math.hypot(dx,dz);q.dir=dirOf(dx,dz);
      const want=5.2,sp=d>want?Math.min(HZ.pspd,7)+.4:0;q.moving=sp>.05;if(q.moving){q.x+=dx/d*sp*dt;q.z+=dz/d*sp*dt;}
      if(d<2.4){if(typeof safeNight==='function'&&safeNight()){q.x=P.x-dx/d*2.6;q.z=P.z-dz/d*2.6;if(!q.warned){q.warned=1;SFX.stinger&&SFX.stinger();toast('It reaches for you, and its hand stops an inch from your neck, as if something is holding its wrist. It can’t take you. It keeps walking behind you anyway.',4.6,true);}}   // Jaxon 8
        else{HZ.tall=null;stEnding('taken');return;}}
      if(rand()<dt*.6)SFX.heart&&SFX.heart(.35);if(P.z>86)HZ.tall=null;}}
  else if(HZ.tall)HZ.tall=null;}

// ---- mornings: the scarecrows, the journal, the dreams
{const _nd=newDay;newDay=function(msg,pos){_nd(msg,pos);const L=hl();if(!S.st||S.st.done||S.mode==='end')return;
  if(S.bound&&S.st.act>=3){S.hz.crows++;if(S.hz.crows===1)setTimeout(()=>toast('There is a scarecrow in your field again. You burned it. You watched it burn.',4.4,true),4600);
    else if(S.hz.crows===2)setTimeout(()=>toast('There are two scarecrows in your field now. Both of them are facing your bedroom window.',4.4,true),4600);}
  if(L>=2&&S.hz.lore<INTRUDE.length&&rand()<.55){const t=INTRUDE[S.hz.lore++];setTimeout(()=>{addLore(t);},7000);}
  if(L>=3&&rand()<.4&&cdReady('dream',1))setTimeout(()=>openNote(`<h3>You dreamed</h3><p>${pick(['You were standing in the field at night, facing the cabin. There was a light on inside. Someone was in your bed. You waited for them to fall asleep.','You were very tall. You had to bend your neck to fit under the sky. Everyone in town was asleep, and you knew which one was next, and you were so sorry.','You were in the Tithe House. It was full of people, pushing on the door. Someone next to you whispered: you’re not pushing. Why aren’t you pushing?','You were driving to the farm. Grandpa called and told you not to come. In the dream you listened. You turned around. You woke up here anyway.'])}</p>`,'Wake up',()=>mindHit(4)),1200);};}
// ---- in town, the gaslighting
const HZ_TALK=['You were standing outside my window last night. For hours. Weren’t you?','We’ve met before. You don’t remember. That’s all right. Nobody remembers the first time.',
  'Did you just say something? You moved your mouth.','Who were you talking to at the well this morning? There was no one there. You were laughing.','You look different today. Taller. Did you sleep in the field again?'];
{const _t=talk;talk=function(n){_t(n);const L=hl();if(L>=2&&rand()<.14&&$('talkLine'))setTimeout(()=>{if($('talk').hidden)return;let l=pick(HZ_TALK);if(NAME()&&rand()<.5)l=`Goodnight, ${NAME()}. …Oh. It’s still daytime, isn’t it.`;$('talkLine').innerHTML=`<q>${l}</q>`;},0);};}
// ---- the title screen remembers
{let seen=0;try{seen=+(localStorage.getItem('hollowSeen')||0);localStorage.setItem('hollowSeen',seen+1);}catch(e){}
  const tg=$('title').querySelector('.tag'),kk=$('title').querySelector('.kicker');
  if(stFound.length){kk.textContent='Chapter One · Again';tg.textContent='Grandpa called three days ago and told you not to come. You came anyway. You always come anyway. We kept your place.';}
  else if(seen>=2&&readSave()){tg.textContent='You came back. The cabin light has been on the whole time you were gone.';}}
