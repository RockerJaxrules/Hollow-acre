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
  Not started: the owner decides.

## Sources
- MetaHuman docs: [Animating MetaHumans with Control Rig](https://dev.epicgames.com/documentation/en-us/metahuman/animating-metahumans-with-control-rig-in-unreal-engine), [Animate using Sequencer](https://dev.epicgames.com/documentation/metahuman/animate-using-sequencer)
- Unreal docs: [Animation Mode](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-editor-mode-in-unreal-engine), [Control Rig](https://dev.epicgames.com/documentation/en-us/unreal-engine/control-rig-in-unreal-engine), [Animating with Control Rig](https://dev.epicgames.com/documentation/en-us/unreal-engine/animating-with-control-rig-in-unreal-engine), [Motion Warping](https://dev.epicgames.com/documentation/en-us/unreal-engine/motion-warping-in-unreal-engine), [Animating in Unreal for Maya users](https://dev.epicgames.com/documentation/unreal-engine/animating-in-unreal-engine-for-maya-users)
- Community: [Pick-up items at different heights (Control Rig IK)](https://forums.unrealengine.com/t/1729749), [Reach out, pick up and hold item](https://forums.unrealengine.com/t/reach-out-pickup-and-hold-item-animation/577943), [Inside Unreal: Motion Warping and Full-Body IK](https://forums.unrealengine.com/t/inside-unreal-motion-warping-and-full-body-ik/236675), [Animating MetaHumans (community tutorial)](https://forums.unrealengine.com/t/community-tutorial-animating-metahumans/2244516), [MetaHuman finger baking issue](https://forums.unrealengine.com/t/issue-with-fingers-when-baking-animation-sequence-of-metahumans/501688)
- First-person: [MoCap Online, First-Person Animation guide](https://mocaponline.com/blogs/mocap-news/first-person-animation-guide)
- Craft: [Anticipating a reach (21 Foundations of Animation)](https://www.lynda.com/3D-Animation-tutorials/Anticipating-reach/2811343/2925395-4.html), [Overlapping action (traditional principles)](https://kwx.liehendr.com/content/wikibooks_en_all_maxi_2021-03/A/Traditional_Principles_of_Animation/Overlapping_action)
