// t337 story polish test: chapter cards, the end of Chapter One, candles, birthdays, the true ending's card, the morning after,
// and the title screen after finishing. PASS/FAIL lines. Usage: node t337/story_test.js [build.html]
const {chromium}=require('playwright');
const URL='http://localhost:8766/'+(process.argv[2]||'hollow-acre-2d-s337.html')+'?v='+Date.now();
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:720},serviceWorkers:'block'});const pg=await ctx.newPage();
  const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.route('**/fonts.googleapis.com/**',r=>r.abort());await pg.route(/nostr|relay|degmods/,r=>r.abort());await pg.route('**/version.json*',r=>r.abort());
  const P=(n,ok,x)=>console.log((ok?'PASS ':'FAIL ')+n+(x!==undefined?'  '+x:''));
  const ev=c=>pg.evaluate(c=>{try{return JSON.stringify(__game.ev(c))}catch(e){return JSON.stringify('ERR '+e.message)}},c).then(r=>{try{return JSON.parse(r)}catch(e){return r}});
  const W=ms=>pg.waitForTimeout(ms);
  const boot=async()=>{await pg.goto(URL);await pg.waitForFunction(()=>window.__game&&__game.S.mode==='title',null,{timeout:120000});
    await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.waitForFunction(()=>window.__game&&__game.S.mode==='title',null,{timeout:120000});
    await pg.evaluate(()=>document.getElementById('begin').click());await W(400);await pg.evaluate(()=>{const b=document.getElementById('cGo');b&&b.click();});
    for(let i=0;i<20;i++){await pg.evaluate(()=>{try{__game.skip()}catch(e){}});await W(250);}await W(1500);};
  await boot();
  // count how often the chapter card comes up
  await pg.evaluate(()=>{window.__cards=[];new MutationObserver(()=>{const c=document.getElementById('chCard');if(c&&c.classList.contains('on'))__cards.push(c.querySelector('.k').textContent+'|'+performance.now());}).observe(document.getElementById('chCard'),{attributes:true});});
  // ---- the candles, the honest way
  await ev("S.tut&&(S.tut.off=true);S.readLetter=true;S.foundCabin=true;S.everTilled=S.everPlanted=S.everWatered=true;S.shipped=1;S.q.hollis=1;S.carFixed=true;S.looped=true;S.coins=5;S.candles=0;for(const b of SAGA)if(b.gate==='c1')S.saga.done[b.id]=1;S.hour=11;1");
  await W(300);let o=await ev("objective()");P('candle goal tells how to get there',o&&o[0]==='Candles'&&/Hale may spare one/.test(o[1])&&/more coin/.test(o[1]),o&&o[1]);
  await ev("(()=>{const n=npcById('hale');P.x=n.x;P.z=n.z+.8;talk(n);return 1})()");await W(1500);
  for(let i=0;i<60;i++){if(!(await ev('!!STG')))break;await ev('stgNext();1');await W(300);}await W(1500);
  await ev("(()=>{if(!$('talk').hidden){$('talk').hidden=true;S.paused=false;}return 1})()");P('Hale spares the first candle',await ev("S.candles")===1&&await ev("!!S.c37hale"));
  o=await ev("objective()");P('the goal then asks only for the rest',o&&o[0]==='Candles'&&!/Hale may spare/.test(o[1]),o&&o[1]);
  // ---- the end of Chapter One
  await ev("S.mode='play';S.paused=false;S.candles=0;S.hour=22;altars.forEach(a=>a.lit=true);P.x=altars[0].x;P.z=altars[0].z+1;startRitualEnd();1");await W(1200);
  P('the climax hides the HUD',await ev("$('hud').style.visibility==='hidden'||$('hud').hidden"));
  const hp=await ev("[H.x-P.x,H.z-P.z]");P('the Hollow stands in front, in the light',Array.isArray(hp)&&Math.hypot(hp[0],hp[1])>1.4,JSON.stringify(hp));
  await pg.waitForFunction(()=>!document.getElementById('end').hidden,null,{timeout:15000}).catch(()=>{});await W(400);
  const e1=await ev("[$('end').classList.contains('st37ch1'),getComputedStyle($('again')).display,$('keepFarming').textContent,$('eDays').nextElementSibling.textContent,$('eDays').textContent,[...$('end').querySelectorAll('.small')].map(e=>getComputedStyle(e).display).join(',')]");
  P('Chapter One ends as a chapter: one Continue, no New game, no credit line',e1[0]&&e1[1]==='none'&&e1[2]==='Continue'&&!/block/.test(e1[5]),JSON.stringify(e1));
  P('day count reads singular when it is one',(e1[4]==='1'&&e1[3]==='Day')||(e1[4]!=='1'&&e1[3]==='Days'),e1[4]+' '+e1[3]);
  await pg.screenshot({path:'t337/st_ch1end.png'});
  await pg.evaluate(()=>document.getElementById('keepFarming').click());await W(1200);
  // the sale slip (if any) goes first, then the card, then the Chapter Two note
  for(let i=0;i<40;i++){const s=await ev("[!$('saleSlip').hidden,!$('note').hidden,$('noteText').textContent.slice(0,40)]");if(s[0])await pg.evaluate(()=>{const b=[...document.querySelectorAll('#saleSlip button')].pop();b&&b.click();});if(s[1]&&/Chapter Two/.test(s[2]))break;await W(300);}
  const c2=await pg.evaluate(()=>__cards.filter(c=>/Two/.test(c)).length);const nt=await ev("!$('note').hidden&&/Chapter Two/.test($('noteText').textContent)");
  P('Chapter Two card once, before its note',c2===1&&nt,'cards '+c2+' note '+nt);
  await ev("$('noteClose').click();1");await W(500);
  // ---- Chapter Two pacing: a cap of four a day
  await ev("S.st.c37={};S.st.c37[S.day]=4;1");o=await ev("objective()");P('capped day says rest',o&&o[0]==='Rest',o&&o.join(' | '));
  await ev("S.st.c37[S.day]=0;1");
  P('Under the church waits for dark',await ev("!!SG.crypt.night"));
  P('the cold house and the drowned bell move to the last days',await ev("SG.cold.gate==='c3'&&SG.drowned.gate==='c3'"));
  // ---- Chapter Three's card: once, and gone before the next morning's note
  await ev("S.st.tithe=S.day+8;S.st.act=3;1");await W(2500);let c3=await pg.evaluate(()=>__cards.filter(c=>/Three/.test(c)).length);
  P('Chapter Three card fires',c3===1,c3);
  await ev("newDay('Day test.');1");await W(300);P('a new day clears the card',await ev("!$('chCard').classList.contains('on')"));
  await W(6000);c3=await pg.evaluate(()=>__cards.filter(c=>/Three/.test(c)).length);P('Chapter Three card only once',c3===1,c3);
  // ---- birthdays: not on the worst days, and only for people you know
  await ev("S.st.tithe=S.day+2;ui.toast.textContent='';1");await ev("toast('It’s Hollis’s birthday. A gift counts for a lot today.',3);1");await W(200);
  P('no birthday toast on a crisis day',!/birthday/.test(await ev("ui.toast.textContent")));
  await ev("S.st.tithe=S.day+8;S.friend=S.friend||{};S.friend.hollis=0;1");await ev("toast('It’s Hollis’s birthday. A gift counts for a lot today.',3);1");await W(200);
  P('no birthday toast for someone you have not met',!/birthday/.test(await ev("ui.toast.textContent")));
  await ev("S.friend.hollis=10;1");for(let i=0;i<20&&await ev('pl37Busy()');i++){await pg.evaluate(()=>{const b=[...document.querySelectorAll('#saleSlip button')].pop();b&&b.click();});await ev("if(!$('note').hidden)$('noteClose').click();1");await W(300);}await ev("toast('It’s Hollis’s birthday. A gift counts for a lot today.',3);1");for(let i=0;i<30&&!/birthday/.test(await ev("ui.toast.textContent"));i++)await W(250);  /* messages wait their turn now */
  P('birthday toast for a friend on an ordinary day',/birthday/.test(await ev("ui.toast.textContent")));
  P('the drawing notice shows the real date',/^FALL \d+$/.test(await ev("st37DrawDate()")),await ev("st37DrawDate()"));
  let ST37c=0;
  // ---- the true ending
  await ev("S.st.tithe=S.day;S.mode='play';S.paused=false;stEnding('door');1");await W(2500);
  for(let i=0;i<60;i++){const st=await ev("[!!STG,!$('scene').hidden,getComputedStyle($('credits2')).display,!!document.getElementById('end37')&&!$('end37').hidden,S.mode,!$('end').hidden]");if(i%4===0)console.log('  dbg end',JSON.stringify(st));if(st[3])break;
    if(st[2]==='block'){ST37c=(typeof ST37c==='number'?ST37c:0)+1;if(ST37c===4)await pg.screenshot({path:'t337/st_credits.png'});if(ST37c>5)await pg.evaluate(()=>document.getElementById('credits2').click());}
    else if(st[0])await ev('stgNext();1');else if(st[1])await pg.evaluate(()=>{const b=document.querySelector('#scene button');b&&b.click();});
    await W(700);}
  const ec=await ev("[!!document.getElementById('end37')&&!$('end37').hidden,$('end37')&&$('end37').textContent,$('end37')&&$('end37').querySelector('canvas').width]");
  P('the true ending holds an end card with the valley at dawn',ec[0]&&/Jaxon Charlton/.test(ec[1])&&/The Door Opens/.test(ec[1])&&ec[2]===160,String(ec[1]).slice(0,120));
  await pg.screenshot({path:'t337/st_endcard.png'});
  const sv=await pg.evaluate(()=>{const k=Object.keys(localStorage).find(k=>/^hollowSave1/.test(k)&&!/_morning/.test(k));const d=JSON.parse(localStorage.getItem(k)||'null');return d&&d.S&&d.S.st&&[d.S.st.done,d.S.st.epiPend37];});
  P('the save knows the story is over',sv&&sv[0]&&sv[1]===1,JSON.stringify(sv));
  await pg.evaluate(()=>document.getElementById('e37wake').click());await W(3500);
  for(let i=0;i<20;i++){const st=await ev("[!!STG,!$('saleSlip').hidden]");if(st[1])await pg.evaluate(()=>{const b=[...document.querySelectorAll('#saleSlip button')].pop();b&&b.click();});
    if(st[0]){if(i===3)await pg.screenshot({path:'t337/st_epilogue.png'});await ev('stgNext();1');}await W(600);}
  P('the morning after: Caitlyn came to the door',await ev("!!S.st.epi37"));
  // ---- the title after finishing
  await pg.reload();await pg.waitForFunction(()=>window.__game&&__game.S.mode==='title',null,{timeout:120000});await W(500);
  const tt=await pg.evaluate(()=>[document.querySelector('#title .kicker').textContent,document.querySelector('#title .tag').textContent]);
  P('the title screen knows you finished',/After the Tithe/.test(tt[0])&&/endings found/.test(tt[1]),tt.join(' | '));
  await pg.screenshot({path:'t337/st_title_after.png'});
  P('no page errors',errs.length===0,errs.slice(0,4).join(' | '));
  await b.close();})();
