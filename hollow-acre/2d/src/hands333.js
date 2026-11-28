/* ================= t332 / t333 the hands run the farm, in their own clothes.
   - THEIR OWN PEOPLE (t332). The hands wore the player's old farmer sheets, recoloured. Now each is drawn as who they are, pixel by
     pixel in code, in the townsfolk's style: Dell Ames in his flat cap with his two cans, the Kettle twins (Jem in a newsboy cap,
     Josie in braids, both red-headed and freckled), Old Merritt stooped under a straw hat with his seed pouch, Hannah Royce in a
     red kerchief and overalls with her pick, and two more from town: Ruth Calloway, the foreman, with her book, and Cyrus Hobbs
     the carter in his bowler. Walk and idle in four directions and a work pose for each job.
   - THEY RUN THE FARM (t333). At dawn the hands are paid and the morning is planned square by square: Hannah clears stones and
     tills (any land you own, Grandpa's field too, not only new deeds), the twins pick, Merritt fetches seed from the box and sows,
     Dell waters, the new rows last. Then it happens as you watch: each walks in at the farm gate, goes from square to square, and
     the square changes when they've worked it; they go home at noon. A Fields page in the farm book says what goes where (a crop,
     "hands choose", or "leave it to me"). Ruth the foreman walks every field with her book, buys the seed the plan needs when the
     box runs short (if you let her), and gets half as much work again out of everyone. Cyrus carts the pick to the market in
     town at noon and sells it for a quarter more than the bin pays; the farm book keeps his takings.
   Multiplayer: the host's farm runs the hands; a farmhand's field plan goes to the host. ================= */
