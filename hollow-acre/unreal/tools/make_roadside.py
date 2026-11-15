"""Roadside hardware for the mountain road (our own work), built along the road from make_mountain's road frame.

  - A steel W-beam guardrail on the valley side. The rail follows the AASHTO M-180 profile: 312 mm deep, 83 mm
    corrugation, two crests toward the road, top edge at 787 mm. It is blocked out from steel I-beam posts every 1.905 m.
    Snow lies along its top and caps the posts. It is smashed through in one place, with the torn ends bent out over
    the drop.
  - The posts are a separate mesh: an I-beam with a wooden blockout, bolt heads and a snow cap.
References (study only): FHWA standard drawings for W-beam guardrail on steel posts.

Called by make_mountain.py. Writes into HollowAcre/Saved/Generated:
  Guardrail.obj   the rail and the snow on it (material slots steel, snow)
  GuardPost.obj   one post: local X along the road, -Y toward the road, Z up, ground at 0 (slots steel, wood, snow)
"""
import math
import os
import random

import numpy as np

import make_mountain as mm

RAIL_TOP = 0.787
RAIL_DEPTH = 0.312
CORR = 0.083
THICK = 0.003
POST_D = -(mm.HALF + 1.1)                       # the posts' line (d across the road; negative = the valley side)
RAIL_D = POST_D + 0.075 + 0.2 + CORR / 2        # the rail's centre plane: post flange + 200 mm blockout toward the road
GAP = (516.0, 552.0)                            # where something went through: no rail, no posts
SPACING = 1.905
Z = np.array([0.0, 0.0, 1.0])


def w_profile(n=26):
    """(y toward the road, z, dy/dz) across the W-beam's face, bottom to top: two crests toward the traffic at
    +-80 mm, a valley between, the edges turned back."""
    z = np.linspace(-RAIL_DEPTH / 2, RAIL_DEPTH / 2, n)
    k = 2 * np.pi / 0.16
    return -CORR / 2 * np.cos(k * z), z, CORR / 2 * k * np.sin(k * z)


def orient(v, tris, ref):
    """Flip triangles whose naive cross product points against ref (one vector per vertex)."""
    a, b, c = v[tris[:, 0]], v[tris[:, 1]], v[tris[:, 2]]
    fn = np.cross(b - a, c - a)
    rv = ref[tris[:, 0]] + ref[tris[:, 1]] + ref[tris[:, 2]]
    flip = np.einsum('ij,ij->i', fn, rv) < 0
    tris = tris.copy()
    tris[flip] = tris[flip][:, ::-1]
    return tris


def grid(rows, cols):
    t = []
    for i in range(rows - 1):
        for j in range(cols - 1):
            a, b, c, d = i * cols + j, i * cols + j + 1, (i + 1) * cols + j, (i + 1) * cols + j + 1
            t += [(a, c, b), (b, c, d)]
    return np.array(t, np.int64)


def smooth_noise(r, n, amp, width=5):
    v = np.array([r.uniform(-1, 1) for _ in range(n + width)])
    k = np.hanning(width + 2)[1:-1]
    k /= k.sum()
    return 1 + amp * np.convolve(v, k, 'valid')[:n]


