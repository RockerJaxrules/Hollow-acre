"""The things the story leaves in the world, drawn by code in the same 3/4 style as everything else: lit from the upper left,
hue-shifted ramps (dark reds lean toward violet, wet highlights toward warm white), contact shadows, dark outlines.
  g_deer_open  a deer on its side, opened throat to tail, ribs showing, its insides laid round it in a ring like a clock face
  g_blood      a pool of blood with a wet highlight and a few drops (flat, under everything)
  g_hooks      a timber rack of meat hooks: two skinned carcasses and a third shape wrapped in sacking, bare feet showing
  g_coffins    three small open coffins in a row, lids leaning, the insides scratched
  g_grave      an open grave: a heap of turned earth, a spade, and a body in a sheet that has soaked through
  g_jars       a pantry shelf of jars: teeth in one, eyes in brine in another, labels with years
Writes spr/lpc/obj/g_*.png and objects.json."""
import json, math, colorsys
from PIL import Image
H = lambda x, y, s=0: (math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453) % 1
L = (-.55, -.65, .53); _n = math.sqrt(sum(v * v for v in L)); L = tuple(v / _n for v in L)
def ramp(hexc, n=6, spread=.9):
    r, g, b = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]; h, s, v = colorsys.rgb_to_hsv(r, g, b); out = []
    for i in range(n):
        t = i / (n - 1) - .55; tgt = .78 if t < 0 else .1; d = ((tgt - h + .5) % 1) - .5; hh = (h + d * min(1, abs(t) * .45)) % 1
        out.append(tuple(round(c * 255) for c in colorsys.hsv_to_rgb(hh, max(0, min(1, s * (1 - t * .45))), max(0, min(1, v * (1 + t * spread))))))
    return out