// ---- t332: the hands' own people, drawn pixel by pixel in code (48x64 cells, feet on y 60, like the townsfolk sheets).
// Each look is a small recipe (build, skin, hair or hat, clothes, extras); every frame is drawn from a pose (which way, legs,
// arms, lean, breath), then one outline goes round the whole figure, a darker take on each edge's own colour, lighter on the
// lit top-left. Rows: walk N W S E (9), idle N W S E (4), then the job's work pose facing E and W (6).
const H33A=(()=>{
  const W=48,H=64;
  const rgb=c=>{c=c.replace('#','');return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)];};
  const hx=(r,g,b)=>'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
  const dk=(c,k)=>{const [r,g,b]=rgb(c);return hx(r*k,g*k,b*(k+.08));};            // shadows lean purple
  const lt=(c,k)=>{const [r,g,b]=rgb(c);return hx(r+(255-r)*k+6,g+(255-g)*k+3,b+(255-b)*k*.7);};   // lights lean warm
  const ramp=c=>[dk(c,.52),dk(c,.74),c,lt(c,.26)];   // 0 deep, 1 shade, 2 base, 3 light
  // ---- a cell
  function Cell(){this.d=new Array(W*H).fill(null);this.no=new Uint8Array(W*H);}
  Cell.prototype.p=function(x,y,c,noOut){x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>=H||!c)return;this.d[y*W+x]=c;if(noOut)this.no[y*W+x]=1;};
  Cell.prototype.r=function(x,y,w,h,c){for(let j=0;j<h;j++)for(let i=0;i<w;i++)this.p(x+i,y+j,c);};
  Cell.prototype.g=function(x,y){x=Math.round(x);y=Math.round(y);return x<0||y<0||x>=W||y>=H?null:this.d[y*W+x];};
  // a thick limb from (x0,y0) to (x1,y1), t px wide, coloured by f(step,side)
  Cell.prototype.limb=function(x0,y0,x1,y1,t,col){const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));const nx=-(y1-y0)/n,ny=(x1-x0)/n;
    for(let s=0;s<=n;s++){const x=x0+(x1-x0)*s/n,y=y0+(y1-y0)*s/n;for(let k=0;k<t;k++){const o=k-(t-1)/2;this.p(x+nx*o,y+ny*o,col(s/n,k));}}};
  // the outline: every empty pixel touching the figure takes a dark take on its neighbour's colour; on the lit top-left, a softer one
  Cell.prototype.outline=function(){const add=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(this.d[y*W+x])continue;
      const nb=[[1,0,'r'],[-1,0,'l'],[0,1,'d'],[0,-1,'u']];let c=null,side='';for(const [dx,dy,s] of nb){const v=this.g(x+dx,y+dy);if(v&&!this.no[(y+dy)*W+x+dx]){c=v;side=s;break;}}
      if(c)add.push([x,y,(side==='r'||side==='d')?dk(c,.42):dk(c,.34)]);}
    for(const [x,y,c] of add)this.d[y*W+x]=c;};
  Cell.prototype.to=function(g,ox,oy,flip){for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=this.d[y*W+x];if(!c)continue;g.fillStyle=c;g.fillRect(ox+(flip?W-1-x:x),oy+y,1,1);}};

  // ---- the people
  const SKIN={fair:'#e8b48c',tan:'#c88a5e',ruddy:'#e0a07a',weathered:'#b67c58',olive:'#c4966a'};
  const LOOKS={
    dell:{name:'Dell Ames',skin:'weathered',hair:'#4a3a2a',hairStyle:'short',hat:'flatcap',hatC:'#8a9098',shirt:'#7698c0',rim:1,rolled:1,trousers:'#3e3a34',boots:'#3a2618',braces:'#7a5a34',stubble:1,w:15,job:'pour'},
    kettle:{name:'Jem Kettle',bin:'basket',skin:'fair',hair:'#b4501e',hairStyle:'mop',hat:'newsboy',hatC:'#7c7a70',shirt:'#d8ceb4',overalls:'#4a6a8a',trousers:'#4a6a8a',boots:'#4a2e1a',freckles:1,teen:1,w:14,job:'pick'},
    kettle2:{name:'Josie Kettle',skin:'fair',hair:'#b4501e',hairStyle:'braids',shirt:'#2e3a52',bin:'tub',pinafore:'#d8ccb0',trousers:'#5a4a3a',skirt:1,boots:'#4a2e1a',freckles:1,teen:1,w:14,job:'pick'},
    merritt:{name:'Old Merritt',skin:'ruddy',hair:'#d8d4cc',hairStyle:'thin',hat:'straw',hatC:'#d4b46a',shirt:'#8a7a5a',vest:'#5a4a36',trousers:'#5a5248',boots:'#3a2a1c',beard:'#e4e0d8',old:1,w:15,job:'sow'},
    hannah:{name:'Hannah Royce',skin:'tan',hair:'#2e2018',hairStyle:'tied',hat:'kerchief',hatC:'#b03a2e',shirt:'#e0d4b8',rolled:1,overalls:'#3e5a7a',trousers:'#3e5a7a',boots:'#33241a',w:17,job:'swing'},
    walt:{name:'Walt Royce',skin:'ruddy',hair:'#3a2a1e',hairStyle:'short',hat:'flatcap',hatC:'#6a5038',shirt:'#9a4434',rolled:1,trousers:'#4a4a52',boots:'#2e2016',braces:'#2a2a2e',stubble:1,mustache:'#3a2a1e',w:17,job:'swing'},
    ruth:{name:'Ruth Calloway',skin:'olive',hair:'#6a645e',hairStyle:'bun',shirt:'#e8e0cc',coat:'#4a5a4a',trousers:'#3a3a3a',skirt:1,boots:'#2a1e16',w:15,job:'note'},
    cyrus:{name:'Cyrus Hobbs',skin:'ruddy',hair:'#5a3a22',hairStyle:'short',hat:'bowler',hatC:'#3a2e2a',shirt:'#d8d0bc',vest:'#7a3a2a',trousers:'#4a4038',boots:'#2a1c12',mustache:'#5a3a22',w:16,job:'pull'}};

  // ---- one figure: L = look, F = frame {v:'S'|'N'|'E', bob, legs, arms, lean, headDy, blink, tool...}
  function figure(L,F){const C=new Cell();const sk=ramp(SKIN[L.skin]||SKIN.tan);
    const teen=L.teen?1:0,old=L.old?1:0;const v=F.v;
    const bob=F.bob||0,lean=(F.lean||0)+(old&&v==='E'?1:0);
    const shirt=ramp(L.shirt),tr=ramp(L.trousers),bt=ramp(L.boots),ov=L.overalls?ramp(L.overalls):null,vest=L.vest?ramp(L.vest):null,coat=L.coat?ramp(L.coat):null,pin=L.pinafore?ramp(L.pinafore):null;
    // body plan (rows): boots 57-59, legs from legTop, torso from shoulder to hip, head above
    const hip=49+teen,shoulder=36+teen*3+bob+old,headBot=shoulder-1,headTop=headBot-15;
    const AD=L.teen?-1:-2;if(F.nearHand&&!F._ad){F.nearHand=[F.nearHand[0],F.nearHand[1]+AD];}if(F.farHand&&!F._ad){F.farHand=[F.farHand[0],F.farHand[1]+AD];}F._ad=1;
    const w=L.w,x0=Math.round(23.5-w/2);   // torso left in front view
    if(F.under)F.under(C,{sh:shoulder,hip,x0,w});
    const legCol=(lift)=>tr;
    // ---- legs and boots
    function legFront(x,lift,dy){const top=hip,bot=57-lift;for(let y=top;y<bot;y++){C.r(x,y,4,1,tr[2]);C.p(x,y,tr[3]);C.p(x+3,y,tr[1]);}
      C.r(x,bot,4,3,bt[2]);C.r(x,bot,4,1,bt[3]);C.p(x+3,bot+1,bt[1]);C.r(x-(x<23?1:0),bot+2,5,1,bt[1]);}
    function legSide(cx,lift,far){const R=far?tr.map(c=>dk(c,.8)):tr,B=far?bt.map(c=>dk(c,.8)):bt;const top=hip,bot=57-lift;const hx=23.5,fx=cx;
      // the leg swings from the hip: a thigh and shin as one 4 px limb, the boot's toe forward
      C.limb(hx,top,fx,bot-1,4,(t,k)=>k===0?R[1]:k===3?R[3]:R[2]);
      const bx=Math.round(fx-2);C.r(bx,bot,5,3,B[2]);C.r(bx,bot,5,1,B[3]);C.r(bx+5,bot+1,1,2,B[1]);C.r(bx,bot+2,6,1,B[1]);}
    if(v==='E'){const lg=F.legs||[[0,0],[0,0]];legSide(23.5+lg[1][0],lg[1][1],true);legSide(23.5+lg[0][0],lg[0][1],false);}
    else{const lg=F.legs||[0,0];legFront(x0+1,lg[0]);legFront(x0+w-5,lg[1]);}
    // ---- torso
    const sh=shoulder+(v==='E'?Math.round(lean*.5):0);
    function torsoFront(){for(let y=sh;y<hip+1;y++){const ins=y===sh?2:y===sh+1?1:(y>=hip-3?1:0);const xa=x0+ins,xb=x0+w-ins;
        for(let x=xa;x<xb;x++){const fx=(x-xa)/(xb-xa);C.p(x,y,fx<.18?shirt[3]:fx>.78?shirt[1]:shirt[2]);}}
      // the clothes over the shirt
      if(coat){for(let y=sh+1;y<hip+3;y++){const ins=y===sh+1?1:0;for(let x=x0+ins;x<x0+w-ins;x++){const fx=(x-x0)/w;if(v!=='N'&&fx>.36&&fx<.64&&y<hip-1)continue;C.p(x,y,fx<.2?coat[3]:fx>.8?coat[1]:coat[2]);}}
        if(v!=='N'){C.r(x0+Math.round(w*.36)-1,sh+2,1,hip-sh-2,coat[0]);C.r(x0+Math.round(w*.64),sh+2,1,hip-sh-2,coat[0]);}}
      if(vest&&v!=='N'){for(let y=sh+1;y<hip-1;y++)for(let x=x0+1;x<x0+w-1;x++){const fx=(x-x0)/w;if(fx>.4&&fx<.6&&y<sh+6)continue;C.p(x,y,fx<.2?vest[3]:fx>.8?vest[1]:vest[2]);}
        C.p(23,sh+7,vest[0]);C.p(23,sh+9,vest[0]);}
      if(vest&&v==='N')for(let y=sh+1;y<hip-1;y++)for(let x=x0+1;x<x0+w-1;x++){const fx=(x-x0)/w;C.p(x,y,fx<.2?vest[3]:fx>.8?vest[1]:vest[2]);}
      if(ov){const bx=x0+3,bw=w-6;if(v!=='N')for(let y=sh+4;y<hip+1;y++)for(let x=bx;x<bx+bw;x++)C.p(x,y,x===bx?ov[3]:x===bx+bw-1?ov[1]:ov[2]);
        for(let y=hip-2;y<hip+1;y++)for(let x=x0+1;x<x0+w-1;x++)C.p(x,y,ov[y===hip?1:2]);
        C.r(x0+2,sh,2,4,ov[2]);C.r(x0+w-4,sh,2,4,ov[1]);if(v!=='N'){C.p(x0+3,sh+4,'#d8c070');C.p(x0+w-4,sh+4,'#d8c070');}
        if(v==='N'){C.limb(x0+3,sh,23.5,sh+6,2,()=>ov[2]);C.limb(x0+w-4,sh,23.5,sh+6,2,()=>ov[1]);}}
      if(pin&&v!=='N'){for(let y=sh+3;y<hip+3;y++)for(let x=x0+2;x<x0+w-2;x++)C.p(x,y,x===x0+2?pin[3]:x===x0+w-3?pin[1]:pin[2]);}
      if(L.braces){const b=ramp(L.braces);C.r(x0+3,sh,1,hip-sh,b[2]);C.r(x0+w-4,sh,1,hip-sh,b[1]);}
      // belt or skirt
      if(L.skirt){const sc=coat||ramp(L.trousers);for(let y=hip-1;y<55;y++){const sp=Math.floor((y-hip)/2);for(let x=x0-sp;x<x0+w+sp;x++){const fx=(x-x0+sp)/(w+2*sp);C.p(x,y,fx<.2?sc[3]:fx>.78?sc[1]:sc[2]);}}
        if(pin&&v!=='N')for(let y=hip;y<54;y++)for(let x=x0+2;x<x0+w-2;x++)C.p(x,y,x===x0+2?pin[3]:pin[2]);}
      else if(!ov&&!coat){C.r(x0,hip-1,w,1,'#3a2a1a');if(v!=='N')C.p(23,hip-1,'#c8a050');}}
    function torsoSide(){// the torso seen from its right side, chest toward +x
      const tw=Math.max(8,w-4),tx=21-Math.floor((tw-9)/2);
      for(let y=sh;y<hip+1;y++){const t=(y-sh)/(hip-sh),off=Math.round(lean*(1-t));const ins=y===sh?1:0;
        for(let x=tx+ins;x<tx+tw-ins;x++){const fx=(x-tx)/tw;C.p(x+off,y,fx<.22?shirt[1]:fx>.8?shirt[3]:shirt[2]);}
        if(coat){for(let x=tx-1;x<tx+tw;x++){const fx=(x-tx)/tw;if(fx>.78&&y<hip-1)continue;C.p(x+off,y,fx<.25?coat[1]:coat[2]);}}
        if(vest&&y>sh)for(let x=tx;x<tx+tw-1;x++){const fx=(x-tx)/tw;if(fx>.75&&y<sh+6)continue;C.p(x+off,y,fx<.25?vest[1]:vest[2]);}
        if(ov&&y>=sh+4)for(let x=tx+Math.round(tw*.45);x<tx+tw;x++)C.p(x+off,y,x===tx+tw-1?ov[3]:ov[2]);
        if(ov&&y>=hip-2)for(let x=tx;x<tx+tw;x++)C.p(x+off,y,ov[1]);
        if(pin&&y>=sh+3)for(let x=tx+tw-3;x<tx+tw+1;x++)C.p(x+off,y,x===tx+tw?pin[3]:pin[2]);}
      if(ov)C.limb(tx+tw-2+lean,sh,tx+tw-3+lean,sh+4,2,()=>ov[2]);
      if(L.braces){const b=ramp(L.braces);C.limb(tx+tw-3+lean,sh,tx+tw-3,hip-1,1,()=>b[2]);}
      if(L.skirt){const sc=coat||ramp(L.trousers);for(let y=hip-1;y<55;y++){const sp=Math.floor((y-hip)/2);for(let x=tx-sp;x<tx+tw+sp;x++){const fx=(x-tx+sp)/(tw+2*sp);C.p(x,y,fx<.22?sc[1]:fx>.8?sc[3]:sc[2]);}}
        if(pin)for(let y=hip;y<54;y++)for(let x=tx+tw-3;x<tx+tw+2;x++)C.p(x,y,pin[2]);}
      else if(!ov&&!coat)C.r(tx,hip-1,tw,1,'#3a2a1a');
      return {tx,tw};}
    // ---- arms: shoulder to hand, sleeve then forearm (rolled sleeves show skin), a hand at the end
    const sleeve=coat||shirt;
    function arm(sx0,sy0,hx,hy,far){(F._hands=F._hands||[]).push([hx,hy,far]);const S=far?sleeve.map(c=>dk(c,.82)):sleeve,K=far?sk.map(c=>dk(c,.85)):sk;const rollAt=L.rolled?.5:1.01;
      C.limb(sx0,sy0,hx,hy,3,(t,k)=>t>rollAt?(k===2?K[1]:K[2]):(k===0?S[3]:k===2?S[1]:S[2]));
      C.r(hx-1,hy-1,3,3,K[2]);C.p(hx-1,hy-1,K[3]);C.p(hx+1,hy+1,K[1]);}
    let side=null;
    if(v==='E'){side={tx:0,tw:0};
      // the far arm first (behind the body)
      const sx0=23+Math.round(lean*.8),sy0=sh+2;const fa=F.farHand||[sx0-2,sy0+9];if(!F.noFarArm)arm(sx0-1,sy0,fa[0],fa[1],true);
      if(F.behind)F.behind(C,{sh,hip,lean,fa});
      side=torsoSide();
      F._sx=sx0;F._sy=sy0;}
    else torsoFront();
    if(F.overTorso)F.overTorso(C,{sh,hip,lean,x0,w});
    // ---- head (front, back, side)
    const hb=headBot+(F.headDy||0)+(v==='E'?Math.round(lean*.9):0),ht=hb-14,hxo=v==='E'?Math.round(lean*1.4):0;
    const hx0=16+hxo,hw=16;
    function headShape(fill){for(let y=ht;y<=hb;y++){const r=y-ht;const ins=r===0?4:r===1?2:r===2?1:r===14?3:r===13?1:0;for(let x=hx0+ins;x<hx0+hw-ins;x++)fill(x,y,(x-hx0)/hw,r);}}
    // neck
    if(v!=='N')C.r(21+hxo+(v==='E'?1:0),hb,5-(v==='E'?1:0),2,sk[1]);else C.r(21,hb,5,2,sk[1]);
    if(v==='S'){headShape((x,y,fx,r)=>C.p(x,y,fx<.2?sk[3]:fx>.82?sk[1]:sk[2]));
      C.p(hx0,ht+7,sk[1]);C.p(hx0+hw-1,ht+7,sk[1]);C.p(hx0-1,ht+7,sk[2]);C.p(hx0+hw,ht+7,sk[1]);C.p(hx0-1,ht+8,sk[1]);C.p(hx0+hw,ht+8,sk[0]);   // ears
      const ey=ht+8;if(F.blink){C.r(hx0+4,ey+1,2,1,'#3a2418');C.r(hx0+hw-5,ey+1,2,1,'#3a2418');}
      else{C.r(hx0+4,ey,2,2,'#2a1810');C.p(hx0+4,ey,'#f4ece0');C.r(hx0+hw-5,ey,2,2,'#2a1810');C.p(hx0+hw-5,ey,'#f4ece0');}
      C.p(hx0+7,ht+10,sk[1]);C.p(hx0+8,ht+10,sk[1]);   // the nose's shadow
      if(!L.mustache)C.r(hx0+6,ht+12,4,1,dk(sk[1],.85));   // mouth (a moustache hides it)
      if(L.freckles){C.p(hx0+4,ht+10,dk(sk[2],.82));C.p(hx0+11,ht+10,dk(sk[2],.82));C.p(hx0+5,ht+11,dk(sk[2],.84));C.p(hx0+10,ht+11,dk(sk[2],.84));}
      if(L.stubble){C.r(hx0+4,ht+13,hw-8,1,dk(sk[2],.88));C.p(hx0+3,ht+12,dk(sk[2],.9));C.p(hx0+hw-4,ht+12,dk(sk[2],.9));}
      if(L.mustache){const m=ramp(L.mustache);C.r(hx0+5,ht+11,6,1,m[2]);C.r(hx0+6,ht+11,2,1,m[3]);C.p(hx0+5,ht+12,m[1]);C.p(hx0+10,ht+12,m[1]);}
      if(L.beard){const b=ramp(L.beard);for(let y=ht+10;y<=hb+3;y++){const r=y-ht-9;const ins=r<2?1:r<4?2:r<6?3:4;for(let x=hx0+ins;x<hx0+hw-ins;x++)C.p(x,y,(x-hx0)/hw<.3?b[3]:(x-hx0)/hw>.75?b[1]:b[2]);}
        C.r(hx0+6,ht+12,4,1,b[0]);}
      if(old){C.p(hx0+4,ht+6,dk(sk[2],.8));C.p(hx0+hw-4,ht+6,dk(sk[2],.8));}}
    else if(v==='N'){headShape((x,y,fx,r)=>C.p(x,y,fx<.2?sk[2]:sk[1]));C.p(hx0-1,ht+7,sk[1]);C.p(hx0+hw,ht+7,sk[0]);}
    else{// side: face to the right
      headShape((x,y,fx,r)=>C.p(x,y,fx<.3?sk[1]:fx>.85?sk[3]:sk[2]));
      const ey=ht+8;if(F.blink)C.r(hx0+12,ey+1,2,1,'#3a2418');else{C.r(hx0+12,ey,2,2,'#2a1810');C.p(hx0+13,ey,'#f4ece0');}
      C.p(hx0+hw,ht+9,sk[2]);C.p(hx0+hw,ht+10,sk[1]);   // the nose
      C.r(hx0+13,ht+12,2,1,dk(sk[1],.85));
      C.r(hx0+6,ht+7,2,3,sk[1]);C.p(hx0+6,ht+7,sk[2]);   // ear
      if(L.freckles){C.p(hx0+11,ht+10,dk(sk[2],.82));C.p(hx0+13,ht+11,dk(sk[2],.84));}
      if(L.stubble){for(let x=hx0+9;x<hx0+hw;x++)if((x+ht)%2===0)C.p(x,ht+13,dk(sk[1],.85));}
      if(L.mustache){const m=ramp(L.mustache);C.r(hx0+12,ht+11,4,1,m[2]);}
      if(L.beard){const b=ramp(L.beard);for(let y=ht+10;y<=hb+3;y++){const r=y-ht-9;for(let x=hx0+7+Math.floor(r/2);x<hx0+hw-Math.floor(r/1.6);x++)C.p(x,y,x>hx0+12?b[3]:b[2]);}}
      if(old)C.p(hx0+11,ht+6,dk(sk[2],.8));}
    // ---- hair
    const hr=ramp(L.hair);const hs=L.hairStyle;
    function hairFront(){// a fringe and sides; the back view covers the whole head
      if(v==='N'){headShape((x,y,fx,r)=>{if(hs==='short'){const hh=n=>{let q=Math.sin(n*91.7+57.3)*43758.5453;return q-Math.floor(q);};const len=11+Math.floor(hh(x*1.3)*3);if(r>len)return;
          const base=fx<.22?3:fx>.78?1:2,t=hh(x*2.3+Math.floor((r+(x%2))/3)*.37);C.p(x,y,hr[t<.24?Math.max(0,base-1):t>.84?Math.min(3,base+1):base]);return;}
        if(hs==='thin'){const hh=n=>{let q=Math.sin(n*127.1+311.7)*43758.5453;return q-Math.floor(q);};const len=9+Math.floor(hh(x)*4)+(hh(x+r*.01)>.85?1:0);if(r>len)return;const t=hh(x*3.7+Math.floor(r/3));C.p(x,y,r<4?hr[0]:t<.3?hr[1]:t<.72?hr[2]:(fx<.5?hr[3]:hr[2]));return;}if(r<13||hs==='braids'||hs==='mop')C.p(x,y,fx<.25?hr[3]:fx>.75?hr[1]:hr[2]);});
        if(hs==='braids'){for(const bx of [hx0+1,hx0+hw-3]){for(let y=hb-2;y<hb+9;y++)C.r(bx,y,2,1,((y>>1)%2)?hr[1]:hr[2]);C.r(bx,hb+9,2,1,'#c84a3a');}}
        if(hs==='bun'){C.r(hx0+4,ht-3,6,4,hr[2]);C.r(hx0+5,ht-4,4,1,hr[3]);C.p(hx0+8,ht-2,hr[1]);}
        if(hs==='tied'){C.r(hx0+5,hb-1,4,3,hr[1]);}
        if(hs==='thin'){for(let x=hx0+2;x<hx0+hw-2;x+=3)C.p(x,ht+3,sk[2]);}
        return;}
      if(v==='S'){const fr=hs==='thin'?1:hs==='mop'?4:hs==='braids'?3:3;
        for(let y=ht;y<ht+fr;y++){const r=y-ht;const ins=r===0?4:r===1?2:r===2?1:0;for(let x=hx0+ins;x<hx0+hw-ins;x++)C.p(x,y,(x-hx0)/hw<.3?hr[3]:(x-hx0)/hw>.75?hr[1]:hr[2]);}
        if(hs==='mop'){for(let x=hx0+2;x<hx0+hw-2;x++)C.p(x,ht+4,x%2?hr[2]:hr[3]);for(let x=hx0+3;x<hx0+hw-3;x+=2)C.p(x,ht+5,hr[1]);C.r(hx0,ht+3,2,5,hr[2]);C.r(hx0+hw-2,ht+3,2,5,hr[1]);C.p(hx0,ht+3,hr[3]);}
        if(hs!=='thin'){C.r(hx0,ht+2,1,hs==='bun'||hs==='braids'?7:5,hr[2]);C.r(hx0+hw-1,ht+2,1,hs==='bun'||hs==='braids'?7:5,hr[1]);}
        if(hs==='thin'){C.r(hx0,ht+4,1,4,hr[2]);C.r(hx0+hw-1,ht+4,1,4,hr[1]);}
        if(hs==='braids'){C.p(hx0+6,ht,hr[0]);C.p(hx0+6,ht+1,hr[0]);for(const bx of [hx0-1,hx0+hw-1]){for(let y=ht+9;y<hb+9;y++)C.r(bx,y,2,1,((y>>1)%2)?hr[1]:hr[2]);C.r(bx,hb+9,2,1,'#c84a3a');}}
        if(hs==='bun'){C.r(hx0+4,ht-3,6,3,hr[2]);C.r(hx0+5,ht-4,4,1,hr[3]);C.p(hx0+6,ht+1,hr[0]);C.p(hx0+7,ht+2,hr[1]);}
        return;}
      // side: hair over the top and the back of the head
      headShape((x,y,fx,r)=>{const back=fx<.42,top=r<(hs==='thin'?1:3);if(top||(back&&r<(hs==='thin'?8:hs==='short'?12+((x*7)%3===0?1:0):13)&&!(fx>.3&&r>5&&r<11&&(x>=hx0+6&&x<=hx0+7)))){
        let k=fx<.25?1:fx>.7?3:2;if(hs==='short'){const q=Math.sin((x*2.3+Math.floor((r+(x%2))/3)*.37)*91.7+57.3)*43758.5453,t=q-Math.floor(q);if(t<.24)k=Math.max(0,k-1);else if(t>.84)k=Math.min(3,k+1);}C.p(x,y,hr[k]);}});
      if(hs==='braids'){for(let y=ht+9;y<hb+9;y++)C.r(hx0+3,y,2,1,((y>>1)%2)?hr[1]:hr[2]);C.r(hx0+3,hb+9,2,1,'#c84a3a');}
      if(hs==='bun'){C.r(hx0-2,ht+3,4,5,hr[2]);C.r(hx0-2,ht+3,4,1,hr[3]);}
      if(hs==='tied'){C.r(hx0-2,ht+8,3,3,hr[1]);}
      if(hs==='mop'){C.r(hx0+9,ht+3,3,1,hr[2]);}}
    hairFront();
    // ---- hats
    if(L.hat){const hc=ramp(L.hatC);
      if(L.hat==='flatcap'){for(let y=ht-1;y<ht+3;y++){const r=y-ht+1;const ins=r===0?3:r===1?1:0;for(let x=hx0+ins-1;x<hx0+hw-ins+1;x++)C.p(x,y,(x-hx0)/hw<.3?hc[3]:(x-hx0)/hw>.75?hc[1]:hc[2]);}
        if(v==='S'){C.r(hx0+1,ht+3,hw-2,1,hc[0]);C.r(hx0+2,ht+2,hw-4,1,hc[1]);}
        if(v==='E'){C.r(hx0+hw-2,ht+2,4,1,hc[1]);C.r(hx0+hw-1,ht+3,3,1,hc[0]);}}
      if(L.hat==='newsboy'){for(let y=ht-2;y<ht+3;y++){const r=y-ht+2;const ins=r===0?3:r===1?1:0;for(let x=hx0+ins-1;x<hx0+hw-ins+1;x++)C.p(x,y,(x-hx0)/hw<.3?hc[3]:(x-hx0)/hw>.75?hc[1]:(x+y)%3===0?hc[1]:hc[2]);}
        C.p(hx0+6,ht-2,hc[0]);
        if(v==='S')C.r(hx0+2,ht+3,hw-4,1,hc[0]);if(v==='E'){C.r(hx0+hw-2,ht+2,4,1,hc[0]);}}
      if(L.hat==='straw'){// a wide brim and a low crown with a band
        const by=ht+2;for(let x=hx0-4;x<hx0+hw+4;x++){C.p(x,by,(x<hx0?hc[3]:x>hx0+hw-2?hc[1]:hc[2]));C.p(x,by+1,hc[1]);}
        if(v==='E'){for(let x=hx0+hw+4;x<hx0+hw+6;x++)C.p(x,by+1,hc[1]);}
        for(let y=ht-3;y<by;y++){const r=y-ht+3;const ins=r===0?2:0;for(let x=hx0+2+ins;x<hx0+hw-2-ins;x++)C.p(x,y,(x-hx0)/hw<.3?hc[3]:(x-hx0)/hw>.7?hc[1]:hc[2]);}
        C.r(hx0+2,by-1,hw-4,1,'#6a3a26');
        for(let x=hx0-3;x<hx0+hw+3;x+=3)C.p(x,by,dk(hc[2],.88));}
      if(L.hat==='bowler'){const by=ht+2;for(let x=hx0-1;x<hx0+hw+1;x++)C.p(x,by,x<hx0+2?hc[3]:hc[1]);if(v==='E')C.p(hx0+hw+1,by,hc[1]);
        for(let y=ht-4;y<by;y++){const r=y-ht+4;const ins=r===0?4:r===1?2:r===2?1:1;for(let x=hx0+ins;x<hx0+hw-ins;x++)C.p(x,y,(x-hx0)/hw<.3?hc[3]:(x-hx0)/hw>.7?hc[1]:hc[2]);}
        C.r(hx0+1,by-1,hw-2,1,'#1e1614');}
      if(L.hat==='kerchief'){for(let y=ht-1;y<ht+3;y++){const r=y-ht+1;const ins=r===0?3:r===1?1:0;for(let x=hx0+ins;x<hx0+hw-ins;x++)C.p(x,y,(x-hx0)/hw<.3?hc[3]:(x-hx0)/hw>.75?hc[1]:hc[2]);}
        for(const [px,py] of [[hx0+4,ht],[hx0+9,ht+1],[hx0+6,ht+2],[hx0+11,ht-0]])C.p(px,py,'#f0d8c8');   // white dots on the red
        if(v==='N'||v==='E'){const kx=v==='N'?hx0+6:hx0-1;C.r(kx,ht+2,2,2,hc[1]);C.p(kx-1,ht+4,hc[2]);C.p(kx+2,ht+4,hc[1]);}}}
    // ---- near arm, last (over the body)
    if(F.mid)F.mid(C,{sh,hip,lean,x0,w,ht,hb,hx0});
    if(v==='E'){const sx0=F._sx,sy0=F._sy;const na=F.nearHand||[sx0+1,sy0+9];if(!F.noNearArm)arm(sx0+1,sy0,na[0],na[1],false);}
    else{const a=F.arms||[[0,0],[0,0]];const sy0=sh+1;
      arm(x0-1,sy0,x0-1+a[0][0],sy0+10+a[0][1],v==='N');arm(x0+w,sy0,x0+w+a[1][0],sy0+10+a[1][1],v!=='N');
      if(v==='N'){}   // arms are behind nothing from the back
    }
    if(F.extra)F.extra(C,{sk,hx0,ht,hb,sh,lean,x0,w,hands:F._hands||[]});
    if(L.rim){// a lit rim along the top of the cap and the shoulders, so he holds against grass and stone
      for(let x=0;x<W;x++){for(let y=Math.max(0,ht-3);y<ht+3;y++){const c=C.g(x,y);if(c&&!C.no[y*W+x]){C.p(x,y,lt(c,.42));break;}}
        for(let y=sh-1;y<sh+3;y++){const c=C.g(x,y);if(c&&!C.no[y*W+x]){if(y>=sh)C.p(x,y,lt(c,.3));break;}}}}
    C.outline();
    return C;}

  // ---- poses
  const P8=k=>k/8;
  function walkF(v,k,opts){opts=opts||{};if(k<0)return {v,legs:v==='E'?[[0,0],[0,0]]:[0,0],arms:[[0,0],[0,0]]};
    const p=P8(k),c=Math.cos(2*Math.PI*p),s=Math.sin(2*Math.PI*p);const bob=Math.abs(c)<.5?-1:0;
    if(v==='E'){const A=[Math.round(4*c),p>=.5?Math.round(2*Math.max(0,-s)):0],B=[Math.round(-4*c),p<.5?Math.round(2*Math.max(0,s)):0];
      const na=opts.pull?null:[23+1-Math.round(4*c),40+9];const fa=[23-2+Math.round(4*c),40+8];
      return {v,bob,legs:[A,B],nearHand:na,farHand:fa,lean:opts.lean||0};}
    const lL=p>=.5?Math.round(1.6*Math.max(0,-s)):0,lR=p<.5?Math.round(1.6*Math.max(0,s)):0;
    return {v,bob,legs:[lL,lR],arms:[[c>0?1:0,c>.3?0:c<-.3?-1:0],[c<0?-1:0,c<-.3?0:c>.3?-1:0]]};}
  function idleF(v,k){const b=k===1||k===2?-1:0;const F=v==='E'?{v,bob:b,legs:[[0,0],[0,0]]}:{v,bob:b,legs:[0,0],arms:[[0,0],[0,0]]};F.blink=k===3;return F;}
  // work poses, facing E: hand points are in cell pixels; F.tool for the props drawn in the world
  const WORK={
    swing:[{lean:0,nearHand:[20,30],farHand:[19,30],ang:-2.2},{lean:-1,nearHand:[21,25],farHand:[20,26],ang:-2.8},
      {lean:1,nearHand:[28,30],farHand:[27,31],ang:-.6},{lean:3,nearHand:[33,48],farHand:[31,47],ang:.75,len:14},
      {lean:3,headDy:1,nearHand:[33,49],farHand:[31,48],ang:.78,len:14,dust:1},{lean:1,nearHand:[30,43],farHand:[29,43],ang:.3}],
    pour:[{nearHand:[29,46],farHand:[27,45],can:0},{nearHand:[30,44],farHand:[28,43],can:1,flow:0},{nearHand:[31,43],farHand:[29,42],can:2,flow:1},
      {nearHand:[31,43],farHand:[29,42],can:2,flow:2,bob:0},{nearHand:[31,43],farHand:[29,42],can:2,flow:3},{nearHand:[30,44],farHand:[28,43],can:1,flow:0}],
    sow:[{lean:1,nearHand:[25,50],farHand:[21,48]},{lean:1,nearHand:[27,44],farHand:[21,48]},{lean:1,nearHand:[31,41],farHand:[21,48],seed:1},
      {lean:2,nearHand:[33,44],farHand:[21,48],seed:2},{lean:1,nearHand:[29,48],farHand:[21,48],seed:3},{lean:1,nearHand:[26,50],farHand:[21,48],seed:5}],
    pick:[{lean:1,nearHand:[27,48],farHand:[25,47]},{lean:3,headDy:2,nearHand:[30,55],farHand:[28,55],kneeIn:1},{lean:3,headDy:3,nearHand:[30,56],farHand:[28,56],bob:1,kneeIn:1},
      {lean:1,nearHand:[31,48],farHand:[29,48],hold:1},{lean:0,nearHand:[21,49],farHand:[22,50],hold:2},{lean:-1,nearHand:[13,49],farHand:[16,50],hold:3}],
    note:[{nearHand:[28,44],farHand:[27,45],board:1},{nearHand:[29,43],farHand:[27,45],board:1},{nearHand:[28,44],farHand:[27,45],board:1,blink:1},{nearHand:[34,38],farHand:[27,45],board:1,point:1}],
    pull:[]};
  // ---- what each of them carries, drawn into the cell: Dell's two cans, Merritt's seed pouch, Hannah's pick, Ruth's book
  const GALV=['#4a505a','#8a929c','#bcc4cc','#e8eef2'];
  function can(C,hx,hy,tilt,far,v){const g=far?GALV.map(c=>dk(c,.78)):GALV;const fl=v==='W'?-1:1;
    // the handle in the fist, the drum below it, the spout from the drum's foot out toward the rose; tipping lifts the back
    const bx=hx-2,by=hy+2;for(let j=0;j<5;j++)for(let i=0;i<6;i++){const yy=by+j-(tilt&&i<2?tilt-1:0);C.p(bx+i,yy,i===0?g[3]:i>=4?g[1]:j===0?g[3]:g[2]);}
    C.p(bx+1,by-1,g[1]);C.p(bx+4,by-1,g[1]);C.r(bx+2,by-2,2,1,g[1]);   // the handle's arch
    const sp=[[0,0],[1,-1],[2,-2],[3,-3],[4,-4]],sd=[[0,0],[1,-1],[2,-1],[3,-1],[4,-1]],sq=[[0,0],[1,0],[2,1],[3,1],[4,2]];const path=tilt===0?sp:tilt===1?sd:sq;
    let ex=0,ey=0;for(const [dx,dy] of path){ex=bx+6+dx;ey=by+3+dy;C.p(ex,ey,g[1]);}
    C.r(ex,ey-1,2,3,g[0]);C.p(ex+1,ey-1,g[2]);return [ex+1,ey+1];}
  function pick(C,hx,hy,ang,far,len){const H=far?['#7a5a34','#5a3e22']:['#c49a64','#8a6438'];const I=far?['#5a5e66','#26282e']:['#7e828c','#2e3038'];
    const L=len||12,ex=hx+Math.cos(ang)*L,ey=hy+Math.sin(ang)*L;C.limb(hx-Math.cos(ang)*2,hy-Math.sin(ang)*2,ex,ey,2,(t,k)=>H[k]);
    const px=-Math.sin(ang),py=Math.cos(ang);for(let k=-5;k<=5;k++){const cv=Math.abs(k)*Math.abs(k)*.06;C.p(ex+px*k-Math.cos(ang)*cv,ey+py*k-Math.sin(ang)*cv,Math.abs(k)>3?I[1]:I[0]);
      if(Math.abs(k)<3)C.p(ex+px*k+Math.cos(ang),ey+py*k+Math.sin(ang),I[1]);}
    return [Math.round(ex+px*5),Math.round(ey+py*5)];}
  // the water: a 2 px stream in two blues from the rose to the soil, a highlight running down it, a splash and a dark wet patch
  function water(C,sx0,sy0,flow,tilt){const G=59;const B=['#3a6aa8','#86c4ee','#eaf8ff'];
    const wet=(n)=>{for(let i=-n;i<=n;i++)C.p(sx0+5+i,G+(Math.abs(i)===n?0:1),'#3a2a20',1);for(let i=-n+1;i<n;i++)C.p(sx0+5+i,G,'#4a3628',1);for(let i=-n+2;i<n-1;i++)C.p(sx0+5+i,G+2,'#2e2018',1);};
    if(tilt<2){for(let y=sy0+1;y<Math.min(G,sy0+4+flow);y++)C.p(sx0+1,y,B[1],1);C.p(sx0+1,sy0+6,B[0],1);wet(2);return;}
    const n=G-sy0;for(let i=0;i<n;i++){const u=i/n,x=Math.round(sx0+1+u*u*4),y=sy0+1+i;C.p(x,y,B[1],1);C.p(x+1,y,B[0],1);}
    const hl=(flow*3)%Math.max(1,n-2);const hu=hl/n;C.p(Math.round(sx0+1+hu*hu*4),sy0+1+hl,B[2],1);C.p(Math.round(sx0+1+hu*hu*4),sy0+2+hl,B[2],1);
    const ix=sx0+5;wet(4);for(const [dx,dy] of [[-3,-2],[3,-2],[-2,-3-flow%2],[2,-3-(flow+1)%2]])C.p(ix+dx,G+dy,flow%2?B[2]:B[1],1);}
  // seed from the pouch hand: 2x2 clusters thrown forward, falling, lying on the soil
  function seeds(C,k){const P={1:[[33,38],[36,40]],2:[[36,44],[40,46],[34,48]],3:[[38,51],[42,53],[35,54]],4:[[36,55],[41,56],[33,54],[44,56]],5:[[35,57],[40,55],[32,56],[44,57],[38,58]]}[k]||[];
    for(const [x,y] of P){C.p(x,y,'#f4e6b0',1);C.p(x+1,y,'#dcc070',1);C.p(x,y+1,'#c8a050',1);C.p(x+1,y+1,'#a88438',1);C.r(x,y+2,2,1,'#4a3018',1);}}
  function pouch(C,x,y){const B=['#4a3418','#8a7048','#c8ac72','#e4d098'];C.r(x+1,y,4,1,B[1]);for(let j=1;j<6;j++)for(let i=0;i<6;i++){if(j===5&&(i===0||i===5))continue;C.p(x+i,y+j,i===0?B[3]:i>=4?B[1]:B[2]);}
    C.r(x+1,y+1,4,1,B[0]);C.p(x+2,y+3,'#d8c890');}
  const CROPC={pumpkin:['#6a2606','#c0581a','#ec9444'],turnip:['#6a3a6a','#e4d8e4','#fbf6fb'],potato:['#5a4028','#9a7448','#c49a68'],carrot:['#8a3a10','#d8701e','#f0a050'],
    cabbage:['#2e5a32','#5a9a5a','#8ac48a'],corn:['#8a6a10','#d8b030','#f4dc70'],barley:['#8a6a20','#c8a448','#ecd488'],hops:['#3a5a22','#7aa04a','#b0d07a'],grapes:['#3a1e4a','#6a3a8a','#9a6ab8']};
  // one crop, 6x6 with its leaves: lit on the upper left, darker lower right; a turnip's purple shoulder, a carrot's taper
  function crop(C,cx,cy,type){const c=CROPC[type]||CROPC.turnip;const R=type==='carrot'?[[2,0],[3,1],[3,2],[2,3],[2,4],[1,5]]:null;
    if(R){for(const [hw,dy] of R)for(let i=-hw+1;i<hw;i++)C.p(cx+i,cy+dy,i<0?c[2]:i>0?c[0]:c[1]);}
    else for(let j=-3;j<=2;j++)for(let i=-3;i<=2;i++){const d=Math.hypot(i+.5,j+.5);if(d>3.2)continue;C.p(cx+i,cy+j,d>2.4&&(i>=0||j>=0)?c[0]:i+j<-2?c[2]:c[1]);}
    if(type==='turnip'){C.r(cx-2,cy-3,4,1,'#9a5a9a');C.r(cx-3,cy-2,2,1,'#b07ab0');}
    for(const [dx,dy,g] of [[-1,-5,'#4a8a3a'],[0,-6,'#6aaa4a'],[1,-5,'#3a6a2a'],[0,-4,'#4a8a3a'],[-2,-6,'#5a9a3e'],[2,-6,'#5a9a3e']])C.p(cx+dx,cy+dy+(R?1:0),g);}
  // the containers, behind the twin on the ground (cells face E, so behind is to the left)
  function container(C,bin,type){const x0=3,top=48,bot=58;
    // a heap of what's been picked, above the rim
    for(const [cx,cy] of [[7,top-1],[12,top-2],[16,top-1]]){const c=CROPC[type]||CROPC.turnip;for(let j=-2;j<=1;j++)for(let i=-2;i<=1;i++){if(Math.hypot(i+.5,j+.5)>2.3)continue;C.p(cx+i,cy+j,i+j<-1?c[2]:i+j>0?c[0]:c[1]);}}
    if(bin==='tub'){const S=['#2e1e10','#5a3e22','#86603a','#a87e50'];
      for(let y=top;y<=bot;y++){const ins=y>bot-2?1:0;for(let x=x0+ins;x<x0+16-ins;x++)C.p(x,y,(x-x0)%4===0?S[1]:x<x0+4?S[3]:x>x0+12?S[1]:S[2]);}
      for(let x=x0;x<x0+16;x++){C.p(x,top,S[3]);C.p(x,top+2,'#6a6e76');C.p(x,bot-2,'#5a5e66');}C.r(x0+1,top+2,3,1,'#9aa0a8');}
    else{const W=['#2e1e10','#563a20','#7e5834','#a07848','#c49c64'];
      for(let x=x0;x<x0+16;x++){C.p(x,top,W[4]);C.p(x,top+1,W[2]);}
      for(let y=top+2;y<=bot;y++){const ins=y>bot-2?1:0,band=((y-top)>>1)%2,dk2=y>bot-2?1:0;for(let x=x0+ins;x<x0+16-ins;x++)C.p(x,y,W[((x+band*2)%4<2?3:2)-dk2]);}
      for(let a=0;a<=Math.PI;a+=.2)C.p(Math.round(x0+7.5-Math.cos(a)*6),Math.round(top-Math.sin(a)*4),a<1.6?W[3]:W[1]);}}
  function book(C,x,y){C.r(x,y,6,8,'#7a5432');C.r(x+1,y+1,4,6,'#ece4d0');C.r(x+2,y,2,1,'#b0b4bc');for(let r=y+2;r<y+7;r+=2)C.r(x+1,r,3,1,'#9a9488');}
  // per look and frame: what goes behind the body, between body and near arm, and over everything
  function kit(L,F,mode,k){const v=F.v;const job=L.job;const tip={};
    if(job==='pour'){const tilt=mode==='work'?(F.can||0):0;
      if(v==='E'){F.behind=(C,o)=>{const fa=F.farHand||[21,49];can(C,fa[0],fa[1],tilt,true,v);};F.extra=(C,o)=>{const h=o.hands.find(q=>!q[2]);if(h){const t=can(C,h[0],h[1],tilt,false,v);tip.spout=t;if(mode==='work'&&F.flow!=null)water(C,t[0],t[1],F.flow,tilt);}};}
      else F.extra=(C,o)=>{for(const h of o.hands){const g=v==='N'?1:0;const bx=h[0]-2,by=h[1]+2;const G=GALV;for(let j=0;j<5;j++)for(let i=0;i<5;i++)C.p(bx+i,by+j,i===0?G[3]:i===4?G[1]:G[2]);C.r(bx+1,by-1,3,1,G[1]);}};}
    if(job==='sow'&&mode==='work'&&F.seed){F.extra=(C,o)=>seeds(C,F.seed);}
    if(job==='sow'){if(v==='E')F.mid=(C,o)=>pouch(C,25+(o.lean>1?1:0),o.hip-3);else if(v==='S')F.mid=(C,o)=>pouch(C,o.x0+o.w-4,o.hip-3);else F.mid=(C,o)=>pouch(C,o.x0-2,o.hip-3);
      if(mode==='work')tip.seed=F.seed||0;}
    if(job==='swing'){if(mode==='work')F.extra=(C,o)=>{const h=F.nearHand;const hd=pick(C,h[0],h[1],F.ang,false,F.len);tip.head=hd;
        if(F.dust){for(const [dx,dy,c] of [[2,-2,'#7a5a3a'],[4,-4,'#5e4430'],[-1,-3,'#8a7a62'],[5,-1,'#6a4a2e']])C.r(hd[0]+dx,hd[1]+dy,2,2,c);}};
      // walking and standing, the pick is carried over the shoulder (it used to hang to the boots and drag): the near hand on
      // the haft at the chest, the haft over the shoulder, the iron head behind the back; from behind, the head lies across the back
      else if(v==='E'){F.nearHand=[28,44];F.overTorso=(C,o)=>{pick(C,28,42-(L.teen?-1:0),-2.73,false,17);};}
      else if(v==='S'){const a=F.arms||[[0,0],[0,0]];F.arms=[a[0],[-3,-6]];F.under=(C,o)=>{pick(C,o.x0+o.w-3,o.sh+5,-1.25,false,15);};}
      else{const a=F.arms||[[0,0],[0,0]];F.arms=[a[0],[-1,-9]];F.extra=(C,o)=>{pick(C,o.x0+o.w-1,o.sh+7,-1.2,false,16);};}}
    // the twins pick into their own containers, standing behind them on the ground: Jem's wicker basket, Josie's oak tub; what
    // they pull comes up out of the soil, to the chest, and over the container
    if(job==='pick'&&mode==='work'&&v==='E'){const bin=L.bin||'basket',ct=F.crop||'turnip';
      F.behind=(C,o)=>container(C,bin,ct);
      // the crop comes up out of the soil, rises to the chest in front (clear of the face), is carried back across the chest,
      // and on the last frame goes down onto the heap in the container behind
      if(F.hold||F.kneeIn&&F.bob)F.extra=(C,o)=>{const h=o.hands.find(q=>!q[2]);if(!h)return;if(F.hold===3)crop(C,h[0],h[1]-2,ct);else crop(C,h[0]+1,h[1]-(F.hold?4:2),ct);};}
    if(job==='note'){if(v==='E'){F.farHand=[27,F.farHand&&mode==='work'?F.farHand[1]:45];F.mid=(C,o)=>book(C,25+Math.round(o.lean),o.sh+4);}
      else if(v==='S')F.mid=(C,o)=>book(C,o.x0+o.w-5,o.sh+5);}
    return tip;}
  // ---- the sheet
  function sheet(L,opt){opt=opt||{};const clips={walk:{N:[0,9],W:[1,9],S:[2,9],E:[3,9]},idle:{N:[4,4],W:[5,4],S:[6,4],E:[7,4]},work:{E:[8,6],W:[9,6]}};
    const c=document.createElement('canvas');c.width=W*9;c.height=H*10;const g=c.getContext('2d');const meta={work:[]};
    for(const [v,row,flip] of [['N',0],['E',1,1],['S',2],['E',3]])for(let k=0;k<9;k++){const F=walkF(v,k-1,{pull:L.job==='pull'});if(L.job==='pull'&&v==='E')F.nearHand=[16,48];kit(L,F,'walk',k);figure(L,F).to(g,k*W,row*H,flip);}
    for(const [v,row,flip] of [['N',4],['E',5,1],['S',6],['E',7]])for(let k=0;k<4;k++){const F=idleF(v,k);kit(L,F,'idle',k);figure(L,F).to(g,k*W,row*H,flip);}
    const wk=WORK[L.job]||[];for(let k=0;k<6;k++){const F0=wk.length?wk[k%wk.length]:null;
      const F=F0?Object.assign({v:'E',legs:[[2,0],[-2,0]],crop:opt.crop},F0):idleF('E',k%4);const tip=kit(L,F,F0?'work':'idle',k);const C=figure(L,F);C.to(g,k*W,8*H);C.to(g,k*W,9*H,1);meta.work.push(Object.assign({},F0||{},{nearHand:F.nearHand,farHand:F.farHand},tip));}
    return {canvas:c,clips,meta,fw:W,fh:H,ax:24,ay:60};}
  return {LOOKS,sheet,figure,walkF,idleF,WORK,ramp,dk,lt};})();


