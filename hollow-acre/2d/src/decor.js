/* ================= #230 decorating your home, like Stardew's wallpaper and flooring, made ours. Inside your own home (Grandpa's
   cabin, or your cabin in a world with friends) a Decorate button opens the pattern book: wallpapers and floors, each bought
   once and then yours to use in any room you own. The new paper and boards are laid over the room as it is drawn, so the
   window light, the plank seams, the scuffs and the shadows under the wainscot all stay. One paper is only ours: Ward paper,
   printed with the valley's old ward knots, the ones on the stones. Furniture you place, move and turn as before. ======= */
const PAPERS={orig:{name:'Grandpa’s mustard boards',cost:0},
  sage:{name:'Sage stripe',cost:60,a:[118,138,104],b:[100,120,90],pat:'stripe',st:6},
  rose:{name:'Dusty rose damask',cost:90,a:[158,106,102],b:[188,138,128],pat:'diamond',st:12},
  navy:{name:'Navy pinstripe',cost:80,a:[58,68,98],b:[104,114,148],pat:'pin',st:8},
  cream:{name:'Cream sprig',cost:70,a:[214,200,166],b:[164,96,84],c:[106,130,88],pat:'sprig',st:10},
  white:{name:'Whitewashed boards',cost:50,a:[206,200,188],b:[168,160,146],pat:'board',st:10},
  plum:{name:'Plum and gold',cost:110,a:[92,56,80],b:[190,154,80],pat:'dot',st:9},
  ward:{name:'Ward paper',cost:140,a:[198,188,160],b:[124,54,44],pat:'ward',st:16,lore:'Pale paper printed with the old ward knots, the ones cut into the stones in the woods. The printer in Wickham wouldn’t say who ordered the first roll, in 1871.'}};
const FLOORS={orig:{name:'Walnut planks',cost:0},oak:{name:'Pale oak',cost:60,a:[170,130,86]},ash:{name:'Grey ash',cost:60,a:[140,134,124]},
  red:{name:'Barn-red painted boards',cost:70,a:[128,58,44]},green:{name:'Green painted boards',cost:70,a:[74,98,68]},
  checker:{name:'Black and cream tiles',cost:120,a:[206,196,172],b:[50,44,42],pat:'checker',st:16},flag:{name:'Flagstone',cost:140,a:[132,126,116],pat:'flag'}};
function decS(){S.decor=S.decor||{own:{paper:['orig'],floor:['orig']},rooms:{}};return S.decor;}
if(typeof PERSONAL!=='undefined'&&!PERSONAL.includes('decor'))PERSONAL.push('decor');
// which rooms are yours to decorate
function decRooms(){const out=[];if(typeof HOST==='undefined'||HOST.role!=='guest')out.push('cabin');
  if(typeof homeOf==='function'){const h=homeOf(NAME()||'Farmhand');if(Number.isInteger(h))out.push('fcab'+h);if(h==='cabin'&&!out.includes('cabin'))out.push('cabin');}return out;}
const decMine=()=>!!S.room&&decRooms().includes(S.room);
// ---- laying paper and boards over a shell
function decPaint(x,y,P){const st=P.st||8;const m=(a,b)=>((a%b)+b)%b;
  switch(P.pat){case 'stripe':return Math.floor(x/st)%2?P.b:P.a;
    case 'pin':return m(x,st)===0?P.b:P.a;
    case 'board':return m(x,st)===0?P.b:P.a;
    case 'diamond':{const cx=m(x,st)-st/2,cy=m(y+((Math.floor(x/st)%2)*st/2),st)-st/2;return Math.abs(cx)+Math.abs(cy)<=2.5?P.b:P.a;}
    case 'dot':{const cx=m(x,st)-4,cy=m(y+((Math.floor(x/st)%2)?4:0),st)-4;return cx*cx+cy*cy<=1.5?P.b:P.a;}
    case 'sprig':{const cx=m(x,st),cy=m(y+((Math.floor(x/st)%2)?5:0),st);if(cx===4&&cy>=3&&cy<=6)return P.c;if((cx===3||cx===5)&&cy===4)return P.c;if(cx===4&&cy===2)return P.b;return P.a;}
    case 'ward':{const cx=m(x,st)-st/2,cy=m(y,st)-st/2;const r=Math.hypot(cx,cy);if(Math.abs(r-4.5)<.7)return P.b;if(Math.abs(cx)<.6&&Math.abs(cy)<6&&cy<0)return P.b;if(Math.abs(cx-cy)<.7&&r<4)return P.b;return P.a;}
    case 'checker':return (Math.floor(x/st)+Math.floor(y/st))%2?P.b:P.a;
    case 'flag':{const gx=Math.floor(x/18),gy=Math.floor((y+(gx%2)*9)/14);const ex=m(x,18),ey=m(y+(gx%2)*9,14);if(ex===0||ey===0)return [86,82,76];const v=hash(gx,gy)*.16-.08;return P.a.map(c=>Math.round(c*(1+v)));}
    default:return P.a;}}
