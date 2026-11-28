/* ================= t376: the making games' sounds, made the way the real things make them. All of it is synthesised here, in code.
   An impact is a struck body: a contact pulse (short for hard faces, long for soft ones, so a soft blow is duller by physics, not by a
   filter) driving a few modes at the material's own inharmonic ratios, each dying at its own rate. Crunch, tear, scrape, grit and
   rustle are grains of filtered noise. Liquids are bubbles (each a short tone that rises as it rushes up) and streams whose ring climbs
   as the vessel fills. Fire is crackle over a roar; steam is a hiss with the spit of boiling in it. The continuous jobs (sawing,
   planing, stirring, pumping, cranking, grinding, brushing) are textures whose speed, weight and brightness follow your hand every frame.
   Each sound is drawn in a few variants and every play is nudged in pitch, weight and timing, so no two repeats are the same.
   Everything goes out through the game's own effects bus (Master and Effects volume, Sound off), and a phone keeps a cap on how many
   sounds play at once. The stings (good, perfect, miss, the finish) keep their notes and sit under the work. ================= */
const MSX={V:{},T:{},cache:{},lastV:{},live:[],G:1,K:'',room:.12};
{const rnd=(a,b)=>a+Math.random()*(b-a),jit=(x,a)=>x*(1+(Math.random()*2-1)*a),TAU=Math.PI*2;
  MSX.rnd=rnd;MSX.jit=jit;
  const ctx=()=>MSX._ctx||(A.ok&&A.ctx&&A.ctx.state!=='closed'?A.ctx:null);
  MSX.ok=()=>!!ctx();
  MSX.now=()=>{const c=ctx();return c?c.currentTime:0;};
  // ---------------------------------------------------------------- the DSP that draws a sound into an array
  // an RBJ biquad: lp, hp, bp (peak 0 dB) or pk (a resonator whose gain at f is g); .set() retunes it as it runs
  const bq=(type,f,Q,sr)=>{let b0,b1,b2,a1,a2,x1=0,x2=0,y1=0,y2=0;
    const set=(f2,Q2)=>{const w=TAU*Math.min(Math.max(f2,10),sr*.46)/sr,cs=Math.cos(w),al=Math.sin(w)/(2*(Q2||.707));let c0,c1,c2;
      if(type==='lp'){c0=(1-cs)/2;c1=1-cs;c2=c0;}else if(type==='hp'){c0=(1+cs)/2;c1=-(1+cs);c2=c0;}else{c0=al;c1=0;c2=-al;}
      const a0=1+al;b0=c0/a0;b1=c1/a0;b2=c2/a0;a1=-2*cs/a0;a2=(1-al)/a0;};
    set(f,Q);const F=x=>{const y=b0*x+b1*x1+b2*x2-a1*y1-a2*y2;x2=x1;x1=x;y2=y1;y1=y;return y;};F.set=set;return F;};
  const N=()=>Math.random()*2-1;
  MSX.dsp={bq,N};
  // a struck body. M = [[freq, amp, decay s], ...]; the contact lasts tc seconds (a raised-cosine pulse): the longer it is, the less the
  // high modes are excited, exactly as a soft or slow blow sounds duller. Modes above the pulse's reach are left out to save time
  const strike=(d,sr,t0,M,amp,tc)=>{const i0=Math.max(0,Math.round(t0*sr)),nc=Math.max(1,Math.round((tc||.0005)*sr));
    const p=new Float32Array(nc);let ps=0;for(let n=0;n<nc;n++){p[n]=Math.sin(Math.PI*(n+.5)/nc)**2;ps+=p[n];}
    for(const [f,a,tau] of M){if(f>sr*.45||a<=0)continue;const cut=1.5/(tc||.0005);if(f>cut*2.2)continue;
      const w=TAU*f/sr,r=Math.exp(-1/(Math.max(.002,tau)*sr)),c1=2*r*Math.cos(w),c2=r*r,g=a*amp*Math.sin(w)/ps;
      let y1=0,y2=0;const n1=Math.min(d.length-i0,Math.ceil(tau*sr*6.9)+nc);for(let n=0;n<n1;n++){const y=c1*y1-c2*y2+(n<nc?p[n]*g:0);y2=y1;y1=y;d[i0+n]+=y;}}};
  // noise shaped by an envelope and a filter (fn(u) gives the level over 0..1 of its length; F is a bq or a chain)
  const noise=(d,sr,t0,dur,amp,env,F,F2)=>{const i0=Math.max(0,Math.round(t0*sr)),n1=Math.min(d.length-i0,Math.round(dur*sr));for(let n=0;n<n1;n++){let x=N()*amp*env(n/n1,n/sr);if(F)x=F(x);if(F2)x=F2(x);d[i0+n]+=x;}};
  // grains: short bursts of noise, each through its own resonance, scattered in time (Poisson) at rate(u) per second over dur:
  // crunch, grit, crackle, patter, tear. o: rate(u), f(u) centre, q, len [s lo, hi], amp(u)
  const grains=(d,sr,t0,dur,o)=>{let t=0;const lenL=o.len||[.002,.008];for(let guard=0;guard<4000;guard++){const u=t/dur,rt=Math.max(1,o.rate(Math.min(1,u)));t+=-Math.log(1-Math.random()*.999)/rt;if(t>=dur)break;
      const uu=t/dur,f=o.f(uu),L=rnd(lenL[0],lenL[1]),a=o.amp(uu)*(o.even?rnd(.6,1):Math.pow(Math.random(),o.skew||1.6)),q=o.q||4,i0=Math.round((t0+t)*sr),n1=Math.min(d.length-i0,Math.round(L*sr)+Math.round(sr*q/(Math.PI*f)*3));
      if(n1<=0)continue;const F=bq('bp',f,q,sr),nl=Math.round(L*sr);for(let n=0;n<n1;n++){const w=n<nl?Math.exp(-4*n/nl):0;d[i0+n]+=F(N()*w)*a*(1+q*.15);}}};
  // a bubble in liquid (a Minnaert resonance): a tone that rises as the bubble rushes to the surface, gone in a few milliseconds for a
  // small one, longer for a big one. f in Hz; tau its decay; rise = how much it climbs over its life
  const bubble=(d,sr,t0,f,a,tau,rise)=>{const i0=Math.max(0,Math.round(t0*sr)),n1=Math.min(d.length-i0,Math.round(tau*sr*6));let ph=0;const ka=Math.round(sr*.0004);
    for(let n=0;n<n1;n++){const tt=n/sr;ph+=TAU*f*(1+(rise||0)*tt/tau)/sr;d[i0+n]+=a*Math.exp(-tt/tau)*Math.sin(ph)*(n<ka?n/ka:1);}};
  // a small room: a handful of early reflections and a short damped tail, mixed under the dry sound (size 1 ~ a 4 m room)
  const room=(d,sr,mix,size,damp)=>{if(!mix)return;size=size||1;const taps=[[.0071,.5],[.0113,-.42],[.0173,.36],[.0231,-.3],[.0317,.24],[.0419,-.19]];
    const y=new Float32Array(d.length),lp=bq('lp',damp||3200,.7,sr);for(const [dt,g] of taps){const k=Math.round(dt*size*sr);for(let n=k;n<d.length;n++)y[n]+=d[n-k]*g;}
    const k2=Math.round(.0293*size*sr),fb=.42;for(let n=k2;n<d.length;n++)y[n]+=y[n-k2]*fb;for(let n=0;n<d.length;n++)d[n]+=lp(y[n])*mix;};
  // the ends of a loop crossfaded so it runs without a seam
  const seam=(d,sr,xf)=>{const k=Math.round(xf*sr),L=d.length-k,o=new Float32Array(L);for(let n=0;n<L;n++)o[n]=d[n];for(let n=0;n<k;n++){const u=n/k;o[n]=d[n]*Math.sqrt(u)+d[L+n]*Math.sqrt(1-u);}return o;};
  MSX.dsp.strike=strike;MSX.dsp.noise=noise;MSX.dsp.grains=grains;MSX.dsp.bubble=bubble;MSX.dsp.room=room;
  // ---------------------------------------------------------------- materials: mode ratios, the lowest mode's decay, how much faster the
  // higher ones die (tau_i = dec / (1 + dk (r_i - 1))), how their levels fall off, and the noise of the contact itself
  MSX.MAT={
    oak:{r:[1,2.58,4.45,6.9],dec:.032,dk:1.1,ro:.55,nz:.35},           // hard wood: a dry knock, gone in a few tens of ms
    pine:{r:[1,2.37,3.98,6.1],dec:.024,dk:1.4,ro:.5,nz:.45},           // soft wood: lower, shorter, more of the contact noise
    board:{r:[1,1.62,2.71,4.2],dec:.06,dk:.9,ro:.6,nz:.3},             // a plank over a gap: hollow, a body that sounds a beat longer
    steel:{r:[1,2.756,5.404,8.933],dec:1.1,dk:.32,ro:.7,nz:.25},       // a bar or a tool: the free-free bar ratios, long ring
    anvil:{r:[1,1.47,2.12,2.98,3.9,5.1],dec:1.5,dk:.28,ro:.78,nz:.2},  // a heavy block: dense high modes, rings a long time
    iron:{r:[1,1.58,2.37,3.41],dec:.32,dk:.6,ro:.7,nz:.35},            // cast iron (a pan, a grate): short, thick ring
    brass:{r:[1,2.39,4.12,6.25],dec:.55,dk:.45,ro:.72,nz:.25},         // brass sheet: a warm, bright ring
    tin:{r:[1,1.59,2.14,2.31,2.65,3.16,3.7],dec:.14,dk:.55,ro:.88,nz:.4},// thin sheet metal: crowded plate modes, a hollow "tunk"
    glass:{r:[1,2.32,4.25,6.63],dec:.22,dk:.55,ro:.6,nz:.2},           // a pane or a bottle: high and clear
    ceramic:{r:[1,2.16,3.62,5.1],dec:.07,dk:.9,ro:.6,nz:.3},           // a clay bowl or crock
    stone:{r:[1,1.71,2.83,4.1],dec:.016,dk:1.6,ro:.45,nz:.7},          // brick, stone: almost all contact, a very short body
    wire:{r:[1,2.756,5.404],dec:.09,dk:.5,ro:.6,nz:.2}};               // a small ring of wire, a nail: tiny and high
  // modes for a body of material m at fundamental f: jittered a little each time (no two blows land on quite the same spot)
  MSX.modes=(m,f,o)=>{const M=MSX.MAT[m],out=[];o=o||{};for(let i=0;i<M.r.length;i++){const r=M.r[i]*(i?jit(1,.025):1);out.push([f*r,Math.pow(M.ro,i)*jit(1,.25)*(o.tilt?Math.pow(o.tilt,i):1),M.dec*(o.ring||1)/(1+M.dk*(r-1))*jit(1,.15)]);}return out;};
  // an impact on material m: f its lowest mode, tc the contact time (s), amp, plus the contact noise and an optional body (a low,
  // damped resonance of whatever the work is resting on: [f, tau, amp])
  MSX.hit=(d,sr,t0,m,f,amp,tc,o)=>{o=o||{};const M=MSX.MAT[m];strike(d,sr,t0,MSX.modes(m,f,o),amp,tc);
    const nz=(o.nz!=null?o.nz:M.nz)*amp;if(nz>0){const fc=Math.min(sr*.45,Math.max(300,1.2/Math.max(tc,.0002))),F=bq('hp',fc*.35,.7,sr),F2=bq('lp',fc*1.6,.7,sr),len=Math.max(.0015,tc*2.5)+.002;
      noise(d,sr,t0,len,nz,u=>Math.exp(-5*u),F,F2);}
    if(o.body)strike(d,sr,t0+.0005,[[o.body[0]*jit(1,.04),1,o.body[1]]],amp*(o.body[2]||.6),Math.max(tc,.003));};
  // ---------------------------------------------------------------- the buffer cache: each voice drawn in a few variants (lazily),
  // played back with a nudge of rate and level; the same variant is never played twice running
  const mkbuf=(sr,len,fn,p)=>{const c=ctx();if(!c)return null;const n=Math.max(1,Math.round(len*sr)),d=new Float32Array(n);fn(d,sr,p||{});
    {const k=Math.min(Math.round(.02*sr),Math.round(n*.15));for(let i=0;i<k;i++)d[n-1-i]*=i/k;}   // (never cut off mid-ring: the tail fades)
    let pk=0;for(let i=0;i<n;i++){const v=Math.abs(d[i]);if(v>pk)pk=v;}if(pk>.98){const k=.98/pk;for(let i=0;i<n;i++)d[i]*=k;}
    const b=c.createBuffer(1,n,sr);b.copyToChannel?b.copyToChannel(d,0):b.getChannelData(0).set(d);return b;};
  MSX.mkbuf=mkbuf;
  const SRATE=()=>{const c=ctx();return c?c.sampleRate:44100;};
  const NV=V=>MSX.phone()?Math.min(3,V.n||4):(V.n||4);
  MSX.buf=(name,key)=>{const V=MSX.V[name];if(!V)return null;const ck=name+'|'+(key==null?'':key),list=MSX.cache[ck]||(MSX.cache[ck]=[]),n=NV(V);
    let i;if(list.length<n){i=list.length;const sr=Math.round(SRATE()*(V.lo?.5:1));list.push(mkbuf(sr,V.len,V.make,Object.assign({k:key,i},V.p||{})));}
    else{i=(Math.random()*n)|0;if(i===MSX.lastV[ck])i=(i+1)%n;}MSX.lastV[ck]=i;return list[i];};
  // make every variant of the listed voices while the step's title is up, a little each frame (never one long stall), so the first blow
  // never waits for its sound to be drawn; anything still missing when it is needed is drawn there and then
  MSX.Q=[];let pumping=false;const pump=()=>{const t0=performance.now();while(MSX.Q.length&&performance.now()-t0<(MSX.phone()?5:8)){try{MSX.Q.shift()();}catch(e){}}
    if(MSX.Q.length)requestAnimationFrame(pump);else pumping=false;};
  MSX.prep=list=>{if(!MSX.ok())return;for(const it of list){const [name,keys]=Array.isArray(it)?it:[it,[null]];if(MSX.T[name]&&!MSX.V[name]){MSX.Q.push(()=>MSX.tex(name));continue;}const V=MSX.V[name];if(!V)continue;
      for(const key of keys){const ck=name+'|'+(key==null?'':key),l=MSX.cache[ck]||(MSX.cache[ck]=[]);const sr=Math.round(SRATE()*(V.lo?.5:1));
        for(let i=l.length;i<NV(V);i++)MSX.Q.push(()=>{if(l.length<NV(V))l.push(mkbuf(sr,V.len,V.make,Object.assign({k:key,i:l.length},V.p||{})));});}}
    if(!pumping&&MSX.Q.length){pumping=true;requestAnimationFrame(pump);}};
  // ---------------------------------------------------------------- playing: through the effects bus (A_out), counted, capped on a phone
  MSX.phone=()=>{try{return matchMedia('(pointer:coarse)').matches;}catch(e){return false;}};
  MSX.cap=()=>MSX.phone()?14:28;
  const reap=()=>{const c=ctx();if(!c)return;const now=c.currentTime;MSX.live=MSX.live.filter(s=>s.end>now);};
  const out=(pan)=>{if(MSX._dst)return MSX._dst;const r=A_out(pan);return r&&r.context&&r.context!==ctx()?A.master:r;};
  // MSX.play(name, key, {g gain, r rate, pan, dl delay (s), at (ctx time), pri 1 for a contact sound}). Returns the source (or null)
  MSX.play=(name,key,o)=>{const c=ctx();if(!c)return null;o=o||{};reap();const pri=o.pri==null?1:o.pri;
    if(MSX.live.length>=MSX.cap()){if(!pri)return null;const lo=MSX.live.find(s=>!s.pri);if(lo){try{lo.g.gain.setTargetAtTime(0,c.currentTime,.01);lo.src.stop(c.currentTime+.05);}catch(e){}MSX.live.splice(MSX.live.indexOf(lo),1);}}
    const b=MSX.buf(name,key);if(!b)return null;const V=MSX.V[name]||{};
    const s=c.createBufferSource();s.buffer=b;const r=(o.r||1)*jit(1,V.rj!=null?V.rj:.025);s.playbackRate.value=r;
    const g=c.createGain();g.gain.value=Math.max(0,(o.g==null?1:o.g)*(V.g||1)*MSX.G*jit(1,.1));s.connect(g);g.connect(out(o.pan));
    const at=o.at!=null?Math.max(c.currentTime,o.at):c.currentTime+(o.dl||0);s.start(at);const rec={src:s,g,pri,end:at+b.duration/r+.02};MSX.live.push(rec);
    if(MSX.onplay)try{MSX.onplay(name,key,at,o,b,r);}catch(e){}
    return s;};
  // ---------------------------------------------------------------- continuous textures: a loop drawn once (a few seconds of it, so it
  // never sounds like a loop), played through a filter; level, rate and brightness follow the hand every frame
  MSX.tex=name=>{const T=MSX.T[name];if(!T)return null;const ck='T|'+name;if(MSX.cache[ck])return MSX.cache[ck];const sr=Math.round(SRATE()*(T.lo?.5:1));
    const b=mkbuf(sr,(MSX.phone()?Math.max(1.8,T.len*.7):T.len)+.12,(d,sr2)=>{T.make(d,sr2);},{});if(!b)return null;const raw=b.getChannelData(0),s=seam(raw,sr,.12),c=ctx();const b2=c.createBuffer(1,s.length,sr);b2.getChannelData(0).set(s);return MSX.cache[ck]=b2;};
  // MSX.loop(name,{type,f,q}) -> {set(level, rate, f, q), stop()}: one source, one filter, one gain
  MSX.loop=(name,o)=>{const c=ctx();o=o||{};const nil={set(){},stop(){},on:false};if(!c)return nil;const b=MSX.tex(name);if(!b)return nil;
    const s=c.createBufferSource();s.buffer=b;s.loop=true;const T=MSX.T[name]||{};let fl=null;const g=c.createGain();g.gain.value=0;
    if(o.type||T.type){fl=c.createBiquadFilter();fl.type=o.type||T.type;fl.frequency.value=o.f||T.f||1000;fl.Q.value=o.q||T.q||.7;s.connect(fl);fl.connect(g);}else s.connect(g);
    g.connect(out(o.pan));s.start(c.currentTime,Math.random()*b.duration);let dead=false,lv=0;const base=(T.g||1);
    const ctl={on:true,set(v,r,f,q){if(dead)return;const t=c.currentTime,nv=Math.max(0,v||0)*base*MSX.G;if(Math.abs(nv-lv)>1e-4){g.gain.setTargetAtTime(nv,t,o.tc||.03);lv=nv;}
        if(r)s.playbackRate.setTargetAtTime(Math.max(.1,r),t,.04);if(fl&&f)fl.frequency.setTargetAtTime(Math.max(20,f),t,.04);if(fl&&q)fl.Q.setTargetAtTime(q,t,.05);},
      stop(){if(dead)return;dead=true;ctl.on=false;try{g.gain.setTargetAtTime(0,c.currentTime,.04);s.stop(c.currentTime+.3);}catch(e){}}};
    return ctl;};
  // a live friction voice (stick-slip: a bow, a squeak, a creak): a buzzy tone whose pitch wanders as the grip catches and lets go.
  // set(speed 0..1, pressure 0..1); the pitch follows the speed and the roughness the pressure
  MSX.fric=(o)=>{const c=ctx();const nil={set(){},stop(){}};if(!c)return nil;o=o||{};const os=c.createOscillator();os.type='sawtooth';const f0=o.f||300;os.frequency.value=f0;
    const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=o.bp||f0*3;bp.Q.value=o.q||2.5;const g=c.createGain();g.gain.value=0;
    const lfo=c.createBufferSource();lfo.buffer=MSX.tex('jitter');lfo.loop=true;const lg=c.createGain();lg.gain.value=f0*(o.wob||.06);lfo.connect(lg);lg.connect(os.frequency);
    os.connect(bp);bp.connect(g);g.connect(out(o.pan));os.start();lfo.start(c.currentTime,Math.random()*2);let dead=false;
    return {set(v,p){if(dead)return;const t=c.currentTime;g.gain.setTargetAtTime(Math.max(0,v)*(o.g||.05)*MSX.G,t,.025);os.frequency.setTargetAtTime(f0*(.75+.5*(p==null?.5:p)),t,.03);bp.frequency.setTargetAtTime((o.bp||f0*3)*(.8+.4*(p==null?.5:p)),t,.04);},
      stop(){if(dead)return;dead=true;try{g.gain.setTargetAtTime(0,c.currentTime,.03);os.stop(c.currentTime+.25);lfo.stop(c.currentTime+.25);}catch(e){}}};};
  // a frame clock for the steps: dt-free helpers keep their own state
  MSX.T.jitter={len:2.5,lo:1,make(d,sr){let v=0;const F=bq('lp',18,.7,sr);for(let n=0;n<d.length;n++){v=F(N());d[n]=v*30;}}};
}
// ---------------------------------------------------------------- the voices. Each is drawn into a buffer by make(d, sr, p) (p.k the key,
// p.i the variant); len its length in seconds, n how many variants, lo at half the sample rate (for low, dull sounds)
{const D=MSX.dsp,H=MSX.hit,S=D.strike,G=D.grains,B=D.bubble,Z=D.noise,R=D.room,bq=D.bq,N=D.N,rnd=MSX.rnd,jit=MSX.jit,M=MSX.modes;
  const V=(name,o)=>{MSX.V[name]=o;},T=(name,o)=>{MSX.T[name]=o;};
  const ex=u=>Math.exp(-6*u),hump=(a,b)=>u=>u<a?u/a:u<b?1:Math.max(0,1-(u-b)/(1-b));
  // ======== the forge
  // a blow on the anvil. key h0 (glowing) .. h3 (gone grey, a mistake). Hot iron is soft: the face sinks into it, the contact is long and
  // the blow is a heavy, warm "chank" with the anvil ringing under it. As it cools the contact shortens and the ring gets brighter and
  // harsher; struck cold, it clangs and the hammer bounces off it
  V('anvil',{len:1.5,n:3,make(d,sr,p){const h=+String(p.k).slice(1)||0,tc=[.0011,.00078,.00052,.00026][h],f=jit(1180,.03);
    S(d,sr,0,[[jit(150,.08),1,.05],[jit(320,.08),.45,.028]],[.62,.5,.36,.22][h],tc*2.2);Z(d,sr,0,.03,[.22,.18,.14,.1][h],ex,bq('lp',900,.7,sr));
    H(d,sr,.0004,'anvil',f,[.17,.23,.31,.4][h],tc,{ring:[.42,.58,.78,1][h],nz:.35});S(d,sr,0,M('steel',jit(2650,.04),{ring:.3}),[.04,.06,.09,.13][h],tc);
    if(h===3){const t2=rnd(.055,.085);H(d,sr,t2,'anvil',f*jit(1,.01),.16,.0003,{ring:.8});}
    R(d,sr,.2,1.2,2600);}});
  // the bar pushed into (or drawn out of) the coals: lumps of coke shifting under it, a breath of the fire
  V('coals',{len:.5,n:4,make(d,sr,p){const o=p.k==='out';G(d,sr,0,o?.18:.3,{rate:u=>o?260:200*(1-u)+40,f:()=>rnd(500,2600),q:3,len:[.002,.007],amp:u=>(o?.5:.6)*(1-u*.7)});
    Z(d,sr,0,.4,.07,hump(.15,.3),bq('lp',600,.7,sr));if(o)H(d,sr,.02,'steel',jit(1900,.05),.05,.0004,{ring:.25});R(d,sr,.15,1.2,2400);}});
  // the forge fire: a roar under 600 Hz that swells and gutters, with the coals crackling through it
  T('roar',{len:3.2,lo:1,g:1,make(d,sr){const F=bq('lp',420,.6,sr),F2=bq('hp',55,.7,sr);let sw=1,tg=1;for(let n=0;n<d.length;n++){if(n%400===0)tg=.55+Math.random()*.9;sw+=(tg-sw)*.004;d[n]=F2(F(N()))*sw*1.6;}
    G(d,sr,0,d.length/sr,{rate:()=>9,f:()=>rnd(900,3200),q:5,len:[.0008,.003],amp:()=>.5});}});
  T('crackle',{len:2.8,make(d,sr){let t=0;while(t<d.length/sr-.05){t+=-Math.log(1-Math.random())/14;const burst=Math.random()<.3?3+((Math.random()*4)|0):1;for(let k=0;k<burst;k++)G(d,sr,t+k*rnd(.004,.02),.004,{rate:()=>600,f:()=>rnd(1200,5200),q:6,len:[.0005,.002],amp:()=>rnd(.3,.9)});}}});
  // the bellows: the board comes down on the bag; the intake flap claps shut, air rushes out of the nozzle into the fire (a low
  // "whoomph" that rises as the bag empties fastest and falls away), the leather creaks, the boards meet with a soft wooden stop.
  // key = how full the bag was (0 half-empty .. 2 full)
  V('bellows',{len:.6,n:4,lo:1,make(d,sr,p){const k=+p.k||0,a=.3+.15*k,dur=.36;const F=bq('bp',300,.9,sr),F2=bq('lp',1400,.7,sr);const i1=Math.round(dur*sr);
    for(let n=0;n<i1;n++){const u=n/i1,e=(u<.18?u/.18:Math.pow(1-(u-.18)/.82,1.4)),fc=280+700*Math.sin(Math.min(1,u*1.3)*Math.PI*.9);if(n%32===0)F.set(fc,.9);d[n]+=F2(F(N()))*e*a*2.2;}
    H(d,sr,.002,'board',jit(150,.06),.18,.004,{nz:.15});S(d,sr,dur*.92,M('oak',jit(380,.05)),.16,.0025);
    {const f0=jit(170,.1);let ph=0;const n0=Math.round(.03*sr),n1=Math.round(.12*sr);for(let n=n0;n<n1;n++){const u=(n-n0)/(n1-n0);ph+=2*Math.PI*f0*(1+.4*u+.06*Math.sin(n*.013))/sr;d[n]+=(ph%(2*Math.PI)<1?.06:-.01)*Math.sin(Math.PI*u)*(.6+.4*Math.random());}}
    R(d,sr,.14,1.2,2200);}});
  // ...and as the bag fills again it draws a softer breath in through the flap
  V('bellowsIn',{len:.5,n:3,lo:1,make(d,sr){Z(d,sr,0,.42,.08,u=>Math.sin(Math.PI*u)**1.5,bq('bp',420,.8,sr),bq('lp',1200,.7,sr));S(d,sr,.4,M('pine',jit(300,.05)),.05,.004);}});
  // the brass sprayer's pump: the plunger's leather cup squeaks down the barrel, air is squeezed through the valve (a short chuff) and
  // the valve clicks shut
  V('pump',{len:.4,n:4,make(d,sr){Z(d,sr,0,.22,.12,hump(.2,.4),bq('bp',1200,1.2,sr));{const f0=jit(520,.08);let ph=0;const n1=Math.round(.16*sr);for(let n=0;n<n1;n++){const u=n/n1;ph+=2*Math.PI*f0*(1+.25*u+.08*Math.sin(n*.02))/sr;d[n]+=Math.sin(ph)*Math.sin(ph*2.01)*.07*Math.sin(Math.PI*u);}}
    H(d,sr,.24,'brass',jit(2200,.05),.07,.0003,{ring:.3});}});
  T('spray',{len:2.6,make(d,sr){const F=bq('hp',3200,.7,sr),F2=bq('lp',9000,.7,sr);for(let n=0;n<d.length;n++)d[n]=F2(F(N()))*.55;G(d,sr,0,d.length/sr,{rate:()=>220,f:()=>rnd(2500,7000),q:3,len:[.0006,.002],amp:()=>.6});}});
  // quenching: the glowing blade meets the water. A slap, then the violent tearing hiss of a steam film boiling off the steel, crackling
  // and roaring with bubbles; it dies down as the blade cools
  V('quench',{len:1.2,n:3,make(d,sr){Z(d,sr,0,.03,.5,ex,bq('bp',900,.8,sr));Z(d,sr,.005,1.15,.42,u=>(u<.04?u/.04:1)*Math.exp(-2.2*u),bq('hp',2200,.6,sr),bq('lp',10000,.7,sr));
    G(d,sr,.01,1,{rate:u=>900*(1-u)+80,f:()=>rnd(1800,6500),q:4,len:[.0005,.002],amp:u=>.55*(1-u)});
    for(let k=0;k<70;k++){const t=rnd(.02,.9);B(d,sr,t,rnd(250,900),rnd(.03,.09)*(1-t),rnd(.006,.02),.6);}R(d,sr,.16,1.1,3000);}});
  T('steam',{len:3,make(d,sr){const F=bq('hp',2600,.6,sr),F2=bq('lp',10000,.7,sr);for(let n=0;n<d.length;n++)d[n]=F2(F(N()))*.6;G(d,sr,0,d.length/sr,{rate:()=>420,f:()=>rnd(2200,7000),q:4,len:[.0005,.002],amp:()=>.6});}});
  T('boil',{len:3,lo:1,make(d,sr){let t=0;const L=d.length/sr-.05;while(t<L){t+=-Math.log(1-Math.random())/95;B(d,sr,t,rnd(160,700),rnd(.05,.22),rnd(.006,.022),rnd(.3,1.2));}
    const F=bq('lp',500,.7,sr);for(let n=0;n<d.length;n++)d[n]+=F(N())*.12;}});
  // water dripping back off the steel into the trough
  V('drip',{len:.12,n:5,make(d,sr){const f=rnd(900,1900);B(d,sr,.002,f,.22,rnd(.008,.014),1.4);B(d,sr,.012,f*2.3,.05,.004,.5);}});
  // the grindstone turning on its treadle: a low rumble that lifts once a turn where the stone is out of true, the treadle's knock
  T('wheel',{len:2.25,lo:1,make(d,sr){const F=bq('lp',260,.7,sr),L=d.length/sr;for(let n=0;n<d.length;n++){const t=n/sr;d[n]=F(N())*(.55+.35*Math.max(0,Math.sin(2*Math.PI*t/L*2))**3)*1.2;}
    for(const t of [.1,1.22])S(d,sr,t,M('pine',jit(210,.05)),.12,.006);}});
  // steel held to the wet sandstone: a dense gritty hiss; at the right angle it runs even, at the wrong one the edge skips and chatters
  T('grit',{len:2.6,make(d,sr){const F=bq('bp',3600,.7,sr);for(let n=0;n<d.length;n++)d[n]=F(N())*.6;G(d,sr,0,d.length/sr,{rate:()=>1500,f:()=>rnd(1500,7500),q:3,len:[.0004,.0016],amp:()=>.55});}});
  T('chatter',{len:2.4,make(d,sr){const F=bq('bp',2200,.8,sr);for(let n=0;n<d.length;n++){const t=n/sr;d[n]=F(N())*.8*(Math.sin(2*Math.PI*23*t+Math.sin(t*7))>.1?1:.15);}}});
  // skimming the melt: the cold iron skimmer meets molten metal: a spit of flashing moisture, a heavy slow gloop; the dross flicked off
  // onto the hearth stones clatters. key: got (dross off) | waste (clean metal stirred and spattered) | sink (a lump sinks back)
  V('skim',{len:.9,n:4,make(d,sr,p){const k=p.k;if(k!=='sink'){Z(d,sr,0,.16,.22,ex,bq('hp',3000,.7,sr));G(d,sr,0,.12,{rate:()=>700,f:()=>rnd(2000,6000),q:4,len:[.0005,.002],amp:()=>.45});}
    B(d,sr,.01,jit(k==='sink'?110:150,.1),k==='sink'?.12:.26,.06,.5);Z(d,sr,.005,.12,.12,ex,bq('lp',500,.7,sr));
    if(k==='got')G(d,sr,.3,.18,{rate:u=>160*(1-u)+20,f:()=>rnd(700,3200),q:3,len:[.002,.008],amp:u=>.55*(1-u)});
    if(k==='waste')G(d,sr,.03,.35,{rate:u=>300*(1-u)+20,f:()=>rnd(1500,5000),q:5,len:[.0005,.002],amp:u=>.5*(1-u)});R(d,sr,.15,1.1,2600);}});
  // the winder: the pawl drops into each tooth of the ratchet, a hard tiny click, the rod rings under it
  V('ratchet',{len:.18,n:5,make(d,sr){H(d,sr,0,'wire',jit(3400,.06),.28,.00012,{nz:.5});S(d,sr,.0005,M('steel',jit(820,.05),{ring:.12}),.08,.0003);}});
  // a turn of wire laid tight against the last: a small bright tick
  V('coil',{len:.15,n:4,make(d,sr){H(d,sr,0,'wire',jit(5200,.05),.12,.00015,{ring:.6});}});
  // the wire drawn through the guide onto the rod: a thin steel whisper with a faint whine in it
  T('wire',{len:2.4,make(d,sr){const F=bq('bp',3200,6,sr),F2=bq('bp',5800,8,sr);for(let n=0;n<d.length;n++){const x=N();d[n]=F(x)*1.2+F2(x)*.5;}}});
  // closing a ring with the pliers: the steel jaws meet with a click and the little wire ring rings high; a wide gap scrapes first
  V('pliers',{len:.3,n:4,make(d,sr,p){const gap=p.k==='gap';if(gap)G(d,sr,0,.03,{rate:()=>900,f:()=>rnd(3000,7000),q:4,len:[.0004,.0012],amp:()=>.4});const t0=gap?.028:0;
    H(d,sr,t0,'steel',jit(2400,.05),.12,.00018,{ring:.12,nz:.6});H(d,sr,t0+.0008,'wire',jit(4600,.06),.12,.00015,{ring:.5});}});
  // a new ring hung in the mail: the rings around it chink together
  V('mail',{len:.35,n:4,make(d,sr){for(let k=0;k<4;k++)H(d,sr,rnd(0,.09),'wire',rnd(3800,6200),rnd(.03,.07),.00015,{ring:.5});}});
  // ======== the kitchen
  // the knife through a vegetable and onto the board. The bite is a burst of crisp fracture grains whose brightness and length are the
  // vegetable's own (a carrot snaps, a turnip cracks dense, a potato is starchy and wet, an onion parts layer by layer, cabbage crunches
  // long and leafy, a mushroom gives soft and squeaky); then the edge knocks the board under it
  const VEGS={carrot:{f:[2200,7200],len:.012,rate:3000,a:.7,snap:1},turnip:{f:[1600,6000],len:.016,rate:2400,a:.62,snap:.7},potato:{f:[900,4200],len:.022,rate:1800,a:.5,wet:.5},
    onion:{f:[2000,7000],len:.024,rate:1400,a:.55,layers:4},cabbage:{f:[1500,6500],len:.034,rate:2600,a:.6,layers:2},shroom:{f:[350,1600],len:.026,rate:900,a:.32,squeak:1},
    corn:{f:[1200,5000],len:.02,rate:2000,a:.5},fish:{f:[600,2600],len:.02,rate:900,a:.35,wet:.8},none:{f:[1000,3000],len:0,rate:1,a:0}};
  MSX.VEGS=VEGS;
  // the bite (played as the edge goes into the vegetable) and the knock of the edge on the board (on the frame it lands)
  V('bite',{len:.08,n:4,make(d,sr,p){const v=VEGS[p.k]||VEGS.potato;const L=v.layers||1;for(let l=0;l<L;l++){const t0=l*rnd(.004,.008);G(d,sr,t0,v.len/L*1.4,{rate:()=>v.rate,f:()=>rnd(v.f[0],v.f[1]),q:3,len:[.0004,.0015],amp:u=>v.a*(1-u*.6)});}
    if(v.snap)S(d,sr,0,[[jit(2600,.1),1,.004],[jit(4100,.1),.6,.003]],.08*v.snap,.0002);if(v.wet)Z(d,sr,0,v.len*1.5,.12*v.wet,ex,bq('lp',900,.8,sr));
    if(v.squeak){let ph=0;const f0=jit(900,.1),n1=Math.round(.02*sr);for(let n=0;n<n1;n++){ph+=2*Math.PI*f0*(1-.3*n/n1)/sr;d[n]+=Math.sin(ph)*.05*Math.sin(Math.PI*n/n1);}}}});
  V('board',{len:.22,n:5,make(d,sr,p){const e=p.k==='empty';H(d,sr,0,'oak',jit(e?600:540,.05),e?.42:.34,.00035,{body:[jit(150,.05),.045,.55]});S(d,sr,0,M('steel',jit(3100,.05),{ring:.15}),.03,.0002);R(d,sr,.12,.9,3400);}});
  // a slice tipping over onto the board
  V('slice',{len:.08,n:4,make(d,sr){S(d,sr,0,M('oak',jit(900,.1)),.05,.003);Z(d,sr,0,.01,.04,ex,bq('lp',2000,.7,sr));}});
  // an egg: the shell cracked on the pan's rim (a brittle crackle over a dull knock on the iron), then the egg dropping into hot butter
  // (a wet plap and the white seizing in a burst of sizzle). key land: in the pan | stove: on the cold stovetop beside it
  V('eggCrack',{len:.2,n:4,make(d,sr){G(d,sr,0,.03,{rate:()=>2200,f:()=>rnd(1800,6500),q:3,len:[.0003,.0012],amp:u=>.55*(1-u)});H(d,sr,0,'iron',jit(900,.05),.06,.0012,{ring:.3,nz:.2});}});
  V('eggLand',{len:.6,n:4,make(d,sr,p){Z(d,sr,0,.05,.28,ex,bq('lp',700,.8,sr));Z(d,sr,0,.02,.12,ex,bq('bp',1600,1,sr));
    if(p.k!=='stove'){Z(d,sr,.01,.55,.2,u=>(u<.05?u/.05:1)*Math.exp(-3*u),bq('hp',3200,.6,sr),bq('lp',8500,.7,sr));G(d,sr,.01,.5,{rate:u=>500*(1-u)+40,f:()=>rnd(2500,8000),q:4,len:[.0004,.0015],amp:u=>.45*(1-u)});}}});
  // frying: a dense hiss of tiny pops and spits; key egg | fish (spits more, oilier) | hash (crackly, louder pops)
  T('sizzle',{len:3,make(d,sr){const F=bq('hp',3000,.6,sr),F2=bq('lp',8500,.7,sr);for(let n=0;n<d.length;n++)d[n]=F2(F(N()))*.36;G(d,sr,0,d.length/sr,{rate:()=>650,f:()=>rnd(2500,9000),q:4,len:[.0004,.0015],amp:()=>.55});
    G(d,sr,0,d.length/sr,{rate:()=>7,f:()=>rnd(1500,4000),q:3,len:[.002,.006],amp:()=>.7});}});
  // the pan jerked up: iron scraping on the grate, the food peeling off its fat
  V('toss',{len:.35,n:4,make(d,sr){G(d,sr,0,.09,{rate:()=>700,f:()=>rnd(1200,4000),q:5,len:[.0006,.002],amp:u=>.4*(1-u)});H(d,sr,.002,'iron',jit(620,.05),.06,.002,{ring:.4});Z(d,sr,.03,.07,.12,hump(.3,.5),bq('bp',1800,1,sr));
    Z(d,sr,.02,.2,.1,u=>Math.sin(Math.PI*u),bq('bp',500,.8,sr));}});
  // the food back in the pan: a wet slap and a flare of sizzle. key egg | fish | hash (a scatter of small dice landing) | stove (missed)
  V('catch',{len:.7,n:4,make(d,sr,p){const k=p.k;if(k==='hash'){for(let i=0;i<22;i++)Z(d,sr,rnd(0,.14),.012,rnd(.05,.12),ex,bq('bp',rnd(700,1800),1.2,sr));}else{Z(d,sr,0,.05,k==='fish'?.36:.3,ex,bq('lp',k==='fish'?520:700,.8,sr));Z(d,sr,0,.015,.12,ex,bq('bp',1800,1,sr));}
    if(k==='stove'){H(d,sr,0,'iron',jit(300,.05),.08,.004,{ring:.2});return;}Z(d,sr,.01,.6,.22,u=>(u<.05?u/.05:1)*Math.exp(-2.6*u),bq('hp',3000,.6,sr),bq('lp',8500,.7,sr));G(d,sr,.01,.5,{rate:u=>600*(1-u)+50,f:()=>rnd(2500,8000),q:4,len:[.0004,.0015],amp:u=>.45*(1-u)});}});
  // a die of hash falling off onto the stovetop
  V('dice',{len:.1,n:4,make(d,sr){Z(d,sr,0,.012,.1,ex,bq('bp',rnd(800,1600),1.2,sr));H(d,sr,0,'iron',jit(1400,.1),.03,.001,{ring:.2});}});
  // the knife along a fish's backbone: a soft wet slicing hush; each rib it passes over ticks under the edge
  T('slice',{len:2.6,make(d,sr){const F=bq('bp',2400,.6,sr),F2=bq('lp',4200,.7,sr);for(let n=0;n<d.length;n++)d[n]=F2(F(N()))*.7;G(d,sr,0,d.length/sr,{rate:()=>60,f:()=>rnd(600,1800),q:2,len:[.003,.01],amp:()=>.35});}});
  V('rib',{len:.06,n:5,make(d,sr){H(d,sr,0,'wire',jit(2600,.12),.05,.0003,{ring:.15,nz:.6});}});
  V('peel',{len:.45,n:3,make(d,sr){G(d,sr,0,.35,{rate:u=>400*(1-u)+60,f:()=>rnd(500,2500),q:2,len:[.002,.008],amp:u=>.3*Math.sin(Math.PI*u)});Z(d,sr,0,.3,.06,u=>Math.sin(Math.PI*u),bq('lp',800,.7,sr));}});
  // pouring. The stream: a running trickle with bubbles torn into it as it lands. A ring is added live, as the vessel fills: the air
  // over the liquid is a pipe that gets shorter, so its note climbs (MSX.pour below)
  T('stream',{len:3,make(d,sr){const F=bq('lp',2600,.7,sr),F2=bq('hp',180,.7,sr);for(let n=0;n<d.length;n++)d[n]=F2(F(N()))*.5;let t=0;while(t<d.length/sr-.05){t+=-Math.log(1-Math.random())/160;B(d,sr,t,rnd(500,2600),rnd(.04,.14),rnd(.003,.01),rnd(.4,1.6));}}});
  // a thick soup off the ladle: lower, slower, gloopier
  T('soup',{len:3,lo:1,make(d,sr){const F=bq('lp',1100,.7,sr);for(let n=0;n<d.length;n++)d[n]=F(N())*.45;let t=0;while(t<d.length/sr-.05){t+=-Math.log(1-Math.random())/45;B(d,sr,t,rnd(180,700),rnd(.08,.2),rnd(.01,.03),rnd(.3,.9));}}});
  // molten metal: heavy and slow, a low rumble with the crackle and spit where it meets the mould
  T('molten',{len:3,lo:1,make(d,sr){const F=bq('lp',360,.7,sr);for(let n=0;n<d.length;n++)d[n]=F(N())*.9;let t=0;while(t<d.length/sr-.05){t+=-Math.log(1-Math.random())/30;G(d,sr,t,.006,{rate:()=>900,f:()=>rnd(1500,5000),q:5,len:[.0005,.0015],amp:()=>rnd(.2,.6)});}}});
  // a glug: air bubbling back into the jug's neck. key 0..3 = how empty the jug is (emptier = a bigger, lower glug)
  V('glug',{len:.12,n:5,make(d,sr,p){const k=+p.k||0,f=jit([520,420,330,260][k],.1);B(d,sr,.001,f,.22,rnd(.012,.02),1.1);}});
  // spilling over the rim onto the table
  V('spill',{len:.5,n:3,make(d,sr){G(d,sr,0,.45,{rate:u=>300*(1-u)+30,f:()=>rnd(800,3500),q:2,len:[.002,.008],amp:u=>.35*(1-u)});Z(d,sr,0,.2,.08,ex,bq('lp',900,.7,sr));}});
  // the ladle dunked back into the pot for more: a plunge and a slosh
  V('dunk',{len:.6,n:3,lo:1,make(d,sr){Z(d,sr,0,.06,.3,ex,bq('lp',600,.8,sr));B(d,sr,.01,jit(220,.1),.22,.04,-.3);for(let k=0;k<10;k++)B(d,sr,rnd(.04,.35),rnd(300,900),rnd(.04,.09),rnd(.008,.02),.8);
    S(d,sr,.005,M('iron',jit(420,.05)),.05,.004);}});
  // a bowl slid along the table to the next place
  V('slide',{len:.5,n:3,make(d,sr,p){G(d,sr,0,.4,{rate:()=>900,f:()=>rnd(600,2200),q:2,len:[.001,.004],amp:u=>.22*Math.sin(Math.PI*u)});S(d,sr,.42,M(p.k==='wood'?'oak':'ceramic',jit(700,.05)),.08,.002);}});
  // the stove: a wood fire behind the iron door: a roar, the sticks snapping and ticking
  T('hearth',{len:3.2,lo:1,make(d,sr){const F=bq('lp',520,.7,sr);let sw=1,tg=1;for(let n=0;n<d.length;n++){if(n%600===0)tg=.6+Math.random()*.8;sw+=(tg-sw)*.003;d[n]=F(N())*sw*1.1;}
    let t=0;while(t<d.length/sr-.05){t+=-Math.log(1-Math.random())/9;G(d,sr,t,.004,{rate:()=>600,f:()=>rnd(1000,4500),q:5,len:[.0005,.002],amp:()=>rnd(.3,.9)});}}});
  // the damper slid open or shut: iron grating on iron with a clank at the stop
  V('damper',{len:.35,n:4,make(d,sr){G(d,sr,0,.14,{rate:()=>500,f:()=>rnd(900,3200),q:5,len:[.001,.003],amp:u=>.3*(1-u*.5)});H(d,sr,.14,'iron',jit(560,.06),.12,.0012,{ring:.45});}});
  // a pot coming up to a simmer: a few slow, deep blubs ... (the rolling boil is the 'boil' texture above)
  T('simmer',{len:3.2,lo:1,make(d,sr){let t=0;const L=d.length/sr-.06;while(t<L){t+=-Math.log(1-Math.random())/9;B(d,sr,t,rnd(110,300),rnd(.12,.3),rnd(.02,.05),rnd(.3,.8));}}});
  // the wooden spoon going round the pot: a slow liquid swish; it knocks the iron side once a turn
  T('stir',{len:2.8,lo:1,make(d,sr){const F=bq('bp',700,.7,sr);for(let n=0;n<d.length;n++){const t=n/sr;d[n]=F(N())*.6*(.5+.5*Math.sin(2*Math.PI*t/1.4));}}});
  V('spoon',{len:.15,n:4,make(d,sr){S(d,sr,0,M('iron',jit(380,.06)),.05,.004);S(d,sr,0,M('oak',jit(700,.06)),.05,.002);}});
  // something dropped into the pot. key big (a turnip, a fish: a slap, a deep bloop as the cavity it made closes, a splash of drops) |
  // mid | small (a handful of grain or hops: a scatter of tiny plips) | soft (tallow: a soft, oily slap)
  V('plunk',{len:.8,n:3,lo:1,make(d,sr,p){const k=p.k;if(k==='small'){for(let i=0;i<26;i++)B(d,sr,rnd(0,.16),rnd(500,1500),rnd(.03,.08),rnd(.004,.01),1);Z(d,sr,0,.2,.05,ex,bq('bp',2000,.8,sr));return;}
    const big=k==='big',a=big?.42:k==='soft'?.2:.3;Z(d,sr,0,.04,a,ex,bq('lp',big?600:900,.8,sr));if(k!=='soft')B(d,sr,.03,jit(big?160:240,.1),a*.8,big?.07:.05,-.4);
    for(let i=0;i<(big?14:8);i++)B(d,sr,rnd(.05,.4),rnd(400,1400),rnd(.03,.08)*(k==='soft'?.4:1),rnd(.006,.015),1.1);R(d,sr,.1,.9,3000);}});
  // the pot boiling over: foam on the hot iron top: a violent crackling sizzle, a gush of steam
  V('boilover',{len:1.4,n:2,make(d,sr){Z(d,sr,0,1.3,.38,u=>(u<.05?u/.05:1)*Math.exp(-2*u),bq('hp',2600,.6,sr),bq('lp',9000,.7,sr));G(d,sr,0,1.2,{rate:u=>1200*(1-u)+100,f:()=>rnd(1500,7000),q:4,len:[.0005,.002],amp:u=>.6*(1-u)});
    for(let k=0;k<40;k++)B(d,sr,rnd(0,.9),rnd(200,800),rnd(.05,.12),rnd(.008,.02),.6);}});
  // ======== the workshop
  // the saw's teeth through the wood: each tooth plucks a fibre (a tiny bright click) over the hiss of the cut; played faster, the
  // clicks crowd and the pitch climbs, as a real saw does when you speed up
  T('rasp',{len:2.8,make(d,sr){const F=bq('bp',2400,.8,sr);for(let n=0;n<d.length;n++)d[n]=F(N())*.35;let t=0;const L=d.length/sr-.01;while(t<L){t+=1/rnd(48,64);G(d,sr,t,.003,{rate:()=>2000,f:()=>rnd(1800,5200),q:3,len:[.0004,.0012],amp:()=>rnd(.35,.8)});}
    const F2=bq('lp',380,.7,sr);for(let n=0;n<d.length;n++)d[n]+=F2(N())*.25;}});
  // the blade binding in the cut: the teeth catch and stop with a harsh scrape, the thin steel flexes and twangs
  V('bind',{len:.6,n:3,make(d,sr){G(d,sr,0,.09,{rate:()=>800,f:()=>rnd(1500,4000),q:4,len:[.001,.003],amp:u=>.5*(1-u)});
    {const f0=jit(420,.08);let ph=0;const n1=Math.round(.5*sr);for(let n=0;n<n1;n++){const tt=n/sr;ph+=2*Math.PI*f0*(1+.03*Math.sin(2*Math.PI*9*tt))/sr;d[n+Math.round(.02*sr)]+=Math.sin(ph)*.09*Math.exp(-tt*7);}}}});
  // the last fibres of the offcut tearing
  V('splinter',{len:.25,n:4,make(d,sr){G(d,sr,0,.12,{rate:u=>2500*(1-u)+200,f:()=>rnd(800,5000),q:3,len:[.0005,.002],amp:u=>.6*(1-u*.5)});S(d,sr,0,M('oak',jit(300,.08)),.08,.002);}});
  // a block of wood landing on the floorboards. key drop (the first, heavier hit) | flat (it flops down and settles)
  V('block',{len:.5,n:4,lo:1,make(d,sr,p){const fl=p.k==='flat';H(d,sr,0,'board',jit(fl?180:150,.06),fl?.4:.5,.002,{body:[jit(95,.06),.07,.7]});if(fl)H(d,sr,rnd(.03,.05),'oak',jit(420,.06),.14,.0015);R(d,sr,.14,1,2400);}});
  // the plane's iron lifting a shaving: a smooth paper-and-fibre hush whose brightness follows the speed
  T('shave',{len:2.8,make(d,sr){const F=bq('bp',4200,.6,sr);for(let n=0;n<d.length;n++)d[n]=F(N())*.6;G(d,sr,0,d.length/sr,{rate:()=>500,f:()=>rnd(2000,7000),q:3,len:[.0004,.0012],amp:()=>.35});}});
  // pushed too fast it chatters: the iron skips, knocking the sole on the board and tearing the grain
  V('chatter',{len:.1,n:5,make(d,sr){H(d,sr,0,'oak',jit(620,.08),.16,.0008);G(d,sr,0,.03,{rate:()=>1500,f:()=>rnd(1500,5000),q:3,len:[.0005,.0015],amp:()=>.35});}});
  // a long curl of shaving breaking off
  V('curl',{len:.18,n:4,make(d,sr){G(d,sr,0,.12,{rate:u=>600*(1-u),f:()=>rnd(2500,7000),q:3,len:[.0004,.0012],amp:u=>.3*(1-u)});}});
  // the plane set down on the board for the next pass: wood on wood
  V('setdown',{len:.2,n:4,make(d,sr){H(d,sr,0,'oak',jit(460,.06),.18,.0018,{body:[jit(160,.06),.04,.4]});}});
  // a hammer's swing: a short rush of air past the head, louder the harder it goes. key 0..2
  V('swish',{len:.22,n:4,make(d,sr,p){const k=+p.k||0,F=bq('bp',500,.9,sr);const n1=Math.round(.16*sr);for(let n=0;n<n1;n++){const u=n/n1;if(n%32===0)F.set(400+u*1600*(.6+.2*k),.9);d[n]+=F(N())*Math.sin(Math.PI*u)**2*(.1+.06*k);}}});
  // the hammer on a nail: the steel face rings the nail head (higher as less of the nail stands free), the board thumps under it.
  // key d0..d3: how far the nail is in. A flush blow (seat) is the face meeting the wood itself: a dead, heavy thock
  V('nail',{len:.45,n:4,make(d,sr,p){const dd=+String(p.k).slice(1)||0;H(d,sr,0,'wire',jit(2300+dd*450,.04),.2,.00018,{ring:.5});H(d,sr,0,'steel',jit(3900,.04),.05,.0002,{ring:.25,nz:.4});
    H(d,sr,.0006,'board',jit(330,.05),.34,.0012,{body:[jit(120,.05),.06,.55]});R(d,sr,.12,1,3000);}});
  V('seat',{len:.4,n:4,make(d,sr){H(d,sr,0,'oak',jit(360,.05),.42,.0016,{body:[jit(115,.05),.07,.7],nz:.3});H(d,sr,0,'wire',jit(4400,.05),.05,.0002,{ring:.3});R(d,sr,.12,1,3000);}});
  // the wood splitting at the edge: a crack, then the fibres tearing along the grain
  V('split',{len:.45,n:3,make(d,sr){Z(d,sr,0,.004,.5,ex,bq('hp',800,.7,sr));G(d,sr,.002,.2,{rate:u=>3000*(1-u)+200,f:()=>rnd(700,5000),q:3,len:[.0004,.0015],amp:u=>.65*(1-u*.6)});H(d,sr,0,'board',jit(260,.05),.3,.001);}});
  // a nail struck crooked: a glancing clank, and the shank bending over with a short dull groan of steel
  V('bend',{len:.4,n:3,make(d,sr){H(d,sr,0,'steel',jit(1700,.05),.14,.0004,{ring:.2});{const f0=jit(700,.06);let ph=0;const n1=Math.round(.22*sr);for(let n=0;n<n1;n++){const u=n/n1;ph+=2*Math.PI*f0*(1-.5*u)/sr;d[n+Math.round(.01*sr)]+=(Math.sin(ph)+.3*Math.sin(ph*2.03))*.05*Math.sin(Math.PI*u);}}
    H(d,sr,.001,'board',jit(300,.05),.25,.0014);}});
  // tapping a bent nail straight: two light ticks on the shank
  V('tap2',{len:.3,n:3,make(d,sr){H(d,sr,0,'wire',jit(2100,.05),.09,.0003,{ring:.3});H(d,sr,rnd(.11,.14),'wire',jit(2300,.05),.1,.0003,{ring:.3});}});
  // rivets. key leather: the copper head on leather over the iron block, a dull slap with a tick | brass: the sheet rings bright and
  // warm | iron: a heavy clank of the frame
  V('rivet',{len:1.1,n:4,make(d,sr,p){const k=p.k;H(d,sr,0,'wire',jit(3400,.05),.1,.0002,{ring:.3});
    if(k==='leather'){Z(d,sr,0,.04,.32,ex,bq('lp',700,.8,sr));S(d,sr,.001,M('iron',jit(760,.05),{ring:.5}),.08,.002);}
    else if(k==='brass')H(d,sr,0,'brass',jit(880,.05),.24,.0004,{ring:1.1});
    else H(d,sr,0,'iron',jit(520,.05),.32,.0007,{ring:.9,body:[jit(140,.05),.05,.4]});R(d,sr,.12,1,3000);}});
  // a brush on bare wood: the bristles' dry whisper; loaded with oil it is softer and wetter (the filter follows the load)
  T('bristle',{len:2.8,make(d,sr){const F=bq('bp',2600,.5,sr);for(let n=0;n<d.length;n++)d[n]=F(N())*.6;G(d,sr,0,d.length/sr,{rate:()=>260,f:()=>rnd(1800,6000),q:2,len:[.001,.004],amp:()=>.3});}});
  // the wax cake rubbed across the canvas: a dragging, squeaky, fabric rasp
  T('wax',{len:2.6,make(d,sr){const F=bq('bp',1500,1.1,sr);for(let n=0;n<d.length;n++)d[n]=F(N())*.6;let t=0;while(t<d.length/sr-.06){t+=-Math.log(1-Math.random())/7;const f0=rnd(700,1300);let ph=0;const i0=Math.round(t*sr),n1=Math.round(rnd(.02,.05)*sr);for(let n=0;n<n1&&i0+n<d.length;n++){ph+=2*Math.PI*f0/sr;d[i0+n]+=Math.sin(ph)*.12*Math.sin(Math.PI*n/n1);}}}});
  // the brush dunked in the tin: a soft plunge, the bristles wiped on the rim
  V('dip',{len:.55,n:3,make(d,sr){B(d,sr,.002,jit(420,.1),.14,.025,.6);for(let k=0;k<5;k++)B(d,sr,rnd(.02,.12),rnd(700,1500),.05,.008,1);G(d,sr,.25,.18,{rate:()=>700,f:()=>rnd(1200,3500),q:3,len:[.001,.003],amp:u=>.22*Math.sin(Math.PI*u)});}});
  V('waxload',{len:.4,n:3,make(d,sr){G(d,sr,0,.3,{rate:()=>500,f:()=>rnd(800,2200),q:3,len:[.002,.006],amp:u=>.3*Math.sin(Math.PI*u)});}});
  // ---- the forge, more
  // the tongs closing on the bar: steel jaws, a light click; the hot bar laid back on the anvil face: a soft clank with a little ring
  V('tongs',{len:.35,n:4,make(d,sr){H(d,sr,0,'steel',jit(2300,.05),.1,.0003,{ring:.15,nz:.5});}});
  V('setbar',{len:.6,n:3,make(d,sr){H(d,sr,0,'anvil',jit(1180,.03),.07,.0016,{ring:.35});S(d,sr,0,[[jit(160,.08),1,.04]],.22,.004);R(d,sr,.15,1.2,2600);}});
  // the pliers' jaws taking hold of the wire
  V('grip',{len:.12,n:4,make(d,sr){H(d,sr,0,'steel',jit(3000,.06),.05,.0002,{ring:.08,nz:.6});}});
  // the winder's other jobs. A stone pestle round a stone mortar: grit and the crunch of bone; a quern: the top stone grinding round
  // on the bottom one, heavier; straw twisted: dry, crackling fibres; a braid dragged round into a rug: soft cloth on the floor; a
  // churn: cream sloshing to and fro; a press: the juice running out as the screw tightens
  T('pestle',{len:2.6,make(d,sr){const F=bq('bp',1400,.6,sr);for(let n=0;n<d.length;n++)d[n]=F(N())*.4;G(d,sr,0,d.length/sr,{rate:()=>420,f:()=>rnd(500,3500),q:3,len:[.001,.004],amp:()=>.55});
    G(d,sr,0,d.length/sr,{rate:()=>18,f:()=>rnd(900,2600),q:2,len:[.004,.01],amp:()=>.8});}});
  T('quern',{len:2.8,lo:1,make(d,sr){const F=bq('lp',700,.7,sr);for(let n=0;n<d.length;n++)d[n]=F(N())*.8;G(d,sr,0,d.length/sr,{rate:()=>320,f:()=>rnd(400,2400),q:3,len:[.001,.004],amp:()=>.45});}});
  T('straw',{len:2.6,make(d,sr){const F=bq('bp',3800,.6,sr);for(let n=0;n<d.length;n++)d[n]=F(N())*.25;G(d,sr,0,d.length/sr,{rate:()=>380,f:()=>rnd(1800,7000),q:3,len:[.0004,.002],amp:()=>.6});}});
  T('cloth',{len:2.6,lo:1,make(d,sr){const F=bq('bp',1100,.6,sr);let sw=1,tg=1;for(let n=0;n<d.length;n++){if(n%300===0)tg=.5+Math.random();sw+=(tg-sw)*.01;d[n]=F(N())*.6*sw;}}});
  T('slosh',{len:2.4,lo:1,make(d,sr){const L=d.length/sr;const F=bq('lp',900,.7,sr);for(let n=0;n<d.length;n++){const t=n/sr,ph=(t/L*4)%1;d[n]=F(N())*.5*Math.pow(Math.sin(Math.PI*ph),3);}
    for(let k=0;k<4;k++){const t0=k*L/4+.12;for(let i=0;i<16;i++)B(d,sr,t0+rnd(0,.25),rnd(250,900),rnd(.05,.12),rnd(.008,.02),.6);}}});
  T('trickle',{len:2.8,make(d,sr){let t=0;while(t<d.length/sr-.05){t+=-Math.log(1-Math.random())/120;B(d,sr,t,rnd(700,2800),rnd(.03,.1),rnd(.003,.008),rnd(.5,1.5));}const F=bq('bp',1600,.6,sr);for(let n=0;n<d.length;n++)d[n]+=F(N())*.08;}});
  // bone crushed under the pestle; the quern's wooden handle knocking in its socket; the churn's dasher thumping the bottom
  V('crush',{len:.2,n:4,make(d,sr){G(d,sr,0,.06,{rate:()=>1600,f:()=>rnd(900,4200),q:3,len:[.0005,.002],amp:u=>.5*(1-u)});S(d,sr,0,M('stone',jit(420,.08)),.14,.002);}});
  V('knock',{len:.15,n:4,make(d,sr,p){H(d,sr,0,p.k==='pine'?'pine':'oak',jit(p.k==='pine'?380:520,.06),.2,.0015,{body:[jit(140,.06),.04,.3]});}});
  V('pat',{len:.12,n:4,lo:1,make(d,sr){Z(d,sr,0,.04,.2,ex,bq('lp',600,.7,sr));}});
  V('creak',{len:.45,n:4,make(d,sr){const f0=jit(140,.12);let ph=0;const n1=Math.round(rnd(.22,.36)*sr);for(let n=0;n<n1;n++){const u=n/n1;ph+=2*Math.PI*f0*(1+.5*u+.1*Math.sin(n*.004))/sr;d[n]+=((ph%(2*Math.PI))<.7?.09:-.012)*Math.sin(Math.PI*u)*(.5+.5*Math.random());}
    const F=bq('bp',900,2,sr);for(let n=0;n<n1;n++)d[n]=F(d[n])*2.2;}});
  // ======== the stings, kept (the same notes as before) and set under the work
}
// ---------------------------------------------------------------- the mix
// a step's own level (the games measured to one loudness), set when the step starts; MSX.rt turns the game's clock into real seconds
MSX.TRIM={anvil:0.22,bellows:0.45,quench:0.55,grind:0.73,skim:1.79,crank:0.43,links:1.03,chop:1.0,crack:1.74,flip:1.98,fillet:1.86,pour:1.39,simmer:0.57,saw:0.88,plane:0.87,hammer:0.79,brush:1.19};MSX.rt=gt=>gt/((typeof MG4_PACE==='function'?MG4_PACE():.8)*(window.CG2_SPEED||1));
{const wrapK=k=>{const f=S4[k];if(typeof f!=='function'||f.__x6)return;const w=function(sp){MSX.K=k;MSX.G=MSX.TRIM[k]||1;try{const P=MSX.PREP[k];MSX.prep(((typeof P==='function'?P(sp||{}):P)||[]).map(x=>Array.isArray(x)?x:[x,[null]]));}catch(e){}return f.apply(this,arguments);};w.__x6=1;S4[k]=w;};
  MSX.PREP={};MSX.wrapAll=()=>{for(const k of Object.keys(S4))wrapK(k);};MSX.wrapAll();
  {const _r=mg4Run;mg4Run=function(){MSX.wrapAll();return _r.apply(this,arguments);};}
  // the continuous voices still running when a game closes are silenced (a step that forgets one never leaves it droning)
  MSX.loops=[];const _l=MSX.loop;MSX.loop=function(){const c=_l.apply(this,arguments);if(c&&c.on)MSX.loops.push(c);return c;};const _f=MSX.fric;MSX.fric=function(){const c=_f.apply(this,arguments);MSX.loops.push(c);return c;};
  setInterval(()=>{try{if(typeof MG4!=='undefined'&&!MG4.on&&MSX.loops.length){for(const c of MSX.loops)c.stop();MSX.loops=[];}else MSX.loops=MSX.loops.filter(c=>c.on!==false);}catch(e){}},700);}
