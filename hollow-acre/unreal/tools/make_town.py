"""The abandoned mining town at the foot of the crash chute (Part 2 starts here): its buildings, all our own models,
built board by board to the sizes of real western mining-camp buildings (HABS/HAER and National Register survey data
for Bodie CA, St. Elmo CO, Garnet MT and Dyea AK: false fronts 4-5 ft above the roof, a 20 x 30 ft saloon, stores to
40 x 65 ft, a 30 x 50 ft two-and-a-half-storey hotel, log and board cabins 12 x 16 to 17 x 20 ft, 4 x 6 ft privies,
25-30 ft poles). Long abandoned: boards gone, windows broken or boarded, roofs sagging under the snow, a porch roof down.

The surfaces are Quixel Megascans (ASSETS_EPIC.md); UVs are in real size (one UV unit is 2 m of a 2 x 2 m scan).

Writes (Unreal frame: X forward, Y right, Z up; centimetres) HollowAcre/Saved/Generated/Town_<Name>.obj, one per
building, each with its origin at the middle of its street front at ground level, facing +X (the street).
Material groups: paintwood (flaky painted planks), barewood (weathered planks), cladding (lap siding), shingles,
tin (rusty corrugated metal), rustmetal (rusty sheet), glass (old window glass), shards (broken glass), dark (the dark
inside, seen through gaps), snow, ice (icicles off the eaves).

Also writes Town_Ground.obj (the ground it stands on) and town.json (where each building stands, where the car is
left), laid out on make_mountain.py's valley floor at the foot of the crash chute.

Run:  python hollow-acre/unreal/tools/make_town.py [names... | layout]
"""
import math
import os
import random
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, '..', 'HollowAcre', 'Saved', 'Generated')
FT = 30.48          # cm in a foot
IN = 2.54
UV_CM = 200.0       # cm of surface per UV unit (the scans are 2 x 2 m)
GRAIN_V = {'barewood', 'drywood'}   # (scans whose planks run up the picture (V); the painted planks and cladding run across it (U))


def rot(yaw=0.0, pitch=0.0, roll=0.0):
    """Rotation matrix (degrees): roll about X, then pitch about Y, then yaw about Z."""
    a, b, c = (math.radians(v) for v in (roll, pitch, yaw))
    Rx = np.array([[1, 0, 0], [0, math.cos(a), -math.sin(a)], [0, math.sin(a), math.cos(a)]])
    Ry = np.array([[math.cos(b), 0, math.sin(b)], [0, 1, 0], [-math.sin(b), 0, math.cos(b)]])
    Rz = np.array([[math.cos(c), -math.sin(c), 0], [math.sin(c), math.cos(c), 0], [0, 0, 1]])
    return Rz @ Ry @ Rx


class Mesh:
    def __init__(self, seed):
        self.groups = {}
        self.r = random.Random(seed)

    def _g(self, mat):
        return self.groups.setdefault(mat, ([], [], []))

    def poly(self, mat, pts, uvs=None, off=(0.0, 0.0), face=None, two=False):
        """A flat polygon (3+ points, counter-clockwise seen from its front), UVs planar in real size if not given;
        turned to face the way face points if given; both sides if two."""
        v, t, f = self._g(mat)
        pts = [np.asarray(p, float) for p in pts]
        if face is not None and np.dot(np.cross(pts[1] - pts[0], pts[-1] - pts[0]), np.asarray(face, float)) < 0:
            pts = pts[::-1]
            if uvs is not None:
                uvs = uvs[::-1]
        if two:
            self.poly(mat, pts[::-1], None if uvs is None else uvs[::-1], off)
        if uvs is None:
            e1 = pts[1] - pts[0]
            n = np.cross(pts[1] - pts[0], pts[-1] - pts[0])
            e1 = e1 / (np.linalg.norm(e1) + 1e-9)
            e2 = np.cross(n / (np.linalg.norm(n) + 1e-9), e1)
            uvs = [((np.dot(p - pts[0], e1)) / UV_CM + off[0], (np.dot(p - pts[0], e2)) / UV_CM + off[1]) for p in pts]
        base = len(v)
        v.extend(pts)
        t.extend(uvs)
        for k in range(1, len(pts) - 1):
            f.append((base, base + k, base + k + 1))

    def box(self, mat, center, size, R=None, off=None, mats=None):
        """A box (size: x, y, z in cm) about its centre, turned by R. mats: per-face materials (+x -x +y -y +z -z)."""
        R = np.eye(3) if R is None else R
        c = np.asarray(center, float)
        hx, hy, hz = (s / 2.0 for s in size)
        P = lambda x, y, z: c + R @ np.array([x, y, z])
        o = off if off is not None else (self.r.random(), self.r.random())
        faces = [  # (points, material index)
            ([P(hx, -hy, -hz), P(hx, hy, -hz), P(hx, hy, hz), P(hx, -hy, hz)], 0),
            ([P(-hx, hy, -hz), P(-hx, -hy, -hz), P(-hx, -hy, hz), P(-hx, hy, hz)], 1),
            ([P(hx, hy, -hz), P(-hx, hy, -hz), P(-hx, hy, hz), P(hx, hy, hz)], 2),
            ([P(-hx, -hy, -hz), P(hx, -hy, -hz), P(hx, -hy, hz), P(-hx, -hy, hz)], 3),
            ([P(-hx, -hy, hz), P(hx, -hy, hz), P(hx, hy, hz), P(-hx, hy, hz)], 4),
            ([P(-hx, hy, -hz), P(hx, hy, -hz), P(hx, -hy, -hz), P(-hx, -hy, -hz)], 5),
        ]
        for pts, k in faces:
            self.poly(mats[k] if mats else mat, pts, off=o)

    def board(self, mat, a, b, width, thick, normal, jitter=0.0, droop=0.0):
        """A board from a to b (its length), width across, thick out along normal; a little crooked if jitter."""
        a, b, n = np.asarray(a, float), np.asarray(b, float), np.asarray(normal, float)
        L = np.linalg.norm(b - a)
        x = (b - a) / L
        n = n - x * np.dot(n, x)
        n /= np.linalg.norm(n)
        y = np.cross(n, x)
        R = np.stack([x, y, n], 1)
        if jitter:
            R = R @ rot(self.r.gauss(0, jitter), self.r.gauss(0, jitter * 0.3), self.r.gauss(0, jitter * 0.5))
        c = (a + b) / 2 + n * thick / 2 - n * droop
        if mat in GRAIN_V:
            # (a scan whose planks stand upright in the picture: the board turned in its own plane so the picture's
            # grain runs down its length, not across it; across it every board read as a stack of square tiles)
            R = np.stack([R[:, 1], -R[:, 0], R[:, 2]], 1)
            self.box(mat, c, (width, L, thick), R)
            return
        self.box(mat, c, (L, width, thick), R)

    def write(self, path):
        with open(path, 'w') as fo:
            fo.write('# Hollow Acre: %s (tools/make_town.py)\n' % os.path.basename(path))
            # (one object, a material section per surface: an object per surface comes in as separate meshes named
            # after the surfaces, each building's overwriting the last's)
            fo.write('o %s\n' % os.path.splitext(os.path.basename(path))[0])
            vi = 1
            for mat, (v, t, f) in self.groups.items():
                if not f:
                    continue
                fo.write('usemtl %s\n' % mat)
                for p in v:
                    fo.write('v %.3f %.3f %.3f\n' % (p[0], -p[1], p[2]))     # (as make_mountain.py: Unreal's import mirrors Y)
                for uv in t:
                    fo.write('vt %.5f %.5f\n' % (uv[0], uv[1]))
                for a, b, c in f:
                    # (mirroring Y flips handedness: the winding is reversed to keep faces pointing out)
                    fo.write('f %d/%d %d/%d %d/%d\n' % (c + vi, c + vi, b + vi, b + vi, a + vi, a + vi))
                vi += len(v)
        tris = sum(len(f) for v, t, f in self.groups.values())
        print('%s: %d triangles, %s' % (os.path.basename(path), tris, ', '.join(sorted(self.groups))))


# ---------------------------------------------------------------------------------------------------------------------
# walls: a wall is a rectangle in a plane (origin o, along u, up w, outward n), clad in boards, with openings cut in it

class Wall:
    def __init__(self, o, u, w, n, length, height, gable=None):
        self.o, self.u, self.w, self.n = (np.asarray(v, float) for v in (o, u, w, n))
        self.length, self.height = length, height
        self.gable = gable          # (peak height at the middle) for a gable-end wall
        self.openings = []          # (u0, u1, z0, z1)

    def P(self, a, z, out=0.0):
        return self.o + self.u * a + self.w * z + self.n * out

    def top(self, a):
        if not self.gable:
            return self.height
        m = self.length / 2
        return self.height + (self.gable - self.height) * (1 - abs(a - m) / m)

    def open(self, u0, u1, z0, z1):
        self.openings.append((u0, u1, z0, z1))

    def spans(self, a0, a1, z0, z1):
        """The parts of the strip a0..a1 from z0 to z1 left after the openings are cut out (vertical runs)."""
        cuts = [(o[2], o[3]) for o in self.openings if o[0] < a1 and o[1] > a0]
        runs, z = [], z0
        for c0, c1 in sorted(cuts):
            if c0 > z:
                runs.append((z, min(c0, z1)))
            z = max(z, c1)
        if z < z1:
            runs.append((z, z1))
        return [r for r in runs if r[1] - r[0] > 4]


