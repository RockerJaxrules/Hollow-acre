/* ================= t371 the butcher's block, optional, and when you do it yourself, as bad as it is (owner: "I also want the
   butchering mechanic to be optional but because it's optional bloody and gruesome"). A Gameplay setting, Butchering: Do it
   yourself / Leave it to Ezra, asked once at the block the first time. Ezra takes the animal away and the meat comes back the next
   morning in a parcel, a little less of it, and there is no scene. Done yourself, the knife game is the whole of it: blood wells in
   each cut and spurts as the knife goes, runs down and pools on the block; the cut gapes to show the fat, the muscle and the bone;
   the bird's head lies where it fell and the cow's hangs from the rail by a hook; and when the belly is opened, what was inside
   comes out. Gore: Toned down keeps it readable with much less: darker blood that only wells and pools, no spurts, no entrails,
   no heads. Drawn in code as hand-placed clusters on hue-shifted ramps (wet lights warm, shadows toward violet); every sound is
   the game's own synth. ================= */
const BG71={};
// ---------------------------------------------------------------- the setting, and asking once
try{SET7_DEF.butcher='self';if(SET7.butcher!=='self'&&SET7.butcher!=='ezra')SET7.butcher='self';if(SET7_GK.gameplay.indexOf('butcher')<0)SET7_GK.gameplay.push('butcher');}catch(e){}
{const _r=set7Rows;set7Rows=function(g){const R=_r.apply(this,arguments);if(g==='gameplay'){const i=R.findIndex(r=>r.type==='button');
    R.splice(i<0?R.length:i,0,{k:'butcher',type:'choice',label:'Butchering',opts:[['self','Do it yourself'],['ezra','Leave it to Ezra']],sub:'Ezra takes the animal; the meat comes back in the morning, a little less of it'});}return R;};}
{const _a=set7Apply;set7Apply=function(k){const r=_a.apply(this,arguments);if(k==='butcher'&&!SET7.butchAsked){SET7.butchAsked=true;set7Save();}return r;};}
BG71.ezra=()=>typeof SET7!=='undefined'&&SET7.butcher==='ezra';
// ---------------------------------------------------------------- leaving it to Ezra: the animal goes, the meat comes back wrapped
BG71.send=k=>{if(k==='hen'){S.henN=Math.max(0,HENS.length-1);henSync();}else{S.cows--;S.milk=Math.min(S.milk,S.cows*2);if(typeof placeFarmCows==='function')placeFarmCows();}
  S.bgParcel=(S.bgParcel||[]).concat([{k,day:S.day}]);S.butchered=(S.butchered||0)+1;
  if(typeof addFriend==='function')addFriend('ezra',k==='cow'?-4:-2);if(typeof addXP==='function')addXP('farming',k==='cow'?8:3);};
{const V=vendors.b_butcher,_rows=V.rows;V.rows=()=>_rows().map(r=>{if(!BG71.ezra()||(r.k!=='hen'&&r.k!=='cow'))return r;const hen=r.k==='hen';
  return Object.assign({},r,{btn:'Send her to Ezra',desc:hen?(HENS.length?`Ezra comes up the lane with a crate. In the morning the meat comes back wrapped, a little less of it: one dressed hen and some bone meal. You don’t have to watch. You have ${HENS.length}.`:'The coop is empty.')
      :(S.cows?`Ezra leads her down the lane on a rope. In the morning: three cuts of beef, her hide and bone meal, a little less than you’d get yourself. You have ${S.cows}.`:'The barn is empty.'),
    buy(){BG71.send(r.k);}});});}
BG71.go=r=>{r.buy();try{updateHud&&updateHud();}catch(e){}
  toast(r.k==='hen'?'Ezra takes her away in a crate with a sack over it. She doesn’t make a sound until the lane bends. The meat comes in the morning.':'Ezra leads her off down the lane. She looks back once, at the barn. The meat comes in the morning.',3.6);
  try{A.hiss(.5,.05,'lowpass',500);}catch(e){}try{renderCraft();}catch(e){}};
BG71.ask=(r,type,done,_cg)=>{const side=$('crSide');if(!side){SET7.butchAsked=true;set7Save();return _cg(type,r,done);}
  side.innerHTML=`<div class="big"><h3>Who does it?</h3></div><div class="d">You can do it yourself, here at the block, and see all of it. Or Ezra will take her away and bring the meat back in the morning, wrapped, a little less of it.</div>
    <div class="u37row" style="margin-top:8px"><button class="btn make hot" id="bgSelf">Do it yourself</button><button class="btn make" id="bgEzra">Leave it to Ezra</button></div>
    <div class="d" style="opacity:.75;margin-top:6px">You can change this in Settings, Gameplay.</div>`;
  const pick=v=>{SET7.butchAsked=true;set7Save();set7('butcher',v);
    if(v==='ezra'){const r2=vendors.b_butcher.rows().find(q=>q.k===r.k);if(r2&&craftOK('b_butcher',r2))BG71.go(r2);else renderCraft();}else _cg(type,r,done);};
  $('bgSelf').addEventListener('click',()=>pick('self'));$('bgEzra').addEventListener('click',()=>pick('ezra'));try{$('bgSelf').focus();}catch(e){}};
{const _cg=craftGame;craftGame=function(type,r,done){const v=typeof CR!=='undefined'&&CR.v;
  if(v==='b_butcher'&&r&&(r.k==='hen'||r.k==='cow')){if(!SET7.butchAsked){BG71.ask(r,type,done,_cg);return;}if(BG71.ezra()){BG71.go(r);return;}}
  return _cg.apply(this,arguments);};}
// the plain-make shortcut skips the game, so it isn't offered while Ezra does it (his button sends her)
{const _rc=renderCraft;renderCraft=function(){_rc.apply(this,arguments);try{if(CR.v!=='b_butcher'||!BG71.ezra())return;const p=$('u37plain');if(p){const row=p.parentNode;p.remove();if(row&&row.className==='u37row'){const b=$('crMake');if(b)row.replaceWith(b);}}}catch(e){}};}
// the parcel on the step in the morning
{const _nd=newDay;newDay=function(){const ret=_nd.apply(this,arguments);try{const P=S.bgParcel;if(P&&P.length){const due=P.filter(p=>p.day<S.day);if(due.length){S.bgParcel=P.filter(p=>p.day>=S.day);
    let hen=0,cow=0;for(const p of due){if(p.k==='hen'){addInv('poultry',1);addInv('fert',1);hen++;}else{addInv('beef',3);addInv('hide',1);addInv('fert',1);cow++;}}
    setTimeout(()=>toast(cow?'Parcels on the step, heavy, the brown paper gone soft and dark at the folds. On the label, in pencil, just: “Her.” Three cuts of beef, the hide rolled and salted, bone meal. Ezra kept the rest.'+(hen?' And a smaller one: “Hen.”':'')
      :'A parcel on the step in brown paper and butcher’s string, still cold from Ezra’s cellar. On the label, in pencil: “Hen.” One dressed hen and a twist of bone meal. Less than she was.',5.2),2600);}}}catch(e){}return ret;};}

