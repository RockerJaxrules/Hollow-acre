/* ================= romance. Caitlyn (who runs the store; her id is still 'mae' so old saves keep working) can be dated.
   Like Stardew: her friendship stops at 8 hearts until you give her a bouquet. Then the last two hearts open, with
   scenes of their own, she talks to you differently, and the endings remember her. ================= */
S.rom=S.rom||{};
const ROMANCE={mae:{name:'Caitlyn',
  yes:'Okay. Yes. If that’s what you’re asking. Yes.',
  early:'That’s really sweet. Ask me again when you actually know me. …I mean it, though. Ask me again.',
  again:'You don’t have to keep bringing me flowers. …Keep bringing me flowers.',
  lines:['Everett asked if we’re dating. I said “define dating.” He wrote it down in his notebook.','Come by after close. I’ll make the bad coffee.',
    'Tobias drew a picture of you. You have very long arms in it. He says that’s accurate.','I turned the porch light off last night. For a whole minute. Baby steps.',
    'You smell like turnips. It’s fine. It’s weirdly fine.','If the bell rings while you’re out, you come here. Not home. Here.',
    'Hi. Hey. Hi. …I practised saying something cooler than that.','You look tired. Sit on the counter. I won’t tell anyone. Everyone knows anyway.']}};
const romDating=id=>!!(S.rom[id]&&S.rom[id].dating);
// ---- the bouquet: Ezra sells them at Bell's Feed & Stock
ITEMS.bouquet={name:'Wildflower bouquet',icon:'it_bouquet',desc:'Late asters, goldenrod and one red maple leaf, tied with twine. Give it to someone you want to date.'};
cicoMake('it_bouquet',(p,poly)=>{
  for(let k=0;k<7;k++)p(13+k*.8,17+k*1.6,1,12-k*.6,k%2?'#4a7a2e':'#5e9234');
  poly([[8,18],[24,18],[19,29],[13,29]],(x,y)=>x<12?'#d8c49a':x>20?'#a88c5e':'#c8b07c');p(12,24,8,2,'#7a4a2a');p(12,24,8,1,'#9a6a3a');
  const F=[[11,10,'#b86ad8'],[17,7,'#e8c040'],[22,11,'#b86ad8'],[14,14,'#e8c040'],[20,15,'#f0e8f0'],[9,15,'#e8c040'],[16,11,'#c8402a']];
  for(const [x,y,c] of F){p(x-1,y,3,1,c);p(x,y-1,1,3,c);p(x,y,1,1,'#fff6c0');}
  p(23,15,2,2,'#c8402a');p(24,14,1,1,'#e86040');});
{const _vf=vendors.v_feed.rows;vendors.v_feed.rows=()=>{const r=_vf();r.push({k:'bouquet',name:'Wildflower bouquet',
  desc:'Asters and goldenrod in brown paper. Give it to someone with 8 hearts to ask them out.',price:40,can:true,
  buy(){addInv('bouquet');toast('Ezra wraps it in brown paper and doesn’t ask who it’s for. He grins at the twine.',2.6);}});return r;};}
// ---- friendship stops at 8 hearts until you're dating
{const _af=addFriend;addFriend=function(id,n){if(ROMANCE[id]&&!romDating(id)&&n>0)n=Math.max(0,Math.min(n,899-friend(id)));
  const before=hearts(id);const r=_af.call(this,id,n);
  if(ROMANCE[id]&&!romDating(id)&&before<8&&hearts(id)>=8&&!S.rom.hint){S.rom.hint=1;setTimeout(()=>toast('Caitlyn ♥ 8. Her hearts stop here unless you ask her out. Ezra at Bell’s Feed sells wildflower bouquets.',4.5),2200);}
  return r;};}
