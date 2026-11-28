/* ================= t365: every flight of steps drawn the way the Lamplighter's porch steps are (owner: "the steps going up to
   houses kind of look like they are at a wrong angle so they don't exactly look like steps the only steps looking good are the
   ones going up to the inn"). The camera is a straight-on three-quarter view, so a flight that climbs toward a door shows its
   sides edge-on: straight parallel sides with a stringer (wood) or a cheek wall (stone) down each, the left one lit and the right
   one in shade; deep pale treads seen from above with the nosing brightest; short dark risers with a near-black line under each
   lip; the top tread flush with the sill; a contact shadow at the foot that steps away to the right. Each flight is as wide as
   its door. The old flights widened step by step with both ends showing, a front view in perspective: the wrong angle.
   Drawn here pixel by pixel at the size and anchor of the art each replaces, so every flight keeps its place, its collision
   and its step-by-step lift. ================= */
const A65={HX:{},
  WD:['#2b1e14','#4a3626','#6b5038','#86643f','#a07a50','#b88f60','#cfa874'],     // the porch steps' own wood, dark to light
  ST:['#2a292e','#45444b','#5f5e66','#7b7a80','#97959a','#b3b0b0','#ccc8c4'],     // stone: a cool shade, a warm light
  OUT:'#281916',OUT2:'#33221b',MOSS:['#2a3027','#3d4638','#525d4b']};
function a65Hex(h){let v=A65.HX[h];if(v)return v;v=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];return A65.HX[h]=v;}
function a65Hash(a,b,c){let h=(a*374761393+b*668265263+(c||0)*2246822519)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;}
// a picture as a buffer of pixels: P puts a colour (alpha 0-1), S lays a shadow over whatever is under it (or the ground)
function a65Buf(W,H){const d=new Uint8ClampedArray(W*H*4);
  const P=(x,y,c,a)=>{x|=0;y|=0;if(x<0||y<0||x>=W||y>=H)return;const i=(y*W+x)*4,[r,g,b]=a65Hex(c);d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=Math.round((a==null?1:a)*255);};
  const S=(x,y,a)=>{x|=0;y|=0;if(x<0||y<0||x>=W||y>=H)return;const i=(y*W+x)*4;if(d[i+3]===255)return;d[i]=18;d[i+1]=12;d[i+2]=16;d[i+3]=Math.max(d[i+3],Math.round(a*255));};
  const G=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&d[(y*W+x)*4+3]===255;return {W,H,d,P,S,G};}
