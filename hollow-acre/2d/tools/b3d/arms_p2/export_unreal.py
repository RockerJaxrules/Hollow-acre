# Export the first-person arms for Unreal (t353, Part 2 moves to UE): one FBX with both arms skinned to one clean
# skeleton (root + UE-style _l/_r chains), the 10-and-2 grip as an animation, and the baked maps at 2048.
#   RES=2048 python3 export.py out_ue          (bakes + saves out_ue/arm.blend and the data/normal maps)
#   python3 export_unreal.py out_ue            (writes out_ue/unreal/: SK_FP_Arms.fbx and the T_FP_Arms_*.png maps)
# The right arm is the left mirrored across the driver's centre line (vertex groups and bones mirror by name).
import sys, os, math, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import bpy
from mathutils import Matrix, Vector
import scene as S, hands
OUT = sys.argv[-1]; UE = os.path.join(OUT, 'unreal'); os.makedirs(UE, exist_ok=True)
SKIN, SHIRT = os.environ.get('SKIN', 'd49a70'), os.environ.get('SHIRT', '3e6a9a')
bpy.ops.wm.open_mainfile(filepath=os.path.join(OUT, 'arm.blend'))
arm = bpy.data.objects['rig']; mesh = bpy.data.objects['arm']

# ---- names: UE mannequin style
FING = {'index': 'index', 'middle': 'middle', 'ring': 'ring', 'pinky': 'pinky', 'thumb': 'thumb'}
REN = {'upper': 'upperarm_l', 'fore': 'lowerarm_l', 'twist': 'lowerarm_twist_01_l', 'hand': 'hand_l'}
for n in FING:
    for k in (1, 2, 3): REN[f'{n}{k}'] = f'{FING[n]}_0{k}_l'
for vg in mesh.vertex_groups:
    if vg.name in REN: vg.name = REN[vg.name]
for b in arm.data.bones:
    if b.name in REN: b.name = REN[b.name]
if mesh.data.shape_keys:                        # the sleeve-type morphs stay in the GLB pipeline; UE gets the woven sleeve
    for sk in list(mesh.data.shape_keys.key_blocks)[::-1]: mesh.shape_key_remove(sk)

# ---- one root at the driver's centre line, so mirroring is about local X = 0 (car x = EYE.x)
X0 = float(S.EYE[0])
bpy.ops.object.select_all(action='DESELECT'); bpy.context.view_layer.objects.active = arm; arm.select_set(True)
bpy.ops.object.mode_set(mode='EDIT'); eb = arm.data.edit_bones
for b in eb: b.head.x -= X0; b.tail.x -= X0
root = eb.new('root'); root.head = Vector((0, 0, 0)); root.tail = Vector((0, 0, .1))
eb['upperarm_l'].parent = root
for b in eb: b.select = b.name != 'root'; b.select_head = b.select_tail = b.select
bpy.ops.armature.symmetrize(direction='POSITIVE_X')                       # *_l -> *_r across local x = 0
bpy.ops.object.mode_set(mode='OBJECT')
arm.location.x += X0; mesh.location.x += 0
for v in mesh.data.vertices: v.co.x -= X0
mesh.location.x = X0; mesh.parent = arm; mesh.matrix_parent_inverse = arm.matrix_world.inverted()

# ---- the right arm: mirror the mesh with its vertex groups, then drop the mirrored ring (only the left hand wears one)
mod = next((m for m in mesh.modifiers if m.type == 'ARMATURE'), None) or mesh.modifiers.new('arm', 'ARMATURE'); mod.object = arm
for g in list(mesh.vertex_groups):                                        # the mirror only maps onto groups that exist
    if g.name.endswith('_l') and g.name[:-2] + '_r' not in mesh.vertex_groups: mesh.vertex_groups.new(name=g.name[:-2] + '_r')
mir = mesh.modifiers.new('mir', 'MIRROR'); mir.use_axis[0] = True; mir.use_mirror_vertex_groups = True; mir.use_clip = False; mir.use_mirror_merge = False
bpy.context.view_layer.objects.active = mesh
while mesh.modifiers[0].name != 'mir': bpy.ops.object.modifier_move_up(modifier='mir')
bpy.ops.object.modifier_apply(modifier='mir')
import bmesh                                                              # the ring's faces sit in a corner of the UV atlas
bm = bmesh.new(); bm.from_mesh(mesh.data); uvl = bm.loops.layers.uv['UVMap']
dead = [f for f in bm.faces if all(l[uvl].uv.x > .965 and l[uvl].uv.y < .03 for l in f.loops) and f.calc_center_median().x > 0]
bmesh.ops.delete(bm, geom=dead, context='FACES'); bm.to_mesh(mesh.data); bm.free()
mesh.name = 'SK_FP_Arms'; mesh.data.name = 'SK_FP_Arms'; arm.name = 'FP_Arms_Rig'; arm.data.name = 'FP_Arms_Rig'

# ---- the 10-and-2 grip as an action (frame 1 bind, frames 10-40 the grip); the right side's deltas mirrored
RINV = {v: k for k, v in REN.items()}
Mx = np.diag([-1., 1, 1, 1]); Mx[0, 3] = 2 * X0                         # car-space mirror about x = X0
def car_to_rig(M):                                                        # car-space world matrix -> armature space
    T = np.eye(4); T[0, 3] = -X0; return T @ S.B4(M) @ np.linalg.inv(T) if False else S.B4(M)
