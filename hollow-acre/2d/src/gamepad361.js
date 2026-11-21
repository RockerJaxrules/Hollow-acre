/* ================= #361 a game controller. Plug in an Xbox, PlayStation or Switch pad (by cable or Bluetooth) and the whole
   game plays from it: walking and running, tools, talking, the menus and every panel, the shops and benches, the making games,
   fishing, building and decorating, the map. The pad has no paths of its own: it presses the same keys and taps the same buttons
   a player would, so a shared farm sees nothing new. Menus get a gold frame you move with the d-pad or the stick. Its buttons
   are drawn here in the game's own pixels, and the hints and tips swap to them while you play on the pad (Xbox letters, the
   PlayStation shapes on a DualShock or DualSense, Nintendo's letters on a Switch pad). The phone's touch buttons step aside
   while a pad is in use and come back with the next touch. ================= */
const GP={idx:-1,mode:'kb',ctx:'',prev:[],block:new Set(),held:new Set(),joy:false,stick:false,runLatch:false,still:0,
  focus:null,root:null,rootKey:'',chk:0,rep:{d:'',t:0,n:0},clicking:false,inv:null,pick:0,told:false,toldGone:false,hp:null,hpT:0,
  hand:{x:160,y:90,on:false},style:'xbox',id:'',cfg:{rumble:true,style:'auto'},last:0,ft:0,front:null,moveD:0,ver:0};
try{const c=JSON.parse(localStorage.getItem('hollowPad')||'null');if(c&&typeof c==='object')Object.assign(GP.cfg,c);}catch(e){}
function gpSave(){try{localStorage.setItem('hollowPad',JSON.stringify(GP.cfg));}catch(e){}}
const GPB={a:0,b:1,x:2,y:3,lb:4,rb:5,lt:6,rt:7,back:8,start:9,ls:10,rs:11,up:12,down:13,left:14,right:15};
const GP_DZ=.24,GP_PID=9461;
const gpPadMode=()=>GP.mode==='pad';

// ---------------------------------------------------------------- the buttons, drawn in pixels
const GP_FONT={A:['.#.','#.#','###','#.#','#.#'],B:['##.','#.#','##.','#.#','##.'],X:['#.#','#.#','.#.','#.#','#.#'],Y:['#.#','#.#','.#.','.#.','.#.'],
  L:['#..','#..','#..','#..','###'],R:['##.','#.#','##.','##.','#.#'],T:['###','.#.','.#.','.#.','.#.'],Z:['###','..#','.#.','#..','###'],
  1:['.#.','##.','.#.','.#.','###'],2:['##.','..#','.#.','#..','###'],3:['##.','..#','.#.','..#','##.'],'+':['...','.#.','###','.#.','...'],'-':['...','...','###','...','...']};
const GP_SHAPE={cross:['#...#','.#.#.','..#..','.#.#.','#...#'],circle:['.###.','#...#','#...#','#...#','.###.'],square:['#####','#...#','#...#','#...#','#####'],
  triangle:['..#..','..#..','.#.#.','.#.#.','#####']};
function gpGrid(w,h){return Array.from({length:h},()=>Array(w).fill('.'));}
function gpStamp(G,rows,x,y,c){rows.forEach((r,j)=>{for(let i=0;i<r.length;i++)if(r[i]==='#'&&G[y+j]&&G[y+j][x+i]!==undefined)G[y+j][x+i]=c;});}
function gpText2(G,txt,y,c){const w=G[0].length,tw=txt.length*4-1;let x=Math.floor((w-tw)/2);for(const ch of txt){const f=GP_FONT[ch];if(f)gpStamp(G,f,x,y,c);x+=4;}}
function gpSvg(G,pal,label,cls){const h=G.length,w=G[0].length;let o='';
  for(let y=0;y<h;y++){let x=0;while(x<w){const c=G[y][x];if(c==='.'){x++;continue;}let e=x;while(e<w&&G[y][e]===c)e++;o+=`<rect x="${x}" y="${y}" width="${e-x}" height="1" fill="${pal[c]}"/>`;x=e;}}
  return `<svg class="${cls||'gpg'}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" role="img" aria-label="${label}">${o}</svg>`;}
// a round button: outline, a face with a lit edge and a shaded rim
function gpDisc(){return ['...kkkkk...','..kfffffk..','.kfhfffffk.','kfhffffffsk','kffffffffsk','kffffffffsk','kffffffffsk','kffffffffsk','.kffffffsk.','..ksssssk..','...kkkkk...'].map(r=>r.split(''));}
function gpPill(w,h){const G=gpGrid(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const edge=y===0||y===h-1||x===0||x===w-1;const corner=(x===0||x===w-1)&&(y===0||y===h-1);
    if(corner)continue;G[y][x]=edge?'k':(y===h-2?'s':(y===1&&x>1&&x<w-2?'h':'f'));}return G;}
function gpTrig(w,h){const G=gpPill(w,h);for(let x=0;x<w;x++){if(x<3||x>w-4){G[0][x]='.';G[1][x]=x===2||x===w-3?'k':'.';}}G[1][1]='.';G[1][w-2]='.';G[2][0]='.';G[2][w-1]='.';G[2][1]='k';G[2][w-2]='k';
  for(let x=3;x<w-3;x++)G[1][x]=G[1][x]==='k'?'k':'h';return G;}
const GP_COL={a:['#4e9a32','#356e20'],b:['#c0402a','#8a2a1a'],x:['#3470c0','#22508a'],y:['#d6a422','#a07818'],dark:['#4a3a30','#2e231c'],ps:['#4a3c32','#2e241c']};
const GP_PSC={a:'#8ec0f0',b:'#f07a68',x:'#f0a0d0',y:'#78d0a8'},GP_PSN={a:'cross',b:'circle',x:'square',y:'triangle'};
// which letter a face button wears: Nintendo prints them the other way round (the bottom one says B)
const GP_NIN={a:'B',b:'A',x:'Y',y:'X'};
const GP_GCACHE={};
function gpStyle(){const s=GP.cfg.style;return s&&s!=='auto'?s:GP.style;}
function gpGlyph(k,big){const st=gpStyle(),key=st+':'+k+(big?':b':'');if(GP_GCACHE[key])return GP_GCACHE[key];let svg='';const cls=big?'gpg gpgb':'gpg';
  const pal=(f,s,g)=>({k:'#1a0e06',f,s,h:'rgba(255,248,220,.55)',g});
  if('abxy'.includes(k)&&k.length===1){const G=gpDisc();
    if(st==='ps'){const sh=GP_SHAPE[GP_PSN[k]];gpStamp(G,sh,3,3,'g');svg=gpSvg(G,pal(GP_COL.ps[0],GP_COL.ps[1],GP_PSC[k]),{cross:'Cross',circle:'Circle',square:'Square',triangle:'Triangle'}[GP_PSN[k]]+' button',cls);}
    else{const L=st==='nin'?GP_NIN[k]:k.toUpperCase();gpStamp(G,GP_FONT[L],4,3,'g');const c=st==='nin'?GP_COL.dark:GP_COL[k];svg=gpSvg(G,pal(c[0],c[1],'#fff6dc'),L+' button',cls);}}
  else if(k==='lb'||k==='rb'){const t=st==='ps'?(k==='lb'?'L1':'R1'):st==='nin'?(k==='lb'?'L':'R'):k.toUpperCase();const G=gpPill(t.length>1?15:11,9);gpText2(G,t,2,'g');svg=gpSvg(G,pal(GP_COL.dark[0],GP_COL.dark[1],'#f4e6c8'),t+' button',cls);}
  else if(k==='lt'||k==='rt'){const t=st==='ps'?(k==='lt'?'L2':'R2'):st==='nin'?(k==='lt'?'ZL':'ZR'):k.toUpperCase();const G=gpTrig(15,11);gpText2(G,t,4,'g');svg=gpSvg(G,pal(GP_COL.dark[0],GP_COL.dark[1],'#f4e6c8'),t+' trigger',cls);}
  else if(k==='ls'||k==='rs'){const G=gpGrid(13,13);for(let y=0;y<13;y++)for(let x=0;x<13;x++){const d=Math.hypot(x-6,y-6);if(d>6.4)continue;G[y][x]=d>5.5?'k':d>4.6?(y>7?'s':'f'):d>3.9?'r':'c';}
    gpStamp(G,GP_FONT[k==='ls'?'L':'R'],5,4,'g');svg=gpSvg(G,{k:'#1a0e06',f:'#4a3a30',s:'#2e231c',r:'#1a0e06',c:'#7a6654',g:'#fff6dc'},(k==='ls'?'Left':'Right')+' stick',cls);}
  else if(k==='dp'){const R=['...kkkkk...','...kfffk...','...kfhfk...','kkkkfffkkkk','kfffffffffk','kfhfffffffk','kfffffffffk','kkkkfffkkkk','...kfffk...','...ksssk...','...kkkkk...'];
    svg=gpSvg(R.map(r=>r.split('')),pal(GP_COL.dark[0],GP_COL.dark[1]),'D-pad',cls);}
  else if(k==='start'||k==='back'){
    if(st==='nin'){const G=gpDisc();gpStamp(G,GP_FONT[k==='start'?'+':'-'],4,3,'g');svg=gpSvg(G,pal(GP_COL.dark[0],GP_COL.dark[1],'#f4e6c8'),(k==='start'?'Plus':'Minus')+' button',cls);}
    else{const G=gpPill(13,9);if(k==='start'){for(const y of [2,4,6])for(let x=4;x<=8;x++)G[y][x]='g';}else{for(let y=2;y<=5;y++)for(let x=3;x<=6;x++)if(y===2||y===5||x===3||x===6)G[y][x]='g';for(let y=3;y<=6;y++)for(let x=6;x<=9;x++)if(y===3||y===6||x===6||x===9)G[y][x]='g';}
      const nm=st==='ps'?(k==='start'?'Options':'Create'):(k==='start'?'Menu':'View');svg=gpSvg(G,pal(GP_COL.dark[0],GP_COL.dark[1],'#f4e6c8'),nm+' button',cls);}}
  return GP_GCACHE[key]=svg;}