// ---- the sheets, made once each when first needed
const H33_ID={dell:['dell'],kettle:['kettle','kettle2'],merritt:['merritt'],hannah:['hannah'],ruth:['ruth'],cyrus:['cyrus']};
function h33Key(look,crop){const key='h33_'+look+(crop?'_'+crop:'');if(SPR[key])return key;const L=H33A.LOOKS[look];if(!L)return null;
  const s=H33A.sheet(L,{crop});IMG['mem:'+key]=s.canvas;SPR[key]={src:'mem:'+key,fw:s.fw,fh:s.fh,ax:s.ax,ay:s.ay,clips:s.clips};H33_META[look]=s.meta;return key;}
const H33_META={};
// ---- two more people from town: a foreman who lays the fields out and keeps the book, and a carter who takes the harvest to market
EMP_HANDS.push({id:'ruth',name:'Ruth Calloway',job:'boss',n:0,wage:36,note:'kept the books for the Greyfield estate till it closed; lays out a field like a ledger'},
  {id:'cyrus',name:'Cyrus Hobbs',job:'sell',n:60,wage:30,note:'has a handcart and a loud voice, and knows what every stall on the square is paying'});
EMP_HANDS.push({id:'walt',name:'Walt Royce',job:'clear',n:20,wage:30,note:'Hannah’s cousin, back from the quarry; starts at the far end of the ground and works toward her'});
{const h=EMP_HANDS.find(q=>q.id==='hannah');if(h)h.n=20;}
EMP_JOB.clear='clears the stones and weeds off your ground and tills it (a stone takes as long as two weeds or three bare squares): about thirty squares a morning';
Object.assign(EMP_JOB,{boss:'lays out every field to your plan, buys the seed it needs and gets half as much work again out of everyone',
  sell:'carts what the hands pick to the market in town and sells it for more than the bin pays'});
