/* ================= the tutorial: a coach bubble that teaches by doing. Core steps come in order; the rest wait until they matter.
   Everything can be skipped, and it reads differently on a phone and a keyboard. ================= */
S.tut=S.tut||{done:{},off:false};
const TOUCH=matchMedia('(pointer:coarse)').matches;
const tutMove={x:null,z:null,d:0};
const TUT=[
  // core, in order
  {id:'move',core:1,text:()=>TOUCH?'Drag anywhere on the screen to walk. Drag further to run.':'Walk with <b>WASD</b> or the arrow keys. Hold <b>Shift</b> to run.',done:()=>tutMove.d>4},
  {id:'act',core:1,when:()=>S.foundCabin,text:()=>TOUCH?'To talk, open, read or pick something up, just <b>tap it</b>. Tap the note nailed to the cabin door.':'To talk, open, read or pick something up, <b>right-click</b> it (or face it and press <b>X</b>). Right-click the note nailed to the cabin door.',done:()=>S.readLetter},
  {id:'menu',core:1,when:()=>S.readLetter,text:()=>`Open the menu to see your backpack.${TOUCH?'':' Shortcut: <b>E</b> or <b>Tab</b>, or <b>M</b> for the map.'}`,target:'#btnBag',done:()=>S.tut.openedMenu},
  {id:'drag',core:1,when:()=>S.tut.openedMenu&&!$('bag').hidden,text:()=>'The top row is your toolbar. Drag an item to move it; drop it on the bin to throw it away. Close the menu when you’re done.',target:'#invGrid',done:()=>$('bag').hidden},
  {id:'till',core:1,when:()=>S.readLetter&&$('bag').hidden,text:()=>TOUCH?'Tools work like this: <b>pick a tool</b> on your toolbar, then <b>tap the spot</b>. Pick the <b>hoe</b> and tap a square of the brown field by the cabin. Far away? You walk over first.':'Tools work like this: <b>pick a tool</b> on your toolbar (number keys or the mouse wheel), then <b>left-click the spot</b>. Pick the <b>hoe</b> and click a square of the brown field by the cabin. Hold the button to keep digging.',target:'#hotbar',done:()=>S.everTilled},
  {id:'plant',core:1,when:()=>S.everTilled,text:()=>`Now pick your <b>seeds</b> on the toolbar${TOUCH?'':' (number keys)'} and ${TOUCH?'tap':'click'} the dark tilled soil to plant them.`,target:'#hotbar',done:()=>S.everPlanted},
  {id:'water',core:1,when:()=>S.everPlanted,text:()=>`Seedlings need water every day. Pick the <b>watering can</b> and ${TOUCH?'tap':'click'} each one. The number on the can is how much is left. Refill it at the stone <b>well</b> beside the cabin (${TOUCH?'tap':'right-click'} it), or ${TOUCH?'tap':'click'} the pond with the can.`,target:'#hotbar',done:()=>S.everWatered},
  {id:'bars',core:1,when:()=>S.everWatered,text:()=>'These bars are your <b>energy</b> and <b>health</b>. Work spends energy; food and sleep bring it back.',target:'#bars',done:()=>S.tut.barsT>6},
  // contextual, once each, when they become relevant
  {id:'talk',when:()=>npcs.some(n=>n.vis&&PEOPLE[n.def.id]&&Math.hypot(n.x-P.x,n.z-P.z)<3),text:()=>'Someone’s nearby. Talk to people once a day and they warm to you. Hearts open scenes; gifts help, two a week.',done:()=>Object.keys(S.talkedToday||{}).length>0},
  {id:'fish',when:()=>!S.room&&typeof waterAhead==='function'&&waterAhead(),text:()=>`Pick your <b>rod</b> and ${TOUCH?'tap':'click'} the water where you want to cast. Little twitches are only nibbles: wait until the float is pulled right under, then ${TOUCH?'tap':'click'} to strike. Hold${TOUCH?' your finger down':' <b>Space</b>'} to reel in; let go when it runs or jumps.`,done:()=>(S.fishCaught||0)>0||S.tut.fishT>14},
  {id:'ship',when:()=>S.basket.length>0,text:()=>'Crops and fish go in the shipping bin by the cabin: drag them in, or tap them. The truck takes it all overnight and you’re paid in the morning.',done:()=>S.shipped>0},
  {id:'dusk',when:()=>S.hour>=18&&!S.room,text:()=>'It’s getting dark. Your lantern burns oil at night. When the church bell rings at eight, don’t be out in the corn.',done:()=>S.tut.duskT>8},
  {id:'map',when:()=>S.day>=1&&S.hour>=9&&S.everWatered,text:()=>`The <b>Map</b> tab in the menu shows the whole valley and where you are.${TOUCH?'':' Press <b>M</b>.'}`,target:'#btnBag',done:()=>S.tut.sawMap},
  {id:'sleep',when:()=>S.hour>=21,text:()=>'It’s late. Go to bed in the cabin to save the day and wake rested. Staying out past two in the morning is a very bad idea.',done:()=>S.tut.slept},
];
{const css=document.createElement('style');css.textContent=`#tut{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 150px);z-index:40;width:min(400px,90vw);background:rgba(42,26,14,.94);color:#f4e6c8;
  box-shadow:inset 0 0 0 3px #1a0e06,inset 0 0 0 6px #e8923f,0 4px 0 #1a0e06;padding:9px 12px 8px;font-size:13px;line-height:1.4;display:none;animation:tutIn .35s ease}
#tut b{color:#ffd27a;font-weight:600}#tut .tk{font-family:var(--font-display);color:var(--ember);font-size:13px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px}
#tut .row{display:flex;justify-content:space-between;align-items:center;margin-top:8px}#tut .row button{font:inherit;font-size:12px;padding:4px 10px;background:#3a2414;color:var(--bone);border:0;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 3px #6a4424;cursor:pointer}
.tutHi{outline:3px solid #ffd27a!important;outline-offset:3px;animation:tutPulse 1s steps(2) infinite}@keyframes tutPulse{50%{outline-color:#e8923f}}@keyframes tutIn{from{opacity:0;transform:translate(-50%,-8px)}}`;document.head.appendChild(css);
  const el=document.createElement('div');el.id='tut';el.setAttribute('role','status');el.innerHTML='<div class="tk">Tip</div><div class="tx"></div><div class="row"><span class="ct" style="font-size:12px;color:var(--dim)"></span><span><button id="tutNext">Got it</button> <button id="tutSkip">Skip tutorial</button></span></div>';document.body.appendChild(el);
  $('tutSkip').addEventListener('click',()=>{S.tut.off=true;tutShow(null);toast('Tutorial off. Tips are in the journal if you need them.',2);});
  $('tutNext').addEventListener('click',()=>{if(TUT_CUR)S.tut.done[TUT_CUR.id]=1;tutShow(null);});}
