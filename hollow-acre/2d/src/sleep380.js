/* ================= t380 sleep until, in your own bed. The owner: "Choose what time you want to sleep to is another option
   player is actually put into bed visual wise".
   - Going to bed asks when to get up: 6, 7, 8 or 9 in the morning, or noon. A festival or a wedding tomorrow keeps you from
     sleeping past an hour before it starts (the rest of those buttons say why). The day itself is as long as ever; a lie-in
     just spends some of it in bed.
   - You're seen in bed: your head on the pillow and the quilt pulled up, in whichever bed you're sleeping in, for a breath
     before the night and a breath in the morning. Married, your spouse is on the other pillow. On a shared farm a friend
     who's turned in is seen in their bed too, and the farm wakes at the earliest hour anyone asked for (the host's clock).
   - The buttons work by tap, mouse, the pad, and the number keys 1-5.
   ================= */
const ZB={on:false,bed:null,wake:6,go:false,day:-1,t:0,picks:{},own:null,up:0,ask:false};
const ZB_HOURS=[[6,'6 am'],[7,'7 am'],[8,'8 am'],[9,'9 am'],[12,'Noon']];
// the latest you may lie in to, and why: a festival or a wedding tomorrow wants you up an hour before it starts
function zbCap(){let cap=12,why='';const dom=(S.day%28)+1;   // (tomorrow's day of the month)
  try{const f=typeof FESTS!=='undefined'&&FESTS[dom];if(f&&f.from-1<cap){cap=f.from-1;why=`The ${f.name} opens at ${f.from>12?f.from-12+' pm':f.from+' am'} tomorrow.`;}}catch(e){}
  try{for(const r of Object.values(S.rom||{}))if(r&&r.wedding===S.day+1&&!r.married&&cap>8){cap=8;why='Your wedding is at nine tomorrow.';}}catch(e){}
  return {cap,why};}
// your bed: the nearest bed in the room you're in
function zbBedNear(x,z,room){let best=null,bd=3.2;for(const o of OBJ){if(o.hide||!/^in_bed/.test(o.spr||'')||(room!==undefined&&o.room!==room))continue;const d=Math.hypot(o.x-x,(o.z-1.2)-z);if(d<bd){bd=d;best=o;}}return best;}
// ---- the choice
{const _sl=sleep;sleep=function(){if(ZB.go||S.mode!=='play')return _sl.apply(this,arguments);if(ZB.ask&&!$('note').hidden)return;if(ZB.on)return;zbAsk();};}
function zbAsk(){const {cap,why}=zbCap();ZB.ask=true;
  let h=`<h3>Sleep until</h3><p class="sub">When do you want to get up?</p><div class="zbw">`;
  ZB_HOURS.forEach(([hr,lab],i)=>{const no=hr>cap;h+=`<button class="btn zbh${no?' nope':''}" data-h="${hr}"${no?' disabled':''}><b>${i+1}</b> ${lab}</button>`;});
  h+='</div>'+(why?`<p class="zbwhy">${why}</p>`:'');
  openNote(h,'Not yet',()=>{ZB.ask=false;});
  document.querySelectorAll('#noteText .zbh[data-h]').forEach(b=>{if(!b.disabled)b.addEventListener('click',()=>zbChoose(+b.dataset.h),{once:true});});
  const first=document.querySelector('#noteText .zbh:not([disabled])');try{first&&first.focus({preventScroll:true});}catch(e){}}
// the number keys pick an hour while the card is up
addEventListener('keydown',e=>{if(!ZB.ask||$('note').hidden)return;const k=+e.key;if(k>=1&&k<=5){const b=document.querySelector(`#noteText .zbh[data-h="${ZB_HOURS[k-1][0]}"]`);if(b&&!b.disabled){e.preventDefault();b.click();}}});
function zbChoose(hr){ZB.ask=false;$('note').hidden=true;noteCb=null;S.paused=false;
  const bed=zbBedNear(P.x,P.z,S.room);ZB.wake=hr;ZB.own=hr;ZB.day=S.day;ZB.bed=bed;ZB.on=!!bed;ZB.t=0;ZB.up=0;P.walkTo=null;P.anim=null;
  try{if(typeof HOST!=='undefined'&&HOST.role==='guest'&&HOST.joined&&CO.room&&HOST.hostPeer)CO.room.emit('zzw',{h:hr},HOST.hostPeer);}catch(e){}
  SFX.thud&&SFX.thud(0,.15);
  // a breath in bed, then the night
  setTimeout(()=>{ZB.go=true;try{sleep();}finally{ZB.go=false;}},bed?1500:0);}