// "{A} to talk" -> the A button's picture; {LB/RB} {LT} {LS} {DP} {START} {BACK} the same
function gpFmt(s){return String(s).replace(/\{(A|B|X|Y|LB|RB|LT|RT|LS|RS|DP|START|BACK)\}/g,(m,k)=>gpGlyph(k.toLowerCase()));}
// the name a button goes by on this pad, for plain text
function gpName(k){const st=gpStyle();if(st==='ps')return {a:'Cross',b:'Circle',x:'Square',y:'Triangle',lb:'L1',rb:'R1',lt:'L2',rt:'R2',start:'Options',back:'Create'}[k]||k.toUpperCase();
  if(st==='nin')return {a:'B',b:'A',x:'Y',y:'X',lb:'L',rb:'R',lt:'ZL',rt:'ZR',start:'+',back:'−'}[k]||k.toUpperCase();return {start:'Menu',back:'View'}[k]||k.toUpperCase();}

// ---------------------------------------------------------------- what's drawn over the game: the frame, the hand, the cross, the chooser
{const css=document.createElement('style');css.textContent=`
.gpg{display:inline-block;height:1.35em;width:auto;vertical-align:-.32em;margin:0 .1em;image-rendering:pixelated;flex:none}
.gpgb{height:26px;vertical-align:middle}
#gpRing{position:fixed;left:0;top:0;z-index:2147483600;pointer-events:none;display:none;box-shadow:0 0 0 2px #1a0e06,0 0 0 4px #ffd27a,0 0 0 6px #1a0e06,0 0 0 8px rgba(240,160,64,.35)}
#gpRing i{position:absolute;width:6px;height:6px;background:#ffd27a;box-shadow:0 0 0 2px #1a0e06}
#gpRing i:nth-child(1){left:-7px;top:-7px}#gpRing i:nth-child(2){right:-7px;top:-7px}#gpRing i:nth-child(3){left:-7px;bottom:-7px}#gpRing i:nth-child(4){right:-7px;bottom:-7px}
.invgrid .is.gpheld{box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 4px #ffd27a!important;opacity:.55}
#gpGhost{position:fixed;z-index:2147483601;width:28px;height:28px;pointer-events:none;display:none;image-rendering:pixelated;filter:drop-shadow(2px 2px 0 #1a0e06)}
#gpHand{position:fixed;left:0;top:0;z-index:2147483500;pointer-events:none;display:none;width:24px;height:30px;transform:translate(-5px,-2px)}
#gpCross{position:absolute;z-index:5;pointer-events:none;display:none;width:22px;height:22px;transform:translate(-11px,-11px)}
#gpPick{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 18%);transform:translateX(-50%);z-index:60;display:none;background:rgba(26,16,8,.92);color:#f4e6c8;
  font:14px/1.3 'Hollow Pixel',monospace;padding:8px 12px;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 4px #e8923f;white-space:nowrap;pointer-events:none}
#gpPick b{color:#ffd27a;font-weight:normal}
body.gp-pad #btnUse,body.gp-pad #joy,body.gp-pad #joyHint{display:none!important}
body.gp-pad,body.gp-pad *{cursor:none!important}
#skip .gpg,#mg4Skip .gpg{margin-right:6px}
.gpbadge{display:none;position:absolute;right:3px;top:3px;line-height:0;pointer-events:none}.gpbadge .gpg{height:15px;margin:0;vertical-align:top}
@media (max-height:500px){.gpbadge{right:2px;top:2px}.gpbadge .gpg{height:12px}}
body.gp-pad .gpbadge{display:block}
#gpCtl{position:fixed;z-index:1001;left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,94vw);max-height:calc(92vh / var(--su,1));overflow:auto;background:#2a1a0e;color:#f4e6c8;
  padding:14px 16px 12px;font-size:14px;line-height:1.35;box-shadow:0 0 0 2px #1a0e06,0 0 0 4px #b8521c,0 10px 40px rgba(0,0,0,.6);display:none;zoom:var(--su,1)}
#gpCtl .hd{display:block;font-size:16px;margin-bottom:6px;color:#ffd27a}
#gpCtl .st{background:#1e130a;padding:7px 10px;box-shadow:inset 0 0 0 2px #3a2616;font-size:13px}
#gpCtl .pic{display:flex;justify-content:center;margin:8px 0 2px}#gpCtl .pic svg{width:min(288px,70vw);height:auto;image-rendering:pixelated}
#gpCtl .sec{margin:10px 0 4px;color:#e0b070;font-size:13px;letter-spacing:.06em;text-transform:uppercase}
#gpCtl .map{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:3px 14px}
#gpCtl .map div{display:flex;align-items:center;gap:8px;min-height:28px;font-size:13px}#gpCtl .map .k{display:inline-flex;gap:2px;min-width:58px;justify-content:flex-end}
#gpCtl .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:4px}
#gpCtl .opt{padding:6px 10px;font:inherit;font-size:13px;color:inherit;cursor:pointer;background:#3a2616;border:2px solid #5a3e24;border-radius:3px;min-height:34px}
#gpCtl .opt.on{border-color:#e0b070;background:#5a3a1c}
#gpCtl .note{display:block;margin:8px 0 2px;opacity:.75;font-size:12px}
#gpCtl #gpCtlDone{display:block;margin:10px auto 0}
@media (max-height:460px){#gpCtl{padding:10px 12px 8px}#gpCtl .pic svg{width:180px}}`;document.head.appendChild(css);
  const r=document.createElement('div');r.id='gpRing';r.innerHTML='<i></i><i></i><i></i><i></i>';document.body.appendChild(r);
  const gh=document.createElement('img');gh.id='gpGhost';gh.alt='';document.body.appendChild(gh);
  // the hand you steer in the making games that want a pointer (the car's repairs): drawn here, pixel by pixel
  const H=['..##........','.#..#.......','.#..#.......','.#..###.....','.#..#..##...','##..#..#.#..','#.#.......#.','#.........#.','.#........#.','..#......#..','...#.....#..','...######...'];
  const hd=document.createElement('div');hd.id='gpHand';hd.innerHTML=gpSvg(H.map((r,j)=>r.split('').map((c,i)=>c==='#'?'k':(j>0&&j<11&&i>0&&i<11&&r.slice(0,i).includes('#')&&r.slice(i).includes('#')?'f':'.'))),{k:'#1a0e06',f:'#f4e6c8'},'hand','gpHandSvg');
  hd.firstChild.style.cssText='width:100%;height:100%';document.body.appendChild(hd);
  const pk=document.createElement('div');pk.id='gpPick';document.body.appendChild(pk);}
const GP_CROSS=gpSvg(['.....k.....','....kfk....','....kfk....','....kfk....','.kkkk.kkkk.','kffff.ffffk','.kkkk.kkkk.','....kfk....','....kfk....','....kfk....','.....k.....'].map(r=>r.split('')),{k:'#1a0e06',f:'#ffd27a'},'mark here','gpCrossSvg');
// write a style only when it changes (a panel that is rewritten every frame flickers)
function gpCss(el,k,v){if(el.style[k]!==v)el.style[k]=v;}

// ---------------------------------------------------------------- which input you're using: the pad, or the keyboard, mouse and touch
function gpSetMode(m){if(GP.mode===m)return;const was=GP.mode;GP.mode=m;document.body.classList.toggle('gp-pad',m==='pad');
  if(m==='pad'){try{TAP.mouse=null;}catch(e){}}else{gpRelease();gpHideAll();}
  if((was==='pad')!==(m==='pad'))gpPromptsChanged();}
// (a key some panel swallows on its way down is still seen coming up)
for(const t of ['keydown','keyup'])addEventListener(t,e=>{if(e.isTrusted)gpSetMode('kb');},true);
addEventListener('wheel',e=>{if(e.isTrusted)gpSetMode('kb');},{capture:true,passive:true});
for(const t of ['pointerdown','pointerup'])addEventListener(t,e=>{if(!e.isTrusted)return;gpSetMode(e.pointerType==='mouse'?'kb':'touch');},true);
addEventListener('touchstart',e=>{if(e.isTrusted)gpSetMode('touch');},{capture:true,passive:true});
addEventListener('mousemove',e=>{if(!e.isTrusted||GP.mode!=='pad')return;GP.moveD+=Math.abs(e.movementX||0)+Math.abs(e.movementY||0);if(GP.moveD>40){GP.moveD=0;gpSetMode('kb');}},{capture:true,passive:true});

// ---------------------------------------------------------------- pressing keys the way a keyboard does
const GP_KEY={Space:' ',Enter:'Enter',Escape:'Escape',KeyC:'c',KeyX:'x',KeyE:'e',KeyM:'m',KeyJ:'j',KeyR:'r',KeyF:'f',ArrowUp:'ArrowUp',ArrowDown:'ArrowDown',ArrowLeft:'ArrowLeft',ArrowRight:'ArrowRight',ShiftLeft:'Shift'};
function gpKey(code,down,key){const ev=new KeyboardEvent(down?'keydown':'keyup',{code,key:key||GP_KEY[code]||code,bubbles:true,cancelable:true});
  if(down)GP.held.add(code);else GP.held.delete(code);try{document.body.dispatchEvent(ev);}catch(e){}}
