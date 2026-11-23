// ================================================================ t307: sound on a controller (owner, on a Steam Deck: "I didn't see any sound coming in
// for the game"). The game's audio only started from a click, a tap or a key (A.init in their handlers); a pad press reaches the game
// as made-up clicks, which a browser does not count as the player's own, so a game played only on the pad could stay silent.
//  - the desktop app (Windows, Linux, the Deck) may start sound without a click: it starts it as soon as the game has loaded;
//  - any pad button wakes the sound (and starts it, where the app or the browser allows);
//  - if the sound is still asleep while the screen is in front (a background mute came undone, the Deck's overlay, a lost focus),
//    it is woken again; "Mute in the background" still silences it while the game is hidden;
//  - in a browser that keeps it blocked until a real touch or key, one short line says so, once.
// "Sound off" (the speaker button) is always obeyed: A.init itself does nothing then (sound.js).
const PS7={app:false,told:false,pressed:0};
try{PS7.app=!!(window.hollowDesktop&&hollowDesktop.info);}catch(e){}
function ps7Off(){try{return sndMode()==='off';}catch(e){return false;}}
function ps7Wake(){if(ps7Off()||document.hidden)return;try{A.init&&A.init();const c=A.ctx;if(c&&c.state!=='running'&&c.resume)c.resume().catch(()=>{});}catch(e){}}
// the app: start the sound once the game is up (the loading screen gone)
if(PS7.app){const go=()=>{if(document.getElementById('loadScr')){setTimeout(go,500);return;}ps7Wake();};setTimeout(go,300);}
// the pad: watch the buttons (only while the sound is not yet running, so it costs nothing once it plays)
setInterval(()=>{const c=A.ctx;if(c&&c.state==='running')return;if(ps7Off()||document.hidden)return;
  let pads=[];try{pads=navigator.getGamepads?[...navigator.getGamepads()]:[];}catch(e){}
  let down=false;for(const p of pads){if(!p||!p.connected)continue;for(const b of p.buttons)if(b&&(b.pressed||b.value>.5)){down=true;break;}if(down)break;}
  if(!down)return;ps7Wake();PS7.pressed++;
  // a browser holding the sound back until a real touch or key: say so once, after a few presses that did not wake it
  if(!PS7.told&&!PS7.app&&PS7.pressed>=3)setTimeout(()=>{const k=A.ctx;if(PS7.told||ps7Off()||(k&&k.state==='running'))return;PS7.told=true;
    try{toast('No sound yet? Tap the screen or press any key once: the browser holds sound back until you do.',6);}catch(e){}},700);},250);
// asleep while in front: wake it (every two seconds, only when it should be playing)
setInterval(()=>{const c=A.ctx;if(!c||c.state==='running'||c.state==='closed'||document.hidden||ps7Off())return;
  if(PS7.app||(navigator.userActivation&&navigator.userActivation.hasBeenActive))try{c.resume().catch(()=>{});}catch(e){}},2000);
// back in front after being hidden or unfocused: wake it at once
addEventListener('focus',()=>{if(A.ctx)ps7Wake();});addEventListener('pageshow',()=>{if(A.ctx)ps7Wake();});
