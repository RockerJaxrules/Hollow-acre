/* ================= the tutorial's shop steps (owner: "stock and hire staff part in tutorial is broken"). Since the shops became
   buildings you walk into (t330), your own shop stands on Market Row, the first lot east of the Lamplighter, and its ledger is
   at the counter inside. "Running it" still sent you to the old signpost on the green, which was taken down then: the way
   pointed at an empty patch of grass with nothing to open there. Now:
   - "Your own shop" and "Running it" point at your shop's door as soon as it has one, and say where it is and what to do
     inside (hire at the counter's ledger, then stock); the town hall's ledger has the same page, and that still counts.
   - Its goal says which half is left: hire someone, then stock it (and with what: produce, cooked meals or drinks).
   - On a shared farm played as rivals, your shop is your rival's-row shop: the steps count that one too. ============ */
// your shop: the farm's own (S.biz.own), or yours on Market Row when a shared farm plays as rivals
function stOwn(){try{if(typeof bwOn==='function'&&bwOn()){const B=BW(),s=B&&B.shops&&B.shops[bwMe()];return s||null;}}catch(e){}return S.biz&&S.biz.own||null;}
// the door of your shop, where you stand to go in (null until the building is up)
function stOwnDoor(){try{const id=(typeof bwOn==='function'&&bwOn())?'bw:'+bwMe():'own',s=ST30.sites[id];if(!s||!s.w||!s.base)return null;
  const a=st30At(s.w),m=SPR[s.base]||{};return {x:a.x+(m.door_dx||0)/PPM,z:a.z+.75};}catch(e){return null;}}
const stTrade=o=>{const T={stand:'your produce',kitchen:'meals you’ve cooked',taproom:'drinks you’ve brewed'};return T[o&&o.type]||'what it sells';};
{const L=id=>LESSONS.find(q=>q.id===id);const shop=L('c_shop'),run=L('c_run');
  if(shop){shop.ok=()=>!!stOwn();shop.done='Your name’s over the door, on Market Row east of the Lamplighter. Now it needs someone behind the counter and something on the shelves.';}
  if(run){run.at=()=>stOwnDoor()||gdHall();
    run.say='Nothing sells without staff and stock. Your shop is on Market Row, east of the Lamplighter. Go in, and open the ledger at the counter (the town hall’s ledger has the same page). Hire someone from town (they’re paid each evening from the till), then press Stock to put your produce, meals or drinks on the shelves. Every evening the town buys what it can; take the till whenever you like.';
    run.goal=()=>{const o=stOwn();if(!o)return 'Hire staff and stock your shop';const st=(o.staff||[]).length,sk=(o.stock||[]).length;
      if(!st&&!sk)return 'Hire staff and stock your shop: at its counter';if(!st)return 'Hire someone at your shop’s counter';if(!sk)return `Stock your shop with ${stTrade(o)}`;return 'Hire staff and stock your shop';};
    run.ok=()=>{const o=stOwn();return !!(o&&(o.staff||[]).length&&(o.stock||[]).length);};}}
// the toast when you open it says where it is
{const _t=toast;toast=function(msg,dur,red){try{const o=S.biz&&S.biz.own;if(o&&typeof msg==='string'&&msg===`${o.name} has its name over the door. Hire someone to open up.`)
    msg=`${o.name} has its name over the door, on Market Row east of the Lamplighter. Hire someone to open up.`;}catch(e){}return _t.call(this,msg,dur,red);};}
