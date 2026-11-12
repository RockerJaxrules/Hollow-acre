"""Six more crops for the farm (#233), drawn with the same kit as the turnip, pumpkin and corn in crops.py: potato, carrot,
cabbage, barley, hops and grapes. Every stage is 32x64 with the feet at y=58 (like the turnip). Each crop keeps the crop
lessons: a full value range, a soft contact shadow, a darker line wherever one leaf overlaps another, lit from the top
left, and each its own hue so a mixed field never reads as one green.

Also their 32px produce icons and seed packets (the packet is the turnip packet's paper and band, with the picture and the
band's colour changed).

    python3 crops_more.py out_dir [obj_dir]   -> <crop>_0..3.png, icon32_<crop>.png, icon32_seed_<crop>.png
    python3 crops_more.py --install spr/lpc/obj spr/lpc/objects.json   -> draws them straight into the game's sprites
"""
import sys, os, math
from PIL import Image
from crops import (Canvas, HEX, LEAF, DRYL, SHADOWC, LIGHT, outline, contact, leaf, spoon, seed_leaf, pleaf4,
                   round_lobe_leaf, shade, specks)

# ---- palettes: each crop its own hue, each a full value range
TUBER = [HEX(c) for c in ('#3a2212', '#5c381e', '#82562c', '#a6763e', '#c69656', '#e0b878')]          # potato skin, warm tan
PFLOW = [HEX(c) for c in ('#6a5a84', '#a494c0', '#d8cce8', '#f4eefa')]                              # potato flower, lilac-white
EYEL = HEX('#e8c43c')
CARR = [HEX(c) for c in ('#5a1c06', '#8c300c', '#c25014', '#e4741e', '#f69a3e', '#fcc06e')]           # carrot orange
FERN = [HEX(c) for c in ('#0c2412', '#163e1a', '#205a1e', '#2c7824', '#3e962c', '#5eb43a', '#8cd058')]  # carrot tops: a brighter, yellower green
CABB = [HEX(c) for c in ('#0e2622', '#163a32', '#225444', '#326e58', '#4a8a6c', '#6aa684', '#94c4a2', '#c4e0c4')]  # cabbage: cool blue-green
HEAD = [HEX(c) for c in ('#2a4a36', '#44684a', '#64885c', '#88a874', '#acc690', '#cee0b0', '#ecf4d8')]  # the head: pale, a step warmer
BARL = [HEX(c) for c in ('#3a2a0e', '#644a16', '#927020', '#bc9630', '#d8b84e', '#eed47c', '#f8eaa8')]  # barley straw and ears
BGRN = [HEX(c) for c in ('#13281a', '#1e3e1e', '#2c5822', '#3e722a', '#588e34', '#76aa42', '#9cc65e')]  # young barley: a bluer grass green
WOOD = [HEX(c) for c in ('#24160c', '#3e2816', '#5c3e22', '#7e5a34', '#9e7a4a')]                        # stakes and poles
TWINE = HEX('#c8b07a')
HOPL = [HEX(c) for c in ('#0e2210', '#183a18', '#24521e', '#326c26', '#468830', '#62a43c', '#86c252')]  # hop leaves
HOPC = [HEX(c) for c in ('#2a4214', '#44641e', '#66882a', '#8cac3c', '#b4cc62', '#d8e898', '#f0f6cc')]   # hop cones: papery yellow-green
VINEW = [HEX(c) for c in ('#26160e', '#402616', '#5e3c22', '#7c5632')]                                 # the grape's woody vine
GLEAF = [HEX(c) for c in ('#102418', '#1a3c1e', '#265624', '#36702c', '#4a8c34', '#68a640', '#90c25a')]
GRAPE = [HEX(c) for c in ('#160a1e', '#2a1438', '#40204e', '#583068', '#744684', '#9468a4', '#bc9ccc')]  # dusky purple with a bloom
SOILL = [HEX(c) for c in ('#2a1a0e', '#3e2818', '#56381e')]   # the soil a root or tuber sits in
GFLOW = [HEX(c) for c in ('#5a6a24', '#8a9c3a', '#b8c862')]


def put_line(cv, pts, col, over=True):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
        for i in range(n + 1): cv.put(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, col, over)


def ball(cv, cx, cy, rx, ry, ramp, hi=True, k0=0, cut=None):
    """a lit round mass: tones step by how much each pixel faces the light; one highlight mass up-left"""
    top = len(ramp) - 1
    for y in range(int(math.floor(cy - ry)), int(math.ceil(cy + ry)) + 1):
        for x in range(int(math.floor(cx - rx)), int(math.ceil(cx + rx)) + 1):
            u, v = (x - cx) / rx, (y - cy) / ry
            if u * u + v * v > 1 or (cut and not cut(x, y)): continue
            l = -u * .6 - v * .8
            k = 2 + (l > -.2) + (l > .3) + (l > .7) - (l < -.65) + k0
            if u * u + v * v > .72 and l < -.1: k -= 1                                 # the turned-away rim
            cv.put(x, y, ramp[max(0, min(top - (0 if hi else 1), k))])


