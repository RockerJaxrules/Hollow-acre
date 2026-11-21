# Polish backlog gathered while building t330-t335 (for the final pass, alongside the bot's notes)
- Shadow direction is inconsistent valley-wide: people/props cast down-left, trees down-right (light is top-left, so shadows should fall down-right everywhere). Engine-wide.
- Water glints are sprinkled evenly; gather them into a few wind lanes. Engine-wide water drawing.
- Toasts (z-index 60, set in fixes321 so messages show over open notes) now cover an open book's tabs (e.g. "Day 1. Dawn" over the farm book). Delay the toast while a note is open, or place it clear of the note's header.
- Machines toward 7: the milker's engine is a copy of the feed mill's; one-blade turn marker on the windmill; paper label on the grease tin; the hen feeder's empty frame keeps a sack shadow.
- Farmhands toward 7.5: pick point vs stone value; crop heaps read as eggs; Walt's swing copies Hannah's frame for frame; Dell's cans walking S; Hannah reads as a man at 1x.
- Low Fields: the creek is a straight line in regions code (collision too); a meander would need the old creek moved.
- Low Fields (after r6): furrow right ends still taper to pencil points (end at a ragged width with 2-3 lit clods, crumble the trench's straight lower edge); fallen leaves on grass still read red (the rust-brown recolour applies on water/region only?); dock rosettes too small to read (8 px with a seed stalk); yellow leaves drawn over post tops; chime post close to a gallows read.
- Performance: Chrome warns 'Multiple readback operations using getImageData' (sprite recolouring: handSheet/handSheet3, hands333 sheets, f2Sleeve, stores art): create those canvases with getContext('2d',{willReadFrequently:true}).
