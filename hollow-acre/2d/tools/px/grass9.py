"""Grass v9 (#189): built from the ground-tile lessons after eight drafts stalled at 5.
  - base: muted autumn olive, very faint wrapping low-frequency zones (one step apart, never stains)
  - a quiet blade layer one step off the base, Poisson disc with a spacing that varies over the tile
  - filled clump domes (dark root row, spiky top lit upper-left, short shadow right) gathered into drifts,
    so every clump size has siblings and nothing appears once per tile
  - autumn as dry ochre blades inside some clumps, not as loose specks
Tiles every 192 px.   python3 grass9.py -> out/tex_grass.png"""
import math, os, random
from PIL import Image

N = 192
def hx(s): return tuple(int(s[i:i + 2], 16) for i in (1, 3, 5))
# olive greens, hue-shifted: shadows toward teal-blue, lights toward yellow
G = [hx(c) for c in ('#243a2a', '#2f4a2f', '#3b5a33', '#466838', '#51743c', '#5e8142', '#719049', '#88a452')]
D = [hx(c) for c in ('#6f6a3a', '#8d7f45', '#ab9654', '#c4ad68')]   # dry straw
BASE = 3

random.seed(9)
def wrap(v): return v % N

def vn(x, y, s, seed):
    """value noise that wraps every N px"""
    n = N // s
    def h(a, b):
        r = random.Random((a % n) * 7919 + (b % n) * 104729 + seed * 31)
        return r.random()
    xi, yi = x // s, y // s; fx, fy = (x % s) / s, (y % s) / s
    u, v = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    a, b, c, d = h(xi, yi), h(xi + 1, yi), h(xi, yi + 1), h(xi + 1, yi + 1)
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v

# --- base: one tone. Zones are only a HALF step either way (their own in-between tones), smaller and many,
#     with ragged edges, so no single zone is big enough to mark the 192 px repeat.
ZONE = {-1: hx('#405e35'), 0: G[BASE], 1: hx('#4b6b3a')}
px = [[BASE] * N for _ in range(N)]
Z = [[0] * N for _ in range(N)]
for y in range(N):
    for x in range(N):
        n = vn(x, y, 48, 1) * .55 + vn(x, y, 24, 2) * .45 + (vn(x, y, 6, 3) - .5) * .3
        Z[y][x] = -1 if n < .32 else 1 if n > .70 else 0
touched = set()

def put(x, y, k):
    px[wrap(y)][wrap(x)] = max(0, min(len(G) - 1, k)); touched.add((wrap(x), wrap(y)))

dry = {}   # pixels drawn in straw: (x,y) -> D index

def dput(x, y, k):
    dry[(wrap(x), wrap(y))] = k

def wdist(a, b):
    dx = abs(a[0] - b[0]); dy = abs(a[1] - b[1])
    dx = min(dx, N - dx); dy = min(dy, N - dy)
    return math.hypot(dx, dy)

