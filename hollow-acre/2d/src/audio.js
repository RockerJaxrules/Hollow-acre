/* ================= audio ================= */
const A={ctx:null,ok:false};
A.init=function(){if(A.ctx){A.ctx.resume&&A.ctx.resume();return;}
  try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}
  try{const C=window.AudioContext||window.webkitAudioContext;A.ctx=new C();}catch(e){return;}
  const c=A.ctx;A.ok=true;A.master=c.createGain();A.master.gain.value=.9;const comp=c.createDynamicsCompressor();A.master.connect(comp);comp.connect(c.destination);
  const len=c.sampleRate*2,nb=c.createBuffer(1,len,c.sampleRate),d=nb.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;A.noise=nb;
  const ir=c.createBuffer(2,c.sampleRate*3,c.sampleRate);for(let ch=0;ch<2;ch++){const x=ir.getChannelData(ch);for(let i=0;i<x.length;i++)x[i]=(Math.random()*2-1)*Math.pow(1-i/x.length,3);}
  A.verb=c.createConvolver();A.verb.buffer=ir;const vg=c.createGain();vg.gain.value=.45;A.verb.connect(vg);vg.connect(A.master);
  const loop=(type,f,q,gain)=>{const s=c.createBufferSource();s.buffer=nb;s.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=c.createGain();g.gain.value=gain;s.connect(fl);fl.connect(g);g.connect(A.master);s.start(0,Math.random());return {g,fl};};
  const w=loop('bandpass',420,.7,.05);A.wind=w.g;const lfo=c.createOscillator();lfo.frequency.value=.06;const lg=c.createGain();lg.gain.value=220;lfo.connect(lg);lg.connect(w.fl.frequency);lfo.start();
  A.rain=loop('highpass',2200,.5,0).g;A.rainLow=loop('lowpass',500,.5,0).g;
  A.drone=c.createGain();A.drone.gain.value=0;const df=c.createBiquadFilter();df.type='lowpass';df.frequency.value=190;df.connect(A.drone);A.drone.connect(A.master);A.drone.connect(A.verb);
  for(const f of[43.6,44.1,65.4,92.5]){const o=c.createOscillator();o.type=f>60?'sine':'sawtooth';o.frequency.value=f;const og=c.createGain();og.gain.value=f>90?.15:f>60?.5:.35;o.connect(og);og.connect(df);o.start();}
  const dl=c.createOscillator();dl.frequency.value=.11;const dlg=c.createGain();dlg.gain.value=60;dl.connect(dlg);dlg.connect(df.frequency);dl.start();
  A.tense=c.createGain();A.tense.gain.value=0;A.tense.connect(A.master);A.tense.connect(A.verb);const tf=c.createBiquadFilter();tf.type='bandpass';tf.frequency.value=1400;tf.Q.value=4;tf.connect(A.tense);
  for(const f of[1396,1480]){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=f;const vib=c.createOscillator();vib.frequency.value=5.5+Math.random();const vg2=c.createGain();vg2.gain.value=9;vib.connect(vg2);vg2.connect(o.frequency);vib.start();o.connect(tf);o.start();}
};
function A_out(pan,verb){const c=A.ctx;if(pan!==undefined&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=clamp(pan,-1,1);p.connect(A.master);if(verb)p.connect(A.verb);return p;}
  if(verb){const g=c.createGain();g.connect(A.master);g.connect(A.verb);return g;}return A.master;}
A.tone=function(f,dur,type,vol,o){if(!A.ok)return;o=o||{};const c=A.ctx,t=c.currentTime+(o.delay||0);const osc=c.createOscillator(),g=c.createGain();osc.type=type||'sine';
  osc.frequency.setValueAtTime(f,t);if(o.slide)osc.frequency.exponentialRampToValueAtTime(o.slide,t+(o.slideT||dur));if(o.detune)osc.detune.value=o.detune;
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+(o.a||.01));g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  let dst=A_out(o.pan,o.verb);if(o.filter){const fl=c.createBiquadFilter();fl.type=o.filter[0];fl.frequency.value=o.filter[1];fl.Q.value=o.filter[2]||1;fl.connect(dst);dst=fl;}
  osc.connect(g);g.connect(dst);osc.start(t);osc.stop(t+dur+.05);};
