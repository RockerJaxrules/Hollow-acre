/* ================= #296 Caitlyn's heart events, shown instead of read. The owner: "the problem with Caitlyn's heart events is you
   have them read instead of show". A scene marked show:true plays without the caption box and its portrait: whatever is said
   comes out of the speaker's mouth as a speech bubble over their head, in the world, and goes on by itself once there's been
   time to read it (a tap still hurries it). The events themselves are cut down to a few short lines; everything else is acted:
   she lifts things, hands them over, throws them down (pose:{id:'spellcast'|'thrust'|'slash'}), people come and go, the
   camera goes where to look. ================= */
(function(){const css=document.createElement('style');css.textContent=`
body.stgShow #stgCap{display:none!important}
#stgBub{position:fixed;z-index:61;pointer-events:none;display:none;transform:translate(-50%,-100%);max-width:min(46vw,19em);margin-top:-22px;
 background:#f3ead6;color:#1e1610;padding:7px 11px 8px;font:14px/1.4 'Hollow Pixel',monospace;text-align:center;box-sizing:border-box;text-wrap:balance;
 -webkit-font-smoothing:none;font-smooth:never;filter:drop-shadow(3px 3px 0 rgba(0,0,0,.45));
 box-shadow:0 -3px 0 0 #1e1610,0 3px 0 0 #1e1610,-3px 0 0 0 #1e1610,3px 0 0 0 #1e1610,inset 0 2px 0 0 #fffaf0,inset 0 -2px 0 0 #d8ccb0}
@media (min-width:1100px){#stgBub{font-size:18px;padding:8px 13px 9px}}@media (min-width:1700px){#stgBub{font-size:24px;padding:10px 16px 12px}}
#stgBub.on{display:block}
#stgBub .tl,#stgBub .tl2{position:absolute;top:100%;left:var(--tail,50%);width:21px;height:21px;background:#1e1610;margin-left:-3px;
 clip-path:polygon(0 0,21px 0,21px 3px,18px 3px,18px 6px,15px 6px,15px 9px,12px 9px,12px 12px,9px 12px,9px 15px,6px 15px,6px 18px,3px 18px,3px 21px,0 21px)}
#stgBub .tl2{background:#f3ead6;width:15px;height:15px;top:calc(100% - 1px);margin-left:0;clip-path:polygon(0 0,15px 0,15px 3px,12px 3px,12px 6px,9px 6px,9px 9px,6px 9px,6px 12px,3px 12px,3px 15px,0 15px)}
#stgBub.flip .tl{transform:scaleX(-1);margin-left:-18px}#stgBub.flip .tl2{transform:scaleX(-1);margin-left:-12px}
#stgBub .nm{position:absolute;left:8px;top:-1.45em;font-size:.72em;line-height:1;padding:3px 6px 2px;color:#fff6e0;background:var(--nc,#7a5a3a);
 box-shadow:0 -2px 0 0 #1e1610,-2px 0 0 0 #1e1610,2px 0 0 0 #1e1610;letter-spacing:.04em}
#stgBub.you{background:#e2ecf0}#stgBub.you .tl2{background:#e2ecf0}
#stgBub.thing{background:#1e1a16;color:#e8dcc0;box-shadow:0 -3px 0 0 #8a7a5a,0 3px 0 0 #8a7a5a,-3px 0 0 0 #8a7a5a,3px 0 0 0 #8a7a5a}#stgBub.thing .tl{background:#8a7a5a}#stgBub.thing .tl2{background:#1e1a16}`;
  document.head.appendChild(css);const b=document.createElement('div');b.id='stgBub';document.body.appendChild(b);})();
const HS_NC={mae:'#a8405a',tobias:'#3e6a9a',you:'#3e7a5a',radio:'#5a5048'};
// where a speaker's head is on the page
function hsBubAt(b){const c=($('view')||$('c'));if(!c)return null;const r=c.getBoundingClientRect();let X,Y;
  if(b.at){X=sx(b.at.x);Y=sz(b.at.z)-(b.at.h||20);}else{const a=stgActor(b.who);if(!a)return null;X=sx(a.x);Y=sz(a.z)-48;}
  return {x:r.left+X*r.width/c.width,y:r.top+Y*r.height/c.height};}