// ---- her scenes: Danny's letter moves to 7 hearts (it is needed for the true ending), the last two are for after you start dating
{const P_=PEOPLE.mae;const dl=P_.events.find(e=>e.title==='Danny’s last letter');if(dl)dl.h=7;
  P_.events.push(
    {h:9,title:'After hours',text:`The store is closed. Caitlyn has pushed the bread rack against the wall and put the old radio on the counter. It only gets one station. It is playing something slow from before either of you were born.<br><br>
<q>Don’t make it weird,</q> she says, and takes your hands anyway. You dance between the shelves, badly. She steps on your foot twice and apologises once.<br><br>
When the song ends the announcer says, warmly and very clearly: <q>And that one goes out to the two of you, from everybody in the corn.</q><br><br>
Caitlyn switches the radio off. She doesn’t let go of your hand. <q>One more,</q> she says. <q>Without the radio.</q>`,lore:'Caitlyn danced with you in the closed store. The radio knew you were there.'},
    {h:10,title:'The porch light',text:`Caitlyn walks you out to the store porch at dusk. The light over the door has burned every night for two years, since her mom walked into the corn.<br><br>
<q>She left it on for Danny. And for Dad. Then I left it on for her.</q> Her hand finds the switch. <q>I don’t want to be waiting for somebody anymore. I want to be with somebody.</q><br><br>
She switches it off. The street goes very dark. Somewhere out in the corn, something that sounds like her mother sighs, and it doesn’t sound sad.<br><br>
<q>Promise me one thing,</q> she says, into your shoulder. <q>Whatever happens at that door, you don’t leave without me.</q>`,lore:'Caitlyn turned off the porch light. She made you promise not to leave without her.',reward:'rom_promise'});}
{const _sr=socialReward;socialReward=function(r){if(r==='rom_promise'){S.rom.mae=Object.assign(S.rom.mae||{},{promise:true});toast('Caitlyn will go with you, whatever you choose.',3);return;}return _sr.apply(this,arguments);};}
// ---- asking her out
function romAsk(n){const id=n.def.id,R=ROMANCE[id];if(!R)return;const row=$('talk').querySelector('.giftrow');if(row)row.remove();$('talkGift').hidden=true;
  if(romDating(id)){takeInv('bouquet',1);S.gifted[id]=S.day;addFriend(id,40);$('talkLine').innerHTML=`<q>${R.again}</q>`;SFX.coin&&SFX.coin();updateHud();return;}
  if(hearts(id)<8){$('talkLine').innerHTML=`<q>${R.early}</q>`;return;}
  takeInv('bouquet',1);S.gifted[id]=S.day;S.rom[id]=Object.assign(S.rom[id]||{},{dating:true,day:S.day});updateHud();
  $('talk').hidden=true;talkingTo=null;
  playScene(id,'Wildflowers',`Caitlyn looks at the bouquet for a long time. Asters. Goldenrod. One red maple leaf tucked in for luck.<br><br>
<q>Nobody’s ever brought me flowers. Mom used to say flowers are for funerals, here.</q> She takes them anyway, carefully, like they might break. <q>…These aren’t funeral flowers.</q><br><br>
<q>${R.yes}</q> She puts them in the coffee pot, because it is the only vase in the store, and pushes her glasses up her nose, and they slide right back down because she is smiling too hard.<br><br>
<q>Don’t make it weird.</q>`,()=>{addFriend(id,60);addLore('You and Caitlyn are together now.');journalNote('Caitlyn said yes.');toast('You’re dating Caitlyn. Her last two hearts are open.',3.2);});}
{const _og=openGift;openGift=function(n){_og.apply(this,arguments);if(!n||!ROMANCE[n.def.id]||inv('bouquet')<=0)return;
  let row=$('talk').querySelector('.giftrow');if(!row){row=document.createElement('div');row.className='giftrow';$('talk').querySelector('.acts').before(row);}
  const b=document.createElement('button');b.className='buy';b.style.cssText='display:flex;align-items:center;gap:6px';
  b.innerHTML=`<img src="${iconOf('it_bouquet')}" style="width:24px;height:24px;image-rendering:pixelated" alt="">Wildflower bouquet ×${inv('bouquet')}`;
  b.addEventListener('click',()=>romAsk(n));row.insertBefore(b,row.firstChild);
  const none=row.querySelector('.sub');if(none&&row.children.length>1)none.remove();};}
