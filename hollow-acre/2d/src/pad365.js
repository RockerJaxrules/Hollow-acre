/* ================= t365: the controller drawn as the real pad you hold (owner: "it should use an actual controller layout either
   Xbox or PlayStation 5 depending on which your using ... The controllers should still be made with pixel art though they just
   need to look like there real controllers"). Two pads drawn here pixel by pixel, from their layouts, no photos and no logos:
   the Xbox Series controller (offset sticks, the left one high and the d-pad low, A B X Y in green, red, blue and yellow, View,
   Menu and Share, the bumpers and triggers, a plain round home button) and the DualSense (both sticks low, the d-pad top left,
   cross circle square triangle in their colours, the touchpad with its light bar, Create and Options, L1 R1 L2 R2, white over
   black, a plain round PS button). Every button the game asks for has its own glyph in each family. Which family is read from
   the pad in your hands (Sony's vendor 054c or a DualSense, DualShock, "Wireless Controller" or PlayStation name: PlayStation;
   anything else: Xbox), switched as soon as another pad is used, and the page only changes when the family does. Settings can
   pin it: Auto, Xbox or PlayStation. ================= */
const P65={fam:'',ver:0,act:{},lastIdx:-1};
// ---------------------------------------------------------------- which family a pad belongs to, from its id
function gpFamOf(id){const s=String(id||'').toLowerCase();
  if(/xbox|x-box|xinput|(^|[^0-9a-f])0*45e([^0-9a-f]|$)|vendor:\s*045e/.test(s))return 'xbox';   /* first: an Xbox pad calls itself "Xbox Wireless Controller" too */
  if(/(^|[^0-9a-f])0*54c([^0-9a-f]|$)|vendor:\s*054c|dualsense|dualshock|playstation|sony|(^|[^a-z])wireless controller/.test(s))return 'ps';
  return 'xbox';}   /* (vendor 045e, "Xbox", XInput, and anything else: the Xbox glyphs) */
function gpFam(){const s=GP.cfg.style;return s==='ps'||s==='xbox'?s:(GP.style==='ps'?'ps':'xbox');}
if(GP.cfg.style!=='xbox'&&GP.cfg.style!=='ps')GP.cfg.style='auto';
gpStyle=function(){return gpFam();};
// the pad you're holding decides, and the prompts change only when the family does. With more than one pad, the one last pressed
// or pushed is the one in use; a pad switched on (or woken) while you play on another changes nothing until it's used
const p65Live=p=>{for(let i=0;i<p.buttons.length;i++){const b=p.buttons[i];if(b&&(typeof b==='object'?(b.pressed||b.value>.5):b>.5))return true;}for(let i=0;i<p.axes.length;i++)if(Math.abs(p.axes[i]||0)>.5)return true;return false;};
const p65Pads=()=>{try{return navigator.getGamepads?[...navigator.getGamepads()].filter(q=>q&&q.connected!==false):[];}catch(e){return [];}};
P65.cur=-1;
gpWho=function(p){if(!p)return;if(P65.cur>=0&&p.index!==P65.cur&&p65Pads().some(q=>q.index===P65.cur))return;if(GP.id===p.id)return;GP.id=p.id;const was=gpFam();GP.style=gpFamOf(p.id);if(gpFam()!==was)gpPromptsChanged();};
{const _gp=gpPad;gpPad=function(){const L=p65Pads();
  for(const p of L)if(p.index!==P65.cur&&p65Live(p)){P65.cur=p.index;break;}
  let p=L.find(q=>q.index===P65.cur);if(!p){P65.cur=-1;p=_gp();if(p)P65.cur=p.index;}
  if(p){GP.idx=p.index;gpWho(p);}return p||null;};}

// ---------------------------------------------------------------- the glyphs: one drawing per button, 11 px tall, in each family
const P65C={k:'#1a0e06',
  xbox:{f:'#3c3c44',s:'#26262c',h:'#62626e',d:'#2e2e35',a:'#5ec23c',b:'#e5483a',x:'#3f8ae6',y:'#f4c432',t:'#e8e0d0'},
  ps:{f:'#36333c',s:'#222027',h:'#5c5864',d:'#2b2930',a:'#82b6f4',b:'#f2645a',x:'#ec90cc',y:'#4fd2a2',t:'#e8e0d0'},
  gold:'#ffd27a',goldD:'#b8862a'};
const P65F={A:['.#.','#.#','###','#.#','#.#'],B:['##.','#.#','##.','#.#','##.'],X:['#.#','#.#','.#.','#.#','#.#'],Y:['#.#','#.#','.#.','.#.','.#.'],
  L:['#..','#..','#..','#..','###'],R:['##.','#.#','##.','##.','#.#'],T:['###','.#.','.#.','.#.','.#.'],S:['.##','#..','.#.','..#','##.'],
  1:['.#.','##.','.#.','.#.','###'],2:['##.','..#','.#.','#..','###'],3:['##.','..#','.#.','..#','##.']};
