# How Hollow Acre's art is drawn

Every sprite is placed pixel by pixel, the way a person draws pixel art. Nothing is taken from outside asset packs, and
no noise, blur, gradient fill or blending decides a final pixel. Studied from the published methods of pixel-art agent
projects (with-pebbly/aseprite-ai-artist, diivi/aseprite-mcp, willibrandon/pixel-plugin; all MIT) and the tutorials they
cite (saint11, Slynyrd Pixelblog, Pixel Joint, Derek Yu); their text and art are not copied here, only the method.

## The order (cheap mistakes first)

1. **Palette.** 4 to 5 steps per material, hue-shifted: warm light, cool shadow (the autumn crowns run from a violet-brown
   deep to a warm yellow highlight). Lock it; every colour in a sprite is one of its palette entries.
2. **Silhouette.** One flat colour. It must read as the thing when filled flat black.
3. **Masses and light.** Block the big light and shadow masses with the fewest colours; one light direction (top-left).
4. **Detail on the borders only.** Leaf notches on the silhouette, leaves interlocking across each light/shade border,
   bark stripes and cracks placed by hand. Interiors stay quiet. One leaf pattern per tree.
5. **Clean-up.** No stray single pixels (at most a deliberate glint), no banding (borders wander, they don't run
   parallel), no pillow shading, no doubled or uneven lines.
6. **Look after every pass**: `grid.py view` (zoomed with a pixel grid, at 1x and 3x, and in grey for the value check).
7. **Validate**: `grid.py validate` (colours and cap, off-palette, near-duplicate colours, stray pixels, banding,
   semi-transparency, outline share).
8. **Blind critique**: a separate reviewer that did not draw it gives a cold read, a score out of 10 and the one fix that
   matters most; between two versions it only says which is better and why. A change is kept only if it wins.

## Trees (the bundle method)

Draw one round leaf **bundle** by hand (rim, body, shade, notched edge, interlocking leaf borders, a few highlight
blobs), and a second smaller one. Build the crown by stacking copies back to front, the back and the right stepped one
shade darker, over one flat dark back mass so no hole shows. Where bundles meet, the lit side of the front one against
the shaded side of the one behind replaces an outline. The darkest step sits only along the crown's bottom edge.
Trunk: a cylinder with vertical bark stripes, a crack and a knot by hand, and a root flare; its top inside the crown.

## Files

- `grid.py`: `build`, `view`, `validate`, `ascii`, `lint`. A `.pxg` file holds the palette, modules (small hand-drawn
  grids), stamps (a module placed at x,y, optionally flipped or stepped lighter/darker as a whole) and block-in masses.
- `nature/`: the trees' bundles, trunks and assembled crowns.

## LPC style (the target look)

From the public Liberated Pixel Cup style guide (written so artists can make new, original art in this style) and the
LPC Revised guide: 32x32 tile grid; top-down about 60 degrees, orthographic (no perspective), diagonals 1:2, a cube's
top 32 wide by 24 high; "toon" rendering with medium-low texture, shade in blocks, block out volume first, detail
sparse and mostly on edges; light from above, slightly left; ramps never one hue (shades toward purple, lights toward
yellow, no pure colours); outlines a darker version of the object's colour, lighter where lit (characters near-black);
drop shadows #322125 at 60%; no dithering; props: strong difference between lit top and sides, contrast with the
ground, always a shadow. Measured on LPC art (measured only, nothing reused): about 6 colours per 32x32 tile.

## LPC-style broadleaf tree (what worked)

One round crown volume, not a pile of balls: a round lit dome offset to the top-left (and a small brighter patch in it),
a shade crescent bottom-right, the deepest step on the bottom rim. Texture is one V-shaped leaf tuft repeated on a
staggered lattice, always one step darker than what is under it (one step lighter on the dark side of a border): dense
on every zone border and in the shade, sparse in the lit dome. The rim: the same tufts standing proud round the lower
two thirds (serrated), small bumps on top. One outline round the whole tree. Trunk tucked up under the crown; drop
shadow; a few fallen leaves.

## The approved method: 3D blockout, then the hand finish (owner: "very good"; use it for everything)

1. Block the object out in 3D with simple shapes in a scene file (`blockouts/<name>.json`): spheres and ellipsoids
   (foliage gets `lumps` for bundles and `lumps2` for leaf clumps), cylinders (trunks, with `flare`), `branch` tapered
   capsules (forks, roots), boxes. Camera `elev` 30. Light from above, slightly left and front; `shadow_light` is
   steeper and from behind-left so the cast shadow falls short and down-right.
2. `python3 blockout.py blockouts/<name>.json blockouts/<name>` renders the toon-banded reference (ramp letters per
   material; `ambient`, `shade`, `hi`/`hi_at` per material).
3. `python3 finish.py blockouts/<name>.grid.txt <out>.pxg blockouts/<name>_finish.json` does the hand pass: melts
   clusters under 8 px, leaf shapes on light/shade borders at uneven spacing, leaf tips and notches on the silhouette,
   deepest step only on the bottom edge, bark grooves, a lit edge, a knot, fallen leaves, one outline.
4. `python3 grid.py view <out>.pxg <png> 4`: look at it at 1x, 3x and in grey; then a side-by-side for the owner.
5. Colour variants are palette swaps of the same grid; shape variants are a new scene with the bundles moved.

## Which method for which art (owner, after the side-by-sides)

- 3D blockout + hand finish: nature (trees, pines, bushes, rocks, stumps) and vehicles. It won those comparisons.
- Code-drawn ("math": shapes placed by formulas in tools/ase/*.lua, chibi3.js, portrait code): buildings, props,
  people, item icons, chat portraits. It won every comparison for those.
- Every new or redrawn math version goes to the judge (the pixel-critic agent, blind, score out of 10, one first fix)
  and is only swapped in when it beats what is in the game and scores 6+ (owner, Nov 9: "allow a 6 to be the requirement").
- Layouts come before buildings: plan each place (streets, lots, spacing, facing, sight lines) and check the plan in
  the game before drawing or redrawing the buildings that fill it.
