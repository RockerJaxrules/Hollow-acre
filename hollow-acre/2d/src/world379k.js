/* ================= #379k W6: the ranger's cabin (story plan 6.2: "The ranger's cabin, chapter 6: the logbook; hide, as something walks on
   the roof"). Under the ranger's bed there is room to lie flat. At night, once, something heavy comes down on the roof: hidden under
   the bed you see the slats over you and the light between them, and you see it go along the roof by the dark it makes on them;
   if you aren't hidden, the door opens and it has come down to look. Anchors: room 'rg_ranger', the hide at (8.3, 3.45);
   W79H.threat('rg_ranger', {...}) for the story's own moment (set S.w79h.rgr=S.day first so the night's own doesn't come too). ================= */
if(typeof RG_ROOMS!=='undefined'&&RG_ROOMS.rg_ranger&&ROOMS.rg_ranger){
  const s=W79H.hideSpot('rg_ranger',8.3,3.45,'Hide under the bed','You slide in under the ranger’s bed, flat on the boards, the slats an inch from your face.');s.view='planks';
  setInterval(()=>{try{if(S.room!=='rg_ranger'||S.mode!=='play'||S.paused||W79H.th||!isNight())return;S.w79h=S.w79h||{};if(S.w79h.rgr===S.day)return;
      W79H.rgrT=(W79H.rgrT||0)+1;if(W79H.rgrT<15)return;W79H.rgrT=0;S.w79h.rgr=S.day;
      W79H.threat('rg_ranger',{warn:'Something heavy comes down on the roof, all at once. The stove pipe rings.',inside:'It walks the length of the roof, slowly, right over the bed.',
        pass:'It stands over the stove pipe a long time, breathing down it. Then it goes off the edge, into the trees.',caught:'The door opens. It has come down off the roof to look in, and it is looking at you.'});}catch(e){}},1000);}
