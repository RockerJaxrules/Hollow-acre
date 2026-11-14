"""First-person hands and arms: quad cages for subdivision, skin detail, weights and a contact grip.

Built for the Part 2 drive (t353): the left hand + forearm is one cage, the right is the same mesh mirrored.
All hand work happens in a canonical frame, in CENTIMETRES:
    origin = wrist centre, +X = toward the thumb, +Y = toward the fingers, +Z = back of the hand.
Real sizes (adult, medium): wrist crease to middle tip 18.6, knuckle width 8.4, palm 9.0, segments ~1 : .6 : .45.

    import hands
    H = hands.build_hand(dfc)            # dfc: unit vector, wrist -> elbow, in the canonical frame (bind wrist bend)
    H['V'], H['F']                       # cage (cm): quads + a few n-gons; subdivide in Blender
    hands.detail(V, N, H)                # displacement (cm) for a level-4 bake source: wrinkles, creases, tendons, veins
    hands.weights(V, H['bones'])         # (index, weight) pairs per vertex, joint-plane blend
    hands.sleeve(path, radius_fn, ...)   # cloth tube with a rolled cuff and a pocket, folds in the cage

Exemplar: t353 hands r1 (judge/r1/shape.png, look.png).
"""
import numpy as np

def nrm(v):
    v = np.asarray(v, float); return v / np.linalg.norm(v)
def perp(v, d):
    v = np.asarray(v, float) - d * (np.asarray(v, float) @ d); return nrm(v)
def rot(axis, ang):
    a = nrm(axis); c, s = np.cos(ang), np.sin(ang); x, y, z = a
    return np.array([[c + x * x * (1 - c), x * y * (1 - c) - z * s, x * z * (1 - c) + y * s],
                     [y * x * (1 - c) + z * s, c + y * y * (1 - c), y * z * (1 - c) - x * s],
                     [z * x * (1 - c) - y * s, z * y * (1 - c) + x * s, c + z * z * (1 - c)]])
def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

# ------------------------------------------------------------------ measurements (cm)
# name: MCP joint centre (x, y, z), splay (deg, + toward thumb), segment lengths, width at base, width at tip
FINGERS = {
    'pinky':  dict(mcp=(-2.95, 7.85, 0.05), splay=-2.5, L=(3.35, 1.95, 1.75), wb=1.90, wt=1.42),
    'ring':   dict(mcp=(-1.02, 8.65, 0.15), splay=-1.0, L=(4.25, 2.65, 2.00), wb=2.08, wt=1.58),
    'middle': dict(mcp=(0.98, 9.00, 0.18), splay=0.0, L=(4.55, 2.80, 2.05), wb=2.20, wt=1.66),
    'index':  dict(mcp=(3.02, 8.55, 0.12), splay=1.5, L=(4.10, 2.45, 1.95), wb=2.15, wt=1.62),
}
ORDER = ['pinky', 'ring', 'middle', 'index']          # ulnar -> radial, matches palm columns 0..8
THUMB = dict(cmc=(2.25, 1.55, -1.05), d1=(0.64, 0.70, -0.30), L=(4.6, 3.1, 2.55), w=(2.5, 2.35, 2.3, 2.1))
THICK = 0.86                                          # finger thickness / width
# palm stations: y, half width, centre x, dorsal z, palmar z, hollow, thenar, hypothenar
PALM = [(0.0, 2.72, 0.00, 1.72, -1.80, 0.00, 0.00, 0.00),
        (1.7, 3.35, 0.05, 1.52, -1.62, 0.05, 0.75, 0.35),
        (3.6, 3.80, 0.10, 1.32, -1.38, 0.22, 0.75, 0.30),
        (5.6, 4.05, 0.12, 1.24, -1.32, 0.20, 0.45, 0.15),
        (7.0, 4.15, 0.12, 1.22, -1.40, 0.06, 0.00, 0.05)]