BLOOD = ramp('#7a1018', spread=1.1); MEAT = ramp('#b8484a'); FAT = ramp('#e8d0b0', spread=.5); BONE = ramp('#e2d6be', spread=.6)
DEER = ramp('#a06c3c'); WOOD = ramp('#7a5434'); IRON = ramp('#6a6a74'); SACK = ramp('#a89070', spread=.7); EARTH = ramp('#5a4030')
SKIN = ramp('#d8b49a', spread=.6); GLASS = ramp('#9ab0a8', spread=.5); CLOTH = ramp('#d8d2c4', spread=.5)
OUT = (22, 12, 16)
class C:
    def __init__(s, W, Hh): s.W, s.H = W, Hh; s.im = Image.new('RGBA', (W, Hh), (0, 0, 0, 0)); s.px = s.im.load()
    def p(s, x, y, c, a=255):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < s.W and 0 <= y < s.H: s.px[x, y] = (c[0], c[1], c[2], a)
    def rect(s, x0, y0, x1, y1, c):
        for y in range(int(y0), int(y1) + 1):
            for x in range(int(x0), int(x1) + 1): s.p(x, y, c)
    def ell(s, cx, cy, rx, ry, R, rot=0, k=1.0, wet=False, a=255):
        R = [R] if isinstance(R[0], int) else R; n = len(R); cr, sr = math.cos(rot), math.sin(rot); m = max(rx, ry) + 1
        for y in range(int(cy - m) - 1, int(cy + m) + 2):
            for x in range(int(cx - m) - 1, int(cx + m) + 2):
                dx, dy = x + .5 - cx, y + .5 - cy; u = (dx * cr + dy * sr) / rx; v = (-dx * sr + dy * cr) / ry; d = u * u + v * v
                if d > 1: continue
                nz = math.sqrt(1 - d); nx = u * cr - v * sr; ny = u * sr + v * cr; l = (max(0, nx * L[0] + ny * L[1] + nz * L[2]) * .95 + .08) * k
                c = R[max(0, min(n - 1, int(round(l * (n - 1)))))]
                if wet and l > .92: c = (255, 236, 226)
                s.p(x, y, c, a)
    def shadow(s, cx, cy, rx, ry, a=150):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2
                if d < 1 and s.px[x, y][3] == 0 if 0 <= x < s.W and 0 <= y < s.H else False: s.p(x, y, (10, 8, 10), int(a * (1 - d) + 30))
    def pool(s, cx, cy, rx, ry, seed, drops=4):
        for y in range(int(cy - ry) - 2, int(cy + ry) + 3):
            for x in range(int(cx - rx) - 2, int(cx + rx) + 3):
                ang = math.atan2(y + .5 - cy, x + .5 - cx); w = 1 + .22 * math.sin(ang * 3 + seed) + .12 * math.sin(ang * 7 + seed * 2)
                d = ((x + .5 - cx) / (rx * w)) ** 2 + ((y + .5 - cy) / (ry * w)) ** 2
                if d < 1: s.p(x, y, BLOOD[1] if d > .55 else BLOOD[2] if d > .2 else BLOOD[3])
        s.p(cx - rx * .35, cy - ry * .35, (220, 120, 120)); s.p(cx - rx * .35 + 1, cy - ry * .35, (180, 60, 70))
        for i in range(drops):
            a = H(i, seed) * 6.28; r = 1.15 + H(i, seed, 2) * .5; s.p(cx + math.cos(a) * rx * r, cy + math.sin(a) * ry * r, BLOOD[1])
    def outline(s, below=None):
        a = [[s.px[x, y][3] > 200 for x in range(s.W)] for y in range(s.H)]; pts = []
        for y in range(s.H):
            for x in range(s.W):
                if a[y][x] or (below is not None and y > below): continue
                if any(0 <= x + dx < s.W and 0 <= y + dy < s.H and a[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    if s.px[x, y][3] < 120: pts.append((x, y))
        for x, y in pts: s.p(x, y, OUT)
SPR = {}
def save(name, c, ax, ay, foot=(0, 0, 0, 0), kind=None):
    c.im.save(f'spr/lpc/obj/{name}.png'); SPR[name] = {'src': f'spr/lpc/obj/{name}.png', 'fw': c.W, 'fh': c.H, 'ax': float(ax), 'ay': float(ay), 'foot': list(foot)}
# ---- the deer, opened, its insides round it like a clock
c = C(72, 40)
c.pool(36, 28, 22, 7, 3, 6)
for k in range(12):   # twelve pieces in a ring; the heart at midnight
    a = -math.pi / 2 + k / 12 * 6.283; x, y = 36 + math.cos(a) * 30, 26 + math.sin(a) * 10.5
    if k == 0: c.ell(x, y - 1, 2.4, 2.2, MEAT, wet=True); c.p(x, y - 3, BLOOD[0])
    else: c.ell(x, y, 1.6 + H(k, 1) * .9, 1.2 + H(k, 2) * .6, [MEAT, BLOOD, FAT][k % 3] if k % 3 else MEAT, rot=H(k, 3) * 3, wet=k % 2 == 0)
c.ell(25, 24, 6, 4.4, DEER); c.ell(36, 23.5, 11, 5, DEER); c.ell(47, 23, 5, 4, DEER)
for x in range(27, 46):   # the cut along the belly: dark inside, ribs across it
    for y in range(int(25 - 1.6 * math.sin((x - 27) / 18 * math.pi)), 27): c.p(x, y, BLOOD[1] if (x + y) % 3 else BLOOD[0])
for x in range(29, 45, 3):
    for y in range(int(24 - 1.6 * math.sin((x - 27) / 18 * math.pi)), 27): c.p(x, y, BONE[4] if y < 25 else BONE[2])
c.ell(53, 20, 3.4, 2.8, DEER); c.ell(56, 21.5, 2.4, 1.6, DEER); c.p(57.6, 21, (20, 14, 14)); c.p(52.6, 19.4, (14, 8, 8))
for x, y in ((52, 17), (50, 16.5)): c.ell(x, y, 1.1, 2.4, DEER, rot=-.8)
for (x0, y0, x1, y1) in ((24, 27, 20, 32), (27, 27, 25, 33), (44, 26, 48, 32), (47, 26, 52, 31)):
    for i in range(9): t = i / 8; c.p(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, DEER[1]); c.p(x0 + (x1 - x0) * t + 1, y0 + (y1 - y0) * t, DEER[2])
for (x, y) in ((36, 25), (36, 18)): c.p(x, y, BONE[5])   # two snapped ribs set in the middle: the hands
for i in range(6): c.p(36 + i * .9, 25 - i * 1.2, BONE[4]); c.p(36 - i * .5, 25 - i * .3, BONE[3])
c.outline(below=33); save('g_deer_open', c, 36, 30)
# ---- a pool of blood
c = C(44, 20); c.pool(22, 10, 17, 6, 2, 8); save('g_blood', c, 22, 10)
# ---- the cold house rack
c = C(64, 84)
c.shadow(32, 80, 30, 3.5)
for x in (4, 58):
    for y in range(8, 81): c.rect(x, y, x + 3, y, WOOD[3 if x < 30 else 2]); c.p(x, y, WOOD[4]); c.p(x + 3, y, WOOD[1])
c.rect(2, 6, 62, 7, WOOD[4]); c.rect(2, 8, 62, 11, WOOD[2]); c.rect(2, 12, 62, 12, WOOD[0])
def hook(x):
    for y in range(12, 18): c.p(x, y, IRON[3])
    c.p(x + 1, 18, IRON[3]); c.p(x + 2, 19, IRON[2]); c.p(x + 1, 20, IRON[2])
for i, cx in enumerate((16, 32)):   # two skinned carcasses, ribs and fat, dripping
    hook(cx); c.ell(cx, 36, 6.4, 15, MEAT, wet=True); c.ell(cx - 1, 33, 4, 11, FAT, k=.9)
    for y in range(26, 46, 3): c.rect(cx - 4, y, cx + 3, y, MEAT[1]); c.p(cx - 3, y, BONE[4])
    c.ell(cx - 3, 55, 1.8, 6, MEAT); c.ell(cx + 3, 55, 1.8, 6, MEAT); c.ell(cx, 22, 2.6, 3, MEAT, wet=True)
    for d in range(3): c.p(cx - 2 + d * 2, 62 + d * 4 + i * 3, BLOOD[2])
    c.pool(cx, 79, 4 + i, 1.4, i + 3, 2)
hook(48); c.ell(48, 40, 6, 17, SACK); c.rect(43, 30, 53, 30, SACK[1]); c.rect(43, 44, 53, 44, SACK[1])   # the third, wrapped
for x in (46, 50): c.ell(x, 59, 1.5, 3.4, SKIN); c.p(x, 62, (210, 110, 150))   # bare feet, the toenails painted
c.ell(46, 47, 4, 3, BLOOD[2], a=200); c.pool(48, 79, 3, 1.2, 9, 2)
c.outline(); save('g_hooks', c, 32, 80, foot=(-0.95, -0.3, 0.95, 0))
# ---- three small open coffins
c = C(70, 36); c.shadow(35, 31, 33, 3.4)
for i, cx in enumerate((12, 35, 58)):
    for y in range(12, 31):
        w = 6 + (3 if y < 18 else 3 - (y - 18) * .18)
        for x in range(int(cx - w), int(cx + w) + 1):
            edge = abs(x - cx) > w - 1.6 or y < 13 or y > 29
            c.p(x, y, WOOD[3] if edge and x < cx else WOOD[2] if edge else (40, 30, 34) if (x * 7 + y * 3 + i) % 11 else (120, 100, 90))
    c.rect(cx - 5, 30, cx + 5, 32, WOOD[1])
    for k in range(3): c.p(cx - 3 + k * 2, 18 + k * 3, (150, 130, 120)); c.p(cx - 2 + k * 2, 19 + k * 3, (150, 130, 120))   # scratches inside
    lx = cx + 9; c.rect(lx, 4, lx + 3, 26, WOOD[3]); c.rect(lx + 3, 4, lx + 4, 26, WOOD[1])   # the lid leaning
c.outline(); save('g_coffins', c, 35, 31, foot=(-1.05, -0.5, 1.05, 0))
# ---- an open grave with a body in a sheet
c = C(64, 40); c.shadow(32, 36, 30, 3.2)
c.rect(14, 14, 50, 34, (26, 18, 18)); c.rect(14, 14, 50, 16, EARTH[1])
c.ell(32, 25, 14, 6, CLOTH); c.ell(27, 26, 7, 4, BLOOD[2], a=230); c.ell(40, 24, 4, 3, BLOOD[1], a=210); c.ell(19, 24, 3.2, 3, CLOTH, k=1.1)
c.ell(23, 24, 2.4, 2, BLOOD[3], a=200)
for x in range(4, 60):   # the heap of turned earth behind
    h = 7 - abs(x - 32) / 5 if 8 < x < 56 else 0
    for y in range(int(12 - h), 14): c.p(x, y, EARTH[4 if y < 10 - h / 3 else 3 if x < 32 else 2])
c.rect(54, 2, 55, 22, WOOD[3]); c.rect(52, 22, 57, 27, IRON[3]); c.rect(52, 22, 57, 22, IRON[4])   # the spade
c.outline(); save('g_grave', c, 32, 34, foot=(-1.1, -0.65, 1.1, 0))
# ---- a pantry shelf of jars
c = C(40, 50); c.shadow(20, 47, 18, 2.4)
for y in (14, 32, 46): c.rect(2, y, 37, y + 1, WOOD[3]); c.rect(2, y + 2, 37, y + 2, WOOD[1])
c.rect(2, 2, 3, 47, WOOD[2]); c.rect(36, 2, 37, 47, WOOD[1])
for row, y0 in ((0, 4), (1, 22), (2, 36)):
    for i in range(3):
        x0 = 6 + i * 10; c.rect(x0, y0, x0 + 7, y0 + 9 - (row == 2) * 0, GLASS[2]); c.rect(x0, y0, x0 + 1, y0 + 9, GLASS[4]); c.rect(x0 + 1, y0 - 1, x0 + 6, y0 - 1, IRON[3])
        kind = (row * 3 + i) % 3
        for k in range(6):
            px_, py_ = x0 + 2 + (k % 3) * 1.6, y0 + 3 + (k // 3) * 2.5
            if kind == 0: c.p(px_, py_, BONE[5]); c.p(px_, py_ + 1, BONE[3])                         # teeth
            elif kind == 1 and k < 3: c.ell(x0 + 2 + k * 1.8, y0 + 5, 1.2, 1.2, BONE, k=1.2); c.p(x0 + 2 + k * 1.8, y0 + 5, (40, 70, 60))   # eyes
            elif kind == 2: c.p(px_, py_, BLOOD[2])
        c.rect(x0 + 1, y0 + 6, x0 + 6, y0 + 7, (226, 214, 180))
c.outline(); save('g_jars', c, 20, 47, foot=(-0.55, -0.3, 0.55, 0))
d = json.load(open('spr/lpc/objects.json')); d.update(SPR); json.dump(d, open('spr/lpc/objects.json', 'w')); print('ok', list(SPR))
