// ================================================================ t367: the settings menu (owner: "a setting control menu thing, stuff you
// would want in a menu, with audio options, gameplay options, accessibility")
// Five groups in the menu's Settings tab: Controls, Audio, Gameplay, Display, Accessibility. Every change is applied at once and
// kept on this device; each group can be put back as it came. With a pad the triggers walk the groups (as they turn the journal's
// pages) and the d-pad moves the frame and turns a slider or a choice; with keys, the arrows; with a finger, tap and drag.
const SET7_KEY='hollowSettings';
const SET7_DEF={binds:{},padBinds:{},dead:.24,tSize:'m',tAlpha:1,leftHand:false,
  vMaster:1,vMusic:1,vFx:1,vAmb:1,vUi:1,bgMute:true,
  textSpeed:'normal',runToggle:false,arrow:true,hints:true,assist:false,saveRemind:false,gore:'full',
  gamma:1,parts:'high',fpsCap:'off',
  captions:true,capSize:'m',capBg:true,lessFlash:false,lessMotion:false,contrast:false,bigText:false,shapes:false,holdToggle:false};
const SET7=(()=>{let o={};try{o=JSON.parse(localStorage.getItem(SET7_KEY)||'{}')||{};}catch(e){}return Object.assign(JSON.parse(JSON.stringify(SET7_DEF)),o);})();
function set7Save(){try{localStorage.setItem(SET7_KEY,JSON.stringify(SET7));}catch(e){}}
function set7(k,v){if(SET7[k]===v)return;SET7[k]=v;set7Save();try{set7Apply(k);}catch(e){console.warn(e);}}

// ---------------------------------------------------------------- the keys and buttons you can move
const KEY7_ACT=[['up','Walk up','KeyW'],['left','Walk left','KeyA'],['down','Walk down','KeyS'],['right','Walk right','KeyD'],['run','Run','ShiftLeft'],['talk','Talk, open, pick up','KeyX'],
  ['items','Items','KeyE'],['map','Map','KeyM'],['journal','Journal','KeyJ'],['full','Full screen','KeyF']];