# forearm profile from the wrist toward the elbow: distance, half width, dorsal, palmar (cm)
FORE = [(0.0, 2.72, 1.72, -1.80), (2.2, 2.86, 1.86, -1.88), (5.0, 3.25, 2.05, -2.05), (8.0, 3.65, 2.35, -2.30),
        (11.0, 3.88, 2.58, -2.50), (14.0, 3.95, 2.62, -2.56)]

class Cage:
    def __init__(self): self.V = []; self.F = []; self.tag = []
    def add(self, p, tag=''): self.V.append(np.asarray(p, float)); self.tag.append(tag); return len(self.V) - 1
    def ring(self, pts, tag=''): return [self.add(p, tag) for p in pts]
    def bridge(self, a, b):
        n = len(a)
        for i in range(n): self.F.append([a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]])
    def cap8(self, r): self.F += [[r[0], r[1], r[2], r[3]], [r[0], r[3], r[4], r[7]], [r[4], r[5], r[6], r[7]]]

def ring8(c, Lx, Zd, hw, ht, sq=2.5, pad=1.06, top=0.94):
    """8 points round a finger: [DL, DT, DR, R, PR, PB, PL, L]; L = toward the thumb, Zd = back of the finger.
    Superellipse (sq) so the section is a rounded box; the palm side is fuller (pad), the back flatter (top)."""
    out = []
    for a in np.radians([135, 90, 45, 0, -45, -90, -135, 180]):
        ca, sa = np.cos(a), np.sin(a)
        x = np.sign(ca) * abs(ca) ** (2 / sq); z = np.sign(sa) * abs(sa) ** (2 / sq)
        z *= top if z > 0 else pad
        out.append(c + Lx * hw * x + Zd * ht * z)
    return out

def ring_follow(prev_pts, prev_c, c, d, Lx, Zd, hw, ht, sq=2.5, pad=1.06, top=0.94):
    """A ring on an ellipse in the plane normal to d, its 8 vertices rotated to line up with prev_pts
    (best cyclic shift, same winding), so the tube does not twist or flatten."""
    Lx = perp(Lx, d); Zd = np.cross(d, Lx) * (1 if np.cross(d, Lx) @ Zd > 0 else -1)
    base = ring8(c, Lx, Zd, hw, ht, sq, pad, top)
    P = np.array(prev_pts) - prev_c; best = None
    for flip in (False, True):
        seq = base[::-1] if flip else base
        for k in range(8):
            cand = [seq[(i + k) % 8] for i in range(8)]
            Q = np.array(cand) - c; e = np.sum([np.linalg.norm(nrm(q) - nrm(p)) for p, q in zip(P, Q)])
            if best is None or e < best[0]: best = (e, cand)
    return best[1]

def palm_ring(st, y_override=None):
    y, hw, cx, zd, zp, hol, the, hyp = st
    pts_d, pts_p = [], []
    for c in range(9):
        u = c / 4 - 1
        x = cx + hw * u * 0.93
        z_d = zd * (1 - 0.42 * u * u)
        z_p = zp * (1 - 0.45 * u * u) * (1 - hol * np.exp(-((u - 0.05) / 0.45) ** 2))
        z_p -= the * np.exp(-((u - 0.72) / 0.30) ** 2) + hyp * np.exp(-((u + 0.75) / 0.30) ** 2)
        pts_d.append((x, y, z_d)); pts_p.append((x, y, z_p))
    zm = (zd + zp) * 0.25
    side_r = (cx + hw, y, zm); side_u = (cx - hw, y, zm)
    return [np.array(p) for p in pts_d] + [np.array(side_r)] + [np.array(p) for p in pts_p[::-1]] + [np.array(side_u)]

def finger_frame(f):
    """axis (distal), lateral (toward thumb), dorsal for a straight finger in the bind pose"""
    a = np.radians(f['splay']); d = nrm([np.sin(a), np.cos(a), 0.0]); L = nrm([np.cos(a), -np.sin(a), 0.0])
    return d, L, np.array([0, 0, 1.0])

