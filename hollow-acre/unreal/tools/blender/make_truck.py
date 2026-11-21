"""Grandmother's truck (Part 2, Act I: found upside down in the snow under the guardrail gap at the foot of the chute,
empty, her journal fallen from the open glovebox onto the crushed headliner; its driver's door swings and bangs).

Modelled on one specific type, studied only (no badges, no brand grille, nothing copied): an early-1980s full-size
North American 4x4 pickup of the GM "square body" K20 type, regular cab, 8 ft fleetside bed, left-hand drive. Its real
numbers (1978-84 K20 long bed: cjponyparts' 1978 table, itstillruns' 1984 K20 guide): wheelbase 131.5 in (334 cm),
length 211-212 in (538 cm), height 74 in (188 cm), width 79.6 in (202 cm); LT235/85R16 tyres (81 cm across); front
track 169 cm, rear 159 cm.

Seen mostly upside down at night by flashlight, so the underside carries it (the model line's own layout):
- a ladder frame of C-channel rails with crossmembers, kicked up over the rear axle;
- a solid front axle on leaf springs, its differential offset to the driver's side; the transfer case behind the
  gearbox; a front driveshaft and a two-piece rear one with its carrier bearing; the big 14-bolt rear axle on leaf
  springs;
- a side-saddle fuel tank outside the driver's frame rail under the cab; the exhaust down the passenger side, the
  muffler under the cab, the tailpipe out ahead of the rear wheel; the spare tyre slung under the bed's rear;
- the oil pan and bell housing, the cab and bed floors with their stampings and sills.
Above (the body, upright here; Unreal turns it over): the flat-sided square body with its beltline crease, flared
square wheel openings, a flat hood, the egg-crate grille with rectangular lamps, chrome bumpers, the cab with drip
rails and a big flat windshield, the bed with its tailgate and corner lamps. The cab's roof crushed (it rolled), its
glass broken out.
Separate parts, each in its own frame: Truck_Door (the driver's door: its hinge axis at the origin, along Z, the door
along -X), Truck_Glovebox (its door: the hinge along its lower edge at the origin, the door up +Z).

Truck frame (cm): X forward, Y right (the driver on the left, -Y), Z up, the ground at z = 0 under the middle of the
wheelbase. Material slots: paint, rust, chrome, glass, rubber, vinyl, under (dark metal), lamp, redlamp, gap.

Run: blender -b --factory-startup --python make_truck.py -- <out dir> [sheet]"""
import io
import math
import os
import random
import sys

import bmesh
import bpy
import mathutils
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
_src = io.open(os.path.join(HERE, 'make_wake_props.py'), encoding='utf-8').read()
exec(compile(_src[:_src.index('\nmain()')], os.path.join(HERE, 'make_wake_props.py'), 'exec'))   # (its helpers, not its run)
_src = io.open(os.path.join(HERE, 'make_kessler_props.py'), encoding='utf-8').read()
exec(compile(_src[_src.index('UP = mathutils'):_src.index('\ndef lantern():')], os.path.join(HERE, 'make_kessler_props.py'), 'exec'))

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[0] if ARGS else '.'
R = random.Random(19)

WB, FA, RA = 334.0, 167.0, -167.0          # wheelbase, front and rear axle x
TR_F, TR_R = 84.5, 79.5                    # half tracks
TYRE_R, TYRE_W = 40.5, 23.5
HW = 101.0                                 # body half width
FRONT, REAR = 251.0, -287.0                # bumper faces
CAB_B, CAB_F = -33.0, 100.0                # the cab's back and its front (the firewall / A-pillar foot)
BED_B, BED_F = -278.0, -38.0               # the bed's tailgate face and its front panel
SILL, BELT, ROOF = 56.0, 126.0, 186.0      # the rocker's foot, the beltline, the roof's crown
HOOD = 121.0


