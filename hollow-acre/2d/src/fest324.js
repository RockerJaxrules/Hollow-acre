/* ================= t324 the festivals, made to be played. Not the Tithe (that one plays itself): the four days a month the
   town turns out in the square become real events, the way a valley fair should be.
   - YOU ARRIVE and it starts: the host meets you with what's on today, and the clock slows right down while you're on the
     green (a festival is a long afternoon, not a lunch break).
   - THE HARVEST MARKET (7th): the market stall as before; the BEST TABLE contest (lay out up to nine of your best things on
     your table by the bandstand; at two Hale walks the tables and scores them for variety, quality and worth, against Orla's,
     Ezra's and Hob's); and APPLE BOBBING at the barrel by the steps.
   - THE PUMPKIN WEIGH-IN (14th): pick which pumpkin goes on the scale (the heavier the better: grow them big), then at half
     past two Hale weighs them all in front of everyone; and the CARVING TABLE: carve a face, and at half past three the town
     votes on the carvings, yours against Bram's, Finn's, Iris's and Silas's.
   - THE LANTERN DANCE (21st): as before, with Hale's welcome.
   - THE HOLLOW FAIR (28th): the RING TOSS (throw them now: aim and power), RING THE BELL (the strength test), the CROW SHOOT
     (the shooting gallery: tin crows, a slingshot, and a cut-out you must not hit), ADA'S CARDS (the blind woman reads your
     fortune), and Nell's PRIZE BOOTH, which takes only fair tickets. Every game pays out in fair tickets.
   Friends on the farm enter the same contests: what each of you enters is shared, so the tables and the scale are everyone's.
   The games themselves are in fest324g.js. ================= */
const F2S=()=>S.f2||(S.f2={tix:0,days:{},rec:{}});
const f2D=()=>{const s=F2S();if(!s.days[S.day]){s.days[S.day]={};for(const k of Object.keys(s.days))if(+k<S.day-30)delete s.days[k];}return s.days[S.day];};
const F2_HOST={market:'mae',weigh:'hale',dance:'hale',fair:'nell'};
const f2Live=()=>{const f=typeof fOn==='function'&&fOn();return f&&f.k!=='float'&&!S.room?f:null;};
const f2Near=(r)=>Math.hypot(P.x-F_SQ.x,P.z-(F_SQ.z-3))<(r||16);
const f2At=()=>{const f=f2Live();return f&&f2Near()?f:null;};
const f2Name=id=>{try{return sgName(id);}catch(e){const n=npcById(id);return n?n.def.name.split(' ')[0]:id;}};
const f2Me=()=>NAME()||'You';
const f2Tix=n=>{const s=F2S();s.tix=Math.max(0,(s.tix||0)+n);f2Chip();if(n>0){SFX.coin&&SFX.coin();}};
// ---- where things stand (world units; the square's bandstand is at 48.5,3.4)
const F2P={toss:{x:40.4,z:4.6},bell:{x:37.4,z:3.4},crows:{x:55.6,z:4.4},cards:{x:57.6,z:7.7},prizes:{x:43.7,z:3.2},
  stall:{x:40.2,z:4.4},tables:[{x:53.0,z:4.8},{x:54.7,z:4.8},{x:56.4,z:4.8},{x:58.1,z:4.8}],apples:{x:46.4,z:9.6},carve:{x:40.2,z:4.4},
  scale:{x:squarePos.x+6.2,z:squarePos.z+3.2},judge:{market:{x:56.1,z:6.0},weigh:{x:53.2,z:7.4}}};
// ---- the time runs slow on the green
{const _u=update;update=function(dt){const h0=S.hour;const r=_u.apply(this,arguments);try{if(S.mode==='play'&&f2At()){const d=S.hour-h0;if(d>0&&d<.05)S.hour=h0+d*.35;}}catch(e){}return r;};}
// ---- the dressing: new booths for each day (sprites from tools/festart2.py), and the old ring toss and stall moved out of the lanterns
const F2DEC={};
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{f2Build();}catch(e){console.warn('f2',e);}return r;};}
function f2Build(){const mk=(spr,p,kind)=>{if(!SPR[spr])return null;const o=obj(spr,p.x,p.z,{kind:kind||'prop',hide:true});return o;};
  F2DEC.bell=mk('f2_bell',F2P.bell);F2DEC.crows=mk('f2_gallery',F2P.crows);F2DEC.cards=mk('f2_tent',F2P.cards);F2DEC.prizes=mk('f2_prizes',F2P.prizes);
  F2DEC.tables=F2P.tables.map((p,i)=>mk(i?'f2_table'+(i+1):'f2_table',p));F2DEC.apples=mk('f2_barrel',F2P.apples);F2DEC.carve=mk('f2_carve',F2P.carve);
  if(typeof FDEC!=='undefined'){if(FDEC.toss){FDEC.toss.x=F2P.toss.x;FDEC.toss.z=F2P.toss.z;}if(FDEC.stall){FDEC.stall.x=F2P.stall.x;FDEC.stall.z=F2P.stall.z;}}}