// ---------------------------------------------------------------- ramps (hue-shifted: shadows toward violet, wet lights warm)
BG71.BL=['#1a0412','#36061a','#580a1c','#7e1220','#a81e22','#cc3e2c','#f0805a'];
BG71.BLT=['#120608','#1e080c','#2a0b10','#381014','#441418','#4a181a','#4a181a'];
BG71.FATH=['#7a5a2a','#b08a40','#d8b460','#f0d88e'];
BG71.MH=['#5a1a22','#8a2e32','#b04a46','#cc6a5e'];
BG71.GUT=['#24101e','#4a2236','#76404e','#a46066','#c98880','#e8b4a0'];
BG71.LIV=['#14040c','#2e0a16','#4c1420','#6a2028','#8c3434','#b45a4a'];
BG71.GIZ=['#1e0c1a','#3c1828','#5e2834','#82404a','#a8605e','#d0a0a0'];
BG71.PAUNCH=['#1e1a2a','#3a3448','#5e5668','#887e8c','#b0a6ac','#d6ccc8'];
BG71.CAV=['#12020c','#260614','#3e0a18','#58101c','#701a22'];
BG71.HIDE=['#24121a','#42221e','#683a28','#8e5a36','#b2804a','#d0a466','#e8cc9c'];
BG71.PINK=['#4a1e30','#7a3a4c','#ac6270','#d4928e','#f0bcb0'];
BG71.TONG=['#2e1024','#5a2440','#86405a','#ae6474','#d09496'];
BG71.HORN=['#3e3028','#6e5e48','#a8987a','#d8ccae','#f4ecd8'];
BG71.WHT=['#3a3044','#686078','#9690a4','#c2bcc6','#e2ddd8','#f6f1e8'];
BG71.COMB=['#34081a','#621222','#94202a','#c0382e','#e0624a'];
BG71.BEAK=['#4a2410','#8a4e1a','#c4802c','#eaa84a','#f8d080'];
BG71.IRON=['#121216','#26262e','#40404a','#62626c','#8e8c94','#c4c0bc'];
BG71.RAW=['#2a0610','#5a1018','#8a2026','#b03c3a','#d06a5a'];
// ---------------------------------------------------------------- sprites from shapes: domes and tubes add height, the tallest wins
// the pixel, light from the top left off that height, a crease where one shape lies over another, one dark outline round the whole
BG71.spr=(key,w,h,shapes,post,ol)=>M4.pre('bg71_'+key,w,h,(K,g)=>{const N=w*h,H=new Float32Array(N).fill(-1e9),S=new Int16Array(N).fill(-1);
  shapes.forEach((s,si)=>{const put=(x,y,v)=>{if(x<0||y<0||x>=w||y>=h)return;const i=y*w+x;if(v>H[i]){H[i]=v;S[i]=si;}};
    const ball=(cx,cy,rx,ry,z,top)=>{for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const d=((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2;if(d<=1)put(x,y,z+top*Math.sqrt(1-d));}};
    if(s.t==='dome')ball(s.cx,s.cy,s.rx,s.ry,s.z||0,s.top!=null?s.top:Math.min(s.rx,s.ry));
    else if(s.t==='tube'){const P=s.pts,seg=[];let L=0;for(let k=0;k+1<P.length;k++){const l=Math.hypot(P[k+1][0]-P[k][0],P[k+1][1]-P[k][1]);seg.push(l);L+=l;}
      let acc=0;for(let k=0;k+1<P.length;k++){const n=Math.max(1,Math.ceil(seg[k]*2));for(let j=0;j<=n;j++){const u=j/n,a=(acc+seg[k]*u)/(L||1),r=s.r0+(s.r1-s.r0)*a,z=(s.z||0)+((s.z1!=null?s.z1:(s.z||0))-(s.z||0))*a;
          ball(P[k][0]+(P[k+1][0]-P[k][0])*u,P[k][1]+(P[k+1][1]-P[k][1])*u,r,r,z,r);}acc+=seg[k];}}});
  const at=(x,y,i0)=>{if(x<0||y<0||x>=w||y>=h)return H[i0]-2;const i=y*w+x;return S[i]<0?H[i0]-2:H[i];};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(S[i]<0)continue;const s=shapes[S[i]];
    const nx=(at(x-1,y,i)-at(x+1,y,i))*.5,ny=(at(x,y-1,i)-at(x,y+1,i))*.5,nz=s.nz||1;const l=(nx*-.55+ny*-.62+nz*.56)/Math.hypot(nx,ny,nz);
    let k=(s.base!=null?s.base:(s.P.length-1)*.5)+(l-.5)*(s.gain||4),cr=0;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=w||Y>=h)continue;const j=Y*w+X;if(S[j]>=0&&S[j]!==S[i]&&H[j]>H[i]+.4&&!shapes[S[j]].soft)cr=1;}
    if(cr)k-=1.3;let c=bt3pick(s.P,k);if(s.glint&&!cr&&l>(s.gl||.82))c=s.glint;if(s.fn){const c2=s.fn(x,y,k,l,cr);if(c2)c=c2;}g.fillStyle=c;g.fillRect(x,y,1,1);}
  if(ol){g.fillStyle=ol;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(S[i]>=0)continue;if((x>0&&S[i-1]>=0)||(x<w-1&&S[i+1]>=0)||(y>0&&S[i-w]>=0)||(y<h-1&&S[i+w]>=0))g.fillRect(x,y,1,1);}}
  if(post)post(K,g);});
// a part of a tube path, for the guts sliding out stage by stage
BG71.cutPath=(P,f)=>{let L=0;for(let k=0;k+1<P.length;k++)L+=Math.hypot(P[k+1][0]-P[k][0],P[k+1][1]-P[k][1]);let want=L*f;const out=[P[0]];
  for(let k=0;k+1<P.length;k++){const l=Math.hypot(P[k+1][0]-P[k][0],P[k+1][1]-P[k][1]);if(want>=l){out.push(P[k+1]);want-=l;continue;}const u=want/l;out.push([P[k][0]+(P[k+1][0]-P[k][0])*u,P[k][1]+(P[k+1][1]-P[k][1])*u]);break;}
  if(out.length<2)out.push([P[0][0]+.1,P[0][1]]);return out;};
// ---------------------------------------------------------------- a pool of blood lying on the block: wide (the block is seen from above
// and in front), a dark rim, the near rim in violet shadow, the far rim catching the light, one wet streak and one glint
BG71.pool=(seed,q,sz,full)=>M4.pre('bg71pool_'+seed+'_'+q+'_'+sz+(full?'':'t'),sz*2+6,Math.ceil(sz*1.3)+6,(K,g,w,h)=>{const P=full?BG71.BL:BG71.BLT,cx=w/2,cy=h/2,r=Math.max(1.2,sz*q/10);
  const Hs=(a,b)=>{let v=(a*374761393+b*668265263)|0;v=(v^(v>>>13))*1274126177|0;return((v^(v>>>16))>>>0)/4294967295;};
  const lob=[[0,0,1]];for(let k=0;k<3;k++){const a=Hs(seed,k)*6.283,d=.55+Hs(seed,k+9)*.35;lob.push([Math.cos(a)*d,Math.sin(a)*d*.55,.45+Hs(seed,k+4)*.3]);}
  const M=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){for(const [lx,ly,lr] of lob){const dx=(x+.5-cx-lx*r)/(r*lr),dy=(y+.5-cy-ly*r)/(r*lr*.55);if(dx*dx+dy*dy<=1){M[y*w+x]=1;break;}}}
  const inn=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&M[y*w+x];const D=new Int16Array(w*h).fill(99),Q=[];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(inn(x,y)&&(!inn(x-1,y)||!inn(x+1,y)||!inn(x,y-1)||!inn(x,y+1))){D[y*w+x]=0;Q.push(y*w+x);}
  for(let qi=0;qi<Q.length;qi++){const i=Q[qi],x=i%w,y=(i/w)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){if(!inn(x+dx,y+dy))continue;const j=(y+dy)*w+x+dx;if(D[j]>D[i]+1){D[j]=D[i]+1;Q.push(j);}}}
  let gl=null,gb=-1e9;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;
    if(!M[i]){if(inn(x-1,y)||inn(x+1,y)||inn(x,y-1)||inn(x,y+1)){K.px(x,y,1,1,P[0]);}continue;}
    const nx=(x+.5-cx)/r,ny=(y+.5-cy)/(r*.55),nl=Math.hypot(nx,ny)||1,f=(nx*-.6+ny*-.8)/nl,d=D[i];let c;
    if(d===0)c=f>.55&&full?P[5]:f<-.35?P[1]:P[2];else if(d===1)c=f<-.2?P[2]:P[3];else c=P[3];
    if(full&&d===2&&f>.35)c=P[4];if(full&&d>=2&&f>.3){const sc=f*3-d*.2;if(sc>gb){gb=sc;gl=[x,y];}}K.px(x,y,1,1,c);}
  if(gl&&r>3)K.px(gl[0],gl[1],1,1,P[6]);});
