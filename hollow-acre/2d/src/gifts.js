/* ================= giving gifts, one way for everything: produce from the basket (each fish by its kind), food and things from your
   bag. Every gift counts (two a week each, the lesson, the journal), and the reply names what you gave. ================= */
S.giftsTotal=S.giftsTotal||0;
function giftKeys(){const ks=[];const seen=new Set();
  for(const b of S.basket){const k='P:'+bkey(b);if(!seen.has(k)){seen.add(k);ks.push(k);}}
  for(const k of Object.keys(S.inv||{}))if(S.inv[k]>0&&ITEMS[k])ks.push('I:'+k);
  // what you're holding goes first
  const sel=typeof selectedItem==='function'?selectedItem():null;if(sel&&ks.includes(sel.key)){ks.splice(ks.indexOf(sel.key),1);ks.unshift(sel.key);}
  return ks;}
const aOrAn=w=>/^[aeiou]/i.test(w)?'an':'a';
openGift=function(n){if(!n)return;const id=n.def.id,P_=PEOPLE[id];if(!P_)return;const first=n.def.name.split(' ')[0];
  $('talkLine').innerHTML='<span class="sub">What will you give?</span>';const acts=$('talk').querySelector('.acts');const old=$('talk').querySelector('.giftrow');if(old)old.remove();
  const row=document.createElement('div');row.className='giftrow';row.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin:8px 0';
  for(const k of giftKeys().slice(0,16)){const it=itemInfo(k);if(!it||!(it.qty>0))continue;if(k==='I:bouquet')continue;   // the bouquet has its own button (romance.js)
    const b=document.createElement('button');b.className='buy';b.style.cssText='display:flex;align-items:center;gap:6px';
    b.innerHTML=`<img src="${iconOf(it.icon)}" style="width:24px;height:24px;image-rendering:pixelated" alt="">${it.name} ×${it.qty}`;
    b.addEventListener('click',()=>{
      if(k.startsWith('P:'))takeBasket(k.slice(2),1);else takeInv(k.slice(2),1);
      S.gifted[id]=S.day;S.giftsWeek[id]=(S.giftsWeek[id]||0)+1;S.giftsTotal=(S.giftsTotal||0)+1;S.ls.ev.gifts=(S.ls.ev.gifts||0)+1;
      const base=k.slice(2).split('~')[0];const r=prefOf(id,'X:'+base);const bd=dayOfMonth()===BDAY[id];
      addFriend(id,({love:80,like:45,hate:-30,meh:20}[r])*(bd?8:1));SFX[r==='hate'?'deny':'coin']&&SFX[r==='hate'?'deny':'coin']();
      const nm=it.name.toLowerCase();
      $('talkLine').innerHTML=`<span class="sub">You give ${first} ${aOrAn(nm)} ${nm}.</span><br><q>${bd?(r==='hate'?'On my birthday? Really?':'For my birthday? Oh… nobody does that here. Thank you.')+' ':''}${P_.gift[r]}</q>`;
      row.remove();$('talkGift').hidden=true;updateHud&&updateHud();});
    row.appendChild(b);}
  if(!row.children.length)row.innerHTML='<span class="sub">You have nothing to give.</span>';acts.before(row);};
// the lesson ("give a gift") counts gifts that never reset, so a new week can't undo it
{const L=typeof LESSONS!=='undefined'&&LESSONS.find(l=>l.id==='friends');
  if(L){L.goal=b=>`Talk to people ${Math.min(talkedCount(),5)}/5 · Give a gift ${(S.giftsTotal||0)>(b.g0==null?0:b.g0)?1:0}/1`;
    L.ok=b=>talkedCount()>=5&&(S.giftsTotal||0)>(b.g0==null?0:b.g0);L.begin=b=>{b.g0=S.giftsTotal||0;};}}
