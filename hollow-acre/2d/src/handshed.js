/* ================= #304 Farm hands you can see, and a seed box you keep filled. The owner asked how the hands plant and water
   and where you give them their seeds. Now: a seed box stands at the corner of Grandpa's field. Put seeds in it and Old
   Merritt sows from the box (not from your own pocket); leave it empty and nothing gets sown. Water comes from the well and
   costs nothing. And the hands are there in the mornings, out on your land: Dell with his two cans along the rows he watered,
   the Kettle twins picking, Merritt sowing, Hannah with her pick in the stony ground she cleared, each going from one square
   they worked to the next, until about noon. ================= */
const HAND_LOOK={dell:{spr:'farmer_spiky',tool:'_can',clip:'thrust',job:'water',hue:212},kettle:{spr:'farmer_bangs',tool:'',clip:'slash',job:'pick',twins:1,hue:118},
  merritt:{spr:'farmer_long',tool:'',clip:'slash',job:'plant',hue:42},hannah:{spr:'farmer_bun',tool:'_pick',clip:'thrust',job:'clear',hue:285}};
// each hand's own shirt: the farmer's red plaid recoloured (only the strongly red pixels, so skin and hair stay as they are)
function handSheet(id,base){const L=HAND_LOOK[id],key='hand_'+id+'_'+base;if(SPR[key])return key;const m=SPR[base];if(!m)return null;const im=IMG[m.src];
  if(!im||!im.width){if(!handSheet.ask)handSheet.ask={};if(!handSheet.ask[m.src]&&typeof loadImages==='function'){handSheet.ask[m.src]=1;loadImages([m.src]);}return null;}
  const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const D=g.getImageData(0,0,c.width,c.height),d=D.data;
  for(let i=0;i<d.length;i+=4){if(d[i+3]<8)continue;const r=d[i]/255,gg=d[i+1]/255,b=d[i+2]/255,mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),l=(mx+mn)/2,s=mx===mn?0:(mx-mn)/(1-Math.abs(2*l-1));
    let h=0;if(mx!==mn){h=mx===r?((gg-b)/(mx-mn))%6:mx===gg?(b-r)/(mx-mn)+2:(r-gg)/(mx-mn)+4;h*=60;if(h<0)h+=360;}
    if(!(s>.42&&(h<14||h>340)&&l>.12))continue;const H=L.hue/60,C=(1-Math.abs(2*l-1))*s*.85,X=C*(1-Math.abs(H%2-1)),mm=l-C/2;let rr=0,g2=0,bb=0;
    if(H<1){rr=C;g2=X;}else if(H<2){rr=X;g2=C;}else if(H<3){g2=C;bb=X;}else if(H<4){g2=X;bb=C;}else if(H<5){rr=X;bb=C;}else{rr=C;bb=X;}
    d[i]=Math.round((rr+mm)*255);d[i+1]=Math.round((g2+mm)*255);d[i+2]=Math.round((bb+mm)*255);}
  g.putImageData(D,0,0);IMG['mem:'+key]=c;SPR[key]=Object.assign({},m,{src:'mem:'+key});return key;}
