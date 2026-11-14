/* ================= out in the new land: a festival and heart events of its own.
   The 24th, the Lantern Float at Marrow Reservoir (4pm-7:30pm): both villages walk out to the north shore at dusk, Wickham too,
   because Old Wickham is under that water. Iris has folded a paper lantern for everyone. You set yours on the water off the dock
   for someone the valley took (Ruth, Danny, Nils, Greyfield's children, or yourself) and watch it go out among the others. When
   the last one is far enough out, the bell rings under the water, once for each.
   And eight heart events that only happen out there, when you find someone on the day they go: Agnes in the birches, Silas at
   the Greyfield graves, Otto on the reservoir dock, Maud at the Old Marrow chapel, Moss on Pine Ridge, Della in the fen, Wes at
   the county line and Ezra at the edge of the Deep Corn. ================= */
FESTS[24]={k:'float',name:'Lantern Float',from:16,to:19.5,where:'Marrow Reservoir',
  say:'Tonight at four it’s the Lantern Float at Marrow Reservoir, south of the river. Set a lantern on the water for someone the valley took.'};
const RGF={spots:null,lanterns:[],mine:null,rang:0};
// where everyone stands along the north shore: dry ground, close to the water, either side of the dock
function rgfSpots(){if(RGF.spots)return RGF.spots;const out=[];const R=RGP.res;
  for(let a=-2.35;a<=-.75&&out.length<40;a+=.045){for(let d=1.05;d<1.4;d+=.03){const x=R.x+Math.cos(a)*R.rx*d,z=R.z+Math.sin(a)*R.rz*d;
      if(LAYERS.water(x,z)||onDock(x,z))continue;if(Math.abs(x-RGP.dock.x)<1.6)break;const A=cgNear(x,z,.4);if(A.c.some(c=>Math.hypot(c.x-x,c.z-z)<c.r+.4)||A.r.some(q=>x>q.x0-.4&&x<q.x1+.4&&z>q.z0-.4&&z<q.z1+.4))continue;
      if(out.some(p=>Math.hypot(p[0]-x,p[1]-z)<1.3))break;out.push([x,z]);break;}}
  return RGF.spots=out;}
const rgfOn=()=>{const f=typeof fOn==='function'&&fOn();return f&&f.k==='float'?f:null;};
// everyone goes: the float is the one thing both villages turn out for
{const _w=wantFor;wantFor=function(n){const f=rgfOn();if(!f)return _w.apply(this,arguments);const sp=rgfSpots();if(!sp.length)return _w.apply(this,arguments);
  const i=npcs.indexOf(n);const k='rgf_'+(i%sp.length);if(!PL[k])PL[k]=[sp[i%sp.length][0],sp[i%sp.length][1],.1];return k;};}
{const _px=placeXY;placeXY=function(key,n){if(typeof key==='string'&&key.startsWith('rgf_')){const p=PL[key];return p?[p[0],p[1]]:null;}return _px.apply(this,arguments);};}
if(typeof PLACE_WORD!=='undefined')for(let i=0;i<40;i++)PLACE_WORD['rgf_'+i]='at the Lantern Float on the reservoir shore';
// the square stays plain that day; the dock gets its lanterns instead
const RGF_DEC=[];
{const _bw=buildWorld;buildWorld=function(){_bw();const d=RGP.dock;RGF_DEC.push(obj('f_lanterns',d.x-3.2,d.z-4.2,{kind:'prop',hide:true,noCol:true,glow:1}),obj('f_bunting',d.x+3.6,d.z-4.4,{kind:'prop',hide:true,noCol:true}));};}
{const _fd=fDress;fDress=function(){_fd.apply(this,arguments);const f=typeof fToday==='function'&&fToday();const float=!!(f&&f.k==='float');
  if(float)for(const o of FDEC)o.hide=true;for(const o of RGF_DEC)o.hide=!float||!!S.room;};}
