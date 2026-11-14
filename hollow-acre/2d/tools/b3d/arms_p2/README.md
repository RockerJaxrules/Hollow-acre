# Part 2 first-person arms (t353): build, judge, export

The driver's arms on the steering wheel in the blizzard drive. Hand functions live in `../lib/hands.py`; this folder
holds the scene-specific scripts.

| File | What it does |
|---|---|
| `PLAN.md` | Who sees it and from where, real sizes in cm, the parts list, budgets. |
| `scene.py` | Cab and rim constants (these must match `p2/src/main.js`), the hand frame on the rim, the bind arm by IK, the bones, the contact grip (finger cascade), both thumb poses, and per-hand pose deltas: the left hand at ten o'clock, the right posed on its own at about half past two with the thumb hooked. `python3 scene.py` prints the grip angles. |
| `armbuild.py` | Blender building blocks: hand and nails (subdivided cage, with the skin detail displaced on dense copies), ring, oval sleeve with hem and folds, armature, weights (joint planes, with smoothed finger webs), pose, UV atlas. |
| `build2.py <out> --shape \| --look \| --rest \| --game [--high]` | Judge renders. `--rest` lays the flat hand on the axes so the printed sizes are real lengths. `--game` renders the real in-cab camera at night with both hands. Env: `SKIN`, `SHIRT`, `MARRIED`, `VIEW=phone`. |
| `export.py <outdir>` | Bakes and exports for three.js: `arm.glb` (one skinned mesh, about 7.6k tris), `arm_n.webp` (tangent normals), `arm_d.webp` (R: AO in the grip, G: flush, B: crease, A: material id), and `rig.json`. `glb_quant.py` then shrinks the GLB with KHR_mesh_quantization. |

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
