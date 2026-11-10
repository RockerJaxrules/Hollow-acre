// ---- #210 staged story scenes (owner: "redo the story cutscenes to the new standard")
// A story scene now happens in the place it is about, the way the intro crash does: the world holds still (S.mode 'cine'), the
// people in it walk to their marks, turn and stop; the camera eases between framings; letterbox bars come in; and each line plays
// as a caption over the live scene, spoken (with the speaker's HD portrait, its emotion read from the words) or narrated.
// Tap / Space / Enter / E: finish the line, then go on. Nothing in the world moves on its own while a scene plays.
let STG=null;
(function(){
  const css=document.createElement('style');css.textContent=`
#stgBars:before,#stgBars:after{content:'';position:fixed;left:0;right:0;height:0;background:#050406;transition:height .7s ease;z-index:58;pointer-events:none}
#stgBars:before{top:0}#stgBars:after{bottom:0}#stgBars.on:before,#stgBars.on:after{height:8.5vh}
#stgTap{position:fixed;inset:0;z-index:59;display:none;cursor:pointer}#stgTap.on{display:block}
#stgCap{position:fixed;left:50%;bottom:calc(8.5vh + 10px);transform:translateX(-50%);width:min(94vw,780px);display:none;gap:12px;align-items:flex-start;z-index:61;pointer-events:none;
 background:rgba(18,13,10,.9);border:2px solid #6a5238;box-shadow:0 0 0 2px #120c08,0 6px 18px rgba(0,0,0,.5);padding:10px 14px 16px;color:#efe4cc;font-size:15px;box-sizing:border-box}
#stgCap.on{display:flex}#stgCap canvas{width:88px;height:88px;image-rendering:pixelated;flex:none;background:#221812;border:2px solid #4a3828}
#stgCap .nm{color:#e8b860;margin-bottom:4px;letter-spacing:.5px}#stgCap .tx{line-height:1.4;min-height:2.8em}
#stgCap.narr{background:rgba(8,8,11,.82);border-color:#34303c}#stgCap.narr canvas,#stgCap.narr .nm{display:none}#stgCap.narr .tx{color:#d6d0c6}
#stgCap .more{position:absolute;right:10px;bottom:3px;font-size:11px;opacity:.5}
@media (max-width:600px){#stgCap{font-size:13px;padding:8px 10px 14px}#stgCap canvas{width:64px;height:64px}}`;
  document.head.appendChild(css);
  for(const id of ['stgBars','stgTap','stgCap']){const e=document.createElement('div');e.id=id;document.body.appendChild(e);}
  $('stgCap').innerHTML='<canvas width="96" height="96"></canvas><div style="flex:1;min-width:0"><div class="nm"></div><div class="tx"></div></div><div class="more"></div>';
  $('stgTap').addEventListener('pointerdown',e=>{e.preventDefault();stgNext();});
  addEventListener('keydown',e=>{if(STG&&(e.code==='Space'||e.code==='Enter'||e.code==='KeyE')){e.preventDefault();e.stopPropagation();stgNext();}},true);
})();
// an actor is a townsperson (by id) or 'you'
function stgActor(id){return id==='you'?P:npcById(id);}
function stgName(id){const n=npcById(id);return n?n.def.name:id;}
// def: {room, hour, storm, player:{x,z,dir}, cast:{id:{x,z,dir,seat}}, cam:{x,z}, beats:[...], props:[{x,z,draw(X,Y,t)}], light(L), done()}
// beat: {who, text, cam, go:{id:[x,z]}, face:{id:dir}, wait (s before the line shows; 'arrive' waits for the walkers), act(st), sit:{id:false}}
function stage(def){if(STG)return;
  const st={def,i:-1,t:0,bt:0,typed:0,movers:{},pin:{},hidden:[],seated:[],em:{},prev:{hour:S.hour,storm:S.storm,room:S.room,P:{x:P.x,z:P.z,dir:P.dir}}};STG=st;
  S.mode='trans';fade(1);try{$('talk').hidden=true;talkingTo=null;S.paused=false;}catch(e){}
  setTimeout(()=>{
    if(def.room!==undefined)S.room=def.room;if(def.hour!==undefined)S.hour=def.hour;if(def.storm!==undefined)S.storm=def.storm;
    const pl=def.player||{};if(pl.x!==undefined){P.x=pl.x;P.z=pl.z;}P.dir=pl.dir||P.dir;P.anim=null;P.sit=null;P.clip='idle';P.spd=0;
    for(const n of npcs){if(def.cast&&def.cast[n.def.id])continue;if(n.vis){st.hidden.push(n);n.vis=false;}}           // only the cast is on stage
    for(const [id,c] of Object.entries(def.cast||{})){const n=npcById(id);if(!n)continue;n._stg={x:n.x,z:n.z,vis:n.vis,seat:n._seat,loc:n.loc};n.loc='stage';st.pin[id]={x:c.x,z:c.z};
      n.x=c.x;n.z=c.z;n.dir=c.dir||'S';n.clip='idle';n.vis=true;n._seat=c.seat||null;if(c.seat)st.seated.push(n);}
    H.vis=false;$('hud').hidden=true;$('buttons').hidden=true;ui.obj.hidden=true;try{ui.arrow.style.display='none';}catch(e){}
    cine={stage:true,hidePlayer:!!pl.hide,cam:{x:def.cam.x,z:def.cam.z},
      drawables(D){const t=st.t;for(const p of def.props||[])D.push({z:p.z,mind:1,draw(){p.draw(sx(p.x),sz(p.z),t);}});
        for(const [id,e] of Object.entries(st.em)){const a=stgActor(id);if(!a||e.t<=0)continue;const X=sx(a.x),Y=sz(a.z)-46-Math.sin(Math.min(1,(1.2-e.t)*6)*Math.PI)*3;
          D.push({z:1e6,mind:1,draw(){ctx2.fillStyle='#120c08';ctx2.fillRect(X-6,Y-8,12,12);ctx2.fillStyle='#efe4cc';ctx2.fillRect(X-5,Y-7,10,10);ctx2.fillStyle=e.c||'#2a1a10';
            ctx2.font='9px monospace';ctx2.textAlign='center';ctx2.fillText(e.k,X,Y+1);ctx2.fillStyle='#120c08';ctx2.fillRect(X-1,Y+4,2,2);}});}},
      light(L){def.light&&def.light(L);},
      update(dt){stgUpdate(dt);}};
    S.mode='cine';fade(0);$('stgBars').classList.add('on');$('stgTap').classList.add('on');
    setTimeout(()=>stgBeat(0),def.lead||700);
  },420);}
