/* ================= codes: the Profiles screen has a Codes button (and each profile's own page has one too).
   The right code turns on unlimited gifts for that profile: give anyone as many gifts as you like, every day (no once-a-day,
   no two-a-week). The perk is kept with the profile and in its farm's save, so it goes along in a transfer code and to a
   friend's farm (the host doesn't get it). ================= */
const perkHash=(str,seed=0)=>{let h1=0xdeadbeef^seed,h2=0x41c6ce57^seed;for(let i=0,ch;i<str.length;i++){ch=str.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677);}
  h1=Math.imul(h1^(h1>>>16),2246822507);h1^=Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507);h2^=Math.imul(h1^(h1>>>13),3266489909);return (4294967296*(2097151&h2)+(h1>>>0)).toString(36);};
const PERK_CODES={[perkHash('jaxon5')]:'gifts',[perkHash('jaxon6')]:'truepath',[perkHash('jaxon7')]:'truecheck',[perkHash('jaxon8')]:'safenight'};   // codes are checked without caring about capitals or spaces
const perkOf=code=>PERK_CODES[perkHash(String(code||'').replace(/\s+/g,'').toLowerCase())]||null;
const profPerk=(p,k)=>!!(p&&p.perks&&p.perks.includes(k));
const giftsUnlimited=()=>!!(S.perkGifts||profPerk(typeof acctMe==='function'&&acctMe(),'gifts'));
// the profile keeps it, and so does its farm's save (the one written to this device, and the game in play if it's this profile)
function perkGrant(p,k){p.perks=p.perks||[];if(!p.perks.includes(k))p.perks.push(k);acctStore();
  if(k!=='gifts')return;const ks=acctKeys(p.id);
  for(const key of [ks.save,ks.morning]){try{const d=JSON.parse(localStorage.getItem(key)||'null');if(d&&d.S){d.S.perkGifts=true;localStorage.setItem(key,JSON.stringify(d));}}catch(e){}}
  if(p.id===ACCT.cur){S.perkGifts=true;try{typeof flushSave==='function'&&flushSave();}catch(e){}}}
// the box on the profile's page
{const _as=acctShow;acctShow=function(view,arg){
  if(view==='perk'){const PERK_SAY={gifts:n=>`Code accepted. Unlimited gifts are on for ${n}: give anyone as many as you like, every day.`,
      truepath:n=>`Code accepted. Next time ${n} plays: 9 hearts with Maud and her fourth shard, 10 hearts with Agnes and Ruth’s ribbon, 10 hearts with Caitlyn, dating her, and Danny’s letter.`,
      truecheck:n=>`Code accepted. ${n}’s Journal now has a true ending checklist: what’s done, what’s left, and where to get it.`,
      safenight:n=>`Code accepted. On Tithe night the tall thing on Mill Road can’t take ${n}, the bed won’t let you sleep, and if the night runs out the door waits another night. The only way to the bad ending is to choose it.`};
    const p=ACCT.list.find(q=>q.id===arg);if(!p)return _as('list');const from=arguments[2]||'more';const box=$('acctPanel').querySelector('.box');$('acctPanel').hidden=false;
    box.innerHTML=`<h3>Codes</h3>Type a code for ${acctEsc(p.name)}.${profPerk(p,'gifts')?'<div style="margin:6px 0;color:#b8e07a;font-size:13px">Unlimited gifts: on</div>':''}${profPerk(p,'truepath')?'<div style="margin:6px 0;color:#b8e07a;font-size:13px">Jaxon 6: on</div>':''}${profPerk(p,'truecheck')?'<div style="margin:6px 0;color:#b8e07a;font-size:13px">Jaxon 7: on (true ending checklist in the Journal)</div>':''}${profPerk(p,'safenight')?'<div style="margin:6px 0;color:#b8e07a;font-size:13px">Jaxon 8: on (Tithe night can’t take you)</div>':''}<input id="acctPerk" maxlength="32" autocomplete="off" autocapitalize="off" spellcheck="false"><div class="acts"><button data-a="ok">Use code</button><button data-a="back">Back</button></div><div class="msg"></div>`;
    const msg=t=>{box.querySelector('.msg').textContent=t;};const inp=$('acctPerk');['keydown','keyup','keypress'].forEach(t=>inp.addEventListener(t,e=>e.stopPropagation()));
    const go=()=>{const k=perkOf(inp.value);if(!k){msg('That code doesn’t do anything.');return;}if(profPerk(p,k)){msg(k==='gifts'?'Already on: unlimited gifts, every day.':'Already on for this profile.');return;}
      perkGrant(p,k);msg(PERK_SAY[k](p.name));};
    box.querySelector('[data-a=ok]').addEventListener('click',go);inp.addEventListener('keydown',e=>{if(e.key==='Enter')go();});
    box.querySelector('[data-a=back]').addEventListener('click',()=>from==='list'?acctShow('list'):acctShow('more',p.id));inp.focus();return;}
  const r=_as.apply(this,arguments);
  // the Profiles screen itself has a Codes button (for the profile you're playing), and marks a profile that has unlimited gifts
  if(view==='list'){const box=$('acctPanel').querySelector('.box');const acts=box&&box.querySelector('.acts');
    if(acts){const b=document.createElement('button');b.dataset.a='codes';b.textContent='Codes';acts.insertBefore(b,acts.firstChild);b.addEventListener('click',e=>{e.stopPropagation();acctShow('perk',ACCT.cur,'list');});}
    box&&box.querySelectorAll('.row').forEach(r=>{const p=ACCT.list.find(q=>q.id===r.dataset.id);const sm=r.querySelector('.who small');if(p&&sm&&profPerk(p,'gifts'))sm.textContent+=' · unlimited gifts';if(p&&sm&&profPerk(p,'truepath'))sm.textContent+=' · Jaxon 6';if(p&&sm&&profPerk(p,'truecheck'))sm.textContent+=' · Jaxon 7';if(p&&sm&&profPerk(p,'safenight'))sm.textContent+=' · Jaxon 8';});}
  if(view==='more'){const p=ACCT.list.find(q=>q.id===arg);const box=$('acctPanel').querySelector('.box');const acts=box&&box.querySelector('.acts');
    if(p&&acts){const b=document.createElement('button');b.dataset.a='perk';b.textContent='Codes';const back=acts.querySelector('[data-a=back]');acts.insertBefore(b,back);b.addEventListener('click',()=>acctShow('perk',p.id));
      if(profPerk(p,'gifts')){const s=document.createElement('div');s.style.cssText='margin:6px 0;color:#b8e07a;font-size:13px';s.textContent='Unlimited gifts: on';acts.before(s);}}}
  return r;};}
