// ================================================================ t367: the Steam Deck (owner: "Steam Deck support")
//<<ART the Deck drawn for the Controls page, 128 x 58, in the same hand as the Xbox and DualSense pads (pad365.js): lit from the
// top left, outlines a darker version of the body, no logos. The wide dark body with its grips, the screen in the middle (a night
// on the farm under the glass), the d-pad and the left stick, the ABXY and the right stick, the two square trackpads under the
// sticks, View and Menu, the Steam and quick access buttons, the bumpers on the shoulders and the triggers behind them.
const P67PAL=Object.assign({},P65PAL.xbox,{z0:'#0b090e',z1:'#1d1a24',q0:'#0d1224',q1:'#141c36',q2:'#1f2a4c',mo:'#c4bea8',md:'#8a8674',hl:'#07080d',
  cb:'#171117',wa:'#f0a040',wb:'#9a5a24',gz:'#2c3350',tp0:'#120e17',tp1:'#1f1926',tp2:'#28212f',tp3:'#4a4050',n1:'#6a6472',n2:'#948e9a',n3:'#b4aeb6',ng:'#d6d0d4',b0:'#1b1126',b1:'#2a1e36',b2:'#372b42',b3:'#4e414a',b4:'#74625a'});
function p67DeckArt(){const W=128,H=58,G=p65G(W,H);
  const body=(x,y)=>p65SE(x,y,64,29,61,19,5)||p65Ell(x,y,18,42,15,14)||p65Ell(x,y,110,42,15,14);
  p65Wedges(G,body,[[6,21,-1],[106,121,1]],['t0','t1','t2','t3','t4']);
  p65Body(G,body,['b0','b1','b2','b3','b4'],{ol:'ol',od:'k',tone:(x,y,c)=>{if(x>66){if(x>96&&y>38&&c==='b1')return 'b0';return {b2:'b1',b3:'b2',b4:'b3'}[c];}if(c!=='b2')return null;if(p65Ell(x,y,30,15,27,4.5,-.04)||p65Ell(x,y,11,32,8,10,-.35))return 'b3';if(p65Ell(x,y,23,52,10,5,-.35)||(x>46&&y>45))return 'b1';return null;}});
  p65Bumper(G,body,6,28,{o:'k',hi:'e4',mid:'e3',lo:'e2'});p65Bumper(G,body,99,121,{o:'k',hi:'e3',mid:'e2',lo:'e1'});
  // the screen: a dark bezel with a lit rim at the top left, and the game's own night inside it
  for(let y=12;y<=46;y++)for(let x=37;x<=90;x++){const cor=(x===37||x===90)&&(y===12||y===46);if(cor)continue;
    G[y][x]=(y===12||y===46||x===37||x===90)?'k':(y===13||x===38)?'z1':'z0';}
  const X0=41,Y0=15,SW=46,SH=29;const hill=u=>Math.round(20+1.6*Math.sin(u*.21+.4)+1.1*Math.sin(u*.53+2.2));
  for(let v=0;v<SH;v++)for(let u=0;u<SW;u++){const wob=[0,0,1,1,0,-1,-1,0][u%8];let c=v+wob<9?'q0':v+wob<16?'q1':'q2';if(v>=hill(u))c='hl';G[Y0+v][X0+u]=c;}
  // a pine line on the left, the moon at the right, the cabin with its window lit
  for(const [pu,ph] of [[3,9],[7,12],[11,8],[14,6]])for(let k=0;k<ph;k++){const half=Math.floor(k/2.4);for(let du=-half;du<=half;du++){const u=pu+du,v=hill(pu)-ph+k;if(u>=0&&u<SW&&v>=0)G[Y0+v][X0+u]='hl';}}
  ['.mm.','mmmd','mmmd','.dd.'].forEach((r,j)=>{for(let i=0;i<4;i++)if(r[i]!=='.')G[Y0+4+j][X0+34+i]=r[i]==='m'?'mo':'md';});   /* (the moon: four across, round, its shaded edge low right) */
  {const cu=26,cv=hill(26);for(let k=0;k<4;k++)for(let du=-k-1;du<=k+1;du++)G[Y0+cv-7+k][X0+cu+du]='cb';for(let v=cv-3;v<cv+1;v++)for(let du=-4;du<=4;du++)G[Y0+v][X0+cu+du]='cb';
    G[Y0+cv-2][X0+cu+1]='wa';G[Y0+cv-2][X0+cu+2]='wa';G[Y0+cv-1][X0+cu+1]='wb';G[Y0+cv-1][X0+cu+2]='wb';G[Y0+cv-9][X0+cu+3]='cb';G[Y0+cv-8][X0+cu+3]='cb';}
  for(let i=0;i<5;i++){G[Y0+1+i][X0+6-i]='gz';if(i<3)G[Y0+1+i][X0+9-i]='gz';}
  // the d-pad: a cross, a value step over the body, lit along its top and left
  {const cx=12,cy=19;for(let i=-5;i<=5;i++)for(let j=-1;j<=1;j++){G[cy+i][cx+j]='p2';G[cy+j][cx+i]='p2';}
    for(let i=-5;i<=5;i++)if(i<-1||i>1){G[cy+i][cx-1]='p3';G[cy+i][cx+1]='p1';G[cy-1][cx+i]='p3';G[cy+1][cx+i]='p1';}
    for(const [x,y] of [[-1,-5],[0,-5],[1,-5],[-5,-1],[-5,0],[-5,1]])G[cy+y][cx+x]='p4';for(const [x,y] of [[-1,5],[0,5],[1,5],[5,-1],[5,0],[5,1]])G[cy+y][cx+x]='p0';
    for(let i=-6;i<=6;i++)for(let j=-2;j<=2;j++){for(const [x,y] of [[cx+j,cy+i],[cx+i,cy+j]]){if(Math.abs(i)<=5&&Math.abs(j)<=1)continue;if(Math.abs(i)===6&&Math.abs(j)===2)continue;
      if(Math.abs(i)===6||((Math.abs(j)===2)&&Math.abs(i)>=2))G[y][x]='k';}}}
  // the sticks: a dark well, a dished cap with its rim lit at the top left
  const stick=(cx,cy)=>{p65Disc(G,cx,cy,6,{f:'w0',h:'w1',s:'w0'});for(let y=-5;y<=5;y++)for(let x=-5;x<=5;x++){const d=Math.hypot(x,y),u=x+y;if(d>4.6)continue;
      G[cy+y][cx+x]=d>3.9?'k':d>2.7?(u<-1?'c4':u>1.5?'c0':'c2'):(u>1&&d>1.4?'c3':'c1');}};
  stick(28,22);stick(99,22);
  // the trackpads: square, sunk a little (the rim's shadow on the top and left inside, a lit lip at the bottom and right)
  const pad=(x0,y0)=>{for(let y=y0;y<y0+14;y++)for(let x=x0;x<x0+14;x++){const ex=x===x0||x===x0+13,ey=y===y0||y===y0+13;if(ex&&ey)continue;
      G[y][x]=ex||ey?'k':(y===y0+1||x===x0+1)?'tp0':(y===y0+12||x===x0+12)?'tp3':((x-x0)+(y-y0)<9?'tp2':'tp1');}};
  pad(21,31);pad(93,31);
  // A B X Y: four separate dark round buttons, each with a glint
  for(const [cx,cy] of [[115.5,14.5],[109.5,20.5],[121.5,20.5],[115.5,26.5]]){p65Disc(G,cx,cy,2.5,{f:'n2',h:'n3',s:'n1'});G[Math.floor(cy)][Math.floor(cx)-1]='ng';}
  // View (left) and Menu (right) up by the shoulders; Steam (left) and quick access (right) down under the trackpads
  const pill=(x0,y0,w,c)=>{for(let y=y0;y<y0+4;y++)for(let x=x0;x<x0+w;x++){const e=(x===x0||x===x0+w-1)&&(y===y0||y===y0+3);if(e)continue;
      G[y][x]=(y===y0||y===y0+3||x===x0||x===x0+w-1)?'k':(y===y0+1&&x<x0+w-2)?(c+'3'):(c+'2');}};
  pill(17,11,5,'v');pill(106,11,5,'v');pill(22,47,7,'v');pill(99,47,7,'v');for(const x of [100,102,104])G[49][x]='k';
  return G;}
