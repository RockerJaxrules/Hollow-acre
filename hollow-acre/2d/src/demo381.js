/* ================= PLATFORMS: the demo, and the owner's Demo feedback page (owner: "Make me demo layout with different link gives
   you 1 hour and a half and than asks your to give it a star rating and feedback").
   The demo link (2d/demo/, built by tools/mkdemo.py) plays this same game with window.HOLLOW_DEMO set and its own storage.
   In the demo:
   - 90 minutes of real play are counted: only while the game is in front and past the title screen. A menu, the map or a
     dialog counts while you use it; left alone for 2 minutes (nothing pressed, clicked, tapped or moved on a pad) it stops
     counting, and so does standing still in the world. Cutscenes count. The time left shows at the top of Settings and on the title.
   - A quiet note at 10 minutes left and at 2 minutes left.
   - At 0 the game saves and fades out, and the page opens the thank-you screen: stars, a note, Send, and the full game. That
     browser gets the thank-you screen from then on.
   - Logging in to an account (cloud saves) is off, so a demo farm is never uploaded over the full game's farm.
   In the full game:
   - The profile with the owner's code (Jaxon5, the one that turns on unlimited gifts) has a Demo feedback page: under Settings,
     Gameplay, and on the Codes page. It fetches the ratings from the relays, opens them with a key made from the code, and lists
     every rating with its note, newest first, with the average. What it has fetched is kept on that device.
   ================= */
const DMO=(typeof window!=='undefined'&&window.HOLLOW_DEMO)||null;
const DMO_K={played:'hollowDemoPlayed',end:'hollowDemoEnd',warned:'hollowDemoWarned',build:'hollowDemoBuild'};
const dmoGet=k=>{try{return localStorage.getItem(k);}catch(e){return null;}},dmoSet=(k,v)=>{try{localStorage.setItem(k,String(v));}catch(e){}};
// "1:23:05" / "9:41"; and in words, "1 h 30 min" / "9 min"
function dmoClock(s){s=Math.max(0,Math.ceil(s));const h=s/3600|0,m=(s%3600)/60|0,x=s%60,p=n=>String(n).padStart(2,'0');return h?`${h}:${p(m)}:${p(x)}`:`${m}:${p(x)}`;}
function dmoWords(s){const m=Math.max(1,Math.ceil(s/60));if(m<60)return m+' min';const h=m/60|0,r=m%60;return h+' h'+(r?' '+r+' min':'');}
{const css=document.createElement('style');css.textContent=`
#dmo7{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:0 0 10px;padding:8px 12px;background:#1c120a;color:#e8dcc0;font-size:15px;
  box-shadow:inset 0 0 0 2px #0c0603,inset 0 0 0 4px #4a3018}
#dmo7 b{font-weight:400;color:#ffd27a;font-size:17px;font-variant-numeric:tabular-nums}
#dmoBadge{margin:10px 0 0;font-size:16px;letter-spacing:.24em;text-transform:uppercase;color:#f0a040;text-shadow:2px 2px 0 #000}
#dmoNote{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:2147483000;pointer-events:none;width:max-content;max-width:calc(100vw - 32px);box-sizing:border-box;
  padding:8px 16px 9px;background:rgba(12,9,14,.95);box-shadow:inset 0 0 0 2px #b8742c,0 0 0 2px #000,4px 4px 0 2px rgba(0,0,0,.5);color:#e8dcc0;text-align:center;
  font-family:'Hollow Pixel',ui-monospace,monospace;font-size:17px;line-height:1.35;text-shadow:2px 2px 0 #000;opacity:0;transition:opacity .4s steps(4)}
#dmoNote.on{opacity:1}#dmoNote b{display:block;color:#f0a040;font-weight:400}
#dmoFade{position:fixed;inset:0;z-index:2147483600;background:#07070a;opacity:0;transition:opacity 1.6s steps(8);display:flex;align-items:center;justify-content:center;
  font-family:'Hollow Pixel',ui-monospace,monospace;font-size:24px;color:#f0a040;text-shadow:2px 2px 0 #000;text-align:center;padding:16px;box-sizing:border-box}
#dmoFade.on{opacity:1}
.dmoInDemo #acctCloud{display:none!important}
#dfb .dfbSum{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin:2px 0 10px;font-size:15px}
#dfb .dfbAvg{font-size:24px;color:#ffd27a}#dfb .dfbSt{color:#f0a040;letter-spacing:.06em}#dfb .dfbDim{color:#6a4a2a}
#dfb .dfbBars{display:grid;grid-template-columns:auto 1fr auto;gap:3px 8px;align-items:center;font-size:13px;margin:0 0 10px}
#dfb .dfbBar{height:8px;background:#1c120a;box-shadow:inset 0 0 0 1px #4a3018}#dfb .dfbBar i{display:block;height:100%;background:#e8923f}
#dfb .dfbList{display:flex;flex-direction:column;gap:8px;max-height:min(46vh,420px);overflow:auto;padding-right:4px}
#dfb .dfbOne{padding:8px 10px;background:rgba(255,255,255,.04);box-shadow:inset 0 0 0 1px rgba(232,146,63,.25)}
#dfb .dfbOne .dfbHead{display:flex;justify-content:space-between;gap:8px;font-size:14px;opacity:.9}
#dfb .dfbOne .dfbHead .dfbSt,#dfb .dfbOne .dfbHead .dfbDim{font-size:17px}
#dfb .dfbOne .dfbTxt{margin-top:4px;font-size:15px;line-height:1.4;white-space:pre-wrap;overflow-wrap:anywhere}
#dfb .dfbTest{color:#9fc07a}
#dfb .dfbNone{opacity:.7;font-size:14px;margin:8px 0}
#dfb input{font:inherit;font-size:15px;width:100%;box-sizing:border-box;padding:8px;margin:8px 0;background:#1c120a;color:#f4e6c8;border:1px solid #6a4a2a}
`;document.head.appendChild(css);}

