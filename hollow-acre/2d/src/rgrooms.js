/* ================= inside, out in the new land: the Pine Rest's office and Room 6 (your key fits), Greyfield's dormitory, the
   peat cutter's hut, the ranger's cabin, and the cab at the top of the fire lookout. Each has things to look at, and each tells
   a little more. ================= */
const RG_ROOMS={
 rg_office:{name:'The Pine Rest office',out:()=>({x:RGP.motel.x-2.8,z:RGP.motel.z+.7}),door:()=>({x:RGP.motel.x-2.8,z:RGP.motel.z+.35}),
  furn:[BF('in_ctr_motel',2.3,2.5,.5),BF('in_chair',2.3,1.3,.25),['in_keyboard_m',5.4,-.45,null,'flat'],BF('in_archboxes',6.95,.8,.4),['in_photowall',4.0,-.45,null,'flat'],['in_calendar',3.1,-.45,null,'flat'],BF('in_clock',.6,.55,.3),['in_rugrect',4.2,4.3,null,'flat'],BF('in_mapspinner',.7,4.1,.3),BF('in_plant',7.3,4.7,.3),BF('in_chair',7.4,3.1,.25)],
  looks:[[2.2,1.8,'The register again. Leafing back past your own line, past forty years of strangers, you find Grandpa: <i>Elias Marsh, 1952, Room 6. Purpose of visit: bringing her home.</i> Her. The page after it has been torn out.'],
   [5.4,1.2,'Seven hooks, six keys. The paint round the Room 6 hook is worn through to the wood, as if somebody takes that key down every night and puts it back every morning.'],
   [4.0,.6,'Polaroids of every guest, all taken in the same doorway: Room 6. The flash has caught something in the room behind each of them, further back, in the dark. It is a little taller in every photograph.']]},
 rg_room6:{name:'Room 6',out:()=>({x:RGP.motel.x+3.33,z:RGP.motel.z+.7}),door:()=>({x:RGP.motel.x+3.33,z:RGP.motel.z+.35}),
  gate:()=>stHas('room6')?null:'Locked. Room 6’s key is missing from the board in the office.',enterMsg:'Your key fits. Of course it does.',
  furn:[['in_mattress',1.2,2.6,BED_F],BF('in_motelstand',2.5,1.05,.25),BF('in_phonetable',2.55,3.4,.25),['in_mirror',6.75,-.45,null,'flat'],BF('in_dresser',5.6,1.0,.45),['in_rugmotel',3.7,3.4,null,'flat'],BF('in_chair',6.3,3.8,.25)],
  looks:[[1.4,3.2,'The bed has been stripped to the ticking. The stain in the middle has been scrubbed so often the stripes have worn away round it. Where the pillow should be, there is a child’s milk tooth.'],
   [5.6,1.6,'Sixty years of letters, slipped under the door one a week, stacked on the dresser by someone tidy. None opened. The one on top is in your handwriting. It says: <i>Don’t sleep here.</i>'],
   [6.75,.6,'Your reflection does everything a moment after you do. When you stop moving, it doesn’t. Not quite.']]},
 rg_dorm:{name:'Greyfield dormitory',out:()=>({x:RGP.home.x,z:RGP.home.z+.9}),door:()=>({x:RGP.home.x,z:RGP.home.z+.4}),
  furn:[BF('in_ironcot',1.0,3.0,2.1),BF('in_ironcotdoll',2.6,3.0,2.1),BF('in_ironcot',4.2,3.0,2.1),BF('in_ironcot',9.8,3.0,2.1),BF('in_ironcot',11.4,3.0,2.1),BF('in_ironcot',13.0,3.0,2.1),BF('in_ironcot',1.0,7.0,2.1),BF('in_ironcot',2.6,7.0,2.1),BF('in_ironcotbare',4.2,7.0,2.1),BF('in_ironcot',9.8,7.0,2.1),BF('in_ironcot',11.4,7.0,2.1),BF('in_ironcot',13.0,7.0,2.1),BF('in_rockhorse',8.5,6.5,.3),
   ['in_blackboard',7,-.95,null,'flat'],['in_kidpegs',7.0,-.2,null,'flat'],BF('in_cradle',7,4.6,.3)],
  looks:[[12.8,3.2,'Every pillow has a number stitched on it. The matron’s chart on the wall goes up to ninety-one. This one, on the end, says 92, and its covers are turned down, as if somebody is expected tonight.'],
   [7,.5,'The matron’s last countdown is still on the blackboard: DAYS LEFT, and a row of tally marks, rubbed out and redone so many times the slate has worn pale. Under it, in chalk, at the height of a small child: <i>I CAME BACK</i>.'],
   [7,5.2,'An iron cradle, in a home for children old enough to walk. It is rocking, very slightly. It goes on rocking after you look away.']]},
 rg_hut:{name:'The peat cutter’s hut',out:()=>({x:RGP.hut.x-.25,z:RGP.hut.z+.7}),door:()=>({x:RGP.hut.x-.25,z:RGP.hut.z+.35}),
  furn:[BF('in_stove',.9,.95,.5),['in_bedplain',5.0,2.6,BED_F],['in_fenpegs',3.0,-.45,null,'flat'],BF('in_table',2.0,3.8,.45),BF('in_chair',3.1,3.85,.25),BF('in_peatstack',5.0,4.55,.35),BF('in_creel',.8,4.45,.3)],
  looks:[[3,1.2,'Jars of fen water on the shelf, each labelled with a year. In every one something floats: a hair ribbon, a button, a baby’s shoe. The cutter kept one thing from every child the fen gave back.'],
   [2,4.3,'The cutter’s diary, open at 1931: <i>Cut a girl out of the bank today, by the hut. Twelve or so. Fresh as if she was put there this morning, but her dress was 1872. Put her back. It’s what you do.</i>']]},
 rg_ranger:{name:'The ranger’s cabin',out:()=>({x:RGP.ranger.x,z:RGP.ranger.z+.7}),door:()=>({x:RGP.ranger.x,z:RGP.ranger.z+.35}),
  furn:[BF('in_radioshelf',1.95,1.0,.45),BF('in_chairN',1.95,1.6,.2),['in_firedanger',3.4,-.6,null,'flat'],['firewood',3.4,1.1,[-.6,-.3,.6,0]],BF('in_stove',4.95,.95,.5),['in_gunpegs',6.6,-.45,null,'flat'],BF('in_ironcot',8.3,2.75,2.1),BF('in_filecab',.6,.85,.4),BF('in_bootbench',6.3,5.75,.3)],
  looks:[[3.4,.5,'The fire-danger dial has been wired at the red end. Pencilled round its rim, a date for every light reported on Tithe night since 1923, and beside every date the same field. There is no room left to write.'],
   [1.95,1.6,'A two-way radio, still on, still hissing. Every few minutes a child’s voice comes through and reads out a number. It is counting down. It has got to nine.'],
   [.6,1.5,'Missing-hiker reports. Everyone who went up the lookout path and wasn’t found. The last line of each is the same: <i>Tracks led up. None down.</i>']]},
 rg_lookout:{name:'The lookout cab',out:()=>({x:RGP.tower.x,z:RGP.tower.z+1.4}),door:()=>({x:RGP.tower.x,z:RGP.tower.z+.9}),label:'Climb',
  furn:[BF('in_firefinder',3,2.6,.5),BF('in_stool',3.9,3.1,.2),BF('in_radioshelf',1.0,1.0,.45),BF('in_campcot',5.3,3.0,2.1),BF('in_tincrate',.65,3.8,.3),BF('in_satchel',.75,4.6,.2),['bucket',1.6,4.5,[-.3,-.2,.3,0]]],
  looks:[[3,2.1,'The fire finder’s sight has been bolted in place, pointing one way. Through it, at the hub of the wheel: your cabin. There is a light on in your window. You didn’t leave a light on.']]}};
{let ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;
  for(const [k,r] of Object.entries(RG_ROOMS)){if(!SPR['room_'+k])continue;ROOMS[k]={ox,oz:-60,name:r.name,shell:'room_'+k,out:r.out(),furn:r.furn};r.key=k;ox+=30;}}
{const _bw=buildWorld;buildWorld=function(){_bw();
  for(const [k,r] of Object.entries(RG_ROOMS)){if(!ROOMS[k])continue;const R=ROOMS[k];R.out=r.out();const d=r.door();
    interact.push({x:d.x,z:d.z,r:1,on:()=>!S.room,label:()=>r.label||'Door',ok:()=>true,act(){const no=r.gate&&r.gate();if(no){SFX.deny&&SFX.deny();toast(no,3);return;}
      if(r.enterMsg&&!S.first['room_'+k])setTimeout(()=>toast(r.enterMsg,2.4),500);enterRoom(k);}});
    for(const L of r.looks)interact.push({x:R.ox+L[0],z:R.oz+L[1],r:1.1,on:()=>S.room===k,label:()=>'Look',ok:()=>true,act(){SFX.page&&SFX.page();
      const key='rgroom:'+k+':'+L[0];S.rgLook=S.rgLook||{};if(!S.rgLook[key]){S.rgLook[key]=1;addLore(L[2].replace(/<[^>]+>/g,''));if(typeof mindHit==='function')mindHit(2);}toast(L[2],5.5,true);}});}};}
