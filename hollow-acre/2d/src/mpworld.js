/* ================= #223-#224 a world made for friends. Starting a world for friends is a choice you make before anything
   else, like Stardew's co-op farms: the host picks the rules once (each player gets a cabin of their own or everyone shares
   Grandpa's, one purse or separate wallets, playing together or against each other, how many friends can move in), the world
   gets a farm code that never changes, and it opens to friends every time the host plays it. Each farmhand has a cabin of
   their own on the farm (until they marry), wakes up in it, sleeps in it and is paid for what they ship from it. ============ */
const MPW_DEF={mp:true,cabins:'own',money:'shared',play:'coop',hands:2,code:'',slots:{},owed:{},v:1};
let MPW_NEW=null;                                   // rules picked on the title screen, applied when the new world begins
const mpOn=()=>!!(S.world&&S.world.mp);
const mpSplit=()=>mpOn()&&(S.world.money==='split'||S.world.play==='compete');
const mpOwn=()=>mpOn()&&S.world.cabins==='own';
const MPC={placed:{},sprites:{},its:{},objs:{}};
// farmhand cabins: two side by side on the open grass east of the field, a third in the strip between the field and the west hedge, below the windmill
const FH_SPOTS=[{x:12.0,z:6.6},{x:18.7,z:6.6},{x:-9.4,z:7.6}];
// each cabin is the mended shack, painted its own colour: barn red, sage, slate blue (walls) under its own roof
const FH_PAINT=[{n:'red',wall:[.012,.42,.86],roof:null},{n:'green',wall:[.25,.17,.92],roof:[.07,.2,.98]},{n:'blue',wall:[.6,.2,.92],roof:[.41,.13,.96]}];
function mpHls(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;
  if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}return [h,l,s];}
function mpRgb(h,l,s){if(!s){const v=Math.round(l*255);return [v,v,v];}const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;
  const f=t=>{t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};return [f(h+1/3),f(h),f(h-1/3)].map(v=>Math.round(v*255));}
async function fhSprite(i){const key='fhcab_'+i;if(SPR[key])return key;const base=SPR.cabin_s1?'cabin_s1':'cabin';
  try{const need=[base,base+'_n'].map(k=>SPR[k]&&SPR[k].src).filter(s=>s&&!IMG[s]);if(need.length&&typeof loadImages==='function')await loadImages(need);}catch(e){}
  const P=FH_PAINT[i%FH_PAINT.length];
  for(const suf of ['','_n']){const m=SPR[base+suf];const im=m&&IMG[m.src];if(!im||!im.width)continue;
    const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);
    const d=g.getImageData(0,0,c.width,c.height),a=d.data;
    for(let p=0;p<a.length;p+=4){if(a[p+3]<8)continue;const [h,l,s]=mpHls(a[p],a[p+1],a[p+2]);let o=null;
      if(l>.36&&l<.82&&s<.3&&((h>.03&&h<.17)||s<.08))o=mpRgb(P.wall[0],Math.min(.86,l*P.wall[2]),P.wall[1]+s*.4);     // the board walls
      else if(P.roof&&l>.13&&l<.48&&s<.13&&h>.58&&h<.95)o=mpRgb(P.roof[0],l*P.roof[2],P.roof[1]);                       // the shingles
      if(o){a[p]=o[0];a[p+1]=o[1];a[p+2]=o[2];}}
    g.putImageData(d,0,0);IMG['mem:'+key+suf]=c;SPR[key+suf]=Object.assign({},m,{src:'mem:'+key+suf});}
  return SPR[key]?key:base;}
// the cabins' insides: a one-room home with a bed, a stove, a table, a chest and a rug
{let ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;const shell=SPR.room_cabin1?'room_cabin1':'room_cabin';
  for(let i=0;i<FH_SPOTS.length;i++){const s=FH_SPOTS[i];
    ROOMS['fcab'+i]={ox,oz:-60,name:'A farmhand’s cabin',shell,out:{x:s.x,z:s.z+.9},furn:[
      ['in_bed',1.3,2.6,[-.85,-2.1,.85,0]],['in_shelf_books',3.2,.62,[-.8,-.4,.8,0]],['in_stove',7.9,.95,[-.68,-.5,.68,0]],
      ['in_rug',4.4,4.0,null,'flat'],['in_table',6.3,3.5,[-.85,-.45,.85,0]],['in_chair',5.2,3.55,[-.3,-.25,.3,0]],
      ['barrel',8.4,5.2,[-.4,-.3,.4,0]],['in_clock',4.6,.55,[-.3,-.3,.3,0]]]};ox+=40;}}
