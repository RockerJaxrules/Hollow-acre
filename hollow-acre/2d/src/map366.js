/* ================= t366 the valley map, made again (owner: "the map movement and it should load in instant not have delay and
   the zoomin in and moving around in it should be smooth and I think the map could look a bit nicer and have more use to it").
   1. Instant. The paper map is put together once, a slice at a time while you do other things (from the title screen on), and
      kept: in memory, and in the browser for the next visit. The slow part, sampling the valley's ground, ships with the game
      (mapterr366.js) and is checked against the ground before it's trusted. Only what changes is drawn again: the paper when a
      building goes up, and everything live (you, friends, people, your goal, the bus, your pins) on top each frame.
      Opening the map shows the finished map in its very first frame.
   2. Smooth. The finished paper is drawn with a transform, never repainted: zoom eases round the cursor, the fingers or the
      middle; a flicked map glides to a stop at its edges.
   3. Nicer. Crisp pixels in the map's own palette inside a parchment edge, a pixel icon for each kind of place, names on paper
      tags that never sit on each other (fewer as you zoom out).
   4. More use. You and which way you face, friends, your goal and the road there, shops with their hours and whether they're
      open, the people you've met, the bus and train with their times, the milestones you travel from, the places you've found,
      your own pins with a note, and the building you're in. Every place opens a small card.
   ================= */
const M6={ver:0,base:null,sig:'',job:null,ready:false,v:{x:0,y:0,k:1},z:null,vel:[0,0],ptr:new Map(),drag:null,pinch:null,on:false,dirty:true,raf:0,last:0,
  cw:0,ch:0,dpr:1,hover:null,card:null,lay:null,layK:-1,layN:-1,t:0,keys:new Set(),pinMode:false,draft:null,route:null,routeKey:'',kDef:1.4};
const M6L_DEF={you:1,goal:1,shops:1,folk:1,transit:1,travel:1,found:1,pins:1};
const M6L=Object.assign({},M6L_DEF);try{const s=JSON.parse(localStorage.getItem('hollowMapLayers')||'null');if(s&&typeof s==='object')for(const k in M6L_DEF)if(k in s)M6L[k]=s[k]?1:0;}catch(e){}
function m6SaveL(){try{localStorage.setItem('hollowMapLayers',JSON.stringify(M6L));}catch(e){}}
const m6BX=x=>MAPX.pad+(x-B.x0)*MAPX.s,m6BY=z=>MAPX.pad+(z-B.z0)*MAPX.s;
const m6Esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// which hand is in use, written on the body for the CSS (44 px buttons for a finger), only when it changes
function m6Hand(){const m=typeof GP!=='undefined'?GP.mode:'kb';for(const k of ['kb','touch','pad']){const on=m===k;if(document.body.classList.contains('in-'+k)!==on)document.body.classList.toggle('in-'+k,on);}}
// (a phone starts as a finger, before its first touch)
try{if(matchMedia('(pointer:coarse)').matches&&!matchMedia('(any-pointer:fine)').matches&&typeof GP!=='undefined'&&GP.mode==='kb'&&typeof gpSetMode==='function')gpSetMode('touch');}catch(e){}
m6Hand();if(typeof gpSetMode==='function'){const _sm=gpSetMode;gpSetMode=function(){const was=GP.mode;const r=_sm.apply(this,arguments);if(GP.mode!==was){m6Hand();try{if(M6.on){m6SetHint();M6.lay=null;M6.ver++;m6Kick();}}catch(e){}}return r;};}
// "click" is said to a mouse and "tap" to a finger (the one-voice pass had made it "tap" everywhere)
if(typeof U37_WORDS!=='undefined')for(const w of U37_WORDS){if(w[1]==='Tap'||w[1]==='tap'||w[1]==='Shift-tap'){const to=w[1];w[1]=m=>(typeof GP!=='undefined'&&GP.mode==='touch')?to:m;}}

// ================================================================ 1. the paper, put together in slices
// the browser's own store: the ground's samples (by game build) and the finished paper (by what it shows)
const M6DB={p:null};
function m6Db(){if(M6DB.p)return M6DB.p;M6DB.p=new Promise(res=>{try{if(!window.indexedDB)return res(null);const r=indexedDB.open('hollowMap',1);r.onupgradeneeded=()=>{try{r.result.createObjectStore('kv');}catch(e){}};
  r.onsuccess=()=>res(r.result);r.onerror=()=>res(null);r.onblocked=()=>res(null);}catch(e){res(null);}});return M6DB.p;}
function m6Get(k){return m6Db().then(db=>db?new Promise(res=>{try{const q=db.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null);}catch(e){res(null);}}):null).catch(()=>null);}
function m6Put(k,v){return m6Db().then(db=>{if(!db)return;try{db.transaction('kv','readwrite').objectStore('kv').put(v,k);}catch(e){}}).catch(()=>{});}
const M6Q={on:true};   /* the finished paper is cut to the map's own palette */
// the steps that can't be cut into slices: they run only while you're on the title, in a scene or a menu (or with the map open)
const M6BIG=new Set(['low','west','westLow','despeck']);
// what the paper shows that can change in play: the buildings and walls, and the new fields
function m6Sig(){let h=0;for(const o of OBJ){if(o.room||o.hide)continue;const k=o.kind;if(k!=='bld'&&k!=='wall')continue;const s=o.spr||'';h=(h*31+s.length*7+(s.charCodeAt(s.length-1)|0)+Math.round(o.x*4)*13+Math.round(o.z*4))|0;}
  return [BUILD_ID,mapTerrDims().key,h,typeof F39!=='undefined'&&F39.built?1:0,typeof L35!=='undefined'&&L35.built?1:0,M6Q.on?1:0,'v17'].join('|');}
// the ground's samples travel as a run-length list, each run a varint of (length*8 + kind)
function m6RleDecode(b64,N){const bin=atob(b64),cls=new Uint8Array(N);let i=0,p=0;while(p<bin.length&&i<N){let v=0,mul=1,b;do{b=bin.charCodeAt(p++);v+=(b&127)*mul;mul*=128;}while(b&128);const k=v%8,L=Math.floor(v/8);cls.fill(k,i,Math.min(N,i+L));i+=L;}return i===N?cls:null;}
function m6RleEncode(cls){const out=[];let i=0;const N=cls.length;while(i<N){const k=cls[i];let j=i;while(j<N&&cls[j]===k)j++;let v=(j-i)*8+k;do{let b=v%128;v=Math.floor(v/128);if(v)b|=128;out.push(String.fromCharCode(b));}while(v);i=j;}return btoa(out.join(''));}
// a set of samples is trusted only if the ground still says the same at a few dozen spots
function m6TerrCheck(T,cls){const {W,H,s}=T.D,N=W*H;let bad=0;for(let t=0;t<48;t++){const i=Math.floor(hash(t*7.31,9.77)*N)%N,x=i%W,y=(i/W)|0,wx=B.x0+(x+.5)/s,wz=B.z0+(y+.5)/s;
  const k=LAYERS.water(wx,wz)?1:LAYERS.stone(wx,wz)?2:LAYERS.dirt(wx,wz)?3:(LAYERS.dark&&LAYERS.dark(wx,wz))?4:0;if(k!==cls[i])bad++;}return bad<=2;}
function m6TerrUse(T,cls){T.cls=cls;const w=T.water;for(let i=0;i<cls.length;i++)w[i]=cls[i]===1?1:0;T.ph=1;T.i=0;}
// the shipped samples, decoded and checked once, as soon as they're asked for
function m6TerrShip(T,b){if(T.ph!==0||T.i!==0||T.tried)return true;const t0=performance.now(),N=T.D.W*T.D.H;
  try{if(typeof MAP6_TERR!=='undefined'&&MAP6_TERR.key===T.D.key){if(!T.dec){T.dec={bin:atob(MAP6_TERR.rle),p:0,i:0,cls:new Uint8Array(N)};if(b)return false;}const R=T.dec,bin=R.bin;
      while(R.p<bin.length&&R.i<N){let v=0,mul=1,c;do{c=bin.charCodeAt(R.p++);v+=(c&127)*mul;mul*=128;}while(c&128);const k=v%8,L=Math.floor(v/8);R.cls.fill(k,R.i,Math.min(N,R.i+L));R.i+=L;
        if(((R.n=(R.n||0)+1)&511)===0&&b&&performance.now()-t0>b)return false;}
      T.dec=null;if(R.i===N&&m6TerrCheck(T,R.cls)){T.cls=R.cls;T.wi=0;T.from='shipped';}}}catch(e){T.dec=null;}
  if(!T.from){const I=M6.idbTerr;if(I&&I.key===T.D.key&&I.cls&&I.cls.length===N&&m6TerrCheck(T,I.cls)){T.cls=I.cls;T.wi=0;T.from='kept';}}
  // the water flags from the kinds, a slice at a time
  if(T.from){const w=T.water,cls=T.cls;while(T.wi<N){const e=Math.min(N,T.wi+65536);for(let i=T.wi;i<e;i++)w[i]=cls[i]===1?1:0;T.wi=e;if(b&&performance.now()-t0>b&&T.wi<N)return false;}T.ph=1;T.i=0;}
  T.tried=1;return true;}
function m6T(){let T=MAPX.terr;const D=mapTerrDims();if(!T||T.D.key!==D.key){T=MAPX.terr=mapTerrJob();}return T;}
// which roads the paper draws itself (the bent lanes of the new fields are drawn by their own painters)
function m6RoadList(){const f39=new Set(),l35=new Set();try{if(typeof F39!=='undefined'){for(const q of (F39.trackRefs||[]))f39.add(q);if(F39.farmRoad)f39.add(F39.farmRoad);}}catch(e){}
  try{if(typeof L35!=='undefined')for(const q of (L35.roadRefs||[]))l35.add(q);}catch(e){}const all=typeof ROADS!=='undefined'?ROADS:[];
  return {list:all.filter(q=>!f39.has(q)&&!l35.has(q)&&Math.max(q[1],q[3])<=292),low:all.filter(q=>!f39.has(q)&&Math.max(q[1],q[3])>292)};}
// everything that stands in the valley and shows on the map, back to front (and the hedges the West Fields draw themselves)
const m6ObjKeep=(o,hedge)=>{if(o.room||o.hide||o.f39low)return false;if(o.kind==='bush'&&o.z>292&&!o.f39hg){hedge.push(o);return false;}
    return o.x<250&&o.x>B.x0-2&&o.x<B.x1+2&&o.z>B.z0-2&&o.z<B.z1+2&&o.spr&&SPR[o.spr]&&o.kind!=='grass'&&o.kind!=='flat';};
function m6ObjList(){const hedge=[];const list=OBJ.filter(o=>m6ObjKeep(o,hedge)).sort((a,b)=>a.z-b.z);return {list,hedge};}
// one object in miniature from its own sprite, at a scale of f device pixels per paper pixel, its paper pixel (ox,oy) at the origin
function m6DrawObj(g,o,f,ox,oy,plain){const m=SPR[o.spr],im=m&&IMG[m.src];if(!im||(im.complete===false)||!(im.naturalWidth||im.width))return false;const s=MAPX.s,k=o.kind||'';
  const sc=s/PPM*(k==='bld'?1.28:k==='tree'?1.15:1.05)*(o.scale||1)*f;let sx=0,sy=0;if(m.clips){const c=Object.values(m.clips)[0];const r=Object.values(c)[0];sy=r[0]*m.fh;}
  const X=(m6BX(o.x)-ox)*f,Y=(m6BY(o.z)-oy)*f,dx=X-m.ax*sc,dy=Y-m.ay*sc,dw=m.fw*sc,dh=m.fh*sc;if(dw<1.5||dh<1.5)return true;
  if(k==='bld'||k==='tree'){g.fillStyle='rgba(20,14,8,.28)';g.beginPath();g.ellipse(X+dw*.06,Y,dw*.42,Math.max(1.5,dw*.13),0,0,Math.PI*2);g.fill();}
  if(k==='bld'&&!plain){const oc=mapSil(im,sx,sy,m.fw,m.fh),e=1.5*Math.max(1,f/2);for(const [a,b] of [[-e,0],[e,0],[0,-e],[0,e]])g.drawImage(oc,0,0,m.fw,m.fh,dx+a,dy+b,dw,dh);}
  g.drawImage(im,sx,sy,m.fw,m.fh,dx,dy,dw,dh);return true;}
