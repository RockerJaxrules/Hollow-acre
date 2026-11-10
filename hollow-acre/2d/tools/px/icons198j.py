"""#198 round 15.
  pie   - (r14 installed at 6/5) "halve the side; a fluted tan rim, lit top-left, so the outline is scalloped" + "burnt orange-brown
          custard, a darker baked ring inside the crust, one glossy highlight top-left"
  bait  - (r14 installed at 6/5) "the full-width arch reads as a pail handle: two or three shorter coils of different lengths, a blunt
          end, 1 px rings, a plum outline on the worms; nothing rises more than 3 px over the rim; a lit lip and a seam on the tin;
          something on the label that says bait"
  stone - (r10 tie 5: "a boulder on a shadow slab") cut flat faces with a clear step from the lit top to the dark side, lilac
          shades, a crack wide enough for 1x, no slab under it
  mail  - 'Iron mail shirt' (interim): a short-sleeved hauberk of staggered rings lit top-left, a leather collar and belt, a
          scalloped ring hem
    python3 icons198j.py -> out/r15_<name>.png
"""
import math, sys
from PIL import Image
sys.path.insert(0, '.')
from icons198 import Icon, RAMPS, hexr, sh

OUTL = (30, 20, 24)
PLUM = (0x4a, 0x1e, 0x2a)


def pie():
    I = Icon()
    OR = hexr(['#5e2410', '#7e3414', '#9c461c', '#b05a24', '#c26c30', '#d2843e'])
    CR = hexr(['#5a3a1c', '#7c5428', '#a07038', '#c08e4c', '#dcae68', '#eeca86'])
    cx, cy, rx, ry, wall = 15.5, 14.5, 12.6, 7.6, 2
    ang = lambda x, y: math.atan2(y + .5 - cy, x + .5 - cx)
    gone = lambda x, y: -0.12 < ang(x, y) < 0.92 and ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 > .0
    def rim(x, y):                                           # the outer edge rippled by the flutes
        a = ang(x, y); return 1 + .075 * math.cos(a * 16)
    def inside(x, y, dy=0):
        return ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy - dy) / ry) ** 2 < rim(x, y - dy)
    for y in range(32):                                      # the crust wall below the top, short
        for x in range(32):
            for h in range(1, wall + 1):
                if inside(x, y, h) and not inside(x, y) and not gone(x, y - h):
                    I.P(x, y, CR[1] if h == 1 else CR[0]); break
    for y in range(32):
        for x in range(32):
            if not inside(x, y) or gone(x, y): continue
            d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2
            a = ang(x, y)
            if d > .62:                                      # the fluted crust rim, each flute lit on the top-left
                flute = (math.cos(a * 16) > 0)
                lit = -math.cos(a + 2.3)                     # 1 at the top-left of the rim, -1 at the bottom-right
                k = 3 + (1 if flute else 0) + (1 if lit > .3 else -1 if lit < -.4 else 0)
                I.P(x, y, CR[max(1, min(5, k))])
            elif d > .46:
                I.P(x, y, OR[1] if d > .54 else OR[2])       # the darker baked ring just inside the crust
            else:
                s = (x - cx) * .6 + (y - cy)
                I.P(x, y, OR[5] if s < -5.5 else OR[4] if s < -1 else OR[3])
    for y in range(32):                                      # the cut faces of the missing slice: custard over crust
        for x in range(32):
            if I.p[x, y][3] or not gone(x, y): continue
            for h in range(1, wall + 2):
                if 0 <= y - h and I.p[x, y - h][3] and I.p[x, y - h][:3] in OR[2:]:
                    I.P(x, y, OR[0] if h == 1 else CR[1]); break
    for (x, y, c) in ((9, 10, (250, 232, 196)), (10, 10, (236, 196, 140)), (8, 11, (236, 196, 140))):
        I.P(x, y, c)                                         # the glaze glint
    for (x, y) in ((13, 13), (14, 13), (15, 13), (14, 12)):
        I.P(x, y, (246, 240, 226) if y < 13 or x == 13 else (214, 204, 190))   # a small dollop of cream
    return I.done()


MT = hexr(['#2e3038', '#464953', '#646871', '#868a93', '#a6aab2', '#c4c8d0', '#e2e4e6'])
RD = hexr(['#47141e', '#5a1a22', '#6d2127', '#812b2c', '#953631', '#b8513e', '#cc6a4e'])
PK = [(0xf2, 0xb2, 0xa6), (0xd0, 0x80, 0x7a), (0xa4, 0x56, 0x5a), (0x74, 0x34, 0x40)]


