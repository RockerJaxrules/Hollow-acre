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
    def __init__(self, w, h): self.w, self.h = w, h; self.px = {}; self.grp = None; self.under = {}
    def put(self, x, y, c, over=True):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < self.w and 0 <= y < self.h and (over or (x, y) not in self.px):
            if self.grp is not None:
                if (x, y) not in self.grp and (x, y) in self.px: self.under[(x, y)] = True   # this piece covers earlier drawing here
                self.grp[(x, y)] = c
            self.px[(x, y)] = c
    def begin(self): self.grp = {}; self.under = {}
    def end(self, dark):
        """close a piece (a leaf): where its rim lies over something drawn earlier, a dark line separates them (Stardew's
        inner line between overlapping leaves), so a bush reads as separate leaves, not one blob"""
        g = self.grp or {}; self.grp = None
        for (x, y), c in g.items():
            if (x, y) not in self.under: continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                if (x + dx, y + dy) not in g and (x + dx, y + dy) in self.px:
                    self.px[(x, y)] = dark; break
    def image(self):
        im = Image.new('RGBA', (self.w, self.h), (0, 0, 0, 0)); p = im.load()
        for (x, y), c in self.px.items(): p[x, y] = c
        return im


def shade(ramp, k): return ramp[max(0, min(len(ramp) - 1, k))]


def _leaf(cv, x0, y0, ang, L, W, bend, ramp, blade=False, droop=0.0):
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


def _grouped(fn, ramp_arg):
    def g(cv, *a, **k):
        ramp = k.get('ramp') if 'ramp' in k else a[ramp_arg]
        cv.begin(); fn(cv, *a, **k); cv.end(shade(ramp, 1))
    return g


leaf = _grouped(_leaf, 6)


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
                    k = .62 if (dx, dy) in ((1, 0), (0, 1)) else .38          # the outline is lighter where it faces the light (top-left)
                    r, g, b, _ = p[X, Y]; add.append((x, y, (int(r * k), int(g * k * .96), int(b * k * 1.06), 255))); break
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
STEMB = [HEX(c) for c in ('#2a180a', '#4e3218', '#74502a')]   # a pumpkin's woody stem
PALEL = [HEX(c) for c in ('#1e3416', '#2e4e20', '#46702e', '#5e8a3a', '#7aa44a', '#98bc5e', '#b4d276')]   # a leaf's paler underside
YELLOWL = [HEX(c) for c in ('#2a2a14', '#44441c', '#646024', '#86802e', '#a49c3c', '#bcb44e', '#cec462')]   # a leaf going yellow


def _spoon(cv, x0, y0, ang, L, W, ramp, droop=0.0, bend=0.0):
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


def _seed_leaf(cv, x0, y0, ang, L, W, ramp):
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


def _palm(cv, cx, cy, r, ramp, rot=0.0, behind=False):
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


spoon = _grouped(_spoon, 5)
seed_leaf = _grouped(_seed_leaf, 5)
palm = _grouped(_palm, 3)


def ribbed(cv, cx, cy, rx, ry, ramp, nrib=3, lift=0):
    """a ribbed fruit drawn as lobes (judge: "ribs as broken dashes read as speckle; shade each lobe with a lit left
    edge"): unbroken curved seams, each lobe lit along its left side, the whole lit top-left"""
    seams = [math.sin(math.radians(a)) for a in ((-58, -22, 22, 58) if nrib == 4 else (-50, 0, 50))]   # meridians: closer toward the sides
    for y in range(int(cy - ry), int(cy + ry) + 1):
        v = (y - cy) / ry
        if abs(v) > 1: continue
        hw = rx * math.sqrt(max(0, 1 - v * v))
        bend = min(1, math.sqrt(max(0, (v + 1) / 1.5)))      # the seams leave the stem at the top and swing out round the body
        xs = [cx + sd * hw * bend for sd in seams]
        for x in range(int(round(cx - hw)), int(round(cx + hw)) + 1):
            u = (x - cx) / max(1, hw)
            l = -u * .45 - v * .8
            k = 2 + lift + (l > .05) + (l > .5) - (l < -.5)
            near = min(abs(x - sx) for sx in xs)
            right_of = [x - sx for sx in xs if x - sx > 0]
            if near < .5 and abs(v) < .86 and l < .45: k -= 1                         # the seam: only away from the light, so the sphere reads first
            elif right_of and min(right_of) < 1.5 and abs(v) < .7 and -.6 < u < .3 and l > .1: k += 1   # a lobe's lit left edge, on the lit side only
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
            for dx in range(-7, 8):                                                                  # the soil lip in front of it
                h = int(round(2.4 * (1 - (dx / 7.5) ** 2)))
                for dy in range(h + 1): cv.put(cx + dx, B - dy, SOIL[3 if dy == h and dx < 0 else 2 if dy == h else 1])
    return outline(cv.image())


