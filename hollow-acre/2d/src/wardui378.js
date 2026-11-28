/* ================= #378 the wardrobe, part 2: the screen. Twelve tabs (hair to colours), every item shown on you as a thumbnail, a figure you
   can turn and set walking or working, any colour from a curated palette or picked by hue, saturation and brightness, recent colours,
   randomise (all or one tab), undo and redo, saved outfits and favourites. Mouse, touch and pad all work it the same way. ================= */
const WDU={tab:'hair',dir:2,anim:0,edit:false,hist:[],fut:[],start:'',on:false,pick:null,hsv:[0,0,0],q:[],qt:0,pv:null,pvKey:'',atl:{},fav:null,built:false,t0:0};
const WDU_ANIM=[['Walk','','walk'],['Idle','','idle'],['Run','','run'],['Hoe','_hoe','thrust'],['Water','_can','thrust'],['Axe','_axe','thrust'],['Pick','_pick','thrust'],['Fish','_rod','thrust']];
const WDU_DIRS=['N','W','S','E'];
// the tabs: each section is an item grid (pos), a pattern grid (pat) or colours only; tag/notag split one position across two tabs
const WDU_ALWAYS={hair:1,face:1,tops:1,bottoms:1,outer:1,shoes:1,head:1,eyewear:1,jewel:1,acc:1,colours:1};
const WDU_TABS=[
  ['hair','Hair',[{pos:'hair',t:'Hairstyle',cols:['hair'],req:1},{pos:'dye',t:'Two-tone',cols:['hair2'],none:'One colour'},{pos:'beard',t:'Facial hair',cols:['beard'],none:'None'}]],
  ['face','Face',[{t:'Skin',cols:['skin']},{pos:'eyes',t:'Eyes',cols:['eye','eye2'],none:'Natural'},{pos:'brows',t:'Eyebrows',cols:['brow'],none:'Natural'},{pos:'freckles',t:'Freckles',cols:['mark'],none:'None'},
    {pos:'mole',t:'Beauty marks',cols:['mark'],none:'None'},{pos:'scar',t:'Scars',cols:[],none:'None'},{pos:'pnose',t:'Nose piercing',cols:['pierce'],none:'None'},{pos:'pbrow',t:'Brow piercing',cols:['pierce'],none:'None'},{pos:'plip',t:'Lip piercing',cols:['pierce'],none:'None'}]],
  ['makeup','Makeup',[{pos:'lips',t:'Lipstick',cols:['lip'],none:'None'},{pos:'liner',t:'Eyeliner',cols:['liner'],none:'None'},{pos:'shadow',t:'Eyeshadow',cols:['shadow'],none:'None'},{pos:'blush',t:'Blush',cols:['blush'],none:'None'},
    {pos:'paint',t:'Face paint',cols:['paint','paint2'],none:'None'},{pos:'tattoo',t:'Tattoos',cols:['tattoo'],none:'None'}]],
  ['tops','Tops',[{pos:'top',t:'Top',cols:['top','top2'],req:1},{pat:'top',t:'Pattern',cols:['toppat']}]],
  ['bottoms','Bottoms',[{pos:'bottom',t:'Bottoms',cols:['bottom','bottom2'],req:1},{pat:'bottom',t:'Pattern',cols:['botpat']}]],
  ['outer','Outerwear',[{pos:'outer',t:'Outerwear',cols:['outer','outer2'],none:'None'},{pat:'outer',t:'Pattern',cols:['outpat']}]],
  ['shoes','Shoes',[{pos:'shoes',t:'Shoes',cols:['shoes','shoes2'],req:1},{pos:'socks',t:'Socks',cols:['socks'],none:'None'}]],
  ['head','Headwear',[{pos:'hat',t:'Hats',cols:['hat','hat2'],none:'None'},{pos:'headacc',t:'In your hair',cols:['headacc','headacc2'],none:'None'}]],
  ['eyewear','Eyewear',[{pos:'glasses',t:'Glasses',cols:['frame','lens'],none:'None'}]],
  ['jewel','Jewellery',[{pos:'ear',t:'Earrings',cols:['ear','gem'],none:'None'},{pos:'neck',tag:'jewel',t:'Necklaces',cols:['neck','gem'],none:'None'},{pos:'wrist',t:'Wrists',cols:['wrist'],none:'None'},{t:'Metal & stones',cols:['metal','gem']}]],
  ['acc','Accessories',[{pos:'neck',notag:'jewel',t:'Neckwear',cols:['neck','neck2'],none:'None'},{pos:'waist',t:'Belts',cols:['waist','waist2'],none:'None'},{pos:'back',t:'Bags',cols:['back','back2'],none:'None'},{pos:'hand',t:'Gloves',cols:['hand'],none:'None'}]],
  ['colours','Colours',[{t:'Skin, eyes and hair',cols:['skin','eye','eye2','brow','hair','hair2','beard']},{t:'Clothes',cols:['top','top2','toppat','bottom','bottom2','botpat','outer','outer2','outpat','shoes','shoes2','socks']},
    {t:'Hats, glasses and jewellery',cols:['hat','hat2','frame','lens','metal','gem','ear','pierce']},{t:'Accessories',cols:['neck','neck2','headacc','headacc2','waist','waist2','back','back2','wrist','hand']},
    {t:'Makeup and marks',cols:['lip','liner','shadow','blush','paint','paint2','tattoo','mark']}]]];
// the part of the 48x64 frame each kind of thumbnail shows
const WDU_CROP={hair:[0,4,48,40],dye:[0,4,48,40],beard:[12,22,24,20],hat:[0,0,48,40],headacc:[0,4,48,40],glasses:[12,24,24,14],ear:[4,22,40,20],
  top:[8,24,32,38],bottom:[4,36,40,28],outer:[8,24,32,38],shoes:[8,48,32,16],socks:[8,44,32,20],neck:[8,26,32,24],waist:[4,40,40,20],back:[0,20,48,40],wrist:[0,36,48,24],hand:[0,36,48,24],
  brows:[14,24,20,10],eyes:[14,26,20,10],lips:[16,32,16,10],liner:[14,26,20,10],shadow:[14,24,20,12],blush:[12,28,24,12],freckles:[12,28,24,12],mole:[12,24,24,20],scar:[12,22,24,20],
  paint:[8,18,32,26],tattoo:[4,20,40,34],pnose:[16,28,16,10],pbrow:[14,22,20,12],plip:[16,32,16,10],pat:[4,36,40,24]};
const wduEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
// ---- the look: every change goes through here (undo history, the preview, the thumbnails)
const wduSig=()=>wdEnc(S.look.w);
function wduPush(){const s=wduSig();if(WDU.hist[WDU.hist.length-1]!==s){WDU.hist.push(s);if(WDU.hist.length>60)WDU.hist.shift();}WDU.fut.length=0;}
function wduLoad(sig){const w=wdDec(sig);if(!w)return;S.look.w=w;wdSync();wduChanged(true);}
function wduUndo(){if(WDU.hist.length<2)return;WDU.fut.push(WDU.hist.pop());wduLoad(WDU.hist[WDU.hist.length-1]);SFX.click&&SFX.click();}
function wduRedo(){const s=WDU.fut.pop();if(!s)return;WDU.hist.push(s);wduLoad(s);SFX.click&&SFX.click();}
function wduSet(pos,id){const w=S.look.w;const e=id?wdItem(pos,id):null;if((w.it[pos]||'')===(id||''))return;if(id)w.it[pos]=id;else delete w.it[pos];
  // an item that arrives with its own colours (a top hat is black) brings them; a onepiece clears the bottoms
  if(e&&e.def)for(const k in e.def)if(WD_HEX.test(e.def[k]||''))w.c[k]=e.def[k].toLowerCase();
  wdSync();wduPush();wduChanged();}
