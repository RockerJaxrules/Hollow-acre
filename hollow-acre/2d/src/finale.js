/* ================= the end of the story: credits, the thing after the credits, the letter the morning after, and what changes
   when you start again. ================= */
const STINGS={
  door:['Marrow Hollow. Next September.','The church is full for the drawing, out of habit.','Hale reaches into the hat. It should be empty.','His hand comes out holding a slip.','There is nothing written on it. Only a small drawing of a door, open an inch.'],
  shore:['The Black Lake. Some years later.','A boat comes out of the fog with nobody in it.','On the seat there is a watering can, and a hand-drawn map of a farm.','The farm on the map is labelled in your handwriting: HOME. DON’T.'],
  truck:['Route 9. Thirty years from now.','A car is parked on the shoulder with its hazards on.','A man is walking east toward a farm he has never seen.','On the seat behind him, a jar of mushrooms that glow in the daylight.'],
  dunn:['The sheriff’s office. Next September.','There are sixty slips of paper in the stove, half burned.','Every one has a name on it.','Every one is yours.'],
  tag:['Your field. Next October.','The pole is empty.','Something is standing on the porch instead, very still, wearing a straw hat with a faded red band.','It has a brass tag in its ear. The number on it has gone up by one.'],
  taken:['Marrow Hollow. Next October.','A car is wrapped around the oak on Route 9, its hazards blinking.','The note on the cabin door is in handwriting you know.','“Don’t come. — {name}”'],
};
{const c=document.createElement('style');c.textContent=`#credits2{position:fixed;inset:0;z-index:997;background:#050506;color:#e8dcc0;display:none;overflow:hidden;font-family:var(--font-display,Georgia,serif);text-align:center;cursor:pointer}
#credits2 .roll{position:absolute;left:0;right:0;top:100%;padding:0 24px;line-height:1.7}
#credits2 h2{font-size:34px;letter-spacing:.1em;color:#f0b070;margin:0 0 8px}#credits2 h3{font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#b8521c;margin:38px 0 8px}
#credits2 p{margin:2px 0;font-size:15px}#credits2 p small{opacity:.55}#credits2 .sting{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:30px;font-size:18px;line-height:1.6;opacity:0;transition:opacity 1.6s}
#credits2 .skip{position:absolute;right:14px;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);font-size:12px;opacity:.5}`;document.head.appendChild(c);
  const d=document.createElement('div');d.id='credits2';d.innerHTML='<div class="roll"></div><div class="sting"></div><div class="skip">tap to skip</div>';document.body.appendChild(d);}
function rollCredits(k,done){const el=$('credits2'),roll=el.querySelector('.roll'),st=el.querySelector('.sting');let fin=false,raf=0;
  const folk=npcs.filter(n=>PEOPLE[n.def.id]).map(n=>`<p>${n.def.name} <small>· ${n.def.role||''}</small></p>`).join('');
  roll.innerHTML=`<h2>Hollow Acre</h2><p><small>a valley that keeps what it is given</small></p><h3>The people of Marrow Hollow, the orchard, the mill, and Wickham Crossing</h3>${folk}
    <h3>The Tithes</h3><p>one for every autumn, back to the first</p><p><small>a hundred and fifty-three names, and room for one more</small></p>
    <h3>E. Marsh</h3><p>who called, and told you not to come</p><h3>And</h3><p>${NAME()||'you'}</p><p><small>who came anyway</small></p>
    <h3>Pixel art</h3><p><small>Every pixel drawn for this game</small></p><h3>Thank you for staying</h3><p><small>You can stop now. You can always stop now.</small></p>`;
  el.style.display='block';roll.style.transform='translateY(0)';st.style.opacity=0;st.innerHTML='';SFX.bell&&SFX.bell();
  const H0=roll.scrollHeight+innerHeight;let y=0,last=performance.now();
  const step=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;y+=dt*42;roll.style.transform=`translateY(${-y}px)`;if(y>H0){sting();return;}raf=requestAnimationFrame(step);};raf=requestAnimationFrame(step);
  const sting=()=>{cancelAnimationFrame(raf);roll.innerHTML='';const lines=(STINGS[k]||STINGS.taken).map(l=>l.replace('{name}',NAME()||'you'));let i=0;
    const next=()=>{if(fin)return;if(i>=lines.length){setTimeout(close,2600);return;}st.style.opacity=0;setTimeout(()=>{st.textContent=lines[i++];st.style.opacity=1;if(i===1)SFX.ring&&SFX.ring(0,.5);if(i===lines.length){SFX.stinger&&SFX.stinger();}setTimeout(next,2900);},700);};next();};
  const close=()=>{if(fin)return;fin=true;cancelAnimationFrame(raf);el.style.display='none';done&&done();};
  el.onclick=()=>{if(roll.innerHTML)sting();else close();};}
// the morning after: a letter
ST_LETTERS.epi_door=`Dear one,<br><br>I don’t remember you. I’m told I should. A man at the store says I was taken twenty-five autumns ago, and that every autumn since I came back as the thing in your field, standing between that door and this house so it would find me first.<br><br>I don’t remember that either. I only remember a voice on a telephone, telling someone not to come.<br><br>If that was me, I’m glad you didn’t listen.<br><br>— E. Marsh`;
ST_LETTERS.epi=`You made your choice. I made a different one, last year. We both ended up here, didn’t we.<br><br>Keep the field. Keep the light on. Keep your place warm.<br><br>See you next October.`;
{const _k=()=>{const st=S.st;if(st.done&&st.ending&&!st.epiMail){st.epiMail=1;setTimeout(()=>{st.mail=st.ending==='door'?'epi_door':'epi';toast('The flag on your mailbox is up.',2.6);},5200);}};
  $('keepFarming').addEventListener('click',_k);}
// what changes when you start again
if(stFound.length){const last=ST_END[stFound[stFound.length-1]];LETTER.push(`<span class="ps" style="display:block;margin-top:12px;font-style:italic">Under Grandpa’s signature, in different ink, in handwriting you know is yours: “You’ve done this before. Last time it ended with ${last?last.t:'the door'}. ${stFound.length>=6?'There is nothing left to choose. Stay anyway.':'Choose differently.'}”</span>`);}
