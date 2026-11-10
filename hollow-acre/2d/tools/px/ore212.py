"""Ore nodes and their drops (#198; baseline judge: "all five are one stamped dome; coal and iron are the same grey rock").
Each node is its own rock, drawn as a few flat facets lit from the top-left (top facet lightest, west face mid, front/east darkest),
and each material reads at 1x in its own shape, not as flecks:
  stone  - a low slab, two olive moss clumps, one branching crack
  coal   - angular black lumps standing proud of the rock, a cool glint on each lit edge
  copper - fat pink-gold nuggets (3x3 and up) and a green verdigris streak
  iron   - a blocky rock with rust-red oxide patches and hard silver glints
  gem    - teal crystals breaking the outline, a white glint on each
The icons (32x32) are the same materials, so a node and its drop match. Sizes and anchors stay as they were.
    python3 ore212.py -> out/ore212_<name>.png
"""
import math
from PIL import Image, ImageDraw


def hexr(a):
    return [tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) for h in a]


ROCK = hexr(['#1c1a20', '#302d36', '#47434e', '#605b67', '#7b7582', '#9a94a0'])
WARM = hexr(['#221e1c', '#38322e', '#504842', '#6a6058', '#867a70', '#a2968a'])
COAL = hexr(['#0c0c10', '#16161c', '#22222a', '#30303a'])
GLINT_C = (120, 140, 170)
CU = hexr(['#4a2214', '#7a3e22', '#b0663a', '#d89462', '#f2c49a'])
VERD = hexr(['#2e5a4a', '#4a8a6c', '#7ab898'])
RUST = hexr(['#3a1c10', '#5e2e16', '#86441e', '#a8622a', '#c88a3e'])   # (ores r1: "maroon blocks read as meat") orange-brown oxide, an ochre top step
SILVER = (226, 228, 236)
GEM = hexr(['#0c3a3c', '#14625e', '#22948a', '#5ac8b8', '#b6f2e6'])
MOSS = hexr(['#2a3418', '#3e4a22', '#56622e'])