const P65S={cross:['#...#','.#.#.','..#..','.#.#.','#...#'],circle:['.###.','#...#','#...#','#...#','.###.'],square:['#####','#...#','#...#','#...#','#####'],
  triangle:['..#..','.#.#.','.#.#.','#...#','#####']};
function p65G(w,h){return Array.from({length:h},()=>Array(w).fill('.'));}
function p65St(G,rows,x,y,c){rows.forEach((r,j)=>{for(let i=0;i<r.length;i++)if(r[i]==='#'&&G[y+j]&&G[y+j][x+i]!==undefined)G[y+j][x+i]=c;});}
function p65Txt(G,t,y,c){const w=G[0].length,tw=t.length*4-1;let x=Math.floor((w-tw)/2);for(const ch of t){const f=P65F[ch];if(f)p65St(G,f,x,y,c);x+=4;}}
// a round button: an outline, a rim lit at the top left and in shade at the bottom right, a quiet face
function p65Disc(G,cx,cy,r,o){o=o||{};for(let y=Math.floor(cy-r-1);y<=Math.ceil(cy+r+1);y++)for(let x=Math.floor(cx-r-1);x<=Math.ceil(cx+r+1);x++){if(!G[y]||G[y][x]===undefined)continue;
    const d=Math.hypot(x-cx,y-cy);if(d>r+.5)continue;const e=d>r-.5,u=(x-cx)+(y-cy);G[y][x]=e?'k':(d>r-1.5?(u<-1.5?(o.h||'h'):u>1.5?(o.s||'s'):(o.f||'f')):(o.f||'f'));}}
// a pill (bumpers, small buttons): w x h, rounded ends
function p65Pill(G,x0,y0,w,h,o){o=o||{};const r=Math.min(h,w)/2;for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){
    const cx=Math.min(Math.max(x+.5,x0+r),x0+w-r),cy=Math.min(Math.max(y+.5,y0+r),y0+h-r),d=Math.hypot(x+.5-cx,y+.5-cy);if(d>r)continue;
    const edge=d>r-1;G[y][x]=edge?'k':(y===y0+1||x===x0+1&&y<y0+h-2?(o.h||'h'):y===y0+h-2?(o.s||'s'):(o.f||'f'));}}
// a trigger seen from the front: a rounded top, square shoulders below
function p65Trig(G,x0,y0,w,h,o){o=o||{};for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const top=y-y0<4,dx=Math.min(x-x0,x0+w-1-x),cut=top&&dx<3-(y-y0)&&!(dx===2&&y-y0>=1)&&!(dx===1&&y-y0>=2)&&!(dx===0&&y-y0>=3);
    if(cut)continue;const ox=x===x0||x===x0+w-1||y===y0+h-1||(top&&(dx<=3-(y-y0)));G[y][x]=ox?'k':(y===y0+1||(y<y0+4&&dx<=4-(y-y0))?(o.h||'h'):y===y0+h-2?(o.s||'s'):(o.f||'f'));}}
