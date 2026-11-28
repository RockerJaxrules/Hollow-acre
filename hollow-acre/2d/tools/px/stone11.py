"""Cobbles v11 (#189, fair retry against the INSTALLED Nov 9 PNG). Installed: Voronoi cobbles shaded with a radial
gradient each, darker blots where cells crowd (they read as holes and mark the repeat). v11 keeps the installed greys
and follows the ground lessons:
  - stones from a relaxed Poisson set (even sizes, no crowding, so no black holes at the joints), wrapping at 192 px;
  - each stone ONE flat tone of three (hashed, never two neighbours the same if avoidable), a lit rim on its top-left
    edge, a one-step shade on its bottom-right edge: a lit form, not a gradient;
  - mortar a 1 px dark joint; here and there a joint with grit or a moss thread so the street looks walked on.
    python3 stone11.py OUT.png"""
import sys, math, random
from PIL import Image

N = 192
def hx(s): return tuple(int(s[i:i + 2], 16) for i in (1, 3, 5))
MORT, MORT2 = hx('#2f2d36'), hx('#26252c')
TONES = [hx('#56545e'), hx('#625f69'), hx('#6e6b75')]   # two steps under v11a: the square was the lightest thing on screen
SHADE = {TONES[0]: hx('#47434f'), TONES[1]: hx('#4f4b57'), TONES[2]: hx('#5a5662')}        # shades lean purple
SHADE2 = {TONES[0]: hx('#3b3843'), TONES[1]: hx('#433f4b'), TONES[2]: hx('#4b4753')}
LIT = {TONES[0]: hx('#6c6869'), TONES[1]: hx('#79746f'), TONES[2]: hx('#868079')}     # lights lean warm
CAP = {TONES[0]: hx('#7d776f'), TONES[1]: hx('#8b847a'), TONES[2]: hx('#999084')}
GRIT, MOSS = hx('#4b4953'), hx('#3d4627')
R = random.Random(11)

def wd(a, b):
    dx = abs(a[0] - b[0]); dy = abs(a[1] - b[1]); return min(dx, N - dx), min(dy, N - dy)

# a relaxed point set: Poisson darts, then two Lloyd steps (on a coarse grid) so cells are even
pts = []; rad = []   # mixed sizes (judge: 'all one size reads as a net'): big setts first, then smaller ones in the gaps
for want in (19, 15, 12, 9):
    for _ in range(9000):
        p = (R.uniform(0, N), R.uniform(0, N))
        if all(math.hypot(*wd(p, q)) > (want + rq) / 2 for q, rq in zip(pts, rad)): pts.append(p); rad.append(want)
def owner_map(pts):
    own = [[0] * N for _ in range(N)]
    for y in range(N):
        for x in range(N):
            best, bi, sec = 1e9, 0, 1e9
            for i, q in enumerate(pts):
                dx, dy = wd((x + .5, (y + .5)), q); d = dx * dx + (dy * 1.15) ** 2   # a touch wider than tall: 3/4 view
                if d < best: sec = best; best, bi = d, i
                elif d < sec: sec = d
            own[y][x] = bi
    return own
for it in range(1):
    own = owner_map(pts); acc = [[0, 0, 0, 0, 0] for _ in pts]
    for y in range(N):
        for x in range(N):
            i = own[y][x]; q = pts[i]
            dx = ((x + .5 - q[0] + N / 2) % N) - N / 2; dy = ((y + .5 - q[1] + N / 2) % N) - N / 2
            acc[i][0] += dx; acc[i][1] += dy; acc[i][2] += 1
    pts = [((q[0] + a[0] / max(1, a[2])) % N, (q[1] + a[1] / max(1, a[2])) % N) for q, a in zip(pts, acc)]
own = owner_map(pts)

# tones: greedy so neighbours differ where possible
nb = {i: set() for i in range(len(pts))}
for y in range(N):
    for x in range(N):
        a = own[y][x]
        for dx, dy in ((1, 0), (0, 1)):
            b = own[(y + dy) % N][(x + dx) % N]
            if a != b: nb[a].add(b); nb[b].add(a)
tone = {}
for i in sorted(range(len(pts)), key=lambda k: -len(nb[k])):
    used = {tone.get(j) for j in nb[i]}
    free = [t for t in range(3) if t not in used]
    tone[i] = R.choice(free) if free else R.randrange(3)

im = Image.new('RGB', (N, N)); P = im.load()
for y in range(N):
    for x in range(N):
        i = own[y][x]; t = TONES[tone[i]]
        r_ = own[y][(x + 1) % N] != i; d_ = own[(y + 1) % N][x] != i
        l_ = own[y][(x - 1) % N] != i; u_ = own[(y - 1) % N][x] != i
        q = pts[i]; dx = ((x + .5 - q[0] + N / 2) % N) - N / 2; dy = ((y + .5 - q[1] + N / 2) % N) - N / 2
        lt = -.6 * dx - .8 * dy                             # toward the light
        r2 = own[y][(x + 2) % N] != i; d2 = own[(y + 2) % N][x] != i
        if r_ or d_: c = MORT2 if d_ else MORT              # the joint, darkest under each stone
        elif d2 or (r2 and lt < 0): c = MORT                # 2 px joints below and right: the stones stand proud
        elif own[(y + 1) % N][(x + 1) % N] != i or own[(y + 3) % N][x] != i: c = SHADE2[t]  # the shaded crescent, bottom-right
        elif own[(y + 4) % N][x] != i and lt < 0: c = SHADE[t]
        elif l_ or u_ or own[(y - 2) % N][x] != i: c = LIT[t]   # each stone's own lit top-left edge, 1-2 px, following its outline
        else: c = CAP[t] if (lt > 4 and (dx * dx + dy * dy) < 30 and i % 4 == 0) else t   # the brightest step on one stone in four only   # a flat lit cap on the top-left of the dome
        P[x, y] = c
# grit and moss threads in some joints (a few, each with siblings)
for k in range(26):
    x, y = R.randrange(N), R.randrange(N)
    run = []
    for s in range(R.randint(5, 9)):
        if P[x % N, y % N] in (MORT, MORT2): run.append((x % N, y % N))
        x += R.choice((-1, 0, 1)); y += R.choice((0, 1))
    if len(run) >= 3:
        for q in run: P[q] = MOSS if k % 3 == 0 else GRIT
im.save(sys.argv[1] if len(sys.argv) > 1 else 'out/NEW_stone.png'); print('stones', len(pts))
