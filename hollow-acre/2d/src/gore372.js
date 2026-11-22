/* ================= (t372d) the animals the Hollow kills and the cold house's hooks, drawn again from one description at two sizes
   (tools/gore4.py): the world sprite and its detailed close-up are the same thing. The rabbit, the deer and the ribcage get a
   toned-down version too; walking up on each kind the first time shows its close-up. The story's deer on the farm track and the
   cold house's rack show the same close-ups, Full or Toned, and their props follow the setting. ================= */
// (owner: "the grounds on the close up images don't match the placing") every gore close-up lies on the ground it really lies on:
// the world's own ground chunks under it and the small things lying near it, enlarged to the close-up's scale; the close-up on top
const GORE_CUS={g_p_hiker:3,g_p_lantern:4,g_p_boots:4,g_p_coat:3,g_p_tree:2,g_deer_open:2,g_rabbit:4,g_ribs:3,g_hooks:1.5};
// The ground is not enlarged (its pixels would be 2-4x the corpse's): it is drawn again at the close-up's own pixel size. Each world
// pixel under the patch is sorted into its ground (grass, dirt, stone, water, the dark wood floor) and each ground keeps its
// average colour there; the borders between them follow the world's layout with a wandering 1 px edge; then each ground gets its
// own fine marks at 1 px: grass in tufts of blades, dirt and stone in gathered specks and pebbles, ripples on water. The things
// lying near (bales, posts, sticks, the blood) are drawn again at this size too: their shapes and colours sampled smooth, kept to
// their own colours, edged with a 1 px outline.
const GG_PROTO=[[78,112,52],[112,78,52],[104,102,106],[62,110,150],[44,54,36]];   // grass, dirt, stone, water, the woods' dark floor
const ggN=(x,y,s)=>{const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,h=(a,b)=>hash(a*7+s,b*13+s*3),u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
  const a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};
function ggShade(c,k){return [Math.max(0,Math.min(255,Math.round(c[0]*k+(k>1?6:0)))),Math.max(0,Math.min(255,Math.round(c[1]*k+(k>1?5:0)))),Math.max(0,Math.min(255,Math.round(c[2]*k*(k>1?.94:1.04))))];}
function ggThing(D,cw,ch,im,m,ox,oy,S,straw){   // a sprite drawn again at S: smooth shape, its own colours, a 1 px outline (straw: 1 px stalks)
  const c=document.createElement('canvas');c.width=m.fw;c.height=m.fh;const q=c.getContext('2d');q.drawImage(im,0,0,m.fw,m.fh,0,0,m.fw,m.fh);const sd=q.getImageData(0,0,m.fw,m.fh).data;
  const pal=[];for(let i=0;i<sd.length;i+=4)if(sd[i+3]>127){const k=(sd[i]<<16)|(sd[i+1]<<8)|sd[i+2];if(!pal.includes(k)){pal.push(k);if(pal.length>48)break;}}
  const P=pal.map(k=>[k>>16,(k>>8)&255,k&255]);let dark=P[0]||[20,14,16];for(const p of P)if(p[0]+p[1]+p[2]<dark[0]+dark[1]+dark[2])dark=p;
  const W=Math.ceil(m.fw*S),Hh=Math.ceil(m.fh*S),inside=new Uint8Array((W+2)*(Hh+2)),X0=Math.round(ox),Y0=Math.round(oy);
  const smp=(x,y)=>{x=Math.max(0,Math.min(m.fw-1.001,x));y=Math.max(0,Math.min(m.fh-1.001,y));const xi=x|0,yi=y|0,fx=x-xi,fy=y-yi;let r=0,g=0,b=0,a=0;
    for(const [dx,dy,w] of [[0,0,(1-fx)*(1-fy)],[1,0,fx*(1-fy)],[0,1,(1-fx)*fy],[1,1,fx*fy]]){const xx=Math.min(m.fw-1,xi+dx),yy=Math.min(m.fh-1,yi+dy),i=(yy*m.fw+xx)*4,al=sd[i+3]/255*w;r+=sd[i]*al;g+=sd[i+1]*al;b+=sd[i+2]*al;a+=al;}
    return a>0?[r/a,g/a,b/a,a]:[0,0,0,0];};
  for(let v=0;v<Hh;v++)for(let u=0;u<W;u++){const [r,g,b,a]=smp((u+.5)/S-.5,(v+.5)/S-.5);if(a<.5)continue;inside[(v+1)*(W+2)+u+1]=1;
    let best=P[0],bd=1e9;for(const p of P){const d=(p[0]-r)**2+(p[1]-g)**2+(p[2]-b)**2;if(d<bd){bd=d;best=p;}}
    let col=best;if(straw){const L=(best[0]+best[1]+best[2])/3;if(L>70&&best[0]>best[2]+20){const ln=(v+Math.floor(hash(u>>2,7)*3)+((u>>3)&1))%3;   // a bale's stalks: fine light and dark lines along it
        col=ln===0?[Math.min(255,best[0]*1.16+8),Math.min(255,best[1]*1.14+6),best[2]*1.05]:ln===2&&hash(u,v)<.7?[best[0]*.84,best[1]*.82,best[2]*.8]:best;}}
    const X=X0+u,Y=Y0+v;if(X<0||Y<0||X>=cw||Y>=ch)continue;const o=(Y*cw+X)*4;D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=255;}
  for(let v=-1;v<=Hh;v++)for(let u=-1;u<=W;u++){if(inside[(v+1)*(W+2)+u+1])continue;
    if(!(inside[(v+1)*(W+2)+u+2]||inside[(v+1)*(W+2)+u]||inside[(v+2)*(W+2)+u+1]||inside[v*(W+2)+u+1]))continue;
    const X=X0+u,Y=Y0+v;if(X<0||Y<0||X>=cw||Y>=ch)continue;const o=(Y*cw+X)*4;D[o]=dark[0]*.7;D[o+1]=dark[1]*.7;D[o+2]=dark[2]*.7;D[o+3]=255;}}
