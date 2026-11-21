"""#198 round 10: the r9 judge's first fixes, drawn from what each item really is in the game.
  soup     - it is TURNIP soup, and the cooking game pours a golden broth: golden-amber broth, pale turnip chunks, the rim ring and glint kept
  mushroom - it is the GLOWCAP (glowing, teal, "Your teeth feel loose"): mint-pale glow spots as the brightest pixels, a dark gill
             band under the cap, an off-white stem shaded warm on the left and cool on the right
  bait     - "the arching worm reads as a pail handle": the tin's open mouth dark with soil, worms coiled inside, one draped over the rim
  wood     - "pale as baguettes": the bark two steps darker and grey-brown, the ringed ends the lightest part
  stone    - "chip two corners and add one crack"
    python3 icons198g.py -> out/r10_<name>.png
"""
import math, sys
from PIL import Image
sys.path.insert(0, '.')
from icons198 import Icon, RAMPS, hexr, sh
import icons198c as C

OBJ = C.OBJ
OUTL = (30, 20, 24, 255)
J9 = '/tmp/claude-0/-home-user-Minecraftbot/f193b802-e794-5104-89ce-994e8f157fdf/scratchpad/judged_r9/'


def soup():
    I = C.load(J9 + 'r9_soup.png')
    GOLD = {(0xa8, 0x52, 0x2c): (0xb8, 0x8a, 0x30), (0xc8, 0x6a, 0x36): (0xd4, 0xa8, 0x44), (0xb8, 0x5e, 0x30): (0xc6, 0x98, 0x3a),
            (0x6a, 0x2c, 0x1a): (0x7a, 0x56, 0x1c), (0x8a, 0x40, 0x22): (0x96, 0x6a, 0x24), (0x5a, 0x24, 0x14): (0x6a, 0x48, 0x16),
            (0xe8, 0x84, 0x2a): (0xec, 0xe4, 0xd0), (0xb8, 0x5a, 0x1a): (0xb8, 0xa8, 0xc0), (0xc8, 0x6a, 0x22): (0xd8, 0xcc, 0xc8),
            (0xf6, 0xd8, 0xb0): (0xfa, 0xec, 0xbc)}
    C.recolor(I, GOLD, range(12, 24))                                        # golden broth; the carrot becomes a turnip, white with a violet edge
    for (x, y, c) in ((20, 18, (0xf0, 0xe8, 0xd8)), (21, 18, (0xe0, 0xd4, 0xd8)), (20, 19, (0xa8, 0x8c, 0xb4)), (21, 19, (0x9a, 0x7c, 0xa8))):
        I.p[x, y] = c + (255,)                                               # a second turnip chunk
    return I.im


def mushroom():
    I = C.load(OBJ + 'icon32_mushroom.png')
    for y in range(19, 23):                                                  # the cap cut flat underneath, a dark gill band
        for x in range(32):
            if not (13 <= x <= 17): I.p[x, y] = (0, 0, 0, 0)
    for x in range(4, 28):
        if I.p[x, 17][3] and I.p[x, 17][:3] != OUTL[:3]:
            I.p[x, 18] = (0x24, 0x34, 0x36, 255) if x % 2 else (0x3a, 0x52, 0x50, 255)
    for x in range(4, 28):
        if I.p[x, 18][3] and not (13 <= x <= 17): I.p[x, 19] = OUTL
    for (cx, cy, r) in ((10, 9, 1.4), (17, 7, 1.8), (22, 11, 1.3), (14, 13, 1.1), (20, 15, 1.0)):   # glow spots: the brightest pixels
        for y in range(int(cy - r) - 1, int(cy + r) + 2):
            for x in range(int(cx - r) - 1, int(cx + r) + 2):
                d = math.hypot(x + .5 - cx, y + .5 - cy)
                if d < r and I.p[x, y][3] and I.p[x, y][:3] != OUTL[:3]:
                    I.p[x, y] = (0xc8, 0xff, 0xf0, 255) if d < r * .55 else (0x8a, 0xf0, 0xd4, 255)
    stem = [(x, y) for y in range(19, 30) for x in range(32) if I.p[x, y][3] and I.p[x, y][0] > 150 and abs(I.p[x, y][0] - I.p[x, y][2]) < 30]
    if stem:
        xs = sorted(set(x for x, y in stem))
        for (x, y) in stem:                                                  # off-white, warm on the lit side, cool in shadow
            k = (x - xs[0]) / max(1, xs[-1] - xs[0])
            I.p[x, y] = (int(232 - 70 * k), int(224 - 56 * k), int(204 - 30 * k), 255)
    return I.im


