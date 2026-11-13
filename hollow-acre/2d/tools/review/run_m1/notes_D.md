# Notes D: farming, fishing, mining, making, shops, business, festivals, menus, settings, social, multiplayer (run_m1)

Reviewed: all 28 contact sheets for these sections, plus about 45 single shots, report.json stops #329-#476 (sfx, checks, steps,
buttons) and the bot's own code wherever a shot looked like the bot caused it. None of these stops recorded fps (`noFps`) or page
errors. Every step passed, and all 10 menu buttons did something.

## What stops it feeling finished (ordered by impact)

- **[ui] high. The long shops have no way out on screen.** Where: `0403_shops_mae.png` (Coyle's General ends mid-row at "Tire, used"),
  `0405_shops_hollis.png` (ends at "A seed drill"), `0414_shops_v_forge.png` (cut through "Sell ore"), `0424_shops_land.png` (cut
  through "The east bank"), `0406_shops_plans.png` / `0434_business_building_plans.png` (cut at "Field lanterns"), `0415_shops_v_carp.png`,
  `0416_shops_v_feed.png`. None of them shows a Leave/Close button, a scroll bar or a fade. The orange mark in the top-right corner is
  a decoration, not a close button. The short shops do show one ("Leave" on `0404`, `0417`, `0418`, `0419`). Why: REVIEW 2A "every
  dialog has an obvious way out"; on a phone the only exit is hidden under the list. Fix: pin the header and a Leave footer to
  the panel, scroll only the list, and fade the last row with a down arrow when there is more.

- **[layout] high. Hale's heart event is staged behind a lamp post.** Where: `0467_social_heart_event_hale.png`, Hale at
  (50.3, -13.1). The lamp's head sits over his face and its pole runs down his body. The event title "Pastor Hale — Seventy-one bells"
  is printed on top of the toast "You've started to notice things about Pastor…", so neither can be read. Why: DESIGN_GUIDE
  checklist "Overlaps and clipping"; LESSONS "Staging a cutscene prop among world objects". The flaw toast (flaws.js) fires 1 s
  after the second talk with anyone, and nothing holds it back while a scene runs. Fix: check each stage mark against props (keep 1 tile
  clear of posts and lamps). Queue all toasts while a stage, scene or cine is on, and play them after it ends.

- **[sound] high. Talking to anyone in daytime makes no sound. This explains #461-#463.** Where: `0461_social_talking_to_agnes.png`,
  `0462_social_talking_to_dunn.png`, `0463_social_talking_to_silas.png` (sfx `{}`). The other talks look as if they had sound, but they
  did not: Mae's `note` is the background music (game.js:353, `SFX.note` from the music timer), and the `~hiss`/`~tone` at Hale, Tobias,
  Hollis and June are rain or ambient noise. talk() only plays a whisper hiss at night. Agnes, Dunn and Silas simply fell in a gap in the
  music. Why: REVIEW 2A "Silent, motionless actions read as unfinished"; in Stardew every dialog line ticks. Fix: a soft
  per-character voice blip while the line types (pitched by person, darker for the elders), and the existing `page` sound when the
  box opens.

- **[complete] high. The festivals look half-built.** Where: `0436`/`0437` Harvest Market (day 7): one townsperson in sight, and the
  "stalls" are four bare cloth tables with nothing on them (`0437`, right of the bandstand). `0438`/`0439` Pumpkin Weigh-in (day 14):
  a table with three pumpkins and a scale, and nobody at the scale. `0440`/`0441` Lantern Dance (day 21, 5:30 pm): the lanterns are not
  lit, the scene is as bright as the 11 am festivals (mean brightness about the same as `0438`, only warmer), an empty plank floor with no
  dancers, and June greets you "Morning." at 5:30 pm. All four use the same square, the same two lantern strings and the same benches.
  Only the Hollow Fair (`0442`) has booths, a tent and five or six people. Why: LESSONS festival booths ("A recoloured copy… reads as a
  copy"); REVIEW 2E "Does the town feel alive?". Stardew festivals put the whole cast on one screen doing the thing. Fix: put
  the cast on the square at every festival. Put goods on the market tables (produce crates, jars, a price slate), a judge and a queue at
  the scale, couples dancing on the boards, and lit lantern glow after 5 pm. Give each festival one dressing of its own, so the four
  days can't be mistaken for each other at a glance.

- **[ui] high. The game has four UI looks.** Where: dark wood double frames with corner pieces (shops `0403`, benches `0410`,
  backpack `0449`); cream parchment books (`0425` farm book, `0429` ledger, `0454` journal); a flat single orange line with a tiny "Done"
  (`0472_settings_display.png`, `0473_settings_sound.png`); and no frame at all, with rounded see-through cards floating on the dimmed farm
  (`0474_multiplayer_play_with_friends.png`, `0475_multiplayer_Host.png`). Tabs come in two styles too: flat grey browser-like tabs on the
  backpack/menu (`0449`-`0455`) against the dark wood tabs of the farm book and journal (`0425`, `0454`). The ledger's action buttons are
  flat grey (`0429`). Why: REVIEW 2A "One look: the same UI frame, buttons, fonts". Fix: keep the wood frame for every panel, the
  parchment only for books, and one tab style (the farm book's). Redraw settings and multiplayer in the wood frame with full-size
  buttons (tap targets of 44 px or more; "Done" and "Back" are about 45x20 px now).

- **[ui] high. "Every font seen was Hollow Pixel" is not what the shots show.** The bot's check reads the CSS font-family of DOM
  text. It can't see text drawn on the canvas or glyphs that fall back to another font. Seen in shots: the speech bubbles over
  people use a thin, soft-edged monospace (`0440` "Morning.", `0442` "Swing from the hips, not the arms.", `0347` "Soaked to the skin");
  the map labels are a smooth serif and italic serif ("Old mine", "THE QUARRY", `0452_menus_menu_Map.png`); the minigame HUD uses a
  separate blocky capitals face (`0400` "PERFECT"/"PIECE 2/3", `0445` "RECORDS"); and the "Wave" button shows a full-colour system emoji
  hand (`0455_menus_the_bag.png`). Why: LESSONS "UI type: one pixel family for everything; a smooth serif… clashes". Fix: draw the
  bubbles and map labels in Hollow Pixel with hard pixels. Replace the emoji with a drawn pixel icon. Confirm the minigame caps face is
  Hollow Pixel's display cut, or swap it in. Extend the check to canvas text and fallback glyphs.

- **[ui] medium. The talk box hides the two people talking.** Where: `0461` (Agnes at (-99.7, -118.1): neither she nor the player is
  visible anywhere on screen), `0462` Dunn, `0463` Silas, also `0457`, `0459`, `0460`. The box sits at the screen centre, which is
  where the camera puts the player. Why: DESIGN_GUIDE checklist "Do bubbles and toasts cover the action?" Fix: dock the talk box
  at the bottom (Stardew's place for it) and keep the speakers in view above it.

- **[story] medium. Tobias's heart event tells you about a drawing instead of showing it.** Where: `0468_social_heart_event_tobias.png`
  ("Tobias — The drawing": "little round heads in a row… a black stick figure with an orange circle for a head"). It is a text card on a
  dimmed screen. Why: LESSONS "Heart events that show, not tell" (owner) and "When the text says someone looks at a thing, bring the
  thing up close in a card". This is the strongest horror image in these stops, and it is never drawn. Fix: a close-up card of the crayon
  drawing, in plain 2x pixel crayon strokes, with one line under it.

- **[ui] medium. Tall panels cover the goal bar.** Where: `0403`, `0405`, `0414`, `0424`, `0452`, `0454`. The top of the panel cuts the
  "The car Repair 1/7…" line in half. On the map (`0452`) the bottom button row (Leave world / Code / Close / Craft) is cut off by the
  panel's lower edge. Why: LESSONS "A tall panel must not cover the HUD and cut its numbers. Hide the HUD while the panel is open". The
  farm book and ledger already do this (`0425`-`0431`). Fix: hide the HUD under every tall panel, as the books do, and fit the map
  panel to the screen.

- **[sound] medium. Opening panels and switching tabs is silent.** Where: the menu tabs Social, Skills and Map (`0450`-`0452`, sfx
  `{}`); the shops and benches `0403`, `0404`, `0406`, `0407`, `0409`, `0411`, `0413`-`0415`, `0417`-`0419`, `0421`, `0424`; the land
  office and plans (`0433`, `0434`); settings (`0473`); and all the multiplayer screens (`0474`-`0476`). The game has a `page` sound,
  played 93 times elsewhere in the run. Why: REVIEW 2A "Feedback on every action". Fix: a page turn for books, a wood knock or
  latch for shop and bench panels, and a soft tick on tab change.

- **[ui] medium. Toasts are paragraphs, and they sit on what they describe.** Where: `0466` (three lines over Caitlyn's talk box),
  `0468` (four lines behind the Tobias card), `0467` (colliding with the event title), `0352_mining_deeper_floor.png` ("Somebody has
  scratched tally marks into the wall" sits on top of the back wall where the marks would be; no marks show on the rest of the wall).
  Why: LESSONS "A toast is the size of a phone screen's middle: one line" and "Every caption fact needs its detail in the picture".
  Fix: one-line toasts. Send the longer "you've started to notice" lines to the journal with a short "Journal: Tobias" toast, and draw
  the tally marks on the floor-5 wall.

- **[story] medium. The voice breaks in several places.** Where: the Together tab explains co-op "like Stardew" (`0455`), next to a
  "Ha ha" emote and a colour emoji. The weather toast reads "Tuesday. rain by mid-morning." with a lower-case r (`0343`). "Morning." is
  said at 5:30 pm (`0440`, `0441`). The shipping bin says "Click… Shift-click" (`0337`) where the backpack says "Tap" (`0449`). The
  professions are Stardew's names word for word (Rancher/Tiller, Forester/Gatherer, Miner/Geologist, Fisher/Trapper, `0451`). Why: REVIEW
  2A "The same tone in every line of text (dark, dry, plain)". Naming another game inside this one breaks the spell. Fix: rewrite
  the co-op line in the valley's voice ("Open the farm. Others can come and work it with you."). Swap the emotes for drawn ones
  (Wave, Nod, Laugh, Afraid). Capitalise after the full stop. Choose the greeting by hour. Use "Tap" everywhere. Give the professions
  names of this valley's trades.

- **[fun] medium. The making games are reskins of each other.** Where: the chair (`0355`-`0357`, "Cut the legs to length") and the
  oak club (`0367`-`0369`, "Saw the blank") are the same saw scene, the same bench and the same ring-closes mechanic. The still
  (`0395`-`0397`) and the lamp-oil flask (`0379`-`0381`) are both the kitchen stove with a pot and a HEAT bar ("Hold for more fire. Keep
  the heat in the green." word for word). Soup, ale wort, still and flask all use one tiled kitchen. The furnace and the mail shirt share
  the forge wall. The press and the butcher's weighing step share the barn wall. The brass sprinkler is riveted as a long gold plank on
  the carpentry bench (`0375`-`0377`). Why: LESSONS #266 (owner) "one tap-the-marker bar dressed up for every step is not a game of
  that step"; LESSONS Brewery "Two stations side by side must not share a kit… What makes a pot a brewer's and not a cook's". Fix:
  give the still a pot still with its worm and a spirit-safe tap (not the soup pot), let the club be shaped with a drawknife or
  spokeshave (not the chair's saw), make the sprinkler a brass head on the vice, and give the brew kettle and the still their own room
  from the kitchen.

- **[clarity] medium. After Skip, a making game just disappears.** Where: every making "result" stop (`0358`, `0362`, `0366`, `0370`,
  `0374`, `0378`, `0382`, `0386`, `0390`, `0394`, `0398`, `0402`) is the bare world by the mine with no toast and no item card.
  The fair games at least say "You walk away from it." (`0445`). The games are also long: the auto-player was still on step 1 of 3
  or 4 about 9 s in, in most of them (`0357`, `0361`, `0365`, `0389`, `0393`, `0397`). Why: REVIEW 2A "Feedback on every action";
  a player can't tell whether the chair was made or the wood spent. Fix: always close on one line ("Oak chair made, plain" / "Nothing
  made. Nothing spent."). After the first good result, offer "Make it plain" on the bench so the fifth soup doesn't mean another full game.

- **[ui] medium. Shops write costs as sentences; the benches show them.** Where: `0405` "Needs 40 coins (3036), 5 copper ore (0).
  Still need 5 more copper ore.", the same in `0414`, `0406` and `0415`. The benches (`0409`-`0413`, `0420`-`0423`) show an icon and
  "0/3" per ingredient. Why: LESSONS UI pages: "showing things, not saying them: item icons with counts, the coin icon beside every
  price" and "Two numbers with the same unit side by side read as a typo". Fix: give the shop rows the bench's ingredient rows. Also
  in `0414`, the greyed Smelt buttons print their price twice ("6 coins / 6 coins", "10 coins / 10 coins"), which is a plain bug.

- **[clarity] medium. The bench button says "Done" when you can't make the thing.** Where: `0407_shops_cook.png` (Turnip soup, 0/2
  turnip), `0410_shops_b_farm.png` (Brass sprinkler, Farming 2 needed), `0423_shops_b_butcher.png` (hen, "You have 4." and no reason
  given). craftui.js labels the button 'Done' whenever `r.can` is false. "Done" next to "Close" reads as "finish", and `0423` never says
  what is missing. Why: REVIEW 2D "Buttons where you'd look for them"; LESSONS "A risky button must say what it does". Fix: put the
  reason on a greyed button ("Needs Farming 2", "Needs 2 turnips", "Needs a cleaver"). Keep "Done" for things that are truly finished.

- **[ui] medium. The journal's ruled lines strike through the text.** Where: `0454_menus_menu_Journal.png`. The rules cross
  "In 5 days · Pumpkin Weigh-in", "dock), 4pm–7:30pm" and Caitlyn's paragraph. Her entry also says "Runs the general store." twice,
  and "Loves Pumpkin, Egg." reads like a data dump. "The story so far" under Chapter One is the single line "Follow the goal at the top
  of the screen." (for this tour save). Why: LESSONS "Ruled paper lines must match the text's line pitch… otherwise strikes through
  text". Fix: set the rule pitch to the body line height, or drop the rules. Remove the repeated line, write "Loves pumpkins and eggs.",
  and give each chapter a two-line summary from the start.

- **[layout] medium. Mine floors 1, 5 and 12 are the same room.** Where: `0350_mining_inside_the_mine.png`, `0352`, `0354` (mine,
  about (433, -54)). The ladder, cart, crate stack, barrels and lift cage are all in the same places, and only the ore changes. Why:
  DESIGN_GUIDE checklist "Repeats"; REVIEW 2C "Does each region have its own character?". Twelve floors down should feel
  worse than floor 1. Fix: three or four room shapes, plus dressing that gets darker with depth (collapsed timbers, wet black walls,
  the tally marks, the lift cage only where the toast mentions it).

- **[ui] low. The minigame HUD is never explained.** Where: three red squares bottom-left, gold squares bottom-right, and a thin
  vertical meter on the right edge, in every making and fair game (`0396`, `0400`, `0446`). Verdicts also land on the tool: "PERFECT
  X5" on the hammer and board (`0377`, `0385`), "PERFECT" on the hammer hand (`0384`). Why: LESSONS Making minigames "Keep verdicts
  off the tool and the line being worked" and "A gauge belongs next to what it measures". Fix: give the squares icons (a heart for a try,
  a star for quality), label the side meter, and fix the verdict's spot above the work.

- **[clarity] low. The HUD chips can't be read.** Where: the chips under the goal bar, a basket "1", a lantern "95% +1" and a car
  "0/7" (`0472`, also `0465`). The basket and lantern icons are dark brown on brown, and "95% +1" has no label. They are on every
  screen. Fix: lighter outlined icons, and one tap to show a label ("Lantern oil 95%, 1 spare flask").

- **[ui] low. Ledger shares are hard to read.** Where: `0429_business_ledger_shares.png`. The "+5% · 275" buy button is the same flat
  grey as the locked perks under it, though you hold 3036 coins, and the "0 of 50%" bar is drawn solid near-black, so it reads as full.
  Why: LESSONS "A progress bar needs a stated full"; one button style. Fix: a wood button for buy, greyed-with-reason for locked
  perks, and an empty track drawn light with a dark fill.

- **[art] low. Fair-game props read as other things.** Where: the ring-toss pegs are little lidded pots (`0444`, zoomed), and the crows
  in the crow shoot are one sprite repeated at even spacing (`0446`). Why: LESSONS festival booths ("a peg became a mug", "Things
  spaced evenly and pasted as copies (crows on a shelf…) read as wallpaper"). Fix: tapered pegs with a lit top and a shadow under
  the base, and two or three crow poses, flipped and staggered.

- **[complete] low. The "Code" console looks like a developer tool.** Where: "Code" is a main button beside Close on every menu tab
  (`0449`, `0453`), and opens a bare ">" prompt, "type a code, Enter", with no title, laid over the panel frame (`0455`, `0456`). Why: REVIEW
  2A "Clean edges… the code console: do they look like part of the same game". Fix: move it into Settings (or a hidden key). Give it
  the wood frame, a title ("A code from the valley") and a line on what codes are.

## Run caveats (seen in the shots but caused by the bot, so not game bugs)
- The making title plates show internal keys (`b_still:white_dog`, `cook:soup`, `b_furn:chair`…). The bot calls `mg4Run(MG4R[k], k)`,
  passing the key as the title. The game's benches pass the recipe name (the car shows "Winch it off the oak", the fair shows
  "Pumpkin carving").
- The goal bar reads "The car Repair 1/7" from day 7 to day 28. That is the tour player's skipped story state.
- Weeds and a rock under the crops in the tilled strip (`0334`): the bot set `t.tilled=true` directly, without clearing.
- `0465` "giving a gift" shows no gift screen (the bot opened Caitlyn's gift while standing at June), so gift feedback is unjudged.
- `0476` "profiles" is the Play-with-friends screen again, so profiles were never opened. In `0432` the bot made the shop directly and
  no storefront is in frame, so that is unjudged.
- Every making game was Skipped at about 16 s, so no finished-result screen was seen.
- Otto overlaps the player on the dock (`0343`, `0349`) because the bot teleported onto the fishing spot. The fishing minigame is
  owner-rejected (#215), so it is not reviewed here.

## Already feels finished (keep it)
- **The farm loop's feedback** (`0330`-`0342`): the hoe, the can (with a water spout) and the harvest each animate and play `till`, `water`
  and `harvest`. The turnip pops up over your head. The bin says "6 things, about 36 coins in the morning", and the overnight slip counts
  up with a coin sound.
- **Shop and bench writing**: "Fair prices. Weird hours. Don't ask about the hours." The peddler "breathes wetly under the hood". "One
  label just says NO." The butcher's block: "the shape of a great many years". Dark, dry, plain: the voice the whole game should have.
- **Bench panels** (`0409`-`0413`, `0420`-`0423`): an icon grid, one item card, ingredient rows with counts. This is the model for the shops.
- **The minigame frame**: one wood frame, title plate, "1/3 · bold verb" step line and Skip on every making and fair game. Moody dusk
  sets with one light source.
- **The fair games** (`0444`-`0448`): each has its own scene. The bell's records board ("GIDEON 96 / MAUD 88 / YOU 0") with HOLLOW at the
  top, "Shoot the crows. Never the girl.", and a top-down apple tub.
- **Farm book and calendar**: the Land tab shows the land as a map (`0425`), the Hands have one-line lives (`0426`), and the books hide the HUD.
  The calendar's 29-31 in red with 31 circled (`0453`) is a good quiet scare.
- **Talk portraits and lines** (`0457`-`0464`) have character, and the names are right (Caitlyn Coyle, Everett Coyle in Social `0450`).
- **Settings → Sound** "Play alongside my music" (`0473`), and the host rules page warning "They can't be changed later" (`0475`).
