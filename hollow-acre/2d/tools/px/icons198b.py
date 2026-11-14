"""#198 icons scored 5 at the baseline: hand fixes on the installed icon where one thing was wrong (steam drawn as hairs, a face on
the milk label, a sunny teal mushroom, an uncut loaf...), and redraws where the shape itself was wrong (coat, pearl, bait, corn...).
Tool and weapon icons are LOCKED (owner).      python3 icons198b.py [names] -> out/ic198_<name>.png
"""
import math, sys, colorsys
from PIL import Image
sys.path.insert(0, '.')
from icons198 import Icon, RAMPS, hexr

OBJ = '/tmp/claude-0/-home-user-Minecraftbot/f193b802-e794-5104-89ce-994e8f157fdf/scratchpad/spr/lpc/obj/'


def load(name):
    I = Icon(); I.im = Image.open(OBJ + 'icon32_' + name + '.png').convert('RGBA'); I.p = I.im.load(); return I


def erase_light(I, y0, y1, x0=0, x1=32, minv=110):
    """erase light, low-saturation pixels (old steam hairs) and their outline in a band"""
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b, a = I.p[x, y]
            if a and (max(r, g, b) > minv and max(r, g, b) - min(r, g, b) < 60 or max(r, g, b) < 60):
                I.p[x, y] = (0, 0, 0, 0)


def puffs(I, pts):
    """soft steam: rounded puffs lit top-left, see-through, no outline"""
    for (cx, cy, r) in pts:
        for y in range(int(cy - r) - 1, int(cy + r) + 2):
            for x in range(int(cx - r) - 1, int(cx + r) + 2):
                d = ((x + .5 - cx) ** 2 + (y + .5 - cy) ** 2) / (r * r)
                if d > 1 or not (0 <= x < 32 and 0 <= y < 32) or I.p[x, y][3] > 200:
                    continue
                c = (226, 222, 218) if (x - cx) + (y - cy) < -r * .3 else (176, 172, 172)
                I.p[x, y] = c + (int(150 + 60 * (1 - d)),)


def steam_bowl(name, y1, pts):
    I = load(name); erase_light(I, 0, y1); puffs(I, pts); return I.im


def chowder(): return steam_bowl('chowder', 13, [(11, 9, 2.6), (16, 6.5, 3.2), (21, 9.5, 2.2)])
def soup(): return steam_bowl('soup', 13, [(12, 9, 2.6), (17, 6.5, 3), (21, 10, 2)])
def stew(): return steam_bowl('stew', 13, [(11, 9.5, 2.4), (16, 7, 3.2), (21, 9.5, 2.4)])
def hash_(): return steam_bowl('hash', 12, [(12, 8.5, 2.4), (17, 6, 3), (21, 9, 2)])
def food(): return steam_bowl('food', 18, [(13, 13, 2.4), (18, 11, 2.8)])


def glowstew():
    I = load('glowstew'); erase_light(I, 0, 12, minv=60)
    for y in range(32):                                                       # the crosses were cyan: clear them above the bowl
        for x in range(32):
            r, g, b, a = I.p[x, y]
            if a and y < 13 and g > 150:
                I.p[x, y] = (0, 0, 0, 0)
    for (cx, cy) in ((12, 17), (18, 16), (21, 18)):                          # two or three glowing chunks floating in it
        for (dx, dy, c) in ((0, 0, (150, 255, 226)), (1, 0, (90, 210, 190)), (0, 1, (90, 210, 190)), (1, 1, (40, 150, 140))):
            I.p[cx + dx, cy + dy] = c + (255,)
    puffs(I, [(14, 9, 2.4), (19, 7, 2.8)])
    for y in range(4, 12):                                                    # the steam lit green from below
        for x in range(10, 24):
            r, g, b, a = I.p[x, y]
            if a and a < 255:
                I.p[x, y] = (r - 30, min(255, g + 10), b - 10, a)
    return I.im


