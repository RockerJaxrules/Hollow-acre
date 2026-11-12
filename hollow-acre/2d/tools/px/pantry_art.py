"""Icons for the makeables of #237 (the kitchen, the workbench and the farm bench), in the crop icons' kit: lit from the top left,
a darker outline of each colour, one highlight mass, no speckle. Each its own hue and silhouette so a full bag reads at 1x.

    python3 pantry_art.py out_dir
    python3 pantry_art.py --install <game>/spr/lpc/obj <game>/spr/lpc/objects.json
"""
import sys, os, json, math
from PIL import Image
from crops import Canvas, HEX, outline
from crops_more import FERN
from crops_more import ball, CABB
from brew_icons import CROCK, CORK, OAKB, bottle, GOLD

R = lambda *h: [HEX(c) for c in h]
BUTTER = R('#8a6a1a', '#b8922a', '#dcb840', '#f0d470', '#f8e8a4', '#fff6d0')
CHEESE = R('#7a5410', '#a8781c', '#cc9a30', '#e6bc52', '#f4d684', '#fbeab4')
RIND = R('#5a3410', '#7a4a18')
BREAD = R('#4a2a0e', '#7a4a1a', '#a86a2a', '#c88c40', '#e0ae62', '#f0cc8a')
CAKE = R('#5a3418', '#86522a', '#a8703c', '#c48e54', '#dcac70', '#ecc88e')
ICING = R('#c8c0b0', '#e4ded2', '#f6f2ea', '#ffffff')
JAM = R('#2a0a2e', '#481450', '#6a2276', '#8a3a96', '#b066bc')
ROPE = R('#5a4428', '#7e6238', '#a4864c', '#c4a868', '#dcc488')
WICK = R('#4a3418', '#6c4e24', '#8e6a34', '#b08a48', '#ccaa64', '#e0c684')
SOIL = R('#1e140c', '#2e2014', '#42301e', '#58402a', '#6e5236')


def icon_butter():
    """a block of butter on a paper: a pale yellow brick lit on its top face, a pat curled off it"""
    cv = Canvas(32, 32)
    for y in range(10, 26):
        for x in range(4, 29):
            if y < 12 and x > 25: continue
            cv.put(x, y, HEX('#ece4d0') if y > 22 or x < 6 or x > 26 else None) if False else None
    for y in range(18, 27):
        for x in range(3, 30): cv.put(x, y, HEX('#e8e0cc') if (x + y) % 9 else HEX('#d8d0bc'))   # the paper
    for y in range(11, 23):
        for x in range(7, 25):
            top = y < 15
            k = 5 if (top and x < 13) else 4 if top else 3 if x < 20 else 2
            if y == 22: k = 1
            cv.put(x, y, BUTTER[k])
    for x in range(7, 25): cv.put(x, 15, BUTTER[2])                                       # the edge between top and front
    for (x, y) in ((9, 12), (10, 12), (11, 12), (9, 13)): cv.put(x, y, BUTTER[5])
    for k in range(6): cv.put(24 + k * .6, 21 - math.sin(k / 5 * math.pi) * 3, BUTTER[4] if k < 3 else BUTTER[3])   # a curl
    return outline(cv.image())


