# Part 2's wake in the wreck: references and what they teach

The owner approved the plan (six beats, about 30 s, first person, no creature) and then said the unbuckling and the
flashlight grab don't look good: "use reference photos, videos, all of it". These are the references studied (study
only, never shipped) and the rules taken from them. Every round is scored by a blind judge (a reviewer that sees only
the frames and what should be happening) before the owner sees it; see the judge log below.

## References
- Military rollover trainers (the Army's HEAT trainer, the Marines', the Air Force's) and Mercedes' roll simulator:
  people hang upside down in their belts, then unbuckle and get out. Sources: army.mil (HEAT, Fort Rucker), Malmstrom
  AFB, Expert Reviews (Mercedes roll simulator), Art of Manliness ("how to survive a rollover crash"). The drill: brace a
  hand flat on the roof, take the body's weight off the belt with the arm, then release; lower yourself, don't drop.
- Rollover simulator footage from inside (Minnesota State Patrol, crash-test dummies, GoPro in the cage): loose things
  fly and end on the roof; light comes in through the windows in slabs.
- Photos of wrecked car interiors with broken side windows: tempered glass lies in thousands of small crumbs (5-9 mm,
  roughly cubic, faintly green, glinting), piled thick along the door it came from and thin elsewhere.

## Rules for the wake (from the references and the judge)
- Show the struggle, don't imply it: hanging, the chin tucks and the eyes go down the body to the buckle. The belt is
  pulled tight across the chest and the lap by the body's weight; the thumb on the red button; it won't release while
  the weight is on it; the braced arm pushes the body up; it clicks, and the belt is reeled away.
- Sell the gravity: the arms hang limp onto the roof before they're used; blood falls from the face onto the lining;
  one look out of the smashed side window shows the snow and the slope hanging upside down.
- The braced hand reads as a hand: flat, fingers spread, pressing; cold-lit by the moon, in focus.
- Light is motivated: the moon through the gone windows (a shaft across the lining, the window frame's shadow, the
  glass glinting); the dark inside stays dark; a mirror at night is dark, never a white slab.
- The camera is alive: the body sways in the belt, the head lolls, each press jolts it, the push-off lifts it, the
  landing hits hard; then lying on one side with the lining against the cheek, breathing.
- The driver wears what the game already gave them: black leather driving gloves, the red flannel shirt, jeans, boots.

## Judge log
| Round | Version | Score | Main points |
|---|---|---|---|
| 1 | v1 (0-11.5 s, the unbuckling) | 3/10 | the buckle struggle never framed; nothing sells upside down; the hand a waxy placeholder; the car never established; flat light, cubes for glass, a white mirror; a lifeless camera; the drop doesn't read |
| 2 | clothes, belt, window look (0-9.5 s) | 3/10 | the window's upside-down trees work; the sleeve ends in an empty tube at the buckle (no hand); the buckle beat static; no drop; the brace a fist; blood never seen falling; glass reads as bubbles; too dark and blurred; the letter pulls the eye |
| 3 | torso back, lining guard, arm to the buckle (0-12.5 s) | 3/10 | the window still the best frame; the hand grabbed the rear-view mirror (it hangs ~10 cm off the lining upside down, and the flashlight lay under it); the buckle shot looked upright (the letter still on the seat); buckle too small, no visible fight or push; the drop murky; glass read as gravel; a black notch on the hand (the blood decal printing onto it); the head turn to the lap too fast; the camera dead while propped; small caption |

## What the rounds taught (fixes that stuck)
- The "empty sleeve" was the MetaHuman body itself: it was built wearing MetaHuman's default T-shirt and shorts, and the builder deletes the skin under clothes. Rebuilt without the outfit (Scripts/driver_strip_and_build.py), same as the creature's body.
- The head turns on the neck, not about the eyes. The eyes take up to 35 degrees of a look and the head the rest (at most 25 degrees while belted), so a look down sees the chest from outside.
- Measure against the real car (tools/blender/car_exterior.py seat(): cushion top 50.5, inboard bolster to y 26 / z 54.5; console from x 18). The buckle was inside the bolster. Hanging, the tight lap belt drags it up against the side of the waist, where it can be seen past the belly.
- The reaching elbow goes back and out, never across the eyes' line. Lying on the side, the top arm's elbow goes up and back. Blend elbow directions; never switch them.
- Fingers pressed on the lining straighten onto it, each turned up at its knuckle (DriverArmsFree.cpp). Only what that can't clear lifts the hand.
- The body takes no decals: the lining's blood decals printed onto the skin.
- Upside down, the rear-view mirror hangs just off the lining. Nothing the hands need may lie under it.

## Owner's notes (beyond the judge)
- The hands clip through the floor (the roof lining). Every fingertip and knuckle is measured against the lining each frame; none may go below it. Done: DriverArms bFloorGuard, logged in WakeLog as "through the lining: before -> after".
- The hand doesn't grab the flashlight normally. Rebuild the grab from reference footage of a real hand picking a flashlight up off a surface: reach, open, settle around it, close, lift. Done:
  - the hand rests on the lining after the drop;
  - a minimum-jerk arc with the fingers opened wider than the flashlight (FFreeHand::Open);
  - down from just above, the fingers part-closed round its sides;
  - on the lift, they close fully and the flashlight settles from where it lay into the grip (no jump).
