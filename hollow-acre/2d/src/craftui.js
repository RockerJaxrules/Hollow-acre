/* ================= benches, the stove and hand crafting get their own screen: a grid of recipe cards, and beside it the one you've picked,
   with what it needs (green when you have it, red when you don't). Making something is a short game you play with your hands:
     the stove     — tap as the needle crosses the gold: add, stir, season
     the furnace   — hold to pump the bellows and keep the heat in the band until the bar is poured
     the benches   — tap on each mark as the saw or hammer passes it
   Doing it well earns a little extra (a second serving, a spare bar, a scrap saved). Doing it badly still makes the thing. ================= */
const CRAFT_VENDORS=new Set(['craft','cook','b_farm','b_furnace','b_weapon','b_armor','b_furn']);
const CRAFT_ART={b_farm:'bench_farm',b_furn:'bench_furn',b_weapon:'bench_weapon',b_armor:'bench_armor',b_furnace:'furnace',cook:'in_stove',craft:'in_bench'};
const CRAFT_GAME=v=>v==='cook'?'cook':v==='b_furnace'?'smelt':'craft';
// what each recipe looks like on its card (dedicated icons where they exist, the nearest thing where they don't)
const CRAFT_ICON={cb:'cbar',ib:'ibar',ch:'coal',spr:'can',fert:'bonemeal',ts:'seed_turnip',ps:'seed_pumpkin',charm:'hay',scare:'hay',flask:'lamp',sprinkler:'can',candle:'in_candles',
  club:'wood',sickle:'copper',machete:'iron',jacket:'fiber',coat:'cbar',mail:'ibar'};
function craftIcon(v,r){if(v==='b_furn'&&typeof FURN!=='undefined'&&FURN[r.k])return FURN[r.k][1];if(ITEMS[r.k]&&ITEMS[r.k].icon)return ITEMS[r.k].icon;return CRAFT_ICON[r.k]||r.k;}
// what a recipe needs, with how many you have
function craftNeeds(v,r){const out=[];if(r.need)for(const [k,n] of Object.entries(r.need))out.push({k,n,have:inv(k),name:(ITEMS[k]||{name:k}).name,icon:(ITEMS[k]&&ITEMS[k].icon)||k});
  if(v==='cook'&&typeof RECIPES!=='undefined'){const rc=RECIPES.find(x=>x[0]===r.k);if(rc)for(const [k,n] of Object.entries(rc[1]))out.push({k,n,have:basketCount(k),name:(PRODUCE_NAMES&&PRODUCE_NAMES[k])||k,icon:k});}
  if(r.k==='ts')out.push({k:'turnip',n:1,have:basketCount('turnip'),name:'Turnip',icon:'turnip'});if(r.k==='ps')out.push({k:'pumpkin',n:1,have:basketCount('pumpkin'),name:'Pumpkin',icon:'pumpkin'});
  return out;}
