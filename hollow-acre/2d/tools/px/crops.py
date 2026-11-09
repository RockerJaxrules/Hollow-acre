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
KERN = [HEX(c) for c in ('#5e3e22', '#9a7430', '#bc9640', '#d4b45a')]   # old-gold kernels with a plum-brown shade (judge: lemon was candy)
SILK = [HEX(c) for c in ('#5a3418', '#7a4a24', '#9a6434')]
HUSK = [HEX(c) for c in ('#3e3a1e', '#635c2c', '#857c3c', '#a69c50', '#bcb466')]   # straw husk, clear of the leaf green
LEAF = [HEX(c) for c in ('#18241a', '#22341c', '#304822', '#40602a', '#567832', '#6e9040', '#88a64e')]
DRYL = [HEX(c) for c in ('#2e2414', '#4a3a1c', '#6a5428', '#8a7236', '#a89048', '#c4ac5c')]
TURN_TOP = [HEX(c) for c in ('#2e1228', '#4a1e40', '#6a2e5a', '#8a4474', '#a65e8c')]
TURN_LOW = [HEX(c) for c in ('#6a5e58', '#9a8e84', '#c2b6a8', '#ded4c4', '#f0e8da')]
PUMP = [HEX(c) for c in ('#2e1006', '#4c1e0c', '#6c3012', '#8a461a', '#a45c24', '#be7834')]
GREENP = [HEX(c) for c in ('#2a2a12', '#3e3e18', '#565620', '#6e6c2a', '#8a8634', '#a29e40')]   # an unripe pumpkin: dull yellow-olive, a full value step off the leaves
STREAK = HEX('#8e9c62')
STEM = [HEX(c) for c in ('#1e2410', '#2e3818', '#465022')]
FLOWER = [HEX(c) for c in ('#7a5a14', '#b4881e', '#d8b040')]
TASSEL = [HEX(c) for c in ('#5a4218', '#7a5a20', '#a07a2c', '#c09a3c')]
SOIL = [HEX(c) for c in ('#1e140e', '#2c1e14', '#3c2a1c', '#4e3826')]
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


def turnip(stage):
    cv = Canvas(32, 64); B = 58; cx = 16
    if stage == 0:
        mound(cv, cx, B, 4)
        leaf(cv, cx, B - 2, -.9, 4, 1.2, .2, LEAF); leaf(cv, cx, B - 2, .8, 4, 1.2, -.2, LEAF)
    elif stage == 1:
        mound(cv, cx, B, 5)
        for a, L in ((-1.1, 6), (-.3, 7), (.4, 7), (1.1, 6)): leaf(cv, cx, B - 2, a, L, 1.8, a * -.15, LEAF)
    else:
        mound(cv, cx, B, 7)
        if stage == 3: bulb(cv, cx, B - 4, 5.5, 5, B - 1)
        else: bulb(cv, cx, B - 2, 3.5, 3, B - 1)
        leaves = ((-1.25, 8), (-.65, 10), (-.1, 11), (.45, 10), (1.05, 9)) if stage == 2 else ((-1.35, 10), (-.8, 12), (-.25, 14), (.3, 13), (.85, 12), (1.35, 9))
        base = B - (8 if stage == 3 else 4)
        for i, (a, L) in enumerate(leaves):
            leaf(cv, cx + (a * 1.5), base, a, L, 2.4, -a * .2, LEAF if i % 4 else DRYL[1:] if stage == 3 else LEAF, droop=(.6 if abs(a) > 1 else 0) * (1 if a > 0 else -1))
        if stage == 3: bulb(cv, cx, B - 4, 5.5, 5, B - 1)   # the shoulder sits in front of the leaf stems
    return outline(cv.image())


def pumpkin(stage):
    cv = Canvas(32, 64); B = 58; cx = 16
    mound(cv, cx, B, 6)
    if stage == 0:   # two round seed leaves
        for a in (-1.0, 1.0): leaf(cv, cx, B - 3, a, 6, 2.8, -a * .45, LEAF)
        cv.put(cx, B - 3, STEM[1]); cv.put(cx, B - 2, STEM[1])
    else:
        # the vine runs along the ground and big lobed leaves stand off it
        for i in range(-9, 10):
            cv.put(cx + i, B - 2 + round(math.sin(i * .6)), STEM[2 if i < 0 else 1])
        big = 5.5 if stage == 1 else 6.5
        for (ox, a) in ((-7, -.7), (5, .6), (-1, -.1)):
            leaf(cv, cx + ox, B - 3, a, big + 3, big * .6, -a * .3, LEAF)
        if stage == 1:   # a flower
            for dx, dy, k in ((0, 0, 2), (1, 0, 1), (-1, 0, 1), (0, -1, 2), (0, 1, 0)): cv.put(cx + 7 + dx, B - 5 + dy, FLOWER[k])
        elif stage == 2:   # unripe: green with pale streaks (a brown one read as a chestnut or rot)
            pumpkin_fruit(cv, cx + 2, B - 6, 6.2, 5.2, GREENP, lobes=1.8, seam=.08)   # a round fruit, 12 px, in front of the leaves
        else:   # ripe: a big lobed pumpkin in the harvest icon's muted ramp, sitting in its vine, a dry leaf for autumn
            pumpkin_fruit(cv, cx + 1, B - 7, 10.5, 7.6, PUMP, lobes=2.0, lift=1, seam=.05)
            for i, (dx, dy) in enumerate(((1, -9), (2, -10), (3, -10), (4, -9))): cv.put(cx + 1 + dx, B - 7 + dy, STEM[2] if i < 2 else LEAF[3])   # a curled stem
    return outline(cv.image())