def bait():
    # r15: a deeper look into the tin (the mouth taller) so dark soil shows round and between the worms; two short coils lying
    # in it, one worm over the right lip hanging down the side with a blunt tip, one short one over the left lip
    I = Icon(); x0, x1, top, bot, ry = 7, 24, 12.4, 27.0, 3.6
    cxm = (x0 + x1) / 2 + .5; rx = (x1 - x0 + 1) / 2
    COL = [3, 4, 5, 5, 5, 4, 4, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 1]
    for x in range(x0, x1 + 1):                              # the tin's body, a cylinder lit from the left
        k = COL[x - x0]; e = 2.4 * math.sqrt(max(0, 1 - ((x + .5 - cxm) / rx) ** 2))
        for y in range(int(top), int(bot + e) + 1):
            if y + .5 > bot + e: continue
            c = MT[k]
            if 18 <= y <= 23: c = RD[k]                      # the label
            if y in (17, 24): c = MT[min(6, k + 1)]          # rolled beads above and below the label
            if y in (16, 25): c = MT[max(0, k - 1)]
            if x == 21 and not 18 <= y <= 23: c = MT[max(0, k - 1)]   # the soldered seam
            I.P(x, y, c)
    for (x, y) in ((10, 21), (11, 20), (12, 20), (13, 21), (14, 22), (15, 22), (16, 21), (17, 20)):
        I.P(x, y, (0xe8, 0xc8, 0xa8))                        # a little worm printed on the label
    for y in range(6, 18):                                   # the open mouth: a lip round dark soil
        for x in range(4, 29):
            d = ((x + .5 - cxm) / rx) ** 2 + ((y + .5 - top) / ry) ** 2
            if d < 1:
                if d < .6: I.P(x, y, (0x22, 0x16, 0x10) if (x * 3 + y) % 7 else (0x34, 0x24, 0x1a))
                elif y + .5 < top: I.P(x, y, MT[2] if x > cxm - 4 else MT[3])   # the far lip, in shade
                else: I.P(x, y, MT[6] if x < cxm - 2 else MT[5] if x < cxm + 4 else MT[3])   # the near lip, lit left
    worms = []
    def worm(pts):
        S = []
        for i in range(len(pts) - 1):
            (ax, ay), (bx, by) = pts[i], pts[i + 1]; n = max(2, int(math.hypot(bx - ax, by - ay) * 2))
            for j in range(n):
                t = j / n; S.append((ax + (bx - ax) * t, ay + (by - ay) * t, bx - ax, by - ay))
        S.append((pts[-1][0], pts[-1][1], pts[-1][0] - pts[-2][0], pts[-1][1] - pts[-2][1]))
        for i, (x, y, dx, dy) in enumerate(S):
            ring = int(i / 2) % 3 == 2                       # a darker ring every few px
            a = (int(x), int(y)); b = (int(x), int(y) + 1) if abs(dx) >= abs(dy) else (int(x) + 1, int(y))
            I.P(*a, PK[1] if ring else PK[0]); I.P(*b, PK[3] if ring else PK[2]); worms.extend([a, b])
        ex, ey = int(S[-1][0]), int(S[-1][1]); I.P(ex, ey, PK[0])   # the blunt lit tip
    worm([(10.4, 12.6), (11.6, 10.6), (13.6, 10.8), (14.2, 12.8)])           # a coil lying in the soil
    worm([(16.4, 13.6), (17.4, 11.6), (19.2, 11.2), (20.2, 12.4)])           # a second, soil between them
    worm([(20.6, 10.6), (23, 9.6), (25.2, 11.4), (25.6, 14.6), (25.5, 18.6), (25, 21)])   # over the right lip, down the side
    worm([(9.6, 13.8), (7.6, 14.2), (6.4, 16), (6.5, 17.6)])                 # over the left lip, short
    I.done()
    ws = set(worms)
    for y in range(32):                                      # the worms' outline plum, not black
        for x in range(32):
            if I.p[x, y][:3] == OUTL and any((x + dx, y + dy) in ws for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0))):
                I.p[x, y] = PLUM + (255,)
    return I.im


