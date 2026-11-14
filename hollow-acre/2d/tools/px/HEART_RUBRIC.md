# Heart-event judge — judge every small part

A heart-event cutscene frame is only done when **every** item below passes at **every** key beat. A single holistic
"6/10" is NOT the judge — it is blind to depth and placement (it passed Otto drawn *behind* the boat). The judge is this
decomposed checklist, applied with the scene's INTENT in hand and the game's own sprites beside it for a style match.

## 0. INTENT (write it before judging)
One line per scene stating what the frame must show: each figure, each prop, and the **placement relation** of every
figure to every prop — one of **IN / AT / BESIDE / BEHIND / HELD**. This is the ground truth the judge checks against.
(Otto: seated **IN** the rowboat, line off the bow. Silas: standing **IN** the open grave while digging.)

## 1. Per element (every figure and every prop in the frame)
- **a. Reads (cold read).** Its flat silhouette reads as the thing it is. An unreadable prop fails.
- **b. Placement & depth matches INTENT.**
  - **IN** a container (boat, grave, barrel): the container's **near** edge occludes the figure's lower body, the
    **far** edge sits behind the figure, the figure's body is *within* the container's footprint. NOT floating above it,
    NOT peeking over the far rim from behind. Verify by eye — a blind score cannot.
  - **AT / BESIDE**: figure stands on the ground, correct front/back ordering (nearer thing drawn over farther), their
    feet meet the floor at the right depth line, no interpenetration, no gap that reads as "floating apart".
  - **HELD**: the object sits in the hand/at the hand height, moves with the figure.
- **c. Grounded.** A contact shadow (#322125 ≈60%, down-right) under anything on ground; a figure in water/pit needs its
  waterline/rim instead. Nothing floats; nothing hovers a pixel above its own shadow.
- **d. Scale.** Right size against the figure and the other props (grave ≈ 2× a person long; a chair seats a person; a
  well is chest-high). No prop that's a person's size reads as a crate/appliance.
- **e. Light.** One light direction, top-left: lit top, shaded right/underside; consistent with every other element and
  with the scene's hour. Values survive greyscale (not muddy, not blown out).

## 2. Whole frame
- **f. Style match.** Palette is 4–5 step hue-shifted ramps that sit seamlessly next to the game's real sprites in the
  same frame; one bold outline; NO gradient, blur, dither, pillow-shading or banding. Any hand-drawn addition is
  indistinguishable in finish from the real game art beside it. Prefer the game's own sprite when one exists.
- **g. Composition / framing.** One clear focal point; the camera frames the subject; nothing important is cut by the
  frame edge or hidden behind the dialogue box; overlaps read cleanly (no two things fusing into an ambiguous blob).
- **h. Mood.** Fits the scene's tone (dusk / storm / night horror); lighting supplies the mood, the values do not turn to
  mud.
- **i. Polish.** No stray single pixels, no clip seams, no UI/render artifacts (stray bars, half-drawn sprites, mis-anchored
  props), elements aligned to the pixel grid.
- **j. Animation (across beats).** Motion is smooth: no popping/teleporting of a figure or prop between beats, no hitching;
  a figure entering/leaving a prop (climbing out of a grave, standing from a seat) transitions, it doesn't snap. Intended
  hard cuts are allowed.
- **k. Makes sense.** The whole beat reads as a deliberate, professional cutscene moment that matches the dialogue and the
  story — a stranger seeing the still understands what is happening.

## The process
1. Render every key beat at real resolution; crop cleanly (never let a half-cropped dialogue frame masquerade as a
   floating bar).
2. Go item by item **by eye** for every element and the whole frame. Write PASS/FAIL + the specific defect. Depth and
   placement are judged here, by looking, not delegated.
3. Second opinion where a fresh eye helps (style match, readability, polish): give a critic the **INTENT** and a **real
   game-sprite reference**, and ask the *specific* item ("is the figure seated INSIDE the boat — near rim across the lap,
   far rim behind — or behind it?"), not a blind holistic score.
4. Pass only when every item passes at every beat. Then show the owner — their reaction is the final verdict.