// the Give button stays: every day, as often as you like (still not to the things standing in the dark at night)
{const _st=socialTalk;socialTalk=function(n){const r=_st.apply(this,arguments);try{if(giftsUnlimited()){const gb=$('talkGift');if(gb&&!isNight())gb.hidden=!giftKeys().length;}}catch(e){}return r;};}
{const _og=openGift;openGift=function(n){const r=_og.apply(this,arguments);try{if(giftsUnlimited()){const row=$('talk').querySelector('.giftrow');
    if(row)row.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{const gb=$('talkGift');if(gb&&!isNight()&&giftKeys().length)gb.hidden=false;},0)));}}catch(e){}return r;};}
// the perk is the farmer's own: on a friend's farm it comes along, and the host doesn't get it
if(typeof PERSONAL!=='undefined'&&!PERSONAL.includes('perkGifts'))PERSONAL.push('perkGifts');
// a profile that has it marks its farm, so a transfer code made from it carries the perk
if(profPerk(acctMe(),'gifts'))S.perkGifts=true;

// ---- Jaxon 6: the true ending's people, done. Applied once, the first time this profile plays after the code is entered:
//      Maud at 9 hearts with her fourth shard, Agnes at 10 with Ruth's ribbon, Caitlyn at 10 and dating, and Danny's letter.
//      Their heart scenes still play when you talk to them; nothing is given twice.
const TRUE_LORE=['Danny’s letter: the Tall Man is a door, and everyone it took is still inside holding it shut. If enough push at once it opens the other way.',
  'Agnes gave you Ruth’s ribbon to burn at the stones, so Ruth can leave.','Maud secretly cut a fourth piece of the seam and gave it to you. It might finish the thing, or feed it.'];
function perkTruePath(){S.friend=S.friend||{};const at=(id,n)=>{S.friend[id]=Math.max(S.friend[id]||0,n);};at('maud',900);at('agnes',1000);at('mae',1000);
  S.rom=S.rom||{};S.rom.mae=Object.assign(S.rom.mae||{},{dating:true,day:S.rom.mae&&S.rom.mae.day||S.day});
  S.keyItems=S.keyItems||[];for(const k of ['shard','ribbon'])if(!S.keyItems.includes(k))S.keyItems.push(k);
  S.lore=S.lore||[];for(const l of TRUE_LORE)if(!S.lore.includes(l))S.lore.push(l);
  S.perkTrue=true;try{updateHud&&updateHud();}catch(e){}
  setTimeout(()=>toast('Jaxon 6: Maud ♥9 and the fourth shard, Agnes ♥10 and Ruth’s ribbon, Caitlyn ♥10 and dating, Danny’s letter in your journal.',5),1200);}
{const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);if(S.mode==='play'&&!S.perkTrue&&S.readLetter&&profPerk(acctMe(),'truepath'))perkTruePath();};}
if(typeof PERSONAL!=='undefined'&&!PERSONAL.includes('perkTrue'))PERSONAL.push('perkTrue');

