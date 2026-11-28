/* ================= #379e the cold house by the Black Lake is there (owner: "make sure the visual indicator prompts match what your looking
   at"). The story sends you to "the old cold house by the Black Lake" that "somebody has opened", and tells you it is a turf-roofed
   cellar dug into the bank; where it points there was only the rack of hooks standing in the open grass. Now the cold house stands
   behind the rack: a hump of turf over a dry-stone face, a timber door frame, its door hanging open on the dark inside. It is solid.
   Drawn by hand in code (one turf ramp and one stone ramp, lit from the top left; the dark of the doorway the deepest thing in it). */
const W79E={};
const W79E_AT={dx:-1.5,dz:-1.6};   // from the hooks rack: the cold house's stone face stands this far behind it
function w79eArt(){const W=150,H=108,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};
  const T=['#18200e','#26321a','#334224','#40522c','#506434','#62763e'],S=['#1e1c22','#3a3840','#504e58','#66646e','#7e7c86'],Wd=['#24160e','#3e2818','#5a3c24','#76523a','#8e6a4a'];
  const hh=(a,b)=>(((a*73856093)^(b*19349663))>>>0)%97;
  // the turf hump: a low dome over the cellar, lit upper left, its right side and foot in shade, one dark edge round it, its shadow
  // thrown down and right on the grass
  const cx=75,top=8,base=74,rx=70,M=new Uint8Array(W*H);
  const half=y=>{const t=(y-top)/(base-top);return Math.round(rx*Math.sqrt(Math.max(0,1-Math.pow(1-t,2.2))));};
  for(let y=top+6;y<=base+4;y++){const hw=half(Math.min(base,y-6));for(let x=cx-hw+8;x<=cx+hw+8;x++)if(x>=0&&x<W)P(x,y,1,1,'rgba(30,20,26,.4)');}
  for(let y=top;y<=base;y++){const hw=half(y),t=(y-top)/(base-top);for(let x=cx-hw;x<=cx+hw;x++){M[y*W+x]=1;
      const u=(x-cx)/rx;const l=-u*.75-t*.75+.35;let k=l>.55?5:l>.22?4:l>-.12?3:l>-.45?2:1;if(hh(x>>2,y>>2)%11===0&&k>1&&k<5)k--;P(x,y,1,1,T[k]);}}
  for(let y=top;y<=base;y++)for(let x=1;x<W-1;x++){if(!M[y*W+x])continue;if(!M[(y-1)*W+x]||!M[y*W+x-1]||!M[y*W+x+1])P(x,y,1,1,(x<cx&&y<top+30)?T[1]:T[0]);}
  // tufts standing proud along the crown, a few stones showing through the turf
  for(const [x,y] of [[40,22],[58,12],[83,11],[104,18],[121,30],[30,36]]){P(x,y-2,1,2,T[5]);P(x+1,y-3,1,3,T[4]);P(x+2,y-2,1,2,T[3]);}
  for(const [x,y] of [[50,40],[112,48],[96,30]]){P(x,y,4,2,S[3]);P(x,y,4,1,S[4]);P(x,y+2,4,1,S[1]);}
  // the dry-stone face cut into the bank, its top under a lip of overhanging turf
  const fx0=40,fx1=110,fy0=50,fy1=100;
  for(let y=fy0;y<fy1;y++)P(fx0,y,fx1-fx0,1,S[1]);
  for(let r=0,y=fy0;y<fy1;r++,y+=6){let x=fx0+((r%2)?-3:0);while(x<fx1){const w=7+hh(x,r)%5;const x0=Math.max(fx0,x),x1=Math.min(fx1,x+w-1);if(x1>x0){P(x0,y,x1-x0,5,S[2]);P(x0,y,x1-x0,1,S[3]);P(x0,y,1,5,S[3]);if(hh(r,x)%4===0)P(x0+1,y+1,Math.max(1,x1-x0-2),1,S[4]);}x+=w;}}
  for(let x=fx0-2;x<fx1+2;x++){const d=2+(hh(x>>1,7)%3);for(let k=0;k<d;k++)P(x,fy0-2+k,1,1,k<d-1?T[2]:T[1]);P(x,fy0-2+d,1,1,'rgba(10,8,12,.55)');}   /* the turf lip and its shadow on the stones */
  // the doorway: timber frame, the dark inside, sawdust on the threshold catching a little light
  const dx0=63,dx1=87,dy0=64;
  for(let y=dy0;y<fy1;y++){const t=(y-dy0)/(fy1-dy0);P(dx0,y,dx1-dx0,1,t>.82?'#2a2018':'#0a080b');}
  P(dx0+3,fy1-3,dx1-dx0-8,1,'#4a3a28');P(dx0+6,fy1-2,dx1-dx0-12,1,'#5a4630');
  P(dx0-3,dy0-4,dx1-dx0+6,4,Wd[2]);P(dx0-3,dy0-4,dx1-dx0+6,1,Wd[4]);P(dx0-3,dy0-1,dx1-dx0+6,1,Wd[1]);   /* the lintel */
  for(const x of [dx0-3,dx1]){P(x,dy0,3,fy1-dy0,Wd[2]);P(x,dy0,1,fy1-dy0,Wd[3]);P(x+2,dy0,1,fy1-dy0,Wd[1]);}
  // the door, hung on the right post and swung open toward you: a narrow leaf of planks, its edge lit, a strap hinge
  for(let i=0;i<9;i++){const x=dx1+3+i,y0=dy0+1+Math.round(i*.45),y1=fy1-1+Math.round(i*.6);P(x,y0,1,y1-y0,i===0?Wd[1]:i%3===2?Wd[1]:Wd[2]);P(x,y0,1,1,Wd[3]);}
  P(dx1+11,dy0+5,1,fy1-dy0-2,Wd[0]);P(dx1+4,dy0+8,7,1,S[2]);P(dx1+4,fy1-9,7,1,S[2]);
  // its foot: a contact shadow along the face and under the door
  for(let x=fx0-4;x<fx1+6;x++)if(hh(x,3)%5)P(x,fy1,1,1,'rgba(50,33,37,.6)');P(dx1+3,fy1+1,11,2,'rgba(50,33,37,.5)');
  return c;}
