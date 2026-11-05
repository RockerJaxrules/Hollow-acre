/* ================= the farmer you play, assembled from layers: body + outfit, facial hair, hair, glasses, hat, and the tool held in front.
   Each layer was drawn with fixed base colours; every colour slot is swapped for the chosen one, ramp for ramp, outline for outline. ================= */
const LOOK_BASE={skin:'#e8b48c',hair:'#6a4224',eye:'#3a5a7a',shirt:'#b8402c',pants:'#3a4e7a',shoes:'#3a2618',extra:'#6a7a3a',hatColor:'#8a5a2a'};
const LOOK_OPTS={
  style:[['short','Swept'],['bangs','Fringe'],['spiky','Spiky'],['buzz','Buzzed'],['curly','Curly'],['long','Long'],['ponytail','Ponytail'],['bun','Bun'],['braids','Braids'],['bald','Bald']],
  beard:[['','None'],['stubble','Stubble'],['moustache','Moustache'],['full','Beard']],
  outfit:[['flannel','Flannel'],['tee','T-shirt'],['overalls','Overalls'],['jacket','Jacket'],['dress','Dress']],
  hat:[['','None'],['cap','Cap'],['straw','Straw hat'],['beanie','Beanie'],['cowboy','Cowboy hat']],
  glasses:[[false,'None'],[true,'Glasses']],
  hair:['#6a4224','#3a2416','#14100e','#9a5a2a','#b8823c','#d8c27a','#8a2e1a','#c85a24','#9a9aa0','#e8e4dc','#3a4a6a','#5a2a5a'],
  skin:['#f6d8c0','#f2cfb0','#e8b48c','#d49a70','#b8784c','#8a5434','#5e3a26'],
  eye:['#3a5a7a','#4a3020','#3a6a3a','#6a6a72','#1a1418','#6a3a7a'],
  shirt:['#b8402c','#3e6a9a','#4f7a3e','#7a4a8a','#c89a3a','#e8e0d0','#3a3a40','#2a6a6a','#c86a8a','#8a5a3a'],
  pants:['#3a4e7a','#4a3e2e','#2e2e34','#6a5a40','#5a6a3e','#7a3a2e','#8a8a90','#2a3a5a'],
  shoes:['#3a2618','#1e1a18','#6a4a2a','#7a2a22','#e0d8c8'],
  extra:['#6a7a3a','#5a3a24','#2e3a52','#7a2e26','#4a4a50','#b89050','#3a5a4a','#8a6a9a'],
  hatColor:['#8a5a2a','#b83a2a','#2a4a7a','#3a6a3a','#e0d8c8','#2a2a2e']};
const LOOK_DEF=Object.assign({style:'short',beard:'',outfit:'flannel',hat:'',glasses:false},LOOK_BASE);
S.look=Object.assign({},LOOK_DEF);
try{const sv=JSON.parse(localStorage.getItem('hollowLook')||'null');if(sv)Object.assign(S.look,sv);}catch(e){}
if(!LOOK_OPTS.style.some(o=>o[0]===S.look.style))S.look.style='short';
// the exact ramps and outline the generator (px/chibi2.js) used
const lookRamp=hex=>{const c=[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];const m=k=>c.map(v=>Math.round(v*k));
  return [m(.36),m(.6),m(.82),c.slice(),c.map((v,i)=>Math.min(255,Math.round(v*1.12+(i===2?14:18))))];};
const lookOutline=n=>[Math.max(12,n[0]*.32|0),Math.max(8,n[1]*.28|0),Math.max(14,n[2]*.34|0)];
const dkRamp=(R,d)=>R.map((c,i)=>R[Math.max(0,i-d)]);
function lookMap(look){const M=new Map();const key=c=>(c[0]<<16)|(c[1]<<8)|c[2];
  for(const k of Object.keys(LOOK_BASE)){if((look[k]||LOOK_BASE[k])===LOOK_BASE[k])continue;const a=lookRamp(LOOK_BASE[k]),b=lookRamp(look[k]);
    for(let i=0;i<5;i++){M.set(key(a[i]),b[i]);M.set(key(lookOutline(a[i])),lookOutline(b[i]));}}
  return M;}
const LAYER_IMG=n=>{const m=SPR[n];return m&&IMG[m.src];};
function layersFor(look,tool){const v=tool==='_can'?'_can':'';const L=['pl_body_'+look.outfit+tool];
  if(look.beard)L.push('pl_beard_'+look.beard+v);if(look.style&&look.style!=='bald')L.push('pl_hair_'+look.style+v);
  if(look.glasses)L.push('pl_glasses'+v);if(look.hat)L.push('pl_hat_'+look.hat+v);if(tool)L.push('pl_toolf'+tool);return L;}
