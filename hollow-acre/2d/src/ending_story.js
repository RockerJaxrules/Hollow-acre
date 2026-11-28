/* ================= t346: the new ending: the letter, the goodbye, the drive out =================
   After the finale, a letter comes: your grandmother has gone missing on the mountain. If you married, your spouse
   brings it up from the post office (June, the postmistress, carries it herself) and you say goodbye in the yard by
   the cabin; then you walk to the car and drive west out of Marrow Hollow. Route 9 lets you go this time. The screen
   fades to black on the road and the drive up the mountain follows (ending_drive.js), then Part 2.
   endingStory({spouse, done, log}): spouse is a townsperson's id, null (alone: the letter is in the mailbox), or left
   out (whoever you married in this save, S.rom[id].married); done() is called on the black after the drive out; log(kind, data) (optional) hears each moment as it happens
   (the cutscene video uses it to put the sound in time). */
const ENDING_LETTER=nm=>`<h3>A letter from the mountains</h3>
<p>${nm?nm+',':'To the family,'}</p>
<p>I am writing because you are the only family she put down.</p>
<p>Your grandmother went up to the old workings nine days ago, alone, and she has not come back down. We searched until the
weather turned on us. The pass is closing.</p>
<p>Her papers say the company goes to you if anything happens to her. Something has.</p>
<p>If you are coming, come now, before the road shuts for the winter.</p>
<p style="text-align:right">R. Kessler, foreman</p>`;

// the farm, as the scenes use it: the cabin's front yard, the lane down to the mailbox, Route 9 west. The car: fixed,
// running again now, brought up into the yard by the cabin to load (it died by the HOLLOW ACRE sign after the road
// looped; parked there it sits behind the windpump, which reads as the oak it crashed into)
const ENDING_AT={you:{x:.2,z:-6.0},mailbox:{x:-12.0,z:-2.6},meet:{x:-1.0,z:-5.75},hug:{x:-.45,z:-5.85},car:{x:-4.6,z:-3.2},
  door:{x:-4.2,z:-2.3},watch:{x:-1.4,z:-4.7},lane:-7.1};
// what your spouse says: June's own (she runs the post office and reads every letter in the valley; she told you, when
// you asked her, that nobody ever wrote her one), anyone else's plain
const ENDING_SPOUSE={
  june:{bring:'brought it up from the post office herself',lines:['It came registered. From up north, in the mountains. I didn’t open it.','I wanted to.'],
    keep:'I’ll keep the farm. The crows won’t get a single pumpkin.',ask:'Write to me. Every week. You promised me letters.'},
  _:{bring:'brought it up from the mailbox',lines:['This came for you. The postmark says the mountains.'],
    keep:'I’ll keep the farm going. The crows won’t get a single pumpkin.',ask:'Come back to me. Whatever you find up there.'}};
function endingSpouse(){const r=S.rom||{};return Object.keys(r).find(id=>r[id]&&r[id].married&&npcById(id))||null;}

function endingStory(o){o=o||{};const log=o.log||(()=>{});const want=o.spouse===undefined?endingSpouse():o.spouse;
  const sp=want&&npcById(want)?want:null;const L=ENDING_SPOUSE[sp]||ENDING_SPOUSE._;
  const nm=(typeof NAME==='function'&&NAME())||'';const spName=sp?String(stgName(sp)).split(' ')[0]:'';
  if(sp){const n=npcById(sp);n.room=null;}
  // the car, fixed, in the yard (no wreck at the oak: it was driven out of there long ago)
  if(typeof BEATEN!=='undefined'){S.carFixed=true;S.looped=true;
    CAR_SPOTS.sign={x:ENDING_AT.car.x,z:ENDING_AT.car.z};BEATEN.at=null;   // its resting place is the yard now (carShow keeps it there)
    if(typeof carShow==='function')carShow();}
  for(const w of OBJ)if(w.kind==='wreck')w.hide=true;
  const letter=(st)=>{log('letter');openNote(ENDING_LETTER(nm),'Fold it up',()=>{log('letterClose');st.autoT=0;if(STG===st)stgBeat(st.i+1);});};
  const lines=sp?[
    {text:`The week the first frost came, a letter came for you. ${spName} ${L.bring}.`,
      go:{[sp]:[[-8.5,-5.7],[ENDING_AT.meet.x,ENDING_AT.meet.z]]},face:{you:'W'},wait:.8},
    ...L.lines.map((t,i)=>Object.assign({who:sp,text:t},i===0?{face:{[sp]:'E',you:'W'},wait:'arrive'}:{})),
    {act(st){letter(st);},hold:9999},
    {who:'you',text:'It’s my grandmother. She’s gone missing, up on the mountain.'},
    {who:sp,text:'Then you’re going.',emote:{[sp]:'💧'}},
    {who:'you',text:'I don’t know how long I’ll be.'},
    {who:sp,text:L.keep},
    {who:sp,text:L.ask,emote:{[sp]:'♥'}},
    {text:`${spName} holds on to you a long time.`,go:{you:[ENDING_AT.hug.x,ENDING_AT.hug.z]},face:{you:'W'}},
    {who:sp,text:'Go on. Before I don’t let you.'},
    {go:{you:[[-1.4,-2.4],[ENDING_AT.door.x,ENDING_AT.door.z]]},face:{you:'N'},wait:'arrive',hold:.3,
      act(){log('walk');}}]
  :[{text:'The week the first frost came, there was a letter in the mailbox. The postmark said the mountains.',go:{you:[ENDING_AT.mailbox.x+.8,ENDING_AT.mailbox.z]},face:{you:'W'},wait:.6},
    {act(st){letter(st);},hold:9999},
    {text:'You pack one bag. You leave the farm the way you found it, only better.'},
    {go:{you:[[-1.4,-2.4],[ENDING_AT.door.x,ENDING_AT.door.z]]},face:{you:'N'},wait:'arrive',hold:.3,act(){log('walk');}}];
  const cast=sp?{[sp]:{x:ENDING_AT.mailbox.x,z:ENDING_AT.mailbox.z,dir:'E'}}:{};
  // log each line as it opens (the video's sound puts the page turn and the typing in time)
  const beats=lines.map(b=>Object.assign({},b,{act:(st)=>{if(b.text)log('line',{who:b.who||null,n:b.text.length});b.act&&b.act(st);}}));
  stage({hour:18.3,storm:false,room:null,keepCast:true,keepHour:true,endMode:'cine',
    player:{x:ENDING_AT.you.x,z:ENDING_AT.you.z,dir:'S'},cast,cam:{x:-3.6,z:-5.3},beats,
    done(){endingDriveOut(sp,o.done,log);}});
}

