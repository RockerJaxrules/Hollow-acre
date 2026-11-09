"""Crop growth stages, drawn for this game (they replace the last outside-art sprites: the LPC plants cut in the first build).

Owner's bar: Stardew Valley's finish (its craft, not its look; this game is autumnal and darker). Every stage reads on
its own at 1x: a sprout is a clear two-leaf V on a soil mound, a ripe turnip shows its bulb breaking the soil, the
pumpkin vine carries a pumpkin, the corn grows from knee-high to a tasselled stalk with cobs. Leaves are shaped
(midrib, lit top-left edge, darker underside), outlines are a darker version of each colour, no speckle.

    python3 crops.py out_dir            -> turnip_0..3, pumpkin_0..2 (32x64, feet at y=58), corn_0..2 (28x62, feet at y=60)
"""
import sys, os, math
from PIL import Image

HEX = lambda h: (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16), 255)
KERN = [HEX(c) for c in ('#6a4416', '#b0801c', '#dcac2c', '#f2d054')]   # old-gold kernels with a plum-brown shade (judge: lemon was candy)
SILK = [HEX(c) for c in ('#5a3418', '#7a4a24', '#9a6434')]
HUSK = [HEX(c) for c in ('#4a4620', '#7a7232', '#a49a46', '#c8bc62', '#e0d684')]   # straw husk, clear of the leaf green
LEAF = [HEX(c) for c in ('#0e2410', '#173c16', '#22561c', '#2f7224', '#418e2e', '#5eac3a', '#82c64c')]   # a full value range (judge vs the reference: ours were muddy)
DRYL = [HEX(c) for c in ('#2e2414', '#4a3a1c', '#6a5428', '#8a7236', '#a89048', '#c4ac5c')]
TURN_TOP = [HEX(c) for c in ('#36103c', '#5c1c64', '#84308c', '#ac4cb0', '#cc74c8')]
TURN_LOW = [HEX(c) for c in ('#7a6c66', '#ab9f95', '#d2c8bc', '#ebe4d8', '#fbf7ee')]
PUMP = [HEX(c) for c in ('#4a160a', '#7c2810', '#b04216', '#d8621e', '#ee8430', '#f8aa52', '#fcc87c')]
GREENP = [HEX(c) for c in ('#2a2a12', '#3e3e18', '#565620', '#6e6c2a', '#8a8634', '#a29e40')]   # an unripe pumpkin: dull yellow-olive, a full value step off the leaves
STREAK = HEX('#8e9c62')
STEM = [HEX(c) for c in ('#1a2a0e', '#2c4416', '#44621e')]
FLOWER = [HEX(c) for c in ('#7a5a14', '#b4881e', '#d8b040')]
TASSEL = [HEX(c) for c in ('#7a5a14', '#b08a1c', '#d8b42c', '#f0d650')]
SOIL = [HEX(c) for c in ('#24160c', '#3a2414', '#54361e', '#6e4a2a')]
LIGHT = (-.6, -.8)   # from the top left


class Canvas:
    def __init__(self, w, h): self.w, self.h = w, h; self.px = {}
    def put(self, x, y, c, over=True):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < self.w and 0 <= y < self.h and (over or (x, y) not in self.px): self.px[(x, y)] = c
    def image(self):
        im = Image.new('RGBA', (self.w, self.h), (0, 0, 0, 0)); p = im.load()
        for (x, y), c in self.px.items(): p[x, y] = c
        return im


def shade(ramp, k): return ramp[max(0, min(len(ramp) - 1, k))]


def leaf(cv, x0, y0, ang, L, W, bend, ramp, blade=False, droop=0.0):
    """a shaped leaf from (x0, y0): angle 0 points up, + leans right; bend curls it as it grows; droop pulls the tip
    down. Its lit edge faces the light, its underside and midrib are darker."""
    n = max(6, int(L * 3)); cx, cy = x0, y0
    for i in range(n + 1):
        t = i / n; a = ang + bend * t + droop * t * t
        dx, dy = math.sin(a), -math.cos(a)
        cx += dx * L / n; cy += dy * L / n
        w = W * (1 - t) ** .9 if blade else W * math.sin(math.pi * min(1, t * 1.15)) ** .7
        nx, ny = -dy, dx   # the leaf's left-hand normal
        lit = (nx * LIGHT[0] + ny * LIGHT[1]) > 0   # which side faces the light
        steps = max(1, int(w * 2))
        for s in range(-steps, steps + 1):
            o = s / 2.0
            if abs(o) > w: continue
            side_lit = (o > 0) == lit
            k = 4 if side_lit else 2
            if abs(o) < .5: k = 3                       # the midrib
            if side_lit and abs(o) > w - .8: k = 5       # the lit edge
            if t > .85 and side_lit: k = min(k + 1, len(ramp) - 1)
            cv.put(cx + nx * o, cy + ny * o, shade(ramp, k))