// one flight. o: cx (its middle), tw (tread width), top (the row of the dark line under the sill), land (rows of the landing),
// n (steps below it), tr (tread rows), rh (riser rows), base (the ground row), mat 'wood'|'stone'|'earth', sw (side width),
// seed; posts: a newel post at the foot of each side, its height
function a65Flight(B,o){const {P,S}=B,mat=o.mat||'wood',R=mat==='stone'?A65.ST:A65.WD,tr=o.tr||5,rh=o.rh||2,land=o.land==null?4:o.land,n=o.n||3,sw=o.sw==null?2:o.sw,seed=o.seed||1;
  const x0=o.cx-(o.tw>>1),x1=x0+o.tw-1,top=o.top||0,base=o.base;const L=x0-sw-1,Rr=x1+sw+1;   // L and Rr: the outline columns
  const TR=o.treadR||R;
  // the treads and the risers, top to bottom: the landing, then a riser and a tread for each step, then the last riser to the ground
  let y=top+1;const rows=[];for(let k=0;k<land;k++)rows.push(['t',0,Math.max(1,tr-land+k)]);
  for(let i=1;i<=n;i++){for(let k=0;k<rh;k++)rows.push(['r',i,k]);for(let k=0;k<tr;k++)rows.push(['t',i,k]);}
  while(top+1+rows.length<base)rows.push(['r',n+1,rows.length&&rows[rows.length-1][0]==='r'?1:0]);
  const mid=(x0+x1)/2,wear=o.tw*.16;
  // each tread's board or slab joint, where one board butts the next: never in the same place twice
  const joint=i=>x0+4+Math.floor(a65Hash(i,seed,7)*(o.tw-8));   /* (i+20: a second joint on a wide tread) */
  rows.forEach(([kind,i,k],j)=>{const yy=top+1+j;
    for(let x=x0;x<=x1;x++){let c;
      // (calibration 2, measured on the Lamplighter's steps) each step is a MID tread, ONE bright row of nosing at its lip, then a
      // near-black riser lip and a dark riser face: the bright edge over a dark drop is what climbs; a pale board over a dark gap
      // reads as crate slats. The worn track up the middle is the tread's own mid value; the sides keep a step more light
      if(kind==='t'){const nose=k===tr-1;let s=nose?6:(k===0&&i>0?3:4);
        if(!nose&&Math.abs(x-mid)<wear+(k&1))s=3;                                                       // the worn track, darker where feet go
        if(mat==='wood'){if(!nose&&x===joint(i))s=2;}                                                    // one board joint
        else if(mat==='stone'){if(!nose&&x===joint(i))s=2;if(nose&&a65Hash(x,i,seed+3)>.92)s=5;}         // slab joints, a chip or two on the arris
        if(x===x0&&!nose)s=Math.max(s,5);if(x===x1&&!nose)s=Math.min(s,2);c=(mat==='earth'&&!nose?TR:R)[s];}
      else{let s=k===0?0:1;if(x===x0)s=k===0?1:2;c=R[s];}
      P(x,yy,c);}
    if(kind==='t'&&mat==='stone'&&i>0&&k===0&&a65Hash(i,seed,11)>.35){const mx=x0+3+Math.floor(a65Hash(i,seed,12)*(o.tw-8));P(mx,yy,A65.MOSS[2]);P(mx+1,yy,A65.MOSS[1]);if(a65Hash(i,seed,13)>.5)P(mx+2,yy,A65.MOSS[1]);}});   // moss at the back of a stone tread
  // the sides: a stringer (wood) or a cheek wall (stone) the whole height, the left lit, the right in shade
  for(let yy=top;yy<base;yy++){
    for(let q=0;q<sw;q++){const lx=x0-sw+q,rx=x1+1+q;
      if(mat==='stone'){const course=(yy-top)%6===5;P(lx,yy,R[yy===top?5:course?1:(q===0?4:2)]);P(rx,yy,R[yy===top?3:course?0:(q===sw-1?1:2)]);}
      else{P(lx,yy,R[q===0?4:2]);P(rx,yy,R[q===sw-1?1:2]);}}
    P(L,yy,yy===top?A65.OUT2:A65.OUT);P(Rr,yy,A65.OUT);}
  if(o.topLine)for(let x=L+1;x<Rr;x++)P(x,top,x>=x0&&x<=x1?A65.OUT2:R[x<x0?6:3]);   // a dark line where the top tread meets a deck; at a door the landing runs right up to the sill
  // a newel post at the foot of each stringer: a square post standing on the ground, its cap lit on top
  if(o.posts){const ph=o.posts;for(const [px,lit] of [[L-1,1],[Rr-2,0]]){for(let yy=base-ph;yy<base;yy++){P(px,yy,A65.OUT);P(px+1,yy,R[lit?5:3]);P(px+2,yy,R[lit?4:2]);P(px+3,yy,A65.OUT);}
      for(let x=px;x<=px+3;x++){P(x,base-ph-2,A65.OUT);P(x,base-ph-1,x===px||x===px+3?A65.OUT:R[6]);}
      for(let x=px;x<=px+3;x++)P(x,base-ph,x===px||x===px+3?A65.OUT:R[lit?3:1]);}}
  // the foot: the contact line, then the shadow stepping away to the right; down the right side, the shadow of the flight's height
  for(let x=L;x<=Rr;x++)P(x,base,A65.OUT);for(let x=L+1;x<=Rr+1;x++)S(x,base+1,.6);for(let x=L+2;x<=Rr+2;x++)S(x,base+2,.42);for(let x=L+3;x<=Rr+3;x++)S(x,base+3,.22);
  const ht=base-top;for(let yy=Math.max(0,top+1);yy<base;yy++){const u=(base-yy)/ht,w=u>.7?3:u>.4?2:u>.15?1:0;for(let q=1;q<=w;q++)S(Rr+q,yy,q===1?.45:.3);}
  return {x0,x1,L,Rr};}
