/* ================= #159 hidden habits and flaws for every townsperson =================
   Everyone in this valley is hiding something small and human. The more time you spend near a
   person, the more you notice: first a private habit — the odd, lonely thing they do — then the
   flaw under it, the weakness or meanness they'd never admit. Each is written into your journal as
   you find it, and noticing the rot in people costs you a little, the way it does. Save-safe:
   S.flawN counts your talks, S.flawH/S.flawF mark what you've seen. No two people share a tell. */
const FLAWS={
  abel:{habit:'He scrapes the last of the flour into a jar he keeps for no one, and hides it behind the stone.',flaw:'He has never once tasted the bread he bakes, and lets the grieving eat it anyway.'},
  ada:{habit:'She counts the till twice, then a third time, mouthing a different number each pass.',flaw:'She shorts the grieving on their change and tells herself they are too sad to notice.'},
  bram:{habit:'He scratches a tally into the orchard bark of everyone who walks into the copse.',flaw:'He watches it all from up high and tells no one, because being the only one who knows feels like power.'},
  cora:{habit:'She touches every doorframe twice before she will pass through it.',flaw:'She would let the whole town burn before she would risk raising the alarm and being wrong.'},
  corwin:{habit:'He winds a wristwatch that stopped decades ago, every hour, on the hour.',flaw:'He waves travellers on toward the Black Lake knowing the road, and never once says turn back.'},
  della:{habit:'She writes names in a ledger for children who were never born.',flaw:'She decides, quietly and alone, which of them were ever meant to live.'},
  ezra:{habit:'He rings the chapel bell one stroke short and swears to your face that he counted right.',flaw:'His piety is cowardice turned inside out: he prays loudest for the people he has already given up on.'},
  finn:{habit:'He buries the best of every catch in ice under the dock, for himself.',flaw:'He is quick to let another man wear the blame for his own short, stripped nets.'},
  gideon:{habit:'He oils and cleans a gun that has no firing pin, every single evening.',flaw:'A bully who only stands tall when the person across from him is smaller.'},
  hob:{habit:'He talks to the scarecrow in his field and waits, head cocked, for it to answer.',flaw:'He would sell any neighbour’s secret for a drink and not remember doing it by morning.'},
  ida:{habit:'She lays a fifth place at supper for someone who never comes, and clears it before dawn.',flaw:'She smiles through everything, and lets the smile do all her lying for her.'},
  iris:{habit:'She saves the hair from her brush and braids it into a long, dark rope she keeps hidden.',flaw:'Vain, and quietly cruel to anyone plainer than she is.'},
  june:{habit:'She reads one letter out of every mailbag before she will deliver it.',flaw:'She holds back the ones with bad news a day longer and calls the delay a kindness.'},
  lyle:{habit:'He washes his hands until the skin cracks and still swears he can smell it.',flaw:'He has lost patients he could have saved, and signs every certificate “natural causes.”'},
  maud:{habit:'She leaves a lit lamp burning in the empty quarry all night, for no one.',flaw:'She knew the stone was wrong and let them keep cutting it.'},
  moss:{habit:'He saves string, nails, bent spoons — anything small — in tins by the dozen.',flaw:'A hoarder who would sooner let a thing rot in his shed than lend it to a neighbour in need.'},
  nan:{habit:'She lays out her own funeral clothes each night and folds them away again by morning.',flaw:'She poisons every happy story with “it won’t last,” and means it as wisdom.'},
  nell:{habit:'She measures the doorways with a length of string, as if something large is expected through them.',flaw:'She runs from every hard thing and calls it “stepping out for air.”'},
  orla:{habit:'She leaves the ripest apple on her husband’s grave and eats only the bruised ones herself.',flaw:'She jokes so hard about dying that she never has to answer a single real question.'},
  otto:{habit:'He wades into the pond where it is too shallow to drown, and stands there waiting anyway.',flaw:'He lets the town believe he is simple, so that he is never once asked to help.'},
  pip:{habit:'He pockets one small thing from every house he is let into.',flaw:'A thief who has talked himself into believing that borrowing without asking is not stealing.'},
  quinn:{habit:'He copies the same verse over and over, and each time one word comes out wrong.',flaw:'He stopped believing a long time ago and keeps taking the collection all the same.'},
  silas:{habit:'He roots through the bins at dusk for small white things, and pockets them before you can look.',flaw:'He robs the fresh graves of their teeth and calls it tidying up.'},
  tess:{habit:'She whispers the day’s gossip to her cat before she will tell a living soul.',flaw:'She can twist a kind word into a cruel one by suppertime and feel she did you a favour.'},
  vera:{habit:'She sets every clock in the house five minutes fast and will not say why.',flaw:'She would rather be feared than crossed, and she has held the same grudge for forty years.'},
  wes:{habit:'He practises other people’s signatures on the backs of old receipts.',flaw:'He lies first, by reflex, and works out the reason for it afterward.'},
  hale:{habit:'He stands with his nose almost against the rock on the green and does not blink.',flaw:'He has known for years what lies under this town, and chose, every Sunday, to preach comfort instead.'},
  mae:{habit:'She keeps a packed bag under the store counter and checks its latch without noticing she’s doing it.',flaw:'She has planned to leave this valley a hundred times and never once made it past the bridge.'},
  tobias:{habit:'He whittles the same small bird from every scrap of wood and leaves them where children will find them.',flaw:'He is kind to everyone and trusts no one, and could not tell you why if you asked.'},
  hollis:{habit:'He keeps the honour box padlocked and tallies it against a list only he can read.',flaw:'He skims a little off everything that passes through his pumps and calls it a handling fee.'},
  agnes:{habit:'She runs her late husband’s truck in the yard once a week, going nowhere, until the tank is dry.',flaw:'She gives his things away to be thanked for it, and quietly resents anyone who isn’t grateful enough.'},
  dunn:{habit:'He drives the same loop of Route 9 every night and writes down whose lights are still on.',flaw:'He has always known which disappearances not to look into, and he sleeps just fine.'}
};
{const _t=talk;talk=function(n){_t.apply(this,arguments);try{
  if(S.bound||!n||!n.def)return;const id=n.def.id,F=FLAWS[id];if(!F)return;
  S.flawN=S.flawN||{};S.flawH=S.flawH||{};S.flawF=S.flawF||{};
  const c=S.flawN[id]=(S.flawN[id]||0)+1,nm=n.def.name.split(' ')[0];
  if(c>=2&&!S.flawH[id]){S.flawH[id]=1;setTimeout(()=>toast('You’ve started to notice things about '+nm+'. '+F.habit,5.4,true),1000);
    if(typeof addLore==='function')addLore(nm+' — '+F.habit);if(typeof mindHit==='function')mindHit(1);return;}
  if(c>=5&&!S.flawF[id]){S.flawF[id]=1;setTimeout(()=>toast('Something about '+nm+' settles wrong in you. '+F.flaw,5.8,true),1000);
    if(typeof addLore==='function')addLore(nm+' — '+F.flaw);if(typeof mindHit==='function')mindHit(2);return;}
}catch(e){}};}
