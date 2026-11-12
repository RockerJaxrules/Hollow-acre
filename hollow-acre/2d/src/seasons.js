/* ================= #228 the calendar, and the seasons. While the story lasts it is always October in Marrow Hollow: the page
   on the wall says October, the stubs of the pages torn off before it all say October, and the 29th, 30th and 31st are
   written in by hand after the 28th, the 31st circled hard enough to tear the paper. Nobody in town mentions it, so neither
   does the game. When the story is over the page finally turns (at the start of the next month): Winter first, the first
   frost anyone here remembers, the field dies overnight and only the greenhouse grows; then Spring; then, only now, a
   Summer; then Fall again. 28 days each. The ground, the trees, what falls from the sky and what crops will grow follow. == */
const SEAS={cur:null,map:{},leafOrig:null,set:null};
const SEASON_ORDER=['winter','spring','summer','fall'];
const SEASON_NAME={october:'October',winter:'Winter',spring:'Spring',summer:'Summer',fall:'Fall'};
function seasonNow(){if(!S.seasonStart){if(S.st&&S.st.done)S.seasonStart=S.day+(28-dayOfMonth())+1;else return 'october';}
  if(S.day<S.seasonStart)return 'october';return SEASON_ORDER[Math.floor((S.day-S.seasonStart)/28)%4];}
const seasonYear=()=>S.seasonStart&&S.day>=S.seasonStart?Math.floor((S.day-S.seasonStart)/112)+1:0;
const outdoorSeason=()=>{const s=seasonNow();return s==='october'?'fall':s;};
// ---- colour work (shared with the cabin paint: mpHls/mpRgb)
const sClamp=v=>Math.max(0,Math.min(1,v));
function snowRGB(l){const t=sClamp((l-.12)/.62);return [Math.round(168+t*80),Math.round(184+t*66),Math.round(206+t*48)];}
function groundPix(season,r,g,b){const [h,l,s]=mpHls(r,g,b);
  if(season==='winter'){if(h>.45&&h<.72&&s>.15)return mpRgb(h,Math.min(.86,l*1.25+.12),s*.55);   // water: grey ice-light
    if(s<.1)return [Math.round(r+(240-r)*.18),Math.round(g+(244-g)*.18),Math.round(b+(250-b)*.2)];   // stone, asphalt: a rime of frost
    return snowRGB(l);}                                                                            // grass, dirt, leaf litter: snow
  if(season==='spring'||season==='summer'){if(h>.09&&h<.19&&s>.4&&l>.38)return null;   // the lane's yellow paint stays yellow
    const leaf=s>.5&&(h<.12||h>.95)&&l>.22&&l<.56,grass=h>=.1&&h<.36&&s>.14&&s<.62&&l<.55;   // not road paint (bright, very saturated)
    if(leaf||grass){const H=season==='spring'?.27+(h-.17)*.25:.3+(h-.17)*.15;return mpRgb(Math.max(.22,Math.min(.36,H)),Math.min(season==='spring'?.55:.6,(leaf?.42:s*1.25)),l*(season==='spring'?1.03:.94));}}
  return null;}
function vegPix(season,ever,h,l,s,yf){const autumn=s>.48&&(h<.155||h>.94)&&l>.16,green=h>=.155&&h<.47&&s>.16&&l>.12;
  // the autumn highlights are very light; green that light reads as lime, so the lightness is compressed toward a leafy middle
  const lv=x=>.14+x*.72;
  if(season==='spring'){if(autumn)return mpRgb(.25+Math.min(h,.15)*.3,.4,Math.min(.6,lv(l)));if(green)return mpRgb(Math.min(.34,h+.02),Math.min(.55,s*1.08),Math.min(.62,l));}
  if(season==='summer'){if(autumn)return mpRgb(.3+Math.min(h,.15)*.15,.38,Math.min(.52,lv(l)*.92));if(green)return mpRgb(Math.max(h,.27)+.02,Math.min(.55,s*1.1),Math.min(.55,l*.93));}
  if(season==='winter'){if(autumn||(green&&!ever)){if(l>.5&&yf<.85)return snowRGB(l);return mpRgb(.07,.12,l*.72);}if(green&&ever){if(l>.47&&yf<.8)return snowRGB(l);return mpRgb(h,s*.75,l*.82);}}
  return null;}
