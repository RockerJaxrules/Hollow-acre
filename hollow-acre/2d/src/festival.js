/* ================= festivals and weddings. Four days a month the whole town turns out in the square, which is dressed for it:
   the 7th  Harvest Market   (9am-5pm)   the market stall pays half again for your harvest, and sells things you can't get otherwise
   the 14th Pumpkin Weigh-in (10am-4pm)  bring your best pumpkin to the scale against Otto's, Orla's and Ezra's; ribbons and prizes
   the 21st Lantern Dance    (5pm-7:45pm) ask someone to dance, then keep time with them on the floor (a little rhythm game)
   the 28th Hollow Fair      (10am-5pm)  the ring toss: five rings, a prize for every peg
   And weddings: once you're dating someone and they're at ten hearts, an old Marrow ring from Bell's Feed & Stock asks the
   question. Three days later the town gathers in the square at ten in the morning and you're married. Your spouse comes to the
   farm every morning after. ================= */
S.fest=S.fest||{};
const FESTS={7:{k:'market',name:'Harvest Market',from:9,to:17,say:'It’s the Harvest Market in the town square today. The stall pays half again for crops.'},
  14:{k:'weigh',name:'Pumpkin Weigh-in',from:10,to:16,say:'It’s the Pumpkin Weigh-in in the town square today. Bring your biggest pumpkin.'},
  21:{k:'dance',name:'Lantern Dance',from:17,to:19.75,say:'Tonight at five it’s the Lantern Dance in the town square. Ask someone to dance.'},
  28:{k:'fair',name:'Hollow Fair',from:10,to:17,say:'It’s the Hollow Fair in the town square today: the ring toss, and prizes.'}};
const fToday=()=>FESTS[dayOfMonth()]||null;
const fOn=()=>{const f=fToday();return f&&S.hour>=f.from&&S.hour<f.to?f:null;};
const fWedding=()=>{for(const [id,r] of Object.entries(S.rom||{}))if(r.wedding===S.day&&!r.married)return id;return null;};
const fGather=()=>fOn()||(fWedding()&&S.hour>=9&&S.hour<13);
Object.assign(PL,{fest:[squarePos.x,squarePos.z+4.2,4.6]});
const F_SQ={x:squarePos.x,z:squarePos.z+4.6};
// ---- the townsfolk come to it (Wickham's stay home: it's a long walk)
{const _wf=wantFor;wantFor=function(n){const w=_wf.apply(this,arguments);if(!fGather())return w;const L=LIFE[n.def.id];const h=L&&HOMES[L.home];
  if(h&&h.door&&h.door[0]>90)return w;return 'fest';};}
// ---- the square, dressed
const FDEC=[];
{const mk=(spr,x,z,kind)=>{const o=obj(spr,x,z,{kind:kind||'prop',hide:true,noCol:kind==='flat'});FDEC.push(o);return o;};
  const q=squarePos;mk('f_bunting',q.x-4.6,q.z-6.6);mk('f_bunting',q.x+4.6,q.z-6.6);mk('f_lanterns',q.x-6.8,q.z+5.2);mk('f_lanterns',q.x+6.8,q.z+5.2);
  FDEC.floor=mk('f_floor',q.x,q.z+6.4,'flat');FDEC.scale=mk('f_scale',q.x+6.2,q.z+3.2);FDEC.toss=mk('f_ringtoss',q.x-6.2,q.z+3.4);FDEC.stall=mk('wk_stall',q.x-6.4,q.z+3);}
function fDress(){const f=fToday(),w=fWedding();const on=!!(f||w)&&!S.room;
  for(const o of FDEC){o.hide=!on;}if(!on)return;
  FDEC.floor.hide=!(f&&f.k==='dance')&&!w;FDEC.scale.hide=!(f&&f.k==='weigh');FDEC.toss.hide=!(f&&f.k==='fair');FDEC.stall.hide=!(f&&f.k==='market');}
