/* ================= world tidy-up: signposts you can read (each board painted with its place name), the blank road signs
   given something to say, the ferry sign out of the water, lamp posts moved off the paths onto the verge, the feed sacks solid,
   and no tuft of grass or wheat growing through a fence, a wall, a trunk or a bush ================= */
const SIGN_BLANKS={'-180':'MARROW HOLLOW 9 MI','-136':'NO SERVICES','-110':'DEER XING','-92':'MARROW HOLLOW 2 MI','-88':'!TURN BACK'};
// a proper signpost: a thick two-tone board with a bevelled top, its edge showing underneath, grain and knots, an arrow tip cut to a point,
// nailed onto a squared post that stands in the middle of it (two posts under a long board), grass round the foot, the name carved in
function signSprite(label,flip){const red=label[0]==='!';const L=(red?label.slice(1):label).toUpperCase().replace(/[^A-Z0-9 .]/g,'');const key='sign:'+label+(flip?':L':'');if(SPR[key])return key;
  const tw=L.length*4-1,bw=Math.max(24,tw+12),tip=6,fh=11,th=2,by=7,Hh=42,W=bw+tip+4;
  const bx0=flip?2+tip:2,bx1=bx0+bw-1;   // the square part of the board; the tip carries on past bx1 (or before bx0 when it points left)
  const c=document.createElement('canvas');c.width=W;c.height=Hh;const g=c.getContext('2d');const p=(x,y,col)=>{g.fillStyle=col;g.fillRect(x,y,1,1);};
  const H=(x,y,s)=>{const n=Math.sin(x*127.1+y*311.7+s*74.7+L.length*13.3)*43758.5453;return n-Math.floor(n);};
  // the posts: one in the middle, or two under a long board
  const posts=bw>52?[bx0+Math.round(bw*.22),bx0+Math.round(bw*.78)-3]:[bx0+Math.round(bw/2)-2];const ground=Hh-4;
  const PC=['#cfa16e','#a87a4c','#8a5c34','#64401f'];
  for(const px0 of posts){for(let y=by-3;y<=ground;y++)for(let i=0;i<4;i++){if(y===by-3&&(i===0||i===3))continue;let col=PC[i];if(y===by-3)col=i===1?'#dcb07a':'#b88a58';
      else if(H(px0+i,y,2)<.12&&y>by)col=PC[Math.min(3,i+1)];if(y>=ground-1)col=i<2?'#7a5232':'#4a2e16';p(px0+i,y,col);}
    p(px0+1,by+fh+th+6,'#6a4426');p(px0+2,by+fh+th+6,'#6a4426');   // a knot
  }
  // the board: face with a bevelled top and shaded bottom, the edge (its thickness) below, the arrow tip cut to a point
  const faceTop=x=>{const d=flip?bx0-x:x-bx1;if(d<=0)return by;return by+Math.round(d*(fh-1)/(2*tip));};
  const faceBot=x=>{const d=flip?bx0-x:x-bx1;if(d<=0)return by+fh-1;return by+fh-1-Math.round(d*(fh-1)/(2*tip));};
  const xA=flip?bx0-tip:bx0,xB=flip?bx1:bx1+tip;
  for(let x=xA;x<=xB;x++){const t0=faceTop(x),t1=faceBot(x);if(t1<t0)continue;const end=(x-xA)/(xB-xA);
    for(let y=t0;y<=t1;y++){const r=y-by;let col=r===0?'#e6bd86':r===1?'#d6a872':r>=fh-2?'#9e6e40':'#c1915e';
      // grain: long streaks along the plank, a little darker toward the far end (lit from the left)
      if(r>1&&r<fh-2){const st=H(Math.floor(x/7),y,1);if(st<.28&&H(x,y,3)<.8)col='#ad7e4e';else if(st>.86)col='#cd9d68';if(end>.7&&H(x,y,4)<.35)col='#b08050';}
      // the diagonal cut edges of the tip catch the light on top and fall into shade below
      if(x>bx1||x<bx0){if(y===t0)col='#ecc690';if(y===t1)col='#8a5c34';}
      p(x,y,col);}
    // the board's thickness, seen from a little above
    for(let k=1;k<=th;k++)p(x,t1+k,k===1?'#7a4e2c':'#5a381c');}
  // a knot and a crack, and the nails holding it to the post(s)
  {const kx=bx0+Math.round(bw*(H(1,2,5)<.5?.12:.88)),ky=by+fh-4;p(kx,ky,'#8a5c34');p(kx+1,ky,'#7a4e2c');p(kx,ky-1,'#a07040');}
  for(const px0 of posts)for(const ny of [by+1,by+fh-2]){p(px0+1,ny,'#3a2e28');p(px0+2,ny,'#5a4a40');}   // above and below the letters, never through them
  // a dark outline round everything
  const id=g.getImageData(0,0,W,Hh),D=id.data,A=i=>D[i*4+3]>0;const out=[];
  for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const i=y*W+x;if(A(i))continue;if((x>0&&A(i-1))||(x<W-1&&A(i+1))||(y>0&&A(i-W))||(y<Hh-1&&A(i+W)))out.push(i);}
  for(const i of out){D[i*4]=42;D[i*4+1]=26;D[i*4+2]=16;D[i*4+3]=255;}g.putImageData(id,0,0);
  // grass round the foot of each post, and its shadow
  for(const px0 of posts){g.fillStyle='rgba(10,14,6,.32)';g.beginPath();g.ellipse(px0+2,ground+1.5,5.5,1.7,0,0,Math.PI*2);g.fill();
    for(const [dx,h,col] of [[-2,3,'#4f7d36'],[-1,2,'#6a9a44'],[4,3,'#5a8a3c'],[5,2,'#78a84e'],[1,1,'#6a9a44']])for(let j=0;j<h;j++)p(px0+dx+(j===h-1&&dx<0?-1:0),ground-j,col);}
  // the letters, carved in (dark, with a light lip under each stroke), or daubed in red paint that has run
  let X=Math.round((bx0+bx1+1)/2-tw/2);const tc=red?'#9a1a14':'#3a2410';
  for(const ch of L){const f=PXFONT[ch]||PXFONT[' '];for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(f[j*3+i]==='1'){g.fillStyle=tc;g.fillRect(X+i,by+3+j,1,1);
      if(!red&&!(j<4&&f[(j+1)*3+i]==='1')){g.fillStyle='rgba(255,226,170,.45)';g.fillRect(X+i,by+4+j,1,1);}}X+=4;}
  if(red)for(let i=0;i*7<tw;i++){const dx=Math.round((bx0+bx1+1)/2-tw/2)+1+i*7;g.fillStyle='#7a1410';g.fillRect(dx,by+8,1,2+(i%2));if(i%3===0)g.fillRect(dx,by+fh+th+1,1,2);}
  const ax=posts.length>1?(posts[0]+posts[1]+4)/2:posts[0]+2;
  IMG[key]=c;SPR[key]={src:key,fw:W,fh:Hh,ax,ay:ground+1,foot:[-.15,-.1,.15,0]};return key;}
