// Hollow Acre trailer: the same scripted actions in an early build and today's build (shots marked new-only run in today's build alone).
// Each segment: setup (cut), ['mark',name] then exactly the filmed actions. compose.py cuts DUR[name] seconds from each mark.
const face=d=>['ev',`(P.fx=${d==='E'?1:d==='W'?-1:0},P.fz=${d==='S'?1:d==='N'?-1:0},P.dir='${d}',1)`];
const slot=i=>['ev',`(S.slotSel=${i},typeof renderHotbar=="function"&&renderHotbar(),1)`];
const tp=(x,z)=>['ev',`(__game.tp(${x},${z}),1)`];
const calm=h=>['ev',`(S.hour=${h},S.tut&&(S.tut.off=true),S.energy=Math.max(S.energy||0,S.energyMax||100),S.water=Math.max(S.water||0,10),1)`];
const close=['ev','(document.querySelectorAll("#shop,#craft,#bag").forEach(e=>{e.hidden=true;}),S.paused=false,1)'];
const settle=[['wait',1300],['clear']];
const AUTO='(window.__auto||(window.__auto=setInterval(()=>{if(typeof MG!=="undefined"&&MG.on){const c=MG.zone+MG.size/2;MG.hold=(MG.fy-c)-MG.zv*.35>0;}},30)),1)';
module.exports=[
 {name:'prep',steps:[calm(10),['ev','(["wood","stone","fiber","coal","copper","iron"].forEach(k=>addInv(k,40)),S.seeds.pumpkin=9,S.sel="pumpkin",1)']]},
 {name:'creator',phase:'creator',steps:[['wait',1900],['mark','creator'],['wait',300],['js',`(()=>{const cs=[...document.querySelectorAll('.cpanel .chip, .chips .chip')].filter(c=>c.offsetParent);const on=cs.find(c=>c.classList.contains('on'));[2,9,5].forEach((i,k)=>setTimeout(()=>cs[i]&&cs[i].click(),k*650));setTimeout(()=>on&&on.click(),1950);return cs.length;})()`],['wait',2100],['click','#cR'],['wait',420],['click','#cR'],['wait',420],['click','#cR'],['wait',420],['js',`(()=>{const t=[...document.querySelectorAll('.ctabs button, .ctabs *')].find(b=>b.textContent.trim().toLowerCase()==='clothes');if(t)t.click();return !!t;})()`],['wait',500],['js',`(()=>{const cs=[...document.querySelectorAll('.cpanel .chip, .chips .chip')].filter(c=>c.offsetParent);const on=cs.find(c=>c.classList.contains('on'));[2,9,5].forEach((i,k)=>setTimeout(()=>cs[i]&&cs[i].click(),k*650));setTimeout(()=>on&&on.click(),1950);return cs.length;})()`],['wait',2100]]},
 {name:'crash',phase:'intro',steps:[['wait',12500],['mark','crash'],['wait',10200]]},
 {name:'walk',steps:[tp(3,-4.5),face('E'),...settle,['mark','walk'],['wait',300],['key','ArrowRight',2300],['key','ArrowDown',600],['key','ArrowRight',900],['wait',300]]},
 {name:'chop',steps:[tp(-7.8,-12.5),face('E'),slot(3),...settle,['mark','chop'],['wait',400],['use'],['wait',850],['use'],['wait',850],['use'],['wait',850],['use'],['wait',1700]]},
 {name:'mine',steps:[{old:[tp(-5.4,-2.4)],new:[tp(-5.4,0.6)]},face('E'),slot(2),...settle,['mark','mine'],['wait',400],['use'],['wait',850],['use'],['wait',850],['use'],['wait',850],['use'],['wait',1000]]},
 {name:'farm',steps:[tp(-0.5,1.5),slot(0),face('E'),...settle,['mark','farm'],['wait',400],['use'],['wait',850],face('S'),['use'],['wait',850],
   {old:[slot(5)],new:[slot(6)]},face('E'),['use'],['wait',800],face('S'),['use'],['wait',800],
   slot(1),face('E'),['use'],['wait',1200],face('S'),['use'],['wait',1250],
   ['ev','(tiles.filter(t=>t.crop).forEach(t=>{t.crop.stage=1;t.crop.growth=SEEDS[t.crop.type].grow;}),1)'],['wait',380],
   ['ev','(tiles.filter(t=>t.crop).forEach(t=>{t.crop.stage=2;t.crop.growth=2*SEEDS[t.crop.type].grow;}),1)'],['wait',380],
   ['ev','(tiles.filter(t=>t.crop).forEach(t=>{t.crop.stage=3;t.crop.growth=3*SEEDS[t.crop.type].grow;}),1)'],['wait',900]]},
 {name:'fish',steps:[tp(-30,16.4),face('S'),slot(4),...settle,['ev',AUTO],['mark','fish'],['wait',500],
   ['ev','(startMG(FISH.find(f=>f[0]==="Sunfish")||pickFish("pond",false)),1)'],['wait',5200]]},
 {name:'craft',steps:[close,['ev','(typeof endMG=="function"&&typeof MG!=="undefined"&&MG.on&&endMG(true),1)'],tp(2,-6),face('S'),slot(0),calm(11),...settle,['mark','craft'],['wait',400],['ev','(openShop("craft"),1)'],['wait',1100],
   {old:[['click','button:has-text("Craft") >> nth=1'],['wait',4300]],
    new:[['click','text=Brass sprinkler'],['wait',700],['click','#crMake'],['wait',3600]]},
   ['shot','craft']]},
 {name:'forge',steps:[{new:[{new:[['click','#mg4Skip'],['wait',1200]]},close,['wait',500],['clear'],['mark','forge'],['wait',400],['ev','(openShop("b_furnace"),1)'],['wait',900],['click','#crMake'],['wait',3800],['shot','forge']]}]},
 {name:'bag',steps:[{new:[['click','#mg4Skip'],['wait',1200]]},close,['wait',500],['clear'],['mark','bag'],['wait',400],['ev','(openBag("items"),1)'],['wait',2700]]},
 {name:'skills',steps:[{new:[close,['wait',400],['mark','skills'],['wait',400],['ev','(openBag("skills"),1)'],['wait',3000],['shot','skills']]}]},
 {name:'map',steps:[close,['ev','(()=>{if(typeof MAPX=="undefined"||MAPX.cv)return "cached";const t=performance.now();MAPX.cv=mapPaint();return Math.round(performance.now()-t)+"ms";})()'],['wait',600],['clear'],['mark','map'],['wait',400],['ev','(openBag("map"),1)'],['wait',3400],['shot','map']]},
 {name:'town',steps:[close,calm(12),tp(22,-7),face('E'),slot(0),...settle,['mark','town'],['wait',300],['key','ArrowRight',3900],['wait',300]]},
 {name:'talk',steps:[['wait',400],['clear'],['mark','talk'],['wait',300],['ev','(__game.talk("mae"),1)'],['wait',2600],['shot','talk1'],['click','#talkClose'],['wait',300],['ev','(__game.talk("agnes"),1)'],['wait',2400],['shot','talk2']]},
 {name:'heart',steps:[{new:[['click','#talkClose'],['wait',300],calm(17),tp(1.5,-6.5),face('S'),['wait',1200],['clear'],['mark','heart'],['wait',300],['ev','(hsMusicBoxScene(()=>{window.__hsdone=1}),1)'],['wait',2600],['tap','Space'],['wait',1700],['tap','Space'],['wait',1500],['shot','heart'],['tap','Space'],['wait',600],['tap','Space'],['wait',600],['tap','Space'],['wait',600],['tap','Space'],['wait',600],['tap','Space'],['wait',800],['tap','Space'],['wait',700],['tap','Space'],['wait',700],['tap','Space'],['wait',700],['tap','Space'],['wait',700],['tap','Space'],['wait',700],['tap','Space'],['wait',700],['tap','Space'],['wait',700],['tap','Space'],['wait',700],['tap','Space'],['wait',700],['tap','Space'],['wait',700],['ev','[typeof STG!=="undefined"&&!!STG, window.__hsdone||0, S.mode]']]}]},
 {name:'cabin',steps:[['click','#talkClose'],['wait',300],['ev','(enterRoom("cabin"),1)'],...settle,['mark','cabin'],['wait',300],['key','ArrowUp',1300],['key','ArrowRight',700],['key','ArrowUp',600],['wait',600],['shot','cabin']]},
 {name:'store',steps:[['ev','(leaveRoom(true),1)'],['wait',1300],['ev','(enterRoom("store"),1)'],...settle,['mark','store'],['wait',300],['key','ArrowUp',1500],['key','ArrowLeft',900],['wait',800],['shot','store']]},
 {name:'tavern',steps:[{new:[['ev','(leaveRoom(true),1)'],['wait',1300],['ev','(enterRoom("tavern"),1)'],...settle,['mark','tavern'],['wait',300],['key','ArrowUp',1400],['key','ArrowLeft',900],['wait',700],['shot','tavern']]}]},
 {name:'lake',steps:[{new:[['ev','(leaveRoom(true),1)'],['wait',1300],calm(16),tp(181,30.5),face('E'),...settle,['mark','lake'],['wait',300],['key','ArrowRight',3200],['wait',500],['shot','lake']]}]},
 {name:'wickham',steps:[{new:[tp(124,43),face('E'),...settle,['mark','wickham'],['wait',300],['key','ArrowRight',3000],['wait',500],['shot','wickham']]}]},
 {name:'night',steps:[{old:[['ev','(leaveRoom(true),1)'],['wait',1300]]},calm(21.3),tp(3,-4.5),face('E'),...settle,['mark','night'],['wait',300],['key','ArrowRight',2600],['key','ArrowUp',800],['wait',600],['shot','night']]},
 {name:'scare',steps:[tp(3,-4.5),face('E'),['ev','(S.hour=22.4,1)'],...settle,['mark','scare'],['wait',700],['ev','(jumpScare("lunge"),1)'],['wait',2900],['shot','scare']]},
];
