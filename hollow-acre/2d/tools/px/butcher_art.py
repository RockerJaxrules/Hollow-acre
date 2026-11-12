"""Butchering (#235): the item icons (a dressed hen, a cut of beef, a folded cowhide) in the crop icons' kit, and the install of
the butcher's block (drawn in benches2.js as bench_butcher, rendered to out/).

    python3 butcher_art.py out_dir                                  -> icon32_*.png to look at
    python3 butcher_art.py --install <game>/spr/lpc/obj <game>/spr/lpc/objects.json
"""
import sys, os, json, math, shutil
from PIL import Image
from crops import Canvas, HEX, outline
from crops_more import ball

R = lambda *h: [HEX(c) for c in h]
SKIN = R('#6a3c30', '#94584a', '#c08470', '#dca896', '#f0ccb8', '#fae6d8')      # a plucked bird: pale, pink-cream, lit warm
MEAT = R('#3a0c0e', '#5e1418', '#8a2024', '#b0363a', '#cc5450', '#e07a6e')      # beef: deep red to a lit coral
FAT = R('#b8a890', '#d8ccb4', '#efe6d4', '#fbf6ea')
BONE = R('#8a7e66', '#b4a888', '#d8ceb0', '#f0e8d4')
HIDE = R('#6a5a44', '#9a8a6c', '#c4b494', '#e0d4b8', '#efe6d0', '#f8f2e4')   # a pale cream hide
SPOT = R('#2a1c14', '#3e2c20', '#e8e0d0', '#f6f0e4')


