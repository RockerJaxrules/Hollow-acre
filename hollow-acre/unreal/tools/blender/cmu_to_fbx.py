"""CMU motion capture (ASF skeleton + AMC motions, mocap.cs.cmu.edu: "may be copied, modified, or redistributed without
permission") -> one FBX for Unreal: a skeleton with the UE mannequin's bone names (so Unreal's IK Retargeter maps it onto
the creature by itself), a stick body skinned to it (Unreal makes a skeleton only from a skinned mesh), and every clip
as its own take, 30 frames a second (from 120). Real performances as the base of the creature's movement instead of
hand-placed poses (the owner: animate in Unreal, with real motion; no money for motion capture).

One skeleton for all clips: the first subject's bone lengths; each clip drives it by its joint angles, its root
travel scaled by the ratio of the subjects' leg lengths.

Run: blender -b --factory-startup --python cmu_to_fbx.py -- <dir of .asf/.amc> <out.fbx> <clip,clip,...>
  a clip is "<amc name>" (its subject's .asf beside it), e.g. 54_01,55_28"""
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Matrix, Quaternion, Vector

ARGS = sys.argv[sys.argv.index('--') + 1:]
SRC, OUT, CLIPS = ARGS[0], ARGS[1], ARGS[2].split(',')
SCALE = (1.0 / 0.45) * 2.54                  # ASF/AMC lengths to centimetres (CMU FAQ; Unreal's unit, the scene's unit 0.01)
FPS_IN, FPS_OUT = 120, 30

# CMU names -> the UE mannequin's
NAMES = {'root': 'pelvis', 'lowerback': 'spine_01', 'upperback': 'spine_02', 'thorax': 'spine_03', 'lowerneck': 'neck_01',
         'upperneck': 'neck_02', 'head': 'head', 'lhipjoint': 'hip_l', 'rhipjoint': 'hip_r', 'lfemur': 'thigh_l',
         'rfemur': 'thigh_r', 'ltibia': 'calf_l', 'rtibia': 'calf_r', 'lfoot': 'foot_l', 'rfoot': 'foot_r', 'ltoes': 'ball_l',
         'rtoes': 'ball_r', 'lclavicle': 'clavicle_l', 'rclavicle': 'clavicle_r', 'lhumerus': 'upperarm_l', 'rhumerus': 'upperarm_r',
         'lradius': 'lowerarm_l', 'rradius': 'lowerarm_r', 'lwrist': 'hand_l', 'rwrist': 'hand_r', 'lhand': 'hand_end_l',
         'rhand': 'hand_end_r', 'lfingers': 'middle_01_l', 'rfingers': 'middle_01_r', 'lthumb': 'thumb_01_l', 'rthumb': 'thumb_01_r'}


def log(*a):
    print('cmu:', *a, flush=True)


def rot_xyz(ax, ay, az):
    """Static X then Y then Z (as the ASF axis and AMC angles are applied): Rz @ Ry @ Rx, radians."""
    cx, sx, cy, sy, cz, sz = math.cos(ax), math.sin(ax), math.cos(ay), math.sin(ay), math.cos(az), math.sin(az)
    Rx = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]])
    Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]])
    Rz = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]])
    return Rz @ Ry @ Rx


def read_asf(path):
    bones = {'root': {'dir': np.zeros(3), 'len': 0.0, 'axis': np.zeros(3), 'dof': ['rx', 'ry', 'rz'], 'children': []}}
    hier = {}
    lines = [l.strip() for l in open(path, encoding='latin-1')]
    i = 0
    section = None
    cur = None
    while i < len(lines):
        l = lines[i]
        if l.startswith(':'):
            section = l.split()[0]
            if section == ':root':
                pass
        elif section == ':root':
            p = l.split()
            if p and p[0] == 'axis':
                pass
        elif section == ':bonedata':
            p = l.split()
            if not p:
                pass
            elif p[0] == 'begin':
                cur = {'dof': [], 'children': []}
            elif p[0] == 'name':
                cur['name'] = p[1]
            elif p[0] == 'direction':
                cur['dir'] = np.array([float(v) for v in p[1:4]])
            elif p[0] == 'length':
                cur['len'] = float(p[1]) * SCALE
            elif p[0] == 'axis':
                cur['axis'] = np.radians([float(v) for v in p[1:4]])
            elif p[0] == 'dof':
                cur['dof'] = p[1:]
            elif p[0] == 'end':
                bones[cur['name']] = cur
        elif section == ':hierarchy':
            p = l.split()
            if p and p[0] not in ('begin', 'end'):
                hier[p[0]] = p[1:]
        i += 1
    for parent, kids in hier.items():
        for k in kids:
            bones[k]['parent'] = parent
            bones[parent].setdefault('children', []).append(k)
    bones['root']['parent'] = None
    for b in bones.values():
        b['C'] = rot_xyz(*b['axis']) if 'axis' in b and b['axis'] is not None else np.eye(3)
        b['Ci'] = b['C'].T
    return bones