const handBox=()=>{const E=EMP();E.box=E.box||{seeds:{}};E.box.seeds=E.box.seeds||{};return E.box;};
// the morning's work, square by square, so the hands can be seen doing it
{const _em=empMorning;empMorning=function(){const before=new Map(tiles.map(t=>[t,{tl:!!t.tilled,c:t.crop,st:t.crop?t.crop.stage:-1,w:!!(t.crop&&t.crop.watered),deb:!!(t.debris&&!t.debris.hide)}]));
  const real=S.seeds,box=handBox();S.seeds=Object.assign({},box.seeds);let r;try{r=_em.apply(this,arguments);}finally{box.seeds=S.seeds;S.seeds=real;}
  try{const W={day:S.day,water:[],pick:[],plant:[],clear:[]};for(const t of tiles){const b=before.get(t);if(!b)continue;
      if(b.deb&&!(t.debris&&!t.debris.hide)||(!b.tl&&t.tilled))W.clear.push([t.x,t.z]);
      if(b.c&&b.st>=3&&(!t.crop||t.crop!==b.c||t.crop.stage<3))W.pick.push([t.x,t.z]);
      if(!b.c&&t.crop)W.plant.push([t.x,t.z]);
      if(t.crop&&t.crop===b.c&&!b.w&&t.crop.watered)W.water.push([t.x,t.z]);}
    for(const k of Object.keys(W))if(Array.isArray(W[k]))W[k]=W[k].slice(0,14);EMP().work=W;
    const hasM=(EMP().hands||[]).includes('merritt');if(hasM&&!W.plant.length&&!Object.values(box.seeds).some(n=>n>0))setTimeout(()=>toast('Old Merritt found the seed box empty. Nothing was sown.',3.4),5200);}catch(e){}
  return r;};}
// ---- the seed box at the corner of the field
const HAND_BOX_AT={x:-6.6,z:-.7};
function handBoxSpr(){if(SPR.hand_seedbox)return;const W=40,H=40,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};
  const WD=['#1e140c','#4a3220','#6a4a2e','#8a6440','#a8804e'];P(4,36,32,3,'rgba(0,0,0,.35)');
  for(let k=0;k<12;k++){const x0=5+Math.round(k*.35),w=30-Math.round(k*.7);P(x0-1,2+k,w+2,1,'#120c08');P(x0,2+k,w,1,k<2?WD[4]:k%4===3?'#b89a70':'#d0b48a');}P(4,13,32,1,'#120c08');P(7,13,4,2,'#5a5a62');P(29,13,4,2,'#5a5a62');P(8,13,2,1,'#9a9aa4');P(30,13,2,1,'#9a9aa4');   // the lid tipped back on its hinges, its pale inside facing us
  P(3,14,34,23,'#120c08');P(4,15,32,21,WD[2]);P(4,15,1,21,WD[3]);P(35,15,1,21,WD[1]);for(let y=21;y<36;y+=5)P(4,y,32,1,WD[1]);   // the box
  P(5,15,30,4,'#1a120a');   // the dark inside, under the rim
  for(const [x,col,h,t] of [[7,'#c8a03a',9,0],[13,'#6a8a3a',11,1],[19,'#a83a2a',8,-1],[25,'#7a5a9a',10,1],[30,'#c8783a',7,0]]){const y0=17-h;   // seed packets standing in it, every one a different height and lean
    for(let k=0;k<h;k++){const dx=t*Math.floor(k/4);P(x+dx-1,y0+k,7,1,'#120c08');P(x+dx,y0+k,5,1,k<2?'#f0e4c8':col);}P(x+1,y0+3,3,2,'#f0e4c8');}
  P(9,24,22,9,'#120c08');P(10,25,20,7,'#e8dcc0');P(10,25,20,1,'#f6eedc');   // a pale label
  if(typeof sgtT==='function')sgtT(P,'SEED',12,26,'#3a2a1a');
  IMG['mem:hand_seedbox']=c;SPR.hand_seedbox={src:'mem:hand_seedbox',fw:W,fh:H,ax:W>>1,ay:H-3,foot:[-.5,-.3,.5,0]};}
