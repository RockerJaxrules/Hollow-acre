"""#198 round 7: the r6 judge's first fixes. Hand edits on the art that won (old or new), one redraw (rosehip).
    python3 icons198d.py -> out/r7_<name>.png
"""
import math, sys
from PIL import Image
sys.path.insert(0, '.')
from icons198 import Icon, RAMPS, hexr, sh
import icons198c as C

OBJ = C.OBJ
OUTL = (30, 20, 24, 255)


def load(p):
    return C.load(p)


def chaga():
    # (r6: "cut the grey stub at the lower left; it reads as a claw or beak") the lump alone: no bark sliver
    I = Icon(); src = C.chaga(); s = src.load()
    for y in range(32):
        for x in range(32):
            r, g, b, a = s[x, y]
            grey = a and abs(r - g) < 12 and abs(g - b) < 14 and r > 90
            if a and not grey:
                I.p[x, y] = (r, g, b, a)
    clean = I.im.copy(); c = clean.load()
    for y in range(32):                                           # drop outline pixels left floating where the bark was
        for x in range(32):
            if c[x, y][:3] == OUTL[:3]:
                if not any(0 <= x + dx < 32 and 0 <= y + dy < 32 and c[x + dx, y + dy][3] and c[x + dx, y + dy][:3] != OUTL[:3]
                           for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    I.p[x, y] = (0, 0, 0, 0)
    return I.done()


def soup():
    # (r6: "the steam is opaque grey: pale see-through puffs, no dark lower edge") bright cores that fade at the edges
    I = load('out/ic198_soup.png'); m = {(0xab, 0x9b, 0x7e): (0x5e, 0x6c, 0x72), (0x99, 0x8a, 0x70): (0x50, 0x5e, 0x66), (0x88, 0x79, 0x62): (0x46, 0x52, 0x5c),
                                        (0x77, 0x68, 0x54): (0x3a, 0x46, 0x50), (0x67, 0x57, 0x47): (0x30, 0x3a, 0x44)}
    C.recolor(I, m, range(23, 30))
    for y in range(0, 13):
        for x in range(32):
            I.p[x, y] = (0, 0, 0, 0)
    for (cx, cy, r) in ((12, 9, 2.4), (17, 6.5, 2.8), (21, 10, 1.9)):
        for y in range(int(cy - r) - 1, int(cy + r) + 2):
            for x in range(int(cx - r) - 1, int(cx + r) + 2):
                d = math.hypot(x + .5 - cx, y + .5 - cy) / r
                if d < 1:
                    I.p[x, y] = (246, 244, 238, int(235 - 150 * d * d))
    return I.im


def rosehip():
    # (r6: "bend the twig and hang the hips on stalks; a straight stick reads as a skewer") a curved twig, hips hanging from it
    I = Icon(); HIP = hexr(['#3a0c06', '#5e140a', '#8c220e', '#b83a14', '#d85a22', '#ee8040', '#f8b070'])
    pts = [(3 + t, 13 - 7 * math.sin(t / 26 * math.pi) + t * .2) for t in range(0, 26)]
    for (x, y) in pts:                                                         # the twig, curving over and down
        I.P(x, y, RAMPS['wd'][3]); I.P(x, y + 1, RAMPS['wd'][1])
    for (tx, L, ox) in ((5, 3, 0), (13, 4, 0), (21, 3, 1)):
        x0, y0 = pts[tx]
        for j in range(1, L):
            I.P(x0 + ox * j / L, y0 + 1 + j, RAMPS['ol'][2])                   # a short stalk
        cx, cy = x0 + ox, y0 + L + 3
        for y in range(int(cy - 4), int(cy + 5)):
            for x in range(int(cx - 3), int(cx + 4)):
                nx, ny = (x + .5 - cx) / 2.6, (y + .5 - cy) / 3.6; d = nx * nx + ny * ny
                if d < 1:
                    l = .16 + .84 * sh(nx, ny, math.sqrt(1 - d)); I.P(x, y, HIP[min(6, int(l * 6 + .5))])   # an oval hip
        for dx in (-1, 0, 1):
            I.P(cx + dx, cy + 4, RAMPS['ck'][1])                               # the dark sepals at its tip
        I.P(cx - 1, cy - 2, (255, 214, 170))
    for (x, y) in ((9, 6), (10, 5), (11, 5), (10, 6), (12, 4)):
        I.P(x, y, RAMPS['ol'][4])                                              # a leaf
    return I.done()


def mushroom():
    # (r6: "a full oval on a white peg reads as a lollipop: draw a dark underside, a gill band") the cap cut flat underneath
    I = load(OBJ + 'icon32_mushroom.png')
    for y in range(19, 23):
        for x in range(32):
            if not (13 <= x <= 17):
                I.p[x, y] = (0, 0, 0, 0)
    for x in range(4, 28):
        if I.p[x, 17][3] and I.p[x, 17][:3] != OUTL[:3]:
            I.p[x, 18] = (0x8a, 0x7e, 0x6c, 255) if x % 2 else (0x4a, 0x40, 0x38, 255)   # the gills
    for x in range(4, 28):
        if I.p[x, 18][3] and not (13 <= x <= 17):
            I.p[x, 19] = OUTL
    return I.im


def lamp():
    # (r6 judge: "amber flame several px tall, a pale core the brightest pixels; warm the blue glass")
    I = load(OBJ + 'icon32_lamp.png')
    C.recolor(I, {(0xc8, 0xde, 0xea): (0xec, 0xd8, 0xa8), (0xe2, 0xee, 0xf4): (0xf6, 0xe6, 0xbc), (0x3c, 0x56, 0x77): (0x6a, 0x52, 0x34)})
    for y in range(10, 18):
        I.p[15, y] = (0xfa, 0xa0, 0x32, 255) if 11 < y < 17 else I.p[15, y]
        I.p[17, y] = (0xfa, 0xa0, 0x32, 255) if 11 < y < 16 else I.p[17, y]
        I.p[16, y] = (0xff, 0xfa, 0xe0, 255) if 11 < y < 15 else (0xff, 0xdc, 0x6e, 255)
    I.p[16, 9] = (0xff, 0xdc, 0x6e, 255)
    return I.im


def ring():
    # (r6 judge: "a lighter, cool lit rim and a bigger hole so it can't read as a bomb")
    I = load(OBJ + 'icon32_it_ring.png'); s = I.im.copy().load()
    hole = set(); st = [(16, 20)]
    while st:
        x, y = st.pop()
        if (x, y) in hole or not (0 <= x < 32 and 0 <= y < 32) or s[x, y][3]:
            continue
        hole.add((x, y)); st += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    inner = [(x, y) for (x, y) in [(x, y) for x in range(32) for y in range(32)] if s[x, y][3] and any((x + dx, y + dy) in hole for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
    for (x, y) in inner:
        I.p[x, y] = (0, 0, 0, 0)                                                # the inner outline goes: the hole grows by a pixel
    s2 = I.im.copy().load()
    for x in range(1, 31):
        for y in range(1, 31):
            if s2[x, y][3] and s2[x, y][:3] != OUTL[:3] and any(not s2[x + dx, y + dy][3] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))) and y >= 13:
                near_hole = any((x + dx, y + dy) in hole for dx in (-2, -1, 0, 1, 2) for dy in (-2, -1, 0, 1, 2))
                if near_hole:
                    I.p[x, y] = OUTL                                            # a new inner outline
    for x in range(32):
        for y in range(13, 26):
            c = I.p[x, y]
            if c[3] and c[:3] != OUTL[:3] and (x + y) < 30 and I.p[x - 1, y][:3] == OUTL[:3]:
                I.p[x, y] = (0xee, 0xf2, 0xfa, 255)                             # the cool lit rim on its upper left
    return I.im


def wood():
    # (r6 judge: "end grain dull tan with one dark heart pixel off centre; the cream rings read as doughnuts")
    I = load(OBJ + 'icon32_wood.png')
    C.recolor(I, {(0xc8, 0xba, 0x9a): (0xa6, 0x88, 0x60), (0xb9, 0xaa, 0x8c): (0x9c, 0x7e, 0x58), (0xab, 0x9b, 0x7e): (0x6a, 0x4a, 0x30)})
    for (x, y) in ((25, 12), (23, 21)):
        I.p[x, y] = (0x4a, 0x30, 0x20, 255)                                     # the heart, off centre
    return I.im


def lumber():
    # (r6 judge: "lighten each plank's top face one step; the brown sinks into the brown slot")
    I = load('out/r6_lumber.png'); s = I.im.copy().load()
    for y in range(1, 32):
        for x in range(32):
            c = s[x, y]
            if c[3] and c[:3] != OUTL[:3] and s[x, y - 1][3] and s[x, y - 1][:3] == OUTL[:3]:
                I.p[x, y] = (min(255, int(c[0] * 1.25) + 8), min(255, int(c[1] * 1.22) + 6), min(255, int(c[2] * 1.18) + 4), 255)
    return I.im


R7 = {'chaga': chaga, 'soup': soup, 'rosehip': rosehip, 'mushroom': mushroom, 'lamp': lamp, 'ring': ring, 'wood': wood, 'lumber': lumber}

if __name__ == '__main__':
    for n in (sys.argv[1:] or R7):
        R7[n]().save(f'out/r7_{n}.png')
    print('ok', len(sys.argv[1:] or R7))
