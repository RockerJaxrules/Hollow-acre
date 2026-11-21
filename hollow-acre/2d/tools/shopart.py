"""The shops, stocked like they mean it (#152): displays, racks, workshop gear and the small things that make a room look used.
Same depth rules as regions.py and town.py: a lit top face over a darker front, hue-shifted ramps, a soft contact shadow under
everything, dark outlines. Writes spr/lpc/obj/in_*.png and their objects.json entries."""
import json, math
src = open('tools/regions.py').read()
exec(src[:src.index('# ======================================================================== Route 9 West')])
OAK = ramp('#9a6a3e', spread=.6); PINE = ramp('#c09058', spread=.5); GLASS = ramp('#8ab0c0', spread=.5); BRASS = ramp('#c8a040', spread=.7)
APPLE = ramp('#c8302a'); PUMP = ramp('#e07a20'); TURN = ramp('#e8e0e8', spread=.4); CORN = ramp('#e8c040'); LEAF2 = ramp('#4a7a2e', spread=.7)
POT = ramp('#a85a3a', spread=.6); FERN = ramp('#3e7a34', spread=.75); GRAIN = ramp('#d8b870', spread=.5); BRK = ramp('#8a3a2a', spread=.6)
EMBER = [(60, 10, 4), (140, 30, 8), (220, 80, 20), (255, 150, 40), (255, 210, 90), (255, 240, 170), (255, 255, 220)]

def box(c, x0, y0, x1, y1, top, R, plank=True):
    """A crate or counter: the top face (lit) is `top` px deep, the front face below it."""
    c.rect(x0, y0, x1, y0 + top - 1, lambda x, y: R[5] if y == y0 else R[4])
    c.rect(x0, y0 + top, x1, y1, lambda x, y: (R[3] if (y - y0 - top) % 6 else R[2]) if plank else R[3])
    c.rect(x0, y0 + top, x1, y0 + top, R[1]); c.rect(x1 - 1, y0 + top, x1, y1, R[2])
def shadow_under(c, cx, gy, rx, ry=3): c.shadow(cx, gy, rx, ry, 150)
def fruit(c, x, y, r, R): c.ellipse(x, y, r, r * .9, lambda xx, yy, d: R[5] if d < .25 and xx < x and yy < y else R[4] if d < .6 else R[2])

