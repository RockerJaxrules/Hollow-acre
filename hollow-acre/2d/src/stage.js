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
#stgCap.on{display:flex}#stgCap canvas{width:112px;height:112px;image-rendering:pixelated;flex:none;background:#221812;border:2px solid #4a3828}
#stgCap .nm{color:#e8b860;margin-bottom:4px;letter-spacing:.5px}#stgCap .tx{line-height:1.4;min-height:2.8em}
#stgCap.narr{background:rgba(8,8,11,.82);border-color:#34303c}#stgCap.narr canvas,#stgCap.narr .nm{display:none}#stgCap.narr .tx{color:#d6d0c6}
#stgCap .more{position:absolute;right:10px;bottom:3px;font-size:11px;opacity:.5}
@media (max-width:600px){#stgCap{font-size:13px;padding:8px 10px 14px}#stgCap canvas{width:64px;height:64px}}`;
  document.head.appendChild(css);
  for(const id of ['stgBars','stgTap','stgCap']){const e=document.createElement('div');e.id=id;document.body.appendChild(e);}
  $('stgCap').innerHTML='<canvas width="112" height="112"></canvas><div style="flex:1;min-width:0"><div class="nm"></div><div class="tx"></div></div><div class="more"></div>';
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
  for(const [id,k] of Object.entries(b.emote||{}))stgEmote(id,k);
  if(b.cam)st.camT={x:b.cam.x,z:b.cam.z};
  b.act&&b.act(st);
  const cap=$('stgCap');cap.classList.remove('on');}
