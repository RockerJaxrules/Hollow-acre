# t353 hands r1 plan: first-person hands and arms on the wheel

**Who sees it, and from where.** This is the driver's own eye. The camera is at car (-0.36, 1.20, 0.00) and looks
down 4°. The vertical field of view is 64° on desktop and 84° on a phone.

- The hands are 0.55-0.6 m from the eye, at 10 and 2 on a rim of radius 18.5 cm.
- The wheel is tilted 24° back.
- You mostly see the back of each hand, its knuckles, the proximal phalanges going over the outer edge of the rim, the
  thumb on the inner and front side, the wrist, about 7 cm of forearm and the sleeve.
- At 1280x720, one hand is about 130 px across. It is about 150 px on a phone.

## Measurements (cm)

**Hand**
- Wrist crease to middle fingertip: 18.6.
- Palm (wrist centre to middle MCP): 9.0.
- Width across the knuckles: 8.4.
- Palm thickness: 2.9 at the metacarpals and 3.8 at the wrist.

**Knuckle arc.** MCP positions relative to the wrist centre, as (across, toward the fingers). Positive "across" is
toward the thumb.

| Finger | MCP position |
|---|---|
| index | (+2.95, 8.55) |
| middle | (+0.95, 9.00) |
| ring | (-1.00, 8.65) |
| pinky | (-2.85, 7.85) |

**Finger segments**, from the MCP outward, with the base and tip widths. The segment ratio is about
1 : 0.6 : 0.45.

| Finger | Segments | Width at base | Width at tip |
|---|---|---|---|
| index | 4.1 / 2.45 / 1.95 | 2.0 | 1.45 |
| middle | 4.55 / 2.8 / 2.05 | 2.05 | 1.5 |
| ring | 4.25 / 2.65 / 2.0 | 1.9 | 1.42 |
| pinky | 3.35 / 1.95 / 1.75 | 1.7 | 1.26 |

- Each finger is 0.86 times as thick as it is wide.
- Joints are 4% wider than the shaft of the segment.

**Thumb**
- Its base (CMC) is at the wrist: (+2.3 across, 1.6 along), 1.0 to the palm side.
- Metacarpal 4.6, proximal phalanx 3.1, distal phalanx 2.6.
- Width 2.2 at the IP joint and 1.85 at the tip.

**Nails**
- Half the length of the last segment: index 1.05 long by 1.15 wide, thumb 1.4 by 1.5.
- Curved, standing 0.05 proud, with a free edge 0.12 long.

**Forearm**
- About 26 long. Visible for about 7 before the cuff.
- 5.9 wide by 3.9 thick at the wrist; 7.0 by 5.2 at 10 cm.
- Flatter on the palm side. The ulnar styloid bump is on the pinky side.

**Sleeve**
- Opening radius 4.0, with 3.2 mm cloth and a doubled 2.6 cm hem.
- Radius 4.6 at mid-forearm, 5.2 at the elbow and 5.8 on the upper arm.
- Compression folds at the inner elbow, bunching rings just above the cuff, and long drape folds.

**Rim:** tube radius 1.65 (3.3 cm thick), stitched leather.

## Parts and how each is built

**1. Left hand and forearm: one quad cage, then subdivision surface.**
- The palm is 5 rings of 20 verts. Its distal edge is split into four 8-vert finger ports.
- Each finger is a tube of 8-vert rings, with 3 loops at the PIP and 3 at the DIP, closed by a 3-quad cap.
- The thumb is a tube from an 8-vert port on the thenar side, starting at the wrist.
- The forearm carries on from the wrist ring, bent toward the elbow in the bind pose, and is capped inside the sleeve.
- The game mesh is subdivision level 1. The bake source is level 3, displaced in numpy with:
  - wrinkles over the knuckles;
  - creases at the joints;
  - extensor tendons fanning over the back of the hand;
  - two veins;
  - the ulnar styloid.

**2. Nails:** small curved plates, bevelled, part of the same mesh, each weighted to its distal bone.

**3. Sleeve:** a cage tube from the cuff to the shoulder.
- The cuff lip rolls inward into a 7 cm pocket, so the cloth has visible thickness.
- Cage folds, plus finer folds in the level-3 bake source.

**4. Wedding ring:** a small band on the left ring finger's proximal phalanx. The shader hides it unless the save is
married.

**5. Armature**
- Bones: shoulder, upper, fore, twist, hand, then index, middle, ring and pinky with 3 bones each, and thumb with 3.
- Weights come from the joint-plane blend, so deformation is clean at the PIP and DIP.

**6. Grip pose**
- The bind pose has flat fingers. The grip comes from bones, through the finger cascade:
  - the index curls least and the pinky most;
  - MCP : PIP : DIP is about 1 : 1.4 : 0.9;
  - each finger closes until it touches the rim.
- The thumb aims along the inner and front face of the rim.

The right arm is the left arm mirrored in three.js. It shares the geometry, at one draw call per arm.

## Materials
- Blender check sheets use `mats.skin(tone)` and `mats.cloth(shirt)`.
- For three.js, the bakes are:
  - a tangent normal map at 1024 px;
  - a 1024 px data map with AO, flush, nail mask and material id.
- At runtime, the shader takes the save's skin tone, shirt colour and pattern, with wrap lighting for skin, a warm
  terminator, sheen on the cloth and a woven normal.

## Budgets
- About 7k triangles per arm (hand 4.5k, sleeve 1.6k, forearm and nails 0.9k), about 14k for the pair.
- Two textures of 1024 px or less.
- The GLB and textures together under 0.6 MB.
