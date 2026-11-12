"""t324 the new festival booths and prizes, drawn by code in the festival family's look (tools/ase props3: muted reds and
creams, plank fronts with dark seams, scalloped striped awnings, a one-pixel dark outline, a soft ground shadow), 32 px a metre:
  f2_bell     ring-the-bell: a painted striker board on a plinth, the bell at the top, the mallet leaning on it
  f2_gallery  the crow shoot: a striped awning, tin crows on two rails, the counter with a slingshot
  f2_tent     Ada's tent: a plum-and-cream peaked tent, the flap open on a lamp-lit table and three cards
  f2_prizes   Nell's prize booth: a blue awning, shelves of jars and dolls, rosettes hung along the front
  f2_table..4 the display tables for the Best Table: linen, rose, sage and oat cloths over trestles (the things on them are drawn by the game)
  f2_barrel   the apple barrel: a half barrel of dark water with apples floating
  f2_carve    the carving table: three pumpkins, one carved and lit, the knife and the scrapings
  f2_plush    the scarecrow doll (furniture prize)       f2_board   the ribbon board (furniture prize)
  icon32_it_f2_ribbon   the blue ribbon
python3 festart2.py <out dir> [<game root> ...]   writes PNGs to <out dir>; with game roots, installs them (spr/lpc/obj + objects.json)"""
import sys, os, json, math, shutil
from PIL import Image
OUT = (40, 25, 22); OUT2 = (29, 16, 24)
def hx(s): return tuple(int(s[i:i + 2], 16) for i in (1, 3, 5))
def R(*cs): return [hx(c) for c in cs]
WOOD = R('#291b16', '#46301a', '#664827', '#836137', '#9a6b3f', '#b98a51', '#d3af71')
GREYW = R('#281c1a', '#3a3026', '#4a3c2e', '#60503e', '#76644f', '#8c7860')
RED = R('#3e1918', '#5a1e1e', '#7e2e2a', '#9e403a', '#b45a4c', '#c8705c')
CREAM = R('#6a6250', '#8a8270', '#aea48e', '#c2bca4', '#d4ceb4', '#ede4cf', '#f8f0c8')
BLUE = R('#1e2638', '#283240', '#3a5070', '#4a6a90', '#6a8ab0', '#9ab4cc')
GOLD = R('#5a3a10', '#9a6a26', '#c08a30', '#d0a040', '#e8c860', '#f8e8b8')
PLUM = R('#1e1020', '#2e1830', '#44243e', '#5c3452', '#78486a', '#946282')
IRON = R('#1e2420', '#3a3e44', '#5a606a', '#8890a0', '#b8c0cc', '#e4e8f0')
PUMP = R('#5a1e08', '#8a3410', '#b8501a', '#d8763a', '#ee9a50', '#f8c070')
GLOW = R('#c8781a', '#f0a830', '#ffd860', '#fff4b0')
GREEN = R('#1e2a14', '#2e4220', '#3e5a2a', '#527236', '#6c8c44', '#90b05e')
WATER = R('#141c24', '#1c2a36', '#2a3e4e', '#3e5a6a', '#6a8a96')
STRAW = R('#5a4214', '#7c5c1e', '#a07a30', '#c09a44', '#dcbc66', '#f0d890')
SKIN = R('#6a4a32', '#9a7650', '#c4a274', '#dcc29a')
FONT = {'C': '111100100100111', 'R': '110101110101101', 'O': '111101101101111', 'W': '101101101111101', 'S': '111100111001111', 'P': '111101111100100',
        'I': '111010010010111', 'Z': '111001010100111', 'E': '111100110100111', 'B': '110101110101110', 'L': '100100100100111', 'T': '111010010010010',
        'Y': '101101010010010', 'A': '010101111101101', 'N': '1101011011011010'[:15], 'D': '110101101101110', '1': '010110010010111', '!': '010010010000010'}
