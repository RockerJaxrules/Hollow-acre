/* ================= inside, out in the new land: the Pine Rest's office and Room 6 (your key fits), Greyfield's dormitory, the
   peat cutter's hut, the ranger's cabin, and the cab at the top of the fire lookout. Each has things to look at, and each tells
   a little more. ================= */
const RG_ROOMS={
 rg_office:{name:'The Pine Rest office',out:()=>({x:RGP.motel.x-2.8,z:RGP.motel.z+.7}),door:()=>({x:RGP.motel.x-2.8,z:RGP.motel.z+.35}),
  furn:[BF('in_desk',2.2,1.1,.45),BF('in_shelf_mail',5.4,.62,.4),BF('in_filecab',7.3,.85,.4),['in_photowall',4.0,-.45,null,'flat'],BF('in_clock',.6,.55,.3),['in_rug',4,4.2,null,'flat'],BF('in_chair',2.2,2.1,.25)],
  looks:[[2.2,1.8,'The register again. Leafing back past your own line, past forty years of strangers, you find Grandpa: <i>Elias Marsh, 1952, Room 6. Purpose of visit: bringing her home.</i> Her. The page after it has been torn out.'],
   [5.4,1.2,'Seven hooks, six keys. The paint round the Room 6 hook is worn through to the wood, as if somebody takes that key down every night and puts it back every morning.'],
   [4.0,.6,'Polaroids of every guest, all taken in the same doorway: Room 6. The flash has caught something in the room behind each of them, further back, in the dark. It is a little taller in every photograph.']]},
 rg_room6:{name:'Room 6',out:()=>({x:RGP.motel.x+3.33,z:RGP.motel.z+.7}),door:()=>({x:RGP.motel.x+3.33,z:RGP.motel.z+.35}),
  gate:()=>stHas('room6')?null:'Locked. Room 6’s key is missing from the board in the office.',enterMsg:'Your key fits. Of course it does.',
  furn:[['in_bed',1.2,2.6,BED_F],['in_mirror',3.5,-.45,null,'flat'],BF('in_desk',5.6,1.0,.45),['in_rug',3.5,3.7,null,'flat'],BF('in_candles',5.9,2.8,.3)],
  looks:[[1.4,3.2,'The bed is made with hospital corners. On the pillow, where the mint should be, there is a child’s milk tooth.'],
   [5.6,1.6,'Sixty years of letters, slipped under the door one a week, stacked on the desk by someone tidy. None opened. The one on top is in your handwriting. It says: <i>Don’t sleep here.</i>'],
   [3.5,.6,'Your reflection does everything a moment after you do. When you stop moving, it doesn’t. Not quite.']]},
 rg_dorm:{name:'Greyfield dormitory',out:()=>({x:RGP.home.x,z:RGP.home.z+.9}),door:()=>({x:RGP.home.x,z:RGP.home.z+.4}),
  furn:[['in_bed',1.2,2.6,BED_F],['in_bed',3.6,2.6,BED_F],['in_bed',10.4,2.6,BED_F],['in_bed',12.8,2.6,BED_F],['in_bed',1.2,6.6,BED_F],['in_bed',3.6,6.6,BED_F],['in_bed',10.4,6.6,BED_F],['in_bed',12.8,6.6,BED_F],
   ['in_blackboard',7,-.95,null,'flat'],BF('in_schooldesk',6.1,1.4,.3),BF('in_schooldesk',7.9,1.4,.3),BF('in_cradle',7,4.6,.3)],
  looks:[[12.8,3.2,'Every pillow has a number stitched on it. The matron’s chart on the wall goes up to ninety-one. This one, on the end, says 92, and its covers are turned down, as if somebody is expected tonight.'],
   [7,.5,'The matron’s last countdown is still on the blackboard: DAYS LEFT, and a row of tally marks, rubbed out and redone so many times the slate has worn pale. Under it, in chalk, at the height of a small child: <i>I CAME BACK</i>.'],
   [7,5.2,'An iron cradle, in a home for children old enough to walk. It is rocking, very slightly. It goes on rocking after you look away.']]},
 rg_hut:{name:'The peat cutter’s hut',out:()=>({x:RGP.hut.x-.25,z:RGP.hut.z+.7}),door:()=>({x:RGP.hut.x-.25,z:RGP.hut.z+.35}),
  furn:[BF('in_stove',.9,.95,.5),['in_bed',5.0,2.6,BED_F],BF('in_shelf_jars',3.0,.62,.4),BF('in_table',2.0,3.8,.45),BF('in_chair',3.1,3.85,.25)],
  looks:[[3,1.2,'Jars of fen water on the shelf, each labelled with a year. In every one something floats: a hair ribbon, a button, a baby’s shoe. The cutter kept one thing from every child the fen gave back.'],
   [2,4.3,'The cutter’s diary, open at 1931: <i>Cut a girl out of the bank today, by the hut. Twelve or so. Fresh as if she was put there this morning, but her dress was 1872. Put her back. It’s what you do.</i>']]},
 rg_ranger:{name:'The ranger’s cabin',out:()=>({x:RGP.ranger.x,z:RGP.ranger.z+.7}),door:()=>({x:RGP.ranger.x,z:RGP.ranger.z+.35}),
  furn:[BF('in_desk',2.0,1.0,.45),['in_mapboard',4.0,-.9,null,'flat'],['in_bed',7.1,2.5,BED_F],BF('in_stove',5.6,.95,.5),BF('in_filecab',.6,.85,.4),BF('in_chair',2.0,1.9,.25)],
  looks:[[4,.5,'The rangers’ map of the valley, with a pin for every light reported on Tithe night since 1923. Every pin is in the same field. There are so many that the field is solid red.'],
   [2,1.6,'A two-way radio, still on, still hissing. Every few minutes a child’s voice comes through and reads out a number. It is counting down. It has got to nine.'],
   [.6,1.5,'Missing-hiker reports. Everyone who went up the lookout path and wasn’t found. The last line of each is the same: <i>Tracks led up. None down.</i>']]},
 rg_lookout:{name:'The lookout cab',out:()=>({x:RGP.tower.x,z:RGP.tower.z+1.4}),door:()=>({x:RGP.tower.x,z:RGP.tower.z+.9}),label:'Climb',
  furn:[BF('in_desk',3,1.4,.45),BF('in_chair',3,2.3,.25)],
  looks:[[3,2.1,'The fire finder’s sight has been bolted in place, pointing one way. Through it, at the hub of the wheel: your cabin. There is a light on in your window. You didn’t leave a light on.']]}};
{let ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;
  for(const [k,r] of Object.entries(RG_ROOMS)){if(!SPR['room_'+k])continue;ROOMS[k]={ox,oz:-60,name:r.name,shell:'room_'+k,out:r.out(),furn:r.furn};r.key=k;ox+=30;}}
{const _bw=buildWorld;buildWorld=function(){_bw();
  for(const [k,r] of Object.entries(RG_ROOMS)){if(!ROOMS[k])continue;const R=ROOMS[k];R.out=r.out();const d=r.door();
    interact.push({x:d.x,z:d.z,r:1,on:()=>!S.room,label:()=>r.label||'Door',ok:()=>true,act(){const no=r.gate&&r.gate();if(no){SFX.deny&&SFX.deny();toast(no,3);return;}
      if(r.enterMsg&&!S.first['room_'+k])setTimeout(()=>toast(r.enterMsg,2.4),500);enterRoom(k);}});
    for(const L of r.looks)interact.push({x:R.ox+L[0],z:R.oz+L[1],r:1.1,on:()=>S.room===k,label:()=>'Look',ok:()=>true,act(){SFX.page&&SFX.page();
      const key='rgroom:'+k+':'+L[0];S.rgLook=S.rgLook||{};if(!S.rgLook[key]){S.rgLook[key]=1;addLore(L[2].replace(/<[^>]+>/g,''));if(typeof mindHit==='function')mindHit(2);}toast(L[2],5.5,true);}});}};}
