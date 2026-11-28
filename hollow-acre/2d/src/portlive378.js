/* ================= W3: the townsfolk's portraits come alive while they talk to you, from the portraits' own pixels (nothing is
   downloaded): they blink now and then, their mouth moves while a line is being said, and a line that hits hard starts with a quick
   start of surprise before the face settles. The generator that drew the portraits (px/portrait4.py) says where each face's eyes
   and mouth are (PLV_GEO, read from it): a blink lays a lid over each eye (the skin of the cheek under it, shaded a little deeper toward
   the top) with a flat lash line; the mouth opens from the face's own neutral lip line, half open (a row of
   teeth over a dark slot) or open (a D: the teeth along a flat top, a rounded bottom, the lower lip carried down under it), in the
   mouth and teeth colours of the face's own scared mouth. Caitlyn's portrait (id 'mae') is left exactly as it is. A canvas is only
   redrawn when what it shows changes. ================= */
// per face: eye_dx, eye_y, eye_a, eye_open, tilt, mouth_y, lip_w, lip_up, lip_lo, bearded, lash wing
const PLV_GEO={"nell":[11.6,59.3,6.4,1.0,0.4,76.5,6.2,2.2,2.9,0,1.0],"june":[11.6,59.3,6.2,1.0,1.0,76.5,7.0,2.2,3.2,0,1.0],"cora":[11.6,59.3,6.0,1.0,1.4,76.5,6.4,2.4,2.9,0,1.3],
  "ida":[11.6,59.3,6.5,1.0,0.3,76.5,5.8,2.2,2.9,0,1.0],"tess":[11.6,59.3,6.2,1.0,0.8,76.5,6.6,2.2,2.9,0,1.0],"iris":[11.6,59.3,6.4,1.0,0.2,76.5,6.0,2.2,2.9,0,1.0],
  "della":[11.6,59.3,6.0,1.0,0.9,76.5,7.2,2.2,3.4,0,1.0],"maud":[11.6,59.3,6.0,1.0,0.7,76.5,6.8,2.2,2.9,0,1.0],"hale":[11.6,59.8,4.9,0.72,0.0,76.5,6.2,1.1,1.6,0,0],
  "tobias":[11.6,62.2,7.5,1.0,0.04,73.8,4.4,1.3,1.9,0,0],"hollis":[11.6,59.6,5.1,0.74,0.15,76.5,6.4,1.3,1.9,1,0],"agnes":[11.6,59.3,5.4,1.0,0.0,76.5,6.6,1.6,2.2,0,0],
  "dunn":[11.6,59.6,5.1,0.74,0.15,76.5,6.4,1.3,1.9,1,0],"ruth":[11.6,62.2,7.5,1.0,0.04,73.8,4.4,1.3,1.9,0,0],"gideon":[11.6,59.6,5.1,0.74,0.15,76.5,6.4,1.3,1.9,1,0],
  "ezra":[11.6,59.8,4.9,0.72,0.0,76.5,6.2,1.1,1.6,1,0],"pip":[11.6,62.2,7.5,1.0,0.04,73.8,4.4,1.3,1.9,0,0],"silas":[11.6,59.6,5.1,0.74,0.15,76.5,6.4,1.3,1.9,1,0],
  "otto":[11.6,59.8,4.9,0.72,0.0,76.5,6.2,1.1,1.6,1,0],"wes":[11.6,59.6,5.1,0.74,0.15,76.5,6.4,1.3,1.9,0,0],"hob":[11.6,59.6,5.1,0.74,0.15,76.5,6.4,1.3,1.9,1,0],
  "lyle":[11.6,59.8,4.9,0.72,0.0,76.5,6.2,1.1,1.6,1,0],"vera":[11.6,59.3,6.3,1.0,0.9,76.5,6.6,2.2,2.9,0,0.7],"quinn":[11.6,59.6,5.1,0.74,0.15,76.5,6.4,1.3,1.9,0,0],
  "nan":[11.6,59.3,5.4,1.0,0.0,76.5,6.6,1.6,2.2,0,0],"finn":[11.6,62.2,7.5,1.0,0.04,73.8,4.4,1.3,1.9,0,0],"moss":[11.6,59.6,5.1,0.74,0.15,76.5,6.4,1.3,1.9,1,0],
  "ada":[11.6,59.3,5.4,1.0,0.0,76.5,6.6,1.6,2.2,0,0],"orla":[11.6,59.3,5.4,1.0,0.0,76.5,6.6,1.6,2.2,0,0],"bram":[11.6,62.2,7.5,1.0,0.04,73.8,4.4,1.3,1.9,0,0],
  "abel":[11.6,59.6,5.1,0.74,0.15,76.5,6.4,1.3,1.9,1,0],"corwin":[11.6,59.8,4.9,0.72,0.0,76.5,6.2,1.1,1.6,1,0]};