def pumpkin(stage):
    cv = Canvas(32, 64); B = 58; cx = 16
    mound(cv, cx, B, 6)
    if stage == 0:   # two thick, round seed leaves (broader and blunter than the turnip's)
        for k in range(4): cv.put(cx, B - 2 - k, KHAKI[4] if k < 3 else KHAKI[3])   # a pale, thick stem
        seed_leaf(cv, cx - 1, B - 5, -1.35, 6.4, 3.0, LEAF); seed_leaf(cv, cx + 1, B - 5, 1.3, 6.2, 3.0, LEAF)   # broad squash seed leaves, held flat
        return outline(cv.image())
    for i in range(-10, 11): cv.put(cx + i, B - 2 + round(math.sin(i * .55)), STEM[2 if i < 0 else 1])   # the vine along the ground
    if stage == 1:   # round lobed leaves of different sizes, an orange trumpet flower, a curling tendril: a vine
        palm(cv, cx - 7, B - 8, 5.0, LEAF, .2); palm(cv, cx + 5, B - 10, 6.2, LEAF, -.2); palm(cv, cx - 1, B - 5, 4.2, LEAF, 0)
        fx, fy = cx + 8, B - 7    # the flower sits on the vine
        for (dx, dy, k) in ((-1, 0, 3), (1, 0, 3), (-1, 1, 2), (0, 1, 3), (1, 1, 2), (0, 2, 2), (0, 3, 1), (0, 0, 2)): cv.put(fx + dx, fy + dy, FLOWERO[k])
        cv.put(fx, fy + 4, STEM[2])
        for (dx, dy) in ((-12, -1), (-13, -2), (-13, -3), (-12, -4), (-11, -4), (-11, -3)): cv.put(cx + dx, B - 2 + dy, STEM[2])
    elif stage == 2:   # the unripe gourd: khaki, a step lighter than its leaves, three unbroken ribs
        palm(cv, cx - 7, B - 9, 5.4, LEAF, .2, behind=True); palm(cv, cx + 7, B - 11, 6.0, LEAF, -.2, behind=True)
        ribbed(cv, cx + 1, B - 6, 6.4, 5.0, KHAKI, nrib=3)
        for i in range(3): cv.put(cx + 1 + (i == 2), B - 11 - i, STEM[2 if i < 2 else 1])
    else:   # ripe: a big lobed pumpkin in the icon's muted ramp, its leaves still showing behind it
        palm(cv, cx - 9, B - 10, 5.8, LEAF, .25, behind=True); palm(cv, cx + 9, B - 12, 5.2, LEAF, -.25, behind=True)
        pcx, pcy, prx, pry = cx + 1, B - 9, 10.0, 8.6                       # rounder: a pumpkin, not a squash
        ribbed(cv, pcx, pcy, prx, pry, PUMP, nrib=4, lift=1)
        for (dx, dy) in ((-5, -5), (-5, -4), (-6, -3), (-6, -2), (-6, -1), (-4, -5)): cv.put(pcx + dx, pcy + dy, PUMP[6])   # one clear highlight streak on the upper-left lobe
        for (dx, dy) in ((-1, -9), (0, -9), (-1, -10), (0, -10), (0, -11), (1, -11), (1, -12), (2, -12)):           # a thick brown stem, curling
            cv.put(pcx + dx, pcy + dy, STEMB[2] if dx < 0 or dy < -10 else STEMB[1])
        for (dx, dy) in ((-2, -8), (-1, -8), (0, -8), (1, -8), (2, -8), (-1, -7), (0, -7)): cv.put(pcx + dx, pcy + dy, PUMP[2])   # the dent where the stem sinks in
        cv.put(pcx - 1, pcy - 8, STEMB[0]); cv.put(pcx, pcy - 8, STEMB[0])
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
             1: ((.12, 1, 11, 1.4), (.24, -1, 16, .8), (.39, 1, 13, .5), (.54, -1, 11, 1.3), (.66, 1, 15, .9), (.8, -1, 8, .4), (.9, 1, 6, .2)),
             2: ((.07, -1, 11, 1.3), (.17, 1, 13, 1.1), (.3, -1, 15, .9), (.43, 1, 14, .7), (.55, -1, 15, 1.0), (.67, 1, 12, .6), (.77, -1, 11, .7), (.88, 1, 8, .4))}[stage]
    for i, (t, side, L, dr) in enumerate(spots):
        y = B - 2 - t * H; dry = stage == 2 and i < 2; ramp = DRYL if dry else (PALEL if (stage >= 1 and i == 3) else LEAF)   # the lowest two drying; one turned to show its pale underside
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


