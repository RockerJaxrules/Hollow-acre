/* ================= the town keeps a week (#155). People do different things on different days: Sunday service, Friday nights at the
   Lamplighter, Saturday market in the courtyard, the women at the well on Monday, Wednesday and Friday mornings, the kids at the pond
   after school, the sheriff's laps of the green every Tuesday, Gideon in his yard all Wednesday. On rainy days everyone who can stays
   in. Silas goes through the trash on Route 9 at dusk. Then it starts to go wrong. For three days the town is a comfort. After that,
   people are not where they always are: you find them in the woods, facing a rock, not blinking. When she thinks nobody is watching,
   Ida stirs an empty pot on a cold stove, and June walks circles in her front room. Pip is gone for three days, and then Nell, and
   everybody tells you they were there all along. ================= */
const WEEKDAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const dow=()=>((S.day-1)%7+7)%7;
const rtH=(a,b)=>{const v=Math.sin(a*91.17+b*47.31)*43758.5453;return v-Math.floor(v);};
// ---- rain: some days it rains through the middle of the day
const rainDay=d=>d>=3&&rtH(d,3)<.27;
const rainNow=()=>rainDay(S.day)&&S.hour>=9.5&&S.hour<15.5&&!S.room;
const raining=()=>rainDay(S.day)&&S.hour>=9.5&&S.hour<15.5;
// ---- places for the week's routines
Object.assign(PL,{pond:[49,32.6,1.6],market:[36.6,-14.4,.6],well_court:[31.6,-15.2,1],trash:[41.2,-3.1,.15],lap_a:[38.4,-3,.4],lap_b:[59.4,-3,.4],lap_c:[59.6,10.6,.4],lap_d:[38.2,10.6,.4],
  stall_shop:[37.4,-14.2,.4],green_bench:[42.6,7.4,.4]});
INDOOR.tavern={room:'tavern',door:tbDoor('tavern'),spots:{},browse:[[3,5.3],[6.8,5.6],[3.2,8.1],[11.2,8.1],[11.9,4.4],[13.2,4.4],[1.9,5.3],[8,5.6],[4.3,8.1],[12.2,8.1],[5.4,2.9]]};
INDOOR.church={room:'church',door:[CHURCH_DOOR.x,CHURCH_DOOR.z],spots:{hale:[5,1.8]},browse:[[2.4,4.0],[7.6,4.0],[2.4,5.4],[7.6,5.4],[2.4,6.8],[7.6,6.8],[1.4,4.0],[8.6,4.0],[1.4,5.4],[8.6,5.4],[3.4,4.0],[6.6,4.0]]};
if(LIFE.dunn)LIFE.dunn.route=['lap_a','lap_b','lap_c','lap_d'];
const WEEK={ // whole-day replacements, by weekday
  tobias:{5:[[6,'home'],[9,'pond'],[12,'square'],[14,'courtyard'],[16,'store'],[18,'home']],6:[[6,'home'],[11.2,'square'],[12,'pond'],[16,'store'],[18,'home']]},
  pip:{6:[[6,'home'],[11.2,'pond'],[14,'square'],[16,'store'],[18.5,'home']]},
  cora:{5:[[6,'home'],[10,'courtyard'],[12,'home'],[15,'green_bench'],[17,'home']]},
  mae:{6:[[6,'home'],[11.2,'square'],[13,'home'],[15,'store'],[18.5,'home']],5:[[6,'home'],[7,'store'],[9,'stall_shop'],[13,'store'],[18.5,'home']]},
  dunn:{1:[[6,'home'],[7,'route'],[8.5,'square'],[10,'farmgate'],[12,'garage'],[14,'board'],[16,'farmlane'],[18,'square'],[19.2,'home']]},
  gideon:{2:[[6,'home'],[7,'forge'],[9,'forge_yard'],[16,'forge'],[18,'store'],[19,'home']]}};
