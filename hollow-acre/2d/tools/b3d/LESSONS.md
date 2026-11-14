# Blender lessons (read before every 3D job)

One line each, concrete and checkable. **[repeated]** = broken again; move it to the top of its section.

## Owner's words (strongest lessons)
- "Ending isn't good enough you have to put detail into having the hangs and arms look real and look normal"
  (owner, about the ending's first-person hands). Meaning: the hands must read as real human hands at first glance.
  That means real proportions, knuckles, creases and nails, skin that looks like skin, and natural finger poses.
  No tubes or mittens.
- "Your going to have to do this for the whole part 2 so I suggest you find the proper tools to do it": Part 2 is
  realistic first-person. Build the tools once (this folder) and reuse them for everything.

## Blender 5.2 API traps (check with api.py)
- Noise, Wave, Voronoi and similar texture outputs are named `Factor`, not `Fac`.
- `ShaderNodeMix` has several sockets with the same name (`A`, `B`, `Result` as float, vector and colour).
  `inputs['A']` gives the float one. Use `mats.sock(node.inputs, 'A', 'RGBA')`.
- `material.use_nodes` is deprecated (it prints a warning) but still needed on new materials. Wrap it in try.
- EEVEE fails headless (EGL_BAD_MATCH). Use `BLENDER_WORKBENCH` or `CYCLES` with `device='CPU'`.
- Principled skin: `subsurface_method='RANDOM_WALK_SKIN'`. The inputs are `Subsurface Weight`, `Subsurface Radius`
  and `Subsurface Scale` (in metres).

## Realism (general)
- Judge renders need the scene's real light. A night cab means dim, warm, local light, cast shadows, a dark window
  with night blue, and darker hands. A studio-lit grey box reads as daytime and gets judged as fake.
- Keep value separation between a dark object and its background. A black rim on a black dash disappears, and
  whatever pokes past it, such as fingertips, looks detached.
- Proportions fail before materials: write the real measurements in cm in the plan, then check the sizes printed
  on the check sheet.
- Every edge gets a bevel or rounding, since real objects catch light on their edges.
- Use three layers of variation on every surface (colour blotches, roughness, fine bump). One flat colour reads as
  plastic or CG.
- Avoid perfect symmetry and perfectly straight organic lines (vary by 2-5%).
- Light must be physically plausible (AgX, real-ish strengths), with contact shadows where things touch.

## Skin
- Skin blotch and flush contrast scales with tone. Hue-shift the tone itself (redder, slightly darker) rather than
  mixing toward a fixed pink, and lower the amount on darker skin. On dark skin, a fixed flush reads as rust or
  bruises.
- Skin = random-walk-skin SSS: radius (1.0, 0.35, 0.2) so red scatters furthest, scale about 4 mm, roughness about
  0.45. Add a faint coat (0.06) for oil and pores as a fine bump (noise scale about 900 at 0.08). Tested: it reads as
  skin on a plain capsule.
- Skin colour varies: redder at knuckles, creases and fingertips (the AO or flush mix in `mats.skin`).

## Hands and arms (anatomy to build to)
### Build hands skeleton-first, and judge the REST pose before any grip (owner after r3: "Thumbs don't work like that find a way to do it right")
- **[repeated] Root cause in r1-r3:** the thumb was attached to the UNDERSIDE of the palm. In the flat rest pose it
  hung straight down like a hook. Every grip built on that base looked wrong however it was posed.
  - The rest pose was never judged, only the grip.
  - Always render and judge the flat rest pose first (`shape_rest`). Fix it there before posing anything.
- **Skeleton first, skin second.**
  - Place real bones (joint centres and axes) using the numbers below. Generate or fit the skin around them.
  - Pose only by rotating real joints within their real limits (IK to contact points).
  - Never shape a pose by moving cage vertices.
- **Thumb ray:** about 93 mm in total (metacarpal plus two phalanges; X-ray study of 80 adults). The thumb metacarpal is the
  shortest metacarpal, about 4.4-4.8 cm.
- **The thumb's base joint (CMC) sits at the wrist** on the radial side (the trapezium), level with the bases of the
  other metacarpals, NOT out in the palm.
  - Its rest orientation relative to the 3rd metacarpal is about 48° flexion (toward the palm side), 38° abduction (away
    from the index) and 80° pronation (rolled) (Cooney 1981).
  - So in a relaxed hand the thumb sits slightly in FRONT of the palm plane, angled away from the index finger, and
    turned on its side. Its pad faces the index side; its nail faces sideways and outward.
- **Rest-pose checks** (all must pass on `shape_rest`, flat hand palm-down):
  - The thumb lies roughly level with the palm, no more than about 2 cm below the palm plane. It never hangs down.
  - The thumb axis is about 30-45° from the index finger.
  - The thumb nail plane is about 60-90° from the finger nails.
  - The web between thumb and index is a smooth curved fold.
  - The thumb's free part begins about halfway between the wrist crease and the index knuckle, not at the knuckle.
  - The thenar bulge runs from the wrist to the thumb's base.

### The thumb (owner: "The thumbs look very weird now you should probably research how humans hands work", t353 r2)
- **The thumb is not a finger.**
  - It has only TWO visible segments: proximal and distal. Its third bone (the metacarpal) is inside the palm.
  - The visible thumb is shorter (about 6 cm free) and wider (about 2.2-2.5 cm) than the fingers.
  - Its tip segment is broad, with a wider, shorter nail.
  - A thumb built like the fingers (three equal segments, same width) reads as a sixth finger.
- **The thumb is rotated about 90° from the fingers.** Its nail faces sideways, roughly at right angles to the finger
  nails. If the thumb nail faces the same way as the finger nails, it is wrong.
- **The thumb grows from low on the hand, near the wrist, out of a thick muscle pad** (the thenar eminence, the ball
  of the thumb). It never sprouts from the side of the palm halfway up.
  - Between the thumb and the index there is a skin web (the first web space), a smooth triangular fold seen from
    the back.
  - Without the pad and the web, the thumb looks stuck on.
- **Joint ranges** (healthy adults, 100-person study):
  - IP flexion about 80-90°.
  - MCP flexion about 45-70°. It is a hinge only.
  - The base joint (CMC, a saddle) does the swinging and rotating: abduction about 60°, plus opposition, which turns
    the thumb to face the fingertips.
  - Never bend MCP or IP sideways.
- **When adducted** (resting alongside the hand), the thumb tip reaches about the middle of the index finger's
  first segment.

### THE DRIVING POSE IS 10 AND 2 (owner: "None of these hands are good look up 10 and 2")
Studied three driver's-eye photos of hands at 10 and 2 (openly licensed, scratchpad only, never committed or copied).
- **Each hand is a relaxed fist closed around the rim.**
  - The rim passes diagonally through the hand: in at the pinky side (low and outer), out between the thumb and
    index (high and inner).
  - One hand spans about 1/6 of the rim, about 9 cm.
- **The driver sees the BACK of each hand:**
  - the four knuckle bumps in a row, roughly parallel to the rim;
  - the fingers' middle segments curling over and around the far (dash) side, with the fingertips hidden behind the rim.
  - The fingers sit side by side; the index is a little apart and highest.
- **The thumb lies ALONG the top and driver face of the rim, pointing up the rim toward 12 o'clock.**
  - It is nearly straight (IP slightly bent), with its nail visible to the driver.
  - Its tip ends near the side of the index finger's middle segment, so thumb and index make a closed loop around the rim.
  - It is visible, but it is part of the fist, not a separate peg.
- **Wrist and arm:**
  - The wrist is slightly extended and tilted toward the pinky.
  - The forearm comes up from below and outside.
  - The sleeve ends at or above the wrist.
- **The two hands differ:** a little different height, curl and wrist angle. Never mirror them.

### Other casual grips (for other scenes, not the default driving pose)
Studied openly licensed photos: three taken from the driver's seat and one from the dash. They stay in the scratchpad
and are never committed or shipped.
- **From the driver's eye, the BACK of the hand dominates:** the knuckle ridge as separate bumps, tendons, a few veins,
  and wrinkled skin at the wrist.
  - The THUMB IS MOSTLY HIDDEN. It tucks under or behind the rim on the driver side, or lies low near the spoke, and
    shows only a short tip, if anything.
  - A thumb that is the most visible part of the hand is wrong (r1-r3).
- **Hand at the top of the wheel (about 1 o'clock):** the hand hooks OVER the rim.
  - The back of the hand faces up and toward the driver, with the knuckles on top.
  - The fingers curl over and down the far (dash) side, with the rim sitting in the middle segments of the fingers,
    not the palm.
  - The wrist is nearly straight, and the thumb wraps beneath the rim, out of sight.
- **Relaxed hand at 9 o'clock** (a night drive):
  - The palm and finger bases rest against the rim's outer and driver side.
  - The fingers drape loosely over the rim toward the hub, slightly curved and slightly apart, with their backs to
    the driver.
  - The thumb sits low, pointing toward the spoke, mostly behind the other fingers.
- **Relaxed drivers don't clench.** The fingers are gently curved and not identical; one hand is often looser than the
  other, and the two hands are at different clock positions.
- **The sleeve is loose,** with a soft, wide cuff and folds, and covers part of the wrist.

### Placing each hand on the wheel (t353 r4: photo-matched grips)
- **Check the reach before choosing a pose.** In the p2 cab the rim is about 60 cm from the shoulder and the arm is
  56 cm, so the forearm points almost straight forward.
  - A hand whose back faces the driver would then need about 90 degrees of wrist extension, which no wrist has.
  - Search the hand's orientation against the IK forearm, inside wrist limits (extension 30 or less, deviation 25 or
    less). Keep the solution that turns the back of the hand most toward the eye.
  - The relaxed left hand that came out of this: about twenty past nine, yawed 40 degrees toward twelve, fingers
    drooped 30 degrees toward the dash.
- **Keep the knuckle line within about 20 degrees of the rim** for a hook grip, so all four fingers wrap.
  - At 45 degrees (a diagonal grip) the index finger lies along the rim and cannot close, while the pinky has to close
    70 degrees to reach it. Two fingers do the gripping and the index points like a gun.
- **Seat a hand by sliding it along its back-of-hand normal** until the palm and finger bases just touch the rim
  (`scene.seat`). Never hand-tune the height.
- **A finger lying along the rim cannot flex into it.** Lift it first (MCP hyperextension up to 25 degrees), then
  close the next joints.
- **Pose the thumb by IK, but bind it halfway between the working poses.**
  - Moving a thumb 40-55 degrees from its bind folds the web between the thumb and the index into a hard crease.
  - Bound halfway, each side moves it only about 20 degrees.
  - Keep the anatomical rest thumb for the rest-pose check; the bind is only for skinning.
- **Nails: cast the rays from just above the nail bed** (about 1.5 cm), not from 3 cm.
  - A flexed bind thumb sits under the fingers. A ray from far away catches another finger's skin and leaves a nail
    vertex there, which becomes a 4 cm spike when posed.
- **When the two hands hold the rim differently, bake AO without the rim.**
  - Do the rim's shadow and contact darkening live in the shader instead.
  - The rim is a torus that looks the same however the wheel turns, so it is cheap to sphere-trace per light.
- **Judge the thumb from the game eye, zoomed** (same position, narrow field of view).
  - A thumb tucked under the rim at one o'clock shows in a close orbit view but is hidden in the game frame.
  - The game frame is the one that counts.

### Gripping a steering wheel (driver guidance: NHTSA, driving schools)
- The fingers wrap around the OUTSIDE of the rim. The thumbs rest ALONG the rim's driver-facing face, pointing up
  along the rim, on top of it, never hooked around the inside of the ring.
  - The judge's r1 advice to hook the thumb over the inner edge was wrong. Thumbs hooked inside break in an airbag
    deployment, and instructors teach against it.
- Positions: 9-and-3 is the modern standard (10-and-2 is older). On long drives a relaxed driver may sit at 8-and-4.
  The two hands are never mirror-identical.
- From the driver's seat you see:
  - the back of each hand, angled outward;
  - the knuckle ridge;
  - the thumb lying along the rim with its side or nail toward you;
  - the fingertips mostly hidden behind the rim.
- A cylindrical power grip touches the rim at 4-5 discrete spots: the fingertip pads and the base of the fingers.
  Not one continuous smear.
- The palm doesn't need to touch.
- The thumb's pad presses on the rim, so it flattens slightly.
- Never mirror the second hand. Pose it on its own: a different place on the rim, a different thumb, a different
  curl and wrist angle. Identical mirrored hands read as fake at once (t353 r1, 4/10).
- Thumbs must bend and flatten on contact. Give MCP and IP real flexion (about 15° and 30°) and sink the pad 2-3 mm
  into what it holds. A straight, constant-width thumb reads as a peg.
- Cuffs need a hem band (about 1.5 cm) and 3-5 bunched folds where the sleeve is pushed up. The opening should be
  about 1.3x the forearm width and follow its oval, with creases at a bent elbow. A plain round tube reads as a clay
  pipe.
- Back-of-hand detail goes in geometry, not only in the normal map: knuckle heads, tendons fanning out to each
  knuckle, the wrist bone on the pinky side, PIP wrinkles, and veins as a thin branching network (not broad smears).
- Never use regular sine waves for skin texture. They show as diagonal streaks. Use noise, or nothing.
- Keep small gaps between curled fingers where they cross a bar, or they merge into one lump.
- Adult male hand: about 19 cm from the wrist crease to the middle fingertip. About 8.5-9 cm wide across the
  knuckles. Palm length is about the same as the middle finger length.
- Finger segments, from the knuckle outward: about 1 : 0.6 : 0.45. Fingers taper. Each finger is about 1.8-2 cm wide
  at the base.
- Knuckle line is an arc (middle knuckle highest and furthest). Fingertip line is also an arc. Ring and index are
  nearly equal in length. The pinky tip reaches about the last crease of the ring finger.
- Thumb: it starts at the wrist (not the palm's side), about 6 cm long when free, and turns about 45-90° from the
  palm plane.
- Nails: about half the length of the last segment, slightly curved, with a lighter free edge. Add creases at every
  joint on the palm side and wrinkles over the knuckles on the back.
- Back of hand: tendons fan out from the wrist to each knuckle. Add a few veins (curves under the skin, slight bump).
- Relaxed or gripping pose: fingers curl more from index to pinky (the "finger cascade"). Never all fingers at the
  same angle. On a wheel, the thumb wraps the rim's inside or front and the knuckles whiten slightly.
- Forearm: about 25-27 cm. About 6 cm wide at the wrist, widening to 9-10 cm near the elbow. Flatter on the palm side.
  The wrist bone shows on the pinky side.