// a drop that landed: a small cluster with its tail away from where it came from
BG71.splat=(K,x,y,s,dir,P)=>{x=Math.round(x);y=Math.round(y);const a=typeof dir==='number'&&Math.abs(dir)<7?dir:(dir>0?0:Math.PI),dx=Math.cos(a),dy=Math.sin(a);
  const n=s+1;for(let i=0;i<n;i++){const X=Math.round(x-dx*(n-1-i)),Y=Math.round(y-dy*(n-1-i)*.7);K.px(X,Y,1,1,i<n-2?P[2]:P[3]);}
  if(s>=2){K.px(x,y,2,2,P[3]);K.px(x+1,y+1,1,1,P[1]);K.px(x,y,1,1,s>2?P[5]:P[4]);}else K.px(x+(dx>0?1:-1),y,1,1,P[2]);};
// ---------------------------------------------------------------- the heads, the hooks, the guts
BG71.henHead=()=>BG71.spr('henhead2',28,20,[
  {t:'tube',pts:[[15,11],[20,12],[25,12]],r0:5,r1:4.3,P:BG71.WHT,base:3.2,gain:3.4},
  {t:'dome',cx:10,cy:9,rx:6.5,ry:5.6,top:5,z:1,P:BG71.WHT,base:3.4,gain:3.4},
  {t:'tube',pts:[[6,4],[9,2.6],[12,3],[15,4.6]],r0:1.8,r1:1.4,z:3,P:BG71.COMB,base:2.4,gain:3},
  {t:'dome',cx:7,cy:2.4,rx:1.7,ry:1.7,z:3.4,P:BG71.COMB,base:2.6,gain:3},{t:'dome',cx:10.2,cy:1.5,rx:1.8,ry:1.8,z:3.4,P:BG71.COMB,base:2.6,gain:3},{t:'dome',cx:13.4,cy:2.1,rx:1.7,ry:1.7,z:3.4,P:BG71.COMB,base:2.6,gain:3},
  {t:'tube',pts:[[4.6,8.6],[1.4,10]],r0:1.8,r1:.8,z:2,P:BG71.BEAK,base:2.6,gain:3},
  {t:'tube',pts:[[4.6,11.2],[2,11.8]],r0:1.1,r1:.7,z:1.8,P:BG71.BEAK,base:1.8,gain:3},
  {t:'dome',cx:5.4,cy:14,rx:1.8,ry:2.5,z:1.5,P:BG71.COMB,base:2.2,gain:3},
  {t:'dome',cx:25.6,cy:12,rx:1.7,ry:4.2,z:2.4,top:1.4,P:BG71.RAW,base:2.4,gain:2.6,fn:(x,y)=>Math.abs(x-25.5)<1&&Math.abs(y-11.5)<1?'#e8dcc0':null}],
  (K)=>{const B=BG71.BL;
    // the eye, the lid half down over it, no light left in it
    K.px(8,7,2,2,'#241820');K.px(8,6,2,1,BG71.WHT[2]);K.px(7,7,1,1,BG71.WHT[3]);K.px(9,8,1,1,'#6a6a7c');
    K.px(3,9,1,1,'#3a1e0c');K.px(2,11,3,1,'#2a0c0c');
    // blood soaked up the neck feathers from the cut, wet at the stump
    K.px(21,13,3,3,B[3]);K.px(19,14,2,2,B[3]);K.px(22,12,2,1,B[4]);K.px(18,15,1,1,B[2]);K.px(20,16,4,1,B[2]);K.px(22,13,1,1,B[6]);K.px(24,15,1,2,B[1]);
    // the ragged feathers round the stump
    K.px(23,7,2,1,BG71.WHT[4]);K.px(24,6,1,1,BG71.WHT[3]);K.px(23,17,1,1,BG71.WHT[2]);},'#1a1018');
BG71.NOSE=['#5a3038','#8a5a5e','#b88a86','#dcb4a8','#f2d4c6'];
BG71.cowHead=()=>BG71.spr('cowhead3',38,58,[
  {t:'tube',pts:[[10,14],[4,16],[.8,18.6]],r0:3.2,r1:2,P:BG71.HIDE,base:2.8,gain:3.4},{t:'tube',pts:[[28,14],[33,16],[36.6,18.6]],r0:3,r1:1.9,P:BG71.HIDE,base:2.2,gain:3.4},
  {t:'tube',pts:[[11.5,9],[7.5,6],[5.5,2.4]],r0:2.1,r1:.9,z:3,P:BG71.HORN,base:2.6,gain:3},{t:'tube',pts:[[26.5,9],[30.5,6],[32.5,2.4]],r0:2.1,r1:.9,z:3,P:BG71.HORN,base:2.2,gain:3},
  {t:'dome',cx:31.5,cy:37,rx:3.6,ry:6.4,top:2,z:.5,P:BG71.RAW,base:2.4,gain:2.4,fn:(x,y)=>x>=33&&x<=34&&y>=34&&y<=35?BG71.HORN[3]:null},
  {t:'dome',cx:19,cy:14,rx:10.5,ry:8,top:6,z:2,P:BG71.HIDE,base:3.5,gain:3.6},
  {t:'tube',pts:[[19,16],[19,33]],r0:9.6,r1:8.6,z:2,P:BG71.HIDE,base:3.3,gain:3.6},
  {t:'dome',cx:12,cy:31,rx:5.4,ry:8.4,top:4,z:1.6,P:BG71.HIDE,base:2.8,gain:3.4},{t:'dome',cx:26,cy:31,rx:5.4,ry:8.4,top:4,z:1.6,P:BG71.HIDE,base:2.5,gain:3.4},
  {t:'dome',cx:19,cy:40.5,rx:10,ry:7,top:4,z:4.8,P:BG71.NOSE,base:2.6,gain:3,glint:BG71.NOSE[4],gl:.9},
  {t:'tube',pts:[[14.5,46.5],[13.4,50.5],[14.4,54]],r0:2,r1:1.5,z:6,P:BG71.TONG,base:2.4,gain:3,glint:BG71.TONG[4],gl:.92}],
  (K)=>{const B=BG71.BL,Hd=BG71.HIDE;
    // the tuft between the horns, the inside of the ears
    K.px(17,7,5,1,Hd[5]);K.px(18,6,3,1,Hd[4]);K.px(3,17,3,1,BG71.PINK[1]);K.px(33,17,3,1,BG71.PINK[0]);
    // the eyes set wide, open and dull, heavy lids
    K.px(9,20,3,2,'#1a0c12');K.px(9,19,4,1,Hd[1]);K.px(10,21,1,1,'#5e6a7a');K.px(26,20,3,2,'#1a0c12');K.px(25,19,4,1,Hd[1]);K.px(27,21,1,1,'#4e5a68');
    // the broad nose: two nostrils, the groove between, the mouth, the lip
    K.px(13,40,2,3,'#3a1420');K.px(13,39,2,1,BG71.NOSE[4]);K.px(23,40,2,3,'#3a1420');K.px(23,39,2,1,BG71.NOSE[3]);K.px(19,41,1,3,BG71.NOSE[1]);
    K.px(12,46,14,1,'#2a0e18');K.px(15,47,9,1,BG71.NOSE[1]);
    // blood: from a nostril, from the cut neck down the jaw to the chin, off the tongue
    K.px(13,43,1,3,B[3]);K.px(13,43,1,1,B[5]);
    for(const [x,y] of [[32,43],[31,44],[31,45],[30,46],[29,47],[29,48],[28,49],[27,50]])K.px(x,y,1,1,B[3]);K.px(33,43,1,2,B[2]);K.px(31,44,1,1,B[4]);K.px(26,51,2,2,B[3]);K.px(26,51,1,1,B[5]);
    K.px(13,55,2,2,B[3]);K.px(13,55,1,1,B[5]);
    // the hook through the poll, the wound round it
    K.px(18,0,2,9,BG71.IRON[3]);K.px(18,0,1,9,BG71.IRON[4]);K.px(17,0,1,8,BG71.IRON[0]);K.px(20,0,1,8,BG71.IRON[1]);K.px(17,8,4,2,B[2]);K.px(18,8,1,1,B[4]);K.px(21,7,2,1,BG71.IRON[2]);K.px(22,6,1,1,BG71.IRON[4]);},'#1a0a10');