const P65_GC={};
function p65Glyph(k,fam){fam=fam||gpFam();const key=fam+':'+k;if(P65_GC[key])return P65_GC[key];const C=P65C[fam],ps=fam==='ps';let G,lab;
  const face=n=>{G=p65G(11,11);p65Disc(G,5,5,5);};
  if(/^[abxy]$/.test(k)){face();if(ps){const sh={a:'cross',b:'circle',x:'square',y:'triangle'}[k];p65St(G,P65S[sh],3,3,'c');lab={cross:'Cross',circle:'Circle',square:'Square',triangle:'Triangle'}[sh]+' button';}
    else{p65St(G,P65F[k.toUpperCase()],4,3,'c');lab=k.toUpperCase()+' button';}
    return P65_GC[key]=gpSvg(G,{k:P65C.k,f:C.f,s:C.s,h:C.h,c:C[k]},lab,'gpg');}
  if(k==='lb'||k==='rb'){const t=ps?(k==='lb'?'L1':'R1'):(k==='lb'?'LB':'RB');G=p65G(15,11);p65Pill(G,0,1,15,9);p65Txt(G,t,3,'c');lab=t+' button';}
  else if(k==='lt'||k==='rt'){const t=ps?(k==='lt'?'L2':'R2'):(k==='lt'?'LT':'RT');G=p65G(13,11);p65Trig(G,0,0,13,11);p65Txt(G,t,4,'c');lab=t+' trigger';}
  else if(/^(ls|rs|l3|r3)$/.test(k)){const L=k[0]==='l'?'L':'R',press=k[1]==='3';G=p65G(11,11);
    if(!press){p65Disc(G,5,5,5,{f:'d',h:'h',s:'s'});p65Disc(G,5,5,3.6,{f:'f',h:'h',s:'d'});p65St(G,P65F[L],4,3,'c');lab=(L==='L'?'Left':'Right')+' stick';}
    else{for(const [x,y] of [[3,0],[4,1],[5,2],[6,1],[7,0]])G[y][x]='g';p65Disc(G,5,6.5,4.2,{f:'d',h:'h',s:'s'});p65Disc(G,5,6.5,2.6,{f:'f',h:'f',s:'d'});G[6][5]='c';
      lab=(L==='L'?'Left':'Right')+' stick, pressed in ('+(ps?L+'3':L+'S')+')';}}
  else if(/^dp[udlr]?$/.test(k)){const dir=k[2]||'';G=p65G(11,11);
    if(!ps){p65Disc(G,5,5,5,{f:'d',h:'d',s:'d'});const X=(x,y)=>(x>=4&&x<=6&&y>=1&&y<=9)||(y>=4&&y<=6&&x>=1&&x<=9);   // the Series d-pad: a cross in a shallow round dish
      for(let y=0;y<11;y++)for(let x=0;x<11;x++){if(X(x,y)){G[y][x]=(y===1||x===1||(x===4&&(y<4||y>6))||(y===4&&(x<4||x>6)))?'h':(y===9||x===9||(x===6&&(y<4||y>6))||(y===6&&(x<4||x>6)))?'s':'f';}
        else if(G[y][x]!=='.'&&(X(x+1,y)||X(x-1,y)||X(x,y+1)||X(x,y-1)))G[y][x]='k';}
      for(const [x,y] of [[4,0],[5,0],[6,0],[0,4],[0,5],[0,6],[4,10],[5,10],[6,10],[10,4],[10,5],[10,6]])G[y][x]='k';}
    else{const arm=(pts,c)=>{for(const [x,y] of pts)G[y][x]=c;};
      const U=[[4,0],[5,0],[6,0],[3,1],[3,2],[3,3],[7,1],[7,2],[7,3],[4,4],[6,4],[5,5]],Uf=[[4,1],[5,1],[6,1],[4,2],[5,2],[6,2],[4,3],[5,3],[6,3],[5,4]];
      const rot=(L,r)=>L.map(([x,y])=>r==='u'?[x,y]:r==='d'?[x,10-y]:r==='l'?[y,x]:[10-y,x]);
      for(const r of ['u','d','l','r']){arm(rot(U,r),'k');arm(rot(Uf,r),'f');const lit=rot([[4,1],[5,1],[6,1]],r);if(r==='u'||r==='l')arm(lit,'h');}}
    if(dir){const map={u:[[4,1],[5,1],[6,1],[4,2],[5,2],[6,2],[4,3],[5,3],[6,3]],d:[[4,7],[5,7],[6,7],[4,8],[5,8],[6,8],[4,9],[5,9],[6,9]],l:[[1,4],[1,5],[1,6],[2,4],[2,5],[2,6],[3,4],[3,5],[3,6]],r:[[7,4],[7,5],[7,6],[8,4],[8,5],[8,6],[9,4],[9,5],[9,6]]}[dir];
      for(const [x,y] of map)if(G[y][x]!=='k')G[y][x]='o';}
    lab=dir?'D-pad '+{u:'up',d:'down',l:'left',r:'right'}[dir]:'D-pad';
    return P65_GC[key]=gpSvg(G,{k:P65C.k,f:C.f,s:C.s,h:C.h,d:C.d,o:P65C.gold},lab,'gpg');}
  else if(k==='start'||k==='back'){
    if(!ps){G=p65G(11,11);p65Disc(G,5,5,5);if(k==='start'){for(const y of [3,5,7])for(let x=3;x<=7;x++)G[y][x]='c';lab='Menu button';}
      else{for(let y=3;y<=6;y++)for(let x=2;x<=5;x++)if(y===3||y===6||x===2||x===5)G[y][x]='c';for(let y=4;y<=7;y++)for(let x=5;x<=8;x++)if(y===4||y===7||x===5||x===8)G[y][x]='c';lab='View button';}}
    else{G=p65G(7,11);p65Pill(G,0,0,7,11);if(k==='start'){for(const y of [3,5,7])for(let x=2;x<=4;x++)G[y][x]='c';lab='Options button';}
      else{for(const [x,y] of [[3,3],[3,4],[3,5],[3,6],[3,7],[1,4],[2,5],[5,4],[4,5]])G[y][x]='c';lab='Create button';}}}
  else if(k==='home'){G=p65G(11,11);p65Disc(G,5,5,5,{f:'w',h:'v',s:'u'});lab=ps?'PS button':'Home button';}
  else return '';
  return P65_GC[key]=gpSvg(G,{k:P65C.k,f:C.f,s:C.s,h:C.h,d:C.d,c:C.t,g:P65C.gold,o:P65C.gold,w:'#cfcac0',v:'#f4f0e8',u:'#9a948a'},lab,'gpg');}
