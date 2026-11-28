# Notes B: Chapter Two, Chapter Three, Ending (run_m1)

Scope: sheets chapter2_00-08, chapter3_00-07, ending_00-01; stops #163-#353. All of these stops logged no page errors and no
FAILED or FORCED steps. fps held at 60-62 everywhere except #181 (53, at the mill, x 30 z 99.9), and that is still above 50.
Ordered by how much each one stops the game feeling finished.

## Broken or stuck-looking

- **[bug] high. Chapter title cards show up at the wrong time and get drawn over other UI.** Chapter Two never gets its big
  title card when it starts. On the morning it begins, its parchment "Chapter Two: The Tithe" card sits under the "Sold
  overnight" slip, which hides it (`0169_chapter2_note_summary_The_Tithe.png`). The big "CHAPTER TWO / The Tithe" card then
  appears about 50 s and 20 goals later, three times in a row, during the Three stones errand: at the Black Lake dock, at the
  hollow tree and in the cabin (`0230_…Three_stones.png`, `0231_…`, `0233_…`, each time the clock jumps). Chapter Three's
  "The Door" card is right at the start (`0237`), but it stays on into the next morning. It is drawn straight over the "You
  dreamed" note, where "CHAPTER THREE" runs through the line "pushing on the door" (`0240_chapter3_note_The_last_days.png`),
  and it is still faintly over the player at `0242`. Why it matters: a chapter card is the loudest signal a game gives. Firing
  it mid-chapter and repeating it reads as a bug (REVIEW A "Transitions"; LESSONS "Cards that ask the player to wait": a card
  never sits on what the player is reading). Fix: fire each chapter card once, on the first free frame after the chapter flag
  changes. Queue the sale summary behind it. Clear the card before any modal or time-skip fade, and never reuse it as the fade
  overlay.

