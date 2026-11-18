# Unreal animation: what the tutorials and docs teach (for Part 2)

The owner: "read a lot of Unreal Engine tutorials for this game". This file gathers what applies to Part 2's first-person
cutscenes and play. Sources at the bottom; what we do differently today is noted.

## How Unreal expects character animation to be authored
- **Cutscenes: Sequencer with Control Rig (Animation Mode).** The character goes in a Level Sequence with a Control
  Rig track. An animator keys the rig's controls (IK hands, FK arms, every finger), shapes the keys in the curve editor
  (Sequencer Curves, Unreal's Graph Editor), and checks:
  - **Motion Trails:** the control's path drawn in the viewport, keys draggable. Marks far apart mean fast, close
    together mean slow. This is how arcs and spacing are checked.
  - **Tween Controller:** the in-between keys, in three modes: Blend to Neighbor, Push Pull, Tween.
  - **Poses tool:** stored hand poses (a grip, an open hand), blended on with a slider, mirrored for the other hand.
  - **Snapper tool:** pins a control to another (a hand to a prop) over a frame range, baked as editable keys.
  - **Pivot tool:** a temporary pivot, to turn a hand about the object it holds.
- **The MetaHuman body comes with `MetaHuman_ControlRig`.** In Sequencer, put an animation on the Body track, then
  right-click and choose Bake To Control Rig (MetaHuman_ControlRig) to get editable keys. When done, bake back with Bake
  Animation Sequence or Create Linked Animation Sequence. Known issue: fingers can break on baking; the community fix
  is an additive overlay with a key on every finger joint.
- **Gameplay: a base animation (mocap or Mixamo, retargeted) plus IK at runtime.**
  - Two Bone IK for limbs, FABRIK or CCDIK for chains, Full Body IK for the whole skeleton.
  - **Motion Warping** bends a montage's root motion onto a target: notify windows in the montage, a warp target set in
    Blueprint.
  - For pickups: a reach animation aimed at the item (IK, or directional variants). A centre-screen reach "feels
    unconvincing" when the item is to one side. Attach the item when the fingers close.
- **First person:** the arms are the only body seen, so they carry the action. The camera follows the body at reduced
  amplitude (head bob at 30-60% of real) to avoid motion sickness. The arm shouldn't block the view for more than a
  moment. Hand IK contact makes the character feel physically present.

## The animator's craft for a reach and grab
- **Gaze first:** the eyes are on the object before the hand moves.
- **Anticipation:** a small pull-back, the fingers spreading, before the reach.
- **Arcs, not straight lines.** Slow-in at the target: the last third of a reach is slow and careful.
- **Overlap and successive breaking of joints:** shoulder, then elbow, then wrist, then fingers, each starting before
  the last finishes. The wrist turns late; the fingers trail.
- **Grip aperture:** the hand opens widest about two-thirds of the way in, then closes on contact.
- **Weight:** a small press at contact; the lift starts slow (the object's weight); the body goes with it.
- **Follow-through and settle:** the held object swings a little past its pose and settles.

## Where we are versus this
- Part 2's arms are posed in C++ every frame (DriverArms: our own two-bone IK, hand shapes, a floor guard), not
  keyed in Sequencer. The wake's flashlight pickup now follows the craft list above in code. It is still procedural
  curves, not an animator's keys, which is why it can look mechanical.
- **Proposed:** author the cutscene arm and hand work in Sequencer on MetaHuman_ControlRig, keyed by script (Python
  sets control keys; motion trails used to check arcs), with the procedural poses as the first pass baked to the rig.
  Gameplay pickups would use a small set of reach animations (Mixamo or keyed) with Full Body IK onto the item.
  The owner chose Sequencer; Python keying didn't evaluate the rig, but Epic's MCP toolset does (below).

## What we do now: the wake's pickup keyed in Sequencer (through Unreal MCP)
- **Unreal MCP** (Epic's, built into 5.8, experimental) runs inside the editor: plugins ModelContextProtocol,
  ToolsetRegistry, EditorToolset, AnimationAssistantToolset, SequencerAnimMixerToolset, all Editor-only (Epic marks
  it NoRedist; it must never ship). Usage analytics off (`ModelContextProtocol.EnableAnalytics=0`, DefaultEngine.ini).
  - Start: `UnrealEditor.exe HollowAcre.uproject /Game/HollowAcre/Wake/Anim/L_ArmLab -ModelContextProtocolStartServer`
    (localhost:8000). Client: `tools/mcp/mcp_call.py` (list / desc / call; images saved via MCP_IMG).
  - Three meta-tools: list_toolsets, describe_toolset, call_tool. `ProgrammaticToolset.execute_tool_script` batches
    hundreds of calls in one go.
  - Gotchas: turn off `EditorPerformanceSettings.bThrottleCPUWhenNotForeground`, or the editor ticks at ~3 fps in
    the background and captures go stale. After an editor restart, close and reopen the sequence before evaluating.
    Sections made by add_section are 0..0 long (unbound them). Transform tracks on props wouldn't evaluate; the lab
    places props with set_actor_transform per moment instead. CaptureViewport needs every argument given.
- **The pipeline:**
  1. `-wake -wakedump` (with `-wakenoanim`) writes Saved/WakeDump.jsonl: per frame (frame 0 = w 9.3), the eye,
     lining, flashlight and the exact hand-IK and pole controls the game gives the rig, in the rig's own space (the
     body standing in its reference pose, matched at spine_05).
  2. L_ArmLab: the MetaHuman standing at the origin; `tools/mcp/lab_pose.py` places the lining and flashlight for a
     frame and shoots it through the wake's eye and from the side.
  3. `tools/mcp/lab_keys.py dump 30:100:3 100:165:6 --bridge=78:93` keys hand_r_ik_ctrl and arm_r_pv_ik_ctrl in
     LS_ArmLab (a bridge eases over frames where the solver jumps).
  4. SequencerImportExportTools.export_anim_sequence bakes the body binding to A_WakePickup.
  5. The wake plays the right arm from A_WakePickup from 10.3 to 14.8 s (DriverArms::AnimArm, the clavicle down to
     the hand); the fingers are still posed in code.
- The poses keyed come from the code's anatomy solver: the wrist placed, the elbow where the rig's IK puts it, the
  hand built from the forearm with the wrist's bend kept comfortable, the elbow kept off the lining and the arm kept
  off the head and the eye. Edit keys in LS_ArmLab directly, or change the solver, re-dump and re-key.

## Sources
- MetaHuman docs: [Animating MetaHumans with Control Rig](https://dev.epicgames.com/documentation/en-us/metahuman/animating-metahumans-with-control-rig-in-unreal-engine), [Animate using Sequencer](https://dev.epicgames.com/documentation/metahuman/animate-using-sequencer)
- Unreal docs: [Animation Mode](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-editor-mode-in-unreal-engine), [Control Rig](https://dev.epicgames.com/documentation/en-us/unreal-engine/control-rig-in-unreal-engine), [Animating with Control Rig](https://dev.epicgames.com/documentation/en-us/unreal-engine/animating-with-control-rig-in-unreal-engine), [Motion Warping](https://dev.epicgames.com/documentation/en-us/unreal-engine/motion-warping-in-unreal-engine), [Animating in Unreal for Maya users](https://dev.epicgames.com/documentation/unreal-engine/animating-in-unreal-engine-for-maya-users)
- Community: [Pick-up items at different heights (Control Rig IK)](https://forums.unrealengine.com/t/1729749), [Reach out, pick up and hold item](https://forums.unrealengine.com/t/reach-out-pickup-and-hold-item-animation/577943), [Inside Unreal: Motion Warping and Full-Body IK](https://forums.unrealengine.com/t/inside-unreal-motion-warping-and-full-body-ik/236675), [Animating MetaHumans (community tutorial)](https://forums.unrealengine.com/t/community-tutorial-animating-metahumans/2244516), [MetaHuman finger baking issue](https://forums.unrealengine.com/t/issue-with-fingers-when-baking-animation-sequence-of-metahumans/501688)
- First-person: [MoCap Online, First-Person Animation guide](https://mocaponline.com/blogs/mocap-news/first-person-animation-guide)
- Craft: [Anticipating a reach (21 Foundations of Animation)](https://www.lynda.com/3D-Animation-tutorials/Anticipating-reach/2811343/2925395-4.html), [Overlapping action (traditional principles)](https://kwx.liehendr.com/content/wikibooks_en_all_maxi_2021-03/A/Traditional_Principles_of_Animation/Overlapping_action)