// ================================================================ the demo
if(DMO){
  document.documentElement.classList.add('dmoInDemo');try{document.title='Hollow Acre (demo)';}catch(e){}
  const T={played:+dmoGet(DMO_K.played)||0,last:performance.now(),input:Date.now(),saved:0,warned:dmoGet(DMO_K.warned)||'',over:false};
  const left=()=>Math.max(0,DMO.limit-T.played);
  // anything the player does keeps the clock going (a pad is checked on each tick)
  for(const t of ['keydown','pointerdown','pointermove','wheel','touchstart'])addEventListener(t,()=>{T.input=Date.now();},{capture:true,passive:true});
  const padBusy=()=>{try{for(const p of (navigator.getGamepads?navigator.getGamepads():[])){if(!p)continue;if(p.buttons&&[...p.buttons].some(b=>b&&b.pressed))return true;
      if(p.axes&&[...p.axes].some(a=>Math.abs(a)>.35))return true;}}catch(e){}return false;};
  const counts=()=>{if(document.hidden||T.over)return false;const t=$('title');if(t&&!t.hidden)return false;if(S.mode==='title'||S.mode==='dead')return false;
    const story=S.mode==='cine'||S.mode==='scene'||S.mode==='scare'||S.mode==='ritual';
    return story||Date.now()-T.input<120000;};
  const save=()=>dmoSet(DMO_K.played,T.played.toFixed(1));
  addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
  // the quiet note at 10 and at 2 minutes left (once each)
  let noteT=null;
  function note(head,sub){let el=$('dmoNote');if(!el){el=document.createElement('div');el.id='dmoNote';el.setAttribute('role','status');document.body.appendChild(el);}
    el.innerHTML='<b></b><span></span>';el.firstChild.textContent=head;el.lastChild.textContent=sub;
    // just under the day's objective at the top, when it's showing, so the note never covers it
    let y=14;try{const c=$('hudC');if(c){const r=c.getBoundingClientRect();if(r.height>0&&r.bottom<innerHeight/3)y=Math.round(r.bottom)+10;}}catch(e){}el.style.top=y+'px';
    requestAnimationFrame(()=>el.classList.add('on'));
    clearTimeout(noteT);noteT=setTimeout(()=>el.classList.remove('on'),8000);}
  function warn(){const l=left();
    const has=k=>T.warned.split(',').includes(k),mark=k=>{T.warned+=k+',';dmoSet(DMO_K.warned,T.warned);};
    if(l<=600&&!has('10')){mark('10');if(l>150)note('10 minutes of the demo left','The demo ends after an hour and a half of play.');}
    if(l<=120&&!has('2')){mark('2');note('2 minutes of the demo left','Thanks for playing. The valley waits for you in the full game.');}}
  // the end: save, fade out, and the demo's page shows the thank-you screen
  function end(){if(T.over)return;T.over=true;T.played=DMO.limit;save();dmoSet(DMO_K.end,Date.now());try{dmoSet(DMO_K.build,BUILD_ID);}catch(e){}
    try{flushSave();}catch(e){}
    const f=document.createElement('div');f.id='dmoFade';f.textContent='That’s the end of the demo.';document.body.appendChild(f);requestAnimationFrame(()=>f.classList.add('on'));
    setTimeout(()=>{try{S.paused=true;}catch(e){}try{A.ctx&&A.ctx.suspend&&A.ctx.suspend();}catch(e){}},1700);
    setTimeout(()=>{try{location.reload();}catch(e){}},3600);}
  // the time left: at the top of Settings (every group), and on the title screen
  function setLine(){const B=$('bagBody');if(!B||!B.querySelector('#s7G'))return;let el=B.querySelector('#dmo7');
    if(!el){el=document.createElement('div');el.id='dmo7';el.innerHTML='<span>Demo: play time left</span><b></b>';B.insertBefore(el,B.firstChild);}
    const s=dmoClock(left()),b=el.lastChild;if(b.textContent!==s)b.textContent=s;}
  if(typeof set7Render==='function'){const _r=set7Render;set7Render=function(){const r=_r.apply(this,arguments);try{setLine();}catch(e){}return r;};}
  function badge(){const t=$('title');if(!t||t.hidden)return;let el=$('dmoBadge');
    if(!el){const after=t.querySelector('.tag')||t.querySelector('.kicker');if(!after)return;el=document.createElement('div');el.id='dmoBadge';after.after(el);}
    const s=T.played<1?'Demo · '+dmoWords(DMO.limit)+' of play':'Demo · '+dmoWords(left())+' of play left';if(el.textContent!==s)el.textContent=s;}
  // the clock: once a second, a few lines of work; the page is written only when something shown changes
  setInterval(()=>{const now=performance.now(),dt=Math.min(3,(now-T.last)/1000);T.last=now;if(T.over)return;
    if(padBusy())T.input=Date.now();
    if(counts()){T.played+=dt;if(now-T.saved>5000){T.saved=now;save();}}
    try{warn();badge();if(typeof set7Open==='function'&&set7Open())setLine();}catch(e){}
    if(T.played>=DMO.limit)end();},1000);
  badge();
  // no account log-in in the demo (its farm would be uploaded over the full game's)
  if(typeof cloudSoon==='function')cloudSoon=function(){};
  window.__demo={left,get played(){return T.played;},set played(v){T.played=+v||0;},get input(){return T.input;},set input(v){T.input=v;},counts,end};   // (for the tests)
}