function handBoxOpen(){const box=handBox();const all=Object.keys(SEEDS).filter(k=>(S.seeds[k]||0)>0||(box.seeds[k]||0)>0);
  let h=`<div class="bzled"></div><h3>The hands’ seed box</h3><p class="bzs">Old Merritt sows from this box every morning, into any tilled square that’s empty. Put seeds in; take back what you don’t want sown. Dell waters from the well, which costs nothing. Hands are paid at dawn from your purse.</p>`;
  if(!all.length)h+='<p><i>You have no seeds to put in. Buy some at Coyle’s General.</i></p>';
  for(const k of all){const nm=SEEDS[k].name||k,mine=S.seeds[k]||0,inb=box.seeds[k]||0;
    h+=`<div class="bgshop"><div class="bgrow"><b>${nm}</b><small>in the box: ${inb} · yours: ${mine}</small>
      <button data-put="${k}|5" ${mine<1?'disabled':''}>Put in 5</button><button data-put="${k}|all" ${mine<1?'disabled':''}>All</button><button data-take="${k}" ${inb<1?'disabled':''}>Take back</button></div></div>`;}
  openNote(h,'Close the lid');const N=$('noteText');if(!N)return;
  N.querySelectorAll('[data-put]').forEach(b=>b.onclick=()=>{const [k,n]=b.dataset.put.split('|');const m=n==='all'?(S.seeds[k]||0):Math.min(5,S.seeds[k]||0);if(m<1)return;S.seeds[k]-=m;box.seeds[k]=(box.seeds[k]||0)+m;SFX.page&&SFX.page();updateHud&&updateHud();setTimeout(handBoxOpen,0);});
  N.querySelectorAll('[data-take]').forEach(b=>b.onclick=()=>{const k=b.dataset.take,m=box.seeds[k]||0;if(m<1)return;box.seeds[k]=0;S.seeds[k]=(S.seeds[k]||0)+m;SFX.page&&SFX.page();updateHud&&updateHud();setTimeout(handBoxOpen,0);});}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{handBoxSpr();let {x,z}=HAND_BOX_AT;
    if(typeof blockedAt==='function'&&blockedAt(x,z,.5)){for(const [dx,dz] of [[-1,0],[0,-1],[-1,-1],[1,-1],[-2,0]]){if(!blockedAt(x+dx,z+dz,.5)){x+=dx;z+=dz;break;}}}
    HAND_BOX_AT.x=x;HAND_BOX_AT.z=z;obj('hand_seedbox',x,z,{kind:'prop',handbox:1});addRect(x-.45,z-.3,x+.45,z);
    interact.push({x,z:z+.3,r:1.1,on:()=>!S.room,label:()=>{const n=Object.values(handBox().seeds).reduce((a,b)=>a+b,0);return n?`Seed box (${n})`:'Seed box';},ok:()=>true,act(){handBoxOpen();}});}catch(e){console.warn('seed box',e);}return r;};}
