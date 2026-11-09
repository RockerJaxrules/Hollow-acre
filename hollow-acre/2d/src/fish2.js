/* ================= fishing, second pass: every kind of fish its own item with its own picture, size and quality, the float's
   flight and splash and its ripples, and the card that shows what you caught. (How you cast, strike and fight the fish is in
   fish3.js, which replaces the cast and catch game that used to be here.) ================= */
// ---------- every fish its own item
const FISH_SP={'Yellow perch':'perch','Sunfish':'sunfish','Mud carp':'carp','Creek chub':'chub','Brook trout':'trout','Largemouth bass':'bass','Channel catfish':'catfish','Pale eel':'eel','Eyeless pike':'pike','Hollow carp':'hollow'};
const FISH_BY_SP={};for(const f of FISH)FISH_BY_SP[FISH_SP[f[0]]]=f;
const bkey=b=>b.kind==='fish'&&b.sp?'fish~'+b.sp:b.kind;
// how each one looks: body length and depth (px of 32), colours top→belly, fins, markings
const FISH_LOOK={
  perch:{l:22,h:10,c:['#3a4a14','#7a8a24','#b8b23a','#f0e6a0'],fin:'#e0662a',pat:'bars',tail:'fork'},
  sunfish:{l:17,h:14,c:['#21504e','#3f8272','#74b496','#f09a3a'],fin:'#2f6464',pat:'specks',tail:'round',ear:1},
  carp:{l:24,h:12,c:['#40301a','#76592c','#a88846','#dcc48c'],fin:'#6a4a26',pat:'scales',tail:'fork',barbel:1},
  chub:{l:20,h:9,c:['#3e4c5a','#7f8f9e','#bcc8d0','#f2f6f6'],fin:'#9aa4ae',pat:'none',tail:'fork'},
  trout:{l:24,h:10,c:['#34442a','#66763a','#a8a46a','#f0d6ae'],fin:'#d0663a',pat:'trout',tail:'round'},
  bass:{l:24,h:11,c:['#23401a','#44702a','#86ac46','#e8e6b0'],fin:'#3e6428',pat:'stripe',tail:'round',mouth:2},
  catfish:{l:26,h:10,c:['#24323e','#465e6c','#8298a2','#dee2de'],fin:'#3a4a56',pat:'dots',tail:'fork',barbel:2},
  eel:{eel:1,c:['#6e6e66','#b4b4a8','#dedcd2','#f8f6ee'],fin:'#c8c6b8'},
  pike:{l:28,h:8,c:['#34443a','#66786a','#a6b4a0','#e8ece0'],fin:'#76887a',pat:'pale',tail:'fork',noeye:1,snout:1},
  hollow:{l:24,h:13,c:['#2c2c2c','#5c5c5c','#8e8e8e','#c4c4c4'],fin:'#4a4a4a',pat:'cracks',tail:'fork',redeye:1}};