def bait():
    I = C.load(OBJ + 'icon32_bait.png')
    for y in range(0, 11):
        for x in range(32): I.p[x, y] = (0, 0, 0, 0)
    for y in range(15, 26):                                                  # the label plain
        for x in range(32):
            c = I.p[x, y]
            if c[3] and c[0] > 230 and c[1] > 230: I.p[x, y] = (0x95, 0x36, 0x31, 255)
    for y in range(9, 16):                                                   # the open mouth: a lit rim round dark soil
        for x in range(4, 29):
            d = ((x + .5 - 16) / 10.2) ** 2 + ((y + .5 - 12.6) / 2.9) ** 2
            if d < 1:
                I.p[x, y] = (0x2e, 0x1e, 0x16, 255) if d < .62 else (0xc4, 0xc8, 0xd0, 255) if y < 13 else (0x8a, 0x8e, 0x96, 255)
            elif d < 1.22 and (not I.p[x, y][3] or y < 12): I.p[x, y] = OUTL
    PK = [(0xe8, 0xa4, 0x9a), (0xc8, 0x7a, 0x74), (0xa0, 0x56, 0x58), (0x6e, 0x34, 0x3a)]
    def worm(pts):
        for i in range(len(pts) - 1):
            (x0, y0), (x1, y1) = pts[i], pts[i + 1]; n = 6
            for j in range(n):
                t = j / n; x = x0 + (x1 - x0) * t; y = y0 + (y1 - y0) * t; ring = (i * n + j) // 3 % 2
                I.P(x, y, PK[1] if ring else PK[0]); I.P(x, y + 1, PK[3] if ring else PK[2])
    worm([(9, 13), (11, 11.6), (13, 12.4), (12, 13.6)])                     # coiled in the soil
    worm([(15, 12), (17, 11.2), (19, 12.2), (18, 13.4), (16, 13)])
    worm([(20, 12.4), (23, 11.4), (26, 12), (27.4, 14.4), (27.6, 18), (27, 21)])   # one draped over the rim and down the side
    return Icon.done(I)


def wood():
    I = C.load(OBJ + 'icon32_wood.png')
    m = {(0xd5, 0xb3, 0x7d): (0x8a, 0x76, 0x5c), (0xc7, 0xa0, 0x69): (0x7a, 0x66, 0x52), (0xb9, 0x8d, 0x55): (0x6c, 0x58, 0x46),
         (0xa9, 0x7d, 0x4a): (0x60, 0x4e, 0x3e), (0x88, 0x5e, 0x37): (0x52, 0x40, 0x32), (0x9a, 0x6d, 0x3f): (0x58, 0x46, 0x36),
         (0x66, 0x42, 0x28): (0x44, 0x34, 0x28), (0x77, 0x50, 0x2f): (0x4a, 0x3a, 0x2c), (0x55, 0x34, 0x22): (0x38, 0x2a, 0x20),
         (0x46, 0x29, 0x1c): (0x2e, 0x22, 0x1a), (0x37, 0x1e, 0x17): (0x24, 0x1a, 0x16)}
    C.recolor(I, m)                                                          # grey-brown bark; the cut ends (cream rings) untouched, now the lightest
    return I.im


def stone():
    I = C.load(OBJ + 'icon32_stone.png')
    for (x, y) in ((6, 10), (7, 9), (5, 11), (6, 11), (7, 10)):              # a chip off the top-left corner
        I.p[x, y] = (0, 0, 0, 0)
    for (x, y) in ((7, 11), (8, 10), (8, 9), (6, 12), (5, 12)):
        I.p[x, y] = OUTL
    for (x, y) in ((8, 11), (9, 10), (7, 12)):
        I.p[x, y] = (0x56, 0x53, 0x5b, 255)                                   # the chip's bare face
    for (x, y) in ((26, 13), (27, 14), (26, 14)):                            # and one off the right shoulder
        I.p[x, y] = (0, 0, 0, 0)
    for (x, y) in ((25, 13), (26, 15), (27, 15), (25, 12)):
        I.p[x, y] = OUTL
    for (x, y) in ((15, 16), (16, 17), (16, 18), (17, 19), (16, 20), (17, 21), (17, 22)):   # one crack down the front, lit on its left lip
        I.p[x, y] = (0x22, 0x20, 0x28, 255); I.p[x - 1, y] = (0x80, 0x7c, 0x84, 255)
    return I.im


R10 = {'soup': soup, 'mushroom': mushroom, 'bait': bait, 'wood': wood, 'stone': stone}

if __name__ == '__main__':
    for n in (sys.argv[1:] or R10):
        R10[n]().save(f'out/r10_{n}.png')
    print('ok', len(sys.argv[1:] or R10))
