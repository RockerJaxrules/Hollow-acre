/* ================= #379d you see the room you are in, and nothing of the rooms you can't get into (owner: "for rooms system like stardew
   valley you can see the room but only if the door is accessible to you if it's not than you just see the door and wall").
   Every room lives in its own pocket of the world, side by side. On a wide screen, standing near a room's side wall, the next pocket
   showed in the dark at the edge of the screen: somebody's bedroom shelves, a cabinet from the store's back room, whoever was in there.
   Now everything outside the room you are standing in is dark: you see your room, its walls and its doors, and a door you can't
   open stays a door in the wall until you can. ================= */
const W79D={};
function w79dMask(){const R=S.room&&ROOMS[S.room];if(!R||S.room==='mine'||!R.w)return;const m=SPR[R.shell||('room_'+S.room)];if(!m||!m.fw)return;
  const X=Math.round(sx(R.ox))-(m.side||0),Y=Math.round(sz(R.oz))-(m.top||0),W=m.fw,H=m.fh;ctx2.fillStyle='#000';
  if(Y>0)ctx2.fillRect(0,0,VW,Y);if(Y+H<VH)ctx2.fillRect(0,Y+H,VW,VH-Y-H);if(X>0)ctx2.fillRect(0,Math.max(0,Y),X,Math.min(VH,Y+H)-Math.max(0,Y));if(X+W<VW)ctx2.fillRect(X+W,Math.max(0,Y),VW-X-W,Math.min(VH,Y+H)-Math.max(0,Y));}
{const _do=depthOver;depthOver=function(t){const r=_do.apply(this,arguments);try{w79dMask();}catch(e){}return r;};}
