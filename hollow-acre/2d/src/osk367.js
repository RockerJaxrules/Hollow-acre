// ================================================================ t367: the on-screen keyboard. A text box (your name, logging in, a code,
// a note on a map pin, the business's name, the chat) opens it when you're playing on a pad, or on a Steam Deck whatever you used:
// letters, numbers, shift, space, delete and done, worked from the pad (the d-pad or the stick moves, A types the key, B deletes,
// X is a space, Y shift, LB and RB move the cursor, Start is done, View puts the box back as it was) or by touch and mouse.
// A keyboard plugged in still types as usual: its first key closes this one.
const OSK={open:false,el:null,inp:null,id:'',val:'',car:0,orig:'',shift:false,caps:false,r:1,c:0,bt:0,im:null,ver:-1,lastSh:0};
const OSK_ROWS=[['1','2','3','4','5','6','7','8','9','0'],['q','w','e','r','t','y','u','i','o','p'],['a','s','d','f','g','h','j','k','l','\''],['z','x','c','v','b','n','m',',','.','?']];
const OSK_SH={1:'!',2:'@',3:'#',4:'$',5:'%',6:'&',7:'*',8:'(',9:')',0:'-','\'':'"',',':';','.':':','?':'_'};
const OSK_LAST=[['shift',0,2],['space',2,4],['bksp',6,2],['done',8,2]];   // the bottom row: [key, first column, columns]
const OSK_ENTER=new Set(['coIn','cheatIn','m6PinN','mmName','mpCode','hoCode']);   // (boxes whose Enter sends or saves: Done does the same)
const oskText=el=>!!el&&((el.tagName==='TEXTAREA')||(el.tagName==='INPUT'&&/^(text|search|password|number|email|url|tel|)$/i.test(el.type||'')))&&!el.readOnly&&!el.disabled;
const oskWant=()=>(typeof GP!=='undefined'&&GP.mode==='pad')||(typeof DECK!=='undefined'&&DECK.on&&!DECK.kb);
function oskLabel(el){const ph=el.getAttribute('placeholder');let l=el.getAttribute('aria-label')||'';if(!l&&el.id){const lb=document.querySelector(`label[for="${el.id}"]`);if(lb)l=lb.textContent;}
  if(!l){const p=el.previousElementSibling;if(p&&/^(LABEL|B|SPAN|SMALL|DIV)$/.test(p.tagName)&&p.textContent.trim().length<40)l=p.textContent;}
  return String(l||ph||'Type').replace(/\s+/g,' ').trim().slice(0,40);}