def clad_vertical(m, wall, mat, board=25.0, batten=6.0, gaps=0.0, missing=0.0, z0=0.0, thick=2.2):
    """Board-and-batten: vertical boards with battens over the joints; some boards gone (the dark shows), some loose."""
    a = 0.0
    k = 0
    while a < wall.length - 1:
        bw = min(board * m.r.uniform(0.85, 1.15), wall.length - a)
        mid = a + bw / 2
        top = wall.top(mid)
        for zs, ze in wall.spans(a, a + bw, z0, top):
            if m.r.random() < missing:
                continue
            lean = m.r.random() < missing * 0.5
            p0, p1 = wall.P(mid, zs), wall.P(mid, ze - (m.r.uniform(10, 60) if lean else 0))
            m.board(mat, p0, p1, bw - gaps, thick, wall.n, jitter=0.6 if lean else 0.15)
        a += bw
        k += 1
        if a < wall.length - 1:
            for zs, ze in wall.spans(a - batten / 2, a + batten / 2, z0, wall.top(a)):
                if m.r.random() < missing * 0.7:
                    continue
                m.board(mat, wall.P(a, zs, thick), wall.P(a, ze, thick), batten, 1.8, wall.n, jitter=0.1)


def clad_lap(m, wall, mat, exposure=13.0, thick=1.8, missing=0.0, z0=0.0):
    """Lap siding (rustic/drop): horizontal boards, each lapping the one below, tilted out at its foot."""
    z = z0
    while z < wall.height + (wall.gable or 0) - 1:
        h = exposure + 2.5
        # the run of the board at this height (cut by openings and the gable)
        a = 0.0
        while a < wall.length - 1:
            # find the next stretch clear of openings at this height
            blocked = [o for o in wall.openings if o[2] < z + h and o[3] > z and o[1] > a]
            if blocked:
                b0 = min(o[0] for o in blocked)
                if b0 <= a + 1:
                    a = max(o[1] for o in blocked if o[0] <= a + 1)
                    continue
                b = b0
            else:
                b = wall.length
            # within the gable, the board runs only under the slope
            if wall.gable and z > wall.height:
                m_ = wall.length / 2
                half = m_ * (1 - (z + h * 0.5 - wall.height) / (wall.gable - wall.height))
                if half <= 2:
                    break
                a, b = max(a, m_ - half), min(b, m_ + half)
                if b <= a:
                    break
            if b - a > 5 and m.r.random() >= missing:
                tilt = wall.n * 0.6
                p0, p1 = wall.P(a, z + h / 2, 0.8), wall.P(b, z + h / 2, 0.8)
                m.board(mat, p0, p1, h, thick, wall.n + wall.w * 0.03, jitter=0.12)
            a = b + 0.1
            if b >= wall.length - 1:
                break
        z += exposure


def inner_dark(m, wall, inset=6.0):
    """The dark inside behind a wall (seen through missing boards and broken panes). On a building that can be walked
    into (cut_doors: the tool shed, Part 2's first shelter), its doorways are cut out of it, so the doorway is open."""
    if getattr(wall, 'no_dark', False):
        return                                   # (a real inside behind it: its gaps show the night outside)
    L, H = wall.length, wall.top(wall.length / 2)
    doors = [o for o in wall.openings if o[2] <= 1.0] if getattr(wall, 'cut_doors', False) else []
    if not doors:
        m.poly('dark', [wall.P(0, 0, -inset), wall.P(L, 0, -inset), wall.P(L, wall.top(L), -inset), wall.P(L / 2, H, -inset),
                        wall.P(0, wall.top(0), -inset)][::1])
        return
    # (round the doorway: the wall's dark either side of it, and above it)
    u0, u1, z0, z1 = doors[0]
    m.poly('dark', [wall.P(0, 0, -inset), wall.P(u0, 0, -inset), wall.P(u0, wall.top(u0), -inset), wall.P(0, wall.top(0), -inset)])
    m.poly('dark', [wall.P(u1, 0, -inset), wall.P(L, 0, -inset), wall.P(L, wall.top(L), -inset), wall.P(u1, wall.top(u1), -inset)])
    m.poly('dark', [wall.P(u0, z1, -inset), wall.P(u1, z1, -inset), wall.P(u1, wall.top(u1), -inset), wall.P(u0, wall.top(u0), -inset)])


def window(m, wall, a0, z0, w, h, state='broken', panes=(2, 2), trimmat='paintwood'):
    """A double-hung window: casing, sill, two sashes with muntins; its glass whole, broken (jagged shards left in the
    frames, a dark hole), gone, or boarded over."""
    wall.open(a0, a0 + w, z0, z0 + h)
    t = 9.0          # casing width
    # casing and sill
    m.board(trimmat, wall.P(a0 - t / 2, z0 - 4, 2), wall.P(a0 - t / 2, z0 + h + t, 2), t, 2.5, wall.n)
    m.board(trimmat, wall.P(a0 + w + t / 2, z0 - 4, 2), wall.P(a0 + w + t / 2, z0 + h + t, 2), t, 2.5, wall.n)
    m.board(trimmat, wall.P(a0 - t, z0 + h + t / 2, 2), wall.P(a0 + w + t, z0 + h + t / 2, 2), t, 2.5, wall.n)
    m.box(trimmat, wall.P(a0 + w / 2, z0 - 2, 4), (w + 2 * t + 6, 4.0, 4.0), np.stack([wall.u, wall.n, wall.w], 1))
    # the dark room behind it (none where the room is real: the shed)
    if not getattr(wall, 'no_dark', False):
        m.poly('dark', [wall.P(a0, z0, -30), wall.P(a0 + w, z0, -30), wall.P(a0 + w, z0 + h, -30), wall.P(a0, z0 + h, -30)])
    for side in (wall.u, -wall.u):
        pass
    # the jambs (the wall's thickness inside the opening)
    for a in (a0, a0 + w):
        m.poly('barewood', [wall.P(a, z0, 2), wall.P(a, z0, -12), wall.P(a, z0 + h, -12), wall.P(a, z0 + h, 2)], two=True)
    if state == 'boarded_gap':
        # (boarded over, a hand's width left open between the boards across its middle: the night through it)
        for zc, ang, bw in ((z0 + 11.0, -4.0, 22.0), (z0 + h - 12.0, 5.0, 21.0), (z0 + h * 0.5 - 15.0, -9.0, 9.0)):
            dz = math.tan(math.radians(ang)) * (w + 20) / 2
            m.board('barewood', wall.P(a0 - 10, zc - dz, 5), wall.P(a0 + w + 10, zc + dz, 5), bw, 2.2, wall.n, jitter=0.15)
        return
    if state == 'boarded':
        n = m.r.randint(3, 4)
        for i in range(n):
            zc = z0 + h * (i + 0.5) / n + m.r.uniform(-4, 4)
            ang = m.r.uniform(-12, 12)
            dz = math.tan(math.radians(ang)) * (w + 20) / 2
            m.board('barewood', wall.P(a0 - 10, zc - dz, 5), wall.P(a0 + w + 10, zc + dz, 5), m.r.uniform(15, 22), 2.2, wall.n, jitter=0.4)
        return
    if state == 'gone':
        return
    # two sashes, upper over lower, each with its muntins; the frames are thin boards
    sh = h / 2
    for k in range(2):
        zb = z0 + k * sh
        out = 1.0 if k == 0 else -1.0
        fr = 4.5
        for (p, q, wd) in (((a0, zb + fr / 2), (a0 + w, zb + fr / 2), fr), ((a0, zb + sh - fr / 2), (a0 + w, zb + sh - fr / 2), fr),
                           ((a0 + fr / 2, zb), (a0 + fr / 2, zb + sh), fr), ((a0 + w - fr / 2, zb), (a0 + w - fr / 2, zb + sh), fr)):
            m.board(trimmat, wall.P(p[0], p[1], out - 4), wall.P(q[0], q[1], out - 4), wd, 3.0, wall.n)
        cols = panes[0]
        for c in range(1, cols):
            a = a0 + w * c / cols
            m.board(trimmat, wall.P(a, zb, out - 4), wall.P(a, zb + sh, out - 4), 2.2, 2.5, wall.n)
        # the panes
        for c in range(cols):
            pa0, pa1 = a0 + fr + (w - 2 * fr) * c / cols, a0 + fr + (w - 2 * fr) * (c + 1) / cols
            pz0, pz1 = zb + fr, zb + sh - fr
            if state == 'broken' and m.r.random() < 0.75:
                # jagged shards left in the corners of the frame
                for corner in ((pa0, pz0), (pa1, pz0), (pa1, pz1), (pa0, pz1)):
                    if m.r.random() < 0.6:
                        cx = (pa0 + pa1) / 2 + (corner[0] - (pa0 + pa1) / 2) * m.r.uniform(0.2, 0.6)
                        cz = (pz0 + pz1) / 2 + (corner[1] - (pz0 + pz1) / 2) * m.r.uniform(0.2, 0.6)
                        ex = wall.P(corner[0], cz, out - 3.5)
                        ey = wall.P(cx, corner[1], out - 3.5)
                        m.poly('shards', [wall.P(corner[0], corner[1], out - 3.5), ey, ex], two=True)
            else:
                m.poly('glass', [wall.P(pa0, pz0, out - 3.5), wall.P(pa1, pz0, out - 3.5), wall.P(pa1, pz1, out - 3.5), wall.P(pa0, pz1, out - 3.5)])