// ---- the ground: every cached chunk of ground is redone once for the season
{const _ch=chunk;chunk=function(cx,cz){const k=cx+','+cz;const had=chunks.has(k);const c=_ch(cx,cz);const sea=outdoorSeason();
  if(!had&&sea!=='fall'&&c&&c.width&&!c.sea){c.sea=sea;try{const g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height),a=d.data;
    for(let p=0;p<a.length;p+=4){if(a[p+3]<8)continue;const o=groundPix(sea,a[p],a[p+1],a[p+2]);if(o){a[p]=o[0];a[p+1]=o[1];a[p+2]=o[2];}}g.putImageData(d,0,0);}catch(e){}}
  return c;};}
// ---- trees, bushes, hedges, grass and leaf litter get a version for the season
const VEG_RE=/^(maple|oak|birch|elm|aspen|willow|apple|pine|spruce|fir|cedar|bush|shrub|hedge|fern|tallgrass|grass|weeds|reed|cattail|leaves_|ivy|vine|corn|wheat|orchard|sapling|tree)/i;
const VEG_NO=/stump|log|fallen|dead|sign|hay|bale|trunk|_n$/i;
function seasonSprites(sea){SEAS.map={};if(sea==='fall')return;
  for(const name of Object.keys(SPR)){if(!VEG_RE.test(name)||VEG_NO.test(name)||name.startsWith('mem:'))continue;const m=SPR[name];const im=IMG[m.src];if(!im||!im.width)continue;
    const key='sea_'+sea+'_'+name;if(!SPR[key]){try{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);
      const d=g.getImageData(0,0,c.width,c.height),a=d.data,W=c.width,fh=m.fh||c.height;const ever=/pine|spruce|fir|cedar|hedge/i.test(name);
      const litter=/^leaves_/.test(name);
      for(let p=0;p<a.length;p+=4){if(a[p+3]<8)continue;const y=((p>>2)/W|0)%fh;const [h,l,s]=mpHls(a[p],a[p+1],a[p+2]);
        if(litter&&sea==='winter'){const o=snowRGB(.55+l*.4);a[p]=o[0];a[p+1]=o[1];a[p+2]=o[2];a[p+3]=Math.round(a[p+3]*.45);continue;}   // fallen leaves under snow: a faint drift
        const o=vegPix(sea,ever,h,l,s,y/fh);if(o){a[p]=o[0];a[p+1]=o[1];a[p+2]=o[2];}}
      g.putImageData(d,0,0);IMG['mem:'+key]=c;SPR[key]=Object.assign({},m,{src:'mem:'+key});}catch(e){continue;}}
    SEAS.map[name]=key;}}
{const _ds=drawSpr;drawSpr=function(n,x,y,c,d,f,o){const k=SEAS.map[n];return _ds(k&&!S.room?k:n,x,y,c,d,f,o);};}
// leaves fall only in the fall; green ones blow off in spring and summer; nothing in winter
function seasonLeaves(sea){if(typeof LEAF_COL==='undefined')return;if(!SEAS.leafOrig)SEAS.leafOrig=Object.assign({},LEAF_COL);
  for(const k of Object.keys(SEAS.leafOrig)){if(sea==='fall')LEAF_COL[k]=SEAS.leafOrig[k];else if(sea==='winter')delete LEAF_COL[k];else LEAF_COL[k]=sea==='spring'?'#7bab4e':'#4f8a3a';}
  if(sea==='winter'&&typeof LEAVES!=='undefined')LEAVES.length=0;}
function seasonApply(force){const sea=outdoorSeason();if(sea===SEAS.cur&&!force)return;const was=SEAS.cur;SEAS.cur=sea;
  chunks.clear();seasonSprites(sea);seasonLeaves(sea);return was;}
