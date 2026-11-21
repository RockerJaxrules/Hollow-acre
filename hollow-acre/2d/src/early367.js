// t367: keys you've moved (Settings > Controls). This runs before anything else listens, so a key you've given an action is
// passed on as the key the game knows for that action, and a key you've taken an action away from does nothing; typing in a box
// is never changed. settings367.js fills in the map.
const KEY7={map:null,key:{}};
for(const t of ['keydown','keyup'])addEventListener(t,e=>{const m=KEY7.map;if(!m||e.__k7)return;const tg=e.target;if(tg&&/INPUT|TEXTAREA|SELECT/.test(tg.tagName||''))return;
  if(!Object.prototype.hasOwnProperty.call(m,e.code))return;const to=m[e.code];e.stopImmediatePropagation();e.preventDefault();
  try{if(e.isTrusted&&typeof gpSetMode==='function')gpSetMode('kb');}catch(x){}
  if(!to)return;const ev=new KeyboardEvent(t,{code:to,key:KEY7.key[to]||'',bubbles:true,cancelable:true,shiftKey:e.shiftKey,ctrlKey:e.ctrlKey,altKey:e.altKey,metaKey:e.metaKey,repeat:e.repeat});
  ev.__k7=true;(tg&&tg.dispatchEvent?tg:window).dispatchEvent(ev);},true);
