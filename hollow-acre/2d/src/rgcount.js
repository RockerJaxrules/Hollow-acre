/* ================= The Count. "Somebody has to keep count," Agnes says. Every part of the valley, old and new, has one child the
   Tithe took from it, and one small thing they left there: a shoe, a toy horse, a slate, a bag of marbles, a cap, a spinning top.
   Find it and you learn who they were and how that place gave them up; say their name and it steadies you, and it goes in the
   journal's Count. On the last night, at the door, you say every name you found, and the ending remembers them.
   Thirty-four parts of the valley, thirty-four children, from Edwin Marsh in 1871 to the boy in the corn. ================= */
const RGC=[
 // ---- the old valley
 {id:'field',part:'Hollow Acre’s field',at:()=>({x:FIELD.x0-1.4,z:FIELD.z0+5}),k:'horse',who:'Edwin Marsh',yr:1871,
  text:'A wooden horse in the furrow at the edge of the field, its paint long gone. Carved under it: EDWIN MARSH HIS HORSE. The first child the Covenant took was a Marsh, from this field, the autumn it was signed. Every plough since has turned the horse up, and someone has always put it back.'},
 {id:'corn',part:'The cornfield',at:()=>({x:CORN.x0-1.2,z:(CORN.z0+CORN.z1)/2}),k:'cap',who:'Lucy Hale',yr:1903,
  text:'A child’s blue bonnet snagged on a stalk at the edge of the corn, sun-bleached to grey. Lucy Hale went in after a cat in 1903 and the corn closed behind her. They say she still calls for the cat. They say the cat still answers.'},
 {id:'pond',part:'The pond',at:()=>({x:pond.x+pond.r+2.2,z:pond.z}),k:'top',who:'Nils Lindqvist',yr:1961,
  text:'A spinning top on the bank, carved with N.L. Otto made it for his little brother the summer before. Nils was spinning it on the dock the evening his name was drawn. It is still warm, as if it has only just stopped.'},
 {id:'bridge',part:'The covered bridge',at:()=>({x:BRIDGE.x+5.6,z:BRIDGE.z+1.4}),k:'marbles',who:'Mary Pruitt',yr:1919,
  text:'A cloth bag of marbles under the end of the covered bridge, M.P. stitched on it. Mary Pruitt hid under here for two days in 1919, and the whole town walked over her calling her name, kindly, until she came out.'},
 {id:'oak',part:'The oak on Route 9',at:()=>({x:carPos.x+3,z:carPos.z+3.4}),k:'shoe',who:'Joseph Cade',yr:1988,
  text:'One sneaker in the ditch by the oak your car hit. Joseph Cade was fourteen and hitching west in 1988. Somebody from Marrow Hollow stopped for him on Route 9 and said they were going his way. The town hasn’t had to draw its own since an outsider was passing.'},
 {id:'square',part:'The town square',at:()=>({x:squarePos.x-6.4,z:squarePos.z+3.2}),k:'slate',who:'Clara Dunn',yr:1948,
  text:'A school slate by the square with a hopscotch drawn on it, the numbers in a child’s hand: 1 to 9 and then, in the top square, HOME. Clara Dunn, the sheriff’s great-aunt. The chalk has never washed off. Nobody has ever tried.'},
 {id:'church',part:'The church',at:()=>({x:CHURCH_STEP.x+4.2,z:CHURCH_STEP.z+1.2}),k:'cap',who:'Peter Vale',yr:1927,
  text:'A choirboy’s cap behind the church, folded small. Peter Vale sang the Tithe hymn the year his own name was in the hat, and sang it right through to the end, because his mother was in the front row and he didn’t want her to hear him stop.'},
 {id:'graveyard',part:'The graveyard',at:()=>({x:60.8+4,z:-27.6+4}),k:'shoe',who:'Annie Thorne',yr:1890,
  text:'A little button boot on the graveyard wall, laced up neatly. Annie Thorne’s is the first of the small graves with only a birthday on it. Her mother laced the boots on her that morning, and kept one back, to be sure she would come back for it.'},
 {id:'store',part:'Coyle’s store',at:()=>({x:29.5-4.6,z:-9.4+2.2}),k:'marbles',who:'Sam Coyle',yr:1936,
  text:'Marbles in a twist of paper behind Coyle’s, and three pennies. Sam Coyle saved for a month for the jar of penny candy in the window. He never got to spend it. The store has kept the same jar in the window ever since, never sold from.'},
 {id:'crossroads',part:'The crossroads',at:()=>({x:crossPos.x+3.4,z:crossPos.z-2.4}),k:'top',who:'Jonah Reed',yr:1904,
  text:'A top at the crossroads where the peddler stands at dusk. Jonah Reed traded his name to the peddler in 1904 for a candle that would never go out, and gave the candle to his sister. The peddler still has his name. He tells it to you, as if it were a price.'},
 {id:'lane',part:'Market Lane',at:()=>({x:46,z:17.8}),k:'shoe',who:'Hattie Hartley',yr:1931,
  text:'A child’s shoe on the step of the carpentry. Hattie Hartley, Nell’s great-aunt. Her father built the Tithe House’s new door that year, the one with no handle on the inside, before he knew whose name was in the hat.'},
 {id:'mine',part:'The ridge and the old mine',at:()=>({x:-2.6,z:-17.6}),k:'horse',who:'Walter Fenn',yr:1899,
  text:'A wooden horse at the mouth of the old mine. Walter Fenn ran into the mine the night of the drawing and went deeper than anyone had ever gone. They found the horse in the morning, set down neatly at the entrance, facing out.'},
 {id:'falls',part:'The falls',at:()=>({x:-19.2+3.4,z:ridgeZ(-19.2)+RIDGE.h+2.2}),k:'cap',who:'Rose Abernathy',yr:1911,
  text:'A cap caught in the rocks below the falls. Rose Abernathy, Agnes’s great-aunt. They say she went over the falls rather than go to the house, and that the creek has run a little red every October since.'},
 {id:'hollowtree',part:'The Hollow Woods',at:()=>({x:HOLLOW_TREE.x+4.8,z:HOLLOW_TREE.z+2}),k:'top',who:'Billy Quill',yr:1955,
  text:'A top in the roots of the hollow tree. Billy Quill hid inside the tree on the drawing night, and they couldn’t find him, so they nailed the split shut and waited. The carving inside, WHEN THE SUN IS IN, is his.'},
 {id:'quarry',part:'The quarry',at:()=>({x:QUARRY.x0+3,z:QUARRY.z1+2.4}),k:'slate',who:'Ellen Thorne',yr:1972,
  text:'A slate at the edge of the quarry with a sum on it, worked and reworked: how many stones to build a house with no windows. Ellen Thorne was good at sums. Her answer is right.'},
 {id:'lake',part:'The Black Lake',at:()=>({x:LAKE.x-LAKE.rx-2.6,z:LAKE.z-2}),k:'shoe',who:'Lisa Lusk',yr:1979,
  text:'A jelly sandal at the edge of the Black Lake. Lisa Lusk, eight. Her brother Corwin was filling up the station’s tank when they came for her in October 1979. He has been filling it ever since. The coffee he made that morning is still hot.'},
 {id:'orchard',part:'Quill Orchard',at:()=>({x:46-9,z:56+5.4}),k:'horse',who:'Daisy Quill',yr:1922,
  text:'A toy horse in the long grass under the apple trees. Daisy Quill climbed to the top of the tallest tree the night of the drawing and wouldn’t come down. The tree has never fruited since, only bloomed.'},
 {id:'marsh',part:'The Marsh place',at:()=>({x:NEWHOUSES.marsh.x+4.6,z:NEWHOUSES.marsh.z+2.2}),k:'cap',who:'Eleanor Marsh',yr:1952,
  text:'A girl’s cap on the porch rail of the Marsh place. Eleanor Marsh, Grandpa’s little sister. He drove her out west on Route 9 the night she was drawn, and stopped at the Pine Rest, and the next morning the road had brought them both back here. He signed the register: <i>bringing her home</i>.'},
 {id:'clearing',part:'The Tithe clearing',at:()=>({x:TITHE.x+8.6,z:TITHE.z+5}),k:'shoe',who:'Tommy Ward',yr:2003,
  text:'A small shoe outside the ring of stones, not on the step with the others. Tommy Ward got as far as the stones and lay down and wouldn’t walk any further. They carried him. This shoe came off on the way.'},
 {id:'mill',part:'The old mill',at:()=>({x:30-4.6,z:99+1.6}),k:'marbles',who:'Benjamin Fenn',yr:1965,
  text:'Marbles in a flour sack by the mill door, the kind of weights a child uses to play shop. Benjamin Fenn helped his father weigh the grain every autumn. His own line in the ledger is in his father’s hand. The weight is right to the ounce.'},
 {id:'millroad',part:'Mill Road',at:()=>({x:20+3,z:72}),k:'top',who:'Arthur Vale',yr:1983,
  text:'A top in the verge of Mill Road. Arthur Vale, Iris’s brother. Iris sewed his clothes for the Tithe herself, because nobody else would get the hems right, and she has sewn the Tithe’s clothes every year since.'},
 {id:'wksquare',part:'Wickham square',at:()=>({x:WK.sq[0]-6,z:WK.sq[1]+3}),k:'slate',who:'Molly Harlow',yr:1944,
  text:'A slate by the well in Wickham square with a name written over and over: MOLLY MOLLY MOLLY. Wickham gives its dead to the river and thought that spared it. In 1944 the drawing came across the water anyway, for Tess’s great-aunt.'},
 {id:'wkriver',part:'Wickham’s river',at:()=>({x:128-5,z:71.6-2}),k:'marbles',who:'Ollie Pike',yr:1958,
  text:'River stones in a bag by the ferry, each painted with a face. Ollie Pike, who is still in the river. Finn talks to him every day. Nan has never told Finn that Ollie was her brother, and that he would be ninety this year.'},
 {id:'wkchapel',part:'Wickham chapel',at:()=>({x:130+5.6,z:36.2+2}),k:'cap',who:'Grace Quinn',yr:1999,
  text:'A Sunday cap tucked behind Wickham chapel. Grace Quinn, the preacher’s daughter. He read the service the morning she went, and his voice didn’t shake once, and he has never forgiven it for not shaking.'},
 // ---- the new land
 {id:'motel',part:'The Pine Rest',at:()=>({x:RGP.motel.x+12,z:RGP.motel.z+5}),k:'shoe',who:'Kevin Ross',yr:1974,
  text:'A sneaker at the end of the motel’s walkway. The Ross family stopped at the Pine Rest for one night in 1974 on their way west. They were given Room 6. In the morning the parents drove on alone and didn’t remember they’d ever had a son.'},
 {id:'cars',part:'The field of dead cars',at:()=>({x:RGP.cars.x+3,z:RGP.cars.z+7.4}),k:'horse',who:'Maria Delgado',yr:1985,
  text:'A plastic horse on the back seat of the nearest wreck, faded pink. Every car in this field belonged to a family who stopped in the valley for directions. Maria Delgado’s parents left their car here and walked home, and never said why.'},
 {id:'county',part:'The county line',at:()=>({x:RGP.county.x+3,z:RGP.county.z+1.6}),k:'marbles',who:'Toby Kerr',yr:2009,
  text:'Marbles under the county sign. Toby Kerr and Wes were going to leave together. They walked past the sign side by side. Wes came in at the farm gate. Toby didn’t come in anywhere.'},
 {id:'greyfield',part:'Greyfield',at:()=>({x:RGP.home.x+10,z:RGP.home.z+6}),k:'slate',who:'Alice, number 34',yr:1935,
  text:'A slate in Greyfield’s yard with a name written on it: ALICE. No surname. The Home gave its children numbers. Alice wrote her name on everything she owned so somebody would know it after. Somebody does now.'},
 {id:'fen',part:'The Fen',at:()=>({x:RGP.hut.x+6,z:RGP.hut.z+4}),k:'cap',who:'the Pike girl',yr:1872,
  text:'A rag cap on a grass rope by the hut. The second child, the first ever given to the fen. The book doesn’t give her a first name, only “the Pike girl”. The peat cutter called her Bridget, in his diary, so she would have one.'},
 {id:'deepcorn',part:'The Deep Corn',at:()=>({x:RGP.harlan.x-6,z:RGP.harlan.z+3}),k:'top',who:'Jesse Harlan',yr:1968,
  text:'A top in the dirt of Harlan’s yard. Harlan’s own boy, Jesse. Harlan stopped planting the year after. The corn has come up in the same maze every spring since, the shape of the path Jesse ran.'},
 {id:'dam',part:'The dam',at:()=>({x:RGP.view.x-3,z:RGP.view.z+1}),k:'shoe',who:'Nora Kerrigan',yr:1931,
  text:'A child’s shoe on the apron below the dam. Nora Kerrigan, Ada’s little sister, the last child drawn from Old Wickham. They opened the sluices the week after. Ada was the only one in the village who refused to leave her house.'},
 {id:'ridge',part:'Pine Ridge',at:()=>({x:RGP.ranger.x-8,z:RGP.ranger.z+4}),k:'cap',who:'Lily Carver',yr:1996,
  text:'A sun hat on the ridge path. The Carvers came camping in 1996. Lily walked up toward the lookout to see the view. Her tracks went up. The rangers wrote it down the way they always do.'},
 {id:'oldmarrow',part:'Old Marrow',at:()=>({x:RGP.chapel.x-12,z:RGP.chapel.z+5}),k:'horse',who:'Hannah Dunn',yr:1872,
  text:'A wooden horse, charred, by a fallen chimney. The second year. Hannah Dunn’s mother set the fire that burned Old Marrow, to stop it happening again. It happened again. The town was rebuilt down in the valley, away from the ashes, and kept the Covenant.'},
 {id:'birches',part:'The Weeping Birches',at:()=>({x:RGP.den.x+4,z:RGP.den.z+2}),k:'slate',who:'Margaret Hale',yr:1880,
  text:'A slate by the den with a doll drawn on it. Margaret Hale, the pastor’s great-grandmother’s little girl. Her mother hung the first doll in the birches. Every mother since has done the same, so nobody would ever have to be the only one.'}];
