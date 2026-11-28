/* ================= #379s W6, door scares, the same pattern beyond the door (story plan 6.3: "the fakes go beyond the door, shown and
   never explained, more often the more afraid you are"). Once the thing in the doorway has come (stage C), now and then, at night:
   - the message: your phone, which never has a signal out here, buzzes once in your pocket: one message, from Caitlyn, "come quick,
     please", and then no signal again. Nothing is sent and nothing comes of it. The next time you talk to her she shows you her phone:
     nothing sent. She was asleep. She is fine. (In the game's own words, in its own toast: no phone screen, nothing outside the game.)
   How often goes with the Fear bar's tier: never at the bottom, about one night in eight at the next, up to one in two at the top, and
   no sooner than four days after the last. Not in a shared game. Fear through the Fear bar ('fake'). ================= */
const W79T={};
function w79tS(){S.w79t=S.w79t||{};return S.w79t;}
function w79tOk(){try{if(typeof mpOn==='function'&&mpOn())return false;if(!(S.w79p&&S.w79p.c))return false;
  if(S.mode!=='play'||S.paused||(typeof SCENE!=='undefined'&&SCENE))return false;
  if((typeof W79Q!=='undefined'&&W79Q.on)||(typeof W79P!=='undefined'&&(W79P.on||W79P.b))||(typeof W79H!=='undefined'&&W79H.hid))return false;return true;}catch(e){return false;}}
function w79tTier(){try{return typeof fearTier==='function'?fearTier():1;}catch(e){return 1;}}
const W79T_P=[0,.12,.25,.38,.5];   /* the chance of a fake on a night, by fear tier */
// ---- the message
W79T.banner=function(){const s=w79tS();s.d_banner=S.day;s.bq=S.day;w79Fear(8,'fake');
  toast('Your phone buzzes once in your pocket, out here where it never has a signal. One message, from Caitlyn: “come quick, please.” Then no signal again.',6,true);return true;};
// she is fine: the next time you talk to her (within a few days), she shows you her phone
{const _t=talk;talk=function(n){_t.apply(this,arguments);try{if(!n||!n.def||n.def.id!=='mae')return;const s=w79tS();if(s.bq==null)return;if(S.day-s.bq>3){s.bq=null;return;}s.bq=null;
  const el=$('talkLine');if(!el)return;const line='(You ask about the message. She takes out her phone and shows you: nothing sent. “There’s no signal past the church,” she says. “I was asleep. I’m fine.” Then, more quietly: “Are you?”)';
  const cur=el.innerHTML||'';if(!cur.includes(line))el.innerHTML=cur+(cur?'<br>':'')+`<span class="w79j">${line}</span>`;}catch(e){}};}
// ---- when: a roll once a night, a moment picked in it, and the fake then if nothing else is happening
W79T.kinds=[['banner',4]];
setInterval(()=>{try{const h=S.hour,night=h>=21&&h<25.6;if(!night)return;const s=w79tS(),key=S.day;
    if(s.n!==key){s.n=key;W79T.plan=null;if(!w79tOk())return;const p=W79T_P[Math.max(0,Math.min(4,w79tTier()))]||0;if(rand()>=p)return;
      const ok=W79T.kinds.filter(([k,cd])=>S.day-(s['d_'+k]==null?-99:s['d_'+k])>=cd);if(!ok.length)return;W79T.plan={k:ok[Math.floor(rand()*ok.length)][0],at:21.6+rand()*3.4};}
    const q=W79T.plan;if(!q||h<q.at)return;if(!w79tOk()){if(h>25.2)W79T.plan=null;return;}W79T.plan=null;W79T[q.k]&&W79T[q.k]();}catch(e){}},1000);