//ART>>

// ---------------------------------------------------------------- is this a Steam Deck? Its browser or SteamOS says so, the desktop
// app reads it from SteamOS, or the Deck's own controls are the pad (Valve's vendor 28de). Steam Input's virtual pad (28de:11ff),
// which Steam puts in front of whatever pad you hold, shows the Deck's buttons too; Settings can still pin Xbox or PlayStation.
const DECK={on:false,why:'',lastId:null,svg:'',kb:false};
function deckUA(){try{const s=[navigator.userAgent,navigator.platform,navigator.userAgentData&&navigator.userAgentData.platform].join(' ');
  if(/steam ?deck|steamos|valve steam (gamepad|deck)/i.test(s))return 'ua';
  if(/linux/i.test(s)&&!/android/i.test(s)&&screen.width===1280&&screen.height===800&&navigator.maxTouchPoints>0)return 'screen';}catch(e){}return '';}
const deckPadId=id=>/(^|[^0-9a-f])28de([^0-9a-f]|$)|vendor:\s*28de|steam deck|steam controller/i.test(String(id||''));
function deckSet(why){if(DECK.on)return;DECK.on=true;DECK.why=why;document.body.classList.add('deck');const was=gpFam();if(!GP.id)GP.style='deck';P65.fam=gpFam();if(gpFam()!==was)gpPromptsChanged();}
{const w=deckUA();if(w)deckSet(w);}
try{if(window.hollowDesktop&&hollowDesktop.info)hollowDesktop.info().then(i=>{if(i&&i.deck)deckSet('app');}).catch(()=>{});}catch(e){}
// the family: 'deck' beside 'xbox' and 'ps' (pad365.js knew only those two, and put a saved 'deck' back to Auto as it loaded)
{const _fo=gpFamOf;gpFamOf=function(id){return deckPadId(id)?'deck':_fo(id);};}
try{const c=JSON.parse(localStorage.getItem('hollowPad')||'null');if(c&&c.style==='deck')GP.cfg.style='deck';}catch(e){}
gpFam=function(){const s=GP.cfg.style;if(s==='ps'||s==='xbox'||s==='deck')return s;return GP.style==='ps'?'ps':GP.style==='deck'?'deck':'xbox';};
{const _w=gpWho;gpWho=function(p){const r=_w.apply(this,arguments);if(p&&p.id!==DECK.lastId){DECK.lastId=p.id;if(!DECK.on&&deckPadId(p.id)&&/1205|steam deck/i.test(p.id))deckSet('pad');}return r;};}
p65SetStyle=function(v){if(v!=='xbox'&&v!=='ps'&&v!=='deck')v='auto';const was=gpFam();GP.cfg.style=v;gpSave();P65.fam=gpFam();if(gpFam()!==was)gpPromptsChanged();};
p65StyleRow=function(cls){const o=(v,l)=>`<button class="${cls}${GP.cfg.style===v?' on':''}" data-gk="style" data-gv="${v}">${l}</button>`;return o('auto','Auto')+o('xbox','Xbox')+o('ps','PlayStation')+o('deck','Steam Deck');};
P65.fam=gpFam();