def icon_cheese():
    """a flat wheel of cheese: a lit top, a darker rind band for its side, and a V cut out of it showing two pale cut faces"""
    cv = Canvas(32, 32); cx, cy, rx, ry, h = 16, 13, 13, 5.5, 9
    a1, a2 = -1.25, -.15
    cut = lambda x, y: a1 < math.atan2((y - cy) / ry, (x - cx) / rx) < a2
    for x in range(cx - rx, cx + rx + 1):                                                   # the rind band
        u = (x - cx) / rx
        if abs(u) > 1: continue
        ytop = cy + ry * math.sqrt(1 - u * u)
        for y in range(int(cy), int(ytop + h) + 1):
            cv.put(x, y, HEX('#c08a2a') if u < -.4 else HEX('#a8761e') if u < .4 else HEX('#86581a'))
    for y in range(int(cy - ry), int(cy + ry) + 1):
        for x in range(cx - rx, cx + rx + 1):
            if (x - cx) ** 2 / rx ** 2 + (y - cy) ** 2 / ry ** 2 > 1: continue
            if cut(x, y): cv.px.pop((x, y), None); continue
            l = -(x - cx) / rx - (y - cy) / ry
            cv.put(x, y, CHEESE[5] if l > .7 else CHEESE[4] if l > -.2 else CHEESE[3])
    for y in range(int(cy - ry), int(cy + 1)):                                             # clear the band behind the notch
        for x in range(cx, cx + rx + 1):
            if cut(x, y): cv.px.pop((x, y), None)
    for (a, col) in ((a1, CHEESE[5]), (a2, CHEESE[3])):                                    # the two pale cut faces, down through the wheel
        for k in range(40):
            t = k / 39; x, y = cx + math.cos(a) * rx * t, cy + math.sin(a) * ry * t
            for d in range(h + 1): cv.put(x, y + d, col)
    for (x, y) in ((cx + 4, cy + 3), (cx + 7, cy + 5)): cv.put(x, y, CHEESE[2])
    return outline(cv.image())


def icon_cornbread():
    """cornbread in its square tin, seen three-quarters: the tin's front wall a darker band below the rim, the domed golden top
    bulging above it with a few short cracks, and where a square was cut, a pale vertical face of crumb"""
    cv = Canvas(32, 32); x0, x1 = 4, 28; rim, front = 13, 7
    for y in range(rim, rim + front):                                                        # the tin's front wall
        for x in range(x0, x1 + 1): cv.put(x, y, HEX('#5a5e6a') if y == rim else HEX('#3e424c') if x > 20 else HEX('#4a4e5a'))
    for x in range(x0, x1 + 1): cv.put(x, rim + front, HEX('#2a2c34'))
    for y in range(4, rim + 1):                                                              # the top, domed above the rim
        for x in range(x0 + 1, x1):
            u = (x - 16) / 12; dome = rim - 1 - 6 * (1 - u * u) ** .5 + (y * 0)
            if y < dome: continue
            if x > 18 and y > 7: continue                                                   # the square already taken
            l = -u - (y - 8) / 5
            cv.put(x, y, BREAD[5] if l > .9 else BREAD[4] if l > .1 else BREAD[3])
    for y in range(8, rim + front):                                                          # the cut: a pale face of crumb, standing up
        for x in range(19, x1):
            if y < rim: cv.put(x, y, HEX('#f4e0a0') if x < 21 else HEX('#e8d088'))
    for x in range(19, x1): cv.put(x, 8, BREAD[3])
    for (xa, ya, xb) in ((8, 8, 11), (12, 6, 15), (9, 11, 12)):
        for x in range(xa, xb + 1): cv.put(x, ya + (x - xa) % 2, BREAD[2])
    return outline(cv.image())


def icon_carrot_cake():
    """a slice of carrot cake, cut face to you: sponge, a stripe of cream, sponge, frosting on top, the wedge's top running back
    to its point; a candied carrot"""
    cv = Canvas(32, 32); x0, x1, ytop, ybot = 6, 26, 13, 27
    for y in range(7, ytop):
        t = (y - 7) / (ytop - 7)
        xa, xb = 20 - (20 - x0) * t, 22 + (x1 - 22) * t
        for x in range(int(xa), int(xb) + 1): cv.put(x, y, ICING[3] if x < 18 else ICING[2])
    for y in range(ytop, ybot + 1):
        for x in range(x0, x1 + 1):
            band = y - ytop
            if band < 2 or 7 <= band <= 8: c = ICING[2] if x < 16 else ICING[1]
            else:
                u = (x - x0) / (x1 - x0); c = CAKE[4] if u < .3 else CAKE[3] if u < .75 else CAKE[2]
            cv.put(x, y, c)
    for (x, y) in ((10, 17), (19, 18), (14, 23), (22, 24), (9, 25)): cv.put(x, y, HEX('#e4741e'))
    for k in range(5): cv.put(15 + k, 9 + k * .3, HEX('#f69a3e') if k < 3 else HEX('#c25014'))
    cv.put(14, 8, FERN[4]); cv.put(13, 7, FERN[3])
    return outline(cv.image())


