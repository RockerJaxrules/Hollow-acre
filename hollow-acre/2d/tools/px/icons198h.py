"""#198 round 11: the interim icons (installed as better than a wrong object, never at 6), drawn again from the items' own words.
  resin     - 'Pine resin: amber tears off the ridge pines': two glossy amber tears on a chip of pine bark, light through them
  pie       - 'Pumpkin pie': smooth orange filling, a crimped crust rim, one slice cut out showing the filling's edge, cream on top
  bonemeal  - 'Bone meal' (fertiliser): a tied burlap sack slumped open, white meal spilling, a knuckle of bone in it
  ghostcorn - 'a cob with white kernels and no colour in it at all': staggered 2x2 kernels in bone-white, grey-green husk, silk at the tip
    python3 icons198h.py -> out/r11_<name>.png
"""
import math, sys
from PIL import Image
sys.path.insert(0, '.')
from icons198 import Icon, RAMPS, hexr, sh

AMB = hexr(['#4a1e06', '#7a3608', '#a8560c', '#d07a14', '#eaa02a', '#f8c862', '#fff0b8'])


def resin():
    # (r11 v1 read as campfire flames: pointed tops) rounded beads of amber run down a strip of pine bark, glossy, deep orange,
    # darkest at the bottom right, a needle caught in the biggest
    I = Icon(); BK = hexr(['#24160e', '#3a2618', '#523624', '#6c4a32', '#86603e'])
    for y in range(3, 30):                                                    # an upright strip of bark, plated
        for x in range(5, 14):
            if abs(x - 9 + math.sin(y * .4)) < 4:
                I.P(x, y, BK[1] if (y % 5 == 0 or x in (6, 12)) else BK[3] if x < 9 else BK[2])
    for (cx, cy, r) in ((14, 10, 4.2), (16, 19, 5.8), (12, 26, 3.4)):         # three beads, rounder as they run down
        for y in range(int(cy - r) - 1, int(cy + r) + 2):
            for x in range(int(cx - r) - 1, int(cx + r) + 2):
                nx, ny = (x + .5 - cx) / r, (y + .5 - cy) / (r * .92); d = nx * nx + ny * ny
                if d < 1:
                    l = .18 + .5 * sh(nx, ny, math.sqrt(1 - d)) + max(0, nx + ny) * .18   # light passes through to the lower right
                    I.P(x, y, AMB[min(5, max(1, int(l * 5.5)))])
        I.P(cx - r * .45, cy - r * .45, (255, 246, 214)); I.P(cx - r * .45 + 1, cy - r * .45, AMB[6])   # the gloss
    for t in range(5):
        I.P(14 + t * .8, 18 + t * .5, AMB[0])                                 # a pine needle caught inside
    return I.done()


def pie():
    I = Icon(); OR = hexr(['#7a3010', '#a8481a', '#cc6424', '#e2843a', '#f0a456']); CR = hexr(['#7a5028', '#a0703a', '#c8944e', '#e2b46a'])
    cx, cy, rx, ry = 16, 18, 13, 8.5
    for y in range(32):
        for x in range(32):
            d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2
            a = math.atan2(y + .5 - cy, x + .5 - cx)
            cut = -0.15 < a < 0.75                                          # a slice gone, to the right
            if d < 1 and not (cut and d < .86):
                if d > .72: I.P(x, y, CR[3 if (x + y) % 3 else 2] if y < cy else CR[1])   # the crimped crust rim
                else: I.P(x, y, OR[4 if (x + y) < 26 else 3 if y < cy + 2 else 2])        # smooth orange filling, lit top-left
            elif cut and d < .86 and d > .0:
                if y > cy - 1 and abs(a - .75) < .22 or abs(a + .15) < .14 and x > cx:
                    I.P(x, y, OR[1] if y > cy + 1 else OR[2])               # the cut edge of the filling
    for y in range(int(cy + ry) - 1, int(cy + ry) + 2):
        for x in range(4, 29):
            if I.p[x, y][3]: I.P(x, y, CR[0])                                 # the crust's underside
    for (x, y) in ((11, 14), (12, 14), (13, 14), (11, 13), (12, 13), (12, 12)):
        I.P(x, y, (246, 240, 226) if y < 14 else (220, 210, 196))           # a dollop of cream
    return I.done()