function stgBeat(i){const st=STG;if(!st)return;const def=st.def;if(i>=def.beats.length)return stgEnd();
  st.i=i;st.bt=0;st.typed=0;const b=def.beats[i];
  for(const [id,to] of Object.entries(b.go||{})){const a=stgActor(id);if(!a)continue;if(a._seat&&id!=='you')a._seat=null;const pts=Array.isArray(to[0])?to.map(p=>p.slice()):[to];const f=pts.shift();
    st.movers[id]={x:f[0],z:f[1],next:pts,face:(b.face||{})[id],sp:(b.speed||{})[id]||(id==='you'?1.5:1.15)};}
  for(const [id,d] of Object.entries(b.face||{})){if(st.movers[id])continue;const a=stgActor(id);if(a)a.dir=d;}
  for(const [id,v] of Object.entries(b.sit||{})){const a=stgActor(id);if(a&&!v){a._seat=null;}}
  for(const [id,k] of Object.entries(b.emote||{}))st.em[id]={k,t:1.6,c:k==='!'?'#a02818':k==='♥'?'#b02848':'#2a1a10'};
  if(b.cam)st.camT={x:b.cam.x,z:b.cam.z};
  b.act&&b.act(st);
  const cap=$('stgCap');cap.classList.remove('on');}