const LOOK_ORIG={};
function composeSheet(look,tool,M){const tm=SPR['farmer'+tool];if(!tm)return;const ls=layersFor(look,tool);const body=LAYER_IMG(ls[0]);if(!body)return;
  const W=body.width,H=body.height,FH=tm.fh,FW=tm.fw;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});
  const tmp=document.createElement('canvas');tmp.width=W;tmp.height=H;const tg=tmp.getContext('2d',{willReadFrequently:true});
  let hatTop=null;
  if(look.hat){const im=LAYER_IMG('pl_hat_'+look.hat+(tool==='_can'?'_can':''));if(im){tg.clearRect(0,0,W,H);tg.drawImage(im,0,0);const a=tg.getImageData(0,0,W,H).data;
    hatTop=new Int16Array(W*Math.ceil(H/FH)).fill(-1);for(let y=0;y<H;y++){const band=(y/FH)|0;for(let x=0;x<W;x++){const i=band*W+x;if(hatTop[i]<0&&a[(y*W+x)*4+3])hatTop[i]=y;}}}}
  for(const n of ls){const im=LAYER_IMG(n);if(!im)continue;tg.clearRect(0,0,W,H);tg.drawImage(im,0,0);const d=tg.getImageData(0,0,W,H),a=d.data;
    const isHair=n.startsWith('pl_hair_');
    for(let i=0;i<a.length;i+=4){if(!a[i+3])continue;
      if(isHair&&hatTop){const p=i>>2,x=p%W,y=(p/W)|0,ht=hatTop[((y/FH)|0)*W+x];if(ht>=0&&y<ht+2){a[i+3]=0;continue;}}   // hair stays under the hat
      if(M.size){const to=M.get((a[i]<<16)|(a[i+1]<<8)|a[i+2]);if(to){a[i]=to[0];a[i+1]=to[1];a[i+2]=to[2];}}}
    tg.putImageData(d,0,0);g.drawImage(tmp,0,0);}
  if(!LOOK_ORIG[tm.src])LOOK_ORIG[tm.src]=IMG[tm.src];IMG[tm.src]=c;
  if(typeof SILF!=='undefined')for(const k in SILF)if(k.startsWith('farmer'))delete SILF[k];}
