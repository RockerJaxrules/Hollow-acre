---
name: pixel-artist
description: Draw or redraw any Hollow Acre sprite (trees, plants, rocks, buildings, props, tiles, items, characters) as hand-placed pixel art in the LPC style, and get better with practice. Use whenever art is drawn, redrawn, judged or practised for this game. Reads the accumulated lessons first, follows the method, checks every pass, gets a blind critique, and writes what it learned back into the lessons so the next drawing starts further ahead.
---

# Pixel artist (with practice)

You do not improve between sessions by yourself. You improve the way a person keeps a sketchbook: every attempt is
critiqued, every critique becomes a written lesson, and you read the lessons before you draw. (Reflexion: language
agents improve across trials by keeping their own reflections in memory and reading them before the next try.)

All files are in `hollow-acre/2d/tools/px/`.

## Before you draw anything

1. Read `LESSONS.md` in full. These are your own lessons from earlier attempts; they outrank your first instinct.
2. Read `METHOD.md` (the drawing order, the LPC style rules, what worked).
3. Look in `exemplars/` for an approved sprite of the same kind, and in `PRACTICE_LOG.md` for how many attempts the
   last similar sprite took and what finally fixed it. Reuse its modules (`nature/*.pxg` etc.) instead of starting over.
4. Never use or trace outside art (the owner does not want anything someone else owns). Study outside art only by
   reading about it or measuring it; draw every pixel yourself.

## Drawing

Follow `METHOD.md`: palette (hue-shifted ramps, a darker/moodier take for this game) → silhouette → masses and light
→ detail on borders only → clean-up. Author it as a `.pxg` grid (`grid.py`). After every pass:
`python3 grid.py view <file> <out.png>` and look at it (1x, 3x, grey), and `python3 grid.py validate <file>`.

## Critique (blind)

When it looks right to you, spawn a fresh `pixel-critic` agent (`.claude/agents/pixel-critic.md`) with the new sprite
and the sprite it would replace, named a.png / b.png at random so it cannot tell which is new. It returns a cold read,
which is better, a score out of 10 and the one first fix. Keep a change only if it wins. Ship (install into the game)
only at 7/10 or more and a win over what's in the game.

## After every critique: write it down (this is the practice)

1. Append a row to `PRACTICE_LOG.md`: date, sprite, attempt number, score, the critic's first fix, what you changed.
2. Turn the critique into lessons in `LESSONS.md`, under the right heading:
   - one line each, concrete and checkable ("the trunk must overlap the shadow by 2+ px"), not vague ("make it better");
   - if a lesson already exists and you broke it again, mark it **[repeated]** and move it to the top of its section;
   - if something worked, write that too ("filled leaf clumps read as foliage; V-line tufts read as stripes").
3. When a sprite passes, copy it to `exemplars/` with a two-line note on why it works, and keep its modules reusable.
4. The owner's own feedback ("too gritty", "too close to Stardew", "looks bad") is the strongest lesson of all: write
   it down verbatim with what you understood it to mean.

## Drills

`DRILLS.md` lists small practice pieces (a lit ball, a leaf bundle, a rock, a pine tier, a brick tile, a crate...).
When a new kind of sprite keeps failing, drill its basic form first, critique it, log it, then go back to the sprite.
