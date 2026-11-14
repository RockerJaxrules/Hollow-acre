/* ================= a minigame for every recipe, made of the steps of actually making it: chop the turnips then stir the soup, crack the egg
   then flip it, pump the bellows then pour the bar, saw the board then drive the nails, sew then wax, braid the rug, trace the pumpkin's face.
   Nine small mechanics, each drawn for what's being made; each recipe is one to three of them in a row. The average is the quality. ================= */
const CG2_ART={turnip:['#f2ece4','#9a4aa0'],pumpkin:['#e8742a','#b04a14'],corn:['#f0c040','#7aa64c'],mushroom:['#7ae8d0','#2a8a7a'],wood:['#c08a50','#7d5636'],straw:['#e8cf7a','#b08a3a'],bone:['#efe8dc','#b0a890']};
const CG2_STEPS={
  'cook:soup':[{m:'marks',tool:'knife',items:['turnip','turnip','turnip'],t:'Chop the turnips'},{m:'heat',kind:'stir',col:['#c8a040','#e8c868'],band:[.45,.72],t:'Keep it at a simmer'}],
  'cook:egg_fried':[{m:'gauge',art:'crack',t:'Crack it into the pan',zone:.1},{m:'gauge',art:'flip',t:'Flip it when the white sets',zone:.09}],
  'cook:pie':[{m:'mash',kind:'roll',need:16,time:4.5,t:'Roll out the crust'},{m:'marks',tool:'fork',items:['pumpkin','pumpkin','pumpkin','pumpkin'],t:'Crimp the edge'},{m:'heat',kind:'oven',band:[.5,.76],t:'Bake it golden'}],
  'cook:chowder':[{m:'marks',tool:'knife',items:['corn','corn','corn'],t:'Cut the corn off the cob'},{m:'heat',kind:'stir',col:['#e8d8a0','#fff0c8'],band:[.4,.66],t:'Stir in the cream, don’t let it catch'}],
  'cook:hash':[{m:'marks',tool:'knife',items:['turnip','pumpkin','corn'],t:'Dice it all'},{m:'gauge',art:'toss',n:3,t:'Toss the pan',zone:.11}],
  'cook:glowstew':[{m:'marks',tool:'knife',items:['mushroom','mushroom'],t:'Slice the glowcaps'},{m:'heat',kind:'stir',col:['#2a8a7a','#7ae8d0'],band:[.3,.55],t:'Barely simmer. It glows hotter than it is.'}],
  'b_furnace:cb':[{m:'heat',kind:'bellows',band:[.55,.82],t:'Pump the bellows: keep it copper-hot'},{m:'pour',liquid:'copper',t:'Pour to the line'}],
  'b_furnace:ib':[{m:'heat',kind:'bellows',band:[.66,.86],t:'Pump the bellows: iron wants it hotter'},{m:'pour',liquid:'iron',t:'Pour to the line'}],
  'b_furnace:ch':[{m:'heat',kind:'smoulder',band:[.16,.38],t:'Keep it smouldering, not burning'}],
  'b_weapon:club':[{m:'saw',t:'Saw the blank from the oak'},{m:'marks',tool:'whittle',items:['wood','wood','wood','wood'],t:'Shave it to a grip'}],
  'b_weapon:sickle':[{m:'heat',kind:'bellows',band:[.6,.84],t:'Heat the copper'},{m:'hammer',what:'anvil',n:3,t:'Hammer the curve'},{m:'gauge',art:'quench',t:'Quench it at straw colour',zone:.09}],
  'b_weapon:machete':[{m:'heat',kind:'bellows',band:[.66,.86],t:'Heat the iron'},{m:'hammer',what:'anvil',n:4,t:'Draw out the blade'},{m:'gauge',art:'quench',t:'Quench it at straw colour',zone:.08}],
  'b_armor:jacket':[{m:'rhythm',kind:'sew',n:8,t:'Sew the seams'},{m:'heat',kind:'wax',band:[.5,.8],t:'Rub the wax in'}],
  'b_armor:coat':[{m:'rhythm',kind:'sew',n:8,t:'Sew the seams'},{m:'hammer',what:'rivet',n:4,t:'Set the copper rivets'}],
  'b_armor:mail':[{m:'rhythm',kind:'link',n:10,t:'Link the rings'}],
  'b_furn:chair':[{m:'saw',t:'Saw the legs'},{m:'hammer',what:'nail',n:3,t:'Nail it together'}],
  'b_furn:lamp':[{m:'gauge',art:'glass',t:'Set the chimney glass on straight',zone:.09},{m:'pour',liquid:'oil',t:'Fill the font to the line'}],
  'b_furn:shelf':[{m:'saw',t:'Saw the boards'},{m:'hammer',what:'nail',n:4,t:'Nail the shelves in'}],
  'b_furn:rug':[{m:'rhythm',kind:'braid',n:10,t:'Braid the rags'}],
  'b_furn:pumpkin':[{m:'trace',t:'Carve the face: hold on the lines, let go on the gaps'}],
  'b_furn:crates':[{m:'saw',t:'Saw the slats'},{m:'hammer',what:'nail',n:4,t:'Nail the corners'}],
  'b_farm:spr':[{m:'hammer',what:'rivet',n:3,t:'Rivet the brass'},{m:'heat',kind:'pump',band:[.5,.78],t:'Pump it: test the spray'}],
  'craft:sprinkler':[{m:'hammer',what:'rivet',n:3,t:'Rivet the brass'},{m:'heat',kind:'pump',band:[.5,.78],t:'Pump it: test the spray'}],
  'b_farm:fert':[{m:'mash',kind:'grind',need:22,time:4.5,t:'Grind the bones'}],
  'b_farm:ts':[{m:'rhythm',kind:'sift',n:8,t:'Sift the seed from the chaff'}],
  'b_farm:ps':[{m:'marks',tool:'scoop',items:['pumpkin','pumpkin','pumpkin'],t:'Scoop out the seeds'}],
  'b_farm:charm':[{m:'rhythm',kind:'straw',n:6,t:'Braid the straw'}],
  'craft:scare':[{m:'rhythm',kind:'straw',n:6,t:'Braid the straw'}],
  'craft:flask':[{m:'pour',liquid:'oil',t:'Fill the flask to the line'}],
  'craft:candle':[{m:'gauge',art:'dip',n:3,t:'Dip the wick when the tallow’s just warm',zone:.11}]};
