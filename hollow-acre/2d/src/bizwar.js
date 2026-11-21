/* ================= #254 the business war. Only in a world played against each other. Every farm in the contest can open
   a shop of its own on the square, and they all sell to the same town: each morning the people who come in are shared out
   between the shops that sell what they want, by how cheap each one is, how loud its adverts are and how good its name is.
   Two shops off the edge of the map are in it too: Vance Fresh Produce (the orchard's stand, and a stall at the Wickham
   market) and the Dunn boys' taproom out on Mill Road.
   - PRICES: cheap sells more for less, dear sells less for more (a good name carries a dear price).
   - ADVERTS: handbills on every post, an advert in the Marrow Courier, your name painted on a barn on Route 9.
   - STORES: a second store, a stall at the Wickham market, sells to Wickham too.
   - BULK DEALS: the Lamplighter and the Lantern Inn put out for a supplier now and then. Put in a price per crate; the best
     offer for the best name gets a deal for most of a week, and its crates go before the shop opens. Run short twice and
     they find someone else.
   - PEOPLE: everyone hires from the same town. Anyone working for a rival can be offered more to come over; a raise and
     a fair wage keep yours.
   - CLEAN OR DIRTY: sponsor the harvest supper, give to the church roof; or start a rumour, tear down a rival's adverts,
     spoil their stock, slip the buyer something under the table. Somebody sees about one time in four, and Constable Pruitt
     fines whoever he catches; the whole town hears about it either way.
   The host keeps the books (as with the Grange board); a farmhand's actions go to the host and come back. Shop takings count
   toward the week's sales on the Grange board, so the purse can be won behind a counter. ================= */
const BW_PRICE={cheap:{name:'Cheap',mk:.8,pull:1.45,say:'sells more, for less'},fair:{name:'Fair',mk:1,pull:1,say:'the going rate'},dear:{name:'Dear',mk:1.25,pull:.65,say:'sells less, for more'}};
const BW_ADS={bills:{name:'Handbills on every post',cost:40,days:3,pull:1.25},courier:{name:'An advert in the Marrow Courier',cost:130,days:6,pull:1.5},
  barn:{name:'Your name painted on a barn on Route 9',cost:450,days:0,pull:1.15}};
const BW_DEMAND={stand:16,kitchen:12,taproom:12};
const BW_REF={stand:12,kitchen:30,taproom:26};   // what one thing of each kind fetches, near enough (the rival shops and the bulk deals)
const BW_STALL=900,BW_FINE=150,BW_BRIBE=40;
const BW_WHY_AD={bills:'put handbills up',courier:'took an advert in the Courier',barn:'painted a barn on Route 9'};
const BW_HIRE2=[{id:'nell',name:'Nell Ashby',note:'fast hands, a sharp tongue',wage:28,skill:5},{id:'otto',name:'Otto Crane',note:'the Cranes’ boy; knew the old shop',wage:34,skill:6},
  {id:'ivy',name:'Ivy Hale',note:'reads the tea leaves for regulars',wage:30,skill:5},{id:'gus',name:'Gus Teller',note:'old and slow; has never stolen a penny',wage:20,skill:3},
  {id:'rosa',name:'Rosa Finch',note:'ran a stall at the Wickham market for years',wage:40,skill:7},{id:'wes',name:'Wes Carrow',note:'drinks with the Dunn boys',wage:22,skill:4}];
const BW_AI=[{id:'vance',name:'Vance Fresh Produce',owner:'the Vance orchard',type:'stand',cap:9,stockDay:10,skill:.6,dirty:.04,trick:'rumor',stall:true,staff:['rosa']},
  {id:'dunn',name:'The Dunn Tap',owner:'the Dunn boys',type:'taproom',cap:7,stockDay:8,skill:.45,dirty:.12,trick:'spoil',stall:false,staff:['wes']}];
const BW_DINERS=[{who:'The Lamplighter',cat:'stand',n:[3,5]},{who:'The Lantern Inn',cat:'kitchen',n:[2,4]},{who:'The Lantern Inn',cat:'taproom',n:[2,4]},{who:'The Lamplighter',cat:'taproom',n:[3,4]}];
const BW_DIRTY={rumor:{name:'Start a rumour',cost:30,odds:.25,desc:'A story about what’s really in their stock. Their good name drops.',did:'started a story about'},
  bills:{name:'Tear down their adverts',cost:0,odds:.3,desc:'Their handbills and barn paint go (not the Courier).',did:'tore down the adverts of'},
  spoil:{name:'Spoil their stock',cost:20,odds:.35,desc:'Salt in the barrels, mice in the sacks: a third of it is ruined.',did:'spoiled the stock of'}};
const BW_CLEAN={supper:{name:'Sponsor the harvest supper',cost:150,rep:8,desc:'The whole town eats on you. Your good name rises and old talk fades.'},
  roof:{name:'Give to the church roof fund',cost:80,rep:4,desc:'Your name goes on the board inside the door.'}};
const bwOn=()=>typeof mkOn==='function'&&mkOn();
const bwHost=()=>typeof HOST==='undefined'||HOST.role!=='guest';
const bwMe=()=>NAME()||'Farmhand';
const bwW=id=>BIZ_HIRE.concat(BW_HIRE2).find(w=>w.id===id);
const bwAI=id=>BW_AI.find(a=>a.id===id);
function BW(){const w=S.world;if(!w.bw){w.bw={shops:{},tenders:[],deals:[],talk:[],seq:0,lastT:0};
    for(const a of BW_AI)w.bw.shops['ai:'+a.id]={ai:a.id,owner:a.owner,name:a.name,type:a.type,price:'fair',rep:55,ads:[],staff:a.staff.map(id=>({id,pay:bwW(id).wage,loyal:.2})),stock:[],aiStock:a.stockDay,till:0,up:{},stall:a.stall,log:[],dirt:0,caught:0};}
  return w.bw;}
const bwMine=()=>BW().shops[bwMe()];
const bwTypes=s=>[s.type].concat(s.up&&s.up.line&&s.type2?[s.type2]:[]);
const bwCatOf=(s,e)=>bwTypes(s).find(t=>BIZ_TYPES[t].take(e));
const bwHas=(s,cat)=>s.ai?(s.type===cat?(s.aiStock||0):0):(s.stock||[]).filter(e=>BIZ_TYPES[cat].take(e)).length;
function bwWho(id){const B=BW();for(const [k,s] of Object.entries(B.shops))if((s.staff||[]).some(w=>w.id===id))return k;return null;}
function bwPull(s){let p=(.5+(s.rep||50)/100)*BW_PRICE[s.price||'fair'].pull*(s.up.sign?1.15:1)*(s.up.back?1.2:1);
  for(const a of s.ads||[])if(!a.until||a.until>=S.day)p*=BW_ADS[a.k].pull;return p;}
function bwCap(s){if(s.ai){const A=bwAI(s.ai);return Math.round(A.cap*(s.staff.length?1:.6));}
  return Math.round((s.staff||[]).reduce((a,w)=>a+((bwW(w.id)||{}).skill||0),0)*(s.up.hours?1.25:1)*(s.up.back?1.5:1))+(s.stall&&s.staff.length?4:0);}
