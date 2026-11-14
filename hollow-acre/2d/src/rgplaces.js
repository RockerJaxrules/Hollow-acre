/* ================= the journal's Places tab: the eight places out past the old valley, what you've found in each, what grows
   and swims there, who goes out there and when, what the story has shown you there, and what happens there after dark. ================= */
const RG_HINT={r9w:'West along Route 9, past where you crashed.',grey:'Off Route 9 West, down a lane to the south.',fen:'South-west, where the river runs out.',
  corn:'South down Mill Road, over the river.',drown:'Off Mill Road south of the river, then east.',ridge:'Up Lookout Road, north off the main road past the quarry.',
  marrow:'Up the old road north of the graveyard.',birch:'North-west: the path west from Old Marrow, or north from the motel.'};
function placesHtml(){const tick=b=>b?'<b style="color:#4a8a2a">✓</b>':'<span style="opacity:.5">○</span>';let h='<p class="jsub">The land past the old valley. The old county milestones take you between any two you’ve found.</p>';
  for(const r of REGS){const k=r.k,seen=S.rg&&S.rg.seen&&S.rg.seen[k];
    h+=`<div class="herow"><div class="hehead"><b>${r.name}</b><span class="jsub">${seen?'Found on day '+seen:'Not found yet'}</span></div>`;
    if(!seen){h+=`<div class="jsub">${RG_HINT[k]}</div></div>`;continue;}
    h+=`<div class="jsub"><i>${RG_LINE[k]}</i></div><ul class="helist">`;
    const f=RG_FOR[k];if(f&&ITEMS[f[0]])h+=`<li>Gather: <b>${ITEMS[f[0]].name}</b>, a few each morning</li>`;
    const w=k==='fen'?'fen':k==='drown'?'res':null;if(w){const fish=FISH.filter(q=>q[4]===w).map(q=>`${q[0]}${q[5]==='night'?' (night)':q[5]==='day'?' (day)':''}`);h+=`<li>Fish: ${fish.join(', ')}</li>`;}
    const who=RGV.filter(v=>{const g=rgAt(v.at[0],v.at[1]);return g&&g.k===k;});if(who.length)h+=`<li>Who comes out here: ${who.map(v=>`${sgName(v.id)} (${rgvWhen(v)})`).join('; ')}</li>`;
    const beats=RG_BEATS.filter(b=>{try{const p=b.at();const g=rgAt(p.x,p.z);return g&&g.k===k;}catch(e){return false;}});
    for(const b of beats)h+=`<li>${tick(sgDone(b.id))} ${sgDone(b.id)?sgVal(b.title):'<i>Something here is part of the story</i>'}</li>`;
    const rooms=Object.entries(RG_ROOMS).filter(([rk,rr])=>{try{const d=rr.door();const g=rgAt(d.x,d.z);return g&&g.k===k;}catch(e){return false;}});
    for(const [rk,rr] of rooms)h+=`<li>${tick(S.first&&S.first['room_'+rk])} Inside: ${rr.name}</li>`;
    const ns=S.rgNightSeen&&S.rgNightSeen[k];h+=`<li>After dark: ${ns?ns:'<i>you haven’t been out here at night</i>'}</li></ul></div>`;}
  return h;}
{const _jt=journalTabs;journalTabs=function(which){const r=_jt.apply(this,arguments);try{const el=$('noteText');const bar=el&&el.querySelector('.jtabs');if(!bar)return r;
  let b=bar.querySelector('[data-t="places"]');if(!b){b=document.createElement('button');b.dataset.t='places';b.textContent='Places';bar.appendChild(b);
    b.addEventListener('click',e=>{e.stopPropagation();if(JTAB==='places')return;journalTabs('places');});}
  bar.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x.dataset.t===which));
  if(which==='places'){JTAB='places';el.innerHTML='<h3>Places</h3>';el.appendChild(bar);el.insertAdjacentHTML('beforeend',placesHtml());el.scrollTop=0;}}catch(e){console.warn(e);}return r;};}
{const _oj=openJournal;openJournal=function(){const was=JTAB;const r=_oj.apply(this,arguments);try{if(was==='places')journalTabs('places');}catch(e){}return r;};}
