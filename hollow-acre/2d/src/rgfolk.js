/* ================= the townsfolk go out into the new land too, each on their own day and for their own reason:
   Agnes straightens the dolls in the birches; Silas weeds the Greyfield graves; Lyle reads his grandfather's certificates there,
   Cora the Home's school records; Otto fishes off the reservoir dock for Nils, Quinn prays at the shore; Maud scrubs the soot
   off the Covenant's names, Hale reads it; Moss traps on Pine Ridge, Bram draws the wheel from the lookout; Della gathers moss
   in the fen; Wes walks to the county line again; June takes Room 6 its letter; Ezra cuts Harlan's corn from the edges.
   They walk the roads, at their own pace where you can see them and quicker where you can't, and they have something
   to say when you find them out there. ================= */
const RGV=[
 {id:'agnes',days:[2],from:9,to:14,at:[-210.5,-117.6],line:'I walk up once a week and straighten their dresses. Nobody else will. Ruth’s is the one with the ribbon. Don’t touch the new one. I haven’t been able to look at it.',
  lore:'Agnes walks up to the Weeping Birches every week to straighten the dolls’ dresses.'},
 {id:'silas',days:[4],from:7,to:12,at:[-172,59.4],line:'Ninety-one. I weed them every week. The town paid for them, it can keep them tidy. Nobody measured these ones. Nobody thought they’d need a box the right size.',
  lore:'Silas keeps Greyfield’s ninety-one graves weeded. Nobody ever measured those children for their boxes.'},
 {id:'lyle',days:[3],from:10,to:13,at:[-199.6,58],line:'My grandfather was the Home’s doctor. He signed ninety-one certificates. Cause of death: <i>sent on</i>. I come and read them once a month, so somebody has.',
  lore:'Lyle’s grandfather signed Greyfield’s death certificates. Cause of death on every one: sent on.'},
 {id:'cora',days:[6],from:13,to:16,at:[-176,59.4],line:'The Home kept school reports too. Every child top of the class in their last year. They taught them to read so they could read their own name off the slip.',
  lore:'Greyfield taught its children to read, so that they could read their own names off the slip.'},
 {id:'otto',days:[0,3],from:6,to:11,at:[122,179],line:'Nils went in off this dock in ’61. Not this dock. The one under it. I fish here so he’s got somebody to look up at.',
  lore:'Otto’s brother Nils went into the water in 1961, off the dock that’s under the reservoir now. Otto fishes above him.'},
 {id:'quinn',days:[5],from:9,to:12,at:[113.6,171.4],line:'Old Wickham chapel is down there. Its bell rings for the Tithe the same night ours does. I come and pray for them. They’ve never prayed back. They wave.',
  lore:'Quinn prays at the reservoir for the drowned congregation of Old Wickham. They wave back.'},
 {id:'maud',days:[1],from:13,to:16,at:[-22.4,-123.8],line:'My great-great-grandmother cut that altar. Thorne’s on it. I come up and scrub the soot off the names. All but ours. Ours can stay black.',
  lore:'Maud scrubs the soot off the Covenant’s names every week, all but the Thornes’.'},
 {id:'hale',days:[6],from:9,to:12,at:[-30.4,-123.4],line:'Every pastor of Marrow Hollow comes up here once to read it with his own eyes. I come every week. I keep hoping one of the names will have worn away.',
  lore:'Pastor Hale reads the Covenant in Old Marrow every week, hoping a name will have worn away.'},
 {id:'moss',days:[2,5],from:6,to:11,at:[160,-135.6],line:'Tracks up here only go one way. Up toward the lookout, never down. Deer, fox, people. Something carries them the rest of the way.',
  lore:'On Pine Ridge every set of tracks goes up toward the lookout. None come down.'},
 {id:'bram',days:[6],from:9,to:12,at:[147.6,-146.2],line:'From the top you can see all of it. The wheel. I draw it every week and every week it’s a little tighter. Like it’s winding in.',
  lore:'Bram draws the wheel from the lookout every week. Every week it is drawn tighter, as if it is winding in.'},
 {id:'della',days:[1],from:9,to:13,at:[-207,197.4],line:'I come for the moss, it’s good for bleeding. And to count. I delivered some of the ones under the peat. I remember every one of them being born.',
  lore:'Della gathers moss in the fen. She delivered some of the children who lie under its peat.'},
 {id:'wes',days:[4],from:13,to:17,at:[-287.6,-7.4],line:'Fifth try. I walked past the sign and came out at your gate. Every time. I just like standing here. It’s as far as you can get.',
  lore:'Wes walks to the county line every week. It is as far as anyone can get.'},
 {id:'june',days:[0],from:14,to:16,at:[-136,-11.6],line:'There’s a letter for Room 6 every week. No stamp, no sender. I deliver it anyway, it’s my job. This week’s has your name on it. I put it under the door.',
  lore:'June delivers a letter to Room 6 of the Pine Rest every week. No stamp, no sender. This week’s had your name on it.'},
 {id:'ezra',days:[5],from:8,to:12,at:[14,196.4],line:'Harlan’s corn feeds my stock. Nobody plants it. It comes up anyway every spring, in the same maze. I cut from the edges. I don’t go in.',
  lore:'Nobody plants Harlan’s corn. It comes up every spring in the same maze. Ezra cuts it from the edges and won’t go in.'}];