try{for(const e of F6_W)if(e[0]===EMP_HANDS){e[1].push(36,30,30);}f6Apply();}catch(e){}
const H33_SPEC={walt:{k:'till',from:6.1,to:11.4},gh:{k:'gh',from:6.5,to:11.6},hannah:{k:'till',from:6.1,to:11.4},kettle:{k:'pick',from:6.1,to:10.6},merritt:{k:'sow',from:6.8,to:11.7},dell:{k:'water',from:7.2,to:11.9},ruth:{k:'boss',from:6,to:11.5},cyrus:{k:'sell',from:11.2,to:15.2}};
const H33_GATE={x:-12.2,z:-5.6};
const H33_SEEDCOST=k=>{if(typeof CROP2!=='undefined'&&CROP2[k])return Math.ceil(CROP2[k].seed/5);return {turnip:2,pumpkin:7,corn:7}[k]||4;};
function H33(){const E=EMP();E.h33=E.h33&&typeof E.h33==='object'?E.h33:{};const Q=E.h33;Q.plan=Q.plan||{};Q.log=Q.log||[];Q.routes=Q.routes||{};Q.ptr=Q.ptr||{};Q.cart=Q.cart||[];return Q;}
const h33Host=()=>typeof empHost!=='function'||empHost();
const h33Hired=id=>(EMP().hands||[]).includes(id);
// ---- the farm's pieces of land: Grandpa's field, the greenhouse, and every piece you own
const h33LandOf=t=>t.parcel||(t.gh?'gh':'home');
function h33Lands(){const out=[{id:'home',name:'Grandpa’s field'}];if(tiles.some(t=>t.gh))out.push({id:'gh',name:'The greenhouse'});
  for(const id of (typeof LAND!=='undefined'?LAND.order:[])){const P=(LAND.built[id]||{}).P;out.push({id,name:P&&P.home!=null?`The garden plot by cabin ${P.home+1}`:P&&P.name?P.name:id});}return out;}