function f2Dress(){const f=typeof fToday==='function'&&fToday();const k=f&&!S.room?f.k:null;const on=(o,b)=>{if(o)o.hide=!b;};
  on(F2DEC.bell,k==='fair');on(F2DEC.crows,k==='fair');on(F2DEC.cards,k==='fair');on(F2DEC.prizes,k==='fair'||k==='market');
  (F2DEC.tables||[]).forEach(o=>on(o,k==='market'));on(F2DEC.apples,k==='market');on(F2DEC.carve,k==='weigh');}
{const _fd=fDress;fDress=function(){_fd.apply(this,arguments);try{f2Dress();}catch(e){}};}
// the old ring toss and market stall spots follow them
for(const it of interact){if(it.x===squarePos.x-6.2&&it.z===squarePos.z+4.2){it.x=F2P.toss.x;it.z=F2P.toss.z+.6;it.act=function(){f2Play('toss');};it.label=()=>'Ring toss · 5 coins';}
  if(it.x===squarePos.x-6.4&&it.z===squarePos.z+3.8){it.x=F2P.stall.x;it.z=F2P.stall.z+.6;}}
// ---- the people: spread round the booths, the host where you can find them, and talk you overhear
Object.assign(PL,{f2_bell:[F2P.bell.x+.9,F2P.bell.z+1.3,.7],f2_toss:[F2P.toss.x+.2,F2P.toss.z+1.5,.8],f2_crows:[F2P.crows.x,F2P.crows.z+1.4,.9],
  f2_cards:[F2P.cards.x-.9,F2P.cards.z+.9,.5],f2_tables:[56.2,6.2,1.6],f2_apples:[F2P.apples.x+.4,F2P.apples.z+1.1,.6],f2_carve:[F2P.carve.x+.3,F2P.carve.z+1.4,.8],
  f2_scale:[F2P.scale.x-.6,F2P.scale.z+1.4,1.0],f2_judgeM:[F2P.judge.market.x,F2P.judge.market.z,.15],f2_judgeW:[F2P.judge.weigh.x,F2P.judge.weigh.z,.15]});
if(typeof PLACE_WORD!=='undefined')for(const k of ['f2_bell','f2_toss','f2_crows','f2_cards','f2_tables','f2_apples','f2_carve','f2_scale','f2_judgeM','f2_judgeW'])PLACE_WORD[k]='at the festival';
const F2_SPOTS={market:['f2_tables','f2_tables','f2_apples','fest','fest'],weigh:['f2_scale','f2_carve','f2_scale','fest'],fair:['f2_bell','f2_toss','f2_crows','f2_cards','fest','f2_bell'],dance:['fest']};
{const _w=wantFor;wantFor=function(n){const w=_w.apply(this,arguments);try{const f=f2Live();if(!f||w!=='fest')return w;const id=n.def.id;
    if(f.k==='market'&&id==='hale'&&S.hour>=13.5)return 'f2_judgeM';if(f.k==='weigh'&&id==='hale'&&S.hour>=14)return 'f2_judgeW';
    const L=F2_SPOTS[f.k]||['fest'];const i=npcs.indexOf(n);return L[(i*7+S.day)%L.length];}catch(e){return w;}};}
{const _px=placeXY;placeXY=function(key,n){if(typeof key==='string'&&key.startsWith('f2_')&&PL[key]){const p=PL[key],i=npcs.indexOf(n),a=i*2.39,r=p[2]*(.4+(i%3)*.3);return [p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r*.6];}return _px.apply(this,arguments);};}
const F2_SAY={f2_bell:['Gideon rang it three times last year. Three!','Swing from the hips, not the arms.','It’s rigged. Everybody knows it’s rigged.','Go on, hit it like it owes you money.'],
  f2_toss:['Nell glues the back pegs. I’d swear to it.','Aim for the front row and take your one ticket.','Five coins a go and I still haven’t won the jar.'],
  f2_crows:['Don’t hit the little girl. Moss says never hit the little girl.','Ping! Did you hear that? Ping!','The gold one comes round last. Wait for it.'],
  f2_cards:['Ada told me I’d marry a fisherman. Then she said, “Not for long.”','She can’t see the cards. She doesn’t need to.','I won’t sit at her table. Not after last year.'],
  f2_tables:['Orla’s jam again. Every year, the jam.','Hale picks the one with the most kinds of thing. Variety, he calls it.','Look at the shine on those eggs.'],
  f2_apples:['Hold your breath and go deep!','Finn got four. Four! The boy’s half fish.','Nobody takes the one at the bottom. You know why.'],
  f2_carve:['Silas carved a face that looked like my mother. I didn’t ask him to.','Big teeth. The judges like teeth.','Cut the eyes first or you’ll lose your nerve.'],
  f2_scale:['Otto’s been feeding his with fish heads.','Last year’s winner split open on the scale. Seeds everywhere.','Heaviest wins. That’s the only rule.']};