function wduSetPat(g,id){const w=S.look.w;if((w.pat[g]||'')===(id||''))return;if(id)w.pat[g]=id;else delete w.pat[g];wdSync();wduPush();wduChanged();}
function wduSetCol(k,hex,commit){const w=S.look.w;if(hex)w.c[k]=hex.toLowerCase();else delete w.c[k];wdSync();if(commit){wduPush();if(hex)wduRecent(hex);}wduChanged(false,k);}
function wduRecent(hex){const R=Array.isArray(S.look.wrec)?S.look.wrec:[];const i=R.indexOf(hex);if(i>=0)R.splice(i,1);R.unshift(hex);R.length=Math.min(R.length,14);S.look.wrec=R;}
let wduCT=0;
function wduChanged(full,colKey){WDU.pvKey='';if(full)wduRender();else wduMark();clearTimeout(wduCT);wduCT=setTimeout(()=>wduThumbsAll(),colKey?120:0);wduEnsure();wduBtns();}
// the layers a look in the wardrobe needs (its walk and the animation shown) load as soon as it's chosen
function wduEnsure(){const t=WDU_ANIM[WDU.anim][1];const need=wdNeed(S.look.w,t?['',t]:['']);if(!need.length)return;const tok=WDU.ld={};
  loadImages(need).then(()=>{for(const s of need)if(!(IMG[s]&&IMG[s].width))WD.tried.add(s);if(WDU.ld===tok){WDU.pvKey='';wduThumbsAll();}});}
