# world art fixes: the north-south picket fence (a row of pickets going away from you, not a ladder),
# the cows (shaded barrel bodies, proper heads, udders, tails) and the fallen leaves (real leaf shapes in small drifts)
import math, random
from PIL import Image
OUT = (29, 21, 32, 255)
def hexc(h, a=255): h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)
def H(x, y, s=0):
    n = math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453
    return n - math.floor(n)
def vnoise(x, y, s):
    x0, y0 = math.floor(x), math.floor(y); fx, fy = x - x0, y - y0; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy)
    a, b, c, d = H(x0, y0, s), H(x0 + 1, y0, s), H(x0, y0 + 1, s), H(x0 + 1, y0 + 1, s)
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy
class Pic:
    def __init__(s, w, h): s.im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); s.w, s.h = w, h; s.px = s.im.load(); s.shadow = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    def p(s, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < s.w and 0 <= y < s.h and c: s.px[x, y] = hexc(c) if isinstance(c, str) else c
    def get(s, x, y): return s.px[x, y] if 0 <= x < s.w and 0 <= y < s.h else (0, 0, 0, 0)
    def ell_shadow(s, cx, cy, rx, ry, a):
        sp = s.shadow.load()
        for y in range(s.h):
            for x in range(s.w):
                d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
                if d <= 1: sp[x, y] = (12, 16, 8, int(a * (1 - d * .5)))
    def outline(s, col=OUT):
        add = []
        for y in range(s.h):
            for x in range(s.w):
                if s.px[x, y][3]: continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    if s.get(x + dx, y + dy)[3] > 60: add.append((x, y)); break
        for x, y in add: s.px[x, y] = col
    def save(s, path):
        base = s.shadow.copy(); base.alpha_composite(s.im); base.save(path)

# ---- picket fence running north-south: each picket seen edge-on, the nearer ones overlapping the farther, pointed tops in a row
def picket_v():
    P = Pic(14, 68); P.ell_shadow(7, 65, 6, 2, 70)
    # two rails running away from you, seen between the pickets
    for y in range(6, 64):
        P.p(4, y, '#b8b8b0'); P.p(9, y, '#8e8e86')
    # separate pickets, each with a pointed top, a lit left edge and a dark foot, the ground showing between them
    for i in range(9):
        y0 = 3 + i * 7
        for y in range(y0, y0 + 5):
            t = y - y0
            for x in range(5, 9):
                if t == 0 and x not in (6, 7): continue
                c = '#fbfbf6' if x == 5 else '#e8e8e0' if x == 6 else '#d0d0c8' if x == 7 else '#a6a69e'
                if t == 4: c = '#7e7e76'
                P.p(x, y, c)
        P.p(6, y0 + 1, '#ffffff')
        P.shadow.load()[6, min(67, y0 + 5)] = (12, 16, 8, 110); P.shadow.load()[7, min(67, y0 + 5)] = (12, 16, 8, 110)
    for y in range(60, 66):
        for x in range(5, 9): P.p(x, y, '#8a6a4a' if x < 7 else '#6a4a2a')
    P.outline(); P.save('out/picket_v.png')

# ---- cows: holstein and jersey
def cow(name, base, back, belly, spots, face, seed):
    P = Pic(54, 34); random.seed(seed); P.ell_shadow(28, 31, 21, 2.6, 80)
    def leg(x, near, y0=21):
        for y in range(y0, 30):
            for dx in range(3):
                c = (belly if near else back) if y < 27 else ('#3a2e28' if y >= 28 else ('#e8e0d4' if base == '#f2eee6' and near else belly))
                if dx == 2: c = back if y < 28 else '#2a201c'
                P.p(x + dx, y, c)
    leg(15, False); leg(38, False)
    # the barrel of the body: lit from the upper left
    cx, cy, rx, ry = 29, 15.5, 15.5, 8.2
    for y in range(6, 26):
        for x in range(12, 47):
            d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
            if d > 1: continue
            v = (y - (cy - ry)) / (2 * ry)
            c = base if v < .55 else belly if v > .82 else base
            if v < .2: c = back if base != '#f2eee6' else '#fbf9f4'
            if spots:
                n = vnoise(x / 6.5, y / 4.2, seed) * .75 + vnoise(x / 2.5, y / 2.0, seed + 5) * .25
                if n > .58 and v < .86: c = spots if n > .62 else '#4a4444'
            if v > .7 and not spots: c = belly
            if d > .82 and v > .5: c = tuple(int(q * .8) for q in hexc(c)[:3]) + (255,)
            P.p(x, y, c)
    for x in range(16, 44): P.p(x, 7 + int(abs(x - 30) / 9), '#ffffff' if base == '#f2eee6' else back)
    # udder and teats
    for y in range(22, 26):
        for x in range(34, 39):
            if ((x - 36.5) / 2.6) ** 2 + ((y - 23) / 2.2) ** 2 <= 1: P.p(x, y, '#e8a4a0' if y < 24 else '#d48884')
    P.p(35, 26, '#c87874'); P.p(37, 26, '#c87874')
    leg(13, True); leg(36, True)
    # the tail down the rump, with its tuft
    for k in range(13): P.p(46 + (k > 4), 9 + k, back if k < 11 else '#2a201c')
    P.p(46, 22, '#2a201c'); P.p(47, 23, '#2a201c')
    # neck and head, three-quarters
    for y in range(8, 18):
        for x in range(9, 16):
            if x - 9 > (17 - y) * .7 + 1: continue
            P.p(x, y, base if y < 14 else belly)
    for y in range(5, 15):
        for x in range(3, 12):
            if ((x - 7.5) / 4.6) ** 2 + ((y - 9.5) / 4.8) ** 2 > 1: continue
            c = face
            if spots and x > 6 and y < 11: c = spots
            P.p(x, y, c)
    for y in range(11, 17):
        for x in range(1, 8):
            if ((x - 4) / 3.4) ** 2 + ((y - 13.8) / 2.9) ** 2 > 1: continue
            P.p(x, y, '#e8b4a4' if y < 15 else '#d49a8c')
    P.p(2, 13, '#3a2020'); P.p(5, 13, '#3a2020'); P.p(3, 16, '#b07468')
    P.p(8, 8, '#1a1010'); P.p(8, 9, '#1a1010'); P.p(9, 8, '#1a1010'); P.p(8, 7, '#ffffff')
    for x, y in ((11, 6), (12, 6), (13, 7), (12, 7)): P.p(x, y, back if spots else face)
    P.p(13, 8, '#e8a4a0')
    for x, y in ((9, 3), (10, 3), (10, 4), (5, 3), (5, 4)): P.p(x, y, '#e8e0c8')
    P.p(10, 2, '#b8b098')
    P.outline(); P.save('out/' + name + '.png')

# ---- fallen leaves: small drifts of real leaf shapes, each lit from the upper left with a speck of shadow under it
MAPLE = ['.#.#.', '#####', '.###.', '..#..']
OAK = ['.###..', '######', '..###.']
SMALL = ['.##', '###', '.#.']
def leaves(name, ramps, seed, n):
    P = Pic(56, 23); random.seed(seed)
    centers = [(random.uniform(12, 44), random.uniform(7, 15)) for _ in range(3)]; n = n + 6
    for i in range(n):
        cx, cy = centers[i % 3]; x = cx + random.gauss(0, 4.2); y = cy + random.gauss(0, 1.8)
        shape = random.choice([MAPLE, MAPLE, OAK, SMALL]); ramp = random.choice(ramps); flip = random.random() < .5
        for j, row in enumerate(shape):
            for k, ch in enumerate(row[::-1] if flip else row):
                if ch != '#': continue
                X, Y = int(x) + k, int(y) + j
                if not (1 <= X < 55 and 1 <= Y < 21): continue
                l = (k + j) / (len(row) + len(shape))
                P.p(X, Y, ramp[0] if l < .35 else ramp[1] if l < .7 else ramp[2])
                if Y + 1 < 22 and P.get(X, Y + 1)[3] == 0: P.shadow.load()[X, Y + 1] = (10, 14, 6, 70)
        if shape is MAPLE: P.p(int(x) + 2, int(y) + 5, ramp[2])
    P.save('out/' + name + '.png')
R_RED = [('#e8743a', '#c8452a', '#8a2a1e'), ('#f09048', '#d86030', '#9a3a22')]
R_BROWN = [('#b07848', '#8a5630', '#5a3820'), ('#c08a58', '#9a6a40', '#6a4428')]
R_GOLD = [('#f4c858', '#e0a038', '#a87028'), ('#ecd070', '#d0a440', '#9a7024')]
picket_v()
cow('cow_1', '#f2eee6', '#d8d2c8', '#e4ddd2', '#2e2a2a', '#f2eee6', 4)
cow('cow_2', '#c4905c', '#9a6a40', '#e2c8a4', None, '#b88454', 9)
leaves('leaves_0', R_RED + R_GOLD[:1], 11, 9)
leaves('leaves_1', R_BROWN, 12, 8)
leaves('leaves_2', R_GOLD, 13, 8)
leaves('leaves_3', R_RED + R_BROWN + R_GOLD, 14, 10)
print('ok')