def rail_run(frame, s_list, gap_ends, r):
    """One continuous run of rail: front and back faces of the thin W sheet, its top and bottom edges, and the snow
    lying along its top. The ends next to the gap are bent out over the drop and down."""
    y, zp, dy = w_profile()
    n = len(zp)
    rows_f, rows_b, refs = [], [], []
    tops = []
    for s in s_list:
        x, yy, z, t = frame(s, RAIL_D)
        g = float(mm.corridor_height(s, POST_D))
        lv = np.array([math.sin(t), -math.cos(t), 0.0])      # toward the road
        c = np.array([x, yy, z + g + RAIL_TOP - RAIL_DEPTH / 2])
        # bent ends at the gap: pushed out over the drop and sagging
        for e in gap_ends:
            dist = abs(s - e)
            if dist < 7.0:
                k = (1 - dist / 7.0) ** 2
                c = c - lv * 0.9 * k - Z * 0.25 * k
        front = c + np.outer(y, lv) + np.outer(zp, Z)
        rows_f.append(front)
        rows_b.append(front - lv * THICK)
        refs.append(np.tile(lv, (n, 1)))
        tops.append((c, lv, t))
    F = np.concatenate(rows_f)
    B = np.concatenate(rows_b)
    R = np.concatenate(refs)
    m = len(s_list)
    T = grid(m, n)
    uv = np.stack(np.meshgrid(np.array(s_list) / 2.0, np.arange(n) / (n - 1), indexing='ij'), -1).reshape(-1, 2)
    steel = [(F, uv, orient(F, T, R)), (B, uv, orient(B, T, -R))]
    # the sheet's top and bottom edges (3 mm strips)
    for j, sgn in ((n - 1, 1.0), (0, -1.0)):
        E = np.stack([F.reshape(m, n, 3)[:, j], B.reshape(m, n, 3)[:, j]], 1).reshape(-1, 3)
        ref = np.tile(Z * sgn, (len(E), 1))
        steel.append((E, np.zeros((len(E), 2)), orient(E, grid(m, 2), ref)))

    # snow along the top edge: a lumpy ridge, broken here and there, 4-10 cm high
    snow = []
    hw = 0.055 * smooth_noise(r, m, 0.45, 9)
    ht = 0.07 * smooth_noise(r, m, 0.6, 7)
    keep = smooth_noise(r, m, 1.0, 11) > 0.55
    k = 9
    th = np.linspace(0, np.pi, k)
    i = 0
    while i < m:
        if not keep[i]:
            i += 1
            continue
        j = i
        while j < m and keep[j]:
            j += 1
        if j - i >= 3:
            ring = []
            for q in range(i, j):
                c, lv, t = tops[q]
                taper = math.sin(math.pi * (q - i + 0.5) / (j - i)) ** 0.4
                top = c + Z * (RAIL_DEPTH / 2 - 0.01) - lv * 0.025
                ring.append(top + np.outer(np.cos(th) * hw[q] * taper, lv) + np.outer(np.sin(th) * ht[q] * taper + 0.005, Z))
            V = np.concatenate(ring)
            cen = np.repeat(np.array([tops[q][0] + Z * (RAIL_DEPTH / 2 - 0.03) for q in range(i, j)]), k, axis=0)
            snow.append((V, np.stack(np.meshgrid(np.arange(j - i) * 0.5, th / np.pi, indexing='ij'), -1).reshape(-1, 2),
                         orient(V, grid(j - i, k), V - cen)))
        i = j
    return steel, snow