const h33Plan=id=>H33().plan[id]||(/^home\d/.test(id)?'none':'auto');
const h33Tile=(x,z)=>{for(const t of tiles)if(Math.abs(t.x-x)<.02&&Math.abs(t.z-z)<.02)return t;return null;};
const h33InSeason=(k,t)=>t&&t.gh||typeof cropInSeason!=='function'||cropInSeason(k);
// what the hands sow on a square: the plan's crop, or (hands choose) what's in season and best paid for its growing time
function h33CropFor(t,box,canBuy){const p=h33Plan(h33LandOf(t));if(p==='none')return null;
  if(p!=='auto')return (box[p]>0||canBuy)&&h33InSeason(p,t)?p:null;
  if(t.lastPick&&box[t.lastPick]>0&&h33InSeason(t.lastPick,t))return t.lastPick;
  let best=null,bv=-1;for(const k of Object.keys(SEEDS)){if(!h33InSeason(k,t))continue;const have=(box[k]||0)>0;if(!have&&!canBuy)continue;
    const v=(SEEDS[k].sell||5)/Math.max(6,SEEDS[k].grow||12)+(have?1:0);if(v>bv){bv=v;best=k;}}return best;}
// ---- dawn: pay the hands, and plan the morning square by square (the work is done as each of them gets there)
const H33F={quiet:false};
function h33Flush(){const Q=H33();if(!Q.routes)return;H33F.quiet=true;try{for(const id of Object.keys(Q.routes))h33Run(id,99);h33Market(true);}finally{H33F.quiet=false;}}
function h33PlanDay(){const E=EMP(),Q=H33();const box=handBox().seeds;const did=[];let spent=0;
  Q.day=S.day;Q.routes={};Q.ptr={};Q.today={till:0,pick:0,sow:0,water:0,bought:0,boughtC:0};
  const here=[];for(const id of E.hands){const H=EMP_HANDS.find(h=>h.id===id);if(!H)continue;
    if(S.coins<H.wage){did.push(`${H.name} came at dawn, found nothing in the tin, and went home`);continue;}S.coins-=H.wage;spent+=H.wage;here.push(id);}
  const boss=here.includes('ruth'),mult=boss?1.5:1,canBuy=boss&&!!Q.buy;
  const cap=id=>Math.round(((EMP_HANDS.find(h=>h.id===id)||{}).n||0)*mult);
  const winter=t=>typeof empWinter==='function'&&empWinter(t);
  // the squares in a sensible order: each piece of land, row by row, back and forth
  const order=tiles.filter(t=>h33Plan(h33LandOf(t))!=='none').slice().sort((a,b)=>{const la=h33LandOf(a),lb=h33LandOf(b);if(la!==lb)return la<lb?-1:1;
    const ra=Math.floor(a.z),rb=Math.floor(b.z);if(ra!==rb)return ra-rb;return a.x-b.x;});   // every row the same way, so whoever follows stays well behind
  const sim=new Map(order.map(t=>[t,{tilled:!!t.tilled,crop:t.crop?{st:t.crop.stage,w:!!t.crop.watered}:null,deb:!!(t.debris&&!t.debris.hide)}]));
  const R={};const add=(id,t,k,arg)=>{if(t.gh)id='gh';(R[id]=R[id]||[]).push([+t.x.toFixed(2),+t.z.toFixed(2),0,k,arg||0]);};
  // Hannah clears and tills
  // (Hannah from the near end, Walt from the far end; a stone counts 1, a weed or stick 1/2, tilling bare ground 1/3)
  {const needs=order.filter(t=>{const s=sim.get(t);return !winter(t)&&(s.deb||(!s.tilled&&!s.crop));});
    const cost=t=>{const s=sim.get(t);if(s.deb)return /rock/.test((t.debris&&t.debris.spr)||'')?1:.5;return 1/3;};let lo=0,hi=needs.length-1;Q.today.till=0;Q.today.cleared=0;
    const go=(id,fwd)=>{let b=cap(id);while(lo<=hi){const t=fwd?needs[lo]:needs[hi];const c=cost(t);if(b<c-1e-9)break;b-=c;if(fwd)lo++;else hi--;const s=sim.get(t);
        add(id,t,s.deb?'clear':'till');if(s.deb)Q.today.cleared++;s.deb=false;s.tilled=true;Q.today.till++;}};
    if(here.includes('hannah'))go('hannah',true);if(here.includes('walt'))go('walt',false);}
  // the twins pick what's ripe (two of them, alternate squares)
  if(here.includes('kettle')){let n=0;const c=cap('kettle');for(const t of order){if(n>=c)break;const s=sim.get(t);if(s.crop&&s.crop.st>=3){add(n%2?'kettle2':'kettle',t,'pick');
      const C=typeof CROP2!=='undefined'&&CROP2[t.crop.type];s.crop=C&&C.regrow?{st:C.regrow,w:false}:null;n++;}}Q.today.pick=n;}
  // Merritt sows: from the box, or with Ruth's seed money
  if(here.includes('merritt')){let n=0;const c=cap('merritt');const B=Object.assign({},box);
    for(const t of order){if(n>=c)break;const s=sim.get(t);if(!s.tilled||s.crop||winter(t))continue;const k=h33CropFor(t,B,canBuy);if(!k)continue;
      if(B[k]>0)B[k]--;else{const cost=free6()?0:H33_SEEDCOST(k);if(S.coins<cost)continue;S.coins-=cost;spent+=cost;Q.today.bought++;Q.today.boughtC+=cost;box[k]=(box[k]||0)+1;}
      add('merritt',t,'sow',k);s.crop={st:0,w:false};n++;}Q.today.sow=n;
    if(R.merritt)R.merritt.unshift([HAND_BOX_AT.x,HAND_BOX_AT.z+.6,0,'box',0]);}
  // Dell waters everything growing, the new rows last
  if(here.includes('dell')){let n=0;const c=cap('dell');for(const pass of [0,1])for(const t of order){if(n>=c)break;const s=sim.get(t);if(!s.crop||s.crop.st>=3||s.crop.w)continue;
      const fresh=t.crop==null||(t.crop&&t.crop.stage!==s.crop.st);if(pass===0&&fresh)continue;add('dell',t,'water');s.crop.w=true;n++;}Q.today.water=n;}
  // Ruth walks the corners of each piece of land with her book
  if(boss){const seen=new Set();for(const t of order){const id=h33LandOf(t);if(seen.has(id))continue;seen.add(id);const L=order.filter(q=>h33LandOf(q)===id);
      const xs=L.map(q=>q.x),zs=L.map(q=>q.z);const x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs);
      for(const [x,z] of [[x0-.6,z0-.6],[x1+.6,z0-.6],[x1+.6,z1+.6],[x0-.6,z1+.6]])(R.ruth=R.ruth||[]).push([+x.toFixed(2),+z.toFixed(2),0,'note',id]);}}
  // Cyrus: the cart at the seed box at eleven, off to town, back mid-afternoon
  if(here.includes('cyrus'))R.cyrus=[[HAND_BOX_AT.x+1.4,HAND_BOX_AT.z+.9,0,'load',0],[H33_GATE.x,H33_GATE.z,0,'leave',0],[H33_GATE.x,H33_GATE.z,0,'back',0],[HAND_BOX_AT.x+1.4,HAND_BOX_AT.z+.9,0,'home',0]];
  // times: spread each one's squares over their morning; a square sown today is watered after it's sown, and sown after it's tilled
  const tAt=new Map();
  for(const id of ['hannah','walt','kettle','kettle2','ruth','gh','merritt','dell','cyrus']){const L=R[id];if(!L||!L.length)continue;const sp=H33_SPEC[id==='kettle2'?'kettle':id];
    if(id==='cyrus'){L[0][2]=11.5;L[1][2]=12.2;L[2][2]=14.6;L[3][2]=15.1;continue;}
    const n=L.length;for(let i=0;i<n;i++){let at=sp.from+(sp.to-sp.from)*(i+1)/n;const key=L[i][0]+','+L[i][1];
      if(id==='merritt'&&tAt.has(key))at=Math.max(at,tAt.get(key)+1.2);if(id==='dell'&&tAt.has(key))at=Math.max(at,tAt.get(key)+.9);
      if(i&&at<L[i-1][2]+.02)at=L[i-1][2]+.02;L[i][2]=+Math.min(sp.to+.6,at).toFixed(3);tAt.set(key,L[i][2]);}}
  h33Settle(Q,R);Q.routes=R;for(const id of Object.keys(R))Q.ptr[id]=0;Q.cart=[];
  const tell=[];const T=Q.today;if(T.till)tell.push(`${here.includes('walt')&&here.includes('hannah')?'Hannah and Walt have':here.includes('walt')?'Walt has':'Hannah has'} ${T.till} square${T.till>1?'s':''} to clear and till${T.cleared?` (${T.cleared} with stones or weeds)`:''}`);if(T.pick)tell.push(`the twins ${T.pick} to pick`);
  if(T.sow)tell.push(`Merritt ${T.sow} to sow${T.bought?` (Ruth bought ${T.bought} seed for ${T.boughtC})`:''}`);if(T.water)tell.push(`Dell ${T.water} to water`);
  if(here.includes('merritt')&&!T.sow&&!Object.values(box).some(n=>n>0)&&!canBuy)tell.push('the seed box is empty, so Merritt has nothing to sow');
  if(here.includes('cyrus'))tell.push('Cyrus takes the pick to market at noon');
  return {did:did.concat(tell),spent,here};}
