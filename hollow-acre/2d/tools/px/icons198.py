"""Inventory icons that failed the #198 baseline (scored 3-4), redrawn by hand at 32x32 with the ramps of tools/ase/icons.lua:
one light from the top-left, volumes shaded through their ramps, a dark outline, no speckle, and a cool rim on dark things so they
hold on the brown slot. Tool and weapon icons are LOCKED (owner) and never drawn here.
    python3 icons198.py [names...] -> out/ic198_<name>.png
"""
import math, sys
from PIL import Image


def hexr(a):
    return [tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) for h in a]


RAMPS = {k: hexr(v) for k, v in {
    'wd': ['#2e1c14', '#4a2e1e', '#6a4428', '#8c5c34', '#ad7842', '#c99656', '#e2b876'],
    'yl': ['#4a3410', '#6e5016', '#98741e', '#c09a2a', '#dcbc3e', '#eed660', '#faf09a'],
    'pp': ['#5a4a3a', '#7c6a54', '#9c8a6e', '#bcaa88', '#d6c6a2', '#e8dcbe', '#f6f0dc'],
    'wh': ['#6a6670', '#8a8690', '#aaa6ac', '#c8c4c6', '#dedad8', '#eeebe6', '#fcfaf4'],
    'st': ['#2a2630', '#3c3842', '#524e58', '#6a6670', '#848088', '#a09ca2', '#c0bcbe'],
    'cu': ['#3a1a10', '#5c2a16', '#86401e', '#ae5a28', '#cc7a36', '#e09a50', '#f2c27a'],
    'br': ['#3e2c10', '#5e4416', '#86641e', '#ac8628', '#b89a40', '#c8ae5a', '#dcc680'],    # brass, dulled a step
    'cy': ['#0c2a2e', '#124044', '#1a5a5c', '#247a76', '#349c92', '#56c0ae', '#96e6d2'],
    'ck': ['#0c0a10', '#16141c', '#22202a', '#302e3a', '#42404e', '#5a5868', '#7a7a8c'],
    'le': ['#2a160e', '#40221a', '#5a3224', '#764430', '#92583c', '#ac704e', '#c88c66'],
    'og': ['#4a1e10', '#6e3014', '#98461a', '#c06222', '#dc8030', '#eea04a', '#f8c470'],
    'mt': ['#2a2c34', '#3e414c', '#585c68', '#767b86', '#979ca6', '#bcc0c6', '#e2e4e6'],
    'bu': ['#2e2416', '#46381f', '#5e4c2c', '#7a6440', '#967e56', '#b09a72', '#c8b48e'],    # burlap
    'ol': ['#1c2214', '#2a3420', '#3a462c', '#4c5a38', '#5e6e46', '#748458', '#8c9a6e'],    # olive canvas
    'am': ['#3a1c06', '#5e300a', '#8a4c10', '#b46c16', '#d68e24', '#eeb042', '#fad37a'],    # amber
    'bl': ['#141c38', '#1e2c52', '#2c406e', '#3c588e', '#5474ac', '#7a98c8', '#aac0e2'],
    'rd': ['#3a0e14', '#5c1820', '#82242a', '#a83832', '#c8523c', '#e0744e', '#f09c6c'],
}.items()}
RIM = (126, 146, 176)
LX, LY, LZ = -.55, -.66, .51


def sh(nx, ny, nz):
    return max(0.0, LX * nx + LY * ny + LZ * nz)


