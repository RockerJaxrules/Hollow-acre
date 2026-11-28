/* ================= W4, Chapter Three part B (story plan, chapter 3, beat 2): the cut from the crash goes bad the morning after
   the bell. Your health won't come back all the way and you catch your breath when you run. Hollis or Caitlyn sends you to Doc
   Ashby in Wickham; he stitches it, stops at the old scar on your thumb (Elias had the same one), and on his wall is the Ashby
   mill at Charrow, 1909. He gives you a letter for his great-uncle Cyrus there: Charrow's first thread. ================= */
const w4S4=()=>{if(!S.w4||typeof S.w4!=='object')S.w4={};return S.w4;};
const w4Fear4=(n,why)=>{try{if(typeof fearAdd==='function')return fearAdd(n,why);if(typeof mindHit==='function')mindHit(Math.max(1,Math.round(n/2)));}catch(e){}};
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);try{const s=w4S4();
   if(s.bell3&&!s.cutDay&&S.day>s.bell3&&S.st&&S.st.started&&!S.st.done){s.cutDay=S.day;s.cut=1;}
   else if(s.cut&&S.day-s.cutDay>=7)s.cut=0;   /* left alone, it closes up by itself in a week, badly */
 }catch(e){}return r;};}
// while it's bad: the top of your health won't come back, and running pulls at it
let W4_WINCE=0,W4_LP=null;
setInterval(()=>{try{const s=w4S4();if(!s.cut)return;const cap=Math.round(S.hpMax*.85);if(S.hp>cap)S.hp=cap;
  if(S.mode!=='play'||S.paused||S.room===undefined)return;const mv=W4_LP?Math.hypot(P.x-W4_LP.x,P.z-W4_LP.z):0;W4_LP={x:P.x,z:P.z};
  if(typeof keys!=='undefined'&&keys.ShiftLeft&&mv>.5&&performance.now()-W4_WINCE>7000){W4_WINCE=performance.now();
    try{if(typeof A!=='undefined'&&A.ok){A.hiss(.22,.05,'bandpass',900,{q:3});A.hiss(.3,.03,'lowpass',500,{delay:.18});}}catch(e){}
    try{if(typeof cam!=='undefined'&&cam)cam.shake=Math.max(cam.shake||0,.05);}catch(e){}try{if(typeof cap7Show==='function')cap7Show('A sharp breath',0);}catch(e){}}}catch(e){}},300);
// who notices: Hollis or Caitlyn (anyone, if neither is in the valley); and the doctor
const w4Here4=id=>{try{const n=npcById(id);return !!(n&&!n.gone&&!n.dead);}catch(e){return false;}};
{const _t=talk;talk=function(n){const r=_t.apply(this,arguments);try{w4OnTalk4(n);}catch(e){console.warn('w4d',e);}return r;};}
function w4OnTalk4(n){if(!n||!n.def||isNight())return;const line=$('talkLine'),box=$('talk');if(!line||!box||box.hidden)return;const s=w4S4(),id=n.def.id;
  const nm=typeof ldName==='function'?ldName(n):n.def.name.split(' ')[0];const add=t=>line.insertAdjacentHTML('beforeend',`<br><span class="ldsay">${t}</span>`);
  if(id==='lyle'&&s.cutDay&&!s.stitched){s.stitched=S.day;s.cut=0;S.hp=Math.min(S.hpMax,S.hp+12);s.photoOpen=1;
    add('He stitches the cut without a word, then stops at the old scar on your thumb. “Elias had one just like it. Same thumb.”');return;}
  if(s.cut&&!s.toldCut&&(['hollis','mae'].includes(id)||!['hollis','mae'].some(w4Here4))){s.toldCut={d:S.day,n:nm};
    add(`“That cut’s gone bad,” says ${nm}. “You’re holding that hand like it’s somebody else’s. Get it looked at. Doc Ashby’s in Wickham.”`);
    try{const d=npcById('lyle');if(d&&typeof ldTell==='function')ldTell({x:d.def.day?d.def.day[0]:d.x,z:d.def.day?d.def.day[1]:d.z});}catch(e){}}}
// after the stitches: his wall, then his letter
setInterval(()=>{try{const s=w4S4();if(!s.photoOpen||S.mode!=='play'||!$('talk').hidden||(typeof RU!=='undefined'&&RU.on))return;s.photoOpen=0;const n=npcById('lyle');
  sgtOpen(n?{x:n.x,z:n.z}:{x:P.x,z:P.z},w4AshbyPhoto(),'“My family’s mill. Charrow. Before we came here.” He holds out a sealed letter. “If you ever get out that way, my great-uncle Cyrus would want to hear about the Marsh grandchild.”',{},
    ()=>{s.letter=S.day;w4Fear4(1,'the Ashby mill');try{addLore('Doc Ashby stitched the cut. Elias had the same scar on his thumb. On his wall: the Ashby mill, Charrow, 1909. He gave me a letter for his great-uncle Cyrus in Charrow.');}catch(e){}});}catch(e){}},400);
// the Leads tab
if(typeof leadsHtml==='function'){const _lh=leadsHtml;leadsHtml=function(){let h=_lh.apply(this,arguments);try{const s=w4S4(),open=[],fin=[];
    if(s.toldCut){const d=!!s.stitched;(d?fin:open).push(`<p class="ldrow${d?' lddone':''}"><b>${s.toldCut.n} said</b> Get that cut looked at. Doc Ashby’s in Wickham.${d?' <span class="ldtick">✓</span>':''}</p>`);}
    if(s.letter){const d=!!s.cyrus;(d?fin:open).push(`<p class="ldrow${d?' lddone':''}"><b>Doc Ashby asked</b> Take his letter to his great-uncle Cyrus, in Charrow.${d?' <span class="ldtick">✓</span>':''}</p>`);}
    if(open.length)h=h.replace(/(<h4>To follow<\/h4>)(<p class="jsub">Nothing right now\.<\/p>)?/,'$1'+open.join(''));
    if(fin.length)h=h.includes('<h4>Followed</h4>')?h.replace('<h4>Followed</h4>','<h4>Followed</h4>'+fin.join('')):h+'<h4>Followed</h4>'+fin.join('');}catch(e){}return h;};}
window.__w4d={s:w4S4};
