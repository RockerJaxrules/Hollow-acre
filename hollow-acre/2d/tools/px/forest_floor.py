"""The forest floor (judge, ground 3/10: "no noise mottle, no sprinkled specks: 3-4 flat tones, hand-drawn clusters
(8 px+, lit top-left) placed sparsely; forest floor first (leaves, twigs, needles)").

A 192x192 tile that wraps. Dark olive-brown loam in three barely different tones (broad wrapping zones, hard edges, no
noise). On it, things drawn as shapes, every kind several times so no single one marks the repeat (lessons, ground):
drifts of fallen leaves (each leaf a lit oval with a dark edge and a stem, overlapping, in two muted autumn hues and a
dead brown), moss cushions (domes lit top-left, a dark rim and a short shadow), twigs with a fork and a lit top edge,
pebbles in twos and threes, and a few low fern clumps that tie it to the grass. Light from the top-left; every object
throws a one-pixel shadow down-right. No single pixels: the smallest mark is a 3x2 leaf.

    python3 forest_floor.py OUT.png [seed]
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ground import Tile, N, HEX, mound

BASE = HEX('#272a1c')
LO, HI = HEX('#232619'), HEX('#2b2e1f')          # half a step either way: zones, not stains
SH = HEX('#1a1c13')                               # every object's shadow
RUST = [HEX(c) for c in ('#3c2418', '#5a301c', '#7a4424', '#98602e', '#b07a3a')]
OCHRE = [HEX(c) for c in ('#3e3218', '#5c4a22', '#7c662e', '#9a823a', '#b09a4a')]
DEAD = [HEX(c) for c in ('#2e2518', '#43361f', '#594729', '#6e5a34', '#826c3e')]
MOSS = [HEX(c) for c in ('#1e2614', '#2a3a1a', '#3a4e22', '#4c622a', '#627834')]
TWIG = [HEX(c) for c in ('#1c1610', '#33281c', '#4e3e2a', '#6a5638')]
STONE = [HEX(c) for c in ('#26262a', '#3a3a40', '#504f56', '#6a6870', '#83808a')]
FERN = [MOSS[0], MOSS[1], MOSS[2], MOSS[3], MOSS[4]]
LX, LY = -.6, -.8                                 # toward the light


def tdist(a, b):
    dx = abs(a[0] - b[0]); dy = abs(a[1] - b[1]); dx = min(dx, N - dx); dy = min(dy, N - dy)
    return math.hypot(dx, dy)


def zones(t, seed):
    ph = [seed * .7 + k * 1.9 for k in range(4)]
    for y in range(N):
        for x in range(N):
            a = 2 * math.pi * x / N; b = 2 * math.pi * y / N
            v = (math.sin(2 * a + b + ph[0]) + .8 * math.sin(-a + 3 * b + ph[1]) + .5 * math.sin(3 * a - 2 * b + ph[2])
                 + .35 * math.sin(4 * a + 4 * b + ph[3]))
            if v > 1.0: t.put(x, y, HI)
            elif v < -1.1: t.put(x, y, LO)


def is_ground(c): return c in (BASE, LO, HI)


def leaf(t, cx, cy, ang, L, W, ramp, mask=None):
    """one leaf: a rotated pointed oval, L long and W wide; lit on the top-left edge, dark on the bottom-right edge,
    a stem pixel off its base. Returns its pixels (for shadows)."""
    ca, sa = math.cos(ang), math.sin(ang); px = []
    r = int(max(L, W)) + 2
    for y in range(-r, r + 1):
        for x in range(-r, r + 1):
            u = (x * ca + y * sa) / (L / 2); v = (-x * sa + y * ca) / (W / 2)
            w = 1 - abs(u) ** 1.6                         # pointed at both ends, widest in the middle
            if w <= 0 or abs(v) > w ** .7: continue
            # lighting: where on the rim this pixel sits, toward the light or away
            nx, ny = x / max(1, r), y / max(1, r)
            edge = abs(v) / max(.01, w ** .7)
            d = nx * LX + ny * LY
            if edge > .55 and d > .05: c = ramp[3]
            elif edge > .5 and d < -.05: c = ramp[1]
            else: c = ramp[2]
            px.append((cx + x, cy + y, c))
    sx, sy = int(round(cx - ca * (L / 2 + .6))), int(round(cy - sa * (L / 2 + .6)))
    px.append((sx, sy, ramp[1]))
    return px


def drift(t, cx, cy, rad, R, hues, shadows):
    """fallen leaves gathered where the wind dropped them: denser in the middle, overlapping, lower ones in front"""
    n = int(rad * rad * .2) + 3
    leaves = []
    for _ in range(n):
        a = R.uniform(0, 6.283); d = rad * R.random() ** .8
        x, y = cx + math.cos(a) * d, cy + math.sin(a) * d * .65
        L = R.choice((4, 5, 5, 6)); W = L * R.uniform(.5, .7)
        leaves.append((x, y, R.uniform(0, 3.14), L, W, R.choice(hues)))
    leaves.sort(key=lambda q: q[1])
    drawn = []
    for (x, y, a, L, W, ramp) in leaves:
        drawn.append(leaf(t, int(x), int(y), a, L, W, ramp))
    occ = set((int(p[0]) % N, int(p[1]) % N) for px in drawn for p in px)
    for px in drawn:
        for (x, y, c) in px:
            k = ((x + 1) % N, (y + 1) % N)
            if k not in occ: shadows.add(k)
    return drawn


def moss(t, cx, cy, w, h, R):
    """a moss cushion: a lumpy dome lit from the top-left, the darkest step on its bottom-right rim, a crescent of
    shadow beyond it; a few lit lumps on the crown"""
    ph = [R.uniform(0, 6.28) for _ in range(3)]
    px = []
    for y in range(-h - 2, h + 3):
        for x in range(-w - 2, w + 3):
            a = math.atan2(y, x)
            rr = 1 + .12 * math.sin(3 * a + ph[0]) + .08 * math.sin(5 * a + ph[1]) + .05 * math.sin(7 * a + ph[2])
            e = (x / w) ** 2 + (y / h) ** 2
            if e > rr * rr: continue
            nx, ny = x / w, y / h
            z = math.sqrt(max(0, 1 - min(1, e)))
            lit = (nx * LX + ny * LY) * .7 + z * .55
            c = MOSS[1] if (e > rr * rr * .72 and lit < .35) else MOSS[2] if lit < .45 else MOSS[3] if lit < .8 else MOSS[4]
            px.append((cx + x, cy + y, c))
    occ = set((p[0] % N, p[1] % N) for p in px)
    sh = set()
    for (x, y, c) in px:
        for dx, dy in ((1, 1), (2, 1), (1, 2)):
            k = ((x + dx) % N, (y + dy) % N)
            if k not in occ: sh.add(k)
    return px, sh


def twig(t, x0, y0, ang, L, R, thick=False):
    """a fallen twig: a gently bent 1 px stroke (2 px for a stick: lit top row, dark under), a short fork, its shadow"""
    bend = R.uniform(-.25, .25); px = []
    x, y = x0, y0; pts = []
    for i in range(int(L * 2)):
        a = ang + bend * math.sin(i / (L * 2) * 3.14)
        x += math.cos(a) * .5; y += math.sin(a) * .5
        pts.append((int(round(x)), int(round(y))))
    pts = list(dict.fromkeys(pts))
    for (px_, py_) in pts:
        if thick: px.append((px_, py_, TWIG[3])); px.append((px_, py_ + 1, TWIG[1]))
        else: px.append((px_, py_, TWIG[2]))
    if len(pts) > 6:   # a fork a third of the way along
        fx, fy = pts[len(pts) // 3]; fa = ang + R.choice((-1, 1)) * R.uniform(.6, .9)
        for i in range(1, R.randint(4, 6)):
            px.append((int(round(fx + math.cos(fa) * i)), int(round(fy + math.sin(fa) * i)), TWIG[2]))
    occ = set((p[0] % N, p[1] % N) for p in px)
    sh = set(((p[0] + 1) % N, (p[1] + 1) % N) for p in px) - occ
    return px, sh


def pebble(t, cx, cy, w, h):
    px = []
    for y in range(-h, h + 1):
        for x in range(-w, w + 1):
            e = (x / (w + .4)) ** 2 + (y / (h + .4)) ** 2
            if e > 1: continue
            lit = (x / (w + .4)) * LX + (y / (h + .4)) * LY
            c = STONE[1] if lit < -.45 else STONE[2] if lit < .15 else STONE[3] if lit < .55 else STONE[4]
            px.append((cx + x, cy + y, c))
    occ = set((p[0] % N, p[1] % N) for p in px)
    sh = set(((p[0] + dx) % N, (p[1] + dy) % N) for p in px for dx, dy in ((1, 1), (1, 0))) - occ
    return px, sh


def spots(R, k, cells=4, min_d=20, taken=()):
    """k points spread over the tile: one per jittered cell of a cells x cells grid, cells chosen at random"""
    cw = N / cells; order = [(i, j) for i in range(cells) for j in range(cells)]; R.shuffle(order); out = []
    for (i, j) in order:
        if len(out) >= k: break
        for _ in range(20):
            p = ((i + R.uniform(.15, .85)) * cw, (j + R.uniform(.15, .85)) * cw)
            if all(tdist(p, q) > min_d for q in list(out) + list(taken)): out.append(p); break
    return out


def forest(seed=11):
    R = random.Random(seed); t = Tile(BASE); zones(t, seed)
    layers = []   # (y, pixels, shadow set)
    taken = []
    # leaf drifts: many, of three weights, in rust, ochre and dead brown (the dead ones quiet)
    for (cx, cy) in spots(R, 13, 4, 26):
        rad = R.choice((5, 7, 9, 11, 13)); sh = set()
        hues = R.choice(([RUST, OCHRE, DEAD], [RUST, DEAD, DEAD], [OCHRE, DEAD, DEAD], [RUST, OCHRE]))
        drawn = drift(t, cx, cy, rad, R, hues, sh)
        layers.append((cy, [p for d in drawn for p in d], sh)); taken.append((cx, cy))
    # moss cushions, sometimes two together
    for (cx, cy) in spots(R, 8, 3, 30, taken):
        for k in range(R.choice((1, 1, 2))):
            w = R.randint(5, 8); h = int(w * .62)
            px, sh = moss(t, int(cx) + k * (w + 2), int(cy) + k * R.randint(1, 4), w, h, R)
            layers.append((cy + h, px, sh))
        taken.append((cx, cy))
    # twigs and sticks
    for (cx, cy) in spots(R, 9, 3, 22, taken):
        px, sh = twig(t, cx, cy, R.uniform(-.6, .6) + R.choice((0, 3.14)), R.randint(8, 15), R, thick=R.random() < .35)
        layers.append((cy, px, sh)); taken.append((cx, cy))
    # pebbles in twos and threes
    for (cx, cy) in spots(R, 6, 3, 24, taken):
        for k in range(R.choice((2, 2, 3))):
            w = R.choice((2, 2, 3)); h = w - 1 if w > 2 else 1
            px, sh = pebble(t, int(cx) + k * 5 + R.randint(-1, 1), int(cy) + R.randint(-2, 2), w, h)
            layers.append((cy + h, px, sh))
        taken.append((cx, cy))
    # low fern clumps (dark, they tie the floor to the grass)
    fern = []
    for (cx, cy) in spots(R, 8, 4, 18, taken):
        fern.append((cx, cy, R.randint(6, 10)))
    # shadows first, then everything, top to bottom
    for (_, px, sh) in layers:
        for (x, y) in sh:
            if is_ground(t.get(x, y)): t.put(x, y, SH)
    for (_, px, sh) in sorted(layers, key=lambda q: q[0]):
        for (x, y, c) in px: t.put(int(x), int(y), c)
    for (x, y, w) in sorted(fern, key=lambda q: q[1]):
        mound(t, x - w / 2, y, w, FERN, R)
    return t


# ---------------------------------------------------------------- v2: masses first, detail on the borders
SOIL = HEX('#23231a'); SOIL_LO, SOIL_HI = HEX('#202017'), HEX('#27271c')
MAT = [HEX(c) for c in ('#2b2219', '#33281c', '#3b2e1f', '#453522')]        # the litter mat: shadow, body, lit, lit leaf
MOSSM = [HEX(c) for c in ('#1c2416', '#25331b', '#2f4120', '#3b5026', '#4a602c')]
BORDER = {   # leaves along a mat's edge: dark, body, lit
    'rust': [HEX(c) for c in ('#46281a', '#663a22', '#86502a')],
    'ochre': [HEX(c) for c in ('#463a1e', '#665426', '#866e32')],
    'dead': [HEX(c) for c in ('#3a2e1e', '#524028', '#6a5634')],
}
# leaf shapes, hand-drawn: '#' leaf, 's' stem. Lighting comes from the shape (lit where the up-left neighbour is
# outside the leaf, dark where the down-right one is), so flips and turns keep the light top-left.
SHAPES = [
    ["...##", ".####", "####.", "##..."],
    [".###..", "#####s", ".###.."],
    [".#.#.", "#####", ".###.", "..s.."],
    [".##", "###", "##."],
    ["....#", "..###", ".###.", "##...", "s...."],
    ["..#..", ".###.", "#####", ".###.", "..s.."],
]


def shape_px(mask, R):
    pts = [(x, y, ch) for y, row in enumerate(mask) for x, ch in enumerate(row) if ch != '.']
    k = R.randrange(4); fx = R.random() < .5
    out = []
    for (x, y, ch) in pts:
        if fx: x = -x
        for _ in range(k): x, y = -y, x
        out.append((x, y, ch))
    return out


def stamp_leaf(t, cx, cy, mask, ramp, R, shadows=None, only_on=None):
    pts = shape_px(mask, R); body = set((x, y) for x, y, ch in pts if ch == '#')
    for (x, y, ch) in pts:
        X, Y = int(cx) + x, int(cy) + y
        if only_on and not only_on(t.get(X, Y)): continue
        if ch == 's': c = ramp[0]
        elif (x - 1, y) not in body or (x, y - 1) not in body: c = ramp[2]
        elif (x + 1, y) not in body or (x, y + 1) not in body: c = ramp[0]
        else: c = ramp[1]
        t.put(X, Y, c)
    if shadows is not None:
        for (x, y, ch) in pts:
            if (x + 1, y + 1) not in body: shadows.add(((int(cx) + x + 1) % N, (int(cy) + y + 1) % N))


def field(cx, cy, parts, ph):
    """a blown, wandering mass: the union of a few overlapping ellipses with sine-wobbled rims"""
    def inside(x, y):
        for (ox, oy, rx, ry, rot) in parts:
            dx = x - (cx + ox); dy = y - (cy + oy)
            dx = (dx + N / 2) % N - N / 2; dy = (dy + N / 2) % N - N / 2
            u = (dx * math.cos(rot) + dy * math.sin(rot)) / rx; v = (-dx * math.sin(rot) + dy * math.cos(rot)) / ry
            a = math.atan2(v, u)
            rr = 1 + .13 * math.sin(3 * a + ph) + .08 * math.sin(5 * a + ph * 1.7) + .05 * math.sin(9 * a + ph * .6)
            if u * u + v * v < rr * rr: return True
        return False
    return inside


def blown(R, cx, cy, size, wind):
    n = R.randint(2, 4); parts = []
    for k in range(n):
        along = R.uniform(-size * .7, size * .7)
        parts.append((math.cos(wind) * along + R.uniform(-size * .25, size * .25), math.sin(wind) * along * .6 + R.uniform(-size * .2, size * .2),
                      size * R.uniform(.55, .9), size * R.uniform(.3, .45), wind + R.uniform(-.3, .3)))
    return field(cx, cy, parts, R.uniform(0, 6.28))


def forest2(seed=12):
    R = random.Random(seed); t = Tile(SOIL)
    ph = [seed * .7 + k * 1.9 for k in range(4)]
    for y in range(N):     # the soil: three tones in broad wrapping zones
        for x in range(N):
            a = 2 * math.pi * x / N; b = 2 * math.pi * y / N
            v = (math.sin(2 * a + b + ph[0]) + .8 * math.sin(-a + 3 * b + ph[1]) + .5 * math.sin(3 * a - 2 * b + ph[2]))
            if v > .95: t.put(x, y, SOIL_HI)
            elif v < -1.05: t.put(x, y, SOIL_LO)
    wind = -.35
    # the masses: litter mats of very different sizes (some touching), moss mats between
    mats = [(30, 40, 30), (128, 28, 18), (96, 120, 34), (172, 150, 22), (40, 160, 14), (160, 80, 12)]
    mats = [(x + R.uniform(-6, 6), y + R.uniform(-6, 6), s) for x, y, s in mats]
    mossm = [(150, 112, 11), (70, 84, 9), (12, 112, 13), (112, 178, 8)]
    mossm = [(x + R.uniform(-5, 5), y + R.uniform(-5, 5), s) for x, y, s in mossm]
    litter = [blown(R, x, y, s, wind + R.uniform(-.25, .25)) for x, y, s in mats]
    mosses = [blown(R, x, y, s, R.uniform(0, 3.14)) for x, y, s in mossm]
    LIT_IN = lambda x, y: any(f(x, y) for f in litter)
    MOSS_IN = lambda x, y: any(f(x, y) for f in mosses)
    grid = [[0] * N for _ in range(N)]
    for y in range(N):
        for x in range(N):
            if MOSS_IN(x, y): grid[y][x] = 2
            elif LIT_IN(x, y): grid[y][x] = 1
    g = lambda x, y: grid[y % N][x % N]
    for y in range(N):
        for x in range(N):
            k = g(x, y)
            if k == 1:   # litter: lit rim toward the light, a shade rim away from it, quiet body
                c = MAT[2] if (g(x - 1, y - 1) != 1 or g(x, y - 1) != 1) else MAT[0] if (g(x + 1, y + 1) != 1 or g(x + 1, y + 2) != 1) else MAT[1]
                t.put(x, y, c)
            elif k == 2:
                c = MOSSM[3] if (g(x - 1, y - 1) != 2 or g(x, y - 1) != 2) else MOSSM[0] if (g(x + 1, y + 1) != 2 or g(x, y + 2) != 2) else MOSSM[1]
                t.put(x, y, c)
            elif g(x - 1, y - 1) in (1, 2) or g(x - 2, y - 1) in (1, 2):   # the mats' shadow on the soil, down-right
                t.put(x, y, SH)
    # inside the litter: overlapping leaves one step either side of the body (texture in tone, no contrast)
    quiet = [MAT[0], MAT[1], MAT[3]]
    for _ in range(420):
        x, y = R.uniform(0, N), R.uniform(0, N)
        if g(int(x), int(y)) == 1 and g(int(x) - 3, int(y) - 3) == 1 and g(int(x) + 3, int(y) + 3) == 1:
            stamp_leaf(t, x, y, R.choice(SHAPES), quiet, R, only_on=lambda c: c in MAT)
    # inside the moss: small lit lumps
    for _ in range(260):
        x, y = int(R.uniform(0, N)), int(R.uniform(0, N))
        if g(x, y) == 2 and g(x - 3, y - 3) == 2 and g(x + 3, y + 3) == 2:
            for (dx, dy) in ((0, 0), (1, 0), (-1, 1), (0, 1), (1, 1), (2, 1)): t.put(x + dx, y + dy, MOSSM[2])
            t.put(x, y, MOSSM[3]); t.put(x - 1, y + 1, MOSSM[3]); t.put(x + 1, y + 2, MOSSM[0]); t.put(x + 2, y + 2, MOSSM[0])
    # the borders: full leaves where litter meets soil, half on, half off, at irregular steps
    edge = [(x, y) for y in range(N) for x in range(N) if g(x, y) == 1 and any(g(x + dx, y + dy) == 0 for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
    R.shuffle(edge); placed = []; sh = set(); leaves = []
    for (x, y) in edge:
        if all(tdist((x, y), q) > R.uniform(5, 11) for q in placed):
            placed.append((x, y))
            hue = R.choices(['dead', 'rust', 'ochre'], [5, 3, 2])[0]
            leaves.append((y, x, R.choice(SHAPES), BORDER[hue]))
    # a few lit leaves resting on top of the bigger mats
    for _ in range(40):
        x, y = int(R.uniform(0, N)), int(R.uniform(0, N))
        if g(x, y) == 1 and g(x - 6, y - 4) == 1 and g(x + 6, y + 4) == 1 and all(tdist((x, y), q) > 9 for q in placed):
            placed.append((x, y)); leaves.append((y, x, R.choice(SHAPES), BORDER[R.choice(['rust', 'ochre', 'dead'])]))
    for (y, x, m, ramp) in sorted(leaves):
        stamp_leaf(t, x, y, m, ramp, R, shadows=sh)
    for (x, y) in sh:
        if t.get(x, y) in (SOIL, SOIL_LO, SOIL_HI): t.put(x, y, SH)
        elif t.get(x, y) == MAT[1] or t.get(x, y) == MAT[2]: t.put(x, y, MAT[0])
    # twigs lying across the borders, pebbles at the mats' edges, ferns where moss meets soil
    objs = []
    for _ in range(7):
        x, y = R.choice(edge); px, s2 = twig(t, x - 5, y, R.uniform(-.5, .5) + R.choice((0, 3.14)), R.randint(8, 14), R, thick=R.random() < .4)
        objs.append((y, px, s2))
    for _ in range(4):
        x, y = R.choice(edge)
        for k in range(R.choice((2, 3))):
            w = R.choice((2, 3)); px, s2 = pebble(t, x + k * 5, y + R.randint(1, 3), w, max(1, w - 1)); objs.append((y, px, s2))
    for (_, px, s2) in objs:
        for (x, y) in s2:
            c = t.get(x, y)
            if c in (SOIL, SOIL_LO, SOIL_HI): t.put(x, y, SH)
            elif c in MAT[1:]: t.put(x, y, MAT[0])
    for (_, px, s2) in sorted(objs, key=lambda q: q[0]):
        for (x, y, c) in px: t.put(int(x), int(y), c)
    medge = [(x, y) for y in range(N) for x in range(N) if g(x, y) == 2 and g(x, y + 1) == 0]
    for _ in range(6):
        x, y = R.choice(medge); w = R.randint(6, 9); mound(t, x - w / 2, y + 1, w, FERN, R)
    return t


# ---------------------------------------------------------------- v3: a carpet of fallen leaves
SOIL3 = HEX('#251f17'); SH3 = HEX('#1c1812')
CARPET = {   # dark, body, lit: low contrast between families so the carpet reads as one material
    'brown': [HEX(c) for c in ('#2e2519', '#3f3121', '#504028')],
    'rust': [HEX(c) for c in ('#33231a', '#4a2e1f', '#5d3b25')],
    'olive': [HEX(c) for c in ('#2b2a1a', '#3c3a23', '#4c492b')],
}
ACCENT = {
    'rust': [HEX(c) for c in ('#4c2818', '#6e3920', '#8c4f28')],
    'ochre': [HEX(c) for c in ('#4a3c1c', '#6a5726', '#8a7232')],
}
SHAPES3 = [
    ["....##", "..####", ".####.", "####..", ".##...", "s....."],
    ["..###..", ".######s", "..###.."],
    [".#..#.", ".####.", "######", ".####.", "..s..."],
    [".###.", "#####", "#####", ".##.s"],
    ["....##", "..###.", ".###..", "##...."],
    ["..##..", ".####.", "######", ".####.", "..##..", "...s.."],
]


def leaf3(t, cx, cy, mask, ramp, R, under_dark):
    """stamp one leaf; its bottom-right edge throws a 1 px shadow on whatever is under it (a darker step of that)"""
    pts = shape_px(mask, R); body = set((x, y) for x, y, ch in pts if ch == '#')
    for (x, y, ch) in pts:   # shadow first, only where the leaf itself won't cover
        if ch == '#' and (x + 1, y + 1) not in body:
            X, Y = int(cx) + x + 1, int(cy) + y + 1
            t.put(X, Y, under_dark(t.get(X, Y)))
    for (x, y, ch) in pts:
        X, Y = int(cx) + x, int(cy) + y
        if ch == 's': c = ramp[0]
        elif (x - 1, y) not in body or (x, y - 1) not in body: c = ramp[2]
        elif (x + 1, y) not in body or (x, y + 1) not in body: c = ramp[0]
        else: c = ramp[1]
        t.put(X, Y, c)


def wfield(seed, terms):
    ph = [seed * .7 + k * 1.9 for k in range(len(terms))]
    def f(x, y):
        a = 2 * math.pi * x / N; b = 2 * math.pi * y / N
        return sum(w * math.sin(i * a + j * b + ph[k]) for k, (i, j, w) in enumerate(terms)) / sum(w for _, _, w in terms)
    return f


SPACE = (6.0, 3.4)        # leaf spacing: 6 px where thin, 2.6 px where thick
MOSS3 = [HEX(c) for c in ('#1f2416', '#2a3320', '#333f24', '#3e4a2a', '#4c5a30')]


def forest3(seed=13):
    R = random.Random(seed); t = Tile(SOIL3)
    MOSSM = MOSS3
    dens = wfield(seed, [(2, 1, 1), (-1, 3, .8), (3, -2, .5), (1, 4, .35)])           # where the leaves lie thick
    mossf = wfield(seed + 5, [(1, 2, 1), (3, 1, .7), (-2, 3, .5), (4, -1, .3)])       # where moss grows instead
    darker = {}
    for fam in list(CARPET.values()) + list(ACCENT.values()):
        darker[fam[1]] = fam[0]; darker[fam[2]] = fam[1]; darker[fam[0]] = SH3
    for m in MOSSM[1:]: darker[m] = MOSSM[0]
    under_dark = lambda c: darker.get(c, SH3 if c in (SOIL3,) else c)
    # moss first (leaves fall on it too, thinly)
    for y in range(N):
        for x in range(N):
            if mossf(x, y) > .42: t.put(x, y, MOSSM[1])
    for y in range(N):
        for x in range(N):
            if t.get(x, y) != MOSSM[1]: continue
            up = t.get(x, y - 1) == MOSSM[1] and t.get(x - 1, y) == MOSSM[1]
            dn = t.get(x, y + 1) == MOSSM[1] and t.get(x + 1, y) == MOSSM[1]
            if not up: t.put(x, y, MOSSM[3])
            elif not dn: t.put(x, y, MOSSM[0])
    for _ in range(500):   # moss lumps: small lit domes, a dark foot
        x, y = int(R.uniform(0, N)), int(R.uniform(0, N))
        if mossf(x, y) > .5:
            for (dx, dy) in ((0, 0), (1, 0), (-1, 1), (0, 1), (1, 1), (2, 1)): t.put(x + dx, y + dy, MOSSM[2])
            t.put(x, y, MOSSM[3]); t.put(x - 1, y + 1, MOSSM[3]); t.put(x, y + 2, MOSSM[0]); t.put(x + 1, y + 2, MOSSM[0])
    # the carpet: Poisson-disc leaves, spacing from 3.5 px (thick) to 9 px (thin, soil between), none on thick moss
    pts = []; tries = 0
    while tries < 40000:
        tries += 1
        x, y = R.uniform(0, N), R.uniform(0, N)
        d = .5 + .5 * dens(x, y); m = mossf(x, y)
        if m > .5 and R.random() < .85: continue
        r = SPACE[0] - SPACE[1] * d
        if all(tdist((x, y), (px_, py_)) > min(r, pr) for (px_, py_, pr) in pts): pts.append((x, y, r))
    fams = ['brown', 'brown', 'rust', 'olive']
    pts.sort(key=lambda q: q[1])
    for (x, y, r) in pts:
        f = CARPET[R.choice(fams)]
        leaf3(t, x, y, R.choice(SHAPES3), f, R, under_dark)
    # a few brighter leaves on top, in loose twos and threes (never alone)
    for _ in range(9):
        cx, cy = R.uniform(0, N), R.uniform(0, N)
        for k in range(R.choice((2, 3))):
            leaf3(t, cx + R.uniform(-6, 6), cy + R.uniform(-4, 4), R.choice(SHAPES3), ACCENT[R.choice(['rust', 'ochre'])], R, under_dark)
    # twigs over the top
    for _ in range(8):
        px, s2 = twig(t, R.uniform(0, N), R.uniform(0, N), R.uniform(-.6, .6) + R.choice((0, 3.14)), R.randint(9, 15), R, thick=R.random() < .4)
        for (x, y) in s2: t.put(x, y, under_dark(t.get(x, y)))
        for (x, y, c) in px: t.put(int(x), int(y), c)
    return t


# ---------------------------------------------------------------- v4: calm floor, a quiet in-tone layer, drifts
B4 = HEX('#29291c'); B4LO, B4HI = HEX('#26261a'), HEX('#2d2d1f')
MK4 = HEX('#222217'); MK4L = HEX('#323223')
SH4 = HEX('#1d1d14')
PILE = {
    'dead': [HEX(c) for c in ('#2e2518', '#45371f', '#5a4829', '#6e5a34')],
    'rust': [HEX(c) for c in ('#3a2318', '#57301d', '#704024', '#8a542c')],
    'ochre': [HEX(c) for c in ('#3a3018', '#564620', '#6e5c2a', '#867236')],
}


def stamp4(t, cx, cy, mask, ramp, R, shadow_of=None):
    """a leaf from a hand-drawn mask: lit where its up-left neighbour is outside, dark where its down-right one is;
    an optional 1 px shadow below-right on the ground"""
    pts = shape_px(mask, R); body = set((x, y) for x, y, ch in pts if ch == '#')
    if shadow_of:
        for (x, y, ch) in pts:
            if ch == '#' and (x + 1, y + 1) not in body:
                X, Y = int(cx) + x + 1, int(cy) + y + 1; c = shadow_of(t.get(X, Y))
                if c: t.put(X, Y, c)
    for (x, y, ch) in pts:
        X, Y = int(cx) + x, int(cy) + y
        if ch == 's': c = ramp[0]
        elif (x - 1, y) not in body or (x, y - 1) not in body: c = ramp[2]
        elif (x + 1, y) not in body or (x, y + 1) not in body: c = ramp[0]
        else: c = ramp[1]
        t.put(X, Y, c)


def forest4(seed=14):
    R = random.Random(seed); t = Tile(B4)
    zf = wfield(seed, [(2, 1, 1), (-1, 3, .8), (3, -2, .5)])
    for y in range(N):
        for x in range(N):
            v = zf(x, y)
            if v > .45: t.put(x, y, B4HI)
            elif v < -.5: t.put(x, y, B4LO)
    ground = (B4, B4LO, B4HI)
    gshadow = lambda c: SH4 if c in ground or c in (MK4, MK4L) else None
    # drift zones: where the litter gathered (five, spread so none marks the repeat)
    zc = [(36, 30), (132, 52), (72, 112), (170, 150), (20, 172)]
    zc = [(x + R.uniform(-8, 8), y + R.uniform(-8, 8)) for x, y in zc]
    near = lambda x, y: min(tdist((x, y), z) for z in zc)
    # the quiet layer: lying leaves one step off the ground, thicker toward the drifts, never on top of each other
    pts = []; tries = 0
    while tries < 12000 and len(pts) < 260:
        tries += 1
        x, y = R.uniform(0, N), R.uniform(0, N); d = near(x, y)
        if R.random() < (d - 20) / 70: continue
        if all(tdist((x, y), q) > 7 for q in pts): pts.append((x, y))
    for (x, y) in pts:
        stamp4(t, x, y, R.choice(SHAPES3), [MK4, MK4, MK4L] if R.random() < .4 else [MK4, MK4, MK4], R)
    items = []   # (y, kind, x, extra)
    for i, (cx, cy) in enumerate(zc):
        hue = ['dead', 'dead', 'rust', 'ochre', 'dead'][i]
        for k in range(R.randint(2, 4)):   # leaf piles
            a = R.uniform(0, 6.28); d = R.uniform(0, 16)
            items.append((cy + math.sin(a) * d * .6, 'pile', cx + math.cos(a) * d, (R.randint(5, 9), hue)))
        for k in range(R.randint(1, 2)):
            items.append((cy + R.uniform(-10, 10), 'twig', cx + R.uniform(-20, 20), (R.randint(9, 15), R.random() < .4)))
        for k in range(R.randint(0, 2)):
            items.append((cy + R.uniform(-8, 12), 'fern', cx + R.uniform(-22, 22), R.randint(6, 10)))
        if R.random() < .7:
            items.append((cy + R.uniform(-12, 12), 'moss', cx + R.uniform(-24, 24), R.randint(4, 7)))
        if R.random() < .5:
            items.append((cy + R.uniform(-6, 10), 'pebbles', cx + R.uniform(-18, 18), None))
    for _ in range(6):   # strays in the calm ground: small, never a landmark
        x, y = R.uniform(0, N), R.uniform(0, N)
        items.append((y, R.choice(['twig', 'pile', 'moss']), x, None))
    for (y, kind, x, ex) in sorted(items, key=lambda q: q[0]):
        if kind == 'pile':
            rad, hue = ex if ex else (4, 'dead')
            n = int(rad * rad * .35) + 3; lv = []
            for _ in range(n):
                a = R.uniform(0, 6.28); d = rad * R.random() ** .9
                lv.append((y + math.sin(a) * d * .6, x + math.cos(a) * d))
            for (ly, lx) in sorted(lv):
                h = hue if R.random() < .8 else R.choice(['dead', 'rust', 'ochre'])
                ramp = PILE[h]; ramp = [ramp[0], ramp[1], ramp[2]] if R.random() < .7 else [ramp[1], ramp[2], ramp[3]]
                stamp4(t, lx, ly, R.choice(SHAPES3), ramp, R, shadow_of=gshadow)
        elif kind == 'twig':
            L, thick = ex if ex else (R.randint(7, 11), False)
            px, s2 = twig(t, x, y, R.uniform(-.6, .6) + R.choice((0, 3.14)), L, R, thick=thick)
            for (a, b) in s2:
                c = gshadow(t.get(a, b))
                if c: t.put(a, b, c)
            for (a, b, c) in px: t.put(int(a), int(b), c)
        elif kind == 'fern':
            mound(t, x - ex / 2, y, ex, MOSS3, R)
        elif kind == 'moss':
            w = ex if ex else 4
            for k in range(R.choice((1, 2, 2))):
                px, s2 = moss(t, int(x) + k * (w + 1), int(y) + k * 2, w, max(2, int(w * .6)), R)
                px = [(a, b, {MOSS[1]: MOSS3[1], MOSS[2]: MOSS3[2], MOSS[3]: MOSS3[3], MOSS[4]: MOSS3[4]}.get(c, c)) for a, b, c in px]
                for (a, b) in s2:
                    c = gshadow(t.get(a, b))
                    if c: t.put(a, b, c)
                for (a, b, c) in px: t.put(a, b, c)
        elif kind == 'pebbles':
            for k in range(R.choice((2, 3))):
                w = R.choice((2, 3)); px, s2 = pebble(t, int(x) + k * 5, int(y) + R.randint(-1, 1), w, max(1, w - 1))
                for (a, b) in s2:
                    c = gshadow(t.get(a, b))
                    if c: t.put(a, b, c)
                for (a, b, c) in px: t.put(a, b, c)
    return t



def pile5(t, x, y, rad, R, gshadow):
    """a leaf pile as one mass (the bundle method): a lumpy low mound in a dead-leaf body tone, a lit rim to the
    top-left and a dark one bottom-right, a quiet inside with three or four inner edge strokes, separate leaves only on
    its rim (mostly dead brown, a few rust or ochre), a shadow on the ground"""
    ramp = PILE['dead']
    parts = [(R.uniform(-rad * .55, rad * .55), R.uniform(-rad * .22, rad * .22), rad * R.uniform(.6, .85), rad * R.uniform(.38, .5)) for _ in range(R.randint(3, 4))]
    M = set()
    for (ox, oy, rx, ry) in parts:
        for yy in range(int(-ry) - 1, int(ry) + 2):
            for xx in range(int(-rx) - 1, int(rx) + 2):
                if ((xx - ox) / rx) ** 2 + ((yy - oy) / ry) ** 2 <= 1: M.add((xx, yy))
    if not M: return
    for (a, b) in M:   # the mound's shadow, down-right
        for (dx, dy) in ((1, 1), (2, 1), (1, 2)):
            if (a + dx, b + dy) not in M:
                c = gshadow(t.get(int(x) + a + dx, int(y) + b + dy))
                if c: t.put(int(x) + a + dx, int(y) + b + dy, c)
    for (a, b) in M:
        if (a - 1, b) not in M or (a, b - 1) not in M or (a - 1, b - 1) not in M: c = ramp[2]
        elif (a + 1, b) not in M or (a, b + 1) not in M or (a, b + 2) not in M: c = ramp[0]
        else: c = ramp[1]
        t.put(int(x) + a, int(y) + b, c)
    inner = [p for p in M if all((p[0] + dx, p[1] + dy) in M for dx in (-2, 0, 2) for dy in (-2, 0, 2))]
    R.shuffle(inner)
    for (a, b) in inner[:R.randint(2, 4)]:   # an overlapping leaf's edge: a short dark curve
        for k, (dx, dy) in enumerate(((0, 0), (1, 0), (2, -1))[:R.randint(2, 3)]):
            t.put(int(x) + a + dx, int(y) + b + dy, ramp[0])
        t.put(int(x) + a, int(y) + b - 1, ramp[2])
    rim = [p for p in M if any((p[0] + dx, p[1] + dy) not in M for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
    R.shuffle(rim); placed = []
    for (a, b) in rim:
        if len(placed) >= int(rad * .8): break
        if all(abs(a - p[0]) + abs(b - p[1]) > 6 for p in placed):
            placed.append((a, b))
    for (a, b) in sorted(placed, key=lambda p: p[1]):
        h = R.choices(['dead', 'rust', 'ochre'], [6, 3, 2])[0]
        lr = PILE[h]; lr = [lr[0], lr[1], lr[2]] if R.random() < .6 else [lr[1], lr[2], lr[3]]
        stamp4(t, int(x) + a, int(y) + b, R.choice(SHAPES3[:4]), lr, R, shadow_of=gshadow)


def moss5(t, x, y, w, R, gshadow):
    """a moss cushion as 3-5 small domes stacked back to front, dark gaps where they meet, a dark foot, a shadow"""
    domes = sorted([(R.uniform(-w / 2, w / 2), R.uniform(-w * .2, w * .2), R.uniform(2, 3.4)) for _ in range(R.randint(3, 5))], key=lambda d: d[1])
    M = {}
    for (ox, oy, r) in domes:
        for yy in range(int(-r) - 1, int(r) + 2):
            for xx in range(int(-r) - 1, int(r) + 2):
                u, v = (xx - ox) / r, (yy - oy) / (r * .8)
                if u * u + v * v <= 1:
                    lit = -u * .6 - v * .8
                    c = MOSS3[4] if lit > .75 else MOSS3[3] if lit > .2 else MOSS3[2] if lit > -.5 else MOSS3[1]
                    if u * u + v * v > .7 and lit < -.2: c = MOSS3[0]
                    M[(xx, yy)] = c
    for (a, b) in M:
        for (dx, dy) in ((1, 1), (1, 2), (2, 1)):
            if (a + dx, b + dy) not in M:
                c = gshadow(t.get(int(x) + a + dx, int(y) + b + dy))
                if c: t.put(int(x) + a + dx, int(y) + b + dy, c)
    for (a, b), c in M.items(): t.put(int(x) + a, int(y) + b, c)


def forest5(seed=15):
    """v5 (self-check on v4: piles are busy splats, the rust and ochre piles each appear once, moss reads as pills):
    piles drawn as masses with leaves on the rim only and mixed hues in every pile, moss as stacked domes"""
    global pile_fn
    R = random.Random(seed); t = Tile(B4)
    zf = wfield(seed, [(2, 1, 1), (-1, 3, .8), (3, -2, .5)])
    for y in range(N):
        for x in range(N):
            v = zf(x, y)
            if v > .45: t.put(x, y, B4HI)
            elif v < -.5: t.put(x, y, B4LO)
    ground = (B4, B4LO, B4HI)
    gshadow = lambda c: SH4 if c in ground or c in (MK4, MK4L) else None
    zc = [(36, 30), (132, 52), (72, 112), (170, 150), (20, 172)]
    zc = [(x + R.uniform(-8, 8), y + R.uniform(-8, 8)) for x, y in zc]
    near = lambda x, y: min(tdist((x, y), z) for z in zc)
    pts = []; tries = 0
    while tries < 12000 and len(pts) < 260:
        tries += 1
        x, y = R.uniform(0, N), R.uniform(0, N); d = near(x, y)
        if R.random() < (d - 20) / 70: continue
        if all(tdist((x, y), q) > 7 for q in pts): pts.append((x, y))
    for (x, y) in pts:
        stamp4(t, x, y, R.choice(SHAPES3), [MK4, MK4, MK4L] if R.random() < .4 else [MK4, MK4, MK4], R)
    items = []
    for i, (cx, cy) in enumerate(zc):
        for k in range(R.randint(1, 2)):
            a = R.uniform(0, 6.28); d = R.uniform(0, 10)
            items.append((cy + math.sin(a) * d * .6, 'pile', cx + math.cos(a) * d, R.randint(10, 15)))
        def away(r0, r1):
            a = R.uniform(0, 6.28); d = R.uniform(r0, r1); return cx + math.cos(a) * d, cy + math.sin(a) * d * .7
        for k in range(R.randint(1, 2)):
            x, y = away(16, 30); items.append((y, 'twig', x, (R.randint(9, 15), R.random() < .4)))
        for k in range(R.randint(1, 2)):
            x, y = away(18, 32); items.append((y, 'fern', x, R.randint(6, 10)))
        if R.random() < .8:
            x, y = away(18, 34); items.append((y, 'moss', x, R.randint(6, 9)))
        if R.random() < .5:
            x, y = away(14, 26); items.append((y, 'pebbles', x, None))
    for _ in range(7):
        x, y = R.uniform(0, N), R.uniform(0, N)
        k = R.choice(['twig', 'pile', 'moss'])
        items.append((y, k, x, (R.randint(6, 10), False) if k == 'twig' else R.randint(4, 5)))
    for (y, kind, x, ex) in sorted(items, key=lambda q: q[0]):
        if kind == 'pile': pile5(t, x, y, ex, R, gshadow)
        elif kind == 'moss': moss5(t, x, y, ex, R, gshadow)
        elif kind == 'fern': mound(t, x - ex / 2, y, ex, MOSS3, R)
        elif kind == 'twig':
            L, thick = ex
            px, s2 = twig(t, x, y, R.uniform(-.6, .6) + R.choice((0, 3.14)), L, R, thick=thick)
            for (a, b) in s2:
                c = gshadow(t.get(a, b))
                if c: t.put(a, b, c)
            for (a, b, c) in px: t.put(int(a), int(b), c)
        elif kind == 'pebbles':
            for k in range(R.choice((2, 3))):
                w = R.choice((2, 3)); px, s2 = pebble(t, int(x) + k * 5, int(y) + R.randint(-1, 1), w, max(1, w - 1))
                for (a, b) in s2:
                    c = gshadow(t.get(a, b))
                    if c: t.put(a, b, c)
                for (a, b, c) in px: t.put(a, b, c)
    return t



# ---------------------------------------------------------------- v6: v1's parts gathered into drifts (judge on v1, 5/10)
# Judge: "the parts are made well but every item is the same size and evenly spaced: wallpaper with stickers. Gather the
# litter into 3-4 drifts of different sizes, piles overlapping, big ones with small ones round them, bare soil between;
# every heavy feature with a sibling of the same weight; moss and tufts darker and toward olive; C's quiet leaf flecks
# in the bare soil; C's duller browns."
B6 = HEX('#2a281c'); B6LO, B6HI = HEX('#262519'), HEX('#2e2c1f')
FL6, FL6L = HEX('#232217'), HEX('#323022')
SH6 = HEX('#1e1d14')
MOSS6 = [HEX(c) for c in ('#1f2416', '#28301b', '#323b21', '#3d4627', '#4a522e')]   # olive, two steps down from v1
TUFT6 = [HEX(c) for c in ('#1f2416', '#28301b', '#333c22', '#404a29', '#4e5631')]
DEAD6 = [HEX(c) for c in ('#2c2418', '#41331f', '#554428', '#685430', '#7a6438')]
RUST6 = [HEX(c) for c in ('#36231a', '#50301e', '#6a4024', '#82522c', '#966434')]
OCHRE6 = [HEX(c) for c in ('#363018', '#4e4520', '#665a2a', '#7c6e34', '#8e7e3e')]


def moss6(t, cx, cy, w, h, R, gshadow):
    ph = [R.uniform(0, 6.28) for _ in range(3)]; px = []
    for y in range(-h - 2, h + 3):
        for x in range(-w - 2, w + 3):
            a = math.atan2(y, x)
            rr = 1 + .14 * math.sin(3 * a + ph[0]) + .09 * math.sin(5 * a + ph[1]) + .05 * math.sin(7 * a + ph[2])
            e = (x / w) ** 2 + (y / h) ** 2
            if e > rr * rr: continue
            z = math.sqrt(max(0, 1 - min(1, e))); lit = (x / w * LX + y / h * LY) * .7 + z * .55
            c = MOSS6[1] if (e > rr * rr * .72 and lit < .35) else MOSS6[2] if lit < .45 else MOSS6[3] if lit < .8 else MOSS6[4]
            px.append((cx + x, cy + y, c))
    occ = set((a % N, b % N) for a, b, _ in px)
    for (a, b, _) in px:
        for dx, dy in ((1, 1), (2, 1), (1, 2)):
            k = ((a + dx) % N, (b + dy) % N)
            if k not in occ:
                c = gshadow(t.get(*k))
                if c: t.put(k[0], k[1], c)
    for (a, b, c) in px: t.put(a, b, c)


def forest6(seed=16):
    R = random.Random(seed); t = Tile(B6)
    zf = wfield(seed, [(2, 1, 1), (-1, 3, .8), (3, -2, .5)])
    for y in range(N):
        for x in range(N):
            v = zf(x, y)
            if v > .5: t.put(x, y, B6HI)
            elif v < -.55: t.put(x, y, B6LO)
    ground = (B6, B6LO, B6HI, FL6, FL6L)
    gshadow = lambda c: SH6 if c in ground else None
    wind = -.3
    # four drifts of clearly different sizes, spread so the tile's repeat isn't marked by any one
    drifts = [(48, 52, 34), (150, 120, 26), (40, 160, 17), (140, 22, 12)]
    drifts = [(x + R.uniform(-5, 5), y + R.uniform(-5, 5), r) for x, y, r in drifts]
    near = lambda x, y: min(tdist((x, y), (dx, dy)) / dr for dx, dy, dr in drifts)
    # the bare soil's quiet layer: lying leaves one step off the ground, thinning away from the drifts
    pts = []; tries = 0
    while tries < 14000 and len(pts) < 230:
        tries += 1
        x, y = R.uniform(0, N), R.uniform(0, N); d = near(x, y)
        if d < .9 or R.random() < (d - 1.2) / 3.5: continue
        if all(tdist((x, y), q) > R.uniform(6, 10) for q in pts): pts.append((x, y))
    for (x, y) in pts:
        stamp4(t, x, y, R.choice(SHAPES3), [FL6, FL6, FL6L] if R.random() < .35 else [FL6, FL6, FL6], R)
    items = []
    for i, (cx, cy, rr) in enumerate(drifts):
        ca, sa = math.cos(wind), math.sin(wind)
        def at(f0, f1):
            a = R.uniform(0, 6.28); d = rr * R.uniform(f0, f1)
            return cx + math.cos(a) * d * 1.25, cy + math.sin(a) * d * .7
        # piles: one big in the middle, smaller round it, overlapping, stretched along the wind
        npile = {34: 12, 26: 8, 17: 5, 12: 3}[rr]
        items.append((cy, 'pile', cx, max(6, int(rr * .42))))
        for k in range(npile - 1):
            x, y = at(.12, .8); items.append((y, 'pile', x, R.randint(5, 9) if k % 3 else R.randint(8, 11)))
        # what collects at a drift's edge
        for k in range(1 if rr < 20 else 2):
            x, y = at(.85, 1.15); items.append((y, 'moss', x, R.choice((5, 6, 7))))
        for k in range(R.randint(1, 3)):
            x, y = at(.8, 1.2); items.append((y, 'tuft', x, R.randint(6, 9)))
        if rr >= 17:
            x, y = at(.7, 1.1); items.append((y, 'pebbles', x, None))
        for k in range(1 if rr < 20 else 2):
            x, y = at(.4, 1.0); items.append((y, 'twig', x, (R.randint(9, 14), R.random() < .4)))
    # a few strays in the bare soil, each kind more than once
    for k in ('twig', 'twig', 'tuft', 'tuft', 'moss', 'moss'):
        for _ in range(50):
            x, y = R.uniform(0, N), R.uniform(0, N)
            if near(x, y) > 1.6: break
        items.append((y, k, x, (R.randint(7, 10), False) if k == 'twig' else (4 if k == 'moss' else R.randint(5, 6))))
    for (y, kind, x, ex) in sorted(items, key=lambda q: q[0]):
        if kind == 'pile':
            sh = set(); hues = R.choice(([DEAD6, DEAD6, RUST6], [DEAD6, DEAD6, OCHRE6], [DEAD6, RUST6, OCHRE6], [DEAD6, DEAD6, DEAD6, RUST6]))
            drawn = drift(t, x, y, ex, R, hues, sh)
            for (a, b) in sh:
                c = gshadow(t.get(a, b))
                if c: t.put(a, b, c)
            for d in drawn:
                for (a, b, c) in d: t.put(int(a), int(b), c)
        elif kind == 'moss': moss6(t, int(x), int(y), ex, max(2, int(ex * .62)), R, gshadow)
        elif kind == 'tuft': mound(t, x - ex / 2, y, ex, TUFT6, R)
        elif kind == 'twig':
            L, thick = ex
            px, s2 = twig(t, x, y, R.uniform(-.6, .6) + R.choice((0, 3.14)), L, R, thick=thick)
            for (a, b) in s2:
                c = gshadow(t.get(a, b))
                if c: t.put(a, b, c)
            for (a, b, c) in px: t.put(int(a), int(b), c)
        elif kind == 'pebbles':
            for k in range(R.choice((2, 3))):
                w = R.choice((2, 3)); px, s2 = pebble(t, int(x) + k * 5, int(y) + R.randint(-1, 1), w, max(1, w - 1))
                for (a, b) in s2:
                    c = gshadow(t.get(a, b))
                    if c: t.put(a, b, c)
                for (a, b, c) in px: t.put(a, b, c)
    return t


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/forest.png'
    seed = int(sys.argv[2]) if len(sys.argv) > 2 else 16
    {'1': forest, '2': forest2, '3': forest3, '4': forest4, '5': forest5, '6': forest6}[os.environ.get('V', '6')](seed).save(out); print('wrote', out)
