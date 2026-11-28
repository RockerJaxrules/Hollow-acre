/* ================= saving that survives the game being stopped (owner: "I lost all my progress on a save ... didn't save any of
   the process that day"). What went wrong: the game saved every 30 seconds, but the window's storage reaches the disk only now
   and then. In the desktop app it was still in memory long after each save; when Steam ends the app ("Exit game" in Game Mode),
   or the computer stops it, everything since the last write to disk was gone and Continue opened on that morning.
   - Every save, and everything else the game keeps under its name (the look, the profiles, the settings), is also written to
     the browser's database (IndexedDB), which reaches the disk as soon as it's written. On opening, whichever of the two copies
     was written last is the one used (the game reopens once if the database's copy is the newer).
   - In the desktop app the page asks the app to put its storage on disk after each save; the app also does it on close, on
     quit and when the system asks it to stop (desktop/main.js).
   - The game saves more often: every in-game hour, a few seconds after something that matters changes (coins, the bag, the
     seeds, the story, the lessons, the shop, friendships), on going in or out of a building, and when the game is hidden or
     closed, as before.
   - Two windows on one farm: a window whose farm has been saved from another window since its own last save doesn't save over
     it (an old tab closed at night can't put the day back). If you're playing in it, it asks which one to keep.
   The save itself is unchanged, so every old save loads as before. ================= */
const KP={sid:Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4),pend:new Map(),pt:0,dbq:null,last:0,base:Date.now(),stale:false,asked:false,fl:0,flT:0,warned:false};
const KP_W='hollowKeepW';   // when each key was last written, and by which window: {key:[time,window]}
const kpMine=k=>typeof k==='string'&&k.startsWith('hollow')&&k!==KP_W;
const KP_SET=Storage.prototype.setItem,KP_DEL=Storage.prototype.removeItem,KP_GET=Storage.prototype.getItem;
const kpLS=()=>{try{return window.localStorage;}catch(e){return null;}};
function kpWmap(){try{return JSON.parse(KP_GET.call(kpLS(),KP_W)||'{}')||{};}catch(e){return {};}}
// the value goes in first, then its stamp: a value that reached the disk without its stamp still counts as the newest
function kpStamp(k){let w=Date.now();if(w<=KP.last)w=KP.last+1;KP.last=w;const W=kpWmap();W[k]=[w,KP.sid];try{KP_SET.call(kpLS(),KP_W,JSON.stringify(W));}catch(e){}return w;}
function kpDb(){if(KP.dbq)return KP.dbq;KP.dbq=new Promise(res=>{let done=false;const end=v=>{if(!done){done=true;res(v);}};
  try{if(typeof indexedDB==='undefined'||!indexedDB)return end(null);const r=indexedDB.open('hollowKeep',1);
    r.onupgradeneeded=()=>{try{r.result.createObjectStore('kv');}catch(e){}};r.onsuccess=()=>{const db=r.result;db.onversionchange=()=>{try{db.close();}catch(e){}};end(db);};
    r.onerror=()=>end(null);r.onblocked=()=>end(null);setTimeout(()=>end(null),5000);}catch(e){end(null);}});return KP.dbq;}
function kpQueue(k,v,w){KP.pend.set(k,{v,w,s:KP.sid});if(!KP.pt)KP.pt=setTimeout(kpPush,0);}
async function kpPush(){KP.pt=0;if(!KP.pend.size)return;const db=await kpDb();if(!db){KP.pend.clear();kpDesk();return;}const items=[...KP.pend];KP.pend.clear();
  try{let tx;try{tx=db.transaction('kv','readwrite',{durability:'strict'});}catch(e){tx=db.transaction('kv','readwrite');}const st=tx.objectStore('kv');
    for(const [k,r] of items)st.put(r,k);tx.oncomplete=()=>kpDesk();
    tx.onerror=tx.onabort=()=>{for(const [k,r] of items)if(!KP.pend.has(k))KP.pend.set(k,r);kpDesk();};}catch(e){kpDesk();}}
// the desktop app: put the window's storage on disk now (at most once a second)
function kpDesk(){try{const D=window.hollowDesktop;if(!D||typeof D.flush!=='function')return;const now=Date.now(),gap=now-KP.fl;
  if(gap>=1000){KP.fl=now;D.flush();}else if(!KP.flT)KP.flT=setTimeout(()=>{KP.flT=0;KP.fl=Date.now();try{D.flush();}catch(e){}},1000-gap);}catch(e){}}
