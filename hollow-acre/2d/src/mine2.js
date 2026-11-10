/* ================= checkpoints in the mine. (Owner, Nov 10: "once you get any level you should be able to select it so you don't
   have to go through every level each time".) Every floor you have reached is a checkpoint: the old lift cage hangs on its rope on
   every floor below the top, so at the mine's mouth you pick any floor you've been to (or jump straight to the deepest), and from
   any floor you can ride straight back up. ================= */
S.mineCk=S.mineCk||[];
function mineCheckpoints(){const r=[];for(let f=2;f<=(S.mineDeep||0);f++)r.push(f);return r;}
function mineGo(f){enterRoom('mine');setTimeout(()=>mineFloor(f),400);}
{const css=document.createElement('style');css.textContent=`#noteText .mineGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(46px,1fr));gap:6px;max-height:min(40vh,260px);overflow:auto;margin:10px 0 4px;padding:2px}
#noteText .mineGrid .btn{margin:0;min-width:0;padding:9px 0;font-variant-numeric:tabular-nums}
#noteText .mineTop{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}`;document.head.appendChild(css);}
function mineEnter(){const deep=S.mineDeep||0;if(deep<2){mineGo(1);return;}
  const fl=mineCheckpoints();
  openNote('<h3>The old Marrow mine</h3><p>The lift cage creaks on its rope. Where do you want to start? Any floor you have reached, it can take you to.</p>'+
    '<div class="mineTop"><button class="btn mineGo" data-f="1">The top</button><button class="btn mineGo" data-f="'+deep+'">Deepest: floor '+deep+'</button></div>'+
    '<div class="mineGrid">'+fl.map(f=>`<button class="btn mineGo" data-f="${f}" aria-label="Floor ${f}">${f}</button>`).join('')+'</div>','Not now',()=>{});
  document.querySelectorAll('#noteText .mineGo').forEach(b=>b.addEventListener('click',()=>{$('note').hidden=true;noteCb=null;S.paused=false;mineGo(+b.dataset.f);},{once:true}));}
// the lift cage on every floor below the top
{const _mf=mineFloor;mineFloor=function(f){_mf.apply(this,arguments);const R=ROOMS.mine;
  if(!MINE.lift){MINE.lift=obj('mine_lift',R.ox+8.4,R.oz+1.6,{kind:'prop',room:'mine',hide:true});   /* off the cart track (r13) */
    interact.push({x:R.ox+8.2,z:R.oz+1.9,r:1.2,on:()=>S.room==='mine'&&MINE.lift&&!MINE.lift.hide,label:()=>'Ride up',ok:()=>true,
      act(){SFX.thud&&SFX.thud(0,.3);toast('The cage lurches, and the dark goes down past you.',2);leaveRoom(true);}});}
  const ck=f>1;MINE.lift.hide=!ck;if(!ck)return;
  // keep the way to the cage clear
  for(const o of MINE.ores){if(!o.hide&&Math.hypot(o.x-MINE.lift.x,o.z-MINE.lift.z)<1.3){o.hide=true;if(o.col){const k=circles.indexOf(o.col);if(k>=0)circles.splice(k,1);}}}
  if(MINE.ladderAt&&MINE.ladderAt.hide)MINE.ladderAt=MINE.ores.find(o=>!o.hide)||null;
  if(!S.mineCk.includes(f))S.mineCk.push(f);
  if(!S.mineCkTold){S.mineCkTold=1;setTimeout(()=>toast('An old lift cage hangs on its rope here, and on every floor below. Next time you can start from any floor you have reached, and ride up from any of them.',4.2),2600);}};}