function a65Canvas(B){const c=document.createElement('canvas');c.width=B.W;c.height=B.H;const g=c.getContext('2d'),id=g.createImageData(B.W,B.H);id.data.set(B.d);g.putImageData(id,0,0);return c;}
function a65Put(key,B,ax,ay){if(typeof IMG==='undefined')return;IMG['mem:'+key]=a65Canvas(B);const m=SPR[key]||SPR[key.replace(/_t$/,'')]||{};SPR[key]=Object.assign({},m,{src:'mem:'+key,fw:B.W,fh:B.H,ax:ax==null?m.ax:ax,ay:ay==null?m.ay:ay,foot:m.foot||[0,0,0,0]});}
// the porch flights (critic calibration: "steps need a visible level surface to arrive on and a frame; a flight that runs straight into
// a door reads as a pallet"): a stoop landing at the sill, wider than the door frame, with its own dark front face showing the height
// of the climb; the steps come forward from that face, straight-sided and as wide as the door (a T, not a ziggurat); newel posts at
// the landing's front corners (wood) or low cheek walls beside the steps (stone); a shadow off the right side.
// The canvas runs 12 px above the sill for the posts: the ground under the foot is still the anchor row (27 + 12).
const A65_HEAD=12,A65_LAND=4;
function a65Geo(dw){const W=dw+28,cx=W>>1,LW=dw+18,SW=dw+6;return {W,cx,LW,SW,l0:cx-(LW>>1),l1:cx-(LW>>1)+LW-1,s0:cx-(SW>>1),s1:cx-(SW>>1)+SW-1};}
function a65Porch(mat,dw,trod){const G=a65Geo(dw),T=A65_HEAD,B=a65Buf(G.W,T+33),{P,S}=B,R=mat==='stone'?A65.ST:A65.WD,st=mat==='stone',seed=dw*3+(st?1:0);
  const L0=G.l0,L1=G.l1,top=T,lf=T+A65_LAND,gy=T+A65_LAND+7;   // the landing's top row, its front edge, the ground at its face
  // the landing: a level floor of planks running across (wood) or slabs (stone), its front rim lit
  for(let y=top;y<lf;y++)for(let x=L0+1;x<L1;x++){const k=y-top;let s=k===A65_LAND-1?6:k===0?3:4;
    if(!st){if(k===1)s=2;if(k!==1&&k<A65_LAND-1&&(x-L0+(k>1?7:0))%11===0)s=2;}                       // a seam between two planks, their butt joints staggered
    else{if(k<A65_LAND-1&&(x-L0)%13===0)s=2;}
    P(x,y,R[s]);}
  for(let y=top;y<lf;y++){P(L0,y,A65.OUT);P(L1,y,A65.OUT);}for(let x=L0;x<=L1;x++)P(x,top-1,A65.OUT2);
  // its front face, either side of the steps, down to the ground: a near-black lip, then the face (boards or stone courses)
  for(let y=lf;y<gy;y++)for(let x=L0;x<=L1;x++){if(x>G.s0-1&&x<G.s1+1)continue;let s=y===lf?0:1;
    if(x===L0||x===L1)P(x,y,A65.OUT);else{if(!st&&y===lf+3)s=0;if(st&&y>lf&&((y-lf)%3===0||(x+(((y-lf)/3|0)%2)*3)%7===0))s=0;if(x===L0+1)s=Math.max(s,2);P(x,y,R[s]);}}
  for(let x=L0;x<=L1;x++)if(x<G.s0||x>G.s1){P(x,gy,A65.OUT);S(x+1,gy+1,.55);S(x+2,gy+2,.3);}
  // the steps, forward from the face: three rises to the landing, two treads, a stringer or cheek wall each side
  const f=a65Flight(B,{cx:G.cx,tw:dw,top:lf-1,land:0,n:3,tr:5,rh:2,base:T+27,mat,sw:st?3:2,seed});
  // the shadow the landing throws off its right end onto the ground, and the steps' own down their right side
  for(let y=top;y<gy;y++){const w=y<lf?3:2;for(let q=1;q<=w;q++)S(L1+q,y+1,q===1?.45:.3);}
  // newel posts at the landing's front corners (wood): square posts with a lit cap, standing on the landing
  if(!st)for(const [px,lit] of [[L0,1],[L1-3,0]]){const yb=lf+1,yt=top-7;for(let y=yt;y<yb;y++){P(px,y,A65.OUT);P(px+1,y,R[lit?5:3]);P(px+2,y,R[lit?4:2]);P(px+3,y,A65.OUT);}
    for(let x=px-1;x<=px+4;x++){P(x,yt-2,A65.OUT);P(x,yt-1,x===px-1||x===px+4?A65.OUT:R[x===px?6:5]);P(x,yt,x===px-1||x===px+4?A65.OUT:R[lit?3:1]);}
    for(let q=1;q<=2;q++)for(let y=yt;y<yb;y++)if(!lit||q===1)S(px+3+q,y+1,.35);}
  // on dark grass, the ground at the foot worn to earth by feet, so the step's contact shows (ragged, never a neat rectangle)
  if(trod){const d=B.d,W=B.W,base=T+27,EA=a65Hex('#6c583e'),EB=a65Hex('#56442f'),ED=a65Hex('#3e3024');
    for(let y=base;y<=base+5;y++){const k=y-base,ext=[3,4,4,3,1,0][k];for(let x=G.s0-ext-1;x<=G.s1+ext+1;x++){if(x<0||x>=W)continue;
      const edge=x<G.s0-ext+1||x>G.s1+ext-1;if(edge&&a65Hash(x,y,seed+50)<.55)continue;if(k>=4&&a65Hash(x,y,seed+51)<.6)continue;
      const i=(y*W+x)*4;if(d[i+3]===255)continue;const sh=d[i+3]>0,c=sh?(d[i+3]>110?ED:EB):((k===1||k===2)&&a65Hash(x,k,seed+52)>.8?EB:EA);d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255;}}}
  B.geo=Object.assign({},G,{top,lf,gy,base:T+27});return B;}