// ---- telling you: in the morning, and in the journal
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);setTimeout(()=>{const f=fToday(),w=fWedding();
  if(w)toast(`Today is your wedding. Be in the town square by ten. ${sgName(w)} is already up.`,5);else if(f)toast(f.say,4.4);},2400);return r;};}
{const _oj=openJournal;openJournal=function(){const r=_oj.apply(this,arguments);try{const el=$('noteText');const sub=el&&el.querySelector('.jsub');if(!sub||el.querySelector('.fcal'))return r;
  const d=dayOfMonth();const next=Object.keys(FESTS).map(Number).map(k=>[k,FESTS[k]]).sort((a,b)=>((a[0]-d+28)%28)-((b[0]-d+28)%28));
  sub.insertAdjacentHTML('afterend',`<h4 class="fcal">Festivals</h4>`+next.map(([k,f])=>`<p>${k===d?'<b>Today</b>':((k-d+28)%28===1?'Tomorrow':`In ${(k-d+28)%28} days`)} · <b>${f.name}</b>, the town square, ${clockH(f.from)}–${clockH(f.to)}</p>`).join(''));}catch(e){}return r;};}
// ---- the market stall
ITEMS.candy_apple=ITEMS.candy_apple||{name:'Candied apple',food:[30,6],icon:'it_candy_apple',desc:'Bright red, sticky, a little bit too sweet. Sold only at the Harvest Market. +30 energy.'};
vendors.fest_market={name:'Harvest Market stall',sub:'Caitlyn and Pip, behind a stall full of jars. “Market prices. Real ones, for once.”',rows:()=>{const v=S.basket.reduce((a,b)=>a+(b.value||0),0);return [
  {k:'sellall',name:'Sell your basket at market prices',desc:S.basket.length?`${S.basket.length} things in your basket. Half again what the bin pays: ${Math.round(v*1.5)} coins.`:'Your basket is empty.',price:0,can:S.basket.length>0,
   buy(){const c=Math.round(v*1.5);S.coins+=c;S.basket.length=0;toast(`Sold. +${c} coins.`,2);for(const id of ['mae','pip'])if(npcById(id))addFriend(id,10);updateHud();}},
  {k:'apple',name:'Candied apple',desc:'+30 energy. Only at the market.',price:8,can:true,buy(){addInv('candy_apple');}},
  {k:'pie',name:'Pumpkin pie',desc:'Everybody loves pie. Everybody.',price:40,can:true,buy(){addInv('pie');}},
  {k:'bq',name:'Wildflower bouquet',desc:'Market price. For asking someone out.',price:30,can:true,buy(){addInv('bouquet');}},
  {k:'ring',name:'Marrow ring',desc:'Market price. For asking someone to marry you.',price:220,can:inv('ring')<1,buy(){addInv('ring');}}];}};
