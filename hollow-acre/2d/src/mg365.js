/* ================= t365: the making games that still had long arms, each re-staged as its own picture. A first-person forearm is
   only short when the hand is low in the frame, so every one of these now does its work in the lower part of the picture and your
   hands come up a short way from the bottom corners: the camera closer on the part being worked (the pan on the stove top, the
   car's fender, the battery's posts, the wheel on its hub), the work laid lower and seen a little more from above (the cloth on the
   table, the pastry on the board), or the tool held so the hand stays near you (the spade's handle coming up toward you, the match
   and the tongs held from below, the bellows lying with their handles toward you, the dowel the candles hang from held out from
   the side). Gameplay, input, gauges, labels, sounds and the auto-player are the games' own; this only moves the work and adds
   the close surfaces it sits on. ================= */
const M65={dy:{}};
// how far each game's work sits lower in the picture (the room behind stays put); the trace and drop games work theirs out per piece
Object.assign(M4DY,{crack:50,fillet:46,scoop:50,cork:70,dip:33,roll:70,bellows:0,flail:46,dig:4,light:22,quench:35,f2carve:44,crDents:58,crSeal:40,crBattery:0,crCables:0,crHang:64,crLugs:40});
for(const k of ['trace','drop','brush'])Object.defineProperty(M4DY,k,{get(){return M65.dy[k]||0;},set(v){M65.dy[k]=v;},enumerable:true,configurable:true});
// a close surface drawn under a game's work, in the work's own coordinates (it moves down with it)
function m65Under(k,paint){const f=S4[k];if(typeof f!=='function')return;S4[k]=function(sp,K){const o=f.apply(this,arguments);if(o&&o.draw){const d=o.draw;o.draw=function(t){paint(K,t,sp);return d.apply(this,arguments);};}return o;};}
// ---- the stove top seen close: black iron plates edge to edge, each lid with its lifter notch, the rail along the front, the fire's
// glow at the seams. The room behind is the kitchen without its stove: we're standing at the stove
m65Under('crack',(K,t,sp)=>{if(sp&&sp.scene!=='kitchen')sp.scene='kitchen';const g=K.g,I=CA_P.iron;g.drawImage(M4.pre('m65stovetop2',320,84,k=>{
    for(let y=0;y<84;y++)for(let x=0;x<320;x++){let v=y<2?4.6:y<5?1.2:2.2-(y-5)/90-(x/320)*.4;if(y>=72)v=y===72?5.4:3.2-(y-72)*.2;k.px(x,y,1,1,I[M4.cl(Math.round(v),0,7)]);}
    for(let x=0;x<320;x++){k.px(x,5,1,1,I[0]);k.px(x,71,1,1,'#08080a');}                                                    // the back lip's shadow, the front rail's underside
    for(const [cx,r] of [[56,34],[150,40],[262,34]]){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const e=(x/r)**2+(y/(r*.34))**2;if(e>1.08)continue;const Y=40+y,X=cx+x;if(Y<7||Y>69)continue;
        k.px(X,Y,1,1,e>.92?(x+y<0?I[0]:I[3]):(e>.8?I[1]:I[x+y<-r*.4?2:1]));}
      for(let y=-1;y<=1;y++)k.px(cx-5,40+y,10,1,I[y===-1?0:y===0?0:3]);}                                                    // each lid with its lifter notch
    for(const sx of [104,206])for(let y=7;y<71;y++)k.px(sx,y,1,1,I[0]);},true),0,58);
  const f=.5+Math.sin(t*7)*.2;for(const sx of [104,206])K.pa(sx,66+(t*13%40),1,10,'#ff9a3a',.2*f);K.glow(150,100,46,'255,140,60',.12+f*.05);});