function gpTap(code,key){gpKey(code,true,key);gpKey(code,false,key);}
function gpHoldKey(code,on){if(on&&!GP.held.has(code))gpKey(code,true);else if(!on&&GP.held.has(code))gpKey(code,false);}
// let go of everything the pad is holding (it came out, the window lost focus, or what you're doing changed)
function gpRelease(){for(const c of [...GP.held])gpKey(c,false);try{if(GP.joy&&joy.id===null){joy.x=0;joy.y=0;}}catch(e){}GP.joy=false;GP.stick=false;
  try{const I=window.__mg4I;if(I&&GP.mgAx){I.ax=0;I.ay=0;}}catch(e){}GP.mgAx=false;}
// the synthetic pointer the pad clicks with never holds a real capture
for(const m of ['setPointerCapture','releasePointerCapture']){const o=Element.prototype[m];if(o)Element.prototype[m]=function(id){if(id===GP_PID)return;return o.apply(this,arguments);};}
{const o=Element.prototype.hasPointerCapture;if(o)Element.prototype.hasPointerCapture=function(id){if(id===GP_PID)return false;return o.apply(this,arguments);};}
function gpPtr(el,type,x,y,o){const ev=new PointerEvent(type,Object.assign({bubbles:true,cancelable:true,composed:true,clientX:x,clientY:y,pointerId:GP_PID,pointerType:'mouse',isPrimary:true,button:0,buttons:type==='pointerup'?0:1},o||{}));
  return el.dispatchEvent(ev);}
const gpMid=el=>{const r=el.getBoundingClientRect();return [Math.round(r.left+r.width/2),Math.round(r.top+r.height/2)];};
// pressing A on a button is a click: some buttons answer the press itself (and say so), the rest the click
function gpClick(el,o){if(!el||!el.isConnected)return;const [x,y]=gpMid(el);GP.clicking=true;
  try{const go=gpPtr(el,'pointerdown',x,y,o);gpPtr(el,'pointerup',x,y,o);if(go&&el.isConnected)el.click();}finally{GP.clicking=false;}}

// ---------------------------------------------------------------- the menus: what can be chosen, and moving the frame between them
const GP_SEL='button,a[href],input:not([type=hidden]),select,textarea,[role=button],[tabindex]:not([tabindex="-1"]),.invgrid .is,.soc .p,#chCard.on,[data-mmpin]';
const GP_ROOT='#gpCtl,#dispPick,#sndPick,#cheatBox,#acctPanel,#mpScr,#creator,#title,#end,#lvlUp,#saleSlip,#shipBin,#craft,#shop,#talk,#note,#bag,#placeBar,#fGame,.sheet,[data-modal],[role=dialog]';
const GP_CORNER=['sndBtn','dispBtn','fsBtn'];
function gpShown(el){if(!el||!el.isConnected||el.hidden)return false;if(el.checkVisibility)return el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true});
  const cs=getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>.05;}
function gpScroller(el){for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){if(p.scrollHeight>p.clientHeight+4||p.scrollWidth>p.clientWidth+4){const cs=getComputedStyle(p);if(/(auto|scroll)/.test(cs.overflowY+cs.overflowX))return p;}}return null;}
function gpHit(el,r){const cx=Math.max(1,Math.min(innerWidth-2,r.left+r.width/2)),cy=Math.max(1,Math.min(innerHeight-2,r.top+r.height/2));
  if(r.bottom<1||r.top>innerHeight-1||r.right<1||r.left>innerWidth-1)return false;const h=document.elementFromPoint(cx,cy);return !!h&&(h===el||el.contains(h));}
function gpZ(el){let z=0;for(let p=el;p&&p!==document.body;p=p.parentElement){const v=parseInt(getComputedStyle(p).zIndex);if(!isNaN(v)){z=v;break;}}return z;}
function gpHud(el){return !!el.closest('#hud,#hotbar,#buttons,#tut,#btnBag,#btnDecor,#btnJournal,#fsX,#objective,#clock,#actChip')||GP_CORNER.includes(el.id);}
// everything you could choose right now, in the panel on top
function gpCands(){const out=[];const seen=new Set();
  for(const el of document.querySelectorAll(GP_SEL)){if(seen.has(el))continue;seen.add(el);if(el.disabled&&!el.closest('.invgrid'))continue;
    if(el.closest('#gpRing,#gpHand'))continue;const r=el.getBoundingClientRect();if(r.width<4||r.height<4)continue;if(!gpShown(el))continue;
    // a button scrolled out of its list still counts while the list itself is in view
    let ok=gpHit(el,r);if(!ok){const sc=gpScroller(el);if(sc)ok=gpHit(sc,sc.getBoundingClientRect());}
    if(!ok)continue;out.push({el,r,root:el.closest(GP_ROOT)});}
  // the panel on top, by its stacking; a tip bubble only when nothing else is open
  let top=null,tz=-1e9;for(const c of out){const R=c.root;if(!R||R.id==='tut')continue;const z=gpZ(R);if(z>tz||(z===tz&&top&&(top.compareDocumentPosition(R)&Node.DOCUMENT_POSITION_FOLLOWING))){tz=z;top=R;}}
  GP.root=top;let C=top?out.filter(c=>c.root===top||(top.contains(c.el))):out.filter(c=>!gpHud(c.el));
  if(top&&/^(title|creator|bag)$/.test(top.id))for(const c of out)if(GP_CORNER.includes(c.el.id)&&!C.includes(c))C.push(c);
  if(!top&&S.mode==='play'&&!S.paused)C=[];
  return C;}
function gpGap(a0,a1,b0,b1){return Math.max(0,Math.max(a0,b0)-Math.min(a1,b1));}
function gpNav(dx,dy){const C=gpCands();if(!C.length){gpScrollBy(dx,dy,true);return;}const cur=C.find(c=>c.el===GP.focus);if(!cur){gpFocus(gpDefault(C));return;}
  const a=cur.r,acx=a.left+a.width/2,acy=a.top+a.height/2;let best=null,bs=1e9;
  for(const c of C){if(c===cur||c.el.contains(cur.el)||cur.el.contains(c.el))continue;const b=c.r,bcx=b.left+b.width/2,bcy=b.top+b.height/2;let prim,orth,co;
    if(dx>0){if(bcx<=acx+2)continue;prim=b.left-a.right;orth=gpGap(a.top,a.bottom,b.top,b.bottom);co=Math.abs(bcy-acy);}
    else if(dx<0){if(bcx>=acx-2)continue;prim=a.left-b.right;orth=gpGap(a.top,a.bottom,b.top,b.bottom);co=Math.abs(bcy-acy);}
    else if(dy>0){if(bcy<=acy+2)continue;prim=b.top-a.bottom;orth=gpGap(a.left,a.right,b.left,b.right);co=Math.abs(bcx-acx);}
    else{if(bcy>=acy-2)continue;prim=a.top-b.bottom;orth=gpGap(a.left,a.right,b.left,b.right);co=Math.abs(bcx-acx);}
    const s=Math.max(0,prim)+orth*2.5+co*.12+(prim<-4?24:0);if(s<bs){bs=s;best=c;}}
  if(best){gpFocus(best.el);SFX.click&&SFX.click();}else if(!gpScrollBy(dx,dy,false)){}}
// the first thing to land on when a panel opens: the game's own choice if it has one, else its first button
function gpDefault(C){const R=GP.root;const pick=s=>C.find(c=>c.el.matches(s));
  const order=R&&R.id==='title'?['#cont','#begin']:R&&R.id==='creator'?['#cGo']:R&&R.id==='bag'?['.invgrid .is.sel','.tabs button.on']:R&&R.id==='end'?['#keepFarming']:['.hot:not(.close)','[autofocus]'];
  for(const s of order){const c=pick(s);if(c)return c.el;}
  const inner=C.filter(c=>!GP_CORNER.includes(c.el.id));const L=(inner.length?inner:C).slice().sort((p,q)=>(p.el.compareDocumentPosition(q.el)&Node.DOCUMENT_POSITION_FOLLOWING)?-1:1);
  // a panel's close button is a poor first choice when there's anything else
  const nc=L.filter(c=>!/^(close|done|back|cancel|not yet|leave)$/i.test((c.el.textContent||'').trim())&&!/Close$|^close$/.test(c.el.id));return ((nc.length?nc:L)[0]||{}).el||null;}
function gpFocus(el){const was=GP.focus;GP.focus=el||null;if(!el)return;if(was&&was!==el&&was.tagName&&/^(INPUT|TEXTAREA|SELECT)$/.test(was.tagName)&&document.activeElement===was)was.blur();
  const sc=gpScroller(el);if(sc){const r=el.getBoundingClientRect(),s=sc.getBoundingClientRect();if(r.top<s.top+2||r.bottom>s.bottom-2||r.left<s.left||r.right>s.right)el.scrollIntoView({block:'nearest',inline:'nearest'});}}
// nothing more that way: scroll the panel instead, if it can
function gpScrollBy(dx,dy,any){const base=GP.focus&&GP.focus.isConnected?GP.focus:GP.root;let sc=base?(gpScroller(base)||null):null;
  if(!sc&&GP.root){for(const e of GP.root.querySelectorAll('*')){if(e.scrollHeight>e.clientHeight+20&&/(auto|scroll)/.test(getComputedStyle(e).overflowY)){sc=e;break;}}}
  if(!sc)return false;const t0=sc.scrollTop,l0=sc.scrollLeft;sc.scrollTop+=dy*Math.round(sc.clientHeight*.45);sc.scrollLeft+=dx*Math.round(sc.clientWidth*.45);return sc.scrollTop!==t0||sc.scrollLeft!==l0;}
