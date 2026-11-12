/* ================= #289/#290 the slow ways to grow, taught in the tutorial. Four of Caitlyn's side lessons come along once you're
   ready for them, each with a pin on your map and the guide arrow pointing the way:
     Buy land        the land office at the Town Hall door in Marrow Hollow (every plot for sale has a FOR SALE sign; the bank
                     counter beside the office sells the bottom field and lends on any land, a fifth down)
     Your money      the ledger in the same office: buy into a town shop, or lease the storefront on the square, name it,
                     hire people from town and keep it stocked
     Farmhands       the farm book (in the land office, or on Grandpa's desk at home): hire hands for your land, paid at dawn
     A bouquet       at Bell's Feed & Stock: give it to someone at eight hearts to ask them out
   Each one is done once you've been there and opened it (or bought the bouquet). ================= */

const guideS=()=>(S.guide=S.guide||{});
if(typeof PERSONAL!=='undefined'&&!PERSONAL.includes('guide'))PERSONAL.push('guide');
function guideHall(){return {x:57.4,z:-10.2};}
function guideFeed(){const o=OBJ.find(q=>q.spr==='shop_feed'&&q.kind==='bld');return o?{x:o.x,z:o.z+.8}:{x:57.4,z:-10.2};}
// a pin on your own map, and the arrow pointing to it
function guidePin(id,at,name,k){try{const M=mmMarks();let m=M.find(q=>q.gd===id);if(!m){m={id:'gd_'+id,gd:id,x:+at.x.toFixed(2),z:+at.z.toFixed(2),n:name,k:k||'star'};M.push(m);}S.markGo=m.id;}catch(e){}}
function guideUnpin(id){try{const M=mmMarks();const m=M.find(q=>q.gd===id);if(!m)return;if(S.markGo===m.id)S.markGo=null;S.marks=M.filter(q=>q!==m);}catch(e){}}
const guideOwnsLand=()=>{try{return Object.keys(landOwnedSet()||{}).length>0;}catch(e){return false;}};
const guideDating=()=>{try{return Object.keys(ROMANCE||{}).some(id=>romDating(id));}catch(e){return false;}};
const guideBusy=()=>['land','invest','hands','bouquet'].some(id=>S.ls&&S.ls.side&&S.ls.side[id]&&S.ls.side[id].st==='on')||(typeof maeT!=='undefined'&&maeT>0);   // one at a time
const guideCrush=()=>{try{return Object.keys(ROMANCE||{}).some(id=>hearts(id)>=7);}catch(e){return false;}};
LS_SIDE.push(
  {id:'land',title:'More land',when:()=>!guideBusy()&&S.day>=4&&(S.coins>=300||S.day>=7)&&!guideOwnsLand(),
   say:'Want a bigger field? Deeds are sold at the land office, inside the Town Hall in Marrow Hollow: Agnes Abernathy keeps the counter, nine till three. Every plot for sale has a FOR SALE sign on it. The bank counter next to it lends on land: a fifth down, a little each morning. I’ve put a pin on your map.',
   begin:b=>{guidePin('land',guideHall(),'Land office','star');},ok:()=>!!guideS().land,coins:20,done:'That’s the land office. Buy a plot whenever you’re ready, and it’s yours to clear and plant.'},
  {id:'invest',title:'Make money work',when:()=>!guideBusy()&&S.day>=8&&(S.coins>=500||S.day>=12),
   say:'Money can make money here. In the land office there’s a ledger: buy a share of a town shop and it pays you every morning, or lease the empty storefront on the square, name it, hire people from town and keep it stocked. I pinned it.',
   begin:b=>{guidePin('invest',guideHall(),'The ledger (land office)','star');},ok:()=>!!guideS().invest,coins:20,done:'That’s the ledger. Shares on one page, your own shop on the other. Start small.'},
  {id:'hands',title:'Farmhands',when:()=>!guideBusy()&&(guideOwnsLand()||S.day>=10),
   say:'When there’s more field than you can work, hire hands. Open the farm book (in the land office, or on Grandpa’s desk at home): Dell waters, the Kettle twins pick, Old Merritt sows, Hannah clears and tills. They’re paid at dawn from the tin.',
   begin:b=>{guidePin('hands',guideHall(),'The farm book (land office)','star');},ok:()=>!!guideS().hands,coins:20,done:'That’s the farm book. Fill the tin before bed or nobody works tomorrow.'},
  {id:'bouquet',title:'A bouquet',when:()=>!guideBusy()&&guideCrush()&&!guideDating(),
   say:'Somebody likes you a lot. At eight hearts their friendship stops until you ask them out: buy a wildflower bouquet from Ezra at Bell’s Feed & Stock (30 coins) and give it to them. The pin’s on your map.',
   begin:b=>{guidePin('bouquet',guideFeed(),'Bouquets (Feed & Stock)','heart');},ok:()=>!!guideS().bouquet||guideDating(),coins:0,done:'Got one? Give it to them in person. Pick a good day.'});
// what counts as having been there
{const _os=openShop;openShop=function(k){const r=_os.apply(this,arguments);try{if(k==='land'){guideS().land=1;guideUnpin('land');}}catch(e){}return r;};}
if(typeof bizOpen==='function'){const _b=bizOpen;bizOpen=function(){const r=_b.apply(this,arguments);try{guideS().invest=1;guideUnpin('invest');}catch(e){}return r;};}
if(typeof empOpen==='function'){const _e=empOpen;empOpen=function(){const r=_e.apply(this,arguments);try{guideS().hands=1;guideUnpin('hands');}catch(e){}return r;};}
setInterval(()=>{try{if(S.mode==='play'&&inv('bouquet')>0&&!guideS().bouquet){guideS().bouquet=1;guideUnpin('bouquet');}}catch(e){}},1000);
// ---- leaving the world: back to the title screen from the menu (it saves first; on a friend's farm your things go home with you;
// a host's friends are sent home). Tap once to ask, again to go.
{const bb=$('bagClose');if(bb){const L=document.createElement('button');L.className='close';L.id='bagLeave';L.textContent='Leave world';L.style.marginRight='auto';
  let armed=0;const reset=()=>{armed=0;L.textContent='Leave world';L.classList.remove('hot');};
  L.addEventListener('click',()=>{if(!armed){armed=1;L.textContent='Leave? Tap again';L.classList.add('hot');setTimeout(reset,3500);return;}
    reset();const role=typeof HOST!=='undefined'?HOST.role:null;
    try{if(S.mode==='play'||S.paused)saveGame(true);}catch(e){}
    if(role==='guest'){hostLeave();return;}   // (saves your own things into your own save, then back to the title)
    if(role==='host'){try{hostLeave(true);}catch(e){}}
    S.mode='trans';try{fade(1);}catch(e){}setTimeout(()=>location.reload(),450);});
  bb.parentNode.insertBefore(L,bb.parentNode.firstChild);}}
