"""The car's keys, for the ignition close-up: the Volvo's own key (a black plastic head on a steel blade) standing in the
column lock, its chrome lock collar, a split ring through the key's head, a brass house key and a worn leather tag
hanging on the ring. Modelled in Blender (1 unit = 1 cm), edges bevelled, and written as OBJ for Unreal
(Saved/Generated/Key_*.obj, read by Scripts/import_keys.py) in the project's convention: Unreal's axes, Y mirrored for
its OBJ import, faces wound for it.

Each part's own frame (cm):
  Key_Ignition  X along the key, out of the lock toward the driver (the lock's face at X = 0, the blade in it below
                X = 0); Z up the head; Y across its thickness. The ring's hole through the head at HOLE.
  Key_Lock      the collar round the keyway, its face at X = 0, reaching back into the column (-X).
  Key_Ring      hangs from its origin (where it passes through the key's hole): the ring in the YZ plane, below.
  Key_Spare     hangs from its origin (the hole in its bow): the key's flat in the XZ plane, the blade down (-Z).
  Key_Tag       hangs from its origin (its eyelet), flat in the XZ plane, down (-Z).

Run: blender -b --factory-startup --python make_keys.py -- <out dir>"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '.'
HOLE = (3.0, 0.0, 0.15)        # the ring's hole in the ignition key's head (key frame, cm)
RING_R = 1.15                    # the split ring's radius to its wire's centre


def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def obj_from_bm(name, bm):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def outline(points, z_axis_y=True):
    """A flat outline (list of (x, z)) as a filled face in the XZ plane."""
    bm = bmesh.new()
    vs = [bm.verts.new((x, 0.0, z)) for x, z in points]
    bm.faces.new(vs)
    return bm


def superellipse(cx, cz, ax, az, n=4.0, k=48, x_from=None):
    pts = []
    for i in range(k):
        t = 2 * math.pi * i / k
        c, s = math.cos(t), math.sin(t)
        x = cx + ax * math.copysign(abs(c) ** (2 / n), c)
        z = cz + az * math.copysign(abs(s) ** (2 / n), s)
        pts.append((x, z))
    return pts


def slab(name, pts, thick, bevel, mat, holes=()):
    """A flat part: the outline extruded across Y (centred), its edges bevelled, holes cut through along Y."""
    bm = outline(pts)
    bm.faces.ensure_lookup_table()
    f = bm.faces[0]
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    moved = [v for v in ext['geom'] if isinstance(v, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=moved, vec=(0.0, thick, 0.0))
    bmesh.ops.translate(bm, verts=bm.verts[:], vec=(0.0, -thick / 2, 0.0))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    ob = obj_from_bm(name, bm)
    for i, (hx, hz, hr) in enumerate(holes):
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=hr, depth=thick * 4, location=(hx, 0.0, hz), rotation=(math.pi / 2, 0, 0))
        cut = bpy.context.active_object
        cut.name = '%s_cut%d' % (name, i)
        m = ob.modifiers.new('hole%d' % i, 'BOOLEAN')
        m.operation = 'DIFFERENCE'
        m.object = cut
        m.solver = 'EXACT'
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.modifier_apply(modifier=m.name)
        bpy.data.objects.remove(cut)
    if bevel > 0:
        b = ob.modifiers.new('bevel', 'BEVEL')
        b.width = bevel
        b.segments = 3
        b.limit_method = 'ANGLE'
        b.angle_limit = math.radians(40)
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.modifier_apply(modifier=b.name)
    set_mat(ob, mat)
    return ob


def set_mat(ob, mat):
    m = bpy.data.materials.get(mat) or bpy.data.materials.new(mat)
    ob.data.materials.clear()
    ob.data.materials.append(m)


def torus(name, major, minor, mat, center=(0, 0, 0), normal_axis='X', segs=48, sides=12, offset=0.0):
    bpy.ops.mesh.primitive_torus_add(major_segments=segs, minor_segments=sides, major_radius=major, minor_radius=minor,
                                     location=center)
    ob = bpy.context.active_object
    ob.name = name
    if normal_axis == 'X':
        ob.rotation_euler = (0.0, math.pi / 2, 0.0)
    elif normal_axis == 'Y':
        ob.rotation_euler = (math.pi / 2, 0.0, 0.0)
    ob.location.x += offset if normal_axis == 'X' else 0.0
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    set_mat(ob, mat)
    return ob


def lathe(name, profile, mat, segs=40):
    """A turned part about the X axis: profile is (x, r) pairs."""
    bm = bmesh.new()
    rings = []
    for x, r in profile:
        ring = []
        for i in range(segs):
            a = 2 * math.pi * i / segs
            ring.append(bm.verts.new((x, r * math.cos(a), r * math.sin(a))))
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for i in range(segs):
            j = (i + 1) % segs
            bm.faces.new((a[i], a[j], b[j], b[i]))
    for ring, flip in ((rings[0], True), (rings[-1], False)):
        f = bm.faces.new(ring[::-1] if flip else ring)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    ob = obj_from_bm(name, bm)
    set_mat(ob, mat)
    return ob


def join(name, parts):
    bpy.ops.object.select_all(action='DESELECT')
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    ob = bpy.context.active_object
    ob.name = name
    return ob


def write_obj(ob, path):
    """Triangulated, in Unreal's axes (Y mirrored for its OBJ import, faces wound for it), cm, with materials by name."""
    dg = bpy.context.evaluated_depsgraph_get()
    ev = ob.evaluated_get(dg)
    me = ev.to_mesh()
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    uv = bm.loops.layers.uv.active
    mats = [m.name if m else 'default' for m in ob.data.materials] or ['default']
    with open(path, 'w') as fo:
        fo.write('# Hollow Acre: %s (tools/blender/make_keys.py)\no %s\n' % (ob.name, ob.name))
        for v in bm.verts:
            fo.write('v %.4f %.4f %.4f\n' % (v.co.x, -v.co.y, v.co.z))
        k = 0
        by_mat = {}
        for f in bm.faces:
            by_mat.setdefault(f.material_index, []).append(f)
        for mi, faces in sorted(by_mat.items()):
            fo.write('usemtl %s\n' % mats[min(mi, len(mats) - 1)])
            for f in faces:
                idx = [l.vert.index + 1 for l in f.loops]
                if uv:
                    uvs = []
                    for l in f.loops:
                        k += 1
                        fo.write('vt %.5f %.5f\n' % (l[uv].uv.x, l[uv].uv.y))
                        uvs.append(k)
                    fo.write('f %d/%d %d/%d %d/%d\n' % (idx[2], uvs[2], idx[1], uvs[1], idx[0], uvs[0]))
                else:
                    fo.write('f %d %d %d\n' % (idx[2], idx[1], idx[0]))
    bm.free()
    ev.to_mesh_clear()
    print('keys: wrote %s (%d verts)' % (path, len(ob.data.vertices)))


