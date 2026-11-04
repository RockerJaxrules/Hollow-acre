/* ================= the farmer you play: hairstyle, hair, skin, shirt and trousers, chosen before the drive ================= */
const LOOK_BASE={skin:'#e8b48c',hair:'#6a4224',shirt:'#b8402c',pants:'#3a4e7a'};
const LOOK_OPTS={
  style:[['short','Short'],['long','Long'],['bun','Bun'],['spiky','Spiky'],['bangs','Fringe']],
  hair:['#6a4224','#2a2018','#b8823c','#d8c27a','#8a2e1a','#9a9aa0'],
  skin:['#f2cfb0','#e8b48c','#c98c62','#9a6440','#6e4430'],
  shirt:['#b8402c','#3e6a9a','#4f7a3e','#7a4a8a','#c89a3a','#3a3a40'],
  pants:['#3a4e7a','#4a3e2e','#2e2e34','#6a5a40','#5a6a3e']};
S.look=Object.assign({style:'short'},LOOK_BASE);
try{const sv=JSON.parse(localStorage.getItem('hollowLook')||'null');if(sv)Object.assign(S.look,sv);}catch(e){}
const lookRamp=hex=>{const c=[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];const sh=k=>c.map(v=>Math.round(v*k));
  return [sh(.42),sh(.66),c,[Math.min(255,c[0]*1.18+12),Math.min(255,c[1]*1.18+12),Math.min(255,c[2]*1.14+12)].map(Math.round)];};
const lookOutline=n=>[Math.max(12,n[0]*.32|0),Math.max(8,n[1]*.28|0),Math.max(14,n[2]*.34|0)];
// every colour the generator could have written for a region (its ramp, the plaid check, and their outlines) -> the matching new colour
function lookMap(look){const M=new Map();const add=(from,to)=>{for(let dr=-1;dr<=1;dr++)for(let dg=-1;dg<=1;dg++)for(let db=-1;db<=1;db++)M.set(((from[0]+dr)<<16)|((from[1]+dg)<<8)|(from[2]+db),to);};
  for(const k of ['skin','hair','shirt','pants']){if(look[k]===LOOK_BASE[k])continue;const a=lookRamp(LOOK_BASE[k]),b=lookRamp(look[k]);
    for(let i=0;i<4;i++){add(a[i],b[i]);add(lookOutline(a[i]),lookOutline(b[i]));}
    if(k==='shirt'){const pa=a[2].map(v=>Math.round(v*.75)),pb=b[2].map(v=>Math.round(v*.75));add(pa,pb);add(lookOutline(pa),lookOutline(pb));}}
  return M;}
const LOOK_SRC={};
function applyLook(){const look=S.look,M=lookMap(look);
  for(const tool of ['','_hoe','_can']){const target='farmer'+tool,src=look.style==='short'?target:'farmer_'+look.style+tool;const tm=SPR[target],sm=SPR[src]||tm;
    if(!LOOK_SRC[sm.src])LOOK_SRC[sm.src]=IMG[sm.src];const im=LOOK_SRC[sm.src];if(!im)continue;
    const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);
    if(M.size){const d=g.getImageData(0,0,c.width,c.height),a=d.data;for(let i=0;i<a.length;i+=4){if(!a[i+3])continue;const to=M.get((a[i]<<16)|(a[i+1]<<8)|a[i+2]);if(to){a[i]=to[0];a[i+1]=to[1];a[i+2]=to[2];}}g.putImageData(d,0,0);}
    if(!LOOK_SRC[tm.src])LOOK_SRC[tm.src]=IMG[tm.src];IMG[tm.src]=c;}}