def box(x0, x1, y0, y1, z0, z1):
    """An axis box as six separate faces (flat shading), outward winding."""
    v, tris, uv = [], [], []
    faces = [((x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1), (0, -1, 0)),
             ((x1, y1, z0), (x0, y1, z0), (x0, y1, z1), (x1, y1, z1), (0, 1, 0)),
             ((x0, y1, z0), (x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (-1, 0, 0)),
             ((x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1), (1, 0, 0)),
             ((x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1), (0, 0, 1)),
             ((x0, y1, z0), (x1, y1, z0), (x1, y0, z0), (x0, y0, z0), (0, 0, -1))]
    for a, b, c, d, nn in faces:
        k = len(v)
        v += [a, b, c, d]
        uv += [(0, 0), (1, 0), (1, 1), (0, 1)]
        q = np.array([a, b, c, d], float)
        t = np.array([(k, k + 1, k + 2), (k, k + 2, k + 3)])
        ref = np.tile(np.array(nn, float), (len(v), 1))
        tris.append(orient(np.array(v, float), t, ref))
    return np.array(v, float), np.array(uv, float), np.concatenate(tris)


def lump(c, rx, ry, rz, r, rings=5, segs=10):
    """A smooth, slightly uneven dome of snow."""
    v = []
    p0, p1 = r.uniform(0, 6.3), r.uniform(0, 6.3)
    for i in range(rings + 1):
        th = (math.pi / 2) * i / rings
        for j in range(segs):
            ph = 2 * math.pi * j / segs
            w = 1 + 0.12 * math.sin(3 * ph + p0) + 0.08 * math.sin(2 * ph + p1)
            v.append(c + np.array([math.cos(ph) * math.cos(th) * rx * w, math.sin(ph) * math.cos(th) * ry * w,
                                   math.sin(th) * rz - rz * 0.25]))
    v = np.array(v)
    t = []
    for i in range(rings):
        for j in range(segs):
            a, b = i * segs + j, i * segs + (j + 1) % segs
            t += [(a, b, b + segs), (a, b + segs, a + segs)]
    t = np.array(t)
    return v, np.zeros((len(v), 2)), orient(v, t, v - c)


def post_mesh(r):
    """A strong steel post (W150 I-beam: 100 mm flanges facing the road, 150 mm deep) standing from below the snow to
    just under the rail's top, a 150 x 200 mm wooden blockout bolted to its road-side flange at the rail's height,
    bolt heads, and snow on top of both."""
    steel, wood, snow = [], [], []
    top = RAIL_TOP - 0.03
    fl, dp, tf, tw = 0.1, 0.15, 0.009, 0.006
    steel.append(box(-fl / 2, fl / 2, -dp / 2, -dp / 2 + tf, -0.5, top))      # road-side flange
    steel.append(box(-fl / 2, fl / 2, dp / 2 - tf, dp / 2, -0.5, top))        # back flange
    steel.append(box(-tw / 2, tw / 2, -dp / 2 + tf, dp / 2 - tf, -0.5, top))  # web
    zc = RAIL_TOP - RAIL_DEPTH / 2
    wood.append(box(-0.075, 0.075, -dp / 2 - 0.2, -dp / 2, zc - 0.18, zc + 0.18))
    # the post bolt through the rail's valley, its head on the road side (local -Y is toward the road)
    valley = -(RAIL_D - POST_D) + CORR / 2
    steel.append(box(-0.014, 0.014, valley - 0.016, valley, zc - 0.014, zc + 0.014))
    snow.append(lump(np.array([0.0, 0.0, top]), 0.075, 0.1, r.uniform(0.05, 0.09), r))
    snow.append(lump(np.array([0.0, -dp / 2 - 0.1, zc + 0.18]), 0.09, 0.11, r.uniform(0.04, 0.07), r))
    return [('steel',) + merge(steel), ('wood',) + merge(wood), ('snow',) + merge(snow)]


def merge(parts):
    vs, uvs, ts, o = [], [], [], 0
    for v, uv, t in parts:
        vs.append(v)
        uvs.append(uv)
        ts.append(t + o)
        o += len(v)
    return np.concatenate(vs), np.concatenate(uvs), np.concatenate(ts)


def build(xs, ys, th, zr, s_arr, out):
    r = random.Random(23)

    def frame(s, d):
        x, y, z, t = mm.frame_at(xs, ys, th, zr, s_arr, s, d)
        return float(x), float(y), float(z), float(t)

    steel, snow = [], []
    runs = [np.arange(3.0, GAP[0] + 1e-6, 0.5), np.arange(GAP[1], mm.LENGTH - 3.0, 0.5)]
    for run in runs:
        st, sn = rail_run(frame, list(run), GAP, r)
        steel += st
        snow += sn
    mm.write_obj(os.path.join(mm.GEN, 'Guardrail.obj'), [('steel',) + merge(steel), ('snow',) + merge(snow)])
    mm.write_obj(os.path.join(mm.GEN, 'GuardPost.obj'), post_mesh(r))
    out['posts'] = []
    for s in np.arange(3.0, mm.LENGTH - 3.0, SPACING):
        if GAP[0] + 1.0 < s < GAP[1] - 1.0:
            continue
        x, y, z, t = frame(s, POST_D)
        g = float(mm.corridor_height(s, POST_D))
        out['posts'].append([x * 100, y * 100, (z + g) * 100, math.degrees(t), 1.0])
    return out
