# Lessons (read before drawing; add to after every critique)

Each line is something an attempt taught. Newest and repeated mistakes go to the top of their section.

## From the owner (strongest)

- "too gritty" / "over gritty": no speckle, no single-pixel noise as texture, no checkerboard dither. Wear is drawn as
  shapes (a patch, a streak, a moss line), never as sprinkled pixels.
- "too close to Stardew" / "make it darker, more detail, more like before": moodier values, more hand detail, not candy.
- "the old art was more detailed, more realistic... feels less gritty, less round, too fake": forms must read as round
  volumes lit from one side, with detail placed on purpose.
- "houses don't have the two-side roof anymore" / "more modern houses": hip and side-gable roofs, siding, dormers.
- "I don't want you to use already available assets because someone else owns this": draw every pixel; study outside
  art only by reading or measuring it.
- "they both looked bad" (the maple in the game and my bundle maple): matching the old art is not the bar; beat it.
- "make it look like hand-placed human-made art": the LPC sheet is the quality target; drawn, not generated.
- "the angle feels a bit off" (maple from a 45-degree camera): 45 degrees looks down like a drone, the trunk shrinks and
  the root flare shows as a disc. Use the 30-degree camera (blockout `elev` 30): trees stand up, the ground is
  foreshortened, as in LPC and Stardew.
- "this is better but trunk needs a bit more detail but this is very good" (maple v2): the 3D blockout + hand finish
  is the approved method. A trunk needs bark grooves, a lit edge, a knot and roots, not one flat colour.
- "you have to do this for everything now": every sprite goes through the blockout + hand finish.
- "props are not good enough and the human sprites look very bad so far" / "do you need some practise for the props
  and other stuff first": the 3D props and the 3D people did not beat the drawn ones. Nothing replaces existing art
  until it clearly beats it side by side. Practise first (drills), show the owner, then replace.
- "maybe a bit more improvement" (v4): leaf clumps through the crown (a second, finer lump octave), small sunlit
  highlights, fallen leaves round the foot (it's autumn).

## Trees and foliage

- [maple 3D v3] Texture tufts placed on a fixed step ((x+3y) % 4) made diagonal hatching across the crown. Place leaf
  shapes at hashed, uneven spacing with a no-touch radius.
- [maple 3D v1-v2] Lone specks and 1-3 px rings ("eyes") come from small dips in the lumpy surface; melt every
  cluster under 8 px into its surroundings before adding texture.
- [maple 3D v5] A fine lump octave doubles the self-shadow: the whole lower crown went plum. Give leaves an ambient
  floor (.14) and weaker self-shadow (.5) so only the bottom edge is deep.
- [maple 3D v8] grid.py's outline reads colours, not letters: two letters with one colour confuse it (the crown's
  lit areas got outlined). Every letter needs its own colour; fallen leaves get duller ones.
- [pines] Wide, flat tiers (height half the radius) render as one smooth striped cone from a raised camera: the back
  of each tier fills the silhouette. Tiers must be steep (height about 1.25 x radius), with drooping tip blobs round
  each hem and a strong self-shadow (shade .85) so each skirt darkens the one below.
- [rocks] A lumpy ellipsoid reads as an egg. Slice flat faces off it (a flat-ish top and 5 side planes): toon bands
  then give each face one flat colour, chunky and LPC-like.
- [apples] 2x2 fruit reads as berries at 1x; apples need 3x3 with a lit top-left and a stalk.
- [tall trees] A cast-shadow light at 25 degrees throws a birch's crown shadow far from its trunk; keep the shadow
  light steep (-.13, 1, -.12) so the shadow sits under the tree, a little down-right.
- What worked (owner: "very good"): crown from 7 overlapping lumpy spheres, 30-degree camera, toon bands, leaf tips
  and notches on the silhouette at uneven spacing, shadow cast down-right by a separate steeper shadow light.

