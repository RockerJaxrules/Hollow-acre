# Notes A: opening, Chapter One, night, horror (run_m1)

Scope: sheets opening_00-02, chapter1_00-10, night_00-03 and horror_00, every flagged-looking single shot, and the matching
report.json stops. The Chapter One end card (#163-166) is filed under chapter2 in this run, but it closes Chapter One, so it is
covered here too.

Report check for these sections: fps 60-62 at every measured stop, no page errors, no flagged stops, no FORCED or FAILED steps,
and every action played a sound. One exception that report.json does show: the game's own `objective()` throws during the
ritual (note 1).

## Ordered by impact

### Broken or stuck

1. **[bug] high: the objective throws for the whole Chapter One climax.**
   - Where: `0156_chapter1_ritual_ERR.png` and `0160_chapter1_ritual_ERR.png` (churchyard, x 70.2, z -38.6). report.json has `obj: "ERR"`, `objText: "Cannot read properties of undefined (reading 'name')"`.
   - What you see: the goal bar is frozen on "Light the churchyard stone. 2/3 lit ... ↗ 109 m north-east" while you stand at the lit stone.
   - Cause: in `src/game.js` `objective()`, once all three altars are lit and `S.bound` is still false (the 6 s of `ritualUpdate`), `next` is undefined, so `next.name` throws.
   - Why it matters: a stale arrow pointing 109 m away at the story's peak reads as broken ("Always a next step", REVIEW A).
   - Fix: before the `next` line, add `if(!next)return ['The rite','Three flames. Hold your ground.',null];`, or return that whenever `S.mode==='ritual'`.

2. **[story] high: you never actually see the Chapter One climax.**
   - Where: `0156_chapter1_ritual_ERR.png`, then `0160_chapter1_ritual_ERR.png`.
   - What happens: `startRitualEnd()` spawns the Hollow 4 tiles in the direction you face. Here that put it behind the churchyard wall, under the toast box "For a moment it sounds like a man." Only a dark post shows above the wall.
   - After the flash, the "ash with a straw hat" is a small smouldering bundle half hidden behind the same wall (#160, top centre). The end card then tells you about the ash and the hat in text.
   - Why it matters: LESSONS "Cutscenes [c1]: a cutscene SHOWS" and "Showing a scene instead of reading it".
   - Fix:
     - Stage the Hollow on open ground in front of the player, clear of walls, and hide the HUD and toasts during the ritual.
     - Let it burn in frame for 2-3 s.
     - Leave the hat in the lantern pool, and pan to it before the card.

3. **[complete] high: the Chapter One card reads like the end of the whole game.**
   - Where: `0163_chapter2_chapter_2_begins.png`, `0164_…`, `0166_…`, right after #160.
   - What's wrong:
     - It offers **New game** beside Keep farming.
     - It carries the credit line "Everything by Jaxon Charlton".
     - It says "Next autumn, the town draws lots again."
     - The goal underneath is "Free play: The field is quiet now. Grow whatever you like.", word for word the real THE END goal (summary.md, story reached).
     - It also prints "1 DAYS".
   - Why it matters: a new player will think they have finished the game at about minute 15, and New game here throws the run away (REVIEW A: "No dead ends after a story beat, a chapter card").
   - Fix:
     - Title it "Chapter One complete. Next: Chapter Two, The Tithe" with one Continue button.
     - Drop New game and the credit, which belong to the real ending.
     - Write "1 DAY" (singular).
     - Don't show the Free-play goal until the true end.

4. **[ui] high: toasts draw on top of open letters, notes and shops, and are lost behind minigames.**
   - Where it covers things:
     - `0031_chapter1_note_The_farm.png`: the arrival toast covers the first lines of Grandpa's letter, the first story text in the game.
     - `0136_chapter1_note_The_Pine_Rest_register.png`: the toast covers the note's top edge.
     - `0069_chapter1_shop_The_car.png`: the toast covers the first shop row.
   - Where it is lost: report.json shows the Agnes and Hollis "You've started to notice things about…" insights firing during `0064_…minigame` and `0089_…minigame`, and they are not visible in either shot. Those character beats never reach the player.
   - Why it matters: DESIGN_GUIDE Inspector checklist, "do bubbles and toasts cover the action?"
   - Fix: hold toasts in a queue while a note, shop, talk, close-up or minigame is open, then play them after it closes. Alternatively, put the toast layer under modal panels.

### The first ten minutes

5. **[layout] high: the first playable frame is an empty road, and the wreck is just off screen.**
   - Where: `0023_opening_arrival_on_Route_9.png`, `0027_…`, `0028_chapter1_goal_Stranded.png`.
   - What you see: the player is at x -58.6, z -6.4. The crashed car, the oak and the deer are at x -61, z 2.5, about 9 tiles south, under the hotbar (a red corner peeks out at the bottom centre). Meanwhile the toast says "Your car is wrapped around the oak."
   - Why it matters:
     - The game's hook should be the first thing you see.
     - DESIGN_GUIDE 5 asks for 1-3 points of interest per screen, and this frame is grey asphalt.
     - LESSONS (owner): "the crash must show the thing hit".
   - Fix: wake the player beside the crumpled nose (about x -60, z 0), or hold the camera on the wreck for a beat and then pan to the player.

6. **[art] high: the player's car is a box drawn in two perspectives, and it has three different designs.**
   - Mixed perspective: in the intro and escape cutscenes (`0014_…intro_drive_2`, `0019_…`, `0021_…`, `0103_chapter1_cutscene_Leave.png`, `0107_…`) the wheels are side view, but the roof is a top-down trapezoid and the two headlight beams fan out on the road plane from the top and bottom of the side.
     - In #21 the struck deer sits flat on the door panel.
   - Three designs for one car:
     - a red box in the cutscenes;
     - a long rusted side-view sedan in the repair minigame (`0047_…`);
     - a 3/4 red sedan at the oak (`0050_…`).
   - Why it matters: DESIGN_GUIDE 1 says "Never mix angles in one view". LESSONS records the owner on the intro: "redesign the car".
   - Fix: draw one car (the 3/4 sedan is the best of the three) and use it for the cutscene road in the same 3/4 view, with beams from the two front corners. Remove the side-view wheels from the top-down shots.

7. **[story] high: the cutscenes still narrate instead of showing.**
   - #103: "The highway west. The radio plays a hymn you almost know."
   - #107: "The farm sign goes by. Again." There is no sign in the frame, only an empty road, so the loop, the game's big reveal, is told rather than seen.
   - #120, #124, #129 (`0124_chapter1_cutscene_Ruth_s_ribbon.png`): "Agnes doesn't ask you in. She stands in the door with a ribbon wound round her fingers…" On screen, Agnes stands in the middle of Route 9, three tiles from her porch, with no ribbon. Her door is cut off by the top letterbox bar.
   - Why it matters: LESSONS (owner): "cutscenes carry only spoken lines from characters - no narration captions". LESSONS "Never write a line that describes what is on screen".
   - Fix:
     - #107: drive the car past the HOLLOW ACRE sign twice, so the same sign slides by again.
     - Agnes: put her on her top step behind a half-open door, with a red ribbon around her hand, and frame the porch inside the letterbox. Turn her line into speech in a bubble.

8. **[story] medium-high: the wreck never changes during seven repairs, and the escape car still has a cracked windscreen.**
   - Where: `0050_`, `0057_`, `0068_`, `0077_`, `0084_`, `0093_chapter1_goal_The_car.png` are the same sprite: nose-up, the oak through the bonnet, a cracked windscreen.
   - What the toasts say: "The car tears off the oak … drops onto its wheels", "The car sits level for the first time", "Clear glass".
   - The escape cutscene car (#103, #107) still has the white crack lines on the windscreen.
   - Why it matters: LESSONS #268 "Every caption fact needs its detail in the picture". LESSONS "Mending a building on screen".
   - Fix: give the world car 3-4 states, swapped after each step: on the oak; down on its wheels and dented; straightened with a new tyre; then new glass. Use clear glass in the cutscene car.

9. **[story] medium: the well close-up contradicts its own caption.**
   - Where: `0114_chapter1_closeup_What_the_well_brought_up.png`.
   - What's wrong:
     - The caption says "The hair is your colour", but the braid is pale gold (224,192,112). This player chose dark brown hair (66,26,14) in the creator and in-world (#23).
     - There is no child's tooth anywhere.
     - The tag reads "HOLLOW 1874", while the caption says "HOLLOW ACRE 1874".
   - Why it matters: this is the first personal scare, and it misfires for anyone who isn't blonde. LESSONS #268: "Every caption fact needs its detail in the picture".
   - Fix: tint the braid from the player's hair colour, draw a small tooth knotted into it, and make the tag read HOLLOW ACRE 1874.

10. **[art] medium: the deer close-up is the world sprite blown up.**
   - Where: `0111_chapter1_closeup_Something_kept_time.png`.
   - What's wrong: it is the same drawing as the deer lying on the farm track (`0112_…`), scaled about 6x. It goes chunky, and the ring of meat pieces that should read as a clock face reads as pink flowers or hearts around a blob.
   - Why it matters: LESSONS #268: "Don't blow a small world sprite up 6-8x for a close-up… Draw close-ups at the viewer's own scale".
   - Fix:
     - Draw the close-up fresh at 1:1.
     - Lay the deer on the dirt track with legs and head readable.
     - Set twelve pieces at clock positions with a stick "hand" pointing toward the cabin door.

### Things seen on every screen

11. **[ui] medium: the toast box sits right where the camera frames the subject.**
   - The box is fixed at y≈107-160, screen centre. It covers:
     - the cabin roof (`0029_…`);
     - the motel's roof sign (`0137_…`);
     - the Hollow at the ritual (#156);
     - the jump-scare face (#471, note 13).
   - "Journal updated." alone takes that spot after nearly every find (#61, #86, #115, #117, #132, #134, #137, #140).
   - Why it matters: DESIGN_GUIDE Inspector checklist (toasts covering the action). LESSONS "Cards that ask the player to wait": dock it under the objective bar.
   - Fix:
     - Dock toasts under the goal bar at its width, or just above the hotbar.
     - Replace "Journal updated." with a pulse on the Menu or journal button and a page sound.

12. **[ui] medium: closing a close-up leaves a ghost over the world.**
   - Where: `0112_`, `0115_`, `0117_`, `0134_`, `0140_…goal…png`, about 1 s after each close-up closes.
   - What you see:
     - The card shrinks and fades with its square backdrop edges visible.
     - The caption and "Click or press E to step back" stay at full strength over the field and the hotbar.
     - In #117 the chalk body lies across the player.
     - The new goal and the toast arrive underneath it.
   - Why it matters: REVIEW A Transitions, "a fade or a cut that feels intended, never … a half-drawn" frame. Five times in Chapter One alone.
   - Fix: fade the caption and hint text together with the card (or first), and keep the dissolve under 0.3 s. Delay the new goal and toast until it has finished.

### One-off rough edges

13. **[story] high: the jump scare's face is hidden under the toast and the HUD.**
   - Where: `0471_horror_jump_scare.png` (farm, x 2, z -1.8, 11 pm, storm).
   - What you see: the Hollow appears right behind the player, but its glowing head and raised hands sit under the HUD chips and the toast box. The toast "When the light came back, it was there." says what the picture should be doing.
   - Why it matters: the scare is the horror's payoff, and here the most important pixels are covered. LESSONS: "Never write a line that describes what is on screen".
   - Fix: for about 1.5 s hide the HUD chips and toasts, and place the creature so its face lands in the middle third of the screen. Drop the caption, or show it after the sting.

14. **[ui] medium: two texts are drawn in one place at the same time.**
   - `0120_chapter1_cutscene_Ruth_s_ribbon.png`: the scene title "Agnes Abernathy · Ruth's ribbon" is drawn over the still-fading "Your hands won't stop shaking", so the title is garbled.
   - `0023_opening_arrival_on_Route_9.png`: the tutorial TIP box sits on top of the "Day 1. Dawn…" toast, and the toast's letters show through it.
   - `0001_opening_loading_screen.png`: the subtitle "A FARM AT THE END OF ROUTE 9" overlaps "CHAPTER ONE · THE HOLLOW", and "LOADING THE VALLEY 1503/1503" overlaps the build line.
   - Fix: clear or finish the old text before the new one starts. Show the tip only after the arrival toast has gone.

15. **[art] medium: a storm night shows no rain.**
   - Where: `0151_night_storm_night_region_Hollow_Acre.png`, `0154_…`, `0155_…`.
   - What you see: rain streaks only appear when the shot is brightened 3.5x. On screen the storm is a calm night, even though the rain sound plays.
   - Cause: `main.js` draws 90 thin streaks at alpha .35 before the night light multiply.
   - Fix: draw the rain after the light pass, or light it, with 2 px streaks, two or three times as many, and splash ticks. Add an occasional lightning flash.

16. **[story] medium: toasts describe sights that aren't on screen.**
   - `0128_night_night_region_Old_Marrow.png` (x -2.6, z -108.4): "Every hearth in Old Marrow is glowing… You hold your hand to one… Something in the chimney is breathing." The frame holds a dead tree, a sign and darkness: no hearth, no chimney, no glow.
   - `0130_night_night_place_Hollow_Acre.png`: "The girl is gone. Wet footprints lead toward the corn." No footprints are drawn.
   - Why it matters: LESSONS "Showing a scene instead of reading it".
   - Fix:
     - Fire the Old Marrow line only with a ruined hearth in view, and give it an orange glow and a smoke breath.
     - Draw a trail of small bare wet prints from the porch toward the corn when that line fires.

17. **[clarity] medium: the candle step may stall an honest player.**
   - What the shots show: the HUD has 5 coins at `0137_` and `0140_chapter1_goal_Candles.png`, and the goal is "Buy 3 Ward Candles". The peddler (`0142_chapter1_shop_Candles.png`) charges 45 coins a candle, and shipping only pays the next morning.
   - Why nobody saw it: the story bot quietly set `S.coins=Math.max(S.coins,120)` (story.js line 45), so "0 steps FORCED" hides this.
   - Why it matters: a stuck step in the first hour, with no hint of how to get about 130 coins (REVIEW E).
   - Fix (any of):
     - price the Ward Candle so 3 are affordable from the car-repair day;
     - have Grandpa's pages or Pastor give one;
     - have the goal say "Sell crops or fish to raise 135 coins".
   - Then rerun the bot without the coin top-up.

18. **[ui] medium-low: the character creator doesn't look like the rest of the UI.**
   - Where: `0004_opening_creator_Face.png`, `0006_`, `0007_`, `0008_`.
   - What's wrong:
     - The options float over the dim farm with no panel behind them.
     - The FACE/HAIR/CLOTHES/EXTRAS tabs are rounded pills, while every other button is a square pixel frame.
     - The whole block, preview included, jumps vertically when you change tabs: the tabs are at y≈255 on Face and y≈163 on Clothes.
     - The label "JACKET, VEST, CARDIGAN, INNER TEE" wraps onto four lines.
     - The ghost girl stands under the EYES/BOTTOMS labels, so she reads as an overlap glitch, not a scare.
   - Why it matters: LESSONS "Full-screen scenes": "square pixel frames…, no rounded pills or smooth borders".
   - Fix:
     - Put the options in a framed wood panel anchored at a fixed top.
     - Use square tabs.
     - Shorten the label to "LAYER".
     - Move the ghost girl clear of the labels (behind the fence, right).

19. **[complete] low-medium: build text is visible on the title screen.**
   - Where: `0002_opening_title_screen.png`, `0003_opening_how_to_play.png`, bottom line: "Build Nov 13 02:21 AM · art 12/12".
   - Why it matters: LESSONS "Full-screen scenes": "Never show debug text … in the small print".
   - Fix: move it to Settings/About. Keep "Headphones on, silent mode off."
   - Also: the open How-to-play panel (#3) sits on the pumpkin row's stems. Raise it or shorten it.

20. **[complete] low: names and wording are inconsistent.**
   - The motel's roof sign reads "ROUTE 9 MOTEL" (`0137_…`), but the goal, the note and the roadside sign all say "Pine Rest".
   - "honor box" (Hollis #43, goal #93) vs "honour box" (toast at #89).
   - Coyle's list (`0069_…`) has "Pumpkin seeds ×2" next to "Corn seed ×2". The first three rows have flavour lines ("Slow and heavy. Sells for 18."), while the rest are templated ("Potato: grows in 20 hours of care…").
   - Why it matters: REVIEW A, "One look, one voice".
   - Fix: one name, one spelling, one description style.

21. **[ui] low: the tyre you came to buy is the last row of Coyle's list and is cut off.**
   - Where: `0069_chapter1_shop_The_car.png`. "Tire, used" is clipped by the panel's bottom edge, and the panel's top runs over the goal bar.
   - Fix: pin story items to the top of the list while that goal is active, and fit the panel below the goal bar.

22. **[clarity] low: the HUD chips under the goal bar aren't explained.**
   - Where: `0086_…` and `0148_…`. "98% +1", a candle "2" and a red-dot "5/7" use 6 px icons with no labels.
   - During "Repair 6/7" the chip says "5/7", which looks like an off-by-one.
   - Fix: readable icons, a tap or hover label, and either "Repairs done 5/7" or a count that matches the goal.

23. **[layout] low: the crossroads peddler has no stall.**
   - Where: `0146_chapter1_goal_The_rite.png` (x 20.6, z 22.1).
   - What's wrong: the candle seller is a bare dark shape on a dirt path, with no cart, lamp, cloth or candles. Nothing at this node says "someone sells here at night".
   - Why it matters: DESIGN_GUIDE 2 Nodes ("Things happen at nodes: a bench, a lamp, a board").
   - Fix: a small handcart with a hooded lantern and a row of black candles on a cloth, lit after 7:30 pm. The figure itself can stay as it is.

24. **[art] low: the garage forecourt looks pasted on, and Hollis's bark is hard to read.**
   - Where: `0086_chapter1_goal_The_car.png` and `0094_…` (x -34.5, z -8.1).
   - What's wrong: the forecourt is a hard-edged pale rectangle with a diagonal light band laid across the verge. Hollis's line "Lovely day for it." is grey text on a translucent grey box, sitting over the garage door.
   - Why it matters: DESIGN_GUIDE 8 (soft, irregular surface transitions). LESSONS "a speech bubble is game UI" (frame, tail, readable).
   - Fix: give the slab broken edges and an oil stain, and put the bark in the standard bubble with a tail.

25. **[layout] low: some screens are empty.**
   - `0127_night_night_region_Marrow_Reservoir.png` (x 115, z 170.2): a dirt path and grass, with no water or landmark in frame (the reeds and a "NO SWIMMING" sign are cut off at the bottom right).
   - `0029_chapter1_goal_The_farm.png`: the middle 60% is bare yard dirt between the cabin and the field.
   - Why it matters: DESIGN_GUIDE 5 (1-3 points of interest per screen) and DESIGN_GUIDE 4 (cut dead space).
   - Fix:
     - Move the reservoir's region marker to the shore.
     - Add a desire path, a wheelbarrow and a muddy patch by the gate in the farmyard.

## Already feels finished (keep it)

- **Title screen** (`0002_`, `0003_`): moonlit field, scarecrow, jack-o'-lanterns on the fence rail, one pixel font and a clean button stack. It sets the tone at once.
- **Car-repair minigames** (`0047_` to `0097_`): every step has its own close-up of the real job (winch, dents, belt, studs, glass, battery tray, fuel), plus a title tab, a one-line instruction and a Skip button.
- **Writing:** Grandpa's letter (`0031_`) and the Pine Rest register (`0136_`) are dry, dark and specific. "The ink is still wet." lands.
- **Close-ups that read at a glance:** the county line (`0139_`) and the October calendar with the chalk body (`0116_`).
- **The town at night** (`0126_`, `0132_`): warm windows, street lamps with pools of light, and the lantern's round glow. Night is dark but readable.
- **The mind effects on the HUD:** "Day 0" (`0148_`) and the blanked "--:--" clock (`0136_`, `0142_`) come from `mind.js` on purpose. They are a good quiet scare; keep them.
- **Shipping bin panel** (`0040_`): clear two-column layout with the coin forecast.
- **Technical:** one font on every screen (Hollow Pixel), 60-62 fps, no page errors, and every action answers with a sound.

## Not game faults (bot artifacts; don't chase these)

- `0043_`, `0044_`, `0071_`: the garage and the store are drawn as a black void with floating furniture. The story bot moves the player to an NPC inside a room without entering it (`S.room` stays null).
- `0135_` to `0150_` (rain and fog stops): the tour sets `S.rain` and `S.fog`, which the game never reads. Real rain uses `rainDay()`, and fog only appears at night, so daytime rain and fog were not actually tested in this run.
- `0132_night_night_place_Marrow_Hollow.png`: the player is hidden behind a house, and in `0086_` and `0146_` the player stands inside an NPC. These are the bot's `near()` placement.
