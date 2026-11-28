/* ================= PLATFORMS: make me from a photo (owner: "Option to take a photo or add one from your gallery of anyone and it will try
   to make a character that matches that photo so you can get a character that looks like you it still uses the presets and stuff though
   no extra custom stuff").
   - "From a photo" in the character creator and the wardrobe: take one with the camera or pick one from the gallery.
   - Everything happens on this device. The photo is read into a canvas here, looked at once, and thrown away: never sent, never
     saved, never kept after the window closes.
   - The face is found by pico.js (MIT, Nenad Markus; vendor/pico, loaded only when the button is used). Then the photo is measured
     around it: the cheeks give the skin, above the forehead and beside the face give the hair's colour and length and how full it
     is, the chin, jaw and upper lip give facial hair, the bridge of the nose and under the eyes give glasses, and the irises give
     the eye colour when the photo is sharp enough to tell.
   - Every answer is one of the wardrobe's own options: the nearest swatch of its skin, hair and eye palettes, a hairstyle, beard and
     glasses from its registry. Nothing new is drawn.
   - The result is a preview: each row can be stepped to the next-nearest choice, then Use this look (Undo goes back) or Cancel.
   ================= */
const PH={cl:null,loading:null,busy:false,el:null,cv:null,url:null,res:null,pick:{},seq:0};
// ---- the face finder, fetched the first time it's needed
function phLoad(){if(PH.cl)return Promise.resolve(PH.cl);if(PH.loading)return PH.loading;
  PH.loading=new Promise((res,rej)=>{const go=()=>fetch('vendor/pico/facefinder').then(r=>{if(!r.ok)throw new Error('facefinder '+r.status);return r.arrayBuffer();})
      .then(b=>{PH.cl=window.pico.unpack_cascade(new Int8Array(b));res(PH.cl);}).catch(rej);
    if(window.pico&&window.pico.unpack_cascade)return go();const s=document.createElement('script');s.src='vendor/pico/pico.js';s.onload=go;s.onerror=()=>rej(new Error('pico.js'));document.head.appendChild(s);})
    .catch(e=>{PH.loading=null;throw e;});
  return PH.loading;}
// ---- colour: sRGB to CIE Lab, distances in Lab
function phLab(c){const f=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);};const r=f(c[0]),g=f(c[1]),b=f(c[2]);
  const x=(r*.4124+g*.3576+b*.1805)/.95047,y=r*.2126+g*.7152+b*.0722,z=(r*.0193+g*.1192+b*.9505)/1.08883;const t=v=>v>.008856?Math.cbrt(v):7.787*v+16/116;
  const X=t(x),Y=t(y),Z=t(z);return [116*Y-16,500*(X-Y),200*(Y-Z)];}
const phDE=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const phLum=c=>.299*c[0]+.587*c[1]+.114*c[2];
const phHex=c=>'#'+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const phRGB=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
function phMed(list){if(!list.length)return null;const ch=i=>{const a=list.map(p=>p[i]).sort((x,y)=>x-y);return a[a.length>>1];};return [ch(0),ch(1),ch(2)];}
// the middle of a set of colours, then again over only those near it (a stray highlight or shadow doesn't move it)
function phCore(list,tol){let m=phMed(list);if(!m)return null;const L=phLab(m);const near=list.filter(p=>phDE(phLab(p),L)<(tol||22));return near.length>=list.length*.3?phMed(near):m;}
function phHue(c){const r=c[0]/255,g=c[1]/255,b=c[2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}
  return [h,mx?d/mx:0,mx];}

// ---- find the face: the photo as it is, with its contrast stretched, and with its shadows lifted (a dark face in a dim room)
function phDetect(gray,w,h){const params={shiftfactor:.05,minsize:Math.round(Math.min(w,h)*.12),maxsize:Math.max(w,h),scalefactor:1.05};
  const hist=new Uint32Array(256);for(const v of gray)hist[v]++;const cdf=new Float64Array(256);let a=0;for(let i=0;i<256;i++){a+=hist[i];cdf[i]=a/gray.length;}
  const eq=gray.map(v=>Math.round(cdf[v]*255)),lift=gray.map(v=>Math.round(255*Math.pow(v/255,.5)));const out=[];
  for(const px of [gray,eq,lift]){let d=window.pico.run_cascade({pixels:px,nrows:h,ncols:w,ldim:w},PH.cl,params);d=window.pico.cluster_detections(d,.2);for(const x of d)out.push(x);}
  out.sort((p,q)=>q[3]-p[3]);const best=out[0];return best&&best[3]>=15?{r:best[0],c:best[1],s:best[2],q:best[3]}:null;}

