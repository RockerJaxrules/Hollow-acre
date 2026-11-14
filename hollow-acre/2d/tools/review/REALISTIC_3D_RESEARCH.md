# Realistic 3D for the ending and Part 2: tools research (t347)

Checked in this container on 14 Nov 2026. Nothing was built and no AI credits were spent.

## 1. What is here (verified)

- **Blender:** there is no `blender` binary, but **bpy 5.2.3** (Blender as a Python module) works: geometry nodes, shader nodes, glTF export, and Cycles on the CPU with OIDN denoising. EEVEE needs software GL (38 s for a tiny frame), so it isn't usable.
- **Cycles speed (4 cores):** a simple night scene at 720p with 48 samples took **24 s/frame**, and **69 s/frame** with fog.
- **npm:** reachable. three 0.187, @gltf-transform/cli 4.5 (which bundles meshopt, draco, WebP and the validator) and postprocessing 6.39 all install. Measured three.js size: **134 KB** gzipped for WebGL, **222 KB** for WebGPU.
- **Python 3.13:** numpy, Pillow and SciPy are installed. trimesh, xatlas and pyfqmr are on PyPI.
- **ffmpeg 6.1:** x264, x265 and AV1 encoders.
- **Headless Chromium:** WebGL2 runs in software, so screenshots work but phone speed can't be measured here.
- **Blocked:** GitHub release downloads, so there is no KTX2 texture encoder yet. Only 5.9 GB of disk is free.
- **Higgsfield (descriptions read only):** image, video (Seedance 2.5, Kling 3.0), image-to-3D GLB with optional rigging, upscaling, a remote Blender scene builder and GPU rental, all paid in credits. Its animation-clip library and asset search are other people's work, so the owner's rule excludes them.

The repo already proves the route: `blender/creature.py` builds `assets/hollow.glb` (a 47-joint creature with 7 animation clips), and three.js plays it.

## 2. Pipelines

**Models.** The default is procedural Blender Python, extending `blender/lib.py`:
- terrain from a noise heightfield
- the road as a curve extrusion, with guardrails added by modifiers
- rocks "sculpted" by noise displacement, then simplified, with the detail baked into normal maps
- pines placed with geometry nodes
- mine and base pieces as a modular kit

AI image-to-3D is for a few organic props only. Every model it makes needs simplifying, new UVs and new textures.

**Textures.**
- Procedural materials in Blender, baked by Cycles to 1024² colour, normal and roughness maps that tile.
- AI colour images with lighting removed, made seamless, with normal and roughness maps derived in numpy.
- Triplanar mapping on terrain, so no UVs are needed there.

**Animation.**
- In the engine: camera shake, body sway, the steering wheel with the hands on it, wipers and GPU snow.
- From Blender as glTF clips: the yeti attack and the creature. Its skeleton is built in Python and the clips are blended in three.js.

**Look.** three.js WebGL with pmndrs `postprocessing`, which merges effects into one pass.
- **All phones:** tone mapping, fog, and one pass for vignette, grain and chromatic aberration. Also 5-15k snowflakes that brighten inside the headlight cones (a cheap "volumetric beam"), and baked shadows.
- **Newer phones:** bloom and one real-time headlight shadow.
- **Desktop only:** ambient occlusion, true volumetric light and motion blur.
- **Quality tier:** picked automatically from a 2-second frame-rate test.

## 3. The ending cutscene

| | Cycles video | AI video | Real-time three.js |
|---|---|---|---|
| Look | Best lighting | Most photographic | Good; dark and snow hide limits |
| Making it | 3-9 h of CPU per 20 s attempt | Credits; weak control | Fast to change |
| Size | 6-10 MB for 20 s at 720p | Same | 2-4 MB plus 134 KB engine |
| Phone | Muted, `playsinline`, started by a tap | Same | Needs quality tiers |
| Player's look | Needs a mask-and-tint trick (12 shirts × 7 skin tones) | Can't match it | Exact: sleeves, skin, ring, spouse's photo |

**Recommendation: real-time three.js, with Cycles used only for baking.** It shows the real character, it stays small, and it becomes Part 2's engine. If iPhones can't keep up, play a Cycles video of the outside on the windscreen and keep the cab real-time. The car seen on the mountain (beat 3) stays pixel art before the fade.

## 4. Plugging Part 2 into the page

- **Lazy loading:** bundle Part 2 into `2d/p2/` and load it with `import('./p2/p2.js?b='+BUILD_ID)`, starting the download during the phone call. `sw.js` already caches these files for offline play. Keep it out of `index.html`.
- **Shared save:** add a `p2` object to the existing save (`hollowSave1`) and read the look, name and spouse from it.
- **Size budget:** 300 KB for the engine, 5 MB for the ending, 15-20 MB per Part 2 area, 1024² textures. A 2048² texture costs about 22 MB of iPhone GPU memory.

## 5. Risks and limits

- **What "realistic" can mean here:** moody indie horror (fog, darkness, snow, grain), not AAA photorealism. A night blizzard is the most forgiving setting. Faces and fur are out of reach on phones, so show only hands and glimpses of the yeti.
- **No GPU:** long Cycles renders must be split into chunks under 2 h each.
- **iPhone speed can't be measured here.** The owner must test on a phone.
- **AI 3D:** it costs credits and needs cleanup every time. Procedural work is the safest reading of "made by us".
- **Time:** about 4-6 sessions for a reviewable ending. A Part 2 slice takes weeks.

## 6. First step

Build a lazy-loaded night-road blizzard test in `2d/p2/`: a procedural road and cliff, snow lit by headlights, fog, grain, and sleeves in the save's shirt colour. Screenshot it here, then the owner checks the frame rate on an iPhone. That decides real-time against video before any heavy art is made.

Sources: [web.dev on WebGPU](https://web.dev/blog/webgpu-supported-major-browsers), [three.js releases](https://github.com/mrdoob/three.js/releases), [glTF compression](https://jvinhit.github.io/blog/threejs-16-gltf-compression-draco-meshopt-ktx2/), [WebKit video policies](https://webkit.org/blog/6784/), [Trellis 2 vs Hunyuan 3D](https://www.3daistudio.com/blog/trellis-2-vs-hunyuan-3d-differences-explained).
