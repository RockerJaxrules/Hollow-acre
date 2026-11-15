# Part 2: the plan

From the owner's direction (kept word for word in `2d/tools/review/SEQUEL_NOTES.md`). The mountain is always dark and
always cold. You inherit your grandmother's mining company after she goes missing. Driving up to check on it, a
yeti-like creature rams your car off the mountain. You start lower down: you explore, mine for money, fix your car, and
drive up to the main area, where your grandmother's mine is. It is a long game, always about survival: running,
sneaking, hiding, base protection, upgrading your tools, exploring. The character carries a flashlight.

## How Part 1 hands over
Part 1's new ending (done): the letter, the goodbye to whoever you married, the drive away from the farm (in the game,
`2d/src/ending_story.js`), the pixel drive up the mountain (`2d/src/ending_drive.js`), then the realistic first-person
drive in Unreal (`L_EndingDrive`), and "To be continued". Still to wire: the ending playing after Part 1's finale, and
the app starting Part 2 from that black, carrying the save (name, look, spouse) over.

## Milestones
1. **The crash** (the opening of Part 2, picking up the drive):
   - the drive resumes on the switchbacks; the smashed gap in the guardrail goes by (someone went over before you);
   - something huge crosses the road far ahead in the headlights and is gone into the snow; you brake;
   - it hits the car from the uphill side, shoves it through the guardrail, and the car goes over and rolls down the
     slope; glass, noise, black;
   - the creature is only glimpsed (fur, size, a shape in the light). Horror shows little, and its full model can come
     later.
2. **Waking at the bottom** (the first playable moments): first person on foot (the MetaHuman body), the car on its
   roof in the snow, the flashlight (battery, the beam in the falling snow), cold (body heat falls outside, recovers by
   fire and shelter), stamina (running), crouching (quieter), your breath in the air.
3. **The lower mountain:** an old mining camp below the road, with a shed you can make your first base, a store or
   buyer for ore, old workings to mine, the forest, and the creature roaming at night: hide, sneak, run.
4. **The loop:** mine, sell, buy car parts and better tools, fortify the base, fix the car, then drive up to the main
   area (your grandmother's mine). That ends the first stretch.

## Rules that carry over
- References first for everything we model (photos and 3D models for study only, kept in `_references/`, never
  shipped). Humans are MetaHumans.
- Our own work everywhere else, plus Epic's MetaHuman and Megascans (keep `unreal/ASSETS_EPIC.md`).
- Show the work on the live page; send videos of cutscenes when they're done.