const HANGOUTS=[
  {name:'Sunday service',dow:[6],from:7.5,to:9.6,place:'church',who:['hale','ida','agnes','mae','tobias','cora','june','otto','dunn','wes','silas','gideon','nell','ezra','pip','orla','bram','della','abel']},
  {name:'Friday night at the Lamplighter',dow:[4],from:17.5,to:19.6,place:'tavern',who:['hollis','dunn','silas','gideon','nell','ezra','june','otto','wes','orla','abel','maud']},
  {name:'the well',dow:[0,2,4],from:8,to:9.2,place:'well_court',who:['ida','june','cora','della']},
  {name:'the pond after school',dow:[0,1,2,3,4],from:15,to:16.5,place:'pond',who:['tobias','pip','bram']},
  {name:'Saturday market',dow:[5],from:9,to:13,place:'market',who:['ida','agnes','orla','della','june']}];
const HABITS=[{id:'silas',from:19,to:19.5,place:'trash',face:'N',line:'Silas straightens up from the trash can with something small in his fist. He pockets it before you can see. “People throw away the most important things. Teeth, mostly.”'}];
// ---- breaking the timeline: from the fourth day, people are not where they always are
const BREAKS=[
  {day:4,id:'hale',from:17,to:19.4,at:[26.4,-35.3],face:'N',spot:'the bench on the green',line:'Pastor Hale stands with his nose almost touching the rock. He doesn’t blink. His lips are moving: he is reading something off the bare stone, very slowly, word by word.'},
  {day:6,id:'cora',from:11.8,to:13.6,at:[67.6,15.6],face:'N',spot:'the notice board',line:'Miss Vance is in the copse, touching each tree in turn and counting under her breath. She has got to nine thousand and something. She does not look at you. “Don’t interrupt. I’ll lose my place.”'},
  {day:8,id:'otto',from:6,to:10,at:[49,33],face:'S',spot:'the dock on the pond',line:'Otto is standing in the town pond, up to his knees in water ten inches deep, staring down. “Can’t see the bottom,” he says. “Can you see the bottom?”'},
  {day:9,id:'june',from:7.5,to:10.8,at:[60.8,12.5],face:'N',spot:'her mail route',line:'June has climbed the first rungs of the water tower and stopped, holding on, face pressed to the ladder. Her mail bag is on the ground. Every letter in it is addressed to you.'},
  {day:11,id:'ida',from:9.5,to:13,at:[40.9,-35.7],face:'N',spot:'the bake table',line:'Ida is in the walled garden, kneeling at the fountain with her hands in the water up to the wrists. She is humming the Tithe hymn. When you say her name she keeps humming, and smiles, and doesn’t turn round.'}];
const breakNow=n=>{for(const b of BREAKS)if(b.id===n.def.id&&S.day>=b.day&&(S.day-b.day)%7===0&&S.hour>=b.from&&S.hour<b.to)return b;return null;};
for(const b of BREAKS)PL['brk_'+b.id]=[b.at[0],b.at[1],.05];
// ---- the missing: gone for days, and nobody admits it
const MISSING=[{id:'pip',from:5,to:8,name:'Pip'},{id:'nell',from:12,to:14,name:'Nell'}];
const missingNow=()=>MISSING.filter(m=>S.day>=m.from&&S.day<m.to&&!S.bound);
const isMissing=id=>missingNow().some(m=>m.id===id);
// a rock face in the hill copse for the pastor to stare at
{const _bw=buildWorld;buildWorld=function(){_bw();if(SPR.rg_outcrop){obj('rg_outcrop',26.4,-36.6,{kind:'prop',town:1});addRect(25,-37.2,27.8,-36.6);}};}

