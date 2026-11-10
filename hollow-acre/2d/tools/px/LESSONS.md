# Lessons (read before drawing; add to after every critique)

Each line is something an attempt taught. Newest and repeated mistakes go to the top of their section.

## From the owner (strongest)
- Owner (Nov 10): "benches kind of look weird and not like you would be able to sit on them". A seat must read as a seat at 1x: one bright seat plane (lighter than the back), a separate darker back with a gap under it, and a solid shadow under the seat lip that fades to the floor. Rows of evenly spaced slats or panels read as a crate, a fence or a sideboard.
- Owner, Nov 10, on the 3D-rendered furniture, props and benches: "redo these all not in blender you lose detail when you do it and it looks bad". Understood: rendering small objects (furniture, props, stations) from 3D models smears the detail at game size. Draw them by hand in code, pixel by pixel, the way the buildings kit and the original furniture were made, and draw each turned view (side, back) by hand too, never render it. All 3D-rendered furniture was taken back out of the game (old art restored).

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

- [repeated, interiors r1] Light as a see-through oval over the floor reads as a stain (fire, candles, forge): draw it like
  the window sun patches, additive and hard-edged in two stepped tones, shaped by the opening (a fan out of a hearth mouth,
  2 tiles wide at most), on the floor layer before the furniture.
- [interiors r1] A darker band down each side wall reads as dark stripes under whatever stands there (beds): keep only the
  back wall's own shadow (10 px) and take the whole floor down one step instead.
- [interiors r1] A contact shadow centred on the foot line hides under the sprite's last 3 px: drop it 2 px so 2-3 px show.
- [interiors r1] Effects keyed to furniture must skip hidden pieces (o.hide): the cabin's upgrade furniture threw light and
  shadow into the black void beside the room.
- [interiors baseline] A room deeper than the screen shows only floor from the door: open on the back wall and pan down.
  Judge rooms from a few steps in, where the walls are in view.

- [process] An old/new pair must load the OLD sprites: the scratch build shares one sprite pack set, so a copy of the old
  page still draws the new art. Export the last commit (git archive spr + index.html) and serve it from its own folder.
- [interiors r3] A post-pass script that dresses a room shell (tools/shack.py adds the shack's holes, leak, damp and boarded
  pane to room_cabin0) is lost when the shells are re-rendered: re-run every post-pass after interior.py, or the room loses
  its story (the cabin lost 5 vs 5.5 to its own older self).
- [interiors r3] Floor holes as flat pure-black dashes of one shape set in a line read as glitches: a broken board is a
  missing stretch of ONE plank (on the plank lines), dark brown earth inside, the far board's cut face along the top, a joist
  across a long gap, ragged ends with pale lit splinter tips, three different lengths, never in a line.
- [interiors r3] One pattern repeated on a grid wall to wall (diamond parquet, checker) is the loudest thing in the room:
  take its joint lines a step quieter and frame it with plain boards running along each wall, so it stops short of the
  furniture that stands against the walls.
- [interiors r3] A rug under a table shows only a thin arc and reads as something else (a rainbow): a rug goes where it is
  seen, under a chair or in open floor, with the furniture standing on its edge, not covering it.