// ---- the steps: each runs a few milliseconds (b) and says whether it finished
const M6STEPS=[
  // the ground: the samples (shipped with the game, kept from last time, or taken now) and their colours
  function terr(J,b){const t0=performance.now(),T=m6T();const ph0=T.ph,i0=T.i,sh=!T.tried;if(!m6TerrShip(T,b))return false;if(T.from)J.from=T.from;if(T.ph===0)J.sampling=1;const done=mapTerrStep(T,Math.max(.5,b-(performance.now()-t0)));
    {const dt=performance.now()-t0;if(dt>6)(J.slow=J.slow||[]).push([sh?'ship':'',ph0,i0,T.ph,Math.round(dt*10)/10]);}
    if(done&&J.sampling&&!J.from){J.from='sampled';m6Put('terr',{key:J.D.key,cls:T.cls});}return done;},
  // laid down crisp, one pixel of ground to two of paper; a few ripples on open water
  function ground(J){const c=J.c=document.createElement('canvas');c.width=J.W;c.height=J.H;const g=J.g=c.getContext('2d');g.fillStyle='#d8c08a';g.fillRect(0,0,J.W,J.H);return true;},
  function groundT(J){const T=MAPX.terr,{W,H}=T.D;const tc=J.tc0=document.createElement('canvas');tc.width=W;tc.height=H;tc.getContext('2d').putImageData(T.img,0,0);return true;},
  function groundB(J){const T=MAPX.terr,{W,H}=T.D,pad=MAPX.pad,g=J.g;g.imageSmoothingEnabled=false;g.drawImage(J.tc0,pad,pad,J.D.FW,J.D.FH);J.tc0=null;MAPX.water={W,H,water:T.water,dist:T.dist};
    const w=MAPX.water;g.fillStyle='#a8ccd8';for(let i=0;i<900;i++){const x=Math.floor(hash(i*1.7,3.1)*w.W),y=Math.floor(hash(5.3,i*.91)*w.H);if(!w.water[y*w.W+x]||w.dist[y*w.W+x]<3)continue;
      const X=pad+x*2,Y=pad+y*2;g.fillRect(X-2,Y,2,1);g.fillRect(X,Y-1,2,1);g.fillRect(X+2,Y,2,1);}
    return true;},
  // the roads, drawn once on their own sheet with their ink edges, and once more as the mask where the regions' colour stops
  // (within half a pace of a road: the same test as onRoad, drawn once instead of asked 200,000 times)
  function roadsA(J,b){const s=MAPX.s,X=m6BX,Y=m6BY,t0=performance.now();
    if(!J.rc){const R=m6RoadList();J.roads=R.list;J.low=R.low;const rc=J.rc=document.createElement('canvas');rc.width=J.W;rc.height=J.H;J.rcg=rc.getContext('2d');J.rcg.lineCap='round';J.ri=0;}
    const rg=J.rcg,L=J.roads,n=L.length;while(J.ri<n*2){const pass=J.ri>=n?1:0,[x0,z0,x1,z1,w]=L[J.ri%n];rg.beginPath();rg.moveTo(X(x0),Y(z0));rg.lineTo(X(x1),Y(z1));rg.strokeStyle=pass?'#e8d4a4':'#5a3a20';rg.lineWidth=pass?w*s*.9:w*s*.9+3;rg.stroke();
      J.ri++;if((J.ri&7)===0&&performance.now()-t0>b)return false;}return true;},
  function roadsM(J,b){const s=MAPX.s,X=m6BX,Y=m6BY,t0=performance.now();
    if(!J.mc){const mc=J.mc=document.createElement('canvas');mc.width=J.W;mc.height=J.H;J.mcg=mc.getContext('2d');J.mcg.lineCap='round';J.mcg.strokeStyle='#000';J.mi=0;}
    const mg=J.mcg,L=J.roads;while(J.mi<L.length){const [x0,z0,x1,z1,w]=L[J.mi];mg.beginPath();mg.moveTo(X(x0),Y(z0));mg.lineTo(X(x1),Y(z1));mg.lineWidth=(w+1)*s;mg.stroke();J.mi++;if((J.mi&7)===0&&performance.now()-t0>b)return false;}
    J.rmask=new Uint8Array(J.W*J.H);J.ry=0;return true;},
  // each pixel road or not (no blur), a band of rows at a time
  function roadsB(J,b){const t0=performance.now(),W=J.W,M=J.rmask;
    while(J.ry<J.H){const y0=J.ry,h=Math.min(16,J.H-y0);const id=J.rcg.getImageData(0,y0,W,h),d=id.data;let any=false;
      for(let o=0;o<d.length;o+=4){const a=d[o+3];if(!a)continue;any=true;if(a<120){d[o+3]=0;continue;}d[o+3]=255;if(d[o]+d[o+1]+d[o+2]>420){d[o]=232;d[o+1]=212;d[o+2]=164;}else{d[o]=90;d[o+1]=58;d[o+2]=32;}}
      if(any)J.rcg.putImageData(id,0,y0);const md=J.mcg.getImageData(0,y0,W,h).data;for(let i=0,n=W*h;i<n;i++)if(md[i*4+3]>=128)M[y0*W+i]=1;
      J.ry+=h;if(performance.now()-t0>b)break;}
    if(J.ry<J.H)return false;
    J.mc=J.mcg=null;return true;},
  // each region's own colour (the same blend as regions.js) over the ground, one row of blocks at a time; worked out once per colour
  function tint(J,b){if(typeof REGS==='undefined'||typeof RG_TINT==='undefined'||typeof rgWeights!=='function')return true;const s=MAPX.s,pad=MAPX.pad,W=J.W,H=J.H,g=J.g,t0=performance.now();
    if(J.ty==null){J.ty=pad;J.fns=REGS.map(r=>RG_TINT[r.k]);J.tmp=new Array(REGS.length);J.tc=REGS.map(()=>({r:new Int16Array(32768),g:new Int16Array(32768),b:new Int16Array(32768),ok:new Uint8Array(32768)}));}const fns=J.fns,tmp=J.tmp,TC=J.tc;
    while(J.ty<H-pad){const y0=J.ty,y1=Math.min(y0+3,H-pad);const id=g.getImageData(0,y0,W,y1-y0),D=id.data;
      for(let bx=pad;bx<W-pad;bx+=3){const by=y0,wx=B.x0+(bx+1.5-pad)/s,wz=B.z0+(by+1.5-pad)/s;
        if(!inNewLand(wx,wz)&&Math.min(Math.abs(wx-OLDB.x0),Math.abs(wz-OLDB.z0),Math.abs(wz-OLDB.z1))>28)continue;if(J.rmask[(by+1)*W+bx+1])continue;rgWeights(wx,wz,tmp);
        for(let y=by;y<y1;y++)for(let x=bx;x<Math.min(bx+3,W-pad);x++){const o=((y-y0)*W+x)*4;const r=D[o],gg=D[o+1],bb=D[o+2];let nr=0,ng=0,nb=0,wt=0;const key=(r>>3)<<10|(gg>>3)<<5|(bb>>3);
          for(let k=0;k<tmp.length;k++){const w=tmp[k];if(w<.002)continue;const T=TC[k];if(!T.ok[key]){const cr=(r>>3)*8+4,cg=(gg>>3)*8+4,cb=(bb>>3)*8+4;const t=fns[k](cr,cg,cb,cr*.3+cg*.59+cb*.11,.5);
              T.r[key]=Math.round(t[0]);T.g[key]=Math.round(t[1]);T.b[key]=Math.round(t[2]);T.ok[key]=1;}
            nr+=T.r[key]*w;ng+=T.g[key]*w;nb+=T.b[key]*w;wt+=w;}
          if(wt<.002)continue;D[o]=clamp(r*(1-wt)+nr,0,255);D[o+1]=clamp(gg*(1-wt)+ng,0,255);D[o+2]=clamp(bb*(1-wt)+nb,0,255);}}
      g.putImageData(id,0,y0);J.ty=y1;if(performance.now()-t0>b)break;}
    return J.ty>=H-pad;},
  // the ground's own colour at each sample (the regions' colour in it, no road yet), each sample evened out with its own kind round
  // it: the close-up tiles are painted from these, with sharp edges where one kind meets another and no speckle
  function smp(J,b){const T=MAPX.terr,SW=T.D.W,SH=T.D.H,pad=MAPX.pad,t0=performance.now();if(!J.sm){J.sm={W:SW,H:SH,cls:T.cls,raw:new Uint8ClampedArray(SW*SH*3),col:new Uint8ClampedArray(SW*SH*3)};J.sr=0;J.sa=0;}const M=J.sm;
    while(J.sr<SH){const y=J.sr,row=J.g.getImageData(pad,pad+y*2,SW*2,1).data;for(let x=0;x<SW;x++){const o=x*8,q=(y*SW+x)*3;M.raw[q]=row[o];M.raw[q+1]=row[o+1];M.raw[q+2]=row[o+2];}J.sr++;if(performance.now()-t0>b)return false;}
    while(J.sa<SH){const y=J.sa,cls=M.cls,raw=M.raw,col=M.col;for(let x=0;x<SW;x++){const i=y*SW+x,k=cls[i];let r=0,g=0,bb=0,n=0;
        for(let dy=-1;dy<=1;dy++){const yy=y+dy;if(yy<0||yy>=SH)continue;for(let dx=-1;dx<=1;dx++){const xx=x+dx;if(xx<0||xx>=SW)continue;const j=yy*SW+xx;if(cls[j]!==k)continue;const q=j*3;r+=raw[q];g+=raw[q+1];bb+=raw[q+2];n++;}}
        const q=i*3;col[q]=r/n;col[q+1]=g/n;col[q+2]=bb/n;}J.sa++;if(performance.now()-t0>b)return false;}
    M.raw=null;return true;},
  function roadsC(J){J.g.drawImage(J.rc,0,0);J.rc=J.rcg=null;const s=MAPX.s;
    try{J.g.fillStyle='#5a3c1e';const fx=Math.round(m6BX(FIELD.x0)),fy=Math.round(m6BY(FIELD.z0)),fw=Math.round(FIELD.w*s),fh=Math.round(FIELD.h*s);J.g.fillRect(fx,fy,fw,1);J.g.fillRect(fx,fy+fh,fw+1,1);J.g.fillRect(fx,fy,1,fh);J.g.fillRect(fx+fw,fy,1,fh);}catch(e){}
    return true;},
  // a copy of the bare ground (the close-up tiles start from it, with the roads and the sprites drawn sharp over it)
  function olist(J,b){const t0=performance.now();if(!J.ob){J.ob={i:0,list:[],hedge:[]};}const O=J.ob;
    while(O.i<OBJ.length){const e=Math.min(OBJ.length,O.i+1500);for(let i=O.i;i<e;i++){const o=OBJ[i];if(m6ObjKeep(o,O.hedge))O.list.push(o);}O.i=e;if(performance.now()-t0>b&&O.i<OBJ.length)return false;}
    // back to front: dealt into buckets a quarter-pace deep, each bucket sorted, then laid end to end (the same order as one sort)
    if(!O.bk){O.bk=new Map();O.j=0;O.z0=Math.floor(B.z0-4);}while(O.j<O.list.length){const e=Math.min(O.list.length,O.j+3000);for(let i=O.j;i<e;i++){const o=O.list[i],q=Math.floor((o.z-O.z0)*4);let a=O.bk.get(q);if(!a)O.bk.set(q,a=[]);a.push(o);}O.j=e;if(performance.now()-t0>b&&O.j<O.list.length)return false;}
    if(!O.keys){O.keys=[...O.bk.keys()].sort((a,c)=>a-c);O.ki=0;O.out=[];}while(O.ki<O.keys.length){const e=Math.min(O.keys.length,O.ki+400);for(let i=O.ki;i<e;i++){const a=O.bk.get(O.keys[i]);if(a.length>1)a.sort((p,q)=>p.z-q.z);for(const o of a)O.out.push(o);}O.ki=e;if(performance.now()-t0>b&&O.ki<O.keys.length)return false;}
    J.ol={list:O.out,hedge:O.hedge};J.ob=null;return true;},
  function decode(J){if(!J.ol)J.ol=m6ObjList();if(!J.dec){const srcs=new Set();for(const o of J.ol.list){const m=SPR[o.spr];if(m)srcs.add(m.src);}const ps=[];
      for(const src of srcs){const im=IMG[src];if(im&&im.decode&&!im.__m6d){im.__m6d=1;ps.push(im.decode().catch(()=>{}));}}J.dec={done:false};Promise.all(ps).then(()=>{J.dec.done=true;});setTimeout(()=>{J.dec.done=true;},8000);}
    return J.dec.done;},
  // everything that stands in the valley, in miniature from its own sprite, back to front, a few at a time
  function objs(J,b){const g=J.g,t0=performance.now();if(!J.ol)J.ol=m6ObjList();if(J.oi==null){J.oi=0;J.wait=0;}const L=J.ol.list;
    g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    while(J.oi<L.length){if(!m6DrawObj(g,L[J.oi],1,0,0)){/* (a sprite not loaded yet is waited for, a little) */if((J.wait+=1)<300&&performance.now()-J.t0<25000)return false;}
      J.oi++;if(performance.now()-t0>b)return false;}
    return true;},
  // the old mine: a grey shoulder of rock with a dark timbered mouth
  function mine(J){if(typeof MINE==='undefined'||!(MINE.z<-12))return true;const g=J.g,s=MAPX.s*2.2,X=m6BX(MINE.x),Y=m6BY(MINE.z);
    g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(X,Y+s*.4,s*3.4,s*.7,0,0,6.29);g.fill();g.fillStyle='#5a5650';g.beginPath();g.ellipse(X,Y-s*.6,s*3.2,s*1.9,0,Math.PI,0);g.fill();
    g.fillStyle='#7a766e';g.beginPath();g.ellipse(X-s*.5,Y-s*1.1,s*2.2,s*1.1,0,Math.PI,0);g.fill();g.fillStyle='#14100c';g.beginPath();g.ellipse(X,Y-s*.2,s*1.05,s*1.3,0,Math.PI,0);g.fill();g.fillRect(X-s*1.05,Y-s*.2,s*2.1,s*.5);
    g.fillStyle='#8a5a2a';g.fillRect(X-s*1.25,Y-s*1.5,s*.35,s*1.8);g.fillRect(X+s*.9,Y-s*1.5,s*.35,s*1.8);g.fillRect(X-s*1.35,Y-s*1.65,s*2.7,s*.35);return true;},
  // the map's palette: its own most-used colours (median cut over a sample), so nothing is smeared
  function pal(J,b){if(!M6Q.on)return true;const pad=MAPX.pad,iw=J.W-pad*2,ih=J.H-pad*2,t0=performance.now();if(!J.px){J.px=[];J.pr=0;}
    // a sample of the paper: forty pixels from each of a hundred rows, a few rows a turn
    while(J.pr<100){const y=pad+Math.floor((J.pr+.5)*ih/100),row=J.g.getImageData(pad,y,iw,1).data;for(let t=0;t<40;t++){const o=Math.floor(hash(t*.37,J.pr*1.7)*iw)*4;J.px.push([row[o],row[o+1],row[o+2]]);}
      J.pr++;if(performance.now()-t0>b)return false;}
    J.boxes=[J.px];return true;},
  // (cut in turns: a few boxes each)
  function palCut(J,b){if(!M6Q.on)return true;const t0=performance.now();let boxes=J.boxes;
    while(boxes.length<64){boxes.sort((a,b2)=>b2.length-a.length);const bx=boxes.shift();if(bx.length<2){boxes.push(bx);break;}
      const rng=[0,1,2].map(c=>{let lo=255,hi=0;for(const p of bx){if(p[c]<lo)lo=p[c];if(p[c]>hi)hi=p[c];}return hi-lo;});const c=rng.indexOf(Math.max(...rng));bx.sort((a,b2)=>a[c]-b2[c]);const m=bx.length>>1;boxes.push(bx.slice(0,m),bx.slice(m));
      if(performance.now()-t0>b)return false;}
    J.pal=boxes.filter(x=>x.length).map(bx=>{let r=0,gg=0,bb=0;for(const p of bx){r+=p[0];gg+=p[1];bb+=p[2];}return [Math.round(r/bx.length),Math.round(gg/bx.length),Math.round(bb/bx.length)];});
    // and the inks it must keep exactly: the roads, their edges, the water's rim
    J.pal.push([232,212,164],[90,58,32],[196,222,226]);J.lut=new Int16Array(32768).fill(-1);J.qy=0;J.px=J.boxes=null;return true;},
  function quant(J,b){if(!M6Q.on)return true;const g=J.g,pad=MAPX.pad,W=J.W,H=J.H,P=J.pal,lut=J.lut,t0=performance.now();
    while(J.qy<H-pad){const y0=Math.max(J.qy,pad),y1=Math.min(y0+8,H-pad);const id=g.getImageData(pad,y0,W-pad*2,y1-y0),d=id.data;
      for(let o=0;o<d.length;o+=4){const key=(d[o]>>3)<<10|(d[o+1]>>3)<<5|(d[o+2]>>3);let k=lut[key];
        if(k<0){let bd=1e9;const r=(d[o]>>3)*8+4,gg=(d[o+1]>>3)*8+4,bb=(d[o+2]>>3)*8+4;for(let i=0;i<P.length;i++){const p=P[i],dr=p[0]-r,dg=p[1]-gg,db=p[2]-bb,dd=dr*dr*3+dg*dg*4+db*db*2;if(dd<bd){bd=dd;k=i;}}lut[key]=k;}
        const p=P[k];d[o]=p[0];d[o+1]=p[1];d[o+2]=p[2];}
      g.putImageData(id,pad,y0);J.qy=y1;if(performance.now()-t0>b)break;}
    return J.qy>=H-pad;},
  // the parchment edge: paper round the land, a ruled ink line twice, studs at the corners, a scale along the top and side
  function frame(J){m6Frame0(J.g,J.W,J.H,J.D.FW,J.D.FH);return true;},
  // the paper can be shown from here on; the new fields' own painters follow at the first calm moment, on the same paper
  function publish(J){m6Publish(J);return true;},
  // the Low Fields and the West Fields over the paper, by their own painters (their lanes bend with the land)
  function low(J){if(typeof L35==='undefined'||!L35.built||typeof l35MapPaint!=='function')return true;const lines=L35.lines?L35.lines.slice():null;J.lines=lines;if(lines)L35.lines.length=0;
    try{l35MapPaint(J.c);}catch(e){console.warn('map: low fields',e);}finally{if(lines){L35.lines.length=0;for(const L of lines)L35.lines.push(L);}}M6.dirty=true;return true;},
  function west(J){if(typeof F39==='undefined'||!F39.built||typeof f39MapPaint!=='function')return true;try{f39MapPaint(J.c);}catch(e){console.warn('map: west fields',e);}return true;},
  function westLow(J){if(typeof F39==='undefined'||!F39.built||typeof f39LowMap!=='function')return true;if(!J.ol)J.ol=m6ObjList();
    try{f39LowMap(J.c,(J.low||[]).filter(q=>!(typeof L35!=='undefined'&&L35.roadRefs&&L35.roadRefs.includes(q))),J.ol.hedge,J.lines||[]);}catch(e){console.warn('map: low lanes',e);}return true;},
  function despeck(J){if(typeof F39==='undefined'||!F39.built||typeof f39MapDespeck!=='function')return true;try{f39MapDespeck(J.c,-165,-46,32,180);}catch(e){console.warn('map: despeck',e);}M6.dirty=true;return true;},
  // and their rows cut to the paper's palette again
  function quant2(J,b){if(!M6Q.on||!J.pal)return true;if(J.q2==null)J.q2=Math.max(MAPX.pad,Math.floor(m6BY(-50)));const g=J.g,pad=MAPX.pad,W=J.W,H=J.H,P=J.pal,lut=J.lut,t0=performance.now();
    while(J.q2<H-pad){const y0=J.q2,y1=Math.min(y0+8,H-pad);const id=g.getImageData(pad,y0,W-pad*2,y1-y0),d=id.data;
      for(let o=0;o<d.length;o+=4){const key=(d[o]>>3)<<10|(d[o+1]>>3)<<5|(d[o+2]>>3);let k=lut[key];
        if(k<0){let bd=1e9;const r=(d[o]>>3)*8+4,gg=(d[o+1]>>3)*8+4,bb=(d[o+2]>>3)*8+4;for(let i=0;i<P.length;i++){const p=P[i],dr=p[0]-r,dg=p[1]-gg,db=p[2]-bb,dd=dr*dr*3+dg*dg*4+db*db*2;if(dd<bd){bd=dd;k=i;}}lut[key]=k;}
        const p=P[k];d[o]=p[0];d[o+1]=p[1];d[o+2]=p[2];}
      g.putImageData(id,pad,y0);J.q2=y1;if(performance.now()-t0>b)break;}
    if(J.q2<H-pad)return false;M6.dirty=true;return true;}];
function m6Frame0(g,W,H,FW,FH){const pad=MAPX.pad;const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  R(0,0,W,pad-3,'#d8c08a');R(0,H-pad+3,W,pad-3,'#d8c08a');R(0,0,pad-3,H,'#d8c08a');R(W-pad+3,0,pad-3,H,'#d8c08a');
  for(let i=0;i<2200;i++){const x=Math.floor(hash(i*.7,1.3)*W),y=Math.floor(hash(2.9,i*.53)*H);if(x>pad-8&&x<W-pad+8&&y>pad-8&&y<H-pad+8)continue;R(x,y,2,2,hash(i,7)<.5?'#c4a874':'#e6d4a4');}
  R(pad-3,pad-3,FW+6,2,'#3a2210');R(pad-3,pad+FH+1,FW+6,2,'#3a2210');R(pad-3,pad-3,2,FH+6,'#3a2210');R(pad+FW+1,pad-3,2,FH+6,'#3a2210');
  R(pad-9,pad-9,FW+18,1,'#6a4a2a');R(pad-9,pad+FH+8,FW+18,1,'#6a4a2a');R(pad-9,pad-9,1,FH+18,'#6a4a2a');R(pad+FW+8,pad-9,1,FH+18,'#6a4a2a');
  for(const [cx,cy] of [[pad-9,pad-9],[W-pad+8,pad-9],[pad-9,H-pad+8],[W-pad+8,H-pad+8]]){R(cx-3,cy-3,7,7,'#3a2210');R(cx-2,cy-2,5,5,'#a8743a');R(cx-1,cy-1,2,2,'#e8c890');}
  for(let x=pad;x<W-pad;x+=MAPX.s*10)R(x,pad-7,1,3,'#3a2210');for(let y=pad;y<H-pad;y+=MAPX.s*10)R(pad-7,y,3,1,'#3a2210');}
function m6NewJob(){const D=mapTerrDims(),pad=MAPX.pad;return {D,W:D.FW+pad*2,H:D.FH+pad*2,step:0,sig:m6Sig(),t0:performance.now(),cpu:0,slices:0,steps:{},maxSlice:0,playMax:0};}
function m6Calm(){try{return typeof S==='undefined'||S.mode!=='play'||!!S.paused;}catch(e){return true;}}
// run the job for up to b ms; a whole step waits for a calm moment unless forced (the map is open). True when the paper is finished
function m6Run(b,force){const J=M6.job;if(!J)return true;const t0=performance.now();const calm=force||m6Calm();
  // (a step that runs whole never lands in play, nor in the map's first moments: with the map open it waits until the map has sat still a while)
  const bigOk=force?(M6.still||0)>1.5:calm&&!M6.on;
  try{while(J.step<M6STEPS.length){const left=b-(performance.now()-t0);if(left<=0)break;const fn=M6STEPS[J.step],nm=fn.name;if(M6BIG.has(nm)&&!bigOk)break;
      const s0=performance.now();const done=fn(J,Math.max(.5,left));const sd=performance.now()-s0;J.steps[nm]=(J.steps[nm]||0)+sd;if(!calm||force){J.smax=J.smax||{};if(sd>(J.smax[nm]||0))J.smax[nm]=Math.round(sd*10)/10;}if(done)J.step++;else break;}}
  catch(e){console.warn('map paper',J.step,e);J.step=M6STEPS.length;}
  const dt=performance.now()-t0;J.cpu+=dt;J.slices++;if(dt>J.maxSlice)J.maxSlice=dt;if(!calm&&dt>J.playMax)J.playMax=dt;
  if(J.step>=M6STEPS.length&&J.c){m6Done(J);return true;}if(J.step>=M6STEPS.length){M6.job=null;return true;}return false;}
