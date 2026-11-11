"""Forest floor v8 (#189). Judge on v6/v7 (5/10): "the repeat shows — litter in rows, drifts one of a kind". Any
distinct drift baked into a 192 px tile repeats every six tiles, so v8 splits the floor in two:
  - the tile: v6's loam (three half-step zones) and its quiet layer of lying leaves one step off the soil — many
    small siblings, nothing that can mark the repeat;
  - the litter: v6's own piles, moss cushions, tufts, twigs and pebbles drawn as transparent cells of one atlas
    (spr/lpc/obj/litter.png, 80x56 cells), which the engine strews over the woods by world position as it builds each
    ground chunk, gathered by a slow noise into drifts of every size with bare soil between.
    python3 forest8.py OUT_DIR   -> OUT_DIR/tex_forest.png, OUT_DIR/litter.png"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
from ground import Tile, N, HEX, mound
import forest_floor as F

KEY = HEX('#ff00ff')
SOIL, SOIL_LO, SOIL_HI = HEX('#382f20'), HEX('#342c1e'), HEX('#3d3424')   # zones half a step: many and small, none marks the repeat   # a step up from v6 and warmer; zones a full half-step
FLR, FLR_L = HEX('#30281b'), HEX('#463b28')                                # the quiet lying leaves: one step under the soil, lit rim
STN = [HEX(c) for c in ('#1f1c16', '#3a3832', '#4f4c45', '#625e55')]       # stones two steps darker than v6 (they outshone the leaves)
TW = [HEX(c) for c in ('#1c1610', '#3a2e20', '#56452f')]
CW, CHH = 80, 56


def tile8(seed=16):
    R = random.Random(seed); t = Tile(SOIL)
    def vn(x, y, sc, sd):   # value noise that wraps every N px: irregular zones (summed sines made a lattice of discs)
        n = N // sc
        h = lambda a, b: random.Random((a % n) * 7919 + (b % n) * 104729 + sd * 31).random()
        xi, yi = x // sc, y // sc; fx, fy = (x % sc) / sc, (y % sc) / sc; u, v = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
        a, b, c, d = h(xi, yi), h(xi + 1, yi), h(xi, yi + 1), h(xi + 1, yi + 1)
        return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
    for y in range(N):
        for x in range(N):
            v = vn(x, y, 32, seed) * .6 + vn(x, y, 16, seed + 1) * .3 + vn(x, y, 4, seed + 2) * .1
            if v > .62: t.put(x, y, SOIL_HI)
            elif v < .36: t.put(x, y, SOIL_LO)
    pts = []; tries = 0
    while tries < 20000 and len(pts) < 300:
        tries += 1; x, y = R.uniform(0, N), R.uniform(0, N)
        if all(F.tdist((x, y), q) > R.uniform(6.5, 10) for q in pts): pts.append((x, y))
    for (x, y) in pts:
        F.stamp4(t, x, y, R.choice(F.SHAPES3), [FLR, FLR, FLR_L] if R.random() < .4 else [FLR, FLR, FLR], R)
    return t


def cell(draw, seed):
    t = Tile(KEY); R = random.Random(seed)
    gshadow = lambda c: F.SH6 if c == KEY else None
    draw(t, R, gshadow)
    im = Image.new('RGBA', (N, N))
    im.putdata([(0, 0, 0, 0) if c == KEY else c + (255,) for row in t.px for c in row])
    bb = im.getbbox(); im = im.crop(bb)
    if im.width > CW or im.height > CHH: im.thumbnail((CW, CHH))   # never needed: the parts are sized to fit
    out = Image.new('RGBA', (CW, CHH)); out.alpha_composite(im, ((CW - im.width) // 2, (CHH - im.height) // 2)); return out


HUES = ([F.DEAD6, F.DEAD6, F.RUST6], [F.DEAD6, F.DEAD6, F.OCHRE6], [F.DEAD6, F.RUST6, F.OCHRE6], [F.DEAD6, F.DEAD6, F.DEAD6, F.RUST6],
        [F.RUST6, F.OCHRE6], [F.DEAD6, F.OCHRE6, F.OCHRE6])


def put_drift(t, x, y, rr, R, gs):
    sh = set(); drawn = F.drift(t, x, y, rr, R, R.choice(HUES), sh)
    for (a, b) in sh:
        c = gs(t.get(a, b))
        if c: t.put(a, b, c)
    for dd in drawn:
        for (a, b, c) in dd: t.put(int(a), int(b), c)


def loose(n):
    """single fallen leaves, the thin edge of a drift"""
    def d(t, R, gs):
        for k in range(n):
            x, y = 96 + R.uniform(-16, 16), 96 + R.uniform(-9, 9)
            L = R.choice((4, 5, 5, 6)); ramp = R.choice(R.choice(HUES))
            px = F.leaf(t, int(x), int(y), R.uniform(0, 3.14), L, L * R.uniform(.5, .7), ramp)
            occ = set((a % N, b % N) for a, b, _ in px)
            for (a, b, c) in px:
                k2 = ((a + 1) % N, (b + 1) % N)
                if k2 not in occ:
                    c2 = gs(t.get(*k2))
                    if c2: t.put(k2[0], k2[1], c2)
            for (a, b, c) in px: t.put(a, b, c)
    return d


def piles(big, n, ang):
    """a pile, satellites round it strung out along ang (each cell its own outline), loose leaves at the rim"""
    def d(t, R, gs):
        ca, sa = math.cos(ang), math.sin(ang)
        items = [(96, 96, big)]
        for k in range(n):
            u = R.uniform(-1, 1) * big * 2.0; v = R.uniform(-1, 1) * big * .55
            items.append((96 + u * ca - v * sa, 96 + u * sa * .7 + v * ca * .7, R.randint(3, max(4, big - 2))))
        for (x, y, rr) in sorted(items, key=lambda q: q[1]): put_drift(t, x, y, rr, R, gs)
        loose(R.randint(1, 3))(t, R, gs)
    return d


def moss(n):
    """moss as a few small lumpy cushions run together, not one pill"""
    def d(t, R, gs):
        for k in range(n):
            w = R.choice((3, 4, 4, 5)); F.moss6(t, 96 + R.randint(-8, 8), 96 + R.randint(-4, 4), w, max(2, int(w * .7)), R, gs)
        if R.random() < .5: loose(1)(t, R, gs)
    return d


def tufts(n):
    def d(t, R, gs):
        for k in range(n): mound(t, 84 + k * R.randint(8, 11), 96 + R.randint(-4, 4), R.randint(6, 9), F.TUFT6, R)
    return d


def stick(L, ang, fork):
    """a fallen stick: 2 px, lit top row, dark under, nearly straight; one short stub if fork"""
    def d(t, R, gs):
        x, y = 96 - math.cos(ang) * L / 2, 96 - math.sin(ang) * L / 2; pts = []
        for i in range(L * 2):
            x += math.cos(ang) * .5; y += math.sin(ang) * .5 + (R.random() < .03) * R.choice((-.5, .5)); pts.append((int(round(x)), int(round(y))))
        pts = list(dict.fromkeys(pts))
        if fork:
            fx, fy = pts[len(pts) // 3]; fa = ang - .7
            for i in range(1, 4): pts.append((int(round(fx + math.cos(fa) * i)), int(round(fy + math.sin(fa) * i))))
        ps = set(pts)
        for (a, b) in pts:
            for k2 in ((a + 1, b + 2), (a, b + 2)):
                if k2 not in ps and (k2[0], k2[1] - 1) not in ps:
                    c = gs(t.get(*k2))
                    if c: t.put(k2[0], k2[1], c)
        for (a, b) in pts: t.put(a, b + 1, TW[0])
        for (a, b) in pts: t.put(a, b, TW[2] if (a, b - 1) not in ps else TW[1])
        loose(R.randint(0, 2))(t, R, gs)
    return d


def stones(sizes):
    """stones in a group of mixed sizes, two steps darker than v6's"""
    def d(t, R, gs):
        x = 90
        for w in sizes:
            h = max(1, w - 1); cx, cy = x, 96 + R.randint(-2, 2)
            for y in range(-h, h + 1):
                for xx in range(-w, w + 1):
                    e = (xx / (w + .4)) ** 2 + (y / (h + .4)) ** 2
                    if e > 1: continue
                    l = -(xx / (w + .4)) * .6 - (y / (h + .4)) * .8
                    t.put(cx + xx, cy + y, STN[3] if l > .45 else STN[2] if l > -.1 else STN[1])
            for xx in range(-w + 1, w + 2): t.put(cx + xx, cy + h + 1, STN[0])
            x += w * 2 + R.randint(2, 4)
        if R.random() < .6: loose(1)(t, R, gs)
    return d