const PLV={cells:new Map(),live:new Map(),tick:null};
const PLV_SKIP=new Set(['mae']);
const PLV_BEAT=new Set(['scared','angry','wrong','cry']);
const PLV_NOBLINK=new Set(['happy','laugh','wrong']);   // eyes already squeezed, or staring on purpose
// one face (variant, person, expression) as pixels, read once from the high-detail sheet
function plvCell(v,id,expr){const k=v+'|'+id+'|'+expr;let c=PLV.cells.get(k);if(c)return c;const im=PORTHD.imgs[v]||PORTHD.imgs.day;if(!im)return null;
  const pw=PORTRAITS_HD.pw,ph=PORTRAITS_HD.ph,e=Math.max(0,PORTRAITS_HD.expr.indexOf(expr)),r=PORTHD.row[id];if(r===undefined)return null;
  const cv=document.createElement('canvas');cv.width=pw;cv.height=ph;const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(im,e*pw,r*ph,pw,ph,0,0,pw,ph);
  c={cv,d:g.getImageData(0,0,pw,ph).data};if(PLV.cells.size>120)PLV.cells.clear();PLV.cells.set(k,c);return c;}
const plvLum=c=>.299*c[0]+.587*c[1]+.114*c[2];
const plvAt=(d,x,y)=>{const i=((y|0)*PORTRAITS_HD.pw+(x|0))*4;return [d[i],d[i+1],d[i+2],d[i+3]];};
const plvFar=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2]);
// the eyes shut: over each eye (the generator's own eye shape, as wide as its widest open), the lid's skin, and a flat lash line just
// under the middle
// how open each expression holds the eyes (the generator's own upper and lower lid heights)
const PLV_LIDS={neutral:[3.5,2.1],sad:[2.8,2],angry:[2.8,1.7],surprised:[4.4,2.7],scared:[4.6,2.8],love:[2.8,1],cry:[2.4,1.9],smug:[2.2,1.9],think:[3.3,1.9]};
function plvBlink(o,v,id,expr){const G=PLV_GEO[id];if(!G)return;const [edx,ey,ea,eop,tilt]=G,wing=G[10]>0,mg=wing?3.5:1.5;const d=o.data,W=PORTRAITS_HD.pw;const lids=PLV_LIDS[expr]||PLV_LIDS.neutral;
  const put=(x,y,c)=>{const i=(y*W+x)*4;d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255;};const UP=Math.max(lids[0],4.6)*eop+1.7,LO=Math.max(lids[1],2.8)*eop+1.1;
  const cheek=plvAt(d,64,Math.round(ey+LO+5));const med=a=>{const s=a.slice().sort((p,q)=>plvLum(p)-plvLum(q));return s[s.length>>1];};
  for(const sg of [-1,1]){const ecx=64+sg*edx;let lash=null;
    // the eye's outline, a little wider than its widest open, and higher at the outer corner where the lashes flick
    const cols=[];for(let x=Math.floor(ecx-ea-mg);x<=Math.ceil(ecx+ea+mg);x++){const u0=(x-ecx)/(sg*ea),u=Math.max(-1,Math.min(1,u0));const w=Math.max(0,1-u*u);
      const top=Math.floor(ey-UP*Math.pow(w,.72)*(1-.14*u)-tilt*(u+1)/2-(wing&&u0>.55?2:0)),bot=Math.ceil(ey+LO*Math.pow(w,.85)-tilt*.55*(u+1)/2);if(bot<=top)continue;cols.push([x,u,top,bot]);
      for(let y=top;y<=bot;y++){const c=plvAt(d,x,y);if(c[3]>250&&(!lash||plvLum(c)<plvLum(lash)))lash=c;}}
    // the lid's skin: the skin of the cheek just under this eye (blush left out), a shade deeper toward the top of the lid, the way
    // the portraits shade a curved surface
    let y0=1e9,y1=-1;for(const c of cols){y0=Math.min(y0,c[2]);y1=Math.max(y1,c[3]);}
    const sk=[];for(const [x,u] of cols)if(Math.abs(u)<.7)for(let y=y1+2;y<=y1+4;y++){const c=plvAt(d,x,y);if(c[3]>250&&plvFar(c,cheek)<140&&(c[0]-c[2])<=(cheek[0]-cheek[2])+24)sk.push(c);}
    const base=sk.length?med(sk):cheek;
    for(const [x,u,top,bot] of cols)for(let y=top;y<=bot;y++){const k=.93+.07*(y-y0)/Math.max(1,y1-y0);put(x,y,[0,1,2].map(i=>Math.round(base[i]*k)));}
    if(!lash)continue;const L=plvLum(lash)>plvLum(cheek)-40?lash.map((v,i)=>i<3?Math.round(v*.55):v):lash;
    // the lash line: flat, a touch lower in the middle, stopping short of the corners
    for(const [x,u] of cols){if(Math.abs(u)>.92)continue;const w=1-u*u;put(x,Math.round(ey+.6+.5*Math.pow(w,.8)-tilt*.3*(u+1)/2),L);}}}