function oskKeyChar(k){if(k.length!==1)return k;const up=OSK.shift!==OSK.caps;if(/[a-z]/.test(k))return up?k.toUpperCase():k;return up&&OSK_SH[k]!=null?OSK_SH[k]:k;}
// ---------------------------------------------------------------- the panel
{const css=document.createElement('style');css.textContent=`
#osk7{position:fixed;z-index:2000;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);transform:translateX(-50%);width:min(660px,calc(100vw - 16px));box-sizing:border-box;padding:10px 10px 8px;
  background:#2a1a0e;color:#f4e6c8;font:15px 'Hollow Pixel',ui-monospace,monospace;box-shadow:0 0 0 2px #1a0e06,0 0 0 4px #b8521c,0 10px 40px rgba(0,0,0,.6);touch-action:manipulation;user-select:none}
#osk7[hidden]{display:none}
#osk7 .ok-hd{display:flex;align-items:center;gap:8px;margin-bottom:6px}#osk7 .ok-lab{flex:1;min-width:0;font-size:13px;color:#e0b070;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#osk7 .ok-x{flex:none;width:34px;height:34px;font:16px/1 'Hollow Pixel',monospace;color:#f4e6c8;background:#5a3418;border:0;cursor:pointer;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 2px 0 #8a5a30}
#osk7 .ok-v{min-height:24px;padding:6px 10px;margin-bottom:8px;background:#1e130a;box-shadow:inset 0 0 0 2px #3a2616;font-size:17px;white-space:pre;overflow:hidden;direction:ltr}
#osk7 .ok-v i{display:inline-block;width:2px;height:1em;margin:0 -1px;vertical-align:-2px;background:#ffd27a;animation:ok7c 1s steps(2) infinite}@keyframes ok7c{50%{opacity:0}}
#osk7 .ok-v .ok-ph{opacity:.45}
#osk7 .ok-g{display:grid;grid-template-columns:repeat(10,1fr);gap:4px}
#osk7 .ok-g button{min-width:0;min-height:42px;padding:0;font:inherit;font-size:16px;color:#f4e6c8;background:#3a2616;border:0;cursor:pointer;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 2px 0 #5a3e24}
#osk7 .ok-g button:hover{background:#4a3020}#osk7 .ok-g button.on{background:#7a4422;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 2px 0 #b06838}
#osk7 .ok-g button.lit{color:#2a1608;background:#e0b070;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 2px 0 #f4d8a0}
#osk7 .ok-g .s2{grid-column:span 2;font-size:14px}#osk7 .ok-g .s4{grid-column:span 4;font-size:14px}#osk7 .ok-g .ok-done{background:#a8502a;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 3px 0 #d07040}
#osk7 .ok-hint{display:flex;flex-wrap:wrap;justify-content:center;gap:2px 14px;margin-top:6px;font-size:13px;opacity:.9}#osk7 .ok-hint span{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
#osk7 .ok-hint[hidden]{display:none}#osk7 .ok-hint .gpg{height:22px;vertical-align:middle}
@media (max-height:520px){#osk7{padding:6px 8px 5px}#osk7 .ok-g button{min-height:30px;font-size:14px}#osk7 .ok-v{padding:3px 8px;margin-bottom:5px;font-size:15px}#osk7 .ok-hd{margin-bottom:3px}#osk7 .ok-x{width:28px;height:28px}#osk7 .ok-hint{margin-top:3px}}
`;document.head.appendChild(css);}
function oskBuild(){let p=OSK.el;if(p)return p;p=OSK.el=document.createElement('div');p.id='osk7';p.hidden=true;p.setAttribute('data-modal','');p.setAttribute('role','dialog');p.setAttribute('aria-label','Keyboard');
  const key=(k,cls,lab)=>`<button type="button" data-ok="${k}"${cls?` class="${cls}"`:''}>${lab}</button>`;
  p.innerHTML=`<div class="ok-hd"><span class="ok-lab"></span><button type="button" class="ok-x" data-ok="cancel" aria-label="Close the keyboard, keep the box as it was">✕</button></div><div class="ok-v"></div>
    <div class="ok-g">${OSK_ROWS.map(R=>R.map(k=>key(k,'',k)).join('')).join('')}${key('shift','s2','⇧ Shift')}${key('space','s4','Space')}${key('bksp','s2','⌫ Delete')}${key('done','s2 ok-done','Done')}</div><div class="ok-hint"></div>`;
  // (a key doesn't take the focus from the box: the cursor stays in it)
  p.addEventListener('pointerdown',e=>{if(e.target.closest('button'))e.preventDefault();});
  p.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-ok]');if(!b)return;const k=b.dataset.ok;const rc=oskRC(k);if(rc){OSK.r=rc[0];OSK.c=rc[1];}oskKey(k);});
  document.body.appendChild(p);return p;}
function oskRC(k){for(let r=0;r<4;r++){const c=OSK_ROWS[r].indexOf(k);if(c>=0)return [r,c];}const L=OSK_LAST.find(q=>q[0]===k);return L?[4,L[1]]:null;}
function oskAt(r,c){if(r<4)return OSK_ROWS[r][c];const L=OSK_LAST.find(q=>c>=q[1]&&c<q[1]+q[2]);return L?L[0]:'space';}
// what shows: the label, the text with its cursor, the letters in the case they'll type, the key you're on; written only when it changes
function oskShow(){const p=OSK.el;if(!p||!OSK.open)return;const pw=OSK.inp&&OSK.inp.type==='password';
  const lab=oskLabel(OSK.inp||p);const le=p.querySelector('.ok-lab');if(le.textContent!==lab)le.textContent=lab;
  const show=pw?'•'.repeat(OSK.val.length):OSK.val;const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const vh=show?esc(show.slice(0,OSK.car))+'<i></i>'+esc(show.slice(OSK.car)):'<i></i><span class="ok-ph">'+esc(OSK.inp&&OSK.inp.getAttribute('placeholder')||'')+'</span>';
  const ve=p.querySelector('.ok-v');if(ve._h!==vh){ve._h=vh;ve.innerHTML=vh;const c=ve.querySelector('i');if(c&&c.offsetLeft>ve.clientWidth-14)ve.scrollLeft=c.offsetLeft-ve.clientWidth+20;else ve.scrollLeft=0;}
  for(const b of p.querySelectorAll('.ok-g [data-ok]')){const k=b.dataset.ok;if(k.length===1){const t=oskKeyChar(k);if(b.textContent!==t)b.textContent=t;}
    const on=oskAt(OSK.r,OSK.c)===k;if(b.classList.contains('on')!==on)b.classList.toggle('on',on);
    if(k==='shift'){const lit=OSK.shift||OSK.caps;if(b.classList.contains('lit')!==lit)b.classList.toggle('lit',lit);const t=OSK.caps?'⇧ CAPS':'⇧ Shift';if(b.textContent!==t)b.textContent=t;}}
  const pad=typeof GP!=='undefined'&&GP.mode==='pad';const hv=(pad?1:0)+':'+(typeof GP!=='undefined'?GP.ver:0);
  if(OSK.ver!==hv){OSK.ver=hv;const he=p.querySelector('.ok-hint');const H=pad?[['{A}','type'],['{B}','delete'],['{X}','space'],['{Y}','shift'],['{LB} {RB}','move'],['{START}','done'],['{BACK}','cancel']]:[];
    he.innerHTML=H.map(([k,t])=>`<span>${gpFmt(k)} ${t}</span>`).join('');he.hidden=!pad;}
  if(pad){const b=p.querySelector(`.ok-g [data-ok="${CSS.escape(oskAt(OSK.r,OSK.c))}"]`);if(b&&GP.focus!==b)GP.focus=b;}}