// ---- Jaxon 7: the true ending, checked off in the Journal. What's done, what's left, and where each piece comes from.
function trueCheckHtml(){const st=S.st||{},got=st.got||{},tick=b=>b?'<b style="color:#8fd06a">✓</b>':'<span style="opacity:.5">○</span>';
  const danny=(S.lore||[]).some(l=>l.startsWith('Danny’s letter'));const H=id=>typeof hearts==='function'?hearts(id):0;
  let n=0;const row=(ok,txt,hint)=>{if(ok)n++;return `<p>${tick(ok)} ${txt}${!ok&&hint?`<br><span class="jsub" style="display:block;margin-left:1.4em">${hint}</span>`:''}</p>`;};
  let h='<h4>The true ending · Jaxon 7</h4>';
  const set=Math.min(st.set||0,3);const left=[['dock','under the Black Lake dock (Otto’s ash rod)'],['tree','in the hollow tree at noon (steel axe)'],['bed','under your bed (steel pickaxe)']].filter(([k])=>!got[k]).map(m=>m[1]);
  h+=row(set>=3,`The three black stones on the Tithe House doorstep: ${set}/3`,
    !st.act||st.act<3?'The letter in your mailbox says where they are. It comes once Chapter Two’s places, things known and first two Ward bundles are done.':left.length?'Still to find: '+left.join('; ')+'.':'You have them. Set them at the Tithe House door (X: Set stones).');
  const wd=wardDone();
  h+=row(wd>=WARD.length,`The full Ward at the church ledger: ${wd}/${WARD.length}`,WARD.map(w=>S.ward[w.k]?`✓ ${w.name}`:`○ ${w.name}: `+w.need.map(r=>`${Math.min(wardHave(r),wardNeed(r))}/${wardNeed(r)} ${r[r.length-1]}`).join(', ')).join('<br>'));
  h+=row(stHas('shard'),'The fourth shard',`Maud Thorne gives it at 9 hearts (you have ${H('maud')}). Talk to her in the daytime once you’re there.`);
  h+=row(stHas('ribbon'),'Ruth’s ribbon',`Agnes Abernathy gives it at 10 hearts (you have ${H('agnes')}).`);
  const capped=typeof romDating==='function'&&!romDating('mae');
  h+=row(danny,'Danny’s letter',`Caitlyn gives it at 10 hearts (you have ${H('mae')}).${capped?' Past 8 hearts you need to be dating her: buy the bouquet at Bell’s Feed &amp; Stock and give it to her.':''}`);
  let night;if(st.done)night='The story is over on this farm.';else if(!st.tithe)night='Tithe night is set when the third stone goes on the step: seven days later.';
  else{const L=stLeft();night=L>0?`Tithe night is in ${L} day${L>1?'s':''}.`:'Tithe night is tonight. After the bell, walk to the Tithe House and press X: Open.';}
  h+=`<p style="margin-top:.6em"><b>${n}/5 done.</b> ${night}</p>`;
  if(n===5)h+='<p style="color:#8fd06a">Everything is ready. On Tithe night choose <b>Push the door open from this side</b>.</p>';
  if(safeNight())h+='<p class="jsub">Jaxon 8 is on: Tithe night can’t take you. The bad ending only happens if you choose to go in.</p>';
  return h;}
{const _oj=openJournal;openJournal=function(){const r=_oj.apply(this,arguments);try{if(!profPerk(acctMe(),'truecheck'))return r;const el=$('noteText');if(!el)return r;
  const ppl=[...el.querySelectorAll('h4')].find(x=>/People/i.test(x.textContent));const html=trueCheckHtml();if(ppl)ppl.insertAdjacentHTML('beforebegin',html);else el.insertAdjacentHTML('beforeend',html);}catch(e){}return r;};}

// ---- Jaxon 8: Tithe night can't end badly by itself. The tall thing on the Mill Road can't take you (its hand stops an inch away),
//      the bed won't let you sleep, the small hours don't take you, and if the night runs out the door waits one more night.
//      Choosing "Open the door and go in" is still yours to choose.
function safeNight(){return profPerk(typeof acctMe==='function'&&acctMe(),'safenight');}
{const _sl=sleep;sleep=function(){if(safeNight()&&S.st&&stTitheNight()&&isNight()&&S.mode==='play'){SFX.deny&&SFX.deny();
    toast('You lie down and your eyes won’t close. Something is holding them open, gently. Not tonight. Tonight you go to the door.',4.4,true);return;}return _sl.apply(this,arguments);};}