BG71.hook=(v)=>{v=v||0;const L=[8,5,11][v];return BG71.spr('hook2_'+v,9,L+8,[{t:'tube',pts:[[3.5,.5],[3.5,L],[4,L+3],[6,L+4.6],[7.6,L+3],[7.6,L+1-v*.5]],r0:1.05,r1:.9,P:BG71.IRON,base:3,gain:4}],(K)=>{K.px(7,L,1,1,BG71.IRON[5]);},BG71.IRON[0]);};
BG71.hookAt=(g,v,x,y,flip)=>{const im=BG71.hook(v);if(!flip){g.drawImage(im,x,y);return;}g.save();g.translate(x+im.width,y);g.scale(-1,1);g.drawImage(im,0,0);g.restore();};
BG71.henFeet=()=>BG71.spr('henfeet1',14,26,[
  {t:'tube',pts:[[5,3],[5.5,13]],r0:1.6,r1:1.3,P:BG71.BEAK,base:2.4,gain:3},{t:'tube',pts:[[8.5,3],[8,13]],r0:1.6,r1:1.3,z:.5,P:BG71.BEAK,base:2,gain:3},
  {t:'tube',pts:[[5.5,13],[3.5,17],[2,21],[2.6,23]],r0:1,r1:.75,P:BG71.BEAK,base:2.4,gain:3},{t:'tube',pts:[[5.5,13],[5.5,19],[5,23.4]],r0:1,r1:.75,z:.6,P:BG71.BEAK,base:2.4,gain:3},
  {t:'tube',pts:[[8,13],[9.6,18],[11,21.6],[10.4,23.4]],r0:1,r1:.75,z:.3,P:BG71.BEAK,base:2,gain:3},{t:'tube',pts:[[8,13],[7.8,19],[8.4,23]],r0:1,r1:.75,z:.9,P:BG71.BEAK,base:2.2,gain:3}],
  (K)=>{const B=BG71.BL;K.px(3,4,9,2,'#c8b48a');K.px(3,4,9,1,'#e4d4ae');K.px(3,6,9,1,'#7a6448');K.px(6,0,2,4,'#b8a47e');K.px(6,0,1,4,'#dccaa0');
    K.px(4,2,6,1,B[2]);K.px(4,2,2,1,B[4]);for(const [x,y] of [[2,24],[5,24],[10,24]])K.px(x,y,1,1,B[3]);K.px(5,25,1,1,B[2]);
    for(let y=8;y<13;y+=2){K.px(4,y,1,1,BG71.BEAK[1]);K.px(7,y+1,1,1,BG71.BEAK[1]);}},'#2a1408');
// the hen's insides, lying in her as she's opened (seen in the split) and the loop that slides out over her thigh onto the block
BG71.henCav=()=>BG71.spr('hencav2',34,82,[
  {t:'dome',cx:17,cy:41,rx:15,ry:40,top:3,P:BG71.CAV,base:1.6,gain:1.6,soft:1},
  {t:'dome',cx:17,cy:11,rx:4.2,ry:5,top:3.5,z:2,P:BG71.LIV,base:3,gain:3,glint:BG71.LIV[5],fn:(x,y)=>y<=8&&Math.abs(x-17)<3?BG71.FATH[2+(x<17?1:0)]:null},
  {t:'dome',cx:11,cy:22,rx:7,ry:6.4,top:4,z:2.4,P:BG71.LIV,base:2.6,gain:3.4,glint:BG71.LIV[5]},{t:'dome',cx:22,cy:24,rx:7.4,ry:7,top:4,z:2,P:BG71.LIV,base:2.4,gain:3.4,glint:BG71.LIV[5]},
  {t:'dome',cx:17,cy:37,rx:7.6,ry:6.4,top:4,z:2.6,P:BG71.GIZ,base:2.6,gain:3.2,glint:BG71.GIZ[5],fn:(x,y)=>((x-15)/3.2)**2+((y-35)/2)**2<1?(x<15?'#d8d0d8':'#a89cae'):null},
  {t:'tube',pts:[[6,46],[14,48.6],[23,46],[27,51],[19,55],[9,54],[6,60],[14,63.4],[24,62],[27,68],[19,72],[10,70],[8,76]],r0:3.3,r1:3.1,z:2.2,z1:4.4,P:BG71.GUT,base:2.6,gain:3.6,glint:BG71.GUT[5],gl:.86}],
  (K)=>{const B=BG71.BL;for(const [x,y,w] of [[13,29,3],[20,32,2],[10,43,2],[24,57,2],[12,66,3],[22,75,2]]){K.px(x,y,w,1,B[3]);K.px(x,y+1,w,1,B[1]);}},BG71.CAV[0]);
BG71.GUT2=['#1e1020','#3e2238','#62384e','#8a5466','#b07a84','#d8a8a4'];
// a heap of gut as tubes [path, radius, ramp, the stage it starts at, the stage it's all out by]; each lies in a smear of its own blood
BG71.subPath=(P,f0,f1)=>{const a=BG71.cutPath(P,f1);if(f0<=0)return a;let L=0;for(let k=0;k+1<P.length;k++)L+=Math.hypot(P[k+1][0]-P[k][0],P[k+1][1]-P[k][1]);
  const head=BG71.cutPath(P,f0),st=head[head.length-1];let skip=head.length-1;return [st].concat(a.slice(skip));};
BG71.guts=(key,w,h,T,k,post)=>{const sh=[];T.forEach(([pts,r,P,a,b],i)=>{const f=Math.max(0,Math.min(1,(k-a)/(b-a)));if(f<=0)return;
    let L=0;for(let q=0;q+1<pts.length;q++)L+=Math.hypot(pts[q+1][0]-pts[q][0],pts[q+1][1]-pts[q][1]);const n=Math.max(1,Math.ceil(L*f/9));
    sh.push({t:'tube',pts:BG71.cutPath(pts,f),r0:r+1.2,r1:r*.75+1,z:i*6-3,P:BG71.BL,base:2.6,gain:2.4,soft:1});
    for(let c=0;c<n;c++){const u0=f*c/n,u1=f*(c+1)/n,rr=u=>r*(1-.35*u)*(1+.16*Math.sin(u*L/4.5+i*2));
      sh.push({t:'tube',pts:BG71.subPath(pts,u0,u1),r0:rr(u0),r1:rr(u1),z:i*6+u0*4,z1:i*6+u1*4,P,base:2.7,gain:3.8,glint:P[5],gl:.9});}});
  return BG71.spr(key+'_'+k,w,h,sh,post,'#16040e');};