function gpScrollAnalog(rx,ry,dt){if(!GP.root)return;const mw=$('mapWrap');let sc=mw&&gpShown(mw)&&GP.root.contains(mw)?mw:null;
  if(!sc){const base=GP.focus&&GP.focus.isConnected?GP.focus:null;sc=base?gpScroller(base):null;}
  if(!sc){for(const e of GP.root.querySelectorAll('*')){if(e.scrollHeight>e.clientHeight+20&&/(auto|scroll)/.test(getComputedStyle(e).overflowY)){sc=e;break;}}}
  if(!sc&&GP.root.scrollHeight>GP.root.clientHeight+4)sc=GP.root;if(!sc)return;sc.scrollTop+=ry*900*dt;sc.scrollLeft+=rx*900*dt;}
// the bumpers turn a panel's tabs
function gpTabs(d){const R=GP.root;if(!R)return false;const on=[...R.querySelectorAll('.tabs button.on,.bztabs button.on,button[data-t].on,button[data-tab].on,button[data-emtab].on')].find(gpShown);if(!on)return false;
  const attr=on.hasAttribute('data-emtab')?'data-emtab':on.hasAttribute('data-tab')?'data-tab':on.hasAttribute('data-t')?'data-t':null;
  const sib=[...on.parentElement.children].filter(b=>b.tagName==='BUTTON'&&gpShown(b)&&(!attr||b.hasAttribute(attr)));const i=sib.indexOf(on);if(i<0||sib.length<2)return false;
  const nx=sib[(i+d+sib.length)%sib.length];gpClick(nx);GP.focus=null;GP.chk=0;SFX.page&&SFX.page();return true;}
// B: the panel's own way out (its Close, Done, Back or Cancel), else Esc
function gpBack(){if(GP.inv){gpInvDrop();return;}const ae=document.activeElement;
  // a box you opened for typing with A: B lets go of it first; one the game put the cursor in, B leaves at once
  if(ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)){ae.blur();if(GP.typing===ae){GP.typing=null;return;}}
  const R=GP.root;if(R&&R.id==='title')return;
  if(R){const bs=[...R.querySelectorAll('button')].filter(b=>gpShown(b)&&!b.disabled);
    const want=bs.find(b=>/(^|[^a-z])(Close|close|No)$/.test(b.id)&&!/Gift|Trade/.test(b.id))||bs.find(b=>b.matches('[data-a=back],[data-mmcancel],#dispClose,#sbDone,#crClose,#gpCtlDone'))||
      bs.find(b=>/^(close|done|back|cancel|not yet|leave|×|✕|no thanks|never mind)$/i.test((b.textContent||'').trim()));
    if(want){gpClick(want);return;}}
  gpTap('Escape');}

// ---------------------------------------------------------------- the backpack: A lifts an item and A again sets it down (on the bin it's thrown away)
function gpCells(){const G=$('invGrid');return G?[...G.children]:[];}
function gpInvShow(){const g=$('gpGhost');if(!GP.inv){gpCss(g,'display','none');document.querySelectorAll('.invgrid .is.gpheld').forEach(c=>c.classList.remove('gpheld'));return;}
  const c=gpCells()[GP.inv.i];if(c&&!c.classList.contains('gpheld'))c.classList.add('gpheld');const im=c&&c.querySelector('img');if(im&&g.src!==im.src)g.src=im.src;
  const f=GP.focus&&GP.focus.isConnected?GP.focus.getBoundingClientRect():null;if(!f){gpCss(g,'display','none');return;}gpCss(g,'display','block');gpCss(g,'left',Math.round(f.right-18)+'px');gpCss(g,'top',Math.round(f.top-14)+'px');}
function gpInvDrop(){GP.inv=null;gpInvShow();}
function gpInvA(el){const cells=gpCells();const j=cells.indexOf(el);const trash=el.id==='invTrash';
  if(!GP.inv){if(j<0)return;if(el.classList.contains('locked'))return;const [x,y]=gpMid(el);gpPtr(el,'pointerdown',x,y);gpPtr($('invGrid'),'pointerup',x,y);
    if(S.slots[j]){GP.inv={i:j};}const nc=gpCells()[j];if(nc)GP.focus=nc;gpInvShow();return;}
  const i=GP.inv.i;GP.inv=null;gpInvShow();if(j===i||(!trash&&j<0))return;const src=gpCells()[i];if(!src)return;
  const [x0,y0]=gpMid(src),[x1,y1]=gpMid(el);const G=$('invGrid');gpPtr(src,'pointerdown',x0,y0);gpPtr(G,'pointermove',x0+10,y0+10);gpPtr(G,'pointermove',x1,y1);gpPtr(G,'pointerup',x1,y1);
  const g=$('dragGhost');if(g)g.remove();if(!trash){const nc=gpCells()[j];if(nc)GP.focus=nc;}}
// Y on an item: eat it, or hold it (furniture, a machine), the same as its button under the grid
function gpInvY(el){const j=gpCells().indexOf(el);if(j<0||!S.slots[j])return;GP.inv=null;gpInvShow();const [x,y]=gpMid(el);gpPtr(el,'pointerdown',x,y);gpPtr($('invGrid'),'pointerup',x,y);
  const b=$('invTip')&&$('invTip').querySelector('[data-eat],[data-place]');if(b)gpClick(b);const nc=gpCells()[j];if(nc)GP.focus=nc;}

// ---------------------------------------------------------------- A, Y and X on whatever the frame is on
function gpA(){const el=GP.focus;if(!el||!el.isConnected)return;
  if(el.closest('.invgrid')||(el.id==='invTrash'&&GP.inv)){gpInvA(el);return;}
  if(/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)){if(el.type==='checkbox'||el.type==='radio'||el.type==='color')el.click();else{el.focus();GP.typing=el;try{el.select&&el.type!=='number'&&el.select();}catch(e){}}return;}
  if(GP.root&&GP.root.id==='talk')GP.newIn=new Set(gpCands().map(c=>c.el));gpClick(el);GP.chk=.12;}
function gpY(){const el=GP.focus;if(!el||!el.isConnected)return;if(el.closest('.invgrid')){gpInvY(el);return;}
  // the shipping bin: the whole stack, as a shift-click does
  if(el.classList.contains('sbit')){gpClick(el,{shiftKey:true});return;}}
// the map: the right stick moves it, the triggers zoom, and while marking X sets the mark under the cross
function gpMapOn(){const w=$('mapWrap');return !!(w&&gpShown(w)&&!$('bag').hidden);}
function gpMapMark(){const w=$('mapWrap'),inner=$('mapInner');if(!w||!inner||typeof MMK==='undefined'||!MMK.mode)return false;const r=w.getBoundingClientRect(),x=Math.round(r.left+r.width/2),y=Math.round(r.top+r.height/2);
  gpPtr(inner,'pointerdown',x,y);inner.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,clientX:x,clientY:y}));return true;}

// ---------------------------------------------------------------- what the pad is doing right now
const gpV=id=>{const e=$(id);return !!e&&gpShown(e);};
function gpModal(){for(const e of document.querySelectorAll('[data-modal]')){if(e.id==='mindBanner')continue;if(e.id==='cheatBox'){if(e.classList.contains('on'))return true;continue;}
    if(gpShown(e)&&e.getBoundingClientRect().height>8)return true;}
  for(const id of ['gpCtl','lvlUp','saleSlip','end','dispPick','sndPick'])if(gpV(id))return true;
  for(const e of document.querySelectorAll('.sheet:not([hidden])'))if(gpShown(e))return true;return false;}
function gpContext(){try{
  if(typeof MG4!=='undefined'&&MG4.on)return 'mg4';
  if(typeof MG!=='undefined'&&MG.on)return 'fish';
  if(typeof CG!=='undefined'&&CG.on)return 'cg';
  if($('fGame'))return 'cg';
  if(gpModal())return 'ui';
  if(typeof PLACE!=='undefined'&&PLACE.on)return 'place';
  if(typeof STG!=='undefined'&&STG&&STG._pick37&&typeof ST37!=='undefined'&&ST37.tags&&ST37.tags.length)return 'pick';
  if((typeof STG!=='undefined'&&STG)||(typeof SCENE!=='undefined'&&SCENE)||(typeof RU!=='undefined'&&RU.on)||(typeof MIR!=='undefined'&&MIR.on)||S.mode==='cine'||S.mode==='scene'||S.mode==='ritual')return 'cut';
  if(S.mode!=='play'||S.paused)return 'ui';
  return 'play';}catch(e){return 'ui';}}
// the making games' steps that need a hand moved about (the car's repairs); the rest play from the stick and A
const GP_PTR=new Set(['crDents','crBelt','crHang','crLugs','crGlass','crSeal','crBattery','crCables']);
if(typeof S4!=='undefined')for(const k of Object.keys(S4)){const f=S4[k];if(typeof f!=='function')continue;S4[k]=function(){const o=f.apply(this,arguments);try{if(o&&typeof o==='object')o.__gpk=k;}catch(e){}return o;};}

// ---------------------------------------------------------------- reading the pad
function gpPad(){let L=[];try{L=navigator.getGamepads?[...navigator.getGamepads()]:[];}catch(e){return null;}
  let best=null;for(const p of L){if(!p||p.connected===false)continue;if(p.index===GP.idx)return p;if(!best||(p.mapping==='standard'&&best.mapping!=='standard'))best=p;}
  if(best){GP.idx=best.index;gpWho(best);}return best;}
function gpWho(p){if(GP.id===p.id)return;GP.id=p.id;const s=String(p.id||'').toLowerCase();
  GP.style=/xbox|045e|xinput/.test(s)?'xbox':/054c|dualshock|dualsense|playstation|sony|^wireless controller/.test(s)?'ps':/057e|nintendo|pro controller|joy-con/.test(s)?'nin':'xbox';gpPromptsChanged();}