# ================================================================ v5 (strict judge against the reference set, R = 8)
# "leaves are outlined blobs; value ramps compressed and only darker (no pale highlight, no hue shift to red/plum);
#  everything mechanically regular (even ribs, ladder leaves, one dish under every stage)"
LEAF = [HEX(c) for c in ('#0a1e1a', '#12341e', '#1c4e22', '#2a6a26', '#3c862c', '#56a236', '#78be48', '#a6d86e')]   # cool deep shade to a pale yellow-green light
PUMP = [HEX(c) for c in ('#36122a', '#661c1e', '#983018', '#c44c1a', '#e06c26', '#f09038', '#f8b65e', '#fcdc98')]   # plum shade to a pale peach light
GOURD = [HEX(c) for c in ('#142418', '#1e3a1c', '#2c5422', '#3e6e28', '#548a30', '#6ea43c', '#92c052')]             # the unripe pumpkin: a darker green than the leaves' lights
FLOWERY = [HEX(c) for c in ('#7a4a10', '#c08218', '#e8b02c', '#fadc66')]                                            # a pumpkin flower: a yellow trumpet
TURN_TOP = [HEX(c) for c in ('#2e1036', '#521c5c', '#7a2c80', '#a04aa4', '#c876c4', '#e2a8dc')]                     # plum to mauve to a lilac glint
TURN_LOW = [HEX(c) for c in ('#6e6274', '#9a90a0', '#c8c0c4', '#e6e0dc', '#fbf8f2')]                               # white, shaded toward cool lilac
TASSEL = [HEX(c) for c in ('#6a4c18', '#9a7424', '#c8a038', '#e8cc62')]
DRYL = [HEX(c) for c in ('#3a2a14', '#5e4620', '#86682e', '#a88a42', '#c8ac5e', '#e0c87e')]
HUSK = [HEX(c) for c in ('#4a4620', '#7a7232', '#a49a46', '#c8bc62', '#e0d684')]
KERN = [HEX(c) for c in ('#6a4416', '#a87a1c', '#d8a82c', '#f2d054', '#faea92')]
STEMB = [HEX(c) for c in ('#2a180c', '#4e3018', '#765028', '#9a7040')]
SHADOWC = (50, 33, 37, 150)   # #322125 at 60%: a contact shadow instead of the soil dish


def outline(im):
    """a darker version of the neighbouring colour round the opaque silhouette (never black; the soft shadow gets none);
    lighter where it faces the light"""
    W, H = im.size; p = im.load(); add = []
    for y in range(H):
        for x in range(W):
            if p[x, y][3] == 255: continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                X, Y = x + dx, y + dy
                if 0 <= X < W and 0 <= Y < H and p[X, Y][3] == 255:
                    k = .62 if (dx, dy) in ((1, 0), (0, 1)) else .38
                    r, g, b, _ = p[X, Y]; add.append((x, y, (int(r * k), int(g * k * .96), int(b * k * 1.06), 255))); break
    for x, y, c in add: p[x, y] = c
    return im


