"""The 190E (W201-type) cockpit, part by part, from the reference photo of a real 1985 W201 dash
(_references/w201_interior/, study only; mirrored for left-hand drive) and the measured reference model.

Parts: the padded dash with its roll and end vents; the cluster binnacle (three round dials under one glass, the
warning-light strip, two small knobs); the centre vents with a thumbwheel; the glovebox lid with its lock and pull; the
centre stack (climate strip, three climate knobs, a cassette radio, a pocket); the console with a wood panel, window
switches, the hazard switch and the gear lever in its boot; the four-spoke wheel with the big pad; the column with the
stalk and the ignition with the key in it; the light switch; the driver's door card. No badges or brand marks.

Car frame (cm): X forward, Y right, Z up, the driver's eye at (0, 0, 118); the car's centre line at Y = YC.
"""
import math

import bmesh
import bpy
from mathutils import Matrix, Vector

import car_exterior as ce

YC = 37.0
Y0, Y1 = -35.5, 109.5               # door to door at the dash
WHEEL_C = Vector((55.0, 0.0, 86.0))
WHEEL_TILT = math.radians(25)


def _ci():
    import sys
    return sys.modules['__main__']


# ---------------- small helpers ----------------
def rbox(name, mat, lo, hi, r=0.6, segs=3, matrix=None):
    return _ci().box(name, mat, lo, hi, bevel=r, segs=segs, matrix=matrix)


def cutbox(name, mat, lo, hi):
    return ce.cutter(name, mat, lo, hi)


def slats(name, x, y0, y1, z0, z1, n, mat='dash', thick=0.35, depth=1.6, vertical=False):
    """Vent louvres inside an opening at depth x."""
    for k in range(n):
        if vertical:
            y = y0 + (y1 - y0) * (k + 0.5) / n
            rbox(name, mat, (x, y - thick / 2, z0 + 0.3), (x + depth, y + thick / 2, z1 - 0.3), r=0.12, segs=2)
        else:
            z = z0 + (z1 - z0) * (k + 0.5) / n
            rbox(name, mat, (x, y0 + 0.3, z - thick / 2), (x + depth, y1 - 0.3, z + thick / 2), r=0.12, segs=2)


def decal(name, mat, x, y0, y1, z0, z1, lean=0.0, nu=8, nv=4):
    """A printed flat panel facing the driver, UV 0-1 left to right and bottom to top (its texture reads upright)."""
    rows = []
    for k in range(nv + 1):
        z = z0 + (z1 - z0) * k / nv
        rows.append([Vector((x + lean * (z1 - z) / max(1e-6, z1 - z0), y0 + (y1 - y0) * j / nu, z)) for j in range(nu + 1)])
    return _ci().grid(name, mat, rows)


