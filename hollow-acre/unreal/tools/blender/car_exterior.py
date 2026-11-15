"""The outside of the player's car, built in the same Blender session as car_interior.py (which imports and runs it).

It matches the Part 1 pixel car (2d/spr/lpc/obj/car_beaten.png): a boxy red 1980s three-box sedan with chunky silver
bumpers, rectangular headlights with a grille between them, red taillights, steel wheels with silver hubcaps, rust along
the sills and a grey primer patch on the lower passenger front door. Proportions come from side-view reference photos
of a 1980s boxy sedan (_references/, study only, never shipped; no badges or brand marks): wheelbase about 2.65 m,
length about 4.8 m, height about 1.43 m, a long flat hood, an upright glasshouse with a flat roof, a long flat trunk,
a rub strip along the side.

Car frame (cm): X forward, Y right, Z up, the driver's eye at (0, 0, 118), the car's centre line at Y = YC.
"""
import math

import bmesh
import bpy
from mathutils import Vector

YC = 37.0
W = 85.5                       # half the body width
FRONT, REAR = 249.0, -218.0     # body faces (bumpers stand off these)
AXLE_F, AXLE_R = 170.0, -95.0   # wheelbase 2.65 m
TYRE_R, ARCH_R = 31.5, 36.5
BELT = 97.0
ROOF = 147.0
WS_TOP_X = 58.0                 # top of the windshield (about 50 degrees, like the reference)
ROOF_REAR = -112.0
TRUNK_X = -150.0                # where the rear window meets the trunk


def _ext():
    import sys
    return sys.modules['__main__']   # the helpers live in car_interior.py, which Blender runs as __main__


def body_uv(bm):
    """Side panels: U along the car in metres, V metres down from the beltline (the rust texture is keyed to height)."""
    uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        n = f.normal
        ax = max(range(3), key=lambda i: abs(n[i]))
        for l in f.loops:
            p = l.vert.co
            if ax == 2:
                l[uv].uv = (p.x / 100.0, p.y / 100.0)
            elif ax == 0:
                l[uv].uv = (p.y / 100.0, 1.0 - (BELT - p.z) / 100.0)
            else:
                l[uv].uv = (p.x / 100.0, 1.0 - (BELT - p.z) / 100.0)   # Unreal flips V: keep rust at the sills


