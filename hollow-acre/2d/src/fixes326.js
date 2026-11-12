/* ================= t326-t329 the owner's batch: a code that makes the business side free, the tractor, the hands' seed box, and
   seeds you can find.
   - CODE Jaxon04191 (the T console): staff wages, shares, everything in the farm book and everything at the land office cost
     nothing. Type it again to turn it off. It stays on in the save.
   - THE TRACTOR: the farm book's Tractor page now sells it (and the drill and reaper) right there, so nobody has to find
     Pruitt's garage first; and a farmhand who isn't the host can buy it too: the host's farm records it (before, the host's
     next snapshot took it straight back off them).
   - THE SEED BOX: Old Merritt picked one kind of seed at dawn and stopped when that kind ran out, so a box with five kinds sowed
     one. Now when a kind runs out he reaches for the next, the kind there's most of, and only kinds in season once the year
     turns. Seed a farmhand puts in the box reaches the host's box too.
   - SEEDS: barley, hops and grapes were only at Bell's Feed & Stock, at the bottom of a long list. Coyle's store sells them
     too now, and both shops list every seed together, at the top. ================= */
// ---------------------------------------------------------------- 1. the code
CONSOLE_CODES[perkHash('jaxon04191')]='free';
const free6=()=>!!(S&&S.free6);
if(typeof PERSONAL!=='undefined'&&!PERSONAL.includes('free6'))PERSONAL.push('free6');
const F6_W=[];   // [array of people, original wages]
for(const A of [typeof EMP_HANDS!=='undefined'?EMP_HANDS:null,typeof BIZ_HIRE!=='undefined'?BIZ_HIRE:null])if(A)F6_W.push([A,A.map(h=>h.wage)]);
function f6Apply(){const on=free6();for(const [A,w] of F6_W)A.forEach((h,i)=>h.wage=on?0:w[i]);}
{const _cr=consoleRun;consoleRun=function(v){const k=CONSOLE_CODES[perkHash(String(v||'').replace(/\s+/g,'').toLowerCase())];
  if(k!=='free')return _cr.apply(this,arguments);
  S.free6=!S.free6;f6Apply();SFX.coin&&SFX.coin();
  if(S.free6){let forgiven=0;try{if(typeof empHost==='function'&&empHost()){const E=EMP();forgiven=E.loans.length;E.loans=[];}}catch(e){}
    toast('The ledgers are yours. Staff work for nothing, shares and deeds cost nothing, and the farm book is free.'+(forgiven?' Abernathy tears up the loan papers.':''),4.2);}
  else toast('The ledgers go back to the way they were.',2.6);
  try{updateHud&&updateHud();saveGame(true);}catch(e){}return true;};}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);try{f6Apply();}catch(e){}return r;};}
f6Apply();
// shop rows: the land office and the tractor, drill and reaper
{const _r=vendors.land.rows;vendors.land.rows=()=>{const r=_r();return free6()?r.map(q=>q&&q.price?Object.assign({},q,{price:0}):q):r;};}
const F6_FARMBOOK=['tractor','drill','reaper'];
{const _r=vendors.hollis.rows;vendors.hollis.rows=()=>{const r=_r();return free6()?r.map(q=>q&&q.price&&F6_FARMBOOK.includes(q.k)?Object.assign({},q,{price:0}):q):r;};}
// the ledger pages (the farm book, shares, your shop, your staff): while you click a button on one, the purse can't run dry,
// and whatever the click spent is given back the moment it's done (whatever it earned, you keep)
const F6={b:0,orig:0,t:0};
function f6Start(e){if(!free6()||F6.b)return;const N=$('noteText');if(!N||!N.querySelector('.bzled')||!N.contains(e.target))return;
  if(!(e.target.closest&&e.target.closest('button')))return;F6.b=1e7;F6.orig=S.coins;S.coins+=F6.b;F6.t=setTimeout(f6End,0);}