// ---- the eyes: a pupil is a dark spot with the white of the eye on both sides. Found near where the face box says they are, they set
// the face's real middle and size (the box can sit a little high or low, or be a little small), so everything else is measured in the
// right places: s becomes the distance between the eyes over 0.3.
function phEyes(d,w,h,F){const {r,c,s}=F;const lum=(x,y)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=w||y>=h)return 128;const i=(y*w+x)*4;return .299*d[i]+.587*d[i+1]+.114*d[i+2];};
  const k=Math.max(1,Math.round(s*.012)),L=(x,y)=>(lum(x,y)+lum(x+k,y)+lum(x-k,y)+lum(x,y+k)+lum(x,y-k))/5,sw=.05*s;
  const find=sx=>{let best=null,bs=-1e9;const st=Math.max(1,Math.round(s*.008));for(let y=r-.2*s;y<r+.06*s;y+=st)for(let x=sx-.11*s;x<sx+.11*s;x+=st){
      const p=L(x,y),a=L(x-sw,y),b=L(x+sw,y),sc=Math.min(a,b)-p-Math.abs(a-b)*.25;if(sc>bs){bs=sc;best=[x,y];}}return bs>18?best:null;};
  const A=find(c-.15*s),B=find(c+.15*s);if(!A||!B)return F;const dx=B[0]-A[0],dy=B[1]-A[1];
  if(dx<.16*s||dx>.48*s||Math.abs(dy)>.1*s)return F;const s2=dx/.3,ey=(A[1]+B[1])/2;return {r:ey+.065*s2,c:(A[0]+B[0])/2,s:s2,q:F.q,eyes:[A,B],tap:F.tap};}
