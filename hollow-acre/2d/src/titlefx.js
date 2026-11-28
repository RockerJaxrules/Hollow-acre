/* ================= #251 the title screen. The same moonlit farm as the loading screen lies behind the menu (every lantern on
   the fence lit now), so when the loading screen fades, the title is already there underneath it: the same scene, the logo
   in the same place. Then:
   - the logo letters flicker now and then like a bad bulb;
   - the chapter line sits under the logo in the loading screen's style;
   - the menu is one stack of equal buttons in a fixed order (join a friend's farm, continue, begin or new game, play with
     friends). The first is lit like a lantern, the rest are dark wood. A small jack-o'-lantern slides in beside the one
     under your pointer or keyboard, and the stack slides in one button at a time;
   - who you farm as, then a "How to play" toggle (the controls fold away until asked for), and the small print at the foot.
   Nothing about what the buttons do changes: they are the same buttons, moved and restyled. ================= */
{const T=$('title');if(T){
  const tfxCss=document.createElement('style');tfxCss.textContent=`
#titleCv{position:fixed;left:0;top:0;image-rendering:pixelated;image-rendering:crisp-edges;pointer-events:none}
#titleCv[hidden]{display:none}
#title.tfx{background:radial-gradient(ellipse at 50% 34%,rgba(4,4,10,0) 38%,rgba(4,4,10,.5) 100%)!important;justify-content:flex-start!important;
  padding:12vh 16px 0!important;gap:0!important}
#title.tfx>*{zoom:1!important}
#title.tfx h1.tlogo{--p:calc(var(--K,3)*1px);font-family:'Hollow Pixel',monospace!important;font-size:calc(var(--K,3)*20px)!important;line-height:1!important;letter-spacing:0!important;
  color:#f0a040;margin:0!important;white-space:nowrap;text-shadow:var(--p) 0 0 #140a04,calc(-1*var(--p)) 0 0 #140a04,0 var(--p) 0 #140a04,0 calc(-1*var(--p)) 0 #140a04,calc(2*var(--p)) calc(2*var(--p)) 0 #0009!important}
#title.tfx h1.tlogo span{display:inline-block;animation:tfxFlick 5.2s steps(1) infinite}
#title.tfx h1.tlogo span.sp{width:.4em}
#title.tfx h1.tlogo span:nth-child(2){animation-delay:1.3s}#title.tfx h1.tlogo span:nth-child(4){animation-delay:3.1s}#title.tfx h1.tlogo span:nth-child(6){animation-delay:.6s}
#title.tfx h1.tlogo span:nth-child(9){animation-delay:2.2s}#title.tfx h1.tlogo span:nth-child(11){animation-delay:4s}#title.tfx h1.tlogo span:nth-child(1){animation-delay:4.6s}
@keyframes tfxFlick{0%,91%,100%{opacity:1}92%{opacity:.4}94%{opacity:1}95%{opacity:.65}}
#title.tfx .kicker{font-family:'Hollow Pixel',monospace!important;font-size:max(12px,calc(var(--K,3)*5px))!important;letter-spacing:.32em!important;text-transform:uppercase;color:#b8a888!important;
  margin:8px 0 0!important;text-shadow:2px 2px 0 #000}
#title.tfx .tag{font-family:'Hollow Pixel',monospace!important;font-style:normal!important;font-size:max(13px,calc(var(--K,3)*5px))!important;color:#e8dcc0!important;line-height:1.35;
  margin:8px 0 0!important;max-width:min(90vw,52ch)!important;text-shadow:2px 2px 0 #000,-1px -1px 0 #000}
#title.tfx .tmenu{display:inline-flex;flex-direction:column;gap:10px;align-self:center;min-width:min(340px,84vw);max-width:94vw;margin:calc(var(--K,3)*7px) auto 0}
#title.tfx .tmenu .begin{position:relative;width:100%;white-space:nowrap;margin:0!important;padding:.55em 1.6em!important;font-size:clamp(18px,calc(var(--K,3)*5px + 4px),30px)!important;letter-spacing:.06em;
  background:#2a1a0e var(--tfxWood) 0 0/auto calc(var(--K,3)*16px) repeat!important;image-rendering:pixelated;color:#f0dcb8!important;text-shadow:2px 2px 0 #000;border-radius:0!important;
  box-shadow:inset 0 0 0 2px #0c0603,inset 0 4px 0 0 #5a3a1e,inset 0 -2px 0 2px #0c0603,inset 0 -6px 0 0 #170d06,4px 4px 0 rgba(0,0,0,.45)!important}
#title.tfx .tmenu .begin.tprim{background:#a8502a!important;color:#fff2d8!important;box-shadow:inset 0 0 0 2px #2a0e04,inset 0 4px 0 0 #f0a050,inset 0 -2px 0 2px #2a0e04,inset 0 -6px 0 0 #6a2a10,4px 4px 0 rgba(0,0,0,.45),0 0 18px rgba(240,160,64,.25)!important}
#title.tfx .tmenu .begin::before{content:'';position:absolute;left:10px;top:50%;width:26px;height:22px;margin-top:-11px;background:var(--tfxPk) center/contain no-repeat;image-rendering:pixelated;
  opacity:0;transform:translateX(-8px);transition:opacity .12s steps(2),transform .12s steps(2)}
#title.tfx .tmenu .begin:hover,#title.tfx .tmenu .begin:focus-visible{filter:brightness(1.16);outline:none}
#title.tfx .tmenu .begin:hover::before,#title.tfx .tmenu .begin:focus-visible::before{opacity:1;transform:none}
#title.tfx .tmenu .begin:active{transform:translateY(2px)}
#title.tfx.tin .tmenu .begin{animation:tfxIn .42s steps(4) both}
#title.tfx.tin .tmenu .begin:nth-child(2){animation-delay:.08s}#title.tfx.tin .tmenu .begin:nth-child(3){animation-delay:.16s}#title.tfx.tin .tmenu .begin:nth-child(4){animation-delay:.24s}#title.tfx.tin .tmenu .begin:nth-child(5){animation-delay:.32s}
@keyframes tfxIn{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
#title.tfx #acctBar{margin:14px 0 0!important;background:#1c120a!important;border-radius:0!important;border:0!important;box-shadow:inset 0 0 0 2px #0c0603,inset 0 0 0 4px #4a3018,3px 3px 0 rgba(0,0,0,.45)!important;font-size:13px}
#title.tfx #acctBar button{border-radius:0!important;box-shadow:inset 0 2px 0 #5a3a1e,inset 0 -2px 0 #120a04!important;border:1px solid #0c0603!important}
#title.tfx .tlink{font-family:'Hollow Pixel',monospace;font-size:14px;margin-top:12px;padding:6px 12px;background:none;border:0;color:#d8c8a8;cursor:pointer;text-shadow:2px 2px 0 #000;letter-spacing:.06em}
#title.tfx .tlink:hover,#title.tfx .tlink:focus-visible{color:#ffd27a;outline:none}
#title.tfx .howto{margin:8px 0 0!important;padding:10px 14px;text-align:left;background:rgba(10,8,6,.78);box-shadow:inset 0 0 0 2px #3a2614;color:#d8c8a8!important;max-width:min(92vw,520px)}
#title.tfx .howto:not(.open){display:none!important}
#title.tfx .tfoot{position:fixed;left:0;right:0;bottom:max(4px,env(safe-area-inset-bottom,0px));padding:0 12px;display:flex;flex-direction:column;align-items:center;gap:1px;pointer-events:none}
#title.tfx{padding-bottom:calc(var(--lfy,72px) + 12px)!important}
#title.tfx .tfoot{flex-direction:row!important;flex-wrap:wrap;justify-content:center;gap:0 12px!important}
#title.tfx .tfoot .small{margin:0!important;color:#a89878!important;opacity:1!important;text-shadow:1px 1px 0 #000;font-size:11px!important}
#title.tfx .howto #pcHint{grid-column:1/-1;margin-top:6px!important;font-size:12px!important;color:#b8a888!important}
@media (pointer:coarse){#title.tfx #pcHint{display:none!important}}
@media (orientation:portrait){#title.tfx{padding-top:9vh!important}}
@media (prefers-reduced-motion:reduce){#title.tfx h1.tlogo span,#title.tfx.tin .tmenu .begin{animation:none}}`;document.head.appendChild(tfxCss);
  // a jack-o'-lantern for the pointer, drawn once
  {const c=document.createElement('canvas');c.width=13;c.height=11;const g=c.getContext('2d'),px=(x,y,cl)=>{g.fillStyle=cl;g.fillRect(x,y,1,1);};
    for(let y=0;y<9;y++)for(let x=0;x<13;x++){const u=(x-6)/6.5,v=(y-4.5)/4.5;if(u*u+v*v>1)continue;px(x,y+2,x===3||x===9?'#a8441a':u>.3&&v<0?'#f08a36':'#d2621e');}
    g.fillStyle='#4a6a24';g.fillRect(6,0,2,2);g.fillStyle='#ffe08a';g.fillRect(3,5,2,2);g.fillRect(8,5,2,2);for(let k=0;k<5;k++)g.fillRect(4+k,8+(k%2),1,1);
    T.style.setProperty('--tfxPk',`url(${c.toDataURL()})`);}
  {const c=document.createElement('canvas');c.width=64;c.height=16;const g=c.getContext('2d');g.fillStyle='#2a1a0e';g.fillRect(0,0,64,16);let sd=5;const r=()=>((sd=(sd*16807)%2147483647)/2147483647);
    for(let i=0;i<9;i++){const y=1+(r()*14|0),x=r()*64|0,l=8+(r()*26|0);g.fillStyle=r()<.5?'#24160b':'#33200f';g.fillRect(x,y,l,1);if(x+l>64)g.fillRect(0,y,x+l-64,1);}
    g.fillStyle='#1c1108';g.fillRect(40,9,2,1);g.fillRect(39,10,1,1);T.style.setProperty('--tfxWood',`url(${c.toDataURL()})`);}
  // the night farm behind the menu
  const tfxCv=document.createElement('canvas');tfxCv.id='titleCv';tfxCv.setAttribute('aria-hidden','true');T.before(tfxCv);
  const tfxLoading=()=>{const L=$('loadScr');return !!L&&L.style.opacity!=='0';};
  if(window.HAScene)HAScene(tfxCv,{host:document.documentElement,pct:()=>100,alive:()=>tfxCv.isConnected,paused:()=>T.hidden||tfxLoading()});else tfxCv.remove();
  // while the night farm covers the screen, the game world under it needn't be drawn (it is drawn again the moment the title goes)
  {const _rd=render;render=function(){if(S.mode==='title'&&!T.hidden&&tfxCv.isConnected&&!tfxCv.hidden&&!tfxLoading()&&window.HAScene)return;return _rd.apply(this,arguments);};}
  // the logo in letters (each can flicker on its own)
  const tfxH=T.querySelector('h1');if(tfxH){const txt=tfxH.textContent.trim();tfxH.classList.add('tlogo');tfxH.setAttribute('aria-label',txt);
    tfxH.innerHTML=[...txt].map(ch=>ch===' '?'<span class="sp"> </span>':`<span aria-hidden="true">${ch}</span>`).join('');}
  // the order: logo, chapter, line, menu, who you are, how to play, small print
  const tfxMenu=document.createElement('div');tfxMenu.className='tmenu';
  const tfxTog=document.createElement('button');tfxTog.className='tlink';tfxTog.type='button';tfxTog.textContent='How to play ▾';tfxTog.setAttribute('aria-expanded','false');
  const tfxFoot=document.createElement('div');tfxFoot.className='tfoot';
  const tfxHow=T.querySelector('.howto');
  tfxTog.onclick=()=>{if(!tfxHow)return;const o=tfxHow.classList.toggle('open');tfxTog.textContent=o?'How to play ▴':'How to play ▾';tfxTog.setAttribute('aria-expanded',String(o));};
  const tfxRank=b=>/^Join farm/.test(b.textContent)?0:b.id==='cont'?1:b.id==='begin'?2:b.id==='mpBtn'?3:4;
  let tfxBusy=false;
  function tfxSort(){if(tfxBusy)return;tfxBusy=true;try{
      for(const b of [...T.querySelectorAll('button.begin')])if(b.parentNode!==tfxMenu&&!b.closest('.howto')&&!b.closest('#acctBar'))tfxMenu.appendChild(b);
      const bs=[...tfxMenu.children].filter(b=>b.tagName==='BUTTON'),want=[...bs].sort((a,b)=>tfxRank(a)-tfxRank(b));
      if(want.some((b,i)=>b!==bs[i]))for(const b of want)tfxMenu.appendChild(b);
      let first=true;for(const b of want){const on=!b.hidden&&first;b.classList.toggle('tprim',on);if(on)first=false;b.style.marginBottom='';}
      for(const s of [...T.children])if(s.classList&&s.classList.contains('small')&&s.parentNode!==tfxFoot)tfxFoot.appendChild(s);
    }finally{tfxBusy=false;}}
  {const kick=T.querySelector('.kicker'),tag=T.querySelector('.tag'),acct=$('acctBar');
    const seq=[tfxH,kick,tag,tfxMenu,acct,tfxHow?tfxTog:null,tfxHow,tfxFoot].filter(Boolean);for(const el of seq)T.appendChild(el);}
  {const ph=$('pcHint');if(ph&&tfxHow)tfxHow.appendChild(ph);}
  tfxSort();T.classList.add('tfx');
  new MutationObserver(()=>{if(!tfxBusy)queueMicrotask(tfxSort);}).observe(T,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  // the scene and the menu follow the title screen in and out; the buttons slide in when the loading screen lifts
  new MutationObserver(()=>{tfxCv.hidden=T.hidden;}).observe(T,{attributes:true,attributeFilter:['hidden']});tfxCv.hidden=T.hidden;
  {const go=()=>{if(tfxLoading()){setTimeout(go,120);return;}T.classList.remove('tin');void T.offsetWidth;T.classList.add('tin');};go();}
}}
