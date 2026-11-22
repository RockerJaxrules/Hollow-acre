"""(t375) Extreme gore, wave 2: the story's adult remains, drawn over the close-ups as they stand (Full and Toned never change).
Each is an overlay: the close-up's own picture (dumped from the game at 1x) is the base, the gore is drawn on it with gore5.py's kit
at the close-up's own pixel size, and only the pixels that changed are written out, so the game lays the overlay on its own picture
(gorex375.js) and the world sprite is shrunk from the same result.
  g6_yourgrave_ov  Silas's grave: the older you, grey-haired, in your clothes. The skull still has flesh on it in rags, one eye shrunk
                   in its socket and maggots in the other, the scalp peeled back; the neck torn to the bone; the shirt torn open and
                   the chest opened (rib ridges, a lung, the liver), the guts pulled out over the side onto the floor of the grave in
                   old dark lengths; the hands gnawed to the finger bones; the soil under him soaked black.
  g6_drowned_ov    the drowned of Old Wickham: ONLY the two grown men in top hats at either side (the small figure in the green dress
                   could be a child, so nothing is drawn on or near it, or on the people beside it). The grey-headed man's scalp has
                   split and is peeling, an eel round his neck going in at the collar; the other has the back of his neck eaten to
                   the bone, an eel out of his collar; both hands swollen grey-green with the skin coming off like a glove.
Hard limits: every figure here is a grown man; nothing on or near a child; nothing sexual.
Run from the folder that holds spr/:  python3 gore6.py <yourgrave_cut.png> <drowned.png>"""
import json, math, os, sys
_here = os.path.dirname(os.path.abspath(__file__))
_src = open(os.path.join(_here, 'gore5.py')).read()
exec(_src[:_src.index('# ================================================================ run')])
from PIL import Image


class Z1:
    """a close-up at its own pixel size: art coordinates in, the same pixels out (gore5's kit draws on it with S=1)"""
    def __init__(s, path):
        s.base = Image.open(path).convert('RGBA'); s.S = 1; s.pad = 0
        s.c = C(*s.base.size); s.c.im = s.base.copy(); s.c.px = s.c.im.load(); s.W, s.H = s.base.size
    def X(s, x): return x
    def Y(s, y): return y
    def r(s, v): return v
    def p(s, x, y, col, a=255): s.c.p(x, y, col, a)
    def F(s): return F(s.W, s.H)
    def get(s, x, y): return s.c.px[int(x), int(y)]
    def overlay(s, name):
        """only what changed, so the game lays it over its own picture"""
        o = Image.new('RGBA', s.base.size, (0, 0, 0, 0)); a, b, q = s.c.im.load(), s.base.load(), o.load()
        for y in range(s.H):
            for x in range(s.W):
                if a[x, y][:3] != b[x, y][:3] or (a[x, y][3] > 0) != (b[x, y][3] > 0): q[x, y] = a[x, y][:3] + (255,)
        o.save('spr/lpc/obj/' + name + '.png'); s.c.im.save(name + '_preview.png'); print('wrote', name, o.getbbox())


def run_(z, pts, cols):
    """a hand-placed run of pixels: pts [(x, y)], cols one colour or a list per point"""
    for i, (x, y) in enumerate(pts): z.p(x, y, cols[i % len(cols)] if isinstance(cols, list) else cols)


DRY = [(40, 14, 14), (62, 24, 22), (86, 38, 32), (112, 56, 46), (150, 84, 70)]   # meat a while dead: brown-red, dull, one dull light
WASH = [(70, 60, 64), (120, 104, 104), (170, 150, 146), (206, 190, 182)]          # drowned flesh: washed out, grey-pink
BLOAT = [(58, 72, 60), (96, 112, 94), (138, 150, 128), (176, 184, 162)]          # drowned skin: swollen, grey-green
EEL = [(18, 22, 16), (40, 46, 32), (66, 74, 50), (120, 124, 96)]                 # eel: dark olive, a pale belly line


GUTW = [(88, 22, 30), (132, 40, 40), (172, 66, 60), (204, 98, 84), (228, 134, 112), (246, 176, 150)]   # gut: warm pink-red (critic r1: mauve reads as worms)
SOIL = (44, 28, 16)