const FISH_ICV={};
function fishIconCanvas(sp){if(FISH_ICV[sp])return FISH_ICV[sp];const L=FISH_LOOK[sp]||FISH_LOOK.chub;const c=document.createElement('canvas');c.width=32;c.height=32;const g=c.getContext('2d');
  const P=(x,y,col)=>{g.fillStyle=col;g.fillRect(x,y,1,1);};const H=(x,y,s)=>{const n=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;return n-Math.floor(n);};
  if(L.eel){const pts=[];for(let k=0;k<=60;k++){const u=k/60;pts.push([3+u*26,16+Math.sin(u*6.2+.4)*3.2,u<.12?1.6+u*6:u>.8?Math.max(.6,2.4-(u-.8)*9):2.4]);}
    for(const [x,y,r] of pts)for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){if(dx*dx+dy*dy>r*r)continue;const X=Math.round(x+dx),Y=Math.round(y+dy),v=dy/r;P(X,Y,v<-.45?L.c[1]:v<.25?L.c[2]:L.c[3]);}
    for(let k=8;k<52;k+=2){const [x,y,r]=pts[k];P(Math.round(x),Math.round(y-r-1),L.fin);}const [hx,hy]=pts[3];P(Math.round(hx)-1,Math.round(hy)-1,'#1a1a1a');P(Math.round(hx)-3,Math.round(hy)+1,'#2a1a14');}
  else{const cx=16-(L.tail?2:0),cy=16,rx=L.l/2,ry=L.h/2;
    for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const nose=x<-rx*.55&&L.snout?.6:1;const d=(x*x)/(rx*rx)+(y*y)/(ry*ry*nose*nose);if(d>1)continue;const u=(y+ry)/(2*ry);
      let col=u<.22?L.c[0]:u<.5?L.c[1]:u<.74?L.c[2]:L.c[3];const X=cx+x,Y=cy+y;
      if(L.pat==='bars'&&u<.7&&Math.abs(((x+rx)%5)-2)<1&&x>-rx+4)col=L.c[0];
      if(L.pat==='stripe'&&Math.abs(y)<1.2&&x>-rx+4&&H(x,y,1)>.25)col=L.c[0];
      if(L.pat==='scales'&&((x+(y&1))%3===0)&&u>.15&&u<.8)col=L.c[0];
      if(L.pat==='specks'&&u>.15&&u<.65&&H(x,y,2)>.86)col='#9adcd8';
      if(L.pat==='trout'&&u>.15&&u<.7&&H(x,y,3)>.88)col=H(x,y,4)>.5?'#e04a2a':'#f0d860';
      if(L.pat==='dots'&&u<.6&&H(x,y,5)>.85)col=L.c[0];
      if(L.pat==='pale'&&u<.65&&(x+rx)%4===0&&(y&1))col=L.c[2];
      if(L.pat==='cracks'&&H(x>>1,y,6)>.9)col='#141414';
      if(d<.35&&u<.4&&x<0)col=col===L.c[1]?L.c[2]:col;
      P(X,Y,col);}
    // fins: back, belly, and the tail
    for(let x=-3;x<=3;x++){const h=3-Math.abs(x)*.6;for(let k=0;k<h;k++)P(cx+x,cy-ry-1-k,L.fin);}
    for(let x=0;x<3;x++)P(cx+2+x,cy+ry+1,L.fin);
    const tx=cx+rx;if(L.tail==='fork')for(let k=0;k<5;k++){P(tx+k,cy-1-k,L.fin);P(tx+k,cy-k,L.fin);P(tx+k,cy+1+k,L.fin);P(tx+k,cy+k,L.fin);}
    else for(let k=0;k<4;k++)for(let j=-1-k;j<=1+k;j++)P(tx+k,cy+j,L.fin);
    // the head
    const ex=Math.round(cx-rx+3+(L.snout?3:0)),ey=cy-2;if(!L.noeye){P(ex,ey,'#f4f4f0');P(ex+1,ey,'#f4f4f0');P(ex,ey+1,L.redeye?'#c0202a':'#101010');P(ex+1,ey+1,'#f4f4f0');}
    for(let k=0;k<(L.mouth||1);k++)P(Math.round(cx-rx)+k,cy+1,'#2a1a14');
    for(let k=0;k<4;k++)P(Math.round(cx-rx+6+(L.snout?3:0)),cy-2+k,L.c[0]);
    if(L.ear)P(Math.round(cx-rx+6),cy-1,'#101820'),P(Math.round(cx-rx+6),cy,'#101820');
    if(L.barbel)for(let k=0;k<2+L.barbel*2;k++){P(Math.round(cx-rx)-1-k*.5,cy+2+k,'#3a2a20');}}
  // a dark outline round the whole fish
  const d=g.getImageData(0,0,32,32),D=d.data,out=[];for(let y=0;y<32;y++)for(let x=0;x<32;x++){if(D[(y*32+x)*4+3])continue;let n=false;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<32&&Y<32&&D[(Y*32+X)*4+3]>0)n=true;}if(n)out.push([x,y]);}
  g.fillStyle='rgba(16,12,10,.9)';for(const [x,y] of out)g.fillRect(x,y,1,1);
  return FISH_ICV[sp]=c;}
// the rusted harmonica is junk you can still sell
function junkIcon(){const c=document.createElement('canvas');c.width=32;c.height=32;const g=c.getContext('2d');g.fillStyle='#1a1410';g.fillRect(5,11,22,10);g.fillStyle='#8a8478';g.fillRect(6,12,20,8);g.fillStyle='#b8b2a4';g.fillRect(6,12,20,2);g.fillStyle='#7a4a2a';g.fillRect(6,15,20,2);
  g.fillStyle='#2a201a';for(let i=0;i<6;i++)g.fillRect(8+i*3,15,2,2);g.fillStyle='#a0582a';g.fillRect(19,13,4,2);return c;}
for(const sp in FISH_LOOK){const k='fish~'+sp;ICON[k]=fishIconCanvas(sp).toDataURL();PRODUCE_NAMES[k]=FISH_BY_SP[sp][0];if(typeof SHIP_CAT!=='undefined')SHIP_CAT[k]='Fish';if(typeof GIFTS!=='undefined')GIFTS[k]=FISH_BY_SP[sp][0];}
ICON.harmonica=junkIcon().toDataURL();PRODUCE_NAMES.harmonica='Rusted harmonica';if(typeof SHIP_CAT!=='undefined')SHIP_CAT.harmonica='Other';
// the backpack, the shipping bin and gifts see each kind of fish separately
{const _ak=allItemKeys;allItemKeys=function(){const ks=_ak().filter(k=>k!=='P:fish');const seen=new Set();for(const b of S.basket){if(b.kind!=='fish')continue;const k='P:'+bkey(b);if(!seen.has(k)){seen.add(k);ks.push(k);}}return ks;};}
{const _ii=itemInfo;itemInfo=function(key){if(key&&key.startsWith('P:fish~')){const id=key.slice(2),sp=id.slice(5),f=FISH_BY_SP[sp];const its=S.basket.filter(b=>bkey(b)===id);const n=its.length,v=its.reduce((a,b)=>a+b.value,0),raw=RAW.fish;
    const best=its.reduce((a,b)=>Math.max(a,b.q||0),0),rec=f&&S.fishLog[f[0]];
    return {key,type:'P',id,name:f?f[0]:'Fish',desc:`${['','Silver quality. ','Gold quality. '][best]}Edible: +${raw[0]} energy, +${raw[1]} health. ${rec?`Your biggest: ${rec} cm. `:''}Ships for ${n?Math.round(v/n):'?'} each.`,icon:id,qty:n,food:raw,sell:n?Math.round(v/n):0};}
  return _ii.apply(this,arguments);};}