function gpStick(p,i){let x=p.axes[i]||0,y=p.axes[i+1]||0;const m=Math.hypot(x,y);if(m<GP_DZ)return [0,0,0];const k=Math.min(1,(m-GP_DZ)/(1-GP_DZ))/m;return [x*k,y*k,Math.min(1,m*k)];}
function gpBtn(p,i){const b=p.buttons[i];if(!b)return false;return typeof b==='object'?(b.pressed||b.value>(i===6||i===7?.3:.5)):b>.5;}
let GP_CUR=[];
const gpDown=i=>GP_CUR[i]&&!GP.block.has(i);
const gpEdge=i=>gpDown(i)&&!GP.prev[i];
// a direction held on the d-pad or the stick, repeating like a held key
function gpDir(p,dt,useStick){let dx=(gpDown(15)?1:0)-(gpDown(14)?1:0),dy=(gpDown(13)?1:0)-(gpDown(12)?1:0);
  if(!dx&&!dy&&useStick){const [x,y]=gpStick(p,0);if(Math.max(Math.abs(x),Math.abs(y))>.55){if(Math.abs(x)>Math.abs(y))dx=Math.sign(x);else dy=Math.sign(y);}}
  const d=dx||dy?dx+','+dy:'';const R=GP.rep;if(d!==R.d){R.d=d;R.t=0;R.n=0;return d?[dx,dy]:null;}if(!d)return null;R.t+=dt;const wait=R.n?.11:.38;if(R.t>=wait){R.t=0;R.n++;return [dx,dy];}return null;}

function gpFrame(now){requestAnimationFrame(gpFrame);const dt=Math.min(.05,Math.max(0,(now-(GP.last||now))/1000));GP.last=now;
  const p=gpPad();
  if(!p){if(GP.on){GP.on=false;gpRelease();gpHideAll();}return;}
  GP.on=true;const n=Math.max(17,p.buttons.length);GP_CUR=[];for(let i=0;i<n;i++)GP_CUR[i]=gpBtn(p,i);
  for(const i of [...GP.block])if(!GP_CUR[i])GP.block.delete(i);
  const [lx,ly]=gpStick(p,0),[rx,ry]=gpStick(p,2);
  // what you're doing is followed even while the keyboard has the game, so the pad wakes straight into it
  const ctx=gpContext();if(ctx!==GP.ctx){if(GP.mode==='pad'){gpRelease();for(let i=0;i<n;i++)if(GP_CUR[i])GP.block.add(i);}GP.ctx=ctx;GP.chk=0;GP.rep.d='';if(ctx!=='ui'){GP.inv=null;gpInvShow();}}
  // the first press after the keyboard or a touch wakes the pad; in a menu it only shows the frame
  if(GP_CUR.some(Boolean)||Math.hypot(lx,ly)>.4||Math.hypot(rx,ry)>.4){if(GP.mode!=='pad'){gpSetMode('pad');if(ctx==='ui'){GP.prev=[];for(let i=0;i<n;i++)if(GP_CUR[i])GP.block.add(i);}}GP.moveD=0;}
  if(document.hidden||GP.mode!=='pad'){GP.prev=GP_CUR;return;}
  // said once, while nothing else is up (a tip, a toast, a panel); the tips already speak the pad's buttons
  if(!GP.told&&S.mode==='play'&&!S.paused){GP.toldT=(GP.toldT||0)+dt;const tip=$('tut'),t=$('toast');const busy=gpModal()||(tip&&tip.style.display==='block')||(t&&t.classList.contains('show'));
    if(!busy){GP.told=true;toast('Controller connected.',1.8);}else if(GP.toldT>6)GP.told=true;}
  // a browser keeps the sound off until a key, a click or a tap (a controller's buttons don't count): say so once
  if(GP.told&&!GP.toldSnd&&S.mode==='play'&&!S.paused){GP.sndT=(GP.sndT||0)+dt;if(GP.sndT>5){GP.toldSnd=true;try{if(typeof A!=='undefined'&&(!A.ctx||A.ctx.state!=='running')&&!(typeof sndMode==='function'&&sndMode()==='off'))toast('The sound starts with your first key, click or tap. Browsers wait for one.',3.4);}catch(e){}}}
  try{GP_CTX[ctx]&&GP_CTX[ctx](p,dt,lx,ly,rx,ry);}catch(e){}
  GP.bt=(GP.bt||0)+dt;if(GP.bt>1){GP.bt=0;gpBadges();}
  GP.prev=GP_CUR;gpDraw();}
// let go of everything when the window loses focus or the page hides, and don't act on buttons still down when it comes back
function gpPause(){gpRelease();const p=gpPad();if(p)for(let i=0;i<p.buttons.length;i++)if(gpBtn(p,i))GP.block.add(i);}
addEventListener('blur',gpPause);document.addEventListener('visibilitychange',()=>{if(document.hidden)gpPause();});
addEventListener('gamepadconnected',e=>{GP.idx=e.gamepad.index;gpWho(e.gamepad);});
addEventListener('gamepaddisconnected',e=>{if(e.gamepad.index!==GP.idx)return;const was=GP.mode==='pad';gpRelease();GP.idx=-1;GP.on=false;
  if(was){gpSetMode(fineP()?'kb':'touch');try{if(S.mode==='play'&&!S.paused&&!(typeof PLACE!=='undefined'&&PLACE.on)&&typeof openBag==='function')openBag('items');}catch(x){}toast('Controller disconnected.',2.2);}});

