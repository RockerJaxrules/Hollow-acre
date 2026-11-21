/* ================= t363: the making games polished: the sounds. Loaded last.
   Every action sound is built in layers (a short transient, a body, a ring or a tail), and no two repeats are the same: each
   call of a work sound is nudged a little in pitch (about 3%) and weight (about 12%) as a whole, so its layers stay in tune with
   each other. The stings (good, perfect, miss, the fanfare) keep their notes and only vary in weight. While a game is up, the
   world's wind, rain and drone are turned down under the room's own quiet sounds, and come back when you finish. All made in
   code; "Sound off" still silences all of it (A.tone and A.hiss do nothing then). ================= */
{let VP=1,VV=1;const _t=A.tone,_h=A.hiss;
  A.tone=function(f,dur,type,vol,o){if(VP===1&&VV===1)return _t.apply(this,arguments);o=o?Object.assign({},o):{};if(o.slide)o.slide*=VP;if(o.filter)o.filter=[o.filter[0],o.filter[1]*VP,o.filter[2]];return _t.call(this,f*VP,dur,type,vol*VV,o);};
  A.hiss=function(dur,vol,type,freq,o){if(VP===1&&VV===1)return _h.apply(this,arguments);o=o?Object.assign({},o):{};if(o.slide)o.slide*=VP;return _h.call(this,dur,vol*VV,type,freq*VP,o);};
  const MUSIC=new Set(['good','perfect','fanfare','sparkle','tick','miss','ready','go']);
  // the mix, measured offline (the loudest 100 ms of each): the stings sit over the work, the saw's stroke (heard most often) up to
  // the other work sounds, the hammer's transient and the long steam hiss down, the fine clicks just audible
  const GAIN={saw:1.8,good:1.8,perfect:1.7,fanfare:1.5,miss:1.4,ratchet:1.5,ready:1.6,ovenDoor:2,cable:1.6,steam:.7,anvil:.85,hammer:.8};
  const wrap=k=>{const f=MS[k];if(typeof f!=='function'||f.__v)return;const w=function(){const p=VP,v=VV;VP=MUSIC.has(k)?1:1+(Math.random()*2-1)*.032;VV=(1+(Math.random()*2-1)*.12)*(GAIN[k]||1);try{return f.apply(this,arguments);}finally{VP=p;VV=v;}};w.__v=1;MS[k]=w;};
  // ---- the work sounds, reworked
  Object.assign(MS,{
    // the saw: the teeth rattle through the cut (a quick run of clicks) over a filtered rasp and the board's own low body; the push
    // bites deeper and brighter than the return
    saw(dir,k){k=k||1;const push=dir>0;const f0=push?2500:1700,f1=push?3500:1250,T=push?.17:.13;A.hiss(T,.13*k,'bandpass',f0,{q:2.4,slide:f1,wobble:1});A.hiss(T*.9,.05*k,'highpass',5000,{});
      const n=push?9:6;for(let i=0;i<n;i++)A.hiss(.012,(.05+.03*Math.random())*k,'bandpass',(push?3200:2400)+Math.random()*900,{q:4,delay:i*T/n});
      A.hiss(T,.07*k,'lowpass',420,{a:.03});},
    // a knife through something on a board: the bite, the board's hollow tock, a low thud under it
    chop(){A.hiss(.03,.3,'bandpass',2300,{q:1.2});A.tone(560,.05,'sine',.12,{slide:320,delay:.012});A.hiss(.04,.12,'lowpass',900,{delay:.01});A.tone(118,.11,'sine',.24,{slide:62,delay:.01});},
    crunch(){for(let k=0;k<3;k++)A.hiss(.03+Math.random()*.015,.14,'bandpass',900+Math.random()*1700,{q:2.2,delay:k*.022+Math.random()*.008});},
    // hot iron on the anvil: the hammer face's crack, then the anvil rings on, two partials beating a little against each other
    anvil(p){p=p||1;A.hiss(.02,.32,'highpass',4200);A.tone(160*p,.08,'sine',.16,{slide:90});[1,2.76,5.4,8.9].forEach((m,i)=>{A.tone(392*p*m,1.25-.26*i,'sine',.12/(i+1),{verb:1});if(i<2)A.tone(392*p*m*1.004,1-.2*i,'sine',.05/(i+1));});},
    // water hitting hot metal or a hot pan: a spit, a hiss that wobbles, a low puff
    sizzleHit(){A.hiss(.06,.16,'bandpass',2200,{q:1.5});A.hiss(.5,.18,'highpass',3200,{wobble:1,a:.02});A.hiss(.12,.08,'lowpass',600);},
    plop(){A.tone(500,.12,'sine',.17,{slide:150});A.hiss(.06,.05,'bandpass',1400,{q:2,delay:.03});},
    pop(){A.tone(820,.05,'sine',.14,{slide:380});A.hiss(.02,.06,'highpass',3000);},
    drip(){A.tone(1500,.07,'sine',.07,{slide:700});A.tone(2400,.03,'sine',.02,{delay:.02});},
    whoosh(){A.hiss(.28,.2,'bandpass',260,{slide:1300,q:.8,a:.04});},
    shave(){A.hiss(.22,.12,'bandpass',4200,{q:.7,slide:2400,wobble:1});A.hiss(.18,.04,'highpass',6000,{delay:.02});},
    snip(){A.hiss(.025,.22,'highpass',5200);A.tone(2600,.03,'square',.022);A.tone(3900,.02,'triangle',.02,{delay:.012});},
    rustle(){A.hiss(.13,.11,'bandpass',2600,{q:.6,wobble:1});A.hiss(.08,.05,'bandpass',900,{q:.8,delay:.03});},
    knock(){A.tone(220,.09,'sine',.2,{slide:120});A.hiss(.04,.13,'bandpass',1200,{q:1});},
    thunk(){A.tone(150,.16,'sine',.28,{slide:70});A.hiss(.06,.18,'lowpass',700);A.hiss(.12,.04,'bandpass',320,{q:4,delay:.01});},
    tink(p){p=p==null?.5:p;A.tone(1200+p*900,.18,'triangle',.07,{slide:900+p*600});A.tone(2900+p*600,.06,'sine',.04);A.hiss(.03,.16,'highpass',3500);},
    // a ratchet's pawl clicking over a tooth (the crank, the wrench)
    ratchet(){A.hiss(.012,.16,'bandpass',3600,{q:3});A.tone(1900,.018,'square',.02,{filter:['bandpass',2400,4]});A.hiss(.03,.05,'lowpass',700,{delay:.006});},
    // a glug in a pour: a short rising bubble
    glug(){const f=180+Math.random()*160;A.tone(f,.07,'sine',.07,{slide:f*1.9});},
      // the winch cable taking up a turn: a taut creak and a twang
    cable(){A.tone(120,.18,'sawtooth',.03,{slide:150,filter:['bandpass',600,6]});A.tone(880,.08,'triangle',.02,{slide:700,delay:.04});},
    // crust and embers: tiny dry pops, more of them and brighter the hotter it is
    crackle(h){h=h||.5;A.hiss(.012+Math.random()*.01,.05+.08*h,'bandpass',1600+Math.random()*2400,{q:3});},
    // the oven door swinging open, then the tray scraping out on the bars
    ovenDoor(){A.tone(180,.22,'sawtooth',.03,{slide:240,filter:['bandpass',500,5]});A.hiss(.25,.12,'bandpass',2600,{q:3,delay:.15,slide:1800});A.tone(1200,.06,'triangle',.04,{delay:.38});},
    // a pinch of pastry: a soft wet squish
    squish(){A.hiss(.07,.12,'lowpass',700,{slide:300});A.tone(230,.06,'sine',.07,{slide:150});},
    // seed pattering down through the riddle
    patter(){A.hiss(.008,.05+Math.random()*.04,'bandpass',3000+Math.random()*2500,{q:5});},
    // a spade of earth thrown over a vent
    dirt(){A.hiss(.16,.2,'lowpass',500,{slide:200});A.hiss(.08,.06,'bandpass',1800,{q:1.5,delay:.03});A.tone(90,.12,'sine',.12,{slide:60});},
    // striking a match: the scrape, the flare
    match(){A.hiss(.12,.22,'bandpass',3200,{q:1.5,slide:2200,wobble:1});A.hiss(.35,.16,'bandpass',900,{slide:2400,delay:.1,a:.04});A.tone(140,.3,'sine',.05,{delay:.1});},
    // a wick catching: a soft whump of flame
    flare(){A.hiss(.5,.16,'lowpass',700,{slide:1800,a:.06});A.tone(110,.5,'sine',.08,{a:.05});},
    // glass knocking the frame: a hard clink with a tick of a chip coming off
    glassKnock(){A.tone(2900,.12,'sine',.06,{slide:2700});A.tone(4300,.06,'sine',.03);A.hiss(.03,.12,'highpass',5000);A.tone(160,.06,'sine',.08,{slide:90});},
    // the cleaver through a joint: the bite, a wet give, the block under it
    cleave(){A.hiss(.03,.28,'bandpass',2000,{q:1.2});A.hiss(.1,.12,'lowpass',500,{slide:240,delay:.015});A.tone(140,.12,'sine',.24,{slide:60,delay:.012});A.tone(320,.05,'sine',.06,{slide:180,delay:.04});},
    // the start of every step: "Ready" a soft wooden tock, "Go!" a bright two-note call
    ready(){A.tone(660,.06,'triangle',.05);A.hiss(.02,.06,'bandpass',1800,{q:3});},
    go(){A.tone(880,.08,'triangle',.07);A.tone(1320,.16,'triangle',.06,{delay:.06});A.tone(2640,.1,'sine',.012,{delay:.06});},
  // the stings: a good one is two notes; a perfect is three with a shimmer; a miss is a dull wooden thock and a soft falling note
    good(){A.tone(784,.12,'triangle',.075);A.tone(1047,.16,'triangle',.065,{delay:.07});A.tone(2094,.1,'sine',.015,{delay:.07});},
    perfect(){A.tone(784,.1,'triangle',.075);A.tone(1047,.1,'triangle',.075,{delay:.06});A.tone(1568,.24,'triangle',.07,{delay:.12});A.tone(3136,.3,'sine',.02,{delay:.13,verb:1});A.hiss(.25,.025,'highpass',7000,{delay:.12});},
    miss(){A.tone(150,.2,'triangle',.11,{slide:92,filter:['lowpass',700]});A.hiss(.05,.1,'lowpass',500);},
    // the finish: notes up the chord by how well it went, a low root under them, and a bell over a beautiful piece
    fanfare(q){const n=q>.9?[523,659,784,1047]:q>.6?[523,659,784]:q>.35?[523,587,659]:[523,494];n.forEach((f,i)=>{A.tone(f,.3,'triangle',.075,{delay:i*.11});A.tone(f*2,.16,'sine',.015,{delay:i*.11});});
      A.tone(131,.6,'triangle',.06);if(q>.6)A.tone(196,.5,'sine',.04,{delay:n.length*.11});if(q>.9){A.tone(1568,.7,'sine',.05,{delay:.5,verb:1});A.tone(2093,.6,'sine',.03,{delay:.58,verb:1});}},
  });
  {let lastT=-1;const ev=()=>{if(VP!==1||VV!==1||typeof MG4==='undefined'||!MG4.on)return null;const n=performance.now();if(n-lastT>12){lastT=n;ev.p=1+(Math.random()*2-1)*.015;ev.v=1+(Math.random()*2-1)*.1;}return ev;};
    const t2=A.tone,h2=A.hiss;A.tone=function(f,dur,type,vol,o){const e=ev();if(!e)return t2.apply(this,arguments);VP=e.p;VV=e.v;try{return t2.call(this,f,dur,type,vol,o);}finally{VP=1;VV=1;}};
    A.hiss=function(dur,vol,type,freq,o){const e=ev();if(!e)return h2.apply(this,arguments);VP=e.p;VV=e.v;try{return h2.call(this,dur,vol,type,freq,o);}finally{VP=1;VV=1;}};}
  for(const k of Object.keys(MS))if(k!=='loop')wrap(k);
  // (anything added to MS later gets the same treatment the first time a game starts)
  const _run=mg4Run;mg4Run=function(){for(const k of Object.keys(MS))if(k!=='loop')wrap(k);
    // the world's wind, rain and night drone go quiet under the work; the game sets them again itself once you're back in it
    try{if(A.ok){const ct=A.ctx.currentTime;for(const n of [A.wind,A.rain,A.rainLow])if(n)n.gain.setTargetAtTime(Math.min(n.gain.value,.012),ct,.3);if(A.drone)A.drone.gain.setTargetAtTime(Math.min(A.drone.gain.value,.03),ct,.3);}}catch(e){}
    return _run.apply(this,arguments);};}
