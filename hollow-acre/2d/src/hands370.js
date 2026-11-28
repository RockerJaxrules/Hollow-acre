// ================================================================ t370 (owner: "go back to the original original hands and just tilt them like I originally
// requested, make them tilt with the objects, they looked better"): every hand in the making games is the original hand again, the
// fist (M4S.hand) and the flat hand (M4S.palm) in your own skin and cuff, with no arm and no forearm, only turned with what it holds.
// The fist's handle runs level across it; it turns by the handle's own tilt, the nearer way round, so it never goes upside down.
window.HANDS_ORIG=true;
{const wrap=a=>a-Math.PI*Math.round(a/Math.PI);
 m4arm=function(){};
 m4grip=function(K,x,y,ang,o){o=o||{};(M4G.fr||(M4G.fr=[])).push([x,y]);M4G.arm=null;M4G.kind='';const g=K.g;
   if(o.kind==='palm'){const dir=Math.cos(ang)>0?'l':'r',base=dir==='l'?0:Math.PI;M4.rot(g,M4S.palm(dir),x+(dir==='l'?2:-2),y,wrap(ang-base),13,8);return;}
   M4.rot(g,M4S.hand((o.side||1)<0?'l':'r'),x,y,wrap(ang),11,9);};}