def bonemeal():
    I = Icon(); BU = hexr(['#3a2c1a', '#5a4428', '#7a6038', '#9a7e4e', '#b89c68', '#d0b886'])
    for y in range(32):                                                       # a slumped burlap sack, lit top-left
        for x in range(32):
            nx, ny = (x + .5 - 15) / 10.5, (y + .5 - 21) / 8.5; d = nx * nx + ny * ny * (1.25 if ny < 0 else 1)
            if d < 1:
                l = .2 + .8 * sh(nx, ny, math.sqrt(max(0, 1 - d)))
                k = min(5, int(l * 5 + .5))
                if (x + y) % 4 == 0 and k > 1: k -= 1                         # the weave
                I.P(x, y, BU[k])
    for y in range(10, 14):                                                   # the gathered neck, open, white meal in the mouth
        for x in range(10, 21):
            I.P(x, y, BU[3] if y > 11 else (232, 228, 214))
    for x in range(10, 21): I.P(x, 14, BU[0] if x % 2 else BU[2])             # twine round the neck
    for (x, y) in ((21, 27), (22, 28), (23, 28), (24, 29), (25, 29), (20, 28), (23, 29), (22, 29)):
        I.P(x, y, (236, 232, 220) if (x + y) % 2 else (206, 200, 186))       # meal spilled at its foot
    for t in range(8):                                                        # a knuckle of bone sticking out of the mouth
        I.P(16 + t * .7, 11 - t * .9, (240, 236, 222)); I.P(17 + t * .7, 11 - t * .9, (200, 194, 180))
    for (x, y) in ((21, 4), (22, 4), (21, 3), (23, 5), (22, 5)):
        I.P(x, y, (246, 242, 230))
    return I.done()


def ghostcorn():
    # (r12: "single grey pixels scattered: 2x2 kernels in rows, lit top-left, a cool lilac lower-right; longer, blunter")
    I = Icon(); KL = [(250, 250, 244), (232, 232, 226), (210, 208, 212), (186, 182, 196)]; SEAM = (138, 132, 152)
    for (pts, l) in (([(3, 30), (6, 15), (13, 23)], .55), ([(3, 30), (19, 27), (12, 21)], .35), ([(5, 29), (9, 19), (14, 26)], .75)):
        I.poly(pts, 'bu', l)                                                  # straw husk leaves peeled back down both sides
    ox, oy = 9.0, 24.0
    for y in range(32):
        for x in range(32):
            u = ((x + .5 - ox) - (y + .5 - oy)) * .7071; v = ((x + .5 - ox) + (y + .5 - oy)) * .7071
            if u < 0 or u > 21: continue
            half = 5.4 * min(1, (u + 2) / 6) * (1 if u < 13 else max(.6, 1 - (u - 13) / 16))
            if u > 19.5: half *= math.sqrt(max(0, 1 - ((u - 19.5) / 1.5) ** 2))
            if abs(v) > half: continue
            cx = x % 3; cy = (y + (x // 3) % 2) % 3                           # kernels: 2x2 blocks on a staggered 3-px grid
            if cx == 2 or cy == 2:
                I.P(x, y, SEAM); continue
            side = (v + half) / (2 * half + .01)                              # 0 lit (upper left) .. 1 shade (lower right)
            k = 0 if (cx == 0 and cy == 0 and side < .55) else 1 if side < .45 else 2 if side < .75 else 3
            I.P(x, y, KL[k])
    return I.done()


R11 = {'resin': resin, 'pie': pie, 'bonemeal': bonemeal, 'ghostcorn': ghostcorn}

if __name__ == '__main__':
    for n in (sys.argv[1:] or R11):
        R11[n]().save(f'out/r11_{n}.png')
    print('ok', len(sys.argv[1:] or R11))