// ---------------------------------------------------------------- the box it types into (found again by its id if its panel drew itself again)
function oskBox(){let i=OSK.inp;if(i&&i.isConnected)return i;if(OSK.id){const j=document.getElementById(OSK.id);if(j&&oskText(j)){OSK.inp=j;oskAttach(j);oskWrite(true);return j;}}return null;}
function oskAttach(i){OSK.im=i.getAttribute('inputmode');i.setAttribute('inputmode','none');try{i.focus({preventScroll:true});}catch(e){}}
function oskWrite(quiet){const i=oskBox();if(!i)return;if(i.value!==OSK.val)i.value=OSK.val;try{if(i.type!=='number')i.setSelectionRange(OSK.car,OSK.car);}catch(e){}
  if(!quiet)i.dispatchEvent(new Event('input',{bubbles:true}));}
function oskOpen(el){if(!oskText(el))return false;const p=oskBuild();if(OSK.open&&OSK.inp===el)return true;if(OSK.open)oskClose(true);
  OSK.inp=el;OSK.id=el.id||'';OSK.val=String(el.value||'');OSK.orig=OSK.val;let c=OSK.val.length;try{if(el.type!=='number'&&el.selectionStart!=null&&document.activeElement===el)c=el.selectionEnd;}catch(e){}OSK.car=c;
  OSK.caps=false;OSK.shift=!OSK.val&&!/user|code|pass|pin(?!n)|perk|cheat|^co|^ho|^mp/i.test(OSK.id)&&el.type!=='password'&&el.type!=='number';   // (a name starts with a capital)
  OSK.r=1;OSK.c=0;OSK.bt=0;OSK.ver=-1;OSK.open=true;oskAttach(el);p.hidden=false;
  try{GP.typing=el;}catch(e){}oskShow();return true;}
function oskClose(keep){const p=OSK.el,i=OSK.inp;OSK.open=false;if(p&&!p.hidden)p.hidden=true;
  if(i){if(OSK.im==null)i.removeAttribute('inputmode');else i.setAttribute('inputmode',OSK.im);OSK.im=null;
    if(!keep){try{i.blur();}catch(e){}try{GP.typing=null;if(i.isConnected&&GP.mode==='pad')GP.focus=i;}catch(e){}}}
  OSK.inp=null;}