const blockedAt=(x,z,r)=>{const t={x,z};collide(t,r);return Math.abs(t.x-x)+Math.abs(t.z-z)>.001;};
// nothing may stand in front of a sign's board: a tree's crown, a fence post, a lamp. If something does, the sign steps to the
// nearest clear spot on the same verge (never into water or into something solid, never far from where it was)
const SIGN_COVER=new Set(['tree','pine','bld','fence','lamp','bush','prop']);
function signCovered(o,x,z,all){const m=SPR[o.spr];if(!m)return false;const L=x*PPM-m.ax,T=z*PPM-m.ay+6,R=L+m.fw,Bt=T+16;
  return OBJ[all?'filter':'some'](q=>{if(q===o||q.hide||q.room||!SIGN_COVER.has(q.kind)||q.z<=z)return false;const n=SPR[q.spr];if(!n)return false;
    const inset=q.kind==='tree'||q.kind==='pine'?n.fw*.18:1;const l=q.x*PPM-n.ax+inset,r=q.x*PPM-n.ax+n.fw-inset,t=q.z*PPM-n.ay+(q.kind==='tree'||q.kind==='pine'?n.fh*.05:0),b=q.z*PPM-n.ay+n.fh;
    return l<R-2&&r>L+2&&t<Bt&&b>T;});}