def finger_stations(f):
    L1, L2, L3 = f['L']; wb, wt = f['wb'], f['wt']; S = L1 + L2 + L3
    w = lambda k: wb + (wt - wb) * k                      # linear taper base -> tip
    # (distance from MCP, half width, thickness ratio, tag)
    return [(1.55, w(.03) / 2 * 1.02, THICK, 'p'), (L1 * .62, w(.14) / 2, THICK, 'p'), (L1 - .38, w(.24) / 2, THICK, 'p'),
            (L1, w(.27) / 2 * 1.05, THICK * .98, 'pip'), (L1 + .32, w(.32) / 2, THICK, 'm'), (L1 + L2 * .55, w(.5) / 2 * .98, THICK, 'm'),
            (L1 + L2 - .28, w(.66) / 2, THICK, 'm'), (L1 + L2, w(.70) / 2 * 1.04, THICK * .97, 'dip'), (L1 + L2 + .28, w(.76) / 2, THICK * .94, 'd'),
            (L1 + L2 + L3 * .55, w(.9) / 2 * 1.01, THICK * .86, 'd'), (S - .45, wt / 2 * .94, THICK * .84, 'tip'), (S - .16, wt / 2 * .7, THICK * .7, 'tip'), (S - .03, wt / 2 * .32, THICK * .5, 'end')]