def box(name, mat, x0, x1, y0, y1, z0, z1, bevel=0.8, segs=2):
    ob = rounded_box(name, (x1 - x0, y1 - y0, z1 - z0), min(bevel, 0.45 * min(x1 - x0, y1 - y0, z1 - z0)), mat,
                     at=((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), segs=segs)
    for pg in ob.data.polygons:
        pg.use_smooth = False
    return ob


def subtract(ob, cutters):
    """Boolean difference of the cutters from ob (applied); the cutters removed."""
    for c in cutters:
        m = ob.modifiers.new('cut', 'BOOLEAN')
        m.operation = 'DIFFERENCE'
        m.object = c
        m.solver = 'EXACT'
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.modifier_apply(modifier=m.name)
        bpy.data.objects.remove(c, do_unlink=True)


def cyl(name, mat, p0, p1, r, segs=18, r1=None):
    """A cylinder (or a cone, r1) from p0 to p1."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r, radius2=r if r1 is None else r1, depth=d.length)
    ob = obj_from_bm(name, bm)
    q = Vector((0, 0, 1)).rotation_difference(d.normalized())
    ob.data.transform(mathutils.Matrix.Translation((p0 + p1) / 2) @ q.to_matrix().to_4x4())
    set_mat(ob, mat)
    smooth(ob, 50)
    return ob


def bar(name, mat, pts, w, t):
    """A flat bar (strip steel) along points in the XZ plane at their own Y, w wide (across Y), t thick."""
    parts = []
    for i in range(len(pts) - 1):
        a, b = Vector(pts[i]), Vector(pts[i + 1])
        d = b - a
        ob = rounded_box('%s_%d' % (name, i), (d.length + t * 0.6, w, t), min(0.4, t * 0.4), mat)
        q = Vector((1, 0, 0)).rotation_difference(d.normalized())
        ob.data.transform(mathutils.Matrix.Translation((a + b) / 2) @ q.to_matrix().to_4x4())
        parts.append(ob)
    return parts


# ------------------------------------------------------------------------------------------------- the running gear

def tyre(name, c, side):
    """An LT235/85R16 lug tyre on a steel 8-lug wheel, its axis along Y at c (side: +1 right, -1 left: the wheel's face
    outward)."""
    parts = []
    w2 = TYRE_W / 2
    prof = [(-w2 + 1.0, 21.0), (-w2, 24.0), (-w2 - 0.6, 31.0), (-w2 - 0.3, 37.0), (-w2 + 1.4, 39.6), (-w2 + 3.5, TYRE_R),
            (w2 - 3.5, TYRE_R), (w2 - 1.4, 39.6), (w2 + 0.3, 37.0), (w2 + 0.6, 31.0), (w2, 24.0), (w2 - 1.0, 21.0)]
    t = lathe(name + '_tyre', prof, 'rubber', segs=64, cap0=False, cap1=False)
    parts.append(t)
    # the lugs: two staggered rows of chunky blocks, and the shoulder blocks over the edge
    n = 30
    for k in range(n):
        a = 2 * math.pi * k / n
        for row, off in ((-1, 0.0), (1, 0.5)):
            aa = a + off * 2 * math.pi / n
            yc = row * w2 * 0.42
            lug = rounded_box('%s_lug%d_%d' % (name, k, row), (w2 * 0.85, 6.2, 1.7), 0.5, 'rubber', segs=1)
            m = mathutils.Matrix.Rotation(aa, 4, 'X') @ mathutils.Matrix.Translation((yc, 0.0, TYRE_R + 0.6))
            lug.data.transform(m)
            parts.append(lug)
    # the steel wheel: rim, the dished face, the hub, eight lug nuts
    rim = lathe(name + '_rim', [(-w2 + 2.0, 19.8), (-w2 + 2.0, 21.2), (-w2 + 3.2, 20.2), (w2 - 3.2, 20.2), (w2 - 2.0, 21.2),
                                (w2 - 2.0, 19.8)], 'chrome', segs=48, cap0=False, cap1=False)
    face = lathe(name + '_face', [(w2 - 6.0, 0.0), (w2 - 6.0, 6.5), (w2 - 4.0, 9.0), (w2 - 4.5, 15.0), (w2 - 7.5, 19.9)],
                 'under', segs=48, cap0=False, cap1=False)
    hub = lathe(name + '_hub', [(w2 - 6.0, 0.0), (w2 - 1.0, 0.0), (w2 - 1.0, 4.2), (w2 - 4.0, 5.2), (w2 - 6.0, 5.2)], 'under', segs=24)
    parts += [rim, face, hub]
    for k in range(8):
        a = 2 * math.pi * k / 8
        nut = lathe('%s_nut%d' % (name, k), [(w2 - 4.6, 1.2), (w2 - 2.6, 1.2), (w2 - 2.3, 0.8), (w2 - 2.3, 0.0)], 'chrome', segs=6)
        nut.data.transform(mathutils.Matrix.Rotation(a, 4, 'X') @ mathutils.Matrix.Translation((0.0, 0.0, 7.2)))
        parts.append(nut)
    ob = join(name, parts)
    # (built about X: turned so its axis is along Y, its face to its side)
    ob.data.transform(mathutils.Matrix.Translation(c) @ mathutils.Matrix.Rotation(math.radians(90.0 * side), 4, 'Z'))
    smooth(ob, 35)
    return ob


def leaf_spring(name, x0, x1, y, z_eye, sag=7.0):
    """A pack of leaves (the longest on top, curled into eyes at its ends), the U-bolts and the shackle."""
    parts = []
    for k in range(5):
        shrink = k * 0.11
        xa, xb = x0 + (x1 - x0) * shrink / 2, x1 - (x1 - x0) * shrink / 2
        pts = []
        for i in range(9):
            u = i / 8
            x = xa + (xb - xa) * u
            pts.append((x, y, z_eye - sag * 4 * u * (1 - u) - k * 1.15))
        parts += bar('%s_leaf%d' % (name, k), 'under', pts, 6.4, 1.0)
    for x in (x0, x1):
        parts.append(cyl(name + '_eye%d' % int(x), 'under', (x, y - 3.6, z_eye + 0.4), (x, y + 3.6, z_eye + 0.4), 2.1, 12))
    # the shackle at the rear eye down to the frame's hanger
    parts.append(box(name + '_shackle', 'under', x1 - 1.0, x1 + 1.0, y - 4.6, y + 4.6, z_eye, z_eye + 11.0, 0.4))
    parts.append(box(name + '_hanger', 'under', x0 - 3.0, x0 + 3.0, y - 4.0, y + 4.0, z_eye, z_eye + 13.0, 0.6))
    return parts


def axle(name, x, half_track, diff_y, diff_r, front):
    parts = []
    z = TYRE_R
    parts.append(cyl(name + '_tube', 'under', (x, -half_track + 12.0, z), (x, half_track - 12.0, z), 5.0 if front else 6.0, 16))
    for s in (-1, 1):
        # the hub's flange and the brake drum or the knuckle
        parts.append(cyl('%s_drum%d' % (name, s), 'under', (x, s * (half_track - 13.0), z), (x, s * (half_track - 3.0), z), 15.5, 24))
        if front:
            parts.append(cyl('%s_knuckle%d' % (name, s), 'under', (x, s * (half_track - 15.0), z - 9.0), (x, s * (half_track - 15.0), z + 9.0), 5.5, 12))
    # the differential: its carrier (a squat turned shape) and its round cover with its bolts
    pump = lathe(name + '_pumpkin', [(-14.0, 0.0), (-14.0, 9.0), (-10.0, diff_r - 2.0), (-3.0, diff_r), (6.0, diff_r - 1.0),
                                     (10.0, diff_r - 5.0), (11.0, 0.0)], 'under', segs=28)
    pump.data.transform(mathutils.Matrix.Translation((x, diff_y, z)) @ mathutils.Matrix.Rotation(math.radians(180.0 if front else 0.0), 4, 'Z'))
    parts.append(pump)
    # (the pinion's snout toward the driveshaft)
    sx = -1.0 if front else 1.0
    parts.append(cyl(name + '_snout', 'under', (x - sx * 6.0, diff_y, z + 1.0), (x - sx * 22.0, diff_y, z + 2.5), 6.5, 16, 4.6))
    return parts


def frame():
    """The ladder frame: C-channel rails (a web and two flanges, its open side inward), kicked up over the rear axle."""
    parts = []
    path = [(236.0, 49.0), (120.0, 49.0), (-95.0, 51.0), (-125.0, 63.0), (-210.0, 63.0), (-240.0, 56.0), (-276.0, 56.0)]
    for s in (-1, 1):
        yo = s * 44.0
        for i in range(len(path) - 1):
            (xa, za), (xb, zb) = path[i], path[i + 1]
            d = Vector((xb - xa, 0, zb - za))
            L = d.length
            q = Vector((1, 0, 0)).rotation_difference(d.normalized())
            M = mathutils.Matrix.Translation(((xa + xb) / 2, 0, (za + zb) / 2)) @ q.to_matrix().to_4x4()
            for nm, ys, zs, hy, hz in (('web', yo - s * 0.3, 9.0, 0.5, 17.6), ('flb', yo - s * 3.2, 0.3, 6.4, 0.55), ('flt', yo - s * 3.2, 17.7, 6.4, 0.55)):
                b = rounded_box('rail%d_%s_%d' % (s, nm, i), (L + 0.6, hy, hz), 0.2, 'under', at=(0, ys, zs))
                b.data.transform(M)
                parts.append(b)
    # crossmembers
    for x, z in ((228.0, 50.0), (150.0, 50.0), (60.0, 49.5), (-40.0, 50.5), (-150.0, 64.0), (-250.0, 57.0)):
        parts.append(box('xmem%d' % int(x), 'under', x - 4.0, x + 4.0, -44.0, 44.0, z + 2.0, z + 14.0, 0.8))
    # the front body mounts and the bumper brackets
    for s in (-1, 1):
        parts.append(box('bbrk_f%d' % s, 'under', 236.0, 251.0, s * 44.0 - 4.0, s * 44.0 + 4.0, 52.0, 64.0, 0.6))
        parts.append(box('bbrk_r%d' % s, 'under', -287.0, -270.0, s * 44.0 - 4.0, s * 44.0 + 4.0, 56.0, 68.0, 0.6))
    return parts


def running_gear():
    parts = frame()
    parts += axle('faxle', FA, TR_F, -26.0, 15.0, True)
    parts += axle('raxle', RA, TR_R, 0.0, 17.5, False)
    for s in (-1, 1):
        parts += leaf_spring('fspring%d' % s, FA + 72.0, FA - 72.0, s * 44.0, 48.0, 5.0)
        parts += leaf_spring('rspring%d' % s, RA + 72.0, RA - 80.0, s * 46.0, 60.0, 9.0)
        # shock absorbers
        parts.append(cyl('fshock%d' % s, 'under', (FA + 10.0, s * 52.0, 32.0), (FA + 16.0, s * 46.0, 60.0), 2.6, 12))
        parts.append(cyl('rshock%d' % s, 'under', (RA - 12.0, s * 54.0, 34.0), (RA - 24.0, s * 44.0, 66.0), 2.6, 12))
    # the engine's oil pan and the bell housing; the gearbox; the transfer case; the driveshafts
    parts.append(box('oilpan', 'under', 130.0, 205.0, -24.0, 24.0, 33.0, 52.0, 3.0))
    parts.append(cyl('bell', 'under', (100.0, 0.0, 52.0), (74.0, 0.0, 50.0), 22.0, 24, 15.0))
    parts.append(cyl('gearbox', 'under', (74.0, 0.0, 50.0), (18.0, 0.0, 49.0), 13.5, 18, 10.5))
    parts.append(box('tcase', 'under', -6.0, 22.0, -22.0, 12.0, 36.0, 62.0, 4.0))
    parts.append(cyl('fshaft', 'under', (16.0, -14.0, 41.0), (FA - 22.0, -26.0, TYRE_R + 2.5), 3.4, 12))
    parts.append(cyl('rshaft1', 'under', (-6.0, 0.0, 45.0), (-88.0, 0.0, 50.0), 4.2, 12))
    parts.append(box('carrier', 'under', -92.0, -84.0, -7.0, 7.0, 46.0, 60.0, 1.0))
    parts.append(cyl('rshaft2', 'under', (-90.0, 0.0, 50.0), (RA + 22.0, 0.0, TYRE_R + 2.5), 4.2, 12))
    for x, y, z in ((14.0, -14.0, 41.0), (FA - 24.0, -26.0, TYRE_R + 2.5), (-6.0, 0.0, 45.0), (-90.0, 0.0, 50.0), (RA + 24.0, 0.0, TYRE_R + 2.5)):
        parts.append(cyl('ujoint%d' % int(x), 'under', (x - 2.5, y, z), (x + 2.5, y, z), 5.2, 12))
    # the side-saddle fuel tank outside the driver's rail; its straps
    parts.append(box('tank', 'under', -30.0, 52.0, -86.0, -50.0, 42.0, 68.0, 4.0))
    for x in (-20.0, 42.0):
        parts.append(box('tstrap%d' % int(x), 'rust', x - 2.0, x + 2.0, -87.0, -49.0, 41.0, 43.0, 0.3))
    # the exhaust: down the passenger side, the muffler under the cab, out ahead of the rear wheel
    ex = [(118.0, 34.0, 46.0), (70.0, 36.0, 42.0), (30.0, 38.0, 40.0)]
    parts.append(wire('expipe1', ex, 2.6, 'rust'))
    muf = cyl('muffler', 'rust', (28.0, 38.0, 41.0), (-36.0, 38.0, 42.0), 11.5, 20)
    muf.scale = (1.0, 1.0, 0.72)
    parts.append(muf)
    parts.append(wire('expipe2', [(-36.0, 38.0, 42.0), (-80.0, 50.0, 46.0), (-118.0, 62.0, 50.0), (-128.0, 80.0, 50.0)], 2.4, 'rust'))
    # the spare tyre slung under the bed's rear, and its winch
    sp = tyre('spare', (0.0, 0.0, 0.0), 1)
    sp.data.transform(mathutils.Matrix.Translation((-232.0, 0.0, 60.0)) @ mathutils.Matrix.Rotation(math.radians(90.0), 4, 'X'))
    parts.append(sp)
    # brake and fuel lines along the rail
    parts.append(wire('lines', [(150.0, -40.0, 55.0), (0.0, -40.0, 55.0), (-130.0, -40.0, 66.0), (-160.0, -10.0, 50.0)], 0.45, 'under'))
    ob = join('Truck_Gear', parts)
    box_uv(ob, 40.0)
    return ob


# ------------------------------------------------------------------------------------------------------- the body

def side_panel(name, x0, x1, z0, z1, s, arch_x=None, arch_r=None):
    """A flat body side (the square body's slab sides) with the beltline crease, outboard at y = s * HW, its wheel
    opening cut square with rounded corners and its lip flared out."""
    th = 1.2
    ob = box(name, 'paint', x0, x1, s * HW - th, s * HW, z0, z1, 0.9) if s > 0 else box(name, 'paint', x0, x1, -HW, -HW + th, z0, z1, 0.9)
    if arch_x is not None:
        cut = box(name + '_cut', 'paint', arch_x - arch_r, arch_x + arch_r, -HW - 6.0, HW + 6.0, -5.0, TYRE_R + arch_r * 0.82, arch_r * 0.45)
        subtract(ob, [cut])
    parts = [ob]
    # the crease along the beltline's foot: a shallow step proud of the side
    parts.append(box(name + '_crease', 'paint', x0 + 2.0, x1 - 2.0, s * HW - (0.0 if s > 0 else 0.7), s * HW + (0.7 if s > 0 else 0.0), z1 - 15.0, z1 - 12.0, 0.5))
    if arch_x is not None:
        # the opening's flared lip: a band round it, a little proud
        lip = []
        n = 14
        for i in range(n + 1):
            a = math.pi * i / n
            r = arch_r + 2.0
            lip.append((arch_x - math.cos(a) * r * 1.02, s * (HW + 0.9), TYRE_R + math.sin(a) * r * 0.86 + 6.0))
        parts.append(wire(name + '_lip', lip, 1.3, 'paint'))
    return parts


def body():
    parts = []
    # the front fenders, the cab's lower body and doors (the driver's door is its own part), the bed sides
    for s in (-1, 1):
        parts += side_panel('fender%d' % s, CAB_F - 2.0, 242.0, SILL + 8.0, HOOD + 2.0, s, FA, 44.0)
        parts += side_panel('bedside%d' % s, BED_B, BED_F, SILL + 10.0, BELT + 2.0, s, RA, 42.0)
        if s > 0:
            parts += side_panel('passdoor', CAB_B + 2.0, CAB_F - 4.0, SILL, BELT, s)
        else:
            parts += side_panel('cabrear_l', CAB_B, CAB_B + 14.0, SILL, BELT, s)
        # the rocker (rust along it) and the cab's back corner
        parts.append(box('rocker%d' % s, 'rust', CAB_B, CAB_F, s * HW - 3.5 if s > 0 else -HW, s * HW if s > 0 else -HW + 3.5, SILL - 4.0, SILL + 3.0, 1.0))
        # rust at the wheel openings' lower corners and the bed's lower edges
        for x in (FA - 48.0, FA + 46.0, RA - 46.0, RA + 44.0):
            parts.append(box('rustpatch%d_%d' % (s, int(x)), 'rust', x - 6.0, x + 6.0, s * HW - 0.4 if s > 0 else -HW - 0.4,
                             s * HW + 0.4 if s > 0 else -HW + 0.4, SILL + 10.0, SILL + 20.0, 0.4))
    # the inner fender wells and the cab's floor pan and firewall, the bed's floor (its underside sills)
    parts.append(box('cabfloor', 'under', CAB_B, CAB_F, -HW + 2.0, HW - 2.0, SILL + 6.0, SILL + 9.0, 1.0))
    for x in (CAB_B + 20.0, CAB_F - 30.0):
        parts.append(box('cabmount%d' % int(x), 'under', x - 3.0, x + 3.0, -HW + 4.0, HW - 4.0, SILL + 2.0, SILL + 6.0, 0.6))
    parts.append(box('firewall', 'under', CAB_F - 2.0, CAB_F + 2.0, -HW + 3.0, HW - 3.0, SILL + 6.0, HOOD, 1.0))
    parts.append(box('bedfloor', 'paint', BED_B + 2.0, BED_F - 2.0, -HW + 2.0, HW - 2.0, 74.0, 76.0, 0.6))
    for x in range(int(BED_B + 20), int(BED_F), 46):
        parts.append(box('bedsill%d' % x, 'under', x - 3.0, x + 3.0, -HW + 4.0, HW - 4.0, 69.0, 74.0, 0.5))
    for y in range(-90, 91, 18):
        parts.append(box('bedrib%d' % y, 'paint', BED_B + 4.0, BED_F - 4.0, y - 1.6, y + 1.6, 76.0, 77.2, 0.5))
    for s in (-1, 1):
        parts.append(box('wheelhouse%d' % s, 'paint', RA - 44.0, RA + 44.0, s * 58.0 - 12.0 if s > 0 else -70.0, s * 70.0 if s > 0 else -46.0, 74.0, 106.0, 6.0))
        parts.append(box('fwell%d' % s, 'under', FA - 46.0, FA + 46.0, s * 62.0 - 6.0 if s > 0 else -80.0, s * 80.0 if s > 0 else -56.0, 72.0, 110.0, 8.0))
    # the bed's front panel and the tailgate (its stamped panel and handle), the corner lamps
    parts.append(box('bedfront', 'paint', BED_F - 2.0, BED_F, -HW, HW, 74.0, BELT + 2.0, 0.8))
    parts.append(box('tailgate', 'paint', BED_B - 2.0, BED_B + 1.0, -HW + 4.0, HW - 4.0, 70.0, BELT, 1.0))
    parts.append(box('tailgate_stamp', 'paint', BED_B - 2.8, BED_B - 1.6, -HW + 18.0, HW - 18.0, 82.0, BELT - 12.0, 1.5))
    parts.append(box('tailgate_handle', 'chrome', BED_B - 3.4, BED_B - 2.2, -12.0, 12.0, BELT - 9.0, BELT - 5.0, 0.6))
    for s in (-1, 1):
        parts.append(box('taillamp%d' % s, 'redlamp', BED_B - 2.6, BED_B + 1.0, s * HW - 6.0 if s > 0 else -HW, s * HW if s > 0 else -HW + 6.0, 86.0, 118.0, 0.8))
    # the hood, the grille and its lamps, the bumpers
    parts.append(box('hood', 'paint', CAB_F + 2.0, 238.0, -HW + 3.0, HW - 3.0, HOOD - 3.0, HOOD, 1.2))
    parts.append(box('hood_rise', 'paint', CAB_F + 8.0, 232.0, -40.0, 40.0, HOOD - 0.5, HOOD + 1.2, 1.4))
    # the front: the painted header over the grille and the valance under it, the chrome-framed egg-crate grille (black
    # behind its bars) between the lamps, each lamp in its own chrome bezel on the painted fender front
    parts.append(box('header', 'paint', 238.0, 242.0, -HW + 3.0, HW - 3.0, HOOD - 13.0, HOOD - 2.0, 1.0))
    parts.append(box('valance', 'paint', 238.0, 242.0, -HW + 3.0, HW - 3.0, 70.0, 79.0, 1.0))
    for s_ in (-1, 1):
        parts.append(box('lampfront%d' % s_, 'paint', 238.0, 241.5, s_ * 60.0 if s_ > 0 else -HW + 3.0, s_ * (HW - 3.0) if s_ > 0 else -60.0, 79.0, HOOD - 13.0, 0.8))
    parts.append(box('grilleback', 'gap', 237.0, 239.0, -58.0, 58.0, 79.0, HOOD - 13.0, 0.4))
    for nm, y0, y1, z0, z1 in (('gf_t', -59.0, 59.0, HOOD - 15.0, HOOD - 12.5), ('gf_b', -59.0, 59.0, 79.0, 81.5),
                               ('gf_l', -59.0, -56.5, 79.0, HOOD - 12.5), ('gf_r', 56.5, 59.0, 79.0, HOOD - 12.5)):
        parts.append(box(nm, 'chrome', 239.0, 243.5, y0, y1, z0, z1, 0.6))
    for k in range(-6, 7):
        parts.append(box('gbar_v%d' % k, 'chrome', 239.0, 242.0, k * 8.4 - 0.5, k * 8.4 + 0.5, 81.5, HOOD - 15.0, 0.2))
    for z in (88.0, 96.0, 104.0):
        parts.append(box('gbar_h%d' % int(z), 'chrome', 239.0, 242.0, -56.5, 56.5, z - 0.5, z + 0.5, 0.2))
    for s_ in (-1, 1):
        for z in (88.0, 102.0):
            parts.append(box('headlamp%d_%d' % (s_, int(z)), 'lamp', 240.5, 243.0, s_ * 72.0 - 10.0, s_ * 72.0 + 10.0, z - 5.5, z + 5.5, 1.5))
            # (its bezel: a chrome ring round it)
            for nm, y0, y1, z0, z1 in (('t', -11.5, 11.5, 5.5, 7.0), ('b', -11.5, 11.5, -7.0, -5.5), ('l', -11.5, -10.0, -5.5, 5.5), ('r', 10.0, 11.5, -5.5, 5.5)):
                parts.append(box('bezel%d_%d_%s' % (s_, int(z), nm), 'chrome', 241.0, 243.8, s_ * 72.0 + y0, s_ * 72.0 + y1, z + z0, z + z1, 0.3))
        parts.append(box('parklamp%d' % s_, 'lamp', 241.0, 243.5, s_ * 72.0 - 10.0, s_ * 72.0 + 10.0, 73.0, 77.0, 0.6))
    parts.append(box('fbumper', 'chrome', 243.0, FRONT, -HW - 2.0, HW + 2.0, 54.0, 72.0, 2.4))
    parts.append(box('fbumper_face', 'chrome', FRONT - 0.5, FRONT + 1.0, -HW, HW, 59.0, 67.0, 1.2))
    parts.append(box('rbumper', 'chrome', REAR, BED_B - 3.0, -HW - 1.0, HW + 1.0, 56.0, 70.0, 2.2))
    parts.append(box('rbumper_step', 'chrome', REAR - 0.6, BED_B - 3.0, -26.0, 26.0, 63.0, 70.0, 0.8))
    return parts


def cab_top():
    """The cab above the beltline: the A pillars raked back, the B and C corners, the roof with its drip rails, the
    window frames; the glass broken out to jagged edges. Then crushed: the roof pressed down and over (it rolled)."""
    parts = []
    wf, wb = CAB_F - 6.0, CAB_F - 46.0             # the windshield's foot and top (x)
    rb, rt = CAB_B + 4.0, CAB_B + 10.0             # the back window's foot and top
    inset = 6.0                                    # (the greenhouse leans in)
    for s in (-1, 1):
        y0 = s * (HW - 1.5)
        y1 = s * (HW - inset)
        # A pillar: from the cowl up to the roof's front corner
        parts += bar('apillar%d' % s, 'paint', [(wf, y0, BELT), (wb, y1, ROOF - 4.0)], 5.0, 4.0)
        # the door frame's top rail (the window's top) and the B pillar
        parts += bar('railtop%d' % s, 'paint', [(wb, y1, ROOF - 5.0), (rt, y1, ROOF - 5.0)], 4.0, 3.0)
        parts += bar('cpillar%d' % s, 'paint', [(rb + 2.0, y0, BELT), (rt, y1, ROOF - 4.0)], 12.0, 3.4)
        # the drip rail along the roof's edge
        parts += bar('drip%d' % s, 'chrome', [(wb + 4.0, s * (HW - inset + 0.8), ROOF - 2.0), (rt - 2.0, s * (HW - inset + 0.8), ROOF - 2.0)], 1.2, 1.2)
    parts.append(box('roof', 'paint', rt - 2.0, wb + 4.0, -HW + inset - 1.0, HW - inset + 1.0, ROOF - 5.0, ROOF, 2.5))
    parts.append(box('cowl', 'paint', wf - 6.0, CAB_F + 2.0, -HW + 2.0, HW - 2.0, BELT - 3.0, BELT + 1.0, 1.0))
    parts.append(box('backpanel', 'paint', CAB_B, CAB_B + 3.0, -HW + 2.0, HW - 2.0, SILL + 8.0, BELT + 2.0, 0.8))
    parts.append(box('backhead', 'paint', CAB_B + 3.0, rt + 1.0, -HW + inset, HW - inset, ROOF - 14.0, ROOF - 4.0, 1.2))
    # the glass: shards left in the frames (the rest gone)
    def shards(name, corners, keep=0.28):
        bm = bmesh.new()
        (a, b, c, d) = [Vector(p) for p in corners]
        for i in range(10):
            for j in range(6):
                if R.random() > keep:
                    continue
                u0, u1, v0, v1 = i / 10, (i + 1) / 10, j / 6, (j + 1) / 6
                # (near the frame's edges only: a jagged rim of glass)
                if 0 < i < 9 and 0 < j < 5 and R.random() > 0.15:
                    continue
                pts = []
                for (u, v) in ((u0, v0), (u1, v0), (u1 + R.uniform(-0.05, 0.05), v1), (u0, v1 + R.uniform(-0.1, 0.1))):
                    p = a.lerp(b, u).lerp(d.lerp(c, u), v)
                    pts.append(bm.verts.new(p))
                bm.faces.new(pts[:3])
                if R.random() < 0.6:
                    bm.faces.new((pts[0], pts[2], pts[3]))
        ob = obj_from_bm(name, bm)
        set_mat(ob, 'glass')
        return ob
    parts.append(shards('windshield', [(wf, -HW + 4.0, BELT + 1.0), (wf, HW - 4.0, BELT + 1.0), (wb + 1.0, HW - inset - 2.0, ROOF - 6.0), (wb + 1.0, -HW + inset + 2.0, ROOF - 6.0)]))
    parts.append(shards('backglass', [(CAB_B + 2.0, -HW + inset + 8.0, BELT + 2.0), (CAB_B + 2.0, HW - inset - 8.0, BELT + 2.0),
                                      (CAB_B + 4.0, HW - inset - 10.0, ROOF - 14.0), (CAB_B + 4.0, -HW + inset + 10.0, ROOF - 14.0)]))
    parts.append(shards('passglass', [(wb + 8.0, HW - 3.5, BELT + 1.0), (rb, HW - 3.5, BELT + 1.0), (rt, HW - inset, ROOF - 7.0), (wb + 2.0, HW - inset, ROOF - 7.0)], 0.35))
    ob = join('cabtop', parts)
    crush(ob)
    return ob


def crush(ob):
    """The roof pressed down toward the driver's side and back (it went over on its top): everything above the
    beltline lowered by up to 24 cm (most at the roof's driver-side front corner), the pillars kinked."""
    for v in ob.data.vertices:
        h = max(0.0, (v.co.z - BELT) / (ROOF - BELT))
        side = 0.65 + 0.35 * (-v.co.y / HW)            # (more on the driver's side)
        fwd = 0.75 + 0.25 * ((v.co.x - CAB_B) / (CAB_F - CAB_B))
        drop = 24.0 * (h ** 1.4) * side * fwd
        v.co.z -= drop
        v.co.y += 6.0 * (h ** 2) * side                # (and shoved over toward the passenger's side)
        v.co.x += 2.0 * math.sin(v.co.y * 0.05) * h    # (a ripple in the roof skin)


def interior():
    parts = []
    # the dash: its padded top, the instrument binnacle on the driver's side (km/h), the glovebox's opening on the
    # passenger's (its door a separate part), the steering column and wheel, the bench seat, the floor mat
    parts.append(box('dash', 'vinyl', CAB_F - 30.0, CAB_F - 4.0, -HW + 6.0, HW - 6.0, BELT - 22.0, BELT - 2.0, 3.0))
    parts.append(box('dashpad', 'vinyl', CAB_F - 34.0, CAB_F - 20.0, -HW + 8.0, HW - 8.0, BELT - 6.0, BELT, 3.5))
    parts.append(box('binnacle', 'gap', CAB_F - 31.0, CAB_F - 29.0, -62.0, -24.0, BELT - 18.0, BELT - 6.0, 1.0))
    parts.append(box('glovebox_hole', 'gap', CAB_F - 31.0, CAB_F - 27.0, 30.0, 62.0, BELT - 19.0, BELT - 9.0, 0.6))
    parts.append(cyl('column', 'vinyl', (CAB_F - 30.0, -42.0, BELT - 14.0), (CAB_F - 58.0, -42.0, BELT - 2.0), 3.2, 12))
    wheel = lathe('wheel', [(-1.6, 18.0), (-1.6, 19.6), (0.0, 20.4), (1.6, 19.6), (1.6, 18.0), (0.0, 17.2), (-1.6, 18.0)], 'vinyl', segs=36, cap0=False, cap1=False)
    hubw = lathe('wheelhub', [(-2.0, 0.0), (-2.0, 5.0), (1.0, 5.0), (1.0, 0.0)], 'vinyl', segs=16)
    spokes = []
    for k in range(3):
        a = 2 * math.pi * k / 3 + math.pi / 2
        sp = rounded_box('spoke%d' % k, (1.2, 3.0, 15.0), 0.4, 'vinyl', at=(0.0, 0.0, 11.0))
        sp.data.transform(mathutils.Matrix.Rotation(a, 4, 'X'))
        spokes.append(sp)
    w = join('steeringwheel', [wheel, hubw] + spokes)
    w.data.transform(mathutils.Matrix.Translation((CAB_F - 60.0, -42.0, BELT - 1.0)) @ mathutils.Matrix.Rotation(math.radians(-60.0), 4, 'Y'))
    parts.append(w)
    parts.append(box('seatbase', 'vinyl', CAB_B + 10.0, CAB_B + 62.0, -HW + 8.0, HW - 8.0, SILL + 10.0, SILL + 36.0, 6.0))
    parts.append(box('seatback', 'vinyl', CAB_B + 4.0, CAB_B + 18.0, -HW + 8.0, HW - 8.0, SILL + 30.0, BELT + 26.0, 6.0))
    parts.append(box('floormat', 'rubber', CAB_B + 60.0, CAB_F - 6.0, -HW + 6.0, HW - 6.0, SILL + 9.0, SILL + 10.0, 0.4))
    parts.append(box('headliner', 'vinyl', CAB_B + 6.0, CAB_F - 44.0, -HW + 8.0, HW - 8.0, ROOF - 8.0, ROOF - 6.5, 1.0))
    ob = join('interior', parts)
    crush_liner = [v for v in ob.data.vertices if v.co.z > BELT + 20.0]
    for v in crush_liner:
        h = max(0.0, (v.co.z - BELT) / (ROOF - BELT))
        v.co.z -= 24.0 * (h ** 1.4) * (0.65 + 0.35 * (-v.co.y / HW))
    return ob


def door():
    """The driver's door, in its own frame: its front hinge axis at the origin along Z (x = 0 is the hinge line), the
    door running back along -X, its outer skin at y = 0 (the cab's -HW), the window frame and broken glass above."""
    parts = []
    L = CAB_F - 4.0 - (CAB_B + 14.0)              # (front edge to back edge)
    parts.append(box('dskin', 'paint', -L, -1.0, -1.2, 0.0, SILL, BELT, 0.9))
    parts.append(box('dcrease', 'paint', -L + 2.0, -3.0, -1.9, -1.2, BELT - 15.0, BELT - 12.0, 0.5))
    parts.append(box('dinner', 'vinyl', -L + 3.0, -3.0, 0.0, 9.0, SILL + 4.0, BELT - 2.0, 2.0))
    parts.append(box('darmrest', 'vinyl', -L + 14.0, -18.0, 7.0, 12.0, BELT - 26.0, BELT - 22.0, 1.2))
    parts.append(box('dhandle', 'chrome', -L + 8.0, -L + 22.0, -2.6, -1.0, BELT - 8.0, BELT - 5.0, 0.6))
    parts.append(box('dmirrorarm', 'chrome', -6.0, -2.0, -14.0, -1.0, BELT + 6.0, BELT + 8.0, 0.4))
    parts.append(box('dmirror', 'chrome', -9.0, -1.0, -26.0, -12.0, BELT + 2.0, BELT + 18.0, 1.0))
    parts.append(box('drust', 'rust', -L + 6.0, -6.0, -1.5, -0.6, SILL, SILL + 8.0, 0.4))
    # its window frame (the glass mostly gone), leaning in with the greenhouse
    inset = 5.0
    parts += bar('dframe_f', 'paint', [(-6.0, 0.6, BELT), (-46.0, inset, ROOF - 6.0)], 3.0, 2.4)
    parts += bar('dframe_t', 'paint', [(-46.0, inset, ROOF - 6.0), (-L + 2.0, inset, ROOF - 6.0)], 3.0, 2.4)
    parts += bar('dframe_b', 'paint', [(-L + 2.0, 0.6, BELT), (-L + 2.0, inset, ROOF - 6.0)], 3.0, 2.4)
    g = []
    bm = bmesh.new()
    for (x0, z0, x1, z1) in ((-14.0, BELT + 1.0, -30.0, BELT + 9.0), (-L + 6.0, BELT + 1.0, -L + 24.0, BELT + 14.0), (-L + 4.0, ROOF - 18.0, -L + 12.0, ROOF - 8.0)):
        a = bm.verts.new((x0, 1.5, z0))
        b = bm.verts.new((x1, 1.5, z0 + R.uniform(-2, 2)))
        c = bm.verts.new(((x0 + x1) / 2 + R.uniform(-4, 4), 2.5, z1))
        bm.faces.new((a, b, c))
    gl = obj_from_bm('dglass', bm)
    set_mat(gl, 'glass')
    parts.append(gl)
    ob = join('Truck_Door', parts)
    for v in ob.data.vertices:                    # (its frame crushed with the roof)
        h = max(0.0, (v.co.z - BELT) / (ROOF - BELT))
        v.co.z -= 24.0 * (h ** 1.4) * 0.95
    box_uv(ob, 40.0)
    return ob


def glovebox():
    """The glovebox's door, in its own frame: its hinge along its lower edge at the origin (along Y), the door up +Z,
    its face toward -X (into the cab); it hangs open (the truck is on its roof)."""
    parts = [box('gbdoor', 'vinyl', -1.6, 0.0, -16.0, 16.0, 0.0, 10.0, 0.8),
             box('gblatch', 'chrome', -2.4, -1.6, -2.5, 2.5, 7.0, 9.0, 0.3)]
    ob = join('Truck_Glovebox', parts)
    box_uv(ob, 20.0)
    return ob


def build():
    clear()
    gear = running_gear()
    shell = body()
    top = cab_top()
    inner = interior()
    b = join('Truck_Body', shell + [top, inner])
    box_uv(b, 40.0)
    wheels = [tyre('wheel_fl', (FA, -TR_F, TYRE_R), -1), tyre('wheel_fr', (FA, TR_F, TYRE_R), 1),
              tyre('wheel_rl', (RA, -TR_R, TYRE_R), -1), tyre('wheel_rr', (RA, TR_R, TYRE_R), 1)]
    under = join('Truck_Under', [gear] + wheels)
    d = door()
    gb = glovebox()
    return [b, under, d, gb]


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    obs = build()
    for ob in obs:
        tris = sum(len(p.vertices) - 2 for p in ob.data.polygons)
        lo = [min(v.co[i] for v in ob.data.vertices) for i in range(3)]
        hi = [max(v.co[i] for v in ob.data.vertices) for i in range(3)]
        print('truck: %s %d tris, x %.0f..%.0f y %.0f..%.0f z %.0f..%.0f' % (ob.name, tris, lo[0], hi[0], lo[1], hi[1], lo[2], hi[2]))
    if 'sheet' in ARGS:
        sys.path.insert(0, os.path.join(HERE, '..', '..', '..', '2d', 'tools', 'b3d'))
        import views

        def shots(prefix, mode='shape'):
            """Five views (and a low three-quarter one) rendered to PNGs (tiled outside Blender: its Python has no PIL)."""
            sc = bpy.context.scene
            if sc.world is None:
                sc.world = bpy.data.worlds.new('w')
            lo, hi = views._bounds(obs)
            ctr = (lo + hi) / 2
            dist = (hi - lo).length * 1.25
            views._setup(mode, 520)
            sc.render.resolution_x, sc.render.resolution_y = 640, 400
            for lab, d in (('front', (1, 0, 0.12)), ('side', (0, -1, 0.1)), ('back34', (-0.7, 0.7, 0.35)), ('top', (0.001, 0.0, 1)),
                           ('front34', (0.7, -0.7, 0.35)), ('low34', (-0.6, -0.75, -0.05))):
                c = views.cam_at(ctr + Vector(d).normalized() * dist, ctr, 50, 'c_' + lab)
                sc.camera = c
                sc.render.filepath = os.path.join(OUT, '%s_%s.png' % (prefix, lab))
                bpy.ops.render.render(write_still=True)
                bpy.data.objects.remove(c, do_unlink=True)
        # (the door shown hung in place, the glovebox's door in the dash)
        obs[2].location = (CAB_F - 4.0, -HW, 0.0)
        obs[3].location = (CAB_F - 31.0, 46.0, BELT - 19.0)
        shots('up')
        # (upside down, as it is found)
        for ob in obs:
            ob.rotation_euler = (math.pi, 0.0, 0.0)
        shots('inv')
    else:
        for ob in obs:
            write_obj(ob, os.path.join(OUT, ob.name + '.obj'))