function goreGround(at,img,S,ax,ay,skip){const mx=14,top=Math.max(0,Math.min(12,131-img.height)),cw=img.width+mx*2,ch=img.height+top;
  const W0=at.x*32-(ax+mx)/S,H0=at.z*32-(ay+top)/S,ww=Math.ceil(cw/S)+3,hh=Math.ceil(ch/S)+3,bx=Math.floor(W0)-1,by=Math.floor(H0)-1;
  const src=document.createElement('canvas');src.width=ww;src.height=hh;const sg=src.getContext('2d');sg.imageSmoothingEnabled=false;
  for(let cy=Math.floor(by/CH);cy<=Math.floor((by+hh)/CH);cy++)for(let cx=Math.floor(bx/CH);cx<=Math.floor((bx+ww)/CH);cx++){try{sg.drawImage(chunk(cx,cy),cx*CH-bx,cy*CH-by);}catch(e){}}
  const sd=sg.getImageData(0,0,ww,hh).data,cls=new Uint8Array(ww*hh),sum=GG_PROTO.map(()=>[0,0,0,0]);
  for(let i=0;i<ww*hh;i++){const r=sd[i*4],g=sd[i*4+1],b=sd[i*4+2];let best=0,bd=1e9;GG_PROTO.forEach((p,k)=>{const d=(p[0]-r)**2+(p[1]-g)**2+(p[2]-b)**2;if(d<bd){bd=d;best=k;}});cls[i]=best;const s_=sum[best];s_[0]+=r;s_[1]+=g;s_[2]+=b;s_[3]++;}
  const avg=sum.map((s_,k)=>s_[3]?[s_[0]/s_[3],s_[1]/s_[3],s_[2]/s_[3]]:GG_PROTO[k]);
  const out=document.createElement('canvas');out.width=cw;out.height=ch;const g=out.getContext('2d');const id=g.createImageData(cw,ch),D=id.data;
  const ox=W0-bx,oy=H0-by,CL=new Uint8Array(cw*ch);
  for(let v=0;v<ch;v++)for(let u=0;u<cw;u++){const x=ox+(u+.5)/S-.5,y=oy+(v+.5)/S-.5,xi=Math.max(0,Math.min(ww-2,x|0)),yi=Math.max(0,Math.min(hh-2,y|0)),fx=x-xi,fy=y-yi,w=[0,0,0,0,0];
    w[cls[yi*ww+xi]]+=(1-fx)*(1-fy);w[cls[yi*ww+xi+1]]+=fx*(1-fy);w[cls[(yi+1)*ww+xi]]+=(1-fx)*fy;w[cls[(yi+1)*ww+xi+1]]+=fx*fy;
    for(let k=0;k<5;k++)if(w[k])w[k]+=(ggN(u/3,v/3,k*31)-.5)*.5;   // the border wanders a little at 1 px
    let c=0;for(let k=1;k<5;k++)if(w[k]>w[c])c=k;CL[v*cw+u]=c;}
  for(let v=0;v<ch;v++)for(let u=0;u<cw;u++){const c=CL[v*cw+u],A=avg[c],o=(v*cw+u)*4;let col=A;
    const patch=ggN(u/26,v/18,c*7+3);col=ggShade(A,patch>.62?1.07:patch<.3?.94:1);   // big soft patches, no speckle
    if(c===0||c===4){   // grass: tufts of blades, thick in clumps, lit at the tips, a shadow at the foot
      const band=Math.floor(v/4),bo=Math.floor(hash(u,band*3+1)*3),inb=v-band*4-bo,dens=ggN(u/11,v/8,c+11)>.55?.42:.05;
      if(hash(u,band*7+2)<dens&&inb>=0&&inb<3)col=inb===0?ggShade(A,c===4?1.18:1.28):ggShade(A,1.1);
      else if(hash(u,band*7+2-7)<dens&&v-(band-1)*4-Math.floor(hash(u,(band-1)*3+1)*3)===3)col=ggShade(A,.8);}
    else if(c===1||c===2){   // dirt and stone: specks gathered in a few clusters, a pebble lit on top
      const cx_=u>>2,cy_=v>>2,inCl=ggN(u/9,v/7,c*5+1)>.6;
      if(inCl&&hash(cx_,cy_*5+c)<.45){const px_=u&3,py_=v&3;if(px_<2&&py_<2)col=py_===0?ggShade(A,c===2?1.25:1.18):ggShade(A,.76);}
      else if(hash(u,v*3+c)<.012)col=ggShade(A,.82);}
    else if(c===3){if(hash(u>>2,v)<.06&&(v%3===0))col=ggShade(A,1.25);}   // ripples
    if(v>0&&CL[(v-1)*cw+u]!==c&&(c===1||c===2)&&(CL[(v-1)*cw+u]===0||CL[(v-1)*cw+u]===4))col=ggShade(A,.74);   // dirt sinks a little under the grass's edge
    D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=255;}
  // the things lying near, drawn again at this size (not enlarged), back to front
  const near=OBJ.filter(o=>o&&!o.hide&&!skip.includes(o)&&Math.abs(o.x*32-(bx+ww/2))<ww/2+48&&Math.abs(o.z*32-(by+hh/2))<hh/2+72).sort((a,b)=>a.z-b.z);
  for(const o of near){const m=SPR[o.spr],im=m&&IMG[m.src];if(!im||m.clips||m.fh>80||m.fw>120)continue;try{ggThing(D,cw,ch,im,m,(o.x*32-m.ax-bx-ox)*S,(o.z*32-m.ay-by-oy)*S,S,/hay|bale|straw/.test(o.spr));}catch(e){}}
  g.putImageData(id,0,0);g.drawImage(img,mx,top);return out;}
