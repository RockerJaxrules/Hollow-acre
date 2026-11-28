/* ================= #379l W6: inside the cold house (story plan 6.2: "The cold house, chapter 6: what's on the hooks; hide, behind the
   carcasses, as Hob counts the hooks"). The cold house by the Black Lake has its door open; now you can go in: the cellar under the
   turf, stone walls sweating with cold, a row of hook racks down its length with what hangs on them (the gore setting's own art for
   the hooks: Toned or Full, as outside). Hide between the carcasses: Hob comes down the steps counting the hooks under his breath,
   walks the row touching each one, stops at the one in front of you, and goes. If you aren't hidden, you become one of his numbers.
   Anchors: room 'w79_coldin' (its door is the cold house's open doorway), the hide at (5.0, 1.75); W79H.threat('w79_coldin', {...})
   (set S.w79h.coldin=1 first to stop the first visit's own). Nothing of a child's is here. ================= */
const W79L={};
{let ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;const hk=()=>typeof goreToned==='function'&&goreToned()?'g_hooks_t':'g_hooks';
  if(SPR.room_cellar_hale&&SPR.g_hooks)ROOMS.w79_coldin={ox,oz:-60,name:'The cold house',shell:'room_cellar_hale',out:{x:0,z:0},furn:[
    [hk(),1.6,1.15,[-.9,-.3,.9,0]],[hk(),3.3,1.15,[-.9,-.3,.9,0]],[hk(),5.0,1.15,[-.9,-.3,.9,0]],[hk(),6.7,1.15,[-.9,-.3,.9,0]],
    BF('barrel',.7,4.1,.3),BF('barrel',7.3,4.2,.3)]};}
// the hooks follow the gore setting while you are in there, as the rack outside does
setInterval(()=>{try{if(S.room!=='w79_coldin')return;const w=typeof goreToned==='function'&&goreToned()?'g_hooks_t':'g_hooks';for(const o of OBJ)if(o.room==='w79_coldin'&&/^g_hooks(_t)?$/.test(o.spr)&&o.spr!==w)o.spr=w;}catch(e){}},1000);
// the way in is the open doorway of the cold house you can see (379e)
setInterval(()=>{try{if(W79L.door||typeof W79E==='undefined'||!W79E.o||!ROOMS.w79_coldin)return;const o=W79E.o;W79L.door=1;ROOMS.w79_coldin.out={x:o.x,z:o.z+.7};
  interact.push({x:o.x,z:o.z+.3,r:.95,on:()=>!S.room,label:()=>'Go in',ok:()=>true,act(){ROOMS.w79_coldin.out={x:o.x,z:o.z+.7};SFX.thud&&SFX.thud(0,.25);enterRoom('w79_coldin');}});}catch(e){}},1200);
if(ROOMS.w79_coldin){
  W79H.hideSpot('w79_coldin',5.0,1.75,'Hide between the carcasses','You stand in among the hanging things, very still. They are cold against your face and they turn, a little, when you breathe.');
  // the first time you are in here, a little while after, Hob comes down to count
  setInterval(()=>{try{if(S.room!=='w79_coldin'||S.mode!=='play'||S.paused||W79H.th)return;S.w79h=S.w79h||{};if(S.w79h.coldin)return;W79L.t=(W79L.t||0)+1;if(W79L.t<14)return;S.w79h.coldin=1;
    W79H.threat('w79_coldin',{secs:6,warn:'Someone is coming down the steps, counting under his breath.',inside:'Hob walks the row of hooks, touching each one as he counts. He stops at the one in front of you.',
      pass:'“Eleven,” he says, satisfied, and goes back up the steps. He doesn’t shut the door.',caught:'Hob sees you between the carcasses. He doesn’t shout. He just keeps counting, and you are one of the numbers.'});}catch(e){}},1000);}
