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

## Judge
Each step: a contact sheet and a video from the player's eyes; a blind judge (a subagent that sees only the pictures
and the brief) scores it out of 10 against: scary, realistic, readable, beautiful, does it play. 7 to pass.

## Log
- Handover from the wake fixed: the eyes now come from where the wake last put them (the director's seat pose had
  already moved the camera back into the car that frame), the body stands on the snow under them, and the view stays
  on the player (the cutscene camera auto-activated itself back). Test autopilot: `-p2walk`.
