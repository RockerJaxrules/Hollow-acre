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
- Proportions fail before materials: write the real measurements in cm in the plan, then check the sizes printed
  on the check sheet.
- Every edge gets a bevel or rounding, since real objects catch light on their edges.
- Use three layers of variation on every surface (colour blotches, roughness, fine bump). One flat colour reads as
  plastic or CG.
- Avoid perfect symmetry and perfectly straight organic lines (vary by 2-5%).
- Light must be physically plausible (AgX, real-ish strengths), with contact shadows where things touch.

## Skin
- Skin = random-walk-skin SSS: radius (1.0, 0.35, 0.2) so red scatters furthest, scale about 4 mm, roughness about
  0.45. Add a faint coat (0.06) for oil and pores as a fine bump (noise scale about 900 at 0.08). Tested: it reads as
  skin on a plain capsule.
- Skin colour varies: redder at knuckles, creases and fingertips (the AO or flush mix in `mats.skin`).

## Hands and arms (anatomy to build to)
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