sellables=function(){const out=[],kinds={};for(const b of S.basket)(kinds[bkey(b)]=kinds[bkey(b)]||[]).push(b.value);
  for(const [k,vs] of Object.entries(kinds))out.push({t:'P',id:k,n:vs.length,each:Math.round(vs.reduce((a,b)=>a+b,0)/vs.length)});
  for(const k of Object.keys(S.inv||{})){const n=inv(k),p=sellPrice(k);if(n>0&&p>0)out.push({t:'I',id:k,n,each:p});}
  return out.sort((a,b)=>SHIP_ORDER.indexOf(shipCat(a.id))-SHIP_ORDER.indexOf(shipCat(b.id)));};
shipPut=function(t,id,all){let n=0;do{if(t==='P'){const i=S.basket.findIndex(b=>bMatch(b,id));if(i<0)break;const b=S.basket.splice(i,1)[0];S.ship.push({t,id:bkey(b),value:b.value});}
    else{if(inv(id)<=0)break;takeInv(id,1);S.ship.push({t,id,value:sellPrice(id)});}n++;S.shipped++;}while(all);
  if(n){SFX.harvest&&SFX.harvest();updateHud&&updateHud();}return n;};
shipTake=function(t,id,all){let n=0;do{const i=S.ship.findIndex(e=>e.t===t&&e.id===id);if(i<0)break;const e=S.ship.splice(i,1)[0];
    if(t==='P'){const [kind,sp]=id.split('~');const b={kind,value:e.value};if(sp)b.sp=sp;S.basket.push(b);}else addInv(id,1);S.shipped=Math.max(0,S.shipped-1);n++;}while(all);
  if(n){SFX.page&&SFX.page();updateHud&&updateHud();}return n;};
openGift=function(n){if(!n)return;const id=n.def.id,P_=PEOPLE[id];const kinds=[...new Set(S.basket.map(bkey))];
  $('talkLine').innerHTML='<span class="sub">What will you give?</span>';const acts=$('talk').querySelector('.acts');const row=document.createElement('div');row.className='giftrow';
  for(const k of kinds){const base=k.split('~')[0];const b=document.createElement('button');b.className='buy';b.textContent=`${PRODUCE_NAMES[k]||GIFTS[k]||k} ×${basketCount(k)}`;b.addEventListener('click',()=>{takeBasket(k,1);S.gifted[id]=S.day;
      const r=P_.loves.includes(base)?'love':P_.likes.includes(base)?'like':P_.hates.includes(base)?'hate':'meh';addFriend(id,{love:80,like:45,hate:-30,meh:20}[r]);SFX[r==='hate'?'deny':'coin']();
      $('talkLine').innerHTML=`<q>${P_.gift[r]}</q>`;row.remove();$('talkGift').hidden=true;updateHud();});row.appendChild(b);}
  acts.before(row);};

// ---------- the cast: hold to wind up, let go to cast (tap twice still works)
const F2={cast:0,landed:true,pw:0,rip:[],show:null,kd:0,pd:null};
{const fp=$('fishPow');if(fp)fp.remove();}
fishAct=function(){if(MG.on)return;const now=performance.now();
  if(fish.state==='off'){const w=waterAhead()||(Math.hypot(P.x-fishSpot.x,P.z-fishSpot.z)<1.6?[fishSpot.x,fishSpot.z+3]:null);if(!w){toast('Stand at the water’s edge, then use your rod on the water.',1.8);return;}
    if(!spend(1))return;fish.state='power';fish.t=0;fish.p0=now;fish.aim=w;fish.bx=P.x+P.fx*.8;fish.bz=P.z+P.fz*.8;
    if(!S.castTold||S.castTold<3){S.castTold=(S.castTold||0)+1;toast(fineP()?'Hold to wind up, let go to cast. (Or click again.)':'Hold to wind up, let go to cast. (Or tap again.)',1.8);}return;}
  if(fish.state==='power'){const pw=fish.power;const [wx,wz]=fish.aim;let bx=P.x+P.fx*(1.4+pw*3.2),bz=P.z+P.fz*(1.4+pw*3.2);if(!waterAt(bx,bz)){bx=wx;bz=wz;}
    fish.bx=bx;fish.bz=bz;fish.where=fishWhere(bx,bz);fish.state='wait';fish.cast=pw;fish.t=(2+rand()*5)*(inv('bait')>0?.4:1)*(1.15-pw*.3);if(inv('bait')>0)takeInv('bait');
    F2.cast=now;F2.landed=false;F2.pw=pw;F2.rip=[];SFX.swing&&SFX.swing();if(pw>.92)toast('Max!',.7);return;}
  if(fish.state==='wait'){fish.state='off';toast('You reel in too early. Nothing.',1.4);return;}
  if(fish.state==='bite'){const night=isNight();
    if(night&&!S.bound&&rand()<.12){fish.state='off';SFX.stinger();cam.shake=.4;mindHit&&mindHit(4);toast(pick(['A grey hand comes up with the hook in its palm. It lets go.','The line goes slack. Something below the water says your name, very politely.','You pull up a fistful of long hair. It is the same colour as yours.']),3.2,true);return;}
    const f=rand()<(night?.07:.04)?null:pickFish(fish.where,night);startMG(f);}};
