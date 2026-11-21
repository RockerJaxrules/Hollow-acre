/* ================= t366 the menu, the way each hand reaches it (owner: "I think the menu map and how you access all of it should
   be reworked to be more convenient and different depending if your using mobile controls mouse and keyboard or controller").
   - The game follows what you last touched (the pad, the keys and mouse, or a finger) and changes its hints and the menu's
     layout to match, the moment you switch; nothing on the page is written unless something changed.
   - Phone: a Menu button and a Map button, one over the other at the left thumb; the panel has a big X to close, its tabs are
     44 px tall and change with a swipe across the panel; a swipe down on its title closes it.
   - Keyboard and mouse: E or I items, M map, J journal, Esc opens and closes the menu, Tab and Shift+Tab turn the tabs (each
     tab shows its key), the number keys still pick from the toolbar; every tab and HUD button says what it does on hover.
   - Controller: Menu (Options) opens the menu, View (Create) the map, LT the journal; LB and RB turn the tabs, the Journal
     included, and come back; the d-pad walks the gold frame, A chooses, B goes back. The family's own glyphs throughout.
   - Settings is a tab: Sound, Display, Controls, Codes. A later release builds the full settings; this is the shell
     (menuSetting() adds a row).
   ================= */
const M66={jr:false,jrOpening:0,tabsOrder:['items','social','skills','map','calendar','journal','coop','settings']};
const m66Mode=()=>typeof GP!=='undefined'?GP.mode:'kb';
const m66Touch=()=>m66Mode()==='touch';
// ---- which hand: a phone starts in touch, and the body says which, for the CSS
{const coarse=matchMedia('(pointer:coarse)').matches&&!matchMedia('(any-pointer:fine)').matches;if(coarse&&typeof GP!=='undefined'&&GP.mode==='kb')gpSetMode('touch');}
document.body.classList.add('m66');   /* (the menu has its own X now: the map page can drop the bottom row) */
function m66Body(){const m=m66Mode();for(const k of ['kb','touch','pad']){const on=m===k;if(document.body.classList.contains('in-'+k)!==on)document.body.classList.toggle('in-'+k,on);}}
m66Body();
if(typeof gpSetMode==='function'){const _sm=gpSetMode;gpSetMode=function(m){const was=GP.mode;const r=_sm.apply(this,arguments);if(GP.mode!==was){m66Body();try{m66ModeChanged();}catch(e){console.warn(e);}}return r;};}
// the words "click" and "tap" follow the hand too (they used to say "tap" everywhere)
if(typeof U37_WORDS!=='undefined')for(const w of U37_WORDS){if(w[1]==='Tap'||w[1]==='tap'||w[1]==='Shift-tap'){const to=w[1];w[1]=m=>m66Touch()?to:m;}}
// ---- what to press, in the words or the pictures of the hand you're using
function m66Key(k){return `<span class="m66key">${k}</span>`;}
function m66How(what){const m=m66Mode();
  if(m==='pad')return gpFmt({menu:'press {START}',map:'press {BACK}',journal:'press {LT}',tabs:'{LB} {RB} change tab'}[what]||'');
  if(m==='touch')return {menu:'tap <b>Menu</b>',map:'tap <b>Map</b>',journal:'open the menu and tap <b>Journal</b>',tabs:'swipe across it to change tab'}[what]||'';
  return {menu:`press ${m66Key('E')} or ${m66Key('Esc')}`,map:`press ${m66Key('M')}`,journal:`press ${m66Key('J')}`,tabs:`${m66Key('Tab')} changes tab`}[what]||'';}