// the two rises from the Lamplighter's deck up to its door (on the deck, 44 x 26): its lift counts a tread and the landing
function a65Stoop(){const B=a65Buf(44,26);a65Flight(B,{cx:22,tw:30,top:0,land:6,n:2,tr:5,rh:2,base:23,mat:'wood',sw:2,seed:41});return B;}
// the wooden stairs up the terrace wall in Wickham, to the chapel: five rises to the landing, a newel post at each foot
function a65Terrace(){const B=a65Buf(84,54);a65Flight(B,{cx:42,tw:58,top:1,land:7,n:5,tr:5,rh:2,base:44,mat:'wood',sw:3,seed:57,posts:12});return B;}
const A65_STEPS=[];for(const m of ['wood','stone'])for(const w of [18,22,26,30,32]){A65_STEPS.push(['steps_'+m+'_'+w,()=>a65Porch(m,w),w]);A65_STEPS.push(['steps_'+m+'_'+w+'_t',()=>a65Porch(m,w,1),w]);}
A65_STEPS.push(['inn_stoop',a65Stoop],['tsteps_wood',a65Terrace]);
function a65InstallSteps(){if(A65.done)return;A65.done=1;for(const [k,f,dw] of A65_STEPS){try{if(!SPR[k]&&!(/_t$/.test(k)&&SPR[k.slice(0,-2)]))continue;const B=f();if(B.geo){a65Put(k,B,B.geo.cx,A65_HEAD+27);SPR[k].a65=B.geo;SPR[k].a65dw=dw;}else a65Put(k,B);}catch(e){console.warn('steps',k,e);}}}
if(typeof buildWorld==='function'){const _bw=buildWorld;buildWorld=function(){try{a65InstallSteps();}catch(e){}return _bw.apply(this,arguments);};}
// the ridge behind the barn: eight timber-faced steps of packed earth, straight up between the ridge's two cut ends of stone
if(typeof f39StepsSpr==='function'){f39StepsSpr=function(){const W=96,H=88,top=4,foot=63,X0=16,X1=80,key='f39_steps5';if(SPR[key]&&SPR[key].a65)return key;
  const B=a65Buf(W,H),{P,S}=B;const ST={lit:'#8a7262',mid:'#6c584c',sh:'#3a2e28',ln:'#40332f'},GR={md:'#5a6a2c',dk:'#3a4420'},ER={md:'#7a5a34',dk:'#5e4428'};
  const EARTH=['#2b1e14','#4a3626','#5e4428','#6e5032','#7a5a34','#b88f60','#cfa874'];   // packed earth, its timber nosing pale
  for(let x=X0;x<X1;x++){P(x,top-3,ER.dk);P(x,top-2,ER.md);P(x,top-1,ER.md);}                 // the lane coming over the lip
  // the two cut ends of the ridge, the left lit and the right in shade, in courses
  for(let y=top-2;y<foot;y++){const c=(y-top)%6===5;for(let q=0;q<3;q++){P(X0-3+q,y,c?ST.ln:q===0?ST.mid:ST.lit);P(X1+q,y,c?ST.ln:q===2?ST.sh:ST.mid);}}
  for(let x=X0-4;x<X0;x++)P(x,top-3,GR.md);for(let x=X1;x<X1+4;x++)P(x,top-3,GR.md);
  // the flight: the landing at the lip, six steps in the cut and two standing out past the foot, all one width
  a65Flight(B,{cx:48,tw:56,top:top-2,land:4,n:10,tr:5,rh:2,base:foot+20,mat:'earth',treadR:EARTH,sw:3,seed:39});
  // a peg at each end of every riser, holding its plank
  {let y=top+3;for(let i=1;i<=8;i++){P(X0+2,y+1,'#3a2218');P(X1-4,y+1,'#3a2218');y+=9;}}
  for(const [x,y] of [[X0-14,foot+6],[X1+12,foot+9],[X0-12,foot+16],[X1+13,foot+17]]){P(x,y,GR.md);P(x,y+1,GR.md);P(x,y+2,GR.md);P(x+1,y+1,GR.dk);P(x+1,y+2,GR.dk);}
  if(typeof IMG!=='undefined'){IMG['mem:'+key]=a65Canvas(B);SPR[key]={src:'mem:'+key,fw:W,fh:H,ax:48,ay:foot,foot:[0,0,0,0],a65:1};}return key;};}

