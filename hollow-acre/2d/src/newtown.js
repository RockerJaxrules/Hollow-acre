/* ================= the new Marrow Hollow, finished off: clutter cleared from its streets and doorways, a story behind every door that
   isn't anybody's home, long grass framing the fences, and two layers that move at their own speed over the town (leaves blowing
   close past the camera, crows high overhead whose shadows cross the streets). Old saves keep their things out of the new buildings. ================= */
// ---- the streets and doorways are kept clear of anything the woods scattered there
{const _bw=buildWorld;buildWorld=function(){_bw();
  const doors=[...Object.keys(TB).map(tbDoor),...Object.keys(SHOPS_AT).map(shopDoor)];
  const blds=OBJ.filter(o=>o.kind==='bld'&&inTown(o.x,o.z)).map(o=>{const f=SPR[o.spr]&&SPR[o.spr].foot;return f?[o.x+f[0]-.2,o.z+f[1]-.2,o.x+f[2]+.2,o.z+.2]:null;}).filter(Boolean);
  const junk=o=>{if(o.town||o.hide||!inTown(o.x,o.z))return false;const k=o.kind||'';const loose=o.debris||/^(rock_|weeds_|twig|stump)/.test(o.spr||'');
    if(!loose&&!(['tree','pine','bush'].includes(k)||(k==='anim'&&o.grass)||k==='deco'))return false;
    if(loose&&!o.yard)return true;
    if(onRoad(o.x,o.z,.5))return true;if(doors.some(d=>Math.hypot(d[0]-o.x,d[1]-o.z)<1.8))return true;
    return blds.some(b=>o.x>b[0]&&o.x<b[2]&&o.z>b[1]&&o.z<b[3]);};
  for(let i=OBJ.length-1;i>=0;i--){const o=OBJ[i];if(!junk(o))continue;for(let j=circles.length-1;j>=0;j--)if(Math.hypot(circles[j].x-o.x,circles[j].z-o.z)<.5)circles.splice(j,1);OBJ.splice(i,1);}
  // long grass at the foot of the fences and the terrace wall: low things in front of the eye that frame the street
  const F=OBJ.filter(o=>(o.kind==='fence'||o.kind==='wall')&&inTown(o.x,o.z));
  for(const f of F){const h=floraH?floraH(f.x,f.z,7):Math.random();if(h>.34)continue;const n=2+((h*20)|0)%3;
    for(let k=0;k<n;k++){const x=f.x+(f.kind==='wall'?.4+k*.5:(floraH(f.x+k,f.z,8)-.5)*1.2),z=f.z+(f.kind==='wall'?.35:.3)+floraH(f.x,f.z+k,9)*.2;
      if(onRoad(x,z,.2)||doors.some(d=>Math.hypot(d[0]-x,d[1]-z)<1.4))continue;obj(h<.12?'tgold':'tgrass',x,z,{kind:'anim',grass:1,fps:1.4,ph:h*2,town:1});}}};}

// ---- every door in town has someone, or a story, behind it
const TOWN_DOORS={
  pell:{name:'The Pell house',day:'Boarded up since 1987. Chalked on the boards: a ring with a line through it, the mark the town leaves on a door after the Tithe takes someone from behind it. Under it, smaller, in a child’s hand: WE ARE STILL IN HERE.',
    night:'Behind the boards, very softly, someone is counting. They have got past a thousand. They are not tired.'},
  oakes:{name:'The Oakes house',day:'Mrs. Oakes, through the letterbox: “We’re not taking callers. Not this month.” Then, quieter: “Is it you? Is it your year? Leave a turnip on the step if it is, and we’ll pray for you properly.”',
    night:'The letterbox lifts. Two eyes. It drops again. A chair is dragged across the door on the inside.'},
  gale:{name:'The Gale house',day:'Three bicycles rusted into the lawn. Three height marks scored into the door frame, the children’s names beside them. A fourth mark, much higher, with no name. None of the Gales is that tall.',
    night:'A light goes off upstairs as you knock. Then another. Then one in a room the house is too small to have.'},
  marr:{name:'Old Marr’s house',day:'The mailbox is stuffed with letters in old Mr. Marr’s handwriting, all addressed to himself, all dated next week. The one on top: “Don’t open the door to the new one. They look like Elias.”',
    night:'From inside, an old man reads aloud: “Don’t open the door to the new one.” A page turns. “Don’t open the door.”'},
  wren:{name:'The Wren house',day:'For sale since 1972. The sign has been repainted every autumn. Through the dusty window a table is laid for four, and the plates are clean, and the chairs are pulled out.',
    night:'The table inside is laid for five now.'},
  hall:{name:'The town hall',day:'Chained shut. A notice on the door: TOWN MEETING ON THE QUESTION OF THE TITHE — POSTPONED. It is dated October 1952. The clock above has said eight minutes to twelve ever since the night of the vote.',
    night:'The chains are hanging loose. Inside, in the dark, a gavel knocks three times, and a room full of people says “Aye.”'},
  school:{name:'The schoolhouse',day:'Through the window: twenty small desks, and Miss Vance’s blackboard. DAYS LEFT, and under it a long row of tally marks, rubbed out and redone so often the slate has worn pale.',
    night:'Chalk squeaks inside. The schoolroom is dark. Someone small is adding a tally mark to the board, one stroke at a time.'}};