const fhOwner=i=>{const sl=(S.world&&S.world.slots)||{};for(const [n,k] of Object.entries(sl))if(k===i)return n;return '';};
const mySlot=()=>{const sl=(S.world&&S.world.slots)||{};const k=sl[NAME()||'Farmhand'];return Number.isInteger(k)?k:-1;};
// the beds in them: a farmhand sleeps in their own cabin
for(let i=0;i<FH_SPOTS.length;i++){const k='fcab'+i;
  interact.push({x:ROOMS[k].ox+1.3,z:ROOMS[k].oz+2.9,r:1.3,on:()=>S.room===k,label:()=>'Sleep',ok:()=>true,act(){if(S.hour<18&&typeof sleepEarly==='function'){sleepEarly();return;}sleep();}});}
async function fhPlace(i){if(MPC.placed[i]||!FH_SPOTS[i])return;MPC.placed[i]=1;const s=FH_SPOTS[i];const key=await fhSprite(i);const m=SPR[key];if(!m){MPC.placed[i]=0;return;}
  const f=m.foot||[-2.3,-2.8,2.3,0];
  // clear the overgrowth (weeds, rocks, twigs) under the cabin and on its front step
  for(const o of OBJ){if(o.hide||!(o.debris||o.kind==='grass'||o.kind==='deco'))continue;if(o.x>s.x+f[0]-.9&&o.x<s.x+f[2]+.9&&o.z>s.z+f[1]-.9&&o.z<s.z+2.2){o.hide=true;
    if(o.col){const q=circles.indexOf(o.col);if(q>=0)circles.splice(q,1);}}}
  const e=obj(key,s.x,s.z,{kind:'bld',night:SPR[key+'_n']?key+'_n':null,fhcab:i});MPC.objs[i]=e;
  addRect(s.x+f[0],s.z+f[1],s.x+f[2],s.z+f[3]-.12);
  if(typeof HOUSES!=='undefined')HOUSES.push({e,x:s.x,z:s.z,lit:false,w:m.bw||4.6});
  const it={x:s.x,z:s.z+.15,r:1.15,on:()=>!S.room,label:()=>{const o=fhOwner(i);return o?(o===NAME()?'Home':`${o}’s cabin`):'Empty cabin';},ok:()=>true,
    act(){const o=fhOwner(i);if(!o){toast('An empty cabin. It’s swept and the bed is made. Whoever moves in next gets it.',3);return;}enterRoom('fcab'+i);}};
  interact.push(it);MPC.its[i]=it;
  ROOMS['fcab'+i].out={x:s.x,z:s.z+.9};
  if(typeof NAV!=='undefined')NAV.sig='';}
function fhPlaceAll(){if(!mpOwn())return;const n=Math.max(0,Math.min(FH_SPOTS.length,S.world.hands|0));for(let i=0;i<n;i++)fhPlace(i);}
// ---- the rules become the world's
function mpBegin(rules){S.world=Object.assign({},MPW_DEF,rules||{},{slots:{},owed:{}});if(S.world.play==='compete')S.world.money='split';
  if(!S.world.code)S.world.code=(typeof newCode==='function'?newCode():'FARM'+(10+Math.floor(Math.random()*90)));
  mpPersonal();fhPlaceAll();try{saveGame&&saveGame();}catch(e){}}