// ---- the lanterns on the water
function rgfSeed(){RGF.lanterns=[];RGF.rang=0;const R=RGP.res,d=RGP.dock;
  for(let i=0,t=0;i<26&&t<600;t++){let x,z;if(i<14){x=d.x+(Math.random()-.5)*20;z=d.z+2.4+Math.random()*7;}else{const a=Math.random()*6.283,r=Math.sqrt(Math.random())*.75;x=R.x+Math.cos(a)*R.rx*r*.9;z=R.z-R.rz*.25+Math.sin(a)*R.rz*r*.6;}
    if(!inRes(x,z)||onDock(x,z))continue;RGF.lanterns.push({x,z,vx:(Math.random()-.3)*.06,vz:.01+Math.random()*.03,ph:Math.random()*6,a:0});i++;}}
const RGF_FOR=[['ruth','Ruth Abernathy','agnes','Agnes'],['danny','Danny','mae','Caitlyn'],['nils','Nils Lindqvist','otto','Otto'],['grey','Greyfield’s children','silas','Silas'],['self','yourself',null,null]];
function rgfFloat(){if(RGF.mine){toast('Yours is already out there. You can still see it. It’s the one that isn’t drifting.',3);return;}
  openNote('<h3>The Lantern Float</h3><p>Iris presses a paper lantern into your hands, already lit, already warm. <q>For someone the valley took. Say their name when you put it down. They hear it better over water.</q></p><p style="text-align:center">'+
    RGF_FOR.map(([k,n])=>`<button class="btn rgfGo" data-k="${k}" style="margin:3px 4px">${k==='self'?'Your own name':n}</button>`).join('')+'</p>','Not yet',()=>{});
  document.querySelectorAll('#noteText .rgfGo').forEach(b=>b.addEventListener('click',()=>{const r=RGF_FOR.find(q=>q[0]===b.dataset.k);$('note').hidden=true;noteCb=null;S.paused=false;
    const d=RGP.dock;RGF.mine={x:d.x+(Math.random()-.5)*.6,z:d.z+2.6,vx:.04,vz:.22,ph:0,a:1,mine:r[0]};S.fest.float=S.day;SFX.page&&SFX.page();
    setTimeout(()=>{if(r[0]==='self'){toast('You say your own name over the water. Out among the lanterns, one of them turns round and starts to come back.',5,true);mindHit&&mindHit(4);
        addLore('At the Lantern Float you set a lantern on the water in your own name. Out among the others, one turned round and came back toward the dock.');}
      else{toast(`You say ${r[1]} over the water and let go. ${r[3]?r[3]+' is watching from the shore, and nods.':''}`,4.4);if(r[2]&&typeof addFriend==='function')addFriend(r[2],60);
        if(typeof M!=='undefined')M.v=Math.min(100,M.v+8);}},900);},{once:true}));}
{const _bw=buildWorld;buildWorld=function(){_bw();const d=RGP.dock;interact.push({x:d.x,z:d.z+1.4,r:1.2,on:()=>!!rgfOn()&&!S.room,label:()=>'Float a lantern',ok:()=>true,act:rgfFloat});};}
{const _u=update;update=function(dt){_u(dt);if(S.mode!=='play')return;try{const f=typeof fToday==='function'&&fToday();
  if(!f||f.k!=='float'||S.hour<15.5||S.hour>22){if(RGF.lanterns.length)RGF.lanterns.length=0;RGF.mine=null;return;}
  if(!RGF.lanterns.length)rgfSeed();
  for(const l of RGF.lanterns.concat(RGF.mine?[RGF.mine]:[])){l.ph+=dt;l.a=Math.min(1,l.a+dt*.3);const nx=l.x+l.vx*dt,nz=l.z+l.vz*dt*(l.mine?1:.6);
    if(inRes(nx,nz)){l.x=nx;l.z=nz;}else{l.vx=-l.vx;l.vz=-l.vz*.5;}
    if(l.mine&&l.vz>.04)l.vz-=dt*.02;}
  // when the light goes, the bell under the water rings once for every lantern out there
  if(isNight()&&!RGF.rang&&Math.hypot(P.x-RGP.res.x,P.z-RGP.res.z)<70){RGF.rang=1;const n=RGF.lanterns.length+(RGF.mine?1:0);for(let i=0;i<Math.min(n,23);i++)A.tone&&A.tone(196,2.4,'sine',.035,{delay:i*1.1,filter:['lowpass',700]});
    toast('Under the water, the bell rings. Once for every lantern.',4.5);}}catch(e){}};}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);if(S.room)return;for(const l of RGF.lanterns.concat(RGF.mine?[RGF.mine]:[])){if(!onScreen(l.x,l.z,30))continue;
  D.push({z:l.z,mind:1,draw(){const X=Math.round(sx(l.x)),Y=Math.round(sz(l.z)-4+Math.sin(l.ph*1.3)*1.2);const a=l.a;ctx2.globalAlpha=a;
    ctx2.fillStyle='rgba(255,200,110,.35)';ctx2.fillRect(X-5,Y+6,11,2);ctx2.fillStyle='rgba(255,200,110,.18)';ctx2.fillRect(X-3,Y+9,7,1);   // its light on the water
    ctx2.fillStyle='#3a2014';ctx2.fillRect(X-5,Y-8,11,14);                                             // outline
    ctx2.fillStyle='#d8602a';ctx2.fillRect(X-4,Y-7,9,12);ctx2.fillStyle='#f8a850';ctx2.fillRect(X-4,Y-7,4,12);ctx2.fillStyle='#ffe8a8';ctx2.fillRect(X-2,Y-4,3,6);ctx2.fillStyle='#fffbe0';ctx2.fillRect(X-1,Y-2,1,2);
    ctx2.fillStyle='#5a3420';ctx2.fillRect(X-4,Y-7,9,1);ctx2.fillRect(X-4,Y+4,9,1);ctx2.globalAlpha=1;}});}};}
