# Hollow Acre: the whole-game review (run_m1)

The bot played the build with the Low Fields and the round 3 stores (hollow-acre-2d-mainst.html), from the title screen to THE END and on into the credits, then toured every system. The run took 737 s and made 477 stops, with no page errors and no forced or failed steps. Four reviewers then read every contact sheet, about 190 single shots and report.json, section by section. Their full notes, each with the shot file and where it was taken, are:
- notes_A.md: the opening, Chapter One, night and horror.
- notes_B.md: Chapter Two, Chapter Three and the ending.
- notes_C.md: the world and the interiors.
- notes_D.md: farming, fishing, mining, making, shops, business, festivals, menus, settings, social and multiplayer.

Items gathered while building t330-t335 are in t337/POLISH_BACKLOG.md.

The owner's aim for this pass: "This bot will be used to do the final layer of polish to make this feel like a complete game."

## What stops it feeling finished: the top 15

1. **[bug] The goal bar breaks at the peak of Chapter One.** Once all three stones are lit, `objective()` throws, so the arrow points 109 m away while you stand at the stone (A1). **Fixed** in game.js.
2. **[ui] You can't leave the long shops.** Coyle's, Pruitt's, the forge, the land office, Farm Plans, Hartley's and Feed & Stock all run off the bottom of the screen, with no Leave button and no sign that the list scrolls (D1).
3. **[complete] The chapter cards misfire.**
   - Chapter One's card looks like the end of the game. It has New game, the credit line and the true ending's "Free play" goal, and says "1 DAYS" (A3, B3).
   - Chapter Two's card is hidden under the sale slip, then shows three times later on (B1).
   - Chapter Three's card stays on over the next morning's note (B1).
4. **[complete] Finishing leads nowhere.**
   - There is no end card after the credits.
   - The title screen still says CHAPTER ONE.
   - Continue drops you on the Tithe House steps on the last night.
   - The credits are 10 px grey text on black, with 20 s of silence (B2).
5. **[clarity] An honest player can stall on the candle step.** At that point you have about 5 coins, three candles cost 135, and nothing hints at how to raise the money. The bot hid this by topping up its coins (A17).
6. **[ui] Toasts land on what you're reading.** They cover Grandpa's first letter, the shops, dialog titles, the event titles and the jump-scare face, and get lost behind minigames (A4, A11, A13, B, D). **Partly fixed:** polish337.js now holds them while a panel or scene is open.
7. **[ui] Big rooms open with you hidden.** You stand under the hotbar, and the back wall sits under the goal bar: Coyle's, the garage, Hartley's, both inns and the town hall (C1).
8. **[ui] The game has four UI looks and several typefaces.**
   - Panels: wood panels, parchment books, flat settings panels, and multiplayer cards with no frame.
   - Tabs: grey browser-style tabs.
   - Type: speech bubbles in a soft monospace, map labels in a serif.
   - Icons: a colour emoji (D5, D6).
9. **[sound] Talking is silent in the daytime.** Opening a shop, a bench or a book and switching tabs are silent too (D3, D10).
10. **[story] The biggest beats are told in a box instead of shown.**
    - Tithe night's crowd isn't there.
    - The dozen townsfolk at your door in "the woods take one" never appear.
    - Caitlyn's open door and her shoes aren't shown.
    - Your name on the drawing slip never gets a close-up.
    - The reunion with Caitlyn is narration in a bubble with no speaker.
    - The Hollow at Chapter One's climax is behind a wall.
    - Agnes and the ribbon, the farm sign going by again, and Tobias's drawing are all described, not drawn (A2, A7, B4-B7, D8).
11. **[story/art] The Tithe House in the world isn't the one in the story.** The world has a cosy clapboard house with eight lit windows. The story describes a windowless house with a nailed door inside a ring of stones (B).
12. **[complete] The festivals are half-built.**
    - The market stalls are empty.
    - Nobody stands at the weigh-in.
    - The Lantern Dance has unlit lanterns, nobody dancing, and June saying "Morning." at 5:30 pm.
    - All four festivals use one square and the same dressing (D4).
13. **[layout] Every home is the same box.**
    - About 18 homes share one shell and one stock set of furniture.
    - The Lamplighter and the Lantern Inn are the same room, and the two schoolhouses are one classroom.
    - The big shops are sparse, with nobody behind most counters at noon (C).
