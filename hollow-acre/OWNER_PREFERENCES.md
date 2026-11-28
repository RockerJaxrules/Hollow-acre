# How the owner works: standing rules and preferences

Collected from the whole first build conversation, so a new session starts with the same understanding. Read it with
`PART2_HANDOFF.md`.

## Links
- Live game (Part 1, browser): https://rockerjaxrules.github.io/Hollow-acre/
- Live task list: https://claude.ai/artifact/GGiCsaBACrcYZ7EJQCskTj (collection `tasks`; update via ArtifactData with
  `if_version`)
- Live work log (Part 2 progress pictures): https://claude.ai/artifact/Skbhh8Gwtk1xkZhWEthjbt
  - builder: `tools/live/README.md`
- Repo: RockerJaxrules/Hollow-acre, branch `claude/3d-horror-stardew-game-3p7bhh`. Never push elsewhere; no pull
  requests.

## Hard rules
- Never commit the owner's real-person photos. The owner's email is private.
- **Caitlyn's face** (portrait id `mae`) stays exactly as it is.
- Credits name **"Jaxon Charlton"**.
- **Commits:**
  - never mention dates or durations;
  - never name the AI model;
  - end with the session's attribution lines;
  - when a stop hook says there are uncommitted changes, commit and push.
- **Part 1 (pixel game):** no outside art at all. Everything is made by us.
- **Part 2 (Unreal):** Epic's MetaHuman and Quixel Megascans are allowed, under the conditions in
  `2d/tools/review/SEQUEL_NOTES.md` (commercial use OK, never resell raw assets, keep `ASSETS_EPIC.md`). Everything
  else is our own.
- **Part 2 is the SAME game and the SAME character as Part 1,** not a sequel game. Part 1 is also inside the Unreal app
  and always stays playable in the browser.

## How the owner likes to work
- **Speed matters.** Ship working things and polish live; don't run endless judging loops.
  - Run one worker at a time. The owner noticed and disliked ten tasks running at once.
  - Keep judge rounds few and useful.
- **For Part 2 art,** each round goes: the owner sees the pictures FIRST, then the blind `render-critic` judge scores
  it against a REAL reference photo. Use reference photos (openly licensed, study only, never shipped), or the owner's
  own photos if they send them; they offered.
- **Show what players actually see.** The owner wants the in-game view, not just offline renders, and asked "why does
  it look so worse in game". Compare the game with the offline render side by side every round.
- **Keep the live work log updated** so the owner can watch progress from the phone.
- **Explain in plain words.** The owner reads on a phone. Be honest about what's still wrong; the owner spots problems
  quickly (thumbs, mitten hands, flicker, pop-ups).
- **Research before guessing.** For example: hand anatomy and 10-and-2 photos for the hands, and licence terms before
  allowing outside assets.
- **The player's customization must carry everywhere.** Skin tones, clothes, patterns and the ring come from the
  Part 1 character creator (`g2d/custom.js`).
- **Usage limits.** The owner has hit rate and weekly limits before, so avoid wasteful parallel agents and very long
  loops.

## Owner's taste, from feedback
- **Realism must be convincing,** especially hands. Real anatomy, real poses (10 and 2), no stiff or mirrored hands,
  no thumbs that look like toes or pegs.
- **Horror atmosphere:** dark, cold, night. The lighting must match the scene; no unexplained orange light.
- **UI on phone:**
  - no flicker;
  - pop-ups one at a time;
  - buttons that don't overlap (e.g. Decorate over Menu in the cabin, fixed earlier).
- **Staff and hired hands** use their own arms when carrying things, not pasted-on arms.

## Part 1 release pipeline (browser game)
Details are in the Part 1 tools.
- **Build:**
  1. `python3 build_relX.py` (latest `build_relW.py`; a copy is in `2d/tools/build_release.py`).
  2. `python3 mkdist.py <build> <dist>`.
  3. `bash sync.sh build_2d.py mkdist.py lintcomments.py`.
  4. Copy the dist to `index.html`.
  5. Write `version.json`.
- **Check:** smoke test (`state [38,true,true] ERR []`), plus the playthrough bot with `--quick`.
- **Desktop copy:** `cd hollow-acre/desktop && node copy-game.js`.
- **Release:** commit and push. GitHub Pages serves the live game.
- The git remote sometimes reverts. Reset it with
  `git remote set-url origin https://github.com/RockerJaxrules/Hollow-acre`.