class Icon:
    def __init__(self):
        self.im = Image.new('RGBA', (32, 32), (0, 0, 0, 0)); self.p = self.im.load()

    def P(self, x, y, c):
        x, y = int(math.floor(x)), int(math.floor(y))
        if 0 <= x < 32 and 0 <= y < 32 and c is not None:
            self.p[x, y] = c + (255,)

    def band(self, r, l):
        R = RAMPS[r]; return R[max(0, min(len(R) - 1, int(l * (len(R) - 1) + .5)))]

    def blob(self, cx, cy, rx, ry, r, amb=.16, k=.86, mod=None):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                nx, ny = (x + .5 - cx) / rx, (y + .5 - cy) / ry; d = nx * nx + ny * ny
                if d > 1:
                    continue
                l = amb + k * sh(nx, ny, math.sqrt(1 - d))
                c = None
                if mod:
                    v = mod(x, y, l, nx, ny)
                    if v is None:
                        continue
                    if isinstance(v, tuple):
                        c = v
                    else:
                        l = v
                self.P(x, y, c or self.band(r, l))

    def poly(self, pts, r, l):
        n = len(pts); ys = [p[1] for p in pts]
        for y in range(int(min(ys)), int(max(ys)) + 1):
            xs = []
            for i in range(n):
                (x0, y0), (x1, y1) = pts[i], pts[(i + 1) % n]
                if (y0 <= y + .5 < y1) or (y1 <= y + .5 < y0):
                    xs.append(x0 + (y + .5 - y0) * (x1 - x0) / (y1 - y0))
            xs.sort()
            for a, b in zip(xs[::2], xs[1::2]):
                for x in range(int(round(a)), int(round(b))):
                    self.P(x, y, self.band(r, l(x, y) if callable(l) else l))

    def rod(self, x0, y0, x1, y1, w, r, amb=.2, k=.8):
        dx, dy = x1 - x0, y1 - y0; L = max(.01, math.hypot(dx, dy)); ux, uy = dx / L, dy / L; qx, qy = -uy, ux; hw = w / 2
        for y in range(int(min(y0, y1) - w) - 1, int(max(y0, y1) + w) + 2):
            for x in range(int(min(x0, x1) - w) - 1, int(max(x0, x1) + w) + 2):
                ax, ay = x + .5 - x0, y + .5 - y0; t = ax * ux + ay * uy; s = ax * qx + ay * qy
                if -.3 <= t <= L + .3 and abs(s) <= hw:
                    n = s / hw; self.P(x, y, self.band(r, amb + k * sh(qx * n, qy * n, math.sqrt(max(0, 1 - n * n)))))

    def done(self, rim=False):
        src = self.im.copy(); s = src.load()
        if rim:   # a cool lit rim on the top-left edge of dark things, so they hold on the dark slot
            for y in range(32):
                for x in range(32):
                    if s[x, y][3] and ((x > 0 and not s[x - 1, y][3]) or (y > 0 and not s[x, y - 1][3])) and (x + y) < 34 and y < 20:
                        if sum(s[x, y][:3]) < 200:
                            self.p[x, y] = RIM + (255,)
            src = self.im.copy(); s = src.load()
        for y in range(32):
            for x in range(32):
                if s[x, y][3]:
                    continue
                for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                    X, Y = x + dx, y + dy
                    if 0 <= X < 32 and 0 <= Y < 32 and s[X, Y][3]:
                        self.p[x, y] = (30, 20, 24, 255); break
        return self.im


def chaga(I):
    # (icons r2: "coal, burnt bread") chaga as it grows: a knobbly charcoal conk bursting out of a strip of birch bark, its crust cracked
    # into knobs (each lit top-left), and one broken face showing the rusty-orange flesh inside
    I.poly([(2, 24), (29, 20), (30, 28), (3, 31)], 'wh', lambda x, y: .8 if y < 26 else .55)
    for (x, y) in ((6, 27), (7, 27), (15, 25), (16, 25), (24, 24), (25, 24)):
        I.P(x, y, RAMPS['ck'][1])
    knobs = [(10, 16, 5.5), (16, 13, 6), (22, 16, 5), (13, 20, 5), (19, 20, 5.5), (8, 21, 4)]
    for (cx, cy, r) in knobs:
        I.blob(cx, cy, r, r * .85, 'ck', amb=.1, k=.9, mod=lambda x, y, l, nx, ny: max(.05, l * .62))
    for (x0, y0, x1, y1) in ((13, 10, 15, 17), (19, 12, 18, 18), (11, 18, 16, 19), (7, 18, 9, 23)):
        n = max(abs(x1 - x0), abs(y1 - y0))
        for i in range(n + 1):
            I.P(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, RAMPS['ck'][0])           # deep cracks between the knobs
    for (x, y, w) in ((24, 12, 1), (25, 13, 2), (25, 14, 2), (26, 15, 2), (26, 16, 3), (25, 17, 3), (25, 18, 2), (26, 19, 2), (26, 20, 1)):
        for i in range(w):
            I.P(x + i, y, RAMPS['og'][5 if i == 0 else 3])                                  # the broken edge: a jagged split of rusty-orange flesh
    return I.done(rim=True)


