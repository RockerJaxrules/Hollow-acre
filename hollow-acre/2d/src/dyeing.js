/* ================= #232 dyeing. Nine dyes, each boiled down at Grandpa's stove from something you grow, forage or dig up
   (the same pot game as the soups: get the heat right, stir, skim), then used two ways: in the backpack a Dye button sits
   next to the Wardrobe, for your top, bottoms, jacket, shoes, hat and accessory; and the pattern book has a page for
   dyeing the furniture you've placed. One dye colours one thing. ================================================ */
const DYE={red:{name:'Madder red',col:['#5e1a14','#9a2f24','#c8513e'],from:'mushroom',n:2,how:'fly-cap mushrooms'},
  orange:{name:'Pumpkin orange',col:['#6e3410','#b8641e','#e89a42'],from:'pumpkin',n:1,how:'a pumpkin'},
  yellow:{name:'Yolk yellow',col:['#7a5a10','#c8a028','#f0d060'],from:'egg',n:2,how:'eggs'},
  green:{name:'Fiber green',col:['#24401c','#4a7a34','#7ab058'],item:'fiber',n:4,how:'fiber'},
  blue:{name:'Verdigris blue',col:['#1a3a4e','#2e6a8a','#5aa0c0'],item:'copper',n:2,how:'copper ore'},
  purple:{name:'Turnip purple',col:['#3a1a40','#6a3478','#9a5aa8'],from:'turnip',n:2,how:'turnips'},
  brown:{name:'Walnut brown',col:['#3a2414','#6a4426','#9a6a40'],item:'wood',n:4,how:'wood'},
  black:{name:'Lamp black',col:['#121014','#2a262c','#4a444e'],item:'coal',n:2,how:'coal'},
  white:{name:'Lime white',col:['#9a968c','#d8d2c4','#f4f0e6'],item:'stone',n:3,how:'stone'}};
// a little corked bottle for each, drawn the way the other made things are
for(const [c,D] of Object.entries(DYE)){const key='dye_'+c;const [dk,md,lt]=D.col;
  cicoMake('ico_'+key,(p,poly,H)=>{p(13,3,6,4,'#8a6a42');p(13,3,6,1,'#b08a5a');p(14,7,4,4,'#c8d4d8');p(14,7,1,4,'#eef4f6');p(17,7,1,4,'#8a9aa0');
    poly([[8,12],[24,12],[26,16],[26,26],[23,29],[9,29],[6,26],[6,16]],(x,y)=>y<15?(x<10?'#eef4f6':'#c8d4d8'):(x<10?lt:x>21?dk:md));
    p(9,16,2,8,'rgba(255,255,255,.55)');p(8,15,16,1,lt);p(11,27,10,1,dk);});
  ITEMS[key]={name:D.name,icon:'ico_'+key,desc:`A bottle of ${D.name.toLowerCase()}. Dyes one thing: open the Dye page from your backpack, or the pattern book at home.`,sell:12};}
// ---- boiling them at the stove (the soup pot's game: these are boiled too)
{const _c=vendors.cook.rows;vendors.cook.rows=()=>{const r=_c();for(const [c,D] of Object.entries(DYE)){const have=D.from?S.basket.filter(b=>b.kind===D.from).length:inv(D.item);
    r.push({k:'dye_'+c,name:D.name,desc:`${D.n} ${D.how} → a bottle of ${D.name.toLowerCase()}. Burns 1 wood.`,price:0,btn:'Boil',need:Object.assign({wood:1},D.item?{[D.item]:D.n}:{}),
      can:have>=D.n&&inv('wood')>=1,buy(){if(D.from){for(let i=0;i<D.n;i++){const j=S.basket.findIndex(b=>b.kind===D.from);if(j>=0)S.basket.splice(j,1);}}else takeInv(D.item,D.n);takeInv('wood',1);addInv('dye_'+c,1);updateHud&&updateHud();}});}return r;};
  for(const c of Object.keys(DYE))if(typeof CG3_RECIPES!=='undefined'&&CG3_RECIPES['cook:soup'])CG3_RECIPES['cook:dye_'+c]=CG3_RECIPES['cook:soup'];}