function oskKey(k){const i=oskBox();if(!i){oskClose();return;}const max=i.maxLength>0?i.maxLength:1e9;let ok=true;
  if(k==='cancel'){OSK.val=OSK.orig;OSK.car=OSK.val.length;oskWrite();oskClose();return;}
  if(k==='done'){oskWrite(true);const fire=OSK_ENTER.has(OSK.id);try{i.dispatchEvent(new Event('change',{bubbles:true}));}catch(e){}oskClose(fire);
    if(fire){try{i.focus({preventScroll:true});}catch(e){}i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true}));i.dispatchEvent(new KeyboardEvent('keyup',{key:'Enter',code:'Enter',bubbles:true}));
      setTimeout(()=>{try{if(document.activeElement===i)i.blur();GP.typing=null;if(i.isConnected&&GP.mode==='pad')GP.focus=i;}catch(e){}},0);}
    try{SFX.click&&SFX.click();}catch(e){}return;}
  if(k==='shift'){const now=performance.now();if(OSK.caps){OSK.caps=false;OSK.shift=false;}else if(OSK.shift&&now-OSK.lastSh<450){OSK.caps=true;OSK.shift=false;}else OSK.shift=!OSK.shift;OSK.lastSh=now;oskShow();return;}
  if(k==='bksp'){if(OSK.car>0){OSK.val=OSK.val.slice(0,OSK.car-1)+OSK.val.slice(OSK.car);OSK.car--;oskWrite();}else ok=false;}
  else if(k==='left'||k==='right'){const n=Math.max(0,Math.min(OSK.val.length,OSK.car+(k==='left'?-1:1)));if(n===OSK.car)ok=false;OSK.car=n;oskWrite(true);}
  else{const ch=k==='space'?' ':oskKeyChar(k);if(i.type==='number'&&!/[0-9]/.test(ch))ok=false;else if(OSK.val.length>=max)ok=false;
    else{OSK.val=OSK.val.slice(0,OSK.car)+ch+OSK.val.slice(OSK.car);OSK.car+=ch.length;if(OSK.shift&&k!=='space')OSK.shift=false;oskWrite();}}
  try{ok?(SFX.click&&SFX.click()):(SFX.deny&&SFX.deny());}catch(e){}oskShow();}
// moving about the keys: rows wrap at the ends; on the bottom row a wide key is one step
function oskMove(dx,dy){if(dy){OSK.r=(OSK.r+dy+5)%5;if(OSK.r===4){const L=OSK_LAST.find(q=>OSK.c>=q[1]&&OSK.c<q[1]+q[2]);OSK.c=L?L[1]:0;}}
  if(dx){if(OSK.r<4)OSK.c=(OSK.c+dx+10)%10;else{let j=OSK_LAST.findIndex(q=>OSK.c>=q[1]&&OSK.c<q[1]+q[2]);j=(j+dx+OSK_LAST.length)%OSK_LAST.length;OSK.c=OSK_LAST[j][1];}}
  oskShow();}
// ---------------------------------------------------------------- the pad, while it's open (nothing else in the menus moves)
if(typeof GP_CTX!=='undefined'){const _ui=GP_CTX.ui;GP_CTX.ui=function(p,dt){if(!OSK.open)return _ui.apply(this,arguments);
  if(!oskBox()){oskClose();return;}const d=gpDir(p,dt,true);if(d)oskMove(d[0],d[1]);
  if(gpEdge(0))oskKey(oskAt(OSK.r,OSK.c));
  if(gpEdge(1)){OSK.bt=0;oskKey('bksp');}else if(gpDown(1)){OSK.bt+=dt;if(OSK.bt>.45){OSK.bt-=.07;oskKey('bksp');}}
  if(gpEdge(2))oskKey('space');if(gpEdge(3))oskKey('shift');if(gpEdge(4))oskKey('left');if(gpEdge(5))oskKey('right');
  if(gpEdge(9))oskKey('done');else if(gpEdge(8))oskKey('cancel');};}
// A on a text box opens the keyboard (it used to wait for a real keyboard)
if(typeof gpA==='function'){const _a=gpA;gpA=function(){const el=GP.focus;if(el&&el.isConnected&&oskText(el)){oskOpen(el);return;}return _a.apply(this,arguments);};}
// on a Deck a tap (or the trackpad's click) in a text box opens it too
addEventListener('pointerdown',e=>{const el=e.target;if(!oskText(el)||(OSK.open&&OSK.inp===el)||!oskWant())return;setTimeout(()=>{if(el.isConnected)oskOpen(el);},0);},true);
// a real keyboard: Enter is done, Esc puts it back, any other key means you have one (this keyboard steps aside, the box keeps the key)
addEventListener('keydown',e=>{if(!OSK.open||!e.isTrusted)return;if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();oskKey('cancel');return;}
  if(e.code==='Enter'||e.code==='NumpadEnter'){if(!OSK_ENTER.has(OSK.id)){e.preventDefault();e.stopImmediatePropagation();}oskWrite(true);oskClose(true);return;}
  if(e.key&&(e.key.length===1||e.key==='Backspace')){try{DECK.kb=true;}catch(x){}const i=OSK.inp;oskClose(true);if(i&&document.activeElement!==i)try{i.focus();}catch(x){}}},true);
// (the box went away under it: its panel closed)
setInterval(()=>{if(OSK.open&&!oskBox())oskClose();},400);