def extrude_profile(name, mat, pts_xz, y0, y1, bevel=0.0, segs=3, uv='body'):
    """A solid from a side silhouette (x, z) extruded across y0..y1."""
    ci = _ext()
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    a = [bm.verts.new((x, y0, z)) for x, z in pts_xz]
    b = [bm.verts.new((x, y1, z)) for x, z in pts_xz]
    bm.faces.new(a)
    bm.faces.new(list(reversed(b)))
    k = len(pts_xz)
    for i in range(k):
        bm.faces.new((a[i], a[(i + 1) % k], b[(i + 1) % k], b[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if uv == 'body':
        body_uv(bm)
    else:
        ci.box_uv(bm)
    bm.to_mesh(me)
    bm.free()
    obj = ci.link(bpy.data.objects.new(name, me), mat)
    return obj


def cutter(name, mat, lo, hi):
    """A box that a Boolean modifier subtracts (its faces keep `mat`, so gaps read dark)."""
    ci = _ext()
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    lo, hi = Vector(lo), Vector(hi)
    for v in bm.verts:
        v.co = Vector((lo.x + (v.co.x + 0.5) * (hi.x - lo.x), lo.y + (v.co.y + 0.5) * (hi.y - lo.y), lo.z + (v.co.z + 0.5) * (hi.z - lo.z)))
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    obj.data.materials.append(ci.material(mat))
    bpy.context.collection.objects.link(obj)
    obj['cutter'] = True
    obj.display_type = 'WIRE'
    return obj


def cyl_cutter(name, mat, c, r, length):
    ci = _ext()
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=48, radius1=r, radius2=r, depth=length)
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=__import__('mathutils').Matrix.Rotation(math.radians(90), 3, 'X'))
    bmesh.ops.translate(bm, verts=bm.verts, vec=Vector(c))
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    obj.data.materials.append(ci.material(mat))
    bpy.context.collection.objects.link(obj)
    obj['cutter'] = True
    obj.display_type = 'WIRE'
    return obj


def subtract(obj, cutters):
    for c in cutters:
        m = obj.modifiers.new('cut_' + c.name, 'BOOLEAN')
        m.operation = 'DIFFERENCE'
        m.solver = 'EXACT'
        m.object = c


def build():
    ci = _ext()
    yl, yr = YC - W, YC + W
    # ---- lower body: one solid from the side silhouette, hollowed out where the cabin is, wheel arches cut, panel gaps
    sil = [(FRONT - 2, 30), (FRONT, 88.0), (106, 94.6), (101, 96.4), (TRUNK_X + 18, BELT + 0.2), (TRUNK_X - 2, BELT + 0.4),
           (REAR + 3, BELT - 0.6), (REAR, BELT - 4), (REAR, 32), (REAR + 12, 26), (FRONT - 14, 26)]
    body = extrude_profile('body', 'bodypaint', sil, yl, yr)
    cuts = [cutter('cabin_hollow', 'gap', (TRUNK_X + 20, yl + 3.0, 22), (100, yr - 3.0, 140))]
    for ax in (AXLE_F, AXLE_R):
        cuts.append(cyl_cutter('arch', 'gap', (ax, YC, TYRE_R), ARCH_R, 2 * W + 10))
    for sgn in (-1, 1):
        y_face = YC + sgn * W
        y0, y1 = sorted((y_face - sgn * 0.6, y_face + sgn * 5))
        for x in (100.5, -20.5, TRUNK_X + 20.5):          # door seams: front edge, between the doors, rear edge
            cuts.append(cutter('seam', 'gap', (x - 0.25, y0, 30), (x + 0.25, y1, BELT + 0.1)))
        cuts.append(cutter('seam', 'gap', (TRUNK_X + 20.5, y0, 31.5), (100.5, y1, 32.0)))   # door bottoms
    cuts.append(cutter('fuel_door', 'gap', (-182, yr - 0.5, 70), (-168, yr + 5, 70.4)))
    for x0, x1, z0, z1 in ((-182, -168, 70, 80), ):
        for x in (x0, x1):
            cuts.append(cutter('fuel_door', 'gap', (x - 0.2, yr - 0.5, z0), (x + 0.2, yr + 5, z1)))
        cuts.append(cutter('fuel_door', 'gap', (x0, yr - 0.5, z1 - 0.4), (x1, yr + 5, z1)))
    for x in (TRUNK_X - 2.5, REAR + 2.5):                  # trunk lid gaps
        cuts.append(cutter('trunk_gap', 'gap', (x - 0.25, yl + 4, BELT - 3), (x + 0.25, yr - 4, BELT + 3)))
    for y in (yl + 4.0, yr - 4.0):
        cuts.append(cutter('trunk_gap', 'gap', (REAR + 2.5, y - 0.25, BELT - 3), (TRUNK_X - 2.5, y + 0.25, BELT + 3)))
    subtract(body, cuts)
    ci.finish(body, bevel=2.2, segs=3, angle=50)
    # wheel-well liners so the arches look deep and dark
    for ax in (AXLE_F, AXLE_R):
        for sgn in (-1, 1):
            c = Vector((ax, YC + sgn * (W - 14), TYRE_R))
            ci.cylinder('well', 'gap', c, Vector((0, 1, 0)), ARCH_R - 0.3, 26, segs=48, bevel=0.0)
    # ---- the glasshouse: roof, pillars, window frames, glass
    ci.box('roof', 'paint', (ROOF_REAR, YC - 61, ROOF - 4.5), (WS_TOP_X + 1.0, YC + 61, ROOF), bevel=3.5, segs=4)
    base_l, top_l = Vector((101.5, YC - 66.5, BELT)), Vector((WS_TOP_X, YC - 61.5, ROOF - 3.0))
    for sgn in (-1, 1):
        b = Vector((base_l.x, YC + sgn * 66.5, BELT))
        t = Vector((top_l.x, YC + sgn * 61.5, ROOF - 3.0))
        d = (t - b).normalized()
        out = Vector((0, sgn, 0))
        nrm = d.cross(out).normalized()
        if nrm.z < 0:
            nrm = -nrm
        # the outer skin sits fully outside the glass line, so from inside only the padded trim shows
        ci.box('a_pillar_out', 'paint', (-(t - b).length / 2 - 1, -3.6, -1.5), ((t - b).length / 2 + 1, 3.6, 1.5), bevel=1.2, segs=3,
               matrix=ci.frame((b + t) / 2 + out * 2.6 + nrm * 2.4, d, out, nrm))
        y_out = YC + sgn * (W - 2.5)
        y_in = YC + sgn * (W - 9.0)
        lo, hi = sorted((y_out, y_in))
        # B pillar (black window frame) and the wide C pillar (body colour), like the reference
        ci.prism('b_pillar', 'blackplastic', [(-17.5, BELT), (-24.5, BELT), (-25.5, ROOF - 4), (-18.5, ROOF - 4)], lo, hi, bevel=0.6)
        ci.prism('c_pillar', 'paint', [(ROOF_REAR + 8, ROOF - 3), (ROOF_REAR - 2, ROOF - 3), (TRUNK_X - 3, BELT + 0.5), (TRUNK_X + 22, BELT + 0.5)],
                 lo, hi, bevel=1.2)
        # window frames: drip rail along the roof edge, sill along the beltline
        ci.box('drip_rail', 'blackplastic', (ROOF_REAR - 2, y_out - 1.5 if sgn < 0 else y_out - 2.5, ROOF - 6.5),
               (WS_TOP_X + 1, y_out + 2.5 if sgn < 0 else y_out + 1.5, ROOF - 4.0), bevel=0.6)
        ci.box('belt_trim', 'blackplastic', (TRUNK_X + 21, min(y_out, y_out + sgn * 1.5) - 0.8, BELT - 0.5),
               (100, max(y_out, y_out + sgn * 1.5) + 0.8, BELT + 1.6), bevel=0.5)
        # side glass: rear door window everywhere, the front door window on the passenger side (the driver's door
        # already has its pane from the interior), and the small quarter glass behind the rear door
        lean = 4.0
        panes = [(-25.0, TRUNK_X + 22.0)]
        if sgn > 0:
            panes.append((99.0, -17.5))
        for xa, xb in panes:
            rows = []
            for k in range(5):
                f = k / 4
                z = BELT + 2 + (ROOF - 8 - BELT - 2) * f
                y = YC + sgn * (W - 6.0 - lean * f)
                xs = xa - (xa - WS_TOP_X - 2) * f * (1.0 if xa > 90 else 0.0)
                xe = xb + (ROOF_REAR + 6 - xb) * f * (1.0 if xb < TRUNK_X + 30 else 0.0)
                rows.append([Vector((xs + (xe - xs) * j / 9, y, z)) for j in range(10)])
            ci.grid('side_glass_out', 'extglass', rows, outward=True)
    # rear window between the C pillars
    rows = []
    for k in range(5):
        f = k / 4
        x = ROOF_REAR - 3 + (TRUNK_X + 3 - ROOF_REAR + 3) * f
        z = ROOF - 3.5 - (ROOF - 3.5 - BELT - 1.5) * f
        rows.append([Vector((x, YC + s * (58 - 2 * f), z)) for s in (-1 + 2 * j / 11 for j in range(12))])
    ci.grid('rear_window', 'extglass', rows, outward=True)
    # ---- trim: rub strips along the sides, chrome along the sills, the primer patch, door handles, mirror on the right
    for sgn in (-1, 1):
        y = YC + sgn * (W + 0.4)
        lo, hi = sorted((y - sgn * 0.8, y + sgn * 0.9))
        ci.box('rub_strip', 'blackplastic', (REAR + 6, lo, 73.0), (FRONT - 6, hi, 76.0), bevel=0.4)
        ci.box('rub_strip_chrome', 'chrome', (REAR + 6, lo + (0.6 if sgn > 0 else 0.0), 74.2), (FRONT - 6, hi - (0.0 if sgn > 0 else 0.6), 74.8), bevel=0.1)
        ci.box('sill_trim', 'blackplastic', (REAR + 14, min(y, y + sgn * 1.5) - 0.6, 24.5), (FRONT - 16, max(y, y + sgn * 1.5) + 0.6, 31.0), bevel=0.6)
        ci.box('sill_chrome', 'chrome', (REAR + 14, min(y, y + sgn * 1.5) - 0.7, 30.3), (FRONT - 16, max(y, y + sgn * 1.5) + 0.7, 31.0), bevel=0.1)
        for x in (12.0, -98.0):
            ci.box('door_handle', 'chrome', (x - 7.5, min(y, y + sgn * 1.4) - 0.5, 83.5), (x + 7.5, max(y, y + sgn * 1.4) + 0.5, 86.0), bevel=0.5)
    y = YC + W + 0.25
    ci.box('primer_patch', 'primer', (35, y - 0.3, 33), (97, y + 0.35, 63), bevel=0.3)    # the pixel car's grey door patch
    gn = Vector((-1.0, -0.25, 0.0)).normalized()
    gu = Vector((0, 0, 1)).cross(gn).normalized()
    ci.prism('mirror_sail_r', 'blackplastic', [(84, 98.5), (98, 98.5), (98, 110.0)], YC + W - 14.5, YC + W - 0.2, bevel=0.5)
    a, b = Vector((91.0, YC + W - 0.5, 102.5)), Vector((88.5, YC + W + 5.0, 104.0))
    ci.cylinder('mirror_arm_r', 'blackplastic', (a + b) / 2, b - a, 1.3, (b - a).length + 1.0, segs=16, bevel=0.3)
    m = ci.frame(Vector((88.0, YC + W + 12.0, 104.5)), gn, gu, Vector((0, 0, 1)))
    ci.box('mirror_housing_r', 'blackplastic', (-1.0, -8.5, -5.6), (5.5, 8.5, 5.6), bevel=2.0, segs=4, matrix=m)
    ci.box('mirror_glass_r', 'mirror', (-1.25, -7.6, -4.7), (-1.0, 7.6, 4.7), bevel=0.0, matrix=m)
    # ---- bumpers (chunky silver bars with a black rubber strip), lights, grille, plate recess
    for x0, x1, sgn in ((FRONT - 1, FRONT + 13, 1), (REAR - 13, REAR + 1, -1)):
        ci.box('bumper', 'bumper', (x0, YC - W - 1.5, 27.0), (x1, YC + W + 1.5, 45.0), bevel=4.0, segs=4)
        xf = x1 if sgn > 0 else x0
        ci.box('bumper_strip', 'rubber', (xf - 1.2 if sgn > 0 else xf - 0.6, YC - W + 6, 34.5), (xf + 0.6 if sgn > 0 else xf + 1.2, YC + W - 6, 38.5), bevel=0.5)
    for sgn in (-1, 1):
        cy = YC + sgn * 61.0
        ci.box('headlight_bezel', 'chrome', (FRONT - 1.0, cy - 16.5, 59.0), (FRONT + 1.4, cy + 16.5, 77.0), bevel=1.0)
        ci.box('headlight', 'headlamp', (FRONT + 1.0, cy - 15.0, 60.5), (FRONT + 2.0, cy + 15.0, 75.5), bevel=0.8)
        ci.box('indicator', 'amberlens', (FRONT - 1.0, cy + sgn * 16.0 - 4.0, 59.5), (FRONT + 1.6, cy + sgn * 16.0 + 4.0, 76.0), bevel=0.8)
        ci.box('taillight', 'taillamp', (REAR - 1.8, YC + sgn * 60.0 - 21.0, 60.0), (REAR + 1.0, YC + sgn * 60.0 + 21.0, 80.0), bevel=1.2)
        ci.box('taillight_amber', 'amberlens', (REAR - 1.9, YC + sgn * 60.0 + (12.0 if sgn > 0 else -21.0), 60.5), (REAR - 1.7, YC + sgn * 60.0 + (21.0 if sgn > 0 else -12.0), 79.5), bevel=0.3)
    ci.box('grille_surround', 'chrome', (FRONT - 1.0, YC - 43.5, 57.5), (FRONT + 1.6, YC + 43.5, 78.5), bevel=1.2)
    ci.box('grille', 'grille', (FRONT + 0.6, YC - 41.5, 59.0), (FRONT + 1.9, YC + 41.5, 77.0), bevel=0.4)
    for k in range(6):
        ci.box('grille_bar', 'chrome', (FRONT + 1.6, YC - 41.0, 60.5 + k * 2.9), (FRONT + 2.4, YC + 41.0, 61.1 + k * 2.9), bevel=0.15)
    ci.box('plate_recess', 'gap', (REAR - 0.6, YC - 26, 48.5), (REAR + 0.4, YC + 26, 59.0), bevel=0.3)
    ci.cylinder('exhaust', 'steelwheel', Vector((REAR - 2, YC + 55, 22)), Vector((1, 0, 0)), 2.6, 18.0, segs=20, bevel=0.3)
    # ---- wheels: tyre (lathed rounded profile), black steel rim, silver hubcap with a dark centre
    prof = [(20.5, -9.2), (25, -9.9), (29.5, -9.6), (31.5, -7.0), (31.5, 7.0), (29.5, 9.6), (25, 9.9), (20.5, 9.2)]
    for ax in (AXLE_F, AXLE_R):
        for sgn in (-1, 1):
            c = Vector((ax, YC + sgn * (W - 11.0), TYRE_R))
            me = bpy.data.meshes.new('tyre')
            bm = bmesh.new()
            rings = []
            segs = 48
            for i in range(segs):
                a_ = 2 * math.pi * i / segs
                rings.append([bm.verts.new(c + Vector((math.cos(a_) * r, w, math.sin(a_) * r))) for r, w in prof])
            for i in range(segs):
                for j in range(len(prof) - 1):
                    bm.faces.new((rings[i][j], rings[(i + 1) % segs][j], rings[(i + 1) % segs][j + 1], rings[i][j + 1]))
            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
            ci.box_uv(bm, 10.0)
            bm.to_mesh(me)
            bm.free()
            ci.finish(ci.link(bpy.data.objects.new('tyre', me), 'tyre'))
            out = Vector((0, sgn, 0))
            ci.cylinder('rim', 'steelwheel', c + out * 4.5, out, 20.8, 9.0, segs=48, bevel=0.6)
            ci.cylinder('hubcap', 'chrome', c + out * 9.6, out, 17.5, 1.6, segs=48, bevel=0.7)
            ci.cylinder('hubcap_centre', 'steelwheel', c + out * 10.6, out, 4.5, 1.0, segs=24, bevel=0.3)
            for k in range(8):
                a_ = 2 * math.pi * k / 8
                p = c + out * 10.5 + Vector((math.cos(a_) * 11.0, 0, math.sin(a_) * 11.0))
                ci.cylinder('hubcap_vent', 'steelwheel', p, out, 2.0, 0.6, segs=12, bevel=0.1)