// ================================================================ the look
{const css=document.createElement('style');css.textContent=`
body.in-touch #bag,body.in-touch #bagBody,body.in-touch #note.m66j,body.in-touch #note.m66j #noteText{touch-action:pan-y}   /* a sideways swipe is ours (tabs), up and down still scroll */
.m66key{display:inline-block;min-width:1.1em;padding:0 .3em;margin:0 .1em;line-height:1.25;color:#2a1608;background:#ecdcb2;box-shadow:0 0 0 1px #1a0e06,0 2px 0 #1a0e06;text-align:center;font-weight:normal}
#m66X,#m66XJ{position:absolute;right:12px;top:10px;z-index:5;width:34px;height:34px;padding:0;font:18px/1 'Hollow Pixel',ui-monospace,monospace;color:#f4e6c8;background:#5a3418;border:0;cursor:pointer;
  box-shadow:inset 0 0 0 2px #1a0e06,inset 0 3px 0 #8a5a30,inset 0 -3px 0 #3a200e}
#m66X:hover,#m66XJ:hover{background:#7a4a22}body.in-touch #m66X,body.in-touch #m66XJ{width:46px;height:46px;right:10px;top:8px;font-size:22px}
#m66XJ[hidden],#m66JT[hidden]{display:none!important}
#bag>h2{padding-right:52px}body.in-touch #bag>h2{padding-right:60px}
#bag .tabs button[data-key]::after,#m66JT button[data-key]::after{content:attr(data-key);display:none;margin-left:6px;padding:0 3px;font-size:11px;line-height:13px;color:#2a1608;background:#ecdcb2;box-shadow:0 0 0 1px #1a0e06;vertical-align:1px}
body.in-kb #bag .tabs button[data-key]::after,body.in-kb #m66JT button[data-key]::after{display:inline-block}
body.in-touch #bag .tabs button,body.in-touch #m66JT button{min-height:44px!important;padding:6px 12px!important;font-size:14px!important}
.tabs .m66pb{display:none;align-items:center;padding:0 2px;line-height:0}.tabs .m66pb .gpg{height:22px}
body.in-pad .tabs .m66pb{display:inline-flex}
#m66JT{display:flex;flex-wrap:wrap;gap:4px;margin:0 52px 8px 0}body.in-touch #m66JT{margin-right:62px}
#note.m66j>.acts{display:none!important}
#bag.m66set #bagBody .m66rows{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}
.m66row{display:flex;align-items:center;gap:10px;width:100%;min-height:56px;padding:8px 12px;text-align:left;font:14px/1.3 'Hollow Pixel',ui-monospace,monospace;color:#f4e6c8;background:#3a2414;border:0;cursor:pointer;
  box-shadow:inset 0 0 0 2px #1a0e06,inset 0 2px 0 #5a3a1e}
.m66row:hover,.m66row:focus-visible{background:#5a3418;outline:none}.m66row b{display:block;color:#ffd27a;font-weight:normal;font-size:15px}.m66row small{display:block;color:#c8b898;font-size:12px}
.m66row svg{width:28px;height:28px;flex:none}
.m66ctl{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:4px 16px;margin:6px 0}.m66ctl div{display:flex;gap:10px;align-items:center;min-height:26px;font-size:13px}
.m66ctl .k{min-width:110px;display:inline-flex;gap:3px;justify-content:flex-end;flex-wrap:wrap;color:#ffd27a}
.m66sec{margin:12px 0 4px;color:#e0b070;font-size:13px;letter-spacing:.06em;text-transform:uppercase}.m66sec.on::after{content:' · what you’re using';color:#9fc07a;text-transform:none;letter-spacing:0}
#btnMap{position:fixed!important;left:var(--gl)!important;right:auto!important;top:auto!important;bottom:calc(var(--gb) + var(--btn) + 8px)!important;width:var(--btn)!important;height:var(--btn)!important;padding:0!important;zoom:var(--u)!important;
  display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:12px!important;z-index:7}
#btnMap[hidden]{display:none!important}#btnMap .ico{width:22px;height:11px;image-rendering:pixelated}
@media (orientation:portrait) and (max-width:699px){#btnMap{bottom:calc(var(--gb) + var(--slot) + 12px + var(--btn) + 8px)!important}}
body:has(#bag:not([hidden])) #btnMap,body:has(#shop:not([hidden])) #btnMap,body:has(#note:not([hidden])) #btnMap,body:has(#craft:not([hidden])) #btnMap{visibility:hidden!important}
.m66kb{display:none;position:absolute;right:3px;top:3px;min-width:12px;padding:0 2px;font-size:10px;line-height:12px;color:#2a1608;background:#ecdcb2;box-shadow:0 0 0 1px #1a0e06;pointer-events:none}
body.in-kb .m66kb{display:block}
`;document.head.appendChild(css);}