// ---- the creator screen
{const css=document.createElement('style');css.textContent=`
#creator{gap:0}#creator .cwrap{display:flex;flex-direction:column;align-items:center;gap:10px;width:min(420px,92vw)}
#creator canvas{width:144px;height:192px;image-rendering:pixelated;background:radial-gradient(circle at 50% 70%,rgba(232,146,63,.18),rgba(0,0,0,0) 70%);border-radius:12px}
#creator .crow{display:flex;align-items:center;gap:10px;width:100%}#creator .crow>span{width:80px;text-align:right;font-size:13px;color:var(--dim);letter-spacing:.06em;text-transform:uppercase;flex:none}
#creator .chips{display:flex;flex-wrap:wrap;gap:7px}#creator .chip{min-width:34px;height:34px;border-radius:9px;border:1px solid var(--line);background:rgba(233,223,198,.06);color:var(--bone);font:inherit;font-size:13px;padding:0 9px;cursor:pointer}
#creator .chip.sw{padding:0;width:34px}#creator .chip.on{outline:2px solid var(--ember);outline-offset:2px}
#creator .turn{display:flex;gap:8px}#creator .turn button{width:44px;height:34px}`;document.head.appendChild(css);
  const el=document.createElement('div');el.className='screen';el.id='creator';el.hidden=true;
  el.innerHTML=`<div class="kicker">Who is driving</div><div class="cwrap"><canvas id="cPrev" width="48" height="64"></canvas>
    <div class="turn"><button class="chip" id="cL" aria-label="Turn left">◀</button><button class="chip" id="cR" aria-label="Turn right">▶</button></div>
    <div class="crow"><span>Hair</span><div class="chips" id="cStyle"></div></div>
    <div class="crow"><span>Colour</span><div class="chips" id="cHair"></div></div>
    <div class="crow"><span>Skin</span><div class="chips" id="cSkin"></div></div>
    <div class="crow"><span>Shirt</span><div class="chips" id="cShirt"></div></div>
    <div class="crow"><span>Trousers</span><div class="chips" id="cPants"></div></div>
    <button class="begin" id="cGo" style="margin-top:14px">Drive</button></div>`;
  $('title').after(el);
  let dirI=2;const DIRS=['N','W','S','E'];
  function chips(id,key,opts){const box=$(id);box.innerHTML='';for(const o of opts){const b=document.createElement('button');const v=Array.isArray(o)?o[0]:o;b.className='chip'+(Array.isArray(o)?'':' sw')+(S.look[key]===v?' on':'');
      if(Array.isArray(o))b.textContent=o[1];else{b.style.background=o;b.setAttribute('aria-label',key+' '+o);}
      b.addEventListener('click',()=>{S.look[key]=v;applyLook();build();});box.appendChild(b);}}
  function build(){chips('cStyle','style',LOOK_OPTS.style);chips('cHair','hair',LOOK_OPTS.hair);chips('cSkin','skin',LOOK_OPTS.skin);chips('cShirt','shirt',LOOK_OPTS.shirt);chips('cPants','pants',LOOK_OPTS.pants);}
  $('cL').addEventListener('click',()=>{dirI=(dirI+3)%4;});$('cR').addEventListener('click',()=>{dirI=(dirI+1)%4;});
  let raf=0;function preview(now){if(el.hidden)return;raf=requestAnimationFrame(preview);const m=SPR.farmer,im=IMG[m.src];if(!im)return;const g=$('cPrev').getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,48,64);
    const c=m.clips.walk[DIRS[dirI]],f=1+Math.floor(now/110)%8;g.drawImage(im,f*m.fw,c[0]*m.fh,m.fw,m.fh,0,0,48,64);}
  function open(){build();applyLook();$('title').hidden=true;el.hidden=false;raf=requestAnimationFrame(preview);}
  $('begin').addEventListener('click',e=>{e.stopImmediatePropagation();A.init&&A.init();open();},true);
  $('cGo').addEventListener('click',()=>{try{localStorage.setItem('hollowLook',JSON.stringify(S.look));}catch(e){}el.hidden=true;cancelAnimationFrame(raf);A.init&&A.init();startCine('intro');});}