// ---- a festival opens when you get there
const F2_OPEN={market:{t:'The Harvest Market',h:`Market day! The whole valley’s out.<br><br>The stall pays half again for anything you’ve grown, and there’s things on it you can’t get any other day.<br><br>See the tables by the bandstand? Lay out your best on yours: up to nine things. At two o’clock Hale walks the tables and judges them, against Orla’s, Ezra’s and Hob’s. Most kinds of thing, best quality, best worth. The Best Table gets the blue ribbon and three hundred coins.<br><br>And there’s apple bobbing by the steps, if you don’t mind getting your hair wet. <i>(Quieter.)</i> Don’t take the apple from the bottom of the barrel. Nobody does.`},
  weigh:{t:'The Pumpkin Weigh-in',h:`Welcome, welcome. The Weigh-in.<br><br>Bring your heaviest pumpkin to the scale and leave it with me. At half past two I weigh every one of them, in front of everybody. Otto’s been feeding his on fish heads, so I hear.<br><br>And the carving table is open all day. Carve your best face. At half past three the town votes on the carvings.<br><br>Carve it frightening. <i>They</i> like it frightening.`},
  dance:{t:'The Lantern Dance',h:`The Lantern Dance. The floor’s laid and the lanterns are lit.<br><br>Ask someone you’re close to, and keep time with them till the lanterns burn down at a quarter to eight.<br><br>Mind your feet, and don’t look up at the lanterns too long. They move when you’re not watching. Only the wind, of course.`},
  fair:{t:'The Hollow Fair',h:`The Hollow Fair! Every game I built myself, so if one breaks, you tell me, not Hale.<br><br>Ring toss, five coins a go: aim, and throw it like you mean it. Ring the bell with the big mallet. Shoot the tin crows off the rail. And Ada will read your cards in the tent, if you dare sit with her.<br><br>Every game pays out in fair tickets, and my prize booth takes nothing else. Coins are no good to me today.<br><br>One rule at the crow shoot: don’t hit the little girl.`}};
function f2Open(f){const host=F2_HOST[f.k],O=F2_OPEN[f.k];if(!O)return;
  const go=()=>{const nm=f2Name(host);playScene(host,O.t,O.h,()=>{toast(f.k==='market'?'The tables are judged at 2:00. Talk to Hale by the tables then.':f.k==='weigh'?'The weigh-in is at 2:30 by the scale; the carvings are judged at 3:30.':f.k==='fair'?'Every game pays fair tickets. Spend them at Nell’s prize booth.':'Ask someone to dance on the floor.',4);f2Chip();});};
  if(typeof playScene==='function')go();}
// ---- contests: what everyone entered (you, your friends) and the townsfolk's entries
const F2_RIVALS={table:[['orla',['jam','apple','cider','pie','pumpkin']],['ezra',['egg','milk','wool','hide','poultry']],['hob',['pie','beef_stew','roast_hen','cornbread','potato_soup']]],
  weigh:[['otto',[26,58]],['orla',[22,52]],['ezra',[18,48]]],carve:[['bram',[.32,.62]],['finn',[.28,.58]],['iris',[.42,.74]],['silas',[.5,.86]]]};
function f2Entries(k){const D=f2D();D.ent=D.ent||{};return D.ent[k]||(D.ent[k]={});}
function f2Enter(k,v,extra){const E=f2Entries(k);E[f2Me()]=Object.assign({v,me:true},extra||{});
  try{if(typeof CO!=='undefined'&&CO.room&&CO.room.emit)CO.room.emit('f2ent',{k,day:S.day,n:f2Me(),v,x:extra||{}});}catch(e){}}
if(typeof hostWire==='function'){const _hw=hostWire;hostWire=function(){const r0=_hw.apply(this,arguments);const r=CO.room;if(!r||!r.on)return r0;
  HOST.off.push(r.on('f2ent',m=>{if(!m||m.isMe||!m.data)return;const d=m.data;if(d.day!==S.day||!/^(table|weigh|carve)$/.test(d.k))return;const n=clean(d.n);const E=f2Entries(d.k);if(!E[n])toast(`${n} has entered the ${d.k==='table'?'Best Table':d.k==='weigh'?'Weigh-in':'carving contest'}.`,2.4);
    E[n]={v:+d.v||0,friend:true,img:typeof d.x.img==='string'?d.x.img.slice(0,40000):undefined};}));return r0;};}
// a seeded number for the townsfolk entries, the same for everyone on the same day
const f2R=(a,b)=>{let h=(S.day*7919+a*104729+b*1299709)|0;h^=h>>>13;h=Math.imul(h,1274126177);return ((h^(h>>>16))>>>0)/4294967295;};
// ---- the HUD: your tickets while you're at a festival
function f2Chip(){let c=$('f2Chip');const show=!!f2At()&&S.mode==='play';if(!c){c=document.createElement('div');c.id='f2Chip';document.body.appendChild(c);
    const st=document.createElement('style');st.textContent=`#f2Chip{position:fixed;z-index:40;right:calc(10px*var(--u,1));top:calc(var(--toastTop,90px) + 4px);font:13px 'Hollow Pixel',monospace;color:#f4e6c8;background:rgba(30,16,8,.86);
      padding:5px 10px 5px 26px;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 3px #8a5a2a;display:none;pointer-events:none}#f2Chip:before{content:'';position:absolute;left:8px;top:7px;width:11px;height:8px;background:#e8b84a;box-shadow:inset 0 0 0 1px #6a3a10,inset 3px 0 0 -1px #c8402a}`;document.head.appendChild(st);}
  c.style.display=show?'block':'none';if(show)c.textContent=`${F2S().tix||0} fair ticket${(F2S().tix||0)===1?'':'s'}`;}