// ---- the hands at work in the morning
function handPath(list,seed){const L=list.slice();if(!L.length)return null;return L;}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld.apply(this,arguments);try{if(S.room)return;const E=EMP(),W=E.work;if(!W||W.day!==S.day||S.hour<6||S.hour>=12.2)return;
  const hands=(E.hands||[]);let i=0;const placed=[[P.x,P.z]];for(const id of hands){const L=HAND_LOOK[id];if(!L)continue;const pts=W[L.job];if(!pts||!pts.length)continue;
    for(let tw=0;tw<(L.twins?2:1);tw++){const n=pts.length,T=(S.hour-6)/6.2*n+Math.floor((i*n)/4)+tw*Math.max(1,Math.floor(n/2))+i*.37+tw*.29;   // each starts somewhere else along the rows, at their own pace
      const k=Math.floor(T)%n,f=T-Math.floor(T),a=pts[k],b=pts[(k+1)%n];const walk=f>.78;const u=walk?(f-.78)/.22:0;
      let x=a[0]+(b[0]-a[0])*u,z=a[1]+(b[1]-a[1])*u+.25;for(let rep=0;rep<3;rep++)for(const q of placed)if(Math.abs(q[0]-x)<1.1&&Math.abs(q[1]-z)<2.2){x+=1.25;}   // never two in one column   // a tile between workers
      placed.push([x,z]);if(!onScreen(x,z,80))continue;const dir=walk?dirOf(b[0]-a[0],b[1]-a[1]):'E';
      const base=walk||!SPR[L.spr+L.tool]?L.spr:L.spr+L.tool,clip=walk||base===L.spr&&L.tool?'walk':L.clip,key=handSheet(id,base);if(!key)continue;
      const ph=(f/.78)%1,fr=clip==='walk'?frameOf(key,'walk',performance.now()/1000+i):frameOf(key,clip,ph,1),job=L.job,working=!walk;
      D.push({z:z+.01,mind:1,draw(){const X=Math.round(sx(x)),Y=Math.round(sz(z));if(typeof shadow==='function')shadow(X,Y,7);drawSpr(key,X,Y,clip,dir,fr);
        if(!working)return;const tt=performance.now()/1000;
        if(job==='water'){ctx2.fillStyle='rgba(40,70,110,.55)';ctx2.fillRect(X+14,Y-1,12,4);ctx2.fillRect(X+16,Y-2,8,1);   // a dark wet patch where it lands
          for(let d=0;d<10;d++){const q=d/9,xx=X+11+Math.round(q*8),yy=Y-15+Math.round(q*q*13);ctx2.fillStyle=d%3?'#cfeaff':'#f4fbff';ctx2.fillRect(xx,yy,2,2);}   // a thick arc off the can's rose
          for(const o of [0,.33,.66]){const q2=(tt*2.4+o)%1;ctx2.fillStyle='#e8f6ff';ctx2.fillRect(X+17+Math.round(o*4),Y-6+Math.round(q2*5),1,2);}}
        else if(job==='clear'){const up=ph<.5;if(!up&&ph<.85){const q=(ph-.5)/.35;ctx2.fillStyle='#5a3e26';for(const [cx,cy] of [[10,-4],[15,-7],[19,-3]])ctx2.fillRect(X+cx+Math.round(q*4),Y+cy-Math.round(q*5),3,3);
            ctx2.fillStyle='#8a6a48';ctx2.fillRect(X+16+Math.round(q*5),Y-10-Math.round(q*4),2,2);}ctx2.fillStyle='rgba(60,40,20,.45)';ctx2.fillRect(X+10,Y-1,10,3);}   // clods flung clear of the pick
        else if(job==='plant'){for(let d=0;d<4;d++){const q=((tt*1.4+d*.25)%1);ctx2.fillStyle=d%2?'#f0e0a8':'#c8a860';ctx2.fillRect(X+9+d*2,Y-13+Math.round(q*12),2,2);}ctx2.fillStyle='rgba(60,40,20,.4)';ctx2.fillRect(X+8,Y-1,10,2);}   // seed scattering down
        else if(job==='pick'){ctx2.fillStyle='#120c08';ctx2.fillRect(X+5,Y-23,8,8);ctx2.fillStyle='#d8a040';ctx2.fillRect(X+6,Y-22,6,6);ctx2.fillStyle='#f0c060';ctx2.fillRect(X+6,Y-22,2,2);ctx2.fillStyle='#4a8a3a';ctx2.fillRect(X+8,Y-25,3,3);   // a crop held up
          ctx2.fillStyle='#120c08';ctx2.fillRect(X-14,Y-9,10,9);ctx2.fillStyle='#8a6440';ctx2.fillRect(X-13,Y-8,8,7);ctx2.fillStyle='#d8a040';ctx2.fillRect(X-12,Y-9,6,2);}}});}   // and a basket at their feet
    i++;}}catch(e){}};}
