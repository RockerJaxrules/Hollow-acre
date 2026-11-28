/* ================= #379n W6: Old Marrow's chapel and the founders' crypt (story plan 6.2: "Old Marrow chapel, chapter 3: the Covenant;
   secret cellar: the founders' crypt under the altar (nine coffins, the Marsh one empty); optional explore"). The burnt town's stone
   chapel can be gone into now: what is left of its pews, the altar, the cross, candles nobody lit; under the altar a slab that lifts.
   Below, the founders lie in a row of nine, each under a brass plate. The ninth lid is off and the coffin is empty, and its plate says
   MARSH. No one is shown hurt; nothing here belongs to a child.
   Anchors: room 'w79_chapel' (the chapel's own door), the slab "Go down" at (5.0, 2.6); room 'w79_crypt9', the Marsh coffin's Look
   at (6.4, 4.25), the row's Look at (3.6, 2.6). ================= */
{let ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;
  if(SPR.room_church&&SPR.room_undercroft){
    ROOMS.w79_chapel={ox,oz:-60,name:'The Old Marrow chapel',shell:'room_church',out:{x:0,z:0},furn:[
      ['in_crossbig',5,-0.45,null,'flat'],BF('in_altar',5,1.7,.6),BF('in_candles',2.6,1.1,.25),BF('in_votive',7.4,1.15,.3),
      BF('in_pew_bk',2.4,4.2,.45),BF('in_pewb_bk',7.6,5.4,.45),['in_trapdoor',5.0,2.75,null,'flat']]};ox+=40;
    const C=(spr,x,z)=>BF(spr,x,z,1.9);
    ROOMS.w79_crypt9={ox,oz:-60,name:'The founders’ crypt',shell:'room_undercroft',from:'w79_chapel',out:{x:0,z:0},furn:[
      C('in_coffin',1.0,1.6),C('in_coffin',2.5,1.6),C('in_coffin',4.0,1.6),C('in_coffin',5.5,1.6),C('in_coffin',7.0,1.6),C('in_coffin',1.75,3.6),C('in_coffin',3.25,3.6),C('in_coffin',4.75,3.6),
      C('in_coffinajar',6.4,3.75),['in_niches',4.0,-.45,null,'flat'],BF('in_candles',2.2,4.3,.3),BF('in_candles',6.0,4.3,.3)]};}}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{if(ROOMS.w79_chapel&&typeof RGP!=='undefined'){const C=RGP.chapel;ROOMS.w79_chapel.out={x:C.x,z:C.z+.75};
    interact.push({x:C.x,z:C.z+.35,r:.95,on:()=>!S.room,label:()=>'Go in',ok:()=>true,act(){ROOMS.w79_chapel.out={x:C.x,z:C.z+.75};enterRoom('w79_chapel');}});}}catch(e){}return r;};}
if(ROOMS.w79_chapel){
  interact.push({get x(){return ROOMS.w79_chapel.ox+5.0;},get z(){return ROOMS.w79_chapel.oz+2.6;},r:.9,on:()=>S.room==='w79_chapel',label:()=>'Go down',ok:()=>true,act(){
    const K=ROOMS.w79_crypt9,Ch=ROOMS.w79_chapel;K.from='w79_chapel';K.out={x:Ch.ox+5.0,z:Ch.oz+3.2};SFX.thud&&SFX.thud(0,.35);toast('The slab in front of the altar lifts on an iron ring. Steps go down.',2.6);enterRoom('w79_crypt9');}});
  interact.push({get x(){return ROOMS.w79_crypt9.ox+3.6;},get z(){return ROOMS.w79_crypt9.oz+2.55;},r:1.1,on:()=>S.room==='w79_crypt9',label:()=>'Look',ok:()=>true,act(){SFX.page&&SFX.page();
    toast('The founders, in a row, each under a brass plate gone green: ABERNATHY. HALE. COYLE. DUNN. PRUITT. QUILL. FENN. CRANE. The names of the town, the first of each.',5.4,true);w79Fear(3,'look');}});
  interact.push({get x(){return ROOMS.w79_crypt9.ox+6.4;},get z(){return ROOMS.w79_crypt9.oz+4.25;},r:.95,on:()=>S.room==='w79_crypt9',label:()=>'Look',ok:()=>true,act(){SFX.page&&SFX.page();
    toast('The ninth coffin’s lid leans against the wall. The coffin is empty and lined new, the cloth not yet faded. Its plate says MARSH. Under the name, where the year should be, the brass has been left smooth.',6,true);w79Fear(5,'look');}});}
