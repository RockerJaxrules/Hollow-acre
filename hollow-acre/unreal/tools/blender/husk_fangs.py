"""The husk's fangs, fitted to its MetaHuman face (Saved/Generated/Husk/face.fbx): its own teeth show (yellowed), and
over each of its four canines a long fang, its root sunk in the gum: the upper pair hanging down past the lower lip,
the lower pair standing up. Built in the face's own bind-pose space, so the game hangs each pair on its teeth bone
(FACIAL_C_TeethUpper / FACIAL_C_TeethLower) unchanged.
Writes Saved/Generated/Husk/FangsUpper.fbx and FangsLower.fbx (static meshes, metres).
Run: blender -b --factory-startup --python husk_fangs.py -- <Saved/Generated/Husk>
"""
import math
import os
import random
import sys

import bpy
from mathutils import Vector

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
GEN = os.path.abspath(ARGS[0] if ARGS else '.')


def log(*a):
    print('fangs:', *a)


def load_face():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=os.path.join(GEN, 'face.fbx'), automatic_bone_orientation=True)
    arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
    meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    face = next(o for o in meshes if o.name.endswith('LOD0'))
    for o in meshes:
        if o is not face:
            bpy.data.objects.remove(o)
    for o in (face, arm):
        bpy.ops.object.select_all(action='DESELECT')
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
    for o in (arm, face):
        bpy.ops.object.select_all(action='DESELECT')
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return arm, face


def teeth_rows(face):
    me = face.data
    slot = next(i for i, m in enumerate(me.materials) if m and 'Teeth' in m.name)
    gi = {g.name: g.index for g in face.vertex_groups}
    up, lo = gi.get('FACIAL_C_TeethUpper'), gi.get('FACIAL_C_TeethLower')
    verts = set()
    for p in me.polygons:
        if p.material_index == slot:
            verts.update(p.vertices)
    rows = {'upper': [], 'lower': []}
    for vi in verts:
        v = me.vertices[vi]
        w = {g.group: g.weight for g in v.groups}
        rows['upper' if w.get(up, 0) >= w.get(lo, 0) else 'lower'].append(v.co.copy())
    log('teeth vertices', {k: len(v) for k, v in rows.items()})
    return rows


def arc(points, upper):
    """The front of a row of teeth: per angle around its middle, the outermost point, and its gum line."""
    c = sum(points, Vector()) / len(points)
    bins = {}
    for p in points:
        d = p - c
        a = math.degrees(math.atan2(d.x, -d.y))          # 0 = straight ahead (-Y), + to its left
        if abs(a) > 58:                                   # within the mouth: none jutting out past its corners
            continue
        k = int(round(a / 8.0))
        r = math.hypot(d.x, d.y)
        if k not in bins or r > bins[k][0]:
            bins[k] = (r, p)
    gum = max(p.z for p in points) if upper else min(p.z for p in points)
    edge = min(p.z for p in points) if upper else max(p.z for p in points)
    out = []
    for k in sorted(bins):
        r, p = bins[k]
        out.append((k * 8.0, Vector((p.x, p.y, gum)), Vector((p.x, p.y, edge))))
    return c, out


def fangs(name, rows, upper, seed):
    rnd = random.Random(seed)
    c, pts = arc(rows, upper)
    objs = []
    for a, root, edge in pts:
        if abs(abs(a) - 32) >= 7:                          # the canines only
            continue
        length = rnd.uniform(0.038, 0.042) if upper else rnd.uniform(0.028, 0.031)
        rad = 0.0055 if upper else 0.0048
        down = -1 if upper else 1
        out = Vector((root.x - c.x, root.y - c.y, 0)).normalized()
        d = Vector((0, 0, down)) + out * 0.1 + Vector((rnd.uniform(-0.04, 0.04), rnd.uniform(-0.03, 0.03), 0))
        d.normalize()
        start = root - Vector((0, 0, down)) * 0.002 + out * 0.0005          # its root just in the gum (deeper shows through the lip)
        bpy.ops.mesh.primitive_cone_add(vertices=10, radius1=rad, radius2=rad * 0.08, depth=length, location=start + d * length * 0.5)
        o = bpy.context.active_object
        o.rotation_mode = 'QUATERNION'
        o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d)
        o.scale = (1.0, 0.75, 1.0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        objs.append(o)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    o = objs[0]
    o.name = name
    m = bpy.data.materials.new('Fang')
    o.data.materials.clear()
    o.data.materials.append(m)
    o.data.uv_layers.new(name='UVMap') if not o.data.uv_layers else None
    log(name, len(objs), 'fangs')
    return o


def export(o, path):
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.export_scene.fbx(filepath=path, use_selection=True, object_types={'MESH'}, apply_scale_options='FBX_SCALE_ALL',
                             mesh_smooth_type='FACE', axis_forward='-Z', axis_up='Y')
    log('wrote', path)


if __name__ == '__main__':
    arm, face = load_face()
    rows = teeth_rows(face)
    up = fangs('FangsUpper', rows['upper'], True, 3)
    lo = fangs('FangsLower', rows['lower'], False, 4)
    export(up, os.path.join(GEN, 'FangsUpper.fbx'))
    export(lo, os.path.join(GEN, 'FangsLower.fbx'))