interact.push({x:squarePos.x-6.4,z:squarePos.z+3.8,r:1.4,story:true,on:()=>{const f=fOn();return !!(f&&f.k==='market')&&!S.room;},label:()=>'Market stall',ok:()=>true,act(){openShop('fest_market');}});
// ---- the weigh-in
interact.push({x:squarePos.x+6.2,z:squarePos.z+4,r:1.4,story:true,on:()=>{const f=fOn();return !!(f&&f.k==='weigh')&&!S.room;},label:()=>S.fest['weigh'+S.day]?'The scale':'Enter the weigh-in',ok:()=>true,act(){
  if(S.fest['weigh'+S.day]){toast('Your pumpkin’s already on the scale. Come back next month.',2);return;}
  const ps=S.basket.filter(b=>b.kind==='pumpkin');if(!ps.length){toast('You need a pumpkin in your basket to enter. Grow one, then bring it.',2.6);SFX.deny&&SFX.deny();return;}
  const best=ps.sort((a,b)=>(b.value||0)-(a.value||0))[0];S.basket.splice(S.basket.indexOf(best),1);S.fest['weigh'+S.day]=1;
  const me=Math.round(22+(best.value||18)*1.4+Math.random()*14);const rivals=[['Otto',38+Math.random()*30],['Orla',34+Math.random()*30],['Ezra',30+Math.random()*34]].map(([n,w])=>[n,Math.round(w)]);
  const all=[['You',me],...rivals].sort((a,b)=>b[1]-a[1]);const place=all.findIndex(a=>a[0]==='You');const prize=[150,80,40,0][place];
  S.coins+=prize;for(const n of npcs)if(PEOPLE[n.def.id]&&Math.hypot(n.x-F_SQ.x,n.z-F_SQ.z)<12)addFriend(n.def.id,place<3?20:8);updateHud();
  openNote(`<h3>Pumpkin Weigh-in</h3><p>Hale reads the scale out loud, as if it’s scripture.</p>`+all.map((a,i)=>`<p>${['🥇','🥈','🥉','·'][i]} <b>${a[0]}</b>: ${a[1]} lb</p>`).join('')+
    `<p>${place===0?'First! The whole square cheers. Otto shakes your hand for a long time and says it’s the soil. It’s always the soil.':place<3?'A ribbon. Not bad at all for a farm that was weeds a month ago.':'Not this year. Otto pats your pumpkin like a dog. “Next year.”'}${prize?` <b>+${prize} coins.</b>`:''}</p>`,'Lovely');SFX.coin&&SFX.coin();}});
// ---- the dance
interact.push({x:squarePos.x,z:squarePos.z+5.4,r:2.2,story:true,on:()=>{const f=fOn();return !!(f&&f.k==='dance')&&!S.room&&!S.fest['dance'+S.day];},label:()=>'Ask someone to dance',ok:()=>true,act(){
  const here=npcs.filter(n=>PEOPLE[n.def.id]&&n.vis!==false&&Math.hypot(n.x-F_SQ.x,n.z-F_SQ.z)<14);
  const cand=here.filter(n=>(typeof romDating==='function'&&romDating(n.def.id))||hearts(n.def.id)>=4).sort((a,b)=>(romDating(b.def.id)?100:0)+hearts(b.def.id)-(romDating(a.def.id)?100:0)-hearts(a.def.id)).slice(0,6);
  if(!cand.length){toast('Nobody here knows you well enough to dance with you yet. Make friends (4 hearts), then ask.',3);return;}
  openNote('<h3>Lantern Dance</h3><p>Who will you ask?</p><p style="text-align:center">'+cand.map(n=>`<button class="btn fDance" data-id="${n.def.id}" style="margin:3px">${n.def.name.split(' ')[0]}${romDating(n.def.id)?' ♥':''}</button>`).join('')+'</p>','Not yet');
  document.querySelectorAll('#noteText .fDance').forEach(b=>b.addEventListener('click',()=>{$('note').hidden=true;noteCb=null;fRhythm(b.dataset.id);},{once:true}));}});
// ---- the ring toss
interact.push({x:squarePos.x-6.2,z:squarePos.z+4.2,r:1.4,story:true,on:()=>{const f=fOn();return !!(f&&f.k==='fair')&&!S.room;},label:()=>'Ring toss',ok:()=>true,act(){
  if(S.fest['toss'+S.day]>=3){toast('Three goes is the limit. Nell runs the stall and she’s strict about it.',2.4);return;}
  if(S.coins<5){toast('Five coins a go.',1.6);return;}S.coins-=5;updateHud();S.fest['toss'+S.day]=(S.fest['toss'+S.day]||0)+1;fToss();}});
