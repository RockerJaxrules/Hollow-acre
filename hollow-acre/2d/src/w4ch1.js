/* ================= W4 part two, Chapter One shown, not told (story plan, chapter 1): the night you drive in, the Pine Rest's
   sign says VACANCY (its NO is dark until you've tried to leave); Coyle's corkboard of MISSING posters, one for every autumn,
   and what Caitlyn says about it; Agnes's open door with Ruth's room past it, kept as it was; and your first night, when the
   town's lit windows go out one at a time and something walks all the way round the cabin. The pictures are in w4art.js. ===== */
const w4S=()=>{if(!S.w4||typeof S.w4!=='object')S.w4={};return S.w4;};
const w4Fear=(n,why)=>{try{if(typeof fearAdd==='function')return fearAdd(n,why);if(typeof mindHit==='function')mindHit(Math.max(1,Math.round(n/2)));}catch(e){}};

// ---- the Pine Rest's sign: VACANCY on the night you come in. Its night picture with the NO left dark, made once from the real one.
function w4SignVar(){if(SPR.rg_motelsign_v)return true;const m=SPR.rg_motelsign_n,im=m&&IMG[m.src];if(!im||!(im.naturalWidth||im.width))return false;
  const c=document.createElement('canvas');c.width=m.fw;c.height=m.fh;const g=c.getContext('2d');g.drawImage(im,0,0,m.fw,m.fh,0,0,m.fw,m.fh);
  const d=g.getImageData(0,0,c.width,c.height),a=d.data;let n=0;
  for(let y=60;y<=70&&y<c.height;y++)for(let x=17;x<=27&&x<c.width;x++){const i=(y*c.width+x)*4;if(a[i+3]>0&&a[i]>150&&a[i+1]<110){a[i]=62;a[i+1]=24;a[i+2]=30;n++;}}
  if(!n)return false;g.putImageData(d,0,0);IMG.w4sign=c;SPR.rg_motelsign_v=Object.assign({},m,{src:'w4sign'});return true;}
let W4_SIGN=null;
setInterval(()=>{try{if(!W4_SIGN)W4_SIGN=OBJ.find(o=>o.night==='rg_motelsign_n'||o.night==='rg_motelsign_v')||null;if(!W4_SIGN)return;
  const want=!S.looped&&w4SignVar()?'rg_motelsign_v':'rg_motelsign_n';if(W4_SIGN.night!==want)W4_SIGN.night=want;}catch(e){}},500);

// ---- Coyle's corkboard: the board the store's LOST poster is pinned to (that poster's own Look, in shopsbig.js, is left as it is);
// the board has its own Look a step in front of it
const W4_BOARD=()=>rp('store',16.9,1.0);
function w4BoardOpen(){const at=W4_BOARD();sgtOpen(at,w4Board(),'One for every autumn, as far back as the cork goes.',{},()=>{const s=w4S();if(!s.board){s.board=S.day;w4Fear(2,'the MISSING board');}});}
interact.push({get x(){return W4_BOARD().x;},get z(){return W4_BOARD().z;},r:.75,on:()=>S.room==='store',label:()=>'Look at the board',ok:()=>true,act(){w4BoardOpen();}});

// ---- what people say: Caitlyn about the board, Agnes at her door
const W4_AGNES_HOUSE={x:-46,z:-8.6};
{const _t=talk;talk=function(n){const r=_t.apply(this,arguments);try{w4OnTalk(n);}catch(e){console.warn('w4',e);}return r;};}
function w4OnTalk(n){if(!n||!n.def)return;const line=$('talkLine'),box=$('talk');if(!line||!box||box.hidden)return;const s=w4S(),id=n.def.id;
  const add=t=>line.insertAdjacentHTML('beforeend',`<br><span class="ldsay">${t}</span>`);
  if(id==='mae'&&s.board&&!s.maeBoard&&!isNight()){s.maeBoard=S.day;
    add('“Kids run off. Every town’s got a board like this.” She straightens one by the corner. “Elias came to church the Sunday before last. Sat in the front row.” A pause. “He never sits in the front.”');return;}
  if(id==='agnes'&&!s.door&&!isNight()&&Math.hypot(n.x-W4_AGNES_HOUSE.x,n.z-W4_AGNES_HOUSE.z)<9){s.door=S.day;s.doorOpen=1;
    add('“Is Elias with you?” She looks past you, down the road, for a long moment. Behind her the hall door stands open.');}}
// the door close-up opens once the talk is over
setInterval(()=>{try{const s=w4S();if(!s.doorOpen||S.mode!=='play'||!$('talk').hidden||(typeof RU!=='undefined'&&RU.on))return;s.doorOpen=0;
  const n=npcById('agnes');const at=n?{x:n.x,z:n.z}:W4_AGNES_HOUSE;sgtOpen(at,w4Door(),'“Have you seen my Ruth?”',{},()=>w4Fear(2,'Ruth’s room'));}catch(e){}},400);