function m6Publish(J){M6.base=J.c;M6.smp=J.sm||null;M6.olist=J.ol?J.ol.list:null;M6.roads=J.roads||null;M6.sig=J.sig;M6.ready=true;M6.quick=null;M6.from=J.from||'';M6.pubAt=Math.round(performance.now()-J.t0);
  MAPX.cv=J.c;M6T.map.clear();M6T.q.length=0;M6.oidx=null;M6.dirty=true;M6.layN=-1;if(M6.on)m6Kick();else m6Warm();}
function m6Done(J){M6.job=null;if(M6.base!==J.c)m6Publish(J);M6.done=true;
  M6.stat={cpu:Math.round(J.cpu),wall:Math.round(performance.now()-J.t0),shownAfter:M6.pubAt,slices:J.slices,maxSlice:Math.round(J.maxSlice),playMaxSlice:Math.round(J.playMax*10)/10,playStepMax:J.smax||{},steps:Object.fromEntries(Object.entries(J.steps).map(([k,v])=>[k,Math.round(v)]))};
  M6.dirty=true;if(M6.on)m6Kick();
  // kept for the next visit
  try{if(J.c.toBlob)J.c.toBlob(bl=>{if(bl)m6Put('base',{sig:J.sig,blob:bl,w:J.W,h:J.H});},'image/png');if(J.sm)m6Put('smp',{sig:J.sig,W:J.sm.W,H:J.sm.H,col:J.sm.col});}catch(e){}}
// the first open shouldn't pay for anything that can be done before it: places, name tags, the road graph, your goal's way
function m6Warm(){const go=()=>{try{const dp=Math.min(3,window.devicePixelRatio||1);const was=[M6.dpr,M6.cw];M6.dpr=dp;M6.places=m6Places();const sc=m6Scale();M6.ver++;const L=m6Items(sc);
    for(const it of L)if(it.tag)void it.tag;if(typeof rgnBuild==='function'&&!RGN.built)rgnBuild();const g=m6Goal();if(g)m6Route(g);for(const k of ['shop','house','you','star','pin','door','head','bus','train','mile'])m6Ic(k,sc.ic);
    if(!M6.on){M6.dpr=was[0];M6.cw=was[1];}}catch(e){}};if(window.requestIdleCallback)requestIdleCallback(go,{timeout:2000});else setTimeout(go,200);}
// the slices: on the title, in a scene or a menu, steady 12 ms turns between frames; in play only in the browser's idle moments,
// 4 ms asked for (3 when the browser has none to give; a piece of work may run a little over), never a step that can't be cut up
function m6Sched(){if(M6.idleQ||!M6.job||M6.on)return;M6.idleQ=1;   /* (with the map open, its own frames carry on the work) */
  if(m6Calm()){setTimeout(()=>{M6.idleQ=0;if(!M6.job)return;if(!m6Run(12))m6Sched();},0);return;}
  const go=dl=>{M6.idleQ=0;if(!M6.job)return;const b=dl&&dl.timeRemaining&&!dl.didTimeout?Math.max(2,Math.min(4,dl.timeRemaining()-1)):3;if(!m6Run(b))m6Sched();};
  if(window.requestIdleCallback)requestIdleCallback(go,{timeout:80});else setTimeout(go,30);}
function m6Start(){if(M6.job||M6.loading)return;const sig=m6Sig();if(M6.ready&&sig===M6.sig)return;M6.job=m6NewJob();m6Sched();}
// at first: the paper kept from last time, if it shows the same valley; otherwise the slices begin
function m6Blob(rec){return createImageBitmap(rec.blob).then(bm=>{const c=document.createElement('canvas');c.width=bm.width;c.height=bm.height;c.getContext('2d').drawImage(bm,0,0);if(bm.close)bm.close();return c;});}
function m6Boot(){if(M6.booted)return;M6.booted=true;M6.loading=true;const sig=m6Sig();m6Warm();
  Promise.all([m6Get('base'),m6Get('terr'),m6Get('smp')]).then(([rec,ter,sm])=>{M6.idbTerr=ter;
    if(rec&&rec.sig===sig&&rec.blob&&window.createImageBitmap)return m6Blob(rec).then(c=>{
      if(!M6.ready){M6.base=c;if(sm&&sm.sig===sig&&sm.col){const T=m6T();m6TerrShip(T);if(T.cls&&T.cls.length===sm.W*sm.H)M6.smp={W:sm.W,H:sm.H,cls:T.cls,col:sm.col};}M6.sig=sig;M6.ready=true;M6.from='kept';M6.stat={kept:1};MAPX.cv=c;M6.dirty=true;m6Warm();}});}).catch(()=>{}).then(()=>{M6.loading=false;m6Start();});}
setInterval(()=>{try{if(typeof S==='undefined'||!S.mode||S.mode==='loading'||typeof OBJ==='undefined'||OBJ.length<1000)return;if(!M6.booted){m6Boot();return;}
  if(!M6.job&&!M6.loading&&!M6.on&&((M6.sigT=(M6.sigT||0)+1)%20===0))m6Start();if(M6.ready&&!MAPX.cv)MAPX.cv=M6.base;if(M6.job)m6Sched();}catch(e){}},250);
// ---- opened before the paper is finished (straight from the title on a slow phone): a plainer map at once, from what's ready
// (the ground's kinds in flat colours, the roads, the buildings), and the finished paper takes its place, in place, as it's done
function m6Quick(){const D=mapTerrDims(),pad=MAPX.pad,W=D.FW+pad*2,H=D.FH+pad*2;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#d8c08a';g.fillRect(0,0,W,H);
  const T=m6T();m6TerrShip(T);
  if(T.ph>=3&&T.img){const tc=document.createElement('canvas');tc.width=T.D.W;tc.height=T.D.H;tc.getContext('2d').putImageData(T.img,0,0);g.imageSmoothingEnabled=false;g.drawImage(tc,pad,pad,D.FW,D.FH);}
  else if(T.ph>=1){const id=new ImageData(T.D.W,T.D.H),d=id.data,C=[[112,142,70],[64,112,150],[140,136,128],[188,152,98],[40,66,38]];for(let i=0;i<T.cls.length;i++){const q=C[T.cls[i]]||C[0];d[i*4]=q[0];d[i*4+1]=q[1];d[i*4+2]=q[2];d[i*4+3]=255;}
    const tc=document.createElement('canvas');tc.width=T.D.W;tc.height=T.D.H;tc.getContext('2d').putImageData(id,0,0);g.imageSmoothingEnabled=false;g.drawImage(tc,pad,pad,D.FW,D.FH);}
  const s=MAPX.s;g.lineCap='round';for(const pass of [0,1])for(const [x0,z0,x1,z1,w] of m6RoadList().list){g.beginPath();g.moveTo(m6BX(x0),m6BY(z0));g.lineTo(m6BX(x1),m6BY(z1));g.strokeStyle=pass?'#e8d4a4':'#5a3a20';g.lineWidth=pass?w*s*.9:w*s*.9+3;g.stroke();}
  g.imageSmoothingEnabled=true;for(const o of OBJ){if(o.kind!=='bld'||o.room||o.hide||o.x>=250)continue;m6DrawObj(g,o,1,0,0,true);}
  m6Frame0(g,W,H,D.FW,D.FH);return c;}
function m6Need(){if(M6.ready)return true;if(!M6.quick)M6.quick=m6Quick();if(!M6.job)M6.job=m6NewJob();return false;}

// ---- close up: once the paper is enlarged past about two and a half times, tiles of the bare ground with the roads and every
// building and tree drawn sharp from their own sprites at that size; made lazily, a few each frame, kept (the last 60)
const M6T={map:new Map(),q:[],T:256};
function m6TileLevel(){const s=M6.v.k*M6.dpr;return !M6.smp?0:s>=5.5?8:s>=3?4:0;}
function m6OIdx(){if(M6.oidx)return M6.oidx;const L=M6.olist||(M6.olist=m6ObjList().list);const idx=new Map();L.forEach((o,i)=>{const k=Math.floor(m6BX(o.x)/48)+','+Math.floor(m6BY(o.z)/48);let a=idx.get(k);if(!a)idx.set(k,a=[]);a.push(i);});return M6.oidx=idx;}
function m6TileMake(t){const T=M6T.T,f=t.f,span=T/f,ox=t.tx*span,oy=t.ty*span;const c=document.createElement('canvas');c.width=T;c.height=T;const g=c.getContext('2d');
  // the ground at this size: at each pixel, the kind the four samples round it lean to most, in that kind's own colour there
  {const Sm=M6.smp,SW=Sm.W,SH=Sm.H,cls=Sm.cls,col=Sm.col,pad=MAPX.pad,id=g.createImageData(T,T),d=id.data;const W4=[0,0,0,0],K4=[0,0,0,0],I4=[0,0,0,0];
    for(let py=0;py<T;py++){const v=(oy+(py+.5)/f-pad)/2-.5;let j0=Math.floor(v);const fy=v-j0;const ja=clamp(j0,0,SH-1),jb=clamp(j0+1,0,SH-1);
      for(let px=0;px<T;px++){const o=(py*T+px)*4;const u=(ox+(px+.5)/f-pad)/2-.5;if(u<-1||v<-1||u>SW||v>SH){d[o]=216;d[o+1]=192;d[o+2]=138;d[o+3]=255;continue;}
        const i0=Math.floor(u),fx=u-i0,ia=clamp(i0,0,SW-1),ib=clamp(i0+1,0,SW-1);I4[0]=ja*SW+ia;I4[1]=ja*SW+ib;I4[2]=jb*SW+ia;I4[3]=jb*SW+ib;W4[0]=(1-fx)*(1-fy);W4[1]=fx*(1-fy);W4[2]=(1-fx)*fy;W4[3]=fx*fy;
        for(let n=0;n<4;n++)K4[n]=cls[I4[n]];let best=K4[0],bw=-1;for(let n=0;n<4;n++){let w=0;for(let m=0;m<4;m++)if(K4[m]===K4[n])w+=W4[m];if(w>bw){bw=w;best=K4[n];}}
        let r=0,gg=0,bb=0,ws=0;for(let n=0;n<4;n++){if(K4[n]!==best)continue;const q=I4[n]*3,w=W4[n]+1e-4;r+=col[q]*w;gg+=col[q+1]*w;bb+=col[q+2]*w;ws+=w;}
        d[o]=r/ws;d[o+1]=gg/ws;d[o+2]=bb/ws;d[o+3]=255;}}
    g.putImageData(id,0,0);}
  // the roads, sharp at this size
  const s=MAPX.s;g.save();g.setTransform(f,0,0,f,-ox*f,-oy*f);g.lineCap='round';const RL=M6.roads||(M6.roads=m6RoadList().list);
  for(const pass of [0,1])for(const [x0,z0,x1,z1,w] of RL){const X0=m6BX(x0),Y0=m6BY(z0),X1=m6BX(x1),Y1=m6BY(z1);if(Math.max(X0,X1)<ox-20||Math.min(X0,X1)>ox+span+20||Math.max(Y0,Y1)<oy-20||Math.min(Y0,Y1)>oy+span+20)continue;
    g.beginPath();g.moveTo(X0,Y0);g.lineTo(X1,Y1);g.strokeStyle=pass?'#e8d4a4':'#5a3a20';g.lineWidth=pass?w*s*.9:w*s*.9+3/f*2;g.stroke();}g.restore();
  // what stands there (and what stands close enough to lean in), back to front
  const idx=m6OIdx(),L=M6.olist,c0=Math.floor(ox/48)-2,c1=Math.floor((ox+span)/48)+2,r0=Math.floor(oy/48)-1,r1=Math.floor((oy+span)/48)+4,ids=[];
  for(let cy=r0;cy<=r1;cy++)for(let cx=c0;cx<=c1;cx++){const a=idx.get(cx+','+cy);if(a)for(const i of a)ids.push(i);}ids.sort((a,b)=>a-b);
  for(const i of ids)m6DrawObj(g,L[i],f,ox,oy);
  t.c=c;t.done=true;}
function m6TilesWork(b){const t0=performance.now();let n=0;while(M6T.q.length&&performance.now()-t0<b){const t=M6T.q.shift();if(t.done||!M6.smp)continue;try{m6TileMake(t);}catch(e){t.done=true;}n++;}
  if(M6T.map.size>60){const keys=[...M6T.map.keys()];for(const k of keys.slice(0,M6T.map.size-60)){const t=M6T.map.get(k);if(t&&!t.vis)M6T.map.delete(k);}}return n;}

// ================================================================ 2. the pixel pictures: icons, arrows, the people's heads
// each icon is an 11 x 11 grid, light from the top left, an outline in the dark of its own colour
const M6PAL={k:'#24140a',w:'#f4e6c8',p:'#e0c890',r:'#b8402a',R:'#e06a48',d:'#7a2a1a',b:'#5a3418',B:'#8a5a2e',l:'#c89058',g:'#4e7a34',G:'#7aa84a',
  s:'#6c7078',S:'#a8acb4',y:'#d8a030',Y:'#f4d070',u:'#3a6a9a',U:'#78a8d0',c:'#2b4434',C:'#5e8259',m:'#7c3530',M:'#b05a4a',v:'#6a4a8a',V:'#a888c8',o:'#c87830',O:'#f0a850',n:'#2a2a30',N:'#4a4a58',t:'#94886c',T:'#c8bc98'};