function stgMoving(){return Object.keys(STG.movers).length>0;}
function stgUpdate(dt){const st=STG;if(!st||st.ended||st.i<0){if(st)st.t+=dt;return;}const def=st.def,b=def.beats[st.i];st.t+=dt;st.bt+=dt;
  // walkers
  for(const [id,m] of Object.entries(st.movers)){const a=stgActor(id);if(!a){delete st.movers[id];continue;}const dx=m.x-a.x,dz=m.z-a.z,d=Math.hypot(dx,dz);
    if(d<.06){a.x=m.x;a.z=m.z;if(m.next&&m.next.length){const q=m.next.shift();m.x=q[0];m.z=q[1];continue;}if(m.face)a.dir=m.face;a.clip='idle';if(id==='you')P.spd=0;else st.pin[id]={x:a.x,z:a.z};delete st.movers[id];continue;}
    const s=Math.min(d,m.sp*dt);a.x+=dx/d*s;a.z+=dz/d*s;a.dir=dirOf(dx,dz);a.clip='walk';if(id==='you'){P.spd=m.sp;P.fx=dx/d;P.fz=dz/d;}}
  for(const [id,p] of Object.entries(st.pin)){if(st.movers[id])continue;const n=npcById(id);if(n){n.x=p.x;n.z=p.z;n.vis=true;n.loc='stage';}}
  P.t=(P.t||0)+dt;for(const n of npcs)if(n.vis)n.t=(n.t||0)+dt;
  for(const e of Object.values(st.em))e.t-=dt;
  // the camera eases to its framing
  if(st.camT){const k=1-Math.exp(-dt*(b.camSpeed||1.8));cine.cam.x+=(st.camT.x-cine.cam.x)*k;cine.cam.z+=(st.camT.z-cine.cam.z)*k;}
  b.update&&b.update(dt,st);
  // the line: shown once its wait is over (or the walkers have arrived), typed in
  const ready=b.wait==='arrive'?!stgMoving():st.bt>=(b.wait||0);const cap=$('stgCap');
  if(!b.text){if(ready&&!st.autoT){st.autoT=1;setTimeout(()=>{st.autoT=0;if(STG===st&&def.beats[st.i]===b)stgBeat(st.i+1);},(b.hold||0)*1000);}return;}
  if(!ready)return;
  if(!cap.classList.contains('on')){const who=b.who;cap.classList.toggle('narr',!who);cap.classList.add('on');
    if(who){const id=who==='you'?null:who;cap.querySelector('.nm').textContent=who==='you'?'You':stgName(who);
      const cv=cap.querySelector('canvas');if(id){const ex=b.expr||(typeof emotionOf==='function'?emotionOf(id,b.text):'neutral');const ok=drawPortrait(cv,id,ex);cv.style.display=ok?'':'none';}else cv.style.display='none';}
    SFX.page&&SFX.page();}
  const plain=b.text;if(st.typed<plain.length){const before=Math.floor(st.typed);st.typed=Math.min(plain.length,st.typed+dt*(b.who?44:38));
    if(Math.floor(st.typed)!==before&&b.who&&Math.floor(st.typed)%3===0&&SFX.blip)SFX.blip();}
  cap.querySelector('.tx').innerHTML=stgSlice(plain,Math.floor(st.typed));
  cap.querySelector('.more').textContent=st.typed>=plain.length?(st.i<def.beats.length-1?'▼':'■'):'';}
// type HTML text without breaking its tags
function stgSlice(h,n){let out='',c=0;for(let i=0;i<h.length&&c<n;i++){if(h[i]==='<'){const j=h.indexOf('>',i);out+=h.slice(i,j+1);i=j;continue;}out+=h[i];c++;}return out;}
function stgNext(){const st=STG;if(!st||st.ended||st.i<0)return;const b=st.def.beats[st.i];
  if(stgMoving()){for(const [id,m] of Object.entries(st.movers)){const a=stgActor(id);if(a){const q=m.next&&m.next.length?m.next[m.next.length-1]:[m.x,m.z];a.x=q[0];a.z=q[1];if(m.face)a.dir=m.face;a.clip='idle';if(id!=='you')st.pin[id]={x:a.x,z:a.z};}}st.movers={};if(!b.text)return;}
  if(b.text&&!$('stgCap').classList.contains('on')){st.bt=99;return;}
  if(b.text&&st.typed<b.text.length){st.typed=b.text.length;return;}
  stgBeat(st.i+1);}
