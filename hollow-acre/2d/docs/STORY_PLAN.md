# Hollow Acre Part 1: the story plan

A design document only. Nothing here is built yet. It is written for the owner first (plain words, short parts, tables)
and for builders second (state names, conditions, numbers and file names where they matter).

## The plan in one page

- **Twelve chapters instead of three.** The valley you know becomes Act One (chapters 1-3). Then the old night train
  takes you away three times, to three new places, each about the size of the whole valley, and brings you back between
  them (chapters 4-11). The last chapter is the last week, the drawing and Tithe night (chapter 12).
- **It starts ordinary.** You crash, you walk to Grandpa's farm, you light the stove, plant turnips and get your car
  fixed. Things are only a little wrong at first: crows that all turn their heads at once, a scarecrow a step closer
  every morning, footprints round the cabin in the dew. The game never says "something is wrong". You notice.
- **You only go where you have a reason to go.** Every place the story needs comes from something you found or someone
  you asked. The journal keeps a list of these leads, and the arrow only points at places your character actually knows.
- **Show it, make them hear it.** Pictures and sounds carry the horror. Words are kept to one short line at most.
- **The train is a big thing.** Ten cars, three in-game days a journey. By day you cook in the dining car, play cards,
  stoke the engine, fish at the water stops and get to know the passengers. By night the lights go out and you hide,
  scavenge and run until dawn, alone or with friends. Nights on the train are a little longer than days.
- **The three places:** Charrow, a burnt-out lumber town in giant trees; Gloamwater Springs, a faded spa resort with a
  grand hotel; and Ninefathom, a storm-beaten fishing harbour with a dark lighthouse on an island. Each has its own
  people, interiors, monsters and story, and each sends you home with one of the three things that open the door.
- **The good ending is easy.** Finish the main story and choose to open the door from the inside. Nothing else is needed.
- **New systems:** a Fear bar with your character's face showing it; abandoned places with secret cellars you must
  escape; "the Hollow is at your door" that is fake until the day it isn't; weekly lives for every person in town.
- **A versus mode** where one friend plays the Hollow. It can only play tricks by day and hunts at night, and here you
  can lose.
- **Old saves keep everything.** A table in section 8 says where each save lands.

### Hard limits (apply to every line of this plan)
- No child is ever shown hurt. Nothing tied to children gets gore, at any gore level. When the story takes a child,
  it happens offscreen and is only implied.
- Nothing sexual.
- No real people and no real places. Every name here is made up.

The owner's lore stays: the Tithe takes children. That is how the game already works, and the limit is about what is
shown. Section 8.3 audits every line and picture today that shows harm to a child and gives each a non-graphic
replacement that keeps the plot.

---

## 1. What exists now

### 1.1 The chapters and beats

The game has three chapters (`saga.js`, `story.js`, `t360/story337_x1.js`, `regionstory.js`, `darkpath.js`).

| Chapter | What happens | Main beats (file) |
|---|---|---|
| One: The Hollow | The crash on Route 9, the farm, Caitlyn's farming lessons, the car repaired in 7 stages, the drive out that loops back to your own gate, the 6 diary pages, 3 Ward candles, the rite at the 3 stones, the Hollow bound into the scarecrow | deer, well, barn, agnes, graves (`saga.js`); motel, county (`regionstory.js`); pages (`base2.html` PAGES); candles, altars (`game.js` objective) |
| Two: The Tithe | Nobody says your name. 5 places to see, 8 things to know, 2 Ward bundles. A letter in your own handwriting says where the 3 stones are. Find them and set them on the Tithe House step; the door goes quiet and the count starts (7 days) | marsh, tithe, tree, lake, wick (`story.js` ST_PLACES); mill, quarry, orchard, crypt, ferry, cold, scare (`saga.js`); birches, greyfield, oldmarrow, fen, lookout, drowned (`regionstory.js`); stones dock/tree/bed (`story.js`) |
| Three: The Door | One beat a day in the last week, the woods take one, the one you love is taken and freed under the church, the drawing, Tithe night and the choice | list, yourgrave, jars, rehearsal, stay (`saga.js`); corn (`regionstory.js`); darkpath; stDrawing, stChoice (`story.js`) |

Around the main line: 6 Ward bundles (`progress.js`), the Count of 34 small things (`rgcount.js`), 8 night events in the
new land (`rgnight.js`), heart events for about 30 people (`hearts.js`, `hearts2.js`, `heartmae.js`, `heartstage.js`),
the hidden mind with its hallucinations (`mind.js`), the quiet doubts (`doubt373.js`), the Hollow's night hunting
(`hollow364.js`, `night362.js`), the horror director (`horror.js`), festivals, romance and marriage.

**Endings now (six).** Chosen at the Tithe House door on Tithe night (`story.js` stChoice):

| Ending | What it needs now |
|---|---|
| The Door Opens (the true one) | all 3 stones set, the full Ward (6 bundles), Maud's fourth shard (9 hearts), Ruth's ribbon (Agnes, 10 hearts), Danny's letter (Caitlyn, 10 hearts, which needs dating her) |
| The Far Shore | Corwin's gas can and Vera's hand (hearts) |
| Walt's Truck | Walt's truck key (Caitlyn, 8 hearts) |
| Dunn | Dunn's slip (Dunn, 10 hearts) |
| The Tag | Ezra's brass tag (Ezra, 9 hearts) |
| Taken | nothing |

The true ending is the hardest thing in the game to get. The owner wants the good ending easy (section 4).

**Time now.** Day runs 6:00 to 20:00 at 42 seconds a game hour (about 9.8 minutes). Night runs 20:00 to 2:00 at 36
seconds an hour (about 3.6 minutes), then you collapse (`game.js`). While the story lasts it is always October
(`seasons.js`).

### 1.2 How the player is guided now

- **The goal bar** at the top (`objective()` in `game.js`, wrapped by nearly every story module) says what to do next,
  with a target.
- **The guide arrow** points straight at that target, and the bar adds a compass word and a distance (`wayfind.js`).
- **Who to ask** (`guide.js` stepGuide): each step names a person who then says plainly what to do.
- **Caitlyn's lessons**: a long chained tutorial for every farm system (`tutorial.js`, `guides314.js`).
- **The journal**: tabs for notes, heart events, places and the Count; the lore list (`social.js`, `hevents.js`,
  `rgplaces.js`).
- **Chapter cards** and opening notes that explain the chapter (`story337_x1.js`).
- **The countdown** under the clock in the last week.

### 1.3 Where the game tells instead of shows

| Where | What it does now | Why it's telling |
|---|---|---|
| Grandpa's note on the door (`base2.html` LETTER) | Explains the Tithe, the bell, the diary in pieces, the store, the garage, and in the P.S. that the scarecrow moves closer every night | The whole mystery is handed over in the first minute. The scarecrow is described before you can notice it |
| Chapter Two's opening note (`story.js` stStart, `story337_x1.js`) | "Caitlyn tells you there will be a drawing... Ask people. Caitlyn, Hale and Della know the most... Find out what the Tithe is." | A summary of what to feel and who to ask |
| The mind's tier messages (`mind.js` TIER_MSG) | "Your hands won't stop shaking." "You're not sure what is real any more." | Says how you feel instead of showing it |
| The mirror (`horror.js`) | A toast describes what the reflection does | The reflection itself is never drawn doing it |
| The knock (`horror.js`) | Three thuds (good), then a toast: "It is your voice." Opening the door: a toast describes wet footprints to your bed | The sound works; the words take it away. The prints are never drawn |
| Night events in the new land (`rgnight.js`) | "A hand comes up out of the black water beside you, opens, and goes back down" as a red toast | Eight strong pictures that are only text |
| The townsfolk breaking (`routines.js` BREAKS) | They stand at the spot, then a line explains what they are doing | Half shown, half explained |
| Story beat captions (`saga.js`) | Under the close-ups, lines like "You come back up the steps backwards. You don't remember deciding to." | Tells you what you did and felt |
| Night talk (`base2.html` NPCDEF night lines) | "Go home. It's walking tonight." | Fine as flavour, but it names the threat every night |
| The drawing (`story.js` stDrawing) | One long text card | The biggest scene in the game is a page of prose |
| The choice (`story.js` stChoice) | Lists locked endings with "Needs the full Ward, the fourth shard..." | A shopping list at the most frightening moment |
| Small finds (`story.js`) | "A black stone sits in the bottom, and a child's tooth beside it." | Told |

The close-ups (`sights.js`, "show it, don't tell it") already fixed many beats. The rule now is to finish that job.

### 1.4 Where the player is sent somewhere with no reason to know it

| Goal text now | The problem |
|---|---|
| "Something is lying on the farm track behind the barn. Go and look." (deer) | Nothing has led you there |
| "The water from the well has tasted of pennies since the deer. Go and look down the well." (well) | You never tasted it |
| "Grandpa kept something in the barn he never let anyone see. Go to the barn door." (barn) | Nobody told you this |
| "Maud's quarry men walked off the job last week and won't say why." (quarry) | Nobody told you this either |
| "There's a cellar door on the side of the church that Hale keeps chained. Tonight it isn't." (crypt) | How would you know it's unchained tonight? |
| "Off Route 9 West is Greyfield... Dunn says it closed in 1951." (greyfield) | Dunn never said it in play |
| "Bram keeps drawing a white wood..." (birches) | Only if you met Bram and saw a drawing |
| "Silas has been digging since dawn." / "Dunn keeps the drawing list at his house." | Facts nobody gave you |
| Chapter Two's bar: "Places 2/5 · Things known 3/8 · Next: The Black Lake" with the arrow on it | A checklist of places you haven't heard of, and the arrow knows where they are |
| The first letter: "One is under the Black Lake dock. One is in the hollow tree... One is under your bed." | Three hiding places handed over by magic |
| "Buy 3 Ward Candles from the peddler at the crossroads" | Shown before anyone mentions candles or a peddler |
| Every saga and region beat | The arrow points at the exact spot the moment the beat opens |

---

## 2. The new structure

### 2.1 The lore underneath

This is the truth the player pieces together over twelve chapters. Nobody ever says all of it. It keeps the owner's lore
(the Covenant, one child each autumn, the door, the drawing) and adds where it came from and who profited. Every taking
is offscreen and only implied (section 8.3).

- **1870, Ninefathom.** A fever ship, the brig *Constance Grey*, comes into a northern harbour. The town quarantines her
  passengers on Wrackholm, a rock island with a lighthouse. Under the lighthouse there is a well with no bottom and
  something in it, an empty hunger that takes the shape of whatever keeps it. The keepers' light has always held it down.
- **The bargain.** Nine families on the island (Abernathy, Dunn, Fenn, Hale, Marsh, Pike, Quill, Thorne, Vale) fear for
  their children as the fever spreads. The thing offers to keep them all: no fever, no blight, no flood, if they carry it
  away from the light, and give it one of theirs each autumn. The Thornes, who are quarrymen, cut three stones (and
  secretly a fourth) from the lighthouse footings, which are its door. The families row off in the night with the
  stones. The light goes out behind them; the grown men and women left in the quarantine station do not live (they are
  the Salt).
- **1871, Marrow Hollow.** The families find an empty valley and build a windowless house on the three stones. The
  Covenant is cut into the altar at Old Marrow, as it is now: *One of ours each autumn, given in the house without
  windows; and the valley keeps us. No blight, no fever, no flood, no leaving.* Marsh signed first, and gave first.
