/* ================= W4 part two, Chapter Two (story plan, chapter 2, beats 2-4): Room 6's phone, where you dial home and the
   payphone across the valley rings too, someone picks up, breathes, and says in your own voice "Don't come back here"; under
   Room 6's mattress Grandpa's first page and the key to his desk, and the door handle turning (WORLD's W79H.threat); and in
   his desk the album, six photographs of places with nobody in them, each where one page of his diary lies. Each photo is a
   lead with no arrow: you know it when you walk into it, or when someone who knows the place tells you. ================= */
const w4S2=()=>{if(!S.w4||typeof S.w4!=='object')S.w4={};return S.w4;};
const w4Fear2=(n,why)=>{try{if(typeof fearAdd==='function')return fearAdd(n,why);if(typeof mindHit==='function')mindHit(Math.max(1,Math.round(n/2)));}catch(e){}};
const w4R6=(x,z)=>{try{return rp('rg_room6',x,z);}catch(e){return {x:-9999,z:-9999};}};

// ---- the phone in Room 6 (the phone table by the bed)
let W4_CALL=false;
interact.push({get x(){return w4R6(2.55,3.95).x;},get z(){return w4R6(2.55,3.95).z;},r:.8,on:()=>S.room==='rg_room6'&&!W4_CALL&&!(typeof W79H!=='undefined'&&W79H.th),
  label:()=>w4S2().phone?'Phone':'Use the phone',ok:()=>true,act(){if(w4S2().phone){toast('The line is dead. Under the hum, very far off, something is still breathing.',3);return;}w4Call();}});
function w4Call(){W4_CALL=true;const s=w4S2();const say=(t,d)=>setTimeout(()=>{try{sub(t);}catch(e){}},d*1000);const snd=(f,d)=>setTimeout(()=>{try{f();}catch(e){}},d*1000);
  say('You dial home.',0);snd(()=>SFX.ring&&SFX.ring(0,.6),.8);snd(()=>SFX.ring&&SFX.ring(0,.6),3.2);
  say('It rings. And far off across the valley, faint, the payphone in town is ringing too.',3.0);snd(()=>SFX.ring&&SFX.ring(-.8,.25),3.6);snd(()=>SFX.ring&&SFX.ring(0,.6),5.6);snd(()=>SFX.ring&&SFX.ring(-.8,.25),6.0);
  snd(()=>{if(typeof A!=='undefined'&&A.tone)A.tone(160,.05,'square',.05);},8.2);say('Someone picks up.',8.2);
  snd(()=>SFX.breath&&SFX.breath(0),9.2);say('',9.2);snd(()=>SFX.breath&&SFX.breath(0),11.5);
  say('“Don’t come back here.”  It is your own voice.',13.6);
  snd(()=>{if(typeof A!=='undefined'&&A.tone)A.tone(120,.06,'square',.05);w4Fear2(4,'your own voice on the phone');},16.2);say('The line goes dead.',16.2);
  snd(()=>{sub('');W4_CALL=false;s.phone=S.day;try{addLore('I called home from Room 6. Across the valley the payphone in town rang too. Someone picked up and breathed, and then said, in my own voice: Don’t come back here.');}catch(e){}},19);}

// ---- under the mattress: Grandpa's first page and the key to his desk; then the handle turns
interact.push({get x(){return w4R6(2.15,1.8).x;},get z(){return w4R6(2.15,1.8).z;},r:.7,on:()=>S.room==='rg_room6'&&!w4S2().deskKey&&!(typeof W79H!=='undefined'&&W79H.th),
  label:()=>'Lift the mattress',ok:()=>true,act(){const s=w4S2();s.deskKey=S.day;SFX.page&&SFX.page();
    openNote('<p class="date">Under the mattress, flat against the ticking</p><p>If you’re reading this, the road brought you back too. The rest is where we took the pictures.</p><p><i>Taped under it, a small brass key with a paper tag in his hand: DESK.</i></p>');
    try{addLore('Under the mattress in Room 6, a page in Grandpa’s hand: the rest is where we took the pictures. And the key to his desk.');}catch(e){}s.r6threat=1;}});
setInterval(()=>{try{const s=w4S2();if(s.r6threat!==1||S.mode!=='play'||!$('note').hidden||S.room!=='rg_room6'||typeof W79H==='undefined'||W79H.th)return;
  s.r6threat=2;setTimeout(()=>{try{if(S.room!=='rg_room6'||W79H.th)return;S.w79h=S.w79h||{};S.w79h.r6night=S.day;
    W79H.threat('rg_room6',{warn:'The door handle turns.',inside:'Footsteps cross the room, past the bed, and stop outside the bathroom door.',pass:'The footsteps go back out onto the walkway. The door doesn’t close behind them.',caught:'It sees you.',secs:5});}catch(e){}},2600);}catch(e){}},400);

