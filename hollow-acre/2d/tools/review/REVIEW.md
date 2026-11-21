# Hollow Acre: the whole-game review (t337)

The owner asked for a bot that "does the whole game quickly and looks at the whole game like a human and then writes notes on
what it thinks needs to be improved, what doesn't look right and all", and said what it is for: **"This bot will be used to do
the final layer of polish to make this feel like a complete game."** The bot (`playthrough.js`) plays; this file is how the
looking and the notes are done. The question behind every note is: *what stops this feeling like a finished, shipped game?*

## 1. Run it

```
node t337/playthrough.js http://localhost:8766/<build>.html t337/run_<n>      # full run, about 12 minutes (the story player reaches THE END in ~6)
node t337/playthrough.js http://localhost:8766/<build>.html t337/run_<n> --quick   # about 6 minutes, fewer stops; the story stops partway
```
The build must be a non-mangled test build (e.g. `test2d_k.html`, or a copy of it with `<base href="/">` on top when it sits
in a sub-folder); the bot reaches into the game through `__game.ev`. Two players run at once: one plays the story from the title
screen to the credits and starting again, the other walks the world and tries every system.

It writes:
- `shots/NNNN_<section>_<what>.png`: what a player saw at each stop (1280x720).
- `report.json`: every stop with the game state (day, hour, room, place, chapter, goal), fps, page errors since the last stop,
  the sounds the game played since the last stop (`sfx`), and the automatic checks: text spilling out of its box, a toast over
  the player, broken images, NaN/undefined in the HUD, the fonts the visible text is set in, placeholder or debug text. Also
  every step that FAILED or was FORCED (the bot couldn't play it and moved the story on itself), and `buttons`: every menu button
  pressed once and whether anything happened.
- `sheets/<section>_NN.png`: contact sheets, six stops a sheet with captions (`!` marks a flagged stop).
- `summary.md`: the run at a glance: time, stops per section, story reached, forced and failed steps, errors, flagged stops,
  actions that made no sound, fonts in use, placeholder text, menu buttons that did nothing, and every story goal in order.

## 2. Read it like a player, section by section

Open every contact sheet of a section, then the single shots where something looks off. Write down only what a player would
notice. Each note says **what**, **where** (the shot file, and place/coordinates from report.json), **why it stops the game
feeling finished** (the rule below, the owner's own words, LESSONS.md or DESIGN_GUIDE.md), and **what would fix it**.

### A. Does it feel complete? (the owner's purpose: check this first, everywhere)
- **One look, one voice.** The same UI frame, buttons, fonts and text sizes on every screen (summary: fonts in use). The same
  tone in every line of text (dark, dry, plain; no modern slang, no jokes that break the mood; names consistent: Caitlyn not Mae,
  Everett not Pip).
- **Always a next step.** On every screen a player knows what to do and where to go: the goal bar says it, the arrow points,
  every dialog has an obvious way out. No dead ends after a story beat, a chapter card or a festival.
- **Nothing half-built.** No screen, tab, button or bench that opens and does nothing, shows an empty list with no explanation,
  or sells something that can't be used (summary: menu buttons that did nothing). No placeholder art, placeholder or debug text,
  "undefined", "(bot)", TODO (summary: placeholder text).
- **Feedback on every action.** Every action a player takes answers back: a sound (summary: actions with no sound), a little
  motion or particle (dirt when you hoe, a splash when you water, a pop when you harvest, coins when you sell), a number or toast.
  Silent, motionless actions read as unfinished.
- **Transitions.** Doors, sleeping, chapter changes, cutscenes, minigames opening and closing: a fade or a cut that feels
  intended, never a flash of an empty frame, a half-drawn room or a jump. Compare the mid-transition shots.
- **The first ten minutes.** Loading screen, title, character creation, the drive and crash, arriving, the first lessons: is it
  gripping and clear? Does it teach without walls of text? Does the horror land early?
- **The ending.** The last beats, the choice, the credits (names right: Jaxon Charlton), the end card, the morning after, the
  title after finishing, continuing from the save: does it close the story and invite more play?
- **Pacing.** Time between story beats: long stretches with nothing new, or beats piled on one day? (summary: story goals in
  order, with their day and time.) Does every chapter feel different from the last?
- **Clean edges.** Loading, saving, continuing, the settings and options, the multiplayer screens, the code console: do they look
  like part of the same game and behave predictably?
- **Performance.** fps under 50 anywhere, stutters at transitions, page errors (summary).

### B. Art and look (DESIGN_GUIDE.md, LESSONS.md)
- Does every screen read as one game: same pixel scale, outline weight, light from the upper left, contact shadows under
  everything on the ground? Soft or blurry edges, muddy colours, gradients, a sprite in another style?
- Anything floating, sunk, clipping into a wall, standing in water, or drawn in front of/behind the wrong thing?
- Repeats: the same prop or tile pattern copied across a screen; two identical buildings side by side.
- People: faces, hair and clothes readable at 1x; facing the way they walk; no arms drawn as lines, no "cursed" poses.
- Night, rain, fog and interiors: can you still read what matters? Anything pitch black that shouldn't be?

### C. Layout and place
- Can I tell where I am? A landmark? Does each district and region have its own character?
- Empty screens or cluttered ones? Paths that lead nowhere? Blocked doors?
- Interiors: back wall band, furniture against walls, clutter that says who lives there, light from windows, right size.

### D. Readability and UI
- Can every label, toast, bubble, note, menu and minigame instruction be read at a glance? Does any cover the player, the target
  or each other? Text cut off or spilling out (flagged)? Too small on a phone?
- Buttons where you'd look for them; every screen with a clear way out.

### E. Clarity, story and fun
- Steps the bot had to FORCE: each is a place a player might get stuck. Say why, from the screens around it.
- Do the story beats land: readable, dark enough, each different from the last? Chapter cards, the drawing, Tithe night, the
  ending, the epilogue shown properly?
- Does each minigame look finished and have a clear goal? Is the farm loop satisfying? Does the town feel alive?

### F. Bugs (report.json)
- Every page error with its stop; stuck states (FAILED steps, timeouts); broken images; NaN/undefined in the HUD. (Failed
  WebSocket connections to multiplayer relays are the test machine's network, not the game.)

## 3. Write the notes

Write `NOTES.md` in the run folder:
1. **What stops it feeling finished: the top 15**, ordered by how much each one stops Hollow Acre feeling like a complete,
   shipped game (a stuck story step or a broken screen first; then things a player meets in the first ten minutes; then things
   on every screen, like a missing sound or a second font; then one-off rough edges).
2. Then by section (Opening and first ten minutes, Chapter One, Chapter Two, Chapter Three and ending, World, Interiors,
   Farming, Fishing and mining, Making minigames, Shops and money, Farm book and business, Festivals, Menus and UI, Settings and
   saving, Multiplayer screens, Bugs and performance). Each note: what, where (shot + place), why, fix. Mark each
   **[complete]**, **[art]**, **[layout]**, **[ui]**, **[clarity]**, **[story]**, **[fun]**, **[sound]** or **[bug]**, and
   **high / medium / low**.
3. **What already feels finished**: a short list, so the polish pass doesn't break it.

Judge it as the owner would: they want it close to Stardew Valley in finish, and darker. Be specific and honest; don't pad.