def lathe(name, mat, c, axis, prof, segs=48):
    """A solid of revolution: prof = [(radius, along-axis offset)]."""
    ci = _ci()
    axis = axis.normalized()
    u = axis.orthogonal().normalized()
    v = axis.cross(u)
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    rings = []
    for i in range(segs):
        a = 2 * math.pi * i / segs
        d = u * math.cos(a) + v * math.sin(a)
        rings.append([bm.verts.new(c + d * r + axis * w) for r, w in prof])
    for i in range(segs):
        for j in range(len(prof) - 1):
            bm.faces.new((rings[i][j], rings[(i + 1) % segs][j], rings[(i + 1) % segs][j + 1], rings[i][j + 1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ci.box_uv(bm, 6.0)
    bm.to_mesh(me)
    bm.free()
    return ci.finish(ci.link(bpy.data.objects.new(name, me), mat))


# ---------------- the dash body ----------------
def dash_profile(y):
    """The dash's cross-section (x, z) at y: windshield base, padded top, the roll, the face, the lower lip, back to the
    firewall. The cluster binnacle and centre stack are separate parts."""
    return [(101.5, 96.2), (97.0, 97.3), (90.0, 97.7), (84.0, 97.6), (80.6, 97.0), (78.8, 95.9), (77.7, 94.4), (77.2, 92.5),
            (76.8, 88.0), (76.5, 83.0), (76.5, 80.6), (77.2, 79.2), (78.8, 78.3), (84.0, 76.8), (92.0, 74.0), (101.5, 70.0)]


def dash_body():
    rings = []
    n = 60
    for i in range(n + 1):
        y = Y0 + (Y1 - Y0) * i / n
        rings.append([(Vector((x, y, z)), z) for x, z in dash_profile(y)])
    obj = ce.loft('dash_body', rings, ['dash', 'dashtop'], face_mat=lambda infos, c: 1 if c.z > 96.3 and c.x > 79.5 else 0,
                  uv_fn=lambda co, inf, k, cap: (co.y / 20.0, (co.x + co.z) / 20.0))
    for p in obj.data.polygons:
        p.use_smooth = True
    cuts = []
    # the cluster recess (the binnacle sits over it)
    cuts.append(cutbox('cluster_recess', 'cluster', (74.0, -20.8, 82.4), (84.6, 21.8, 96.8)))
    # centre vents, end vents
    for ya, yb in ((24.2, 35.4), (38.6, 49.8)):
        cuts.append(cutbox('vent_open', 'vent', (74.0, ya, 86.2), (80.5, yb, 92.8)))
    cuts.append(cutbox('vent_open', 'vent', (74.0, Y0 + 1.6, 85.8), (80.5, Y0 + 10.0, 92.6)))
    cuts.append(cutbox('vent_open', 'vent', (74.0, Y1 - 10.0, 85.8), (80.5, Y1 - 1.6, 92.6)))
    # glovebox shut line (a groove round the lid) and the pull recess
    gy0, gy1, gz0, gz1 = 53.5, 97.5, 79.6, 91.6
    for lo, hi in (((75.0, gy0, gz1 - 0.25), (77.8, gy1, gz1 + 0.25)), ((75.0, gy0, gz0 - 0.25), (77.8, gy1, gz0 + 0.25)),
                   ((75.0, gy0 - 0.25, gz0), (77.8, gy0 + 0.25, gz1)), ((75.0, gy1 - 0.25, gz0), (77.8, gy1 + 0.25, gz1))):
        cuts.append(cutbox('glovebox_gap', 'gap', lo, hi))
    cuts.append(cutbox('glovebox_pull', 'cluster', (75.0, 86.5, 88.2), (78.6, 95.5, 90.9)))
    ce.subtract(obj, cuts)
    _ci().finish(obj, bevel=0.35, segs=2, angle=40)
    # louvres in the vents, the centre thumbwheel
    for ya, yb in ((24.2, 35.4), (38.6, 49.8)):
        slats('vent_louvre', 77.0, ya, yb, 86.2, 92.8, 6, thick=0.4, depth=1.8)
        rbox('vent_vane', 'dash', (78.2, (ya + yb) / 2 - 0.25, 86.4), (79.6, (ya + yb) / 2 + 0.25, 92.6), r=0.1, segs=2)
    _ci().cylinder('vent_wheel', 'knob', Vector((76.9, YC, 89.5)), Vector((0, 1, 0)), 1.4, 2.4, segs=24, bevel=0.15)
    for k in range(12):                                   # knurled edge
        a = 2 * math.pi * k / 12
        p = Vector((76.9 - 1.42 * math.cos(a), YC, 89.5 + 1.42 * math.sin(a)))
        rbox('vent_wheel_rib', 'knob', (p.x - 0.12, YC - 1.1, p.z - 0.12), (p.x + 0.12, YC + 1.1, p.z + 0.12), r=0.05, segs=1)
    for ya, yb in ((Y0 + 1.6, Y0 + 10.0), (Y1 - 10.0, Y1 - 1.6)):
        slats('end_louvre', 77.4, ya, yb, 85.8, 92.6, 5, thick=0.4, depth=1.6, vertical=True)
    # glovebox lock and pull
    _ci().cylinder('glovebox_lock', 'chrome', Vector((76.4, 62.0, 88.6)), Vector((-1, 0, 0)), 1.05, 0.9, segs=24, bevel=0.2)
    _ci().cylinder('glovebox_key_slot', 'gap', Vector((75.9, 62.0, 88.6)), Vector((-1, 0, 0)), 0.32, 0.2, segs=8, bevel=0.0)
    rbox('glovebox_pull_lever', 'blackplastic', (77.6, 87.2, 88.6), (78.5, 94.8, 90.5), r=0.3)
    # the padded top's seam where it meets the face (a small raised welt)
    _ci().cylinder('dash_welt', 'dashtop', Vector((79.4, YC + 25, 96.6)), Vector((0, 1, 0)), 0.35, Y1 - Y0 - 52, segs=8, bevel=0.0)
    return obj


# ---------------- the cluster ----------------
DIALS = [(-12.8, 89.0, 5.0, (1 / 6, 0.5)), (0.5, 89.4, 6.6, (3 / 6, 0.5)), (13.8, 89.0, 5.0, (5 / 6, 0.5))]


def cluster():
    """The binnacle: a hood over a recessed black panel holding three dials (fuel/temperature, speedometer,
    tachometer) under one curved glass, with the warning-light strip and two small knobs below."""
    ci = _ci()
    # hood: a shell whose front lip overhangs the recess
    rings = []
    for i in range(25):
        y = -22.2 + 45.0 * i / 24
        edge = min(1.0, (y + 22.2) / 2.5, (22.8 - y) / 2.5)          # round the hood's ends down
        lift = 2.2 * edge
        prof = [(86.5, 97.4), (83.0, 97.6 + lift * 0.8), (79.0, 97.5 + lift), (76.2, 97.0 + lift * 0.9), (75.4, 96.0 + lift * 0.7),
                (75.6, 95.2 + lift * 0.5), (77.5, 95.6 + lift * 0.6), (82.0, 96.2 + lift * 0.4), (86.5, 96.4)]
        rings.append([(Vector((x, y, z)), None) for x, z in prof])
    ci.finish(ce.loft('cluster_hood', rings, ['dashtop'], uv_fn=lambda co, inf, k, cap: (co.y / 20.0, (co.x + co.z) / 20.0)))
    # the dials: faces from the atlas, thin black bezels, orange needles with caps
    n = Vector((-1.0, 0.0, 0.0))
    readings = (0.6, 35.0 / 220.0, 0.27)     # fuel/temp combo needle, 35 km/h on the 0-220 scale, revs
    for (cy, cz, r, uvc), frac in zip(DIALS, readings):
        c = Vector((84.4, cy, cz))
        ci.disc('dial', 'gauges', c, n, Vector((0, 0, 1)), r, uvc, (0.16, 0.48))
        ci.torus('dial_bezel', 'blackplastic', c - n * 0.25, Vector((0, 1, 0)), Vector((0, 0, 1)), n, r + 0.35, 0.35, 0.45, segs=56, rsegs=8)
        a = math.radians(225 - 270 * frac)
        d = Vector((0, math.cos(a), math.sin(a)))        # the driver sees +y to the right; 225 deg = lower left
        p0 = c - n * 0.45
        m = ci.frame(p0 + d * r * 0.38, d, d.cross(n).normalized(), n)
        ci.box('needle', 'needle', (-r * 0.5, -0.13, -0.07), (r * 0.48, 0.13, 0.07), bevel=0.05, matrix=m)
        ci.cylinder('needle_cap', 'blackplastic', p0 - n * 0.2, n, 0.75, 0.5, segs=16, bevel=0.15)
    # warning-light strip and the two small knobs (trip reset, brightness)
    decal('warning_strip', 'warnstrip', 84.2, -18.5, 19.5, 83.2, 84.9, nu=16, nv=1)
    for y in (-4.5, 6.0):
        ci.cylinder('cluster_knob', 'knob', Vector((83.6, y, 84.05)), Vector((-1, 0, 0)), 0.6, 1.2, segs=16, bevel=0.15)
    # one curved glass over everything
    rows = []
    for k in range(9):
        z = 83.0 + 13.2 * k / 8
        rows.append([Vector((80.6 + 0.9 * (1 - (2 * j / 20 - 1) ** 2) - 0.25 * (k / 8), -20.4 + 41.8 * j / 20, z)) for j in range(21)])
    ci.grid('cluster_glass', 'lamplens', rows)


# ---------------- centre stack and console ----------------
def centre_stack():
    ci = _ci()
    # the housing, from under the vents down to the console, its face leaning back a little at the bottom
    y0, y1 = 24.6, 49.4
    rings = []
    for i in range(13):
        z = 57.0 + (86.2 - 57.0) * i / 12
        xf = 76.4 + (86.2 - z) * 0.06
        prof = [(xf, y0), (xf, y1), (xf + 14.0, y1), (xf + 14.0, y0)]
        rings.append([(Vector((x, y, z)), None) for x, y in prof])
    stack = ce.loft('centre_stack', rings, ['dash'], uv_fn=lambda co, inf, k, cap: (co.y / 20.0, co.z / 20.0))
    cuts = [cutbox('radio_slot', 'cluster', (70.0, 28.0, 65.6), (77.8, 46.0, 71.6)),
            cutbox('stack_pocket', 'cluster', (70.0, 28.4, 58.6), (80.5, 45.6, 63.8))]
    ce.subtract(stack, cuts)
    ci.finish(stack, bevel=0.6, segs=3, angle=40)

    def xf(z):
        return 76.4 + (86.2 - z) * 0.06

    # climate strip: printed panel with the fan scale and buttons
    decal('climate_strip', 'climatestrip', xf(84.0) - 0.08, 26.2, 47.8, 82.3, 85.6, nu=16, nv=2)
    for k in range(3):
        rbox('climate_button', 'switch', (xf(84) - 0.9, 41.2 + k * 2.1, 82.8), (xf(84) - 0.3, 42.8 + k * 2.1, 83.8), r=0.18, segs=2)
    # three climate knobs with printed scales round them
    for k, y in enumerate((29.8, 37.0, 44.2)):
        c = Vector((xf(77.6) - 0.05, y, 77.6))
        ci.disc('climate_scale', 'climate', c, Vector((-1, 0, 0)), Vector((0, 0, 1)), 3.3, (1 / 6 + k / 3, 0.5), (0.15, 0.45))
        lathe('climate_knob', 'knob', c, Vector((-1, 0, 0)), [(0.01, 0.0), (2.3, 0.0), (2.35, 0.4), (2.0, 0.6), (1.9, 2.0), (1.7, 2.3), (0.01, 2.35)])
        for j in range(18):                               # grip ribs
            a = 2 * math.pi * j / 18
            p = c + Vector((-1.4, math.cos(a) * 1.92, math.sin(a) * 1.92))
            rbox('knob_rib', 'knob', (p.x - 0.65, p.y - 0.09, p.z - 0.09), (p.x + 0.65, p.y + 0.09, p.z + 0.09), r=0.04, segs=1)
        tip = c + Vector((-2.36, 0, 0)) + Vector((0, math.sin(math.radians(30 * (k - 1))), math.cos(math.radians(30 * (k - 1))))) * 1.3
        ci.cylinder('knob_marker', 'climate_mark', tip, Vector((-1, 0, 0)), 0.22, 0.1, segs=8, bevel=0.0)
    # cassette radio in its slot
    rbox('radio_body', 'radio', (76.7, 28.3, 65.9), (77.7, 45.7, 71.3), r=0.25, segs=2)
    decal('radio_face', 'radiofront', 76.65, 30.8, 43.2, 66.2, 71.0, nu=12, nv=3)
    for y in (29.6, 44.4):
        lathe('radio_knob', 'knob', Vector((76.5, y, 68.6)), Vector((-1, 0, 0)), [(0.01, 0), (1.05, 0), (1.05, 1.3), (0.9, 1.5), (0.01, 1.55)], segs=24)
    for k in range(5):
        rbox('radio_button', 'switch', (75.9, 32.8 + k * 1.9, 66.3), (76.7, 34.2 + k * 1.9, 67.3), r=0.15, segs=2)
    # ignition with the key in it, right of the column; light switch left of it
    c = Vector((76.4, 13.5, 78.0))
    lathe('ignition_ring', 'chrome', c, Vector((-1, 0, 0)), [(1.4, 0.0), (1.6, 0.2), (1.5, 0.6), (1.05, 0.7), (1.0, 0.0)], segs=32)
    lathe('ignition_barrel', 'chrome', c + Vector((-0.3, 0, 0)), Vector((-1, 0, 0)), [(0.01, 0), (1.0, 0), (1.0, 0.4), (0.01, 0.45)], segs=24)
    key = ci.frame(c + Vector((-2.4, 0, -0.4)), Vector((-1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1)))
    rbox('key_blade', 'chrome', (-2.0, -0.35, -0.08), (0.6, 0.35, 0.08), r=0.05, segs=1, matrix=key)
    rbox('key_head', 'blackplastic', (-4.4, -1.4, -0.35), (-1.8, 1.4, 0.35), r=0.3, segs=2, matrix=key)
    ci.torus('key_ring', 'chrome', c + Vector((-6.6, 0, -1.6)), Vector((0, 1, 0)), Vector((-1, 0, 0)).cross(Vector((0, 1, 0))), Vector((0, 0, 1)) * -1,
             1.1, 0.12, 0.12, segs=24, rsegs=6)
    c = Vector((76.8, -27.0, 81.0))
    lathe('light_switch_ring', 'blackplastic', c, Vector((-1, 0, 0)), [(2.6, 0), (2.7, 0.3), (2.3, 0.5), (2.2, 0.0)], segs=40)
    lathe('light_switch', 'knob', c, Vector((-1, 0, 0)), [(0.01, 0), (2.0, 0), (2.0, 1.2), (1.7, 1.6), (0.01, 1.7)], segs=40)
    rbox('light_switch_grip', 'knob', (c.x - 2.2, c.y - 0.45, c.z - 1.7), (c.x - 1.4, c.y + 0.45, c.z + 1.7), r=0.3, segs=2)


def console():
    ci = _ci()
    # the tunnel cover from the stack back between the seats, a wood panel on top
    rbox('console_body', 'dash', (18.0, 25.2, 34.0), (76.0, 48.8, 47.0), r=2.2, segs=4)
    rbox('console_wood', 'wood', (28.0, 26.6, 46.6), (66.0, 47.4, 47.6), r=0.5, segs=2)
    # window switches (two pairs), the red hazard switch, the ashtray lid
    for k, y in enumerate((29.0, 31.6, 42.4, 45.0)):
        rbox('window_switch', 'switch', (54.0, y - 0.9, 47.5), (58.0, y + 0.9, 48.6), r=0.3, segs=2)
    rbox('hazard_switch', 'hazard', (59.5, 34.6, 47.5), (62.5, 39.4, 48.9), r=0.4, segs=2)
    rbox('ashtray_lid', 'chrome', (62.8, 28.0, 47.5), (65.6, 46.0, 48.1), r=0.3, segs=2)
    # the gear lever: a leather boot in folds, a chrome-ringed shaft, a round black knob
    c = Vector((44.0, YC, 47.6))
    lathe('gear_boot', 'leather', c, Vector((0, 0, 1)),
          [(6.0, 0.0), (5.6, 0.8), (5.9, 1.4), (4.7, 2.3), (5.0, 2.9), (3.6, 3.9), (3.9, 4.5), (2.5, 5.6), (2.7, 6.1), (1.5, 7.1), (1.2, 7.6), (0.9, 8.0)], segs=36)
    ci.cylinder('gear_shaft', 'chrome', c + Vector((0, 0, 11.0)), Vector((0.12, 0, 1)), 0.6, 7.0, segs=16, bevel=0.1)
    lathe('gear_knob', 'knob', c + Vector((0.9, 0, 14.0)), Vector((0.12, 0, 1)), [(0.01, -0.3), (1.5, 0.0), (2.2, 1.2), (2.3, 2.4), (1.9, 3.6), (0.01, 4.0)], segs=32)


# ---------------- the steering wheel ----------------
def steering_wheel():
    ci = _ci()
    c = WHEEL_C
    n = Vector((-math.cos(WHEEL_TILT), 0, math.sin(WHEEL_TILT)))     # faces the driver
    u = Vector((0, 1, 0))
    v = n.cross(u)
    if v.z < 0:
        v = -v
    R = 19.0
    # rim: a slightly oval tube, with finger ridges round its inner edge
    me = bpy.data.meshes.new('rim')
    bm = bmesh.new()
    segs, rs = 144, 16
    rows = []
    for i in range(segs):
        a = 2 * math.pi * i / segs
        d = u * math.cos(a) + v * math.sin(a)
        ring = []
        for j in range(rs):
            b = 2 * math.pi * j / rs
            inner = max(0.0, -math.cos(b))                       # the side facing the wheel's centre
            ridge = 0.22 * inner ** 2 * (0.5 + 0.5 * math.cos(segs / 4 * a))
            ring.append(bm.verts.new(c + d * (R + (1.75 + ridge) * math.cos(b)) + n * (2.05 * math.sin(b))))
        rows.append(ring)
    for i in range(segs):
        for j in range(rs):
            bm.faces.new((rows[i][j], rows[(i + 1) % segs][j], rows[(i + 1) % segs][(j + 1) % rs], rows[i][(j + 1) % rs]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ci.box_uv(bm, 4.0)
    bm.to_mesh(me)
    bm.free()
    ci.finish(ci.link(bpy.data.objects.new('rim', me), 'leather'))
    # the pad: a big rounded trapezoid, domed, with a seam round it
    import car_parts as cp
    rings = []
    for w, k_ in ((-3.4, 0.86), (-2.6, 0.97), (-1.0, 1.0), (0.6, 0.99), (1.6, 0.95), (2.2, 0.89), (2.6, 0.78), (2.85, 0.6), (3.0, 0.38), (3.08, 0.15)):
        pts = []
        for uu, vv in cp.rrect_ring(0.0, 0.0, 10.6 * k_, 8.4 * k_, 3.2 * k_, n_corner=6):
            taper = 1.0 - 0.08 * (vv / 8.4)                          # narrower at the top
            pts.append((c - v * 1.6 + u * uu * taper + v * vv + n * w, None))
        rings.append(pts)
    ci.finish(ce.loft('wheel_pad', rings, ['hub'], cap_bulge=(0.0, 0.02), uv_fn=lambda co, inf, k, cap: (co.y / 10.0, co.z / 10.0)))
    # spokes: four, two to the sides (drooping a little) and two down, lofted from the pad to the rim
    for ang, w0, w1 in ((-8.0, 6.0, 3.4), (188.0, 6.0, 3.4), (244.0, 5.2, 3.2), (296.0, 5.2, 3.2)):
        a = math.radians(ang)
        d = u * math.cos(a) + v * math.sin(a)
        side = n.cross(d).normalized()
        rings = []
        for k in range(7):
            t = k / 6
            p = c - v * 1.6 * (1 - t) + d * (8.0 + (R - 8.0 - 0.6) * t) - n * (1.2 + 0.4 * math.sin(math.pi * t))
            hw = w0 + (w1 - w0) * t
            th = 1.4 - 0.3 * t
            rings.append([(p + side * math.cos(2 * math.pi * j / 16) * hw / 2 + n * math.sin(2 * math.pi * j / 16) * th, None) for j in range(16)])
        ci.finish(ce.loft('spoke', rings, ['hub']))
    # column shroud, the combination stalk on the left, the cruise stalk below it
    m = ci.frame(c - n * 15.0 - v * 1.5, u, v, n)
    ci.box('column', 'dash', (-5.2, -4.8, -12.0), (5.2, 4.8, 12.0), bevel=2.0, segs=4, matrix=m)
    base = c - n * 8.0 - u * 5.0 - v * 1.5
    tip = base - u * 13.0 - v * 1.5 + n * 1.2
    ci.cylinder('stalk', 'dash', (base + tip) / 2, tip - base, 0.6, (tip - base).length, segs=16, bevel=0.1)
    lathe('stalk_tip', 'dash', tip, tip - base, [(0.6, -1.5), (0.95, -1.2), (0.95, 1.2), (0.7, 1.6), (0.01, 1.7)], segs=20)
    base2 = c - n * 8.0 - u * 4.6 - v * 4.2
    tip2 = base2 - u * 8.0 - v * 1.0
    ci.cylinder('stalk2', 'dash', (base2 + tip2) / 2, tip2 - base2, 0.45, (tip2 - base2).length, segs=12, bevel=0.1)


# ---------------- the driver's door card ----------------
def door_card(door_y):
    """The trim panel inside the driver's door: vinyl panel with a sloping armrest that becomes the pull, the chrome
    release lever, a speaker grille, a map pocket, the lock knob on the sill."""
    ci = _ci()
    yi = door_y
    rbox('door_panel', 'door', (-70.0, yi - 3.0, 40.0), (97.0, yi - 0.8, 96.5), r=1.2, segs=3)
    rbox('door_upper', 'blackplastic', (-70.0, yi - 2.0, 88.0), (97.0, yi - 0.2, 96.0), r=1.0, segs=3)
    # armrest: rising toward the front, the pull is a hollow under its front end
    rings = []
    for k in range(13):
        x = -42.0 + 66.0 * k / 12
        z = 63.5 + 6.0 * k / 12
        prof = [(yi - 0.9, z - 4.2), (yi + 4.2, z - 3.8), (yi + 6.2, z - 1.2), (yi + 6.0, z + 1.0), (yi + 4.6, z + 1.9), (yi - 0.9, z + 1.6)]
        rings.append([(Vector((x, y, zz)), None) for y, zz in prof])
    ci.finish(ce.loft('armrest', rings, ['door'], uv_fn=lambda co, inf, k, cap: (co.x / 20.0, co.z / 20.0)))
    rbox('door_pull_cup', 'blackplastic', (12.0, yi - 0.9, 64.0), (22.0, yi + 3.0, 67.4), r=0.8, segs=3)
    # chrome release lever in a black surround near the front, the lock knob on the sill
    rbox('release_surround', 'blackplastic', (68.0, yi - 0.9, 84.0), (80.0, yi + 0.4, 88.6), r=0.6, segs=2)
    rbox('release_lever', 'chrome', (69.0, yi - 0.4, 85.4), (77.5, yi + 1.4, 86.8), r=0.5, segs=2)
    lathe('lock_knob', 'blackplastic', Vector((60.0, yi - 4.0, 98.6)), Vector((0, 0, 1)), [(0.01, 0), (0.55, 0), (0.55, 3.0), (0.75, 3.3), (0.75, 4.0), (0.01, 4.2)], segs=16)
    # speaker grille low at the front, map pocket along the bottom
    c = Vector((80.0, yi - 0.5, 50.0))
    ci.disc('speaker_grille', 'vent', c, Vector((0, 1, 0)), Vector((0, 0, 1)), 6.5, (0.5, 0.5), (0.0, 0.0))
    ci.torus('speaker_ring', 'blackplastic', c, Vector((1, 0, 0)), Vector((0, 0, 1)), Vector((0, 1, 0)), 6.7, 0.4, 0.5, segs=48, rsegs=8)
    rbox('map_pocket', 'door', (-40.0, yi - 0.9, 41.0), (55.0, yi + 3.0, 49.0), r=1.0, segs=3)
    rbox('map_pocket_lip', 'blackplastic', (-40.0, yi + 2.0, 48.0), (55.0, yi + 3.2, 49.4), r=0.5, segs=2)


def build(door_y):
    dash_body()
    cluster()
    centre_stack()
    console()
    steering_wheel()
    door_card(door_y)
