# Lessons (read before drawing; add to after every critique)

Each line is something an attempt taught. Newest and repeated mistakes go to the top of their section.

## From the owner (strongest)

- "your judge is being too kind on crops: that pumpkin does not look anywhere near good enough, most of them don't; compare
  them to the outside assets and you will see how bad ours look" (Nov 10): a judge's 6 against our OWN old art is not the
  bar. Calibrate against a professional reference (the outside-art set we replaced, used only to compare, never in the
  game): it counts as an 8, anything that looks amateur next to it is 5 at most. Measured: our crops ran lum 8-133 (mean
  75) where the reference runs 37-211 (mean 133), so "darker, moodier" had turned into mud. Crops keep a full value range;
  the game's lighting supplies the mood.
- "No I think it being 6 minimum is still important. I want it to be preferred and six" (Nov 10): nothing is installed
  unless it scores 6+ AND is preferred over the old art. The old exception (when the old art breaks an owner rule, being
  preferred was enough) is gone. If the old breaks a rule and the new is still under 6, keep working until it reaches 6.
- "only use strict judge for crops, don't use it for anything else unless I say so" (Nov 10): the reference-calibrated
  strict judge (outside-art set = 8, amateur next to it = 5 at most) is for CROPS ONLY. Every other family keeps the
  normal blind judge: install at 6+ and preferred over the old art (no exceptions, owner Nov 10).
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
  passing frames, bent arms pumping (fist at the chest, then driven back), a bigger stride and bob. [corrected Nov 10]
  Hair, hats and hair accessories move WITH the head on the same frame (owner: a frame's lag read as "hair bobbing up
  and down like it's not attached"; judged 8 vs 3 at 6x). An idle needs a visible breath and a blink.

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
- Leaves the same size and the same pale value, side by side, read as clover or cabbage heads in a row. Make the back
  leaf about 1.5x bigger and a cooler step darker, vary the front leaves' size and tilt, and draw a dark line where they
  overlap.
- Fruit lighter than its own leaf, with evenly spaced pale rib arches, reads as a striped gourd or a garlic bulb. Use dark
  grooves that bow with the form, keep the fruit a step below the leaf, and put one highlight at top-left.
- A separate dead leaf that bends at a right angle and hangs straight reads as a tag or a peg. Dry the tip of a real leaf
  instead.
- In a darker back tone set, a leaf whose outline and body are only one step apart loses its lobes: keep the lit rim
  and the vein bright even on back leaves, and cut notches 2-3 px deep (1 px notches vanish into a dome).
- A fruit whose grooves and highlight sit one step off its body is a flat lump: grooves two steps darker, a 3x2
  highlight, a dark edge along the bottom-right.
- A dried leaf tip must not touch an ear (they merge into a club with a peg), and it turns in two steps (olive-straw,
  then straw), not one hard step.
- Lobes built from pointed wedges go jagged (a centre spike, 1-2 px teeth: nettle, thistle, holly). A pumpkin lobe is a
  rounded shoulder ending in ONE 1 px point; notches only between lobes; drop edge pixels with fewer than two
  neighbours; inside, one body tone and a pale vein, nothing else.
- A leaf standing beside its fruit, brighter than it, reads as a sticker: tuck it behind the fruit's upper-left
  (overlap 3-4 px, a dark line between), a step darker and cooler, and join them with a vine into the stem.
- A dried leaf tip as pale as the husks reads as a third ear or a bone: dull tan, two steps under the husk's lightest,
  never cream.
- [round 10: all 11 at 6] What finally worked for the pumpkin leaf: smooth rounded lobes (ellipses) each ending in one
  1 px point, wider than tall, one body tone, a lit rim up-left, a shade rim down-right, a pale vein per lobe (or one
  midrib on a small leaf); back leaves a step darker and cooler; leaves overlapping with a dark line between.
- A straight 1-2 px line on the soil reads as a dropped twig: a vine must start at the stem, curve, and end in a curl.
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

## Player actions (Nov 10)
- [owner, Nov 10, verbatim] "make the 3d animation models that the tool use for the animations match there item icons compare
  the similarity between them with a judge ... than do the 6 score system". Every tool now passes a SIMILARITY check against
  its toolbar icon (as the toolbar draws it, with the grade's recolouring) before the 6-score. "Don't forget to make multiple
  with different colors for different resources when you upgrade": each grade recolours icon and hand from one ramp.
- A 3D blockout of a small held object (a 20 px can) read as a gourd: too few pixels for its shading. At that size a
  hand-drawn sprite in the icon's colours wins; use 3D for orientation reference, not the final pixels.
- [owner, Nov 10] The scarecrow is the Hollow by day: render both from one model so they cannot drift apart.
- [motion judges r2, Nov 10] Judged in motion, everything that passed on still frames dropped to 5: the owner was right.
  Read the motion picture before the frames. A swing seen edge-on (facing down or up) must stay edge-on through every frame.
- The installed axe and pick swung out sideways to his left facing down/up and never touched the stump/rock (3 and 4 vs
  the new straight-down swings at 6). Always capture a tool with its target in shot and the tool drawn alone (no-tool diff).
- A planted foot must travel BACK relative to the body: the old run lifted the foot while it travelled back, so the planted
  one slid forward (a moonwalk). Check the phase: lift only while the foot swings forward.
- The passing foot must show: tucked straight behind the standing shin it hides, and the frame reads as standing (a skip).
  Trail it 3 px behind the shin, lifted 4.
- Never more than 1 px of rise or fall between neighbouring frames, walk or run; a run is low on the support frame and high
  after push-off.
- A breath moves the chest, shoulders, arms and head; the hips, legs and boots stay locked (the whole body dropping a pixel
  reads as a nod). Use a WHAT MOVED map (pixels changed vs frame 1) to show a 1 px motion to a judge.
- Arm swing and stride are separate numbers: widening the stride with the arms tied to it made a T-pose.
- A carried item starts in the hand: compute its grip from the frame's own hand point, never a fixed offset from the body.
- Seated facing us: a lap 2 px wider than the hips, two knees with a 1 px cleft, 2 px of shin, hands on the thighs.
- A hurt fling needs one arm up and the other guarding the chin (hands 6+ px apart in height), or it reads as a shrug.
- [run r3] A run is not a fast walk: give it an AIRBORNE frame (both feet up 2+ px after the push-off), a stride longer
  than the walk's, a heel kick behind and the knee coming through. Draw each leg from a per-frame table (offset, lift),
  not a sine: a sine gives walk legs. The push-off boot stands on its toe, never lies flat far behind (the 'weird legs').
- [grab r2] An item carried in the hand needs a carry POSE (hands up on it), not just a grip point: hung from a hand at the
  hip, a post reaches the ground and slides when moved.
- [tools] Mark ground contact only on the ground row; a track tool that calls the lowest pixel 'contact' hides airborne frames.
- Ground speed vs stride: at 3 tiles/s with 7 px legs a planted foot cannot hold; lengthen the stride (5 px) and speed the
  cadence (P.t at speed/2.6 x 17 fps) to halve the skate rather than pretend it isn't there.
- [OWNER, Nov 10, verbatim] "You obviously have not found a way to show them the animations because it's hitting the stone
  with the pickaxe sideways on the front and back ones ... show it a gif of the animations or something." Still frames in
  a row hid it: facing down/up the pick (and the axe) swung across the frontal plane, its head flat across, landing beside
  the body, and the target was never in the shot. JUDGE ANIMATIONS WITH MOTION, ALWAYS:
  1. capture with the real target on the square (a rock for the pick, a stump or tree for the axe, soil for the hoe);
  2. capture every frame twice, with and without the tool (window.NO_TOOL_DRAW), and draw the tool's path: each frame's
     tool in its own colour over the scene, numbered at its far end (motion.py) - the swing plane and the landing point
     are then plain in one picture;
  3. make a GIF at real speed and SEND IT TO THE OWNER, whose eye is the final verdict (tools/px/gifs/).
- Facing down or up, an overhead swing is edge-on to the camera: the tool and its head lie along one vertical line, the
  head's point leads, and it comes straight down onto what's in front (or beyond the head, facing up). A head drawn
  across (left-right) is a sideways swing.
- A swing must reach its target: the player walks in to striking distance first (as close as the target's collision
  allows), and the facing-down strike frames are drawn longer so the point lands on the rock, not at the feet.
- [OWNER, Nov 10, verbatim] on the run: "I miss the old one. The arm swing is good but the tilting and legs look weird."
  The judge had scored the new run 6 vs 4: the owner's eye outranks the judge. Kept the old run's lean, bounce and legs
  with the new arms, and sent the owner a side-by-side GIF to choose.
- Capture animations with the game paused and the action's clock set to each frame. Real-time screenshots lag behind
  the clip, and the later frames come out as idle.
- Facing down, a tool wound up straight above the head reads as a peg; wind it over one shoulder at a slant. Struck
  straight down in front, it reads as a stake; slant it.
- Facing away, a swing drawn wholly behind the body vanishes. Let the tool's head show beside and above the head.
- A held thing must show in every direction: the can held out to the side, seeds falling from the hand when
  planting, the sprinkler carried from the hands to the square when setting it down.
- A water stream is 2 px wide in two blues and ends in a splash. A 1 px dotted line reads as wire.
- [walk r2-r3] Check the walk's numbers before its pixels: print each frame's legs and hands. Our side walk had each arm
  swinging WITH its own leg (a pacing gait) and the lifted foot moving backwards (the stance motion); both looked
  "almost right" at 4x for weeks. The swinging foot is the one travelling back to front.
- [walk r3] The rise and fall moves at most 1 px between neighbouring frames (0,+1,0,-1 repeating over the 8 frames);
  a 3 px step from the low frame to the passing frame reads as a hop.
- [walk r3] Side arms swing about the body's middle, not about each shoulder, or one step swings 2 px less than the
  other and the walk limps. Use a pendulum (the hand rises as it swings out) so the arm never stretches.
- [walk r3] The passing foot must trail 3-4 px behind the planted shin and lift 3-4 px, or its boot merges into the
  planted boot and reads as a kink in the shin.
- [plant/grab r2-r5, corrected] The target square is a whole tile from the feet, beyond the hands' reach. Sliding the
  whole sprite toward it read as teleporting (r4). What works: the kneel itself steps the near foot forward and leans
  from the hips; small things (seeds) cover the rest of the distance in a visible arc (leave the hand on the 3rd frame,
  land on the 5th, stay); a big thing set down by hand (the sprinkler) needs a REAL half step first (the player moves,
  walking frames, the camera follows, nothing snaps back), so the hands are on it when it touches down.
- [plant r5] Facing away, show what's in the hand beside the head at shoulder height, never on the crown (a pale
  cluster on the hair reads as a bun). Landed seeds as 2x2 clusters with a dark lower edge, not single pixels.
- Take the hand points from the sheet itself (the generator records them) so things sit in the hands.
- [grab r6-r7] The judge sees 6 sampled frames, not the motion: a move that happens between two samples reads as a
  jump however smooth it is in play. Any step must span at least two sampled frames, and a judged action should end
  where the player stays (no step back that lands in the last sample).
- [run r7] Side view: the FAR leg tucked up behind is hidden by the planted near leg unless it trails 4+ px; the run's
  passing frame then reads as standing. Keep the arms bent on the passing frames too.
- [run r8-r9] A run bounces the other way from a walk: low on the passing frame (support knee bent), high on the next
  frame with both feet off the ground. Lean the head clearly ahead (the legs only take half of the generator's lean).
- [grab r8] When an action needs the player closer than he stands, walk him there first with the normal walk (outside
  the action) and keep the action itself still. Facing away, stand him a little to the side of the square so what he
  sets down stays in view beside him.
- [hurt r1-r2] A fright needs an impact frame (snap up, wide eyes, an O mouth, hands flung out, uneven so it isn't a
  cheer), a cower and a recovery. Closed eyes in pain are a clenched > < with brows down to the nose and a grimace:
  flat closed lids read as dozing, and with a smile or blush as giggling.
- [sit r1] Seated is drawn, not shortened: in profile the thigh runs forward at seat height, then the knee and the shin
  down to the boot (an L); facing us, a lap wider than the hips, two knees, the shins below; hands on the thigh/knees.
- [judging] An old build (test2d_old.html) loads the CURRENT sprites from the same folders: after installing new sheets,
  old-vs-new captures from it are both new. Compare sheets directly (old files from git or backup_v2) instead.
- [code] Never end an inserted line with a // comment in these one-line-per-function files: twice it swallowed the
  rest of the line (the legs, then a whole function). Use /* */ or put the comment on its own line, then syntax-check.

## Buildings (Nov 10: kit v2, judged 6 vs the installed 4)
- [r3] Moss goes where water sits: the lowest 6-8 px of a roof (the eaves) and the 2-3 courses above a wall's base, in
  clumps. Spread over whole roof planes it reads as camouflage or mould (6 vs 5).
- [r3, next] Metal roof seams run from the ridge DOWN to the eave (parallel to the gable edges), never parallel to the ridge.
- [r4] A seam is a 2 px rib: the lit line and a dark line under it; a lone lit line reads as hatching. Tone by slope, not
  by distance (a tone stepping with x made a hard vertical band). Rust is a 2 px streak down a seam toward the eave.
- The installed buildings carried the banned grit: a 1 px light dot on every shingle (frosted roofs at 1x), checkerboard
  eave and chimney shadows, and a stain layer smeared across trim and posts. Wear is drawn as shapes, never as a layer.
- A cast shadow drawn in the outline colour merges with the outline above it and reads as a thicker line. Shadow a wall
  with its own darkest steps (the brick or siding still shows through), 3 rows dark, then a step lighter, then one more.
- Moss in round clumps along the lower courses and the shaded side, not streaks along every course.

## Making minigames (Nov 10: yard 3 -> 6, barn 3 -> 6, installed)
- A sunny candy palette (bright grass, white tiles, honey wood, blue sky) is the first thing that sinks a scene. Dusk light,
  dulled colours, one visible light source (a lamp, a candle, a lit window) and a darker floor read as this game.
- The verdict text (PERFECT x5) must have a full dark outline and must never blink to a dark colour. Dark brown text on
  dark ground cannot be read. Keep verdicts off the tool and the line being worked: fix their spot away from the cursor.
- Anything the player manages must read at half size. Vents need to be 8+ px glowing openings with smoke rising from
  each; the flail must be the palest, most outlined object in the scene (pale ash wood, a lit top edge, a dark outline,
  a leather thong).
- Smoke is solid round puffs in 2-3 greys that swell and shrink (no see-through squares, which read as glass cubes or
  bubbles), rising in a column from where it comes out.
- A dome of turves laid in a regular grid reads as a brick igloo. Lay them by angle round the dome (foreshortened at the
  edges), light the whole dome (lit top-left, dark bottom-right), and break up the grass lips.
- Repeated props read as stamped copies: give logs, sheaves and bales two or three variants (length, grain, a knot, the
  heart off centre, flipped).
- Light from a window is a hard-edged patch on the floor with the bars in it, not a see-through beam.
- A thing being carried must sit clear of the title plate and the HUD (the yard's log was hidden under WATCH).
- A gauge belongs next to what it measures, with its good band in green.
- Backgrounds go through a lone-pixel pass: any pixel whose four neighbours all match each other, but not it, takes their
  colour.
- Rough or worn surfaces (an unplaned board, a waxed cloth) are drawn as shapes: long torn-grain streaks, a few
  splinters, a duller tone. Single dark and light pixels read as gravel or sandpaper.
- The drop point must show before the tap: a clear shadow on the surface under the held thing (an egg over the pan).
- A tool must visibly touch the work where the pointer is (the skimmer's bowl in the metal under the cursor).
- Cloth: never a 1-2 px checker weave (it turns to dither) and no big soft blotches (they read as stains). Use a flat
  body tone, a few tapered fold curves (a lit crest with its shadow under it), a frayed selvedge and pins.

## Outlines, light, colour

- Outline round the whole object once, a darker version of its own colour, lighter on the lit top-left; never an outline
  round every internal bundle (it reads as cut-out pieces).
- Light from the top, slightly left (LPC: keep it mostly centre).
- Ramps: shades toward purple, lights toward yellow, no pure colours. About 6 colours per 32x32 area (measured on LPC).

## Process
- [Nov 10] An `if` dropped into the middle of an if/else-if chain adopts the chain's trailing else: the hurt's impact
  frames fell back to the idle stance. Put per-case overrides AFTER the chain, and re-render every character a change can touch.

- Silhouette first, then masses, then detail. Skipping straight to clusters produced polka-dot bubbles.
- Placing clusters along mathematical lines (perimeters, boundaries) looks mechanical, like piped icing.

- Tools in hand (judge, Nov 10): an axe head drawn round reads as a pan or spade; it needs the flare, a beard toward the hands and a poll behind the haft. A pick seen end-on must show the point leading, never a white ball. A pick's crescent is thick at the haft and tapers to 1 px points, not an even-width sickle.
- Debris (judge, Nov 10): pale specks vanish into the dirt they fly over; the darker clods with an outline read better. Outline debris in its own darkest tone, never near-black.