const craftOK=(v,r)=>r.can&&S.coins>=(r.price||0)&&craftNeeds(v,r).every(q=>q.have>=q.n);
{const css=document.createElement('style');css.textContent=`
#craft{width:min(720px,94vw)!important;padding:16px 18px!important}
#craft .chead{display:flex;align-items:center;gap:12px;margin-bottom:8px}#craft .chead canvas{width:72px;height:72px;image-rendering:pixelated;flex:none;background:radial-gradient(#4a3020,#2a1a0e 70%);box-shadow:0 0 0 2px var(--px-dark),inset 0 0 0 2px var(--px-wood2)}
#craft .chead h2{margin:0!important}#craft .chead .sub{font-size:13px;color:var(--dim);line-height:1.3}
#craft .cbody{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:12px}
@media (max-width:620px){#craft .cbody{grid-template-columns:1fr}}
#craft .cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(74px,1fr));gap:6px;align-content:start;max-height:min(46vh,360px);overflow:auto;padding:4px}
#craft .card{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 4px 5px;background:var(--px-panel2);border:0;color:var(--bone);font:inherit;font-size:11px;line-height:1.15;cursor:pointer;
  box-shadow:inset 0 0 0 2px var(--px-dark),inset 0 0 0 4px var(--px-wood);text-align:center;min-height:74px}
#craft .card img{width:36px;height:36px;image-rendering:pixelated}#craft .card.no{opacity:.5}#craft .card.no img{filter:grayscale(.7)}
#craft .card.sel{box-shadow:inset 0 0 0 2px var(--px-dark),inset 0 0 0 4px var(--ember),0 0 0 2px var(--ember)}#craft .card .ok{position:absolute;right:4px;top:3px;color:#9fd27a;font-size:12px}
#craft .cside{background:rgba(0,0,0,.22);box-shadow:inset 0 0 0 2px var(--px-dark);padding:10px;display:flex;flex-direction:column;gap:6px;min-height:200px}
#craft .cside .big{display:flex;gap:10px;align-items:center}#craft .cside .big img{width:56px;height:56px;image-rendering:pixelated;background:rgba(0,0,0,.25);box-shadow:inset 0 0 0 2px var(--px-wood)}
#craft .cside h3{margin:0;font-family:var(--font-display);font-weight:400;font-size:18px;color:var(--ember)}#craft .cside .d{font-size:12px;color:var(--bone);line-height:1.35}
#craft .need{display:flex;flex-direction:column;gap:3px}#craft .need div{display:flex;align-items:center;gap:6px;font-size:13px}#craft .need img{width:22px;height:22px;image-rendering:pixelated}
#craft .need .c{margin-left:auto;font-variant-numeric:tabular-nums}#craft .need .y{color:#9fd27a}#craft .need .n{color:#ff8a6a}
#craft .make{margin-top:auto;font-size:18px!important;padding:10px!important}
#craft .acts{display:flex;justify-content:flex-end;margin-top:10px}
/* the game */
#cgame{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(8,5,3,.6)}
#cgame .box{background:linear-gradient(var(--px-panel2),var(--px-panel));box-shadow:0 0 0 3px var(--px-dark),inset 0 0 0 3px var(--px-light),inset 0 0 0 6px var(--px-wood);padding:14px;display:flex;flex-direction:column;align-items:center;gap:8px;zoom:var(--su,1)}
#cgame canvas{width:min(84vw,420px);aspect-ratio:2/1;image-rendering:pixelated;touch-action:none;cursor:pointer;background:#1a110a;box-shadow:0 0 0 2px var(--px-dark)}
#cgame .t{font-family:var(--font-display);color:var(--ember);font-size:20px}#cgame .h{font-size:13px;color:var(--bone);text-align:center;max-width:400px}
#cgame .row{display:flex;gap:8px}`;document.head.appendChild(css);
  const el=document.createElement('div');el.className='sheet';el.id='craft';el.hidden=true;
  el.innerHTML='<div class="chead"><canvas width="72" height="72"></canvas><div><h2 id="crName"></h2><div class="sub" id="crSub"></div></div></div><div class="cbody"><div class="cgrid" id="crGrid"></div><div class="cside" id="crSide"></div></div><div class="acts"><button class="close" id="crClose">Close</button></div>';
  document.body.appendChild(el);$('crClose').addEventListener('click',()=>{el.hidden=true;S.paused=false;});
  const g=document.createElement('div');g.id='cgame';g.innerHTML='<div class="box"><div class="t" id="cgT"></div><canvas id="cgC" width="240" height="120"></canvas><div class="h" id="cgH"></div><div class="row"><button class="close" id="cgSkip">Skip</button></div></div>';document.body.appendChild(g);}
