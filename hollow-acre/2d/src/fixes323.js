/* ================= t323 full screen stays full screen. A quick Esc must never leave it; only holding Esc down, the ✕ in the
   corner, the Display menu or F's partner keys do. Two ways it still went:
   - where the browser won't lock the Esc key (Firefox, Safari, some Chrome setups), one press of Esc left at once. Now, if full
     screen goes without the player asking (no ✕, no menu, no Esc held down), it comes back with the very next click or key.
     Holding Esc still leaves for good: we see the key still down after the browser lets go, and don't bring it back;
   - an update loaded in the middle of play reloads the page, and a reload always drops full screen. Now, in full screen, a new
     version waits for the night (it loads while you sleep), and after any update reload full screen comes back with the
     first click or key. ================= */
const FS3={intent:0,escDown:0,escRep:0,back:false,told:false,exitAt:0};
// the ways a player means to leave: the ✕, the menu's full-screen button, the Display menu's "window"
document.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('#fsX,#fsBtn');if(t&&fsOn())FS3.intent=performance.now();},true);
{const _t=fsToggle;fsToggle=function(){if(fsOn())FS3.intent=performance.now();return _t.apply(this,arguments);};}
if(typeof dispSetMode==='function'){const _d=dispSetMode;dispSetMode=function(m){if(m==='window')FS3.intent=performance.now();return _d.apply(this,arguments);};}
addEventListener('keydown',e=>{if(e.key!=='Escape')return;const now=performance.now();if(!FS3.escDown)FS3.escDown=now;if(e.repeat)FS3.escRep=now;
  // still holding Esc after full screen went: the player meant it
  if(FS3.back&&now-FS3.exitAt<2500&&e.repeat){FS3.back=false;}},true);
addEventListener('keyup',e=>{if(e.key==='Escape')FS3.escDown=0;},true);
function fs3Changed(){const now=performance.now();
  if(fsOn()){FS3.back=false;try{sessionStorage.removeItem('hollowFsBack');}catch(e){}return;}
  FS3.exitAt=now;
  const meant=now-FS3.intent<2000||(FS3.escRep&&now-FS3.escRep<1500)||(FS3.escDown&&now-FS3.escDown>900);
  if(meant)return;
  FS3.back=true;
  if(!FS3.told&&matchMedia('(pointer:fine)').matches){FS3.told=true;setTimeout(()=>{if(FS3.back&&!fsOn())toast('Full screen comes back with your next click. To leave it, hold Esc down or click ✕.',3.6);},250);}}
document.addEventListener('fullscreenchange',fs3Changed);document.addEventListener('webkitfullscreenchange',fs3Changed);
// the next click or key (not Esc itself) puts it back
function fs3Again(e){if(!FS3.back||fsOn())return;if(e&&e.type==='keydown'&&(e.key==='Escape'||e.repeat))return;
  if(e&&e.target&&e.target.closest&&e.target.closest('#fsBtn,#dispPick'))return;
  FS3.back=false;try{const el=document.documentElement;const p=(el.requestFullscreen||el.webkitRequestFullscreen).call(el,{navigationUI:'hide'});if(p&&p.catch)p.catch(()=>{});}catch(x){}}
addEventListener('pointerdown',fs3Again,true);addEventListener('keydown',fs3Again,true);
// after an update reload: full screen was on before, so it comes back with the first click or key
try{if(sessionStorage.getItem('hollowFsBack')==='1'){sessionStorage.removeItem('hollowFsBack');FS3.back=true;}}catch(e){}
addEventListener('pagehide',()=>{try{if(fsOn())sessionStorage.setItem('hollowFsBack','1');}catch(e){}});
// an update found while you play in full screen waits for the night
const FS3U={pend:null,told:false};
if(!/claude\.ai|claudeusercontent/.test(location.hostname)){
  const _fetch=window.fetch;
  // the update check asks for version.json; while full screen and playing, hold the answer back and remember it for the night
  window.fetch=function(u,o){const s=String(u&&u.url||u);
    if(/version\.json/.test(s)&&fsOn()&&S&&(S.mode==='play'||S.mode==='trans'||S.mode==='scare'))
      return _fetch.apply(this,arguments).then(r=>r.clone().json().then(v=>{if(v&&v.id&&v.id!==BUILD_ID){FS3U.pend=v.id;
          if(!FS3U.told){FS3U.told=true;toast('A new version of the game is ready. It loads tonight, while you sleep.',3.4);}}
        return new Response(JSON.stringify({id:BUILD_ID}),{status:200,headers:{'Content-Type':'application/json'}});}).catch(()=>r));
    return _fetch.apply(this,arguments);};
  const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);
    if(FS3U.pend){const id=FS3U.pend;FS3U.pend=null;setTimeout(()=>{try{flushSave&&flushSave();}catch(e){}
      try{sessionStorage.setItem('hollowAutoCont','update');sessionStorage.setItem('hollowUpd',id);if(fsOn())sessionStorage.setItem('hollowFsBack','1');}catch(e){}
      const u=new URL(location.href);u.searchParams.set('v',id);location.replace(u.toString());},2600);}
    return r;};}