// what each step plays, made while its title is up (so the first blow never waits for its sound to be drawn)
Object.assign(MSX.PREP,{
  anvil:[['anvil',['h0','h1','h2','h3']],['coals',['in']],'tongs','setbar'],bellows:sp=>sp.item==='pump'?['pump','spray']:[['bellows',[0,1,2]],'bellowsIn','roar','crackle'],
  quench:['quench','steam','boil','drip'],grind:['grit','chatter','wheel'],skim:[['skim',['got','waste','sink']]],
  crank:sp=>({mortar:['pestle','crush'],quern:['quern',['knock',['oak']]],straw:['straw'],rug:['cloth','pat'],churn:['slosh','pat'],press:['jitter','trickle','creak']})[sp.look]||['ratchet','coil','wire'],links:['grip','pliers','mail'],
  chop:sp=>[['bite',[...new Set(sp.veg||['carrot'])]],['board',[null,'empty']]],crack:['eggCrack',['eggLand',[null,'stove']],'sizzle'],
  flip:sp=>['sizzle','toss',['catch',[sp.item==='fish'?'fish':sp.item==='hash'?'hash':'egg','stove']],'dice'],fillet:['slice','rib','peel'],
  pour:sp=>sp.vessel==='crucible'?['molten',['skim',['waste']]]:sp.vessel==='ladle'?['soup','dunk','spill']:['stream',['glug',[0,1,2,3]],'spill',['slide',[sp.bowl==='wood'?'wood':null]]],
  simmer:['simmer','boil','hearth','stir','spoon','damper',['plunk',['big','mid','small','soft']],'boilover'],
  saw:['rasp','bind','splinter',['block',['drop','flat']]],plane:['shave','chatter','curl','setdown'],
  hammer:sp=>sp.look==='rivet'?[['rivet',[sp.metal==='brass'?'brass':sp.metal?'iron':'leather']],['swish',[0,1,2]]]:[['nail',['d0','d1','d2','d3']],'seat','split','bend','tap2',['swish',[0,1,2]]],brush:sp=>sp.look==='wax'?['wax','waxload']:['bristle','dip','drip']});
