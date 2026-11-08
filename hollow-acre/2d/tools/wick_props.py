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

# ---------------------------------------------------------------- the fish drying rack
def rack():
    c = C(66, 58); G = 54
    c.shadow(33, G + 1, 30, 3)
    for x in (5, 57): post(c, x, 10, G, WOOD, 4)
    for x in range(4, 63): c.p(x, 11, WOOD[3]); c.p(x, 12, WOOD[2]); c.p(x, 13, WOOD[1])
    for x in (5, 57):
        for k in range(10): c.p(x + 2 + (k // 3 if x == 5 else -k // 3), 14 + k, WOOD[2])   # braces
    for i, x in enumerate(range(13, 54, 7)):
        L = 11 + int(HASH(i, 1) * 5); FR = [(66, 62, 58), (112, 104, 90), (160, 150, 128), (200, 192, 170)]
        c.line(x + 1, 14, x + 1, 17, ROPE[1])
        for j in range(L):
            w = 1 if j < 2 or j > L - 3 else 2
            for k in range(-w + 1, w + 1): c.p(x + k, 18 + j, FR[3 if k < 0 else 2 if j < L * .6 else 1])
        c.p(x - 1, 18 + L, FR[1]); c.p(x + 2, 18 + L, FR[1]); c.p(x, 20, (30, 30, 30))   # tail and eye
    c.outline(); save('wk_rack', c, foot=(-1, -.3, 1, 0))
# ---------------------------------------------------------------- an upturned rowboat on two chocks
def boat():
    c = C(78, 34); G = 30; HULL = [(26, 46, 56), (38, 72, 84), (54, 104, 116), (82, 140, 148), (124, 176, 178)]
    c.shadow(38, G, 35, 3, 90)
    x0, x1 = 4, 74
    for x in range(x0, x1):
        u = (x - x0) / (x1 - x0)   # 0 = stern (square), 1 = bow (pointed, rising)
        keel = G - 4 - int(16 * (1 - (2 * u - 1) ** 4) ** .5 if u < .5 else 16 * (1 - ((u - .5) / .5) ** 2.2) ** .5)
        gun = G - 3 - int(6 * max(0, u - .7) / .3 * max(0, u - .7) / .3)   # the sheer: the gunwale sweeps up to the bow
        for y in range(keel, gun):
            v = (y - keel) / max(1, gun - keel); col = HULL[4] if y == keel else HULL[3] if v < .22 else HULL[2] if v < .62 else HULL[1]
            if (y - keel) % 5 == 4 and 0 < v < .92: col = HULL[1]          # plank seams
            if HASH(x, y, 2) < .018: col = (168, 160, 140)                  # a fleck of bare wood
            c.p(x, y, col)
        c.p(x, gun, (156, 54, 38)); c.p(x, gun + 1, (112, 36, 26))         # the red gunwale
    for x in (14, 50): c.r(x, G - 2, 6, 3, WOOD[2]); c.r(x, G - 2, 6, 1, WOOD[3])
    c.outline(); save('wk_boat', c, foot=(-1.1, -.4, 1.1, 0))
# ---------------------------------------------------------------- an eel trap (a wicker cone on its side) and a coil of rope
def trap():
    c = C(32, 22); G = 19; WK = [(78, 58, 28), (122, 92, 48), (166, 132, 78), (204, 172, 112)]
    c.shadow(16, G, 14, 2)
    for x in range(3, 29):
        u = (x - 3) / 25; r = 2.5 + u * 5.5; cy = G - 2 - r
        for y in range(int(cy - r), int(cy + r) + 1):
            v = (y - (cy - r)) / (2 * r); col = WK[3] if v < .22 else WK[2] if v < .55 else WK[1] if v < .85 else WK[0]
            if (y + x // 2) % 3 == 0: col = WK[max(0, [3, 2, 1, 0][min(3, int(v * 4))] - 1)]   # the weave
            if x % 7 == 0: col = WK[0] if v > .5 else WK[1]                                    # the hoops
            c.p(x, y, col)
    for y in range(G - 15, G - 1):
        for x in range(25, 30):
            if ((x - 28) / 2.2) ** 2 + ((y - (G - 8)) / 6) ** 2 < 1: c.p(x, y, (30, 22, 12))   # the mouth
    c.outline(); save('wk_trap', c, foot=(-.4, -.2, .4, 0))
def rope():
    c = C(26, 16); G = 13; c.shadow(13, G, 12, 2)
    # a spiral of rope seen from a little above: each turn a lit top edge and a shadowed underside, the loose end trailing off
    for a in range(0, 360 * 4, 3):
        t = a / (360 * 4); r = 10.5 - t * 8; an = math.radians(a)
        x = 13 + math.cos(an) * r; y = G - 4 + math.sin(an) * r * .42
        up = math.sin(an) < 0
        c.p(x, y, ROPE[3] if up else ROPE[2]); c.p(x, y + 1, ROPE[1] if up else ROPE[0])
        if a % 12 == 0: c.p(x, y, ROPE[1])   # the twist of the strands
    for k in range(7): c.p(23 + k * .5, G - 3 + k * .3, ROPE[2]); c.p(23 + k * .5, G - 2 + k * .3, ROPE[0])
    c.p(13, G - 4, (40, 30, 18)); c.p(14, G - 4, (40, 30, 18))
    c.outline(); save('wk_rope', c, foot=(-.3, -.15, .3, 0))
# ---------------------------------------------------------------- nets hung up to dry, cork floats along the bottom
def nets():
    c = C(76, 64); G = 61
    c.shadow(38, G, 34, 3)
    for x in (4, 68): post(c, x, 6, G, GREY, 4)
    for x in range(4, 72): c.p(x, 7, ROPE[2])
    NET = (70, 74, 56)
    for i in range(0, 60, 5):
        for j in range(0, 40):
            x0 = 8 + i; sag = int(6 * math.sin((x0 - 8) / 60 * math.pi))
            y = 8 + j + int(sag * j / 40)
            if (j + i) % 5 == 0 or (j - i) % 5 == 0: c.p(x0 + (j % 5), y, NET)
    for i in range(10, 66, 6):
        sag = int(6 * math.sin((i - 8) / 60 * math.pi)); y = 48 + sag
        c.r(i, y, 3, 2, (232, 120, 44)); c.p(i, y, (250, 180, 110))
    c.outline(); save('wk_nets', c, foot=(-1.1, -.2, 1.1, 0))
# ---------------------------------------------------------------- the fish stall: a striped awning, ice and the day's catch
def stall():
    c = C(88, 80); G = 77; T = [(30, 92, 96), (44, 128, 128), (70, 162, 158)]; WH = [(196, 192, 180), (226, 222, 210), (244, 242, 232)]
    c.shadow(44, G, 40, 4, 90)
    for x in (6, 78): post(c, x, 10, G, WOOD, 4)
    # the awning, scalloped
    for x in range(2, 86):
        stripe = ((x - 2) // 8) % 2; R = T if stripe == 0 else WH
        for y in range(6, 20):
            v = (y - 6) / 14; c.p(x, y, R[2] if v < .3 else R[1] if v < .8 else R[0])
        sc = 20 + int(2 * abs(math.sin((x - 2) / 8 * math.pi)))
        for y in range(20, sc + 1): c.p(x, y, R[0])
    for x in range(2, 86): c.p(x, 5, (240, 240, 230) if ((x - 2) // 8) % 2 else T[2])
    # the table, the ice and the fish
    for y in range(46, 56):
        for x in range(8, 80): c.p(x, y, WOOD[3] if y == 46 else WOOD[2] if y < 52 else WOOD[1])
    for y in range(40, 47):
        for x in range(12, 76): c.p(x, y, (214, 232, 238) if HASH(x, y) > .25 else (170, 200, 214))
    FR = [(60, 70, 80), (120, 134, 140), (178, 190, 194), (220, 228, 230)]
    for i, x in enumerate(range(15, 70, 9)):
        L = 7 + int(HASH(i, 3) * 3)
        for k in range(L):
            for j in (0, 1, 2): c.p(x + k, 41 + j + (i % 2), FR[3 - j] if k > 0 else FR[1])
        c.p(x + L, 41 + (i % 2), FR[1]); c.p(x + L, 43 + (i % 2), FR[1]); c.p(x + 1, 42 + (i % 2), (20, 20, 24))
    for x in (12, 70): post(c, x, 56, G, WOOD, 3)
    # a crate of fish below, and the chalkboard
    c.r(30, 62, 26, 12, WOOD[2]); c.r(30, 62, 26, 2, WOOD[3]); c.r(30, 67, 26, 1, WOOD[1])
    c.r(58, 58, 18, 13, (40, 44, 40)); c.r(58, 58, 18, 1, WOOD[3]); c.text(60, 61, 'FISH', (230, 230, 220))
    c.outline(); save('wk_stall', c, foot=(-1.3, -.6, 1.3, 0))
# ---------------------------------------------------------------- the drowned bell: Wickham's square has a bell hung over a stone plinth
def bell(lit=False):
    c = C(60, 100); G = 97; ST = [(64, 66, 70), (92, 94, 98), (122, 124, 128), (156, 158, 160)]; BR = [(46, 36, 26), (82, 64, 40), (120, 96, 60), (160, 132, 84), (200, 176, 120)]
    c.shadow(30, G, 26, 4, 90)
    # the plinth
    for y in range(G - 16, G):
        for x in range(8, 52):
            col = ST[3] if y == G - 16 else ST[2] if x < 20 else ST[1]
            if (y - (G - 16)) % 6 == 5 or (x + ((y - (G - 16)) // 6) * 7) % 14 == 0: col = ST[0]
            c.p(x, y, col)
    # the frame and the beam
    for x in (12, 44): post(c, x, 14, G - 16, WOOD, 4)
    for x in range(8, 52): c.p(x, 12, WOOD[4]); c.p(x, 13, WOOD[3]); c.p(x, 14, WOOD[2]); c.p(x, 15, WOOD[1])
    for k in range(8): c.p(16 + k, 16 + k, WOOD[2]); c.p(43 - k, 16 + k, WOOD[2])
    # the bell, green where the river ran over it
    for y in range(20, 50):
        u = (y - 20) / 30; w = 6 + 7 * u ** 1.6 + (4 * (u - .8) / .2 if u > .8 else 0) - (1 if u < .12 else 0)
        for x in range(int(30 - w), int(30 + w) + 1):
            v = (x - (30 - w)) / (2 * w); col = BR[4] if v < .18 else BR[3] if v < .4 else BR[2] if v < .75 else BR[1]
            if HASH(x, y, 7) < .12 + u * .25: col = (70, 128, 108) if HASH(x, y, 8) < .5 else (92, 150, 126)   # verdigris
            c.p(x, y, col)
    for x in range(14, 47): c.p(x, 50, BR[1])
    c.r(29, 16, 3, 4, BR[1]); c.r(29, 50, 2, 4, BR[2])   # crown and clapper
    for k in range(18): c.p(30 + math.sin(k * .5) * .6, 54 + k, ROPE[2])   # the rope
    # names cut in the plinth, candles at its foot
    for k in range(5): c.r(16 + k * 6, G - 10, 4, 1, ST[0])
    for x in (10, 47):
        c.r(x, G - 4, 2, 4, (226, 218, 196))
        if lit:
            c.p(x, G - 6, (255, 200, 90)); c.p(x + 1, G - 6, (255, 200, 90)); c.p(x, G - 7, (255, 236, 160))
            for dy in range(-3, 3):
                for dx in range(-3, 4):
                    if dx * dx + dy * dy < 9: c.p(x + dx, G - 6 + dy, (255, 190, 90), 60)
        else: c.p(x, G - 5, (40, 30, 24))
    c.outline(); save('wk_bell' + ('_n' if lit else ''), c, foot=(-.75, -.5, .75, 0))
# ---------------------------------------------------------------- a lantern hung from a crooked wooden post
def wlamp(lit=False):
    c = C(26, 84); G = 81
    post(c, 9, 8, G, WOOD, 4)
    for x in range(9, 23): c.p(x, 8, WOOD[3]); c.p(x, 9, WOOD[1])
    for k in range(6): c.p(12 + k, 10 + k, WOOD[2])   # the brace
    c.line(21, 10, 21, 13, (40, 36, 34))
    # the lantern: iron frame, glass, a little roof
    for y in range(14, 28):
        for x in range(17, 26):
            fr = x in (17, 25) or y in (14, 27, 18)
            if y < 17 and (x - 17 < 17 - y or 25 - x < 17 - y): continue
            col = (44, 40, 38) if fr else ((255, 214, 120) if lit else (120, 128, 120)) if x < 22 else ((240, 170, 80) if lit else (90, 98, 92))
            c.p(x, y, col)
    if lit:
        for dy in range(-7, 8):
            for dx in range(-7, 8):
                if dx * dx + dy * dy < 49: c.p(21 + dx, 22 + dy, (255, 200, 110), int(70 * (1 - (dx * dx + dy * dy) / 49)))
    c.r(8, G - 1, 6, 2, WOOD[1])
    c.outline(); save('wk_lamp' + ('_n' if lit else ''), c, ax=11, foot=(-.1, -.1, .1, .05))
# ---------------------------------------------------------------- boardwalk planks (lies flat)
def walk():
    c = C(96, 30);
    for y in range(0, 26):
        for x in range(96):
            k = x % 8; pl = x // 8; col = WOOD[3] if y < 2 else WOOD[2] if (pl % 3) else (150, 108, 68)
            if k == 7: col = WOOD[0]
            if HASH(pl, y // 4, 4) < .1 and k in (2, 3): col = WOOD[1]
            if y in (4, 21) and k in (1, 5): col = (60, 54, 50)   # nail heads
            c.p(x, y, col)
    for x in range(96): c.p(x, 26, WOOD[1]); c.p(x, 27, WOOD[0])
    save('wk_walk', c, ax=48, ay=13, foot=(0, 0, 0, 0))
# ---------------------------------------------------------------- Pruitt's forecourt (lies flat), the pump island, tyres, an oil drum
def forecourt():
    c = C(200, 96)
    for y in range(96):
        for x in range(200):
            edge = min(x, 199 - x, y, 95 - y)
            if edge < 3 and HASH(x, y, 6) < .5 - edge * .15: continue   # a ragged, broken edge
            col = (150, 148, 140) if HASH(x // 3, y // 3, 1) > .3 else (140, 138, 132)
            if x % 48 == 0 or y % 48 == 0: col = (104, 102, 98)   # the joints
            c.p(x, y, col)
    for cx, cy, r in ((70, 40, 9), (120, 60, 6), (150, 30, 5)):
        for y in range(cy - r, cy + r):
            for x in range(cx - 2 * r, cx + 2 * r):
                if ((x - cx) / (2 * r)) ** 2 + ((y - cy) / r) ** 2 < 1 and HASH(x, y, 9) < .8: c.p(x, y, (60, 58, 62), 120)   # oil stains
    save('forecourt', c, ax=100, ay=48, foot=(0, 0, 0, 0))
def island():
    c = C(70, 22); G = 18
    for y in range(G - 10, G):
        for x in range(2, 68):
            top = y < G - 6; col = (176, 174, 166) if top else ((228, 190, 40) if ((x // 5) % 2 == 0) else (40, 36, 34))
            if y == G - 10: col = (200, 198, 190)
            c.p(x, y, col)
    c.outline(); save('pump_isle', c, foot=(-1, -.3, 1, 0))
def tyres():
    c = C(30, 32); G = 29; c.shadow(15, G, 13, 2)
    for k in range(3):
        y0 = G - 8 - k * 7
        for y in range(y0, y0 + 8):
            for x in range(2, 28):
                v = (y - y0) / 8; col = (60, 58, 60) if v < .3 else (38, 36, 38) if v < .8 else (24, 22, 24)
                if 10 <= x <= 19 and y == y0 + 2 and k == 2: col = (14, 12, 14)
                c.p(x, y, col)
    c.r(9, G - 22, 12, 2, (14, 12, 14))
    c.outline(); save('tyres', c, foot=(-.4, -.3, .4, 0))
def drum():
    c = C(20, 30); G = 27; c.shadow(10, G, 9, 2)
    for y in range(4, G):
        for x in range(2, 18):
            v = (x - 2) / 16; col = (176, 60, 40) if v < .25 else (140, 46, 32) if v < .7 else (100, 32, 24)
            if y in (10, 18): col = (80, 26, 20)
            if HASH(x, y, 5) < .07: col = (120, 80, 50)
            c.p(x, y, col)
    for x in range(2, 18): c.p(x, 3, (110, 40, 30)); c.p(x, 4, (190, 80, 56))
    c.outline(); save('drum', c, foot=(-.3, -.3, .3, 0))

# ---------------------------------------------------------------- Lusk Fuel: the kiosk, the canopy over two old pumps, the price sign
TEAL = [(18, 60, 64), (30, 90, 94), (44, 124, 126), (72, 160, 158), (120, 196, 190)]
WALL = [(150, 144, 132), (184, 178, 164), (206, 200, 186), (226, 222, 208), (240, 238, 228)]
def fuel(lit=False):
    W, H = 340, 184; c = C(W, H); G = 180
    # ---- the kiosk (right): block walls painted cream, a teal band, flat roof behind a parapet
    kx0, kx1, wt = 176, 300, G - 66
    for y in range(wt - 22, wt):   # the flat roof seen from above, tar paper
        for x in range(kx0 + 2, kx1 - 2):
            col = (78, 78, 82) if HASH(x // 4, y // 2, 3) > .2 else (66, 66, 70)
            if y == wt - 22: col = (110, 110, 112)
            c.p(x, y, col)
    c.r(kx0 + 70, wt - 18, 16, 8, (96, 98, 100)); c.r(kx0 + 70, wt - 18, 16, 1, (130, 132, 134))   # a vent box
    for y in range(wt, G):
        for x in range(kx0, kx1):
            v = (x - kx0) / (kx1 - kx0); col = WALL[3] if v < .15 else WALL[2] if v < .8 else WALL[1]
            if (y - wt) % 8 == 7 or (x + ((y - wt) // 8) * 8) % 16 == 0: col = WALL[0]   # the blocks
            if y > G - 5: col = WALL[0] if HASH(x, y) < .6 else (120, 112, 96)   # grime along the bottom
            c.p(x, y, col)
    for y in range(wt, wt + 8):
        for x in range(kx0, kx1): c.p(x, y, TEAL[3] if y == wt else TEAL[2] if y < wt + 6 else TEAL[1])
    for x in range(kx0, kx1): c.p(x, wt + 6, (200, 60, 40))
    for x in range(kx0 - 2, kx1 + 2): c.p(x, wt - 1, WALL[4]); c.p(x, wt - 2, WALL[3])
    # the big window, things for sale behind the glass, posters
    wx0, wx1, wy0, wy1 = kx0 + 8, kx0 + 70, wt + 14, G - 18
    for y in range(wy0, wy1):
        for x in range(wx0, wx1):
            col = (255, 222, 150) if lit else (54, 72, 84)
            if not lit and ((x - wx0) + (y - wy0)) % 23 < 3: col = (110, 140, 156)   # reflections
            c.p(x, y, col)
    for k in range(3):   # shelves of cans
        sy = wy0 + 6 + k * 9
        for x in range(wx0 + 3, wx1 - 3):
            c.p(x, sy + 5, (90, 70, 50) if not lit else (180, 130, 80))
            if (x // 3) % 2 == 0: c.p(x, sy + 3, (200, 70, 50) if (x // 6) % 2 else (230, 200, 80)); c.p(x, sy + 4, (150, 50, 40) if (x // 6) % 2 else (190, 160, 60))
    for x in range(wx0 - 2, wx1 + 2): c.p(x, wy0 - 2, TEAL[1]); c.p(x, wy0 - 1, TEAL[1]); c.p(x, wy1, TEAL[1]); c.p(x, wy1 + 1, WALL[4])
    for y in range(wy0, wy1): c.p(wx0 - 2, y, TEAL[1]); c.p(wx0 - 1, y, TEAL[1]); c.p(wx1, y, TEAL[1]); c.p(wx1 + 1, y, TEAL[1]); c.p(wx0 + 31, y, TEAL[1])
    c.r(wx0 + 4, wy0 + 2, 18, 9, (236, 230, 210)); c.text(wx0 + 6, wy0 + 4, 'BAIT', (180, 40, 30))
    c.r(wx0 + 36, wy0 + 2, 14, 9, (200, 226, 236)); c.text(wx0 + 38, wy0 + 4, 'ICE', (30, 70, 120))
    # the door: teal, glass in the top half, a sign that never turns round
    dx0, dx1 = kx0 + 84, kx0 + 104
    for y in range(wt + 12, G):
        for x in range(dx0, dx1):
            col = TEAL[2] if x < dx0 + 3 else TEAL[1]
            if y < wt + 34 and dx0 + 3 <= x < dx1 - 3: col = (255, 214, 140) if lit else (60, 80, 92)
            c.p(x, y, col)
    c.r(dx0 + 2, wt + 38, 16, 2, (190, 190, 190)); c.r(dx0 + 1, wt + 22, 18, 7, (200, 50, 36)); c.text(dx0 + 2, wt + 23, 'OPEN', (250, 240, 220))
    c.r(dx0 - 2, G - 1, dx1 - dx0 + 4, 2, (130, 128, 120))
    # ---- the canopy (left): a flat slab on two posts, its fascia lettered, two old pumps under it on an island
    cx0, cx1, ft = 8, 176, G - 92
    for y in range(ft - 12, ft):   # its top
        for x in range(cx0 + 2, cx1):
            c.p(x, y, (176, 178, 176) if HASH(x // 6, y // 3, 5) > .15 else (160, 162, 160))
            if y == ft - 12: c.p(x, y, (200, 202, 198))
    for y in range(ft, ft + 16):   # the fascia
        for x in range(cx0, cx1 + 2):
            col = WALL[4] if y < ft + 3 else WALL[3]
            if ft + 11 <= y < ft + 14: col = TEAL[2]
            if y == ft + 14: col = (200, 60, 40)
            if y == ft + 15: col = WALL[1]
            c.p(x, y, col)
    lx = cx0 + (cx1 - cx0) // 2 - (9 * 4) // 2; c.text(lx, ft + 4, 'LUSK FUEL', (200, 54, 36), (120, 30, 20))
    if lit:
        for x in range(cx0 + 6, cx1 - 4): c.p(x, ft + 16, (230, 244, 255))   # the tube lights underneath
    shade = (cx0 + 4, cx1 - 2, ft + 16, G)
    for y in range(G - 12, G - 2):
        for x in range(cx0 + 30, cx1 - 30):
            col = (184, 182, 174) if y < G - 7 else ((228, 190, 40) if ((x // 5) % 2 == 0) else (40, 36, 34))
            if y == G - 12: col = (210, 208, 200)
            c.p(x, y, col)
    for px0 in (cx0 + 46, cx0 + 102):   # two pumps, 1970s: rounded tops, a window of spinning figures, a hose on a hook
        for y in range(G - 58, G - 12):
            for x in range(px0, px0 + 22):
                v = (x - px0) / 22; col = TEAL[3] if v < .2 else TEAL[2] if v < .75 else TEAL[1]
                if y < G - 54 and (x - px0 < 2 or px0 + 21 - x < 2): continue
                if G - 50 <= y < G - 40 and px0 + 3 <= x < px0 + 19: col = (236, 232, 214) if not lit else (250, 246, 220)
                if y == G - 30: col = WALL[4]
                c.p(x, y, col)
        c.text(px0 + 4, G - 48, '0.89' if px0 < 100 else '13.7', (30, 30, 30))
        c.r(px0 + 3, G - 28, 16, 10, TEAL[1]); c.r(px0 + 5, G - 26, 5, 6, (40, 40, 40)); c.r(px0 + 18, G - 36, 6, 4, (60, 60, 60))
        for k in range(14): c.p(px0 + 23 + math.sin(k * .3) * 2, G - 33 + k, (30, 30, 30))   # the hose
        c.r(px0 + 6, G - 64, 10, 6, (250, 244, 228) if lit else (226, 220, 200)); c.r(px0 + 6, G - 61, 10, 1, (200, 60, 40))   # the globe
    for x in (cx0 + 6, cx1 - 8): post(c, x, ft + 16, G, [(120, 118, 112), (160, 158, 150), (196, 194, 186), (222, 220, 212), (240, 238, 230)], 5)
    # ---- the price sign on its pole (far right)
    sx0 = 304; post(c, sx0 + 13, 30, G, GREY, 4)
    for y in range(8, 44):
        for x in range(sx0, sx0 + 30):
            col = (196, 54, 36) if y < 10 or y > 41 or x < sx0 + 2 or x > sx0 + 27 else ((252, 248, 236) if lit else (232, 228, 214))
            c.p(x, y, col)
    c.text(sx0 + 9, 13, 'GAS', (30, 90, 94)); c.text(sx0 + 7, 22, '.89', (30, 30, 30)); c.text(sx0 + 5, 32, 'BAIT', (180, 40, 30))
    c.p(sx0 + 15, 25, (30, 30, 30))   # the cents mark, worn off
    c.outline()
    # the shade under the canopy (no outline round it): deepest at the back, fading toward the front
    sx0_, sx1_, sy0_, sy1_ = shade
    for y in range(sy0_, sy1_):
        for x in range(sx0_, sx1_):
            if c.px[x, y][3] == 0: c.p(x, y, (16, 22, 26), int((80 if not lit else 34) * (1 - (y - sy0_) / (sy1_ - sy0_) * .6)))
    # the door sits at the kiosk door: for home_lusk's door (world x) and where you come out
    save('fuel' + ('_n' if lit else ''), c, ax=W / 2, ay=G - 1, foot=(-5.1, -2.2, 4.5, 0), extra={'bw': 10, 'door_dx': (dx0 + dx1) / 2 - W / 2})

if __name__ == '__main__':
    for f in (rack, boat, trap, rope, nets, stall, walk, forecourt, island, tyres, drum): f()
    bell(False); bell(True); wlamp(False); wlamp(True); fuel(False); fuel(True)
    meta = json.load(open('spr/lpc/objects.json')); meta.update(SPRITES); json.dump(meta, open('spr/lpc/objects.json', 'w'))
