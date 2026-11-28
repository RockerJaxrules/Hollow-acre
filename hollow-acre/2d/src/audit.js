/* ================= the depiction audit, part one (docs/STORY_PLAN.md 8.3; hard limit: no child is ever shown hurt, nothing tied to
   children gets gore, every taking is offscreen and implied). The owner's lore stays: the Tithe takes children. Only the words
   that showed harm change, each to a version that keeps the same story beat:
   Dunn's photographs: each face covered by a square of brown paper with the year on it (not the eyes scratched out)
   the mill: a hair ribbon tied round the spindle (not hair wound into the millstone)
   the orchard: the milk tooth in the bite stays; "the root is wet" goes
   the crypt: the names are scratched inside the lids (not "with fingernails")
   Walt's Truck: Tobias's torch keeps going until the trees hide it (it doesn't "go out")
   Bram at night: "It waved back." (not "with my hand")
   Lines already saved in a journal are swapped for the new ones. The five pictures (the small grave, the quarry, the fen, the
   cold house's third hook, the girl in the drowned street) change with their words in part two. ================= */
const AUD_TXT=[
  ['list','In every photo the eyes have been scratched out with a pin, carefully, so the paper didn’t tear.','Over every face he has pinned a small square of brown paper, with the year inked on it.'],
  ['mill','There is hair caught in the millstone, long and fine, wound round and round the spindle.','There is a hair ribbon tied round the spindle of the millstone, neatly, in a bow.'],
  ['orchard',' When you pull it out the root is wet.',''],
  ['crypt','scratched with fingernails, over and over','scratched over and over']];
const AUD_LORE=[['Dunn keeps the drawing list and a photo of every child drawn, eyes scratched out.','Dunn keeps the drawing list and a photo of every child drawn, each face covered with a square of brown paper.']];
(function(){try{for(const [id,a,b] of AUD_TXT){const bt=SAGA.find(q=>q.id===id);if(!bt)continue;for(const k of ['text','lore'])if(typeof bt[k]==='string')bt[k]=bt[k].split(a).join(b);}
    for(const [a,b] of AUD_LORE)for(const bt of SAGA)if(typeof bt.lore==='string')bt.lore=bt.lore.split(a).join(b);}catch(e){}
  try{const E=ST_END.truck;E.text=E.text.split('and keep going, and keep going, and go out.').join('and keep going, and keep going, small and steady, until the trees hide it.');}catch(e){}
  try{const n=npcById('bram');if(n&&Array.isArray(n.def.night))n.def.night=n.def.night.map(l=>l==='It waved back with my hand.'?'It waved back.':l);}catch(e){}})();
function audLore(){try{if(!Array.isArray(S.lore))return;for(let i=0;i<S.lore.length;i++)for(const [a,b] of AUD_LORE)if(typeof S.lore[i]==='string'&&S.lore[i].includes(a))S.lore[i]=S.lore[i].split(a).join(b);}catch(e){}}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);audLore();return r;};}
audLore();
