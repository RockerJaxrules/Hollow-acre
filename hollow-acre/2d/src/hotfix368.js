// ================================================================ t368 hotfix: full-screen pages keep their own way back. The title, the
// character creator ("Who is driving") and "Play with friends" fill the window by design, so the popup guard (settings367.js, pop7Fit)
// gave them an extra close button. Closing with it hid the page and left a blank screen with no way on (the pad's B pressed it too,
// before the page's own Back). They are steps of starting the game, not popups: the guard leaves them without one.
if(typeof pop7Fit==='function'){const _pf=pop7Fit;pop7Fit=function(){const sc=document.querySelectorAll('.screen,#creator,#mpScr');for(const c of sc)c._p7x=true;
  const r=_pf.apply(this,arguments);for(const c of sc){const x=c.querySelector(':scope>.pop7x');if(x)x.remove();}return r;};}
