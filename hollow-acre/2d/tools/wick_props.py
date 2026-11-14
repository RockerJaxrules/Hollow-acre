"""New pixel art, all drawn here by code: Lusk's filling station (kiosk, canopy, two old pumps, price sign) and the bits that
make Wickham a river village (drying racks hung with fish, an upturned rowboat, eel traps, rope, a net frame, a fish stall,
the drowned bell on its plinth, hanging lanterns, boardwalk planks), plus a concrete forecourt and pump island for Pruitt's
garage, tyres and oil drums. Lit from the upper left like everything else, dark outlined. Writes spr/lpc/obj/*.png and
their entries in objects.json."""
import json, math, re, random
from PIL import Image
OBJ = 'spr/lpc/obj/'
_src = open('g2d/craftui.js').read(); _i = _src.index('const PXFONT'); FONT = dict(re.findall(r"'?([A-Z0-9 .])'?\s*:\s*'([01]{15})'", _src[_i:_src.index('};', _i)]))
FONT.setdefault(' ', '0' * 15)
FONT['K'] = '101110100110101'   # a K that doesn't read as an H
OUT = (26, 18, 20)
class C:
    def __init__(s, W, H): s.W, s.H = W, H; s.im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); s.px = s.im.load()
    def p(s, x, y, c, a=255):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < s.W and 0 <= y < s.H:
            if a >= 255 or s.px[x, y][3] == 0: s.px[x, y] = (c[0], c[1], c[2], a)
            else:
                o = s.px[x, y]; t = a / 255; s.px[x, y] = (round(o[0] + (c[0] - o[0]) * t), round(o[1] + (c[1] - o[1]) * t), round(o[2] + (c[2] - o[2]) * t), max(o[3], a))
    def r(s, x, y, w, h, c, a=255):
        for j in range(int(h)):
            for i in range(int(w)): s.p(x + i, y + j, c, a)
    def line(s, x0, y0, x1, y1, c, a=255):
        n = max(1, int(max(abs(x1 - x0), abs(y1 - y0)) * 2))
        for k in range(n + 1): s.p(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, c, a)
    def text(s, x, y, t, c, sh=None):
        for ch in t:
            f = FONT.get(ch, FONT[' '])
            for j in range(5):
                for i in range(3):
                    if f[j * 3 + i] == '1':
                        if sh: s.p(x + i, y + j + 1, sh)
                        s.p(x + i, y + j, c)
            x += 4
    def outline(s, col=OUT):
        W, H = s.W, s.H; a = [[s.px[x, y][3] > 0 for x in range(W)] for y in range(H)]; out = []
        for y in range(H):
            for x in range(W):
                if a[y][x]: continue
                if (x > 0 and a[y][x - 1]) or (x < W - 1 and a[y][x + 1]) or (y > 0 and a[y - 1][x]) or (y < H - 1 and a[y + 1][x]): out.append((x, y))
        for x, y in out: s.px[x, y] = (*col, 255)
    def shadow(s, cx, cy, rx, ry, a=80):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
                if d <= 1 and s.px[x, y][3] == 0 if 0 <= x < s.W and 0 <= y < s.H else False: s.px[x, y] = (12, 16, 10, int(a * (1 - d * .5)))
WOOD = [(58, 36, 22), (92, 60, 36), (128, 88, 54), (160, 116, 74), (192, 148, 100)]
GREY = [(50, 48, 46), (78, 74, 68), (108, 102, 92), (140, 134, 120), (172, 166, 150)]
ROPE = [(90, 66, 36), (136, 104, 60), (180, 146, 92), (214, 186, 130)]
HASH = lambda x, y, s=0: (math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453) % 1
def post(c, x, y0, y1, ramp=WOOD, w=4):
    for y in range(y0, y1):
        for i in range(w): c.p(x + i, y, ramp[[3, 2, 2, 1, 1, 1][min(5, i)] if w > 2 else 2] if not (HASH(x + i, y, 3) < .08) else ramp[1])
SPRITES = {}
def save(name, c, ax=None, ay=None, foot=(-1, -.4, 1, 0), extra=None):
    c.im.save(OBJ + name + '.png'); m = {'src': f'spr/lpc/obj/{name}.png', 'fw': c.W, 'fh': c.H, 'ax': float(c.W / 2 if ax is None else ax), 'ay': float(c.H - 3 if ay is None else ay), 'foot': list(foot)}
    if extra: m.update(extra)
    SPRITES[name] = m; print(name, c.W, c.H)


# ================================================================ depth: the rules every prop here follows
# - seen from the front and a little above: anything with a top shows it (lighter), its front face below (mid tone);
#   round things (posts, drums, tyres, the bell) are shaded across, lit from the upper left with a bright streak near the left;
# - the shading is hue-shifted: shadows drift cool (toward violet), highlights warm (toward gold), never just darker/lighter;
# - the edge where a top meets a front catches a bright line; insets (windows, doors, trays) get a shadow along their top
#   and left inside edges and a light sill;
# - everything sits on the ground: a darker band where it meets the ground and a soft shadow falling down and to the right.
import colorsys
def ramp(hexc, n=6, spread=.95, hs=.06):
    r, g, b = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]; h, s, v = colorsys.rgb_to_hsv(r, g, b); out = []
    for i in range(n):
        t = i / (n - 1) - .55
        tgt = .70 if t < 0 else .12; d = ((tgt - h + .5) % 1) - .5; hh = (h + d * min(1, abs(t) * hs * 6)) % 1
        ss = max(0, min(1, s * (1 - t * .55))); vv = max(0, min(1, v * (1 + t * spread)))
        out.append(tuple(round(c * 255) for c in colorsys.hsv_to_rgb(hh, ss, vv)))
    return out