// the talking mouth: open 1 = half, 2 = open
function plvMouth(o,v,id,open){const G=PLV_GEO[id];if(!G)return;const my=G[5],hw=G[6],lh=G[8];const d=o.data,W=PORTRAITS_HD.pw;const n=plvCell(v,id,'neutral'),sc=plvCell(v,id,'scared');if(!n||!sc)return;
  const put=(x,y,c)=>{const i=(y*W+x)*4;d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255;};const mx=64.3;
  // the lip line: the darkest pixel down the middle near the mouth's height
  let ly=Math.round(my),lv=1e9;for(let y=Math.round(my-2);y<=Math.round(my+2);y++){const l=plvLum(plvAt(n.d,64,y));if(l<lv){lv=l;ly=y;}}
  // the face's own teeth and mouth colours, from its scared mouth: the brightest and the darkest pixel down its middle
  let TE=null,IN=null;for(let y=Math.round(my-1);y<=Math.round(my+4);y++){const c=plvAt(sc.d,64,y);if(!TE||plvLum(c)>plvLum(TE))TE=c;if(!IN||plvLum(c)<plvLum(IN))IN=c;}
  const IN2=IN.map((v,i)=>i<3?Math.round(v*.72):v);
  const H=open===2?5:2;
  // the expression's own mouth gives way to the neutral one, then the opening goes in and the lower lip moves down under it
  for(let y=Math.round(my-4);y<=Math.round(my+lh+H+4);y++)for(let x=Math.floor(mx-hw-2);x<=Math.ceil(mx+hw+2);x++)put(x,y,plvAt(n.d,x,y));
  for(let x=Math.floor(mx-hw);x<=Math.ceil(mx+hw);x++){const u=(x-mx)/hw;if(Math.abs(u)>=1)continue;const oh=Math.round(H*Math.pow(1-u*u,open===2?.7:.9));if(oh<=0)continue;
    for(let y=Math.round(my+lh+H+3);y>=ly+oh;y--)put(x,y,plvAt(n.d,x,y-oh));
    for(let r=0;r<oh;r++){const c=r===0&&Math.abs(u)<(open===2?.55:.4)?TE:(r/oh>.5?IN2:IN);put(x,ly+r,c);}}}
