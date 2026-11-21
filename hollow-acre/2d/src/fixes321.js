/* ================= t321 the Grange board, put right. Since the new crops, the pantry and the still came in, the buyers ask
   for things the board never knew how to count:
   - every crop is produce: potatoes, carrots, cabbages, corn, barley, hops and grapes come out of the basket like pumpkins
     do (before, the board looked for them in the backpack, so those orders could never be filled);
   - made things (ale, soup, cheese, a woven basket) come in small orders priced by what they're worth (before, the Lamplighter
     asked for thirty bowls of potato soup and offered nearly four thousand coins);
   - every order says what it wants in words ("4 jugs of pumpkin ale", not "pumpkin_ale");
   - the rival farms' names start with a capital at the head of a line. ================= */
if(typeof MK_PRODUCE!=='undefined'){
  for(const k of Object.keys(SEEDS||{}))MK_PRODUCE.add(k);
  const MASS={butter:['crock of butter','crocks of butter'],cheese:['wheel of cheese','wheels of cheese'],jam:['jar of grape jam','jars of grape jam'],
    sauerkraut:['jar of sauerkraut','jars of sauerkraut'],cornbread:['loaf of cornbread','loaves of cornbread'],rope:['coil of rope','coils of rope'],
    basket:['woven basket','woven baskets'],corn:['ear of corn','ears of corn'],potato:['potato','potatoes'],barley:['sack of barley','sacks of barley'],
    hops:['bale of hops','bales of hops'],grapes:['bunch of grapes','bunches of grapes'],cabbage:['cabbage','cabbages'],carrot:['carrot','carrots'],
    white_dog:['jar of white dog','jars of white dog']};
  const plural=w=>/(s|sh|ch|x)$/.test(w)?w+'es':/[^aeiou]y$/.test(w)?w.slice(0,-1)+'ies':w+'s';
  const mkName=k=>{if(MASS[k])return MASS[k];const it=ITEMS[k];const nm=(it&&it.name?it.name:k.replace(/_/g,' ')).toLowerCase();
    if(it&&it.drink)return [`jug of ${nm}`,`jugs of ${nm}`];if(/soup|stew/.test(k))return [`bowl of ${nm}`,`bowls of ${nm}`];return [nm,plural(nm)];};
  for(const [,ks] of MK_BUYERS)for(const k of ks)if(!MK_NAME[k])MK_NAME[k]=mkName(k);
  for(const k of Object.keys(SEEDS||{}))if(!MK_NAME[k])MK_NAME[k]=mkName(k);
  // how many of a thing one order asks for: a crate of produce, a cartload of raw stuff, a handful of made things
  const mkSize=k=>{const b=mkBase(k);if(MK_PRODUCE.has(k))return 4+Math.floor(rand()*(k==='pumpkin'||b>=20?5:9));if(b<=9)return 15+Math.floor(rand()*30);
    if(b<=40)return 3+Math.floor(rand()*4);if(b<=100)return 2+Math.floor(rand()*3);return 1+Math.floor(rand()*2);};
  mkPost=function(){const mk=MK();const open=mk.contracts.filter(c=>!c.taken).length;
    for(let i=open,tries=0;i<3&&tries<20;tries++){const [who,ks]=MK_BUYERS[Math.floor(rand()*MK_BUYERS.length)];const k=ks[Math.floor(rand()*ks.length)];
      if(mk.contracts.some(c=>!c.taken&&c.k===k))continue;i++;const n=mkSize(k);const pay=Math.round(mkBase(k)*n*(1.45+rand()*.45));
      mk.contracts.push({id:++mk.seq,who,k,n,pay,due:S.day+2+Math.floor(rand()*3),day:S.day,taken:''});}};
  // orders already up in a world from before: cut the outsized ones down to size, at the same price per thing
  const mkFixOld=()=>{try{if(!S.world||!S.world.mk)return;for(const c of MK().contracts){if(c.taken||c.fixed)continue;c.fixed=1;const b=mkBase(c.k);
      const tooBig=MK_PRODUCE.has(c.k)?c.n>12:(b>9&&c.n>6);if(!tooBig)continue;const n=mkSize(c.k);c.pay=Math.max(1,Math.round(c.pay*n/c.n));c.n=n;}}catch(e){}};
  {const _o=mkOpen;mkOpen=function(){mkFixOld();return _o.apply(this,arguments);};}
  {const _n=mkNight;mkNight=function(){mkFixOld();return _n.apply(this,arguments);};}
  {const _h=mkHtml;mkHtml=function(){return _h.apply(this,arguments).replace(/(<div style="font-size:13px">\d+\. )the /g,'$1The ');};}
}
/* the message line goes over an open note: before, what the ledger or the Grange board said back ("Rosa Finch comes over for
   52 a day", "Someone saw you") was drawn behind the open page, so nobody ever read it. Story scenes and close-ups (70+) stay on top. */
{const css=document.createElement('style');css.textContent='#toast{z-index:60}';document.head.appendChild(css);}
