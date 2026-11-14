# Part 2 first-person arms (t353): build, judge, export

The driver's arms on the steering wheel in the blizzard drive. Hand functions live in `../lib/hands.py`; this folder
holds the scene-specific scripts.

| File | What it does |
|---|---|
| `PLAN.md` | Who sees it and from where, real sizes in cm, the parts list, budgets. |
| `scene.py` | Cab and rim constants (these must match `p2/src/main.js`). The bind is the rest hand (straight fingers) at the left hand's place. Each side has its own rigid place on the rim (`PL`): both hands at 10 and 2 as relaxed fists, set a little differently (the right is worked out in mirrored left-hand space). `seat()` rests a hand on the rim. Per side: the finger contact cascade (`FING`: caps, ease, spread) and the thumb by IK within joint limits (`LIM`, bound halfway between the two poses). `python3 scene.py` prints, per hand, the wrist bend, where the back of the hand faces, the finger angles and clearances, and the thumb's pose and clearance. Override a place with `PL_L`/`PL_R` (JSON) to try one. |
| `armbuild.py` | Blender building blocks: hand and nails (subdivided cage, with the skin detail displaced on dense copies), ring, oval sleeve with hem and folds, armature, weights (joint planes, with smoothed finger webs), pose, UV atlas. |
| `build2.py <out> --shape \| --look \| --rest \| --game [--high]` | Judge renders. `SIDE=L\|R` picks which hand the sheets pose. `--game` renders the real in-cab camera at night with both hands; `AIM=x,y,z FOV=deg` zooms it from the same eye (the thumb check). Env: `SKIN`, `SHIRT`, `MARRIED`, `VIEW=phone`. |
| `rest4.py <out.png>` | The rest-pose sheet: the flat hand on the axes with the skeleton's numbers, plus measured widths (finger bases, thumb segments). |
| `r4_renders.sh` | The whole r4 judge set (rest, shape and look per hand, thumb check, four in-cab frames). |
| `export.py <outdir>` | Bakes and exports for three.js (the sleeve types `knit`, `hoodie`, `jacket`, `coat` ride along as sparse morph targets of the woven sleeve, from `armbuild.SLEEVES`): `arm.glb` (one skinned mesh, about 9.4k tris with `DEC=.28`), `arm_n.webp` (tangent normals, blurred 1.4 px), `arm_d.webp` (R: self-occlusion AO, G: flush, B: crease, A: material id), and `rig.json` (bones, finger joints and axes, per side: the hand placement matrix `hand`, `spread`, `grip`, `thumb`). The game mesh keeps a third of the skin relief (`RELIEF`); the normal map carries the rest. The rim is left out of the AO bake: the page traces its shadow and contact darkening live. `glb_quant.py` then shrinks the GLB with KHR_mesh_quantization. |

**To ship:**
- Copy `rig.json` to `p2/src/arm_rig.json`.
- Copy `arm_q.glb` to `p2/arm.glb`.
- Copy the two `.webp` files to `p2/`.
- Then run `npm run build` in `p2/src`.

`p2/src/arms.js` poses the bones every frame:
- The hand follows the rim, each hand in its own place.
- The arm reaches by two-bone IK.
- The forearm shares the wrist's roll.
- On hard turns each hand lets go and takes a new hold further round the rim, never both at once.
- The hands squeeze on bumps.
- The index finger taps now and then.