def yourgrave(path):
    """(round 2) a D-shaped tear in the chest (the breastbone along its straight lip, four lit red rib ridges at uneven gaps, each
    steeper than the last), shoulders and sleeves given form, warm creased guts, two different hands of bone, the pool wet"""
    z = Z1(path); c = z.c
    # ---- the soil under him soaked black, old, wet in the middle with a warm light on its upper left
    for (cx, cy, rx, ry, sd) in ((56, 76, 18, 4.4, 2), (40, 69, 5, 2.6, 5)):
        pts = []
        for Y in range(int(cy - ry) - 2, int(cy + ry) + 3):
            for X in range(int(cx - rx) - 2, int(cx + rx) + 3):
                a = math.atan2((Y + .5 - cy) / ry, (X + .5 - cx) / rx); w = 1 + .16 * math.sin(a * 3 + sd) + .1 * math.sin(a * 7 + sd * 2)
                d = ((X + .5 - cx) / (rx * w)) ** 2 + ((Y + .5 - cy) / (ry * w)) ** 2
                if d >= 1: continue
                q = z.get(X, Y)
                if q[3] < 200 or not (q[0] < 70 and q[1] < 60): continue   # only on the soil of the pit floor, never over him
                z.p(X, Y, CRUST[0] if d > .78 else XB[1] if d > .45 else XB[2]); pts.append((X, Y, d))
        for (X, Y, d) in pts:
            if .35 < d < .6 and (X - cx) < -rx * .2 and (Y - cy) < 0 and (X + Y) % 3: z.p(X, Y, XB[4] if (X + Y) % 2 else (190, 92, 76))   # the wet light
    # ---- his shape: the shoulders rounded off at the collar end, a crease where each sleeve lies along him, an elbow, an open collar
    for (x, y) in ((42, 48), (43, 48), (42, 49), (42, 71), (43, 71), (42, 70)): z.p(x, y, SOIL)
    for (x, y) in ((44, 48), (43, 49), (42, 50), (44, 71), (43, 70), (42, 69)): z.p(x, y, OUT)
    for X in range(46, 74):
        if X in (59, 60): continue
        z.p(X, 50, OUT if X % 9 else (30, 14, 12)); z.p(X, 70, OUT if X % 7 else (30, 14, 12))   # sleeve against body
    for (x, y) in ((59, 49), (60, 50), (59, 71), (60, 70)): z.p(x, y, OUT)   # the elbows
    for (x, y) in ((43, 56), (44, 57), (45, 58), (43, 63), (44, 62), (45, 61)): z.p(x, y, OUT)   # the open collar either side of the throat
    # ---- the chest (round 3: it has to be a different value from the shirt, or it is a burn in a blanket): the shirt torn back from
    # it, the check round it gone dull and dark; a band of dead grey-yellow skin round the opening; a D-shaped tear, near black
    # inside, the breastbone its straight lip, dull and pale; four lit red rib ridges with wet orange-pink lights; the guts out of
    # that same cut as one spill, over his side and down onto the floor of the grave
    DSK = [(96, 88, 66), (140, 130, 100), (178, 168, 132), (206, 196, 160)]   # dead skin: grey-yellow
    cav = set()
    for Y in range(50, 60):
        for X in range(45, 62):
            u = (X + .5 - 53.2) / 8.2; v = (59.4 - (Y + .5)) / 8.6; a = math.atan2(v, u)
            w = 1 + .1 * math.sin(a * 7 + 1.1) + .06 * math.sin(a * 13 + .3)
            if v > 0 and u * u + v * v < w * w: cav.add((X, Y))
    near = lambda X, Y: min((abs(X - a) + abs(Y - b) for (a, b) in cav), default=99)
    lum = lambda q: .3 * q[0] + .59 * q[1] + .11 * q[2]
    for Y in range(45, 66):
        for X in range(41, 67):
            if (X, Y) in cav: continue
            d = near(X, Y); q = z.get(X, Y)
            if q[3] < 200 or d > 6: continue
            shirt = q[0] > q[1] * 1.6 and q[0] > 70
            if d <= 2 and (Y < 60 or X < 47 or X > 60):   # the skin bared round the tear, lit on its upper left
                z.p(X, Y, DSK[3] if (d == 1 and (Y < 54 and X < 53)) else DSK[2] if d == 1 else DSK[1])
            elif shirt:   # the shirt torn back: the check gone dull, dark and grey round it (the cloth's ranks kept)
                l = lum(q); k = .42 if d <= 4 else .62
                z.p(X, Y, (int(l * k * 1.06), int(l * k * .92), int(l * k * .84)))
    for (X, Y) in ((44, 51), (45, 50), (46, 49), (61, 49), (62, 50), (63, 51), (43, 60), (44, 61)):   # the torn edges of the cloth, folded back
        z.p(X, Y, OUT)
    for (X, Y) in cav: z.p(X, Y, (10, 4, 6) if Y < 57 else XB[0])
    for X in range(45, 62):   # the breastbone: the straight lip, dull and pale, cracked in two places
        z.p(X, 59, BONE[2] if X not in (50, 56) else XB[1]); z.p(X, 60, BONE[1] if X not in (50, 51, 56) else XB[0])
    for (x0, dx0) in ((46.4, .95), (49.8, .7), (54.2, .48), (58.0, .28)):   # rib ridges, each steeper, wet on top
        x, y = x0, 58.0; first = None
        for t in range(10):
            X, Y = int(round(x)), int(round(y))
            if (X, Y) not in cav or Y < 50: break
            z.p(X, Y, MUS[4] if t < 2 else MUS[3]); z.p(X + 1, Y, MUS[2]) if (X + 1, Y) in cav else None
            if t == 1: z.p(X, Y, (236, 150, 124))   # the wet light
            if t == 4: z.p(X, Y, (214, 112, 92))
            x += dx0 + t * .04; y -= 1
    maggots(z, 51, 57.4, 1.4, .8, 77)
    # the guts: out over the breastbone from the bottom of the opening, across his belly and off his side into one heap
    xtube(z, [(58.4, 58.2), (59.6, 61.4), (60.4, 64.6), (61.6, 67.8), (61, 71), (62.6, 74.4), (66.2, 75.6), (69.4, 77.8)], 1.15, 1.2, R=GUTW, seed=11)
    xtube(z, [(69.4, 77.8), (68.2, 80.6), (63.4, 80.2), (60.2, 81.6), (63.8, 83), (69, 82.4), (72.2, 80.4)], 1.1, .95, R=GUTW, seed=12)
    xtube(z, [(61.4, 77.6), (57.6, 79.8), (58.6, 82.6)], .85, .75, R=GUTW, seed=13)
    # ---- the neck: torn to the bone, strands either side, a run down into the soil
    for X in range(38, 44):
        for Y in (55, 56, 62, 63):
            if H(X, Y, 4) < .75: z.p(X, Y, DRY[2] if Y in (55, 62) else DRY[1])
    for X in (38, 40, 42): z.p(X, 57, BONE[3]); z.p(X, 61, BONE[1])
    run_(z, [(40, 64), (40, 65), (41, 66), (41, 67)], [XB[2], XB[2], XB[1], XB[1]])
    # ---- the skull (round 3): the pale ring of hair round it read as a halo, so it is broken: the scalp still holds at the top left with
    # its matted grey hair; elsewhere the hair is gone to the soil, and where the ring met bone at the jaw and cheek there is torn
    # flesh, red and wet like the rest of him; one eye shrunk in its socket, maggots in the other
    ring = []
    for Y in range(50, 72):
        for X in range(18, 40):
            q = z.get(X, Y)
            if q[3] > 200 and abs(q[0] - q[2]) < 12 and q[0] > 120: ring.append((X, Y))
    isbone = lambda X, Y: (lambda q: q[0] > 190 and q[2] < q[0] - 18)(z.get(X, Y))
    for (X, Y) in ring:
        if X < 28 and Y < 60: z.p(X, Y, (150, 150, 146) if (X + Y) % 3 else (110, 108, 104)); continue   # the scalp, still there, matted
        nb = any(isbone(X + a, Y + b) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        z.p(X, Y, (MUS[2] if (X + Y) % 3 else MUS[1]) if nb and (X > 30 or Y > 62) else SOIL)
    for (x0, x1, y) in ((35, 38, 56), (35, 38, 57), (35, 38, 58), (36, 38, 59), (35, 37, 60), (34, 37, 62), (33, 36, 63), (33, 36, 64), (34, 36, 65),   # the cheek and jaw, fresh
                        (23, 25, 61), (23, 25, 62), (23, 26, 63), (24, 26, 64)):
        for X in range(x0, x1): z.p(X, y, MUS[3] if X == x0 and y < 60 else MUS[2] if (X + y) % 3 else MUS[1])
    for (x, y) in ((37, 63), (37, 64), (36, 66), (25, 65), (26, 66)): z.p(x, y, MUS[1])   # strips hanging off
    z.p(36, 57, (236, 150, 124)); z.p(23, 62, (214, 112, 92))   # wet
    # (round 4) the bone is not clean: stained a dirty yellow-grey, darker in its hollows, and flesh still along the brow
    STAIN = {(242, 232, 208): (196, 184, 140), (232, 224, 200): (182, 170, 128), (216, 204, 176): (162, 150, 112), (200, 188, 160): (140, 128, 96)}
    for Y in range(50, 72):
        for X in range(18, 40):
            q = z.get(X, Y)[:3]
            if q in STAIN: z.p(X, Y, STAIN[q])
    for (x0, x1, y) in ((25, 33, 55), (24, 30, 56), (31, 34, 56)):   # the brow, its flesh in a torn strip
        for X in range(x0, x1): z.p(X, y, MUS[2] if (X + y) % 4 else MUS[1])
    z.p(26, 55, MUS[3]); z.p(27, 55, (214, 112, 92))
    for (x, y, col) in ((26, 58, (170, 168, 160)), (27, 58, (196, 194, 184)), (26, 59, (120, 126, 130)), (27, 59, (150, 150, 148)), (28, 59, XB[1])): z.p(x, y, col)
    maggots(z, 33, 59.5, 1.3, 1, 91)
    # ---- the hands (round 4: bare bones in a fan read as forks): still in their skin, gone grey-yellow and split, slack, the fingers of
    # different lengths; the far one half closed, the near one open with the skin slipping off two fingers to the bone
    DSKH = [(96, 88, 66), (140, 130, 100), (178, 168, 132), (206, 196, 160)]
    for (hx, hy) in ((74, 45), (74, 72)):
        for X in range(hx, hx + 6):
            for Y in range(hy, hy + 4):
                q = z.get(X, Y)
                if q[0] > 180 and q[1] > 170: z.p(X, Y, DSKH[2] if Y == hy else DSKH[1])
    for (pts, col) in (([(80, 45), (81, 45), (82, 46)], DSKH[2]), ([(80, 46), (81, 47)], DSKH[1]), ([(80, 47), (81, 48), (82, 48), (83, 48)], DSKH[1]),   # the far hand, half shut
                       ([(80, 72), (81, 72), (82, 71), (83, 71)], DSKH[2]), ([(80, 73), (81, 73), (82, 73), (83, 73), (84, 74)], DSKH[1]), ([(80, 75), (81, 76)], DSKH[1])):
        for (x, y) in pts: z.p(x, y, col)
    for (x, y) in ((84, 71), (85, 71), (85, 74), (86, 74)): z.p(x, y, BONE[2])   # bone where the skin has slipped off
    for (x, y) in ((79, 46), (79, 73), (78, 74)): z.p(x, y, MUS[1])               # split at the knuckles
    z.overlay('g6_yourgrave_ov')
    return z


def drowned(path):
    """(round 2) lighter, so it shows against the dark coats (critic r1: dark green eels read as scarves or snakes): their skin
    swollen grey-white, holes torn in them with pale washed lips, and their guts drifting up out of them the way the hair does"""
    z = Z1(path)
    PALE = [(96, 104, 100), (150, 156, 148), (192, 196, 186), (224, 226, 216)]   # drowned skin: swollen, grey-white
    GUTP = [(84, 70, 74), (140, 118, 118), (190, 168, 160), (222, 206, 196)]       # drowned gut: washed out to a pale grey-pink
    MEATW = [(78, 92, 92), (138, 108, 110)]   # (round 3) the meat in the wounds washed out and lifted toward the water's teal, so it shows on a black coat
    def hole(cx, cy, w):
        for X in range(cx - w, cx + w + 1):
            z.p(X, cy - 1, PALE[3] if X < cx else PALE[2]); z.p(X, cy, MEATW[0] if abs(X - cx) < w else PALE[2]); z.p(X, cy + 1, MEATW[1] if abs(X - cx) < w else PALE[1])
        z.p(cx - w - 1, cy, PALE[2]); z.p(cx + w + 1, cy, PALE[1]); z.p(cx + w, cy + 2, PALE[2])   # the lips torn, uneven
    def gut(pts, r0=1.45, r1=1.0):
        xtube(z, pts, r0, r1, R=GUTP + [GUTP[3], (240, 232, 224)], rim=False, seed=int(pts[0][0] * 3))
    def strips(x0, y0, specs, seed):
        """(round 4) flesh, not objects: ragged strips of different lengths and widths drifting up and right from the wound, the
        way the hair drifts, every step a little different (no straight edge, no even spacing)"""
        for k, (L, w, dx) in enumerate(specs):
            x, y = x0 + k * .8, y0
            for i in range(L):
                j = H(i, k, seed) - .45; X, Y = int(round(x + math.sin(i * .8 + k * 2.1) * (.6 + i * .09))), int(round(y))   # a ribbon in still water, curling more toward its end
                ww = w if i < L * .6 else 1
                for u in range(ww): z.p(X + u, Y, GUTP[3] if u == 0 and H(i, k, seed + 1) < .5 else GUTP[2] if u == 0 else GUTP[1])
                x += dx + j * .9; y -= 1 if H(i, k, seed + 2) < .8 else 0
            z.p(int(round(x)), int(round(y)), GUTP[1])
    # the grey-headed man (right): his head swollen grey-white; the back of his coat split over swollen pale flesh, and from it his
    # insides drifting up in ragged strips
    for Y in range(45, 53):
        for X in range(111, 119):
            q = z.get(X, Y)
            if q[3] > 200 and abs(q[0] - q[1]) < 14 and q[0] > 110: l = q[0]; z.p(X, Y, PALE[3] if l > 190 else PALE[2] if l > 150 else PALE[1])
    for (x, y, c_) in ((114, 57, PALE[3]), (115, 57, PALE[2]), (116, 58, PALE[2]), (114, 58, PALE[2]), (115, 58, MEATW[1]), (115, 59, MEATW[0]), (116, 59, MEATW[1]),
                       (114, 59, PALE[1]), (117, 59, PALE[1]), (115, 60, PALE[2]), (116, 60, PALE[1]), (113, 58, (20, 18, 22)), (117, 58, (20, 18, 22)), (116, 61, (20, 18, 22))):
        z.p(x, y, c_)   # the coat split, ragged, over pale swollen flesh
    strips(115, 57, ((7, 2, .55), (12, 1, .38), (4, 1, .9)), 41)
    # the dark-haired man (left): the back of his neck torn with pale lips; his forearm opened, and from it ragged strips drifting up
    hole(25, 50, 2)
    for (x, y, c_) in ((30, 56, PALE[2]), (31, 56, PALE[3]), (30, 57, MEATW[1]), (31, 57, MEATW[0]), (30, 58, MEATW[0]), (31, 58, MEATW[1]), (32, 58, PALE[2]),
                       (30, 59, PALE[1]), (31, 59, PALE[2]), (29, 57, PALE[1]), (32, 56, PALE[1])):
        z.p(x, y, c_)   # the forearm opened, the lips pale
    strips(31, 56, ((10, 2, .5), (6, 1, .75), (13, 1, .42)), 43)
    for Y in range(34, 70):   # the gut's own blood coat washes out too (crimson on a black coat vanished in grey)
        for X in list(range(14, 40)) + list(range(104, 128)):
            q = z.get(X, Y)
            if q[:3] in XB: z.p(X, Y, (118, 96, 100) if q[:3] in XB[2:] else (88, 84, 88))
    # the hands: swollen grey-white, the skin coming off like a glove
    for (hx, hy) in ((31, 61), (122, 63)):
        for (dx, dy, k) in ((0, 0, 3), (1, 0, 2), (2, 0, 2), (0, 1, 2), (1, 1, 1), (2, 1, 1), (0, 2, 1), (1, 2, 0)):
            z.p(hx + dx, hy + dy, PALE[k])
        z.p(hx, hy + 3, PALE[3]); z.p(hx + 1, hy + 3, PALE[2]); z.p(hx, hy + 4, PALE[2])
    z.overlay('g6_drowned_ov')
    return z


def roaddeer(path):
    """(round 4) the deer in the road, drawn new at the scene's own pixel size (critic r3: from the chunky whole deer it read as a fox
    or a dog): lying on its side, grey-brown with a pale belly, a long neck laid out flat, a long blunt muzzle with a dark nose, a big
    leaf ear laid back, long thin legs with dark hooves, a short white flag of a tail; torn open along the belly, the guts out of the
    tear and down onto the road, blood from its mouth, a pool spreading under it. (path: ignored, kept for the call)"""
    W_, H_ = 72, 40; c = C(W_, H_)
    class _Z: pass
    z = _Z(); z.c = c; z.S = 1; z.pad = 0; z.W, z.H = W_, H_; z.X = lambda x: x; z.Y = lambda y: y; z.r = lambda v: v
    z.p = lambda x, y, col, a=255: c.p(x, y, col, a); z.F = lambda: F(W_, H_); z.get = lambda x, y: c.px[int(x), int(y)]
    DG = [(54, 38, 30), (88, 62, 44), (120, 88, 62), (148, 112, 80), (172, 136, 100), (196, 164, 128)]   # grey-brown hide, warm in the light
    BEL = [(150, 136, 116), (192, 180, 158), (218, 208, 188)]                                           # the pale belly
    xpool(z, 36, 31.4, 15, 2.6, 2.2, clots=3, tongues=0)
    f = F(W_, H_)
    for (x0, y0, x1, y1, r0, r1) in ((44, 25.6, 50, 30.6, 1.2, .9), (50, 30.6, 59.4, 34.2, .9, .7),   # the near foreleg, stretched out, the knee bent
                                     (42.4, 26.4, 46.4, 32.4, 1.1, .8), (46.4, 32.4, 52.6, 37.6, .8, .6),   # the far foreleg
                                     (22.4, 25, 17.4, 30, 1.4, .9), (17.4, 30, 7.6, 32.8, .9, .65),    # the hind legs, long
                                     (25, 26, 22.2, 31.8, 1.3, .85), (22.2, 31.8, 14.4, 37, .85, .6)):
        f.cap(x0, y0, x1, y1, r0, r1, 'leg', base=.5, hs=.8)
    f.blob(33.5, 21.4, 14.2, 6.2, 'hide', hs=1.1)                       # the body
    f.blob(22.6, 20.6, 5.6, 5.4, 'hide', base=.3, hs=1.1)               # the haunch
    f.cap(45, 19.6, 54.6, 21.2, 3.6, 2.4, 'hide', base=.2, hs=1)        # the long neck, laid out flat
    f.blob(57.8, 21.4, 4.4, 3.4, 'hide', base=.6, hs=1, rot=.12)         # the head, a good size
    f.cap(60, 22.2, 64.6, 23.2, 2.6, 2.1, 'hide', base=.6, hs=.9)       # the muzzle: long, deep and blunt
    f.render(c, {'hide': DG, 'leg': DG})
    for Y in range(22, 30):   # the belly, pale, along the underside of the body
        for X in range(20, 48):
            q = c.px[X, Y]
            if q[3] > 200 and q[:3] in DG and (X, Y + 1) and c.px[X, min(H_ - 1, Y + 2)][3] < 200: c.p(X, Y, BEL[1] if c.px[X, Y + 1][3] < 200 else BEL[2])
    for X in range(21, 47):
        for Y in range(24, 29):
            q = c.px[X, Y]
            if q[3] > 200 and q[:3] in DG[2:] and c.px[X, Y + 2][3] < 200: c.p(X, Y, BEL[1])
    for (x, y) in ((66, 21), (67, 22), (67, 23), (66, 23), (66, 24)): c.p(x, y, (26, 18, 16))   # the dark nose, blunt
    for (x, y) in ((64, 25), (63, 25), (62, 25)): c.p(x, y, (44, 30, 24))                        # the mouth line
    for (x, y) in ((61, 24), (62, 24), (63, 24)): c.p(x, y, BEL[1])                              # the pale chin
    c.p(57, 20, (20, 14, 12)); c.p(58, 20, (20, 14, 12)); c.p(56, 19, DG[1])            # the eye, shut, a lid line
    ear = {}
    for y in range(9, 22):   # the big ear laid back along the neck: a leaf, dark rim, grey-brown, a pale inside
        for x in range(46, 60):
            u, v = x + .5 - 53.2, y + .5 - 15.8; a = .5; uu = (u * math.cos(a) + v * math.sin(a)) / 5.6; vv = (-u * math.sin(a) + v * math.cos(a)) / 2.5
            if uu * uu + vv * vv < 1: ear[(x, y)] = uu * uu + vv * vv
    for (x, y), d in ear.items():
        edge = any((x + a, y + b) not in ear for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        c.p(x, y, (44, 32, 26) if edge else BEL[2] if d < .45 and y >= 15 else DG[4])
    for (x, y, col) in ((18, 17, (238, 234, 222)), (17, 18, (238, 234, 222)), (18, 18, (220, 214, 200)), (17, 19, (220, 214, 200)), (19, 16, DG[2]), (18, 16, DG[1])):   # the short white flag of a tail
        c.p(x, y, col)
    for (x0, y0, x1, y1) in ((59.4, 34.2, 60.8, 34.8), (52.6, 37.6, 53.8, 38.2), (7.6, 32.8, 6.2, 33.2), (14.4, 37, 13, 37.6)):   # dark hooves
        c.p(x1, y1, (24, 16, 14)); c.p(x0, y0, (40, 28, 24))
    outline2(c, lit=True)
    z.base = c.im.copy()
    xpool(z, 38, 31.6, 16, 2.8, 2.2, clots=3, tongues=0)
    # torn open along the belly: a ragged tear on the lower flank, dark inside, the far lip dark, the near lip raw muscle, rib ridges lit red
    cav = set()
    for Y in range(18, 30):
        for X in range(22, 48):
            u = (X + .5 - 35.2) / 8.2; v = (Y + .5 - 24.4) / 2.4; a = math.atan2(v, u)
            w = 1 + .12 * math.sin(a * 6 + .7) + .08 * math.sin(a * 11)
            if v < 0: w *= .82
            if u * u + v * v < w * w and c.px[X, Y][3] > 200: cav.add((X, Y))
    rim = {q for q in cav if any((q[0] + a, q[1] + b) not in cav for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)))}
    for (X, Y) in cav: z.p(X, Y, OUT if (X, Y) in rim and Y < 24 else MUS[2] if (X, Y) in rim else XB[0] if Y < 24 else XB[1])
    for (x0, k) in ((29, 0), (32, 1), (36, 2), (39, 3)):   # rib ridges inside, lit red, uneven
        for t in range(3):
            X, Y = x0 + t, 22 + t
            if (X, Y) in cav and (X, Y) not in rim: z.p(X, Y, MUS[4] if t == 0 else MUS[3])
    z.p(30, 23, (236, 150, 124)); z.p(37, 23, (214, 112, 92))   # wet
    xtube(z, [(33, 26), (30.4, 28), (31.6, 30.4), (36, 31), (38.8, 29.4), (41, 31.4), (44.6, 32), (47.4, 30.4)], 1.15, 1.0, R=GUTW, seed=21)   # out and down onto the road
    xtube(z, [(40.4, 26.4), (42.4, 28.4)], .8, .9, R=GUTW, seed=22)
    for (x, y) in ((64, 25), (64, 26), (63, 27), (63, 28), (64, 29)): z.p(x, y, XB[2] if y < 27 else XB[1])   # from its mouth
    z.c.im.save('spr/lpc/obj/g6_roaddeer.png'); print('wrote g6_roaddeer', z.c.im.getbbox())
    return z


if __name__ == '__main__':
    a, b = sys.argv[1:3]
    yourgrave(a); drowned(b); roaddeer('spr/lpc/obj/g_deer_open_t.png')