def mound(cv, cx, y, w):
    """the hilled soil a plant stands in: a low dome, lit on top, dark at its foot"""
    for dx in range(-w, w + 1):
        h = int(round(2.2 * (1 - (dx / (w + .5)) ** 2)))
        for dy in range(h + 1):
            k = 3 if dy == h and dx < 0 else (2 if dy >= h - 1 else 1)
            cv.put(cx + dx, y - dy, SOIL[k])
    for dx in range(-w + 1, w):
        cv.put(cx + dx, y + 1, SOIL[0])


def outline(im):
    """a darker version of the neighbouring colour round the silhouette (never black)"""
    W, H = im.size; p = im.load(); add = []
    for y in range(H):
        for x in range(W):
            if p[x, y][3]: continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                X, Y = x + dx, y + dy
                if 0 <= X < W and 0 <= Y < H and p[X, Y][3]:
                    r, g, b, _ = p[X, Y]; add.append((x, y, (int(r * .42), int(g * .4), int(b * .45), 255))); break
    for x, y, c in add: p[x, y] = c
    return im


def bulb(cv, cx, cy, rx, ry, soil_y):
    """a turnip root: purple shoulder above the soil, pale below, lit from the top left"""
    for y in range(int(cy - ry), int(cy + ry) + 1):
        for x in range(int(cx - rx), int(cx + rx) + 1):
            u, v = (x - cx) / rx, (y - cy) / ry
            if u * u + v * v > 1: continue
            l = -u * .55 - v * .75
            ramp = TURN_TOP if y < cy + ry * .1 else TURN_LOW
            k = 2 + (1 if l > .2 else 0) + (1 if l > .6 else 0) - (1 if l < -.4 else 0)
            if y > soil_y: continue
            cv.put(x, y, shade(ramp, k))
    cv.put(cx - rx * .45, cy - ry * .45, shade(TURN_TOP, 4))   # a highlight on the shoulder


def pumpkin_fruit(cv, cx, cy, rx, ry, ramp=PUMP, streaks=False, lobes=1.6, lift=0, seam=.12):
    for y in range(int(cy - ry), int(cy + ry) + 1):
        for x in range(int(cx - rx), int(cx + rx) + 1):
            u, v = (x - cx) / rx, (y - cy) / ry
            if u * u + v * v > 1: continue
            rib = math.cos(u * math.pi * lobes) ** 2   # the lobes: dark seams between them
            l = -u * .5 - v * .8
            k = 2 + lift + (1 if l > .1 else 0) + (1 if l > .55 else 0) - (1 if l < -.45 else 0) - (1 if rib < seam else 0)
            c = shade(ramp, k)
            if streaks and .44 < rib < .5 and abs(v) < .6 and abs(u) < .6: c = STREAK   # thin pale streaks on the front ribs: unripe
            cv.put(x, y, c)
    cv.put(cx - rx * .4, cy - ry * .5, ramp[5]); cv.put(cx - rx * .4 + 1, cy - ry * .5, ramp[4])
    for i in range(3): cv.put(cx + (1 if i == 2 else 0), cy - ry - i, STEM[1 + (i == 0)])


FLOWERO = [HEX(c) for c in ('#6a3010', '#a4521a', '#cc7a2a', '#e8a248')]   # a pumpkin flower: an orange trumpet
KHAKI = [HEX(c) for c in ('#3a4416', '#5a6a20', '#7e8e2c', '#a0ae3a', '#bec850', '#d6dc6c')]   # the unripe gourd, a step lighter than the leaves
YELLOWL = [HEX(c) for c in ('#2a2a14', '#44441c', '#646024', '#86802e', '#a49c3c', '#bcb44e', '#cec462')]   # a leaf going yellow