# the atlas layout the engine reads (engine.js, forest litter): ranges by kind
CELLS = ([loose(1), loose(1), loose(2), loose(2), loose(3), loose(4)] +                                     # 0-5 loose leaves
         [piles(11, 5, .3), piles(10, 4, -.5), piles(12, 6, 1.1), piles(10, 3, 2.4)] +                     # 6-9 big piles
         [piles(8, 3, .9), piles(7, 2, -.2), piles(8, 2, 2.0), piles(7, 3, -1.1)] +                        # 10-13 medium
         [piles(5, 1, .4), piles(6, 1, -.8), piles(5, 0, 0), piles(4, 2, 1.6)] +                           # 14-17 small
         [moss(2), moss(3), moss(4)] + [tufts(2), tufts(3)] +                                                # 18-20 moss, 21-22 tufts
         [stick(14, .15, False), stick(11, -.35, True), stick(18, 2.9, False)] +                           # 23-25 sticks
         [stones((3, 2)), stones((2, 1, 1)), stones((4, 2, 1))])                                            # 26-28 stones


if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    tile8().save(os.path.join(out, 'tex_forest.png'))
    atlas = Image.new('RGBA', (CW * len(CELLS), CHH))
    for i, fn in enumerate(CELLS): atlas.alpha_composite(cell(fn, 100 + i), (i * CW, 0))
    atlas.save(os.path.join(out, 'litter.png')); print('tile + atlas of', len(CELLS), 'cells')