def build_hand(dfc, thumb_dirs=None, thumb_z=None):
    """Left hand + forearm cage in the canonical frame (cm). dfc: unit vector from the wrist toward the elbow.
    thumb_dirs/thumb_z: build the thumb already in its working pose (metacarpal, proximal, distal directions and the
    nail side), so skinning only has to move it a little."""
    C = Cage(); dfc = nrm(dfc)
    rings = [C.ring(palm_ring(st), 'palm') for st in PALM]
    # thumb port: palm ring indices 9 (radial side), 10 (P8), 11 (P7) between stations 1..3 stay open
    port_faces = {(2, 10), (2, 11), (3, 10), (3, 11)}
    for k in range(len(rings) - 1):
        a, b = rings[k], rings[k + 1]
        for i in range(20):
            if (k, i) in port_faces: continue
            C.F.append([a[i], a[(i + 1) % 20], b[(i + 1) % 20], b[i]])
    # the thumb leaves the palm on its thumb-side underside, low on the ball of the thumb, just behind the index knuckle
    thumb_port = [rings[2][10], rings[3][10], rings[4][10], rings[4][11], rings[4][12], rings[3][12], rings[2][12], rings[2][11]]
    unused = rings[3][11]
    # finger ports on the distal edge of the palm
    mc = {n: np.array(FINGERS[n]['mcp']) for n in ORDER}; wb = {n: FINGERS[n]['wb'] for n in ORDER}
    D, M, P = {}, {}, {}
    for i, n in enumerate(ORDER):
        x, y, z = mc[n]
        D[2 * i + 1] = (x, y - 0.25, 1.32); P[2 * i + 1] = (x, y + 1.25, -1.15)
    for i in range(1, 4):
        a, b = mc[ORDER[i - 1]], mc[ORDER[i]]; xm = (a[0] + b[0]) / 2; ym = (a[1] + b[1]) / 2
        D[2 * i] = (xm, ym - 0.12, 1.02); M[2 * i] = (xm, ym + 1.15, -0.12); P[2 * i] = (xm, ym + 1.0, -1.05)
    p0, p3 = mc['pinky'], mc['index']
    D[0] = (p0[0] - .5 * wb['pinky'] * 1.04, p0[1] - .25, .82); M[0] = (p0[0] - .5 * wb['pinky'] * 1.1, p0[1] + .25, -.12); P[0] = (p0[0] - .45 * wb['pinky'], p0[1] + .65, -.95)
    D[8] = (p3[0] + .5 * wb['index'] * 1.04, p3[1] - .2, .92); M[8] = (p3[0] + .5 * wb['index'] * 1.1, p3[1] + .3, -.12); P[8] = (p3[0] + .45 * wb['index'], p3[1] + .7, -1.0)
    last = rings[-1]                                      # 20: D0..D8, M8, P8..P0, M0
    distal = {}
    for c in range(9): distal[('D', c)] = C.add(D[c], 'palm')
    for c in range(9): distal[('P', c)] = C.add(P[c], 'palm')
    for c in (0, 2, 4, 6, 8): distal[('M', c)] = C.add(M[c], 'palm')
    port_ring = [distal[('D', c)] for c in range(9)] + [distal[('M', 8)]] + [distal[('P', c)] for c in range(8, -1, -1)] + [distal[('M', 0)]]
    C.bridge(last, port_ring)
    fingers = {}
    for i, n in enumerate(ORDER):
        a = 2 * i
        port = [distal[('D', a)], distal[('D', a + 1)], distal[('D', a + 2)], distal[('M', a + 2)],
                distal[('P', a + 2)], distal[('P', a + 1)], distal[('P', a)], distal[('M', a)]]
        f = FINGERS[n]; d, L, Z = finger_frame(f); m = mc[n]
        prev = port; jr = {}
        for s, hw, th, tag in finger_stations(f):
            c = m + d * s
            r = C.ring(ring8(c, L, Z, hw, hw * th), n + ':' + tag); C.bridge(prev, r); prev = r
            jr.setdefault(tag, []).append(r)
        C.cap8(prev)
        L1, L2, L3 = f['L']
        fingers[n] = dict(joints=[m, m + d * L1, m + d * (L1 + L2), m + d * (L1 + L2 + L3)], d=d, L=L, Z=Z,
                          r=[f['wb'] / 2, (f['wb'] * .73 + f['wt'] * .27) / 2, (f['wb'] * .3 + f['wt'] * .7) / 2, f['wt'] / 2], rings=jr)
    # thumb: a tube out of the thenar port
    T = THUMB; cmc = np.array(T['cmc']); d1 = nrm(T['d1']); d2 = nrm(d1 + np.array([-.08, .22, .05])); d3 = nrm(d2 + np.array([-.05, .12, .06]))
    if thumb_dirs is not None: d1, d2, d3 = [nrm(v) for v in thumb_dirs]
    mcp = cmc + d1 * T['L'][0]; ip = mcp + d2 * T['L'][1]; tip = ip + d3 * T['L'][2]
    tz = perp(np.array([.75, -.15, .65]) if thumb_z is None else np.asarray(thumb_z), d1)              # thumbnail side
    tl = nrm(np.cross(d1, tz))
    prev = thumb_port; prev_c = np.mean([C.V[i] for i in thumb_port], 0)
    w = T['w']
    pc = prev_c; dm = nrm(mcp - pc)                       # from the port (radial edge of the palm) to the thumb knuckle
    stations = [(pc + (mcp - pc) * .5, nrm(dm + d1 * .5), 1.5, .74, 'tm'),
                (mcp, nrm(d1 + d2), 1.24, .76, 'tmcp'), (mcp + d2 * .4, d2, 1.18, .76, 'tp'), (mcp + d2 * 1.55, d2, 1.15, .76, 'tp'),
                (ip - d2 * .3, d2, 1.14, .75, 'tp'), (ip, nrm(d2 + d3), 1.18, .74, 'tip_j'), (ip + d3 * .3, d3, 1.16, .74, 'td'),
                (ip + d3 * 1.3, d3, 1.2, .72, 'td'), (tip - d3 * .5, d3, 1.08, .70, 'td'), (tip - d3 * .18, d3, .8, .6, 'td'), (tip - d3 * .03, d3, .36, .42, 'tend')]
    plong = nrm(C.V[thumb_port[2]] - C.V[thumb_port[0]])     # the port's long axis (along the hand's radial edge)
    for k, (c, dd, hw, th, tag) in enumerate(stations):
        zz = perp(tz, dd); ll = nrm(np.cross(dd, zz))
        if k < 2:                                            # the thenar keeps the port's long, flat shape so it flows out of the palm
            w = (.7, .3)[k]; lp = perp(plong, dd); ll = nrm(lp * w + ll * (1 - w)); zz = nrm(np.cross(ll, dd)) * (1 if np.cross(ll, dd) @ zz > 0 else -1)
        r = C.ring(ring_follow([C.V[i] for i in prev], prev_c, c, dd, ll, zz, hw, hw * th, sq=2.2), 'thumb:' + tag)
        C.bridge(prev, r); prev = r; prev_c = c
    C.cap8(prev)
    thumb = dict(joints=[cmc, mcp, ip, tip], d=[d1, d2, d3], Z=tz, r=[1.3, 1.1, 1.05, .9])
    # forearm: carries on from the wrist ring, bending from the hand's axis toward the elbow
    wrist = rings[0]; prev = wrist; c = np.zeros(3); dprev = np.array([0, -1.0, 0]); fx = np.array([1.0, 0, 0]); fz = np.array([0, 0, 1.0])
    tprev = 0.0; fore_c = [c.copy()]
    for k, (t, hw, zd, zp) in enumerate(FORE[1:], 1):
        dt = t - tprev; b = sstep(0, 3.5, t); dcur = nrm((1 - b) * np.array([0, -1.0, 0]) + b * dfc)
        c = c + nrm(dprev + dcur) * dt
        q = rot(np.cross(dprev, dcur), np.arccos(np.clip(dprev @ dcur, -1, 1))) if np.linalg.norm(np.cross(dprev, dcur)) > 1e-9 else np.eye(3)
        fx = perp(q @ fx, dcur); fz = perp(q @ fz, dcur); dprev = dcur; tprev = t
        pts = []
        for col in range(9):
            u = col / 4 - 1; x = hw * u * .93; z = zd * (1 - .40 * u * u)
            if 1.2 < t < 3.5 and col <= 1: z += .32 * (1 - abs(u + .85) * 2)          # ulnar styloid
            z += .26 * sstep(3.5, 9, t) * np.exp(-((u - .6) / .35) ** 2)                # the extensor/brachioradialis mass on the thumb side
            pts.append(c + fx * x + fz * z)
        side_r = c + fx * hw + fz * (zd + zp) * .22
        pal = []
        for col in range(8, -1, -1):
            u = col / 4 - 1; x = hw * u * .93; z = zp * (1 - .55 * u * u)                # flatter palm side
            z -= .18 * sstep(4.5, 10, t) * np.exp(-((u + .35) / .45) ** 2)               # the flexor mass
            pal.append(c + fx * x + fz * z)
        side_u = c - fx * hw + fz * (zd + zp) * .22
        r = C.ring(pts + [side_r] + pal + [side_u], 'fore'); C.bridge(prev, r); prev = r; fore_c.append(c.copy())
    C.F.append(list(prev[::-1]))                                       # cap, hidden inside the sleeve
    V = np.array(C.V)
    keep = np.ones(len(V), bool); keep[unused] = False
    remap = np.cumsum(keep) - 1
    F = [[int(remap[i]) for i in f] for f in C.F]
    V = V[keep]; tags = [t for t, k in zip(C.tag, keep) if k]
    return dict(V=V, F=F, tags=tags, fingers=fingers, thumb=thumb, fore=fore_c, dfc=dfc)