fishUpdate=function(dt){if(fish.state==='off'||MG.on)return;const now=performance.now();
  if(fish.state==='power'){fish.t+=dt;fish.power=.5-.5*Math.cos(fish.t*3.2);return;}
  if(!F2.landed&&now-F2.cast>560){F2.landed=true;burst(fish.bx,fish.bz,9,'#cfe6f8',1.3,.6,2);SFX.splash&&SFX.splash(.3);F2.rip.push(now);}
  if(Math.hypot(P.x-fish.aim[0],P.z-fish.aim[1])>3.2){fish.state='off';return;}
  if(!F2.landed)return;fish.t-=dt;
  if(fish.state==='wait'&&fish.t<=0){fish.state='bite';fish.t=.85;SFX.splash&&SFX.splash(.45);F2.rip.push(now);try{navigator.vibrate&&navigator.vibrate(60);}catch(e){}}
  else if(fish.state==='bite'&&fish.t<=0){toast('It got away.',1.2);fish.state='wait';fish.t=2+rand()*4;}};
// holding: the button or a press on the water starts the wind-up; letting go casts
addEventListener('keydown',e=>{if((e.code==='Space'||e.code==='KeyC')&&!e.repeat)F2.kd=performance.now();},true);
addEventListener('keyup',e=>{if(e.code!=='Space'&&e.code!=='KeyC')return;const kd=F2.kd;F2.kd=0;if(MG.on||fish.state!=='power'||!kd)return;if(fish.p0>=kd-30&&performance.now()-kd>260)fishAct();},true);
addEventListener('pointerdown',e=>{if((e.target!==view&&e.target.id!=='c')||S.mode!=='play'||S.paused||MG.on||(typeof PLACE!=='undefined'&&PLACE.on))return;if(e.pointerType==='mouse'&&e.button!==0)return;
  if(fish.state==='power'){F2.pd={id:e.pointerId,t:performance.now(),cast:true};e.stopImmediatePropagation();return;}
  if(fish.state!=='off'||S.room||P.anim||heldKind()!=='rod'||!waterAhead())return;const [wx,wz]=screenToWorld(e.clientX,e.clientY);const dP=Math.hypot(wx-P.x,wz-P.z);
  if(!(dP<1.3||(waterAt(wx,wz)&&dP<6)))return;fish.tap=[wx,wz,performance.now()];fishAct();if(fish.state==='power'){F2.pd={id:e.pointerId,t:performance.now(),cast:false};e.stopImmediatePropagation();}},true);
addEventListener('pointerup',e=>{const pd=F2.pd;if(!pd||e.pointerId!==pd.id)return;F2.pd=null;e.stopImmediatePropagation();if(fish.state!=='power')return;if(pd.cast||performance.now()-pd.t>260)fishAct();},true);
addEventListener('pointercancel',e=>{if(F2.pd&&e.pointerId===F2.pd.id)F2.pd=null;},true);

// ---------- what you see at the water: the meter, the float's flight and splash, ripples, the bite, the catch held up
const fpx=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);};
function fishFloat(g,x,y,sub,air){const X=Math.round(x),wl=Math.round(y),o=wl+sub;const row=(dy,x0,w,c)=>{const yy=o+dy;if(!air&&yy>=wl)return;fpx(g,X+x0,yy,w,1,c);};
  row(-7,0,1,'#3a2a1a');row(-6,0,1,'#3a2a1a');row(-5,-1,3,'#e83020');row(-4,-2,5,'#d82818');row(-3,-2,5,'#c02010');row(-4,-2,1,'#ff7a5a');row(-2,-2,5,'#f4f0e8');row(-1,-2,5,'#e4e0d4');row(0,-1,3,'#c8c4b8');row(1,0,1,'#a8a498');
  if(!air){fpx(g,X-3,wl,7,1,'rgba(225,242,255,.6)');fpx(g,X-4,wl+1,2,1,'rgba(225,242,255,.3)');fpx(g,X+3,wl+1,2,1,'rgba(225,242,255,.3)');}}
