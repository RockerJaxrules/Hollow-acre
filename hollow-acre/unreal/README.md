# Hollow Acre Part 2: Unreal Engine project

Part 2 is built in Unreal Engine 5 on the owner's PC. Read `../PART2_HANDOFF.md` first.

## PC setup checklist (owner, one time)
1. **Epic Games Launcher:** install it from epicgames.com and sign in.
2. **Unreal Engine 5:** Launcher, then Unreal Engine, then Library, then Install, latest 5.x. Allow about 100 GB on an SSD.
3. **Visual Studio 2022 Community:** in the installer, tick "Game development with C++" (it includes the Unreal
   integration).
4. **Git and Git LFS:** git-scm.com, then run `git lfs install` once. Unreal assets are large binary files.
5. **Claude desktop app:**
   - Sign in.
   - Settings, then Claude Code, then Remote Control: turn it on and add the folder `C:\HollowAcre`, not your whole
     user folder.
   - Leave the app running.
6. **Clone the repo** into `C:\HollowAcre` (or let the Claude session do it).
7. **For later:**
   - Android: Android Studio with the SDK and NDK versions Unreal asks for.
   - iPhone: the Mac with Xcode, plus an Apple developer account.

## First session on the PC
Start Claude Code in `C:\HollowAcre` and say: "Read hollow-acre/PART2_HANDOFF.md and start Part 2 in Unreal."

That session will:
- create the project `HollowAcre` from the **First Person** template, **C++**, in `hollow-acre/unreal/HollowAcre/`;
- merge `ConfigSnippets/DefaultEngine.ini.part` into `Config/DefaultEngine.ini`;
- set up Git LFS tracking for `*.uasset` and `*.umap`;
- build the first milestone: the night blizzard drive with MetaHuman arms at 10 and 2;
- keep the live log updated (`../tools/live/README.md`).

## Automation (so Claude can work from the phone conversation)
- Editor scripts run headless:
  `UnrealEditor-Cmd.exe HollowAcre.uproject -run=pythonscript -script="Scripts/<name>.py"`
  (needs the Python Editor Script Plugin, which is on by default).
- Screenshots for the live log come from the game camera, rendered off-screen (`-RenderOffscreen`).
- Packaging: `RunUAT.bat BuildCookRun -project=... -platform=Win64 -clientconfig=Shipping -cook -build -stage
  -pak -archive`.

## The ending drive: how it is generated
All our own geometry, rebuilt from scripts (outputs go to `HollowAcre/Saved/Generated` and `HollowAcre/SourceArt`):
1. `tools/make_mountain.py` (Python 3 + numpy + Pillow): the climbing road with tyre ruts, the ledged rock cliff, the
   drop, the far peaks, and tree, snow-pole and post positions. It calls `tools/make_roadside.py`, which builds the
   W-beam guardrail and its post.
2. `tools/blender/spruce.py` (Blender, background): the needle spray modelled and rendered into card textures, then
   seven snow-laden spruce variants (4.5 to 25 m) built from those cards, plus `Spruce_Stop`, the old 23 m spruce
   that stops the crashing car (bare to 4.2 m with dead stubs, so its branches stay outside the cab).
3. `tools/blender/car_interior.py` (Blender): the car, plus its moving parts exported about their own pivots (the
   steering wheel, both wipers) and the cabin collision field for the arms.
4. The creature, the frozen husk (a gaunt, near-hairless yeti in frozen matted fur, about 2.9 m standing in the
   game), built on an Epic MetaHuman:
   - `HollowAcre/Scripts/build_husk_metahuman.py` (editor): the MetaHuman (`/Game/HollowAcre/Creature/Husk`) from a
     preset, its body stretched tall and gaunt; `husk_strip_and_build.py` takes off its clothes and hair and builds it;
     `husk_export_mh.py` and `husk_export_textures.py` export its body, face and textures to `Saved/Generated/Husk`.
   - `tools/husk_skin.py` (Python 3): the body's skin and normal map without the MetaHuman's baked briefs.
   - `tools/blender/husk_body.py` (Blender): the body stretched (long arms and fingers), black claws, frozen fur
     cards (thickest on the back and shoulders, the chest and arms), frostbite and rime in its vertex colours, an IK rig
     and its takes (`Gallop`, `GallopLookL`, `Sighting`). Every frame is kept out of the snow by a ground solver (a hand
     or foot under it is lifted onto its toes or claws, anything else lifts the pelvis) and checked afterwards (the
     log's `ground` lines give the deepest point under, per take and per body part). Writes `HuskBody.fbx` (centimetres,
     every bone at scale 1, as the MetaHuman face it carries expects) and `T_HuskHair.png`.
   - `tools/blender/husk_fangs.py` (four long canines on the face's own teeth) and `husk_face_frost.py` (frostbitten
     ears and lips: `T_HuskFaceFrost.png`).
   - `HollowAcre/Scripts/import_husk.py` (editor): imports it all into `/Game/HollowAcre/Creature/HuskGame` with its
     collision bodies (a physics asset) and makes its materials (the skin drained grey-blue, the yellowed teeth).
   - Its mouth opens as the MetaHuman face rig opens it: `Scripts/husk_face_bake.py` makes a take that steps the rig's
     controls through rest, jaw open and scream; a game run of `L_HuskPreview` with `-huskfacebake` records the face's
     joints at each (`Saved/Generated/Husk/face_poses.json`), and `tools/husk_face_poses.py` writes them to
     `Source/HollowAcre/HuskFacePoses.inl`, which `AHusk` blends its face by.
   - `Scripts/husk_preview_level.py` builds `L_HuskPreview`, a stage for looking at it (`HUSK_CAM=face` or
     `HUSK_CAMPOS=x,y,z,pitch,yaw,fov` for other views).
   In the game (`AHusk`) its MetaHuman face follows its body bone for bone, and its collision bodies are kept out of
   the real terrain (`GroundLift`; a `-crash` run logs `CreatureLift` lines).
5. `HollowAcre/Scripts/build_drive.py` (editor, headless): imports everything and builds `L_EndingDrive`. A mesh whose
   OBJ hasn't changed since its last import is kept, because the spruces take minutes to import; `HA_REIMPORT=1`
   forces a full re-import.
6. The crash's sound, timed to the moments the game logs as it plays (`CrashEvent <time> <kind> <force>` lines in the
   log of a `-crash` run): recorded sound effects (`SourceArt/Audio/Recorded`, all Creative Commons 0 from Freesound,
   each one's source in its `SOURCES.md`; `tools/blender/decode_audio.py` decodes them to WAV) mixed by
   `tools/make_crash_audio.py` (Python 3 + numpy).

With `-crash` the same scene is Part 2's opening: the creature crosses the road far ahead in the headlights, the
driver brakes to a crawl and looks for it, a growl on the left turns the driver's head as it charges the door, and the
car is shoved through the guardrail and rolls down to the spruce (`EndingDirector`, `GlassBurst`).

In play, `EndingDirector` drives the car up the road, steers from the road's curvature (the wheel turns and the hands
turn with it, `DriverArms`) and runs the wipers. Test switches: `-nofade`, `-drivesecs=`, `-nosteer`, and
`ShotDirector`'s `-shot=`, `-shotdelay=`, `-shotcam=`, `-shotfov=`, `-shotlight=`. From Git Bash, set
`MSYS_NO_PATHCONV=1` so the `/Game/...` map path isn't rewritten.
