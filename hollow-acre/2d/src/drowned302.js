/* ================= (#302) The drowned of Old Wickham, the close-up redrawn (the same picture at every gore level).
   The old street under the reservoir, seen down through the water: the far side of the street with its roofs and walls going into
   a green-teal murk, the lamp post, the bicycle on its side, the cobbles. Six of the drowned stand in the street with their backs to
   you, all turned up and to the left (north-west, toward your farm): two men in top hats, women in their Sunday dresses, one with a
   hat, and a small girl in green. Each one's hair lifts off the back of the head as one soft tapering mass with loose strands
   waving off it, every head of hair its own length, curl and drift. What says water: the light from the surface lies on the
   street and the walls as a net of caustics, the far side fades into the haze, silt has settled on the ledges and lies in a low
   bank over the street, motes hang in the water, weed sways all one way, and bubbles still come up from three of them. Their coats
   and dresses are lit from above and to the left with their hems lifting, and each stands on its own soft shadow.
   Same size (160 x 104) and the same figures, heights and places as before. The Extreme layer (gorex375.js, behind GX2_DROWNED)
   wraps this picture as it wrapped the old one; nothing here is gore. ================= */
function drw302Paint(P){
  const W=160,H=104,B=new Float32Array(W*H*3),FG=new Uint8Array(W*H);
  const hx=s=>{const n=parseInt(s.slice(1),16);return [n>>16,(n>>8)&255,n&255];};
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  const mul=(a,f)=>[a[0]*f,a[1]*f,a[2]*f];
  const inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
  const set=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(!inb(x,y))return;const k=(y*W+x)*3;B[k]=c[0];B[k+1]=c[1];B[k+2]=c[2];};
  const get=(x,y)=>{x=Math.max(0,Math.min(W-1,Math.round(x)));y=Math.max(0,Math.min(H-1,Math.round(y)));const k=(y*W+x)*3;return [B[k],B[k+1],B[k+2]];};
  const tint=(x,y,c,t)=>{if(inb(x,y))set(x,y,mix(get(x,y),c,t));};
  const hs=(x,y,s)=>{let h=Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(s|0,1013904223)|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;};
  const vn=(x,y,s)=>{const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
    const a=hs(xi,yi,s),b=hs(xi+1,yi,s),c=hs(xi,yi+1,s),d=hs(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};
  const wor=(x,y,s)=>{const xi=Math.floor(x),yi=Math.floor(y);let f1=9,f2=9;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){
      const cx=xi+i+.15+.7*hs(xi+i,yi+j,s),cy=yi+j+.15+.7*hs(xi+i,yi+j,s+71),d=Math.hypot(x-cx,y-cy);if(d<f1){f2=f1;f1=d;}else if(d<f2)f2=d;}return f2-f1;};
  // the water's own colour, lighter toward the surface, and the haze everything far away sinks into
  const HZ=y=>mix([66,122,104],[36,78,68],Math.min(1,y/104));
  const haze=(c,y,t)=>mix(c,HZ(y),t);
  // a hue-shifted ramp from one colour: shadows go to plum-blue, lights to the water's green-gold
  const ramp=c=>{const C=typeof c==='string'?hx(c):c;return [mix(mul(C,.46),[16,10,34],.32),mix(mul(C,.72),[26,18,46],.2),C,mix(mul(C,1.32),[118,146,118],.14),mix(mul(C,1.62),[160,186,150],.24)];};

  // ---------------------------------------------------------------- the water over the far side of the street
  for(let y=0;y<46;y++)for(let x=0;x<W;x++){let c=mix([60,114,98],[30,68,61],y/45);const v=vn(x/18,y/9,3);c=mix(c,[70,124,106],v*.12);set(x,y,c);}
  // the surface far above: a bright rippled skin along the top
  for(let y=0;y<7;y++){const k=Math.pow(1-y/7,1.6);for(let x=0;x<W;x++){const r=wor(x/9+Math.sin(y*.9+x*.07)*.3,y/1.7+x*.02,11);
      let c=get(x,y);c=mix(c,[96,156,136],k*.32);if(r<.2)c=mix(c,[156,212,188],k*(r<.09?.85:.5));set(x,y,c);}}
  // ---------------------------------------------------------------- the houses across the street, roofs toward us
  const HS=[[4,40],[54,44],[110,46]],ROOF=ramp('#26443f'),WALL=ramp('#2c4c47'),SILT=[104,138,118];
  for(const [hx0,hw] of HS){
    for(let y=6;y<22;y++){const co=Math.floor((y-6)/3),r=(y-6)%3;for(let x=hx0-1;x<hx0+hw+1;x++){const u=(x-hx0)/hw;let t=r===2?0:r===0?3:2;
        if(r!==2&&((x-hx0+co*3+((co*7)%4))%6===0))t=1;if(t===2&&u>.72)t=1;if(t===3&&u>.55)t=2;if(t===2&&u<.18&&r===1)t=3;set(x,y,ROOF[t]);}}
    for(let x=hx0-1;x<hx0+hw+1;x++){set(x,6,(x-hx0)%9<6?SILT:ROOF[3]);set(x,5,hs(x,5,2)<.5?mix(get(x,5),SILT,.5):get(x,5));}
    for(let x=hx0-1;x<hx0+hw+1;x++){set(x,22,[12,28,28]);set(x,23,[16,34,33]);}
    for(let y=24;y<44;y++)for(let x=hx0;x<hx0+hw;x++){const u=(x-hx0)/hw;let t=(y-24)%4===3?1:2;if(u>.8&&t===2)t=1;set(x,y,WALL[t]);}
    for(let y=24;y<44;y++){set(hx0,y,WALL[3]);set(hx0+hw-1,y,WALL[1]);}
    for(let wx=hx0+5;wx<hx0+hw-8;wx+=14){for(let y=28;y<35;y++)for(let x=wx;x<wx+7;x++)set(x,y,[10,24,24]);
      for(let x=wx;x<wx+7;x++){set(x,28,WALL[3]);set(x,31,WALL[1]);}for(let y=28;y<35;y++){set(wx+3,y,WALL[1]);set(wx,y,WALL[2]);}
      set(wx+1,29,[30,54,52]);set(wx+4,29,[26,48,46]);for(let x=wx-1;x<wx+8;x++){set(x,35,SILT);set(x,36,[18,36,34]);}}
    const dx=hx0+hw-11;for(let y=32;y<44;y++)for(let x=dx;x<dx+7;x++)set(x,y,[9,20,20]);for(let x=dx-1;x<dx+8;x++){set(x,31,WALL[3]);set(x,30,SILT);}
    for(let y=33;y<44;y++)set(dx+1,y,[16,30,30]);
  }
  // the pavement along the house fronts and the kerb
  for(let x=0;x<W;x++){set(x,44,hs(x,44,5)<.7?[46,82,74]:[40,74,66]);set(x,45,[34,64,58]);set(x,46,[14,30,28]);}
  // ---------------------------------------------------------------- the street: cobbles, smaller toward the far side
  {let y=47,row=0;const T=[[24,52,48],[28,58,53],[21,47,44]];while(y<H){const h=y<56?3:y<72?4:5,sw=h+2,off=(row%2)*Math.floor(sw/2)+Math.floor(hs(row,1,9)*2);
      for(let x=-sw;x<W+sw;x+=sw){const k=Math.floor((x+off)/sw),sx=k*sw-off,tone=T[Math.floor(hs(k,row,4)*3)],lit=hs(k,row,6)<.3;
        for(let j=0;j<h;j++)for(let i=0;i<sw;i++){const X=sx+i,Y=y+j;if(X<0||X>=W||Y>=H)continue;let c=tone;
          if(j===h-1||i===sw-1)c=[16,37,34];else if(j===0&&lit)c=mix(tone,[60,98,86],.55);else if(i===sw-2||j===h-2)c=mix(tone,[18,30,40],.3);set(X,Y,c);}}
      y+=h;row++;}}
  // ---------------------------------------------------------------- caustics: the light from the surface, a broken net on the street, the walls and the roofs
  const caus=(x,y,cs,Y,str,seed)=>{const m=Math.max(0,Math.min(1,(vn(x/24,Y*.75,seed+9)-.36)*3));if(m<=0)return;
    const wx=x+(vn(x/8,Y*1.9,seed)-.5)*6,wy=Y+(vn(x/9,Y*1.2,seed+3)-.5)*.25;const f=wor(wx/cs,wy,seed);
    if(f<.07)tint(x,y,[140,198,172],str*m*(f<.035?1:.7));else if(f<.17)tint(x,y,[104,164,142],str*m*.28);};
  {let Y=0;for(let y=47;y<H;y++){const d=(y-47)/57;Y+=1/(14*(.34+.3*d));for(let x=0;x<W;x++)caus(x,y,14,Y,.4+.32*d,21);}}
  for(const [hx0,hw] of HS){for(let y=24;y<44;y++)for(let x=hx0;x<hx0+hw;x++)caus(x,y,9,y/7,.3,33);for(let y=7;y<22;y++)for(let x=hx0-1;x<hx0+hw+1;x++)caus(x,y,10,y/4.5,.34,44);}
  for(let y=44;y<46;y++)for(let x=0;x<W;x++)caus(x,y,10,y/3,.36,55);
  // weed up the walls and along the kerb, all swaying the same way (the current runs to the right)
  const weed=(x0,y0,len,ph,c1,c2)=>{for(let j=0;j<len;j++){const x=x0+Math.round(Math.sin(j*.45+ph)*1.2+j*.18);set(x,y0-j,j<len*.4?c1:c2);if(j<len*.5&&j%3===1)set(x+1,y0-j,c1);}};
  for(const [hx0,hw] of HS)for(let i=0;i<4;i++){const sx=hx0+3+i*Math.floor(hw/4)+Math.floor(hs(hx0,i,8)*3);weed(sx,43,7+((i*5+hx0)%7),i*1.7,[34,72,50],[48,96,62]);}
  for(const [x0,l,ph] of [[18,6,0],[47,8,1.2],[63,5,2.2],[99,7,.4],[150,6,1.9]])weed(x0,46,l,ph,[30,66,46],[46,92,58]);
  // the haze: the far side of the street sinks into the water
  for(let y=0;y<H;y++){const t=y<44?.27+.15*(1-y/44):y<47?.3:.3*Math.pow(Math.max(0,1-(y-47)/57),1.35);for(let x=0;x<W;x++)set(x,y,haze(get(x,y),y,t));}
  // ---------------------------------------------------------------- the lamp post, dead, silt on its head
  {const LP=ramp('#2c4a46'),t=.24;const s=(x,y,c)=>set(x,y,haze(c,y,t));for(let y=23;y<68;y++){s(101,y,LP[1]);s(102,y,LP[3]);s(103,y,LP[2]);s(104,y,LP[0]);}
    for(let x=99;x<107;x++){s(x,17,x<101?SILT:LP[3]);s(x,22,LP[0]);}for(let y=18;y<22;y++){s(99,y,LP[1]);s(106,y,LP[0]);for(let x=100;x<106;x++)s(x,y,x<102?[74,118,104]:[52,92,82]);}
    s(100,18,[110,150,130]);for(let x=99;x<107;x++)s(x,16,(x%3)?SILT:LP[2]);for(let x=99;x<107;x++){s(x,68,LP[0]);s(x,69,[14,30,28]);}s(100,67,LP[2]);s(105,67,LP[1]);
    for(let j=0;j<9;j++)s(100+Math.round(Math.sin(j*.6)*1+j*.2),66-j,j<4?[34,72,50]:[48,96,62]);}
  // ---------------------------------------------------------------- a low bank of stirred silt over the street, stepped edges
  for(let y=74;y<92;y++)for(let x=0;x<W;x++){const top=78+Math.round(vn(x/14,1,61)*6),bot=86+Math.round(vn(x/12,2,62)*5);if(y<top||y>bot)continue;
    const e=Math.min(y-top,bot-y);tint(x,y,[74,116,102],e<1?.1:e<2?.17:.23);}
  // ---------------------------------------------------------------- the bicycle on its side, gone the colour of the water
  {const t=.04,Bk=[92,138,124],Bl=[132,178,160],D=[20,40,38];const s=(x,y,c)=>{set(x,y,haze(c,y,t));FG[Math.round(y)*W+Math.round(x)]=200;};
    for(let x=116;x<152;x++)for(let y=96;y<101;y++){const e=((x-134)/18)**2+((y-98)/2.6)**2;if(e<1)tint(x,y,[10,24,24],e<.5?.5:.3);}
    const ring=(cx,cy,r)=>{for(let a=0;a<6.283;a+=.06){const x=Math.round(cx+Math.cos(a)*r),y=Math.round(cy+Math.sin(a)*r*.7);s(x,y,(a>3.4&&a<5.6)?Bl:a<1.2||a>5.9?Bk:mix(Bk,D,.35));}
      s(cx,cy,Bl);for(const a of [0.4,1.5,2.6,3.7,4.8,5.9])s(Math.round(cx+Math.cos(a)*r*.5),Math.round(cy+Math.sin(a)*r*.35),mix(Bk,D,.4));};
    ring(124,92,6);ring(142,92,6);for(let i=0;i<=10;i++){s(124+i*.9,92-i*.5,Bk);s(133+i*.9,87+i*.5,Bk);}for(let x=132;x<136;x++)s(x,86,Bl);s(132,87,D);
    for(let y=86;y<92;y++)s(142,y,Bk);for(let x=141;x<145;x++)s(x,85,Bl);
    for(let x=118;x<150;x++){const h=Math.round(1.5+vn(x/5,3,71)*2.5);for(let j=0;j<h;j++)if(hs(x,j,72)<.92)tint(x,98-j,[92,128,110],j===h-1?.55:.4);}}

  // ---------------------------------------------------------------- the people
  const SKIN=ramp('#98b6ac'),OL=[8,18,19];
  const FIGS=[
    {id:1,x:52,y:64,c:'#583e54',hair:'#4a3a30',dress:1,bub:[[2,-31],26],
     hr:[{cap:1,sx:0,sy:5.5,a:-22,L:8,w:9,g:0,tp:.5,b:-1.2,A:11,f:.55,wo:1,wf:1.7},
         {rib:1,noTip:1,sx:2.2,sy:4,a:-19,L:12,w:3.2,b:-1.1,A:13,f:.55,ph:.3,t:2,tp:.8},{rib:1,noTip:1,sx:0,sy:2.5,a:-23,L:14.5,w:3.4,b:-1.2,A:13,f:.55,ph:0,t:3,tp:.8},
         {rib:1,noTip:1,sx:-2.2,sy:4,a:-27,L:12.5,w:3,b:-1.3,A:14,f:.55,ph:-.4,t:2,tp:.8}]},
    {id:2,x:80,y:70,c:'#40546c',hair:'#4a3028',hat:'#36465a',dress:1,
     hr:[{bun:1,sx:-.4,sy:5.6,r:2.6},{rib:1,sx:1.6,sy:4.6,a:48,L:6,w:2.2,b:-4,A:16,f:.9,ph:0,t:2,tp:1},{rib:1,sx:1.2,sy:6.6,a:70,L:5,w:1.8,b:-6,A:16,f:1,ph:1.5,t:3,tp:1},
         {rib:1,sx:-2.6,sy:4.4,a:-40,L:4,w:1.6,b:5,A:18,f:1,ph:2.5,t:3,tp:1}]},
    {id:3,x:26,y:72,c:'#444c62',hair:'#3e2c22',hat:'#1c2028',
     hr:[{rib:1,sx:3,sy:5.5,a:86,L:2.6,w:2.4,b:-16,t:2,tp:1},{rib:1,sx:2.6,sy:7.5,a:104,L:2,w:2,b:-16,ph:1,t:3,tp:1},{rib:1,sx:-3.4,sy:6.5,a:-84,L:1.6,w:2,b:14,t:3,tp:1}]},
    {id:4,x:116,y:74,c:'#4a4a5a',hair:'#4a4c50',hat:'#22222c',bub:[[-8,-26],14],
     hr:[{rib:1,sx:-3.4,sy:3.5,a:-68,L:5.5,w:2.8,b:12,A:12,f:1,t:3,tp:1},{rib:1,sx:-3,sy:6,a:-96,L:5,w:2.6,b:15,A:12,f:1,ph:1.5,t:2,tp:1},
         {rib:1,sx:-1.2,sy:7.5,a:-124,L:3,w:2,b:20,ph:3,t:2,tp:1},{rib:1,sx:3,sy:5,a:76,L:3,w:2,b:-16,t:2,tp:1}]},
    {id:5,x:64,y:92,c:'#3a4c38',hair:'#ac9a6c',dress:1,s:.8,child:1,
     hr:[{rib:1,sx:3,sy:3,a:42,L:5,w:3.4,b:-10,A:34,f:1.4,ph:0,t:1},{rib:1,sx:1,sy:1,a:22,L:7,w:3.6,b:-4,A:36,f:1.3,ph:1.3,t:2},
         {rib:1,sx:-1.2,sy:1,a:4,L:7,w:3.6,b:3,A:36,f:1.3,ph:2.4,t:2},{rib:1,sx:-3,sy:3,a:-14,L:5,w:3.2,b:8,A:34,f:1.4,ph:3.4,t:3}]},
    {id:6,x:92,y:98,c:'#543a46',hair:'#3e2a20',dress:1,bub:[[3,-31],30],
     hr:[{cap:1,sx:0,sy:5.5,a:-26,L:10,w:9,g:0,tp:.5,b:-.6,A:5,f:.3,wo:.9,wf:1.4},
         {rib:1,noTip:1,sx:2.2,sy:4,a:-24,L:14,w:3.2,b:-.5,A:6,f:.3,ph:.3,t:2,tp:.8},{rib:1,noTip:1,sx:0,sy:2.5,a:-27,L:17,w:3.4,b:-.6,A:6,f:.3,ph:0,t:3,tp:.8},
         {rib:1,noTip:1,sx:-2.2,sy:4,a:-30,L:15,w:3,b:-.7,A:7,f:.3,ph:-.3,t:2,tp:.8}]}];
  const order=FIGS.slice().sort((a,b)=>a.y-b.y);
  // soft contact shadows first (light from above and to the left, so a little to the right)
  for(const F of FIGS){const s=F.s||1,cx=F.x+1,cy=F.y+1,rx=8.5*s,ry=2.4;for(let y=cy-3;y<=cy+3;y++)for(let x=Math.floor(cx-rx-1);x<=cx+rx+1;x++){const e=((x-cx)/rx)**2+((y-cy)/ry)**2;
      if(e<1)tint(x,y,[6,16,18],e<.35?.72:e<.7?.56:.34);}}
  for(const F of order)drw302Fig(F);

  function drw302Fig(F){
    const s=F.s||1,X0=F.x,Y0=F.y,t=Math.max(0,Math.min(.2,(100-Y0)/36*.2)),C=ramp(F.c),HR=ramp(F.hair),TR=ramp(mul(hx(F.c),.8));if(F.child)HR[0]=HR[1];   /* nothing dark on the girl's hair that could pass for a mark */
    const ox=X0-22,oy=Y0-64,LW=44,LH=72,L=new Uint8Array(LW*LH);   // part labels in a local box
    const lab=(x,y)=>{const i=x-ox,j=y-oy;return i>=0&&j>=0&&i<LW&&j<LH?L[j*LW+i]:0;},put=(x,y,v)=>{const i=x-ox,j=y-oy;if(i>=0&&j>=0&&i<LW&&j<LH)L[j*LW+i]=v;};
    const R=(a,b,w,h,v)=>{const X=Math.round(X0+a*s),Y=Math.round(Y0+b*s),ww=Math.max(1,Math.round(w*s)),hh=Math.max(1,Math.round(h*s));for(let j=Y;j<Y+hh;j++)for(let i=X;i<X+ww;i++)put(i,j,v);return [X,Y,ww,hh];};
    const sx_=a=>Math.round(X0+a*s),sy_=b=>Math.round(Y0+b*s);
    // 1 skirt 2 legL 3 legR 4 shoe 5 coat 6 armL 7 armR 8 hand 9 head 10 brim 11 crown 12 hair 13 lining 14 stocking
    let skirt=null;
    if(F.dress){skirt=R(-6,-12,12,12,1);R(-6,0,3,1,4);R(1,0,3,1,4);
      // the hem lifts: a bell that widens, its corners floating up, the stockings showing under it
      const [sX,sY,sw]=skirt,bot=sY+skirt[3]-1;for(let x=sX;x<sX+sw;x++)put(x,bot,0);
      for(let y=bot-3;y<=bot;y++){put(sX-1,y,y===bot?0:1);}put(sX-1,bot-4,1);for(let y=bot-4;y<bot-1;y++)put(sX+sw,y,1);put(sX+sw,bot-5,1);
      put(sX,bot-1,13);put(sX-1,bot-1,13);put(sX+sw,bot-2,13);put(sX+sw-1,bot-1,13);
      const sl=sx_(-5),sr=sx_(1);put(sl+1,bot,14);put(sr+1,bot,14);if(s===1){put(sl,bot,14);put(sr,bot,14);}}
    else{R(-4,-8,3,9,2);R(1,-8,3,9,3);R(-5,0,4,1,4);R(0,0,4,1,4);}
    const coat=R(-6,-22,12,13,5);
    if(!F.dress){const [cX,cY,cw,ch]=coat,bot=cY+ch-1;put(cX-1,bot,5);put(cX-1,bot-1,13);put(cX+cw,bot-1,5);put(cX+cw,bot-2,13);put(cX+5,bot,0);}
    R(-7,-20,2,8,6);R(5,-20,2,10,7);R(5,-11,2,3,8);
    const ho=F.child?0:-1,head=R(-5+ho,-30,7,9,9);
    // ---- the hair: one soft mass off the back of the head that spreads as it lifts and then tapers, short locks waving off its tip
    const HX=head[0]+head[2]/2-.5,HY=head[1],HL=new Map();
    const mass=(o)=>{const pts=[];let x=HX+o.sx*s,y=HY+o.sy*s;const Ls=o.L*s,n=Math.ceil(Ls*4);
      for(let q=0;q<=n;q++){const tt=q/4,u=tt/Ls,a=(o.a+o.b*tt/s+(o.A||0)*Math.sin((o.f||0)*tt/s+(o.ph||0)))*Math.PI/180;
        const wv=o.w*s*(1+(o.g||0)*Math.sin(Math.PI*Math.min(1,u*1.1)))*Math.pow(Math.max(0,1-u),o.tp||.7)/2;
        pts.push({x,y,tx:Math.sin(a),ty:-Math.cos(a),u,wl:Math.max(.35,wv+(o.wo||.9)*Math.sin(tt*(o.wf||1.5)/s+(o.ph||0))*Math.min(1,u*3)),wr:Math.max(.35,wv+(o.wo||.9)*Math.sin(tt*(o.wf||1.5)*.8/s+2+(o.ph||0))*Math.min(1,u*3))});
        x+=Math.sin(a)*.25;y-=Math.cos(a)*.25;}
      let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of pts){x0=Math.min(x0,p.x-p.wl-1);x1=Math.max(x1,p.x+p.wr+1);y0=Math.min(y0,p.y-p.wl-1);y1=Math.max(y1,p.y+p.wr+1);}
      for(let j=Math.floor(y0);j<=Math.ceil(y1);j++)for(let i=Math.floor(x0);i<=Math.ceil(x1);i++){let best=null,bd=1e9;for(const p of pts){const d=(i-p.x)**2+(j-p.y)**2;if(d<bd){bd=d;best=p;}}
        const dx=i-best.x,dy=j-best.y,along=dx*best.tx+dy*best.ty,pd=dy*best.tx-dx*best.ty;   /* pd<0: the left side */
        const hw=pd<0?best.wl:best.wr;if(o.cap&&best===pts[0]&&along<0){if(Math.hypot(dx,dy)>hw+.35)continue;}else{if(Math.abs(along)>.75)continue;if(Math.abs(pd)>hw+.35)continue;}
        const pn=pd/(hw+.35),u=best.u;let tn=pn<-.42?3:pn>.4?1:2;if(pn<-.62&&u<.45)tn=4;
        for(const [off,t2,u0,u1] of o.streaks||[])if(Math.abs(pd-off*(hw+.35))<.5&&u>u0&&u<u1)tn=t2;
        HL.set(j*W+i,{t:tn,m:1});}
      return pts;};
    const lock=(o,p)=>{const hw=(o.side||0)<0?p.wl:p.wr,sd=o.side||0;let x=p.x+sd*hw*(-p.ty),y=p.y+sd*hw*(p.tx);const a0=Math.atan2(p.tx,-p.ty)*180/Math.PI+(o.da||0);
      const Ls=o.L*s,n=Math.ceil(Ls*3);for(let q=0;q<=n;q++){const tt=q/3,u=tt/Ls,a=(a0+(o.b||0)*tt/s+(o.A||0)*Math.sin((o.f||0)*tt/s+(o.ph||0)))*Math.PI/180;
        const w=Math.max(1,(o.w||1)*s*(1-u*.7)),r=(w-1)/2;for(let j=Math.floor(y-r);j<=Math.ceil(y+r);j++)for(let i=Math.floor(x-r);i<=Math.ceil(x+r);i++){if(Math.hypot(i-x,j-y)>r+.5)continue;const k=j*W+i;
          const h=HL.get(k);if(h&&h.m)continue;HL.set(k,{t:o.t,m:0});}x+=Math.sin(a)/3;y-=Math.cos(a)/3;}};
    // a lock: a ribbon of hair from a root on the head, lit on its left edge and dark on its right, waving and thinning to its tip
    const rib=(o)=>{let x=HX+o.sx*s,y=HY+o.sy*s;const Ls=o.L*s,n=Math.ceil(Ls*4);for(let q=0;q<=n;q++){const tt=q/4,u=tt/Ls,a=(o.a+(o.b||0)*tt/s+(o.A||0)*Math.sin((o.f||0)*tt/s+(o.ph||0)))*Math.PI/180;
        const tx=Math.sin(a),ty=-Math.cos(a),w=Math.max(1,o.w*s*Math.pow(1-u,o.tp||.8)),r=(w-1)/2;if(o.noTip&&w<1.7)break;
        for(let j=Math.floor(y-r-1);j<=Math.ceil(y+r+1);j++)for(let i=Math.floor(x-r-1);i<=Math.ceil(x+r+1);i++){const dx=i-x,dy=j-y,along=dx*tx+dy*ty,pd=dy*tx-dx*ty;
          if(Math.abs(along)>.6||Math.abs(pd)>r+.5)continue;let tn=w<1.6?Math.max(2,o.t||2):pd<-r*.35?3:pd>r*.35?1:2;if(tn===3&&u<.35&&pd<-r*.7)tn=4;if(u>.85&&tn===1)tn=2;HL.set(j*W+i,{t:tn,m:1});}
        x+=tx/4;y+=ty/4;}};
    const bun=(o)=>{const cx=HX+o.sx*s,cy=HY+o.sy*s,r=o.r*s;for(let j=Math.floor(cy-r-1);j<=Math.ceil(cy+r+1);j++)for(let i=Math.floor(cx-r-1);i<=Math.ceil(cx+r+1);i++){const dx=i-cx,dy=j-cy,d=Math.hypot(dx,dy);if(d>r+.3)continue;
        const l=-(dx+dy)/(r*1.4);let tn=l>.45?3:l<-.35?1:2;if(l>.75)tn=4;if(Math.abs(dx*.6-dy)<.6&&d<r*.8)tn=1;HL.set(j*W+i,{t:tn,m:1});}};
    for(const o of F.hr){if(o.rib){rib(o);continue;}if(o.bun){bun(o);continue;}const pts=mass(o);for(const l of o.locks||[]){const p=pts[Math.min(pts.length-1,Math.round((l.at||1)*(pts.length-1)))];lock(l,p);}}
    for(const [k,v] of HL){const i=k%W,j=(k/W)|0;if(lab(i,j)===0||(lab(i,j)===9&&!v.m))put(i,j,v.m?12:15);else if(lab(i,j)===9&&v.m)put(i,j,12);}
    if(F.hat){R(-7+ho,-31,11,2,10);R(-4+ho,-35,6,4,11);}
    // ---- paint the parts
    const bb={};for(let j=0;j<LH;j++)for(let i=0;i<LW;i++){const v=L[j*LW+i];if(!v)continue;const b=bb[v]||(bb[v]=[1e9,1e9,-1e9,-1e9]);b[0]=Math.min(b[0],i+ox);b[1]=Math.min(b[1],j+oy);b[2]=Math.max(b[2],i+ox);b[3]=Math.max(b[3],j+oy);}
    const solid=v=>v&&v!==15;
    const edge=(x,y)=>{const v=lab(x,y);if(v===4||v===8||v===15||v===14)return 0;let e=0;if(!solid(lab(x-1,y)))e|=1;if(!solid(lab(x,y-1)))e|=2;if(!solid(lab(x+1,y)))e|=4;if(!solid(lab(x,y+1)))e|=8;return e;};
    const out=[];
    for(let j=0;j<LH;j++)for(let i=0;i<LW;i++){const v=L[j*LW+i];if(!v)continue;const x=i+ox,y=j+oy,b=bb[v],u=(x-b[0])/Math.max(1,b[2]-b[0]),w=(y-b[1])/Math.max(1,b[3]-b[1]);let c;
      const e=edge(x,y);
      if(v===5||v===1){let tn=2;if(u<.24)tn=3;if(u>.68)tn=1;if(v===5&&w<.12&&u<.62)tn=3;if(v===5&&w<.12&&u<.3)tn=4;
        if(v===5&&lab(x-1,y)===6)tn=1;if(v===5&&lab(x+1,y)===7)tn=0;
        if(v===5&&!F.dress&&x===X0&&y>b[1]+2)tn=y>b[3]-3?0:1;
        if(v===5&&F.dress&&y===b[3])tn=u<.3?2:1;
        if(v===5&&!F.dress&&y===b[3])tn=Math.min(tn,1);
        if(v===5&&!F.dress&&(x===sx_(-2)||x===sx_(3))&&y>sy_(-15))tn=Math.max(0,tn-1);
        if(v===1){const fx=[sx_(-3),sx_(0),sx_(3)];if(fx.includes(x)&&y>b[1]+1)tn=Math.max(0,tn-1);if(fx.includes(x+1)&&y>b[1]+2&&tn<3)tn++;if(y>=b[3]-1&&tn>1)tn--;}
        c=C[tn];}
      else if(v===13)c=C[0];
      else if(v===6)c=C[u<.5?2:3];
      else if(v===7)c=C[y<b[1]+2?2:1];
      else if(v===2||v===3){c=TR[v===2?(y<b[1]+2?3:2):1];}
      else if(v===14)c=[22,26,32];
      else if(v===4)c=(x===b[0]&&y===b[1])||lab(x-1,y)!==4?[40,50,52]:[10,15,17];
      else if(v===8)c=y===b[1]?C[0]:y===b[3]?(x===b[0]?SKIN[1]:SKIN[0]):(x===b[0]?mix(SKIN[1],SKIN[2],.4):SKIN[1]);
      else if(v===9){let tn=2;if(u<.3)tn=3;if(u>.7||w>.78)tn=1;if(u<.3&&w<.25)tn=4;if(x===sx_(-1+ho)&&w>.15&&w<.7)tn=Math.max(1,tn-1);if(F.hat&&lab(x,y-1)===10)tn=0;if(y===b[3]&&(x+F.id)%2)tn=0;c=HR[tn];}
      else if(v===12||v===15){const k=y*W+x,h=HL.get(k);c=HR[h?h.t:2];}
      else if(v===11){let tn=2;if(u<.25)tn=4;else if(u<.45)tn=3;if(u>.8)tn=1;if(y===b[3])tn=0;const HC=ramp(F.hat);c=HC[tn];if(y===b[1]&&!(e&2))c=HC[3];}
      else if(v===10){const HC=ramp(F.hat);c=y===b[1]?HC[u<.55?3:2]:HC[0];}
      if(e&&v!==12&&v!==15)c=(e&8||e&4)?OL:mix(c,OL,.62);
      else if(e&&v===12)c=(e&8||e&4)?HR[0]:(e&1||e&2)?HR[3]:c;
      out.push([x,y,c]);}
    for(const [x,y,c] of out){set(x,y,haze(c,y,t));if(inb(x,y))FG[y*W+x]=F.id;}
    // the same light net falls on them: on the hat tops, the hair and the shoulders, just under the top edge
    for(let i=0;i<LW;i++){let j0=-1;for(let j=0;j<LH;j++)if(solid(L[j*LW+i])){j0=j;break;}if(j0<0)continue;
      for(let j=j0+1;j<Math.min(LH,j0+4);j++){const v=L[j*LW+i],x=i+ox,y=j+oy;if(!v||v===4||v===8||edge(x,y))continue;caus(x,y,6,y/3.2,.55,90+F.id);}}
    // silt settled on the hat brim and crown
    if(F.hat){const br=bb[10],cr=bb[11];for(let x=cr[0];x<=cr[2];x++)if(hs(x,F.id,77)<.7)set(x,cr[1],haze(SILT,cr[1],t));for(let x=br[0];x<=br[2];x++)if(lab(x,br[1]-1)!==11&&hs(x,F.id,78)<.55)set(x,br[1],haze(SILT,br[1],t));}
    // ---- bubbles coming up from the face (in front of them, so just left of the head) and swelling as they rise
    if(F.bub){const [[bx,by],len]=F.bub;let x=sx_(bx),y=sy_(by),q=0;while(q<len){const sz=q<len*.55?2:3;const xx=Math.round(x+Math.sin(q*.5+F.id)*1.1);drw302Bub(xx,Math.round(y),sz);
        const gap=sz===2?3+Math.floor(hs(q,F.id,6)*3):5+Math.floor(hs(q,F.id,7)*3);y-=gap;q+=gap;x+=(hs(q,F.id,8)-.5)*1.2;}}
  }
  function drw302Bub(x,y,sz){const RIM=[150,204,186],IN=[70,120,108],HI=[214,240,228];
    if(sz===1){tint(x,y,RIM,.75);return;}
    if(sz===2){tint(x,y,HI,.8);tint(x+1,y,RIM,.6);tint(x,y+1,RIM,.6);tint(x+1,y+1,RIM,.35);return;}
    for(const [i,j] of [[1,0],[2,0],[0,1],[3,1],[0,2],[3,2],[1,3],[2,3]])tint(x+i,y+j,RIM,j>=2||i===3?.45:.7);tint(x+1,y+1,IN,.25);tint(x+2,y+2,IN,.15);tint(x+1,y,HI,.85);tint(x,y+1,HI,.6);}
  // ---------------------------------------------------------------- motes hanging in the water: small, round, no streaks; more low down
  for(let i=0;i<72;i++){const x=Math.floor(hs(i,1,91)*W),y=Math.floor(Math.pow(hs(i,2,92),.7)*(H-4))+2;if(FG[y*W+x]&&FG[y*W+x]!==200)continue;const k=hs(i,3,93);
    const c=hs(i,4,94)<.3?[150,196,176]:[96,140,124];tint(x,y,c,k<.22?.5:.38);if(k<.22){tint(x+1,y,c,.28);}else if(k<.34){tint(x+1,y,c,.18);tint(x+2,y,c,.1);}}   /* flecks lie along the current, never down it */
  // ---------------------------------------------------------------- write it out, a run of one colour at a time
  const hex=c=>'#'+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
  for(let y=0;y<H;y++){let x0=0,cur=hex(get(0,y));for(let x=1;x<=W;x++){const c=x<W?hex(get(x,y)):null;if(c!==cur){P(x0,y,x-x0,1,cur);x0=x;cur=c;}}}
  return {figs:FIGS.length};
}
if(typeof SGT_ART!=='undefined'&&typeof sgtC==='function')SGT_ART.drowned=()=>sgtC('a_drowned3',160,104,P=>{drw302Paint(P);});