const CG2_MORE={};   // more mechanics, added by craftgames2.js: (step, helpers) => mechanic
const CG2_SCENE={cook:'kitchen',b_furnace:'forge',b_weapon:'forge',b_armor:'sewing',b_furn:'bench',b_farm:'bench',craft:'bench'};

function craftGame2(v,r,steps,done){const box=$('cgame'),cv=$('cgC'),g=cv.getContext('2d');g.imageSmoothingEnabled=false;const W=240,H=120;
  const fine=matchMedia('(pointer:fine)').matches;const scene=CG2_SCENE[v]||'bench';
  const px=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const text=(t,x,y,c)=>{t=String(t).toUpperCase();let X=Math.round(x-t.length*2);for(const ch of t){const f=PXFONT[ch]||PXFONT[' '];for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(f[j*3+i]==='1'){px(X+i+1,y+j+1,1,1,'#1a0e06');px(X+i,y+j,1,1,c);}X+=4;}};
  const IC={};const icon=(n,x,y,s)=>{if(!IC[n]){IC[n]=new Image();IC[n].src=iconOf(n);}const im=IC[n];if(im.complete&&im.naturalWidth)g.drawImage(im,Math.round(x),Math.round(y),32*(s||1),32*(s||1));};
  const parts=[];const burst=(x,y,n,c,sp)=>{for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*(sp||70),vy:-20-Math.random()*(sp||50),t:0,c});};
  // a back wall for each station
  const wall=()=>{const P={kitchen:['#3a2a1c','#33251a','#2c1f15'],forge:['#2a2624','#24201e','#1e1a19'],sewing:['#3a2c2a','#342624','#2c2020'],bench:['#33200f','#2c1c10','#281a0e']}[scene];
    for(let x=0;x<W;x+=12){px(x,0,12,H,P[hashI(x)%3]);px(x,0,1,H,'#140a04');for(let y=6+(x%17);y<H;y+=23)px(x+3,y,5,1,'rgba(0,0,0,.25)');}
    if(scene==='forge'){for(let y=0;y<H;y+=10)for(let x=(y/10)%2?0:10;x<W;x+=20)px(x,y,19,1,'rgba(0,0,0,.35)');}
    const gr=g.createRadialGradient(W/2,H/2,20,W/2,H/2,150);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=gr;g.fillRect(0,0,W,H);};
  const board=(x,y,w,h)=>{px(x,y,w,h,'#b07a48');for(let j=0;j<h;j+=3)px(x,y+j,w,1,j%6?'#a06c3c':'#c08a54');px(x,y,w,1,'#d8a46a');px(x,y+h-1,w,1,'#6a4424');};
  // ---------- the mechanics
  const MECH={
    // a tool sweeps along; tap as it passes each mark
    marks(sp){const n=sp.items.length,marks=sp.items.map((_,i)=>.16+i*(.68/Math.max(1,n-1))+(n===1?.34:0)+(Math.random()-.5)*.05),hit=[];let pos=0,dir=1,sweeps=0,chopT=0;
      return {hint:`${fine?'Click':'Tap'} as the ${sp.tool==='fork'?'fork':sp.tool==='scoop'?'spoon':'blade'} passes each mark.`,
        update(dt){pos+=dir*dt*(.55+sweeps*.1);if(pos>1){pos=1;dir=-1;sweeps++;}if(pos<0){pos=0;dir=1;sweeps++;}chopT=Math.max(0,chopT-dt*4);if(sweeps>=4)this.finish();},
        finish(){if(this.done)return;this.done=true;this.score=marks.reduce((a,_,i)=>a+(hit[i]||0),0)/n;},
        down(){let best=-1,bd=1;marks.forEach((m,i)=>{if(hit[i]!==undefined)return;const d=Math.abs(pos-m);if(d<bd){bd=d;best=i;}});
          if(best>=0&&bd<.1){const s=bd<.022?1:bd<.05?.65:.3;hit[best]=s;chopT=1;const it=sp.items[best];const C=CG2_ART[it]||CG2_ART.wood;burst(24+marks[best]*192,72,12,s>.6?C[0]:C[1]);SFX.thud&&SFX.thud(0,.3);
            if(hit.filter(x=>x!==undefined).length===n)setTimeout(()=>this.finish(),300);}else{SFX.deny&&SFX.deny();}},
        draw(t){board(14,74,212,26);sp.items.forEach((it,i)=>{const x=24+marks[i]*192;if(sp.tool==='fork'){px(x-20,64,40,10,'#e8b070');px(x-20,64,40,2,'#f8d090');}else icon(it,x-16,48,1);
            const c=hit[i];px(x,44,1,4,c===undefined?'#fff4c6':c>.6?'#9be07a':c>.25?'#e8c070':'#c04a2a');if(c!==undefined&&sp.tool==='knife'){px(x,48,1,30,'#2a1a10');}if(c!==undefined&&sp.tool==='fork')for(let k=-2;k<=2;k++)px(x+k*3,66,1,3,'#a06a30');});
          const tx=24+pos*192,ty=chopT>0?54:40;
          if(sp.tool==='knife'){px(tx-1,ty,3,22,'#cfd6dc');px(tx-1,ty,1,22,'#ffffff');px(tx-2,ty-10,5,10,'#5c3a20');px(tx-2,ty-10,1,10,'#8a5a30');}
          else if(sp.tool==='fork'){for(let k=-1;k<=1;k++)px(tx+k*2,ty+6,1,8,'#cfd6dc');px(tx-2,ty+4,5,2,'#cfd6dc');px(tx,ty-10,1,14,'#b8c0c8');}
          else if(sp.tool==='scoop'){px(tx,ty-10,2,16,'#b8c0c8');px(tx-3,ty+6,8,4,'#cfd6dc');px(tx-2,ty+9,6,1,'#8a9098');}
          else{px(tx-8,ty+8,16,3,'#cfd6dc');px(tx-8,ty+8,16,1,'#ffffff');px(tx-12,ty+7,4,5,'#5c3a20');px(tx+8,ty+7,4,5,'#5c3a20');}}};},
    // a needle swings; tap in the window (with a picture that does the thing)
    gauge(sp){const n=sp.n||1,res=[];let nd=0,dir=1,anim=0;const zone=()=>.5+Math.sin(res.length*2.3+1)*.22;
      return {hint:`${fine?'Click':'Tap'} when the needle is in the gold.`,
        update(dt){nd+=dir*dt*(.8+res.length*.15);if(nd>1){nd=1;dir=-1;}if(nd<0){nd=0;dir=1;}anim=Math.max(0,anim-dt*2);},
        down(){if(this.done)return;const d=Math.abs(nd-zone());const s=d<sp.zone*.45?1:d<sp.zone?.65:d<sp.zone*1.8?.3:0;res.push(s);anim=1;SFX[s>.5?'plant':'thud']&&SFX[s>.5?'plant':'thud'](0,.25);
          burst(120,70,8,s>.6?'#ffe08a':'#a08060');if(res.length>=n){setTimeout(()=>{this.done=true;this.score=res.reduce((a,b)=>a+b,0)/n;},500);}},
        draw(t){const zc=zone();
          // the picture
          if(sp.art==='crack'||sp.art==='flip'||sp.art==='toss'||sp.art==='fishflip'){px(70,84,100,8,'#383b46');px(70,84,100,2,'#6f7480');px(170,86,40,4,'#5c3a20');for(let i=0;i<12;i++){const f=Math.sin(t*11+i*1.7);px(76+i*8,96+f,5,6,i%2?'#e8742a':'#f0a040');}
            if(sp.art==='crack'){if(res.length){px(98,78,44,7,'#fff8ec');px(112,78,14,6,'#f0b030');}else{const ex=120+Math.sin(t*2)*30;px(ex-6,44,12,15,'#f4ecd8');px(ex-6,44,3,15,'#ffffff');}}
            else if(sp.art==='flip'){const up=anim>0?Math.sin(anim*Math.PI)*30:0;const set=Math.min(1,t*.2);px(98,78-up,44,7,set>.5?'#fff8ec':'#e8e4d8');px(112,78-up,14,6,'#f0b030');}
            else if(sp.art==='fishflip'){const up=anim>0?Math.sin(anim*Math.PI)*28:0,cr=Math.min(1,t*.18);const sk=res.length?['#c88a3a','#e8b060']:cr>.6?['#b8783a','#d8a050']:['#a8b8b0','#d0dcd4'];
              for(let x=-20;x<=20;x++){const hh=Math.round(6*Math.sqrt(Math.max(0,1-(x/21)*(x/21))));px(120+x,80-up-hh,1,hh*2,x<0?sk[1]:sk[0]);}for(let y=-5;y<=5;y++)px(140+Math.abs(y)*.6,80-up+y,3,1,sk[0]);px(104,78-up,2,2,'#1a1a1a');for(let i=0;i<4;i++)px(110+i*7,76-up,4,1,'#8a5a2a');}
            else{const up=anim>0?Math.sin(anim*Math.PI)*22:0;for(let i=0;i<9;i++)px(90+i*7,76-up*(1-Math.abs(i-4)/5),5,4,['#f2ece4','#e8742a','#f0c040'][i%3]);}}
          else if(sp.art==='quench'){px(40,86,160,8,'#3a3d46');const heat=nd;const col=heat>.8?'#fff4c0':heat>.6?'#ffd27a':heat>.45?'#e8a040':heat>.3?'#c05a2a':'#5a3a3a';px(60,74,110,6,col);px(60,74,110,1,'#ffffff');px(170,72,22,10,'#5c3a20');
            for(let i=0;i<5;i++){g.globalAlpha=.3;px(70+i*20+Math.sin(t*3+i)*3,60-((t*20+i*9)%20),4,3,'#e8e4dc');g.globalAlpha=1;}}
          else if(sp.art==='dip'){px(90,82,60,22,'#8a7a60');px(92,82,56,4,'#efe2b8');for(let i=0;i<res.length+1;i++){}const cw=2+res.length*2;px(120-cw/2,46+anim*10,cw,24+res.length*4,'#f4ecd0');px(119,40+anim*10,1,6,'#2a1a10');}
          else if(sp.art==='glass'){px(96,88,48,14,'#c89a3a');px(96,88,48,2,'#f0d27a');px(104,84,32,4,'#a07a2a');const gx=120+Math.sin(t*2.2)*30*(res.length?0:1);px(gx-9,44+(res.length?30:0),18,30,'rgba(200,226,240,.55)');px(gx-9,44+(res.length?30:0),2,30,'#ffffff');}
          if(sp.artFn)sp.artFn(HLP,t,{res,anim,nd});
          // the gauge (the quench one is a colour strip, hottest on the right)
          const x=24,y=14,w=192;px(x-3,y-3,w+6,14,'#4a3410');px(x-2,y-2,w+4,12,'#a8822c');px(x,y,w,8,'#1a1008');
          if(sp.art==='quench'){for(let i=0;i<w;i++){const h=i/w;px(x+i,y+1,1,6,h>.8?'#fff4c0':h>.6?'#ffd27a':h>.45?'#e8a040':h>.3?'#c05a2a':'#5a3a3a');}}
          const z=(a,c)=>px(x+(zc-a)*w,y+1,(a*2)*w,6,c);z(sp.zone*1.8,'rgba(90,58,24,.9)');z(sp.zone,'#a87420');z(sp.zone*.45,'#ffd27a');
          const nx=x+nd*w;px(nx-1,y-6,3,4,'#f4ecd8');px(nx,y-2,1,12,'#f4ecd8');for(let i=0;i<n;i++)px(108+i*10,30,6,3,i<res.length?(res[i]>.6?'#9be07a':res[i]>.25?'#e8c070':'#c04a2a'):'#4a3420');}};},
    // hold to raise it, let go to drop it: keep it in the band until it's done
    heat(sp){let v=sp.kind==='smoulder'?.5:.25,inb=0,total=0,prog=0;const [lo,hi]=sp.band;const dur=sp.kind==='smoulder'?4:3.2;
      return {hint:sp.kind==='stir'?'Hold to stir. Keep it in the band.':sp.kind==='oven'?'Hold to stoke the oven. Keep it in the band.':sp.kind==='smoulder'?'Hold to bank it with earth. Too much air and it burns.':sp.kind==='pump'?'Hold to pump. Keep the pressure in the band.':sp.kind==='wax'?'Hold to rub. Keep it warm, not scorched.':'Hold to pump the bellows. Keep the heat in the band.',
        update(dt){const up=this.hold;if(sp.kind==='smoulder')v+=(up?-.5:.32)*dt;else v+=(up?.55:-.34)*dt;v=Math.max(0,Math.min(1.08,v));total+=dt;if(v>lo&&v<hi){inb+=dt;prog+=dt/dur;}
          if(prog>=1||total>dur*2.8){this.done=true;this.score=Math.min(1,inb/Math.max(dur,total)*1.15)*(prog>=1?1:.8);}},
        draw(t){const good=v>lo&&v<hi;
          if(sp.kind==='stir'){px(0,92,W,28,'#25272f');px(0,92,W,2,'#6f7480');for(let i=0;i<14;i++){const f=Math.sin(t*11+i*1.7)*(.4+v);px(64+i*8,104+f,5,8-f,i%2?'#e8742a':'#f0a040');}
            const cx=120,top=60,pw=78;for(let y=0;y<32;y++){const w2=pw/2-Math.max(0,y-24)*1.2;px(cx-w2,top+y,w2*2,1,y<3?'#6f7480':'#383b46');}px(cx-pw/2,top-1,pw,5,sp.col[0]);
            for(let i=0;i<6;i++){const bx=cx-pw/2+6+((i*29+Math.floor(t*(2+v*6))*7)%(pw-12)),ph=(t*(1+v*3)+i*.37)%1;if(ph<.7)px(bx,top-1-(ph>.5?1:0),ph>.5?3:2,ph>.5?2:1,sp.col[1]);}
            const sa=t*(this.hold?12:2);px(cx+Math.cos(sa)*20,top-20,3,22,'#b67f42');if(v>hi){for(let i=0;i<4;i++)px(cx-30+i*18,top-10-((t*30+i*7)%14),3,3,'#3a3a3a');}}
          else if(sp.kind==='oven'){px(60,30,120,80,'#383b46');px(60,30,120,3,'#6f7480');px(76,48,88,48,'#140c08');const glow=Math.min(1,v);const gr=g.createRadialGradient(120,80,4,120,80,50);gr.addColorStop(0,`rgba(255,${(140+glow*80)|0},60,${.2+glow*.6})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(76,48,88,48);
            const br=Math.min(1,prog);px(92,74,56,10,br>.7?'#b06a28':br>.35?'#d89a48':'#e8c890');px(92,74,56,2,'#f8dca0');if(v>hi)px(92,74,56,10,'rgba(40,20,10,.5)');}
          else if(sp.kind==='smoulder'){px(40,96,160,8,'#3a2a1d');for(let i=0;i<16;i++){const h=10+Math.sin(i*1.3)*4;px(52+i*8,96-h,8,h,'#4a3a2a');}const flame=v;for(let i=0;i<10;i++){const f=Math.sin(t*9+i)*3;if(flame>.4)px(60+i*12,80-flame*20+f,4,6+flame*10,'#f0a040');else px(60+i*12,84+f*.3,3,3,'#e8742a');}
            for(let i=0;i<6;i++){g.globalAlpha=.35;px(60+i*20+Math.sin(t+i)*4,70-((t*12+i*6)%40),6,4,'#8a8a8a');g.globalAlpha=1;}}
          else if(sp.kind==='pump'){px(100,84,40,16,'#c89a3a');px(100,84,40,2,'#f0d27a');for(let a=-3;a<=3;a++){const hgt=v*60;for(let k=0;k<6;k++){const s=k/6;px(120+a*s*hgt*.25,84-s*hgt+s*s*hgt*.6,2,2,'#9fd0f0');}}px(150,70,4,30,'#6f7480');px(146,66+(this.hold?Math.sin(t*20)*4:0),12,4,'#959aa5');}
          else if(sp.kind==='wax'){px(50,60,140,44,'#7a5a3a');for(let j=0;j<44;j+=4)px(50,60+j,140,1,'#6a4a2a');const sh=Math.min(1,prog);g.globalAlpha=sh*.6;px(50,60,140*sh,44,'#c8a070');g.globalAlpha=1;const bx=60+((t*120)%120)*(this.hold?1:.2);px(bx,70,20,14,'#efe2b8');px(bx,70,20,2,'#fff8e0');if(v>hi)for(let i=0;i<3;i++)px(bx+i*6,64-((t*20+i*5)%10),2,2,'#5a5a5a');}
          else{px(0,112,W,8,'#2a1d14');if(SPR.furnace)(()=>{const m=SPR.furnace,im=IMG[m.src];if(im)g.drawImage(im,0,0,m.fw,m.fh,4,49,m.fw,m.fh);})();const glow=Math.min(1,v);const gr=g.createRadialGradient(28,100,2,28,100,22+glow*16);gr.addColorStop(0,`rgba(255,${(170+glow*70)|0},80,${.25+glow*.55})`);gr.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=gr;g.fillRect(-12,60,80,80);
            const sq=this.hold?.5+.12*Math.sin(t*28):1,bh=Math.round(16*sq);px(60,100-bh-3,40,3,'#93602f');for(let j=0;j<bh;j++)px(61,100-bh+j,38-Math.abs(j-bh/2)*1.4,1,j%3===0?'#472014':j%3===1?'#91482b':'#6c321f');px(60,100,40,3,'#6c401f');px(48,100-bh/2-2,13,3,'#50545f');}
          // the meter
          const tx=206,ty=12;px(tx-4,ty-3,16,96,'#7a5a1a');px(tx-3,ty-2,14,94,'#cfa646');px(tx+1,ty,6,82,'#1a1210');px(tx+1,ty+82*(1-hi),6,82*(hi-lo),'#2c4a1c');const lv=Math.min(1,v);px(tx+2,ty+82*(1-lv),4,82*lv,good?'#ffd27a':v>hi?'#ff5a2a':'#7a9ac0');
          px(14,10,150*Math.min(1,prog),4,'#9be07a');px(14,10,150,1,'#4a3420');text(sp.kind==='smoulder'?'smoulder':sp.kind==='stir'?'simmer':sp.kind==='oven'?'bake':sp.kind==='pump'?'pressure':sp.kind==='wax'?'wax':'heat',40,18,'#f4ecd8');}};},
    // hold to pour; let go at the line
    pour(sp){let fill=0,pouring=false,stopped=false;const line=.72+Math.random()*.12;const col=sp.liquid==='copper'?['#ff9a3a','#ffd27a']:sp.liquid==='iron'?['#ffb060','#fff0b0']:['#c8a040','#f0d27a'];
      return {hint:'Hold to pour. Let go at the line.',
        update(dt){if(stopped)return;if(this.hold){pouring=true;fill+=dt*(.32+fill*.25);}else if(pouring){stopped=true;const d=Math.abs(fill-line);this.score=fill>1.02?.15:d<.03?1:d<.07?.7:d<.13?.4:.15;SFX.coin&&SFX.coin();setTimeout(()=>{this.done=true;},450);}
          if(fill>1.08&&!stopped){stopped=true;this.score=.1;setTimeout(()=>{this.done=true;},450);}},
        draw(t){const mx=96,my=60,mw=48,mh=44;
          if(sp.artFn)sp.artFn(HLP,t,{fill,mx,my,mw,mh});
          if(sp.liquid==='oil'){px(mx+6,my-6,mw-12,mh+6,'rgba(200,226,240,.35)');px(mx+6,my-6,2,mh+6,'#ffffff');px(mx+16,my-14,mw-32,8,'#a07a2a');}else{px(mx-6,my,mw+12,mh+6,'#4a4c54');px(mx-6,my,mw+12,2,'#8a8c94');}
          const fh=Math.min(1,fill)*mh;px(mx,my+mh-fh,mw,fh,col[0]);px(mx,my+mh-fh,mw,1,col[1]);if(fill>1)px(mx-6,my-2,mw+12,3,col[0]);
          const ly=my+mh-line*mh;for(let x=mx-8;x<mx+mw+8;x+=4)px(x,ly,2,1,'#9be07a');
          const ang=this.hold&&!stopped?.9:.15;g.save();g.translate(150,30);g.rotate(ang);if(sp.liquid==='oil'){px(-12,-8,24,14,'#7a6a40');px(-12,-8,24,2,'#a89a60');px(-16,-2,6,3,'#7a6a40');}else{px(-10,-8,20,16,'#383b46');px(-10,-8,20,2,'#959aa5');px(-8,-6,16,4,col[0]);}g.restore();
          if(this.hold&&!stopped){for(let y=38;y<my+mh-fh;y+=2)px(136+Math.sin(y+t*30),y,2,2,col[0]);}}};},
    // the saw runs along by itself: hold to steer it down, let go to let it rise. Stay on the pencil line.
    saw(sp){let x=0,y=.5,vy=0,on=0,total=0;const line=s=>.5+Math.sin(s*5.2+1)*.22+Math.sin(s*11)*.06;const kerf=[];
      return {hint:'Hold to steer the saw down, let go to let it rise. Follow the pencil line.',
        update(dt){x+=dt*.2;vy+=(this.hold?2.2:-2.2)*dt;vy=Math.max(-.9,Math.min(.9,vy));y+=vy*dt;y=Math.max(0,Math.min(1,y));total+=dt;const d=Math.abs(y-line(x));if(d<.06)on+=dt;kerf.push([x,y,d<.06]);
          if(Math.random()<.5)parts.push({x:20+x*200,y:30+y*70,vx:(Math.random()-.5)*30,vy:-10,t:0,c:'#e8c890'});if(x>=1){this.done=true;this.score=Math.min(1,on/total*1.1);}},
        draw(t){px(14,24,212,82,'#b07a48');for(let j=0;j<82;j+=4)px(14,24+j,212,1,j%8?'#a06c3c':'#c08a54');px(14,24,212,1,'#d8a46a');
          for(let s=0;s<1;s+=.01){const yy=30+line(s)*70;px(20+s*200,yy,(s*100|0)%3?1:0,1,'#2a1a10');}for(const [kx,ky,ok] of kerf)px(20+kx*200,30+ky*70,1,1,ok?'#3a2010':'#a03020');
          const sx_=20+x*200,sy=30+y*70,sh=Math.sin(t*30)*2;px(sx_-26+sh,sy-3,28,6,'#cfd6dc');px(sx_-26+sh,sy-3,28,1,'#ffffff');for(let k=0;k<28;k+=3)px(sx_-26+sh+k,sy+3,2,1,'#8a9098');px(sx_-38+sh,sy-6,12,12,'#7a4a24');px(sx_-36+sh,sy-3,6,6,'#3a2010');}};},
    // a ring shrinks round the nail head: strike as it closes on it
    hammer(sp){const n=sp.n,res=[];let r=1,k=0,anim=0,driven=[];const xs=sp.pos?sp.pos.map(p=>p[0]-10):Array.from({length:n},(_,i)=>40+i*(160/Math.max(1,n-1)));const ys=sp.pos?sp.pos.map(p=>p[1]):xs.map(()=>74);
      return {hint:`${fine?'Click':'Tap'} as the ring closes on the ${sp.what==='anvil'?'hot spot':sp.what==='rivet'?'rivet':'nail'}.`,
        update(dt){if(this.done)return;r-=dt*(.9+k*.12);anim=Math.max(0,anim-dt*4);if(r<-.15){res.push(0);driven[k]=.3;k++;r=1;SFX.deny&&SFX.deny();if(k>=n)this.end();}},
        end(){setTimeout(()=>{this.done=true;this.score=res.reduce((a,b)=>a+b,0)/n;},400);},
        down(){if(this.done||k>=n)return;const d=Math.abs(r-.12);const s=d<.05?1:d<.12?.65:d<.22?.3:0;res.push(s);driven[k]=s;anim=1;SFX.thud&&SFX.thud(0,.45);burst(xs[k]+10,74,10,sp.what==='anvil'?'#ffd27a':'#e8c890',90);k++;r=1;if(k>=n)this.end();},
        draw(t){if(sp.artFn){sp.artFn(HLP,t,{driven,k});if(k<n){const cx=xs[k]+10,cy=ys[k]-4;const rr=Math.max(0,r)*30+4;g.strokeStyle='#ffd27a';g.lineWidth=1;g.beginPath();g.arc(cx,cy,rr,0,Math.PI*2);g.stroke();g.strokeStyle='rgba(155,224,122,.8)';g.beginPath();g.arc(cx,cy,.12*30+4,0,Math.PI*2);g.stroke();const hy=anim>0?cy-20:cy-40;px(cx-2,hy-14,4,18,'#7a4a24');px(cx-8,hy+4,16,7,'#6f7480');px(cx-8,hy+4,16,2,'#959aa5');}return;}
          if(sp.what==='anvil'){px(50,86,140,10,'#3a3d46');px(50,86,140,2,'#6f7480');px(90,96,60,16,'#2a2c34');px(60,76,120,10,'#ff9a3a');px(60,76,120,2,'#ffe0a0');}
          else if(sp.what==='rivet'){px(24,74,192,26,'#7a5a3a');for(let j=0;j<26;j+=5)px(24,74+j,192,1,'#6a4a2a');}else board(20,74,200,26);
          xs.forEach((x,i)=>{const dv=driven[i];const hgt=dv===undefined?10:Math.round(10*(1-dv));const c=sp.what==='rivet'?'#d88a40':sp.what==='anvil'?'#fff0b0':'#9aa0a8';px(x+8,74-hgt,3,hgt,c);px(x+6,72-hgt,7,2,c);});
          if(k<n){const cx=xs[k]+10,cy=70;const rr=Math.max(0,r)*30+4;g.strokeStyle='#ffd27a';g.lineWidth=1;g.beginPath();g.arc(cx,cy,rr,0,Math.PI*2);g.stroke();g.strokeStyle='rgba(155,224,122,.8)';g.beginPath();g.arc(cx,cy,.12*30+4,0,Math.PI*2);g.stroke();
            const hy=anim>0?50:30;px(cx-2,hy-14,4,18,'#7a4a24');px(cx-8,hy+4,16,7,'#6f7480');px(cx-8,hy+4,16,2,'#959aa5');}}};},
    // arrows slide in; press the side they ask for as they reach the line
    rhythm(sp){const n=sp.n,notes=Array.from({length:n},(_,i)=>({t:1.1+i*.62,s:Math.random()<.5?-1:1,hit:null}));let tm=0;const strands=sp.kind==='braid'?['#b25645','#d6ad52','#90abc2']:sp.kind==='straw'?['#e8cf7a','#c8a050','#f0dc90']:['#cfd6dc','#cfd6dc','#cfd6dc'];
      return {hint:fine?'Press A or ← for a left arrow, D or → for a right one, as it reaches the line. (Or click that half.)':'Tap the left or right half as each arrow reaches the line.',
        update(dt){tm+=dt;for(const nt of notes)if(nt.hit===null&&tm-nt.t>.22){nt.hit=0;SFX.deny&&SFX.deny();}if(tm>notes[n-1].t+.6&&!this.done){this.done=true;this.score=notes.reduce((a,b)=>a+(b.hit||0),0)/n;}},
        side(s){let best=null,bd=1;for(const nt of notes){if(nt.hit!==null)continue;const d=Math.abs(tm-nt.t);if(d<bd){bd=d;best=nt;}}if(!best||bd>.3)return;
          if(best.s!==s){best.hit=0;SFX.deny&&SFX.deny();return;}best.hit=bd<.07?1:bd<.15?.65:.3;SFX.page&&SFX.page();burst(120,70,6,strands[notes.indexOf(best)%3]);},
        draw(t){// what's being made, growing with every good hit
          const done=notes.filter(x=>x.hit>0).length;
          if(sp.kind==='sew'){px(30,62,180,40,'#6a5440');for(let j=0;j<40;j+=4)px(30,62+j,180,1,'#5a4434');for(let i=0;i<n;i++){px(40+i*20,80,10,1,i<done?'#efe2b8':'rgba(239,226,184,.25)');if(i<done)px(40+i*20,81,10,1,'#c8b890');}px(40+done*20,74,2,12,'#cfd6dc');}
          else if(sp.kind==='link'){for(let i=0;i<n;i++){const x=34+(i%10)*18,y=80+(i%2)*6;g.strokeStyle=i<done?'#d8dee4':'rgba(184,192,200,.25)';g.lineWidth=2;g.beginPath();g.ellipse(x,y,7,5,0,0,Math.PI*2);g.stroke();if(i<done){g.strokeStyle='#ffffff';g.lineWidth=1;g.beginPath();g.ellipse(x-1,y-1,5,3,0,Math.PI,Math.PI*1.6);g.stroke();}}g.lineWidth=1;}
          else if(sp.kind==='sift'){px(80,66,80,8,'#7a5a3a');for(let i=0;i<8;i++)px(84+i*9+Math.sin(t*20)*2,62,4,4,'#c8b080');for(let i=0;i<done*3;i++)px(90+(i*13)%60,100-(i%3),2,2,'#5a4020');}
          else{const x0=40+done*16;for(let k=0;k<3;k++){for(let x=x0;x<226;x+=2)px(x,74+k*7+Math.sin(x*.12+k*2+t*2)*1.5,2,3,strands[k]);}for(let i=0;i<done;i++){for(let k=0;k<3;k++)px(40+i*16,74+k*4+(i%2)*2,14,3,strands[(i+k)%3]);px(40+i*16,74,1,14,'rgba(0,0,0,.3)');}}
          // the lane
          px(10,20,220,24,'rgba(0,0,0,.35)');px(40,20,2,24,'#9be07a');
          for(const nt of notes){if(nt.hit!==null)continue;const x=40+(nt.t-tm)*120;if(x>230||x<4)continue;const c=nt.s<0?'#ffd27a':'#90c8f0';px(x-6,26,12,12,c);px(x-6,26,12,1,'#ffffff');
            for(let j=0;j<5;j++)px(x+(nt.s<0?-3+j:3-j),32-j,1,1+2*j>0?1:1,'#1a0e06'),px(x+(nt.s<0?-3+j:3-j),32+j,1,1,'#1a0e06');}
          text('L',20,48,'#ffd27a');text('R',220,48,'#90c8f0');}};},
    // tap as fast as you can
    mash(sp){let taps=0,tm=0,lastSide=0;const o={hint:sp.alt?(fine?'Press A/← and D/→ in turn (or click left, right, left…) as fast as you can.':'Tap left, right, left, right… as fast as you can.'):`${fine?'Click (or Space)':'Tap'} as fast as you can.`,
        update(dt){tm+=dt;if((taps>=sp.need||tm>sp.time)&&!this.done){this.done=true;this.score=Math.min(1,taps/sp.need)*(taps>=sp.need?1:.85);}},
        down(){taps++;SFX.thud&&SFX.thud(0,.15);burst(120,80,3,sp.kind==='grind'?'#efe8dc':'#e8c890',40);},
        draw(t){const p=Math.min(1,taps/sp.need);
          if(sp.artFn)sp.artFn(HLP,t,{p,taps,side:lastSide});
          else if(sp.kind==='grind'){px(90,70,60,30,'#6f7480');px(90,70,60,3,'#959aa5');px(96,66,48,6,'#383b46');for(let i=0;i<10;i++)px(100+i*4,66-(1-p)*8+(i%2),3,3,p>.6?'#f4f0e8':'#d8d0c0');const a=taps*.8;px(120+Math.cos(a)*14,50+Math.sin(a)*4,4,20,'#7a4a24');}
          else{const rr=16+p*34;g.fillStyle='#e8c890';g.beginPath();g.ellipse(120,82,rr,rr*.4,0,0,Math.PI*2);g.fill();px(120-28,62+Math.sin(taps)*2,56,8,'#c08a54');px(120-36,63+Math.sin(taps)*2,8,6,'#7a4a24');px(120+28,63+Math.sin(taps)*2,8,6,'#7a4a24');}
          px(14,10,212*p,6,'#9be07a');px(14,16,212*Math.max(0,1-tm/sp.time),2,'#e8a040');}};
      // alternating sides only count when they alternate (shucking, twisting)
      if(sp.alt)o.side=function(s){if(this.done||s===lastSide)return;lastSide=s;this.down();};return o;},
    // a pumpkin face: hold on the drawn lines as the knife reaches them, let go on the gaps
    trace(sp){const segs=sp.segs||[[.0,.12,1],[.12,.2,0],[.2,.32,1],[.32,.4,0],[.4,.62,1],[.62,.7,0],[.7,.9,1],[.9,1,0]];let s=0,good=0,total=0;
      const path=sp.path||(u=>{if(u<.2)return [80+u/.2*24,54+Math.abs(u/.2-.5)*-14+7];if(u<.4)return [136+(u-.2)/.2*24,54+Math.abs((u-.2)/.2-.5)*-14+7];const v=(u-.4)/.6;return [82+v*76,82+Math.sin(v*Math.PI)*10];});
      if(sp.artFn)return {hint:sp.hint||'Hold while the blade is on a line. Let go on the gaps.',
        update(dt){s+=dt*(sp.speed||.16);total+=dt;const seg=segs.find(q=>s>=q[0]&&s<q[1]);if(seg&&(!!this.hold)===!!seg[2])good+=dt;if(s>=1&&!this.done){this.done=true;this.score=Math.min(1,good/total*1.08);}},
        draw(t){sp.artFn(HLP,t,{s,segs,path,hold:this.hold});}};
      return {hint:'Hold while the knife is on a line. Let go on the gaps.',
        update(dt){s+=dt*.16;total+=dt;const seg=segs.find(q=>s>=q[0]&&s<q[1]);if(seg&&(!!this.hold)===!!seg[2])good+=dt;if(s>=1&&!this.done){this.done=true;this.score=Math.min(1,good/total*1.08);}},
        draw(t){const cx=120,cy=70;for(let y=-40;y<=40;y++)for(let x=-56;x<=56;x+=2){if(x*x/3136+y*y/1600>1)continue;const rib=Math.abs(Math.sin(x/56*Math.PI*1.6));px(cx+x,cy+y,2,1,rib<.15?'#b04a14':y<-20?'#f0904a':'#e8742a');}px(cx-2,cy-48,5,10,'#5a7a2a');
          for(const [a,b,cut] of segs){for(let u=a;u<b;u+=.003){const [x,y]=path(u);if(!cut)continue;if(u<s){px(x-1,y-1,3,3,'#2a1006');px(x,y,1,1,'#ffb040');}else if(((u*400)|0)%3!==0){px(x,y,2,2,'#fff0c8');}}}
          const [kx,ky]=path(Math.min(.999,s));px(kx-1,ky-14,3,14,'#cfd6dc');px(kx-2,ky-20,5,7,'#5c3a20');if(this.hold)burst(kx,ky,1,'#f0a040',20);}};}};
  // ---------- running the steps
  box.style.display='flex';CG.on=true;let i=0;const scores=[];let cur=null,wait=0,last=performance.now(),result=null,banner=null;
  $('cgT').textContent=r.name;
  const HLP={g,W,H,px,text,icon,burst,board,fine,parts};
  const start=()=>{const m=steps[i].m;cur=MECH[m]?MECH[m](steps[i]):CG2_MORE[m](steps[i],HLP);cur.hold=false;$('cgH').innerHTML=`<b>${steps.length>1?`${i+1}/${steps.length} · `:''}${steps[i].t}.</b> ${cur.hint}`;};
  const finishAll=()=>{if(result!==null)return;result=scores.reduce((a,b)=>a+b,0)/scores.length;setTimeout(()=>{box.style.display='none';CG.on=false;removeEventListener('keydown',kd,true);removeEventListener('keyup',ku,true);cv.onpointerdown=cv.onpointerup=cv.onpointercancel=null;done(result);},700);};
  const down=(x)=>{if(!cur||cur.done||wait>0)return;A.init&&A.init();if(cur.side&&x!==undefined){cur.side(x<W/2?-1:1);return;}cur.hold=true;cur.down&&cur.down();};
  const up=()=>{if(cur)cur.hold=false;};
  const kd=e=>{if(e.code==='Escape'){e.preventDefault();e.stopPropagation();scores.push(.5);finishAll();return;}
    if(cur&&cur.side&&/^(KeyA|ArrowLeft|KeyD|ArrowRight)$/.test(e.code)){e.preventDefault();e.stopPropagation();if(!e.repeat&&wait<=0&&!cur.done)cur.side(/KeyA|ArrowLeft/.test(e.code)?-1:1);return;}
    if(e.code==='Space'||e.code==='Enter'||e.code==='KeyC'){e.preventDefault();e.stopPropagation();if(!e.repeat)down();}};
  const ku=e=>{if(e.code==='Space'||e.code==='Enter'||e.code==='KeyC')up();};addEventListener('keydown',kd,true);addEventListener('keyup',ku,true);
  cv.onpointerdown=e=>{e.preventDefault();cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);const rc=cv.getBoundingClientRect();down((e.clientX-rc.left)/rc.width*W);};cv.onpointerup=cv.onpointercancel=()=>up();
  $('cgSkip').onclick=()=>{scores.push(.5);finishAll();};
  start();
  const frame=now=>{if(result!==null&&!CG.on)return;const dt=Math.min(.05,(now-last)/1000)*(window.CG2_SPEED||1);last=now;const t=now/1000;window.CG2_NOW=result===null?steps[i].m+':'+i:'';
    if(cur&&!cur.done&&wait<=0)cur.update(dt);
    if(cur&&cur.done&&wait<=0&&result===null){scores.push(cur.score||0);const s=cur.score||0;banner={txt:s>.9?'Perfect':s>.65?'Good':s>.35?'Rough':'Ruined',c:s>.9?'#ffd27a':s>.65?'#9be07a':s>.35?'#e8c070':'#c04a2a',t:0};
      if(i<steps.length-1){wait=.9;}else{finishAll();}}
    if(wait>0){wait-=dt;if(wait<=0){i++;start();}}
    g.clearRect(0,0,W,H);wall();cur&&cur.draw(t);
    for(let k=parts.length-1;k>=0;k--){const p=parts[k];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt;if(p.t>.8){parts.splice(k,1);continue;}px(p.x,p.y,2,2,p.c);}
    if(banner){banner.t+=dt;if(banner.t<1.1){px(70,48,100,18,'rgba(20,12,6,.8)');text(banner.txt,120,54,banner.c);}}
    for(let k=0;k<steps.length;k++)px(W-10-(steps.length-k)*8,H-8,6,4,k<scores.length?(scores[k]>.65?'#9be07a':scores[k]>.35?'#e8c070':'#c04a2a'):k===i?'#f4ecd8':'#4a3420');
    requestAnimationFrame(frame);};requestAnimationFrame(frame);}
// every recipe that has its own steps uses them; anything else keeps the old game
{const _cg=craftGame;craftGame=function(type,r,done){const v=typeof CR!=='undefined'&&CR.v;const steps=CG2_STEPS[v+':'+r.k];if(steps)return craftGame2(v,r,steps,done);return _cg.apply(this,arguments);};}