// ---- the screen's look: the game's wood frame and tabs, square pixel corners, thumb-sized targets on touch
{const css=document.createElement('style');css.textContent=`
#creator.wd8[hidden]{display:none!important}
#creator.wd8:not([hidden]){display:flex!important}#creator.wd8{zoom:var(--tu,1);flex-direction:column!important;padding:max(58px,calc(env(safe-area-inset-top,0px) + 52px)) 10px max(8px,env(safe-area-inset-bottom,0px))!important;justify-content:center!important;align-items:center!important;overflow:hidden!important;gap:0!important}
#creator.wd8::after{display:none!important}
#creator .wdr #cTabs,#creator .wdr #cPrev,#creator .wdr .wdFoot{order:0!important}
#creator.wd8>:not(.wdr){display:none!important}
.wdr{display:grid;grid-template-columns:268px minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto;grid-template-areas:"l r" "f r";gap:10px 12px;width:100%;max-width:1120px;flex:0 1 680px;height:auto;min-height:0;max-height:680px;box-sizing:border-box;padding:14px;text-align:left;position:relative;
  background:linear-gradient(var(--px-panel2),var(--px-panel));box-shadow:0 0 0 3px var(--px-dark),inset 0 0 0 3px var(--px-light),inset 0 0 0 6px var(--px-wood),inset 0 0 0 8px var(--px-wood2),6px 6px 0 3px rgba(0,0,0,.4);color:var(--bone);font-family:var(--font-body)}
.wdr button{font:13px var(--font-body);color:#f4e6c8;background:#3a2210;border:0;border-radius:0;box-shadow:inset 0 0 0 1px #120a04,inset 0 2px 0 #5a3a1e;padding:5px 9px;min-height:34px;cursor:pointer;touch-action:manipulation;line-height:1.1}
.wdr button:hover{background:#4a2c14}.wdr button:disabled{opacity:.45;cursor:default}
.wdLf{grid-area:l;display:flex;flex-direction:column;align-items:stretch;gap:8px;min-height:0;overflow:auto}
.wdRt{grid-area:r;display:flex;flex-direction:column;min-width:0;min-height:0;gap:8px}
.wdFoot{grid-area:f;display:flex;gap:8px}.wdFoot #cGo{flex:1;font:20px var(--font-display);min-height:46px}.wdFoot #wdCancel{flex:none}
.wdLf #cKick{margin:0;text-align:center}
.wdTop{display:flex;flex-direction:column;align-items:center;gap:8px}.wdSide{display:flex;flex-direction:column;gap:6px;width:100%}
#creator#creator .wdr #cPrev{width:192px!important;height:256px!important;padding:6px 26px!important;box-sizing:content-box;image-rendering:pixelated;background:linear-gradient(#3a2414 0 76%,#2a1608 76%)!important;box-shadow:0 0 0 2px #140a04,inset 0 0 0 2px #8a5426,inset 0 0 0 4px #2c1a0e!important;border-radius:0!important;touch-action:pan-y;grid-row:auto!important;cursor:grab}
.wdTurn{display:flex;gap:6px;justify-content:center}.wdTurn button{min-width:44px}#creator #cAnim{min-width:76px!important;width:auto!important}
.wdLf #cName{font:15px var(--font-body);width:100%;box-sizing:border-box;padding:7px 9px;background:#2a1a0e;color:#f4e6c8;border:0;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 3px #b8521c}
.wdActs{display:grid;grid-template-columns:1fr 1fr;gap:6px}.wdS{display:none}
#creator .wdr #cTabs{display:flex;flex-wrap:nowrap;gap:4px;justify-content:flex-start;overflow-x:auto;overscroll-behavior:contain;scrollbar-width:none;padding-bottom:2px}#creator .wdr #cTabs::-webkit-scrollbar{display:none}
#creator .wdr #cTabs button{flex:1 0 auto;padding:5px 7px!important;min-height:34px}
.wdPanel{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;padding:2px 8px 12px 2px;scrollbar-color:#8a5426 #1e1208}
.wdSec{margin:2px 0 14px}.wdSec>h3{display:flex;align-items:center;gap:8px;margin:0 0 6px;font:13px var(--font-body);color:var(--ember);letter-spacing:.06em;text-transform:uppercase}
.wdSec>h3 .wdN{color:var(--dim);text-transform:none;letter-spacing:0}.wdSec>h3 .wdSp{flex:1}.wdSec>h3 button{min-height:30px;padding:3px 8px;font-size:12px;text-transform:none;letter-spacing:0}
.wdNote{font-size:13px;color:var(--dim);margin:2px 0 8px}
.wdG{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:6px}
.wdr .wdi{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:3px;padding:5px 3px 5px;min-height:114px;position:relative;background:#2a180c}
.wdr .wdi.on{background:#5a3016;box-shadow:inset 0 0 0 2px var(--ember),inset 0 0 0 3px #140a04}
.wdi .wdT{width:96px;height:80px;display:flex;align-items:center;justify-content:center;pointer-events:none}
#creator#creator .wdr .wdi canvas{width:auto;height:auto;max-width:none;image-rendering:pixelated;background:none!important;border-radius:0!important;padding:0!important;box-shadow:none!important;grid-row:auto!important}
.wdi .wdLb{font-size:12px;line-height:1.15;text-align:center;color:#e9dfc6;pointer-events:none}
.wdi .wdStar{position:absolute;top:3px;right:4px;width:9px;height:9px;pointer-events:none}
.wdi .wdNone{font-size:13px;color:var(--dim)}
.wdc{display:flex;align-items:center;gap:8px;margin:6px 0;flex-wrap:wrap}
.wdc .wdcl{width:122px;font-size:13px;color:var(--dim)}
.wdr .wdcs{width:44px;height:34px;padding:0;box-shadow:inset 0 0 0 2px #140a04,inset 0 0 0 4px rgba(255,255,255,.2)}
.wdr .wdcs.auto{background:repeating-linear-gradient(45deg,#4a3828 0 4px,#2a1c12 4px 8px)}
.wdcq{display:flex;gap:4px;flex-wrap:wrap;flex:1;min-width:0;align-items:center}
.wdr .sw{width:26px;height:26px;min-height:26px;padding:0;box-shadow:inset 0 0 0 2px #140a04,inset 0 0 0 3px rgba(255,255,255,.14)}
.wdr .sw.on{outline:2px solid var(--ember);outline-offset:1px}
.wdr .wdce{min-height:30px;padding:3px 9px;font-size:12px}
.wdp{width:100%;margin:2px 0 10px;padding:10px;box-sizing:border-box;background:#1e1208;box-shadow:inset 0 0 0 2px #140a04,inset 0 0 0 3px #5a3416}
.wdpPal{display:grid;grid-template-columns:repeat(auto-fill,minmax(26px,1fr));gap:4px}
.wdpRec{display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin-top:8px;min-height:26px}.wdpRec>span{font-size:12px;color:var(--dim);margin-right:4px}
.wdpS{display:grid;grid-template-columns:86px 36px minmax(0,1fr) 36px 46px;align-items:center;gap:6px;margin-top:8px}.wdpS>span{font-size:12px;color:var(--dim)}
.wdr .wdpS button{min-height:30px;padding:0;font-size:16px}
#creator#creator .wdr .wdpS canvas{width:100%!important;height:28px!important;image-rendering:pixelated;cursor:pointer;touch-action:none;border-radius:0!important;padding:0!important;background:none!important;box-shadow:0 0 0 2px #140a04!important;grid-row:auto!important}
.wdpS .wdpVal{font-size:12px;text-align:right;color:#e9dfc6}
.wdpF{display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap}.wdpF .wdpHex{font-size:13px;color:#e9dfc6;margin-right:auto}
.wdSheet{position:absolute;inset:6px;z-index:5;display:flex;flex-direction:column;gap:8px;padding:16px;background:linear-gradient(var(--px-panel2),var(--px-panel));box-shadow:0 0 0 3px var(--px-dark),inset 0 0 0 3px var(--px-light),inset 0 0 0 6px var(--px-wood)}
.wdSheet h3{margin:0;font:20px var(--font-display);color:var(--ember)}.wdSheet p{margin:0;font-size:13px;color:var(--dim)}.wdSheet .wdSL{flex:1;min-height:0;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;align-content:start}
.wdSlot{display:flex;flex-direction:column;align-items:center;gap:5px;padding:8px;background:#2a180c;box-shadow:inset 0 0 0 1px #120a04}
#creator#creator .wdr .wdSlot canvas{width:72px!important;height:96px!important;image-rendering:pixelated;background:#3a2414!important;border-radius:0!important;padding:0!important;grid-row:auto!important}
.wdSlot .wdSN{font-size:13px}.wdSlot .wdSB{display:flex;gap:4px}.wdSheet .wdSF{display:flex;justify-content:flex-end}
/* the scroll cues */
.wdTW,.wdPW{position:relative;min-width:0;min-height:0}.wdPW{flex:1;display:flex;flex-direction:column}.wdPW>.wdPanel{flex:1}
.wdTW::before,.wdTW::after{content:'';position:absolute;top:0;bottom:4px;width:34px;pointer-events:none;opacity:0;z-index:2;background-repeat:no-repeat;background-size:8px 14px}
.wdTW::after{right:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 7' shape-rendering='crispEdges'%3E%3Cpath d='M0 0h1v1h1v1h1v1h1v1H3v1H2v1H1v1H0z' fill='%23f0c070'/%3E%3C/svg%3E"),linear-gradient(90deg,rgba(44,26,14,0),#2c1a0e 70%);background-position:right 5px center,0 0;background-size:8px 14px,100% 100%}
.wdTW::before{left:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 7' shape-rendering='crispEdges'%3E%3Cpath d='M0 0h1v1h1v1h1v1h1v1H3v1H2v1H1v1H0z' fill='%23f0c070'/%3E%3C/svg%3E"),linear-gradient(90deg,rgba(44,26,14,0),#2c1a0e 70%);background-position:right 5px center,0 0;background-size:8px 14px,100% 100%;transform:scaleX(-1);transform-origin:center}
.wdTW.cr::after,.wdTW.cl::before{opacity:1}
.wdPW::after{content:'';position:absolute;left:0;right:8px;bottom:0;height:28px;pointer-events:none;opacity:0;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 7 4' shape-rendering='crispEdges'%3E%3Cpath d='M0 0h7v1H6v1H5v1H4v1H3V3H2V2H1V1H0z' fill='%23f0c070'/%3E%3C/svg%3E") center bottom 4px/14px 8px no-repeat,linear-gradient(rgba(44,26,14,0),#2c1a0e 75%)}.wdPW.cb::after{opacity:1}
/* phones held upright: one column, the figure beside its buttons, Drive pinned at the foot */
@media (max-width:640px){
  #creator.wd8{padding-left:6px!important;padding-right:6px!important}
  #creator.wd8{justify-content:flex-start!important}
  .wdr{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto;grid-template-areas:"l" "r" "f";width:100%;flex:1 1 auto;max-height:none;padding:10px;gap:8px}
  .wdLf{overflow:visible;gap:6px}.wdLf #cKick{font-size:14px}
  .wdTop{flex-direction:row;align-items:flex-start;gap:8px}.wdSide{flex:1;min-width:0}
  #creator#creator .wdr #cPrev{width:96px!important;height:128px!important;padding:4px 8px!important}
  #creator .wdr #cTabs{flex-wrap:nowrap;overflow-x:auto;overscroll-behavior:contain;padding-bottom:4px;scrollbar-width:none}
  #creator .wdr #cTabs button{flex:0 0 auto;min-height:44px!important}
  .wdr button{min-height:44px}.wdr .sw{width:36px;height:36px;min-height:36px}.wdr .wdcs{height:40px}.wdr .wdce{min-height:40px}
  .wdc .wdcl{width:100%}.wdpS{grid-template-columns:44px minmax(0,1fr) 44px 40px;row-gap:2px}.wdpS>span:first-child{grid-column:1/-1}.wdr .wdpS button{min-height:40px}
  .wdpPal{grid-template-columns:repeat(auto-fill,minmax(36px,1fr))}.wdG{grid-template-columns:repeat(auto-fill,minmax(100px,1fr))}
  .wdp{display:flex;flex-direction:column}.wdp>.wdpS{order:1}.wdp>.wdpF{order:2;margin:8px 0}.wdp>.wdpPal{order:3}.wdp>.wdpRec{order:4}
}
/* phones on their side: a slim figure column, the options take the rest */
@media (max-height:520px) and (min-width:641px){
  #creator.wd8{padding-top:max(50px,calc(env(safe-area-inset-top,0px) + 46px))!important}
  #creator.wd8{justify-content:flex-start!important}
  .wdr{grid-template-columns:252px minmax(0,1fr);flex:1 1 auto;max-height:none;padding:10px;gap:6px 10px}
  .wdTop{flex-direction:row;align-items:flex-start}.wdSide{flex:1;min-width:0}.wdLf #cKick{display:none}.wdLf{gap:6px}
  #creator#creator .wdr #cPrev{width:96px!important;height:128px!important;padding:2px 4px!important}
  .wdTurn button{min-width:34px;padding:4px!important}#creator #cAnim{min-width:52px!important;flex:1}.wdS{display:inline}.wdLg{display:none}
  .wdLf #cName{padding:5px 8px;font-size:13px}
  #creator .wdr #cTabs{flex-wrap:nowrap;overflow-x:auto;overscroll-behavior:contain;scrollbar-width:none;padding-bottom:2px}
  #creator .wdr #cTabs button{flex:0 0 auto;min-height:40px!important}
  .wdr button{min-height:38px}.wdFoot #cGo{font-size:18px;min-height:42px}
}
@media (pointer:coarse){.wdr .sw{width:36px;height:36px;min-height:36px}.wdpPal{grid-template-columns:repeat(auto-fill,minmax(36px,1fr))}}
`;document.head.appendChild(css);}
// ---- what each section shows
const wduPal=p=>{const s=WD_PAL[p]||'',a=[];for(let i=0;i+6<=s.length;i+=6)a.push('#'+s.slice(i,i+6));return a;};
const WDU_THG={hair:'hair',beard:'beard',hat:'hat',glasses:'glasses',top:'top',bottom:'bottom',outer:'outer',shoes:'shoes'};
// the 0-byte recolours need the new base body (its hands and shins are drawn in their own colours); on an old one-piece outfit socks show only on bare legs
function wduItems(sec){const w=S.look.w,lb=wdLegacyBody(w),t=lb&&wdGet(w,'top'),bare=!!(t&&t.tags.includes('skirt'));
  return (WD.cats[sec.pos]||[]).filter(e=>(!sec.tag||e.tags.includes(sec.tag))&&(!sec.notag||!e.tags.includes(sec.notag))&&
    !(lb&&(e.flags.includes('recolourHand')||e.flags.includes('recolourWrist')))&&!(lb&&e.cat==='socks'&&!bare));}