A.hiss=function(dur,vol,type,freq,o){if(!A.ok)return;o=o||{};const c=A.ctx,t=c.currentTime+(o.delay||0);const s=c.createBufferSource();s.buffer=A.noise;
  const fl=c.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(freq,t);if(o.slide)fl.frequency.exponentialRampToValueAtTime(o.slide,t+dur);fl.Q.value=o.q||1;
  const g=c.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+(o.a||.01));
  if(o.wobble){for(let k=1;k<12;k++)g.gain.setValueAtTime(vol*(.2+Math.random()*.8),t+dur*k/12);}
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(fl);fl.connect(g);g.connect(A_out(o.pan,o.verb));s.start(t,Math.random()*1.5);s.stop(t+dur+.05);};
const SFX={
  engine(on){if(!A.ok)return;const c=A.ctx;if(on){if(A.eng)return;const g=c.createGain();g.gain.value=0;g.gain.setTargetAtTime(.07,c.currentTime,.3);const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=240;f.connect(g);g.connect(A.master);
    const o1=c.createOscillator();o1.type='sawtooth';o1.frequency.value=46;const o2=c.createOscillator();o2.type='square';o2.frequency.value=92.6;const og=c.createGain();og.gain.value=.3;o1.connect(f);o2.connect(og);og.connect(f);o1.start();o2.start();A.eng={g,o1,o2};}
    else if(A.eng){const e=A.eng;A.eng=null;e.g.gain.setTargetAtTime(0,c.currentTime,.15);setTimeout(()=>{try{e.o1.stop();e.o2.stop();}catch(_){}},800);}},
  engineStart(){A.tone(60,1.2,'sawtooth',.12,{slide:90,filter:['lowpass',300]});A.hiss(.8,.1,'lowpass',400);},
  screech(){A.tone(1800,1,'sawtooth',.08,{slide:1300,filter:['bandpass',2000,4]});A.hiss(1,.18,'bandpass',3000,{q:3});},
  crash(){A.hiss(1.4,.7,'lowpass',900,{slide:120,a:.005});A.tone(55,1.6,'sine',.8,{slide:25});A.hiss(.9,.35,'highpass',4000,{a:.005,delay:.05});for(let i=0;i<6;i++)A.tone(3000+Math.random()*3000,.25,'sine',.04,{delay:.1+Math.random()*.5});},
  scrape(){A.hiss(.8,.12,'bandpass',3200,{slide:1800,q:6,a:.02,wobble:true});A.tone(2600,.8,'sawtooth',.02,{slide:1900,filter:['bandpass',2400,8]});},
  bang(){A.hiss(.3,.7,'lowpass',700,{a:.002});A.tone(90,.45,'sine',.7,{slide:40});A.hiss(.25,.2,'highpass',3500,{a:.002,delay:.02});},
  tinnitus(){A.tone(3900,6,'sine',.03,{a:.05});},
  ring(pan,v){for(let i=0;i<2;i++){A.tone(440,.4,'sine',.05*v,{delay:i*.55,pan});A.tone(480,.4,'sine',.05*v,{delay:i*.55,pan});}},
  horn(){A.tone(392,2,'square',.06,{filter:['lowpass',1200]});A.tone(466,2,'square',.05,{filter:['lowpass',1200]});},
  meow(pan){A.tone(700,.45,'sawtooth',.035,{slide:500,pan,filter:['bandpass',1200,3]});},
  splash(v){A.hiss(.4,.15*(v||1),'bandpass',900,{slide:300,q:1.5});},
  step(corn){A.hiss(corn?.16:.07,corn?.09:.05,corn?'bandpass':'lowpass',corn?2600:650+Math.random()*300,{q:corn?1.5:1});},
  till(){A.hiss(.18,.22,'lowpass',380);A.tone(95,.2,'sine',.25,{slide:55});},
  plant(){A.hiss(.1,.08,'lowpass',900);A.tone(520,.12,'triangle',.05,{slide:700});},
  water(){A.hiss(.6,.12,'bandpass',1800,{slide:900,q:2,a:.05});},
  harvest(){A.tone(300,.16,'sine',.18,{slide:820});A.hiss(.08,.08,'highpass',2000);},
  coin(){A.tone(1320,.18,'square',.05,{filter:['lowpass',3000]});A.tone(1760,.35,'square',.05,{delay:.08,filter:['lowpass',3000]});},
  refill(){for(let i=0;i<5;i++)A.tone(180+Math.random()*200,.12,'sine',.08,{delay:i*.08,slide:400+Math.random()*300});A.hiss(.6,.06,'bandpass',600,{q:3});},
  deny(){A.tone(140,.15,'square',.04,{filter:['lowpass',800]});},
  page(){A.hiss(.35,.08,'highpass',3000);A.tone(660,1.6,'sine',.04,{verb:true});},
  bell(){for(let r=0;r<3;r++)for(const [f,v,d] of[[196,.22,5],[196*2.76,.09,3.5],[196*5.4,.05,2],[98,.14,5]])A.tone(f,d,'sine',v,{verb:true,a:.005,delay:r*2.2});},
  stinger(){for(const f of[1180,1252,1330,1405])A.tone(f,1.4,'sawtooth',.05,{a:.03,verb:true,filter:['bandpass',1300,3],detune:(Math.random()-.5)*30});A.tone(48,1.2,'sine',.55,{slide:30});A.hiss(.5,.2,'lowpass',300,{a:.01});},
  shriek(pan){A.tone(900,.8,'sawtooth',.1,{slide:260,pan,verb:true,filter:['bandpass',1100,2]});A.hiss(.7,.14,'bandpass',2600,{q:4,pan,verb:true});},
  whisper(pan){A.hiss(1.4,.1,'bandpass',2300+Math.random()*900,{q:7,wobble:true,pan,verb:true,a:.2});},
  breath(pan){A.hiss(1.1,.09,'bandpass',700,{q:2,a:.5,pan});A.hiss(.9,.06,'bandpass',1100,{q:2,a:.3,pan,delay:1.2});},
  thud(pan,v){A.tone(70,.18,'sine',v,{slide:40,pan});A.hiss(.08,v*.5,'lowpass',400,{pan});},
  scream(){A.tone(320,1.4,'sawtooth',.38,{slide:1500,slideT:.18,filter:['lowpass',4000]});A.tone(330,1.4,'sawtooth',.32,{slide:1210,slideT:.2,detune:40});A.hiss(1.2,.45,'highpass',900,{a:.02});A.tone(40,1.2,'sine',.6);},
  heart(v){A.tone(58,.22,'sine',v,{slide:34});A.tone(52,.22,'sine',v*.7,{delay:.18,slide:32});},
  caw(pan){A.tone(640,.2,'sawtooth',.07,{slide:430,pan,filter:['bandpass',1300,2]});A.tone(600,.22,'sawtooth',.06,{delay:.28,slide:420,pan,filter:['bandpass',1300,2]});},
  cricket(pan){for(let i=0;i<3;i++)A.tone(4300+Math.random()*200,.04,'sine',.012,{delay:i*.07,pan});},
  ignite(){A.hiss(.7,.2,'bandpass',700,{slide:2400,q:1.5,a:.15,verb:true});A.tone(110,1.6,'sine',.2,{verb:true});},
  sputter(){for(let i=0;i<5;i++)A.hiss(.04,.08,'bandpass',1500+Math.random()*1500,{delay:i*.1+Math.random()*.05,q:2});},
  thunder(){A.hiss(3.5,.5,'lowpass',260,{slide:60,a:.03,verb:true});A.tone(38,2.5,'sine',.45,{slide:26});},
  boom(){A.tone(60,3,'sine',.6,{slide:28});A.hiss(3,.25,'lowpass',500,{slide:80,verb:true,a:.05});},
  note(f,v,night){A.tone(f,night?2.8:1.6,'triangle',v,{verb:true,a:.01,detune:night?(Math.random()-.5)*45:0});A.tone(f*2,1,'sine',v*.3,{verb:true});},
  face(){A.tone(2200,.6,'sine',.05,{slide:1900,verb:true});A.hiss(.4,.06,'highpass',4000,{verb:true});},
};

