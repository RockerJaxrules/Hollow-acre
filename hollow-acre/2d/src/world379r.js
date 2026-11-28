/* ================= #379r W6, door scares, after stage C (story plan 6.3: "after C, one knock in twenty is real: open the door and it
   opens you up and lets you go"). Once the thing in the doorway has come (stage C), when knocks come at night and you open the door, one
   time in twenty it is really there: the crouched shape fills the doorway, its face is in yours, and it opens you up and lets you go.
   The wound is death.js's first catch, copied here and aimed at the doorway (death.js's caught() works on the scarecrow, so it is not
   called): the same 58 x (1 - armour), the same 12 to the mind (through the Fear bar, 'caught'), the same release after 1.25 s and the
   same words. It never kills: your health never goes below 1, and die() is never called. No body, no blood drawn, nothing left in view.
   Not in a shared game. ================= */
const W79R={force:0};
function w79rOk(){try{if(typeof mpOn==='function'&&mpOn())return false;S.w79p=S.w79p||{};return !!S.w79p.c&&(typeof wk79Ch==='function'?wk79Ch():1)>=9;}catch(e){return false;}}
function w79rReal(){if(!w79rOk())return false;if(W79R.force){W79R.force=0;return true;}return rand()<.05;}
// the first catch, aimed at the doorway: you are turned toward it, its face is in yours, and it lets you go (death.js, caught(), first branch)
function w79rWound(){if(S.mode!=='play')return;S.caught++;fish.state='off';const dmg=Math.round(58*(1-armorCut()));
  try{navigator.vibrate&&navigator.vibrate([200,60,300]);}catch(e){}
  const R=ROOMS.cabin,dx=(R?R.ox+R.door:P.x)-P.x,dz=(R?R.oz+R.d:P.z+1)-P.z,d=Math.hypot(dx,dz)||1;P.fx=dx/d;P.fz=dz/d;P.dir=dirOf(dx,dz);SFX.scream();cam.shake=.9;
  S.mode='scare';faceSlam(1.1,true);S.hp=Math.max(1,S.hp-dmg);w79Fear(12,'caught');   /* never below 1: this never kills */
  setTimeout(()=>{$('scare').hidden=true;$('scare').classList.remove('on');S.mode='play';flashT=Math.max(flashT,.4);
    toast(`It opens you up from shoulder to hip, then lets go. It wants you to run. Health ${Math.round(S.hp)}. If it catches you again, you die.`,4.6,true);
    setTimeout(()=>{try{if(S.room==='cabin'&&S.mode==='play')toast('The doorway is empty. The yard is empty to the fence. There are no prints this time.',3.8);}catch(e){}},5200);},1250);}
// it, in the doorway, and then on you
function w79rDoor(){SFX.thud&&SFX.thud(0,.3);try{w79qDoorFlash();}catch(e){}setTimeout(()=>{try{w79rWound();}catch(e){}},700);}
// the knocks' own doors (stage A: the knocking at night; stage B: the knock that wakes you), each now real one time in twenty
// (found by their own words, which survive the shipped build's renaming)
{const a=interact.find(i=>i&&typeof i.act==='function'&&/wet prints come in past your feet/.test(String(i.act)));
  if(a){const _a=a.act;a.act=function(){if(W79P.on&&w79rReal()){W79P.on=null;w79rDoor();return;}return _a.apply(this,arguments);};}
  const b=interact.find(i=>i&&typeof i.act==='function'&&/You shut the door and turn round/.test(String(i.act)));
  if(b){const _b=b.act;b.act=function(){if(W79P.b&&w79rReal()){W79P.b.done=true;W79P.b=null;w79rDoor();return;}return _b.apply(this,arguments);};}
  W79R.hooked=[!!a,!!b];}