def door(m, wall, a0, w, h, state='shut', trimmat='paintwood', transom=0.0):
    """A four-panel door in a cased opening (shut, ajar, or gone: the dark inside), with a transom light above."""
    wall.open(a0, a0 + w, 0, h + transom)
    t = 10.0
    m.board(trimmat, wall.P(a0 - t / 2, 0, 2), wall.P(a0 - t / 2, h + transom + t, 2), t, 2.5, wall.n)
    m.board(trimmat, wall.P(a0 + w + t / 2, 0, 2), wall.P(a0 + w + t / 2, h + transom + t, 2), t, 2.5, wall.n)
    m.board(trimmat, wall.P(a0 - t, h + transom + t / 2, 2), wall.P(a0 + w + t, h + transom + t / 2, 2), t, 2.5, wall.n)
    if not getattr(wall, 'cut_doors', False):          # (a building that can be walked into keeps its doorway open)
        m.poly('dark', [wall.P(a0, 0, -60), wall.P(a0 + w, 0, -60), wall.P(a0 + w, h + transom, -60), wall.P(a0, h + transom, -60)])
    for a in (a0, a0 + w):
        m.poly('barewood', [wall.P(a, 0, 2), wall.P(a, 0, -12), wall.P(a, h + transom, -12), wall.P(a, h + transom, 2)], two=True)
    if transom:
        m.board(trimmat, wall.P(a0, h + 2, -2), wall.P(a0 + w, h + 2, -2), 5, 3, wall.n)
        if m.r.random() < 0.5:
            m.poly('glass', [wall.P(a0 + 3, h + 5, -3), wall.P(a0 + w - 3, h + 5, -3), wall.P(a0 + w - 3, h + transom - 2, -3), wall.P(a0 + 3, h + transom - 2, -3)])
    if state == 'gone':
        return
    # the leaf: hinged at a0, swung in by the angle
    ang = {'shut': 0.0, 'ajar': 35.0, 'open': 75.0}.get(state, 0.0)
    hinge = wall.P(a0 + 1, 0, -2)
    du = np.cos(math.radians(ang)) * wall.u - np.sin(math.radians(ang)) * wall.n
    nn = np.cross(wall.w, du)
    nn = nn if np.dot(nn, wall.n) > 0 or ang > 0 else -nn
    leaf_w = w - 2
    c = hinge + du * leaf_w / 2 + wall.w * (h - 1) / 2
    R = np.stack([du, wall.w, np.cross(du, wall.w)], 1)
    m.box(trimmat, c, (leaf_w, h - 1, 4.0), R)
    # its four panels, raised
    for i in range(2):
        for j in range(2):
            pc = hinge + du * (leaf_w * (0.27 + 0.46 * i)) + wall.w * (h * (0.27 + 0.5 * j)) + np.cross(du, wall.w) * 2.4
            m.box(trimmat, pc, (leaf_w * 0.36, h * (0.36 if j else 0.4), 1.2), R)


def icicles(m, a, b, per_m=2.2, longest=45.0):
    """Icicles hanging from an eave from a to b (its underside): thin three-sided cones, most short, a few long, in
    runs where the meltwater dripped (photographs of eaves in a hard winter)."""
    a, b = np.asarray(a, float), np.asarray(b, float)
    L = np.linalg.norm(b - a)
    if L < 1:
        return
    u = (b - a) / L
    n = int(L / 100.0 * per_m * m.r.uniform(0.4, 1.6))
    for _ in range(n):
        p = a + u * m.r.uniform(0, L)
        ln = longest * (m.r.random() ** 2.2) + 5.0
        r = 0.9 + ln * 0.05
        ang0 = m.r.uniform(0, 2 * math.pi)
        top = [p + np.array([r * math.cos(ang0 + k * 2 * math.pi / 3), r * math.sin(ang0 + k * 2 * math.pi / 3), 0.0]) for k in range(3)]
        tip = p + np.array([m.r.uniform(-1.5, 1.5), m.r.uniform(-1.5, 1.5), -ln])
        for k in range(3):
            q0, q1 = top[k], top[(k + 1) % 3]
            out = (q0 + q1) / 2 - p
            out[2] = 0.0
            m.poly('ice', [q0, q1, tip], face=out / (np.linalg.norm(out) + 1e-6))


def gable_roof(m, x0, x1, y0, y1, z_eave, pitch, mat, ridge_along='x', overhang=35.0, sag=0.0, snow=40.0, holes=0, front_overhang=None):
    """A gable roof (sheathing slabs with their surface, fascia boards), sagging along the ridge, under heavy snow."""
    segs = 12
    hole0 = m.r.randint(3, segs - 3 - holes) if holes else -1
    if ridge_along == 'x':
        span, run_a, run_b = y1 - y0, (x0 - overhang, x1 + overhang), None
    else:
        span = x1 - x0
    rise = (span / 2) * math.tan(math.radians(pitch))
    t = 6.0
    for side in (-1, 1):
        for k in range(segs):
            f0, f1 = k / segs, (k + 1) / segs
            sag0 = sag * math.sin(math.pi * f0)
            sag1 = sag * math.sin(math.pi * f1)
            if ridge_along == 'x':
                fo = overhang if front_overhang is None else front_overhang
                xa, xb = (x0 - overhang) + (x1 - x0 + overhang + fo) * f0, (x0 - overhang) + (x1 - x0 + overhang + fo) * f1
                ym = (y0 + y1) / 2
                ye = ym + side * (span / 2 + overhang)
                ze = z_eave - overhang * math.tan(math.radians(pitch))
                zr = z_eave + rise
                P = lambda x, y, z: np.array([x, y, z])
                a, b, c, d = P(xa, ye, ze - sag0 * 0.4), P(xb, ye, ze - sag1 * 0.4), P(xb, ym, zr - sag1), P(xa, ym, zr - sag0)
            else:
                ya, yb = (y0 - overhang) + (y1 - y0 + 2 * overhang) * f0, (y0 - overhang) + (y1 - y0 + 2 * overhang) * f1
                xm = (x0 + x1) / 2
                xe = xm + side * (span / 2 + overhang)
                ze = z_eave - overhang * math.tan(math.radians(pitch))
                zr = z_eave + rise
                P = lambda x, y, z: np.array([x, y, z])
                a, b, c, d = P(xe, ya, ze - sag0 * 0.4), P(xe, yb, ze - sag1 * 0.4), P(xm, yb, zr - sag1), P(xm, ya, zr - sag0)
            if holes and side == 1 and hole0 <= k < hole0 + holes:
                # a hole where the roof gave way under the snow: broken rafters across it, hanging in
                if k == hole0:
                    for j in range(holes + 1):
                        f = (hole0 + j) / segs
                        if ridge_along == 'x':
                            xr = (x0 - overhang) + (x1 - x0 + 2 * overhang) * f
                            ym = (y0 + y1) / 2
                            a_ = np.array([xr, ym, z_eave + rise - sag * math.sin(math.pi * f) - 8])
                            b_ = np.array([xr + m.r.uniform(-20, 20), ym + span / 2 * m.r.uniform(0.4, 0.9), z_eave - m.r.uniform(30, 120)])
                        else:
                            yr = (y0 - overhang) + (y1 - y0 + 2 * overhang) * f
                            xm = (x0 + x1) / 2
                            a_ = np.array([xm, yr, z_eave + rise - sag * math.sin(math.pi * f) - 8])
                            b_ = np.array([xm + span / 2 * m.r.uniform(0.4, 0.9), yr + m.r.uniform(-20, 20), z_eave - m.r.uniform(30, 120)])
                        m.board('barewood', a_, b_, 5.0, 14.0, (0, 0, 1), jitter=3)
                continue
            up = np.array([0, 0, 1.0])
            pts = [a, b, c, d] if side * (1 if ridge_along == 'x' else -1) > 0 else [b, a, d, c]
            nrm = np.cross(pts[1] - pts[0], pts[3] - pts[0])
            if np.dot(nrm, up) < 0:
                pts = pts[::-1]
            m.poly(mat, pts, face=(0, 0, 1))
            # underside, and the sheathing's edge thickness at the eave
            m.poly('barewood', [p - np.array([0, 0, t]) for p in pts], face=(0, 0, -1))
            # icicles off its eave
            icicles(m, a - np.array([0, 0, t]), b - np.array([0, 0, t]))
            # the snow on it: thick, rounded off at the eave, thinner where it slides
            if snow:
                s_pts = [p + np.array([0, 0, snow * (0.6 if i in (0, 1) else 1.0)]) for i, p in enumerate(pts)]
                m.poly('snow', s_pts, face=(0, 0, 1))
        # fascia along the eave and the snow's hanging lip
    return rise