const dyeHave=()=>Object.keys(DYE).filter(c=>inv('dye_'+c)>0);
const dyeBtns=(attr)=>{const h=dyeHave();if(!h.length)return '<small style="opacity:.6">No dyes. Boil some at the stove.</small>';return h.map(c=>`<button class="dyeb" ${attr}="${c}" title="${DYE[c].name} (${inv('dye_'+c)})" aria-label="${DYE[c].name}" style="--d0:${DYE[c].col[0]};--d1:${DYE[c].col[1]};--d2:${DYE[c].col[2]}"></button>`).join('');};
{const css=document.createElement('style');css.textContent='.dyeb{width:28px;height:24px;padding:0;border:0;cursor:pointer;background:var(--d1);box-shadow:inset 0 0 0 2px var(--d0),inset 2px 2px 0 2px var(--d2),0 0 0 1px rgba(20,14,10,.8)}.dyeb:hover{transform:translateY(-1px);box-shadow:inset 0 0 0 2px var(--d0),inset 2px 2px 0 2px var(--d2),0 0 0 2px #e8923f}';document.head.appendChild(css);}
// ---- your clothes
const DYE_GARMENTS=[['shirt','Top'],['pants','Bottoms'],['extra','Jacket or vest'],['shoes','Shoes'],['hatColor','Hat'],['acc','Accessory']];
function dyeClothes(){let h=`<p class="date">Dyeing · your clothes</p><p>Pick a colour for each thing you’re wearing. One bottle each.</p>`;
  for(const [k,label] of DYE_GARMENTS){if(S.look[k]===undefined)continue;h+=`<div style="display:flex;align-items:center;gap:8px;margin:6px 0"><span style="width:110px">${label}</span><span style="width:22px;height:22px;background:${S.look[k]||'#888'};box-shadow:inset 0 0 0 1px rgba(0,0,0,.5)"></span><span style="display:flex;gap:4px;flex-wrap:wrap">${dyeBtns('data-dy-'+k).replace(new RegExp('data-dy-'+k,'g'),`data-g="${k}" data-c`)}</span></div>`;}
  openNote(h,'Done');$('noteText').querySelectorAll('button[data-g]').forEach(b=>b.onclick=()=>{const c=b.dataset.c,g=b.dataset.g;if(inv('dye_'+c)<1)return;takeInv('dye_'+c,1);S.look[g]=DYE[c].col[1];
    try{localStorage.setItem('hollowLook'+(typeof ACCT_SUFFIX!=='undefined'?ACCT_SUFFIX:''),JSON.stringify(S.look));}catch(e){}applyLook();SFX.page&&SFX.page();toast(`Dyed ${DYE[c].name.toLowerCase()}.`,1.4);dyeClothes();});}
{const _ob=openBag;openBag=function(){const r=_ob.apply(this,arguments);try{const w=$('bagWard');if(w&&!$('bagDye')){const b=document.createElement('button');b.className='chip';b.id='bagDye';b.style.cssText='padding:8px 16px;margin-left:6px';b.textContent='Dye';
    b.addEventListener('click',()=>{$('bag').hidden=true;dyeClothes();});w.after(b);}}catch(e){}return r;};}
// ---- your furniture (a page in the pattern book)
function dyeSpr(spr,c){const key=`dyed_${spr}_${c}`;if(SPR[key])return key;const base=SPR[spr];if(!base)return spr;
  for(const suf of ['','_n']){const m=SPR[spr+suf];const im=m&&IMG[m.src];if(!im||!im.width){if(!suf)return spr;continue;}const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');g.drawImage(im,0,0);
    const d=g.getImageData(0,0,cv.width,cv.height),a=d.data;const [th]=mpHls(...DYE[c].col[1].match(/\w\w/g).map(h=>parseInt(h,16)));const [,tl,ts]=mpHls(...DYE[c].col[1].match(/\w\w/g).map(h=>parseInt(h,16)));
    for(let p=0;p<a.length;p+=4){if(a[p+3]<8)continue;const [h,l,s]=mpHls(a[p],a[p+1],a[p+2]);if(l<.1||l>.92||(s<.08&&c!=='white'&&c!=='black'))continue;
      const L=c==='white'?Math.min(.92,.45+l*.6):c==='black'?l*.45:Math.min(.85,l*(.6+tl*.8));const o=mpRgb(th,L,c==='white'||c==='black'?ts*.4:Math.max(.25,ts*.9));a[p]=o[0];a[p+1]=o[1];a[p+2]=o[2];}
    g.putImageData(d,0,0);IMG['mem:'+key+suf]=cv;SPR[key+suf]=Object.assign({},m,{src:'mem:'+key+suf});}return key;}
{const _pf=placeFurnAt;placeFurnAt=function(k,x,z){const o=_pf.apply(this,arguments);try{const e=(S.furnPlaced||[]).find(p=>p.k===k&&Math.abs(p.x-x)<1e-6&&Math.abs(p.z-z)<1e-6);
  const ob=o&&o.spr?o:(OBJ[OBJ.length-1]&&OBJ[OBJ.length-1].room==='cabin'?OBJ[OBJ.length-1]:null);if(e&&e.dye&&ob){ob.spr=dyeSpr(ob.spr,e.dye);if(ob.night)ob.night=SPR[ob.spr+'_n']?ob.spr+'_n':ob.night;}}catch(e){}return o;};}
function dyeFurniture(){const here=(S.furnPlaced||[]).filter(p=>FURN[p.k]);let h=`<p class="date">Dyeing · your furniture</p>`;
  if(!here.length)h+='<p>Nothing placed yet.</p>';
  here.forEach((p,i)=>{h+=`<div style="display:flex;align-items:center;gap:8px;margin:6px 0"><span style="flex:1">${FURN[p.k][0]}${p.dye?` <small style="opacity:.7">(${DYE[p.dye].name.toLowerCase()})</small>`:''}</span><span style="display:flex;gap:4px;flex-wrap:wrap">${dyeBtns('data-c').replace(/data-c=/g,`data-i="${i}" data-c=`)}</span></div>`;});
  openNote(h,'Done');$('noteText').querySelectorAll('button[data-i]').forEach(b=>b.onclick=()=>{const p=here[+b.dataset.i],c=b.dataset.c;if(!p||inv('dye_'+c)<1)return;takeInv('dye_'+c,1);p.dye=c;
    if(typeof worldRebuild==='function')worldRebuild(new Set(['furnPlaced']));SFX.page&&SFX.page();toast(`${FURN[p.k][0]}: ${DYE[c].name.toLowerCase()}.`,1.6);dyeFurniture();});}
{const _db=decBook;decBook=function(){_db.apply(this,arguments);try{const t=$('noteText');if(!t||t.querySelector('#decDye'))return;const b=document.createElement('button');b.className='btn';b.id='decDye';b.textContent='Dye your furniture';b.style.marginTop='10px';
  b.onclick=()=>dyeFurniture();t.appendChild(b);}catch(e){}};}