const M6ICON={
  shop:['...kkkkk...','..kRrRrRk..','.kRrRrRrRk.','kkkkkkkkkkk','.kpppppppk.','.kpkkpkkpk.','.kpkUpkBpk.','.kpkkpkBpk.','.kpppkBBpk.','.kkkkkkkkk.','...........'],
  house:['.....k.....','....kRk....','...kRRrk...','..kRRrrrk..','.kRRrrrrrk.','kkkkkkkkkkk','.kpppppppk.','.kpkkpbbpk.','.kpkUpbbpk.','.kpppkbbpk.','.kkkkkkkkk.'],
  farm:['....kkk....','...kRRRk...','..kRRrRrk..','.kRRRrrrrk.','kkkkkkkkkkk','.kRRRRRRRk.','.kRkwkwkRk.','.kRwkkkwRk.','.kRkwkwkRk.','.kRRRRRRRk.','.kkkkkkkkk.'],
  church:['.....k.....','....kYk....','.....k.....','....kpk....','...kpppk...','..kkkkkkk..','.kpppppppk.','.kppkBkppk.','.kppkBkppk.','.kppkBkppk.','.kkkkkkkkk.'],
  grave:['...........','...kkkkk...','..kSSSSsk..','..kSkkSsk..','..kSSSSsk..','..kSkkSsk..','..kSSSSsk..','..kSSSSsk..','.kkkkkkkkk.','.kGGGgGGgk.','.kkkkkkkkk.'],
  forge:['...........','...........','.kkkkkkkkk.','kSSSSSSSSsk','kssssssssk.','.kkSSSskk..','...kSsk....','..kSSSsk...','.kkkkkkkk..','.kNNNNNNk..','.kkkkkkkk..'],
  bait:['...........','.....kk....','....kUUk...','..kkUUUUk.k','.kUUwUUUUkk','kUUkUUUUUUk','.kUUUUUUkkk','..kkUUUUk.k','....kUUk...','.....kk....','...........'],
  feed:['...kkkkk...','..kTTTTTk..','.kTTtTTtTk.','.kTTTTTTTk.','.kkkkkkkkk.','.kTtTTTtTk.','.kTTTTTTTk.','.kTTtTTtTk.','.kTTTTTTTk.','..kkkkkkk..','...........'],
  carp:['...........','..kk.......','.kSSk......','.kSSsk.....','..kssBk....','....kBBk...','.....kBBk..','......kBBk.','.......kBk.','........kk.','...........'],
  inn:['....kkk....','...kYYYk...','..kYOYOYk..','...kYYYk...','..kkkkkkk..','.kBBBBBBBk.','.kBlllllBk.','.kBlkllkBk.','.kBlllllBk.','.kBBBBBBBk.','.kkkkkkkkk.'],
  tavern:['...........','..kkkkkk...','.kwwwwwwk..','.kYYYYYYkkk','.kOYYYYYk.k','.kOYYYYYk.k','.kOYYYYYkkk','.kOOYYYYk..','.kkkkkkkk..','..........','...........'],
  post:['...........','...........','kkkkkkkkkkk','kwkpppppkwk','kpwkpppkwpk','kppwkpkwppk','kpppwkwpppk','kppppwppppk','kpppppppppk','kkkkkkkkkkk','...........'],
  hall:['.....k.....','...kkYkk...','..kpppppk..','.kkkkkkkkk.','.kpkpkpkpk.','.kpkpkpkpk.','.kpkpkpkpk.','.kpkpkpkpk.','kkkkkkkkkkk','kpppppppppk','kkkkkkkkkkk'],
  school:['....kYk....','....kYk....','....kkk....','...kRRRk...','..kRRRRRk..','.kRRRRRRRk.','kkkkkkkkkkk','.kpUpkpUpk.','.kpUpBpUpk.','.kpppBpppk.','.kkkkkkkkk.'],
  garage:['...........','.kk.....kk.','kSSk...kSSk','kSSsk.kSSsk','.kssk.kssk.','..kSkkkSk..','...kSSSk...','...kSssk...','..kSsk.....','..kSk......','...k.......'],
  fuel:['...........','..kkkkkk...','.kRRRRRRk..','.kRwwwwRk.k','.kRwkkwRkkk','.kRRRRRRk.k','.kRRRRRRk.k','.kRRRRRRkkk','.kRRRRRRk..','kkkkkkkkkk.','...........'],
  mine:['...........','....kkk....','..kkSSSkk..','.kSSSSSSsk.','.kSkkkkksk.','kSkBkkkBksk','kSkBkkkBksk','kskBkkkBksk','kkkkkkkkkkk','...........','...........'],
  bridge:['...........','...........','...........','.kk.....kk.','kBBkkkkkBBk','kBlllllllBk','kkBkkkkkBkk','.kBkUUUkBk.','.kBUUUUUBk.','..kkkkkkk..','...........'],
  water:['...........','...........','.kk..kk..kk','kUUkkUUkkUk','.kk..kk..kk','...........','.kk..kk..kk','kUUkkUUkkUk','.kk..kk..kk','...........','...........'],
  mill:['....k.k....','...kBkBk...','..k.kBk.k..','.kBkBBBkBk.','..k.kBk.k..','...kBkBk...','...kkpkk...','..kpppppk..','..kpkBkpk..','..kpkBkpk..','..kkkkkkk..'],
  orchard:['...kkkkk...','..kGGgGGk..','.kGRGGGRgk.','.kGGGgGGGk.','.kgGRGGgRk.','..kGGGgGk..','...kkBkk...','....kBk....','....kBk....','...kkBkk...','...........'],
  quarry:['...........','...........','....kkk....','...kSSSk...','..kSSssSkk.','.kkSsssskSk','kSSkSsskSSk','kSSSkkkSSsk','kssssssssk.','.kkkkkkkk..','...........'],
  woods:['....kkk....','...kGGGk...','..kGGgGGk..','..kGgGGgk..','.kGGGgGGGk.','.kgGGGGgGk.','..kkGgGkk..','....kBk....','....kBk....','...kkkkk...','...........'],
  corn:['....kYk....','...kYYk....','...kYYk.k..','..kYYYkkYk.','..kYYYkYYk.','..kYYYkYYk.','.k.kYkkYYk.','kGk.kGkYk..','.kGkkGkk...','..kGGGk....','...kkk.....'],
  car:['...........','...........','...kkkkk...','..kRUUURk..','.kRRUUURRk.','kRRRRRRRRRk','kRRRRRRRRRk','kkNNkkkNNkk','.kNNk.kNNk.','..kk...kk..','...........'],
  cross:['...........','....kkk....','....kBk....','.kkkkBkkkk.','.kpppBpppk.','.kkkkBkkkk.','....kBk....','....kBk....','....kBk....','...kkkkk...','...........'],
  green:['...........','....kkk....','...kGGGk...','..kGGgGGk..','..kGgGGGk..','...kGGGk...','....kBk....','.kkkkBkkkk.','.kGGGGGGGk.','.kkkkkkkkk.','...........'],
  house2:['.....k.....','....kmk....','...kmmMk...','..kmmMMMk..','.kmmMMMMMk.','kkkkkkkkkkk','.kTTTTTTTk.','.kTkkTnnTk.','.kTkNTnnTk.','.kTTTknnTk.','.kkkkkkkkk.'],
  ferry:['...........','.....k.....','....kwk....','....kwwk...','....kwwwk..','....kBkkk..','.kkkkBkkkkk','.kBBBBBBBk.','..kBBBBBk..','.kUUkkkUUk.','..UU...UU..'],
  bus:['...........','.kkkkkkkkk.','kCCCCCCCCCk','kCUUkUUkUUk','kCUUkUUkUUk','kCCCCCCCCCk','kTTTTTTTTTk','kCCCCCCCCCk','kkNkkkkkNkk','.kNk...kNk.','..k.....k..'],
  train:['..kkk......','..kNk......','.kkNkkkkkk.','.kNNNkUUUk.','.kNNNkUUUk.','kNNNNNNNNNk','kmmmmmmmmmk','kNNNNNNNNNk','kkSkkSkkSkk','.kSk.kSk.k.','..k...k....'],
  mile:['...........','...kkkkk...','..kSSSSsk..','..kSkkkSk..','..kSkSkSk..','..kSkkkSk..','..kSSSSsk..','..kSSSSsk..','.kkSSSSskk.','kGGkkkkkGGk','.kkkkkkkkk.'],
  found:['...........','..k........','..kkkk.....','..kRRRkk...','..kRRRRRk..','..kRRRRkk..','..kRkkk....','..kk.......','..k........','.kkk.......','...........'],
  star:['.....k.....','....kYk....','....kYk....','.kkkkYYkkk.','.kYYYYYYOk.','..kYYYYOk..','...kYYYOk..','..kYYkkOOk.','..kYk..kOk.','..kk....kk.','...........'],
  pin:['...kkkkk...','..kVVVVvk..','.kVVwwVVvk.','.kVwVVVVvk.','.kVVVVVVvk.','..kVVVVvk..','...kVVvk...','....kvk....','....kvk....','.....k.....','...........'],
  head:['...kkkkk...','..kBBBBBk..','.kBBBBBBBk.','.kBpppppBk.','.kpkpppkpk.','.kpppppppk.','..kpp.ppk..','...kkkkk...','..kTTTTTk..','.kTTTTTTTk.','.kkkkkkkkk.'],
  you:['...........','...........','...........','.kk........','.kRRkk.....','.kRwRRRkk..','..kRRRRRRk.','.kRRRRRkk..','.kRRkk.....','.kk........','...........'],
  door:['...........','...kkkkk...','..kBBBBBk..','.kBBkkkBBk.','.kBkYYYkBk.','.kBkYYYkBk.','.kBkYYYkBk.','.kBkYYYYBk.','.kBkYYYkBk.','.kkkkkkkkkk','...........']};
const M6IC_C={};
function m6Ic(name,n,tint){const key=name+'|'+n+'|'+(tint||'');if(M6IC_C[key])return M6IC_C[key];const G=M6ICON[name]||M6ICON.shop;const c=document.createElement('canvas');c.width=11*n;c.height=11*n;const g=c.getContext('2d');
  for(let y=0;y<11;y++)for(let x=0;x<11;x++){const ch=G[y][x];if(ch==='.')continue;let col=M6PAL[ch];if(tint&&ch!=='k'&&ch!=='w')col=tint[ch===ch.toUpperCase()?0:1]||col;if(!col)continue;g.fillStyle=col;g.fillRect(x*n,y*n,n,n);}
  return M6IC_C[key]=c;}
// your arrow in eight directions: drawn east and north-east, the rest are turns and mirrors of those (exact for pixels)
const M6ARR={E:['...........','...........','...kk......','...kRkk....','...kwRRkk..','kkkkRRRRRk.','kRRRRRRRRRk','kkkkRRRRRk.','...kRRRkk..','...kRkk....','...kk......'],
  NE:['...........','.....kkkkkk','......kwRRk','.......kRRk','......kRRRk','.....kRRkRk','....kRRk.kk','...kRRk....','..kRRk.....','.kRRk......','.kkk.......']};
function m6ArrGrid(dir){const rot=G=>G[0].split('').map((_,x)=>G.map(r=>r[x]).reverse().join(''));const flipH=G=>G.map(r=>r.split('').reverse().join(''));
  let G;if(dir==='E')G=M6ARR.E;else if(dir==='S')G=rot(M6ARR.E);else if(dir==='W')G=flipH(M6ARR.E);else if(dir==='N')G=rot(rot(rot(M6ARR.E)));
  else if(dir==='NE')G=M6ARR.NE;else if(dir==='SE')G=rot(M6ARR.NE);else if(dir==='SW')G=rot(rot(M6ARR.NE));else G=rot(rot(rot(M6ARR.NE)));return G;}
const M6ARR_C={};
function m6Arr(dir,n,col){const key=dir+n+col;if(M6ARR_C[key])return M6ARR_C[key];const G=m6ArrGrid(dir);const c=document.createElement('canvas');c.width=11*n;c.height=11*n;const g=c.getContext('2d');
  const C=col==='blue'?{R:'#3a8ad8',w:'#c8e4f8'}:col==='ghost'?{R:'#3a3a40',w:'#6a6a72'}:{R:'#d8382a',w:'#ffd0b8'};
  for(let y=0;y<11;y++)for(let x=0;x<11;x++){const ch=G[y][x];if(ch==='.')continue;g.fillStyle=ch==='k'?'#24140a':C[ch]||C.R;g.fillRect(x*n,y*n,n,n);}return M6ARR_C[key]=c;}
const m6Dir8=(fx,fz)=>{const a=Math.atan2(fz,fx);const i=((Math.round(a/(Math.PI/4))%8)+8)%8;return ['E','SE','S','SW','W','NW','N','NE'][i];};
// a person's head, cut from their own sprite (facing you), on a paper disc
const M6HEAD_C={};
function m6Head(id,n){const key=id+'|'+n;if(M6HEAD_C[key])return M6HEAD_C[key];const m=SPR[id],im=m&&IMG[m.src];if(!im||!m.clips||!(im.naturalWidth||im.width))return null;
  const cl=m.clips.idle||m.clips.walk;const r=(cl.S||Object.values(cl)[0])[0];const S0=16,c=document.createElement('canvas');c.width=c.height=(S0+4)*n;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x*n,y*n,w*n,h*n);};const D=S0+4;
  for(let y=0;y<D;y++)for(let x=0;x<D;x++){const d=Math.hypot(x+.5-D/2,y+.5-D/2);if(d<D/2-.2)R(x,y,1,1,d>D/2-1.4?'#24140a':'#ecdcb2');}
  g.save();g.beginPath();g.arc(D/2*n,D/2*n,(D/2-1.4)*n,0,Math.PI*2);g.clip();g.drawImage(im,(m.fw-S0)/2,r*m.fh+(m.fh>=64?12:6),S0,S0,2*n,3*n,S0*n,S0*n);g.restore();
  return M6HEAD_C[key]=c;}

// ================================================================ 3. what's on the map, and what each place is
const M6KIND={'Hollow Acre':['farm','Your farm','Grandpa’s cabin, the field, the well and the shipping bin.'],'Marrow Hollow':['green','The town',''],'Market Lane':['shop','A street of shops',''],
  'Church':['church','Marrow Hollow Church','Sunday service at half past seven. The bell rings at eight every night.'],'Graveyard':['grave','The churchyard',''],'Route 9':['cross','The county road',''],
  'Pruitt’s Garage':['garage','Mechanic','Hollis fixes what can be fixed. The car parts are his to sell.'],'The pond':['water','Fishing','Otto fishes here from his dock.'],'Covered bridge':['bridge','Bridge',''],
  'The corn':['corn','Grandpa’s corn','Don’t be out in the corn after the bell.'],'Hollow Woods':['woods','Woods',''],'The quarry':['quarry','Stone and ore','Maud runs the quarry.'],'Black Lake':['water','Fishing',''],
  'Gas station':['fuel','Gas and a cold drink','Corwin never closes, never leaves.'],'Quill Orchard':['orchard','Apples','The Quills keep the orchard.'],'The Marsh place':['house2','An empty house',''],
  'Old mill':['mill','The mill','Abel grinds the flour.'],'The river':['water','Fishing',''],'Tithe House':['house2','A house nobody visits',''],'Mill Road':['cross','A road',''],'Wickham Crossing':['green','A village',''],
  'Lantern Inn':['inn','Inn and kitchen','Tess keeps the inn: Hob’s pie, a room for the night after five.'],'Ferry':['ferry','The river ferry','Nan poles it across. Never back.'],'Wickham Road':['cross','A road',''],
  'Crossroads':['cross','Crossroads','The peddler comes after half past seven.'],'Coyle’s store':['shop','General store','Seeds, food, tools and a bigger backpack.'],'Old mine':['mine','The old Marrow mine','Ore, coal and stone, deeper down.'],
  'Your car':['car','Your wreck','Where you came off the road.'],'Footbridge':['bridge','Footbridge',''],'Hartley Carpentry':['carp','Carpenter','Nell sells planks, furniture and plans.'],
  'Forge':['forge','Blacksmith','Gideon sells and upgrades tools.'],'Bait & Tackle':['bait','Fishing shop','Otto sells bait, rods and tackle in the afternoons.'],'Feed & Stock':['feed','Animals and feed','Ezra sells feed, animals and their gear.'],
  'Town hall':['hall','Town hall','The land office keeps the deeds and the county’s papers.'],'Post office':['post','Post office','June’s rooms are upstairs.'],'Schoolhouse':['school','Schoolhouse','Miss Vance teaches here.'],
  'The green':['green','The town green','The square for markets and festivals.'],'The Lamplighter':['tavern','Tavern','Friday nights, most of the town is here.']};
// who keeps which place, their hours, and what is sold
const M6SHOP={'Coyle’s store':{who:['mae','pip'],open:7,close:18},'Pruitt’s Garage':{who:['hollis','wes'],open:7,close:18},'Forge':{who:['gideon'],open:7,close:18.5},
  'Hartley Carpentry':{who:['nell'],open:7,close:18.5},'Feed & Stock':{who:['ezra'],open:7,close:18.5},'Bait & Tackle':{who:['otto'],open:7,close:18.5},
  'Lantern Inn':{who:['tess','hob'],open:7,close:21},'Gas station':{who:['corwin'],open:0,close:24},'Post office':{who:['june'],open:7.5,close:17},'Town hall':{open:8,close:17},
  'The Lamplighter':{open:12,close:20},'Church':{who:['hale','ida'],open:7,close:20},'Schoolhouse':{who:['cora'],open:7.8,close:16},'Old mill':{who:['abel'],open:5.5,close:18},'The quarry':{who:['maud'],open:6,close:18}};
const M6PRI={farm:700,shop:640,inn:620,tavern:600,forge:630,carp:630,feed:630,bait:630,garage:630,fuel:600,church:610,hall:600,post:600,school:560,green:520,mine:540,grave:500,car:520,cross:420,bridge:380,
  water:400,mill:520,orchard:500,quarry:520,woods:360,corn:450,house2:470,ferry:480};
// the hour on the clock, the way the game says it
function m6Time(h){h=((h%24)+24)%24;const hh=Math.floor(h),mm=Math.round((h-hh)*60)%60;const ap=hh>=12?'pm':'am';return `${((hh+11)%12)+1}${mm?':'+String(mm).padStart(2,'0'):''} ${ap}`;}
const m6Night=()=>{try{return isNight()||S.hour>=20;}catch(e){return false;}};
function m6Open(sh){if(!sh||sh.open==null)return null;if(sh.open===0&&sh.close===24)return true;return S.hour>=sh.open&&S.hour<sh.close&&!(m6Night()&&sh.close<=20);}
// the static places: names, kinds and where they are; rebuilt when the paper is (the town grows) or the list changes
function m6Places(){const L=[];const seen=new Set();try{mapPlacesLive();}catch(e){}
  const add=(o)=>{if(seen.has(o.id))return;seen.add(o.id);L.push(o);};
  for(const [n,x,z] of MAP_PLACES){if(!isFinite(x)||!isFinite(z))continue;const K=M6KIND[n]||['house','',''];const nn=n.toLowerCase().replace(/^the /,'');
    const dupRegion=REGIONS.some(r=>r[0].toLowerCase().replace(/^the /,'')===nn);add({id:'p:'+n,t:'place',name:n,x,z,icon:K[0],sub:K[1],say:K[2],pri:(M6PRI[K[0]]||400)+(M6SHOP[n]?20:0),minK:dupRegion?9:(M6SHOP[n]||/farm|church|green/.test(K[0])?0:.75),shop:M6SHOP[n]||null});}
  try{if(typeof PL!=='undefined'&&PL.tavern)add({id:'p:The Lamplighter',t:'place',name:'The Lamplighter',x:PL.tavern[0],z:PL.tavern[1]-1.2,icon:'tavern',sub:'Tavern',say:M6KIND['The Lamplighter'][2],pri:600,minK:.75,shop:M6SHOP['The Lamplighter']});}catch(e){}
  // homes: who lives there (shown closer in)
  try{for(const [k,h] of Object.entries(HOMES)){if(!h.door||k==='farm')continue;const [x,z]=h.door;if(L.some(p=>p.t==='place'&&Math.hypot(p.x-x,p.z-z)<5))continue;
    add({id:'h:'+k,t:'home',name:h.name.replace(/^the /,'The '),x,z:z-1.4,icon:'house',sub:'A home',home:k,pri:300,minK:1.5});}}catch(e){}
  // regions: their names, and whether you've found them
  for(const [n,x,z] of REGIONS){const rk=m6RegionKey(n);add({id:'r:'+n,t:'region',name:n,x,z,pri:250,minK:0,maxK:3.2,rk});}
  return L;}