const PAD7_ACT=[[0,'Use, choose'],[1,'Back, cancel'],[2,'Talk, pin'],[3,'Find you, more'],[4,'Left bumper'],[5,'Right bumper'],[6,'Left trigger'],[7,'Right trigger']];
const key7Name=c=>({ShiftLeft:'Shift',ShiftRight:'Shift',ControlLeft:'Ctrl',Space:'Space',Escape:'Esc',Tab:'Tab',Enter:'Enter',Backspace:'Bksp',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→'})[c]||String(c||'').replace(/^Key|^Digit/,'');
function key7Of(a){const d=KEY7_ACT.find(q=>q[0]===a);return SET7.binds[a]||(d&&d[2]);}
function key7Map(){const m={};let any=false;const used={};for(const [a,,d] of KEY7_ACT){const c=key7Of(a);used[c]=a;if(c!==d){m[c]=d;any=true;}}
  for(const [a,,d] of KEY7_ACT){const c=key7Of(a);if(c!==d&&!used[d])m[d]=null;}   // a key taken away from its action does nothing (unless it was given another)
  for(const [a,,d] of KEY7_ACT){const k=d.replace(/^Key/,'').toLowerCase();KEY7.key[d]=d==='ShiftLeft'?'Shift':k;}
  KEY7.map=any?m:null;}
function key7Conflicts(){const by={};for(const [a] of KEY7_ACT){const c=key7Of(a);(by[c]=by[c]||[]).push(a);}return by;}
// the pad: a button you've given another action reads as that action's button
const PAD7={perm:null};
function pad7Perm(){const P=SET7.padBinds||{};const perm=[];let any=false;for(let i=0;i<17;i++){const v=P[i];perm[i]=(v!=null&&v!==i)?v:i;if(perm[i]!==i)any=true;}PAD7.perm=any?perm:null;}
try{const _gg=navigator.getGamepads&&navigator.getGamepads.bind(navigator);if(_gg)navigator.getGamepads=function(){const L=_gg();if(!PAD7.perm||PAD7.raw)return L;
  return [...L].map(p=>{if(!p)return p;const b=p.buttons;return {id:p.id,index:p.index,mapping:p.mapping,connected:p.connected,timestamp:p.timestamp,axes:p.axes,vibrationActuator:p.vibrationActuator,
    buttons:PAD7.perm.map((src,i)=>b[src]||b[i]||{pressed:false,value:0}).concat([...b].slice(PAD7.perm.length))};});};}catch(e){}
// the sticks' dead zone
if(typeof gpStick==='function'){gpStick=function(p,i){const DZ=SET7.dead;let x=p.axes[i]||0,y=p.axes[i+1]||0;const m=Math.hypot(x,y);if(m<DZ)return [0,0,0];const k=Math.min(1,(m-DZ)/(1-DZ))/m;return [x*k,y*k,Math.min(1,m*k)];};}

// ---------------------------------------------------------------- the rows of each group
const SET7_TS={slow:.6,normal:1,fast:1.8,instant:50};
const SET7_UI=[.8,.9,1,1.1,1.25,1.4,1.6];
function set7Rows(g){const R=[];const T=(k,label,sub)=>R.push({k,type:'toggle',label,sub});const C=(k,label,opts,sub)=>R.push({k,type:'choice',label,opts,sub});
  const L=(k,label,min,max,step,fmt,sub)=>R.push({k,type:'slider',label,min,max,step,fmt,sub});const H=t=>R.push({type:'head',label:t});const B=(label,act,sub)=>R.push({type:'button',label,act,sub});
  if(g==='controls'){H('Keys');for(const [a,l] of KEY7_ACT)R.push({type:'bind',a,label:l});
    H('Controller');L('dead','Stick dead zone',.08,.4,.02,v=>Math.round(v*100)+'%','How far a stick must move before it counts');R.push({type:'pref',k:'rumble',label:'Rumble'});
    R.push({type:'pref',k:'style',label:'Button pictures'});for(const [i,l] of PAD7_ACT)R.push({type:'padbind',i,label:l});B('Controller page',()=>{try{gpControls();}catch(e){}},'Every button, as your pad shows it');
    H('Touch');C('tSize','Button size',[['s','Small'],['m','Medium'],['l','Large']]);L('tAlpha','Button opacity',.35,1,.05,v=>Math.round(v*100)+'%');T('leftHand','Left-handed','Menu, Map and Use change sides');}
  if(g==='audio'){L('vMaster','Master volume',0,1,.1,v=>Math.round(v*10));L('vMusic','Music and dread',0,1,.1,v=>Math.round(v*10));L('vFx','Effects',0,1,.1,v=>Math.round(v*10));
    L('vAmb','Ambience and weather',0,1,.1,v=>Math.round(v*10));L('vUi','Menus and clicks',0,1,.1,v=>Math.round(v*10));
    R.push({type:'pref',k:'snd',label:'Sound',sub:'With other apps: their sound plays alongside'});T('bgMute','Mute in the background','Silent while you’re in another tab or app');}
  if(g==='gameplay'){C('textSpeed','Text speed',[['slow','Slow'],['normal','Normal'],['fast','Fast'],['instant','At once']]);C('runToggle','Run',[[false,'Hold to run'],[true,'Press to run, again to walk']]);
    T('arrow','Guide arrow','The arrow at the screen’s edge toward your goal');T('hints','Hints','The tips that explain things the first time');
    C('assist','Minigame timing',[[false,'Normal'],[true,'Assist: a wider window']]);T('saveRemind','Save reminder','A note every half hour that sleeping saves the game');
    C('gore','Gore',[['full','Full'],['toned','Toned down']],'Toned down keeps what happened, shows less of it');}
  if(g==='display'){L('gamma','Brightness',.7,1.6,.05,v=>Math.round(v*100)+'%','Raise it until the left mark below is barely visible');R.push({type:'gamma'});
    R.push({type:'pref',k:'ui',label:'Interface size'});R.push({type:'pref',k:'full',label:'Full screen'});B('Resolution and window',()=>{try{dispPick();}catch(e){}},'Resolution, fit, world zoom');
    C('parts','Weather particles',[['low','Low'],['medium','Medium'],['high','High']],'Rain, snow, petals: how many');C('fpsCap','Frame rate',[['off','As fast as it can'],['60','60'],['30','30: saves battery']]);}
  if(g==='access'){T('captions','Captions','Words for the sounds that matter');C('capSize','Caption size',[['s','Small'],['m','Medium'],['l','Large']]);T('capBg','Caption background','A dark band behind the words');
    T('lessFlash','Reduce flashing','Lightning and red pulses are dimmer and steady; the warning is still there');T('lessMotion','Reduce motion','Less screen shake and fewer jolts');
    T('contrast','High contrast','Stronger edges and darker panels');T('bigText','Larger text','Menus, notes and tips');T('shapes','Shapes as well as colours','Map and HUD markers differ in shape too');
    C('holdToggle','Held actions',[[false,'Hold'],[true,'Press to start, again to stop']]);}
  B('Reset to default',()=>set7Reset(g),'This group only');return R;}
const SET7_G=[['controls','Controls'],['audio','Audio'],['gameplay','Gameplay'],['display','Display'],['access','Accessibility']];
const SET7_GK={controls:['binds','padBinds','dead','tSize','tAlpha','leftHand'],audio:['vMaster','vMusic','vFx','vAmb','vUi','bgMute'],gameplay:['textSpeed','runToggle','arrow','hints','assist','saveRemind','gore'],
  display:['gamma','parts','fpsCap'],access:['captions','capSize','capBg','lessFlash','lessMotion','contrast','bigText','shapes','holdToggle']};
function set7Reset(g){for(const k of SET7_GK[g])set7(k,JSON.parse(JSON.stringify(SET7_DEF[k])));
  if(g==='controls'){try{GP.cfg.rumble=true;GP.cfg.style='auto';gpSave();}catch(e){}}if(g==='audio'){try{sndSet('on');}catch(e){}}if(g==='display'){try{DISP.ui=1;dispSave();dispApply();}catch(e){}}
  toast('Put back as it came.',1.4);set7Render(true);}

// ---------------------------------------------------------------- the page
const SET7_UIS={g:'controls',cap:null};
{const css=document.createElement('style');css.textContent=`
#s7G{display:flex;gap:4px;margin:0 0 8px;flex-wrap:wrap}
#s7G button{font:13px 'Hollow Pixel',ui-monospace,monospace;min-height:34px;padding:0 12px;color:#f4e6c8;background:#3a2414;border:0;cursor:pointer;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 2px 0 #5a3a20}
#s7G button.on{background:#a8502a;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 3px 0 #d07040}
body.in-touch #s7G button{min-height:calc(44px / var(--su,1));font-size:14px}
#s7R{display:flex;flex-direction:column;gap:4px;padding-bottom:8px}
#s7R .s7h{font:12px 'Hollow Pixel',ui-monospace,monospace;color:#d8b888;margin:8px 2px 2px;letter-spacing:.06em}
#s7R .s7r{display:flex;align-items:center;gap:10px;width:100%;min-height:40px;padding:4px 10px;text-align:left;color:#f4e6c8;background:rgba(0,0,0,.22);border:0;cursor:pointer;
  font:14px 'Hollow Pixel',ui-monospace,monospace;box-shadow:inset 0 0 0 1px rgba(255,240,210,.08)}
body.in-touch #s7R .s7r{min-height:calc(48px / var(--su,1))}
#s7R .s7r:hover,#s7R .s7r:focus-visible{background:rgba(168,116,58,.28);outline:none}
#s7R .s7l{flex:1;min-width:0}#s7R .s7l small{display:block;font-size:12px;opacity:.7;margin-top:1px}
#s7R .s7v{flex:none;min-width:90px;text-align:right;color:#ffd27a}
#s7R .s7bar{flex:none;width:120px;height:10px;background:#1a0e06;box-shadow:0 0 0 1px #5a3a20;position:relative}
#s7R .s7bar i{position:absolute;left:0;top:0;bottom:0;background:#c88a3a}
#s7R .s7key{display:inline-block;min-width:26px;padding:2px 6px;text-align:center;color:#2a1608;background:#ecdcb2;box-shadow:0 0 0 1px #1a0e06,0 2px 0 #1a0e06}
#s7R .s7key.bad{background:#e89a7a}#s7R .s7warn{color:#ff9a7a;font-size:12px}
#s7R .s7r.wait .s7key{background:#ffd27a;animation:s7w 1s steps(2) infinite}@keyframes s7w{50%{opacity:.4}}
#s7R .s7gam{display:flex;gap:10px;align-items:center;justify-content:center;padding:10px;background:#000;margin:2px 0 6px;font:12px 'Hollow Pixel',monospace;color:#ccc}
#s7R .s7gam span{display:flex;flex-direction:column;align-items:center;gap:4px}#s7R .s7gam b{display:block;width:46px;height:46px}
@media (max-width:560px){#s7R .s7bar{width:72px}#s7R .s7v{min-width:30px}}
`;document.head.appendChild(css);}
function set7Val(r){const v=r.k?SET7[r.k]:null;if(r.type==='choice'){const o=r.opts.find(q=>q[0]===v);return o?o[1]:String(v);}if(r.type==='toggle')return v?'On':'Off';if(r.type==='slider')return r.fmt?r.fmt(v):String(v);
  if(r.type==='pref'){try{if(r.k==='rumble')return GP.cfg.rumble?'On':'Off';if(r.k==='style')return {auto:'As your pad',xbox:'Xbox',ps:'PlayStation'}[GP.cfg.style]||'As your pad';
    if(r.k==='snd')return {on:'On',mix:'With other apps',quiet:'Quiet',off:'Off'}[sndMode()]||'On';if(r.k==='ui')return Math.round(dispUi()*100)+'%';if(r.k==='full')return DISP.mode==='full'?'On':'Off';}catch(e){}return '';}
  return '';}
function set7RowHtml(r,i){if(r.type==='head')return `<div class="s7h">${r.label.toUpperCase()}</div>`;
  if(r.type==='gamma')return `<div class="s7gam" id="s7Gam"><span><b style="background:#060606"></b>barely visible</span><span><b style="background:#141414"></b>clearly visible</span><span><b style="background:#262626"></b>plain</span></div>`;
  const sub=r.sub?`<small>${r.sub}</small>`:'';
  if(r.type==='bind'){const c=key7Of(r.a),bad=(key7Conflicts()[c]||[]).length>1;return `<button class="s7r" data-r="${i}"><span class="s7l">${r.label}${bad?'<small class="s7warn">also used by another action</small>':''}</span><span class="s7key${bad?' bad':''}">${key7Name(c)}</span></button>`;}
  if(r.type==='padbind'){const P=SET7.padBinds||{},src=P[r.i]!=null?P[r.i]:r.i;const nm=k=>typeof gpName==='function'?gpName(['a','b','x','y','lb','rb','lt','rt'][k]||'a'):String(k);
    return `<button class="s7r" data-r="${i}"><span class="s7l">${r.label}</span><span class="s7key">${src===r.i?nm(r.i):nm(src)}</span></button>`;}
  if(r.type==='slider'){const f=(SET7[r.k]-r.min)/(r.max-r.min);return `<button class="s7r" data-r="${i}"><span class="s7l">${r.label}${sub}</span><span class="s7bar"><i style="width:${Math.round(f*100)}%"></i></span><span class="s7v">${set7Val(r)}</span></button>`;}
  if(r.type==='button')return `<button class="s7r" data-r="${i}"><span class="s7l">${r.label}${sub}</span><span class="s7v">›</span></button>`;
  return `<button class="s7r" data-r="${i}"><span class="s7l">${r.label}${sub}</span><span class="s7v">${set7Val(r)}</span></button>`;}
function set7Render(keepFocus){const B=$('bagBody');if(!B)return;const g=SET7_UIS.g;const rows=SET7_UIS.rows=set7Rows(g);const fi=keepFocus&&document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.r:null;
  const gf=keepFocus&&typeof GP!=='undefined'&&GP.focus&&GP.focus.dataset?GP.focus.dataset.r:null;
  B.innerHTML=`<div id="s7G">${SET7_G.map(([k,l])=>`<button data-g="${k}" class="${k===g?'on':''}">${l}</button>`).join('')}</div><div id="s7R">${rows.map(set7RowHtml).join('')}</div>`;
  B.querySelectorAll('[data-g]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();SET7_UIS.g=b.dataset.g;SFX.page&&SFX.page();set7Render();}));
  B.querySelectorAll('[data-r]').forEach(b=>{const r=rows[+b.dataset.r];
    b.addEventListener('click',e=>{e.stopPropagation();if(r.type==='slider'&&e.clientX){const bar=b.querySelector('.s7bar').getBoundingClientRect();if(e.clientX>=bar.left-6&&e.clientX<=bar.right+6){set7Slide(r,(e.clientX-bar.left)/bar.width);return;}}set7Act(r,1,b);});
    if(r.type==='slider'){let drag=false;b.addEventListener('pointerdown',e=>{const bar=b.querySelector('.s7bar').getBoundingClientRect();if(e.clientX>=bar.left-6&&e.clientX<=bar.right+6){drag=true;try{b.setPointerCapture(e.pointerId);}catch(x){}}});
      b.addEventListener('pointermove',e=>{if(!drag)return;const bar=b.querySelector('.s7bar').getBoundingClientRect();set7Slide(r,(e.clientX-bar.left)/bar.width);});b.addEventListener('pointerup',()=>{drag=false;});}});
  set7GammaPreview();const sub=$('bagSub');if(sub)sub.textContent='';
  if(fi!=null){const e=B.querySelector(`[data-r="${fi}"]`);if(e)e.focus();}if(gf!=null&&typeof GP!=='undefined'){const e=B.querySelector(`[data-r="${gf}"]`);if(e)GP.focus=e;}}
function set7Slide(r,f){const v=Math.max(r.min,Math.min(r.max,Math.round((r.min+f*(r.max-r.min))/r.step)*r.step));set7(r.k,+v.toFixed(3));set7Refresh();}
// a row's value written again (only what changed: no flicker)
function set7Refresh(){const B=$('bagBody');if(!B||!SET7_UIS.rows)return;B.querySelectorAll('[data-r]').forEach(b=>{const r=SET7_UIS.rows[+b.dataset.r];if(!r)return;const v=b.querySelector('.s7v');
  if(v&&r.type!=='button'){const s=set7Val(r);if(v.textContent!==s)v.textContent=s;}const bar=b.querySelector('.s7bar i');if(bar){const w=Math.round((SET7[r.k]-r.min)/(r.max-r.min)*100)+'%';if(bar.style.width!==w)bar.style.width=w;}});set7GammaPreview();}
function set7Act(r,d,el){SFX.click&&SFX.click();
  if(r.type==='toggle'){set7(r.k,!SET7[r.k]);set7Refresh();return;}
  if(r.type==='choice'){const i=r.opts.findIndex(q=>q[0]===SET7[r.k]);const n=r.opts[(i+d+r.opts.length)%r.opts.length];set7(r.k,n[0]);set7Refresh();return;}
  if(r.type==='slider'){set7(r.k,+Math.max(r.min,Math.min(r.max,SET7[r.k]+d*r.step)).toFixed(3));set7Refresh();return;}
  if(r.type==='button'){r.act();return;}
  if(r.type==='pref'){try{if(r.k==='rumble'){GP.cfg.rumble=!GP.cfg.rumble;gpSave();if(GP.cfg.rumble&&typeof gpRumble==='function')gpRumble(.4,120);}
      else if(r.k==='style'){const L=['auto','xbox','ps'];const n=L[(Math.max(0,L.indexOf(GP.cfg.style||'auto'))+d+L.length)%L.length];if(typeof p65SetStyle==='function')p65SetStyle(n);else{GP.cfg.style=n;gpSave();try{gpPromptsChanged();}catch(e){}}}   // (the Deck's own pictures come with the Deck work)
      else if(r.k==='snd'){const L=['on','mix','quiet','off'];const n=L[(L.indexOf(sndMode())+d+L.length)%L.length];sndSet(n);}
      else if(r.k==='ui'){const cur=dispUi();let i=SET7_UI.findIndex(v=>Math.abs(v-cur)<.01);if(i<0)i=2;DISP.ui=SET7_UI[Math.max(0,Math.min(SET7_UI.length-1,i+d))];dispSave();dispApply();}
      else if(r.k==='full'){dispSetMode(DISP.mode==='full'?'window':'full');}}catch(e){console.warn(e);}set7Refresh();return;}
  if(r.type==='bind'){set7Capture(r,el);return;}if(r.type==='padbind'){set7PadCapture(r,el);return;}}
// waiting for a key: the next one pressed takes the action; one already used elsewhere swaps with it; Esc leaves it as it was
function set7Capture(r,el){if(SET7_UIS.cap)return;el.classList.add('wait');el.querySelector('.s7key').textContent='press a key';const prevMap=KEY7.map;KEY7.map=null;
  const fin=()=>{removeEventListener('keydown',on,true);SET7_UIS.cap=null;key7Map();set7Render(true);};
  const on=e=>{e.preventDefault();e.stopImmediatePropagation();if(e.code==='Escape'){KEY7.map=prevMap;fin();return;}const was=key7Of(r.a);const other=KEY7_ACT.find(q=>q[0]!==r.a&&key7Of(q[0])===e.code);
    const b=Object.assign({},SET7.binds);b[r.a]=e.code;if(other){b[other[0]]=was;toast(`${other[1]} moves to ${key7Name(was)}.`,1.8);}for(const [a,,d] of KEY7_ACT)if(b[a]===d)delete b[a];set7('binds',b);fin();};
  SET7_UIS.cap=r;addEventListener('keydown',on,true);}
// waiting for a pad button: the next one pressed (read raw) takes the action, swapping with the action that had it
function set7PadCapture(r,el){if(SET7_UIS.cap)return;el.classList.add('wait');el.querySelector('.s7key').textContent='press a button';SET7_UIS.cap=r;PAD7.raw=true;const t0=performance.now();let seen=null;
  const tick=()=>{if(SET7_UIS.cap!==r)return;const p=typeof gpPad==='function'?gpPad():null;if(p){const down=[...p.buttons].map(b=>b&&b.pressed);if(!seen)seen=down;else{const i=down.findIndex((v,k)=>v&&!seen[k]&&k<8);if(i>=0){
          const P=Object.assign({},SET7.padBinds);const cur=P[r.i]!=null?P[r.i]:r.i;const owner=PAD7_ACT.map(q=>q[0]).find(k=>(P[k]!=null?P[k]:k)===i&&k!==r.i);P[r.i]=i;if(owner!=null)P[owner]=cur;
          for(const k of Object.keys(P))if(+P[k]===+k)delete P[k];set7('padBinds',P);SET7_UIS.cap=null;PAD7.raw=false;setTimeout(()=>{set7Render(true);},120);return;}seen=down;}}
    if(performance.now()-t0>6000){SET7_UIS.cap=null;PAD7.raw=false;set7Render(true);return;}requestAnimationFrame(tick);};requestAnimationFrame(tick);}
// the menu's Settings tab is this page
m66Settings=function(){const bag=$('bag');bag.classList.add('m66set');set7Render();};

// the d-pad (and the arrow keys) turn a focused slider or choice; the triggers walk the groups
function set7Focused(){const f=(typeof GP!=='undefined'&&GP.mode==='pad'&&GP.focus)||document.activeElement;if(!f||!f.dataset||f.dataset.r==null)return null;const r=SET7_UIS.rows&&SET7_UIS.rows[+f.dataset.r];return r?[r,f]:null;}
const set7Open=()=>{const b=$('bag');return !!(b&&!b.hidden&&typeof GM_TAB!=='undefined'&&GM_TAB==='settings'&&$('s7R'));};
if(typeof gpNav==='function'){const _gn=gpNav;gpNav=function(dx,dy){if(set7Open()&&dx&&!dy){const q=set7Focused();if(q&&(q[0].type==='slider'||q[0].type==='choice'||(q[0].type==='pref'&&q[0].k!=='rumble'&&q[0].k!=='full'))){set7Act(q[0],dx>0?1:-1,q[1]);return;}}return _gn.apply(this,arguments);};}
// (the triggers turn the groups, as they turn the journal's pages; the bumpers keep walking the menu's tabs)
if(typeof GP_CTX!=='undefined'){const _ui=GP_CTX.ui;GP_CTX.ui=function(p,dt){try{if(set7Open()&&!SET7_UIS.cap)for(const [b,d] of [[6,-1],[7,1]])if(gpEdge(b)){const i=SET7_G.findIndex(q=>q[0]===SET7_UIS.g);
      SET7_UIS.g=SET7_G[(i+d+SET7_G.length)%SET7_G.length][0];SFX.page&&SFX.page();set7Render();setTimeout(()=>{const f=$('bagBody').querySelector('#s7G .on');if(f&&typeof GP!=='undefined')GP.focus=f;},20);}}catch(e){}return _ui.apply(this,arguments);};}
addEventListener('keydown',e=>{if(!set7Open()||SET7_UIS.cap)return;if(e.code!=='ArrowLeft'&&e.code!=='ArrowRight')return;const q=set7Focused();if(!q)return;
  if(q[0].type==='slider'||q[0].type==='choice'||q[0].type==='pref'){e.preventDefault();e.stopPropagation();set7Act(q[0],e.code==='ArrowRight'?1:-1,q[1]);}},true);

// ---------------------------------------------------------------- putting each setting to work
function set7Apply(k){
  if(!k||k==='binds')key7Map();if(!k||k==='padBinds')pad7Perm();
  if(!k||/^v|bgMute/.test(k))aud7Apply();
  if(!k||k==='tSize'||k==='tAlpha'||k==='leftHand'){const b=document.body;b.classList.toggle('s7tS',SET7.tSize==='s');b.classList.toggle('s7tL',SET7.tSize==='l');b.classList.toggle('s7left',!!SET7.leftHand);
    document.documentElement.style.setProperty('--s7ta',String(SET7.tAlpha));}
  if(!k||k==='arrow')document.body.classList.toggle('s7noArrow',!SET7.arrow);
  if(!k||k==='hints'){try{if(S.tut){if(!SET7.hints){S.tut.off=true;try{tutShow(null);}catch(e){}}}}catch(e){}}
  if(!k||k==='gamma')set7Gamma();
  if(!k||k==='parts'){try{R366.cap={low:.35,medium:.65,high:1}[SET7.parts]||1;R366.dens=Math.min(R366.dens,R366.cap);}catch(e){}}
  if(!k||k==='contrast')document.body.classList.toggle('s7hc',!!SET7.contrast);
  if(!k||k==='bigText')document.body.classList.toggle('s7big',!!SET7.bigText);
  if(!k||k==='capSize'||k==='capBg'){const b=document.body;b.classList.toggle('s7capS',SET7.capSize==='s');b.classList.toggle('s7capL',SET7.capSize==='l');b.classList.toggle('s7capNoBg',!SET7.capBg);}
  if(!k||k==='shapes'){try{M6.ver++;M6.dirty=true;}catch(e){}}
  if(!k||k==='gore'){window.GORE_TONED=SET7.gore==='toned';}}
// sound: music, effects, ambience and the menus each through their own gain, all under the master
const AUD7={on:false};
function aud7Build(){if(AUD7.on||typeof A==='undefined'||!A.ok||!A.ctx)return;const c=A.ctx;AUD7.on=true;
  for(const k of ['Music','Fx','Amb','Ui']){const g=c.createGain();g.connect(A.master);A['b7'+k]=g;}
  const re=(n,to)=>{if(!n)return;try{n.disconnect();n.connect(to);}catch(e){}};
  re(A.wind,A.b7Amb);re(A.rain,A.b7Amb);re(A.rainLow,A.b7Amb);
  try{A.drone.disconnect();A.drone.connect(A.b7Music);A.drone.connect(A.verb);}catch(e){}try{A.tense.disconnect();A.tense.connect(A.b7Music);A.tense.connect(A.verb);}catch(e){}
  if(typeof A_out==='function'){const _o=A_out;A_out=function(pan,verb){const r=_o.apply(this,arguments);if(r!==A.master)return r;return AUD7.ui?A.b7Ui:A.b7Fx;};}
  aud7Apply();}
function aud7Apply(){if(!AUD7.on)return;const m=SET7.vMaster,t=A.ctx.currentTime;const set=(g,v)=>{try{g.gain.setTargetAtTime(v,t,.05);}catch(e){g.gain.value=v;}};
  set(A.b7Music,m*SET7.vMusic);set(A.b7Fx,m*SET7.vFx);set(A.b7Amb,m*SET7.vAmb);set(A.b7Ui,m*SET7.vUi);}
setInterval(()=>{try{aud7Build();}catch(e){}},500);
// a click, a page turning: menu sounds
try{for(const n of ['click','page','deny','coin']){const f=SFX[n];if(typeof f!=='function')continue;SFX[n]=function(){AUD7.ui=n==='click'||n==='page';try{return f.apply(this,arguments);}finally{AUD7.ui=false;}};}}catch(e){}
// silent in the background (sound only; the game also pauses and saves there, deck367.js)
document.addEventListener('visibilitychange',()=>{try{if(!A.ctx)return;if(document.hidden&&SET7.bgMute)A.ctx.suspend();else if(!document.hidden&&sndMode()!=='off')A.ctx.resume();}catch(e){}});

// brightness: raised in the light itself (the night's floor and the day's ambient), so the dark opens smoothly instead of
// banding the way a filter over the finished picture does; the test strip shows the same lift
function set7Gamma(){const cv=$('view');if(cv&&cv.style.filter)cv.style.filter='';set7GammaPreview();}
function set7GammaPreview(){const s=$('s7Gam');if(!s)return;const g=SET7.gamma;const want=Math.abs(g-1)<.01?'':`brightness(${(1+(g-1)*1.6).toFixed(2)})`;if(s.style.filter!==want)s.style.filter=want;}
if(typeof nightAmb==='function'){const _na=nightAmb;nightAmb=function(amb,DK){const r=_na.apply(this,arguments);const f=Math.max(0,SET7.gamma-1)/.6*DK;if(!f)return r;return [r[0]+44*f,r[1]+48*f,r[2]+62*f];};}   // (a moonlit floor under the dark)
{const _am=ambient;ambient=function(h){const a=_am.apply(this,arguments);const g=SET7.gamma;if(Math.abs(g-1)<.01)return a;const k=1+(g-1)*.35;return [Math.min(255,a[0]*k),Math.min(255,a[1]*k),Math.min(255,a[2]*k)];};}

// gameplay: the text's speed in the scenes; run by a press; the minigames' assist and held actions are read where they're used
{const _r=render;render=function(dt,now){
  // reduce flashing: lightning and the flashes stay, dimmer; reduce motion: the shakes are small and short
  if(SET7.lessFlash&&typeof flashT!=='undefined'&&flashT>.4)flashT=.4;if(SET7.lessMotion&&cam.shake>.12)cam.shake=.12;
  return _r.apply(this,arguments);};}
{const RUN7={on:false};addEventListener('keydown',e=>{if(!SET7.runToggle||e.repeat)return;if((e.code==='ShiftLeft'||e.code==='ShiftRight')&&!(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName||''))){RUN7.on=!RUN7.on;}},true);
  addEventListener('keyup',e=>{if(!SET7.runToggle)return;if(e.code==='ShiftLeft'||e.code==='ShiftRight'){if(RUN7.on){e.stopImmediatePropagation();keys.ShiftLeft=true;}}},true);
  setInterval(()=>{if(SET7.runToggle&&RUN7.on)keys.ShiftLeft=true;else if(SET7.runToggle&&!RUN7.on&&keys.ShiftLeft&&!keys.ShiftRight)keys.ShiftLeft=false;},100);}
// a note every half hour of play that sleeping saves the game
{let acc=0;setInterval(()=>{try{if(!SET7.saveRemind||S.mode!=='play'||S.paused||document.hidden)return;acc+=10;if(acc>=1800){acc=0;toast('A reminder: sleeping in your bed saves the game.',3);}}catch(e){}},10000);}

// captions: words for the sounds that matter, low in the middle, on a dark band (or not)
const CAP7={el:null,t:0};
const CAP7_TXT={bell:'The church bell tolls',stinger:'A sharp sting of sound',shriek:'A shriek',whisper:'Whispering',breath:'Breathing, close by',scream:'A scream',heart:'Your heart pounding',
  crash:'A crash',screech:'Tyres screech',horn:'A horn',ring:'A phone ringing',caw:'A crow caws'};
function cap7Show(s,pan){if(!SET7.captions)return;let el=CAP7.el;if(!el){el=CAP7.el=document.createElement('div');el.id='cap7';document.body.appendChild(el);}
  const dir=pan>.35?' ▶':pan<-.35?'◀ ':'';const txt=(pan<-.35?dir:'')+'['+s+']'+(pan>.35?dir:'');if(el.textContent!==txt)el.textContent=txt;el.classList.add('on');clearTimeout(CAP7.t);CAP7.t=setTimeout(()=>el.classList.remove('on'),2400);}
try{for(const [n,s] of Object.entries(CAP7_TXT)){const f=SFX[n];if(typeof f!=='function')continue;SFX[n]=function(pan){try{cap7Show(s,typeof pan==='number'?pan:0);}catch(e){}return f.apply(this,arguments);};}
  const _lt=lightning;lightning=function(){try{cap7Show('Thunder',0);}catch(e){}return _lt.apply(this,arguments);};}catch(e){}
{const css=document.createElement('style');css.textContent=`
#cap7{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 118px);transform:translateX(-50%);z-index:40;pointer-events:none;font:16px 'Hollow Pixel',ui-monospace,monospace;color:#f4e6c8;
  background:rgba(8,6,4,.78);padding:4px 10px;opacity:0;transition:opacity .2s steps(2);white-space:nowrap}
#cap7.on{opacity:1}body:has(#bag:not([hidden])) #cap7,body:has(#note:not([hidden])) #cap7,body:has(#shop:not([hidden])) #cap7{bottom:auto;top:calc(env(safe-area-inset-top,0px) + 6px)}body.s7capS #cap7{font-size:13px}body.s7capL #cap7{font-size:22px}body.s7capNoBg #cap7{background:none;text-shadow:0 0 2px #000,0 0 2px #000,1px 1px 0 #000}
body.s7noArrow #arrow,body.s7noArrow .objArrow{display:none!important}
body.s7hc .sheet,body.s7hc #bag,body.s7hc #note{background:#120a04!important;box-shadow:0 0 0 3px #fff4dc,inset 0 0 0 2px #000!important}
body.s7hc button{box-shadow:inset 0 0 0 2px #fff4dc!important}body.s7hc #bag *{text-shadow:none!important}
body.s7big #bagBody,body.s7big #noteText,body.s7big #talk,body.s7big .toast,body.s7big #m6Tip,body.s7big #mapCard{zoom:1.14}
body.s7tS #buttons button,body.s7tS #btnBag,body.s7tS #btnMap{transform:scale(.85)}body.s7tL #buttons button,body.s7tL #btnBag,body.s7tL #btnMap{transform:scale(1.2)}
body.in-touch #buttons,body.in-touch #btnBag,body.in-touch #btnMap{opacity:var(--s7ta,1)}
body.s7left #buttons{right:auto!important;left:var(--gr,12px)!important;flex-direction:row-reverse!important}
body.s7left #btnBag,body.s7left #btnMap{left:auto!important;right:16px!important}
`;document.head.appendChild(css);}
// a frame-rate cap: frames are skipped to hold it (a phone or a Deck on battery)
{let lastF=0;const _l=loop;loop=function(now){const cap=SET7.fpsCap==='30'?30:SET7.fpsCap==='60'?60:0;if(cap&&lastF&&now-lastF<1000/cap-2){requestAnimationFrame(loop);return;}lastF=now;return _l.apply(this,arguments);};}
set7Apply();

// ---------------------------------------------------------------- every popup fits the window (owner: "the pop-up is not fully
// accessible and is only partly seen in the bottom corner, no way to access it"). Any panel or picker taller or wider than the
// window is held inside it with a margin and scrolls inside, with a "more below" cue while there's more; its close stays at hand
// (an X pinned to its top corner if it has none there), Esc and B close it; checked again whenever the window changes size.
const POP7_SEL='[data-modal],#dispPick,#sndPick,#gpCtl,.sheet';
{const css=document.createElement('style');css.textContent=`
.pop7fit{max-height:calc(100vh - 16px)!important;max-height:calc(100dvh - 16px)!important;max-width:calc(100vw - 16px)!important;overflow:auto!important;box-sizing:border-box}
.pop7x{position:sticky;top:0;float:right;z-index:3;width:34px;height:34px;margin:-4px -4px 0 6px;font:16px/1 'Hollow Pixel',monospace;color:#f4e6c8;background:#5a3418;border:0;cursor:pointer;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 2px 0 #8a5a30}
.pop7more::after{content:'more below ⌄';position:sticky;bottom:0;display:block;text-align:center;font:12px 'Hollow Pixel',monospace;color:#ffd27a;padding:4px 0 2px;background:linear-gradient(transparent,rgba(20,12,6,.95) 45%)}
`;document.head.appendChild(css);}
function pop7Visible(e){if(e.hidden)return false;const c=getComputedStyle(e);if(c.display==='none'||c.visibility==='hidden')return false;const r=e.getBoundingClientRect();return r.width>40&&r.height>40;}
function pop7Close(e){const b=e.querySelector('[id$="Close"],.close,[data-close],.pop7x');if(b){b.click();return;}e.style.display='none';}
function pop7Fit(){for(const e of document.querySelectorAll(POP7_SEL)){if(!pop7Visible(e))continue;const r=e.getBoundingClientRect(),W=innerWidth,H=innerHeight;
    const over=r.height>H-16||r.width>W-16||r.top<0||r.left<0||r.bottom>H||r.right>W;const z=parseFloat(getComputedStyle(e).zoom)||1;if(over&&!e.classList.contains('pop7fit'))e.classList.add('pop7fit');
    if(e.classList.contains('pop7fit')&&!e.classList.contains('sheet')){let mh=parseFloat(e.style.maxHeight)||Math.floor((H-16)/z),mw=parseFloat(e.style.maxWidth)||Math.floor((W-16)/z);
      if(r.height>H-16)mh=Math.floor(mh*(H-16)/r.height);if(r.width>W-16)mw=Math.floor(mw*(W-16)/r.width);   // (shrunk by what's left over: the panel's own zoom is taken in)
      if(e.style.maxHeight!==mh+'px'||e.style.maxWidth!==mw+'px'){e.style.setProperty('max-height',mh+'px','important');e.style.setProperty('max-width',mw+'px','important');e.style.setProperty('overflow','auto','important');}}
    if(e.classList.contains('pop7fit')){const r2=e.getBoundingClientRect();let dx=0,dy=0;if(r2.left<8)dx=8-r2.left;else if(r2.right>W-8)dx=W-8-r2.right;if(r2.top<8)dy=8-r2.top;else if(r2.bottom>H-8)dy=H-8-r2.bottom;
      if((dx||dy)&&!e.classList.contains('sheet')){const t=(e._p7||[0,0]);e._p7=[clamp(t[0]+dx/z,-W,W),clamp(t[1]+dy/z,-H,H)];e.style.translate=`${Math.round(e._p7[0])}px ${Math.round(e._p7[1])}px`;}
      const more=e.scrollHeight>e.clientHeight+4&&e.scrollTop+e.clientHeight<e.scrollHeight-4;if(e.classList.contains('pop7more')!==more)e.classList.toggle('pop7more',more);
      if(!e._p7x&&!e.classList.contains('sheet')){const has=[...e.querySelectorAll('button')].some(b=>/^(✕|×|x|close|done)$/i.test(b.textContent.trim())&&b.getBoundingClientRect().top<r2.top+60);
        if(!has){const x=document.createElement('button');x.className='pop7x';x.textContent='✕';x.setAttribute('aria-label','Close');x.addEventListener('click',ev=>{ev.stopPropagation();e.style.display='none';e.classList.remove('pop7fit','pop7more');});e.prepend(x);}e._p7x=true;}
      if(!e._p7s){e._p7s=true;e.addEventListener('scroll',()=>{const m=e.scrollHeight>e.clientHeight+4&&e.scrollTop+e.clientHeight<e.scrollHeight-4;if(e.classList.contains('pop7more')!==m)e.classList.toggle('pop7more',m);},{passive:true});}}}}
setInterval(()=>{try{pop7Fit();pop7Fit();}catch(e){}},200);   // (twice: the second pass takes in the panel's own zoom)
try{new MutationObserver(()=>{try{pop7Fit();pop7Fit();}catch(e){}}).observe(document.body,{attributes:true,attributeFilter:['style','hidden','class'],subtree:true});}catch(e){}addEventListener('resize',()=>{try{for(const e of document.querySelectorAll('.pop7fit')){e._p7=null;e.style.translate='';}pop7Fit();}catch(e){}});
// Esc closes the uppermost open popup (the menus' own Esc still handles the menus)
addEventListener('keydown',e=>{if(e.code!=='Escape')return;for(const id of ['dispPick','sndPick']){const p=$(id);if(p&&pop7Visible(p)){p.style.display='none';e.stopPropagation();return;}}},true);
// the Display icon opens Settings on its Display group (the sound icon's quick picker is small and stays)
setTimeout(function pop7Disp(){const b=$('dispBtn');if(!b){setTimeout(pop7Disp,500);return;}b.addEventListener('click',e=>{if(typeof S==='undefined'||S.mode!=='play')return;e.stopImmediatePropagation();e.preventDefault();try{SET7_UIS.g='display';openBag('settings');}catch(x){try{dispPick();}catch(y){}}},true);/* (on the title the quick panel stays) */},400);

// the interface size never grows the panels past the window: the largest size is held to what the window can show
if(typeof dispUi==='function'){const _du=dispUi;dispUi=function(){const v=_du();if(v<=1)return v;const W=innerWidth,H=innerHeight,fine=matchMedia('(pointer:fine)').matches;
  const base=fine?clamp(Math.min(W/1000,H/680),1,4):(Math.min(W,H)>=700?1.2:1);const cap=Math.min((W-16)/730,(H-16)/690)/base;return Math.max(1,Math.min(v,cap));};}
addEventListener('resize',()=>{try{dispApply();}catch(e){}});