// ---- the little games: keep time with your partner, and throw the rings
function fGame(title,hint,draw,press,done){const d=document.createElement('div');d.id='fGame';d.innerHTML=`<div class="box"><div class="t">${title}</div><canvas width="320" height="150"></canvas><div class="h">${hint}</div></div>`;document.body.appendChild(d);
  const cv=d.querySelector('canvas'),g=cv.getContext('2d');S.paused=true;let t0=performance.now(),over=false;
  const end=r=>{if(over)return;over=true;removeEventListener('keydown',kd,true);d.remove();S.paused=false;done(r);};
  const hit=e=>{e&&e.preventDefault&&e.preventDefault();if(!over)press((performance.now()-t0)/1000,end);};
  const kd=e=>{if(e.code==='Space'||e.code==='Enter'||e.code==='KeyE'){e.preventDefault();e.stopPropagation();if(!e.repeat)hit();}if(e.code==='Escape'){e.preventDefault();e.stopPropagation();end(null);}};
  addEventListener('keydown',kd,true);cv.addEventListener('pointerdown',hit);
  const loop=()=>{if(over)return;const t=(performance.now()-t0)/1000;g.fillStyle='#1c120c';g.fillRect(0,0,320,150);const r=draw(g,t,end);requestAnimationFrame(loop);};loop();}
function fRhythm(id){const nm=sgName(id),N=16,BEAT=.62,T0=1.4;const notes=Array.from({length:N},(_,i)=>({t:T0+i*BEAT*(i%4===3?1.5:1)+(i>7?.3:0),hit:null}));let score=0,flash=0;
  fGame(`Lantern Dance with ${nm}`,'Tap (or press Space) as each lantern reaches the ring.',(g,t,end)=>{
    for(let x=0;x<320;x+=40){g.fillStyle=x%80?'#3a2616':'#4a301c';g.fillRect(x,0,40,150);}
    g.strokeStyle='#e8c070';g.lineWidth=3;g.beginPath();g.arc(70,75,16,0,6.283);g.stroke();if(flash>0){g.fillStyle=`rgba(255,220,120,${flash})`;g.beginPath();g.arc(70,75,16,0,6.283);g.fill();flash-=.05;}
    for(const n of notes){const x=70+(n.t-t)*170;if(x<-20||x>340||n.hit===true)continue;g.fillStyle=n.hit===false?'#6a3a2a':'#f0a040';g.beginPath();g.ellipse(x,75,9,11,0,0,6.283);g.fill();g.fillStyle='#ffe0a0';g.fillRect(x-3,68,4,5);}
    g.fillStyle='#f4e6c8';g.font='12px monospace';g.fillText(`${score}/${N}`,280,20);
    for(const n of notes)if(n.hit===null&&t-n.t>.22)n.hit=false;if(t>notes[N-1].t+1)end(score/N);},
   (t)=>{let best=null,bd=.2;for(const n of notes){if(n.hit!==null)continue;const d=Math.abs(n.t-t);if(d<bd){bd=d;best=n;}}if(best){best.hit=true;score++;flash=.8;A.tone&&A.tone(440+score*30,.12,'triangle',.06);}else A.tone&&A.tone(150,.1,'square',.03);},
   r=>{if(r===null)return;S.fest['dance'+S.day]=1;const good=r>.75?2:r>.45?1:0;addFriend(id,[30,60,110][good]);
     const d=typeof romDating==='function'&&romDating(id);
     playScene(id,'Lantern Dance',[`You step on ${nm}’s feet more than once. ${nm} laughs every time, too loud, and doesn’t let go.`,`You find the time halfway through, and after that it’s easy. The lanterns turn over your heads like slow moths.`,`You and ${nm} are the last two on the floor. The band keeps playing just for you, and nobody in the square says a word about it.`][good]+
       `<br><br>`+(d?`<q>Same time next month,</q> ${nm} says into your shoulder. <q>And the one after that. All of them.</q>`:`<q>That was nice,</q> ${nm} says, a bit surprised. <q>Ask me again sometime.</q>`),()=>{toast(`${nm} ♥ +${[30,60,110][good]/100>=1?'1':'a little'}. Dance score ${Math.round(r*16)}/16.`,2.6);});});}