gpGlyph=function(k,big){return p65Glyph(k);};
gpFmt=function(s){return String(s).replace(/\{(A|B|X|Y|LB|RB|LT|RT|LS|RS|L3|R3|DP|DPU|DPD|DPL|DPR|START|BACK|HOME)\}/g,(m,k)=>p65Glyph(k.toLowerCase()));};
gpName=function(k){if(gpFam()==='ps')return {a:'Cross',b:'Circle',x:'Square',y:'Triangle',lb:'L1',rb:'R1',lt:'L2',rt:'R2',start:'Options',back:'Create',ls:'the left stick',rs:'the right stick',l3:'L3',r3:'R3',home:'PS'}[k]||k.toUpperCase();
  return {start:'Menu',back:'View',ls:'the left stick',rs:'the right stick',l3:'LS (press in)',r3:'RS (press in)',home:'Home'}[k]||k.toUpperCase();};
// the help page: a stick pressed in has its own glyph now
for(const [,L] of GP_MAP)for(const r of L){if(r[1]==='Run (hold), or press {LS} in')r[1]='Run (hold), or press {L3}';if(r[0]==='{RS}'&&/^Press in: decorate/.test(r[1])){r[0]='{R3}';r[1]='Decorate, at home';}}
{const css=document.createElement('style');css.textContent=`.gpg{height:22px;vertical-align:-6px}.gpgb{height:22px}.gpbadge .gpg{height:11px}@media (max-height:500px){.gpbadge .gpg{height:11px}}
body.gp-pad #placeBar{flex-wrap:wrap}body.gp-pad #placeBar>span{flex:1 1 100%}   /* (with a pad the hint carries the buttons' pictures: give it the whole row, the buttons under it) */
#gpCtl .pic svg{width:288px;max-width:none}@media (max-width:330px),(max-height:460px){#gpCtl .pic svg{width:192px}}`;document.head.appendChild(css);}
// ---------------------------------------------------------------- the two pads, 96 x 64, lit from the top left
// a body: the shape's own pixels shaded by how far the edge is toward the light (up-left) and away from it (down-right)
function p65Body(G,inside,ramp,opt){opt=opt||{};const W=G[0].length,H=G.length;const IN=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&inside(x,y);
  const run=(x,y,dx,dy)=>{let n=0;while(n<6&&IN(x+dx*(n+1),y+dy*(n+1)))n++;return n;};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!IN(x,y))continue;if(opt.skip&&opt.skip(x,y))continue;
    const up=Math.min(run(x,y,0,-1),run(x,y,-1,-1)+1,run(x,y,-1,0)+1),dn=Math.min(run(x,y,0,1),run(x,y,1,1)+1,run(x,y,1,0)+1);
    let c=up===0?ramp[4]:up<=2?ramp[3]:dn===0?ramp[0]:dn<=2?ramp[1]:ramp[2];if(opt.tone)c=opt.tone(x,y,c,up,dn)||c;G[y][x]=c;}
  // the outline: a darker version of the body's own colour, lighter where it faces the light (top and left)
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(IN(x,y)||(opt.skip&&opt.skip(x,y)))continue;if(!(IN(x+1,y)||IN(x-1,y)||IN(x,y+1)||IN(x,y-1)))continue;
    G[y][x]=(IN(x+1,y)||IN(x,y+1))&&!IN(x-1,y)&&!IN(x,y-1)?(opt.ol||'k'):(opt.od||'k');}}
const p65Ell=(x,y,cx,cy,rx,ry,a)=>{const c=Math.cos(a||0),s=Math.sin(a||0),dx=x+.5-cx,dy=y+.5-cy,u=dx*c+dy*s,v=-dx*s+dy*c;return (u/rx)**2+(v/ry)**2<=1;};
const p65SE=(x,y,cx,cy,a,b,n)=>Math.abs((x+.5-cx)/a)**n+Math.abs((y+.5-cy)/b)**n<=1;
// a bumper: a band of its own on the shoulder, following the body's top edge, a lit top, a dark seam under it
function p65Bumper(G,body,x0,x1,K){for(let x=x0;x<=x1;x++){let t=0;while(t<G.length&&!body(x,t))t++;if(t>=G.length)continue;const end=x===x0||x===x1;
    G[t-2][x]=K.o;G[t-1][x]=end?K.o:K.hi;G[t][x]=end?K.o:K.mid;G[t+1][x]=end?K.o:K.lo;G[t+2][x]=K.o;}}