/* ================= #301 The business tutorial, step by step (owner: "the tutorial didn't explain how to invest in businesses and
   open stores and restaurants"). After the first look at the ledger, Caitlyn takes you through it one thing at a time, each
   step pinned on the map and finished by doing it: buy a share; grow a shop with its keeper; open your own place (a stand, a
   kitchen-restaurant or a taproom) and name it; hire someone and stock it; and, once you have hands, fill their seed box. ====== */
{const own=()=>S.biz&&S.biz.own,anyStake=()=>{try{return Object.values(bgS().stakes||{}).some(o=>(o[bgMe()]||0)>0);}catch(e){return false;}},
  anyGrow=()=>{try{return Object.values(bgS().grow||{}).some(g=>Object.values(g).some(v=>v>0));}catch(e){return false;}},topStake=()=>{try{return Math.max(0,...Object.keys(BIZ_SHOPS).map(k=>bgStake(k)));}catch(e){return 0;}};
  LS_SIDE.push(
  {id:'biz_shares',title:'Side lesson: shares',when:()=>!guideBusy()&&!!guideS().invest&&!anyStake(),
    say:'Shares first. At the town hall, Agnes’s counter, open The ledger. On the Shares page, pick any shop and buy 5%. Every day the town shops there; you get your share of the till, and a cut whenever another player buys there too.',
    begin:b=>{guidePin('bizs',guideHall(),'The ledger: buy a share','star');},ok:()=>anyStake(),coins:20,done:'That’s your first share. Watch the ledger: it shows yesterday’s customers and what you were paid.'},
  {id:'biz_grow',title:'Side lesson: growing a shop',when:()=>!guideBusy()&&topStake()>=10&&!anyGrow(),
    say:'With 10% of a shop you can help it grow. In the ledger, under the shop: stock a new line (from 10%), hire them a hand (20%), take on the building next door (30%), and at 50% you’re partners and can open a branch in Wickham. Each one brings in more custom, and you’ll see it out front.',
    begin:b=>{guidePin('bizg',guideHall(),'The ledger: grow a shop','star');},ok:()=>anyGrow(),coins:20,done:'Go and look at the shop: the new goods are out front, and on its list.'},
  {id:'biz_own',title:'Side lesson: your own shop',when:()=>!guideBusy()&&!!guideS().invest&&!own()&&(S.coins>=1500||S.day>=14),
    say:'Want a place of your own? In the ledger, open the second page. Type a name (spaces and all), then pick what it is: a produce stand, a kitchen (a little restaurant, for meals you cook) or a taproom (for drinks). It costs 1500 for the lease, and your sign goes up on the square.',
    begin:b=>{guidePin('bizo',guideHall(),'The ledger: open your shop','star');},ok:()=>!!own(),coins:30,done:'Your name’s over the door. Now it needs someone behind the counter and something on the shelves.'},
  {id:'biz_run',title:'Side lesson: running it',when:()=>!guideBusy()&&!!own()&&!((own().staff||[]).length&&(own().stock||[]).length),
    say:'Nothing sells without staff and stock. On your shop’s page, hire someone from town (they’re paid each evening from the till), then press Stock to put your produce, meals or drinks on the shelves. Every evening the town buys what it can; take the till whenever you like.',
    begin:b=>{try{guidePin('bizr',{x:BIZ_SIGN.at.x,z:BIZ_SIGN.at.z+.6},'Your shop’s ledger','star');}catch(e){}},ok:()=>!!(own()&&(own().staff||[]).length&&(own().stock||[]).length),coins:30,done:'Open for business. Keep it stocked, keep your people paid, and the till fills up.'},
  {id:'hands_box',title:'Side lesson: the hands’ seed box',when:()=>!guideBusy()&&(EMP().hands||[]).length>0&&!Object.values(handBox().seeds).some(n=>n>0),
    say:'Your hands work at dawn. Dell waters and the Kettle twins pick on their own, but Old Merritt can only sow what’s in the seed box at the corner of Grandpa’s field. Put seeds in it, and keep a few coins in your purse for their wages.',
    begin:b=>{guidePin('handbox',{x:HAND_BOX_AT.x,z:HAND_BOX_AT.z+.5},'The hands’ seed box','star');},ok:()=>Object.values(handBox().seeds).some(n=>n>0),coins:20,done:'Merritt will sow it tomorrow at first light. You’ll see them all out on the land in the mornings.'});}
// a pin is taken down when its step is done
setInterval(()=>{try{const L=S.ls&&S.ls.side;if(!L)return;for(const [id,pin] of [['biz_shares','bizs'],['biz_grow','bizg'],['biz_own','bizo'],['biz_run','bizr'],['hands_box','handbox']])if(L[id]&&L[id].st==='done')guideUnpin(pin);}catch(e){}},2000);