function f6End(){if(!F6.b)return;clearTimeout(F6.t);const got=S.coins-(F6.orig+F6.b);S.coins=F6.orig+Math.max(0,got);F6.b=0;
  try{updateHud&&updateHud();const p=document.querySelector('#noteText .bzpurse');if(p)p.textContent=S.coins+' coins';}catch(e){}}
addEventListener('click',f6Start,true);addEventListener('click',f6End,false);
// the books say so
{const _no=openNote;openNote=function(h){if(free6()&&typeof h==='string'&&h.includes('bzled')&&!h.includes('f6tag'))
    h=h.replace(/(<h3>[^<]*)/,'$1<span class="f6tag">free</span>');return _no.apply(this,[h].concat([].slice.call(arguments,1)));};}
{const css=document.createElement('style');css.textContent='#noteText .f6tag{display:inline-block;margin-left:8px;padding:0 5px;font-size:11px;color:#2a1a0e;background:#e8b04a;border-radius:2px;vertical-align:middle}';document.head.appendChild(css);}

// ---------------------------------------------------------------- 2. the tractor
// a farmhand's purchase is sent to the host, whose farm keeps the book
const empGuest=()=>typeof HOST!=='undefined'&&HOST.role==='guest';
function empRelay(k,extra){if(!empGuest())return;try{CO.room.emit('empbuy',Object.assign({k,by:(typeof mlMe==='function'?mlMe():NAME&&NAME())||''},extra||{}),HOST.hostPeer);}catch(e){}}
{const _r=vendors.hollis.rows;vendors.hollis.rows=()=>_r().map(q=>{if(!q||!F6_FARMBOOK.includes(q.k)||q._f6)return q;const b=q.buy;
  return Object.assign({},q,{_f6:1,buy(){const r=b.apply(this,arguments);empRelay(q.k);return r;}});});}
function empApply(d){const E=EMP(),k=String(d.k||'');
  if(k==='tractor'){if(E.tractor)return false;E.tractor={x:EMP_PARK.x,z:EMP_PARK.z,dir:'E',drill:false,reaper:false};try{trPark();}catch(e){}return true;}
  if(k==='drill'||k==='reaper'){if(!E.tractor||E.tractor[k])return false;E.tractor[k]=true;return true;}
  if(k==='box'){const add=d.add&&typeof d.add==='object'?d.add:{};const box=handBox();let any=false;
    for(const [s,n] of Object.entries(add)){if(!SEEDS[s])continue;const m=Math.max(0,Math.min(999,n|0));if(m){box.seeds[s]=(box.seeds[s]||0)+m;any=true;}}return any;}
  return false;}
{const _hw=hostWire;hostWire=function(){const r0=_hw.apply(this,arguments);const r=CO.room;if(!r||!r.on)return r0;
  HOST.off.push(r.on('empbuy',m=>{if(!m||m.isMe||HOST.role!=='host'||!m.data)return;try{const d=m.data,by=clean(d.by||'')||'A farmhand';
    if(empApply(d)){try{saveGame(true);}catch(e){}if(d.k!=='box')toast(`${by} bought ${d.k==='tractor'?'Hollis’s old tractor':'the '+(d.k==='drill'?'seed drill':'reaper')} for the farm.`,3);}}catch(e){}}));
  return r0;};}
