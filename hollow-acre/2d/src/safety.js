/* ================= a safety net: no fade or transition is ever allowed to leave the screen black. Every real transition in the
   game finishes within a few seconds; if one doesn't (a bug, an error in a callback), the game recovers by itself. ================= */
{let transSince=0,blackSince=0;
  setInterval(()=>{const now=performance.now();const f=$('fade');const op=f?+getComputedStyle(f).opacity:0;
    if(S.mode==='trans'){if(!transSince)transSince=now;if(now-transSince>9000){transSince=0;S.mode='play';fade(0);if(typeof M!=='undefined'){M.blackout=false;if(M.v<=0)M.v=35;}toast('You come to. Something kept your place.',3,true);}}
    else transSince=0;
    if(S.mode==='play'&&op>.9&&!S.paused){if(!blackSince)blackSince=now;if(now-blackSince>3000){blackSince=0;fade(0);}}else blackSince=0;},500);}
