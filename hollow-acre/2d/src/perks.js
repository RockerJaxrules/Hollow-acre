/* ================= codes: the Profiles screen has a Codes button (and each profile's own page has one too).
   The right code turns on unlimited gifts for that profile: give anyone as many gifts as you like, every day (no once-a-day,
   no two-a-week). The perk is kept with the profile and in its farm's save, so it goes along in a transfer code and to a
   friend's farm (the host doesn't get it). ================= */
const perkHash=(str,seed=0)=>{let h1=0xdeadbeef^seed,h2=0x41c6ce57^seed;for(let i=0,ch;i<str.length;i++){ch=str.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677);}
  h1=Math.imul(h1^(h1>>>16),2246822507);h1^=Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507);h2^=Math.imul(h1^(h1>>>13),3266489909);return (4294967296*(2097151&h2)+(h1>>>0)).toString(36);};
const PERK_CODES={[perkHash('jaxon5')]:'gifts'};   // codes are checked without caring about capitals or spaces
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
  if(view==='perk'){const p=ACCT.list.find(q=>q.id===arg);if(!p)return _as('list');const from=arguments[2]||'more';const box=$('acctPanel').querySelector('.box');$('acctPanel').hidden=false;
    box.innerHTML=`<h3>Codes</h3>Type a code for ${acctEsc(p.name)}.${profPerk(p,'gifts')?'<div style="margin:6px 0;color:#b8e07a;font-size:13px">Unlimited gifts: on</div>':''}<input id="acctPerk" maxlength="32" autocomplete="off" autocapitalize="off" spellcheck="false"><div class="acts"><button data-a="ok">Use code</button><button data-a="back">Back</button></div><div class="msg"></div>`;
    const msg=t=>{box.querySelector('.msg').textContent=t;};const inp=$('acctPerk');['keydown','keyup','keypress'].forEach(t=>inp.addEventListener(t,e=>e.stopPropagation()));
    const go=()=>{const k=perkOf(inp.value);if(!k){msg('That code doesn’t do anything.');return;}if(profPerk(p,k)){msg('Already on: unlimited gifts, every day.');return;}
      perkGrant(p,k);msg(`Code accepted. Unlimited gifts are on for ${p.name}: give anyone as many as you like, every day.`);};
    box.querySelector('[data-a=ok]').addEventListener('click',go);inp.addEventListener('keydown',e=>{if(e.key==='Enter')go();});
    box.querySelector('[data-a=back]').addEventListener('click',()=>from==='list'?acctShow('list'):acctShow('more',p.id));inp.focus();return;}
  const r=_as.apply(this,arguments);
  // the Profiles screen itself has a Codes button (for the profile you're playing), and marks a profile that has unlimited gifts
  if(view==='list'){const box=$('acctPanel').querySelector('.box');const acts=box&&box.querySelector('.acts');
    if(acts){const b=document.createElement('button');b.dataset.a='codes';b.textContent='Codes';acts.insertBefore(b,acts.firstChild);b.addEventListener('click',e=>{e.stopPropagation();acctShow('perk',ACCT.cur,'list');});}
    box&&box.querySelectorAll('.row').forEach(r=>{const p=ACCT.list.find(q=>q.id===r.dataset.id);const sm=r.querySelector('.who small');if(p&&sm&&profPerk(p,'gifts'))sm.textContent+=' · unlimited gifts';});}
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