function bwTalk(t){const B=BW();B.talk.unshift({day:S.day,t});B.talk=B.talk.slice(0,12);}
// a word to one player, wherever they are
function bwNote(n,t){if(!n||n.startsWith('the '))return;if(n===bwMe()){setTimeout(()=>toast(t,4.4),400);return;}
  try{if(CO.room&&CO.room.emit)CO.room.emit('bwnews',{n,t:String(t).slice(0,300)});}catch(e){}}
function bwSync(){try{if(typeof mkBroadcast==='function')mkBroadcast();}catch(e){}try{bwSigns();}catch(e){}}
// ---- the morning (the host): restaurants take their crates, the town comes in, the books are kept
function bwSell(s,cat,n,out){let rev=0;if(s.ai){s.aiStock=Math.max(0,(s.aiStock||0)-n);rev=Math.round(n*BW_REF[cat]*BW_PRICE[s.price].mk*(1+bwAI(s.ai).skill*.2));}
  else for(let i=0;i<n;i++){const j=s.stock.findIndex(e=>BIZ_TYPES[cat].take(e));if(j<0)break;const e=s.stock.splice(j,1)[0];rev+=Math.round(e.value*BIZ_TYPES[cat].markup*BW_PRICE[s.price].mk);}
  out.rev+=rev;out.sold+=n;}
function bwMorning(){if(!bwOn()||!bwHost())return;const B=BW(),mk=MK(),news={};const say=(s,t)=>{if(!s.ai)(news[s.owner]=news[s.owner]||[]).push(t);};
  const shops=Object.entries(B.shops).map(([k,s])=>Object.assign(s,{_k:k,_o:{sold:0,rev:0,deal:0,want:0,mkt:0},_cap:bwCap(s)}));
  // the rival shops restock and set their prices by how the last day went; now and then they advertise, or play dirty
  for(const s of shops){if(!s.ai)continue;const A=bwAI(s.ai);s.aiStock=Math.round(A.stockDay*(1+Math.floor((S.day-1)/7)*.15));
    const sh=s.lastShare==null?.4:s.lastShare;s.price=sh<.25?'cheap':sh>.6?'dear':'fair';
    if(sh<.35&&!(s.ads||[]).some(a=>a.until>=S.day)&&rand()<.5)s.ads.push({k:rand()<.3?'courier':'bills',until:S.day+2});
    const top=shops.filter(x=>!x.ai&&x.staff.length).sort((a,b)=>(b.lastRev||0)-(a.lastRev||0))[0];
    if(top&&rand()<A.dirty){const D=BW_DIRTY[A.trick];if(A.trick==='rumor')top.rep=Math.max(0,top.rep-12);else top.stock.splice(0,Math.ceil(top.stock.length/3));
      if(rand()<.3){s.rep=Math.max(0,s.rep-15);bwTalk(`${A.owner[0].toUpperCase()+A.owner.slice(1)} were seen. They ${D.did} ${top.name}; Constable Pruitt fined them.`);say(top,`${A.owner} ${D.did} ${top.name} in the night, and were caught at it.`);}
      else{bwTalk(`Somebody ${D.did} ${top.name}.`);say(top,`Somebody ${D.did} ${top.name} in the night.`);}}
    // and they poach: the lowest-paid hand in town, if they're not loyal
    if(rand()<.06){const v=shops.filter(x=>!x.ai&&x.staff.length).flatMap(x=>x.staff.map(w=>[x,w])).sort((a,b)=>a[1].pay-b[1].pay)[0];
      if(v&&rand()<bwPoachOdds(v[1])){const [x,w]=v;x.staff=x.staff.filter(q=>q!==w);s.staff.push({id:w.id,pay:Math.round(w.pay*1.3),loyal:.2});
        say(x,`${bwW(w.id).name} has gone to work for ${s.name}: they offered ${Math.round(w.pay*1.3)} a day.`);bwTalk(`${bwW(w.id).name} left ${x.name} for ${s.name}.`);}}}
  // 1) the bulk deals: crates go to the restaurants before the doors open
  for(const d of B.deals){const s=B.shops[d.shop];if(!s){d.left=0;continue;}const o={rev:0,sold:0};bwSell(s,d.cat,Math.min(d.n,bwHas(s,d.cat)),o);
    const got=o.sold;o.rev=got*d.unit;s.till+=o.rev;s._o.deal+=o.rev;s._o.dealN=(s._o.dealN||0)+got;d.left--;
    if(got<d.n){d.short=(d.short||0)+1;s.rep=Math.max(0,s.rep-3);say(s,`${d.who} wanted ${d.n} and got ${got}.`);}
    if(d.short>=2){d.left=0;say(s,`${d.who} has found another supplier.`);bwTalk(`${d.who} dropped ${s.name}: it ran short.`);}
    else if(d.left<=0)say(s,`The deal with ${d.who} has run its course.`);}
  B.deals=B.deals.filter(d=>d.left>0);
  // 2) the town comes in: Marrow Hollow, then the Wickham market for anyone with a stall there; each kind of shop on its own
  for(const place of ['marrow','wickham'])for(const cat of Object.keys(BIZ_TYPES)){
    const sel=shops.filter(s=>(place==='marrow'||s.stall)&&bwTypes(s).includes(cat)&&(s.ai||s.staff.length));if(!sel.length)continue;
    const D=Math.round(BW_DEMAND[cat]*(place==='wickham'?.6:1)*(.85+rand()*.3)*(1+.15*(sel.length-1)));const tot=sel.reduce((a,s)=>a+bwPull(s),0);let left=D;
    for(const s of sel){const want=Math.round(D*bwPull(s)/tot);s._o.want+=want;s._o.mkt+=D;const n=Math.min(want,s._cap,bwHas(s,cat),left);if(n>0){bwSell(s,cat,n,s._o);s._cap-=n;left-=n;}}
    for(const s of sel.slice().sort((a,b)=>bwPull(b)-bwPull(a))){if(left<=0)break;const n=Math.min(left,s._cap,bwHas(s,cat));if(n>0){bwSell(s,cat,n,s._o);s._cap-=n;left-=n;}}}
  // 3) the books
  for(const s of shops){const o=s._o;s.lastShare=o.mkt?o.sold/o.mkt:0;s.lastRev=o.rev+o.deal;
    if(s.ai){const r=mk.rivals.find(q=>q.id===s.ai);if(r){r.earn+=s.lastRev;r.total+=s.lastRev;}s.ads=(s.ads||[]).filter(a=>!a.until||a.until>=S.day);
      s.log=(s.log||[]).concat([{day:S.day,sold:o.sold,rev:o.rev,deal:o.deal,dealN:o.dealN||0}]).slice(-7);continue;}
    const wages=s.staff.reduce((a,w)=>a+w.pay,0),cost=wages+BIZ_RENT+(s.stall?10:0);s.till+=o.rev-cost;mk.earn[s.owner]=(mk.earn[s.owner]||0)+o.rev+o.deal;
    const notes=[];if(!s.staff.length)notes.push('Nobody to open up: the door stayed locked.');
    else if(!o.sold&&bwTypes(s).every(t=>bwHas(s,t)===0))notes.push('The shelves were empty: nothing to sell.');
    else if(o.sold<o.want&&bwTypes(s).every(t=>bwHas(s,t)===0)){s.rep=Math.max(0,s.rep-4);if(o.sold)notes.push('The shelves were bare by noon.');}
    else if(o.sold>=o.want)s.rep=Math.min(100,s.rep+(s.price==='cheap'?3:2));else{s.rep=Math.min(100,s.rep+1);notes.push('More came in than your people could serve.');}
    if(s.till<0){s.unpaid=(s.unpaid||0)+1;notes.push('The till couldn’t cover the wages.');if(s.unpaid>=2&&s.staff.length){const q=s.staff.pop();notes.push(`${bwW(q.id).name} hasn’t been paid in two days and has quit.`);s.unpaid=0;}}else s.unpaid=0;
    s.ads=(s.ads||[]).filter(a=>!a.until||a.until>=S.day);
    s.log=(s.log||[]).concat([{day:S.day,sold:o.sold,rev:o.rev,deal:o.deal,dealN:o.dealN||0,cost,note:notes[0]||''}]).slice(-7);
    say(s,`Overnight, ${s.name} sold ${o.sold} for ${o.rev}${o.deal?`, and ${o.deal} came from the deal`:''}, less ${cost} in wages and rent.${notes.length?' '+notes[0]:''}`);}
  // what changed at each shop since yesterday morning, for the standings ("Vance went Cheap and put handbills up")
  for(const s of shops){const p=s.snap||{},why=[],ads=(s.ads||[]).filter(a=>!a.until||a.until>=S.day).map(a=>a.k);
    if(p.price&&p.price!==s.price)why.push(`went ${BW_PRICE[s.price].name.toLowerCase()}`);for(const k of ads)if(p.ads&&!p.ads.includes(k))why.push(BW_WHY_AD[k]);
    if(p.rep!=null&&s.rep<=p.rep-8)why.push('lost face in town');else if(p.rep!=null&&s.rep>=p.rep+6)why.push('is better thought of');
    if(p.staff!=null&&(s.staff||[]).length<p.staff)why.push('lost a pair of hands');else if(p.staff!=null&&(s.staff||[]).length>p.staff)why.push('took on help');
    if(p.price&&s.stall&&!p.stall)why.push('opened a stall at Wickham');
    s.why=why.slice(0,2).join(' and ');s.snap={price:s.price,ads,rep:s.rep,staff:(s.staff||[]).length,stall:!!s.stall};}
  for(const s of shops){delete s._o;delete s._cap;delete s._k;}
  // 4) the bulk-deal tenders: the ones due are settled, a new one goes up now and then
  bwSettle();bwPost();
  for(const [n,ls] of Object.entries(news))bwNote(n,ls.join(' '));bwSync();}
{const _nd=newDay;newDay=function(m,p){const r=_nd.apply(this,arguments);try{bwMorning();}catch(e){console.warn('bw',e);}return r;};}
function bwBidScore(t,k){const s=BW().shops[k],b=t.bids[k];return s&&b?(.5+s.rep/100)*(t.ref/Math.max(1,b.unit)):0;}
function bwPoachOdds(w){return Math.max(.05,Math.min(.9,.6-(w.loyal||0)-(w.pay>((bwW(w.id)||{}).wage||0)*1.1?.15:0)));}
// ---- bulk deals
function bwPost(){const B=BW();if(B.tenders.some(t=>!t.done)||B.deals.length>=2||S.day-(B.lastT||0)<3)return;
  const kinds=new Set(Object.values(B.shops).flatMap(s=>bwTypes(s)));const opts=BW_DINERS.filter(d=>kinds.has(d.cat)&&!B.deals.some(x=>x.who===d.who&&x.cat===d.cat));if(!opts.length)return;
  const D=opts[Math.floor(rand()*opts.length)];const n=D.n[0]+Math.floor(rand()*(D.n[1]-D.n[0]+1));
  const T={id:++B.seq,who:D.who,cat:D.cat,n,days:5+Math.floor(rand()*3),due:S.day+1,ref:BW_REF[D.cat],bids:{},done:false};B.tenders.push(T);B.lastT=S.day;
  for(const [k,s] of Object.entries(B.shops)){if(!s.ai||!bwTypes(s).includes(T.cat))continue;const A=bwAI(s.ai);T.bids[k]={unit:Math.round(T.ref*(1.05+rand()*.25-A.skill*.15)),bribe:rand()<A.dirty*2?BW_BRIBE:0};}
  bwTalk(`${D.who} wants a supplier: ${n} ${D.cat==='stand'?'crates of produce':D.cat==='kitchen'?'dishes':'jugs'} a day. Offers by tomorrow morning.`);}
