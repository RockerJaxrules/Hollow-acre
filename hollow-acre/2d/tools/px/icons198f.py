"""#198 round 9: the r7/r8 judges' first fixes.
  soup     - "reads as porridge": a red-brown broth with a darker ring at the rim, a glint, three chunks (carrot, potato, herb)
  chicory  - "spindly": stems 2 px near the root with a lit edge, the three heads drawn in closer
  bait     - "upright pink stubs read as fingers": worms 2 px thick, draped and coiled over the rim, segment rings; a plain label
  mushroom - "the stem is a flat bar": lit on its left, a flared foot, a contact shadow
  lamp     - "the pale blue glass reads as ice; warm it all over and it is a candle": cool glass, a warm glow only round the flame,
             the flame core the brightest pixels
  logs     - "one pale pole drawn twice": bark two steps darker with plates and a knot, the back log shorter
    python3 icons198f.py -> out/r9_<name>.png
"""
import math, sys
from PIL import Image
sys.path.insert(0, '.')
from icons198 import Icon, RAMPS, hexr, sh
import icons198c as C
import icons198e as E

OBJ = C.OBJ
OUTL = (30, 20, 24, 255)


def soup():
    I = C.load('out/r7_soup.png') if False else C.load('/tmp/claude-0/-home-user-Minecraftbot/f193b802-e794-5104-89ce-994e8f157fdf/scratchpad/judged_r7/r7_soup.png')
    BR = {(0xc8, 0xba, 0x9a): (0xa8, 0x52, 0x2c), (0xdc, 0xd3, 0xba): (0xc8, 0x6a, 0x36), (0xd2, 0xc6, 0xaa): (0xb8, 0x5e, 0x30),
          (0x7b, 0x48, 0x7a): (0xa8, 0x52, 0x2c), (0x6d, 0x90, 0x47): (0xa8, 0x52, 0x2c), (0x67, 0x57, 0x47): (0x6a, 0x2c, 0x1a),
          (0xb9, 0xaa, 0x8c): (0x8a, 0x40, 0x22)}
    C.recolor(I, BR, range(13, 23))                                          # the porridge becomes a red-brown broth, the flecks gone
    for y in range(13, 23):                                                  # a darker ring where the broth meets the bowl
        for x in range(1, 31):
            c = I.p[x, y]
            if c[3] and c[:3] != OUTL[:3] and (I.p[x - 1, y][:3] == OUTL[:3] or I.p[x, y - 1][:3] == OUTL[:3]) and y < 21:
                I.p[x, y] = (0x5a, 0x24, 0x14, 255)
    for (x, y, col) in ((11, 17, (0xe8, 0x84, 0x2a)), (12, 17, (0xe8, 0x84, 0x2a)), (11, 18, (0xb8, 0x5a, 0x1a)), (12, 18, (0xc8, 0x6a, 0x22)),   # carrot
                        (18, 16, (0xf0, 0xe4, 0xb8)), (19, 16, (0xe0, 0xd0, 0x9c)), (18, 17, (0xd0, 0xbc, 0x84)), (19, 17, (0xb8, 0xa4, 0x70)),   # potato
                        (23, 18, (0x6a, 0x8a, 0x34)), (24, 18, (0x4a, 0x66, 0x24))):                                                          # herb
        I.p[x, y] = col + (255,)
    for (x, y) in ((8, 16), (9, 15)):
        I.p[x, y] = (0xf6, 0xd8, 0xb0, 255)                                  # a glint on the broth
    return I.im


def chicory():
    src = E.chicory().copy(); I = C.Icon(); I.im = src; I.p = src.load()
    for y in range(20, 30):                                                  # thicken the stems toward the root, lit on the left
        for x in range(1, 31):
            c = src.getpixel((x, y))
            if c[3] and c[1] > c[0] and c[1] > c[2] and c[:3] != OUTL[:3]:
                if not I.p[x - 1, y][3] or I.p[x - 1, y][:3] == OUTL[:3]:
                    I.p[x - 1, y] = RAMPS['ol'][5] + (255,)
    return Icon.done(I)