// a colour row belongs on a tab when something you wear uses it (the colours tab shows them all)
function wduRel(k){const w=S.look.w,g=p=>wdGet(w,p),has=(p,s)=>{const e=g(p);return !!(e&&e.slots.includes(s));},lb=wdLegacyBody(w),t=g('top');
  switch(k){case 'hair2':return !!(w.it.dye&&wdItem('dye',w.it.dye));case 'beard':return !!g('beard');
    case 'top2':return has('top','top2');case 'toppat':return !!w.pat.top;case 'botpat':return !!w.pat.bottom;case 'outpat':return !!w.pat.outer;
    case 'bottom':return lb?!!(t&&t.slots.includes('bottom')):!!g('bottom');case 'bottom2':return lb?has('top','bottom2'):has('bottom','bottom2');
    case 'outer':return lb?has('top','outer'):!!g('outer');case 'outer2':return has('outer','outer2');
    case 'shoes2':return has('shoes','shoes2');case 'socks':return !!g('socks');case 'hat':return !!g('hat');case 'hat2':return has('hat','hat2');
    case 'frame':return has('glasses','frame');case 'lens':return has('glasses','lens');case 'ear':return !!g('ear');
    case 'gem':return WD_POS.some(p=>has(p,'gem'));case 'metal':return WD_POS.some(p=>has(p,'metal'))||(lb&&has('top','metal'));
    case 'neck':return !!g('neck');case 'neck2':return has('neck','neck2');case 'headacc':return !!g('headacc');case 'headacc2':return has('headacc','headacc2');
    case 'waist':return !!g('waist');case 'waist2':return has('waist','waist2');case 'back':return !!g('back');case 'back2':return has('back','back2');
    case 'wrist':return !!g('wrist');case 'hand':return !!g('hand');case 'lip':return !!g('lips');case 'liner':return !!g('liner');case 'shadow':return !!g('shadow');
    case 'blush':return !!g('blush');case 'paint':return !!g('paint');case 'paint2':return has('paint','paint2');case 'tattoo':return !!g('tattoo');
    case 'mark':return !!(g('freckles')||g('mole'));case 'pierce':return !!(g('pnose')||g('pbrow')||g('plip'));}
  return true;}
const WDU_FOL={brow:'Match hair',beard:'Match hair',eye2:'Same as eyes',mark:'Match skin',pierce:'Match metal',toppat:'Auto',botpat:'Auto',outpat:'Auto',lens:'Clear'};
const WDU_ORIG={top2:1,bottom2:1,metal:1,frame:1,ear:1,gem:1,hat2:1};
function wduColRow(k){const K=WD_K[k];if(!K)return '';const w=S.look.w,set=wdCol(w,k),v=set||(WDU_ORIG[k]||WDU_FOL[k]?null:K.def),pal=wduPal(K.pal),cur=(v||'').toLowerCase();
  const quick=pal.slice(0,12),rec=(Array.isArray(S.look.wrec)?S.look.wrec:[]).filter(c=>!quick.includes(c)).slice(0,4);
  const sw=c=>`<button class="sw${c===cur?' on':''}" data-k="${k}" data-c="${c}" style="background:${c}" aria-label="${wduEsc(K.label)} ${c}"></button>`;
  return `<div class="wdc" data-k="${k}"><span class="wdcl">${wduEsc(K.label)}</span><button class="wdcs${v?'':' auto'}" data-pk="${k}" ${v?`style="background:${v}"`:''} aria-label="Pick any colour for ${wduEsc(K.label)}"></button>
    <span class="wdcq">${quick.map(sw).join('')}${rec.map(sw).join('')}</span><button class="wdce" data-pk="${k}">${WDU.pick===k?'Close':'More'}</button></div>`;}
function wduColsOf(sec,all){const ks=(sec.cols||[]).filter(k=>all||wduRel(k));return ks.map(wduColRow).join('');}
const wduFav=()=>Array.isArray(S.look.wfav)?S.look.wfav:(S.look.wfav=[]);
const WDU_STAR='<svg class="wdStar" viewBox="0 0 9 9" shape-rendering="crispEdges"><path d="M4 0h1v2h1v1h3v1H8v1H7v1h1v2H7V8H6V7H3v1H2v1H1V7h1V6H1V5H0V4h3V3h1z" fill="#f0c040"/><path d="M4 0h1v2H4zM3 3h1v1H3z" fill="#fff6c0"/></svg>';
function wduCell(pos,e,label,extra){const id=e?e.id:'';const on=(S.look.w.it[pos]||'')===id;const fav=e&&wduFav().includes(pos+':'+id);const c=WDU_CROP[pos]||WDU_CROP.hair;
  return `<button class="wdi${on?' on':''}" data-pos="${pos}" data-id="${id}"${extra||''} aria-pressed="${on}"><span class="wdT"><canvas data-th="${pos}:${id}" width="${c[2]}" height="${c[3]}"></canvas></span><span class="wdLb">${wduEsc(label)}</span>${fav?WDU_STAR:''}</button>`;}
function wduSecHtml(sec,si,all){const w=S.look.w,lb=wdLegacyBody(w);let grid='',note='',n=0,head='';
  if(sec.pos){let items=wduItems(sec);if(sec.pos==='top'&&!lb)items=items.filter(e=>!e.flags.includes('legacyBody'));
    if(lb&&/^(bottom|outer|shoes)$/.test(sec.pos)&&!items.some(e=>!e.flags.includes('legacyBody'))){items=[];note=sec.pos==='bottom'?'This outfit comes with its own trousers or skirt. Change its colours here.':sec.pos==='shoes'?'This outfit comes with its own shoes. Change their colours here.':'';}
    else if(lb&&/^(bottom|outer|shoes)$/.test(sec.pos)){note='Your outfit is one piece: choose a new top to wear these.';items=[];}
    if(!items.length&&!wduColsOf(sec,all)&&!note)return '';n=items.length;
    const F=wduFav();items=items.slice().sort((a,b)=>(F.includes(sec.pos+':'+b.id)?1:0)-(F.includes(sec.pos+':'+a.id)?1:0));
    if(items.length)grid=`<div class="wdG">${!sec.req&&sec.none?wduCell(sec.pos,null,sec.none):''}${items.map(e=>wduCell(sec.pos,e,e.label)).join('')}</div>`;
    const cur=wdItem(sec.pos,w.it[sec.pos]);
    head=`<span class="wdN">${n?n+(n===1?' choice':' choices'):''}</span><span class="wdSp"></span>${items.length?`<button data-fav="${cur?sec.pos+':'+cur.id:''}"${cur?'':' hidden'}>${cur&&wduFav().includes(sec.pos+':'+cur.id)?'Unfavourite':'Favourite'}</button><button data-rnd="${sec.pos}">Random</button>`:''}`;}
  else if(sec.pat){const t=wdGet(w,'top');const ok=sec.pat==='top'&&(lb?!!(t&&t.slots.includes('toppat')):!!(t&&t.flags.includes('pattern')));
    if(!ok&&!all)return '';const ids=Object.keys(WD_PAT);n=ids.length;
    grid=ok?`<div class="wdG">${ids.map(id=>{const on=(w.pat[sec.pat]||'')===id,c=WDU_CROP.pat;return `<button class="wdi${on?' on':''}" data-pat="${sec.pat}" data-id="${id}" aria-pressed="${on}"><span class="wdT"><canvas data-th="pat:${sec.pat}:${id}" width="${c[2]}" height="${c[3]}"></canvas></span><span class="wdLb">${WD_PAT_LABEL[id]||id}</span></button>`;}).join('')}</div>`:'';
    head=`<span class="wdN">${ok?n+' choices':''}</span><span class="wdSp"></span>`;}
  else head='<span class="wdSp"></span>';
  return `<div class="wdSec" data-si="${si}"><h3>${wduEsc(sec.t)}${head}</h3>${note?`<div class="wdNote">${wduEsc(note)}</div>`:''}${grid}<div class="wdCols" data-si="${si}">${wduColsOf(sec,all)}</div></div>`;}