# ------------------------------------------------------------------ skin detail for the bake source (displacement, cm)
def _seg_dist(P, a, b):
    d = b - a; L2 = d @ d; t = np.clip(((P - a) @ d) / L2, 0, 1); return np.linalg.norm(P - (a + np.outer(t, d)), axis=1), t

def _poly_dist(P, pts):
    best = np.full(len(P), 1e9); bt = np.zeros(len(P))
    acc = 0; tot = sum(np.linalg.norm(pts[i + 1] - pts[i]) for i in range(len(pts) - 1))
    for i in range(len(pts) - 1):
        d, t = _seg_dist(P, pts[i], pts[i + 1]); L = np.linalg.norm(pts[i + 1] - pts[i])
        m = d < best; best[m] = d[m]; bt[m] = (acc + t[m] * L) / tot; acc += L
    return best, bt

def detail(V, N, H, seed=3, out=None):
    """Displacement along the normal (cm) for a dense (level 4) copy of the bind-pose hand.
    Knuckle wrinkles on the back of PIP/DIP/MCP, joint creases on the palm side, extensor tendons, veins."""
    rng = np.random.default_rng(seed); h = np.zeros(len(V))
    for n, f in H['fingers'].items():
        J = f['joints']; d, L, Z = f['d'], f['L'], f['Z']
        for j, (amp, n_lines, sp, width) in ((1, (.04, 4, .15, .55)), (2, (.026, 3, .12, .42)), (0, (.022, 2, .26, .75))):
            P = J[j] + (Z * .55 if j == 0 else 0)
            q = V - P; along = q @ d; lat = q @ L; up = q @ Z
            dors = sstep(.15, .6, N @ Z)
            bow = .32 * (lat / (f['r'][j] + 1e-6)) ** 2                       # wrinkles curve round the knuckle
            ph = (along + bow) / sp
            env = np.exp(-((along + bow) / (sp * n_lines * .62)) ** 2) * np.exp(-(lat / (f['r'][j] * (.8 if j == 0 else .95))) ** 4) * dors
            line = -np.exp(-((ph - np.round(ph)) / .2) ** 2)
            h += amp * env * line * (1 + .25 * np.sin(lat * 7 + j))
            # palm-side crease: one or two deep lines across each joint
            if j:
                pal = sstep(.2, .7, -(N @ Z)); off = .18 if j == 1 else .12
                for o in ((-off / 2, off / 2) if j == 1 else (0,)):
                    h -= .02 * pal * np.exp(-((along - o) / .05) ** 2) * np.exp(-(lat / (f['r'][j] * .9)) ** 4)
    # thumb knuckles
    T = H['thumb']; J = T['joints']
    for j, amp in ((2, .022), (1, .016)):
        dd = nrm(J[j + 1] - J[j - 1]); q = V - J[j]; along = q @ dd; lat = q @ nrm(np.cross(dd, T['Z']))
        dors = sstep(.1, .6, N @ T['Z']); ph = along / .15
        env = np.exp(-(along / .38) ** 2) * np.exp(-(lat / 1.0) ** 4) * dors
        h += amp * env * -np.exp(-((ph - np.round(ph)) / .2) ** 2)
    # the back of the hand in geometry, measured on the dorsal plane (x, y): knuckle heads, valleys between them,
    # extensor tendons fanning from the wrist, the ulnar styloid, and a thin branching vein network
    dors = sstep(.25, .75, N[:, 2]); XY = V[:, :2]
    def d2(p): return np.linalg.norm(XY - np.asarray(p), axis=1)
    def seg2(a, b):
        a, b = np.asarray(a, float), np.asarray(b, float); d = b - a; t = np.clip(((XY - a) @ d) / (d @ d), 0, 1)
        return np.linalg.norm(XY - (a + np.outer(t, d)), axis=1), t
    mcps = [np.array(H['fingers'][n]['joints'][0]) for n in ['pinky', 'ring', 'middle', 'index']]
    for i, m in enumerate(mcps):
        h += .22 * np.exp(-(d2((m[0], m[1] - .2)) / .5) ** 2) * dors * (.8 if i == 0 else 1)            # knuckle head
        if i: h -= .10 * np.exp(-(d2(((m[0] + mcps[i - 1][0]) / 2, (m[1] + mcps[i - 1][1]) / 2 - .45)) / .42) ** 2) * dors
        dist, t = seg2((-.2 + i * .25, .5), (m[0], m[1] - .8))                                          # broad, low tendon
        h += .06 * np.exp(-(dist / .2) ** 2) * sstep(0, .25, t) * sstep(1.0, .85, t) * dors * (.75 if i == 0 else 1)
    h += .2 * np.exp(-(d2((-2.55, -1.15)) / .5) ** 2) * sstep(-.3, .4, N[:, 2] - N[:, 0] * .8)        # ulnar styloid
    # the wrist crease: a soft groove across the palm side and a faint one across the back
    h -= .05 * np.exp(-((V[:, 1] + .35) / .12) ** 2) * sstep(.1, .6, -N[:, 2]) + .025 * np.exp(-((V[:, 1] + .2) / .15) ** 2) * dors
    # veins: three raised cords (radius ~1.7 mm, 1 mm high, soft 4 mm falloff) from the wrist up between the 2nd-3rd
    # and 4th-5th metacarpals, joined by one loose arch about 2 cm behind the knuckles
    VEINS = [[(.55, .1), (1.15, 3.0), (1.75, 5.4), (1.9, 6.15)], [(-1.25, -.1), (-1.7, 3.0), (-1.95, 5.4), (-1.75, 6.25)],
             [(-1.75, 6.25), (-.65, 6.6), (.75, 6.5), (1.9, 6.15)], [(2.15, -2.0), (2.55, .6), (2.45, 2.6)]]
    vmask = np.zeros(len(V))
    for k, pts in enumerate(VEINS):
        best = np.full(len(V), 9.)
        for p0, p1 in zip(pts[:-1], pts[1:]):
            dist, t = seg2(p0, p1); best = np.minimum(best, dist)
        core = np.exp(-(best / .17) ** 2); soft = np.exp(-(best / .4) ** 2)
        m = (.08 * core + .025 * soft) * sstep(.05, .5, N[:, 2]) * (.7 if k == 3 else 1)
        h += m; vmask = np.maximum(vmask, core * sstep(.05, .5, N[:, 2]))
    if out is not None: out['vein'] = vmask
    # keep the finger webs smooth (palm side and back): displacement folds into fins where the surface turns sharply
    for i in range(1, 4):
        a_, b_ = np.array(FINGERS[ORDER[i - 1]]['mcp']), np.array(FINGERS[ORDER[i]]['mcp'])
        for web, rad in ((np.array([(a_[0] + b_[0]) / 2, (a_[1] + b_[1]) / 2 + 1.15, -.12]), 1.1), (np.array([(a_[0] + b_[0]) / 2, (a_[1] + b_[1]) / 2 + .9, .75]), .75)):
            h *= 1 - .92 * np.exp(-(np.linalg.norm(V - web, axis=1) / rad) ** 2)
    # nothing under the nails, so the plates sit clean
    for n, f in H['fingers'].items():
        J = f['joints']; nc = J[2] + (J[3] - J[2]) * .6 + f['Z'] * f['r'][2] * .8
        h *= 1 - np.exp(-(np.linalg.norm(V - nc, axis=1) / .75) ** 4)
    return h

