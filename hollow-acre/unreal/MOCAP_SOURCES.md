# Motion sources (real motion as the base of the creature's animation)

The owner has no money or kit for motion capture of our own. The creature's movement is built in Unreal from free,
commercially usable motion, retargeted onto it with Unreal's IK Retargeter. Each source's licence is checked before
anything is downloaded, and every clip is logged here.

## CMU Graphics Lab Motion Capture Database

- Source: http://mocap.cs.cmu.edu
- Licence, from its FAQ, "How can I use this data?": "The motion capture data may be copied, modified, or
  redistributed without permission." The data was created with funding from NSF EIA-0196217.
- Raw ASF/AMC files are kept outside the repository (D:/HollowAcreTools/mocap/cmu).
- Converted with `tools/blender/cmu_to_fbx.py` into one skeleton with the UE mannequin's bone names, in centimetres.
- Imported and retargeted with `HollowAcre/Scripts/import_mocap.py`:
  - source clips go to `/Game/HollowAcre/Creature/Mocap/CMU`;
  - the creature's versions go to `/Game/HollowAcre/Creature/Mocap/Husk`.

| Clip | Subject | What |
|---|---|---|
| 54_01, 54_14, 54_23 | 54 (animal behaviours, pantomime) | monkey |
| 54_02 | 54 | bear |
| 54_09 | 54 | praying mantis |
| 55_08, 55_09, 55_26 | 55 (animal behaviours, pantomime) | monkey |
| 55_11 | 55 | animal |
| 55_13 | 55 | praying mantis |
| 55_24 | 55 | various animals |
| 55_28 | 55 | monkey/bear |
| 111_03 | 111 | crawling |
| 133_01, 133_02 | 133 | walk, crawl |
| 77_14, 77_15 | 77 (careful actions) | careful creeping |
| 77_34 | 77 | creep and pause, repeat |
| 139_29, 139_31 | 139 (action walks) | sneaking |
| 17_03, 17_04 | 17 (walking styles) | walk stealthily |
| 104_41, 104_43 | 104 | zombie walk |

## MetaHuman's own locomotion (Kessler)

Shipped with Unreal Engine's MetaHuman plugin (`/MetaHumanCharacter/Optional/Animation/UEFNAnimPreset/Locomotion`), on
the MetaHuman skeleton itself (`metahuman_base_skel`), so Kessler plays them with no retargeting; covered by the engine's
licence for use in Unreal projects. In-place loops: AKessler moves him by what keeps his planted foot still.

| Clip | Used for |
|---|---|
| AS_MH_Neutral_Walk_Loop_F | Kessler walking (played at 0.62-0.8 speed: careful, then purposeful) |
| AS_MH_Neutral_Stand_Idle_Loop | Kessler standing |

The CMU walks retargeted onto him (17_03, 17_04, 133_01, 139_29) turned out to be stealthy walks that circle and
double back, not straight walks; kept for later.

## Approved, not yet used

- Mixamo: needs the owner's Adobe sign-in.
- Epic's Game Animation Sample: through the Epic launcher.
- MetaHuman video-to-motion: on free stock footage, such as Pexels.