def ghostcorn(I):
    # a pale cob held diagonally: a staggered grid of round kernels (each lit top-left, shadowed below), three grey-green husk
    # leaves peeled back from its foot, the silk at its tip
    HUSK = hexr(['#2a3226', '#3e4a38', '#56644c', '#728062'])
    for (pts, k) in (([(4, 30), (6, 19), (12, 23)], 2), ([(4, 30), (17, 27), (12, 22)], 1), ([(4, 30), (9, 23), (15, 28)], 3)):
        poly = pts; ys = [p[1] for p in poly]
        for y in range(min(ys), max(ys) + 1):
            xs = []
            for i in range(3):
                (x0, y0), (x1, y1) = poly[i], poly[(i + 1) % 3]
                if (y0 <= y + .5 < y1) or (y1 <= y + .5 < y0):
                    xs.append(x0 + (y + .5 - y0) * (x1 - x0) / (y1 - y0))
            xs.sort()
            for a, b in zip(xs[::2], xs[1::2]):
                for x in range(int(round(a)), int(round(b))):
                    I.P(x, y, HUSK[k])
    # the cob: a fat spindle along a diagonal; in its own (u along, v across) frame each kernel is a 2x2 cell, rows offset by half a
    # kernel, every cell lit at its top-left corner with a dark seam below and right, the whole cob rounder-lit on its upper side
    a = math.radians(-45); ca, sa = math.cos(a), math.sin(a); L = 22; Wd = 4.6; ox, oy = 9, 25
    for y in range(32):
        for x in range(32):
            dx, dy = x + .5 - ox, y + .5 - oy
            u = dx * ca - dy * sa; v = dx * sa + dy * ca
            u = dx * math.cos(-a) + -dy * math.sin(-a) if False else (dx * ca + -dy * -sa) if False else (dx * 0.7071 - dy * 0.7071)
            v = dx * 0.7071 + dy * 0.7071
            if u < 0 or u > L:
                continue
            half = Wd * math.sin(math.pi * min(1, (u + 1.5) / (L + 2)) ** .8)
            if abs(v) > half:
                continue
            row = int((v + 10) // 2); cu = (u + (row % 2)) % 2; cv = (v + 10) % 2
            shade = .9 - (v + half) / (2 * half + .01) * .45
            k = shade if (cu < 1 and cv < 1) else shade - .18 if (cu < 1 or cv < 1) else shade - .42
            I.P(x, y, I.band('wh', k))
    for (x, y) in ((28, 4), (29, 3), (27, 3)):
        I.P(x, y, RAMPS['wh'][4])
    return I.done()


def resin(I):
    # a translucent amber drop: dark at its foot, glowing through its middle, a hard glint high on the left, a speck caught inside
    def m(x, y, l, nx, ny):
        if ny < -.25 and abs(nx) > .5 + (-.25 - ny) * 1.2:
            return None
        return .25 + (ny + 1) * .32 - nx * .12
    I.blob(16, 19, 9, 10, 'am', mod=m)
    I.poly([(12, 12), (16, 3), (20, 12)], 'am', .62)
    for (x, y) in ((12, 14), (12, 15), (13, 13), (12, 16)):
        I.P(x, y, (255, 246, 214))                                              # one hard glassy glint
    for (x, y) in ((19, 24), (20, 23), (20, 24), (19, 25)):
        I.P(x, y, RAMPS['am'][6])                                               # the light glowing through its lower right
    return I.done()


def seed(I):
    # a scatter of dull tan seeds, each a lit almond with a dark seam
    for (cx, cy, a) in ((10, 12, .5), (19, 10, -.4), (15, 18, .2), (8, 22, -.6), (22, 20, .7), (17, 26, -.2), (25, 14, .1)):
        for t in range(-3, 4):
            for s in (-1, 0, 1):
                w = 1.6 * (1 - (t / 3.5) ** 2)
                if abs(s) > w:
                    continue
                x = cx + t * math.cos(a) - s * math.sin(a); y = cy + t * math.sin(a) + s * math.cos(a)
                I.P(x, y, I.band('pp', .7 if s < 0 else .45 if s == 0 else .25))
        I.P(cx + math.cos(a), cy + math.sin(a), RAMPS['pp'][1])
    return I.done()


def ingot(I, r, spec):
    # a trapezoid ingot in three-quarter view: a lit top, a front face, a darker end, a hard specular streak along the top
    top = [(6, 14), (22, 10), (27, 13), (11, 17)]
    I.poly([(11, 17), (27, 13), (26, 21), (10, 25)], r, .42)
    I.poly([(6, 14), (11, 17), (10, 25), (5, 21)], r, .28)
    I.poly(top, r, .78)
    for t in range(12):
        I.P(9 + t * 1.2, 14 - t * .3, spec)
    I.P(12, 20, I.band(r, .3)); I.P(20, 18, I.band(r, .3))                    # the casting's two dimples on the front
    return I.done(rim=(r == 'mt'))


def cbar(I):
    return ingot(I, 'cu', RAMPS['cu'][6])


def ibar(I):
    return ingot(I, 'mt', RAMPS['mt'][6])


def hay(I):
    # a bundle of straw tied with twine; straws stick out past the outline at both ends, dull ochre
    for k in range(13):
        y0 = 10 + k * 1.3; dx = ((k * 5) % 4) - 1.5
        for t in range(25):
            x = 3 + t + dx * (t < 4 or t > 21); y = y0 + (t - 12) * .06
            l = .75 - k * .035 - (.12 if (t + k) % 7 == 0 else 0)
            I.P(x, y, I.band('yl', l * .82))
    for x in (2, 1, 29, 30):
        I.P(x, 12 + (x % 3), I.band('yl', .5))
    for y in range(9, 27):
        I.P(15, y, RAMPS['wd'][2]); I.P(16, y, RAMPS['wd'][4])               # the twine
    return I.done()


def hexr_unused():
    pass


def flask(I):
    # (icons r2: "a can") a hip flask: a flat body curved like a kidney, sloping shoulders into a short neck, a domed screw cap,
    # a leather band round its middle, the metal cool in shadow with a rim light down its lit edge
    COOL = hexr(['#22242e', '#363a48', '#4e5466', '#6c7286', '#9298aa', '#bcc0ce', '#e4e6ee'])
    for y in range(8, 30):
        for x in range(6, 27):
            top = 11 + abs(x - 16) * .55                                                  # the shoulders slope down from the neck
            ex = max(0, abs(x - 16) - 6.5); eb = max(0, y - 26)
            if y < top or ex * ex + eb * eb > 9 or y > 29:
                continue
            l = .78 - (x - 6) * .028
            I.P(x, y, COOL[max(0, min(6, int(l * 6 + .5)))])
    for y in range(17, 24):
        for x in range(6, 27):
            if I.p[x, y][3]:
                I.P(x, y, I.band('le', .62 - (x - 6) * .02 - (.2 if y in (17, 23) else 0)))   # the leather band, stitched edges
    I.poly([(14, 7), (19, 7), (19, 11), (14, 11)], 'mt', .5)                              # the neck
    I.blob(16.5, 5.5, 3.6, 2.6, 'mt', amb=.3)                                             # the domed screw cap
    for x in range(14, 20, 2):
        I.P(x, 7, RAMPS['mt'][2])
    for y in range(13, 27):
        if y < 17 or y > 23:
            I.P(7, y, COOL[6])                                                            # the rim light down its lit edge
    return I.done()


def jacket(I):
    # a short work jacket in olive canvas: its own shape (collar up, sleeves out, a zip, two flap pockets), a cool rim
    I.poly([(6, 9), (12, 6), (20, 6), (26, 9), (29, 22), (25, 23), (23, 15), (23, 28), (9, 28), (9, 15), (7, 23), (3, 22)], 'ol', lambda x, y: .62 if x < 14 else .42)
    I.poly([(11, 5), (16, 9), (21, 5), (20, 9), (16, 12), (12, 9)], 'ol', .78)      # the collar
    for y in range(10, 28):
        I.P(16, y, RAMPS['mt'][4])                                                 # the zip
    for (x0, y0) in ((10, 18), (18, 18)):
        I.poly([(x0, y0), (x0 + 5, y0), (x0 + 5, y0 + 2), (x0, y0 + 2)], 'ol', .3)
    return I.done(rim=True)


def mail(I):
    # a mail shirt: rows of rings, each a lit arc over a dark gap, short sleeves, a leather collar
    I.poly([(6, 9), (12, 7), (20, 7), (26, 9), (28, 19), (24, 19), (23, 14), (23, 28), (9, 28), (9, 14), (8, 19), (4, 19)], 'mt', .3)
    for y in range(9, 28, 2):
        for x in range(4 + (y // 2) % 2, 28, 2):
            if I.p[x, y][3]:
                l = .82 - (x - 4) * .028 - (y - 9) * .01 - (.18 if (x < 9 or x > 23) and y > 11 else 0)   # lit left shoulder and chest, darker right flank and underarms
                I.P(x, y, I.band('mt', l)); I.P(x + 1, y + 1, I.band('mt', l - .35))
    I.poly([(12, 7), (20, 7), (19, 10), (13, 10)], 'le', .55)
    return I.done(rim=True)


def pie(I):
    # a pie in its tin in three-quarter view: a smooth crust, four clean woven lattice strips each lit on its top-left, a crimped rim,
    # a slice cut out showing the red filling
    I.blob(16, 20, 13, 7, 'mt', mod=lambda x, y, l, nx, ny: .3 + l * .5)
    def m(x, y, l, nx, ny):
        if nx > .15 and ny > -.1 and nx * .9 > -ny:
            return None
        return .5 + l * .35
    I.blob(16, 18, 12, 6, 'wd', mod=m)
    for k in range(4):
        for t_ in range(-13, 14):
            for (dx, dy, x0) in ((1, .45, 6 + k * 5), (1, -.45, 5 + k * 5)):
                x = x0 + t_ * .35; y = 13 + k * 0 + (t_ + 13) * .42 if dy > 0 else 23 - (t_ + 13) * .42
                xx, yy = int(x), int(y)
                if ((xx - 16) / 12) ** 2 + ((yy - 18) / 6) ** 2 < .82 and not (xx > 17 and yy > 16):
                    I.P(xx, yy, RAMPS['wd'][6]); I.P(xx + 1, yy, RAMPS['wd'][4])
    for i in range(14):
        a = math.pi + i * math.pi / 13; I.P(16 + math.cos(a) * 12, 18 + math.sin(a) * 6, RAMPS['wd'][6])
    I.poly([(17, 18), (28, 18), (27, 22), (17, 21)], 'rd', .5)
    I.poly([(17, 18), (28, 18), (28, 19), (17, 19)], 'wd', .7)
    return I.done()


def sprinkler(I):
    # a dull brass sprinkler head on its stake, two arcs of water thrown out from it in 2 px drops
    I.rod(16, 30, 16, 17, 3, 'mt')
    I.blob(16, 15, 6, 3, 'br')
    I.poly([(14, 9), (18, 9), (18, 13), (14, 13)], 'br', .6); I.poly([(10, 8), (22, 8), (22, 10), (10, 10)], 'br', .75)
    for s in (-1, 1):
        for k in range(14):
            t = k / 13; x = 16 + s * (6 + t * 10); y = 8 - math.sin(t * math.pi) * 6 + t * 6
            I.P(x, y, RAMPS['bl'][6] if k < 7 else RAMPS['bl'][5]); I.P(x, y + 1, RAMPS['bl'][3])     # an unbroken 2 px arc
        ex = 16 + s * 16; I.P(ex, 15, RAMPS['bl'][5]); I.P(ex, 17, RAMPS['bl'][4]); I.P(ex - s, 16, RAMPS['bl'][5])   # ending in droplets
    return I.done()


def bonemeal(I):
    # a burlap sack tied at the neck, a bone stencilled on its front in white
    def m(x, y, l, nx, ny):
        if ny < -.6:
            return None
        return .2 + l * .8
    I.blob(16, 20, 11, 10, 'bu', mod=m)
    I.poly([(11, 11), (21, 11), (19, 6), (13, 6)], 'bu', .55); I.poly([(12, 9), (20, 9), (20, 11), (12, 11)], 'bu', .3)   # the neck gathered and tied in burlap
    for (x, y) in ((14, 5), (15, 4), (16, 4), (17, 4), (18, 5), (16, 5)):
        I.P(x, y, RAMPS['wh'][6] if y == 4 else RAMPS['wh'][4])                                                 # white powder at the mouth
    for t in range(9):
        I.P(12 + t, 20 - t * .2, RAMPS['wh'][6]); I.P(12 + t, 21 - t * .2, RAMPS['wh'][4])
    for (x, y) in ((11, 19), (11, 21), (21, 17), (21, 19)):
        I.P(x, y, RAMPS['wh'][6]); I.P(x - 1 if x < 16 else x + 1, y, RAMPS['wh'][5])
    return I.done()


ICONS = {'it_chaga': chaga, 'it_ghostcorn': ghostcorn, 'it_resin': resin, 'seed': seed, 'cbar': cbar, 'ibar': ibar, 'hay': hay,
         'it_flask': flask, 'it_jacket': jacket, 'it_mail': mail, 'pie': pie, 'it_sprinkler': sprinkler, 'bonemeal': bonemeal}

if __name__ == '__main__':
    for n in (sys.argv[1:] or ICONS):
        ICONS[n](Icon()).save(f'out/ic198_{n}.png')
    print('ok')
