"""Icons for the makeables of #237 (the kitchen, the workbench and the farm bench), in the crop icons' kit: lit from the top left,
a darker outline of each colour, one highlight mass, no speckle. Each its own hue and silhouette so a full bag reads at 1x.

    python3 pantry_art.py out_dir
    python3 pantry_art.py --install <game>/spr/lpc/obj <game>/spr/lpc/objects.json
"""
import sys, os, json, math
from PIL import Image
from crops import Canvas, HEX, outline, FERN
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
    """a wheel of cheese with a wedge cut out: the pale cut face shows, a waxed rind round the rest"""
    cv = Canvas(32, 32); cx, cy = 16, 18
    for y in range(-9, 10):
        for x in range(-13, 14):
            if x * x / 169 + y * y / 81 > 1: continue
            if x > 0 and y < 0 and y > -x * .8: continue                                     # the wedge cut away
            side = y > 3
            if side: cv.put(cx + x, cy + y, RIND[1] if x < 3 else RIND[0])
            else:
                l = -x / 13 * .6 - y / 9 * .6
                cv.put(cx + x, cy + y, CHEESE[4] if l > .3 else CHEESE[3] if l > -.2 else CHEESE[2])
    for x in range(1, 12):                                                                  # the cut face, pale, with two holes
        for y in range(-int(x * .8), 1): cv.put(cx + x, cy + y, CHEESE[5] if x < 6 else CHEESE[4])
    for (x, y) in ((5, -2), (8, -3), (-5, -2), (-8, 1)): cv.put(cx + x, cy + y, CHEESE[1])
    return outline(cv.image())


def icon_cornbread():
    """a square of cornbread in its tin: a golden domed top, cracked, lit top-left"""
    cv = Canvas(32, 32)
    for y in range(9, 27):
        for x in range(5, 28):
            if y > 22: cv.put(x, y, HEX('#4a4e5a') if x > 20 else HEX('#6f7480')); continue   # the tin's lip
            l = -(x - 16) / 14 - (y - 15) / 10
            k = 5 if l > .8 else 4 if l > .2 else 3 if l > -.4 else 2
            cv.put(x, y, BREAD[k])
    for (x0, y0, x1, y1) in ((9, 13, 14, 16), (17, 12, 22, 17), (11, 19, 18, 20)):
        n = max(abs(x1 - x0), abs(y1 - y0))
        for i in range(n + 1): cv.put(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, BREAD[1])
    return outline(cv.image())


def icon_carrot_cake():
    """a slice of carrot cake on its side: two sponge layers, cream between and on top, a candied carrot on it"""
    cv = Canvas(32, 32)
    for y in range(11, 27):
        w = 4 + (y - 11) * 1.2
        for x in range(int(16 - w), int(16 + w) + 1):
            if y < 13 or 18 <= y <= 19: c = ICING[2] if x < 16 else ICING[1]
            else:
                l = -(x - 16) / 16 - (y - 18) / 14
                c = CAKE[4] if l > .3 else CAKE[3] if l > -.3 else CAKE[2]
            cv.put(x, y, c)
    for (x, y) in ((10, 15), (21, 16), (15, 23), (8, 24)): cv.put(x, y, HEX('#e4741e'))     # flecks of carrot
    for k in range(5): cv.put(14 + k, 9 + k * .3, HEX('#f69a3e') if k < 3 else HEX('#c25014'))
    cv.put(13, 8, FERN[4]); cv.put(12, 7, FERN[3])
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
    """a stoneware crock of salted cabbage under a weight stone: cabbage shreds showing at the rim"""
    cv = Canvas(32, 32)
    ball(cv, 16, 20, 10, 9, CROCK)
    for y in range(9, 13):
        for x in range(-9, 10): cv.put(16 + x, y, CROCK[4] if x < 0 else CROCK[2])
    for x in range(-8, 9):
        for y in range(8, 11): cv.put(16 + x, y, CABB[5] if (x + y) % 3 else CABB[6])
    ball(cv, 17, 8, 4, 2.5, R('#3a3836', '#565250', '#76726c', '#9a948c', '#bcb6ac'))
    for x in range(-9, 10): cv.put(16 + x, 20, HEX('#5a7a5c') if x < 2 else HEX('#46624a'))
    return outline(cv.image())


def icon_sauerkraut():
    """a bowl of sauerkraut: pale gold shreds heaped in a wooden bowl"""
    cv = Canvas(32, 32); cx = 16
    for y in range(16, 28):
        t = (y - 16) / 12; w = 13 - t * t * 5
        for x in range(int(-w), int(w) + 1):
            u = x / w; cv.put(cx + x, y, OAKB[4] if u < -.5 else OAKB[3] if u < .2 else OAKB[2] if u < .7 else OAKB[1])
    for y in range(-6, 3):
        for x in range(-12, 13):
            if x * x / 144 + (y + 1) ** 2 / 30 > 1: continue
            l = -x / 12 - y / 6
            cv.put(cx + x, 16 + y, HEX('#f0e0a0') if l > .5 else HEX('#d8c47a') if l > -.2 else HEX('#b8a25a'))
    for (x0, y0) in ((-7, -2), (-2, -4), (3, -1), (7, -3), (-4, 1)):
        for k in range(4): cv.put(cx + x0 + k, 16 + y0 + (k % 2), HEX('#a08a46'))
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
    """a coil of rope: three loops one behind the other, the strands' twist showing as a lit diagonal on each"""
    cv = Canvas(32, 32)
    for (cy, rx, ry, back) in ((14, 11, 6, True), (17, 11, 6, False), (20, 11, 6, False)):
        for k in range(90):
            t = k / 90 * math.pi * 2; x, y = 16 + math.cos(t) * rx, cy + math.sin(t) * ry
            for w in (0, 1):
                xx, yy = x, y + w
                lit = (k + w) % 4 < 2
                c = ROPE[(4 if lit else 2) - (1 if back else 0) - (1 if math.sin(t) < 0 and not back else 0)]
                cv.put(xx, yy, c)
    for k in range(8): cv.put(25 + k * .5, 21 + k * .7, ROPE[3] if k % 2 else ROPE[1])          # the loose end
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
    """a sack of compost, its top rolled open on dark crumbly earth with a curl of eggshell and a leaf"""
    cv = Canvas(32, 32)
    for y in range(10, 29):
        w = 9 + (y - 10) * .2
        for x in range(int(16 - w), int(16 + w) + 1):
            u = (x - 16) / w; cv.put(x, y, HEX('#c9b386') if u < -.5 else HEX('#ad966a') if u < .3 else HEX('#8e7750'))
    for x in range(6, 27): cv.put(x, 10, HEX('#e0cfa6')); cv.put(x, 11, HEX('#ad966a'))
    for y in range(6, 11):
        for x in range(8, 25):
            if (x - 16) ** 2 / 64 + (y - 9) ** 2 / 9 > 1: continue
            l = -(x - 16) / 8 - (y - 8) / 3
            cv.put(x, y, SOIL[4] if l > .6 else SOIL[3] if l > -.2 else SOIL[2])
    for (x, y, c) in ((12, 7, '#f0ece0'), (13, 7, '#d8d0c0'), (19, 8, '#7a6a3a'), (20, 7, '#a88a3a'), (21, 8, '#7a6a3a')): cv.put(x, y, HEX(c))
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