// the host takes the farm's hour from everyone in bed: the earliest anyone asked for
{const _hw=hostWire;hostWire=function(){const r0=_hw.apply(this,arguments);const r=CO.room;if(!r||!r.on)return r0;
  HOST.off.push(r.on('zzw',m=>{if(!m||m.isMe||HOST.role!=='host'||!m.data)return;const h=+m.data.h;if(ZB_HOURS.some(q=>q[0]===h))ZB.picks[m.peer||m.from||'?']=h;}));return r0;};}
function zbFarmHour(){let h=ZB.own||6;try{if(typeof zzOnline==='function'){const on=zzOnline();for(const [p,v] of Object.entries(ZB.picks))if(p in on)h=Math.min(h,v);}}catch(e){}return h;}
// the morning: the clock moves on to the hour you chose (the host's on a shared farm); you're still in bed for a breath
{const _nd=newDay;newDay=function(){const went=ZB.day===S.day&&ZB.own!=null;const capTomorrow=zbCap().cap;const r=_nd.apply(this,arguments);
  try{if(went&&!(typeof HOST!=='undefined'&&HOST.role==='guest')){const h=Math.min(zbFarmHour(),capTomorrow);if(h>S.hour){S.hour=h;S.dusk=false;S.bellRung=false;}}
    ZB.picks={};ZB.own=null;if(ZB.on){ZB.up=1;ZB.t=0;}}catch(e){}return r;};}
// getting up: in the morning after a breath, or from the shared farm's "Get up", or if you walk off
{const _u=update;update=function(dt){_u(dt);if(!ZB.on)return;ZB.t+=dt;
  try{if(ZB.day!==S.day&&!ZB.up){ZB.up=1;ZB.t=0;}
    if(ZB.up&&ZB.t>1.3)zbOff();
    else if(!ZB.up&&!ZB.go&&typeof ZZ!=='undefined'&&!ZZ.me&&ZB.t>2.2&&S.mode==='play')zbOff();   // (got up again on a shared farm, or the night didn't happen)
    if(S.room!==(ZB.bed&&ZB.bed.room))zbOff();}catch(e){zbOff();}};}
function zbOff(){const b=ZB.bed;ZB.on=false;ZB.up=0;if(b&&S.room===b.room){P.x=b.x+1.15;P.z=b.z-.9;try{collide(P,.3);}catch(e){}P.dir='S';}}
// lying in bed: no walking about, no swinging tools
{const _mi=mindInput;mindInput=function(mx,mz){const r=_mi(mx,mz);return ZB.on?[0,0]:r;};}
{const _sa=startAnim;startAnim=function(){if(ZB.on)return;return _sa.apply(this,arguments);};}
// ---- drawing someone in bed: their head on a pillow (cropped from their own standing sprite, so it's their own face, hair
// and hat), then the bed's quilt drawn again over their chin and shoulders, and the shape of them under it
const ZB_PIL=[.32,.68],ZB_PY=20,ZB_FOLD=31;
// (a bed with one long pillow, the farmhands' plain beds and the cots: alone, you sleep in the middle of it)
const ZB_ONEPIL=/^(in_bedplain|in_childbed|in_ironcot)/;
function zbHeadAt(o,side,draw,alone){const m=SPR[o.spr];if(!m)return;const bx=Math.round(sx(o.x)-m.ax),by=Math.round(sz(o.z)-m.ay);const px=bx+Math.round(m.fw*(alone&&ZB_ONEPIL.test(o.spr)?.5:ZB_PIL[side])),py=by+ZB_PY;
  // the head (frame rows 13..37 of the 48x64 standing frame) with its middle on the pillow
  const X=px,Y=py+60-25;ctx2.save();ctx2.beginPath();ctx2.rect(X-13,Y-60+12,26,by+ZB_FOLD+2-(Y-60+12));ctx2.clip();draw(X,Y);ctx2.restore();}