function plvRender(cv,id,expr,blink,mouth){const v=portraitVariant();const pw=PORTRAITS_HD.pw,ph=PORTRAITS_HD.ph;const c=plvCell(v,id,expr);if(!c)return false;
  const b=blink&&!PLV_NOBLINK.has(expr)?1:0,k=['S',v,id,expr,b,mouth||0].join('|');let face=PLV.cells.get(k);
  if(!face){const f=document.createElement('canvas');f.width=pw;f.height=ph;const g=f.getContext('2d');const o=g.createImageData(pw,ph);o.data.set(c.d);
    if(mouth)plvMouth(o,v,id,mouth);if(b)plvBlink(o,v,id,expr);g.putImageData(o,0,0);face={cv:f};PLV.cells.set(k,face);}
  const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,cv.width,cv.height);const s=Math.min(cv.width/pw,cv.height/ph),w=pw*s,h=ph*s;
  g.drawImage(face.cv,0,0,pw,ph,(cv.width-w)/2,cv.height-h,w,h);return true;}
// every portrait drawn into a talking box or a scene is followed; the list, the cards and Caitlyn are not
const _plvDraw=drawPortrait;
drawPortrait=function(cv,id,expr){const r=_plvDraw.apply(this,arguments);try{
    if(r&&PORTHD.ready&&PORTHD.row[id]!==undefined&&PLV_GEO[id]&&!PLV_SKIP.has(id)&&cv&&cv.width>=96&&!(cv.closest&&cv.closest('#maecard'))){const now=performance.now();
      const box=cv.closest&&cv.closest('#talk,#scene')||cv.parentElement;const tx=(box&&box.textContent||'').trim();const len=Math.min(220,tx.length||60);
      const p=PLV.live.get(cv),e=expr||'neutral';const same=p&&p.id===id&&p.tx===tx;
      const beat=!same&&PLV_BEAT.has(EXPR_FALLBACK[e]||e)&&(!p||p.e!==e)?now+340:0;
      PLV.live.set(cv,{id,e,tx,talkTo:same?p.talkTo:now+Math.max(700,Math.min(3200,len*38)),beatTo:same?p.beatTo:beat,blinkAt:p?p.blinkAt:now+1200+Math.random()*2500,blinkTo:0,key:''});
      plvStart();}}catch(e){}return r;};
function plvStart(){if(PLV.tick)return;PLV.tick=setInterval(plvStep,60);}
function plvStep(){const now=performance.now();if(!PLV.live.size){clearInterval(PLV.tick);PLV.tick=null;return;}
  for(const [cv,s] of PLV.live){if(!cv.isConnected||cv.offsetParent===null||(PORTHD.row[s.id]===undefined)){PLV.live.delete(cv);continue;}
    if(now>=s.blinkAt){s.blinkTo=now+120;s.blinkAt=now+2200+Math.random()*3800;}
    const blink=now<s.blinkTo,talking=now<s.talkTo,beat=now<s.beatTo;const expr=beat?'surprised':s.e;
    const q=(now/120|0),ph=(q*7+(q>>2))%6;const mouth=talking&&!beat?(ph<2?0:ph<4?1:ph===4?2:1):0;   // shut, half, open, half: two shapes alternate
    const key=expr+'|'+(blink?1:0)+'|'+mouth+'|'+portraitVariant();
    if(key===s.key)continue;s.key=key;try{plvRender(cv,s.id,expr,blink,mouth);}catch(e){}}}
window.__plv={live:()=>[...PLV.live.values()].map(s=>({id:s.id,e:s.e,key:s.key}))};