# ------------------------------------------------------------------ weights: nearest bone with a smooth blend at each joint plane
def weights(V, bones, joints):
    """bones: list of (name, head, tail, radius). joints: list of (parent, child, point, normal, half_width).
    Each vertex goes to its nearest bone (distance to the segment minus its radius). It is then blended across one
    joint plane, either the plane at its own bone's head (with the parent) or the nearest child plane it reaches.
    Both sides of a joint use the same plane, so the skin stays continuous. Returns (N, n_bones), max 2 influences."""
    nb = len(bones); N = len(V); W = np.zeros((N, nb))
    score = np.empty((N, nb))
    for k, (name, a, b, r) in enumerate(bones):
        d, t = _seg_dist(V, np.asarray(a), np.asarray(b)); score[:, k] = d - r
    prim = np.argmin(score, 1)
    idx = {b[0]: k for k, b in enumerate(bones)}
    head = {}; kids = {}
    for par, ch, P, n, hw in joints:
        head[idx[ch]] = (idx[par], np.asarray(P), np.asarray(n), hw); kids.setdefault(idx[par], []).append((idx[ch], np.asarray(P), np.asarray(n), hw))
    for b in range(nb):
        m = np.where(prim == b)[0]
        if not len(m): continue
        P = V[m]; wb = np.ones(len(m)); other = np.full(len(m), b); wo = np.zeros(len(m))
        par = np.zeros(len(m), bool)
        if b in head:                                            # toward the parent
            pb, Pj, n, hw = head[b]; tau = (P - Pj) @ n; w = sstep(-hw, hw, tau)
            par = w < 1; wb[par] = w[par]; other[par] = pb; wo[par] = 1 - w[par]
        if b in kids:                                            # toward the nearest child it reaches
            best = np.full(len(m), 1e9)
            for c, Pj, n, hw in kids[b]:
                tau = (P - Pj) @ n; dist = np.linalg.norm(P - Pj, axis=1)
                near = score[m, c] < bones[c][3] * 1.1                  # inside the child's own reach
                sel = (tau > -hw) & (dist < best) & ~par & near
                best[sel] = dist[sel]; w = sstep(-hw, hw, tau[sel])
                wb[sel] = 1 - w; other[sel] = c; wo[sel] = w
        W[m, b] = wb; W[m, other] += wo
    return W

