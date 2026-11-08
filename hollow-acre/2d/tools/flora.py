"""More trees and bushes, all drawn here by code. New kinds for the valley: oak (russet and green), birch (gold and green),
a weeping willow for the water's edge, spruce (two shapes), apple trees for Quill Orchard, a crooked dead oak and a broken
snag for the Hollow Woods; bushes: holly with berries, sumac, juniper, elderberry; and two plants you walk through: bracken
fern and cattail reeds.

Depth, the same rules as the rest of the art: every canopy is built from leafy clumps rendered as lit volumes (light from the
upper left, a little in front), nearer clumps cast shadow down-right onto the ones behind, the underside of each clump and the
inside of the crown fall into shade, and every shade is hue-shifted (shadows cool toward violet, light warm toward gold).
Trunks are lit cylinders with bark, flaring into roots that sit in a dark contact band on the ground. Dark outline round
everything. Writes spr/lpc/obj/*.png and their entries in objects.json."""
import json, math, colorsys
from PIL import Image
OBJ = 'spr/lpc/obj/'
OUTC = (30, 22, 26)
HASH = lambda x, y, s=0: (math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453) % 1


class C:
    def __init__(s, W, H): s.W, s.H = W, H; s.im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); s.px = s.im.load()
    def p(s, x, y, c, a=255):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < s.W and 0 <= y < s.H:
            if a >= 255 or s.px[x, y][3] == 0: s.px[x, y] = (c[0], c[1], c[2], a)
            else:
                o = s.px[x, y]; t = a / 255; s.px[x, y] = (round(o[0] + (c[0] - o[0]) * t), round(o[1] + (c[1] - o[1]) * t), round(o[2] + (c[2] - o[2]) * t), max(o[3], a))
    def get(s, x, y): return s.px[x, y] if 0 <= x < s.W and 0 <= y < s.H else (0, 0, 0, 0)
    def outline(s, col=OUTC):
        W, H = s.W, s.H; a = [[s.px[x, y][3] > 200 for x in range(W)] for y in range(H)]; out = []
        for y in range(H):
            for x in range(W):
                if a[y][x]: continue
                if (x > 0 and a[y][x - 1]) or (x < W - 1 and a[y][x + 1]) or (y > 0 and a[y - 1][x]) or (y < H - 1 and a[y + 1][x]): out.append((x, y))
        for x, y in out: s.px[x, y] = (*col, 255)


def ramp(hexc, n=7, spread=.62, hs=.08):
    """n tones of one colour, dark to light. Shadows drift toward violet, highlights toward gold."""
    r, g, b = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]; h, s, v = colorsys.rgb_to_hsv(r, g, b); out = []
    for i in range(n):
        t = i / (n - 1) - .55
        tgt = .72 if t < 0 else .13; d = ((tgt - h + .5) % 1) - .5; hh = (h + d * min(1, abs(t) * hs * 6)) % 1
        ss = max(0, min(1, s * (1.08 - t * .22))); vv = max(0, min(1, v * (1 + t * spread * (1.25 if t < 0 else 1))))
        out.append(tuple(round(c * 255) for c in colorsys.hsv_to_rgb(hh, ss, vv)))
    return out


L = (-.56, -.62, .55)   # the light: from the upper left, a little toward us
LN = math.sqrt(sum(v * v for v in L)); L = tuple(v / LN for v in L)