function fishRipples(g,x,y,now,fast){if(!F2.rip.length||now-F2.rip[F2.rip.length-1]>(fast?280:1500))F2.rip.push(now);F2.rip=F2.rip.filter(t0=>now-t0<1300);
  for(const t0 of F2.rip){const u=(now-t0)/1300,r=2+u*(fast?7:10),a=(1-u)*.55;g.fillStyle=`rgba(232,246,255,${a.toFixed(3)})`;const n=Math.max(10,Math.round(r*3));for(let i=0;i<n;i++){const an=i/n*Math.PI*2;g.fillRect(Math.round(x+Math.cos(an)*r),Math.round(y+Math.sin(an)*r*.38),1,1);}}}
function fishBang(g,x,y,t){const by=Math.round(y-Math.abs(Math.sin(t*9))*2),bx=Math.round(x)-4;fpx(g,bx-1,by-1,11,14,'#1a0e06');fpx(g,bx,by,9,12,'#fff8e4');fpx(g,bx,by+11,9,1,'#d8ccb0');fpx(g,bx+3,by+12,3,2,'#1a0e06');fpx(g,bx+4,by+12,1,1,'#fff8e4');
  fpx(g,bx+3,by+2,3,5,'#e0302a');fpx(g,bx+4,by+2,1,5,'#ff7060');fpx(g,bx+3,by+8,3,2,'#e0302a');}
function fishMeter(g,x,y,p){x=Math.round(x);y=Math.round(y);fpx(g,x-1,y-1,10,40,'#1a0e06');fpx(g,x,y,8,38,'#8a5a2a');fpx(g,x,y,8,1,'#c08a4a');fpx(g,x+1,y+1,6,36,'#2a1608');const h=Math.round(p*34);
  for(let k=0;k<h;k++){const u=k/34;fpx(g,x+2,y+36-k,4,1,u<.33?'#d84a2a':u<.66?'#e8b030':'#7cc04a');}fpx(g,x+2,y+36-h,4,1,'#fff4c0');fpx(g,x-2,y+17,2,4,'#c08a4a');}
function fishDraw(g,tip,X,Y,t){const now=performance.now();
  if(F2.show&&now<F2.show.until){const im=fishIconCanvas(F2.show.sp);const bob=Math.round(Math.sin(t*4));g.drawImage(im,0,0,32,32,Math.round(X-11),Math.round(Y-76+bob),22,22);}
  if(fish.state==='off'&&!MG.on)return;const from=tip||[X+8,Y-36];
  if(fish.state==='power'){const bx=from[0],by=from[1]+9+Math.round(Math.sin(t*3));fishLine(g,from,[bx,by-6],true,t);fishFloat(g,bx,by,0,true);fishMeter(g,X+16,Y-60,fish.power);return;}
  const tx=sx(fish.bx),ty=sz(fish.bz);const u=Math.min(1,(now-F2.cast)/560);
  if(!F2.landed&&u<1){const bx=from[0]+(tx-from[0])*u,by=from[1]+(ty-from[1])*u-Math.sin(u*Math.PI)*(16+F2.pw*28);fishLine(g,from,[bx,by-6],true,t);fishFloat(g,bx,by,0,true);return;}
  const bite=fish.state==='bite',mg=MG.on;fishRipples(g,tx,ty,now,bite||mg);const sub=mg?1+((now/90|0)%2):bite?3:0;const jit=mg||bite?Math.round(Math.sin(t*38)):0;
  fishLine(g,from,[tx+jit,ty-4],bite||mg,t);fishFloat(g,tx+jit,ty+(bite||mg?0:Math.round(Math.sin(t*2.4)*.8)),sub,false);
  if(mg&&((now/160|0)%3===0))fpx(g,tx+jit+(Math.random()*8-4),ty-1-Math.random()*3,1,1,'#e8f6ff');
  if(bite)fishBang(g,X,Y-66,t);}

