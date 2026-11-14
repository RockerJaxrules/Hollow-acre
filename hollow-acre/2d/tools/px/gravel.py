"""Quarry floor (gravel): the quarry was drawn with the town square's paving cobbles. Loose crushed rock instead:
a dusty grey-buff base with faint half-step zones (wrapping value noise), a quiet layer of small angular chips (2-4 px,
lit top-left, one shadow pixel bottom-right) by Poisson disc with a varying spacing, and a few fist-sized stones in
twos and threes; nothing that appears once per tile.
    python3 gravel.py OUT.png"""
import sys, math, random
from PIL import Image

N = 192
def hx(s): return tuple(int(s[i:i + 2], 16) for i in (1, 3, 5))
BASE, ZLO, ZHI = hx('#7a7468'), hx('#736d62'), hx('#817a6d')
CH = [hx('#6a645a'), hx('#8c8577'), hx('#9a9283')]          # chip shade, body, lit
SHD, SHD2 = hx('#5f5a51'), hx('#544f47')
ST = [hx('#5a5752'), hx('#76726a'), hx('#8f8a80'), hx('#a49e92')]
R = random.Random(23)

def vn(x, y, sc, sd):
    n = N // sc
    h = lambda a, b: random.Random((a % n) * 7919 + (b % n) * 104729 + sd * 31).random()
    xi, yi = x // sc, y // sc; fx, fy = (x % sc) / sc, (y % sc) / sc; u, v = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    a, b, c, d = h(xi, yi), h(xi + 1, yi), h(xi, yi + 1), h(xi + 1, yi + 1)
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v

px = [[BASE] * N for _ in range(N)]
for y in range(N):
    for x in range(N):
        v = vn(x, y, 32, 3) * .6 + vn(x, y, 16, 4) * .3 + vn(x, y, 4, 5) * .1
        px[y][x] = ZHI if v > .62 else ZLO if v < .36 else BASE
def put(x, y, c): px[y % N][x % N] = c
def tdist(a, b):
    dx = abs(a[0] - b[0]); dy = abs(a[1] - b[1]); return math.hypot(min(dx, N - dx), min(dy, N - dy))
def poisson(sp, n, tries=20000, cell=8):
    """dart throwing with a wrapping grid, so each test only looks at nearby points"""
    pts = []; nc = N // cell; grid = {}
    for _ in range(tries):
        if len(pts) >= n: break
        p = (R.uniform(0, N), R.uniform(0, N)); d = sp(p); r = int(math.ceil(d / cell)); gx, gy = int(p[0] // cell), int(p[1] // cell)
        if all(tdist(p, q) > d for i in range(-r, r + 1) for j in range(-r, r + 1) for q in grid.get(((gx + i) % nc, (gy + j) % nc), ())):
            pts.append(p); grid.setdefault((gx % nc, gy % nc), []).append(p)
    return pts
CHIPS = [["##", "#."], [".#", "##"], ["###", ".#."], ["#.", "##", ".#"], ["##", "##"], [".##", "##."]]
for (x, y) in poisson(lambda p: 4.2 + 2.5 * vn(int(p[0]), int(p[1]), 64, 9), 900):
    x, y = int(x), int(y); m = R.choice(CHIPS); cells = [(i, j) for j, r in enumerate(m) for i, ch in enumerate(r) if ch == '#']; S = set(cells)
    for (i, j) in cells:
        if (i + 1, j + 1) not in S and (i, j + 1) not in S: put(x + i + 1, y + j + 1, SHD)
    for k, (i, j) in enumerate(cells):
        put(x + i, y + j, CH[2] if (k == 0 and R.random() < .6) else CH[1] if R.random() < .7 else CH[0])
for (x, y) in poisson(lambda p: 34, 12):
    for k in range(R.choice((2, 2, 3))):
        w = R.choice((2, 3, 3, 4)); h = max(1, w - 1); cx, cy = int(x) + k * (w + 3), int(y) + R.randint(-2, 2)
        for yy in range(-h, h + 2):
            for xx in range(-w, w + 2):
                if ((xx - .5) / (w + .4)) ** 2 + ((yy - .5) / (h + .4)) ** 2 <= 1 and not ((xx / (w + .4)) ** 2 + (yy / (h + .4)) ** 2 <= 1): put(cx + xx, cy + yy, SHD2)
        for yy in range(-h, h + 1):
            for xx in range(-w, w + 1):
                if (xx / (w + .4)) ** 2 + (yy / (h + .4)) ** 2 > 1: continue
                l = -(xx / (w + .4)) * .6 - (yy / (h + .4)) * .8
                put(cx + xx, cy + yy, ST[3] if l > .5 else ST[2] if l > -.05 else ST[1])
im = Image.new('RGB', (N, N)); im.putdata([c for row in px for c in row])
im.save(sys.argv[1] if len(sys.argv) > 1 else 'out/tex_gravel.png'); print('gravel')