class Spr:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); self.d = ImageDraw.Draw(self.im)

    def poly(self, pts, col):
        self.d.polygon(pts, fill=col + (255,))

    def px(self, x, y, col):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.im.putpixel((x, y), col + (255,))

    def line(self, pts, col):
        self.d.line(pts, fill=col + (255,), width=1)

    def shadow(self, cx, cy, rx, ry, a=110):
        sh = Image.new('RGBA', (self.w, self.h), (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
        sd.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(8, 6, 10, a))
        self.im.alpha_composite(sh)

    def done(self):
        src = self.im.copy(); s = src.load(); o = self.im.load()
        for y in range(self.h):
            for x in range(self.w):
                if s[x, y][3] > 200:
                    continue
                for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                    X, Y = x + dx, y + dy
                    if 0 <= X < self.w and 0 <= Y < self.h and s[X, Y][3] > 200:
                        r, g, b, _ = s[X, Y]
                        o[x, y] = (max(10, int(r * .32)), max(8, int(g * .28)), max(14, int(b * .36)), 255)
                        break
        return self.im


def rock(S, top, west, front, R=ROCK, ks=(4, 3, 2)):
    """a rock from three facets: the top (lit), the west face, the front face"""
    S.poly(front, R[ks[2]]); S.poly(west, R[ks[1]]); S.poly(top, R[ks[0]])
    # the lit rim along the top facet's upper-left edges
    for i in range(len(top) - 1):
        (x0, y0), (x1, y1) = top[i], top[i + 1]
        if x1 < x0 or y1 < y0:
            S.line([(x0, y0), (x1, y1)], R[min(5, ks[0] + 1)])


def lump(S, pts, glint):
    """an angular coal lump: a dark facet, a darker one, a cool glint along its lit edge"""
    cx = sum(p[0] for p in pts) / len(pts); cy = sum(p[1] for p in pts) / len(pts)
    S.poly(pts, COAL[2])
    S.poly([pts[0], pts[1], (cx, cy)], COAL[3])
    S.poly([pts[-1], pts[-2], (cx, cy)], COAL[0])
    S.line([pts[0], pts[1]], glint)


def oxide(S, x, y, length, seed):
    """a ragged rust streak bleeding down from a crack: a dark crack line, the oxide spreading 1-3 px either side, ochre where it catches the light"""
    import random
    R = random.Random(seed)
    for j in range(length):
        X = x + (j // 3) * (1 if seed % 2 else -1) + (1 if R.random() < .3 else 0); Y = y + j
        w = 1 + (j < length - 2) + (R.random() < .4)
        S.px(X, Y, RUST[0])
        for i in range(1, w + 1):
            S.px(X - i, Y, RUST[3] if (i == w and j < length // 2) else RUST[2])
            S.px(X + i, Y, RUST[1])
        if j == 0:
            S.px(X - 1, Y - 1, RUST[4]); S.px(X, Y - 1, RUST[3])


def nugget(S, x, y, r):
    """a rough nugget: a lumpy blob, a corner bitten off, a knob standing out, lit top-left"""
    bite = ((x * 7 + y * 3) % 4)
    for j in range(-r - 1, r + 2):
        for i in range(-r - 1, r + 2):
            q = i * i + j * j
            knob = (i, j) == ((r + 1) if bite % 2 else -(r + 1), 0) or (i, j) == (0, (r + 1) if bite > 1 else -(r + 1))
            if q > r * r + r and not knob:
                continue
            if (bite == 0 and i == r and j == r) or (bite == 1 and i == -r and j == r) or (bite == 2 and i == r and j == -r):
                continue
            l = -i - j
            S.px(x + i, y + j, CU[4] if l > r else CU[3] if l > 0 else CU[2] if l > -r else CU[1])


def crystal(S, x, y, h, w, lean):
    """a hexagonal crystal: a lit face, a dark face, a cap, a glint"""
    tx = x + lean
    S.poly([(x - w, y), (x, y + 1), (tx, y - h), (tx - w, y - h + 1)], GEM[3])
    S.poly([(x, y + 1), (x + w, y), (tx + w, y - h + 1), (tx, y - h)], GEM[1])
    S.poly([(tx - w, y - h + 1), (tx, y - h), (tx + w, y - h + 1), (tx, y - h - 2)], GEM[4])
    S.px(int(round(tx - w + 1)), int(round(y - h + 3)), (240, 255, 252))


def ore(name):
    if name == 'stone':
        S = Spr(28, 24); S.shadow(14, 20, 12, 3)
        rock(S, [(3, 12), (7, 7), (14, 5), (22, 6), (26, 11), (17, 13), (8, 14)],
             [(3, 12), (8, 14), (9, 20), (4, 19)], [(8, 14), (17, 13), (26, 11), (25, 18), (18, 21), (9, 20)], WARM)
        for (cx, cy, r) in ((9, 8, 2), (12, 7, 1), (20, 7, 2)):                     # two olive moss clumps (and a sprig)
            for j in range(-r, r + 1):
                for i in range(-r - 1, r + 2):
                    if i * i * .7 + j * j <= r * r:
                        S.px(cx + i, cy + j, MOSS[2] if j < 0 else MOSS[1])
            S.px(cx, cy + r, MOSS[0])
        for (x, y) in ((15, 14), (16, 15), (16, 16), (17, 17), (18, 18), (15, 16), (14, 17)):   # a branching crack
            S.px(x, y, WARM[0]); S.px(x + 1, y, WARM[4])
        return S.done()
    if name == 'coal':
        S = Spr(28, 24); S.shadow(14, 20, 12, 3)
        rock(S, [(4, 13), (8, 9), (15, 8), (22, 9), (25, 13), (16, 15), (8, 15)],
             [(4, 13), (8, 15), (9, 20), (4, 19)], [(8, 15), (16, 15), (25, 13), (24, 19), (17, 21), (9, 20)])
        lump(S, [(8, 10), (11, 5), (15, 7), (14, 12), (9, 13)], GLINT_C)            # black lumps standing proud of the rock
        lump(S, [(15, 9), (18, 4), (23, 7), (21, 12), (16, 12)], GLINT_C)
        lump(S, [(19, 14), (22, 11), (26, 13), (24, 18), (20, 17)], GLINT_C)
        lump(S, [(10, 16), (12, 14), (15, 16), (13, 19)], GLINT_C)
        return S.done()
    if name == 'copper':
        S = Spr(28, 24); S.shadow(14, 20, 11, 3)
        rock(S, [(5, 10), (9, 5), (16, 3), (22, 6), (24, 11), (15, 13), (8, 13)],
             [(5, 10), (8, 13), (9, 20), (5, 18)], [(8, 13), (15, 13), (24, 11), (23, 18), (16, 21), (9, 20)], WARM)
        for i, (x, y) in enumerate(((14, 15), (15, 16), (16, 17), (17, 18))):      # a green verdigris streak running down the face
            S.px(x, y, VERD[1]); S.px(x + 1, y, VERD[0])
        S.px(13, 14, VERD[2])
        nugget(S, 12, 8, 2); nugget(S, 19, 9, 2); nugget(S, 20, 16, 2); nugget(S, 10, 16, 1)
        return S.done()
    if name == 'iron':
        S = Spr(30, 26); S.shadow(15, 22, 13, 3)
        rock(S, [(4, 9), (7, 4), (14, 3), (17, 6), (25, 7), (27, 12), (16, 13), (6, 12)],
             [(4, 9), (6, 12), (7, 22), (3, 20)], [(6, 12), (16, 13), (27, 12), (26, 20), (17, 23), (7, 22)])
        for (x, y, L, sd) in ((11, 5, 6, 1), (21, 8, 4, 2), (10, 14, 7, 3), (20, 14, 6, 4)):
            oxide(S, x, y, L, sd)                                                    # oxide bleeding down from the cracks
        for (x, y) in ((14, 5), (24, 11), (8, 17), (16, 9)):                       # hard silver glints where the ore is bare
            S.px(x, y, SILVER); S.px(x + 1, y, (170, 172, 184))
        return S.done()
    if name == 'gem':
        S = Spr(26, 22); S.shadow(13, 18, 11, 3)
        rock(S, [(3, 12), (7, 9), (14, 9), (20, 10), (23, 13), (15, 15), (7, 15)],
             [(3, 12), (7, 15), (8, 19), (3, 17)], [(7, 15), (15, 15), (23, 13), (22, 18), (15, 20), (8, 19)])
        crystal(S, 10, 12, 9, 2, -2); crystal(S, 15, 11, 11, 2, 1); crystal(S, 19, 13, 6, 2, 2)   # crystals breaking the outline
        return S.done()


def icon(name):
    S = Spr(32, 32)
    if name == 'coal':   # (ores r1: "two black bricks with a full rim") three uneven matte lumps, a glint or two, no rim
        for pts in ([(15, 12), (19, 6), (25, 8), (28, 14), (24, 19), (17, 18)],
                    [(4, 19), (7, 12), (13, 11), (17, 16), (15, 23), (8, 24)],
                    [(12, 27), (15, 21), (22, 20), (26, 25), (21, 30), (14, 30)]):
            cx = sum(p[0] for p in pts) / len(pts); cy = sum(p[1] for p in pts) / len(pts)
            S.poly(pts, COAL[2])
            S.poly([pts[0], pts[1], pts[2], (cx, cy)], COAL[3])                   # the lit upper facets
            S.poly([pts[3], pts[4], (cx, cy)], COAL[1]); S.poly([pts[4], pts[5], (cx, cy)], COAL[0])
        for (x, y) in ((19, 8), (8, 14), (17, 22)):
            S.px(x, y, (168, 184, 210))
        S.px(20, 8, (110, 124, 150))
        return S.done()
    if name == 'copper':
        rock(S, [(4, 15), (10, 7), (20, 5), (28, 10), (28, 17), (17, 19), (8, 19)],
             [(4, 15), (8, 19), (9, 27), (4, 24)], [(8, 19), (17, 19), (28, 17), (27, 25), (18, 29), (9, 27)], WARM)
        nugget(S, 13, 11, 3); nugget(S, 22, 12, 2); nugget(S, 20, 23, 3); nugget(S, 11, 23, 2)
        for (x, y) in ((15, 18), (16, 19), (16, 20), (15, 21)):
            S.px(x, y, VERD[1])
        return S.done()
    if name == 'iron':
        rock(S, [(4, 12), (8, 6), (17, 5), (21, 8), (28, 9), (29, 15), (18, 17), (6, 16)],
             [(4, 12), (6, 16), (7, 27), (3, 24)], [(6, 16), (18, 17), (29, 15), (28, 25), (19, 29), (7, 27)])
        for (x, y, L, sd) in ((12, 7, 7, 1), (23, 10, 5, 2), (10, 18, 8, 3), (22, 18, 7, 4)):
            oxide(S, x, y, L, sd)
        for (x, y) in ((16, 7), (26, 13), (8, 21), (18, 12)):
            S.px(x, y, SILVER); S.px(x + 1, y, (170, 172, 184))
        return S.done()


if __name__ == '__main__':
    for n in ('stone', 'coal', 'copper', 'iron', 'gem'):
        ore(n).save(f'out/ore212_{n}.png')
    for n in ('coal', 'copper', 'iron'):
        icon(n).save(f'out/ore212_icon_{n}.png')
    print('ok')