def snow_drift(m, p0, p1, outward, height=45.0, depth=90.0, segs=8):
    """Snow banked against a wall from p0 to p1 (at its foot), sloping out to the ground."""
    p0, p1, o = np.asarray(p0, float), np.asarray(p1, float), np.asarray(outward, float)
    for k in range(segs):
        f0, f1 = k / segs, (k + 1) / segs
        h0 = height * (0.6 + 0.4 * math.sin(math.pi * f0)) * m.r.uniform(0.85, 1.15)
        h1 = height * (0.6 + 0.4 * math.sin(math.pi * f1)) * m.r.uniform(0.85, 1.15)
        a, b = p0 + (p1 - p0) * f0, p0 + (p1 - p0) * f1
        m.poly('snow', [a + o * depth - np.array([0, 0, 5]), b + o * depth - np.array([0, 0, 5]), b + np.array([0, 0, h1]), a + np.array([0, 0, h0])], face=o + np.array([0, 0, 1.0]))


# ---------------------------------------------------------------------------------------------------------------------
# the buildings (each: front wall in the plane x = 0 facing +X, width along Y, the building back toward -X)

def frame_building(m, W, D, H, pitch, front_kind, side_kind, false_front=0.0, sag=0.0, missing=0.05, roofmat='shingles',
                   ridge='x', snow=40.0, holes=0):
    """Four walls on a sill (W wide along Y, D deep back along -X, H to the eaves), clad, with a gable roof, and a
    false front rising above the roof if asked. Returns the walls (front, back, left, right) for openings."""
    hw = W / 2
    walls = {
        'front': Wall((0, -hw, 0), (0, 1, 0), (0, 0, 1), (1, 0, 0), W, H + (false_front if false_front else 0),
                      gable=None if false_front or ridge == 'y' else H + (W / 2) * math.tan(math.radians(pitch))),
        'back': Wall((-D, hw, 0), (0, -1, 0), (0, 0, 1), (-1, 0, 0), W, H,
                     gable=None if ridge == 'y' else H + (W / 2) * math.tan(math.radians(pitch))),
        'left': Wall((-D, -hw, 0), (1, 0, 0), (0, 0, 1), (0, -1, 0), D, H,
                     gable=None if ridge == 'x' else H + (D / 2) * math.tan(math.radians(pitch))),
        'right': Wall((0, hw, 0), (-1, 0, 0), (0, 0, 1), (0, 1, 0), D, H,
                      gable=None if ridge == 'x' else H + (D / 2) * math.tan(math.radians(pitch))),
    }
    return walls


def finish_walls(m, walls, front_kind, side_kind, missing):
    for name, wall in walls.items():
        kind = front_kind if name == 'front' else side_kind
        if kind == 'lap':
            clad_lap(m, wall, 'cladding', missing=missing)
        elif kind == 'paintlap':
            clad_lap(m, wall, 'paintwood', missing=missing)
        else:
            clad_vertical(m, wall, 'barewood', missing=missing)
        if name != 'front' or not (wall.height > 0 and getattr(wall, 'false_front', False)):
            inner_dark(m, wall)
        else:
            # (a false front: the dark only up to the eaves; above them its back shows, boarded)
            lo = Wall(wall.o, wall.u, wall.w, wall.n, wall.length, wall.false_front)
            inner_dark(m, lo)
        # corner boards
        for a in (0.0, wall.length):
            m.board('barewood', wall.P(a, 0, 1.5), wall.P(a, wall.top(a), 1.5), 12, 2.5, wall.n, jitter=0.1)


def sill(m, W, D, h=25.0):
    """The sill timbers and stone underpinning the walls sit on (snow hides most of it)."""
    for (c, s) in (((0 - 10, 0, h / 2), (20, W + 20, h)), ((-D + 10, 0, h / 2), (20, W + 20, h)),
                   ((-D / 2, -W / 2, h / 2), (D, 20, h)), ((-D / 2, W / 2, h / 2), (D, 20, h))):
        m.box('barewood', (c[0], c[1], c[2] - 10), s)


def false_front_store(name, seed, W=9.1, D=15.2, H=12.5, ff=4.5, pitch=37.0, sag=18.0, porch_down=False):
    """A one-storey store with a false front: lap siding on its front, board-and-batten down the sides; a recessed
    double door with a transom between two display windows; a cornice; a plank boardwalk and a porch roof on posts."""
    m = Mesh(seed)
    W, D, H, ff = W * 100, D * 100, H * FT, ff * FT
    ff += (W / 2) * math.tan(math.radians(pitch))          # (above the ridge: the front hides the gable behind it)
    walls = frame_building(m, W, D, H, pitch, 'paintlap', 'bb', false_front=ff)
    walls['front'].false_front = H
    f = walls['front']
    # storefront: display windows either side of a double door with a transom
    dw = 5.5 * FT * 0.5
    door(m, f, W / 2 - dw, 2 * dw, 7.5 * FT, state='ajar', transom=1.5 * FT)
    for side in (-1, 1):
        a0 = W / 2 + side * (W / 4 + dw / 2) - 1.9 * FT
        window(m, f, a0, 2.0 * FT, 3.8 * FT, 6.0 * FT, state=m.r.choice(['broken', 'boarded']), panes=(2, 2))
    # side windows
    for name_, wall in (('left', walls['left']), ('right', walls['right'])):
        for k in range(2):
            window(m, wall, wall.length * (0.3 + 0.4 * k) - 50, 3.0 * FT, 100, 160, state=m.r.choice(['broken', 'boarded', 'gone']), panes=(2, 2))
    finish_walls(m, walls, 'paintlap', 'bb', 0.06)
    sill(m, W, D)
    # the roof behind the false front, sagging, its ridge running back from the street, heavy with snow
    # (the roof stops behind the false front: it never shows through it)
    gable_roof(m, -D, 0, -W / 2, W / 2, H, pitch, 'shingles', ridge_along='x', overhang=30, sag=sag, snow=45, front_overhang=-8)
    # the back of the false front above the roof: plain boards on its studs
    for k in range(int(W / 25) + 1):
        y = -W / 2 + 12 + k * 25
        if y > W / 2 - 5:
            break
        m.board('barewood', np.array([-4.0, y, H]), np.array([-4.0, y, H + ff - 4]), 24, 2.0, (-1, 0, 0), jitter=0.1)
    for y in (-W / 2 + 8, -W / 6, W / 6, W / 2 - 8):
        m.box('barewood', (-9, y, H + ff / 2), (5, 10, ff))
    # the false front: its cap and cornice, and the braces behind it down to the roof
    top = H + ff
    m.box('paintwood', (6, 0, top - 12), (16, W + 30, 24))
    m.box('paintwood', (12, 0, top - 32), (10, W + 20, 10))
    for k in range(9):
        m.box('paintwood', (10, -W / 2 + 20 + (W - 40) * k / 8, top - 20), (8, 10, 16))
    for side in (-0.3, 0.3):
        a = np.array([-8.0, side * W, top - 30])
        b = np.array([-140.0, side * W, H + 60])
        m.board('barewood', a, b, 14, 6, (0, 1, 0), jitter=0.2)
    m.poly('snow', [np.array([4, -W / 2 - 12, top + 2]), np.array([4, W / 2 + 12, top + 2]), np.array([-6, W / 2 + 12, top + 9]), np.array([-6, -W / 2 - 12, top + 9])], face=(0, 0, 1))
    # the boardwalk and the porch roof
    walk_d = 9 * FT
    for k in range(int(W / 18)):
        y = -W / 2 + 9 + k * 18
        if m.r.random() < 0.08:
            continue
        m.board('barewood', np.array([walk_d, y, 22 + m.r.uniform(-1, 1)]), np.array([0, y, 22]), 16.5, 4.5, (0, 0, 1), jitter=0.4)
    for k in range(4):
        m.box('barewood', (walk_d / 2, -W / 2 + W * k / 3, 10), (walk_d, 12, 18))
    post_h = 9.5 * FT
    posts = [-W / 2 + 15, -W / 6, W / 6, W / 2 - 15]
    for i, y in enumerate(posts):
        if porch_down and i == 3:
            # this one gave way: lying in the snow
            m.board('barewood', np.array([walk_d - 15, y, 30]), np.array([walk_d + 200, y + 40, 18]), 14, 14, (0, 0, 1), jitter=2)
            continue
        m.box('paintwood', (walk_d - 15, y, 22 + post_h / 2), (14, 14, post_h))
    # the porch roof: a shed roof from the front wall to the posts (dropped at the end where the post went)
    zf, zp = H - 20, 22 + post_h
    for k in range(6):
        y0, y1 = -W / 2 - 10 + (W + 20) * k / 6, -W / 2 - 10 + (W + 20) * (k + 1) / 6
        d0 = (porch_down and y0 > W / 6) * (y0 - W / 6) / (W / 2) * 120
        d1 = (porch_down and y1 > W / 6) * (y1 - W / 6) / (W / 2) * 120
        pts = [np.array([walk_d + 20, y0, zp - d0]), np.array([walk_d + 20, y1, zp - d1]), np.array([0, y1, zf]), np.array([0, y0, zf])]
        m.poly('tin', pts, face=(0, 0, 1))
        m.poly('barewood', [p - np.array([0, 0, 4]) for p in pts], face=(0, 0, -1))
        m.poly('snow', [p + np.array([0, 0, 18]) for p in pts], face=(0, 0, 1))
    for side in (-1, 1):
        snow_drift(m, (0, -W / 2, 0) if side < 0 else (-D, W / 2, 0), (-D, -W / 2, 0) if side < 0 else (0, W / 2, 0), (0, side, 0))
    return m