// the farm book sells it on its own page
const F6_TR={tractor:['Hollis’s old tractor',()=>TRACTOR_PRICE],drill:['The seed drill',()=>DRILL_PRICE],reaper:['The reaper',()=>REAPER_PRICE]};
{const _eo=empOpen;empOpen=function(tab){const r=_eo.apply(this,arguments);try{if((tab||'land')!=='tractor')return r;const N=$('noteText');if(!N)return r;
    const rows=vendors.hollis.rows().filter(q=>q&&F6_FARMBOOK.includes(q.k)&&q.can);if(!rows.length)return r;
    const box=document.createElement('div');box.className='f6buy';
    box.innerHTML='<h4>Buy from Pruitt’s garage</h4>'+rows.map(q=>bizRow(`<b>${F6_TR[q.k][0]}</b><small>${q.desc}</small>`,'',`<button data-f6tr="${q.k}" ${S.coins<q.price?'class="nope"':''}>${q.price?q.price+' coins':'Free'}</button>`)).join('');
    const h=N.querySelector('h4,p.bzs');(h&&h.parentNode===N?N.insertBefore(box,h.nextSibling):N.appendChild(box));
    box.querySelectorAll('[data-f6tr]').forEach(b=>b.onclick=()=>{const q=vendors.hollis.rows().find(x=>x.k===b.dataset.f6tr);if(!q||!q.can)return;
      if(S.coins<q.price){SFX.deny&&SFX.deny();toast(`That’s ${q.price} coins. You have ${S.coins}.`,2.2);return;}
      S.coins-=q.price;SFX.coin&&SFX.coin();q.buy();updateHud&&updateHud();setTimeout(()=>empOpen('tractor'),0);});}catch(e){console.warn('farm book tractor',e);}return r;};}
{const css=document.createElement('style');css.textContent='#noteText .f6buy{margin:6px 0 10px}#noteText .f6buy h4{margin:4px 0}';document.head.appendChild(css);}

// ---------------------------------------------------------------- 3. the seed box
// when the kind he reached for has run out, Old Merritt takes the kind there's most of (in season, once the year turns)
{const _es=empSow;empSow=function(t,type){if(type&&S.seeds[type]>0)return _es(t,type);
  let best=null,bn=0;for(const k of Object.keys(S.seeds||{})){const n=S.seeds[k]|0;if(n<=0||!SEEDS[k])continue;
    const ok=t.gh||typeof cropInSeason!=='function'||cropInSeason(k);if(!ok)continue;if(n>bn){bn=n;best=k;}}
  return best?_es(t,best):false;};}
// a farmhand's seed goes into the host's box (theirs is only a copy)
{const _ho=handBoxOpen;handBoxOpen=function(){const r=_ho.apply(this,arguments);try{if(!empGuest())return r;const N=$('noteText');if(!N)return r;
    N.querySelectorAll('[data-put]').forEach(b=>{const o=b.onclick;b.onclick=function(){const [k,n]=b.dataset.put.split('|');const m=n==='all'?(S.seeds[k]||0):Math.min(5,S.seeds[k]||0);
      const res=o&&o.apply(this,arguments);if(m>0)empRelay('box',{add:{[k]:m}});return res;};});}catch(e){}return r;};}

// ---------------------------------------------------------------- 4. seeds you can find
// Coyle's sells the brewing seeds too, and both shops list every seed together at the top
if(typeof CROP2!=='undefined'){const _r=vendors.mae.rows;vendors.mae.rows=()=>{const r=_r();
  for(const [id,C] of Object.entries(CROP2)){if(r.some(q=>q&&q.k==='seed_'+id))continue;
    r.push({k:'seed_'+id,name:`${C.name} seed ×5`,desc:`${C.name}: grows in ${C.grow} hours of care${C.regrow?', and comes back after every picking':''}. Ships for about ${C.sell}.${['barley','hops','grapes','potato'].includes(id)?' Good for brewing.':''}`,price:C.seed,can:true,buy(){S.seeds[id]=(S.seeds[id]||0)+5;updateHud&&updateHud();}});}
  return r;};}
const f6Seed=q=>q&&(/^seed_?/.test(q.k)||q.k==='seedc'||(SEEDS[q.k]&&/seed/i.test(q.name||'')));
for(const v of ['mae','v_feed']){if(!vendors[v])continue;const _r=vendors[v].rows;vendors[v].rows=()=>{const r=_r();const s=r.filter(f6Seed),o=r.filter(q=>!f6Seed(q));return s.concat(o);};}
// a save made in the middle of a free click never keeps the borrowed coins
{const _sg=saveGame;saveGame=function(){if(F6.b){S.coins-=F6.b;try{return _sg.apply(this,arguments);}finally{S.coins+=F6.b;}}return _sg.apply(this,arguments);};}
