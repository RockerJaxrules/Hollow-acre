/* ================= #227 your spouse moves in. The morning after the wedding they've carried their things up the lane: from
   then on your cabin is their home. They sleep there, are there when you wake, drink their coffee on the porch, go to work
   (Caitlyn still opens the store), walk the field in the evening and come home before dark. Each brings one thing that
   matters to them (it waits in your furniture bag for you to give it a place). Most mornings they've done something for
   you: watered a row, left breakfast, mended something. At home they talk like someone who lives there. ================ */
const SP_KEEP={mae:['in_shelf_jars','her mother’s jar shelf from the store',[1.8,.6]],june:['in_shelf_mail','the post office’s old letter rack',[1.8,.6]],
  cora:['in_rocker','her grandmother’s rocking chair',[1.0,.9]],nell:['in_shelf_books','two crates of her books, and the shelf for them',[1.8,.6]],
  tess:['in_chess','her chess table, a game still half played on it',[1.4,1.0]],ida:['in_piano','her upright piano (four men and a cart)',[2.0,.9]],
  iris:['in_desk','her sewing table',[1.8,.8]]};
const SP_ORIG={};for(const [id,L] of Object.entries(LIFE))SP_ORIG[id]={home:L.home,day:JSON.parse(JSON.stringify(L.day||[]))};
HOMES.farm={door:[doorPos.x,doorPos.z+.2],face:'S',room:'cabin',name:'your cabin'};
if(typeof HOME_SPOT!=='undefined')HOME_SPOT.farm=[4.3,4.5];
PL.farmporch=[doorPos.x+1.7,doorPos.z+1.5,.4];PL.farmfield=[.6,-1.2,2.0];
for(const [id,[spr,what,fp]] of Object.entries(SP_KEEP)){if(!SPR[spr])continue;const k='sp_'+id;
  FURN[k]=[what.replace(/^her /,'').replace(/^./,c=>c.toUpperCase()),spr,{},[3,2],null];if(typeof FURN_FP!=='undefined')FURN_FP[k]=fp;}
function spId(){if(typeof HOST!=='undefined'&&HOST.role==='guest')return null;for(const [id,r] of Object.entries(S.rom||{}))if(r&&r.married&&S.day>r.married&&LIFE[id])return id;return null;}
function spApply(){const id=spId();if(!id)return null;const L=LIFE[id];if(L.home==='farm')return id;const O=SP_ORIG[id];if(!O)return null;
  let cur=O.day.length?O.day[0][1]:'square';for(const [h,k] of O.day)if(h<=8.5)cur=k;
  const later=O.day.filter(d=>d[0]>8.5&&d[0]<18&&d[1]!=='home');
  L.home='farm';L.wed=1;L.day=[[6,'home'],[7.4,'farmporch'],[8.5,cur==='home'?'square':cur],...later,[18,'farmfield'],[19,'home']];
  const n=npcById(id);if(n){n.loc=null;n.route=null;n.target=null;n.homeKey='farm';}return id;}
function spMoveInNews(id){const r=S.rom[id];if(!r||r.movedIn)return;r.movedIn=S.day;const nm=sgName(id);const K=SP_KEEP[id];
  if(K&&FURN['sp_'+id]){S.furnBag=S.furnBag||[];S.furnBag.push('sp_'+id);}
  setTimeout(()=>{toast(`${nm} carried their things up the lane last night. Your cabin is their home now.${K?` ${nm} brought ${K[1]}: it’s in your furniture bag, for you to give it a place.`:''}`,6);},900);
  addLore&&addLore(`${nm} moved into the cabin. Two toothbrushes. Two mugs on the stove.`);if(typeof journalNote==='function')journalNote(`${nm} moved in.`);}