{const _wf=wantFor;wantFor=function(n){const w=_wf.apply(this,arguments);if(!n||!n.def)return w;const id=n.def.id;const L=LIFE[id];if(!L)return w;
  if(w==='fest'||(typeof w==='string'&&(w.startsWith('rgv')||w.startsWith('rgf'))))return w;
  const b=breakNow(n);if(b)return 'brk_'+id;
  if(S.hour>=19.6&&w==='home')return w;
  const d=dow(),h=S.hour;
  for(const x of HABITS)if(x.id===id&&h>=x.from&&h<x.to)return x.place;
  for(const H_ of HANGOUTS)if(H_.dow.includes(d)&&h>=H_.from&&h<H_.to&&H_.who.includes(id)){if(raining()&&!INDOOR[H_.place])break;if(H_.place==='church'&&id==='hale')return 'church';return H_.place;}
  let cur=w;const wk=WEEK[id]&&WEEK[id][d];if(wk){cur=wk[0][1];for(const [hh,k] of wk)if(h>=hh)cur=k;if(h>=19.6&&cur!=='church')cur='home';}
  // in the rain, anyone not at work goes home
  if(raining()&&!INDOOR[cur]&&!['home','church','garage','dock'].includes(cur))return 'home';
  return cur;};}
// people facing what they're doing: the stone, the trash can, the water
{const _u=update;update=function(dt){_u(dt);if(S.room)return;for(const n of npcs){if(n.loc!=='out'||n.route||talkingTo===n)continue;const b=breakNow(n);
    if(b&&Math.hypot(n.x-b.at[0],n.z-b.at[1])<.5){n.dir=b.face;n.clip='idle';continue;}
    for(const x of HABITS)if(x.id===n.def.id&&n.target===x.place){n.dir=x.face;n.clip=((S.hour*600)|0)%3?'idle':'walk';}}};}
// the missing are simply not there: take them out of the town's day while they're gone
{const _tt=townTick;townTick=function(dt){const gone=missingNow(),saved={};for(const m of gone){saved[m.id]=LIFE[m.id];delete LIFE[m.id];const n=npcById(m.id);if(n){n.vis=false;n.loc='gone';n.route=null;}}
  try{_tt(dt);}finally{for(const [id,L] of Object.entries(saved))LIFE[id]=L;}
  for(const m of MISSING){const n=npcById(m.id);if(n&&n.loc==='gone'&&!isMissing(m.id)){n.loc=null;n.vis=true;}}};}
// ---- what they say: the breaks, the habits, the gaslighting, the return
{const _t=talk;talk=function(n){_t(n);const id=n.def.id;let line=null;S.rt=S.rt||{};
  const b=breakNow(n);if(b&&Math.hypot(n.x-b.at[0],n.z-b.at[1])<2){line=b.line;if(!S.rt['brk'+id+S.day]){S.rt['brk'+id+S.day]=1;addLore(b.line);mindHit&&mindHit(4);}S.rt['saw_'+id]=S.day;}
  else if(S.rt['saw_'+id]&&S.rt['saw_'+id]<S.day&&!S.rt['deny_'+id]){S.rt['deny_'+id]=1;line=pick(['In the woods? Me? No, love. I was at '+(BREAKS.find(q=>q.id===id)||{}).spot+', same as always. You must have seen someone else.','I don’t know what you think you saw. I was exactly where I always am. Ask anyone.','(A long pause, then a very normal smile.) That wasn’t me.']);}
  else{const x=HABITS.find(q=>q.id===id&&n.target===q.place);if(x)line=x.line;}
  if(!line){const g=missingNow().filter(m=>m.id!==id);if(g.length&&!isNight()&&rand()<.65){const m=g[0];const k=(S.rt['gl_'+m.id]=(S.rt['gl_'+m.id]||0)+1);
      line=[`${m.name}? ${m.name}’s fine. ${m.name} was here this morning. You talked to them. Don’t you remember?`,`Nobody’s missing. Why would you say a thing like that? Who have you been talking to?`,`${m.name} is right where ${m.name} always is. Don’t make that face. You’re frightening people.`,`(They look at you for a long moment.) There’s nobody called ${m.name} in Marrow Hollow. There never was. Are you feeling all right?`][Math.min(3,k-1)];
      if(k===1)addLore(`${m.name} is gone, and nobody in town will admit it.`);}}
  if(!line){const m=MISSING.find(q=>q.id===id&&S.day>=q.to&&S.day<q.to+3);if(m&&!S.rt['back_'+id]){S.rt['back_'+id]=1;line='I’ve been right here. The whole time. Why are you looking at me like that? (There is dirt under every one of their nails, packed hard, as if they dug their way out of something.)';mindHit&&mindHit(3);}}
  if(line&&$('talkLine'))$('talkLine').innerHTML=`<q>${line}</q>`;};}
