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
   - it comes up over the rail ahead and stops in the road in the headlights; you brake to a stop about 12 m short of
     it. It rears up onto its hind legs (about 3 m), roars at you with its arms up, drops, wheels round and is gone
     up the road into the dark (owner: "we need to see the creature"; first person only, never leaving the driver's
     eyes);
   - you wait, creep on, watching the bank; a growl on the left, your head snaps round and it is already at the
     window: it hits the car from the uphill side and shoves it through the guardrail;
   - the long fall (owner: "mountains aren't small"): the car tumbles down an avalanche chute below the road (steep
     snow, a cliff band, a long slope), about 160 m down to the valley floor, and ploughs into the deep snow where the
     chute runs out; glass, noise, black;
   - the creature: a yeti built on a gorilla (owner: "a gorilla is a good start"). The sound is made from real
     recordings (CC0 libraries, owner approved), every source logged.
2. **Waking at the bottom** (the first playable moments): first person on foot (the MetaHuman body), the car on its
   roof in the snow, the flashlight (battery, the beam in the falling snow), cold (body heat falls outside, recovers by
   fire and shelter), stamina (running), crouching (quieter), your breath in the air.
3. **The lower mountain:** an old mining camp below the road, with a shed you can make your first base, a store or
   buyer for ore, old workings to mine, the forest, and the creature roaming at night: hide, sneak, run.
4. **The loop:** mine, sell, buy car parts and better tools, fortify the base, fix the car, then drive up to the main
   area (your grandmother's mine). That ends the first stretch.

## Multiplayer (owner: "Multiplayer needs to be a thing for part 2 as well")
Part 2 is co-op, built the same way Part 1's is (`MULTIPLAYER.md`): one player hosts, friends join with a code, and
there is no game server to rent.
- **Engine:** Unreal's own networking. The host's game is the server (a "listen server"), everyone else joins it, and
  the host's save holds the world.
- **Connecting:** Epic Online Services (free). It gives a lobby with a join code, friend invites, a route between
  different home networks and phone carriers, a relay when no direct route exists (as Part 1's TURN relay does), and
  play across PC, Mac, iPhone and Android. Steam's networking can stand in on Steam. Optional voice chat, best as
  proximity voice: you only hear friends near you.
- **Players:** up to 4.
- **Shared:** the mountain, the base and its defences, the car's repairs, what has been mined, the money, and the story
  and its mystery (the host's grandmother; friends come along, the way farmhands join the host's farm in Part 1).
- **Each player's own:** their character from their own Part 1 save (name, look), backpack, tools, health, warmth,
  stamina, and flashlight battery.
- **The creature** hunts everyone. Any player's noise and light draws it. A downed friend can be revived, which makes
  splitting up a real risk.
- **From Part 1 into Part 2:** a group that reaches the ending together goes through it together and wakes up in the
  host's Part 2 world. Part 2 also has its own Host and Join screen.
- **How it is built:** networked from the first playable piece (milestone 2), never bolted on later. Every system
  (movement, the flashlight, cold, inventory, mining, the base, the creature) is written to run on the host and show
  on every screen. It is tested with two game windows on the owner's PC, and online through Epic Online Services once
  the owner has a free Epic Developer Portal account (a sign-in on the PC).

## Rules that carry over
- **Realism first** (owner: "Focus on making all animations high detailed realistic same with models and textures"):
  - every animation, model and texture in Part 2 aims for high-detail realism;
  - people and the player's body move with motion-captured animation (not hand-keyed walk cycles), blended by motion
    matching;
  - the creature is animated from real animal footage (gorilla, bear) with physics on top;
  - models are built from references at real scale, with real-scale textures (Megascans, or our own baked from
    detailed models).
- References first for everything we model (photos and 3D models for study only, kept in `_references/`, never
  shipped). Humans are MetaHumans.
- Our own work everywhere else, plus Epic's MetaHuman and Megascans (keep `unreal/ASSETS_EPIC.md`).
- Show the work on the live page; send videos of cutscenes when they're done.
