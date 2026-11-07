/* ================= saving: the game autosaves every 30 seconds of play, on going in or out of a building, whenever it is closed or
   switched away from, and at the start of each day. Continue on the title screen resumes exactly where you were. ================= */
const SAVE_KEY='hollowSave1'+ACCT_SUFFIX;   // each profile keeps its own farm (account.js)
const SAVE_SKIP=new Set(['mode','paused','room','night','introDrive','storm','autoCol']);
function saveGame(mid){try{const data=saveData(mid);localStorage.setItem(SAVE_KEY,JSON.stringify(data));return true;}catch(e){return false;}}
function saveData(mid){const s={};for(const k of Object.keys(S)){if(SAVE_SKIP.has(k))continue;const v=S[k];if(typeof v==='function')continue;try{s[k]=JSON.parse(JSON.stringify(v));}catch(e){}}
  const data={v:1,t:Date.now(),S:s,tiles:tiles.map(t=>[t.tilled?1:0,t.crop||null,t.debris&&t.debris.hide?1:0,t.wet?1:0]),altars:altars.map(a=>a.lit?1:0),
    bench:typeof BENCH_POS!=='undefined'?BENCH_POS:null,gh:{x:GH.x,z:GH.z},mind:M.v,
    mid:mid?{hour:S.hour,x:P.x,z:P.z,dir:P.dir,room:S.room||null}:null};
  return data;}
function readSave(){try{const d=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');return d&&d.v===1?d:null;}catch(e){return null;}}
function loadGame(d){const s=d.S;for(const k of Object.keys(s)){const v=s[k];if(v&&typeof v==='object'&&!Array.isArray(v)&&S[k]&&typeof S[k]==='object'&&!Array.isArray(S[k]))S[k]=Object.assign(S[k],v);else S[k]=v;}
  S.mode='play';S.paused=false;S.room=null;S.night={};S.storm=false;S.introDrive=false;
  if(d.bench&&typeof BENCH_POS!=='undefined')Object.assign(BENCH_POS,d.bench);
  if(S.greenhouse&&!loadGame.gh){loadGame.gh=1;GH.x=d.gh.x;GH.z=d.gh.z;ROOMS.greenhouse.out={x:GH.x,z:GH.z+.8};buildGreenhouse();}
  d.tiles.forEach((a,i)=>{const t=tiles[i];if(!t)return;t.tilled=!!a[0];t.crop=a[1];t.wet=!!a[3];if(a[2]&&t.debris){const o=t.debris;o.hide=true;if(o.col){const k=circles.indexOf(o.col);if(k>=0)circles.splice(k,1);}}});
  d.altars.forEach((l,i)=>{if(altars[i])altars[i].lit=!!l;});
  if(S.coop||S.fieldLamps)rebuildFarm();if(!loadGame.b){loadGame.b=1;benchesBoot();}applyLook();M.v=d.mind==null?100:d.mind;
  S.hour=6;P.x=0;P.z=-7.6;P.fx=0;P.fz=1;P.dir='S';P.anim=null;H.state='gone';H.timer=6;H.vis=false;
  if(d.mid){const m=d.mid;S.hour=Math.min(m.hour,25.5);const R=m.room&&ROOMS[m.room];if(R&&R.out){P.x=R.out.x;P.z=R.out.z;}else if(isFinite(m.x)&&isFinite(m.z)){P.x=m.x;P.z=m.z;collide(P,.3);}P.dir=m.dir||'S';}
  if(!S.bound){scare.vis=true;placeScarecrow(S.day);}placeNPCs();spawnMushrooms();if(S.cat==='lost')resetCat();
  try{syncSlots&&syncSlots();renderHotbar&&renderHotbar();}catch(e){}}
// the saved mark in the corner
{const el=document.createElement('div');el.id='saved';el.style.cssText='position:fixed;right:14px;bottom:calc(env(safe-area-inset-bottom,0px) + 118px);z-index:30;font-size:12px;letter-spacing:.08em;color:#f4e6c8;background:rgba(42,26,14,.85);padding:4px 10px;opacity:0;transition:opacity .6s;pointer-events:none';$('app').appendChild(el);}
function savedMark(txt){const el=$('saved');el.textContent=txt;el.style.opacity=1;setTimeout(()=>el.style.opacity=0,2600);}
{const _nd=newDay;newDay=function(msg,pos){_nd(msg,pos);setTimeout(()=>{if(S.mode==='end'||S.mode==='title')return;if(saveGame()){savedMark(typeof saveLine==='function'?saveLine():'Saved');try{localStorage.setItem(SAVE_KEY+'_morning',localStorage.getItem(SAVE_KEY));}catch(e){}}},600);};}
// Continue on the title screen
{const d=readSave();if(d){const b=document.createElement('button');b.className='begin';b.id='cont';b.textContent=`Continue · Day ${d.S.day}`+(d.mid?`, ${fmtTime(d.mid.hour)}`:'');b.style.marginBottom='10px';
  $('begin').before(b);$('begin').classList.add('second');$('begin').textContent='New game';
  b.addEventListener('click',()=>{A.init&&A.init();$('title').hidden=true;finishIntro();loadGame(readSave());$('toast').classList.remove('show');
    const dd=readSave();setTimeout(()=>toast(dd&&dd.mid?`Day ${S.day}, ${fmtTime(S.hour)}. Right where you left off. Something kept your place.`:`Day ${S.day}. You wake in Grandpa’s bed. It is exactly as warm as you left it.`,3.6),300);});}}

// autosave: every 30 seconds of play, on going in or out of a building, and whenever the game is closed, hidden or switched away from
let autoT=30;const canAuto=()=>S.mode==='play'&&!S.paused&&!(S.st&&S.st.done&&!$('end').hidden)&&S.readLetter;
function autoSave(){if(!canAuto())return false;return saveGame(true);}
{const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);autoT-=dt;if(autoT<=0){autoT=30;autoSave();}};}
{const _er=enterRoom;enterRoom=function(){const r=_er.apply(this,arguments);setTimeout(autoSave,700);return r;};const _lr=leaveRoom;leaveRoom=function(){const r=_lr.apply(this,arguments);setTimeout(autoSave,700);return r;};}
const flushSave=()=>{if(S.mode==='play'&&S.readLetter&&!(S.st&&S.st.done&&!$('end').hidden))saveGame(true);};
addEventListener('pagehide',flushSave);addEventListener('beforeunload',flushSave);document.addEventListener('visibilitychange',()=>{if(document.hidden)flushSave();});
