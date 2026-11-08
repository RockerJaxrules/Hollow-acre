"""The eight new regions of the valley, drawn by code with the depth rules: lit top faces over darker fronts, hue-shifted ramps
(shadows lean blue-violet, lights lean warm), contact shadows on the ground, ambient occlusion under overhangs, dark outlines.
  Route 9 West:      rg_motel(+_n), rg_motelsign(+_n), rg_car_a/b/c, rg_countysign
  Greyfield Home:    rg_home, rgiron_h/v, rg_gate, rg_marker_0/1/2, rg_swing
  The Fen:           rg_hut, rg_peat, rg_bogbody
  The Deep Corn:     rg_scare_a/b/c
  The Drowned Village: rg_steeple, rg_roofpeak, rg_dam
  Pine Ridge:        rg_tower, rg_logcabin, rg_outcrop
  Old Marrow:        rg_chapel, rg_chimney, rg_burnt_a/b, rg_oldwell
  Weeping Birches:   rg_dolltree_a/b, rg_den
  everywhere:        rg_mile (the old county milestones)
Writes spr/lpc/obj/rg_*.png and their objects.json entries."""
import json, math, colorsys
from PIL import Image

def ramp(hexc, n=7, spread=.8, sat=1.0):
    r, g, b = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]; h, s, v = colorsys.rgb_to_hsv(r, g, b); out = []
    for i in range(n):
        t = i / (n - 1) - .5; tgt = .70 if t < 0 else .11; d = ((tgt - h + .5) % 1) - .5; hh = (h + d * min(1, abs(t) * .5)) % 1
        out.append(tuple(round(c * 255) for c in colorsys.hsv_to_rgb(hh, max(0, min(1, s * sat * (1 - t * .35))), max(0, min(1, v * (1 + t * spread))))))
    return out
def H(x, y, s=0):
    n = math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return n - math.floor(n)
OUT = (22, 14, 14)
CREAM = ramp('#d8c8a0', spread=.5); TEAL = ramp('#2f6f6a'); BRICK = ramp('#9a4a34'); TAR = ramp('#4a4a50', spread=.6)
WOOD = ramp('#8a5e36'); DWOOD = ramp('#5a3e28'); IRON = ramp('#3e3c44', spread=.9); RUST = ramp('#9a5a2a'); STONE = ramp('#8a8680', spread=.6)
SLATE = ramp('#4a5060', spread=.6); CONC = ramp('#a8a49a', spread=.45); GREEN = ramp('#2e6a3a'); WHITE = ramp('#e8e4dc', spread=.35)
RED = ramp('#c03028'); GOLD = ramp('#d8a840'); MOSS = ramp('#5a7a34'); PEAT = ramp('#4a3424', spread=.7); SKIN = ramp('#6a4a30', spread=.6)
BURLAP = ramp('#b0905a', spread=.6); STRAW = ramp('#d8b860', spread=.5); CHAR = ramp('#2a2624', spread=1.2); WATER = ramp('#3a5a68', spread=.6)
BIRCH = ramp('#e4e0d4', spread=.3); LEAFY = ramp('#d8b030')
FONT = {'A': '010101111101101', 'B': '110101110101110', 'C': '011100100100011', 'D': '110101101101110', 'E': '111100110100111', 'F': '111100110100100',
        'G': '011100101101011', 'H': '101101111101101', 'I': '111010010010111', 'K': '101101110101101', 'L': '100100100100111', 'M': '101111111101101',
        'N': '110101101101101', 'O': '010101101101010', 'P': '110101110100100', 'R': '110101110101101', 'S': '011100010001110', 'T': '111010010010010',
        'U': '101101101101111', 'V': '101101101101010', 'W': '101101111111101', 'Y': '101101010010010', 'Z': '111001010100111', 'J': '001001001101010',
        '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110', '4': '101101111001001', '5': '111100110001110',
        '6': '011100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001110', ' ': '000000000000000', '.': '000000000000010', '-': '000000111000000'}