function stgEnd(){const st=STG;if(!st||st.ended)return;st.ended=true;const def=st.def;$('stgCap').classList.remove('on');$('stgTap').classList.remove('on');fade(1);
  setTimeout(()=>{for(const n of st.hidden)n.vis=true;for(const n of npcs)if(n._stg){if(!def.keepCast){n.x=n._stg.x;n.z=n._stg.z;n.vis=n._stg.vis;}n._seat=n._stg.seat;n.loc=n._stg.loc;delete n._stg;n.clip='idle';}
    if(def.restore!==false){if(def.room!==undefined)S.room=st.prev.room;S.storm=st.prev.storm;if(def.room!==undefined&&def.room!==st.prev.room){P.x=st.prev.P.x;P.z=st.prev.P.z;P.dir=st.prev.P.dir;}}
    if(def.after)def.after();
    cine=null;STG=null;$('stgBars').classList.remove('on');$('hud').hidden=false;$('buttons').hidden=false;ui.obj.hidden=false;S.mode='play';P.clip='idle';P.spd=0;fade(0);
    def.done&&def.done();},520);}

// ======================= the scenes =======================
// small props drawn into the world
function stgHat(X,Y){const o='#1a120c';   // Grandpa's straw hat: a wide pale brim, a low crown, the faded red band
  ctx2.fillStyle=o;ctx2.fillRect(X-9,Y,18,3);ctx2.fillRect(X-5,Y-5,10,6);
  ctx2.fillStyle='#d2b26a';ctx2.fillRect(X-8,Y+1,16,1);ctx2.fillStyle='#b8964e';ctx2.fillRect(X-7,Y+2,14,0.01);
  ctx2.fillStyle='#e0c482';ctx2.fillRect(X-4,Y-4,8,3);ctx2.fillStyle='#f0d898';ctx2.fillRect(X-4,Y-4,3,1);
  ctx2.fillStyle='#9a3a2a';ctx2.fillRect(X-4,Y-1,8,1);ctx2.fillStyle='#c8a860';ctx2.fillRect(X-8,Y+1,3,1);}
function stgPhone(X,Y,t){ctx2.fillStyle='#120c08';ctx2.fillRect(X-2,Y-4,5,7);ctx2.fillStyle=(Math.sin(t*3)>0)?'#9ad0e8':'#6aa8c8';ctx2.fillRect(X-1,Y-3,3,4);}
function stgSlip(X,Y){ctx2.fillStyle='#120c08';ctx2.fillRect(X-3,Y-3,7,5);ctx2.fillStyle='#ece4d0';ctx2.fillRect(X-2,Y-2,5,3);ctx2.fillStyle='#6a5a48';ctx2.fillRect(X-1,Y-1,3,1);}

// 1. Caitlyn at the farm, the first time (after Grandpa's note)
function stgCaitlynGate(done){const d=doorPos;MAEV.on=false;
  const mae={x:d.x-6.4,z:d.z+3.4},meet={x:d.x-1.5,z:d.z+1.55},you={x:d.x+.05,z:d.z+1.25};let phone=true;
  stage({hour:Math.max(9.5,Math.min(S.hour,16)),player:{x:you.x,z:you.z,dir:'N'},cast:{mae:{x:mae.x,z:mae.z,dir:'E'}},cam:{x:d.x-1,z:d.z+2.6},
    props:[{get x(){return npcById('mae').x+.18;},get z(){return npcById('mae').z+.02;},draw(X,Y,t){if(phone)stgPhone(X+3,Y-30-Math.round(Math.sin(t*1.3)),t);}}],
    beats:[
      {hold:.6,face:{you:'S'}},
      {text:'A young woman in a black tee and square glasses is leaning on your gate, holding up a phone that has no signal out here, as if she has been waiting a while.',cam:{x:d.x-3.6,z:d.z+3},wait:.5,emote:{you:'?'}},
      {who:'mae',text:'Oh. Hi. You must be Elias’s grandkid. You have his walk.',act(){phone=false;},go:{mae:[meet.x,meet.z]},face:{mae:'E',you:'W'},cam:{x:d.x-.8,z:d.z+2},wait:'arrive'},
      {who:'mae',text:'I’m Caitlyn. I run the store in town. Coyle’s.',expr:'happy'},
      {who:'mae',text:'He asked me to look in on you, if you ever came. He said you wouldn’t. I said you would.'},
      {text:'She smiles. It doesn’t quite reach her eyes.',wait:.3},
      {who:'mae',text:'I win.',expr:'smug'},
      {who:'mae',text:'Let me show you how this place works. Then you’ll have a chance, at least.',face:{mae:'S'},cam:{x:d.x-.6,z:d.z+3.6},expr:'neutral'},
    ],
    after(){P.x=you.x;P.z=you.z;P.dir='W';},
    done(){maeCome(14,true);done&&done();}});}