// ================================================================ the owner's Demo feedback page (the full game only)
const DFB={owner:'2ea2ab1c683d6fd21fdcfb9a40563d4d53dc827cd5c402cb7ab931af1fb76be1',d:'hollow-acre/demo-feedback',keyLS:'hollowDemoFbOwner',seenLS:'hollowDemoFbSeen'};
const dfbIsOwner=()=>!DMO&&typeof profPerk==='function'&&profPerk(typeof acctMe==='function'&&acctMe(),'gifts');
const dfbPow=(b,e,m)=>{let r=1n;b%=m;while(e>0n){if(e&1n)r=r*b%m;b=b*b%m;e>>=1n;}return r;};
function dfbLift(xh){if(!/^[0-9a-f]{64}$/.test(xh||''))return null;const p=CLSK.p,x=BigInt('0x'+xh);if(x>=p)return null;const c=clMod(x*x*x+7n);let y=dfbPow(c,(p+1n)/4n,p);
  if(clMod(y*y)!==c)return null;if(y&1n)y=p-y;return [x,y];}
function dfbMul(k,B){let R=[0n,1n,0n],A=[B[0],B[1],1n];while(k>0n){if(k&1n)R=clAdd(R,A);A=clDbl(A);k>>=1n;}const zi=clInv(R[2]);return [clMod(R[0]*zi*zi),clMod(R[1]*zi*zi*zi)];}
// the key: the code, stretched (PBKDF2, 200,000 rounds); right only if it makes the public key the demo seals the ratings to
async function dfbDerive(code){const c=String(code||'').replace(/\s+/g,'').toLowerCase();if(!c)return null;
  const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(c),'PBKDF2',false,['deriveBits']);
  const bits=new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode('hollow-acre/demo-feedback/owner/v1'),iterations:200000,hash:'SHA-256'},base,256));
  const d=clMod(clB2n(bits),CLSK.n);if(!d)return null;return clHex(clN2b(clMul(d)[0]))===DFB.owner?clHex(bits):null;}