def icon_jam():
    """a jar of grape jam: dark purple through the glass, a cloth cap tied on with string"""
    cv = bottle(R('#20102a', '#341a40', '#4a2a56', '#7a5a8a', '#b8a4c4', '#ffffff'), JAM + [HEX('#c88ad0')], .9, (8, 12, 29), (7, 10), shape='squat')
    for y in range(6, 12):
        for x in range(-9, 10): cv.put(16 + x, y, HEX('#d8c8a0') if (x + y) % 4 else HEX('#c04a3a'))   # a gingham cap
    for x in range(-8, 9): cv.put(16 + x, 11, HEX('#8a6a3a'))
    for y in range(14, 27): cv.put(9, y, HEX('#e8d8f0')) if y < 18 else None
    return outline(cv.image())


def icon_kraut():
    """a straight-sided stoneware crock: a flat base, a lip at the rim, the upper half in brown glaze, cabbage leaves curling
    over the rim under a flat weight stone"""
    cv = Canvas(32, 32); x0, x1, top, bot = 8, 24, 12, 28
    GL = R('#3e2412', '#5a361c', '#764a28', '#92603a')
    for y in range(top, bot + 1):
        bel = round(math.sin((y - top) / (bot - top) * math.pi) * 1.2)
        for x in range(x0 - bel, x1 + bel + 1):
            u = (x - 16) / (8 + bel)
            c = (GL[3] if u < -.5 else GL[2] if u < .3 else GL[1]) if y < 20 else (CROCK[4] if u < -.5 else CROCK[3] if u < .3 else CROCK[2])
            cv.put(x, y, c)
    for x in range(x0 - 1, x1 + 2): cv.put(x, top - 1, GL[3] if x < 16 else GL[2]); cv.put(x, top, GL[1])
    for x in range(x0, x1 + 1):
        if x % 4 == 1: cv.put(x, 20, GL[2])
    for (cx_, d) in ((10, -1), (22, 1)):
        for k in range(6): cv.put(cx_ + d * (k // 2), top - 2 - (k % 3), CABB[5] if k % 2 else CABB[6])
    for y in range(-2, 2):
        for x in range(-7, 8):
            if x * x / 49 + (y + .5) ** 2 / 4 > 1: continue
            cv.put(16 + x, top - 3 + y, HEX('#9a948c') if y < 0 and x < 2 else HEX('#76726c'))
    return outline(cv.image())


def icon_sauerkraut():
    """a bowl of sauerkraut: long curving shreds in two pale yellow-greens, a few dark caraway seeds"""
    cv = Canvas(32, 32); cx = 16
    for y in range(16, 28):
        t = (y - 16) / 12; w = 13 - t * t * 5
        for x in range(int(-w), int(w) + 1):
            u = x / w; cv.put(cx + x, y, OAKB[4] if u < -.5 else OAKB[3] if u < .2 else OAKB[2] if u < .7 else OAKB[1])
    for y in range(-6, 3):
        for x in range(-12, 13):
            if x * x / 144 + (y + 1) ** 2 / 30 > 1: continue
            cv.put(cx + x, 16 + y, HEX('#c8c48a') if (x + y) > 4 else HEX('#d8d4a0'))
    for i, (x0, y0, ln, ph) in enumerate(((-10, -1, 9, 0), (-6, -4, 10, 1.2), (-2, -2, 11, 2.0), (1, -5, 9, .6), (4, 0, 8, 1.7), (-8, 1, 8, 2.6))):
        for k in range(ln): cv.put(cx + x0 + k, 16 + y0 + round(math.sin(k * .55 + ph) * 1.2), HEX('#ece8c0') if i % 2 == 0 else HEX('#b8b47a'))
    for (x, y) in ((-5, -2), (3, -3), (6, 1), (-1, 1)): cv.put(cx + x, 16 + y, HEX('#4a3a24'))
    return outline(cv.image())


def icon_potato_soup():
    """a bowl of potato soup: creamy, with potato cubes and a fleck of green"""
    cv = Canvas(32, 32); cx = 16
    for y in range(14, 28):
        t = (y - 14) / 14; w = 13 - t * t * 6
        for x in range(int(-w), int(w) + 1):
            u = x / w; cv.put(cx + x, y, HEX('#b8b0a0') if u < -.4 else HEX('#9a9282') if u < .4 else HEX('#7a7264'))
    for y in range(-4, 5):
        for x in range(-13, 14):
            d = x * x / 169 + y * y / 16
            if d > 1: continue
            cv.put(cx + x, 14 + y, HEX('#d8d0c0') if d > .78 and y < 0 else HEX('#a8a090') if d > .78 else HEX('#f0e2b8') if x < 2 else HEX('#e2d2a4'))
    for (x, y) in ((-6, -1), (2, 0), (-2, 2), (6, -1)):
        for (dx, dy, c) in ((0, 0, '#f8eec8'), (1, 0, '#e8d49a'), (0, 1, '#d8c088')): cv.put(cx + x + dx, 14 + y + dy, HEX(c))
    cv.put(cx - 4, 13, FERN[4]); cv.put(cx + 4, 15, FERN[4])
    return outline(cv.image())


def icon_rope():
    """a single twisted ring of rope with its centre dark, the twist as diagonal strands lit at the top left, and a short frayed
    end curling along the bottom of the ring"""
    cv = Canvas(32, 32); cx, cy, rx, ry = 16, 15, 11, 8
    for y in range(-ry + 3, ry - 2):                                                         # the hollow in the middle, in shadow
        for x in range(-rx + 3, rx - 2):
            if x * x / (rx - 3) ** 2 + y * y / (ry - 3) ** 2 <= 1: cv.put(cx + x, cy + y, HEX('#3a2c1a') if y > -2 else HEX('#4a3a24'))
    N = 140
    for i in range(N):
        t = i / N * math.pi * 2; x, y = cx + math.cos(t) * rx, cy + math.sin(t) * ry
        nx, ny = math.cos(t), math.sin(t) * rx / ry
        nl = math.hypot(nx, ny); nx, ny = nx / nl, ny / nl
        for o in (-1.5, -.5, .5, 1.5):
            stripe = (i // 2 + int(o + 2)) % 3
            lit = (nx * o + ny * o) < 0
            k = 4 if stripe == 0 and lit else 3 if stripe == 0 else 2 if stripe == 1 else 1
            cv.put(x + nx * o, y + ny * o, ROPE[k])
    for k in range(8):                                                                        # the end, curling along the bottom of the ring
        t = .9 + k * .09; x, y = cx + math.cos(t) * (rx + 2.2), cy + math.sin(t) * (ry + 2.2)
        cv.put(x, y, ROPE[3] if k % 2 else ROPE[2]); cv.put(x, y + 1, ROPE[1])
    ex, ey = cx + math.cos(1.62) * (rx + 2.2), cy + math.sin(1.62) * (ry + 2.2)
    for (dx, dy) in ((-1, 1), (-2, 1), (-1, 2), (-2, 0)): cv.put(ex + dx, ey + dy, ROPE[4])   # frayed
    return outline(cv.image())


def icon_basket():
    """a woven basket with a handle: over-and-under weave, lit on the left"""
    cv = Canvas(32, 32)
    for y in range(14, 28):
        w = 12 - (y - 14) * .25
        for x in range(int(16 - w), int(16 + w) + 1):
            u = (x - 16) / w; row = (y - 14) // 2; over = ((x // 3) + row) % 2 == 0
            k = (4 if over else 2) + (1 if u < -.5 else -1 if u > .5 else 0)
            cv.put(x, y, WICK[max(0, min(5, k))])
    for x in range(4, 29): cv.put(x, 14, WICK[5] if x < 16 else WICK[3]); cv.put(x, 15, WICK[2])
    for k in range(40):
        t = math.pi * k / 39; x, y = 16 - math.cos(t) * 10, 14 - math.sin(t) * 10
        cv.put(x, y, WICK[4] if k < 20 else WICK[2]); cv.put(x, y + 1, WICK[1])
    return outline(cv.image())


def icon_compost():
    """a sack of compost with its mouth rolled down into a thick folded rim, a mound of dark crumbly earth heaped above it,
    lit lumps, a leaf and a fleck of eggshell"""
    cv = Canvas(32, 32)
    for y in range(15, 29):
        w = 10 + (y - 15) * .15
        for x in range(int(16 - w), int(16 + w) + 1):
            u = (x - 16) / w; cv.put(x, y, HEX('#c9b386') if u < -.5 else HEX('#ad966a') if u < .3 else HEX('#8e7750'))
    for x in range(5, 28):
        cv.put(x, 13, HEX('#e0cfa6') if x < 16 else HEX('#c9b386')); cv.put(x, 14, HEX('#ad966a')); cv.put(x, 15, HEX('#6c583a'))
    for y in range(4, 14):
        for x in range(6, 27):
            r = (x - 16) ** 2 / 100 + (y - 13) ** 2 / 81 + .12 * math.sin(x * 1.3) * (y < 9)    # a lumpy outline, not a smooth bun
            if r > 1: continue
            l = -(x - 16) / 10 - (y - 9) / 6
            cv.put(x, y, SOIL[3] if l > .5 else SOIL[2] if l > -.3 else SOIL[1])
    for (x, y) in ((11, 8), (14, 6), (18, 9), (12, 11), (20, 11), (16, 10)):
        cv.put(x, y, SOIL[4]); cv.put(x + 1, y, SOIL[3])
    for (x, y, c) in ((19, 6, '#f0ece0'), (20, 6, '#d8d0c0'), (9, 10, '#7a6a3a'), (8, 9, '#a88a3a'), (10, 9, '#7a6a3a')): cv.put(x, y, HEX(c))
    return outline(cv.image())


ICONS = {'butter': icon_butter, 'cheese': icon_cheese, 'cornbread': icon_cornbread, 'carrot_cake': icon_carrot_cake, 'jam': icon_jam,
         'kraut_raw': icon_kraut, 'sauerkraut': icon_sauerkraut, 'potato_soup': icon_potato_soup, 'rope': icon_rope, 'basket': icon_basket, 'compost': icon_compost}

if __name__ == '__main__':
    if sys.argv[1] == '--install':
        obj, oj = sys.argv[2], sys.argv[3]; O = json.load(open(oj))
        for k, f in ICONS.items():
            f().save(os.path.join(obj, f'icon32_{k}.png'))
            O[f'icon32_{k}'] = {'src': f'spr/lpc/obj/icon32_{k}.png', 'fw': 32, 'fh': 32, 'ax': 16.0, 'ay': 32.0, 'foot': [0, 0, 0, 0], 'px': 'ase', 'chim': None}
        json.dump(O, open(oj, 'w')); print('installed', len(ICONS), 'pantry icons'); sys.exit(0)
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for k, f in ICONS.items(): f().save(os.path.join(out, f'icon32_{k}.png'))
    print('ok')
