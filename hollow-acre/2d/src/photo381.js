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
   - Every answer is one of the wardrobe's own options: the photo's own colours in the colour slots (skin, hair, the top and the
     trousers; eyes take the nearest swatch), a hairstyle, beard and glasses from its registry. Nothing new is drawn.
   - (v2, owner: "it doesn't look like the person") the hair is found as a whole, spreading from above the forehead, so its length,
     volume and fringe come from where it really ends; the skin is the lit cheek; the top and trousers give their colours.
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
function phMeasure(d,w,h,F){const {r,c,s}=F;
  const at=(x,y)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=w||y>=h)return null;const i=(y*w+x)*4;return [d[i],d[i+1],d[i+2]];};
  const box=(x0,y0,x1,y1)=>{const o=[],st=Math.max(1,Math.round(Math.min(x1-x0,y1-y0)/14));for(let y=y0;y<y1;y+=st)for(let x=x0;x<x1;x+=st){const p=at(x,y);if(p)o.push(p);}return o;};
  const inside=(x0,y0,x1,y1)=>Math.max(0,Math.min(1,((Math.min(w,x1)-Math.max(0,x0))*(Math.min(h,y1)-Math.max(0,y0)))/Math.max(1,(x1-x0)*(y1-y0))));
  // the background: the photo's top corners (when they agree with each other)
  const bgA=box(0,0,w*.14,h*.18),bgB=box(w*.86,0,w,h*.18),bgs=[phCore(bgA,25),phCore(bgB,25)].filter(Boolean).map(phLab);
  const isBg=p=>{if(!bgs.length)return false;const L=phLab(p);return bgs.some(b=>phDE(L,b)<12);};
  // skin: each cheek under the eye, beside the nose; the lit one is the skin's own colour (the other is in shadow)
  const ch=[box(c-.24*s,r+.04*s,c-.1*s,r+.16*s),box(c+.1*s,r+.04*s,c+.24*s,r+.16*s)].map(L=>phCore(L,16)).filter(Boolean);if(!ch.length)return null;
  const skin=ch.length>1&&Math.abs(phLum(ch[0])-phLum(ch[1]))>6?(phLum(ch[0])>phLum(ch[1])?ch[0]:ch[1]):phMed(ch.length>1?ch:[ch[0],ch[0]]);
  const skL=phLab(skin),skY=phLum(skin),skAll=ch.map(phLab);
  const dSkin=p=>{const L=phLab(p);return Math.min(...skAll.map(q=>phDE(L,q)),phDE(L,skL));};
  const dLight=p=>Math.min(...skAll.map(q=>Math.abs(phLab(p)[0]-q[0])),Math.abs(phLab(p)[0]-skL[0]));
  const isSkinT=p=>{const L=phLab(p);return phDE(L,skL)<13&&Math.abs(L[0]-skL[0])<7;},skinLike=p=>{const L=phLab(p);return phDE(L,skL)<16&&Math.abs(L[0]-skL[0])<8;};
  // ---- hair: its colour from above the forehead and the temples, then the whole of it found by spreading from there
  const top=box(c-.3*s,r-.78*s,c+.3*s,r-.52*s),temples=box(c-.48*s,r-.42*s,c-.36*s,r-.1*s).concat(box(c+.36*s,r-.42*s,c+.48*s,r-.1*s));
  const isHairish=p=>!isSkinT(p)&&!isBg(p)&&!skinLike(p);
  // up from the forehead in six columns: past the skin, the first other colour that runs on and then stops is the hair (a bald head
  // goes straight from skin to the background, which runs on to the edge or matches the photo's corners)
  const runs=[];for(const fx of [-.25,-.15,-.05,.05,.15,.25]){const x=c+fx*s;let y=r-.28*s,p=at(x,y);if(!p)continue;
    let ok=0;while(y>r-1.1*s&&(p=at(x,y))&&skinLike(p)){y-=1;ok=1;}if(!p)continue;const y1=y,ref=[];for(let k=0;k<4;k++){const q=at(x,y1-k);if(q)ref.push(q);}
    const R=phLab(phMed(ref));const px=[];while(y>Math.max(0,r-1.3*s)&&(p=at(x,y))&&phDE(phLab(p),R)<20){px.push(p);y-=1;}
    const t=(y1-y)/s,ended=y>Math.max(0,r-1.3*s)+2;if(px.length)runs.push({px,t,ended,col:phMed(px),fr:!ok});}
  const real=runs.filter(u=>u.ended&&u.t>.02&&!bgs.some(b=>phDE(phLab(u.col),b)<12));PH.runs=runs.map(u=>[+u.t.toFixed(2),u.ended,phHex(u.col)]);
  const hairPx=real.length>=2?[].concat(...real.map(u=>u.px)):top.concat(temples).filter(isHairish);const topHair=top.filter(isHairish).length/Math.max(1,top.length),tmpHair=temples.filter(isHairish).length/Math.max(1,temples.length);
  const scalp=box(c-.22*s,r-.62*s,c+.22*s,r-.44*s),scalpSkin=scalp.filter(skinLike).length/Math.max(1,scalp.length);
  let hair=null,bald=false,len='short',full=0,fringe=false,thick=0,hairBottom=null;
  if(real.length<2&&topHair<.15&&tmpHair<.15&&scalpSkin>.3)bald=true;
  else if(real.length>=2)hair=phCore(hairPx,20);
  else if(hairPx.length>=Math.max(8,(top.length+temples.length)*.15))hair=phCore(hairPx,20);
  const crown=real.length?real.map(u=>u.t).sort((a,b)=>a-b)[real.length>>1]:null;
  if(hair){const hL=phLab(hair),tol=phLum(hair)<60?18:22,isHair=p=>phDE(phLab(p),hL)<tol&&!isSkinT(p)&&!isBg(p);
    // a grid of cells over the head and below it; the hair is every hair-coloured cell joined to the hair above the forehead
    const g=s/30,X0=Math.max(0,c-1.15*s),X1=Math.min(w-1,c+1.15*s),Y0=Math.max(0,r-1.1*s),Y1=Math.min(h-1,r+2.7*s);
    const nx=Math.max(1,Math.floor((X1-X0)/g)),ny=Math.max(1,Math.floor((Y1-Y0)/g)),ok=new Uint8Array(nx*ny),on=new Uint8Array(nx*ny);
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const p=at(X0+(i+.5)*g,Y0+(j+.5)*g);if(p&&isHair(p))ok[j*nx+i]=1;}
    const q=[];for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const x=X0+(i+.5)*g,y=Y0+(j+.5)*g;if(ok[j*nx+i]&&y>r-.8*s&&y<r-.5*s&&Math.abs(x-c)<.3*s){on[j*nx+i]=1;q.push(j*nx+i);}}
    while(q.length){const k=q.pop(),i=k%nx,j=(k/nx)|0;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=nx||b>=ny)continue;const kk=b*nx+a;if(ok[kk]&&!on[kk]){on[kk]=1;q.push(kk);}}}
    let bottom=-1e9,reach=0,fr=0,frN=0,topY=1e9;
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){if(!on[j*nx+i])continue;const x=X0+(i+.5)*g,y=Y0+(j+.5)*g,dx=Math.abs(x-c);
      if(dx>.42*s&&dx<.95*s)bottom=Math.max(bottom,y);if(y<r)reach=Math.max(reach,dx);if(dx<.12*s)topY=Math.min(topY,y);}
    for(let y=r-.42*s;y<r-.24*s;y+=g)for(let x=c-.2*s;x<c+.2*s;x+=g){const i=Math.floor((x-X0)/g),j=Math.floor((y-Y0)/g);if(i>=0&&j>=0&&i<nx&&j<ny){frN++;if(on[j*nx+i])fr++;}}
    fringe=frN>0&&fr/frN>.5;full=reach/s;hairBottom=bottom>-1e9?(bottom-r)/s:null;
    // how thick the hair stands on the crown: from its top down to the forehead's skin
    let skinY=null;for(let y=topY;y<r;y+=g){const p=at(c,y);if(p&&skinLike(p)){skinY=y;break;}}thick=crown!=null?crown:skinY!=null&&topY<1e9?(skinY-topY)/s:.3;
    const b=hairBottom;len=b==null||b<.15?(thick<.1&&!fringe&&full<.62?'buzz':'short'):b<.75?'medium':b<1.8?'long':'verylong';}
  // ---- facial hair: the chin under the mouth, the jaw's sides and the upper lip, against the cheeks
  const hL0=hair?phLab(hair):null;
  // (how far from the skin counts as different: less on darker skin, where everything sits closer together)
  const dk=Math.max(12,Math.min(22,skL[0]*.32)),dg=Math.max(14,Math.min(30,skL[0]*.42));
  const dark=p=>{const L=phLab(p),dS=phDE(L,skL),dSh=dSkin(p);return (dSh>dk&&phLum(p)<skY*.72)||(hL0&&dS>8&&phDE(L,hL0)<Math.min(18,dS*.7));};   // (the boxes keep clear of the lips)
  const fr=list=>list.filter(dark).length/Math.max(1,list.length);
  const chin=fr(box(c-.16*s,r+.36*s,c+.16*s,r+.48*s)),jawL=fr(box(c-.34*s,r+.18*s,c-.24*s,r+.38*s)),jawR=fr(box(c+.24*s,r+.18*s,c+.34*s,r+.38*s)),lip=fr(box(c-.12*s,r+.19*s,c+.12*s,r+.24*s));
  const jaw=(jawL+jawR)/2;let beard='';
  if(chin>.45&&jaw>.35)beard='full';else if(chin>.45)beard='goatee';else if(lip>.5&&chin<.3)beard='moustache';else if(chin>.22&&jaw>.18)beard='stubble';
  // ---- glasses: a dark frame across the bridge of the nose, and the rims under the eyes; very dark lenses are shades
  const ey=r-.065*s,ex=.15*s;const fdark=p=>phLum(p)<skY*.6&&dSkin(p)>dg;const ff=list=>list.filter(fdark).length/Math.max(1,list.length);
  const bridge=ff(box(c-.05*s,ey-.06*s,c+.05*s,ey+.03*s)),rims=Math.max(ff(box(c-ex-.1*s,ey+.04*s,c-ex+.1*s,ey+.13*s)),ff(box(c+ex-.1*s,ey+.04*s,c+ex+.1*s,ey+.13*s)));
  const lens=(phLum(phMed(box(c-ex-.06*s,ey-.03*s,c-ex+.06*s,ey+.03*s))||skin)+phLum(phMed(box(c+ex-.06*s,ey-.03*s,c+ex+.06*s,ey+.03*s))||skin))/2;
  let glasses='';if(lens<skY*.3&&bridge>.2)glasses='shades';else if(bridge>.25&&rims>.08||bridge>.45)glasses='frames';
  // ---- eyes: find each pupil (the darkest spot near where the eye should be), then the iris around it
  let eye=null,eyeWhy='';const irisR=.034*s;
  if(irisR<3.5||glasses==='shades')eyeWhy=glasses==='shades'?'shades':'small';
  else{const one=sx=>{let best=null,bl=1e9;const R=.07*s,st=Math.max(1,Math.round(irisR/4));
      for(let y=ey-R*.8;y<ey+R*.8;y+=st)for(let x=sx-R;x<sx+R;x+=st){let L=0,n=0;for(const [dx,dy] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const p=at(x+dx*st,y+dy*st);if(p){L+=phLum(p);n++;}}if(n&&L/n<bl){bl=L/n;best=[x,y];}}
      if(!best)return null;const ring=[];for(let a=0;a<6.28;a+=.25)for(const k of [.55,.7,.85]){const p=at(best[0]+Math.cos(a)*irisR*k,best[1]+Math.sin(a)*irisR*k);
        if(p&&phLum(p)>28&&!(phLum(p)>185&&phHue(p)[1]<.15)&&dSkin(p)>=24)ring.push(p);}
      return ring.length>=10?phCore(ring,18):null;};
    const a=one(c-ex),b=one(c+ex);
    if(a&&b&&phDE(phLab(a),phLab(b))<26)eye=phMed([a,b]);else if(a&&b)eyeWhy='differ';else eyeWhy='unclear';}
  let eyeKind='';if(eye){const [hu,sa,va]=phHue(eye);eyeKind=sa<.16?(va>.42?'grey':'brown'):hu>=170&&hu<=260?'blue':hu>=70&&hu<170?'green':hu>=40&&hu<70&&sa>.3?'hazel':'brown';}
  // ---- clothes: the top across the chest below the neckline, the trousers across the thighs (when the photo shows them).
  // Hair hanging over the top, skin at the neckline and the background between the arms are left out.
  const hLc=hair?phLab(hair):null;
  const clothes=(x0,y0,x1,y1,also)=>{if(inside(x0,y0,x1,y1)<.5)return null;
    const sides=[phCore(box(0,y0,w*.05,y1),20),phCore(box(w*.95,y0,w,y1),20)].filter(Boolean).map(phLab);
    const isEdge=p=>{const L=phLab(p);return sides.some(b=>phDE(L,b)<8)||bgs.some(b=>phDE(L,b)<8);};
    const notIt=p=>skinLike(p)||isEdge(p)||(hLc&&(len==='long'||len==='verylong')&&phDE(phLab(p),hLc)<16)||(also&&also(p));
    const all=box(x0,y0,x1,y1),L=all.filter(p=>!notIt(p));if(L.length<Math.max(12,all.length*.3))return null;const col=phCore(L,18),cL=phLab(col);
    // plain or patterned: every pixel across the middle of it, far from its main colour or not
    let n=0,far=0;const ym=(y0+y1)/2;for(let y=ym-(y1-y0)*.25;y<ym+(y1-y0)*.25;y+=1)for(let x=x0+(x1-x0)*.2;x<x1-(x1-x0)*.2;x+=2){const p=at(x,y);if(!p||notIt(p))continue;n++;if(phDE(phLab(p),cL)>16)far++;}
    return {col,var:n?far/n:0};};
  const topC=clothes(c-.55*s,r+.95*s,c+.55*s,r+1.45*s);
  const tL=topC&&phLab(topC.col),botC=clothes(c-.45*s,r+3.6*s,c+.45*s,r+4.4*s,p=>tL&&phDE(phLab(p),tL)<10);
  return {skin,hair,bald,len,full,fringe,thick,hairBottom,beard,glasses,eye,eyeKind,eyeWhy,
    top:topC?topC.col:null,topPlain:topC?topC.var<.12:null,bottom:botC?botC.col:null,
    raw:{runs:PH.runs,hairBottom,full,thick,fringe,topHair,tmpHair,scalpSkin,chin,jaw,lip,bridge,rims,lens:lens/skY,topVar:topC&&topC.var}};}

