"""The player's car, driver's view, modelled in Blender with real modelling tools (bevels, weighted normals, padded
shapes) and exported for Unreal. Style reference (study only, never shipped): a 1980s boxy sedan dashboard
(_references/1993_Volvo_240_Classic_dashboard_(US).jpg): flat-topped boxy dash, rectangular instrument hood, big
centre speedometer with smaller dials, clock pod, radio over two rectangular vents, wood strip across the dash, square
end vents, glovebox, a console with rocker switches, a four-spoke wheel with a big padded centre, a wide rear-view
mirror. No badges or brand marks. The red hood and the cracked windshield match the Part 1 pixel car.

Run:  blender -b --factory-startup --python hollow-acre/unreal/tools/blender/car_interior.py -- <Saved/Generated folder>
Writes Car.obj (opaque parts) and Car_Glass.obj (windshield, side glass) in the same convention as make_car.py:
Unreal car frame in cm (X forward, Y right, Z up; driver's eye at 0,0,118), Y mirrored and winding reversed because
Unreal reads OBJ with Y mirrored. Normals are written from Blender (weighted normals), so bevels shade correctly.
"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '.'
EYE = Vector((0.0, 0.0, 118.0))
YC = 37.0                     # the car's centre line (the driver sits left of it)
DOOR_Y, PASS_Y = -35.0, 109.0
WHEEL_C = Vector((55.0, 0.0, 86.0))
WHEEL_TILT = math.radians(25)

GLASS = {'windshield', 'sideglass', 'extglass', 'lamplens'}

# ---------------- helpers ----------------
def material(name):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    return m


def link(obj, mat):
    obj.data.materials.append(material(mat))
    bpy.context.collection.objects.link(obj)
    return obj


def box_uv(bm, size=20.0, top=None):
    """Box-project UVs in centimetres (detail textures tile every `size` cm); top=(x0, x1, y0, y1) maps the top face 0-1."""
    uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        n = f.normal
        ax = max(range(3), key=lambda i: abs(n[i]))
        for l in f.loops:
            p = l.vert.co
            if top and ax == 2:
                x0, x1, y0, y1 = top
                l[uv].uv = ((p.y - y0) / (y1 - y0), (p.x - x0) / (x1 - x0))
            elif ax == 0:
                l[uv].uv = (p.y / size, p.z / size)
            elif ax == 1:
                l[uv].uv = (p.x / size, p.z / size)
            else:
                l[uv].uv = (p.x / size, p.y / size)


def finish(obj, bevel=0.0, segs=3, subsurf=0, angle=40):
    if bevel > 0:
        m = obj.modifiers.new('bevel', 'BEVEL')
        m.width = bevel
        m.segments = segs
        m.limit_method = 'ANGLE'
        m.angle_limit = math.radians(angle)
        m.harden_normals = False
    if subsurf:
        s = obj.modifiers.new('subsurf', 'SUBSURF')
        s.levels = subsurf
        s.render_levels = subsurf
    for p in obj.data.polygons:
        p.use_smooth = True
    w = obj.modifiers.new('wn', 'WEIGHTED_NORMAL')
    w.keep_sharp = True
    return obj


def box(name, mat, lo, hi, bevel=0.5, segs=3, matrix=None, top_uv=False, subsurf=0):
    """An axis-aligned box from corner lo to corner hi (cm), optionally transformed, with bevelled edges."""
    lo, hi = Vector(lo), Vector(hi)
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((lo.x + (v.co.x + 0.5) * (hi.x - lo.x), lo.y + (v.co.y + 0.5) * (hi.y - lo.y), lo.z + (v.co.z + 0.5) * (hi.z - lo.z)))
    if matrix:
        bmesh.ops.transform(bm, matrix=matrix, verts=bm.verts)
    bm.normal_update()
    box_uv(bm, top=(lo.x, hi.x, lo.y, hi.y) if top_uv else None)
    bm.to_mesh(me)
    bm.free()
    obj = link(bpy.data.objects.new(name, me), mat)
    return finish(obj, bevel=min(bevel, 0.49 * min(hi - lo)) if bevel else 0, segs=segs, subsurf=subsurf)


def frame(c, u, v, n):
    """Matrix taking local (x along u, y along v, z along n) to the world, origin c."""
    return Matrix(((u.x, v.x, n.x, c.x), (u.y, v.y, n.y, c.y), (u.z, v.z, n.z, c.z), (0, 0, 0, 1)))


def cylinder(name, mat, c, axis, r, length, segs=32, bevel=0.2):
    axis = axis.normalized()
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r, radius2=r, depth=length)
    u = axis.orthogonal().normalized()
    v = axis.cross(u)
    bmesh.ops.transform(bm, matrix=frame(c, u, v, axis), verts=bm.verts)
    bm.normal_update()
    box_uv(bm)
    bm.to_mesh(me)
    bm.free()
    return finish(link(bpy.data.objects.new(name, me), mat), bevel=bevel, segs=2)


def disc(name, mat, c, n, up, r, uv_c, uv_r, segs=64):
    """A flat dial face facing n, its texture circle at uv_c with radii uv_r (atlas UVs)."""
    n = n.normalized()
    upv = (up - n * up.dot(n)).normalized()
    side = upv.cross(n)          # the driver's left on a face that looks at the driver
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    uv = bm.loops.layers.uv.verify()
    centre = bm.verts.new(c)
    ring = [bm.verts.new(c + side * math.cos(2 * math.pi * i / segs) * r + upv * math.sin(2 * math.pi * i / segs) * r) for i in range(segs)]
    for i in range(segs):
        f = bm.faces.new((centre, ring[i], ring[(i + 1) % segs]))
        for l in f.loops:
            if l.vert is centre:
                l[uv].uv = uv_c
            else:
                k = ring.index(l.vert)
                a = 2 * math.pi * k / segs
                l[uv].uv = (uv_c[0] - math.cos(a) * uv_r[0], uv_c[1] + math.sin(a) * uv_r[1])
    bm.normal_update()
    bm.faces.ensure_lookup_table()
    if bm.faces[0].normal.dot(EYE - c) < 0:
        bmesh.ops.reverse_faces(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    obj = link(bpy.data.objects.new(name, me), mat)
    for p in obj.data.polygons:
        p.use_smooth = False
    return obj


def torus(name, mat, c, u, v, n, R, r_u, r_n, segs=72, rsegs=18):
    """A ring in the (u, v) plane; its cross-section is r_u across and r_n deep (toward n)."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    rows = []
    for i in range(segs):
        a = 2 * math.pi * i / segs
        d = u * math.cos(a) + v * math.sin(a)
        rows.append([bm.verts.new(c + d * (R + r_u * math.cos(2 * math.pi * j / rsegs)) + n * (r_n * math.sin(2 * math.pi * j / rsegs)))
                     for j in range(rsegs)])
    for i in range(segs):
        for j in range(rsegs):
            a, b = rows[i][j], rows[(i + 1) % segs][j]
            cc, d = rows[(i + 1) % segs][(j + 1) % rsegs], rows[i][(j + 1) % rsegs]
            bm.faces.new((a, b, cc, d))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    box_uv(bm, 8.0)
    bm.to_mesh(me)
    bm.free()
    return finish(link(bpy.data.objects.new(name, me), mat))