def contact(cv, cx, y, w):
    """a soft contact shadow on the ground (no opaque soil dish)"""
    for dx in range(-w, w + 1):
        cv.put(cx + dx, y, SHADOWC)
        if abs(dx) < w - 1: cv.put(cx + dx, y + 1, SHADOWC)


def _spoon(cv, x0, y0, ang, L, W, ramp, droop=0.0, bend=0.0):
    """a turnip green: a lit stalk, then a spoon blade with a crinkled edge, a BRIGHT midrib, lit half and shaded half"""
    n = max(8, int(L * 3)); cx, cy = x0, y0; top = len(ramp) - 1
    for i in range(n + 1):
        t = i / n; a = ang + bend * t + droop * t * t
        dx, dy = math.sin(a), -math.cos(a); cx += dx * L / n; cy += dy * L / n
        nx, ny = -dy, dx; lit = (nx * LIGHT[0] + ny * LIGHT[1]) > 0
        w = .5 if t < .28 else W * math.sin(math.pi * min(1, (t - .28) / .72 * 1.05)) ** .55 * (1 + .12 * math.sin(t * 22))
        for s in range(-int(w * 2) - 1, int(w * 2) + 2):
            o = s / 2.0
            if abs(o) > w: continue
            side_lit = (o > 0) == lit
            if t < .28: c = ramp[top - 2] if side_lit else ramp[2]                      # the stalk, lit on one side
            elif abs(o) < .5 and .32 < t < .92: c = ramp[top]                          # the bright midrib
            elif side_lit: c = ramp[top - 1] if abs(o) > w - .8 else ramp[top - 2]
            else: c = ramp[2] if abs(o) > w - .8 else ramp[3]
            cv.put(cx + nx * o, cy + ny * o, c)


def _palm(cv, cx, cy, r, ramp, rot=0.0, behind=False):
    """a pumpkin leaf: five deep, pointed lobes, flat (one mid tone), a lit rim toward the light, a darker rim away,
    a pale vein star from the stalk"""
    k0 = -1 if behind else 0; top = len(ramp) - 1
    for y in range(int(cy - r) - 2, int(cy + r) + 3):
        for x in range(int(cx - r * 1.25) - 2, int(cx + r * 1.25) + 3):
            dx, dy = (x - cx), (y - cy) / .8
            rho = math.hypot(dx, dy); th = math.atan2(dy, dx)
            lobe = abs(math.cos(2.5 * (th - rot)))
            R = r * (.62 + .38 * lobe ** .6)                                         # deep sinuses, pointed lobes
            if abs(th - math.pi / 2) < .3 and rho > .35 * r: continue               # the notch at the stalk
            if rho > R: continue
            l = -(dx / r) * .6 - (dy / r) * .8
            k = 4 + k0
            if rho > R - 1.2: k += 1 if l > 0 else -1
            elif l < -.5: k -= 1
            c = ramp[max(1, min(top, k))]
            for va in (-1.9, -.95, 0, .95, 1.9):                                    # five veins
                vx, vy = math.cos(va - math.pi / 2 + rot), math.sin(va - math.pi / 2 + rot)
                proj = dx * vx + dy * vy; perp = abs(-dx * vy + dy * vx)
                if .15 * r < proj < .75 * R and perp < .5: c = ramp[max(1, min(top, k + 2))]
            cv.put(x, y, c)