class C:
    def __init__(s, w, h): s.w, s.h = w, h; s.im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); s.a = s.im.load()
    def p(s, x, y, c, al=255):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < s.w and 0 <= y < s.h: s.a[x, y] = (c[0], c[1], c[2], al)
    def get(s, x, y): return s.a[x, y] if 0 <= x < s.w and 0 <= y < s.h else (0, 0, 0, 0)
    def rect(s, x0, y0, x1, y1, c):
        for y in range(int(y0), int(y1) + 1):
            for x in range(int(x0), int(x1) + 1): s.p(x, y, c)
    def hl(s, x0, x1, y, c): s.rect(x0, y, x1, y, c)
    def vl(s, x, y0, y1, c): s.rect(x, y0, x, y1, c)
    def line(s, x0, y0, x1, y1, c, w=1):
        n = max(1, int(max(abs(x1 - x0), abs(y1 - y0)) * 2))
        for i in range(n + 1):
            x, y = x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n
            for dx in range(w):
                s.p(x + dx, y, c)
    def ell(s, cx, cy, rx, ry, c):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1: s.p(x, y, c)
    def ball(s, cx, cy, rx, ry, P, lx=-.6, ly=-.7):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                u, v = (x + .5 - cx) / rx, (y + .5 - cy) / ry; d = u * u + v * v
                if d > 1: continue
                l = .5 + (u * lx + v * ly) * .55 - (.22 if d > .8 else 0)
                s.p(x, y, P[max(0, min(len(P) - 1, int(round(l * (len(P) - 1)))))])
    def shadow(s, cx, cy, rx, ry, a=120):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if s.get(x, y)[3] == 0:
                    d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2
                    if d < 1: s.p(x, y, (12, 10, 8), int(a * (1 - d * .7)))
    def planks(s, x0, y0, x1, y1, P, bw=5, seed=1, vert=True):
        # boards with a dark seam, a lit edge, the odd knot and nail; P runs dark -> light
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                a, b = (x - x0, y - y0) if vert else (y - y0, x - x0)
                k = a // bw; r = a % bw
                base = 3 + ((k * 7 + seed) % 3 == 0) - ((k * 5 + seed) % 4 == 0)
                if r == 0: c = P[1]
                elif r == 1: c = P[min(len(P) - 1, base + 1)]
                else: c = P[base]
                if (b * 13 + k * 29 + seed * 7) % 37 == 0 and r > 1: c = P[base - 1]
                s.p(x, y, c)
    def awning(s, x0, x1, y0, h, A, B, sw=6, scal=3):
        # a striped canvas awning seen from the front: lit top edge, stripes, a scalloped hem with a shadow under
        for x in range(x0, x1 + 1):
            st = ((x - x0) // sw) % 2; P = A if st == 0 else B
            for y in range(y0, y0 + h):
                t = (y - y0) / max(1, h - 1); k = 4 if t < .2 else 3 if t < .75 else 2
                s.p(x, y, P[k])
            r = (x - x0) % sw; dip = int(round(math.sin((r + .5) / sw * math.pi) * scal))
            for y in range(y0 + h, y0 + h + dip): s.p(x, y, P[2])
            s.p(x, y0, P[5] if len(P) > 5 else P[4])
    def text(s, t, x, y, c):
        for ch in t:
            f = FONT.get(ch)
            if f:
                for j in range(5):
                    for i in range(3):
                        if f[j * 3 + i] == '1': s.p(x + i, y + j, c)
            x += 4
    def outline(s, col=OUT):
        pts = []
        for y in range(s.h):
            for x in range(s.w):
                if s.a[x, y][3] > 0: continue
                if any(s.get(x + dx, y + dy)[3] > 200 for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): pts.append((x, y))
        for x, y in pts: s.p(x, y, col)
    def save(s, path): s.im.save(path)
SPR = {}
def put(name, c, ax, ay, foot, out):
    c.save(os.path.join(out, name + '.png')); SPR[name] = {'src': f'spr/lpc/obj/{name}.png', 'fw': c.w, 'fh': c.h, 'ax': float(ax), 'ay': float(ay), 'foot': list(foot)}

def bellshape(c, cx, top, P):
    # a real bell: a rounded crown, the waist, a flared lip, the dark mouth, one glint upper left
    rows = [3, 4, 5, 5, 5, 6, 6, 7, 8, 9]
    for j, hw in enumerate(rows):
        y = top + j
        for x in range(cx - hw, cx + hw + 1):
            u = (x - cx) / hw; k = 4 if u < -.45 else 3 if u < .2 else 2 if u < .7 else 1
            if j == len(rows) - 1: k = max(1, k - 1)
            c.p(x, y, P[k])
    c.hl(cx - 8, cx + 8, top + len(rows), P[0]); c.hl(cx - 6, cx + 6, top + len(rows), (30, 18, 14))
    c.p(cx - 2, top + 1, P[5]); c.p(cx - 3, top + 2, P[5]); c.p(cx - 3, top + 3, P[4])
    c.p(cx, top + len(rows) + 1, P[2]); c.p(cx, top + len(rows) + 2, P[1])

def bell():
    c = C(46, 114); cx = 20
    for y in range(18, 98):
        for x in range(cx - 4, cx + 4):
            band = ((y - 18) // 8) % 2 == 1
            P = RED if band else CREAM; u = (x - (cx - 4)) / 8; k = 5 if u < .2 else 4 if u < .4 else 3 if u < .65 else 2
            c.p(x, y, P[min(len(P) - 1, k)])
        c.p(cx + 4, y, CREAM[1] if ((y - 18) // 8) % 2 == 0 else RED[1]); c.p(cx + 5, y, GREYW[1])
    c.vl(cx, 20, 96, GREYW[1]); c.vl(cx - 1, 20, 96, CREAM[2])
    for i, y in enumerate(range(26, 94, 9)): c.hl(cx + 2, cx + 3, y, GREYW[2])   # painted marks, flush with the board
    c.rect(cx - 2, 76, cx + 1, 79, IRON[3]); c.hl(cx - 2, cx + 1, 76, IRON[5]); c.hl(cx - 2, cx + 1, 79, IRON[1])
    c.rect(cx - 5, 15, cx + 5, 17, IRON[2]); c.hl(cx - 5, cx + 5, 15, IRON[4])
    bellshape(c, cx, 3, GOLD)
    c.rect(4, 96, 37, 99, WOOD[5]); c.hl(4, 37, 96, WOOD[6]); c.hl(4, 37, 99, WOOD[3])
    c.planks(4, 100, 37, 108, RED, bw=8, seed=2)
    c.rect(cx - 6, 102, cx + 6, 106, OUT2); c.text('TRY', cx - 5, 102, CREAM[6])
    c.hl(4, 37, 109, RED[0])
    c.rect(cx - 5, 93, cx + 5, 95, RED[3]); c.hl(cx - 5, cx + 5, 93, RED[5])
    c.line(41, 108, 33, 72, WOOD[4], 2); c.line(42, 108, 34, 72, WOOD[2], 1)
    c.rect(28, 64, 39, 71, WOOD[3]); c.hl(28, 39, 64, WOOD[5]); c.hl(28, 39, 71, WOOD[1]); c.vl(30, 64, 71, IRON[2]); c.vl(37, 64, 71, IRON[2]); c.vl(31, 64, 71, IRON[4])
    c.outline(); c.shadow(21, 110, 20, 3.5)
    return c, 21, 109, (-0.6, -0.3, 0.6, 0)

BLACKTIN = [(18, 16, 20), (30, 28, 34), (44, 42, 50), (64, 62, 72), (96, 94, 104), (140, 138, 150)]
CROWS = ['..###....', '.#hmm##..', '#hmmmmbbb', '#mmmmm##.', '.#mmmmm#.', '#mmmmmmm#', '##dmmmdd#', '.#.#..#..']
def crowpat(c, x, y, flip, T, scale=1):
    for j, row in enumerate(CROWS):
        for k, ch in enumerate(row):
            if ch == '.': continue
            kk = (len(row) - 1 - k) if flip else k
            col = OUT if ch == '#' else T[5] if ch == 'h' else T[3] if ch == 'm' else T[2] if ch == 'd' else (200, 138, 42)
            c.p(x + kk, y + j, col)

def gallery():
    c = C(98, 86); W = 98
    for x in (5, 90):
        c.rect(x, 16, x + 2, 82, WOOD[3]); c.vl(x, 16, 82, WOOD[5]); c.vl(x + 2, 16, 82, WOOD[1])
    c.planks(8, 22, 89, 58, WOOD[:6], bw=7, seed=3)
    for y in range(22, 59):
        for x in range(8, 90):
            r, g, b, a = c.a[x, y]; f = .78 + (y - 22) / 36 * .2; c.p(x, y, (int(r * f), int(g * f), int(b * f)))
    for ry in (34, 51):
        c.hl(8, 89, ry, GREYW[5]); c.hl(8, 89, ry + 1, GREYW[2])
        for bx in (14, 48, 82): c.rect(bx, ry + 2, bx + 1, ry + 4, GREYW[1])
    # black tin crows, staggered, some facing the other way, one gold; and the cut-out girl on the lower rail
    for (x, ry, flip, gold) in ((12, 34, 0, 0), (25, 34, 1, 0), (41, 34, 0, 1), (60, 34, 0, 0), (74, 34, 1, 0), (18, 51, 1, 0), (35, 51, 0, 0), (66, 51, 0, 0), (80, 51, 1, 0)):
        crowpat(c, x, ry - 8 - (1 if (x // 7) % 2 else 0), flip, GOLD if gold else BLACKTIN)
    gx = 50; gy = 51 - 14
    GIRL = ['...rr....', '..hhhh...', '.hffffh..', '.hfefeh..', '..ffff...', '...dd....', '.adddda..', 'a.dddd.a.', '..dddd...', '.dddddd..', 'dddddddd.', '.l....l..']
    for j, row in enumerate(GIRL):
        for k, ch in enumerate(row):
            col = {'r': (160, 40, 50), 'h': (44, 30, 24), 'f': (232, 214, 196), 'e': (10, 6, 6), 'd': (226, 222, 210), 'a': (232, 214, 196), 'l': (60, 50, 44)}.get(ch)
            if col: c.p(gx + k - 1, gy + j, col)
    c.vl(gx - 1, gy + 9, gy + 10, (250, 248, 238))
    c.awning(2, W - 3, 4, 13, RED, CREAM, sw=8, scal=3); c.hl(2, W - 3, 3, OUT)
    c.rect(4, 58, W - 5, 61, WOOD[5]); c.hl(4, W - 5, 58, WOOD[6]); c.hl(4, W - 5, 61, WOOD[2])
    c.planks(6, 62, W - 7, 81, GREYW, bw=6, seed=5)
    c.rect(35, 66, 62, 76, OUT2); c.rect(36, 67, 61, 75, (52, 34, 26)); c.text('CROWS', 39, 69, CREAM[5])
    c.line(70, 57, 73, 51, WOOD[4]); c.line(76, 57, 73, 51, WOOD[4]); c.vl(73, 51, 57, WOOD[3]); c.p(70, 51, WOOD[5]); c.p(76, 51, WOOD[5])
    for (x, y) in ((20, 57), (22, 57), (21, 56), (24, 57)): c.p(x, y, IRON[3])
    c.outline(); c.shadow(48, 82, 46, 4)
    return c, 48, 82, (-1.4, -0.5, 1.4, 0)

def tent():
    c = C(74, 88); cx = 37; top = 8; eave = 52; bot = 84
    for y in range(top, bot + 1):
        half = 3 + (y - top) / (eave - top) * 30 if y < eave else 33
        for x in range(int(cx - half), int(cx + half) + 1):
            u = (x - cx) / max(1, half); stripe = int((u + 1) * 4) % 2
            P = PLUM if stripe == 0 else CREAM; shade = 4 if u < -.5 else 3 if u < .4 else 2
            if P is CREAM and u > .25: c.p(x, y, (112, 94, 108) if u > .7 else (140, 118, 128) if u > .45 else (170, 152, 152))
            else: c.p(x, y, P[shade if P is PLUM else min(6, shade + 1)])
        if y in (eave, eave + 1):
            for x in range(cx - 33, cx + 34): c.p(x, y, PLUM[1] if y == eave else PLUM[4])
    for x in range(cx - 33, cx + 34):
        r = (x - cx + 33) % 6; dip = int(round(math.sin((r + .5) / 6 * math.pi) * 2.5))
        for y in range(eave + 2, eave + 3 + dip): c.p(x, y, GOLD[3] if y == eave + 2 else GOLD[2])
    # the doorway: a hooded figure behind a draped table, a crystal ball glowing violet on it
    for y in range(56, bot + 1):
        w = int((y - 56) * .58) + 4
        for x in range(cx - w, cx + w + 1): c.p(x, y, (30, 18, 28) if abs(x - cx) < w - 1 else PLUM[0])
    for y in range(60, 76):   # the hood and shoulders, darker than the dark
        hw = 3 if y < 66 else 3 + (y - 66) // 2
        for x in range(cx - hw, cx + hw + 1): c.p(x, y, (16, 10, 18))
    c.p(cx - 1, 64, (120, 90, 140)); c.p(cx + 1, 64, (120, 90, 140))   # two eyes in the hood, catching the light
    c.rect(cx - 11, 76, cx + 11, 84, PLUM[3]); c.hl(cx - 11, cx + 11, 76, PLUM[5])
    for x in range(cx - 11, cx + 12, 4): c.vl(x, 78, 84, PLUM[2])
    VIO = [(60, 30, 90), (100, 60, 150), (150, 110, 210), (200, 170, 240), (240, 225, 255)]
    c.ball(cx, 72, 3.6, 3.6, VIO); c.p(cx - 1, 70, VIO[4]); c.hl(cx - 2, cx + 2, 75, GOLD[2])
    for (x, y) in ((cx - 5, 71), (cx + 5, 71), (cx, 66), (cx - 4, 68), (cx + 4, 68)): c.p(x, y, (120, 90, 170))
    for side in (-1, 1):
        for y in range(56, bot):
            x = cx + side * (int((y - 56) * .58) + 5); c.p(x, y, CREAM[5]); c.p(x + side, y, CREAM[4])
        c.p(cx + side * 10, 66, GOLD[4]); c.p(cx + side * 10, 67, GOLD[3])
    c.vl(cx, 1, top + 1, WOOD[3]); c.p(cx, 0, GOLD[4])
    for i in range(6): c.vl(cx + 1 + i, 2, 2 + max(0, 4 - i), GOLD[3] if i < 4 else GOLD[2])
    c.ell(16, 66, 4, 4, GOLD[4]); c.ell(18, 65, 3.4, 3.4, PLUM[3])
    c.outline(); c.shadow(cx, bot + 1, 34, 3.5)
    return c, cx, bot + 1, (-1.0, -0.6, 1.0, 0)

GBLUE = R('#1e2430', '#2a3240', '#3e4a5a', '#56647a', '#7484980', '#94a2b2'[:7]) if False else R('#1e2430', '#2a3240', '#3e4a5a', '#56647a', '#748498', '#94a2b2')
def prizes():
    # its own shape: a low wide counter under a gabled signboard on two posts (no awning), rosettes pinned along the gable
    c = C(98, 84); W = 98
    for x in (9, 86):
        c.rect(x, 20, x + 2, 80, WOOD[3]); c.vl(x, 20, 80, WOOD[5]); c.vl(x + 2, 20, 80, WOOD[1])
    # the gable: a board with a peak, painted grey-blue, the word, a trim
    for y in range(4, 22):
        half = 10 + (y - 4) * 2.4
        for x in range(int(49 - half), int(49 + half) + 1):
            if 4 <= x <= W - 5: c.p(x, y, GBLUE[3] if y > 6 else GBLUE[4])
    for y in range(4, 22):
        half = 10 + (y - 4) * 2.4
        c.p(int(49 - half), y, WOOD[5]); c.p(int(49 + half), y, WOOD[2])
    c.hl(4, W - 5, 22, WOOD[5]); c.hl(4, W - 5, 23, WOOD[2])
    c.text('PRIZES', 37, 12, CREAM[6])
    for i, (x, P) in enumerate(((20, BLUE), (35, RED), (61, GOLD), (79, BLUE))):
        y = (19, 17, 20, 18)[i]
        c.ball(x, y, 2.6, 2.6, P); c.p(x, y, CREAM[6]); c.vl(x - 1, y + 3, y + 6, P[3]); c.vl(x + 1, y + 3, y + 5, P[2])
    # the back: two shelves on a plank wall, prizes on them, nothing in rows of the same
    c.planks(12, 25, 85, 62, GREYW, bw=7, seed=7)
    for sy in (41, 58): c.rect(12, sy, 85, sy + 1, WOOD[5]); c.hl(12, 85, sy + 2, WOOD[1])
    for x, P, h in ((16, RED, 8), (25, GOLD, 6), (59, GREEN, 7), (78, RED, 9)):
        c.rect(x, 41 - h, x + 5, 40, CREAM[4]); c.rect(x + 1, 41 - h + 2, x + 4, 40, P[3]); c.p(x + 1, 41 - h + 2, P[5]); c.hl(x, x + 5, 41 - h - 1, WOOD[4]); c.vl(x, 41 - h + 1, 39, CREAM[6])
    # a scarecrow doll on the top shelf, arms out on its stick
    c.hl(36, 50, 32, WOOD[3]); c.vl(43, 30, 40, WOOD[3]); c.rect(40, 33, 46, 39, (90, 84, 70)); c.ball(43, 29, 3.4, 3.4, [(150, 120, 80), (180, 150, 100), (200, 170, 120), (220, 196, 150)])
    c.p(42, 29, OUT); c.p(44, 29, OUT); c.hl(39, 47, 26, STRAW[3]); c.rect(41, 23, 45, 25, STRAW[2]); c.p(35, 32, STRAW[4]); c.p(51, 32, STRAW[4])
    for x in (14, 28):
        c.ell(x + 3, 55, 4, 2.4, WOOD[5]); c.hl(x, x + 6, 54, GOLD[4])
    c.ball(47, 54, 5, 4, R('#5a1e08', '#7a2c0c', '#9a3c12', '#b8501a', '#d0682a')); c.p(45, 53, GLOW[2]); c.p(49, 53, GLOW[2]); c.hl(45, 49, 56, GLOW[1]); c.vl(47, 49, 50, GREEN[2])
    c.rect(64, 50, 70, 57, (70, 90, 110)); c.hl(64, 70, 50, CREAM[5]); c.rect(74, 52, 80, 57, (120, 64, 70)); c.hl(74, 80, 52, CREAM[5])
    c.rect(33, 35, 35, 40, GOLD[3]); c.p(33, 34, GOLD[5]); c.rect(52, 36, 56, 40, (110, 70, 100)); c.hl(52, 56, 36, (150, 110, 140))   # a brass bell, a tin box
    c.rect(68, 31, 72, 40, (60, 80, 60)); c.rect(69, 29, 71, 30, (60, 80, 60)); c.p(69, 32, (120, 150, 110))                            # a tall green bottle
    c.ball(57, 54, 3, 3, R('#3a2a14', '#6a4a24', '#9a7038', '#c89a50')); c.p(56, 53, CREAM[6])                                          # a ball of yarn
    # the counter, lower and wider than the other booths
    c.rect(3, 62, W - 4, 65, WOOD[5]); c.hl(3, W - 4, 62, WOOD[6]); c.hl(3, W - 4, 65, WOOD[2])
    c.planks(5, 66, W - 6, 79, WOOD[:6], bw=6, seed=9)
    for (x, y) in ((20, 61), (21, 61), (70, 61)): c.p(x, y, GOLD[4])   # a few tickets left on the counter
    c.outline(); c.shadow(49, 80, 47, 4)
    return c, 49, 80, (-1.4, -0.5, 1.4, 0)

LINEN = R('#5a5244', '#7a705c', '#9a8e76', '#b4a88c', '#c8bca0', '#d8ceb2', '#e4dcc2')
ROSE = R('#4a3030', '#6a4440', '#86584e', '#9c6e62', '#b0887a', '#c2a090', '#d0b4a6')
SAGE = R('#2a3228', '#3e4a3a', '#56644e', '#6e7e64', '#88987a', '#a2b092', '#b6c2a6')
OAT = R('#4e4430', '#6c5e40', '#8a7a54', '#a69468', '#bcac7e', '#d0c294', '#ddd2a8')
def tablev(P, seed, drop=27, folds=None):
    c = C(54, 36)
    for x in (6, 45):
        c.rect(x, 22, x + 2, 32, WOOD[2]); c.vl(x, 22, 32, WOOD[4])
    if folds is None: folds = [3, 11, 22, 31, 42, 50]
    for y in range(6, 16):
        for x in range(3, 51): c.p(x, y, P[6] if (y - 6) < 3 else P[5])
    c.hl(3, 50, 6, P[6])
    for y in range(16, drop):
        for x in range(3, 51):
            k = 4
            for f in folds[1:-1]:
                w = 1.4 + (y - 16) * .18
                if abs(x - f) < w: k = 3 if x < f else 2
                elif 0 < x - f < w + 2: k = 5
            if y > drop - 3: k -= 1
            c.p(x, y, P[max(1, min(6, k))])
    for x in range(3, 51):
        fold_near = any(abs(x - f) < 2 for f in folds[1:-1])
        if fold_near: c.p(x, drop, P[2])
    c.hl(3, 50, 16, P[3])
    c.outline(); c.shadow(27, 33, 26, 3)
    return c, 27, 33, (-0.8, -0.3, 0.8, 0)
def table(): return tablev(LINEN, 1, drop=32, folds=[3, 9, 25, 44, 50])               # a long cloth to the ground, three deep folds
def table2(): return tablev(ROSE, 2, drop=21, folds=[3, 14, 20, 37, 50])           # a short one, the legs showing
def table3(): return tablev(SAGE, 3, drop=26, folds=[3, 8, 17, 23, 34, 46, 50])    # five folds, close and far
def table4(): return tablev(OAT, 4, drop=24, folds=[3, 19, 29, 50])                # a plain runner, two folds

def barrel():
    c = C(34, 32); cx = 17
    for y in range(11, 28):
        half = 13 - (1 if y > 24 else 0)
        for x in range(cx - half, cx + half + 1):
            u = (x - cx) / half; k = 4 if u < -.5 else 3 if u < .3 else 2
            if (x - cx + 13) % 4 == 0: k = 1
            c.p(x, y, WOOD[k])
    for hy in (14, 23):
        c.hl(cx - 13, cx + 13, hy, IRON[2]); c.hl(cx - 12, cx + 11, hy, IRON[3])
    c.ell(cx, 10, 13, 5, WOOD[5]); c.ell(cx, 10, 11, 3.6, WATER[2])
    c.hl(cx - 9, cx + 8, 7, WATER[3]); c.hl(cx - 8, cx - 5, 8, WATER[4]); c.hl(cx - 4, cx - 2, 9, WATER[4])   # the far edge catches the sky; one sheen line
    for a in range(12): c.p(cx + 1 + math.cos(a / 12 * math.tau) * 4, 11 + math.sin(a / 12 * math.tau) * 1.6, WATER[3])
    AP = [R('#4a0c08', '#7a1810', '#a82a1a', '#d0482a', '#ec7a4a'), R('#2a4a14', '#3e6a1c', '#5a8a2a', '#7aaa3a', '#a8cc5a')]
    for (x, y, P) in ((cx - 6, 9, AP[0]), (cx + 1, 11, AP[1]), (cx + 6, 9, AP[0])):
        c.rect(x - 2, y - 1, x + 1, y + 2, P[2]); c.hl(x - 2, x + 1, y + 2, P[1]); c.vl(x + 1, y - 1, y + 2, P[1]); c.p(x - 1, y, P[4]); c.p(x - 1, y - 2, WOOD[1])
    c.outline(); c.shadow(cx, 29, 15, 3)
    return c, cx, 29, (-0.45, -0.3, 0.45, 0)

BURNT = R('#3e1406', '#5a1e08', '#7a2c0c', '#9a3c12', '#b44e1a', '#c8622a')
def pumpkin(c, cx, cy, rx, ry, P, ribs=5):
    for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            u, v = (x + .5 - cx) / rx, (y + .5 - cy) / ry; d = u * u + v * v
            if d > 1: continue
            rib = math.cos(math.asin(max(-1, min(1, u))) * ribs)
            l = .5 - u * .3 - v * .35 + rib * .16 - (.2 if d > .8 else 0)
            c.p(x, y, P[max(0, min(len(P) - 1, int(round(l * (len(P) - 1)))))])
def carve():
    c = C(58, 46)
    for x in (6, 49):
        c.rect(x, 26, x + 2, 42, WOOD[2]); c.vl(x, 26, 42, WOOD[4])
    c.rect(3, 22, 54, 27, WOOD[5]); c.hl(3, 54, 22, WOOD[6]); c.hl(3, 54, 27, WOOD[2]); c.planks(3, 28, 54, 31, WOOD[:6], bw=9, seed=3, vert=True)
    pumpkin(c, 12, 18, 6, 5, BURNT, 4); c.vl(12, 11, 13, GREEN[2]); c.p(13, 11, GREEN[3])          # a squat one
    pumpkin(c, 29, 15, 9, 8, BURNT, 5); c.vl(29, 5, 8, GREEN[2]); c.p(30, 5, GREEN[3])             # the carved one, lit
    for (x, y) in ((25, 12), (26, 12), (25, 13), (26, 11), (32, 12), (33, 12), (33, 13), (32, 11)): c.p(x, y, GLOW[3])
    for x in range(24, 35):
        y = 18 + (1 if x % 3 == 0 else 0); c.p(x, y, GLOW[2]); c.p(x, y - 1, GLOW[3] if x % 3 else GLOW[2])
    c.p(29, 15, GLOW[2]); c.p(29, 14, GLOW[3])
    pumpkin(c, 45, 16, 6, 7, BURNT, 3); c.vl(44, 7, 9, GREEN[2]); c.p(43, 7, GREEN[3])             # a tall one, half done
    c.p(43, 14, GLOW[1]); c.p(44, 14, GLOW[1])
    c.hl(36, 42, 24, IRON[4]); c.hl(36, 42, 25, IRON[2]); c.rect(33, 24, 35, 25, WOOD[1])
    for (x, y) in ((19, 24), (20, 25), (21, 24), (22, 25), (20, 23)): c.p(x, y, (232, 214, 160))         # a pile of pale seeds
    for (x, y) in ((18, 25), (23, 24), (22, 23)): c.p(x, y, BURNT[5])                                      # and the stringy pulp
    c.ell(48, 24, 3, 1.4, BURNT[3]); c.hl(46, 50, 23, BURNT[4]); c.vl(48, 21, 22, GREEN[2]); c.p(49, 21, GREEN[3])   # the cut lid, stem and all
    c.outline(); c.shadow(29, 43, 27, 3)
    return c, 29, 43, (-0.8, -0.3, 0.8, 0)

SACK = R('#5a4a32', '#7a6646', '#9a8460', '#b49e78', '#c8b490')
def plush():
    # a little scarecrow doll on its stick: arms out along the crossbar, a sacking head with a stitched grin, straw at the neck and cuffs
    c = C(28, 30); cx = 14
    c.vl(cx, 12, 28, WOOD[3]); c.vl(cx + 1, 12, 28, WOOD[1])
    c.hl(cx - 11, cx + 11, 15, WOOD[4]); c.hl(cx - 11, cx + 11, 16, WOOD[2])
    c.rect(cx - 9, 14, cx + 9, 17, BLUE[3]); c.hl(cx - 9, cx + 9, 14, BLUE[4]); c.hl(cx - 9, cx + 9, 17, BLUE[2])
    for s in (-1, 1):
        for k in range(3): c.p(cx + s * 10, 13 + k, STRAW[4 - k]); c.p(cx + s * 11, 12 + k * 2, STRAW[4 - k])
    for x in (cx - 5, cx - 3, cx + 3, cx + 5): c.p(x, 7, STRAW[4])
    c.rect(cx - 4, 14, cx + 4, 23, BLUE[3]); c.vl(cx - 4, 14, 23, BLUE[4]); c.vl(cx + 4, 14, 23, BLUE[2])
    c.p(cx - 2, 18, RED[3]); c.p(cx + 1, 20, RED[3])   # two patches
    for x in range(cx - 3, cx + 4): c.p(x, 24, STRAW[3] if x % 2 else STRAW[2])
    c.ball(cx, 9, 4.5, 4.2, SACK)
    for x in range(cx - 3, cx + 4): c.p(x, 13, STRAW[4] if x % 2 else STRAW[3])
    c.p(cx - 2, 8, OUT); c.p(cx + 2, 8, OUT)
    for x, y in ((cx - 2, 11), (cx - 1, 12), (cx, 11), (cx + 1, 12), (cx + 2, 11)): c.p(x, y, (60, 30, 24))
    c.hl(cx - 7, cx + 7, 5, STRAW[3]); c.hl(cx - 6, cx + 6, 6, STRAW[2]); c.rect(cx - 3, 1, cx + 3, 4, STRAW[2]); c.hl(cx - 3, cx + 3, 1, STRAW[4]); c.hl(cx - 3, cx + 3, 4, RED[3])
    c.outline(); c.shadow(cx, 28, 6, 1.6)
    return c, cx, 28, (0, 0, 0, 0)

def rosette(c, x, y, P, r=3):
    for a in range(16):
        ang = a / 16 * math.tau; u = math.cos(ang); v = math.sin(ang)
        k = 4 if (u + v) < -.4 else 2 if (u + v) > .4 else 3
        for rr in (r, r + 1): c.p(x + u * rr, y + v * rr, P[k])
    c.ell(x, y, r - .5, r - .5, P[3]); c.p(x, y, CREAM[6]); c.p(x - 1, y, CREAM[5]); c.p(x, y - 1, CREAM[6])
    c.vl(x - 1, y + r + 1, y + r + 5, P[3]); c.vl(x + 1, y + r + 1, y + r + 4, P[1])
def board():
    c = C(32, 38); cx = 15
    c.line(6, 36, 10, 6, WOOD[3], 2); c.line(24, 36, 20, 6, WOOD[3], 2); c.line(15, 36, 15, 10, WOOD[2], 1)
    c.rect(1, 5, 29, 22, WOOD[4]); c.rect(2, 6, 28, 21, (150, 110, 70)); c.hl(1, 29, 5, WOOD[6]); c.hl(1, 29, 22, WOOD[1])
    rosette(c, 7, 11, BLUE, r=2); rosette(c, 15, 11, RED, r=2); rosette(c, 23, 11, GOLD, r=2)
    c.outline(); c.shadow(cx, 36, 10, 2)
    return c, cx, 36, (0, 0, 0, 0)

def ribbon():
    c = C(32, 32); cx = 16
    for s in (-1, 1):
        for y in range(16, 29):
            x = cx + s * (2 + (y - 16) // 3)
            c.rect(x - 1, y, x + 1, y, BLUE[3] if s < 0 else BLUE[1])
        x = cx + s * (2 + 12 // 3); c.p(x - 1, 28, BLUE[4] if s < 0 else BLUE[2]); c.p(x + 1, 28, BLUE[4] if s < 0 else BLUE[2]); c.p(x, 28, (0, 0, 0, 0)); c.a[x, 28] = (0, 0, 0, 0)
    for y in range(16, 28): c.p(cx - (2 + (y - 16) // 3) - 1, y, BLUE[5])
    for a in range(24):
        ang = a / 24 * math.tau; u, v = math.cos(ang), math.sin(ang)
        lit = -(u + v)
        for r in range(7, 11):
            k = 5 if lit > .6 else 4 if lit > 0 else 3 if lit > -.6 else 2
            if a % 2 and r == 10: k -= 1
            c.p(cx + u * r, 13 + v * r, BLUE[max(0, k)])
    c.ball(cx, 13, 7, 7, BLUE)
    c.ball(cx, 13, 4, 4, GOLD); c.text('1', cx - 1, 11, GOLD[0])
    c.outline()
    return c, 16, 32, (0, 0, 0, 0)

ALL = {'f2_bell': bell, 'f2_gallery': gallery, 'f2_tent': tent, 'f2_prizes': prizes, 'f2_table': table, 'f2_table2': table2, 'f2_table3': table3, 'f2_table4': table4,
       'f2_barrel': barrel, 'f2_carve': carve, 'f2_plush': plush, 'f2_board': board, 'icon32_it_f2_ribbon': ribbon}
if __name__ == '__main__':
    out = sys.argv[1]; roots = sys.argv[2:]; os.makedirs(out, exist_ok=True)
    only = os.environ.get('ONLY', '').split(',') if os.environ.get('ONLY') else None
    for n, f in ALL.items():
        if only and n not in only: continue
        c, ax, ay, foot = f(); put(n, c, ax, ay, foot, out)
    for r in roots:
        for n in SPR: shutil.copy(os.path.join(out, n + '.png'), os.path.join(r, 'spr/lpc/obj', n + '.png'))
        oj = os.path.join(r, 'spr/lpc/objects.json')
        if os.path.exists(oj):
            d = json.load(open(oj)); d.update(SPR); json.dump(d, open(oj, 'w'))
    print('ok', list(SPR))