function m6RegionKey(n){try{if(typeof REGS==='undefined')return null;const nn=n.toLowerCase();const r=REGS.find(q=>q.name.toLowerCase()===nn||q.name.toLowerCase().replace(/^the /,'')===nn.replace(/^the /,''));return r?r.k:null;}catch(e){return null;}}
const m6Found=k=>!!(k&&S.rg&&S.rg.seen&&S.rg.seen[k]);
// the people who live at a home, and who work at a place
function m6Residents(homeKey){try{return npcs.filter(n=>LIFE[n.def.id]&&LIFE[n.def.id].home===homeKey&&PEOPLE[n.def.id]);}catch(e){return [];}}
function m6Met(id){return !!(S.talked&&S.talked[id]);}
function m6Who(n){return m6Met(n.def.id)?n.def.name:'someone you haven’t met';}
// the live things: you, friends, your goal, people, the bus and train, milestones, pins
function m6You(){let x=P.x,z=P.z,inside=null;const R=typeof roomOf==='function'&&roomOf();if(R&&R.out){x=R.out.x;z=R.out.z;inside=R.name||'a building';}return {x,z,inside};}
function m6Goal(){if(!M6L.goal)return null;try{const ob=typeof objective==='function'?objective():null;const t=ob&&ob[2];if(!t||!isFinite(t.x)||!isFinite(t.z))return null;const o=typeof outsidePoint==='function'?outsidePoint(t):{x:t.x,z:t.z};
  if(!o||o.x>=250)return null;return {x:o.x,z:o.z,title:String(ob[0]||''),text:String(ob[1]||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim()};}catch(e){return null;}}
function m6Route(goal){const y=m6You();if(!goal)return null;const key=[Math.round(y.x),Math.round(y.z),Math.round(goal.x),Math.round(goal.z)].join(',');if(key===M6.routeKey)return M6.route;M6.routeKey=key;
  let pts=null;try{if(Math.hypot(goal.x-y.x,goal.z-y.z)>6&&typeof rgnPath==='function'){const p=rgnPath(y.x,y.z,goal.x,goal.z);if(p&&p.length)pts=[[y.x,y.z]].concat(p);}}catch(e){}
  if(!pts)pts=[[y.x,y.z],[goal.x,goal.z]];return M6.route=pts;}
function m6Folk(){if(!M6L.folk||m6Night())return [];const out=[];try{for(const n of npcs){const id=n.def.id;if(!PEOPLE[id]||!m6Met(id)||id==='hollow')continue;let x=null,z=null,where='';
    if(n.loc==='out'&&n.vis!==false&&isFinite(n.x)&&n.x<250){x=n.x;z=n.z;where='here now';}
    else if(n.loc==='in'&&n.inDoor){x=n.inDoor[0];z=n.inDoor[1]-.6;where='inside';}
    else{const w=typeof wantFor==='function'?wantFor(n):null;const p=w&&PL[w];if(p){x=p[0];z=p[1];where='usually here now';}else{const h=LIFE[id]&&HOMES[LIFE[id].home];if(h&&h.door){x=h.door[0];z=h.door[1]-.6;where='at home, most likely';}}}
    if(x==null||x>=250)continue;out.push({id,name:n.def.name,x,z,where,n});}}catch(e){}return out;}
function m6Friends(){const out=[];try{if(typeof others==='function')for(const p of others()){const q=p.presence;if(!q)continue;let x=q.x,z=q.z;if(q.r&&typeof ROOMS!=='undefined'&&ROOMS[q.r]&&ROOMS[q.r].out){x=ROOMS[q.r].out.x;z=ROOMS[q.r].out.z;}
    const moving=Math.abs(q.vx||0)+Math.abs(q.vz||0)>.15;const a=isFinite(q.fa)?q.fa*Math.PI/180:moving?Math.atan2(q.vz,q.vx):({E:0,S:Math.PI/2,W:Math.PI,N:-Math.PI/2}[q.d]||Math.PI/2);
    out.push({x,z,name:(typeof clean==='function'?clean(q.n||'Friend'):String(q.n||'Friend')),dir:m6Dir8(Math.cos(a),Math.sin(a)),inside:!!q.r});}}catch(e){}return out;}
function m6Transit(){const out={stops:[],stations:[],rails:[],veh:[]};if(!M6L.transit)return out;try{if(typeof t41StopsBuilt!=='function')return out;t41Build();
  for(const st of t41StopsBuilt())out.stops.push({id:'b:'+st.id,sid:st.id,t:'stop',name:st.name+' stop',x:st.at[0],z:st.at[1],icon:'bus',note:st.note});
  for(const st of t41Stations()){const p=st.plat;out.stations.push({id:'s:'+st.id,sid:st.id,t:'station',name:st.name+' station',x:(p.x0+p.x1)/2,z:(p.z0+p.z1)/2,icon:'train',note:st.sub});}
  const T=S.emp&&S.emp.tr;if(T&&T.valley&&T41C.rail)out.rails=T.south?[T41C.rail.V,T41C.rail.S]:[T41C.rail.V];
  if(T41C.bus&&typeof t41BusPhases==='function')for(const [vid,ph] of t41BusPhases(T41C.bus.tt.period)){const w=t41Where(T41C.bus,S.hour,ph);if(w&&!w.parked)out.veh.push({x:w.x,z:w.z,icon:'bus'});}
  if(T41C.train){const w=t41Where(T41C.train,S.hour,0);if(w&&!w.parked)out.veh.push({x:w.x,z:w.z,icon:'train'});}}catch(e){}return out;}
// the next bus (or train) to call at a stop, from now
function m6NextAt(kind,sid){try{const V=kind==='bus'?T41C.bus:T41C.train;if(!V)return null;const legs=V.tt.legs,t0=T41_SERVICE[0],t1=T41_SERVICE[1];let best=null;
  const phases=kind==='bus'&&typeof t41BusPhases==='function'?t41BusPhases(V.tt.period).map(p=>p[1]):[0];const from=Math.max(S.hour,t0);
  for(const ph of phases)for(let cyc=0;cyc<14;cyc++){const base=t0+cyc*V.tt.period-ph;if(base>t1)break;for(const l of legs){if(l.stop!==sid)continue;const at=base+l.t0;if(at<from-.001||at>=t1)continue;if(best==null||at<best)best=at;}}
  return best;}catch(e){return null;}}
function m6Miles(){if(!M6L.travel||typeof RG_MILES==='undefined')return [];const here=typeof rgMileHere==='function'?rgMileHere():null;
  return RG_MILES.filter(m=>typeof rgMileKnown!=='function'||rgMileKnown(m)).map(m=>({id:'m:'+m.k,t:'mile',name:m.name+' milestone',x:m.x,z:m.z,icon:'mile',m,here:m===here}));}
function m6Pins(){if(!M6L.pins)return [];try{return mmMarks().map(m=>({id:'k:'+m.id,t:'pin',name:m.n,x:m.x,z:m.z,icon:'pin',mk:m}));}catch(e){return [];}}

// ================================================================ 4. drawing it
const M6F='"Hollow Pixel",ui-monospace,monospace';
// sizes in device pixels: icons and type at whole-number scales of their own pixel grids
function m6Scale(){const d=M6.dpr,far=M6.v.k<.5;return {ic:Math.max(2,Math.round(d*1.7)),tx:d<1.5?13:Math.round(d*1.4)*10,hd:Math.max(1,Math.round(d*1.1)),rg:far?(d<1.5?10:Math.round(d*1.2)*10):(d<1.5?20:Math.round(d*2)*10)};}
const M6TAG_C={};
// a name on a paper tag in one dark ink; regions in spaced capitals with a paper halo; faded for a place not yet found
function m6Tag(text,kind,fs,faint){const key=kind+'|'+fs+'|'+(faint?1:0)+'|'+text;if(M6TAG_C[key])return M6TAG_C[key];const c=document.createElement('canvas'),g=c.getContext('2d');
  const n=Math.max(1,Math.round(fs/10));g.font=`${fs}px ${M6F}`;const sp=kind==='region'?n:0;const tw=Math.ceil(g.measureText(text).width+sp*Math.max(0,text.length-1));
  if(kind==='region'){const h=Math.round(fs*1.1)+2*n;c.width=tw+4*n;c.height=h;g.font=`${fs}px ${M6F}`;g.textBaseline='top';const ink=faint?'rgba(58,34,16,.55)':'#3a2210',halo=faint?'rgba(236,220,178,.55)':'#ecdcb2';
    const draw=(dx,dy,col)=>{g.fillStyle=col;let x=2*n+dx;for(const ch of text){g.fillText(ch,x,n+dy);x+=g.measureText(ch).width+sp;}};
    for(const [dx,dy] of [[-n,0],[n,0],[0,-n],[0,n]])draw(dx,dy,halo);draw(0,0,ink);}
  else{const bw=Math.max(1,Math.round(n/2)),h=fs+3*n;c.width=tw+4*n+bw*2;c.height=h+bw*2;g.fillStyle='#3a2210';g.fillRect(0,0,c.width,c.height);g.fillStyle=kind==='pin'?'#f0dcf0':kind==='me'?'#f8e0d0':'#ecdcb2';
    g.fillRect(bw,bw,c.width-bw*2,c.height-bw*2);g.fillStyle='rgba(255,250,235,.5)';g.fillRect(bw,bw,c.width-bw*2,Math.max(1,Math.round(n/2)));g.font=`${fs}px ${M6F}`;g.textBaseline='top';g.fillStyle='#2a1608';g.fillText(text,bw+2*n,bw+Math.round(n*1.5));}
  return M6TAG_C[key]=c;}
// the view: base pixels at the middle of the window, and CSS pixels per base pixel
function m6KMin(){const B0=M6.base||M6.quick;return B0?Math.min(M6.cw/B0.width,M6.ch/B0.height):.2;}
const M6KMAX=4;
function m6Clamp(){const B0=M6.base||M6.quick;if(!B0)return;const v=M6.v,hw=M6.cw/2/v.k,hh=M6.ch/2/v.k;
  if(B0.width<=hw*2){v.x=B0.width/2;M6.vel[0]=0;}else{const x=clamp(v.x,hw,B0.width-hw);if(x!==v.x)M6.vel[0]=0;v.x=x;}
  if(B0.height<=hh*2){v.y=B0.height/2;M6.vel[1]=0;}else{const y=clamp(v.y,hh,B0.height-hh);if(y!==v.y)M6.vel[1]=0;v.y=y;}}
const m6SX=bx=>(bx-M6.v.x)*M6.v.k+M6.cw/2,m6SY=by=>(by-M6.v.y)*M6.v.k+M6.ch/2;
// zoom round a point of the window (eased)
function m6ZoomAt(ax,ay,f){const v=M6.v,k1=clamp((M6.z?M6.z.k1:v.k)*f,m6KMin(),M6KMAX);M6.z={k1,ax,ay,wx:v.x+(ax-M6.cw/2)/v.k,wy:v.y+(ay-M6.ch/2)/v.k};M6.vel=[0,0];MAPX.zoom=k1;m6Kick();}
function m6CenterOn(x,z,k){const v=M6.v;if(k)v.k=clamp(k,m6KMin(),M6KMAX);v.x=m6BX(x);v.y=m6BY(z);M6.z=null;M6.vel=[0,0];m6Clamp();MAPX.zoom=v.k;M6.dirty=true;}
// declutter: each thing in order of importance takes its spot if nothing is there; a name tries the four sides of its icon
function m6Layout(items,S0){const k=M6.v.k,placed=[];const hit=r=>{for(const q of placed)if(r.x0<q.x1&&r.x1>q.x0&&r.y0<q.y1&&r.y1>q.y0)return true;return false;};
  const res=new Map();const dp=M6.dpr;
  for(const it of items){if(k<(it.minK||0)||(it.maxK&&k>it.maxK))continue;let X=m6BX(it.x)*k,Y=m6BY(it.z)*k;
    const tag=it.tag;const tw=tag?tag.width/dp:0,th=tag?tag.height/dp:0;
    if(it.t==='region'){const cands=[[0,0],[0,-th*.9],[0,th*.9],[tw*.2,0],[-tw*.2,0]];let ok=null;for(const [dx,dy] of cands){const r={x0:X+dx-tw/2,y0:Y+dy-th/2,x1:X+dx+tw/2,y1:Y+dy+th/2};if(!hit(r)){ok=r;break;}}
      if(ok){placed.push(ok);res.set(it.id,{tx:ok.x0,ty:ok.y0});}continue;}
    const is=(it.isz||S0)/dp;let ox=0,oy=0,ir={x0:X-is/2-1,y0:Y-is/2-1,x1:X+is/2+1,y1:Y+is/2+1};
    // a person inside a shop stands beside its sign rather than vanish under it
    if(hit(ir)&&!it.must){if(it.t!=='folk')continue;let ok=false;for(const [dx,dy] of [[is+2,0],[-is-2,0],[0,is+2],[0,-is-2],[is+2,is+2],[-is-2,is+2],[is+2,-is-2],[-is-2,-is-2],[2*is+4,0],[-2*is-4,0]]){
        const r={x0:ir.x0+dx,y0:ir.y0+dy,x1:ir.x1+dx,y1:ir.y1+dy};if(!hit(r)){ir=r;ox=dx;oy=dy;ok=true;break;}}if(!ok)continue;}
    placed.push(ir);const out={ox,oy};X+=ox;Y+=oy;
    if(tag&&!(it.t==='folk'&&k<2.2)&&!it.noLabel){const g=3;const cands=[[X+is/2+g,Y-th/2],[X-is/2-g-tw,Y-th/2],[X-tw/2,Y+is/2+g],[X-tw/2,Y-is/2-g-th]];
      for(const [tx,ty] of cands){const r={x0:tx,y0:ty,x1:tx+tw,y1:ty+th};if(!hit(r)){placed.push(r);out.tx=tx-X;out.ty=ty-Y;break;}}}
    res.set(it.id,out);}
  return res;}
// everything that gets a spot this frame, in order of importance
function m6Items(sc){const key=M6.ver+'|'+sc.ic+'|'+sc.tx+'|'+sc.rg+'|'+M6.dpr;if(M6.itemsKey===key&&M6.items)return M6.items;const L=[];const add=o=>L.push(o);const isz=11*sc.ic;
  const y=m6You();if(M6L.you)add({id:'you',t:'you',x:y.x,z:y.z,pri:2000,must:1,isz,tag:y.inside?m6Tag('In: '+y.inside,'me',sc.tx):null});
  const goal=m6Goal();if(goal)add({id:'goal',t:'goal',x:goal.x,z:goal.z,icon:'star',pri:1500,must:1,isz,tag:m6Tag(goal.title,'place',sc.tx),goal});
  for(const p of m6Pins())add(Object.assign(p,{pri:1200,isz,tag:m6Tag(p.name,'pin',sc.tx)}));
  for(const m of m6Miles())add(Object.assign(m,{pri:m.here?1100:560,isz,tag:m6Tag(m.m.name,'place',sc.tx),minK:m.here?0:.6}));
  const T=m6Transit();for(const s of T.stops.concat(T.stations))add(Object.assign(s,{pri:540,isz,tag:m6Tag(s.name,'place',sc.tx),minK:.6}));
  if(M6.places)for(const p of M6.places){if(p.t==='place'){if(p.shop&&!M6L.shops)continue;add(Object.assign(p,{isz,tag:m6Tag(p.name,'place',sc.tx)}));}
    else if(p.t==='home'){if(!M6L.shops)continue;add(Object.assign(p,{isz,tag:m6Tag(p.name,'place',sc.tx)}));}
    else if(p.t==='region'){const f=p.rk?m6Found(p.rk):true;add(Object.assign(p,{tag:m6Tag(p.name,'region',sc.rg,M6L.found&&!f)}));}}
  for(const f of m6Folk()){const hd=m6Head(f.id,sc.hd)||m6Ic('head',sc.ic);add({id:'f:'+f.id,t:'folk',name:f.name,x:f.x,z:f.z,f,head:hd,isz:hd.width,pri:f.where==='here now'?380:330,minK:.9,tag:m6Tag(f.name.split(' ')[0],'place',sc.tx)});}
  L.sort((a,b)=>b.pri-a.pri);M6.itemsKey=key;M6.items=L;return L;}
function m6Draw(){const cv=M6.cv;if(!cv||!cv.isConnected)return;const g=M6.g,dp=M6.dpr,W=cv.width,H=cv.height;const v=M6.v,k=v.k;M6.dirty=false;
  g.setTransform(1,0,0,1,0,0);g.fillStyle='#2a1a0c';g.fillRect(0,0,W,H);const PAPER=M6.base||M6.quick;if(!PAPER)return;
  // the paper, by transform (crisp when it's enlarged a little, smooth when reduced or enlarged a lot); snapped to whole device pixels
  const sk=k*dp,tx=Math.round(dp*(M6.cw/2-v.x*k)),ty=Math.round(dp*(M6.ch/2-v.y*k));g.imageSmoothingEnabled=sk<1||sk>=3;g.imageSmoothingQuality='high';g.setTransform(sk,0,0,sk,tx,ty);g.drawImage(PAPER,0,0);
  // close up: the sharp tiles over it, each as soon as it's made (the smooth paper shows until then)
  const lv=M6.base?m6TileLevel():0;if(lv){const T=M6T.T,span=T/lv,x0=v.x-M6.cw/2/k,y0=v.y-M6.ch/2/k,x1=v.x+M6.cw/2/k,y1=v.y+M6.ch/2/k;
    for(const t of M6T.map.values())t.vis=false;const want=[];
    for(let ty2=Math.floor(y0/span);ty2<=Math.floor(y1/span);ty2++)for(let tx2=Math.floor(x0/span);tx2<=Math.floor(x1/span);tx2++){if(tx2<0||ty2<0||tx2*span>PAPER.width||ty2*span>PAPER.height)continue;
      const key=lv+'|'+tx2+'|'+ty2;let t=M6T.map.get(key);if(!t){t={f:lv,tx:tx2,ty:ty2,done:false};M6T.map.set(key,t);}else{M6T.map.delete(key);M6T.map.set(key,t);}t.vis=true;
      if(t.done){g.imageSmoothingEnabled=Math.abs(sk/lv-1)>.02;g.drawImage(t.c,tx2*span,ty2*span,span,span);}else want.push(t);}
    const cx=v.x,cy=v.y;want.sort((a,b)=>Math.hypot((a.tx+.5)*span-cx,(a.ty+.5)*span-cy)-Math.hypot((b.tx+.5)*span-cx,(b.ty+.5)*span-cy));M6T.q=want;}else M6T.q.length=0;
  // the farm as it is today: dug squares and crops
  try{const s=MAPX.s;for(const t of tiles){if(t.gh)continue;if(!t.tilled&&!t.crop)continue;const X=m6BX(t.x-.5),Y=m6BY(t.z-.5);g.fillStyle=t.crop&&t.crop.watered?'#4a2e18':'#7a5230';g.fillRect(X+.5,Y+.5,s-1,s-1);
    if(t.crop){g.fillStyle=t.crop.stage>=3?'#e8a030':'#7ac04a';g.fillRect(m6BX(t.x)-1,m6BY(t.z)-1,2,2);}}}catch(e){}
  g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;
  const sc=m6Scale(),P2=(x,z)=>[Math.round(m6SX(m6BX(x))*dp),Math.round(m6SY(m6BY(z))*dp)];
  // the bus and train lines
  const T=m6Transit();if(T.rails.length){for(const path of T.rails){g.fillStyle='#1a120c';let last=null;for(let i=0;i<path.length;i+=2){const [x,y]=P2(path[i].x,path[i].z);const w=Math.max(2,Math.round(dp*1.5));g.fillRect(x-w/2,y-w/2,w,w);
        if(i%16===0){const nx=-path[i].dz,nz=path[i].dx,L=Math.max(3,Math.round(3*dp*Math.min(2,k)));g.fillRect(Math.round(x-nx*L),Math.round(y-nz*L),w,w);g.fillRect(Math.round(x+nx*L),Math.round(y+nz*L),w,w);}last=[x,y];}}}
  // the way to your goal along the roads: gold dashes, ink-edged, a little march so it reads as a way
  const goal=m6Goal();M6.hasGoal=!!goal;if(goal){const pts=m6Route(goal);if(pts&&pts.length>1){const step=Math.max(4,Math.round(5*dp)),dash=3;let acc=(Math.floor(M6.t*8)*step*.6)%(step*dash*2);const w=Math.max(3,Math.round(2.5*dp));
      for(let i=0;i<pts.length-1;i++){const [ax,ay]=P2(pts[i][0],pts[i][1]),[bx,by]=P2(pts[i+1][0],pts[i+1][1]);const L=Math.hypot(bx-ax,by-ay);if(L<1)continue;
        for(let d=0;d<L;d+=step){const ph=Math.floor((d+acc)/(step*dash))%2;if(ph)continue;const x=Math.round(ax+(bx-ax)*d/L),y=Math.round(ay+(by-ay)*d/L);g.fillStyle='#3a2210';g.fillRect(x-w/2-1,y-w/2-1,w+2,w+2);g.fillStyle='#ffd040';g.fillRect(x-w/2,y-w/2,w,w);}}}}
  // places, regions, pins, milestones, stops: placed so nothing sits on anything else (worked out again only when the zoom changes)
  const items=M6.lastItems=m6Items(sc);const sig=M6.ver+'|'+items.length+'|'+Math.round(Math.log(k)*120)+'|'+M6L.found+'|'+(k<2.2?0:1)+'|'+(M6.lay?0:1);
  if(!M6.lay||M6.laySig!==sig){M6.lay=m6Layout(items,11*sc.ic);M6.laySig=sig;}
  M6.drawn=[];const hov=M6.hover&&M6.hover.id;const uiB=(M6.uiBox||[]).map(r=>r.map(v=>v*dp)),edgeBox=uiB.slice();
  for(let pass=0;pass<2;pass++)for(let i=items.length-1;i>=0;i--){const it=items[i];const pl=M6.lay.get(it.id);if(!pl)continue;let [x,y]=P2(it.x,it.z);if(pl.ox||pl.oy){x+=Math.round(pl.ox*dp);y+=Math.round(pl.oy*dp);}if(x<-200||y<-200||x>W+200||y>H+200)continue;
    if(pass===0){const tw=it.tag?it.tag.width:0,th=it.tag?it.tag.height:0;
      if(it.t==='region'){let lx=Math.round((pl.tx+M6.cw/2-v.x*k)*dp),ly=Math.round((pl.ty+M6.ch/2-v.y*k)*dp);if(x<0||y<0||x>W||y>H)continue;
        const cx=clamp(lx,2,W-tw-2),cy=clamp(ly,2,H-th-2);if(cx!==lx||cy!==ly){const r=[cx,cy,cx+tw,cy+th];if(edgeBox.some(q=>r[0]<q[2]&&r[2]>q[0]&&r[1]<q[3]&&r[3]>q[1]))continue;lx=cx;ly=cy;}
        g.drawImage(it.tag,lx,ly);edgeBox.push([lx,ly,lx+tw,ly+th]);M6.drawn.push({it,box:[lx/dp,ly/dp,(lx+tw)/dp,(ly+th)/dp]});continue;}
      if(pl.tx!=null&&it.tag&&it.t!=='you'){const lx=x+Math.round(pl.tx*dp),ly=y+Math.round(pl.ty*dp);if(lx<1||ly<1||lx+tw>W-1||ly+th>H-1)continue;if(uiB.some(q=>lx<q[2]&&lx+tw>q[0]&&ly<q[3]&&ly+th>q[1]))continue;g.drawImage(it.tag,lx,ly);edgeBox.push([lx,ly,lx+tw,ly+th]);M6.drawn.push({it,box:[lx/dp,ly/dp,(lx+tw)/dp,(ly+th)/dp]});}continue;}
    if(it.t==='region'||it.t==='you')continue;
    const icon=it.t==='goal'?'star':it.icon||'shop';const ic=it.head||m6Ic(icon,sc.ic,it.mk?[(MK_SIGNS[it.mk.k]||MK_SIGNS.star).c,'#3a2a4a']:null);const s=ic.width;
    if(it.t==='folk'&&it.f.where!=='here now')g.globalAlpha=.75;g.drawImage(ic,x-(s>>1),y-(s>>1));g.globalAlpha=1;
    if(it.shop&&M6L.shops){const op=m6Open(it.shop);if(op!=null){const q=sc.ic;g.fillStyle='#24140a';g.fillRect(x+(s>>1)-q*3,y-(s>>1)-q,q*4,q*4);g.fillStyle=op?'#6cc04a':'#c04a3a';g.fillRect(x+(s>>1)-q*2,y-(s>>1),q*2,q*2);}}
    if(it.here){g.fillStyle='#ffd27a';const q=sc.ic;g.fillRect(x-(s>>1)-q,y+(s>>1),s+q*2,q);}
    if(it.mk&&S.markGo===it.mk.id){g.fillStyle='#ffd27a';const q=sc.ic;g.fillRect(x-(s>>1),y-(s>>1)-q*2,s,q);}
    if(hov===it.id){const q=Math.max(1,sc.ic>>1);g.fillStyle='#ffd27a';g.fillRect(x-(s>>1)-q*2,y-(s>>1)-q*2,s+q*4,q);g.fillRect(x-(s>>1)-q*2,y+(s>>1)+q,s+q*4,q);g.fillRect(x-(s>>1)-q*2,y-(s>>1)-q*2,q,s+q*4);g.fillRect(x+(s>>1)+q,y-(s>>1)-q*2,q,s+q*4);}
    M6.drawn.push({it,x:x/dp,y:y/dp,r:Math.max(s/dp/2+4,22)});}
  // the bus and the train where they are now
  for(const q of T.veh){const [x,y]=P2(q.x,q.z);const ic=m6Ic(q.icon,Math.max(1,sc.ic-1));g.drawImage(ic,x-(ic.width>>1),y-(ic.width>>1));}
  // friends, then you: arrows the way you face (a dot with the building's name when you're inside)
  for(const f of m6Friends()){const [x,y]=P2(f.x,f.z);const a=m6Arr(f.dir,sc.ic,'blue');g.drawImage(a,x-(a.width>>1),y-(a.width>>1));const t=m6Tag(f.name,'place',sc.tx);g.drawImage(t,x-(t.width>>1),y-(a.width>>1)-t.height-2);}
  // late in the story the map knows something you don't: a second mark at the Marsh place, for a moment
  if(M6.ghost&&performance.now()<M6.ghost){const [x,y]=P2(-20,(typeof LANE_W!=='undefined'?LANE_W:40)-1);const a=m6Arr('S',sc.ic,'ghost');g.drawImage(a,x-(a.width>>1),y-(a.width>>1));}
  if(M6L.you){const y=m6You();const [x,yy]=P2(y.x,y.z);const pl=M6.lay.get('you');
    if(y.inside){const d=m6Ic('door',sc.ic);g.drawImage(d,x-(d.width>>1),yy-(d.width>>1));if(pl&&pl.tx!=null){const t=m6Tag('In: '+y.inside,'me',sc.tx);g.drawImage(t,x+Math.round(pl.tx*dp),yy+Math.round(pl.ty*dp));}}
    else{const a=m6Arr(m6Dir8(P.fx||0,P.fz||1),sc.ic,'red');const s=a.width;const on=Math.floor(M6.t*2)%2===0;
      if(on){const q=sc.ic;g.fillStyle='rgba(255,210,122,.9)';g.fillRect(x-(s>>1)-q*2,yy-(s>>1)-q*2,q,q);g.fillRect(x+(s>>1)+q,yy-(s>>1)-q*2,q,q);g.fillRect(x-(s>>1)-q*2,yy+(s>>1)+q,q,q);g.fillRect(x+(s>>1)+q,yy+(s>>1)+q,q,q);}
      g.drawImage(a,x-(s>>1),yy-(s>>1));}}
  // the pad's cross in the middle, and the name of what's under it
  if(m6Pad()){const q=Math.max(2,Math.round(dp*1.5)),cx=Math.round(W/2),cy=Math.round(H/2),L=q*6;g.fillStyle='#1a0e06';g.fillRect(cx-L-1,cy-q,L*2+2,q*2+1);g.fillRect(cx-q,cy-L-1,q*2+1,L*2+2);g.fillStyle='#ffd27a';g.fillRect(cx-L,cy-(q>>1),L*2,q);g.fillRect(cx-(q>>1),cy-L,q,L*2);}
  if(M6.draft){const [x,y]=P2(M6.draft.x,M6.draft.z);const ic=m6Ic('pin',sc.ic,[(MK_SIGNS[M6.draft.k]||MK_SIGNS.star).c,'#3a2a4a']);g.globalAlpha=.85;g.drawImage(ic,x-(ic.width>>1),y-(ic.width>>1));g.globalAlpha=1;}
  if(!M6.firstFrame)M6.firstFrame=performance.now();}
// the loop runs only while something moves (an ease, a glide, a held key or stick); otherwise the map sits still and costs nothing
function m6Kick(){M6.dirty=true;if(!M6.raf&&M6.on)M6.raf=requestAnimationFrame(m6Frame);}
function m6Frame(now){M6.raf=0;if(!M6.on||!M6.cv||!M6.cv.isConnected){M6.on=false;return;}const dt=Math.min(.05,Math.max(0,(now-(M6.last||now))/1000));M6.last=now;M6.t+=dt;let moving=false;const v=M6.v;
  if(M6.z){const Z=M6.z,a=1-Math.exp(-dt*15),lk=Math.log(v.k)+(Math.log(Z.k1)-Math.log(v.k))*a;v.k=Math.abs(Math.log(Z.k1)-lk)<.003?Z.k1:Math.exp(lk);v.x=Z.wx-(Z.ax-M6.cw/2)/v.k;v.y=Z.wy-(Z.ay-M6.ch/2)/v.k;m6Clamp();if(v.k===Z.k1)M6.z=null;moving=true;}
  if(!M6.drag&&!M6.pinch&&(M6.vel[0]||M6.vel[1])){v.x+=M6.vel[0]*dt;v.y+=M6.vel[1]*dt;const f=Math.exp(-dt*4.2);M6.vel[0]*=f;M6.vel[1]*=f;m6Clamp();if(Math.hypot(M6.vel[0],M6.vel[1])*v.k<6)M6.vel=[0,0];moving=true;}
  // keys held: WASD or the arrows
  if(M6.keys.size){const sp=620/v.k;let dx=0,dy=0;for(const c of M6.keys){if(c==='KeyA'||c==='ArrowLeft')dx--;if(c==='KeyD'||c==='ArrowRight')dx++;if(c==='KeyW'||c==='ArrowUp')dy--;if(c==='KeyS'||c==='ArrowDown')dy++;}
    if(dx||dy){v.x+=dx*sp*dt;v.y+=dy*sp*dt;M6.z=null;m6Clamp();moving=true;}}
  if(M6.padMove){const [px,py,zz]=M6.padMove;if(px||py){v.x+=px*700/v.k*dt;v.y+=py*700/v.k*dt;M6.z=null;m6Clamp();moving=true;}if(zz){const k1=clamp(v.k*Math.exp(zz*2.2*dt),m6KMin(),M6KMAX);M6.z={k1,ax:M6.cw/2,ay:M6.ch/2,wx:v.x,wy:v.y};MAPX.zoom=k1;moving=true;}}
  const blink=Math.floor(M6.t*2)!==Math.floor((M6.t-dt)*2);const march=M6.hasGoal&&Math.floor(M6.t*8)!==Math.floor((M6.t-dt)*8);const live=M6.liveT=(M6.liveT||0)+dt;let liveTick=false;if(live>.5){M6.liveT=0;liveTick=m6HasLive();if(liveTick)M6.ver++;}
  // the paper still being made (the map was opened early): a little more of it each frame, and the sharp tiles, a few each frame
  const busy=moving||M6.drag||M6.pinch;M6.fr=(M6.fr||0)+1;M6.still=busy?0:(M6.still||0)+dt;
  if(M6.job&&!busy&&M6.fr>2){const was=M6.ready;if(m6Run(10,true)||M6.ready!==was)M6.dirty=true;}
  if(M6T.q.length&&M6.fr>2&&m6TilesWork(busy?3:8))M6.dirty=true;
  if(moving||M6.dirty||blink||march||liveTick){m6Draw();if(moving)m6HoverAtPad();}
  if(moving)m6CardFollow();
  M6.raf=requestAnimationFrame(m6Frame);}
function m6HasLive(){try{return (typeof others==='function'&&others().length>0)||!!(T41C&&(T41C.bus||T41C.train));}catch(e){return false;}}
const m6Pad=()=>typeof GP!=='undefined'&&GP.mode==='pad';

// ================================================================ 5. the screen: the map fills the menu's page
{const css=document.createElement('style');css.textContent=`
#bag.m6on{height:calc(88vh / var(--su,1))!important}
#bag.m6on #u37moreB{display:none!important}
#bag.m6on #bagBody{overflow:hidden!important;display:flex!important;flex-direction:column;padding-bottom:0}
#bag.m6on>.sub{display:none!important}
body.m66 #bag.m6on>.acts{display:none!important}
#m6Root{position:relative;flex:1 1 auto;min-height:0;display:flex;flex-direction:column}
#mapWrap{position:relative;flex:1 1 auto;min-height:140px;overflow:hidden;background:#2a1a0c;box-shadow:0 0 0 2px #1a0e06,inset 0 0 0 2px #8a5a2a;touch-action:none;-webkit-user-select:none;user-select:none;max-height:none!important}
#mapView{position:absolute;left:0;top:0;width:100%;height:100%;display:block;image-rendering:pixelated;cursor:grab;outline:none}
#mapView.drag{cursor:grabbing}#mapView.over{cursor:pointer}#mapView.pin{cursor:crosshair}
#mapBar{position:absolute;right:6px;top:6px;z-index:4;display:flex;flex-direction:column;gap:4px;margin:0}
#mapBar .m6b,#m6Lg,#m6PinB{font:13px/1 'Hollow Pixel',ui-monospace,monospace;min-width:34px;min-height:34px;padding:0 10px;color:#f4e6c8;background:#5a3418;border:0;cursor:pointer;
  box-shadow:inset 0 0 0 2px #1a0e06,inset 0 3px 0 #8a5a30,inset 0 -3px 0 #3a200e,2px 2px 0 rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;gap:6px}
#mapBar .m6b:hover,#m6Lg:hover,#m6PinB:hover{background:#7a4a22}#mapBar .m6b:active,#m6Lg:active,#m6PinB:active{transform:translateY(1px)}
#m6PinB.on,#m6Lg.on{background:#a8502a;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 3px 0 #d07040,2px 2px 0 rgba(0,0,0,.45)}
#m6Lg{position:absolute;left:6px;top:6px;z-index:4}#m6PinB{position:absolute;right:6px;bottom:6px;z-index:4}
@media (pointer:coarse){#mapBar .m6b,#m6Lg,#m6PinB{min-width:calc(46px / var(--su,1))!important;min-height:calc(46px / var(--su,1))!important}#m6CardClose{width:calc(44px / var(--su,1))!important;height:calc(44px / var(--su,1))!important}}
body.in-touch #mapBar .m6b,body.in-touch #m6Lg,body.in-touch #m6PinB{min-width:calc(46px / var(--su,1));min-height:calc(46px / var(--su,1));font-size:15px}   /* (the menu is drawn scaled on small phones: 46 px after the scale) */
.m6k{display:inline-block;min-width:13px;padding:1px 3px;font-size:11px;line-height:12px;color:#2a1608;background:#ecdcb2;box-shadow:0 0 0 1px #1a0e06;text-align:center}
body:not(.in-kb) .m6k{display:none}
#m6Hint{position:absolute;left:6px;bottom:6px;z-index:3;max-width:calc(100% - 120px);font:13px/1.35 'Hollow Pixel',ui-monospace,monospace;color:#2a1608;background:rgba(236,220,178,.94);padding:4px 8px;box-shadow:0 0 0 2px #3a2210,2px 2px 0 rgba(0,0,0,.35);pointer-events:none}
#m6Hint .gpg{height:18px;vertical-align:-5px}
#mapLegend{position:absolute;left:6px;top:48px;z-index:6;width:min(270px,calc(100% - 12px));max-height:calc(100% - 56px);overflow:auto;background:#e8d6a8;color:#2a1608;padding:6px;box-shadow:0 0 0 2px #3a2210,inset 0 0 0 2px #f4e4c0,3px 3px 0 rgba(0,0,0,.4);margin:0;display:block;font-size:13px;opacity:1}
body.in-touch #mapLegend{top:58px}
#mapLegend[hidden]{display:none!important}
#mapLegend .lgrow{display:flex;align-items:center;gap:8px;width:100%;min-height:34px;padding:2px 6px;background:none;border:0;color:inherit;font:13px 'Hollow Pixel',ui-monospace,monospace;cursor:pointer;text-align:left}
body.in-touch #mapLegend .lgrow{min-height:calc(44px / var(--su,1));font-size:14px}
#mapLegend .lgrow:hover,#mapLegend .lgrow:focus-visible{background:rgba(168,116,58,.22);outline:none}
#mapLegend .bx{width:16px;height:16px;flex:none;background:#fbf3e0;box-shadow:inset 0 0 0 2px #3a2210,inset 0 -3px 0 #d8c08a}
#mapLegend .lgrow.on .bx{background:#a8502a;box-shadow:inset 0 0 0 2px #3a2210,inset 0 2px 0 #d07040}
#mapLegend .lgrow.on .bx::after{content:'';display:block;width:4px;height:8px;margin:2px 0 0 5px;border:solid #fff4dc;border-width:0 3px 3px 0;transform:rotate(40deg)}
#mapLegend canvas{width:22px;height:22px;image-rendering:pixelated;flex:none}#mapLegend .lgt{flex:1}#mapLegend small{display:block;opacity:.7;font-size:11px}
#mapLegend .lghd{display:flex;justify-content:space-between;align-items:center;padding:2px 4px 4px;font-size:12px;opacity:.85}
#mapCard{position:absolute;z-index:7;width:min(300px,calc(100% - 12px));background:#e8d6a8;color:#2a1608;padding:9px 10px 8px;font:13px/1.35 'Hollow Pixel',ui-monospace,monospace;
  box-shadow:0 0 0 2px #3a2210,inset 0 0 0 2px #f4e4c0,3px 4px 0 rgba(0,0,0,.45);margin:0}
#mapCard[hidden]{display:none!important}
#mapCard .hd{display:flex;align-items:center;gap:8px;padding-right:34px}#mapCard .hd canvas{width:22px;height:22px;image-rendering:pixelated;flex:none}#mapCard .hd b{font-size:15px;color:#3a1a08}
#mapCard .sub2{opacity:.75;font-size:12px;margin:1px 0 4px}#mapCard p{margin:4px 0}#mapCard .op{color:#2d6a20}#mapCard .cl{color:#8a2a1a}
#mapCard .acts2{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
#mapCard .acts2 button,#mapCard .mmsigns button{font:13px 'Hollow Pixel',ui-monospace,monospace;min-height:34px;padding:0 12px;color:#f4e6c8;background:#5a3418;border:0;cursor:pointer;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 3px 0 #8a5a30,inset 0 -3px 0 #3a200e}
#mapCard .acts2 button.hot{background:#a8502a;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 3px 0 #d07040}
body.in-touch #mapCard .acts2 button{min-height:calc(46px / var(--su,1));font-size:14px}
#m6CardClose{position:absolute;right:5px;top:5px;width:30px;height:30px;padding:0;font:16px/1 'Hollow Pixel',monospace;color:#f4e6c8;background:#5a3418;border:0;cursor:pointer;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 2px 0 #8a5a30}
body.in-touch #m6CardClose{width:calc(44px / var(--su,1));height:calc(44px / var(--su,1));right:3px;top:3px}
#mapCard input{font:inherit;width:100%;box-sizing:border-box;padding:6px;background:#fbf3e0;color:#2a1608;border:0;box-shadow:inset 0 0 0 2px #6a4a2a;margin:4px 0}
#mapCard .mmsigns{display:flex;gap:6px;margin:4px 0}#mapCard .mmsigns button{width:40px;padding:0;background:var(--c)}#mapCard .mmsigns button.on{box-shadow:inset 0 0 0 2px #fff,0 0 0 2px #3a2210}
body.in-touch #mapCard .mmsigns button{width:calc(46px / var(--su,1));min-height:calc(46px / var(--su,1))}
#m6Tip{position:absolute;z-index:8;pointer-events:none;background:#ecdcb2;color:#2a1608;font:13px/1.3 'Hollow Pixel',ui-monospace,monospace;padding:3px 7px;box-shadow:0 0 0 2px #3a2210,2px 2px 0 rgba(0,0,0,.35);white-space:nowrap}
#m6Tip[hidden]{display:none}#m6Tip small{opacity:.75}
`;document.head.appendChild(css);}
// what to tell you, by what you're holding
function m6HintHtml(){const m=typeof GP!=='undefined'?GP.mode:'kb';
  if(m==='pad')return gpFmt('{LS} {RS} move · {LT} {RT} zoom · {A} a place · {X} pin · {Y} you');
  if(m==='touch')return M6.pinMode?'Tap where the pin goes.':'Drag to look · pinch to zoom · tap a place · hold to pin';
  return M6.pinMode?'Click where the pin goes. Esc to stop.':'Drag or WASD to look · wheel zooms · click a place · right-click to pin';}
function m6SetHint(){const h=$('m6Hint');if(!h)return;const s=m6HintHtml();if(h._s!==s){h._s=s;h.innerHTML=s;}}
const M6LG=[['you','you','You and friends','your arrow points the way you face'],['goal','star','Your goal','and the way there'],['shops','shop','Shops and homes','open now: a green light'],
  ['folk','head','People you’ve met','where they are by day'],['transit','bus','Bus and train','stops and the next times'],['travel','mile','Milestones','travel from one to another'],
  ['found','found','Places found','the ones still to find are pale'],['pins','pin','Your pins','your own notes']];
function m6LegendHtml(){return `<div class="lghd"><b>Show on the map</b><button class="m6b" id="m6LgClose" aria-label="Close" style="min-height:28px;min-width:28px;padding:0 8px">✕</button></div>`+
  M6LG.map(([k,ic,t,s])=>`<button class="lgrow${M6L[k]?' on':''}" data-lg="${k}" role="switch" aria-checked="${M6L[k]?'true':'false'}"><span class="bx"></span><canvas width="11" height="11" data-ic="${ic}"></canvas><span class="lgt">${t}<small>${s}</small></span></button>`).join('');}
function m6LegendPaint(el){el.querySelectorAll('canvas[data-ic]').forEach(c=>{const ic=c.dataset.ic==='you'?m6Arr('E',1,'red'):m6Ic(c.dataset.ic,1);c.width=11;c.height=11;const g=c.getContext('2d');g.clearRect(0,0,11,11);g.drawImage(ic,0,0);});}
function m6Legend(on){const L=$('mapLegend');if(!L)return;if(on==null)on=L.hidden;if(on){L.innerHTML=m6LegendHtml();m6LegendPaint(L);
    L.querySelectorAll('[data-lg]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const k=b.dataset.lg;M6L[k]=M6L[k]?0:1;m6SaveL();M6.ver++;b.classList.toggle('on',!!M6L[k]);b.setAttribute('aria-checked',M6L[k]?'true':'false');M6.lay=null;SFX.click&&SFX.click();m6Kick();}));
    $('m6LgClose').addEventListener('click',e=>{e.stopPropagation();m6Legend(false);});}
  L.hidden=!on;$('m6Lg').classList.toggle('on',on);if(on&&m6Pad())setTimeout(()=>{const f=L.querySelector('[data-lg]');if(f&&typeof GP!=='undefined')GP.focus=f;},30);}
// ---- the card for a place
function m6People(it){const out={live:[],work:[]};try{
  if(it.t==='home'){out.live=m6Residents(it.home);return out;}
  if(it.t==='place'){for(const [k,h] of Object.entries(HOMES)){if(!h.door)continue;if(Math.hypot(h.door[0]-it.x,h.door[1]-it.z)<7)out.live.push(...m6Residents(k));}
    const sh=it.shop;if(sh&&sh.who)for(const id of sh.who){const n=npcById(id);if(n&&!out.work.includes(n))out.work.push(n);}}}catch(e){}
  out.live=[...new Set(out.live)].filter(n=>!out.work.includes(n));return out;}
function m6CardHtml(it){const y=m6You();const dist=Math.round(Math.hypot(it.x-y.x,it.z-y.z));const chip=typeof wayChip==='function'?wayChip({x:it.x,z:it.z}).replace(/<[^>]+>/g,'').trim():'';
  let h=`<button id="m6CardClose" aria-label="Close">✕</button><div class="hd"><canvas width="11" height="11" data-ic="${it.t==='goal'?'star':it.t==='folk'?'head':it.icon||'shop'}"></canvas><b>${m6Esc(it.t==='mile'?it.m.name:it.name)}</b></div>`;
  const acts=[];
  if(it.t==='goal'){h+=`<div class="sub2">Where you’re headed</div><p>${m6Esc(it.goal.text)}</p>`;}
  else if(it.t==='region'){const f=it.rk?m6Found(it.rk):true;const line=it.rk&&typeof RG_LINE!=='undefined'?RG_LINE[it.rk]:'';const hint=it.rk&&typeof RG_HINT!=='undefined'?RG_HINT[it.rk]:'';
    h+=`<div class="sub2">${f?(it.rk?`Found on day ${S.rg.seen[it.rk]}`:'Part of the valley'):'Not found yet'}</div>${f&&line?`<p>${m6Esc(line)}</p>`:''}${!f&&hint?`<p>${m6Esc(hint)}</p>`:''}`;}
  else if(it.t==='folk'){const f=it.f,n=f.n;const L=LIFE[f.id];h+=`<div class="sub2">${m6Esc(n.def.role||'')}</div><p>${f.where==='here now'?'Here now.':f.where==='inside'?'Inside here now.':f.where==='usually here now'?'Usually here at this hour.':'At home, most likely.'}</p>`;
    try{const hs=hearts(f.id);h+=`<p>${'♥'.repeat(hs)}${hs?'':'Not much of a friend yet.'}</p>`;}catch(e){}}
  else if(it.t==='pin'){const s=MK_SIGNS[it.mk.k]||MK_SIGNS.star;h+=`<div class="sub2">Your pin${S.markGo===it.mk.id?' · heading here':''}</div>`;acts.push(['go',S.markGo===it.mk.id?'Stop heading here':'Head here',1],['edit','Change'],['unpin','Remove pin']);}
  else if(it.t==='mile'){const here=typeof rgMileHere==='function'?rgMileHere():null;h+=`<div class="sub2">An old county milestone</div>`;
    if(it.m===here)h+='<p>You’re standing at it. Pick another milestone to travel there.</p>';
    else if(here){const c=typeof rgCost==='function'?rgCost(here,it.m):0;h+=`<p>From ${m6Esc(here.name)}: ${c<1?Math.round(c*60)+' minutes':c.toFixed(1)+' hours'} on the old roads.</p>`;acts.push(['travel','Travel here',1]);}
    else h+='<p>Stand at any milestone you’ve found to travel to this one.</p>';}
  else if(it.t==='stop'||it.t==='station'){const kind=it.t==='stop'?'bus':'train';const nx=m6NextAt(kind,it.sid);h+=`<div class="sub2">${it.t==='stop'?'Bus stop':'Railway station'}${it.note?' · '+m6Esc(it.note):''}</div>`;
    h+=`<p>${kind==='bus'?'Buses':'Trains'} run 6 am to 9 pm. ${nx!=null?`Next one here at <b>${m6Time(nx)}</b>.`:'None more today.'}</p><p>Stand at the ${it.t==='stop'?'stop':'platform'} and open it to ride. You ride free.</p>`;}
  else{const pp=m6People(it);if(it.sub)h+=`<div class="sub2">${m6Esc(it.sub)}</div>`;
    const sh=it.shop;if(sh){const op=m6Open(sh);h+=`<p>${sh.open===0&&sh.close===24?'Open day and night':`Open ${m6Time(sh.open)} to ${m6Time(sh.close)}`}. <span class="${op?'op':'cl'}">${op?'Open now.':'Closed now.'}</span></p>`;}
    if(pp.work.length)h+=`<p>Works here: ${pp.work.map(n=>m6Esc(m6Who(n))).join(', ')}.</p>`;if(pp.live.length)h+=`<p>Lives here: ${pp.live.map(n=>m6Esc(m6Who(n))).join(', ')}.</p>`;
    if(it.say)h+=`<p>${m6Esc(it.say)}</p>`;}
  if(it.t!=='goal'&&it.t!=='pin'&&it.t!=='region'&&dist>3)acts.push(['goal','Set as goal']);
  if(dist>2)h+=`<p style="opacity:.8">${m6Esc(chip||dist+' m away')}</p>`;
  if(acts.length)h+=`<div class="acts2">${acts.map(([a,t,hot])=>`<button data-m6="${a}"${hot?' class="hot"':''}>${t}</button>`).join('')}</div>`;
  return h;}
function m6Card(it,sx,sy){const c=$('mapCard');if(!c)return;if(!it){c.hidden=true;M6.card=null;M6.draft=null;m6Kick();return;}M6.card={it,sx,sy};
  c.innerHTML=it.t==='draft'?m6DraftHtml():m6CardHtml(it);c.querySelectorAll('canvas[data-ic]').forEach(cv=>{const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(m6Ic(cv.dataset.ic,1,it.mk?[(MK_SIGNS[it.mk.k]||MK_SIGNS.star).c,'#3a2a4a']:null),0,0);});
  c.hidden=false;m6CardPlace();
  $('m6CardClose').addEventListener('click',e=>{e.stopPropagation();m6Card(null);});
  c.querySelectorAll('[data-m6]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();m6Act(b.dataset.m6,it);}));
  if(it.t==='draft')m6DraftWire(it);
  SFX.page&&SFX.page();if(m6Pad())setTimeout(()=>{const f=c.querySelector('.acts2 button,.mmsigns button,input')||$('m6CardClose');if(f&&typeof GP!=='undefined')GP.focus=f;},30);}
// a phone gets the card at the foot of the map, where the thumb is; elsewhere it floats beside the place
function m6CardPlace(){const c=$('mapCard');if(!c||c.hidden||!M6.card)return;const W=M6.cw,H=M6.ch;
  if(typeof GP!=='undefined'&&GP.mode==='touch'&&W<700){c.style.left='6px';c.style.right='auto';c.style.top='auto';c.style.bottom='6px';c.style.width='calc(100% - 12px)';return;}
  const cw=c.offsetWidth,ch=c.offsetHeight;let x=M6.card.sx+18,y=M6.card.sy-ch/2;if(x+cw>W-6)x=M6.card.sx-18-cw;x=clamp(x,6,Math.max(6,W-cw-6));y=clamp(y,6,Math.max(6,H-ch-6));
  const L=Math.round(x)+'px',T=Math.round(y)+'px';if(c.style.left!==L)c.style.left=L;if(c.style.top!==T)c.style.top=T;c.style.bottom='auto';c.style.width='';}
function m6CardFollow(){}
function m6Act(a,it){if(a==='goal'){S.mapGoal={n:it.name,x:it.x,z:it.z};toast(`Heading for ${it.name}. The bar at the top points the way.`,2.2);try{updateHud&&updateHud();}catch(e){}M6.routeKey='';M6.ver++;m6Card(null);m6Kick();return;}
  if(a==='travel'){const here=typeof rgMileHere==='function'?rgMileHere():null;if(!here||!it.m)return;if(rgGoTo(here,it.m)){m6Card(null);if($('bagClose'))$('bagClose').click();}return;}
  if(a==='go'){const go=S.markGo===it.mk.id;S.markGo=go?null:it.mk.id;toast(go?'Stopped.':`Heading to ${it.mk.n}. The arrow points the way.`,2.2);try{updateHud&&updateHud();}catch(e){}M6.routeKey='';M6.ver++;m6Card(null);m6Kick();return;}
  if(a==='unpin'){S.marks=mmMarks().filter(q=>q.id!==it.mk.id);if(S.markGo===it.mk.id)S.markGo=null;try{saveGame&&saveGame();}catch(e){}toast('Pin removed.',1.4);M6.lay=null;M6.ver++;m6Card(null);m6Kick();return;}
  if(a==='edit'){M6.draft={id:it.mk.id,x:it.mk.x,z:it.mk.z,n:it.mk.n,k:it.mk.k};m6Card({t:'draft',x:it.x,z:it.z},M6.card?M6.card.sx:M6.cw/2,M6.card?M6.card.sy:M6.ch/2);return;}}
// your goal from the map: the bar points there until you arrive (or set another)
{const _o=objective;objective=function(){const r=_o.apply(this,arguments);try{const g=S.mapGoal;if(g&&S.mode==='play'&&!(typeof mmGo==='function'&&mmGo())){const t={x:g.x,z:g.z};return ['Your goal',`${m6Esc(g.n)}.`+(typeof wayChip==='function'?wayChip(t):''),t];}}catch(e){}return r;};}
{let t=0;const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);t+=dt;if(t<.5)return;t=0;try{const g=S.mapGoal;if(g&&!S.room&&Math.hypot(P.x-g.x,P.z-g.z)<2.4){S.mapGoal=null;toast(`You’re there: ${g.n}.`,2.2);}}catch(e){}};}
if(typeof PERSONAL!=='undefined'&&!PERSONAL.includes('mapGoal'))PERSONAL.push('mapGoal');
// ---- pins: drop one (Pin, a right-click, a long press, or X on a pad), with a short note and a sign
function m6DraftHtml(){const d=M6.draft||{};return `<button id="m6CardClose" aria-label="Close">✕</button><div class="hd"><canvas width="11" height="11" data-ic="pin"></canvas><b>${d.id?'Change this pin':'A new pin'}</b></div>
  <input id="m6PinN" maxlength="28" placeholder="Good fishing, iron here, don’t go at night…" value="${m6Esc(d.n||'')}">
  <div class="mmsigns">${Object.entries(MK_SIGNS).map(([k,s])=>`<button data-sign="${k}" class="${d.k===k?'on':''}" title="${s.name}" style="--c:${s.c}">${s.g}</button>`).join('')}</div>
  <div class="acts2"><button data-pin="save" class="hot">Save the pin</button><button data-pin="cancel">Cancel</button></div>`;}
function m6DraftWire(){const c=$('mapCard'),d=M6.draft;if(!d)return;
  c.querySelectorAll('[data-sign]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();d.k=b.dataset.sign;d.n=$('m6PinN').value;c.querySelectorAll('[data-sign]').forEach(q=>q.classList.toggle('on',q===b));m6Kick();}));
  c.querySelector('[data-pin="save"]').addEventListener('click',e=>{e.stopPropagation();m6PinSave();});c.querySelector('[data-pin="cancel"]').addEventListener('click',e=>{e.stopPropagation();m6Card(null);});
  const inp=$('m6PinN');inp.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();m6PinSave();}if(e.key==='Escape'){e.preventDefault();m6Card(null);}});
  if(typeof GP!=='undefined'&&GP.mode==='kb'&&!d.id)setTimeout(()=>{try{inp.focus({preventScroll:true});}catch(x){}},30);}
