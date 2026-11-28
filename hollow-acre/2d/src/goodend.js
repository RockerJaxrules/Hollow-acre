/* ================= the good ending, easy to get (owner: "The good ending should be easy to get"; docs/STORY_PLAN.md 4.1).
   On Tithe night the door opens from this side for anyone who has set the three stones on the step. Nothing else is needed:
   no Ward, no hearts, no shard, ribbon or letter. In the choice it is listed first and lit; the other endings show only when
   you hold what they need, and the locked rows ("Needs the full Ward...") are gone. What you do hold still colours it: the
   shard, the ribbon and Danny's letter keep their lines in the ending, and without them it reads without them. The Journal's
   true-ending checklist (Jaxon 7) and Hale's advice in the last days say the same. Later chapters may add main-story items to
   GOOD_NEEDS; nothing optional ever goes in it. The ending files (ending_*.js) are not touched. ================= */
const GOOD_NEEDS=[];   // main-story key items the door also needs (none in today's story)
const goodHas=k=>typeof stHas==='function'&&stHas(k);
const goodDanny=()=>(S.lore||[]).some(l=>l.startsWith('Danny’s letter'));
function goodReady(){const st=S.st||{};return (st.set||0)>=3&&GOOD_NEEDS.every(goodHas);}
{const c=document.createElement('style');c.textContent='#note #noteText button.endc.endgood{background:#8a4a16!important;color:#fff0cc!important;box-shadow:inset 0 0 0 1px #120a04,inset 0 0 0 3px #f0a040,0 0 12px rgba(240,160,64,.45)!important}';document.head.appendChild(c);}

// ---- the choice at the door: the good ending first and lit, only the endings you can take, no locked rows
function goodMenu(html){
  const i=html.search(/<button class="btn endc"|<div class="jsub" style="margin:6px 0;opacity:\.55">/);if(i<0)return html;
  const btns=[...html.slice(i).matchAll(/<button class="btn endc" data-e="(\w+)"[^>]*>([^<]*)<\/button>/g)].map(m=>[m[1],m[2]]);
  const door=btns.find(b=>b[0]==='door');const rows=[];
  if(goodReady()||door)rows.push(['door',door?door[1]:'Push the door open from this side']);
  for(const b of btns)if(b[0]!=='door')rows.push(b);
  return html.slice(0,i)+rows.map(([k,l])=>`<button class="btn endc${k==='door'?' endgood':''}" data-e="${k}" style="display:block;width:100%;margin:6px 0;text-align:left">${l}</button>`).join('');}
{const _on=openNote;openNote=function(html,btn,cb){try{if(typeof html==='string'&&html.includes('<h3>The Tithe House</h3>')&&/class="btn endc"/.test(html))html=goodMenu(html);}catch(e){}
  return _on.call(this,html,btn,cb);};}

// ---- the ending reads true to what you hold: no fourth shard, ribbon or letter that you never had
{const _se=stEnding;stEnding=function(k){const E=typeof ST_END!=='undefined'&&ST_END[k];if(k!=='door'||!E||typeof E.text!=='string')return _se.apply(this,arguments);
  const keep=E.text;let t=keep;
  if(!goodHas('shard'))t=t.replace('You set the fourth shard on the step beside the other three.','The three stones sit on the step, warm as skin.');
  if(!goodHas('ribbon'))t=t.replace(' Ruth’s ribbon catches from the heat of it alone and burns blue.','');
  if(!goodDanny())t=t.replace('Danny’s letter was right. It was never a monster.','It was never a monster.');
  E.text=t;try{return _se.apply(this,arguments);}finally{E.text=keep;}};}

// ---- the last days: no more "a full Ward might open another way"; the arrow no longer points at the church for it
{const _o=objective;objective=function(){const r=_o.apply(this,arguments);try{if(r&&r[0]==='The last days'&&/ Ward \d+\/\d+: a full Ward might open another way\./.test(r[1])){
      return [r[0],r[1].replace(/ Ward \d+\/\d+: a full Ward might open another way\./,''),null];}}catch(e){}return r;};}
{const _g=stepGuide;stepGuide=function(){const r=_g.apply(this,arguments);try{if(r&&r[0]==='hale'&&/^Keep the Ward, all six\./.test(r[1]))
    return ['hale','The stones are home. On Tithe night the door will open for whoever opens it. What people give you this week only gives you other ways out.'];}catch(e){}return r;};}

// ---- the Journal's checklist (Jaxon 7): the stones are all it takes; the rest is extra
trueCheckHtml=function(){const st=S.st||{},got=st.got||{},tick=b=>b?'<b style="color:#8fd06a">✓</b>':'<span style="opacity:.5">○</span>';
  const H=id=>typeof hearts==='function'?hearts(id):0;
  const row=(ok,txt,hint)=>`<p>${tick(ok)} ${txt}${!ok&&hint?`<br><span class="jsub" style="display:block;margin-left:1.4em">${hint}</span>`:''}</p>`;
  let h='<h4>The good ending · Jaxon 7</h4>';
  const set=Math.min(st.set||0,3);const left=[['dock','under the Black Lake dock (Otto’s ash rod)'],['tree','in the hollow tree at noon (steel axe)'],['bed','under your bed (steel pickaxe)']].filter(([k])=>!got[k]).map(m=>m[1]);
  h+=row(set>=3,`The three black stones on the Tithe House doorstep: ${set}/3`,
    !st.act||st.act<3?'The letter in your mailbox says where they are. It comes once Chapter Two’s places, things known and first two Ward bundles are done.':left.length?'Still to find: '+left.join('; ')+'.':'You have them. Set them at the Tithe House door (X: Set stones).');
  for(const k of GOOD_NEEDS)h+=row(goodHas(k),k,'');
  let night;if(st.done)night='The story is over on this farm.';else if(!st.tithe)night='Tithe night is set when the third stone goes on the step: seven days later.';
  else{const L=stLeft();night=L>0?`Tithe night is in ${L} day${L>1?'s':''}.`:'Tithe night is tonight. After the bell, walk to the Tithe House and press X: Open.';}
  h+=`<p style="margin-top:.6em">${night}</p>`;
  if(goodReady())h+='<p style="color:#8fd06a">That is all it takes. On Tithe night choose <b>Push the door open from this side</b>.</p>';
  const wd=wardDone(),extra=[[wd>=WARD.length,`The full Ward: ${wd}/${WARD.length}`],[goodHas('shard'),`The fourth shard (Maud, 9 hearts; you have ${H('maud')})`],
    [goodHas('ribbon'),`Ruth’s ribbon (Agnes, 10 hearts; you have ${H('agnes')})`],[goodDanny(),`Danny’s letter (Caitlyn; you have ${H('mae')} hearts)`]];
  h+='<p class="jsub" style="margin-top:.8em">Not needed for the good ending. These only add to how it reads:</p>'+extra.map(([ok,t])=>`<p class="jsub">${tick(ok)} ${t}</p>`).join('');
  if(typeof safeNight==='function'&&safeNight())h+='<p class="jsub">Jaxon 8 is on: Tithe night can’t take you. The bad ending only happens if you choose to go in.</p>';
  return h;};
window.__goodend={ready:goodReady,menu:goodMenu};