function zbCover(o,n){const m=SPR[o.spr];if(!m)return;const X=sx(o.x),Y=sz(o.z),bx=Math.round(X-m.ax),by=Math.round(Y-m.ay);
  ctx2.save();ctx2.beginPath();ctx2.rect(bx,by+ZB_FOLD,m.fw,m.fh-ZB_FOLD);ctx2.clip();drawSpr(o.spr,X,Y,null,null,0,{flip:o.flip});if(o.night&&SPR[o.night]&&nightK>0)drawSpr(o.night,X,Y,null,null,0,{alpha:nightK,flip:o.flip});ctx2.restore();
  // the shape under the quilt: a lit ridge along the shoulder and down the leg, the quilt's shadow beside it (no hard outline)
  for(const side of n){const cx=bx+Math.round(m.fw*(side===.5?.5:ZB_PIL[side]));ctx2.fillStyle='rgba(255,236,196,.16)';ctx2.fillRect(cx-7,by+ZB_FOLD+2,13,2);ctx2.fillRect(cx-6,by+ZB_FOLD+4,2,18);
    ctx2.fillStyle='rgba(20,10,8,.22)';ctx2.fillRect(cx+6,by+ZB_FOLD+3,2,20);ctx2.fillRect(cx-5,by+ZB_FOLD+23,12,2);}}
function zbDrawBed(o,who){const sides=[];for(const w of who){zbHeadAt(o,w.side,w.draw,who.length===1);sides.push(w.side);}zbCover(o,who.length===1&&ZB_ONEPIL.test(o.spr)?[.5]:sides);}
// the people in each bed this frame: you, your spouse beside you, and friends on a shared farm who have turned in
function zbSleepers(){const beds=new Map();const put=(o,side,draw)=>{if(!o)return;let L=beds.get(o);if(!L)beds.set(o,L=[]);if(L.some(q=>q.side===side))side=1-side;if(L.some(q=>q.side===side))return;L.push({side,draw});};
  // (the standing idle's fourth frame is its blink: the same face with the eyes shut. Asleep, eyes shut; waking, open)
  const fr=ZB.up&&ZB.t>.5?0:3;
  if(ZB.on&&ZB.bed&&!ZB.bed.hide&&S.room===ZB.bed.room){put(ZB.bed,0,(X,Y)=>drawSpr('farmer',X,Y,'idle','S',fr));
    const sid=typeof spId==='function'?spId():null;if(sid&&(S.room==='cabin'||S.room==='cabin_up')&&SPR[sid])put(ZB.bed,1,(X,Y)=>drawSpr(sid,X,Y,'idle','S',3));}
  return beds;}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld.apply(this,arguments);try{const beds=zbSleepers();if(!beds.size&&!ZBP.list.length)return;
    if(ZB.on){const i=D.findIndex(d=>d.player);if(i>=0)D.splice(i,1);const sid=typeof spId==='function'?spId():null;if(sid){const j=D.findIndex(d=>d.npc&&d.npc.def&&d.npc.def.id===sid);if(j>=0)D.splice(j,1);}}
    for(const [o,who] of beds){const L=who.concat(ZBP.list.filter(q=>q.o===o).map(q=>({side:who.some(w=>w.side===0)?1:0,draw:q.draw})));D.push({z:o.z+.0005,mind:1,draw(){zbDrawBed(o,L);}});}
    for(const q of ZBP.list){if(beds.has(q.o))continue;D.push({z:q.o.z+.0005,mind:1,draw(){zbDrawBed(q.o,[{side:0,draw:q.draw}]);}});}
    ZBP.list=[];}catch(e){console.warn('zb draw',e);}};}
// a friend who has turned in (the shared farm's list of who's asleep) and stands by a bed in your room is drawn in it
const ZBP={list:[]};
{const _dp=drawPeer;drawPeer=function(x,z,look,dir,clip,t,label){try{const asleep=typeof ZZ!=='undefined'&&ZZ.names&&Array.isArray(ZZ.names.asleep)&&ZZ.names.asleep.includes(label);
    // (drawPeer takes world metres; a pillow is a screen spot, so the friend's head is drawn through the world point that lands there)
    if(asleep&&S.room){const o=zbBedNear(x,z,S.room);if(o){ZBP.list.push({o,draw:(X,Y)=>_dp((X+cam.px-(VW>>1))/PPM,(Y+cam.pz-Math.round(VH*.56))/PPM,look,'S','idle',t,'',null,1,null,-1)});return;}}}catch(e){}return _dp.apply(this,arguments);};}
// the card's look
{const css=document.createElement('style');css.textContent=`#noteText .zbw{display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:8px;margin:10px 0 6px}
#noteText .zbh{min-height:44px;font-size:15px}#noteText .zbh b{font-weight:normal;opacity:.6;margin-right:4px;font-size:12px}#noteText .zbh.nope{opacity:.45}
#noteText .zbwhy{font-size:13px;color:#7a3a1c;margin:4px 0 0}`;document.head.appendChild(css);}
if(typeof window!=='undefined')window.__zb={ZB,zbAsk,zbChoose,zbCap,zbBedNear,zbOff};