function bwSettle(){const B=BW();for(const t of B.tenders){if(t.done||t.due>S.day)continue;t.done=true;
    for(const [k,s] of Object.entries(B.shops)){if(!s.ai||!bwTypes(s).includes(t.cat)||t.bids[k])continue;const A=bwAI(s.ai);t.bids[k]={unit:Math.round(t.ref*(1.05+rand()*.25-A.skill*.15)),bribe:rand()<A.dirty*2?BW_BRIBE:0};}
    let best=null,bs=-1;
    for(const [k,b] of Object.entries(t.bids)){const s=B.shops[k];if(!s)continue;
      if(b.bribe&&rand()<.2){s.rep=Math.max(0,s.rep-10);if(!s.ai)s.till-=BW_FINE;bwTalk(`${s.name} tried to buy ${t.who}’s order with money under the table, and was found out.`);bwNote(s.owner,`${t.who} found the money under the table. Your offer is torn up, and Constable Pruitt fined you ${BW_FINE}.`);continue;}
      const sc=bwBidScore(t,k)*(1+Math.min(.5,(b.bribe||0)/200));if(sc>bs){bs=sc;best=k;}}
    if(best){const b=t.bids[best],s=B.shops[best];B.deals.push({id:t.id,who:t.who,cat:t.cat,n:t.n,unit:b.unit,left:t.days,shop:best,short:0});
      bwTalk(`${t.who} signed ${s.name} to supply ${t.n} a day for ${t.days} days at ${b.unit} each.`);bwNote(s.owner,`${t.who} took your offer: ${t.n} a day for ${t.days} days at ${b.unit} each. Keep the shelves full.`);
      for(const k of Object.keys(t.bids))if(k!==best&&B.shops[k])bwNote(B.shops[k].owner,`${t.who} went with ${s.name}.`);}
    else bwTalk(`${t.who} found nobody to supply them.`);}
  B.tenders=B.tenders.filter(t=>!t.done);}
