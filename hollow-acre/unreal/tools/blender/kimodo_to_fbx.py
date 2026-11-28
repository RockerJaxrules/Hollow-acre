"""NVIDIA Kimodo motions (text-to-motion; Kimodo-SOMA-RP weights, NVIDIA Open Model License, "ready for commercial use")
exported from its demo as BVH (the 77-joint SOMA skeleton, Y up, cm, 30 fps) -> one FBX for Unreal: the skeleton's bones
renamed to the UE mannequin's (so Unreal's IK Retargeter maps it onto the creature by itself, as with the CMU clips:
HollowAcre/Scripts/import_mocap.py), a stick body skinned to it (Unreal makes a skeleton only from a skinned mesh), and
every motion as its own take.

Run: blender -b --factory-startup --python kimodo_to_fbx.py -- <out.fbx> <a.bvh> [<b.bvh> ...]
  each take is named after its file (kimodo_walker_stalk.bvh -> take 'kimodo_walker_stalk')"""
import os
import sys

import bpy

ARGS = sys.argv[sys.argv.index('--') + 1:]
OUT, BVHS = ARGS[0], ARGS[1:]

# SOMA names -> the UE mannequin's (fingers: SOMA's 1 is the metacarpal, 2-4 the three phalanges)
NAMES = {'Root': 'root', 'Hips': 'pelvis', 'Spine1': 'spine_01', 'Spine2': 'spine_02', 'Chest': 'spine_03',
         'Neck1': 'neck_01', 'Neck2': 'neck_02', 'Head': 'head'}
for s, x in (('Left', 'l'), ('Right', 'r')):
    NAMES.update({s + 'Shoulder': 'clavicle_' + x, s + 'Arm': 'upperarm_' + x, s + 'ForeArm': 'lowerarm_' + x,
                  s + 'Hand': 'hand_' + x, s + 'Leg': 'thigh_' + x, s + 'Shin': 'calf_' + x, s + 'Foot': 'foot_' + x,
                  s + 'ToeBase': 'ball_' + x})
    for i in (1, 2, 3):
        NAMES[s + 'HandThumb%d' % i] = 'thumb_%02d_%s' % (i, x)
    for f in ('Index', 'Middle', 'Ring', 'Pinky'):
        NAMES[s + 'Hand%s1' % f] = '%s_metacarpal_%s' % (f.lower(), x)
        for i in (2, 3, 4):
            NAMES[s + 'Hand%s%d' % (f, i)] = '%s_%02d_%s' % (f.lower(), i - 1, x)