// 2. The drawing, in the church: the whole valley in the pews, one space left in the front row
function stgDrawing(done){const R=ROOMS.church,ox=R.ox,oz=R.oz;const at=(x,z)=>({x:ox+x,z:oz+z});
  const dunn=typeof stHas==='function'&&stHas('dunnslip'),dn=stgName('dunn');
  // who sits where: Caitlyn front right (so she can turn to you), Dunn mid left on the aisle (so he can stand), kids together
  const pews=[[2.4,3.6],[7.6,3.6],[2.4,5.0],[7.6,5.0],[2.4,6.4],[7.6,6.4]],offs=[-1.35,-.45,.45,1.35];
  const want=['mae','tobias','hollis','agnes','dunn','silas','june','otto','cora','wes','ida','gideon','nell','ezra','pip','orla','bram','abel','della','maud','corwin','tess','hob','lyle','vera','quinn','nan','finn','iris','moss','ada']
    .filter(id=>npcById(id));
  const order=['silas','agnes','mae','june','hollis','otto','dunn','cora','wes','ida','pip','nan','finn','gideon','nell','ezra','orla','bram','abel','della','maud','corwin','tess','hob']
    .filter(id=>want.includes(id));
  const cast={hale:{...at(5,2.55),dir:'S'}};const seats=[];
  for(const [pi,[px,pz]] of pews.entries())for(const [k,o] of offs.entries()){if(pi===0&&k===2)continue;seats.push({x:ox+px+o,z:oz+pz+.05,pi});}   // the gap: front left, by the aisle
  // seat order fills front to back, Caitlyn in the front right pew on its aisle end
  const placed={};const front=[seats.find(s=>s.pi===1&&Math.abs(s.x-(ox+7.6-1.35))<.01)];const rest=seats.filter(s=>s!==front[0]);
  const list=['mae',...order.filter(i=>i!=='mae')];const sl=[front[0],...rest];
  list.forEach((id,i)=>{const s=sl[i];if(!s)return;placed[id]=s;cast[id]={x:s.x,z:s.z,dir:'N',seat:{x:s.x,z:s.z,lift:2,face:'N'}};});
  const standers=want.filter(id=>!cast[id]);standers.slice(0,6).forEach((id,i)=>{const p=[[.75,7.35],[9.25,7.35],[1.6,7.45],[8.4,7.45],[.7,4.3],[9.3,4.3]][i];cast[id]={...at(p[0],p[1]),dir:p[0]<5?'E':'W'};});
  const kids=['pip','nan','finn'].filter(id=>placed[id]);
  const gap=at(2.4+.45,3.65),door=at(5,7.55);let hatUp=0,slip=false,hand=0;
  const lines=dunn?[
      {who:'hale',text:`${dn}.`,cam:{x:ox+5,z:oz+3.4}},
      {text:`${dn} is on his feet before Hale finishes. He looks at you and touches the brim of his hat.`,go:placed.dunn?{dunn:[[placed.dunn.x,placed.dunn.z+.75],[ox+5,placed.dunn.z+.75]]}:{},face:{dunn:'W'},wait:'arrive',cam:{x:ox+4,z:oz+4.4}},
      {text:'Every slip in that hat had your name on it. He burned sixty. He wrote one.'},
      {text:'Nobody claps. Then, slowly, everybody does.',act(){SFX.clap&&SFX.clap();}}]
    :[
      {text:'It is your name. Spelled the way Grandpa spelled it, which is not the way you spell it, and is somehow more right.',cam:{x:ox+4,z:oz+3.6}},
      {text:'They clap. Politely, all together, like at a recital.',act(){SFX.clap&&SFX.clap();}},
      {text:'Caitlyn is the only one crying.',face:{mae:'W'},emote:{mae:'…'},cam:{x:ox+5.6,z:oz+4.2}},
      {text:'A hand rests on your shoulder and stays there,',act(){hand=1;},cam:{x:ox+3.2,z:oz+4.4}},
      {text:'and when you turn around, nobody is close enough to have done it.',face:{you:'S'},act(){hand=0;SFX.stinger&&SFX.stinger();}}];
  stage({room:'church',hour:Math.max(S.hour,18.2),player:{x:door.x,z:door.z,dir:'N'},cast,cam:{x:ox+5,z:oz+6},lead:900,
    props:[{x:ox+5,z:oz+2.6,draw(X,Y,t){if(hatUp>0){const k=hatUp,sx0=X+6,sy0=Y-27,hx=X+8+Math.round(k*3),hy=Y-31-Math.round(k*14);   // his raised arm, the hat in his hand
          for(let i=0;i<=8;i++){const u=i/8,ax=Math.round(sx0+(hx-sx0)*u),ay=Math.round(sy0+(hy+4-sy0)*u);ctx2.fillStyle='#120c0a';ctx2.fillRect(ax-1,ay,4,2);ctx2.fillStyle='#2a2430';ctx2.fillRect(ax,ay,2,1);}
          ctx2.fillStyle='#120c0a';ctx2.fillRect(hx-1,hy+2,4,4);ctx2.fillStyle='#e0b898';ctx2.fillRect(hx,hy+3,2,2);stgHat(hx+1,hy-1);}
        if(slip)stgSlip(X-8,Y-26);}},
           {get x(){return P.x;},get z(){return P.z+.01;},draw(X,Y){if(!hand)return;ctx2.fillStyle='#0a0808';ctx2.fillRect(X+3,Y-27,7,3);ctx2.fillRect(X+7,Y-29,4,3);ctx2.fillRect(X+2,Y-26,2,2);}}],
    beats:[
      {hold:.4},
      {text:'The whole valley is in the church. People you have never seen stand along the back wall, from Wickham, from the orchard, from places that aren’t on the map.',go:{you:[ox+5,oz+6.1]},cam:{x:ox+5,z:oz+5},wait:.6},
      {text:'Every pew is full except one space in the front row, exactly the width of you.',go:{you:[[ox+5,oz+4.25],[gap.x+.2,oz+4.25],[gap.x,gap.z]]},face:{you:'N'},cam:{x:ox+4.2,z:oz+4.2},wait:'arrive'},
      {text:'Hale holds up the hat.',update(dt){hatUp=Math.min(1,hatUp+dt*1.4);},cam:{x:ox+5,z:oz+3.2}},
      {text:'It is Grandpa’s straw hat with the faded red band. You left it in the ash. You are sure you left it in the ash.'},
      {text:'Nobody speaks. The children are counting under their breath. Backwards.',face:Object.fromEntries(kids.map(k=>[k,'S'])),cam:{x:ox+5,z:oz+4.8}},
      {text:'Hale reaches in without looking and unfolds a slip. He doesn’t need to read it. He reads it anyway.',act(){slip=true;},update(dt){hatUp=Math.max(.3,hatUp-dt);},cam:{x:ox+5,z:oz+3.2},face:Object.fromEntries(kids.map(k=>[k,'N']))},
      ...lines,
      {who:'hale',text:'Tomorrow night. Down the Mill Road. You’ll know the house. You’ve always known the house.',cam:{x:ox+5,z:oz+3.4},expr:'neutral'},
    ],
    done});}

// the old text scenes now play on stage
{const _ps=playScene;playScene=function(id,title,html,done){
  if(title==='Caitlyn drops by'&&!STG)return stgCaitlynGate(done);
  if(title==='The drawing'&&!STG)return stgDrawing(done);
  return _ps(id,title,html,done);};}