// the cast: the rod whips through the air and the line runs off the reel (the fishing games called for this sound; it was missing)
SFX.swing=SFX.swing||function(){A.hiss(.22,.16,'bandpass',300,{slide:1800,q:.9,a:.03});for(let i=0;i<10;i++)A.hiss(.008,.05*(1-i/12),'bandpass',3000+i*80,{q:4,delay:.08+i*.028});};
// the controller's hand over a making game is drawn in the picture, as your own pointing hand with its sleeve, instead of the flat
// cursor laid over the page (that one is kept, invisible, for anything that looks for it)
{const st=document.createElement('style');st.textContent='body.u37mg #gpHand{opacity:0!important}';document.head.appendChild(st);}
// (not where the tool itself is the pointer, the dent hammer's head and the caulk gun's nozzle, and not where one of your hands
// is already there holding something)
window.__mg4ptr=(K,I)=>{const fr=M4G.fr||[];if(typeof GP==='undefined'||GP.ctx!=='mg4'||!GP.hand||!GP.hand.on||typeof gpPadMode!=='function'||!gpPadMode())return;
  const cur=window.__mg4cur;if(cur&&/^(crDents|crSeal)$/.test(cur.__gpk||''))return;if(fr.some(([x,y])=>Math.hypot(x-I.x,y-I.y)<16))return;K.hand(I.x-3,I.y-1,!!I.down);};
// a phone on its side: the stage takes the height of the screen on the left, the title, the hint and Skip stand in a column to its
// right (stacked above and below, they left the stage at 390 px wide on an 844 x 390 phone; side by side it is half as big again)
{const st=document.createElement('style');st.textContent=`@media (max-height:500px) and (min-aspect-ratio:3/2){
#mg4 .box{display:grid!important;grid-template-columns:auto minmax(128px,200px);grid-template-rows:auto 1fr auto;align-items:center;justify-items:center;column-gap:12px;row-gap:8px;padding:10px 12px!important}
#mg4 .t{grid-column:2;grid-row:1;font-size:15px!important;padding:3px 10px!important;text-align:center}
#mg4 canvas{grid-column:1;grid-row:1/4;width:min(calc(100vw - 270px),calc((100vh - 44px)*16/9))!important}
#mg4 .h{grid-column:2;grid-row:2;font-size:13px!important;max-width:200px!important;padding:6px 8px!important}
#mg4 .row{grid-column:2;grid-row:3}}`;document.head.appendChild(st);}