- [interiors r3] Say who lives there with ONE object only they would own (a kneeler with an open Bible for the minister, a
  child's drawings for the boy); crates in a bedroom read as storage dumped there. The room with the drawings scored 6.
- [interiors r3] Two copies of the same bed sprite, mirrored either side of a shelf, read as a hotel and lose to two
  different beds in an uneven layout.
- [interiors r3 -> PASS 6 vs 4.5 and 6 vs 4] The teacher's house and the mother-and-son room won once the floor stopped
  shouting and one object said who lives there. Next level (judge): Stardew dresses a room at three scales: big furniture,
  then small things on every surface, then things hung on every wall, with pieces touching and overlapping. Big sprites
  standing apart on bare floor under bare walls read as props placed, not a life lived.
- [interiors r4] A reddish-orange glow under the brightest point in a horror game reads as a stain or blood: candle light
  on the floor is a small pale-yellow patch, hard-edged, two stepped tones, never red.
- [interiors r4] Fire drawn as three pale 2 px rectangles reads as heater bars even when called flames: a bed of uneven coals,
  then tongues that swell from a 4-5 px base and taper to a leaning, curled tip, deep orange edge, yellow core, white root.
- [interiors r4] Worn paint drawn as 4 px chips down a path reads as footprints or specks: wear goes along the boards as long
  streaks (paint thinning first, a thin bare-wood scratch in the middle), lengths varied, ends only softly ragged.
- [interiors r4] A floor patch (lino, carpet) laid over a floor that is already patterned reads as a pale glitch block:
  only lay one over plain boards.
- [process] A JS object literal with the same key twice keeps the LAST one: grep a table for the key before adding to it.
- [interiors r5] A hatch in the floor drawn with a dark band along its lower edge reads as a raised crate: a floor piece has
  no front face, only a 1 px gap all round, and no outline pass (NOOL.push(()=>true)); paint it like the floor around it.
- [interiors r5] An unreadable small sprite in open floor (a sack with a white blob of letters) costs more than it adds:
  every piece must read at a glance or go.
- [process] kind 'deco' in a room's furniture list draws a LEAVES sprite, not the piece: things on beds and tables use the
  ordinary furniture kind with no footprint (and a tall anchor, ay, to sit up on the surface).
- [interiors r6] Painted to match the floor, a story piece (Ruth's hatch) vanished and read as "a grey slab": a piece that
  matters needs a value step against the floor (bare warm oak on cold blue paint) AND no front face to stay flush.
- [interiors r6] A lone group of pieces in a big room reads as left there; a long piece with the others at its ends reads as an
  aisle (the store's goods table, barrel and sacks).
- [interiors r7] Soft blobs on a floor read as stains and two-stroke crack marks read as birds: keep the middle of a floor quiet,
  put the damp along the walls with a hard ragged edge, pebbles in groups of mixed sizes by the walls, cracks that branch.
- [interiors r7] Copies on one screen (three identical ferns, twin sack pairs, twin hanging baskets, crate pairs in both
  corners) read as copy-paste: every piece in view should be a different sprite.
- [process] A helper that takes a fixed number of pieces (BEDS(a,b)) drops a third argument silently: append with concat.
- [interiors r8] Wall dressing looks for 1.4 m of free wall; a narrow piece (an eye chart) in a gap under that never lands:
  put the room's key wall piece in its furniture list by hand and check the shot.
- [interiors r9 -> PASS] The store, the doctor's house and the greenhouse reached 6 once each had: one piece only its owner
  would have (an aisle of goods, a cabinet with a red cross and an eye chart, tools by the glass), no copies on screen, a quiet
  floor framed or toned down, and daylight that falls through the windows or glass.
- [interiors r9] A piece placed by a random free-spot search can land on a flat rug (rugs are not obstacles): place story
  pieces by hand.
- [interiors r9] Props standing in one evenly spaced row along the back wall read as placed: split them between corners.
- [interiors r9] Flat stones drawn with symmetric cut corners read as capsules: give each stone four sides that slope differently.
- [interiors r10] In a dark room (the mine runs at full night) light painted on the floor sits under the darkness and never
  shows: draw light pools into the light mask itself (hard-edged two-step wedges), with a dim lift over the room so the floor reads.
- [interiors r10] A piece of a group (nightstand, chest) floating alone mid-room reads as dumped: it touches what it serves
  (the bed head) or stands against a wall under something (the bookcase).
- [interiors r12 -> PASS] Ruth's room: one piece to each part of the room (bed and nightstand, shelf and candelabra, rug in the
  middle, vanity and hatch in the two lower corners), each touching a wall or what it serves, reached 6.
- [interiors r12] Light fans that all stop on one straight line read as a ledge, and a fan with no lamp at its tip comes from
  nowhere: hang the lamp where the fan starts, make the lamp the brightest pixels, give every fan its own length.
- [process] Room screenshots must wait for the area-title banner to fade (4.5 s): it covered the wall and its lanterns.
- [interiors r13] A track, path or pipe that ends against a solid wall reads as going nowhere: give it somewhere to go (a
  timber-framed drift into the dark), which also gives the room its "deeper down" dread.
- [process] Removing a line that ends with closing braces removes braces that close OUTER blocks too: count what the deleted
  line closed and put those back (node --check catches it; never chain past a failed check).
- [interiors r14] A light fan whose width is capped turns into a rectangle with a ruler-straight bottom and reads as a panel or
  doormat: let it widen all the way to a ragged far edge, and light the wall round the lamp too so light runs lamp, wall, floor.
- [interiors r15 -> PASS] The mine reached 6 after 15 rounds: name the subject at a glance (track, cart, drift, timber sets),
  keep the middle quiet for play, put the detail at the walls, and let every light have a visible source.
- [interiors b2] Five rooms on the same shell (same windows, same door, same mat) read as one house shown five times: vary
  the shell per house (window count and place, wall, floor), not only the furniture.
- [interiors b2] Generic workshop pieces (pegboard, cogs) never say a trade: each trade needs its own material in view
  (cut stone and a sledge for the quarry, a treadle machine for the seamstress, primers and a hand-bell for the school).
- [interiors b2] Small cream blocks on a shelf read as jars whatever they are meant to be: letters need the V of the flap.
- [interiors b4] Two small marks over a dot read as a face: an envelope's flap is one unbroken line, no seal dot under it.
- [interiors b5] Two light passes for one window (a baked shell patch and a live patch that leans and widens) read as two
  diverging bands, an "A": one source of window light only, hard-edged, sheared one way.
- [interiors b5] Evenly ruled lines on a block read as a grill or radiator: rough stone is a jagged top edge, chipped corners
  and a few scars.
- [interiors b6] A plain block of anything at game scale reads as an appliance (a box with a lighter top = a toaster); give
  the material a shape only it has (a headstone's arch and cross says "stone being cut" at once).
- [interiors r3] A tall piece standing in front of a window (a bookcase hiding a third of the glass) is a placement error;
  check every tall piece against the window list before judging.
- [interiors r3] Fading a too-loud quilt to grey made it read as stone: fade toward the room's own warm brown instead
  (mix 45% toward the floor colour, 15% darker), and keep its pattern.
- [interiors r3] One pupil desk on its own reads as a side table: a piece that says a job needs its group (two or three
  desks in a row facing the board).
- [interiors r2] A fire lights nothing until the source glows: flame tongues (deep orange edge, pale core) and a hot grill
  must be the brightest pixels in the room before any floor light. Vertical bars read as a heater grate.

- [interiors b9] The new version won all 8 homes of batch 3 (hale 6, quill 6 pass). What still holds a room at 5: big pieces
  stand apart on bare floor and the lower half is empty; Stardew layers big pieces, small things on every surface and
  something on every wall, with pieces touching. Fill the bottom third with one piece that says the trade.
- [interiors b9] A fallen chair seen top-down reads as a bracket; a flaw must keep a shape the eye knows (sole and toe for
  a boot) or go.
- [interiors b10] BLOCKING across 10 public rooms: one kit reused (the same till counter in 6, the same braided rug in 6,
  the same crate pair in 5, the cog shelf in 4, church and chapel one shell) kept every room under 6. Each trade gets its
  own counter and its own pieces; no braided rug in a shop; no two rooms share a shell.
- [interiors b10] Pew panels read as sideboard drawers: a seat shows a lit seat plane and a gap under the back.
- [interiors b10] A forge or hearth must be the brightest thing in the room with an amber fan on the floor; a brick box with
  a yellow smear is not a fire.
- [interiors b10] A shop's counter needs its trade on top (lure cards and a scale, a vise, a ledger and bell).

- [interiors b11] Shapes that failed to read at room scale: an open coffin box seen from above (a trough or a canoe), a lid on
  trestles (a loaf), a quern (cushions), pelts on stretchers (cones, then arrows). What read at once: a stencilled word on a
  bin (FLOUR), coffin lids standing up (the six-sided outline with an inset moulding), hides hanging head-up from a rack
  with ears, leg flaps and a tail. Pick the view in which the object's outline is its signature.
- [interiors b11] Two beds of the same frame in one room read as a hotel: the second bed is a different kind (an iron cot).
- [interiors b11] A saturated painted floor (rust red, bright sage) becomes the loudest thing in the room; painted floors use
  the slate or a dull ramp.

- [interiors b12] A soft round dark blot on a floor reads as a shadow cast by nothing; a stain must be flat, ragged, along the
  grain, with a dried edge, or not be there at all.
- [interiors b12] A lit bevel line inside most flagstones reads as a crack on every stone: lit lips on a few stones only.
- [interiors b12] One panel pattern repeated 16 times across a wall reads as copy-paste: most panels plain, a few with their
  own long grain.
- [interiors b10] The survey camera matters: the old shots were taken while the camera was still panning down from the back
  wall, the new ones after it settled on the floor. Match the camera state before comparing (rs_b4.js sets the pan).

- [interiors b13] A red-orange light fan on the floor reads as blood; firelight on a floor is amber with a pale inner step.
- [interiors b13] Identical repeats at even spacing (six pews, red spines every 24 px) read as stamped shelving; vary the
  count and the place of the small things on each copy, and use two or three kinds of the piece.
- [interiors b13] A tiered stand of small red cups reads as a cake until the flames are the brightest pixels on it.
- [interiors b14] Things that read at once in a shop: a word on the thing (COLD, MAPS, GAS OIL, FLOUR), a car side-on on a lift
  with its hood up, bottles with long necks (short wide ones read as books).

- [interiors b14] A sun patch that starts at the wall foot and runs 64 px down at a steep slant reads as a see-through beam;
  a compact patch the window's own shape, a little way out from the wall, two flat tones that wash out the floor grain, the
  glazing cross in the floor's colour, reads as light on the floor. It must land past the furniture standing at the wall.
- [interiors b14] Position maths must end in whole pixels before G()/P(): a window at x 3.8 made every read miss and its
  room had no daylight at all, silently.
- [interiors b15] Judges keep naming the shared shell (same two windows, door, mat in every home): vary the window count and
  width per house, not only the paper and floor.

- [interiors b18] Pew backs: three raised panels read as drawers, vertical slats read as a fence; two long horizontal planks
  with a book rack read as a pew.
- [interiors b19] Wall dressing drawn by the shell is part of the kit: if every room gets the same picture and jar ledge,
  judges count it as reuse. Pick wall things per room (clock, mirror, sampler, hooks, horseshoe, picture, ledge).
- [interiors b19] Plaster drawn with per-pixel noise reads as banned speckle; broad smooth patches in two close tones and a
  hairline crack or two read as an old wall.
- [interiors b17] A tall piece set on another (tyres on a drum) reads as one totem; trade pieces stand side by side.

- [interiors b24] A bed is the biggest piece in a bedroom: one frame repeated in every room is the first thing a judge counts
  as kit. Keep three or four frames (patchwork, brass, four-poster, plain pine) and let each room pick.
- [interiors b24] A cellar has no windows and no parlour things: no wall clock, no jar ledge, no picture; its light is a
  lantern with a hard pool.

- [interiors b29] A small light (candle, lantern, votive) needs its own hard-edged pool on the floor in two warm steps, big
  enough to see (a 60 px oval at least); a faint additive wedge reads as a grey smudge, and a pale beige oval reads as a rug.
  Amber (255,150,46 and 255,204,104), stronger in a dark cellar.
- [interiors b29] A stained-glass patch cut into four tinted quarters with a pointed tip reads as a heraldic shield lying in
  the aisle: scatter the colour as small diamonds and skew the patch so it reads as light thrown from the window.
- [interiors b29] Round-topped wall recesses read as bread loaves twice running; catacomb shelves read at once as long square
  slots with bones laid lengthwise and a skull at the mouth.
- [interiors b29] A sprite named for one trade (the stonemason's banker) dropped into another room by name reads as nonsense:
  check what a reused sprite actually shows before placing it.
- [interiors b29] Judges count shared pieces across rooms (the writing desk in five rooms, the patchwork bed, the jar shelf,
  the till counter): give each trade its own piece for the job (radio table, fire finder, motel counter, washstand).

- [interiors b30] A flat additive pool, even amber, reads as a rug on a pale floor; an 'overlay' pool warms and brightens the
  boards themselves (red up, blue down) so the grain shows through and it reads as light falling on them. Same for stove fans:
  an additive pale cone read as a lampshade.
- [interiors b30] Daylight shadows from "the back windows" in a room with no windows read as phantom beams: a windowless room
  (cellar, crypt) casts no sun shadows, and its lanterns are always lit (the lit sprite, not the cold glass).
- [interiors b30] An ivory cover on an iron bed reads as a bare hospital mattress; a dark wool quilt with the sheet turned
  down over it reads as made up.
- [interiors b30] A hanging apron (pale shape on a peg) reads as a figure; a sack with FLOUR stencilled on it reads at once.
- [interiors b30] Numbers on archive boxes are read as room numbers and checked against the story (52-63 in a seven-room
  motel); label boxes with scribble unless the number means something.

- [interiors b31] Overlay light turns brown boards red ("a rust stain", "a blood smear"); additive yellow-amber (255,190,80 then
  255,220,140, strong) lifts wood toward gold. Check a light colour on the actual floor before judging it.
- [interiors b31] A lamp's pool drawn at the foot of a counter shows only as a crescent below its front: it reads as a smear.
  No pool under a piece that hides most of it.
- [interiors b31] The player's own lantern throws shadow wedges away from the player; in a windowless room they read as beams.
- [interiors b31] A camera that follows the player never shows the far end of a wide shop: a piece placed there doesn't exist
  for the judge. Check the screenshot before saying a fix is in.
- [interiors b31] Generated dressing (a wall stub making an L-shaped nook) can appear when furniture moves out of its way:
  re-check the whole room after moving a big piece.

- [interiors b32] By day a candle's or lamp's floor pool reads as a tan rug however it is coloured: a small flame lights the
  floor only at night, or in a room with no daylight (cellar, crypt). Daylight rooms take their light from the windows.
- [interiors b32] A light fan's stippled far edge reads as a heap of straw; end it in solid rows of jagged width.
- [interiors b32] Two equal ends on a sighting arm read as a cradle: give an instrument's parts different shapes (a tall wire
  frame and a short peep plate), and make the thing it is about (the map) the palest, biggest shape.
- [interiors b32] Long sun-shadow wedges from every piece read as stains in a small room that already has contact shadows:
  keep day shadows short and soft there.

- [interiors b33] A fire's light drawn row by row ends in a straight bottom edge and reads as a lampshade; build it column by
  column so it widens from the mouth and every column stops at its own length.
- [interiors b33] A wall lantern's light must start at the lantern: a glow on the wall round it, then a fan down from the
  wall's foot. An oval on the floor below reads as a rug or a tabletop.
- [interiors b33] A cot drawn head-up with straight side rails reads as a standing screen or locker; a camp cot reads lying
  side-on, crossed legs showing, the sleeping bag at one end.
- [interiors b33] A stained-glass patch misread three ways in three rounds (shield, paper, quilt, net): when a piece of light
  keeps misreading, cut it.

- [interiors b34] A stove's floor light by day read as a lampshade or bell in five rounds of five different shapes: like the
  candles, a fire lights the floor only at night or underground. Stop redrawing a light that keeps misreading; take it away
  where it would not show in life.
- [interiors b34] The oval wall mirror from the generic wall kit read as a feather, a fish and a lozenge: in a judged room,
  hang only things that belong to that room (noDress), never the generic kit.
- [interiors b34] A tall red cylinder reads as a fire extinguisher; a gas can reads as a jerrycan (flat oblong, three handles,
  a spout at the corner, the pressed X).

- [interiors b35] A room passes when the subject reads at a glance from its own trade pieces (FIRE DANGER dial, fire finder,
  peat rick and oilskins); the lower-left corner left bare is the next thing a judge names, so dress it with a trade piece
  against the wall.
- [interiors b35] Things in a row along one wall, touching nothing, read as staged; group a trade's pieces into one corner
  where they touch (anvil on its stump, the quench bucket against it, a hammer lying on the face).

- [interiors b36] A light cone drawn from the lamp down to the wall's foot (narrow at the lamp, wide at the floor) reads as a
  heap of sand or a lampshade: light on the floor is widest at the wall and falls off outward, never a triangle.
- [interiors b36] After six rounds of a floor pool under one lantern misreading six ways, the lantern glow on the wall alone
  says "lit"; cut the floor pool (the rule from b33, followed late).
- [interiors b36] Check every edit script's asserts before trusting the build: one failed match aborted a whole edit while
  later steps in the same command ran against the old files and placed a sprite that did not exist yet.

- [interiors b37] A plank wall over a plank floor of the same brown reads as one field and says shed, not cellar: a cellar wall
  is rough fieldstone, cooler and a step lighter than the floor, with a dark line at its foot.
- [interiors b37] A small anvil seen from the front reads as a grey lump on a crate: draw it big and side-on, horn out to one
  side, the waist and feet showing, a hammer on the face.
- [interiors b37] A daytime floor near-black from edge to edge reads as a void: keep the vignette but lift the floor a step.

- [interiors b38] Fieldstone drawn in even courses reads as modern cinder block; rubble has no running course: pack stones of
  three or four sizes on a grid so no seam runs the width, and let damp rise ragged from the foot.
- [interiors b38] A pew seen from behind with the space under the seat left transparent reads as an open rail frame you can
  see the floor through: close it with a lower back panel under a dark band at the seat lip.

- [interiors b39] Even vertical bars in a frame read as a radiator or a birdcage; loose stock reads when it leans at an angle,
  uneven in length and thickness, with a hooked end and rust at the tips.
- [interiors b39] Edit scripts that cut a block "up to the next kind" fail on the last kind in the file: fall back to the end
  marker, and check the script printed ok before rendering.

- [interiors b40] A closed pew panel in the floor's own brown still reads as a gap you see the floor through: a seat must
  differ from the floor in wood (pale pine on dark oak), with a dark plinth line and its own shadow where it meets the floor.
- [interiors b40] A stump drawn with box3 reads as a crate; a log stump is round: bark down its sides, a sawn top with rings.

- [interiors b41] Flags laid in running bond read as modern paving: pack stones of three or four sizes with no seam across
  the room, in two close tones, and darken them with soot where the work happens (the fire, the anvil).
- [interiors b41] A pew from behind reads as a seat when the pale seat plank shows above a darker back, with a dark band
  under the seat lip; pews of one length in a row read as stamped.

- [interiors b42] A high-backed pew seen from behind hides its own seat; after six rounds of "open frames", "crates",
  "racks", a plain backless bench read at once: a pale seat plank (the lightest wood in the room), a dark band under its lip,
  a closed apron to a dark plinth. When a piece's camera angle hides what makes it that piece, change the piece.

## Steps (owner, Nov 10: "steps need to be fixed")
- Steps read as steps by their silhouette: each lower step juts out a few pixels so the sides zig-zag, and each step's end
  shows its own face. Even tread-and-riser bands boxed in by cheek walls or stringers read as a slatted crate or a grate.
- Deep pale treads with the nosing brightest, short dark risers with a black line under each lip: the contrast between
  tread and riser is what climbs. Keep a flight as wide as the gap it fills (the inn rail), or it reads as a box set in it.

- [interiors b45] The chapel's window patch misread a fifth way (a feather): a lancet's light on a dark plank floor never reads
  in this room in any shape or tint. Cut it for good; the whitewashed wall is its daylight.
- [interiors b46] A plain closed altar rail read as a chest with a keyhole; anything lying on a bench top (a net, a hymnal) turns
  the bench into a table. An altar reads when a pale linen cloth hangs over its top and down the front in one broad fold, with a
  cross and two candles standing on it: the palest shape in the room at the head of the aisle.
- [interiors b47] A daytime room with a dark, busy board floor (an end joint on nearly every plank, about RGB 67,44,30) and a
  heavy screen vignette reads as dusk, and the furniture sinks into it. Lift the floor a value step, make the boards twice as
  long with quieter joints, and keep the indoor day vignette light so the side walls stay above near-black.
- [interiors b48] Backless benches read as coffee tables, a long low step in front of an altar as a second bench, a plain font
  as a birdbath; brown furniture on a brown floor sank. What made a chapel read at a glance (6 vs 3.5 in BOTH slot orders, b49):
  closed box pews seen from behind (rounded end boards standing above a lit cap rail, a solid back, a shelf of books varied per
  pew) in two straight columns facing the altar, a red runner up the aisle, the altar standing ON a deep platform, a candle stand
  each side (two different ones, not mirror twins), a lidded font with a cross, and a pale stone floor so the dark wood stands out.
- [judging] When two rounds flip with the slot (new wins in b, loses in a), the rooms are tied: judge the next change in both
  orders at once, and count it only when both prefer it.
- [props sweep] Flat ground pieces (mud, tarps) must have NO outline and no lit ring parallel to their edge: an outline and
  a pale terrace make them a raised pancake. Wet is darker than dry, never paler. Hedges are leaf clumps lit on the upper left
  with a quiet middle, never single-pixel noise; pieces that tile need no outline across the joining edge.
- [props sweep] Labels on a cabinet front read as drawer pulls: a produce stand needs open crates or shelves with the fruit
  IN them and the price cards on stakes. A well must show its wall height and a deep hole, never a low flat ring.
- [props sweep] A rework can score lower than the draft it fixes: keep every judged draft (the dead tree and the street lamp
  went 6 -> 5 after "fixes"), and when a revision loses, go back to the version that won.
- [props sweep] A jack-o'-lantern reads when the skin is dull brown-orange and the carved holes are the brightest thing. A
  marble is a round 4 px ball with one glint (a plus-shaped 3 px "ball" reads as a gem sparkle). A child's toy needs the one
  silhouette part that names it (a horse's long muzzle and two ears; a shoe's pale sole, laces and ankle opening).
- [props sweep] **[repeated]** A comment written in the middle of a line swallows the code after it: the lumber's sawn ends and
  a rail's post shadows vanished that way. Put a comment only at the very END of a line, and brace-check after every edit.
- [props sweep] Anything hung must hang FROM something: a twine cord from a real branch, 3-8 px long. Small dark dolls read as
  bats or seed pods. A pale doll with a round 5x4 head, two dark eyes, a 1 px neck, arms out, a dress and split legs reads at 1x.
- [props sweep] Brick with only course lines and no head joints reads as stacked planks. Keep faint head joints (one tone down)
  across the face, crisp ones only at the corners, one tone per brick, and sooty brown-red, never saturated orange.
- [props sweep] Hoops evenly spaced edge to edge read as banding or a barcode. A silo wants a few bowed hoops at uneven spacing,
  broad flat concrete bands, stave joints only near its edges, and orange-brown rust from the dome lip (crimson drips read as blood).
- [props sweep] Corrugated tin: each seam a 2 px rib (a lit line and a dark line), sheets a tone apart, one lifted sheet breaking
  the outline, a solid shadow under the eave, rust stains widening toward the eave. A honey door with a brass knob reads as candy.
- [props sweep] Identical plants or turves in a grid read as a stamp or a barcode (carrot bed, peat stack): jitter spacing and
  size, use 2-3 variants, leave gaps. A dock's evenly spaced side nubs read as clips; a darker near-end face with pilings shows height.
- [props sweep] Lighting a slate roof plane by plane: the lit plane steps up in VALUE; the top slate tones are cool, so pushing
  them reads as powder-blue ice. Stop a step short.
- [props sweep] A hung doll reads at 1x only when it dangles in OPEN AIR below the branch (cord 5-9 px, nothing behind its body) and
  its dress is a step DARKER than its pale head; pale dolls tight against pale bark read as buds or seed pods.
- [props sweep] Tyre wear drawn as hashed cells reads as camouflage blocks; draw it as continuous wavy wheel tracks, one tone down.
- [props sweep] Clumps laid over a fill with a gap-toothed top edge get outlined into battlements: wave the fill's top edge so
  nothing is left for the outline to bite.
- [props sweep] Dress values swing: too pale and the dolls are buds on the bark, too dark and they sink into the twigs. A hung
  figure needs THREE separate values: pale head, MID dress, dark cord/branch.
- [props sweep] A woodshed is open-fronted: a dark bay behind the stack makes it read; a closed wall makes it a cabin with a woodpile.
- [props sweep] When a rework loses or ties, restore the code to the judged winner and check the render byte-for-byte (cmp) before
  installing, so a later re-render cannot quietly swap in an unjudged version.
- [process] **[repeated x3]** Edit scripts: a replacement that ends in a `//` comment must END ITS LINE. Check after each script
  that the text right after every replaced span is a newline, or move the comment to the end of the line.
- [props sweep] Big set pieces pass when drawn in the game's own 3/4 camera: show the deck top, the far rail, the round plan. A
  face-on elevation of the same thing loses every time.
- [props sweep] "Abandoned for years" needs the ground to take it back: flat tyres, tall mixed grass grown up over the sills and
  wheels, a dead (not bright) headlight. A neat row of tufts along the sill says parked.
- [props sweep] A basin, well or fountain must show WALL HEIGHT; a flat oval of water reads as a pond or birdbath. A tall dark
  rectangle at the foot of a stack reads as a door (a tower or kiln): a fireplace is a low arch in a wider base.
- [props sweep] Thin legs and posts drawn as stepped doubled strokes read as twisted cable: one clean tube on a fixed slope with a
  continuous lit left edge.
- [props sweep] A small crop or turf repeated on a grid reads as dots or bricks; FEWER, BIGGER units in uneven clumps read as the
  thing (a dozen 7x5 beets beat forty 5x3 ones). Soot is staining that fans and fades in a darker version of the brick, never
  one black stripe (a stripe reads as a crack or a tar run).

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
- [repeated, woodshed r1-r3] A log pile is NOT a grid of identical rounds: a '+' or a full ring on a 3-4 px face reads as
  a button or a gear, and saturated orange ends read as candy. Draw dull tan ends (the brightest step only top-left), a
  1 px bark rim, a single dark heart pixel off centre, three sizes, a third of them split wedges, a third darker, and a
  short bark cylinder above the top logs so they show their length. Stack it against the wall, not beside the sprite.
- [shack r1] Neglect reads from the OUTLINE first: a roof that is a perfect rectangle with level eaves reads as kept,
  whatever is drawn on it. Sag one end 2-3 px (shift whole columns, eave shadow too), take shingles out of the ridge line
  and lift one past it. A dark red hole reads as a wound: the loft is plum-brown with grey lit battens.
- [shack r1] Peeling paint is a few big patches over 2-4 boards with staggered ends, flat silver-grey; many short runs
  with dark lips at each end read as grit. Rain stains run down from the sills (one step darker, 1-2 px wide).
- [Fenn r1] A log corner is two walls crossing: alternate courses, a round side-wall end standing 3-4 px proud then the
  front log ending flush in a sawn face, so the column zigzags; identical nubs one per course read as a bead chain.
- [shops] A trade reads from what stands at the door, not the sign: planks for the carpenter, an anvil and quench barrel
  for the smith, a millstone for the miller. Props in front of a wall need their own dark outline or they sink into it.
- [slate r5] Quiet middles work for slate too: one tone per course and no lit tips away from the edges; the full joints
  and the odd lit tip stay at the eaves, hips and rakes. Next for walls: stone and brick gridded at one contrast edge to
  edge read as grit; quiet the bay middles (bigger stones, joints one step off the face), keep joints crisp at corners.
- [story check] Read the region's description before drawing its building: Old Marrow's chapel was an intact white
  chapel with a roof where the story says "a roofless chapel" (burnt 1872). The sprite has to tell the place's story.
- [ruin r1-r2] Roofless reads only when no roof shape survives: a front gable triangle with clean trimmed rakes reads as
  roof planes even in grey stone. End the front wall in a broken stepped top, show the far wall's inner face in shade,
  let it fall to sky in ragged blocks (a straight diagonal still reads as a rake), put lancet holes through it. Openings
  of a roofless shell are lit inside, not black.
- [Harlan r1] Boarded UP is the opening covered: boards wider than the frame, a tilted one, a split end, nails, a notice
  on the door. Two boards on one window read as shelves; equal planks in the wall's own grey read as louvred shutters.
- [Harlan r1] Rust on a derelict tin roof: whole sheets rusted brown (the lg ramp, like the barn) and runs that start at
  the eave; orange 1-2 px stalks in a row read as candles, and more than two rusted sheets read as painted stripes.
- [shack r1] Mending reads when the new wood is whole boards (full length, a step lighter and warmer, nail at each end)
  and a whole block of new shingles with crisp edges; short stubs read as brackets or hinges.

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

## Furniture and props in four turns (Nov 10: 3D blockouts, 69 pieces judged blind vs the installed art)
- A stain is not an object: no outline, no lit ring, no sparkle marks. A flat ragged blot two steps darker than the boards, drawn along the grain, with a darker dried edge.
- A shape centred on an oval reads as an eye (a plate with food in the middle): set the food off centre and draw the plate's well.
- Anything sticking out equally at both ends reads as ears or wings (a saddle beam, a horn and a cantle the same height). Make the two ends different in size and shape.
- A curled animal drawn as a tall dome reads as a hat: keep it a low oval wider than tall, the head a separate round with pointed ears, the tail along the front.
- Marks repeated at the same x on every layer line up into a column (spacers read as drawer handles): stagger them.
- Two equal spikes at the ends of a shape read as ears (a saddle became an owl). Make one end lower and rounder. A rack whose bars match its tools in tone and width reads as a cage or a chair.
- Each crop on a stall needs its own hue and a full value range, or the heaps read as loaves or mud. Rods that cross and fork read as twigs: lean each at its own angle, never crossing, with the reel at the butt.
- Gouged eyes (judge, three rounds): pale rims or pale lips round a dark eye read as spectacles. Draw a dark ragged hole, pale scratches running OUT of it and a dark run down the cheek; then it reads as scratched out.
- One clean ramp per material: a cushion in three or four close reds reads as patchwork. One body tone, a lit top edge, a darker front roll.
- Shop props (judge, Nov 10): a row of the same thing (chicks, fruit, hammers, reels) reads as a barcode: vary size, facing and height. Blue steel drifts into powder blue: keep iron dark. A trade object must survive at 1x: fruit 3x3 or bigger in mounds, tools 2-3x wider than a line, rods one clean tapering line each.
- Seats (judge, Nov 10): the seat top is the lightest plane, the back two steps darker; leave a 2-3 px gap between back and seat so they are two things, not one slatted face. The seat seen from above is shallower than the back is tall.
- Under a seat: a dark shadow right under the lip fading toward the floor; a flat grey slab under it closes it off and reads as the base of a chest. No bottom line across it.
- A pew from behind: a solid panelled back with finial ends reads; a full shelf of upright coloured spines reads as a bookcase. Two or three books lying or leaning on a narrow ledge, no more.
- Eleven identical boards in a row read as a fence or barcode: vary the widths, or use two or three long raised panels.
- Wall decor (judge, Nov 10): glass stays dark but the frame needs a lit top-left bevel two steps above it, or both merge into one black slab at 1x. A horror beat (a figure in the mirror, gouged eyes) must be drawn hard enough to read at 1x: dark ragged holes, not pale lens shapes (they read as spectacles).
- A poster is something pinned up: a tack or a tape strip and one curled corner; an empty lower third looks unfinished, and a round beige stain reads as a coin.
- [repeated] Judges lean toward slot b: re-run every narrow b-slot win with the slots swapped before installing. The oil drum and the signpost won 6-5 from slot b and lost from slot a; so did the barrel, tyres, crate and chopping block (5 of 5 flipped). A 6-5 from slot a held every time (tool chest, bookcase, plant).
- The trade object must be the biggest, highest-contrast shape, and it must read at 1x: the watering can, the plank and saw, the breastplate and helmet. Small grey tools on brown are invisible.
- A pale plank reads as paper. Use warm tan pine with end grain.
- A round red-and-pale ring reads as an archery target. A shield is wood with an iron boss and a dark rim.
- A grindstone must be drawn as a wheel: a lit rim ring, an axle hub, a crank and a trough. A half-disc reads as a tombstone or a bell.
- A light source has to glow: a lamp, candles and a jack-o'-lantern each need an amber flame with a pale core as the brightest pixels.
- A barrel or drum top must be a step lighter than its sides, with the lid ellipse showing. A dark lid makes a blob.
- Rows of identical stamps (tins, books, fish, firewood, sprouts) read as a barcode. Vary size, colour and spacing, and leave gaps.
- Saturated colour reads as candy: honey wood, lemon brass, powder blue, salmon. Pull every hue a step toward this game's dull, weathered range.
- 21 of 51 side and back views were blank slabs. Every end panel needs its own detail (a frame and stiles, handles, edges) plus a 2 px sliver of the working face.
- Seen from the side, a tall back board reads as a chair back. Keep back boards to a short lip, and show the long top run.
- Things stacked one above another in a side view read as a totem or snowman. Keep pieces on one ground line, overlapping front to back.
- A wheel or a clothesline seen edge-on is a pole. Give it width (a tyre 5-6 px, a hub standing proud), or show the hung items as slivers.
- Bed stains read as logos when drawn as solid shapes. A stain is an irregular blot one step darker. A blanket needs a turn-down fold and a drape over the sides.
- Elevation 30 shows a lot of front and little top. Long flat things (beds, garden beds, rugs) need extra length in the model to keep their top area.
- A horizontal ring needs axis 'y' (the renderer's default ring faces the viewer).
- A redraw can lose to its own first round: crates (5 -> 3) and chess (3 -> 3, now a tablecloth) got worse. Keep the better round's model and change one thing at a time.
- A light reads only if the flame is several pixels with a pale core; a 2 px glow inside glass is a blue bottle.
- Seen from the front at elevation 30, a rocker's runners hide behind the legs. Push the runner tips well forward of the feet and make them lighter than the frame, or the chair reads as a dining chair.
- Spines must sit two value steps above a dark case back, or the books go to mud.
- The blockout renderer has no transparency: anything inside a glass shape is hidden. Make the glass itself the lit material (a glowing chimney) or put the flame outside it.
- Faces turned straight at the camera (log ends, barrel heads) get little light at elevation 30: give cut-end materials extra ambient light or they go dark.
- Long logs seen end-on show as bark strips; for a woodpile that reads as round ends, keep the logs short in depth.
- Flat-topped pieces (tables, chess boards) read better from 45 degrees than 30: more of the top shows (furn3d ELEV per piece).
- The 'iron' ramp reads powder blue next to warm wood: use cast iron (near-black blue-grey) for hoops and frames.
- Rendered grain on dark wood reads as drips or hair: keep grain to mid-tone tops, with long, sparse streaks.
- Folds drawn as thin lines read as tears; a fold must be a broad soft ridge (lit crest and shadow), or leave the cloth plain.
- With the new piece always in slot a, close calls go to slot b: only a clear lead from slot a counts.
- A turned piece keeps its footprint: a long table turned shows its full length running up the screen, not a shrunken square top (table end view 4/10 at 26x26).
- A cradle's rockers curve along its length only; seen from an end they are two short feet. Its two ends differ: the hood end shows the hood's closed back, the foot end shows the open mouth.
- In a turned view, things beside one end of the piece end up in front of it (the armour stand at the left end stands in front of the near end when turned), overlapping it.
- A back view is a turn, not a copy: everything on the piece swaps sides (pots, tools, sack).
- A back must keep the trade: plank ends and a saw handle over a carpentry bench's back board, planks on its shelf.
- A hood with a near-black inside reads as a hole; use the darkest plum-brown step, and let the far lip show above the near shell.
- Open space under a table fills with outline if legs, stretchers and far legs sit 1-3 px apart: draw only the near legs, and only a soft fading shadow under the apron.
- [owner-level] One camera for every view: a horizontal top is drawn at about three-quarters of its real depth in the front, the back and both sides (METHOD.md: a cube's top is 32x24). Shallow fronts with long sides read as the camera jumping from level to overhead.
- Things on one end of a piece stay on that end through every turn: a keg's tap end is far in one side view, near in the other and on the left from the back.
- A mirror is only a correct turn for a piece that is the same at both ends: when the ends differ (a vise, a grindstone, a stand), draw the left side separately, with that end's things at the far end.
- Turned sideways, a bench keeps its full length running up the screen (about the front's width) and its depth across (about the front's top depth plus a little); half-length tops read as cabinets.
- From the front, a rocking chair's runners hide behind its legs: the old splayed feet hint at runners better than straight legs on a flat rail.
- Outdoor props: never speckle for texture (burlap, bark, rust); use a flat base tone, two or three broad shapes (fold curves, bark grooves, rust streaks) and a lit edge.
- Wood end grain is dull tan, brightest at the top-left, with one dark heart pixel off centre; dark rings read as doughnuts, cream caps as brackets.
- A mailbox reads side-on (a long domed tube, its flag up) with its name board; end-on it reads as a mushroom.
- A barrel reads best side-on (bellied staves, hoops, the tap on its end); end-on it reads as a clock, a beehive or an owl. Draw the side as the front.
- A small chess board on a deep table top reads as an upright pane or an abacus: keep the old pedestal table until a flat board at half its width beats it.
- Brass arcs and frames are the brightest, most saturated shape; keep them thin and dull so the object (the globe) stays the main shape.
- Dark iron (candelabra arms) goes spidery on a dark floor: give its lit faces a cool blue-grey rim.
- A barrel on its side needs its body showing behind the head (a band of staves above it with a hoop across), or the head reads as a flat clock or a hooded owl.

- A raised deck needs a front face a step darker and cooler than its top (a rim board and a dark lattice skirt), or it reads as ground level however many steps lead down from it.
- Deck and porch boards run along the wall in 5-px rows: a dark seam, a lit top edge, two close face tones, staggered butt joints with nail heads. One flat brown with a few dark lines reads as mud or a mat.
- A door above a deck needs a stoop up to its sill in the deck's own wood; a pale stoop reads as paper.
- Mirror-copied halves (two rail sections) get one break: a sprung baluster, a replaced post.

- A net or any mesh must keep its holes open: the outline pass fills every hole next to a strand, so mask the mesh out of the outline (NOOL) or it reads as a tapestry or moss.
- A hanging net reads from its drapes: 3-4 gathered folds, a lit crest and a dark trough each, the mesh tighter in the troughs, the hem scalloped with sinkers; corks bunched where it is gathered, not evenly spaced.
- "Crooked" has to show in the outline: a lean of 3-4 px from a mended splice, an arm that droops. A straight grey post reads as a pipe.
- A lit lantern lights its neighbours: a warm 1 px rim on the arm's underside, the brace and the post's lantern side, and a pale core in the flame.
- A box seen from above needs its lid lighter than its front (the lit floor through a lid's mesh, the dark inside through the front); a crab clinging on top reads, a crab behind wire does not.
- Rope coils: two or three thick turns shaded as tubes, the lay twisting across them, dark gaps; thin concentric rings read as a doughnut or a log slice.

- Hung fish read as fish only with a fish's parts: a forked tail tied up, a dorsal fin, a gill arc, an eye, an open mouth. Identical evenly spaced shapes read as a barcode, bats or bottles.
- A boat needs its sheer: the inside (boards, seats, an oar) seen from above and the near side's lapped planks below the lit gunwale. A symmetric pill reads as a blimp or a seed pod.
- Patina is one body tone with a lit band and a few streaks running down from the shoulder, never scattered single dark pixels.

- Tiled pieces are judged as runs: a fence tile that runs away from you must stop its rails under the post behind (drawn earlier, so the near tile would paint over it) and keep the outline off the join, or the run reads as beads or capsules.
- Anything unique on a tile (a rot patch, a broken picket) repeats every tile: keep tile damage small and light, or it becomes a rhythm.
- A jar of sweets is 2x2 balls in staggered rows, lit top-left; a checker fill reads as dither.
- A drum or barrel lid is a step lighter than its sides with a lit rim; hoops are raised (a lit ridge over a dark underside) and bow down toward you in the middle.

- A prop must stay apart from the ground in greyscale: fence rails at the grass value vanish; lighten them a full step above it.
- Runs of rust are orange-brown and start at a seam; crimson runs read as blood, yellow-green as slime.
- Steam is two or three soft puffs over the source, not thin hooked lines (they read as hairs).
- A plate from above is about 1.6:1, its well an inner ellipse a step darker with a lit far lip; a long ellipse reads as a tray.
- A small creature on a busy surface (a crab on a wire lid) needs its own dark outline and to break the object's silhouette.

- A black animal needs a pale ground under it (a cushion) and its ears breaking the outline; a dark dome on a dark mat reads as a loaf or a hat.
- A rim light that crosses onto the head reads as a collar: stop it at the neck.
- Dried flowers are four to six separate stems of different lengths with small dull heads (straw, rust, faded mauve), a dark line where a head meets its stem; round pink balls read as fresh pom-poms or candy.

- Two raised points on either end of a curved shape with a hanging panel between them read as horns over a face (a saddle side-on read as a bull's skull). Keep a saddle's ends low and round, and give it context (a blanket, a rope) before detail.

- Stairs you climb are laid on the ground (a flat decal under whoever is on them), never sorted like a wall: sorted at their base they are drawn over the climber and you seem to walk through them. Their run up the screen must equal the wall's rise, and their sides need collision the whole length, past both ends (owner: "the stair for the chapel is useless... you just walk through it").
- Every building whose door sits on a foundation needs door steps (steps, door_w, door_dx in its sprite data), the chapels too.

- In a turned view, every loose thing keeps its own footprint: a stool beside the keyboard stands on the floor at its own depth (up the screen), not on the case's near floor line, or its legs grow three times too long.
- The side of a shelf or cabinet reads as that object only if its open edge shows what is on the shelves, row by row, brighter than the end panel; a blank panel under a long lid reads as a post or clock case.

- A tall narrow side view needs its lid a full step lighter than the end panel and the contents strip wider (5-6 px) and brighter than the panel, or it reads as a post or clock case; a candle flame must be 3-4 px with a pale core and the brightest thing on the piece.

## Outlines, light, colour

- Outline round the whole object once, a darker version of its own colour, lighter on the lit top-left; never an outline
  round every internal bundle (it reads as cut-out pieces).
- Light from the top, slightly left (LPC: keep it mostly centre).
- Ramps: shades toward purple, lights toward yellow, no pure colours. About 6 colours per 32x32 area (measured on LPC).

## Process
- [repeated] Never end an inline code replacement with a // comment: everything after it on that line (closing braces) is commented out. Use /* */ or put the comment on its own line, and run node --check on furn_hd.js after every edit.

- When a narrow win is re-run with the slots swapped, it often flips (cellar hatch and red drum, Nov 10: new 6 vs 5 from slot a, old 6 vs 4 from slot b). Never install a narrow win without the swapped re-run.
- Installing over an existing sprite must keep its anchor when the size is unchanged (floor and wall pieces are anchored their own way; the trapdoor moved 14 px when the installer reset it).
- [Nov 10] An `if` dropped into the middle of an if/else-if chain adopts the chain's trailing else: the hurt's impact
  frames fell back to the idle stance. Put per-case overrides AFTER the chain, and re-render every character a change can touch.

- Silhouette first, then masses, then detail. Skipping straight to clusters produced polka-dot bubbles.
- Placing clusters along mathematical lines (perimeters, boundaries) looks mechanical, like piped icing.

- Tools in hand (judge, Nov 10): an axe head drawn round reads as a pan or spade; it needs the flare, a beard toward the hands and a poll behind the haft. A pick seen end-on must show the point leading, never a white ball. A pick's crescent is thick at the haft and tapers to 1 px points, not an even-width sickle.
- Debris (judge, Nov 10): pale specks vanish into the dirt they fly over; the darker clods with an outline read better. Outline debris in its own darkest tone, never near-black.
- Hurt on broad bodies (judge, Nov 10): if the guard fist doesn't reach the chin, a single raised arm reads as a wave or a hail. Check that the guard hand is actually drawn at the chin on every body width. Two near-identical frames waste an in-between, and the eyes must not pop open on the last frame (open them a frame earlier).
- Hurt (judge r7, Nov 10): one hand raised beside the head reads as a hat-tip, a salute or a wave whatever the other hand does. A struck pose must read in its silhouette: the head and shoulders knocked back, the body twisted, the forearms up in front of the face.
- Glow (judge, Nov 10): a dark-red ember reads as blood or rot. Kindling light must be amber/orange and brighter in value than the surface it sits in. The light shows through the holes, so the source (the candle) must kindle too, not only the walls.
- Waking (judge, Nov 10): a slump by day has to be big enough to hide the face (head well forward and rolled) or it reads as standing. Spread the change across every frame, with no two frames alike.
- Derelict buildings (judge, Nov 10): neglect is read from broken silhouettes and materials (missing or sprung boards, a lifted roof sheet past the outline, sagging, cracked glass), not from recolouring or sprinkled specks. Draw wear as shapes where water runs (eaves, seams), never as dots spread over a plane.
- Upgrade tiers (judge, Nov 10): each tier must read as its material at 1x: copper a pink-gold highlight, steel blue-GREY (a saturated blue reads as enamel or ice), rust red-brown oxide (grey-brown reads as mud), a gem tier dark with a hard glint (a mid teal reads as verdigris and looks like a sidegrade). The top tier must look the most precious.
- A water stream must visibly change every frame at 1x (move its highlight dashes 2 px a frame), and it ends in a splash with a darker wet patch on the soil.
- Buildings (sweep, Nov 10): the roof is the biggest mass; texture it only where the eye reads the material (eaves, edges, hips, round dormers) and keep the middle of each plane quiet, lit as a volume. A flat roof seen from above shows its top. A pale frame round a roof reads as a box lid. Every eave, awning and porch roof casts a solid shadow (never a checkerboard). One-of-a-kind homes need their own massing, not a recoloured template.
- Roof light (judge, Nov 10): a light falloff drawn as stepped diagonals reads as painted glare bars or glass shine. Light a roof by its planes: the left hip a step lighter than the front, the front mid with at most one block-shaped lighter step at the upper left, the right hip dark. Never let blue slate's lit step reach powder blue (it reads as ice).