S.count=S.count||{};
const RGC_OBJ={};
function rgcSpot(x,z){for(let r=0;r<7;r+=.5)for(let a=0;a<12;a++){const X=x+Math.cos(a/12*6.283)*r,Z=z+Math.sin(a/12*6.283)*r;if(LAYERS.water(X,Z))continue;
  const A=cgNear(X,Z,.6);if(A.c.some(c=>Math.hypot(c.x-X,c.z-Z)<c.r+.45)||A.r.some(q=>X>q.x0-.45&&X<q.x1+.45&&Z>q.z0-.45&&Z<q.z1+.45)||A.s.some(s=>segDist(X,Z,s.x1,s.z1,s.x2,s.z2)<(s.r||.15)+.4))continue;
  if(typeof tileAt==='function'&&X>FIELD.x0-.5&&X<FIELD.x0+FIELD.w+.5&&Z>FIELD.z0-.5&&Z<FIELD.z0+FIELD.h+.5)continue;return {x:X,z:Z};}return {x,z};}
{const _bw=buildWorld;buildWorld=function(){_bw();for(const c of RGC){let p;try{p=c.at();}catch(e){continue;}const s=rgcSpot(p.x,p.z);c.x=s.x;c.z=s.z;
  RGC_OBJ[c.id]=obj('rem_'+c.k,s.x,s.z,{kind:'prop',noCol:true,hide:!!S.count[c.id]});
  interact.push({x:s.x,z:s.z+.15,r:1,on:()=>!S.room&&!S.count[c.id],label:()=>'Look',ok:()=>true,act(){rgcFind(c);}});}};}
