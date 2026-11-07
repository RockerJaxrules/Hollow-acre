/* ================= every house in town is its own room now: its own walls and floor (parquet, flagstone, checkered lino,
   painted boards, hex tile, rough wide boards; damask, panelling, plaster, logs), a mat inside the front door, and a door on the
   back wall to the rest of the house. The back doors are locked. Each one has something behind it. ================= */
const HOME_BACKDOOR={
  agnes:'Locked. On the other side a music box winds down, and somebody winds it up again.',
  hale:'The study. Locked. A chair scrapes back, as if someone stood up to listen.',
  dunn:'Locked. Something has been nailed over it from the inside. You can see the nail points.',
  cora:'The children’s room. The door is warm, like a cheek.',
  june:'Locked. Behind it, a typewriter clatters. June is standing right behind you. She was always behind you.',
  otto:'Locked. It smells of brine through the keyhole, and of something sweeter than brine.',
  silas:'The workroom. The handle has been polished by a great many hands. You leave it alone.',
  quill:'The pantry. When you touch the handle, every jar inside chinks against its neighbour.',
  fenn:'The millstone room. You can hear it turning, slowly. The mill outside is still.',
  thorne:'Locked. From this side. Why from this side.',
  ashby:'Locked. A child’s drawing has been pushed under it: your car, upside down, in the creek.',
  vale:'The sewing room. There are pins in the keyhole, pointing out.',
  kerrigan:'Locked. The handle is wet, and it is not raining.',
  pike:'A cold draught comes under it, smelling of the pond, and of the pond’s bottom.',
  ward:'The schoolroom store. There is chalk dust on the handle in the shape of small fingers.'};
for(const k in HOME_BACKDOOR){const id='home_'+k,sh='room_'+id,R=ROOMS[id],m=SPR[sh];if(!R||!m)continue;R.shell=sh;
  for(const d of (m.room&&m.room.doors)||[])interact.push({x:R.ox+d[0],z:R.oz+.55,r:.95,on:inRoom(id),label:()=>'Door',ok:()=>true,
    act(){SFX.thud&&SFX.thud(0,.2);toast(HOME_BACKDOOR[k],3,true);}});}