def smooth_weights(W, edges, mask, iters=6, keep=4):
    """Average each masked vertex's weights with its neighbours' (edges: (E,2) vertex pairs), then keep the largest
    `keep` influences. Used on the finger webs, where two fingers that flex by different amounts share skin and
    a hard split between them tears into fins."""
    W = W.copy(); a, b = edges[:, 0], edges[:, 1]
    for _ in range(iters):
        acc = np.zeros_like(W); cnt = np.zeros(len(W))
        np.add.at(acc, a, W[b]); np.add.at(acc, b, W[a]); np.add.at(cnt, a, 1); np.add.at(cnt, b, 1)
        avg = acc / np.maximum(cnt, 1)[:, None]
        W[mask] = .5 * W[mask] + .5 * avg[mask]
    order = np.argsort(-W, 1); drop = order[:, keep:]
    np.put_along_axis(W, drop, 0, 1)
    return W / np.maximum(W.sum(1, keepdims=True), 1e-9)

# ------------------------------------------------------------------ sleeve: cloth tube, rolled cuff, pocket
def sleeve(path_fn, length, radius_fn, fold_fn, up, n=12, ds_list=None, th=.0032, hem=.015, pocket=.075):
    """Cage for a sleeve along path_fn(s) (metres, s=0 at the cuff edge). Returns V, F, s_of_vertex, ang_of_vertex, inside flag.
    radius_fn(s, a) gives the radius at angle a round the tube (so the cross-section can follow the forearm's oval);
    up may be a vector or a function of s (the frame's angle-0 direction). The cuff rolls over a lip into a pocket
    `pocket` deep, so the cloth shows its thickness at the opening, and the last `hem` metres is a doubled hem band."""
    C = Cage(); svals = ds_list
    def frame(s):
        p = path_fn(s); d = nrm(path_fn(s + 1e-3) - path_fn(s - 1e-3)); u = up(s) if callable(up) else up
        x = perp(u, d); z = np.cross(d, x); return p, d, x, z
    meta = []
    def make_ring(s, rad_off, inside, tag):
        p, d, x, z = frame(max(s, 0))
        pts = []
        for i in range(n):
            a = 2 * np.pi * i / n; r = radius_fn(max(s, 0), a) + fold_fn(max(s, 0), a) * (0 if inside else 1) + rad_off
            pts.append(p + (np.cos(a) * x + np.sin(a) * z) * r + d * min(s, 0)); meta.append((s, a, inside))
        return C.ring(pts, tag)
    rings = []
    inner_s = [pocket, pocket * .62, pocket * .3, .010, 0.0]
    for s in inner_s: rings.append(make_ring(s, -th - (.0012 if s < hem else 0), True, 'in'))
    rings.append(make_ring(-.0026, -th * .45, False, 'lip'))
    for s in svals:
        off = .0012 if s < hem - .002 else (.0003 if s < hem + .002 else 0)      # the hem band, with a step where it ends
        rings.append(make_ring(s, off, False, 'out'))
    for a, b in zip(rings[:-1], rings[1:]): C.bridge(a, b)
    C.F.append(list(rings[0][::-1])); C.F.append(list(rings[-1]))
    V = np.array(C.V); M = np.array(meta)
    return V, C.F, M[:, 0], M[:, 1], M[:, 2]