// ---- the tick: the opening, the schedule, the talk, the dressing
const F2T={say:0};
function f2Tick(dt){f2Chip();const f=f2At();if(!f||S.mode!=='play'||S.paused||(typeof SCENE!=='undefined'&&SCENE))return;const D=f2D();
  if(!D.open&&Math.hypot(P.x-F_SQ.x,P.z-F_SQ.z)<11){D.open=1;f2Open(f);return;}
  // the schedule
  if(f.k==='market'&&S.hour>=14&&!D.callM){D.callM=1;toast('Hale rings a handbell by the tables: “Judging! Bring your table up to scratch, then come and find me.”',4.4);}
  if(f.k==='weigh'&&S.hour>=14.5&&!D.callW){D.callW=1;toast('Hale bangs the scale with his stick: “The weigh-in! Pumpkins on the scale, then come and tell me.”',4.4);}
  if(f.k==='weigh'&&S.hour>=15.5&&!D.callC){D.callC=1;toast('Hale: “And the carvings. Come and see what the town makes of them.”',3.6);}
  // overheard at the booths
  F2T.say-=dt;if(F2T.say<=0&&typeof RX!=='undefined'){F2T.say=4+Math.random()*4;const cand=npcs.filter(n=>n.vis!==false&&typeof n.want==='string'&&F2_SAY[n.want]&&Math.hypot(n.x-P.x,n.z-P.z)<7&&!RX.bub.some(b=>b.n===n));
    if(cand.length){const n=cand[(Math.random()*cand.length)|0],L=F2_SAY[n.want];const line=L[(Math.random()*L.length)|0];RX.bub.push({n,line,t:0,life:3.2+line.length*.03});}}}
{let t=0,last=performance.now();setInterval(()=>{const now=performance.now(),dt=Math.min(1,(now-last)/1000);last=now;try{f2Tick(dt);f2Dress();}catch(e){}},250);}
// n.want: remember where each one was sent (for the overheard lines)
{const _w=wantFor;wantFor=function(n){const w=_w.apply(this,arguments);n.want=w;return w;};}
// ---- the booths
const f2It=(p,dz,k,label,act)=>interact.push({x:p.x,z:p.z+(dz||.6),r:1.3,story:true,on:()=>{const f=f2Live();return !!f&&f.k===k;},label,ok:()=>true,act});
function f2Pay(c){if(S.coins<c){SFX.deny&&SFX.deny();toast(`${c} coins a go.`,1.6);return false;}S.coins-=c;updateHud&&updateHud();return true;}
f2It(F2P.bell,.7,'fair',()=>'Ring the bell · 5 coins',()=>{if(f2Pay(5))f2Play('bell');});
f2It(F2P.crows,.7,'fair',()=>'Crow shoot · 5 coins',()=>{if(f2Pay(5))f2Play('crows');});
f2It(F2P.cards,.8,'fair',()=>f2D().cards?'Ada’s tent':'Ada’s cards · 2 tickets',()=>f2Cards());
f2It(F2P.prizes,.6,'fair',()=>'Nell’s prize booth',()=>openShop('f2_prizes'));
f2It(F2P.prizes,.6,'market',()=>'Prize booth (fair tickets)',()=>openShop('f2_prizes'));
f2It(F2P.apples,.7,'market',()=>f2D().bob>=2?'The apple barrel':'Bob for apples',()=>{const D=f2D();if((D.bob||0)>=2){toast('Two goes each, Caitlyn says. Your hair’s still dripping.',2.2);return;}D.bob=(D.bob||0)+1;f2Play('bob');});
f2It(F2P.tables[0],.6,'market',()=>f2D().judgedT?'Your table':'Your table · Best Table',()=>f2TableOpen());
f2It(F2P.carve,.7,'weigh',()=>f2D().carved?'The carving table':'Carve a pumpkin',()=>{const D=f2D();if(D.carved){toast('Your pumpkin’s on the shelf with the others, grinning. One each.',2.2);return;}
  const i=S.basket.findIndex(b=>b.kind==='pumpkin');if(i>=0)S.basket.splice(i,1);else toast('No pumpkin of your own? Iris hands you a spare off the cart. “Go on. Make it ugly.”',2.6);
  D.carved=1;f2Play('carve');});
// the scale: the old weigh-in becomes: choose your pumpkin now, the weighing happens at half past two
for(const it of interact){if(it.x===squarePos.x+6.2&&it.z===squarePos.z+4){it.label=()=>f2D().weighed?'The scale':f2D().wEnt?'Your pumpkin is on the scale':'Enter a pumpkin';it.act=()=>f2WeighEnter();}}
// talking to Hale when there is judging to do
{const _cc=computeContext;computeContext=function(){try{const f=f2Live();if(f&&S.mode==='play'&&!(typeof SCENE!=='undefined'&&SCENE)){const h=npcById('hale'),D=f2D();
      if(h&&h.vis!==false&&Math.hypot(h.x-P.x,h.z-P.z)<2.2){
        if(f.k==='market'&&S.hour>=14&&!D.judgedT)return {label:'Hale: judge the tables',ok:true,act(){f2JudgeTables();}};
        if(f.k==='weigh'&&S.hour>=14.5&&!D.weighed)return {label:'Hale: weigh the pumpkins',ok:true,act(){f2Weigh();}};
        if(f.k==='weigh'&&S.hour>=15.5&&D.weighed&&!D.voted)return {label:'Hale: judge the carvings',ok:true,act(){f2Vote();}};}}}catch(e){}
  return _cc.apply(this,arguments);};}