// ---- measure the photo around the face (r,c: the face's middle; s: its size, about forehead to chin). Pure: pixels in, answers out.
function phMeasure(d,w,h,F){const {r,c,s}=F;PH.lenParts=null;PH.lenRaw=null;
  const at=(x,y)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=w||y>=h)return null;const i=(y*w+x)*4;return [d[i],d[i+1],d[i+2]];};
  const box=(x0,y0,x1,y1)=>{const o=[],st=Math.max(1,Math.round(Math.min(x1-x0,y1-y0)/14));for(let y=y0;y<y1;y+=st)for(let x=x0;x<x1;x+=st){const p=at(x,y);if(p)o.push(p);}return o;};
  // the background: the photo's top corners
  const bg=box(0,0,w*.14,h*.22).concat(box(w*.86,0,w,h*.22));const bgL=bg.length?phLab(phCore(bg,25)):null;
  // skin: the cheeks under the eyes, beside the nose
  const cheeks=box(c-.24*s,r+.04*s,c-.1*s,r+.16*s).concat(box(c+.1*s,r+.04*s,c+.24*s,r+.16*s));
  const skin=phCore(cheeks,18);if(!skin)return null;const skL=phLab(skin),skY=phLum(skin);
  // (near: the face's own tones, lit or shaded; close: the skin itself, to tell fair hair and grey hair from it)
  const isSkin=p=>phDE(phLab(p),skL)<24,isSkinT=p=>phDE(phLab(p),skL)<13,isBg=p=>bgL&&phDE(phLab(p),bgL)<12;
  // hair: above the forehead and at the temples, whatever isn't skin or background
  const top=box(c-.3*s,r-.78*s,c+.3*s,r-.52*s),temples=box(c-.48*s,r-.42*s,c-.36*s,r-.1*s).concat(box(c+.36*s,r-.42*s,c+.48*s,r-.1*s));
  const isHairish=p=>!isSkinT(p)&&!isBg(p)&&phDE(phLab(p),skL)>16;
  const hairPx=top.concat(temples).filter(isHairish);const topHair=top.filter(isHairish).length/Math.max(1,top.length),tmpHair=temples.filter(isHairish).length/Math.max(1,temples.length);
  const scalp=box(c-.22*s,r-.62*s,c+.22*s,r-.44*s),scalpSkin=scalp.filter(p=>phDE(phLab(p),skL)<16).length/Math.max(1,scalp.length),topSkin=scalpSkin;
  let hair=null,bald=false;
  if(topHair<.15&&tmpHair<.15&&scalpSkin>.3)bald=true;
  else if(hairPx.length>=Math.max(8,(top.length+temples.length)*.15))hair=phCore(hairPx,20);
  // how long and how full: hair-coloured pixels beside the face at the jaw, below it and at the shoulders; and how wide it stands
  let len='short',full=0;
  if(hair&&!bald){const hL=phLab(hair),isHair=p=>phDE(phLab(p),hL)<(phLum(hair)<60?20:26)&&!isSkinT(p)&&!isBg(p);
    const side=(x0,x1,y0,y1)=>{const L=box(c+x0*s,r+y0*s,c+x1*s,r+y1*s);return L.filter(isHair).length/Math.max(1,L.length);};
    const frac=(y0,y1)=>Math.max(side(-.64,-.42,y0,y1),side(.42,.64,y0,y1));
    const cheek=frac(-.05,.2),jaw=frac(.18,.42),below=frac(.5,.8),shoulder=frac(.85,1.15);PH.lenRaw=[cheek,jaw,below,shoulder];
    // hair has to come down from the head to count: a top or a scarf the colour of the hair, at the shoulders alone, isn't hair
    PH.lenParts={cheek,jaw,below,shoulder};len='short';}
  // (decided once the facial hair is known: a beard the colour of the hair fills the jaw's sides)
  let lenSet=()=>{if(!hair||bald||!PH.lenParts)return;const {cheek,jaw,below,shoulder}=PH.lenParts,jw=beard==='full'||beard==='goatee'?0:jaw;
    const down=cheek>.35||jw>.25;len=down&&below>.3&&shoulder>.2?'long':down?'medium':'short';};
  if(hair&&!bald){const hL=phLab(hair),isHair=p=>phDE(phLab(p),hL)<(phLum(hair)<60?20:26)&&!isSkinT(p)&&!isBg(p);
    // fullness: how far the hair reaches sideways above the ears, in face sizes
    let reach=0;for(const side of [-1,1])for(let k=.4;k<1.05;k+=.05){const p=box(c+side*k*s-.025*s,r-.45*s,c+side*k*s+.025*s,r-.2*s);if(p.filter(isHair).length>p.length*.4)reach=Math.max(reach,k);}
    full=reach;}
  // facial hair: the chin under the mouth, the jaw's sides and the upper lip, against the cheeks
  const hL0=hair?phLab(hair):null;
  // (how far from the skin counts as different: less on darker skin, where everything sits closer together)
  const dk=Math.max(12,Math.min(22,skL[0]*.32)),dg=Math.max(14,Math.min(30,skL[0]*.42));
  const dark=p=>{const L=phLab(p),dS=phDE(L,skL);return (dS>dk&&phLum(p)<skY*.72)||(hL0&&dS>12&&phDE(L,hL0)<18);};   // (the boxes keep clear of the lips)
  const fr=list=>list.filter(dark).length/Math.max(1,list.length);
  const chin=fr(box(c-.16*s,r+.36*s,c+.16*s,r+.48*s)),jawL=fr(box(c-.34*s,r+.18*s,c-.24*s,r+.38*s)),jawR=fr(box(c+.24*s,r+.18*s,c+.34*s,r+.38*s)),lip=fr(box(c-.12*s,r+.19*s,c+.12*s,r+.24*s));
  const jaw=(jawL+jawR)/2;let beard='';
  if(chin>.45&&jaw>.35)beard='full';else if(chin>.45)beard='goatee';else if(lip>.5&&chin<.3)beard='moustache';else if(chin>.22&&jaw>.18)beard='stubble';
  lenSet();
  // glasses: a dark frame across the bridge of the nose, and the rims under the eyes; very dark lenses are shades
  const ey=r-.065*s,ex=.15*s;const fdark=p=>phLum(p)<skY*.6&&phDE(phLab(p),skL)>dg;const ff=list=>list.filter(fdark).length/Math.max(1,list.length);
  const bridge=ff(box(c-.05*s,ey-.06*s,c+.05*s,ey+.03*s)),rims=Math.max(ff(box(c-ex-.1*s,ey+.04*s,c-ex+.1*s,ey+.13*s)),ff(box(c+ex-.1*s,ey+.04*s,c+ex+.1*s,ey+.13*s)));
  const lens=(phLum(phMed(box(c-ex-.06*s,ey-.03*s,c-ex+.06*s,ey+.03*s))||skin)+phLum(phMed(box(c+ex-.06*s,ey-.03*s,c+ex+.06*s,ey+.03*s))||skin))/2;
  let glasses='';if(lens<skY*.3&&bridge>.2)glasses='shades';else if(bridge>.25&&rims>.08||bridge>.45)glasses='frames';
  // eyes: find each pupil (the darkest spot near where the eye should be), then the iris around it
  let eye=null,eyeWhy='';const irisR=.034*s;
  if(irisR<3.5||glasses==='shades')eyeWhy=glasses==='shades'?'shades':'small';
  else{const one=sx=>{let best=null,bl=1e9;const R=.07*s,st=Math.max(1,Math.round(irisR/4));
      for(let y=ey-R*.8;y<ey+R*.8;y+=st)for(let x=sx-R;x<sx+R;x+=st){let L=0,n=0;for(const [dx,dy] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const p=at(x+dx*st,y+dy*st);if(p){L+=phLum(p);n++;}}if(n&&L/n<bl){bl=L/n;best=[x,y];}}
      if(!best)return null;const ring=[];for(let a=0;a<6.28;a+=.25)for(const k of [.55,.7,.85]){const p=at(best[0]+Math.cos(a)*irisR*k,best[1]+Math.sin(a)*irisR*k);
        if(p&&phLum(p)>28&&!(phLum(p)>185&&phHue(p)[1]<.15)&&!isSkin(p))ring.push(p);}
      return ring.length>=10?phCore(ring,18):null;};
    const a=one(c-ex),b=one(c+ex);
    if(a&&b&&phDE(phLab(a),phLab(b))<26)eye=phMed([a,b]);else if(a&&b)eyeWhy='differ';else eyeWhy='unclear';}
  let eyeKind='';if(eye){const [hu,sa,va]=phHue(eye);eyeKind=sa<.16?(va>.42?'grey':'brown'):hu>=170&&hu<=260?'blue':hu>=70&&hu<170?'green':hu>=40&&hu<70&&sa>.3?'hazel':'brown';}
  return {skin,hair,bald,len,full,beard,glasses,eye,eyeKind,eyeWhy,raw:{len:PH.lenRaw,topSkin,topHair,tmpHair,chin,jaw,lip,bridge,rims,lens:lens/skY}};}