# ================================================================ potato: a bushy plant of compound leaves, lilac-white flowers,
# then the haulm yellows and the tubers break the soil
def compound(cv, x0, y0, ang, L, ramp, back=False, pairs=2, droop=0.0, lw=1.7):
    """a potato leaf: a stalk with pairs of oval leaflets and one at the tip, drawn as one piece (dark line where it overlaps)"""
    d = 1 if back else 0
    R = ramp[:len(ramp) - d] if d else ramp
    cv.begin()
    pts = []; cx, cy = x0, y0; n = int(L * 2)
    for i in range(n + 1):
        t = i / n; a = ang + droop * t * t
        cx += math.sin(a) * L / n; cy -= math.cos(a) * L / n; pts.append((cx, cy, a))
    for (x, y, a) in pts[:-2]: cv.put(x, y, R[3])
    for j in range(pairs):
        t = .42 + j * (.5 / max(1, pairs))
        x, y, a = pts[int(t * n)]
        for s in (-1, 1):
            _leafp(cv, x, y, a + s * (1.05 - j * .12), 3.2 + j * .5, lw * (.9 + .1 * j), R)
    x, y, a = pts[-1]
    _leafp(cv, x - math.sin(a) * 1.2, y + math.cos(a) * 1.2, a, 4.4, lw * 1.12, R)
    cv.end(R[1])


def _leafp(cv, x0, y0, ang, L, W, ramp):
    """a small oval leaflet with a lit rim toward the light and a pale midrib"""
    top = len(ramp) - 1; ex, ey = x0 + math.sin(ang) * L * .55, y0 - math.cos(ang) * L * .55
    for y in range(int(ey - L) - 1, int(ey + L) + 2):
        for x in range(int(ex - L) - 1, int(ex + L) + 2):
            dx, dy = x - ex, y - ey
            u = dx * math.sin(ang) - dy * math.cos(ang); v = dx * math.cos(ang) + dy * math.sin(ang)
            e = (u / (L * .58)) ** 2 + (v / W) ** 2
            if e > 1: continue
            l = -(dx / L) * .6 - (dy / L) * .8
            k = top - 2 if l > -.1 else top - 3
            if e > .55 and l > .15: k = top - 1
            if e > .6 and l < -.3: k = top - 4
            if abs(v) < .5 and -L * .4 < u < L * .3: k = top - 1
            cv.put(x, y, ramp[max(0, k)])


def potato_flower(cv, x, y):
    for (dx, dy, k) in ((0, -1, 2), (-1, 0, 3), (1, 0, 1), (0, 1, 1), (-1, -1, 3), (1, 1, 0)): cv.put(x + dx, y + dy, PFLOW[k])
    cv.put(x, y, EYEL)


def tuber(cv, cx, cy, rx, ry, eyes, lip=True):
    """a tuber pushing out of the soil: lit up-left, its foot cut off by a 1 px lip of soil"""
    ball(cv, cx, cy, rx, ry, TUBER)
    for (dx, dy) in eyes: cv.put(cx + dx, cy + dy, TUBER[1])
    if lip:   # cut off where it meets the soil: the outline then draws a 1 px lip under the cut
        y = round(cy + ry * .5)
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            for yy in range(y + 1, int(cy + ry) + 2): cv.px.pop((x, yy), None)


def potato(stage):
    cv = Canvas(32, 64); B = 58; cx = 16
    contact(cv, cx, B, 4 + 2 * stage)
    if stage == 0:
        seed_leaf(cv, cx - 1, B - 3, -.7, 4.2, 1.8, LEAF); seed_leaf(cv, cx + 1, B - 2, .8, 3.6, 1.6, LEAF)
        cv.put(cx, B - 1, LEAF[3]); cv.put(cx, B - 2, LEAF[4])
        return outline(cv.image())
    if stage == 1:
        compound(cv, cx + 1, B - 1, .2, 9, LEAF, back=True, pairs=2)
        compound(cv, cx - 1, B - 1, -.95, 8, LEAF, pairs=1, droop=-.2)
        compound(cv, cx + 1, B - 1, 1.0, 7.5, LEAF, pairs=1, droop=.25)
        return outline(cv.image())
    dry = stage == 3
    R = LEAF
    YEL = [HEX(c) for c in ('#26240e', '#3e3e14', '#5c5a1c', '#7c7826', '#9c9432', '#bcb044', '#d6c862')]   # the haulm going over
    spec = ((-.35, 13, -.05, True, 3, 0), (.4, 12.5, .1, True, 3, 0), (-1.15, 11, -.35, False, 2, 1), (1.2, 11, .4, False, 2, 1),
            (-.65, 12, -.15, False, 2, 0), (.75, 11.5, .2, False, 2, 0))
    for i, (a, L, dr, back, pr, lowr) in enumerate(spec):
        ramp = (YEL if (dry and i in (2, 3, 4)) else R)
        compound(cv, cx + a * 1.5, B - 2 - lowr, a, L, ramp, back=back, pairs=pr, droop=dr)
    if stage == 2:
        for (fx, fy) in ((cx - 4, B - 17), (cx + 3, B - 18), (cx + 8, B - 13), (cx - 9, B - 12)): potato_flower(cv, fx, fy)
    else:
        tuber(cv, cx + 1, B - 2, 2.6, 1.9, ((0, -1),))                              # half hidden behind the big one
        tuber(cv, cx - 4, B - 1, 3.8, 2.9, ((-1, -1), (2, -2)))                     # about 7x5, the biggest
        tuber(cv, cx + 6, B + 1, 2.2, 1.6, ())                                       # about 4x3, lower and to the right
    return outline(cv.image())