// ---------------------------------------------------------------- the Deck's button pictures: its face buttons are lettered like an
// Xbox pad's (A B X Y, here pale letters on dark caps, as on the Deck), its shoulders are L1 R1 and L2 R2, the sticks pressed in L3
// and R3, View ⧉ and Menu ≡, the back buttons L4 L5 R4 R5, a plain d-pad cross
Object.assign(P65F,{4:['#.#','#.#','###','..#','..#'],5:['###','#..','##.','..#','##.']});
P65C.deck={f:'#3a3741',s:'#24212a',h:'#5c5864',d:'#2b2830',a:'#ece8f0',b:'#ece8f0',x:'#ece8f0',y:'#ece8f0',t:'#ece8f0'};
{const _g=p65Glyph;p65Glyph=function(k,fam){fam=fam||gpFam();if(fam!=='deck')return _g(k,fam);const key='deck:'+k;if(P65_GC[key])return P65_GC[key];
  const C=P65C.deck,pal={k:P65C.k,f:C.f,s:C.s,h:C.h,d:C.d,c:C.t,g:P65C.gold,o:P65C.gold};let G,lab;
  if(k==='lb'||k==='rb'||/^[lr][45]$/.test(k)){const back=/[45]/.test(k),t=k==='lb'?'L1':k==='rb'?'R1':k.toUpperCase();G=p65G(15,11);p65Pill(G,0,1,15,9,back?{f:'d',h:'f',s:'s'}:null);p65Txt(G,t,3,'c');lab=t+(back?' back button':' button');}
  else if(k==='lt'||k==='rt'){const t=k==='lt'?'L2':'R2';G=p65G(13,11);p65Trig(G,0,0,13,11);p65Txt(G,t,4,'c');lab=t+' trigger';}
  else if(/^dp[udlr]?$/.test(k)){const dir=k[2]||'';G=p65G(11,11);const X=(x,y)=>(x>=4&&x<=6&&y>=1&&y<=9)||(y>=4&&y<=6&&x>=1&&x<=9);
    for(let y=0;y<11;y++)for(let x=0;x<11;x++){if(X(x,y))G[y][x]=(y===1||x===1||(x===4&&(y<4||y>6))||(y===4&&(x<4||x>6)))?'h':(y===9||x===9||(x===6&&(y<4||y>6))||(y===6&&(x<4||x>6)))?'s':'f';
      else if(X(x+1,y)||X(x-1,y)||X(x,y+1)||X(x,y-1))G[y][x]='k';}
    if(dir){const m={u:[4,1],d:[4,7],l:[1,4],r:[7,4]}[dir];for(let j=0;j<3;j++)for(let i=0;i<3;i++)G[m[1]+j][m[0]+i]='o';}
    lab=dir?'D-pad '+{u:'up',d:'down',l:'left',r:'right'}[dir]:'D-pad';}
  else{let s=_g(k,'deck');if(!s)return '';   /* A B X Y, the sticks, View, Menu: the same shapes, the Deck's colours and names */
    if(k==='l3'||k==='r3')s=s.replace(/\((LS|RS)\)/,m=>m==='(LS)'?'(L3)':'(R3)');if(k==='home')s=s.replace(/aria-label="[^"]*"/,'aria-label="Steam button"');return P65_GC[key]=s;}
  return P65_GC[key]=gpSvg(G,pal,lab,'gpg');};}
gpFmt=function(s){return String(s).replace(/\{(A|B|X|Y|LB|RB|LT|RT|LS|RS|L3|R3|L4|L5|R4|R5|DP|DPU|DPD|DPL|DPR|START|BACK|HOME)\}/g,(m,k)=>p65Glyph(k.toLowerCase()));};
{const _n=gpName;gpName=function(k){if(gpFam()!=='deck')return _n(k);
  return {lb:'L1',rb:'R1',lt:'L2',rt:'R2',start:'Menu',back:'View',ls:'the left stick',rs:'the right stick',l3:'L3',r3:'R3',home:'Steam'}[k]||k.toUpperCase();};}
// the Deck drawn on the Controls page (cached: drawn once)
{const _ps=p65PadSvg;p65PadSvg=function(fam){fam=fam||gpFam();if(fam!=='deck')return _ps(fam);if(DECK.svg)return DECK.svg;
  const G=p67DeckArt(),h=G.length,w=G[0].length;let o='';for(let y=0;y<h;y++){let x=0;while(x<w){const c=G[y][x];if(c==='.'){x++;continue;}let e=x;while(e<w&&G[y][e]===c)e++;o+=`<rect x="${x}" y="${y}" width="${e-x}" height="1" fill="${P67PAL[c]||'#ff00ff'}"/>`;x=e;}}
  return DECK.svg=`<svg class="gpPic gpDeck" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" role="img" aria-label="A Steam Deck">${o}</svg>`;};}
{const css=document.createElement('style');css.textContent=`#gpCtl .pic svg.gpDeck{width:384px}@media (max-width:440px),(max-height:460px){#gpCtl .pic svg.gpDeck{width:256px}}@media (max-width:290px){#gpCtl .pic svg.gpDeck{width:128px}}`;document.head.appendChild(css);}
// the Controls page: which pad, in words, and on the Deck what its own extra controls do
const DECK_MAP=['Steam Deck',[['{L4} {L5}','Back buttons: in Steam Input, set each to any button'],['{R4} {R5}','Back buttons: the same, on the right'],
  ['{BACK} {START}','View opens the map, Menu the backpack'],['Touch','Tap anything; a text box opens the keyboard'],['Trackpads','Steam Input can make the right one a mouse']]];
gpControls=function(refresh){let p=$('gpCtl');if(!p){p=document.createElement('div');p.id='gpCtl';p.setAttribute('data-modal','');p.setAttribute('role','dialog');p.setAttribute('aria-label','Controller');
    p.addEventListener('click',e=>e.stopPropagation());p.addEventListener('keydown',e=>{if(e.key==='Escape'){p.style.display='none';}});document.body.appendChild(p);}
  if(refresh&&!gpShown(p))return;const pad=gpPad(),fam=gpFam();const pid=pad?String(pad.id||'').toLowerCase():'',pf=pad?gpFamOf(pad.id):'';
  const name=!pad?(DECK.on?'This is a Steam Deck: its own controls work as a controller. Press any button on it.':''):pf==='deck'?(DECK.on||/1205|steam deck/.test(pid)?'The Steam Deck’s own controls are in use.':'A pad is connected through Steam; it shows the Steam Deck’s buttons.'):
    pf==='ps'?'A PlayStation controller is connected.':/xbox|x-box|xinput|45e/.test(pid)?'An Xbox controller is connected.':'A controller is connected; it uses the Xbox buttons.';
  const opt=(k,v,l)=>`<button class="opt${String(GP.cfg[k])===String(v)?' on':''}" data-gk="${k}" data-gv="${v}">${l}</button>`;
  const M=fam==='deck'?[DECK_MAP,...GP_MAP]:GP_MAP;
  const h=`<b class="hd">Controller</b><div class="st">${name||'No controller yet. Plug one in, or pair it over Bluetooth, then press any button on it.'} Xbox, PlayStation and Steam Deck controls show their own buttons; any other pad uses the Xbox ones. Works in a browser and in the desktop game.</div>
    <div class="pic">${p65PadSvg(fam)}</div>
    <div class="row">Rumble ${opt('rumble',true,'On')}${opt('rumble',false,'Off')}<span style="width:10px"></span>Buttons ${p65StyleRow('opt')}</div>
    ${M.map(([t,L])=>`<div class="sec">${t}</div><div class="map">${L.map(([k,a])=>`<div><span class="k">${gpFmt(k)}</span><span>${gpFmt(a)}</span></div>`).join('')}</div>`).join('')}
    <small class="note">A text box (your name, a code, a note on a pin, the chat) opens a keyboard on the screen that you type on with the pad: ${gpFmt('{B}')} deletes, ${gpFmt('{START}')} is done. A keyboard plugged in still types as usual.</small>
    <button class="btn" id="gpCtlDone">Done</button>`;
  if(p._h!==h){const top=p.scrollTop;p._h=h;p.innerHTML=h;p.scrollTop=top;p.querySelectorAll('[data-gk]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const k=b.dataset.gk;let v=b.dataset.gv;
      if(k==='rumble'){v=v==='true';GP.cfg.rumble=v;gpSave();if(v)gpRumble(160,.5,.4);}else if(k==='style')p65SetStyle(v);gpControls();}));
    $('gpCtlDone').addEventListener('click',e=>{e.stopPropagation();p.style.display='none';});}
  gpCss(p,'display','block');};