// the stings: good, perfect, miss, the finish, the count-in: the same notes as before, at about half the level they had, so they sit
// under the sound of the work instead of over it
{const L=MSX.STING=.5,t=(f,d,ty,v,o)=>A.tone(f,d,ty,v*L,o),h=(d,v,ty,f,o)=>A.hiss(d,v*L,ty,f,o);
  const ST={
    good(){t(784,.12,'triangle',.135);t(1047,.16,'triangle',.117,{delay:.07});t(2094,.1,'sine',.027,{delay:.07});},
    perfect(){t(784,.1,'triangle',.128);t(1047,.1,'triangle',.128,{delay:.06});t(1568,.24,'triangle',.119,{delay:.12});t(3136,.3,'sine',.034,{delay:.13,verb:1});h(.25,.042,'highpass',7000,{delay:.12});},
    miss(){t(150,.2,'triangle',.154,{slide:92,filter:['lowpass',700]});h(.05,.14,'lowpass',500);},
    fanfare(q){const n=q>.9?[523,659,784,1047]:q>.6?[523,659,784]:q>.35?[523,587,659]:[523,494];n.forEach((f,i)=>{t(f,.3,'triangle',.112,{delay:i*.11});t(f*2,.16,'sine',.022,{delay:i*.11});});
      t(131,.6,'triangle',.09);if(q>.6)t(196,.5,'sine',.06,{delay:n.length*.11});if(q>.9){t(1568,.7,'sine',.075,{delay:.5,verb:1});t(2093,.6,'sine',.045,{delay:.58,verb:1});}},
    sparkle(){const f=1760*(1+(Math.random()*2-1)*.03);t(f,.16,'sine',.045,{verb:1});t(f*1.5,.12,'sine',.03,{delay:.05});},
    tick(){t(1900,.025,'square',.025);},
    ready(){t(660,.06,'triangle',.08);h(.02,.096,'bandpass',1800,{q:3});},
    go(){t(880,.08,'triangle',.07);t(1320,.16,'triangle',.06,{delay:.06});t(2640,.1,'sine',.012,{delay:.06});}};
  for(const [k,f] of Object.entries(ST)){f.__v=1;MS[k]=f;}}
