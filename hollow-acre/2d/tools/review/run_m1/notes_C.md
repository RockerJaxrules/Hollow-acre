# Notes C: World (63 stops) and Interiors (72 stops), run_m1

I looked at all 11 world sheets and all 12 interiors sheets, and opened about 60 single shots and crops. World stops are day 3, 11:00-12:00, in rain. Interior stops are day 6, 12:00, with the tour player in chapter 1. In report.json, none of these stops has page errors, overflow, NaN, broken images or placeholder text. Every stop played a sound (door thud plus room tone). fps was 58-64 everywhere except #158.

Tour caveat, not a game bug: the "place"/"building" stops drop the player on the building footprint (0042, 0053, 0062, 0065, 0066, 0072, 0038) or in water (0045 pond, 0052 Black Lake, 0073 footbridge). Those shots show roofs and water instead of fronts. The bot should stand at the door, or 2 tiles south of it.

The farm's position and the field fences are left out (being reorganised).

## Broken first

- **Big rooms open with the player hidden under the toolbar, and the back wall under the goal bar.** [ui] **high**
  - Where:
    - Player hidden: in 0161 Coyle's store the player is not visible at all. In 0168 garage, 0197 Hartley Carpentry, 0221 Lantern Inn, 0304 Lamplighter and 0324 Town Hall, only a tuft of hair and a red sliver show between hotbar slots 6 and 7 (x≈640, y≈650-700).
    - Back wall covered: in the same rooms the top of the back wall is under the goal bar and the "0/7" chip. 0161: windows and the "SEED CO." poster. 0165 church: the stained glass and the "18 71" hymn board are cut. 0197: windows.
  - Why: the first thing a player does in a room is find themselves. The camera clamps to the room edges and ignores the HUD (about 70 px top, 70 px bottom). LESSONS (interiors baseline) says to "open on the back wall and pan down". The Inspector checklist asks whether UI covers the action.
  - Fix: pad the interior camera clamp by the HUD height at both ends, so the door mat sits above the toolbar and the wall top below the goal bar. Or spawn the player 1.5 tiles inside the door and let the camera follow from there.