// ---- what the season does to the farm
function seasonMorning(){const s=seasonNow();const was=S.seasonSeen||'october';if(s===was)return;S.seasonSeen=s;seasonApply(true);
  if(s==='winter'){let n=0;for(const t of tiles){if(t.gh||!t.crop)continue;t.crop=null;t.wet=false;n++;}
    setTimeout(()=>{openNote(`<p class="date">${SEASON_NAME.winter}, day 1</p><p>The calendar page has turned. It says <b>Winter</b>.</p><p>In the night the frost came down off the ridge, the first anyone in Marrow Hollow remembers. ${n?'The field is black and bent: everything that was growing in it is gone.':'The field is white and hard.'} The ground won’t take a hoe until spring.</p><p>Only the greenhouse is still green inside.</p>`,'Put on a coat');},900);}
  else if(s==='spring')setTimeout(()=>toast('The page turns: Spring. The ground has softened and the first green is coming up through the snow-melt.',5),900);
  else if(s==='summer')setTimeout(()=>toast('The page turns: Summer. A real one. The valley has not had a summer in longer than anyone can say, and nobody quite knows what to do with it.',6),900);
  else if(s==='fall')setTimeout(()=>toast('The page turns: Fall again. It feels different now that it ends.',5),900);}
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);try{seasonMorning();}catch(e){}return r;};}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);try{S.seasonSeen=S.seasonSeen||seasonNow();seasonApply(true);}catch(e){}return r;};}
// frozen ground: no tilling or planting outside in winter; summer grows a little faster
{const _dt=doTill;doTill=function(t){if(seasonNow()==='winter'&&t&&!t.gh){toast('The ground is frozen as hard as the road. Nothing goes in until spring. The greenhouse is warm.',2.8);return;}return _dt.apply(this,arguments);};}
{const _dp=doPlant;doPlant=function(t){if(seasonNow()==='winter'&&t&&!t.gh){toast('Seed won’t take in frozen ground. Plant in the greenhouse until spring.',2.6);return;}return _dp.apply(this,arguments);};}
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);try{if(seasonNow()==='summer')for(const t of tiles){const c=t.crop;if(!c||t.gh||c.stage>=3||!SEEDS[c.type])continue;c.growth+=SEEDS[c.type].grow*.25;}}catch(e){}return r;};}
// ---- what falls out of the sky: snow in winter, blossom in spring, fireflies on summer nights
const SKY={p:[]};
function seasonSky(dt,t){if(S.room||S.mode==='title')return;const sea=outdoorSeason();if(sea==='fall')return;const night=isNight();const g=ctx2;
  if(sea==='winter'){g.fillStyle='rgba(240,244,250,.85)';for(let i=0;i<110;i++){const sp=.6+hash(i,5)*.8;const x=(hash(i,1)*VW+Math.sin(t*.7+i)*14+t*9*sp)%VW,y=(hash(i,2)*VH+t*38*sp)%VH;const z=hash(i,3)<.25?2:1;g.fillRect(Math.round(x),Math.round(y),z,z);}}
  else if(sea==='spring'&&!night){for(let i=0;i<26;i++){const x=(hash(i,11)*VW+t*16+Math.sin(t+i)*20)%VW,y=(hash(i,12)*VH+t*22)%VH;g.fillStyle=i%3?'rgba(244,190,206,.9)':'rgba(255,236,242,.9)';g.fillRect(Math.round(x),Math.round(y),2,1);}}
  else if(sea==='summer'&&night){for(let i=0;i<34;i++){const x=(hash(i,21)*VW+Math.sin(t*.6+i*1.7)*30)%VW,y=(hash(i,22)*VH+Math.cos(t*.5+i)*24)%VH;const a=.35+.65*Math.max(0,Math.sin(t*2.3+i*2.1));g.fillStyle=`rgba(232,255,140,${a.toFixed(2)})`;g.fillRect(Math.round(x),Math.round(y),2,2);}}}
{const _r=render;render=function(dt,now){const r=_r.apply(this,arguments);try{seasonSky(dt,now/1000);}catch(e){}return r;};}
// ---- the calendar (a tab in the menu, and the one on the cabin wall)
function calEvents(dom){const out=[];for(const [id,d] of Object.entries(BDAY))if(d===dom){const n=npcById(id);if(n)out.push(['bd',`${n.def.name.split(' ')[0]}’s birthday`]);}
  const f=FESTS[dom];if(f&&seasonNow()!=='winter')out.push(['fest',f.name]);
  const off=dom-dayOfMonth(),day=S.day+off;for(const [id,r] of Object.entries(S.rom||{}))if(r&&r.wedding===day&&!r.married)out.push(['wed',`Your wedding (${sgName(id)})`]);
  for(const c of (S.world&&S.world.couples)||[])if(c.wed===day&&!c.married)out.push(['wed',`Wedding: ${c.a} & ${c.b}`]);
  if(S.st&&S.st.tithe===day&&!S.st.done)out.push(['tithe','The Tithe']);return out;}
