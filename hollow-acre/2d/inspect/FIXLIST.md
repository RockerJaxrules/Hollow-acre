# Inspector fix list

What the inspector (`tools/inspect/tour.js`, 177 stops: every building, gathering spot, named place, region milestone and
room, by day, dusk, night and rain, on PC and phone) found, plus a visual review of stitched overviews of the farm, Marrow
Hollow and Wickham (`overview.js` + `ovstitch.py` in the scratchpad tools).

## Numbers, three runs

| run | overlaps* | in water | twin buildings | people in walls | errors | fps min / avg |
|---|---|---|---|---|---|---|
| baseline (old art) | 14 | 0 | 0 | 0 | 0 | 52 / 61 |
| after the art pass | 14 | 0 | 0 | 0 | 0 | 43 / 61 (one chunk-load stall) |
| after the map pass | 4 | 0 | 0 | 0 | 0 | 52 / 61 |

\* not counting the terrace-wall pieces, which overlap by design. Of the 4 left, the bucket by the well and the sacks in
two rooms are meant; the white pumpkin and jack-o'-lantern on the farmhouse step is the only real one.

The "unreachable samples" count (151) is the same in every run: the sampler tests points inside the far regions against
the town's path grid. The reachability test (`treach.js`), which checks every door, interaction, gathering place and
story spot, finds all 163 reachable.

## Fixed

- Every house was the same 8 drawings; now each household has its own house (13 one-of-a-kind houses, 2 barn variants).
- Chimneys stood beside houses (drawn as a column from the ridge to the wall top); they now rise out of the roof.
- Route 9 ended in a straight cut lined with cobbles; it now crumbles into a gravel forecourt at the farm gate, the fence
  stops at the road's shoulders, and the sign, milestone and mailbox stand at the gateposts.
- A vertical fence piece reached two tiles up, so a gap read as a pole across the road; fence pieces reach one tile.
- Trees were sprinkled evenly over the open country; the core valley now has groves with meadows between.
- Houses had no way to their doors; stepping stones now run from each door to the lane.
- The sheriff's car sat on a lawn; it has a gravel drive.
- 16 small props stood inside bigger ones (a pumpkin in a barrel, a gravestone through a shed wall, hedges through
  porches, saplings in boulders); a declutter pass removes the smaller one.
- The farm's milestone stood under the farm-stand shed; moved to the gate.
- The dirt had small pale ovals that read as footprints or skulls; the light tone now comes in big soft areas.

## Still to look at

- The white pumpkin and jack-o'-lantern on the farmhouse step overlap (they're placed after the world is built, when the
  house is swapped for its mended version).
- Wickham's back lawns, south of the street, are empty; gardens or allotments would give them a use.
- The far regions haven't been stitched and reviewed the way the farm, town and Wickham have.
