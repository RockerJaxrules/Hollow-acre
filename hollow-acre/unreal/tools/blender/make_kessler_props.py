"""Props for Kessler (Part 2, Act I's end: the lantern in the trees, the rifle): modelled in Blender (1 unit = 1 cm), written
as OBJ for Unreal (Saved/Generated/Kessler_*.obj, read by Scripts/import_wake_props.py with HA_WAKE_PARTS) in the project's
convention (make_wake_props.py's helpers: Unreal's axes, Y mirrored for its OBJ import, faces wound for it).

Kessler_Lantern: a tubular cold-blast hurricane lantern as they were made about 1900-1930 (studied from catalogue plates
and surviving tubular lanterns; generic, no maker's mark): a low oil fount, two round air tubes up its sides goosenecked
into the top's air chamber, the burner on the fount (its air chamber, the globe's holder, the flame spreader, the wick
and its knob, the globe's lift lever), a barrel glass globe with collars in a bowed wire guard, the top in three tiers
(the globe plate, the domed air chamber, the vented chimney with its rain cap), and the wire bail with a wooden grip it is
carried by. Its own frame: the fount's foot at the origin, Z up, the bail up (carried), the wick's knob to -Y (its
front). About 33 cm to the rain cap, 42 cm to the top of the bail; the fount 16 cm across.
Material slots: tin (the painted sheet steel, worn), rust (the burner's brass gone dark, the wire), glass, wick (the
wick, the vents' dark slots), wood (the bail's grip), flame (a card inside the globe, drawn by M_Flame).

Run: blender -b --factory-startup --python make_kessler_props.py -- <out dir>"""
import io
import math
import os
import sys

import bmesh
import bpy
import mathutils
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
_src = io.open(os.path.join(HERE, 'make_wake_props.py'), encoding='utf-8').read()
exec(compile(_src[:_src.index('\nmain()')], os.path.join(HERE, 'make_wake_props.py'), 'exec'))   # (its helpers, not its run)

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '.'
UP = mathutils.Matrix.Rotation(math.radians(-90.0), 4, 'Y')          # (a lathe turns about X: X to Z)


def upright(name, profile, mat, segs=32, at=(0.0, 0.0, 0.0), **kw):
    """A turned part standing on Z: profile (z, r) pairs."""
    ob = lathe(name, profile, mat, segs=segs, **kw)
    ob.data.transform(mathutils.Matrix.Translation(at) @ UP)
    return ob


def wire(name, pts, r, mat, res=6):
    """A wire through points (a bent rod), round in section."""
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = r
    cu.bevel_resolution = 2
    cu.use_fill_caps = True
    sp = cu.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts):
        p.co = (q[0], q[1], q[2], 1.0)
    ob = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True)
    bpy.ops.object.convert(target='MESH')
    ob = bpy.context.active_object
    set_mat(ob, mat)
    return ob


def band(name, z, r, h, t, mat, segs=32):
    """A flat ring (a strip of metal on edge): at height z, radius r, h tall, t thick."""
    return upright(name, [(z - h / 2, r - t / 2), (z - h / 2, r + t / 2), (z + h / 2, r + t / 2), (z + h / 2, r - t / 2), (z - h / 2, r - t / 2)],
                   mat, segs=segs, cap0=False, cap1=False)


def bend(a, b, c, n=6):
    """Points round a corner: from a, curving past the corner b, out to c (a quadratic curve)."""
    a, b, c = Vector(a), Vector(b), Vector(c)
    return [tuple((1 - t) ** 2 * a + 2 * (1 - t) * t * b + t * t * c) for t in [k / n for k in range(n + 1)]]