function w79eBuild(){if(W79E.done)return;const os=typeof SGW!=='undefined'&&SGW.objs&&SGW.objs.cold;const rack=os&&os[0];
  const B=typeof SAGA!=='undefined'&&SAGA.find(q=>q.id==='cold');if(!B)return;const p=rack?{x:rack.x,z:rack.z}:(()=>{const a=B.at();return {x:a.x,z:a.z-1.2};})();
  const c=w79eArt(),src='w79e:coldhouse';IMG[src]=c;SPR.w79e_coldhouse={src,fw:c.width,fh:c.height,ax:75,ay:100,foot:[0,0,0,0]};
  const x=p.x+W79E_AT.dx,z=p.z+W79E_AT.dz;W79E.o=obj('w79e_coldhouse',x,z,{kind:'prop',noCol:true});addRect(x-2.2,z-2.0,x+2.2,z-.05);
  // nothing grows out of it (a tree whose trunk stood where the cellar is dug goes, with its collider)
  for(const o of OBJ){if(o===W79E.o||o.hide||o.room)continue;const tree=o.kind==='tree'||/^(oak|maple|pine|spruce|birch|willow|tree|apple|elder)/.test(o.spr||'');
    if(Math.abs(o.x-x)<(tree?2.3:2.6)&&o.z>z-2.4&&o.z<z+(tree?.9:.2)&&(tree||/^(bush|deco|deco2|grass|rock)$/.test(o.kind||''))){o.hide=true;
      for(let i=circles.length-1;i>=0;i--){const q=circles[i];if(Math.hypot(q.x-o.x,q.z-o.z)<.25||Math.hypot(q.x-o.x,q.z-(o.z-.1))<.25)circles.splice(i,1);}}}
  W79E.done=true;}
setInterval(()=>{try{if(!W79E.done&&typeof OBJ!=='undefined'&&OBJ.length>1000)w79eBuild();}catch(e){}},1200);