def box_uv(ob, size=3.0):
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.cube_project(cube_size=size)
    bpy.ops.object.mode_set(mode='OBJECT')


def main():
    clear()
    os.makedirs(OUT, exist_ok=True)
    made = []

    # ---- the ignition key: a black head, a little wider than long, its end rounded, a hole for the ring near the end;
    # the steel blade out of the lock up to the head (the rest of it in the lock)
    head = slab('head', superellipse(2.05, 0.15, 1.45, 1.35, n=3.2), 0.62, 0.16, 'plastic', holes=[(HOLE[0], HOLE[2], 0.24)])
    # its shoulder narrowing into the blade
    neck = slab('neck', [(0.45, -0.55), (0.9, -0.85), (0.9, 0.95), (0.45, 0.7)], 0.5, 0.08, 'plastic')
    blade = slab('blade', [(-2.6, -0.45), (0.75, -0.45), (0.75, 0.45), (-2.6, 0.2), (-2.75, -0.1)], 0.24, 0.03, 'steel')
    key = join('Key_Ignition', [head, neck, blade])
    box_uv(key)
    made.append(key)

    # ---- the lock's collar: chrome, round, its face a little domed, the keyway's dark slot in it
    lock = lathe('Key_Lock', [(-4.2, 1.5), (-0.3, 1.5), (-0.12, 1.55), (-0.02, 1.45), (0.0, 1.25), (0.0, 0.62)], 'chrome')
    slot = slab('slot', [(-0.05, -0.5), (0.03, -0.5), (0.03, 0.5), (-0.05, 0.5)], 0.3, 0.0, 'dark')
    lock = join('Key_Lock', [lock, slot])
    box_uv(lock)
    made.append(lock)

    # ---- the split ring: two turns of flat steel wire, hanging from where it passes through the key's head (origin):
    # the ring in the YZ plane below it
    r1 = torus('r1', RING_R, 0.075, 'steel', center=(0, 0, -RING_R), normal_axis='X', offset=-0.07)
    r2 = torus('r2', RING_R, 0.075, 'steel', center=(0, 0, -RING_R), normal_axis='X', offset=0.07)
    ring = join('Key_Ring', [r1, r2])
    box_uv(ring)
    made.append(ring)

    # ---- a brass house key hanging on the ring: a round bow with its hole at the top, a blade with cut teeth down
    bow = superellipse(0.0, -0.75, 1.15, 1.15, n=2.2, k=40)
    spare_bow = slab('sbow', bow, 0.2, 0.06, 'brass', holes=[(0.0, 0.0, 0.22)])
    cut = []
    z = -2.0
    for i in range(6):
        d = (0.18, 0.32, 0.12, 0.28, 0.2, 0.1)[i]
        cut += [(-0.42 - 0.0, z), (-0.42 + d, z - 0.22), (-0.42, z - 0.45)]
        z -= 0.55
    blade_pts = [(0.42, -1.6), (0.42, -5.2), (0.1, -5.6), (-0.42, -5.35)] + cut[::-1] + [(-0.42, -1.6)]
    spare_blade = slab('sblade', blade_pts, 0.2, 0.02, 'brass')
    spare = join('Key_Spare', [spare_bow, spare_blade])
    box_uv(spare)
    made.append(spare)

    # ---- a worn leather tag on a little steel eyelet
    tag = slab('tag', superellipse(0.0, -1.6, 1.25, 2.05, n=3.0), 0.28, 0.1, 'leather', holes=[(0.0, 0.0, 0.2)])
    eye = torus('eye', 0.3, 0.05, 'steel', center=(0, 0, 0), normal_axis='Y')
    tag = join('Key_Tag', [tag, eye])
    box_uv(tag)
    made.append(tag)

    for ob in made:
        write_obj(ob, os.path.join(OUT, ob.name + '.obj'))
        dims = [max(v.co[i] for v in ob.data.vertices) - min(v.co[i] for v in ob.data.vertices) for i in range(3)]
        print('keys: %s %.2f x %.2f x %.2f cm (x, y, z)' % (ob.name, dims[0], dims[1], dims[2]))


main()