// ---------- the catch game: a carved gauge with water, your bar, the fish, a reel and sometimes a chest
{const css=document.createElement('style');css.textContent=`#fishMG{background:rgba(6,10,14,.28)}#fishMG .frame{display:none}
#fishMG .fg{position:absolute;left:calc(50% + 40px);top:50%;transform:translateY(-62%);image-rendering:pixelated;filter:drop-shadow(0 4px 0 rgba(0,0,0,.45))}
#fishMG .fhint{position:absolute;left:50%;bottom:9%;transform:translateX(-50%);white-space:nowrap;font:14px 'Hollow Pixel',monospace;color:#fff4dc;text-shadow:1px 1px 0 #000,0 0 6px #000}
#fishCard{position:fixed;left:50%;top:12%;transform:translateX(-50%) scale(.6);opacity:0;z-index:61;display:flex;gap:10px;align-items:center;padding:8px 14px 8px 8px;background:#f2e2bc;color:#3a2410;font:14px 'Hollow Pixel',monospace;
  box-shadow:0 0 0 3px #5a3418,0 0 0 6px #b8823c,0 0 0 9px #3a2410,0 8px 0 9px rgba(0,0,0,.35);transition:transform .22s cubic-bezier(.3,1.6,.5,1),opacity .2s;pointer-events:none}
#fishCard.on{transform:translateX(-50%) scale(1);opacity:1}#fishCard canvas{width:64px;height:64px;image-rendering:pixelated;background:#d8c49a;box-shadow:inset 0 0 0 2px #a8865a}
#fishCard b{font-size:17px;display:block}#fishCard .q{color:#8a6a2a}#fishCard .new{display:inline-block;background:#d84a2a;color:#fff4dc;padding:0 5px;margin-left:6px;font-size:12px;vertical-align:2px}`;document.head.appendChild(css);
  const el=$('fishMG');const cv=document.createElement('canvas');cv.className='fg';cv.width=46;cv.height=160;el.appendChild(cv);const h=document.createElement('div');h.className='fhint';el.appendChild(h);
  const card=document.createElement('div');card.id='fishCard';card.innerHTML='<canvas width="32" height="32"></canvas><div class="t"></div>';document.body.appendChild(card);}
const FG={W:46,H:160,tx:7,ty:9,tw:19,th:134,px:31,pw:7};
startMG=function(f){const el=$('fishMG');const night=isNight();Object.assign(MG,{on:true,f,hold:false,zone:.1,zv:0,fy:.3,fv:0,ft:.3,tt:0,prog:.32,size:S.rod>=4?.40:S.rod>=3?.36:S.rod>=2?.31:.26,d:f?f[2]:.25,beh:f?f[3]:'smooth',
    last:performance.now(),scare:false,perfect:true,age:0,reelA:0,sp:f?FISH_SP[f[0]]:null,horror:night&&!!f&&f[2]>.6,
    tr:f&&rand()<.2&&!(night&&f[2]>.6)?{at:1+rand()*2.5,y:.15+rand()*.7,vy:0,prog:0,got:false,pop:0}:null});
  const k=Math.max(2,Math.min(4,Math.floor(innerHeight*.62/FG.H)));const cv=el.querySelector('.fg');cv.style.width=FG.W*k+'px';cv.style.height=FG.H*k+'px';
  el.querySelector('.fhint').textContent=fineP()?'Hold the mouse button (or Space) to lift the bar':'Hold anywhere to lift the bar';el.style.display='flex';S.paused=true;fish.state='reel';requestAnimationFrame(mgStep);};
mgStep=function(now){if(!MG.on)return;const dt=Math.min(.05,(now-MG.last)/1000);MG.last=now;MG.age+=dt;const el=$('fishMG');
  MG.zv+=(MG.hold?2.1:-1.9)*dt;MG.zv=clamp(MG.zv,-1.4,1.4);MG.zone+=MG.zv*dt;if(MG.zone<0){MG.zone=0;MG.zv=-MG.zv*.35;}if(MG.zone>1-MG.size){MG.zone=1-MG.size;MG.zv=0;}
  MG.tt-=dt;const d=MG.d;if(MG.tt<=0){MG.tt=(MG.beh==='dart'?.35:MG.beh==='mixed'?.5:.9)+rand()*(1.4-d);
    let t=rand();if(MG.beh==='sinker')t=t*t;if(MG.beh==='floater')t=1-t*t;if(MG.beh==='dart'&&rand()<.5)t=MG.fy+(rand()<.5?-1:1)*(.25+d*.3);MG.ft=clamp(t,.02,.98);
    if(isNight()&&!MG.scare&&rand()<.06&&MG.f&&MG.f[2]>.6){MG.scare=true;MG.ft=0;el.querySelector('.fhint').textContent='It pulls back.';cam.shake=.3;SFX.stinger&&SFX.stinger();}}
  const spd=(MG.beh==='dart'?2.6:MG.beh==='mixed'?2.2:1.2)*(.5+d);MG.fv+=((MG.ft-MG.fy)*spd*3-MG.fv*2.4)*dt;MG.fy=clamp(MG.fy+MG.fv*dt,0,1);
  const inside=MG.fy>=MG.zone&&MG.fy<=MG.zone+MG.size;MG.prog+=(inside?.24:-.17*(1+d*.6))*dt;if(!inside&&MG.age>.6)MG.perfect=false;
  if(MG.hold)MG.reelA+=dt*14;else if(inside)MG.reelA+=dt*5;
  const tr=MG.tr;if(tr&&!tr.got){if(MG.age>tr.at){tr.vy+=(rand()-.5)*dt*.8;tr.vy*=.98;tr.y=clamp(tr.y+tr.vy*dt,.05,.95);const tin=tr.y>=MG.zone&&tr.y<=MG.zone+MG.size;tr.prog=clamp(tr.prog+(tin?.5:-.3)*dt,0,1);if(tr.prog>=1){tr.got=true;tr.pop=1;SFX.coin&&SFX.coin();}}}
  if(tr&&tr.pop>0)tr.pop=Math.max(0,tr.pop-dt*1.5);
  mgDraw(now/1000,inside);
  if(MG.prog>=1){endMG(true);return;}if(MG.prog<=0){endMG(false);return;}requestAnimationFrame(mgStep);};