def log(*a):
    print('kimodo:', *a, flush=True)


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.fps = 30
    sc.unit_settings.scale_length = 0.01            # (1 Blender unit = 1 cm, as the BVH)
    arm, actions = None, []
    for path in BVHS:
        before = set(bpy.data.objects)
        bpy.ops.import_anim.bvh(filepath=path, global_scale=1.0, frame_start=0, use_fps_scale=False,
                                update_scene_fps=False, update_scene_duration=False, rotate_mode='QUATERNION',
                                axis_forward='-Z', axis_up='Y')
        obj = [o for o in bpy.data.objects if o not in before and o.type == 'ARMATURE'][0]
        act = obj.animation_data.action
        act.name = os.path.splitext(os.path.basename(path))[0]
        act.use_fake_user = True
        n = int(act.frame_range[1] - act.frame_range[0]) + 1
        log('%s: %d frames, %d bones' % (act.name, n, len(obj.data.bones)))
        actions.append(act)
        if arm is None:
            arm = obj
        else:
            bpy.data.objects.remove(obj)
    # its rest pose made a real one: the BVH's own rest is every bone laid along its local X (the BONES-SEED format, the
    # skeleton a straight line), which Unreal's retargeter would bend the creature to match (upright, on tiptoe). Each
    # take's posed bones are read out, the first take's first frame made the rest pose (standing, arms down, feet flat),
    # and every take keyed again relative to it: the same motion on a skeleton at rest as a person stands
    sc.frame_set(int(actions[0].frame_range[0]))
    names = [b.name for b in arm.data.bones]
    rec = []
    for act in actions:
        arm.animation_data.action = act
        f0, f1 = int(act.frame_range[0]), int(act.frame_range[1])
        frames = []
        for f in range(f0, f1 + 1):
            sc.frame_set(f)
            frames.append({n: arm.pose.bones[n].matrix.copy() for n in names})
        rec.append((act.name, f0, frames))
    arm.animation_data.action = actions[0]
    sc.frame_set(int(actions[0].frame_range[0]))
    bpy.context.view_layer.objects.active = arm
    arm.select_set(True)
    bpy.ops.object.mode_set(mode='POSE')
    bpy.ops.pose.armature_apply(selected=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    rest = {n: arm.data.bones[n].matrix_local.copy() for n in names}
    new_actions = []
    for name, f0, frames in rec:
        act = bpy.data.actions.new(name + '_rr')
        arm.animation_data.action = act
        for i, M in enumerate(frames):
            for n in names:
                b = arm.data.bones[n]
                pb = arm.pose.bones[n]
                if b.parent is None:
                    basis = rest[n].inverted() @ M[n]
                else:
                    p = b.parent.name
                    basis = (rest[p].inverted() @ rest[n]).inverted() @ (M[p].inverted() @ M[n])
                pb.rotation_mode = 'QUATERNION'
                pb.rotation_quaternion = basis.to_quaternion()
                pb.keyframe_insert('rotation_quaternion', frame=f0 + i)
                if b.parent is None or b.parent.parent is None:
                    pb.location = basis.to_translation()
                    pb.keyframe_insert('location', frame=f0 + i)
        act.use_fake_user = True
        new_actions.append(act)
    for old in actions:
        bpy.data.actions.remove(old)
    for act in new_actions:
        act.name = act.name[:-3]
    actions = new_actions
    log('rest pose re-based on the first frame (%d takes re-keyed)' % len(actions))
    # the bones renamed, and every take's curves with them
    for old, new in NAMES.items():
        b = arm.data.bones.get(old)
        if b:
            b.name = new
    def curves(act):
        if hasattr(act, 'fcurves'):
            return list(act.fcurves)
        # (Blender 4.4+: layered actions, the curves in each strip's channel bags)
        return [fc for layer in act.layers for strip in layer.strips for cb in strip.channelbags for fc in cb.fcurves]
    for act in actions:
        for fc in curves(act):
            p = fc.data_path
            if p.startswith('pose.bones["'):
                old = p.split('"')[1]
                if old in NAMES:
                    fc.data_path = p.replace('"%s"' % old, '"%s"' % NAMES[old], 1)
    arm.name = arm.data.name = 'Kimodo'
    # a stick body, each bone's own
    verts, faces, groups = [], [], []
    for bb in arm.data.bones:
        h, t = bb.head_local, bb.tail_local
        d = t - h
        L = max(d.length, 1.0)
        if d.length < 1e-4:
            continue
        u = d.normalized().orthogonal().normalized() * min(2.0, L * 0.2)
        v = d.normalized().cross(u)
        k = len(verts)
        verts += [h, h + d * 0.5 + u, h + d * 0.5 + v, h + d * 0.5 - u, h + d * 0.5 - v, t]
        faces += [(k, k + 1, k + 2), (k, k + 2, k + 3), (k, k + 3, k + 4), (k, k + 4, k + 1),
                  (k + 5, k + 2, k + 1), (k + 5, k + 3, k + 2), (k + 5, k + 4, k + 3), (k + 5, k + 1, k + 4)]
        groups.append((bb.name, range(k, k + 6)))
    me = bpy.data.meshes.new('Kimodo_Body')
    me.from_pydata([tuple(p) for p in verts], [], faces)
    body = bpy.data.objects.new('Kimodo_Body', me)
    sc.collection.objects.link(body)
    for bn, idx in groups:
        g = body.vertex_groups.new(name=bn)
        g.add(list(idx), 1.0, 'REPLACE')
    body.parent = arm
    body.modifiers.new('Armature', 'ARMATURE').object = arm
    arm.animation_data.action = actions[0]
    pel = arm.pose.bones.get('pelvis')
    log('pelvis rest at %s cm; bones mapped: %d of %d' % (tuple(round(c, 1) for c in arm.data.bones['pelvis'].head_local) if pel else '?',
                                                        sum(1 for b in arm.data.bones if b.name in NAMES.values()), len(arm.data.bones)))
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
