# Blender method: realistic 3D for Part 2

How Claude gets good at Blender. This is what the research says works, adapted to this machine: Blender 5.2 as a
Python module, CPU only, no internet art.
- LL3M (multi-agent Blender code with a doc-retrieval step and a render critic): exact API docs gave 5x more complex
  operations and 26% fewer errors.
- SceneCraft: render, self-critique, fix, and keep a growing library of functions that worked.
- BlenderAlchemy: a visual judge choosing between versions was preferred by people 71% of the time.

The method has five parts:
1. **Plan with real measurements.**
2. **Look up the exact API.**
3. **Build with high-level tools.**
4. **Render many views, critique blind, verify each fix.**
5. **Write down what was learned and keep the code that worked.**

## Tools (this folder)

| Tool | What it does |
|---|---|
| `api.py find <regex>` / `api.py node <NodeType>` | Exact Blender 5.2 API, built from the installed Blender (`api.py build`, about 1 s). Use it before any call you are not sure of. |
| `views.py` → `views.sheet(out, mode='shape'|'look', cams=[...])` | Check sheet with 5 views plus your cameras, and real sizes printed in metres. `shape` uses Workbench (about 1 s) for silhouette and proportions. `look` uses Cycles CPU with denoising (about 10 s at 260 px) for materials and light, and adds a neutral studio rig if the scene has no lights. |
| `mats.py` | Physically based presets with correct 5.2 socket names: `skin()`, `cloth()`, `pbr()`, `sock()` (picks a socket by name and type). |
| `lib/` | Functions that produced approved results (the skill library). Reuse before writing new code. |
| `exemplars/` | Approved check sheets with a two-line note on why each works. |

## The loop for every asset

0. **Read `LESSONS.md` first**, then look in `lib/` and `exemplars/` for something to start from.
1. **Plan (write it down before code).**
   - What it is, and who sees it from where: the in-game camera, distance, lens.
   - **Real measurements in cm** for every part. Proportions break realism before materials do.
   - The part list, and for each part how it will be built (see step 3).
   - Materials.
   - Budgets for phones:
     - hands: 12-15k triangles for the pair;
     - props: 3k or less;
     - characters: 20-30k;
     - the yeti: 40k or less;
     - textures: 1024 px, or 2048 px for hero items only.
2. **Look up every API call you are not certain of** with `api.py`. Blender 5.x renamed things; see the traps in
   LESSONS.md.
3. **Build with high-level operations, not vertex by vertex.**
   - **Organic shapes** (hands, bodies, creatures): a low-poly cage, then Subdivision Surface (box modelling). Or
     Skin-modifier stick figures, then remesh and smooth. Or metaballs, then voxel remesh.
   - **Detail:** Displace or Shrinkwrap, plus Weighted Normal.
   - **Tubes, cables, hair strands, veins:** curves with a bevel.
   - **Repetition and scatter** (rocks, snow lumps, mine supports): geometry nodes or arrays.
   - **Hard surfaces** (truck, tools): primitives, then Bevel (always), Solidify and Mirror.
   - **Nothing real has a razor edge,** so bevel or round every edge.
   - **Nothing organic is perfectly symmetric or straight,** so vary sizes by 2-5% and bend lines slightly.
4. **Shape check:** `views.sheet(..., mode='shape', cams=[game_cam])` after every pass. Look at all views and the
   printed sizes against the plan.
5. **Materials:** use `mats.*`. Realism comes from layers of variation: colour (large blotches), roughness (middle
   scale) and bump (fine scale). Skin always uses subsurface scattering.
6. **Look check:** `views.sheet(..., mode='look')` and a render from the real game camera under the game's lighting.
7. **Critique, blind:**
   - Give the `render-critic` agent the sheet and a one-line brief. Do not tell it which version is new.
   - **Verify:** after fixing, re-render and check each critique item one by one (LL3M's verification step). Never
     assume a code change fixed what it was meant to.
   - Stop at 7+/10 when the new version beats the old side by side. Then show the owner, whose reaction is final.
8. **Log:**
   - Add a row to `PRACTICE_LOG.md`.
   - Add one-line, checkable lessons to `LESSONS.md`.
   - Save reusable code to `lib/`.
   - Put the sheet in `exemplars/` when approved.
9. **Export for the game (three.js):**
   - three.js can't run Blender node trees, so bake the procedural materials to textures (Cycles bake: base
     colour, roughness, normal).
   - Apply modifiers, keep the triangle budget, and export `.glb`.
   - Check it in the browser at phone size.

## This machine

- EEVEE does not run headless here (EGL error). Use Workbench for shape and Cycles CPU for look.
- Cycles is CPU only: about 10 s for a 260 px sheet at 48 samples with denoising. Use higher samples only for finals.
- No outside art: no downloaded models, scans, HDRIs or textures. Everything is made in code. For outdoor light use
  Blender's own sky texture (Nishita) or our own lights.