function signClear(o){if(!signCovered(o,o.x,o.z))return;let best=null,bd=1e9;
  for(const dz of [0,.4,-.4,.8,-.8,1.2])for(let k=1;k<=12;k++)for(const sg of [1,-1]){const dx=sg*k*.4,x=o.x+dx,z=o.z+dz;const d=Math.abs(dx)+Math.abs(dz)*1.5;if(d>=bd)continue;
    if(terr(x,z)==='water'||blockedAt(x,z,.25)||signCovered(o,x,z))continue;bd=d;best=[x,z];}
  // nowhere clear (a solid tree line along the road): the trees standing in front of it give way, leaving a gap for the sign
  if(!best){for(const q of signCovered(o,o.x,o.z,true)){if(q.kind!=='tree'&&q.kind!=='pine'&&q.kind!=='bush')continue;q.hide=true;
      const ci=circles.findIndex(c=>Math.abs(c.x-q.x)<.6&&Math.abs(c.z-q.z)<.6);if(ci>=0)circles.splice(ci,1);}return;}
  const c=circles.find(q=>Math.abs(q.x-o.x)<.01&&Math.abs(q.z-o.z)<.01);if(c){c.x=best[0];c.z=best[1];}o.x=best[0];o.z=best[1];}
function world67(){
  for(const o of OBJ){if(o.spr!=='signpost'||o.room)continue;if(!o.label){const k=Object.keys(SIGN_BLANKS).find(k=>Math.abs(+k-o.x)<1.5);if(k)o.label=SIGN_BLANKS[k];}
    if(o.label&&terr(o.x,o.z)==='water'){let best=null;for(let r=.5;r<5&&!best;r+=.5)for(let a=0;a<6.28&&!best;a+=.4){const x=o.x+Math.cos(a)*r,z=o.z+Math.sin(a)*r;if(terr(x,z)!=='water'&&!blockedAt(x,z,.2))best=[x,z];}if(best){o.x=best[0];o.z=best[1];}}
    if(o.label){const right=OBJ.some(q=>q!==o&&(q.kind==='tree'||q.kind==='pine'||q.kind==='bld'||q.kind==='bush')&&q.x-o.x>0&&q.x-o.x<3&&Math.abs(q.z-o.z)<1.6)||terr(o.x+1.6,o.z)==='water';o.spr=signSprite(o.label,right);signClear(o);}}
  // lamp posts off the paths, onto the grass verge
  for(const l of lamps){if(terr(l.x,l.z)!=='dirt')continue;let best=null;for(const r of [1,1.5,2,2.5,3])for(const [dx,dz] of [[r,0],[-r,0],[0,-r],[0,r]]){if(best)break;const x=l.x+dx,z=l.z+dz;if(terr(x,z)==='grass'&&terr(x-dx*.3,z-dz*.3)!=='water'&&!blockedAt(x,z,.25))best=[x,z];}
    if(!best)continue;const c=circles.find(q=>Math.abs(q.x-l.x)<.01&&Math.abs(q.z-l.z)<.01);if(c){c.x=best[0];c.z=best[1];}l.x=l.e.x=best[0];l.z=l.e.z=best[1];}
  // sacks in the yards were walk-through
  for(const o of OBJ)if(o.spr==='sacks'&&!o.room&&!blockedAt(o.x,o.z-.15,.05))addCircle(o.x,o.z-.15,.45);
  // grass and wheat tufts that grew through things
  const trunks=OBJ.filter(o=>o.kind==='tree'||o.kind==='pine'||o.kind==='bush'||(o.spr&&/^(stump|rock_|ore_)/.test(o.spr)));let removed=0,w=0;
  for(let i=0;i<OBJ.length;i++){const o=OBJ[i];let drop=false;if(o.grass){drop=blockedAt(o.x,o.z,.12)||trunks.some(q=>Math.abs(q.x-o.x)<(q.kind==='bush'?.75:.6)&&Math.abs(q.z-o.z)<.45);}
    if(drop){removed++;continue;}OBJ[w++]=o;}OBJ.length=w;return removed;}
{const _ac=autoCollide;autoCollide=function(){const r=_ac.apply(this,arguments);try{world67.n=world67();}catch(e){console.warn('world67',e);}return r;};}