def prism(name, mat, pts_xz, y0, y1, bevel=0.4):
    """A flat shape in the x-z plane (list of (x, z)) extruded across y0..y1 (door mirror sail, wedges)."""
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
    box_uv(bm)
    bm.to_mesh(me)
    bm.free()
    return finish(link(bpy.data.objects.new(name, me), mat), bevel=bevel, segs=2)


def grid(name, mat, rows, flat=False, outward=False):
    """A surface through rows of points (list of lists of Vectors); UV 0-1 across (columns) and down (rows)."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    uv = bm.loops.layers.uv.verify()
    R, M = len(rows), len(rows[0])
    vs = [[bm.verts.new(p) for p in row] for row in rows]
    for r in range(R - 1):
        for c in range(M - 1):
            f = bm.faces.new((vs[r][c], vs[r + 1][c], vs[r + 1][c + 1], vs[r][c + 1]))
            for l, (rr, cc) in zip(f.loops, ((r, c), (r + 1, c), (r + 1, c + 1), (r, c + 1))):
                l[uv].uv = (cc / (M - 1), rr / (R - 1))
    bm.normal_update()
    centre = sum((p for row in rows for p in row), Vector()) / (R * M)
    bm.faces.ensure_lookup_table()
    if (bm.faces[0].normal.dot(EYE - centre) < 0) != outward:   # face the driver, or away from the car (outer glass)
        bmesh.ops.reverse_faces(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    obj = link(bpy.data.objects.new(name, me), mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj


# ---------------- the dashboard (reference: a flat-topped 1980s dash) ----------------
def dashboard():
    box('dash_top', 'dash', (74, DOOR_Y, 86), (100, PASS_Y, 97.2), bevel=1.6, segs=4)             # deep flat top
    box('fascia', 'dash', (71.5, 21, 80.5), (75, PASS_Y - 2, 95.5), bevel=0.8)                     # centre + passenger face
    box('fascia_left', 'dash', (71.5, DOOR_Y + 1, 80.5), (75, -19.5, 95.5), bevel=0.8)              # left of the cluster
    # instrument hood: a rectangular visor over the cluster, with side cheeks, a little proud of the dash top
    box('cluster_hood', 'dash', (63.5, -20.5, 95.4), (76, 21.5, 99.6), bevel=1.2, segs=4)
    for y0, y1 in ((-20.5, -18.3), (19.3, 21.5)):
        box('cluster_cheek', 'dash', (64.5, y0, 82.5), (75, y1, 99), bevel=0.6)
    box('cluster_sill', 'dash', (64.5, -20.5, 81.0), (75, 21.5, 83.0), bevel=0.6)
    box('cluster_panel', 'cluster', (74.0, -18.3, 83.0), (75.0, 19.3, 95.4), bevel=0.2)
    # dials: big centre speedometer, tachometer left, small fuel/temperature right (atlas halves), chrome rings
    n = Vector((-1.0, 0.0, 0.0))   # parallel to the cluster panel (tilted dials were half buried in it)
    for cy, cz, r, uvc, needle in ((2.0, 89.4, 5.4, (0.25, 0.5), 225 - 270 * 22 / 140), (-11.5, 89.0, 4.0, (0.75, 0.5), 225 - 270 * 1.8 / 8),
                                    (14.3, 89.0, 3.3, None, None)):
        c = Vector((73.6, cy, cz))
        if uvc:
            disc('dial', 'gauges', c, n, Vector((0, 0, 1)), r, uvc, (0.24, 0.48))
        else:
            disc('dial_small', 'cluster', c, n, Vector((0, 0, 1)), r, (0.5, 0.5), (0.0, 0.0))
        torus('dial_ring', 'chrome', c - n * 0.15, Vector((0, 1, 0)), n.cross(Vector((0, 1, 0))).normalized() * -1, n, r + 0.25, 0.22, 0.22,
              segs=48, rsegs=8)
        if needle is not None:
            a = math.radians(needle)
            u = Vector((0, 1, 0))
            w = n.cross(u).normalized() * -1
            d = (u * math.cos(a) + w * math.sin(a)).normalized()
            p0 = c - n * 0.35
            mid = p0 + d * r * 0.42
            m = frame(mid, d, d.cross(n).normalized(), n)
            box('needle', 'needle', (-r * 0.46, -0.11, -0.08), (r * 0.42, 0.11, 0.08), bevel=0.05, matrix=m)
            cylinder('needle_cap', 'dash', p0 - n * 0.15, n, 0.6, 0.4, segs=16, bevel=0.1)
    # clock pod, radio over two vents, glovebox, wood strip, end vents
    box('clock_pod', 'dash', (70.5, 22.0, 85.5), (72.0, 31.5, 95.0), bevel=0.6)
    c = Vector((70.3, 26.75, 90.2))
    disc('clock_face', 'clockface', c, Vector((-1, 0, 0)), Vector((0, 0, 1)), 3.5, (0.5, 0.5), (0.48, 0.48))
    torus('clock_ring', 'chrome', c + Vector((0.15, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1)), Vector((-1, 0, 0)), 3.7, 0.25, 0.25, segs=48, rsegs=8)
    box('radio', 'radio', (70.4, 33.0, 89.3), (71.6, 52.0, 94.6), bevel=0.4)
    box('radio_display', 'display', (70.2, 38.5, 91.4), (70.4, 46.5, 92.6), bevel=0.05)
    for y in (34.6, 50.4):
        cylinder('radio_knob', 'knob', Vector((69.6, y, 91.9)), Vector((-1, 0, 0)), 0.9, 1.6, segs=24, bevel=0.2)
    for k in range(4):
        box('radio_button', 'knob', (70.0, 38.8 + k * 2.0, 89.8), (70.5, 40.2 + k * 2.0, 90.8), bevel=0.15)
    for y0 in (33.0, 43.0):
        box('vent_frame', 'vent', (70.6, y0, 82.3), (71.6, y0 + 9.0, 88.3), bevel=0.4)
        for k in range(5):
            box('vent_slat', 'dash', (70.2, y0 + 0.5, 83.0 + k * 1.15), (71.0, y0 + 8.5, 83.35 + k * 1.15), bevel=0.08)
    box('glovebox', 'dash', (70.9, 60.0, 82.0), (71.8, 99.0, 92.0), bevel=0.5)
    cylinder('glovebox_lock', 'chrome', Vector((70.6, 79.5, 87.0)), Vector((-1, 0, 0)), 1.1, 0.8, segs=24, bevel=0.15)
    box('wood_strip', 'wood', (70.4, DOOR_Y + 1, 78.4), (73.0, PASS_Y - 2, 80.6), bevel=0.5)
    for y0 in (DOOR_Y + 2.5, PASS_Y - 11.5):
        box('end_vent', 'vent', (70.8, y0, 82.5), (71.8, y0 + 8.0, 90.5), bevel=0.4)
        for k in range(4):
            box('end_vent_fin', 'dash', (70.4, y0 + 0.8 + k * 2.0, 83.0), (71.2, y0 + 1.1 + k * 2.0, 90.0), bevel=0.08)
    # lower dash and the console with a row of rocker switches and the heater panel
    box('lower_dash', 'dash', (75, DOOR_Y, 52), (96, PASS_Y, 78.6), bevel=1.2)
    box('console', 'dash', (66.5, 24.5, 44), (75.5, 49.5, 78.4), bevel=1.0)
    for k in range(6):
        mat = 'hazard' if k == 3 else 'switch'
        box('rocker', mat, (65.6, 26.6 + k * 3.6, 71.5), (66.8, 28.9 + k * 3.6, 75.5), bevel=0.25)
    box('heater_panel', 'radio', (65.9, 27.0, 59.5), (66.7, 47.0, 66.5), bevel=0.3)
    for y in (30.0, 44.0):
        cylinder('heater_knob', 'knob', Vector((65.2, y, 63.0)), Vector((-1, 0, 0)), 1.2, 1.4, segs=24, bevel=0.2)
    box('heater_slider', 'chrome', (65.5, 34.0, 62.6), (65.9, 40.0, 63.4), bevel=0.1)


# ---------------- the steering wheel: four spokes and a big padded centre ----------------
def steering_wheel():
    c = WHEEL_C
    n = Vector((-math.cos(WHEEL_TILT), 0, math.sin(WHEEL_TILT)))     # faces the driver
    u = Vector((0, 1, 0))
    v = n.cross(u)
    if v.z < 0:
        v = -v
    R = 19.0
    torus('rim', 'leather', c, u, v, n, R, 1.75, 2.05)
    # the pad: a pillowy rounded square, a little below the centre
    m = frame(c - n * 2.6 - v * 1.2, u, v, n)
    box('pad', 'hub', (-8.4, -7.0, -2.6), (8.4, 7.0, 2.6), bevel=2.4, segs=6, matrix=m)
    # spokes: two to the sides (slightly drooping) and two down to the lower rim, each a bevelled bar into the rim
    for ang, w in ((-6.0, 3.6), (186.0, 3.6), (243.0, 3.0), (297.0, 3.0)):
        a = math.radians(ang)
        d = u * math.cos(a) + v * math.sin(a)
        side = n.cross(d).normalized()
        mid = c - n * 2.2 - v * 1.2 + d * 13.0
        box('spoke', 'hub', (-6.5, -w / 2, -1.0), (6.5, w / 2, 1.0), bevel=0.7, segs=3, matrix=frame(mid, d, side, n))
    # column shroud into the lower dash, with the indicator (left) and wiper (right) stalks
    col_u, col_v = u, v
    m = frame(c - n * 15.0 - v * 1.5, col_u, col_v, n)
    box('column', 'dash', (-5.0, -4.6, -12.0), (5.0, 4.6, 12.0), bevel=1.8, segs=4, matrix=m)
    for side, drop in ((-1, 0.0), (1, 0.8)):
        base = c - n * 8.0 + u * side * 5.0 - v * (1.5 + drop)
        tip = base + u * side * 11.0 - v * 2.0 + n * 1.0
        cylinder('stalk', 'dash', (base + tip) / 2, tip - base, 0.55, (tip - base).length, segs=16, bevel=0.1)
        cylinder('stalk_tip', 'dash', tip, tip - base, 0.85, 3.0, segs=16, bevel=0.3)


# ---------------- the cabin: pillars, headliner, visors, mirror, door, the door mirror ----------------
def windshield_edges():
    base, top = [], []
    for i in range(25):
        s = -1 + 2 * i / 24
        base.append(Vector((100 + 5 * (1 - s * s), YC + 66 * s, 96.8)))
        top.append(Vector((40 + 3 * (1 - s * s), YC + 58 * s, 134.5)))   # raked like the car (car_exterior WS_TOP_X/Z)
    return base, top


def cabin():
    base, top = windshield_edges()
    rows = [[t + (b - t) * k / 11 for t, b in zip(top, base)] for k in range(12)]
    grid('windshield', 'windshield', rows)
    grid('windshield_out', 'extglass', [[p + Vector((0.45, 0, 0.35)) for p in row] for row in rows], outward=True)
    # A pillars: thick padded trims along both edges of the glass, a header trim along the top
    for i, sgn in ((0, -1), (-1, 1)):
        b, t = base[i], top[i]
        d = (t - b).normalized()
        out = Vector((0, sgn, 0))
        nrm = d.cross(out).normalized()
        if nrm.dot(EYE - (b + t) / 2) < 0:
            nrm = -nrm
        mid = (b + t) / 2 + out * 1.5 + nrm * 1.2
        box('a_pillar', 'trim', (-(t - b).length / 2 - 2, -4.2, -2.2), ((t - b).length / 2 + 2, 4.2, 2.2), bevel=1.8, segs=4,
            matrix=frame(mid, d, out, nrm))
    box('header', 'trim', (36, YC - 60, 132.6), (45, YC + 60, 136.4), bevel=1.5, segs=4)
    box('headliner', 'headliner', (-84, DOOR_Y + 6, 135.6), (41, PASS_Y - 6, 137.4), bevel=1.5)   # inside the roof
    for y0, y1 in ((-28, 4), (70, 102)):
        box('visor', 'headliner', (24, y0, 132.2), (37, y1, 134.6), bevel=1.0, segs=4)
    # rear-view mirror: wide rectangle on a stem from the header, angled toward the driver
    m = frame(Vector((34.0, YC, 126.0)), Vector((math.cos(math.radians(-10)), math.sin(math.radians(-10)), 0)),
              Vector((-math.sin(math.radians(-10)), math.cos(math.radians(-10)), 0)), Vector((0, 0, 1)))
    box('rearview', 'blackplastic', (-1.6, -13.5, -3.4), (1.6, 13.5, 3.4), bevel=1.0, segs=4, matrix=m)
    box('rearview_glass', 'mirror', (-1.75, -12.6, -2.6), (-1.6, 12.6, 2.6), bevel=0.0, matrix=m)
    cylinder('rearview_stem', 'blackplastic', Vector((36.0, YC, 131.0)), Vector((0.15, 0, 1)), 0.9, 8.0, segs=16)
    # driver's door: panel, armrest, pull handle, window crank, window sill
    box('door_panel', 'door', (-70, DOOR_Y - 3.0, 46), (97, DOOR_Y - 0.8, 96.5), bevel=1.2)
    box('armrest', 'door', (-42, DOOR_Y - 1.0, 66), (22, DOOR_Y + 6.0, 72.5), bevel=1.6, segs=4)
    box('pull_handle', 'blackplastic', (-12, DOOR_Y - 1.0, 74), (12, DOOR_Y + 3.2, 77), bevel=1.0, segs=3)
    cylinder('crank_boss', 'chrome', Vector((30, DOOR_Y + 0.2, 80)), Vector((0, 1, 0)), 1.5, 1.4, segs=24, bevel=0.2)
    box('crank_arm', 'chrome', (29.2, DOOR_Y + 0.9, 74.5), (30.8, DOOR_Y + 1.8, 80.5), bevel=0.3)
    cylinder('crank_knob', 'blackplastic', Vector((30, DOOR_Y + 3.0, 75.2)), Vector((0, 1, 0)), 1.0, 3.0, segs=16, bevel=0.3)
    box('door_sill', 'blackplastic', (-70, DOOR_Y - 9.5, 95.5), (97, DOOR_Y + 0.5, 99.0), bevel=1.2)
    # (the door mirrors are modelled as their own part in car_parts.py)
    # side glass in the driver's door, between the inner and outer skins
    rows = []
    for k in range(6):
        z = 99.5 + (133.5 - 99.5) * k / 5
        f = k / 5
        xa = base[0].x - 2 + (top[0].x + 2 - base[0].x) * f
        rows.append([Vector((x, YC - (76.5 - 9.5 * (z - 99.0) / 35.0), z)) for x in (xa + (-21 - xa) * j / 9 for j in range(10))])   # leans in like the body
    grid('side_glass', 'sideglass', rows)
    grid('side_glass_outer', 'extglass', [[p + Vector((0, -0.6, 0)) for p in row] for row in rows], outward=True)


# ---------------- outside, seen through the windshield: the pixel car's red hood, cowl, wipers ----------------
def outside_front():
    box('cowl', 'cowl', (98, YC - 66, 94.5), (106, YC + 66, 97.0), bevel=0.6)
    for k in range(16):
        y = YC - 60 + k * 8
        box('cowl_slot', 'rubber', (100, y, 96.9), (104.5, y + 5.5, 97.15), bevel=0.0)
    # (the hood itself is part of the body shell in car_exterior.py: crowned, with two creases)
    # wipers parked along the bottom of the glass, attached at their pivots in the cowl
    for piv_y, length in ((YC - 18, 52.0), (YC + 34, 50.0)):
        a = Vector((103.5, piv_y, 97.0))
        b = Vector((101.0, piv_y - length, 97.6))
        cylinder('wiper_pivot', 'rubber', a, Vector((0, 0, 1)), 1.4, 1.6, segs=16)
        cylinder('wiper_arm', 'rubber', (a + b) / 2, b - a, 0.55, (b - a).length, segs=12, bevel=0.1)
        bl0 = b + Vector((-1.5, 2.0, 0.3))
        bl1 = bl0 + Vector((0, (piv_y - b.y) * 0.9, 0))
        cylinder('wiper_blade', 'rubber', (bl0 + bl1) / 2, bl1 - bl0, 0.7, (bl1 - bl0).length, segs=12, bevel=0.2)


# ---------------- export (same OBJ convention as make_car.py) ----------------
def export(path, keep):
    deps = bpy.context.evaluated_depsgraph_get()
    groups = {}
    for obj in bpy.context.scene.objects:
        if obj.type != 'MESH' or obj.get('cutter'):
            continue
        ev = obj.evaluated_get(deps)
        me = ev.to_mesh()
        me.calc_loop_triangles()
        # normals first, then copy the UVs: computing normals reallocates mesh data and leaves earlier references stale
        try:
            normals = [cn.vector.copy() for cn in me.corner_normals]
        except AttributeError:
            me.calc_normals_split()
            normals = [l.normal.copy() for l in me.loops]
        uvl = [tuple(d.uv) for d in me.uv_layers.active.data] if me.uv_layers.active else None
        mw = obj.matrix_world
        nm = mw.to_3x3().inverted().transposed()
        for tri in me.loop_triangles:
            mats = me.materials   # the evaluated mesh: Boolean cuts add their own (gap) material
            mat = mats[tri.material_index].name if tri.material_index < len(mats) and mats[tri.material_index] else 'dash'
            if (mat in GLASS) != keep:
                continue
            g = groups.setdefault(mat, [])
            corners = []
            for li in tri.loops:
                p = mw @ me.vertices[me.loops[li].vertex_index].co
                nrm = (nm @ normals[li]).normalized()
                uv = uvl[li] if uvl else (0.0, 0.0)
                corners.append((p, nrm, uv))
            g.append(corners)
        ev.to_mesh_clear()
    with open(path, 'w', newline='\n') as fh:
        fh.write('# generated by hollow-acre/unreal/tools/blender/car_interior.py\n')
        vi = 0
        for mat, tris in groups.items():
            fh.write(f'usemtl {mat}\n')
            for corners in tris:
                for p, n, uv in corners:
                    fh.write(f'v {p.x:.3f} {-p.y:.3f} {p.z:.3f}\nvn {n.x:.4f} {-n.y:.4f} {n.z:.4f}\nvt {uv[0]:.4f} {uv[1]:.4f}\n')
                a, b, c = vi + 1, vi + 2, vi + 3
                fh.write(f'f {c}/{c}/{c} {b}/{b}/{b} {a}/{a}/{a}\n')   # reversed: Unreal mirrors Y
                vi += 3
    return {m: len(t) for m, t in groups.items()}


if __name__ == '__main__':
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import car_exterior
    dashboard()
    steering_wheel()
    cabin()
    outside_front()
    car_exterior.build()
    opaque = export(os.path.join(OUT, 'Car.obj'), keep=False)
    glass = export(os.path.join(OUT, 'Car_Glass.obj'), keep=True)
    print('car_interior: opaque %d tris in %d materials %s; glass %s' % (sum(opaque.values()), len(opaque), sorted(opaque), glass))