def lobed_fruit(cv, cx, cy, rx, ry, ramp, nlobe=5, lift=0):
    """a pumpkin built from lobes (judge: "five lobes, each lit on the left and shaded on the right; scalloped outline at
    each join; a peach-to-plum ramp"): the whole lit top-left, each lobe rounded on its own, the joins scalloped"""
    top = len(ramp) - 1
    seams = [math.sin(math.radians(a)) for a in ((-54, -18, 18, 54) if nlobe == 5 else (-50, 0, 50))]
    for y in range(int(cy - ry) - 1, int(cy + ry) + 1):
        v = (y - cy) / ry
        if abs(v) > 1: continue
        hw = rx * math.sqrt(max(0, 1 - v * v)); bend = min(1, math.sqrt(max(0, (v + 1) / 1.5)))
        xs = [cx - hw] + [cx + sd * hw * bend for sd in seams] + [cx + hw]
        for x in range(int(round(cx - hw)), int(round(cx + hw)) + 1):
            # which lobe, and where across it (0 left .. 1 right)
            for i in range(len(xs) - 1):
                if xs[i] - .5 <= x <= xs[i + 1] + .5: a0, a1 = xs[i], xs[i + 1]; break
            q = (x - a0) / max(1, a1 - a0)
            if abs(v) > .9 - .25 * abs(q - .5) and (q < .12 or q > .88): continue  # scallops: the joins dip at the top and bottom
            u = (x - cx) / max(1, hw); l = -u * .45 - v * .75                         # the whole, lit top-left
            k = 3 + lift + (l > -.05) + (l > .45) - (l < -.45)
            k += 1 if q < .3 else (-1 if q > .78 else 0)                               # each lobe: lit left, shaded right
            cv.put(x, y, ramp[max(0, min(top - 1, k))])
    # the pale highlight on the upper-left lobe, a short streak, and the notch at the stem
    for (dx, dy) in ((-int(rx * .5), -int(ry * .5)), (-int(rx * .5), -int(ry * .5) + 1), (-int(rx * .5) - 1, -int(ry * .5) + 2), (-int(rx * .5) + 1, -int(ry * .5) - 1)):
        cv.put(cx + dx, cy + dy, ramp[top])


def turnip(stage):
    cv = Canvas(32, 64); B = 58; cx = 16
    contact(cv, cx, B, 4 + 2 * stage)
    if stage == 0:
        seed_leaf(cv, cx - 1, B - 3, -.75, 4.4, 1.6, LEAF); seed_leaf(cv, cx + 1, B - 3, .7, 4.2, 1.6, LEAF)
        cv.put(cx, B - 1, LEAF[3]); cv.put(cx, B - 2, LEAF[4])
    elif stage == 1:
        for a, L, d in ((-.95, 8, -.2), (-.25, 10, 0), (.35, 9.5, .1), (1.0, 7.5, .3)): spoon(cv, cx + a, B - 1, a, L, 2.2, LEAF, droop=d)
    elif stage == 2:
        for (a, L, d) in ((-1.15, 10, -.3), (-.55, 12.5, -.1), (-.05, 13.5, 0), (.5, 12.5, .15), (1.1, 10.5, .35)): spoon(cv, cx + a * 1.6, B - 3, a, L, 2.6, LEAF, droop=d)
        for y in range(B - 4, B + 1):   # the shoulder: plum at the bottom-right, mauve, a lilac glint top-left
            for x in range(cx - 5, cx + 6):
                u, v = (x - cx) / 4.6, (y - (B - .5)) / 3.6
                if u * u + v * v > 1 or y > B: continue
                l = -u * .6 - v * .8
                cv.put(x, y, TURN_TOP[5] if (l > .7 and u < -.2) else TURN_TOP[4] if l > .35 else TURN_TOP[3] if l > -.1 else TURN_TOP[2])
    else:
        for i, (a, L, d) in enumerate(((-1.25, 12, -.35), (-.7, 14, -.15), (-.2, 15.5, 0), (.3, 15, .1), (.8, 13.5, .25), (1.3, 11, .45))):
            spoon(cv, cx + a * 1.4, B - 10, a, L, 2.8, LEAF, droop=d)
        cy, rx, ry = B - 4, 5.6, 5.0
        for y in range(int(cy - ry), int(cy + ry) + 1):
            for x in range(int(cx - rx), int(cx + rx) + 1):
                u, v = (x - cx) / rx, (y - cy) / ry
                if u * u + v * v > 1 or y > B - 1: continue                          # its lower part is in the ground
                border = -.05 - .45 * u * u + .12 * math.sin(x * 1.3)                # the purple fades down with a wavy edge
                ramp = TURN_TOP if v < border else TURN_LOW
                l = -u * .55 - v * .75
                k = 2 + (l > .15) + (l > .55) - (l < -.4)
                cv.put(x, y, ramp[max(0, min(len(ramp) - 2, k + (1 if ramp is TURN_TOP else 0)))])
        for (dx, dy) in ((-3, -3), (-2, -3), (-3, -2)): cv.put(cx + dx, cy + dy, TURN_TOP[5])   # the lilac glint
        for dx in range(-6, 7): cv.put(cx + dx, B, SOIL[2] if dx < 0 else SOIL[1])              # the soil line it sits in
    return outline(cv.image())