function mpPersonal(){if(mpSplit()&&!PERSONAL.includes('coins'))PERSONAL.push('coins');}
// a new world made from the title screen gets its rules as the story begins
{const _fi=finishIntro;finishIntro=function(){const r=_fi.apply(this,arguments);if(MPW_NEW){const rules=MPW_NEW;MPW_NEW=null;mpBegin(rules);MPW_HOST.want=true;}return r;};}
// the host's world keeps its code, and opens itself to friends whenever it's played
{const _nc=newCode;newCode=function(){return (mpOn()&&S.world.code)?S.world.code:_nc();};}
const MPW_HOST={want:false,tried:0,said:false};
function mpTick(dt){if(!mpOn()||HOST.role==='guest')return;
  if(!MPC.ready){MPC.ready=1;mpPersonal();fhPlaceAll();}
  if(HOST.role==='host'||S.mode!=='play')return;MPW_HOST.tried-=dt;if(MPW_HOST.tried>0)return;MPW_HOST.tried=4;
  if(!canHost()){if(!MPW_HOST.said){MPW_HOST.said=true;toast('No connection right now, so friends can’t join yet. The farm will open by itself when you’re back online.',4);}return;}
  hostStart().catch(()=>{});}
{const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);try{mpTick(dt);}catch(e){}};}
// ---- moving in: the host gives each farmhand who arrives a cabin of their own, and tells everyone
function mpSlotFor(n){const w=S.world;if(!w)return -1;if(Number.isInteger(w.slots[n]))return w.slots[n];const used=new Set(Object.values(w.slots));
  for(let i=0;i<Math.min(FH_SPOTS.length,w.hands|0);i++)if(!used.has(i)){w.slots[n]=i;return i;}return -1;}
function mpWorldOut(){return JSON.parse(JSON.stringify(S.world||null));}
// (registered before host.js's own handlers, so a cabin is given out before the farm is sent: the snapshot then already says whose it is)
{const _hw=hostWire;hostWire=function(){for(const f of (MPC.off||[]))try{f();}catch(e){}MPC.off=[];const r=CO.room;
  if(r&&r.on){const on=(t,f)=>MPC.off.push(r.on(t,m=>{if(!m||m.isMe)return;try{f(m);}catch(e){}}));
    on('hello',m=>{if(HOST.role!=='host'||!mpOn())return;const n=clean(m.data&&m.data.n);
      if(mpOwn()&&mpSlotFor(n)<0)toast(`There’s no empty cabin for ${n}. They’ll sleep in Grandpa’s cabin until you build another.`,4);
      setTimeout(()=>{try{r.emit('mpw',{world:mpWorldOut()});const owe=S.world.owed&&S.world.owed[n];
        if(owe&&owe.total){r.emit('mpay',{n,total:owe.total,items:owe.items||[],day:owe.day},m.peer);delete S.world.owed[n];}}catch(e){}},300);});
    on('mpw',m=>{if(HOST.role!=='guest'||!m.data||!m.data.world)return;const had=mySlot();S.world=m.data.world;mpPersonal();MPC.ready=1;fhPlaceAll();
      const now=mySlot();if(now>=0&&had<0&&HOST.joined){toast(`The ${FH_PAINT[now].n} cabin is yours. Your bed is made.`,3.4);mpGoHome(false);}});
    on('mpay',m=>{if(HOST.role!=='guest'||!m.data)return;const d=m.data;if(clean(d.n)!==(NAME()||'Farmhand'))return;const t=Math.max(0,Math.min(1e6,d.total|0));
      S.coins+=t;updateHud&&updateHud();if(typeof showSale==='function'&&Array.isArray(d.items))setTimeout(()=>showSale(d.items.slice(0,400),t,d.day|0),400);});}
  return _hw.apply(this,arguments);};}
// a farmhand starts at their own door, and every later morning wakes up in their own bed
function mpGoHome(inside){const i=mySlot();if(i<0||!FH_SPOTS[i])return;const s=FH_SPOTS[i];
  if(inside&&ROOMS['fcab'+i]&&ROOMS['fcab'+i].w){const R=ROOMS['fcab'+i];S.room='fcab'+i;P.x=R.ox+2.3;P.z=R.oz+2.9;P.dir='S';P.fx=0;P.fz=1;}
  else{S.room=null;P.x=s.x;P.z=s.z+1.1;P.dir='S';P.fx=0;P.fz=1;}}
{const _as=applySnap;applySnap=function(data,first,hand){const r=_as.apply(this,arguments);try{
    if(mpOn()){mpPersonal();MPC.ready=1;fhPlaceAll();
      if(first&&mpSplit())S.coins=hand&&isFinite(hand.coins)?Math.max(0,hand.coins|0):10;   // separate wallets: a farmhand's money lives in this world, not their own
      if(mpOwn())mpGoHome(!first);updateHud&&updateHud();}}catch(e){}return r;};}
