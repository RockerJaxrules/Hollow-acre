# Act I gameplay: The Bottom (building log and plan)

The owner (2026-11-17, going to bed): build most of Part 2's gameplay without stopping; it must be scary, high detail,
a great story, a beautiful big map, the creature hunting you, story-scripted jumpscares, human interactions. Every
piece passes the judge (blind rounds, posted in full on the live log) before it counts as done. Unreal's own docs and
tutorials are read before each system and effect; sources are listed at the bottom.

The story slice (from `PART2_STORY.md`, Act I): you wake in the wreck at the foot of the chute (done: the wake). The
flashlight, the cold, the snow. Grandmother's truck, upside down under the guardrail gap, her journal in the glovebox.
Camp Nine (the abandoned camp at the foot of the chute, `build_town.py`): a fire, a shed to hold. The first night:
something circles the camp. A lantern comes through the trees with a rifle; you run from it until the rifle goes off
behind you and the husk on your heels drops. It is Kessler, the foreman who wrote to you.

## Order of work
1. **The player in the snow** (on foot after the wake): the flashlight a real old two-D-cell beam (hot centre, soft
   spill, a little haze in the falling snow, not a glow that fills the screen); the hand holding it seen low right; the
   steps in the snow heard; breath; the cold.
2. **Looking and using**: look at a thing and press E (a small prompt); pick up, open, read. Notes and the journal read
   as captions-style pages. Objectives as short captions, no HUD clutter.
3. **The husk hunts**: a stalking AI on the crash's husk. It keeps to the dark at the edge of the light, circles,
   listens (running, a dropped thing, the flashlight on it), investigates, chases on sight, loses you if you break the
   line of sight and hide or crouch still in the dark; a grab is death (a fast cut to black), back to the last
   checkpoint.
4. **Story-scripted scares**: placed by the story, each fired once by a trigger (where you are, what you just read or
   picked up): e.g. the truck's door bangs as you reach for the glovebox; a husk across the camp's open ground in the
   flashlight's edge; at the shed, the fire lit, it hits the boarded window.
5. **The first night and Kessler**: the lantern in the trees, the chase, the rifle, Kessler (a MetaHuman, his lines
   as captions; the player speaks in captions too, no voices).
6. **Beauty pass**: snowfall, wind, the moon on the snow, frost, the camp's details; the big map beyond.