// ---- the wardrobe's own choices nearest to what was measured
const PH_STYLES={bald:['bald','buzz','receding'],short:['short','crop','sidepart','undercut','spiky','buzz','slick'],shortfull:['afro','curly','shaggy'],
  medium:['bob','lob','shaggy','mullet'],mediumfull:['curly','afro','shaggy'],long:['long','wavy','swoop','waist','ponytail'],longfull:['curlylong','wavy','long']};
function phPalette(p){return (typeof wduPal==='function'?wduPal(p):[]).filter(x=>/^#[0-9a-f]{6}$/i.test(x));}
function phNearest(p,rgb,n){const L=phLab(rgb);return phPalette(p).map(h=>[h,phDE(phLab(phRGB(h)),L)]).sort((a,b)=>a[1]-b[1]).slice(0,n||6).map(x=>x[0]);}
function phIds(cat,pref,tagWant){const have=id=>!!wdItem(cat,id);const L=pref.filter(have);
  for(const e of WD.reg)if(e.cat===cat&&!L.includes(e.id)&&(!tagWant||tagWant.some(t=>(e.tags||[]).includes(t))))L.push(e.id);return L;}
function phChoices(m){const C={};
  C.skin=phNearest('skin',m.skin,8);
  C.hair=m.hair?phNearest('hair',m.hair,8):[];
  const key=m.bald?'bald':m.len+(m.full>.72?'full':'');const tags=m.bald?['short']:m.len==='long'?['long']:m.len==='medium'?['medium','long']:['short'];
  C.style=phIds('hair',PH_STYLES[key]||PH_STYLES.short,tags);
  const B={full:['full','goatee','stubble',''],goatee:['goatee','full','stubble',''],moustache:['moustache','goatee','stubble',''],stubble:['stubble','full','goatee',''],'':['','stubble','moustache','goatee','full']}[m.beard];
  C.beard=B.filter(id=>!id||wdItem('beard',id));
  const G={frames:['square','round',''],shades:['shades','square',''],'':['','square','round']}[m.glasses];C.glasses=G.filter(id=>!id||wdItem('glasses',id));
  const EYE={brown:[92,56,30],blue:[70,120,180],green:[80,130,78],grey:[120,130,140],hazel:[130,100,50]};
  C.eye=m.eye?phNearest('eye',EYE[m.eyeKind]||m.eye,6):[];
  return C;}
// the look these choices make: a copy of the one you have, with only the hair, beard, glasses, skin, hair colour and eye colour changed
function phLook(C,P){const w0=S.look.w,w={v:1,it:Object.assign({},w0.it),pat:Object.assign({},w0.pat),c:Object.assign({},w0.c)};const g=k=>C[k]&&C[k].length?C[k][(P[k]||0)%C[k].length]:undefined;
  const st=g('style');if(st)w.it.hair=st;const bd=g('beard');if(bd)w.it.beard=bd;else if(bd==='')delete w.it.beard;
  const gl=g('glasses');if(gl)w.it.glasses=gl;else if(gl==='')delete w.it.glasses;
  const sk=g('skin');if(sk)w.c.skin=sk;const hc=g('hair');if(hc)w.c.hair=hc;const ec=g('eye');if(ec)w.c.eye=ec;
  // a hairstyle or glasses with their own first colours (a straw hat's yellow) bring them, as picking them in the wardrobe does
  for(const [pos,id] of [['hair',st],['glasses',gl]]){const e=id&&wdItem(pos,id);if(e&&e.def)for(const k in e.def)if(!(k in w0.c))w.c[k]=e.def[k];}
  return wdClean(w);}

// ---- reading the photo: any size, turned the right way up by the browser, scaled to at most 640 px for the measuring
function phRead(file){return new Promise((res,rej)=>{const url=URL.createObjectURL(file);PH.url=url;const im=new Image();im.decoding='async';
  im.onload=()=>{const k=Math.min(1,640/Math.max(im.naturalWidth,im.naturalHeight)),w=Math.max(1,Math.round(im.naturalWidth*k)),h=Math.max(1,Math.round(im.naturalHeight*k));
    const cv=PH.cv||(PH.cv=document.createElement('canvas'));cv.width=w;cv.height=h;const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0,w,h);
    URL.revokeObjectURL(url);PH.url=null;im.src='';res({cv,g,w,h});};
  im.onerror=()=>{URL.revokeObjectURL(url);PH.url=null;rej(new Error('That file isn’t a picture this browser can open.'));};im.src=url;});}
function phForget(){try{if(PH.url)URL.revokeObjectURL(PH.url);}catch(e){}PH.url=null;if(PH.cv){try{PH.cv.getContext('2d').clearRect(0,0,PH.cv.width,PH.cv.height);}catch(e){}PH.cv.width=PH.cv.height=0;}
  PH.res=null;PH.read=null;const f=PH.el&&PH.el.querySelectorAll('input[type=file]');if(f)f.forEach(i=>{i.value='';});const sh=PH.el&&PH.el.querySelector('#phShot');if(sh){sh.width=sh.height=0;}}
async function phAnalyze(read,tap){const {g,w,h}=read;const d=g.getImageData(0,0,w,h).data;let F=null;
  if(tap)F={r:tap[1],c:tap[0],s:Math.min(w,h)*.42,q:0,tap:1};
  else{await phLoad();const gray=new Uint8Array(w*h);for(let i=0;i<w*h;i++)gray[i]=(2*d[i*4]+7*d[i*4+1]+d[i*4+2])/10;F=phDetect(gray,w,h);}
  if(!F)return {face:null};F=phEyes(d,w,h,F);const m=phMeasure(d,w,h,F);return {face:F,m,w,h};}

// ---- the window
{const css=document.createElement('style');css.textContent=`
#phWin{position:fixed;inset:0;z-index:2147482000;display:flex;align-items:center;justify-content:center;background:rgba(6,4,3,.78);padding:max(12px,env(safe-area-inset-top)) 12px max(12px,env(safe-area-inset-bottom));box-sizing:border-box;font-family:'Hollow Pixel',ui-monospace,monospace}
#phWin .phBox{width:min(560px,100%);max-height:100%;overflow:auto;background:#1c120a;color:#f4e6c8;padding:16px 16px 14px;box-sizing:border-box;box-shadow:inset 0 0 0 2px #0c0603,inset 0 0 0 4px #b8742c,inset 0 0 0 6px #2a1608,6px 6px 0 rgba(0,0,0,.5);display:flex;flex-direction:column;gap:12px}
#phWin h3{margin:0;font-size:22px;color:#ffd27a;font-weight:400}
#phWin p{margin:0;font-size:16px;line-height:1.4;color:#e8dcc0}#phWin .phSmall{font-size:14px;color:#b8a888}
#phWin .phBtns{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
#phWin button,#phWin label.phPick{font:inherit;font-size:17px;min-height:44px;padding:8px 16px;color:#f4e6c8;background:#3a2210;border:1px solid #0c0603;cursor:pointer;box-shadow:inset 0 2px 0 #5a3a1e,inset 0 -2px 0 #120a04;display:inline-flex;align-items:center;justify-content:center;gap:6px}
#phWin .phPrim{background:#a8502a!important;color:#fff2d8!important;box-shadow:inset 0 0 0 2px #2a0e04,inset 0 3px 0 #f0a050,inset 0 -3px 0 #6a2a10!important}
#phWin button:focus-visible,#phWin label.phPick:focus-within,#phWin button.gpF{outline:2px solid #f0a040;outline-offset:2px}
#phWin input[type=file]{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
#phWin .phRes{display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:start}
#phWin .phFig{display:flex;flex-direction:column;align-items:center;gap:6px}
#phWin #phPrev{width:160px;height:160px;image-rendering:pixelated;background:radial-gradient(#3a2a1a,#140d08);box-shadow:inset 0 0 0 2px #4a3018}
#phWin #phShot{max-width:144px;max-height:120px;box-shadow:0 0 0 2px #4a3018}
#phWin .phRows{display:flex;flex-direction:column;gap:6px;min-width:0}
#phWin .phRow{display:grid;grid-template-columns:1fr auto auto auto;align-items:center;gap:6px;font-size:15px}
#phWin .phRow b{font-weight:400;color:#cdbf9f}#phWin .phVal{display:flex;align-items:center;gap:6px;min-width:0;justify-content:flex-end;text-align:right;color:#f4e6c8}
#phWin .phSw{width:24px;height:24px;box-shadow:inset 0 0 0 2px #0c0603;flex:none}
#phWin .phRow button{min-height:40px;min-width:40px;padding:4px 8px;font-size:16px}
#phWin .phStage{position:relative;align-self:center}#phWin .phStage canvas{display:block;max-width:100%;max-height:52vh;cursor:crosshair}
@media (max-width:520px){#phWin .phRes{grid-template-columns:1fr}#phWin .phFig{flex-direction:row;justify-content:center}#phWin #phPrev{width:128px;height:128px}}
.wdActs #wdPhoto{grid-column:1/-1}
`;document.head.appendChild(css);}
const PH_TXT={skin:'Skin',hair:'Hair colour',style:'Hairstyle',beard:'Facial hair',glasses:'Glasses',eye:'Eyes'};
function phLabel(k,v){if(k==='style'){const e=wdItem('hair',v);return e?e.label:v;}if(k==='beard')return v?((wdItem('beard',v)||{}).label||v):'None';
  if(k==='glasses')return v?((wdItem('glasses',v)||{}).label||v):'None';return '';}
function phOpen(){if(PH.el)return;const host=$('wdRoot')||$('creator')||document.body;   // (inside the wardrobe's own root: the creator hides anything else)
  const el=PH.el=document.createElement('div');el.id='phWin';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','phTitle');
  host.appendChild(el);for(const t of ['keydown','keyup','keypress'])el.addEventListener(t,e=>{if(e.key==='Escape'){phClose();e.preventDefault();}e.stopPropagation();});
  el.addEventListener('pointerdown',e=>e.stopPropagation());phStart();}
function phClose(){phForget();if(PH.el){PH.el.remove();PH.el=null;}PH.seq++;PH.busy=false;const b=$('wdPhoto');if(b)try{b.focus();}catch(e){}}
const phTouch=()=>matchMedia('(pointer:coarse)').matches;
function phStart(msg){const el=PH.el;if(!el)return;phForget();
  el.innerHTML=`<div class="phBox"><h3 id="phTitle">Make me from a photo</h3>
    <p>Take a photo of your face, or pick one, and the game picks the nearest skin, hair, facial hair, glasses and eyes from the wardrobe.</p>
    <p class="phSmall">The photo stays on this device. It is looked at once, then thrown away: it isn't sent anywhere or saved.</p>
    ${msg?`<p style="color:#f0a060">${msg}</p>`:''}
    <div class="phBtns">${phTouch()?'<label class="phPick phPrim" id="phCamL">Take a photo<input type="file" accept="image/*" capture="user" id="phCam"></label><label class="phPick" id="phGalL">From the gallery<input type="file" accept="image/*" id="phGal"></label>'
      :'<label class="phPick phPrim" id="phGalL">Choose a photo<input type="file" accept="image/*" id="phGal"></label>'}<button id="phClose" type="button">Cancel</button></div>
    <p class="phSmall">Best: your face straight on, in good light, without a hat.</p></div>`;
  for(const id of ['phCam','phGal']){const i=el.querySelector('#'+id);if(i)i.addEventListener('change',()=>{const f=i.files&&i.files[0];if(f)phRun(f);});}
  for(const id of ['phCamL','phGalL']){const l=el.querySelector('#'+id);if(l){l.tabIndex=0;l.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();l.querySelector('input').click();}});}}
  el.querySelector('#phClose').addEventListener('click',phClose);const f=el.querySelector('#phCamL,#phGalL');if(f)f.focus();}
