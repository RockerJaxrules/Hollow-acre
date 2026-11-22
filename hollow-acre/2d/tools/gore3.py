"""The people the Hollow takes at night, found in the morning, drawn by code with gore.py's helpers and ramps (lit from the
upper left, hue-shifted ramps: dark reds lean violet and wet highlights warm; contact shadows; dark outlines; no speckle).
The bodies are the townsfolk's own model: px/strangers3.py renders five strangers with chibi3.js (the same generator and
run.py path as everyone in town) and this file lays their frames out, turned only in 90-degree steps, then draws the gore
over them by hand at that scale.
  g_p_hiker    a hitchhiker face-down in the grass (the back frame laid flat), opened along the spine from collar to belt, the
               back folded out both ways, a rucksack torn off one arm, a long smear behind where they crawled
  g_p_lantern  a fist off at the wrist (the chibi's own hand and forearm), still gripping the bail of a storm lantern lying on
               its side, the flame still bending up
  g_p_boots    the surveyor's shoes standing in the grass, the feet still in them, cut through just above the socks; a survey
               stake with its pink flag, and the tape run out to nowhere
  g_p_coat     the long coat (the chibi's coat from the shoulders to the hem) hung on a fence post by its collar, buttoned and
               full, soaked through at every seam, fingertips at one cuff, dripping into the grass
  g_p_tree     the hunter in his orange cap sat against a dead tree (the sitting frame), his rifle across his knees, his face
               taken off to the teeth inside the chibi head, his two big eyes in his lap
  ..._t        the toned-down gore setting: what is left once the body has gone (a blood trail and the rucksack, the lantern alone,
               one of his shoes, the coat empty and torn, his cap and the rifle under a dark stain on the bark)
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


def outline2(c, lit=None, dark=OUT, below=None, skip=()):
    """one outline round the whole thing: near-black, a step lighter (the object's own dark) on the lit top-left. Pixels in
    skip already are an outline (a chibi frame's own), so nothing is drawn round them a second time"""
    a = [[c.px[x, y][3] > 200 for x in range(c.W)] for y in range(c.H)]; pts = []
    for y in range(c.H):
        for x in range(c.W):
            if a[y][x] or (below is not None and y > below): continue
            nb = [(dx, dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + dx < c.W and 0 <= y + dy < c.H and a[y + dy][x + dx] and (x + dx, y + dy) not in skip]
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


def lit_rim(c, ramps):
    """a lit top rim on cloth so dark clothes don't sink into the grass: the top pixel of each run steps up to the ramp's light"""
    look = {}
    for R in ramps:
        for i in range(5): look[R[i]] = R[min(4, i + 2)]
    for y in range(1, c.H):
        for x in range(c.W):
            p_, q = c.px[x, y], c.px[x, y - 1]
            if p_[3] > 200 and q[3] < 120 and p_[:3] in look: c.p(x, y, look[p_[:3]])


# ============================== the strangers' bodies: frames of the town's own chibi model (px/strangers3.py renders them with
# chibi3.js through run.py), laid out here in 90-degree steps only; their outline is the model's own, the gore goes on by hand
STR = os.path.join(_here, 'px', 'strangers'); _SH = {}
ROW = dict(walkN=0, idleN=8, idleW=9, idleS=10, idleE=11, sitS=27)
def frame(n, row, f=0):
    if n not in _SH: _SH[n] = Image.open(os.path.join(STR, f'str_{n}.png')).convert('RGBA')
    return _SH[n].crop((f * 48, ROW[row] * 64, f * 48 + 48, ROW[row] * 64 + 64))
def turn(im, how):
    """90-degree steps only. 'T' is a quarter turn and a mirror together, so the top-left light stays top-left"""
    T = Image.Transpose
    return im if how is None else im.transpose({'T': T.TRANSPOSE, 'R': T.ROTATE_270, 'L': T.ROTATE_90, 'F': T.FLIP_LEFT_RIGHT}[how])
def lum(p): return .3 * p[0] + .59 * p[1] + .11 * p[2]
def skin(p): return p[3] > 127 and p[0] > p[1] > p[2] and p[0] - p[2] > 34 and lum(p) > 80
def soak(c, x, y, wet=0):
    """blood over cloth or skin keeps its light: each tone becomes the blood tone of the same rank"""
    p_ = c.px[x, y] if 0 <= x < c.W and 0 <= y < c.H else (0, 0, 0, 0)
    if p_[3] < 200: return
    l = lum(p_); i = 0 if l < 34 else 1 if l < 62 else 2 if l < 100 else 3 if l < 150 else 4
    c.p(x, y, BLOOD[max(0, min(4, i + wet))])
class Body:
    """a canvas that takes chibi frames; it remembers which pixels are the frame's own outline (skip them in outline2)"""
    def __init__(s, c): s.c = c; s.rim = set(); s.own = set()
    def paste(s, im, x, y, box=None, how=None):
        a = im.load(); W_, H_ = im.size; m = Image.new('L', im.size, 0); mp = m.load()
        for v in range(H_):
            for u in range(W_):
                if a[u, v][3] > 127 and any(not (0 <= u + du < W_ and 0 <= v + dv < H_) or a[u + du, v + dv][3] < 128 for du, dv in ((1, 0), (-1, 0), (0, 1), (0, -1))): mp[u, v] = 255
        if box: im = im.crop(box); m = m.crop(box)
        im = turn(im, how); m = turn(m, how); a = im.load(); mp = m.load()
        for v in range(im.height):
            for u in range(im.width):
                if a[u, v][3] > 127 and 0 <= x + u < s.c.W and 0 <= y + v < s.c.H:
                    s.c.px[x + u, y + v] = a[u, v][:3] + (255,); s.own.add((x + u, y + v))
                    if mp[u, v]: s.rim.add((x + u, y + v))
                    else: s.rim.discard((x + u, y + v))
    def erase(s, pts):
        """take pixels off (a hand); the model's outline left hanging round them goes too, so the outline pass redraws the edge"""
        pts = set(pts)
        for q in pts: s.c.px[q] = (0, 0, 0, 0); s.own.discard(q); s.rim.discard(q)
        for (x, y) in list(s.rim):
            nb = [(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))]
            if any(q in pts for q in nb) and not any(q in s.own and q not in s.rim for q in nb):
                s.c.px[x, y] = (0, 0, 0, 0); s.own.discard((x, y)); s.rim.discard((x, y))
    def finish(s, name, ax, ay, foot=(0, 0, 0, 0), sh=90):
        drop_shadow(s.c, 1, 1, sh); outline2(s.c, lit=True, skip=s.rim); done(name, s.c, ax, ay, foot)
def mirrored(c, fn):
    """draw with fn on a spare canvas and lay it down mirrored (the smear runs the other way)"""
    t = C(c.W, c.H); fn(t); c.im.alpha_composite(t.im.transpose(Image.Transpose.FLIP_LEFT_RIGHT))


# ============================== the hitchhiker: face-down (the back frame laid flat), opened along the spine, crawled here
def rucksack(c, x0, y0):
    """lying on its side, torn off at the strap: a body, a lighter flap, a buckle, a seam"""
    f = F(c.W, c.H)
    f.poly([(x0, y0 + .6), (x0 + 9, y0), (x0 + 10, y0 + 2.2), (x0 + 9.6, y0 + 6.8), (x0 + .8, y0 + 7.4), (x0 - .4, y0 + 4.6)], 'canvas', base=.2, hs=.7)
    f.poly([(x0, y0 + .2), (x0 + 9, y0 - .3), (x0 + 9.4, y0 + 2), (x0 + 4.6, y0 + 3.2), (x0 + .4, y0 + 2.4)], 'canvasL', base=1.6, hs=.4)
    f.render(c, {'canvas': CANVAS, 'canvasL': [CANVAS[1], CANVAS[2], CANVAS[3], CANVAS[4], CANVAS[5], CANVAS[5]]})
    c.p(x0 + 4.6, y0 + 3.8, BRASS[4]); c.p(x0 + 4.6, y0 + 4.8, BRASS[1])
    for x in range(int(x0) + 1, int(x0) + 10): c.p(x, y0 + 6, CANVAS[1])
DRY = [(30, 16, 18), (38, 20, 20), (46, 24, 22), (54, 28, 24), (62, 32, 28)]
def dry_blood(c):
    """the toned-down blood: dark and dull, low against the grass (a stain, not a wound)"""
    for y in range(c.H):
        for x in range(c.W):
            p_ = c.px[x, y]
            if p_[3] > 0 and p_[0] > p_[1] * 1.5 and p_[0] > p_[2] * 1.2:
                l = lum(p_); c.p(x, y, DRY[0 if l < 24 else 1 if l < 34 else 2 if l < 46 else 3 if l < 62 else 4], p_[3])
def hiker(toned=False):
    W, Hh = 80, 42; c = C(W, Hh); B = Body(c); cy = 21; ox, oy = -12, cy - 24
    # the smear from the right, where they came from, to the feet: short, wide and wet at the body end
    mirrored(c, lambda t: smear(t, W - 1 - 74, W - 1 - 47, cy + 1, 1.6, 5.4, 2.1))
    if toned:
        blood_pool(c, 28, cy + 1, 21, 6.4, 3.3, lobes=(.12, .08), glint=False)   # a dark patch the size of a person
        dry_blood(c); rucksack(c, 36, 29); outline2(c, lit=True); drop_shadow(c, 1, 1, 90)
        done('g_p_hiker_t', c, 30, cy + 2); return
    blood_pool(c, 33, cy + 7, 15, 5.6, 1.7)
    rucksack(c, 41, 3)
    for i in range(6): c.p(40.6 - i * .9, 9 + i * .7, LEATHER[1] if i % 3 else LEATHER[2])   # its strap, torn through, back to the arm
    # the back frame laid flat for the body; the head is the side frame's (eyes shut), laid the same way, so he lies on his cheek:
    # the ear, the cheek and the jaw show, the dark hair a step off the olive jacket
    B.paste(frame('hiker', 'walkN'), ox + 40, oy, box=(0, 40, 48, 64), how='T')
    B.paste(frame('hiker', 'idleE', 3), ox, oy + 1, box=(0, 0, 48, 40), how='T')
    # the back torn open along the spine from the collar (x 28) to the belt (x 38): the upper lip runs nearly straight with the
    # spine along it, the lower lip hangs ragged and deep; dark inside, never a lens with a pale row down it
    TOP = {28: -2, 29: -3, 30: -3, 31: -3, 32: -4, 33: -3, 34: -3, 35: -3, 36: -2, 37: -2, 38: -1}
    BOT = {28: 0, 29: 2, 30: 3, 31: 4, 32: 3, 33: 4, 34: 4, 35: 2, 36: 3, 37: 1, 38: 0}
    hole = set()
    for x in TOP:
        for y in range(cy + TOP[x], cy + BOT[x] + 1):
            if (x, y) in B.own and (x, y) not in B.rim: hole.add((x, y))
    for x, y in hole:
        d = (y - cy - TOP[x]) / max(1, BOT[x] - TOP[x])
        c.p(x, y, OUT if d < .3 else BLOOD[0] if d < .55 else MEAT[0] if d < .85 else MEAT[1])
    for x in TOP:   # the spine along the upper lip, two knuckles catching the light
        if (x, cy + TOP[x] + 1) in hole and x < 38: c.p(x, cy + TOP[x] + 1, BONE[3] if x in (30, 35) else BONE[1])
    for x0, l in ((31, 3), (34, 2)):   # two ribs hanging from it, apart unevenly, bending toward the hips
        for j in range(l):
            q = (x0 + (1 if j >= 2 else 0), cy + TOP[x0] + 2 + j)
            if q in hole: c.p(q[0], q[1], BONE[2] if j == 0 else BONE[1])
    for x in TOP:   # the lips: dark above; below, the torn jacket turned out, wet; one fleck of light on the near wall
        q = (x, cy + TOP[x] - 1)
        if q in B.own and q not in B.rim: c.p(q[0], q[1], BLOOD[0] if x % 3 else JACKET[0])
        q = (x, cy + BOT[x] + 1)
        if q in B.own and q not in B.rim: soak(c, q[0], q[1], -1)
    c.p(31, cy + 3, MEAT[2]); c.p(33, cy + 3, MEAT[5])
    for y in range(cy - 2, cy + 3):   # the collar soaked dark
        if (28, y) in B.own and (28, y) not in B.rim: soak(c, 28, y)
    for x, l in ((31, 5), (36, 6)):   # runs off the flank, over the arm, into the pool
        y0 = cy + BOT[x] + 2
        for k in range(l):
            if (x, y0 + k) in B.own and (x, y0 + k) not in B.rim: soak(c, x, y0 + k, 1 if k < 2 else 0)
    B.finish('g_p_hiker', 33, cy + 3)


# ============================== the lantern, still lit, the fist still on it
def lantern_body(c, cy, toned):
    f = F(c.W, c.H)
    # lying on its side: the chimney at the left, the cap, the globe, the fuel tank at the right
    f.blob(33, cy, 3.6, 4.6, 'tin', hs=.9)
    f.cap(22.6, cy, 28.6, cy, 4, 4, 'glow', hs=.8)
    f.blob(20.4, cy, 2, 3.6, 'tin', base=.6)
    f.cap(16.8, cy, 18.4, cy, 1.4, 1.3, 'tin', base=.4)
    f.render(c, {'tin': TIN, 'glow': GLOW})
    for x in (24, 27):   # the guard wires: two, mid brass
        for y in range(cy - 3, cy + 4): c.p(x, y, BRASS[2] if y > cy else BRASS[3])
    for y in range(cy - 4, cy + 5): c.p(29.4, y, TIN[1] if y > cy else TIN[4])
    # the flame on its wick at the tank end, bending up
    c.p(28.4, cy, GLOW[2]); c.p(27.4, cy, GLOW[3]); c.p(26.4, cy - 1, GLOW[5]); c.p(25.4, cy - 1, GLOW[5]); c.p(25.4, cy - 2, GLOW[4]); c.p(24.4, cy - 2, GLOW[4]); c.p(24.4, cy - 3, GLOW[3])
    c.p(23, cy - 3, (255, 255, 240)); c.p(22, cy - 2, (255, 248, 220))   # the glass shine, top left
    # the bail: from the tank's shoulders round past the chimney
    pts = [(31.4, cy - 4.6), (26, cy - 6.4), (19, cy - 6), (14, cy - 3.4), (12.6, cy), (14, cy + 3.4), (19, cy + 5.4)]
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        for i in range(9): t = i / 8; c.p(ax + (bx - ax) * t, ay + (by - ay) * t, IRON[2])
def lantern(toned=False):
    W, Hh = 42, 24; c = C(W, Hh); B = Body(c); cy = 12
    if toned:
        for x, y in ((8, 17), (10, 18), (12, 17.4), (6, 18.6)): c.p(x, y, BLOOD[2]); c.p(x + 1, y, BLOOD[1])
    else: blood_pool(c, 4.6, cy + 4.4, 4.2, 1.8, 4.1)
    ground_shadow(c, 26, cy + 4.6, 10, 2.2)
    lantern_body(c, cy, toned)
    if toned:
        for k in range(3): c.p(13 + k * .4, cy - 2.4 + k, BLOOD[1])   # the handle sticky
        drop_shadow(c, 1, 1, 80); outline2(c, lit=True); done('g_p_lantern_t', c, 25, cy + 4); return
    # the chibi's own wrist and fist (the front frame's arm on the lit side, the forearm's last rows and the hand), laid flat:
    # the wrist at the left, cut through; the fist closed round the bail
    hx = 8; B.paste(frame('lantern', 'idleS'), hx, cy - 2, box=(14, 48, 18, 54), how='T')
    sk = frame('lantern', 'idleS').load(); LIT, MID, SH, CR = sk[15, 48][:3], sk[16, 48][:3], sk[15, 52][:3], sk[17, 48][:3]
    # the knuckles, white round the wire: two bumps on the fist's end and one standing proud, the crease between them
    for (x, y, col) in ((hx + 4, cy - 1, LIT), (hx + 4, cy, MID), (hx + 4, cy + 1, SH), (hx + 5, cy - 1, LIT), (hx + 5, cy, CR), (hx + 5, cy + 1, MID), (hx + 6, cy - 1, MID)):
        c.p(x, y, col); B.rim.discard((x, y)); B.own.add((x, y))
    for (x, y) in ((hx + 6, cy - 2), (hx + 6, cy - 3), (hx + 6, cy + 2), (hx + 6, cy + 3)): c.p(x, y, IRON[2])   # the wire going in under the fingers
    # the stump: a cut face of its own, the skin's rim lit, the flesh, the bone in the middle, darker toward the ground
    for (x, y, col) in ((hx, cy - 1, MEAT[2]), (hx, cy, BONE[4]), (hx, cy + 1, MEAT[1]), (hx - 1, cy - 1, MEAT[1]), (hx - 1, cy, MEAT[0]), (hx - 1, cy + 1, BLOOD[0])):
        c.p(x, y, col); B.rim.discard((x, y)); B.own.add((x, y))
    for x, y in ((hx - 1, cy + 2), (hx - 2, cy + 3)): c.p(x, y, BLOOD[2])   # a trickle into the pool
    B.finish('g_p_lantern', 25, cy + 4, sh=80)


# ============================== the shoes, standing, the feet still in them
def stake(c, x, gy, h=17):
    """the survey stake, a pink flag tied round its top"""
    for y in range(gy - h, gy + 1):
        c.p(x, y, WOOD[4] if y > gy - h + 1 else WOOD[3]); c.p(x + 1, y, WOOD[2]); c.p(x + 2, y, WOOD[1] if y > gy - h + 2 else WOOD[2])
    c.p(x + 1, gy - h - 1, WOOD[3])
    for k in range(7):
        xx = x + 3 + k; y = gy - h + 2 + math.sin(k * .9) * 1.1 + k * .35
        c.p(xx, y, FLAG[4] if k < 4 else FLAG[3]); c.p(xx, y + 1, FLAG[2])
    for y in (gy - h + 1, gy - h + 2): c.p(x, y, FLAG[4]); c.p(x + 1, y, FLAG[3]); c.p(x + 2, y, FLAG[2])
def boots(toned=False):
    W, Hh = 46, 26; c = C(W, Hh); B = Body(c); gy = 21
    for x in range(26, 43):   # the tape, run out from the stake across the grass, and its curl at the end
        y = gy + 1 + math.sin(x * .3) * .6; c.p(x, y, TAPE[3] if x % 7 else TAPE[1])
    for x, y in ((43, gy + 1), (44, gy), (44, gy - 1), (43, gy - 1)): c.p(x, y, TAPE[2])
    if not toned: blood_pool(c, 12, gy + 1, 10, 2.8, 2.4)
    ground_shadow(c, 12, gy + 1, 8, 2)
    stake(c, 24, gy)
    if toned:
        # one of his shoes, empty, still laced: the side frame's shoe and the top of its sock; the opening dark, the laces pale
        sx, sy = 4, gy - 6; B.paste(frame('surveyor', 'idleW'), sx, sy, box=(17, 55, 29, 62))
        for x in range(sx + 3, sx + 7):
            for y in (sy + 1, sy + 2):
                if (x, y) in B.own and (x, y) not in B.rim: c.p(x, y, (26, 16, 14) if y == sy + 2 or x in (sx + 4, sx + 5) else SOCK[2])
        for x, y in ((sx + 2, sy + 3), (sx + 3, sy + 3), (sx + 1, sy + 4)): c.p(x, y, CLOTH[3]) if (x, y) in B.own and (x, y) not in B.rim else None
        for x, y in ((sx + 7, gy + 2), (sx + 8, gy + 2.4)): c.p(x, y, BLOOD[1])
        B.finish('g_p_boots_t', 16, gy, foot=(-.3, -.1, .3, 0), sh=80); return
    # the shoes and the stubby lower legs (the front frame from just above the socks down), cut through
    x0, y0 = 1, gy - 8
    B.paste(frame('surveyor', 'idleS'), x0, y0, box=(16, 53, 32, 62))
    for lx in (x0 + 2, x0 + 8):   # each leg's cut: the skin's lit rim, the flesh, the shin bone with its marrow
        row = [c.px[lx + u, y0] for u in range(6)]
        for u in range(6):
            q = (lx + u, y0)
            if q in B.own and q not in B.rim: c.p(q[0], q[1], MEAT[2] if u in (1, 2) else MEAT[1])
        c.p(lx + 2, y0, BONE[4]); c.p(lx + 3, y0, BONE[2])
        for u in range(1, 5):   # the far lip above it, darker
            c.p(lx + u, y0 - 1, DEAD[1] if u < 3 else DEAD[0])
        c.p(lx + 1, y0 - 1, MEAT[3])
    for x, l in ((x0 + 3, 4), (x0 + 6, 2), (x0 + 10, 5), (x0 + 12, 2)):   # runs down the shins and over the socks
        for k in range(l):
            q = (x, y0 + 1 + k)
            if q in B.own and q not in B.rim: soak(c, q[0], q[1], 1 if k < 1 else 0)
    B.finish('g_p_boots', 16, gy, foot=(-.3, -.1, .3, 0), sh=80)


# ============================== the coat on the fence post
def post(c, px0, top, gy):
    for y in range(top, gy + 1):
        for x in range(px0, px0 + 4):
            k = x - px0; col = WOOD[4] if k == 0 else WOOD[3] if k < 2 else WOOD[2] if k < 3 else WOOD[1]
            if y < top + (x - px0) * .4: continue
            c.p(x, y, col)
    for y in range(top + 6, gy, 6): c.p(px0 + 2, y, WOOD[1]); c.p(px0 + 2, y + 1, WOOD[1])
    for x in range(px0, px0 + 4): c.p(x, top + (x - px0) * .4, WOOD[5] if x < px0 + 2 else WOOD[4])
def coat(toned=False):
    W, Hh = 30, 42; c = C(W, Hh); B = Body(c); gy = 37; px0 = 13
    if not toned: blood_pool(c, 15, gy + 1, 8, 2.4, 6.2)
    ground_shadow(c, 16, gy + 1, 6, 1.8)
    post(c, px0, 3, gy)
    # the coat from the shoulders to the hem, the head and the legs left out; the post comes up through the collar
    x0, y0 = 2, 8
    if not toned:
        B.paste(frame('coat', 'idleS'), x0, y0, box=(11, 39, 37, 58))
        # the right hand off: that cuff hangs empty and drips; fingertips stay at the left one
        B.erase([(x, y) for x in range(x0 + 19, x0 + 27) for y in range(y0 + 8, y0 + 16) if (x, y) in B.own and skin(c.px[x, y])])
    else:
        B.paste(frame('coat', 'idleN'), x0, y0, box=(11, 39, 37, 58))
        B.erase([(x, y) for x in list(range(x0 - 1, x0 + 7)) + list(range(x0 + 19, x0 + 27)) for y in range(y0 + 8, y0 + 16) if (x, y) in B.own and skin(c.px[x, y])])
    for y in range(y0 - 5, y0 + 2):   # the post still runs up through the collar
        for x in range(px0, px0 + 4): c.p(x, y, WOOD[4] if x == px0 else WOOD[3] if x < px0 + 2 else WOOD[1]); B.own.discard((x, y)); B.rim.discard((x, y))
    for x in range(px0, px0 + 4): c.p(x, y0 - 5, WOOD[5] if x < px0 + 2 else WOOD[4])
    def inside(x, y): return (x, y) in B.own and (x, y) not in B.rim
    if not toned:
        for y in range(y0 + 2, y0 + 12, 3):   # buttoned to the chin
            c.p(x0 + 13, y, BRASS[4]); c.p(x0 + 14, y, BRASS[2])
        # soaked through at every seam: down the sides, under the arms, the hem; it keeps its folds
        for x, ya, yb in ((x0 + 7, y0 + 4, y0 + 9), (x0 + 8, y0 + 3, y0 + 7), (x0 + 18, y0 + 3, y0 + 8), (x0 + 19, y0 + 4, y0 + 11)):   # under the arms
            for y in range(ya, yb):
                if inside(x, y): soak(c, x, y, 1 if y < ya + 2 else 0)
        for x in range(x0, x0 + 27):   # the hem
            for y in range(y0 + 15, y0 + 19):
                if inside(x, y) and y > y0 + 16.4 - math.sin(x * .7) * 1.1: soak(c, x, y)
        for x, ya, l in ((x0 + 10, y0 + 12, 4), (x0 + 16, y0 + 10, 6)):   # runs down from the seams
            for k in range(l):
                if inside(x, ya + k): soak(c, x, ya + k, 1 if k < 2 else 0)
        c.p(x0 + 8, y0 + 4, BLOOD[4]); c.p(x0 + 18, y0 + 4, BLOOD[4])   # wet
        for x in range(x0 + 20, x0 + 25):   # the empty right cuff, dark inside
            if (x, y0 + 13) in B.own or (x, y0 + 12) in B.own: pass
        for x, y1, l in ((x0 + 20, y0 + 13, 2), (x0 + 20, y0 + 17, 1), (x0 + 10, y0 + 20, 2), (x0 + 16, y0 + 21, 2), (x0 + 13, y0 + 24, 1)):   # dripping
            for k in range(l): c.p(x, y1 + k, BLOOD[2])
    else:
        for y in range(y0 + 2, y0 + 18):   # torn open down the back: a ragged split, the paler lining inside
            w = 1 + math.sin(y * .6) * .5 + (y - y0) * .04; xc = x0 + 13 + math.sin(y * .4) * .7
            for x in range(int(xc - w), int(xc + w) + 1):
                if inside(x, y): c.p(x, y, SACK[1] if abs(x - xc) < w - .4 else WAX[0])
        for x in range(x0, x0 + 27):   # stiff and dark at the hem
            for y in range(y0 + 13, y0 + 19):
                if inside(x, y) and y > y0 + 15 - math.sin(x * .8): soak(c, x, y, -1)
    B.finish('g_p_coat_t' if toned else 'g_p_coat', 15, gy, foot=(-.15, -.1, .15, 0), sh=70)


# ============================== the hunter against the dead tree
def snag(c, gy, cx, top, r0=11, r1=9):
    """a dead tree snapped off above head height: grey-brown bark in long grooves, a lit left edge, splintered pale wood at
    the break, a branch stub, roots spread into the grass"""
    f = F(c.W, c.H)
    f.cap(cx, gy - 6, cx + .6, top, r0, r1, 'bark', hs=.9); f.poly([(cx - r0, gy - 6), (cx + r0, gy - 6), (cx + r0 + 1, gy), (cx - r0 - 1, gy)], 'bark', base=3, hs=.6)
    f.blob(cx - r0, gy - 1.6, 4.4, 2.2, 'bark', base=.2); f.blob(cx + r0 + .6, gy - 1.8, 4.6, 2.2, 'bark', base=.2)
    f.cap(cx + r1 - 2, top + 10, cx + r1 + 4, top + 5, 1.8, 1.2, 'bark', base=2.4)   # a branch stub
    f.render(c, {'bark': BARK})
    for y in range(0, top + 1):   # the break, not a rounded top
        for x in range(c.W): c.px[x, y] = (0, 0, 0, 0)
    for gx, ph in ((-7, .3), (-3.5, 1.7), (0, .9), (3.5, 2.4), (7, 1.1)):   # the grooves, long and wandering
        for y in range(top + 1, gy - 1):
            x = cx + gx * r1 / 9 * (1 + (y - top) * .006) + math.sin(y * .17 + ph) * .7
            if 0 <= int(x) < c.W and c.px[int(x), y][3] > 200 and not (gx < -3 and y % 11 == 5): c.p(x, y, BARK[1] if gx < 0 else BARK[0])
    for y in range(top + 1, gy - 3): c.p(cx - r1 + .6 - (y - top) * (r0 - r1) / max(1, gy - top), y, BARK[4])   # the lit edge
    # the break: tall splinters standing up from the snapped trunk, bark on their sides, pale torn wood at their tips
    zs = [(-r1, 1), (-r1 + 2, -6), (-r1 + 4, -2), (-2, -9), (0, -3), (2, -7), (4, -1), (6, -5), (r1 - 1, 1)]
    pts = [(cx + a, top + b) for a, b in zs]
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        for x in range(int(ax), int(bx) + 1):
            t = (x - ax) / max(1, bx - ax); yt = ay + (by - ay) * t
            u = (x - cx + r1) / (2 * r1)
            for y in range(int(round(yt)), top + 3):
                c.p(x, y, FAT[3] if y < yt + 1 else FAT[1] if y < yt + 2.5 else BARK[3] if u < .3 else BARK[2] if u < .7 else BARK[1])
    for a, b in ((-r1 + 2, -6), (-2, -9), (2, -7), (6, -5)): c.p(cx + a, top + b, FAT[4])   # the tips catch the light
def tree(toned=False):
    W, Hh = 50, 74; c = C(W, Hh); B = Body(c); gy = 68; cx = 24
    if not toned: blood_pool(c, cx + 1, gy + 2, 14, 3.4, 1.2)
    ground_shadow(c, cx + 2, gy + 1, 15, 2.6, a=80)
    snag(c, gy, cx, 17)
    if toned:
        def stain(x, y):
            if not (0 <= x < W and 0 <= y < Hh) or c.px[x, y][3] < 200: return
            l = lum(c.px[x, y]); c.p(x, y, (96, 34, 38) if l > 120 else (72, 24, 30) if l > 85 else (48, 16, 22))
        for y in range(34, 56):   # where his back was, from his head down: a broad smear, the grooves showing through
            w = 6 + math.sin(y * .7) * .9 - max(0, y - 50) * .6; o = math.sin(y * .3) * .6
            for x in range(int(cx + o - w), int(cx + o + w) + 1): stain(x, y)
        for x0, l in ((cx - 4, 12), (cx - 1, 14), (cx + 2, 10), (cx + 5, 13)):   # and the runs down into the roots
            for k in range(l): stain(x0 + int(math.sin(k * .4 + x0) * .6), 54 + k)
        for x in range(cx - 14, cx + 12):   # the rifle on the ground
            y = gy + 2.4 - (x - cx + 14) * .05
            c.p(x, y, WOOD[4] if x < cx - 4 else IRON[3]); c.p(x, y + 1, WOOD[1] if x < cx - 4 else IRON[0])
        cap = frame('hunter_cap', 'idleW'); bb = cap.getbbox()   # his cap, the model's own, dropped at the foot of the tree
        B.paste(cap, W - 2 - (bb[2] - bb[0]), gy + 2 - (bb[3] - bb[1]), box=bb)
        B.finish('g_p_tree_t', cx, gy, foot=(-.3, -.15, .3, 0), sh=70); return
    # the sitting frame, against the bark; its feet on the ground line
    fx, fy = cx - 24, gy - 61
    B.paste(frame('hunter', 'sitS'), fx, fy)
    own = lambda x, y: (x, y) in B.own and (x, y) not in B.rim
    # the face taken off inside the chibi head: every face pixel (skin, eyes, mouth) below the cap's shadow, in from the cheeks
    sk = frame('hunter', 'sitS').load()
    face = set()
    for y in range(28, 42):
        for x in range(8, 41):
            p_ = sk[x, y]
            if p_[3] < 200: continue
            r_, g_, b_ = p_[:3]
            if (r_ > 150 and r_ > b_ + 20) or (b_ > r_ and b_ > 90) or (r_ > 225 and g_ > 220): face.add((fx + x, fy + y))
    eyes = []
    for (x, y) in sorted(face):
        p_ = sk[x - fx, y - fy]
        if p_[2] > p_[0] and p_[2] > 90: eyes.append((x, y, p_[:3]))
    xs = [q[0] for q in face]; ys = [q[1] for q in face]; fx0, fx1, fy0, fy1 = min(xs), max(xs), min(ys), max(ys)
    for (x, y) in face:
        edge = any((x + dx, y + dy) not in face for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        u = (x - fx0) / max(1, fx1 - fx0)
        if edge and (x in (fx0, fx1) or y == fy1): continue   # a ragged rim of skin left at the cheeks and the jaw
        c.p(x, y, MEAT[2] if u < .35 and y < fy0 + 5 else MEAT[1] if u < .7 else MEAT[0])
    # the sockets where the big eyes were, the nose a hole, the teeth bared where the mouth was
    ex = sorted(set(q[0] for q in eyes)); ey = min(q[1] for q in eyes)
    for x in ex:
        for y in (ey - 1, ey, ey + 1): c.p(x, y, OUT if y > ey - 1 else BLOOD[0])
    for x in (fx0 + 3, fx1 - 3):   # the muscle runs down from the cheekbones to the jaw
        for y in range(ey + 2, ey + 5): c.p(x, y, MEAT[0])
    mx = (fx0 + fx1) // 2; c.p(mx, ey + 3, OUT); c.p(mx + 1, ey + 3, BLOOD[0])
    for x in range(mx - 3, mx + 4): c.p(x, ey + 4, BLOOD[0]); c.p(x, ey + 5, BONE[4] if x < mx else BONE[3]); c.p(x, ey + 6, BONE[2] if x < mx else BONE[1])
    for x in (mx - 1, mx + 2): c.p(x, ey + 6, BONE[0])   # the gaps between the teeth
    c.p(mx - 4, ey + 5, BLOOD[0]); c.p(mx + 4, ey + 5, BLOOD[0])
    c.p(fx0 + 2, fy0 + 1, MEAT[4]); c.p(fx1 - 3, ey + 3, MEAT[5])   # wet
    # it all ran down his front: the shirt and the jacket soaked from the chin to the belt, keeping their folds
    for y in range(fy1 + 1, fy1 + 12):
        for x in range(mx - 6, mx + 8):
            if own(x, y) and (lum(c.px[x, y]) > 105 or (y < fy1 + 3 and abs(x - mx - .5) < 4)): soak(c, x, y, 1 if y < fy1 + 4 else 0)
    for x, ya, l in ((mx - 4, fy1 + 3, 5), (mx + 5, fy1 + 2, 7)):   # runs over the jacket
        for k in range(l):
            if own(x, ya + k): soak(c, x, ya + k, 1 if k < 2 else 0)
    # his eyes in his lap, side by side, looking up at you (the model's own big eyes: white, iris, a glint)
    iris = eyes[0][2] if eyes else (58, 90, 122)
    for y in range(fy1 + 13, fy1 + 18):   # his lap, wet where they lie
        for x in range(mx - 5, mx + 7):
            if own(x, y) and lum(c.px[x, y]) < 105: soak(c, x, y, -1 if y > fy1 + 15 else 0)
    for k, lx in enumerate((mx - 3, mx + 2)):
        ly = fy1 + 14
        for dx, dy, col in ((0, 0, (238, 234, 226)), (1, 0, (238, 234, 226)), (2, 0, (214, 206, 196)), (0, 1, iris), (1, 1, iris), (2, 1, (200, 190, 182)),
                            (0, 2, (176, 166, 160)), (1, 2, (176, 166, 160)), (2, 2, (150, 140, 136))):
            c.p(lx + dx, ly + dy, col); B.rim.discard((lx + dx, ly + dy))
        c.p(lx, ly, (255, 255, 255)); c.p(lx + 1, ly + 1, (24, 30, 40))
        c.p(lx + 3, ly + 2, MEAT[1]); c.p(lx + 4, ly + 3, BLOOD[1])   # a thread of red from each
    # the rifle across his knees
    for x in range(cx - 13, cx + 14):
        y = fy1 + 18 + (x - cx) * .08
        if x < cx - 3: c.p(x, y, WOOD[4] if x < cx - 8 else WOOD[3]); c.p(x, y + 1, WOOD[1])
        else: c.p(x, y, IRON[4] if x < cx + 3 else IRON[3]); c.p(x, y + 1, IRON[0])
    B.finish('g_p_tree', cx, gy, foot=(-.3, -.15, .3, 0), sh=70)


for fn in (hiker, lantern, boots, coat, tree):
    fn(False); fn(True)
# the hiker lies head to the left (so the top-left light stays on the laid frame) and crawled from the right: the drag mirrored
_dr = Image.open('spr/lpc/obj/g_drag.png').convert('RGBA'); _dr.transpose(Image.Transpose.FLIP_LEFT_RIGHT).save('spr/lpc/obj/g_p_drag.png')
_m = json.load(open('spr/lpc/objects.json'))['g_drag']
SPR['g_p_drag'] = {'src': 'spr/lpc/obj/g_p_drag.png', 'fw': _m['fw'], 'fh': _m['fh'], 'ax': float(_m['fw'] - _m['ax']), 'ay': float(_m['ay']), 'foot': [0, 0, 0, 0]}
d = json.load(open('spr/lpc/objects.json')); d.update(SPR); json.dump(d, open('spr/lpc/objects.json', 'w')); print('ok', list(SPR))
