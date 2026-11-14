"""World pickups that failed the #198 baseline, redrawn by hand (sizes and anchors kept):
  twig    - "a stick with lit matches": a forked fallen branch in one bark ramp, lit along its top edge, one dead leaf, no orange tips
  rock_0  - "a grey egg/potato": a loose stone of flat facets lit top-left, a chipped corner and one crack
  weeds_0 - "a straw broom": three clumps of dry grass, blades of different lengths and leans, fewer of them
  weeds_1 - "an even fan": two leaning clumps and a seed head, the gaps between them showing
    python3 res198.py -> out/res198_<name>.png
"""
import math, random
from PIL import Image, ImageDraw


def hexr(a):
    return [tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) for h in a]


BARK = hexr(['#1e140e', '#34241a', '#4c3626', '#664a34', '#806048'])
STONE = hexr(['#24222a', '#38353e', '#504c56', '#6a6570', '#86808a', '#a49ea6'])
GRASS = hexr(['#3a3018', '#56461e', '#746026', '#927a32', '#ae9644', '#c4ae5e'])
GREEN = hexr(['#2a3418', '#3c4a20', '#52602a'])
LEAF = hexr(['#5a2a12', '#8a4a1c', '#b06a28'])


class S:
    def __init__(self, w, h):
        self.w, self.h = w, h; self.im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); self.p = self.im.load(); self.d = ImageDraw.Draw(self.im)

    def P(self, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < self.w and 0 <= y < self.h:
            self.p[x, y] = c + (255,)

    def poly(self, pts, c):
        self.d.polygon(pts, fill=c + (255,))

    def shadow(self, cx, cy, rx, ry, a=100):
        sh = Image.new('RGBA', (self.w, self.h), (0, 0, 0, 0)); ImageDraw.Draw(sh).ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(8, 6, 10, a)); self.im.alpha_composite(sh)

    def done(self):
        src = self.im.copy(); s = src.load()
        for y in range(self.h):
            for x in range(self.w):
                if s[x, y][3] > 200:
                    continue
                for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                    X, Y = x + dx, y + dy
                    if 0 <= X < self.w and 0 <= Y < self.h and s[X, Y][3] > 200:
                        r, g, b, _ = s[X, Y]; self.p[x, y] = (max(10, int(r * .32)), max(8, int(g * .28)), max(14, int(b * .34)), 255); break
        return self.im


def branch(s, pts, w0, w1):
    """a tapering branch along a polyline: lit along its upper edge, dark below"""
    L = sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:])); acc = 0
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(1, int(math.hypot(x1 - x0, y1 - y0) * 2))
        for i in range(n + 1):
            t = i / n; x = x0 + (x1 - x0) * t; y = y0 + (y1 - y0) * t; f = (acc + math.hypot(x1 - x0, y1 - y0) * t) / L
            w = w0 + (w1 - w0) * f
            for j in range(int(-w), int(w) + 1):
                k = 4 if j <= -w + .5 else 3 if j < 0 else 2 if j < w - .5 else 1
                s.P(x, y + j, BARK[k])
        acc += math.hypot(x1 - x0, y1 - y0)


def twig():
    s = S(28, 16); s.shadow(14, 12, 12, 2.5, 90)
    branch(s, [(3, 11), (10, 9), (17, 8), (25, 5)], 1.6, .7)
    branch(s, [(13, 8.5), (17, 4), (19, 2)], 1.0, .5)                     # the fork
    branch(s, [(8, 9.6), (7, 13)], .8, .5)                                # a short stub snapped off
    for (x, y) in ((3, 10), (3, 11), (3, 12)):
        s.P(x, y, (128, 100, 70))                                         # the snapped end, pale wood, not a lit match
    for (x, y, k) in ((20, 10, 2), (21, 10, 1), (21, 11, 0), (22, 11, 1)):
        s.P(x, y, LEAF[k])                                                # one curled dead leaf beside it
    return s.done()


def rock():
    s = S(26, 21); s.shadow(13, 15, 11, 3)
    top = [(4, 10), (8, 5), (15, 4), (21, 6), (23, 10), (14, 12), (7, 12)]
    s.poly([(7, 12), (14, 12), (23, 10), (22, 15), (14, 17), (7, 16)], STONE[2])        # the front face
    s.poly([(4, 10), (7, 12), (7, 16), (4, 14)], STONE[3])                              # the west face
    s.poly(top, STONE[4])                                                               # the lit top
    s.poly([(15, 4), (21, 6), (18, 8)], STONE[5])                                       # one bright facet catching the light
    s.poly([(21, 6), (23, 10), (20, 9)], STONE[1])                                      # a chipped corner, dark
    for (x, y) in ((11, 13), (12, 14), (12, 15), (13, 16)):
        s.P(x, y, STONE[0]); s.P(x + 1, y, STONE[3])                                    # one crack down the face
    return s.done()


def weeds(variant):
    s = S(26, 22); s.shadow(13, 19, 10, 2.2, 80)
    R = random.Random(7 + variant)
    clumps = [(7, 19, 5, -.35), (13, 19, 7, .05), (19, 19, 5, .4)] if variant == 0 else [(9, 19, 7, -.25), (18, 19, 6, .3)]
    for (cx, by, n, lean) in clumps:
        for i in range(n):
            L = R.uniform(6, 15); a = lean + R.uniform(-.4, .4); bend = R.uniform(-.25, .25)
            for t in range(int(L)):
                f = t / L; x = cx + math.sin(a) * t + bend * t * f * 2 + (i - n / 2) * .7; y = by - math.cos(a) * t
                k = 5 if f > .75 else 4 if f > .45 else 3 if f > .2 else 2
                s.P(x, y, GRASS[k] if i % 3 else GRASS[max(1, k - 1)])
        for i in range(3):
            s.P(cx - 1 + i, by, GREEN[1]); s.P(cx - 1 + i, by - 1, GREEN[2])            # a little green life at the root
    if variant == 1:
        for j in range(5):
            s.P(20 - j * .2, 3 + j, GRASS[5]); s.P(21 - j * .2, 3 + j, GRASS[3])          # a seed head
        branch_like = [(18.5, 8), (18, 18)]
        for t in range(10):
            s.P(18.5 - t * .05, 8 + t, GRASS[2])
    return s.done()


if __name__ == '__main__':
    twig().save('out/res198_twig.png'); rock().save('out/res198_rock_0.png')
    weeds(0).save('out/res198_weeds_0.png'); weeds(1).save('out/res198_weeds_1.png')
    print('ok')