function fToss(){const pegs=[40,90,140,190,240,290];let throws=0,hits=0,last=null;
  fGame('Ring toss','Tap (or press Space) when the ring is over a peg. Five rings.',(g,t,end)=>{
    g.fillStyle='#a8301c';g.fillRect(10,40,300,80);g.fillStyle='#c8402a';g.fillRect(10,40,300,8);
    for(const p of pegs){g.fillStyle='#e8dcc0';g.fillRect(p-2,70,4,22);}
    const x=165+Math.sin(t*(2.2+throws*.35))*150;g.strokeStyle='#e8c070';g.lineWidth=3;g.beginPath();g.ellipse(x,62,11,5,0,0,6.283);g.stroke();
    if(last){g.fillStyle=last.ok?'#8fd06a':'#e06a50';g.font='14px monospace';g.fillText(last.ok?'Ringer!':'Missed',130,140);}
    g.fillStyle='#f4e6c8';g.font='12px monospace';g.fillText(`Rings ${5-throws} · Pegs ${hits}`,12,20);if(throws>=5&&!last.wait){last.wait=1;setTimeout(()=>end(hits),700);}},
   (t,end)=>{if(throws>=5)return;const x=165+Math.sin(t*(2.2+throws*.35))*150;const ok=pegs.some(p=>Math.abs(p-x)<9);throws++;if(ok)hits++;last={ok};A.tone&&A.tone(ok?660:180,.14,ok?'triangle':'square',.06);},
   r=>{if(r===null)return;const prize=[[0,'Nell gives you a consolation pat on the shoulder.'],[15,'+15 coins.'],[40,'+40 coins.'],[60,'+60 coins and a candied apple.'],[90,'+90 coins and a pie.'],[150,'All five! +150 coins, a pie, and Nell shouts it across the square.']][r];
     S.coins+=prize[0];if(r>=3)addInv('candy_apple');if(r>=4)addInv('pie');updateHud();toast(`Ring toss: ${r}/5 pegs. ${prize[1]}`,3);SFX.coin&&r&&SFX.coin();});}
{const st=document.createElement('style');st.textContent=`#fGame{position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55)}
#fGame .box{background:#2a1a0e;padding:12px 14px;box-shadow:0 0 0 2px #1a0e06,0 0 0 4px #b8521c;color:#f4e6c8;text-align:center;zoom:var(--su,1)}
#fGame .t{font-size:16px;margin-bottom:8px;color:#ffd27a}#fGame canvas{width:min(84vw,480px);image-rendering:pixelated;touch-action:none;display:block}#fGame .h{font-size:12px;opacity:.8;margin-top:6px}`;document.head.appendChild(st);}
// ---- weddings
ITEMS.ring={name:'Marrow ring',icon:'it_ring',desc:'An old iron ring with a red stone, the kind the valley has always married with. Give it to someone you’re dating at ten hearts to ask them to marry you.'};
{const _vf=vendors.v_feed.rows;vendors.v_feed.rows=()=>{const r=_vf();r.push({k:'ring',name:'Marrow ring',desc:'For asking someone to marry you. They must be dating you, at ten hearts.',price:300,can:inv('ring')<1,
  buy(){addInv('ring');toast('Ezra hands it over without a word, then says, very quietly: “Good.”',2.6);}});return r;};}
{const _og=openGift;openGift=function(n){_og.apply(this,arguments);if(!n||!ROMANCE[n.def.id]||inv('ring')<=0)return;const id=n.def.id;const R=S.rom[id]||{};if(R.married||R.wedding)return;
  let row=$('talk').querySelector('.giftrow');if(!row){row=document.createElement('div');row.className='giftrow';$('talk').querySelector('.acts').before(row);}
  const b=document.createElement('button');b.className='buy';b.textContent='Marrow ring: ask them to marry you';b.addEventListener('click',()=>fPropose(n));row.insertBefore(b,row.firstChild);};}