// ---- the games (fest324g.js has the play): what each pays, and the records the town keeps
const F2_GAMES={toss:{name:'Ring toss',rec:['nell',11]},bell:{name:'Ring the bell',rec:['gideon',96]},crows:{name:'Crow shoot',rec:['moss',23]},bob:{name:'Apple bobbing',rec:['finn',5]},carve:{name:'Pumpkin carving'}};
function f2Play(k){const G=F2G[k];if(!G)return;const def=G.def();const name=F2_GAMES[k].name;F2G.skipped=false;
  mg4Run(def,name,q=>{try{if(F2G.skipped){toast('You walk away from it.',1.6);return;}G.done(q,G.last||{});}catch(e){console.warn(e);}},def.icon);}
// ---- Ada's cards
const F2_FORT=[['The Lantern','the Ploughman','the Open Gate'],['The Crow','the Two Rings','the Well'],['The Scythe','the Bride','the Lantern'],['The Child','the Corn','the Bell'],['The Moth','the Key','the Long Table']];
const F2_READ=['“A gate left open. You’ll want to close it. You won’t.” Her blind eyes stay on yours the whole time.',
  '“Two rings. One of them is yours. The other was somebody’s once.” She taps the second card, twice, hard.',
  '“The bride is smiling. The scythe is smiling too. Everybody’s smiling, this month.”',
  '“The child in the corn. Don’t follow her. If she calls your name, it isn’t her calling.”',
  '“A long table, set for the whole town, and one chair left empty. Every year, one chair.”'];
function f2Cards(){const D=f2D();if(D.cards){toast('Ada has already read for you today. She turns her face toward you anyway, and smiles.',2.6);return;}
  if((F2S().tix||0)<2){toast('Two fair tickets, Ada says, without being told how many you have.',2.4);return;}F2S().tix-=2;D.cards=1;f2Chip();
  const i=(S.day+((F2S().tix|0)%3))%F2_FORT.length,C=F2_FORT[i];
  openNote(`<h3>Ada’s cards</h3><p class="jsub">The tent smells of tallow and wet canvas. Ada lays three cards face down, then turns them over without looking.</p>
    <div class="f2cards">${C.map((c,j)=>`<div class="f2card" style="animation-delay:${.3+j*.6}s"><b>${c}</b></div>`).join('')}</div><p class="f2read">${F2_READ[i]}</p>
    <p class="jsub">On your way out she says, to nobody: <q>Luck tomorrow. A little. Spend it well.</q></p>`,'Leave the tent');
  S.f2luck=S.day+1;if(typeof addLore==='function'&&!S.f2lore){S.f2lore=1;addLore('Ada Kerrigan reads cards at the Hollow Fair. She is blind. She has never turned a card the wrong way up.');}}
{const st=document.createElement('style');st.textContent=`#noteText .f2cards{display:flex;gap:10px;justify-content:center;margin:10px 0}
#noteText .f2card{width:86px;height:122px;display:flex;align-items:flex-end;justify-content:center;padding:6px;box-sizing:border-box;font-size:11px;text-align:center;color:#f4e6c8;
  background:linear-gradient(#3a1a24,#1a0c10);box-shadow:inset 0 0 0 2px #c8a050,inset 0 0 0 4px #3a1a24,inset 0 0 0 5px #8a6030,0 3px 0 #0a0406;opacity:0;animation:f2flip .5s steps(4) forwards}
@keyframes f2flip{0%{opacity:0;transform:scaleX(0)}100%{opacity:1;transform:scaleX(1)}}#noteText .f2read{font-style:italic;margin-top:8px}`;document.head.appendChild(st);}
// luck from the cards: a better chance at a double harvest and an extra fish bite tomorrow (a small thing, like she said)
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);try{if(S.f2luck===S.day)setTimeout(()=>toast('Ada said there’d be luck today. You feel it, a little.',3),3200);}catch(e){}return r;};}
// ---- Nell's prize booth: fair tickets only
ITEMS.f2_ribbon=ITEMS.f2_ribbon||{name:'Blue ribbon',icon:'it_f2_ribbon',sell:5,desc:'First prize at the Marrow Hollow Harvest Market. Hale wrote the year on the back, then crossed it out and wrote it again.'};
const F2_PRIZES=[{k:'apple',name:'Candied apple',t:2,desc:'+30 energy. Sticky.',give(){addInv('candy_apple');}},
  {k:'pie',name:'Pumpkin pie',t:5,desc:'A whole one, in a tin.',give(){addInv('pie');}},
  {k:'bq',name:'Wildflower bouquet',t:6,desc:'For asking someone out.',give(){addInv('bouquet');}},
  {k:'jack',name:'Carved pumpkin (furniture)',t:10,desc:'A candle-lit jack-o’-lantern for the cabin. It’s already lit. Nobody lit it.',give(){S.furnBag=S.furnBag||[];S.furnBag.push('pumpkin');}},
  {k:'plush',name:'Scarecrow doll (furniture)',t:16,desc:'A stuffed scarecrow with button eyes and a straw hat. For a shelf, or a bed. It sits up on its own.',give(){S.furnBag=S.furnBag||[];S.furnBag.push('f2_plush');}},
  {k:'stand',name:'Ribbon board (furniture)',t:24,desc:'A little easel to hang your fair ribbons on. Every ribbon you win shows on it.',give(){S.furnBag=S.furnBag||[];S.furnBag.push('f2_board');}},
  {k:'seed',name:'A bag of seed',t:12,desc:'Five pumpkin seeds and five turnip seeds, from Otto’s own store.',give(){S.seeds.pumpkin=(S.seeds.pumpkin||0)+5;S.seeds.turnip=(S.seeds.turnip||0)+5;}}];