async function phRun(file,tap){const seq=++PH.seq;const el=PH.el;if(!el)return;PH.busy=true;
  el.innerHTML=`<div class="phBox"><h3 id="phTitle">Looking at your photo…</h3><p class="phSmall">On this device only.</p><div class="phBtns"><button id="phClose" type="button">Cancel</button></div></div>`;
  el.querySelector('#phClose').addEventListener('click',phClose);
  let read;try{read=await phRead(file);}catch(e){if(seq===PH.seq)phStart(e.message);return;}
  PH.read=read;await phGo(seq,null);}
async function phGo(seq,tap){const read=PH.read;let res;try{res=await phAnalyze(read,tap);}catch(e){console.warn(e);if(seq===PH.seq)phStart('The face finder couldn’t load. Check the connection and try again.');return;}
  if(seq!==PH.seq||!PH.el)return;
  if(!res.face||!res.m){phTapAsk(seq);return;}
  PH.res=res;PH.C=phChoices(res.m);PH.pick={};phShow(seq);}
// no face found: the player taps the middle of their face on the photo
function phTapAsk(seq){const el=PH.el,read=PH.read;el.innerHTML=`<div class="phBox"><h3 id="phTitle">Where's your face?</h3><p>It couldn't find a face by itself. Tap the middle of your face in the photo.</p>
    <div class="phStage"><canvas id="phTap"></canvas></div><div class="phBtns"><button id="phAgain" type="button">Another photo</button><button id="phClose" type="button">Cancel</button></div></div>`;
  const cv=el.querySelector('#phTap');cv.width=read.w;cv.height=read.h;cv.getContext('2d').drawImage(read.cv,0,0);
  cv.addEventListener('click',e=>{const b=cv.getBoundingClientRect();const x=(e.clientX-b.left)/b.width*read.w,y=(e.clientY-b.top)/b.height*read.h;cv.width=0;phGo(seq,[x,y]);});
  el.querySelector('#phAgain').addEventListener('click',()=>phStart());el.querySelector('#phClose').addEventListener('click',phClose);}
