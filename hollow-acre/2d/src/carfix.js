/* ================= the car after Hollis's parts go in: the same car, beaten but running (primer hood, rust, a taped windshield). It waits
   on the shoulder by the oak where you crashed; after the road brings you back, it sits dead by the HOLLOW ACRE sign, where it stopped. ================= */
const BEATEN={o:null,at:null};
const CAR_SPOTS={crash:{x:carPos.x+4.6,z:-2.7},sign:{x:farmSignPos.x+3.4,z:-3.9}};
function carShow(){if(S.mode==='cine')return;const wreck=OBJ.filter(o=>o.kind==='wreck'&&o.spr&&o.spr.startsWith('car_wreck'));
  if(!S.carFixed){for(const o of wreck)o.hide=false;if(BEATEN.o)BEATEN.o.hide=true;return;}
  for(const o of wreck)o.hide=true;const spot=S.looped?'sign':'crash';
  if(!BEATEN.o){BEATEN.o=obj('car_beaten',0,0,{kind:'prop',flip:true,noCol:true});}
  if(BEATEN.at!==spot){const p=CAR_SPOTS[spot];BEATEN.o.x=p.x;BEATEN.o.z=p.z;BEATEN.at=spot;
    // the car's ground footprint, measured from the sprite: 2.3 m either side of its middle, 1.05 m behind to 0.6 m in front
    if(BEATEN.rect){const i=rects.indexOf(BEATEN.rect);if(i>=0)rects.splice(i,1);}addRect(p.x-2.3,p.z-1.05,p.x+2.3,p.z+.6);BEATEN.rect=rects[rects.length-1];}
  BEATEN.o.hide=false;}
// the wreck's own wall comes down once the car is fixed and driven out of the oak (the dead oak keeps its trunk)
let WRECK_RECT=null;   // found once the world has been built
{const _cs=carShow;carShow=function(){_cs();if(!WRECK_RECT)WRECK_RECT=rects.find(r=>Math.abs(r.x0-(carPos.x-1.8))<1e-6&&Math.abs(r.z0-(carPos.z-1.2))<1e-6&&Math.abs(r.x1-(carPos.x+1.2))<1e-6&&Math.abs(r.z1-(carPos.z+3.1))<1e-6)||null;
  if(!WRECK_RECT)return;const i=rects.indexOf(WRECK_RECT);if(S.carFixed&&i>=0)rects.splice(i,1);else if(!S.carFixed&&i<0)rects.push(WRECK_RECT);};}
setInterval(carShow,400);
// the car's own interaction follows it to the farm sign once it has died there
{const it=interact.find(q=>Math.abs(q.x-(carPos.x-.8))<.01&&Math.abs(q.z-(carPos.z+3.4))<.01);
  if(it){const _on=it.on;it.on=()=>(!_on||_on())&&!S.looped;
    // "Drive away" is on the car, wherever it's parked, not on the wreck it used to be
    const wx=it.x,wz=it.z;Object.defineProperties(it,{x:{get(){return S.carFixed&&!S.looped?CAR_SPOTS.crash.x:wx;},set(){} },z:{get(){return S.carFixed&&!S.looped?CAR_SPOTS.crash.z+.2:wz;},set(){}}});
    interact.push({x:CAR_SPOTS.sign.x,z:CAR_SPOTS.sign.z+.6,r:2.2,on:()=>S.looped&&!S.room,label:()=>'Car',ok:()=>true,act(){toast(S.bound?'It still won’t start. You find you don’t mind.':'The engine won’t turn over. The fuel gauge reads full. On the dash, in the dust, someone has written STAY.',3.4,!S.bound);}});}}