const wduTab=()=>WDU_TABS.find(t=>t[0]===WDU.tab)||WDU_TABS[0];
function wduTabShown(t){if(WDU_ALWAYS[t[0]])return true;return t[2].some(s=>(s.pos&&wduItems(s).length)||(s.pat&&s.pat==='top')||(!s.pos&&!s.pat));}
function wduRender(keep){const T=$('cTabs'),P=$('wdPanel');if(!T||!P)return;const tabs=WDU_TABS.filter(wduTabShown);if(!tabs.some(t=>t[0]===WDU.tab))WDU.tab=tabs[0][0];
  const th=tabs.map(([id,label])=>`<button data-tab="${id}" role="tab" class="${id===WDU.tab?'on':''}" aria-selected="${id===WDU.tab}">${label}</button>`).join('');if(T.innerHTML!==th)T.innerHTML=th;
  const st=keep?P.scrollTop:0;const tab=wduTab(),all=tab[0]==='colours';P.innerHTML=tab[2].map((s,i)=>wduSecHtml(s,i,all)).join('')||'<div class="wdNote">Nothing here yet.</div>';P.scrollTop=st;
  WDU.pick=null;wduThumbsAll();wduBtns();
  // the chosen tab is brought into view where the row slides sideways
  const on=T.querySelector('button.on');if(on&&T.scrollWidth>T.clientWidth+2){const l=on.offsetLeft-T.offsetLeft,r=l+on.offsetWidth;if(l<T.scrollLeft+8||r>T.scrollLeft+T.clientWidth-8)T.scrollLeft=Math.max(0,l-(T.clientWidth-on.offsetWidth)/2);}
  requestAnimationFrame(wduCues);}
// "more this way" cues: a fade with an arrow at the edge of the tab row, and at the foot of the panel, only while there is more to see
function wduCues(){const T=$('cTabs'),P=$('wdPanel');if(!T||!P)return;const tw=T.parentElement,pw=P.parentElement;
  const l=T.scrollLeft>4,r=T.scrollLeft+T.clientWidth<T.scrollWidth-4,b=P.scrollTop+P.clientHeight<P.scrollHeight-6;
  if(tw.classList.contains('cl')!==l)tw.classList.toggle('cl',l);if(tw.classList.contains('cr')!==r)tw.classList.toggle('cr',r);if(pw.classList.contains('cb')!==b)pw.classList.toggle('cb',b);}
// after a change: the chosen marks move, colour rows that now apply appear, nothing else is rebuilt
function wduMark(){const P=$('wdPanel');if(!P)return;const w=S.look.w,tab=wduTab(),all=tab[0]==='colours';
  for(const b of P.querySelectorAll('.wdi')){const on=b.dataset.pat?(w.pat[b.dataset.pat]||'')===b.dataset.id:(w.it[b.dataset.pos]||'')===b.dataset.id;if(b.classList.contains('on')!==on){b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);}}
  for(const box of P.querySelectorAll('.wdCols')){const sec=tab[2][+box.dataset.si];if(!sec)continue;const ks=(sec.cols||[]).filter(k=>all||wduRel(k));const sig=ks.join();
    if(box.dataset.ks!==sig){box.dataset.ks=sig;const open=WDU.pick&&ks.includes(WDU.pick)?WDU.pick:null;if(WDU.pick&&box.querySelector('.wdp')&&!open)WDU.pick=null;box.innerHTML=ks.map(wduColRow).join('');if(open)wduPickOpen(open,true);}
    else for(const row of box.querySelectorAll('.wdc')){const k=row.dataset.k,K=WD_K[k],v=wdCol(w,k)||(WDU_ORIG[k]||WDU_FOL[k]?null:K.def),cur=(v||'').toLowerCase();const s=row.querySelector('.wdcs');
      const bg=v||'';if(s.style.background!==bg&&s.dataset.bg!==bg){s.dataset.bg=bg;s.style.background=bg;s.classList.toggle('auto',!v);}
      for(const q of row.querySelectorAll('.sw'))q.classList.toggle('on',q.dataset.c===cur);}}
  const pk=WDU.pick&&P.querySelector('.wdp');if(pk){const v=(wdCol(w,WDU.pick)||'').toLowerCase();for(const q of pk.querySelectorAll('.sw'))q.classList.toggle('on',q.dataset.c===v);}
  for(const b of P.querySelectorAll('button[data-fav]')){const sec=b.closest('.wdSec');const s=sec&&tab[2][+sec.dataset.si];const cur=s&&s.pos&&wdItem(s.pos,w.it[s.pos]);
    if(!cur){b.hidden=true;continue;}b.hidden=false;b.dataset.fav=s.pos+':'+cur.id;const t=wduFav().includes(b.dataset.fav)?'Unfavourite':'Favourite';if(b.textContent!==t)b.textContent=t;}}
function wduBtns(){const u=$('wdUndo'),r=$('wdRedo');if(u&&u.disabled!==(WDU.hist.length<2))u.disabled=WDU.hist.length<2;if(r&&r.disabled!==!WDU.fut.length)r.disabled=!WDU.fut.length;}
// ---- thumbnails: each item drawn on you (idle, facing you), from its own layer once loaded, else from its cell in the category's atlas
function wduAtlas(pos,layer){const g=WDU_THG[pos]||(WD_ACC.includes(pos)?'acc':null);const m=g&&SPR['pl_wdthumb_'+g];if(!m||!m.ids)return null;const i=m.ids.indexOf(layer);if(i<0)return null;
  const im=IMG[m.src];if(!im||!im.width){if(WDU.atl[m.src]===2)return null;if(!WDU.atl[m.src]){WDU.atl[m.src]=1;loadImages([m.src]).then(()=>{if(!(IMG[m.src]&&IMG[m.src].width))WDU.atl[m.src]=2;wduThumbsAll();});}return 0;}const c=m.cols||16;return {im,sx:(i%c)*WD_FW,sy:Math.floor(i/c)*WD_FH};}
function wduThumb(cv){const t=cv.dataset.th;if(!t)return true;const P=t.split(':'),w0=S.look.w,w={v:1,it:Object.assign({},w0.it),pat:Object.assign({},w0.pat),c:Object.assign({},w0.c)};let crop,src={};
  if(P[0]==='pat'){w.pat[P[1]]=P[2];if(!P[2])delete w.pat[P[1]];crop=WDU_CROP.pat;}
  else{const pos=P[0],id=P[1],e=id?wdItem(pos,id):null;if(id)w.it[pos]=id;else delete w.it[pos];if(e&&e.def)for(const k in e.def)w.c[k]=e.def[k];crop=WDU_CROP[pos]||WDU_CROP.hair;
    if(e&&e.layer){const m=SPR[e.layer];if(!(m&&IMG[m.src]&&IMG[m.src].width)){const a=wduAtlas(pos,e.layer);if(!a){if(a===null&&m)wduLoadLayer(m.src);return false;}src[e.layer]=a;}}}
  const d=wdFrame(w,'',10,0,src);const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);g.putImageData(d,-crop[0],-crop[1],crop[0],crop[1],crop[2],crop[3]);
  const s=Math.max(1,Math.floor(Math.min(96/crop[2],80/crop[3])));const ws=crop[2]*s+'px',hs=crop[3]*s+'px';if(cv.dataset.ws!==ws){cv.dataset.ws=ws;cv.style.setProperty('width',ws,'important');cv.style.setProperty('height',hs,'important');}cv.dataset.ok=wduSig();return true;}