function renderCalendar(){const B=$('bagBody');const s=seasonNow(),dom=dayOfMonth(),cursed=s==='october';
  const head=cursed?`<div style="text-align:center;margin:0 0 6px"><div style="font-size:30px;letter-spacing:.18em;color:#e8c08a">OCTOBER</div><div class="jsub" style="font-size:12px;font-style:italic">The stubs of the pages torn off before this one all say October.</div></div>`
    :`<div style="text-align:center;margin:0 0 6px"><div style="font-size:30px;letter-spacing:.18em;color:${{winter:'#cfe0f2',spring:'#b8e09a',summer:'#ffd27a',fall:'#e8a060'}[s]}">${SEASON_NAME[s].toUpperCase()}</div><div class="jsub" style="font-size:12px">Year ${seasonYear()} · day ${dom} of 28</div></div>`;
  const wd=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];let h=head+`<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px">`+wd.map(w=>`<div style="text-align:center;font-size:11px;opacity:.6">${w}</div>`).join('');
  for(let d=1;d<=28;d++){const ev=calEvents(d);const today=d===dom;
    h+=`<div style="min-height:46px;padding:3px 4px;font-size:11px;background:${today?'rgba(232,146,63,.28)':'rgba(0,0,0,.18)'};box-shadow:inset 0 0 0 1px ${today?'#e8923f':'rgba(255,255,255,.06)'};${d<dom?'opacity:.55;':''}"><b style="font-size:13px">${d}</b>`+
      ev.map(([k,t])=>`<div style="line-height:1.15;margin-top:2px;color:${{bd:'#f4b0c8',fest:'#ffd27a',wed:'#f08aa8',tithe:'#e05040'}[k]}">${k==='bd'?'♥ ':k==='fest'?'✦ ':k==='wed'?'⚭ ':'✝ '}${t}</div>`).join('')+'</div>';}
  if(cursed)for(const d of [29,30,31])h+=`<div style="min-height:46px;padding:3px 4px;font-size:15px;font-family:cursive,serif;color:#b03a2a;${d===31?'box-shadow:inset 0 0 0 2px #b03a2a;border-radius:50%;':''}transform:rotate(${d===30?-4:3}deg)">${d}</div>`;
  h+='</div>';if(s==='winter')h+=`<p class="jsub" style="font-size:12px;margin-top:8px">The ground is frozen: only the greenhouse grows until spring.</p>`;
  B.innerHTML=h;$('bagSub').textContent=cursed?`Day ${S.day}`:`${SEASON_NAME[s]} ${dom}, year ${seasonYear()}`;}
{const _ob=openBag;openBag=function(tab){const t=tab||GM_TAB;if(t==='calendar'){_ob('social');GM_TAB='calendar';const bag=$('bag');bag.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t==='calendar'));bag.querySelector('h2').textContent='Calendar';renderCalendar();return;}
  _ob.apply(this,arguments);const bag=$('bag');const tabs=bag.querySelector('.tabs');if(tabs&&!tabs.querySelector('[data-t="calendar"]')){const b=document.createElement('button');b.dataset.t='calendar';b.textContent='Calendar';
    const j=tabs.querySelector('[data-t="journal"]');j?tabs.insertBefore(b,j):tabs.appendChild(b);b.addEventListener('click',()=>openBag('calendar'));}};}
// the calendar hanging in the cabin opens the same page
{let done=false,cd=0;const _u=update;update=function(dt){_u(dt);if(done)return;if((cd-=dt)>0)return;cd=1;const o=OBJ.find(q=>q.spr==='in_calendar'&&q.room==='cabin'&&!q.hide);if(!o)return;done=true;
  interact.push({x:o.x,z:o.z+.9,r:1.1,on:()=>S.room==='cabin',label:()=>'Calendar',ok:()=>true,act(){openBag('calendar');}});};}