function phShow(seq){const el=PH.el,res=PH.res,C=PH.C,m=res.m;if(!el)return;
  const rows=['skin','hair','style','beard','glasses','eye'];
  el.innerHTML=`<div class="phBox"><h3 id="phTitle">Your look, from the photo</h3>
    <div class="phRes"><div class="phFig"><canvas id="phPrev" width="32" height="32" aria-label="You, from the photo"></canvas><canvas id="phShot" aria-hidden="true"></canvas></div>
    <div class="phRows">${rows.map(k=>`<div class="phRow" data-k="${k}"><b>${PH_TXT[k]}</b><span class="phVal"></span><button type="button" data-d="-1" aria-label="Previous ${PH_TXT[k]}">◀</button><button type="button" data-d="1" aria-label="Next ${PH_TXT[k]}">▶</button></div>`).join('')}</div></div>
    <p class="phSmall" id="phNote"></p>
    <div class="phBtns"><button class="phPrim" id="phUse" type="button">Use this look</button><button id="phAgain" type="button">Another photo</button><button id="phClose" type="button">Cancel</button></div></div>`;
  // the photo, small, with the face it found marked (it goes when this window does)
  {const sh=el.querySelector('#phShot'),k=Math.min(1,240/Math.max(res.w,res.h));sh.width=Math.round(res.w*k);sh.height=Math.round(res.h*k);const g=sh.getContext('2d');g.drawImage(PH.read.cv,0,0,sh.width,sh.height);
    const F=res.face;g.strokeStyle='#f0a040';g.lineWidth=2;g.strokeRect((F.c-F.s/2)*k,(F.r-F.s/2)*k,F.s*k,F.s*k);}
  const note=[];if(!m.eye)note.push(m.eyeWhy==='shades'?'Your eyes are behind dark glasses, so your eye colour is kept.':'Your eye colour couldn’t be read from this photo, so it is kept.');
  if(!m.hair&&!m.bald)note.push('The hair colour couldn’t be told from the background, so it is kept.');
  el.querySelector('#phNote').textContent=note.join(' ');
  el.querySelectorAll('.phRow').forEach(row=>{const k=row.dataset.k;if(!C[k]||C[k].length<2)row.querySelectorAll('button').forEach(b=>{b.disabled=true;});
    row.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const n=C[k].length;PH.pick[k]=((PH.pick[k]||0)+(+b.dataset.d)+n)%n;SFX.click&&SFX.click();phPaint();});});
  el.querySelector('#phUse').addEventListener('click',phUse);el.querySelector('#phAgain').addEventListener('click',()=>phStart());el.querySelector('#phClose').addEventListener('click',phClose);
  phPaint();const u=el.querySelector('#phUse');if(u)u.focus();}