for(const [k,t] of Object.entries(TOWN_DOORS)){const [x,z]=tbDoor(k);
  interact.push({x,z,r:.9,on:()=>!S.room,label:()=>k==='school'||k==='wren'?'Look':'Knock',ok:()=>true,act(){const night=isNight();SFX.thud&&SFX.thud(0,.2);
    const key='door:'+k;S.rgLook=S.rgLook||{};if(!S.rgLook[key]){S.rgLook[key]=1;addLore(t.name+': '+t.day.replace(/<[^>]+>/g,''));}
    toast(night?t.night:t.day,5,true);if(night&&typeof mindHit==='function')mindHit(3);}});}
// the memorial and the bandstand on the green
const GREEN_LOOKS=[
  {x:42.4,z:.9,label:'Read',name:'The memorial',text:'TO THE CHILDREN OF MARROW HOLLOW, WHO WENT AHEAD. Under it, a year and a first name for every autumn since 1871. The newest is Danny’s. Below his, the stone has already been dressed smooth for one more.'},
  {x:squarePos.x,z:squarePos.z+2,label:'Look',name:'The bandstand',text:'Someone has scratched a hopscotch into the bandstand boards and numbered it one to ninety-two. The band hasn’t played since the festival of 1952. On festival nights you can still hear them tuning up.'}];
for(const g of GREEN_LOOKS)interact.push({x:g.x,z:g.z,r:1.2,on:()=>!S.room,label:()=>g.label,ok:()=>true,act(){SFX.page&&SFX.page();const key='green:'+g.name;S.rgLook=S.rgLook||{};
  if(!S.rgLook[key]){S.rgLook[key]=1;addLore(g.name+': '+g.text);}toast(g.text,5.5,true);}});

