"""Props for Part 2's opening (the wake in the wreck): the flashlight from the glovebox, what spilled out with it, and the
clumps of snow that slide off the upturned car. Modelled in Blender (1 unit = 1 cm), written as OBJ for Unreal
(Saved/Generated/Wake_*.obj, read by Scripts/import_wake_props.py) in the project's convention: Unreal's axes, Y mirrored
for its OBJ import, faces wound for it.

Reference (study only): a classic two D-cell aluminium flashlight, 25.4 cm long, its barrel 3.97 cm across and its head
5.7 cm (the maker's published specifications); black anodised, a knurled grip, a rubber push switch on the barrel just
behind the head, a turned head with grip rings, a chrome reflector round the bulb. No badge or brand.

Each part's own frame (cm):
  Wake_Flashlight  X along it from the tail cap (X = 0) to the bezel (X = 25.4), the switch on top (+Z); materials
                   anodised, rubber, chrome, bulb
  Wake_Manual      the car's handbook lying flat, 14.8 x 21 x 0.9, its centre at the origin, cover up (+Z)
  Wake_Papers      a sheet folded in three (the registration), lying roughly flat, centred, about 10 x 21
  Wake_SnowSlab    a slab of packed snow that slides off the car's underside, about 46 x 30 x 14, centred
  Wake_SnowLump    a smaller lump that breaks off with it, about 16 across

Run: blender -b --factory-startup --python make_wake_props.py -- <out dir>"""
import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Vector, noise

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '.'
LENGTH, BARREL_R, HEAD_R = 25.4, 1.985, 2.85


def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def obj_from_bm(name, bm):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def set_mat(ob, mat):
    m = bpy.data.materials.get(mat) or bpy.data.materials.new(mat)
    ob.data.materials.clear()
    ob.data.materials.append(m)


def lathe(name, profile, mat, segs=48, cap0=True, cap1=True, inward=False):
    """A turned part about the X axis: profile is (x, r) pairs. inward: its faces turned toward the axis (a reflector's
    inside)."""
    bm = bmesh.new()
    rings = []
    for x, r in profile:
        if r <= 1e-4:
            rings.append([bm.verts.new((x, 0.0, 0.0))])
            continue
        rings.append([bm.verts.new((x, r * math.cos(2 * math.pi * i / segs), r * math.sin(2 * math.pi * i / segs))) for i in range(segs)])
    for a, b in zip(rings, rings[1:]):
        if len(a) == 1 and len(b) == 1:
            continue
        if len(a) == 1 or len(b) == 1:
            c, ring = (a[0], b) if len(a) == 1 else (b[0], a)
            for i in range(segs):
                bm.faces.new((c, ring[i], ring[(i + 1) % segs]))
            continue
        for i in range(segs):
            j = (i + 1) % segs
            bm.faces.new((a[i], a[j], b[j], b[i]))
    if cap0 and len(rings[0]) > 1:
        bm.faces.new(rings[0][::-1])
    if cap1 and len(rings[-1]) > 1:
        bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    if inward:
        # (an open surface: each face turned to face the axis and the front)
        for f in bm.faces:
            c = f.calc_center_median()
            to_axis = Vector((0.6, -c.y, -c.z)).normalized()
            if f.normal.dot(to_axis) < 0:
                f.normal_flip()
    ob = obj_from_bm(name, bm)
    set_mat(ob, mat)
    return ob


def rounded_box(name, size, bevel, mat, at=(0, 0, 0), segs=3):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2])) + Vector(at)
    ob = obj_from_bm(name, bm)
    if bevel > 0:
        m = ob.modifiers.new('bevel', 'BEVEL')
        m.width = bevel
        m.segments = segs
        m.limit_method = 'NONE'
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.modifier_apply(modifier=m.name)
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


def box_uv(ob, size=3.0):
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.cube_project(cube_size=size)
    bpy.ops.object.mode_set(mode='OBJECT')


def smooth(ob, angle=40.0):
    for p in ob.data.polygons:
        p.use_smooth = True
    try:
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle))
    except Exception:
        pass