vendors.f2_prizes={name:'Nell’s prize booth',sub:'Shelves of jars, dolls and ribbons behind a counter Nell planed herself. “Tickets only. Coins are no good to me today.”',rows:()=>F2_PRIZES.map(p=>({k:p.k,name:p.name,desc:`${p.desc} ${p.t} tickets.`,price:0,btn:`${p.t} tickets`,can:(F2S().tix||0)>=p.t,
  buy(){if((F2S().tix||0)<p.t)return;F2S().tix-=p.t;p.give();f2Chip();toast(`${p.name}: yours. ${F2S().tix} tickets left.`,2);}}))};
// the new furniture prizes (sprites from festart2.py)
if(typeof FURN!=='undefined'){FURN.f2_plush=['Scarecrow doll','f2_plush',{fiber:99},[3.2,3.2],null];FURN.f2_board=['Ribbon board','f2_board',{wood:99},[4.2,3.2],null];
  if(typeof FURN_DESC!=='undefined'){FURN_DESC.f2_plush='A stuffed scarecrow with button eyes. Won at the Hollow Fair.';FURN_DESC.f2_board='Your fair ribbons, hung on a little easel.';}}
// ---- BEST TABLE: up to nine things on your table
function f2TableOpen(){const D=f2D();D.table=D.table||[];
  if(D.judgedT){openNote(`<h3>Your table</h3><p>${D.tableRes||'Judged.'}</p>`,'Close');return;}
  const T=D.table;const bag=[];const seen=new Map();
  for(const b of S.basket){const key='P:'+b.kind;if(!seen.has(key)){seen.set(key,bag.length);bag.push({t:'P',id:b.kind,n:0,best:b});}const e=bag[seen.get(key)];e.n++;if((b.q||0)>(e.best.q||0)||(b.value||0)>(e.best.value||0))e.best=b;}
  for(const [id,n] of Object.entries(S.inv||{})){if(!n||!ITEMS[id]||ITEMS[id].tool||/^(it_|f2_)/.test(id))continue;bag.push({t:'I',id,n});}
  const ico=e=>{try{return iconOf(e.t==='P'?e.id:((ITEMS[e.id]&&ITEMS[e.id].icon)||e.id));}catch(x){return '';}};
  const nm=e=>e.t==='P'?((typeof PRODUCE_NAMES!=='undefined'&&PRODUCE_NAMES[e.id])||e.id):((ITEMS[e.id]||{}).name||e.id);
  const sc=f2TableScore(T);
  let h=`<h3>Your table <small style="opacity:.7">· the Best Table</small></h3><p class="jsub">Up to nine things. Hale scores the most kinds of thing, the best quality and the best worth. Everything comes back to you after the judging.</p>
    <div class="f2grid">${Array.from({length:9},(_,i)=>{const e=T[i];return `<button class="f2slot" data-i="${i}">${e?`<img src="${ico(e)}"><small>${nm(e)}${e.q?' '+'★'.repeat(e.q):''}</small>`:'<small style="opacity:.4">empty</small>'}</button>`;}).join('')}</div>
    <p style="margin:6px 0">So far: <b>${sc.total}</b> points <small style="opacity:.75">(${sc.kinds} kinds · quality ${sc.qual} · worth ${sc.worth})</small></p><h4>From your bag</h4><div class="f2bag">`;
  bag.slice(0,40).forEach((e,i)=>{h+=`<button class="f2pick" data-b="${i}"><img src="${ico(e)}"><small>${nm(e)} ×${e.n}</small></button>`;});
  h+='</div>';openNote(h,'Done');
  const N=$('noteText');N.querySelectorAll('.f2slot').forEach(b=>b.onclick=()=>{const i=+b.dataset.i,e=T[i];if(!e)return;T.splice(i,1);
    if(e.t==='P')S.basket.push(e.b);else addInv(e.id,1);f2TableOpen();});
  N.querySelectorAll('.f2pick').forEach(b=>b.onclick=()=>{if(T.length>=9){toast('Nine is all the table holds. Take one off first.',2);return;}const e=bag[+b.dataset.b];
    if(e.t==='P'){const j=S.basket.indexOf(e.best);if(j<0)return;S.basket.splice(j,1);T.push({t:'P',id:e.id,q:e.best.q||0,v:e.best.value||0,b:e.best});}
    else{if(inv(e.id)<=0)return;let q=0;try{if(typeof iqTakeBest==='function'){q=iqTakeBest(e.id)||0;}}catch(x){}takeInv(e.id,1);T.push({t:'I',id:e.id,q,v:(typeof sellPrice==='function'?sellPrice(e.id):(ITEMS[e.id].sell||10))});}
    SFX.pick&&SFX.pick();f2TableOpen();});}
{const st=document.createElement('style');st.textContent=`#noteText .f2grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;max-width:330px;margin:6px auto}
#noteText .f2slot,#noteText .f2pick{font:inherit;display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px;background:rgba(90,60,30,.12);border:0;box-shadow:inset 0 0 0 1px rgba(90,60,30,.4);cursor:pointer;color:inherit;min-height:58px}
#noteText .f2slot img,#noteText .f2pick img{width:32px;height:32px;image-rendering:pixelated}#noteText .f2slot small,#noteText .f2pick small{font-size:10px;line-height:1.1;text-align:center}
#noteText .f2bag{display:grid;grid-template-columns:repeat(auto-fill,minmax(74px,1fr));gap:4px;max-height:200px;overflow:auto}#noteText .f2slot:hover,#noteText .f2pick:hover{background:rgba(200,140,60,.25)}`;document.head.appendChild(st);}
// what kind of thing each is, for "variety"
function f2Kind(e){const id=e.id,I=ITEMS[id]||{};if(e.t==='P'){if(id==='fish'||/fish/.test(id))return 'fish';if(['egg','milk','wool'].includes(id))return 'animal';if(['mushroom','berry','berries','acorn'].includes(id))return 'forage';return 'crop';}
  if(['egg','milk','wool','hide','poultry','beef'].includes(id))return 'animal';if(I.drink)return 'drink';if(I.food)return 'food';if(/fish|trout|perch|carp|eel|bass|pike/.test(id))return 'fish';
  if(['stone','coal','copper','iron','copper_bar','iron_bar','gem','quartz'].includes(id))return 'mineral';if(['mushroom','berry','acorn','herb','sap'].includes(id))return 'forage';return 'made';}
