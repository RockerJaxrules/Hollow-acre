"""Where the driver's winter gloves go: a mask in the MetaHuman body's UV layout (every MetaHuman body shares it; the
arms and hands are on its second UDIM tile, u 1..2, and the mask is laid out for that tile),
white over the hands and up the wrist about 6 cm (the glove's cuff), black elsewhere (the jacket's sleeve). Read from
a MetaHuman body (Saved/Generated/Husk/body.fbx, the husk's body before it was stretched); writes
SourceArt/T_HandMask.png. The material M_DriverGloves (Scripts/build_drive.py) puts leather where it is white.
Run: blender -b --factory-startup --python hand_mask.py -- <Saved/Generated/Husk> <SourceArt>
"""
import os
import sys

import bpy
import numpy as np

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
GEN = os.path.abspath(ARGS[0] if ARGS else '.')
ART = os.path.abspath(ARGS[1] if len(ARGS) > 1 else '.')
SIZE = 1024
HAND = ('hand', 'index', 'middle', 'ring', 'pinky', 'thumb')


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=os.path.join(GEN, 'body.fbx'), automatic_bone_orientation=True)
    arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
    body = max((o for o in bpy.data.objects if o.type == 'MESH'), key=lambda o: len(o.data.vertices))
    names = {g.index: g.name for g in body.vertex_groups}
    me = body.data
    mw = body.matrix_world
    wrists = {sd: (arm.matrix_world @ arm.data.bones['hand' + sd].head_local) for sd in ('_l', '_r')}
    val = np.zeros(len(me.vertices), np.float32)
    for v in me.vertices:
        gs = [g for g in v.groups if g.weight > 0.0]
        if not gs:
            continue
        dom = names[max(gs, key=lambda g: g.weight).group]
        if dom.startswith(HAND):
            val[v.index] = 1.0
        elif dom.startswith('lowerarm'):
            p = mw @ v.co
            d = min((p - w).length for w in wrists.values())
            scale = 100.0 if d > 3.0 else 1.0               # the import may be in cm or m
            d *= 1.0 / scale if scale == 100.0 else 1.0
            val[v.index] = 1.0 if d < 0.06 else (0.5 if d < 0.075 else 0.0)
    uv = me.uv_layers[0].data
    me.calc_loop_triangles()
    img = np.zeros((SIZE, SIZE), np.float32)
    for t in me.loop_triangles:
        F = val[list(t.vertices)]
        if F.max() <= 0.0:
            continue
        P = np.mod(np.array([uv[li].uv for li in t.loops], np.float64), 1.0) * SIZE - 0.5     # the arms are on UDIM tile 1002
        x0, y0 = np.floor(P.min(0)).astype(int)
        x1, y1 = np.ceil(P.max(0)).astype(int)
        x0, y0, x1, y1 = max(x0, 0), max(y0, 0), min(x1, SIZE - 1), min(y1, SIZE - 1)
        if x1 < x0 or y1 < y0:
            continue
        ys, xs = np.mgrid[y0:y1 + 1, x0:x1 + 1]
        (ax, ay), (bx, by), (cx, cy) = P
        den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
        if abs(den) < 1e-12:
            continue
        l1 = ((by - cy) * (xs - cx) + (cx - bx) * (ys - cy)) / den
        l2 = ((cy - ay) * (xs - cx) + (ax - cx) * (ys - cy)) / den
        l3 = 1 - l1 - l2
        inside = (l1 >= -1e-3) & (l2 >= -1e-3) & (l3 >= -1e-3)
        img[ys[inside], xs[inside]] = np.maximum(img[ys[inside], xs[inside]], (l1 * F[0] + l2 * F[1] + l3 * F[2])[inside])
    # bleed a few texels past the islands' edges
    for _ in range(4):
        grow = np.maximum.reduce([np.roll(img, s, a) for a in (0, 1) for s in (1, -1)])
        img = np.maximum(img, grow * (img == 0))
    im = bpy.data.images.new("T_HandMask", SIZE, SIZE, alpha=False, float_buffer=False)
    im.colorspace_settings.name = 'Non-Color'
    rgba = np.ones((SIZE, SIZE, 4), np.float32)
    rgba[..., 0] = rgba[..., 1] = rgba[..., 2] = img
    im.pixels.foreach_set(rgba.ravel())
    im.update()
    out = os.path.join(ART, 'T_HandMask.png')
    im.filepath_raw = out
    im.file_format = 'PNG'
    im.save()
    print('handmask: %d of %d vertices gloved; wrote %s' % (int((val > 0.5).sum()), len(val), out))


if __name__ == '__main__':
    main()