def hotel(name, seed, W=9.1, D=15.2, floors=2, pitch=34.0):
    """A two-and-a-half-storey hotel: shiplap walls, a gable roof with its ridge along the street, two chimneys, a
    front door with a transom, windows on both floors (a few still glazed, most broken or boarded), a porch."""
    m = Mesh(seed)
    W, D = W * 100, D * 100
    H = floors * 10.5 * FT
    walls = frame_building(m, W, D, H, pitch, 'lap', 'lap', ridge='y')
    f = walls['front']
    door(m, f, W / 2 - 55, 110, 7 * FT, state='open', transom=1.2 * FT)
    for fl in range(floors):
        for k in range(4):
            a0 = W * (0.12 + 0.24 * k) - 45
            if fl == 0 and abs(a0 + 45 - W / 2) < 120:
                continue
            window(m, f, a0, fl * 10.5 * FT + 2.8 * FT, 90, 165, state=m.r.choice(['broken', 'broken', 'boarded', 'gone', 'whole']), panes=(2, 2))
    for wall in (walls['left'], walls['right']):
        for fl in range(floors):
            for k in range(3):
                window(m, wall, wall.length * (0.18 + 0.3 * k), fl * 10.5 * FT + 2.8 * FT, 85, 160, state=m.r.choice(['broken', 'boarded', 'gone']), panes=(2, 2))
    finish_walls(m, walls, 'lap', 'lap', 0.04)
    sill(m, W, D)
    rise = gable_roof(m, -D, 0, -W / 2, W / 2, H, pitch, 'shingles', ridge_along='y', overhang=35, sag=25, snow=50, holes=1)
    # the half storey's gable windows
    for wall in (walls['left'], walls['right']):
        window(m, wall, wall.length / 2 - 40, H + 60, 80, 120, state='broken', panes=(2, 2))
    # chimneys
    for y in (-W / 4, W / 4):
        m.box('rustmetal', (-D * 0.55, y, H + rise * 0.6 + 60), (55, 45, rise * 1.2 + 120))
    # a porch along the front
    walk_d = 8 * FT
    for k in range(int(W / 18)):
        if m.r.random() < 0.1:
            continue
        y = -W / 2 + 9 + k * 18
        m.board('barewood', np.array([walk_d, y, 40]), np.array([0, y, 40]), 16.5, 4.5, (0, 0, 1), jitter=0.4)
    for y in (-W / 2 + 15, 0.0, W / 2 - 15):
        m.box('paintwood', (walk_d - 15, y, 40 + 140), (14, 14, 280))
    pts = [np.array([walk_d + 20, -W / 2 - 10, 320]), np.array([walk_d + 20, W / 2 + 10, 320]), np.array([0, W / 2 + 10, 360]), np.array([0, -W / 2 - 10, 360])]
    m.poly('tin', pts, face=(0, 0, 1))
    m.poly('barewood', [p - np.array([0, 0, 4]) for p in pts], face=(0, 0, -1))
    m.poly('snow', [p + np.array([0, 0, 20]) for p in pts], face=(0, 0, 1))
    for side in (-1, 1):
        snow_drift(m, (0, -W / 2, 0) if side < 0 else (-D, W / 2, 0), (-D, -W / 2, 0) if side < 0 else (0, W / 2, 0), (0, side, 0), height=60)
    return m


def woodpile(m, x_wall, y0, y1, height=115.0, depth=44.0):
    """A cord of split firewood stacked against a wall outside (photographs of mining-camp and homestead woodpiles under
    snow): rounds 40-46 cm long lying end-out from the wall, split into halves and quarters, about 11-17 cm across, in
    courses up to about 1.15 m, each course settling into the one below; snow on its top and a drift at its foot. In the
    building's frame: the wall's outer face at x_wall, the pile out from it (toward -x), from y0 to y1."""
    r = m.r
    z = 2.0
    course = 0
    while z < height:
        y = y0 + r.uniform(0, 6)
        top = 0.0
        while y < y1 - 8:
            d = r.uniform(11.0, 17.0)
            L = r.uniform(40.0, 46.0)
            n = r.choice((5, 6, 7))
            split = r.random() < 0.6
            # (a split piece: part of a round, its flat face down or to the side; the rest round with bark)
            pts2 = []
            for k in range(n):
                a = 2 * math.pi * k / n + r.uniform(-0.15, 0.15)
                rr = d / 2 * r.uniform(0.86, 1.06)
                py, pz = math.cos(a) * rr, math.sin(a) * rr
                if split and pz < -d * 0.12:
                    pz = -d * 0.12
                pts2.append((py, pz))
            x0 = x_wall - 3.0 - r.uniform(0, 3)
            x1 = x0 - L
            cy, cz = y + d / 2, z + d / 2 - (d * 0.12 if split else 0.0) + r.uniform(-1.0, 1.0)
            ring0 = [np.array([x0, cy + py, cz + pz]) for py, pz in pts2]
            ring1 = [np.array([x1, cy + py + r.uniform(-0.8, 0.8), cz + pz + r.uniform(-0.8, 0.8)]) for py, pz in pts2]
            for k in range(n):
                j = (k + 1) % n
                m.poly('barewood', [ring0[k], ring0[j], ring1[j], ring1[k]],
                       uvs=[(k / n * 0.3, 0.0), ((k + 1) / n * 0.3, 0.0), ((k + 1) / n * 0.3, L / UV_CM), (k / n * 0.3, L / UV_CM)])
            m.poly('drywood', ring1[::-1], face=(-1, 0, 0))       # (the cut end toward the yard: pale end grain)
            m.poly('drywood', ring0, face=(1, 0, 0))
            top = max(top, cz + d / 2)
            y += d * r.uniform(0.92, 1.02)
        z = top - r.uniform(2.0, 4.0)
        course += 1
    # snow on its top and drifted against its foot
    m.poly('snow', [np.array([x_wall - 2, y0 - 4, z + 6]), np.array([x_wall - depth - 6, y0 - 4, z + 3]),
                    np.array([x_wall - depth - 6, y1 + 4, z + 4]), np.array([x_wall - 2, y1 + 4, z + 7])], face=(0, 0, 1))
    snow_drift(m, (x_wall - depth - 4, y0, 0), (x_wall - depth - 4, y1, 0), (-1, 0, 0), height=35)


def cabin(name, seed, W=4.9, D=6.1, H=7.0, pitch=40.0, collapsed=False, wood=False):
    """A one-room miner's cabin of boards: board-and-batten walls, a door in the gable end, one window, a stovepipe;
    if collapsed, its roof has broken through at the middle under the snow."""
    m = Mesh(seed)
    W, D, H = W * 100, D * 100, H * FT
    walls = frame_building(m, W, D, H, pitch, 'bb', 'bb', ridge='x')
    door(m, walls['front'], W / 2 - 40, 80, 6.4 * FT, state='gone' if collapsed else 'ajar')
    window(m, walls['left'], walls['left'].length * 0.5 - 40, 3 * FT, 75, 90, state='boarded' if collapsed else 'broken', panes=(1, 2))
    finish_walls(m, walls, 'bb', 'bb', 0.12 if collapsed else 0.05)
    sill(m, W, D, 20)
    gable_roof(m, -D, 0, -W / 2, W / 2, H, pitch, 'shingles' if not collapsed else 'barewood', ridge_along='x', overhang=25,
               sag=70 if collapsed else 15, snow=40, holes=3 if collapsed else 0)
    m.box('rustmetal', (-D * 0.7, W * 0.2, H + 120), (16, 16, 160))
    snow_drift(m, (0, -W / 2, 0), (-D, -W / 2, 0), (0, -1, 0), height=55)
    snow_drift(m, (-D, W / 2, 0), (0, W / 2, 0), (0, 1, 0), height=55)
    if wood:
        # (its woodpile against the back wall, away from the street, toward the trees: Part 2's firewood)
        woodpile(m, -D - 4.0, -125.0, 125.0)
    return m