const RGV_BY={};for(const v of RGV){v.key='rgv_'+v.id;PL[v.key]=[v.at[0],v.at[1],.3];RGV_BY[v.id]=v;}
const rgvToday=id=>{const v=RGV_BY[id];if(!v||!LIFE[id])return null;if(!v.days.includes(S.day%7))return null;if(S.hour<v.from||S.hour>=v.to)return null;
  const st=S.st||{};if(st.tithe&&!st.done&&S.st.tithe-S.day<=1)return null;if(typeof fToday==='function'&&fToday())return null;return v;};
{const _w=wantFor;wantFor=function(n){const r=_w.apply(this,arguments);if(r==='home'||r==='fest'||r==='church')return r;const v=n&&n.def&&rgvToday(n.def.id);return v?v.key:r;};}
{const _px=placeXY;placeXY=function(key,n){if(typeof key==='string'&&key.startsWith('rgv_')){const p=PL[key];return [p[0],p[1]];}return _px.apply(this,arguments);};}
// ---- a map of every road, for the long walks
const RGN={nodes:[],adj:[],built:false};
function rgnBuild(){const segs=ROADS.concat([[-12.5,-6,-74,-6,3]]);const nodes=RGN.nodes=[];const near=(x,z)=>{for(let i=0;i<nodes.length;i++)if(Math.hypot(nodes[i][0]-x,nodes[i][1]-z)<.9)return i;nodes.push([x,z]);return nodes.length-1;};
  const onSeg=segs.map(()=>[]);
  for(let a=0;a<segs.length;a++){const s=segs[a];onSeg[a].push([0,near(s[0],s[1])]);onSeg[a].push([1,near(s[2],s[3])]);}
  // every road end that meets another road somewhere along its length splits it there
  for(let a=0;a<segs.length;a++)for(const end of [[segs[a][0],segs[a][1]],[segs[a][2],segs[a][3]]])for(let b=0;b<segs.length;b++){if(a===b)continue;const s=segs[b];
    const dx=s[2]-s[0],dz=s[3]-s[1],L=dx*dx+dz*dz||1;const t=clamp(((end[0]-s[0])*dx+(end[1]-s[1])*dz)/L,0,1);const px=s[0]+dx*t,pz=s[1]+dz*t;
    if(Math.hypot(px-end[0],pz-end[1])<Math.max(1.2,s[4]/2+.4))onSeg[b].push([t,near(px,pz)]);}
  // roads that cross each other join where they cross
  for(let a=0;a<segs.length;a++)for(let b=a+1;b<segs.length;b++){const p=segs[a],q=segs[b];const d1x=p[2]-p[0],d1z=p[3]-p[1],d2x=q[2]-q[0],d2z=q[3]-q[1];const den=d1x*d2z-d1z*d2x;if(Math.abs(den)<1e-9)continue;
    const t=((q[0]-p[0])*d2z-(q[1]-p[1])*d2x)/den,u=((q[0]-p[0])*d1z-(q[1]-p[1])*d1x)/den;if(t<=0||t>=1||u<=0||u>=1)continue;const k=near(p[0]+d1x*t,p[1]+d1z*t);onSeg[a].push([t,k]);onSeg[b].push([u,k]);}
  const adj=RGN.adj=nodes.map(()=>[]);
  for(const L of onSeg){L.sort((p,q)=>p[0]-q[0]);for(let i=0;i<L.length-1;i++){const a=L[i][1],b=L[i+1][1];if(a===b)continue;const d=Math.hypot(nodes[a][0]-nodes[b][0],nodes[a][1]-nodes[b][1]);adj[a].push([b,d]);adj[b].push([a,d]);}}
  RGN.segs=segs;RGN.built=true;}
// the closest point on any road, as a node joined into the graph for this one search
function rgnSnap(x,z){let best=null,bd=1e9;for(const s of RGN.segs){const dx=s[2]-s[0],dz=s[3]-s[1],L=dx*dx+dz*dz||1;const t=clamp(((x-s[0])*dx+(z-s[1])*dz)/L,0,1);const px=s[0]+dx*t,pz=s[1]+dz*t;const d=Math.hypot(px-x,pz-z);
  if(d<bd){bd=d;best={x:px,z:pz,s};}}return best;}
