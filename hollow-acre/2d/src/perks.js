/* ================= a gift for one player: Jaxon's farm, brought in with his own transfer code, can give as many gifts as he likes
   to anyone, every day (no once-a-day, no two-a-week). The code itself isn't kept here, only its fingerprint; entering it under
   Profiles > "Enter a transfer code" marks the farm that comes in, and the perk works while the farmer on it is called Jaxon. ================= */
const PERK_CODES=new Set(['1iffre3z46y.x9fboxq6xf']);
const perkHash=(str,seed=0)=>{let h1=0xdeadbeef^seed,h2=0x41c6ce57^seed;for(let i=0,ch;i<str.length;i++){ch=str.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677);}
  h1=Math.imul(h1^(h1>>>16),2246822507);h1^=Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507);h2^=Math.imul(h1^(h1>>>13),3266489909);return (4294967296*(2097151&h2)+(h1>>>0)).toString(36);};
const perkPrint=code=>perkHash(code)+'.'+perkHash(code,7);
// the code with anything stray pasted after its end (a letter on the next line) taken off
const perkClean=code=>{code=String(code||'').replace(/\s+/g,'');const m=/^(HA1Z?:[A-Za-z0-9+/]+=+)[A-Za-z0-9+/]{1,3}$/.exec(code);return m?m[1]:code;};
const giftsUnlimited=()=>{if(!S.perkGifts)return false;const me=typeof acctMe==='function'&&acctMe();return /\bjaxon\b/i.test(NAME()+' '+(me&&me.name||''));};
// bringing a farm in: a matching code marks it (and its morning save) before it's written to this device
{const _dec=acctDecode;acctDecode=async function(code){const c=perkClean(code);let o;try{o=await _dec.call(this,code);}catch(e){if(c===String(code||'').replace(/\s+/g,''))throw e;o=await _dec.call(this,c);}
  if(PERK_CODES.has(perkPrint(c))){for(const k of ['save','morning']){if(!o[k])continue;try{const d=JSON.parse(o[k]);if(d&&d.S){d.S.perkGifts=true;d.S.perkTold=false;o[k]=JSON.stringify(d);}}catch(e){}}}
  return o;};}
// the Give button stays: every day, as often as you like (still not to the things standing in the dark at night)
{const _st=socialTalk;socialTalk=function(n){const r=_st.apply(this,arguments);try{if(giftsUnlimited()){const gb=$('talkGift');if(gb&&!isNight())gb.hidden=!giftKeys().length;}}catch(e){}return r;};}
{const _og=openGift;openGift=function(n){const r=_og.apply(this,arguments);try{if(giftsUnlimited()){const row=$('talk').querySelector('.giftrow');
    if(row)row.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{const gb=$('talkGift');if(gb&&!isNight()&&giftKeys().length)gb.hidden=false;},0)));}}catch(e){}return r;};}
// the perk is the farmer's own: on a friend's farm it comes along, and the host doesn't get it
if(typeof PERSONAL!=='undefined'&&!PERSONAL.includes('perkGifts'))PERSONAL.push('perkGifts','perkTold');
// say so once
{const _mu=mindUpdate;let told=false;mindUpdate=function(dt){_mu(dt);if(!told&&S.mode==='play'&&giftsUnlimited()&&!S.perkTold){told=true;S.perkTold=true;setTimeout(()=>toast('Unlimited gifts are on for Jaxon: give anyone as many as you like, every day.',4),1500);}};}