Storage.prototype.setItem=function(k,v){const L=kpLS();if(this!==L||!kpMine(k))return KP_SET.apply(this,arguments);k=String(k);
  let err=null;try{KP_SET.call(this,k,v);}catch(e){err=e;}   // (a full storage still gets the save into the database)
  try{const w=kpStamp(k);if(k===SAVE_KEY)KP.base=w;kpQueue(k,String(v),w);}catch(e){}
  if(err)throw err;};
Storage.prototype.removeItem=function(k){const L=kpLS();if(this!==L||!kpMine(k))return KP_DEL.apply(this,arguments);k=String(k);
  KP_DEL.call(this,k);try{kpQueue(k,null,kpStamp(k));}catch(e){}};
// ---- on opening: put back whatever the window's storage lost, and give the database whatever it hasn't got yet
async function kpBoot(){const db=await kpDb(),L=kpLS();if(!db||!L)return;let rows;
  try{rows=await new Promise((res,rej)=>{const out=[];const c=db.transaction('kv','readonly').objectStore('kv').openCursor();c.onsuccess=()=>{const q=c.result;if(q){out.push([q.key,q.value]);q.continue();}else res(out);};c.onerror=()=>rej(c.error);});}
  catch(e){return;}
  const W=kpWmap(),have=new Set(),back=[];let fix=false;
  for(const [k,r] of rows){if(typeof k!=='string'||!r||typeof r.w!=='number')continue;have.add(k);const lw=(W[k]&&W[k][0])||0;let cur=null;try{cur=KP_GET.call(L,k);}catch(e){}
    if(cur===r.v){if(r.w>lw){W[k]=[r.w,r.s||'db'];fix=true;}continue;}
    // the database was written after the window's storage last was: what the storage has is older (it lost the newer write)
    if(r.w>lw)back.push([k,r]);
    // stamped the same or later: the storage's value is the newer (a write before this page could stamp it, or the database missed it)
    else{const w=Math.max(lw,r.w+1);KP.pend.set(k,{v:cur,w,s:KP.sid});W[k]=[w,KP.sid];fix=true;}}
  for(let i=0;i<L.length;i++){const k=L.key(i);if(!kpMine(k)||have.has(k))continue;const v=KP_GET.call(L,k);if(!W[k]){W[k]=[1,KP.sid];fix=true;}KP.pend.set(k,{v,w:W[k][0],s:W[k][1]});}
  if(KP.pend.size)kpPush();
  if(back.length){
    // only before anything has been loaded or started in this page (never under a game in play)
    if(KP.started){console.warn('save keeper: newer copies left in the database',back.map(b=>b[0]));return;}
    let big=false;for(const [k,r] of back){try{if(r.v===null)KP_DEL.call(L,k);else KP_SET.call(L,k,r.v);W[k]=[r.w,r.s||'db'];fix=true;if(KP_BOOT.test(k))big=true;}catch(e){console.warn('save keeper: could not put back',k,e);}}
    if(fix)try{KP_SET.call(L,KP_W,JSON.stringify(W));}catch(e){}
    console.warn('save keeper: put back',back.map(b=>b[0]).join(', '));
    // the game read these as it opened (the save, the look, the profiles, the settings): open it again with them
    let again=0;try{again=+sessionStorage.getItem('hollowKeepRe')||0;}catch(e){}
    if(big&&Date.now()-again>30000){try{sessionStorage.setItem('hollowKeepRe',String(Date.now()));}catch(e){}location.reload();}
    return;}
  if(fix)try{KP_SET.call(L,KP_W,JSON.stringify(W));}catch(e){}}