// separate wallets: nobody's coins move to anyone else's, and what a farmhand earns stays in the host's world
{const _hs=hostSync;hostSync=function(dt){if(mpSplit())HOST.coins=S.coins;return _hs.apply(this,arguments);};}
guestPersist=function(){try{if(CO.room&&CO.room.emit&&HOST.hostPeer)CO.room.emit('mine',{n:NAME()||'Farmhand',p:takePersonal()},HOST.hostPeer);}catch(e){}
  try{const own=readSave();if(!own)return;const mine=takePersonal();for(const [k,v] of Object.entries(mine)){if(k==='look'||(k==='coins'&&mpSplit()))continue;own.S[k]=v;}localStorage.setItem(SAVE_KEY,JSON.stringify(own));}catch(e){}};
// whatever goes in the shipping bin remembers who put it there, and with separate wallets the money goes to them
{const _sp=shipPut;shipPut=function(){const n0=S.ship.length;const r=_sp.apply(this,arguments);const me=NAME()||'Farmhand';for(let i=n0;i<S.ship.length;i++)if(!S.ship[i].by)S.ship[i].by=me;return r;};}
{const _nd=newDay;newDay=function(m,p){
  if(mpOn()&&mpSplit()&&HOST.role!=='guest'&&Array.isArray(S.ship)&&S.ship.length){const me=NAME()||'Farmhand';const theirs={};
    S.ship=S.ship.filter(e=>{if(!e.by||e.by===me)return true;(theirs[e.by]=theirs[e.by]||[]).push(e);return false;});
    const online=new Set(Object.values(HOST.members||{}));const peerOf=n=>Object.keys(HOST.members||{}).find(k=>HOST.members[k]===n);
    for(const [n,items] of Object.entries(theirs)){const total=items.reduce((a,e)=>a+(e.value|0),0);const day=S.day;
      const peer=online.has(n)?peerOf(n):null;
      if(peer&&CO.room&&CO.room.emit)CO.room.emit('mpay',{n,total,items,day},peer);
      else{S.world.owed=S.world.owed||{};const o=S.world.owed[n]||(S.world.owed[n]={total:0,items:[],day});o.total+=total;o.items=o.items.concat(items).slice(-400);o.day=day;}}}
  return _nd.apply(this,arguments);};}