// a trigger seen from the front, behind its bumper: a low wedge rising toward the outer end, so only its corner peeks over the band
function p65Wedges(G,body,L,ramp){for(const [x0,x1,side] of L){const top=x=>{let t=0;while(t<G.length&&!body(x,t))t++;return t;};
    const xi=side<0?x1:x0,xo=side<0?x0+1:x1-1,yi=top(xi)-3,yo=Math.min(top(xo),top(xi))-7;   // a straight top edge, rising toward the outer end
    const span=Math.abs(xo-xi)+1,rise=yi-yo;const inside=(x,y)=>{if(x<Math.min(xi,xo)||x>Math.max(xi,xo))return false;const yt=yi-Math.floor((Math.abs(x-xi)+.5)*rise/span);return y>=yt&&y<=top(x)-1;};
    p65Body(G,inside,ramp,{ol:'ol',od:'k'});}}
// a stick seen from above: the well round it, the cap's rim lit at the top left, its dished top dark with a lit crescent low right
function p65Stick(G,cx,cy,w){p65Disc(G,cx,cy,7.4,{f:w[0],h:w[1],s:w[0]});
  for(let y=-6;y<=6;y++)for(let x=-6;x<=6;x++){const d=Math.hypot(x+.5-.5,y+.5-.5),X=Math.round(cx+x),Y=Math.round(cy+y),u=x+y;if(d>5.6)continue;
    let c=d>4.9?'k':d>3.6?(u<-1?'c4':u>1.5?'c0':'c2'):(u>1.2&&d>1.8?'c3':'c1');G[Y][X]=c;}}
