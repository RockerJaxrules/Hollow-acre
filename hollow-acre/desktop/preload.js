// Runs in the game's page before its own scripts, in a separate world (contextIsolation). It gives the game a way to size the
// window and go full screen (the Display setting, #273), moves the old app's saves over on the first start, and shows the app's
// small notices (an update ready, playing offline). None of it is offered to any page but the game's own.
const {contextBridge,ipcRenderer}=require('electron');
const SITE='https://rockerjaxrules.github.io',SITE_PATH='/Hollow-acre/';
if(location.origin===SITE&&location.pathname.startsWith(SITE_PATH)){
  // ---- the old app's saves, written before the game reads its storage (a key the game already has is left alone)
  try{const old=ipcRenderer.sendSync('hd:migrate');
    if(old&&typeof old==='object'){let written=0,skipped=0;
      for(const [k,v] of Object.entries(old)){if(typeof v!=='string')continue;if(localStorage.getItem(k)===null){localStorage.setItem(k,v);written++;}else skipped++;}
      ipcRenderer.send('hd:migrated',{written,skipped});}}
  catch(e){try{ipcRenderer.send('hd:migrated',{error:String(e&&e.message||e)});}catch(x){}}

  contextBridge.exposeInMainWorld('hollowDesktop',{
    info:()=>ipcRenderer.invoke('hd:info'),                  // {w,h,sf,deck,app,offline}: the screen in physical pixels, Windows/Mac scaling, a Steam Deck?
    setWindow:(w,h)=>ipcRenderer.invoke('hd:setWindow',+w,+h), // a window of w x h physical pixels (kept inside the screen)
    setFullScreen:on=>ipcRenderer.invoke('hd:full',!!on)
  });

  // ---- the notice: a small bar at the top of the screen, in the game's own letters, over everything and catching its own clicks
  let host=null,root=null,timer=null,place=null;
  // just under the game's top-centre HUD (the day's objective) when it's on screen, so the notice never covers it; else at the top
  const topY=()=>{try{const c=document.getElementById('hudC');if(c){const r=c.getBoundingClientRect();if(r.height>0&&r.bottom<innerHeight/3)return Math.round(r.bottom)+10;}}catch(e){}return 12;};
  const CSS=`:host{all:initial}
.n{position:fixed;z-index:2147483647;left:50%;top:12px;transform:translateX(-50%);width:max-content;max-width:calc(100vw - 32px);box-sizing:border-box;display:flex;flex-wrap:wrap;
  align-items:center;justify-content:center;gap:6px 14px;padding:7px 14px 8px;background:rgba(12,9,14,.95);border:2px solid #b8742c;box-shadow:0 0 0 2px #000,4px 4px 0 2px #0008;color:#e8dcc0;
  font-family:'Hollow Pixel',ui-monospace,monospace;font-size:17px;line-height:1.3;text-shadow:2px 2px 0 #000;animation:in .35s steps(4)}
.t{color:#f0a040}.s{flex-basis:100%;text-align:center;font-size:15px;color:#cdbf9f}.b{display:flex;gap:10px}
button{font:inherit;font-size:16px;color:#e8dcc0;background:#2a1e18;border:2px solid #6a4a2a;padding:4px 12px;cursor:pointer;text-shadow:inherit}
button:hover,button:focus-visible{background:#4a2e1a;border-color:#f0a040;outline:none}
@keyframes in{from{opacity:0;transform:translate(-50%,-8px)}to{opacity:1;transform:translateX(-50%)}}`;
  // one at a time, each shown once the game's loading screen has gone (a notice under it would time out unseen)
  const Q=[];let cur=null;
  function hide(){if(host){host.remove();host=null;root=null;}clearTimeout(timer);clearInterval(place);cur=null;setTimeout(pump,300);}
  function show(n){if(cur&&cur.id===n.id){hide();Q.unshift(n);return;}const k=Q.findIndex(q=>q.id===n.id);if(k>=0)Q[k]=n;else Q.push(n);pump();}
  function pump(){if(cur||!Q.length)return;if(!document.body||document.getElementById('loadScr')){clearTimeout(pump.t);pump.t=setTimeout(pump,400);return;}
    const n=cur=Q.shift();host=document.createElement('hollow-desktop-notice');root=host.attachShadow({mode:'closed'});
    for(const t of ['pointerdown','pointerup','mousedown','mouseup','click','dblclick','touchstart','touchend','wheel','contextmenu'])host.addEventListener(t,e=>e.stopPropagation());
    const st=document.createElement('style');st.textContent=CSS;root.appendChild(st);
    const box=document.createElement('div');box.className='n';box.setAttribute('role','status');
    const t=document.createElement('div');t.className='t';t.textContent=String(n.text||'');box.appendChild(t);
    if(n.sub){const s=document.createElement('div');s.className='s';s.textContent=String(n.sub);box.appendChild(s);}
    if(Array.isArray(n.btn)&&n.btn.length){const b=document.createElement('div');b.className='b';
      for(const [label,act] of n.btn){const x=document.createElement('button');x.textContent=String(label);
        x.addEventListener('click',()=>{hide();ipcRenderer.invoke('hd:notice',String(act)).catch(()=>{});});b.appendChild(x);}box.appendChild(b);}
    root.appendChild(box);document.documentElement.appendChild(host);
    let y=-1;const at=()=>{const v=topY();if(v!==y){y=v;box.style.top=v+'px';}};at();place=setInterval(at,500);   // (the HUD comes and goes: follow it, writing only on a change)
    if(n.ms)timer=setTimeout(hide,+n.ms);}
  ipcRenderer.on('hd:notice',(e,n)=>{if(n&&typeof n==='object')show(n);});
  const ready=()=>ipcRenderer.send('hd:ready');if(document.readyState==='loading')addEventListener('DOMContentLoaded',ready,{once:true});else ready();
}
