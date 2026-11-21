# Blender lessons (read before every 3D job)

One line each, concrete and checkable. **[repeated]** = broken again; move it to the top of its section.

## Owner's words (strongest lessons)
- "Ending isn't good enough you have to put detail into having the hangs and arms look real and look normal"
  (owner, about the ending's first-person hands). Meaning: the hands must read as real human hands at first glance.
  That means real proportions, knuckles, creases and nails, skin that looks like skin, and natural finger poses.
  No tubes or mittens.
- "Your going to have to do this for the whole part 2 so I suggest you find the proper tools to do it": Part 2 is
  realistic first-person. Build the tools once (this folder) and reuse them for everything.

## The player's look carries over from Part 1 (owner: "Your going to have multiple sleeve Colors and skin Colors because this continues off a game where you customized your pixel character")
- Everything first-person (hands, arms, sleeves, later boots and reflections) must work for every character-creator
  option in g2d/custom.js, read from the save.
- Skin: all 7 tones, #f6d8c0 to #5e3a26. Dark tones need a specular sheen. Flush contrast scales with tone.
  Nails are a lighter version of the tone, never grey.
- Shirt: 12 colours and 4 patterns (plain, plaid, stripes, dots), at a real fabric scale.
- Sleeve construction follows the outfit:
  - shirt, openshirt: woven, with a buttoned cuff.
  - sweater, turtleneck, cardigan, hoodie: knit, with a ribbed cuff.
  - jacket: a stiff hem.
  - longcoat: thick wool.
  - outfits with no sleeve to the wrist (tee, tank, vest, overalls, skirt, dress): a winter coat in the `extra` colour,
    because it's a blizzard.
- The ring shows only when married.
- Every round's proof includes a 7-tone sheet and a sleeve-type sheet, not just one look.

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

## Props (mechanical, from the period)
- An overturned vehicle rests on three points (its crushed roof and the hood's front edge, or the bed's tail): set on its roof alone it floats; tip it until a second edge is in the snow.
- A car's front is mostly grille and lamps in bezels with painted panels between, framed in chrome; one chrome plate over the whole front reads as a blank cream box.
- When a part looks wrong in the game, give each material slot a loud colour for one render (-p2truckdebug): it shows at once which part is which.
- Worn things (caps, hats, glasses) go on a character from that character's own joints (the face's eye bones in its reference pose, carried into the head bone's frame), not from hand-placed offsets: one rule fits any head.
- A watch cap seats with its cuff at the tops of the ears (about 3 cm above the eye line), its back lower than its brow (about 12 degrees); higher leaves a bald band at the temples once the hair is hidden under it.
- Model a period object by the parts that identify its type, not its overall silhouette: a tubular lantern is its tubes goosenecked into the top, its three-tier top and its collared barrel globe (r1 had a lantern outline and read only as "a lantern", 5/10).
- Every part joins something: a tube that stops in air beside a rim reads as a strap. Route connectors into the parts they feed (curves through bend() corners).
- Thin parts read as toys when they are thick: bands, straps and levers are flat steel 0.2-0.6 cm thick; build them flat (a wire scaled across its section, a thin band) and only 2-3 mm proud of what they bind.
- Flat rings (strip metal on edge) and wires are different parts: build bands as closed box-section lathes and wires as curves with a bevel; a wire for a ring reads wavy.
- Split firewood is a wedge, not a stick: a sector of the round (a half, third or quarter) with bark on the arc, two pale split faces meeting at the pith, and paler sawn end grain; three material slots. Square or polygonal sticks with one dark material read as "a featureless black box" in the hand at night.

## Snow
- Snow on a branch is a slab, not a pillow: a broad, nearly flat top, square shoulders, steep ragged sides with the widest a little below the top (a lip with a hard shadow line under it), cut in underneath, its ends broken off short. Smooth round pads with tapered ends read as "cotton balls".
- Break the surface with 3-D plane-wave noise at three scales (about 13 cm lumps, 5 cm chunks, 2 cm grain), scaled to the pad's size and stronger on the sides than the top; displace along the section's outward direction. Too much chunk noise (more than about 7% of the width) turns it into crumpled paper or styrofoam shards; keep the fine grain for the normal map.
- Sample the pad every 3.5-4 cm along the branch with 16-18 points round it, or the noise facets.
- Drifts against walls are sculpted meshes (highest at the wall, a soft crest, a long concave fall, wind ripples), never flat sloping quads: those read as "flat slabs with crisp straight edges".
- The edge of a ground patch laid over coarser terrain shows as a long straight dark line: put the edge far beyond where anyone walks and blend it down over several metres.

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

### 10 and 2 from the game eye (t353 r4, the coordinator's side-by-side with a real photo)
- **Thumbs lie flat along the rim.** A thumb aimed at the index's middle segment stands up too steeply and reads short.
  - Aim it along the rim: the target is about 2 cm beyond the index knuckle toward 12, on the driver face.
  - Weight the aim term and penalise MCP flexion over about 6 degrees, so the thumb lies flat and long and nearly
    tangent to the rim.
- **The forearms come in from low and outside, not straight up.** With the default pole the elbow sits under the
  wrist and the arms read as pillars.
  - A pole of (-1, -.55, .05) puts the elbow low and out, so the forearm crosses the screen at about 45 degrees.
  - Then re-search the hand's place for a flatter wrist (extension 25 or less) so the hand leans over the wheel.
- **Push the hand further over the rim** (knuckles 1.6 cm past the contact) so the index's first segment curls over
  the top.
- **Make the cuff about 1.25 times the wrist,** with fold heights about half of a casual shirt's. Wider cuffs read as
  puffy at game distance.

### The 10-and-2 pose as measurable targets (for posing any first-person arms, the MetaHuman ones included)
Measure from the game eye (the in-car camera), on SCREEN unless noted. These targets come from the owner's 10-and-2
photos and the blind judge's measurements over t353 rounds r4-r6.

| What | Target | Blender r6 (scene.py report) |
|---|---|---|
| Clock position of each hand | 10 and 2, about 60 degrees from 12; the left a little lower | ~62 and ~58 |
| Knuckle row vs the rim's projected tangent | within 15 degrees | 5-19 |
| Back-of-hand normal vs the eye ray (3D) | within 30-40 degrees, so the four knuckle bumps read; never edge-on | ~45-50 |
| Thumb (distal phalanx) vs the rim tangent | within 10-15 degrees; on the driver face; tip about 2 cm past the index knuckle toward 12; the pad touches the rim; the only digit on the driver side | 34-40 (missed: the CMC sits too far off the rim; fix first) |
| Fingers | a closed fist; index MCP ~45, PIP ~65, DIP ~25; middle, ring and pinky ~55-60 / 75-80 / 30-35; tips hidden behind the rim; no straight finger | fist closed all-joints-together |
| Forearm from horizontal | left 35-45 (in low from outside); right 70-80 | ~48 / ~79 |
| Wrist | right nearly straight with slight extension; left bent ~25 toward the pinky; no break wider than ~10 on screen | left 53 in 3D, right 34 |
| Cuff | at the wrist bone, less than 3 cm of bare forearm; cuff about 1.25x the wrist width; hem band and bunched folds | sleeve starts 0-1.2 cm above the wrist |
| Two hands | different roll, wrist angle and curl; never mirrored | separate places, poles and closure |

### Grip details the judge checks (t353 r4 -> r5)
- **The index curls like the other fingers** (MCP about 45, PIP about 65, DIP about 25), with its tip behind the rim.
  - A sequential cascade (MCP to contact, then PIP, then DIP) leaves a finger that lands along the rim straight. Two
    straight digits beside the thumb read as a "gun grip".
  - Close a fist with all three joints together (about 1 : 1.4 : .5), then let the distal joints settle.
- **The knuckle line runs along the rim and the wrist looks straight, measured on SCREEN from the game camera.**
  - In 3D the hand can be yawed 40-45 degrees and still read as along the rim from the eye.
  - Search the place with screen-space measures:
    - the angle between the knuckle row and the rim's projected tangent;
    - the wrist angle between the projected forearm and hand;
    - the forearm's angle from horizontal;
    - the hand's clock position.
  - Give each side its own elbow pole: the left forearm slants in from outside, the right rises nearly upright.
- **In-game parity, every round.** Render the same pose, camera and light in Blender and on the three.js page, side by
  side (parity.png).
  - The game version scored 2/10 ("mitten") while Blender scored 4/10. The page had lost the relief to decimation and
    a weak normal map, and its seams and light were wrong.
  - Hands are the hero object: about 15k tris per arm with most of the relief in the mesh, full-strength normals, and
    texture islands bled outward so mips never mix.

### Reading as a person from the game eye (t353 r5 -> r6)
- **Measure the forearm angle and the cuff height on SCREEN.**
  - Forearms that rise straight up read as pillars, with the hands perched on top.
  - The left forearm should cross the screen at about 35-45 degrees, coming in low from outside; the right rises at
    about 70-80 degrees.
  - Every cuff comes down to the wrist bone, so less than 3 cm of bare forearm shows. If the sleeve starts higher, a
    coat sleeve disappears off the frame entirely.
- **The back of the hand faces the eye**, its normal within about 30-40 degrees of the eye ray.
  - If it faces outward, the knuckle row reads edge-on and the thumbnail becomes the biggest lit thing.
  - Require it in the placement search, along with the screen measures.
- **In-game relief must never exceed Blender's.**
  - Mesh relief plus a full-strength normal map plus specular reads as carved rope tendons and an old, wasted hand;
    dark tones look like varnished wood.
  - Keep the relief soft, the normals at about .65 and the specular capped. Tendons in a fist lie nearly flush.
- **Two veins and an arch behind the knuckles frame a rectangle** that reads as a plate under the skin. Leave the arch
  out.
- **Raise nails clear of the decimated game skin.** If the skin pokes through, it draws a dark line across the nail.
- **The post pass's colour fringe draws a 1-px orange outline** round the hands and rim. Keep the chromatic
  aberration tiny.

### One arm for every character (owner: "multiple sleeve Colors and skin Colors ... you customized your pixel character")
- **Every skin tone in the creator must read as skin.**
  - Derive the colours from the tone, never from fixed tints:
    - flush multiplies the tone itself;
    - the nails are the tone made lighter and pinker, with a paler free edge;
    - darker tones get lower roughness, most on the knuckles.
- **The sleeve follows the outfit,** using one topology with morph targets per type:
  - shirt: woven, with a buttoned cuff band;
  - sweater, turtleneck and cardigan: knit, with a rib cuff gathered at the wrist;
  - hoodie: thicker knit;
  - jacket: canvas, with a turned hem and a double stitch;
  - long coat: wide wool, ending above the wrist bone;
  - bare-armed outfits get the winter coat in the character's `extra` colour.
  - The shader adds each type's surface (twill, rib, stockinette, canvas, felt) and roughness.
  - The morphs are sparse in the GLB, about 90 KB for four types.
- **Proof every option on the game page itself** (tones.png, sleeves.png), not in Blender. The page is what the
  player sees.

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
  - For 10 and 2 in the p2 cab this gives, in rim terms: back of the hand 50-55 degrees from outward toward the
    driver, the hand yawed 42-45 degrees toward twelve (the rim then runs diagonally from the heel to the index base),
    rolled 10-15 degrees. That holds wrist extension under 30 and tilts the wrist toward the pinky.
  - Each hand is placed by searching: a coarse grid over the place, filtered by the wrist limits, then the finger
    cascade on the best 60, ranked by how many fingers wrap and how squarely the back of the hand faces the eye.
- **The thumb at 10 and 2 is solved by IK to a target, not posed by hand.**
  - The target sits on the rim's driver face, at the side of the index finger's middle segment, aimed along the rim
    toward twelve.
  - The cost adds three terms: the thumb's nail facing the eye; the IP joint kept near 10 degrees; and a ban on
    hooking round the rim's far side.
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
