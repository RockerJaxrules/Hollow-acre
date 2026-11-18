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
  Wake_Buckle      the seatbelt's buckle on its stalk, the red release button on +Z (X from the stalk to the slot)
  Wake_Latch       the belt's latch plate: the tongue into the buckle along +X, the cover behind it
  Wake_Strap       10 cm of the belt's webbing along X, 4.8 wide
  Wake_Pebble0..3  crumbs of the side windows' tempered glass, about 1 cm (scaled down to 6-9 mm as they lie)
  Wake_Cassette    a compact cassette out of the tape deck, 10 x 6.3 x 1.2, label up (+Z); shell, label, window
  Wake_Coin        a coin, 2.4 across, its axis along X; coin
  Wake_Pen         a ballpoint, 14 long along X; barrel, metal

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


def buckle():
    """The seatbelt's buckle (a common car receiver, about 7.5 x 3.5 x 2.8 cm): a black plastic body on a short stiff
    stalk from the seat's side, the tongue's slot at its top end, the red release button on its face by the slot.
    X from the stalk (0) to the slot (7.5); the button on +Z."""
    body = rounded_box('bk_body', (7.5, 3.5, 2.8), 0.45, 'plastic', at=(3.75, 0.0, 0.0), segs=3)
    slot = rounded_box('bk_slot', (0.6, 2.4, 0.5), 0.1, 'dark', at=(7.32, 0.0, 0.0), segs=1)
    btn = rounded_box('bk_button', (2.0, 2.3, 0.45), 0.18, 'button', at=(6.0, 0.0, 1.45), segs=2)
    stalk = rounded_box('bk_stalk', (9.0, 2.6, 1.1), 0.35, 'plastic', at=(-4.3, 0.0, 0.0), segs=2)
    ob = join('Wake_Buckle', [body, slot, btn, stalk])
    smooth(ob, 40.0)
    box_uv(ob, 6.0)
    return ob


def latch():
    """The belt's latch plate: the steel tongue (X 0 to 3, into the buckle along +X) and its plastic cover with the slot the
    webbing loops through (X -4.5 to 0)."""
    tongue = rounded_box('lt_tongue', (3.0, 2.2, 0.25), 0.08, 'steel', at=(1.5, 0.0, 0.0), segs=2)
    cover = rounded_box('lt_cover', (4.5, 5.0, 1.0), 0.35, 'plastic', at=(-2.25, 0.0, 0.0), segs=3)
    ob = join('Wake_Latch', [tongue, cover])
    smooth(ob, 40.0)
    box_uv(ob, 5.0)
    return ob


def strap():
    """One length of seatbelt webbing, 10 cm along X (from X 0), 4.8 cm wide, 1.6 mm thick, its edges rounded: laid end to
    end along the belt's path."""
    ob = rounded_box('Wake_Strap', (10.0, 4.8, 0.16), 0.06, 'webbing', at=(5.0, 0.0, 0.0), segs=1)
    box_uv(ob, 4.8)
    return ob


def pebble(name, seed):
    """A crumb of tempered side glass (it breaks into small rough cubes, about 6-9 mm, edges chipped): a cube, its corners
    pushed about a little, every edge rounded."""
    random.seed(seed)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * random.uniform(0.75, 1.15), v.co.y * random.uniform(0.75, 1.15), v.co.z * random.uniform(0.5, 0.75)))
        v.co += Vector((random.uniform(-0.08, 0.08), random.uniform(-0.08, 0.08), random.uniform(-0.05, 0.05)))
    ob = obj_from_bm(name, bm)
    m = ob.modifiers.new('bevel', 'BEVEL')
    m.width = 0.09
    m.segments = 2
    m.limit_method = 'NONE'
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.modifier_apply(modifier=m.name)
    set_mat(ob, 'glass')
    box_uv(ob, 1.0)
    return ob


def cassette():
    """A compact cassette fallen out of the dash's tape deck: 10.0 x 6.3 x 1.2 cm, a smoky shell, a pale paper label on its
    face (+Z) with the two reel windows through it, the tape across its open edge. X along its length."""
    shell = rounded_box('Wake_Cassette', (10.0, 6.3, 1.2), 0.12, 'shell', segs=2)
    label = rounded_box('cs_label', (8.4, 4.2, 0.04), 0.0, 'label', at=(0.0, 0.55, 0.62), segs=1)
    win = rounded_box('cs_window', (4.6, 1.15, 0.05), 0.0, 'window', at=(0.0, 0.35, 0.66), segs=1)
    tape = rounded_box('cs_tape', (6.2, 0.15, 0.62), 0.0, 'window', at=(0.0, -3.08, 0.0), segs=1)
    ob = join('Wake_Cassette', [shell, label, win, tape])
    box_uv(ob, 10.0)
    return ob


def coin():
    """A coin from the ashtray: 2.4 cm across, 0.18 thick, its milled edge; X along its axis (lying, the axis is the up)."""
    p = [(0.0, 0.0), (0.0, 1.12), (0.02, 1.2), (0.16, 1.2), (0.18, 1.12), (0.18, 0.0)]
    ob = lathe('Wake_Coin', p, 'coin', segs=40)
    box_uv(ob, 2.4)
    return ob


def pen():
    """A ballpoint from the door pocket: 14 cm, 0.9 across, a black barrel, a metal tip and clip end. X along it."""
    p = [(0.0, 0.0), (0.0, 0.32), (0.25, 0.42), (0.6, 0.45), (13.0, 0.45), (13.6, 0.3), (14.0, 0.06), (14.05, 0.0)]
    body = lathe('Wake_Pen', p, 'barrel', segs=20)
    clip = rounded_box('pn_clip', (4.2, 0.35, 0.12), 0.04, 'metal', at=(2.4, 0.0, 0.5), segs=1)
    ob = join('Wake_Pen', [body, clip])
    box_uv(ob, 4.0)
    return ob