function f2TableScore(T){const kinds=new Set(T.map(f2Kind)).size;let qual=0,worth=0;for(const e of T){qual+=Math.min(3,e.q||0)*2;const v=e.v||0;worth+=v>=150?4:v>=70?3:v>=30?2:v>=10?1:0;}
  const fill=T.length>=9?6:T.length>=6?3:0;const total=T.length?14+kinds*6+qual+worth+fill:0;return {total,kinds,qual,worth};}
function f2JudgeTables(){const D=f2D();if(D.judgedT)return;D.table=D.table||[];const me=f2TableScore(D.table).total;if(me)f2Enter('table',me);
  const rows=F2_RIVALS.table.map(([id],i)=>[f2Name(id)+'’s table',Math.round(48+f2R(i,1)*30)]);
  for(const [n,e] of Object.entries(f2Entries('table')))rows.push([e.me?'Your table':`${n}’s table`,e.v,e.me]);
  rows.sort((a,b)=>b[1]-a[1]);D.judgedT=1;const place=rows.findIndex(r=>r[2]);const prize=[[300,30,'the blue ribbon'],[150,18,'a red ribbon'],[80,10,'a yellow ribbon']][place]||null;
  const lines=rows.map((r,i)=>`<p>${['🥇','🥈','🥉','·','·','·'][i]||'·'} <b>${r[0]}</b>: ${r[1]} points</p>`).join('');
  const say=place===0?'Hale stops at your table for a long time. He picks up each thing and puts it down exactly where it was. “This,” he says to the square, “is a table.”':place>0&&place<3?'“A fine table,” Hale says, and moves on, and comes back, and moves on.':me?'Hale smiles at your table the way you smile at a child’s drawing.':'Your table is empty. Hale walks past it without slowing down.';
  // everything goes back to you
  for(const e of D.table){if(e.t==='P')S.basket.push(e.b);else addInv(e.id,1);}D.table=[];
  if(prize){S.coins+=prize[0];f2Tix(prize[1]);if(place===0){addInv('f2_ribbon');F2S().rib=(F2S().rib||0)+1;}updateHud();for(const n of npcs)if(PEOPLE[n.def.id]&&Math.hypot(n.x-P.x,n.z-P.z)<10)addFriend(n.def.id,10);}
  D.tableRes=`${rows[place]?['First','Second','Third','Fourth','Fifth'][place]||'':'No'} place.`;
  f2Show('The Best Table',`<p>${say}</p>${lines}${prize?`<p><b>You win ${prize[0]} coins, ${prize[1]} fair tickets and ${prize[2]}.</b> Everything on your table is back in your bag.</p>`:'<p>Everything on your table is back in your bag.</p>'}`);}
// ---- THE WEIGH-IN: pick your pumpkin, then the weighing
function f2PWeight(b){const base=(b.value||18);const q=b.q||0;return Math.round((14+base*.9+q*7+(f2R(base,q)*8))*10)/10;}
function f2WeighEnter(){const D=f2D();if(D.weighed){toast('The weigh-in is done for this year.',1.8);return;}
  if(D.wEnt){toast(`Your pumpkin is on the scale: ${D.wEnt.lb} lb. Hale weighs them all at half past two.`,2.6);return;}
  const ps=S.basket.filter(b=>b.kind==='pumpkin');if(!ps.length){SFX.deny&&SFX.deny();toast('You need a pumpkin in your basket to enter. Grow one, then bring it.',2.6);return;}
  const opts=ps.map(b=>({b,lb:f2PWeight(b)})).sort((a,b)=>b.lb-a.lb).slice(0,6);
  openNote(`<h3>The Pumpkin Weigh-in</h3><p class="jsub">Which one goes on the scale? Hale won’t weigh it till half past two, but you can heft them now.</p>${opts.map((o,i)=>`<p><button class="btn f2pp" data-i="${i}">Enter this one</button> a pumpkin, about <b>${Math.round(o.lb)} lb</b>${o.b.q?' '+'★'.repeat(o.b.q):''}</p>`).join('')}`,'Not yet');
  $('noteText').querySelectorAll('.f2pp').forEach(btn=>btn.onclick=()=>{const o=opts[+btn.dataset.i];const j=S.basket.indexOf(o.b);if(j<0)return;S.basket.splice(j,1);D.wEnt={lb:o.lb};f2Enter('weigh',o.lb);
    $('note').hidden=true;S.paused=false;toast(`Your pumpkin goes on the shelf by the scale: about ${Math.round(o.lb)} lb. The weighing is at half past two.`,3);});}