let CR={v:null,sel:0};
function openCraft(v){CR.v=v;CR.sel=0;S.paused=true;const V=vendors[v];$('crName').textContent=V.name;$('crSub').textContent=V.sub||'';
  const cv=$('craft').querySelector('.chead canvas'),g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,72,72);const sp=CRAFT_ART[v],m=SPR[sp],im=m&&IMG[m.src];
  if(im){const s=Math.min(64/m.fw,64/m.fh);const w=m.fw*s,h=m.fh*s;g.drawImage(im,0,0,m.fw,m.fh,(72-w)/2,(72-h)/2+2,w,h);}
  // start on the first thing you can make
  const rows=V.rows();const i=rows.findIndex(r=>craftOK(v,r));CR.sel=i>=0?i:0;$('craft').hidden=false;renderCraft();}
function renderCraft(){const v=CR.v,rows=vendors[v].rows();const grid=$('crGrid');grid.innerHTML='';
  rows.forEach((r,i)=>{const b=document.createElement('button');const ok=craftOK(v,r);b.className='card'+(ok?'':' no')+(i===CR.sel?' sel':'');
    b.innerHTML=`<img src="${iconOf(craftIcon(v,r))}" alt=""><span>${r.name}</span>${ok?'<span class="ok">●</span>':''}`;b.addEventListener('click',()=>{CR.sel=i;renderCraft();});grid.appendChild(b);});
  const r=rows[CR.sel];const side=$('crSide');if(!r){side.innerHTML='';return;}const ok=craftOK(v,r);const needs=craftNeeds(v,r);
  const desc=String(r.desc||'').replace(/\s*Needs .*$/,'');
  side.innerHTML=`<div class="big"><img src="${iconOf(craftIcon(v,r))}" alt=""><h3>${r.name}</h3></div><div class="d">${desc}</div>
    <div class="need">${needs.map(q=>`<div><img src="${iconOf(q.icon)}" alt=""><span>${q.name}</span><span class="c ${q.have>=q.n?'y':'n'}">${q.have}/${q.n}</span></div>`).join('')}${r.price?`<div><span>Coins</span><span class="c ${S.coins>=r.price?'y':'n'}">${S.coins}/${r.price}</span></div>`:''}</div>
    <button class="btn make${ok?' hot':''}" id="crMake"${ok?'':' disabled'}>${r.can?(r.btn||'Make'):'Done'}</button>`;
  $('crMake').addEventListener('click',()=>{if(!craftOK(v,r))return;craftGame(CRAFT_GAME(v),r,q=>finishCraft(v,r,q));});}
function finishCraft(v,r,q){const before={};const needs=craftNeeds(v,r);
  // the vendor's own buy() takes basket ingredients itself; inventory needs are taken here, like the old shop did
  if(r.need)for(const [k,n] of Object.entries(r.need))takeInv(k,n);S.coins-=(r.price||0);r.buy();updateHud&&updateHud();
  // a good job earns a little extra
  let bonus='';if(q>=.67){const lucky=rand()<(q>=.95?.75:.4);
    if(lucky&&v==='cook'&&ITEMS[r.k]){addInv(r.k);bonus='Enough for two.';}
    else if(lucky&&v==='b_furnace'&&(r.k==='cb'||r.k==='ib'||r.k==='ch')){addInv(r.k==='cb'?'copper_bar':r.k==='ib'?'iron_bar':'coal');bonus='A spare one, from the drips.';}
    else if(lucky&&r.need){const ks=Object.keys(r.need);const k=ks[(rand()*ks.length)|0];addInv(k);bonus=`Not a scrap wasted: 1 ${((ITEMS[k]||{name:k}).name).toLowerCase()} back.`;}}
  const grade=q>=.95?'Perfect.':q>=.67?'Good work.':q>=.34?'It’ll do.':'Rough, but it holds.';toast(`${grade} ${r.name}${bonus?'. '+bonus:''}`,2.4);SFX.coin&&SFX.coin();renderCraft();}