// a face button: a round cap, its letter or symbol, a 1 px glint at the top left
function p65Face(G,cx,cy,r,col,mark){p65Disc(G,cx,cy,r,{f:col+'2',h:col+'3',s:col+'1'});if(mark)p65St(G,mark,Math.round(cx-(mark[0].length-1)/2),Math.round(cy-(mark.length-1)/2),col+'0');G[Math.round(cy-2)][Math.round(cx-2)]='gl';}
function p65PadArt(fam){const W=96,H=64,G=p65G(W,H),ps=fam==='ps';
  if(!ps){
    // ---- the Xbox Series controller: the triggers behind, the body, a bumper band on each shoulder
    const body=(x,y)=>{if(p65SE(x,y,48,26,36,13.5,2.8))return !(y>34&&p65Ell(x,y,48,61,16.5,17));for(const s of [-1,1])if(p65Ell(x,y,48+s*26,43,11.5,18,s*-.42))return !p65Ell(x,y,48,61,16.5,17);return false;};
    p65Wedges(G,body,[[15,36,-1],[60,81,1]],['t0','t1','t2','t3','t4']);
    p65Body(G,body,['b0','b1','b2','b3','b4'],{ol:'ol',od:'k',tone:(x,y,c,up)=>{if(c==='b2'&&p65Ell(x,y,30,19,20,6,-.12))return 'b3';if(x<40&&y>40&&(c==='b3'||c==='b4'))return y>50?'b2':(y%2?'b3':'b2');if(c==='b2'&&p65Ell(x,y,22,58,7,6,-.42))return 'b1';if(x>56&&y>34)return {b2:'b1',b3:'b2',b4:'b3'}[c];return null;}});
    p65Bumper(G,body,15,36,{o:'k',hi:'e4',mid:'e3',lo:'e2'});p65Bumper(G,body,60,81,{o:'k',hi:'e3',mid:'e2',lo:'e1'});
    p65Stick(G,27,26,['w0','w1']);p65Stick(G,59,40,['w0','w1']);
    // the d-pad: a cross standing in a round dish
    p65Disc(G,37,40,6.4,{f:'w0',h:'w1',s:'w0'});for(let i=-5;i<=5;i++)for(let j=-1;j<=1;j++){G[40+i][37+j]='p2';G[40+j][37+i]='p2';}
    for(let i=-5;i<=5;i++){if(i<-1||i>1){G[40+i][36]='p3';G[40+i][38]='p1';G[39][37+i]='p3';G[41][37+i]='p1';}}
    for(const [x,y] of [[36,35],[37,35],[38,35],[32,39],[32,40],[32,41]])G[y][x]='p4';for(const [x,y] of [[36,45],[37,45],[38,45],[42,39],[42,40],[42,41]])G[y][x]='p0';
    for(const [x,y] of [[35,34],[36,34],[37,34],[38,34],[39,34],[35,46],[36,46],[37,46],[38,46],[39,46],[31,38],[31,42],[43,38],[43,42]])if(G[y][x]==='w0'||G[y][x]==='w1')G[y][x]='k';
    // A B X Y in their colours, apart, each with a glint
    for(const [cx,cy,c] of [[70,19,'y'],[77,26,'r'],[70,33,'g'],[63,26,'u']]){p65Face(G,cx,cy,3.2,c,null);G[cy][cx]=c+'1';G[cy+1][cx]=c+'1';}
    // the home button: plain and round, a pale grey disc in a dark ring (not the brightest thing on the pad)
    p65Disc(G,48,15.5,5.2,{f:'w0',h:'w1',s:'w0'});p65Disc(G,48,15.5,3.9,{f:'h2',h:'h3',s:'h1'});G[13][46]='h4';
    // View and Menu, round, either side of the middle; Share, a small pill under the home button
    p65Disc(G,39,20,2.3,{f:'v2',h:'v3',s:'v1'});p65Disc(G,57,20,2.3,{f:'v2',h:'v3',s:'v1'});
    for(let y=24;y<=27;y++)for(let x=46;x<=50;x++){const c=(x===46||x===50)&&(y===24||y===27);if(c)continue;G[y][x]=(y===24||y===27||x===46||x===50)?'k':(x===47&&y===25)?'v3':y===26?'v1':'v2';}}
  else{
    // ---- the DualSense: white over black, the touchpad and its light bar, both sticks low
    const crotch=(x,y)=>p65Ell(x,y,48,73,17,17);
    const body=(x,y)=>{if(p65SE(x,y,48,24,38,13,3)&&!(y>32&&crotch(x,y)))return true;if(p65Ell(x,y,48,42,20,14)&&!crotch(x,y))return true;   /* the black centre runs down between the sticks to hold the PS button */for(const s of [-1,1])if(p65Ell(x,y,48+s*29,42,10.5,19,s*-.5)&&!crotch(x,y))return true;return false;};
    const black=(x,y)=>y>=27&&Math.abs(x+.5-48)<23-(y-27)*.35&&!crotch(x,y);
    p65Wedges(G,body,[[14,29,-1],[67,82,1]],['g0','g0','g1','g2','g2']);
    p65Body(G,body,['s0','s1','s2','s3','s4'],{ol:'ol',od:'od',tone:(x,y,c)=>{if(black(x,y))return {s0:'d0',s1:'d1',s2:'d2',s3:'d3',s4:'d3'}[c];
      if(c==='s2'&&p65Ell(x,y,17,57,7,6,-.5))return 's1';if(x>58&&y>30)return {s2:'s1',s3:'s2',s4:'s2'}[c];return null;}});
    for(let y=30;y<H;y++)for(let x=59;x<W;x++)if(G[y][x]==='ol')G[y][x]='od';
    for(let x=0;x<W;x++)for(let y=27;y<62;y++){if(body(x,y)&&black(x,y)&&!black(x,y-1)){G[y][x]=x<48?'d4':'d3';break;}}   // the black's lit top edge
    for(let y=27;y<62;y++)for(let x=0;x<W;x++){if(!body(x,y)||!black(x,y))continue;if(!black(x-1,y)||!black(x+1,y))G[y][x]=x<48?'s1':'s0';else if(!body(x,y+1)||!black(x,y+1))G[y][x]='d4';}   // the seam where white meets black; a violet-grey rim along the black's bottom edge
    p65Bumper(G,body,12,31,{o:'od',hi:'s4',mid:'s3',lo:'s2'});p65Bumper(G,body,65,84,{o:'od',hi:'s3',mid:'s2',lo:'s1'});
    // the touchpad, its light bar down each side
    for(let y=8;y<=27;y++)for(let x=33;x<=62;x++){const cr=(y>24)&&((x<33+(y-24))||(x>62-(y-24)));if(cr)continue;const edge=y===8||y===27||x===33||x===62||(y>24&&((x===33+(y-24))||(x===62-(y-24))));
      G[y][x]=edge?'od':y===9||x===34?'t3':y===26||x===61?'t1':y>19?'t0':'t2';}
    for(let y=17;y<=25;y++){G[y][32]=y>22?'l1':'l0';G[y][63]=y>22?'l1':'l0';}G[26][33]='l1';G[26][62]='l1';G[17][32]='l2';G[17][63]='l2';
    // the d-pad: four arrow keys, a step darker than the shell, pointing in at an empty centre, each lit along its top
    {const cx=21,cy=22,key=(pts)=>{for(const [x,y,c] of pts)G[cy+y][cx+x]=c;};
      const U=[[-2,-7,'od'],[-1,-7,'od'],[0,-7,'od'],[1,-7,'od'],[2,-7,'od'],[-2,-6,'od'],[2,-6,'od'],[-2,-5,'od'],[2,-5,'od'],[-2,-4,'od'],[2,-4,'od'],[-1,-3,'od'],[1,-3,'od'],[0,-2,'od'],
        [-1,-6,'g3'],[0,-6,'g3'],[1,-6,'g3'],[-1,-5,'g2'],[0,-5,'g2'],[1,-5,'g1'],[-1,-4,'g2'],[0,-4,'g2'],[1,-4,'g1'],[0,-3,'g1']];
      const tf=f=>U.map(([x,y,c])=>{const [X,Y]=f(x,y);return [X,Y,c];});
      key(U);key(tf((x,y)=>[x,-y]).map(([x,y,c])=>[x,y,c==='g3'?'g2':c]));
      key(tf((x,y)=>[y,x]).map(([x,y,c])=>[x,y,c==='g3'?(y===-1?'g3':'g2'):c]));key(tf((x,y)=>[-y,x]).map(([x,y,c])=>[x,y,c==='g3'?'g2':c==='g2'?'g1':c]));}
    // cross, circle, square and triangle in their colours, four round buttons apart in a diamond, each with a glint
    const SY={tri:['.#.','#.#','###'],cir:['.#.','#.#','.#.'],cro:['#.#','.#.','#.#'],squ:['###','#.#','###']};
    for(const [cx,cy,c,m] of [[75,15,'gg',SY.tri],[82,22,'rr',SY.cir],[75,29,'bb',SY.cro],[68,22,'pp',SY.squ]]){p65Disc(G,cx,cy,3.2,{f:'n2',h:'n3',s:'n1'});p65St(G,m,cx-1,cy-1,c);G[cy-2][cx-2]='gl';}
    // Create and Options: small pills either side of the touchpad
    for(const x0 of [27,64])for(let y=9;y<=12;y++)for(let x=x0;x<=x0+4;x++){const c=(x===x0||x===x0+4)&&(y===9||y===12);if(c)continue;G[y][x]=(y===9||y===12||x===x0||x===x0+4)?'k':(x===x0+1&&y===10)?'m3':y===11?'m1':'m2';}
    p65Stick(G,36,40,['d0','d1']);p65Stick(G,60,40,['d0','d1']);
    // the PS button, plain and round, and the mute button under it
    p65Disc(G,48,46,3,{f:'n2',h:'n3',s:'n1'});G[44][47]='gl';for(let x=46;x<=50;x++){G[51][x]='k';G[53][x]='k';G[52][x]=x===46||x===50?'k':'n3';}}
  return G;}
