/* ================= two places that were copies of others get their own look.
   Wickham Crossing, the river village, stops being Marrow Hollow again: its houses are painted its own way (whitewash, grey
   shingle, barn red, tarred timber under teal, moss, rust and pantile roofs), its chapel is dark timber under a copper roof, the
   well in the square is the drowned bell, lanterns hang from crooked posts, boardwalks run along the street, and the riverbank
   is busy with drying racks of fish, nets, upturned boats, eel traps and rope; there's a fish stall on the square.
   The two gas stations stop being the same garage: Pruitt's keeps its garage but gets a concrete forecourt with the pump on its
   island, tyres and drums; out by the Black Lake, Lusk's is a filling station now, with a canopy over two old pumps and a price
   sign, and Corwin waits under it. ================= */
const WK_PAINT={house_a:'wk_house_a',house_b:'wk_house_b',house_c:'wk_house_c',house_d:'wk_house_d',church:'wk_chapel'};
// Lusk's is a filling station: its door is the kiosk's, Corwin's spot is in front of the pumps
if(SPR.fuel){NEWHOUSES.lusk.spr='fuel';const dx=(SPR.fuel.door_dx||0)/PPM;
  if(typeof HOMES!=='undefined'&&HOMES.lusk){const old=HOMES.lusk.door.slice();HOMES.lusk.door=[NEWHOUSES.lusk.x+dx,NEWHOUSES.lusk.z+.35];
    const it=interact.find(i=>Math.abs(i.x-old[0])<.01&&Math.abs(i.z-old[1])<.01);if(it){it.x=HOMES.lusk.door[0];it.z=HOMES.lusk.door[1];}}
  if(typeof ROOMS!=='undefined'&&ROOMS.home_lusk)ROOMS.home_lusk.out={x:NEWHOUSES.lusk.x+dx,z:NEWHOUSES.lusk.z+.7};
  if(typeof PL!=='undefined'&&PL.pump)PL.pump=[NEWHOUSES.lusk.x-2.2,NEWHOUSES.lusk.z+1.4,.8];}
{const _bw=buildWorld;buildWorld=function(){_bw();
  const flat=(spr,x,z)=>SPR[spr]&&obj(spr,x,z,{kind:'flat'});
  const gone=(spr,x,z)=>{for(const o of OBJ)if(o.spr===spr&&Math.abs(o.x-x)<.6&&Math.abs(o.z-z)<.6){o.hide=true;}for(let j=circles.length-1;j>=0;j--)if(Math.abs(circles[j].x-x)<.9&&Math.abs(circles[j].z-z)<.6)circles.splice(j,1);};
  // ---------- Wickham
  if(SPR.wk_house_a){
    for(const o of OBJ){if(o.kind!=='bld'||!inWick(o.x,o.z))continue;const v=WK_PAINT[o.spr];if(!v||!SPR[v])continue;o.spr=v;o.night=SPR[v+'_n']?v+'_n':o.night;}
    // the drowned bell in place of the well
    const w=OBJ.find(o=>o.spr==='well'&&Math.abs(o.x-WK.sq[0])<.5&&Math.abs(o.z-(WK.sq[1]+.9))<.5);if(w&&SPR.wk_bell){w.spr='wk_bell';w.night='wk_bell_n';}
    // lanterns on crooked posts instead of the valley's lamp posts
    for(const l of lamps)if(inWick(l.x,l.z)&&SPR.wk_lamp){l.e.spr='wk_lamp';l.e.night='wk_lamp_n';}
    // boardwalks along the street, both rows
    for(let x=98.5;x<126;x+=3)flat('wk_walk',x,44.2);for(let x=135.5;x<158;x+=3)flat('wk_walk',x,44.2);for(let x=101.5;x<157;x+=3)flat('wk_walk',x,57.25);
    // a fish stall on the square
    put('wk_stall',121.6,49.6,.6);
    // the riverbank: racks of fish, nets, boats, traps, rope
    put('wk_nets',133.8,61,.3);put('wk_rack',137.6,63.2,.3);put('wk_rack',131.4,65.6,.3);
    put('wk_boat',129.6,68,.6);put('wk_boat',125.2,69.8,.6);
    put('wk_trap',134,64.8,.25);put('wk_trap',127.8,66.6,.25);put('wk_trap',123.4,68.6,.25);
    put('wk_rope',127.4,67.6,0);put('wk_rope',136.6,61.6,0);put('barrel',123.8,67.2,.3);put('crate',122.6,67.6,.3);}
  // ---------- Pruitt's garage: a forecourt, the pump on its island, tyres and oil drums
  if(SPR.forecourt){
    // the pump comes in off the road edge, onto the forecourt beside the garage (its honour box and the quest marker with it)
    const P0={x:pumpPos.x,z:pumpPos.z},nx=-30.4,nz=-9.35;const pe=OBJ.find(o=>o.spr==='gas_pump'&&Math.abs(o.x-P0.x)<.3&&Math.abs(o.z-(P0.z+1.6))<.3);
    if(pe){pe.x=nx;pe.z=nz;for(let j=circles.length-1;j>=0;j--)if(Math.abs(circles[j].z-P0.z)<.05&&Math.abs(Math.abs(circles[j].x-P0.x)-.4)<.05)circles.splice(j,1);addCircle(nx-.35,nz-.25,.3);addCircle(nx+.35,nz-.25,.3);
      const it=interact.find(i=>Math.abs(i.x-P0.x)<.01&&Math.abs(i.z-(P0.z+.6))<.01);if(it){it.x=nx;it.z=nz+.55;}pumpPos.x=nx;pumpPos.z=nz-1.6;}
    flat('forecourt',-33,-9.6);flat('pump_isle',nx,nz-.05);
    put('tyres',-40.8,-9.7,.35);put('drum',-39.9,-9.5,.25);put('drum',-39.3,-9.8,.25);put('tyres',-29.2,-10.4,.35);}
  // ---------- Lusk's: the loose pump goes (the station has its own), a forecourt, tyres and a drum
  if(SPR.fuel){gone('gas_pump',196,-7.6);
    for(const l of lamps)if(Math.abs(l.x-200)<.2&&Math.abs(l.z+8.4)<.2){const c=circles.find(q=>Math.abs(q.x-l.x)<.01&&Math.abs(q.z-l.z)<.01);l.x=l.e.x=207.2;l.z=l.e.z=-8;if(c){c.x=l.x;c.z=l.z;}}   // the lamp off the forecourt
flat('forecourt',198.6,-8.2);put('tyres',205.6,-9.3,.35);put('drum',194.4,-9.2,.25);}};}
// the filling station has no porch of pumpkins
{const _b=building;building=function(spr,cx,front,o){if(spr==='fuel')o=Object.assign({},o||{},{porch:false});return _b.call(this,spr,cx,front,o);};}
