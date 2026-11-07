/* ================= the car after Hollis's parts go in: the same car, beaten but running (primer hood, rust, a taped windshield). It waits
   on the shoulder by the oak where you crashed; after the road brings you back, it sits dead by the HOLLOW ACRE sign, where it stopped. ================= */
const BEATEN={o:null,at:null};
const CAR_SPOTS={crash:{x:carPos.x+4.6,z:-2.7},sign:{x:farmSignPos.x+3.4,z:-3.9}};
function carShow(){if(S.mode==='cine')return;const wreck=OBJ.filter(o=>o.kind==='wreck'&&o.spr&&o.spr.startsWith('car_wreck'));
  if(!S.carFixed){for(const o of wreck)o.hide=false;if(BEATEN.o)BEATEN.o.hide=true;return;}
  for(const o of wreck)o.hide=true;const spot=S.looped?'sign':'crash';
  if(!BEATEN.o){BEATEN.o=obj('car_beaten',0,0,{kind:'prop',flip:true,noCol:true});}
  if(BEATEN.at!==spot){const p=CAR_SPOTS[spot];BEATEN.o.x=p.x;BEATEN.o.z=p.z;BEATEN.at=spot;if(!BEATEN['col_'+spot]){BEATEN['col_'+spot]=1;addRect(p.x-2.2,p.z-1.1,p.x+2.2,p.z-.1);}}
  BEATEN.o.hide=false;}
setInterval(carShow,400);
// the car's own interaction follows it to the farm sign once it has died there
{const it=interact.find(q=>Math.abs(q.x-(carPos.x-.8))<.01&&Math.abs(q.z-(carPos.z+3.4))<.01);
  if(it){const _on=it.on;it.on=()=>(!_on||_on())&&!S.looped;
    interact.push({x:CAR_SPOTS.sign.x,z:CAR_SPOTS.sign.z+.6,r:2.2,on:()=>S.looped&&!S.room,label:()=>'Car',ok:()=>true,act(){toast(S.bound?'It still won’t start. You find you don’t mind.':'The engine won’t turn over. The fuel gauge reads full. On the dash, in the dust, someone has written STAY.',3.4,!S.bound);}});}}