function stgEmote(id,k,dur){if(!STG)return;STG.em[id]={k,t:dur||1.6,c:k==='!'?'#a02818':k==='♥'?'#b02848':/[0-9]/.test(k)?'#3a2a50':k==='💧'?'#2a5aa0':'#2a1a10'};}
function stgMoving(){return Object.keys(STG.movers).length>0;}
function stgUpdate(dt){const st=STG;if(!st||st.ended||st.i<0){if(st)st.t+=dt;return;}const def=st.def,b=def.beats[st.i];st.t+=dt;st.bt+=dt;
  // walkers
  for(const [id,m] of Object.entries(st.movers)){const a=stgActor(id);if(!a){delete st.movers[id];continue;}const dx=m.x-a.x,dz=m.z-a.z,d=Math.hypot(dx,dz);
    if(d<.06){a.x=m.x;a.z=m.z;if(m.next&&m.next.length){const q=m.next.shift();m.x=q[0];m.z=q[1];continue;}if(m.face)a.dir=m.face;a.clip='idle';if(id==='you')P.spd=0;else st.pin[id]={x:a.x,z:a.z};delete st.movers[id];continue;}
    const s=Math.min(d,m.sp*dt);a.x+=dx/d*s;a.z+=dz/d*s;a.dir=dirOf(dx,dz);a.clip='walk';if(id==='you'){P.spd=m.sp;P.fx=dx/d;P.fz=dz/d;}}
  for(const [id,p] of Object.entries(st.pin)){if(st.movers[id])continue;const n=npcById(id);if(n){n.x=p.x;n.z=p.z;n.vis=true;n.loc='stage';}}
  def.tick&&def.tick(dt,st);
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
    if(def.restore!==false){if(def.room!==undefined)S.room=st.prev.room;S.storm=st.prev.storm;if(def.hour!==undefined&&!def.keepHour)S.hour=st.prev.hour;if(def.room!==undefined&&def.room!==st.prev.room){P.x=st.prev.P.x;P.z=st.prev.P.z;P.dir=st.prev.P.dir;}}
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

// 1. Caitlyn at the farm, the first time (after Grandpa's note).  (r1 judges: "show, don't narrate": no narration card; she leans
// on a real gate post with her phone held up and lowers it when she sees you; the pair framed mid-screen)
function stgGatePost(X,Y){const o='#1a120c';ctx2.fillStyle=o;ctx2.fillRect(X-3,Y-24,7,25);ctx2.fillRect(X+3,Y-19,22,4);ctx2.fillRect(X+3,Y-11,22,4);ctx2.fillRect(X+22,Y-21,5,22);
  ctx2.fillStyle='#7a5a3a';ctx2.fillRect(X-2,Y-23,5,23);ctx2.fillStyle='#9a7650';ctx2.fillRect(X-2,Y-23,2,23);ctx2.fillStyle='#5a4028';ctx2.fillRect(X+2,Y-23,1,23);
  ctx2.fillStyle='#86643e';ctx2.fillRect(X+3,Y-18,20,2);ctx2.fillRect(X+3,Y-10,20,2);ctx2.fillStyle='#a07a52';ctx2.fillRect(X+3,Y-18,20,1);ctx2.fillRect(X+3,Y-10,20,1);
  ctx2.fillStyle='#6a4c30';ctx2.fillRect(X+23,Y-20,3,20);ctx2.fillStyle='#4a3420';ctx2.fillRect(X-3,Y+1,30,1);}
function stgFence(X0,X1,Y,gx,open){const o='#1a120c';   // a split-rail fence across the screen with a framed gate (gx = gate centre, px)
  for(let x=X0;x<=X1;x+=26){if(Math.abs(x-gx)<18)continue;ctx2.fillStyle=o;ctx2.fillRect(x-3,Y-22,6,23);ctx2.fillStyle='#7a5a3a';ctx2.fillRect(x-2,Y-21,4,21);ctx2.fillStyle='#9a7650';ctx2.fillRect(x-2,Y-21,1,21);}
  for(const ry of [Y-17,Y-9]){for(const [a,b] of [[X0,gx-17],[gx+17,X1]]){ctx2.fillStyle=o;ctx2.fillRect(a,ry-1,b-a,4);ctx2.fillStyle='#86643e';ctx2.fillRect(a,ry,b-a,2);ctx2.fillStyle='#a07a52';ctx2.fillRect(a,ry,b-a,1);}}
  for(const px of [gx-17,gx+17]){ctx2.fillStyle=o;ctx2.fillRect(px-3,Y-26,7,27);ctx2.fillStyle='#6a4c30';ctx2.fillRect(px-2,Y-25,5,25);ctx2.fillStyle='#8a6a48';ctx2.fillRect(px-2,Y-25,2,25);}   // the gate posts, taller
  const w=Math.round(30*(1-open*.75)),gx0=gx-14;ctx2.fillStyle=o;ctx2.fillRect(gx0-1,Y-21,w+2,19);ctx2.fillStyle='#8e6a44';ctx2.fillRect(gx0,Y-20,w,3);ctx2.fillRect(gx0,Y-7,w,3);ctx2.fillRect(gx0,Y-20,3,17);ctx2.fillRect(gx0+w-3,Y-20,3,17);
  ctx2.fillStyle='#a88058';ctx2.fillRect(gx0,Y-20,w,1);for(let i=0;i<w-4;i++){const yy=Math.round(Y-17+i*(10/(w-4)));ctx2.fillStyle='#7a5a3a';ctx2.fillRect(gx0+2+i,yy,2,2);}   // the brace
  ctx2.fillStyle='#2a2a2e';ctx2.fillRect(gx0+w-4,Y-14,3,2);}
function stgPost(X,Y){const o='#1a120c';ctx2.fillStyle=o;ctx2.fillRect(X-3,Y-23,7,24);ctx2.fillStyle='#7a5a3a';ctx2.fillRect(X-2,Y-22,5,22);ctx2.fillStyle='#9a7650';ctx2.fillRect(X-2,Y-22,2,22);ctx2.fillStyle='#5a4028';ctx2.fillRect(X+2,Y-22,1,22);}
function stgCaitlynGate(done){const d=doorPos;MAEV.on=false;
  const gate={x:d.x-2.7,z:d.z+3.05},mae={x:gate.x-.55,z:gate.z+.05},you0={x:d.x+.05,z:d.z+1.25},youM={x:gate.x+.62,z:gate.z+.05},in1={x:gate.x+.05,z:gate.z+.4};
  let phone=1,open=0;const CAM={x:gate.x+.9,z:gate.z-.45};
  const props=[];const zs=[];for(let z=gate.z-2.6;z<=gate.z+2.61;z+=.62){if(Math.abs(z-gate.z)<.45)continue;zs.push(z);}
  zs.forEach((z,i)=>props.push({x:gate.x,z,draw(X,Y){stgPost(X,Y);const nz=zs[i+1];if(nz===undefined||nz-z>.7)return;const Y2=sz(nz);   // rails to the next post
      for(const h of [17,9]){ctx2.fillStyle='#1a120c';ctx2.fillRect(X-2,Y-h-1,5,Y2-Y+2);ctx2.fillStyle='#86643e';ctx2.fillRect(X-1,Y-h,3,Y2-Y);ctx2.fillStyle='#a07a52';ctx2.fillRect(X-1,Y-h,1,Y2-Y);}}}));
  props.push({x:gate.x,z:gate.z-.4,draw(X,Y){const Y2=sz(gate.z+.4);const o='#1a120c';   // the gate: a framed panel between the two posts, swinging open into the yard
      if(open<.5){for(const h of [18,11,4]){ctx2.fillStyle=o;ctx2.fillRect(X-2,Y-h-1,5,Y2-Y+2);ctx2.fillStyle='#8e6a44';ctx2.fillRect(X-1,Y-h,3,Y2-Y);}}
      else{const L=Math.round(26*(open-.5)*2);for(const h of [18,11,4]){ctx2.fillStyle=o;ctx2.fillRect(X,Y-h-1,L+2,4);ctx2.fillStyle='#8e6a44';ctx2.fillRect(X+1,Y-h,L,2);}}}});
  props.push({get x(){return npcById('mae').x;},get z(){return npcById('mae').z+.02;},draw(X,Y,t){if(phone<=0)return;const ry=Math.round(-40+(1-phone)*18);   // the phone held up, lit, no bars
      ctx2.fillStyle='rgba(150,210,240,.2)';ctx2.fillRect(X+1,Y+ry-3,13,17);ctx2.fillStyle='#120c08';ctx2.fillRect(X+3,Y+ry,9,12);ctx2.fillStyle=(Math.sin(t*2.4)>-.3)?'#b8e8fa':'#88c4e0';ctx2.fillRect(X+4,Y+ry+1,7,9);
      ctx2.fillStyle='#3a5a6a';ctx2.fillRect(X+5,Y+ry+3,1,1);ctx2.fillRect(X+7,Y+ry+3,1,1);ctx2.fillRect(X+9,Y+ry+3,1,1);ctx2.fillStyle='#e8c0a0';ctx2.fillRect(X+3,Y+ry+11,5,2);}});
  stage({hour:Math.max(9.5,Math.min(S.hour,16)),player:{x:you0.x,z:you0.z,dir:'N'},cast:{mae:{x:mae.x,z:mae.z,dir:'E'}},cam:CAM,props,
    beats:[
      {hold:1.0,face:{you:'N'},act(){stgEmote('mae','…',2.2);}},
      {hold:.9,face:{you:'W'},emote:{you:'?'}},
      {hold:.2,go:{you:[[you0.x,youM.z],[youM.x,youM.z]]},face:{you:'W'},wait:'arrive'},
      {who:'mae',text:'Oh. Hi.',expr:'surprised',emote:{mae:'!'},update(dt){phone=Math.max(0,phone-dt*1.2);}},
      {who:'mae',text:'You must be Elias’s grandkid. You have his walk.',act(){phone=0;},expr:'happy'},
      {who:'mae',text:'I’m Caitlyn. I run the store in town. Coyle’s.',expr:'happy'},
      {who:'mae',text:'He asked me to look in on you, if you ever came. He said you wouldn’t. I said you would.',expr:'sad'},
      {who:'mae',text:'I win.',expr:'smug',wait:.5},
      {who:'mae',text:'Let me show you how this place works. Then you’ll have a chance, at least.',expr:'think',update(dt){open=Math.min(1,open+dt*1.6);},
        go:{mae:[[gate.x-.3,gate.z+.05],[in1.x,in1.z]],you:[youM.x+.35,youM.z-.1]},face:{mae:'E',you:'W'},speed:{mae:.9,you:.7},wait:'arrive'},
    ],
    after(){P.x=youM.x+.35;P.z=youM.z-.1;P.dir='W';},
    done(){maeCome(14,true);done&&done();}});}

// 2. The drawing, in the church.  (r1 judges: "the beats are told, not shown": the empty seat is lit and you sit in it; the
// straw hat is big and pale above Hale's head; the children turn round counting down; the church claps; Caitlyn cries; a hand
// on your shoulder; one steady framing, candlelight on the altar; only the lines that cannot be acted stay as words)
function stgHat2(X,Y){   // Grandpa's straw hat in three-quarter view: an oval brim, a domed crown, the faded red band
  const el=(cx,cy,rx,ry,c)=>{ctx2.fillStyle=c;for(let y=-ry;y<=ry;y++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry))));ctx2.fillRect(cx-w,cy+y,w*2,1);}};
  el(X,Y+3,15,5,'#1a120c');el(X,Y+3,14,4,'#d8bc78');el(X,Y+2,13,3,'#ecd494');el(X-3,Y+1,6,1,'#fff0c0');   // the brim
  el(X,Y-4,9,8,'#1a120c');el(X,Y-4,8,7,'#e4c886');el(X-2,Y-6,4,4,'#f8e4a8');                            // the crown
  ctx2.fillStyle='#1a120c';ctx2.fillRect(X-9,Y-1,18,4);ctx2.fillStyle='#a83a2a';ctx2.fillRect(X-8,Y,16,2);ctx2.fillStyle='#c85a40';ctx2.fillRect(X-8,Y,6,1);}
