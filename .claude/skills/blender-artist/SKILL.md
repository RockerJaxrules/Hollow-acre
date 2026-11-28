---
name: blender-artist
description: Build realistic 3D for Hollow Acre's Part 2 and the ending (first-person hands and arms, people, the yeti, the truck, the mine, snow, props) in Blender 5.2 through Python, and get better with practice. Use whenever a 3D model, material, rig, animation or 3D render is made, fixed, judged or practised. Loads the method and lessons, looks up the exact Blender API, builds with high-level operations, renders multi-view check sheets, gets a blind critique, verifies every fix, and writes what it learned back so the next model starts further ahead.
---

# Blender artist (with practice)

All files are in `hollow-acre/2d/tools/b3d/`. Blender is the `bpy` Python module (5.2, CPU only, no GUI).

## Before you build anything
1. Read `LESSONS.md` in full. It holds the owner's words, the Blender 5.2 API traps and the anatomy numbers.
2. Read `METHOD.md` (the loop and the tools).
3. Look in `lib/` and `exemplars/` for something that already worked, and reuse it.
4. No outside art. Never download or trace models, scans, HDRIs or textures. Everything is made in code here.

## The loop
1. **Plan:**
   - who sees it, from where;
   - real measurements in cm;
   - the part list, with how each part is built;
   - materials;
   - triangle and texture budgets.
2. **Look up** every API call you are unsure of: `python3 api.py find <regex>` and `python3 api.py node <NodeType>`.
3. **Build** with primitives and modifiers, curves, geometry nodes or box modelling with subdivision. Bevel every edge,
   and break symmetry slightly on anything organic.
4. **Shape check:** `views.sheet(out, mode='shape', cams=[game_cam])`. Compare the printed sizes with the plan.
5. **Materials:** use `mats.skin/cloth/pbr`, with colour, roughness and bump variation.
6. **Look check:** `views.sheet(out, mode='look')`, plus the real game camera and lighting.
7. **Blind critique:** give the `render-critic` agent the sheet and a one-line brief (for A/B, randomise which is new).
   - Fix the problems it finds.
   - Re-render and verify each item was really fixed.
   - Ship at 7+/10 when the new version beats the old.
   - Then show the owner. Their reaction is final.

## After every check or owner reaction (this is the practice)
- Add a row to `PRACTICE_LOG.md`: asset, attempt, score, the critic's first fix, what changed.
- Add lessons to `LESSONS.md`: one checkable line each. Mark a broken lesson **[repeated]** and move it to the top of its
  section. Write down what worked too.
- Copy functions that produced approved results into `lib/`. Put approved sheets in `exemplars/` with two lines on why.
- Write the owner's own words down verbatim, with what you understood them to mean.
