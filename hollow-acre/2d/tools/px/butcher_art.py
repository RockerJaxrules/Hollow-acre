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
HIDE = R('#3a2414', '#5a3820', '#7c5230', '#9e6e44', '#bc8a5a', '#d4a676')
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
    """a thick cut of beef: the red face lit top-left, a rim of fat round the far side, a round of bone in it"""
    cv = Canvas(32, 32); cx, cy = 16, 17
    for y in range(-10, 11):
        for x in range(-13, 14):
            d = x * x / 169 + y * y / 100
            wob = .06 * math.sin(math.atan2(y, x) * 3)
            if d > 1 + wob: continue
            if d > .74 + wob and (x > -4 or y > 2):
                cv.put(cx + x, cy + y, FAT[2] if (x + y) < 0 else FAT[1])
            else:
                l = -x / 13 * .6 - y / 10 * .7
                k = 3 + (l > .25) + (l > .6) - (l < -.3)
                cv.put(cx + x, cy + y, MEAT[max(1, min(5, k))])
    for (x0, y0, x1, y1) in ((-8, -2, -2, 1), (1, 3, 7, 5), (-4, 5, 0, 6)):               # threads of fat through it
        n = max(abs(x1 - x0), abs(y1 - y0))
        for i in range(n + 1): cv.put(cx + x0 + (x1 - x0) * i / n, cy + y0 + (y1 - y0) * i / n, FAT[2])
    ball(cv, cx + 5, cy - 3, 3.0, 2.6, BONE)
    cv.put(cx + 5, cy - 3, BONE[0]); cv.put(cx + 6, cy - 3, BONE[0])                       # the marrow
    for (dx, dy) in ((-8, -5), (-7, -6), (-6, -6), (-5, -7)): cv.put(cx + dx, cy + dy, MEAT[5])
    return outline(cv.image())


def icon_hide():
    """a cowhide stretched flat: the body, four leg flaps and a neck, ragged a little at the edge, tan with dark patches"""
    cv = Canvas(32, 32)
    def inside(x, y):
        u, v = (x - 16) / 9.5, (y - 16) / 10
        body = abs(u) ** 2.4 + abs(v) ** 2.4 <= 1
        legs = any(abs(x - lx) <= 2 and ly0 <= y <= ly1 for (lx, ly0, ly1) in ((5, 4, 10), (27, 4, 10), (5, 22, 28), (27, 22, 28)))
        legs = legs or any(abs(y - ly) <= 2 and lx0 <= x <= lx1 for (ly, lx0, lx1) in ((7, 4, 9), (7, 23, 28), (25, 4, 9), (25, 23, 28)))
        neck = abs(x - 16) <= 3 and 3 <= y <= 8
        return body or legs or neck
    for y in range(2, 31):
        for x in range(2, 31):
            if not inside(x, y): continue
            if (x * 7 + y * 3) % 11 == 0 and not (inside(x - 1, y) and inside(x + 1, y) and inside(x, y - 1) and inside(x, y + 1)): continue   # a ragged edge
            l = -(x - 16) / 14 - (y - 16) / 14
            cv.put(x, y, HIDE[4] if l > .45 else HIDE[3] if l > -.3 else HIDE[2])
    for (sx, sy, rx, ry) in ((12, 13, 4, 3), (20, 19, 3.5, 2.5), (19, 9, 2, 1.6)):           # the patches
        for y in range(-4, 5):
            for x in range(-5, 6):
                if x * x / (rx * rx) + y * y / (ry * ry) <= 1 and (sx + x, sy + y) in cv.px: cv.put(sx + x, sy + y, SPOT[1] if (x + y) > 0 else SPOT[0])
    for (x, y) in ((9, 8), (10, 8), (8, 9)): cv.put(x, y, HIDE[5])
    return outline(cv.image())


ICONS = {'poultry': icon_poultry, 'beef': icon_beef, 'hide': icon_hide}

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