def stove():
    """A cast-iron pot-belly stove, as the 1890s camp stoves were made (the Chicago and Cannon patterns, from catalogue
    plates and surviving stoves): a short ash-pit base on four curved legs, the swelling belly with nickel trim rings at
    its waist and collar, a domed top with a cooking lid, a fuel door with a mica window on the belly's front, and the
    stovepipe rising from the top. About 115 cm to the top of the collar; the belly 52 cm across. Turned about X, then
    stood up (Z up); its front (the door) toward +X; its origin on the floor at its middle."""
    import mathutils
    belly = [(12.0, 0.0), (12.0, 22.0), (13.5, 23.5), (16.0, 24.0), (28.0, 24.0), (29.0, 25.0), (31.0, 25.0), (32.0, 23.0),
             (36.0, 23.5), (45.0, 25.5), (55.0, 26.0), (65.0, 25.0), (74.0, 22.5), (80.0, 20.5), (82.0, 21.5), (84.0, 21.5),
             (85.0, 20.0), (92.0, 19.0), (98.0, 16.0), (102.0, 12.0), (104.0, 9.5), (106.0, 9.0), (115.0, 8.6), (115.0, 0.0)]
    body = lathe('st_body', belly, 'castiron', segs=40)
    trim = lathe('st_trim', [(28.5, 25.4), (31.5, 25.4), (31.6, 0.0)], 'nickel', segs=40, cap0=False)
    trim2 = lathe('st_trim2', [(81.5, 21.9), (84.5, 21.9), (84.6, 0.0)], 'nickel', segs=40, cap0=False)
    pipe = lathe('st_pipe', [(115.0, 7.6), (260.0, 7.6), (260.0, 0.0)], 'pipe', segs=24, cap0=False)
    parts = [body, trim, trim2, pipe]
    # (the lathe turns about X: stand it up, X to Z)
    rot = mathutils.Matrix.Rotation(math.radians(-90.0), 4, 'Y')
    for ob in parts:
        ob.data.transform(rot)
    # four curved legs
    for k in range(4):
        a = math.radians(45.0 + 90.0 * k)
        leg = rounded_box('st_leg%d' % k, (5.0, 4.0, 14.0), 1.2, 'castiron', at=(0.0, 0.0, 0.0))
        # (splayed out from the base: tipped 14 degrees outward, turned to its corner, its foot on the floor)
        leg.data.transform(mathutils.Matrix.Translation((math.cos(a) * 19.0, math.sin(a) * 19.0, 6.6)) @
                           mathutils.Matrix.Rotation(a, 4, 'Z') @ mathutils.Matrix.Rotation(math.radians(14.0), 4, 'Y'))
        parts.append(leg)
    # the fuel door on the belly's front: a curved iron panel, its mica window (glowing when the fire is lit), hinge, latch
    door = rounded_box('st_door', (2.2, 22.0, 20.0), 0.8, 'castiron', at=(25.6, 0.0, 52.0))
    mica = rounded_box('st_mica', (0.6, 9.0, 7.0), 0.2, 'glow', at=(26.8, 0.0, 54.0))
    hinge = rounded_box('st_hinge', (2.0, 2.0, 16.0), 0.5, 'nickel', at=(26.0, -11.5, 52.0))
    latch = rounded_box('st_latch', (3.0, 5.0, 1.6), 0.5, 'nickel', at=(27.2, 9.0, 52.0))
    ash = rounded_box('st_ashdoor', (1.6, 16.0, 7.0), 0.5, 'castiron', at=(24.4, 0.0, 19.0))
    lid = lathe('st_lid', [(0.0, 0.0), (0.0, 9.5), (1.4, 9.5), (1.4, 0.0)], 'castiron', segs=28)
    lid.data.transform(mathutils.Matrix.Translation((0.0, 0.0, 99.0)) @ mathutils.Matrix.Rotation(math.radians(-90.0), 4, 'Y'))
    parts += [door, mica, hinge, latch, ash, lid]
    ob = join('Wake_Stove', parts)
    smooth(ob, 40.0)
    box_uv(ob, 30.0)
    return ob


def matchbox():
    """A box of safety matches (5.3 x 3.6 x 1.6 cm), its striker strips on the sides; a slot for the label."""
    ob = rounded_box('Wake_Matchbox', (5.3, 3.6, 1.6), 0.08, 'label', segs=1)
    s1 = rounded_box('mb_strike1', (5.0, 0.05, 1.3), 0.01, 'striker', at=(0.0, 1.81, 0.0), segs=1)
    s2 = rounded_box('mb_strike2', (5.0, 0.05, 1.3), 0.01, 'striker', at=(0.0, -1.81, 0.0), segs=1)
    ob = join('Wake_Matchbox', [ob, s1, s2])
    box_uv(ob, 6.0)
    return ob


def main():
    clear()
    os.makedirs(OUT, exist_ok=True)
    made = [flashlight(), manual(), papers(), snow('Wake_SnowSlab', (46.0, 30.0, 14.0), 7), snow('Wake_SnowLump', (16.0, 14.0, 11.0), 11, 0.4),
            buckle(), latch(), strap(), cassette(), coin(), pen(), stove(), matchbox()] + [pebble('Wake_Pebble%d' % i, 31 + i) for i in range(4)]
    for ob in made:
        write_obj(ob, os.path.join(OUT, ob.name + '.obj'))


main()
