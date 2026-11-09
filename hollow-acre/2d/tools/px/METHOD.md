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