def spoon(cv, x0, y0, ang, L, W, ramp, droop=0.0, bend=0.0):
    """a turnip green (judge: "turnip greens, not leek spears"): a short stalk, then a broad spoon-shaped blade with a
    crinkled edge and a pale midrib; lit on the side facing the light, darker underneath"""
    n = max(8, int(L * 3)); cx, cy = x0, y0
    for i in range(n + 1):
        t = i / n; a = ang + bend * t + droop * t * t
        dx, dy = math.sin(a), -math.cos(a); cx += dx * L / n; cy += dy * L / n
        nx, ny = -dy, dx; lit = (nx * LIGHT[0] + ny * LIGHT[1]) > 0
        if t < .28: w = .5
        else:
            u = (t - .28) / .72; w = W * math.sin(math.pi * min(1, u * 1.05)) ** .55 * (1 + .12 * math.sin(t * 22))
        for s in range(-int(w * 2) - 1, int(w * 2) + 2):
            o = s / 2.0
            if abs(o) > w: continue
            side_lit = (o > 0) == lit
            if t < .28: c = ramp[2]
            elif abs(o) < .5 and .35 < t < .9: c = ramp[5]                 # the pale midrib
            elif side_lit: c = ramp[5] if abs(o) > w - .8 else ramp[4]      # lit half, its edge catching the light
            else: c = ramp[2] if abs(o) > w - .8 else ramp[3]               # the half turned away
            cv.put(cx + nx * o, cy + ny * o, c)


def seed_leaf(cv, x0, y0, ang, L, W, ramp):
    """a cotyledon: a thick oval, lit over most of it, dark only along its lower-right rim (no dark ring all round)"""
    ex, ey = x0 + math.sin(ang) * L * .5, y0 - math.cos(ang) * L * .5
    for y in range(int(ey - L), int(ey + L) + 2):
        for x in range(int(ex - L), int(ex + L) + 2):
            dx, dy = x - ex, y - ey
            u = dx * math.cos(ang) + dy * math.sin(ang); v = -dx * math.sin(ang) + dy * math.cos(ang)
            e = (u / W) ** 2 + (v / (L * .55)) ** 2
            if e > 1: continue
            l = -(dx / L) * .6 - (dy / L) * .8
            c = ramp[4] if l > .05 else ramp[3]
            if e > .55 and l < -.2: c = ramp[2]
            if e < .25 and l > .2: c = ramp[5]
            cv.put(x, y, c)
    for k in range(int(L * .5)): cv.put(x0 + math.sin(ang) * k * .5, y0 - k * .5, STEM[2])


def palm(cv, cx, cy, r, ramp, rot=0.0, behind=False):
    """a pumpkin leaf: a broad round leaf with five shallow lobes, seen from above and a little in front; lit top-left,
    darker toward the lower right, three pale veins from the stalk"""
    k0 = -1 if behind else 0
    for y in range(int(cy - r) - 1, int(cy + r) + 2):
        for x in range(int(cx - r * 1.2) - 1, int(cx + r * 1.2) + 2):
            dx, dy = (x - cx), (y - cy) / .78
            rho = math.hypot(dx, dy); th = math.atan2(dy, dx)
            R = r * (.8 + .2 * abs(math.cos(2.5 * (th - rot))))
            if abs(th - math.pi / 2) < .22 and rho > .45 * r: continue            # the notch where the stalk joins
            if rho > R: continue
            l = -(dx / r) * .6 - (dy / r) * .8
            k = 3 + k0                                                            # a flat leaf: one mid tone (not shaded like a ball)
            if rho > R - 1.2: k += 1 if l > 0 else -1                             # the rim: lit toward the light, shaded away
            elif l < -.55: k -= 1                                                  # the far side a step darker
            c = ramp[max(1, min(6, k))]
            for va in (-1.15, -.05, 1.05):                                         # three veins from the stalk end
                vx, vy = math.cos(va - math.pi / 2 + rot * .2), math.sin(va - math.pi / 2 + rot * .2)
                proj = dx * vx + dy * vy; perp = abs(-dx * vy + dy * vx)
                if .25 * r < proj < .8 * R and perp < .5: c = ramp[max(1, min(6, k + 1))]
            cv.put(x, y, c)