const dfbKey=()=>{const k=dmoGet(DFB.keyLS);return k&&/^[0-9a-f]{64}$/.test(k)?k:null;};
async function dfbOpen(dHex,ev){const P=dfbLift(ev.pubkey);const c=String(ev.content||'');if(!P||!c.startsWith('v1:'))return null;
  const s=dfbMul(clMod(clB2n(clUnhex(dHex)),CLSK.n),P)[0];
  const key=await crypto.subtle.importKey('raw',await clSha(clCat(clN2b(s),new TextEncoder().encode('hollow-acre/demo-feedback/v1'))),'AES-GCM',false,['decrypt']);
  const raw=clUnb64(c.slice(3));const o=JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:raw.slice(0,12)},key,raw.slice(12))));
  const stars=Math.round(+o.stars);if(!(stars>=1&&stars<=5))return null;
  return {at:ev.created_at,stars,test:!!o.test,text:String(o.text||'').slice(0,1000),mins:Math.max(0,Math.round(+o.mins||0)),where:String(o.where||'').slice(0,20),dev:String(o.dev||'').slice(0,12),build:String(o.build||'').slice(0,20)};}
function dfbSeen(){try{return JSON.parse(dmoGet(DFB.seenLS)||'{}')||{};}catch(e){return {};}}
// every relay's answers (the newest per player: sending again replaces), opened with the key, added to what this device has kept
async function dfbFetch(){const sub='fb'+Math.random().toString(36).slice(2,8),got=new Map();let reached=0;
  await Promise.all(CLOUD.relays.map(u=>cloudRelay(u,[['REQ',sub,{kinds:[30078],'#d':[DFB.d],limit:1000}]],m=>{
    if(m[0]==='EVENT'&&m[1]===sub&&m[2]&&(m[2].tags||[]).some(t=>t[0]==='d'&&t[1]===DFB.d)){const e=m[2],o=got.get(e.pubkey);if(!o||o.created_at<e.created_at)got.set(e.pubkey,e);}
    else if(m[0]==='EOSE'&&m[1]===sub){reached++;return true;}},8000)));
  const key=dfbKey(),seen=dfbSeen();let fresh=0;
  for(const e of got.values()){const old=seen[e.pubkey];if(old&&old.at>=e.created_at)continue;try{const o=await dfbOpen(key,e);if(o){if(!old)fresh++;seen[e.pubkey]=o;}}catch(x){}}
  dmoSet(DFB.seenLS,JSON.stringify(seen));return {reached,fresh,total:Object.keys(seen).length};}