function stgDrawing(done){const R=ROOMS.church,ox=R.ox,oz=R.oz;const at=(x,z)=>({x:ox+x,z:oz+z});
  const dunn=typeof stHas==='function'&&stHas('dunnslip'),dn=stgName('dunn');
  const pews=[[2.4,3.6],[7.6,3.6],[2.4,5.0],[7.6,5.0],[2.4,6.4],[7.6,6.4]],offs=[-1.35,-.45,.45,1.35];
  const want=npcs.map(n=>n.def.id).filter(id=>id!=='hale');
  const order=['silas','agnes','june','hollis','otto','dunn','cora','wes','ida','pip','nan','finn','gideon','nell','ezra','orla','bram','abel','della','maud','corwin','tess','hob','tobias']
    .filter(id=>want.includes(id));
  const cast={hale:{...at(5,2.5),dir:'S'}};const seats=[];
  for(const [pi,[px,pz]] of pews.entries())for(const [k,o] of offs.entries()){if((pi===0&&k===2)||(pi===2&&(k===1||k===2)))continue;seats.push({x:ox+px+o,z:oz+pz+.05,pi});}   // yours, and the two right behind it, empty
  const placed={};const front=seats.find(s=>s.pi===1&&Math.abs(s.x-(ox+7.6-1.35))<.01);const rest=seats.filter(s=>s!==front);
  const list=['mae',...order.filter(i=>i!=='mae')];const sl=[front,...rest];
  list.forEach((id,i)=>{const s=sl[i];if(!s)return;placed[id]=s;cast[id]={x:s.x,z:s.z,dir:'N',seat:{x:s.x,z:s.z,lift:2,face:'N'}};});
  const standers=want.filter(id=>!cast[id]);standers.slice(0,10).forEach((id,i)=>{const p=[[.75,7.35],[9.25,7.35],[1.6,7.45],[8.4,7.45],[9.3,4.3],[3.4,7.5],[6.6,7.5],[9.35,5.7],[2.5,7.55],[7.5,7.55]][i];cast[id]={...at(p[0],p[1]),dir:p[0]<5?'E':'W'};});
  const kids=['pip','nan','finn'].filter(id=>placed[id]);const seated=Object.keys(placed);
  const gap=at(2.4+.45,3.65),door=at(5,7.55);let hatUp=0,slip=0,hand=0,clap=0,seatLit=1;
  const CAM={x:ox+5,z:oz+3.75};
  const lines=dunn?[
      {who:'hale',text:`${dn}.`,act(){slip=2;}},
      {hold:.4,go:placed.dunn?{dunn:[[placed.dunn.x,placed.dunn.z+.75],[ox+5,placed.dunn.z+.75]]}:{},face:{dunn:'W'},emote:{dunn:'…'}},
      {who:'dunn',text:'Every slip in that hat had their name on it. I burned sixty. I wrote one.',expr:'sad',wait:'arrive'},
      {hold:2.2,act(){clap=1;SFX.clap&&SFX.clap();}}]
    :[
      {who:'hale',text:'Marsh.',act(){slip=2;}},
      {text:'Your name, spelled the way Grandpa spelled it. Not the way you spell it. Somehow more right.',wait:.3},
      {hold:2.4,act(){clap=1;SFX.clap&&SFX.clap();}},
      {hold:1.6,act(){clap=0;},face:{mae:'W'},emote:{mae:'💧'}},
      {hold:2.6,update(dt){hand=Math.min(1,(hand||.001)+dt*1.2);if(hand>=1&&!this._b){this._b=1;stgEmote('you','!',1.8);SFX.stinger&&SFX.stinger();}},act(){P.clip='sit';}},
      {hold:1.6,act(){hand=0;P.clip='idle';P.dir='S';}}];
  stage({room:'church',hour:Math.max(S.hour,18.2),keepHour:true,player:{x:door.x,z:door.z,dir:'N'},cast,cam:{x:CAM.x,z:CAM.z+1.6},lead:900,
    light(L){glowAt(sx(ox+5),sz(oz+2.2)-18,120,[255,190,110],.32);glowAt(sx(ox+2.5),sz(oz+1.1)-30,46,[255,200,120],.35);glowAt(sx(ox+7.5),sz(oz+1.1)-30,46,[255,200,120],.35);},
    props:[
      {x:gap.x,z:gap.z-.04,draw(X,Y,t){if(!seatLit)return;ctx2.fillStyle=`rgba(255,226,170,${.35+.15*Math.sin(t*2)})`;ctx2.fillRect(X-7,Y-9,14,5);}},   // the empty seat, lit
      {x:ox+5,z:oz+2.55,draw(X,Y,t){if(hatUp>0){const k=hatUp,sx0=X+6,sy0=Y-27,hx=X+14+Math.round(k*8),hy=Y-34-Math.round(k*14);
          for(let i=0;i<=8;i++){const u=i/8,ax=Math.round(sx0+(hx-sx0)*u),ay=Math.round(sy0+(hy+6-sy0)*u);ctx2.fillStyle='#120c0a';ctx2.fillRect(ax-1,ay,4,2);ctx2.fillStyle='#2a2430';ctx2.fillRect(ax,ay,2,1);}
          stgHat2(hx+2,hy-6);ctx2.fillStyle='#120c0a';ctx2.fillRect(hx-1,hy+4,4,4);ctx2.fillStyle='#e0b898';ctx2.fillRect(hx,hy+5,2,2);}
        if(slip){ctx2.fillStyle='#120c08';ctx2.fillRect(X-13,Y-31,10,8);ctx2.fillStyle='#f4ecd8';ctx2.fillRect(X-12,Y-30,8,6);ctx2.fillStyle='#5a4a3a';ctx2.fillRect(X-11,Y-28,6,1);if(slip>1)ctx2.fillRect(X-11,Y-26,4,1);}}},
      {x:0,z:1e5,draw(X,Y,t){for(const id of seated){const n=npcById(id);if(!n||!n._seat)continue;const ph=Math.floor(t*5)%2;n._seat.lift=clap&&ph?5:2;   // the clapping: all together, like at a recital
          if(!clap)continue;const nx=sx(n.x),ny=sz(n.z)-20;ctx2.fillStyle='#120c08';const g=ph?1:4;ctx2.fillRect(nx-6+g,ny-1,4,4);ctx2.fillRect(nx+3-g,ny-1,4,4);ctx2.fillStyle='#e8c8a8';ctx2.fillRect(nx-5+g,ny,2,2);ctx2.fillRect(nx+4-g,ny,2,2);
          if(ph){ctx2.fillStyle='#fff4dc';ctx2.fillRect(nx-1,ny-4,2,2);}}}},
      {get x(){return P.x;},get z(){return P.z+.01;},draw(X,Y){if(!hand)return;const k=Math.min(1,hand);ctx2.globalAlpha=k;   // a hand on your shoulder from behind: long pale fingers
          const hx=X+3,hy=Y-27,o='#0a0808',sk='#d6d0c2',sh='#a49c8c';
          ctx2.fillStyle=o;ctx2.fillRect(hx-1,hy-1,12,5);ctx2.fillRect(hx-1,hy+3,3,6);ctx2.fillRect(hx+2,hy+3,3,7);ctx2.fillRect(hx+5,hy+3,3,7);ctx2.fillRect(hx+8,hy+3,3,5);ctx2.fillRect(hx+9,hy+4,4,10);
          ctx2.fillStyle=sk;ctx2.fillRect(hx,hy,10,3);ctx2.fillRect(hx,hy+3,1,5);ctx2.fillRect(hx+3,hy+3,1,6);ctx2.fillRect(hx+6,hy+3,1,6);ctx2.fillRect(hx+9,hy+3,1,4);ctx2.fillRect(hx+10,hy+5,2,8);
          ctx2.fillStyle=sh;ctx2.fillRect(hx,hy+2,10,1);ctx2.fillRect(hx+11,hy+5,1,8);ctx2.globalAlpha=1;}}],
    beats:[
      {hold:.6},
      {hold:2.6,go:{you:[ox+5,oz+5.7]},cam:{x:CAM.x,z:CAM.z+.8}},
      {hold:.2,go:{you:[[ox+5,oz+4.25],[gap.x+.2,oz+4.25],[gap.x,gap.z]]},face:{you:'N'},cam:CAM,wait:'arrive'},
      {hold:.9,act(){seatLit=0;P.clip='sit';P.dir='N';}},
      {hold:1.6,update(dt){hatUp=Math.min(1,hatUp+dt*1.1);}},
      {text:'Grandpa’s straw hat, the faded red band. You left it in the ash. You are sure you left it in the ash.',who:'you',expr:'scared'},
      {hold:.4,face:Object.fromEntries(kids.map(k=>[k,'S'])),act(){kids.forEach((k,i)=>{setTimeout(()=>stgEmote(k,'3',.9),i*150);setTimeout(()=>stgEmote(k,'2',.9),1000+i*150);setTimeout(()=>stgEmote(k,'1',.9),2000+i*150);});}},
      {hold:3.0},
      {hold:1.2,face:Object.fromEntries(kids.map(k=>[k,'N'])),update(dt){hatUp=Math.max(.35,hatUp-dt);},act(){slip=1;}},
      ...lines,
      {who:'hale',text:'Tomorrow night. Down the Mill Road. You’ll know the house. You’ve always known the house.',cam:{x:CAM.x,z:CAM.z-.3},expr:'neutral'},
    ],
    done});}