// ---- the title screen: Play with friends
{const css=document.createElement('style');css.textContent=`
#mpScr{gap:0;justify-content:flex-start;padding-top:max(22px,env(safe-area-inset-top))}#mpScr .mwrap{display:flex;flex-direction:column;align-items:center;gap:8px;width:min(480px,94vw);margin-top:6px}#mpScr .mwrap.rules{width:min(780px,94vw)}#mpScr .mgrid{display:grid;grid-template-columns:1fr;gap:8px;width:100%}@media (min-width:700px){#mpScr .mgrid{grid-template-columns:1fr 1fr}}
#mpScr .mrow{display:flex;flex-direction:column;align-items:stretch;gap:5px;width:100%;text-align:left;padding:9px 11px;background:rgba(0,0,0,.2);box-shadow:inset 0 0 0 1px var(--line)}
#mpScr .mrow>b{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}#mpScr .mrow>small{font-size:12px;color:var(--dim);line-height:1.3;min-height:3.9em}
#mpScr .chips{display:flex;flex-wrap:wrap;gap:6px}#mpScr .chip{height:34px;border-radius:8px;border:1px solid var(--line);background:rgba(233,223,198,.06);color:var(--bone);font:inherit;font-size:13px;padding:0 11px;cursor:pointer}
#mpScr .chip.on{outline:2px solid var(--ember);outline-offset:2px;background:rgba(232,146,63,.16)}#mpScr .chip[disabled]{opacity:.38;cursor:default}
#mpScr .mbtns{display:flex;gap:10px;margin-top:6px;align-items:center}#mpScr input{font:inherit;font-size:22px;letter-spacing:.2em;text-transform:uppercase;text-align:center;width:min(240px,70vw);padding:9px 10px;background:#2a1a0e;color:#f4e6c8;border:0;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 3px #b8521c}
#mpScr .mpick{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;width:100%}#mpScr .mpick button{flex:1 1 200px;min-height:86px;text-align:left;padding:12px 14px;border-radius:10px;border:1px solid var(--line);background:rgba(233,223,198,.06);color:var(--bone);font:inherit;cursor:pointer}
#mpScr .mpick button b{display:block;font-size:17px;margin-bottom:4px;color:#ffd27a}#mpScr .mpick button span{font-size:12px;color:var(--dim);line-height:1.35}
#mpBtn{margin-top:10px;font-size:18px;padding:10px 26px}`;document.head.appendChild(css);
  const el=document.createElement('div');el.className='screen';el.id='mpScr';el.hidden=true;$('title').after(el);
  const R=Object.assign({},{cabins:'own',money:'shared',play:'coop',hands:2});let page='pick',midGame=false;
  const ROWS=[['cabins','Cabins',[['own','A cabin each'],['shared','Everyone in Grandpa’s']],
      {own:'Every friend who joins gets a cabin of their own on the farm, with their own bed. Married players move in together.',shared:'Everyone sleeps under Grandpa’s roof. Cosy. Crowded. Nobody gets a door that locks.'}],
    ['money','Money',[['shared','One shared purse'],['split','Everyone keeps their own']],
      {shared:'All of you spend from the same coins. What anyone ships pays everyone.',split:'Each of you has your own wallet. What you ship pays you.'}],
    ['play','How you play',[['coop','Together'],['compete','Against each other']],
      {coop:'One farm, one story, everyone pulling the same way.',compete:'Same farm and story, but the buyers in town play you against each other: sell first, sell best, and watch the prices you leave behind.'}],
    ['hands','Friends',[[1,'1'],[2,'2'],[3,'3']],{1:'Room for one friend.',2:'Room for two friends.',3:'Room for three friends: a cabin each, if you chose cabins.'}]];
  function render(){if(page==='pick'){el.innerHTML=`<div class="kicker">Play with friends</div><h1 style="font-size:34px;margin:6px 0 2px">The valley takes more than one</h1>
      <div class="mwrap"><div class="mpick"><button id="mpHost"><b>Make a world for friends</b><span>Start a new farm as its host. You choose the rules first, then friends join with your farm code.</span></button>
      <button id="mpJoin"><b>Join a friend’s world</b><span>Type their farm code. Your backpack and tools come with you, and go home with you.</span></button></div>
      <div class="mbtns"><button class="chip" id="mpBack">Back</button></div></div>`;
      $('mpHost').onclick=()=>{page='rules';render();};$('mpJoin').onclick=()=>{page='join';render();};$('mpBack').onclick=close;return;}
    if(page==='join'){el.innerHTML=`<div class="kicker">Join a friend’s world</div><div class="mwrap"><p class="tag" style="margin:4px 0">Ask the host for their farm code. They need to be playing.</p>
      <input id="mpCode" maxlength="8" placeholder="CODE12" autocomplete="off"><div class="mbtns"><button class="chip" id="mpBack">Back</button><button class="begin" id="mpGo">Join</button></div></div>`;
      const inp=$('mpCode');['keydown','keyup','keypress'].forEach(t=>inp.addEventListener(t,e=>{e.stopPropagation();if(t==='keydown'&&e.key==='Enter')$('mpGo').click();}));setTimeout(()=>inp.focus(),50);
      $('mpBack').onclick=()=>{page='pick';render();};$('mpGo').onclick=()=>{const c=inp.value.trim();if(!c){toast('Type the host’s farm code first.',2.2);return;}hostJoin(c);};return;}
    if(R.play==='compete')R.money='split';
    let h=`<div class="kicker">${midGame?'Open this farm to friends':'A world for friends'}</div><div class="mwrap rules"><div class="mgrid">`;
    for(const [k,label,opts,why] of ROWS){h+=`<div class="mrow"><b>${label}</b><div class="chips">`;
      for(const [v,t] of opts){const dis=k==='money'&&R.play==='compete'&&v==='shared';h+=`<button class="chip${R[k]===v?' on':''}" data-k="${k}" data-v="${v}"${dis?' disabled':''}>${t}</button>`;}
      h+=`</div><small>${why[R[k]]||''}</small></div>`;}
    h+=`</div><p class="small" style="margin:2px 0 0;opacity:.75">These are the world’s rules from now on. They can’t be changed later.</p>
      <div class="mbtns"><button class="chip" id="mpBack">Back</button><button class="begin" id="mpGo">${midGame?'Open the farm':'Next: who is driving'}</button></div></div>`;
    el.innerHTML=h;
    el.querySelectorAll('.chip[data-k]').forEach(b=>b.onclick=()=>{if(b.disabled)return;const k=b.dataset.k;let v=b.dataset.v;if(k==='hands')v=+v;R[k]=v;render();});
    $('mpBack').onclick=()=>{if(midGame){close();return;}page='pick';render();};
    $('mpGo').onclick=()=>{const rules=Object.assign({},R);if(midGame){close();mpBegin(rules);MPW_HOST.tried=0;toast('This farm is now a world for friends. It opens to them whenever you play.',3.6);return;}
      MPW_NEW=rules;el.hidden=true;$('title').hidden=false;$('begin').click();};}
  function close(){el.hidden=true;if(midGame){midGame=false;S.paused=false;}else $('title').hidden=false;}
  window.mpOpenRules=function(mid){midGame=!!mid;page=mid?'rules':'pick';render();el.hidden=false;if(mid){S.paused=true;$('bag').hidden=true;}else $('title').hidden=true;};
  const b=document.createElement('button');b.className='begin second';b.id='mpBtn';b.textContent='Play with friends';
  b.addEventListener('click',()=>{A.init&&A.init();window.mpOpenRules(false);});$('begin').after(b);
  if([...$('title').querySelectorAll('button')].some(x=>/^Join farm/.test(x.textContent)))b.hidden=true;}   // already on the way to a friend's farm
