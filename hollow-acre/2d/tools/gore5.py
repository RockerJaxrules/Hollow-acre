"""(t374) Extreme gore: the opt-in setting (owner: "as gruesome disturbing bloody and fleshy and heartless as a pixel game can
be", "to the absolute extreme, to the point there is a reason why you have to opt in"). Full and Toned are never touched: each
Extreme sprite starts from its Full sprite (world or close-up) and more is drawn on, at the same layout at both sizes (world
coordinates times the close-up's scale), so the world sprite and its close-up stay the same thing:
  the wounds opened wider in layers (skin lip, fat, muscle in fibres, membrane, bone, marrow), organs out and arranged, guts
  spilled and tangled (tapered tubes, creased, wet, a rim of their own blood), gnawed bones, flayed patches, and the blood
  thick, black-red and clotted, running and pooling.
  _x  fresh (the morning it is found), _x2 the next day: bloated, discoloured in gathered patches, skin slipping, the blood a
  crust, maggot masses in the openings (the game animates more of them on top).
Lit from the upper left, hue-shifted ramps, gathered clusters and runs (no speckle), one dark outline on what is added.
Writes spr/lpc/obj/<name>_x[2][_cu].png, their entries to spr/lpc/gorex.json (not objects.json) and gx374_meta.json (where the game animates the
maggots, the drip and the twitch). Run from the folder that holds spr/."""
import json, math, os, sys
_here = os.path.dirname(os.path.abspath(__file__))
_src = open(os.path.join(_here, 'gore4.py')).read()
exec(_src[:_src.index('# ============================== the deer, laid on its side')])
from PIL import Image

OBJ = json.load(open('spr/lpc/objects.json'))
OBJ.update(json.load(open('spr/lpc/gorex.json')) if os.path.exists('spr/lpc/gorex.json') else {})
XB = [(14, 2, 8), (30, 4, 12), (50, 7, 16), (76, 12, 20), (110, 22, 28), (170, 64, 62)]   # Extreme blood: black-red, violet in the dark, warm in the wet
CRUST = [(22, 10, 10), (36, 16, 14), (52, 24, 18), (70, 34, 24)]
MUS = ramp('#a2363c', spread=1)          # muscle
FATX = ramp('#e0c48a', spread=.55)       # fat, yellow
MEMB = (226, 190, 200)                   # membrane sheen
MARROW = [(140, 52, 60), (186, 104, 104)]
BRAIN = ramp('#c8a0a0', spread=.6)
MAG = [(90, 74, 56), (160, 144, 110), (204, 192, 156), (232, 224, 196)]   # maggots: shadow, body, lit, glint
ROT = ramp('#7e8a62', spread=.7)         # discoloured skin: grey-green
BRUISE = ramp('#5c4a6a', spread=.8)      # marbling, violet
SLIP = ramp('#b4a690', spread=.4)        # slipped skin
TEND = [(150, 130, 110), (210, 196, 170), (236, 228, 208)]
META = {}
GUTX = ramp('#9a5262', spread=.7); GUTX2 = ramp('#84485a', spread=.75); LUNGX = ramp('#8e4656', spread=.8)


def w0(name):
    """the world sprite's original anchor, before the adult pass"""
    o = os.path.join('spr/lpc/obj/g3', name + '.png.json')
    return json.load(open(o)) if os.path.exists(o) else OBJ[name]


class XC:
    """an Extreme canvas over a Full sprite: world coordinates in (the world sprite's own pixels), canvas pixels out"""
    def __init__(s, name, S, pad=8, cu=False):
        s.name, s.S, s.pad, s.cu = name, S, pad, cu
        w = OBJ[name]; s.fw, s.fh, s.ax, s.ay = w['fw'], w['fh'], w['ax'], w['ay']
        m = OBJ[name + '_cu'] if cu else w
        ox, oy = (m['ax'] - w['ax'] * S, m['ay'] - w['ay'] * S) if cu else (0, 0)
        s.W, s.H = int(math.ceil((s.fw + 2 * pad) * S)), int(math.ceil((s.fh + 2 * pad) * S))
        s.c = C(s.W, s.H)
        src = m['src']; s.orig = os.path.join('spr/lpc/obj/g3', os.path.basename(src))
        if getattr(XC, 'from_orig', False):   # the adult pass starts from the gore3 original every time (never from its own output)
            if not os.path.exists(s.orig): os.makedirs('spr/lpc/obj/g3', exist_ok=True); Image.open(src).save(s.orig); json.dump(m, open(s.orig + '.json', 'w'))
            m = json.load(open(s.orig + '.json')); src = s.orig
            if cu: ox, oy = m['ax'] - w0(name)['ax'] * S, m['ay'] - w0(name)['ay'] * S
            s.ax, s.ay = (w0(name)['ax'], w0(name)['ay'])
        s.base = Image.open(src).convert('RGBA'); s.bx, s.by = int(round(pad * S - ox)), int(round(pad * S - oy))
        s.snap = None
    # world -> canvas
    def X(s, x): return (x + s.pad) * s.S
    def Y(s, y): return (y + s.pad) * s.S
    def r(s, v): return v * s.S
    def p(s, x, y, col, a=255): s.c.p(s.X(x), s.Y(y), col, a)
    def lay_base(s, recolor=True):
        im = s.base.copy()
        if recolor:
            px = im.load()
            for v in range(im.height):
                for u in range(im.width):
                    q = px[u, v]
                    if q[3] > 120 and is_blood(q): px[u, v] = deepen(q) + (q[3],)
        s.c.im.alpha_composite(im, (s.bx, s.by)); s.c.px = s.c.im.load()
        s.snap = s.c.im.copy()
    def F(s): return F(s.W, s.H)
    def inside_base(s, X, Y):
        u, v = int(X) - s.bx, int(Y) - s.by
        return 0 <= u < s.base.width and 0 <= v < s.base.height and s.base.getpixel((u, v))[3] > 120


def lumi(q): return .3 * q[0] + .59 * q[1] + .11 * q[2]
def is_blood(q):
    r, g, b = q[:3]
    return r > 40 and r > g * 2.1 and r > b * 1.5 and lumi(q) < 96
def deepen(q):
    """Full blood becomes Extreme blood of the same rank: darker, wetter, toward violet-black"""
    l = lumi(q); i = 0 if l < 22 else 1 if l < 34 else 2 if l < 48 else 3 if l < 66 else 4
    return XB[i]


