"""Dirt v10 (#189, fair retry against the INSTALLED Nov 9 clean pass, not a tiles.js render).
Installed: big light/dark lobes that mark the 192 px repeat (one bright S-shape per tile), blue-grey pebble specks and
'^' scratch marks sprinkled evenly. The Nov 11 redraw lost in game for being too light, orange and lobed. So v10 keeps the
installed palette exactly (no new hues) and follows the ground lessons:
  - zones a half step either way, many and small (a wrapping field 3-5 waves across the tile, ragged edges), so no zone
    is big or bright enough to mark the repeat;
  - trodden clods: flat 3-6 px clusters in two close tones, lit top-left pixel, one shadow pixel bottom-right, by Poisson
    disc with a varying spacing, so the bare earth reads as a material without speckle;
  - pebbles in twos and threes, two tones + a shadow, many siblings of each size; no scratch marks.
    python3 dirt10.py OUT.png"""
import sys, os, math, random
from PIL import Image

N = 192
def hx(s): return tuple(int(s[i:i + 2], 16) for i in (1, 3, 5))
BASE, DK, LT = hx('#7d5c3a'), hx('#715033'), hx('#8a6841')
ZDK, ZLT = hx('#775636'), hx('#83623d')   # zones: half a step either way (the lesson: very faint wrapping zones)
LIT, SHD, SHD2 = hx('#977549'), hx('#65452d'), hx('#593a27')
PEB = [hx('#4d2f22'), hx('#625f69'), hx('#7b7881'), hx('#96939b')]
R = random.Random(10)

def wf(x, y, terms, ph):
    a = 2 * math.pi * x / N; b = 2 * math.pi * y / N
    return sum(w * math.sin(i * a + j * b + ph[k]) for k, (i, j, w) in enumerate(terms)) / sum(t[2] for t in terms)

ph = [R.uniform(0, 6.28) for _ in range(8)]
T1 = [(2, 1, 1), (-1, 2, .9), (2, -3, .6), (3, 2, .4)]
T2 = [(9, 4, 1), (-7, 10, 1), (11, -8, .8), (16, 13, .6)]          # small wobble so zone edges are ragged
px = [[BASE] * N for _ in range(N)]
for y in range(N):
    for x in range(N):
        v = wf(x, y, T1, ph) + .22 * wf(x, y, T2, ph[4:])
        px[y][x] = ZLT if v > .3 else ZDK if v < -.3 else BASE

def put(x, y, c): px[y % N][x % N] = c
def get(x, y): return px[y % N][x % N]
def tdist(a, b):
    dx = abs(a[0] - b[0]); dy = abs(a[1] - b[1]); return math.hypot(min(dx, N - dx), min(dy, N - dy))

def poisson(sp, n, tries=40000):
    pts = []
    for _ in range(tries):
        if len(pts) >= n: break
        p = (R.uniform(0, N), R.uniform(0, N)); d = sp(p)
        if all(tdist(p, q) > d for q in pts): pts.append(p)
    return pts

# trodden clods: flat clusters, the tone a step off whatever they lie on
SH = [["##.", "###"], [".##", "###", ".#."], ["####", ".##."], ["##", "##"], ["###", "##."], [".#", "##", "#."]]
for (x, y) in poisson(lambda p: 7 + 5 * (.5 + .5 * math.sin(2 * math.pi * p[0] / N * 2 + 2 * math.pi * p[1] / N + 1)), 420):
    x, y = int(x), int(y); m = R.choice(SH); under = get(x, y)
    c = LT if R.random() < .55 else DK
    cells = [(i, j) for j, row in enumerate(m) for i, ch in enumerate(row) if ch == '#']
    S = set(cells)
    for (i, j) in cells:
        if (i + 1, j + 1) not in S and (i + 1, j) not in S: put(x + i + 1, y + j + 1, SHD if c == DK else ZDK)
    for (i, j) in cells: put(x + i, y + j, c)
    if c == LT and R.random() < .5: put(x + cells[0][0], y + cells[0][1], LIT)

# pebbles in twos and threes, sizes repeated across the tile
def pebble(cx, cy, w, h):
    for y in range(-h, h + 1):
        for x in range(-w, w + 1):
            e = (x / (w + .4)) ** 2 + (y / (h + .4)) ** 2
            if e > 1: continue
            l = -(x / (w + .4)) * .6 - (y / (h + .4)) * .8
            put(cx + x, cy + y, PEB[2] if l > .25 else PEB[1])
    for x in range(-w + 1, w + 2): put(cx + x, cy + h + 1, SHD2)
    put(cx + w + 1, cy + h, SHD2)
for (x, y) in (poisson(lambda p: 30, 14) if os.environ.get('PEBBLES') else []):   # pebbles now strewn by world position (dirt_grit atlas)
    for k in range(R.choice((1, 2, 2, 3))):
        w = R.choice((1, 1, 2)); pebble(int(x) + k * 4 + R.randint(-1, 1), int(y) + R.randint(-2, 2), w, max(1, w - 1) if w > 1 else 0)

im = Image.new('RGB', (N, N)); im.putdata([c for row in px for c in row])

def grit_atlas(path):
    """stone clusters for the engine to strew over dirt by world position: 2-4 stones of mixed sizes, one larger,
    lit top-left, a contact shadow down-right; 8 cells of 24x16"""
    CW, CH = 24, 16; cells = [(3, 2, 1), (2, 1, 1), (3, 1), (2, 2, 1, 1), (4, 2), (2, 1), (3, 2, 2, 1), (1, 1, 1)]
    at = Image.new('RGBA', (CW * len(cells), CH)); P = at.load()
    for ci, sizes in enumerate(cells):
        rr = random.Random(50 + ci); x = ci * CW + 4; occ = {}
        for k, w in enumerate(sizes):
            h = max(1, w - 1); cx, cy = x + w, 8 + rr.randint(-2, 2) - (1 if k == 0 else 0)
            for yy in range(-h, h + 1):
                for xx in range(-w, w + 1):
                    if (xx / (w + .4)) ** 2 + (yy / (h + .4)) ** 2 > 1: continue
                    l = -(xx / (w + .4)) * .6 - (yy / (h + .4)) * .8
                    occ[(cx + xx, cy + yy)] = PEB[3] if (l > .5 and w > 1) else PEB[2] if l > 0 else PEB[1]
            x += w * 2 + rr.randint(1, 3)
        for (a, b) in list(occ):
            for d in ((1, 1), (1, 0), (0, 1)):
                q = (a + d[0], b + d[1])
                if q not in occ and 0 <= q[1] < CH: P[q[0], q[1]] = SHD2 + (255,)
        for (a, b), c in occ.items(): P[a, b] = c + (255,)
    at.save(path)
out = sys.argv[1] if len(sys.argv) > 1 else 'out/NEW_dirt.png'; im.save(out); print('wrote', out)
if len(sys.argv) > 2: grit_atlas(sys.argv[2]); print('wrote', sys.argv[2])
