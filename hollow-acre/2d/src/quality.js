/* ================= made well, worth more: everything you make remembers how well you made it (0 to 3 stars, from the making game),
   and the shipping bin pays more for the better ones: one star ×1.15, two ×1.35, three ×1.6. The best ones go in the bin first;
   when you eat or give something away, the plainest goes first. ================= */
S.iq=S.iq||{};
const QMULT=[1,1.15,1.35,1.6];
const qStars=q=>q>.9?3:q>.6?2:q>.3?1:0;
// the grades never outnumber what you actually have: anything used up elsewhere takes the plainest grade with it
function iqTrim(k){const g=S.iq[k];if(!g)return;let tot=g[0]+g[1]+g[2]+g[3];const have=typeof inv==='function'?inv(k):tot;while(tot>have){for(let s=0;s<4;s++)if(g[s]>0){g[s]--;tot--;break;}}if(!tot)delete S.iq[k];}
function iqAdd(k,stars,n){iqTrim(k);const g=S.iq[k]=S.iq[k]||[0,0,0,0];g[Math.max(0,Math.min(3,stars|0))]+=n||1;}
function iqBest(k){iqTrim(k);const g=S.iq[k];if(!g)return 0;for(let s=3;s>=0;s--)if(g[s]>0)return s;return 0;}
function iqTakeBest(k){iqTrim(k);const g=S.iq[k];if(!g)return 0;for(let s=3;s>=0;s--)if(g[s]>0){g[s]--;return s;}return 0;}
const qWord=s=>['plain','well made','fine','perfect'][s];
// the making game's result is stamped on whatever it made
{const _fc=finishCraft;finishCraft=function(v,r,q){const before={};for(const k of Object.keys(ITEMS))before[k]=inv(k);const out=_fc.apply(this,arguments);
  const st=qStars(q);for(const k of Object.keys(ITEMS)){const d=inv(k)-(before[k]||0);if(d>0)iqAdd(k,st,d);}
  if(st>0){const k=Object.keys(ITEMS).find(k=>inv(k)>(before[k]||0));if(k&&sellPrice(k)>0)setTimeout(()=>toast(`${'★'.repeat(st)} ${ITEMS[k].name}: sells for ${Math.round(sellPrice(k)*QMULT[st])} instead of ${sellPrice(k)}.`,2.6),2500);}
  return out;};}
// the bin pays by grade (and the blacksmith and rancher professions count again)
const qPrice=(id,s)=>{let v=sellPrice(id)*QMULT[s];if(typeof hasProf==='function'){if(id==='milk'&&hasProf('rancher'))v*=1.25;if((id==='copper_bar'||id==='iron_bar')&&hasProf('blacksmith'))v*=1.5;}return Math.round(v);};
{const _sp=shipPut;shipPut=function(t,id,all){if(t!=='I')return _sp.apply(this,arguments);let n=0;
  do{if(inv(id)<=0)break;const s=iqTakeBest(id);takeInv(id,1);S.ship.push({t,id,value:qPrice(id,s),q:s,_pr:1});n++;S.shipped++;}while(all);
  if(n){SFX.harvest&&SFX.harvest();updateHud&&updateHud();}return n;};}
{const _st=shipTake;shipTake=function(t,id,all){if(t!=='I')return _st.apply(this,arguments);let n=0;
  do{const i=S.ship.findIndex(e=>e.t===t&&e.id===id);if(i<0)break;const e=S.ship.splice(i,1)[0];addInv(id,1);if(e.q)iqAdd(id,e.q);S.shipped=Math.max(0,S.shipped-1);n++;}while(all);
  if(n){SFX.page&&SFX.page();updateHud&&updateHud();}return n;};}
// the bin's list shows what the best one fetches
{const _sl=sellables;sellables=function(){return _sl.apply(this,arguments).map(e=>e.t==='I'?Object.assign(e,{each:qPrice(e.id,iqBest(e.id))}):e);};}
// and the bag says how many of each grade you're carrying
{const _ii=itemInfo;itemInfo=function(key){const r=_ii.apply(this,arguments);if(!r||!key||!key.startsWith('I:'))return r;const k=key.slice(2);iqTrim(k);const g=S.iq[k];
  if(g&&(g[1]+g[2]+g[3])>0){const parts=[3,2,1].filter(s=>g[s]>0).map(s=>`${g[s]} ${'★'.repeat(s)}`);const plain=inv(k)-g[1]-g[2]-g[3];if(plain>0)parts.push(`${plain} plain`);
    r.desc=(r.desc?r.desc+' ':'')+`Made: ${parts.join(', ')}.${sellPrice(k)?` The best sells for ${qPrice(k,iqBest(k))}.`:''}`;}return r;};}