// ---- the first night: look out of the cabin window; the town goes dark one window at a time; then the footsteps
const w4FirstNight=()=>S.day<=2&&!S.looped&&!S.bound&&S.hour>=19.6;
const W4_WIN=()=>{try{const R=ROOMS.cabin,m=SPR[R.shell||'room_cabin'],ws=(m&&m.room&&m.room.windows)||[];let best=null,bd=-1;
  for(const w of ws){const d=Math.min(...[1.3,3.2,4.3,5.85,7.9,8.45].map(x=>Math.abs(x-w[0])));if(d>bd){bd=d;best=w;}}return rp('cabin',best?best[0]:2.4,1.0);}catch(e){return {x:0,z:0};}};
interact.push({get x(){return W4_WIN().x;},get z(){return W4_WIN().z;},r:1.0,on:()=>S.room==='cabin'&&w4FirstNight()&&!w4S().night,label:()=>'Look out',ok:()=>true,
  act(){const s=w4S();s.night=S.day;const lit=w4Night(false),dark=w4Night(true),wins=lit.w4wins||[];
    const order=wins.map((w,i)=>i).slice(0,-1).sort((a,b)=>((a*37)%11)-((b*37)%11));order.push(wins.length-1);   /* the church's goes last */
    const off={};order.forEach((i,k)=>off[i]=1.6+k*.62);
    sgtOpen(W4_WIN(),lit,'',{w4win:{dark,wins,off,end:1.6+order.length*.62+1.2}},()=>{if(!w4S().circle)setTimeout(w4Circle,900);});w4Unlit();}});
// the view through the glass is already the night: draw it without the close-up's lantern pool and night tint
function w4Unlit(){try{if(!RU.on||!RU.spec)return;const c=document.createElement('canvas');c.width=RU.W;c.height=RU.H;const x=c.getContext('2d');x.imageSmoothingEnabled=false;ruDraw(x,RU.W,RU.H,RU.spec);RU.objC=c;RU.spec.night=false;}catch(e){}}
{const _rf=ruFrame;ruFrame=function(){_rf.apply(this,arguments);try{const spec=RU.spec;if(!spec||spec.kind!=='sight'||!spec._k||!spec.fx||!spec.fx.w4win)return;const W=spec.fx.w4win,g=RU.g,k=spec._k,t=RU.t;
  g.imageSmoothingEnabled=false;W.wins.forEach((w,i)=>{if(t<W.off[i])return;const [x,y,ww,hh]=w;g.drawImage(W.dark,x-2,y-2,ww+4,hh+4,spec._x+(x-2)*k,spec._y+(y-2)*k,(ww+4)*k,(hh+4)*k);});
  if(t>W.end&&!w4S().circle)w4Circle();}catch(e){}};}
// something walks round the cabin, slowly, all the way round you: steps panned from one side, behind, to the other and back in front
function w4Circle(){const s=w4S();if(s.circle)return;s.circle=S.day;S.odd=S.odd||{};S.odd.steps=S.day;
  try{if(typeof A!=='undefined'&&A.ok&&typeof A.hiss==='function'){const n=22,dur=13;for(let i=0;i<n;i++){const a=i/n*Math.PI*2-Math.PI/2,pan=Math.cos(a)*.95,near=.55+.45*Math.max(0,-Math.sin(a));
      const d=i*dur/n+(i%2?.06:0);A.hiss(.11,.07*near,'lowpass',380+near*260,{pan,delay:d});A.hiss(.05,.025*near,'bandpass',1500+near*500,{pan,delay:d+.04,q:2});}}}catch(e){}
  setTimeout(()=>w4Fear(4,'something walked round the cabin'),13000);}
// if you never look out, it still comes: a while after you come in on the first night, or as you lie down
let W4_IN=0;setInterval(()=>{try{if(S.mode==='play'&&S.room==='cabin'&&w4FirstNight()&&S.hour>=20.4&&!w4S().circle&&!(typeof RU!=='undefined'&&RU.on)){if((W4_IN+=.5)>=8)w4Circle();}else W4_IN=0;}catch(e){}},500);
{const _sl=sleep;sleep=function(){try{if(S.room==='cabin'&&w4FirstNight()&&!w4S().circle)w4Circle();}catch(e){}return _sl.apply(this,arguments);};}
try{if(typeof LD_ODD==='object')LD_ODD.steps='Something walked all the way round the cabin in the night. Slowly.';}catch(e){}

// ---- the Leads tab: what Caitlyn said about the front row
if(typeof leadsHtml==='function'){const _lh=leadsHtml;leadsHtml=function(){let h=_lh.apply(this,arguments);try{const s=w4S();if(!s.maeBoard)return h;
    const done=!!(S.c37hale||(S.q&&S.q.hale));const row=`<p class="ldrow${done?' lddone':''}"><b>Caitlyn said</b> Grandpa sat in the front row at church the Sunday before last. He never sits in the front.${done?' <span class="ldtick">✓</span>':''}</p>`;
    if(done)h=h.includes('<h4>Followed</h4>')?h.replace('<h4>Followed</h4>','<h4>Followed</h4>'+row):h+'<h4>Followed</h4>'+row;
    else h=h.replace(/(<h4>To follow<\/h4>)(<p class="jsub">Nothing right now\.<\/p>)?/,'$1'+row);}catch(e){}return h;};}
window.__w4={s:w4S,circle:w4Circle,board:W4_BOARD,win:W4_WIN,signVar:w4SignVar,sign:()=>W4_SIGN};
