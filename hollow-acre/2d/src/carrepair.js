/* ================= #213 staged car repair — the flow that drives mg4car.js =================
   The single "install four parts, press once" is gone. The car is wrecked completely and mends
   in seven stages, each its own minigame (mg4car.js), the car on the canvas gaining a part each
   time. Parts are still gathered the same way (tire from Caitlyn, battery from Hollis for three
   pumpkins, belt from Agnes, gas from the pump) but a part now gates the stage that uses it, so
   the repair takes real time. S.carStage (0..7) is the new truth; S.carFixed stays the end state
   so every downstream thing (the escape cutscene, the beaten-car swap, the HUD) keeps working. */

const CAR_STAGES=[
  {id:'winch',icon:'wrench',
   obj:'The car is folded around the oak. Hook the winch to the frame and crank it off the tree.',
   done:'The car tears off the oak with a shriek and drops onto its wheels.',
   mg:{mech:'crank',n:7,name:'Winch it off the oak',title:'Haul it off the oak'}},
  {id:'frame',icon:'wrench',
   obj:'The whole front end is crumpled. Hammer the frame and fenders back into line.',
   done:'The frame is roughly true again. It looks like a car, not a ball of foil.',
   mg:{mech:'hit',n:6,name:'Beat the frame straight',title:'Beat the frame straight',hud:'LINE'}},
  {id:'rad',icon:'wrench',need:'belt',
   needMsg:'You still need the fan belt. Agnes keeps her late husband’s, in the last house west — near your car.',
   obj:'Fit Agnes’s fan belt over the pulleys and clamp the radiator hoses down.',
   done:'The belt bites and the radiator holds pressure. The steam stops.',
   mg:{mech:'hit',n:5,name:'Belt & radiator',title:'Seat the belt and clamps',hud:'SEAT'}},
  {id:'wheel',icon:'wrench',need:'tire',
   needMsg:'You still need a tire. Caitlyn sells one at Coyle’s store, east on Route 9.',
   obj:'Mount Caitlyn’s tire and torque the lug nuts down in a star.',
   done:'The wheel is on and true. The car sits level for the first time.',
   mg:{mech:'hit',n:4,name:'Mount the wheel',title:'Torque the lug nuts',hud:'TORQUE'}},
  {id:'glass',icon:'wrench',
   obj:'The windshield is a web of cracks. Press the new glass in and run the seal.',
   done:'Clear glass. You can see the road through it now — and what stands on it.',
   mg:{mech:'hit',n:5,name:'Set the windshield',title:'Press the glass in',hud:'SET'}},
  {id:'wires',icon:'wrench',need:'battery',
   needMsg:'You still need the battery. Bring Hollis three pumpkins and he’ll trade.',
   obj:'Drop Hollis’s battery in and seat the loom connectors onto the terminals.',
   done:'The dash lights come up. Something in the wiring ticks, like it is counting.',
   mg:{mech:'hit',n:5,name:'Wire the battery in',title:'Seat the connectors',hud:'SEAT'}},
  {id:'start',icon:'wrench',need:'gas',
   needMsg:'You still need gas. There’s a pump outside Hollis’s garage — twenty in the honor box.',
   obj:'Pour the gas in and crank the engine over until it catches.',
   done:'The engine coughs, then catches. The radio turns on by itself.',
   mg:{mech:'crank',n:8,name:'Turn it over',title:'Crank it until it catches'}}
];
const CAR_PART_TGT=()=>({tire:npcById('mae'),battery:npcById('hollis'),belt:npcById('agnes'),gas:typeof pumpPos!=='undefined'?pumpPos:carPos});
const carStageN=()=>S.carFixed?CAR_STAGES.length:(S.carStage||0);

// ---- the interaction: gate on the part, then play the stage's minigame, then mend one part
carAct=function(){
  if(S.carFixed){if(S.hour<17){toast('Not yet. You want daylight left when you hit the highway. Come back near sunset.',2.8);return;}startCine('escape');return;}
  if(!S.q.hollis){toast('Talk to Hollis at the garage first — he’ll tell you what the car needs.',3);return;}
  const cs=S.carStage||0,stage=CAR_STAGES[cs];if(!stage){S.carFixed=true;return;}
  if(stage.need&&!(S.parts[stage.need]>=1)){toast(stage.needMsg,3.4);return;}
  if(typeof mg4Run!=='function'||typeof carMg!=='function'){// fallback: never block the game if the minigame failed to load
    if(stage.need)S.parts[stage.need]=2;S.carStage=cs+1;if(S.carStage>=CAR_STAGES.length)S.carFixed=true;toast(stage.done,3.2);return;}
  carMg(stage,res=>{
    if(stage.need)S.parts[stage.need]=2;
    S.carStage=cs+1;const last=S.carStage>=CAR_STAGES.length;if(last)S.carFixed=true;
    if(typeof burst==='function')burst(carPos.x,carPos.z+2,12,last?'#ffd27a':'#c8c8cc',1.7,.7,2);
    const q=res>.8?' Clean work.':res<.4?' Rough, but it holds.':'';
    if(last){toast(stage.done,4,false);SFX&&SFX.engineStart&&SFX.engineStart();}
    else {toast(stage.done+q,3.2);SFX&&SFX.till&&SFX.till();}
    if(typeof carShow==='function')carShow();if(typeof updateHud==='function')updateHud();if(typeof save==='function')try{save();}catch(e){}
  });
};

// ---- objective: the staged repair window only; defer to the original for every other phase
{const _obj=objective;objective=function(){
  if(S.bound||!S.foundCabin||!S.readLetter||!S.everTilled||!S.everPlanted||!S.everWatered||S.shipped===0||!S.q.hollis||S.carFixed||S.looped)return _obj();
  const cs=S.carStage||0,stage=CAR_STAGES[cs];if(!stage)return _obj();
  if(stage.need&&!(S.parts[stage.need]>=1)){const tgt=CAR_PART_TGT()[stage.need];return ['The car',stage.needMsg,tgt||carPos];}
  return ['The car','Repair '+(cs+1)+'/'+CAR_STAGES.length+' — '+stage.obj,carPos];
};}

// ---- HUD: show the stage count while the car is being rebuilt
{const _uh=updateHud;updateHud=function(){_uh();try{if(!S.carFixed&&S.q&&S.q.hollis&&ui&&ui.parts){const v=carStageN()+'/'+CAR_STAGES.length;if(ui.parts.textContent!==v)ui.parts.textContent=v;}}catch(e){}};}