function rgcFind(c){if(S.count[c.id])return;SFX.page&&SFX.page();
  openNote(`<h3>${c.who}, ${c.yr}</h3><p class="jsub">${c.part}</p><p>${c.text}</p>`,'Say their name',()=>{S.count[c.id]=S.day;const o=RGC_OBJ[c.id];if(o)o.hide=true;
    if(typeof M!=='undefined')M.v=Math.min(100,M.v+6);addLore(`${c.who}, ${c.yr}. ${c.part}.`);
    const n=Object.keys(S.count).length;setTimeout(()=>toast(n>=RGC.length?`That’s all of them. ${RGC.length} names. Somebody has kept count.`:`You say it out loud: ${c.who}. (${n} of ${RGC.length} names)`,3.4),300);});}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);try{S.count=S.count||{};for(const c of RGC){const o=RGC_OBJ[c.id];if(o)o.hide=!!S.count[c.id];}}catch(e){}return r;};}
// ---- the journal: the Count, at the top of the Places tab
{const _ph=placesHtml;placesHtml=function(){const n=RGC.filter(c=>S.count[c.id]).length;
  let h=`<div class="herow"><div class="hehead"><b>The Count</b><span class="jsub">${n} of ${RGC.length} names</span></div><div class="jsub">Every part of the valley gave up one child, and kept one thing of theirs. Find it, and say their name.</div><ul class="helist">`;
  for(const c of RGC)h+=`<li>${S.count[c.id]?`<b style="color:#4a8a2a">✓</b> <b>${c.who}</b>, ${c.yr} · ${c.part}`:`<span style="opacity:.5">○</span> <i>${c.part}</i>`}</li>`;
  return h+'</ul></div>'+_ph.apply(this,arguments);};}
// ---- the last night: at the door, you say the names you found
{const _se=stEnding;stEnding=function(k){const E=ST_END&&ST_END[k];const names=RGC.filter(c=>S.count[c.id]);if(!E||!names.length)return _se.apply(this,arguments);
  const all=names.length>=RGC.length;
  const beat=`Before anything else, you say their names. The ones you found. ${names.map(c=>c.who).join(', ')}.<br><br>`+(all?`When you say the last one, every window in the valley lights at once, and stays lit, and the whole town hears it: a hundred and fifty years of names, and yours is not one of them.`:`The valley is very quiet while you say them. ${names.length} of them. Somewhere out in the dark, the rest are waiting to be counted.`);
  if(E._t0==null){E._t0=E.text;E._e0=E.end||'';}E.text=E._t0+'<br><br>'+beat;E.end=E._e0+` You kept count: ${names.length} of ${RGC.length} names.`;return _se.apply(this,arguments);};}