// ---- the counter top the fillet board lies on, close: oak planks lit along their front edge
m65Under('fillet',K=>{K.g.drawImage(M4.pre('m65counter',320,96,k=>{k.planks(0,4,320,92,CA_P.oak,13,9,true);k.px(0,0,320,4,CA_P.oak[2]);k.px(0,0,320,1,CA_P.oak[5]);k.px(0,4,320,1,'#08080a');},true),0,86);});
// ---- the trace games: the line to follow laid low on the work, seen a little more from above (the cloth's pattern foreshortened),
// and the work lowered until your hand, below the tool's point, is in the bottom part of the picture
{const _tr=S4.trace;S4.trace=(sp,K)=>{try{const J=typeof BT3!=='undefined'&&BT3.JOB&&BT3.JOB[sp.surface];
    const P=J?J.paths.map(p=>p.map(([x,y])=>[x+J.at[0],y+J.at[1]])):sp.paths,tool=sp.tool||'shears';
    const off=tool==='knife'?[28,31]:tool==='putty'?[15,17]:[13,31];let y0=1e9,y1=-1e9;for(const p of P)for(const q of p){y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);}
    const cloth=!J&&!/pumpkin|glass/.test(sp.surface||''),ROOM=62;
    if(cloth&&(y1+off[1])-(y0+off[0])>ROOM){const s=(ROOM-(off[1]-off[0]))/(y1-y0);sp=Object.assign({},sp,{paths:sp.paths.map(p=>p.map(([x,y])=>[x,Math.round((y0+(y-y0)*s)*2)/2]))});}
    M65.dy.trace=M4.cl(Math.round(120-(y0+off[0])),0,95);}catch(e){M65.dy.trace=45;}return _tr(sp,K);};}
// ---- setting a piece in place: held just over its spot, the work lowered by the piece, so your hands are low whatever you lay
{const _dr=S4.drop;S4.drop=(sp,K)=>{const o=_dr(sp,K);try{M65.dy.drop=M4.cl(Math.round(120-(o.hold||70)),0,80);}catch(e){M65.dy.drop=20;}return o;};}
// ---- the dents: the camera close on the fender's lower half, so every dent (and the hammer hand beside it) is low in the picture
{const _cd=S4.crDents;S4.crDents=(sp,K)=>_cd(Object.assign({},sp,{dents:(sp.dents||[[70,52,15],[124,104,17],[160,54,13],[236,56,14],[96,128,11],[272,104,12]]).map(([x,y,r])=>[x,Math.round(64+(y-52)*.6),r])}),K);}
// ---- the ground close round the hole: trodden earth ringed by grass, lit from the top left
m65Under('dig',K=>{K.g.drawImage(M4.pre('m65ground',320,116,k=>{const G=['#1e2a14','#2c3a1c','#3a4a24','#4c5e2e','#62743a'],E=['#2a1c0e','#3e2a16','#52381e','#6a4a28'];
    for(let y=0;y<116;y++)for(let x=0;x<320;x++){const e=((x-150)/118)**2+((y-50)/44)**2;const n=k.H32(x>>2,y>>1,7);let c;
      if(e<1-n*.18)c=E[e>.8?1:n>.75?3:2];else c=G[y<4?4:n>.82?3:n>.4?2:1];k.px(x,y,1,1,c);}
    for(let i=0;i<90;i++){const x=Math.floor(k.H32(i,1,9)*320),y=4+Math.floor(k.H32(i,2,9)*108);const e=((x-150)/118)**2+((y-50)/44)**2;if(e<1.1)continue;
      for(let j=0;j<4;j++){k.px(x-1+j%2*2,y-j,1,1,G[j<2?3:4]);}}},true),0,66);});
// ---- the Watch demo's own pointing hand (drawn only when the game shows no hand of its own) points low too
for(const k of ['crack','fillet','scoop','cork','dip','roll','bellows','flail','dig','light','quench','f2carve','brush','trace','drop','crDents','crSeal','crBattery','crCables','crHang','crLugs']){const f=S4[k];if(typeof f!=='function')continue;S4[k]=function(sp,K){const o=f.apply(this,arguments);if(o&&o.auto){const au=o.auto;o.auto=function(dt,AP){const r=au.apply(this,arguments);try{if(AP.hand){const dy=M4DY[k]||0;if(AP.hand[1]+dy<122)AP.hand=[AP.hand[0],122-dy];}}catch(e){}return r;};}return o;};}
// ---- the finish: a wax cake is held flat on the canvas (the hand right on the work), so the waxed canvas sits lower than a brushed board
{const _br=S4.brush;S4.brush=(sp,K)=>{M65.dy.brush=sp.look==='wax'?48:35;return _br(sp,K);};}