def stone():
    I = Icon(); L = hexr(['#26222c', '#38343f', '#4e4858', '#67606f', '#827b8a', '#9e97a6', '#beb8c4'])
    faces = [([(6, 14), (11, 8), (19, 6), (26, 10), (21, 15), (12, 16)], 5),    # the top, catching the light
             ([(6, 14), (12, 16), (13, 25), (7, 23), (5, 18)], 4),              # the left face
             ([(12, 16), (21, 15), (23, 25), (17, 27), (13, 25)], 3),           # the front face
             ([(21, 15), (26, 10), (28, 15), (27, 22), (23, 25)], 2)]           # the right face, in shade
    for pts, k in faces:
        I.poly(pts, 'st', 0)
        n = len(pts); ys = [p[1] for p in pts]
        for y in range(int(min(ys)), int(max(ys)) + 1):
            xs = []
            for i in range(n):
                (ax, ay), (bx, by) = pts[i], pts[(i + 1) % n]
                if (ay <= y + .5 < by) or (by <= y + .5 < ay): xs.append(ax + (y + .5 - ay) * (bx - ax) / (by - ay))
            xs.sort()
            for a, b in zip(xs[::2], xs[1::2]):
                for x in range(int(round(a)), int(round(b))): I.P(x, y, L[k])
    for (x, y) in ((11, 9), (12, 8), (13, 8), (14, 7), (15, 7), (10, 10), (9, 11), (8, 12), (7, 13)):
        I.P(x, y, L[6])                                      # the lit top-left edge
    for (x, y) in ((12, 16), (13, 16), (14, 16), (15, 16), (16, 15), (17, 15), (18, 15), (19, 15), (20, 15)):
        I.P(x, y, L[6] if x < 17 else L[5])                  # the ridge where the top turns to the front
    for (x, y) in ((22, 14), (23, 13), (24, 12), (25, 11)):
        I.P(x, y, L[4])                                      # the softer ridge to the right face
    for i, (x, y) in enumerate(((16, 8), (16, 9), (17, 10), (17, 11), (16, 12), (17, 13), (18, 14), (18, 15), (19, 16), (19, 17), (18, 18), (19, 19))):
        I.P(x, y, L[0]); I.P(x + 1, y, L[1])                 # a crack two px wide, its lower lip lit
        if i % 3 == 0: I.P(x - 1, y, L[6] if y < 15 else L[4])
    for (x, y) in ((9, 21), (10, 22), (14, 22), (15, 23), (24, 18)):
        I.P(x, y, L[2] if x < 20 else L[1])                  # a few chips on the faces, as shapes
    return I.done()


def mail():
    I = Icon(); M = hexr(['#24262e', '#383b45', '#50545e', '#6a6e78', '#888c96', '#a8acb4', '#cacdd2', '#eceef0'])
    LE = RAMPS['le']
    body = [(10, 5), (13, 4), (19, 4), (22, 5), (27, 9), (28.5, 16), (24, 16.5), (23, 13), (23.4, 27), (8.6, 27), (9, 13), (8, 16.5), (3.5, 16), (5, 9)]
    def inpoly(x, y, pts):
        c = False; n = len(pts)
        for i in range(n):
            (ax, ay), (bx, by) = pts[i], pts[(i + 1) % n]
            if (ay <= y < by) or (by <= y < ay):
                if x < ax + (y - ay) * (bx - ax) / (by - ay): c = not c
        return c
    for y in range(32):
        for x in range(32):
            X, Y = x + .5, y + .5
            hem = (x // 2) % 2 == 0 and y in (27, 16, 17) and inpoly(X, Y - 1, body) and not inpoly(X, Y, body)   # scalloped ring edges
            if not inpoly(X, Y, body) and not hem: continue
            l = .62 - .028 * (x - 8) - .012 * (y - 6)        # lit from the top-left
            if 9 <= x <= 10 and y > 12: l -= .12             # shade under the left arm
            if 21 <= x <= 23 and y > 12: l -= .16            # the right side turning away
            if x in (17, 18) and y > 20: l -= .1             # a fold
            r = y // 2; cxl = (x + (r % 2)) % 2; cyl = y % 2  # staggered rings, 2x2 cells
            k = l + (.2 if (cxl, cyl) == (0, 0) else -.26 if (cxl, cyl) == (1, 1) else 0)
            I.P(x, y, M[max(0, min(7, int(k * 7 + .5)))])
    for y in range(4, 8):                                    # the neck hole, its front edge bound in leather
        for x in range(10, 23):
            d = ((x + .5 - 16) / 3.6) ** 2 + ((y + .5 - 4.6) / 1.7) ** 2
            if d < 1: I.P(x, y, (0x1c, 0x16, 0x18) if y < 5 else (0x2e, 0x24, 0x22))
            elif d < 1.9 and y >= 5: I.P(x, y, LE[5] if x < 15 else LE[4] if x < 18 else LE[3])
    for x in range(9, 24):                                   # the belt and its buckle
        I.P(x, 20, LE[4] if x < 14 else LE[3] if x < 20 else LE[2]); I.P(x, 21, LE[2] if x < 14 else LE[1])
    for (x, y, c) in ((14, 20, (0xc8, 0xae, 0x5a)), (15, 20, (0xdc, 0xc6, 0x80)), (14, 21, (0x86, 0x64, 0x1e)), (15, 21, (0xac, 0x86, 0x28)), (16, 21, (0x86, 0x64, 0x1e)), (16, 20, (0xac, 0x86, 0x28))):
        I.P(x, y, c)
    return I.done()


R15 = {'pie': pie, 'bait': bait, 'stone': stone, 'mail': mail}

if __name__ == '__main__':
    for n in (sys.argv[1:] or R15):
        R15[n]().save(f'out/r15_{n}.png')
    print('ok', len(sys.argv[1:] or R15))