function mgDraw(t,inside){const cv=$('fishMG').querySelector('.fg'),g=cv.getContext('2d');g.imageSmoothingEnabled=false;const {W,H,tx,ty,tw,th}=FG;g.clearRect(0,0,W,H);const p=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  // the carved frame
  p(0,0,W,H,'#1a0e06');p(1,1,W-2,H-2,'#7a4a20');for(let x=2;x<W-2;x+=5)p(x,1,1,H-2,'#6a3e1a');p(1,1,W-2,1,'#b8823c');p(1,1,1,H-2,'#a8763a');p(W-2,1,1,H-2,'#4a2a10');p(1,H-2,W-2,1,'#4a2a10');
  for(const [cx,cy] of [[3,3],[W-4,3],[3,H-4],[W-4,H-4]]){p(cx,cy,2,2,'#e8c060');p(cx,cy,1,1,'#fff2c8');}
  // the water column
  p(tx-1,ty-1,tw+2,th+2,'#1a0e06');const top=MG.horror?[58,10,10]:[58,122,176],bot=MG.horror?[18,4,4]:[18,48,80];
  for(let y=0;y<th;y++){const u=y/th;p(tx,ty+y,tw,1,`rgb(${Math.round(top[0]+(bot[0]-top[0])*u)},${Math.round(top[1]+(bot[1]-top[1])*u)},${Math.round(top[2]+(bot[2]-top[2])*u)})`);}
  for(let k=0;k<6;k++){const y=ty+((k*23+t*10)%th);p(tx+1+((k*7)%(tw-6)),Math.round(y),4,1,'rgba(255,255,255,.12)');}
  for(let k=0;k<4;k++){const y=ty+th-((k*37+t*18)%th);p(tx+3+((k*5)%(tw-6)),Math.round(y),1,1,'rgba(220,240,255,.5)');}
  p(tx,ty+th-6,tw,6,MG.horror?'#2a0606':'#4a3a24');for(let x=0;x<tw;x+=3)p(tx+x,ty+th-7-((x*7)%3),1,2+((x*5)%3),MG.horror?'#3a0a0a':'#3a6a2a');
  // your bar
  const bh=Math.round(MG.size*th),by=ty+Math.round((1-MG.zone-MG.size)*th);p(tx+1,by,tw-2,bh,inside?'rgba(150,240,110,.62)':'rgba(120,210,90,.45)');p(tx+1,by,tw-2,1,inside?'#d8ffb0':'#b8f080');p(tx+1,by+bh-1,tw-2,1,'#3a7a2a');p(tx+1,by,1,bh,'rgba(220,255,200,.5)');
  // the treasure chest
  const tr=MG.tr;if(tr&&MG.age>tr.at&&(!tr.got||tr.pop>0)){const cy=ty+Math.round((1-tr.y)*th)-4,cx=tx+5;const open=tr.got;p(cx-1,cy-1,11,9,'#1a0e06');p(cx,cy+(open?2:0),9,7-(open?2:0),'#8a5a2a');p(cx,cy+3,9,1,'#e8c060');p(cx+4,cy+3,1,2,'#fff2c8');
    if(!open){p(cx,cy,9,2,'#a87038');}else{p(cx,cy-2,9,2,'#a87038');for(let k=0;k<5;k++)p(cx+((k*3+Math.round(t*20))%9),cy-3-((k*5)%5),1,1,'#fff2a0');}
    if(!open){p(cx-1,cy+9,11,2,'#1a0e06');p(cx,cy+9,Math.round(9*tr.prog),1,'#ffd27a');}}
  // the fish
  const im=MG.sp?fishIconCanvas(MG.sp):null;const fy=ty+Math.round((1-MG.fy)*th);const sh=inside?0:Math.round(Math.sin(t*50));
  if(im){g.save();g.translate(tx+tw/2+sh,fy);if(MG.horror)g.filter='hue-rotate(160deg) brightness(.8)';g.rotate(-Math.PI/2*.85+Math.sin(t*6)*.08);g.drawImage(im,0,0,32,32,-9,-9,18,18);g.restore();}
  else{p(tx+5+sh,fy-3,9,6,'#5a5a5a');p(tx+6+sh,fy-3,7,1,'#9a9a9a');}
  // the catch meter
  const {px,pw}=FG;p(px-1,ty-1,pw+2,th+2,'#1a0e06');p(px,ty,pw,th,'#2a1608');const ph=Math.round(clamp(MG.prog,0,1)*th);const pc=MG.prog<.33?'#d84a2a':MG.prog<.66?'#e8b030':'#7cc04a';p(px+1,ty+th-ph,pw-2,ph,pc);p(px+1,ty+th-ph,pw-2,1,'#fff4c0');
  if(MG.perfect&&MG.age>.6)for(let k=0;k<2;k++)p(px+1+((Math.round(t*8)+k*3)%(pw-2)),ty+th-ph+1+k,1,1,'#ffffff');
  // the reel
  const rx=17,ry=H-9;g.fillStyle='#1a0e06';g.beginPath();g.arc(rx,ry,6.5,0,Math.PI*2);g.fill();g.fillStyle='#c8a050';g.beginPath();g.arc(rx,ry,5.5,0,Math.PI*2);g.fill();g.fillStyle='#8a6a2a';g.beginPath();g.arc(rx,ry,3,0,Math.PI*2);g.fill();
  const a=MG.reelA;p(Math.round(rx+Math.cos(a)*5)-1,Math.round(ry+Math.sin(a)*5)-1,3,3,'#efe2b8');p(Math.round(rx+Math.cos(a)*5),Math.round(ry+Math.sin(a)*5),1,1,'#5a3a1a');p(rx,ry,1,1,'#fff2c8');
  // the rod tip bends with the pull
  const bend=MG.hold?3:1+Math.round(Math.abs(Math.sin(t*9)));for(let k=0;k<12;k++)p(W-9+Math.round(k*k*bend/90),ty+3+k*2,2,2,k<4?'#5a3a1a':'#8a5a2a');}
