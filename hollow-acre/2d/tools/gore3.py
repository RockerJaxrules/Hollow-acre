"""The people the Hollow takes at night, found in the morning, drawn by code with gore.py's helpers and ramps (lit from the
upper left, hue-shifted ramps: dark reds lean violet and wet highlights warm; contact shadows; dark outlines; no speckle).
Bodies are built as a small height field (each part a dome), so the light and the creases between parts come from one surface.
  g_p_hiker    a stranger face-down in the grass, a rucksack still on one arm, opened along the spine from collar to belt with the
               back folded out both ways, a long smear behind where they crawled; one hand dug into the dirt ahead of them
  g_p_lantern  a hand off at the wrist, still gripping the bail of a storm lantern lying on its side, the flame still bending up
  g_p_boots    a pair of work boots standing laced in the grass, the feet still in them, cut through above the socks; a survey
               stake with its pink flag, and the tape run out to nowhere
  g_p_coat     a long waxed coat hung on a fence post by its collar, buttoned to the chin and full, soaked through at every
               seam, fingertips showing at one cuff, dripping into the grass
  g_p_tree     a hunter sat against a dead tree, his rifle across his knees, his face taken off to the teeth, the eyes in his lap
  ..._t        the toned-down gore setting: what is left once the body has gone (a blood trail and the rucksack, the lantern alone,
               one empty boot, the coat empty and torn, a cap and the rifle under a dark stain on the bark)
Writes spr/lpc/obj/g_p_*.png and merges them into spr/lpc/objects.json. Run from the folder that holds spr/ (the scratchpad, or
hollow-acre/2d with tools/gore.py beside this file)."""
import json, math, os, sys
_here = os.path.dirname(os.path.abspath(__file__))
_src = open(os.path.join(_here, 'gore.py')).read()
exec(_src[:_src.index('# ---- the deer')])

DENIM = ramp('#3e4a66', spread=.8); JACKET = ramp('#5c5a3c', spread=.8); HAIR = ramp('#6e4e30', spread=.8); HAIRD = ramp('#3a2a24', spread=1.1)
LEATHER = ramp('#5e3c24', spread=.8); CANVAS = ramp('#8a4a2c', spread=.8); BRASS = ramp('#a2803e', spread=.7)
WAX = ramp('#4c4632', spread=.8); SOCK = ramp('#8a8276', spread=.6); BLAZE = ramp('#a85a2a', spread=.6)
DEAD = ramp('#b8988c', spread=.55); BARK = ramp('#6a5c4e', spread=.8); TAPE = ramp('#c8ac3a', spread=.6)
FLAG = ramp('#d0527a', spread=.6); TIN = ramp('#7a7a72', spread=.7); EYE = ramp('#e8e2d8', spread=.45)
GLOW = [(150, 70, 24), (196, 110, 34), (232, 160, 60), (250, 206, 110), (255, 238, 180), (255, 252, 230)]
SHADE = (24, 18, 22)   # contact shadow colour (alpha'd)


class F:
    """A height field: every part is a dome with a material; one light over the whole surface, creases where parts meet."""
    def __init__(s, W, Hh):
        s.W, s.H = W, Hh; s.h = [[None] * W for _ in range(Hh)]; s.m = [[None] * W for _ in range(Hh)]; s.pid = [[0] * W for _ in range(Hh)]; s.n = 0
    def put(s, x, y, h, mat, pid, over=False):
        if 0 <= x < s.W and 0 <= y < s.H and (over or s.h[y][x] is None or h >= s.h[y][x]): s.h[y][x] = h; s.m[y][x] = mat; s.pid[y][x] = pid
    def cap(s, x0, y0, x1, y1, r0, r1, mat, base=0., hs=1., over=False):
        s.n += 1; pid = s.n; dx, dy = x1 - x0, y1 - y0; L2 = dx * dx + dy * dy or 1e-6; R = max(r0, r1) + 1
        for y in range(int(min(y0, y1) - R), int(max(y0, y1) + R) + 1):
            for x in range(int(min(x0, x1) - R), int(max(x0, x1) + R) + 1):
                px, py = x + .5, y + .5; t = max(0, min(1, ((px - x0) * dx + (py - y0) * dy) / L2)); r = r0 + (r1 - r0) * t
                d = math.hypot(px - (x0 + dx * t), py - (y0 + dy * t))
                if d < r: s.put(x, y, base + hs * r * math.sqrt(1 - (d / r) ** 2), mat, pid, over)
        return pid
    def blob(s, cx, cy, rx, ry, mat, base=0., hs=1., rot=0., over=False):
        s.n += 1; pid = s.n; cr, sr = math.cos(rot), math.sin(rot); R = max(rx, ry) + 1
        for y in range(int(cy - R), int(cy + R) + 1):
            for x in range(int(cx - R), int(cx + R) + 1):
                ddx, ddy = x + .5 - cx, y + .5 - cy; u = (ddx * cr + ddy * sr) / rx; v = (-ddx * sr + ddy * cr) / ry; d = u * u + v * v
                if d < 1: s.put(x, y, base + hs * min(rx, ry) * math.sqrt(1 - d), mat, pid, over)
        return pid
    def poly(s, pts, mat, base=0., hs=1., over=False):
        """a flat-ish shape (cloth, a board): a polygon whose height rises a little toward its middle"""
        s.n += 1; pid = s.n; xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        inside = []
        for y in range(int(min(ys)) - 1, int(max(ys)) + 2):
            for x in range(int(min(xs)) - 1, int(max(xs)) + 2):
                px, py = x + .5, y + .5; c = False; j = len(pts) - 1
                for i in range(len(pts)):
                    xi, yi = pts[i]; xj, yj = pts[j]
                    if (yi > py) != (yj > py) and px < (xj - xi) * (py - yi) / (yj - yi) + xi: c = not c
                    j = i
                if c: inside.append((x, y))
        S_ = set(inside)
        for x, y in inside:   # distance to the edge, cheaply: how far until we leave the shape (4 directions)
            d = 0
            while d < 6 and all((x + ax * (d + 1), y + ay * (d + 1)) in S_ for ax, ay in ((1, 0), (-1, 0), (0, 1), (0, -1))): d += 1
            s.put(x, y, base + hs * math.sqrt(d + 1) * .9, mat, pid, over)
        return pid
    def hat(s, x, y):
        return s.h[y][x] if 0 <= x < s.W and 0 <= y < s.H else None
    def render(s, c, mats, crease=1.3, levels=(.34, .58, .8)):
        """shade every part from its normal into its ramp (indices 1..4; 0 is for creases and outlines, 5 for hand-placed glints)"""
        for y in range(s.H):
            for x in range(s.W):
                m = s.m[y][x]
                if m is None: continue
                h = s.h[y][x]; R = mats[m]
                def nb(ax, ay):
                    v = s.hat(x + ax, y + ay)
                    if v is None or s.m[y + ay][x + ax] is None: return h - 1.2
                    return v if abs(v - h) < 2.5 else h + max(-1.2, min(1.2, v - h))
                gx = (nb(1, 0) - nb(-1, 0)) / 2; gy = (nb(0, 1) - nb(0, -1)) / 2
                n = (-gx, -gy, 1.0); nl = math.sqrt(sum(v * v for v in n)); n = tuple(v / nl for v in n)
                l = max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) * .95 + .08
                i = 1 if l < levels[0] else 2 if l < levels[1] else 3 if l < levels[2] else 4
                # a crease: this pixel sits below a neighbour belonging to another part
                for ax, ay in ((-1, 0), (0, -1), (1, 0), (0, 1)):
                    v = s.hat(x + ax, y + ay)
                    if v is not None and s.pid[y + ay][x + ax] != s.pid[y][x] and v - h > crease: i = max(0, i - 2) if (ax, ay) in ((-1, 0), (0, -1)) else max(0, i - 1); break
                c.p(x, y, R[i])