def cyl(m, mat, base, r, h, n=12, top=True):
    """An upright cylinder (a can, a jar, a lantern's fount): its foot's centre at base, radius r, height h."""
    b = np.asarray(base, float)
    ring = [np.array([math.cos(2 * math.pi * k / n), math.sin(2 * math.pi * k / n), 0.0]) * r for k in range(n)]
    for k in range(n):
        p0, p1 = b + ring[k], b + ring[(k + 1) % n]
        m.poly(mat, [p0, p1, p1 + np.array([0, 0, h]), p0 + np.array([0, 0, h])],
               uvs=[(k / n * 2 * math.pi * r / UV_CM, 0), ((k + 1) / n * 2 * math.pi * r / UV_CM, 0),
                    ((k + 1) / n * 2 * math.pi * r / UV_CM, h / UV_CM), (k / n * 2 * math.pi * r / UV_CM, h / UV_CM)])
    if top:
        m.poly(mat, [b + np.array([0, 0, h]) + q for q in ring], face=(0, 0, 1))


def shed_clutter(m, W, D):
    """What a mine camp's tool shed keeps (photographs of old miners' tool sheds and blacksmith shops): shelves on the
    wall with cans and jars, a dead lantern; the long tools leaning in a corner, a pick, a shovel, an axe; a saw on a nail;
    an empty wood box by the stove; a crate. In the shed's own frame (the front wall at x 0, the back at -D)."""
    r = m.r
    hw = W / 2
    # two shelves along the right wall (y = +hw) on iron brackets, at 135 and 172 cm, from 1.2 m to 3.0 m back
    for z in (135.0, 172.0):
        m.board('drywood', np.array([-120.0, hw - 15.0, z]), np.array([-300.0, hw - 15.0, z]), 26.0, 2.5, (0, 0, 1), jitter=0.05)
        for x in (-140.0, -210.0, -280.0):
            m.box('dryrust', (x, hw - 6.0, z - 9.0), (2.0, 10.0, 16.0))
    # on them: coffee and tobacco cans, jars, a lantern (its glass sooted), a box
    spots = [(-132, 135, 'can'), (-146, 135, 'can'), (-163, 135, 'jar'), (-190, 135, 'box'), (-228, 135, 'can'), (-243, 135, 'jar'),
             (-262, 135, 'can'), (-286, 135, 'can'), (-138, 172, 'lantern'), (-176, 172, 'jar'), (-196, 172, 'jar'), (-230, 172, 'box'),
             (-268, 172, 'can')]
    for x, z, kind in spots:
        y = hw - 15.0 + r.uniform(-4, 4)
        zb = z + 1.25
        if kind == 'can':
            cyl(m, 'dryrust', (x, y, zb), r.uniform(4.5, 6.5), r.uniform(11, 17))
        elif kind == 'jar':
            cyl(m, 'glass', (x, y, zb), r.uniform(4.0, 5.0), r.uniform(12, 16), n=10)
            cyl(m, 'dryrust', (x, y, zb + 12.0), 4.2, 2.0, n=10)
        elif kind == 'box':
            m.box('drywood', (x, y, zb + 7.0), (r.uniform(16, 24), 18.0, 14.0), rot(r.uniform(-10, 10)))
        else:
            # a kerosene hurricane lantern: its fount, the globe, the frame's wires and top, its bail
            cyl(m, 'dryrust', (x, y, zb), 7.5, 7.0)
            cyl(m, 'glass', (x, y, zb + 7.0), 6.0, 14.0, n=12)
            for k in range(4):
                a_ = math.pi / 2 * k + 0.4
                m.box('dryrust', (x + math.cos(a_) * 7.0, y + math.sin(a_) * 7.0, zb + 14.0), (0.8, 0.8, 16.0))
            cyl(m, 'dryrust', (x, y, zb + 21.0), 5.0, 4.0)
    # the long tools in the front right corner, leaning against the wall: a shovel, a pick, an axe
    def lean(foot, head_at, mat, w, t):
        m.board(mat, np.asarray(foot, float), np.asarray(head_at, float), w, t, (1, 0, 0), jitter=0.0)
    lean((-18, hw - 22, 0), (-12, hw - 4, 138), 'drywood', 3.6, 3.6)               # the shovel's handle
    m.box('dryrust', (-19, hw - 23, 16), (2.0, 22.0, 30.0), rot(0, 0, -7.5))          # its blade, foot down
    lean((-38, hw - 26, 0), (-36, hw - 5, 92), 'drywood', 4.0, 3.2)                 # the pick's handle, head up
    m.box('dryrust', (-36.5, hw - 6, 95), (52.0, 4.0, 4.0), rot(5, 0, 0))             # its head across
    lean((-56, hw - 24, 0), (-52, hw - 5, 80), 'drywood', 3.4, 2.6)                 # the axe's handle
    m.box('dryrust', (-52, hw - 7, 78), (3.0, 16.0, 11.0), rot(0, 0, -10))           # its head
    # a hand saw on a nail on the left wall, near the door
    m.box('dryrust', (-70.0, -hw + 3.0, 150.0), (60.0, 0.4, 14.0), rot(0, 0, 6))
    m.box('drywood', (-36.0, -hw + 3.5, 152.0), (12.0, 2.4, 12.0))
    # the wood box by the stove: empty, a few chips and bark in it
    bx, by = -150.0, -hw + 30.0                 # (clear of the stove's open door and of the way to it)
    for (cx, cy, sx, sy) in ((bx, by - 25, 60, 2.2), (bx, by + 25, 60, 2.2), (bx - 30, by, 2.2, 50), (bx + 30, by, 2.2, 50)):
        m.box('drywood', (cx, cy, 20.0), (sx, sy, 36.0))
    m.box('drywood', (bx, by, 3.5), (60.0, 52.0, 2.0))
    for k in range(6):
        m.box('drywood', (bx + r.uniform(-22, 22), by + r.uniform(-18, 18), 5.0), (r.uniform(3, 7), r.uniform(1, 3), 0.8), rot(r.uniform(0, 180)))
    # a crate under the shelves
    cx, cy = -170.0, hw - 30.0
    for z0 in (2.0, 16.0, 30.0):
        for s_ in (-1, 1):
            m.board('drywood', np.array([cx - 28, cy + s_ * 22, z0]), np.array([cx + 28, cy + s_ * 22, z0]), 12.0, 1.8, (0, s_, 0), jitter=0.2)
            m.board('drywood', np.array([cx + s_ * 28, cy - 22, z0]), np.array([cx + s_ * 28, cy + 22, z0]), 12.0, 1.8, (s_, 0, 0), jitter=0.2)
    m.box('drywood', (cx, cy, 43.0), (58.0, 46.0, 2.0), rot(4))


def inner_frame(m, walls, girts=(32.0, 112.0, 192.0)):
    """What a board shed shows from inside (photographs of old board-and-batten sheds and barns from inside): the
    backs of its boards nailed to horizontal girts, 2 x 4s flat across the wall every 80 cm or so, a post in each
    corner and a header over the door; light in the cracks between the boards."""
    for wall in walls.values():
        for z in girts:
            # (the girt in runs: broken where a door or window is cut through the wall)
            runs, a = [], 4.0
            for o in sorted(wall.openings):
                if o[2] - 2 < z < o[3] + 14:             # (no girt across a doorway, nor just over its head)
                    if o[0] > a + 10:
                        runs.append((a, o[0] - 4))
                    a = max(a, o[1] + 4)
            if wall.length - 4 > a + 10:
                runs.append((a, wall.length - 4))
            for a0, a1 in runs:
                if z > min(wall.top(a0), wall.top(a1)) - 12:
                    continue
                m.board('drywood', wall.P(a0, z - 4.5, -4.0), wall.P(a1, z - 4.5, -4.0), 9.0, 4.0, wall.n, jitter=0.12)
        for a in (5.0, wall.length - 5.0):
            m.board('drywood', wall.P(a, 0, -9.0), wall.P(a, wall.top(a) - 3, -9.0), 9.0, 9.0, wall.n, jitter=0.05)
        for o in wall.openings:
            # (the door's frame: its two studs and the header across its top)
            for a in (o[0] - 4.5, o[1] + 4.5):
                m.board('drywood', wall.P(a, 0, -4.0), wall.P(a, wall.top(a) - 3, -4.0), 9.0, 4.0, wall.n, jitter=0.05)
            m.board('drywood', wall.P(o[0] - 9, o[3] + 4.5, -4.0), wall.P(o[1] + 9, o[3] + 4.5, -4.0), 9.0, 4.0, wall.n, jitter=0.1)