def milk():
    I = load('milk')
    for y in range(32):
        for x in range(32):
            r, g, b, a = I.p[x, y]
            if a and r > 200 and g > 200 and b > 200 and 13 < y < 24 and 10 < x < 24:
                lab = I.p[x - 1, y] if x > 0 else (0, 0, 0, 0)
                if lab[2] > lab[0] + 30:                                     # a dot sitting on the blue label: paint it label blue
                    I.p[x, y] = lab
    for x in range(13, 21):
        I.p[x, 19] = (220, 224, 230, 255)                                    # one plain white stripe on the label instead
    return I.im


def mushroom():
    I = load('mushroom')
    for y in range(32):
        for x in range(32):
            r, g, b, a = I.p[x, y]
            if a and g > r + 20 and b > r + 10:                               # the teal cap, dulled toward a grey-green
                h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
                r2, g2, b2 = colorsys.hls_to_rgb(h, l * .85, s * .45)
                I.p[x, y] = (int(r2 * 255), int(g2 * 255), int(b2 * 255), a)
    ys = [y for y in range(32) for x in range(32) if I.p[x, y][3] and I.p[x, y][1] > I.p[x, y][0]]
    capb = max(ys) if ys else 20
    for x in range(9, 24):                                                    # the gills: a dark band under the cap's rim
        if I.p[x, capb][3]:
            I.p[x, capb] = (40, 44, 40, 255)
    return I.im


def stone():
    I = load('stone')
    for (x, y) in ((14, 13), (15, 14), (15, 15), (16, 16), (17, 17), (16, 18), (13, 15)):
        if I.p[x, y][3]:
            I.p[x, y] = (38, 36, 44, 255)
            if I.p[x + 1, y][3]: I.p[x + 1, y] = (150, 146, 156, 255)
    return I.im


def wood():
    I = load('wood')
    for y in range(32):
        for x in range(32):
            r, g, b, a = I.p[x, y]
            if a and r > 190 and g > 170 and b > 130:                         # the cream end grain, dulled to tan
                I.p[x, y] = (int(r * .78), int(g * .72), int(b * .62), a)
    return I.im


def lamp():
    I = load('lamp')
    for y in range(32):
        for x in range(32):
            r, g, b, a = I.p[x, y]
            if a and r > 220 and g > 150 and b < 120:                         # grow the flame by a pixel all round, brightest at its heart
                for dx, dy in ((0, -1), (-1, 0), (1, 0)):
                    X, Y = x + dx, y + dy
                    if I.p[X, Y][3] and I.p[X, Y][2] > 150:
                        I.p[X, Y] = (255, 214, 120, 255)
                I.p[x, y] = (255, 246, 200, 255)
    return I.im


def bread():
    I = load('bread')
    for k, (x0, y0) in enumerate(((10, 12), (15, 11), (20, 12))):              # three scored cuts across the top
        for t in range(5):
            x, y = x0 + t, y0 + 3 - t
            if I.p[x, y][3]:
                I.p[x, y] = (122, 70, 34, 255)
                if I.p[x, y - 1][3]: I.p[x, y - 1] = (232, 196, 128, 255)
    return I.im


def ring():
    I = load('it_ring')
    for t in range(9):                                                        # a bright specular arc on the band's upper left
        a = math.pi * (1.05 + t * .07); x, y = int(16 + math.cos(a) * 8.5), int(19 + math.sin(a) * 6.5)
        if I.p[x, y][3]:
            I.p[x, y] = (236, 240, 248, 255)
    return I.im


def lumber():
    I = Icon()
    for k, (y, L, x0) in enumerate(((9, 22, 4), (14, 19, 7), (19, 23, 3), (24, 17, 8))):   # boards of different lengths, staggered
        for x in range(x0, x0 + L):
            for j in range(4):
                l = .78 if j == 0 else .55 if j < 3 else .3
                if (x * 3 + k * 5) % 11 == 0 and 0 < j < 3:
                    l -= .14                                                  # grain
                I.P(x, y + j, I.band('wd', l))
        for j in range(4):
            I.P(x0 + L, y + j, I.band('wd', .9 if j < 2 else .7))            # the sawn end, pale
    return I.done()