// ================================================================ the HUD: Menu, and a Map button over it
{const bb=$('btnBag');if(bb){const m=document.createElement('button');m.className='btn';m.id='btnMap';m.setAttribute('aria-label','Map');
  // a folded paper map, three panels, a road and a red mark: drawn here pixel by pixel
  const G=['.kkkkkkkkkkkkkkkkkkkk.','kppPPpkkppppykkPPpppk.','kpPPPpkkpppyykkPPPpPk.','kpyyPPkkpyyyykkyyyPPk.','kPPyyykkyyppkkkPPyyPk.','kPPPyykkyppPPkkPPPyyk.','kppPPpkkpprrPkkPPPPpk.',
    'kpppPpkkprrrPkkpPPPPk.','kPPpppkkpprkPkkppPPpk.','kPPPppkkppppPkkpppPPk.','.kkkkkkkkkkkkkkkkkkkk.'];
  const pal={k:'#24140a',p:'#e8d4a4',P:'#c8a868',y:'#a87838',r:'#d8382a'};let svg='';G.forEach((row,y)=>{for(let x=0;x<row.length;x++){const c=pal[row[x]];if(c)svg+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`;}});
  m.innerHTML=`<svg class="ico" viewBox="0 0 22 11" shape-rendering="crispEdges" aria-hidden="true">${svg}</svg><span>Map</span><span class="m66kb">M</span>`;
  m.title='Map (M)';m.addEventListener('click',e=>{e.stopPropagation();if(S.mode==='play'&&!S.paused)openBag('map');});bb.after(m);
  bb.title='Menu (E or Esc)';if(!bb.querySelector('.m66kb'))bb.insertAdjacentHTML('beforeend','<span class="m66kb">E</span>');}}
// the Map button stands and hides with the Menu button
setInterval(()=>{const bb=$('btnBag'),m=$('btnMap');if(!bb||!m)return;const want=bb.hidden||getComputedStyle(bb).display==='none';if(m.hidden!==want)m.hidden=want;
  const iv=bb.style.visibility||'';if(m.style.visibility!==iv)m.style.visibility=iv;},300);
if(typeof bmHud==='function'){const _bh=bmHud;bmHud=function(hide){const r=_bh.apply(this,arguments);const m=$('btnMap');if(m)m.style.visibility=hide?'hidden':'';return r;};}
// the pad's picture on each: Menu or Options on the menu, View or Create on the map
{const _b=gpBadges;gpBadges=function(){_b.apply(this,arguments);for(const [id,k] of [['btnBag','start'],['btnMap','back']]){const b=$(id);if(!b)continue;let g=b.querySelector('.gpbadge');const want=gpGlyph(k);
    if(!g){g=document.createElement('span');g.className='gpbadge';g.setAttribute('aria-hidden','true');b.appendChild(g);}if(g._k!==want){g._k=want;g.innerHTML=want;}}};}
try{gpBadges();}catch(e){}

// ================================================================ the menu panel: a close X, tabs that show their keys, Settings
const M66_KEYS={items:'E',map:'M',journal:'J'};
const M66_TITLE={items:'Items (E or I)',social:'The people you know',skills:'Your skills',map:'The map (M)',calendar:'The calendar',journal:'Journal (J)',coop:'Playing together',settings:'Settings: sound, display, controls'};
function m66DressTabs(row){if(!row)return;for(const b of row.querySelectorAll('button[data-t]')){const t=b.dataset.t;const k=M66_KEYS[t]||'';if(k&&b.dataset.key!==k)b.dataset.key=k;const ti=M66_TITLE[t]||'';if(ti&&b.title!==ti)b.title=ti;}
  // the bumpers' pictures at the two ends, while you're on a pad
  if(!row.querySelector('.m66pb')){const a=document.createElement('span');a.className='m66pb m66lb';const z=document.createElement('span');z.className='m66pb m66rb';row.prepend(a);row.appendChild(z);}
  for(const [sel,k] of [['.m66lb','lb'],['.m66rb','rb']]){const e=row.querySelector(sel);if(!e)continue;const g=gpGlyph(k);if(e._g!==g){e._g=g;e.innerHTML=g;}if(k==='lb'?row.firstChild!==e:row.lastChild!==e){if(k==='lb')row.prepend(e);else row.appendChild(e);}}}
function m66EnsureTabs(){const bag=$('bag');if(!bag)return;const row=bag.querySelector('.tabs');if(!row)return;
  if(!row.querySelector('[data-t="settings"]')){const s=document.createElement('button');s.dataset.t='settings';s.textContent='Settings';s.addEventListener('click',()=>{try{openBag('settings');}catch(e){}});row.appendChild(s);}
  m66DressTabs(row);
  if(!$('m66X')){const x=document.createElement('button');x.id='m66X';x.setAttribute('aria-label','Close the menu');x.title='Close (Esc)';x.textContent='✕';x.addEventListener('click',e=>{e.stopPropagation();m66Close();});bag.appendChild(x);}}
function m66Close(){const note=$('note');if(M66.jr&&note&&!note.hidden){$('noteClose').click();return;}const bc=$('bagClose');if(bc)bc.click();else{$('bag').hidden=true;S.paused=false;}}
// the tabs you can go to, in the order they stand
function m66Tabs(){const row=$('bag')&&$('bag').querySelector('.tabs');const L=row?[...row.querySelectorAll('button[data-t]')].map(b=>b.dataset.t):M66.tabsOrder.slice();return L.filter((t,i)=>L.indexOf(t)===i);}
function m66Cur(){if(M66.jr&&$('note')&&!$('note').hidden)return 'journal';const bag=$('bag');return bag&&!bag.hidden?GM_TAB:null;}
function m66Go(t){if(t==='journal'){const bag=$('bag');if(bag&&!bag.hidden){bag.hidden=true;S.paused=false;}if(!(M66.jr&&!$('note').hidden))openJournal();return;}
  if(M66.jr&&$('note')&&!$('note').hidden)$('noteClose').click();
  openBag(t);}
function m66Step(d){const L=m66Tabs(),cur=m66Cur();const i=L.indexOf(cur);const nx=L[((i<0?0:i)+d+L.length)%L.length];SFX.page&&SFX.page();m66Go(nx);}
// ---- Settings: a page of rows; each opens what's already there
const MENU_SETTINGS=[];
function menuSetting(o){MENU_SETTINGS.push(o);}
const M66_IC={sound:'<path d="M4 11h4l6-5v16l-6-5H4z" fill="#e8d4a4" stroke="#24140a"/><path d="M18 10q3 4 0 8M21 7q5 7 0 14" stroke="#e8d4a4" stroke-width="2" fill="none"/>',
  display:'<rect x="3" y="5" width="22" height="14" fill="#3a6a9a" stroke="#24140a" stroke-width="2"/><rect x="11" y="20" width="6" height="2" fill="#e8d4a4"/><rect x="8" y="22" width="12" height="2" fill="#e8d4a4"/>',
  controls:'<rect x="3" y="9" width="22" height="11" rx="5" fill="#5a4636" stroke="#24140a" stroke-width="2"/><rect x="7" y="13" width="6" height="2" fill="#e8d4a4"/><rect x="9" y="11" width="2" height="6" fill="#e8d4a4"/><rect x="18" y="12" width="3" height="3" fill="#5ec23c"/><rect x="21" y="15" width="2" height="2" fill="#e5483a"/>',
  code:'<rect x="4" y="7" width="20" height="14" fill="#e8d4a4" stroke="#24140a" stroke-width="2"/><rect x="7" y="11" width="3" height="2" fill="#24140a"/><rect x="12" y="11" width="3" height="2" fill="#24140a"/><rect x="17" y="11" width="3" height="2" fill="#24140a"/><rect x="7" y="15" width="13" height="2" fill="#a8743a"/>'};
menuSetting({id:'sound',name:'Sound',sub:()=>{try{return {on:'Sound on',quiet:'Quiet',off:'No sound'}[sndMode()]||'Sound on';}catch(e){return 'Music and effects';}},icon:'sound',open:()=>sndPick()});
menuSetting({id:'display',name:'Display',sub:()=>'Resolution, full screen, interface size, world zoom',icon:'display',open:()=>dispPick()});
menuSetting({id:'controls',name:'Controls',sub:()=>({pad:'Your controller’s buttons',touch:'What your fingers do',kb:'Keys and the mouse'})[m66Mode()],icon:'controls',open:()=>m66Controls()});
menuSetting({id:'code',name:'Enter a code',sub:()=>'From a friend',icon:'code',open:()=>{m66Close();setTimeout(()=>{try{cheatOpen();}catch(e){}},80);}});
function m66Settings(){const B=$('bagBody');$('bag').classList.add('m66set');$('bagSub').textContent='Sound, the screen and the controls.';
  B.innerHTML=`<div class="m66rows">${MENU_SETTINGS.map(o=>`<button class="m66row" data-set="${o.id}"><svg viewBox="0 0 28 28" aria-hidden="true">${M66_IC[o.icon]||''}</svg><span><b>${o.name}</b><small>${m6Esc(o.sub())}</small></span></button>`).join('')}</div><div id="m66Ctl"></div>`;
  B.querySelectorAll('[data-set]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const o=MENU_SETTINGS.find(q=>q.id===b.dataset.set);if(o)o.open();}));}
// the controls for each hand, the one you're using first
const M66_CTL={kb:[['WASD, the arrows','Walk (Shift runs)'],['Left-click','Use your tool'],['Right-click, X','Talk, open, pick up'],['1-9, 0, -, =','Pick from the toolbar'],['Mouse wheel','Step along the toolbar'],
    ['E or I','Items'],['M','The map'],['J','The journal'],['Esc','Open or close the menu'],['Tab, Shift+Tab','Change tab'],['F','Full screen'],
    ['On the map','Drag or WASD to look, the wheel zooms at the pointer, click a place, right-click to pin']],
  touch:[['Drag anywhere','Walk; drag further to run'],['Tap','Use your tool, talk, open, pick up'],['Use (bottom right)','Use what you hold'],['Menu','The menu'],['Map','The map'],
    ['In the menu','Swipe across to change tab; swipe the title down or tap ✕ to close'],['On the map','Drag to look, pinch to zoom, tap a place, hold to drop a pin']],
  pad:[['{LS} {DP}','Walk'],['{START}','The menu'],['{BACK}','The map'],['{LT}','The journal'],['{LB} {RB}','Pick a tool; in the menu, change tab'],['{A}','Choose'],['{B}','Back'],
    ['On the map','{LS} {RS} move it, {LT} {RT} zoom, {A} opens the place under the cross, {X} drops a pin, {Y} finds you']]};
function m66Controls(){const box=$('m66Ctl');if(!box)return;const cur=m66Mode();const sec=(k,t)=>`<div class="m66sec${k===cur?' on':''}">${t}</div><div class="m66ctl">${M66_CTL[k].map(([a,b])=>`<div><span class="k">${k==='pad'?gpFmt(a):m6Esc(a)}</span><span>${k==='pad'?gpFmt(b):m6Esc(b)}</span></div>`).join('')}</div>`;
  const order=[cur].concat(['kb','touch','pad'].filter(k=>k!==cur));const names={kb:'Keyboard and mouse',touch:'Touch',pad:'Controller'};
  box.innerHTML=order.map(k=>sec(k,names[k])).join('')+`<p><button class="m66row" id="m66Pad" style="min-height:44px"><svg viewBox="0 0 28 28" aria-hidden="true">${M66_IC.controls}</svg><span><b>Controller settings</b><small>The pad drawn, its buttons, rumble</small></span></button></p>`;
  $('m66Pad').addEventListener('click',e=>{e.stopPropagation();gpControls();});SFX.page&&SFX.page();
  if(m66Mode()==='pad')setTimeout(()=>{GP.focus=$('m66Pad');},30);}
{const _ob=openBag;openBag=function(tab){const want=tab||GM_TAB;
  if(want==='settings'){_ob.call(this,'social');GM_TAB='settings';const bag=$('bag');bag.querySelector('h2').textContent='Settings';m66EnsureTabs();bag.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t==='settings'));m66Settings();m66After();return;}
  const r=_ob.apply(this,arguments);try{$('bag').classList.remove('m66set');m66EnsureTabs();m66After();}catch(e){console.warn(e);}return r;};}
function m66After(){const bag=$('bag');if(!bag||bag.hidden)return;const row=bag.querySelector('.tabs');if(row){row.querySelectorAll('button[data-t]').forEach(b=>{const on=b.dataset.t===GM_TAB;if(b.classList.contains('on')!==on)b.classList.toggle('on',on);});m66DressTabs(row);}
  // a new page starts with the frame on its tab, so LB, RB and the d-pad are where you expect
  if(m66Mode()==='pad'&&GM_TAB!=='items'&&GM_TAB!=='map'){setTimeout(()=>{const t=bag.querySelector('.tabs button.on');if(t&&typeof GP!=='undefined'&&(!GP.focus||!GP.focus.isConnected||!bag.contains(GP.focus)))GP.focus=t;},40);}}

// ================================================================ the journal is a tab of the menu: the same strip, the same X
{const _oj=openJournal;openJournal=function(){M66.jrOpening++;let r;try{r=_oj.apply(this,arguments);}finally{M66.jrOpening--;}M66.jr=true;try{m66JStrip();}catch(e){console.warn(e);}return r;};}
{const _on=openNote;openNote=function(){if(!M66.jrOpening){M66.jr=false;m66JStripOff();}return _on.apply(this,arguments);};}
{const nc=$('noteClose');if(nc)nc.addEventListener('click',()=>{if(M66.jr){M66.jr=false;m66JStripOff();}},true);}
function m66JStrip(){const note=$('note');if(!note)return;note.classList.add('m66j');let row=$('m66JT');
  if(!row){row=document.createElement('div');row.id='m66JT';row.className='tabs';note.prepend(row);}
  const tabs=m66Tabs();const names={items:'Items',social:'Social',skills:'Skills',map:'Map',calendar:'Calendar',journal:'Journal',coop:'Together',settings:'Settings'};
  const sig=tabs.join(',');if(row._sig!==sig){row._sig=sig;row.innerHTML=tabs.map(t=>`<button data-t="${t}"${t==='journal'?' class="on"':''}>${names[t]||t}</button>`).join('');
    row.querySelectorAll('button[data-t]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();if(b.dataset.t==='journal')return;SFX.page&&SFX.page();m66Go(b.dataset.t);}));}
  m66DressTabs(row);
  if(!$('m66XJ')){const x=document.createElement('button');x.id='m66XJ';x.setAttribute('aria-label','Close the journal');x.title='Close (Esc or J)';x.textContent='✕';
    x.addEventListener('click',e=>{e.stopPropagation();$('noteClose').click();});note.appendChild(x);}
  if($('m66XJ').hidden)$('m66XJ').hidden=false;if(row.hidden)row.hidden=false;}
function m66JStripOff(){const note=$('note');if(!note)return;if(note.classList.contains('m66j'))note.classList.remove('m66j');const row=$('m66JT');if(row&&!row.hidden)row.hidden=true;const x=$('m66XJ');if(x&&!x.hidden)x.hidden=true;}
// on a pad the triggers turn the journal's own pages (Journal, Heart events, Places), the bumpers the menu's tabs
if(typeof GP_CTX!=='undefined'){const _ui=GP_CTX.ui;GP_CTX.ui=function(p,dt){try{if(M66.jr&&$('note')&&!$('note').hidden){
      for(const [i,d] of [[6,-1],[7,1]])if(gpEdge(i)){const bar=$('noteText')&&$('noteText').querySelector('.jtabs');if(bar){const bs=[...bar.querySelectorAll('button')].filter(gpShown);const k=bs.findIndex(b=>b.classList.contains('on'));
          const nx=bs[((k<0?0:k)+d+bs.length)%bs.length];if(nx){gpClick(nx);GP.focus=null;GP.chk=0;SFX.page&&SFX.page();}}}}}catch(e){}return _ui.apply(this,arguments);};}
// the bumpers, from any page of the menu or the journal, step through every tab and round again
if(typeof gpTabs==='function'){const _gt=gpTabs;gpTabs=function(d){const R=GP.root;if(R&&(R.id==='bag'||(R.id==='note'&&M66.jr))){m66Step(d);GP.focus=null;GP.chk=0;return true;}return _gt.apply(this,arguments);};}

// ================================================================ keys: E or I, M, J, Esc, Tab
function m66Typing(e){const t=e.target;return !!(t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName||'')||t.isContentEditable));}
function m66Busy(){try{if(typeof MG4!=='undefined'&&MG4.on)return true;if(typeof MG!=='undefined'&&MG.on)return true;if(typeof CG!=='undefined'&&CG.on)return true;if($('fGame'))return true;if(typeof PLACE!=='undefined'&&PLACE.on)return true;
  if(typeof STG!=='undefined'&&STG)return true;if(typeof SCENE!=='undefined'&&SCENE)return true;for(const id of ['shop','talk','craft','shipBin','lvlUp','saleSlip'])if($(id)&&!$(id).hidden)return true;
  for(const id of ['dispPick','sndPick','gpCtl'])if($(id)&&getComputedStyle($(id)).display!=='none')return true;if($('cheatBox')&&$('cheatBox').classList.contains('on'))return true;}catch(e){}return false;}
function m66Open(){const bag=$('bag');return !!(bag&&!bag.hidden)||!!(M66.jr&&$('note')&&!$('note').hidden);}
addEventListener('keydown',e=>{if(S.mode!=='play'||e.repeat||m66Typing(e))return;if(e.ctrlKey||e.metaKey||e.altKey)return;const c=e.code;
  if(!/^(KeyE|KeyI|KeyM|KeyJ|Tab|Escape)$/.test(c))return;
  const open=m66Open(),cur=m66Cur(),pad=!e.isTrusted&&m66Mode()==='pad';const note=$('note');const otherNote=note&&!note.hidden&&!M66.jr;
  const stop=()=>{e.preventDefault();e.stopImmediatePropagation();};
  if(m66Busy()||otherNote){if(c==='Tab')e.preventDefault();return;}
  if(c==='Escape'){if(!e.isTrusted)return;if(open){if(typeof M6!=='undefined'&&M6.on&&(M6.pinMode||M6.card||($('mapLegend')&&!$('mapLegend').hidden)))return;stop();m66Close();return;}
    if(!S.paused){stop();openBag(M66.lastTab||'items');}return;}
  if(c==='Tab'){stop();if(open){m66Step(e.shiftKey?-1:1);return;}if(!S.paused)openBag(M66.lastTab||'items');return;}
  const want={KeyE:'items',KeyI:'items',KeyM:'map',KeyJ:'journal'}[c];
  // the same key shuts what it opened; from another page it goes to its own; a pad's Menu always shuts the menu
  if(open){stop();if(cur===want||(pad&&c==='KeyE')){m66Close();return;}m66Go(want);return;}
  if(S.paused)return;stop();m66Go(want);},true);
// the menu remembers its last page for Esc and Tab (never the journal, which has its own key)
setInterval(()=>{const bag=$('bag');if(bag&&!bag.hidden&&GM_TAB&&GM_TAB!=='journal')M66.lastTab=GM_TAB;},300);

// ================================================================ touch: a swipe across turns the tab, a swipe down the title closes
{const sw={on:false};
  const ok=t=>t&&t.closest&&!t.closest('#mapWrap,#m6Foot,.invgrid,input,textarea,select,#gpCtl,#dispPick,#sndPick,.m66ctl');
  const start=e=>{if(e.pointerType!=='touch')return;const host=e.target.closest&&e.target.closest('#bag,#note.m66j');if(!host||!ok(e.target))return;
    sw.on=true;sw.id=e.pointerId;sw.x=e.clientX;sw.y=e.clientY;sw.t=performance.now();sw.head=!!e.target.closest('#bag>h2,#bag>.tabs,#m66JT,#note.m66j #noteText>h3');};
  const end=e=>{if(!sw.on||e.pointerId!==sw.id)return;sw.on=false;const dx=e.clientX-sw.x,dy=e.clientY-sw.y,dt=performance.now()-sw.t;if(dt>1000)return;
    if(Math.abs(dx)>70&&Math.abs(dy)<Math.abs(dx)*.5){m66Step(dx<0?1:-1);return;}
    if(sw.head&&dy>80&&Math.abs(dx)<60)m66Close();};
  addEventListener('pointerdown',start,true);addEventListener('pointerup',end,true);addEventListener('pointercancel',()=>{sw.on=false;},true);}

// ================================================================ when the hand changes: the hints change with it (and only then)
function m66ModeChanged(){try{const bag=$('bag');if(bag&&!bag.hidden){m66DressTabs(bag.querySelector('.tabs'));if(GM_TAB==='settings'&&$('m66Ctl')&&$('m66Ctl').innerHTML)m66Controls();}}catch(e){}
  try{if(M66.jr)m66DressTabs($('m66JT'));}catch(e){}
  try{if(typeof m6SetHint==='function')m6SetHint();if(typeof M6!=='undefined'&&M6.on){M6.lay=null;M6.ver++;m6Kick();}}catch(e){}
  try{if(typeof TUT_CUR!=='undefined'&&TUT_CUR&&$('tut')&&$('tut').style.display==='block')tutShow(TUT_CUR);}catch(e){}}
// ---- the tutorial's lessons about the menu, the map and the journal, in the words of the hand in use
{const T=(id,f)=>{const st=typeof TUT!=='undefined'&&TUT.find(s=>s.id===id);if(st)st.text=f;};
  T('menu',()=>{const m=m66Mode();if(m==='pad')return gpFmt('Open the menu with {START} to see your backpack. {BACK} opens the map, {LT} the journal.');
    if(m==='touch')return 'Tap <b>Menu</b> (bottom left) to see your backpack. The <b>Map</b> button over it opens the map.';
    return `Open the menu to see your backpack: ${m66Key('E')} or ${m66Key('Esc')}. ${m66Key('M')} opens the map, ${m66Key('J')} the journal, ${m66Key('Tab')} changes tab.`;});
  T('drag',()=>{const m=m66Mode();if(m==='pad')return gpFmt('The top row is your toolbar. {A} lifts an item and {A} again sets it down; set it on the bin to throw it away. {LB} {RB} change tab, {B} closes the menu.');
    if(m==='touch')return 'The top row is your toolbar. Drag an item to move it; drop it on the bin to throw it away. Swipe across the menu to change tab; tap ✕ to close it.';
    return `The top row is your toolbar. Drag an item to move it; drop it on the bin to throw it away. ${m66Key('Tab')} changes tab, ${m66Key('Esc')} closes the menu.`;});
  T('map',()=>{const m=m66Mode();if(m==='pad')return gpFmt('The map shows the whole valley and where you are. Press {BACK}. {A} on a place tells you about it.');
    if(m==='touch')return 'The <b>Map</b> button (over Menu) shows the whole valley and where you are. Tap a place to learn about it.';
    return `The map shows the whole valley and where you are. Press ${m66Key('M')}, or click <b>Map</b>. Click a place to learn about it.`;});}
// Caitlyn's lesson about the map and journal says how, for the hand in use
try{if(typeof LESSONS!=='undefined'){const L=LESSONS.find(q=>q.id==='map');if(L)Object.defineProperty(L,'say',{configurable:true,get:()=>{const m=m66Mode();
  const how=m==='pad'?'Press View for the map and LT for the journal':m==='touch'?'Tap Map for the map; the Journal is a tab in the menu':'Press M for the map and J for the journal';
  return `${how}. The map shows the whole valley; the journal keeps what you learn. Check both.`;}});}}catch(e){}