// ---- the wardrobe's own choices nearest to what was measured. Colours: the photo's own colour first (every colour slot takes any
// colour), then the nearest swatches of the wardrobe's palette, so ◀ ▶ steps through the palette.
const PH_STYLES={bald:['bald','buzz','receding'],buzz:['buzz','receding','crop'],short:['short','crop','sidepart','undercut','slick','spiky'],shortfringe:['bangs','bowl','pixie','short'],
  shortfull:['afro','curly','shaggy'],medium:['bob','lob','shaggy','mullet'],mediumfringe:['bob','pixie','lob'],mediumfull:['curly','afro','shaggy'],
  long:['long','swoop','wavy','lob','halfup'],longfringe:['long','wavy','swoop'],longfull:['curlylong','wavy','long'],verylong:['waist','long','swoop'],verylongfull:['curlylong','waist','long']};
function phPalette(p){return (typeof wduPal==='function'?wduPal(p):[]).filter(x=>/^#[0-9a-f]{6}$/i.test(x));}
function phNearest(p,rgb,n){const L=phLab(rgb);return phPalette(p).map(h=>[h,phDE(phLab(phRGB(h)),L)]).sort((a,b)=>a[1]-b[1]).slice(0,n||6).map(x=>x[0]);}
const phOwn=(p,rgb,n)=>{const own=phHex(rgb),L=phNearest(p,rgb,n||7).filter(h=>h!==own);return [own].concat(L);};
function phIds(cat,pref,tagWant){const have=id=>!!wdItem(cat,id);const L=pref.filter(have);
  for(const e of WD.reg)if(e.cat===cat&&!L.includes(e.id)&&(!tagWant||tagWant.some(t=>(e.tags||[]).includes(t))))L.push(e.id);return L;}
function phChoices(m){const C={};
  C.skin=phOwn('skin',m.skin);
  C.hair=m.hair?phOwn('hair',m.hair):[];
  const fullK=m.full>.72?'full':m.fringe?'fringe':'',key=m.bald?'bald':m.len==='buzz'?'buzz':m.len+fullK;
  const tags=m.bald||m.len==='buzz'||m.len==='short'?['short']:m.len==='medium'?['medium']:['long'];
  C.style=phIds('hair',PH_STYLES[key]||PH_STYLES[m.len]||PH_STYLES.short,tags);
  const B={full:['full','goatee','stubble',''],goatee:['goatee','full','stubble',''],moustache:['moustache','goatee','stubble',''],stubble:['stubble','full','goatee',''],'':['','stubble','moustache','goatee','full']}[m.beard];
  C.beard=B.filter(id=>!id||wdItem('beard',id));
  const G={frames:['square','round',''],shades:['shades','square',''],'':['','square','round']}[m.glasses];C.glasses=G.filter(id=>!id||wdItem('glasses',id));
  const EYE={brown:[92,56,30],blue:[70,120,180],green:[80,130,78],grey:[120,130,140],hazel:[130,100,50]};
  C.eye=m.eye?phNearest('eye',EYE[m.eyeKind]||m.eye,6):[];
  C.top=m.top?phOwn('cloth',m.top):[];C.bottom=m.bottom?phOwn('cloth',m.bottom):[];C.topPlain=m.topPlain;
  return C;}
// the look these choices make: a copy of the one you have, with the hair, beard, glasses, skin, hair and eye colours and the
// colours of the top and trousers changed (the garments themselves stay; a plain top in the photo makes yours plain)
function phLook(C,P){const w0=S.look.w,w={v:1,it:Object.assign({},w0.it),pat:Object.assign({},w0.pat),c:Object.assign({},w0.c)};const g=k=>C[k]&&C[k].length?C[k][(P[k]||0)%C[k].length]:undefined;
  const st=g('style');if(st)w.it.hair=st;const bd=g('beard');if(bd)w.it.beard=bd;else if(bd==='')delete w.it.beard;
  const gl=g('glasses');if(gl)w.it.glasses=gl;else if(gl==='')delete w.it.glasses;
  const sk=g('skin');if(sk)w.c.skin=sk;const hc=g('hair');if(hc)w.c.hair=hc;const ec=g('eye');if(ec)w.c.eye=ec;
  const tc=g('top');if(tc){w.c.top=tc;if(C.topPlain&&w.pat.top)delete w.pat.top;}const bc=g('bottom');if(bc)w.c.bottom=bc;
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
// a face the player tapped: as wide as the skin around the tap reaches, left and right, on a few rows through it
function phTapFace(d,w,h,tap){const [tx,ty]=tap.map(Math.round);const px=(x,y)=>{const i=(Math.max(0,Math.min(h-1,y))*w+Math.max(0,Math.min(w-1,x)))*4;return [d[i],d[i+1],d[i+2]];};
  const ref=phLab(phMed([px(tx,ty),px(tx-2,ty),px(tx+2,ty),px(tx,ty-2),px(tx,ty+2)]));const ws=[];
  for(const dy of [-12,-6,0,6,12]){const y=ty+dy;let L=tx,R=tx,miss=0;for(let x=tx;x>0&&miss<3;x--){if(phDE(phLab(px(x,y)),ref)<22){L=x;miss=0;}else miss++;}
    miss=0;for(let x=tx;x<w-1&&miss<3;x++){if(phDE(phLab(px(x,y)),ref)<22){R=x;miss=0;}else miss++;}ws.push(R-L);}
  ws.sort((a,b)=>a-b);const fw=ws[2];const s=fw>Math.min(w,h)*.06&&fw<Math.min(w,h)*.9?fw*1.33:Math.min(w,h)*.42;return {r:ty,c:tx,s,q:0,tap:1};}
async function phAnalyze(read,tap){const {g,w,h}=read;const d=g.getImageData(0,0,w,h).data;let F=null;
  if(tap)F=phTapFace(d,w,h,tap);
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
#phWin #phBody{width:120px;height:160px;image-rendering:pixelated;background:radial-gradient(#3a2a1a,#140d08);box-shadow:inset 0 0 0 2px #4a3018}
#phWin #phShot{max-width:160px;max-height:160px;box-shadow:0 0 0 2px #4a3018}
#phWin .phRows{display:flex;flex-direction:column;gap:6px;min-width:0}
#phWin .phRow{display:grid;grid-template-columns:1fr auto auto auto;align-items:center;gap:6px;font-size:15px}
#phWin .phRow b{font-weight:400;color:#cdbf9f}#phWin .phVal{display:flex;align-items:center;gap:6px;min-width:0;justify-content:flex-end;text-align:right;color:#f4e6c8}
#phWin .phSw{width:24px;height:24px;box-shadow:inset 0 0 0 2px #0c0603;flex:none}
#phWin .phRow button{min-height:40px;min-width:40px;padding:4px 8px;font-size:16px}
#phWin .phStage{position:relative;align-self:center}#phWin .phStage canvas{display:block;max-width:100%;max-height:52vh;cursor:crosshair}
@media (max-width:520px){#phWin .phRes{grid-template-columns:1fr}#phWin .phFig{flex-direction:row;justify-content:center;flex-wrap:wrap}#phWin #phPrev{width:96px;height:96px}#phWin #phBody{width:72px;height:96px}#phWin #phShot{max-width:96px;max-height:96px}}
.wdActs #wdPhoto{grid-column:1/-1}
`;document.head.appendChild(css);}
const PH_TXT={skin:'Skin',hair:'Hair colour',style:'Hairstyle',beard:'Facial hair',glasses:'Glasses',eye:'Eyes',top:'Top',bottom:'Trousers'};
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
    <p>Take a photo of yourself, or pick one, and the game picks the nearest skin, hair, facial hair, glasses, eyes and clothes colours from the wardrobe.</p>
    <p class="phSmall">The photo stays on this device. It is looked at once, then thrown away: it isn't sent anywhere or saved.</p>
    ${msg?`<p style="color:#f0a060">${msg}</p>`:''}
    <div class="phBtns">${phTouch()?'<label class="phPick phPrim" id="phCamL">Take a photo<input type="file" accept="image/*" capture="user" id="phCam"></label><label class="phPick" id="phGalL">From the gallery<input type="file" accept="image/*" id="phGal"></label>'
      :'<label class="phPick phPrim" id="phGalL">Choose a photo<input type="file" accept="image/*" id="phGal"></label>'}<button id="phClose" type="button">Cancel</button></div>
    <p class="phSmall">Best: your face straight on, in good light, without a hat, with your top in the picture too.</p></div>`;
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
  const rows=['skin','hair','style','beard','glasses','eye','top','bottom'];
  el.innerHTML=`<div class="phBox"><h3 id="phTitle">Your look, from the photo</h3>
    <div class="phRes"><div class="phFig"><canvas id="phPrev" width="32" height="32" aria-label="Your head, from the photo"></canvas><canvas id="phBody" width="48" height="64" aria-label="You, from the photo"></canvas><canvas id="phShot" aria-hidden="true"></canvas></div>
    <div class="phRows">${rows.map(k=>`<div class="phRow" data-k="${k}"><b>${PH_TXT[k]}</b><span class="phVal"></span><button type="button" data-d="-1" aria-label="Previous ${PH_TXT[k]}">◀</button><button type="button" data-d="1" aria-label="Next ${PH_TXT[k]}">▶</button></div>`).join('')}</div></div>
    <p class="phSmall" id="phNote"></p>
    <div class="phBtns"><button class="phPrim" id="phUse" type="button">Use this look</button><button id="phAgain" type="button">Another photo</button><button id="phClose" type="button">Cancel</button></div></div>`;
  // the photo, small, with the face it found marked (it goes when this window does)
  {const sh=el.querySelector('#phShot'),k=Math.min(1,240/Math.max(res.w,res.h));sh.width=Math.round(res.w*k);sh.height=Math.round(res.h*k);const g=sh.getContext('2d');g.drawImage(PH.read.cv,0,0,sh.width,sh.height);
    const F=res.face;g.strokeStyle='#f0a040';g.lineWidth=2;g.strokeRect((F.c-F.s/2)*k,(F.r-F.s/2)*k,F.s*k,F.s*k);}
  const note=[];if(!m.eye)note.push(m.eyeWhy==='shades'?'Your eyes are behind dark glasses, so your eye colour is kept.':'Your eye colour couldn’t be read from this photo, so it is kept.');
  if(!m.hair&&!m.bald)note.push('The hair colour couldn’t be told from the background, so it is kept.');
  if(!m.top)note.push('Your top isn’t clear in the photo, so its colour is kept.');else if(m.topPlain&&S.look.w.pat&&S.look.w.pat.top)note.push('Your top looks plain, so the pattern comes off.');
  if(!m.bottom)note.push('Your trousers aren’t in the photo, so their colour is kept.');
  el.querySelector('#phNote').textContent=note.join(' ');
  el.querySelectorAll('.phRow').forEach(row=>{const k=row.dataset.k;if(!C[k]||C[k].length<2)row.querySelectorAll('button').forEach(b=>{b.disabled=true;});
    row.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const n=C[k].length;PH.pick[k]=((PH.pick[k]||0)+(+b.dataset.d)+n)%n;SFX.click&&SFX.click();phPaint();});});
  el.querySelector('#phUse').addEventListener('click',phUse);el.querySelector('#phAgain').addEventListener('click',()=>phStart());el.querySelector('#phClose').addEventListener('click',phClose);
  phPaint();const u=el.querySelector('#phUse');if(u)u.focus({preventScroll:true});}
function phPaint(){const el=PH.el,C=PH.C;if(!el||!C)return;const w=phLook(C,PH.pick);
  el.querySelectorAll('.phRow').forEach(row=>{const k=row.dataset.k,v=C[k]&&C[k].length?C[k][(PH.pick[k]||0)%C[k].length]:null,val=row.querySelector('.phVal');let h;
    if(v==null)h='<span class="phSmall">kept as it is</span>';else if(k==='skin'||k==='hair'||k==='eye'||k==='top'||k==='bottom')h=`<span class="phSw" style="background:${v}"></span>`;else h=wduEsc(phLabel(k,v));
    if(val.innerHTML!==h)val.innerHTML=h;});
  // the figure: once its layers have loaded
  // the head and shoulders, close up (what the photo decides), drawn from the figure's own frame facing you
  const need=wdNeed(w,['']);const draw=()=>{const cv=el.querySelector('#phPrev');if(!cv||!PH.el)return;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,32,32);
    const c2=document.createElement('canvas');c2.width=48;c2.height=64;c2.getContext('2d').putImageData(wdFrame(w,'',10,0),0,0);g.drawImage(c2,8,10,32,32,0,0,32,32);
    const bv=el.querySelector('#phBody');if(bv){const b=bv.getContext('2d');b.imageSmoothingEnabled=false;b.clearRect(0,0,48,64);b.fillStyle='rgba(10,14,8,.35)';b.beginPath();b.ellipse(24,60,8,2.2,0,0,Math.PI*2);b.fill();b.drawImage(c2,0,0);}};
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
