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
                    if s[x, y][3] and ((x > 0 and not s[x - 1, y][3]) or (y > 0 and not s[x, y - 1][3])) and (x + y) < 40:
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
    # a strip of birch bark it grew from, then the conk: a craggy black lump, cracked into plates, broken open at one end on rusty orange
    I.poly([(3, 26), (28, 22), (29, 27), (4, 30)], 'wh', lambda x, y: .78 if y < 27 else .55)
    for x in (7, 14, 21):
        I.P(x, 27 + (x % 3 == 0), RAMPS['ck'][1]); I.P(x + 1, 27 + (x % 3 == 0), RAMPS['ck'][1])
    def m(x, y, l, nx, ny):
        if nx > .45 and ny > -.5:
            return I.band('og', .35 + l * .7)                                  # the broken end: rusty orange flesh
        crack = (x * 3 + y * 5) % 9 == 0 or (y % 5 == 0 and (x // 4) % 2 == 0)
        return max(0.04, l * .55 - (.12 if crack else 0))
    I.blob(15, 18, 12, 8.5, 'ck', amb=.12, k=.9, mod=m)
    for (x, y) in ((8, 12), (13, 11), (18, 12)):
        I.P(x, y, RAMPS['ck'][5])                                            # a dull sheen on the plates' lit edges
    I.P(25, 17, RAMPS['og'][6]); I.P(25, 18, RAMPS['og'][5])
    return I.done(rim=True)


def ghostcorn(I):
    # a pale cob held diagonally: rows of bluish-white kernels, two grey husk leaves peeled back from its foot, a faint cold glow
    I.poly([(5, 29), (9, 17), (15, 25)], 'st', .5); I.poly([(5, 29), (20, 25), (14, 20)], 'st', .3)
    for i in range(9):
        for j in range(-2, 3):
            cx = 11 + i * 1.9 + j * .9; cy = 22 - i * 1.9 + j * .9 * .9
            if abs(j) == 2 and (i < 1 or i > 7):
                continue
            l = .9 - (j + 2) * .13 - i * .01
            I.P(cx, cy, I.band('wh', l)); I.P(cx + 1, cy, I.band('wh', l - .2))
            I.P(cx, cy + 1, I.band('wh', l - .25))
    I.P(27, 4, RAMPS['wh'][5]); I.P(28, 3, RAMPS['wh'][4])                     # the silk at its tip
    for (x, y) in ((9, 14), (24, 18), (20, 6)):
        I.P(x, y, RAMPS['cy'][5])
    return I.done()


def resin(I):
    # a translucent amber drop: dark at its foot, glowing through its middle, a hard glint high on the left, a speck caught inside
    def m(x, y, l, nx, ny):
        if ny < -.25 and abs(nx) > .5 + (-.25 - ny) * 1.2:
            return None
        return .25 + (ny + 1) * .32 - nx * .12
    I.blob(16, 19, 9, 10, 'am', mod=m)
    I.poly([(12, 12), (16, 3), (20, 12)], 'am', .62)
    for (x, y, k) in ((12, 14, 6), (12, 15, 6), (13, 13, 5)):
        I.P(x, y, RAMPS['am'][k])
    I.P(18, 22, RAMPS['am'][1]); I.P(19, 22, RAMPS['am'][0])
    I.P(14, 26, RAMPS['am'][2]); I.P(17, 27, RAMPS['am'][2])
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


def flask(I):
    # a pewter hip flask: a curved body lit on the left, a screw cap, a dent, a hard glint
    def m(x, y, l, nx, ny):
        return .2 + l * .85
    I.blob(16, 19, 9, 10, 'mt', mod=m)
    for y in range(9, 30):
        for x in range(8, 25):
            if 9 <= y and (x - 16) ** 2 / 81 + (y - 19) ** 2 / 100 > 1:
                continue
    I.poly([(13, 7), (19, 7), (19, 10), (13, 10)], 'mt', .5)
    I.poly([(12, 4), (20, 4), (20, 7), (12, 7)], 'mt', .72)
    for y in range(12, 25):
        I.P(11, y, RAMPS['mt'][6])                                             # the glint down its left side
    I.P(20, 22, RAMPS['mt'][2]); I.P(21, 23, RAMPS['mt'][2])
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
                l = .75 - (x - 4) * .018 - (y - 9) * .012
                I.P(x, y, I.band('mt', l)); I.P(x + 1, y + 1, I.band('mt', l - .35))
    I.poly([(12, 7), (20, 7), (19, 10), (13, 10)], 'le', .55)
    return I.done(rim=True)


def pie(I):
    # a pie in its tin in three-quarter view: a lattice top, a crimped rim, a slice cut out showing the red filling
    I.blob(16, 20, 13, 7, 'mt', mod=lambda x, y, l, nx, ny: .3 + l * .5)                    # the tin
    def m(x, y, l, nx, ny):
        if nx > .15 and ny > -.1 and nx * .9 > -ny:                                           # the missing slice
            return None
        lat = (x + y) % 5 == 0 or (x - y) % 5 == 0
        return .55 + l * .4 - (.12 if lat else 0)
    I.blob(16, 18, 12, 6, 'wd', mod=m)
    for i in range(14):
        a = math.pi + i * math.pi / 13; I.P(16 + math.cos(a) * 12, 18 + math.sin(a) * 6, RAMPS['wd'][6])
    I.poly([(17, 18), (28, 18), (27, 22), (17, 21)], 'rd', .5)                               # the filling where the slice was cut
    I.poly([(17, 18), (28, 18), (28, 19), (17, 19)], 'wd', .7)
    return I.done()


def sprinkler(I):
    # a dull brass sprinkler head on its stake, two arcs of water thrown out from it in 2 px drops
    I.rod(16, 30, 16, 17, 3, 'mt')
    I.blob(16, 15, 6, 3, 'br')
    I.poly([(14, 9), (18, 9), (18, 13), (14, 13)], 'br', .6); I.poly([(10, 8), (22, 8), (22, 10), (10, 10)], 'br', .75)
    for s in (-1, 1):
        for k in range(7):
            t = k / 6; x = 16 + s * (6 + t * 10); y = 8 - math.sin(t * math.pi) * 6 + t * 6
            I.P(x, y, RAMPS['bl'][5]); I.P(x + s, y, RAMPS['bl'][4])
    return I.done()


def bonemeal(I):
    # a burlap sack tied at the neck, a bone stencilled on its front in white
    def m(x, y, l, nx, ny):
        if ny < -.6:
            return None
        return .2 + l * .8
    I.blob(16, 20, 11, 10, 'bu', mod=m)
    I.poly([(11, 11), (21, 11), (19, 6), (13, 6)], 'bu', .55); I.poly([(12, 9), (20, 9), (20, 11), (12, 11)], 'wd', .4)
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