function m6PinSave(){const d=M6.draft;if(!d)return;const n=String(($('m6PinN')||{}).value||'').replace(/\s+/g,' ').trim().slice(0,28)||'My pin';const L=mmMarks();
  if(d.id){const m=L.find(q=>q.id===d.id);if(m){m.n=n;m.k=d.k;}}else{if(L.length>=40){toast('That’s forty pins. Take one off first.',2.4);return;}L.push({id:Date.now().toString(36)+Math.floor(rand()*1e4),x:+d.x.toFixed(2),z:+d.z.toFixed(2),n,k:d.k||'star'});}
  M6.draft=null;M6.pinMode=false;const pb=$('m6PinB');if(pb)pb.classList.remove('on');SFX.page&&SFX.page();try{saveGame&&saveGame();}catch(e){}toast(d.id?'Pin changed.':'Pinned.',1.4);M6.lay=null;M6.ver++;m6Card(null);m6SetHint();m6Kick();}
function m6PinAt(sx,sy){const bx=M6.v.x+(sx-M6.cw/2)/M6.v.k,by=M6.v.y+(sy-M6.ch/2)/M6.v.k;const x=(bx-MAPX.pad)/MAPX.s+B.x0,z=(by-MAPX.pad)/MAPX.s+B.z0;
  if(x<B.x0||x>B.x1||z<B.z0||z>B.z1)return;M6.draft={x,z,n:'',k:'star'};m6Card({t:'draft',x,z},sx,sy);m6Kick();}