// ---- the mimics: when they think nobody is watching
const MIMICS={ida:{room:'home_hale',kind:'stove',spot:[7.2,1.6]},june:{room:'home_june',kind:'circle',spot:[5.4,2.6],r:.9}};
{let unseen={};const _u=update;update=function(dt){_u(dt);if(!S.room)return;for(const [id,M_] of Object.entries(MIMICS)){if(S.room!==M_.room)continue;const n=npcById(id);if(!n||n.loc!=='in'||talkingTo===n){unseen[id]=0;continue;}
    const R=ROOMS[M_.room];const dx=n.x-P.x,dz=n.z-P.z,dist=Math.hypot(dx,dz);const facing=(P.dir==='E'&&dx>0&&Math.abs(dz)<Math.abs(dx)+1)||(P.dir==='W'&&dx<0&&Math.abs(dz)<Math.abs(dx)+1)||(P.dir==='S'&&dz>0)||(P.dir==='N'&&dz<0);
    const watched=dist<1.6||(facing&&dist<6);
    if(watched){if(n.mimic){n.mimic=0;n.clip='idle';const p=homeRoomPos(n);if(p){n.x=p[0];n.z=p[1];}n.dir='S';S.rt=S.rt||{};if(!S.rt['mim'+id+S.day]){S.rt['mim'+id+S.day]=1;
          toast(id==='ida'?'Ida turns round from the stove with a bright smile. “Oh! Supper’s nearly ready.” The stove is cold. There’s nothing in the pot.':'June stops dead in the middle of the room. “Oh! I didn’t hear you come in.” The rug has a circle worn into it, perfectly round.',4.5,true);mindHit&&mindHit(3);}}
      unseen[id]=0;continue;}
    unseen[id]=(unseen[id]||0)+dt;if(unseen[id]<3.5)continue;n.mimic=1;const t=performance.now()/1000;
    if(M_.kind==='stove'){n.x=R.ox+M_.spot[0];n.z=R.oz+M_.spot[1];n.dir=Math.floor(t*2.5)%2?'E':'W';n.clip='idle';}
    else{const a=t*1.6;n.x=R.ox+M_.spot[0]+Math.cos(a)*M_.r;n.z=R.oz+M_.spot[1]+Math.sin(a)*M_.r*.7;n.dir=dirOf(-Math.sin(a),Math.cos(a)*.7);n.clip='walk';}}};}
interact.push({x:0,z:0,r:1,on:()=>S.room==='home_hale',label:()=>'Stove',ok:()=>true,act(){const n=npcById('ida');const t=n&&n.mimic?'The stove is stone cold. The pot is empty and scrubbed. Ida has been stirring it for an hour with her eyes open and nothing in them, humming. On the table behind her, five places are laid. There are two of them.':'The parsonage stove. Cold. It has not been lit this year.';
  toast(t,5,true);if(n&&n.mimic){S.rgLook=S.rgLook||{};if(!S.rgLook.idastove){S.rgLook.idastove=1;addLore(t);mindHit&&mindHit(4);}}}});
{const it=interact[interact.length-1];Object.defineProperties(it,{x:{get(){return ROOMS.home_hale?ROOMS.home_hale.ox+7.2:0;}},z:{get(){return ROOMS.home_hale?ROOMS.home_hale.oz+2.1:0;}}});}
// ---- each morning: what day it is, and the weather
{const _nd=newDay;newDay=function(msg,pos){const r=_nd.apply(this,arguments);setTimeout(()=>{if(S.mode!=='play')return;const d=dow();
    const notes=[];for(const H_ of HANGOUTS)if(H_.dow.includes(d)&&H_.name!=='the well'&&H_.name!=='the pond after school')notes.push(H_.name);if(rainDay(S.day))notes.push('rain by mid-morning');
    toast(`${WEEKDAYS[d]}.${notes.length?' '+notes.join(', ')+'.':''}`,3);},4600);return r;};}