// the lanterns and the fen's lights shine in the dark
{const _ll=lifeLight;lifeLight=function(t,L){_ll(t,L);try{if(S.room)return;
  for(const l of RGF.lanterns.concat(RGF.mine?[RGF.mine]:[]))if(onScreen(l.x,l.z,60)){glowAt(sx(l.x),sz(l.z)-6,40,[255,170,80],.8*l.a);glowAt(sx(l.x),sz(l.z)-6,12,[255,230,170],.9*l.a);}
  if(typeof RGA!=='undefined')for(const w of RGA.wisps)if(w.a>0&&onScreen(w.x,w.z,60))glowAt(sx(w.x),sz(w.z)-18-Math.sin(w.ph*2)*4,24,[140,255,170],.6*L*w.a);}catch(e){}};}
// the journal's festival list says where this one is
{const _oj=openJournal;openJournal=function(){const r=_oj.apply(this,arguments);try{const el=$('noteText');for(const p of el.querySelectorAll('p'))if(/Lantern Float/.test(p.innerHTML))p.innerHTML=p.innerHTML.replace('the town square','Marrow Reservoir (the north shore, by the dock)');}catch(e){}return r;};}
// ---- heart events that happen out there
const RG_HEARTS={
 agnes:{title:'The doll with no face',text:`Agnes is sitting on a stump in the middle of the birches with a doll in her lap and a needle in her hand.<br><br><q>Every year someone sews the doll before the drawing. It’s been me since Ruth. You sew it, and whoever’s drawn, it’s already theirs.</q><br><br>She turns it over. A little dress the colour of your shirt. Hair the colour of yours. The face is a blank oval of calico.<br><br><q>I’ve sat here three Tuesdays,</q> she says. <q>I can sew anybody’s face. I won’t sew yours.</q> She bites the thread off and puts the doll in her bag, faceless. <q>Let it try and find you without one.</q>`,
  lore:'Agnes sews the doll every year before the drawing. This year’s has your hair and your colours, and she has left its face blank, so it can’t find you by it.'},
 silas:{title:'Number ninety-two',text:`Silas has a little iron cross under his arm, wrapped in sacking. He unwraps it at the end of the last row. It is stamped 92.<br><br><q>Made it in ’51. Never put it in.</q> He sets it in the grass and looks at it. <q>A girl came back that year. Out of the Tithe House, in the morning, in her nightdress. Walked all the way here, to the only home she knew.</q><br><br><q>The matron sent her on again that night. I dug for her. They never brought her.</q><br><br>He pushes the cross into the ground, hard, with both hands. <q>There. She can stop walking.</q>`,
  lore:'In 1951 a girl walked back out of the Tithe House to Greyfield. They sent her on again that night. Silas made her cross, number 92, and only now planted it.'},
 otto:{title:'Three tugs',text:`Otto has a hand line out off the end of the dock, no rod, wound round two fingers. He doesn’t bait it. He hasn’t baited it in sixty years.<br><br><q>Nils and me had a signal. One tug, all right. Two, come here. Three, I’m not coming back.</q><br><br>The line goes taut. It tugs. Once. Twice.<br><br>Otto doesn’t breathe. The third tug doesn’t come. He lets the line go slack and starts to laugh, and then to cry, and he does both for a long time, and you sit with him.<br><br><q>Come here,</q> he says, to the water. <q>He said come here.</q>`,
  lore:'Otto fishes the reservoir with an unbaited hand line. He and Nils had a signal: one tug all right, two come here, three not coming back. Something under the water tugged twice.'},
 maud:{title:'The mason’s mark',text:`Maud scrubs a patch of soot off the side of the altar with a wire brush, and blows the dust away. Under it, cut small and deep, a mark: a T inside a square. The Thorne mark. And a date.<br><br><q>Day before the first child,</q> she says. <q>We cut the altar before anybody asked us to. My great-great-grandmother knew it would be wanted. She knew what size.</q><br><br>She puts the brush away. <q>Everyone thinks the quarry pays for my house. It doesn’t. This does. A stone a year, for the Tithe House, since 1871. I’ve got the receipts.</q>`,
  lore:'The Thorne mason’s mark is cut into Old Marrow’s altar, dated the day before the first child. The quarry has been paid a stone a year for the Tithe House since 1871.'},
 moss:{title:'The tracks going up',text:`Moss crouches by a soft patch of ground on the ridge path and doesn’t say anything for a while. Then he moves aside so you can see.<br><br>A line of boot prints, going up toward the lookout. Your size. Your tread: the worn heel on the left, the nick in the right sole.<br><br><q>Made this morning,</q> he says. <q>You were in town this morning. I asked.</q><br><br>He looks up the path, the way they go. <q>They never come down. Not one set, in forty years.</q> He takes a cast of the left print in plaster and gives it to you. <q>So you know which ones are yours.</q>`,
  lore:'On Pine Ridge Moss found your boot prints going up toward the lookout, made while you were in town. Nothing’s tracks ever come down.'},
 della:{title:'Weighed for the share',text:`Della has her sleeves rolled up and her arms black to the elbow with peat. She has pulled out a token on a grass rope and is wiping it on her apron.<br><br>It has a year burnt into it. The year you were born.<br><br><q>Your grandfather brought you to me the week you were born, to be weighed,</q> she says. <q>Seven pounds four. I wrote you down for the share in the mill book. Everyone born in the valley gets written down.</q><br><br><q>He took you away that night. Drove you out past the county line, the only one who ever got a baby past it. He came back alone.</q> She puts the token in your hand and closes your fingers over it. <q>I’m sorry. I weighed you.</q>`,
  lore:'Della weighed you the week you were born and wrote you down for the share. Grandpa drove you out past the county line that night, the only one who ever got a baby past it, and came back alone.'},
 wes:{title:'His mother’s face',text:`Wes is sitting on the guardrail by the county sign, throwing gravel at it.<br><br><q>Every time I walk past it and come back in at your gate, I lose something. Small stuff, at first. My phone number. The name of my dog.</q><br><br><q>Fourth time, I lost my mum’s face. I can remember she had one.</q><br><br>He looks at you. <q>Will you remember something for me? In case I try again.</q> And he tells you about her: a gap in her front teeth, a burn on her wrist from the garage stove, how she laughed with her eyes shut. You promise to remember. He says it out loud twice more to be sure you have it.`,
  lore:'Every time Wes walks past the county line he loses a memory. On the fourth try he lost his mother’s face. You promised to remember it for him.'},
 ezra:{title:'What the corn grows',text:`Ezra is cutting cobs from the very edge of the Deep Corn and throwing them in a cart. He breaks one open to show you.<br><br>The kernels are perfect, white, in their rows. Down at the bottom of the cob, where it joined the stalk, one row is different. Small and square and yellowed. Milk teeth.<br><br><q>One cob in every field,</q> he says. <q>Every year. I find it and I bury it.</q> He doesn’t look at the maze. <q>The stock won’t eat this corn till I’ve found that cob. They stand at the fence all night, facing the middle.</q>`,
  lore:'In every year’s Deep Corn there is one cob with a row of milk teeth at its root. Ezra finds it and buries it. Until he does, his stock won’t eat.'}};