// 3. every other story scene: it plays where you are. The person comes and stands beside you (walking in from off-screen if
// they are not near), the camera frames the two of you, the scene's title shows for a moment, and the text is split into what
// is said (their portrait, the face read from the words, a bubble over their head) and the little that is narrated.
(function(){const e=document.createElement('div');e.id='stgTitle';document.body.appendChild(e);
  const c=document.createElement('style');c.textContent='#stgTitle{position:fixed;left:50%;top:calc(8.5vh + 10px);transform:translateX(-50%);z-index:61;pointer-events:none;color:#e8b860;font-size:15px;letter-spacing:2px;opacity:0;transition:opacity .6s;text-shadow:0 2px 0 #000;background:rgba(10,8,8,.6);padding:4px 14px;border:1px solid #4a3828}#stgTitle.on{opacity:1}';document.head.appendChild(c);})();
function stgTitle(t){const e=$('stgTitle');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),2600);}
const STG_BUBBLE={love:'♥',surprised:'!',scared:'!',sad:'…',cry:'💧',laugh:'♪',think:'?',angry:'#',wrong:'…'};
function stgParse(html,id){const beats=[];const paras=html.split(/<br>\s*<br>/).map(s=>s.trim()).filter(Boolean);
  const clean=t=>t.replace(/<(?!\/?(b|i|em)\b)[^>]+>/g,'').replace(/\s+/g,' ').trim();
  const tag=t=>/^[^.]{0,28}\b(says|said|asks|asked|whispers|adds|answers|murmurs|replies)\b[^.]{0,20}[.,]?$/i.test(t)||/^[,.;:—–-]+$/.test(t);
  for(const p of paras){const re=/<q>([\s\S]*?)<\/q>/g;let last=0,m;
    while((m=re.exec(p))){const pre=clean(p.slice(last,m.index));if(pre.length>2&&!tag(pre))beats.push({text:pre});beats.push({who:id,text:clean(m[1])});last=re.lastIndex;}
    const post=clean(p.slice(last));if(post.length>2&&!tag(post))beats.push({text:post});}
  // merge a run of one speaker's short lines; give each spoken line a bubble from its feeling
  for(const b of beats)if(b.who&&typeof emotionOf==='function'){const ex=emotionOf(b.who,b.text);b.expr=ex;const k=STG_BUBBLE[ex];if(k)b.emote={[b.who]:k};}
  return beats;}