const P65PAL={xbox:{k:'#0f0c13',ol:'#6e6474',t0:'#17141c',t1:'#211d27',t2:'#2c2833',t3:'#3a3641',t4:'#514b55',b0:'#1c1424',b1:'#2a2034',b2:'#362d40',b3:'#4b4049',b4:'#6e5e5a',
    e1:'#2e2a35',e2:'#3a3641',e3:'#4d4852',e4:'#6a6268',w0:'#110e15',w1:'#1c1820',c0:'#17141b',c1:'#211d26',c2:'#2e2a34',c3:'#4a4550',c4:'#6c6570',
    p0:'#1e1a24',p1:'#3a3442',p2:'#4c4656',p3:'#655d6c',p4:'#81778a',v1:'#3a3640',v2:'#56515c',v3:'#857d84',
    h1:'#7c7884',h2:'#a29ea8',h3:'#b4b0b8',h4:'#c8c4c8',gl:'#f2ece0',
    g0:'#10260a',g1:'#2e7a1e',g2:'#46ac2e',g3:'#7ad456',r0:'#2e0a06',r1:'#8c2418',r2:'#d23c2a',r3:'#f07a62',u0:'#081a38',u1:'#1e4ea0',u2:'#3a7ee0',u3:'#84b4f2',y0:'#3a2a04',y1:'#a07810',y2:'#e8b424',y3:'#f8dc78'},
  ps:{k:'#0f0c13',ol:'#6a6478',od:'#3a3446',g0:'#3a3446',g1:'#5c566a',g2:'#78728a',g3:'#9a94aa',m1:'#3c3848',m2:'#4e4a5a',m3:'#8a8696',t0:'#aeaab8',s0:'#726a84',s1:'#a09cac',s2:'#c8c6d0',s3:'#e0dee6',s4:'#f4f2f6',d0:'#150f1c',d1:'#201828',d2:'#2a2434',d3:'#3c3546',d4:'#5a5266',
    t1:'#9a96a6',t2:'#bab6c4',t3:'#d8d6e0',l0:'#3a7ef0',l1:'#2a5ec0',l2:'#a8ccff',g1:'#7e7a8e',g2:'#9a96a8',g3:'#c0bcca',
    n1:'#1a1820',n2:'#2a2732',n3:'#45414e',n4:'#6a6574',c0:'#17151c',c1:'#211e27',c2:'#2e2b35',c3:'#4a4652',c4:'#6c6874',gl:'#f2ece0',
    gg:'#4fd2a2',rr:'#f2645a',bb:'#82b6f4',pp:'#ec90cc'}};