const KP_BOOT=/^hollow(Save1|Look|Accounts|Profile|Set|Disp|Pad|Sound|FS)/;
kpBoot();
{const _lg=loadGame;loadGame=function(){KP.started=true;return _lg.apply(this,arguments);};const _fi=finishIntro;finishIntro=function(){KP.started=true;KP.base=Math.max(Date.now(),KP.last+1);return _fi.apply(this,arguments);};}
// ---- two windows on one farm: another window saved this farm after this one last loaded or saved it
const kpOther=()=>{const e=kpWmap()[SAVE_KEY];return !!(e&&e[1]&&e[1]!==KP.sid&&e[0]>KP.base);};
function kpAsk(){if(KP.asked||Date.now()-(KP.askT||0)<90000||document.visibilityState!=='visible'||S.mode!=='play'||!$('note')||!$('note').hidden)return;KP.asked=true;KP.askT=Date.now();let d=null;try{d=readSave();}catch(e){}
  const when=d&&d.S?`Day ${d.S.day}${d.mid?', '+fmtTime(d.mid.hour):''}`:'a newer day';
  openNote(`<h3>This farm is open in another window</h3><p>Your farm was saved from another window (at ${when}) after this one last saved. So that one isn’t lost, this window has stopped saving.</p>
    <p><button id="kpLoad" class="begin" style="margin:4px 8px 4px 0">Load that save</button><button id="kpKeep" class="begin" style="margin:4px 0">Keep playing here</button></p>
    <p style="font-size:13px;opacity:.8">Keep playing here, and this window saves again, over the other one.</p>`,'Decide later',()=>{KP.asked=false;});
  const n=$('noteText');n.querySelector('#kpLoad').onclick=()=>{KP.stale=true;try{sessionStorage.setItem('hollowKeepCont','1');}catch(e){}$('note').hidden=true;location.reload();};
  n.querySelector('#kpKeep').onclick=()=>{KP.stale=false;KP.base=Math.max(Date.now(),((kpWmap()[SAVE_KEY]||[])[0])||0);KP.asked=false;$('noteClose').click();setTimeout(()=>{try{saveGame(true);}catch(e){}toast('Saved here. This window’s farm is the one kept.',2.6);},50);};}
{const _sg=saveGame;saveGame=function(){if(KP.stale||kpOther()){KP.stale=true;kpAsk();return false;}const r=_sg.apply(this,arguments);
  if(r===false&&!KP.warned){KP.warned=true;let why='';try{JSON.stringify(saveData(true));}catch(e){why=e&&e.message||String(e);}console.warn('save failed',why);
    try{toast('The game couldn’t save just now'+(why?' ('+String(why).slice(0,60)+')':'')+'. Free some space on this device, or tell us.',5,true);}catch(e){}}
  return r;};}
// "Load that save": the game reopens straight into it
{let f=null;try{f=sessionStorage.getItem('hollowKeepCont');sessionStorage.removeItem('hollowKeepCont');}catch(e){}
  if(f){const go=()=>{if($('loadScr')||S.mode!=='title'){setTimeout(go,250);return;}const b=$('cont');if(b){b.click();setTimeout(()=>toast(`Day ${S.day}, ${fmtTime(S.hour)}. The save from the other window.`,3.6),900);}};setTimeout(go,600);}}
// a fresh load of the save is in step with it again
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);KP.base=Math.max(Date.now(),KP.last+1);KP.stale=false;return r;};}
// ---- saving more often: each in-game hour, and a few seconds after something that matters changes
function kpSig(){let n=0;const add=o=>{if(o&&typeof o==='object')for(const v of Object.values(o))if(typeof v==='number')n+=v;};add(S.seeds);add(S.inv);add(S.friend);
  const B=S.biz&&S.biz.own;return [S.coins|0,S.day,Math.round(n),(S.basket||[]).length,(S.lore||[]).length,(S.journal||[]).length,S.saga&&S.saga.done?Object.keys(S.saga.done).length:0,
    S.ls?S.ls.i:0,(S.furnPlaced||[]).length,S.shipped|0,S.benchBuilt?Object.keys(S.benchBuilt).length:0,S.house?S.house.tier|0:0,(S.kegs||[]).length,
    B?((B.staff||[]).length+':'+(B.stock||[]).length):'',(S.marks||[]).length,S.keyItems?S.keyItems.length:0].join(',');}
function kpSoon(){const go=()=>{try{if(canAuto()&&saveGame(true))autoT=30;}catch(e){}};try{if(typeof requestIdleCallback==='function')requestIdleCallback(go,{timeout:900});else setTimeout(go,60);}catch(e){go();}}
{let lastH=null,sigT=1,sig='',due=0,lastSoon=0;const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);try{if(S.mode!=='play'||S.paused)return;
    const h=Math.floor(S.hour||0);if(lastH!==null&&h!==lastH&&!due)due=.4;lastH=h;
    sigT-=dt;if(sigT<=0){sigT=1;const s=kpSig();if(sig&&s!==sig&&!due)due=Math.max(.5,6-(Date.now()-lastSoon)/1000);sig=s;}
    if(due>0){due-=dt;if(due<=0){due=0;lastSoon=Date.now();kpSoon();}}}catch(e){}};}
// the save on hiding or closing, and the database after it, as early as the page can: freezing a hidden page counts too
document.addEventListener('freeze',()=>{try{flushSave();}catch(e){}});