// ---- while dating she talks to you differently, and the bouquet can always be given
{const _st=socialTalk;socialTalk=function(n){const r=_st.apply(this,arguments);const id=n.def.id,R=ROMANCE[id];if(!R||$('talk').hidden)return r;const night=isNight();
  if(romDating(id)&&!night&&!lastQuestLine&&(S.day+(S.talked[id]||0))%2===0)$('talkLine').innerHTML=`<q>${R.lines[(S.day*5+(S.talked[id]||0))%R.lines.length]}</q>`;
  if(romDating(id)){const rl=$('talkRole');if(rl&&!rl.querySelector('.dating'))rl.insertAdjacentHTML('beforeend',' <span class="dating" style="color:#f08aa8">· dating</span>');}
  const gb=$('talkGift');if(gb&&!night&&inv('bouquet')>0&&S.gifted[id]!==S.day)gb.hidden=false;
  return r;};}
// ---- the social list shows who you can date, and who you are dating
{const _rs=renderSocial;renderSocial=function(){_rs.apply(this,arguments);for(const id of Object.keys(ROMANCE)){const el=$('bagBody').querySelector(`.p[data-id="${id}"] b`);if(!el)continue;
    el.insertAdjacentHTML('afterend',romDating(id)?' <small style="color:#f08aa8">♥ Dating</small>':' <small style="color:#c8b07c">· single</small>');
    const card=el.closest('.p');card.addEventListener('click',()=>{const inf=$('socInfo');if(inf&&!romDating(id))inf.insertAdjacentHTML('beforeend',` Her hearts stop at 8 until you give her a wildflower bouquet (Bell’s Feed &amp; Stock).`);});}};}
// ---- her shop knows
Object.defineProperty(vendors.mae,'sub',{configurable:true,get(){return romDating('mae')?'"Friends-and-family discount. Which is no discount. I’m broke. Hi, though."':'"Fair prices. Weird hours. Don’t ask about the hours."';}});
// ---- the endings remember her
{const _se=stEnding;stEnding=function(k){const E=ST_END[k];const keep=E&&{text:E.text,end:E.end,epi:E.epi};
  try{if(k==='truck'&&romDating('mae')){
      E.text=E.text.replace('Tobias climbs in with a backpack and a jar of glowcaps.','Tobias climbs in with a backpack and a jar of glowcaps. Caitlyn slides in after him with her dad’s lantern on her knees and doesn’t say anything, which is how you know she’s scared.')
        .replace('<q>Run,</q> you tell him. <q>Don’t look back. Don’t ever come back for me.</q>','<q>Run,</q> you tell them. <q>Both of you. Don’t look back. Don’t ever come back for me.</q><br><br>Caitlyn kisses you once, hard, like a promise she means to collect on. Then she takes his hand.')
        .replace('He runs. You watch his little torch cross the line','They run. You watch her lantern cross the line');
      E.end='Years from now a woman with pink in her hair drives a long way toward a valley she doesn’t remember, a boy who is nearly a man asleep beside her, because she keeps dreaming about a farm, and somebody in it. Her car breaks down on Route 9.';
      E.epi='The store is closed. On the door, in Caitlyn’s handwriting: GONE. DON’T COME LOOKING. Underneath, smaller: (come looking).';}
    if(k==='door')E.end=E.end+(romDating('mae')?' Caitlyn finds a gap-toothed boy of ten in the crowd, holding a fish too big for him. She doesn’t let go of either of you all the way home.':' Caitlyn finds a gap-toothed boy of ten in the crowd. She takes him to the store and makes him pancakes, and cries the whole time.');}catch(e){}
  const r=_se.apply(this,arguments);if(keep)setTimeout(()=>Object.assign(E,keep),60000);return r;};}
// ---- older saves: Danny's letter used to be the 10-heart scene
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);S.rom=S.rom||{};const hs=S.heartSeen||{};if(hs.mae10&&!romDating('mae')){hs.mae7=1;delete hs.mae10;}if(!romDating('mae')&&(S.friend.mae||0)>899)S.friend.mae=899;return r;};}