function hsBub(b,txt){const e=$('stgBub');if(!b||!txt){e.classList.remove('on');return;}
  const nm=b.who==='you'?'You':b.who==='radio'?'The radio':b.who?stgName(b.who):'';
  e.innerHTML=(nm?`<span class="nm">${nm}</span>`:'')+txt+'<span class="tl"></span><span class="tl2"></span>';e.style.setProperty('--nc',HS_NC[b.who]||'#7a5a3a');
  const p=hsBubAt(b);let cls='on'+(b.who==='you'?' you':!b.who||b.at?' thing':'');if(!p){e.className=cls;e.style.left='50%';e.style.top='22%';return;}
  // the bubble sits to the speaker's own side of the shot, so its tail drops straight onto them and nobody else
  const w=e.offsetWidth||200,h=e.offsetHeight||40;let side=0;try{const a=b.at?null:stgActor(b.who);if(a)for(const id of Object.keys(STG.def.cast||{}).concat(['you'])){if(id===b.who)continue;const o=stgActor(id);if(o&&o.vis!==false&&Math.abs(o.x-a.x)<2.5)side=a.x<o.x?-1:1;}}catch(er){}
  const want=p.x+side*w*.32,x=Math.max(w/2+8,Math.min(innerWidth-w/2-8,want)),y=Math.max(h+34,p.y-14);if(side<0)cls+=' flip';e.className=cls;
  e.style.left=x+'px';e.style.top=y+'px';e.style.setProperty('--tail',Math.max(10,Math.min(w-14,w/2+(p.x-x)))+'px');}
{const _u=stgUpdate;stgUpdate=function(dt){const r=_u.apply(this,arguments);const st=STG;document.body.classList.toggle('stgShow',!!(st&&st.def.show));
  if(!st||!st.def.show||st.ended||st.i<0){hsBub(null);return r;}const b=st.def.beats[st.i];
  if(!b||!b.text||!$('stgCap').classList.contains('on')){hsBub(null);st._read=0;return r;}
  hsBub(b,stgSlice(b.text,Math.floor(st.typed)));
  if(st.typed>=b.text.length){st._read=(st._read||0)+dt;const need=Math.max(1.7,1.0+b.text.replace(/<[^>]+>/g,'').length*.05)+(b.linger||0);
    if(st._read>=need){st._read=0;stgBeat(st.i+1);}}
  return r;};}
// gestures: pose:{mae:'spellcast'} plays the clip once and holds it; pose:{mae:null} lets go
{const _b=stgBeat;stgBeat=function(i){const st=STG;if(st)st._read=0;const r=_b.apply(this,arguments);try{const b=STG&&STG.def.beats[i];
    if(b&&b.pose)for(const [id,v] of Object.entries(b.pose)){const n=id==='you'?null:npcById(id);if(n)n.pose=v?{c:v,t0:performance.now(),sp:b.poseSp||.1}:null;}
    if(b&&b.shake)cam.shake=Math.max(cam.shake||0,b.shake);}catch(e){}return r;};}
{const _e=stgEnd;stgEnd=function(){try{for(const n of npcs)n.pose=null;}catch(e){}hsBub(null);document.body.classList.remove('stgShow');return _e.apply(this,arguments);};}
// Caitlyn's other scenes that still come from the old words (the bouquet), spoken the same way
{const _g=stgGeneric;stgGeneric=function(id){HS_SHOWNEXT=id==='mae';try{return _g.apply(this,arguments);}finally{setTimeout(()=>{HS_SHOWNEXT=false;},0);}};}
let HS_SHOWNEXT=false;{const _s=stage;stage=function(def){if(HS_SHOWNEXT&&def)def.show=true;return _s.apply(this,arguments);};}
// (#300) the store's OPEN / CLOSED placard is part of the store, always there on the counter's end; Caitlyn turns it round at
// closing time (and for a scene). The scenes use the store's own windows and sign instead of putting new ones up.
const STORE_SIGN={closed:0};
(function(){const css=document.createElement('style');css.textContent=`#stgBars.thin:before,#stgBars.thin:after{height:3vh!important}`;document.head.appendChild(css);})();
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld.apply(this,arguments);try{if(S.room!=='store'||!ROOMS.store)return;const R=ROOMS.store,x=R.ox+14.9,z=R.oz+4.08;
  const closed=STORE_SIGN.closed||S.hour<7||S.hour>=18;
  D.push({z,mind:1,draw(){const X=Math.round(sx(x)),Y=Math.round(sz(z)),w=closed?27:19;ctx2.fillStyle='#120c08';ctx2.fillRect(X+4,Y-17,w,10);ctx2.fillRect(X+6,Y-8,2,3);ctx2.fillRect(X+w-1,Y-8,2,3);
    ctx2.fillStyle=closed?'#7a2420':'#2d5a30';ctx2.fillRect(X+5,Y-16,w-2,8);ctx2.fillStyle=closed?'#9a3a30':'#3d7a40';ctx2.fillRect(X+5,Y-16,w-2,1);ctx2.fillStyle='rgba(0,0,0,.3)';ctx2.fillRect(X+5,Y-9,w-2,1);
    if(typeof sgtT==='function'){const P=(a,b,ww,h,c)=>{ctx2.fillStyle=c;ctx2.fillRect(a,b,ww,h);};sgtT(P,closed?'CLOSED':'OPEN',X+6,Y-14,'#f0e4c8');}}});}catch(e){}};}
