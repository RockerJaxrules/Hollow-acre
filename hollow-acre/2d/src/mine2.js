/* ================= checkpoints in the mine. Every fifth floor (5, 10, 15...) has an old lift cage hanging on its rope by the
   way in. The first time you reach one, it's yours: from then on the mine asks where you want to start, the top or any lift
   you've found, and from a lift floor you can ride straight back up. ================= */
S.mineCk=S.mineCk||[];
function mineCheckpoints(){const r=[];for(let f=5;f<=(S.mineDeep||0);f+=5)r.push(f);return r;}
function mineGo(f){enterRoom('mine');setTimeout(()=>mineFloor(f),400);}
function mineEnter(){const cks=mineCheckpoints();if(!cks.length){mineGo(1);return;}
  openNote('<h3>The old Marrow mine</h3><p>The lift cage creaks on its rope. Where do you want to start?</p><p style="text-align:center">'+
    [1,...cks].map(f=>`<button class="btn mineGo" data-f="${f}" style="margin:3px 4px">${f===1?'The top':'Floor '+f}</button>`).join('')+'</p>','Not now',()=>{});
  document.querySelectorAll('#noteText .mineGo').forEach(b=>b.addEventListener('click',()=>{$('note').hidden=true;noteCb=null;S.paused=false;mineGo(+b.dataset.f);},{once:true}));}
// the lift cage on every fifth floor
{const _mf=mineFloor;mineFloor=function(f){_mf.apply(this,arguments);const R=ROOMS.mine;
  if(!MINE.lift){MINE.lift=obj('mine_lift',R.ox+1.5,R.oz+1.6,{kind:'prop',room:'mine',hide:true});
    interact.push({x:R.ox+1.3,z:R.oz+1.9,r:1.2,on:()=>S.room==='mine'&&MINE.lift&&!MINE.lift.hide,label:()=>'Ride up',ok:()=>true,
      act(){SFX.thud&&SFX.thud(0,.3);toast('The cage lurches, and the dark goes down past you.',2);leaveRoom(true);}});}
  const ck=f%5===0;MINE.lift.hide=!ck;if(!ck)return;
  // keep the way to the cage clear
  for(const o of MINE.ores){if(!o.hide&&Math.hypot(o.x-MINE.lift.x,o.z-MINE.lift.z)<1.3){o.hide=true;if(o.col){const k=circles.indexOf(o.col);if(k>=0)circles.splice(k,1);}}}
  if(MINE.ladderAt&&MINE.ladderAt.hide)MINE.ladderAt=MINE.ores.find(o=>!o.hide)||null;
  if(!S.mineCk.includes(f)){S.mineCk.push(f);setTimeout(()=>toast(`An old lift cage hangs on its rope here. From now on you can start from floor ${f}, and ride up from it.`,3.6),2600);}};}