def ribbed(cv, cx, cy, rx, ry, ramp, nrib=3, lift=0):
    """a ribbed fruit drawn as lobes (judge: "ribs as broken dashes read as speckle; shade each lobe with a lit left
    edge"): unbroken curved seams, each lobe lit along its left side, the whole lit top-left"""
    seams = [(-1 + 2 * (i + 1) / (nrib + 1)) for i in range(nrib)]
    for y in range(int(cy - ry), int(cy + ry) + 1):
        v = (y - cy) / ry
        if abs(v) > 1: continue
        hw = rx * math.sqrt(max(0, 1 - v * v))
        xs = [cx + sd * hw for sd in seams]
        for x in range(int(round(cx - hw)), int(round(cx + hw)) + 1):
            u = (x - cx) / max(1, hw)
            l = -u * .45 - v * .8
            k = 2 + lift + (l > .05) + (l > .5) - (l < -.5)
            near = min(abs(x - sx) for sx in xs)
            right_of = [x - sx for sx in xs if x - sx > 0]
            if near < .5 and abs(v) < .86: k -= 1                                     # the seam
            elif right_of and min(right_of) < 1.5 and abs(v) < .7 and u < .6: k += 1   # a lobe's lit left edge
            cv.put(x, y, ramp[max(0, min(len(ramp) - 1, k))])


def turnip(stage):
    cv = Canvas(32, 64); B = 58; cx = 16
    if stage == 0:   # two oval seed leaves on a short stem
        mound(cv, cx, B, 4)
        seed_leaf(cv, cx - 1, B - 3, -.75, 4.4, 1.6, LEAF); seed_leaf(cv, cx + 1, B - 3, .7, 4.2, 1.6, LEAF)
        cv.put(cx, B - 2, STEM[2]); cv.put(cx, B - 3, STEM[2])
    elif stage == 1:   # three or four spoon leaves, a hand taller
        mound(cv, cx, B, 5)
        for a, L, d in ((-.95, 8, -.2), (-.25, 10, 0), (.35, 9.5, .1), (1.0, 7.5, .3)): spoon(cv, cx + a, B - 2, a, L, 2.2, LEAF, droop=d)
    else:
        mound(cv, cx, B, 7)
        if stage == 2:   # the shoulder breaks the soil: a purple dome, curved on top, lit top-left
            leaves = ((-1.15, 10, -.3), (-.55, 12.5, -.1), (-.05, 13.5, 0), (.5, 12.5, .15), (1.1, 10.5, .35))
            for (a, L, d) in leaves: spoon(cv, cx + a * 1.6, B - 4, a, L, 2.6, LEAF, droop=d)
            for y in range(B - 4, B):
                for x in range(cx - 5, cx + 6):
                    u, v = (x - cx) / 4.6, (y - (B - 1)) / 3.2
                    if u * u + v * v > 1: continue
                    l = -u * .6 - v * .8
                    cv.put(x, y, TURN_TOP[4] if (l > .55 and u < 0) else TURN_TOP[3] if l > .1 else TURN_TOP[2])
        else:   # ripe: the root pushed out of the soil, purple cap curving up at the sides, a thin taproot
            leaves = ((-1.25, 12, -.35), (-.7, 14, -.15), (-.2, 15.5, 0), (.3, 15, .1), (.8, 13.5, .25), (1.3, 11, .45))
            for i, (a, L, d) in enumerate(leaves): spoon(cv, cx + a * 1.6, B - 9, a, L, 2.8, LEAF, droop=d)
            cy, rx, ry = B - 5, 5.6, 5.0
            for y in range(int(cy - ry), int(cy + ry) + 1):
                for x in range(int(cx - rx), int(cx + rx) + 1):
                    u, v = (x - cx) / rx, (y - cy) / ry
                    if u * u + v * v > 1: continue
                    border = .2 - .55 * u * u                         # the purple ends higher at the sides
                    ramp = TURN_TOP if v < border else TURN_LOW
                    l = -u * .55 - v * .75
                    k = 2 + (l > .2) + (l > .6) - (l < -.4)
                    cv.put(x, y, shade(ramp, k))
            for (dx, dy) in ((-3, -3), (-2, -3), (-3, -2)): cv.put(cx + dx, cy + dy, TURN_TOP[4])   # the shoulder's highlight, a small cluster
            for k in range(3): cv.put(cx + (k == 2), cy + ry + 1 + k, TURN_LOW[1 if k else 2])       # the taproot
    return outline(cv.image())