function fPropose(n){const id=n.def.id,nm=sgName(id);$('talk').hidden=true;talkingTo=null;
  if(!romDating(id)||hearts(id)<10){playScene(id,'The ring',`${nm} looks at the ring for a long time, and then closes your hand back round it.<br><br><q>Not yet. Ask me when you’re sure about me. ${romDating(id)?'Ten hearts sure.':'You haven’t even asked me out.'}</q>`);return;}
  takeInv('ring',1);S.rom[id]=Object.assign(S.rom[id]||{},{wedding:S.day+3});
  playScene(id,'The ring',`${nm} puts both hands over their mouth.<br><br>Then laughs, and cries, and laughs, and holds out a hand that is shaking so badly you can hardly get the ring on.<br><br><q>Yes. Yes. In the square, in front of all of them. Let them watch something good for once.</q>`,
    ()=>{addLore(`${nm} said yes. The wedding is in three days, in the town square, at ten.`);journalNote(`Engaged to ${nm}.`);toast(`The wedding is in three days, day ${S.day+3}, in the town square at ten in the morning.`,4.5);});}
function fWedTick(){if(S.mode!=='play'||S.paused||SCENE||S.room)return;const id=fWedding();if(!id||S.hour<9.5||S.hour>=13)return;if(Math.hypot(P.x-F_SQ.x,P.z-F_SQ.z)>5)return;
  const nm=sgName(id);S.rom[id].married=S.day;
  playScene(id,'The wedding',`The whole town is in the square. Everyone. Even Dunn, at the back, hat in his hands.<br><br>Hale reads the words. For once he doesn’t read a name off a slip. He reads yours, and then ${nm}’s, and nobody claps politely: they cheer.<br><br>${nm} is crying, and laughing, and holding your hands so hard your knuckles go white. Iris made the dress overnight. Ida plays the organ through the church’s open doors, something fast and silly.<br><br>Afterwards they dance on the square till the lanterns burn down, and for one whole afternoon the valley forgets to be afraid.`,
    ()=>{for(const n of npcs)if(PEOPLE[n.def.id])addFriend(n.def.id,20);addLore(`You married ${nm} in the town square. For one afternoon, the valley forgot to be afraid.`);journalNote(`Married ${nm}.`);
      const L=LIFE[id];if(L&&L.day&&!L.wed){L.wed=1;L.day=[[6,'farmgate'],[8.5,L.day.find(d=>d[0]>=8)?L.day.find(d=>d[0]>=8)[1]:L.day[0][1]],...L.day.filter(d=>d[0]>8.5)];}
      toast(`You’re married to ${nm}. They’ll come by the farm every morning.`,4);});}
// married: the morning visit survives a reload, and they say so
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);try{for(const [id,R] of Object.entries(S.rom||{}))if(R.married){const L=LIFE[id];if(L&&L.day&&!L.wed){L.wed=1;L.day=[[6,'farmgate'],[8.5,(L.day.find(d=>d[0]>=8)||L.day[0])[1]],...L.day.filter(d=>d[0]>8.5)];}}}catch(e){}return r;};}
{const _st=socialTalk;socialTalk=function(n){const r=_st.apply(this,arguments);const id=n&&n.def&&n.def.id;const R=S.rom&&S.rom[id];if(!R||!R.married||$('talk').hidden||isNight())return r;
  const L=['I brought you breakfast. It’s on the porch. The scarecrow didn’t touch it. I checked.','Morning, husband-or-wife-or-whatever-we-are. I like it. Whatever it is.','I watered the far row. Don’t tell me I did it wrong. I know I did it wrong.','Every morning I walk up this lane and you’re still here. Every morning.','The town still looks at us funny. Let them look.'];
  if((S.day+(S.talked[id]||0))%2===0)$('talkLine').innerHTML=`<q>${L[(S.day*3+(S.talked[id]||0))%L.length]}</q>`;return r;};}
setInterval(()=>{try{fDress();fWedTick();}catch(e){}},500);
