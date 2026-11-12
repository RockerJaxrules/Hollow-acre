/* ================= #241 the tutorial on a friend's farm. A farmhand used to join with the tutorial switched off, and it couldn't
   have worked anyway: its steps waited on the farm's own "first time" flags (first tilled, planted, watered), which the host
   had long since set. Now the tutorial and those flags are each player's own, so a farmhand who's new to the valley is taught
   on the shared field from their first step (someone who already knows the game carries on from wherever their own save
   was). A brand-new player makes their character before they walk onto the farm, and the "tap things to use them" step asks
   them to greet someone or open a door, since the note on Grandpa's door is the host's. ================= */
const MPT_EVER=['everTilled','everPlanted','everWatered'];
for(const k of MPT_EVER)if(!PERSONAL.includes(k))PERSONAL.push(k);
// a key a player has never set comes across as "not yet", not as the host's
{const _pp=putPersonal;putPersonal=function(o){if(HOST.role==='guest'&&o)for(const k of MPT_EVER)if(!(k in o))o[k]=false;return _pp.apply(this,arguments);};}
{const _tp=takePersonal;takePersonal=function(){const o=_tp.apply(this,arguments);for(const k of MPT_EVER)o[k]=!!S[k];return o;};}
// the "use things" step on someone else's farm
{const st=TUT.find(s=>s.id==='act');if(st){const d0=st.done,t0=st.text;st.done=()=>d0()&&(HOST.role!=='guest'||!!(S.tut&&S.tut.acted));
  st.text=()=>HOST.role==='guest'?(TOUCH?'To talk, open or pick something up, just <b>tap it</b>. Say hello to someone, or tap the door of your cabin.':'To talk, open or pick something up, <b>right-click</b> it (or face it and press <b>X</b>). Say hello to someone, or open the door of your cabin.'):t0();}}
const mptActed=()=>{try{if(S.tut)S.tut.acted=true;}catch(e){}};
{const _t=talk;talk=function(){mptActed();return _t.apply(this,arguments);};}
{const _e=enterRoom;enterRoom=function(){mptActed();return _e.apply(this,arguments);};}
{const _s=openShop;openShop=function(){mptActed();return _s.apply(this,arguments);};}
// someone new to the valley makes their character first, then walks onto the farm
{const go=()=>{const b=[...document.querySelectorAll('#title button')].find(x=>/^Join farm/.test(x.textContent));if(!b){if($('loadScr'))setTimeout(go,400);return;}
    b.addEventListener('click',e=>{if(b._made)return;let own=null,made=null;try{own=readSave();made=localStorage.getItem('hollowLook'+ACCT_SUFFIX);}catch(x){}if(own||made)return;   // (no save and no character made on this profile yet)
      e.stopImmediatePropagation();e.preventDefault();window.openWardrobe();S.paused=false;$('cKick').textContent='Who’s joining';$('cGo').textContent='Join the farm';
      const once=()=>{$('cGo').removeEventListener('click',once);b._made=true;setTimeout(()=>{toast('Off to the farm…',1.6);b.click();},60);};$('cGo').addEventListener('click',once);},true);};setTimeout(go,300);}