// the drive out: the car pulls out of the yard onto Route 9 and heads west; the one you married stands in the yard and
// watches it go; the camera lets the farm fall behind, then rides along; the road doesn't loop back now
function endingDriveOut(sp,done,log){S.mode='cine';const n=sp?npcById(sp):null;
  if(n){n.x=ENDING_AT.watch.x;n.z=ENDING_AT.watch.z;n.dir='W';n.vis=true;n.loc='stage';n.room=null;n.clip='idle';}
  for(const m of npcs)if(m!==n&&m.vis&&!m.room&&Math.abs(m.z+6)<4&&m.x>-120&&m.x<0)m.vis=false;
  if(typeof BEATEN!=='undefined'&&BEATEN.o)BEATEN.o.hide=true;
  const st={t:0,x:ENDING_AT.car.x,z:ENDING_AT.car.z,z0:ENDING_AT.car.z,bob:0,lit:0,end:0};
  SFX.engineStart();SFX.engine(true);log('engine');fade(0);$('stgBars').classList.add('on');
  cine={hidePlayer:true,escape:true,cam:{x:-6.2,z:-5.0},
    drawables(D){D.push({z:st.z+.25,mind:1,draw(){const X=sx(st.x),Y=sz(st.z)+Math.round(st.bob);ctx2.fillStyle='rgba(10,8,14,.35)';ctx2.beginPath();ctx2.ellipse(X,Y+2,58,9,0,0,Math.PI*2);ctx2.fill();
      drawSpr('car_beaten',X,Y,null,null,0,{flip:true});}});},
    light(L){const X=sx(st.x),Y=sz(st.z)-12;if(L>.2)for(const s2 of [-.5,.5]){const hx=X-2.1*PPM,hy=Y+s2*PPM*.8;coneAt(hx,hy,Math.PI,.28,12*PPM,[255,238,196],.8*L);glowAt(hx,hy,9,[255,240,210],.85*L);}
      glowAt(X+2.2*PPM,Y,36,[255,26,16],.5*Math.max(.3,L));},
    update(dt){st.t+=dt;const go=Math.max(0,st.t-1.4),acc=Math.min(1,go/2.2);st.x-=dt*9*acc*acc;   // idles a moment, then pulls away
      {const k=Math.min(1,Math.max(0,(ENDING_AT.car.x-st.x)/8));st.z=st.z0+(ENDING_AT.lane-st.z0)*k*k*(3-2*k);}   // out of the yard and onto the road over 8 mst.bob=Math.sin(st.t*22)*.5*Math.min(1,go*2);
      if(n){n.dir='W';n.t=(n.t||0)+dt;}
      // the camera holds on the farm gate while the car pulls away, then follows it down the road
      const follow=st.t>5.2;cine.cam.x=lerp(cine.cam.x,follow?st.x+2:-6.2,1-Math.exp(-dt*(follow?1.6:2)));cine.cam.z=lerp(cine.cam.z,follow?-6.6:-5.0,1-Math.exp(-dt*1.5));
      if(go>0&&Math.random()<.5)parts.push({x:st.x+2.3,z:st.z+.1,y:.15,vx:1+Math.random(),vz:(Math.random()-.5)*.6,vy:.4+Math.random()*.4,t:0,life:.6,col:Math.random()<.5?'#8a7a64':'#5a5250',size:2});
      if(st.t>3.2&&!st.sub){st.sub=1;sub('Route 9, west. This time the road lets you go.');log('sub');}
      if(st.t>11&&!st.end){st.end=1;log('fadeOut');fade(1);SFX.engine(false);setTimeout(()=>{sub('');cine=null;$('stgBars').classList.remove('on');log('black');done&&done();},1200);}}};
}