def shed(name, seed, W=3.7, D=3.7, H=7.5):
    """A shed of boards under a rusted corrugated-iron shed roof, its door hanging."""
    m = Mesh(seed)
    W, D, H = W * 100, D * 100, H * FT
    walls = frame_building(m, W, D, H, 0.0, 'bb', 'bb')
    walls['front'].cut_doors = True          # (it can be walked into: Part 2's first shelter)
    for w in walls.values():
        w.no_dark = True                         # (its inside is real: moonlight through the gaps in its boards)
    door(m, walls['front'], W / 2 - 45, 90, 6.7 * FT, state='open')      # (tall enough to walk in standing on its floor)
    # its one window, over the bench on the back wall, boarded with a gap (the journal's "It stood at the window")
    window(m, walls['back'], 108.0, 118.0, 76.0, 62.0, state='boarded_gap', trimmat='barewood')
    finish_walls(m, walls, 'bb', 'bb', 0.025)    # (a few boards gone: thin cracks of night, not missing walls)
    inner_frame(m, walls)
    shed_clutter(m, W, D)
    # its floor: boards front to back on sleepers, a finger's gap between them, one split and one short by the door
    y = -W / 2 + 2
    while y < W / 2 - 4:
        bw = min(m.r.uniform(13.5, 17.0), W / 2 - 2 - y)
        x0 = -2.0 - (m.r.uniform(15, 40) if m.r.random() < 0.08 else 0.0)
        m.board('drywood', np.array([x0, y + bw / 2, 1.5]), np.array([-D + 2.0, y + bw / 2, 1.5]), bw - 0.7, 3.0, (0, 0, 1), jitter=0.05)
        y += bw
    pts = [np.array([25, -W / 2 - 15, H + 10]), np.array([25, W / 2 + 15, H + 10]), np.array([-D - 25, W / 2 + 15, H - 40]), np.array([-D - 25, -W / 2 - 15, H - 40])]
    m.poly('tin', pts, face=(0, 0, 1))
    m.poly('barewood', [p - np.array([0, 0, 3]) for p in pts], face=(0, 0, -1))
    m.poly('snow', [p + np.array([0, 0, 30]) for p in pts], face=(0, 0, 1))
    icicles(m, pts[3] - np.array([0, 0, 3]), pts[2] - np.array([0, 0, 3]), per_m=3.0, longest=55.0)
    return m


def privy(name, seed, tipped=False):
    """A privy, 4 x 6 ft: board walls, a shed roof, its door shut on one hinge."""
    m = Mesh(seed)
    W, D, H = 4 * FT, 6 * FT, 7 * FT
    walls = frame_building(m, W, D, H, 0.0, 'bb', 'bb')
    door(m, walls['front'], 8, W - 16, 6 * FT, state='ajar')
    finish_walls(m, walls, 'bb', 'bb', 0.05)
    pts = [np.array([15, -W / 2 - 8, H + 12]), np.array([15, W / 2 + 8, H + 12]), np.array([-D - 15, W / 2 + 8, H - 15]), np.array([-D - 15, -W / 2 - 8, H - 15])]
    m.poly('barewood', pts, face=(0, 0, 1))
    m.poly('barewood', [p - np.array([0, 0, 3]) for p in pts], face=(0, 0, -1))
    m.poly('snow', [p + np.array([0, 0, 25]) for p in pts], face=(0, 0, 1))
    return m


def pole(name, seed, H=28.0):
    """An old power pole: a cedar trunk 28 ft out of the snow, a crossarm with its pins and insulators, leaning."""
    m = Mesh(seed)
    H = H * FT
    segs, n = 10, 8
    r0, r1 = 14.0, 9.0
    for k in range(segs):
        z0, z1 = H * k / segs, H * (k + 1) / segs
        ra, rb = r0 + (r1 - r0) * k / segs, r0 + (r1 - r0) * (k + 1) / segs
        for j in range(n):
            a0, a1 = 2 * math.pi * j / n, 2 * math.pi * (j + 1) / n
            m.poly('barewood', [np.array([ra * math.cos(a0), ra * math.sin(a0), z0]), np.array([ra * math.cos(a1), ra * math.sin(a1), z0]),
                                np.array([rb * math.cos(a1), rb * math.sin(a1), z1]), np.array([rb * math.cos(a0), rb * math.sin(a0), z1])],
                   uvs=[(j / n, z0 / UV_CM), ((j + 1) / n, z0 / UV_CM), ((j + 1) / n, z1 / UV_CM), (j / n, z1 / UV_CM)])
    m.box('barewood', (0, 0, H - 30), (11, 300, 10))
    for k in range(-4, 5):
        if k == 0:
            continue
        y = k * 32
        m.box('barewood', (0, y, H - 18), (3, 3, 14))
        m.box('glass', (0, y, H - 6), (8, 8, 10))
    return m


def headframe(name, seed, H=16.0):
    """The mine's headframe over the old shaft, the camp's landmark against the sky: a timber two-post frame (as the
    western hard-rock mines built them about 1880-1910: Comstock and Leadville photographs, HAER drawings of timber
    headframes) of 12 x 12 in posts, the two front posts upright over the shaft and two backstays leaning back to take
    the hoist rope's pull, girts and X-bracing between them, a sheave deck on top and the sheave wheel (spoked, about
    3 m across) on it; the shaft's collar boards round its foot. Weathered, a few braces gone."""
    m = Mesh(seed)
    T = 30.0                                      # (12 in timbers)
    H = H * 100.0
    fx, wy = -150.0, 125.0                        # (the front posts: back from the front, half the spread)
    bx = fx - H * 0.62                            # (where the backstays reach the ground)
    def beam(a, b, size=T, mat='barewood', nrm=(0, 0, 1)):
        a, b = np.array(a, float), np.array(b, float)
        d = (b - a) / np.linalg.norm(b - a)
        n = np.array(nrm, float)
        if abs(np.dot(n, d)) > 0.9:
            n = np.array([1.0, 0.0, 0.0])
        m.board(mat, a, b, size, size, n, jitter=0.15)
    for y in (-wy, wy):
        beam((fx, y, 0), (fx, y, H + 40))
        beam((bx, y * 1.15, 0), (fx - 20, y, H - 20))
    # girts across the front posts, and across front to back, every 3.2 m; X-bracing on the front and sides
    lv = np.arange(320.0, H, 320.0)
    for z in lv:
        beam((fx, -wy - 15, z), (fx, wy + 15, z), size=22)
        k = (z / H)
        xb = fx + (bx - fx) * (1 - k) - 10
        for y in (-wy, wy):
            beam((fx, y, z), (xb, y * (1.15 - 0.15 * k), z), size=22)
    for z0, z1 in zip(np.concatenate([[0.0], lv[:-1]]), lv):
        if m.r.random() < 0.85:
            beam((fx, -wy, z0 + 15), (fx, wy, z1 - 15), size=16)
        if m.r.random() < 0.85:
            beam((fx, wy, z0 + 15), (fx, -wy, z1 - 15), size=16)
    # the sheave deck: two heavy caps on the posts, planked over
    for y in (-wy, wy):
        beam((fx + 60, y, H), (fx - 160, y, H), size=34)
    for i in range(9):
        x = fx + 55 - i * 25
        m.box('barewood', np.array([x, 0.0, H + 22]), (22.0, 2 * wy + 60, 5.0))
    # the sheave wheel: a rim of segments, eight spokes, a hub, on the deck turning about the street's way (y)
    R, cz, cx = 150.0, H + 24 + 150.0 + 10, fx - 40
    segs = 24
    for i in range(segs):
        a0, a1 = 2 * math.pi * i / segs, 2 * math.pi * (i + 1) / segs
        p0 = np.array([cx + R * math.cos(a0), 0.0, cz + R * math.sin(a0)])
        p1 = np.array([cx + R * math.cos(a1), 0.0, cz + R * math.sin(a1)])
        m.board('rustmetal', p0, p1, 12, 10, np.array([math.cos((a0 + a1) / 2), 0.0, math.sin((a0 + a1) / 2)]))
    for i in range(8):
        a = 2 * math.pi * i / 8
        m.board('rustmetal', np.array([cx, 0.0, cz]), np.array([cx + (R - 6) * math.cos(a), 0.0, cz + (R - 6) * math.sin(a)]), 7, 5, np.array([0.0, 1.0, 0.0]))
    m.box('rustmetal', np.array([cx, 0.0, cz]), (30.0, 36.0, 30.0))
    for y in (-22.0, 22.0):                       # (its pillow blocks on the deck)
        beam((cx, y, H + 28), (cx, y, cz - 10), size=20)
    # the shaft's collar: heavy boards round the opening at its foot, the dark of the shaft between
    for y in (-wy - 30, wy + 30):
        beam((fx + 80, y, 8), (fx - 220, y, 8), size=30)
    for x in (fx + 80, fx - 220):
        beam((x, -wy - 30, 8), (x, wy + 30, 8), size=30)
    m.poly('dark', [np.array([fx + 65, -wy - 15, 2.0]), np.array([fx + 65, wy + 15, 2.0]), np.array([fx - 205, wy + 15, 2.0]), np.array([fx - 205, -wy - 15, 2.0])], face=(0, 0, 1))
    return m