# ================================================================ carrot: feathery tops from a crown, an orange shoulder showing
def frond(cv, x0, y0, ang, L, droop=0.0, back=False):
    """a carrot top: a bare lit stalk with three or four small fans of leaflets up it and one at the tip, gaps between, so
    the top reads feathery and airy (a solid mass reads as parsley or lettuce)"""
    R = FERN[:-1] if back else FERN; top = len(R) - 1
    cv.begin()
    cx, cy = x0, y0; n = int(L * 2); pts = []
    for i in range(n + 1):
        t = i / n; a = ang + droop * t * t
        cx += math.sin(a) * L / n; cy -= math.cos(a) * L / n; pts.append((cx, cy, a, t))
    for (x, y, a, t) in pts: cv.put(x, y, R[top - 3] if t < .5 else R[top - 2])
    fans = (.42, .62, .8, 1.0) if L > 9 else (.55, .8, 1.0)
    for j, ft in enumerate(fans):
        x, y, a, t = pts[min(n, int(ft * n))]
        size = 1.6 + 1.4 * ft
        for da, sl in ((-.95, .8), (-.45, 1.0), (0, 1.1), (.45, 1.0), (.95, .8)):
            if ft < .99 and da == 0: continue
            ba = a + da
            m = max(1, int(size * sl))
            for k in range(1, m + 1):
                lit = (math.sin(ba) * LIGHT[0] - math.cos(ba) * LIGHT[1]) > 0 or da < 0
                cv.put(x + math.sin(ba) * k, y - math.cos(ba) * k, R[top] if (k == m and da < 0) else R[top - 1] if lit else R[top - 3])
    cv.end(R[1])


def carrot_top(cv, cx, cy, w, h):
    """the carrot's shoulder showing above the soil: a domed top the stems rise from, sides tapering in toward the soil and
    cut off there (the outline gives it a 1 px soil lip), two darker ring dashes and a 2x2 highlight up-left"""
    top = int(cy - h) + 1
    for y in range(top, int(cy) + 1):
        t = (y - top) / max(1, h - 1)
        half = w / 2 - (1 if y == top else 0) - t * 1.0
        for x in range(int(round(cx - half)), int(round(cx + half))):
            u = (x + .5 - cx) / max(1, half)
            k = 3 + (u < -.15) + (y == top and u < .3) - (u > .5)
            cv.put(x, y, CARR[max(0, min(5, k))])
    if h >= 3:
        for x in (cx - 2, cx - 1): cv.put(x, top + 2, CARR[2])                        # ring dashes
        for x in (cx + 1, cx + 2): cv.put(x, top + 1, CARR[2])
    for (dx, dy) in ((-3, 0), (-2, 0), (-3, 1), (-2, 1)) if w > 6 else ((-2, 0), (-1, 0)): cv.put(cx + dx, top + dy, CARR[5])
    for (dx, dy) in ((-1, -1), (0, -1)): cv.put(cx + dx, top + dy, FERN[2])                          # the stems' foot


def carrot(stage):
    cv = Canvas(32, 64); B = 58; cx = 16
    contact(cv, cx, B, 3 + 2 * stage)
    if stage == 0:
        for (a, L) in ((-.45, 5.5), (.35, 4.6)):
            leaf(cv, cx + (a > 0), B - 1, a, L, 1.0, a * .2, FERN, blade=True)
        return outline(cv.image())
    spec = {1: ((-.75, 8, -.15, True), (-.2, 10, 0, False), (.3, 9.5, .05, True), (.8, 7.5, .2, False)),
            2: ((-1.0, 11, -.3, True), (-.45, 14, -.1, True), (.1, 15, 0, False), (.6, 13, .15, False), (-.2, 11.5, -.05, False)),
            3: ((-1.05, 13, -.35, True), (-.55, 16, -.12, True), (0.0, 18, 0, False), (.5, 16.5, .1, True), (.95, 13.5, .3, False), (-.3, 14, -.05, False))}[stage]
    for (a, L, d, back) in [s for s in spec if s[3]] + [s for s in spec if not s[3]]:
        frond(cv, cx + a * .8, B - (5 if stage == 3 else 3), a, L, d, back)
    if stage == 2: carrot_top(cv, cx, B, 6, 3)
    if stage == 3: carrot_top(cv, cx, B, 8, 5)
    return outline(cv.image())