def poisson(spacing, tries=60000, cell=4):
    """dart throwing with a wrapping grid so each test only looks at nearby points"""
    pts = []; nc = N // cell; grid = {}
    for _ in range(tries):
        p = (random.random() * N, random.random() * N)
        d = spacing(p); r = int(math.ceil(d / cell))
        gx, gy = int(p[0] // cell), int(p[1] // cell); ok = True
        for j in range(-r, r + 1):
            for i in range(-r, r + 1):
                for q in grid.get(((gx + i) % nc, (gy + j) % nc), ()):
                    if wdist(p, q) < d: ok = False; break
                if not ok: break
            if not ok: break
        if ok:
            pts.append(p); grid.setdefault((gx % nc, gy % nc), []).append(p)
    return pts

# --- quiet blade layer: 2-4 px blades one step off the base under them
blades = poisson(lambda p: 4.2 + 3.2 * vn(int(p[0]), int(p[1]), 64, 5), 40000)
def blade(x, y, h, lean, base, tipup):
    for k in range(h):
        xx = x + round(lean * k / max(1, h - 1))
        put(xx, y - k, base + 1 if k < h - 1 else base + (2 if tipup else 1))
for (bx, by) in blades:
    x, y = int(bx), int(by)
    base = px[wrap(y)][wrap(x)]
    h = 2 + int(random.random() * 3)
    if random.random() < .4:      # a small V: two blades from one root, splaying apart
        blade(x, y, h, -1, base, random.random() < .3); blade(x + 1, y, h - (random.random() < .5), 1, base, False)
    else:
        blade(x, y, h, random.choice((-1, -1, 0, 1, 1)), base, random.random() < .35)
    put(x + (2 if random.random() < .5 else 1), y, base - 1)   # its foot sits in a sliver of shade

# --- clumps: domes of blades, gathered in drifts of different sizes and shapes
def clump(cx, cy, w, h, drystraw):
    """a tuft: a fan of single blades from one root line, tallest in the middle, splaying outward,
    filled at the base so it reads as one dome; lit from the upper left; straw blades woven in"""
    w = max(4, w); half = (w - 1) / 2
    for c in range(int(half), w + 1):     # short soft shadow under the right side only
        put(cx + c + 1, cy + 1, 2)
    strawcols = set(random.sample(range(1, w - 1), 1 if random.random() < .7 else 2)) if drystraw else set()
    for c in range(w):
        off = (c - half) / max(1, half)                     # -1 .. 1 across the tuft
        hc = max(2, round(h * (1 - .55 * off * off)) + (1 if c % 2 == 0 else -1 if random.random() < .4 else 0))
        lean = off * (1.5 + random.random() * 1.5)          # outer blades lean out
        lit = off < .15
        for k in range(hc):
            x = cx + c + round(lean * k / max(1, hc - 1)); y = cy - k
            if c in strawcols and k >= 2:
                dput(x, y, 2 if k == hc - 1 else 1 if lit else 0)
                continue
            if k == 0: kk = 2                                 # root, a step into shade
            elif k == 1: kk = 4 if lit else 3
            elif k < hc - 1: kk = 5 if lit else 4             # the dome stands lighter than the ground
            else: kk = (7 if abs(off) < .4 else 6) if lit else 5   # tips catch the light on the upper left
            put(x, y, kk)
    for c in range(1, w - 1):                                # fill the base so the tuft reads as one mass
        put(cx + c, cy - 1, 3); put(cx + c, cy - 2, 4 if c > half else 5)

drifts = poisson(lambda p: 40, 4000)
for (dx_, dy_) in drifts:
    shape = random.choice(('round', 'diag', 'diag2', 'long'))
    k = 3 + int(random.random() * 4)
    for _ in range(k):
        if shape == 'round': ox, oy = random.gauss(0, 6), random.gauss(0, 5)
        elif shape == 'diag': t = random.uniform(-12, 12); ox, oy = t + random.gauss(0, 2), t * .7 + random.gauss(0, 2)
        elif shape == 'diag2': t = random.uniform(-12, 12); ox, oy = t + random.gauss(0, 2), -t * .7 + random.gauss(0, 2)
        else: ox, oy = random.uniform(-14, 14), random.gauss(0, 3)
        w = random.choice((5, 6, 7, 7, 8, 9)); h = random.choice((5, 6, 7, 7, 8, 9))
        clump(int(dx_ + ox), int(dy_ + oy), w, h, random.random() < .42)

im = Image.new('RGB', (N, N))
pix = im.load()
for y in range(N):
    for x in range(N):
        pix[x, y] = D[dry[(x, y)]] if (x, y) in dry else G[px[y][x]] if (x, y) in touched else ZONE[Z[y][x]]
os.makedirs('out', exist_ok=True)
im.save('out/tex_grass.png')
print('out/tex_grass.png', len(blades), 'blades', len(drifts), 'drifts')