// what's under a point of the window: the nearest thing drawn there
function m6HitAt(sx,sy){let best=null,bd=1e9;for(const d of (M6.drawn||[])){if(d.box){if(sx>=d.box[0]&&sx<=d.box[2]&&sy>=d.box[1]&&sy<=d.box[3]&&bd>6){bd=6;best=d.it;}continue;}const dd=Math.hypot(d.x-sx,d.y-sy);if(dd<d.r&&dd<bd){bd=dd;best=d.it;}}
  return best;}
function m6Tip(it,sx,sy){const t=$('m6Tip');if(!t)return;if(!it||M6.card){if(!t.hidden)t.hidden=true;return;}
  let s=`<b>${m6Esc(it.t==='mile'?it.m.name:it.name)}</b>`;if(it.shop){const op=m6Open(it.shop);if(op!=null)s+=` <small>${op?'open now':'closed now'}</small>`;}else if(it.t==='folk')s+=` <small>${it.f.where}</small>`;else if(it.t==='region'&&it.rk&&!m6Found(it.rk))s+=' <small>not found yet</small>';
  if(t._s!==s){t._s=s;t.innerHTML=s;}const x=Math.round(Math.min(M6.cw-t.offsetWidth-4,sx+14))+'px',y=Math.round(Math.max(4,sy-34))+'px';if(t.style.left!==x)t.style.left=x;if(t.style.top!==y)t.style.top=y;if(t.hidden)t.hidden=false;}