OUTC = (34, 22, 30)
def ground(c, x0, x1, G, off=4, a=86):
    """the soft shadow on the ground, falling down and to the right of the base"""
    cx, rx = (x0 + x1) / 2 + off, (x1 - x0) / 2 + 3
    for y in range(G - 2, G + 3):
        for x in range(int(cx - rx), int(cx + rx) + 1):
            d = ((x - cx) / rx) ** 2 + ((y - G) / 2.6) ** 2
            if d < 1 and 0 <= x < c.W and 0 <= y < c.H and c.px[x, y][3] == 0: c.px[x, y] = (14, 16, 22, int(a * (1 - d * .6)))
def contact(c, x0, x1, G, k=.72):
    """darken the bottom rows of whatever stands on the ground line, so it sits instead of floating"""
    for x in range(x0, x1):
        for dy, m in ((1, k), (2, .86)):
            y = G - dy
            if 0 <= x < c.W and 0 <= y < c.H:
                p = c.px[x, y]
                if p[3] == 255: c.px[x, y] = (round(p[0] * m), round(p[1] * m), round(p[2] * m), 255)
def box(c, x, y, w, dt, hf, R, grain=0, seed=0, top=None, front=None):
    """a block seen from the front and above: top face (dt rows) over front face (hf rows). R is a 6-tone ramp."""
    for j in range(dt):
        for i in range(w):
            col = R[5] if j == dt - 1 else R[4] if j > 0 else R[3]
            if grain and j not in (0, dt - 1) and HASH(i // grain, j, seed) < .25: col = R[3]
            if top: col = top(i, j, col) or col
            c.p(x + i, y + j, col)
    for j in range(hf):
        for i in range(w):
            u = i / max(1, w - 1); col = R[4] if i == 0 else R[3] if u < .3 else R[2] if u < .85 else R[1]
            if j == hf - 1: col = R[1]
            if grain and HASH((i + j * 3) // grain, j // 2, seed + 1) < .12: col = R[max(0, R.index(col) - 1)]
            if front: col = front(i, j, col) or col
            c.p(x + i, y + dt + j, col)
def cyl(c, cx, ytop, rx, h, R, cap=True, capc=None, ry=None):
    """an upright cylinder: an elliptical top (lighter, rim lit at the front) over a body shaded round, its base curved"""
    ry = ry or max(1, rx * .38)
    for x in range(int(cx - rx), int(cx + rx) + 1):
        u = (x - cx) / rx
        if abs(u) > 1: continue
        k = 0 if -.6 < u < -.3 else 1 if u < -.05 else 2 if u < .4 else 3 if u < .8 else 4
        col = [R[5], R[4], R[3], R[2], R[1]][k]; arc = ry * math.sqrt(max(0, 1 - u * u))
        for y in range(int(ytop + arc), int(ytop + h + arc) + 1): c.p(x, y, col)
    if cap:
        for y in range(int(ytop - ry), int(ytop + ry) + 1):
            for x in range(int(cx - rx), int(cx + rx) + 1):
                d = ((x - cx) / rx) ** 2 + ((y - ytop) / ry) ** 2
                if d <= 1: c.p(x, y, (capc or R[4]) if d < .62 else R[5] if y > ytop else R[3])
def pole(c, x, y0, y1, w, R):
    """a post: square-ish, lit on its left face, shadowed on its right, its top a lighter cap"""
    for y in range(y0, y1):
        for i in range(w):
            col = R[4] if i == 0 else R[3] if i < w * .5 else R[2] if i < w - 1 else R[1]
            if HASH(x + i, y // 3, 9) < .06: col = R[1]
            c.p(x + i, y, col)
    for i in range(w): c.p(x + i, y0, R[5] if i < w - 1 else R[3])
def inset(c, x0, y0, x1, y1, fill, Rframe):
    """a recess (window, door, tray): frame, a shadow inside along its top and left, a light sill under it"""
    for y in range(y0, y1):
        for x in range(x0, x1): c.p(x, y, fill(x - x0, y - y0) if callable(fill) else fill)
    for x in range(x0, x1): c.p(x, y0, (20, 18, 26), 150); c.p(x, y0 + 1, (20, 18, 26), 70)
    for y in range(y0, y1): c.p(x0, y, (20, 18, 26), 110)
    for x in range(x0 - 2, x1 + 2): c.p(x, y0 - 2, Rframe[2]); c.p(x, y0 - 1, Rframe[1]); c.p(x, y1, Rframe[4]); c.p(x, y1 + 1, Rframe[2])
    for y in range(y0 - 2, y1 + 2): c.p(x0 - 2, y, Rframe[3]); c.p(x0 - 1, y, Rframe[2]); c.p(x1, y, Rframe[2]); c.p(x1 + 1, y, Rframe[1])
W_ = ramp('#9a6a40'); WG = ramp('#8a8478'); ST = ramp('#8e9096'); TE = ramp('#2f8c8c'); CR = ramp('#d8d0bc'); RD = ramp('#b8402c'); RB = ramp('#3e3c40'); BRZ = ramp('#8a6a3a'); RP = ramp('#b48c56'); IR = ramp('#4a4a50')

# ---------------------------------------------------------------- the fish drying rack: round poles, a round bar, fish hung in a row
def rack():
    c = C(70, 60); G = 56
    for x in (6, 60): pole(c, x, 10, G, 4, W_)
    for x in range(4, 66):   # the bar, a cylinder lying across
        for j, col in enumerate((W_[5], W_[4], W_[3], W_[2], W_[1])): c.p(x, 10 + j, col)
    for x in (6, 60):
        for k in range(9): c.p(x + 2 + (k // 3 if x == 6 else -k // 3), 15 + k, W_[2])
    FR = ramp('#9a9488')
    for i, x in enumerate(range(14, 58, 7)):
        L = 12 + int(HASH(i, 1) * 5); sw = int(HASH(i, 2) * 2)
        c.line(x + 1, 15, x + 1 + sw, 18, RP[2])
        for j in range(L):
            w = 1 if j < 2 or j > L - 3 else 2; xx = x + sw
            for k in range(-w + 1, w + 1): c.p(xx + k, 18 + j, FR[5] if k < 0 else FR[4] if j < L * .55 else FR[3] if k == 0 else FR[2])
            c.p(xx + w + 1, 18 + j, FR[1]) if j % 3 == 0 and w == 2 else None
        c.p(xx - 1, 18 + L, FR[2]); c.p(xx + 2, 18 + L, FR[2]); c.p(xx, 20, (24, 22, 30))
        for k in range(3): c.p(xx + 6 + k, G - 1, (14, 16, 22), 60)   # each fish's own shadow on the ground
    contact(c, 6, 10, G); contact(c, 60, 64, G); ground(c, 4, 66, G, 5, 60)
    c.outline(OUTC); save('wk_rack', c, foot=(-1, -.3, 1, 0))
# ---------------------------------------------------------------- an upturned rowboat: a round hull, the flat transom at the stern
def boat():
    c = C(80, 36); G = 31; HB = ramp('#3a7888')
    x0, x1 = 6, 76
    for x in range(x0, x1):
        u = (x - x0) / (x1 - x0)
        keel = G - 4 - int(17 * (1 - (2 * u - 1) ** 4) ** .5 if u < .5 else 17 * (1 - ((u - .5) / .5) ** 2.2) ** .5)
        gun = G - 3 - int(6 * (max(0, u - .7) / .3) ** 2)
        for y in range(keel, gun):
            v = (y - keel) / max(1, gun - keel); col = HB[5] if v < .1 else HB[4] if v < .3 else HB[3] if v < .55 else HB[2] if v < .8 else HB[1]
            if (y - keel) % 5 == 4 and .15 < v < .92: col = HB[max(0, HB.index(col) - 1)]
            if HASH(x, y, 2) < .015: col = (176, 168, 148)
            c.p(x, y, col)
        c.p(x, gun, RD[3]); c.p(x, gun + 1, RD[1])
        c.p(x, keel, HB[5]) if 4 < x < x1 - 4 else None
    for y in range(G - 18, G - 2):   # the transom: the flat square stern, in shadow
        for x in range(x0 - 3, x0 + 1): c.p(x, y, HB[1] if x > x0 - 2 else HB[0])
    for x in (16, 54): box(c, x, G - 3, 7, 1, 2, W_)
    contact(c, x0 - 3, x1, G - 1); ground(c, x0, x1, G, 5, 96)
    c.outline(OUTC); save('wk_boat', c, foot=(-1.1, -.4, 1.1, 0))
# ---------------------------------------------------------------- an eel trap: a wicker funnel lying down, hoops round it, its dark mouth
def trap():
    c = C(32, 24); G = 20; WK = ramp('#a88648')
    for x in range(3, 29):
        u = (x - 3) / 25; r = 2.5 + u * 5.5; cy = G - 2 - r
        for y in range(int(cy - r), int(cy + r) + 1):
            v = (y - (cy - r)) / (2 * r); k = 5 if v < .15 else 4 if v < .4 else 3 if v < .65 else 2 if v < .85 else 1
            if (y + x // 2) % 3 == 0: k = max(0, k - 1)
            if x % 7 == 0: k = max(0, k - 2) if v > .5 else min(5, k + 1)
            c.p(x, y, WK[k])
    for y in range(G - 15, G - 1):
        for x in range(25, 30):
            if ((x - 28) / 2.2) ** 2 + ((y - (G - 8)) / 6) ** 2 < 1: c.p(x, y, (26, 20, 14))
    contact(c, 3, 29, G - 1); ground(c, 3, 29, G, 3, 70)
    c.outline(OUTC); save('wk_trap', c, foot=(-.4, -.2, .4, 0))
def rope():
    c = C(26, 16); G = 13
    for a in range(0, 360 * 4, 3):
        t = a / (360 * 4); r = 10.5 - t * 8; an = math.radians(a)
        x = 13 + math.cos(an) * r; y = G - 4 + math.sin(an) * r * .42; up = math.sin(an) < 0
        c.p(x, y, RP[5] if up else RP[3]); c.p(x, y + 1, RP[2] if up else RP[1])
        if a % 12 == 0: c.p(x, y, RP[2])
    for k in range(7): c.p(23 + k * .5, G - 3 + k * .3, RP[3]); c.p(23 + k * .5, G - 2 + k * .3, RP[1])
    c.p(13, G - 4, (40, 30, 18)); c.p(14, G - 4, (40, 30, 18))
    ground(c, 2, 24, G, 2, 70); c.outline(OUTC); save('wk_rope', c, foot=(-.3, -.15, .3, 0))
# ---------------------------------------------------------------- nets hung up to dry: draped in folds, cork floats along the hem
def nets():
    c = C(78, 66); G = 62; NR = ramp('#5a6448')
    for x in (4, 70): pole(c, x, 6, G, 4, WG)
    for x in range(4, 74):
        sag = 1.5 * math.sin((x - 4) / 70 * math.pi); c.p(x, 7 + sag, RP[4]); c.p(x, 8 + sag, RP[2])
    for i in range(0, 62):
        x0 = 9 + i; fold = math.sin(i / 62 * math.pi * 5)   # folds: the net bunches into vertical pleats
        tone = 4 if fold > .5 else 3 if fold > -.2 else 2 if fold > -.7 else 1
        top = 9 + int(1.5 * math.sin(i / 62 * math.pi)); hem = 48 + int(6 * math.sin(i / 62 * math.pi))
        for y in range(top, hem):
            if ((y - top) + i) % 4 == 0 or ((y - top) - i) % 4 == 0: c.p(x0, y, NR[tone])
    for i in range(11, 70, 6):
        hem = 48 + int(6 * math.sin((i - 9) / 62 * math.pi))
        for k, col in enumerate(ramp('#e07a34')[5:1:-1]): c.p(i + (k % 2), hem + k // 2, col)
        c.p(i + 1, hem + 2, ramp('#e07a34')[1])
    for i in range(14, 70, 3): c.p(i + 6, G - 1, (14, 16, 22), 40)   # the net's thin shadow on the ground
    contact(c, 4, 8, G); contact(c, 70, 74, G); ground(c, 4, 74, G, 4, 50)
    c.outline(OUTC); save('wk_nets', c, foot=(-1.1, -.2, 1.1, 0))
# ---------------------------------------------------------------- the fish stall: an awning (its top, its scalloped front, its shadow),
# a table with an ice tray sunk in its top and the catch laid out, a crate of fish below, a chalkboard
def stall():
    c = C(92, 84); G = 80; T = ramp('#2f8c8c'); WH = ramp('#e2ded0'); ICE = ramp('#cfe6ee'); FR = ramp('#98a6ac')
    for x in (6, 82): pole(c, x, 12, G, 4, W_)
    # the awning: its sloping top (lit), then its scalloped front edge in shade
    for x in range(2, 90):
        R = T if ((x - 2) // 8) % 2 == 0 else WH
        for y in range(4, 16): c.p(x, y, R[5] if y < 6 else R[4] if y < 11 else R[3])
        sc = 20 + int(2.5 * abs(math.sin((x - 2) / 8 * math.pi)))
        for y in range(16, sc + 1): c.p(x, y, R[2] if y < sc else R[1])
    for x in range(2, 90): c.p(x, 3, WH[5] if ((x - 2) // 8) % 2 else T[5])
    for y in range(23, 31):   # the awning's shadow across the back of the stall
        for x in range(10, 82): c.p(x, y, (16, 20, 26), 60 - (y - 23) * 6)
    # the table: a block (top 9 rows, front 10), the ice tray sunk into the top
    box(c, 8, 40, 76, 9, 10, W_, grain=6, seed=4)
    inset(c, 13, 41, 79, 47, lambda i, j: ICE[5] if HASH(i // 2, j, 3) > .3 else ICE[4], W_)
    for n, x in enumerate(range(16, 74, 9)):   # the catch, each fish with a lit back and a shadow on the ice
        L = 7 + int(HASH(n, 3) * 3); yy = 42 + (n % 2)
        for k in range(L):
            c.p(x + k, yy, FR[5] if k > 0 else FR[2]); c.p(x + k, yy + 1, FR[3]); c.p(x + k, yy + 2, FR[2]); c.p(x + k + 1, yy + 3, ICE[2])
        c.p(x + L, yy, FR[2]); c.p(x + L, yy + 2, FR[2]); c.p(x + 1, yy + 1, (20, 20, 28))
    for x in (12, 76): pole(c, x, 59, G, 3, W_)
    box(c, 30, 62, 28, 5, 11, W_, grain=7, seed=5, top=lambda i, j, col: FR[4] if 0 < j < 4 and i % 5 in (1, 2, 3) else None)   # a crate of fish
    box(c, 62, 58, 20, 2, 14, ramp('#3a4038'))
    c.text(64, 63, 'FISH', (232, 232, 222), (90, 96, 88))
    contact(c, 6, 86, G); ground(c, 4, 88, G, 6, 92)
    c.outline(OUTC); save('wk_stall', c, foot=(-1.3, -.6, 1.3, 0))
# ---------------------------------------------------------------- the drowned bell: a stone plinth (its top and its coursed front),
# a timber frame, the bell (round, its mouth dark, verdigris where the river ran), candles at its foot
def bell(lit=False):
    c = C(64, 104); G = 100
    box(c, 8, G - 22, 48, 7, 15, ST, top=lambda i, j, col: ST[3] if HASH(i // 4, j, 7) < .2 else None,
        front=lambda i, j, col: ST[0] if j % 5 == 4 or (i + (j // 5) * 6) % 12 == 0 else None)
    for x in (13, 47): pole(c, x, 16, G - 22, 4, W_)
    box(c, 9, 12, 46, 2, 4, W_)
    for k in range(8): c.p(17 + k, 18 + k, W_[2]); c.p(46 - k, 18 + k, W_[2])
    for x in range(22, 42): c.p(x, G - 19, (14, 16, 22), 70)   # the bell's shadow on the plinth top
    for y in range(22, 52):
        u = (y - 22) / 30; w = 6 + 7 * u ** 1.6 + (4 * (u - .8) / .2 if u > .8 else 0) - (1 if u < .12 else 0)
        for x in range(int(32 - w), int(32 + w) + 1):
            v = (x - (32 - w)) / (2 * w); k = 5 if .12 < v < .22 else 4 if v < .38 else 3 if v < .62 else 2 if v < .85 else 1
            col = BRZ[k]
            if HASH(x, y, 7) < .1 + u * .22: col = ramp('#4e927a')[max(1, k - 1)]
            c.p(x, y, col)
    for x in range(17, 48): c.p(x, 52, BRZ[1]); c.p(x, 53, (26, 20, 18)) if 19 < x < 46 else None   # the dark mouth
    box(c, 30, 17, 4, 1, 4, BRZ); c.r(31, 52, 2, 4, BRZ[2])
    for k in range(18): c.p(32 + math.sin(k * .5) * .6, 56 + k, RP[3])
    for k in range(5): c.r(16 + k * 7, G - 9, 4, 1, ST[0])
    for x in (10, 52):
        cyl(c, x + 1, G - 6, 1.5, 4, CR, cap=True)
        if lit:
            c.p(x, G - 9, (255, 200, 90)); c.p(x + 1, G - 9, (255, 214, 120)); c.p(x + 1, G - 10, (255, 240, 170))
            for dy in range(-4, 4):
                for dx in range(-4, 5):
                    if dx * dx + dy * dy < 16: c.p(x + 1 + dx, G - 9 + dy, (255, 190, 90), 50)
        else: c.p(x + 1, G - 8, (40, 30, 24))
    contact(c, 8, 56, G); ground(c, 8, 56, G, 6, 96)
    c.outline(OUTC); save('wk_bell' + ('_n' if lit else ''), c, foot=(-.75, -.5, .75, 0))
# ---------------------------------------------------------------- a lantern hung from a crooked post
def wlamp(lit=False):
    c = C(28, 86); G = 82
    pole(c, 9, 8, G, 4, W_)
    for x in range(9, 24): c.p(x, 8, W_[5]); c.p(x, 9, W_[3]); c.p(x, 10, W_[1])
    for k in range(6): c.p(13 + k, 11 + k, W_[2])
    c.line(22, 11, 22, 14, IR[1])
    for y in range(14, 19):   # the cap: a little roof, its lit slope and its shaded slope
        w = (y - 14) + 1
        for x in range(22 - w, 23 + w): c.p(x, y, IR[4] if x < 22 else IR[2])
    for y in range(19, 30):
        for x in range(17, 28):
            fr = x in (17, 27) or y in (19, 29, 24)
            col = IR[2] if fr else ((255, 220, 130) if lit else (128, 140, 132)) if x < 22 else ((236, 168, 78) if lit else (92, 104, 98))
            if not fr and not lit and x == 18 and y < 24: col = (176, 190, 184)   # a glint on the glass
            c.p(x, y, col)
    for x in range(18, 27): c.p(x, 30, IR[1])
    if lit:
        for dy in range(-8, 9):
            for dx in range(-8, 9):
                if dx * dx + dy * dy < 64: c.p(22 + dx, 24 + dy, (255, 200, 110), int(64 * (1 - (dx * dx + dy * dy) / 64)))
    contact(c, 9, 13, G); ground(c, 7, 15, G, 3, 70)
    c.outline(OUTC); save('wk_lamp' + ('_n' if lit else ''), c, ax=11, foot=(-.1, -.1, .1, .05))
# ---------------------------------------------------------------- a raised boardwalk (lies flat): plank deck, a lit front lip, the beam
# under it, posts, and its shadow on the ground
def walk():
    c = C(96, 26); DK = ramp('#a07446')
    for y in range(0, 15):
        for x in range(96):
            k = x % 7; pl = x // 7; tone = 3 if (pl % 3 == 1) else 4 if (pl % 3 == 0) else 3
            if y < 2: tone -= 1                                    # the far edge, a touch darker
            col = DK[tone]
            if k == 6: col = DK[1]                                 # the gaps between planks
            if HASH(pl, y // 3, 4) < .12 and k in (2, 3): col = DK[max(0, tone - 1)]   # grain
            if y in (3, 11) and k in (1, 4): col = (66, 58, 60)    # nail heads
            c.p(x, y, col)
    for x in range(96): c.p(x, 15, DK[5]); c.p(x, 16, DK[2]); c.p(x, 17, DK[1]); c.p(x, 18, DK[1]); c.p(x, 19, DK[0])
    for x in range(4, 96, 24):
        for y in range(20, 23): c.p(x, y, DK[1]); c.p(x + 1, y, DK[0])
    for y in range(20, 25):
        for x in range(96): c.p(x, y, (14, 16, 22), 70 - (y - 20) * 13) if c.px[x, y][3] == 0 else None
    save('wk_walk', c, ax=48, ay=12, foot=(0, 0, 0, 0))
# ---------------------------------------------------------------- Pruitt's forecourt (lies flat): a concrete slab with a little thickness
def forecourt():
    c = C(200, 96); CO = ramp('#9c9a92')
    for y in range(93):
        for x in range(200):
            edge = min(x, 199 - x, y, 92 - y)
            if edge < 3 and HASH(x, y, 6) < .5 - edge * .15: continue
            col = CO[3] if HASH(x // 3, y // 3, 1) > .3 else CO[2]
            if x % 48 == 0 or y % 48 == 0: col = CO[1]
            if (x % 48 == 1 or y % 48 == 1) and x > 1 and y > 1: col = CO[4]   # each joint's lit lip
            c.p(x, y, col)
    for x in range(3, 197): c.p(x, 93, CO[1]); c.p(x, 94, CO[0]); c.p(x, 95, (14, 16, 22), 60)   # the slab's thickness and shadow
    for cx, cy, r in ((70, 40, 9), (120, 60, 6), (150, 30, 5)):
        for y in range(cy - r, cy + r):
            for x in range(cx - 2 * r, cx + 2 * r):
                if ((x - cx) / (2 * r)) ** 2 + ((y - cy) / r) ** 2 < 1 and HASH(x, y, 9) < .8: c.p(x, y, (58, 56, 64), 120)
    save('forecourt', c, ax=100, ay=48, foot=(0, 0, 0, 0))
def island():
    c = C(70, 24); CO = ramp('#b0aea4')
    box(c, 2, 4, 66, 6, 7, CO, front=lambda i, j, col: ((228, 190, 40) if (i // 5) % 2 == 0 else (40, 36, 34)) if j < 5 else None)
    contact(c, 2, 68, 17); ground(c, 2, 68, 17, 3, 70)
    c.outline(OUTC); save('pump_isle', c, ay=17, foot=(-1, -.3, 1, 0))
# ---------------------------------------------------------------- tyres stacked: each a squat ring, the top one showing its hole
def tyres():
    c = C(32, 34); G = 30; RU = ramp('#3c3a3e')
    for k in range(3):
        y0 = G - 8 - k * 7
        for y in range(y0, y0 + 8):
            for x in range(3, 29):
                u = (x - 16) / 13; v = (y - y0) / 8; t = 5 if v < .15 else 4 if v < .35 else 3 if v < .6 else 2 if v < .85 else 1
                if u > .6: t = max(0, t - 1)
                if (x + k) % 3 == 0 and .3 < v < .8: t = max(0, t - 1)   # the tread
                c.p(x, y + (1 if abs(u) > .85 else 0), RU[t])
    ty = G - 8 - 2 * 7 - 1
    for y in range(ty - 3, ty + 4):
        for x in range(3, 29):
            d = ((x - 16) / 13) ** 2 + ((y - ty) / 3.6) ** 2; h = ((x - 16) / 6.5) ** 2 + ((y - ty) / 1.8) ** 2
            if d <= 1: c.p(x, y, (14, 12, 16) if h <= 1 else RU[4] if y < ty else RU[3])
    contact(c, 3, 29, G); ground(c, 3, 29, G, 4, 90)
    c.outline(OUTC); save('tyres', c, foot=(-.4, -.3, .4, 0))
def drum():
    c = C(22, 32); G = 28
    cyl(c, 11, 5, 8, 20, RD)
    for yy in (11, 18):
        for x in range(3, 20):
            u = (x - 11) / 8; arc = 3 * math.sqrt(max(0, 1 - u * u)); c.p(x, yy + arc, RD[1]); c.p(x, yy - 1 + arc, RD[4] if u < .2 else RD[3])
    for k in range(9):
        x = 6 + int(HASH(k, 4) * 10); y = 9 + int(HASH(k, 5) * 14); c.p(x, y, (120, 74, 46)); c.p(x, y + 1, (100, 60, 40))
    c.r(13, 4, 3, 2, IR[3]); c.p(13, 4, IR[5])
    contact(c, 3, 20, G); ground(c, 3, 20, G, 3, 90)
    c.outline(OUTC); save('drum', c, foot=(-.3, -.3, .3, 0))

# ---------------------------------------------------------------- Lusk Fuel
def fuel(lit=False):
    W, H = 340, 216; c = C(W, H); G = 212
    kx0, kx1, wt = 176, 300, G - 66
    # the flat roof seen from above (lighter toward the front), the parapet's cap catching the light
    rt = wt - 46
    for y in range(rt, wt - 2):
        for x in range(kx0, kx1):
            v = (y - rt) / (wt - 2 - rt); k = 1 if v < .2 else 2 if v < .6 else 3
            col = RB[k] if HASH(x // 4, y // 2, 3) > .2 else RB[max(0, k - 1)]
            if (y - rt) % 7 == 6: col = RB[max(0, k - 1)]                       # the seams of the roofing felt
            if x < kx0 + 3: col = CR[4] if x == kx0 else CR[3]                   # the parapet: lit on the left
            elif x >= kx1 - 3: col = CR[2] if x < kx1 - 1 else CR[1]            # in shade on the right
            if y < rt + 3: col = CR[5] if y == rt else CR[3] if y == rt + 1 else CR[2]   # along the back
            if y == rt + 3 and kx0 + 3 <= x < kx1 - 3: col = (24, 22, 30)        # the parapet's shadow on the roof
            c.p(x, y, col)
    for y in range(wt - 18, wt - 12):   # a puddle by the drain
        for x in range(kx0 + 20, kx0 + 44):
            if ((x - (kx0 + 32)) / 12) ** 2 + ((y - (wt - 15)) / 3) ** 2 < 1: c.p(x, y, (60, 72, 90) if not lit else (70, 80, 96)); c.p(kx0 + 26, wt - 16, (150, 170, 190))
    box(c, kx0 + 68, rt + 10, 26, 7, 12, ramp('#9a9ca0'), front=lambda i, j, col: (60, 62, 68) if j % 3 == 1 and 3 < i < 22 else None)   # the air unit
    for x in range(kx0 + 70, kx0 + 96): c.p(x + 4, rt + 30, (16, 18, 24), 80); c.p(x + 4, rt + 31, (16, 18, 24), 40)   # its shadow
    cyl(c, kx0 + 106, rt + 14, 2.5, 9, ramp('#8a8c90')); cyl(c, kx0 + 112, rt + 18, 2, 6, ramp('#8a8c90'))   # vent pipes
    for x in range(kx0 - 2, kx1 + 2): c.p(x, wt - 3, CR[5]); c.p(x, wt - 2, CR[4]); c.p(x, wt - 1, CR[2])
    # the walls: block courses, light falling off to the right, a shadow under the cap, grime at the foot
    for y in range(wt, G):
        for x in range(kx0, kx1):
            u = (x - kx0) / (kx1 - kx0); col = CR[4] if u < .12 else CR[3] if u < .75 else CR[2]
            if (y - wt) % 8 == 7 or (x + ((y - wt) // 8) * 8) % 16 == 0: col = CR[1]
            if y > G - 5: col = CR[1] if HASH(x, y) < .6 else (120, 112, 96)
            c.p(x, y, col)
    for y in range(wt, wt + 8):
        for x in range(kx0, kx1): c.p(x, y, TE[4] if y == wt else TE[3] if y < wt + 6 else TE[1])
    for x in range(kx0, kx1): c.p(x, wt + 6, RD[3]); c.p(x, wt + 8, (20, 18, 26), 90); c.p(x, wt + 9, (20, 18, 26), 40)
    # the window: sunk in its frame, shelves of cans behind the glass, posters stuck on it
    wx0, wx1, wy0, wy1 = kx0 + 8, kx0 + 70, wt + 14, G - 18
    def glass(i, j):
        if lit: return (255, 222, 150)
        return (120, 150, 166) if (i + j) % 23 < 3 else (48, 66, 80) if j > 2 else (36, 50, 62)
    inset(c, wx0, wy0, wx1, wy1, glass, TE)
    for k in range(3):
        sy = wy0 + 6 + k * 9
        for x in range(wx0 + 3, wx1 - 3):
            c.p(x, sy + 5, (96, 76, 56) if not lit else (180, 130, 80))
            if (x // 3) % 2 == 0: c.p(x, sy + 3, RD[4] if (x // 6) % 2 else (230, 200, 80)); c.p(x, sy + 4, RD[2] if (x // 6) % 2 else (190, 160, 60))
    for y in range(wy0, wy1): c.p(wx0 + 31, y, TE[1])
    box(c, wx0 + 4, wy0 + 2, 18, 1, 8, ramp('#ece6d2')); c.text(wx0 + 6, wy0 + 4, 'BAIT', RD[2])
    box(c, wx0 + 36, wy0 + 2, 14, 1, 8, ramp('#cce2ea')); c.text(wx0 + 38, wy0 + 4, 'ICE', (30, 70, 120))
    # the door, sunk in its frame: glass above, the push bar, the sign
    dx0, dx1 = kx0 + 84, kx0 + 104
    inset(c, dx0, wt + 12, dx1, G - 1, lambda i, j: ((255, 214, 140) if lit else (56, 76, 90)) if (j < 22 and 2 < i < 17) else (TE[3] if i < 3 else TE[2]), TE)
    c.r(dx0 + 2, wt + 38, 16, 1, (210, 210, 210)); c.r(dx0 + 2, wt + 39, 16, 1, (130, 130, 136))
    box(c, dx0 + 1, wt + 21, 18, 1, 7, RD); c.text(dx0 + 2, wt + 23, 'OPEN', (250, 240, 220))
    box(c, dx0 - 3, G - 2, dx1 - dx0 + 6, 1, 2, ramp('#a8a6a0'))
    # the canopy: its top (lighter toward the front edge), the lettered fascia, its lit underside lights at night
    cx0, cx1, ft = 8, 176, G - 92
    CT = ramp('#b8bab6')
    for y in range(ft - 34, ft):
        for x in range(cx0 + 2, cx1):
            v = (y - (ft - 34)) / 34; k = 2 if v < .25 else 3 if v < .7 else 4
            col = CT[k] if HASH(x // 6, y // 3, 5) > .15 else CT[k - 1]
            if (x - cx0) % 28 == 0: col = CT[k - 1]                              # the panel seams
            if HASH(x // 2, y // 2, 8) < .025: col = (128, 118, 96)             # leaves and grime blown up there
            if y == ft - 34: col = CT[5]
            c.p(x, y, col)
    for x in range(cx0 + 2, cx1): c.p(x, ft - 1, CR[5])
    for y in range(ft, ft + 16):
        for x in range(cx0, cx1 + 2):
            col = CR[5] if y == ft else CR[4] if y < ft + 3 else CR[3]
            if ft + 11 <= y < ft + 14: col = TE[3] if y == ft + 11 else TE[2]
            if y == ft + 14: col = RD[3]
            if y == ft + 15: col = CR[1]
            if x > cx1 - 6 and y > ft: col = tuple(max(0, v - 18) for v in col)   # the far end in shade
            c.p(x, y, col)
    lx = cx0 + (cx1 - cx0) // 2 - (9 * 4) // 2; c.text(lx, ft + 4, 'LUSK FUEL', RD[3], RD[1])
    if lit:
        for x in range(cx0 + 6, cx1 - 4): c.p(x, ft + 16, (230, 244, 255))
    shade = (cx0 + 4, cx1 - 2, ft + 16, G)
    # the island and the two pumps: each pump a box (its top showing), the globe a lit ball, a hose on its hook
    box(c, cx0 + 30, G - 14, cx1 - cx0 - 60, 5, 8, ramp('#b0aea4'), front=lambda i, j, col: ((228, 190, 40) if (i // 5) % 2 == 0 else (40, 36, 34)) if j < 6 else None)
    for px0 in (cx0 + 46, cx0 + 102):
        box(c, px0, G - 60, 22, 4, 46, TE, front=lambda i, j, col: ((246, 242, 224) if lit else (232, 228, 210)) if 6 <= j < 16 and 3 <= i < 19 else CR[5] if j == 26 else None)
        c.text(px0 + 4, G - 52, '0.89' if px0 < 100 else '13.7', (30, 30, 30))
        box(c, px0 + 3, G - 30, 16, 1, 9, TE); c.r(px0 + 5, G - 28, 5, 6, (34, 34, 40)); box(c, px0 + 18, G - 40, 6, 1, 4, IR)
        for k in range(16): c.p(px0 + 23 + math.sin(k * .3) * 2, G - 36 + k, (28, 28, 34)); c.p(px0 + 24 + math.sin(k * .3) * 2, G - 36 + k, (70, 70, 80))
        for y in range(G - 70, G - 61):
            for x in range(px0 + 5, px0 + 17):
                d = ((x - (px0 + 11)) / 6) ** 2 + ((y - (G - 65.5)) / 4.5) ** 2
                if d <= 1: c.p(x, y, (255, 250, 236) if lit else (250, 246, 230) if (x - px0 < 9 and y < G - 66) else (226, 220, 200) if d < .7 else (190, 182, 160))
        c.r(px0 + 5, G - 64, 12, 1, RD[3])
    for x in (cx0 + 6, cx1 - 8): pole(c, x, ft + 16, G, 5, ramp('#d6d4cc')); box(c, x - 1, G - 4, 7, 1, 3, ramp('#a8a6a0'))
    # the price sign: a board with thickness on a round pole
    sx0 = 304; so = G - 174
    for y in range(so + 24, G):
        for i in range(4): c.p(sx0 + 13 + i, y, WG[[4, 3, 2, 1][i]])
    box(c, sx0, so, 30, 2, 36, ramp('#e8e4d6'), front=lambda i, j, col: RD[3] if i < 2 or i > 27 or j < 2 or j > 33 else ((252, 248, 236) if lit else None))
    c.text(sx0 + 9, so + 7, 'GAS', TE[1]); c.text(sx0 + 7, so + 16, '.89', (30, 30, 30)); c.text(sx0 + 5, so + 26, 'BAIT', RD[2])
    contact(c, kx0, kx1, G); contact(c, sx0 + 13, sx0 + 17, G)
    ground(c, cx0, kx1, G, 8, 70)
    c.outline(OUTC)
    sx0_, sx1_, sy0_, sy1_ = shade
    for y in range(sy0_, sy1_):
        for x in range(sx0_, sx1_):
            if c.px[x, y][3] == 0: c.p(x, y, (16, 22, 30), int((84 if not lit else 34) * (1 - (y - sy0_) / (sy1_ - sy0_) * .55)))
    save('fuel' + ('_n' if lit else ''), c, ax=W / 2, ay=G - 1, foot=(-5.1, -2.2, 4.5, 0), extra={'bw': 10, 'door_dx': (dx0 + dx1) / 2 - W / 2})

if __name__ == '__main__':
    for f in (rack, boat, trap, rope, nets, stall, walk, forecourt, island, tyres, drum): f()
    bell(False); bell(True); wlamp(False); wlamp(True); fuel(False); fuel(True)
    meta = json.load(open('spr/lpc/objects.json')); meta.update(SPRITES); json.dump(meta, open('spr/lpc/objects.json', 'w'))