// the continuous sounds the old steps make (MS.loop) and the rooms' quiet beds go out through the game's buses like everything
// else (they went straight to the master, so the Effects and Ambience sliders missed them); the beds are kept low under the work
{const _o=A_out;A_out=function(pan,verb){// (Sound off and on again makes a new audio context: the volume buses are made again for it, or every sound would fail)
    if(A.ok&&A.ctx&&typeof AUD7!=='undefined'&&AUD7.on&&A.b7Fx&&A.b7Fx.context!==A.ctx){try{AUD7.on=false;aud7Build();}catch(e){}}
    if(MSX._amb&&pan===undefined&&!verb&&A.ok&&A.ctx){if(!MSX.ambG||MSX.ambG.context!==A.ctx){MSX.ambG=A.ctx.createGain();MSX.ambG.gain.value=.6;MSX.ambG.connect(A.b7Amb&&A.b7Amb.context===A.ctx?A.b7Amb:A.master);}return MSX.ambG;}return _o.apply(this,arguments);};
  MS.loop=function(type,f,q){if(!A.ok||!A.ctx)return {set(){},stop(){}};const c=A.ctx;const s=c.createBufferSource();s.buffer=A.noise;s.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q||1;
    const g=c.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(A_out());s.start(0,Math.random());let dead=false;
    return {set(v,f2,q2){if(dead)return;g.gain.setTargetAtTime(Math.max(0,v),c.currentTime,.04);if(f2)fl.frequency.setTargetAtTime(f2,c.currentTime,.05);if(q2)fl.Q.setTargetAtTime(q2,c.currentTime,.05);},
      stop(){if(dead)return;dead=true;g.gain.setTargetAtTime(0,c.currentTime,.05);setTimeout(()=>{try{s.stop();}catch(e){}},400);}};};
  const _amb=mg4Ambience;mg4Ambience=function(scene){const M=MAMB[scene]||MAMB.workshop;MSX._amb=true;let bed;try{bed=MS.loop(M.bed[0],M.bed[1],M.bed[2]);bed.set(M.bed[3]);}finally{MSX._amb=false;}
    const timers=M.ev.map(([every,fn])=>{let h;const go=()=>{h=setTimeout(()=>{MSX._amb=true;try{fn();}catch(e){}finally{MSX._amb=false;}go();},every*1000*(.6+Math.random()*.8));};go();return ()=>clearTimeout(h);});
    return {stop(){bed.stop();timers.forEach(f=>f());}};};}