// the morning: what they did while you slept
const SP_HELP=[
  id=>{const ts=tiles.filter(t=>t.crop&&!t.crop.watered&&t.crop.stage<3).slice(0,8);if(!ts.length)return '';for(const t of ts){t.crop.watered=true;t.wet=true;}return `${sgName(id)} was up before you and watered ${ts.length} ${ts.length>1?'rows':'row'}. Badly. Lovingly.`;},
  id=>{const f=['pie','egg_fried','hash','soup'].find(k=>ITEMS[k]);if(!f)return '';addInv(f,1);return `There’s ${ITEMS[f].name.toLowerCase()} wrapped in a cloth on the table, and a note in ${sgName(id)}’s handwriting: <i>eat something</i>.`;},
  id=>`${sgName(id)} oiled the hinge on the porch door. It doesn’t scream any more. You hadn’t noticed it screamed.`,
  id=>{if(!S.coop||!(S.eggs>0))return '';const n=S.eggs;for(let i=0;i<n;i++)S.basket.push({kind:'egg',value:8});S.eggs=0;return `${sgName(id)} collected the eggs. ${n} of them, in a bowl by the door.`;},
  id=>`${sgName(id)} left the lamp lit for you all night. You never asked. You never had to.`];
{const _nd=newDay;newDay=function(m,p){const r=_nd.apply(this,arguments);try{const id=spApply();if(id){if(!S.rom[id].movedIn)spMoveInNews(id);
    else if(rand()<.55){const h=SP_HELP[Math.floor(rand()*SP_HELP.length)](id);if(h)setTimeout(()=>toast(h.replace(/<[^>]+>/g,''),4.6),2600);}}}catch(e){}return r;};}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);try{spApply();}catch(e){}return r;};}
// at home they talk like someone who lives there
const SP_HOME=['I put the kettle on. It’s been whistling for an hour. I keep forgetting I live here now.','Your side of the bed is the side by the window. Don’t argue. You talk in your sleep facing the window.',
  'The house makes a noise at three in the morning. Like someone sitting down on the porch. I don’t go and look. Do you go and look?','I moved the chair. Then I moved it back. It wanted to be where it was.',
  'Come here. No, just here. Just for a minute. There.','I like it when the stove ticks. It sounds like someone keeping time for us.',
  'Don’t go out after dark tonight. I know. I know. Just tonight.','You’ve got dirt on your face. No. Other side. …It’s fine, leave it.'];
{const _st=socialTalk;socialTalk=function(n){const r=_st.apply(this,arguments);try{const id=n&&n.def&&n.def.id;if(id&&id===spId()&&LIFE[id].home==='farm'&&S.room==='cabin'&&!$('talk').hidden)
  $('talkLine').innerHTML=`<q>${SP_HOME[(S.day*5+(S.talked[id]||0))%SP_HOME.length]}</q>`;}catch(e){}return r;};}
// at night the whole valley stands in the dark facing your farm. The one you married is the one person who doesn't: they're home, with you.
function spHomeNow(){const id=spId();if(!id||LIFE[id].home!=='farm')return;const n=npcById(id);if(!n)return;
  n.loc='in';n.homeKey='farm';n.inWant='home';n.inDoor=HOMES.farm.door;n.route=null;const p=homeRoomPos(n);if(p){n.x=p[0];n.z=p[1];n.vis=true;n.dir='S';n.clip='idle';}}
{const _pn=placeNPCs;placeNPCs=function(){const r=_pn.apply(this,arguments);try{if(S.hour>=20&&S.day>=2&&!S.bound)spHomeNow();}catch(e){}return r;};}
{const _u=update;update=function(dt){_u(dt);try{const id=spId();if(id&&S.hour>=20&&S.day>=2&&!S.bound){const n=npcById(id);if(n&&n.loc==='vigil')spHomeNow();}}catch(e){}};}
// the talk box says so: married, and (once they've moved in) that they live with you, not "standing in the dark"
{const _tk=talk;talk=function(n){const r=_tk.apply(this,arguments);try{const id=n&&n.def&&n.def.id;const R=S.rom&&S.rom[id];if(R&&R.married){const rl=$('talkRole');if(rl){
  const home=LIFE[id]&&LIFE[id].home==='farm';const tn=[...rl.childNodes].find(x=>x.nodeType===3&&x.textContent.trim());
  if(tn&&home)tn.textContent=(S.room==='cabin'?'At home':'Lives with you')+' ';
  const ds=rl.querySelector('.dating');if(ds)ds.textContent='· married';else rl.insertAdjacentHTML('beforeend',' <span class="dating" style="color:#f08aa8">· married</span>');}}}catch(e){}return r;};}