# ================================================================ cabbage: a rosette of round blue-green leaves that cups into a
# pale head
def round_leaf(cv, x0, y0, ang, L, W, ramp, back=False, veins=2):
    """a cabbage leaf: a broad smooth oval with a softly waved rim (no straight edges), one body tone, a 1 px lit rim at
    the upper left and a shade rim at the lower right, a pale midrib branching into veins. The only dark line is where it
    overlaps a leaf drawn before it."""
    d = 1 if back else 0; top = len(ramp) - 1 - d
    ex, ey = x0 + math.sin(ang) * L * .55, y0 - math.cos(ang) * L * .55
    px = set()
    for y in range(int(ey - L) - 2, int(ey + L) + 3):
        for x in range(int(ex - L) - 2, int(ex + L) + 3):
            dx, dy = x - ex, y - ey
            u = dx * math.sin(ang) - dy * math.cos(ang); v = dx * math.cos(ang) + dy * math.sin(ang)
            th = math.atan2(v / W, u / (L * .55))
            r = (abs(u / (L * .55)) ** 2.6 + abs(v / W) ** 2.6) ** (1 / 2.6)       # blunt ends, not points
            if r <= 1 + .06 * math.sin(th * 6): px.add((x, y))
    for _ in range(2):
        px = {p for p in px if sum((p[0] + a, p[1] + b) in px for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))) >= 2}
    cv.begin()
    for (x, y) in px:
        up_l = (x - 1, y) not in px or (x, y - 1) not in px
        dn_r = (x + 1, y) not in px or (x, y + 1) not in px
        cv.put(x, y, ramp[top - 3] if dn_r else ramp[top - 1] if up_l else ramp[top - 2])
    mid = []
    for k in range(1, int(L * .92)):
        x, y = round(x0 + math.sin(ang) * k), round(y0 - math.cos(ang) * k)
        if (x, y) in px: cv.put(x, y, ramp[top]); mid.append((k, x, y))
    for j in range(veins):
        t = .38 + .24 * j
        bx, by = x0 + math.sin(ang) * L * t, y0 - math.cos(ang) * L * t
        for s_ in (-1, 1):
            va = ang + s_ * .85
            for k in range(1, int(W * .75)):
                x, y = round(bx + math.sin(va) * k), round(by - math.cos(va) * k)
                inner = all(q in px for q in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
                if (x, y) in px and inner: cv.put(x, y, ramp[top - 1])
    cv.end(ramp[1])


def cabbage_head(cv, hx, hy, rx, ry, R=HEAD):
    """the pale head with leaves wrapped round it: curved edges sweeping from the upper left down to the right, each a darker
    line with a 1 px lit lip above it, and one highlight mass"""
    cv.begin(); ball(cv, hx, hy, rx, ry, R)
    for (cx0, cy0, rr, a0, a1) in ((-.15, .35, .95, 200, 330), (.35, -.1, .75, 215, 320), (-.55, -.25, .6, 240, 330)):
        for dd in range(a0, a1, 3):
            t = math.radians(dd); x = hx + rx * (cx0 + math.cos(t) * rr); y = hy + ry * (cy0 + math.sin(t) * rr * .85)
            if (round(x), round(y)) in cv.px and (round(x), round(y - 1)) in cv.px:
                cv.put(x, y, R[2]); cv.put(x, y - 1, R[5])
    for (dx, dy) in ((-3, -4), (-2, -4), (-3, -3), (-4, -3), (-2, -5)): cv.put(hx + dx * rx / 8, hy + dy * ry / 7, R[6])
    for k in range(int(ry * .7)): cv.put(hx + 1, hy + ry * .2 - k * .5 + k * 0, R[4]) if False else None
    cv.end(R[0])


def cabbage(stage):
    cv = Canvas(32, 64); B = 58; cx = 16
    contact(cv, cx, B, 4 + 2 * stage)
    if stage == 0:
        seed_leaf(cv, cx - 1, B - 3, -.8, 4.2, 2.0, CABB[1:]); seed_leaf(cv, cx + 1, B - 3, .75, 4.0, 2.0, CABB[1:])
        return outline(cv.image())
    if stage == 1:
        round_leaf(cv, cx, B - 2, -.1, 8, 4.0, CABB, back=True, veins=0)
        round_leaf(cv, cx - 1, B - 1, -1.2, 7.5, 3.8, CABB, veins=0)
        round_leaf(cv, cx + 1, B - 1, 1.25, 7, 3.6, CABB, veins=0)
        return outline(cv.image())
    if stage == 2:
        round_leaf(cv, cx - 1, B - 3, -.55, 10, 5.0, CABB, back=True, veins=0)
        round_leaf(cv, cx + 1, B - 3, .65, 9.5, 4.8, CABB, back=True, veins=0)
        cabbage_head(cv, cx, B - 6, 4.6, 4.0)
        round_leaf(cv, cx - 2, B - 1, -1.3, 9, 4.6, CABB, veins=0)
        round_leaf(cv, cx + 2, B - 1, 1.35, 8.5, 4.4, CABB, veins=0)
        return outline(cv.image())
    round_leaf(cv, cx - 1, B - 4, -.6, 11, 5.6, CABB, back=True, veins=0)
    round_leaf(cv, cx + 1, B - 4, .7, 10.5, 5.4, CABB, back=True, veins=0)
    cabbage_head(cv, cx, B - 9, 8.0, 7.0)
    round_leaf(cv, cx - 3, B - 1, -1.35, 10, 5.0, CABB, veins=0)                              # the wrapper leaves, cupping its foot
    round_leaf(cv, cx + 3, B - 1, 1.4, 9.5, 4.8, CABB, veins=0)
    return outline(cv.image())


def ear(cv, x, y, ang, n, ramp, nod=0.0):
    """an awned ear from (x, y) going along ang: kernels in two rows, a long fine awn from each, lit on the left"""
    top = len(ramp) - 1; pts = []; cx, cy = x, y
    for i in range(n):
        a = ang + nod * (i / max(1, n - 1)) ** 1.3
        cx += math.sin(a) * 1.1; cy -= math.cos(a) * 1.1; pts.append((cx, cy, a))
    for i, (px, py, a) in enumerate(pts):
        s = -1 if i % 2 else 1
        nx, ny = math.cos(a) * s, math.sin(a) * s
        cv.put(px, py, ramp[top - 2]); cv.put(px + nx * .8, py + ny * .8, ramp[top - 1] if s < 0 else ramp[top - 3])
        aw = a + s * .32
        for k in range(1, 5 if i < n - 1 else 6):                                    # the awn, thinning to a lighter tip
            cv.put(px + nx + math.sin(aw) * k, py + ny - math.cos(aw) * k, ramp[top] if k > 2 else ramp[top - 1], over=False)
    return pts


def barley(stage):
    cv = Canvas(32, 64); B = 58; cx = 16
    contact(cv, cx, B, 3 + 2 * stage)
    if stage == 0:
        for (a, L) in ((-.5, 5.5), (.15, 6.5), (.65, 4.5)): leaf(cv, cx + round(a * 2), B - 1, a, L, 1.1, a * .3, BGRN, blade=True)
        return outline(cv.image())
    if stage == 1:
        for (a, L, d) in ((-.85, 9, -.3), (-.35, 12.5, -.1), (.05, 14, 0), (.45, 12, .15), (.9, 9.5, .35), (-.1, 10, -.05)):
            leaf(cv, cx + round(a * 2), B - 1, a, L, 1.3, a * .25, BGRN, blade=True, droop=d)
        return outline(cv.image())
    ripe = stage == 3
    SR = BARL if ripe else BGRN
    ER = BARL if ripe else [HEX(c) for c in ('#1e3416', '#2e4e1c', '#466c24', '#62882e', '#82a63e', '#a4c25a', '#c8dc86')]
    # separate 1 px stems, each from its own spot, each its own lean and height, the heads staggered; soil shows between
    # them low down (evenly spaced parallel stems read as banding or a bamboo bundle)
    stems = ((-7, 23, -.3), (-4, 30, -.15), (-1, 34, -.03), (2, 27, .08), (5, 31, .19), (8, 21, .32)) if ripe else \
            ((-6, 22, -.5), (-2, 27, -.2), (1, 31, .02), (5, 25, .26), (8, 20, .48))
    for i, (dx, L, lean) in enumerate(stems):
        x0 = cx + dx * (.8 if ripe else .4); pts = []
        for k in range(int(L)):
            pts.append((x0 + math.sin(lean) * k * (.6 + .4 * k / L), B - 1 - k))
        for j, (x, y) in enumerate(pts): cv.put(x, y, (SR[4] if j % 7 == 3 else SR[3]) if ripe else (SR[3] if j > L * .3 or i % 2 else SR[2]))
        x, y = pts[-1]
        ear(cv, x, y, lean * 1.6, 7 if ripe else 6, ER, nod=(1.4 if dx >= 0 else -1.4) if ripe else (.9 * (1 if dx > 0 else -1) if abs(dx) >= 6 else 0))
        if i in (1, 4):                                                              # a flag leaf on two of the stems, at different heights
            fy = B - 1 - int(L * (.45 if i == 1 else .6)); fx = x0 + math.sin(lean) * (B - 1 - fy)
            leaf(cv, fx, fy, lean + (.9 if dx > 0 else -.9), 7, 1.0, (.3 if dx > 0 else -.3), SR, blade=True, droop=(.5 if dx > 0 else -.5))
    for (a, L, d) in ((-.95, 7, -.4), (.9, 6.5, .4)):
        leaf(cv, cx + round(a * 3), B - 1, a, L, 1.2, a * .2, SR, blade=True, droop=d)
    return outline(cv.image())


def pole(cv, x, top, B, ramp=WOOD, w=2):
    for y in range(top, B + 1):
        for dx in range(w):
            cv.put(x + dx, y, ramp[3] if dx == 0 else ramp[2])
        if (y - top) % 9 == 4: cv.put(x + w - 1, y, ramp[1])                         # grain knots
    for dx in range(w): cv.put(x + dx, top, ramp[4] if dx == 0 else ramp[3])


def hop_cone(cv, x, y, s=1.0):
    """a hop cone pointing down and tapering to a point: a green body, two staggered rows of darker chevron scales (each
    scale's lower edge a V), and the pale step only on the scales at the top left; on a 1 px stalk"""
    x, y = int(round(x)), int(round(y))
    cv.begin()
    cv.put(x, y - 1, HOPL[3])
    rows = (2, 4, 4, 4, 3, 2, 1) if s >= 1 else (2, 3, 3, 2, 1)
    for i, w in enumerate(rows):
        x0 = x - w // 2
        for j in range(w):
            k = 3
            if i <= 2 and j <= 1: k = 4                                                # the lit top-left scales
            if i == 0 and j == 0: k = 5
            if j == w - 1 and w > 1: k = 2
            cv.put(x0 + j, y + i, HOPC[k])
    for (cy_, off) in ((2, 0), (4, 1)) if s >= 1 else ((2, 0),):                       # chevrons: each scale's lower edge
        for cx_ in (x - 2 + off, x + off):
            for (dx, dy) in ((0, 0), (1, 1)):
                X, Y = cx_ + dx, y + cy_ + dy
                if (X, Y) in cv.grp: cv.put(X, Y, HOPC[1])
            if (cx_ + 2, y + cy_) in cv.grp: cv.put(cx_ + 2, y + cy_, HOPC[2])
    cv.end(HOPC[0])


def hops(stage):
    cv = Canvas(32, 64); B = 58; cx = 16
    contact(cv, cx, B, 3 + 2 * stage)
    if stage == 0:
        seed_leaf(cv, cx - 1, B - 3, -.7, 4.0, 1.8, HOPL); seed_leaf(cv, cx + 1, B - 3, .75, 3.8, 1.7, HOPL)
        for (dx, dy) in ((0, -2), (0, -3), (0, -4), (1, -5), (1, -6), (0, -7)): cv.put(cx + dx, B + dy, HOPL[4])   # the shoot feeling for a pole
        return outline(cv.image())
    px = cx - 1; top = {1: B - 30, 2: B - 52, 3: B - 52}[stage]
    pole(cv, px, top, B)
    H = {1: 22, 2: 48, 3: 48}[stage]
    path = []
    for k in range(H):
        y = B - 2 - k; x = px + .5 + 2.6 * math.sin(k * .42 + .3 * math.sin(k * .13))
        front = math.cos(k * .42) > 0
        path.append((x, y, front))
    for (x, y, f) in path:
        cv.put(x, y, HOPL[3] if f else HOPL[2], over=f)
        if f: cv.put(x, y - 1, HOPL[4])
    # leaves at irregular steps, sizes and reach; some sit across the pole, some behind it (a ladder of copies reads as a bean pole)
    spots = [(.08, -1, 3.4, 0, 'front'), (.2, 1, 4.6, 1, 'front'), (.31, -1, 5.2, 2, 'back'), (.47, 1, 3.8, 0, 'front'), (.52, -1, 4.4, -1, 'front'),
             (.68, 1, 5.0, 2, 'back'), (.8, -1, 3.6, 1, 'front'), (.9, 1, 3.0, 0, 'front')]
    if stage == 1: spots = [(.25, -1, 3.6, 0, 'front'), (.55, 1, 4.2, 1, 'front'), (.85, -1, 3.0, 0, 'back')]
    for i, (t, side, r, off, tone) in enumerate(spots):
        x, y, f = path[min(len(path) - 1, int(t * H))]
        pleaf4(cv, x + side * (r * .8 + off), y + 1 + (i % 2), 3, r, r * .52, 46 + (i * 7) % 18, tone, squash=.72 + (i % 3) * .05)
    if stage == 3:
        for (t, side, drop) in ((.16, 1, 3), (.28, -1, 1), (.42, 1, 4), (.6, -1, 2), (.66, 1, 0), (.84, -1, 3)):
            x, y, f = path[int(t * H)]
            sx = x + side * (5 + (drop % 2)); sy = y + 1
            for k in range(drop): cv.put(sx, sy + k, HOPL[4])                        # the stalk it hangs on
            hop_cone(cv, sx, sy + drop + 1, 1.0 if drop else .8)
    put_line(cv, [(px + .5, top), (px + .5, top - 1)], TWINE)
    return outline(cv.image())


def bunch(cv, x, y, rows=(4, 4, 3, 3, 2, 1)):
    cv.begin()
    cv.put(x, y - 1, VINEW[2]); cv.put(x, y - 2, VINEW[2])
    for i, w in enumerate(rows):
        for j in range(w):
            bx = x - (w - 1) + j * 2; by = y + round(i * 1.7)
            for (dx, dy, k) in ((0, 0, 4), (1, 0, 3), (0, 1, 3), (1, 1, 2)):
                cv.put(bx + dx, by + dy, GRAPE[k])
            cv.put(bx, by, GRAPE[6] if (i + j) % 3 == 0 else GRAPE[5])
    cv.end(GRAPE[1])


PLANED = [HEX(c) for c in ('#3a2a18', '#5e4628', '#86683e', '#a88a58', '#c8ac78')]   # the trellis: planed, pale, no knots


def trellis(cv, cx, bar, B, x0, x1):
    for y in range(bar, B + 1):                                                       # a straight 3 px post
        cv.put(cx - 1, y, PLANED[3]); cv.put(cx, y, PLANED[2]); cv.put(cx + 1, y, PLANED[1])
    for x in range(x0, x1 + 1):                                                       # the crossbar, its top face lit
        cv.put(x, bar - 1, PLANED[4] if x < cx else PLANED[3]); cv.put(x, bar, PLANED[2]); cv.put(x, bar + 1, PLANED[1])


def grapes(stage):
    cv = Canvas(32, 64); B = 58; cx = 16
    contact(cv, cx, B, 4 + 2 * stage)
    if stage == 0:
        seed_leaf(cv, cx - 1, B - 3, -.75, 4.0, 1.9, GLEAF); seed_leaf(cv, cx + 1, B - 3, .7, 3.8, 1.8, GLEAF)
        cv.put(cx, B - 1, VINEW[2]); cv.put(cx, B - 2, VINEW[3])
        return outline(cv.image())
    if stage == 1:
        for y in range(B - 22, B + 1):
            cv.put(cx - 1, y, PLANED[3]); cv.put(cx, y, PLANED[2]); cv.put(cx + 1, y, PLANED[1])
        for k in range(17):
            x = cx + 1.8 * math.sin(k * .5); f = math.cos(k * .5) > 0
            cv.put(x, B - 1 - k, VINEW[2] if f else VINEW[1], over=f)
        pleaf4(cv, cx - 5, B - 12, 5, 3.6, 1.9, 70, 'back', squash=.8)
        pleaf4(cv, cx + 5, B - 17, 5, 4.0, 2.1, 70, 'front', squash=.8)
        pleaf4(cv, cx - 4, B - 4, 3, 3.0, 1.7, 56, 'front', squash=.8)
        return outline(cv.image())
    bar = B - 36
    trellis(cv, cx, bar, B, 1, 30)
    for k in range(36):                                                               # the vine, darker, twisting up round the post
        x = cx + 2.2 * math.sin(k * .34); f = math.cos(k * .34) > 0
        cv.put(x, B - 1 - k, VINEW[2] if f else VINEW[1], over=f)
        if f and k % 4 == 1: cv.put(x - 1, B - 1 - k, VINEW[3])
    for s_ in (-1, 1):                                                                # its arms along the bar, sagging between ties
        for k in range(12):
            cv.put(cx + s_ * (k + 2), bar + 2 + round(.9 * math.sin(k * .5)), VINEW[2])
    # three or four uneven clumps hanging from the bar, the bar's ends clear of them
    clumps = ((cx - 9, bar + 3, 4.6, 'front'), (cx - 3, bar + 1, 3.6, 'back'), (cx + 5, bar + 4, 5.0, 'front'), (cx + 10, bar + 1, 3.2, 'back'))
    for (x, y, r, tone) in clumps:
        pleaf4(cv, x, y, 5, r, r * .5, 72, tone, squash=.82)
    if stage == 2:
        for (dx, dy) in ((-6, 7), (7, 8)):
            for (ddx, ddy, k) in ((0, 0, 2), (1, 0, 1), (0, 1, 1), (1, 1, 0), (0, 2, 1)): cv.put(cx + dx + ddx, bar + dy + ddy, GFLOW[k])
    else:
        bunch(cv, cx - 7, bar + 7, rows=(4, 4, 3, 2, 1))
        bunch(cv, cx + 3, bar + 9, rows=(3, 3, 2, 2, 1))
        bunch(cv, cx + 10, bar + 6, rows=(2, 2, 1))
    return outline(cv.image())


CROPS = {'potato': potato, 'carrot': carrot, 'cabbage': cabbage, 'barley': barley, 'hops': hops, 'grapes': grapes}


# ================================================================ the produce icons (32x32): drawn big, the same light and lines
def icon_potato():
    cv = Canvas(32, 32)
    tuber(cv, 12, 18, 8.2, 6.0, ((-3, -2), (2, -3), (4, 1)))
    tuber(cv, 21, 22, 6.4, 4.8, ((-2, -1), (2, 1)))
    return outline(cv.image())


def icon_carrot():
    cv = Canvas(32, 32)
    for (a, L, d) in ((-.5, 9, -.2), (-.05, 10, 0), (.45, 9, .2)): frond(cv, 11 + a, 11, a - .55, L, d)
    for i in range(18):                                                               # the root, tapering down to the right
        t = i / 17; w = 3.6 * (1 - t) ** .8 + .5
        x0, y0 = 11 + i * .62, 11 + i * .9
        for o in range(-int(w) - 1, int(w) + 2):
            if abs(o) > w: continue
            l = -o / max(1, w)
            k = 3 + (l > .3) - (l < -.4) + (i < 3)
            if i % 4 == 2 and abs(o) < w - .5 and o > -w + 1: k -= 1                  # rings
            cv.put(x0 + o * .82, y0 - o * .55, CARR[max(0, min(5, k))])
    return outline(cv.image())


def icon_cabbage():
    cv = Canvas(32, 32)
    round_leaf(cv, 9, 27, -1.15, 11, 5.6, CABB, back=True, veins=0)
    round_leaf(cv, 23, 27, 1.2, 11, 5.6, CABB, back=True, veins=0)
    cabbage_head(cv, 16, 16, 10, 9)
    round_leaf(cv, 11, 29, -.7, 9, 4.8, CABB, veins=0)
    round_leaf(cv, 21, 29, .75, 9, 4.8, CABB, veins=0)
    return outline(cv.image())


def icon_barley():
    cv = Canvas(32, 32)
    for (x0, a, n) in ((10, -.38, 8), (14, -.12, 9), (18, .14, 9), (22, .4, 8)):
        for k in range(14): cv.put(x0 + 2 + k * math.sin(a) * -.1 - (k * a * .05), 30 - k, BARL[3] if k % 4 else BARL[4])
        ear(cv, x0 + 2, 17, a, n, BARL)
    for x in range(10, 23): cv.put(x, 25, WOOD[3]); cv.put(x, 26, WOOD[2])               # the twine tie
    return outline(cv.image())


def icon_hops():
    cv = Canvas(32, 32)
    pleaf4(cv, 16, 9, 3, 6.0, 3.2, 54, 'front', squash=.75)
    for (x, y) in ((9, 13), (22, 12), (15, 18)):
        cv.begin()
        rows = (3, 4, 5, 5, 4, 4, 3, 2, 1)
        for i, w in enumerate(rows):
            for j in range(w):
                px_ = x - (w - 1) / 2 + j; py = y + i
                k = 3 + (j <= 1) + (i < 3) - (j == w - 1)
                if (i + j) % 2 == 0 and i % 2 == 0: k += 1
                cv.put(px_, py, HOPC[max(1, min(6, k))])
            if i % 2 == 1: cv.put(x - (w - 1) / 2, y + i, HOPC[2])
        cv.put(x, y - 1, HOPL[4]); cv.end(HOPC[1])
    return outline(cv.image())


def icon_grapes():
    cv = Canvas(32, 32)
    pleaf4(cv, 21, 9, 5, 5.6, 2.8, 72, 'front', squash=.8)
    for k in range(6): cv.put(15 + k * .3, 3 + k, VINEW[2]); cv.put(16 + k * .3, 3 + k, VINEW[3])
    cv.begin()
    rows = (5, 6, 5, 5, 4, 3, 2, 1)
    for i, w in enumerate(rows):
        for j in range(w):
            bx = 16 - (w - 1) * 1.5 + j * 3; by = 8 + i * 2.6
            for (dx, dy, k) in ((0, 0, 4), (1, 0, 4), (2, 0, 3), (0, 1, 4), (1, 1, 3), (2, 1, 2), (0, 2, 3), (1, 2, 2), (2, 2, 1)):
                cv.put(bx + dx, by + dy, GRAPE[k])
            cv.put(bx, by, GRAPE[6] if (i + j) % 2 == 0 else GRAPE[5])
    cv.end(GRAPE[0])
    return outline(cv.image())


ICONS = {'potato': icon_potato, 'carrot': icon_carrot, 'cabbage': icon_cabbage, 'barley': icon_barley, 'hops': icon_hops, 'grapes': icon_grapes}
BAND = {'potato': ('#3e2414', '#5c3a1e', '#7e5430', '#a07446', '#c49a66'), 'carrot': ('#5a1a06', '#82300c', '#b04a14', '#d8681e', '#f09440'),
        'cabbage': ('#12302a', '#1e4a3c', '#2e6650', '#4a8468', '#76a88a'), 'barley': ('#4a3410', '#6e5018', '#987022', '#bc9434', '#dcba5c'),
        'hops': ('#24381a', '#365422', '#4e7230', '#6e9440', '#98b860'), 'grapes': ('#1c0e24', '#2e1638', '#46224e', '#603468', '#8a5a94')}


def mini(icon, w=11, h=13):
    """shrink a 32px icon for the packet's window: majority colour per cell, dark rim kept, then the outline redone"""
    im = icon; W, H = im.size; p = im.load()
    bb = im.getbbox(); x0, y0, x1, y1 = bb
    sc = max((x1 - x0) / w, (y1 - y0) / h)
    ow, oh = max(1, round((x1 - x0) / sc)), max(1, round((y1 - y0) / sc))
    out = Image.new('RGBA', (ow, oh), (0, 0, 0, 0)); q = out.load()
    for y in range(oh):
        for x in range(ow):
            cols = {}
            for yy in range(int(y0 + y * sc), int(y0 + (y + 1) * sc)):
                for xx in range(int(x0 + x * sc), int(x0 + (x + 1) * sc)):
                    c = p[xx, yy]
                    if c[3] > 128: cols[c] = cols.get(c, 0) + 1
            n = sum(cols.values()); cells = max(1, int(sc) ** 2)
            if n * 2 >= cells:
                q[x, y] = max(cols, key=lambda c: (cols[c], -(c[0] + c[1] + c[2]) if False else 0))
    return out


def packet(template, crop, icon):
    """the turnip packet's paper and band, with this crop's picture and band colour"""
    im = template.copy(); p = im.load()
    for y in range(9, 22):                                                            # wipe the picture back to paper
        for x in range(8, 25): p[x, y] = p[x, 7]
    m = mini(icon)
    ox = 15 - m.size[0] // 2 + (1 if m.size[0] % 2 == 0 else 0); oy = 21 - m.size[1]
    im.alpha_composite(m, (ox, max(9, oy)))
    ramp = [HEX(c) for c in BAND[crop]]
    band = {}
    for y in range(22, 27):
        for x in range(9, 24):
            c = p[x, y]; band.setdefault(c[:3], 0)
    lum = lambda c: .3 * c[0] + .59 * c[1] + .11 * c[2]
    ranked = sorted(band, key=lum)
    for y in range(22, 27):
        for x in range(9, 24):
            c = p[x, y]; i = ranked.index(c[:3]); k = round(i * (len(ramp) - 1) / max(1, len(ranked) - 1))
            p[x, y] = ramp[k]
    return im


def install(obj, objects_json):
    """draw every stage, icon and packet into the game's sprite folder and register them beside the turnip"""
    import json
    O = json.load(open(objects_json)); rel = 'spr/lpc/obj/'
    for name, fn in CROPS.items():
        for st in range(4):
            fn(st).save(os.path.join(obj, f'{name}_{st}.png'))
            O[f'{name}_{st}'] = {'src': rel + f'{name}_{st}.png', 'fw': 32, 'fh': 64, 'ax': 16, 'ay': 58, 'foot': [0, 0, 0, 0]}
    tmpl = Image.open(os.path.join(obj, 'icon32_seed_turnip.png')).convert('RGBA')
    for name, fn in ICONS.items():
        ic = fn(); ic.save(os.path.join(obj, f'icon32_{name}.png')); packet(tmpl, name, ic).save(os.path.join(obj, f'icon32_seed_{name}.png'))
        for k in (f'icon32_{name}', f'icon32_seed_{name}'):
            O[k] = {'src': rel + k + '.png', 'fw': 32, 'fh': 32, 'ax': 16.0, 'ay': 32.0, 'foot': [0, 0, 0, 0], 'px': 'ase', 'chim': None}
    json.dump(O, open(objects_json, 'w'))
    print('installed', len(CROPS) * 4, 'stages and', len(ICONS) * 2, 'icons')


if __name__ == '__main__' and sys.argv[1] == '--install':
    install(sys.argv[2], sys.argv[3]); sys.exit(0)

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    obj = sys.argv[2] if len(sys.argv) > 2 else None
    for name, fn in CROPS.items():
        for st in range(4):
            im = fn(st); im.save(os.path.join(out, f'{name}_{st}.png'))
            sp = specks(im)
            if sp: print('  speck', name, st, sp[:6])
    for name, fn in ICONS.items():
        ic = fn(); ic.save(os.path.join(out, f'icon32_{name}.png'))
        if obj: packet(Image.open(os.path.join(obj, 'icon32_seed_turnip.png')).convert('RGBA'), name, ic).save(os.path.join(out, f'icon32_seed_{name}.png'))
    print('ok')