function applyLook(only){const look=S.look,M=lookMap(look);for(const tool of (only||['','_hoe','_can','_pick','_axe']))composeSheet(look,tool,M);}
// ---- the creator: tabs of options, a turning preview that walks, idles and works the hoe
{const css=document.createElement('style');css.textContent=`
#creator{gap:0;justify-content:flex-start;padding-top:max(18px,env(safe-area-inset-top))}#creator .cwrap{display:flex;flex-direction:column;align-items:center;gap:8px;width:min(460px,94vw)}
#creator canvas{width:144px;height:192px;image-rendering:pixelated;background:radial-gradient(circle at 50% 72%,rgba(232,146,63,.2),rgba(0,0,0,0) 68%);border-radius:12px}
#creator .ctabs{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}#creator .ctabs button{font:inherit;font-size:13px;padding:6px 12px;border-radius:8px;border:1px solid var(--line);background:rgba(233,223,198,.06);color:var(--bone);cursor:pointer;letter-spacing:.06em;text-transform:uppercase}
#creator .ctabs button.on{background:var(--ember);color:#1a120c;border-color:var(--ember)}
#creator .cpanel{width:100%;max-height:min(40vh,330px);overflow:auto;display:flex;flex-direction:column;gap:9px;padding:4px 2px}
#creator .crow{display:flex;align-items:flex-start;gap:10px;width:100%}#creator .crow>span{width:76px;text-align:right;font-size:12px;color:var(--dim);letter-spacing:.06em;text-transform:uppercase;flex:none;padding-top:9px}
#creator .chips{display:flex;flex-wrap:wrap;gap:6px}#creator .chip{min-width:32px;height:32px;border-radius:8px;border:1px solid var(--line);background:rgba(233,223,198,.06);color:var(--bone);font:inherit;font-size:13px;padding:0 9px;cursor:pointer}
#creator .chip.sw{padding:0;width:32px}#creator .chip.on{outline:2px solid var(--ember);outline-offset:2px}
#creator .turn{display:flex;gap:8px}#creator .turn button{width:44px;height:32px}#creator .cbtns{display:flex;gap:10px;margin-top:6px}`;document.head.appendChild(css);
  const el=document.createElement('div');el.className='screen';el.id='creator';el.hidden=true;
  el.innerHTML=`<div class="kicker" id="cKick">Who is driving</div><div class="cwrap"><canvas id="cPrev" width="48" height="64"></canvas>
    <div class="turn"><button class="chip" id="cL" aria-label="Turn left">◀</button><button class="chip" id="cAnim" aria-label="Change animation">Walk</button><button class="chip" id="cR" aria-label="Turn right">▶</button></div>
    <div class="ctabs" id="cTabs"></div><div class="cpanel" id="cPanel"></div>
    <div class="cbtns"><button class="chip" id="cRand">Surprise me</button><button class="begin" id="cGo">Drive</button></div></div>`;
  $('title').after(el);
  const TABS={Face:[['Skin','skin'],['Eyes','eye'],['Facial hair','beard']],Hair:[['Style','style'],['Colour','hair']],
    Clothes:[['Outfit','outfit'],['Top','shirt'],['Bottoms','pants'],['Jacket','extra'],['Shoes','shoes']],Extras:[['Hat','hat'],['Hat colour','hatColor'],['Glasses','glasses']]};
  let tab='Hair',dirI=2,anim=0,editing=false;const DIRS=['N','W','S','E'],ANIMS=[['Walk','farmer','walk'],['Run','farmer','run'],['Idle','farmer','idle'],['Hoe','farmer_hoe','thrust']];
  let pending=0;const changed=()=>{clearTimeout(pending);applyLook(['']);pending=setTimeout(()=>applyLook(['_hoe']),60);};
  function build(){const tb=$('cTabs');tb.innerHTML='';for(const k of Object.keys(TABS)){const b=document.createElement('button');b.textContent=k;if(k===tab)b.className='on';b.addEventListener('click',()=>{tab=k;build();});tb.appendChild(b);}
    const P2=$('cPanel');P2.innerHTML='';for(const [label,key] of TABS[tab]){const row=document.createElement('div');row.className='crow';row.innerHTML=`<span>${label}</span><div class="chips"></div>`;const box=row.lastChild;
      for(const o of LOOK_OPTS[key]){const named=Array.isArray(o);const v=named?o[0]:o;const b=document.createElement('button');b.className='chip'+(named?'':' sw')+(S.look[key]===v?' on':'');
        if(named)b.textContent=o[1];else{b.style.background=o;b.setAttribute('aria-label',label+' '+o);}
        b.addEventListener('click',()=>{S.look[key]=v;changed();build();});box.appendChild(b);}
      P2.appendChild(row);}}
  $('cL').addEventListener('click',()=>{dirI=(dirI+3)%4;});$('cR').addEventListener('click',()=>{dirI=(dirI+1)%4;});
  $('cAnim').addEventListener('click',()=>{anim=(anim+1)%ANIMS.length;$('cAnim').textContent=ANIMS[anim][0];if(anim===3)applyLook(['_hoe']);});
  $('cRand').addEventListener('click',()=>{const pick=a=>a[(Math.random()*a.length)|0];for(const k of Object.keys(LOOK_OPTS)){const o=pick(LOOK_OPTS[k]);S.look[k]=Array.isArray(o)?o[0]:o;}
    if(Math.random()<.5)S.look.hat='';if(Math.random()<.6)S.look.beard='';if(Math.random()<.7)S.look.glasses=false;changed();build();});
  let raf=0;function preview(now){if(el.hidden)return;raf=requestAnimationFrame(preview);const [,nm,clip]=ANIMS[anim];const m=SPR[nm],im=IMG[m.src];if(!im)return;const g=$('cPrev').getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,48,64);
    const c=m.clips[clip][DIRS[dirI]]||m.clips[clip].S;const nf=c[1];const fps=clip==='idle'?3:clip==='run'?14:clip==='thrust'?10:9;let f=Math.floor(now/1000*fps)%nf;if(clip==='walk'||clip==='run')f=1+f%(nf-1);
    g.fillStyle='rgba(10,14,8,.35)';g.beginPath();g.ellipse(24,60,8,2.2,0,0,Math.PI*2);g.fill();g.drawImage(im,f*m.fw,c[0]*m.fh,m.fw,m.fh,0,0,48,64);}
  function open(edit){editing=!!edit;$('cKick').textContent=edit?'The wardrobe':'Who is driving';$('cGo').textContent=edit?'Done':'Drive';build();applyLook(['','_hoe']);$('title').hidden=true;el.hidden=false;raf=requestAnimationFrame(preview);}
  window.openWardrobe=()=>{S.paused=true;$('bag')&&($('bag').hidden=true);open(true);};
  $('begin').addEventListener('click',e=>{e.stopImmediatePropagation();A.init&&A.init();open(false);},true);
  $('cGo').addEventListener('click',()=>{try{localStorage.setItem('hollowLook',JSON.stringify(S.look));}catch(e){}el.hidden=true;cancelAnimationFrame(raf);applyLook();
    if(editing){S.paused=false;toast('You change in the cabin. The mirror takes a moment to catch up.',2.4);return;}A.init&&A.init();startCine('intro');});}
// the wardrobe: from the bag at any time
{const _ob=openBag;openBag=function(){_ob();const B=$('bagBody');if(!B||B.querySelector('#bagWard'))return;const d=document.createElement('div');d.style.cssText='text-align:center;margin-top:10px';
  d.innerHTML='<button class="chip" id="bagWard" style="padding:8px 16px">Wardrobe</button>';B.appendChild(d);d.firstChild.addEventListener('click',()=>openWardrobe());};}