def ground_shadow(c, cx, cy, rx, ry, a=110):
    """a soft solid contact shadow on the grass (only where nothing is drawn yet)"""
    for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2
            if d < 1 and 0 <= x < c.W and 0 <= y < c.H and c.px[x, y][3] == 0: c.p(x, y, SHADE, a if d < .6 else int(a * .7))


def drop_shadow(c, dx=1, dy=1, a=120):
    """the object's own shadow on the ground, pushed down and right"""
    src = [[c.px[x, y][3] > 200 for x in range(c.W)] for y in range(c.H)]
    for y in range(c.H):
        for x in range(c.W):
            sx_, sy_ = x - dx, y - dy
            if 0 <= sx_ < c.W and 0 <= sy_ < c.H and src[sy_][sx_] and c.px[x, y][3] == 0: c.p(x, y, SHADE, a)


def outline2(c, lit=None, dark=OUT, below=None):
    """one outline round the whole thing: near-black, a step lighter (the object's own dark) on the lit top-left"""
    a = [[c.px[x, y][3] > 200 for x in range(c.W)] for y in range(c.H)]; pts = []
    for y in range(c.H):
        for x in range(c.W):
            if a[y][x] or (below is not None and y > below): continue
            nb = [(dx, dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + dx < c.W and 0 <= y + dy < c.H and a[y + dy][x + dx]]
            if nb: pts.append((x, y, nb))
    for x, y, nb in pts:
        top_left = all(d in ((1, 0), (0, 1)) for d in nb)   # the object lies right of / below this pixel: we're on its lit side
        if top_left and lit is not None:
            src = c.px[x + nb[0][0], y + nb[0][1]]; col = tuple(int(v * .55) for v in src[:3])
        else: col = dark
        c.p(x, y, col)


def blood_pool(c, cx, cy, rx, ry, seed, glint=True, dry=False, lobes=(.2, .12)):
    """a pool: lobed, a dark rim, the body, a darker deep middle, one warm wet glint; dry pools go brown and matte"""
    R = [(44, 10, 18), (66, 18, 22), (82, 26, 24), (58, 16, 20)] if dry else [BLOOD[0], BLOOD[1], BLOOD[2], BLOOD[1]]
    for y in range(int(cy - ry) - 3, int(cy + ry) + 4):
        for x in range(int(cx - rx) - 3, int(cx + rx) + 4):
            ang = math.atan2((y + .5 - cy) / max(ry, .1), (x + .5 - cx) / max(rx, .1)); w = 1 + lobes[0] * math.sin(ang * 3 + seed) + lobes[1] * math.sin(ang * 5 + seed * 2.3)
            d = ((x + .5 - cx) / (rx * w)) ** 2 + ((y + .5 - cy) / (ry * w)) ** 2
            if d < 1: c.p(x, y, R[0] if d > .78 else R[2] if d > .3 else R[3])
    if glint and not dry:
        gx, gy = cx - rx * .4, cy - ry * .35; c.p(gx, gy, (226, 150, 132)); c.p(gx + 1, gy, (172, 70, 70)); c.p(gx - 1, gy, BLOOD[3])


def smear(c, x0, x1, cy, w0, w1, seed, dry_left=True):
    """a drag: streaks running along it, wide and wet at the body end (x1), thin and drying toward x0"""
    for x in range(int(x0), int(x1) + 1):
        f = (x - x0) / max(1, x1 - x0); w = w0 + (w1 - w0) * f; yc = cy + math.sin(x * .21 + seed) * .8
        for y in range(int(yc - w) - 1, int(yc + w) + 2):
            v = (y + .5 - yc) / w
            if abs(v) > 1: continue
            lane = int((v + 1) * 2.5 + seed) % 3
            gap = H(x // 3, lane, seed) < .22 * (1 - f) and abs(v) > .3   # the streaks break up toward the dry end
            if gap: continue
            col = BLOOD[0] if abs(v) > .72 else (BLOOD[1] if lane == 0 else BLOOD[2]) if f > .45 else ((70, 20, 24) if lane else (56, 14, 20))
            c.p(x, y, col)


def flame(c, x, y, h=4):
    """a teardrop flame standing up from (x, y): white heart low, yellow, orange tip"""
    for i in range(h):
        w = 1 if i >= h - 1 else 2 if i >= 1 else 2
        col = GLOW[5] if i == 0 else GLOW[4] if i == 1 else GLOW[3] if i < h - 1 else GLOW[2]
        for k in range(w): c.p(x + k - (w > 1) * .5, y - i, col)


SPR_OUT = {}
def done(name, c, ax, ay, foot=(0, 0, 0, 0)):
    save(name, c, ax, ay, foot)


# ============================== the hiker: face-down, torn open along the back, crawled here
def lit_rim(c, ramps):
    """a lit top rim on cloth so dark clothes don't sink into the grass: the top pixel of each run steps up to the ramp's light"""
    look = {}
    for R in ramps:
        for i in range(5): look[R[i]] = R[min(4, i + 2)]
    for y in range(1, c.H):
        for x in range(c.W):
            p_, q = c.px[x, y], c.px[x, y - 1]
            if p_[3] > 200 and q[3] < 120 and p_[:3] in look: c.p(x, y, look[p_[:3]])
def hiker(toned=False):
    W, Hh = 96, 40; c = C(W, Hh); cy = 16
    # the long smear behind, from where they started crawling (the left) to the body
    smear(c, 0, 42, cy + 1, .9, 4.8, 2.1)
    if toned:
        blood_pool(c, 50, cy + 2, 12, 4.6, 3.3)
        smear(c, 42, 62, cy + 1, 4.8, 2.4, 5.2)
    else:
        blood_pool(c, 54, cy + 5, 17, 6.8, 1.7)
    f = F(W, Hh)
    if not toned:
        # legs: jeans, a little apart; boots toes-down so we see heel and sole edge
        f.cap(40, cy - 2.4, 19, cy - 3.6, 3.5, 2.7, 'denim')
        f.cap(40, cy + 2.6, 20, cy + 4, 3.5, 2.7, 'denim')
        f.blob(16.4, cy - 3.8, 3.4, 2.3, 'leather', base=.6); f.blob(17, cy + 4.2, 3.4, 2.3, 'leather', base=.6)
        # the torso, the shoulders a little wider than the hips
        f.blob(50, cy, 11.4, 7, 'jacket', hs=.75); f.blob(58, cy, 5, 7.8, 'jacket', hs=.8)
        # the forward arm, reaching past the head, the hand dug into the dirt
        f.cap(59, cy - 6.6, 66, cy - 9.6, 2.6, 2.3, 'jacket', base=.5); f.cap(66, cy - 9.6, 74, cy - 10, 2.3, 2, 'jacket', base=.4)
        # the other arm, down along the side, palm up
        f.cap(58, cy + 6.8, 53, cy + 9.6, 2.5, 2.3, 'jacket', base=.4); f.cap(53, cy + 9.6, 47.5, cy + 9.8, 2.3, 2, 'jacket', base=.3)
        f.blob(45.4, cy + 9.8, 2.2, 1.6, 'dead', base=.2)
        # the neck, then the head turned on its cheek: dark hair over the back and top, the ear, the cheek and jaw on the grass
        f.cap(61.6, cy + .6, 64.4, cy + .6, 2.6, 2.6, 'dead', base=.6)
        f.blob(68.4, cy - 1, 5.4, 4.6, 'hair', base=1)
        f.blob(68.8, cy + 3, 4.2, 2.2, 'dead', base=1.6)
        f.blob(66.4, cy + 1.6, 1.4, 1.7, 'dead', base=3)
    # the rucksack, torn off and lying on its side a little way off: a body, a lighter flap, a side pocket
    rx0, ry0 = 79, 27
    f.poly([(rx0, ry0 + .6), (rx0 + 11, ry0), (rx0 + 12.4, ry0 + 2.6), (rx0 + 12, ry0 + 8.2), (rx0 + 1, ry0 + 9), (rx0 - .6, ry0 + 5.6)], 'canvas', base=.2, hs=.7)
    f.poly([(rx0, ry0 + .2), (rx0 + 11, ry0 - .4), (rx0 + 11.4, ry0 + 2.2), (rx0 + 5.6, ry0 + 3.6), (rx0 + .4, ry0 + 2.8)], 'canvasL', base=1.6, hs=.4)
    f.render(c, {'denim': DENIM, 'leather': LEATHER, 'jacket': JACKET, 'dead': DEAD, 'hair': HAIRD, 'canvas': CANVAS, 'canvasL': [CANVAS[1], CANVAS[2], CANVAS[3], CANVAS[4], CANVAS[5], CANVAS[5]]})
    # rucksack straps, the buckle, a seam; one strap torn through, trailing back toward the body
    for i in range(8): c.p(rx0 - .4 - i * 1, ry0 + 1.6 - i * .2, LEATHER[1] if i % 3 else LEATHER[2])
    c.p(rx0 + 5.6, ry0 + 4.2, BRASS[4]); c.p(rx0 + 5.6, ry0 + 5.2, BRASS[1])
    for x in range(rx0 + 1, rx0 + 12): c.p(x, ry0 + 7, CANVAS[1])
    for y in range(ry0 + 4, ry0 + 8): c.p(rx0 + 9, y, CANVAS[1])
    if not toned:
        # boots: a darker sole edge at the heel end, the heel block
        for y in range(-6, -1): c.p(13.4, cy + y, OUT); c.p(14.4, cy + y, LEATHER[1])
        for y in range(3, 7): c.p(14, cy + y, OUT); c.p(15, cy + y, LEATHER[1])
        for x in range(21, 40, 6): c.p(x, cy - 3.4, DENIM[1]); c.p(x + 1, cy + 3.6, DENIM[1])   # a fold or two in the jeans
        # the hand dug into the dirt: furrows behind the fingers, knuckles, nails
        for k in range(3):
            y = cy - 11.6 + k * 1.3
            for x in range(73, 80): c.p(x + k * .4, y, EARTH[1] if x < 77 else EARTH[0])
        f2 = F(W, Hh); f2.blob(76.6, cy - 10, 2.6, 1.9, 'dead', base=.3); f2.render(c, {'dead': DEAD})
        for k in range(3): c.p(78.8, cy - 11 + k * 1.1, DEAD[1]); c.p(79.8, cy - 11 + k * 1.1, EARTH[0])
        c.p(75.4, cy - 11, DEAD[4])
        # the back torn open, ragged, from the shoulder blade down the flank toward the hip: the spine along its upper lip, four
        # ribs fanning back from it across the dark at uneven gaps, the torn jacket and skin round the edge
        def top_(x): return cy - 2.2 - .9 * math.sin(x * .9) - .6 * math.sin(x * 2.3) - (1.2 if 50 < x < 55 else 0)
        def bot_(x): t = (x - 43) / 17; return cy + 1 + 3.6 * math.sin(math.pi * t) ** .8 + .8 * math.sin(x * 1.7) + .5 * math.sin(x * .6)
        hole = set()
        for x in range(43, 61):
            for y in range(int(top_(x)), int(bot_(x)) + 1):
                if c.px[x, y][3] > 200: hole.add((x, y))
        for x, y in hole:
            depth = (y - top_(x)) / max(1, bot_(x) - top_(x))
            c.p(x, y, BLOOD[0] if depth < .45 else MEAT[0] if depth < .8 else MEAT[1])   # dark under the far lip, lit low on the near wall
        for x in range(43, 61):   # the spine, along the upper lip
            y = int(top_(x)) + 1
            if (x, y) in hole: c.p(x, y, BONE[1] if x % 5 else BONE[2])
        for xs, l in ((46, 4), (50, 5), (55, 4), (58, 3)):   # ribs, unevenly apart, each a little steeper than the last
            y0 = int(top_(xs)) + 1
            for j in range(l):
                px_, py_ = xs - j * (1.1 - (xs - 46) * .05), y0 + 1 + j
                if (int(round(px_)), py_) in hole: c.p(px_, py_, BONE[3] if j == 0 else BONE[2] if j < 3 else BONE[1])
        edge = set()
        for x, y in hole:
            for ax, ay in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                q = (x + ax, y + ay)
                if q not in hole and 0 <= q[0] < W and 0 <= q[1] < Hh and c.px[q][3] > 200: edge.add((q, ay))
        for (x, y), ay in edge: c.p(x, y, MEAT[2] if ay > 0 and x % 3 else MEAT[1] if ay > 0 else BLOOD[1])   # the torn skin round the hole, a little lit on the near side
        for x, y in ((45, cy - 4), (49, cy - 5), (53, cy - 5), (57, cy - 4), (47, cy + 6), (52, cy + 7), (56, cy + 6)):   # the jacket torn back
            if c.px[x, y][3] > 200: c.p(x, y, JACKET[0])
        for x, y in ((47, cy + 2), (52, cy + 3), (56, cy + 2)): c.p(x, y, MEAT[5])   # wet
        # soaked round it, and runs off the flank into the pool
        for x, l in ((46, 3), (52, 4), (57, 2)):
            for k in range(l): c.p(x, cy + 7 + k, BLOOD[2] if k < l - 1 else BLOOD[3])
        for y in range(-4, 5): c.p(60.6, cy + y, BLOOD[0] if abs(y) < 3 else JACKET[0])   # the collar, dark and wet
        # the head: a lit crown, the hair parted in clumps, the ear's inner fold, the closed eye and the mouth on the grass
        for x, y in ((65, cy - 5), (66, cy - 5), (67, cy - 5.4), (64, cy - 4), (65, cy - 4)): c.p(x, y, HAIRD[4])
        for x, y in ((68, cy - 4), (69, cy - 3), (70, cy - 2), (71, cy - 1), (67, cy - 2), (68, cy - 1)): c.p(x, y, HAIRD[1])
        c.p(66.4, cy + 1.4, DEAD[0]); c.p(66.4, cy + 2.4, DEAD[1])
        c.p(70, cy + 2.6, DEAD[0]); c.p(71, cy + 2.6, DEAD[0]); c.p(72.4, cy + 4, (120, 60, 64)); c.p(73.4, cy + 4, BLOOD[1])
        for k in range(3): c.p(73.6 + k, cy + 5 + k * .4, BLOOD[2])   # from the mouth into the grass
        lit_rim(c, [JACKET])
    drop_shadow(c, 1, 1, 90)
    outline2(c, lit=True)
    done('g_p_hiker_t' if toned else 'g_p_hiker', c, 54, cy + 2)


# ============================== the lantern, still lit, the hand still on it
def lantern(toned=False):
    W, Hh = 50, 28; c = C(W, Hh); cy = 16
    if not toned: blood_pool(c, 39, cy + 4, 9, 3.6, 4.1)
    else:
        for k, (x, y) in enumerate(((30, 21), (33, 22), (36, 21.4), (39, 22.6))): c.p(x, y, BLOOD[2]); c.p(x + 1, y, BLOOD[1])
    ground_shadow(c, 19, cy + 5.6, 13, 2.6)
    f = F(W, Hh)
    # lying on its side: the fuel tank at the left, the globe, the cap and the chimney at the right
    f.blob(9, cy, 4.2, 5.4, 'tin', hs=.9)                     # the tank
    f.cap(13, cy, 21, cy, 4.6, 4.6, 'glow', hs=.8)            # the globe
    f.blob(23.6, cy, 2.4, 4.2, 'tin', base=.6)                # the cap
    f.cap(26, cy, 28, cy, 1.7, 1.5, 'tin', base=.4)            # the chimney
    f.render(c, {'tin': TIN, 'glow': GLOW})
    # the guard wires across the globe and the rims
    for x in (15, 19):
        for y in range(cy - 4, cy + 5): c.p(x, y, BRASS[2] if y > cy else BRASS[3])
    for y in range(cy - 5, cy + 6): c.p(12.4, y, TIN[1] if y > cy else TIN[4])
    # the flame, lying with its wick but bending up
    c.p(11.6, cy, GLOW[2]); c.p(12.6, cy, GLOW[3]); c.p(13.6, cy - 1, GLOW[5]); c.p(14.6, cy - 1, GLOW[5]); c.p(14.6, cy - 2, GLOW[4]); c.p(15.6, cy - 2, GLOW[4]); c.p(15.6, cy - 3, GLOW[3])
    c.p(18, cy - 3, (255, 255, 240)); c.p(19, cy - 3, (255, 248, 220))   # the glass shine
    # the bail: a wire loop from the tank's shoulders round past the chimney
    pts = [(10, cy - 5.6), (16, cy - 7.2), (24, cy - 7), (31, cy - 4.2), (33.4, cy), (31, cy + 4.2), (24, cy + 6.6)]
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        for i in range(9): t = i / 8; c.p(ax + (bx - ax) * t, ay + (by - ay) * t, IRON[2])
    if not toned:
        # the hand lying on the grass round the bail, palm down: knuckles along the wire, the thumb round the near side, the
        # back of the hand and the wrist running off to the right, where it was cut through
        f = F(W, Hh); f.blob(35.8, cy - .4, 3.4, 3, 'dead', base=1.2); f.cap(37, cy - .2, 40.4, cy + .2, 2.4, 2.2, 'dead', base=1)
        f.blob(33.6, cy + 2.8, 1.8, 1.2, 'dead', base=1.6)
        f.render(c, {'dead': DEAD})
        for k, y in enumerate((cy - 2.6, cy - 1.2, cy + .2, cy + 1.6)):   # four knuckles on the wire, the gaps between the fingers
            c.p(32.6, y, DEAD[4] if k < 2 else DEAD[3]); c.p(33.6, y, DEAD[3] if k < 2 else DEAD[2]); c.p(31.6, y, DEAD[1])
            if k < 3: c.p(32.6, y + .7, DEAD[0]); c.p(33.6, y + .7, DEAD[1]); c.p(31.6, y + .7, OUT)
        c.p(32.6, cy + 2.8, DEAD[1]); c.p(34.6, cy + 3.4, DEAD[0])   # the thumb's tip and its crease
        c.p(35.4, cy - 2.4, DEAD[4]); c.p(36.4, cy - 2.4, DEAD[3])
        for k in range(3): c.p(35 + k, cy + .6 - k * .9, DEAD[1])   # a tendon
        c.p(34.6, cy - 1.6, (210, 190, 140)); c.p(34.6, cy - .6, (150, 120, 80))   # a ring on the third finger
        # the wrist cut through: a rim of skin, the flesh, two pale bones
        for y in range(-3, 4):
            for x in range(-1, 2):
                d = (x / 1.5) ** 2 + (y / 2.7) ** 2
                if d < 1: c.p(42 + x, cy + y, DEAD[1] if d > .8 else MEAT[3] if d < .35 else MEAT[2] if d < .6 else MEAT[1])
        c.p(42, cy - 1, BONE[4]); c.p(42, cy + 1, BONE[3]); c.p(41, cy, MEAT[5])
        for k in range(3): c.p(43, cy + 2 + k, BLOOD[2] if k < 2 else BLOOD[3])
    else:
        for k in range(3): c.p(30 + k, cy - 4.8 + k * .3, BLOOD[1])   # blood on the handle
    drop_shadow(c, 1, 1, 80)
    outline2(c, lit=True)
    done('g_p_lantern_t' if toned else 'g_p_lantern', c, 22, cy + 3)


# ============================== the boots, standing, the feet still in them
def boot(f, c, bx, by, mats_only=False):
    f.cap(bx, by - 2, bx, by - 10, 3.4, 3.2, 'leather', hs=.8)            # the shaft
    f.blob(bx + .4, by - 1.2, 4, 2.6, 'leather', base=.2, hs=.8)          # the toe box, toward you
def boots(toned=False):
    W, Hh = 66, 36; c = C(W, Hh); gy = 30
    if not toned: blood_pool(c, 20, gy + 1, 13, 3.6, 2.4)
    # the tape, run out from the stake across the grass, and its curl at the end
    for x in range(41, 62):
        y = gy + 1 + math.sin(x * .3) * .6; c.p(x, y, TAPE[3] if x % 9 else TAPE[1])
    for x, y in ((62, gy + 1), (63, gy), (63, gy - 1), (62, gy - 1)): c.p(x, y, TAPE[2])
    ground_shadow(c, 20, gy + 1.2, 11, 2.4)
    f = F(W, Hh)
    if not toned:
        boot(f, c, 15, gy); boot(f, c, 25, gy)
        f.render(c, {'leather': LEATHER})
        for bx in (15, 25):
            # the sole and the welt
            for x in range(-4, 5): c.p(bx + x + .4, gy + 1.4, OUT if abs(x) > 2 else (40, 26, 20)); c.p(bx + x + .4, gy + .4, LEATHER[1])
            # the laces up the front, crossing
            for y in range(gy - 10, gy - 1, 2): c.p(bx - .6, y, CLOTH[2]); c.p(bx + .6, y + 1, CLOTH[1])
            for y in range(gy - 10, gy - 1, 2): c.p(bx + .6, y, LEATHER[0]); c.p(bx - .6, y + 1, LEATHER[0])
            c.p(bx - 2.4, gy - 7, LEATHER[4]); c.p(bx - 2.4, gy - 6, LEATHER[4])
            # the sock folded over the top, then the cut: skin, flesh, the shin bone with its marrow
            for x in range(-3, 4):
                c.p(bx + x, gy - 12, SOCK[3] if x < 0 else SOCK[2]); c.p(bx + x, gy - 13, SOCK[4] if x < 1 else SOCK[3])
            for y in range(-2, 2):
                for x in range(-3, 4):
                    d = (x / 3.4) ** 2 + ((y + .3) / 1.7) ** 2
                    if d < 1: c.p(bx + x, gy - 15 + y, DEAD[3] if d > .72 else MEAT[2] if d > .3 else MEAT[3])
            c.p(bx - 1, gy - 15.6, BONE[4]); c.p(bx, gy - 15.6, BONE[3]); c.p(bx - .5, gy - 15, (120, 40, 50)); c.p(bx + 2, gy - 15, BONE[2])
            c.p(bx - 2, gy - 16, MEAT[5])
            # runs down over the sock and the leather
            for x, l in ((bx - 2, 5), (bx + 1, 8), (bx + 3, 3)):
                for k in range(l): c.p(x, gy - 14 + k, BLOOD[1] if k < l - 1 else BLOOD[2])
    else:
        # one boot on its side, empty, its laces loose
        f.cap(10, gy - 2, 20, gy - 2.6, 3.2, 3, 'leather', hs=.8); f.blob(22, gy - 1.6, 3, 2.4, 'leather', base=.2, hs=.8)
        f.render(c, {'leather': LEATHER})
        for y in range(-3, 3):
            for x in range(-1, 2):
                if (x / 1.6) ** 2 + (y / 3) ** 2 < 1: c.p(8.6 + x, gy - 2.3 + y, (26, 16, 14))   # the opening
        for x in range(10, 25): c.p(x, gy + 1, OUT if x > 11 else LEATHER[1])
        for x, y in ((14, gy - 5), (16, gy - 4.4), (18, gy - 5), (17, gy - 6), (19, gy - 7)): c.p(x, y, CLOTH[2])
        for x, y in ((12, gy + 1.6), (13, gy + 2)): c.p(x, y, BLOOD[1])
    # the survey stake, a pink flag tied round its top
    for y in range(gy - 22, gy + 1):
        c.p(39, y, WOOD[4] if y > gy - 21 else WOOD[3]); c.p(40, y, WOOD[2]); c.p(41, y, WOOD[1] if y > gy - 20 else WOOD[2])
    c.p(40, gy - 23, WOOD[3])
    for k in range(9):   # the flag tails, the wind in them
        x = 42 + k; y = gy - 20 + math.sin(k * .9) * 1.2 + k * .35
        c.p(x, y, FLAG[4] if k < 5 else FLAG[3]); c.p(x, y + 1, FLAG[2])
        if k < 6: c.p(x - .5, y + 3 + math.sin(k) * .8, FLAG[2])
    for y in (gy - 21, gy - 20): c.p(39, y, FLAG[4]); c.p(40, y, FLAG[3]); c.p(41, y, FLAG[2])
    drop_shadow(c, 1, 1, 80)
    outline2(c, lit=True)
    done('g_p_boots_t' if toned else 'g_p_boots', c, 22, gy, foot=(-.4, -.15, .4, 0))


# ============================== the coat on the fence post, full
def coat(toned=False):
    W, Hh = 40, 60; c = C(W, Hh); gy = 55; px0 = 18
    if not toned: blood_pool(c, 20, gy + 1, 10, 3, 6.2)
    ground_shadow(c, 21, gy + 1, 7, 2)
    # the post: weathered, cut on a slant at the top, grain lines
    for y in range(3, gy + 1):
        for x in range(px0, px0 + 5):
            k = x - px0; col = WOOD[4] if k == 0 else WOOD[3] if k < 2 else WOOD[2] if k < 4 else WOOD[1]
            if y < 4 + (x - px0) * .4: continue
            c.p(x, y, col)
    for y in range(8, gy, 7): c.p(px0 + 2, y, WOOD[1]); c.p(px0 + 2, y + 1, WOOD[1]); c.p(px0 + 3, y + 3, WOOD[1])
    for x in range(px0, px0 + 5): c.p(x, 3 + (x - px0) * .4, WOOD[5] if x < px0 + 3 else WOOD[4])
    f = F(W, Hh)
    if not toned:
        f.blob(20, 14, 8.6, 4.6, 'wax', hs=.9)                 # the shoulders
        f.blob(20, 27, 9.8, 11, 'wax', hs=.9)                  # the body, too full
        f.blob(25.6, 34, 5.4, 6, 'wax', base=.8, hs=.9)        # something pushing out low on the right: a knee
        f.blob(15, 23, 4.6, 6, 'wax', base=.5, hs=.8)          # an elbow, high on the left
        f.poly([(11, 36), (29, 36), (28.6, 42), (24, 43.6), (19, 42.6), (13.4, 43.4), (11.4, 41)], 'wax', base=.4, hs=.6)   # the skirt, sagging
        f.cap(10.6, 15.6, 8.4, 34, 3, 2.6, 'wax', base=1.2)    # the sleeves, hanging heavy
        f.cap(29.4, 15.6, 31, 33, 3, 2.6, 'wax', base=1.2)
        f.blob(20, 9.6, 5.4, 2.4, 'wax', base=1.6, hs=.7)       # the collar turned up round the post
        f.render(c, {'wax': WAX})
        # the post still runs up through the collar
        for y in range(4, 10):
            for x in range(px0, px0 + 5): c.p(x, y, WOOD[4] if x == px0 else WOOD[3] if x < px0 + 3 else WOOD[1])
        for x in range(px0, px0 + 5): c.p(x, 3 + (x - px0) * .4, WOOD[5] if x < px0 + 3 else WOOD[4])
        c.p(px0 - 1, 10, WAX[0]); c.p(px0 + 5, 10, WAX[0])
        # buttoned to the chin, the cloth pulled tight between the buttons
        for i, y in enumerate((13, 18, 23, 28, 33)):
            c.p(20, y, BRASS[4]); c.p(21, y, BRASS[2])
            if i: c.p(19, y - 2, WAX[0]); c.p(22, y - 2, WAX[0]); c.p(20, y - 2, WAX[1]); c.p(21, y - 2, WAX[1])
        for y in range(12, 42): c.p(20.6 if y > 13 else 20, y, WAX[1]) if (y % 5) not in (3,) else None
        # soaked through: the side seams, under the arms, the hem; dark and wet, a glint
        for y in range(18, 42):
            for x in (12, 13, 27, 28):
                if H(x, y, 7) < .8 and (y > 22 or x in (13, 27)): c.p(x, y, BLOOD[1] if y < 34 else BLOOD[0])
        for x in range(12, 29):
            for y in range(39, 44):
                if c.px[x, y][3] > 200 and y > 40 - math.sin(x * .7) * 1.2: c.p(x, y, BLOOD[1] if y < 42 else BLOOD[0])
        c.p(14, 40, BLOOD[4]); c.p(25, 41, BLOOD[4]); c.p(26, 30, BLOOD[3]); c.p(13, 26, BLOOD[3])
        # the cuffs: fingertips showing at the left one, the right one dripping
        for x, y in ((7.4, 36), (8.4, 36.6), (9.6, 36.4)): c.p(x, y, DEAD[3]); c.p(x, y + 1, DEAD[1])
        for y in range(33, 36): c.p(30, y, BLOOD[1]); c.p(31, y, BLOOD[0]); c.p(32, y, BLOOD[1])
        for x, y0, l in ((31, 37, 2), (31, 41, 1), (16, 45, 2), (23, 46, 2), (18, 49, 1), (25, 50, 1)):
            for k in range(l): c.p(x, y0 + k, BLOOD[2])
    else:
        # empty and limp, torn open down the back, the lining showing, a dark stain at the hem
        f.blob(20, 13.6, 7.4, 3.6, 'wax', hs=.9)
        f.poly([(12.6, 14), (27.4, 14), (26.6, 42), (21.6, 44), (16.6, 43.2), (13.4, 42)], 'wax', base=.3, hs=.7)
        f.cap(12.4, 15, 11.4, 32, 2.4, 2, 'wax', base=1); f.cap(27.6, 15, 28.4, 31, 2.4, 2, 'wax', base=1)
        f.blob(20, 9.8, 4.6, 2.2, 'wax', base=1.4, hs=.7)
        f.render(c, {'wax': WAX})
        for y in range(4, 10):
            for x in range(px0, px0 + 5): c.p(x, y, WOOD[4] if x == px0 else WOOD[3] if x < px0 + 3 else WOOD[1])
        for x in range(px0, px0 + 5): c.p(x, 3 + (x - px0) * .4, WOOD[5] if x < px0 + 3 else WOOD[4])
        for y in range(18, 40):   # the tear: a ragged split, the paler lining inside it
            w = 1.4 + math.sin(y * .5) * .6 + (y - 18) * .04
            for x in range(int(20 - w), int(20 + w) + 1): c.p(x + math.sin(y * .35) * .8, y, SACK[1] if abs(x - 20) < w - .5 else WAX[0])
        for x in range(14, 27):
            for y in range(36, 44):
                if c.px[x, y][3] > 200 and y > 38 - math.sin(x * .8): c.p(x, y, (58, 18, 22) if y < 41 else (44, 12, 18))
        for y in (12, 17): c.p(20, y, BRASS[3])
    lit_rim(c, [WAX])
    drop_shadow(c, 1, 1, 70)
    outline2(c, lit=True)
    done('g_p_coat_t' if toned else 'g_p_coat', c, 20, gy, foot=(-.15, -.1, .15, 0))


# ============================== the hunter against the dead tree
def snag(c, gy, cx=28):
    """a dead tree snapped off above head height: grey-brown bark in long grooves, a lit left edge, splintered pale wood at the
    break, a branch stub, roots spread into the grass"""
    f = F(c.W, c.H)
    f.cap(cx, gy - 8, cx + .8, 16, 9, 7, 'bark', hs=.9); f.poly([(cx - 9, gy - 8), (cx + 9, gy - 8), (cx + 10, gy), (cx - 10, gy)], 'bark', base=3, hs=.6)
    f.blob(cx - 9, gy - 2, 4.6, 2.4, 'bark', base=.2); f.blob(cx + 9.6, gy - 2.2, 5, 2.4, 'bark', base=.2)
    f.cap(cx + 6.6, 27, cx + 13, 21, 2, 1.3, 'bark', base=2.4)   # a branch stub
    f.render(c, {'bark': BARK})
    for gx, ph in ((-6, .3), (-3, 1.7), (0, .9), (3, 2.4), (6, 1.1)):   # the grooves, long and wandering, darker on the shaded side
        for y in range(15, gy - 1):
            x = cx + gx * (1 + (y - 16) * .004) + math.sin(y * .17 + ph) * .8
            if 0 <= int(x) < c.W and c.px[int(x), y][3] > 200 and not (gx < -3 and y % 11 == 5): c.p(x, y, BARK[1] if gx < 0 else BARK[0])
    for y in range(17, gy - 3): c.p(cx - 8.4 + (gy - y) * .03, y, BARK[4])   # the lit edge
    for y in range(20, gy - 6, 9): c.p(cx - 7, y, BARK[5])
    # the break: jagged, splinters of pale wood standing up
    top = [(cx - 8, 16), (cx - 6, 11), (cx - 3, 14), (cx - 1, 6), (cx + 1, 12), (cx + 3, 8), (cx + 5, 13), (cx + 7, 10), (cx + 8, 16)]
    for (ax, ay), (bx, by) in zip(top, top[1:]):
        for x in range(int(ax), int(bx) + 1):
            t = (x - ax) / max(1, bx - ax); yt = ay + (by - ay) * t
            for y in range(int(yt), 18):
                if c.px[x, y][3] > 200 and y > yt + 3: continue
                c.p(x, y, FAT[2] if y < yt + 1.5 else FAT[0] if y < yt + 3 else BARK[2])
    for x, y in ((cx - 6, 12), (cx - 1, 7), (cx + 3, 9), (cx + 7, 11)): c.p(x, y, FAT[4])
    c.p(cx + 3, 31, BARK[0]); c.p(cx + 4, 31, BARK[0]); c.p(cx + 3, 32, (20, 14, 14)); c.p(cx + 2, 30, BARK[3])   # a knot
def tree(toned=False):
    W, Hh = 60, 76; c = C(W, Hh); gy = 70; cx = 28
    if not toned: blood_pool(c, cx + 1, gy + 3, 16, 3.8, 1.2)
    ground_shadow(c, cx + 2, gy + 1, 16, 3, a=80)
    snag(c, gy, cx)
    if toned:
        # a dark stain on the bark at sitting height, run down into the roots; the cap and the rifle left at the foot
        def stain(x, y):
            if not (0 <= x < W and 0 <= y < Hh) or c.px[x, y][3] < 200: return
            r, g, b_, _ = c.px[x, y]; lum = (r + g + b_) / 3
            c.p(x, y, (96, 34, 38) if lum > 130 else (72, 24, 30) if lum > 95 else (48, 16, 22))
        for y in range(36, 52):   # where his back was: a broad smear, ragged at the edges, the grooves still showing through
            w = 4.6 + math.sin(y * .7) * .9 - max(0, y - 46) * .5; o = math.sin(y * .3) * .6
            for x in range(int(cx + o - w), int(cx + o + w) + 1): stain(x, y)
        for x0, l in ((cx - 3, 14), (cx, 18), (cx + 2, 11), (cx + 4, 15)):   # and the runs down the bark into the roots
            for k in range(l): stain(x0 + int(math.sin(k * .4 + x0) * .6), 50 + k)
        for x in range(cx - 15, cx + 13):   # the rifle on the ground
            y = gy + 2.6 - (x - cx + 15) * .05
            c.p(x, y, WOOD[4] if x < cx - 4 else IRON[3]); c.p(x, y + 1, WOOD[1] if x < cx - 4 else IRON[0])
        f = F(W, Hh); f.blob(cx + 11, gy, 3.4, 2.4, 'blaze', base=.4); f.blob(cx + 8.6, gy + 1.2, 2.6, 1.1, 'blaze', base=.2); f.render(c, {'blaze': BLAZE})
        drop_shadow(c, 1, 1, 70); outline2(c, lit=True)
        done('g_p_tree_t', c, cx, gy, foot=(-.3, -.15, .3, 0)); return
    f = F(W, Hh); base = 4   # in front of the trunk
    # legs stretched out toward you, knees up a little; boots soles-on
    f.cap(cx - 3, 57, cx - 5, 64, 3.4, 3.1, 'denim', base=base); f.cap(cx + 4, 57, cx + 6, 64, 3.4, 3.1, 'denim', base=base)
    f.blob(cx - 5.4, 66.4, 3.2, 2.6, 'leather', base=base + 1); f.blob(cx + 6.4, 66.4, 3.2, 2.6, 'leather', base=base + 1)
    # the body, slumped against the bark; the arms dropped at the sides, the hands palm-up in the grass
    f.blob(cx + .5, 49, 7.8, 8.6, 'jacket', base=base, hs=.8)
    f.cap(cx - 6.6, 44, cx - 9.4, 56, 2.7, 2.4, 'jacket', base=base + 1); f.cap(cx + 7.6, 44, cx + 10.4, 56, 2.7, 2.4, 'jacket', base=base + 1)
    f.blob(cx - 9.8, 58.2, 2.3, 1.8, 'dead', base=base + .4); f.blob(cx + 11, 58.2, 2.3, 1.8, 'dead', base=base + .4)
    # the head, fallen a little to one side against the trunk; ears; the cap
    f.blob(cx - .4, 36.4, 6.6, 6.4, 'dead', base=base + 2)
    f.blob(cx - 6.8, 37.6, 1.4, 2, 'dead', base=base + 2.6); f.blob(cx + 6, 37.6, 1.4, 2, 'dead', base=base + 2.6)
    f.blob(cx - .6, 30.6, 6.6, 3.4, 'blaze', base=base + 4, hs=.8)
    f.render(c, {'denim': DENIM, 'leather': LEATHER, 'jacket': JACKET, 'dead': DEAD, 'blaze': BLAZE})
    # hair under the cap over the ears
    for y in (33, 34): c.p(cx - 6.4, y, HAIR[2]); c.p(cx + 5.4, y, HAIR[1])
    # the cap's peak pointing at you: a lit half-moon, its shadow where the brow was
    for x in range(-5, 5): c.p(cx - .6 + x, 33.4, BLAZE[4] if x < 0 else BLAZE[3]); c.p(cx - .6 + x, 34.4, BLAZE[1])
    c.p(cx - 6, 33.4, BLAZE[2]); c.p(cx + 4.4, 33.4, BLAZE[1])
    # the face taken off to the bone: a ragged rim of skin, the muscle under it, two empty sockets, the nose a hole, the teeth
    for y in range(35, 44):
        for x in range(-5, 5):
            d = ((x + .5) / 4.6) ** 2 + ((y - 39.2) / 4.4) ** 2 * (1 + .12 * math.sin(x * 2.1))
            if d < 1: c.p(cx - .4 + x, y, MEAT[2] if d < .4 and x < 0 else MEAT[1] if d < .82 else MEAT[0])
    for x in (-3, 1):   # the sockets: dark, deep, a wet lip on the lower rim
        for dx, dy in ((0, 0), (1, 0), (0, 1), (1, 1)): c.p(cx - .4 + x + dx, 36.6 + dy, OUT if dy else BLOOD[0])
        c.p(cx - .4 + x, 38.6, MEAT[3])
    c.p(cx - .4, 39.4, OUT); c.p(cx - 1.4, 39.4, BLOOD[0]); c.p(cx - .4, 40.4, BLOOD[0]); c.p(cx - 1.4, 40.4, OUT)   # the nose
    for x in range(-3, 3):   # the teeth, every one, the gums gone back from them
        c.p(cx - .4 + x, 41.6, BONE[4] if x < 0 else BONE[3]); c.p(cx - .4 + x, 42.6, BONE[3] if x < 0 else BONE[2])
    c.p(cx - .4 - 4, 42, BLOOD[0]); c.p(cx - .4 + 3, 42, BLOOD[0]); c.p(cx - 1.4, 42.6, BONE[1]); c.p(cx + .6, 42.6, BONE[1])
    c.p(cx - 3.4, 38.4, MEAT[5]); c.p(cx + 2.6, 37.2, MEAT[4]); c.p(cx - 2.4, 35.6, MEAT[3])   # wet
    # it all ran down the front: a bib of blood from the chin to the belt, the runs going on past it
    # the jacket soaked through: it keeps its folds and its light, only every tone is now a tone of blood; the runs carry on below
    JI = {JACKET[i]: i for i in range(6)}
    for y in range(44, 56):
        w = 3 + (y - 44) * .24 + math.sin(y * .9) * .8
        for x in range(int(cx - w), int(cx + w) + 1):
            px_ = c.px[x, y]
            if px_[3] > 200 and px_[:3] in JI: c.p(x, y, BLOOD[max(0, min(4, JI[px_[:3]] + (1 if y < 48 else 0) - (1 if y > 52 else 0)))])
    for x, y0, l in ((cx - 5, 53, 4), (cx - 1, 55, 2), (cx + 3, 54, 3), (cx + 6, 52, 5)):
        for k in range(l):
            if c.px[x, y0 + k][3] > 200: c.p(x, y0 + k, BLOOD[1] if k < l - 1 else BLOOD[2])
    for x, y0, l in ((cx - 2, 45, 5), (cx + 1, 46, 3)):   # wet runs catching the light
        for k in range(l): c.p(x, y0 + k, BLOOD[4] if k < 2 else BLOOD[3])
    # the eyes in his lap, side by side, looking up at you; a thread of red trailing from each
    for ex in (cx - 2, cx + 3):
        for k in range(3): c.p(ex + .6 + k * .6, 58 + k * .5, MEAT[1] if k < 2 else BLOOD[1])
    f = F(W, Hh); f.blob(cx - 2, 56.6, 1.8, 1.6, 'eye', base=base + 4); f.blob(cx + 3, 56.6, 1.8, 1.6, 'eye', base=base + 4); f.render(c, {'eye': EYE})
    for ex in (cx - 2, cx + 3): c.p(ex - .4, 55.8, (40, 56, 66)); c.p(ex + .6, 55.8, (64, 84, 92)); c.p(ex - 1.4, 56.6, EYE[5])
    # the rifle across his knees, every round still in it
    for x in range(cx - 14, cx + 16):
        y = 61.6 + (x - cx) * .1
        if x < cx - 3: c.p(x, y, WOOD[4] if x < cx - 8 else WOOD[3]); c.p(x, y + 1, WOOD[2]); c.p(x, y + 2 if x < cx - 9 else y + 1, WOOD[1])
        else: c.p(x, y, IRON[4] if x < cx + 3 else IRON[3]); c.p(x, y + 1, IRON[0])
    c.p(cx - 2, 62.6, IRON[1]); c.p(cx - 1, 63.6, IRON[1]); c.p(cx - 2, 63.6, IRON[1])   # the trigger guard
    # bootsoles toward you, a heel and the tread
    for bx in (cx - 5.4, cx + 6.4):
        for x in range(-2, 3):
            for y in (67, 68): c.p(bx + x, y, (40, 30, 26) if abs(x) < 2 else OUT)
        c.p(bx - 1, 67, LEATHER[2]); c.p(bx + 1, 68, LEATHER[1])
    lit_rim(c, [JACKET])
    drop_shadow(c, 1, 1, 70)
    outline2(c, lit=True)
    done('g_p_tree', c, cx, gy, foot=(-.3, -.15, .3, 0))


for fn in (hiker, lantern, boots, coat, tree):
    fn(False); fn(True)
d = json.load(open('spr/lpc/objects.json')); d.update(SPR); json.dump(d, open('spr/lpc/objects.json', 'w')); print('ok', list(SPR))