function stgGeneric(id,title,html,done){const n=npcById(id);const beats=stgParse(html,id);
  if(!beats.length){done&&done();return;}
  const room=S.room||null;const px=P.x,pz=P.z;const free=(x,z)=>{try{return typeof mFree!=='function'||mFree(x,z);}catch(e){return true;}};
  let side=null;for(const [dx,dz] of [[1.35,.1],[-1.35,.1],[0,1.25],[1.1,1.0],[-1.1,1.0],[0,-1.25]]){if(free(px+dx,pz+dz)){side=[dx,dz];break;}}if(!side)side=[1.2,.2];
  const mark={x:px+side[0],z:pz+side[1]};const cast={};let walk=null;const vEnc=id==='mae'&&MAEV.on;if(vEnc)MAEV.on=false;
  if(n){const near=n.vis&&((n.room||null)===room)&&Math.hypot(n.x-px,n.z-pz)<7;
    const st=near?{x:n.x,z:n.z}:{x:px+Math.sign(side[0]||1)*5.2,z:pz+side[1]};cast[id]={x:st.x,z:st.z,dir:dirOf(mark.x-st.x,mark.z-st.z)};
    if(Math.hypot(st.x-mark.x,st.z-mark.z)>.2)walk=[mark.x,mark.z];}
  const faceYou=dirOf(px-mark.x,pz-mark.z),faceThem=dirOf(mark.x-px,mark.z-pz);
  const cam={x:(px+mark.x)/2,z:(pz+mark.z)/2+.9};
  const first={hold:.25,act(){stgTitle((n?n.def.name+' — ':'')+title);}};if(walk){first.go={[id]:walk};first.face={[id]:faceYou,you:faceThem};first.wait='arrive';first.hold=0;}
  else first.face={[id]:faceYou,you:faceThem};
  stage({player:{x:px,z:pz,dir:faceThem},cast,cam,lead:300,beats:[first,...beats],keepCast:true,
    done(){if(vEnc){MAEV.on=true;MAEV.x=mark.x;MAEV.z=mark.z;}done&&done();}});}


