# Lessons (read before drawing; add to after every critique)

Each line is something an attempt taught. Newest and repeated mistakes go to the top of their section.

## From the owner (strongest)

- "your judge is being too kind on crops: that pumpkin does not look anywhere near good enough, most of them don't; compare
  them to the outside assets and you will see how bad ours look" (Nov 10): a judge's 6 against our OWN old art is not the
  bar. Calibrate against a professional reference (the outside-art set we replaced, used only to compare, never in the
  game): it counts as an 8, anything that looks amateur next to it is 5 at most. Measured: our crops ran lum 8-133 (mean
  75) where the reference runs 37-211 (mean 133), so "darker, moodier" had turned into mud. Crops keep a full value range;
  the game's lighting supplies the mood.
- "only use strict judge for crops, don't use it for anything else unless I say so" (Nov 10): the reference-calibrated
  strict judge (outside-art set = 8, amateur next to it = 5 at most) is for CROPS ONLY. Every other family keeps the
  normal blind judge: install at 6+ and preferred over the old art (owner-rule exceptions as before).
- "our turnip one is better, that's the only one though" (Nov 10, on the strict-palette set vs the reference): the turnip
  (spoon leaves with a pale midrib and crinkled edge, a domed purple shoulder, a curved purple cap with a taproot) is the
  standard to keep; pumpkin and corn still fall short of the reference and need reworking.
- "it needs to be almost on par with Stardew Valley when it comes to animations and textures and models": the QUALITY
  bar is Stardew Valley's finish (clean clusters, 3-4 tones a material, deliberate highlights and inner lines, keyed
  animation with bob, anticipation and follow-through). The LOOK stays this game's: darker, moodier, not candy.
- "too gritty" / "over gritty": no speckle, no single-pixel noise as texture, no checkerboard dither. Wear is drawn as
  shapes (a patch, a streak, a moss line), never as sprinkled pixels.
- "too close to Stardew" / "make it darker, more detail, more like before": moodier values, more hand detail, not candy.
- "all the young hot women are meant to have decent cleavage in their normal and chat sprites": Nell, June, Cora, Ida,
  Tess, Iris, Della, Maud and Caitlyn (all adults) show a low neckline with clearly visible cleavage in BOTH their walking
  sprites (front views) and their chat portraits. Nothing may cover it: necklaces sit at the base of the neck, collars,
  scarves and cardigans stay open. Draw it well: soft rounded forms and a soft V of shadow, never a hard streak that reads
  as a stain. Vera is 16 and stays modest; none for men, children or elders. Caitlyn's face stays exactly as it is.
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

## Buildings [self-check, all 53 rendered: the drawn ones win, none installed]

- [town v1] Roofs face the sky, so in the 3D render they catch the full light and go pale (slate turned powder blue,
  plum turned pink). Roofs need their own darker ramp or a lower light share; the drawn roofs stay dark and mossy.
- [town v1] The drawn buildings carry weathering as shapes (moss along eaves, stained stone, dark window glass); the
  3D ones are clean and bright and lose the horror mood. Glass must stay dark in the day, curtains muted.