// ---------------------------------------------------------------- each thing the pad can be doing
const GP_CTX={
  // walking about the farm and the valley
  play(p,dt,lx,ly,rx,ry){const m=Math.hypot(lx,ly);
    try{if(joy.id===null){if(m>0){joy.x=lx;joy.y=ly;GP.joy=true;}else if(GP.joy){joy.x=0;joy.y=0;GP.joy=false;}}}catch(e){}GP.stick=m>0;
    gpHoldKey('ArrowUp',gpDown(12));gpHoldKey('ArrowDown',gpDown(13));gpHoldKey('ArrowLeft',gpDown(14));gpHoldKey('ArrowRight',gpDown(15));
    const moving=m>0||gpDown(12)||gpDown(13)||gpDown(14)||gpDown(15);if(moving)GP.still=0;else{GP.still+=dt;if(GP.still>.5)GP.runLatch=false;}
    if(gpEdge(10))GP.runLatch=!GP.runLatch;
    gpHoldKey('ShiftLeft',gpDown(1)||GP.runLatch);
    gpHoldKey('KeyC',gpDown(2)||gpDown(7));
    if(gpEdge(0))gpTap('KeyX');
    if(gpEdge(3)){try{if(S.slotSel>=0)slotUse(S.slotSel);}catch(e){}}
    if(gpEdge(4))gpHot(-1);if(gpEdge(5))gpHot(1);
    if(gpEdge(9))gpTap('KeyE');if(gpEdge(8))gpTap('KeyM');if(gpEdge(6))gpTap('KeyJ');
    if(gpEdge(11)){const d=$('btnDecor');if(d&&!d.hidden&&gpShown(d))gpClick(d);}
    // the right stick turns you to face a square without stepping onto it
    if(Math.hypot(rx,ry)>.5&&!m&&!P.anim){const L=Math.hypot(rx,ry);P.fx=rx/L;P.fz=ry/L;P.dir=dirOf(rx,ry);}},
  // the menus and panels
  ui(p,dt,lx,ly,rx,ry){GP.chk-=dt;if(GP.chk<=0||((!GP.focus||!GP.focus.isConnected)&&GP.chk<=.12)){GP.chk=.2;const C=gpCands();const k=GP.root?GP.root.id||GP.root.className:'-';
      const have=GP.focus&&C.some(c=>c.el===GP.focus);
      // the same panel drew itself again (a purchase, a meal): stay where you were, giving it a moment to finish drawing;
      // a new panel starts at its own first choice
      if(!have){let n=null;if(k===GP.rootKey&&GP.lastR&&C.length){let bd=90;for(const c of C){const d=Math.hypot(c.r.left+c.r.width/2-GP.lastR[0],c.r.top+c.r.height/2-GP.lastR[1]);if(d<bd){bd=d;n=c.el;}}}
        if(!n&&k===GP.rootKey&&GP.lastR&&(GP.lostT=(GP.lostT||0)+.2)<.5){GP.chk=.1;}else{GP.lostT=0;gpFocus(n||(C.length?gpDefault(C):null));}}
      // something new to choose in a talk (what to give): the frame goes to it
      else{GP.lostT=0;if(k==='talk'&&GP.newIn){const nw=C.filter(c=>!GP.newIn.has(c.el));if(nw.length&&nw.length<16)gpFocus(nw[0].el);}}
      GP.newIn=null;GP.rootKey=k;}
    const d=gpDir(p,dt,true);if(d)gpNav(d[0],d[1]);
    if(gpEdge(0)){if(GP.focus)gpA();else gpTap('Space');}
    if(gpEdge(1))gpBack();
    if(gpEdge(3))gpY();
    if(gpEdge(2)){if(gpMapOn())gpMapMark();}
    if(gpEdge(4))gpTabs(-1);if(gpEdge(5))gpTabs(1);
    if(gpMapOn()){if(gpEdge(6)){const b=$('mzOut');b&&gpClick(b);}if(gpEdge(7)){const b=$('mzIn');b&&gpClick(b);}}
    if(gpEdge(9)){const bag=$('bag');if(bag&&!bag.hidden)gpTap('KeyE');else if(GP.root&&GP.root.id!=='title')gpBack();}
    if(gpEdge(8)&&gpMapOn())gpTap('KeyM');
    if(rx||ry)gpScrollAnalog(rx,ry,dt);},
  // a cutscene, a close look at something, a scene with someone
  cut(p,dt){if(gpEdge(0))gpTap('Space');
    if(gpEdge(1)){if((typeof RU!=='undefined'&&RU.on)||(typeof MIR!=='undefined'&&MIR.on))gpTap('Escape');else gpTap('Space');}
    if(gpEdge(9)){const sk=$('skip');if(sk&&gpShown(sk))gpClick(sk);else gpTap('Escape');}},
  // pointing out who goes, on the church steps
  pick(p,dt){const T=ST37.tags||[];const d=gpDir(p,dt,true);if(d&&d[0]){GP.pick=(GP.pick+d[0]+T.length)%T.length;SFX.click&&SFX.click();}if(GP.pick>=T.length)GP.pick=0;
    if(gpEdge(0)){gpTap('Digit'+(GP.pick+1),String(GP.pick+1));}if(gpEdge(1))gpTap('Space');},
  // setting something down: the stick moves it, A places it, B puts it away, Y turns it, X changes its wood
  place(p,dt,lx,ly){const bm=typeof BM!=='undefined'&&BM.on;try{if(PLACE.x==null){const [x,z]=placeSpot();PLACE.x=x;PLACE.z=z;}}catch(e){}
    if(lx||ly){const v=bm?6:3;PLACE.manual=true;PLACE.x+=lx*v*dt;PLACE.z+=ly*v*dt;GP.placeMv=true;
      if(!bm){try{const X=sx(PLACE.x),Y=sz(PLACE.z);if(X<20)PLACE.x+=(20-X)/PPM;if(X>VW-20)PLACE.x-=(X-VW+20)/PPM;if(Y<30)PLACE.z+=(30-Y)/PPM;if(Y>VH-20)PLACE.z-=(Y-VH+20)/PPM;}catch(e){}}}
    else if(GP.placeMv){GP.placeMv=false;const g=bm?2:8;PLACE.x=Math.round(PLACE.x*g)/g;PLACE.z=Math.round(PLACE.z*g)/g;}
    const d=gpDir(p,dt,false);if(d){const s=bm?.5:.25;PLACE.manual=true;PLACE.x=Math.round((PLACE.x+d[0]*s)/s)*s;PLACE.z=Math.round((PLACE.z+d[1]*s)/s)*s;SFX.page&&SFX.page();}
    if(gpEdge(0))gpTap('Enter');if(gpEdge(1)||gpEdge(9))gpTap('Escape');if(gpEdge(3)||gpEdge(5)||gpEdge(4))gpTap('KeyR');if(gpEdge(2))gpTap('KeyF');},
  // the making games (and the festival's): A, X or the right trigger is the mouse button / Space, the stick steers
  mg4(p,dt,lx,ly,rx,ry){gpHoldKey('Space',gpDown(0)||gpDown(2)||gpDown(7));const I=window.__mg4I,cur=window.__mg4cur;const ptr=!!(cur&&GP_PTR.has(cur.__gpk));
    const hx=ptr?lx+rx:rx,hy=ptr?ly+ry:ry;
    if(I&&(hx||hy)){I.x=Math.max(0,Math.min(320,(I.x==null?160:I.x)+hx*170*dt));I.y=Math.max(0,Math.min(180,(I.y==null?90:I.y)+hy*170*dt));I.ptrT=performance.now();GP.hand.on=true;}
    if(ptr){GP.hand.on=true;gpArrows(0,0,false);}
    else{const dl=gpDown(14)||lx<-.5,dr=gpDown(15)||lx>.5,du=gpDown(12)||ly<-.5,dd=gpDown(13)||ly>.5;gpArrows(dl,dr,du,dd);
      if(I&&(lx||ly)){I.ax=lx;I.ay=ly;GP.mgAx=true;}else if(GP.mgAx&&I){GP.mgAx=false;I.ax=(dr?1:0)-(dl?1:0);I.ay=(dd?1:0)-(du?1:0);}}
    if(gpEdge(9))gpTap('Escape');},
  cg(p,dt,lx,ly){gpHoldKey('Space',gpDown(0)||gpDown(2)||gpDown(7));gpArrows(gpDown(14)||lx<-.5,gpDown(15)||lx>.5,gpDown(12)||ly<-.5,gpDown(13)||ly>.5);if(gpEdge(9)||gpEdge(1))gpTap('Escape');},
  // the catch: hold to raise the bar
  fish(p){gpHoldKey('Space',gpDown(0)||gpDown(2)||gpDown(7));}};
function gpArrows(l,r,u,d){gpHoldKey('ArrowLeft',!!l);gpHoldKey('ArrowRight',!!r);gpHoldKey('ArrowUp',!!u);gpHoldKey('ArrowDown',!!d);}
// the bumpers step along the toolbar, the way the mouse wheel does (food is picked, never eaten, until you press Y)
function gpHot(d){try{if(S.mode!=='play'||S.paused)return;const n=slotsVisible(),i=((S.slotSel+(d>0?1:n-1))%n+n)%n;S.slotSel=-1;slotUse(i);if(S.slotSel<0)S.slotSel=i;}catch(e){}}

// ---------------------------------------------------------------- drawing: the frame, the lifted item, the hand, the cross, the chooser
function gpHideAll(){for(const id of ['gpRing','gpHand','gpGhost','gpPick'])gpCss($(id),'display','none');const c=$('gpCross');if(c)gpCss(c,'display','none');}
function gpDraw(){const pad=GP.mode==='pad';const ring=$('gpRing');
  if(pad&&GP.ctx==='ui'&&GP.focus&&GP.focus.isConnected){const r=GP.focus.getBoundingClientRect();if(r.width>0){gpCss(ring,'display','block');GP.lastR=[r.left+r.width/2,r.top+r.height/2];
      gpCss(ring,'transform',`translate(${Math.round(r.left)-1}px,${Math.round(r.top)-1}px)`);gpCss(ring,'width',Math.round(r.width)+2+'px');gpCss(ring,'height',Math.round(r.height)+2+'px');}
    else gpCss(ring,'display','none');}else gpCss(ring,'display','none');
  if(pad&&GP.ctx==='ui')gpInvShow();else gpCss($('gpGhost'),'display','none');
  // the hand over the making game's picture
  const hd=$('gpHand'),I=window.__mg4I,cv=$('mg4C');if(pad&&GP.ctx==='mg4'&&GP.hand.on&&I&&cv&&gpShown(cv)){const r=cv.getBoundingClientRect();gpCss(hd,'display','block');
      gpCss(hd,'transform',`translate(${Math.round(r.left+(I.x/320)*r.width)-5}px,${Math.round(r.top+(I.y/180)*r.height)-2}px)`);}
  else{gpCss(hd,'display','none');if(GP.ctx!=='mg4')GP.hand.on=false;}
  // the cross in the middle of the map while you're marking a place
  const mw=$('mapWrap');if(mw){let c=$('gpCross');const want=pad&&GP.ctx==='ui'&&gpMapOn()&&typeof MMK!=='undefined'&&MMK.mode;
    if(want&&!c){c=document.createElement('div');c.id='gpCross';c.innerHTML=GP_CROSS;c.firstChild.style.cssText='width:100%;height:100%';}
    if(c){if(want){const host=mw.parentNode;if(c.parentNode!==host){host.style.position=host.style.position||'relative';host.appendChild(c);}
        gpCss(c,'left',Math.round(mw.offsetLeft+mw.clientWidth/2)+'px');gpCss(c,'top',Math.round(mw.offsetTop+mw.clientHeight/2)+'px');gpCss(c,'display','block');}else gpCss(c,'display','none');}}
  // who to point at
  const pk=$('gpPick');if(pad&&GP.ctx==='pick'){const T=ST37.tags||[];const t=T[GP.pick];const h=t?`${gpFmt('{DP}')} <b>${t.t}</b> · ${gpFmt('{A}')} point · ${gpFmt('{B}')} say nothing`:'';
    if(pk._h!==h){pk._h=h;pk.innerHTML=h;}gpCss(pk,'display',h?'block':'none');}else gpCss(pk,'display','none');}

// ---------------------------------------------------------------- the square you'll work, and what's in front of you, marked while you play on the pad
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld.apply(this,arguments);if(GP.mode!=='pad'||GP.ctx!=='play')return;
  const now=performance.now();if(now-GP.ft>100){GP.ft=now;try{const T=(typeof busy==='function'&&busy())?null:frontTarget();GP.front=T&&T.kind!=='tile'&&T.kind!=='water'?T:null;}catch(e){GP.front=null;}}
  const T=GP.front;if(!T||!isFinite(T.x)||!isFinite(T.z))return;
  D.push({z:T.z+.01,mind:1,draw(){nightUI(()=>{const X=Math.round(sx(T.x)),Y=Math.round(sz(T.z));const w=T.kind==='mob'?12:9,top=T.kind==='mob'?24:18;
    const x0=X-w,x1=X+w,y0=Y-top,y1=Y+3,g=ctx2;
    const corner=(x,y,a,b,c,t)=>{g.fillStyle=c;g.fillRect(a>0?x-t:x-4-t+1,y-t,5+t,1+2*t);g.fillRect(x-t,b>0?y-t:y-4-t+1,1+2*t,5+t);};
    for(const [c,t] of [['#1a0e06',1],['#ffd27a',0]]){corner(x0,y0,1,1,c,t);corner(x1,y0,-1,1,c,t);corner(x0,y1,1,-1,c,t);corner(x1,y1,-1,-1,c,t);}});}});};}   // (t362) the frame is drawn over the dark