// nobody works within a square of anyone else: when two would, the one lower in the order waits a little (and a square is
// still sown after it's tilled, and watered after it's sown)
function h33Settle(Q,R){const ids=['hannah','walt','kettle','kettle2','merritt','dell','ruth'].filter(id=>R[id]&&R[id].length);
  const dep=()=>{const till={},sow={};for(const id of ['hannah','walt'])for(const r of R[id]||[])till[r[0]+','+r[1]]=r[2];
    for(const r of R.merritt||[]){const k=r[0]+','+r[1];if(r[3]==='sow'&&till[k]!=null&&r[2]<till[k]+1.2)r[2]=+(till[k]+1.2).toFixed(3);sow[k]=r[2];}
    for(const r of R.dell||[]){const k=r[0]+','+r[1];if(sow[k]!=null&&r[2]<sow[k]+.9)r[2]=+(sow[k]+.9).toFixed(3);}
    for(const id of ids){const L=R[id];for(let i=1;i<L.length;i++)if(L[i][2]<L[i-1][2]+.02)L[i][2]=+(L[i-1][2]+.02).toFixed(3);}};
  const keep=[Q.routes,Q.day];Q.routes=R;Q.day=S.day;
  try{for(let it=0;it<80;it++){dep();let hit=null;
      for(let h=6;h<15&&!hit;h+=.05){const P=[];for(const id of ids){const a=h33Where(id,h);if(a&&!a.walk&&a.k!=='wait')P.push([id,a]);}
        for(let i=0;i<P.length&&!hit;i++)for(let j=i+1;j<P.length;j++){const A=P[i][1],B=P[j][1];if(Math.max(Math.abs(A.x-B.x),Math.abs(A.z-B.z))<1.9){hit=[P[j][0],B.i];break;}}}
      if(!hit)break;const L=R[hit[0]];for(let k=hit[1];k<L.length;k++)L[k][2]=+(L[k][2]+.3).toFixed(3);}}
  finally{Q.routes=keep[0];Q.day=keep[1];}}