// 4. the Lantern Dance, in the square at night: lanterns strung overhead, the town in a ring, the band on the north side, you and
// your partner turning round each other; the dance slows to a stop for their last words
function stgLanterns(cx,cy,t){const pts=[];for(let i=0;i<=10;i++){const u=i/10,x=cx-150+u*300,y=cy-118+Math.sin(u*Math.PI)*22;pts.push([x,y]);}
  ctx2.strokeStyle='#1a1410';ctx2.lineWidth=1;ctx2.beginPath();pts.forEach((p,i)=>i?ctx2.lineTo(p[0],p[1]):ctx2.moveTo(p[0],p[1]));ctx2.stroke();
  for(let i=1;i<10;i++){const [x,y]=pts[i],sw=Math.round(Math.sin(t*1.3+i)*1.2);ctx2.fillStyle='#1a1410';ctx2.fillRect(x-3+sw,y+1,7,9);ctx2.fillStyle=i%3===0?'#f0b048':i%3===1?'#e88838':'#f4d070';ctx2.fillRect(x-2+sw,y+2,5,7);ctx2.fillStyle='#fff0c0';ctx2.fillRect(x-1+sw,y+3,2,3);}}
function stgDance(id,html,done){const n=npcById(id);if(!n){done&&done();return;}const C={x:F_SQ.x,z:F_SQ.z};const beats=stgParse(html,id);
  const cast={[id]:{x:C.x+.55,z:C.z,dir:'W'}};const ring=npcs.map(m=>m.def.id).filter(k=>k!==id&&k!=='hale').slice(0,16);
  ring.forEach((k,i)=>{const a=Math.PI*(1.15+1.7*i/Math.max(1,ring.length-1)),r=3.3+(i%2)*.5;cast[k]={x:C.x+Math.cos(a)*r*1.25,z:C.z+Math.sin(a)*r*.7,dir:dirOf(-Math.cos(a),-Math.sin(a))};});
  const band=['otto','ida','silas'].filter(k=>cast[k]);band.forEach((k,i)=>{cast[k]={x:C.x-1+i,z:C.z-2.6,dir:'S'};});
  let ang=0,spd=1.25;const last=beats.length;let k=0;
  stage({hour:Math.max(S.hour,18.6),player:{x:C.x-.55,z:C.z,dir:'E'},cast,cam:{x:C.x,z:C.z+.7},keepCast:false,
    light(L){const X=sx(C.x),Y=sz(C.z);for(let i=1;i<10;i++){const u=i/10;glowAt(X-150+u*300,Y-112+Math.sin(u*Math.PI)*22,40,[255,190,100],.42);}glowAt(X,Y-10,120,[255,170,90],.22);},
    props:[{x:C.x,z:1e5,draw(X,Y,t){stgLanterns(sx(C.x),sz(C.z),t);}}],
    tick(dt,st){const b=st.def.beats[st.i];spd=(st.i>=st.def.beats.length-1)?Math.max(0,spd-dt*1.2):1.25;ang+=dt*spd;
      const r=.55,px=C.x+Math.cos(ang)*r,pz=C.z+Math.sin(ang)*r*.55,qx=C.x-Math.cos(ang)*r,qz=C.z-Math.sin(ang)*r*.55;
      P.x=px;P.z=pz;n.x=qx;n.z=qz;st.pin[id]={x:qx,z:qz};P.dir=dirOf(qx-px,qz-pz);n.dir=dirOf(px-qx,pz-qz);const mv=spd>.05;P.clip=mv?'walk':'idle';n.clip=mv?'walk':'idle';P.spd=mv?1:0;
      if(Math.random()<dt*.6){const bk=band[(Math.random()*band.length)|0];if(bk)stgEmote(bk,'♪',1.2);}},
    beats:[{hold:2.2,act(){stgTitle(n.def.name+' — Lantern Dance');}},...beats],
    done});}

