/* ================= world tidy-up: signposts you can read (each board painted with its place name), the blank road signs
   given something to say, the ferry sign out of the water, lamp posts moved off the paths onto the verge, the feed sacks solid,
   and no tuft of grass or wheat growing through a fence, a wall, a trunk or a bush ================= */
const SIGN_BLANKS={'-180':'MARROW HOLLOW 9 MI','-136':'NO SERVICES','-110':'DEER XING','-92':'MARROW HOLLOW 2 MI','-88':'!TURN BACK'};
function signSprite(label,flip){const red=label[0]==='!';const L=(red?label.slice(1):label).toUpperCase().replace(/[^A-Z0-9 .]/g,'');const key='sign:'+label+(flip?':L':'');if(SPR[key])return key;
  const tw=L.length*4-1,bw=Math.max(18,tw+10),bh=11,W=bw+8,Hh=40;const c=document.createElement('canvas');c.width=W;c.height=Hh;const g=c.getContext('2d');const p=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  // the post and the board with its pointed end (drawn pointing right, mirrored if it should point left)
  p(3,6,5,Hh-9,'#2a1a10');p(4,6,3,Hh-10,'#7a5432');p(4,6,1,Hh-10,'#a07448');p(6,6,1,Hh-10,'#5a3a20');p(4,Hh-6,3,1,'#5a3a20');
  const by=5,bx=2;for(let x=0;x<bw;x++){const tip=Math.max(0,x-(bw-6));const top=by+Math.ceil(tip*.9),bot=by+bh-Math.ceil(tip*.9);p(bx+x,top-1,1,bot-top+2,'#2a1a10');}
  for(let x=0;x<bw-1;x++){const tip=Math.max(0,x-(bw-6));const top=by+Math.ceil(tip*.9),bot=by+bh-Math.ceil(tip*.9);for(let y=top;y<bot;y++){const v=(y-by)/bh;let col=v<.18?'#d8aa72':v>.82?'#8a5c34':'#b98a58';if((x*7+y*13)%29===0)col='#a07448';if(y===by+5&&x%9<5)col='#a8784a';p(bx+x,y,1,1,col);}}
  p(bx+2,by+2,1,1,'#5a3a20');p(bx+2,by+bh-3,1,1,'#5a3a20');
  let out=c;if(flip){out=document.createElement('canvas');out.width=W;out.height=Hh;const o=out.getContext('2d');o.translate(W,0);o.scale(-1,1);o.drawImage(c,0,0);}
  const og=out.getContext('2d');og.setTransform(1,0,0,1,0,0);og.fillStyle='rgba(10,14,6,.35)';og.beginPath();og.ellipse(flip?W-6:6,Hh-3,5,1.6,0,0,Math.PI*2);og.fill();
  // the letters, burnt in (or daubed in red)
  let X=flip?W-bx-5-tw:bx+5;const tc=red?'#9a1a14':'#3a2410';for(const ch of L){const f=PXFONT[ch]||PXFONT[' '];for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(f[j*3+i]==='1'){og.fillStyle=tc;og.fillRect(X+i,by+3+j,1,1);if(!red){og.fillStyle='rgba(255,230,180,.25)';og.fillRect(X+i,by+4+j,1,1);}}X+=4;}
  if(red)for(let i=0;i<4;i++){og.fillStyle='#7a1410';og.fillRect((flip?W-bx-8-i*7:bx+6+i*7),by+bh-1+(i%2),1,2);}
  IMG[key]=out;SPR[key]={src:key,fw:W,fh:Hh,ax:flip?W-5.5:5.5,ay:Hh-3,foot:[-.15,-.1,.15,0]};return key;}
const blockedAt=(x,z,r)=>{const t={x,z};collide(t,r);return Math.abs(t.x-x)+Math.abs(t.z-z)>.001;};
function world67(){
  for(const o of OBJ){if(o.spr!=='signpost'||o.room)continue;if(!o.label){const k=Object.keys(SIGN_BLANKS).find(k=>Math.abs(+k-o.x)<1.5);if(k)o.label=SIGN_BLANKS[k];}
    if(o.label&&terr(o.x,o.z)==='water'){let best=null;for(let r=.5;r<5&&!best;r+=.5)for(let a=0;a<6.28&&!best;a+=.4){const x=o.x+Math.cos(a)*r,z=o.z+Math.sin(a)*r;if(terr(x,z)!=='water'&&!blockedAt(x,z,.2))best=[x,z];}if(best){o.x=best[0];o.z=best[1];}}
    if(o.label){const right=OBJ.some(q=>q!==o&&(q.kind==='tree'||q.kind==='pine'||q.kind==='bld'||q.kind==='bush')&&q.x-o.x>0&&q.x-o.x<3&&Math.abs(q.z-o.z)<1.6)||terr(o.x+1.6,o.z)==='water';o.spr=signSprite(o.label,right);}}
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