// ---- doing the work, square by square, as the morning comes to each of them
function h33Run(id,hour){const Q=H33(),L=Q.routes[id];if(!L)return;let i=Q.ptr[id]||0;
  while(i<L.length&&L[i][2]<=hour){const [x,z,,k,arg]=L[i];i++;try{h33Do(id,k,x,z,arg);}catch(e){}}Q.ptr[id]=i;}
function h33Do(id,k,x,z,arg){const Q=H33();const t=k==='box'||k==='note'||k==='load'||k==='leave'||k==='back'||k==='home'?null:h33Tile(x,z);
  if(k==='clear'&&t){if(typeof empClear==='function')empClear(t);if(!t.tilled&&!t.crop)t.tilled=true;}
  else if(k==='till'&&t){if(!t.tilled&&!t.crop&&!(t.debris&&!t.debris.hide))t.tilled=true;}
  else if(k==='pick'&&t&&t.crop&&t.crop.stage>=3){if(h33Hired('cyrus')){const real=S.ship;S.ship=Q.cart;try{empPick(t,false);}finally{Q.cart=S.ship;S.ship=real;}}else empPick(t,false);}
  else if(k==='sow'&&t&&!t.crop&&t.tilled){const box=handBox().seeds;const real=S.seeds;S.seeds=box;try{empSow(t,arg);}finally{S.seeds=real;}}
  else if(k==='water'&&t&&t.crop&&t.crop.stage<3)t.crop.watered=true;
  else if(k==='leave')Q.away=1;else if(k==='back'){h33Market(H33F.quiet);Q.away=0;}}
// the market: what the twins picked, sold on the square for a quarter more than the bin pays
function h33Market(quiet){const Q=H33();const c=Q.cart||[];if(!c.length)return;let v=0;for(const e of c)v+=Math.round((e.value||0)*1.25);const n=c.length;Q.cart=[];S.coins+=v;
  Q.log.unshift({day:S.day,n,v});Q.log=Q.log.slice(0,7);Q.sold=(Q.sold||0)+v;try{updateHud&&updateHud();}catch(e){}
  if(!quiet)toast(`Cyrus is back from market: ${n} crop${n>1?'s':''} sold on the square for ${v} coins.`,3.6);}
// the morning: the bank and the hands' pay as before, then the plan (the old all-at-once work is replaced)
{const _em=empMorning;empMorning=function(){if(!h33Host())return _em.apply(this,arguments);try{h33Flush();}catch(e){}
  const E=EMP(),hands=E.hands;E.hands=[];let r;try{r=_em.apply(this,arguments);}finally{E.hands=hands;}
  try{if(!hands.length){H33().routes={};return r;}const res=h33PlanDay();E.work=null;if(res.here.length)empFriends(1);
    const last=E.last||{};E.last={day:S.day,did:res.did,notes:last.notes||[],spent:(last.spent||0)+res.spent};
    if(res.did.length)setTimeout(()=>toast('At dawn: '+res.did.join('; ')+'.',5),3600);updateHud&&updateHud();}catch(e){console.warn('hands',e);}return r;};}
{const _u=update;update=function(dt){_u.apply(this,arguments);try{if(!h33Host()||S.mode!=='play')return;const Q=EMP().h33;if(!Q||!Q.routes||Q.day!==S.day)return;
  for(const id of Object.keys(Q.routes))h33Run(id,S.hour);}catch(e){}};}
// ---- where each of them is, and what they're doing, at any hour (the same on every computer: it's all in the farm's book)
function h33Where(id,hour){const Q=H33(),L=Q.routes[id];if(!L||!L.length||Q.day!==S.day)return null;const sp=H33_SPEC[id==='kettle2'?'kettle':id];
  const walkH=d=>Math.max(.012,d/140);const start=L[0][2]-.15-walkH(Math.hypot(L[0][0]-H33_GATE.x,L[0][1]-H33_GATE.z));
  if(id==='cyrus'){if(hour<L[0][2]-.5||hour>L[3][2]+.05)return null;
    const seg=(a,b,t0,t1)=>{const u=Math.max(0,Math.min(1,(hour-t0)/Math.max(.01,t1-t0)));return {x:a[0]+(b[0]-a[0])*u,z:a[1]+(b[1]-a[1])*u,walk:u>0&&u<1,dir:dirOf(b[0]-a[0],b[1]-a[1])};};
    if(hour<L[0][2]-.15)return Object.assign(seg([H33_GATE.x,H33_GATE.z],L[0],L[0][2]-.5,L[0][2]-.15),{k:'pull'});
    if(hour<L[0][2])return {x:L[0][0],z:L[0][1],walk:false,dir:'S',k:'load'};
    if(hour<L[1][2])return Object.assign(seg(L[0],L[1],L[0][2],L[1][2]),{k:'pull',full:1});
    if(hour<L[2][2])return null;
    return Object.assign(seg(L[2],L[3],L[2][2],L[3][2]),{k:'pull'});}
  const end=Math.max(sp.to,L[L.length-1][2])+.05;if(hour<start||hour>end+.35)return null;
  let px=H33_GATE.x,pz=H33_GATE.z,pt=start;
  for(let i=0;i<L.length;i++){const [x,z,at,k]=L[i];const work=k==='box'?.1:k==='note'?.3:.06+Math.min(.12,(at-pt)*.45);const w0=at-work,d=Math.hypot(x-px,z-pz),wk0=Math.max(pt,w0-walkH(d));
    if(hour<wk0)return {x:px,z:pz,walk:false,dir:i?dirOf(x-px,z-pz):'E',k:'wait'};
    if(hour<w0){const u=(hour-wk0)/Math.max(.001,w0-wk0);return {x:px+(x-px)*u,z:pz+(z-pz)*u,walk:true,dir:dirOf(x-px,z-pz),k:'walk'};}
    if(hour<=at)return {x,z,walk:false,dir:k==='note'||k==='box'?null:(x<px-.2?'W':'E'),k,arg:L[i][4],ph:(hour-w0)/work,i};
    px=x;pz=z;pt=at;}
  // home through the gate
  const u=Math.min(1,(hour-pt)/Math.max(.05,walkH(Math.hypot(H33_GATE.x-px,H33_GATE.z-pz))));if(u>=1)return null;
  return {x:px+(H33_GATE.x-px)*u,z:pz+(H33_GATE.z-pz)*u,walk:true,dir:dirOf(H33_GATE.x-px,H33_GATE.z-pz),k:'walk'};}
// where everyone stands this moment, keeping a clear square between any two at work: the later one in the line is shown a little
// back along their own path (only how they're drawn; the work itself keeps its time)
const H33_ORDER=['hannah','walt','kettle','kettle2','merritt','dell','ruth','cyrus'];
function h33Place(hour){const Q=H33(),out=[];const busy=a=>a&&!a.walk&&a.k!=='wait';
  for(const id of H33_ORDER){if(!Q.routes[id])continue;let at=h33Where(id,hour);if(!at){continue;}
    for(const d of [0,.25,.5,.8,1.2]){const a2=d?h33Where(id,hour-d):at;if(!a2)break;
      const near=out.some(o=>busy(o.at)&&Math.max(Math.abs(o.at.x-a2.x),Math.abs(o.at.z-a2.z))<1.9);if(!near||!busy(a2)&&d===0){at=a2;break;}if(d===1.2)at=a2;}
    out.push({id,at});}
  return out;}
// ---- drawing them (the old drawings of the hands are switched off: they read the dawn's work list, which is no longer kept)
const H33_LOOKOF={kettle:'kettle',kettle2:'kettle2'};
// Josie's bushel tub: oak staves and two iron hoops, the pick heaped in it (the twins' baskets differ)
function h33Tub(type){return M4.pre('h33tub_'+type,20,17,(K,g)=>{const C={pumpkin:['#6a2606','#c0581a','#ec9444'],turnip:['#5a2a5a','#d8c8d8','#f4ecf4'],potato:['#5a4028','#9a7448','#c49a68'],carrot:['#8a3a10','#d8701e','#f0a050'],cabbage:['#2e5a32','#5a9a5a','#8ac48a'],corn:['#8a6a10','#d8b030','#f4dc70']}[type]||['#2e5a32','#5a9a5a','#8ac48a'];
  for(const [x,y,r] of [[7,6,3],[12,5,3.2]])for(let j=-4;j<=4;j++)for(let i=-4;i<=4;i++){const d=Math.hypot(i,j);if(d>r)continue;K.px(x+i,y+j,1,1,d>r-.9?C[0]:i+j<-1.5?C[2]:C[1]);}
  const S=['#2e1e10','#5a3e22','#86603a','#a87e50'];for(let y=8;y<16;y++){const ins=y>13?1:0;for(let x=2+ins;x<18-ins;x++)K.px(x,y,1,1,(x-2)%4===0?S[1]:x<6?S[3]:S[2]);}
  for(let x=2;x<18;x++){K.px(x,8,1,1,S[3]);K.px(x,10,1,1,'#5a5e66');K.px(x,14,1,1,'#4a4e56');}for(let y=8;y<16;y++){K.px(1,y,1,1,S[0]);K.px(18,y,1,1,S[0]);}for(let x=2;x<18;x++)K.px(x,16,1,1,S[0]);});}
