/* ================= talking portraits, like Stardew: when someone speaks, their portrait shows beside the words, and its face
   follows what they are feeling. Seven faces each: neutral, happy, sad, angry, surprised, scared, and one that is wrong.
   Drawn by the same character generator as the sprites (px/chibi2.js, portrait mode). ================= */
const PORT={img:null,ready:false,row:{}};
PORTRAITS.ids.forEach((id,i)=>PORT.row[id]=i);
{const im=new Image();im.onload=()=>{PORT.img=im;PORT.ready=true;};im.src=PORTRAITS.src;}
const hasPortrait=id=>PORT.row[id]!==undefined;
function drawPortrait(cv,id,expr){const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,cv.width,cv.height);
  if(!PORT.ready||!hasPortrait(id))return false;const e=Math.max(0,PORTRAITS.expr.indexOf(expr||'neutral'));const pw=PORTRAITS.pw,ph=PORTRAITS.ph;
  const s=Math.min(cv.width/pw,cv.height/ph);const w=pw*s,h=ph*s;g.drawImage(PORT.img,e*pw,PORT.row[id]*ph,pw,ph,(cv.width-w)/2,cv.height-h,w,h);return true;}
// ---- what are they feeling? read it from the words, the hour, and how far the story has gone
const EMO=[
  ['wrong',/happy birthday|we kept your place|i already miss you|you’re taller|you were standing outside|it doesn’t hurt|bad luck to know|nobody remembers the first time|you moved your mouth|say your name|are you sure\?/i],
  ['scared',/don’t look|run\b|behind you|please|it’s coming|scarecrow|the tall man|tithe|drawing|the bell|after dark|lock (the|your) door|hide|afraid|scared|watching|don’t go/i],
  ['sad',/sorry|miss (him|her|you|them)|gone|died|dead|cry|crying|alone|grave|funeral|lost|never came back|used to|remember when|empty|taken/i],
  ['angry',/\bget out\b|leave me|don’t (you )?dare|hate|stupid|idiot|shut up|how dare|mind your own|not your business|stop it|\bno\.|go away/i],
  ['surprised',/\?!|!\?|\bwhat\?|really\?|oh!|wait—|you came|you’re here|already\?|how did you|no way|goodness|my word/i],
  ['happy',/thank|love|wonderful|lovely|ha ha|haha|\bha\b|glad|great|good to see|welcome|delicious|favourite|beautiful|perfect|bless|sweet|!|birthday/i],
];
function emotionOf(id,text,ctx){const t=String(text||'').replace(/<[^>]+>/g,' ');const L=typeof hl==='function'?hl():0;
  if(ctx==='hate')return 'angry';if(ctx==='love')return 'happy';if(ctx==='like')return 'happy';
  for(const [e,re] of EMO){if(!re.test(t))continue;if(e==='wrong'&&L<2)continue;return e;}
  if(isNight()&&!S.bound&&!S.room)return 'scared';
  if(typeof hearts==='function'&&hearts(id)>=6&&rand()<.4)return 'happy';
  // late in the story, sometimes the face doesn't match the words
  if(L>=3&&rand()<.06)return 'wrong';return 'neutral';}
// ---- the talk box gets a portrait on the right, with the name under it
{const c=document.createElement('style');c.textContent=`
#talkPortrait{float:right;margin:0 0 8px 14px;display:flex;flex-direction:column;align-items:center;gap:4px}
#talkPortrait canvas{width:132px;height:132px;image-rendering:pixelated;background:linear-gradient(#d9a868,#b8814a);box-shadow:inset 0 0 0 3px #5a3418,inset 0 0 0 5px #e8c08a,0 0 0 2px #1a0e06}
#talkPortrait .nm{font-size:12px;letter-spacing:.06em;color:#f4e6c8;background:#3a2414;padding:2px 8px;box-shadow:0 0 0 2px #1a0e06;max-width:140px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#talk .acts{clear:both}
#talkPortrait.wrong canvas{animation:ptWrong .9s steps(2) infinite}@keyframes ptWrong{50%{filter:contrast(1.4) saturate(.4) hue-rotate(-20deg);transform:translate(1px,0)}}
@media (orientation:landscape) and (max-height:540px){#talkPortrait canvas{width:96px;height:96px}}
@media (max-width:380px){#talkPortrait canvas{width:104px;height:104px}}
#scene canvas{background:linear-gradient(#d9a868,#b8814a)!important}`;document.head.appendChild(c);
  const box=document.createElement('div');box.id='talkPortrait';box.innerHTML='<canvas width="40" height="40"></canvas><div class="nm"></div>';
  const t=$('talk');t.insertBefore(box,t.firstChild);}
let talkWho=null,talkCtx=null;
function talkFace(){const n=talkWho;const box=$('talkPortrait');if(!n||!hasPortrait(n.def.id)){box.style.display='none';return;}box.style.display='';
  const e=emotionOf(n.def.id,$('talkLine').textContent,talkCtx);box.classList.toggle('wrong',e==='wrong');drawPortrait(box.querySelector('canvas'),n.def.id,e);
  {const w=n.def.name.split(' ');box.querySelector('.nm').textContent=/^(Pastor|Sheriff|Dr.?|Doctor|Brother|Sister|Mr.?|Mrs.?|Miss|Old|Aunt|Uncle|Nurse)$/i.test(w[0])&&w[1]?w[1]:w[0];}if(e==='wrong'&&!talkFace.sfx){talkFace.sfx=1;SFX.tinnitus&&SFX.tinnitus();}}
{const _t=talk;talk=function(n){talkWho=n;talkCtx=null;talkFace.sfx=0;const r=_t.apply(this,arguments);setTimeout(talkFace,0);return r;};}
// every later change to the line (gifts, hints, the director's lies) re-reads the face
new MutationObserver(()=>{if(!$('talk').hidden)talkFace();}).observe($('talkLine'),{childList:true,characterData:true,subtree:true});
// gift reactions set the mood directly
{const _ap=typeof addFriend==='function'?addFriend:null;if(_ap)addFriend=function(id,v){const r=_ap.apply(this,arguments);if(talkWho&&talkWho.def.id===id&&!$('talk').hidden&&Math.abs(v)>=25){talkCtx=v>=60?'love':v>0?'like':'hate';setTimeout(talkFace,0);}return r;};}
// ---- heart scenes: the portrait changes beat by beat
{const _sb=sceneBeat;sceneBeat=function(){const r=_sb.apply(this,arguments);try{const el=$('scene'),s=SCENE;if(!s)return r;const id=s.who;
    if(id&&hasPortrait(id)){const cv=el.querySelector('canvas');const tx=el.querySelector('.tx').textContent;drawPortrait(cv,id,emotionOf(id,tx));}}catch(e){}return r;};}
{const _ps=playScene;playScene=function(id,title,html,done){const r=_ps.apply(this,arguments);if(SCENE)SCENE.who=id;try{const cv=$('scene').querySelector('canvas');if(hasPortrait(id))drawPortrait(cv,id,emotionOf(id,$('scene').querySelector('.tx').textContent));}catch(e){}return r;};}
// ---- the social list, Mae's card and the lesson strip show portraits too
{const _hi=headIcon;headIcon=function(id,cv){if(PORT.ready&&hasPortrait(id)){const e=cv.closest&&cv.closest('#maecard')?'happy':'neutral';if(drawPortrait(cv,id,e))return;}return _hi.apply(this,arguments);};}