def pumpkin(stage):
    cv = Canvas(32, 64); B = 58; cx = 16
    contact(cv, cx, B, 5 + 2 * stage)
    if stage == 0:   # broad, flat seed leaves spread sideways and a small true leaf between them
        for k in range(3): cv.put(cx, B - 1 - k, GOURD[5] if k < 2 else GOURD[4])
        seed_leaf(cv, cx - 1, B - 4, -1.45, 6.6, 2.8, LEAF); seed_leaf(cv, cx + 1, B - 4, 1.42, 6.4, 2.8, LEAF)
        palm(cv, cx, B - 7, 2.6, LEAF, 0)
        return outline(cv.image())
    vine = [(cx + i, B - 1 + round(math.sin(i * .5) * .8)) for i in range(-11, 12)]   # the vine, one mid-green line along the ground
    for (x, y) in vine: cv.put(x, y, LEAF[3])
    if stage == 1:   # five-lobed leaves on stalks at different heights, a tendril curl, a yellow trumpet flower
        for (ox, h, r, rot) in ((-7, 9, 5.2, .25), (5, 12, 6.4, -.2), (-1, 6, 4.0, 0)):
            for k in range(h - int(r * .7)): cv.put(cx + ox, B - 2 - k, LEAF[4])        # the leaf stalk
            palm(cv, cx + ox, B - 2 - h, r, LEAF, rot)
        for (dx, dy) in ((-12, -1), (-13, -2), (-13, -3), (-12, -4), (-11, -4), (-11, -3)): cv.put(cx + dx, B - 1 + dy, LEAF[4])   # the tendril
        fx, fy = cx + 9, B - 6
        for (dx, dy, k) in ((-2, -2, 3), (-1, -2, 2), (1, -2, 2), (2, -2, 3), (-1, -1, 2), (0, -1, 3), (1, -1, 2), (-1, 0, 1), (0, 0, 2), (1, 0, 1), (0, 1, 1), (0, 2, 0)):
            cv.put(fx + dx, fy + dy, FLOWERY[k])
        cv.put(fx, fy + 3, LEAF[4]); cv.put(fx, fy + 4, LEAF[4])
    elif stage == 2:   # a darker green fruit, ribs as lobe shading, half under a lobed leaf
        palm(cv, cx - 8, B - 9, 5.0, LEAF, .2, behind=True)
        lobed_fruit(cv, cx + 1, B - 5, 6.8, 5.4, GOURD, nlobe=5)
        for k in range(3): cv.put(cx + 1, B - 11 - k, STEMB[2] if k else STEMB[1])
        palm(cv, cx + 7, B - 7, 5.4, LEAF, -.3)                                          # in front, covering its right half
    else:   # ripe: 1.2:1, five lobes, scalloped joins, a notch and a woody stem
        palm(cv, cx - 9, B - 9, 5.6, LEAF, .25, behind=True); palm(cv, cx + 10, B - 10, 5.0, LEAF, -.25, behind=True)
        pcx, pcy, prx, pry = cx + 1, B - 9, 10.4, 8.6
        lobed_fruit(cv, pcx, pcy, prx, pry, PUMP, nlobe=5, lift=0)
        for (dx, dy) in ((-1, -8), (0, -8), (1, -8)): cv.put(pcx + dx, pcy + dy, PUMP[2])                       # the notch round the stem
        for (dx, dy) in ((-1, -9), (0, -9), (-1, -10), (0, -10), (-1, -11), (0, -11), (0, -12), (1, -12)):    # a 2x4 stem, lit on its left
            cv.put(pcx + dx, pcy + dy, STEMB[3] if dx < 0 else STEMB[1])
    return outline(cv.image())


