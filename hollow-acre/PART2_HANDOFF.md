# Part 2 handoff: starting fresh in Unreal

Read this, and `OWNER_PREFERENCES.md` (the owner's standing rules and taste from the whole first conversation), first in any new session that works on Part 2 (the realistic first-person continuation of Hollow Acre). It
collects every decision made so far, so the work restarts cleanly in Unreal without losing anything.

## 1. What exists today
- **Part 1** is the finished 2D pixel-art horror farming game. It runs in the browser and is live at
  https://rockerjaxrules.github.io/Hollow-acre/.
  - Code: `hollow-acre/2d/`.
  - Repo: RockerJaxrules/Hollow-acre, working branch `claude/3d-horror-stardew-game-3p7bhh`.
  - Part 1 stays playable in the browser forever, as it is.
- **Part 2 story and direction:** `hollow-acre/2d/tools/review/SEQUEL_NOTES.md`, the owner's words kept verbatim. In
  short:
  - The new ending: your grandmother goes missing on a mountain. You say goodbye to your spouse if you married. You
    drive up into a blizzard, and the view fades into first-person realism.
  - Part 2 is the SAME game and the SAME character: mining, base upgrades, cold and dark, stealth, the lost miners,
    and a yeti-like creature that rams your vehicle.
- **Prototype work, kept for reference only:**
  - the three.js Part 2 page (`2d/p2/`);
  - the Blender first-person arms (`2d/tools/b3d/`, export script `arms_p2/export_unreal.py`, which writes FBX with
    Unreal mannequin bone names and the 10-and-2 grip);
  - the blind-judge history: the Blender arms reached 5/10, the browser version 4/10.

## 2. Decisions (owner)
- **Engine:** Unreal Engine 5. A native app for PC, Mac, iPhone and Android.
  - Part 1 is also inside the app, running the web game in a web view, and the save and character carry over into
    Part 2.
  - Part 1 also stays in the browser.
- **Hardware:**
  - Unreal runs on the owner's PC. Its GPU is an **NVIDIA RTX 3080**, so use Epic or High scalability with Lumen,
    Virtual Shadow Maps and MetaHumans at cinematic LOD on PC.
  - iPhone builds need the owner's Mac with Xcode and an Apple developer account ($99/year).
  - Android builds from the PC.
  - The owner talks to Claude from their phone.
- **Assets:**
  - Epic's **MetaHuman** and **Quixel Megascans** are allowed in Part 2. Conditions are in SEQUEL_NOTES.md: no
    reselling raw assets, keep `ASSETS_EPIC.md` up to date, re-check the licence before release, never scan a real
    person without written consent.
  - Everything else is our own work.
  - Part 1 keeps the strict "no outside art" rule.
- **Look:** realistic, dark, cold horror. It must look good AND run well on phones (use mobile LODs and scalability
  settings).

## 3. The player's look carries over from Part 1
Everything first-person must follow the character creator in `g2d/custom.js`, read from the save:
- **7 skin tones,** from #f6d8c0 to #5e3a26.
- **12 shirt colours** and **4 patterns** (plain, plaid, stripes, dots).
- **Sleeve type by outfit:**
  - shirt or openshirt: woven, with a buttoned cuff;
  - sweater, turtleneck, cardigan, hoodie: ribbed knit cuff;
  - jacket: a stiff hem;
  - longcoat: thick wool;
  - tee, tank, vest, overalls, skirt, dress: a winter coat in the `extra` colour, because it's a blizzard.
- **Wedding ring** only when married.

## 4. Hands and the driving pose (hard-won lessons)
Full detail is in `2d/tools/b3d/LESSONS.md`, including the table of measurable 10-and-2 targets. The essentials:
- **The pose is 10 and 2.** Each hand is a relaxed fist around the rim, and the back of the hand faces the eye, with
  the knuckle row along the rim.
- **The thumb lies along the rim's driver face pointing toward 12,** within about 10-15° of the rim's line. It is part
  of the fist, never a separate peg and never hooked inside the rim.
- **The index finger curls like the other fingers.** No straight "gun" finger.
- **Forearms come in from low and outside** (the left at about 35-45° on screen). The wrist is not broken, and the cuff
  sits at the wrist bone.
- **The two hands are never mirror copies.**
- **Judge the relaxed rest pose of any hand before posing it.** In rounds 1-3 the thumb was attached under the palm.

## 5. How we work (owner rules)
- **Every round, the owner sees the pictures first.** Then the blind `render-critic` agent scores it against a REAL
  reference photo.
- **Show the in-game result, not just the offline render.** Before anything counts as done, compare the game frame
  side by side with the offline render ("parity").
- **Keep the live log updated (the owner asked for it):** https://claude.ai/artifact/Skbhh8Gwtk1xkZhWEthjbt
  - Builder and steps: `hollow-acre/tools/live/README.md`.
  - Republish to the SAME link whenever there are new Unreal screenshots or renders, at most every few minutes,
    with the in-game view at the top.
- **Git:**
  - Commit and push to `claude/3d-horror-stardew-game-3p7bhh`. No pull requests.
  - Commit messages never mention dates or durations, never name the AI model, and end with the session attribution
    lines.
- **Privacy:**
  - Never commit the owner's real photos.
  - The owner's email is private.
  - Credits name "Jaxon Charlton".

## 6. First steps in Unreal
1. **PC setup by the owner:**
   - Epic Games Launcher, then Unreal Engine 5 (latest 5.x).
   - Visual Studio 2022 with the "Game development with C++" workload.
   - The Claude desktop app with Remote Control serving a game folder, for example `C:\HollowAcre` (not the home
     folder).
   - Note the GPU.
2. **Create the project** `HollowAcre` (C++, First Person template) with Lumen and Virtual Shadow Maps on PC, and the
   mobile renderer set up for phones. Put it under version control. Unreal projects need Git LFS for binary assets;
   decide where it lives, the same repo or a new one.
3. **First milestone, the ending drive:**
   - a truck cab at night in a blizzard;
   - MetaHuman first-person arms posed to the 10-and-2 targets;
   - Megascans snow and rock;
   - volumetric fog and the falling snow.
   - Render from the game camera next to the real 10-and-2 photo. The owner sees it, then the judge scores it.
4. **Then:** wire Part 1 into the app as a web view, pass the save and character into Part 2, and play the full ending
   sequence.