- **The Hollow** is what the hunger became here: it wears the field's scarecrow, it stands in the road for anyone it
  wants, it cannot move while you look at it. Everyone it takes is still behind the door of the Tithe House, holding it
  shut with their whole weight (Danny's letter). What the town gets back in the morning is a ribbon, folded.
- **The company.** The Marrow & Northern Railway and Land Company (the M&N) laid the line round the valley's rim in
  1868 and saw what the Covenant did for Marrow Hollow's harvests. It turned the idea into a business. It sold a cutting
  of the Hollow to Charrow in 1888, whose keeping took one grown mill hand a year: the company wrote it into the work
  contracts. It kept a keeping for itself at Gloamwater from 1885, whose price is one grown guest a year "for the Season".
  And it arranged Greyfield's orphans for Marrow Hollow (as now: the town bought them so its own were spared), the
  receipts countersigned with the company stamp, until 1951, when *it sent them back. It wants its own.* The company
  also owns the Pine Rest Motel, where one grown traveller a year checks into Room 6 and never checks out (as now,
  unexplained), and it prints the drawing notices.
- **The rim line.** The railway runs round the rim of the wheel the valley's roads make (the hub is your field). Iron
  laid on the rim is not the valley's, so the road loops but the train can leave. The town lifted the spur and smashed
  the flag lamp at Marrow Halt after the last person got out: your grandmother, E., long before you were born. The
  No. 9 still passes at 2 a.m. and never stops.
- **This year.** Thirty years ago Grandpa Elias paid with your name so he could stay (Nan's jar, as now). You were a
  child then; the debt waited. Now you have come, and you are late. You are this year's Tithe. Grandpa put on the burlap
  himself to hold it off a little longer.
- **How it ends well.** Fire would free the taken but burn them (Charrow learned that with its grown mill hands).
  Names call them (the company's ledger has them all). Light shows them the way (the Wrackholm lens). Pull the door's
  nails with cold iron, go in with the light, read their names, and push when they push. The door opens outward and they
  walk home, each the age they were. The thing goes back to the dark it came from, and the valley stops keeping anyone,
  so it lets everyone go.

**What Part 2 needs from Part 1 (kept true).** Your grandmother is E. (Eleanor Hollow in Part 2). Part 1 shows only a
photo of her on the Marrow Halt platform with a suitcase, and a bundle of her letters to Elias, sealed and never opened,
postmarked COLDWATER with a mining company crest. Nothing about her mountain, her company or her fate is told in Part 1.
The letter from R. Kessler and the drive are Part 2's opening (`ending_story.js`, `ending_drive.js`, unchanged). The
Count's "Eleanor Marsh, 1952" is renamed Edith Marsh so the two never get confused (8.3).

### 2.2 The twelve chapters at a glance

| # | Chapter | Where | The player's own goal | Ends when | Brings |
|---|---|---|---|---|---|
| 1 | Route 9 | The farm, Route 9, town | Settle in, fix the car, go home | The road loops you back to your own gate | The car (useless now) |
| 2 | Grandpa's Diary | The farm, town, the Pine Rest | Find Grandpa and a way out | The Hollow is bound into the scarecrow | Grandpa's hat in the ash |
| 3 | The Tithe | Town, Wickham, Greyfield, Old Marrow, Marrow Halt | Find out why nobody says your name | The No. 9 stops for your lamp | A ticket |
| 4 | The No. 9 | The train (3 days), Charrow | Deliver Dr. Ashby's letter, find the ironworks | You arrive and meet Charrow | A first lead in Charrow |
| 5 | The Burn | Charrow | Learn how Charrow ended its Tithe | You escape the root hall down the flume | The cold nail |
| 6 | Cold Iron | The train home, the valley | Get home, find the first stone | Stone one, and the company's trail | Stone 1; the Gloamwater lead |
| 7 | Gloamwater | The train (3 days), Gloamwater Springs | Find the company's books | You are chosen for the Season | Two keys to find |
| 8 | The Season | Gloamwater | Take the ledger and get out | The runaway funicular, the train | The ledger of every name |
| 9 | The Names | The train home, the valley | Bring the names home, find the second stone | The Hollow comes through your door for real | Stone 2; Danny's letter; the Ninefathom lead |
| 10 | Ninefathom | The train (3 days), Ninefathom | Find where the stones came from | You reach the island at low tide | The wreck's log |
| 11 | The Lantern | Wrackholm, the train home, the cabin | Take the light | Stone three under your bed | The Lantern's eye; Stone 3 |
| 12 | The Door | The valley | Survive the last week and open the door | An ending | Part 2's letter (good ending) |

A rough length: chapters 1-3 about as long as today's whole game (about 12-15 hours); each trip pair (4-5, 7-8, 10-11)
6-8 hours; each home chapter 3-4 hours; chapter 12 about 4 hours. About 45-55 hours for the main story.

How each chapter's beats are written below:
- **Lead from** says where the character learned of the next place. No beat starts without one.
- **Shown / heard** lists the pictures and sounds. "Line" is the most the character says, and it is short.

---

### Chapter 1: Route 9

**Goal.** Get to Grandpa's, get the car fixed, go home. Nothing more. The player doesn't know there is a story yet.

**Beats.**
1. **The drive in** (the existing intro, `main.js` introCine). Night, storm, Route 9. On the passenger seat, Grandpa's
   envelope with a hand-drawn map. The car passes the Pine Rest Motel: its VACANCY sign flickers. Headlights find a deer.
   Behind the deer, for three frames, something tall. Swerve. The oak.
2. **Morning in the wreck.** The phone shows no bars, and its map is a blue dot on grey. Grandpa's map: *past Pruitt's
   garage, keep east, our sign is by the lane.*
   *Lead from:* the envelope. Direction lead (east on Route 9), no arrow yet.
3. **The walk east.** A white-haired woman on a porch with its light on in daylight (Agnes) watches you pass and goes
   in. Pruitt's garage is shut (OPEN 7 AM); Hollis's dog barks, then whines and backs away from you. Crows on the wire
   all turn their heads at the same moment. The HOLLOW ACRE sign.
   *Lead from:* seeing the sign turns the lead exact (the lane, the cabin).
4. **The cabin.** A short note on the door (rewritten, section 8.3): where the key is, kick the stove, seed in the tin,
   *Caitlyn at the store buys what you grow, Hollis can fix anything, be in by the bell. P.S. Leave the scarecrow be.*
   Inside: his cup on the table with a skin on the tea, his coat on the hook, his boots by the door. Line: "Grandpa?"
5. **Settling in** (Caitlyn's lessons start here, unchanged). Light the stove (kick it), draw water at the well, dig,
   plant and water the turnips, ship in the bin. Day one has no scares at all.
6. **Hollis at seven.** He walks to the wreck with you and lists the parts. *Leads from Hollis*, each exact because he
   says where: a tire (Coyle's store), a battery (he'll trade for three of Elias's pumpkins, "they're in his patch"), a
   fan belt ("Agnes's late husband's truck has sat in her shed twenty years, last house west, porch light on"), and gas
   (his pump). The seven repair stages and their minigames stay as they are (`carrepair.js`, `mg4car*.js`).
7. **The store.** Caitlyn and the tire. A corkboard of MISSING posters, one per autumn, school photos going yellow at the bottom of the pile, layered like scales. The newest is a blank sheet with the tape ready. Line (Caitlyn): "Kids run off. Every town's got a board like this." She says
   Elias last came to church the Sunday before last and sat in the front row, "and he never sits in the front."
8. **Agnes.** The belt from the shed. She asks if Elias is with you. Through her doorway, a child's room kept as it was: the small bed made up, the calendar on the wall stopped on an October 25 years ago. Line (Agnes): "Have you seen my Ruth?"
9. **The first night.** The church bell at eight (heard from the farm). From the window the town's lit windows go out one
   by one. Something walks round the cabin in a slow circle (footsteps panned all the way round you). In the morning, a
   ring of prints in the dew, your size. No toast.
10. **The barn.** The frame stage needs Grandpa's jack and winch, which are in the barn. On the track behind it you hear
    flies first, then crows lift. The deer laid out like a clock (the existing close-up, heart still beating). Inside the
    barn door, the existing calendar beat: 150 calendars, a birthday circled on each, yours on top, and a salt-filled
    chalk body your height with a drawn smile.
11. **The scarecrow** stands a step closer to the cabin every morning (`placeScarecrow`, as now). On the second morning
    the camera holds on it for half a second as you step out. If you look at it, line: "Wasn't it by the fence?" It goes
    into the journal's "Things that aren't right".
12. **Wes** (17, Dunn's son, Hollis's apprentice) helps on one stage and talks about the four times he tried to leave.
13. **The drive out.** The car runs. Caitlyn: "Tell me what you see. Promise." You drive west at dusk: the oak, the Pine
    Rest (NO VACANCY now, Room 6's window lit), the county line sign. Then the HOLLOW ACRE sign comes up ahead. The car
    dies. You walk west on foot (the existing county beat): the same trees, the same crack in the road, your own gate,
    the lane printed with your boot prints going out and coming back. Chapter card.

**Clues and people.** Grandpa's envelope; Hollis (parts); Caitlyn (tire, posters, Elias's last Sunday); Agnes (belt,
Ruth); Wes; Sheriff Dunn ("Car accident? Deer? I'll write it up. Eventually.").

**Shown / heard.** The tall shape behind the deer; crows turning as one; the dog backing away; lights going out across
town; footsteps circling; the ring of prints; the scarecrow creeping; the deer clock (flies heard before seen); the barn
calendars; your own prints on the lane.

**Places.** The wreck and the oak, Pruitt's garage, the Abernathy house, the farm (cabin, field, well, barn, the track
behind the barn), Coyle's store, the county line.

**Ties.** The tall shape in the headlights is the Hollow ("it stands in the road for everyone it wants"). The lit Room 6
is the next chapter's door.

---

### Chapter 2: Grandpa's Diary

**Goal.** Find Grandpa, and find a way out.

**Beats.**
1. **The Pine Rest** ("the motel will have a phone"). *Lead from:* you drove past it twice. The office door is unlocked;
   the bell's clapper is gone. The register (the existing beat): one guest a year since 1952, all Room 6, none signed
   out; the last line is yours, in your hand, *coming home*, the ink wet.
2. **The phone.** You dial home. It rings, and across the valley, faint, the payphone in town is ringing. Someone picks
   up. Breathing. Then your own voice: "Don't come back here." Heard only.
3. **Room 6** (abandoned interior; section 6.2). The key is gone but the window is open. A bed, a suitcase, a TV of snow.
   Under the mattress, Grandpa's first diary page: *If you're reading this, the road brought you back too. The rest is
   where we took the pictures.* And the key to his desk. The door handle turns while you're inside; hide in the
   bathroom; footsteps on the walkway stop outside; leave by the window.
4. **Grandpa's desk.** The photo album: you as a small child on the farm, then six photos of places with nobody in them:
   a covered bridge, the pond dock, the churchyard wall, the town hall clock, a row of corn, the scarecrow's post. Each
   photo is an **area lead** with no arrow until you recognise the place (walk into it) or ask someone who knows it.
   *People who know:* Caitlyn (the bridge, "that's Mill Road"), Otto (the dock), Silas (the churchyard), June (the town
   hall clock). The pages keep their text and lie where today's six PAGES lie, matched to the photos.
5. **The well.** After the second page the well water comes up tinted. You drink at the well and your character
   grimaces; the can's water is drawn rust-coloured. Look down: the existing bucket close-up (as now): a braid of hair the colour of yours, a brass tag stamped HOLLOW ACRE 1874, a milk tooth tied in with dark thread.
6. **Ruth's ribbon.** Page four is about Ruth. Ask Agnes about it and she tells you, winding the ribbon tight round her
   fingers (as now): Ruth was nine; the night they drew her Agnes tied it in her hair so she could find her in the dark; they brought it back folded.
   *Lead from Agnes:* "Before you buy anything off that thing at the crossroads, look at the small graves." The existing graves beat, with the audit's fix (8.3): the last small grave is open, and at the bottom of it a bedsheet lies folded square, clean and pressed, with a jar label pinned to it in Grandpa's hand: *for later.*
7. **The candles.** Page three: *candles from the crossroads man, after dark, coin only.* Hale gives the first one (as
   now). The peddler sells the other two after 7:30 p.m.: a long coat, a lamp, a face you never see, hands with too many
   knuckles. *Lead from:* page three and Hale.
8. **The first knock** (stage A of section 6.3). Three knocks one night. "Look through the window": the Hollow's face
   pressed to the glass, in full close-up detail. Open the door: nobody, and wet prints in the world leading in past you.
9. **The rite.** The last page: *light the stones anyway.* After the bell, light the three stones (churchyard, west
   woods, past the corn) and keep your light on it. The binding, and Grandpa's straw hat in the ash (as now).

**Clues and people.** The register; Room 6's page and the desk key; the album; Caitlyn, Otto, Silas and June naming the
photos; Agnes; Pastor Hale; the peddler.

**Shown / heard.** Your own voice on the phone; the handle turning in Room 6; the rusted water; the braid; the open
grave; the peddler's hands; the face at the window; the first stalking nights (eyes at the edge of the light, crickets
falling silent); the rite.

**Places.** The Pine Rest office and Room 6, the payphone, the cabin desk, the covered bridge, the pond dock, the
churchyard, the town hall, the corn, the scarecrow, the crossroads, the three altar stones.

**Ties.** Grandpa wore the burlap; the Hollow wore him. The field goes quiet, but the last page says *if I refuse, the
Tithe falls to my blood. That means you.*

---

### Chapter 3: The Tithe

**Goal.** Find out why nobody says your name now, and what the Tithe is.

**Beats.**
1. **The bell rings once at 3 a.m.** on its own (it wakes you). In town, where people would say your name the talk box
   shows a gap. June's mail for you is addressed THE TITHE, HOLLOW ACRE.
2. **The cut from the crash goes bad** (your top health is lowered a little; the character winces when running). Hollis
   or Caitlyn: "Get that looked at. Doc Ashby's in Wickham." *Lead from:* them. Dr. Ashby stitches it and goes quiet at
   the scar on your thumb: Elias had the same one. In his waiting room, a framed photo: *Charrow, 1909. The Ashby mill.*
   In Wickham square, the noticeboard: the drawing notice, every year the same, this year with your birthday (close-up).
3. **The church book.** Hale: "Keep the Ward, two bundles, and I'll show you the book." The book's columns: *Name · Family · Year*, one child a year back to 1871. The last line is your name, family Marsh, the year thirty years ago crossed out and this year written beside it in Grandpa's hand: *late.* Shown, never explained.
4. **The mill.** Caitlyn: "Abel buys grain." Selling corn at the mill puts you at the sack scale and its ledger (the existing beat): once each autumn, *The share. 3 st 12 lb.* A hair ribbon tied round the spindle (the audit's fix for the hair in the millstone, 8.3).
5. **Nan's price.** Tess at the Lantern Inn: Elias crossed on Nan's ferry every autumn. Nan's jar of names (as now): your
   name in Grandpa's hand. "He paid with yours, so he could stay."
6. **Greyfield** (abandoned interior with an escape; section 6.2). Ask Dunn where the valley's records are kept and he says: "Some of it's out at Greyfield. The old children's home. Shut in '51." *Lead from:* Dunn, exact. The intake book (as now): *Marrow Hollow, for the harvest*, the receipts signed by the town clerk, and now also stamped M&N R&L CO. Under 1951: *It sent them back. It wants its own.* Upstairs, something small walks the dormitory (heard, as now). The escape is in the boiler cellar, where the roots have come through the wall: the Rinds hunt by sound; out up the coal chute. No gore anywhere at Greyfield, at any level.
7. **Old Marrow.** On a Thursday you see Maud walk up the north road with a bucket and brush (her routine). Follow her.
   She scrubs the soot off the altar: the Covenant (as now). Line (Maud, not looking up): "My
   family cut the stones that hold that door. Don't ask me where from."
8. **The Tithe House.** Silas, digging, nods down Mill Road: "You'll want to see your house." Nailed shut a hundred and fifty times; a child's shoes on the step, toes pointing in (as now). Every nail head is stamped CHARROW
   IRONWORKS (close-up).
9. **The first letter from you** (the mailbox, rewritten): *Don't be scared of the handwriting. It's yours. I'm you, a
   little later. The stones were moved so the door would open. You'll find them, you always do. Before that, leave.
   Find out where all this came from.* No hiding places.
10. **Your grandmother.** Dunn: "Your grandmother's the only one I ever saw leave. Took the night train, before you were
    born." The album's last sleeve, which looked empty, has a photo behind the card: a woman on a station platform with a
    suitcase, *E. The last train. She made it.* June has a bundle of letters to Elias in her dead-letter box, sealed,
    postmarked COLDWATER, a mining crest on each. She gives them to you as next of kin. They stay sealed.
11. **Marrow Halt** (abandoned interior). Dunn: "Up past Pine Ridge, on the rim. Line still runs. Doesn't stop." The
    station house, ticket office and signal box. In the lamp-room cellar, the last stationmaster, long dead in his chair
    (adult; gore at Full). The flag lamp is smashed. Mending it is ordinary work: Gideon mends the lamp body, Hale gives
    you a shard of red glass from the church's broken window, Caitlyn sells you lamp oil, Hollis and Wes free the rusted
    signal lever (a mechanical minigame).
12. **The night at the platform.** Hang the lit lamp and wait for 2 a.m. In the rim woods, tall figures stand between the
    trees, burlap faces, still while your light is on them (the Hands, their first appearance). The headlamp comes round
    the bend. The No. 9 stops: black, huge, one coach lit. Conductor Rook steps down. "Marrow Halt. We haven't stopped
    here since your grandmother." Chapter card.

**Clues and people.** June, Hollis, Caitlyn, Dr. Ashby, Tess, Nan, Hale (and the Ward), Abel, Dunn, Maud, Silas,
Gideon, Hollis and Wes, Conductor Rook.

**Shown / heard.** The 3 a.m. bell; your name missing from every mouth; the drawing notice; the church book's columns;
the ledger's weights; the jar; the dormitory footsteps; Greyfield's Rinds (they hunt by sound; hold your breath); the Covenant under the soot;
the shoes on the step; the stationmaster; the Hands in the trees; the train.

**Places.** Wickham (surgery, inn, square, ferry), the church, the mill, Greyfield, Old Marrow, the Tithe House
clearing, Marrow Halt and the rim woods.

**Ties.** Three threads leave the valley: CHARROW IRONWORKS on the nails and the doctor's photo (chapter 4), the M&N
stamp on the deeds (chapter 7), and Maud's stones from "somewhere" (chapter 10). Dr. Ashby asks you to take a letter to
his great-uncle Cyrus in Charrow, an ordinary errand that makes Charrow first.

---

### Chapter 4: The No. 9

**Goal.** Get to Charrow, give Cyrus Ashby his great-nephew's letter, and find the ironworks that made the nails.

**Beats.**
1. **Boarding.** Rook punches your ticket. The punch holes are not in a line: held to the light they spell your name.
   Berth 3 in Sleeper A. Meet the crew (section 5.2): Rook, Hal and Lottie on the engine, Chef Bastien, Emmanuel the porter.
2. **Day 1.** The train in daylight: the dining car's kitchen, the lounge, the observation car, the mail car. The
   passengers of this journey (arc "The Widow's Urn", section 5.5). Noon water stop at a lake: fish, forage, the
   station vendor. The viaduct over the gorge at dusk.
3. **Night 1, "Lights Out"** (the teaching night). From the rear forward, the lamps go out one car at a time, each
   with a small tick before it dies. Emmanuel shows you berth 4's false back ("If they come, take berth 4"). You
   scavenge oil, relight a car, watch something tall walk the corridor past your curtain. Dawn.
4. **Day 2.** The passengers are rattled and won't say why. Cards with Lucky Pell; cooking for the dinner sitting;
   Mrs Rand sets a place at dinner for her husband, whose ashes are in the urn on her lap.
5. **Night 2, "The Unlit Halt".** The train stops at a platform with no name board in a black forest. A lamp swings in
   the station's window. Figures climb into the rear car. Hold the vestibule with iron nails while Lottie needs coal
   from the tender, which means crossing the roof.
6. **Day 3.** Burn country from the observation car: miles of black snags, ash falling past the glass, the screen graded
   orange. No words.
7. **Night 3, "The Rounds".** Rook walks the train punching tickets. In every compartment he opens, the passenger is gone
   in the morning. Keep yourself (and, if you can, Mrs Rand) out of his way until dawn. At the last dinner, the seat she
   set is taken by a man of charcoal, his hand on hers. She gets off at Charrow with him.
8. **Charrow Junction at dawn.** Heat, cicadas, smoke haze. Mabel Tarrow's boarding house (your base: a room, a bed, a
   bench). Cyrus Ashby reads the letter, looks at you a long time. Line (Cyrus): "You came on the Nine. It doesn't let
   people off twice."
9. **The first lead in Charrow.** At the ironworks, Tilly Brack turns a nail over in her fingers and knows the stamp.
   *Lead from:* the nail heads (chapter 3) and Mabel ("The old ironworks is Tilly's now, by the creek").

**Clues and people.** The ticket; Rook, Hal, Lottie, Bastien, Emmanuel; Mrs Rand, Lucky Pell, Fennimore Clay, the
Moores; Mabel; Cyrus; Tilly.

**Shown / heard.** The punched name; lamps ticking out car by car; the corridor walker's shadow on your curtain; the
unlit halt; the Hands climbing aboard; the burnt country; Rook's punch in the dark (a click, a click, a click, nearer);
the charcoal man at the table.

**Places.** The No. 9 (all ten cars and the roof), the water-stop lake, the viaduct, the unlit halt, Charrow Junction,
Main Street, the boarding house, Cyrus's house, the ironworks yard.

**Ties.** Charrow's Tithe (chapter 5). Mrs Rand's husband is one of Charrow's burnt dead coming home.

---

### Chapter 5: The Burn

**Goal.** Learn how Charrow ended its Tithe, and take what you came for.

**Beats.**
1. **The ironworks.** Tilly shows the nail moulds and the order book: *M&N R&L Co., for Marrow Hollow, 150 nails
   yearly*. The quench cellar is locked; Tilly won't go down. Help her at the forge for a few days (a forge minigame,
   paid work) and she trusts you with the key.
2. **The One-Log Church.** Father Gale's register lists Charrow's Tithes from 1889 to 1910: one grown mill hand a year, chosen by the company's contract. The fire
   bell rings by itself at ten past two every afternoon, the hour the fire started (heard all over town).
3. **Cyrus remembers** (a staged scene in sepia pixels, `stage.js`). He was eight in 1910 and survived. Clementine Ashby, 26, the manager's daughter, walked into Charrow's windowless house with a lamp in place of the man drawn that year. The house burned. The taken, all grown mill hands, came out burning and walked into town looking for their houses. "We shut the doors on them." Cyrus is never in danger in it.
4. **The Old Growth and the sawmill.** Dell Whitlock's mill cuts firewood from the fallen giants. A log splits on the
   saw and there is a man's shape inside the grain, sap running red (adult; gore at Full). In the canopy, cones fall in a
   rhythm, like someone walking up there (heard).
5. **The Burn by night.** The Charred walk in a line down off the ridge toward the Rows, each carrying a lantern that
   gives no light, and knock on the company houses' doors. Hide in one; one stops at your window and looks in.
6. **Ashby House** (abandoned interior with a secret cellar and an escape). The company manager's mansion, empty since
   1910. Clementine's room and her diary: *If the light goes in, they'll follow it out. If it spills, it all burns.* Her
   last line: *the stone that holds a door hides where the sun goes in at noon, in a split tree.* Under the house, the
   root cellar: the graft's root, thick as a man, barked, a cutting of the Marrow field's Hollow. The Rinds. Escape.
7. **Camp Three** (optional side story; abandoned). Pump the speeder up the logging spur with the Halloran twins to the
   old camp. One twin goes missing overnight; he is found high in the canopy, tied in his own climbing rope (adult;
   gore at Full). The bunkhouse is a hiding place at night.
8. **The root hall.** Tilly's key opens the quench cellar, and its back wall opens onto a tunnel that runs under the
   Burn to the cellar of the burnt Tithe House, whose door frame still stands up on the ridge, open, with charcoal
   footprints leading out. Below: roots, the shapes where the taken lay, and the graft's heart, rotten, still beating.
   In it, the first nail of Charrow's door: **the cold nail**, iron that never warms. Take it.
9. **The flume.** The roots wake. Run to the flume intake and ride a log down the flume to the millpond (a set piece:
   duck the trestles, jump the broken sections). The Charred line Main Street. Mabel pulls you into the boarding house.
10. **Leaving.** At dawn the No. 9 takes on water at Charrow Junction. Cyrus is on the platform. Line (Cyrus): "Don't burn
    it. Whatever you do." Mrs Rand waves from a company-house porch, the charcoal man beside her.

**Clues and people.** Tilly, Father Gale, Cyrus, Dell, Mabel, Rosa Kemp (she maps the Burn and guides you in daylight),
Amos Pryce (the company store), the Halloran twins.

**Shown / heard.** The fire bell at 2:10; the man in the log; cones falling in step; the Charred's line of dead
lanterns and their knocking; the face at the window; the graft's root; the beating heart; the flume ride.

**Places.** The ironworks and its quench cellar, the One-Log Church, the Old Growth, the sawmill and millpond, the Rows,
the Burn, Ashby House and its root cellar, the root hall, the flume, Camp Three, the speeder spur.

**Ties.** The cold nail (`coldnail`) can pull the Tithe House's nails from your side without fire. Clementine's lesson:
light, not fire. Her split tree points at the hollow tree at home (chapter 6). The drawing notices pinned in the Rows
were printed by the *Gloamwater Press* (a close-up of the small print, chapter 7).

---

### Chapter 6: Cold Iron

**Goal.** Get home with the nail, and find the first stone.

**Beats.**
1. **The journey home** (arc "The Newlyweds"). Ben Moore is going to claim his aunt's farm near the rim, on land the company sold her. The
   Hands come straight for your berth now, because of what you carry. Nights: "The Roof", "Uncoupled", and a harder
   "Lights Out" (section 5.4).
2. **The morning after you left.** You step off at Marrow Halt and walk home. The kettle on your stove is still warm.
   Caitlyn: "You were in yesterday." The wall calendar shows the same October day you left. The valley kept its own time.
3. **The sermon.** On Sunday you hear Hale's sermon from outside the church, about those who leave. The whole
   congregation turns round on the pew to look at you through the open door, together.
4. **It turned its head** (the existing scare beat). The bound scarecrow has turned to face your cabin; the burlap is wet.
   Grandpa's voice from the straw: "Not long now. Bring the stones home."
5. **The hollow tree (stone one).** You have seen the carving *WHEN THE SUN IS IN* (if not, Bram shows you; he climbs
   everything). Clementine's diary makes it exact. At noon, with a steel axe: the first stone, warm as skin.
6. **The quarry.** On Friday at the Lamplighter, Maud says her men walked off and won't say why. The shape cut into the face, a person's shape a little smaller than you, scratched from inside, outward. Low in the hollow, a small silver star, the kind girls stick on for a birthday, pressed into the stone (the audit's fix for the nails, 8.3).
7. **The orchard.** Orla pays you to help with the picking (an ordinary job). One tree has no leaves, only apples, each with one small bite. Grandpa's coat on the scarecrow at the end of the row, your name sewn in the collar.
8. **The cold house** (a hiding place). Otto saw smoke by the Black Lake. In the turf cellar: hooks, two animal carcasses dripping, and on the third hook, a child's coat on a hanger with Agnes's blue ribbon tied round the hook, *RUTH — KEEP COLD* chalked on the beam (the audit's fix, 8.3). A lamp comes down the steps.
   Hide behind the carcasses. Hob's boots stop beside you. Blood drips on your hand. He counts the hooks and goes.
9. **The wheel.** Bram's drawings of the valley pinned on the school wall all have the same lines. The fire lookout
   (existing beat): the roads run out like spokes, the hub is your field, every ranger logged *Tithe night, light in the
   Marsh field, 2 a.m.* That night at the ranger's cabin, something walks on the roof (heard).
10. **Charrow iron.** Gideon can't copy the cold nail, but he can work Charrow's iron: iron nails you can drive across a
    door at night (a new defence), and better Ward nails.
11. **The second knock** (stage B of section 6.3).
12. **The company's trail.** Ida, at the bake table: "Hale's brother went to Gloamwater to keep the company's books.
    Every Hale generation sends one." The deeds' stamp, the Gloamwater Press, and Augustin Hale.

**Clues and people.** Ben and Clara Moore; Caitlyn; Hale; Bram; Maud; Orla; Otto; Hob; Gideon; Ida.

**Shown / heard.** The warm kettle; the turning congregation; the wet burlap and Grandpa's voice; the noon light down
the tree; the scratched shape in the quarry; the bitten apples; the dripping hooks and Hob's boots; the roof footsteps.

**Places.** The train; the valley (church, the field, the hollow tree, the quarry, the orchard, the cold house, the
school, the lookout and the ranger's cabin, the forge, the bake table).

**Ties.** Stone one. The company is the next thread (chapter 7).

---

### Chapter 7: Gloamwater

**Goal.** Find the company's books.

**Beats.**
1. **The journey out** (arc "The Card Sharp": Lucky Pell owes the company and is running). Nights: "The Long Tunnel",
   a harder "Rounds", and "The Unlit Halt" where the Hands come for Lucky (save him if you won his marker at cards).
2. **Gloamwater Springs.** Warm mist, blossom, steam off the terraces. The Grand Gloamwater Hotel has a reservation in
   your name. The card in its file is brown with age, the date written as 1871. Your room is Room 6, in the old wing.
3. **Mrs Quennell's tea.** Imelda Quennell, the last of the founding family, is gracious and delighted you came. A poster
   in the lobby for this year's Season Ball, the guest of honour's face left blank.
4. **The company headquarters.** Augustin Hale, the archivist, is polite and gives you nothing. The vault needs two keys,
   his and Mrs Quennell's.
5. **The cinema.** Felix Aubrey, the projectionist, runs the company's old reels for you: each year's Season guest,
   smiling at the camera in 1921, 1946, 1978, and never a day older. The last reel is you on the Marrow Halt platform,
   filmed the night you boarded.
6. **The baths.** Dr Lisle's cure in the Pump Room: your Fear drops right down. The next morning your fingertips are
   water-wrinkled and cold, and stay so all day. The pipes in the walls knock in time with your heartbeat (heard).
7. **The Winter Garden.** Noor Haddad studies a warm black stone in the spring's source, the same as the valley's stones.
   The label on its specimen case: *purchased from the wreck of the Constance Grey, Ninefathom, 1870.*
8. **Night in the hotel.** The Kept walk the corridors in bathrobes, dripping, smiling, knocking on doors: "Is it the
   Season yet?" Hide in your wardrobe.
9. **The sixth floor.** The lift opens on a floor that the hotel says is closed. Every door on the corridor is Room 6,
   and the corridor turns back on itself. Find the real stairs.

**Clues and people.** Lucky Pell; Mrs Quennell; Augustin Hale; Felix; Dr Lisle; Noor; Leon Okafor (the night porter, who
knows the service tunnels); Pearl and Dot (two widows who have lived at the hotel for forty years and know every guest);
Sid Marlowe (the bellhop).

**Shown / heard.** The 1871 reservation card; the blank face on the poster; the film reels; your wrinkled fingers; the
pipes keeping your pulse; the Kept's knocking; the repeating corridor.

**Places.** The train; the hotel (lobby, dining room, ballroom, Room 6, the sixth floor), the company headquarters, the
cinema, the Pump Room, the Winter Garden, the boardwalk lake.

**Ties.** The Season (chapter 8); the *Constance Grey* (chapter 10).

---

### Chapter 8: The Season

**Goal.** Take the ledger and get out before the Season keeps you.

**Beats.**
1. **The sanatorium** (abandoned interior with a hide and an escape). Up the funicular to the Quennell Sanatorium, shut
   since 1938. Records of Season guests "under the cure". The Kept in the hydro wards. Augustin hid his vault key here
   years ago, because he wants out too. He trades it for a letter you will carry to his brother.
2. **The Season Ball.** A dance (like the Lantern Dance, a rhythm game). At midnight everyone in the ballroom turns to
   look at you at once, and applauds. Mrs Quennell names you the Season and gives you her key herself, smiling: the vault
   is part of the honour.
3. **The vault under the Deep Baths.** The Great Ledger: every Tithe of every keeping, with name, date and family (Marrow Hollow from 1871, Charrow 1889-1910, Gloamwater's Seasons from 1885). And the company's copy of the
   Covenant, signed as witness.
4. **The Kept rise.** The water in the Deep Baths rises and heats. The Kept climb out (gore at Full: skin loosened by
   decades of water). Out through the service tunnels with Leon.
5. **The funicular.** The car's brake fails on the way down. A runaway ride (a set piece) to the station. The No. 9 is
   pulling out; Leon holds the door. On the platform Mrs Quennell waves, smiling, crying.

**Clues and people.** Augustin, Mrs Quennell, Leon, Dr Lisle, Felix, Noor.

**Shown / heard.** The hydro wards; the ballroom turning as one; the vault; the rising warm water; the Kept climbing out;
the funicular cable singing as it goes slack.

**Places.** The sanatorium, the funicular, the ballroom, the Deep Baths and the vault, the service tunnels, the station.

**Ties.** The ledger (`ledger`): every name, so the taken can be called home. Its first page is the *Constance Grey*'s
passenger list: the nine families.

---

### Chapter 9: The Names

**Goal.** Bring the names home, and find the second stone.

**Beats.**
1. **The journey home** (arc "The Soldier Going Home": Corporal Dean Abara, on leave, going home to a rim town the company built). Nights: "Lights Out", "The Long Tunnel", and "Stopped": the Hands stop the train in the dark to take back
   the ledger, and everyone (or every friend) must restart the engine: coal, water, the brake, the whistle.
2. **Augustin's letter.** Hale reads his brother's letter in the church and sits down in the front pew, where nobody
   sits. He says nothing. From then on he lets you into the bell tower.
3. **Danny's letter** (a main beat now, whatever your hearts with Caitlyn). Caitlyn reads the ledger with you and finds
   her brother: *Danny Coyle, 1999*, in the sheriff's handwriting. She gives you the letter he left the night before his
   drawing: *It isn't a monster. It's a door. Everyone it took is still inside, holding it shut. If enough of us push at
   once it opens the other way.*
4. **The Weeping Birches.** A doll hangs in the birches for every child the Tithe took, a birthday stitched on each (as now). With the
   ledger you can put a name to each one. Ruth's wears Agnes's blue ribbon. The newest has hair the colour of yours, and
   its stitching isn't finished.
5. **The fen.** Nan: "The river gives back what it's given." At the edge of a pool, a plaited grass rope with a wooden token burnt 1872 and a rag cap snagged on it. Under the black water, dozens more tokens on their ropes, turning slowly. The newest, by the cutter's hut, is tied to a sleeve of your coat laid out on the peat (the audit's fix, 8.3).
6. **The drowned bell.** Tess: "Old Wickham's bell still rings after dark." The reservoir dock at night: the drowned in
   the street under the clear water, all facing your farm. One lifts a hand and waves.
7. **The Black Lake (stone two).** The ledger's margin: *Stone two: the lake, held from below.* The cord under the last
   plank of the Black Lake dock, pulled tight. With Otto's ash rod (or better): haul, it fights like a fish, then like a
   hand, then lets go. The second stone.
8. **The town breaks** (each person's "as it darkens" habit from section 6.4 is now in full).
9. **The Hollow comes through the door** (stage C of section 6.3). No knock this time; scratching inside the wall; the
   cat hisses at the door. It is really there. A chase inside the cabin. Hiding under your bed, you notice the
   floorboards there are warm.
10. **The Marsh place** (abandoned interior with a secret cellar and an escape). The house like yours down Mill Road
    opens now. Inside it is your cabin, later: your things, dusty, your coat older. The cellar is shelved with jars, a jar
    for every year since 1871, each labelled with your name. The Rinds. Out through the coal hatch.
11. **The stones' origin.** Maud, shown the ledger's first page: "Ninefathom. Wrackholm Island. My family cut them out of
    the lighthouse footings the night the light went out." *Lead from:* Maud and the ledger.

**Clues and people.** Dean Abara; Hale and Augustin's letter; Caitlyn and Danny's letter; Agnes; Nan; Tess; Otto; Maud.

**Shown / heard.** The stalled train in the dark; Hale in the front pew; the dolls turning with no wind; the tokens under the water; the drowned waving; the cord fighting like a hand; scratching in the wall; the warm floor; the jars with your name.

**Places.** The train; the church and bell tower; the store; the Weeping Birches; the fen and the cutter's hut; the
reservoir dock; the Black Lake dock; your cabin; the Marsh place and its cellar.

**Ties.** The names for the roll-call; stone two; the warm floor under your bed (chapter 11); Ninefathom (chapter 10).

---

### Chapter 10: Ninefathom

**Goal.** Find where the stones came from and what is under them.

**Beats.**
1. **The journey out** (arc "The Sealed Box": Sister Bernadette Ames carries a sealed box to the Seamen's Mission). The
   first sight of the sea at dusk from the observation car. Nights: "The Roof", "Uncoupled", and "Salt Line", where the
   line runs along a sea cliff and the Salt crawl up the sides of the cars from the waves.
2. **Ninefathom.** Gales, gulls, slate roofs, the harbour. Sister Agathe gives you a bunk at the Seamen's Mission (your
   base). Sister Bernadette's box holds the old key to the quarantine station.
3. **The tide.** Captain Morrow's tide table on the harbour office wall: the causeway to Wrackholm is open for two hours at
   each low tide. A tide clock joins the HUD while you are in Ninefathom.
4. **Zeke Pike's boatyard.** "My people were on the *Constance Grey*." The Pike family Bible, the passenger list in its
   flyleaf: the nine families.
5. **Brigid Thorne's smokehouse.** The Thornes who stayed. "We cut the stones. We're the ones who never left the coast,
   so we're the ones who have to look at that island every day."
6. **The cannery** (abandoned interior with a secret cellar and an escape). The gutting floor, the cold store, and under
   it the brine pits: the Salt, crusted white, crunching when they move. Out through the fish chute into the harbour.
7. **Halvard Quist,** the last keeper's grandson, in the keeper's cottage. The keepers' one rule: the light keeps it down.
   At low tide you hear a bell ring under the sea (heard).
8. **The wreck of the *Constance Grey*** on the rocks at low tide. Into the hold. The ship's log, 1870: the fever, the
   island, and the bargain in the captain's hand: *It will keep us if we carry it off the island, away from the light.*
   The tide turns while you are inside: the hold floods; get out.
9. **The quarantine station on Wrackholm** (abandoned interior, hiding). Wards, a chalkboard of the dead (grown men and
   women only), the morgue's drawers knocking from inside (adult gore at Full). The keeper's last log entry: *They have
   taken the footings. The light can't hold it. God help wherever they take it.*

**Clues and people.** Sister Bernadette; Sister Agathe; Captain Ines Morrow; Zeke Pike; Brigid Thorne; Halvard Quist;
Wren Talbot (a diver who wants to relight the old lighthouse); Teo Vale (sailmaker); Rob and Davy Gannet (trawlermen).

**Shown / heard.** The Salt on the cliff line; the tide clock; the brine pits; the bell under the sea; the flooding hold;
the knocking drawers.

**Places.** The train; the harbour, the Mission, the harbour office, the boatyard, the smokehouse, the cannery, the
keeper's cottage, the causeway, the wreck, the quarantine station.

**Ties.** The lighthouse (chapter 11).

---

### Chapter 11: The Lantern

**Goal.** Take the light that can open the door from the inside.

**Beats.**
1. **Wren's plan.** The great lens is still up in the dark lighthouse. Its core prism, "the Lantern's eye", is small
   enough to carry and still holds the light.
2. **The climb** (abandoned interior, hiding). The spiral stair. At night a band of deeper dark sweeps over the town and
   the island where the beam should be, and where it passes, things move. Hiding places on the landings.
3. **The lamp room.** Take the eye. It glows faintly in your hands, and the Fear bar drops while you hold it.
4. **The well under the lighthouse.** In the cellar, the well with no bottom. In the eye's light you see what the Hollow
   really is: a darkness the shape of a tall person, as tall as the shaft, whose face becomes Grandpa's, then Caitlyn's,
   then yours. The light pushes it down. The quarrymen who cut the footings are still on the cellar floor (adult gore).
5. **The causeway.** The tide is coming in and the Salt rise with it. Run the causeway as the water closes over it (a
   set piece). The Gannet brothers' lifeboat pulls you out of the last of it.
6. **The journey home** (arc "Compartment 6"). Compartment 6 in Sleeper A has been locked on every journey. Through its
   frosted glass, someone is writing. Nights: "The Rounds", "Stopped", and "The Hollow Walks the Train", the worst night
   in the game: the Hollow itself is aboard, not just its Hands. At dawn compartment 6 is open and empty, the ink still
   wet, and the last letter in your handwriting is on the seat: *Open it from the inside. Take the light. They'll see it.
   Push when they push.*
7. **Under your bed (stone three).** At home, the eye makes the floorboards under your bed glow from below. Pry them up
   with a steel pickaxe: the third stone, in a hollow worn smooth, as if someone has lain under your bed every night
   holding it.

**Clues and people.** Wren; Halvard; the Gannets; the passenger in compartment 6 (you).

**Shown / heard.** The dark beam; the eye's glow; the thing in the well wearing faces you love; the water closing over
the causeway; the writing through frosted glass; the glow through the floorboards.

**Places.** The lighthouse and its cellar, the causeway, the lifeboat station, the train, your cabin.

**Ties.** All three stones, the cold nail, the ledger and the eye are in your hands. Chapter 12.

---

### Chapter 12: The Door

**Goal.** Set the stones, live through the last week, and open the door.

**Beats.**
1. **The door is quiet.** Set the three stones on the Tithe House step. From inside, three knocks back. The bell rings
   once on its own. In the morning Cora's blackboard says **7**. (The existing countdown: `S.st.tithe = S.day + 8`.)
2. **One beat a day** (the existing last week, with the audit's fixes, section 8.3):
   - 7 days: **Dunn's list**, knifed to his door, with a photograph of each year's child on the church step in good clothes, each face covered by a square of brown paper with the year inked on it (the audit's fix, 8.3). The newest is of you asleep, taken from inside your cabin.
   - 6 days: **Silas digs.** The grave is your size and someone is already in it: you, older, grey, your scar on the
     thumb (adult gore; `gorex375.js` already draws this).
   - 5 days: **Ida's pantry.** Jars of milk teeth and locks of hair, by year (as `gorex375.js` already has it). She gives you an empty jar
     labelled *this year*.
   - 5 days: **the Deep Corn.** A ring of scarecrows in the drawn children's clothes (as now); the newest wears yours, your face painted on: *stand-in, if they won't come quietly.*
   - 4 days: **the rehearsal** at night in the church; the dummy with your face opened on the altar; applause.
   - 4 days: **the one you love is taken** (darkpath), freed under the church by tearing out the roots (an escape).
   - 3 days: **who stays** (your partner, or the one you are closest to, promises to stand next to you).
   - **The woods take one** (darkpath, as now).
3. **The drawing.** Played as a staged scene in the church, not a text card: the full pews, the strangers along the back
   wall, the one gap in the front row, Grandpa's straw hat as the hat, the slip, your name in Grandpa's spelling (or
   Dunn's, if he burned your slips), the polite applause, the hand on your shoulder with nobody behind you.
4. **Tithe night.** Walk down Mill Road after the bell. The Tall Man walks behind you as fast as you do, never faster,
   unless you turn back (as now). The whole valley stands round the house with their backs to you. The door is open an
   inch, and breathing in time with you.
5. **The good ending** (section 4): pull the nails with the cold nail, step inside with the Lantern's eye, read the names
   from the ledger (each name shown as it is read), and push when they push.
6. **The morning after,** the epilogue, and then the hook to Part 2 (section 4.3).

**Clues and people.** Everyone.

**Shown / heard.** Everything this game has learned to do, at its hardest.

**Places.** The whole valley.

**Ties.** Part 2's letter.

---

## 3. Guidance without magic knowledge

### 3.1 The rule
The character only knows what they have seen, read or been told. The game never knows more on their behalf. Every
place the story needs has a **lead**, and every lead has a **source**.

### 3.2 Where leads come from

| Source | Example | How it reads in the journal |
|---|---|---|
| A person says it | Hollis: "Agnes's late husband's truck has sat in her shed twenty years" | **Hollis said:** Agnes might have a fan belt. Last house west, porch light on. |
| A thing you found | the album's bridge photo | **From Grandpa's album:** a covered bridge. Where? |
| Something you saw | the Pine Rest sign as you drove past | **I saw:** a motel back west on Route 9. It had a phone sign. |
| Something you heard | the bell ringing in the north at 3 a.m. | **I heard:** a bell, somewhere north. |
| Your own routine noticing | Maud walking up the north road on a Thursday | **I saw:** Maud going up the north road with a bucket and brush. |
| A letter | the letters from you | **A letter in my handwriting:** *find out where all this came from.* |

A lead can be **opened** (new), **followed** (done), **gone cold** (no longer matters), or **changed** (new information
makes it sharper: the bridge photo becomes "the covered bridge on Mill Road" once Caitlyn names it).

### 3.3 What the arrow may point at

| How well you know the place | Example | The arrow | The map | The goal bar |
|---|---|---|---|---|
| **Exact**: you've been there, or someone named a place you can find | "Pruitt's garage", "the last house west" | points, with distance | a pin | the lead's words |
| **Area**: someone described a part of the valley | "up past Pine Ridge, on the rim" | points to the middle of the area, and turns off once you are inside it: search on your own | a dotted ring, labelled in the teller's words | the lead's words + "somewhere round here" |
| **Direction**: you heard or glimpsed it | the bell in the north | none | an arrow at the map's edge | "north" (from the compass chip) |
| **Unknown**: a photo you haven't placed | the bridge photo | none | nothing | the lead's words + "Who would know?" |

- An exact lead that is **inside** a building points at its door (as `wayfind.js` outsidePoint does now).
- The map shows only places you've been or been told about. Told-about places show as dotted rings. (DEVICE-UI is
  building map fog; leads use the same reveal list.)
- No counters like "Places 2/5" or "Next: The Black Lake". No goal text that names a place the character hasn't heard of.

### 3.4 The goal bar becomes your own note
- It shows the **pinned lead**: by default the newest main-story lead. Tap the bar to cycle through open leads; hold it
  to open the journal's Leads tab.
- It reads as the character's note, not an order: "Hollis said Agnes might have a belt. Last house west." Not "Go to
  Agnes".
- The farming lessons (Caitlyn's tutorial) keep their own lesson bar, as now. Story leads never hide a lesson.

### 3.5 The journal's Leads tab (new)
Three lists, newest first:
1. **To follow**: open leads, each with its source's face or icon, the words, and how well you know the place.
2. **Followed**: done, kept for the story so far.
3. **Things that aren't right**: oddities you noticed that are not leads yet (the scarecrow closer, the ring of prints,
   the dog backing away). Some become leads later. None has an arrow.

In co-op the farm shares one Leads tab, and each lead says who heard it ("Sam heard from Hollis...").

### 3.6 When the player is stuck
Help comes from the world, never from the interface:
- After **2 in-game days** with no progress on the main lead, the people tied to it bring it up when you talk to them
  ("Still looking for that bridge? Mill Road, by the mill.").
- After **4 days**, Caitlyn (or your partner) offers to walk there with you. Accept, and she leads you (a stage.js walk).
- A setting, **Story hints: Gentle / Normal / Strong**. Strong turns area leads into exact ones and shortens the wait to
  one day. It never invents leads you haven't earned.

### 3.7 State, for builders
- `S.leads = {id: {st:'open'|'done'|'cold', src:{kind:'npc'|'item'|'seen'|'heard'|'letter', id}, day, txt, know:'exact'|'area'|'dir'|'none', at:'anchor id'|null, r: area radius}}`, `S.leadPin`.
- Every story beat names the lead that opens it (`needLead`) and the leads it gives (`gives`).
- **Places are anchors, not coordinates.** `ANCHORS['pine_rest_office'] = {x, z}` and every lead, beat and routine uses
  the anchor id. That is what lets the map redesign move things without breaking the story (section 9.3).
- `objective()` keeps its shape `[title, text, target]` for everything that reads it; it now returns the pinned lead,
  and the target is null unless the lead is exact (or an area and you are outside it).
- Old goal texts in `saga.js`, `regionstory.js`, `story.js`, `darkpath.js` and `game.js` become lead texts (section 8.3).

---

## 4. Endings

### 4.1 The good ending: The Door Opens (easy to get)

**What the player does.** Finish the main story, walk to the Tithe House on Tithe night, and choose the first option,
"Open it from the inside".

**Exact conditions.** At the Tithe House door, on Tithe night (`S.day === S.st.tithe` and night), the option is enabled
when **all** of these hold:
- `S.st.set >= 3`: the three stones are on the step (stone 1 in chapter 6, stone 2 in chapter 9, stone 3 in chapter 11);
- the key items `coldnail` (chapter 5), `ledger` (chapter 8) and `lantern` (chapter 11) are held.

Every one of these is given by a main-story beat that cannot be skipped. **Nothing else counts:** no Ward bundles, no
hearts, no romance, no Count, no optional item, no money.

**Guarantees.**
- The option is always listed first and lit. Other endings appear only if you hold what they need, with no locked
  rows and no "Needs..." text (remove that from `stChoice`).
- If a key item is missing (an old save, a bug), the beat that gives it offers itself again in chapter 12 (Caitlyn: "You
  left this on the platform."), so the good ending cannot be lost.
- Being caught on Mill Road on Tithe night is not an ending: you wake in your bed at dusk on Tithe night and try again.
- **Before the trips exist** (while the game still ends after chapter 3 plus the old last week, section 9), the rule is
  simply `S.st.set >= 3`. The shard, the ribbon, Danny's letter and the full Ward stop being required straight away.

**What happens.** The cold nail draws the nails without fire. You step in with the Lantern's eye, and in its light you
see them: many hands at many heights, holding the door. You read the ledger's names aloud, each one shown
as it is said. They push, you push, the door opens outward. They walk out in the ledger's order, back to the first,
each the age they were taken; last out, a man in a straw hat with a faded red band: "Is it still October?" (the existing
text, kept). The morning after: a stranger asleep on every porch, Ruth asleep on Agnes's (as now), the cold house's third hook bare, and the calendar page finally turns to November (`seasons.js`). Credits.

**Optional extras (they change the epilogue, never the ending):**

| You also have | The epilogue adds |
|---|---|
| Maud's fourth shard | Charrow's and Gloamwater's taken come home too: Clementine Ashby on the Charrow platform, the Season guests walking out of the baths |
| The full Count | each found keepsake goes back to its owner in a short shot |
| The full Ward | the town's gardens bloom that winter |
| A partner | they run to you as the door opens (as now) |

### 4.2 The other endings, measured against the good one

| Ending | What it needs | How it differs from the good ending |
|---|---|---|
| **The Far Shore** | Corwin's gas can and Vera's hand (as now) | You run instead of opening the door. The taken stay inside. The boat brings you round to your own field: you got out of the valley and into it again. Bittersweet |
| **Walt's Truck** | Walt's truck key (as now) | You save one person instead of everyone. You drive Tobias to the county line; the engine dies there, he runs over the line to safety, and the Hollow folds itself into the passenger seat beside you. One line changes in the audit (8.3): his torch doesn't "go out"; it keeps going, small and steady, until the trees hide it. Years later he drives back, grown (as now) |
| **Dunn's Name** | Dunn's slip (as now) | Dunn goes in your place. The door stays shut; the cycle goes on with one good man fewer |
| **The Tag** | Ezra's brass tag (as now) | The scarecrow goes in as the Tithe. It buys one year. Next September the drawing comes again |
| **Charrow's Way** (new) | knowing Charrow's story (chapter 5) and a full lamp-oil can | You burn the house with the door in it. Nobody comes out, and nobody ever will: whatever was behind the door is lost for good, offscreen. The drawing ends for ever. From the hill you watch every porch light in the valley go out, one by one. The worst ending you can choose with your eyes open |
| **Taken** | nothing | You go in without the light. You become one of the hands holding the door |

### 4.3 The hooks (the ending files are not touched)
- `ending_story.js` and `ending_drive.js` stay exactly as they are. The plan only says when to call them.
- **When:** after the morning-after scene of any ending in which you are alive and at the farm, on the first morning
  after you next sleep, call `endingStory({spouse})` (spouse from `S.rom[id].married`, or none). June brings R.
  Kessler's letter. Route 9 lets you go.
- **Which endings:** The Door Opens (the main path into Part 2), Dunn's Name, The Tag, The Far Shore (it ends with you
  waking in your own bed), Charrow's Way (the letter finds you in the ashes). **Not after Taken or Walt's Truck**: in
  both the Hollow has you.
- The good ending is the one Part 2 assumes. Part 2 reads only what it already reads (name, look, spouse); the plan adds
  nothing to the hand-over.

### 4.4 The versus mode's endings
Section 7.4.

---

## 5. The train

The buses and the light railway inside the valley (`transit341`, the TRANSIT worker's) stay as they are: short hops.
The **No. 9** is something else: the long-distance night train of the Marrow & Northern, on the main line round the
valley's rim. It takes you away for days.

### 5.1 The No. 9

A black steam train, ten cars and a walkable roof. Each car is its own interior; the windows show the country going by
(a scrolling parallax strip, different for each journey and each hour).

| # | Car | By day | By night |
|---|---|---|---|
| 1 | Locomotive (cab) | Help Lottie stoke (rhythm game); Hal teaches the whistle codes | The firebox glow keeps the Hands out of the cab. If the fire dies, the train slows and stops |
| 2 | Tender | Coal and water | Coal to carry forward; hide in the coal (you come out black) |
| 3 | Baggage and mail | Your trunk (storage) and a work bench; sort mail (a matching game) | Mail sacks to hide in; the company's sealed crates |
| 4 | Coach A | Seats, passengers, talk | Luggage racks to hide on; under the seats |
| 5 | Coach B | As Coach A | As Coach A |
| 6 | Dining car | Cook the dinner sitting with Chef Bastien (the cooking minigames); eat with passengers | The cold locker (hide; it chills you); the pantry (food to scavenge) |
| 7 | Lounge | Cards, the piano (rhythm game), chess with Rook, the bar | Dark and open: the most dangerous car to cross |
| 8 | Sleeper A | Compartments 1-6, your berth (3); berth 4 has a false back; 6 is always locked | Berths with curtains; the false back |
| 9 | Sleeper B | Compartments 7-12; the porter's cubby | Berths; Emmanuel's cubby (a safe room, one person) |
| 10 | Observation car | The views: sketch them for postcards | The last car, where they board first |
| roof | Walkways between the ladders at each vestibule | By day on straight track only: the co-op roof race | Crossing when the corridor is blocked. Duck in tunnels or be knocked off |

**Marrow Halt** is a flag stop: the train stops when the lamp on the platform post is lit (chapter 3). After chapter 3
the No. 9 calls every seventh night at 2 a.m., and on any night the story needs it.

### 5.2 The crew (on every journey)

| Person | Who | Day | Night |
|---|---|---|---|
| Conductor Abner Rook (60s) | Polite, punctual, wrong. Never seen eating. His ticket punch spells names | Walks the train on the hour; chess in the lounge at 3 p.m. (he never loses; beat him and he tells you something true about tonight) | Gone, except on "The Rounds" nights |
| Engineer Hal Brody (50s) | Steady, deaf in one ear from the whistle | In the cab | In the cab; won't leave it |
| Fireman Lottie Gaines (40s) | Loud, brave, funny | Stoking; teaches you | Needs coal carried to her on most nights |
| Chef Bastien Leclair (50s) | Proud of his stew; frightened of nothing but bad bread | The kitchen from 7 a.m.; dinner at 6 p.m. | Locks himself in the pantry |
| Porter Emmanuel Osei (30s) | Kind; has worked the No. 9 eleven years and knows its nights | Errands, beds, tea | Knows the safe berths; tells you, if he trusts you |

No children travel on the No. 9. Rook won't sell them a ticket ("Not on the Nine"), which also keeps Vera off it in chapter 9 when she begs to come.

### 5.3 Days on board

**Time on a journey.** You board at 2 a.m. (a short first night, a taste), then three full days and three full nights,
and arrive at dawn on the fourth morning.

| | Now (valley) | On the train | In the valley (new) |
|---|---|---|---|
| Day | 6:00-20:00 at 42 s/hour = 9.8 min | 7:00-19:00 at 55 s/hour = **11 min** | 6:00-20:00 at 48 s/hour = **11.2 min** |
| Night | 20:00-2:00 at 36 s/hour = 3.6 min | 19:00-7:00 at 62 s/hour = **12.4 min** | unchanged |

So a train night is a little longer than a train day, and days everywhere are a little longer than now. A setting,
**Train nights: Short (9 min) / Standard (12.4 min) / Long (16 min)**, for those who want it.

**The valley keeps its own time.** While you are away the valley's clock stops: you come back on the morning after you
left (chapter 6 shows it). Crops, animals, friendships, birthdays and the weekly routines all pause. For builders: on
departure save `S.trip = {k, leg, day, hour, valleyDay, valleyHour}`; restore `S.day`/`S.hour` from it on return.

**Things to do by day** (each also helps you through the coming night):

| Activity | Where | How it plays | Reward | Helps tonight |
|---|---|---|---|---|
| Cook the dinner sitting | Dining car | The existing cooking minigames, to order, against a clock | Tips; Bastien's train recipes | A hot meal: full stamina at dusk |
| Nine-Card | Lounge | A short card game against passengers (catch Lucky Pell cheating) | Coins, small items, a fuse key | A fuse key: one car's lights back on |
| Stoke the engine | Cab | Rhythm: shovel on the beat, read the pressure gauge | Lottie's trust | "Fire banked": the firebox lasts an hour longer |
| Sort the mail | Baggage and mail | Matching letters to sacks | Coins; sometimes a letter for you (a story piece) | A sack of salt from the parcels |
| Sketch the view | Observation car | Frame the sight in a moving window before it passes | A postcard (6 per journey). Post them to Caitlyn and she pins them up in the store | Calm: Fear down |
| The water stop | Off the train, 1-2 game hours | Fish the lake or creek, forage, buy from the station vendor, pet the stationmaster's dog. Two whistle blasts mean ten minutes: be back on board | New fish, plants, goods | Supplies |
| The piano | Lounge | The rhythm game | Passengers' goodwill | Calm |
| Porter's errands | Sleepers | Fix a berth latch, find a lost ring, take tea round | Emmanuel's trust | He marks the safe berths |
| Talk | Everywhere | The journey's passengers and their arc (section 5.5) | Their story | Who to protect, and who not to trust |
| Nap | Your berth | Skip one or two hours | Fear down | Rested |
| Roof race (co-op only) | The roof, straight track by day | Race end to end, duck the signal gantries | Bragging rights | None. It's for fun |

### 5.4 Nights on board: hide, scavenge, run

**The aim.** Reach 7:00. Along the way: keep the firebox burning, keep some cars lit, keep the passengers you care
about out of reach, and gather what you'll need tomorrow.

**What comes.** The **Hands**: tall figures in long coats, burlap where the face should be, straw at the cuffs. They
board at unlit halts and over the rear platform, and climb along the roof. They walk the corridor and open curtains and
doors. They can't stand in a lit car's middle, only at its dark ends, and they put lamps out by touching the glass (the
lamp ticks before it dies: that is the warning). Some nights bring something worse (the table below).

**What you have.**

| Tool | What it does |
|---|---|
| Lantern / flashlight | Your own light. Oil and batteries run down |
| Car lamps | Relight with oil and fuses |
| Iron nails (Charrow iron after chapter 6) | Nail a door between cars: it holds 90 seconds |
| Salt | A line across a doorway that they won't cross, until you step over it |
| Flare | A big light for 30 seconds |
| The whistle (from the cab) | Scatters every Hand for 15 seconds, once a game hour |
| Food, coffee, tonic, bandages | Stamina, Fear, health |

**Hiding places:** berth curtains, berth 4's false back, luggage racks, under seats, the toilet closets, mail sacks, the
coal, the cold locker, Emmanuel's cubby, the roof. When a Hand is close, **hold your breath** (hold the button, let go
slowly; the higher your Fear, the harder it is).

**Moving:** walk, run, crouch. Vestibules are dark and loud: your footsteps carry. Ladders at every vestibule go up to
the roof.

**Caught.** A Hand drags you toward the rear. Break free (mash), or a friend cuts you loose. Dragged off the rear
platform, you wake at the last checkpoint (midnight or 3 a.m.) with your Fear up by 20 and half your scavenged things
gone. Nothing worse: no story progress is ever lost to a night.

**Alone or together.**

| | Solo | Co-op (2-4) |
|---|---|---|
| Hands on a night | 2 / 3 / 4 (first, second, third night) | +1 per extra player |
| Revive | none | Carry a caught friend into a lit car, or cut them loose |
| Roles that emerge | You do everything; more hiding places open | Stoker, lamp-keeper, scout, runner |
| Sharing | Your trunk | The trunk is shared; hand things over in person |
| Signals | none | Three quick signals: "here", "danger", "help" (no chat needed) |
| Checkpoints | midnight and 3 a.m. | the same, for everyone at once |

The whole group travels together: the train waits until every player is aboard (as `mpstory.js` waits for the car).

**The nights.**

| Night | What happens | How it's won |
|---|---|---|
| Lights Out | The lamps go out from the rear forward, one car at a time | Keep enough cars lit; get forward |
| The Unlit Halt | The train stops at a nameless platform in black woods; they board at the rear | Hold the vestibules with nails; fetch coal across the roof |
| The Rounds | Rook walks the train with his punch. Any compartment he opens is empty in the morning | Stay out of his way; keep the people you care about out of it too |
| The Long Tunnel | Forty game minutes underground. No light outside at all. Sound only | Navigate by sound and touch; the lamps all flicker |
| Uncoupled | The rear cars come loose and fall back into the dark | Get everyone forward before the gap is too wide to jump |
| Stopped | They stop the train in the dark | Restart it: coal, water, the brake, the whistle |
| The Roof | They're on the roof, coming down the ladders | Hold the ladders; knock them off in the tunnels |
| Salt Line | The line runs along a sea cliff; the Salt climb the cars from the waves | Light and fresh water hold them; keep them off the roof |
| The Hollow Walks the Train | The Hollow itself is aboard. It cannot move while you look at it, and the train is full of corners | Survive. Compartment 6 opens at dawn |

### 5.5 The six journeys

| Journey | Chapter | The passengers' story | Nights |
|---|---|---|---|
| 1. Out to Charrow | 4 | **The Widow's Urn.** Odile Rand takes her husband's ashes home to Charrow and sets him a place at dinner. On the last night a man of charcoal takes the seat | Lights Out · The Unlit Halt · The Rounds |
| 2. Home from Charrow | 6 | **The Newlyweds.** Ben and Clara Moore; Ben is going to claim a farm on company land. The Hands want him as well as you | The Roof · Uncoupled · Lights Out (harder) |
| 3. Out to Gloamwater | 7 | **The Card Sharp.** Lucky Pell owes the company. Win his marker at cards and you can save him | The Long Tunnel · The Rounds (harder) · The Unlit Halt |
| 4. Home from Gloamwater | 9 | **The Soldier Going Home.** Corporal Dean Abara, going home to a company town on the rim. He wants to get off at a halt that isn't on the map | Lights Out · The Long Tunnel · Stopped |
| 5. Out to Ninefathom | 10 | **The Sealed Box.** Sister Bernadette Ames and the box she won't let go of (the quarantine station's key) | The Roof · Uncoupled · Salt Line |
| 6. Home from Ninefathom | 11 | **Compartment 6.** Someone has been writing behind the frosted glass all along | The Rounds · Stopped · The Hollow Walks the Train |

Recurring on several journeys: Fennimore Clay, a seed salesman with a trunk shop (seeds from outside the valley), and
Lucky Pell.

### 5.6 Visiting: one at a time

- The three places open one at a time, in story order: Charrow (chapters 4-5), Gloamwater (7-8), Ninefathom (10-11),
  with a home chapter after each (6, 9, 11's end).
- After chapter 12 all three stay open. The No. 9 calls every seventh night. A **Quiet journey** option lets you sleep
  through the nights on repeat trips (no Hands); **Night runs** stay available for anyone who wants them.
- Each place has things only it has (crops, fish, forage, a shop), so there is a reason to go back.

---

### 5.7 The three places

Each is about the size of the valley today (528 by 610 tiles) or bigger, built to the same standard (`DESIGN_GUIDE.md`,
the pixel-artist method, LPC-style people with portraits, furnished interiors, heart events, weekly routines). Each is
its own world, loaded on arrival and unloaded on leaving (see W7 in section 9).

#### Charrow: the burnt lumber town (chapters 4-5)

| | |
|---|---|
| **Size** | 560 by 640 tiles |
| **Look** | Hot, dry, smoky. Giant trees (the Old Growth) like cathedral pillars; dust; cicadas; fireflies at dusk; thunderheads that never break |
| **Districts** | Charrow Junction (timber station, water tower); Main Street of false-fronted company buildings; the Rows (company houses, half empty); the sawmill on the millpond with its log boom; the ironworks by the creek; the One-Log Church, carved out of a single fallen giant; the swimming hole and rope swing; the flume coming down from the high camps; the Old Growth; the Burn, a ridge of black snags with the burnt Tithe House frame on top; Camp Three up the logging spur |
| **Story** | Its keeping was a cutting of the Hollow sold by the company in 1888; it took one grown mill hand a year, by contract. In 1910 Clementine Ashby burned the house from inside. The taken (all grown men) came out burning, and the town burned with them. The root survived |
| **Brings home** | The cold nail; Charrow iron (nail barricades); the lesson: light, not fire |
| **Only here** | Heat crops (peppers, melons, sunflowers), cedar wood, river trout, a spar-tree climb (a climbing minigame) with the view of Charrow's own wheel of roads, the speeder up the spur |
| **Local day** | Founders' Day (log-rolling on the millpond, the axe throw) |

| Person | Who | Weekdays | Weekend | Habit | As it darkens |
|---|---|---|---|---|---|
| Mabel Tarrow (60s) | Keeps the boarding house; lost her brother to the Burn | Kitchen 5-10, market 10-11, house 11-20 | Same; Sunday church 9-10 | Sets one extra place at breakfast | Leaves the extra place's food out on the step at night |
| Cyrus Ashby (97) | Lyle Ashby's great-uncle; survived the fire as a boy | Porch 8-12, nap 12-15, the Burn's edge 16-18 (he looks, never goes up) | Church, then porch | Talks to the ridge | Sits up all night with the lamp lit |
| Dell Whitlock (40s) | Last foreman of the sawmill; two men and a saw | Mill 6-16, store 16-17, home | Saturday mill until noon, then fishing at the boom | Spits before every cut | Stops cutting the giants |
| Tilly Brack (30s) | Runs the old ironworks as a forge | Forge 7-18 | Saturday forge until 1 p.m.; Sunday the swimming hole | Sings to the bellows | Works with the cellar door chained and a nail across it |
| Father Simeon Gale (50s) | Priest of the One-Log Church | Church 7-12, house calls 13-16, the fire bell at 2:10 | Mass Sunday 9 | Rings the bell himself before it rings on its own | Sleeps in the church |
| Rosa Kemp (20s) | Volunteer fire watch; maps the Burn | The Burn 6-11, watch hut 11-18 | The swimming hole | Marks the snags with chalk | Her chalk marks move in the night |
| Amos Pryce (70s) | Keeps the company store, open since 1890 | Store 8-18 | Saturday 8-13 | Polishes the company sign | Opens the store at midnight, for someone |
| Kit and Cal Halloran (30s) | Twin high climbers | Camp Three 6-15, Main Street saloon 18-20 | The spar tree | Race each other up everything | One goes missing (chapter 5) |

| Interior | Kind | Secret cellar | Escape |
|---|---|---|---|
| Boarding house | Your base: room, bed, bench | no | no |
| Company store | Shop | no | no |
| Ironworks | Work (the forge minigame) | The quench cellar, and the tunnel to the root hall | yes, the flume (chapter 5) |
| One-Log Church | Story; the bell | no | no |
| Cyrus's house | Story | no | no |
| Sawmill | Work; night hiding | no | no |
| Ashby House | Abandoned: explore | The root cellar (the graft's root, the Rinds) | yes |
| Camp Three bunkhouse and cookhouse | Abandoned: explore, night hiding | no | no |
| The root hall | Abandoned: the climax | is itself the cellar | yes |

**Horrors:** the Charred (the grown mill hands who walked out burning: charcoal skin, dead lanterns, they knock and want their houses; their touch burns); sap that bleeds and the shape in the log; the canopy walker; the Rinds; the fire bell.

#### Gloamwater Springs: the spa resort (chapters 7-8)

| | |
|---|---|
| **Size** | 540 by 620 tiles, plus the hotel's five floors and the baths below |
| **Look** | Warm, wet and green all year: steam off the terraces, blossom, rain, moss, a warm green lake |
| **Districts** | The station and the funicular's lower terminus; the Grand Gloamwater Hotel; the Pump Room and the baths over the hot springs; the boardwalk round the warm lake with its bandstand; the carousel pavilion (shut); the cinema in the old casino; the company headquarters; the Winter Garden glasshouses; the terraced gardens; the Quennell Sanatorium at the top of the funicular |
| **Story** | The company's own keeping since 1885. Each year one guest is chosen "for the Season" and kept in the warm water, unchanged, for ever. The company's ledger of every keeping is in the vault under the Deep Baths |
| **Brings home** | The ledger (every name); the stones' origin |
| **Only here** | Hothouse crops (tea, citrus, orchids), warm-lake fish, the baths (a strong Fear cure with a cost), the ballroom dance, the cinema's reels (a collection) |
| **Local day** | The Season Ball |

| Person | Who | Weekdays | Weekend | Habit | As it darkens |
|---|---|---|---|---|---|
| Imelda Quennell (80s, and has been since 1950) | Owner of the hotel; last of the founders | Lobby 9-11, tea 15-17, the ballroom balcony 20 | Sunday the chapel, then the baths | Calls every guest "dear" and remembers every name | Calls you by Grandpa's name |
| Leon Okafor (30s) | Night porter | Sleeps 8-16, desk 18-6 | One night off: the cinema | Checks every door twice | Stops checking the sixth floor |
| Dr Marguerite Lisle (50s) | Bath physician | Pump Room 8-13, rounds 14-17 | Saturday clinic until noon | Takes your pulse while you talk | Her own fingers are wrinkled |
| Felix Aubrey (40s) | Projectionist and film archivist | Cinema 12-23 | Same | Splices film at the bar | Shows reels nobody asked for |
| Noor Haddad (20s) | Botanist at the Winter Garden | Glasshouses 7-15, library 15-17 | Walks the terraces | Talks to the plants by their Latin names | Sleeps in the glasshouse by the stone |
| Augustin Hale (60s) | Company archivist; Pastor Hale's elder brother | Headquarters 8-17 | The hotel bar | Writes in the ledger with a steel pen | Burns his own papers |
| Pearl Dunmore and Dot Fairweather (70s) | Two widows who have lived at the hotel forty years | Lobby, lunch, cards, the boardwalk | The same, in hats | Know every guest's business | Start speaking about you in the past tense |
| Sid Marlowe (19) | Bellhop | Hotel 7-19 | Off: the boardwalk | Whistles in the lift | Won't take the lift |

| Interior | Kind | Secret cellar | Escape |
|---|---|---|---|
| Grand Gloamwater Hotel (lobby, dining room, ballroom, Room 6, the closed sixth floor) | Base and story | The sixth floor (a repeating corridor) | yes, find the real stairs |
| Pump Room and baths | Story; the cure | The Deep Baths and the vault | yes, the rising water and the tunnels |
| Company headquarters | Story | no | no |
| Cinema | Story; the reels | no | no |
| Winter Garden | Story; crops | no | no |
| Quennell Sanatorium | Abandoned: explore and hide | The hydro wards | yes, the funicular |
| Carousel pavilion | Abandoned: hiding at night (the carousel starts by itself) | no | no |

**Horrors:** the Kept (bathrobes, dripping, smiling, water-loosened skin; "Is it the Season yet?"); the plumbing that
keeps your pulse; the reels; the corridor of Room 6s; the warm stone.

#### Ninefathom: the harbour and the dark lighthouse (chapters 10-11)

| | |
|---|---|
| **Size** | 600 by 560 tiles of town, cliffs, dunes and salt marsh, plus Wrackholm island (180 by 160) over the causeway, and sea |
| **Look** | Cold, grey and wind-beaten: gales, sleet, sea fog, gulls, black rocks, slate roofs. (Not snow and not mountains: those are Part 2's) |
| **Districts** | The harbour (quays, fish market, harbour office); the Seamen's Mission; the net lofts and the chandlery; the boatyard; the smokehouse; the cannery (shut); the captains' houses with their widow's walks along the cliff; the lifeboat station; the new automatic light on the breakwater; the dunes and salt marsh; the tidal causeway to Wrackholm: the quarantine station, the lighthouse, the keeper's cottage, the drowned chapel; the wreck of the *Constance Grey* on the rocks |
| **Story** | Where it began: the fever ship, the bargain, the stones cut from the footings, the night the light went out |
| **Brings home** | The Lantern's eye |
| **Only here** | Sea fishing from the Gannets' trawler (deep-water fish), kelp and sea salt, shellfish at low tide, the tide clock, the lighthouse climb |
| **Local day** | The Blessing of the Boats |

| Person | Who | Weekdays | Weekend | Habit | As it darkens |
|---|---|---|---|---|---|
| Captain Ines Morrow (60s) | Harbourmaster; keeps the tide tables | Harbour office 6-18 | Saturday the lifeboat drill | Taps the barometer, writes the tide on the board | Writes tides that haven't happened yet |
| Zeke Pike (50s) | Boatyard; a Pike who stayed on the coast | Yard 7-17, the pub 18-20 | Sunday he sails alone | Whittles small boats | Burns the small boats |
| Sister Agathe Merle (70s) | Runs the Seamen's Mission; keeps the quarantine records | Mission all day; soup at noon | Chapel | Counts the beds every night | Counts one more than there are |
| Wren Talbot (20s) | Diver; wants to relight the old light | The harbour 8-12, the causeway at low tide | The wreck at low tide | Times everything on her watch | Stops coming back by the turn of the tide |
| Halvard Quist (80s) | The last keeper's grandson | Cottage; walks the causeway at each low tide | Same | Lights a candle in the cottage window | Lets the candle go out |
| Brigid Thorne (40s) | Smokehouse | Smokehouse 5-15, market 15-17 | Saturday market | Hums the Thorne quarry song | Stops looking at the island |
| Teo Vale (30s) | Sailmaker | Loft 8-17 | The pub | Sews with his eyes shut | Sews something your size |
| Rob and Davy Gannet (40s) | Trawlermen, brothers | At sea 4-14, the quay 14-18 | The pub | Argue about everything | Won't put to sea |

| Interior | Kind | Secret cellar | Escape |
|---|---|---|---|
| Seamen's Mission | Your base | no | no |
| Harbour office, chandlery, boatyard, smokehouse, sail loft, pub | Work, shops, story | no | no |
| Cannery | Abandoned: explore and hide | The brine pits (the Salt) | yes, the fish chute into the harbour |
| Keeper's cottage | Story | no | no |
| The wreck of the *Constance Grey* | Abandoned: the tide timer | the flooding hold | yes |
| Quarantine station | Abandoned: explore and hide | The morgue | no (hiding) |
| Wrackholm lighthouse | Abandoned: climb and hide | The well under it | yes, down the stair and over the causeway as the tide comes in |

**Horrors:** the Salt (the island's dead, crusted white, crunching, they climb out of the tide at night; light and
fresh water hold them); the dark beam; the bell under the sea; the knocking drawers; the thing in the well.

---

## 6. Systems

### 6.1 The Fear bar

The hidden mind (`mind.js`, `M.v` 0-100, 100 = calm) becomes visible. **Fear = 100 - M.v**, so every existing
`mindHit` and `mindCalm` keeps working unchanged.

**On screen.** A small portrait of your character's face beside the clock, with a thin bar under it. No number and no
words. The face says it:

| Fear | Face (portrait and in-world sprite) | Sound |
|---|---|---|
| 0-19 Calm | your normal face | nothing |
| 20-39 Uneasy | eyes flick to the side; a swallow | a faint high tone now and then |
| 40-59 Scared | brows up, mouth tight; the sprite glances over its shoulder when idle | your breathing, close |
| 60-79 Terrified | wide eyes, pale; the sprite trembles and its breath shows | a heartbeat under everything |
| 80-100 Breaking | wet eyes, mouth open; the sprite hunches and flinches at sounds | heartbeat loud; the world's sounds dull |

The portrait is built from the player's own creator layers (skin, hair, eyes, glasses, from `custom.js`) with five
expression overlays, drawn with the pixel-artist method. The scenes' `'you'` portrait with `expr:'scared'` already shows
it can be done.

**What raises it.**

| Cause | Fear |
|---|---|
| Night outdoors without a light | +1 every 10 seconds |
| Night outdoors with a light | +1 every 40 seconds |
| The Hollow watching you from the dark (unseen) | +1 a second |
| Seeing the Hollow | +8 |
| Being chased | +2 a second |
| A jump scare | +10 to +15 |
| A gore close-up | +5 to +12 |
| A knock, a fake at the door | +12 |
| Story beats | their existing `mindHit` values |
| Alone at night, far from home | +1 every 20 seconds |
| Hungry, hurt | +1 every 30 seconds |

**What it does to you.**

| Fear | Work speed (tools, crafting) | Stamina use | Minigames | Other |
|---|---|---|---|---|
| 0-19 | normal (+5% if also fed and rested) | normal | normal | none |
| 20-39 | -5% | +5% | timing windows 5% narrower | the quiet doubts (`doubt373.js`) can start |
| 40-59 | -15% | +15% | 10% narrower; aim wobbles a little | the lantern's flame jitters; now and then you fumble and drop what you hold at your feet (never lost) |
| 60-79 | -30% | +30% | 20% narrower; aim wobbles | the hallucinations (`mind.js` tiers 3); you won't step into a dark room without a light (the character stops and shakes their head) |
| 80-100 | -45% | +45% | 30% narrower | the view tunnels; at 100 you panic: you bolt for the nearest light for two seconds, or black out (`mindBlackout`) and wake with Fear at 60 |

**What brings it down.**

| Comfort | Fear |
|---|---|
| Daylight | -2 a minute |
| Standing near a lamp, stove or fire | -1 every 10 seconds |
| Talking to anyone | -5 |
| Near a friend (co-op) | -1 every 2 seconds |
| A friend's "steady" (co-op, a hand on your shoulder) | -10, once a minute |
| Sleep | down to 20-35 (35 after a nightmare) |
| Tea, coffee | -10 |
| Pie, stew, a hot meal | -15 |
| Petting the cat | -8 |
| Music: the radio, the music box, the train's piano | -5 |
| Praying in the church (once a day) | -10 |
| Holding your partner's hand | -15 |
| Dr Ashby's tonic (one a day) | -25 |
| Each Ward bundle given | night gain 5% slower, for good |
| Gloamwater's baths | -60, with a cost (section 5.7) |
| The Lantern's eye, held | -1 a second (chapter 11 on) |

A setting, **Fear effects on work: Full / Light (half) / Off**, sits next to the existing "Mind games" setting.

### 6.2 Abandoned interiors: exploring, hiding, escaping

Not every abandoned place has a cellar or a chase. The ones that do are the ones where it makes sense: places the
Hollow's roots reach, or places where the dead were kept.

| Place | Chapter | What you come for | Hide | Secret cellar | Escape | Why |
|---|---|---|---|---|---|---|
| Pine Rest Room 6 | 2 | Grandpa's first page, the desk key | yes, the bathroom, while the handle turns | the crawlspace under the bed (the Room 6 guests' belongings, one bag a year) | out of the window | The road brings one guest a year here |
| Greyfield (the old children's home) | 3 | The intake book | yes | the boiler cellar, where the roots come through the wall (the Rinds). No gore here at any level | up the coal chute | The town bought its orphans here; the roots followed them |
| The old mill race | 3 (optional) | The sack-scale room behind the wheel | no | the race tunnel | the wheel starts by itself and floods the race | The share was weighed here |
| Marrow Halt | 3 | The flag lamp | at night on the platform | the lamp room (the stationmaster in his chair) | no | The town broke the lamp so the train wouldn't stop |
| The cold house | 6 | What's on the hooks | yes, behind the carcasses, as Hob counts the hooks | no | no | The bodies are kept here |
| The ranger's cabin | 6 | The logbook | yes, as something walks on the roof | no | no | The rangers logged the light every Tithe night |
| The Marsh place | 9 | What is "later" there | yes | the jar cellar (a jar for every year with your name; the Rinds) | out by the coal hatch | The hub of the wheel is under Marsh land |
| Old Marrow chapel | 3 | The Covenant | no | the founders' crypt under the altar (nine coffins, the Marsh one empty) | no (optional explore) | The Covenant's makers lie there |
| The church undercroft | 12 | Your loved one | no | is itself a cellar (the roots and the children's coffins; no gore near the coffins, `goreChildNear`) | yes, after tearing the roots out (as now, `darkpath.js`) | It holds what the town hides |
| The Tithe House | 12 | The door | no | the inside of the door | the ending | The door |

Charrow, Gloamwater and Ninefathom each have their own table (section 5.7).

**The creatures in the cellars** (gore on these is allowed at every level that allows gore; none is ever a child or near
anything of a child's):

| Creature | Where | What it is | How it hunts | What holds it |
|---|---|---|---|---|
| The Hollow (the Tall Man) | the valley; the train (chapter 11) | the hunger itself, wearing the scarecrow | stalks from the dark; can't move while you look at it | light, looking, iron, the bell |
| The Hands | the train; the rim woods | its reach: tall coats, burlap faces, straw at the cuffs | walk the corridors, open curtains, put out lamps | light, iron nails, salt, the whistle |
| The Rinds | cellars under Marsh land, Greyfield, Ashby House | the Hollow's roots grown into a shape: pale rind skin, vine sinews, scraps of grown men's work clothes. Never gored at Greyfield | blind; hunt by sound (hold your breath, step on soft ground) | light burns them; they won't leave the dark |
| The Charred | Charrow | the grown mill hands who walked out burning in 1910 | walk in a line, knock, want their houses | doors; they don't chase, but their touch burns |
| The Kept | Gloamwater | the Season guests, kept in the warm water | walk the corridors at night, knock, follow if you answer | cold air; locked doors; daylight |
| The Salt | Ninefathom | the island's quarantine dead, crusted with sea salt | climb out of the tide at night; crunch as they come | light; fresh water |
| The drowned | the reservoir (as now) | Old Wickham, flooded in 1931 | they don't hunt; they watch your farm | (they are a sight, not a threat) |

### 6.3 "The Hollow is at your door", until it is

It must be fake often enough that you stop believing it, and then real once, so you never trust it again.

| Stage | When | What happens | Fear |
|---|---|---|---|
| A | from chapter 2, at most once a week | Three knocks at night. "Look through the window": a full close-up of the Hollow's face pressed to the glass, embers in the carved eyes, needle teeth, the straw at its collar moving with its breath. Open the door: nobody. Wet prints drawn in the world, leading in past your feet to the bed | +12, the face on screen goes to Terrified |
| B | from chapter 6 | The knock comes while you sleep and wakes you. The window shows nothing. Open the door: nothing. Turn round: it is in the mirror behind you, for half a second | +15 |
| C | chapter 9, once, scripted | No knock. Scratching inside the wall. The cat hisses at the door and backs under the table. The window shows nothing. Open the door: it is there, crouched, filling the frame. A real chase in and around the cabin. Hide under the bed (where the floor is warm) or run for the lit barn, until the bell (Hale rings it at 2 a.m., having read his brother's letter) | +25 |
| After C | chapter 9 on | Knocks are fakes as before, but about one in twenty is real: a short chase that can wound you (the first catch opens you up and lets you go, `death.js`) but never kill | |
| Versus | section 7 | The Hollow player decides which knocks are real, and pays for it | |

The same pattern goes beyond the door: a phone banner "Caitlyn: come quick, please" (you run; she is fine; she shows you
her phone, no message sent); the bell at the wrong hour; someone you know at your window at dusk who isn't there when you
go out. Fakes are shown and heard; they are never explained.

### 6.4 Scares that stay unexpected (pacing, for the horror director)

- **One big set piece per chapter,** two or three medium ones, many small ones. Never two big ones in one game day.
- **A quiet stretch after each big one:** at least a game day with only small things.
- **Break the pattern once each act:** the safe cabin isn't safe (chapter 9); a scare in full daylight (chapter 6, the
  congregation turning); the first train night is calm until its last hour.
- **Scares come where you feel safe,** as `horror.js` already does: the cabin, menus, the save, the morning.
- **Fear drives the small ones.** The higher the Fear, the more often the fakes and doubts; the big ones are on the
  story's schedule, not on Fear.

### 6.5 Weekly routines for every person

Today a few people have a weekday variant (`routines.js` WEEK, HANGOUTS, HABITS, BREAKS) on top of one daily plan
(`LIFE[id].day`). This replaces that with a full week per person: weekdays, Saturday and Sunday, a habit, and what breaks
as the story darkens (by chapter, replacing the day-numbered BREAKS and MISSING).

**Rules for everyone.**
- Everyone is indoors by 19:36; the bell rings at 20:00. Children are home by 18:00, every day, every chapter.
- Rain (as now, `rainDay`): anyone not working at an indoor job goes home or to the Lamplighter.
- Shared events stay as they are: Sunday service 7:30-9:36, Friday night at the Lamplighter 17:30-19:36, the well
  Mon/Wed/Fri 8:00-9:12, the pond after school Mon-Fri 15:00-16:30, the Saturday market 9:00-13:00, the four festivals.
- Places use the existing keys (`store`, `square`, `school`, `church`, `graves`, `garage`, `porch_agnes`, `farmgate`,
  `board`, `farmlane`, `route`, `dock`, `road_w`, `bake`, `orchard`, `orchard_gate`, `treetop`, `millroad`, `mill`,
  `mill_step`, `river`, `quarry`, `quarry_road`, `pump`, `lake_dock`, `forge`, `forge_yard`, `carp`, `lumber`, `feed`,
  `pen`, `bait`, `lane`, `well_court`, `market`, `pond`, `green_bench`, `trash`, `tavern`, `wk_*`). New keys are marked
  (new): `post`, `hall`, `booth`, `belltower`, `surgery`, `wk_chapel`, and the out-of-town spots `rg_birches`,
  `rg_greyfield`, `rg_resdock`, `rg_marrow`, `rg_ridge`, `rg_fen`, `rg_county`.
- "As it darkens" happens from the chapter named and stays. It is shown in the world (where they stand, what they hold,
  what they do), never explained. In chapter 12 nearly everyone is at the drawing's preparations as the story says.

#### Marrow Hollow

**Caitlyn Coyle** (`mae`), 25, runs the general store, raising Tobias

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-19:36 |
|---|---|---|---|---|---|
| Mon-Fri | home; walks Tobias to school 7:45; opens the store 8 | store | square: lunch with June (Mon, Wed) | store (Thu 14-15: parcels to the `post`) | store till 18:30; Fri the Lamplighter |
| Sat | home | the market stall | stall | store | home |
| Sun | church | store, half day | home, Sunday lunch | the pond with Tobias | home, the porch |

Habit: counts the till twice; turns the porch light on at dusk and comes back to check it. **As it darkens:** ch3 her
porch light stays on all day, like Agnes's · ch6 Wednesdays at 14:00 she stands at the store's back window looking at
the corn for ten minutes and doesn't answer · ch9 she restacks the same tin on the shelf again and again · ch12 shuts the
store at noon (her "Closing time" scene).

**Tobias Coyle** (`tobias`), 9, Caitlyn's brother

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-18 |
|---|---|---|---|---|---|
| Mon-Fri | home; school 8 | school | school (lunch in the yard) | school till 14:30; the pond 15-16:30 (Tue, Thu: plays at the edge of the corn, in plain daylight, until Caitlyn calls him) | the store, then home by 18 |
| Sat | home | the market with Caitlyn | the square | the pond with Everett and Bram | home |
| Sun | church | the square | home | the pond | home |

Habit: sings the tall-man rhyme and never gets to finish it. **As it darkens** (he is never in danger): ch6 sings the
rhyme at his window at dusk · ch9 draws a door on every slate at school · ch12 Caitlyn keeps him in; he waves at you
from the window.

**Everett Coyle** (`pip`), 12, Caitlyn's cousin, works her till

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-18:30 |
|---|---|---|---|---|---|
| Mon-Fri | home; school 8 | school | school | school till 14:30; the store 15-18 (Wed: the `pen`, he loves the calves) | home |
| Sat | the store 8 | store | the pond | the square | home |
| Sun | church | the square, with his notebook | home | the store's step, counting carts | home |

Habit: writes everything down in a notebook. **As it darkens** (never shown hurt): ch3 gone for three days, and everyone says he was there all along (today's MISSING; he comes back, quiet) · ch6 counts the cans aloud and loses count at 31 · ch9 his notebook
is full of the date, October 31, over and over · ch12 kept home.

**Pastor Hale** (`hale`), rings the bell at eight

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-20 |
|---|---|---|---|---|---|
| Mon | home | the graves | visits Agnes's porch | the church | the square; the bell at 20:00 |
| Tue | home | the church, writing the sermon | the graves | the church | the square; the bell |
| Wed | home | the church | the graves | chess with Silas at the Crane house | the square; the bell |
| Thu | `rg_marrow`, reading the Covenant, 7-10 | the church | the graves | the church | the square; the bell |
| Fri | home | the church accounts | the graves | the church | the Lamplighter for one drink at 17:30; the bell |
| Sat | home | weddings and funerals at the church | the square | the church | the bell |
| Sun | the service 7:30-9:36 | the church | lunch with Ida | the church | the bell |

Habit: plays chess against an empty chair when Silas is late. **As it darkens:** ch3 stands with his nose to the rock in
the hill copse at 17:00 Mondays, reading the bare stone (today's day-4 break) · ch9 sits in the front pew where nobody
sits, after his brother's letter · ch12 the drawing.

**Ida Hale** (`ida`), the pastor's younger sister, organist, bakes

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-19:36 |
|---|---|---|---|---|---|
| Mon, Wed, Fri | home; the well 8-9:12 | the `bake` table | bake | organ practice at the church | home |
| Tue, Thu | home | bake | bake | the church; Thu 15-16 the store | home |
| Sat | home | the market: the preserves stall | stall | home, the pantry | home |
| Sun | the organ at the service | home | lunch with Hale | home | home |

Habit: hums the Tithe hymn. **As it darkens:** ch6 stirs an empty pot on a cold stove when she thinks nobody is
looking · ch9 kneels at the walled-garden fountain with her hands in the water to the wrists, humming (today's day-11
break) · ch12 her pantry.

**Hollis Pruitt** (`hollis`), mechanic, Route 9 garage

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-19:36 |
|---|---|---|---|---|---|
| Mon-Fri | home; the garage 7 | garage | lunch at the garage door | garage | the store at 18; Fri the Lamplighter |
| Sat | the garage 7 | garage till noon | home | under his own truck in his yard | home |
| Sun | church, back pew | the garage door half open, the ball game on the radio | home | the radio | home |

Habit: wipes his hands on the same rag all day. **As it darkens:** ch6 works with the garage door shut; you hear him
hammering one panel for hours · ch9 stands at the pump at dusk holding the nozzle, looking west down Route 9 · ch12
fixes Walt's truck without being asked.

**June Pruitt** (`june`), mail carrier, Hollis's niece

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-19:36 |
|---|---|---|---|---|---|
| Mon-Fri | home; the `route` from 7:30 | route; the store at 11 | the square (lunch with Caitlyn Mon, Wed) | route (Wed: takes Room 6 its letter out on Route 9 West) | the `post` counter till 17, then the square |
| Sat | the post, half day | post | the Lantern Inn in Wickham (gossip with Tess) | the inn | home |
| Sun | church | the green bench, writing letters | home | the green bench | home |

Habit: reads every envelope, never opens one. **As it darkens:** ch6 climbs the first rungs of the water tower and stops
with her face to the ladder, her bag on the ground (today's day-9 break) · ch9 walks circles in her front room · ch12
every letter in her bag is addressed to you.

**Wes Dunn** (`wes`), 17, the sheriff's son, apprentice at the garage

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-19:36 |
|---|---|---|---|---|---|
| Mon-Fri | home; the garage 8 | garage | garage | garage | `road_w` 17-18:30, looking west; home |
| Sat | home | his motorbike in the Dunn yard | the square | the bike | home |
| Sun | church, sullen | the square | home | the bike | home |

Habit: packs a bag. **As it darkens** (never shown hurt): ch6 packs his bag every evening and
unpacks it at dawn, seen through his window · ch9 his bike lies by the county line sign with a wheel still turning and
Wes is walking back toward town, shaken but fine · ch12 stays at his father's side.

**Sheriff Dunn** (`dunn`)

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-19:36 |
|---|---|---|---|---|---|
| Mon | home; the square 7:30 | your `farmgate` | the garage | the notice board | your lane; the square |
| Tue | the laps of the green (as now) | laps | the garage | the board | the square |
| Wed | Route 9 West to the county line | comes back, quiet | the garage | the board | the square |
| Thu | the square | the office paperwork at home | the garage | the board | your lane |
| Fri | the square | your farmgate | the garage | the board | the Lamplighter |
| Sat | the pond with Otto, fishing | the pond | home | the square | home |
| Sun | church: carries the collection plate | the square | home | home | home |

Habit: touches the brim of his hat to everyone, including you, even after nobody says your name. **As it darkens:** ch6
listens at his floorboards (his heart event) · ch9 his patrol car is parked at the county line all afternoon, engine
running, nobody in it · ch12 burns paper in his yard.

**Agnes Abernathy** (`agnes`), widow, Ruth's mother

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-19:36 |
|---|---|---|---|---|---|
| Mon, Thu | home | the porch | the porch | the graves at 14 | the porch, home |
| Tue, Fri | home | the porch | the porch | the porch | home |
| Wed | `rg_birches`, straightening the dolls' dresses, 9-14 | | | the porch | home |
| Sat | home | the market | the porch | the porch | home |
| Sun | church, front left | the porch | the porch | the graves | home |

Habit: the porch light on day and night. **As it darkens:** ch6 talks to the empty chair beside her on the porch · ch9
sits on the porch at 14:00 in her good coat with a packed suitcase, waiting · ch12 her drain in the cellar (her heart
event) · after the good ending the porch light goes off for the first time in 25 years.

**Silas Crane** (`silas`), sexton and gravedigger

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-19:36 |
|---|---|---|---|---|---|
| Mon, Tue, Thu | the graves | graves | the church (checks the bell rope) | graves | home; the `trash` on Route 9 at dusk (as now) |
| Wed | graves | graves | the church | chess with Hale at home | the trash; home |
| Fri | `rg_greyfield`, weeding the county graves, 7-12 | | the church | graves | the Lamplighter |
| Sat | graves | graves | the church | graves | home |
| Sun | church | sits in the graveyard with a flask | | | home |

Habit: measures everyone he meets with his eyes. **As it darkens:** ch6 a pit your size is dug behind the church and
filled in again by morning · ch9 stands at your field fence at dawn with his tape measure · ch12 he digs (the beat).

**Otto Lindqvist** (`otto`), fisherman, bait shop

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-18 |
|---|---|---|---|---|---|
| Mon, Thu | `rg_resdock` for his brother Nils, 6-9 | the `bait` shop 10:30 | the `dock` | bait 15:30 | home |
| Tue, Wed, Fri | the dock from 5:30, taps the barometer at 6 | bait 10:30 | dock | bait 15:30 | home; Fri the Lamplighter |
| Sat | the pond with Dunn | the Black Lake | the Black Lake | the dock | home |
| Sun | church | the Lamplighter's porch | home | the dock | home |

Habit: says a weather rhyme to everyone each morning. **As it darkens:** ch6 stands in the town pond up to his knees
staring down ("Can you see the bottom?", today's day-8 break) · ch9 cuts every line on his rods · ch12 sits on the dock
with his barometer smashed.

**Cora Vance** (`cora`), schoolteacher

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-19:36 |
|---|---|---|---|---|---|
| Mon-Fri | home; the well (Mon, Wed, Fri); the school 7:45 | school | the notice board at noon | school till 14:30; Thu 15-17 `rg_greyfield` (the old Home's records); otherwise the church 16 | home |
| Sat | home | the market | the town `hall`, the library shelf | the green bench | home |
| Sun | church | home | home | the green bench | home |

Habit: counts things under her breath. **As it darkens:** ch3 a number chalked on her blackboard that isn't counting
yet · ch6 counts the trees in the copse, touching each one ("Don't interrupt. I'll lose my place.", today's day-6 break)
· ch9 the school's windows chalked full of numbers · ch12 the countdown on her board.

**Gideon Brannock** (`gideon`), blacksmith

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-19:36 |
|---|---|---|---|---|---|
| Mon, Tue, Thu | home; the `forge` 7 | forge; the yard 10:30-11:30 | the square 12:30 | forge | the store at 18; home |
| Wed | the forge yard all day (as now) | | | | the store; home |
| Fri | the forge | forge | the square | forge | the Lamplighter: cards with Hollis |
| Sat | the forge till noon | | the Lamplighter | home | home |
| Sun | church, back pew; the anvil is silent all day | home | home | home | home |

Habit: talks to the metal. **As it darkens:** ch6 hammering at the forge after the bell · ch9 every nail he makes comes
out bent · ch12 gives you a bent nail without a word.

**Nell Hartley** (`nell`), carpenter

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-19:36 |
|---|---|---|---|---|---|
| Mon-Fri | home; the `carp` shop 7:30 | the `lumber` yard 10-11 | the square 12:30 | carpentry | the notice board 17:30; home |
| Sat | carpentry, shutters closed (she builds "the box") | | | | home |
| Sun | church | home | home | the square | home |

Habit: sawdust in her hair, a pencil behind her ear. **As it darkens:** ch6 the saw going at night · ch9 gone for two days, and everyone says she was there all along (today's MISSING) · ch12 the box is finished, and
it is your size.

**Ezra Bell** (`ezra`), stockman, Bell's Feed & Stock

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-18:30 |
|---|---|---|---|---|---|
| Mon, Wed, Fri | the `pen` from 5:30 | the `feed` barn | the pen | the feed barn | the pen; home |
| Tue | walks cattle to Wickham, 6-12 | | the inn | the feed barn | home |
| Thu | the pen | feed | pen | feed | home |
| Sat | the market: eggs, milk | market | pen | feed | home |
| Sun | church | the pen, reading the animals | home | the pen | home |

Habit: talks to the animals in a low voice. **As it darkens:** ch6 at dusk every animal in his pens faces your farm ·
ch9 the cows won't let him near · ch12 his brass tag (his heart event).

#### Out past town

**Orla Quill** (`orla`), keeps Quill Orchard

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-19:36 |
|---|---|---|---|---|---|
| Mon-Fri | the `orchard` | orchard | the `orchard_gate`, selling apples 11-13 | orchard | home |
| Sat | home | the market | stall | the orchard | home |
| Sun | church | home | home | the orchard | home |

Habit: jokes about death. **As it darkens:** ch6 the bitten tree · ch9 picks apples after the bell by lantern light ·
ch12 she has counted every tree and the count is one short.

**Bram Quill** (`bram`), 12, Orla's son

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-18 |
|---|---|---|---|---|---|
| Mon-Fri | the `treetop` 7-7:40; school 8 | school | school | school till 14:30; the treetop 15-17 (Tue, Thu the pond) | home |
| Sat | the treetop | drawing in the orchard | home | the pond | home |
| Sun | church | the treetop | home | the treetop | home |

Habit: draws the valley from the top of the big tree. **As it darkens** (never shown hurt; his night line "It waved back with my hand" loses its last three words, 8.3): ch6 his drawings of the wheel pinned on the school wall · ch9 stays in the tree till Orla shouts
for him · ch12 kept home.

**Abel Fenn** (`abel`), miller

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-18 |
|---|---|---|---|---|---|
| Mon-Fri | the `mill` from 5:30 | mill | the `mill_step` at noon | mill | home |
| Sat | the mill: grinds the funeral bread | | | | home |
| Sun | church (doesn't eat the bread) | home | home | the mill step | home |

Habit: weighs things in his hand before the scale. **As it darkens:** ch6 the wheel turns at night with the race dry ·
ch9 weighs himself on the sack scale every hour · ch12 this year's line in the ledger is still blank.

**Della Fenn** (`della`), midwife, Abel's sister

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-19:36 |
|---|---|---|---|---|---|
| Mon-Fri | home; the well (Mon, Wed, Fri) | house calls along the `millroad` and in town | the `river` | home | home |
| Sat | `rg_fen`, gathering moss, 8-12 | | the market | home | home |
| Sun | church | home | home | the river | home |

Habit: remembers everyone's birthday. **As it darkens:** ch6 knocks to ask the hour you were born · ch9 stands at the
edge of the fen at dusk · ch12 lays out good clothes on your bed while you are out.

**Maud Thorne** (`maud`), quarry foreman

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-19:36 |
|---|---|---|---|---|---|
| Mon-Wed | the `quarry` | quarry | the `quarry_road` | quarry | home |
| Thu | `rg_marrow`: scrubs the soot off the Covenant 7-9 | the quarry | quarry road | quarry | home |
| Fri | quarry | quarry | quarry road | quarry | the Lamplighter |
| Sat | quarry, half day | | home | | home |
| Sun | never at church: sits on the quarry rim | | | | home |

Habit: knocks on stone before she cuts it. **As it darkens:** ch6 her men walk off · ch9 she is cutting a person-shaped
hollow in the face herself · ch12 the fourth shard (her heart event).

**Corwin Lusk** (`corwin`), the gas station by the Black Lake

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-20 and on |
|---|---|---|---|---|---|
| Every day | the `pump` | the `lake_dock` 9-11 (Tue till 13) | the pump | the pump | the pump, all night |

Habit: never sleeps; the radio plays 1979. **As it darkens:** ch6 his radio plays your voice · ch9 the price sign's
date flips from 1979 to this year · ch12 his gas can (his heart event).

#### Wickham Crossing

**Tess Harlow** (`tess`), keeps the Lantern Inn

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-21 |
|---|---|---|---|---|---|
| Mon-Fri | the inn from 7 (`wk_innwork`) | inn (Wed: laundry at the `wk_river`) | inn | inn | inn |
| Sat | inn | inn | inn (June's visit) | inn | inn |
| Sun | `wk_chapel` (new) | inn | inn | inn | inn |

Habit: talks to the guest book. **As it darkens:** ch6 lays a table for a guest nobody sees · ch9 reads the guest book
aloud, every name · ch12 every room in the inn is made up and turned down.

**Hob Harlow** (`hob`), cook at the inn, trapper

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-19:36 |
|---|---|---|---|---|---|
| Mon-Fri | `wk_woods`, the traps | the inn kitchen 10 | kitchen | the woods | home |
| Sat | the woods | the market in Marrow Hollow (a game stall) | | the woods | home |
| Sun | the chapel | the kitchen | kitchen | home | home |

Habit: feeds a guest nobody sees. **As it darkens:** ch6 the cold house's lamp at night is his · ch9 brings back
something in a sack and won't show anyone · ch12 checks the hooks every night.

**Dr Lyle Ashby** (`lyle`), doctor for both villages

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-19:36 |
|---|---|---|---|---|---|
| Mon, Wed, Fri | the `surgery` (new) 7-10 | `wk_square` | lunch at the inn | house calls in Wickham | home |
| Tue, Thu | surgery | house calls in Marrow Hollow (the store, the Abernathy porch) | the store | house calls (Thu: `rg_greyfield`, his grandfather's certificates) | home |
| Sat | surgery, half day | | the inn | home | home |
| Sun | the chapel | home | home | home | home |

Habit: listens before he speaks. **As it darkens:** ch6 listens to people's chests and goes pale · ch9 turns the photos
in his waiting room face down · ch12 brings you a tonic every morning without being asked.

**Vera Ashby** (`vera`), 16, the doctor's daughter

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-18 |
|---|---|---|---|---|---|
| Mon-Fri | the `wk_board` 8 | `wk_lane` 10 | the `wk_ferry` 13 | `wk_square` 16 | home |
| Sat | packs her suitcase | sits at the ferry with it | | the square | home |
| Sun | the chapel | the ferry | home | the square | home |

Habit: always has a suitcase. **As it darkens:** ch6 the suitcase at the ferry every day · ch9 begs to come on the train; Rook refuses her ("Not on the Nine") · ch12 the boat (only in the Far Shore ending).

**Brother Quinn** (`quinn`), lay preacher at Wickham Chapel

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-19:36 |
|---|---|---|---|---|---|
| Mon, Wed, Fri | home | the `wk_river`, praying 9-12 | home | the square 15 | home |
| Tue | `rg_resdock`, praying at the shore | | home | the square | home |
| Thu | home | lessons for Finn at the chapel 8-12 (also Mon, Wed, Fri) | home | the square | home |
| Sat | the chapel | the river | home | the square | home |
| Sun | leads the chapel service 10-11:30 | | home | the river | home |

Habit: blesses the river every morning. **As it darkens:** ch6 preaches to the river · ch9 stands in it up to his waist
· ch12 the chapel bell rings with nobody pulling it.

**Nan Pike** (`nan`), runs the ferry

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-18 |
|---|---|---|---|---|---|
| Mon-Sat | the `wk_ferry` 6 | ferry | the inn 12-13 | ferry | home |
| Sun | the ferry is shut; she sits on the landing all day | | | | home |

Habit: never poles anyone back. **As it darkens:** ch6 poles the ferry out empty at dusk · ch9 her jar of names is full
to the lid · ch12 waits at the landing all night.

**Finn Pike** (`finn`), 9, Nan's boy

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-18 |
|---|---|---|---|---|---|
| Mon, Wed, Thu, Fri | the river 7; lessons at the chapel 8 | lessons | the `wk_gardens` | the river 14 | home |
| Tue | the river | the gardens | home | the river | home |
| Sat | skims stones at the river | | home | the gardens | home |
| Sun | the chapel | the river | home | the gardens | home |

Habit: skims stones and counts the bounces. **As it darkens** (never harmed): ch6 a stone comes back out of the fog (his
heart event) · ch9 he stops skimming · ch12 kept home.

**Iris Vale** (`iris`), seamstress

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-18 |
|---|---|---|---|---|---|
| Mon-Fri | the sewing room | the square 11 | home | the notice board 16 | home |
| Sat | fittings at the inn | | | home | home |
| Sun | the chapel | home | home | home | home |

Habit: sews with her eyes half closed. **As it darkens:** ch6 a dress your size on her dummy · ch9 her needle in the
newest doll at the birches · ch12 the Tithe's clothes are delivered to your door, folded.

**Moss Kerrigan** (`moss`), trapper

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-18 |
|---|---|---|---|---|---|
| Mon, Fri | `rg_ridge`, the traps on Pine Ridge | | the inn | the ridge | home |
| Tue-Thu | the `wk_woods` from 5:30 | woods | the inn | woods | home |
| Sat | the woods | the market (pelts) | | woods | home |
| Sun | home with Ada | | | | home |

Habit: reads tracks aloud as if they were writing. **As it darkens:** ch6 tracks that shouldn't be there · ch9 follows
something's tracks all the way to your field · ch12 sits on Agnes's step all night, keeping her company.

**Ada Kerrigan** (`ada`), Moss's mother, blind

| | 6-9 | 9-12 | 12-14 | 14-17 | 17-18 |
|---|---|---|---|---|---|
| Mon-Sat | home | the square 10-13 | home | home | home |
| Sun | the chapel | the square | home | home | home |

Habit: tells you who is standing behind you. **As it darkens:** ch6 names someone behind you that you can't see · ch9
sits in the square all day facing your farm · ch12 stays awake every night.

**Who meets whom** (small scenes in passing, so the town feels lived in): Caitlyn and June have lunch Mon/Wed; Hale and
Silas play chess Wednesday; Dunn and Otto fish Saturday; Gideon and Hollis play cards Friday; the well women (Ida, June,
Cora, Della) Mon/Wed/Fri; the children at the pond after school; June visits Tess on Saturday; Lyle calls on Agnes
Tuesday and Thursday; Moss leaves rabbits on Agnes's step on Saturday.

---

## 7. Versus mode: one player is the Hollow

A separate way to play, from the title screen's Together menu: **The Hollow Walks**. 2 to 5 players: one plays the
Hollow, the rest are farmers. It is the one mode where you can really lose.

### 7.1 Two lengths

| | One October | The Long Year |
|---|---|---|
| What it is | A 7-day match on a fresh farm: the opening of chapters 1-2 squeezed down | The whole story, chapters 1-12, with a friend as the Hollow |
| Farmers win | Bind it: light all three stones on night 7 and keep them lit until the bell | Open the door on Tithe night (the good ending) |
| The Hollow wins | Every farmer is taken, or all three flames are out before the bell on night 7 | Every farmer is taken, or Tithe night ends with the door shut |
| Save | its own slot | its own slot (a story save that can end in defeat) |

### 7.2 What the Hollow can do, by time of day

| Time | Its form | It can | It can't |
|---|---|---|---|
| **6:00-12:00 morning** | a crow it flies anywhere | **Omens only**: move the scarecrow one step; turn a signpost; tint one bucket of well water; ring one note on the church bell; leave a ring of prints; put one false line in a farmer's next talk ("Caitlyn: meet me by the corn") | hurt, block, take, enter a house, touch a crop, touch an animal |
| **12:00-18:00 afternoon** | the crow, or the field's scarecrow (it can't walk) | **Mischief**: wilt one row (two waterings bring it back); spook a coop (no eggs today); shut one shop for an hour; plant a false lead in the journal (a slightly different ink, so a careful player can spot it); mimic a voice from the corn | hurt, destroy, kill animals, block a road |
| **18:00-20:15 dusk** | the scarecrow walks, only while nobody is looking at it | **Traps for the night**: a snare in the corn (slows whoever steps in it); put out one street lamp; unlatch one door; mark a farmer (their prints glow for the Hollow tonight) | hurt anyone |
| **20:15-2:00 night** | the Tall Man | **The hunt**: stalk, chase, put out lights (costs Dread), knock (fake or real), catch, jump between scarecrows (on a cooldown) | move while a farmer looks at it in light; enter a room with an iron-nailed door; cross a salt line; come within 6 tiles of the church in the minute after the bell |
| **On the train** (Long Year) | the Hands' master | Order the Hands: which car, which door, which lamp | the cab while the firebox burns |

### 7.3 Dread, the Hollow's currency
- Dread comes from the farmers' **Fear bars** (section 6.1): every point of Fear a farmer gains gives the Hollow a
  share. Scaring people pays for hunting them.
- Every power costs Dread, from 2 (an omen) to 30 (a real knock), and has its own cooldown. Dread caps at 100.
- The Hollow sees farmers as glows sized by their Fear (scared people are easier to find). It sees exact positions only
  for farmers in the open at night with Fear over 60, or marked at dusk.

### 7.4 Caught, taken, and the end
- **First catch:** wounded (health to 1, bleeding, slower); the farmer runs home (as `death.js` does now).
- **Second catch before healed:** taken. The farmer joins the Hollow's side as a **Hand**: weak, can't catch, can knock,
  blow out candles and stand in doorways. So nobody sits out, and the last farmers feel the walls close in.
- If every farmer is taken, the Hollow wins. The end card is the **Taken** ending, for everyone.
- Win screens for both sides show **the night in pictures**: each catch, each fake knock that worked, a heat map of where
  people ran.

### 7.5 Balance and counterplay
- **Days are safe** for farming. The farmers must farm to afford oil, candles, nails and salt.
- **Looking freezes it** (the existing rule: "It cannot move while I look at it"). Farmers who stay together and keep
  lights pointed outward can hold a house.
- **Iron nails** across a door, **salt** across a threshold, **the church bell** (any farmer can ring it once a night: the
  Hollow is stunned for 20 seconds), **Ward bundles** (each one makes one of the Hollow's powers cost more).
- **A safe hearth:** a lit stove within 3 tiles of a bed makes that spot uncatchable. The Hollow can only wait outside.
- **No camping:** the Hollow gains no Dread while it stays within 10 tiles of the same farmer for more than a game hour.
- **Catch-up:** whoever is behind gets a little help. A Hollow with no catches by night 3 gains Dread faster; farmers who
  have lost one of their number get one free iron nail each at dawn.
- **The first night is short and the Hollow weak,** so new players learn the rules.

### 7.6 How it fits the lore
The Covenant lets the Hollow walk freely one night a year: Tithe night. This mode imagines the year it walks every night.
It wears whatever keeps it, the scarecrow, Grandpa, the Hands; here it wears a player. In the story mode the Hollow can
wound you but never truly end you; here it can.

### 7.7 Polish
- The Hollow player's view: the world in a cold "scarecrow sight" (the night palette of `night362.js`, with the farmers'
  fear glowing warm through walls).
- Every power has its own sound, made by our own synth as everything else is.
- A short rules card for the Hollow player before the first night, and a one-line reminder of what the current hour
  allows on its power wheel.
- Phones and pads: the power wheel opens on a long press; the crow flies with the same drag as walking.

---

## 8. Migration: from three chapters to twelve

### 8.1 Where existing content goes

| Now | Id / file | Goes to | Change |
|---|---|---|---|
| The intro drive and crash | `introCine` | Ch 1 | Add the Pine Rest's VACANCY sign and the three-frame shape behind the deer |
| Grandpa's note | `LETTER` | Ch 1 | Rewritten short (8.3) |
| Caitlyn's lessons | `tutorial.js`, `guides314.js` | Ch 1 on | Unchanged (BUGS owns the stock/hire-staff step) |
| The car in seven stages | `carrepair.js` | Ch 1 | Parts become Hollis's leads |
| The deer | saga `deer` | Ch 1 | Found on the way to the barn for the jack, flies heard first |
| Grandpa's calendar | saga `barn` | Ch 1 | Found fetching the jack and winch |
| The county line | region `county` | Ch 1's end | The loop is the act break |
| The Pine Rest register | region `motel` | Ch 2 | Reached to use the phone; Room 6 added |
| Grandpa's diary | `PAGES` | Ch 2 | Found through the album's photos; texts rewritten |
| The well | saga `well` | Ch 2 | Found by tasting the water |
| Ruth's ribbon | saga `agnes` | Ch 2 | After diary page four |
| The small graves | saga `graves` | Ch 2 | A folded sheet, no body (8.3) |
| Candles, peddler, the rite | `game.js`, `story337_x1.js` | Ch 2 | Goal text becomes leads |
| Chapter Two's opening note | `stStart` | cut | The chapter card and the world do it |
| The drawing notice in Wickham | place `wick` | Ch 3 | Reached via Dr Ashby |
| The miller's ledger | saga `mill` | Ch 3 | Reached by selling grain |
| Nan's price | saga `ferry` | Ch 3 | Reached via Tess |
| The intake book | region `greyfield` | Ch 3 | As now; a no-gore boiler-cellar escape added |
| The Covenant | region `oldmarrow` | Ch 3 | Reached by following Maud |
| The Tithe House outside | place `tithe` | Ch 3 | CHARROW IRONWORKS nail heads added |
| Two Ward bundles | `wardDone()` | Ch 3 | Hale's price for the church book |
| The first letter from you | `ST_LETTERS.first` | Ch 3 | No hiding places (8.3) |
| The cold house, it turned its head | saga `cold`, `scare` | Ch 6 | Cold house becomes a hiding scene; its third hook fixed (8.3) |
| The quarry, the bitten orchard | saga `quarry`, `orchard` | Ch 6 | Reached via Maud at the Lamplighter and Orla's picking job |
| The wheel | region `lookout` | Ch 6 | Reached via Bram's drawings |
| The hollow tree stone | `S.st.got.tree` | Ch 6 | Reached via Clementine's diary |
| The letters "6" and "5" | `ST_LETTERS[6]`, `[5]` | Ch 6, Ch 9 | Unchanged text |
| The Weeping Birches | region `birches` | Ch 9 | The dolls, named from the ledger |
| What the peat keeps | region `fen` | Ch 9 | Tokens and a cap, no body (8.3) |
| The bell under the water | region `drowned` | Ch 9 | Unchanged but for the girl in green (8.3) |
| The Black Lake stone | `S.st.got.dock` | Ch 9 | Reached via the ledger's margin |
| The Marsh place | place `marsh` | Ch 9 | Opens; the jar cellar added |
| Danny's letter | Caitlyn's 10-heart scene | Ch 9 | A main beat; the heart scene stays, the gate goes |
| The stone under your bed | `S.st.got.bed` | Ch 11 | Found by the eye's glow |
| A new last letter | `ST_LETTERS.last` (new) | Ch 11 | Compartment 6 |
| Under the church (the coffins) | saga `crypt` | Ch 12 | Merged into the undercroft scene (`darkpath.js`): its first view |
| The last week | saga `list`, `yourgrave`, `jars`, `rehearsal`, `stay`; region `corn`; `darkpath.js` | Ch 12 | One a day as now, with the audit's fixes |
| The letters "4" to "1" | `ST_LETTERS[4..1]` | Ch 12 | Unchanged text |
| The drawing | `stDrawing` | Ch 12 | A staged scene, not a text card |
| The choice and the endings | `stChoice`, `ST_END` | Ch 12 | New conditions (section 4); no locked rows |
| The Count | `rgcount.js`, `countsight.js` | all chapters, optional | As now; Eleanor Marsh renamed Edith (8.3) |
| Night events in the new land | `rgnight.js` | from the chapter its place opens | Shown and heard, not toasted |
| The routines' breaks and the missing | `routines.js` BREAKS, MISSING | section 6.5 | By chapter instead of by day |

### 8.2 What is cut
- Goal-bar counters ("Places 2/5", "Things known 3/8", "Next: ...") and every goal text that names a place the character
  hasn't heard of.
- The chapter opening note's instructions.
- The mind's tier messages (`TIER_MSG`): the face does it now.
- The locked rows in the ending choice.
- The toasts that explain a scare after it has happened (the knock's footprints, the mirror, the night events): the
  thing is drawn and heard instead.
- Lines and pictures that show a child hurt (the audit, 8.3).

### 8.3 Lines and pictures to rewrite

**The depiction audit.** The owner's lore stays as it is: the Tithe takes children, offscreen. The rule is about what
is shown: no gore on or near anything tied to children, nothing tied to children ever shown hurt, and every taking
offscreen and implied. `gorex374.js` (GORE_CHILD) already keeps gore off these things at every level; this audit finds
the places where the **words or the base picture** still show harm, and gives each a non-graphic version that keeps the
same plot beat.

| # | Where | What it shows now | Non-graphic replacement (same plot) |
|---|---|---|---|
| 1 | The small graves (`saga.js` graves text; `sights.js` sgtWrapped; `sights298.js` grave sprite) | a child-sized shape in a bedsheet "soaked through, dark, from the inside", fat flies | The last small grave is open and empty. At the bottom, a bedsheet folded square, clean and pressed, a jar label pinned to it in Grandpa's hand: *for later.* No flies, no stain. Redraw the close-up and the world sprite |
| 2 | The quarry (`saga.js` quarry text; `story337_x1.js` st37Quarry5) | "Three fingernails are still stuck in the rock, torn out at the root", painted pink | Keep the person-shaped hollow and the scratches going outward. Remove the nails; low in the hollow a small silver birthday star is pressed into the stone. Redraw the close-up |
| 3 | The fen (`regionstory.js` fen text; `sights.js` fen art; `sights298b.js` S98_FEN body and world sprite) | a child's body curled in the peat, a rope round its neck; dozens more under the water; the newest in your coat | At the pool's edge a plaited grass rope with a wooden token burnt 1872 and a rag cap snagged on it. Under the black water, dozens more tokens on their ropes, turning slowly. The newest, by the hut, is tied to a sleeve of your coat laid out on the peat. Redraw the close-up and the world sprite; no body |
| 4 | The cold house (`saga.js` cold text; `story337_x1.js` st37Cold bundle) | "the size of a nine-year-old... feet stick out... toenails painted pink, and they are not rotten"; a wrapped bundle on a hook between carcasses | The two animal carcasses stay (gore allowed on them). On the third hook, a child's coat on a hanger, Agnes's blue ribbon tied round the hook, *RUTH — KEEP COLD* chalked on the beam above. Redraw the bundle as the coat; nothing drips near it |
| 5 | The drowned (`drowned302.js`) | a small girl in green standing among the drowned dead | Take her figure out of the street. Her green hair ribbon is caught on the lamp post, drifting the same way the others face. (`gorex375.js` already keeps the others' gore off her.) |
| 6 | Dunn's list (`saga.js` list text) | children's photographs with "the eyes scratched out with a pin" | Each child's face covered by a small square of brown paper, the year inked on it. The newest photo, of you asleep, stays as it is |
| 7 | The mill (`saga.js` mill text) | "hair caught in the millstone, long and fine, wound round and round the spindle" | A child's hair ribbon tied round the spindle, neatly, like a bow. The weights in the ledger stay |
| 8 | The orchard (`saga.js` orchard text) | the milk tooth: "When you pull it out the root is wet" | Cut "the root is wet". The tooth in the bite stays |
| 9 | The crypt (`saga.js` crypt text) | the names "scratched with fingernails" inside the small coffins' lids | "Scratched inside the lids, over and over." The empty coffins and the names stay |
| 10 | Walt's Truck (`story.js` ST_END truck) | Tobias's "little torch... and go out" | "...and keeps going, small and steady, until the trees hide it." |
| 11 | Bram's night line (`folk2.js`) | "It waved back with my hand." | "It waved back." |
| 12 | The fen at night (`rgnight.js`) | a hand comes up out of the black water | Keep, drawn as a grown man's hand |

**Kept as they are** (nothing hurt is shown; the harm is offscreen and implied): the Covenant; Ruth (nine) and her
ribbon; Danny's letter; the Tithe House shoes; the milk tooth in the well's braid and in the hollow tree; the dolls in
the birches; the children's clothes on the Deep Corn scarecrows; Greyfield's intake book and the footsteps upstairs;
the child at Greyfield's crosses at night; the child at the well in Agnes's heart scene; the child's wet footprints;
Ida's jars as `gorex375.js` has them (milk teeth and locks of hair, never eyes); the mill's weights; the Count's 34
texts; Everett's three missing days; the Hollow mimicking Tobias's voice; Vera and the Far Shore; the drawing.

**New content in this plan follows the same rule.** Charrow's taken were grown mill hands, Gloamwater's Kept are grown
guests, Ninefathom's Salt are the grown quarantine dead, the Rinds are never gored at Greyfield or near the coffins,
the Hands never target the children in town, and no child travels on the No. 9.

**One rename for Part 2:** the Count's "Eleanor Marsh, 1952" becomes **Edith Marsh**, because Eleanor is Part 2's
grandmother (`rgcount.js`, the saved lore line, and any close-up text that names her).

**For show, don't tell:**

| Where | Becomes |
|---|---|
| Grandpa's note (`LETTER`) | *Kid. Key's under the pot. Kick the stove, it sulks. Seed's in the tin. Caitlyn at the store buys what you grow; Hollis can fix anything. Be in by the bell. Grandpa. P.S. Leave the scarecrow be.* |
| The diary pages (`PAGES`) | Kept, with Ruth (1987) rewritten as above. Page one (new) is the Room 6 page, so the HUD and journal count to 7 (`ui.pages`, `jrPage`'s "Page n of 6") |
| The first letter (`ST_LETTERS.first`) | Section 2, chapter 3, beat 9 |
| Mirror, knock, night events | Drawn and heard (sections 6.3 and 6.4); no explaining toast |
| Saga captions | At most one short line in the character's voice; feelings cut |
| The drawing | Staged with `stage.js`, the church full, as chapter 12 says |

### 8.4 Saves in the middle of the story

On load, `storyMigrate()` runs once (marked `S.mig12 = 1`) and sets the new chapter `S.ch`. It never takes anything away:
every done beat stays done (`S.saga.done`, `S.rg.seen`, `S.st.seen`), every item stays, and a beat that moved to a later
chapter counts as done when that chapter reaches it (no replay; its lore and props stay).

| The save shows | It lands in | Also |
|---|---|---|
| `!S.carFixed` or `!S.looped` | Ch 1 | car stage kept |
| `S.looped && !S.bound` | Ch 2 | candles, pages and lit altars kept; the album leads made from the pages already found |
| `S.bound && !S.st.started` | Ch 3, at its start | |
| `S.st.started && S.st.act === 2` | Ch 3 | places seen count as Ch 3's beats done |
| `S.st.act === 3`, no countdown | Ch 4 is next: Ch 3 ends at Marrow Halt | stones already in hand are kept; their beats (Ch 6, 9, 11) are skipped |
| countdown running (`S.st.tithe`), more than 3 days left, not drawn | Ch 4 is next | a one-time scene: *the knocking stopped*; Cora's board is wiped and someone has chalked a train on it. `S.st.tithe = 0`; the stones stay on the step; the countdown restarts at 7 when Ch 11 ends |
| countdown with 3 days or fewer, or `S.st.drawn` | Ch 12, finishing as it is | the new easy good-ending rule applies; the trips open after the ending |
| `S.st.done` (finished) | the ending stands | the title screen offers *The story has grown: play the new chapters with this farm* (sets `S.ch = 4`, clears `done`, `ending`, `tithe`, `drawn`, `set`; keeps the farm, friends, items and stones in hand) |

Also on migration:
- Leads are made from what the save has seen (each seen place becomes a followed lead; each open beat an open lead).
- Key items are granted for beats already past (a save past Ch 5 gets `coldnail`, and so on).
- Saved journal lines from the audited beats (the graves, the fen, the cold house, the quarry, the mill, the list) and
  Edith Marsh's line are swapped for their new versions with a lookup table, the way `gorex375.js` already swaps Ida's
  jar line.

- Count finds keep their ids and texts; only Eleanor Marsh's becomes Edith Marsh's.
- The old chapter cards (`S.saga.cards`) map to the new numbers so none replays.
- Versus saves are a separate slot and never migrate.

---

## 9. Build order

### 9.1 Waves

Each wave can be built, tested and released on its own, following `WORKER_RULES.md` (a `_wip` module, a late module in
`build_live.py`, the release lock, smoke). Sizes: **S** = one late module under about 600 lines; **M** = two or three
modules, little new art; **L** = four to eight modules plus art; **XL** = a new world: a map, ten or more interiors,
eight or more people with portraits, sprites and routines, and its chapters.

| Wave | What | Size | Needs first | Ships on its own because |
|---|---|---|---|---|
| **W1** | **The depiction audit's fixes** (8.3) and the **easy good ending** for today's story (`S.st.set >= 3` only, no locked rows) | M (text, and redraws of the small grave, the quarry, the fen, the cold house's third hook and the drowned street) | nothing | It fixes the rule and the owner's ending wish in the game as it is |
| **W2** | **Leads**: anchors, `S.leads`, the journal's Leads tab, the arrow rules, the world's own hints, today's goal texts rewritten as leads | M | W1 | Works on today's three chapters |
| **W3** | **The Fear bar**: the face portrait with five expressions, effects on work, comforts, the setting | M (portrait art) | nothing | `mind.js` is already there |
| **W4** | **Chapters 1-3 rebuilt**: the ordinary start, the album, Room 6, the new note, the doctor, Greyfield's escape, Marrow Halt. Behind a flag `STORY_LONG = false`: after chapter 3 the story goes straight on to today's stones and last week (the short path, below), so nobody is left at a dead end | L | W2, W3 | The short path is a complete game |
| **W5** | **Weekly routines** for all 32 people (6.5) | M | W2's anchors | Makes the world alive now |
| **W6** | **The door scare stages A-C, the valley's abandoned interiors and cellars, the Rinds**, the scare pacing | L | W3 | Each place and stage can go in on its own |
| **W7** | **The No. 9**: worlds that load one at a time (the engine change), the ten cars, the crew, day activities, night survival, solo and co-op, Marrow Halt. First release: a "test run" journey that turns back at the viaduct | XL | W3, W6's hiding and breath-hold | It is playable as a round trip |
| **W8** | **Charrow and chapters 4-6** (journeys 1 and 2, stone one) | XL | W7 | Flag on for chapters 4-6; after chapter 6 the story goes to the short path's last week |
| **W9** | **Gloamwater and chapters 7-9** (journeys 3 and 4, stone two, Danny's letter) | XL | W8 | as W8 |
| **W10** | **Ninefathom and chapters 10-11** (journeys 5 and 6, stone three) | XL | W9 | `STORY_LONG = true`: the full twelve chapters |
| **W11** | **Chapter 12 reworked**: the staged drawing, the six-plus-one endings with the new rules, Charrow's Way, the optional epilogue extras, the Part 2 hook calling `endingStory` | M-L | W10 (the hook alone can ship with W1) | |
| **W12** | **Versus mode**, One October first, then the Long Year | L | W3, W6; the Long Year's train nights need W7 | One October needs only the valley |
| **W13** | **The map redesign** (last) | XL | see 9.2 | |

W1 and W3 depend on nothing and can go first; W5 needs only W2's anchors. W8-W10 are in story order; their art
(people, buildings, interiors) can be drawn in parallel once W7 has fixed how a world is built.

**The short path** (W4 to W9, while `STORY_LONG` is false). Chapter 3 ends at Marrow Halt with the lamp lit, but the
train goes by without stopping. The three stones are then found through people instead of the trips: the hollow tree
from Bram ("the sun goes right down inside it at noon"), the Black Lake dock from Otto ("that cord's been pulled tight
since Ruth"), and the bed from the warm floor you feel when you hide under it during a knock. Setting them starts
today's last week, and the good ending needs only `S.st.set >= 3` (W1). Each trip wave (W8, W9, W10) replaces one of
those people-leads with its chapter's real one.

### 9.2 What must come before the map redesign
1. **Anchors everywhere** (W2): every lead, beat, routine spot, hiding place and trap uses a named anchor, never a raw
   coordinate, so moving a building means moving its anchor.
2. **The valley's story content is final** (W4, W6, W11): every place the twelve chapters need in the valley exists and
   is anchored, including Marrow Halt and the rim line.
3. **Routines use place keys** (W5), so people walk to wherever their places end up.
4. **The farm's own ground is fixed:** what players have tilled, built, fenced and placed keeps its coordinates. The
   redesign works around the farm zone, or carries a relocation table for anything it must move (the same promise
   `regions.js` makes now: nothing you have cut, cleared or planted moves).
5. **Versus spots are anchored** (W12): traps, scarecrows and safe hearths.
6. **The other workers' map fixes have landed** (WORLD's roads, fences, gates and barns; DEVICE-UI's map fog).
7. **The three new places are their own worlds** (W7-W10) and are not part of the redesign, but they set the bar: the
   valley should not look plainer than them.

### 9.3 What the redesign should aim for (owner: "more sense, more alive, more unique; not over cluttered but not empty")
- **Sense:** roads go where people need to go; every building has a reason to be where it is (`DESIGN_GUIDE.md` 3 and 4).
- **Alive:** the routines of 6.5 drawn on the ground: worn paths where people walk every day, washing on lines on
  Monday, a cart outside the store at market time, smoke from the chimneys of the people at home.
- **Unique:** each part of the valley its own ground, trees and buildings (`regions.js` already does this for the new
  land; the old land deserves the same).
- **Nature that feels like nature:** woods that thicken toward the rim, clearings with a reason (a burn, a fallen tree, a
  spring), streams that cut real banks, birds and animals that belong to each kind of ground.
- **Neither cluttered nor empty:** props in clusters with breathing room between them (`DESIGN_GUIDE.md` 5), and a
  landmark in sight from every crossing (6).