function m6HoverAtPad(){if(!m6Pad())return;const it=m6HitAt(M6.cw/2,M6.ch/2);if((it&&it.id)!==(M6.hover&&M6.hover.id)){M6.hover=it;M6.dirty=true;}m6Tip(it,M6.cw/2,M6.ch/2);}
// ---- the page
renderMap=function(keep){const B2=$('bagBody'),bag=$('bag');bag.classList.add('m6on');M6.on=true;M6.fr=0;M6.still=0;
  const sub=$('bagSub');if(sub)sub.textContent='';
  if(!$('m6Root')||!B2.contains($('m6Root'))){B2.innerHTML=`<div id="m6Root"><div id="mapWrap"><canvas id="mapView" tabindex="0" role="application" aria-label="Map of the valley"></canvas>
      <button id="m6Lg" aria-label="What the map shows">Show</button>
      <div id="mapBar"><button class="m6b" id="mzIn" aria-label="Zoom in" title="Zoom in (+)">+</button><button class="m6b" id="mzOut" aria-label="Zoom out" title="Zoom out (−)">−</button><button class="m6b" id="m6Me" aria-label="Find yourself" title="Find yourself (Space)">Me</button></div>
      <button id="m6PinB" class="mmbtn" aria-label="Drop a pin" title="Drop a pin (right-click the map)">Pin</button>
      <div id="m6Hint"></div><div id="mapLegend" hidden></div><div id="mapCard" hidden></div><div id="m6Tip" hidden></div></div></div>`;
    m6Wire();}
  const cv=M6.cv=$('mapView');M6.g=cv.getContext('2d');m6Size();
  M6.ver++;if(!keep||!M6.v.set){const y=m6You();m6Need();M6.places=m6Places();M6.lay=null;m6CenterOn(y.x,y.z,M6.v.set?M6.v.k:clamp(M6.kDef,m6KMin(),M6KMAX));M6.v.set=true;}
  else{m6Need();}
  // late in the story the map knows something you don't
  try{if(!keep&&typeof hl==='function'&&hl()>=3&&isNight()&&rand()<.5)M6.ghost=performance.now()+2400;}catch(e){}
  m6SetHint();m6UiBoxes();m6Draw();bag.hidden=false;m6Kick();
  if(m6Pad())setTimeout(()=>{if(typeof GP!=='undefined'&&M6.cv&&M6.cv.isConnected)GP.focus=M6.cv;},20);};
// the map's own buttons, legend and hint, as boxes in the window (no name is drawn under them)
function m6UiBoxes(){const w=$('mapWrap');if(!w)return;const R=w.getBoundingClientRect();const L=[];for(const id of ['m6Lg','mapBar','m6PinB','m6Hint']){const e=$(id);if(!e||e.hidden)continue;const r=e.getBoundingClientRect();if(r.width<2)continue;L.push([r.left-R.left-3,r.top-R.top-3,r.right-R.left+3,r.bottom-R.top+3]);}
  const sig=JSON.stringify(L.map(q=>q.map(Math.round)));if(sig!==M6.uiSig){M6.uiSig=sig;M6.uiBox=L;M6.dirty=true;}}
function m6Size(){const w=$('mapWrap');if(!w||!M6.cv)return;const r=w.getBoundingClientRect();const cw=Math.max(40,Math.round(r.width)),ch=Math.max(40,Math.round(r.height));const dp=Math.min(3,window.devicePixelRatio||1);
  if(cw!==M6.cw||ch!==M6.ch||dp!==M6.dpr||M6.cv.width!==Math.round(cw*dp)||M6.cv.height!==Math.round(ch*dp)){const oldK=M6.cw;M6.cw=cw;M6.ch=ch;M6.dpr=dp;M6.cv.width=Math.round(cw*dp);M6.cv.height=Math.round(ch*dp);M6.lay=null;if(M6.base||M6.quick){M6.v.k=clamp(M6.v.k,m6KMin(),M6KMAX);m6Clamp();}M6.dirty=true;}}
addEventListener('resize',()=>{if(M6.on&&M6.cv&&M6.cv.isConnected){m6Size();m6CardPlace();m6Kick();}});
// leaving the map tab
{const _ob=openBag;openBag=function(tab){const r=_ob.apply(this,arguments);try{const bag=$('bag');if(GM_TAB!=='map'){bag.classList.remove('m6on');M6.on=false;}}catch(e){}return r;};}
setInterval(()=>{try{if(M6.on&&(!M6.cv||!M6.cv.isConnected||$('bag').hidden||GM_TAB!=='map')){M6.on=false;$('bag').classList.remove('m6on');M6.keys.clear();M6.pinMode=false;M6.draft=null;M6.card=null;}
  if(M6.on){m6Size();m6SetHint();m6UiBoxes();}}catch(e){}},250);
// ---- the hands on it: mouse, touch, keys
function m6Wire(){const cv=$('mapView'),wrap=$('mapWrap');const pt=e=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
  const tap=(sx,sy,e)=>{if(M6.pinMode){M6.pinMode=false;$('m6PinB').classList.remove('on');m6PinAt(sx,sy);m6SetHint();return;}
    const it=m6HitAt(sx,sy);if(it){m6Card(it,sx,sy);M6.hover=it;m6Tip(null);}else if(M6.card)m6Card(null);m6Kick();};
  cv.addEventListener('pointerdown',e=>{if(e.button&&e.button!==0)return;const [x,y]=pt(e);M6.ptr.set(e.pointerId,{x,y,x0:x,y0:y,t0:performance.now()});try{cv.setPointerCapture(e.pointerId);}catch(x){}
    M6.vel=[0,0];M6.z=null;
    if(M6.ptr.size===1){M6.drag={id:e.pointerId,moved:false,hist:[[performance.now(),x,y]]};
      if(e.pointerType!=='mouse'&&e.pointerId!==GP_PID){clearTimeout(M6.lpT);M6.lpT=setTimeout(()=>{const d=M6.drag;if(d&&!d.moved&&M6.ptr.size===1){d.moved=true;d.long=true;m6PinAt(x,y);navigator.vibrate&&navigator.vibrate(15);}},520);}}
    else if(M6.ptr.size===2){clearTimeout(M6.lpT);const [a,b]=[...M6.ptr.values()];const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,v=M6.v;M6.pinch={d0:Math.hypot(a.x-b.x,a.y-b.y)||1,k0:v.k,wx:v.x+(mx-M6.cw/2)/v.k,wy:v.y+(my-M6.ch/2)/v.k};if(M6.drag)M6.drag.moved=true;}
    e.preventDefault();});
  cv.addEventListener('pointermove',e=>{const [x,y]=pt(e);const p=M6.ptr.get(e.pointerId);
    if(!p){// hovering with a mouse: the name of what's under it, and a hand
      if(e.pointerType==='mouse'){const it=m6HitAt(x,y);if((it&&it.id)!==(M6.hover&&M6.hover.id)){M6.hover=it;cv.classList.toggle('over',!!it);m6Kick();}m6Tip(it,x,y);}return;}
    const dx=x-p.x,dy=y-p.y;p.x=x;p.y=y;
    if(M6.pinch&&M6.ptr.size>=2){const [a,b]=[...M6.ptr.values()];const d=Math.hypot(a.x-b.x,a.y-b.y)||1,mx=(a.x+b.x)/2,my=(a.y+b.y)/2,v=M6.v,P0=M6.pinch;
      v.k=clamp(P0.k0*d/P0.d0,m6KMin(),M6KMAX);v.x=P0.wx-(mx-M6.cw/2)/v.k;v.y=P0.wy-(my-M6.ch/2)/v.k;m6Clamp();MAPX.zoom=v.k;m6Kick();return;}
    const D=M6.drag;if(!D||D.id!==e.pointerId)return;if(!D.moved&&Math.hypot(x-p.x0,y-p.y0)>6){D.moved=true;clearTimeout(M6.lpT);cv.classList.add('drag');m6Tip(null);}
    if(D.moved){M6.v.x-=dx/M6.v.k;M6.v.y-=dy/M6.v.k;m6Clamp();D.hist.push([performance.now(),x,y]);if(D.hist.length>8)D.hist.shift();m6Kick();}});
  const up=e=>{const p=M6.ptr.get(e.pointerId);if(!p)return;M6.ptr.delete(e.pointerId);clearTimeout(M6.lpT);cv.classList.remove('drag');
    if(M6.pinch){if(M6.ptr.size<2){M6.pinch=null;const rest=[...M6.ptr.entries()][0];M6.drag=rest?{id:rest[0],moved:true,hist:[[performance.now(),rest[1].x,rest[1].y]]}:null;}return;}
    const D=M6.drag;M6.drag=null;if(!D||D.long)return;
    if(!D.moved){if(e.type==='pointerup')tap(p.x,p.y,e);return;}
    // the flick: how fast it was moving in its last tenth of a second
    const now=performance.now(),h=D.hist.filter(q=>now-q[0]<110);if(h.length>=2){const a=h[0],b=h[h.length-1],dt=(b[0]-a[0])/1000;if(dt>.01){M6.vel=[-(b[1]-a[1])/dt/M6.v.k,-(b[2]-a[2])/dt/M6.v.k];const sp=Math.hypot(M6.vel[0],M6.vel[1])*M6.v.k;if(sp>2600){const f=2600/sp;M6.vel[0]*=f;M6.vel[1]*=f;}m6Kick();}}};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!M6.ptr.size){if(M6.hover){M6.hover=null;cv.classList.remove('over');m6Kick();}m6Tip(null);}});
  cv.addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();const [x,y]=pt(e);let dy=e.deltaY;if(e.deltaMode===1)dy*=16;else if(e.deltaMode===2)dy*=300;
    if(e.ctrlKey)dy*=2.5;m6ZoomAt(x,y,Math.exp(clamp(-dy,-300,300)*.0021));m6Tip(null);},{passive:false});
  cv.addEventListener('dblclick',e=>{const [x,y]=pt(e);m6ZoomAt(x,y,2);});
  cv.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();const [x,y]=pt(e);m6PinAt(x,y);});
  $('mzIn').addEventListener('click',e=>{e.stopPropagation();m6ZoomAt(M6.cw/2,M6.ch/2,1.6);});$('mzOut').addEventListener('click',e=>{e.stopPropagation();m6ZoomAt(M6.cw/2,M6.ch/2,1/1.6);});
  $('m6Me').addEventListener('click',e=>{e.stopPropagation();const y=m6You();const v=M6.v;M6.z=null;const k1=Math.max(v.k,M6.kDef);M6.z={k1:clamp(k1,m6KMin(),M6KMAX),ax:M6.cw/2,ay:M6.ch/2,wx:m6BX(y.x),wy:m6BY(y.z)};m6Kick();});
  $('m6Lg').addEventListener('click',e=>{e.stopPropagation();m6Legend();});
  $('m6PinB').addEventListener('click',e=>{e.stopPropagation();if(m6Pad()){m6PinAt(M6.cw/2,M6.ch/2);return;}M6.pinMode=!M6.pinMode;$('m6PinB').classList.toggle('on',M6.pinMode);cv.classList.toggle('pin',M6.pinMode);m6SetHint();});
  wrap.addEventListener('click',e=>e.stopPropagation());}
// keys while the map is open: WASD or the arrows move it, + and - zoom, Space finds you, Esc stops pinning or closes a card
addEventListener('keydown',e=>{if(!M6.on||!M6.cv||!M6.cv.isConnected)return;const t=e.target;if(t&&/INPUT|TEXTAREA/.test(t.tagName||''))return;const c=e.code;
  if(/^(KeyW|KeyA|KeyS|KeyD|ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/.test(c)){if(typeof GP!=='undefined'&&GP.clicking)return;if(e.isTrusted===false&&typeof GP!=='undefined'&&GP.mode==='pad')return;M6.keys.add(c);M6.vel=[0,0];e.preventDefault();e.stopImmediatePropagation();m6Kick();return;}
  if(c==='Equal'||c==='NumpadAdd'){m6ZoomAt(M6.cw/2,M6.ch/2,1.6);e.preventDefault();e.stopImmediatePropagation();return;}
  if(c==='Minus'||c==='NumpadSubtract'){m6ZoomAt(M6.cw/2,M6.ch/2,1/1.6);e.preventDefault();e.stopImmediatePropagation();return;}
  if(c==='Space'&&e.isTrusted){$('m6Me').click();e.preventDefault();e.stopImmediatePropagation();return;}
  if(c==='Escape'&&(M6.pinMode||M6.card||!$('mapLegend').hidden)){if(M6.pinMode){M6.pinMode=false;$('m6PinB').classList.remove('on');M6.cv.classList.remove('pin');m6SetHint();}else if(M6.card)m6Card(null);else m6Legend(false);e.preventDefault();e.stopImmediatePropagation();}},true);
addEventListener('keyup',e=>{if(M6.keys.delete(e.code))m6Kick();},true);
addEventListener('blur',()=>{M6.keys.clear();});

// ================================================================ 6. the pad on the map: the sticks move it, the triggers zoom, A opens the place under the cross
function m6PadOn(){return M6.on&&M6.cv&&M6.cv.isConnected&&!$('bag').hidden;}
if(typeof GP_CTX!=='undefined'){const _ui=GP_CTX.ui;GP_CTX.ui=function(p,dt,lx,ly,rx,ry){if(!m6PadOn()||typeof gpModal==='function'&&$('gpCtl')&&gpShown($('gpCtl'))){M6.padMove=null;return _ui.apply(this,arguments);}
  const inCard=M6.card||!$('mapLegend').hidden;const mx=inCard?0:(rx||lx),my=inCard?0:(ry||ly);
  const lt=(p.buttons[6]&&(typeof p.buttons[6]==='object'?p.buttons[6].value:p.buttons[6]))||0,rt=(p.buttons[7]&&(typeof p.buttons[7]==='object'?p.buttons[7].value:p.buttons[7]))||0;
  M6.trigT=(lt>.3||rt>.3)?(M6.trigT||0)+dt:0;const zz=M6.trigT>.25?(rt-lt):0;
  if(mx||my||zz){M6.padMove=[mx,my,zz];if((mx||my)&&GP.focus!==M6.cv&&!inCard)GP.focus=M6.cv;m6Kick();}else M6.padMove=null;
  if(!inCard&&gpEdge(3)){$('m6Me').click();return _ui.call(this,p,dt,0,0,0,0);}
  return _ui.call(this,p,dt,0,0,0,0);};}
// (the left stick moves the map here, not the frame; the d-pad still walks the frame over the buttons)
if(typeof gpDir==='function'){const _gd=gpDir;gpDir=function(p,dt,useStick){return _gd.call(this,p,dt,useStick&&!m6PadOn());};}
// X: a pin under the cross
if(typeof gpMapMark==='function'){const _mm=gpMapMark;gpMapMark=function(){if(m6PadOn()){if(!M6.card)m6PinAt(M6.cw/2,M6.ch/2);return true;}return _mm.apply(this,arguments);};}