def lantern():
    """(Shape r2, after a blind critique of r1 at 5/10: the tubes round and goosenecked into the top's air chamber and bent
    in at their feet into the burner's chamber; the top in three tiers; a barrel globe with collars; the globe's holder,
    the wick knob and the lift lever at the burner; a bowed guard standing off the glass; a lower fount.)"""
    parts = []
    # the fount: a low drum 16 across and 6 tall, its shoulder rounded, a separate rolled rim at its foot
    parts.append(upright('ln_fount', [(0.3, 0.0), (0.3, 7.8), (4.3, 7.9), (5.3, 7.3), (5.9, 5.8), (6.1, 3.6), (6.1, 0.0)], 'tin', segs=40))
    parts.append(band('ln_foot', 0.35, 8.05, 0.7, 0.35, 'tin', segs=40))
    # its filler cap, 3 cm in from the edge, at the back
    cap = upright('ln_filler', [(0.0, 1.1), (1.0, 1.1), (1.2, 0.8), (1.2, 0.0)], 'rust', segs=14)
    cap.data.transform(mathutils.Matrix.Translation((0.0, 5.0, 5.5)) @ mathutils.Matrix.Rotation(math.radians(18.0), 4, 'X'))
    parts.append(cap)
    # the burner's air chamber on the fount (the tubes bring the air down into it), the globe's holder ring on it, the
    # flame spreader's cone, the wick
    parts.append(upright('ln_chamber', [(6.0, 4.7), (8.4, 4.7), (8.8, 4.3), (8.8, 0.0)], 'tin', segs=28, cap0=False))
    parts.append(band('ln_holder', 9.4, 4.6, 1.1, 0.3, 'rust', segs=28))
    parts.append(upright('ln_cone', [(8.8, 2.0), (9.6, 2.0), (10.4, 1.3), (10.6, 1.0)], 'rust', segs=20, cap0=False, cap1=False))
    parts.append(rounded_box('ln_wick', (0.25, 1.4, 0.7), 0.05, 'wick', at=(0.0, 0.0, 10.85), segs=1))
    # the wick's knob out the front: a 0.4 cm shaft, a 2.5 cm milled disc 3.5 cm out
    sh = lathe('ln_shaft', [(0.0, 0.0), (0.0, 0.2), (3.6, 0.2), (3.6, 0.0)], 'rust', segs=8)
    sh.data.transform(mathutils.Matrix.Translation((0.0, -2.0, 9.6)) @ mathutils.Matrix.Rotation(math.radians(-90.0), 4, 'Z'))
    parts.append(sh)
    kn = lathe('ln_knob', [(0.0, 0.0), (0.0, 1.25), (0.45, 1.25), (0.45, 0.0)], 'rust', segs=18)
    kn.data.transform(mathutils.Matrix.Translation((0.0, -5.6, 9.6)) @ mathutils.Matrix.Rotation(math.radians(-90.0), 4, 'Z'))
    parts.append(kn)
    # the globe: a barrel 13.5 tall, 10.5 across its belly, straight collars at its foot (8.5 across) and top (7.5)
    globe = [(9.5, 4.25), (11.0, 4.25), (11.6, 4.6), (13.0, 5.05), (16.2, 5.25), (19.2, 5.05), (20.6, 4.5), (21.5, 3.75), (23.0, 3.75)]
    parts.append(upright('ln_globe', globe, 'glass', segs=32, cap0=False, cap1=False))
    # its guard: five bowed wires standing a centimetre off the glass, two flat rings round them
    for k in range(5):
        a = math.radians(18.0 + 72.0 * k)
        c, s_ = math.cos(a), math.sin(a)
        prof = [(9.6, 4.9), (11.2, 5.8), (13.5, 6.3), (16.2, 6.45), (19.0, 6.3), (21.4, 5.6), (22.9, 4.8)]
        parts.append(wire('ln_guard%d' % k, [(c * r, s_ * r, z) for z, r in prof], 0.15, 'rust'))
    parts.append(band('ln_ring0', 12.6, 6.12, 0.7, 0.14, 'rust'))
    parts.append(band('ln_ring1', 19.6, 6.12, 0.7, 0.14, 'rust'))
    # the top in three tiers: the globe plate clamping the globe, the domed air chamber over it (the tubes enter its
    # sides), the vented chimney cap; the rain cap a centimetre above it on a post
    parts.append(upright('ln_plate', [(23.0, 3.6), (23.0, 5.5), (23.45, 5.5), (23.45, 0.0)], 'tin', segs=32, cap0=False))
    parts.append(upright('ln_dome', [(23.45, 6.3), (24.6, 6.55), (26.3, 6.1), (27.6, 4.8), (28.4, 3.2), (28.4, 0.0)], 'tin', segs=36,
                         cap0=False))
    parts.append(upright('ln_chimney', [(28.4, 3.0), (31.3, 3.0), (31.3, 0.0)], 'tin', segs=20, cap0=False))
    for k in range(8):
        a = math.pi / 4 * k
        v = rounded_box('ln_vent%d' % k, (0.12, 0.8, 1.5), 0.04, 'wick', at=(0.0, 0.0, 0.0), segs=1)
        v.data.transform(mathutils.Matrix.Translation((math.cos(a) * 3.02, math.sin(a) * 3.02, 29.9)) @ mathutils.Matrix.Rotation(a, 4, 'Z'))
        parts.append(v)
    parts.append(upright('ln_post', [(31.3, 0.3), (32.4, 0.3), (32.4, 0.0)], 'tin', segs=8, cap0=False))
    parts.append(upright('ln_raincap', [(32.3, 0.0), (32.3, 3.7), (32.55, 3.6), (32.7, 0.0)], 'tin', segs=24))
    # the two air tubes, 1.7 cm round, 16 cm apart over the fount's rim: in at their feet to the burner's chamber,
    # goosenecked at their tops into the dome's sides; small ears on them for the bail
    for side in (-1.0, 1.0):
        x = side * 8.0
        pts = ([(side * 4.4, 0.0, 7.4)] + bend((side * 6.0, 0.0, 7.4), (x, 0.0, 7.4), (x, 0.0, 9.4))[1:] + [(x, 0.0, 22.6)] +
               bend((x, 0.0, 22.6), (x, 0.0, 26.0), (side * 5.6, 0.0, 26.0))[1:])
        parts.append(wire('ln_tube%d' % int(side > 0), pts, 0.85, 'tin', res=8))
        parts.append(rounded_box('ln_ear%d' % int(side > 0), (0.9, 0.35, 1.6), 0.1, 'tin', at=(side * 8.95, 0.0, 20.6), segs=1))
    # the globe's lift lever: a wire from the burner up along the right tube, a thumb tab at its top
    parts.append(wire('ln_lever', [(4.4, 1.2, 8.6), (6.6, 1.3, 9.0), (7.0, 1.4, 10.2), (7.0, 1.4, 16.8)], 0.2, 'rust'))
    parts.append(rounded_box('ln_tab', (1.0, 1.4, 0.3), 0.1, 'rust', at=(7.2, 1.6, 17.0), segs=1))
    # the bail, up: a wire from ear to ear in a tall arch, a wooden roller grip 8 cm long on its top
    bail = []
    for k in range(29):
        a = math.pi * k / 28.0
        bail.append((-9.4 * math.cos(a), 0.0, 20.6 + 20.6 * math.sin(a) ** 0.8))
    parts.append(wire('ln_bail', bail, 0.2, 'rust'))
    grip = lathe('ln_grip', [(0.0, 0.0), (0.0, 0.85), (0.3, 1.0), (7.7, 1.0), (8.0, 0.85), (8.0, 0.0)], 'wood', segs=12)
    grip.data.transform(mathutils.Matrix.Translation((-4.0, 0.0, 41.2)))
    parts.append(grip)
    ob = join('Kessler_Lantern', parts)
    smooth(ob, 35.0)
    box_uv(ob, 12.0)
    return ob


def lantern_flame():
    """The lantern's flame: two crossed cards on its wick (the lantern's own frame), 1.8 wide, 4.2 tall, for M_Flame."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new()
    for k in range(2):
        a = math.radians(90.0 * k + 20.0)
        d = Vector((math.cos(a), math.sin(a), 0.0))
        c = Vector((0.0, 0.0, 11.0))
        vs = [bm.verts.new(c - d * 0.9), bm.verts.new(c + d * 0.9), bm.verts.new(c + d * 0.9 + Vector((0, 0, 4.2))), bm.verts.new(c - d * 0.9 + Vector((0, 0, 4.2)))]
        f = bm.faces.new(vs)
        for lp, (u, v) in zip(f.loops, ((0.0, 0.0), (1.0, 0.0), (1.0, 1.0), (0.0, 1.0))):
            lp[uv].uv = (u, v)
    ob = obj_from_bm('Kessler_LanternFlame', bm)
    set_mat(ob, 'flame')
    return ob


def build():
    clear()
    return [lantern(), lantern_flame()]


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for ob in build():
        write_obj(ob, os.path.join(OUT, ob.name + '.obj'))