BG71.HSP=[[[[76,6],[71,12],[63,16],[53,15],[43,18],[33,22],[24,25],[17,24],[11,27],[8,33],[13,37],[21,35],[22,29],[15,30]],3.3,BG71.GUT,0,5],
  [[[78,4],[80,11],[74,16],[70,10],[75,5]],3,BG71.GUT2,0,2],[[[60,15],[56,22],[49,24],[44,20]],3,BG71.GUT2,2,4],[[[16,25],[9,22],[4,27],[6,34]],2.8,BG71.GUT2,4,6]];
BG71.henSpill=k=>BG71.guts('henspill3',88,42,BG71.HSP,k);
BG71.CLOOP=[[[[4,4],[12,1.5],[20,2.5],[24,6.5],[16,8],[8,7.5]],3.6,BG71.GUT,0,2],[[[6,6],[4,15],[6,22],[11,25],[14,19],[13,9]],3.4,BG71.GUT2,1,4],
  [[[14,7],[18,17],[19,28],[23,33],[27,27],[25,15],[22,7]],3.6,BG71.GUT,2,6]];
BG71.cowLoops=k=>BG71.guts('cowloops1',32,40,BG71.CLOOP,k);
BG71.CPILE=[[[[6,24],[14,27],[24,26],[30,21],[22,17],[12,18],[8,13],[16,9],[26,10],[33,14],[40,19],[47,24],[52,20],[46,13],[38,9]],4.2,BG71.GUT,0,1],
  [[[16,29],[27,30],[37,28],[46,29],[53,26]],3.6,BG71.GUT2,0,1],[[[20,14],[28,16],[34,21]],3.2,BG71.GUT2,0,1]];
BG71.cowPile=v=>v<2?BG71.guts('cowclump1',34,30,[[[[6,22],[14,25],[24,23],[27,17],[19,13],[10,15],[8,9],[16,5],[25,7]],4.2,BG71.GUT,0,1],[[[12,27],[22,27],[29,24]],3.4,BG71.GUT2,0,1]],1)
  :BG71.guts('cowpile1',58,34,BG71.CPILE,1,(K)=>{const B=BG71.BL;K.px(3,30,8,1,B[3]);K.px(48,31,6,1,B[3]);K.px(2,31,10,1,B[1]);});
BG71.paunch=()=>BG71.spr('paunch1',22,16,[{t:'dome',cx:11,cy:8,rx:9.5,ry:6.6,top:5,P:BG71.PAUNCH,base:2.6,gain:3.6,glint:BG71.PAUNCH[5]}],(K)=>{const B=BG71.BL;K.px(4,12,6,1,B[3]);K.px(3,11,2,1,B[2]);K.px(13,13,4,1,B[2]);},'#16040e');
// blood on the blade, worse with every seam
BG71.blade=n=>M4.pre('bg71blade_'+n,16,48,(K)=>{if(n<=0)return;const B=BG71.BL,top=44-Math.min(24,4+n*5);const run=[0,3,1,5,2,0,4,1];
  for(let y=top;y<=44;y++){const w=y>40?8-(y-40):8;for(let x=4;x<4+w;x++){const lim=top+(run[x-4]||0)*(n>2?.5:1);if(y<lim)continue;const k=x<6?4:x<9?3:2;K.px(x,y,1,1,y-lim<1?B[2]:B[k]);}}
  K.px(5,top+3,1,2,B[5]);if(n>1)K.px(6,42,1,1,B[6]);});
BG71.snd={
  squish(k){k=k||1;A.tone(MSV(230,.25),.09,'sine',.05*k,{slide:85});A.hiss(.07,.07*k,'lowpass',MSV(640,.3),{q:3});},
  spurt(k){k=k||1;A.hiss(.26,.13*k,'bandpass',MSV(1250,.2),{q:1.6,slide:420,wobble:1});for(let i=0;i<4;i++)A.tone(MSV(250,.35),.05,'sine',.045*k,{slide:105,delay:.03+i*.045});},
  crack(){A.hiss(.02,.3,'highpass',2600);A.tone(MSV(1100),.025,'square',.03,{slide:340});for(let i=0;i<3;i++)A.hiss(.03,.14,'bandpass',MSV(1400,.4),{q:2,delay:.015+i*.02});A.tone(130,.1,'sine',.18,{slide:60,delay:.01});},
  slop(){A.hiss(1.1,.16,'lowpass',700,{slide:160,wobble:1});for(let i=0;i<5;i++)A.tone(MSV(150,.3),.14,'sine',.14,{slide:55,delay:.25+i*.17});A.hiss(.3,.08,'bandpass',420,{q:4,delay:.6,wobble:1});},
  drip(){A.tone(MSV(640,.2),.06,'sine',.03,{slide:250});},
  pat(){A.hiss(.05,.05,'bandpass',MSV(1700,.3),{q:2});A.tone(MSV(360,.2),.05,'sine',.035,{slide:150});}};