// Settings, Controls: "Button pictures" steps Auto, Xbox, PlayStation, Steam Deck
if(typeof set7Act==='function'){const _a=set7Act;set7Act=function(r,d,el){if(r&&r.type==='pref'&&r.k==='style'){try{SFX.click&&SFX.click();}catch(e){}const L=['auto','xbox','ps','deck'];
    const n=L[(Math.max(0,L.indexOf(GP.cfg.style||'auto'))+(d||1)+L.length)%L.length];p65SetStyle(n);set7Refresh();return;}return _a.apply(this,arguments);};}
if(typeof set7Val==='function'){const _v=set7Val;set7Val=function(r){if(r&&r.type==='pref'&&r.k==='style'&&GP.cfg.style==='deck')return 'Steam Deck';return _v(r);};}
// (and the small Display panel's Buttons choice, where it still is)
if(typeof dispPick==='function'){const _dp=dispPick;dispPick=function(){const r=_dp.apply(this,arguments);try{const b=document.querySelector('#dispPick #gpSty');if(b&&!b._d7){const n=b.cloneNode(true);n._d7=true;b.replaceWith(n);
    const lab=()=>({auto:'auto',xbox:'Xbox',ps:'PlayStation',deck:'Steam Deck'}[GP.cfg.style]||'auto');const sm=n.querySelector('small');if(sm&&sm.textContent!==lab())sm.textContent=lab();
    n.addEventListener('click',e=>{e.stopPropagation();const L=['auto','xbox','ps','deck'];p65SetStyle(L[(Math.max(0,L.indexOf(GP.cfg.style))+1)%4]);const s=n.querySelector('small');if(s&&s.textContent!==lab())s.textContent=lab();});}}catch(e){}return r;};}


// ---------------------------------------------------------------- 1280x800 on a 7-inch screen: the menus' 11 px notes (the neighbours'
// jobs and birthdays, the calendar's days, the skills' points, the title's headphones line, the hotbar's counts) are a step larger on a Deck
{const css=document.createElement('style');css.textContent=`body.deck #bagBody small,body.deck #bagBody .xp,body.deck #bagBody [style*="font-size:11px"],body.deck #shop [style*="font-size:11px"],
body.deck #title .small,body.deck #title.tfx .tfoot .small,body.deck .u37about{font-size:12.5px!important}body.deck #hotbar .slot b{font-size:11px}body.deck #mindBanner .a{font-size:12.5px!important}`;document.head.appendChild(css);}
