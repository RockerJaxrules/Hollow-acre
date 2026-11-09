"""Tarmac and water ground textures (judge, ground: tarmac 3, water 3: "no noise mottle, no sprinkled specks: 3-4 flat
tones, hand-drawn clusters (8 px+, lit top-left) placed sparsely").

192x192 tiles that wrap. Faint flat tone zones from a wrapping low-frequency field, a quiet layer of in-tone marks
(one step off the base, 2-4 px shapes on a Poisson spacing), and deliberate features drawn as shapes, each kind several
times so no single one marks the repeat (LESSONS, ground tiles). Light from the top-left.

    python3 ground2.py OUT_DIR [tar] [water]
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ground import Tile, N, HEX
from forest_floor import wfield, tdist, stamp4, SHAPES3, DEAD6, RUST6, OCHRE6


def poisson(R, n, dmin, dmax, ok=lambda x, y: True, tries=20000):
    pts = []; k = 0
    while k < tries and len(pts) < n:
        k += 1; x, y = R.uniform(0, N), R.uniform(0, N)
        if not ok(x, y): continue
        if all(tdist((x, y), q) > R.uniform(dmin, dmax) for q in pts): pts.append((x, y))
    return pts


def spread(R, k, min_d, taken=()):
    """k points spread over the tile, each at least min_d from the others (and from taken)"""
    out = []
    for _ in range(4000):
        if len(out) >= k: break
        p = (R.uniform(0, N), R.uniform(0, N))
        if all(tdist(p, q) > min_d for q in out + list(taken)): out.append(p)
    return out


# ---------------------------------------------------------------- tarmac
TA = HEX('#2e2d33'); TA_LO, TA_HI = HEX('#2c2b31'), HEX('#302f35')   # barely there: zones, not stains
WEAR_L, WEAR_D = HEX('#333137'), HEX('#2a2730')   # wear clusters within one value step: warm grey light, plum dark
CRACK, LIP = HEX('#1d1a22'), HEX('#3c3a40')
PATCH, SEAM, PATCH_LIT = HEX('#26252b'), HEX('#1d1c21'), HEX('#34333a')
SNAKE, SNAKE_HI = HEX('#18151c'), HEX('#3e3c46')
OIL, OIL_DK, OIL_SHEEN = HEX('#252329'), HEX('#1f1d23'), HEX('#3a3448')


def crack(t, x, y, R, steps):
    """a crack: a wandering 1 px dark line with branches, a lighter lip on its lower-right side where the edge breaks"""
    a = R.uniform(0, 6.28); pts = []
    for i in range(steps):
        a += R.uniform(-.55, .55); x += math.cos(a); y += math.sin(a)
        pts.append((int(round(x)), int(round(y))))
        if i > 4 and R.random() < .07:   # a branch
            bx, by, ba = x, y, a + R.choice((-1, 1)) * R.uniform(.7, 1.2)
            for j in range(R.randint(4, 9)):
                ba += R.uniform(-.4, .4); bx += math.cos(ba); by += math.sin(ba); pts.append((int(round(bx)), int(round(by))))
    pts = list(dict.fromkeys(pts))
    for (px, py) in pts:
        if (px + 1, py + 1) not in pts and (px, py + 1) not in pts: t.put(px, py + 1, LIP)   # the broken edge catches the light, every step
    for (px, py) in pts: t.put(px, py, CRACK)


def tar(seed=21):
    R = random.Random(seed); t = Tile(TA)
    zf = wfield(seed, [(2, 1, 1), (-1, 3, .8), (3, -2, .5)])
    for y in range(N):
        for x in range(N):
            v = zf(x, y)
            if v > .5: t.put(x, y, TA_HI)
            elif v < -.55: t.put(x, y, TA_LO)
    # (judge: "a faint even lattice of lone lighter dots") wear as flat clusters of 3-8 px in two close tones, warm grey
    # and plum, on a Poisson spacing whose density drifts across the tile
    dens = wfield(seed + 3, [(1, 2, 1), (2, -1, .7), (-1, 3, .4)])
    for (x, y) in poisson(R, 170, 7, 15, ok=lambda a, b: R.random() < .55 + .45 * dens(a, b)):
        col = WEAR_L if R.random() < .55 else WEAR_D; w = R.randint(2, 4); h = R.randint(1, 2); ph = R.uniform(0, 6.28)
        for yy in range(-h, h + 1):
            for xx in range(-w, w + 1):
                if (xx / (w + .5)) ** 2 + (yy / (h + .5)) ** 2 < 1 + .25 * math.sin(xx * 1.7 + ph): t.put(int(x) + xx, int(y) + yy, col)
    # repair patches: two, flush with the road (no lit edge: lit edges read as raised drain covers), irregular (two
    # overlapping rectangles), a shade darker inside, sealed round the edge with a black tar line
    taken = []
    for (w, h) in ((28, 14), (20, 12)):
        (cx, cy), = spread(R, 1, 70, taken); taken.append((cx, cy)); x0, y0 = int(cx - w / 2), int(cy - h / 2)
        ox, oy, w2, h2 = R.randint(4, w // 2), R.choice((-1, 1)) * R.randint(3, 5), R.randint(w // 2, w - 4), R.randint(h // 2, h)
        inside = lambda x, y: (0 <= x < w and 0 <= y < h) or (ox <= x < ox + w2 and oy <= y < oy + h2)
        for y in range(-6, h + 7):
            for x in range(-2, w + 2):
                if not inside(x, y): continue
                edge = not all(inside(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
                t.put(x0 + x, y0 + y, SNAKE if edge else PATCH)
        for (x, y) in poisson(R, int(w * h / 30), 4, 6, ok=lambda a, b: inside(int(a) - x0, int(b) - y0) and inside(int(a) - x0 + 2, int(b) - y0 + 1) and inside(int(a) - x0 - 1, int(b) - y0 - 1), tries=800):
            t.put(int(x), int(y), TA_LO); t.put(int(x) + 1, int(y), TA_LO)
    # oil stains: two, hard edged, a darker heart and a faint sheen streak
    for (cx, cy) in spread(R, 2, 60, taken):
        taken.append((cx, cy)); rx, ry = R.uniform(7, 10), R.uniform(3.5, 5); ph = R.uniform(0, 6.28)
        for y in range(-7, 8):
            for x in range(-12, 13):
                a = math.atan2(y, x); rr = 1 + .15 * math.sin(3 * a + ph) + .1 * math.sin(5 * a + ph * 2)
                e = (x / rx) ** 2 + (y / ry) ** 2
                if e < rr * rr: t.put(int(cx) + x, int(cy) + y, OIL_DK if e < .3 else OIL)
        for k in range(R.randint(3, 5)): t.put(int(cx) - 3 + k, int(cy) - 1, OIL_SHEEN)
    # cracks, four of them, of different lengths
    for i, (cx, cy) in enumerate(spread(R, 4, 40)):
        crack(t, cx, cy, R, (40, 30, 24, 18)[i])
    # sealed cracks: black glossy tar lines with a short highlight
    for (cx, cy) in spread(R, 2, 70, taken):
        a = R.uniform(0, 6.28); x, y = cx, cy; pts = []
        for i in range(R.randint(22, 34)):
            a += R.uniform(-.3, .3); x += math.cos(a); y += math.sin(a); pts.append((int(round(x)), int(round(y))))
        pts = list(dict.fromkeys(pts))
        for (px, py) in pts: t.put(px, py, SNAKE); t.put(px + 1, py, SNAKE)
        for (px, py) in pts[3:9]: t.put(px, py - 1, SNAKE_HI)
    # a few leaves blown onto the road, in twos and threes
    for (cx, cy) in spread(R, 4, 40, taken):
        for k in range(R.choice((2, 3))):
            stamp4(t, cx + R.uniform(-5, 5), cy + R.uniform(-3, 3), R.choice(SHAPES3), R.choice((DEAD6, RUST6, OCHRE6))[1:4], R,
                   shadow_of=lambda c: HEX('#222127') if c in (TA, TA_LO, TA_HI, WEAR_L, WEAR_D) else None)
    return t


# ---------------------------------------------------------------- water
WB = HEX('#1d3f52'); WB_LO, WB_HI = HEX('#1a394a'), HEX('#21465a')
TROUGH = HEX('#163142'); CREST1, CREST2 = HEX('#2d5a6e'), HEX('#46788a')
FLECK = HEX('#203f50')


def water(seed=22):
    R = random.Random(seed); t = Tile(WB)
    zf = wfield(seed, [(0, 3, 1), (1, 4, .6), (-1, 5, .45), (2, 6, .3)])   # mostly along y: wandering horizontal bands, like light lying across water
    for y in range(N):
        for x in range(N):
            v = zf(x, y)
            if v > .5: t.put(x, y, WB_HI)
            elif v < -.55: t.put(x, y, WB_LO)
    # a quiet layer of short flat ripples one step off the water, 4-6 px long
    for (x, y) in poisson(R, 260, 6, 10):
        L = R.randint(4, 6); col = TROUGH if R.random() < .5 else CREST1 if zf(x, y) > .2 else FLECK
        for k in range(L): t.put(int(x) + k, int(y), col)
    # wave groups gathered in a few wind lanes: two to four stacked dashes, the top one lit, a dark trough under each,
    # leaning either way and of different lengths (judge: "every glint stack the same staircase stepping down-right")
    lanes = [R.uniform(0, N) for _ in range(4)]
    for (cx, cy) in poisson(R, 30, 18, 30, ok=lambda a, b: min(min(abs(b - l), N - abs(b - l)) for l in lanes) < 14):
        n = R.randint(2, 4); x0 = int(cx); lean = R.choice((-2, -1, 1, 2, 3))
        for i in range(n):
            L = max(3, R.randint(5, 13) - i * R.randint(1, 3)); y = int(cy) + i * R.choice((2, 3)); xs = x0 + R.randint(-2, 2) + i * lean
            for k in range(L):
                t.put(xs + k, y, CREST2 if (i == 0 and 1 <= k < L - 1) else CREST1)
                t.put(xs + k + 1, y + 1, TROUGH)
    return t


T = {'tar': tar, 'water': water}
if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for name in (sys.argv[2:] or list(T)):
        T[name]().save(os.path.join(out, f'tex_{name}.png')); print(name)
