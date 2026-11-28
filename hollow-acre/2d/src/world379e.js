/* ================= #379e the cold house by the Black Lake is there (owner: "make sure the visual indicator prompts match what your looking
   at"). The story sends you to "the old cold house by the Black Lake" that "somebody has opened", and tells you it is a turf-roofed
   cellar dug into the bank; where it points there was only the rack of hooks standing in the open grass. Now the cold house stands
   behind the rack: a hump of turf over a dry-stone face, a timber door frame, its door hanging open on the dark inside. It is solid.
   Drawn by hand in code (one turf ramp and one stone ramp, lit from the top left; the dark of the doorway the deepest thing in it). */
const W79E={};
const W79E_AT={dx:-1.5,dz:-1.6};   // from the hooks rack: the cold house's stone face stands this far behind it
function w79eArt(){const W=150,H=108,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};
  const T=['#121a0b','#20301a','#2f4024','#42572e','#5a7139','#748c4a'],S=['#1e1c22','#3a3840','#504e58','#66646e','#7e7c86'],Wd=['#24160e','#3e2818','#5a3c24','#76523a','#8e6a4a'];
  const hh=(a,b)=>(((a*73856093)^(b*19349663))>>>0)%97;
  // the turf hump: a dome sitting on the ground (widest at its foot), lit from the top left and darkening toward the bottom right in
  // smooth bands whose borders wander (no blotches), one dark edge round it, a ragged fringe of grass where it meets the ground and a
  // soft broken shadow down and right
  const cx=75,top=10,gy=100,rx=68,M=new Uint8Array(W*H),E=['#24180f','#38281b','#4c3826','#634a32'];
  const half=y=>{const t=(y-top)/(gy-top);return Math.round(rx*Math.sqrt(Math.max(0,1-Math.pow(1-t,2))));};
  for(let x=cx-rx+6;x<cx+rx+10;x++){if(((x*7)%11)<3)continue;const d=1+((x*5)%3===0?1:0)+(x>cx?1:0);P(x,gy+1,1,d,'rgba(50,33,37,.45)');}
  for(let y=gy-26;y<gy;y++){const hw=half(y)+3;if(((y*3)%5)<2)P(cx+hw,y,2,1,'rgba(50,33,37,.4)');}
  for(let y=top;y<=gy;y++){const hw=half(y),t=(y-top)/(gy-top);for(let x=cx-hw;x<=cx+hw;x++){M[y*W+x]=1;
      const nx=(x-cx)/Math.max(1,hw);let l=-nx*.55+(1-t)*.95-.25+.07*Math.sin(x*.23+y*.11)+.05*Math.sin(x*.07-y*.29);
      const k=l>.38?5:l>.1?4:l>-.16?3:l>-.42?2:1;P(x,y,1,1,T[k]);}}
  for(let y=top;y<=gy;y++)for(let x=1;x<W-1;x++){if(!M[y*W+x])continue;if(!M[(y-1)*W+x]||!M[y*W+x-1]||!M[y*W+x+1])P(x,y,1,1,(x<cx&&y<top+34)?T[2]:T[0]);}
  // the grass fringe at its foot: tufts of two or three blades standing out over the edge, irregularly spaced
  for(let i=0,x=cx-rx+4;x<cx+rx-2;i++,x+=5+((i*7)%4)){const y=gy-(Math.abs(x-cx)>rx-14?((i%3)+2):0),k=x<cx?3:2;P(x,y-2,1,3,T[k]);P(x+1,y-3,1,4,T[k+1]);P(x+2,y-1,1,2,T[k]);}
  for(const [x,y] of [[20,74],[128,80],[16,88],[134,92]]){P(x,y,1,3,T[3]);P(x+1,y-1,1,4,T[4]);P(x-1,y+1,1,2,T[2]);}
  // a few tufts standing proud along the crown
  for(const [x,y] of [[44,24],[60,14],[86,13],[106,21]]){P(x,y-2,1,2,T[5]);P(x+1,y-3,1,3,T[4]);P(x+2,y-2,1,2,T[3]);}
  // the bank cut back where the stone face goes in: raw earth either side of the face and under the turf lip, lit on the left
  {const fx0=40,fx1=110,fy0=50,fy1=100;for(let y=fy0-4;y<fy1;y++){const w=4+Math.round((y-fy0+4)*.12);
      for(let k=0;k<w;k++){P(fx0-1-k,y,1,1,k===w-1?E[0]:k<2?E[1]:E[2]);P(fx1+k,y,1,1,k===w-1?E[0]:k<2?E[1]:E[1]);}
      P(fx0-w,y,1,1,E[3]);}
    for(let x=fx0-6;x<fx1+6;x++)P(x,fy0-4,1,2,E[2]);}
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