// ---- Grandpa's desk: with his key, the top drawer opens on the album
const W4_PH=[
  {pg:0,txt:'a split-rail fence where it meets the road, a hay bale against it',who:['mae'],line:n=>`“That’s your own fence,” says ${n}. “Where it meets Route 9, east of your lane.”`,place:'his own fence by Route 9, east of the lane'},
  {pg:1,txt:'a clock on a gable, stopped at quarter to nine',who:['june'],line:n=>`“The town hall clock,” says ${n}. “It’s said quarter to nine since before I was born.”`,place:'the town hall clock'},
  {pg:2,txt:'a stone wall with a pine behind it and the tops of two graves',who:['silas'],line:n=>`“The churchyard wall,” says ${n}. “North side, under the pine.”`,place:'the churchyard wall, under the pine'},
  {pg:3,txt:'a lamp post on a corner of hedges, a signpost with its boards blank',who:['hollis'],line:n=>`“The crossroads,” says ${n}. “Where that thing stands after dark.”`,place:'the crossroads'},
  {pg:4,txt:'a row of corn, taller than a man',who:'any',line:n=>`“Corn’s corn,” says ${n}. “But that’s Elias’s. The far end of your field.”`,place:'the far end of my own corn'},
  {pg:5,txt:'a tall post in a field, its crossbar empty, rope ends hanging',who:'any',line:n=>`“That’s the scarecrow’s post,” says ${n}. “Before.” They don’t say before what.`,place:'the scarecrow’s post'}];
const w4Ph=()=>{const s=w4S2();s.ph=s.ph||{};return s.ph;};
const w4PhDone=i=>S.pages.includes(W4_PH[i].pg);
const w4Here2=id=>{try{const n=npcById(id);return !!(n&&!n.gone&&!n.dead);}catch(e){return false;}};
{const b=rp('cabin',5.85,1.4),it=interact.find(i=>{try{return Math.abs(i.x-b.x)<.01&&Math.abs(i.z-b.z)<.01&&i.label()==='Desk';}catch(e){return false;}});
 if(it){const _a=it.act;it.act=function(){const s=w4S2();if(s.deskKey){w4AlbumOpen();return;}const r=_a.apply(this,arguments);
     try{if(S.looped&&!S.bound){const nt=$('noteText');if(nt)nt.insertAdjacentHTML('beforeend','<p><i>The top drawer is locked. The keyhole is small and brass.</i></p>');}}catch(e){}return r;};}}
function w4AlbumOpen(){const s=w4S2(),first=!s.album;if(first)s.album=S.day;
  sgtOpen(rp('cabin',5.85,1.4),w4Album(),first?'The top drawer opens with his key. An album: six photographs of places, nobody in any of them.':'Grandpa’s album.',{},()=>{if(first){w4Fear2(2,'the album');try{addLore('Grandpa’s desk opened with the key from Room 6. An album: six photographs of places with nobody in them. The rest is where we took the pictures.');}catch(e){}}});}
// you know a photo's place when you walk into it
setInterval(()=>{try{const s=w4S2();if(!s.album||S.mode!=='play'||S.room)return;const ph=w4Ph();W4_PH.forEach((p,i)=>{if(ph[i]||w4PhDone(i))return;const pg=PAGES[p.pg];if(Math.hypot(P.x-pg.x,P.z-pg.z)<6){ph[i]={d:S.day,n:'me'};}});}catch(e){}},700);
// or when someone who knows tells you
{const _t=talk;talk=function(n){const r=_t.apply(this,arguments);try{w4OnTalk2(n);}catch(e){console.warn('w4b',e);}return r;};}
function w4OnTalk2(n){const s=w4S2();if(!s.album||!n||!n.def||isNight())return;const line=$('talkLine'),box=$('talk');if(!line||!box||box.hidden)return;
  if(line.querySelector('.ldsay'))return;   /* one thing at a time: a lead already told this talk */
  const id=n.def.id,nm=typeof ldName==='function'?ldName(n):n.def.name.split(' ')[0],ph=w4Ph();
  const i=W4_PH.findIndex((p,k)=>!ph[k]&&!w4PhDone(k)&&(p.who==='any'||p.who.includes(id)||!p.who.some(w4Here2)));if(i<0)return;
  const p=W4_PH[i],pg=PAGES[p.pg];ph[i]={d:S.day,n:nm};line.insertAdjacentHTML('beforeend',`<br><span class="ldsay">You show the photograph of ${p.txt}. ${p.line(nm)}</span>`);
  try{if(typeof ldTell==='function')ldTell({x:pg.x,z:pg.z});}catch(e){}SFX.page&&SFX.page();}
// ---- the Leads tab: the album's photographs
if(typeof leadsHtml==='function'){const _lh=leadsHtml;leadsHtml=function(){let h=_lh.apply(this,arguments);try{const s=w4S2();if(!s.album)return h;const ph=w4Ph(),open=[],fin=[];
    W4_PH.forEach((p,i)=>{const d=w4PhDone(i),k=ph[i];const who=k?(k.n==='me'?'I knew it':k.n+' said'):'Grandpa’s album';
      const txt=k?`${p.place[0].toUpperCase()+p.place.slice(1)}.`:`A photograph of ${p.txt}. Somebody in town would know where.`;
      (d?fin:open).push(`<p class="ldrow${d?' lddone':''}"><b>${who}</b> ${txt}${d?' <span class="ldtick">✓</span>':''}</p>`);});
    if(open.length)h=h.replace(/(<h4>To follow<\/h4>)(<p class="jsub">Nothing right now\.<\/p>)?/,'$1'+open.join(''));
    if(fin.length)h=h.includes('<h4>Followed</h4>')?h.replace('<h4>Followed</h4>','<h4>Followed</h4>'+fin.join('')):h+'<h4>Followed</h4>'+fin.join('');}catch(e){}return h;};}
window.__w4b={s:w4S2,call:w4Call,album:w4AlbumOpen,ph:w4Ph,r6:w4R6,PH:W4_PH};