// ---------------------------------------------------------------- the hints and tips say the pad's buttons while you're on it
const GP_TUT={move:'Walk with {LS} or {DP}. Hold {B} to run, or press {LS} in to keep running.',
  act:'To talk, open, read or pick something up, face it and press {A}. Press {A} at the note nailed to the cabin door.',
  menu:'Open the menu with {START} to see your backpack. {BACK} opens the map.',
  drag:'The top row is your toolbar. {A} lifts an item and {A} again sets it down; set it on the bin to throw it away. {B} closes the menu.',
  till:'Tools work like this: pick a tool with {LB} {RB}, face the spot and press {X}. Pick the <b>hoe</b> and dig a square of the brown field by the cabin. Hold {X} to keep digging.',
  plant:'Now pick your <b>seeds</b> with {LB} {RB} and press {X} at the dark tilled soil to plant them.',
  water:'Seedlings need water every day. Pick the <b>watering can</b> and press {X} at each one. The number on the can is how much is left. Refill it at the stone <b>well</b> beside the cabin ({A}), or press {X} facing the pond with the can.',
  fish:'Pick your <b>rod</b>, face the water and hold {X}; let go to cast. Little twitches are only nibbles: wait until the float is pulled right under, then press {X} to strike. Hold {A} to reel in; let go when it runs or jumps.',
  map:'The <b>Map</b> tab in the menu shows the whole valley and where you are. Press {BACK}.',
  ship:'Crops and fish go in the shipping bin by the cabin: {A} puts one in, {Y} the whole stack. The truck takes it all overnight and you’re paid in the morning.'};
if(typeof TUT!=='undefined')for(const st of TUT){const pt=GP_TUT[st.id];if(!pt)continue;const t0=st.text;
  st.text=()=>{if(!gpPadMode())return t0();if(st.id==='act'&&typeof HOST!=='undefined'&&HOST.role==='guest')return gpFmt('To talk, open or pick something up, face it and press {A}. Say hello to someone, or open the door of your cabin.');return gpFmt(pt);};}
// the words a keyboard or a mouse would be told, and what the pad says instead
const GP_WORDS=[[/ Press <b>[0-9=\-]<\/b>\./g,' Pick it with {LB} {RB}.'],[/\b(?:Tap|Click) a (dent|nut)\b/g,'Point {LS} at a $1 and press {A}'],[/\s*\(Space works too\.\)/g,''],
  [/\b(?:[Cc]lick|[Tt]ap) or press Space\b/g,'Press {A}'],[/\bwith the mouse \(or hold Space\)/g,'by holding {A}'],[/\(or hold Space\)/g,'(or hold {A})'],
  [/hold the mouse button and move along it \(or hold Space and steer with W\/S\/A\/D\)/g,'hold {A} and steer with {LS}'],[/\(Keys: hold Space to cut, W\/S to steer\.\)/g,'(Hold {A} to cut, {LS} to steer.)'],
  [/move the mouse to the side you want it to go while holding \(or use A \/ D\)/g,'push {LS} the way you want it to go'],[/move the mouse up\/down \(or W\/S\)/g,'push {LS} up and down'],
  [/move the mouse left and right while holding, or tap A and D in turn/g,'push {LS} left and right in turn'],[/\(or use A\/D and W\/S\)/g,'(or {LS})'],[/move the mouse, or A\/D/g,'{LS}'],
  [/click a side, or A \/ D/g,'{LS} left or right'],[/left or right side \(or A \/ D\)/g,'left or right side with {LS}'],[/\(or (?:use )?A \/ D\)/g,'(or {LS})'],[/\(or W\/S\)/g,'(or {LS})'],
  [/\b([Hh]old)( to\b|, then\b| and\b|:)/g,'$1 {A}$2'],[/\bTap\b(?! A)/g,'Press {A}'],[/\btap\b(?! A)/g,'press {A}'],[/\bClick\b/g,'Press {A}'],[/\bclick\b/g,'press {A}'],
  [/\bDrag\b/g,'Hold {A} and move'],[/\bdrag\b/g,'move'],[/\bSpace\b/g,'{A}']];
function gpWords(s){let o=String(s);for(const [re,to] of GP_WORDS)o=o.replace(re,to);return o;}
// the placing bar: the stick moves it, A places it, B puts it away, Y turns it, X changes its wood
const GP_PLACE=[[/(?:click|tap) where it goes, or drag it\. Then <b>Place<\/b> \((?:or Enter, or double-(?:click|tap)|or (?:tap|click) it twice)\)\.(?: Esc cancels\.)?/g,'move it with {LS} or {DP}, then {A} places it. {B} puts it away.'],
  [/(?:click|tap) or drag it into place, or nudge it with the arrow keys/g,'move it with {LS}, or nudge it with {DP}; {A} places it, {B} puts it away'],[/drag it into place(?!,)/g,'move it with {LS}, or nudge it with {DP}; {A} places it, {B} puts it away'],
  [/ <b>R<\/b> turns it\./g,' {Y} turns it.'],[/ <b>Rotate<\/b> turns it\./g,' {Y} turns it.'],[/ <b>F<\/b> changes the finish\./g,' {X} changes the finish.'],[/ <b>Finish<\/b> changes the wood\./g,' {X} changes the wood.']];
const GP_SPOTS={placeHint:s=>{let o=s;for(const [re,to] of GP_PLACE)o=o.replace(re,to);return o;},mg4H:s=>gpWords(s),cgH:s=>gpWords(s),
  invTip:s=>s.replace('Tap an item to see it. Drag to move it; the top row is your toolbar.','{A} lifts an item, {A} again sets it down; the top row is your toolbar. {Y} eats or holds it.').replace('Click an item to see it. Drag to move it; the top row is your toolbar.','{A} lifts an item, {A} again sets it down; the top row is your toolbar. {Y} eats or holds it.'),
  sbHint:s=>s.replace(/^(Click|Tap) to put one in\..*$/,'{A} puts one in, {Y} the whole stack. {A} on something in the bin takes it back out.'),
  mapBar:s=>s.replace(/(Tap|Click) the map where you want the mark\./,'Move the map with {RS}; {X} marks the middle.').replace(/Drag to look around\./,'Look around with {RS}; {LT} {RT} zoom.')};
function gpFixSpot(el,f){if(!el||!gpPadMode())return;const h=el.innerHTML;if(!/(Space|[Cc]lick|[Tt]ap|[Dd]rag|Drag to look|<b>[RF]<\/b>|<b>Rotate<\/b>|<b>Finish<\/b>|\bHold to|\bhold to|Esc|A \/ D|W\/S)/.test(h))return;const o=gpFmt(f(h));if(o!==h)el.innerHTML=o;}
function gpFixAll(){for(const [id,f] of Object.entries(GP_SPOTS)){const el=$(id);if(el)gpFixSpot(id==='mapBar'?el.firstChild&&el.firstChild.nodeType===1?el.firstChild:el:el,f);}
  // a making game step that wants a hand moved says which stick moves it
  const mh=$('mg4H'),cur=window.__mg4cur;if(mh&&cur&&GP_PTR.has(cur.__gpk)&&typeof MG4!=='undefined'&&MG4.on&&!mh.querySelector('.gphand')){mh.insertAdjacentHTML('beforeend',` <span class="gphand">${gpFmt('{LS} moves your hand.')}</span>`);}
  const fh=document.querySelector('#fishMG .fhint');if(fh)gpFixSpot(fh,gpWords);const fg=document.querySelector('#fGame .h');if(fg)gpFixSpot(fg,gpWords);}
{let q=false;new MutationObserver(()=>{if(!gpPadMode()||q)return;q=true;requestAnimationFrame(()=>{q=false;gpFixAll();});}).observe(document.body,{childList:true,subtree:true,characterData:true});}
// a toast is plain text: the pad's buttons go in by name there, and the bold tags some hints carried (shown as "<b>axe</b>") come out
const GP_TOAST=[[/ Press <b>[0-9=\-]<\/b>\./g,()=>` Pick it with ${gpName('lb')} and ${gpName('rb')}.`],[/ — (?:tap|click) again to eat/g,()=>` — ${gpName('y')} eats it`]];
{const _t=toast;toast=function(msg){if(typeof msg==='string'){let m=msg;if(gpPadMode())for(const [re,to] of GP_TOAST)m=m.replace(re,to);m=m.replace(/<\/?b>/g,'');if(m!==msg)arguments[0]=m;}return _t.apply(this,arguments);};}
// the line on the title screen, and the cutscene's Skip
const GP_TITLE='With a controller: {LS} walk · {B} run · {X} use your tool · {A} talk, open, pick up · {LB} {RB} pick a tool · {Y} eat · {START} menu · {BACK} map';
// the Skip buttons (a cutscene's, a making game's) wear the Menu button while you're on the pad
function gpSkipGlyph(){for(const id of ['skip','mg4Skip']){const sk=$(id);if(!sk)continue;const g=sk.querySelector('.gpg');const want=gpPadMode()?gpGlyph('start'):'';
  if(want&&!g)sk.insertAdjacentHTML('afterbegin',want);else if(!want&&g)g.remove();else if(g&&g.outerHTML!==want)g.outerHTML=want;}}
// (the Menu button already wears the Menu button's three bars, so only Decorate gets one)
function gpBadges(){for(const [id,k] of [['btnDecor','rs']]){const b=$(id);if(!b)continue;let g=b.querySelector('.gpbadge');const want=gpGlyph(k);
    if(!g){g=document.createElement('span');g.className='gpbadge';g.setAttribute('aria-hidden','true');b.appendChild(g);}if(g._k!==want){g._k=want;g.innerHTML=want;}}}