def produce():
    W, Hh = 96, 64; c = C(W, Hh); gy = 60; shadow_under(c, W / 2, gy, 44)
    # a stepped stand: back tier higher, front tier lower, each a crate of something
    box(c, 8, 18, W - 9, 40, 4, OAK); box(c, 4, 34, W - 5, gy - 1, 4, OAK)
    for i, (R, r) in enumerate(((APPLE, 3.2), (PUMP, 4.4), (CORN, 3), (TURN, 3.2))):
        x0 = 12 + i * 19
        for k in range(9):
            x = x0 + (k % 3) * 5 + (k // 3 % 2) * 2; y = 17 - (k // 3) * 2
            if R is CORN: c.rect(x - 1, y - 4, x + 1, y + 2, lambda xx, yy: CORN[4] if xx < x else CORN[3]); c.p(x, y - 5, LEAF2[3])
            else: fruit(c, x, y, r, R)
            if R is TURN: c.p(x, y - 4, LEAF2[4]); c.p(x + 1, y - 5, LEAF2[3])
    for i, (R, r) in enumerate(((APPLE, 3.2), (TURN, 3.2), (PUMP, 4.6), (APPLE, 3.2))):
        x0 = 9 + i * 21
        for k in range(8): x = x0 + (k % 4) * 4 + 2; y = 33 - (k // 4) * 3; fruit(c, x, y, r, ramp('#d8a020') if (R is APPLE and i == 3) else R)
    for i, t in enumerate(('5C', '3C', '10C', '2C')):   # price cards on the front
        x = 12 + i * 21; c.rect(x, 42, x + 10, 48, (236, 230, 214)); c.text(x + 1, 43, t, (60, 40, 30))
    c.outline(); return c
def seedrack():
    W, Hh = 46, 76; c = C(W, Hh); gy = 72; shadow_under(c, W / 2, gy, 18)
    c.rect(6, 6, 39, gy - 4, lambda x, y: IRON[3] if (x + y) % 4 else IRON[2]); c.rect(6, 6, 39, 7, IRON[5])
    cols = ['#c83a2a', '#e8b030', '#3a8a3a', '#7a4ab0', '#e07a20', '#3a6ac8', '#d8d040', '#b83a6a']
    for r in range(5):
        for k in range(4):
            x = 8 + k * 8; y = 10 + r * 11; R = ramp(cols[(r * 3 + k) % len(cols)], spread=.6)
            c.rect(x, y, x + 6, y + 9, lambda xx, yy: R[4] if yy < y + 3 else R[3]); c.rect(x + 1, y + 4, x + 5, y + 7, (236, 228, 210))
            c.ellipse(x + 3, y + 5.5, 1.5, 1.4, R[5])
    for x in (8, 37): c.rect(x, gy - 4, x + 1, gy - 1, IRON[2])
    c.outline(); return c
def candycase():
    W, Hh = 70, 58; c = C(W, Hh); gy = 54; shadow_under(c, W / 2, gy, 32)
    box(c, 4, 24, W - 5, gy - 1, 5, OAK)
    c.rect(8, 30, W - 9, gy - 6, lambda x, y: GLASS[4] if (x - y) % 13 == 0 else (60, 70, 80))   # glass front onto trays of sweets
    for k in range(18): x = 10 + (k % 9) * 6; y = 34 + (k // 9) * 8; R = ramp(['#e83a5a', '#f0c040', '#5ac06a', '#7a5ad8', '#ffffff', '#e87a3a'][k % 6]); c.ellipse(x, y, 2.2, 1.6, R[4])
    for i in range(4):   # jars on top, each with a brass lid
        x = 12 + i * 14; R = ramp(['#e83a5a', '#f0c040', '#5ac06a', '#7a5ad8'][i], spread=.6)
        c.rect(x - 4, 10, x + 4, 24, lambda xx, yy: GLASS[5] if xx == x - 3 else (GLASS[3] if yy < 13 else R[3] if (xx + yy) % 3 else R[4]))
        c.rect(x - 4, 7, x + 4, 9, BRASS[4]); c.rect(x - 4, 9, x + 4, 9, BRASS[2])
    c.outline(); return c
def plant(tall):
    W, Hh = (40, 78) if tall else (34, 48); c = C(W, Hh); gy = Hh - 4; shadow_under(c, W / 2, gy, 13)
    c.poly([(W / 2 - 9, gy - 14), (W / 2 + 9, gy - 14), (W / 2 + 7, gy - 1), (W / 2 - 7, gy - 1)], lambda x, y: POT[4] if x < W / 2 - 3 else POT[3] if x < W / 2 + 4 else POT[2])
    c.rect(W / 2 - 10, gy - 16, W / 2 + 10, gy - 14, POT[5]); c.ellipse(W / 2, gy - 16, 9, 2, PEAT[2])
    if tall:
        c.rect(W / 2 - 1, 20, W / 2, gy - 16, WOOD[3])
        for k in range(30): a = H(k, 1) * 6.28; r = H(k, 2) * 13; x = W / 2 + math.cos(a) * r; y = 26 + math.sin(a) * r * .9 - (8 if k > 20 else 0)
        for k in range(30):
            a = H(k, 1) * 6.28; r = H(k, 2) * 13; x = W / 2 + math.cos(a) * r; y = 26 + math.sin(a) * r * .9
            c.ellipse(x, y, 4, 3, lambda xx, yy, d, x=x: FERN[5] if d < .3 and xx < x else FERN[4] if xx < W / 2 + 4 else FERN[2])
    else:
        for k in range(9):
            a = math.pi * (.1 + .8 * k / 8); L = 13 + H(k, 3) * 5
            for t in range(int(L)):
                x = W / 2 - math.cos(a) * t * 1.1; y = gy - 17 - math.sin(a) * t * .9 + (t / L) ** 2 * 5
                c.p(x, y, FERN[4] if t % 3 else FERN[5]); c.p(x, y + 1, FERN[2])
    c.outline(); return c
def poster(kind):
    W, Hh = (30, 40); c = C(W, Hh)
    c.rect(2, 2, W - 3, Hh - 3, (226, 216, 190)); c.rect(2, 2, W - 3, 2, (240, 234, 216)); c.darken(2, Hh - 6, W - 3, Hh - 3, .9)
    if kind == 'seeds':
        c.rect(5, 6, W - 6, 9, (180, 50, 40)); c.text(6, 12, 'SEED', (60, 40, 30)); c.text(6, 19, 'CO.', (60, 40, 30)); fruit(c, 20, 28, 5, PUMP); c.p(20, 22, LEAF2[3])
    elif kind == 'fair':
        c.rect(5, 6, W - 6, 13, (40, 70, 120)); c.text(7, 8, 'FAIR', (240, 220, 160)); c.text(6, 17, 'OCT', (60, 40, 30)); c.text(6, 24, '31', (180, 50, 40))
    else:   # a missing poster, the face scratched out
        c.text(6, 5, 'LOST', (40, 30, 30)); c.rect(8, 12, W - 9, 28, (190, 180, 160)); c.ellipse(W / 2, 19, 5, 6, (150, 140, 120))
        for k in range(10): c.line(W / 2 - 5 + k, 14, W / 2 - 4 + k, 25, (60, 50, 50))
        c.text(5, 31, 'AGE 9', (40, 30, 30))
    for x, y in ((3, 3), (W - 4, 3)): c.p(x, y, BRASS[5])
    c.outline((60, 44, 34)); return c
def sign_open():
    c = C(40, 26); c.line(8, 2, 14, 8, IRON[3]); c.line(31, 2, 25, 8, IRON[3])
    c.rect(4, 8, 35, 22, lambda x, y: WOOD[4] if y < 10 else WOOD[3]); c.rect(6, 11, 33, 19, (230, 220, 196)); c.text(10, 13, 'OPEN', (170, 40, 30)); c.outline(); return c
def cat():
    c = C(34, 22); gy = 19; shadow_under(c, 17, gy, 14, 2.5)
    c.ellipse(17, gy - 4, 13, 5, lambda x, y, d: (196, 190, 180) if d < .5 and y < gy - 5 else (150, 120, 70))   # the cushion
    R = ramp('#3a3436', spread=.8)
    c.ellipse(16, gy - 9, 8, 4.4, lambda x, y, d: R[4] if d < .35 and y < gy - 9 else R[3] if x < 19 else R[2])
    c.ellipse(9, gy - 10, 3.6, 3, lambda x, y, d: R[4] if y < gy - 11 else R[3])
    c.p(7, gy - 13, R[3]); c.p(10, gy - 13, R[3]); c.p(8, gy - 10, (200, 180, 60))
    for k in range(7): c.p(22 + k * .9, gy - 7 + math.sin(k * .6) * 1.2, R[2])   # the tail wrapped round
    c.outline(); return c
# ---- the forge
def forgehearth(night):
    W, Hh = 92, 110; c = C(W, Hh); gy = 106; shadow_under(c, W / 2, gy, 42, 4)
    c.rect(W / 2 - 9, 2, W / 2 + 9, 44, bricks(BRK) if False else (lambda x, y: BRK[3] if ((y // 4) % 2 == 0 and x % 8 < 7) or ((y // 4) % 2 and (x + 4) % 8 < 7) else BRK[1]))   # the chimney
    c.poly([(W / 2 - 26, 44), (W / 2 + 26, 44), (W / 2 + 12, 30), (W / 2 - 12, 30)], lambda x, y: IRON[3] if x < W / 2 + 6 else IRON[2]); c.rect(W / 2 - 26, 44, W / 2 + 26, 46, IRON[1])   # the hood
    def brk(x, y):
        row = y // 5; off = 4 if row % 2 else 0
        if y % 5 == 4 or (x + off) % 9 == 0: return BRK[1]
        return BRK[3] if H((x + off) // 9, row, 7) > .35 else BRK[2]
    c.rect(6, 62, W - 7, gy - 1, brk); c.rect(4, 56, W - 5, 62, lambda x, y: STONE[5] if y == 56 else STONE[4])   # the hearth and its stone top
    c.ellipse(W / 2, 59, 24, 4, lambda x, y, d: EMBER[4 if night else 3] if d < .35 else EMBER[3 if night else 2] if d < .7 else EMBER[1])   # coals on the hearth
    for k in range(14): x = W / 2 - 20 + H(k, 1) * 40; c.p(x, 57 + H(k, 2) * 4, EMBER[5])
    c.rect(W / 2 - 14, 72, W / 2 + 14, 92, (24, 12, 8)); c.rect(W / 2 - 12, 82, W / 2 + 12, 92, lambda x, y: EMBER[3] if (x + y) % 3 else EMBER[4])   # the ash door, glowing
    c.rect(W - 18, 62, W - 8, 74, WOOD[3]); c.ellipse(W - 13, 62, 6, 2, WOOD[5])   # the bellows on its side
    c.outline(); return c
def quench():
    W, Hh = 60, 34; c = C(W, Hh); gy = 31; shadow_under(c, W / 2, gy, 27)
    box(c, 4, 10, W - 5, gy - 1, 5, ramp('#6a6e74', spread=.6), plank=False)
    c.rect(7, 11, W - 8, 13, WATER[3]); c.rect(9, 11, 20, 11, WATER[5]); c.rect(7, 17, W - 8, 17, IRON[1]); c.rect(7, 24, W - 8, 24, IRON[1])
    c.outline(); return c
def toolwall():
    W, Hh = 80, 46; c = C(W, Hh)
    c.rect(2, 2, W - 3, Hh - 3, lambda x, y: (150, 120, 84) if (x % 6 or y % 6) else (110, 84, 60))   # pegboard
    c.rect(2, 2, W - 3, 3, (176, 146, 104)); c.darken(2, Hh - 6, W - 3, Hh - 3, .85)
    for i, kind in enumerate(('ham', 'tong', 'ham', 'file', 'tong', 'ham', 'saw')):
        x = 8 + i * 10
        if kind == 'ham': c.rect(x, 8, x + 1, 30, WOOD[3]); c.rect(x - 3, 6, x + 4, 10, IRON[4])
        elif kind == 'tong': c.line(x - 2, 8, x, 34, IRON[3]); c.line(x + 3, 8, x + 1, 34, IRON[4])
        elif kind == 'file': c.rect(x, 8, x + 1, 32, IRON[4]); c.rect(x, 26, x + 1, 34, WOOD[3])
        else: c.poly([(x - 3, 8), (x + 4, 8), (x + 4, 32), (x - 3, 26)], IRON[4]); c.rect(x - 4, 6, x + 5, 9, WOOD[3])
    c.outline((60, 44, 34)); return c
def grindstone():
    W, Hh = 46, 50; c = C(W, Hh); gy = 46; shadow_under(c, W / 2, gy, 18)
    for x in (12, 32): c.rect(x, 26, x + 2, gy - 1, WOOD[3])
    c.rect(10, 36, 36, 38, WOOD[4]); c.ellipse(W / 2, 22, 13, 13, lambda x, y, d: STONE[5] if d < .3 and x < W / 2 else STONE[4] if d < .75 else STONE[2])
    c.rect(W / 2 - 1, 22, W / 2 + 14, 23, IRON[4]); c.rect(W / 2 + 13, 20, W / 2 + 15, 27, WOOD[4]); c.outline(); return c
# ---- the carpentry
def sawhorse():
    W, Hh = 64, 40; c = C(W, Hh); gy = 36; shadow_under(c, W / 2, gy, 28)
    for x in (12, 50):
        c.line(x - 5, gy - 1, x, 16, WOOD[2], 2); c.line(x + 5, gy - 1, x, 16, WOOD[3], 2)
    c.rect(4, 12, W - 5, 18, lambda x, y: PINE[5] if y == 12 else PINE[4] if y < 15 else PINE[3])   # a plank laid across, half sawn
    c.rect(36, 12, 37, 18, (40, 30, 24)); c.poly([(37, 12), (46, 6), (48, 8), (39, 14)], lambda x, y: IRON[4]); c.rect(46, 4, 50, 8, WOOD[3])
    for k in range(10): c.p(30 + H(k, 1) * 14, gy - H(k, 2) * 4, PINE[5])   # sawdust
    c.outline(); return c
def lathe():
    W, Hh = 76, 50; c = C(W, Hh); gy = 46; shadow_under(c, W / 2, gy, 34)
    for x in (10, 62): c.rect(x, 22, x + 4, gy - 1, IRON[2])
    c.rect(6, 18, W - 7, 24, lambda x, y: IRON[4] if y == 18 else IRON[3]); c.rect(8, 8, 20, 18, IRON[3]); c.rect(56, 10, 66, 18, IRON[3])
    c.rect(20, 11, 56, 15, lambda x, y: PINE[4] if (x // 3) % 2 else PINE[3])   # a chair leg being turned
    c.ellipse(14, 13, 4, 4, IRON[4]); c.outline(); return c
def chairstack():
    W, Hh = 44, 70; c = C(W, Hh); gy = 66; shadow_under(c, W / 2, gy, 16)
    for k in range(3):
        y = gy - 22 - k * 14; R = [OAK, PINE, ramp('#7a4a2a', spread=.6)][k]
        c.rect(8, y, 36, y + 4, lambda x, yy, R=R: R[5] if yy == y else R[4])
        for x in (9, 34): c.rect(x, y + 4, x + 2, y + 18, R[2])
        c.rect(8, y - 12, 10, y, R[3]); c.rect(34, y - 12, 36, y, R[3]); c.rect(8, y - 12, 36, y - 10, R[4])
    c.rect(6, 12, 38, 14, (236, 228, 210)); c.text(10, 8, '4C', (60, 40, 30))
    c.outline(); return c
# ---- the feed barn
def feedbins():
    W, Hh = 96, 46; c = C(W, Hh); gy = 42; shadow_under(c, W / 2, gy, 44)
    for i, R in enumerate((GRAIN, ramp('#c8a050', spread=.5), ramp('#a87a40', spread=.6))):
        x0 = 6 + i * 29; box(c, x0, 12, x0 + 26, gy - 1, 6, OAK)
        c.ellipse(x0 + 13, 15, 11, 3, lambda x, y, d, R=R: R[5] if d < .3 else R[4] if d < .7 else R[2])
        c.rect(x0 + 15, 8, x0 + 22, 12, IRON[4]); c.rect(x0 + 20, 6, x0 + 22, 8, WOOD[3])   # the scoop
        c.rect(x0 + 6, 24, x0 + 20, 30, (230, 222, 200)); c.text(x0 + 8, 25, ['OAT', 'CRN', 'MSH'][i], (60, 40, 30))
    c.outline(); return c
def chickcrate():
    W, Hh = 46, 34; c = C(W, Hh); gy = 30; shadow_under(c, W / 2, gy, 20)
    c.rect(4, 12, W - 5, gy - 1, lambda x, y: OAK[3] if (x - 4) % 6 > 1 else OAK[1]); c.rect(4, 10, W - 5, 12, OAK[4]); c.rect(6, 13, W - 7, 16, STRAW[4])
    for k, x in enumerate((10, 17, 25, 32)):
        y = 12 - (k % 2); c.ellipse(x, y, 3, 2.6, lambda xx, yy, d: STRAW[5] if d < .4 else STRAW[3]); c.p(x - 2, y - 1, (30, 20, 10)); c.p(x - 3, y, (230, 140, 40))
    c.outline(); return c
def saddle():
    W, Hh = 46, 46; c = C(W, Hh); gy = 42; shadow_under(c, W / 2, gy, 18)
    for x in (10, 34): c.line(x, gy - 1, W / 2, 22, WOOD[2], 2)
    R = ramp('#7a3a1e', spread=.7); c.ellipse(W / 2, 20, 15, 7, lambda x, y, d: R[5] if d < .3 and y < 19 else R[4] if y < 21 else R[2])
    c.rect(W / 2 + 6, 10, W / 2 + 9, 16, R[3]); c.rect(W / 2 - 13, 24, W / 2 - 10, 34, R[2]); c.rect(W / 2 - 14, 34, W / 2 - 9, 36, BRASS[4])
    c.outline(); return c
# ---- the bait shop
def tank():
    W, Hh = 66, 50; c = C(W, Hh); gy = 46; shadow_under(c, W / 2, gy, 30)
    box(c, 4, 24, W - 5, gy - 1, 4, ramp('#5a6e7a', spread=.6), plank=False)
    c.rect(7, 8, W - 8, 24, lambda x, y: WATER[4] if y < 11 else WATER[3] if (x + y) % 9 else WATER[4]); c.rect(6, 7, W - 7, 7, GLASS[5])
    for k in range(4): x = 12 + k * 13; c.poly([(x, 16), (x + 6, 14), (x + 8, 16), (x + 6, 18)], (150, 140, 120)); c.p(x + 1, 16, (30, 30, 30))
    for k in range(6): c.p(12 + H(k, 1) * 40, 10 + H(k, 2) * 10, (220, 240, 250))
    c.rect(10, 30, W - 11, 36, (230, 222, 200)); c.text(14, 31, 'LIVE BAIT', (40, 60, 90))
    c.outline(); return c
def fishmount():
    W, Hh = 54, 26; c = C(W, Hh)
    c.rect(2, 4, W - 3, Hh - 3, lambda x, y: OAK[4] if y < 6 else OAK[3]); R = ramp('#5a7a5a', spread=.7)
    c.poly([(8, 13), (20, 7), (36, 8), (44, 12), (36, 17), (20, 18)], lambda x, y: R[4] if y < 12 else R[2]); c.poly([(44, 12), (52, 7), (52, 18)], R[3])
    c.p(14, 11, (240, 230, 200)); c.p(14, 12, (20, 20, 20)); c.rect(18, 12, 34, 12, R[5]); c.outline((60, 44, 34)); return c
def lures():
    W, Hh = 46, 40; c = C(W, Hh)
    c.rect(2, 2, W - 3, Hh - 3, (64, 84, 104)); c.rect(2, 2, W - 3, 3, (90, 110, 130))
    for k in range(12):
        x = 7 + (k % 4) * 10; y = 8 + (k // 4) * 10; R = ramp(['#e83a2a', '#f0c040', '#3ac06a', '#e8e8e8'][k % 4]); c.rect(x, y, x + 4, y + 3, R[4]); c.p(x + 4, y + 4, IRON[5]); c.line(x + 2, y - 2, x + 2, y, (200, 200, 200))
    c.outline((40, 34, 30)); return c

for n, fn, foot in (('in_produce', produce, (-1.4, -.5, 1.4, 0)), ('in_seedrack', seedrack, (-.6, -.3, .6, 0)), ('in_candycase', candycase, (-1, -.5, 1, 0)),
                    ('in_plant', lambda: plant(False), (-.3, -.25, .3, 0)), ('in_plant2', lambda: plant(True), (-.35, -.3, .35, 0)), ('in_cat', cat, (0, 0, 0, 0)),
                    ('in_quench', quench, (-.85, -.4, .85, 0)), ('in_grindstone', grindstone, (-.5, -.3, .5, 0)), ('in_sawhorse', sawhorse, (-.9, -.3, .9, 0)),
                    ('in_lathe', lathe, (-1.1, -.4, 1.1, 0)), ('in_chairstack', chairstack, (-.6, -.4, .6, 0)), ('in_feedbins', feedbins, (-1.4, -.5, 1.4, 0)),
                    ('in_chickcrate', chickcrate, (-.65, -.4, .65, 0)), ('in_saddle', saddle, (-.6, -.3, .6, 0)), ('in_tank', tank, (-.95, -.5, .95, 0))):
    c = fn(); save(n, c, c.W / 2, c.H - 4, foot=foot)
for n, fn in (('in_poster_seeds', lambda: poster('seeds')), ('in_poster_fair', lambda: poster('fair')), ('in_poster_lost', lambda: poster('lost')), ('in_sign_open', sign_open),
              ('in_toolwall', toolwall), ('in_fishmount', fishmount), ('in_lures', lures)):
    c = fn(); save(n, c, c.W / 2, c.H - 3)
for night in (False, True):
    c = forgehearth(night); save('in_forgehearth' + ('_n' if night else ''), c, c.W / 2, c.H - 4, foot=(-1.3, -.7, 1.3, 0))
d = json.load(open('spr/lpc/objects.json')); d.update(SPR); json.dump(d, open('spr/lpc/objects.json', 'w'))
print(len(SPR), 'sprites:', ' '.join(SPR))