function h33Cart(X,Y,dir,full){const g=ctx2;const flip=dir==='W'?-1:1;
  // a two-wheeled handcart behind him: plank bed, slatted sides, the load of crates when full
  const bx=dir==='E'||dir==='W'?X-flip*30:X-14,by=dir==='N'?Y+10:dir==='S'?Y-18:Y-14;
  g.fillStyle='rgba(10,14,8,.3)';g.beginPath();g.ellipse(bx+14,by+16,16,4,0,0,6.3);g.fill();
  g.fillStyle='#2a1a0e';g.fillRect(bx-1,by-1,30,13);g.fillStyle='#8a6438';g.fillRect(bx,by,28,11);g.fillStyle='#a8804c';g.fillRect(bx,by,28,2);
  for(let i=0;i<4;i++){g.fillStyle='#6a4a28';g.fillRect(bx+2+i*7,by+3,1,8);}
  if(full){for(let i=0;i<3;i++){g.fillStyle='#2a1a0e';g.fillRect(bx+2+i*8,by-7,8,8);g.fillStyle=['#d8701e','#c0581a','#d8b030'][i];g.fillRect(bx+3+i*8,by-6,6,6);g.fillStyle='rgba(255,240,200,.35)';g.fillRect(bx+3+i*8,by-6,2,2);}}
  for(const wx of [bx+4,bx+24]){g.fillStyle='#1e140a';g.beginPath();g.arc(wx,by+12,5,0,6.3);g.fill();g.fillStyle='#6a4a28';g.beginPath();g.arc(wx,by+12,3.6,0,6.3);g.fill();g.fillStyle='#3a2614';g.fillRect(wx-1,by+11,2,2);}
  g.fillStyle='#5a3e22';if(dir==='E'||dir==='W')g.fillRect(flip>0?bx+27:bx-9,by+3,10,2);}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){const E=EMP();const W=E.work;E.work=null;try{_ld.apply(this,arguments);}finally{E.work=W;}
  try{if(S.room)return;const Q=E.h33;if(!Q||!Q.routes||Q.day!==S.day)return;const now=performance.now()/1000;
    const placed=[[P.x,P.z]];for(let {id,at} of h33Place(S.hour)){if(!onScreen(at.x,at.z,90))continue;
      if(!at.walk&&Math.hypot(at.x-P.x,at.z-P.z)<1.7){for(const d of [.25,.5,.8,1.2,1.8,2.5]){const a2=h33Where(id,S.hour-d);if(a2&&!a2.walk&&Math.hypot(a2.x-P.x,a2.z-P.z)>=1.7){at=a2;break;}}}
      const look=H33_LOOKOF[id]||id;const key=h33Key(look);if(!key)continue;const meta=H33_META[look]||{work:[]};
      const twin2=id==='kettle2';let dir=at.dir||(twin2?'W':'E');if(at.k==='note'&&!at.dir)dir=at.ph<.5?'E':'W';
      let clip='idle',fr=Math.floor(now*3+id.length)%4;
      if(at.walk){clip='walk';fr=1+Math.floor((now*(id==='merritt'?8:10))+id.length)%8;}
      else if(['till','clear','pick','sow','water','note'].includes(at.k)){clip='work';if(dir!=='E'&&dir!=='W')dir=twin2?'W':'E';const cyc=({note:2.2,pick:1.7,sow:1.3,till:1.1,clear:1.1,water:1.5}[at.k]||1.4)*(id==='walt'?1.18:1);fr=Math.floor(now*6/cyc+id.length*.7+(id==='walt'?3:0))%6;
        if(at.k==='water')fr=[1,2,3,4,2,3,4,5][Math.floor(now*6+id.length)%8];}
      else if(at.k==='box'||at.k==='load'){clip='idle';dir='N';}
      const sgn=dir==='W'?-1:1;const back={till:.5,clear:.5,water:.62,sow:.42,pick:.2}[at.k]||0;
      let x=at.x-(clip==='work'?sgn*back:0),z=at.z+(clip==='work'?.12:.25);
      placed.push([x,z]);
      const F=clip==='work'?(meta.work[fr]||{}):{};
      let dkey=key;if(at.k==='pick'&&clip==='work'){const tl=h33Tile(at.x,at.z);const type=(tl&&tl.crop&&tl.crop.type)||(tl&&tl.lastPick)||'turnip';dkey=h33Key(look,type)||key;}
      // nobody works shoulder to shoulder with you: a hand steps a little aside to keep a square between you
      {const dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz);if(d<1.7){const ux=d>.05?dx/d:1,uz=d>.05?dz/d:0;x+=ux*(1.7-d);z+=uz*(1.7-d);}}
      D.push({z:z+.01,mind:1,draw(){const X=Math.round(sx(x)),Y=Math.round(sz(z));
        if(id==='cyrus'&&dir!=='N')h33Cart(X,Y,dir,at.full);
        if(typeof shadow==='function')shadow(X,Y,8);
        drawSpr(dkey,X,Y,clip,dir,fr);
        if(id==='cyrus'&&dir==='N')h33Cart(X,Y,dir,at.full);
        if(clip!=='work')return;const P2=(p)=>[X-24+(sgn<0?47-p[0]:p[0]),Y-60+p[1]];const tt=now;
        if((at.k==='till'||at.k==='clear')&&(fr===3||fr===4)){const [hx,hy]=F.head?P2(F.head):[X+sgn*10,Y-2];const q=fr===3?.3:.75;
          for(const [cx,cy,c] of [[2,-3,'#5a3e26'],[6,-6,'#6a4a2e'],[9,-2,'#4a3220'],[4,-8,'#8a8478']]){ctx2.fillStyle='#24180e';ctx2.fillRect(hx+sgn*(cx+Math.round(q*4))-1,hy+cy-Math.round(q*5)-1,4,4);ctx2.fillStyle=c;ctx2.fillRect(hx+sgn*(cx+Math.round(q*4)),hy+cy-Math.round(q*5),2,2);}
          if(at.k==='clear'){ctx2.globalAlpha=.45*(1-q);ctx2.fillStyle='#b8a890';ctx2.beginPath();ctx2.arc(hx,hy,3+q*5,0,6.3);ctx2.fill();ctx2.globalAlpha=1;}}}});}
    // stones Hannah lifted off a square lie beside it till the day is out
    const L=Q.routes.hannah;if(L&&typeof HB3!=='undefined'){const p=Q.ptr.hannah||0;for(let q=0;q<Math.min(p,L.length);q++){if(L[q][3]!=='clear')continue;const [qx,qz]=L[q];if(!onScreen(qx,qz,40))continue;
      D.push({z:qz-.02,mind:1,draw(){const X=Math.round(sx(qx))+9,Y=Math.round(sz(qz))+4;for(const [dx,dy,kk,vv] of HB3.lay(q).slice(0,2)){const im=HB3.stone(kk,vv);ctx2.fillStyle='rgba(20,12,6,.35)';ctx2.fillRect(X+dx+1,Y+dy,im.width-1,1);ctx2.drawImage(im,X+dx,Y+dy-im.height+1);}}});}}
  }catch(e){}};}
// ---- the farm book: a Fields page (what goes where), the hands' day, and the market's takings
{const _eo=empOpen;empOpen=function(tab){if(tab!=='fields'){const r=_eo.apply(this,arguments);h33Tab(tab);return r;}
  const r=_eo.call(this,'hands');try{h33Fields();}catch(e){console.warn('fields',e);}return r;};}
function h33Tab(tab){const N=$('noteText');if(!N)return;const bar=N.querySelector('.bztabs');if(!bar||bar.querySelector('[data-emtab="fields"]'))return;
  const b=document.createElement('button');b.dataset.emtab='fields';b.textContent='Fields';if(tab==='fields'){bar.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');}
  const hb=bar.querySelector('[data-emtab="hands"]');bar.insertBefore(b,hb?hb.nextSibling:null);b.onclick=()=>setTimeout(()=>empOpen('fields'),0);}
function h33Fields(){const N=$('noteText');if(!N)return;h33Tab('fields');const bar=N.querySelector('.bztabs');
  // clear what the Hands page put after the tabs
  let n=bar.nextSibling;while(n){const nx=n.nextSibling;n.remove();n=nx;}
  const Q=H33(),box=handBox().seeds,host=h33Host();const lands=h33Lands();const boss=h33Hired('ruth');
  const crops=Object.keys(SEEDS).filter(k=>h33InSeason(k));
  let h=`<p class="bzs">Tell the hands what goes where. They clear and till the ground, sow it from the seed box${boss?' (or with seed Ruth buys)':''}, water it and pick it. “Hands choose” means the best-paying crop in season they have seed for; “Leave it to me” and they won’t touch it.</p>`;
  for(const L of lands){const T=tiles.filter(t=>h33LandOf(t)===L.id);if(!T.length)continue;const p=h33Plan(L.id);
    const st=`${T.length} squares · ${T.filter(t=>t.tilled).length} tilled · ${T.filter(t=>t.crop).length} planted · ${T.filter(t=>t.crop&&t.crop.stage>=3).length} ripe`;
    const opts=[['auto','Hands choose']].concat(crops.map(k=>[k,`${SEEDS[k].name}${box[k]?` (${box[k]} in the box)`:''}`]),[['none','Leave it to me']]);
    h+=bizRow(`<b>${L.name}</b><small>${st}</small>`,'',`<select data-h33plan="${L.id}" ${host||true?'':'disabled'}>${opts.map(([k,l])=>`<option value="${k}" ${p===k?'selected':''}>${l}</option>`).join('')}</select>`);}
  const sb=Object.entries(box).filter(([k,n])=>n>0).map(([k,n])=>`${n} ${(SEEDS[k]||{}).name||k}`).join(', ')||'empty';
  h+=`<h4>Seed</h4>`+bizRow(`<b>The seed box</b><small>${sb}. Fill it at the corner of Grandpa’s field.</small>`,'','');
  h+=bizRow(`<b>Seed money</b><small>${boss?`When the box runs short, Ruth buys the seed the plan needs from your coins at the store’s price${free6()?' (free just now)':''}.`:'Hire Ruth Calloway (the Hands page) and she’ll buy whatever seed the plan needs.'}</small>`,'',
    boss?`<button data-h33buy="1">${Q.buy?'On':'Off'}</button>`:'');
  const T=Q.today;if(T&&Q.day===S.day)h+=`<h4>Today</h4><p class="bzs">${[T.till&&`${T.till} squares cleared and tilled`,T.pick&&`${T.pick} picked`,T.sow&&`${T.sow} sown`,T.water&&`${T.water} watered`].filter(Boolean).join(', ')||'Nothing to do today.'}</p>`;
  if(Q.log.length)h+=`<h4>The market</h4>`+Q.log.map(e=>`<p class="bzs">Day ${e.day}: Cyrus sold ${e.n} crop${e.n>1?'s':''} for ${e.v}.</p>`).join('');
  const box2=document.createElement('div');box2.innerHTML=h;N.appendChild(box2);
  N.querySelectorAll('[data-h33plan]').forEach(s=>s.onchange=()=>{h33SetPlan(s.dataset.h33plan,s.value);});
  N.querySelectorAll('[data-h33buy]').forEach(b=>b.onclick=()=>{h33SetBuy(!H33().buy);setTimeout(()=>empOpen('fields'),0);});}
function h33SetPlan(id,v){if(!/^[a-z0-9_]{1,24}$/.test(id)||!(v==='auto'||v==='none'||SEEDS[v]))return;H33().plan[id]=v;
  if(typeof empRelay==='function'&&typeof empGuest==='function'&&empGuest())empRelay('h33plan',{id,v});SFX.page&&SFX.page();}
function h33SetBuy(on){H33().buy=!!on;if(typeof empGuest==='function'&&empGuest())empRelay('h33buy',{on:!!on});}
// a farmhand's plan reaches the host's book
{const _hw=hostWire;hostWire=function(){const r0=_hw.apply(this,arguments);const r=CO.room;if(!r||!r.on)return r0;
  HOST.off.push(r.on('empbuy',m=>{if(!m||m.isMe||HOST.role!=='host'||!m.data)return;try{const d=m.data;if(d.k==='h33plan')h33SetPlan(String(d.id||''),String(d.v||''));else if(d.k==='h33buy')H33().buy=!!d.on;}catch(e){}}));
  return r0;};}
{const css=document.createElement('style');css.textContent='#noteText select[data-h33plan]{font:13px \'Hollow Pixel\',monospace;background:#f4ead2;color:#2a1a0e;border:2px solid #8a6440;padding:2px 4px;max-width:46vw}';document.head.appendChild(css);}