function phPaint(){const el=PH.el,C=PH.C;if(!el||!C)return;const w=phLook(C,PH.pick);
  el.querySelectorAll('.phRow').forEach(row=>{const k=row.dataset.k,v=C[k]&&C[k].length?C[k][(PH.pick[k]||0)%C[k].length]:null,val=row.querySelector('.phVal');let h;
    if(v==null)h='<span class="phSmall">kept as it is</span>';else if(k==='skin'||k==='hair'||k==='eye')h=`<span class="phSw" style="background:${v}"></span>`;else h=wduEsc(phLabel(k,v));
    if(val.innerHTML!==h)val.innerHTML=h;});
  // the figure: once its layers have loaded
  // the head and shoulders, close up (what the photo decides), drawn from the figure's own frame facing you
  const need=wdNeed(w,['']);const draw=()=>{const cv=el.querySelector('#phPrev');if(!cv||!PH.el)return;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,32,32);
    const c2=document.createElement('canvas');c2.width=48;c2.height=64;c2.getContext('2d').putImageData(wdFrame(w,'',10,0),0,0);g.drawImage(c2,8,10,32,32,0,0,32,32);};
  if(need.length)loadImages(need).then(draw).catch(draw);else draw();}
function phUse(){if(!PH.C)return;const w=phLook(PH.C,PH.pick);S.look.w=wdClean(w);wdSync();try{wduPush();}catch(e){}try{wduChanged(true);}catch(e){}SFX.click&&SFX.click();phClose();
  try{toast('Your look is from the photo now. Undo puts the old one back.',3.2);}catch(e){}}
// the button, with the wardrobe's own (Undo, Redo, Surprise me, Outfits), spanning the row
if(typeof wduBuild==='function'){const _b=wduBuild;wduBuild=function(){const r=_b.apply(this,arguments);
  try{const a=document.querySelector('#wdRoot .wdActs');if(a&&!$('wdPhoto')){const b=document.createElement('button');b.id='wdPhoto';b.type='button';b.innerHTML='<span class="wdLg">Make me from a photo</span><span class="wdS">From a photo</span>';
      b.addEventListener('click',()=>{SFX.click&&SFX.click();phOpen();});a.appendChild(b);}}catch(e){console.warn(e);}return r;};}
// (for the tests: measure a picture by its address, the same way a chosen photo is)
window.__photo={async fromUrl(u,tap){const b=await (await fetch(u)).blob();const read=await phRead(b);PH.read=read;const res=await phAnalyze(read,tap);const out={face:res.face,m:res.m};
  if(res.m){const C=phChoices(res.m);out.choices=C;out.look=wdEnc(phLook(C,{}));}phForget();PH.read=null;return out;},open:()=>phOpen(),run:f=>phRun(f),get state(){return PH;}};