def pumpkin(stage):
    cv = Canvas(32, 64); B = 58; cx = 16
    mound(cv, cx, B, 6)
    if stage == 0:   # two thick, round seed leaves (broader and blunter than the turnip's)
        seed_leaf(cv, cx - 1, B - 3, -1.05, 5.4, 2.6, LEAF); seed_leaf(cv, cx + 1, B - 3, 1.0, 5.2, 2.6, LEAF)
        for k in range(3): cv.put(cx, B - 2 - k, STEM[2])
        return outline(cv.image())
    for i in range(-10, 11): cv.put(cx + i, B - 2 + round(math.sin(i * .55)), STEM[2 if i < 0 else 1])   # the vine along the ground
    if stage == 1:   # round lobed leaves of different sizes, an orange trumpet flower, a curling tendril: a vine
        palm(cv, cx - 7, B - 8, 5.0, LEAF, .2); palm(cv, cx + 5, B - 10, 6.2, LEAF, -.2); palm(cv, cx - 1, B - 5, 4.2, LEAF, 0)
        fx, fy = cx + 10, B - 6
        for (dx, dy, k) in ((-1, 0, 3), (1, 0, 3), (-1, 1, 2), (0, 1, 3), (1, 1, 2), (0, 2, 2), (0, 3, 1), (0, 0, 2)): cv.put(fx + dx, fy + dy, FLOWERO[k])
        cv.put(fx, fy + 4, STEM[2])
        for (dx, dy) in ((-12, -1), (-13, -2), (-13, -3), (-12, -4), (-11, -4), (-11, -3)): cv.put(cx + dx, B - 2 + dy, STEM[2])
    elif stage == 2:   # the unripe gourd: khaki, a step lighter than its leaves, three unbroken ribs
        palm(cv, cx - 7, B - 9, 5.4, LEAF, .2, behind=True); palm(cv, cx + 7, B - 11, 6.0, LEAF, -.2, behind=True)
        ribbed(cv, cx + 1, B - 6, 6.4, 5.0, KHAKI, nrib=3)
        for i in range(3): cv.put(cx + 1 + (i == 2), B - 11 - i, STEM[2 if i < 2 else 1])
    else:   # ripe: a big lobed pumpkin in the icon's muted ramp, its leaves still showing behind it
        palm(cv, cx - 9, B - 10, 5.8, LEAF, .25, behind=True); palm(cv, cx + 9, B - 12, 5.2, LEAF, -.25, behind=True)
        ribbed(cv, cx + 1, B - 7, 10.5, 7.6, PUMP, nrib=3, lift=1)
        for i, (dx, dy) in enumerate(((0, -8), (0, -9), (1, -10), (2, -10), (3, -9))): cv.put(cx + 1 + dx, B - 7 + dy, STEM[2] if i < 3 else LEAF[3])   # a curled stem
    return outline(cv.image())


def corn_ear(cv, bx, by, side, L, wfull, ang):
    """a husked ear growing from the stalk: a straw husk wrapped round the lower half and peeled back along its edges
    above, old-gold kernels showing in the opening (a lit column, body, a shaded column: no dots), a short silk tuft"""
    ux, uy = math.sin(ang), -math.cos(ang); px_, py_ = math.cos(ang), math.sin(ang)
    for i in range(L):
        u = i / (L - 1); w = wfull * (.55 + .45 * math.sin(min(1, u * 1.6) * math.pi * .5)) if u < .82 else wfull * (.82 - (u - .82) * 1.6)
        n = max(2, int(round(w)))
        for j in range(n):
            o = j - (n - 1) / 2; jj = j if side > 0 else n - 1 - j
            x, y = bx + ux * i + px_ * o, by + uy * i + py_ * o
            husk = u < .45 or ((jj == 0 or jj == n - 1) and u < .85)
            if husk: col = HUSK[4] if jj == 0 else HUSK[1] if jj == n - 1 else (HUSK[2] if u < .15 else HUSK[3])
            else: col = KERN[3] if jj <= 1 else KERN[1] if jj >= n - 2 else KERN[2]
            cv.put(x, y, col)
    tx, ty = bx + ux * L, by + uy * L
    for (dx, dy) in ((0, 0), (side, 0), (side, 1)): cv.put(tx + dx, ty + dy, SILK[1])   # one colour, one small tuft