- **[complete] high. Finishing the game leads nowhere new.** The stop labelled "end card" (`0344_ending_end_card.png`) is
  just the cast list mid-scroll, and the next frame is the title screen. No held final card appears anywhere in the ending
  shots. The title screen after finishing still says "CHAPTER ONE · THE HOLLOW" above the opening blurb ("Grandpa called
  three days ago…") (`0348_ending_title_after_finishing.png`). Continue puts you back on the Tithe House steps on Day 10 at
  8:20 PM, at night in the graveyard. The goal reads "Free play: The field is quiet now. Grow whatever you like."
  (`0353_ending_continued_from_the_save.png`, x -26 z 87.3). Nothing in the world has changed, there is no morning after, and
  no epilogue. Why it matters: REVIEW A "The ending" asks whether it closes the story and invites more play. Here it does
  neither: it looks like a save from the last night. Fix: hold a real end card after the credits ("Hollow Acre", the ending
  you got, "Jaxon Charlton", a small picture of the valley at dawn). After finishing, wake the player in the cabin on Day 11
  with a short epilogue morning (Caitlyn at the door, the Tithe House changed). On the title screen, swap the chapter line and
  blurb for an after-ending line (for example "After the Tithe"), plus a mark that you finished and which ending you got.

- **[story] high. The end of Chapter One is dressed as the end of the game, and the real ending copies it.** At #163-166
  (`0163_chapter2_chapter_2_begins.png`, `0164`, `0166`) the card shows "Chapter One complete", a "New game" button, "Next
  autumn, the town draws lots again." and "Everything by Jaxon Charlton". The goal becomes "Free play: The field is quiet now.
  Grow whatever you like." That is word for word the line shown after the real ending (`0353`). The summary also files the
  story as reaching "THE END" on that line. Why it matters: a player can fairly believe the game is over after day 1 and quit,
  and when the real ending comes it feels like a repeat of Chapter One (REVIEW A "Always a next step", "The ending"). Fix: drop
  "New game" and the credit line from the chapter card. Swap "Next autumn…" for a hook into Chapter Two ("In town, the bell
  rings on its own."). Give Chapter One's free-play goal a pointer to tomorrow ("Sleep. Something will be different in the
  morning."). Keep "The field is quiet now" for the true ending only.

- **[story][art] high. The Tithe House in the world contradicts the story's description of it.** The close-up shows "A house
  with no windows inside a ring of stones. Its door has been nailed shut a hundred and fifty times" (`0171_…closeup_The_Tithe.png`).
  In the world the same spot (x -26 z 87-91) holds a cosy two-storey clapboard house with eight lit, curtained windows, dormers,
  a porch railing and a lamp by a plain green door. The "ring of stones" is a straight row of ten rocks
  (`0353_ending_continued_from_the_save.png`; also `0173_chapter2_goal_The_Tithe.png`). This is the place the whole game builds
  to. Why it matters: LESSONS "Showing what the story describes" says every caption fact needs its detail in the picture.
  DESIGN_GUIDE §6 says a landmark needs its own silhouette. At the moment it reads as a farmhouse. Fix: draw a windowless
  stone or tarred-plank block with a nail-studded door (reuse the close-up's door), the child's shoes on the step and a real
  ring of standing stones round it, kept dark at night apart from one cold light.

- **[story] high. The biggest beats are told in parchment boxes in front of empty scenes.** On Tithe night the text says "The
  ring of stones is full of people. The whole valley, standing in the dark with their backs to you", but the screen round the
  box shows only gravestones, and the scarecrow "standing among them" is not there either (`0318_chapter3_note_Tithe_night.png`).
  "The woods take one" says "They come to your door at nine in the morning, a dozen of them, in their church clothes". It
  appears at 6:00 AM in front of an empty yard, and the three people "sent to stand apart" exist only as three buttons
  (`0256_chapter3_morning_after_the_night.png`). "Caitlyn's door" says "The door is open… Her shoes are by the mat", but in the
  world Coyle's door is shut and there are no shoes; only the red drag marks are drawn
  (`0269_chapter3_note_Taken.png`, `0270_chapter3_goal_Taken.png`). Why it matters: the owner's rule is "you have them read
  instead of show" (LESSONS "Showing a scene instead of reading it"; "Never write a line that describes what is on screen").
  These are the game's darkest moments and they play out as reading. Fix: stage each one with the HUD hidden. Put the whole cast
  round the Tithe House with their backs to the camera and the scarecrow in the crowd, and then show the choice. Walk Hale and
  a dozen townspeople up to the cabin door at 9:00, with Gideon, Hollis and Silas standing apart, and make picking a name a tap
  on one of them. Open Coyle's door in the world and put the shoes on the mat. Cut each box down to the one line a picture
  can't carry.

- **[story] high. At the drawing you never see your own name.** The church scene is well staged (`0303`, `0306`), but the
  reveal is a 10 px white slip in Hale's hand next to the straw hat. The narration box says "Your name, spelled the way Grandpa
  spelled it… Somehow more right" (`0309_chapter3_in_world_scene_A_letter.png`). Why it matters: LESSONS "Heart events that
  show": "When the text says someone looks at a thing (a photo, a slip…), bring the thing up close in a card". This slip is the
  most important prop in the game. Fix: cut to a close-up of the slip unfolding, with the name in Grandpa's hand and the
  spelling visibly different, then cut back to the whole church turning round to look at you.

- **[story] medium-high. After you cut Caitlyn free, the reunion is narration in a speech bubble while the two of them stand
  apart.** "She falls forward into you, and she is so cold, and so light…" and "You can feel her heart going, too fa[st]" are
  shown in a bubble whose tail points at the candle stand, not at anyone who is speaking. Meanwhile the player and Caitlyn
  stand a tile apart and never move (`0280_chapter3_cutscene_Cut_her_free.png`, `0284_…`). Why it matters: LESSONS [c1]
  "cutscenes carry only spoken lines"; "A speech bubble is game UI… name tab… tail aimed at the mouth"; "Heart events that
  show". A speech bubble with no speaker reads as a mistake. Fix: animate it. She sags forward, the player steps in and catches
  her, and you get a held two-figure pose, a heart icon and a short pause. Give her one spoken line in a proper bubble, and put
  any narration that must stay in the letterbox caption strip, never in a bubble.

- **[bug] medium. The player vanishes from the church during the drawing.** At `0303` the player stands in the centre aisle
  behind the back pews. At `0306`, three seconds later, that aisle is empty floor, and the player can't be seen at `0309`
  either (church interior, x 362.9 z -56.4). Why it matters: the scene is about you being picked, and your character drops out
  of it (REVIEW B "Anything… drawn in front of/behind the wrong thing"). Fix: pin the player to their mark for the whole scene
  (LESSONS [c1] "pin the cast to their marks every frame"), and turn the crowd's heads towards them when the name is read.

- **[bug][layout] medium. After the crypt the player comes out inside a lamp post.** At "The rehearsal" (x 55.8 z -25.9) the
  lamp post and its lantern hide all of the player except a tuft of hair, while Caitlyn says "Don't stop. Don't stop." beside
  them (`0286_chapter3_goal_The_rehearsal.png`). Why it matters: DESIGN_GUIDE checklist "sit inside walls", z-order. Fix: move
  the exit spot clear of the post, or nudge the player to the nearest free tile when a scene ends.

- **[complete] medium. The cinema bars stay up after control comes back.** About 3 s after Nan's scene, the top bar still cuts
  the goal bar and the bottom bar cuts the hotbar (`0201_chapter2_goal_The_Weeping_Birches.png`). After the drawing, the Day
  label and hotbar are still cut 5 s after the scene (`0313_chapter3_goal_A_letter.png`, which also shows a bare "Stay" under
  the clock). Why it matters: REVIEW A "Transitions": never a half-drawn frame. Fix: slide the bars out in about 0.3 s at the
  moment the scene ends, before the HUD fades back in.

## Seen on many screens

- **[story][ui] medium. A birthday toast appears every single day, including over the darkest moments.** "It's X's birthday.
  A gift counts for a lot today." runs on nine days in a row: Hollis d2, Cora d3, Tess d4, Caitlyn d5, Bram d6, June d7, Maud
  d8, Agnes d9, Hob d10. It sits over Caitlyn's abduction (`0269`), over the drawing in the church (`0303`, where it covers the
  altar wall) and over the Tithe night choice (`0318`, where it covers the box's title row). Why it matters: REVIEW A "One
  voice… no jokes that break the mood". A cheery gift reminder on the night your name is drawn breaks the tone, and nine in a
  row shows how squeezed the calendar is. Fix: spread the birthdays over the season, hold back calendar toasts during story
  days 6, 9 and 10, and never show a toast while a story modal or scene is up.

- **[ui] medium. Toasts land on top of the dialog titles.** The toast lane (y about 105-160) sits on the top edge of every
  modal. "Greyfield. Red brick behind an iron fence…" hides the title "The intake book" (`0205_chapter2_note_The_intake_book.png`).
  The toasts also cut the top frame of "The Covenant" (`0217`), "The woods take one" (`0256`) and "The Tithe House" (`0318`).
  Why it matters: DESIGN_GUIDE checklist "do bubbles and toasts cover the action?" Fix: while a modal is open, hold toasts back
  or dock them under the modal; the modal's title row always wins.

- **[complete] medium. When a close-up closes, its caption stays fully bright over the world.** The picture fades out as a
  ghost over the map, but the caption stays at full opacity and "Click or press E to step back" sits on the hotbar slots. This
  happens on nearly every find: `0173`, `0175`, `0177`, `0184`, `0186`, `0213`, `0226`, `0244`, `0251`, `0260` (at `0260` the
  jars float over Ida's house and the caption runs into "Saved. Both of you."). Why it matters: REVIEW A "Transitions". A double
  exposure with sharp text reads as a layer that failed to clear. Fix: fade the caption and the hint with the picture, or cut
  to the world after a 150 ms fade to black.

- **[ui] medium. The phone message banner breaks the house style and covers the whole top HUD.** "MESSAGES / Unknown / I can
  see your hands." is a smooth, translucent, rounded modern notification. It covers the Day/clock box, the goal bar and the
  coins for several stops (`0226`, `0227`, `0229`). Why it matters: REVIEW A "One look… the same UI frame on every screen";
  LESSONS "A menu over pixel art is judged as part of the art: square pixel frames… no rounded pills". It also hides the goal
  just after a new one arrives. Fix: keep the idea but draw it as a small pixel phone or slip sliding in under the goal bar, in
  the pixel frame, for about 3 s.

## Pacing

- **[story] medium. Two chapters fit into single days, while the last chapter has empty days.** From the goals list in
  summary.md: Chapter One is all on day 1. All of Chapter Two (seven places, then six more, the Ward, the letter and the three
  stones, about 25 goals) runs on day 2 between 157 s and 210 s. During it, 13 story sites are reached with the HUD clock still
  reading 11:00-11:20 (`0173` to `0222`). Chapter Three then covers days 3-10, but days 7 and 8 bring only the mailbox letter
  and the goal "Make friends. Make plans. Keep what they give you.", which gives no concrete next step (`0293`, `0295`, `0297`,
  `0299`). "Under the church… Tonight it isn't [chained]" can also be done at 11:10 AM (`0186`, `0188`), even though it
  promises night. Why it matters: REVIEW A "Pacing": beats piled on one day, then stretches with nothing new, and Stardew-style
  finish depends on days with rhythm. Fix: gate Chapter Two to about 3 sites a day over days 2-5, each day ending on one night
  event. Move one or two sites (the drowned bell, the cold house) into days 7-8. Lock "Under the church" to after dark like
  the bell and the rehearsal already are.

- **[story] medium. The reveals keep landing the same punchline.** Your name, face or clothes turn up on the coffin "ROBIN"
  (`0188`), the doll with your hair (`0202`), the fen body in your coat (`0219`), the noticeboard "has your birthday on it"
  (`0174`), Dunn's list "ROBIN" with a photo of you asleep (`0243`), the older you in Silas's grave (`0250`), Ida's jar "ROBIN"
  (`0259`), the scarecrow stand-in with your face (`0262`) and the bleeding dummy of you (`0288`). Each one is good alone, but
  by the fifth the scare doesn't build. Why it matters: REVIEW E asks that each beat be "different from the last". Fix: keep
  the strongest three (the photo of you asleep, the older you in the grave, the dummy) and turn the others to show something
  new about the Tithe: who runs it, what it eats, what Grandpa did.

## One-off rough edges

- **[art] medium. Many close-ups look like rough drafts next to the world art.** The quarry hollow (`0182`) is filled with an
  even dot grid, the "fingernails" are three pink squares and no scratches are drawn, though the caption says "scratched from
  the inside". The orchard (`0185`) shows four copies of the same apple with the same bite, hung on strings, over a shadow
  ellipse far below them. The cold house (`0211`) draws the carcasses as flat lozenges with white dashes. Ida's jars (`0259`)
  are flat rectangles, the "eyes" are two squares, and the jar the caption says has "this year on it" says ROBIN instead. Under
  the church (`0188`), 25 identical coffins appear and the names "scratched inside the lids" are not drawn. The Tithe House
  "child's shoes, toes pointing in" (`0171`) read as two little barrels. The rehearsal (`0288`) and the drowned street (`0225`)
  use smooth round spotlight gradients. Why it matters: LESSONS "Story finds…: a row… must all differ", "The scariest fact in
  the caption must be the clearest thing in the picture", "Every caption fact needs its detail in the picture" and "too gritty:
  no checkerboard dither"; DESIGN_GUIDE §9 "Hard alpha… no soft gradients". The fen (`0219`), the lookout (`0222`), Dunn's
  list (`0243`) and the grave (`0250`) show the standard the rest should meet. Fix: redraw these seven to that standard: shaped
  shoes, scratch strokes, apples that differ and hang from twigs, a body shape under sacking, glass jars with what's in them
  drawn, varied coffins with names inside one open lid, and stepped light discs.

- **[clarity] medium. The dates in the story don't agree.** The noticeboard notice reads "FALL 28" and "This year's has your
  birthday on it" (`0174`), and the ledger says "the date is your birthday" (`0180`). But the drawing happens on Day 9 (`0301`).
  The HUD line under the clock reads "Your birthday" on both Day 5 (`0256`) and Day 6 (`0286`), and on those same mornings the
  toasts say it is Caitlyn's and Bram's birthday. Why it matters: a reveal that hangs on a date only works if the date is
  clear (REVIEW A "Always a next step"). Fix: show one calendar (Fall N) in the HUD, make the drawing land on your birthday as
  the story says, and mark that day once.

- **[complete][ui] medium. The credits are small text on bare black, and nothing makes a sound for 20 seconds.** The credits
  run from `0321` to `0344`. The name "Jaxon Charlton" is correct, but the role lines are about 10 px grey on black, too small
  to read on a phone (`0332`, `0344`). There is no picture behind them. report.json logs no sound at all from #323 to #344
  (the rest of the game always has an ambient tone). Why it matters: REVIEW A "The ending"; the credits are the last thing a
  player feels. Fix: roll them over slow pans of the valley at dawn (the farm, the church, the Tithe House), make the roles at
  least 14 px, and put the title theme or a music-box take of it under them (check whether music plays outside the sfx log).

- **[story] low-medium. Nan's scene narrates things that aren't on screen.** "Nan doesn't look up from her pole. The far bank
  is only fog." Nan is holding no pole and faces the player, and the far bank is clear grass, trees and reeds with no fog. The
  frame stays the same for about 12 s (`0191`, `0194`, `0198_chapter2_stage_cine_Nan_s_price.png`, x 127.8 z 68.5). Why it
  matters: LESSONS [c1] "if a caption describes [a thing], that thing must be in the frame doing it" and the owner's rule of
  no narration captions. Fix: give Nan her pole and draw a fog bank over the far shore. Have her speak the price herself.

- **[ui] low. The chapter card has small text faults.** It says "1 DAYS" (`0163`), the goal on day 9 says "The drawing is in 0
  day" (`0314`), and in Chapter Two "Things known 8/8" is already full when "Places 0/5" starts (`0167`). On the Chapter One
  card the stats ("0/6 PAGES") run straight across the player sprite, and "New game" is a smooth rounded pill next to the square
  pixel "Keep farming" button (`0163`). Why it matters: LESSONS "no rounded pills or smooth borders"; REVIEW A "Nothing
  half-built". Fix: handle plurals ("1 day", "tonight"), hide the player or darken the card's backdrop solid, draw "New game"
  as a pixel button, and hide counters that are already full.

- **[sound] low. Some new goals arrive with no sound.** "The scarecrow that wears you" (#261, flagged in the summary) plays
  nothing, and neither do "The intake book" (#203), "Silas digs" (#249) or "A letter" (#263). Every other new goal plays the
  'note' chime. Fix: always play the goal chime when the goal bar changes.

- **[art] low. Greyfield's shadow falls both ways.** The building's ground shadow is a symmetric trapezoid spreading down-left
  and down-right (`0206_chapter2_goal_The_Ward.png`, x -205 z 53.6). The toast also mentions "an iron fence" and children's
  graves that aren't in frame. Why it matters: DESIGN_GUIDE §1 says shadows fall down and to the right. Fix: cast the shadow to
  the lower right only, and add the iron railing along the cobble path.

- **[complete] low. This run doesn't show the ending itself.** Between "Open the door and go in" (`0318`) and the first
  credits frame (`0321`), report.json logs five 'page' sounds and two bells, but there is no shot of them. I can't judge whether
  the ending is staged or is five pages of text. Fix (bot): take a shot of every page or frame between the Tithe night choice
  and the credits. If it is text pages, the "show, don't tell" note above applies to it most of all.

## Already feels finished (keep it)

- The writing voice: dry and dark, with no slang. "Saved. Both of you." then "Saved. One of you.", the goal "Stay. Stay. Stay."
  on Tithe night, "it likes your face", and the letters from yourself ("I'm you, a little later").
- The credits name is right: "MADE BY / Jaxon Charlton / everything: the story, the valley and its people, the art, the sound
  and the game". The one-line cast roles have character ("Retired; keeps the porch light on for Ruth").
- The drawing in the church (`0303`, `0306`): the whole cast fills the pews, Hale is at the altar, and Grandpa's straw hat from
  Chapter One's ending comes back.
- The undercroft rescue (`0271`-`0274`): a small, tense playable beat, with the root meter going from "It is asleep. For now."
  to "IT IS WAKING".
- The best close-ups: the fen with the body in your coat (`0219`), the fire-lookout wheel (`0222`), Dunn's list with the photo
  of you asleep (`0243`), the older you in Silas's grave (`0250`) and the birch dolls (`0202`).
- Story gated by time of day and by tools: the drowned bell and the rehearsal wait for dark, the hollow tree waits for noon,
  and the three stones need the rod, axe and pickaxe upgrades, which ties the horror to the farming loop.
- Tithe night shows five locked endings with cryptic needs (`0318`), which is a strong pull to play again.
- Greyfield (`0206`) and the Wickham ferry landing (`0198`) are well-built places with their own character.
- Steady 60 fps and no page errors across every story beat.
