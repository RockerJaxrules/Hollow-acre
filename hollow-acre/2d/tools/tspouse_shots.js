module.exports=[{name:'x',steps:[['ev','(S.hour=9,S.tut&&(S.tut.off=true),S.readLetter=true,S.foundCabin=true,1)'],['wait',800],
 ['ev','(S.rom.mae=Object.assign(S.rom.mae||{},{dating:1,married:S.day}),1)'],['ev','(newDay(),1)'],['wait',3000],
 ['ev','[S.day,LIFE.mae.home,JSON.stringify(LIFE.mae.day),S.furnBag.join(","),S.rom.mae.movedIn]'],['ev','ui.toast.textContent.slice(0,160)'],
 ['ev','(S.hour=7.6,1)'],['wait',2500],['ev','(()=>{const n=npcById("mae");return [n.loc,n.x.toFixed(1),n.z.toFixed(1),n.target];})()'],
 ['ev','(S.hour=21,1)'],['wait',2500],['ev','(()=>{const n=npcById("mae");return [n.loc,n.homeKey,n.x.toFixed(1),n.z.toFixed(1)];})()'],
 ['ev','(enterRoom("cabin"),1)'],['wait',1600],['shot','sp_home'],['ev','(__game.talk("mae"),1)'],['wait',800],['shot','sp_talk'],['ev','$("talkLine").textContent']]}];