function wduLoadLayer(src){if(WDU.atl[src])return;WDU.atl[src]=1;loadImages([src]).then(()=>wduThumbsAll());}
// they're drawn a few at a time, the ones on screen first, so the screen never stalls (a phone slowed 4x included)
function wduThumbsAll(){const P=$('wdPanel');if(!P||!WDU.on)return;const sig=wduSig(),r=P.getBoundingClientRect();
  const L=[...P.querySelectorAll('canvas[data-th]')].filter(c=>c.dataset.ok!==sig);L.sort((a,b)=>{const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();const va=ra.bottom>r.top&&ra.top<r.bottom,vb=rb.bottom>r.top&&rb.top<r.bottom;return (vb?1:0)-(va?1:0)||ra.top-rb.top;});
  WDU.q=L;if(!WDU.qt)WDU.qt=requestAnimationFrame(wduThumbTick);}
function wduThumbTick(){WDU.qt=0;const t0=performance.now();while(WDU.q.length&&performance.now()-t0<7){const cv=WDU.q.shift();if(cv.isConnected)try{wduThumb(cv);}catch(e){}}if(WDU.q.length)WDU.qt=requestAnimationFrame(wduThumbTick);}
// ---- the figure: the clip and facing you chose, composed for this look only (one row of frames), walking, idling or working the tool
function wduPreview(now){if(!WDU.on)return;requestAnimationFrame(wduPreview);const [,tool,clip]=WDU_ANIM[WDU.anim];const nm='farmer'+tool,m=SPR[nm];if(!m)return;const d=WDU_DIRS[WDU.dir];
  const cl=m.clips[clip]||m.clips.walk,r=cl[d]||cl.S,row=r[0],nf=r[1];const key=wduSig()+'|'+tool+'|'+row;
  if(WDU.pvKey!==key&&!wdNeed(S.look.w,tool?['',tool]:['']).length){const W=432,c=WDU.pvc||(WDU.pvc=wdCanvas(W,WD_FH)),f=WDU.pvf||(WDU.pvf=wdCanvas(W,WD_FH));
    const sd=new ImageData(W,WD_FH),fd=new ImageData(W,WD_FH);wdComposeRows(S.look.w,tool,row,row+1,sd.data,fd.data);c.getContext('2d').putImageData(sd,0,0);f.getContext('2d').putImageData(fd,0,0);WDU.pvKey=key;WDU.pvRow=row;}
  if(!WDU.pvc||WDU.pvRow!==row)return;const fps=clip==='idle'?3:clip==='run'?14:clip==='thrust'?10:9;let fr=Math.floor(now/1000*fps)%nf;if(clip==='walk'||clip==='run')fr=1+fr%(nf-1);
  // drawn only when the frame shown changes
  const dk=WDU.pvKey+'|'+d+'|'+fr;if(WDU.pvLast===dk)return;WDU.pvLast=dk;
  const g=$('cPrev').getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,48,64);g.fillStyle='rgba(10,14,8,.35)';g.beginPath();g.ellipse(24,60,8,2.2,0,0,Math.PI*2);g.fill();
  if(clip==='thrust')toolOverlay(g,nm,d,fr,0,0,'back');g.drawImage(WDU.pvc,fr*48,0,48,64,0,0,48,64);
  if(clip==='thrust'){toolOverlay(g,nm,d,fr,0,0,'front');const T=m.tool&&m.tool[d]&&m.tool[d][fr];if(T&&!T[4])g.drawImage(WDU.pvf,fr*48,0,48,64,0,0,48,64);}}
// ---- the colour picker: the slot's curated palette, your recent colours, and hue, saturation and brightness sliders (drag them, or step with - and +)
function wduPickOpen(k,keep){const P=$('wdPanel');const old=P.querySelector('.wdp');if(old)old.remove();for(const b of P.querySelectorAll('.wdce'))b.textContent=b.dataset.pk===k&&!(!keep&&WDU.pick===k)?'Close':'More';
  if(!keep&&WDU.pick===k){WDU.pick=null;for(const b of P.querySelectorAll('.wdce'))b.textContent='More';return;}const row=P.querySelector(`.wdc[data-k="${k}"]`);if(!row){WDU.pick=null;return;}WDU.pick=k;
  const K=WD_K[k],w=S.look.w,v=(wdCol(w,k)||'').toLowerCase(),base=wdColD(w,k);if(!keep){const h=rgb2hsv(hexRGB(base));WDU.hsv=[Math.round(h[0]),Math.round(h[1]*100),Math.round(h[2]*100)];}
  const rec=(Array.isArray(S.look.wrec)?S.look.wrec:[]).slice(0,14),sw=c=>`<button class="sw${c===v?' on':''}" data-k="${k}" data-c="${c}" style="background:${c}" aria-label="${c}"></button>`;
  const fol=WDU_FOL[k]||(WDU_ORIG[k]?'As drawn':'');
  const sl=(ch,lab)=>`<div class="wdpS" data-ch="${ch}"><span>${lab}</span><button data-st="${ch}" data-d="-1" aria-label="Less ${lab}">-</button><canvas data-tr="${ch}" width="96" height="8" role="slider" aria-label="${lab}"></canvas><button data-st="${ch}" data-d="1" aria-label="More ${lab}">+</button><span class="wdpVal"></span></div>`;
  const el=document.createElement('div');el.className='wdp';el.dataset.k=k;
  el.innerHTML=`<div class="wdpPal">${wduPal(K.pal).map(sw).join('')}</div><div class="wdpRec"><span>Recent</span>${rec.length?rec.map(sw).join(''):'<span>colours you use show here</span>'}</div>
    ${sl(0,'Hue')}${sl(1,'Saturation')}${sl(2,'Brightness')}<div class="wdpF"><span class="wdpHex"></span>${fol?`<button data-fol="${k}">${fol}</button>`:''}<button id="wdPickClose" data-pk="${k}">Close</button></div>`;
  row.after(el);wduPickDraw();if(!keep){const P=$('wdPanel'),pr=P.getBoundingClientRect(),er=el.getBoundingClientRect(),rr=row.getBoundingClientRect();if(er.bottom>pr.bottom-4)P.scrollTop+=Math.min(er.bottom-pr.bottom+8,rr.top-pr.top-4);}wduCues();}
function wduPickDraw(){const el=$('wdPanel')&&$('wdPanel').querySelector('.wdp');if(!el)return;const [h,s,v]=WDU.hsv;const N=24;
  for(const cv of el.querySelectorAll('canvas[data-tr]')){const ch=+cv.dataset.tr,g=cv.getContext('2d');for(let i=0;i<N;i++){const t=(i+.5)/N;const c=ch===0?hsv2rgb(t*359.9,Math.max(.35,s/100),Math.max(.45,v/100)):ch===1?hsv2rgb(h,t,v/100):hsv2rgb(h,s/100,t);
      g.fillStyle=`rgb(${c[0]},${c[1]},${c[2]})`;g.fillRect(Math.floor(i*96/N),0,Math.ceil(96/N)+1,8);}
    const val=[h/360,s/100,v/100][ch],x=Math.round(val*93);g.fillStyle='#140a04';g.fillRect(x,0,3,8);g.fillStyle='#f4e6c8';g.fillRect(x+1,1,1,6);}
  const vs=el.querySelectorAll('.wdpVal');vs[0].textContent=h+'°';vs[1].textContent=s+'%';vs[2].textContent=v+'%';const hx=wduHsvHex();el.querySelector('.wdpHex').textContent=hx.toUpperCase();}