def read_amc(path):
    frames, cur = [], None
    for l in open(path, encoding='latin-1'):
        l = l.strip()
        if not l or l.startswith('#') or l.startswith(':'):
            continue
        p = l.split()
        if p[0].isdigit() and len(p) == 1:
            cur = {}
            frames.append(cur)
        elif cur is not None:
            cur[p[0]] = [float(v) for v in p[1:]]
    return frames


def order(bones):
    out, stack = [], ['root']
    while stack:
        b = stack.pop()
        out.append(b)
        stack.extend(reversed(bones[b].get('children', [])))
    return out


# CMU's world is Y up; Blender's is Z up: (x, y, z) -> (x, -z, y)
Y2Z = np.array([[1, 0, 0], [0, 0, -1], [0, 1, 0]], float)


def pose_frame(bones, f):
    """Each bone's world rotation (3x3, CMU frame) and its start and end points, for one AMC frame."""
    R, P0, P1 = {}, {}, {}
    for name in order(bones):
        b = bones[name]
        vals = f.get(name, [])
        if name == 'root':
            t = np.array(vals[0:3]) * SCALE if len(vals) >= 3 else np.zeros(3)
            ang = np.radians(vals[3:6]) if len(vals) >= 6 else np.zeros(3)
            M = rot_xyz(*ang)
            R[name] = b['C'] @ M @ b['Ci']
            P0[name] = P1[name] = t
            continue
        ang = {'rx': 0.0, 'ry': 0.0, 'rz': 0.0}
        for d, v in zip(b['dof'], vals):
            ang[d] = math.radians(v)
        M = rot_xyz(ang['rx'], ang['ry'], ang['rz'])
        R[name] = R[b['parent']] @ b['C'] @ M @ b['Ci']
        P0[name] = P1[b['parent']]
        P1[name] = P0[name] + R[name] @ (b['dir'] * b['len'])
    return R, P0, P1


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.fps = FPS_OUT
    first_subject = CLIPS[0].split('_')[0]
    base = read_asf(os.path.join(SRC, first_subject + '.asf'))
    names = order(base)
    # the skeleton at rest (all angles 0: the ASF's own pose), standing on the ground (its lowest point at 0: Unreal's
    # retargeter scales the pelvis' travel by the two skeletons' pelvis heights), Z up
    rest_R, rest0, rest1 = pose_frame(base, {})
    lift = -min(min(p[1] for p in rest0.values()), min(p[1] for p in rest1.values()))
    for d in (rest0, rest1):
        for k in d:
            d[k] = d[k] + np.array([0.0, lift, 0.0])
    log('rest: pelvis %.0f cm up' % lift)
    arm_d = bpy.data.armatures.new('CMU')
    arm = bpy.data.objects.new('CMU', arm_d)
    sc.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='EDIT')
    eb = arm_d.edit_bones
    root = eb.new('root')
    root.head, root.tail = (0, 0, 0), (0, 15.0, 0)
    for n in names:
        b = base[n]
        e = eb.new(NAMES.get(n, n))
        h = Vector(Y2Z @ rest0[n])
        if n == 'root':
            e.head, e.tail = h, h + Vector((0, 0, 12.0))
            e.parent = root
        else:
            t = Vector(Y2Z @ rest1[n])
            if (t - h).length < 0.1:
                t = h + Vector((0, 0, 2.0))
            e.head, e.tail = h, t
            e.parent = eb[NAMES.get(b['parent'], b['parent'])]
            e.use_connect = False
    bpy.ops.object.mode_set(mode='OBJECT')
    # a stick body, each bone's own (Unreal makes a skeleton only from a skinned mesh)
    verts, faces, groups = [], [], []
    for n in names:
        bn = NAMES.get(n, n)
        bb = arm_d.bones[bn]
        h, t = bb.head_local, bb.tail_local
        d = (t - h)
        L = max(d.length, 2.0)
        u = d.normalized().orthogonal().normalized() * min(2.0, L * 0.2)
        v = d.normalized().cross(u)
        k = len(verts)
        verts += [h, h + d * 0.5 + u, h + d * 0.5 + v, h + d * 0.5 - u, h + d * 0.5 - v, t]
        faces += [(k, k + 1, k + 2), (k, k + 2, k + 3), (k, k + 3, k + 4), (k, k + 4, k + 1),
                  (k + 5, k + 2, k + 1), (k + 5, k + 3, k + 2), (k + 5, k + 4, k + 3), (k + 5, k + 1, k + 4)]
        groups.append((bn, range(k, k + 6)))
    me = bpy.data.meshes.new('CMU_Body')
    me.from_pydata([tuple(p) for p in verts], [], faces)
    body = bpy.data.objects.new('CMU_Body', me)
    sc.collection.objects.link(body)
    for bn, idx in groups:
        g = body.vertex_groups.new(name=bn)
        g.add(list(idx), 1.0, 'REPLACE')
    body.parent = arm
    mod = body.modifiers.new('Armature', 'ARMATURE')
    mod.object = arm
    # the takes: each AMC frame's world rotations onto the bones (as rotations from rest), the pelvis' travel
    arm.animation_data_create()
    rest_m = {bn: arm_d.bones[bn].matrix_local.copy() for bn in arm_d.bones.keys()}
    leg0 = base['lfemur']['len'] + base['ltibia']['len']
    for clip in CLIPS:
        subj = clip.split('_')[0]
        asf = read_asf(os.path.join(SRC, subj + '.asf')) if subj != first_subject else base
        frames = read_amc(os.path.join(SRC, clip + '.amc'))[::FPS_IN // FPS_OUT]
        k_travel = leg0 / max(1e-3, asf['lfemur']['len'] + asf['ltibia']['len'])
        act = bpy.data.actions.new(clip)
        arm.animation_data.action = act
        for fi, f in enumerate(frames):
            R, P0, _ = pose_frame(asf, f)
            world = {}
            for n in names:
                bn = NAMES.get(n, n)
                Rw = Matrix((Y2Z @ R[n] @ Y2Z.T).tolist())             # this bone's rotation from rest, Z up
                head = rest_m[bn].translation if n != 'root' else Vector(Y2Z @ (P0['root'] * k_travel))
                world[bn] = Matrix.Translation(head) @ Rw.to_4x4() @ rest_m[bn].to_3x3().to_4x4() if n == 'root' else Rw.to_4x4() @ rest_m[bn].to_3x3().to_4x4()
            for n in names:
                bn = NAMES.get(n, n)
                pb = arm.pose.bones[bn]
                par = arm_d.bones[bn].parent
                # the rotation relative to its parent, as Blender keys it (location only on the pelvis)
                if n == 'root':
                    basis = (rest_m['root'].inverted() @ rest_m[bn]).inverted() @ world[bn]
                    basis = (rest_m[bn].inverted() @ world[bn])
                    pb.location = basis.to_translation()
                    pb.rotation_quaternion = basis.to_quaternion()
                    pb.keyframe_insert('location', frame=fi)
                else:
                    pr = world[par.name].to_3x3() if par.name in world else Matrix.Identity(3)
                    local_rest = rest_m[par.name].to_3x3().inverted() @ rest_m[bn].to_3x3()
                    q = (local_rest.inverted() @ pr.inverted() @ world[bn].to_3x3()).to_quaternion()
                    pb.rotation_quaternion = q
                pb.rotation_mode = 'QUATERNION'
                pb.keyframe_insert('rotation_quaternion', frame=fi)
        act.use_fake_user = True
        act.use_frame_range = True
        act.frame_start, act.frame_end = 0, len(frames) - 1
        log('%s: %d frames (%.1f s) from subject %s, its travel x%.2f' % (clip, len(frames), (len(frames) - 1) / FPS_OUT, subj, k_travel))
    sc.unit_settings.scale_length = 0.01
    bpy.ops.object.select_all(action='DESELECT')
    arm.select_set(True)
    body.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.export_scene.fbx(filepath=OUT, use_selection=True, object_types={'ARMATURE', 'MESH'}, add_leaf_bones=False,
                             bake_anim=True, bake_anim_use_all_actions=True, bake_anim_use_nla_strips=False,
                             bake_anim_force_startend_keying=True, bake_anim_step=1.0, bake_anim_simplify_factor=0.0,
                             apply_scale_options='FBX_SCALE_ALL', axis_forward='-Z', axis_up='Y')
    log('wrote', OUT)


main()