def icon_poultry():
    """a dressed hen on its back: a round body, two drumsticks with knuckle ends, lit warm from the top left"""
    cv = Canvas(32, 32)
    ball(cv, 15, 17, 10.5, 8.5, SKIN)
    for (cx, cy, a) in ((22, 11, -.7), (25, 16, -.25)):                                 # the drumsticks, ending in a pale knuckle
        for k in range(7):
            x, y = cx + math.cos(a) * k, cy + math.sin(a) * k * .9
            ball(cv, x, y, 2.6 - k * .15, 2.2 - k * .12, SKIN)
        ex, ey = cx + math.cos(a) * 7.5, cy + math.sin(a) * 6.8
        for (dx, dy, k) in ((0, 0, 3), (1, 0, 2), (0, 1, 1), (-1, 0, 3), (0, -1, 3)): cv.put(ex + dx, ey + dy, BONE[k])
    for (dx, dy) in ((-6, -3), (-5, -4), (-4, -4), (-3, -5)): cv.put(15 + dx, 17 + dy, SKIN[5])   # one highlight mass
    for x in range(-5, 3): cv.put(13 + x, 21 + (x * x) // 12, SKIN[1])                    # the crease where the breast meets the leg
    return outline(cv.image())


def icon_beef():
    """a thick cut of beef: a kidney-shaped face lit top-left, a fat cap along the top, a darker cut face below it to show its
    thickness, and the bone as an off-white ring with pale marrow"""
    cv = Canvas(32, 32); cx, cy = 16, 14
    def inside(x, y):
        u, v = (x - cx) / 13, (y - cy) / 9
        return u * u + v * v <= 1 and not ((x - cx - 2) ** 2 / 20 + (y - cy - 9) ** 2 / 9 <= 1)   # the kidney's notch at the bottom
    for y in range(cy - 10, cy + 14):
        for x in range(cx - 14, cx + 15):
            if inside(x, y - 3) and not inside(x, y):                                       # the cut face below: the meat's thickness
                cv.put(x, y, MEAT[1] if x > cx + 4 else MEAT[2])
    for y in range(cy - 10, cy + 11):
        for x in range(cx - 14, cx + 15):
            if not inside(x, y): continue
            u, v = (x - cx) / 13, (y - cy) / 9
            if v < -.55 + .12 * math.sin(u * 5): cv.put(x, y, FAT[2] if u < .2 else FAT[1]); continue   # the fat cap along the top
            l = -u * .55 - v * .6
            cv.put(x, y, MEAT[max(2, min(5, round(3.2 + l * 2.2)))])
    for (x0, y0, x1, y1) in ((-9, 0, -3, 2), (2, 3, 8, 4)):
        n = max(abs(x1 - x0), abs(y1 - y0))
        for i in range(n + 1): cv.put(cx + x0 + (x1 - x0) * i / n, cy + y0 + (y1 - y0) * i / n, FAT[1])
    for y in range(-3, 4):                                                                  # the bone: an off-white ring, pale marrow
        for x in range(-3, 4):
            d = x * x + y * y
            if d <= 10: cv.put(cx + 6 + x, cy - 1 + y, BONE[3] if d > 4 and (x + y) < 0 else BONE[2] if d > 4 else BONE[1])
    for (dx, dy) in ((-8, -2), (-7, -3), (-6, -3)): cv.put(cx + dx, cy + dy, MEAT[5])
    return outline(cv.image())


def icon_hide():
    """a cowhide stretched flat: the body, four leg flaps and a neck, ragged a little at the edge, tan with dark patches"""
    cv = Canvas(32, 32)
    def inside(x, y):
        u, v = (x - 16) / 9.5, (y - 16) / 10
        body = abs(u) ** 2.4 + abs(v) ** 2.4 <= 1
        legs = any(abs(x - lx) <= 2 and ly0 <= y <= ly1 for (lx, ly0, ly1) in ((5, 4, 10), (27, 4, 10), (5, 22, 28), (27, 22, 28)))
        legs = legs or any(abs(y - ly) <= 2 and lx0 <= x <= lx1 for (ly, lx0, lx1) in ((7, 4, 9), (7, 23, 28), (25, 4, 9), (25, 23, 28)))
        neck = abs(x - 16) <= 2 and 1 <= y <= 7
        tail = abs(x - 16 - (y - 26) * .3) <= .8 and 25 <= y <= 31
        return body or legs or neck or tail
    mask = {(x, y) for y in range(1, 32) for x in range(1, 32) if inside(x, y)}
    mask = {(x, y) for (x, y) in mask if sum((x + a, y + b) in mask for a in (-1, 0, 1) for b in (-1, 0, 1)) >= 5}   # round off the stepped corners
    for (x, y) in sorted(mask):
            l = -(x - 16) / 14 - (y - 16) / 14
            cv.put(x, y, HIDE[4] if l > .45 else HIDE[3] if l > -.3 else HIDE[2])
    for (sx, sy, rx, ry) in ((12, 13, 4, 3), (20, 19, 3.5, 2.5), (19, 9, 2, 1.6)):           # the patches
        for y in range(-4, 5):
            for x in range(-5, 6):
                r = x * x / (rx * rx) + y * y / (ry * ry) + .25 * math.sin(math.atan2(y, x) * 3 + sx)
                if r <= 1 and (sx + x, sy + y) in cv.px: cv.put(sx + x, sy + y, HEX('#3a2214'))   # one flat dark-chocolate tone: a patch, not a hole
    for (x, y) in ((9, 8), (10, 8), (8, 9)): cv.put(x, y, HIDE[5])
    return outline(cv.image())


def plate(cv, cx, cy, rx, ry):
    """a stoneware plate seen from above a little: a pale rim, a shaded well"""
    for y in range(-ry, ry + 1):
        for x in range(-rx, rx + 1):
            d = x * x / (rx * rx) + y * y / (ry * ry)
            if d > 1: continue
            cv.put(cx + x, cy + y, HEX('#e8e0cc') if d > .7 and y < 0 else HEX('#b8ae98') if d > .7 else HEX('#d0c6ae'))


ROAST = R('#3a1a08', '#6a3410', '#9a5418', '#c47a2a', '#e0a048', '#f4c878')


def icon_roast_hen():
    """a roast hen on a plate: golden-brown skin lit top-left, the drumsticks up, a potato and a carrot beside it"""
    cv = Canvas(32, 32)
    plate(cv, 16, 21, 14, 7)
    ball(cv, 15, 17, 9.5, 7.5, ROAST)
    for (cx, cy, a) in ((21, 11, -.8), (24, 15, -.35)):
        for k in range(6): ball(cv, cx + math.cos(a) * k, cy + math.sin(a) * k * .9, 2.4 - k * .15, 2.0 - k * .1, ROAST)
        ex, ey = cx + math.cos(a) * 6.5, cy + math.sin(a) * 6
        for (dx, dy, k) in ((0, 0, 3), (1, 0, 2), (0, 1, 1)): cv.put(ex + dx, ey + dy, BONE[k])
    for (dx, dy) in ((-5, -3), (-4, -4), (-3, -4)): cv.put(15 + dx, 17 + dy, ROAST[5])
    ball(cv, 6, 23, 2.6, 2.0, R('#5c381e', '#82562c', '#a6763e', '#c69656', '#e0b878'))
    for k in range(5): cv.put(23 + k, 25 - k * .2, HEX('#e4741e') if k < 3 else HEX('#c25014'))
    return outline(cv.image())


def icon_beef_stew():
    """a bowl of beef stew: a wooden bowl, dark gravy, chunks of beef and a slice or two of carrot and cabbage, a little steam"""
    cv = Canvas(32, 32); cx = 16
    for y in range(14, 28):
        t = (y - 14) / 14; w = 13 - t * t * 6
        for x in range(int(-w), int(w) + 1):
            u = x / w; cv.put(cx + x, y, OAKB[4] if u < -.5 else OAKB[3] if u < .2 else OAKB[2] if u < .7 else OAKB[1])
    for y in range(-4, 5):
        for x in range(-13, 14):
            d = x * x / 169 + y * y / 16
            if d > 1: continue
            cv.put(cx + x, 14 + y, OAKB[5] if d > .78 and y < 0 else OAKB[3] if d > .78 else HEX('#5a2a12') if x < 3 else HEX('#46200e'))
    for (x, y, c) in ((-6, -1, '#8a2024'), (-5, -1, '#b0363a'), (-6, 0, '#5e1418'), (2, 0, '#8a2024'), (3, 0, '#b0363a'), (3, 1, '#5e1418'), (-1, 2, '#e4741e'), (0, 2, '#f69a3e'), (6, -1, '#88b896'), (7, -1, '#b0d6b0'), (-9, 1, '#e4741e')):
        cv.put(cx + x, 14 + y, HEX(c))
    for (px_, py_, r) in ((cx - 3, 6, 2.6), (cx + 3, 3, 2.0)):                               # two soft puffs of steam (no outline)
        for y in range(-3, 4):
            for x in range(-3, 4):
                if x * x + y * y <= r * r: cv.put(px_ + x, py_ + y, (236, 230, 222, 190) if x + y < 0 else (196, 190, 184, 170))
    return outline(cv.image())


OAKB = R('#2a1a0e', '#45301a', '#654626', '#86603a', '#a47c4e', '#c09a66')
ICONS = {'poultry': icon_poultry, 'beef': icon_beef, 'hide': icon_hide, 'roast_hen': icon_roast_hen, 'beef_stew': icon_beef_stew}

if __name__ == '__main__':
    if sys.argv[1] == '--install':
        obj, oj = sys.argv[2], sys.argv[3]; O = json.load(open(oj)); here = os.path.dirname(os.path.abspath(__file__))
        src = os.path.join(here, 'out', 'b2_bench_butcher.png'); w, h = Image.open(src).size
        shutil.copy(src, os.path.join(obj, 'bench_butcher.png'))
        O['bench_butcher'] = {'src': 'spr/lpc/obj/bench_butcher.png', 'fw': w, 'fh': h, 'ax': w / 2, 'ay': h - 3, 'foot': [0, 0, 0, 0]}
        for k, f in ICONS.items():
            f().save(os.path.join(obj, f'icon32_{k}.png'))
            O[f'icon32_{k}'] = {'src': f'spr/lpc/obj/icon32_{k}.png', 'fw': 32, 'fh': 32, 'ax': 16.0, 'ay': 32.0, 'foot': [0, 0, 0, 0], 'px': 'ase', 'chim': None}
        json.dump(O, open(oj, 'w')); print('installed the butcher’s block and', len(ICONS), 'icons'); sys.exit(0)
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for k, f in ICONS.items(): f().save(os.path.join(out, f'icon32_{k}.png'))
    print('ok')
