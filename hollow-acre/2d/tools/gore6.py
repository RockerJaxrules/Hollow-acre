"""(t375) Extreme gore, wave 2: the story's adult remains, drawn over the close-ups as they stand (Full and Toned never change).
Each is an overlay: the close-up's own picture (dumped from the game at 1x) is the base, the gore is drawn on it with gore5.py's kit
at the close-up's own pixel size, and only the pixels that changed are written out, so the game lays the overlay on its own picture
(gorex375.js) and the world sprite is shrunk from the same result.
  g6_yourgrave_ov  Silas's grave: the older you, grey-haired, in your clothes. The skull still has flesh on it in rags, one eye shrunk
                   in its socket and maggots in the other, the scalp peeled back; the neck torn to the bone; the shirt torn open and
                   the chest opened (rib ridges, a lung, the liver), the guts pulled out over the side onto the floor of the grave in
                   old dark lengths; the hands gnawed to the finger bones; the soil under him soaked black.
  g6_drowned_ov    (PARKED after six critic rounds: not shipped; the game keeps it behind window.GX2_DROWNED, off) the drowned of Old Wickham: ONLY the two grown men in top hats at either side (the small figure in the green dress
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
    # (round 6) the letter: the clean white page outshone everything; it has lain in the grave with him, dulled, a bloody thumbprint on it
    PAGE = {(242, 234, 210): (176, 164, 130), (200, 192, 168): (140, 128, 100)}
    for Y in range(52, 64):
        for X in range(63, 79):
            q = z.get(X, Y)[:3]
            if q in PAGE: z.p(X, Y, PAGE[q])
    for (x, y, c_) in ((65, 60, XB[3]), (66, 60, XB[2]), (65, 61, XB[2]), (66, 61, XB[3]), (75, 54, (120, 100, 76)), (76, 55, (120, 100, 76))): z.p(x, y, c_)
    z.overlay('g6_yourgrave_ov')
    return z


def drowned(path):
    """(round 6, after five rounds of strips that read as things carried) drowned bodies read through bloat and sloughing, in big simple
    shapes kept inside their silhouettes: each man's coat split down its back seam over swollen grey-green skin, mottled, with dark
    marbling; a dark ragged hollow above the collar where the fish have fed, its edges pale; the hands swollen grey-white and puffy,
    and on one the skin slipped off and hanging from the wrist like a loose wrinkled glove, dark where it came away"""
    z = Z1(path)
    PALE = [(96, 104, 100), (150, 156, 148), (192, 196, 186), (224, 226, 216)]   # swollen skin, grey-white
    BLO = [(62, 78, 66), (92, 110, 92), (128, 142, 118), (162, 172, 146)]       # bloated skin, grey-green
    VEIN = (58, 52, 72)                                                           # marbling: dark, a little violet
    HOLLOW = (22, 16, 20)
    def split(cx, y0, y1, seed):
        """the coat split along its back seam, wider in the middle, the skin swelling out through it, mottled in patches, veined"""
        for Y in range(y0, y1 + 1):
            f = (Y - y0) / max(1, y1 - y0); hw = 0.6 + 1.6 * math.sin(f * math.pi) + (H(Y, 3, seed) - .5) * .5
            x0, x1 = int(round(cx - hw)), int(round(cx + hw))
            for X in range(x0 - 1, x1 + 2):
                if X in (x0 - 1, x1 + 1): z.p(X, Y, (18, 18, 24)); continue   # the coat's torn edge, dark
                lit = X <= cx - hw * .3 and Y < y0 + (y1 - y0) * .6
                patch = H(X // 2, Y // 2, seed) 
                z.p(X, Y, BLO[3] if lit and patch < .6 else BLO[2] if patch < .55 else BLO[1])
        for (dx, dy, L) in ((0, 2, 3), (-1, 5, 2), (1, 7, 3)):   # marbling: dark veins running in the skin, branching, never dots
            for i in range(L): z.p(int(round(cx + dx + (i * .5 if dx >= 0 else -i * .5))), y0 + dy + i, VEIN)
    def bite(x0, x1, y):
        """above the collar: a dark ragged hollow where they have fed, torn pale only here and there along its edge (a whole pale row
        over a dark one reads as a mouth), raw dark flesh in its floor"""
        for X in range(x0, x1 + 1):
            deep = H(X, y, 5) < .55
            z.p(X, y, HOLLOW); z.p(X, y + 1, (74, 36, 40) if X not in (x0, x1) else HOLLOW)
            if deep: z.p(X, y - 1, HOLLOW)
            if H(X, y, 9) < .3: z.p(X, y - (2 if deep else 1), PALE[2])
        z.p(x0 - 1, y, PALE[1]); z.p(x1 + 1, y + 1, PALE[2])
    def hand(hx, hy, glove):
        """swollen grey-white and puffy; with glove, the skin slipped off and hanging from the wrist, dark where it came away"""
        for (dx, dy, k) in ((0, 0, 3), (1, 0, 3), (2, 0, 2), (0, 1, 2), (1, 1, 2), (2, 1, 1), (0, 2, 1), (1, 2, 1), (2, 2, 0), (-1, 1, 2)):
            z.p(hx + dx, hy + dy, PALE[k])
        if glove:
            z.p(hx + 1, hy, (74, 36, 40)); z.p(hx + 2, hy, (58, 26, 30)); z.p(hx + 2, hy + 1, (74, 36, 40))   # where the skin came away
            for (dx, dy, c_) in ((0, 3, PALE[2]), (1, 3, PALE[1]), (0, 4, (70, 72, 70)), (1, 4, PALE[2]), (2, 4, PALE[0]), (0, 5, PALE[1]), (1, 5, (70, 72, 70)), (1, 6, PALE[1])):   # the loose glove, grey, wrinkled, hanging
                z.p(hx + dx, hy + dy, c_)
    # the dark-haired man (left)
    bite(23, 27, 50)
    split(25.6, 53, 62, 61)
    hand(31, 60, False)
    # the grey-headed man (right): his head swollen grey-white as well
    for Y in range(45, 53):
        for X in range(111, 119):
            q = z.get(X, Y)
            if q[3] > 200 and abs(q[0] - q[1]) < 14 and q[0] > 110: l = q[0]; z.p(X, Y, PALE[3] if l > 190 else PALE[2] if l > 150 else PALE[1])
    bite(113, 117, 52)
    split(115.6, 55, 64, 67)
    hand(121, 62, True)
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