DL, DR = S.pose_deltas('L'), S.pose_deltas('R')
act = bpy.data.actions.new('A_FP_Grip_10and2'); arm.animation_data_create(); arm.animation_data.action = act
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='POSE')
def apply(frame, deltas):
    for pb in arm.pose.bones: pb.matrix_basis = Matrix.Identity(4)
    bpy.context.view_layer.update()
    order = sorted(arm.pose.bones, key=lambda p: len(p.parent_recursive))
    for pb in order:
        if pb.name == 'root': continue
        base = RINV[pb.name.replace('_r', '_l')] if pb.name.endswith('_r') else RINV[pb.name]
        if deltas is None: continue
        D = deltas[0][base] if pb.name.endswith('_l') else Mx @ deltas[1][base] @ Mx
        rest = np.array(arm.data.bones[pb.name].matrix_local); T = np.eye(4); T[0, 3] = X0
        Dw = S.B4(D)                                                          # world (Blender) delta
        pb.matrix = Matrix((np.linalg.inv(np.array(arm.matrix_world)) @ Dw @ np.array(arm.matrix_world) @ rest).tolist())
        bpy.context.view_layer.update()
    for pb in arm.pose.bones:
        pb.keyframe_insert('location', frame=frame); pb.keyframe_insert('rotation_quaternion', frame=frame); pb.keyframe_insert('scale', frame=frame)
for pb in arm.pose.bones: pb.rotation_mode = 'QUATERNION'
apply(1, None); apply(10, (DL, DR)); apply(40, (DL, DR))
bpy.ops.object.mode_set(mode='OBJECT'); bpy.context.scene.frame_start, bpy.context.scene.frame_end = 1, 40

# ---- maps at the bake resolution: base colour (default tone and sleeve), normal, roughness, subsurface, and the raw data
from PIL import Image
D = np.array(Image.open(os.path.join(OUT, 'arm_d.png')).convert('RGBA')).astype(np.float32) / 255
N = Image.open(os.path.join(OUT, 'arm_n.png')).convert('RGB')
hexc = lambda h: np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32)
skin, cloth = hexc(SKIN), hexc(SHIRT)
ao, flush, crease, mid = D[..., 0:1], D[..., 1:2], D[..., 2:3], D[..., 3:4]
isRing = (mid > .93); isCloth = (mid > .7) & ~isRing; isNail = (mid > .3) & (mid <= .7); isSkin = ~(isRing | isCloth | isNail)
sk = skin * (1 - flush * .55) + skin * np.array([1.08, .68, .64]) * flush * .55
sk = sk * (1 - crease * .12)
nail = (skin * .45 + (skin * np.array([1., .78, .74]) + np.array([.2, .1, .09])) * .55) * 1.1
nail = np.where(mid > .6, nail * .45 + np.array([.92, .87, .8]) * .55, nail)
base = np.where(isRing, np.array([.95, .66, .28]), np.where(isCloth, cloth, np.where(isNail, nail, sk))) * (.55 + .45 * ao)
rough = np.where(isRing, .26, np.where(isCloth, .86, np.where(isNail, .32, .56 - flush * .06)))
sss = np.where(isSkin, .55 + .45 * flush, np.where(isNail, .3, 0.))
to8 = lambda a: (np.clip(a, 0, 1) * 255 + .5).astype(np.uint8)
Image.fromarray(to8(base), 'RGB').save(os.path.join(UE, 'T_FP_Arms_BaseColor.png'))
N.save(os.path.join(UE, 'T_FP_Arms_Normal.png'))
Image.fromarray(to8(rough[..., 0]), 'L').save(os.path.join(UE, 'T_FP_Arms_Roughness.png'))
Image.fromarray(to8(sss[..., 0]), 'L').save(os.path.join(UE, 'T_FP_Arms_Subsurface.png'))
Image.fromarray(to8(D), 'RGBA').save(os.path.join(UE, 'T_FP_Arms_Data.png'))   # R AO, G flush, B crease, A material id (runtime tinting)

# ---- FBX (UE: Z up, X forward is handled by UE's importer; metres -> centimetres via scale)
mat = bpy.data.materials.new('M_FP_Arms'); mesh.data.materials.clear(); mesh.data.materials.append(mat)
bpy.ops.object.select_all(action='DESELECT'); arm.select_set(True); mesh.select_set(True); bpy.context.view_layer.objects.active = arm
fbx = os.path.join(UE, 'SK_FP_Arms.fbx')
bpy.ops.export_scene.fbx(filepath=fbx, use_selection=True, object_types={'ARMATURE', 'MESH'}, add_leaf_bones=False, bake_anim=True,
                         bake_anim_use_all_actions=True, bake_anim_use_nla_strips=False, use_armature_deform_only=True, mesh_smooth_type='FACE',
                         use_tspace=True, apply_unit_scale=True, global_scale=1.0, axis_forward='-Y', axis_up='Z', primary_bone_axis='Y', secondary_bone_axis='X')
print('FBX', fbx, os.path.getsize(fbx))

# ---- check: load it back into an empty scene
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.fbx(filepath=fbx)
A = [o for o in bpy.context.scene.objects if o.type == 'ARMATURE']; Ms = [o for o in bpy.context.scene.objects if o.type == 'MESH']
assert len(A) == 1 and len(Ms) == 1, (len(A), len(Ms))
bn = [b.name for b in A[0].data.bones]; vg = {g.name for g in Ms[0].vertex_groups}
roots = [b.name for b in A[0].data.bones if b.parent is None]
print('reimport: bones', len(bn), 'roots', roots, 'tris', sum(len(p.vertices) - 2 for p in Ms[0].data.polygons), 'vgroups', len(vg),
      'actions', [a.name for a in bpy.data.actions], 'frames', A[0].animation_data.action.frame_range[:] if A[0].animation_data and A[0].animation_data.action else None)
assert roots == ['root'] and {'hand_l', 'hand_r', 'thumb_01_l', 'index_03_r'} <= set(bn) and {'hand_l', 'hand_r', 'index_03_r'} <= vg, (roots, sorted(vg))
print('UNREAL EXPORT OK')
