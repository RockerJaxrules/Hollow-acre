/* ================= the journal gets a second tab: Heart events. For everyone you can befriend: how many hearts each of
   their scenes needs, which you've seen, which is ready right now, and when and where to find them so it can play
   (a scene plays the first time you talk to them in the day once they have the hearts). ================= */
const PLACE_WORD={store:'at the general store',square:'in the square',school:'at school in the square',corn:'out by the corn',church:'at the church',
  graves:'in the graveyard',garage:'at Pruitt’s garage',porch_agnes:'on the Abernathy porch',farmgate:'by your farm gate',board:'by the notice board',
  farmlane:'on your lane',route:'on the mail route',dock:'on the pond dock',road_w:'out on Route 9',bake:'at the bake table in the square',
  orchard:'in the orchard',orchard_gate:'at the orchard gate',treetop:'up in the orchard trees',millroad:'on the mill road',mill:'at the mill',
  mill_step:'on the mill steps',river:'down by the river',quarry:'at the quarry',quarry_road:'on the quarry road',pump:'by the east pump',
  lake_dock:'on the lake dock',forge:'at the forge',forge_yard:'in the forge yard',carp:'at Hartley Carpentry',lumber:'at the lumber pile',
  pen:'by the stock pens',feed:'at Bell’s Feed & Stock',lane:'on the shop lane',bait:'at the bait & tackle shop',
  wk_woods:'in the woods outside Wickham',wk_square:'in Wickham square',wk_inn:'at the Wickham inn',wk_innwork:'working at the Wickham inn',
  wk_road:'on the Wickham road',wk_board:'by the Wickham notice board',wk_lane:'on a Wickham lane',wk_ferry:'at the Wickham ferry',
  wk_river:'by the Wickham river',wk_gardens:'in the Wickham gardens',wk_chapel:'at the Wickham chapel',vigil:'at the night vigil',fest:'at the festival in the town square',farmgate:'by your farm gate'};
const placeWord=(k,L)=>k==='home'?'at home'+(L&&HOMES[L.home]?` (${HOMES[L.home].name})`:''):PLACE_WORD[k]||'out and about';
const clockH=h=>{let hh=Math.floor(h),mm=Math.round((h-hh)*4)*15;if(mm===60){hh++;mm=0;}const h12=((hh+11)%12)+1;return h12+(mm?':'+String(mm).padStart(2,'0'):'')+(hh<12?'am':'pm');};
const HE_LATEST=20.25;   // isNight(): after this, talking never starts a scene
// their day, as the places they're out at (home is where they are the rest of the time)
function heWhere(id){const L=LIFE[id];if(!L||!L.day)return '';const out=[];
  for(let i=0;i<L.day.length;i++){const [h,k]=L.day[i];if(k==='home')continue;const end=i+1<L.day.length?L.day[i+1][0]:k==='church'?HE_LATEST:19.6;if(end<=h)continue;
    out.push(`${clockH(h)}–${clockH(end)} ${placeWord(k,L)}`);}
  return out.length?out.join(' · ')+(L.home&&HOMES[L.home]?` · otherwise at home (${HOMES[L.home].name})`:''):placeWord('home',L);}
function heState(id,e){if(S.heartSeen[id+e.h])return 'seen';
  if(typeof ROMANCE!=='undefined'&&ROMANCE[id]&&e.h>8&&!romDating(id))return 'date';
  return hearts(id)>=e.h?'ready':'locked';}