let TUT_CUR=null,TUT_HI=null;
function tutShow(step){const el=$('tut');if(TUT_HI){TUT_HI.classList.remove('tutHi');TUT_HI=null;}TUT_CUR=step;if(!step){el.style.display='none';return;}
  el.querySelector('.tx').innerHTML=step.text();const n=TUT.filter(s=>s.core).length,k=TUT.filter(s=>s.core&&S.tut.done[s.id]).length;el.querySelector('.ct').textContent=step.core?`Step ${k+1} of ${n}`:'';
  el.style.display='block';if(step.target){const t=document.querySelector(step.target);if(t){t.classList.add('tutHi');TUT_HI=t;}}}
let tutLast=0;
setInterval(()=>{if(S.tut.off||S.mode!=='play'){if(TUT_CUR)tutShow(null);return;}const dt=.25;
  if(tutMove.x===null){tutMove.x=P.x;tutMove.z=P.z;}tutMove.d+=Math.hypot(P.x-tutMove.x,P.z-tutMove.z);tutMove.x=P.x;tutMove.z=P.z;
  if(TUT_CUR){const id=TUT_CUR.id;if(id==='bars')S.tut.barsT=(S.tut.barsT||0)+dt;if(id==='fish')S.tut.fishT=(S.tut.fishT||0)+dt;if(id==='dusk')S.tut.duskT=(S.tut.duskT||0)+dt;
    if(TUT_CUR.done()){S.tut.done[id]=1;tutShow(null);SFX.coin&&SFX.coin();}else if(S.paused&&!$('bag').hidden&&id!=='drag'){$('tut').style.display='none';}else $('tut').style.display='block';return;}
  if(S.paused&&$('bag').hidden)return;
  const core=TUT.filter(s=>s.core&&!S.tut.done[s.id]);const nxt=core[0];
  if(nxt&&(!nxt.when||nxt.when())){if(nxt.done()){S.tut.done[nxt.id]=1;return;}tutShow(nxt);return;}
  if(core.length&&core[0].id!=='bars'&&!S.everWatered)return;                       // stay on the farm lessons until they're learned
  for(const s of TUT){if(s.core||S.tut.done[s.id])continue;if(s.when&&s.when()){if(s.done()){S.tut.done[s.id]=1;continue;}tutShow(s);return;}}},250);
{const _ob=openBag;openBag=function(tab){_ob(tab);S.tut.openedMenu=true;if(tab==='map'||GM_TAB==='map')S.tut.sawMap=true;};}
{const _sl=sleep;sleep=function(){S.tut.slept=true;_sl();};}