def write_obj(ob, path):
    """Triangulated, in Unreal's axes (Y mirrored for its OBJ import, faces wound for it), cm, with materials by name and
    vertex normals (so the smooth turned surfaces stay smooth)."""
    dg = bpy.context.evaluated_depsgraph_get()
    ev = ob.evaluated_get(dg)
    me = ev.to_mesh()
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    tri = bpy.data.meshes.new(ob.name + '_tri')
    bm.to_mesh(tri)
    bm.free()
    tri.calc_loop_triangles()
    uv = tri.uv_layers.active
    mats = [m.name if m else 'default' for m in ob.data.materials] or ['default']
    with open(path, 'w') as fo:
        fo.write('# Hollow Acre: %s (tools/blender/make_wake_props.py)\no %s\n' % (ob.name, ob.name))
        for v in tri.vertices:
            fo.write('v %.4f %.4f %.4f\n' % (v.co.x, -v.co.y, v.co.z))
        k = 0
        by_mat = {}
        for p in tri.polygons:
            by_mat.setdefault(p.material_index, []).append(p)
        for mi, polys in sorted(by_mat.items()):
            fo.write('usemtl %s\n' % mats[min(mi, len(mats) - 1)])
            for p in polys:
                idx = [tri.loops[li].vertex_index + 1 for li in p.loop_indices]
                ks = []
                for li in p.loop_indices:
                    k += 1
                    n = tri.corner_normals[li].vector if hasattr(tri, 'corner_normals') else tri.loops[li].normal
                    fo.write('vn %.5f %.5f %.5f\n' % (n.x, -n.y, n.z))
                    u = uv.data[li].uv if uv else (0.0, 0.0)
                    fo.write('vt %.5f %.5f\n' % (u[0], u[1]))
                    ks.append(k)
                fo.write('f %d/%d/%d %d/%d/%d %d/%d/%d\n' % (idx[2], ks[2], ks[2], idx[1], ks[1], ks[1], idx[0], ks[0], ks[0]))
    bpy.data.meshes.remove(tri)
    ev.to_mesh_clear()
    dims = [max(v.co[i] for v in ob.data.vertices) - min(v.co[i] for v in ob.data.vertices) for i in range(3)]
    print('wake props: wrote %s (%d verts, %.2f x %.2f x %.2f cm)' % (path, len(ob.data.vertices), dims[0], dims[1], dims[2]))


def flashlight():
    # the body, tail to bezel: the tail cap (rounded, a groove where it screws on), the barrel with its knurled grip (fine
    # turned grooves), the switch housing, the flare into the head, the head's three grip rings, the bezel's lip
    p = [(0.0, 0.0), (0.0, 1.05), (0.06, 1.55), (0.22, 1.82), (0.5, 1.96), (2.85, 1.985), (2.92, 1.9), (3.12, 1.9), (3.2, 1.985),
         (4.3, 1.985)]
    x = 4.4
    while x < 14.6:
        p += [(x, 1.985), (x + 0.04, 1.935), (x + 0.16, 1.935), (x + 0.2, 1.985)]
        x += 0.2
    p += [(14.6, 1.985), (15.55, 1.985), (15.6, 2.02), (17.6, 2.02), (17.8, 2.03), (18.6, 2.18), (19.4, 2.5), (20.0, 2.78),
          (20.25, 2.85)]
    for g in (21.2, 22.0, 22.8):
        p += [(g - 0.14, 2.85), (g - 0.1, 2.77), (g + 0.1, 2.77), (g + 0.14, 2.85)]
    p += [(24.85, 2.85), (24.9, 2.875), (25.28, 2.875), (25.4, 2.8), (25.4, 2.5), (25.2, 2.44)]
    body = lathe('fl_body', p, 'anodised', segs=56, cap1=False)
    # the reflector: a chrome paraboloid from the bezel's lip down to the bulb's socket
    refl = []
    for i in range(14):
        t = i / 13.0
        r = 2.44 - (2.44 - 0.5) * t
        refl.append((25.2 - (2.6 * (1.0 - (r / 2.44) ** 2)), r))
    refl.append((22.55, 0.5))
    refl.append((22.5, 0.0))
    reflector = lathe('fl_refl', refl, 'chrome', segs=56, cap0=False, cap1=False, inward=True)
    bulb = lathe('fl_bulb', [(22.5, 0.0), (22.55, 0.32), (22.9, 0.42), (23.4, 0.38), (23.7, 0.2), (23.78, 0.0)], 'bulb', segs=24)
    # the rubber push switch on top of the barrel, just behind the head
    sw = rounded_box('fl_switch', (1.45, 0.95, 0.5), 0.22, 'rubber', at=(16.6, 0.0, 2.12))
    sw2 = rounded_box('fl_switch_rim', (1.75, 1.2, 0.18), 0.06, 'anodised', at=(16.6, 0.0, 1.98))
    ob = join('Wake_Flashlight', [body, reflector, bulb, sw, sw2])
    smooth(ob, 35.0)
    box_uv(ob, 4.0)
    return ob