// ---- daytime rain: drops, a grey sky, the sound of it, and dimmer rooms
{const _do=depthOver;depthOver=function(t){_do(t);if(!rainNow())return;const h=S.hour,k=Math.min(1,(h-9.5)/.4,(15.5-h)/.4);ctx2.save();ctx2.globalAlpha=k;
  ctx2.fillStyle='rgba(52,62,84,.22)';ctx2.fillRect(0,0,VW,VH);
  // far drops: short and faint; near drops: long, bright, slanted by the wind
  ctx2.strokeStyle='rgba(170,190,220,.32)';ctx2.lineWidth=1;ctx2.beginPath();
  for(let i=0;i<150;i++){const x=(hash(i,1)*VW*1.2+t*30)%(VW*1.2)-VW*.1,y=(hash(i,2)*VH+t*420)%VH;ctx2.moveTo(Math.round(x),Math.round(y));ctx2.lineTo(Math.round(x-1),Math.round(y+5));}ctx2.stroke();
  ctx2.strokeStyle='rgba(205,222,245,.55)';ctx2.beginPath();
  for(let i=0;i<70;i++){const x=(hash(i,3)*VW*1.2+t*60)%(VW*1.2)-VW*.1,y=(hash(i,4)*VH+t*760)%VH;ctx2.moveTo(Math.round(x),Math.round(y));ctx2.lineTo(Math.round(x-3),Math.round(y+12));}ctx2.stroke();
  // splashes: little rings that open and fade where the drops land
  ctx2.strokeStyle='rgba(200,215,235,.5)';
  for(let i=0;i<46;i++){const ph=t*2.6+hash(i,5),c=Math.floor(ph),f=ph-c;const x=hash(i,c*7+1)*VW,y=hash(i,c*7+2)*VH;ctx2.globalAlpha=k*(1-f)*.9;ctx2.beginPath();ctx2.ellipse(Math.round(x),Math.round(y),1+f*4,.5+f*1.6,0,0,6.283);ctx2.stroke();
    if(f<.25){ctx2.fillStyle='rgba(215,228,245,.7)';ctx2.fillRect(Math.round(x),Math.round(y-2-f*8),1,1);}}
  ctx2.restore();};}
{const _am=ambient;ambient=function(h){const a=_am(h);if(!raining())return a;const k=S.room?.82:.8;return [a[0]*k,a[1]*k,a[2]*(k+.04)];};}
{let acc=0;const _u=update;update=function(dt){_u(dt);acc+=dt;if(acc<.5||!A||!A.ok||!A.rain)return;acc=0;try{if(raining()&&!isNight())A.rain.gain.setTargetAtTime(S.room?.025:.06,A.ctx.currentTime,1);}catch(e){}};}
// ---- a spot inside a gathering place is never inside a prop or in the water: try a few, fall back to the middle
{const _px=placeXY;placeXY=function(key,n){const p=PL[key];if(!p)return null;for(let i=0;i<8;i++){const q=_px(key,n);if(!q)return q;const t={x:q[0],z:q[1]};collide(t,.34);
    if(Math.hypot(t.x-q[0],t.z-q[1])<.02&&!(typeof LAYERS!=='undefined'&&LAYERS.water&&LAYERS.water(q[0],q[1])))return q;}return [p[0],p[1]];};}