function heartEventsHtml(){const ppl=npcs.filter(n=>PEOPLE[n.def.id]&&(PEOPLE[n.def.id].events||[]).length);
  const nowH=S.hour,canNow=nowH<HE_LATEST;let ready=[],h='';
  for(const n of ppl){const id=n.def.id,P_=PEOPLE[id],evs=P_.events.slice().sort((a,b)=>a.h-b.h),met=!!(S.talked&&S.talked[id]);
    const seen=evs.filter(e=>heState(id,e)==='seen').length,next=evs.find(e=>heState(id,e)!=='seen');const st=next&&heState(id,next);
    if(st==='ready')ready.push(n.def.name);
    const cur=typeof wantFor==='function'?wantFor(n):null;
    h+=`<div class="herow${st==='ready'?' heready':''}"><div class="hehead"><b>${n.def.name}</b><span class="hearts">${heartStr(id)}</span><span class="jsub">${seen}/${evs.length} seen</span></div>`;
    h+=`<div class="jsub">${met?'':'You haven’t met yet. '}Find them: ${heWhere(id)}.${cur&&S.hour<HE_LATEST?` <i>Right now: ${placeWord(cur,LIFE[id])}.</i>`:''}</div><ul class="helist">`;
    for(const e of evs){const s=heState(id,e);
      const what=s==='seen'?'<span class="hes">Seen ✓</span>'
        :s==='ready'?`<span class="hen">Ready: talk to ${n.def.name} before ${clockH(HE_LATEST)}</span>`
        :s==='date'?`<span class="hel">Only once you’re dating (bring a bouquet at ♥8)</span>`
        :`<span class="hel">${Math.ceil(e.h)-hearts(id)} more ${Math.ceil(e.h)-hearts(id)===1?'heart':'hearts'}</span>`;
      h+=`<li><span class="heh">♥${Math.ceil(e.h)}</span> <span class="het">${s==='seen'||s==='ready'?e.title:'<i>'+e.title+'</i>'}</span> — ${what}</li>`;}
    h+='</ul></div>';}
  const top=`<p class="jsub">A heart event plays the first time you talk to someone during the day (before ${clockH(HE_LATEST)}) once they have enough hearts. Talk to people every day and bring gifts they like to raise hearts. If they have something to tell you about a job first, that comes first; talk again tomorrow.</p>`+
    (ready.length?`<p class="heready-sum">Ready now: <b>${ready.join(', ')}</b>${canNow?'':' (tomorrow, it’s too late tonight)'}</p>`:'');
  return top+h;}
let JTAB='notes';
function journalTabs(which){const el=$('noteText');if(!el)return;JTAB=which;let bar=el.querySelector('.jtabs');
  if(!bar){bar=document.createElement('div');bar.className='jtabs';bar.innerHTML='<button data-t="notes">Journal</button><button data-t="hearts">Heart events</button>';
    bar.querySelectorAll('button').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();if(b.dataset.t===JTAB)return;if(b.dataset.t==='notes'){JTAB='notes';openJournal();}else journalTabs('hearts');}));}
  bar.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.t===which));
  if(which==='hearts'){el.innerHTML='<h3>Heart events</h3>';el.appendChild(bar);el.insertAdjacentHTML('beforeend',heartEventsHtml());el.scrollTop=0;}
  else{const h3=el.querySelector('h3');if(h3)h3.after(bar);else el.prepend(bar);}}
{const _oj=openJournal;openJournal=function(){const r=_oj.apply(this,arguments);try{journalTabs(JTAB==='hearts'?'hearts':'notes');}catch(e){console.warn(e);}return r;};}
{const st=document.createElement('style');st.textContent=`.jtabs{display:flex;gap:6px;margin:0 0 .6em}.jtabs button{flex:1;font:inherit;font-size:.9em;padding:.35em .5em;border:2px solid #6a4a2a;background:#3a2616;color:#e8d4b0;border-radius:3px;cursor:pointer}
 .jtabs button.on{background:#a8743a;color:#1e140a;border-color:#e0b070}.herow{margin:.55em 0;padding:.45em .55em;border:1px solid rgba(90,60,30,.25);border-radius:4px}
 .herow.heready{border-color:#b8322a;box-shadow:0 0 0 1px rgba(224,96,90,.35) inset}.hehead{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px}.hehead .jsub{margin-left:auto}
 .helist{margin:.3em 0 0;padding-left:1.1em}.helist li{margin:.15em 0;font-size:.92em}.heh{color:#b8322a;font-weight:bold}.hes{opacity:.6}.hen{color:#9a3a10;font-weight:bold;font-style:normal}.hel{opacity:.75}
 .heready-sum{background:rgba(224,96,90,.16);padding:.35em .5em;border-radius:4px}`;document.head.appendChild(st);}