function f2Weigh(){const D=f2D();if(D.weighed)return;D.weighed=1;const rows=F2_RIVALS.weigh.map(([id,[lo,hi]],i)=>({n:f2Name(id),lb:Math.round((lo+f2R(i,7)*(hi-lo))*10)/10}));
  for(const [n,e] of Object.entries(f2Entries('weigh')))rows.push({n:e.me?'You':n,lb:+e.v,me:!!e.me});
  F2G.weighShow(rows,res=>{const place=res.findIndex(r=>r.me);const prize=[[150,20],[80,12],[40,8]][place];
    if(prize){S.coins+=prize[0];f2Tix(prize[1]);updateHud();for(const n of npcs)if(PEOPLE[n.def.id]&&Math.hypot(n.x-P.x,n.z-P.z)<12)addFriend(n.def.id,place===0?20:10);}
    f2Show('The Pumpkin Weigh-in',res.map((r,i)=>`<p>${['🥇','🥈','🥉','·','·','·'][i]||'·'} <b>${r.n}</b>: ${r.lb} lb</p>`).join('')+
      (place<0?'<p>You didn’t enter a pumpkin this year. Otto looks almost disappointed.</p>':place===0?`<p><b>First! ${prize[0]} coins and ${prize[1]} fair tickets.</b> Otto shakes your hand for a long time and says it’s the soil. It’s always the soil.</p>`:prize?`<p><b>${['','Second','Third'][place]}: ${prize[0]} coins and ${prize[1]} fair tickets.</b></p>`:'<p>Not this year. Otto pats your pumpkin like a dog that tried its best.</p>'));});}
// ---- THE CARVINGS: the town votes
function f2Vote(){const D=f2D();if(D.voted)return;D.voted=1;const rows=F2_RIVALS.carve.map(([id,[lo,hi]],i)=>({n:f2Name(id),v:lo+f2R(i,11)*(hi-lo)}));
  for(const [n,e] of Object.entries(f2Entries('carve')))rows.push({n:e.me?'You':n,v:+e.v,me:!!e.me});rows.sort((a,b)=>b.v-a.v);const place=rows.findIndex(r=>r.me);
  const prize=[[120,24],[60,14],[30,8]][place];if(prize){S.coins+=prize[0];f2Tix(prize[1]);updateHud();}
  const word=v=>v>.8?'the whole square goes quiet':v>.6?'people step back from it':v>.4?'a few shivers':'polite clapping';
  f2Show('The carvings',`<p class="jsub">The carved pumpkins sit on the shelf by the scale, candles lit. Everyone drops a bean in the jar of the one that frightens them most.</p>`+
    rows.map((r,i)=>`<p>${['🥇','🥈','🥉','·','·','·'][i]||'·'} <b>${r.n}</b>: ${Math.round(r.v*40)} beans <small style="opacity:.7">(${word(r.v)})</small></p>`).join('')+
    (place<0?'<p>You didn’t carve one this year.</p>':place===0?`<p><b>Yours wins: ${prize[0]} coins and ${prize[1]} fair tickets.</b> Silas looks at your carving for a long time. “That’s a true face,” he says. You don’t ask whose.</p>`:prize?`<p><b>${['','Second','Third'][place]}: ${prize[0]} coins and ${prize[1]} fair tickets.</b></p>`:'<p>Not this year. Silas’s won, again. Nobody will say what it looks like.</p>'));
  if(D.carveImg){S.furnBag=S.furnBag||[];S.furnBag.push('pumpkin');setTimeout(()=>toast('You can take your carving home: it’s in your furniture bag.',2.6),600);}}
function f2Show(title,html){openNote(`<h3>${title}</h3>${html}`,'Back to the festival');}
// ---- multiplayer: entries are shared (above), tickets are your own
// ---- what's on the tables: your things and the townsfolk's, drawn small on the cloth
const F2IMG={};const f2Img=k=>{if(F2IMG[k])return F2IMG[k];const im=new Image();try{im.src=iconOf(k);}catch(e){}return F2IMG[k]=im;};
const f2TabItems=i=>{if(i===0){const D=f2D();return (D.table||[]).map(e=>e.t==='P'?e.id:((ITEMS[e.id]&&ITEMS[e.id].icon)||e.id));}
  const R=F2_RIVALS.table[i-1];return R?R[1].map(id=>(ITEMS[id]&&ITEMS[id].icon)||id):[];};
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);try{const f=typeof fToday==='function'&&fToday();if(!f||f.k!=='market'||S.room||!F2DEC.tables)return;
    F2P.tables.forEach((p,i)=>{const L=f2TabItems(i).slice(0,9);if(!L.length)return;D.push({z:p.z+.01,draw(){const X=Math.round(sx(p.x)),Y=Math.round(sz(p.z));
      L.forEach((k,j)=>{const im=f2Img(k);if(!im.complete||!im.naturalWidth)return;const row=j<5?0:1,col=j<5?j:j-5,n=row?Math.min(4,L.length-5):Math.min(5,L.length);
        const x=X-Math.round(n*9/2)+col*9-2,y=Y-33+(row?9:2);ctx2.drawImage(im,x,y,13,13);});}});});}catch(e){}};}
