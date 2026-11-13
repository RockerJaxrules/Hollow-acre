// t337 playthrough bot: helpers evaluated INSIDE the game's scope (through __game.ev), so they can reach the game's own
// functions and state. Everything here does what a player's tap would do, or reads what a player would see.
// sounds: every SFX the game asks to play (and the raw tones and noise bursts the minigames use), kept until the next stop
// collects them, so the review can see which actions made no sound at all
(()=>{try{if(window.__pbSfx)return;window.__pbSfx=[];
  for(const k of Object.keys(SFX)){const f=SFX[k];if(typeof f!=='function')continue;SFX[k]=function(){try{window.__pbSfx.push(k);}catch(e){}return f.apply(this,arguments);};}
  for(const k of ['tone','hiss']){const f=A&&A[k];if(typeof f!=='function')continue;A[k]=function(){try{window.__pbSfx.push('~'+k);}catch(e){}return f.apply(this,arguments);};}}catch(e){}})();
window.__pb=(()=>{
  const vis=el=>!!(el&&!el.hidden&&el.offsetParent!==null&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden');
  const q=s=>document.querySelector(s);
  const strip=s=>String(s==null?'':s).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  function obj(){try{const o=objective();const t=o&&o[2];return {t:o?strip(o[0]):'',d:o?strip(o[1]).slice(0,240):'',x:t&&isFinite(t.x)?+t.x:null,z:t&&isFinite(t.z)?+t.z:null,npc:t&&t.def?t.def.id:null};}catch(e){return {t:'ERR',d:e.message};}}
  // which layers of UI are open over the game
  function ui(){const o={mode:S.mode,paused:!!S.paused};
    if(typeof SCENE!=='undefined'&&SCENE)o.scene=true;if(vis($('note')))o.note=true;if(vis($('talk')))o.talk=true;if(vis($('shop')))o.shop=true;
    if(vis($('bagBody')))o.bag=true;if(vis($('shipBin')))o.ship=true;if(typeof MG4!=='undefined'&&MG4.on)o.mg=true;if(vis(q('#craft')))o.craft=true;if(vis($('end')))o.end=true;if(typeof RU!=='undefined'&&RU.on)o.closeup=true;if(typeof STG!=='undefined'&&STG&&!STG.ended)o.stage=true;if(vis($('credits')))o.credits=true;
    if(vis($('title')))o.title=true;if(vis(q('#tut'))||vis(q('.tip')))o.tip=true;if(vis($('mapWrap')))o.map=true;if(vis(q('#journal')))o.journal=true;if(vis(q('#menu'))||vis(q('#gameMenu')))o.menu=true;
    if(vis(q('#chCard.on')))o.card=true;if(typeof cine!=='undefined'&&cine)o.cine=true;if(vis($('scare')))o.scareEl=true;if(vis(q('#sleepSum'))||vis(q('#shipSum'))||vis($('saleOk')))o.summary=true;
    return o;}
  // close one layer the way a player would (the button on it), and say what was closed
  function close1(){try{
    if(typeof SCENE!=='undefined'&&SCENE){const el=$('scene');el&&el.click();return 'scene';}
    if(typeof STG!=='undefined'&&STG&&!STG.ended&&typeof stgNext==='function'){stgNext();return 'stage';}
    if(typeof RU!=='undefined'&&RU.on&&typeof ruClose==='function'){ruClose();return 'closeup';}
    if(vis($('end'))&&vis($('keepFarming'))){$('keepFarming').click();return 'end card: keep farming';}
    if(typeof MG4!=='undefined'&&MG4.on){const b=$('mg4Skip');if(vis(b)){b.click();return 'mg';}}
    // the Tithe House choice: pick an ending the way a player would (the first open one that isn't simply going in), never close it
    {const ends=[...document.querySelectorAll('#noteText .endc')].filter(vis);if(ends.length){const b=ends.find(e=>e.dataset.e!=='taken')||ends[0];b.click();return 'ending: '+b.dataset.e;}}
    if(vis($('note'))){$('noteClose').click();return 'note';}
    if(vis($('talk'))){$('talkClose').click();return 'talk';}
    if(vis($('shop'))){$('shopClose').click();return 'shop';}
    if(vis(q('#craft'))){const b=$('crClose');b&&b.click();return 'craft';}
    if(vis($('bagBody'))){$('bagClose').click();return 'bag';}
    if(vis($('shipBin'))){$('sbDone').click();return 'shipbin';}
    if(vis($('mapWrap'))){const b=q('#mapWrap .close,#mapClose');if(b){b.click();return 'map';}}
    if(vis(q('#chCard.on'))){q('#chCard').click();return 'card';}
    if(vis($('saleOk'))){$('saleOk').click();return 'sale';}
    if(vis($('lvlOk'))){$('lvlOk').click();return 'level';}
    for(const id of ['sbDone','fsOk','dispClose','sndClose','tutNext']){const b=$(id);if(vis(b)){b.click();return id;}}
    const anyClose=[...document.querySelectorAll('button.close,button[id$="Close"],.mClose')].find(vis);if(anyClose){anyClose.click();return 'close:'+(anyClose.id||anyClose.className);}
    }catch(e){return 'err '+e.message;}return null;}
  function state(){const o=obj();let room=null;try{room=S.room||null;}catch(e){}
    return {day:S.day,hour:+(S.hour||0).toFixed(2),room,x:+P.x.toFixed(1),z:+P.z.toFixed(1),coins:S.coins,mode:S.mode,obj:o.t,objText:o.d,
      chapter:typeof sagaChapter==='function'?sagaChapter():null,bound:!!S.bound,tithe:S.st&&S.st.tithe||0,act:S.st&&S.st.act||0,done:!!(S.st&&S.st.done),mind:typeof M!=='undefined'?Math.round(M.v):null,
      weather:S.storm?'storm':(S.rain||S.weather||null)};}
  // automatic checks a careful player would notice
  function check(){const R={};
    const hud=($('hud')&&$('hud').innerText)||'';R.nanInHud=/NaN|undefined|\[object/.test(hud+' '+(($('objective')||{}).innerText||''));
    // text spilling out of its box (labels, buttons, notes, bubbles)
    const over=[];for(const el of document.querySelectorAll('button,.label,.tip,#objective,#toast,#noteText,#talkLine,#shopRows .shop-row,.bzr,.chip,#mg4H,#cgH')){if(!vis(el))continue;
      if(el.scrollWidth>el.clientWidth+3&&getComputedStyle(el).overflowX!=='auto'&&getComputedStyle(el).overflowX!=='scroll'&&el.clientWidth>0)over.push((el.id||el.className||el.tagName).toString().slice(0,30)+':'+strip(el.textContent).slice(0,30));}
    R.overflow=over.slice(0,8);
    // a toast or bubble drawn over the player
    try{const t=$('toast');if(vis(t)){const r=t.getBoundingClientRect(),c=$('view').getBoundingClientRect();const px=c.left+c.width/2,py=c.top+c.height*.56;R.toastOverPlayer=px>r.left&&px<r.right&&py>r.top-20&&py<r.bottom+20;R.toast=strip(t.textContent).slice(0,120);}}catch(e){}
    // sprites the game wanted but couldn't draw
    try{let miss=0,names=[];for(const [k,im] of Object.entries(IMG)){if(im&&im.complete===true&&im.naturalWidth===0&&!/^mem:/.test(k)){miss++;if(names.length<6)names.push(k);}}R.brokenImages=miss;R.brokenNames=names;}catch(e){}
    try{R.objText=obj().t;}catch(e){}
    // the fonts the visible text is set in (a finished game uses one or two, everywhere)
    try{const fams=new Set();for(const el of document.querySelectorAll('#hud *,#objective,#toast,#noteText,#noteText *,#talk *,#shopRows *,button,.tip,#craft *,#title *,#end *,#ruCap')){if(!vis(el))continue;
        if(![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;fams.add(getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g,'').trim());}R.fonts=[...fams].slice(0,8);}catch(e){}
    // placeholder or debug text a player can see
    try{const txt=[...document.querySelectorAll('#hud,#objective,#toast,#note,#talk,#shop,#craft,.tip,#title,#end,#credits2,#ruBox,#bagBody')].filter(vis).map(e=>e.innerText).join(' \n ');
      const m=(txt.match(/\b(TODO|FIXME|lorem|ipsum|placeholder|debug|XXX)\b|\(bot\)|\[object [A-Za-z]+\]|\$\{/gi)||[]).concat(txt.match(/\b(undefined|NaN|null)\b/g)||[]);R.placeholder=m.length?[...new Set(m)].slice(0,6):[];}catch(e){}
    try{R.ui=ui();}catch(e){}
    return R;}
  // stand next to a point (outside walls and water), facing it
  function near(x,z,d){d=d==null?.9:d;const tries=[[0,d],[0,-d],[d,0],[-d,0],[d*.7,d*.7],[-d*.7,d*.7],[0,d*1.8],[d*1.8,0],[-d*1.8,0],[0,-d*1.8]];
    for(const [dx,dz] of tries){const p={x:x+dx,z:z+dz};try{collide(p,.3);}catch(e){}if(Math.hypot(p.x-x-dx,p.z-z-dz)<.05&&!(typeof LAYERS!=='undefined'&&LAYERS.water&&LAYERS.water(p.x,p.z))){P.x=p.x;P.z=p.z;const L=Math.hypot(x-P.x,z-P.z)||1;P.fx=(x-P.x)/L;P.fz=(z-P.z)/L;P.dir=Math.abs(P.fx)>Math.abs(P.fz)?(P.fx>0?'E':'W'):(P.fz>0?'S':'N');P.walkTo=null;return true;}}
    P.x=x;P.z=z+d;return false;}
  // press the action button
  function act(){try{const c=computeContext();if(c&&c.ok&&c.act){c.act();return c.label||'act';}return c&&c.label?'no:'+c.label:null;}catch(e){return 'err '+e.message;}}
  // walk to the thing nearest a point that can be used, and use it
  function goAct(x,z,rad){rad=rad||4;let best=null,bd=1e9;for(const it of interact){try{if(it.npc!==undefined)continue;if(it.on&&!it.on())continue;const d=Math.hypot(it.x-x,it.z-z);if(d<rad&&d<bd){bd=d;best=it;}}catch(e){}}
    if(best)near(best.x,best.z,Math.min(.5,(best.r||1)*.45));else near(x,z,.9);return act();}
  function goRoomOut(){try{if(S.room&&typeof leaveRoom==='function'){leaveRoom();return true;}}catch(e){}return false;}
  function takeSfx(){const a=window.__pbSfx||[];window.__pbSfx=[];const c={};for(const k of a)c[k]=(c[k]||0)+1;return c;}
  return {obj,ui,close1,state,check,near,act,goAct,goRoomOut,strip,vis,takeSfx};})();
1;