14. **[clarity] Arriving by milestone doesn't show the place.**
    - The Deep Corn milestone shows no corn.
    - The Reservoir shows no water and no steeple.
    - The Lookout shows no tower.
    - The Low Fields show no plough.
    - The Fen, the Birches and Greyfield work (C).
15. **[first ten minutes] The opening doesn't show the crash.**
    - The first frame is an empty road with the wreck off screen.
    - The car is drawn three ways, one of them in mixed perspective.
    - The wreck never changes across the seven repairs (A5, A6, A8).

## Next tier (each is in the section files)

**Pacing and tone**
- Chapter Two (about 25 goals) runs on a single day, while days 7-8 of Chapter Three are empty.
- A birthday toast shows every day, even over the darkest beats.
- The "your face, your name" reveal repeats nine times (B).

**Transitions**
- Closing a close-up leaves its caption at full strength over the world.
- The cinema bars stay up after a scene ends.
- The player vanishes from the church aisle, and comes out of the crypt inside a lamp post (A12, B).

**Making games**
- Several are reskins of each other: the chair and the club share one saw scene; the still and the flask share one stove.
- After Skip or the end, nothing says what was made.
- A bench says "Done" when you can't make the thing, and gives no reason (D).

**UI pieces**
- Shop costs are written as sentences.
- The journal's ruled lines strike through the text.
- The HUD chips have no labels.
- The ledger's buy button reads as locked.
- The Code console looks like a developer tool.
- The character creator has no panel.
- The build text shows on the title screen (A, D).

**Art**
- The well braid ignores the player's hair colour.
- The deer close-up is the world sprite blown up.
- Seven story close-ups are rough drafts.
- The sheriff's car looks 3D-rendered.
- Grandpa's cabin floor holes are black dashes.
- The greenhouse bed is speckle.
- There are identical pumpkins at every door.
- The candle light pools read as mats.
- Rain is invisible on a storm night (A, B, C).

**World**
- Buildings go see-through when you walk behind them, and leave a stray dark rectangle at Coyle's.
- At the ferry, a tree hides the player completely.
- The quarry and the old mill don't read as what they are.
- Some paths stop short.
- Mine floors 1, 5 and 12 are the same room.
- Wickham has no region card of its own (C, D).

**Performance**
- Grandpa's cabin runs at 47 fps.
- Canvas readback warnings (POLISH_BACKLOG).

## Already feels finished (keep it)

- **Writing:** the voice (dry, dark, plain), Grandpa's letter, the register, the letters from yourself, and the shop and bench lines.
- **Title screen:** the title screen and the one pixel font on the page.
- **Rhythm:** 60 fps almost everywhere, and every farm action has its sound and motion.
- **Car repairs:** the repair games, the bench panels, the minigame frame and the fair games.
- **Close-ups that work:**
  - the county line;
  - the October calendar;
  - the fen;
  - the lookout wheel;
  - Dunn's list;
  - the grave;
  - the birch dolls.
- **The story's big scenes:**
  - the drawing in the church;
  - the undercroft rescue;
  - the five locked endings on Tithe night;
  - the story gated by time and tools.
- **Places:**
  - the town at night;
  - Greyfield;
  - the ferry landing;
  - Room 6;
  - Agnes's house;
  - Brannock's forge;
  - Silas's coffins.
- **Mind effects:** the Day 0 and the blank clock.

## How the fixes are being worked

Each fix that adds or changes art goes through the blind judge to 6+.

- **Already done** (polish337.js and game.js):
  - item 1;
  - toasts waiting for open panels and scenes;
  - "Journal updated." as a pulse on the Menu button.
- **Work package UI** (items 2, 6-9 and the UI pieces): one frame and one tab style, shop lists that scroll with a pinned Leave button, talk and panel sounds, the talk box docked at the bottom, tall panels hiding the HUD, bench buttons that say what's missing, and making games that say what they made.
- **Work package Story** (items 3-5, 10, 11 and the pacing and transition items): the chapter cards, the end card and the morning after the ending, the candle hint, staged scenes in place of the boxes, and the Tithe House.
- **Work package World** (items 12-15 and the world, art and performance items): starts once the farm move (t339) is in, since that changes the map.