// where you stand on a T: on the landing (as wide as it is) at the sill; on the steps (only as wide as they are) a step at a time;
// in front of the landing's face beside the steps, on the ground (and the face stops you walking into it)
const A65_BRICK=new Set(['house_b','house_b_n','house_b2','house_b2_n']);   /* brick houses get stone stoops */
if(typeof porchZones==='function'){const _pz=porchZones;porchZones=function(){const f=FRAME_NO,fresh=PORCH.frame!==f,Z=_pz();if(!fresh)return Z;
    for(const q of Z){let k=q.spr;if(!q.ramp&&A65_BRICK.has(q.o.spr)&&/^steps_wood_/.test(k)){k=k.replace('wood','stone');q.mat='stone';}
      const m=SPR[k];if(!m||!m.a65){q.spr=k;continue;}const g=m.a65;q.a65={hwL:(g.LW/2)/PPM,hwS:(g.SW/2)/PPM,land:A65_LAND/PPM};q.hw=q.a65.hwL;
      if(q.o.a65t==null){let t=1;try{for(const dz of [.06,.2,.35])for(const dx of [-.3,0,.3]){const sf=surfAt(q.x+dx,q.z1+dz);if(!/grass|leaves|dirt|mud/.test(sf))t=0;}}catch(e){t=0;}q.o.a65t=t;}   /* the trodden earth only where the foot is on grass or dirt: on pavement it was a smudge */
      q.spr=q.o.a65t&&SPR[k+'_t']?k+'_t':k;}
    return Z;};}
if(typeof porchAt==='function'){porchAt=function(x,z){for(const q of porchZones()){const dx=Math.abs(x-q.x);if(dx>=q.hw||z<=q.z0||z>=q.z1)continue;
    if(q.a65&&z-q.z0>=q.a65.land&&dx>=q.a65.hwS)continue;return q;}return null;};}
if(typeof porchLift==='function'){const _pl=porchLift;porchLift=function(x,z){const dl=deckLift(x,z);if(dl>=0)return dl;const q=porchAt(x,z);if(!q||!q.a65)return _pl(x,z);
    const d=(z-q.z0)*PPM;return d<8.5?7:d<12.5?5:d<16?3:d<19.5?1:0;};}   /* (the landing band reaches as far out as you can stand from the wall) */
// the faces either side of the steps are solid (added once the town is built; the steps between stay open)
function a65Walls(){if(A65.walls)return;A65.walls=1;let n=0;for(const o of OBJ){if(o.kind!=='bld'||o.hide||o.room||o.x>=250||o.noSteps)continue;const m=SPR[o.spr];if(!m||!m.door_w||m.steps==='ramp')continue;
    const w=nearestW(STEP_W,m.door_w),k=(m.steps==='stone'||A65_BRICK.has(o.spr)?'steps_stone_':'steps_wood_')+w,sm=SPR[k];if(!sm||!sm.a65)continue;const g=sm.a65;
    const x=o.x+(m.door_dx||0)/PPM*(o.flip?-1:1),hl=(g.LW/2-1)/PPM,hs=(g.SW/2+1)/PPM,z0=o.z+(A65_LAND-2)/PPM,z1=o.z+(A65_LAND+1)/PPM;
    addRect(x-hl,z0,x-hs,z1);addRect(x+hs,z0,x+hl,z1);n++;}A65.nWalls=n;}
if(typeof buildWorld==='function'){const _bw2=buildWorld;buildWorld=function(){const r=_bw2.apply(this,arguments);try{a65Walls();}catch(e){console.warn('stoops',e);}return r;};}