def bait():
    I = C.load(OBJ + 'icon32_bait.png')
    for y in range(0, 11):
        for x in range(32):
            I.p[x, y] = (0, 0, 0, 0)                                         # the upright stubs gone
    for y in range(11, 13):
        for x in range(32):
            c = I.p[x, y]
            if c[3] and c[0] > 150 and c[0] > c[2] + 20:
                I.p[x, y] = (0x8b, 0x5a, 0x40, 255)                          # the dirt where they came out of
    for y in range(15, 26):                                                  # the label plain: its dots painted out
        for x in range(32):
            c = I.p[x, y]
            if c[3] and c[0] > 230 and c[1] > 230:
                I.p[x, y] = (0x95, 0x36, 0x31, 255)
    PK = [(0xe1, 0xac, 0x9f), (0xc5, 0x81, 0x7a), (0xa6, 0x5c, 0x5e), (0x7f, 0x3d, 0x44)]
    worms = [lambda t: (10 - 6 * t, 12 - 5 * math.sin(t * math.pi * .8) + 9 * t * t),                 # up over the left rim and down the side
             lambda t: (15 + 5 * math.sin(t * 5.2), 12 - 6 * t + 2.5 * math.cos(t * 5.2)),             # a coil standing up from the dirt
             lambda t: (21 + 7 * t, 12 - 4 * math.sin(t * math.pi * .9) + 7 * t * t)]                 # over the right rim
    for wf in worms:
        n = 40
        for i in range(n + 1):
            t = i / n; x, y = wf(t); ring = (i // 4) % 2 == 1
            I.P(x, y, PK[1] if ring else PK[0]); I.P(x, y + 1, PK[3] if ring else PK[2])
    return Icon.done(I)


def mushroom():
    I = C.load(OBJ + 'icon32_mushroom.png')
    stem = [(x, y) for y in range(19, 29) for x in range(32) if I.p[x, y][3] and I.p[x, y][0] > 150 and abs(I.p[x, y][0] - I.p[x, y][2]) < 30]
    xs = sorted(set(x for x, y in stem))
    for (x, y) in stem:                                                      # lit on the left, shaded on the right
        k = (x - xs[0]) / max(1, xs[-1] - xs[0])
        v = int(236 - 90 * k); I.p[x, y] = (v, v - 4, v - 8, 255)
    yb = max(y for x, y in stem)
    for x in (xs[0] - 1, xs[-1] + 1):                                        # a flared foot
        I.p[x, yb] = (200, 196, 190, 255); I.p[x, yb - 1] = OUTL
    for x in range(xs[0] - 3, xs[-1] + 4):                                   # a contact shadow
        if not I.p[x, yb + 1][3] or I.p[x, yb + 1][:3] == OUTL[:3]:
            I.p[x, yb + 1] = (20, 14, 16, 200)
    return I.im


def lamp():
    I = C.load(OBJ + 'icon32_lamp.png')
    flame = [(x, y) for y in range(32) for x in range(32) if I.p[x, y][3] and I.p[x, y][0] > 230 and I.p[x, y][2] < 140]
    for (x, y) in flame:                                                     # a warm glow only round the flame
        for dx in (-2, -1, 1, 2):
            X = x + dx; c = I.p[X, y]
            if c[3] and c[2] > c[0] + 10:
                f = .55 if abs(dx) == 1 else .3
                I.p[X, y] = (int(c[0] + (255 - c[0]) * f), int(c[1] + (220 - c[1]) * f), int(c[2] - c[2] * f * .5), 255)
    for (x, y) in flame:
        if (x, y - 1) in flame and (x, y + 1) in flame:
            I.p[x, y] = (255, 252, 232, 255)                                 # the core the brightest pixels
    return I.im


def logs():
    I = Icon(); BK = hexr(['#1e120c', '#2e1c12', '#46301e', '#5c402a', '#745438']); EN = hexr(['#8a6a46', '#a68660', '#5a3e28', '#3a2618'])
    for (x0, y0, x1, y1, w) in ((7, 16, 24, 8, 3.4), (5, 25, 27, 15, 3.6)):     # the back log shorter than the front one
        dx, dy = x1 - x0, y1 - y0; L = math.hypot(dx, dy); ux, uy = dx / L, dy / L; qx, qy = -uy, ux
        for y in range(32):
            for x in range(32):
                ax, ay = x + .5 - x0, y + .5 - y0; t = ax * ux + ay * uy; s = ax * qx + ay * qy
                if 0 <= t <= L and abs(s) <= w:
                    n = s / w; l = .25 + .7 * sh(qx * n, qy * n, math.sqrt(max(0, 1 - n * n)))
                    k = min(4, int(l * 4 + .5))
                    if int(t) % 5 == 0 and abs(n) < .7: k = max(0, k - 2)       # the bark in plates, split by dark fissures
                    I.P(x, y, BK[k])
        ex, ey = x1, y1                                                       # the sawn end: dull tan, one dark heart off centre
        for y in range(int(ey - w) - 1, int(ey + w) + 2):
            for x in range(int(ex - w) - 1, int(ex + w) + 2):
                d = math.hypot((x + .5 - ex) / (w * .62), (y + .5 - ey) / w)
                if d < 1:
                    I.P(x, y, EN[0] if d < .8 else EN[2])
        I.P(ex + 1, ey - 1, EN[3]); I.P(ex - 1, ey + 1, EN[1])
    I.P(14, 21, BK[0]); I.P(15, 21, BK[1]); I.P(14, 20, BK[3])              # a knot on the front log
    return I.done()


R9 = {'soup': soup, 'chicory': chicory, 'bait': bait, 'mushroom': mushroom, 'lamp': lamp, 'logs': logs}

if __name__ == '__main__':
    for n in (sys.argv[1:] or R9):
        R9[n]().save(f'out/r9_{n}.png')
    print('ok', len(sys.argv[1:] or R9))