def corn():
    I = Icon()
    for (pts, l) in (([(5, 28), (8, 15), (13, 22)], .45), ([(5, 28), (19, 25), (13, 20)], .3)):   # the husk peeled back
        I.poly(pts, 'gr' if 'gr' in RAMPS else 'ol', l)
    a = math.radians(-45)
    for y in range(32):
        for x in range(32):
            u = (x + .5 - 9) * .7071 - (y + .5 - 24) * .7071; v = (x + .5 - 9) * .7071 + (y + .5 - 24) * .7071
            if u < 0 or u > 21:
                continue
            half = 4.8 * math.sin(math.pi * min(1, (u + 1.5) / 23) ** .8)
            if abs(v) > half:
                continue
            row = int((v + 10) // 2); cu = (u + (row % 2)) % 2; cv = (v + 10) % 2
            sh = .85 - (v + half) / (2 * half + .01) * .45
            k = sh if (cu < 1 and cv < 1) else sh - .2 if (cu < 1 or cv < 1) else sh - .45
            I.P(x, y, I.band('yl', k))                                        # 2x2 old-gold kernels in staggered rows
    return I.done()


def fiber():
    I = Icon()
    for k, (x0, bend) in enumerate(((11, .5), (15, -.3), (19, .2), (13, -.6), (17, .7))):   # five strands, twisted, of different lengths
        for t in range(22 - k * 2):
            x = x0 + math.sin(t * .35 + k) * 1.2 + bend * t * .2; y = 28 - t
            I.P(x, y, I.band('ol', .75 - (t % 4 == 0) * .2)); I.P(x + 1, y, I.band('ol', .4))
    for x in range(10, 23):
        I.P(x, 17, RAMPS['bu'][4]); I.P(x, 18, RAMPS['bu'][2])                # the twist of twine round them
    return I.done()


def egg_fried():
    I = Icon(); import random; R = random.Random(3)
    for y in range(32):
        for x in range(32):
            d = ((x - 16) / 12.5) ** 2 + ((y - 18) / 8) ** 2 + R.uniform(-.08, .08)
            if d < 1:
                I.P(x, y, (226, 162, 96) if d > .86 else (246, 240, 228) if (x + y) < 30 else (226, 220, 210))   # the white, its edge browned and ragged
    I.blob(15, 16, 4.6, 3.8, 'yl', amb=.3)
    I.P(13, 14, RAMPS['yl'][6]); I.P(14, 14, RAMPS['yl'][6])
    return I.done()


def fish_fried():
    I = Icon()
    I.blob(16, 21, 14, 7, 'wh', mod=lambda x, y, l, nx, ny: .55 + l * .4)                  # the plate
    I.blob(14, 18, 8, 3.6, 'og', mod=lambda x, y, l, nx, ny: .35 + l * .6)                 # the battered fish, its outline kept
    I.poly([(21, 18), (27, 14), (26, 18), (27, 22)], 'og', .45)                            # the tail
    I.P(8, 17, RAMPS['ck'][1])                                                             # the eye
    for x in range(9, 20, 3):
        I.P(x, 16, RAMPS['og'][6])
    return I.done()


def bait():
    I = Icon()
    I.poly([(8, 13), (24, 13), (24, 29), (8, 29)], 'mt', lambda x, y: .7 - (x - 8) * .025)   # a tin can, plain label
    I.poly([(8, 18), (24, 18), (24, 24), (8, 24)], 'bu', .55)
    I.blob(16, 13, 8, 2.2, 'mt', amb=.4)
    import random; R = random.Random(9)
    for k in range(3):                                                                     # worms spilling over the rim, segmented
        x, y = 11 + k * 4, 12
        for t in range(9):
            x += math.cos(t * .9 + k) * 1.1; y -= .7
            I.P(x, y, (176, 104, 98) if t % 2 else (140, 74, 72)); I.P(x + 1, y, (110, 56, 56))
    return I.done()


def bouquet():
    I = Icon()
    for k, (x1, y1) in enumerate(((10, 9), (16, 6), (22, 9), (13, 13), (20, 13))):
        for t in range(16):
            I.P(16 + (x1 - 16) * t / 16, 28 - (28 - y1) * t / 16, RAMPS['ol'][3])          # the stems gathered at the bottom
    for k, (cx, cy, r) in enumerate(((10, 8, 3), (16, 5, 3.4), (22, 8, 3), (13, 12, 2.6), (20, 12, 2.6))):
        I.blob(cx, cy, r, r, 'pu' if 'pu' in RAMPS else 'rd', amb=.25)                     # fewer, bigger heads in one hue
        I.P(cx, cy, RAMPS['yl'][5])
    for x in range(13, 20):
        I.P(x, 22, RAMPS['bu'][4])                                                         # tied with twine
    return I.done()


def candy_apple():
    I = Icon()
    I.blob(16, 21, 9, 8.5, 'rd', mod=lambda x, y, l, nx, ny: .2 + l * .8)
    for (x, y) in ((12, 16), (12, 17), (13, 16)):
        I.P(x, y, (255, 236, 230))                                                         # a hard glaze glint
    for y in range(4, 14):
        I.P(16, y, RAMPS['wd'][5]); I.P(17, y, RAMPS['wd'][3])                             # the stick standing up
    for x in range(9, 24):
        I.P(x, 29, RAMPS['rd'][2])                                                         # a puddle of glaze at its foot
    I.P(12, 30, RAMPS['rd'][1]); I.P(21, 30, RAMPS['rd'][1])
    return I.done()


def chicory():
    I = Icon()
    for (x1, y1) in ((10, 10), (21, 9), (16, 15)):
        for t in range(16):
            I.P(16 + (x1 - 16) * t / 16, 29 - (29 - y1) * t / 16, RAMPS['ol'][3])
    for (cx, cy) in ((10, 9), (21, 8), (16, 14)):                                         # larger five-petal heads
        for k in range(5):
            a = k * 2 * math.pi / 5 - math.pi / 2
            I.blob(cx + math.cos(a) * 2.6, cy + math.sin(a) * 2.6, 1.8, 1.8, 'bl', amb=.45)
        I.P(cx, cy, RAMPS['bl'][1])
    return I.done()


def coat():
    I = Icon()
    I.poly([(9, 5), (16, 8), (23, 5), (27, 9), (28, 22), (24, 22), (24, 30), (8, 30), (8, 22), (4, 22), (5, 9)], 'le', lambda x, y: .55 if x < 15 else .38)   # a long coat, to the knee
    I.poly([(12, 5), (16, 14), (16, 18), (13, 10)], 'le', .75); I.poly([(20, 5), (16, 14), (16, 18), (19, 10)], 'le', .3)   # the lapels
    for y in range(14, 30):
        I.P(16, y, RAMPS['le'][1])
    for y in (16, 20, 24):
        I.P(14, y, RAMPS['br'][5])
    return I.done(rim=True)


def cranberry():
    I = Icon(); import random; R = random.Random(4)
    for (cx, cy, r) in ((10, 20, 3.4), (15, 23, 3.8), (21, 21, 3.2), (13, 15, 2.8), (19, 15, 3.6), (24, 17, 2.4), (17, 9, 2.6)):
        I.blob(cx, cy, r, r * .95, 'rd', amb=.18)
        I.P(int(cx - r * .4), int(cy - r * .45), RAMPS['rd'][6])                            # a highlight on each, sized to the berry
    return I.done()


def pearl():
    I = Icon()
    for k in range(9):                                                                     # an open clam: the lower shell, ridged
        a = math.pi * (.08 + k * .1)
        for t in range(12):
            x = 16 + math.cos(a) * t; y = 26 - math.sin(a) * t * .55
            I.P(x, y, I.band('pp', .7 - (k % 2) * .2))
    for k in range(9):                                                                     # the upper shell lifted behind
        a = math.pi * (1.08 + k * .1)
        for t in range(11):
            x = 16 + math.cos(a) * t; y = 15 + math.sin(a) * t * .5
            I.P(x, y, I.band('pp', .5 - (k % 2) * .15))
    I.blob(16, 19, 4, 4, 'wh', amb=.35); I.P(15, 17, RAMPS['wh'][6])                       # the pearl
    return I.done()


def rosehip():
    I = Icon()
    for t in range(20):
        I.P(5 + t * .9, 27 - t * .9, RAMPS['wd'][3])
    for (cx, cy) in ((10, 20), (16, 15), (22, 10), (19, 21)):
        I.blob(cx, cy, 2.4, 3.6, 'og', amb=.25)                                            # oval hips
        for dx in (-1, 0, 1):
            I.P(cx + dx, cy - 4, RAMPS['ck'][2])                                           # the dark crown at each tip
    return I.done()


FIX = {'chowder': chowder, 'soup': soup, 'stew': stew, 'hash': hash_, 'food': food, 'glowstew': glowstew, 'milk': milk,
       'mushroom': mushroom, 'stone': stone, 'wood': wood, 'lamp': lamp, 'bread': bread, 'it_ring': ring, 'lumber': lumber,
       'corn': corn, 'fiber': fiber, 'egg_fried': egg_fried, 'fish_fried': fish_fried, 'bait': bait, 'it_bouquet': bouquet,
       'it_candy_apple': candy_apple, 'it_chicory': chicory, 'it_coat': coat, 'it_cranberry': cranberry, 'it_pearl': pearl,
       'it_rosehip': rosehip}

# ---- round 5: the judge's first fixes on the r4 winners ----


def chaga2():
    # (r4: "fewer, bigger crust plates and a larger rust-orange broken face; tone the bark below white")
    I = Icon()
    I.poly([(2, 24), (29, 20), (30, 28), (3, 31)], 'wh', lambda x, y: .5 if y < 26 else .32)          # the birch bark, toned down
    for (x, y) in ((6, 27), (7, 27), (15, 25), (16, 25), (24, 24), (25, 24)):
        I.P(x, y, RAMPS['ck'][1])
    for (cx, cy, r) in ((11, 15, 7), (19, 14, 6.5), (14, 21, 6)):                                       # three big crust plates
        I.blob(cx, cy, r, r * .85, 'ck', amb=.1, k=.95, mod=lambda x, y, l, nx, ny: max(.05, l * .66))
    for (x0, y0, x1, y1) in ((15, 8, 16, 18), (9, 20, 19, 19)):
        n = max(abs(x1 - x0), abs(y1 - y0))
        for i in range(n + 1):
            I.P(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, RAMPS['ck'][0])                     # two deep cracks between them
    for y in range(9, 23):                                                                              # the broken face: a wide wedge of rust-orange flesh
        w = int(5 - abs(y - 15) * .5)
        x0 = 22 + (y % 3 == 0) - (y % 5 == 0)
        for i in range(max(0, w)):
            I.P(x0 + i, y, RAMPS['og'][5 if i == 0 else 4 if i < 2 else 3])
        if w > 0:
            I.P(x0 - 1, y, RAMPS['ck'][0])
    return I.done(rim=True)


def flask2():
    # (r4: "a decanter: ball stopper, round shoulders") a flat hip flask, tilted as if set down on its corner: a tall
    # rounded-corner slab whose top dips at the shoulders, a short neck, a flat knurled cap, a leather wrap, a highlight streak
    I = Icon(); COOL = hexr(['#22242e', '#363a48', '#4e5466', '#6c7286', '#9298aa', '#bcc0ce', '#e4e6ee'])
    ang = math.radians(-16); ca, sa = math.cos(ang), math.sin(ang); ox, oy = 16, 18
    for y in range(32):
        for x in range(32):
            dx, dy = x + .5 - ox, y + .5 - oy
            u = dx * ca + dy * sa; v = -dx * sa + dy * ca
            c = None
            if abs(u) <= 7 and -9 <= v <= 10:
                cu = min(max(u, -4), 4); cv = min(max(v, -6), 7)
                if (v > 7 or v < -6) and (u - cu) ** 2 + (v - cv) ** 2 > 9.5:
                    continue
                l = .76 - (u + 7) * .035
                if -5 <= u <= -3.5:
                    l = .98 if u < -4.2 else .88                                                # the highlight streak
                c = COOL[max(0, min(6, int(l * 6 + .5)))]
                if 0 <= v <= 5:
                    c = I.band('le', (.6 - (u + 7) * .025) - (.18 if v < .8 or v > 4.2 else 0))
                    if abs(v - 2.5) < .5 and int(u + 20) % 2 == 0:
                        c = RAMPS['le'][1]                                                      # stitches
            elif abs(u) <= 2 and -11.5 <= v < -8.5:
                c = I.band('mt', .55 - u * .06)                                                 # the short neck
            elif abs(u) <= 3 and -14 <= v < -11.5:
                c = RAMPS['mt'][4 if v < -13.2 else 3] if int(u + 20) % 2 else RAMPS['mt'][2]   # the flat knurled cap
            if c:
                I.P(x, y, c)
    return I.done()


def _old(n):
    I = Icon(); I.im = Image.open(OBJ.replace('spr/lpc/obj/', 'r5/') + 'old_' + n + '.png').convert('RGBA'); I.p = I.im.load(); return I


def twig_fix():
    # (r4: old won; "the red-orange tip reads as an ember: a pale tan cut face with a bark ring")
    I = _old('twig')
    rep = {(0xe1, 0x9e, 0x4a): (0xb8, 0xa0, 0x7c), (0xc1, 0x6b, 0x2e): (0xa8, 0x8e, 0x68), (0x95, 0x45, 0x25): (0x5a, 0x3e, 0x2c)}
    for y in range(I.im.height):
        for x in range(I.im.width):
            c = I.p[x, y]
            if c[:3] in rep:
                I.p[x, y] = rep[c[:3]] + (255,)
    return I.im


def rock_fix():
    # (r4: old won; "add one crack and one chipped corner on the front face")
    I = _old('rock_0')
    C, Dk, Lt = (0x16, 0x14, 0x1c, 255), (0x24, 0x22, 0x2a, 255), (0x52, 0x4a, 0x56, 255)
    for (x, y) in ((17, 9), (17, 10), (16, 11), (16, 12), (17, 13), (17, 14), (18, 15)):
        I.p[x, y] = C; I.p[x - 1, y] = Lt                                                              # one crack down the front, lit on its left lip
    for (x, y) in ((20, 4), (21, 5), (22, 6)):
        I.p[x, y] = (0, 0, 0, 0)                                                                         # a chip knocked off the top-right corner
    for (x, y) in ((19, 4), (20, 5), (21, 6), (22, 7)):
        I.p[x, y] = C
    for (x, y) in ((19, 5), (20, 6), (21, 7)):
        I.p[x, y] = Dk                                                                                   # the chip's bare face, in shadow
    return I.im


def weeds_fix(n):
    # (r4: old won; "dull the straw one step; group the tips")
    I = _old(n)
    rep = {(0xcc, 0xb8, 0x78): (0xb0, 0x9c, 0x62), (0xb2, 0x9d, 0x5f): (0x9a, 0x88, 0x52)}
    for y in range(I.im.height):
        for x in range(I.im.width):
            c = I.p[x, y]
            if c[:3] in rep:
                I.p[x, y] = rep[c[:3]] + (255,)
    return I.im


R5 = {'chaga2': chaga2, 'flask2': flask2, 'twig': twig_fix, 'rock_0': rock_fix, 'weeds_0': lambda: weeds_fix('weeds_0'),
      'weeds_1': lambda: weeds_fix('weeds_1')}


if __name__ == '__main__':
    for n, f in R5.items():
        f().save(f'out/r5_{n}.png')
    for n in (sys.argv[1:] or FIX):
        FIX[n]().save(f'out/ic198_{n}.png')
    print('ok', len(sys.argv[1:] or FIX))