def manual():
    ob = rounded_box('Wake_Manual', (14.8, 21.0, 0.9), 0.22, 'cover', segs=2)
    # (its pages: the edge between the covers a little lighter; a second slot for the paper)
    pages = rounded_box('pages', (14.2, 20.4, 0.62), 0.05, 'pages', at=(0.25, 0.0, 0.0), segs=1)
    ob = join('Wake_Manual', [ob, pages])
    box_uv(ob, 22.0)
    return ob


def papers():
    # a sheet folded in three, opening a little: three panels at slight angles, each 7 x 21 x 0.02
    bm = bmesh.new()
    zig = [(0.0, 0.0), (7.0, 0.35), (14.0, 0.05), (21.0, 0.6)]
    cols = []
    for xi in range(22):
        x = 21.0 * xi / 21.0
        # the folded z: tent-shaped panels, the paper's own sag
        seg = min(2, int(x / 7.0))
        x0, z0 = zig[seg]
        x1, z1 = zig[seg + 1]
        t = (x - x0) / 7.0
        z = z0 + (z1 - z0) * t + 0.12 * math.sin(math.pi * t)
        cols.append([bm.verts.new((x - 10.5, -5.0 + 10.0 * yi / 6.0, z)) for yi in range(7)])
    for a, b in zip(cols, cols[1:]):
        for i in range(6):
            bm.faces.new((a[i], b[i], b[i + 1], a[i + 1]))
    # (a little thickness: solidified)
    ob = obj_from_bm('Wake_Papers', bm)
    m = ob.modifiers.new('solid', 'SOLIDIFY')
    m.thickness = 0.03
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.modifier_apply(modifier=m.name)
    set_mat(ob, 'paper')
    box_uv(ob, 22.0)
    return ob


def snow(name, size, seed, rough=0.3):
    """Packed snow off a car's underside: a flattened lump, its top crusted and its broken edges lumpy."""
    random.seed(seed)
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=4, radius=1.0)
    off = Vector((random.uniform(0, 50), random.uniform(0, 50), random.uniform(0, 50)))
    for v in bm.verts:
        d = v.co.normalized()
        n = noise.noise(d * 1.6 + off) * 0.5 + noise.noise(d * 4.0 + off) * 0.22 + noise.noise(d * 9.0 + off) * 0.08
        r = 1.0 + rough * n
        v.co = Vector((d.x * size[0] * 0.5, d.y * size[1] * 0.5, d.z * size[2] * 0.5)) * r
        if v.co.z > 0:
            v.co.z *= 0.75                         # (the top pressed flat against the car)
    ob = obj_from_bm(name, bm)
    set_mat(ob, 'snow')
    smooth(ob, 60.0)
    box_uv(ob, 40.0)
    return ob


def main():
    clear()
    os.makedirs(OUT, exist_ok=True)
    made = [flashlight(), manual(), papers(), snow('Wake_SnowSlab', (46.0, 30.0, 14.0), 7), snow('Wake_SnowLump', (16.0, 14.0, 11.0), 11, 0.4)]
    for ob in made:
        write_obj(ob, os.path.join(OUT, ob.name + '.obj'))


main()
