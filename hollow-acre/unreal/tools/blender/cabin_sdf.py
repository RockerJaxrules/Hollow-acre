"""Collision for the driver: a signed distance field of the cabin around the driver's seat.

Every car part built in the scene (dash, cluster, column, stalks, door card, seat, glass...) except the steering wheel's
rim, pad and spokes (the arms solver has those exactly) is gathered into one BVH; for each point of a half-centimetre grid
the distance to the nearest surface is stored, negative inside a part (by the nearest face's outward normal). Spaces a
real car closes off but the model leaves open (the cavity between the door card and the door's outer skin) are added as
solid boxes, unioned in (the smaller distance wins). The
DriverArms actor in Unreal loads it and keeps the hands' and arms' skin out of every part.

File (little-endian): b'HSDF', u32 version, u32 nx, ny, nz, f32 lo x, y, z, f32 cell (cm), f32 unit (cm per step),
u32 raw bytes, u32 packed bytes, then zlib(int8[nz][ny][nx]) with x fastest. Values are clamped to +-127 units.
"""
import struct
import time
import zlib

import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

LO = (-15.0, -48.0, 60.0)       # car frame (cm): the driver's arms and hands, the wheel, the door card, the seat front
HI = (75.0, 40.0, 130.0)
CELL = 0.5
UNIT = 0.05                      # 0.5 mm per step: +-6.35 cm
SKIP = {'rim', 'wheel_pad', 'spoke'}


def box_dist(p, lo, hi):
    """Signed distance to an axis-aligned box (negative inside)."""
    q = [max(lo[a] - p[a], p[a] - hi[a]) for a in range(3)]
    out = sum(max(c, 0.0) ** 2 for c in q) ** 0.5
    return out + min(max(q), 0.0)


def build(path, solids=()):
    t0 = time.time()
    deps = bpy.context.evaluated_depsgraph_get()
    pad = 127 * UNIT + 1.0
    verts, polys = [], []
    used = 0
    for obj in bpy.context.scene.objects:
        if obj.type != 'MESH' or obj.get('cutter') or obj.name.split('.')[0] in SKIP:
            continue
        mw = obj.matrix_world
        corners = [mw @ Vector(c) for c in obj.bound_box]
        if any(max(c[a] for c in corners) < LO[a] - pad or min(c[a] for c in corners) > HI[a] + pad for a in range(3)):
            continue
        ev = obj.evaluated_get(deps)
        me = ev.to_mesh()
        base = len(verts)
        verts.extend(mw @ v.co for v in me.vertices)
        polys.extend([base + i for i in p.vertices] for p in me.polygons)
        ev.to_mesh_clear()
        used += 1
    bvh = BVHTree.FromPolygons(verts, polys, all_triangles=False)
    nx, ny, nz = (int(round((HI[a] - LO[a]) / CELL)) + 1 for a in range(3))
    out = bytearray(nx * ny * nz)
    far = 127 * UNIT
    i = 0
    inside = 0
    for k in range(nz):
        z = LO[2] + k * CELL
        for j in range(ny):
            y = LO[1] + j * CELL
            for ii in range(nx):
                p = Vector((LO[0] + ii * CELL, y, z))
                loc, nrm, _, d = bvh.find_nearest(p, far)
                dist = far if loc is None else (-d if (p - loc).dot(nrm) < 0.0 else d)
                for lo, hi in solids:
                    dist = min(dist, box_dist(p, lo, hi))
                q = max(-127, min(127, int(round(dist / UNIT))))
                inside += q < 0
                out[i] = q & 0xFF
                i += 1
    packed = zlib.compress(bytes(out), 6)
    with open(path, 'wb') as fh:
        fh.write(b'HSDF')
        fh.write(struct.pack('<4I', 1, nx, ny, nz))
        fh.write(struct.pack('<5f', LO[0], LO[1], LO[2], CELL, UNIT))
        fh.write(struct.pack('<2I', len(out), len(packed)))
        fh.write(packed)
    print('cabin_sdf: %d parts, %d x %d x %d cells (%.1f%% inside parts), %d KB, %.0f s'
          % (used, nx, ny, nz, 100.0 * inside / len(out), len(packed) // 1024, time.time() - t0))