## The rest of the first night (next, after the shed passes the judge)
From the outline (PART2_STORY.md, Act I: "A lantern comes through the trees with a rifle, and you run from it, through
the dark, until the rifle goes off behind you and the husk that was on your heels drops"), built as play, not a cutscene:
1. **The window.** Later, by the fire (the stove lower, a caption "Later"): a scrape along the back wall, then its hand
   through the gap in the boarded window over the bench (the journal's "It stood at the window a long while"), long
   fingers feeling along the inside of the boards; the light on it, it pulls back. Telegraphed (the scrape), then sudden.
2. **The wood.** The stove burns down; the cold comes back on screen. "The fire's dying. Find wood": the woodpile under
   the bunkhouse's eave across the open ground. A carry mechanic (E on the pile: an armful, slower, no running, the
   flashlight held low over it); back to the stove (E: fed, the fire up again). It stalks the player out there (the
   hunt's stalk at the edge of the light, its breath heard).
3. **The lantern.** Out at the woodpile: a lantern among the trees past the camp's edge, swinging as someone walks; a
   tall figure with a rifle. The player can't tell who or what; it comes on. The husk breaks from the dark behind the
   player and charges: run (the rifle raised toward the player, the player's caption "No, no, no"), the shot, the husk
   on the player's heels drops in the snow. Silence; the lantern raised to the player's face.
4. **Kessler.** A MetaHuman (an older foreman: weathered, a short grey beard, a wool cap, a canvas coat; from a preset
   made his own), his lantern a real kerosene hurricane lantern (its light flickering from the flame, code-driven),
   his rifle an old lever-action. His lines as captions: "Get inside." Short, hard, kind. Then the first cutscene of
   Act I's end: by the stove, what comes out at night, the road shut until you can drive it.

## Judge
Each step: a contact sheet and a video from the player's eyes; a blind judge (a subagent that sees only the pictures
and the brief) scores it out of 10 against: scary, realistic, readable, beautiful, does it play. 7 to pass.

## Sources read
- Alien: Isolation's AI: Tommy Thompson, "The Perfect Organism: The AI of Alien: Isolation" and "Revisiting the AI of Alien:
  Isolation" (Game Developer); the two-tier director/creature design and the menace gauge.
- Epic: AI Perception (sight, hearing, Report Noise Event); Spot Lights; Using IES Light Profiles (Use IES Intensity off,
  the profile clipped to the cone); Volumetric Fog (Volumetric Scattering Intensity per light).
- Snow trails: runtime virtual textures and render targets (Epic forums "How to realize interactive snow in UE5"; the
  RVT snow deformation write-up on Medium); decals first, deformation later.
- Epic: Auto Exposure (Local Exposure: highlight and shadow contrast, the base/detail split); the Niagara quick start
  (translucent materials for smoke and vapour).
- Hiding: the Unreal forum threads on hiding in lockers and AI Perception (the creature that saw you go in checks it;
  one that lost sight first searches the last place it saw you), for the shed and the camp's hiding places.
- Scares: Supermassive on Until Dawn (dread more than jump scares; telegraph some scares, hide others so players don't
  learn the formula, PlayStation Blog "Until Dawn's 5-step formula"); build-up and release (Game Developer, "The
  Balancing Act of Tension in Horror Game Design").

## Log
- Judge scores so far (blind, from contact sheets): 3, 3.5, 4, 4.5, 5. Rounds posted in full on the live log.
- Round 5 to 6: the face in the beam (the beam eases off what is close in front of it, a husk in it counted though it has
  no collision; exposure metered on the frame's bright end: Epic, "Auto Exposure", local exposure and the histogram's
  low/high percent); the beam follows the eyes onto close things (the matches on the table); the body slips back out of
  view when looking down. The wood: the plank scan's boards stand upright in its picture, so boards of it are turned in
  their own plane (the grain along each board; across it they read as stacked square tiles), the whole camp. The shed
  from inside: girts, corner posts, the door's frame and header, a floor of boards in an indoor wood with no snow (every
  town material lays snow on what faces up). The breath: a puff of vapour from under the eyes each breath out (quicker
  and heavier winded, none by a lit fire), M_Breath a translucent material lit per pixel, so it shows only where a light
  catches it (Epic's Niagara quick start for the translucent set-up; the Unreal forum thread on exhaled breath).
  The sleeves: folds in the cloth (rings bunched above the cuff, a fan of creases inside the elbow, long folds down the
  upper arm) from a height in the reference pose turned to a normal by its screen derivatives (Mikkelsen's surface
  gradient), the valleys darker; the hoodie looser on the arm.
- Round 6 (5/10, scary 6) to 7: the match lights the room and the stove strongly and the hand holding it gently (two
  lights on separate lighting channels; at full strength on the arm the sleeve burned out to a yellow blob); the fire's
  light spills out of the doorway onto the snow (a spot from the back of the room through the door, flickering with
  the fire), so the passing husk is lit warm from the front and throws its shadow, and it passes slower with a longer
  stop; the eyes adapt slowly to the dark (Auto Exposure's speed down 1.5 to 0.35 stops a second). The stove made a
  real stove: its fuel door open on its hinge, the mouth cut in the belly (faces taken out of the turned shell; a
  boolean on the closed belly cut only a blind pocket), a sooted firebox inside, a grate, split logs on a bed of coals,
  flames on crossed cards (M_Flame: a Custom node licks and tapers each flame from its UVs and the time), its iron
  heating to a dull red over the first minute (M_HotIron, blotchy). The shed kept as a mine camp's tool shed is: shelves
  of cans, jars and a dead hurricane lantern on brackets; a shovel, a pick and an axe leaning in the corner; a saw on a
  nail; an empty wood box by the stove (the reason to go out for wood); a crate. Its window over the bench, boarded with
  a hand's gap. The window beat (Part2Story BeginWindow/TickWindow): later by the fire, a scrape along the back wall,
  another, its breath; its hand in through the gap (AHusk::Reach, a two-bone reach on its code-animated arm), feeling
  along the boards; the light on it and it pulls back with a growl ("It knows I'm in here.").
- Round 4 to 5: the snow no longer falls indoors (Snowfall's NoSnow boxes: the shed's inside); the stove beat (a big
  box of kitchen matches, the match's flame on the hand, the stove watched as it catches, then the flashlight off and
  the fire the only light); while waiting by the fire it passes outside the doorway and turns its head to the light;
  at the doorway the stalk's stooped pose, breathing, the head searching; the headlight's last surge on it as it
  stops; a softer beam centre; the journal written large; dust in front of the eyes at the hit; on foot the legs are
  hidden (the seated knees showed when looking down).
- Warmth (Part2Character): chilled out of the wreck, falling in the night (slower under a roof), back by a lit fire;
  the cold at the edges of the view and a shiver. The shed's pot-belly stove (make_wake_props.py) and matches;
  M_FireGlow for its window.
- The doorway is a choice: the beam held on it, it lunges; the light off and still in the dark, it loses the player
  and goes. Indoors in the dark the player can only be seen very near.
- The camp: a timber mine headframe over the old shaft (make_town.py headframe()); icicles off every eave; the shed's
  boards with real gaps (moonlight through them).
- The hunt (HuskHunter): the two-brain design above; stalk 9-15 m, the stare in the beam (it comes on slowly through the
  light and stands at ~12 m, its head jerking, its eyes never off the player), the charge, the search, the retreat, the
  catch (its face brought to the eyes, sharp, then black, the checkpoint). It walks on the camp's own snow (every
  surface down a trace, the nearest its feet). Judge round 1: 3/10 (the stare too far and not in the beam, the catch a
  blur, the chase all snow, the car's headlight streak, the hand a mitten, flat snow). Fixed since: the beam follows the
  gaze (the flashlight is aimed at what the eyes look at), the slow approach in the light, the sharp catch, a look back
  while running, the car's headlight dies 9 s into play (its battery: the last light at the bottom goes out), the hand
  held so the barrel and fingers read.
- The story's first beats (Part2Story): objectives, the player's captions, use (E) and reading; the first sighting down
  the street (it stops and turns its head to the player); her journal in the tool shed (she survived the fall and walked
  down: the journal moves from her truck's glovebox to the shed, where she sheltered); the bang and the hunt after it.
- Footprints (tools/make_footprints.py, Scripts/import_prints.py): the player's boots and the husk's long bare feet
  pressed into the snow as decals; the camp's ground in the real snow scan.
- Handover from the wake fixed: the eyes now come from where the wake last put them (the director's seat pose had
  already moved the camera back into the car that frame), the body stands on the snow under them, and the view stays
  on the player (the cutscene camera auto-activated itself back). Test autopilot: `-p2walk`.