const dfbStars=n=>'<span class="dfbSt">'+'★'.repeat(n)+'</span><span class="dfbDim">'+'★'.repeat(5-n)+'</span>';
function dfbRender(box,status){const seen=Object.values(dfbSeen()).sort((a,b)=>b.at-a.at),real=seen.filter(o=>!o.test),n=real.length,avg=n?real.reduce((s,o)=>s+o.stars,0)/n:0;
  const cnt=[0,0,0,0,0,0];for(const o of real)cnt[o.stars]++;const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const when=t=>{try{return new Date(t*1000).toLocaleString([], {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});}catch(e){return '';}};
  box.innerHTML=`<div id="dfb"><h3>Demo feedback</h3>
    ${n?`<div class="dfbSum"><span class="dfbAvg">${avg.toFixed(1)}</span>${dfbStars(Math.round(avg))}<span>average from ${n} player${n===1?'':'s'}</span></div>
    <div class="dfbBars">${[5,4,3,2,1].map(s=>`<span>${s} ★</span><span class="dfbBar"><i style="width:${Math.round(cnt[s]/n*100)}%"></i></span><span>${cnt[s]}</span>`).join('')}</div>`
    :'<div class="dfbNone">No ratings from players yet. They arrive when a demo player reaches the end and presses Send.</div>'}
    ${seen.length?`<div class="dfbList">${seen.map(o=>`<div class="dfbOne"><div class="dfbHead"><span>${dfbStars(o.stars)}</span><span>${esc(when(o.at))}</span></div>
      <div class="dfbHead"><span>${o.test?'<span class="dfbTest">A test from this page · </span>':''}${o.mins} min played · ${esc(o.where==='gamejolt'?'Game Jolt':o.where||'web')} · ${esc(o.dev==='touch'?'phone or tablet':o.dev||'')}</span></div>
      ${o.text?`<div class="dfbTxt">${esc(o.text)}</div>`:''}</div>`).join('')}</div>`:''}
    <div class="msg" style="min-height:18px;margin-top:8px;font-size:13px;opacity:.8">${esc(status||'')}</div>
    <div class="acts"><button data-a="re">Refresh</button><button data-a="test" title="Sends a test rating through the relays, to check they keep it">Send a test</button><button data-a="back">Close</button></div></div>`;}
// a test rating, sealed and sent exactly like a demo player's (marked as a test, left out of the average): it shows the relays
// keep the ratings, from this device, without playing the demo for an hour and a half
async function dfbTest(){const te=s=>new TextEncoder().encode(s);let d;do{d=clMod(clB2n(crypto.getRandomValues(new Uint8Array(32))),CLSK.n);}while(!d);
  const pub=clHex(clN2b(clMul(d)[0])),s=dfbMul(d,dfbLift(DFB.owner))[0];
  const key=await crypto.subtle.importKey('raw',await clSha(clCat(clN2b(s),te('hollow-acre/demo-feedback/v1'))),'AES-GCM',false,['encrypt']);const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,te(JSON.stringify({v:1,test:true,stars:5,text:'A test from the Demo feedback page.',mins:0,where:DMO?'demo':'web',dev:'computer'}))));
  const ev={pubkey:pub,created_at:Math.floor(Date.now()/1000),kind:30078,tags:[['d',DFB.d],['t','hollow-acre-demo-feedback'],['alt','Hollow Acre demo feedback (encrypted for the game’s maker)']],content:'v1:'+clB64(clCat(iv,ct))};
  const id=await clSha(te(JSON.stringify([0,ev.pubkey,ev.created_at,ev.kind,ev.tags,ev.content])));ev.id=clHex(id);ev.sig=clHex(await clSign(id,clN2b(d)));
  return cloudPublish([ev]);}