// send the old bench/stove/craft lists here
{const _os=openShop;openShop=function(v){if(CRAFT_VENDORS.has(v)&&vendors[v]){openCraft(v);return;}return _os.apply(this,arguments);};}
// ---------------------------------------------------------------- the games
const CG={on:false};
const PXFONT={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',
J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',
T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',' ':'000000000000000','.':'000000000000010','0':'111101101101111','9':'111101111001111','1':'010110010010111','2':'111001111100111','3':'111001011001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111'};
const hashI=x=>((x*2654435761)>>>0)%97;
function craftGame(type,r,done){const box=$('cgame'),cv=$('cgC'),g=cv.getContext('2d');g.imageSmoothingEnabled=false;const W=240,H=120;
  const T={cook:'At the stove',smelt:'At the furnace',craft:'At the bench'}[type];$('cgT').textContent=`${T}: ${r.name}`;
  $('cgH').innerHTML={cook:'Tap when the needle is in the gold: add, stir, season.',smelt:'Hold to pump the bellows. Keep the heat inside the band until the mould is full.',craft:'Tap as the tool passes each mark.'}[type]+(matchMedia('(pointer:fine)').matches?' (Space works too.)':'');
  box.style.display='flex';CG.on=true;let t0=performance.now(),last=t0,hold=false,result=null;const st={hits:[],step:0,heat:.3,fill:0,inband:0,total:0,needle:0,dir:1,flash:0,parts:[]};
  const icon=new Image();icon.src=iconOf(craftIcon(CR.v,r));
  // the marks for the bench game: three or four, spaced along the board
  const marks=[];if(type==='craft'){const n=r.need&&Object.keys(r.need).length>2?4:3;for(let i=0;i<n;i++)marks.push(.2+i*(.65/(n-1))+(rand()-.5)*.06);}
  const end=q=>{if(result!==null)return;result=q;setTimeout(()=>{box.style.display='none';CG.on=false;removeEventListener('keydown',kd,true);removeEventListener('keyup',ku,true);done(q);},type==='smelt'?500:650);};
  const press=()=>{if(result!==null)return;A.init&&A.init();
    if(type==='cook'){const zc=.5+Math.sin(st.step*2.1)*.18,d=Math.abs(st.needle-zc);const sc=d<.05?1:d<.11?.6:d<.18?.25:0;st.hits.push(sc);st.flash=sc;SFX[sc>.5?'plant':'thud']&&SFX[sc>.5?'plant':'thud'](0,.25);
      for(let i=0;i<10;i++)st.parts.push({x:120,y:70,vx:(Math.random()-.5)*60,vy:-40-Math.random()*40,t:0,c:sc>.5?'#ffe08a':'#c8a070'});st.step++;if(st.step>=3)end(st.hits.reduce((a,b)=>a+b,0)/3);}
    if(type==='craft'){const pos=st.needle;let best=-1,bd=1;marks.forEach((m,i)=>{if(st.hits[i]!==undefined)return;const d=Math.abs(pos-m);if(d<bd){bd=d;best=i;}});
      if(best>=0&&bd<.12){const sc=bd<.025?1:bd<.06?.6:.3;st.hits[best]=sc;st.flash=sc;SFX.thud&&SFX.thud(0,.35);for(let i=0;i<12;i++)st.parts.push({x:20+marks[best]*200,y:66,vx:(Math.random()-.5)*80,vy:-30-Math.random()*50,t:0,c:CR.v==='b_weapon'?'#ffd27a':'#e8c890'});}
      else SFX.deny&&SFX.deny();}};
  const kd=e=>{if(e.code==='Escape'){e.preventDefault();e.stopPropagation();end(.5);return;}if(e.code==='Space'||e.code==='Enter'||e.code==='KeyC'){e.preventDefault();e.stopPropagation();if(!e.repeat){if(type==='smelt')hold=true;else press();}}};
  const ku=e=>{if(e.code==='Space'||e.code==='Enter'||e.code==='KeyC'){hold=false;}};addEventListener('keydown',kd,true);addEventListener('keyup',ku,true);
  cv.onpointerdown=e=>{e.preventDefault();cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);if(type==='smelt')hold=true;else press();};cv.onpointerup=cv.onpointercancel=()=>{hold=false;};
  $('cgSkip').onclick=()=>end(.5);
  const px=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);};
  let dt=0;
  const spr=(n,x,y)=>{const m=SPR[n],im=m&&IMG[m.src];if(im)g.drawImage(im,0,0,m.fw,m.fh,Math.round(x),Math.round(y),m.fw,m.fh);};
  const text=(t,x,y,c)=>{t=String(t).toUpperCase();let X=Math.round(x-t.length*2);for(const ch of t){const f=PXFONT[ch]||PXFONT[' '];for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(f[j*3+i]==='1'){px(X+i+1,y+j+1,1,1,'#1a0e06');px(X+i,y+j,1,1,c);}X+=4;}};
  // a back wall of rough boards, darker toward the edges
  const wall=()=>{for(let x=0;x<W;x+=12){const v=hashI(x)%3;px(x,0,12,H,['#2c1c10','#33200f','#281a0e'][v]);px(x,0,1,H,'#140a04');for(let y=6+(x%17);y<H;y+=23)px(x+3,y,5,1,'#22150b');}
    const gr=g.createRadialGradient(W/2,H/2,20,W/2,H/2,150);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=gr;g.fillRect(0,0,W,H);};
  // the stove game's gauge: a brass bar with rivets, the gold window, the pointer
  const gauge=(x,y,w,zc,val)=>{px(x-3,y-3,w+6,14,'#4a3410');px(x-2,y-2,w+4,12,'#a8822c');px(x-2,y-2,w+4,1,'#ecca6e');px(x-2,y+9,w+4,1,'#4a3410');for(const rx of [x-1,x+w])px(rx,y+3,1,1,'#f8e4a0');
    px(x,y,w,8,'#1a1008');const z=(a,c)=>px(x+(zc-a)*w,y+1,(a*2)*w,6,c);z(.18,'#5a3a18');z(.11,'#a87420');z(.05,'#ffd27a');px(x+(zc-.05)*w,y+1,.1*w,1,'#fff4c6');
    for(let i=0;i<=10;i++)px(x+i*w/10,y+7,1,1,'#6a4a2a');const nx=x+val*w;px(nx-1,y-6,3,4,'#f4ecd8');px(nx,y-2,1,12,'#f4ecd8');px(nx-2,y-7,5,1,'#f4ecd8');};
  function drawCook(t){wall();const SOUP={soup:['#c8a040','#e8c868'],egg_fried:['#e8d890','#fff4c0'],pie:['#c87a30','#e8a050'],chowder:['#e8d8a0','#fff0c8'],hash:['#8a5a2a','#b07a40'],glowstew:['#2a8a7a','#7ae8d0']}[r.k]||['#b07a40','#d8a060'];
    // the stove top: cast iron with a rail and rivets, fire through the grate
    px(0,92,W,28,'#25272f');px(0,92,W,2,'#6f7480');px(0,94,W,1,'#383b46');for(let x=8;x<W;x+=24){px(x,97,2,2,'#959aa5');px(x,115,2,2,'#50545f');}
    for(let i=0;i<14;i++){const fx=64+i*8,f=Math.sin(t*11+i*1.7);px(fx,104+f,5,8-f,i%2?'#e8742a':'#f0a040');px(fx+1,102+f*1.5,3,5,'#ffd27a');px(fx+2,101+f*2,1,2,'#fff4c6');}
    for(let x=60;x<180;x+=8)px(x,100,2,14,'#15161c');
    // the pot: a shaded iron body, a lit rim, two handles, a bubbling surface
    const cx=120,top=60,pw=78;for(let y=0;y<32;y++){const w=pw/2-Math.max(0,y-24)*1.2;for(let x=-w;x<w;x++){const l=-x/w*.6-.1;px(cx+x,top+y,1,1,l>.4?'#6f7480':l>.1?'#50545f':l>-.3?'#383b46':'#25272f');}}
    px(cx-pw/2-3,top-3,pw+6,5,'#50545f');px(cx-pw/2-3,top-3,pw+6,1,'#959aa5');px(cx-pw/2-3,top+1,pw+6,1,'#25272f');
    for(const s2 of [-1,1]){px(cx+s2*(pw/2+3)-(s2>0?0:6),top+4,6,3,'#383b46');px(cx+s2*(pw/2+3)-(s2>0?0:6),top+4,6,1,'#6f7480');}
    px(cx-pw/2,top-1,pw,4,st.step?SOUP[0]:'#2a1d14');if(st.step){for(let i=0;i<6;i++){const bx=cx-pw/2+6+((i*29+Math.floor(t*3)*7)%(pw-12)),ph=(t*3+i*.37)%1;if(ph<.7)px(bx,top-1-(ph>.5?1:0),ph>.5?3:2,ph>.5?2:1,SOUP[1]);}
      for(let i=0;i<st.step*3;i++)px(cx-pw/2+5+((i*23)%(pw-10)),top+((i*7)%3),3,2,['#e8c060','#c84a2a','#7aa64c','#f4ecd8'][i%4]);}
    // steam
    for(let i=0;i<6;i++){const ph=((t*.6+i/6)%1),y=top-6-ph*44,x=cx-24+i*9+Math.sin(t*2+i)*4;g.globalAlpha=.35*(1-ph);px(x,y,5,4,'#efe8dc');px(x+1,y-1,3,1,'#efe8dc');g.globalAlpha=1;}
    // the spoon, stirring hard when you hit
    const sa=t*(st.flash>0?14:2);px(cx+Math.cos(sa)*18,top-18,3,20,'#b67f42');px(cx+Math.cos(sa)*18,top-18,1,20,'#d6a562');
    const zc=.5+Math.sin(st.step*2.1)*.18;if(result===null){st.needle+=st.dir*dt*(.75+st.step*.25);if(st.needle>1){st.needle=1;st.dir=-1;}if(st.needle<0){st.needle=0;st.dir=1;}}
    gauge(24,16,176,zc,st.needle);['add','stir','season'].forEach((w,i)=>text(w,52+i*66,34,i<st.step?(st.hits[i]>.9?'#ffd27a':st.hits[i]>.4?'#c8a070':'#8a5a3a'):i===st.step?'#f4ecd8':'#6a4a2a'));}
  function drawSmelt(t){wall();const glow=Math.min(1,st.heat);
    // the real furnace, a hot glow on its mouth and on the floor
    px(0,112,W,8,'#2a1d14');px(0,112,W,1,'#3a2a1d');spr('furnace',4,49);
    const gx=28,gy=100;const gr=g.createRadialGradient(gx,gy,2,gx,gy,22+glow*16);gr.addColorStop(0,`rgba(255,${(170+glow*70)|0},80,${.25+glow*.55})`);gr.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=gr;g.fillRect(gx-40,gy-40,80,80);
    // the bellows: two boards and pleated leather, squashing as you pump, the nozzle into the furnace's side
    const sq=hold?.5+.12*Math.sin(t*28):1;const bx=60,by=100,bh=Math.round(16*sq);
    px(bx,by-bh-3,40,3,'#93602f');px(bx,by-bh-3,40,1,'#d6a562');for(let j=0;j<bh;j++){const w2=38-Math.abs(j-bh/2)*1.4;px(bx+1,by-bh+j,w2,1,j%3===0?'#472014':j%3===1?'#91482b':'#6c321f');}
    px(bx,by,40,3,'#6c401f');px(bx,by,40,1,'#b67f42');px(bx-12,by-bh/2-2,13,3,'#50545f');px(bx-12,by-bh/2-2,13,1,'#959aa5');px(bx+30,by-bh-6,12,3,'#93602f');px(bx+40,by-bh-8,4,7,'#6c401f');px(bx+30,by+3,12,3,'#6c401f');px(bx+40,by+3,4,5,'#472913');
    if(result===null){st.heat+=(hold?.55:-.32)*dt;st.heat=Math.max(0,Math.min(1.1,st.heat));st.total+=dt;const inb=st.heat>.55&&st.heat<.82;if(inb){st.fill+=dt/3.2;st.inband+=dt;}if(st.fill>=1)end(Math.min(1,st.inband/Math.max(3.2,st.total)*1.15));if(st.total>9)end(st.fill*.8);}
    // the thermometer: brass case, glass tube, a bulb; the good band marked in green
    const tx=124,ty=14;px(tx-4,ty-3,16,96,'#7a5a1a');px(tx-3,ty-2,14,94,'#cfa646');px(tx-3,ty-2,1,94,'#f8e4a0');px(tx+1,ty,6,82,'#1a1210');
    px(tx+1,ty+82*(1-.82),6,82*(.82-.55),'#2c4a1c');const lv=Math.min(1,st.heat);const lc=st.heat>.82?'#ff5a2a':st.heat>.55?'#ffd27a':'#d8603a';px(tx+2,ty+82*(1-lv),4,82*lv,lc);px(tx+2,ty+82*(1-lv),1,82*lv,'#fff0c0');
    for(let i=0;i<=8;i++)px(tx+8,ty+i*10,2,1,'#4a3410');for(let y=-4;y<=4;y++)for(let x=-5;x<=5;x++)if(x*x+y*y<=22)px(tx+4+x,ty+86+y,1,1,x<-1&&y<-1?'#ffc090':lc);
    // the crucible above the mould: it tips and pours while the heat is right
    const pour=st.heat>.55&&st.heat<.82&&result===null;g.save();g.translate(186,36);g.rotate(pour?.5:.1);px(-10,-8,20,16,'#383b46');px(-10,-8,20,2,'#959aa5');px(-8,-6,16,4,`rgb(255,${(150+glow*80)|0},60)`);px(-10,6,20,2,'#25272f');g.restore();
    if(pour)for(let i=0;i<8;i++)px(194+Math.sin(t*20+i)*.6,46+i*4,2,4,i%2?'#ffd27a':'#ff9a40');
    // the mould: an iron block, the bar shape inside filling with bright metal
    px(170,78,48,26,'#25272f');px(170,78,48,2,'#6f7480');px(172,104,46,2,'#15161c');px(176,84,36,14,'#0e0e12');const fh=14*st.fill;px(176,98-fh,36,fh,'#ffb050');if(st.fill>0){px(176,98-fh,36,1,'#fff0b0');px(178,98-fh+2,8,1,'#ffe090');}
    text(hold?'pumping':'hold to pump',80,108,hold?'#ffd27a':'#c8a878');}
  function drawBench(t){wall();const hammer=CR.v==='b_weapon'||CR.v==='b_armor';
    // the bench top in front, the board laid across it on two clamps
    for(let y=84;y<H;y++)px(0,y,W,1,y===84?'#d6a562':y<88?'#b67f42':y%5===0?'#6c401f':'#93602f');
    for(const cx2 of [30,206]){px(cx2-4,66,8,24,'#50545f');px(cx2-4,66,8,2,'#959aa5');px(cx2-6,64,12,3,'#383b46');px(cx2-1,60,2,5,'#b67f42');}
    const by=62,bh=14;for(let y=0;y<bh;y++)for(let x=12;x<228;x++){const gk=(Math.sin(x*.08+y*1.3)+Math.sin(x*.021+y*.7))*.5;px(x,by+y,1,1,y===0?'#e8c080':y===bh-1?'#6c401f':gk>.55?'#b67f42':gk<-.5?'#7d5030':'#a06c38');}
    px(12,by,1,bh,'#d6a562');px(227,by,1,bh,'#6c401f');for(let i=0;i<3;i++)px(40+i*61,by+5+i,4,3,'#6c401f');
    marks.forEach((m,i)=>{const x=20+m*200,h=st.hits[i];
      if(h===undefined){for(let y=by-2;y<by+bh+2;y++)if((y+i)%3)px(x+(y%5===0?1:0),y,1,1,'#f4ecd8');}
      else if(hammer){px(x-2,by+3,5,5,'#cfa646');px(x-2,by+3,5,1,'#f8e4a0');px(x-1,by+5,3,1,'#7a5a1a');}
      else{for(let j=0;j<6;j++)px(x-3+j*.5,by+j,6-j,1,'#3a2414');px(x-1,by+6,2,bh-6,'#2a1a10');}});
    if(result===null){st.needle+=dt*.42;if(st.needle>1.02)end(marks.reduce((a,m,i)=>a+(st.hits[i]||0),0)/marks.length);}
    const x=20+Math.min(1,st.needle)*200;
    if(hammer){// a hammer that rises and falls, steel head with a lit face, a wooden haft
      const lift=st.flash>0?0:Math.max(0,10-((t*40)%10));const hy=by-26+(st.flash>0?8:0)-lift*.3;
      for(let j=0;j<22;j++){px(x+4+j*.15,hy+8+j,3,1,j<2?'#d6a562':'#93602f');px(x+4+j*.15,hy+8+j,1,1,'#d6a562');}
      px(x-6,hy,22,10,'#50545f');px(x-6,hy,22,2,'#c4d2e0');px(x-6,hy+8,22,2,'#25272f');px(x-8,hy+2,2,6,'#93a6bc');px(x+16,hy+2,3,6,'#383b46');}
    else{// a panel saw cutting: a blade with a lit spine and teeth, a wooden grip with a hole; it bobs as it cuts
      const bob=Math.sin(t*26)*2;const sx=x-20,sy=by-16+bob;
      for(let i=0;i<34;i++){const hgt=Math.round(12-i*.18);for(let j=0;j<hgt;j++)px(sx+i,sy+j,1,1,j===0?'#eef4fa':j===hgt-1?'#677a92':i<4?'#c4d2e0':'#93a6bc');if(i%2===0)px(sx+i,sy+hgt,1,1,'#45546a');}
      px(sx+34,sy-2,11,14,'#b67f42');px(sx+34,sy-2,11,2,'#d6a562');px(sx+44,sy-2,1,14,'#6c401f');px(sx+37,sy+2,5,6,'#472913');px(sx+35,sy+12,9,1,'#6c401f');
      for(let i=0;i<3;i++)px(x-2+Math.sin(t*40+i)*3,by+bh+1+i,1,1,'#e8c890');}}
  function frame(now){dt=Math.min(.05,(now-last)/1000);last=now;const t=(now-t0)/1000;g.clearRect(0,0,W,H);
    if(type==='cook')drawCook(t);if(type==='smelt')drawSmelt(t);if(type==='craft')drawBench(t);
    // sparks and crumbs
    for(const p of st.parts){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt;if(p.t<.6)px(p.x,p.y,2,2,p.c);}st.parts=st.parts.filter(p=>p.t<.6);
    if(st.flash>0){g.globalAlpha=st.flash*.25;px(0,0,W,H,'#fff4c8');g.globalAlpha=1;st.flash=Math.max(0,st.flash-dt*3);}
    // the thing you're making, in the corner
    if(icon.complete)g.drawImage(icon,W-36,4,32,32);
    if(result!==null){g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,H/2-14,W,28);g.fillStyle=result>=.95?'#ffd27a':result>=.67?'#c8e09a':'#f4ecd8';g.font='16px monospace';g.textAlign='center';g.fillText(result>=.95?'Perfect!':result>=.67?'Good!':result>=.34?'Done':'Rough…',W/2,H/2+5);g.textAlign='left';}
    if(box.style.display!=='none')requestAnimationFrame(frame);}
  requestAnimationFrame(frame);}
// the menu's Craft button and keyboard: Escape closes the craft screen too
addEventListener('keydown',e=>{if(e.code==='Escape'&&!$('craft').hidden&&!CG.on){$('crClose').click();e.preventDefault();}});