def corn(stage):
    cv = Canvas(28, 62); B = 60; cx = 14
    H = (17, 38, 50)[stage]
    mound(cv, cx, B, 4)
    for y in range(B - 1, B - H, -1):   # the stalk: lit left edge, shaded right; its foot shows below the first leaf
        t = (B - y) / H; w = 1 if t > .7 else 2
        for dx in range(-w + 1, w + 1): cv.put(cx + dx, y, LEAF[4] if dx < 0 or w == 1 else LEAF[2])
    # leaves alternate up the stalk with uneven lengths, angles and droop (judge: "mirrored tiers like a fishbone")
    spots = {0: ((.34, -1, 10, .9), (.5, 1, 12, 1.1), (.7, -1, 9, .6), (.88, 1, 7, .4)),
             1: ((.12, 1, 12, 1.2), (.25, -1, 15, .9), (.41, 1, 14, .7), (.53, -1, 12, 1.0), (.68, 1, 13, .6), (.79, -1, 9, .5), (.9, 1, 7, .3)),
             2: ((.07, -1, 11, 1.3), (.17, 1, 13, 1.1), (.3, -1, 15, .9), (.43, 1, 14, .7), (.55, -1, 15, 1.0), (.67, 1, 12, .6), (.77, -1, 11, .7), (.88, 1, 8, .4))}[stage]
    for i, (t, side, L, dr) in enumerate(spots):
        y = B - 2 - t * H; dry = stage == 2 and i < 2; ramp = DRYL if dry else LEAF   # the lowest two drying: tan, shorter, less curled
        leaf(cv, cx + side, y, side * (.78 - t * .3), L - (3 if dry else 0), 2.5, side * .22, ramp, blade=True, droop=side * (dr * .6 if dry else dr))
    if stage == 2:
        corn_ear(cv, cx + 1, B - 2 - .5 * H, 1, 12, 5, .5)       # the main ear
        corn_ear(cv, cx - 1, B - 2 - .33 * H, -1, 9, 4, -.55)    # a second, smaller and lower, on the other side
    if stage >= 1:   # a tassel bud, then an ochre tassel of spreading spikes
        top = B - H
        if stage == 1:
            for i in range(4): cv.put(cx, top - i, TASSEL[1 + (i > 1)])
        else:
            for (dx, dy) in ((0, 0), (0, -1), (0, -2), (0, -3), (0, -4), (0, -5), (0, -6), (-1, -2), (-2, -3), (-3, -3), (1, -2), (2, -3), (3, -4), (-1, -4), (-2, -5), (1, -5), (2, -6)):
                cv.put(cx + dx, top + dy, TASSEL[3] if dy < -4 else TASSEL[2] if dx <= 0 else TASSEL[1])
    return outline(cv.image())


def specks(im):
    """lint: isolated single pixels whose colour differs from all four neighbours by a lot (reads as speckle)"""
    p = im.load(); W, H = im.size; out = []
    lum = lambda c: .3 * c[0] + .59 * c[1] + .11 * c[2]
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            c = p[x, y]
            if not c[3]: continue
            nb = [n for n in (p[x + 1, y], p[x - 1, y], p[x, y + 1], p[x, y - 1]) if n[3]]
            if len(nb) < 3 or any(n[:3] == c[:3] for n in nb): continue
            if min(abs(lum(n) - lum(c)) for n in nb) > 22: out.append((x, y))
    return out


if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for st in range(4): turnip(st).save(os.path.join(out, f'turnip_{st}.png'))
    for st in range(4): pumpkin(st).save(os.path.join(out, f'pumpkin_{st}.png'))   # stage 3 is the ripe one (it was still the old outside-art sprite)
    for st in range(3): corn(st).save(os.path.join(out, f'corn_{st}.png'))
    for n in [f'turnip_{i}' for i in range(4)] + [f'pumpkin_{i}' for i in range(4)] + [f'corn_{i}' for i in range(3)]:
        sp = specks(Image.open(os.path.join(out, n + '.png')).convert('RGBA'))
        if sp: print('  speck', n, sp[:8])
    print('ok')
