/* ================= W4, Chapter Three part A (story plan, chapter 3, beat 1): the first night of the Tithe, the church bell
   rings once at three in the morning, by itself, and wakes you; from then on, where people would say your name, the talk box
   holds a gap; and June's mail for you comes addressed THE TITHE, HOLLOW ACRE. Shown and heard, never explained. ========== */
const w4S3=()=>{if(!S.w4||typeof S.w4!=='object')S.w4={};return S.w4;};
const w4Fear3=(n,why)=>{try{if(typeof fearAdd==='function')return fearAdd(n,why);if(typeof mindHit==='function')mindHit(Math.max(1,Math.round(n/2)));}catch(e){}};
// the Tithe chapter's first day, kept the first time it's seen
setInterval(()=>{try{const s=w4S3();if(S.st&&S.st.started&&!S.st.done&&!s.titheDay)s.titheDay=S.day;}catch(e){}},1000);
const w4Tithe=()=>{try{return !!(S.st&&S.st.started&&!S.st.done&&w4S3().titheDay);}catch(e){return false;}};

// ---- three in the morning: the bell, once
{const c=document.createElement('style');c.textContent=`#w4wake{position:fixed;inset:0;background:#030304;z-index:60;display:flex;align-items:center;justify-content:center;opacity:1;transition:opacity 1.1s ease}
#w4wake .t{font:30px 'Hollow Pixel',ui-monospace,monospace;color:#b8b0a4;letter-spacing:.08em}#w4wake.out{opacity:0}
#talkLine .w4gap{display:inline-block;width:3.4em;height:.9em;border-bottom:1px solid currentColor;opacity:.3;vertical-align:baseline}#talkLine .w4greet{display:block;margin-bottom:.3em}`;document.head.appendChild(c);}
function w4Bell1(){try{if(typeof A!=='undefined'&&A.ok)for(const [f,v,d] of [[196,.22,5],[196*2.76,.09,3.5],[196*5.4,.05,2],[98,.14,5]])A.tone(f,d,'sine',v,{verb:true,a:.005});}catch(e){}
  try{if(typeof cap7Show==='function')cap7Show('The church bell rings once',0);}catch(e){}}
function w4Wake3(){const s=w4S3();if(s.bell3)return;s.bell3=S.day;S.odd=S.odd||{};S.odd.bell3=S.day;const was=!!S.paused;S.paused=true;
  const d=document.createElement('div');d.id='w4wake';d.innerHTML='<div class="t">3:00 AM</div>';document.body.appendChild(d);
  setTimeout(w4Bell1,800);setTimeout(()=>d.classList.add('out'),4600);setTimeout(()=>{d.remove();S.paused=was;w4Fear3(3,'the bell at three');},5800);}
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);try{const s=w4S3();if(w4Tithe()&&!s.bell3&&S.day>s.titheDay)setTimeout(w4Wake3,300);}catch(e){}return r;};}
try{if(typeof LD_ODD==='object')LD_ODD.bell3='The church bell rang once, at three in the morning, by itself.';}catch(e){}

// ---- your name: where they would say it, a gap
{const _t=talk;talk=function(n){const r=_t.apply(this,arguments);try{w4OnTalk3(n);}catch(e){console.warn('w4c',e);}return r;};}
function w4OnTalk3(n){if(!n||!n.def||!w4Tithe())return;const line=$('talkLine'),box=$('talk');if(!line||!box||box.hidden)return;const s=w4S3(),id=n.def.id;
  if(id==='june'&&!s.mail&&!isNight()){s.mail=S.day;s.mailOpen=1;line.insertAdjacentHTML('beforeend','<br><span class="ldsay">“Something for you.” She slides an envelope across to you without looking at the front of it.</span>');return;}
  s.greet=s.greet||{};if(s.greet[id]===S.day||isNight())return;s.greet[id]=S.day;if(((S.day*31+id.length*7)%10)>5)return;
  const g=S.hour<12?['Morning','Oh. Morning','There you are']:S.hour<17?['Afternoon','Oh. Hello','There you are']:['Evening','Oh. Evening','You’re out late'];
  line.insertAdjacentHTML('afterbegin',`<span class="w4greet">“${g[(S.day+id.length)%3]}, <span class="w4gap"></span>.”</span>`);}
// June's envelope, once the talk is over
setInterval(()=>{try{const s=w4S3();if(!s.mailOpen||S.mode!=='play'||!$('talk').hidden||(typeof RU!=='undefined'&&RU.on))return;s.mailOpen=0;const n=npcById('june');
  sgtOpen(n?{x:n.x,z:n.z}:{x:P.x,z:P.z},w4Mail(),'“It comes addressed like that. Every year, this time of year. I’m sorry.”',{},()=>{w4Fear3(2,'the envelope');try{addLore('June’s mail for me came addressed THE TITHE, HOLLOW ACRE. She said it comes like that every year.');}catch(e){}});}catch(e){}},400);
window.__w4c={s:w4S3,wake:w4Wake3,tithe:w4Tithe};