class C:
    def __init__(s, W, H_): s.W, s.H = W, H_; s.im = Image.new('RGBA', (W, H_), (0, 0, 0, 0)); s.px = s.im.load()
    def p(s, x, y, c, a=255):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < s.W and 0 <= y < s.H: s.px[x, y] = (int(c[0]), int(c[1]), int(c[2]), a)
    def get(s, x, y):
        if 0 <= x < s.W and 0 <= y < s.H: return s.px[x, y]
        return (0, 0, 0, 0)
    def rect(s, x0, y0, x1, y1, c):
        for y in range(int(y0), int(y1) + 1):
            for x in range(int(x0), int(x1) + 1): s.p(x, y, c(x, y) if callable(c) else c)
    def poly(s, pts, fn):
        x0 = int(min(p[0] for p in pts)); x1 = int(max(p[0] for p in pts)) + 1; y0 = int(min(p[1] for p in pts)); y1 = int(max(p[1] for p in pts)) + 1
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                ins = False; j = len(pts) - 1
                for i in range(len(pts)):
                    xa, ya = pts[i]; xb, yb = pts[j]
                    if (ya > y + .5) != (yb > y + .5) and x + .5 < (xb - xa) * (y + .5 - ya) / (yb - ya) + xa: ins = not ins
                    j = i
                if ins:
                    c = fn(x, y) if callable(fn) else fn
                    if c: s.p(x, y, c)
    def ellipse(s, cx, cy, rx, ry, fn):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2
                if d < 1:
                    c = fn(x, y, d) if callable(fn) else fn
                    if c: s.p(x, y, c)
    def line(s, x0, y0, x1, y1, c, w=1):
        n = int(max(abs(x1 - x0), abs(y1 - y0)) * 2) + 1
        for i in range(n + 1):
            t = i / n; x = x0 + (x1 - x0) * t; y = y0 + (y1 - y0) * t
            for k in range(w): s.p(x + (k if abs(y1 - y0) > abs(x1 - x0) else 0), y + (0 if abs(y1 - y0) > abs(x1 - x0) else k), c(t) if callable(c) else c)
    def shadow(s, cx, cy, rx, ry, a=150):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if 0 <= x < s.W and 0 <= y < s.H and s.px[x, y][3] == 0:
                    d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2
                    if d < 1: s.p(x, y, (12, 12, 16), int(a * (1 - d) ** .7 + 20))
    def text(s, x, y, t, col, sc=1, sh=None):
        for ch in t.upper():
            g = FONT.get(ch, FONT[' '])
            for i, b in enumerate(g):
                if b == '1':
                    for a in range(sc):
                        for bb in range(sc):
                            if sh: s.p(x + (i % 3) * sc + a + 1, y + (i // 3) * sc + bb + 1, sh)
                            s.p(x + (i % 3) * sc + a, y + (i // 3) * sc + bb, col)
            x += 4 * sc
    def outline(s, col=OUT):
        a = [[s.px[x, y][3] > 200 for x in range(s.W)] for y in range(s.H)]; pts = []
        for y in range(s.H):
            for x in range(s.W):
                if a[y][x] or s.px[x, y][3] > 100: continue
                if any(0 <= x + dx < s.W and 0 <= y + dy < s.H and a[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): pts.append((x, y))
        for x, y in pts: s.p(x, y, col)
    def darken(s, x0, y0, x1, y1, k):
        for y in range(int(y0), int(y1) + 1):
            for x in range(int(x0), int(x1) + 1):
                q = s.get(x, y)
                if q[3]: s.p(x, y, (q[0] * k, q[1] * k, q[2] * k), q[3])
def tw(t, sc=1): return len(t) * 4 * sc - sc
SPR = {}
def save(n, c, ax, ay, foot=(0, 0, 0, 0), **kw):
    c.im.save(f'spr/lpc/obj/{n}.png'); SPR[n] = dict({'src': f'spr/lpc/obj/{n}.png', 'fw': c.W, 'fh': c.H, 'ax': float(ax), 'ay': float(ay), 'foot': list(foot)}, **kw)
def lit(R, x, x0, x1):   # pick a ramp shade lit from the left
    t = (x - x0) / max(1, x1 - x0); return R[5] if t < .08 else R[4] if t < .55 else R[3] if t < .92 else R[2]

# ======================================================================== Route 9 West
def motel(night):
    W, Hh = 352, 156; c = C(W, Hh); gy = Hh - 4
    c.shadow(W / 2, gy, W / 2 - 4, 6, 120)
    # the flat roof seen from above: tar and gravel, a lighter parapet lip
    c.rect(10, 30, W - 11, 58, lambda x, y: TAR[4] if H(x // 2, y // 2) > .82 else TAR[3] if H(x, y, 1) > .2 else TAR[2])
    c.rect(10, 30, W - 11, 31, CONC[5]); c.rect(10, 57, W - 11, 58, CONC[3])
    for x in (60, 170, 260): c.rect(x, 38, x + 14, 48, CONC[4]); c.rect(x, 46, x + 14, 48, CONC[2]); c.rect(x + 2, 40, x + 12, 44, (70, 72, 78))   # rooftop vents
    # the wall: cream stucco, peeling; under the canopy it is in shade
    c.rect(10, 59, W - 11, gy - 8, lambda x, y: (CREAM[3] if H(x // 3, y // 3, 2) > .12 else CREAM[1]) if y > 74 else CREAM[2])
    for k in range(22):   # peeling patches showing grey plaster
        x = 14 + int(H(k, 1) * (W - 30)); y = 80 + int(H(k, 2) * 46); c.rect(x, y, x + 2 + int(H(k, 3) * 4), y + 1, (168, 160, 140)); c.rect(x, y + 2, x + 2 + int(H(k, 3) * 4), y + 2, (196, 186, 156))
    # the office at the left: big window, glass door
    c.rect(14, 82, 74, 118, lambda x, y: (250, 210, 130) if night else (60, 70, 82) if (x + y) % 9 else (110, 124, 140))
    if not night:
        for y in range(84, 117, 3): c.rect(16, y, 72, y, (78, 90, 104))
    c.rect(14, 82, 74, 82, WOOD[5]); c.rect(14, 118, 74, 119, WOOD[2]); c.rect(43, 82, 44, 118, WOOD[3])
    c.text(24, 72, 'OFFICE', RED[5] if night else RED[3])
    c.rect(78, 86, 96, gy - 9, lambda x, y: (240, 200, 120) if night and 80 < x < 94 else TEAL[3]); c.rect(79, 88, 95, 104, (240, 210, 140) if night else (70, 84, 96))
    # rooms 1-7: teal doors with brass numbers, curtained windows, an air conditioner under each
    for i in range(7):
        x0 = 106 + i * 34; c.rect(x0, 84, x0 + 13, gy - 9, lambda x, y: TEAL[4] if x < x0 + 3 else TEAL[2] if x > x0 + 11 else TEAL[3])
        c.rect(x0 + 10, 108, x0 + 11, 110, GOLD[4]); c.text(x0 + 5, 88, str(i + 1), GOLD[5])
        wx = x0 + 17; c.rect(wx, 88, wx + 13, 106, (40, 46, 56))
        cur = (160, 60, 50) if i % 3 == 0 else (150, 130, 80) if i % 3 == 1 else (70, 100, 90)
        gap = 2 if i != 5 else 4
        for x in range(wx, wx + 14):
            if abs(x - (wx + 6.5)) < gap: continue
            for y in range(89, 106): c.p(x, y, tuple(v * (.8 + .2 * ((x + 1) % 3 == 0)) for v in cur))
        if i == 5:   # room 6: something pale stands between the curtains
            c.rect(wx + 6, 92, wx + 7, 96, (196, 190, 176)); c.p(wx + 6, 93, (20, 16, 16)); c.p(wx + 7, 93, (20, 16, 16))
        if night and i in (2, 5):
            for x in range(wx, wx + 14):
                for y in range(89, 106):
                    q = c.get(x, y); c.p(x, y, (min(255, q[0] * 1.3 + 40), min(255, q[1] * 1.2 + 30), q[2]))
        c.rect(wx, 106, wx + 13, 107, CONC[4]); c.rect(wx + 2, 110, wx + 11, 116, CONC[3]); c.rect(wx + 2, 110, wx + 11, 110, CONC[5]); c.rect(wx + 3, 112, wx + 10, 112, CONC[1]); c.rect(wx + 3, 114, wx + 10, 114, CONC[1])
    # the canopy over the walkway: a teal fascia band, its shade on the wall below it, posts down to the walk
    c.rect(10, 59, W - 11, 66, lambda x, y: TEAL[5] if y == 59 else TEAL[3] if y < 65 else TEAL[1])
    c.darken(10, 67, W - 11, 74, .72)
    for x in range(14, W - 12, 34):
        c.rect(x, 67, x + 2, gy - 6, lambda xx, y: WHITE[4] if xx == x else WHITE[2]); c.rect(x - 1, gy - 7, x + 3, gy - 6, CONC[2])
    # the walkway: a concrete strip with its lit front edge
    c.rect(10, gy - 8, W - 11, gy - 3, lambda x, y: CONC[4] if y == gy - 8 else CONC[3] if y < gy - 4 else CONC[1])
    for x in range(30, W - 12, 40): c.p(x, gy - 6, CONC[2])
    # an ice machine and a pay phone by the office
    c.rect(97, 100, 104, gy - 9, lambda x, y: WHITE[4] if x < 99 else WHITE[2]); c.rect(97, 100, 104, 101, WHITE[5]); c.rect(98, 104, 103, 106, (60, 90, 140)); c.rect(99, 112, 102, 113, (30, 30, 36))
    c.outline(); return c
c = motel(False); save('rg_motel', c, 176, 152, foot=(-5.2, -3.4, 5.2, 0))
c = motel(True); save('rg_motel_n', c, 176, 152, foot=(-5.2, -3.4, 5.2, 0))
def motelsign(night):
    W, Hh = 80, 156; c = C(W, Hh); gy = Hh - 4; c.shadow(40, gy, 16, 3)
    for x in (26, 52): c.rect(x, 60, x + 3, gy, lambda xx, y: IRON[5] if xx == x else IRON[3] if xx < x + 3 else IRON[1])
    # the big box sign: PINE / REST, a little pine tree, a red arrow of bulbs
    c.rect(6, 8, 73, 54, lambda x, y: GREEN[2] if y > 50 else GREEN[3]); c.rect(6, 8, 73, 9, GREEN[5]); c.rect(8, 11, 71, 49, GREEN[1] if night else (34, 70, 46))
    col = (250, 236, 180) if night else WHITE[4]
    c.text(26, 15, 'PINE', col, 2); c.text(26, 30, 'REST', col, 2)
    for k in range(9):
        w = k * .8 + 1; c.rect(16 - w, 14 + k * 3, 16 + w, 16 + k * 3, (60, 160, 90) if night else (60, 120, 70))
    c.rect(15, 42, 17, 46, WOOD[2]); c.text(28, 44, 'MOTEL', (240, 120, 80) if night else RED[4])
    for x in range(8, 72, 4): c.p(x, 52, (255, 220, 120) if night and x % 8 else (120, 110, 90))
    # the NO VACANCY panel underneath
    c.rect(14, 60, 66, 72, (24, 20, 24)); c.rect(14, 60, 66, 60, IRON[4])
    c.text(18, 63, 'NO', (255, 60, 50) if night else (110, 40, 40)); c.text(30, 63, 'VACANCY', (255, 60, 50) if night else (110, 40, 40))
    c.outline(); return c
save('rg_motelsign', motelsign(False), 40, 152, foot=(-.9, -.2, .9, 0)); save('rg_motelsign_n', motelsign(True), 40, 152, foot=(-.9, -.2, .9, 0))
def car(body, seed, door=True):
    W, Hh = 136, 66; c = C(W, Hh); gy = Hh - 5; R = ramp(body, spread=.7, sat=.75)
    c.shadow(68, gy - 1, 62, 7, 160)
    # the side panel (front face), the windows and roof seen from a little above, the hood and boot tops
    side = [(8, 34), (128, 34), (130, 50), (6, 50)]
    c.poly(side, lambda x, y: R[4] if y < 37 else R[3] if y < 46 else R[2])
    c.poly([(10, 28), (40, 26), (46, 34), (8, 34)], lambda x, y: R[5])            # boot top
    c.poly([(92, 26), (126, 29), (128, 34), (86, 34)], lambda x, y: R[5])         # hood top
    c.poly([(42, 12), (88, 12), (96, 26), (34, 26)], lambda x, y: R[4] if y < 14 else R[3])   # the roof pillars
    c.poly([(44, 14), (64, 14), (64, 26), (38, 26)], lambda x, y: (52, 60, 70) if H(x, y, seed) > .15 else (150, 160, 170))   # rear window
    c.poly([(67, 14), (86, 14), (93, 26), (67, 26)], lambda x, y: (40, 46, 54))   # front window, smashed
    for k in range(6):
        a = H(k, seed, 5) * 6.28; c.line(78, 20, 78 + math.cos(a) * 8, 20 + math.sin(a) * 5, (200, 210, 214))
    c.rect(34, 26, 96, 27, R[1])
    c.rect(65, 27, 66, 48, R[1])   # the door seam
    if not door: c.poly([(66, 28), (94, 28), (96, 47), (66, 47)], lambda x, y: (30, 28, 30) if y < 40 else (60, 50, 46))
    # rust: blooms along the sills and wheel arches
    for k in range(260):
        x = 8 + H(k, seed) * 120; y = 36 + H(k, seed, 2) * 14
        if H(k, seed, 3) < .55 or y > 44 or x < 30 or x > 104:
            q = c.get(int(x), int(y))
            if q[3]: c.p(x, y, RUST[2 + int(H(k, seed, 4) * 3)])
    # wheels: the near ones flat on their rims, grass growing through
    for wx in (30, 106):
        c.ellipse(wx, 50, 11, 9, lambda x, y, d: (22, 22, 26) if d > .38 else (70, 66, 64) if d > .2 else (40, 38, 38))
        c.rect(wx - 12, 55, wx + 12, 58, (24, 24, 28))
        c.ellipse(wx, 46, 13, 7, lambda x, y, d: None if y > 46 else (16, 14, 16) if d > .6 else None)
    c.rect(124, 38, 128, 42, (230, 220, 180) if seed % 2 else (60, 60, 60)); c.rect(6, 38, 9, 41, (140, 40, 30))
    for k, x in enumerate((18, 44, 96, 118)):
        for b in range(5):
            h = 4 + H(k, b, seed) * 5; lean = (b - 2) * .5
            for j in range(int(h)): c.p(x + b * 1.4 - 3 + lean * j / h * 2, gy + 1 - j, MOSS[2 + (j > 1) + (b % 2)])
    c.outline(); return c
for n, col, sd, dr in (('a', '#4a6a9a', 1, True), ('b', '#7a8a4a', 2, False), ('c', '#8a3a3a', 3, True)):
    save('rg_car_' + n, car(col, sd, dr), 68, 61, foot=(-1.9, -.5, 1.9, 0))
def countysign():
    W, Hh = 96, 92; c = C(W, Hh); gy = Hh - 4; c.shadow(48, gy, 30, 3)
    for x in (22, 70): c.rect(x, 30, x + 3, gy, lambda xx, y: WOOD[5] if xx == x else WOOD[3] if xx < x + 3 else WOOD[1])
    c.rect(4, 4, 91, 44, (30, 96, 60)); c.rect(4, 4, 91, 4, (70, 140, 96)); c.rect(4, 44, 91, 45, (16, 54, 34))
    c.rect(6, 6, 89, 42, lambda x, y: (240, 240, 230) if x in (6, 89) or y in (6, 42) else (30, 96, 60))
    c.text(48 - tw('LEAVING', 2) // 2, 10, 'LEAVING', (240, 240, 230), 2)
    c.text(48 - tw('MARROW COUNTY') // 2, 24, 'MARROW COUNTY', (240, 240, 230))
    c.text(48 - tw('LINE') // 2, 32, 'LINE', (240, 240, 230))
    c.rect(18, 52, 77, 66, WHITE[3]); c.rect(18, 52, 77, 52, WHITE[5]); c.rect(18, 66, 77, 66, WHITE[1])
    c.text(48 - tw('COME BACK') // 2, 54, 'COME BACK', (40, 40, 40)); c.text(48 - tw('SOON') // 2, 60, 'SOON', (40, 40, 40))
    for x0, L in ((24, 9), (71, 6)):   # something has run down it
        for j in range(L): c.p(x0, 53 + j, (120, 26, 22)); c.p(x0 + 1, 53 + j // 2, (140, 34, 28))
    c.outline(); return c
save('rg_countysign', countysign(), 48, 88, foot=(-1.4, -.2, 1.4, 0))

# ======================================================================== Greyfield Home for Children
def home():
    W, Hh = 404, 300; c = C(W, Hh); gy = Hh - 5; L, Rr = 12, W - 13; top = 130
    c.shadow(W / 2, gy, W / 2 - 6, 8, 140)
    # the hipped slate roof: a trapezoid seen from above, slates in rows, moss in the gutters
    c.poly([(L - 4, top), (Rr + 4, top), (Rr - 50, top - 66), (L + 50, top - 66)],
           lambda x, y: SLATE[4] if (y - top) % 6 == 0 else SLATE[3] if H(x // 5, y // 6) > .25 else SLATE[2])
    for k in range(60):
        x = L + H(k, 4) * (Rr - L); c.p(x, top - 1 - H(k, 5) * 3, MOSS[3])
    for x in (L + 70, Rr - 80):   # chimneys
        c.rect(x, top - 96, x + 16, top - 58, lambda xx, y: BRICK[4] if xx < x + 4 else BRICK[3] if (y // 4 + xx // 8) % 2 else BRICK[2]); c.rect(x - 2, top - 98, x + 18, top - 95, STONE[4])
    # the brick front: three floors, a stone band between them
    def brick(x, y):
        row = y // 4; off = 4 if row % 2 else 0; m = (x + off) % 9 == 0 or y % 4 == 0
        base = BRICK[3] if H((x + off) // 9, row, 3) > .3 else BRICK[2]
        return BRICK[1] if m else base
    c.rect(L, top, Rr, gy - 4, brick)
    for y in (top + 52, top + 104): c.rect(L, y, Rr, y + 3, lambda x, yy: STONE[5] if yy == y else STONE[3])
    c.rect(L, top, Rr, top + 2, STONE[2])   # eaves shade
    # the windows: tall, arched, three rows; some broken, some boarded, one with a small face
    for row in range(3):
        for col in range(10):
            if 4 <= col <= 5: continue
            x0 = L + 14 + col * 38; y0 = top + 12 + row * 52; w, h = 16, 30
            c.rect(x0 - 2, y0 - 3, x0 + w + 1, y0 + h + 2, STONE[3]); c.rect(x0 - 2, y0 + h + 1, x0 + w + 1, y0 + h + 2, STONE[5])
            k = H(row, col, 11)
            glass = lambda x, y: (34, 38, 46) if (x + y) % 7 else (64, 72, 84)
            c.rect(x0, y0, x0 + w - 1, y0 + h - 1, glass); c.ellipse(x0 + w / 2, y0, w / 2, 5, lambda x, y, d: (34, 38, 46) if y <= y0 else None)
            c.rect(x0 + w // 2 - 1, y0, x0 + w // 2, y0 + h - 1, WHITE[2]); c.rect(x0, y0 + h // 2, x0 + w - 1, y0 + h // 2, WHITE[2])
            if k < .3:   # broken: black holes with shards
                c.poly([(x0 + 2, y0 + 4), (x0 + 12, y0 + 2), (x0 + 9, y0 + 14), (x0 + 3, y0 + 18)], (8, 8, 10))
            elif k < .52:   # boarded over
                for j in range(4): c.rect(x0 - 3, y0 + 3 + j * 7, x0 + w + 2, y0 + 7 + j * 7, lambda x, y: WOOD[4] if y == y0 + 3 + j * 7 else WOOD[2] if H(x // 4, j) > .3 else WOOD[1])
            if row == 1 and col == 7:   # someone small at the window
                c.ellipse(x0 + 8, y0 + 12, 3.5, 4, lambda x, y, d: (210, 204, 190) if d < .9 else None); c.p(x0 + 7, y0 + 12, (10, 8, 8)); c.p(x0 + 9, y0 + 12, (10, 8, 8))
                c.rect(x0 + 5, y0 + 16, x0 + 11, y0 + 24, (140, 150, 160))
    # ivy up the left end
    for k in range(700):
        x = L + H(k, 21) ** 1.6 * 90; y = gy - 4 - H(k, 22) * (gy - top - 10) * (1 - (x - L) / 100)
        if y > top: c.p(x, y, GREEN[2 + int(H(k, 23) * 3)])
    # the central tower with its stopped clock and steep roof
    tx0, tx1 = W // 2 - 34, W // 2 + 33
    c.poly([(tx0 - 4, top - 60), (tx1 + 4, top - 60), (W // 2, top - 118)], lambda x, y: SLATE[4] if x < W // 2 else SLATE[2])
    c.rect(tx0, top - 60, tx1, gy - 4, brick); c.rect(tx0, top - 60, tx1, top - 57, STONE[4])
    c.ellipse(W // 2, top - 32, 14, 14, lambda x, y, d: STONE[5] if d > .8 else WHITE[4] if d > .1 else IRON[1])
    c.line(W // 2, top - 32, W // 2, top - 43, IRON[1]); c.line(W // 2, top - 32, W // 2 + 2, top - 43, IRON[1])   # both hands at midnight
    for a in range(12): c.p(W // 2 + math.cos(a / 12 * 6.283) * 11, top - 32 + math.sin(a / 12 * 6.283) * 11, IRON[2])
    # the doors under a stone arch, the steps, the carved lintel
    c.rect(W // 2 - 20, gy - 66, W // 2 + 19, gy - 4, STONE[3]); c.ellipse(W // 2, gy - 66, 20, 14, lambda x, y, d: STONE[4] if y < gy - 66 else None)
    c.rect(W // 2 - 14, gy - 58, W // 2 + 13, gy - 8, lambda x, y: DWOOD[3] if x != W // 2 else DWOOD[1]); c.ellipse(W // 2, gy - 58, 14, 10, lambda x, y, d: DWOOD[2] if y < gy - 58 else None)
    c.p(W // 2 - 3, gy - 34, GOLD[3]); c.p(W // 2 + 2, gy - 34, GOLD[3])
    c.rect(W // 2 - 30, gy - 86, W // 2 + 29, gy - 76, STONE[4]); c.text(W // 2 - tw('GREYFIELD') // 2, gy - 84, 'GREYFIELD', STONE[1])
    for j in range(3): c.rect(W // 2 - 26 + j * 3, gy - 7 + j * 2 - 4, W // 2 + 25 - j * 3, gy - 6 + j * 2 - 4, STONE[4] if j % 2 else STONE[3])
    c.darken(L, gy - 6, Rr, gy - 4, .7)
    c.outline(); return c
save('rg_home', home(), 202, 295, foot=(-6.0, -4.4, 6.0, 0))
def iron_h():
    c = C(72, 40); gy = 37
    for x in range(0, 66, 5):
        c.rect(x + 1, 8, x + 2, gy, lambda xx, y: IRON[5] if xx == x + 1 else IRON[2]); c.p(x + 1, 6, IRON[4]); c.p(x + 2, 6, IRON[3]); c.p(x + 1, 7, IRON[4]); c.p(x + 2, 7, IRON[2]); c.p(x + 1, 5, IRON[5])
    for y in (12, 31): c.rect(0, y, 66, y + 1, lambda x, yy: IRON[4] if yy == y else IRON[1])
    for k in range(14): c.p(H(k, 1) * 66, 12 + H(k, 2) * 20, RUST[3])
    c.outline(); return c
save('rgiron_h', iron_h(), 0, 37)
def iron_v():
    c = C(14, 68); gy = 66
    for y in range(18, gy, 4):
        c.rect(6, y - 12, 7, y, lambda x, yy: IRON[5] if x == 6 else IRON[2]); c.p(6, y - 14, IRON[4]); c.p(7, y - 13, IRON[3])
    c.rect(5, 20, 8, 21, IRON[3]); c.rect(5, 50, 8, 51, IRON[3])
    c.outline(); return c
save('rgiron_v', iron_v(), 7, 66)
def gate():
    W, Hh = 128, 104; c = C(W, Hh); gy = Hh - 4; c.shadow(64, gy, 58, 4)
    def brickp(x, y):
        row = y // 3; off = 3 if row % 2 else 0
        return BRICK[1] if (x + off) % 7 == 0 or y % 3 == 0 else BRICK[3] if H((x + off) // 7, row) > .4 else BRICK[2]
    for x0 in (4, W - 22):
        c.rect(x0, 30, x0 + 17, gy, brickp); c.rect(x0 - 2, 24, x0 + 19, 30, lambda x, y: STONE[5] if y == 24 else STONE[3])
        c.ellipse(x0 + 8.5, 22, 7, 4, lambda x, y, d: STONE[4] if x < x0 + 9 else STONE[2])
    # the iron arch: GREYFIELD in iron letters
    for x in range(22, W - 22):
        y = 18 - math.sin((x - 22) / (W - 44) * math.pi) * 10; c.p(x, y, IRON[3]); c.p(x, y + 1, IRON[1]); c.p(x, y + 12, IRON[2])
    c.text(W // 2 - tw('GREYFIELD') // 2, 10, 'GREYFIELD', IRON[3])
    # the left leaf shut, the right leaf hanging open on one hinge, askew
    for x in range(23, 63, 4):
        c.rect(x, 38, x + 1, gy - 1, lambda xx, y: IRON[5] if xx == x else IRON[2]); c.p(x, 36, IRON[4]); c.p(x + 1, 37, IRON[3])
    for y in (44, 80): c.rect(23, y, 62, y + 1, IRON[3])
    for i in range(10):
        x = 66 + i * 4; sk = i * 1.6
        c.line(x, 40 + sk, x + 1, gy - 2, IRON[3]); c.p(x, 38 + sk, IRON[4])
    c.line(66, 46, 104, 60, IRON[3]); c.line(66, 82, 104, 96, IRON[3])
    c.outline(); return c
save('rg_gate', gate(), 64, 100, foot=(-1.9, -.4, 1.9, 0))
for i in range(3):
    c = C(22, 34); gy = 31; c.shadow(11, gy, 6, 2)
    lean = (-1.5, 0, 2)[i]
    for y in range(6, gy):
        x = 11 + lean * (gy - y) / 25; c.p(x - 1, y, IRON[4]); c.p(x, y, IRON[2])
    yb = 11; xb = 11 + lean * (gy - yb) / 25
    for y in range(6, gy):
        x = 11 + lean * (gy - y) / 25; c.p(x + 1, y, IRON[1])
    c.rect(xb - 6, yb, xb + 6, yb + 1, IRON[4]); c.rect(xb - 6, yb + 2, xb + 6, yb + 2, IRON[1])
    c.ellipse(xb + .5, yb + 1, 3.2, 3.2, lambda x, y, d: IRON[5] if d > .55 and y < yb + 1 else IRON[3] if d > .55 else (120, 116, 108))
    c.p(xb, yb, IRON[1]); c.p(xb + 1, yb + 2, IRON[1]); c.p(xb - 1, yb + 2, RUST[3]); c.p(xb - 5, yb + 1, RUST[3])
    for k in range(5): c.p(8 + H(k, i) * 7, gy - H(k, i, 2) * 3, MOSS[3])
    c.outline(); save(f'rg_marker_{i}', c, 11, 31, foot=(-.25, -.15, .25, 0))
def swing():
    W, Hh = 100, 84; c = C(W, Hh); gy = Hh - 4; c.shadow(50, gy, 44, 4)
    for x0, x1 in ((10, 22), (90, 78)):
        c.line(x0, gy, x1, 10, IRON[3]); c.line(x0 + 1, gy, x1 + 1, 10, IRON[1]); c.line(x0 + 14 if x0 < 50 else x0 - 14, gy, x1, 10, IRON[2])
    c.rect(20, 8, 80, 10, lambda x, y: IRON[4] if y == 8 else RUST[2])
    for x in (36, 38, 58, 60):
        for y in range(11, 60): c.p(x + (y % 3 == 0) * 0, y, IRON[2] if y % 2 else IRON[4])
    c.rect(34, 60, 40, 62, WOOD[3]); c.rect(34, 60, 40, 60, WOOD[5])
    c.line(58, 11, 64, 66, IRON[3]); c.rect(58, 66, 66, 68, WOOD[2])   # the other hangs by one chain
    c.outline(); return c
save('rg_swing', swing(), 50, 80, foot=(-1.4, -.3, 1.4, 0))

# ======================================================================== The Fen
def hut():
    W, Hh = 156, 140; c = C(W, Hh); gy = Hh - 6
    c.shadow(78, gy, 68, 7, 130)
    for x in (18, 46, 108, 136):   # the stilts, standing in black water
        c.rect(x, 96, x + 4, gy + 1, lambda xx, y: DWOOD[4] if xx == x else DWOOD[2]); c.rect(x - 1, gy - 1, x + 5, gy, (20, 24, 22))
    c.line(20, 100, 48, 128, DWOOD[2], 2); c.line(110, 128, 138, 100, DWOOD[2], 2)
    # the plank platform and its front edge
    c.rect(8, 88, W - 9, 96, lambda x, y: WOOD[4] if y == 88 else WOOD[3] if (x // 7) % 2 else WOOD[2])
    c.rect(8, 95, W - 9, 97, WOOD[1])
    # the walls: weathered vertical planks
    c.rect(22, 44, W - 23, 88, lambda x, y: (DWOOD[1] if (x - 22) % 8 == 0 else DWOOD[4] if (x - 22) % 8 == 1 else DWOOD[3] if H(x // 8, y // 20) > .3 else DWOOD[2]))
    c.darken(22, 44, W - 23, 50, .65)
    # the sod roof: turf seen from above, overhanging, grass hanging off the eave
    c.poly([(12, 46), (W - 13, 46), (W - 30, 12), (30, 12)], lambda x, y: MOSS[4] if H(x // 3, y // 3, 7) > .7 else MOSS[3] if y < 30 else MOSS[2])
    for x in range(12, W - 12):
        for j in range(int(1 + H(x, 3) * 4)): c.p(x, 46 + j, MOSS[2 - (j > 1)])
    c.rect(100, 4, 108, 20, STONE[3]); c.rect(100, 4, 108, 5, STONE[5])   # a stub of a chimney
    # the door, a small window with a candle stub, peat stacked by the wall
    c.rect(60, 58, 80, 88, DWOOD[1]); c.rect(62, 60, 78, 88, lambda x, y: DWOOD[3] if x < 70 else DWOOD[2]); c.p(76, 74, IRON[4])
    c.rect(96, 58, 114, 72, (24, 22, 20)); c.rect(96, 65, 114, 65, DWOOD[4]); c.rect(105, 58, 105, 72, DWOOD[4]); c.rect(100, 66, 101, 70, (230, 220, 190)); c.p(100, 65, (255, 200, 90))
    for j in range(3):
        for i in range(4 - j): c.rect(26 + i * 7 + j * 3, 80 - j * 5, 32 + i * 7 + j * 3, 84 - j * 5, lambda x, y: PEAT[4] if y == 80 - j * 5 else PEAT[2])
    # a ladder down to the bog
    for y in range(97, gy, 5): c.rect(70, y, 80, y + 1, WOOD[3])
    c.rect(69, 96, 70, gy, WOOD[2]); c.rect(80, 96, 81, gy, WOOD[2])
    c.outline(); return c
save('rg_hut', hut(), 78, 134, foot=(-2.3, -2.4, 2.3, 0))
def peat():
    c = C(44, 32); gy = 29; c.shadow(22, gy, 18, 3)
    for j in range(3):
        for i in range(4 - j):
            x0 = 4 + i * 9 + j * 4; y0 = 20 - j * 6
            c.rect(x0, y0, x0 + 8, y0 + 6, lambda x, y: PEAT[5] if y == y0 else PEAT[3] if x < x0 + 6 else PEAT[1])
    c.outline(); return c
save('rg_peat', peat(), 22, 29, foot=(-.6, -.3, .6, 0))
def bogbody():
    W, Hh = 72, 34; c = C(W, Hh); gy = Hh - 4
    c.ellipse(36, 22, 34, 9, lambda x, y, d: (14, 16, 12) if d < .7 else (40, 34, 24))   # the black pool of peat water it lies in
    c.ellipse(36, 22, 30, 7, lambda x, y, d: (24, 28, 22) if H(x, y) > .9 else None)
    # the body, half under: a leather-brown shoulder, a face pressed sideways, a hand up out of the peat
    c.ellipse(26, 20, 13, 5, lambda x, y, d: SKIN[3] if y < 20 else SKIN[2])
    c.ellipse(44, 18, 6, 5, lambda x, y, d: SKIN[4] if x < 44 else SKIN[2])
    c.p(42, 17, (20, 12, 8)); c.p(45, 17, (20, 12, 8)); c.rect(42, 20, 45, 20, (40, 20, 14))
    for k in range(30): c.p(48 + H(k, 1) * 8, 12 + H(k, 2) * 10, (90, 40, 20))   # hair, red with the peat
    c.rect(32, 19, 38, 20, (150, 120, 70)); c.line(38, 19, 41, 15, (150, 120, 70))
    for i, (dx, dy) in enumerate(((0, 0), (2, -3), (3, -7), (4, -10))): c.rect(16 + dx, 14 + dy, 18 + dx, 16 + dy, SKIN[3 + (i % 2)])
    for d in (-2, 0, 2): c.line(20 + d * .5, 4, 21 + d, 1, SKIN[2])
    c.outline((10, 8, 6)); return c
save('rg_bogbody', bogbody(), 36, 28)

# ======================================================================== The Deep Corn
def scare(coat, hat, seed, small=False):
    W, Hh = 44, 76; c = C(W, Hh); gy = Hh - 4; s = .78 if small else 1; c.shadow(22, gy, 9, 2.5)
    c.rect(21, int(gy - 60 * s), 22, gy, lambda x, y: WOOD[4] if x == 21 else WOOD[2])
    cy = gy - 48 * s
    c.rect(4, cy, 39, cy + 2, lambda x, y: WOOD[4] if y == cy else WOOD[2])   # the crossbar
    C2 = ramp(coat, spread=.7, sat=.8)
    c.poly([(12, cy - 2), (31, cy - 2), (33, cy + 26 * s), (10, cy + 26 * s)], lambda x, y: C2[4] if x < 17 else C2[3] if x < 27 else C2[2])
    for x0 in (4, 31):
        c.rect(x0, cy - 2, x0 + 8, cy + 5, lambda x, y: C2[3] if y < cy + 4 else C2[2])
        for k in range(4): c.line(x0 + (0 if x0 < 20 else 8), cy + 1 + k, x0 + (-3 if x0 < 20 else 11), cy + 3 + k * 2, STRAW[3 + k % 2])
    for k in range(5): c.line(14 + k * 4, cy + 26 * s, 13 + k * 4 + H(k, seed) * 4, cy + 26 * s + 6, STRAW[3])
    for k in range(6): c.p(12 + H(k, seed, 4) * 20, cy + 4 + H(k, seed, 5) * 20, C2[1])   # patches and stains
    # the burlap head, stitched mouth, two buttons sewn on for eyes, tied off at the neck
    hy = cy - 12
    c.ellipse(22, hy, 9, 9.5, lambda x, y, d: BURLAP[4] if (x + y) % 3 == 0 and d < .6 else BURLAP[3] if x < 23 else BURLAP[2])
    c.rect(18, hy - 2, 19, hy - 1, (20, 18, 20)); c.rect(25, hy - 2, 26, hy - 1, (20, 18, 20))
    for x in range(17, 28, 2): c.p(x, hy + 4, (40, 24, 20)); c.p(x, hy + 3 + (x % 4 == 1), (40, 24, 20))
    c.rect(17, hy + 8, 27, hy + 9, (120, 90, 50))
    if hat:
        HR = ramp(hat, spread=.6); c.rect(10, hy - 9, 34, hy - 7, HR[3]); c.rect(15, hy - 16, 29, hy - 8, lambda x, y: HR[4] if x < 20 else HR[2]); c.rect(15, hy - 10, 29, hy - 9, (90, 30, 30))
    c.outline(); return c
save('rg_scare_a', scare('#5a6a8a', '#c8a050', 1), 22, 72, foot=(-.3, -.2, .3, 0))
save('rg_scare_b', scare('#7a4a3a', '#4a3a30', 2), 22, 72, foot=(-.3, -.2, .3, 0))
save('rg_scare_c', scare('#b06a8a', None, 3, True), 22, 72, foot=(-.3, -.2, .3, 0))

# ======================================================================== The Drowned Village
def ripple(c, cx, cy, rx):
    for k in range(3):
        r = rx + k * 6
        for a in range(0, 360, 6):
            x = cx + math.cos(math.radians(a)) * r; y = cy + math.sin(math.radians(a)) * r * .28
            if math.sin(math.radians(a)) > -.2 and H(a, k) > .3: c.p(x, y, (190, 210, 214), 200 - k * 50)
def steeple():
    W, Hh = 76, 150; c = C(W, Hh); wl = Hh - 12
    # the belfry: weathered white boards, green with weed below the line the water reached in summer
    c.rect(18, wl - 52, 57, wl, lambda x, y: (WHITE[3] if (y - wl) % 5 else WHITE[1]) if y < wl - 18 else MOSS[2] if H(x, y) > .3 else (60, 74, 54))
    c.rect(18, wl - 52, 22, wl, lambda x, y: WHITE[4] if y < wl - 18 else MOSS[3])
    c.rect(26, wl - 46, 49, wl - 24, (14, 14, 18))   # the louvre opening, and the bell in the dark
    c.ellipse(37.5, wl - 30, 7, 8, lambda x, y, d: (GOLD[2] if x < 37 else GOLD[1]) if y > wl - 36 else None); c.rect(36, wl - 24, 39, wl - 22, GOLD[1])
    for y in range(wl - 46, wl - 24, 4): c.rect(26, y, 49, y, (60, 60, 66))
    c.rect(16, wl - 55, 59, wl - 52, WHITE[4])
    c.poly([(16, wl - 55), (59, wl - 55), (37.5, 6)], lambda x, y: SLATE[4] if x < 37 else SLATE[2])
    c.line(37, 6, 40, 0, IRON[3]); c.line(36, 2, 42, 3, IRON[3])   # the cross, leaning
    c.rect(18, wl - 1, 57, wl + 1, (30, 44, 50))
    ripple(c, 37.5, wl + 2, 22); c.outline(); return c
save('rg_steeple', steeple(), 38, 140)
def roofpeak():
    W, Hh = 120, 56; c = C(W, Hh); wl = Hh - 10
    c.poly([(8, wl), (112, wl), (92, wl - 30), (28, wl - 30)], lambda x, y: (SLATE[3] if (y - wl) % 5 else SLATE[1]) if y < wl - 8 else (60, 76, 60) if H(x, y) > .4 else SLATE[1])
    c.rect(28, wl - 31, 92, wl - 30, SLATE[5])
    c.rect(72, wl - 44, 82, wl - 26, lambda x, y: BRICK[4] if x < 75 else BRICK[2]); c.rect(70, wl - 46, 84, wl - 44, STONE[4])
    for k in range(40): c.p(28 + H(k, 6) * 64, wl - H(k, 7) * 28, (200, 200, 190))   # gull lime
    ripple(c, 60, wl + 1, 48); c.outline(); return c
save('rg_roofpeak', roofpeak(), 60, 46)
def dam():
    W, Hh = 560, 176; c = C(W, Hh); gy = Hh - 6; top = 24; face0 = 40
    c.shadow(W / 2, gy, W / 2 - 4, 7, 120)
    # the top walkway seen from above: slabs, a railing along the near edge
    c.rect(4, top, W - 5, face0, lambda x, y: CONC[5] if y == top else CONC[4] if (x // 24) % 2 else CONC[3])
    for x in range(8, W - 6, 16):
        c.rect(x, top - 12, x + 1, face0 - 2, IRON[3]); c.p(x, top - 13, IRON[4])
    c.rect(4, top - 12, W - 5, top - 11, IRON[4]); c.rect(4, top - 6, W - 5, top - 6, IRON[2])
    # the face: big poured panels with joints, dark streaks running down from every joint, a high-water stain
    def face(x, y):
        k = CONC[3] if H(x // 48, 0) > .4 else CONC[2]
        if y < face0 + 3: k = CONC[1]
        if (x % 48) == 0: return CONC[0]
        st = H(x // 3, 1, 7)
        if st > .86 and y < face0 + 8 + H(x // 3, 2, 9) ** 2 * 110: k = tuple(v * .76 for v in k)
        if (x % 48) in (1, 2) and y < face0 + 30: k = tuple(v * .82 for v in k)
        if 90 < y - face0 < 96: k = tuple(v * .82 for v in k)
        return k
    c.rect(4, face0, W - 5, gy - 2, face)
    # the spillway gate in the middle: water sheeting down white over the lip, a dark slot either side
    sx0, sx1 = W // 2 - 40, W // 2 + 40
    c.rect(sx0 - 6, face0, sx0 - 2, gy - 2, CONC[1]); c.rect(sx1 + 2, face0, sx1 + 6, gy - 2, CONC[4])
    c.rect(sx0, face0, sx1, gy - 2, lambda x, y: (230, 240, 240) if H(x, y // 3) > .55 else (150, 186, 198) if H(x, y // 2, 2) > .3 else (90, 126, 140))
    c.rect(sx0, top, sx1, face0, (60, 90, 104))
    for x in range(sx0 - 10, sx1 + 10):
        for j in range(5): c.p(x, gy - 2 - j, (240, 248, 248) if H(x, j, 4) > .5 else (170, 200, 206))
    # the plaque
    c.rect(80, 70, 168, 92, (112, 86, 50)); c.rect(80, 70, 168, 70, (170, 140, 90)); c.rect(82, 72, 166, 90, (90, 68, 40))
    c.text(124 - tw('MARROW RESERVOIR') // 2, 75, 'MARROW RESERVOIR', (210, 180, 120)); c.text(124 - tw('1931') // 2, 83, '1931', (210, 180, 120))
    c.darken(4, gy - 4, W - 5, gy - 2, .7)
    for k in range(90):
        x = 6 + H(k, 40) * (W - 12)
        if sx0 - 12 < x < sx1 + 12: continue
        for j in range(int(3 + H(k, 41) * 7)): c.p(x + (j % 3 == 2), gy - 1 - j, MOSS[2 + (j < 3)])
    c.outline(); return c
save('rg_dam', dam(), 280, 170, foot=(-8.6, -1.3, 8.6, 0))

# ======================================================================== Pine Ridge
def tower():
    W, Hh = 124, 340; c = C(W, Hh); gy = Hh - 6; cab0, cab1 = 98, 132
    c.shadow(62, gy, 48, 6)
    legs = [((30, gy), (44, cab1), WOOD[2]), ((94, gy), (80, cab1), WOOD[2]), ((22, gy - 6), (40, cab1 - 2), DWOOD[1]), ((102, gy - 6), (84, cab1 - 2), DWOOD[1])]
    for (x0, y0), (x1, y1), col in legs[2:]: c.line(x0, y0, x1, y1, col, 3)
    # cross bracing in bays
    for k in range(5):
        y0 = cab1 + k * (gy - cab1) / 5; y1 = cab1 + (k + 1) * (gy - cab1) / 5
        xl0 = 44 - (44 - 30) * (y0 - cab1) / (gy - cab1); xr0 = 80 + (94 - 80) * (y0 - cab1) / (gy - cab1)
        xl1 = 44 - (44 - 30) * (y1 - cab1) / (gy - cab1); xr1 = 80 + (94 - 80) * (y1 - cab1) / (gy - cab1)
        c.line(xl0, y0, xr1, y1, DWOOD[3]); c.line(xr0, y0, xl1, y1, DWOOD[2]); c.line(xl1, y1, xr1, y1, DWOOD[3])
    # the stair zig-zagging up the middle
    for k in range(8):
        y0 = gy - 8 - k * (gy - cab1 - 10) / 8; y1 = y0 - (gy - cab1 - 10) / 8; d = 1 if k % 2 else -1
        c.line(62 - 12 * d, y0, 62 + 12 * d, y1, WOOD[4], 2); c.line(62 - 12 * d, y0 + 3, 62 + 12 * d, y1 + 3, WOOD[1])
    for (x0, y0), (x1, y1), col in legs[:2]:
        c.line(x0, y0, x1, y1, lambda t: WOOD[4], 3); c.line(x0 + 2, y0, x1 + 2, y1, WOOD[2])
    # the cab: windows all round, a catwalk with a railing, a pyramid roof
    c.rect(24, cab1 - 4, 100, cab1, lambda x, y: WOOD[4] if y == cab1 - 4 else WOOD[2])
    for x in range(24, 101, 6): c.rect(x, cab1 - 16, x, cab1 - 4, WOOD[3])
    c.rect(24, cab1 - 17, 100, cab1 - 16, WOOD[4])
    c.rect(32, cab0, 92, cab1 - 5, lambda x, y: WOOD[3] if x < 40 else WOOD[2])
    for i in range(4):
        x0 = 35 + i * 14; c.rect(x0, cab0 + 4, x0 + 10, cab0 + 22, lambda x, y: (150, 176, 196) if y < cab0 + 9 else (40, 50, 64))
    c.poly([(26, cab0 + 1), (98, cab0 + 1), (62, cab0 - 30)], lambda x, y: SLATE[4] if x < 62 else SLATE[2])
    c.rect(61, cab0 - 38, 62, cab0 - 29, IRON[3])
    c.outline(); return c
save('rg_tower', tower(), 62, 334, foot=(-1.1, -1.2, 1.1, 0))
def logcabin():
    W, Hh = 168, 138; c = C(W, Hh); gy = Hh - 5; c.shadow(84, gy, 76, 6)
    c.poly([(6, 66), (W - 7, 66), (W - 34, 14), (34, 14)], lambda x, y: (DWOOD[2] if (y - 14) % 5 == 0 else WOOD[2] if H(x // 6, y // 5) > .4 else DWOOD[3]))
    c.rect(34, 13, W - 35, 15, DWOOD[4])
    c.rect(118, 0, 126, 26, IRON[2]); c.rect(116, 0, 128, 2, IRON[4])
    for j in range(10):
        y0 = 66 + j * 6
        c.rect(14, y0, W - 15, y0 + 5, lambda x, y: WOOD[4] if y == y0 + 1 else WOOD[3] if y < y0 + 4 else WOOD[1])
        for x0 in (9, W - 20): c.ellipse(x0 + 5, y0 + 3, 5, 3.2, lambda x, y, d: WOOD[5] if d < .3 else WOOD[3] if d < .7 else DWOOD[2])
    c.darken(14, 66, W - 15, 72, .7)
    c.rect(70, 82, 96, gy - 4, DWOOD[1]); c.rect(72, 84, 94, gy - 4, lambda x, y: DWOOD[3] if x < 83 else DWOOD[2])
    c.rect(28, 84, 54, 104, (40, 44, 50)); c.rect(28, 84, 54, 85, WOOD[5]); c.rect(41, 84, 41, 104, WOOD[3]); c.rect(28, 94, 54, 94, WOOD[3])
    c.rect(112, 84, 138, 104, (40, 44, 50)); c.rect(112, 84, 138, 85, WOOD[5]); c.rect(125, 84, 125, 104, WOOD[3])
    c.rect(108, 106, 140, 110, (30, 96, 60)); c.text(110, 107, 'RANGER', (230, 230, 220))
    c.outline(); return c
save('rg_logcabin', logcabin(), 84, 133, foot=(-2.5, -2.6, 2.5, 0))
def outcrop():
    W, Hh = 128, 76; c = C(W, Hh); gy = Hh - 5; c.shadow(64, gy, 60, 6)
    G = ramp('#8a8a90', spread=.7)
    rocks = [(30, 50, 26, 22), (70, 44, 34, 30), (104, 54, 20, 16), (52, 60, 22, 12)]
    for cx, cy, rx, ry in rocks:
        c.ellipse(cx, cy, rx, ry, lambda x, y, d, cx=cx, cy=cy, ry=ry: (G[5] if d < .25 and y < cy else G[4] if y < cy - ry * .3 else G[3] if x < cx else G[2]) if not (H(x // 2, y // 2, cx) > .93) else G[1])
        c.line(cx - rx * .4, cy - ry * .2, cx + rx * .1, cy + ry * .5, G[1])
        for k in range(30): c.p(cx - rx + H(k, cx) * rx * 2, cy - ry * .9 + H(k, cy) * ry * .5, MOSS[3] if H(k, 3) > .5 else (170, 180, 120))
    c.outline(); return c
save('rg_outcrop', outcrop(), 64, 71, foot=(-1.9, -1.0, 1.9, 0))

# ======================================================================== Old Marrow
def chapel():
    W, Hh = 336, 230; c = C(W, Hh); gy = Hh - 6; L, Rr = 14, W - 15; wt = 110
    c.shadow(W / 2, gy, W / 2 - 8, 8, 140)
    def stone(x, y):
        row = y // 7; off = 6 if row % 2 else 0; m = (x + off) % 13 == 0 or y % 7 == 0
        k = STONE[3] if H((x + off) // 13, row, 2) > .35 else STONE[2]
        soot = max(0, 1 - (y - 40) / 140)
        k = tuple(v * (1 - .65 * soot * (.6 + .4 * H(x // 5, 3))) for v in k)
        return STONE[0] if m else k
    # the back wall seen over the gap where the roof was: darker, the inside of the far wall
    for x in range(L + 10, Rr - 40):
        t0 = 44 + int(16 * abs(math.sin(x * .017 + 1.3))) + int(H(x // 6, 4) * 8)
        for y in range(t0, wt + 20): c.p(x, y, tuple(v * .7 for v in stone(x, y)))
        c.p(x, t0, STONE[3])
    # charred rafters still standing against the sky, at angles
    for k in range(9):
        x = L + 22 + k * 28; a = (H(k, 1) - .5) * .5
        x2 = x + 50 * math.sin(.7 + a); y2 = 20 + H(k, 3) * 24; c.line(x, wt + 4, x2, y2, CHAR[3], 3); c.line(x + 2, wt + 4, x2 + 2, y2, CHAR[1])
    c.line(L + 30, 34, Rr - 70, 30, CHAR[2], 3); c.line(L + 30, 37, Rr - 70, 33, CHAR[0])
    # the front wall, broken off jaggedly; empty pointed windows, soot above every one
    topy = lambda x: wt - 30 + int(30 * abs(math.sin(x * .021))) + int(H(x // 5, 9) * 10) - (40 if x > Rr - 60 else 0)
    for x in range(L, Rr + 1):
        for y in range(max(0, topy(x)), gy - 3): c.p(x, y, stone(x, y))
        c.p(x, topy(x), STONE[5]); c.p(x, topy(x) + 1, STONE[4])
    for i in range(5):
        x0 = L + 26 + i * 50
        if x0 + 18 > Rr - 64: continue
        y0 = wt + 20
        c.rect(x0, y0, x0 + 17, y0 + 50, (10, 9, 10)); c.poly([(x0, y0), (x0 + 17, y0), (x0 + 8.5, y0 - 14)], (10, 9, 10))
        for y in range(y0 - 40, y0 - 14):
            for x in range(x0 - 2, x0 + 20):
                q = c.get(x, y)
                if q[3] and H(x, y, 5) > (y0 - y) / 40: c.p(x, y, (q[0] * .35, q[1] * .35, q[2] * .35))
    # the tower stump at the right end, with the doorway under it
    c.rect(Rr - 58, 26, Rr, gy - 3, stone); c.rect(Rr - 60, 22, Rr + 2, 27, lambda x, y: STONE[5] if y == 22 else STONE[3])
    for x in range(Rr - 60, Rr + 3, 4): c.rect(x, 18 - int(H(x, 2) * 6), x + 2, 22, STONE[4])
    c.rect(Rr - 40, gy - 60, Rr - 18, gy - 3, (12, 10, 10)); c.ellipse(Rr - 29, gy - 60, 11, 9, lambda x, y, d: (12, 10, 10) if y < gy - 60 else None)
    c.ellipse(Rr - 29, 60, 12, 12, lambda x, y, d: (10, 9, 10) if d < .7 else STONE[4] if d < .85 else None)   # the empty rose window
    # rubble along the foot, charred beams in it
    for k in range(90):
        x = L + H(k, 30) * (Rr - L); y = gy - 2 - H(k, 31) * 9; r = 2 + H(k, 32) * 4
        c.ellipse(x, y, r, r * .7, lambda xx, yy, d: STONE[4] if yy < y else STONE[2])
    for k in range(6): c.line(L + 20 + k * 52, gy - 4, L + 46 + k * 52, gy - 10 - H(k, 4) * 8, CHAR[2], 3)
    c.outline(); return c
save('rg_chapel', chapel(), 168, 224, foot=(-4.9, -3.4, 4.9, 0))
def chimney():
    W, Hh = 56, 118; c = C(W, Hh); gy = Hh - 5; c.shadow(28, gy, 24, 4)
    for k in range(30):   # the heap of ash and fallen stone round its foot
        x = 6 + H(k, 1) * 44; r = 2 + H(k, 2) * 4; c.ellipse(x, gy - 2 - H(k, 3) * 4, r, r * .6, lambda xx, yy, d: (CHAR[3] if k % 3 else STONE[3]))
    def st(x, y):
        row = y // 6; off = 4 if row % 2 else 0
        k = STONE[4] if x < 22 else STONE[3] if x < 32 else STONE[2]
        if (x + off) % 9 == 0 or y % 6 == 0: k = STONE[1]
        soot = max(0, 1 - (y - 6) / 60) * .7 + (.3 if y < 30 else 0)
        return tuple(v * (1 - soot * .6) for v in k)
    c.rect(18, 6, 37, gy - 30, st); c.rect(10, gy - 34, 45, gy - 4, st)
    c.rect(16, 3, 39, 7, lambda x, y: STONE[5] if y == 3 else STONE[2])
    c.rect(18, gy - 22, 37, gy - 4, (10, 8, 8)); c.ellipse(27.5, gy - 22, 9.5, 5, lambda x, y, d: (10, 8, 8) if y < gy - 22 else None)
    for k in range(5): c.p(22 + H(k, 9) * 12, gy - 6 - H(k, 8) * 4, (200, 70, 30))   # it is still warm, somehow
    c.line(4, gy - 12, 18, gy - 26, CHAR[2], 3)
    c.outline(); return c
save('rg_chimney', chimney(), 28, 113, foot=(-.8, -.6, .8, 0))
def burnt(seed, W=76, Hh=128):
    c = C(W, Hh); gy = Hh - 5; cx = W // 2; c.shadow(cx, gy, 12, 3)
    def branch(x, y, a, L, w, d):
        if d > 5 or L < 4: return
        x2 = x + math.cos(a) * L; y2 = y - math.sin(a) * L
        for i in range(int(L * 2) + 1):
            t = i / (L * 2); xx = x + (x2 - x) * t; yy = y + (y2 - y) * t; ww = max(1, w * (1 - t * .4))
            for k in range(-int(ww), int(ww) + 1): c.p(xx + k, yy, CHAR[4] if k < -ww / 2 else CHAR[2] if k < ww / 2 else CHAR[1])
        n = 2 if H(d, seed, int(L)) > .3 else 1
        for j in range(n):
            branch(x2, y2, a + (H(j, d, seed + int(x)) - .5) * 1.4 + (.5 if j else -.3), L * (.62 + H(j, seed, d) * .2), w * .65, d + 1)
        if H(d, seed, 3) > .7: c.line(x2, y2, x2 + (H(d, 2) - .5) * 6, y2 - 4, CHAR[3])
    for k in range(-4, 5):
        for y in range(gy - 50, gy): c.p(cx + k * (1 + (gy - y) / 70), y, CHAR[4] if k < -1 else CHAR[2] if k < 2 else CHAR[1])
    for k in range(10):   # the bark split and grey with ash, a few cracks still red
        y = gy - 6 - H(k, seed) * 44; x = cx - 3 + H(k, seed, 2) * 6
        c.p(x, y, (190, 70, 30) if H(k, seed, 3) > .75 else (120, 116, 110))
    branch(cx, gy - 50, math.pi / 2 + (H(seed, 1) - .5) * .4, 26, 3.4, 0)
    c.outline((8, 6, 6)); return c
save('rg_burnt_a', burnt(1), 38, 123, foot=(-.3, -.2, .3, .1))
save('rg_burnt_b', burnt(4, 70, 110), 35, 105, foot=(-.3, -.2, .3, .1))
def oldwell():
    c = C(64, 48); gy = 44; c.shadow(32, gy - 2, 28, 5)
    c.ellipse(32, 30, 24, 12, lambda x, y, d: STONE[2] if y > 30 else None)
    c.rect(8, 22, 56, 36, lambda x, y: (STONE[3] if ((x + (y // 5) * 4) // 8) % 2 else STONE[2]) if y > 24 else STONE[4])
    c.ellipse(32, 22, 24, 9, lambda x, y, d: STONE[5] if d > .55 else None)
    c.ellipse(32, 22, 18, 6, lambda x, y, d: (8, 8, 10))
    for k in range(4): c.p(24 + k * 5, 22 + (k % 2), (40, 70, 80))   # far down, water, and something pale in it
    c.p(31, 23, (200, 196, 180)); c.p(32, 23, (200, 196, 180))
    c.darken(8, 22, 56, 36, .55); c.line(50, 40, 62, 26, DWOOD[2], 2)
    c.outline(); return c
save('rg_oldwell', oldwell(), 32, 42, foot=(-.8, -.5, .8, 0))

# ======================================================================== The Weeping Birches
def dolltree(seed, W=96, Hh=176):
    c = C(W, Hh); gy = Hh - 5; cx = W // 2; c.shadow(cx, gy, 13, 3)
    hooks = []
    def branch(x, y, a, L, w, d):
        if d > 4 or L < 5: return
        x2 = x + math.cos(a) * L; y2 = y - math.sin(a) * L
        for i in range(int(L * 2) + 1):
            t = i / (L * 2); xx = x + (x2 - x) * t; yy = y + (y2 - y) * t; ww = max(1, w * (1 - t * .3))
            for k in range(-int(ww), int(ww) + 1): c.p(xx + k, yy, BIRCH[5] if k < 0 else BIRCH[3])
        if d >= 1 and abs(math.cos(a)) > .3: hooks.append((x + (x2 - x) * .6, y + (y2 - y) * .6))
        for j in range(2): branch(x2, y2, a + (-.5 if j else .45) + (H(j, d, seed) - .5) * .5, L * .7, w * .62, d + 1)
    for y in range(gy - 92, gy):
        for k in range(-3, 4):
            col = BIRCH[5] if k < -1 else BIRCH[4] if k < 2 else BIRCH[2]
            if H(y // 3, seed, 1) > .82 and -2 <= k <= 2 and (y // 3) % 2: col = (34, 30, 30)
            c.p(cx + k, y, col)
    branch(cx, gy - 92, math.pi / 2, 30, 2.6, 0)
    for k in range(40):   # a few leaves still on
        x = cx - 30 + H(k, seed, 3) * 60; y = 20 + H(k, seed, 4) * 70
        if c.get(int(x), int(y))[3] == 0: c.p(x, y, LEAFY[3 + (k % 3)])
    # the dolls: cloth bodies on strings, button eyes, each a different faded dress
    cols = ['#9a6a7a', '#6a7a9a', '#b8a070', '#8a9a7a', '#a87060', '#c8c0b0']
    for i, (hx, hy) in enumerate(hooks[:9]):
        if H(i, seed, 9) < .25: continue
        L = 6 + H(i, seed, 8) * 12; dx, dy = hx, hy + L
        c.line(hx, hy, dx, dy, (200, 190, 170)); D = ramp(cols[i % len(cols)], spread=.6)
        c.ellipse(dx, dy + 3, 3, 3, lambda x, y, d: (220, 206, 186) if x < dx + 1 else (186, 170, 150))
        c.p(dx - 1, dy + 3, (10, 10, 12)); c.p(dx + 1, dy + 3, (10, 10, 12))
        c.poly([(dx - 2, dy + 6), (dx + 2, dy + 6), (dx + 4, dy + 14), (dx - 4, dy + 14)], lambda x, y: D[4] if x < dx else D[2])
        c.rect(dx - 2, dy + 14, dx - 1, dy + 16, (200, 186, 166)); c.rect(dx + 1, dy + 14, dx + 2, dy + 16, (200, 186, 166))
    c.outline(); return c
save('rg_dolltree_a', dolltree(1), 48, 171, foot=(-.25, -.2, .25, .1))
save('rg_dolltree_b', dolltree(7), 48, 171, foot=(-.25, -.2, .25, .1))
def den():
    W, Hh = 88, 62; c = C(W, Hh); gy = Hh - 4; c.shadow(44, gy, 38, 5)
    B2 = ramp('#8a6a9a', spread=.6)
    c.poly([(10, gy - 2), (78, gy - 2), (60, 10), (30, 10)], lambda x, y: B2[3] if x < 44 else B2[2])   # a faded blanket over the poles
    for k in range(6): c.line(12 + k * 13, gy - 1, 34 + k * 5, 6, BIRCH[4 if k % 2 else 3], 2)
    c.poly([(34, gy - 2), (54, gy - 2), (48, 30), (40, 30)], (14, 12, 14))
    for x0 in (60, 66): c.rect(x0, gy - 5, x0 + 3, gy - 2, WHITE[4]); c.p(x0 + 4, gy - 4, WHITE[3])   # two teacups set out
    c.ellipse(44, gy - 8, 2.5, 2.5, (220, 206, 186)); c.rect(42, gy - 6, 46, gy - 2, (150, 90, 100))
    c.outline(); return c
save('rg_den', den(), 44, 58, foot=(-1.2, -.8, 1.2, 0))

# ======================================================================== the old county milestones
def mile():
    c = C(30, 50); gy = 46; c.shadow(15, gy, 11, 3)
    c.rect(6, 12, 23, gy - 1, lambda x, y: STONE[4] if x < 10 else STONE[3] if x < 20 else STONE[2])
    c.ellipse(14.5, 12, 8.5, 6, lambda x, y, d: (STONE[5] if x < 14 else STONE[4]) if y <= 12 else None)
    # a carved wheel: rim and six spokes, chalked white
    for a in range(0, 360, 20): c.p(14.5 + math.cos(math.radians(a)) * 5, 22 + math.sin(math.radians(a)) * 5, (230, 226, 210))
    for a in range(0, 360, 60): c.line(14.5, 22, 14.5 + math.cos(math.radians(a)) * 5, 22 + math.sin(math.radians(a)) * 5, (200, 196, 182))
    for k in range(18): c.p(6 + H(k, 1) * 17, gy - 1 - H(k, 2) * 9, MOSS[3 + (k % 2)])
    c.outline(); return c
save('rg_mile', mile(), 15, 46, foot=(-.3, -.25, .3, 0))

# ======================================================================== what the children left (The Count)
def rem(kind):
    c = C(30, 26); gy = 22; c.shadow(15, gy, 10, 2.6, 150)
    if kind == 'shoe':
        R = ramp('#6a3a2a', spread=.7)
        c.poly([(5, gy - 1), (24, gy - 1), (25, gy - 4), (19, gy - 6), (14, gy - 9), (8, gy - 9), (6, gy - 6)], lambda x, y: R[4] if y < gy - 6 else R[3] if x < 18 else R[2])
        c.rect(5, gy - 1, 25, gy, R[1]); c.rect(9, gy - 10, 13, gy - 8, R[5])
        for x in (10, 12): c.p(x, gy - 7, (230, 220, 200))
    elif kind == 'horse':
        R = ramp('#a8743a', spread=.7)
        c.rect(8, gy - 9, 21, gy - 5, lambda x, y: R[4] if y == gy - 9 else R[3]); c.rect(19, gy - 14, 23, gy - 8, lambda x, y: R[4] if x < 21 else R[2]); c.rect(22, gy - 13, 25, gy - 11, R[3])
        for x in (9, 12, 17, 20): c.rect(x, gy - 4, x + 1, gy - 1, R[2])
        c.rect(6, gy - 9, 8, gy - 6, R[1]); c.p(22, gy - 13, (20, 14, 10)); c.rect(4, gy - 1, 26, gy, R[1])
    elif kind == 'slate':
        c.rect(5, gy - 14, 24, gy - 1, lambda x, y: WOOD[4] if x in (5, 6) or y in (gy - 14, gy - 13) else WOOD[2] if x in (23, 24) or y in (gy - 2, gy - 1) else (46, 52, 56))
        for k in range(5): c.rect(9 + k * 3, gy - 10 + (k % 2), 10 + k * 3, gy - 9 + (k % 2), (220, 220, 210))
        c.rect(9, gy - 6, 19, gy - 6, (200, 200, 190))
    elif kind == 'marbles':
        B2 = ramp('#8a6a4a', spread=.6); c.ellipse(11, gy - 5, 6, 5, lambda x, y, d: B2[4] if x < 10 else B2[2]); c.rect(9, gy - 11, 13, gy - 9, B2[1])
        for i, (x, y, col) in enumerate(((19, gy - 3, '#c83a2a'), (23, gy - 2, '#3a6ac8'), (21, gy - 6, '#3a9a5a'), (16, gy - 1, '#e8c040'))):
            Rm = ramp(col, spread=.8); c.ellipse(x, y, 2.2, 2.2, lambda xx, yy, d, Rm=Rm, x=x, y=y: Rm[5] if xx < x and yy < y else Rm[3])
    elif kind == 'cap':
        R = ramp('#3a5a8a', spread=.7); c.ellipse(14, gy - 5, 9, 6, lambda x, y, d: (R[4] if x < 13 else R[3]) if y < gy - 4 else R[2])
        c.poly([(13, gy - 3), (27, gy - 3), (25, gy - 1), (13, gy - 1)], lambda x, y: R[2] if y < gy - 1 else R[1]); c.p(14, gy - 11, R[5])
    elif kind == 'top':
        R = ramp('#c8402a', spread=.7)
        c.poly([(8, gy - 10), (22, gy - 10), (15, gy - 1)], lambda x, y: (R[4] if x < 13 else R[2]) if ((y // 2) % 2) else (GOLD[4] if x < 13 else GOLD[2]))
        c.ellipse(15, gy - 10, 7, 2.2, lambda x, y, d: R[5] if x < 14 else R[3]); c.rect(14, gy - 15, 16, gy - 11, WOOD[3])
    c.outline(); return c
for k in ('shoe', 'horse', 'slate', 'marbles', 'cap', 'top'): save('rem_' + k, rem(k), 15, 22)

# ---- register
d = json.load(open('spr/lpc/objects.json')); d.update(SPR); json.dump(d, open('spr/lpc/objects.json', 'w'))
print(len(SPR), 'sprites:', ' '.join(SPR))
