/* ================= the valley grows back. Every tree can be felled; two days after you cut it, a tree stands there again (its stump
   gone). Weeds, rocks, twigs and stumps you cleared come back after two days too, except on soil you've tilled or planted. ================= */
const REGROW_DAYS=2;
const objKey=o=>o.x.toFixed(2)+','+o.z.toFixed(2);
const colOff=o=>{if(o.col){const k=circles.indexOf(o.col);if(k>=0)circles.splice(k,1);}};
const colOn=o=>{if(o.col&&!circles.includes(o.col))circles.push(o.col);};
const tileOf=o=>tiles.find(t=>t.debris===o)||null;
function regenPass(){let trees=0,ground=0;const busy=(o)=>Math.hypot(P.x-o.x,P.z-o.z)<1.6;
  for(const o of OBJ){
    if(o.choppable&&o.hide){if(o.goneDay==null){o.goneDay=S.day-1;continue;}
      if(S.day-o.goneDay>=REGROW_DAYS&&!busy(o)){o.hide=false;o.hits=0;o.notch=0;o.goneDay=null;colOn(o);if(o.stump){o.stump.hide=true;colOff(o.stump);o.stump=null;}trees++;}}
    else if(o.debris&&o.hide&&!o.stumpOf){if(o.goneDay==null){o.goneDay=S.day-1;continue;}
      if(S.day-o.goneDay<REGROW_DAYS||busy(o))continue;const t=tileOf(o);if(t&&(t.tilled||t.crop)){o.goneDay=S.day;continue;}
      o.hide=false;o.hits=0;o.goneDay=null;colOn(o);ground++;}}
  return {trees,ground};}
{const _nd=newDay;newDay=function(msg,pos){const r=_nd.apply(this,arguments);if(!(typeof HOST!=='undefined'&&HOST.role==='guest'))regenPass();return r;};}
// a tree felled on someone else's screen falls on yours too (co-op)
function fellRemote(k){const o=OBJ.find(q=>q.choppable&&!q.hide&&objKey(q)===k);if(!o)return;o.hide=true;o.goneDay=S.day;colOff(o);
  const sk=(typeof makeStump==='function'&&makeStump(o.spr))||'stump_maple';const st=obj(sk,o.x,o.z,{kind:'prop',debris:'stump',stumpOf:o});o.stump=st;
  st.col={x:o.x,z:o.z-.1,r:Math.max(.3,((SPR[sk]&&SPR[sk].foot&&SPR[sk].foot[2])||.4)*.85)};circles.push(st.col);
  interact.push({x:o.x,z:o.z+.2,r:.85,on:()=>!st.hide,label:()=>'Chop',ok:()=>true,act(){if(P.anim)return;if(!spend(axeCost()))return;faceTo(st.x,st.z);
    startAnim('axe',.55,null,()=>{st.hits=(st.hits||0)+1;SFX.thud(0,.4);if(st.hits<(S.tools.axe>1?1:2))return;st.hide=true;st.goneDay=S.day;colOff(st);addInv('wood',3);toast('The stump comes out. +3 wood.',1.4);});}});}
function onTreeFelled(o){if(typeof HOST!=='undefined'&&HOST.role&&CO.room&&CO.room.emit)CO.room.emit('tree',{k:objKey(o)});}