// ---------------------------------------------------------------- the knife game, done yourself
{const _tr=S4.trace;S4.trace=(sp,K)=>{const surf=sp.surface;if((surf!=='hen'&&surf!=='beef')||typeof BT3==='undefined'||!BT3.JOB||!BT3.JOB[surf])return _tr(sp,K);
  const J=BT3.JOB[surf],full=!window.GORE_TONED,hen=surf==='hen',P=full?BG71.BL:BG71.BLT;
  // the breast halves part wider, so what was inside can come out
  if(hen)for(const p of J.pieces){if(p.id==='brR')p.to=[full?10:6,2,.05];if(p.id==='brL')p.to=[full?-10:-6,2,-.05];}
  const o=_tr(sp,K);let G=null;try{
  const st=o.st,g=K.g,[ox,oy]=J.at,img=J.img(),W=img.width,HH=img.height,NP=J.paths.length;
  const src=img.getContext('2d').getImageData(0,0,W,HH).data,pix=(x,y)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>=HH)return null;const i=(y*W+x)*4;return src[i+3]?[src[i],src[i+1],src[i+2]]:null;};
  const BLK=hen?BT3.block(236,112):BT3.block(308,40);
  const PC=new Map();for(const p of J.pieces){const c=M4.C['bt3p_'+surf+'_'+p.id];if(c)PC.set(c,p);}
  const PTS=J.paths.map(p=>{const L=Math.floor(m4len(p)),a=[];for(let j=0;j<=L;j++)a.push(m4at(p,j));return a;});
  const mask=hen?BT3.henMask():BT3.beefMask(),inM=(x,y)=>BT3.in(mask,Math.round(x),Math.round(y));
  G={pid:1,t:0,sT:J.paths.map(()=>[]),drops:[],splB:[],splO:[],pools:[],rv:[],lastPi:0,u:{},pulse:0,sq:0,O:document.createElement('canvas'),OM:new Map(),oT:-1,gutT:-1,slopAt:-1,beads:[],prevS:0,prevPi:0,cutT:-9,loop:null};
  G.O.width=W;G.O.height=HH;
  // the gut seam: the hen's breast, the beef's flank
  const GUT=hen?2:1;
  // where each seam meets bone: the hen's wing joints and her keel; on the beef, the backbone down the inside edge and the ribs
  const jointJ=hen?J.paths.map((p,pi)=>{if(pi>1)return -1;let b=0,bd=1e9;PTS[pi].forEach((q,j)=>{const d=Math.hypot(q[0]-(pi?61:95),q[1]-30);if(d<bd){bd=d;b=j;}});return b;}):[];
  const BF=hen?null:BT3.beefField(),pale=(x,y)=>{const c=pix(x,y);return !!c&&c[0]>180&&c[1]>165&&Math.abs(c[0]-c[1])<40;};
  const boneAt=(pi,j,x,y)=>{if(hen)return pi===2?(y>24&&y<64):Math.abs(j-jointJ[pi])<=2;const Y=Math.round(y);if(Y<0||Y>=HH||!pale(x,y))return false;return x<BF.left[Y]+9||(Y>80&&Y<140&&x<BF.right[Y]-4);};
  const fatAt=(x,y)=>pale(x,y);
  if(full){if(hen)G.pools.push({x:70,y:72,sz:11,seed:3,q:.72,tq:.78});else G.pools.push({x:169,y:140,sz:9,seed:5,q:.6,tq:.7});}
  const addPool=(x,y,sz,tq,seed)=>{for(const p of G.pools)if(Math.hypot(p.x-x,(p.y-y)*1.6)<p.sz*.8){p.tq=Math.min(1,Math.max(p.tq,tq)+.12);p.sz=Math.max(p.sz,sz);return p;}
    const p={x,y,sz:full?sz:Math.max(4,Math.round(sz*.7)),seed:seed||((x*7+y*13)|0),q:.15,tq:full?tq:tq*.8};G.pools.push(p);return p;};
  // a pulse of blood out of the cut: a few drops arcing off the knife (hen: lying on the block, seen from above; beef: hanging over it)
  const pulse=(x,y,n,pw,an)=>{if(!full)return;const a0=an!=null?an:Math.random()*6.283,sg=Math.random()<.75?1:-1,gy0=136+Math.random()*10,vz0=(70+Math.random()*30)*pw;
    for(let i=0;i<n;i++){const a=a0+(Math.random()-.5)*.3,v=(14+i*(44/n))*pw,s=i===n-1?3:i>n/2?2:1;
      if(hen)G.drops.push({gx:x,gy:y,z:1,vx:Math.cos(a)*v*.16,vy:Math.sin(a)*v*.1,vz:vz0*(.55+i*.18/n*4),s,id:G.pid});
      else G.drops.push({gx:x,gy:gy0,z:Math.max(2,gy0-y),vx:sg*(5+i*3)*pw,vy:0,vz:8+i*9,s,id:G.pid});}G.pid++;};
  const rivPath=(x,y)=>{const out=[[Math.round(x),Math.round(y)]];if(hen){const F=BT3.henField(),Hf=(X,Y)=>X<0||Y<0||X>=F.w||Y>=F.h?-1:F.H[Y*F.w+X];let cx=Math.round(x),cy=Math.round(y);
      for(let s=0;s<44;s++){let b=null,bh=Hf(cx,cy)-.02;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const h=Hf(cx+dx,cy+dy)+dy*.03;if(h<bh){bh=h;b=[dx,dy];}}
        if(!b)break;cx+=b[0];cy+=b[1];if(!inM(cx,cy)){out.exit=[cx,cy];break;}out.push([cx,cy]);}}
    else{const sd=x*.7+y;for(let k=1;k<70;k++){const X=Math.round(x+Math.sin(k*.21+sd)*.9),Y=Math.round(y+k);if(!inM(X,Y))break;out.push([X,Y]);}}return out;};
  const HRUN=[{pi:0,pts:[[100,44],[106,50],[113,56],[119,61],[122,66],[125,71]],pool:[213,117]},{pi:1,pts:[[56,44],[50,50],[43,56],[37,61],[34,66],[31,71]],pool:[104,117]},
    {pi:2,pts:[[76,36],[73,43],[69,50],[65,56],[62,61]],pool:null}].map(r=>{const d=[];for(let k=0;k+1<r.pts.length;k++){const [ax,ay]=r.pts[k],[bx,by]=r.pts[k+1],n=Math.ceil(Math.hypot(bx-ax,by-ay));for(let i=0;i<n;i++)d.push([Math.round(ax+(bx-ax)*i/n),Math.round(ay+(by-ay)*i/n)]);}
      let j0=0,bd=1e9;PTS[r.pi].forEach((q,j)=>{const e=Math.hypot(q[0]-r.pts[0][0],q[1]-r.pts[0][1]);if(e<bd){bd=e;j0=j;}});return Object.assign(r,{d,j0,t0:-1,pooled:0});});
  // ---- the overlay painted on the carcass (it goes with every piece as it comes away)
  const HW=full?(hen?3:2):1;
  // cut pixels that have finished opening, runs that have finished running and landed drops are painted once into a baked layer;
  // only what is still moving is painted again, and nothing at all when nothing moved
  G.bk=document.createElement('canvas');G.bk.width=W;G.bk.height=HH;G.bj=J.paths.map(()=>0);G.rb=new Set();G.sb=0;
  const paintPt=(x,pi,j,age)=>{const PX=(X,Y,col)=>{x.fillStyle=col;x.fillRect(X,Y,1,1);};{{const [px,py,an]=PTS[pi][j],nx=-Math.sin(an),ny=Math.cos(an);
        const hw=Math.min(HW,Math.floor(1+age*6)),lf=.6*nx+.8*ny;const bone=full&&boneAt(pi,j,px,py);
        for(let d=-hw;d<=hw;d++){const X=Math.round(px+nx*d),Y=Math.round(py+ny*d);if(!inM(X,Y))continue;const ad=Math.abs(d),lit=d===0?false:(d>0?lf>0:lf<0);let col;
          if(bone&&ad<=2)col=ad===0?'#b0505a':ad===1?(lit?BT3.BONE[4]:BT3.BONE[3]):BT3.BONE[1];
          else if(ad===0)col=age>.5?(j%9===4&&full?P[5]:P[3]):P[0];
          else if(!full)col=P[2];
          else if(hen)col=ad===1?(lit?BG71.MH[2]:BG71.MH[0]):ad===2?(lit?BG71.MH[3]:BG71.MH[1]):(lit?BG71.FATH[3]:BG71.FATH[1]);
          else col=ad===1?(lit?BT3.MEAT[5]:BT3.MEAT[2]):fatAt(X,Y)?(lit?BT3.FAT[4]:BT3.FAT[2]):(lit?BT3.MEAT[6]:BT3.MEAT[3]);
          PX(X,Y,col);}}}};
  // the runs: down the bird's sides into her creases, or straight down the hanging side
  const paintRun=(x,r,n)=>{const PX=(X,Y,col)=>{x.fillStyle=col;x.fillRect(X,Y,1,1);};for(let i=0;i<n;i++){const [X,Y]=r.path[i];PX(X,Y,hen?P[3]:P[2]);if(i<n*.7&&full)PX(X+1,Y,P[1]);}
    const [X,Y]=r.path[n-1];PX(X,Y,P[4]);PX(X+1,Y,P[3]);PX(X,Y+1,P[3]);PX(X+1,Y+1,P[1]);if(full)PX(X,Y,P[6]);};
  const paintHRun=(x,r,n)=>{const PX=(X,Y,col)=>{x.fillStyle=col;x.fillRect(X,Y,1,1);};const N=r.d.length;
    for(let i=0;i<n;i++){const [X,Y]=r.d[i],w=full?2+Math.floor(2.6*i/N):2;for(let k=0;k<w;k++){const c=k===0?(i>N*.25&&i<N*.7&&full?P[5]:P[4]):k===w-1?P[1]:P[3];PX(X+k-(w>2?1:0),Y,c);}PX(X+w-(w>2?1:0),Y,P[0]);}
    const [X,Y]=r.d[Math.max(0,n-1)];PX(X-1,Y+1,P[3]);PX(X,Y+1,P[3]);PX(X+1,Y+1,P[3]);PX(X+2,Y+1,P[1]);PX(X,Y+2,P[2]);PX(X+1,Y+2,P[1]);if(full)PX(X-1,Y,P[6]);};
  const SETTLE=Math.max(.6,(HW-1)/6)+.05;
  const redrawO=()=>{const c=G.O,x=c.getContext('2d'),bx=G.bk.getContext('2d');let moving=false,baked=false;
    for(let pi=0;pi<NP;pi++){const T=G.sT[pi];while(G.bj[pi]<T.length&&G.t-T[G.bj[pi]]>SETTLE){paintPt(bx,pi,G.bj[pi],9);G.bj[pi]++;baked=true;}if(G.bj[pi]<T.length)moving=true;}
    for(const r of G.rv){if(G.rb.has(r.key))continue;const n=Math.min(r.path.length,Math.floor((G.t-r.t0)*(hen?12:20)));if(n>=r.path.length){paintRun(bx,r,n);G.rb.add(r.key);baked=true;}else if(n>=1)moving=true;}
    const kk={px:(a,b,w,h,cc)=>{bx.fillStyle=cc;bx.fillRect(Math.round(a),Math.round(b),w,h);}};while(G.sb<G.splO.length){const q=G.splO[G.sb++];BG71.splat(kk,q[0],q[1],q[2],q[3],P);baked=true;}
    if(hen&&HRUN.some(r=>r.t0>=0&&(G.t-r.t0)*18<r.d.length+18))moving=true;if(!moving&&!baked&&!G.wasMoving)return;G.wasMoving=moving;
    x.clearRect(0,0,W,HH);x.drawImage(G.bk,0,0);
    for(let pi=0;pi<NP;pi++){const T=G.sT[pi];for(let j=G.bj[pi];j<T.length&&j<PTS[pi].length;j++)paintPt(x,pi,j,G.t-T[j]);}
    for(const r of G.rv){if(G.rb.has(r.key))continue;const n=Math.min(r.path.length,Math.floor((G.t-r.t0)*(hen?12:20)));if(n>=1)paintRun(x,r,n);}
    if(hen)for(const r of HRUN){if(r.t0<0)continue;const n=Math.min(r.d.length,Math.floor((G.t-r.t0)*18));if(n>=1)paintHRun(x,r,n);}
    // each piece's own copy, cut to its shape
    for(const [pc] of PC){let m=G.OM.get(pc);if(!m){m=document.createElement('canvas');m.width=W;m.height=HH;G.OM.set(pc,m);}const mx=m.getContext('2d');
      mx.globalCompositeOperation='source-over';mx.clearRect(0,0,W,HH);mx.drawImage(c,0,0);mx.globalCompositeOperation='destination-in';mx.drawImage(pc,0,0);mx.globalCompositeOperation='source-over';}};
  // ---- the knife's play: time along each seam, the pulses, the sounds, the pieces' fall
  const up=o.update;o.update=function(dt,I){const kj=K.judge;K.judge=function(s2,x,y,q){return kj.call(this,s2,252,hen?50:60,q);};try{up.apply(this,arguments);}finally{K.judge=kj;}try{G.t+=dt;
    const done=st.end?NP:st.pi;
    for(let pi=0;pi<NP;pi++){const L=PTS[pi].length-1,reach=pi<done?L:pi===st.pi?Math.min(L,Math.floor(st.s)):-1,T=G.sT[pi];while(T.length<=reach)T.push(G.t);}
    const cutting=!st.end&&st.pi===G.prevPi&&st.s>G.prevS+.01;G.prevS=st.s;G.prevPi=st.pi;if(cutting)G.cutT=G.t;const busy=G.t-G.cutT<.15;
    if(!G.loop&&typeof MS!=='undefined')G.loop=MS.loop('lowpass',520,3);
    if(G.loop){if(busy)G.loop.set((full?.1:.06)*Math.min(1,.4+st.spd/120),300+Math.random()*600,2+Math.random()*5);else G.loop.set(0);}
    if(busy){G.sq-=dt;if(G.sq<=0){G.sq=.11+Math.random()*.2;BG71.snd.squish(full?1:.6);}
      const PT=PTS[st.pi][Math.min(PTS[st.pi].length-1,Math.floor(st.s))];
      G.pulse-=dt;if(G.pulse<=0){G.pulse=.5+Math.random()*.3;if(full){const an=PT[2]+(Math.random()<.5?1:-1)*Math.PI/2;pulse(st.tx,st.ty,4,.8+st.pi*.12,hen?an:null);BG71.snd.spurt(.55);}}
      if(full&&Math.random()<dt*2.5&&boneAt(st.pi,Math.floor(st.s),PT[0],PT[1]))BG71.snd.crack();}
    // a seam through: the gush, the bone giving, a pool where it runs off; the belly lets go of what it held
    if(done>G.lastPi){for(let k=G.lastPi;k<done;k++){const PT=PTS[k],e=PT[PT.length-1],m=PT[Math.floor(PT.length/2)];
        pulse(e[0]+ox,e[1]+oy,6,1.2);pulse(e[0]+ox,e[1]+oy,5,1.1);pulse(m[0]+ox,m[1]+oy,4,1);if(full)BG71.snd.spurt(1);setTimeout(()=>{try{BG71.snd.crack();}catch(_){}},60);
        if(k===GUT&&full&&!(hen?AF().henGutted:AF().cowGutted)){G.gutT=G.t;G.slopAt=G.t+(hen?.3:.57);}
        }G.lastPi=done;}
    if(G.slopAt>0&&G.t>=G.slopAt){G.slopAt=-1;BG71.snd.slop();if(hen)addPool(98,130,18,.95,11);else{addPool(104,144,20,1,12);K.shk=Math.max(K.shk,.12);G.beads.push({x:96,y:90,gy:132,g:.4,rate:1.1});}}
    // the pieces: the halves of the bird slide apart; the cuts of beef drop onto the block, each into its own blood
    for(const p of J.pieces){if(!(p.free<done))continue;const u=G.u[p.id]||0;if(J.hang){const n=Math.min(1,u+dt*2.2);G.u[p.id]=n;if(u<1&&n>=1&&p.land){const [lx,ly]=p.land;addPool(lx,Math.min(146,ly-6),12,.8);BG71.snd.pat();}}
      else G.u[p.id]=Math.min(1,u+dt*9*((1-u)+.02));}
    // runs start a little after the knife has passed
    if(hen)for(const r of HRUN){const T=G.sT[r.pi];if(r.t0<0&&T.length>r.j0&&G.t-T[r.j0]>.3)r.t0=G.t;if(r.t0>=0&&!r.pooled&&r.pool&&(G.t-r.t0)*18>=r.d.length*.8){r.pooled=1;const pp=addPool(r.pool[0],r.pool[1],12,.9);pp.q=Math.max(pp.q,.35);}}
    for(let pi=0;pi<NP&&!hen;pi++){const T=G.sT[pi],step=hen?12:9;for(let j=5;j<T.length;j+=step){const key=pi*1000+j;if(G.rv.some(r=>r.key===key))continue;if(G.t-T[j]<(hen?.7:.4))continue;
        const [px,py,an]=PTS[pi][j],side=((j/step)|0)%2?1:-1,nx=-Math.sin(an),ny=Math.cos(an);const sx=hen?px+nx*side*(HW+1):px,sy=hen?py+ny*side*(HW+1):py+HW+1;
        G.rv.push({key,t0:G.t,path:rivPath(sx,sy),pooled:0});}}
    for(const r of G.rv){if(r.pooled||!r.path.exit)continue;if((G.t-r.t0)*12>=r.path.length){r.pooled=1;const [X,Y]=r.path.exit;addPool(X+ox+(X<78?-4:4),Y+oy+3,full?6:4,.7);}}
    // drops in the air: land on the bird (and stay on her), or on the block
    for(let i=G.drops.length-1;i>=0;i--){const d=G.drops[i];d.gx+=d.vx*dt;d.gy+=d.vy*dt;d.vz-=380*dt;d.z+=d.vz*dt;if(d.z>0)continue;G.drops.splice(i,1);
      const lx=d.gx-ox,ly=d.gy-oy;if(hen&&inM(lx,ly)){}
      else if(hen?(d.gx>44&&d.gx<276&&d.gy>38&&d.gy<160):true){if(G.splB.length<70)G.splB.push([d.gx,d.gy,d.s,Math.atan2(d.vy,d.vx||1e-3)]);if(Math.random()<.25)BG71.snd.pat();}}
    // the cow's head drips onto the block, and so do the bird's feet on their hook
    for(const b of G.beads){b.g+=dt*b.rate;if(b.g>=1){b.g=0;b.rate=.6+Math.random()*.9;G.drops.push({gx:b.x,gy:b.gy,z:b.gy-b.y,vx:0,vy:0,vz:0,s:1});if(Math.random()<.5)BG71.snd.drip();for(const p of G.pools)if(Math.hypot(p.x-b.x,p.y-b.gy)<14)p.tq=Math.min(1,p.tq+.015);}}
    for(const p of G.pools)p.q+=(p.tq-p.q)*Math.min(1,dt*.9);
    const tk=Math.floor(G.t*15);if(tk!==G.oT){G.oT=tk;redrawO();}
    if(st.end&&G.loop)G.loop.set(0);}catch(e){console.warn(e);}};
  if(full){if(hen)G.beads.push({x:125,y:20,gy:40,g:.3,rate:.5});else G.beads.push({x:161,y:59,gy:141,g:0,rate:.8},{x:173,y:55,gy:143,g:.5,rate:.55});}
  const qq=o.quiet,ss=o.stop;o.quiet=function(){try{G.loop&&G.loop.set(0);}catch(e){}return qq&&qq.apply(this,arguments);};o.stop=function(){try{G.loop&&G.loop.stop();G.loop=null;}catch(e){}return ss&&ss.apply(this,arguments);};
  // ---- what lies on the block (drawn on it, under the carcass)
  const AF=()=>typeof BK!=='undefined'&&BK.after?BK.after:{};
  const onBlock=()=>{const af=AF(),wl=hen?af.henWall:af.cowWall;if(wl&&wl.length&&(hen?af.hen:af.cow)&&full)BK.drawWall(K,wl,99,P,-(K.dy||0));
    if(hen){
      // the rail of hooks on the wall behind the block; the hen's feet tied on one of them
      K.px(66,-10,196,3,BG71.IRON[2]);K.px(66,-10,196,1,BG71.IRON[4]);K.px(66,-8,196,1,BG71.IRON[0]);for(const x of [66,259]){K.px(x,-13,3,9,BG71.IRON[1]);K.px(x,-13,1,9,BG71.IRON[3]);}
      BG71.hookAt(g,1,90,-9,true);BG71.hookAt(g,0,122,-9);BG71.hookAt(g,2,163,-9,true);BG71.hookAt(g,1,197,-9);BG71.hookAt(g,0,236,-9,true);if(full)g.drawImage(BG71.henFeet(),120,-4);
      if(full){g.drawImage(BG71.pool(3,Math.round(G.pools[0]?G.pools[0].q*10:7),11,true),58,63);g.drawImage(BG71.henHead(),44,54);}}
    else{
      BG71.hookAt(g,2,202,1,true);BG71.hookAt(g,1,244,1);
      if(full)g.drawImage(BG71.cowHead(),147,3);}
    for(const p of G.pools){if(hen&&full&&p===G.pools[0])continue;const q=Math.max(1,Math.round(p.q*10));const im=BG71.pool(p.seed,q,p.sz,full);g.drawImage(im,Math.round(p.x-im.width/2),Math.round(p.y-im.height/2));}
    // the runs off the big pools toward you, along the grain
    for(const p of G.pools){if(p.sz<12||p.q<.55)continue;const n=Math.floor((p.q-.55)*90),x0=Math.round(p.x+((p.seed%5)-2)*2),y0=Math.round(p.y+p.sz*.45);
      for(let i=0;i<n;i++){const X=x0+Math.round(Math.sin(i*.25+p.seed)*.8),Y=y0+i;K.px(X,Y,1,1,P[3]);if(full)K.px(X+1,Y,1,1,P[1]);}
      if(n>2){K.px(x0,y0+n,2,2,P[3]);if(full)K.px(x0,y0+n,1,1,P[5]);}}
    for(const s of G.splB)BG71.splat(K,s[0],s[1],s[2],s[3],P);
    // the beef's guts hanging out of the opened belly and slumped on the block
    if(!hen&&full&&G.gutT>=0){const tt=G.t-G.gutT,k=Math.max(1,Math.min(6,1+Math.floor(tt*10))),fall=tt-.15,LAND=.42;
      if(fall>LAND){g.drawImage(BG71.paunch(),104,124);g.drawImage(BG71.cowPile(fall<LAND+.12?1:2),fall<LAND+.12?88:74,fall<LAND+.12?120:116);}
      else if(fall>0)g.drawImage(BG71.cowPile(1),88,Math.round(62+(fall/LAND)**2*58));
      g.drawImage(BG71.cowLoops(k),84,57);}
    // the hen's insides, seen where she's split
    if(hen&&full&&G.gutT>=0)g.drawImage(BG71.henCav(),143,63);};
  const onPiece=(pc,a,b)=>{const m=G.OM.get(pc);if(m)g.drawImage(m,a,b);};
  const d0=o.draw;o.draw=function(t){const had=Object.prototype.hasOwnProperty.call(g,'drawImage'),di=g.drawImage;
    g.drawImage=function(im,a,b){const r=di.apply(g,arguments);if(arguments.length===3){try{if(im===BLK)onBlock();else if(g.globalAlpha>=.99&&PC.has(im))onPiece(im,a,b);}catch(e){console.warn(e);}}return r;};
    try{d0.apply(this,arguments);}finally{if(had)g.drawImage=di;else delete g.drawImage;}
    try{
      // the loop of gut sliding out of her over the thigh
      if(hen&&full&&G.gutT>=0&&G.t-G.gutT>.35){const k=Math.max(1,Math.min(6,Math.floor((G.t-G.gutT-.35)*6)));g.drawImage(BG71.henSpill(k),84,103);}
      // the hand that did the killing is still bloody
      {const af=AF();if(!st.end&&(hen?af.hen:af.cow)&&full){const [hx,hy]=M4.tr(st.tx,st.ty,Math.PI-.62,-.5,-36.5);BK.hand(K,hx,hy,2,P);}}
      // the blade, bloodier with every seam
      if(!st.end&&full){const n=Math.min(4,G.lastPi+(st.s>4?1:0));if(n>0)M4.rot(g,BG71.blade(n),st.tx,st.ty,Math.PI-.62,8,44);}
      // drops in the air
      let pd=null;for(const d of G.drops){const x=Math.round(d.gx),y=Math.round(d.gy-d.z);if(pd&&pd.id===d.id&&d.id){const px=Math.round(pd.gx),py=Math.round(pd.gy-pd.z);if(Math.hypot(px-x,py-y)<9)K.line(px,py,x,y,P[3],1);}pd=d;}
      for(const d of G.drops){const x=Math.round(d.gx),y=Math.round(d.gy-d.z);K.px(x,y,d.s>1?2:1,2,P[4]);K.px(x+1,y+1,1,1,P[2]);if(d.s>2)K.px(x,y,1,1,P[6]);}
      // the beads gathering on the tongue, the jaw, the feet before they fall
      for(const b of G.beads){if(b.g<.2)continue;const l=b.g>.7?2:1;K.px(b.x,b.y,1,l+1,P[3]);K.px(b.x,b.y,1,1,P[5]);}
    }catch(e){console.warn(e);}};
  }catch(e){console.warn('bg71',e);}
  return o;};}
