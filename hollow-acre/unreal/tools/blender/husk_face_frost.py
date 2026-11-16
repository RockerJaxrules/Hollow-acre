"""Where the cold has killed the husk's face: frostbite on the rims and lobes of its ears and on its lips, as a mask in the face's own UV space (black core 1, bruised edge about 0.5, healthy 0).
The face material (Scripts/import_husk.py, M_HuskFaceSkin) blackens the skin by it.
Reads Saved/Generated/Husk/face.fbx (the MetaHuman face, exported by Scripts/husk_export_mh.py); writes
SourceArt/T_HuskFaceFrost.png.
Run: blender -b --factory-startup --python husk_face_frost.py -- <Saved/Generated/Husk> <SourceArt>
"""
import math
import os
import random
import sys

import bpy
import numpy as np
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
GEN = os.path.abspath(ARGS[0] if ARGS else '.')
ART = os.path.abspath(ARGS[1] if len(ARGS) > 1 else '.')
SIZE = 1024


def log(*a):
    print('frost:', *a)


def smooth01(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def blob(p, c, r_full, r_zero):
    """1 within r_full of c, fading to 0 at r_zero."""
    return smooth01((r_zero - (p - c).length) / max(r_zero - r_full, 1e-5))


def frost(p, bones, rnd):
    """How dead the skin at p is (0..1). The face looks down -Y, its left is +X, metres."""
    v = 0.0
    # the ears: their rims and lobes, from how far out from the head they reach
    ax = abs(p.x)
    if ax > 0.07 and p.y > -0.035 and 2.03 < p.z < 2.14:
        v = max(v, smooth01((ax - 0.078) / 0.018) * 0.95 + smooth01((2.068 - p.z) / 0.012) * smooth01((ax - 0.072) / 0.01) * 0.6)
    # the lips: dark, cracked
    lip = Vector((0.0, -0.116, 2.042))
    d = Vector(((p.x - lip.x) / 0.034, (p.y - lip.y) / 0.03, (p.z - lip.z) / 0.017))
    if p.y < -0.085:
        v = max(v, 0.75 * smooth01(1.15 - d.length))
    return min(1.0, v)


def main():
    import husk_fangs
    sys.argv = [sys.argv[0], '--', GEN]
    arm, face = husk_fangs.load_face()
    bones = {b.name: b.head_local.copy() for b in arm.data.bones}
    me = face.data
    rnd = random.Random(11)
    # rough-edged: a little noise on every point, so the dead patches are not perfect circles
    noise = np.array([rnd.uniform(-0.12, 0.12) for _ in me.vertices], np.float32)
    val = np.array([frost(v.co, bones, rnd) for v in me.vertices], np.float32)
    val = np.clip(val + noise * (val > 0.05) * (val < 0.95), 0, 1)
    log('vertices', len(val), 'frostbitten (>0.5)', int((val > 0.5).sum()))
    head = {i for i, m in enumerate(me.materials) if m and 'skin' in m.name.lower()}     # the face's skin (not its teeth, eyes...)
    uv = me.uv_layers[0].data
    me.calc_loop_triangles()
    img = np.zeros((SIZE, SIZE), np.float32)
    cov = np.zeros((SIZE, SIZE), bool)
    for t in me.loop_triangles:
        if head and t.material_index not in head:
            continue
        P = np.array([uv[li].uv for li in t.loops], np.float64) * SIZE - 0.5
        F = val[list(t.vertices)]
        x0, y0 = np.floor(P.min(0)).astype(int)
        x1, y1 = np.ceil(P.max(0)).astype(int)
        x0, y0, x1, y1 = max(x0, 0), max(y0, 0), min(x1, SIZE - 1), min(y1, SIZE - 1)
        if x1 < x0 or y1 < y0:
            continue
        ys, xs = np.mgrid[y0:y1 + 1, x0:x1 + 1]
        (ax_, ay), (bx, by), (cx, cy) = P
        den = (by - cy) * (ax_ - cx) + (cx - bx) * (ay - cy)
        if abs(den) < 1e-12:
            continue
        l1 = ((by - cy) * (xs - cx) + (cx - bx) * (ys - cy)) / den
        l2 = ((cy - ay) * (xs - cx) + (ax_ - cx) * (ys - cy)) / den
        l3 = 1 - l1 - l2
        inside = (l1 >= -1e-3) & (l2 >= -1e-3) & (l3 >= -1e-3)
        img[ys[inside], xs[inside]] = (l1 * F[0] + l2 * F[1] + l3 * F[2])[inside]
        cov[ys[inside], xs[inside]] = True
    # bleed past the islands' edges, so filtering never pulls healthy skin into a dead patch's border
    for _ in range(6):
        grow = np.zeros_like(img)
        n = np.zeros_like(img)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            grow += np.roll(np.roll(img * cov, dy, 0), dx, 1)
            n += np.roll(np.roll(cov.astype(np.float32), dy, 0), dx, 1)
        add = (~cov) & (n > 0)
        img[add] = grow[add] / n[add]
        cov |= add
    log('texels frostbitten', int((img > 0.5).sum()))
    im = bpy.data.images.new('T_HuskFaceFrost', SIZE, SIZE, alpha=False, float_buffer=False)
    rgba = np.ones((SIZE, SIZE, 4), np.float32)
    rgba[..., 0] = rgba[..., 1] = rgba[..., 2] = img          # rows bottom-up, as UV v runs
    im.colorspace_settings.name = 'Non-Color'
    im.pixels.foreach_set(rgba.ravel())
    im.update()
    out = os.path.join(ART, 'T_HuskFaceFrost.png')
    im.filepath_raw = out
    im.file_format = 'PNG'
    im.save()
    log('wrote', out)


if __name__ == '__main__':
    main()