const wduHsvHex=()=>{const c=hsv2rgb(Math.min(359.9,WDU.hsv[0]),WDU.hsv[1]/100,WDU.hsv[2]/100);return '#'+c.map(x=>x.toString(16).padStart(2,'0')).join('');};
function wduHsvSet(ch,val,commit){const lim=[359,100,100];WDU.hsv[ch]=Math.max(0,Math.min(lim[ch],Math.round(val)));wduPickDraw();if(WDU.pick)wduSetCol(WDU.pick,wduHsvHex(),commit);}
// ---- saved outfits: eight slots, each a whole look to put on again
function wduOutfits(){const R=$('wdRoot');let sh=R.querySelector('.wdSheet');if(sh){sh.remove();return;}const pre=Array.isArray(S.look.wpre)?S.look.wpre:(S.look.wpre=[]);
  sh=document.createElement('div');sh.className='wdSheet';sh.setAttribute('role','dialog');
  const slot=i=>{const p=pre[i];return `<div class="wdSlot"><canvas data-ps="${i}" width="48" height="64"></canvas><span class="wdSN">${p?wduEsc(p.n||'Outfit '+(i+1)):'Empty'}</span><span class="wdSB">${p?`<button data-wear="${i}">Wear</button>`:''}<button data-save="${i}">${p?'Replace':'Save here'}</button></span></div>`;};
  sh.innerHTML=`<h3>Saved outfits</h3><p>Save the look you have on into a slot, then put it back on any time.</p><div class="wdSL">${[0,1,2,3,4,5,6,7].map(slot).join('')}</div><div class="wdSF"><button id="wdOutClose">Close</button></div>`;R.appendChild(sh);
  for(const cv of sh.querySelectorAll('canvas[data-ps]')){const p=pre[+cv.dataset.ps];if(!p)continue;const w=wdDec(p.w);if(!w)continue;if(wdNeed(w,['']).length){loadImages(wdNeed(w,[''])).then(()=>{if(cv.isConnected)cv.getContext('2d').putImageData(wdFrame(w,'',10,0),0,0);});continue;}cv.getContext('2d').putImageData(wdFrame(w,'',10,0),0,0);}}
// ---- randomise: a believable look (natural colours mostly, clothes that go together), for everything or one tab
function wduRandom(scope){const w=S.look.w,R=Math.random,pick=a=>a[(R()*a.length)|0],tab=scope&&WDU_TABS.find(t=>t[0]===scope);
  const inS=p=>!scope||(tab?tab[2].some(s=>s.pos===p||s.pat===p):scope===p);const cols=k=>!scope||(tab?tab[2].some(s=>(s.cols||[]).includes(k)):false);
  const one=(p,prob)=>{if(!inS(p))return;const L=(WD.cats[p]||[]).filter(e=>!e.flags.includes('legacyBody')||p==='top');if(L.length&&R()<prob){const e=pick(L);w.it[p]=e.id;if(e.def)for(const k in e.def)w.c[k]=e.def[k];}else if(!WD_REQ[p]&&p!=='hair')delete w.it[p];};
  const c=(k,arr)=>{if(cols(k)&&arr.length)w.c[k]=pick(arr);};
  const hair=wduPal('hair'),cloth=wduPal('cloth'),leather=wduPal('leather');
  one('hair',1);one('dye',.15);one('beard',.25);
  if(inS('top')){const L=(WD.cats.top||[]);const e=pick(L);if(e)w.it.top=e.id;}one('bottom',1);one('outer',.35);one('shoes',1);one('socks',.25);
  one('hat',.3);one('headacc',.12);one('glasses',.22);one('neck',.25);one('ear',.18);one('waist',.15);one('back',.12);one('wrist',.1);one('hand',.06);
  one('brows',.5);one('eyes',.35);one('lips',.22);one('liner',.18);one('shadow',.14);one('blush',.2);one('freckles',.15);one('mole',.1);one('scar',.07);one('paint',.04);one('tattoo',.07);
  one('pnose',.06);one('pbrow',.04);one('plip',.04);
  if(inS('top')||!scope){w.pat.top=R()<.4?pick(Object.keys(WD_PAT).filter(Boolean)):'';if(!w.pat.top)delete w.pat.top;}
  c('skin',R()<.93?wduPal('skin').slice(0,37):wduPal('skin').slice(37));c('hair',R()<.82?hair.slice(0,32):hair.slice(32));c('hair2',hair);c('eye',R()<.9?wduPal('eye').slice(0,30):wduPal('eye'));
  if(cols('eye2'))delete w.c.eye2;if(cols('brow'))delete w.c.brow;if(cols('beard'))delete w.c.beard;
  c('top',cloth);c('top2',cloth.slice(40,56));c('bottom',cloth.slice(24,56));c('bottom2',leather);c('outer',cloth);c('outer2',cloth);c('shoes',leather);c('shoes2',cloth.slice(40,56));c('socks',cloth);
  if(cols('toppat'))R()<.5?delete w.c.toppat:c('toppat',cloth);c('hat',cloth.concat(leather));c('hat2',cloth);c('frame',wduPal('metal'));if(cols('lens'))R()<.7?delete w.c.lens:c('lens',wduPal('lens'));
  for(const k of ['neck','neck2','headacc','headacc2','waist','waist2','back','back2','wrist','hand'])c(k,k.startsWith('waist')||k.startsWith('back')||k==='wrist'||k==='hand'?leather:cloth);
  c('metal',wduPal('metal'));c('gem',wduPal('gem'));c('ear',wduPal('metal'));c('lip',wduPal('lip'));c('liner',wduPal('liner'));c('shadow',wduPal('shadow'));c('blush',wduPal('blush'));
  c('paint',wduPal('paint'));c('paint2',wduPal('paint'));c('tattoo',wduPal('tattoo'));
  wdSync();wduPush();wduChanged(true);SFX.page&&SFX.page();}