- [town v1] A front gable on a cross-plan building (the town hall) hid the windows and the door behind a blank wall.
- [town v1] Small hand details (the church clock and tower door, the stone courses, the garage's dark door) are what
  the drawn buildings win on. Organic, soft forms (trees, bushes, rocks) are where the 3D method clearly wins.

## People (48x64) [owner: "look very bad so far"]

- [chars v1] At the world's 30-degree camera the cap and hair cover the face; people use a near face-on camera (~12).
- [chars v1-v4] A 3D head with painted eyes reads as a doll; the drawn chibi wins on crisp shapes: outlined hair
  clumps with shine bands, clothing seams, belts and buttons, a defined jaw. Body proportions and the face must be
  drilled on their own before any character is redone.

- [walk r1 5/10 vs 4/10 at the Stardew bar] The walk lives in the arms: each hand swings against its leg, clear of the
  hip (side: 5-6 px ahead and behind; front: the forward hand drops in front of the body and moves in, the back one
  rises and tucks). A run is not a fast walk: lean held through every frame, the free foot tucked up behind on the
  passing frames, bent arms pumping (fist at the chest, then driven back), a bigger stride and bob. Hair, hats and
  hair accessories follow the head a frame late. An idle needs a visible breath and a blink.

## Creatures in Blender (the Hollow, tools/blender/hollow3d.py) [blind judge rounds 1-14; installed at 6 vs 3]
- Walk weight: the bob must dip on both contacts. A head pitch that swings once per cycle (lag(...) * 7) moved the head
  as much as the bob and turned two dips into one; a nod of cos(4*pi*t) keeps both beats. The swinging hand should rise
  (reads from the front, where the swing is only depth), and the hem should follow a frame late (hem_bob = lift_prev).
- A 2 px cool lavender rim on light-facing edges is what holds a dark coat against night grass in greyscale.

- [hollow r1] A smooth toon render beside a drawn sprite looks bright and plain: match the old sprite's palette values
  first (sample them), then add mottle (noise into the toon factor) so cloth is never one flat colour.
- [hollow r1] Carve for real: a solidified shell, boolean cuts, a candle sphere inside. The face then glows in every
  view and the cut walls give a lit rim for free; floating face decals show as slivers from the side.
- [hollow r1 6/10] The pumpkin skin must sit below the glow: push it to brown and plum (highlight under ~70%), or the
  thing reads as a Halloween decoration and the carved light loses.
- [hollow r1] A scream needs a tall dark maw (a dark plate behind the mouth hole), not the same grin with arms up.
- [hollow r2] Side views: turn the head about 30 degrees to the viewer, or the face is a sliver on the pumpkin's edge.
- [hollow r2-r3] A spider crawl: one hunched hump of coat, the head low in front, four thick limbs arching up BEHIND
  the head (none crossing it), feet near the walk's ground line. Splay in x shows as height in side views
  (9.6 px per tile of depth), so keep feet within ~.55 tile of the centre line or they drop out of the frame.
- [hollow r3] 1-2 px buttons read as specks; tidy belts and buttons read as a robe. Tatter with shapes: torn hem strips
  of uneven length, rags off the cuffs, dark claw slits. Sloping, narrow shoulders for a starved body.
- [hollow r3] A cool rim on the lit (top-left) edge keeps a dark body visible against night grass.
- [hollow r21] Every finger at least 4 px inside its cell: a reach that touched the edge lost 6 to 4 against the same
  body kept inside the frame. Slide the figure back along its facing ('shift') rather than shortening the reach.
- [hollow r22] Side-on, a far limb that copies the near one reads as one tube drawn twice: hold it back, raise it 10+ px
  and shade it one step darker. Sleeves that ride up the reaching arm (taper to a knobbed elbow, flare to a torn cuff,
  a bare bony forearm) read as limbs; constant-width sleeves read as pipes with stripes.
- [hollow r22] A carved mouth must stay lit in side views: a dark maw seen edge-on reads as a rotten spot or a gag.
- [hollow r22 5/10] A lunge that moves only the arms is a reach. Drive the hips forward over a bent front knee, trail
  the back leg, and let the head arrive a beat late; tilting the torso about the hips alone swings the hem backward
  and the body reads as leaning away. Bone forearms, not wood: brown sticks vanish into the grass at 1x.
- [hollow r24-r25] Anticipation has to be big to read at 1x: a 4 px crouch scored a tie; leaning back over the rear
  foot, 6 px lower, head pulled back and both claws cocked up behind the coat scored 6 vs 5. Slide the wind-up frame
  forward so the cocked claws stay inside the cell.
- [judging] A judge given only 1x and 2x sheets could not see 2-3 px mouth changes and called it a tie; send an
  enlarged crop of the changed part beside the 1x sheet.

## Judging (Nov 9)
- Blind judges vary by about a point between rounds and lean toward whichever image is in slot b: in tree round 4 the
  same pair scored new 6 / old 5 with new as b and old 6 / new 5 with old as b. For a close call, judge both orders
  and treat a split as a tie. A real win holds in slot a too (the Hollow: 6 vs 3 with the new one in slot a).
- Build a judge sheet by splicing the changed rows into the INSTALLED sheet, never from an old render folder: a folder
  that still held a rejected scream and front lunge put them in front of the judge as if they were part of the change.
- Label a lineup from the sheet's own row order (N, W, S, E per clip): a cell I called "idle" was the walk facing
  away, and two judges reported the idle as "showing the back of the head".

## Animals (Nov 9: cows 4 -> 6, installed; dead deer 2 -> 5)
- Volume by surface normal, not by height bands: a barrel lit from the top-left with a cool lilac (white coat) or
  plum-brown (tan coat) shade reads as a body; bands parallel to the belly read as a table or a loaf.
- Legs read as legs when the far pair sits 4-5 px off the near pair and one step darker, the front leg has a knee
  proud at the front and the hind leg a hock proud at the back. 2 px offsets merge into one post.
- A limb routine that widens only along x draws a lying (horizontal) leg 1 px thick: draw thickness across the
  limb's direction.
- A dead animal reads by its head: a big ear is the strongest deer cue; laid flat it disappears. Legs stretched out
  horizontally (hind back, fore forward) say "lying on its side"; legs pointing down say "standing".
- A round wound reads as a target or an eye; a ragged tear along the flank reads as a wound.

## Ground tiles (grass, 8 versions, stuck at 5)
- Forest floor (Nov 10, five drafts): a carpet of separate leaves is confetti at 1x whatever the tones (v3, dense or
  sparse); raised litter "mats" with lit and shaded rims read as rugs or slabs (v2, v5b: boxy, "crates or dead birds");
  an even jittered grid of objects reads as "wallpaper with stickers" (v1). What scored best: well-made parts (two-tone
  pebbles lit top-left, filled tuft clumps, moss with a contact shadow) gathered into drifts of different sizes.
- A quiet in-tone layer (lying leaf shapes 3-6 px, one step off the soil, placed by Poisson disc with a varying spacing)
  makes bare ground read as a material without speckle; the same marks on an even spacing read as a lattice.
- Moss and grass are the brightest, most saturated things on a forest floor: keep them two steps down and olive, or they
  fight the trees.
- A brown floor under dark green pines separates them by hue; a green floor under them loses the trees.
- Drifts stretched sideways at similar heights line up into horizontal bands across the 2x2 repeat; drifts need different
  shapes (round, diagonal) and heights, and none may be one of a kind (forest v7 lost to v6 on this).
- Leaf colours go grey-olive under the game's forest light: the lit step of a leaf must be warmer and lighter than looks
  right on the bare tile.
- Water: anything floating (leaves) baked into the tile repeats as a stamp; float it as props by world position. Glints
  read best gathered in a few wind lanes with varied length and lean, not one staircase repeated.
- Tarmac: lone 1-2 px lighter chips on a spacing read as a dot lattice; wear is flat 3-8 px clusters in two close tones.
- Anything that appears once per tile marks the repeat: a blob, a dry mound, the biggest clump, a leaf pair. Every
  feature needs siblings of the same weight elsewhere in the tile, or must be too faint to find.
- Tuft rims round a tone patch read as rings or shrubby pads; smooth flat patches read as stains or shadows of
  nothing. Very faint zones from a wrapping low-frequency field were the least objectionable.
- Thin V tufts spread evenly read as speckle at 1x; filled clump shapes (a dome of blades, spiky top, dark root row,
  lit upper-left, short shadow) read as grass. Lone 2-4 px marks and leaves in a lawn read as specks or eyes.

## Portraits: check before installing (Nov 9)
- Before installing a re-rendered sheet, diff it cell by cell against the installed one and explain every changed
  pixel. PIL's getbbox() on an RGBA difference looks only at alpha, so colour changes report as "same": use
  getbbox(alpha_only=False) or numpy.
- A "#" comment dropped into the middle of a formula silently cut off its tail (the eye's tilt and inner-corner terms),
  which changed every face by 1-36 px. A new per-face parameter must reproduce the old pixels exactly at its default:
  render the old settings with the new code and compare with the installed sheet before judging anything.
- Per-character tweaks (hair length staggers, new styles) go behind their own setting, or they leak into everyone
  who shares that style (June, Ruth and Ada changed when only Caitlyn's hair was meant to).
- Teeth: one continuous row of upper teeth, clear of the corners. Two lone corner teeth read as fangs (judge 6 vs 5).
- Cleavage, chat portraits: frame the young women 4 px higher so the neckline shows (cropped at the frame edge it fails the
  owner's rule); shade each breast on its inner, lower curve with one highlight upper left, a short crease only under the
  neckline. A full-length dark streak reads as a slit or stain. Narrow plunges make a wedge: cut them wide. Pendants at
  the base of the neck (6 vs 4, then 6 vs 5).
- Cleavage, walking sprites (48x64): no necklaces at all; at that scale a chain reads as a collar, a necktie or a
  breastplate. The cleft in two soft steps, darkest only at its base; a hard 1 px darkest stripe reads as a tie or zip.
  The top must sit two value steps from the skin (a tan apron on pale skin merged into one column). Arms folded across
  the chest hide it; a stance that differs from the walk flickers (5 vs 4 twice).
- A laugh has to open: a D-shaped mouth 7 px tall, a little wider than the smile, dark inside, top teeth, tongue at the
  bottom (6 vs 5 in both sets). A 1.6 px taller opening was invisible to two judges.

## Interiors (Nov 10: family 4 -> 5)
- Light that is drawn OVER the scene (additive beams, floor ovals at the beam ends) reads as see-through stains; put the
  sun on the FLOOR as a flat hard-edged patch with the window's glazing bars, drawn before the furniture so it covers it.
- Remove speckle and the next flaw shows: a fixed row offset for plank ends (row*37 % 61) draws diagonal stripes across
  a room; offsets must be random per row. Three far-apart plank tones read as patchwork; two close tones read as wood.
- A contact shadow made by squashing the whole silhouette hangs below the foot as a step; centre it on the foot line so
  most of it hides under the piece.
- A home without the shop's daytime lighting needs a stronger sun patch, or the room has no visible light source.

## UI type (Nov 10: our own pixel font, 6 vs 5)
- One pixel family for everything; a smooth serif or a browser-slanted italic in a pixel UI clashes (set font-synthesis
  to none and draw a real bold cut).
- Pixel type must sit at whole-number multiples of its em grid, and should match the art's pixel size; text smaller than
  the art's pixel reads as "upscaled" and dim small lines fail the greyscale check.
- Curly quotes need clear 6 and 9 shapes at 3 px tall, or the opening quote reads as a closing one.

## First-person hands in the minigames (Nov 10: long forearms lost 3 vs floating fists)
- A forearm of constant width with a dark line every few rows reads as a ladder or a striped pipe; arms that cross the
  scene hide the job (the fire, the cutting line) and become the loudest thing in the frame. Don't extend sleeves to the
  frame edge by default.
- If arms are drawn: foreshortened (about twice the fist's width where they leave the frame, tapering to the cuff),
  shaded as one cylinder with two creases at most, in a muted wool clearly apart from the scene's reds, and routed so
  they never cover the work.

## Crops (strict judge against the reference set, Nov 10: rounds 1-6, 0 -> 8 of 11 stages at 6)
- The turnip is the standard: spoon leaves with a bright midrib, a plum shoulder, a round bulb with a taproot. Every crop
  gets the same things: a full value range (lights near 210 lum), a soft contact shadow (not a soil dish), and a darker
  separation line wherever one leaf overlaps another.
- Pumpkin leaf, every way it failed: a polygon formula with lit/shade by (x+y) dithers ("formula"); a 3/4 leaf face-on
  on a straight stalk reads as an umbrella; hand grids with scalloped bumps along the top and a dark rim along the
  bottom read as lettuce in a planter; round-lobed leaves held up on 6-7 px stalks read as broccoli or little trees.
  What is left to try: drawn by hand, three lobes with a notch between each, a pale vein to each lobe, low and
  overlapping, stalks 2-3 px at most.
- A young pumpkin in deep blue-green reads as a mossy stone among green leaves; warm it toward olive.
- Ripe pumpkin: scalloped joins at the top and bottom made it octagonal. Dip only the middle joins, by one pixel, at the
  top; keep the base closed; one highlight mass.
- Corn: a stalk that is the brightest, longest shape reads as a bamboo pole (give it the leaves' shade tone and a 1 px
  lit edge). Leaves mirrored in strict alternation read as a fern; vary length and height and show 2-3 px of stalk
  between their bases.
- Corn ears: an ear reads when its husk is straw, not leaf green (or it vanishes), and its kernels are lighter than the
  leaves in grey. Lemon yellow is candy; old gold is right. Draw kernels as 2x2 clusters, not 1 px stripes (those read
  as a cocoon).
- A dead corn leaf drawn as a 1 px bent line reads as a stick. Make it a ribbon tapering 3 -> 1 px, with a straw top
  face and one darker fold where it turns down.
- Iterate on a 6x zoom of the stage beside the reference AND a field shot: the young pumpkin looked fine zoomed and like
  a stone in the field.

## Outlines, light, colour

- Outline round the whole object once, a darker version of its own colour, lighter on the lit top-left; never an outline
  round every internal bundle (it reads as cut-out pieces).
- Light from the top, slightly left (LPC: keep it mostly centre).
- Ramps: shades toward purple, lights toward yellow, no pure colours. About 6 colours per 32x32 area (measured on LPC).

## Process

- Silhouette first, then masses, then detail. Skipping straight to clusters produced polka-dot bubbles.
- Placing clusters along mathematical lines (perimeters, boundaries) looks mechanical, like piped icing.