// ---- parallax over the town: leaves blowing past close to the camera, crows high overhead with their shadows crossing the ground
const NEAR={leaves:[],flock:null,t:0,next:40};
function nearLeaf(){const a=Math.random()*6.283,r=6+Math.random()*7;return {x:cam.x+Math.cos(a)*r,z:cam.z+Math.sin(a)*r*.7,vx:.8+Math.random()*1.2,vz:.15+Math.random()*.4,
  rot:Math.random()*6.28,vr:(Math.random()-.5)*4,s:2+Math.random()*1.5,c:['#c8642a','#d8a030','#a83a1e','#e0b848'][(Math.random()*4)|0],ph:Math.random()*6};}
{const _dx=depthOver;depthOver=function(t){_dx(t);if(DX.off||S.room||S.mode!=='play')return;const day=clamp(1-nightK*1.4,0,1);const dt=Math.min(.05,t-(NEAR.t||t));NEAR.t=t;
  const P1=1.55,toS=(x,z)=>{const X=sx(x),Y=sz(z);return [(X-VW/2)*P1+VW/2,(Y-VH*.5)*P1+VH*.5];};
  // leaves: more of them where there are trees about
  const want=day>.05?Math.round(5+4*(typeof DX.nPar==='number'&&DX.nPar>0?1:0)):0;
  while(NEAR.leaves.length<want)NEAR.leaves.push(nearLeaf());if(NEAR.leaves.length>want)NEAR.leaves.length=want;
  for(let i=0;i<NEAR.leaves.length;i++){const l=NEAR.leaves[i];l.ph+=dt;l.x+=(l.vx+Math.sin(l.ph*1.3)*.9)*dt;l.z+=(l.vz+Math.cos(l.ph*.9)*.3)*dt;l.rot+=l.vr*dt;
    const [fx,fy]=toS(l.x,l.z);if(fx<-40||fx>VW+40||fy<-40||fy>VH+40||Math.hypot(l.x-cam.x,l.z-cam.z)>16){NEAR.leaves[i]=nearLeaf();continue;}
    ctx2.save();ctx2.globalAlpha=.85*day;ctx2.translate(Math.round(fx),Math.round(fy));ctx2.rotate(l.rot);ctx2.scale(1,.55+.45*Math.abs(Math.sin(l.ph*2.2)));
    ctx2.fillStyle=l.c;const s=l.s*2;ctx2.fillRect(-s,-s/2,s*2,s);ctx2.fillRect(-s/2,-s,s,s*2);ctx2.fillStyle='rgba(60,24,10,.6)';ctx2.fillRect(-s,0,s*2,1);ctx2.restore();}
  // the flock: now and then, in daylight, seven crows go over in a ragged line; their shadows run along the ground below and behind them
  NEAR.next-=dt;if(!NEAR.flock&&NEAR.next<=0&&day>.4){NEAR.next=70+Math.random()*80;const dir=Math.random()<.5?1:-1;
    NEAR.flock={x:cam.x-dir*22,z:cam.z-6+Math.random()*10,dir,birds:Array.from({length:7},(_,i)=>({dx:-dir*i*1.1+(Math.random()-.5)*.6,dz:(i%2?1:-1)*i*.55+(Math.random()-.5)*.4,ph:Math.random()*6}))};
    if(SFX.crow)try{SFX.crow();}catch(e){}}
  const F=NEAR.flock;if(F){F.x+=F.dir*7*dt;const sun=sunState&&sunState();
    for(const b of F.birds){b.ph+=dt*9;const bx=F.x+b.dx,bz=F.z+b.dz;
      if(sun){const X=sx(bx+sun.sx*4),Y=sz(bz+4.2);ctx2.fillStyle=`rgba(8,10,14,${(.22*day).toFixed(2)})`;ctx2.fillRect(Math.round(X-5),Math.round(Y),10,2);ctx2.fillRect(Math.round(X-1),Math.round(Y-1),3,4);}
      const [fx,fy]=toS(bx,bz);const up=Math.sin(b.ph)>0;ctx2.fillStyle=`rgba(14,12,14,${(.9*day).toFixed(2)})`;
      ctx2.fillRect(Math.round(fx-1),Math.round(fy),3,2);
      if(up){ctx2.fillRect(Math.round(fx-6),Math.round(fy-3),5,2);ctx2.fillRect(Math.round(fx+2),Math.round(fy-3),5,2);}else{ctx2.fillRect(Math.round(fx-6),Math.round(fy+1),5,2);ctx2.fillRect(Math.round(fx+2),Math.round(fy+1),5,2);}}
    if(Math.abs(F.x-cam.x)>34)NEAR.flock=null;}};}

// ---- saves from before the new town: anything put down where a building now stands goes back to the farm
{const _lg=loadGame;loadGame=function(d){try{if(d&&d.bench&&typeof BENCHES!=='undefined'){
    const blds=OBJ.filter(o=>o.kind==='bld').map(o=>{const f=SPR[o.spr]&&SPR[o.spr].foot;return f?[o.x+f[0]-1,o.z+f[1]-1,o.x+f[2]+1,o.z+1.5]:null;}).filter(Boolean);
    for(const [k,p] of Object.entries(d.bench)){if(!p||!inTown(p.x,p.z))continue;const bad=onRoad(p.x,p.z,.6)||blds.some(b=>p.x>b[0]&&p.x<b[2]&&p.z>b[1]&&p.z<b[3]);
      if(bad){const i=BENCHES.findIndex(b=>b[0]===k);if(i>=0&&typeof benchSpot==='function')d.bench[k]=benchSpot(i);}}}}catch(e){}
  return _lg.apply(this,arguments);};}
