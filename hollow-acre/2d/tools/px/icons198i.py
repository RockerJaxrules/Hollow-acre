"""#198 round 14.
  pie  - 'Pumpkin pie' (v1 read as a Pac-Man: a flat disc with a wedge gone): seen from above at the game's 3/4 angle, so the
         crust wall shows below the top; smooth orange filling with a darker ring of crust crimps round it; one slice cut and
         pulled out so its cut face shows, two-tone (filling over crust); a dollop of cream
  bait - (r10: "the coils merge into one pink heap at 1x"): fewer, fatter worms with dark soil showing between them, segment rings,
         one hanging well down over the label
    python3 icons198i.py -> out/r14_<name>.png
"""
import math, sys
from PIL import Image
sys.path.insert(0, '.')
from icons198 import Icon, RAMPS, hexr, sh
import icons198c as C
import icons198g as G

OUTL = (30, 20, 24, 255)


def pie():
    I = Icon(); OR = hexr(['#7a3010', '#a0441a', '#c45e22', '#dc7c34', '#ec9a4c']); CR = hexr(['#6a4420', '#8e6230', '#b48444', '#d4a45e', '#e8c07a'])
    cx, cy, rx, ry, wall = 15.5, 15.5, 12.5, 7.5, 4                          # the top ellipse and the height of the crust wall
    gone = lambda x, y: (x + .5 - cx) > 1 and (y + .5 - cy) > -1 and (x + .5 - cx) * .55 > (y + .5 - cy) * -.2 and (y + .5 - cy) < (x + .5 - cx) * .9
    for y in range(32):                                                      # the crust wall: the side of the pie, below the top
        for x in range(32):
            for h in range(wall + 1):
                d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy - h) / ry) ** 2
                if d < 1 and (y + .5 - cy - h) > 0 and not gone(x, y - h):
                    I.P(x, y, CR[1] if (x + y) % 3 else CR[0]); break
    for y in range(32):
        for x in range(32):
            d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2
            if d >= 1 or gone(x, y): continue
            if d > .7:                                                       # the crimped rim, lit on the far (top-left) side
                a = math.atan2(y + .5 - cy, x + .5 - cx); crimp = int((a + 4) * 7) % 2
                I.P(x, y, CR[4 if crimp else 3] if y < cy else CR[2 if crimp else 1])
            else:
                I.P(x, y, OR[4] if (x - cx) + (y - cy) < -6 else OR[3] if (x - cx) + (y - cy) < 2 else OR[2])   # smooth filling, lit top-left
    for y in range(32):                                                      # the cut faces where the slice was taken out
        for x in range(32):
            if gone(x, y) and not I.p[x, y][3]:
                for h in range(1, wall + 1):
                    if I.p[x, y - h][3] and I.p[x, y - h][:3] in (OR[2], OR[3], OR[4]):
                        I.P(x, y, OR[1] if h < wall - 1 else CR[1]); break
    for (x, y) in ((9, 11), (10, 11), (11, 11), (9, 10), (10, 10), (10, 9)):
        I.P(x, y, (248, 242, 228) if y < 11 else (222, 212, 198))           # a dollop of cream
    return I.done()


def bait():
    I = C.load(G.OBJ + 'icon32_bait.png')
    for y in range(0, 11):
        for x in range(32): I.p[x, y] = (0, 0, 0, 0)
    for y in range(15, 26):
        for x in range(32):
            c = I.p[x, y]
            if c[3] and c[0] > 230 and c[1] > 230: I.p[x, y] = (0x95, 0x36, 0x31, 255)
    for y in range(9, 16):                                                   # the open mouth, dark soil
        for x in range(4, 29):
            d = ((x + .5 - 16) / 10.2) ** 2 + ((y + .5 - 12.6) / 2.9) ** 2
            if d < 1:
                I.p[x, y] = (0x22, 0x16, 0x10, 255) if d < .62 else (0xc4, 0xc8, 0xd0, 255) if y < 13 else (0x8a, 0x8e, 0x96, 255)
            elif d < 1.22 and (not I.p[x, y][3] or y < 12): I.p[x, y] = OUTL
    PK = [(0xf0, 0xae, 0xa2), (0xcc, 0x7c, 0x76), (0x9c, 0x50, 0x54), (0x62, 0x2c, 0x34)]
    def worm(pts, thick=2):
        for i in range(len(pts) - 1):
            (x0, y0), (x1, y1) = pts[i], pts[i + 1]; n = 8
            for j in range(n):
                t = j / n; x = x0 + (x1 - x0) * t; y = y0 + (y1 - y0) * t; ring = (i * n + j) // 4 % 2
                I.P(x, y, PK[1] if ring else PK[0]); I.P(x, y + 1, PK[3] if ring else PK[2])
    worm([(9, 12.6), (11, 10.6), (13.5, 11.2), (14, 13)])                    # two fat loops with soil showing between them
    worm([(17.5, 13), (19, 10.6), (21.5, 11)])
    worm([(21.5, 11), (24.5, 10.8), (27, 12.4), (28, 16), (27.6, 20.5), (26.6, 23.5)])   # one hanging well down over the label
    return Icon.done(I)


R14 = {'pie': pie, 'bait': bait}

if __name__ == '__main__':
    for n in (sys.argv[1:] or R14):
        R14[n]().save(f'out/r14_{n}.png')
    print('ok', len(sys.argv[1:] or R14))