function rgnPath(x,z,tx,tz){if(!RGN.built)rgnBuild();const N=RGN.nodes,adj=RGN.adj;const a=rgnSnap(x,z),b=rgnSnap(tx,tz);if(!a||!b)return null;
  const ends=s=>N.map((n,i)=>[n,i]).filter(([n])=>segDist(n[0],n[1],s[0],s[1],s[2],s[3])<.05).map(([,i])=>i);
  const S0=N.length,E0=N.length+1;const extra=[[S0,ends(a.s).map(i=>[i,Math.hypot(N[i][0]-a.x,N[i][1]-a.z)])],[E0,ends(b.s).map(i=>[i,Math.hypot(N[i][0]-b.x,N[i][1]-b.z)])]];
  const P=i=>i===S0?[a.x,a.z]:i===E0?[b.x,b.z]:N[i];const nb=i=>{const r=i===S0?extra[0][1].slice():i===E0?extra[1][1].slice():adj[i].slice();
    for(const [k,L] of extra)for(const [j,d] of L)if(j===i)r.push([k,d]);if(a.s===b.s&&(i===S0||i===E0))r.push([i===S0?E0:S0,Math.hypot(a.x-b.x,a.z-b.z)]);return r;};
  const dist=new Map([[S0,0]]),prev=new Map(),done=new Set();const q=[[0,S0]];
  while(q.length){q.sort((p,r)=>p[0]-r[0]);const [d,i]=q.shift();if(done.has(i))continue;done.add(i);if(i===E0)break;
    for(const [j,w] of nb(i)){const nd=d+w;if(nd<(dist.has(j)?dist.get(j):1e18)){dist.set(j,nd);prev.set(j,i);q.push([nd,j]);}}}
  if(!done.has(E0))return null;const out=[];for(let i=E0;i!==undefined;i=prev.get(i))out.push(P(i));out.reverse();out.push([tx,tz]);return out;}
// long walks out of (or back into) the old valley go by the roads; the town's own streets are walked the way they always were
{const _rt=routeTo;routeTo=function(x,z,tx,tz){if(x<250&&tx<250&&(inNewLand(x,z)||inNewLand(tx,tz))){try{const p=rgnPath(x,z,tx,tz);if(p&&p.length){
      let lead=[];if(!inNewLand(x,z)){const s=p[0];lead=_rt.call(this,x,z,s[0],s[1])||[];}p.rg=true;const r=lead.concat(p);r.rg=true;return r;}}catch(e){console.warn('rgn',e);}}
  return _rt.apply(this,arguments);};}
// out of sight they keep up a good pace, so a trip to the birches doesn't take all day
{const _u=update;update=function(dt){_u(dt);if(S.mode!=='play'||S.paused)return;try{
  for(const n of npcs){if(n.loc!=='out'||!n.route||!n.route.rg||n.route.length<2||talkingTo===n)continue;if(!S.room&&onScreen(n.x,n.z,90))continue;
    let left=11*dt;while(left>0&&n.route.length>1){const [tx,tz]=n.route[0];const dx=tx-n.x,dz=tz-n.z,d=Math.hypot(dx,dz);
      if(d<1.6){n.route.shift();continue;}   // close enough: a corner that sits in a well or a hedge is passed, not reached
      const st=Math.min(d,left);n.x+=dx/d*st;n.z+=dz/d*st;collide(n,.3);n.dir=dirOf(dx,dz);left-=st;}}}catch(e){}};}
// what they say when you find them out there (once each time they go), over whatever else they'd have said
{const _t=talk;talk=function(n){let v=null;try{v=n&&n.def&&!isNight()&&RGV_BY[n.def.id];if(v&&(Math.hypot(n.x-v.at[0],n.z-v.at[1])>9||(S.rgv&&S.rgv[v.id+':'+S.day])))v=null;}catch(e){v=null;}
  const r=_t.apply(this,arguments);
  try{if(v&&!$('talk').hidden&&!SCENE&&talkingTo===n){S.rgv=S.rgv||{};S.rgv[v.id+':'+S.day]=1;$('talkLine').innerHTML=`<q>${v.line}</q>`;
    if(v.lore)setTimeout(()=>addLore(v.lore),400);if(typeof addFriend==='function')addFriend(n.def.id,15);}}catch(e){}return r;};}
// the heart-events tab and the schedule readers know these places by name
if(typeof PLACE_WORD!=='undefined')for(const v of RGV){const r=rgAt(v.at[0],v.at[1]);PLACE_WORD[v.key]=r?'out at '+r.name.replace(/^The /,'the '):'out of town';}