def corn_ear(cv, bx, by, side, L, wfull, ang):
    """a husked ear: straw husk round the lower two thirds and peeled back at the top; kernels only in the top third, in
    small clusters staggered like brickwork (no 1 px checker); a short silk tuft"""
    ux, uy = math.sin(ang), -math.cos(ang); px_, py_ = math.cos(ang), math.sin(ang)
    for i in range(L):
        u = i / (L - 1); w = wfull * (.6 + .4 * math.sin(min(1, u * 1.6) * math.pi * .5)) if u < .85 else wfull * (.85 - (u - .85) * 2)
        n = max(2, int(round(w)))
        for j in range(n):
            o = j - (n - 1) / 2; jj = j if side > 0 else n - 1 - j
            x, y = bx + ux * i + px_ * o, by + uy * i + py_ * o
            if u < .62 or jj == 0 or jj == n - 1:
                col = HUSK[4] if jj == 0 else HUSK[1] if jj == n - 1 else (HUSK[2] if u < .2 else HUSK[3])
            else:
                col = KERN[4] if jj == 1 else KERN[2] if jj < n - 2 else KERN[1]
                if (i + (jj % 2)) % 3 == 0 and jj > 1: col = KERN[1]               # the gap between kernel clusters
            cv.put(x, y, col)
    tx, ty = bx + ux * L, by + uy * L
    for (dx, dy) in ((0, 0), (side, 0), (side, 1)): cv.put(tx + dx, ty + dy, DRYL[2])


def corn(stage):
    cv = Canvas(28, 62); B = 60; cx = 14
    H = (19, 40, 50)[stage]
    contact(cv, cx, B, 5)
    nodes = []
    for y in range(B - 1, B - H, -1):   # the stalk, lit left, shaded right
        t = (B - y) / H; w = 1 if t > .72 else 2
        for dx in range(-w + 1, w + 1): cv.put(cx + dx, y, LEAF[5] if dx < 0 or w == 1 else LEAF[3])
    # fewer, longer ribbon leaves at uneven heights, tips drooping, each lit on its top edge, dark underneath
    spots = {0: ((.3, -1, 13, 1.3), (.5, 1, 14, 1.0), (.78, -1, 10, .7)),
             1: ((.18, 1, 15, 1.4), (.37, -1, 17, 1.1), (.55, 1, 14, .8), (.72, -1, 12, 1.2), (.86, 1, 9, .5)),
             2: ((.08, -1, 14, 2.4), (.15, 1, 13, 2.2), (.32, -1, 16, 1.1), (.47, 1, 15, .8), (.62, -1, 14, 1.2), (.77, 1, 11, .7), (.88, -1, 8, .4))}[stage]
    for i, (t, side, L, dr) in enumerate(spots):
        y = B - 2 - t * H; dry = stage == 2 and i < 2
        nodes.append(y)
        if dry: leaf(cv, cx + side, y, side * 1.15, L - 2, 1.5, side * .5, DRYL, blade=True, droop=side * 1.5)   # dry ones hang down as thin ribbons
        else: leaf(cv, cx + side, y, side * (.85 - t * .3), L, 2.2, side * .2, LEAF, blade=True, droop=side * dr)
    for y in nodes:   # node rings where the leaves join
        cv.put(cx, int(y) + 1, LEAF[2]); cv.put(cx + 1, int(y) + 1, LEAF[1])
    if stage == 2:
        corn_ear(cv, cx + 1, B - 2 - .48 * H, 1, 12, 5, .5)
        corn_ear(cv, cx - 1, B - 2 - .3 * H, -1, 9, 4, -.55)
    top = B - H
    if stage == 1:   # a tassel of three short spikes
        for (dx, dy) in ((0, 0), (0, -1), (0, -2), (0, -3), (-1, -2), (-2, -3), (1, -1), (2, -2)): cv.put(cx + dx, top + dy, TASSEL[2] if dy < -1 else TASSEL[1])
    elif stage == 2:   # drooping straw spikes
        for (dx, dy, k) in ((0, 0, 1), (0, -1, 2), (0, -2, 2), (0, -3, 3), (0, -4, 3), (-1, -2, 2), (-2, -2, 2), (-3, -1, 3), (-4, 0, 2), (1, -2, 2), (2, -3, 2), (3, -3, 3), (4, -2, 3), (5, -1, 2), (-1, -4, 3), (-2, -5, 3), (-3, -5, 2), (1, -5, 3), (2, -6, 3)):
            cv.put(cx + dx, top + dy, TASSEL[k])
    return outline(cv.image())


spoon = _grouped(_spoon, 5)
palm = _grouped(_palm, 3)


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