- **At the ferry landing the player disappears behind a tree, with no fade or silhouette.** [bug] **medium**
  - Where: 0067 Ferry (x128, z74). The player is fully covered by the big oak left of the dock (≈420-670, 280-560). Only one red pixel shows at the canopy edge.
  - Compare: the willow at 0060 (river) and the orchard tree at 0055 both fade correctly, and 0033 draws a silhouette through a house.
  - Why: inconsistent occlusion reads as a bug, and the player loses themselves at a story location (Nan's ferry).
  - Fix: give this tree type the same canopy fade, or always draw the player silhouette when they are covered.

- **Grandpa's cabin runs at 47 fps.** [bug] **medium**
  - Where: #158, 0158. Every other one of the 50 interiors ran at 60-62.
  - Why: it is the smallest room, and the one the player sees most (sleep, save, decorate). A finished game doesn't stutter at home (REVIEW A: under 50).
  - Fix: profile it. Candidates: the first-entry cost (it was the first room the tour entered), the thunder/rain effect (this stop played `thunder`), hidden upgrade furniture still being drawn, or the Decorate layer. Re-measure 5 s after entering to tell first-load from steady state.

- **When the player stands behind a building, the whole building goes about 50% see-through, and everything behind it shows through the walls.** [art] **medium**
  - Where:
    - 0065 Wickham Crossing: tree trunks, wheat and grass show through the chapel's tower and roof.
    - 0066 Lantern Inn, 0062 Tithe House and 0053 gas station: the whole building is ghosted.
    - 0038: a grass clump shows through the faded roof of the house by the graveyard.
    - 0046 covered bridge: a ghost of the front wall and its "MARROW … 1871" sign is smeared across the deck.
    - 0072 Coyle's store: the fade leaves a hard-edged dark translucent rectangle on the cobbles (≈x965-1080, y270-330), next to a faded bush and a faded dirt patch.
  - Why: part of this comes from the bot's placement, but a walking player meets the same thing every time they pass behind a building. Half-transparent walls and a stray rectangle read as unfinished rendering. Stardew keeps buildings solid (Inspector checklist: overlap and z-order).
  - Fix: keep the walls solid. Fade only the roof rows within about 2 tiles of the player, behind a hard dithered edge, or rely on the player silhouette that already works (0033). Find and remove the rectangle at 0072.

## Seen on every screen, or across a whole section

- **Arriving by milestone, the screen doesn't show what the region card promises.** [story] [clarity] **high**
  - The region stops are the fast-travel milestones (`RG_MILES`, src/regions.js:238), so a player who travels there sees exactly these shots:
    - 0017 The Deep Corn: "Harlan's fields, grown into a maze", but there is no corn in view, only grass and two dirt paths.
    - 0018 Marrow Reservoir: "A steeple stands up out of the water", but there is no water and no steeple.
    - 0020 The Lookout: "Dark pines and granite. Up on the rise, the fire lookout", but there is teal grass and one rock.
    - 0026 The Low Fields: "His plough is still out there", but no plough is in view.
    - 0012 Pine Rest Motel: the card says "Route 9 West", and only the motel sign's post shows, under the HUD.
  - What works: 0015 The Fen (black water, dead tree, reeds), 0024 The Weeping Birches (dolls hanging in the birches) and 0013 Greyfield (the iron gate).
  - Why: LESSONS "Story sights: pictures that carry a caption's facts". DESIGN_GUIDE §2 says every district needs its own landmark, and §6 says landmarks need clear sightlines.
  - Fix: move each milestone so the region's sight is on screen when you arrive (corn rows, the steeple in the water, the lookout tower on the ridge, the rusted plough), or bring the landmark into view of the milestone.

- **Every home is the same box with the same furniture.** [layout] [art] **high**
  - Where: about 18 homes use one shell, with the door bottom-centre on a mat, two windows at the same x on the back wall and an inner door top-right: 0179, 0183, 0187, 0190, 0192, 0193, 0195, 0204, 0208, 0212, 0224, 0229, 0232, 0234, 0239 and 0311-0315.
  - Most are dressed from one stock set: a quilt bed, a braided oval rug in front of the door, a small table with a candle and a jug, and an iron stove.
  - The roughly 25 back rooms (priv_*, back_*, rg_room6, rg_hut) share a second shell, with one window left of centre.
  - Why: DESIGN_GUIDE §10 says rooms are irregular (alcoves, a step down, a pillar, a nook partition). LESSONS #252 says to give a room zones, and interiors r3 says copies of the same bed read as a hotel. Walking door to door, the player sees one room with the wallpaper changed.
  - Fix, per household:
    - vary the shell's width and depth, and move the door;
    - add one structural feature (a bed alcove, a kitchen step-down, a stair, a bay window);
    - swap at least one stock piece for something only that family would own.

- **Small rooms share wall decor at identical spots.** [art] **medium**
  - Where:
    - The same red-sky framed picture and the same small oval mirror hang at exactly the same place in Nell's loft (0252, ≈480,150 and 545,150) and Room 6 at the Pine Rest (0294).
    - The same mirror hangs there again in Hollis's room (0245).
  - Why: it looks baked into the shell. The Inspector checklist flags copy-pasted props.
  - Fix: take the wall pieces out of the shell and hang them per room.

- **Duplicate rooms.** [complete] **medium**
  - Lamplighter and Lantern Inn: The Lamplighter (0304) and the Lantern Inn (0221) have the same layout. Both have a stone fireplace top-left, barrels on both side walls, the same two table-and-chair sets, a round table in the centre, an upright piano on the right with a potted tree beside it, and a bar along the back right.
  - The two schoolhouses: two different doors, both labelled "The schoolhouse.", lead to the same classroom (blackboard, red door, teacher's desk, globe, stove, rows of pupil desks): 0239 (home_ward) and 0326 (school). The teacher's home is a copy of the school.
  - The farmhand cabins: 0311, 0312 and 0315 are identical except for the bed and rug colour. This one is lower priority, since they are multiplayer cabins.
  - Why: duplicates are the clearest sign of an unfinished game (REVIEW A, "Nothing half-built"; LESSONS #252, never repeat a piece in one place).
  - Fix: make the inn a lodging house (front desk, key board, stairs, luggage) and keep the tavern a drinking room. Make Ward's house a home that only hints at the school (marking, a cane, a register).

- **Big shops are sparse: props stand apart on bare floor.** [layout] **medium**
  - Where:
    - 0161 store: the middle floor (≈600-1000 × 450-650) is bare.
    - 0168 garage: the right half is bare concrete.
    - 0216 gas station: the left and right thirds are empty checker.
    - 0200 Bait & Tackle: the blue floor is almost empty.
    - 0324 Town Hall: the centre is bare.
    - 0172 mine: two thirds is empty dirt.
  - Why: LESSONS (interiors r3): "Stardew dresses a room at three scales… Big sprites standing apart on bare floor under bare walls read as props placed, not a life lived."
  - Fix: shrink these rooms, or give them zones: aisles of shelving, a half-unpacked crate corner, a customer's dropped list, oil stains and a parts bench in the garage, timber props and a lamp line in the mine.

- **No shopkeeper behind most counters at noon.** [complete] **medium**
  - Where: at 12:00 on day 6 (tour player in chapter 1) there is nobody in Coyle's store (0161, OPEN sign up), Pruitt's garage (0168), Feed & Stock (0199), Bait & Tackle (0200), Hartley Carpentry (0197) or the gas station (0216). Only Brannock (0196) and the Lantern Inn's keeper (0221) are at work.
  - Why: in a finished farming game the town feels alive because shops are staffed in opening hours. An open shop with nobody in it reads as missing NPCs, unless it is meant as horror, in which case it needs a sign (a "back soon" card, a cold cup).
  - Fix: put each keeper behind their counter during opening hours, or stage the absence on purpose.

- **The same prop repeated within one room.** [art] **medium**
  - Where:
    - 0197 Hartley Carpentry uses one plank-stack sprite five times: three on the left wall, one centre-left, one bottom-right.
    - 0161 Coyle's store has the same jar shelf four times, two of them side by side at x≈155-380, plus two identical FEED sacks and two identical barrels.
    - In 0161 the OPEN sign stands on the floor in front of the counter (≈1045,370) instead of on the door.
  - Why: LESSONS #252: "Never put two copies of the same piece side by side or twice in one house."
  - Fix: one long lumber rack, and an offcut pile, in place of the five stacks. Give the store shelf variants (tins, bolts of cloth, lamps, hardware). Hang the OPEN sign on the door glass.

- **Identical pumpkins at every door.** [art] **low-medium**
  - Where: the same pair of pumpkins flanks the steps of nearly every house and shop: 0075 Hartley, 0078 Feed, 0080 Hale, 0082 Lindqvist and its neighbour, 0085 Marr, 0076 Bait (one). The same white gourd recurs in 0078, 0082, 0083 and 0063.
  - Why: Inspector checklist, Repeats. DESIGN_GUIDE §7: the "life" layer should say who lives there.
  - Fix: vary it by household. Some houses get none; others get a carved one, corn stalks tied to the porch post, a heap at the farm stand, or one smashed pumpkin (horror).

## One-off rough edges

- **Holes in Grandpa's cabin floor read as glitches.** [art] **medium**
  - Where: 0158. Three flat, pure-black dashes at ≈(500,465), (595,522) and (740,575).
  - Why: LESSONS (interiors r3) names exactly this: "flat pure-black dashes… read as glitches."
  - Fix: draw each hole as a missing stretch of one plank, with dark earth inside, the far board's cut face along the top, and pale splinter tips. Use three different lengths, not in a line.

- **The greenhouse bed is a speckled rectangle with nothing in it.** [art] **medium**
  - Where: 0176. A perfect rectangle of single-pixel brown noise, with no edging boards, no rows and nothing growing or dead.
  - Why: LESSONS (owner): "no speckle, no single-pixel noise as texture". An empty box reads as unfinished.
  - Fix: timber raised-bed edging, tilled rows drawn as shapes, and a few seedlings or dead stalks.

- **The sheriff's car is drawn in two styles, and the outdoor one looks 3D-rendered.** [art] **medium**
  - Where:
    - 0083, Dunn's lawn (≈990-1105, 520-580): smooth flat facets, no outline, the wheels lost in the body. It looks like a low-poly render among hand-drawn houses.
    - 0168 garage: a different car model, drawn as a pure side elevation on a lift seen in 3/4.
  - Why: the owner rejected Blender renders of small objects ("you lose detail… it looks bad"). DESIGN_GUIDE §1: one perspective everywhere.
  - Fix: one hand-drawn 3/4 sheriff's car, used in both places.

- **The quarry and the old mill don't read as what they are named.** [layout] **medium**
  - Quarry: 0051 (x146, z-34) is flat grey ground with five loose rocks and puddles. There is no cut face, terrace, ledge, crane or spoil heap, and it is where "The shape in the stone" beat happens.
  - Old mill: 0058 (x30, z93) shows a barn and a farm wind-pump. Nothing says mill (no wheel, race, millstones or sacks), and the stop arrives at the back of the building.
  - Why: DESIGN_GUIDE §4 (verticality: terraces, cliffs) and §2 (each district's landmark; the guide names "the mill wheel" itself).
  - Fix: stepped quarry walls with a dark cut face, and a waterwheel on the mill's race, visible from Mill Road.

- **Paths that stop short, and a door with no path.** [layout] **low-medium**
  - Footbridge: in 0073 (x-35, z10.4) the dirt path on the left ends about 300 px short of the footbridge, and nothing reaches its east end.
  - Marsh place: in 0056 (x-20, z40) the front door opens onto plain grass, with no path or yard.
  - Why: DESIGN_GUIDE §2: "Paths connect nodes; they never just stop."
  - Fix: worn footpaths up to both ends of the bridge, and an overgrown track to the Marsh door (overgrown also tells its story).

- **Lone dark ground patches in open grass read as burnt holes.** [art] **low-medium**
  - Where:
    - 0073: a huge black blob right of the river, with no tree over it.
    - 0056: blobs on the left, and a curling one beside the house.
    - 0015 The Fen: a near-square dark patch with hard corners round the cattails (≈890-1020, 160-300).
  - Why: DESIGN_GUIDE §8 (soft, irregular transitions) and §5 (foliage density changes gradually; dark ground belongs in the copses).
  - Fix: keep the dark forest floor under trees only, and break up the square edge at the Fen.

- **A swing set straddles the hedge in the Market Lane playground.** [layout] **low**
  - Where: 0035 (x48, z16.5). The second swing set has the hedge running through its frame (≈900-1080, 440-590), and it is the same sprite as the swing set beside it.
  - Fix: one swing set, clear of the hedge, plus a different piece (a see-saw, or a sandpit with one small shoe).

- **The house by the graveyard sits under the fence.** [layout] **low**
  - Where: 0038 (x60, z-31). The iron graveyard fence runs along the house's ridge, and a tall grass clump stands in the roof band (seen through the faded roof at ≈1060,520).
  - Why: DESIGN_GUIDE planning rule 2 (the roof band).
  - Fix: move the house 1-2 tiles south, or the fence north, and remove the clump.

- **Name cards cover the room and outlive the place they name.** [ui] **low**
  - Room cards: the room-name card covers the back wall band (y≈107-135) as you enter, where the windows and pictures are (0158, 0161, 0165, 0310). It stays up over the outdoors after you leave: "Grandpa's cabin." over the farm (0159), "Coyle's General Store." over the street (0162).
  - Region cards:
    - Wickham has no card of its own: `RG_LINE` has no `wick` entry, and the only town card fires once at x>30 (src/game.js:307).
    - So Wickham (0010) still shows "Marrow Hollow. Every curtain moves…".
    - The farm (0030) and Marrow Hollow (0033) still show "The Low Fields…" after leaving it. Milestone travel will do the same.
  - Fix: clear the card on any room or region change, give Wickham its own line, and show room names lower (just above the toolbar) or shorter.

- **Light pools read as mats and stains.** [art] **low**
  - Candles: the candle-light ovals in the undercroft (0310) and under Ruth's room (0305) are opaque beige two-tone ovals about 2.5 tiles wide, centred under the stands. They read as straw mats.
  - Mine lamps: the lamps in the mine (0172) throw pale trapezoid beams drawn over the floor.
  - Why: LESSONS interiors r1 and r4 (candle light is a small pale-yellow patch, at most 2 tiles; beams over the scene read as stains).
  - Fix: smaller, yellower patches, offset down-right from the flame; drop the beams.

- **The Low Fields plots, and two roads, are empty screens.** [art] **low**
  - The plots: 15 stops (0090-0118) of the same olive mud with sparse weeds and soft cloud blotches. From the plot centres nothing tells "Ash bottom" from "Creekside" from "The bend".
  - The roads: Route 9 (0039) and Wickham Road (0070) are bare as well.
  - Why: DESIGN_GUIDE §5 (open ground is framed by detail at its edges) and §2 (districts readable from the ground). If these plots survive the farm reorganisation, each needs one thing of its own.
  - Fix: one marker per plot (a survey stake with the name, a stump, a ruined wall, the abandoned plough). Add reflector posts, a mailbox or a phone line to the roads.

## Already feels finished (keep it)

- **Streets:**
  - Marrow Hollow square: bell, fish stall, notice board, benches (0157).
  - The Lamplighter's front porch with tables and street lamps (0079).
  - The Bait/Forge junction with its street signs (0076).
  - Pruitt's yard of wrecked cars (0042).
  - The Lantern Inn's back yard: washing line, fish-drying rack, chopping block, woodpile (0066).
- **Outdoors:**
  - The autumn palette and the rain.
  - The Hollow Woods path (0049).
  - The river and its reeds (0060).
  - The Fen (0015).
  - The Greyfield gate (0013).
  - The dolls in the Weeping Birches (0024): the best region arrival.
- **Small stories outdoors:**
  - Tarps on damaged roofs (0038, 0063).
  - Roadkill by the covered bridge (0046).
  - A lone gravestone in the long field (0090).
- **Rooms that tell you who lived there:**
  - Room 6: stained bed, TV static, rug knocked askew (0294).
  - Greyfield dormitory: "DAYS LEFT 9" and a stripped bed (0296).
  - The "LOST, AGE 9" poster at the gas station (0216).
  - Agnes's house: the doll on the chair and the cradle (0179).
  - Silas's coffins (0195).
  - Dunn's rocking horse and map (0187).
  - The attic's sloped rafters (0322).
  - Brannock's forge (0196).
  - Wickham Chapel's red runner (0236).
- **Systems:** door transitions dim cleanly with no empty frames (0157, 0159, 0162). Every room entry has a sound. There is one font, and every card can be read.