# ---------------------------------------------------------------- the kit (world coordinates, any scale)
def xpool(z, x, y, rx, ry, seed, clots=3, tongues=2, glint=True):
    """thick blood: a lobed black-red pool, a lit wet crescent on its upper left, clots standing in it, tongues running off"""
    c, S = z.c, z.S; cx, cy, RX, RY = z.X(x), z.Y(y), rx * S, ry * S
    pts = {}
    for Y in range(int(cy - RY * 1.5) - 2, int(cy + RY * 1.5) + 3):
        for X in range(int(cx - RX * 1.5) - 2, int(cx + RX * 1.5) + 3):
            dx, dy = (X + .5 - cx) / RX, (Y + .5 - cy) / RY; a = math.atan2(dy, dx)
            w = 1 + .2 * math.sin(a * 3 + seed) + .12 * math.sin(a * 5 + seed * 2.3) + .06 * math.sin(a * 9 + seed * .7)
            d = (dx * dx + dy * dy) / (w * w)
            if d < 1: pts[(X, Y)] = (d, dx, dy)
    for k in range(tongues):   # tongues: the pool runs off downhill (down and right) in a narrowing finger
        a = .35 + H(k, seed, 3) * 1.1; L = (1.2 + H(k, seed, 4) * .9)
        for j in range(int(L * max(RX, RY))):
            t = j / (L * max(RX, RY)); ww = max(.6, (1 - t) * RY * .28)
            px_ = cx + math.cos(a) * RX * (.85 + t * L * .9); py_ = cy + math.sin(a) * RY * (.85 + t * L * .9)
            for v in range(-int(ww), int(ww) + 1):
                q = (int(px_), int(py_ + v))
                if q not in pts: pts[q] = (.9, 0, 0)
    for (X, Y), (d, dx, dy) in pts.items():
        sheen = dx < .1 and dy < .05 and .22 < d < .74 and H(X // max(1, S * 2), Y // max(1, S), seed) < .9
        col = XB[1] if d > .8 else (XB[4] if d < .45 and dx < -.3 else XB[3]) if sheen else XB[2] if d > .3 else XB[1]
        c.p(X, Y, col)
    for k in range(clots):   # clots: dark jelly lumps, lit on their upper left
        a = H(k, seed, 7) * 6.28; rr = H(k, seed, 8) * .6
        ox_, oy_ = x + math.cos(a) * rx * rr, y + math.sin(a) * ry * rr; cr = (.7 + H(k, seed, 9) * .7)
        clot(z, ox_, oy_, cr, cr * .62, seed + k)
    for k in range(int(6 + RX / max(1, S) * .6)):   # clotted edges: lumps standing on the rim
        a = H(k, seed, 12) * 6.28; w = 1 + .2 * math.sin(a * 3 + seed) + .12 * math.sin(a * 5 + seed * 2.3)
        clot(z, x + math.cos(a) * rx * w * .92, y + math.sin(a) * ry * w * .92, .45 + H(k, seed, 13) * .4, .32 + H(k, seed, 14) * .2, seed + k * 3)
    if glint:   # the wet lights: a warm orange-pink run along the lit crescent, and a glint
        n = int(max(3, RX * .5))
        for k in range(n):
            a = 3.6 + k / n * 1.1; gx, gy = cx + math.cos(a) * RX * .55, cy + math.sin(a) * RY * .5
            c.p(gx, gy, (214, 112, 92) if k % 3 else XB[5])
            if S >= 2 and k % 2: c.p(gx, gy + 1, XB[4])
        gx, gy = cx - RX * .2, cy - RY * .15; c.p(gx, gy, (236, 150, 124)); c.p(gx + 1, gy, XB[4])
    return pts


def clot(z, x, y, rx, ry, seed):
    c, S = z.c, z.S; cx, cy, RX, RY = z.X(x), z.Y(y), max(1, rx * S), max(.8, ry * S)
    for Y in range(int(cy - RY) - 1, int(cy + RY) + 2):
        for X in range(int(cx - RX) - 1, int(cx + RX) + 2):
            dx, dy = (X + .5 - cx) / RX, (Y + .5 - cy) / RY; d = dx * dx + dy * dy
            if d > 1: continue
            c.p(X, Y, XB[3] if (dx + dy < -.7 and d > .2) else XB[0] if d > .55 and dy > 0 else XB[1])
    if S >= 2: c.p(cx - RX * .4, cy - RY * .45, XB[4])


def xrun(z, x, y, L, w, seed=0, bead=True):
    """a run: from (x, y) down, w wide at the top narrowing to 1 px, a lit left edge, a bead at its foot"""
    c, S = z.c, z.S; X0, Y0 = z.X(x), z.Y(y); LL = int(L * S); ww0 = w * S
    for k in range(LL):
        t = k / max(1, LL); ww = max(1, int(round(ww0 * (1 - t * .7) + .3))); sway = int(round(math.sin(k * .3 / S + seed) * .6 * S))
        for u in range(ww): c.p(X0 + u + sway, Y0 + k, XB[2] if u else XB[3] if S > 1 and k % (3 * S) < 2 * S else XB[2])
        if ww > 2: c.p(X0 + ww - 1 + sway, Y0 + k, XB[1])
    if bead:
        bw = max(1, int(ww0 * .8) + (1 if S > 1 else 0))
        for u in range(-1 if S > 1 else 0, bw + 1):
            c.p(X0 + u, Y0 + LL, XB[1]); c.p(X0 + u, Y0 + LL + 1, XB[0])
        c.p(X0, Y0 + LL, XB[4])


def xtube(z, pts, r0, r1, R=None, rim=True, seed=0, wet=True):
    """a length of gut at any scale, cut into short lengths (critic: one even tube with one highlight reads as a sausage, a worm or a
    spring): each length swells and narrows on its own, lit on its own upper side, a dark wet crease where it meets the next, and a
    darker rim where it lies over a coil already down; a rim of its own blood under it"""
    R = R or GUTX; c, S = z.c, z.S
    path = []
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        n = max(2, int(math.hypot(bx - ax, by - ay) * S * 1.6))
        for i in range(n): t = i / n; path.append((ax + (bx - ax) * t, ay + (by - ay) * t))
    path.append(pts[-1]); N = len(path)
    segs = []; k = 0; j = 0   # short lengths of uneven size
    while k < N - 1:
        L = max(2, int((1.4 + H(j, seed, 21) * 2.2) * S * 1.6)); segs.append((k, min(N - 1, k + L))); k += L; j += 1
    mine = set(); under = {q for q in getattr(z, 'gutpx', set())}
    for si, (k0, k1) in enumerate(segs):
        sw = .72 + H(si, seed, 22) * .55; hi = H(si, seed, 23) < .6
        cur = {}
        for k in range(k0, k1 + 1):
            x, y = path[k]; f = (k - k0) / max(1, k1 - k0); r = max(.5, (r0 + (r1 - r0) * k / N) * S * sw * (.82 + .3 * math.sin(math.pi * f)))
            X, Y = z.X(x), z.Y(y)
            if rim and k % 2 == 0: c.p(X, Y + r + 1, XB[1])
            for dy in range(-int(r) - 1, int(r) + 2):
                for dx in range(-int(r) - 1, int(r) + 2):
                    d = (dx * dx + dy * dy) / (r * r + .01)
                    if d > 1: continue
                    l = -(dx * .6 + dy * .8) / (r + .01); q = (int(round(X + dx)), int(round(Y + dy)))
                    edge = d > .62
                    col = R[4] if (l > .55 and hi and .2 < f < .75) else R[3] if l > .05 else R[2] if l > -.55 else R[1]
                    if edge and l < 0: col = R[1] if d < .85 else R[0]
                    coat = H(int(q[0] / max(2, 2 * S)), int(q[1] / max(2, 2 * S)), seed + 31) < .3 and l < .3
                    if coat: col = XB[3] if l > -.3 else XB[2]
                    cur[q] = (col, d)
        for q, (col, d) in cur.items():
            if d > .55 and q in under and q not in cur: pass
            c.p(q[0], q[1], col)
        for q, (col, d) in cur.items():   # where this length lies on gut already down, its edge goes dark and wet
            if d > .55 and any((q[0] + a_, q[1] + b_) in under for a_, b_ in ((1, 0), (-1, 0), (0, 1), (0, -1))): c.p(q[0], q[1], R[0])
        if si:   # the crease between this length and the last
            x, y = path[k0]; x2, y2 = path[min(N - 1, k0 + 1)]; nx, ny = -(y2 - y), (x2 - x); L_ = math.hypot(nx, ny) or 1; r = r0 * S * .85
            for u in range(-int(r), int(r) + 1): c.p(z.X(x) + nx / L_ * u, z.Y(y) + ny / L_ * u, R[0])
            if S >= 2: c.p(z.X(x) + nx / L_ * (-r * .6) + 1, z.Y(y) + ny / L_ * (-r * .6), XB[4])   # wet in the fold
        mine |= set(cur); under |= set(cur)
    z.gutpx = under
    return path


def xorgans(z, items, mats=None):
    """organs with their own shapes (critic: perfect balls): a liver in two lobes with a notch, a kidney bean with its dent and
    vessel, a heart tapering to its point with the vessels standing out of its top and a band of fat, a lung's spongy lobe"""
    S = z.S
    for (mat, x, y, rx, ry, rot) in items:
        f = z.F(); X, Y = z.X(x), z.Y(y); cr, sr = math.cos(rot), math.sin(rot)
        P = lambda u, v: (X + (u * cr - v * sr) * S, Y + (u * sr + v * cr) * S)
        if mat == 'liver':
            f.blob(*P(-rx * .35, 0), rx * .72 * S, ry * S, 'liver', base=1.3 * S, hs=.85, rot=rot - .2)
            f.blob(*P(rx * .45, ry * .15), rx * .5 * S, ry * .8 * S, 'liver', base=1.1 * S, hs=.85, rot=rot + .3)
        elif mat == 'kidney':
            f.blob(*P(0, 0), rx * S, ry * S, 'kidney', base=1.2 * S, hs=.9, rot=rot)
        elif mat == 'heart':
            f.cap(*P(0, -ry * .35), *P(rx * .25, ry * .9), rx * .95 * S, rx * .3 * S, 'heart', base=1.3 * S, hs=.9)
            f.cap(*P(-rx * .3, -ry * .7), *P(-rx * .4, -ry * 1.5), .38 * rx * S, .32 * rx * S, 'vessel', base=2 * S, hs=.7)
            f.cap(*P(rx * .25, -ry * .75), *P(rx * .55, -ry * 1.35), .3 * rx * S, .25 * rx * S, 'vessel2', base=2 * S, hs=.7)
        elif mat in ('lung', 'lungx'):
            f.blob(*P(0, 0), rx * S, ry * S, mat, base=1.2 * S, hs=.75, rot=rot)
            f.blob(*P(rx * .55, -ry * .3), rx * .5 * S, ry * .6 * S, mat, base=1.1 * S, hs=.75, rot=rot)
        else: f.blob(X, Y, rx * S, ry * S, mat, base=1.5 * S, hs=.9, rot=rot)
        f.render(z.c, dict(OM, vessel=[(120, 60, 70), (150, 84, 92), (180, 116, 120), (206, 150, 150), (226, 180, 176), (240, 210, 200)],
                           vessel2=[(60, 20, 40), (84, 30, 52), (110, 44, 66), (136, 62, 82), (160, 86, 100), (190, 120, 130)]))
        c = z.c
        if mat == 'kidney':   # the dent, with its vessel
            dx_, dy_ = P(0, -ry * .85)
            for k in range(max(1, int(S * .8))): c.p(dx_ + k * sr, dy_ + k * cr, KIDNEY[0])
            c.p(dx_, dy_ - 1, (140, 60, 70))
        if mat == 'liver' and S >= 2:   # the notch between the lobes
            nx_, ny_ = P(rx * .08, -ry * .7)
            for k in range(int(1.2 * S)): c.p(nx_ + k * .3, ny_ + k, LIVER[0])
        if mat == 'heart' and S >= 2:   # the fat band across its top
            for k in range(int(rx * 1.3 * S)): fx_, fy_ = P(-rx * .65 + k / S, -ry * .3 + k / S * .1); c.p(fx_, fy_, FATX[2] if k % 4 else FATX[1])
        if mat in ('lung', 'lungx') and S >= 2:   # spongy: darker gathered pits
            for k in range(int(rx * ry * 1.2)):
                u = (H(k, int(x * 10), 3) - .5) * rx * 1.4; v = (H(k, int(y * 10), 4) - .5) * ry * 1.4; qx, qy = P(u, v)
                if c.px[int(qx), int(qy)][3] > 200: c.p(qx, qy, OM[mat][1]); c.p(qx + 1, qy, OM[mat][1])
        gx_, gy_ = P(-rx * .35, -ry * .45)   # one wet glint, warm
        c.p(gx_, gy_, (255, 214, 196) if S >= 2 else OM.get(mat, LIVER)[4])
        if S >= 2: c.p(gx_ + 1, gy_, OM.get(mat, LIVER)[4])


OM = {'heart': HEART, 'lung': LUNG, 'liver': LIVER, 'kidney': KIDNEY, 'stom': STOM, 'gut': GUT, 'spleen': SPLEEN, 'blad': BLAD, 'mus': MUS,
      'bone': BONE, 'brain': BRAIN, 'lungx': LUNGX, 'fat': FATX, 'skin': SKIN, 'dead': DEAD}


def xbone(z, x0, y0, x1, y1, r0, r1=None, gnaw=True, seed=0, meat=0.):
    """a bone: a lit capsule, its end broken and gnawed (tooth notches, splinters) with the marrow showing; meat: a ragged sleeve
    of muscle still on its first part"""
    S = z.S; r1 = r0 if r1 is None else r1
    f = z.F()
    f.cap(z.X(x0), z.Y(y0), z.X(x1), z.Y(y1), r0 * S, r1 * S, 'bone', base=1 * S, hs=.8)
    f.blob(z.X(x0), z.Y(y0), r0 * S * 1.35, r0 * S * 1.2, 'bone', base=1 * S, hs=.8)   # the knuckle at the joint end
    f.render(z.c, OM)
    if meat > 0:
        L = math.hypot(x1 - x0, y1 - y0) or 1
        for j in range(int(L * meat * S * 1.5)):
            t = j / (L * S * 1.5); xx, yy = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t; rr = (r0 + .6) * S * (1 - .3 * H(j // max(1, S), seed, 2))
            nx, ny = -(y1 - y0) / L, (x1 - x0) / L
            for u in range(-int(rr), int(rr) + 1):
                if H(j // max(1, S), u // max(1, S), seed) < .22: continue
                z.c.p(z.X(xx) + nx * u, z.Y(yy) + ny * u, MUS[3] if u < -rr * .3 else MUS[2] if u < rr * .4 else MUS[1])
    if gnaw:   # the broken end: notches bitten out, the marrow pink inside, a dark split
        X, Y = z.X(x1), z.Y(y1); R = max(1, r1 * S)
        dx, dy = (x1 - x0), (y1 - y0); L = math.hypot(dx, dy) or 1; ux, uy = dx / L, dy / L
        for Y_ in range(int(Y - R * 1.6), int(Y + R * 1.6) + 1):
            for X_ in range(int(X - R * 1.6), int(X + R * 1.6) + 1):
                along = (X_ + .5 - X) * ux + (Y_ + .5 - Y) * uy; side = -(X_ + .5 - X) * uy + (Y_ + .5 - Y) * ux
                if along > -R * .1 and abs(side) < R * 1.1 and (H(int(side / max(1, S * .6)), seed, 3) < .6 or along > R * .45): z.c.p(X_, Y_, (0, 0, 0), 0)
        z.c.p(X - ux * R * .2, Y - uy * R * .2, MARROW[1]); z.c.p(X - ux * R * .2 + uy, Y - uy * R * .2 - ux, MARROW[0])
        if S >= 2:
            for k in range(int(R)): z.c.p(X - ux * (R * .5 + k) - uy * R * .3, Y - uy * (R * .5 + k) + ux * R * .3, BONE[1])   # a split along the shaft
            for k in range(3):   # tooth scores: short dark grooves across the shaft near the end
                t = 1.2 + k * 1.1 + H(k, seed, 6)
                for u in range(-int(R * .7), int(R * .7) + 1): z.c.p(X - ux * t * S + -uy * u, Y - uy * t * S + ux * u, BONE[0] if u % 2 == 0 else BONE[1])


def xflay(z, poly, ang=0., seed=0, flap=None, lip=True):
    """skin off: the muscle under it as one lit form (a height field), its fibres as broken darker lines along ang, a pale membrane
    glint, the cut edge a dark lip with the yellow fat showing just inside it"""
    S = z.S; P_ = [(z.X(x), z.Y(y)) for x, y in poly]
    f = z.F(); f.poly(P_, 'mus', base=.4 * S, hs=.9 * max(1, S * .7)); f.render(z.c, OM)
    inside = {(X, Y) for Y in range(f.H) for X in range(f.W) if f.m[Y][X] == 'mus'}
    ca, sa = math.cos(ang), math.sin(ang); xs = [p[0] for p in P_]; ys = [p[1] for p in P_]; cx_ = sum(xs) / len(xs); cy_ = sum(ys) / len(ys)
    gap = max(2, int(2.2 * S))
    for (X, Y) in inside:
        e = 0
        while e < 2 * S and all((X + dx * (e + 1), Y + dy * (e + 1)) in inside for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): e += 1
        if e < max(1, S // 2): z.c.p(X, Y, XB[1] if lip or H(X // max(1, S), Y // max(1, S), seed + 4) < .35 else MUS[1]); continue
        if S >= 2 and e < S: z.c.p(X, Y, FATX[1] if (Y > cy_ and H(X // S, Y // S, seed) < .45) else MUS[1]); continue
        v = -(X - cx_) * sa + (Y - cy_) * ca; u = (X - cx_) * ca + (Y - cy_) * sa
        if int(v + 1000) % gap == 0 and H(int(u // max(2, 2 * S)), int(v), seed) < .62:
            q = z.c.px[X, Y][:3]; i = MUS.index(q) if q in MUS else 2; z.c.p(X, Y, MUS[max(0, i - 1)])
    if S >= 2:
        for k in range(int(2 * S)): z.c.p(cx_ - (max(xs) - min(xs)) * .2 + ca * k, cy_ - (max(ys) - min(ys)) * .25 + sa * k, MEMB if k % 3 else MUS[5])
    return inside


def xcavity(z, cx, cy, rx, ry, seed, rot=0.):
    """an opening into a body: a torn, dark inside; the lip lit a little only on the near (lower) side; never a ring"""
    S = z.S; X0, Y0, RX, RY = z.X(cx), z.Y(cy), rx * S, ry * S; cr, sr = math.cos(rot), math.sin(rot); pts = {}
    for Y in range(int(Y0 - max(RX, RY) * 1.4) - 1, int(Y0 + max(RX, RY) * 1.4) + 2):
        for X in range(int(X0 - max(RX, RY) * 1.4) - 1, int(X0 + max(RX, RY) * 1.4) + 2):
            dx, dy = X + .5 - X0, Y + .5 - Y0; u = (dx * cr + dy * sr) / RX; v = (-dx * sr + dy * cr) / RY; a = math.atan2(v, u)
            w = 1 + .18 * math.sin(a * 4 + seed) + .1 * math.sin(a * 9 + seed * 2) + .07 * math.sin(a * 13 + seed)
            if v < 0: w *= 1 - .12 * (H(int(a * 6), seed, 2) < .5)   # the far lip torn in steps
            d = (u * u + v * v) / (w * w)
            if d < 1: pts[(X, Y)] = (d, u, v)
    for (X, Y), (d, u, v) in pts.items():
        col = (MUS[2] if v > 0 and H(X // max(1, S), Y, seed) < .7 else XB[1]) if d > .82 else MUS[1] if d > .62 and v > .1 else XB[0] if d < .35 else XB[1]
        z.c.p(X, Y, col)
    return pts


def strand(z, pts, R=TEND, w=1):
    """a tendon or a strip of skin: a pale cord, lit on top"""
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        n = max(2, int(math.hypot(bx - ax, by - ay) * z.S * 1.5))
        for i in range(n):
            t = i / n; x, y = ax + (bx - ax) * t, ay + (by - ay) * t
            for k in range(max(1, int(w * z.S * .5))): z.c.p(z.X(x), z.Y(y) + k, R[1] if k else R[2])
            if z.S >= 2: z.c.p(z.X(x), z.Y(y) + max(1, int(w * z.S * .5)), R[0])


def maggots(z, x, y, rx, ry, seed, n=None):
    """a maggot mass: grains gathered into one heaving lump, each a short pale capsule lit at its top-left, dark between"""
    c, S = z.c, z.S; n = n or max(5, int(rx * ry * 2.2))
    X0, Y0 = z.X(x), z.Y(y)
    if S == 1:   # at 1x: one lumpy pale cluster with dark seams, never loose dots
        for Y in range(int(Y0 - ry) - 1, int(Y0 + ry) + 2):
            for X in range(int(X0 - rx) - 1, int(X0 + rx) + 2):
                d = ((X + .5 - X0) / rx) ** 2 + ((Y + .5 - Y0) / ry) ** 2
                if d > 1: continue
                c.p(X, Y, MAG[2] if (X + Y * 2 + seed) % 3 else MAG[1] if d < .5 else MAG[0])
        c.p(X0 - rx * .4, Y0 - ry * .4, MAG[3]); return
    g = []
    for k in range(n):
        a = H(k, seed, 1) * 6.28; rr = math.sqrt(H(k, seed, 2)) * .85; g.append((X0 + math.cos(a) * rx * S * rr, Y0 + math.sin(a) * ry * S * rr, H(k, seed, 3) * 3.14))
    g.sort(key=lambda q: q[1])
    for (gx, gy, ga) in g:
        L = 1.1 * S; ca, sa = math.cos(ga), math.sin(ga) * .6
        for t in range(-int(L), int(L) + 1):
            for w in (0, 1):
                X, Y = gx + ca * t * .5, gy + sa * t * .5 + w
                c.p(X, Y, MAG[2] if w == 0 and t < 0 else MAG[1] if w == 0 else MAG[0])
        c.p(gx - ca * L * .4, gy - sa * L * .4, MAG[3])


# ---------------------------------------------------------------- decay (the next day)
def decay(z, regions, bloat=(), seed=0):
    """the next day: skin in the regions turns grey-green with violet marbling in gathered patches, the skin slips in pale sheets,
    the blood dries to a crust (pools keep a black wet middle), and the swollen parts push out (bloat: dilate inside an ellipse)"""
    c, S = z.c, z.S; W, Hh = c.W, c.H; px = c.px
    inreg = lambda X, Y: any(((X - z.X(x)) / (rx * S)) ** 2 + ((Y - z.Y(y)) / (ry * S)) ** 2 < 1 for (x, y, rx, ry) in regions)
    for (x, y, rx, ry, k) in bloat:   # the swelling: each body pixel on the edge inside the ellipse pushes out k px
        for it in range(max(1, int(k * S))):
            src = c.im.copy(); sp = src.load()
            for Y in range(int(z.Y(y) - ry * S) - 2, int(z.Y(y) + ry * S) + 3):
                for X in range(int(z.X(x) - rx * S) - 2, int(z.X(x) + rx * S) + 3):
                    if not (0 < X < W - 1 and 0 < Y < Hh - 1) or sp[X, Y][3] > 200: continue
                    if ((X - z.X(x)) / (rx * S)) ** 2 + ((Y - z.Y(y)) / (ry * S)) ** 2 > 1: continue
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        q = sp[X + dx, Y + dy]
                        if q[3] > 200 and not is_blood(q) and lumi(q) > 30: px[X, Y] = q; break
    for Y in range(Hh):
        for X in range(W):
            q = px[X, Y]
            if q[3] < 200: continue
            if is_blood(q) or q[:3] in XB:
                l = lumi(q); dry = H(X // max(2, S * 3), Y // max(2, S * 2), seed) < .7
                if dry: px[X, Y] = (CRUST[0] if l < 14 else CRUST[1] if l < 26 else CRUST[2] if l < 44 else CRUST[3]) + (255,)
                continue
            if not inreg(X, Y): continue
            r, g, b = q[:3]
            if not (r >= g >= b - 6 and r - b > 18 and lumi(q) > 60): continue   # skin and pale flesh only
            l = lumi(q); i = 0 if l < 70 else 1 if l < 100 else 2 if l < 135 else 3 if l < 175 else 4
            pt = (math.sin(X / (5.0 * S) + seed) + math.sin(Y / (4.0 * S) - seed * .7) + math.sin((X + Y) / (7.0 * S)))
            if pt > 1.55: col = SLIP[min(4, i)]                    # the skin slipping: a pale sheet, loose
            elif pt < -.9: col = BRUISE[i]                         # marbling
            else: col = ROT[i]
            px[X, Y] = col + (255,)
    if S >= 2:   # the slipped sheets get a dark torn edge on their lower side; the marbling a few vein lines
        src = c.im.copy(); sp = src.load()
        for Y in range(1, Hh - 1):
            for X in range(1, W - 1):
                if sp[X, Y][:3] in SLIP and sp[X, Y][3] > 200 and sp[X, Y + 1][:3] not in SLIP and sp[X, Y + 1][3] > 200: px[X, Y + 1] = ROT[0] + (255,)


# ---------------------------------------------------------------- finishing
def finish(z, name, meta=None):
    """an outline round only what was added outside the Full sprite (never a second one round its own), a shadow under it, save"""
    c = z.c; px = c.px; snap = z.snap.load()
    new = lambda X, Y: 0 <= X < c.W and 0 <= Y < c.H and px[X, Y][3] > 200 and snap[X, Y][3] < 120
    pts = []
    for Y in range(c.H):
        for X in range(c.W):
            if px[X, Y][3] > 120: continue
            nb = [(dx, dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if new(X + dx, Y + dy)]
            if nb: pts.append((X, Y, nb))
    for X, Y, nb in pts:
        q = px[X + nb[0][0], Y + nb[0][1]]
        if q[:3] in XB or q[:3] in CRUST: continue   # flat blood on the grass needs no outline
        top_left = all(d in ((1, 0), (0, 1)) for d in nb)
        c.p(X, Y, tuple(int(v * .5) for v in q[:3]) if top_left else OUT)
    ax, ay = z.X(z.ax), z.Y(z.ay)
    bb = c.im.getbbox(); c.im = c.im.crop(bb); c.px = c.im.load(); c.W, c.H = c.im.size; ax -= bb[0]; ay -= bb[1]
    nm = name + ('_cu' if z.cu else '')
    if z.cu and c.H > 131:
        cut = c.H - 131; c.im = c.im.crop((0, cut, c.W, c.H)); c.px = c.im.load(); c.H = 131; ay -= cut
    done(nm, c, ax, ay)
    if meta is not None:
        m = SPR[nm]; META[nm] = dict(meta, S=z.S, ax=m['ax'], ay=m['ay'])


def both(fn, name, S, pad, **kw):
    """draw one description at the world size and at the close-up's, fresh and a day old"""
    for cu in (False, True):
        for day in (0, 1):
            z = XC(name, S if cu else 1, pad, cu); meta = fn(z, day, **kw)
            finish(z, name + ('_x2' if day else '_x'), meta)


# ================================================================ the five people
BEARD = [(30, 24, 22), (46, 36, 30), (64, 50, 40), (86, 70, 58), (124, 116, 108)]
def beard(z, x0, y0, x1, y1, seed=0):
    """stubble and a short beard over the skin in a box (an adult: the chibi model reads young without it), grey in it"""
    c, S = z.c, z.S
    for Y in range(int(z.Y(y0)), int(z.Y(y1)) + 1):
        for X in range(int(z.X(x0)), int(z.X(x1)) + 1):
            q = c.px[X, Y] if 0 <= X < c.W and 0 <= Y < c.H else (0, 0, 0, 0)
            if q[3] < 200 or not (q[0] > q[1] > q[2] and lumi(q) > 100): continue
            l = lumi(q); col = BEARD[0] if l < 140 else BEARD[1] if l < 175 else BEARD[2]
            if S >= 2 and H(X // 2, Y, seed) < .12: col = BEARD[4]
            c.p(X, Y, col)
def grey_hair(z, box, seed=0):
    """grey through the hair where it meets the skin (temples), in short strands"""
    c, S = z.c, z.S; x0, y0, x1, y1 = [int(v) for v in (z.X(box[0]), z.Y(box[1]), z.X(box[2]), z.Y(box[3]))]
    src = c.im.copy(); sp = src.load()
    for Y in range(max(1, y0), min(c.H - 1, y1)):
        for X in range(max(1, x0), min(c.W - 1, x1)):
            q = sp[X, Y]
            if q[3] < 200 or lumi(q) > 70 or not (q[0] >= q[2]): continue
            near = any(sp[X + a, Y + b][3] > 200 and lumi(sp[X + a, Y + b]) > 110 and sp[X + a, Y + b][0] > sp[X + a, Y + b][2] + 20 for a in range(-2 * S, 2 * S + 1, max(1, S)) for b in range(-S, S + 1, max(1, S)) if 0 <= X + a < c.W and 0 <= Y + b < c.H)
            if near and H(X // max(1, S), (Y + X) // max(1, S * 2), seed) < .55: c.p(X, Y, (118, 112, 106) if lumi(q) > 30 else (92, 88, 84))
def ring(z, x, y, vertical=True):
    """a wedding band: a gold line across one finger"""
    S = z.S; n = max(1, int(.5 * S + .5))
    for k in range(max(1, int(S * .8))):
        for w in range(n): z.c.p(z.X(x) + (w if vertical else k), z.Y(y) + (k if vertical else w), (226, 190, 84) if k == 0 else (176, 132, 52))
def cigs(z, x, y):
    """a crushed packet of cigarettes on the grass: white, a red top, two cigarettes out"""
    f = z.F(); S = z.S; f.poly([(z.X(x), z.Y(y)), (z.X(x + 2.4), z.Y(y - .3)), (z.X(x + 2.6), z.Y(y + 1.5)), (z.X(x + .2), z.Y(y + 1.8))], 'box', base=.6 * S, hs=.4)
    f.render(z.c, {'box': [(120, 116, 108), (176, 170, 160), (206, 200, 190), (226, 222, 212), (240, 236, 228), (250, 248, 242)]})
    for k in range(int(2.4 * S)): z.c.p(z.X(x) + k, z.Y(y) - k * .12, (150, 30, 34)); z.c.p(z.X(x) + k, z.Y(y) + 1 - k * .12, (180, 44, 44)) if S > 1 else None
    for k in range(int(1.6 * S)): z.c.p(z.X(x + 2.8) + k, z.Y(y + 1) + k * .2, (236, 232, 220) if k < 1.2 * S else (200, 130, 60))


def xflap(z, poly, hinge, seed=0, cloth=None):
    """a flap of the back cut free and folded out on to the grass: its raw underside up (muscle in fibres, the fat band and a strip
    of the cloth showing at the far edge where it folds over); hinge: 'up' or 'down', the side it is still joined on"""
    ins = xflay(z, poly, 0., seed)
    if cloth:
        S = z.S; far = -1 if hinge == 'down' else 1   # the far edge is away from the hinge
        for (X, Y) in ins:
            if (X, Y - far * 1) not in ins or (X, Y - far * max(1, S // 2)) not in ins: pass
            if (X, Y + far) not in ins and (X, Y - far) in ins:
                for k in range(max(1, S // 2)): z.c.p(X, Y - far * k, cloth[1] if k == 0 else cloth[0])
    return ins


SKN = [(112, 74, 70), (156, 110, 96), (192, 146, 124), (218, 178, 154), (234, 204, 182), (246, 224, 204)]
def hiker_head(z, full=False):
    """the head at the close-up's own pixel size (critic: the enlarged face was a mosaic of 3 px blocks beside 1 px gore, the hair
    radial stripes like an umbrella): the face one lit form (cheek, the ear, the shut eye, a stubble shadow along the jaw), the
    hair in locks of three tones, and one ragged split across the crown, dark inside, one pale edge of bone. At world size: stubble"""
    c, S = z.c, z.S
    if S == 1:   # the world sprite: a soft stubble shadow along the jaw, two pixels deep, one tone (dots would read as teeth)
        for Y in range(c.H):
            for X in range(c.W):
                x, y = X - z.pad, Y - z.pad
                if not (19 <= x <= 27 and 22 <= y <= 30): continue
                q = c.px[X, Y]
                if q[3] > 200 and lumi(q) > 110 and q[0] > q[2] and (x - 19) + (y - 22) * 1.1 > 9.5: c.p(X, Y, (150, 128, 116) if lumi(q) > 160 else (124, 106, 98))
        return
    ox, oy = z.bx, z.by; X0, X1, Y0, Y1 = ox + 14, ox + 84, oy + 26, oy + 86
    skin = set(); hair = set()
    for Y in range(Y0, Y1):
        for X in range(X0, X1):
            q = c.px[X, Y]
            if q[3] < 200: continue
            l = lumi(q)
            if q[0] > q[1] > q[2] and q[0] - q[2] > 30 and l > 100 and X > ox + 40: skin.add((X, Y))
            elif l < 72 and not is_blood(q) and q[:3] not in XB and not (q[1] > q[0]) and X < ox + 76: hair.add((X, Y))
    def dist(M, X, Y, cap):
        d = 0
        while d < cap and all((X + a * (d + 1), Y + b * (d + 1)) in M for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))): d += 1
        return d
    for _ in range(3):   # the old face's leftover feature blocks (3 px) inside the face join the skin; they are drawn again below at 1 px
        add = []
        for Y in range(Y0, Y1):
            for X in range(X0, X1):
                q = c.px[X, Y]
                if (X, Y) in skin or (X, Y) in hair or q[3] < 200 or is_blood(q) or q[:3] in XB or q[1] > q[0]: continue
                if sum(((X + a, Y + b) in skin) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1))) >= 3: add.append((X, Y))
        skin |= set(add)
    for _ in range(2):   # round off the 3 px steps of the enlarged outline between face and hair: each edge pixel takes its neighbourhood's majority
        flip_s, flip_h = [], []
        for q in list(skin | hair):
            X, Y = q; ns = sum((X + a, Y + b) in skin for a in range(-2, 3) for b in range(-2, 3)); nh = sum((X + a, Y + b) in hair for a in range(-2, 3) for b in range(-2, 3))
            if q in skin and nh > ns + 3: flip_h.append(q)
            elif q in hair and ns > nh + 3: flip_s.append(q)
        for q in flip_h: skin.discard(q); hair.add(q)
        for q in flip_s: hair.discard(q); skin.add(q)
    hf = {q: math.sqrt(dist(skin, *q, 9) + 1) for q in skin}
    for (X, Y), h in hf.items():   # the face: one form, lit from the upper left
        gx = hf.get((X + 1, Y), h - .6) - hf.get((X - 1, Y), h - .6); gy = hf.get((X, Y + 1), h - .6) - hf.get((X, Y - 1), h - .6)
        l = (-gx * .55 - gy * .65) * 1.4 + h * .16
        jaw = (X - (ox + 58)) + (Y - (oy + 70)) * 1.1   # along the jaw, toward the neck: a soft stubble shadow, greyed
        col = SKN[4] if l > .9 else SKN[3] if l > .45 else SKN[2] if l > .05 else SKN[1]
        if jaw > 10: col = (118, 104, 96) if col in (SKN[1], SKN[2]) else (146, 128, 116)
        elif jaw > 6: col = SKN[max(1, SKN.index(col) - 1)]
        c.p(X, Y, col)
    ex, ey = ox + 61, oy + 72   # the shut eye: a lash line, the lid lit above it
    for k, dy in enumerate((0, 1, 1, 1, 0)): c.p(ex - 2 + k, ey + dy, (54, 36, 34)); c.p(ex - 2 + k, ey + dy - 1, SKN[3])
    c.p(ex - 3, ey - 2, (96, 70, 60)); c.p(ex - 2, ey - 3, (96, 70, 60)); c.p(ex - 1, ey - 3, (96, 70, 60))   # the brow, sparse
    ax_, ay_ = ox + 57, oy + 53   # the ear: a rim lit on top, the dark hollow inside
    for k in range(6):
        a = -1.2 + k * .5; c.p(ax_ + math.cos(a) * 2.6, ay_ + math.sin(a) * 3, SKN[4] if k < 3 else SKN[2])
    for k in range(3): c.p(ax_ + .5, ay_ - 1 + k, (110, 70, 64)); c.p(ax_ - .5, ay_ + k, SKN[1])
    hh = {q: dist(hair, *q, 6) for q in hair}
    for (X, Y), d in hh.items():   # the hair: three tones by form, then locks combed one way, from the crown down toward the face
        HR = [(26, 20, 18), (40, 30, 26), (58, 44, 34), (78, 60, 44)]
        col = HR[0] if d < 1 else HR[1] if (X + Y * .3) < ox + 40 or d < 3 else HR[2]
        lock = math.sin((X - ox) * .32 + (Y - oy) * .55 + math.sin((Y - oy) * .2) * 2)
        if d >= 1 and lock > .72: col = HR[3] if (Y - oy) < 52 else HR[2]
        elif d >= 1 and lock < -.8: col = HR[0]
        c.p(X, Y, col)
    if full: return
    split = [(ox + 23, oy + 45, 1), (ox + 27, oy + 42, 2), (ox + 31, oy + 42, 3), (ox + 35, oy + 40, 3), (ox + 39, oy + 41, 2), (ox + 43, oy + 39, 1)]   # one ragged split across the crown
    for (x0, y0, w0), (x1, y1, w1) in zip(split, split[1:]):
        for t in range(9):
            x = x0 + (x1 - x0) * t / 9; y = y0 + (y1 - y0) * t / 9; w = w0 + (w1 - w0) * t / 9 + (H(int(x), 2, 7) - .5)
            for u in range(-int(w) - 1, int(w) + 2): c.p(x, y + u, XB[0] if abs(u) < w else XB[2])
            if x < ox + 37: c.p(x, y + w + 2, BONE[3] if t % 9 else BONE[2])   # the bone's lip, on the near side only, in one length
    for k in range(7): c.p(ox + 33 + k * .2, oy + 46 + k, XB[2]); c.p(ox + 34 + k * .2, oy + 46 + k, XB[1])   # blood out of it, into the hair


def crown_split(z):
    """(Extreme) one ragged split across the crown, dark inside, the bone's lip on the near side, blood out of it into the hair"""
    c = z.c; ox, oy = z.bx, z.by
    split = [(ox + 23, oy + 45, 1), (ox + 27, oy + 42, 2), (ox + 31, oy + 42, 3), (ox + 35, oy + 40, 3), (ox + 39, oy + 41, 2), (ox + 43, oy + 39, 1)]   # one ragged split across the crown
    for (x0, y0, w0), (x1, y1, w1) in zip(split, split[1:]):
        for t in range(9):
            x = x0 + (x1 - x0) * t / 9; y = y0 + (y1 - y0) * t / 9; w = w0 + (w1 - w0) * t / 9 + (H(int(x), 2, 7) - .5)
            for u in range(-int(w) - 1, int(w) + 2): c.p(x, y + u, XB[0] if abs(u) < w else XB[2])
            if x < ox + 37: c.p(x, y + w + 2, BONE[3] if t % 9 else BONE[2])   # the bone's lip, on the near side only, in one length
    for k in range(7): c.p(ox + 33 + k * .2, oy + 46 + k, XB[2]); c.p(ox + 34 + k * .2, oy + 46 + k, XB[1])


def legs(z):
    """his legs kept, out behind him in work trousers, his boots soles-up (a grown man's length: the head is not most of him)"""
    S = z.S; f = z.F()
    f.cap(z.X(43.6), z.Y(18.4), z.X(53.4), z.Y(17.4), 2.5 * S, 2.1 * S, 'den', base=.8 * S)
    f.cap(z.X(43.6), z.Y(24.6), z.X(52.6), z.Y(26.2), 2.5 * S, 2.1 * S, 'den', base=.6 * S)
    f.blob(z.X(55.4), z.Y(17.2), 2.4 * S, 2 * S, 'boot', base=1.2 * S); f.blob(z.X(54.6), z.Y(26.4), 2.4 * S, 2 * S, 'boot', base=1 * S)
    f.render(z.c, {'den': DENIM, 'boot': LEATHER})
    for (x, y) in ((56.6, 17.2), (55.8, 26.4)):   # the soles, up: a dark tread, the heel
        for v in range(-int(1.6 * S), int(1.6 * S) + 1): z.c.p(z.X(x) + (1 if S > 1 else 0), z.Y(y) + v, (30, 22, 20))
        if S > 1:
            for v in range(-int(1.4 * S), int(1.4 * S) + 1, 2): z.c.p(z.X(x) - 1, z.Y(y) + v, (60, 44, 36))
    if S > 1:   # a seam down each leg, a crease behind each knee
        for k in range(int(8 * S)): z.c.p(z.X(44.4) + k, z.Y(16.6) - k * .1, DENIM[1]); z.c.p(z.X(44.4) + k, z.Y(26.4) + k * .17, DENIM[1])
        for k in range(int(1.6 * S)): z.c.p(z.X(48.8), z.Y(17.4) + k, DENIM[0]); z.c.p(z.X(48.4), z.Y(24.6) + k, DENIM[0])


def hiker_x(z, day):
    """face-down, opened along the spine; at Extreme the back is cut free both sides and folded out on to the grass like a coat
    coming off, raw side up, the ribs bare as red ridges either side of the broken spine, the guts pulled out of the hole and laid
    in loops toward where he crawled from, the liver beside his face, the heart put in his own hand, a bite out of the thigh"""
    xpool(z, 34, 31.8, 17.5, 5.4, 1.3, clots=4, tongues=0); xpool(z, 15, 31, 8, 3, 2.7, clots=1, tongues=0); xpool(z, 33, 9.6, 8, 2.6, .4, clots=1, tongues=0)
    z.lay_base()
    if z.S > 1: crown_split(z)
    D_ = [(28.2, 19.2), (39.4, 19.2), (39.8, 21.8), (38.8, 24.8), (36.6, 26.4), (34.8, 26), (33.2, 27.4), (30.8, 26.6), (29.4, 25.4), (28.2, 22.4)]
    hole(z, D_, 1.1)   # a D-shaped tear: the spine along its straight lip, the other lip ragged
    S = z.S
    for k in range(int(10.8 * S)):   # the spine, bared along the straight lip, broken by blood in places
        x = 28.6 + k / S; bl = H(int(x * 1.3), 4, 5) < .32
        for v in range(max(1, int(.7 * S))): z.c.p(z.X(x), z.Y(19.6) + v, XB[2] if bl else BONE[3] if v == 0 else BONE[1])
        if not bl and int(x * 10) % 23 < 3: z.c.p(z.X(x), z.Y(19.6) + max(1, int(.7 * S)), BONE[0])
    for (x0, L, dr) in ((30, 3.2, 5.2), (32.8, 3, 6), (35.4, 2.6, 6.2), (37.6, 2, 5.4)):   # the ribs: red ridges at uneven gaps, each steeper than the last
        ridge(z, [(x0, 20.4), (x0 - L * .45, 20.4 + dr * .45), (x0 - L * .7, 20.4 + dr * .8)], seed=x0)
    for (x, y) in ((29.8, 25.8), (31.6, 27), (33.8, 26.4), (36.2, 26.8), (38.4, 25.2)):   # tatters of the jacket over the ragged lip
        f = z.F(); f.blob(z.X(x), z.Y(y + .4), .9 * S, .6 * S, 'jk', base=1.2 * S); f.render(z.c, {'jk': JACKET})
    for pts, r0, r1, R, sd in (([(36.4, 27.4), (37.8, 29.6), (36, 31.4), (33.8, 30), (35.4, 28.4)], .9, .8, GUTX2, 6),
                               ([(33, 27.6), (31.4, 30.2), (32.8, 32.6), (35.8, 32.8), (37.4, 34.8), (34.6, 36.2), (31.4, 35.2), (29.4, 33.6)], .95, .85, GUTX, 2),
                               ([(37.4, 33.6), (40.4, 35.6), (43.2, 34.2), (45, 33)], .85, .7, GUTX, 1)):
        xtube(z, pts, r0, r1, R=R, seed=sd)
    for k, (x, y) in enumerate(((46.6, 33.4), (49.6, 32.8), (52.8, 31.8), (56, 31.6))):   # drag smears on toward where he crawled from
        xrun(z, x, y, .5 + .3 * (k % 2), 1.4 - k * .2, k, bead=False)
    xorgans(z, [('liver', 22.6, 34.6, 3.2, 1.6, -.15), ('heart', 40.2, 30.2, 1.6, 1.5, .3)])
    xrun(z, 29, 31.6, 1.6, 1, 1); xrun(z, 38.4, 32, 1.4, 1, 2)
    meta = dict(mag=[[33.6, 22.4, 3, 1.8], [13, 26.4, 1.8, 1.1], [33, 30.6, 2.4, 1.2]] if day else [],
                drip=[[40.6, 31.8]], nerve=[[36.8, 21, 2, -1]], twitch=[38.6, 28.4], fog=[16.6, 27.4], crow=[[31, 12], [44, 33], [24, 34]])
    if z.S == 1: pass
    if day:
        decay(z, [(17, 21, 11, 10), (39, 12, 3, 2), (39, 28.5, 3, 2)], bloat=[(42, 21, 5, 8, 1)], seed=2)
        for m in meta['mag']: maggots(z, *m, seed=int(m[0] * 7))
    return meta


def hole(z, poly, seed=0):
    """an opening into a body over its whole extent: dark and deep in the middle, the torn edge a dark lip, red flesh just inside"""
    S = z.S; P_ = [(z.X(x), z.Y(y)) for x, y in poly]; xs = [p[0] for p in P_]; ys = [p[1] for p in P_]; ins = set()
    for Y in range(int(min(ys)) - 1, int(max(ys)) + 2):
        for X in range(int(min(xs)) - 1, int(max(xs)) + 2):
            px_, py_ = X + .5, Y + .5; cn = False; j = len(P_) - 1
            for i in range(len(P_)):
                xi, yi = P_[i]; xj, yj = P_[j]
                if (yi > py_) != (yj > py_) and px_ < (xj - xi) * (py_ - yi) / (yj - yi) + xi: cn = not cn
                j = i
            if cn: ins.add((X, Y))
    for (X, Y) in ins:
        e = 0
        while e < 2 * S and all((X + a * (e + 1), Y + b * (e + 1)) in ins for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))): e += 1
        col = XB[1] if e < max(1, S // 2) else MUS[1] if e < S and H(X // max(1, S), Y // max(1, S), seed) < .6 else XB[0] if H(X // max(2, S * 2), Y // max(2, S * 2), seed + 1) < .55 else XB[1]
        z.c.p(X, Y, col)
    return ins


def ridge(z, pts, seed=0):
    """a rib under its muscle: a lit red ridge, a dark groove on its shadow side"""
    S = z.S; path = []
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        n = max(2, int(math.hypot(bx - ax, by - ay) * S * 1.8))
        for i in range(n): t = i / n; path.append((ax + (bx - ax) * t, ay + (by - ay) * t))
    path.append(pts[-1]); w = max(1, int(round(.6 * S)))
    for k, (x, y) in enumerate(path):
        X, Y = z.X(x), z.Y(y)
        for u in range(w): z.c.p(X + u, Y, MUS[4] if u == 0 else MUS[3])
        z.c.p(X + w, Y, MUS[1]); z.c.p(X + w + 1, Y, XB[1])


def rib(z, pts, seed=0):
    """one rib broken outward: a pale bone curve with a strip of red meat along its underside, a broken lit tip"""
    S = z.S; path = []
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        n = max(2, int(math.hypot(bx - ax, by - ay) * S * 1.8))
        for i in range(n): t = i / n; path.append((ax + (bx - ax) * t, ay + (by - ay) * t))
    path.append(pts[-1]); N = len(path); w = max(1, int(round(.55 * S)))
    for k, (x, y) in enumerate(path):
        X, Y = z.X(x), z.Y(y)
        for u in range(w): z.c.p(X + u, Y, BONE[4] if u == 0 and k < N * .7 else BONE[3] if k < N - S else BONE[2])
        if H(k // max(1, S), seed, 1) < .7: z.c.p(X + w, Y + (1 if S > 1 else 0), MUS[1] if k % 3 else XB[2])
        if S >= 2 and k < N * .5 and H(k // S, seed, 2) < .5: z.c.p(X - 1, Y, MUS[2])
    x, y = path[-1]; z.c.p(z.X(x), z.Y(y), BONE[5] if len(BONE) > 5 else BONE[4])


def spine(z, pts):
    """the spine pulled up out of the back, bent and broken: a bone bar with knuckles at uneven gaps, blood over parts of it"""
    S = z.S; path = []
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        n = max(2, int(math.hypot(bx - ax, by - ay) * S * 1.6))
        for i in range(n): t = i / n; path.append((ax + (bx - ax) * t, ay + (by - ay) * t))
    path.append(pts[-1]); N = len(path); R = max(.6, .75 * S)
    knots = [int(N * f) for f in (.08, .27, .41, .63, .86)]
    for k, (x, y) in enumerate(path):
        X, Y = z.X(x), z.Y(y); kn = any(abs(k - q) < max(1, S * .6) for q in knots); r = R * (1.45 if kn else 1)
        for v in range(-int(r), int(r) + 1):
            col = BONE[2] if v < -r * .3 else BONE[1] if v < r * .4 else BONE[0]
            if H(k // max(1, S * 2), 3, 9) < .6 and v > -r * .5: col = XB[2] if v < r * .3 else XB[1]   # blood over most of it
            z.c.p(X, Y + v, col)
    if N > 4:   # the break: a dark gap, offset
        k = int(N * .52); x, y = path[k]
        for v in range(-int(R) - 1, int(R) + 2): z.c.p(z.X(x), z.Y(y) + v, XB[0])


def lantern_x(z, day):
    """the hand off at the wrist, still on the lantern; at Extreme the whole forearm is there to the elbow, the skin peeled back
    from the wrist like a glove pulled half off, the muscle and its tendons bare, the elbow end torn with both bones out and
    gnawed, the tendons trailing on the grass, a strip of the skin dropped beside it"""
    xpool(z, -4, 16.6, 10, 2.6, 1.7, clots=3, tongues=0); xpool(z, 5, 15.8, 4, 1.6, 3.1, clots=1, tongues=0)
    z.lay_base()
    strand(z, [(-7.4, 14.6), (-9.2, 16.8), (-11.6, 17.2)])
    xbone(z, -6, 12.6, -10.4, 12, .6, .55, seed=2); xbone(z, -6.2, 14.4, -10.6, 15.6, .55, .5, seed=5)
    S = z.S; f = z.F()
    f.cap(z.X(-6.6), z.Y(13.4), z.X(-1.4), z.Y(12.8), 2.3 * S, 2.1 * S, 'dead', base=.6 * S)
    f.cap(z.X(-1.2), z.Y(12.8), z.X(7.8), z.Y(12.2), 1.75 * S, 1.45 * S, 'mus', base=.9 * S)
    f.cap(z.X(-1.9), z.Y(12.8), z.X(-.5), z.Y(12.7), 2.6 * S, 2.6 * S, 'dead', base=1.2 * S)
    f.render(z.c, OM)
    for k in range(int(8.6 * S)):   # the muscle's fibres along the arm, and two tendons running into the wrist
        x = -.4 + k / S
        for j, (off, R_) in enumerate(((-.9, None), (.2, None), (1, None))):
            if H(k // max(1, S), j, 5) < .55: z.c.p(z.X(x), z.Y(12.7 + off - x * .06), MUS[1])
        if x > 3: z.c.p(z.X(x), z.Y(11.9 - x * .06 + (x - 3) * .12), TEND[2] if k % 4 else TEND[1]); z.c.p(z.X(x), z.Y(13.3 - x * .06 - (x - 3) * .1), TEND[1])
    for k in range(int(4.6 * S)): z.c.p(z.X(-.4), z.Y(10.6) + k, FATX[2] if k % 3 else FATX[1])   # the rolled skin's fat edge
    xcavity(z, -6.9, 13.4, 1.2, 2.2, 4.1)
    ring(z, 13.4, 12.2)
    for k in range(7 if z.S > 1 else 0):   # the hair on the back of the forearm, in short dark strokes along it
        x = -5.4 + k * .7; y = 11.6 + (k % 3) * .5
        for j in range(int(.8 * z.S)): z.c.p(z.X(x) + j, z.Y(y) + j * .3, (84, 62, 50))
    xrun(z, -8.2, 15.4, 1, 1, 3, bead=False)
    meta = dict(mag=[[-6.6, 13.4, 1.4, 1.8], [3, 12.6, 2.2, 1.2]] if day else [], drip=[[-7.4, 15.6]], nerve=[[-7.6, 13.2, 2.2, -1]], crow=[[-6, 15], [3, 17]])
    if day:
        decay(z, [(3, 12.6, 14, 6)], bloat=[(-4, 13, 4, 3, .6)], seed=4)
        for m in meta['mag']: maggots(z, *m, seed=int(m[0] * 7 + 40))
    return meta


def boots_x(z, day):
    """the surveyor's boots standing with the feet in them; at Extreme the shin bones stand up out of them, one long and leaning out,
    the other snapped short and splintered with a shard of it in the pool, rags of the calf on them and the skin peeled down over the
    boot tops; his guts laid loose along his own tape, and the kidney, the liver and the heart set down beside it, unevenly, like a
    measurement; his cigarettes dropped in the grass"""
    xpool(z, 9.6, 22, 10, 2.8, 2.2, clots=3, tongues=0); xpool(z, 35, 23.4, 11, 1.8, 3.3, clots=2, tongues=0)
    z.lay_base()
    for (cx_, top, sd) in ((6.2, 9.6, 1), (12.4, 10.6, 4)):   # the legs cut through just above the boots: ragged meat, the bone short and off-centre
        f = z.F(); f.cap(z.X(cx_), z.Y(12.2), z.X(cx_ + (sd - 2.5) * .15), z.Y(top), 2.3 * z.S, 1.9 * z.S, 'mus', base=.8 * z.S); f.render(z.c, OM)
        xcavity(z, cx_ + .2, top + .4, 1.7, .8, sd)
        xbone(z, cx_ + .6, top + 1, cx_ + .9 + (sd - 2.5) * .2, top - .9, .55, .5, seed=sd)
    for (x0, x1, L0) in ((3.6, 8.8, 2.2), (9.6, 14.8, 1.1)):   # the skin peeled down over the boot top: a pale ragged band, its fat underside
        for k in range(int((x1 - x0) * z.S)):
            X = z.X(x0) + k; L = (L0 * .5 + L0 * H(k // max(1, z.S), int(x0), 2)) * z.S
            for v in range(int(L)): z.c.p(X, z.Y(11.6) + v, SLIP[3] if v == 0 else SLIP[2] if v < L - 1 else FATX[1])
    for k in range(int(10 * z.S)):   # the drag from the boots out to the tape: it laid them out from here
        x = 15.6 + k / z.S; w = 1.1 - k / (10 * z.S) * .5
        for v in range(-int(w * z.S), int(w * z.S) + 1):
            if H(int(x * 2), v, 5) < .25: continue
            z.c.p(z.X(x), z.Y(21.4 + math.sin(x * .6) * .3) + v, XB[2] if abs(v) < w * z.S * .5 else XB[1])
    xtube(z, [(26, 21.4), (28.4, 21.9), (30.4, 20.8), (29.2, 19.6), (27.8, 20.6), (30.8, 21.8), (34.4, 21.3), (37.6, 21.9), (40.6, 21.2), (43.6, 21.5)], .9, .45, R=GUTX, seed=3)
    for (x, y, rx) in ((30.6, 17.6, 1.6), (37, 18.4, 2.6)): xpool(z, x + .3, y + 1.2, rx, .7, x, clots=0, tongues=0, glint=False)
    xorgans(z, [('kidney', 30.6, 17.4, 1.5, 1, .3), ('liver', 37, 18, 2.4, 1.3, -.1)])
    meta = dict(mag=[[6, 11, 1.8, 1.2], [12.4, 11.2, 1.8, 1.2], [36, 18.6, 1.8, 1]] if day else [], drip=[[5.6, 13.6]], nerve=[[12.6, 9.4, 2, -1]], crow=[[34, 22], [9, 21]])
    if day:
        decay(z, [(9, 12, 7, 3)], bloat=[], seed=6)
        for m in meta['mag']: maggots(z, *m, seed=int(m[0] * 7 + 80))
    return meta


def coat_x(z, day):
    """the long coat on the fence post, full; at Extreme the hem has burst and the guts hang out of it and are strung along the
    fence wire in loops, the whole hand hangs out of one cuff with the nails gone, and it pours from the hem into the grass"""
    xpool(z, 15, 38.8, 11, 2.6, 1.1, clots=3, tongues=0); xpool(z, 32, 37.4, 6, 1.6, 2.4, clots=1, tongues=0)
    z.lay_base()
    for wy, sag in ((29.4, .8), (34.2, .6)):   # the fence wire, sagging between the post and the next one
        for k in range(int(27 * z.S)):
            x = 16.8 + k / z.S; y = wy + sag * math.sin(math.pi * (x - 16.8) / 27)
            z.c.p(z.X(x), z.Y(y), IRON[3] if k % (3 * z.S) else IRON[1])
            if z.S >= 2: z.c.p(z.X(x), z.Y(y) + 1, IRON[0])
    xtube(z, [(18.6, 25.6), (19.4, 28.2), (20.6, 29.4), (21.8, 31.2), (23.6, 32), (25, 30.6), (26.2, 29.4), (27.6, 31.8), (28.8, 34.6), (30.8, 36.2), (33, 35.6), (34.4, 33), (35.4, 29.8), (36.6, 31.6), (36.2, 35.2), (35.2, 37.4)], .82, .62, R=GUTX, seed=4)
    xtube(z, [(11.6, 25.8), (10.6, 28.4), (12.2, 30.2), (14, 28.6), (13.4, 26.6)], .85, .8, R=GUTX2, seed=5)
    xtube(z, [(12.4, 36.4), (10.4, 37.4), (11.2, 38.8), (13.8, 38.8), (15, 37.4), (13.4, 36.6)], .9, .8, R=GUTX, seed=9)   # a heap at the foot of the post
    f = z.F()
    f.cap(z.X(7.6), z.Y(23.4), z.X(7.2), z.Y(27.8), 1.3 * z.S, 1.1 * z.S, 'dead', base=1 * z.S)
    for dx, L in ((-1, 2.4), (0, 2.8), (1, 2.2)): f.cap(z.X(7.2 + dx * .7), z.Y(27.6), z.X(7.1 + dx * .8), z.Y(27.6 + L), .45 * z.S, .4 * z.S, 'dead', base=.8 * z.S)
    f.render(z.c, OM)
    for dx, L in ((-1, 2.4), (0, 2.8), (1, 2.2)): z.c.p(z.X(7.1 + dx * .8), z.Y(27.6 + L), XB[3])   # the nails pulled: raw red tips
    ring(z, 7.9, 28.8, vertical=False)
    xrun(z, 7, 30.6, 3.4, .6, 1); xrun(z, 17.4, 26.4, 10.6, 1.6, 2); xrun(z, 11, 26.6, 4.2, .8, 3)
    meta = dict(mag=[[15, 25.4, 2.6, 1.2], [7.4, 24, 1.2, 1]] if day else [], drip=[[7.2, 31], [17.8, 27]], nerve=[[12, 26, 2, 1]], crow=[[22, 30], [30, 30]])
    if day:
        decay(z, [(7.4, 26, 3, 4.5)], bloat=[(15, 17, 9, 9, .7)], seed=8)
        for m in meta['mag']: maggots(z, *m, seed=int(m[0] * 7 + 120))
    return meta


def tree_x(z, day):
    """the hunter against the dead tree, his face taken off; at Extreme (a grown man, plainly: legs out in front of him in work
    trousers, big work boots, broad shoulders, his cap on, the beard still on what is left of the jaw) his chest is opened from the
    collar and what was in it is in his lap round his eyes, the teeth broken, the blood down him into his boots"""
    xpool(z, 25, 74.4, 17, 2.8, 1.9, clots=4, tongues=0)
    z.lay_base(); c = z.c; S = z.S
    for Y in range(int(z.Y(44.2)), int(z.Y(46.9))):   # the teeth broken: gaps, some short, blood on some
        for X in range(int(z.X(17)), int(z.X(32))):
            q = c.px[X, Y]
            if q[3] > 200 and lumi(q) > 150:
                t_ = (X - int(z.X(17))) // max(1, S + 1); r = H(t_, 3, 11)
                if r < .22: c.p(X, Y, XB[0])
                elif r < .4 and Y > z.Y(47): c.p(X, Y, XB[1])
                elif r < .55: c.p(X, Y, (200, 170, 140))
    xcavity(z, 24.2, 52.6, 3.6, 4.4, 3.3)
    for k in range(int(8 * S)): c.p(z.X(24.2) + math.sin(k / S * 1.3) * .5 * S, z.Y(48.4) + k, XB[0])   # the breastbone split down its middle
    ridge(z, [(22.4, 50.2), (21.4, 51.6), (21, 53.6)], seed=1); ridge(z, [(26.4, 51), (27.6, 52.8)], seed=2)
    xorgans(z, [('heart', 24.4, 58.6, 1.7, 1.5, .2), ('liver', 18.6, 58.8, 2.4, 1.3, -.3), ('lungx', 30, 58.6, 2.2, 1.4, .3)])
    xtube(z, [(20.8, 64.6), (18.4, 63.8), (17.6, 61.8), (19.4, 60.8)], .7, .6, R=GUTX, seed=7)
    xtube(z, [(28.4, 64.4), (31, 63.6), (31.6, 61.6), (29.8, 60.8)], .7, .6, R=GUTX2, seed=8)
    xrun(z, 18.2, 36.4, 7, .9, 1); xrun(z, 30.6, 37.4, 4.6, .8, 2); xrun(z, 24.6, 56.4, 1.6, 1.1, 3)
    meta = dict(mag=[[24.2, 52.6, 2.2, 2.6], [24.4, 58.8, 2.4, 1]] if day else [], drip=[[30.8, 44.6], [18.4, 43.4]], nerve=[[21, 40, 2, 1]], crow=[[24, 58], [12, 74]])
    if day:
        decay(z, [(24.5, 42, 10, 10)], bloat=[(24, 52, 7, 6, .6)], seed=10)
        for m in meta['mag']: maggots(z, *m, seed=int(m[0] * 7 + 160))
    return meta


def skull_open(z, cx, cy, rx, ry):
    """the top of the head off at a slant, ragged and off-centre (critic: a whole pale ring reads as a target or a halo): the bone
    shows only along the near lip, in broken lengths; inside, the brain in folds on the left, scooped out dark on the right"""
    c, S = z.c, z.S
    P_ = [(16.8, 34.8), (18.4, 32.8), (21.4, 31.8), (24.2, 30.6), (27.8, 31), (30.6, 31.8), (31.4, 33.2), (29.4, 34.4), (26.4, 35.6), (22.6, 36.2), (19.2, 35.8)]
    P_ = [(z.X(x), z.Y(y)) for x, y in P_]; xs = [p[0] for p in P_]; ys = [p[1] for p in P_]; ins = set()
    for Y in range(int(min(ys)) - 1, int(max(ys)) + 2):
        for X in range(int(min(xs)) - 1, int(max(xs)) + 2):
            px_, py_ = X + .5, Y + .5; cn = False; j = len(P_) - 1
            for i in range(len(P_)):
                xi, yi = P_[i]; xj, yj = P_[j]
                if (yi > py_) != (yj > py_) and px_ < (xj - xi) * (py_ - yi) / (yj - yi) + xi: cn = not cn
                j = i
            if cn: ins.add((X, Y))
    X0 = z.X(cx)
    for (X, Y) in ins:
        below = (X, Y + max(1, S // 2) + 1) not in ins; above = (X, Y - 1) not in ins
        if below: col = BONE[3] if H(X // max(1, S * 2), 1, 5) < .7 else XB[2]   # the near lip: bone, broken by blood
        elif above: col = XB[1]
        elif X > X0 + (Y - z.Y(cy)) * .6 + S: col = XB[0] if H(X // max(1, S), Y // max(1, S), 3) < .7 else XB[1]   # scooped out
        else:
            fold = math.sin(X / max(1.2, S * .9) + math.sin(Y / max(1, S * .7)) * 2.2)
            col = BRAIN[1] if fold > .55 else BRAIN[4] if fold < -.6 else BRAIN[3] if Y < z.Y(cy) else BRAIN[2]
        c.p(X, Y, col)
    for k, x in enumerate((19.6, 23.4, 28.2)): xrun(z, x, 35.4 + (k % 2) * .4, 2.4 + k, .7, k + 5, bead=False)


def rabbit_x(z, day):
    """opened like a purse; at Extreme the throat is torn out under the jaw and the eye taken, the guts pulled out of the belly and
    dragged in one long string across the grass, the hind leg chewed to the bone and the foot gone"""
    S = z.S; c = z.c
    xpool(z, 20.6, 17.8, 10.4, 3.2, .9, clots=3, tongues=0); xpool(z, 27.4, 18.6, 4, 1.5, 2.2, clots=1, tongues=0)
    z.lay_base()
    xcavity(z, 23.4, 14.8, 1.6, 1.3, 2.7, rot=.5)            # the throat torn out under the jaw
    xbone(z, 22.6, 14.2, 24.2, 15.6, .4, .35, seed=6)
    xcavity(z, 26.4, 12, .6, .55, 3.9)                         # the eye taken
    xrun(z, 26.4, 12.6, 1.6, .5, 2, bead=False)
    xtube(z, [(17.4, 16.8), (15.4, 18.8), (13.2, 20), (11.6, 18.8), (12.8, 17.8), (14.4, 19.4), (12.2, 21.2), (9.8, 20.6)], .64, .5, R=GUTX, seed=2)
    xtube(z, [(20.4, 17.2), (21.8, 19.4), (24.4, 20), (25.8, 19)], .62, .52, R=GUTX2, seed=3)
    xflay(z, [(16.6, 15.6), (12.6, 17), (11.4, 18.8), (15.8, 17.8)], .4, seed=4)
    xbone(z, 15.2, 16.6, 10.6, 18.6, .45, .4, seed=7)
    meta = dict(mag=[[19, 15.6, 2.4, 1], [23.4, 14.8, 1.2, 1], [26.4, 12, .6, .5]] if day else [], drip=[[23.6, 16.2]], nerve=[[24, 15, 1.4, 1]], crow=[[19, 16], [8, 20]])
    if day:
        decay(z, [], bloat=[(18.6, 13.4, 7.2, 4.4, .6)], seed=12)
        for m in meta['mag']: maggots(z, *m, seed=int(m[0] * 7 + 200))
    return meta


def deer_x(z, day):
    """laid out with its insides in a ring round it; at Extreme the hide is peeled off the flank and folded back over the spine,
    the muscle and the ribs' ridges bare, the near hind leg chewed to the bone, the eye taken, and one long length of gut strung
    out of the belly and right round the ring like the rim of a clock"""
    xpool(z, 37, 28.6, 19, 5, 3.4, clots=5, tongues=0)
    z.lay_base()
    xflay(z, [(30.4, 17.8), (32.6, 16.2), (34.2, 17), (36.6, 15.8), (39.6, 16.4), (41.2, 18.6), (39.4, 19.4), (40.6, 21), (37.2, 20.4), (34.8, 21.6), (32.6, 20.2), (30.8, 20.8)], .15, seed=2, lip=False)
    for xr, L, lean in ((32.2, 4.2, .35), (36.6, 3.6, .2), (39.8, 4.4, .45)):   # the ribs under the muscle: uneven grooves, each leaning a little more
        for k in range(int(L * z.S)):
            y = 16.8 + k / z.S; x = xr + (y - 16.8) * lean + .3 * math.sin(k / z.S)
            z.c.p(z.X(x), z.Y(y), MUS[1]); z.c.p(z.X(x) + 1, z.Y(y), MUS[4] if k % 3 else MUS[3])
    f = z.F(); f.poly([(z.X(31.4), z.Y(16)), (z.X(33), z.Y(13.4)), (z.X(37.4), z.Y(12.6)), (z.X(41.4), z.Y(13.6)), (z.X(42.8), z.Y(16.2))], 'hide', base=.8 * z.S, hs=.5)
    f.render(z.c, {'hide': [(80, 34, 40), (104, 50, 52), (128, 70, 66), (150, 92, 84), (170, 112, 100), (190, 132, 118)]})   # the hide's raw underside, folded up
    for k in range(int(11 * z.S)):   # its fur edge where it folds over
        x = 32.6 + k / z.S * .92; y = 13.6 - .9 * math.sin(math.pi * k / (11 * z.S))
        z.c.p(z.X(x), z.Y(y), DEERF[3]); z.c.p(z.X(x), z.Y(y) - 1, DEERF[1]) if z.S > 1 else None
    xflay(z, [(26.4, 24.6), (28, 26.2), (25.4, 30), (22.6, 31.6), (23, 28.4)], -1.0, seed=6)
    xbone(z, 26, 26.2, 22.4, 32.6, .8, .7, seed=3)
    xcavity(z, 61.2, 20.4, .9, .8, 1.3)
    xrun(z, 61, 21.2, 2.2, .8, 4, bead=False)
    for pts, r0, r1, R, sd in (([(40.6, 26), (42.6, 28.2), (41.2, 30), (39, 29), (40, 27.4)], 1.05, .95, GUTX2, 9),   # out of the cut, heaviest there, then away down and right
                               ([(36.8, 25.8), (35.6, 28.4), (37.4, 30.6), (40.4, 31), (42.4, 32.8), (45.6, 33.2), (48, 34.8), (51.2, 35), (53.6, 36.4)], 1.1, .55, GUTX, 10),
                               ([(44, 26), (46.6, 27.6), (45.6, 29.4)], .85, .75, GUTX, 11)):
        xtube(z, pts, r0, r1, R=R, seed=sd)
    meta = dict(mag=[[37, 19, 3.4, 1.8], [36, 25, 3, .9], [61.2, 20.4, .9, .8], [24.4, 28.4, 1.4, 1]] if day else [], drip=[[61.2, 23.4]], nerve=[[44, 18, 2, 1]], crow=[[37, 18], [24, 29], [58, 22]])
    if day:
        decay(z, [], bloat=[(36, 19, 12, 7, .8)], seed=14)
        for m in meta['mag']: maggots(z, *m, seed=int(m[0] * 7 + 240))
    return meta


def ribs_x(z, day):
    """the ribcage stood on its spine at the end of its drag; at Extreme rags of meat and tendon still hang off the ribs, wet, and
    the blood comes down the spine in runs into a thick clotted pool"""
    cx, gy = 22, 31
    xpool(z, 22, 32.4, 14, 3, 2.4, clots=4, tongues=0)
    z.lay_base()
    RB = {-1: ((20, 6.4, 1.2), (17.2, 8.6, 2.6), (14.4, 9.8, 4.4), (11.6, 9.2, 6.2), (8.8, 8.4, 8), (6.2, 6.4, 9.4)),
          1: ((20.4, 5.6, 1.6), (17.6, 8.2, 3), (14.6, 6.2, 4.8), (11.8, 9.6, 6.6), (9.2, 8.8, 8.4), (6.4, 7, 9.8))}
    pt = lambda side, hy, L, drop, t: (cx + side * (1 + L * math.sin(t * 1.5)), gy - hy - 1.4 * math.sin(t * 2.4) + drop * t * t)
    S = z.S
    for Y in range(int(z.Y(3)), int(z.Y(33))):   # the Full ribs off (they were one mirrored fishbone); the spine stays
        for X in range(z.c.W):
            q = z.c.px[X, Y]
            if q[3] > 120 and abs(X - z.X(22.2)) > 1.9 * S and (q[:3] in BONE or (lumi(q) > 150 and q[0] > q[2])): z.c.px[X, Y] = (0, 0, 0, 0)
    RIBS = {-1: [(11.6, 5.6, .9), (14.2, 7.6, 1.8), (16.8, 8.8, 3), (19.6, 8.2, 4.4), (22.4, 7.4, 5.4), (25.2, 5.8, 6.2)],
            1: [(12.4, 5.2, 1.2), (15.4, 7.8, 2.2), (17.8, 9.2, 3.4), (20.8, 7.6, 4.8), (23.6, 6.2, 5.6)]}
    for side, L_ in RIBS.items():
        for k, (y0, L, drop) in enumerate(L_):
            x0 = 22.2 + side * 1.4; pts = [(x0, y0), (x0 + side * L * .55, y0 - .6 + drop * .2), (x0 + side * L * .9, y0 + drop * .65), (x0 + side * L, y0 + drop)]
            if (side, k) in ((-1, 2), (1, 3)): pts = pts[:3]   # broken short
            rib(z, pts, seed=k * 5 + side)
    TAT = [(-1, 2, .3, 5.2, 1.6), (-1, 3, .25, 3.4, 1.3), (1, 1, .55, 1.6, .7)]
    for side, k, t, ln, wd in TAT:   # rags of meat still on the ribs: each a torn strip, wide at the rib and ragged at its foot
        hy, L, drop = RB[side][k]; x, y = pt(side, hy, L, drop, t); S = z.S
        for j in range(int(ln * S)):
            f_ = j / (ln * S); w = wd * S * (1 - f_ * .55) * (.8 + .4 * H(j // max(1, S), k, side + 5))
            for u in range(-int(w / 2), int(w / 2) + 1):
                if f_ > .6 and H(u, j // max(1, S), k * 3 + side) < .35: continue
                col = MUS[3] if u < 0 else MUS[2] if u < w / 3 else MUS[1]
                if f_ > .75: col = XB[2] if u else XB[3]
                z.c.p(z.X(x) + u + side * f_ * .6 * S, z.Y(y) + 1 + j, col)
        if S >= 2: z.c.p(z.X(x) - 1, z.Y(y) + 2, MUS[5])
    for side, k, t, ln in ((-1, 2, .55, 3), (1, 4, .6, 2.6), (-1, 5, .3, 1.8), (1, 1, .7, 3.4)):
        hy, L, drop = RB[side][k]; x, y = pt(side, hy, L, drop, t); strand(z, [(x, y), (x + side * .5, y + ln * .5), (x + side * .2, y + ln)], w=.5)
    S = z.S
    for side, k, t in ((-1, 1, .62), (1, 3, .5), (-1, 4, .78)):   # broken ribs: a piece gone, the ends splintered
        hy, L, drop = RB[side][k]; x, y = pt(side, hy, L, drop, t)
        for Y in range(int(z.Y(y - 1)), int(z.Y(y + 1.2))):
            for X in range(int(z.X(x - .7)), int(z.X(x + .7)) + 1):
                q = z.c.px[X, Y]
                if q[3] > 200 and q[:3] in BONE: z.c.px[X, Y] = (0, 0, 0, 0)
        for e in (-1, 1): z.c.p(z.X(x + e * .8), z.Y(y) - 1, BONE[4])
    for Y in range(int(z.Y(9)), int(z.Y(13.4))):   # the spine's top snapped off and gnawed: ragged, the marrow showing
        for X in range(int(z.X(20.2)), int(z.X(24.4))):
            q = z.c.px[X, Y]
            if q[3] > 120 and Y < z.Y(12.4) + H(X // max(1, S), 7, 3) * 1.4 * S: z.c.px[X, Y] = (0, 0, 0, 0)
    for k, (dx, h) in enumerate(((-1.2, .6), (-.5, 1.3), (.3, .3), (1, 1))):
        for v in range(int(h * S) + 1): z.c.p(z.X(22.2 + dx), z.Y(12.6) - v, BONE[4] if v == int(h * S) else BONE[2])
    z.c.p(z.X(22.2), z.Y(12.9), MARROW[1]); z.c.p(z.X(22.2) + 1, z.Y(12.9), MARROW[0])
    xbone(z, 28.6, 32.2, 30.6, 31.6, .55, .5, seed=12)   # a knuckle of it, dropped in the pool
    for y0, L, dx in ((12, 18, -.8), (16, 14, .9), (22, 8.6, -.2)): xrun(z, cx + dx, y0, L, 1, int(y0))
    meta = dict(mag=[[22, 28, 2.4, 1.2], [18, 16, 1.4, 1]] if day else [], drip=[[cx - 4, 18], [cx + 5, 22]], nerve=[], crow=[[16, 30], [28, 31]])
    if day:
        decay(z, [], seed=16)
        for m in meta['mag']: maggots(z, *m, seed=int(m[0] * 7 + 280))
    return meta


def hooks_x(z, day):
    """the cold house's rack; at Extreme the sacking on the third shape is slit and has fallen open down one side: a person under
    it, skinned, the ribs and the arm's muscle bare, and under the rack the guts in a heap where they slid out on to the floor"""
    xpool(z, 32, 81, 25, 2.8, 1.4, clots=5, tongues=0)
    z.lay_base(); S = z.S
    xflay(z, [(42.6, 25), (46.6, 23.6), (47.2, 33), (46.4, 44.2), (43.4, 48.4), (42.2, 38)], 1.45, seed=3)
    for (sy, ey) in ((28, 29.6), (31.4, 33.2), (34.8, 36.2)): ridge(z, [(45.8, sy), (44.4, (sy + ey) / 2 + .3), (43.2, ey)])
    f = z.F(); f.poly([(z.X(42.4), z.Y(24.6)), (z.X(46.4), z.Y(23.4)), (z.X(41.4), z.Y(36)), (z.X(40), z.Y(33))], 'sack', base=1.6 * S, hs=.4); f.render(z.c, {'sack': SACK})   # the slit flap hanging
    for (pts, r0, r1, R, sd) in (([(44, 74), (41, 76.4), (43, 79), (47.6, 79.4), (50.6, 77), (48, 75), (45.2, 76.6), (47.4, 78.4)], 1, .9, GUTX, 2),
                                 ([(46.4, 57.6), (46, 64), (45, 70), (44.4, 74)], .5, .8, GUTX2, 3)):
        xtube(z, pts, r0, r1, R=R, seed=sd)
    xrun(z, 44, 48.4, 6, 1, 2)
    meta = dict(mag=[[44.6, 36, 1.6, 4], [46, 77, 3, 1.4]] if day else [], drip=[[44.4, 55], [17, 60], [32, 62]], nerve=[[43, 30, 2, -1]], crow=[])
    if day:
        decay(z, [(44.6, 36, 3, 13)], seed=18)
        for m in meta['mag']: maggots(z, *m, seed=int(m[0] * 7 + 320))
    return meta



# ================================================================ (t374b, all levels) the people read as grown men (hard limit: the chibi model reads young; the
# critic took the hunter for a child or a doll and the hiker for a boy). Drawn over the gore3 originals and written back to the Full
# names, so Full, Toned and Extreme all show the same man.
def hunter_adult(z, day=0):
    """the hunter against the tree: a flat folded watch cap instead of the round dome (the head a size smaller), the shoulders a step
    wider than the head, a heavier body, his legs stretched out in front with long shins and big work boots, the rifle across his
    thighs, a hard jaw edge and his beard along it"""
    z.lay_base(recolor=False); c, S = z.c, z.S; px = c.px
    capq = lambda q: q[3] > 200 and q[0] > 80 and q[0] - q[2] > 55 and q[1] - q[2] > 16 and q[1] < q[0] * .82
    for X in range(int(z.X(13)), int(z.X(37))):   # the dome's top goes: the bark behind shows through, taken from just above it
        src = None
        for Y in range(int(z.Y(20)), int(z.Y(31))):
            q = px[X, Y]
            if capq(q) or (Y >= z.Y(25.5) and q[3] > 200 and lumi(q) < 40 and src is not None and Y < z.Y(31)):
                if src is None:
                    for k in range(1, int(10 * S)):
                        r = px[X, Y - k] if Y - k >= 0 else (0, 0, 0, 0)
                        if not capq(r): src = r; break
                px[X, Y] = src if src else (0, 0, 0, 0)
            elif q[3] > 200 and not capq(q): src = q
    f = z.F(); f.poly([(z.X(14.4), z.Y(34.6)), (z.X(15), z.Y(30.6)), (z.X(34), z.Y(30.6)), (z.X(34.8), z.Y(34.6))], 'cap', base=1 * S, hs=.5); f.render(c, {'cap': BLAZE})   # the watch cap, folded
    for k in range(int(19.6 * S)):
        X = z.X(15) + k; c.p(X, z.Y(30.6), BLAZE[4]); c.p(X, z.Y(32.4), BLAZE[1]); c.p(X, z.Y(32.4) + 1, BLAZE[3]) if S > 1 else None   # its lit top edge, the fold
        if S > 1 and k % 3 == 0:
            for v in range(int(1.6 * S)): c.p(X, z.Y(32.8) + v + 1, BLAZE[2])   # the knit's ribs, below the fold
    for side in (-1, 1):   # shoulders a step wider than the head, the body heavier
        f = z.F(); f.blob(z.X(24.6 + side * 10.6), z.Y(49.6), 2.4 * S, 2.1 * S, 'jk', base=.8 * S); f.cap(z.X(24.6 + side * 10.8), z.Y(50.4), z.X(24.6 + side * 10.4), z.Y(57.4), 2.2 * S, 2.1 * S, 'jk', base=.6 * S)
        f.render(c, {'jk': JACKET})
    keep = {}   # his eyes in his lap stay on top of whatever is drawn under them
    for Y in range(int(z.Y(58)), int(z.Y(67))):
        for X in range(int(z.X(18)), int(z.X(32))):
            q = px[X, Y]
            if q[3] > 200 and (lumi(q) > 150 or (q[2] > q[0] + 15 and q[2] > 70)):
                for a in range(-1, 2):
                    for b in range(-1, 2): keep[(X + a, Y + b)] = px[X + a, Y + b]
    for Y in range(int(z.Y(63.6)), int(z.Y(68.4))):   # the folded knees and small feet go: the ground and the roots, from beside them
        for X in range(int(z.X(14)), int(z.X(36))):
            q = px[X, Y]
            if q[3] > 120: px[X, Y] = (0, 0, 0, 0)
    f = z.F()   # the legs out in front, long in the shin, and big work boots, toes up
    f.cap(z.X(20.2), z.Y(65.6), z.X(18.6), z.Y(71.6), 2.4 * S, 2.3 * S, 'den', base=.6 * S); f.cap(z.X(29), z.Y(65.6), z.X(30.8), z.Y(71.6), 2.4 * S, 2.3 * S, 'den', base=.6 * S)
    f.blob(z.X(18.2), z.Y(73.2), 3.1 * S, 2.3 * S, 'boot', base=1 * S); f.blob(z.X(31.2), z.Y(73.2), 3.1 * S, 2.3 * S, 'boot', base=1 * S)
    f.blob(z.X(17.8), z.Y(71.4), 2.4 * S, 1.5 * S, 'boot', base=1.9 * S); f.blob(z.X(31.6), z.Y(71.4), 2.4 * S, 1.5 * S, 'boot', base=1.9 * S)
    f.render(c, {'den': DENIM, 'boot': LEATHER})
    for bx_ in (18.2, 31.2):
        for k in range(int(6 * S)): c.p(z.X(bx_ - 3) + k, z.Y(75.4), (24, 16, 14))   # the sole
        for k in range(3 if S > 1 else 1): c.p(z.X(bx_) - (2 if S > 1 else 0) + k * 2, z.Y(71) + k, (190, 172, 140))   # laces
    for k in range(int(6 * S)): c.p(z.X(24.7), z.Y(66.6) + k, OUT)   # between the legs, each its own edge
    for X in range(int(z.X(10.6)), int(z.X(38.6))):   # the rifle across his thighs: the stock left, the barrel right
        x = (X / S) - z.pad; y = 66.2 + (x - 24.6) * .07
        wood = x < 21
        c.p(X, z.Y(y), WOOD[4] if wood and x < 16 else WOOD[3] if wood else IRON[4] if x < 27 else IRON[3]); c.p(X, z.Y(y) + 1, WOOD[1] if wood else IRON[0])
        if S > 1: c.p(X, z.Y(y) + 2, WOOD[0] if wood else IRON[0])
    for Y in range(int(z.Y(37)), int(z.Y(42.6))):   # the eye sockets torn, not round: a red lip on top, ragged below
        for X in range(int(z.X(16)), int(z.X(33))):
            q = px[X, Y]
            if q[3] > 200 and lumi(q) < 30:
                up = px[X, Y - 1]
                if up[3] > 200 and lumi(up) > 30: c.p(X, Y, MEAT[0] if H(X // max(1, S), 1, 2) < .6 else BLOOD[0])
                dn = px[X, Y + max(1, S)] if Y + max(1, S) < c.H else (0, 0, 0, 0)
                if dn[3] > 200 and lumi(dn) > 30 and H(X // max(1, S), 2, 3) < .45: c.p(X, Y + max(1, S), (30, 10, 14))
    for Y in range(int(z.Y(44.2)), int(z.Y(46.9))):   # a tooth or two gone
        for X in range(int(z.X(17)), int(z.X(32))):
            q = px[X, Y]
            if q[3] > 200 and lumi(q) > 150 and H((X - int(z.X(17))) // max(1, S + 1), 4, 9) < .2: c.p(X, Y, (40, 12, 16))
    for (X, Y), q in keep.items():
        if q[3] > 200: px[X, Y] = q
    for (x0, x1) in ((14, 17.6), (31.4, 35)):   # his beard left along the jaw either side, and the jaw's hard edge under it
        for Y in range(int(z.Y(41)), int(z.Y(47))):
            for X in range(int(z.X(x0)), int(z.X(x1))):
                q = px[X, Y]
                if q[3] > 200 and not capq(q): c.p(X, Y, BEARD[1] if H(X // max(1, S), Y // max(1, S), 3) < .7 else BEARD[2])
    for k in range(int(20 * S)):
        X = z.X(14.6) + k; x = 14.6 + k / S; y = 46.8 + .5 * math.sin((x - 14.6) / 20 * math.pi)
        c.p(X, z.Y(y), (22, 14, 12)); c.p(X, z.Y(y) - 1, BEARD[0] if (x < 17.6 or x > 31.4) else c.px[X, int(z.Y(y)) - 1][:3])
    return {}


def hiker_adult(z, day=0):
    """the hiker: his face one lit form with a soft shaded jaw and a stubble shadow (never dotted: dots read as teeth), his legs at
    full length in work trousers, his boots soles-up"""
    z.lay_base(recolor=False); hiker_head(z, full=True); legs(z); return {}


def tree_toned_cap(z, day=0):
    """(toned) his cap at the foot of the tree, the same folded watch cap he wears in Full"""
    z.lay_base(recolor=False); c, S = z.c, z.S; px = c.px
    capq = lambda q: q[3] > 200 and q[0] > 80 and q[0] - q[2] > 55 and q[1] - q[2] > 16 and q[1] < q[0] * .82
    pts = [(X, Y) for Y in range(int(z.Y(58)), c.H) for X in range(int(z.X(30)), c.W) if capq(px[X, Y])]
    if not pts: return {}
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    for Y in range(min(ys) - 1, max(ys) + 2):
        for X in range(min(xs) - 1, max(xs) + 2):
            if 0 <= X < c.W and 0 <= Y < c.H and px[X, Y][3] > 120 and (capq(px[X, Y]) or lumi(px[X, Y]) < 40): px[X, Y] = (0, 0, 0, 0)
    x0, x1, yb = (min(xs) - z.bx) / S + z.pad * 0, 0, 0
    X0, X1, Yb = min(xs), max(xs), max(ys)
    f = z.F(); f.poly([(X0, Yb), (X0 + S, Yb - 3 * S), (X1 - S, Yb - 3.4 * S), (X1, Yb)], 'cap', base=.8 * S, hs=.5); f.render(c, {'cap': BLAZE})
    for X in range(X0 + S, X1 - S + 1): c.p(X, Yb - 1.6 * S, BLAZE[1]); c.p(X, Yb - 3 * S - (X - X0) * .02, BLAZE[4])
    for X in range(X0 - 1, X1 + 2): c.p(X, Yb + 1, (20, 14, 14), 140)
    return {}


def adult_pass():
    XC.from_orig = True; out = {}
    for name, S, fn in (('g_p_tree', 2, hunter_adult), ('g_p_hiker', 3, hiker_adult), ('g_p_tree_t', 2, tree_toned_cap)):
        for cu in (False, True):
            z = XC(name, S if cu else 1, 8, cu); fn(z); finish(z, name)
            nm = name + ('_cu' if cu else ''); out[nm] = dict(SPR[nm], foot=OBJ[nm].get('foot', [0, 0, 0, 0]))
    XC.from_orig = False
    d = json.load(open('spr/lpc/objects.json')); d.update(out); json.dump(d, open('spr/lpc/objects.json', 'w')); OBJ.update(out)
    for k in list(SPR): del SPR[k]
    return out

# ================================================================ run
KINDS = {'hiker': ('hiker_x', 'g_p_hiker', 3, 10), 'lantern': ('lantern_x', 'g_p_lantern', 4, 16), 'boots': ('boots_x', 'g_p_boots', 4, 6),
         'coat': ('coat_x', 'g_p_coat', 3, 14), 'tree': ('tree_x', 'g_p_tree', 2, 6), 'rabbit': ('rabbit_x', 'g_rabbit', 4, 6),
         'deer': ('deer_x', 'g_deer_open', 2, 6), 'ribs': ('ribs_x', 'g_ribs', 3, 6), 'hooks': ('hooks_x', 'g_hooks', 1.5, 8)}
if __name__ == '__main__':
    pick = sys.argv[1:] or list(KINDS)
    if 'adult' in pick or not sys.argv[1:]: print('adult', list(adult_pass()))
    pick = [k for k in pick if k != 'adult']
    for k in pick:
        fn, name, S, pad = KINDS[k]; both(globals()[fn], name, S, pad)
    # kept out of objects.json: the game loads these only when a player turns Extreme on (gorex374.js), so Full and Toned
    # players don't download them
    old = json.load(open('spr/lpc/gorex.json')) if os.path.exists('spr/lpc/gorex.json') else {}
    old.update(SPR); json.dump(old, open('spr/lpc/gorex.json', 'w'))
    old = json.load(open('gx374_meta.json')) if os.path.exists('gx374_meta.json') else {}
    old.update(META); json.dump(old, open('gx374_meta.json', 'w'), indent=0); print('ok', list(SPR))