endMG=function(ok){MG.on=false;MG.hold=false;$('fishMG').style.display='none';S.paused=false;fish.state='off';F2.rip=[];
  if(!ok){toast(MG.f?`The ${MG.f[0].toLowerCase()} got away.`:'It got away.',1.6);SFX.thud&&SFX.thud(0,.2);return;}
  if(!MG.f){const j=pick(JUNK);if(j[1])S.basket.push({kind:'harmonica',value:j[1]});SFX.splash&&SFX.splash();toast(`You reel in… ${j[0].toLowerCase()}. ${j[2]}`,3,true);if(/key|sneaker/.test(j[0]))mindHit&&mindHit(2);return;}
  const f=MG.f,sp=MG.sp;const len=Math.round(f[6]+rand()*(f[7]-f[6]));const big=(len-f[6])/(f[7]-f[6]);const q=MG.perfect?2:big>.7?1:0;
  const v=Math.round(f[1]*(.8+big*.5)*(S.rod>=4?2.5:S.rod>=3?2:S.rod>=2?1.5:1)*[1,1.25,1.5][q]);
  const isNew=!S.fishLog[f[0]],rec=!isNew&&len>S.fishLog[f[0]];S.basket.push({kind:'fish',sp,value:v,len,q});S.fishCaught=(S.fishCaught||0)+1;S.fishLog[f[0]]=Math.max(S.fishLog[f[0]]||0,len);
  SFX.splash&&SFX.splash();burst(fish.bx,fish.bz,16,'#9fc0e0',2,.7,3);F2.show={sp,until:performance.now()+2400};
  if(MG.perfect&&typeof addXP==='function')addXP('fishing',6);
  fishCard(f,sp,len,v,q,isNew,rec,MG.perfect);
  if(MG.tr&&MG.tr.got)setTimeout(fishTreasure,900);
  if(FISH_ODD[f[0]]){setTimeout(()=>toast(FISH_ODD[f[0]],3.4,true),700);mindHit&&mindHit(2);}updateHud();};
function fishCard(f,sp,len,v,q,isNew,rec,perfect){const c=$('fishCard');const g=c.querySelector('canvas').getContext('2d');g.clearRect(0,0,32,32);g.drawImage(fishIconCanvas(sp),0,0);
  c.querySelector('.t').innerHTML=`<b>${f[0]}${isNew?'<span class="new">NEW</span>':rec?'<span class="new">RECORD</span>':''}</b>${len} cm · worth ${v}<br><span class="q">${'★'.repeat(q)}${'☆'.repeat(2-q)}${perfect?' Perfect catch!':q===1?' A big one.':''}</span>`;
  c.classList.add('on');clearTimeout(c._t);c._t=setTimeout(()=>c.classList.remove('on'),2600);}
function fishTreasure(){const R=[['coins',20+Math.floor(rand()*30)],['bait',3],['copper',4],['iron',2],['coal',4],['gem',1]].filter(r=>r[0]==='coins'||ITEMS[r[0]]);const r=pick(R);
  if(r[0]==='coins')S.coins+=r[1];else addInv(r[0],r[1]);SFX.coin&&SFX.coin();toast(`Treasure! ${r[0]==='coins'?r[1]+' coins':r[1]+' × '+((ITEMS[r[0]]&&ITEMS[r[0]].name)||r[0]).toLowerCase()}.`,2.4);updateHud();}