if(typeof goreCloseImg==='function'){const _gci=goreCloseImg;goreCloseImg=function(name,at,skip){const n=name+'_cu',m=SPR[n],im=m&&IMG[m.src];
  if(!at||!im||!im.width||typeof sgtC!=='function')return _gci(name);const base=name.replace(/_t$/,''),S=GORE_CUS[base]||2;
  try{const g=goreGround(at,im,S,m.ax,m.ay,skip||[]);return sgtC('gcu_'+n+'_'+Math.round(at.x*10)+'_'+Math.round(at.z*10),g.width,g.height,(P,q)=>{q.drawImage(g,0,0);});}catch(e){return _gci(name);}};}
{const G4T={rabbit:{tmain:'g_rabbit_t',tlook:'A rabbit on its side in the grass, whole, its eyes open. The grass round it is flattened and dark. Nothing has been eaten.'},
    deer:{tmain:'g_deer_open_t',tlook:'A deer on its side in the grass, its legs out stiff. There is a dark patch under its throat and the flies have found it. It is lying very neatly.'},
    ribs:{tmain:'g_ribs_t',tlook:'A long drag mark through the grass, ending in a flattened dark patch and a few tufts of hair. Whatever was dragged here was carried on from here.'}};
  if(typeof KILLS!=='undefined')for(const k in G4T)if(KILLS[k])Object.assign(KILLS[k],G4T[k]);
  const CAP={rabbit:'Nothing has been eaten. It was killed and left, neatly, where you would walk.',ribs:'Whatever did this carried the rest of it somewhere. The crows won’t go near the drag mark.',
    deer:'Twelve pieces round it, the heart at the top. It is the same every time. It is telling the time.'};
  // a carcass in the fields: the first of each kind (and of each version) comes up close, in detail
  if(typeof goreCloseImg==='function')goreSight=function(k){const K=KILLS[k.kind];if(!K||K.person||S.mode!=='play'||S.paused||(typeof H!=='undefined'&&H.state==='chase'))return false;
    const ton=!!(k.ton&&K.tmain),g=goreS(),sk='sight_'+k.kind+(ton?'_t':'');if(g.seen[sk])return false;const img=goreCloseImg(ton?K.tmain:K.main,{x:k.x,z:k.z},(GORE.objs[k.id]||[]).slice(0,1));if(!img)return false;
    g.seen[sk]=1;if(!ton)g.seen['sight_'+k.kind]=1;return sgtOpen({x:k.x,z:k.z},img,ton?K.tlook:(CAP[k.kind]||K.look),{flies:ton?1:3});};
  // the story's deer and the cold house: their close-ups are the detailed images (the heart still beats, at its place in the ring)
  if(typeof SGT_BEATS!=='undefined'&&typeof SGT_ART!=='undefined'&&typeof goreCloseImg==='function'){
    const at=id=>{const os=typeof SGW!=='undefined'&&SGW.objs[id];if(os&&os[0])return [{x:os[0].x,z:os[0].z},[os[0]]];const b=typeof SAGA!=='undefined'&&SAGA.find(b=>b.id===id);if(b&&b.at){const p=b.at();return [{x:p.x,z:p.z},[]];}return [null,[]];};
    SGT_ART.g4_deer=()=>{const [p,sk]=at('deer');return goreCloseImg(goreToned()?'g_deer_open_t':'g_deer_open',p,sk);};
    SGT_ART.g4_cold=()=>{const [p,sk]=at('cold');return goreCloseImg(goreToned()?'g_hooks_t':'g_hooks',p,sk);};
    const B=SGT_BEATS;if(B.deer){B.deer.art='g4_deer';delete B.deer.sp;const m=SPR.g_deer_open_cu;const top=m?Math.max(0,Math.min(12,131-m.fh)):0;const heart=m?[72+14,m.ay-49+top]:[86,22];   /* the heart's place in the close-up, on its ground patch */
      Object.defineProperty(B.deer,'fx',{get(){return goreToned()?{flies:2}:{pulse:heart,flies:5,ribs:1};},configurable:true});}
    if(B.cold){B.cold.art='g4_cold';delete B.cold.sp;}}
  // their props in the world follow the gore setting
  {const _u=update;update=function(dt){_u(dt);if(typeof SGW==='undefined')return;const t=goreToned();
    for(const [id,n] of [['deer','g_deer_open'],['cold','g_hooks']]){const os=SGW.objs[id];if(!os)continue;for(const o of os)if(o.spr===n||o.spr===n+'_t'){const w=t?n+'_t':n;if(o.spr!==w)o.spr=w;}}};}}
