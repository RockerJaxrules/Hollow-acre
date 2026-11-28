/* ================= #379m W6: the old mill and its race (story plan 6.2: "The old mill race, chapter 3, optional: the sack-scale room
   behind the wheel; secret cellar: the race tunnel; escape: the wheel starts by itself and floods the race. The share was weighed
   here"). The mill's door opens now:
   - the sack-scale room: the platform scale the share was weighed on, flour and feed sacks, the year's bills on the wall, and a
     hatch in the boards where the race runs under the floor;
   - the race tunnel under it: a stone channel, tallies scratched along the wall at the height of a sack on a man's shoulder. A little
     while after you go down, the wheel overhead starts to turn by itself and the race floods. Get to the sluice gate at the far end
     and climb out onto the bank before the water reaches the roof, or it fills the tunnel and spits you back up through the hatch.
   Anchors: room 'w79_mill' (the mill's own door), its Look at the scale (4.0, 2.4); room 'w79_race' (from the hatch), the Look at the
   tallies (2.6, 0.6), the way out at the sluice (7.3, 0.9) onto the bank. W79M.flood() starts the water at once. ================= */
const W79M={};
{let ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;
  if(SPR.room_priv_feed&&SPR.room_cellar_dunn){
    ROOMS.w79_mill={ox,oz:-60,name:'The old mill',shell:'room_priv_feed',out:{x:32,z:100.1},furn:[
      BF('in_platscale',4.0,1.9,.4),BF('f_scale',1.2,1.0,.35),BF('in_floursack',5.7,.95,.3),BF('in_floursack',6.3,1.1,.3),BF('in_feedsack',.8,4.2,.3),BF('in_floursack',1.4,4.5,.3),
      BF('sacks',6.6,4.3,.35),['in_millbills',3.0,-.45,null,'flat'],['in_trapdoor',5.6,3.6,null,'flat']]};ox+=40;
    ROOMS.w79_race={ox,oz:-60,name:'The mill race',shell:'room_cellar_dunn',from:'w79_mill',out:{x:0,z:0},furn:[BF('wheel',7.4,2.0,.3)]};}}
// the mill's door, where the building draws it
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{if(ROOMS.w79_mill)interact.push({x:32,z:99.35,r:.9,on:()=>!S.room,label:()=>'Go in',ok:()=>true,act(){enterRoom('w79_mill');}});}catch(e){}return r;};}
if(ROOMS.w79_mill){
  interact.push({get x(){return ROOMS.w79_mill.ox+4.0;},get z(){return ROOMS.w79_mill.oz+2.4;},r:1,on:()=>S.room==='w79_mill',label:()=>'Look',ok:()=>true,act(){SFX.page&&SFX.page();
    toast('The platform scale the share was weighed on. Its brass weights are set out on the beam, smallest to largest, and the smallest is about what a newborn weighs. The pan is worn bright.',5.4,true);w79Fear(3,'look');}});
  interact.push({get x(){return ROOMS.w79_mill.ox+5.6;},get z(){return ROOMS.w79_mill.oz+3.4;},r:.85,on:()=>S.room==='w79_mill',label:()=>'Go down',ok:()=>true,act(){
    const R=ROOMS.w79_race,M=ROOMS.w79_mill;R.from='w79_mill';R.out={x:M.ox+5.6,z:M.oz+3.0};SFX.thud&&SFX.thud(0,.3);enterRoom('w79_race');}});
  interact.push({get x(){return ROOMS.w79_race.ox+2.6;},get z(){return ROOMS.w79_race.oz+.7;},r:1,on:()=>S.room==='w79_race',label:()=>'Look',ok:()=>true,act(){SFX.page&&SFX.page();
    toast('Tallies scratched along the stone at the height of a sack on a man’s shoulder: five, and five, and five, a mark for every share weighed and carried out this way. They go back into the dark further than you can see.',5.6,true);}});
  W79H.escape('w79_race',7.3,.9,'Climb out by the sluice',()=>({x:34.6,z:100.05}),'You haul yourself up through the sluice gate onto the bank, soaked to the chest. Behind you the wheel turns on, for nobody.');}
// ---- the flood: a little while after you go down, the wheel turns and the water rises; it is over when you climb out, or when it fills
W79M.flood=function(){if(S.room!=='w79_race'||W79M.on)return;W79M.on=true;W79M.t=0;SFX.thud&&SFX.thud(0,.5);toast('Overhead, the wheel starts to turn. Nobody is at the sluice. Water comes into the race, fast.',3.6,true);};
{const _u=update;update=function(dt){_u(dt);try{if(S.room!=='w79_race'){W79M.on=false;W79M.wait=0;return;}if(S.mode!=='play'||S.paused)return;
  if(!W79M.on){W79M.wait=(W79M.wait||0)+dt;if(W79M.wait>7)W79M.flood();return;}
  W79M.t+=dt;w79Rate('chase',2,true);if(typeof cam!=='undefined')cam.shake=Math.max(cam.shake||0,.05);
  if(Math.floor(W79M.t*.9)!==Math.floor((W79M.t-dt)*.9))SFX.thud&&SFX.thud(0,.14);   /* the wheel's beat overhead */
  if(W79M.t>=16){W79M.on=false;W79M.wait=-30;w79Fear(10,'caught');SFX.stinger&&SFX.stinger();toast('The race fills to the roof. The water takes you back along the tunnel and throws you up through the hatch, coughing, onto the mill floor.',4.4,true);P.fz=1;leaveRoom(true);}}catch(e){}};}
// the water, drawn over the room: a dark rising body with a lit, moving surface line
{const _do=depthOver;depthOver=function(t){const r=_do.apply(this,arguments);try{if(S.room==='w79_race'&&W79M.on){const R=ROOMS.w79_race,m=SPR[R.shell];if(!m)return r;
  const X=Math.round(sx(R.ox))-(m.side||0),Y=Math.round(sz(R.oz))-(m.top||0),W=m.fw,H=m.fh,u=Math.min(1,W79M.t/16),h=Math.round(H*.12+H*.86*u),y=Y+H-h;
  ctx2.fillStyle='rgba(18,30,36,.62)';ctx2.fillRect(X,y,W,h);ctx2.fillStyle='rgba(30,52,60,.5)';ctx2.fillRect(X,y,W,3);
  for(let x=0;x<W;x+=6){const k=Math.sin(x*.21+t*4)*1.5;ctx2.fillStyle='rgba(150,180,190,.45)';ctx2.fillRect(X+x,Math.round(y+k),4,1);}}}catch(e){}return r;};}