// the page, in the profiles' panel; opened from Settings (Gameplay) or the Codes page
function dfbShow(from){if(!dfbIsOwner())return;const P=$('acctPanel');if(!P)return;const box=P.querySelector('.box');if(!box)return;P.hidden=false;
  const back=()=>{if(from==='codes')acctShow('perk',ACCT.cur,'list');else P.hidden=true;};
  const wire=()=>{const b=box.querySelector('[data-a=back]');b&&b.addEventListener('click',e=>{e.stopPropagation();back();});
    const r=box.querySelector('[data-a=re]');r&&r.addEventListener('click',e=>{e.stopPropagation();load();});
    const t=box.querySelector('[data-a=test]');t&&t.addEventListener('click',async e=>{e.stopPropagation();const m=box.querySelector('#dfb .msg');t.disabled=true;if(m)m.textContent='Sending a test…';
      let n=0;try{n=await dfbTest();}catch(x){console.warn(x);}if(!n){t.disabled=false;if(m)m.textContent='No relay kept the test. Check the connection and try again.';return;}
      if(m)m.textContent=n+' of '+CLOUD.relays.length+' relays kept the test. Looking for it…';setTimeout(load,1500);});};
  const load=async()=>{dfbRender(box,'Looking on '+CLOUD.relays.length+' relays…');wire();
    let st='';try{const r=await dfbFetch();st=r.reached?`${r.reached} of ${CLOUD.relays.length} relays answered. ${r.fresh?r.fresh+' new.':'Nothing new.'}`:'No relay answered. Check the connection and press Refresh.';}catch(e){st='Couldn’t look: '+e.message;}
    if(P.hidden||!box.querySelector('#dfb'))return;dfbRender(box,st);wire();};
  if(dfbKey()){load();return;}
  // the first time on a device: the code once more (it's never kept, only the key made from it)
  box.innerHTML=`<div id="dfb"><h3>Demo feedback</h3><div style="font-size:14px;line-height:1.4">Type your code once more to open the ratings on this device.</div>
    <input id="dfbCode" maxlength="32" autocomplete="off" autocapitalize="off" spellcheck="false"><div class="msg" style="min-height:18px;font-size:13px"></div>
    <div class="acts"><button data-a="ok">Open</button><button data-a="back">Close</button></div></div>`;
  const inp=box.querySelector('#dfbCode'),msg=t=>{box.querySelector('.msg').textContent=t;};['keydown','keyup','keypress'].forEach(t=>inp.addEventListener(t,e=>e.stopPropagation()));
  const go=async()=>{msg('Opening…');const k=await dfbDerive(inp.value).catch(()=>null);if(!k){msg('That code doesn’t open the ratings.');return;}dmoSet(DFB.keyLS,k);load();};
  box.querySelector('[data-a=ok]').addEventListener('click',e=>{e.stopPropagation();go();});inp.addEventListener('keydown',e=>{if(e.key==='Enter')go();});
  box.querySelector('[data-a=back]').addEventListener('click',e=>{e.stopPropagation();back();});inp.focus();}
if(!DMO){
  // the Codes page: typing the owner's code also makes the key on this device, and the page gets a Demo feedback button
  if(typeof acctShow==='function'){const _as=acctShow;acctShow=function(view){const r=_as.apply(this,arguments);
    try{if(view==='perk'){const P=$('acctPanel'),inp=$('acctPerk'),ok=P&&P.querySelector('[data-a=ok]');
        const grab=()=>{const v=inp&&inp.value;if(v&&typeof perkOf==='function'&&perkOf(v)==='gifts'&&!dfbKey())dfbDerive(v).then(k=>{if(k)dmoSet(DFB.keyLS,k);}).catch(()=>{});};
        if(ok)ok.addEventListener('click',grab,true);if(inp)inp.addEventListener('keydown',e=>{if(e.key==='Enter')grab();},true);
        const acts=P&&P.querySelector('.acts');if(acts&&dfbIsOwner()&&!acts.querySelector('[data-a=dfb]')){const b=document.createElement('button');b.dataset.a='dfb';b.textContent='Demo feedback';
          acts.insertBefore(b,acts.querySelector('[data-a=back]'));b.addEventListener('click',e=>{e.stopPropagation();dfbShow('codes');});}}}catch(e){console.warn(e);}
    return r;};}
  // Settings, Gameplay: a Demo feedback row for the owner
  if(typeof set7Rows==='function'){const _sr=set7Rows;set7Rows=function(g){const R=_sr.apply(this,arguments);
    try{if(g==='gameplay'&&dfbIsOwner()){const i=R.findIndex(r=>r.type==='button'&&/^Reset/.test(r.label));R.splice(i<0?R.length:i,0,{type:'button',label:'Demo feedback',sub:'The demo’s star ratings and notes (only you see this)',act:()=>dfbShow('settings')});}}catch(e){}
    return R;};}
}