// ---- what a player does: done at the host (straight away for the host, sent over for a farmhand). Coins are paid by the
//      player before it goes; if the host says no, they come back.
function bwApply(n,d){const B=BW();const me=B.shops[n];const no=(msg)=>({ok:false,msg});const W=id=>bwW(id)||{};
  if(d.a==='open'){if(me)return no('You already have a shop.');const type=BIZ_TYPES[d.type]?d.type:'stand';const nm=String(d.name||'').replace(/[<>"]/g,'').replace(/\s+/g,' ').trim().slice(0,24)||'The Farm Shop';
    B.shops[n]={owner:n,name:nm,type,type2:null,price:'fair',rep:50,ads:[],staff:[],stock:[],till:0,up:{},stall:false,log:[],dirt:0,caught:0};bwTalk(`${n} has opened ${nm} on the square.`);return {ok:true,msg:`${nm} has its name over the door. Hire someone to open up.`};}
  if(!me)return no('You have no shop.');
  switch(d.a){
    case 'take':{const t=Math.max(0,me.till|0);me.till-=t;if(t>0&&n!==bwMe())mkPay(n,t,'');return {ok:true,got:t,msg:`You take ${t} coins from the till.`};}
    case 'price':if(!BW_PRICE[d.p])return no('');me.price=d.p;return {ok:true};
    case 'ad':{const A=BW_ADS[d.k];if(!A)return no('');if(d.k==='barn'&&me.ads.some(a=>a.k==='barn'))return no('Your name is on the barn already.');
      me.ads=me.ads.filter(a=>a.k!==d.k||!a.until||a.until<S.day);me.ads.push({k:d.k,until:A.days?S.day+A.days-1:0});return {ok:true,msg:`${A.name}: done.`};}
    case 'stock':{for(const e of (d.items||[]).slice(0,200))if(e&&(e.t==='P'||e.t==='I')&&ITEMS[e.id]||e&&e.t==='P')me.stock.push({t:e.t,id:String(e.id).slice(0,24),value:Math.max(1,Math.min(999,e.value|0))});return {ok:true};}
    case 'hire':{const w=bwW(d.w);if(!w)return no('');if(bwWho(d.w))return no(`${w.name} is working for someone else now.`);if(me.staff.length>=4)return no('Four is all the shop can hold.');
      me.staff.push({id:d.w,pay:w.wage,loyal:0});return {ok:true,msg:`${w.name} starts in the morning.`};}
    case 'fire':me.staff=me.staff.filter(x=>x.id!==d.w);return {ok:true};
    case 'raise':{const x=me.staff.find(q=>q.id===d.w);if(!x)return no('');x.pay=Math.round(x.pay*1.15);x.loyal=Math.min(.5,(x.loyal||0)+.25);return {ok:true,msg:`${W(d.w).name} gets ${x.pay} a day now, and won’t forget it.`};}
    case 'poach':{const k=bwWho(d.w),from=k&&B.shops[k];if(!from||k===n)return no('');if(me.staff.length>=4)return no('Four is all the shop can hold.');const x=from.staff.find(q=>q.id===d.w);
      if(rand()>=bwPoachOdds(x)){return no(`${W(d.w).name} hears you out and stays with ${from.name}.`);}
      from.staff=from.staff.filter(q=>q!==x);me.staff.push({id:d.w,pay:Math.round(x.pay*1.3),loyal:0});bwTalk(`${W(d.w).name} left ${from.name} for ${me.name}.`);
      bwNote(from.owner,`${W(d.w).name} has gone over to ${me.name}. They offered more.`);return {ok:true,msg:`${W(d.w).name} comes over to ${me.name} for ${Math.round(x.pay*1.3)} a day.`};}
    case 'up':{const U=BIZ_UP[d.k];if(d.k==='stall'){if(me.stall)return no('');me.stall=true;bwTalk(`${me.name} has taken a stall at the Wickham market.`);return {ok:true,msg:'A stall at the Wickham market: you sell to Wickham too.'};}
      if(!U||me.up[d.k])return no('');if(d.k==='line'){if(!BIZ_TYPES[d.t]||d.t===me.type)return no('');me.type2=d.t;}me.up[d.k]=1;return {ok:true};}
    case 'clean':{const C=BW_CLEAN[d.k];if(!C)return no('');me.rep=Math.min(100,me.rep+C.rep);if(d.k==='supper')me.dirt=Math.max(0,me.dirt-1);
      bwTalk(d.k==='supper'?`${me.name} paid for the harvest supper. The whole town ate well.`:`${me.name} gave to the church roof fund.`);return {ok:true,msg:C.name+': the town notices.'};}
    case 'dirty':{const t=B.shops[d.t],D=BW_DIRTY[d.k];if(!t||!D||d.t===n)return no('');me.dirt=(me.dirt||0)+1;const seen=rand()<D.odds*(1+(me.caught||0)*.25);
      if(d.k==='rumor')t.rep=Math.max(0,t.rep-12);if(d.k==='bills'){t.ads=(t.ads||[]).filter(a=>a.k==='courier'&&a.until>=S.day);t.torn=S.day;}
      if(d.k==='spoil'){if(t.ai)t.aiStock=Math.floor((t.aiStock||0)*.66);else t.stock.splice(0,Math.ceil(t.stock.length/3));}
      if(seen){me.caught=(me.caught||0)+1;me.rep=Math.max(0,me.rep-15);me.till-=BW_FINE;bwTalk(`${n} was seen. They ${D.did} ${t.name}, and Constable Pruitt fined them ${BW_FINE}.`);
        bwNote(t.owner,`${n} ${D.did} ${t.name}, and was caught at it.`);return {ok:true,msg:`Someone saw you. The whole town will know by morning, and Constable Pruitt takes ${BW_FINE} from your till.`};}
      bwTalk(`Somebody ${D.did} ${t.name}.`);bwNote(t.owner,`Somebody ${D.did} ${t.name}.`);
      return {ok:true,msg:rand()<.5?'Nobody saw you. Nobody you could see.':'Done. On the walk home, something keeps pace with you in the corn.'};}
    case 'bid':{const t=B.tenders.find(q=>q.id===d.id&&!q.done);if(!t)return no('Too late: that order has been settled.');if(!bwTypes(me).includes(t.cat))return no('Your shop doesn’t sell that.');
      const was=t.bids[n];t.bids[n]={unit:Math.max(1,Math.min(999,d.unit|0)),bribe:(was&&was.bribe)||d.bribe?BW_BRIBE:0};
      return {ok:true,msg:`Your offer to ${t.who}: ${t.bids[n].unit} each.${d.bribe?' And an envelope.':''} They decide in the morning.`};}}
  return no('');}
// what each action costs the one doing it (paid before it goes, refunded if it fails)
function bwCost(d){const me=bwMine();switch(d.a){case 'open':return BIZ_SETUP;case 'ad':return (BW_ADS[d.k]||{}).cost||0;case 'up':return d.k==='stall'?BW_STALL:(BIZ_UP[d.k]||{}).cost||0;
  case 'clean':return (BW_CLEAN[d.k]||{}).cost||0;case 'dirty':return (BW_DIRTY[d.k]||{}).cost||0;
  case 'bid':{const t=BW().tenders.find(q=>q.id===d.id),was=t&&t.bids[d.n||bwMe()];return d.bribe&&!(was&&was.bribe)?BW_BRIBE:0;}
  case 'poach':{const x=Object.values(BW().shops).flatMap(s=>s.staff||[]).find(q=>q.id===d.w);return x?x.pay*2:0;}}return 0;}
const BWUI={tab:'own'};
function bwDo(d){const c=bwCost(d);if(c>S.coins){SFX.deny&&SFX.deny();toast(`That’s ${c} coins. You have ${S.coins}.`,2.2);return;}
  if(c){S.coins-=c;SFX.coin&&SFX.coin();updateHud&&updateHud();}
  if(!bwHost()){try{CO.room.emit('bwact',Object.assign({n:bwMe()},d),HOST.hostPeer);}catch(e){}toast('…',.6);setTimeout(()=>{if(!$('note').hidden&&BWUI.open)bwOpen(BWUI.tab);},700);return;}
  const r=bwApply(bwMe(),d);if(!r.ok&&c){S.coins+=c;updateHud&&updateHud();}if(r.got){S.coins+=r.got;SFX.coin&&SFX.coin();updateHud&&updateHud();}
  if(r.msg)toast(r.msg,3);bwSync();bwOpen(BWUI.tab);}
{const _hw=hostWire;hostWire=function(){const r0=_hw.apply(this,arguments);const r=CO.room;if(!r||!r.on)return r0;const on=(t,f)=>HOST.off.push(r.on(t,m=>{if(!m||m.isMe)return;try{f(m);}catch(e){}}));
  on('bwact',m=>{if(HOST.role!=='host'||!bwOn()||!m.data)return;const n=clean(m.data.n);const d=Object.assign({},m.data);const c=bwCost(Object.assign({},d,{n}));delete d.n;
    const res=bwApply(n,d);r.emit('bwres',{n,ok:res.ok,msg:res.msg||'',refund:res.ok?0:c,got:res.got||0},m.peer);bwSync();});
  on('bwres',m=>{if(HOST.role!=='guest'||!m.data||clean(m.data.n)!==bwMe())return;const d=m.data;if(d.refund>0){S.coins+=d.refund|0;updateHud&&updateHud();}
    if(d.got>0)SFX.coin&&SFX.coin();if(d.msg)toast(String(d.msg).slice(0,240),3);setTimeout(()=>{if(!$('note').hidden&&BWUI.open)bwOpen(BWUI.tab);},400);});
  on('bwnews',m=>{if(HOST.role!=='guest'||!m.data||clean(m.data.n)!==bwMe())return;setTimeout(()=>toast(String(m.data.t||'').slice(0,300),4.4),2600);});
  return r0;};}
// ---- the ledger, in a world played against each other
const bwJ=o=>JSON.stringify(o).replace(/&/g,'&amp;').replace(/'/g,'&#39;');
const bwBar=v=>`<span class="bzbar"><i style="width:${Math.max(0,Math.min(100,v|0))}%"></i></span>`;
// the front line: yesterday's takings at every shop, the change since the day before, and what each one did about it
function bwStandRows(){const B=BW();return Object.entries(B.shops).map(([k,s])=>{const L=s.log||[],a=L[L.length-1],b=L[L.length-2];if(!a)return null;
  const t=a.rev+(a.deal||0),d=b?t-(b.rev+(b.deal||0)):null;let why=s.why||'';
  if(!why&&d!=null&&Math.abs(d)>=20)why=d>0?(a.dealN?'had a restaurant deal to fill':'had a busier day'):(!a.sold&&!a.dealN?(a.note&&/locked/.test(a.note)?'stayed shut':'had nothing to sell'):a.note&&/bare/.test(a.note)?'ran out of stock by noon':'had a quieter day');
  return {k,s,t,d,why,served:a.sold+(a.dealN||0)};}).filter(Boolean).sort((x,y)=>y.t-x.t);}
function bwStandings(){const rows=bwStandRows(),me=bwMe();if(!rows.length)return `<div class="bwstand"><div class="bwsh">Yesterday’s takings</div><p class="bzs">No shop has opened a day yet. Tomorrow morning the takings go up here.</p></div>`;
  const max=Math.max(1,...rows.map(r=>r.t));let h=`<div class="bwstand"><div class="bwsh">Yesterday’s takings <small>(and the change on the day before)</small></div>`;
  const ord=i=>['1st','2nd','3rd'][i]||(i+1)+'th';
  rows.forEach((r,i)=>{h+=`<div class="bwrow${r.k===me?' me':''}"><span class="bwn">${ord(i)} ${r.k===me?'You':bizEsc(r.s.name)}</span><span class="bwb"><i style="width:${Math.round(r.t/max*100)}%"></i></span><span class="bwv">${r.t} coins · ${r.served} served${r.d==null?'':` · <em class="${r.d>0?'up':r.d<0?'dn':'eq'}">${r.d>0?'+':''}${r.d}</em>`}</span></div>`;
    if(r.why)h+=`<p class="bwwhy">${r.k===me?'You':bizEsc(r.s.name)} ${bizEsc(r.why)}.</p>`;});
  return h+'</div>';}
const bwTalkOf=s=>(s.caught||0)>=2?'known for dirty tricks':(s.caught||0)===1?'whispered about':'clean, as far as anyone knows';
function bwOpen(tab){if(!bwOn())return;BWUI.tab=tab=tab||'own';BWUI.open=true;const B=BW(),me=bwMine(),n=bwMe();
  const T=(k,l)=>`<button data-bwtab="${k}" class="${tab===k?'on':''}">${l}</button>`;
  let h=`<div class="bzled"></div><h3>The ledger <span class="bzpurse">${S.coins} coins</span></h3><div class="bztabs">${T('own','Your shop')}${T('town','Rivals')}${T('deals','Deals')}</div>`;
  if(tab==='own'&&!me){h+=`<p class="bzs">Every farm in this contest can open a shop on the square, and all of them sell to the same town. The lease and a refit come to ${BIZ_SETUP} coins, then ${BIZ_RENT} a day in rent. Name it, then pick what it sells: that pays and opens it.</p>
      <label class="bzl2">Name it <input id="bzName" maxlength="24" placeholder="${bizEsc(n)}’s"></label><div class="bzpick">`;
    for(const [k,T2] of Object.entries(BIZ_TYPES)){const rivals=Object.values(B.shops).filter(s=>bwTypes(s).includes(k)).length;h+=`<button data-bwopen="${k}" ${S.coins<BIZ_SETUP?'class="nope"':''}><b>${T2.name} · ${BIZ_SETUP}</b><small>Sells ${T2.sells}. ${rivals?`${rivals} other shop${rivals>1?'s':''} sell${rivals>1?'':'s'} it.`:'Nobody else sells it yet.'}</small></button>`;}
    h+='</div>';}
  else if(tab==='own'){const last=(me.log||[]).slice(-1)[0];const types=bwTypes(me);
    h+=`<p class="bzs"><b>${bizEsc(me.name)}</b>, ${types.map(t=>BIZ_TYPES[t].name.toLowerCase()).join(' and ')}${me.stall?', with a stall at Wickham':''}. Good name: ${bwBar(me.rep)} <small>(${bwTalkOf(me)})</small></p>`;
    h+=bizRow(`<b>In the till: ${me.till}</b><small>${last?`Yesterday: sold ${last.sold}, took ${last.rev}${last.deal?` and ${last.deal} from a deal`:''}, paid out ${last.cost}.`:'Nothing sold yet.'}</small>`,'',me.till>0?`<button data-bw='{"a":"take"}'>Take it</button>`:'');
    {const rows=bwStandRows(),i=rows.findIndex(r=>r.k===n);if(i>=0){const r=rows[i];h+=`<p class="bzs">Yesterday you came <b>${['first','second','third','fourth','fifth','sixth','seventh'][i]||(i+1)+'th'}</b> of ${rows.length} shops by takings${r.d==null?'':` (${r.d>=0?'+':''}${r.d} on the day before)`}. <a href="#" data-bwtab="town">See the rivals</a></p>`;}}
    if(last&&last.note)h+=`<p class="bwwarn">${last.note}${last.sold?'':' Wages and rent were still paid.'}</p>`;
    if(me.till<0)h+=`<p class="bwwarn">The till is short by ${-me.till}: wages and rent come out of it. Stock the shelves, or let someone go.</p>`;
    h+=`<h4>Price</h4><div class="bztabs">${Object.entries(BW_PRICE).map(([k,P])=>`<button data-bw='{"a":"price","p":"${k}"}' class="${me.price===k?'on':''}">${P.name}</button>`).join('')}</div><p class="bzs" style="margin-top:-4px">${BW_PRICE[me.price].say}.</p>`;
    h+='<h4>Adverts</h4>';for(const [k,A] of Object.entries(BW_ADS)){const on=me.ads.find(a=>a.k===k&&(!a.until||a.until>=S.day));
      h+=bizRow(`<b>${A.name}</b><small>${A.days?`${A.days} days. `:'For good. '}More people come in${on?(on.until?`: up till day ${on.until}.`:': it’s there.'):'.'}</small>`,'',on&&!on.until?'':`<button data-bw='{"a":"ad","k":"${k}"}'>${on?'Again':'Run it'} · ${A.cost}</button>`);}
    h+=`<h4>On the shelves: ${me.stock.length}</h4>`;const bag=bizBagFor(types);
    if(bag.length){for(const e of bag.slice(0,8)){const t=types.find(t=>BIZ_TYPES[t].take(e));h+=bizRow(`${bizIcon(e)}${e.name} <small>×${e.n} in your bag · sells for about ${Math.round(e.value*BIZ_TYPES[t].markup*BW_PRICE[me.price].mk)}</small>`,'',`<button data-bwstock="${e.t}:${e.id}">Stock 1</button><button data-bwstock="${e.t}:${e.id}" data-all="1">All</button>`);}}
    else h+=`<p class="bzs">Nothing in your bag that ${bizEsc(me.name)} sells.</p>`;
    h+=`<h4>Your people (${me.staff.reduce((a,w)=>a+w.pay,0)} a day in wages)</h4>`;
    for(const w of me.staff){const W=bwW(w.id);h+=bizRow(`<b>${W.name}</b><small>${W.note}. Serves ${W.skill} a day · wage ${w.pay}${w.loyal>=.25?' · loyal':''}</small>`,'',`<button data-bw='{"a":"raise","w":"${w.id}"}'>Raise · +${Math.round(w.pay*.15)}</button><button data-bw='{"a":"fire","w":"${w.id}"}'>Let go</button>`);}
    const free=BIZ_HIRE.concat(BW_HIRE2).filter(w=>!bwWho(w.id));if(free.length)h+=`<h4>Looking for work</h4>`;
    for(const W of free)h+=bizRow(`<b>${W.name}</b><small>${W.note}. Serves ${W.skill} a day · wage ${W.wage}</small>`,'',me.staff.length>=4?'':`<button data-bw='{"a":"hire","w":"${W.id}"}'>Hire</button>`);
    h+='<h4>Improvements</h4>';
    h+=bizRow(`<b>A stall at the Wickham market</b><small>A second store: sell to Wickham too (10 a day more rent).</small>`,'',me.stall?'<small>Done.</small>':`<button data-bw='{"a":"up","k":"stall"}'>${BW_STALL}</button>`);
    for(const [k,U] of Object.entries(BIZ_UP)){if(me.up[k]){h+=bizRow(`<b>${U.name}</b> <small>Done.</small>`);continue;}
      if(k==='line'){h+=bizRow(`<b>${U.name}</b><small>${U.desc}</small>`,'',Object.keys(BIZ_TYPES).filter(t=>t!==me.type).map(t=>`<button data-bw='{"a":"up","k":"line","t":"${t}"}'>${BIZ_TYPES[t].name} · ${U.cost}</button>`).join(''));continue;}
      h+=bizRow(`<b>${U.name}</b><small>${U.desc}</small>`,'',`<button data-bw='{"a":"up","k":"${k}"}'>${U.cost}</button>`);}
    h+='<h4>Doing right by the town</h4>';for(const [k,C] of Object.entries(BW_CLEAN))h+=bizRow(`<b>${C.name}</b><small>${C.desc}</small>`,'',`<button data-bw='{"a":"clean","k":"${k}"}'>${C.cost}</button>`);}
  else if(tab==='town'){h+=bwStandings();h+=`<p class="bzs">Everyone selling to Marrow Hollow. ${me?'Play it straight, or don’t.':'Open a shop of your own to take them on.'}</p>`;
    if(me)h+=`<p class="bwrules"><b>Dirty tricks:</b> a rumour −12 off their good name · tearing down takes their handbills and barn paint · spoiling ruins a third of their stock.<br><b>If you’re seen</b> (one time in four, more once caught): −15 off yours, a ${BW_FINE} fine, and the whole town knows.</p>`;
    for(const [k,s] of Object.entries(B.shops)){if(k===n)continue;const last=(s.log||[]).slice(-1)[0];const ads=(s.ads||[]).filter(a=>!a.until||a.until>=S.day).map(a=>({bills:'handbills',courier:'the Courier',barn:'a barn'})[a.k]);
      h+=`<div class="bwshop"><div class="bwhd"><b>${bizEsc(s.name)}</b> <small>${s.ai?s.owner:bizEsc(s.owner)} · ${bwTypes(s).map(t=>BIZ_TYPES[t].name.toLowerCase()).join(' and ')}${s.stall?' · Wickham stall':''}</small></div>
        <div class="bwst"><span>Price: <b>${BW_PRICE[s.price].name}</b></span><span>Good name ${bwBar(s.rep)}</span><span>${ads.length?'Advertising: '+ads.join(', '):'No adverts'}</span><span>${s.lastRev==null?'Not open a day yet':s.lastRev>=120?'Busy yesterday':s.lastRev>=40?'Steady yesterday':'Quiet yesterday'}</span><span>Talk: ${bwTalkOf(s)}</span></div>`;
      for(const w of s.staff||[]){const W=bwW(w.id);h+=bizRow(`${W.name} <small>serves ${W.skill} a day · paid ${w.pay}${w.loyal>=.25?' · loyal':''}</small>`,'',me&&me.staff.length<4?`<button data-bw='{"a":"poach","w":"${w.id}"}'>Offer ${Math.round(w.pay*1.3)} a day · ${w.pay*2}</button>`:'');}
      if(me)h+=`<div class="bwdirt">${Object.entries(BW_DIRTY).map(([dk,D])=>`<button data-bw='${bwJ({a:'dirty',k:dk,t:k})}' title="${D.desc}">${D.name} · ${D.cost||'free'}</button>`).join('')}</div>`;
      h+='</div>';}
    h+=`<h4>Talk of the town</h4>`;h+=B.talk.length?B.talk.slice(0,8).map(t=>`<p class="bzs">Day ${t.day}: ${bizEsc(t.t)}</p>`).join(''):'<p class="bzs">Nothing worth repeating yet.</p>';}
  else{const open=B.tenders.filter(t=>!t.done);h+=`<p class="bzs">The Lamplighter and the Lantern Inn put out for a supplier now and then. Put in a price for each crate; the best offer from the best-thought-of shop gets the deal, and its crates go before the shop opens each morning. Run short twice and they find someone else.</p>`;
    if(!open.length)h+=`<p class="bzs"><i>Nobody is asking right now.</i></p>`;
    for(const t of open){const mine=t.bids[n];const sells=me&&bwTypes(me).includes(t.cat);const what=t.cat==='stand'?'crates of produce':t.cat==='kitchen'?'cooked dishes':'jugs to drink';
      h+=bizRow(`<b>${t.who}</b><small>${t.n} ${what} a day for ${t.days} days. Decided tomorrow morning. They’d pay about ${t.ref} each at the going rate.</small>`,'',
        !me?'<small>Open a shop first</small>':!sells?'<small>You don’t sell that</small>':
        `<input type="number" min="1" max="999" value="${mine?mine.unit:t.ref}" data-bwunit="${t.id}" class="bwnum">${mine&&mine.bribe?'<small class="bwbr">envelope in</small>':`<label class="bwbr"><input type="checkbox" data-bwbribe="${t.id}"> ${BW_BRIBE} under the table</label>`}<button data-bwbid="${t.id}">${mine?'Change':'Offer'}</button>`);
      const offers=Object.keys(t.bids).length;if(mine){const lead=Object.keys(t.bids).every(k=>k===n||bwBidScore(t,k)<=bwBidScore(t,n));
        h+=`<p class="${lead?'bwlead':'bwwarn'}">Your offer: ${mine.unit} each${mine.bribe?', with an envelope':''}. ${offers-1?`${offers-1} other offer${offers>2?'s':''} in. ${lead?'Yours looks the best of them, for now.':'Someone’s looks better: a lower price, or a better name.'}`:'Nobody else has offered yet.'} You can change it until morning.</p>`;}
      else if(offers)h+=`<p class="bzs">${offers} offer${offers>1?'s':''} in already.</p>`;}
    h+=`<h4>Running deals</h4>`;h+=B.deals.length?B.deals.map(d=>bizRow(`<b>${d.who}</b> ← ${bizEsc((B.shops[d.shop]||{}).name||'?')}<small>${d.n} a day at ${d.unit} each · ${d.left} day${d.left===1?'':'s'} left${d.short?' · ran short once':''}</small>`)).join(''):'<p class="bzs">None yet.</p>';}
  openNote(h,'Close the ledger',()=>{BWUI.open=false;});const N=$('noteText');if(!N)return;
  N.querySelectorAll('[data-bwtab]').forEach(b=>b.onclick=e=>{e&&e.preventDefault&&e.preventDefault();bwOpen(b.dataset.bwtab);});
  N.querySelectorAll('[data-bw]').forEach(b=>b.onclick=()=>{let d;try{d=JSON.parse(b.dataset.bw);}catch(e){return;}if(d.a==='dirty'&&!confirmDirty(d))return;bwDo(d);});
  N.querySelectorAll('[data-bwopen]').forEach(b=>b.onclick=()=>{const nm=String(($('bzName')&&$('bzName').value)||'').replace(/[<>"]/g,'').replace(/\s+/g,' ').trim().slice(0,24);
    if(!nm){toast('Give it a name first.',2);$('bzName')&&$('bzName').focus();return;}bwDo({a:'open',name:nm,type:b.dataset.bwopen});});
  N.querySelectorAll('[data-bwstock]').forEach(b=>b.onclick=()=>{const [t,id]=b.dataset.bwstock.split(':');const all=!!b.dataset.all;const items=[];
    do{if(t==='P'){const i=S.basket.findIndex(x=>x.kind===id);if(i<0)break;const x=S.basket.splice(i,1)[0];items.push({t,id,value:x.value});}
      else{if(inv(id)<=0)break;takeInv(id,1);items.push({t,id,value:sellPrice(id)||ITEMS[id].sell||5});}}while(all&&items.length<200);
    if(items.length){SFX.thud&&SFX.thud(0,.15);bwDo({a:'stock',items});}});
  N.querySelectorAll('[data-bwbid]').forEach(b=>b.onclick=()=>{const id=+b.dataset.bwbid;const u=N.querySelector(`[data-bwunit="${id}"]`),br=N.querySelector(`[data-bwbribe="${id}"]`);bwDo({a:'bid',id,unit:+(u&&u.value)||1,bribe:!!(br&&br.checked)});});}
// a dirty trick asks once more (the first time each day)
function confirmDirty(d){const k='bwd'+S.day+d.k+d.t;if(BWUI[k])return true;BWUI[k]=1;toast(`${BW_DIRTY[d.k].desc} About ${Math.round(BW_DIRTY[d.k].odds*100)} in 100 you’re seen. Tap again to do it.`,3.4);return false;}
// the ledger opens the war in a contest world (the shares in town shops stay a thing for farms that aren't fighting)
{const _bo=bizOpen;bizOpen=function(tab){if(bwOn())return bwOpen(tab==='shares'?'own':tab);return _bo.apply(this,arguments);};}
// ---- every player's shop has its board on the green
const BW_SIGN_AT=[{x:50.4,z:-1.6},{x:44.6,z:-1.6},{x:54.0,z:1.6},{x:43.2,z:4.2},{x:53.8,z:5.4}];   // on the grass round the bandstand, clear of the lamps, benches and the memorial
const BWS={objs:[],its:[],sig:''};
// a shop's board says what it sells (a crate of produce, a tankard, a stew pot hung under the board), and shows the war:
// handbills pasted on the posts while an advert runs, torn scraps for two days after someone rips them down
const BW_ICON={stand:['..r.g.rr.','.rrgrrgrr','ooooooooo','oaaaaaaao','ocbbbbbco','oaaaaaaao','ocbbbbbco','ooooooooo'],
  taproom:['.fff.f...','offfffo..','otttsoooo','otttso..o','otttso..o','otttsoooo','otttso...','.oooo....'],
  kitchen:['...ooo...','..ollio..','.ooooooo.','okllllllo','okklllllo','okkklllko','.okkkkko.','..o...o..']};
const BW_PAL={o:'#2a180a',a:'#c8955a',b:'#9a6a3a',c:'#6a4424',r:'#b8402a',g:'#6a9a3a',f:'#f4eedc',t:'#b8b4a8',s:'#7a766c',k:'#2a2a2e',l:'#4a4a52',i:'#8a8a94'};
const bwSignState=s=>((s.ads||[]).some(a=>a.k!=='courier'&&(!a.until||a.until>=S.day))?'A':'')+(s.torn&&S.day-s.torn<=2?'T':'')+s.type;
function bwSignSprite(s){const base=signSprite(s.name.toUpperCase().slice(0,22),s.up.sign?undefined:'plain');const st=bwSignState(s),key=base+':bw:'+st;if(SPR[key])return key;
  const src=IMG[base],m=SPR[base];if(!src)return base;const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');g.drawImage(src,0,0);
  const P=(x,y,col)=>{g.fillStyle=col;g.fillRect(x,y,1,1);};const tip=s.up.sign?6:0,bw=c.width-4-tip,bx0=2;
  const posts=bw>52?[bx0+Math.round(bw*.22),bx0+Math.round(bw*.78)-3]:[bx0+Math.round(bw/2)-2];
  // the trade, hung under the board's left end on two short chains
  const ic=BW_ICON[s.type]||BW_ICON.stand,ix=bx0+3,iy=21;P(ix+1,20,'#3a2e28');P(ix+ic[0].length-2,20,'#3a2e28');
  ic.forEach((row,y)=>[...row].forEach((ch,x)=>{if(BW_PAL[ch])P(ix+x,iy+y,BW_PAL[ch]);}));
  // handbills on the posts, or what's left of them
  for(const px of posts){if(st.includes('A')){for(let y=24;y<30;y++)for(let x=px-1;x<px+4;x++)P(x,y,y===24?'#d8d0bc':'#efe8d6');P(px,26,'#6a6458');P(px+1,26,'#6a6458');P(px+2,26,'#6a6458');P(px,28,'#6a6458');P(px+1,28,'#6a6458');P(px+1,23,'#3a2e28');}
    else if(st.includes('T')){for(const [x,y] of [[-1,25],[0,25],[0,26],[2,24],[3,25],[3,27],[1,29],[2,29]])P(px+x,y,'#e6dcc6');P(px-3,37,'#e6dcc6');P(px-2,37,'#d8ccb4');P(px+5,38,'#e6dcc6');}}
  IMG[key]=c;SPR[key]=Object.assign({},m,{src:key});return key;}
function bwSigns(){const on=bwOn();const ps=on?Object.values(BW().shops).filter(s=>!s.ai).slice(0,BW_SIGN_AT.length):[];
  const sig=ps.map(s=>s.owner+'|'+s.name+'|'+(s.up.sign?1:0)+'|'+bwSignState(s)).join(',');if(sig===BWS.sig)return;BWS.sig=sig;
  for(const o of BWS.objs){o.hide=true;const i=OBJ.indexOf(o);if(i>=0)OBJ.splice(i,1);}for(const it of BWS.its){const i=interact.indexOf(it);if(i>=0)interact.splice(i,1);}BWS.objs=[];BWS.its=[];
  ps.forEach((s,i)=>{const at=BW_SIGN_AT[i];try{const o=obj('signpost',at.x,at.z,{kind:'prop',label:s.name.toUpperCase(),face:'P'});o.spr=bwSignSprite(s);BWS.objs.push(o);}catch(e){}
    const it={x:at.x,z:at.z+.5,r:1,on:()=>!S.room&&bwOn(),label:()=>s.owner===bwMe()?'Ledger':`${s.name}`,ok:()=>true,act(){bwOpen(s.owner===bwMe()?'own':'town');}};interact.unshift(it);BWS.its.push(it);});}
{let t=0;const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);t+=dt;if(t<1)return;t=0;try{if(bwOn()||BWS.sig)bwSigns();}catch(e){}};}
{const css=document.createElement('style');css.textContent=`#noteText .bwshop{margin:8px 0;padding:6px 8px;background:rgba(90,60,30,.08);box-shadow:inset 0 0 0 1px rgba(90,60,30,.25)}
#noteText .bwhd small{opacity:.75}#noteText .bwst{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12px;margin:4px 0}
#noteText .bwdirt{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}#noteText .bwdirt button{font:inherit;font-size:12px;padding:4px 8px;background:#5a1a12;color:#f4e6c8;border:0;cursor:pointer}
#noteText .bwnum{font:inherit;font-size:14px;width:56px;padding:3px;background:#fbf3e0;color:#3a2414;border:1px solid #6a4a2a}#noteText .bwbr{font-size:11px;display:inline-flex;align-items:center;gap:3px;margin:0 6px}
#noteText .bztabs{flex-wrap:wrap}#noteText .bwstand{margin:6px 0 10px;padding:6px 8px;background:#3a2210;color:#f4e6c8}#noteText .bwsh{font-size:13px;margin-bottom:4px}#noteText .bwsh small{opacity:.7}
#noteText .bwrow{display:grid;grid-template-columns:minmax(70px,34%) 1fr auto;gap:8px;align-items:center;font-size:12px;margin:3px 0}#noteText .bwrow .bwn{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#noteText .bwb{height:8px;background:#1e1208;box-shadow:inset 0 0 0 1px #120a04}#noteText .bwb i{display:block;height:100%;background:#7a5232}#noteText .bwrow.me .bwb i{background:#e0a050}#noteText .bwrow.me .bwn{color:#ffd27a}
#noteText .bwv em{font-style:normal}#noteText .bwv small{font-size:12px;opacity:.7}#noteText .bwv .up{color:#9ad06a}#noteText .bwv .dn{color:#e07a5a}@media (max-width:600px){#noteText .bwrow{grid-template-columns:1fr auto;row-gap:2px}#noteText .bwrow .bwn{grid-column:1/-1;white-space:normal}}#noteText .bwv .eq{color:#b8a888}#noteText .bwwhy{font-size:11px;margin:4px 0 0;opacity:.85}
#noteText .bwwarn{font-size:12px;margin:2px 0 8px;color:#8a2a14}#noteText .bwlead{font-size:12px;margin:2px 0 8px;color:#2f6b22}#noteText .bwrules{font-size:11px;margin:2px 0 8px;opacity:.85}#noteText a[data-bwtab]{color:#8a4a10}#noteText .bztabs button{white-space:nowrap}`;document.head.appendChild(css);}