// ---- building the screen inside the old creator (its ids live on: other code finds the kicker, the name box and Drive by them)
function wduBuild(){if(WDU.built)return;const cr=$('creator');if(!cr)return;WDU.built=true;
  for(const id of ['cKick','cPrev','cL','cR','cAnim','cTabs','cPanel','cName','cRand','cGo']){const e=$(id);if(e&&cr.contains(e))e.removeAttribute('id');}
  const r=document.createElement('div');r.className='wdr';r.id='wdRoot';
  r.innerHTML=`<div class="wdLf"><div class="kicker" id="cKick">Who is driving</div><div class="wdTop"><div class="wdPv"><canvas id="cPrev" width="48" height="64" aria-label="You, turn with the arrows"></canvas></div>
    <div class="wdSide"><div class="wdTurn"><button id="cL" aria-label="Turn left">◀</button><button id="cAnim" aria-label="Change what you're doing">Walk</button><button id="cR" aria-label="Turn right">▶</button></div>
    <div class="wdActs"><button id="wdUndo">Undo</button><button id="wdRedo">Redo</button><button id="cRand"><span class="wdLg">Surprise me</span><span class="wdS">Random</span></button><button id="wdOut">Outfits</button></div></div></div>
    <input id="cName" maxlength="14" placeholder="Your name" autocomplete="off" aria-label="Your name"></div>
    <div class="wdRt"><div class="wdTW"><div class="tabs" id="cTabs" role="tablist"></div></div><div class="wdPW"><div class="wdPanel" id="wdPanel"></div></div></div>
    <div class="wdFoot"><button id="wdCancel">Cancel</button><button class="begin" id="cGo">Drive</button></div>`;
  cr.appendChild(r);
  for(const t of ['keydown','keyup','keypress'])$('cName').addEventListener(t,e=>e.stopPropagation());
  $('cL').addEventListener('click',()=>{WDU.dir=(WDU.dir+3)%4;});$('cR').addEventListener('click',()=>{WDU.dir=(WDU.dir+1)%4;});
  $('cAnim').addEventListener('click',()=>{WDU.anim=(WDU.anim+1)%WDU_ANIM.length;$('cAnim').textContent=WDU_ANIM[WDU.anim][0];wduEnsure();});
  $('wdUndo').addEventListener('click',wduUndo);$('wdRedo').addEventListener('click',wduRedo);$('cRand').addEventListener('click',()=>wduRandom());$('wdOut').addEventListener('click',wduOutfits);
  $('wdCancel').addEventListener('click',wduCancel);$('cGo').addEventListener('click',wduDone);
  // drag the figure sideways to turn it
  {let x0=null;const pv=$('cPrev');pv.addEventListener('pointerdown',e=>{x0=e.clientX;});addEventListener('pointerup',()=>{x0=null;});
    pv.addEventListener('pointermove',e=>{if(x0==null)return;const dx=e.clientX-x0;if(Math.abs(dx)>28){WDU.dir=(WDU.dir+(dx>0?1:3))%4;x0=e.clientX;}});}
  $('cTabs').addEventListener('click',e=>{const b=e.target.closest('button[data-tab]');if(!b||b.dataset.tab===WDU.tab)return;WDU.tab=b.dataset.tab;wduRender();SFX.page&&SFX.page();});
  const P=$('wdPanel');
  P.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
    if(d.pos!==undefined&&b.classList.contains('wdi')){wduSet(d.pos,d.id);SFX.click&&SFX.click();return;}
    if(d.pat!==undefined){wduSetPat(d.pat,d.id);SFX.click&&SFX.click();return;}
    if(d.c&&d.k){wduSetCol(d.k,d.c,true);if(WDU.pick===d.k){const h=rgb2hsv(hexRGB(d.c));WDU.hsv=[Math.round(h[0]),Math.round(h[1]*100),Math.round(h[2]*100)];wduPickDraw();}SFX.click&&SFX.click();return;}
    if(d.pk){wduPickOpen(d.pk);return;}
    if(d.st!==undefined){const ch=+d.st,step=[5,4,4][ch];wduHsvSet(ch,WDU.hsv[ch]+step*(+d.d),true);return;}
    if(d.fol){wduSetCol(d.fol,null,true);const h=rgb2hsv(hexRGB(wdColD(S.look.w,d.fol)));WDU.hsv=[Math.round(h[0]),Math.round(h[1]*100),Math.round(h[2]*100)];wduPickDraw();return;}
    if(d.fav!==undefined){if(!d.fav)return;const F=wduFav(),i=F.indexOf(d.fav);if(i>=0)F.splice(i,1);else F.push(d.fav);wduRender(true);return;}
    if(d.rnd){wduRandom(d.rnd);return;}});
  // dragging a slider
  {let drag=null;const val=(cv,e)=>{const r=cv.getBoundingClientRect();return Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));};
    P.addEventListener('pointerdown',e=>{const cv=e.target.closest('canvas[data-tr]');if(!cv)return;drag=cv;try{cv.setPointerCapture(e.pointerId);}catch(x){}const ch=+cv.dataset.tr;wduHsvSet(ch,val(cv,e)*[359,100,100][ch],false);e.preventDefault();});
    P.addEventListener('pointermove',e=>{if(!drag)return;const ch=+drag.dataset.tr;wduHsvSet(ch,val(drag,e)*[359,100,100][ch],false);});
    const up=()=>{if(!drag)return;drag=null;if(WDU.pick){wduPush();wduRecent(wduHsvHex());wduBtns();}};P.addEventListener('pointerup',up);P.addEventListener('pointercancel',up);}
  P.addEventListener('scroll',()=>{if(WDU.q.length)wduThumbsAll();wduCues();},{passive:true});$('cTabs').addEventListener('scroll',wduCues,{passive:true});addEventListener('resize',()=>{if(WDU.on)wduCues();});
  r.addEventListener('click',e=>{const b=e.target.closest('.wdSheet button');if(!b)return;const pre=S.look.wpre||(S.look.wpre=[]);
    if(b.id==='wdOutClose'){b.closest('.wdSheet').remove();return;}
    if(b.dataset.save!==undefined){const i=+b.dataset.save;pre[i]={n:'Outfit '+(i+1),w:wduSig()};try{localStorage.setItem('hollowLook'+ACCT_SUFFIX,JSON.stringify(S.look));}catch(x){}b.closest('.wdSheet').remove();wduOutfits();SFX.page&&SFX.page();return;}
    if(b.dataset.wear!==undefined){const p=pre[+b.dataset.wear];if(p&&wdDec(p.w)){S.look.w=wdDec(p.w);wdSync();wduPush();wduChanged(true);b.closest('.wdSheet').remove();SFX.page&&SFX.page();}}});
  addEventListener('keydown',e=>{if(!WDU.on||$('creator').hidden)return;const t=e.target;if(t&&/^(INPUT|TEXTAREA)$/.test(t.tagName))return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?wduRedo():wduUndo();}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();wduRedo();}
    else if(e.key==='Escape'){const sh=$('wdRoot').querySelector('.wdSheet');if(sh){sh.remove();e.stopPropagation();}else if(WDU.pick){wduPickOpen(WDU.pick);e.stopPropagation();}}},true);}
// ---- opening and closing
function wduOpen(edit){wduBuild();const cr=$('creator');if(!cr||!WDU.built)return;wdArt();WDU.edit=!!edit;WDU.on=true;cr.classList.add('wd8');
  $('cKick').textContent=edit?'The wardrobe':'Who is driving';$('cGo').textContent=edit?'Done':'Drive';$('wdCancel').hidden=!edit;
  $('title').hidden=true;cr.hidden=false;$('cName').value=S.look.name||'';if(!S.look.w)S.look.w=wdMigrate(S.look);
  WDU.frz=0;WDU.pvLast='';WDU.start=wduSig();WDU.hist=[WDU.start];WDU.fut=[];WDU.pick=null;WDU.pvKey='';const sh=$('wdRoot').querySelector('.wdSheet');if(sh)sh.remove();
  wduRender();wduEnsure();requestAnimationFrame(wduPreview);setTimeout(wduCues,60);}
function wduClose(){WDU.on=false;WDU.q=[];const cr=$('creator');cr.hidden=true;cr.classList.remove('wd8');}
function wduDone(){S.look.name=$('cName').value.trim().slice(0,14);wdSave();wduClose();applyLook();
  if(WDU.edit){S.paused=false;toast('You change in the cabin. The mirror takes a moment to catch up.',2.4);return;}A.init&&A.init();startCine('intro');}
function wduCancel(){const w=wdDec(WDU.start);if(w){S.look.w=w;wdSync();}wduClose();if(WDU.edit)S.paused=false;}
// while the wardrobe covers the screen the valley behind it is left as it was drawn last (a phone spends its time on the wardrobe)
if(typeof render==='function'){const _rd=render;render=function(){if(WDU.on&&!$("creator").hidden&&(WDU.frz>3||S.mode==="title"))return;if(WDU.on)WDU.frz=(WDU.frz||0)+1;return _rd.apply(this,arguments);};}
window.openWardrobe=()=>{S.paused=true;$('bag')&&($('bag').hidden=true);wduOpen(true);};
// a new game starts in the wardrobe (this runs before the old creator's own handler and stands in for it)
addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#begin');if(!b)return;e.stopImmediatePropagation();e.preventDefault();A.init&&A.init();wduOpen(false);},true);
window.WDU=WDU;