function p65PadSvg(fam){fam=fam||gpFam();const G=p65PadArt(fam),pal=P65PAL[fam];const h=G.length,w=G[0].length;let o='';
  for(let y=0;y<h;y++){let x=0;while(x<w){const c=G[y][x];if(c==='.'){x++;continue;}let e=x;while(e<w&&G[y][e]===c)e++;o+=`<rect x="${x}" y="${y}" width="${e-x}" height="1" fill="${pal[c]||'#ff00ff'}"/>`;x=e;}}
  return `<svg class="gpPic" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" role="img" aria-label="${fam==='ps'?'A PlayStation DualSense controller':'An Xbox controller'}">${o}</svg>`;}
gpPadPic=function(){return p65PadSvg();};
// ---------------------------------------------------------------- the Controls page: the pad you hold, drawn; which buttons to show
// (kept small so the full settings menu can take it later: p65StyleRow() is the whole choice)
function p65StyleRow(cls){const o=(v,l)=>`<button class="${cls}${GP.cfg.style===v?' on':''}" data-gk="style" data-gv="${v}">${l}</button>`;return o('auto','Auto')+o('xbox','Xbox')+o('ps','PlayStation');}
function p65SetStyle(v){if(v!=='xbox'&&v!=='ps')v='auto';const was=gpFam();GP.cfg.style=v;gpSave();if(gpFam()!==was)gpPromptsChanged();}
gpControls=function(refresh){let p=$('gpCtl');if(!p){p=document.createElement('div');p.id='gpCtl';p.setAttribute('data-modal','');p.setAttribute('role','dialog');p.setAttribute('aria-label','Controller');
    p.addEventListener('click',e=>e.stopPropagation());p.addEventListener('keydown',e=>{if(e.key==='Escape'){p.style.display='none';}});document.body.appendChild(p);}
  if(refresh&&!gpShown(p))return;const pad=gpPad(),fam=gpFam();const pid=pad?String(pad.id||'').toLowerCase():'';const name=!pad?'':gpFamOf(pad.id)==='ps'?'A PlayStation controller is connected.':/xbox|x-box|xinput|45e/.test(pid)?'An Xbox controller is connected.':'A controller is connected; it uses the Xbox buttons.';
  const opt=(k,v,l)=>`<button class="opt${String(GP.cfg[k])===String(v)?' on':''}" data-gk="${k}" data-gv="${v}">${l}</button>`;
  const h=`<b class="hd">Controller</b><div class="st">${pad?name:'No controller yet. Plug one in, or pair it over Bluetooth, then press any button on it.'} Xbox and PlayStation pads show their own buttons; any other pad uses the Xbox ones. Works in a browser and in the desktop game.</div>
    <div class="pic">${p65PadSvg(fam)}</div>
    <div class="row">Rumble ${opt('rumble',true,'On')}${opt('rumble',false,'Off')}<span style="width:10px"></span>Buttons ${p65StyleRow('opt')}</div>
    ${GP_MAP.map(([t,L])=>`<div class="sec">${t}</div><div class="map">${L.map(([k,a])=>`<div><span class="k">${gpFmt(k)}</span><span>${gpFmt(a)}</span></div>`).join('')}</div>`).join('')}
    <small class="note">Text boxes (your name, a code, logging in) still take a keyboard, or the phone's own keyboard when you tap them.</small>
    <button class="btn" id="gpCtlDone">Done</button>`;
  if(p._h!==h){const top=p.scrollTop;p._h=h;p.innerHTML=h;p.scrollTop=top;p.querySelectorAll('[data-gk]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const k=b.dataset.gk;let v=b.dataset.gv;
      if(k==='rumble'){v=v==='true';GP.cfg.rumble=v;gpSave();if(v)gpRumble(160,.5,.4);}else if(k==='style')p65SetStyle(v);gpControls();}));
    $('gpCtlDone').addEventListener('click',e=>{e.stopPropagation();p.style.display='none';});}
  gpCss(p,'display','block');};
// Settings' Controller row gets the same choice, a button that steps Auto, Xbox, PlayStation
if(typeof dispPick==='function'){const _dp=dispPick;dispPick=function(){const r=_dp.apply(this,arguments);try{const d=$('dispPick');const row=d&&d.querySelector('#gpRum')&&d.querySelector('#gpRum').parentNode;
    if(row&&!row.querySelector('#gpSty')){const b=document.createElement('button');b.className='dopt';b.id='gpSty';const lab=()=>({auto:'auto',xbox:'Xbox',ps:'PlayStation'}[GP.cfg.style]||'auto');
      b.innerHTML=`<b>Buttons</b><small>${lab()}</small>`;row.appendChild(b);b.addEventListener('click',e=>{e.stopPropagation();const L=['auto','xbox','ps'];p65SetStyle(L[(L.indexOf(GP.cfg.style)+1)%3]);const sm=b.querySelector('small');if(sm.textContent!==lab())sm.textContent=lab();});}}catch(e){}return r;};}
// the family as the tests and the menu read it
P65.fam=gpFam();