- [maple 4/10] A crown that is one smooth ellipse with bumps stuck on reads as a ball or a pumpkin, not a tree. Build
  3-5 overlapping bundles, each lit top-left and dark bottom-right, with notched edges.
- [maple 4/10] Never tile one texture stamp across the interior on a lattice: it shows up as horizontal bands and reads
  as made by a program. Texture goes on the borders between light and shade, interior stays quiet.
- [maple 4/10] One big highlight disc is wrong: use 8-10 small highlight patches (3-6 px) on the upper half.
- [maple 4/10, 5/10] The trunk must reach down into its own shadow and up under the crown; a gap of even 1-2 px makes the
  tree hover. Cast the shadow down-right, not centred.
- [maple 4/10] For this game the palette must be darker and less saturated than a sunny farm: shades sink toward plum,
  the highlight stays below about 85% value.
- [maple 5/10] Identical bundles stacked in a lattice read as bread rolls / grapes. Vary bundle size and shape (2-3
  hand-drawn variants), overlap them tightly, step the back ones darker.
- [maple 5/10] Crown 114 px wide on a 9 px trunk reads as a lollipop: trunk about 1/5 of the crown's width, with flare.
- [maple v6, 518 stray pixels] Many tiny clusters over the whole crown is noise. Bigger clusters, fewer of them.
- What worked: bundles with a lit rim / body / shade, interlocking leaves across the light/shade border, the deepest
  colour only along the bottom edge (critic: "clean clusters", "hue-shifted ramp suits the mood").
- What worked: filled leaf clumps read as foliage; thin V-line tufts read as stripes.
- What worked: a 2x2-cell draft makes the whole thing look upscaled (mixed pixel size); use the 2x2 leaf only as edge
  texture.

## Props (small objects, 20-40 px) [owner: "not good enough"]

- [props v1] 3D toon shading alone gives plastic toys at this size: the drawn props win on hand detail. Every prop
  needs a material pass after the render: wood = dark board seams, grain streaks, nail heads; metal = a bright rim
  line and rivets; stone = cracks and chips; cloth = folds and a tie.
- [props v1] The drawn props have more contrast: near-black outline and inner lines, top face clearly lighter than the
  front, the shadow side clearly darker. The 3D ones came out mid-grey and soft.
- [props v1] Signs, labels and plaques (MARSH, PHONE, the memorial plate) are what make a prop belong to this town;
  never lose them.
- [props v1] Depth along z is foreshortened by half at 30 degrees but the game's ground is not: anything that has to
  span tiles along z (vertical fences) must be modelled twice as long.

- [drill 12 v1-v3] Props are drawn nearly face-on with a thin top: camera 18 degrees, not the world's 30, or the lid
  takes over. Light them from the front-left (-.55, .85, .85) or the fronts go dark. Barrels are bellied (an
  ellipsoid cut flat top and bottom), not cans. One streak in nine pixels is texture; one in three is noise.

## People (48x64) [owner: "look very bad so far"]

- [chars v1] At the world's 30-degree camera the cap and hair cover the face; people use a near face-on camera (~12).
- [chars v1-v4] A 3D head with painted eyes reads as a doll; the drawn chibi wins on crisp shapes: outlined hair
  clumps with shine bands, clothing seams, belts and buttons, a defined jaw. Body proportions and the face must be
  drilled on their own before any character is redone.

## Outlines, light, colour

- Outline round the whole object once, a darker version of its own colour, lighter on the lit top-left; never an outline
  round every internal bundle (it reads as cut-out pieces).
- Light from the top, slightly left (LPC: keep it mostly centre).
- Ramps: shades toward purple, lights toward yellow, no pure colours. About 6 colours per 32x32 area (measured on LPC).

## Process

- Silhouette first, then masses, then detail. Skipping straight to clusters produced polka-dot bubbles.
- Placing clusters along mathematical lines (perimeters, boundaries) looks mechanical, like piped icing.