def walls_of(m):
    return m


BUILDINGS = {
    'Store': lambda: false_front_store('Store', 3, W=9.1, D=15.2, porch_down=True),
    'Saloon': lambda: false_front_store('Saloon', 5, W=6.1, D=9.1, H=11.0, ff=4.0, sag=10.0),
    'Hotel': lambda: hotel('Hotel', 7),
    'CabinA': lambda: cabin('CabinA', 11, wood=True),
    'CabinB': lambda: cabin('CabinB', 13, W=4.3, D=5.5, collapsed=True),
    'Shed': lambda: shed('Shed', 17),
    'Privy': lambda: privy('Privy', 19),
    'Pole': lambda: pole('Pole', 23),
    'Headframe': lambda: headframe('Headframe', 29),
}


# ---------------------------------------------------------------------------------------------------------------------
# the town on the valley floor: where it stands, the ground under it, and where the car is left

TOWN_S, TOWN_D = 604.0, -236.0      # the head of its street (road coordinates: m along the road, m across it): just
                                    # past the foot of the crash chute, where the car comes down
LAYOUT = [  # (building, u along the street from its head (m), v across it (m, + to the right looking down it), faces)
    ('Saloon', 7.0, -7.0, 'v+'), ('Store', 18.5, -7.0, 'v+'), ('CabinB', 31.0, -8.0, 'v+'), ('Privy', 6.0, -19.0, 'v+'),
    ('Shed', 5.5, 8.0, 'v-'), ('CabinA', 15.0, 8.0, 'v-'), ('Privy', 16.0, 19.0, 'v-'),
    ('Hotel', 47.0, 0.0, 'u-'),
    ('Pole', -1.0, 5.5, 'u+'), ('Pole', 23.0, 5.5, 'u+'), ('Pole', 45.0, 9.5, 'u+'),
    ('Headframe', 60.0, 17.0, 'v-'),              # (the old shaft behind the hotel's right: the camp's landmark)
]
FOOT = {'Saloon': (9.1, 6.1), 'Store': (15.2, 9.1), 'CabinB': (5.5, 4.3), 'CabinA': (6.1, 4.9), 'Privy': (1.9, 1.3),
        'Shed': (3.7, 3.7), 'Hotel': (15.2, 9.1), 'Pole': (0.4, 0.4), 'Headframe': (12.0, 4.0)}       # (depth back from its front, width) m


def town():
    """Lay the town out on the valley floor: the ground patch it stands on (level pads under the buildings, banked
    snow; the coarse valley floor under it everywhere else), the buildings' places, and where the car is left."""
    sys.path.insert(0, HERE)
    import json
    import make_mountain as mm
    xs, ys, th, s_arr = mm.road_samples()
    zr = np.array([mm.elevation(s) for s in s_arr])
    mm.FLOOR_BASE = float(zr.mean() - mm.FLOOR_DROP)
    # the coarse valley floor exactly as build_far triangulates it
    cx, cy = xs.mean(), ys.mean()
    span, n = 14000.0, 140
    gx = np.linspace(cx - span / 2, cx + span / 2, n)
    gy = np.linspace(cy - span / 2, cy + span / 2, n)
    X, Y = np.meshgrid(gx, gy, indexing='ij')
    px, py = xs[::20], ys[::20]
    dist = np.min(np.hypot(X[..., None] - px, Y[..., None] - py), axis=-1)
    w = mm.smoothstep(260, 1800, dist)
    Z = mm.valley_floor(X, Y) + w * (mm.fbm(X / 2600, Y / 2600, 6, ridged=True) * 1900 + mm.fbm(X / 700, Y / 700, 4) * 160)

    def far(x, y):
        fr, fc = (x - gx[0]) / (gx[1] - gx[0]), (y - gy[0]) / (gy[1] - gy[0])
        r, c = int(fr), int(fc)
        fx, fy = fr - r, fc - c
        a, b, cc, dd = Z[r, c], Z[r, c + 1], Z[r + 1, c], Z[r + 1, c + 1]
        if fx + fy <= 1:
            return a + fx * (cc - a) + fy * (b - a)
        return dd + (1 - fx) * (b - dd) + (1 - fy) * (cc - dd)

    # the street's frame: u down the street (away from the mountainside), v across it
    x0, y0, _, t = mm.frame_at(xs, ys, th, zr, s_arr, TOWN_S, TOWN_D)
    U = np.array([-math.sin(t), math.cos(t)])
    V = np.array([math.cos(t), math.sin(t)])
    if np.cross(np.append(U, 0), np.append(V, 0))[2] < 0:
        V = -V                                     # (v to the right looking down the street, in Unreal's Y-right frame)
    O = np.array([float(x0), float(y0)])
    P = lambda u, v: O + U * u + V * v
    # each building's pad: level at the highest the valley floor reaches under it (snow banks up round it)
    places, pads = [], []
    for name, u, v, faces in LAYOUT:
        dep, wid = FOOT[name]
        fwd = {'v+': V, 'v-': -V, 'u+': U, 'u-': -U}[faces]
        side = np.array([-fwd[1], fwd[0]])
        front = P(u, v)
        corners = [front + side * s * wid / 2 - fwd * d for s in (-1, 1) for d in (0, dep)]
        zpad = max(far(*c) for c in corners) + 0.05
        places.append({'name': name, 'at': [front[0] * 100, front[1] * 100, zpad * 100],
                       'yaw': math.degrees(math.atan2(fwd[1], fwd[0]))})
        pads.append((front, fwd, side, dep, wid, zpad))
    # the car: on its roof at the head of the street, facing down it
    rest = P(-3.0, 0.4)
    zrest = far(*rest)
    # the ground patch: 1 m grid over the town, 4 cm over the valley floor, risen to each pad (and the snow banked round
    # it), dipping under the valley floor at its edges
    us = np.arange(-18.0, 72.0 + 1e-6, 1.0)
    vs = np.arange(-34.0, 34.0 + 1e-6, 1.0)
    verts, uvs = [], []
    for u in us:
        for v in vs:
            p = P(u, v)
            z = far(*p) + 0.04
            for front, fwd, side, dep, wid, zpad in pads:
                rel = p - front
                a, b = -np.dot(rel, fwd), np.dot(rel, side)          # back from its front, across it
                ex = max(0.0, max(-a, a - dep, abs(b) - wid / 2) - 0.6)  # how far outside its footprint (+0.6 m)
                k = max(0.0, 1.0 - ex / 3.5)
                k = k * k * (3 - 2 * k)
                z = max(z, z + (zpad - z) * k)
            edge = min(u - us[0], us[-1] - u, v - vs[0], vs[-1] - v)
            if edge < 2.0:
                z = min(z, far(*p) - 0.12 + (z - far(*p) + 0.12) * edge / 2.0)
            verts.append((p[0], p[1], z))
            uvs.append((p[0] / 40.0, p[1] / 40.0))
    nu, nv = len(us), len(vs)
    tris = []
    for i in range(nu - 1):
        for j in range(nv - 1):
            a, b, c, d = i * nv + j, i * nv + j + 1, (i + 1) * nv + j, (i + 1) * nv + j + 1
            tris += [(a, c, b), (b, c, d)]
    vv = np.array(verts)
    tt = np.array(tris)
    p0, p1, p2 = vv[tt[0][0]], vv[tt[0][1]], vv[tt[0][2]]
    if np.cross(p1 - p0, p2 - p0)[2] < 0:
        tt = tt[:, ::-1]
    mm.write_obj(os.path.join(GEN, 'Town_Ground.obj'), [('ground', vv, np.array(uvs), tt)])
    out = {'buildings': places, 'rest': [rest[0] * 100, rest[1] * 100, zrest * 100],
           'rest_yaw': math.degrees(math.atan2(U[1], U[0])), 'street_u': [U[0], U[1]], 'street_v': [V[0], V[1]],
           'head': [O[0] * 100, O[1] * 100]}
    json.dump(out, open(os.path.join(GEN, 'town.json'), 'w'), indent=1)
    print('town: %d buildings; the car left at (%.0f, %.0f, %.0f) cm facing %.0f deg; ground %d triangles' % (
        len(places), out['rest'][0], out['rest'][1], out['rest'][2], out['rest_yaw'], len(tt)))


def main():
    os.makedirs(GEN, exist_ok=True)
    names = [n for n in sys.argv[1:] if n in BUILDINGS] or ([] if 'layout' in sys.argv else list(BUILDINGS))
    for n in names:
        BUILDINGS[n]().write(os.path.join(GEN, 'Town_%s.obj' % n))
    if len(sys.argv) == 1 or 'layout' in sys.argv:
        town()


if __name__ == '__main__':
    main()