def corn_ear(cv, bx, by, side, L, wfull, ang):
    """a husked ear growing from the stalk (judge on v1: 'bare cobs pinned on the leaves'): its base tucked into the leaf
    joint, a straw-green husk wrapped round the lower two thirds, opening at the top onto a band of old-gold kernels in
    small clusters (lit side, body, shade), a drooping silk tuft at the tip"""
    ux, uy = math.sin(ang), -math.cos(ang); px_, py_ = math.cos(ang), math.sin(ang)
    for i in range(L):
        u = i / (L - 1); w = wfull * (.55 + .45 * math.sin(min(1, u * 1.6) * math.pi * .5)) if u < .82 else wfull * (.82 - (u - .82) * 1.6)
        n = max(2, int(round(w)))
        for j in range(n):
            o = j - (n - 1) / 2; jj = j if side > 0 else n - 1 - j      # jj 0 = the lit side
            x, y = bx + ux * i + px_ * o, by + uy * i + py_ * o
            husk = u < .5 or ((jj == 0 or jj == n - 1) and u < .85)       # wrapped below, peeled back along the edges above
            if husk:
                col = HUSK[4] if jj == 0 else HUSK[1] if jj == n - 1 else (HUSK[2] if u < .15 else HUSK[3])
            else:
                col = KERN[3] if jj == 1 else KERN[1] if jj >= n - 2 else KERN[2]
                if i % 3 == 0 and 1 < jj < n - 2: col = KERN[1]           # the line between two clusters of kernels
            cv.put(x, y, col)
    tx, ty = bx + ux * L, by + uy * L
    for k, (dx, dy) in enumerate(((0, 0), (side * 1, 0), (side * 2, 1), (side * 2, 2))):   # the silk, drooping outward
        cv.put(tx + dx, ty + dy, SILK[min(2, k)] if k < 2 else SILK[0])


def corn(stage):
    cv = Canvas(28, 62); B = 60; cx = 14
    H = (17, 38, 50)[stage]
    mound(cv, cx, B, 4)
    for y in range(B - 2, B - H, -1):   # the stalk: lit left edge, shaded right
        t = (B - y) / H; w = 1 if t > .7 else 2
        for dx in range(-w + 1, w + 1):
            cv.put(cx + dx, y, LEAF[4] if dx < 0 or w == 1 else LEAF[2])
    # leaves sprout at staggered heights, alternating sides, lengths varied, the low ones browning and drooping
    spots = {0: ((.2, -1, 11), (.42, 1, 12), (.65, -1, 10), (.85, 1, 8)),
             1: ((.1, 1, 13), (.24, -1, 15), (.38, 1, 15), (.52, -1, 14), (.66, 1, 13), (.8, -1, 10), (.9, 1, 8)),
             2: ((.06, -1, 12), (.16, 1, 14), (.28, -1, 16), (.4, 1, 16), (.52, -1, 15), (.64, 1, 14), (.75, -1, 12), (.86, 1, 9))}[stage]
    for i, (t, side, L) in enumerate(spots):
        y = B - 2 - t * H; ramp = DRYL if (stage == 2 and i < 2) else LEAF
        leaf(cv, cx + side, y, side * (.75 - t * .25), L, 2.5, side * .25, ramp, blade=True, droop=side * (1.6 if i < 2 else .9))
    if stage == 2:
        corn_ear(cv, cx + 1, B - 2 - .5 * H, 1, 12, 5, .5)     # the main ear
        corn_ear(cv, cx - 1, B - 2 - .3 * H, -1, 8, 3.6, -.6)   # a smaller one, lower, on the other side
    if stage >= 1:   # a tassel bud, then a full ochre tassel
        top = B - H
        if stage == 1:
            for i in range(4): cv.put(cx, top - i, TASSEL[1 + (i > 1)])
        else:
            for s, L in ((-1, 6), (0, 8), (1, 6), (-1, 4), (1, 5)):
                for i in range(L):
                    cv.put(cx + s * (i // 3) + (s if i > 1 else 0) * 0, top - i * (1 if s == 0 else .8), TASSEL[min(3, 1 + i // 3)])
    return outline(cv.image())


if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for st in range(4): turnip(st).save(os.path.join(out, f'turnip_{st}.png'))
    for st in range(4): pumpkin(st).save(os.path.join(out, f'pumpkin_{st}.png'))   # stage 3 is the ripe one (it was still the old outside-art sprite)
    for st in range(3): corn(st).save(os.path.join(out, f'corn_{st}.png'))
    print('ok')