function gpPromptsChanged(){GP.ver++;gpBadges();try{if(typeof TUT_CUR!=='undefined'&&TUT_CUR&&$('tut')&&$('tut').style.display==='block')tutShow(TUT_CUR);}catch(e){}
  const h=$('pcHint');if(h){if(gpPadMode()){if(h.dataset.kb==null)h.dataset.kb=h.textContent;h.innerHTML=gpFmt(GP_TITLE);}else if(h.dataset.kb!=null){h.textContent=h.dataset.kb;delete h.dataset.kb;}}
  gpSkipGlyph();
  if(gpPadMode())gpFixAll();if($('gpCtl')&&gpShown($('gpCtl')))gpControls(true);}

// ---------------------------------------------------------------- a light rumble where the game shakes a phone (scares, a bite on the line, a hit)
function gpRumble(ms,strong,weak){if(!GP.cfg.rumble||GP.mode!=='pad')return;const p=gpPad();if(!p)return;
  try{const va=p.vibrationActuator;if(va&&va.playEffect){const r=va.playEffect(va.type||'dual-rumble',{startDelay:0,duration:Math.min(800,ms),strongMagnitude:strong,weakMagnitude:weak});if(r&&r.catch)r.catch(()=>{});}
    else if(p.hapticActuators&&p.hapticActuators[0]&&p.hapticActuators[0].pulse){const r=p.hapticActuators[0].pulse(strong,Math.min(800,ms));if(r&&r.catch)r.catch(()=>{});}}catch(e){}}
function gpVibe(pat){const L=Array.isArray(pat)?pat:[pat];let t=0;L.forEach((ms,i)=>{ms=+ms||0;if(i%2===0&&ms>0){const big=ms>=150;setTimeout(()=>gpRumble(ms,big?.85:.45,big?.6:.35),t);}t+=ms;});}
{const nv=navigator.vibrate?navigator.vibrate.bind(navigator):null;try{navigator.vibrate=function(p){try{gpVibe(p);}catch(e){}return nv?nv(p):false;};}catch(e){}}
setInterval(()=>{try{const h=S.hp;if(GP.hp!=null&&h<GP.hp-1.5&&S.mode==='play'){const now=performance.now();if(now-GP.hpT>400){GP.hpT=now;gpRumble(180,.6,.4);}}GP.hp=h;}catch(e){}},100);

// ---------------------------------------------------------------- the Controls page (in Settings), with the pad drawn in pixels
function gpPadPic(){const W=64,H=34,G=gpGrid(W,H);
  const inside=(x,y)=>{if(x>=11&&x<=52&&y>=6&&y<=19&&Math.hypot(Math.max(0,Math.abs(x-31.5)-17),Math.max(0,Math.abs(y-12.5)-3.5))<=4.2)return true;
    for(const cx of [15,48]){const dx=(x-cx)/9.5,dy=(y-18)/12;if(y>=9&&dx*dx+dy*dy<=1)return true;}return false;};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(inside(x,y)){const e=!inside(x-1,y)||!inside(x+1,y)||!inside(x,y-1)||!inside(x,y+1);G[y][x]=e?'k':(y>=24?'s':y<=8?'h':'f');}
  for(const [a,b] of [[13,21],[42,50]])for(let x=a;x<=b;x++){G[3][x]='k';G[4][x]=x===a||x===b?'k':'u';G[5][x]=x===a||x===b?'k':'u';}
  const disc=(cx,cy,r,c)=>{for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=Math.hypot(x,y);if(d<=r+.35)G[cy+y][cx+x]=d>r-.75?'k':c;}};
  disc(19,12,3,'t');disc(40,19,3,'t');G[11][18]='r';G[18][39]='r';
  for(let i=-3;i<=3;i++){G[19][25+i]='k';G[19+i][25]='k';}for(let i=-2;i<=2;i++){G[19][25+i]='d';G[19+i][25]='d';}
  for(const [k,cx,cy] of [['A',46,15],['B',49,12],['X',43,12],['Y',46,9]]){for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)G[cy+y][cx+x]=(Math.abs(x)+Math.abs(y)===2)?'k':k;}
  for(const x of [29,34])for(const y of [11,12]){G[y][x]='m';G[y][x+1]='m';}
  const ps=gpStyle()==='ps',nin=gpStyle()==='nin';
  const pal={k:'#1a0e06',f:'#5a4636',s:'#3e2f24',h:'#6e5644',u:'#7a6250',t:'#2a201a',r:'#4a3a30',d:'#a89480',m:'#c8b898',
    A:nin?'#e8dcc4':ps?GP_PSC.a:GP_COL.a[0],B:nin?'#e8dcc4':ps?GP_PSC.b:GP_COL.b[0],X:nin?'#e8dcc4':ps?GP_PSC.x:GP_COL.x[0],Y:nin?'#e8dcc4':ps?GP_PSC.y:GP_COL.y[0]};
  return gpSvg(G,pal,'A game controller','gpPic');}
const GP_MAP=[['On the farm',[['{LS} {DP}','Walk'],['{B}','Run (hold), or press {LS} in'],['{X} {RT}','Use your tool (hold to keep going)'],['{A}','Talk, open, read, pick up, harvest'],
    ['{LB} {RB}','Pick a tool or item'],['{Y}','Eat or use the item you hold'],['{RS}','Turn to face a square'],['{START}','Menu and backpack'],['{BACK}','Map'],['{LT}','Journal'],['{RS}','Press in: decorate, at home']]],
  ['Menus',[['{DP} {LS}','Move the frame'],['{A}','Choose; in the backpack, lift and set down'],['{B}','Back, close'],['{Y}','Eat or hold an item; ship a whole stack'],['{LB} {RB}','Change tab'],['{RS}','Scroll, move the map'],['{LT} {RT}','Map: zoom out, in'],['{X}','Map: mark the middle']]],
  ['Making, fishing, scenes',[['{A} {X} {RT}','The mouse button or Space: press, or hold'],['{LS} {DP}','Steer, or move your hand'],['{RS}','Move your hand'],['{START}','Making: give up and finish. Scenes: Skip, where there is one'],['{A}','Next line in a scene']]],
  ['Building and decorating',[['{LS} {DP}','Move it'],['{A}','Place it'],['{B}','Put it away'],['{Y} {LB} {RB}','Turn it'],['{X}','Change its finish']]]];
function gpControls(refresh){let p=$('gpCtl');if(!p){p=document.createElement('div');p.id='gpCtl';p.setAttribute('data-modal','');p.setAttribute('role','dialog');p.setAttribute('aria-label','Controller');
    p.addEventListener('click',e=>e.stopPropagation());p.addEventListener('keydown',e=>{if(e.key==='Escape'){p.style.display='none';}});document.body.appendChild(p);}
  if(refresh&&!gpShown(p))return;const pad=gpPad();const name=pad?(GP.style==='ps'?'PlayStation controller':GP.style==='nin'?'Nintendo controller':'controller'):'';
  const opt=(k,v,l)=>`<button class="opt${String(GP.cfg[k])===String(v)?' on':''}" data-gk="${k}" data-gv="${v}">${l}</button>`;
  const h=`<b class="hd">Controller</b><div class="st">${pad?`A ${name} is connected.`:'No controller yet. Plug one in, or pair it over Bluetooth, then press any button on it.'} Xbox, PlayStation and Switch Pro pads work, in a browser and in the desktop game.</div>
    <div class="pic">${gpPadPic()}</div>
    <div class="row">Rumble ${opt('rumble',true,'On')}${opt('rumble',false,'Off')}<span style="width:10px"></span>Buttons ${opt('style','auto','Match my pad')}${opt('style','xbox','Xbox')}${opt('style','ps','PlayStation')}${opt('style','nin','Switch')}</div>
    ${GP_MAP.map(([t,L])=>`<div class="sec">${t}</div><div class="map">${L.map(([k,a])=>`<div><span class="k">${gpFmt(k)}</span><span>${gpFmt(a)}</span></div>`).join('')}</div>`).join('')}
    <small class="note">Text boxes (your name, a code, logging in) still take a keyboard, or the phone's own keyboard when you tap them.</small>
    <button class="btn" id="gpCtlDone">Done</button>`;
  if(p._h!==h){p._h=h;p.innerHTML=h;p.querySelectorAll('[data-gk]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const k=b.dataset.gk;let v=b.dataset.gv;if(k==='rumble')v=v==='true';
      GP.cfg[k]=v;gpSave();if(k==='style')gpPromptsChanged();gpControls();if(k==='rumble'&&v)gpRumble(160,.5,.4);}));
    $('gpCtlDone').addEventListener('click',e=>{e.stopPropagation();p.style.display='none';});}
  gpCss(p,'display','block');}
// Settings gets a Controller part: the Controls page, and rumble on or off
if(typeof dispPick==='function'){const _dp=dispPick;dispPick=function(){const r=_dp.apply(this,arguments);try{const d=$('dispPick');const done=$('dispClose');if(d&&done&&!d.querySelector('.gpsec')){
      const sec=document.createElement('div');sec.className='dsec gpsec';sec.textContent='Controller';const row=document.createElement('div');row.className='drow';
      row.innerHTML=`<button class="dopt" id="gpOpen"><b>Controls</b><small>buttons for a game pad</small></button><button class="dopt${GP.cfg.rumble?' on':''}" id="gpRum"><b>Rumble</b><small>${GP.cfg.rumble?'on':'off'}</small></button>`;
      done.before(sec,row);row.querySelector('#gpOpen').addEventListener('click',e=>{e.stopPropagation();d.style.display='none';gpControls();});
      row.querySelector('#gpRum').addEventListener('click',e=>{e.stopPropagation();GP.cfg.rumble=!GP.cfg.rumble;gpSave();const b=e.currentTarget;b.classList.toggle('on',GP.cfg.rumble);b.querySelector('small').textContent=GP.cfg.rumble?'on':'off';if(GP.cfg.rumble)gpRumble(160,.5,.4);});}}catch(e){}return r;};}
requestAnimationFrame(gpFrame);