// ---- the Together tab says what kind of world this is, and a farm made for one can be opened to friends
{const _rc=renderCoop;renderCoop=function(){_rc();const B=$('bagBody');if(!B)return;const box=document.createElement('div');box.style.cssText='margin-top:12px;padding:8px 10px;background:rgba(0,0,0,.18)';
  if(mpOn()){const w=S.world;const lines=[w.cabins==='own'?'A cabin each':'Everyone in Grandpa’s cabin',mpSplit()?'Separate wallets':'One shared purse',w.play==='compete'?'Playing against each other':'Playing together'];
    const homes=[];for(let i=0;i<Math.min(FH_SPOTS.length,w.hands|0);i++)if(w.cabins==='own')homes.push(`${FH_PAINT[i].n} cabin: ${fhOwner(i)||'empty'}`);
    box.innerHTML=`<b>A world for friends</b> <small>· farm code ${w.code}</small><p class="jsub" style="font-size:12px;margin:4px 0">${lines.join(' · ')}</p>${homes.length?`<p class="jsub" style="font-size:12px;margin:0">${homes.join(' · ')}</p>`:''}`;}
  else if(HOST.role!=='guest'){box.innerHTML=`<b>This farm is just yours</b><p class="jsub" style="font-size:12px;margin:4px 0">Open it to friends: you choose the rules once (cabins, money, together or against each other) and it keeps one farm code for good.</p><button class="btn" id="mpOpen">Open this farm to friends</button>`;}
  else return;if(!mpOn()&&$('hoHost'))$('hoHost').remove();B.appendChild(box);if($('mpOpen'))$('mpOpen').onclick=()=>window.mpOpenRules(true);};}