function decCanvas(im,meta,paper,floor){const W=im.width,H=im.height;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.drawImage(im,0,0);
  const d=g.getImageData(0,0,W,H),a=d.data;const side=meta.side||12,top=meta.top||100;
  const lum=p=>.3*a[p]+.59*a[p+1]+.11*a[p+2];
  const inWall=(x,y)=>x>=side&&x<W-side&&y>=8&&y<top-31,inFloor=(x,y)=>x>=side&&x<W-side&&y>=top&&y<H-13;
  const skip=p=>{const [h,l,s]=mpHls(a[p],a[p+1],a[p+2]);return l<.1||(h>.5&&h<.72&&s>.18)||l>.86;};   // outlines, window glass, window frames
  for(const [P,inR,k] of [[PAPERS[paper],inWall,.55],[FLOORS[floor],inFloor,.85]]){if(!P||!P.a)continue;let sum=0,n=0;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!inR(x,y))continue;const p=(y*W+x)*4;if(a[p+3]<8||skip(p))continue;sum+=lum(p);n++;}const mean=n?sum/n:128;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!inR(x,y))continue;const p=(y*W+x)*4;if(a[p+3]<8||skip(p))continue;const f=Math.pow(Math.max(.2,lum(p)/mean),k);const col=decPaint(x,y,P);
      a[p]=Math.min(255,Math.round(col[0]*f));a[p+1]=Math.min(255,Math.round(col[1]*f));a[p+2]=Math.min(255,Math.round(col[2]*f));}}
  g.putImageData(d,0,0);return c;}
function decApply(k){const R=ROOMS[k];if(!R)return;if(!R.baseShell||!String(R.shell||'').startsWith('decor_'))R.baseShell=R.shell||('room_'+k);
  const base=R.baseShell,m=SPR[base];if(!m)return;const set=decS().rooms[k]||{};const paper=set.paper||'orig',floor=set.floor||'orig';
  if(paper==='orig'&&floor==='orig'){R.shell=base;return;}
  const key=`decor_${k}_${base}_${paper}_${floor}`;
  if(!SPR[key]){for(const suf of ['','_n']){const mm=SPR[base+suf];const im=mm&&IMG[mm.src];if(!im||!im.width){if(!suf)return;continue;}
      const c=decCanvas(im,m,paper,floor);IMG['mem:'+key+suf]=c;SPR[key+suf]=Object.assign({},mm,{src:'mem:'+key+suf});}}
  R.shell=key;}