for(const [id,e] of Object.entries(RG_HEARTS)){const P_=PEOPLE[id],v=RGV_BY[id];if(!P_||!v)continue;let h=6.75;while(P_.events.some(q=>Math.abs(q.h-h)<.01))h-=.25;
  e.h=h;e.where=v.at;e.visit=v;P_.events.push(e);}
// a scene that belongs out there only plays out there
{const _st=socialTalk;socialTalk=function(n){const P_=n&&n.def&&PEOPLE[n.def.id];if(!P_)return _st.apply(this,arguments);const all=P_.events;
  P_.events=all.filter(e=>!e.where||Math.hypot(n.x-e.where[0],n.z-e.where[1])<10);try{return _st.apply(this,arguments);}finally{P_.events=all;}};}
// and the heart-events tab says where and when to find them for it
// the valley counts days, not weekdays: say which day they'll next be out there
function rgvNext(v){for(let d=S.day;d<S.day+8;d++){if(!v.days.includes(d%7))continue;if(d===S.day&&S.hour>=v.to)continue;return d;}return S.day;}
const rgvWhen=v=>{const d=rgvNext(v);return `every seventh day, ${clockH(v.from)}–${clockH(v.to)}, next ${d===S.day?'today':d===S.day+1?'tomorrow':'on day '+d}`;};
{const _hh=heartEventsHtml;heartEventsHtml=function(){let h=_hh.apply(this,arguments);try{for(const [id,e] of Object.entries(RG_HEARTS)){if(!e.visit)continue;const n=npcById(id);if(!n)continue;const v=e.visit;
    const r=rgAt(v.at[0],v.at[1]);const place=r?r.name.replace(/^The /,'the '):'out of town';
    h=h.replace(`<span class="het">${e.title}</span> — <span class="hen">Ready: talk to ${n.def.name} before ${clockH(HE_LATEST)}</span>`,`<span class="het">${e.title}</span> — <span class="hen">Ready: find ${n.def.name} out at ${place} (${rgvWhen(v)})</span>`)
     .replace(`<span class="het"><i>${e.title}</i></span> — `,`<span class="het"><i>${e.title}</i></span> <span class="jsub">(out at ${place})</span> — `);}}catch(e){}return h;};}
// their usual day, plus the days they go out
{const _hw=heWhere;heWhere=function(id){const r=_hw.apply(this,arguments);try{const v=typeof RGV_BY!=='undefined'&&RGV_BY[id];if(!v)return r;const g=rgAt(v.at[0],v.at[1]);
  return r+` · out at ${g?g.name.replace(/^The /,'the '):'the edge of the valley'} ${rgvWhen(v)}`;}catch(e){return r;}};}