def blobs(c, clumps, R, seed=0, rough=.16, cell=4, leaf=.24, under=.3, top=None, bot=None, gaps=0.0, shadow_k=1.0, mask=None):
    """A crown of leafy clumps, each a lit ragged sphere. clumps: (cx, cy, r, depth). Returns the per-pixel buffer."""
    Z = {}
    for k, (cx, cy, r, dp) in enumerate(clumps):
        ph = HASH(k, seed, 5) * 6.28
        for y in range(int(cy - r * 1.25) - 1, int(cy + r * 1.25) + 2):
            for x in range(int(cx - r * 1.25) - 1, int(cx + r * 1.25) + 2):
                if not (0 <= x < c.W and 0 <= y < c.H): continue
                dx, dy = x + .5 - cx, y + .5 - cy; a = math.atan2(dy, dx)
                rr = r * (1 + rough * (math.sin(a * 7 + ph) * .5 + math.sin(a * 13 + ph * 2.3) * .3 + (HASH(int(a * 9 + 40), k, seed) - .5) * .5))
                d2 = dx * dx + dy * dy
                if d2 > rr * rr: continue
                if gaps and HASH(x // 3, y // 3, seed + k) < gaps and d2 > (rr * .55) ** 2: continue
                nz = math.sqrt(max(0, 1 - d2 / (rr * rr))); f = dp + nz * rr
                if (x, y) not in Z or f > Z[(x, y)][0]: Z[(x, y)] = (f, dx / rr, dy / rr, nz, k, dp)
    ys = [y for (_, y) in Z] or [0]; y0, y1 = (top if top is not None else min(ys)), (bot if bot is not None else max(ys))
    n = len(R)
    for (x, y), (f, nx, ny, nz, k, dp) in Z.items():
        l = max(0, nx * L[0] + ny * L[1] + nz * L[2])
        sh = .02 + .9 * l - under * max(0, ny) * .8 - .26 * max(0, (y - y0) / max(1, y1 - y0) - .3) - .34 * (1 - nz) ** 2
        # leaves: each small cell is a little scalloped bump, lit on its upper left
        u, v = (x % cell) - cell * .4, (y % cell) - cell * .4; jit = HASH(x // cell, y // cell, seed)
        sh += leaf * (.45 - (u * u + v * v) / (cell * cell * .9)) * (.7 + jit * .5) + (jit - .5) * .05
        # the shadow a nearer clump throws down and to the right onto this one
        for ox, oy in ((-2, -2), (-3, -2), (-2, -3), (-1, -2)):
            q = Z.get((x + ox, y + oy))
            if q and q[4] != k and q[0] > f + 1.5: sh -= .3 * shadow_k; break
        idx = max(0, min(n - 1, int(round(sh * (n - 1)))))
        c.p(x, y, R[idx])
    return Z


def trunk(c, cx, ytop, ybot, w0, w1, R, flare=4, bark='plain', seed=0, lean=0.0):
    """A lit cylinder: brightest a third of the way in from the left, dark on the right, bark texture, roots flaring at the base."""
    n = len(R)
    for y in range(ytop, ybot + 1):
        t = (y - ytop) / max(1, ybot - ytop)
        w = w0 + (w1 - w0) * t + flare * max(0, t - .78) ** 2 * 22
        x0 = cx - w / 2 + lean * (ybot - y)
        for i in range(int(math.ceil(w))):
            u = (i + .5) / w; nx = u * 2 - 1
            l = .62 - .55 * nx - .18 * nx * nx
            if bark == 'oak': l += (HASH(int(x0 + i), y // 3, seed) - .5) * .35 + (.18 if (int(x0 + i) + y // 5) % 4 == 0 else 0) - (.25 if HASH(int(x0 + i) // 2, y // 6, seed + 1) > .82 else 0)
            elif bark == 'birch':
                if HASH(y // 2, seed, 3) > .8 and HASH(int(x0 + i) // 3, y // 2, seed) > .35: l = -.4   # the black marks across a birch
                else: l += (HASH(int(x0 + i), y, seed) - .5) * .12
            elif bark == 'dead': l += (HASH(int(x0 + i), y // 2, seed) - .5) * .3 + (.2 if (int(x0 + i) * 3 + y) % 7 == 0 else 0)
            else: l += (HASH(int(x0 + i), y // 2, seed) - .5) * .22
            if y > ybot - 2: l -= .35   # where it meets the ground
            c.p(x0 + i, y, R[max(0, min(n - 1, int(round(l * (n - 1)))))])


def branch(c, x0, y0, x1, y1, w0, w1, R, seed=0):
    n = max(2, int(math.hypot(x1 - x0, y1 - y0) * 1.5))
    for k in range(n + 1):
        t = k / n; x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t; w = w0 + (w1 - w0) * t
        for j in range(-int(w // 2), int(math.ceil(w / 2)) + (1 if w < 1.2 else 0)):
            nx = j / max(1, w / 2); l = .6 - .4 * nx + (HASH(int(x), int(y), seed) - .5) * .15
            c.p(x + j, y, R[max(0, min(len(R) - 1, int(round(l * (len(R) - 1)))))])


def contact_band(c, x0, x1, G):
    for x in range(int(x0), int(x1)):
        for dy, m in ((0, .62), (1, .78)):
            p = c.get(x, G - dy)
            if p[3] == 255: c.px[x, G - dy] = (round(p[0] * m), round(p[1] * m), round(p[2] * m), 255)


def ground_shadow(c, cx, G, rx, ry=3.2, a=90):
    for y in range(int(G - ry) - 1, int(G + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            d = ((x - cx) / rx) ** 2 + ((y - G) / ry) ** 2
            if d < 1 and 0 <= x < c.W and 0 <= y < c.H and c.px[x, y][3] == 0: c.px[x, y] = (12, 14, 20, int(a * (1 - d * .7)))


def fallen(c, cx, G, rx, cols, k, seed):
    for i in range(k):
        x = cx + (HASH(i, seed, 1) - .5) * rx * 2; y = G + (HASH(i, seed, 2) - .5) * 5
        if c.get(int(x), int(y))[3] < 200: c.p(x, y, cols[i % len(cols)]); c.p(x + 1, y, cols[(i + 1) % len(cols)])


SPRITES = {}
def save(name, c, G, foot=(-.4, -.3, .4, .1)):
    c.im.save(OBJ + name + '.png')
    SPRITES[name] = {'src': f'spr/lpc/obj/{name}.png', 'fw': c.W, 'fh': c.H, 'ax': float(c.W / 2), 'ay': float(G), 'foot': list(foot)}
    print(name, c.W, c.H)


OAK_BARK = ramp('#6a4a32', 6)
BIRCH_BARK = [(40, 34, 40), (150, 146, 150), (196, 192, 186), (222, 218, 206), (238, 234, 220), (252, 250, 238)]
DEAD = ramp('#5e544c', 6, spread=.9)
GREY = ramp('#8e8a80', 6)


# ---------------------------------------------------------------- oak: broad, low-domed, thick trunk with roots
def oak(name, col, seed):
    c = C(136, 140); G = 134; cx = 68; R = ramp(col)
    trunk(c, cx, 70, G, 14, 18, OAK_BARK, flare=6, bark='oak', seed=seed)
    for (x1, y1, w) in ((cx - 30, 52, 5), (cx + 28, 50, 5), (cx - 8, 40, 4), (cx + 14, 44, 4)): branch(c, cx + (x1 - cx) * .1, 84, x1, y1, 7, w, OAK_BARK, seed)
    cl = []
    for i in range(16):
        a = HASH(i, seed, 1) * 6.28; rr = HASH(i, seed, 2)
        x = cx + math.cos(a) * 44 * rr; y = 50 + math.sin(a) * 24 * rr - 6
        cl.append((x, y, 17 + HASH(i, seed, 3) * 9, (y - 20) * .5 + HASH(i, seed, 4) * 6))
    cl += [(cx - 42, 64, 15, 30), (cx + 44, 62, 15, 30), (cx - 18, 72, 16, 36), (cx + 20, 74, 15, 36), (cx, 22, 18, 4)]
    blobs(c, cl, R, seed=seed, rough=.12, cell=5, leaf=.26)
    c.outline(); contact_band(c, cx - 14, cx + 14, G)
    ground_shadow(c, cx + 6, G + 1, 30)
    fallen(c, cx, G + 2, 36, [R[3], R[5], R[4]], 14, seed)
    save(name, c, G, (-.42, -.3, .42, .1))


# ---------------------------------------------------------------- birch: slender white trunk, an open upright crown
def birch(name, col, seed):
    c = C(80, 152); G = 146; cx = 40; R = ramp(col, spread=.85)
    trunk(c, cx, 26, G, 5, 8, BIRCH_BARK, flare=3, bark='birch', seed=seed, lean=.02)
    for (x1, y1) in ((cx - 18, 42), (cx + 16, 36), (cx - 12, 64), (cx + 18, 70), (cx - 6, 20)): branch(c, cx, y1 + 16, x1, y1, 2.4, 1, BIRCH_BARK, seed)
    cl = []
    for i in range(26):
        y = 16 + (i / 25) * 76 + (HASH(i, seed, 1) - .5) * 8; spread = 10 + 10 * math.sin((y - 8) / 88 * math.pi)
        cl.append((cx + (HASH(i, seed, 5) - .5) * 2 * spread, y, 8 + HASH(i, seed, 3) * 5, y * .25 + HASH(i, seed, 4) * 5))
    blobs(c, cl, R, seed=seed, rough=.24, cell=3, leaf=.28, gaps=.07)
    c.outline(); contact_band(c, cx - 6, cx + 6, G)
    ground_shadow(c, cx + 5, G + 1, 16)
    fallen(c, cx, G + 2, 20, [R[4], R[6], R[5]], 10, seed)
    save(name, c, G, (-.25, -.2, .25, .1))


# ---------------------------------------------------------------- willow: a dome, and long strands hanging nearly to the ground
def willow(name, col, seed):
    c = C(150, 146); G = 140; cx = 75; R = ramp(col, spread=.8)
    D = 56   # half-width of the curtain at the hem
    hem = lambda u, g: G - 9 - u * u * 26 + (HASH(g, 2, seed) - .5) * 12
    # the hollow under the crown: deep shade you see between the strands
    for y in range(40, G - 8):
        k = (y - 40) / (G - 48)
        for x in range(int(cx - (44 + 12 * k)), int(cx + (44 + 12 * k)) + 1):
            u = (x - cx) / (44 + 12 * k)
            if y < hem(u, int((u + 1) * 18)) - 4: c.p(x, y, R[0] if (x + y) % 5 else R[1])
    def curtain(front):
        for g in range(40):
            if (HASH(g, seed, 7) > .42) != front: continue
            u0 = -1 + 2 * (g + .5) / 40 + (HASH(g, seed, 8) - .5) * .03
            if front and abs(u0) < .24 and HASH(g, seed, 6) > .35: continue   # thin in the middle: the trunk shows
            gw = 3 + int(HASH(g, seed, 9) * 3); yt = 36 + abs(u0) * 16 + (HASH(g, seed, 1) - .5) * 6; yb = hem(u0, g)
            for y in range(int(yt), int(yb)):
                k = (y - yt) / max(1, yb - yt); xc = cx + u0 * (44 + 12 * k) + math.sin(y * .13 + g) * 1.1
                for j in range(gw):
                    x = xc + j - gw / 2
                    if HASH(int(x), y, seed + g) > .95: continue
                    l = (.74 - .4 * u0) * (1 if front else .58) - k * .3 + (.12 if j == 0 else -.1 if j == gw - 1 else 0)
                    if (y + g * 3 + j * 2) % 4 == 0: l += .16          # leaves catching the light along the strand
                    l += (HASH(int(x), y // 2, seed) - .5) * .12
                    c.p(x, y, R[max(0, min(6, int(round(l * 6))))])
                if k > .9 and HASH(g, y, 4) > .5: c.p(xc + gw / 2, y + 1, R[1])   # a ragged hem
    curtain(False)
    trunk(c, cx, 60, G, 12, 16, OAK_BARK, flare=6, bark='oak', seed=seed)
    for (x1, y1) in ((cx - 30, 40), (cx + 30, 38), (cx, 24)): branch(c, cx, 74, x1, y1, 6, 3, OAK_BARK, seed)
    cl = [(cx + (HASH(i, seed, 1) - .5) * 88, 30 + HASH(i, seed, 2) * 20, 14 + HASH(i, seed, 3) * 7, HASH(i, seed, 4) * 8) for i in range(14)]
    blobs(c, cl, R, seed=seed, rough=.2, cell=3, leaf=.22)
    curtain(True)
    c.outline(); contact_band(c, cx - 12, cx + 12, G)
    ground_shadow(c, cx + 6, G + 1, 34)
    save(name, c, G, (-.38, -.3, .38, .1))


# ---------------------------------------------------------------- spruce: tall, narrow, tiers of drooping branches
def spruce(name, col, seed, W=70, H=134, tiers=8):
    c = C(W, H); G = H - 5; cx = W // 2; R = ramp(col, spread=.9)
    trunk(c, cx, G - 18, G, 6, 8, OAK_BARK, flare=3, seed=seed)
    top = 4; base = G - 12
    for k in range(tiers):
        t0 = k / tiers; y0 = top + (base - top) * t0 ** 1.05; y1 = top + (base - top) * ((k + 1.35) / tiers) ** 1.05
        hw = 4 + (W / 2 - 4) * ((k + 1) / tiers) ** .9 * (.9 + HASH(k, seed) * .12)
        for y in range(int(y0), int(min(base + 4, y1)) + 1):
            tt = max(0.0, (y - y0) / max(1, y1 - y0))
            half = hw * (.35 + .65 * tt ** .7)
            for x in range(int(cx - half) - 1, int(cx + half) + 2):
                d = (x + .5 - cx) / max(1, half)
                if abs(d) > 1: continue
                droop = abs(d) ** 2 * 3
                if y < y0 + droop: continue
                # each tier: lit on its left and top, the underside in its own shade, needles as short diagonal strokes
                l = .72 - .55 * d - .5 * tt ** 2 + (.2 if (x + y * (1 if d < 0 else -1)) % 3 == 0 else -.06) + (HASH(x, y, seed) - .5) * .14 - (.12 if k % 2 else 0)
                if tt > .72: l -= .45
                if abs(d) > .8 and HASH(x, y // 2, seed + k) > .7: continue   # ragged ends of the branches
                c.p(x, y, R[max(0, min(6, int(round(l * 6))))])
    c.outline(); contact_band(c, cx - 5, cx + 5, G)
    ground_shadow(c, cx + 5, G + 1, W * .32)
    save(name, c, G, (-.25, -.2, .25, .1))


# ---------------------------------------------------------------- apple: a rounded orchard tree, apples catching the light
def apple(name, col, seed, fruit=(186, 34, 30)):
    c = C(108, 116); G = 110; cx = 54; R = ramp(col)
    trunk(c, cx, 56, G, 9, 12, OAK_BARK, flare=5, bark='oak', seed=seed, lean=.04)
    for (x1, y1) in ((cx - 24, 46), (cx + 22, 44), (cx + 4, 30)): branch(c, cx, 66, x1, y1, 5, 3, OAK_BARK, seed)
    cl = [(cx + math.cos(i * 2.399) * 30 * math.sqrt((i + .5) / 16), 40 + math.sin(i * 2.399) * 18 * math.sqrt((i + .5) / 16), 13 + HASH(i, seed, 3) * 6, HASH(i, seed, 4) * 10) for i in range(16)]
    cl += [(cx - 30, 54, 13, 20), (cx + 30, 52, 13, 20), (cx, 60, 14, 24), (cx, 20, 15, 2)]
    Z = blobs(c, cl, R, seed=seed, rough=.16, cell=4)
    FR = ramp('#%02x%02x%02x' % fruit, 5, spread=.9)
    pts = sorted([(x, y) for (x, y), v in Z.items() if v[3] > .55 and HASH(x, y, seed + 7) > .985])
    placed = []
    for (x, y) in pts:
        if any(abs(x - a) < 6 and abs(y - b) < 6 for a, b in placed): continue
        placed.append((x, y))
        for dy in range(-1, 2):
            for dx in range(-1, 2):
                if abs(dx) + abs(dy) > 1 and HASH(dx, dy) > .3: continue
                c.p(x + dx, y + dy, FR[2 - dx - dy if dx + dy < 0 else 1 if dx + dy == 0 else 0])
        c.p(x - 1, y - 1, FR[4]); c.p(x, y + 2, R[0])
    c.outline(); contact_band(c, cx - 8, cx + 8, G)
    ground_shadow(c, cx + 5, G + 1, 26)
    for i in range(4):   # a few windfalls in the grass
        x = cx + (HASH(i, seed, 8) - .5) * 40; y = G + (HASH(i, seed, 9) - .5) * 4
        if c.get(int(x), int(y))[3] < 200: c.p(x, y, FR[2]); c.p(x + 1, y, FR[1]); c.p(x, y - 1, FR[3])
    save(name, c, G, (-.3, -.25, .3, .1))


# ---------------------------------------------------------------- the dead: a crooked oak, and a broken snag with shelf fungus
def deadoak(name, seed):
    c = C(116, 126); G = 120; cx = 58
    trunk(c, cx, 56, G, 11, 15, DEAD, flare=6, bark='dead', seed=seed, lean=.05)
    def grow(x, y, a, ln, w, d):
        if d == 0 or ln < 4: return
        x1, y1 = x + math.cos(a) * ln, y + math.sin(a) * ln
        branch(c, x, y, x1, y1, w, max(1, w * .62), DEAD, seed + d)
        for s in (-1, 1):
            grow(x1, y1, a + s * (.35 + HASH(d, s, seed) * .45) + (HASH(x1, y1, seed) - .5) * .3, ln * (.62 + HASH(d * s, seed) * .2), max(1, w * .62), d - 1)
    trunk_top = (cx + 2, 58)
    grow(*trunk_top, -math.pi / 2 - .5, 26, 8, 4); grow(*trunk_top, -math.pi / 2 + .45, 24, 7, 4); grow(cx, 72, -.25, 22, 5, 3); grow(cx - 2, 76, math.pi + .3, 20, 5, 3)
    c.outline(); contact_band(c, cx - 10, cx + 10, G)
    ground_shadow(c, cx + 6, G + 1, 24)
    save(name, c, G, (-.3, -.2, .3, .1))


def snag(name, seed):
    c = C(52, 114); G = 108; cx = 26
    trunk(c, cx, 18, G, 12, 15, GREY, flare=5, bark='dead', seed=seed)
    for y in range(12, 26):   # the broken top, splintered
        for x in range(int(cx - 6), int(cx + 7)):
            h = 12 + abs(math.sin(x * 1.7 + seed)) * 10 + HASH(x, seed) * 4
            if y < h: c.px[x, y] = (0, 0, 0, 0)
    for y in range(52, 64):   # a hollow
        for x in range(cx - 3, cx + 2):
            if ((x - cx + .5) / 3) ** 2 + ((y - 58) / 6) ** 2 < 1: c.p(x, y, (22, 16, 18) if y > 54 else (40, 32, 30))
    F = ramp('#c87a32', 5)
    for (fx, fy, fw) in ((cx + 6, 74, 6), (cx + 7, 84, 5), (cx - 9, 66, 5)):   # shelf fungus: little lit half-discs
        for j in range(3):
            for i in range(fw):
                if j == 2 and (i == 0 or i == fw - 1): continue
                c.p(fx + i - (fw if fx < cx else 0), fy + j, F[[4, 2, 0][j]] if 0 < i < fw - 1 or j else F[3])
    branch(c, cx + 5, 46, cx + 18, 34, 3, 1.2, GREY, seed)
    c.outline(); contact_band(c, cx - 8, cx + 8, G)
    ground_shadow(c, cx + 5, G + 1, 13)
    save(name, c, G, (-.25, -.2, .25, .1))


# ---------------------------------------------------------------- bushes
def bush(name, col, seed, W=52, H=42, berries=None, rough=.2, cell=3, low=1.0, spiky=False):
    c = C(W, H); G = H - 4; cx = W // 2; R = ramp(col)
    cl = [(cx + (HASH(i, seed, 1) - .5) * (W - 22), G - 10 - HASH(i, seed, 2) * (H - 26) * low, 9 + HASH(i, seed, 3) * 5, HASH(i, seed, 4) * 6 + (G - 10) * .2) for i in range(7)]
    cl += [(cx - W * .25, G - 8, 9, 14), (cx + W * .25, G - 8, 9, 14), (cx, G - 7, 10, 16)]
    Z = blobs(c, cl, R, seed=seed, rough=.34 if spiky else rough, cell=cell, leaf=.3 if spiky else .24)
    if berries:
        B = ramp(berries, 4, spread=.9); placed = []
        for (x, y), v in sorted(Z.items()):
            if v[3] < .45 or HASH(x, y, seed + 3) < .972 or any(abs(x - a) < 7 and abs(y - b) < 6 for a, b in placed): continue
            placed.append((x, y))
            for (dx, dy) in ((0, 0), (1, 0), (0, 1), (1, 1), (2, 1)):
                c.p(x + dx, y + dy, B[1] if dy else B[2])
            c.p(x, y, B[3])
    c.outline(); contact_band(c, 6, W - 6, G)
    ground_shadow(c, cx + 4, G + 1, W * .42, 2.6)
    save(name, c, G, (-.4, -.3, .4, .1))


def sumac(name, seed):
    """upright red fronds: each one a stem with paired leaflets, lit on the left"""
    c = C(50, 52); G = 48; cx = 25; R = ramp('#c43a22'); S = ramp('#6a3a2a', 5)
    fronds = sorted([((HASH(i, seed, 1) - .5) * 1.5, 26 + HASH(i, seed, 2) * 16, HASH(i, seed, 3)) for i in range(11)], key=lambda f: f[2])
    for (a, ln, dp) in fronds:
        x0, y0 = cx + a * 6, G - 2
        for t in range(int(ln)):
            k = t / ln; x = x0 + math.sin(a) * t * .9 + a * k * k * 10; y = y0 - math.cos(a * .6) * t
            c.p(x, y, S[2])
            if t > 5 and t % 2 == 0:
                lw = int(2 + 5 * math.sin(k * math.pi) ** .8)
                for side in (-1, 1):
                    for j in range(1, lw + 1):
                        l = .55 + dp * .3 - side * .2 - j / lw * .15 + (HASH(int(x) + side * j, int(y), seed) - .5) * .2
                        c.p(x + side * j, y + j * .45, R[max(0, min(6, int(round(l * 6))))]); c.p(x + side * j, y + j * .45 + 1, R[max(0, min(6, int(round((l - .12) * 6))))])
    c.outline(); contact_band(c, cx - 8, cx + 8, G)
    ground_shadow(c, cx + 3, G + 1, 14, 2.4)
    save(name, c, G, (-.3, -.2, .3, .1))


def fern(name, col, seed):
    c = C(46, 30); G = 27; cx = 23; R = ramp(col, spread=.85)
    for i in range(9):
        a = -math.pi / 2 + (i - 4) * .34 + (HASH(i, seed) - .5) * .2; ln = 13 + HASH(i, seed, 2) * 6; dp = abs(i - 4) / 4
        for t in range(int(ln)):
            k = t / ln; x = cx + math.cos(a) * t * 1.15; y = G - 1 + math.sin(a) * t + k * k * 9 * abs(math.cos(a))
            c.p(x, y, R[2])
            lw = int(1 + 3 * math.sin(k * math.pi) ** .9)
            for side in (-1, 1):
                for j in range(1, lw + 1):
                    l = .7 - dp * .35 - (side * .15) - j * .06 + (HASH(int(x), int(y), seed + i) - .5) * .2
                    c.p(x - math.sin(a) * j * side, y + math.cos(a) * j * side * .4 + j * .4, R[max(0, min(6, int(round(l * 6))))])
    c.outline(); ground_shadow(c, cx + 3, G + 1, 14, 2.2, 70)
    save(name, c, G, (0, 0, 0, 0))


def reeds(name, seed):
    c = C(32, 46); G = 43; cx = 16; R = ramp('#6e8a3a', spread=.85); B = ramp('#6a3e24', 5)
    blades = sorted([((HASH(i, seed) - .5) * 18, 22 + HASH(i, seed, 2) * 18, (HASH(i, seed, 3) - .5) * .5, HASH(i, seed, 4)) for i in range(14)], key=lambda b: b[3])
    for (x0, ln, bend, dp) in blades:
        for t in range(int(ln)):
            k = t / ln; x = cx + x0 + bend * t * k; y = G - t
            l = .45 + dp * .35 + (.15 if x0 < 0 else -.05) - k * .1
            c.p(x, y, R[max(0, min(6, int(round(l * 6))))])
            if k < .5: c.p(x + 1, y, R[max(0, min(6, int(round((l - .15) * 6))))])
        if dp > .55:   # a cattail head on the taller ones
            hx, hy = cx + x0 + bend * ln, G - ln
            for j in range(7):
                for i in (-1, 0, 1):
                    c.p(hx + i, hy + j + 2, B[[3, 2, 1][i + 1] if 0 < j < 6 else 2])
            c.p(hx, hy, R[3]); c.p(hx, hy + 1, R[3])
    c.outline(); ground_shadow(c, cx + 3, G + 1, 12, 2.2, 70)
    save(name, c, G, (0, 0, 0, 0))


oak('oak_russet', '#9a3e1c', 11); oak('oak_green', '#3f6a24', 12)
birch('birch_gold', '#d49a1c', 21); birch('birch_green', '#8a9a2c', 22)
willow('willow', '#6e8a2e', 31)
spruce('spruce_0', '#24504a', 41); spruce('spruce_1', '#2a5238', 42, W=60, H=112, tiers=7)
apple('apple_tree', '#4e7424', 51); apple('apple_gold', '#86862a', 52, fruit=(214, 170, 50))
deadoak('deadoak', 61); snag('snag', 62)
bush('holly', '#2f5a34', 71, berries='#d0302a'); bush('juniper', '#4c7a6a', 72, W=60, H=34, low=.5, spiky=True)
bush('elder', '#6a8a36', 73, berries='#3a2448'); sumac('sumac', 74)
fern('fern', '#b8862e', 81); fern('fern_green', '#5e8a34', 82); reeds('reeds', 91)

d = json.load(open('spr/lpc/objects.json')); d.update(SPRITES); json.dump(d, open('spr/lpc/objects.json', 'w'))