function decApplyAll(){for(const k of Object.keys(decS().rooms))try{decApply(k);}catch(e){}}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);try{decApplyAll();}catch(e){}return r;};}
{const _er=enterRoom;enterRoom=function(k){try{if(decS().rooms[k])decApply(k);}catch(e){}return _er.apply(this,arguments);};}
// a house upgrade gives the cabin a new shell: the paper and floor you chose go onto the new one
{const _rc=rebuildCabin;rebuildCabin=function(t){const R=ROOMS.cabin;if(R&&String(R.shell||'').startsWith('decor_'))R.shell=R.baseShell;const r=_rc.apply(this,arguments);R.baseShell=R.shell;try{decApply('cabin');}catch(e){}return r;};}
// ---- the pattern book
function decBook(){const D=decS(),k=S.room,set=D.rooms[k]||{};const cur={paper:set.paper||'orig',floor:set.floor||'orig'};
  const swatch=(P,kind)=>{if(!P.a)return `<span style="display:inline-block;width:40px;height:26px;vertical-align:middle;background:${kind==='paper'?'linear-gradient(#b8923a,#9a7a2e)':'repeating-linear-gradient(0deg,#5a3e2a 0 5px,#4a3222 5px 6px)'};box-shadow:inset 0 0 0 1px rgba(0,0,0,.4)"></span>`;
    const c=document.createElement('canvas');c.width=40;c.height=26;const g=c.getContext('2d');const im=g.createImageData(40,26);for(let y=0;y<26;y++)for(let x=0;x<40;x++){const col=decPaint(x,y,P);const p=(y*40+x)*4;const f=kind==='floor'&&!P.pat?(1+((x%9===0)?-.18:0)+(((y+(x>>3))%7===0)?-.12:0)):1;
      im.data[p]=col[0]*f;im.data[p+1]=col[1]*f;im.data[p+2]=col[2]*f;im.data[p+3]=255;}g.putImageData(im,0,0);return `<img src="${c.toDataURL()}" style="width:40px;height:26px;image-rendering:pixelated;vertical-align:middle;box-shadow:inset 0 0 0 1px rgba(0,0,0,.4)">`;};
  let h=`<p class="date">The pattern book · ${ROOMS[k].name}</p>`;
  for(const [kind,LIST,title] of [['paper',PAPERS,'WALLPAPER'],['floor',FLOORS,'FLOORS']]){h+=`<p style="margin-top:8px"><b>${title}</b></p><div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">`;
    for(const [id,P] of Object.entries(LIST)){const own=D.own[kind].includes(id),on=cur[kind]===id;
      h+=`<button class="btn" data-k="${kind}" data-id="${id}" style="display:flex;gap:8px;align-items:center;text-align:left;padding:5px 7px;${on?'outline:2px solid #e8923f;':''}">${swatch(P,kind)}<span style="font-size:12px;line-height:1.2">${P.name}<br><small style="opacity:.7">${on?'on the walls':own?'yours':P.cost+' coins'}</small></span></button>`;}
    h+='</div>';}
  openNote(h,'Done');$('noteText').querySelectorAll('button[data-k]').forEach(b=>b.onclick=()=>{const kind=b.dataset.k,id=b.dataset.id,P=(kind==='paper'?PAPERS:FLOORS)[id];
    if(!D.own[kind].includes(id)){if(S.coins<P.cost){toast(`${P.name} costs ${P.cost} coins.`,2);return;}S.coins-=P.cost;D.own[kind].push(id);updateHud&&updateHud();if(P.lore&&typeof addLore==='function')addLore(P.lore);}
    D.rooms[k]=Object.assign(D.rooms[k]||{},{[kind]:id});decApply(k);SFX.page&&SFX.page();decBook();});}
// the button: only inside a home that's yours
{const css=document.createElement('style');css.textContent=`#btnDecor{position:fixed!important;left:var(--gl,12px)!important;bottom:calc(var(--gb,24px) + var(--btn,64px) + 10px)!important;width:var(--btn,64px)!important;height:var(--btn,64px)!important;padding:0!important;zoom:var(--u,1)!important;display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:12px!important;z-index:7}#btnDecor[hidden]{display:none!important}#btnDecor .ico{font-size:20px;line-height:1}`;document.head.appendChild(css);
  const b=document.createElement('button');b.className='btn';b.id='btnDecor';b.hidden=true;b.innerHTML='<span class="ico" aria-hidden="true">✎</span><span>Decorate</span>';
  b.addEventListener('click',()=>{if(S.mode==='play'&&!S.paused&&decMine())decBook();});document.body.appendChild(b);
  setInterval(()=>{const want=S.mode==='play'&&decMine()&&!S.paused&&$('hud')&&!$('hud').hidden;if(b.hidden===want)b.hidden=!want;},300);}
