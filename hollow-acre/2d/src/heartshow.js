/* ================= #296 Caitlyn's heart events, shown instead of read. The owner: "the problem with Caitlyn's heart events is you
   have them read instead of show". A scene marked show:true plays without the caption box and its portrait: whatever is said
   comes out of the speaker's mouth as a speech bubble over their head, in the world, and goes on by itself once there's been
   time to read it (a tap still hurries it). The events themselves are cut down to a few short lines; everything else is acted:
   she lifts things, hands them over, throws them down (pose:{id:'spellcast'|'thrust'|'slash'}), people come and go, the
   camera goes where to look. ================= */
(function(){const css=document.createElement('style');css.textContent=`
body.stgShow #stgCap{display:none!important}
#stgBub{position:fixed;z-index:61;pointer-events:none;display:none;transform:translate(-50%,-100%);max-width:min(46vw,20em);
 background:#f3ead6;color:#1e1610;border:2px solid #1e1610;box-shadow:3px 3px 0 rgba(0,0,0,.45);padding:6px 10px 7px;
 font:clamp(12px,1.45vw,21px)/1.35 'Hollow Pixel',monospace;text-align:center;box-sizing:border-box}
#stgBub.on{display:block}
#stgBub:after{content:'';position:absolute;left:var(--tail,50%);bottom:-9px;width:10px;height:8px;margin-left:-5px;background:#f3ead6;border:2px solid #1e1610;border-top:none;
 clip-path:polygon(0 0,100% 0,30% 100%);}
#stgBub.you{background:#e2ecf0}#stgBub.you:after{background:#e2ecf0}
#stgBub.thing{background:#1e1a16;color:#e8dcc0;border-color:#8a7a5a;font-style:italic}#stgBub.thing:after{background:#1e1a16;border-color:#8a7a5a}`;
  document.head.appendChild(css);const b=document.createElement('div');b.id='stgBub';document.body.appendChild(b);})();
// where a speaker's head is on the page
function hsBubAt(b){const c=($('view')||$('c'));if(!c)return null;const r=c.getBoundingClientRect();let X,Y;
  if(b.at){X=sx(b.at.x);Y=sz(b.at.z)-(b.at.h||20);}else{const a=stgActor(b.who);if(!a)return null;X=sx(a.x);Y=sz(a.z)-48;}
  return {x:r.left+X*r.width/c.width,y:r.top+Y*r.height/c.height};}
function hsBub(b,txt){const e=$('stgBub');if(!b||!txt){e.classList.remove('on');return;}e.className='on'+(b.who==='you'?' you':!b.who||b.at?' thing':'');e.innerHTML=txt;
  const p=hsBubAt(b);if(!p){e.style.left='50%';e.style.top='22%';return;}const w=e.offsetWidth||200,h=e.offsetHeight||40,x=Math.max(w/2+8,Math.min(innerWidth-w/2-8,p.x)),y=Math.max(h+8,p.y-6);
  e.style.left=x+'px';e.style.top=y+'px';e.style.setProperty('--tail',Math.max(12,Math.min(w-12,w/2+(p.x-x)))+'px');}
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