// 5. the wedding, in the square at ten: the town in two blocks with an aisle, Dunn at the back with his hat in his hands, Hale
// at the front; you and them walk up together; he reads your names; the town cheers; then everyone dances
function stgWedding(id,html,done){const n=npcById(id);if(!n){done&&done();return;}const C={x:F_SQ.x,z:F_SQ.z},nm=n.def.name;
  const cast={[id]:{x:C.x+.4,z:C.z+3.4,dir:'N'},hale:{x:C.x,z:C.z-2.2,dir:'S'}};
  const crowd=npcs.map(m=>m.def.id).filter(k=>k!==id&&k!=='hale'&&k!=='dunn');
  crowd.forEach((k,i)=>{const side=i%2?1:-1,row=Math.floor(i/2)%4,col=Math.floor(i/8);cast[k]={x:C.x+side*(1.3+col*.9+(row%2)*.2),z:C.z-1+row*.9,dir:side>0?'W':'E'};});
  if(npcById('dunn'))cast.dunn={x:C.x+2.4,z:C.z+3.9,dir:'N'};
  let cheer=0,ang=0,dance=0;
  stage({hour:10,player:{x:C.x-.4,z:C.z+3.4,dir:'N'},cast,cam:{x:C.x,z:C.z+1.2},keepHour:true,
    props:[{x:C.x,z:C.z-2.6,draw(X,Y,t){const o='#1a120c';ctx2.fillStyle=o;ctx2.fillRect(X-26,Y-46,6,46);ctx2.fillRect(X+20,Y-46,6,46);ctx2.fillRect(X-26,Y-50,52,6);   // an arch of autumn branches
          ctx2.fillStyle='#6a4a2a';ctx2.fillRect(X-25,Y-45,4,45);ctx2.fillRect(X+21,Y-45,4,45);ctx2.fillRect(X-25,Y-49,50,4);
          for(let i=0;i<14;i++){const a=i/13,lx=X-26+a*52,ly=Y-52+Math.sin(a*Math.PI)*-4;ctx2.fillStyle=['#c8402a','#e0a030','#a83020','#f0c050'][i%4];ctx2.fillRect(lx-2,ly-2,5,4);}}},
      {x:0,z:1e5,draw(X,Y,t){if(!cheer)return;for(const k of crowd){const m=npcById(k);if(!m)continue;const ph=(Math.floor(t*6)+k.length)%2;if(!ph)continue;const nx=sx(m.x),ny=sz(m.z)-34;
          ctx2.fillStyle='#120c08';ctx2.fillRect(nx-6,ny,3,5);ctx2.fillRect(nx+4,ny,3,5);ctx2.fillStyle='#e8c8a8';ctx2.fillRect(nx-5,ny,1,3);ctx2.fillRect(nx+5,ny,1,3);}}}],   // arms up, cheering
    tick(dt,st){if(!dance)return;ang+=dt*1.3;const r=.55,px=C.x+Math.cos(ang)*r,pz=C.z+.6+Math.sin(ang)*r*.55,qx=C.x-Math.cos(ang)*r,qz=C.z+.6-Math.sin(ang)*r*.55;
      P.x=px;P.z=pz;n.x=qx;n.z=qz;st.pin[id]={x:qx,z:qz};P.dir=dirOf(qx-px,qz-pz);n.dir=dirOf(px-qx,pz-qz);P.clip='walk';n.clip='walk';P.spd=1;},
    beats:[
      {hold:1.4,act(){stgTitle('The wedding');},emote:{dunn:'…'}},
      {hold:.2,go:{you:[C.x-.4,C.z-1.4],[id]:[C.x+.4,C.z-1.4]},face:{you:'N',[id]:'N'},speed:{you:.7,[id]:.7},wait:'arrive'},
      {who:'hale',text:'Dearly beloved. We are gathered here, in the square, in the daylight, for once, for something good.',expr:'happy'},
      {who:'hale',text:`Marsh. And ${nm}.`,face:{you:'E',[id]:'W'}},
      {hold:2.4,act(){cheer=1;SFX.clap&&SFX.clap();crowd.slice(0,10).forEach((k,i)=>setTimeout(()=>stgEmote(k,i%3?'♥':'!',1.4),i*120));},emote:{[id]:'💧'}},
      {who:id,text:'Look at them. Look at all of them. Not one of them is afraid.',expr:'cry'},
      {hold:3.2,act(){dance=1;cheer=0;}},
      {text:'Afterwards they dance on the square till the lanterns burn down, and for one whole afternoon the valley forgets to be afraid.'},
    ],
    done});}

// the old text scenes now play on stage
{const _ps=playScene;playScene=function(id,title,html,done){
  if(title==='Caitlyn drops by'&&!STG)return stgCaitlynGate(done);
  if(title==='The drawing'&&!STG)return stgDrawing(done);
  if(title==='Lantern Dance'&&!STG&&S.mode==='play')return stgDance(id,html,done);
  if(title==='The wedding'&&!STG&&S.mode==='play')return stgWedding(id,html,done);
  if(!STG&&S.mode==='play'&&!S.paused&&!title.endsWith(' '))return stgGeneric(id,title,html,done);   // (a trailing space keeps the old card: used for A/B captures)
  return _ps(id,title,html,done);};}
