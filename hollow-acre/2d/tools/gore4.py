"""The animals the Hollow kills (t372d): the rabbit, the deer (in the fields and on the farm track in the story) and the ribcage
at the end of its drag, and the cold house's rack of hooks. Each is drawn ONCE from one description at two sizes: the world
sprite, and its close-up at 2-4x (what you see when you walk up), so the two are the same thing; the close-up adds what the
world sprite can't hold (fur in strokes, the organs' vessels and lobes, the rib bones' ends, the sacking's seams, toes). Each
also has its toned-down version (_t): the animal whole, or what's left once it was taken, with a dark stain.
Lit from the upper left, hue-shifted ramps, solid contact shadows, one dark outline; no speckle (fur and wear are strokes).
Writes spr/lpc/obj/g_{rabbit,deer_open,ribs,hooks}[_t][_cu].png and merges objects.json. Run from the folder holding spr/."""
import json, math, os
_here = os.path.dirname(os.path.abspath(__file__))
_src = open(os.path.join(_here, 'gore3.py')).read()
exec(_src[:_src.index("# ============================== the strangers' bodies")])
def lum(p): return .3 * p[0] + .59 * p[1] + .11 * p[2]
def curve(c, pts, col_fn):
    out = []
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        k = max(1, int(max(abs(bx - ax), abs(by - ay)) * 1.5))
        for i in range(k): t = i / k; out.append((int(round(ax + (bx - ax) * t)), int(round(ay + (by - ay) * t))))
    out.append((int(round(pts[-1][0])), int(round(pts[-1][1]))))
    seen = []
    for q in out:
        if not seen or seen[-1] != q: seen.append(q)
    for i, (x, y) in enumerate(seen): col_fn(x, y, i, len(seen))
    return seen
DEERF = ramp('#a87444', spread=.8); WHITEF = ramp('#d8d0c0', spread=.5); HOOF = ramp('#3a2a24', spread=.9); NOSE = (30, 20, 22)
HEART = ramp('#8a1a22', spread=1); LUNG = ramp('#c87a80', spread=.7); LIVER = ramp('#5e1c2a', spread=1); KIDNEY = ramp('#702c26', spread=.9)
STOM = ramp('#b49088', spread=.6); GUT = ramp('#c47070', spread=.8); SPLEEN = ramp('#4c1a32', spread=1); BLAD = ramp('#d4b08a', spread=.6)
RABF = ramp('#8a8070', spread=.7); EARP = (206, 140, 140); TUFT = ramp('#9a9080', spread=.6)


class Z:
    """a canvas S times the world sprite: world coordinates in, pixels out"""
    def __init__(s, W, Hh, S): s.S = S; s.c = C(int(round(W * S)), int(round(Hh * S))); s.f = None
    def F(s): return F(s.c.W, s.c.H)
    def p(s, x, y, col, a=255): s.c.p(x * s.S, y * s.S, col, a)
    def blk(s, x, y, col):   # a world pixel: S x S
        for dy in range(s.S):
            for dx in range(s.S): s.c.p(int(round(x * s.S)) + dx, int(round(y * s.S)) + dy, col)


def organ(f, S, x, y, rx, ry, mat, rot=0., base=2.):
    return f.blob(x * S, y * S, rx * S, ry * S, mat, base=base * S, hs=.9, rot=rot)


# ============================== the deer, laid on its side, opened, its insides round it in a ring like a clock face
RING = [('heart', 2.4, 2.6), ('lung', 2.6, 2), ('liver', 3, 2.2), ('kidney', 1.8, 1.4), ('stom', 3, 2.2), ('gut', 2.6, 2),
        ('spleen', 3.2, 1.2), ('gut', 2.4, 1.9), ('lung', 2.6, 2), ('liver', 2.8, 2), ('kidney', 1.8, 1.4), ('blad', 2, 1.7)]
OMAT = {'heart': HEART, 'lung': LUNG, 'liver': LIVER, 'kidney': KIDNEY, 'stom': STOM, 'gut': GUT, 'spleen': SPLEEN, 'blad': BLAD}
RJ = [(0, 1), (4, .96), (-7, 1.04), (-22, 1.05), (6, .98), (-3, 1.02), (2, .95), (-5, 1.03), (7, .97), (-4, 1.02), (5, .94), (-8, 1)]   # set out by hand, not by compass
def ring_pos(k): a = math.radians(-90 + k * 30 + RJ[k][0]); r = RJ[k][1]; return 36 + 31 * r * math.cos(a), 20.5 + 15 * r * math.sin(a)
def tube(c, S, pts, r0, r1, R, rim=True):
    """a length of gut: a tapered tube along pts, lit along its top, creased across every few pixels, a rim of blood under it"""
    path = []
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        n = max(2, int(math.hypot(bx - ax, by - ay) * S * 1.5))
        for i in range(n): t = i / n; path.append((ax + (bx - ax) * t, ay + (by - ay) * t))
    path.append(pts[-1]); N = len(path)
    for k, (x, y) in enumerate(path):
        r = (r0 + (r1 - r0) * k / N) * S
        for dy in range(-int(r) - 1, int(r) + 2):
            for dx in range(-int(r) - 1, int(r) + 2):
                d = (dx * dx + dy * dy) / (r * r + .01)
                if d > 1: continue
                l = -(dx * .6 + dy * .8) / (r + .01)
                c.p(x * S + dx, y * S + dy, R[4] if l > .5 else R[3] if l > -.1 else R[2] if l > -.6 else R[1])
        if rim and k % 2 == 0: c.p(x * S, y * S + r + 1, BLOOD[1])
    step = max(3, int(2.6 * S))
    for k in range(step, N - 1, step):   # the creases across it
        x, y = path[k]; x2, y2 = path[min(N - 1, k + 1)]; nx, ny = -(y2 - y), (x2 - x); L = math.hypot(nx, ny) or 1; r = (r0 + (r1 - r0) * k / N) * S
        for u in range(-int(r * .8), int(r * .8) + 1): c.p(x * S + nx / L * u, y * S + ny / L * u, R[0])
SPILL = [[(33.6, 25.6), (32.2, 28), (29.4, 30.2), (30.6, 32.6), (34.4, 32.4), (36.4, 30.4), (39.2, 31.2), (41.6, 33.4), (45, 33.2)],
         [(40.6, 25.8), (42.6, 28), (40.4, 29.4), (37.6, 28.6)], [(37, 26), (36.2, 28.4)]]
def spill(z):
    """the insides pulled out of the slit: the guts in loops on the grass, heaviest at the cut, blood under them"""
    c, S = z.c, z.S
    blood_pool(c, 37 * S, 30 * S, 10 * S, 3.6 * S, 4.4)
    for k, pts in enumerate(SPILL): tube(c, S, pts, (1.5, 1.3, 1.2)[k], (.9, 1, 1)[k], GUT)
    for k in (4, 5, 6, 7, 8):   # drag smears from the slit out to the pieces laid round it
        x, y = ring_pos(k); x0, y0 = 30 + k * 2.2, 26.2
        for j in range(int(9 * S)):
            t = j / (9 * S); xx = x0 + (x - x0) * t; yy = y0 + (y - y0) * t
            if H(j // max(1, S), k, 7) < .25: continue
            c.p(xx * S, yy * S, BLOOD[0] if t > .6 else BLOOD[1])
            if S > 1 and t < .7: c.p(xx * S + 1, yy * S, BLOOD[2] if j % 3 else BLOOD[1])
def deer_body(z, f, toned):
    S = z.S
    f.blob(23 * S, 20.6 * S, 6.6 * S, 6 * S, 'deer', hs=.9)                      # the haunch
    f.blob(36 * S, 21 * S, 14 * S, 6.2 * S, 'deer', hs=.85)                      # the barrel
    f.blob(47.4 * S, 20.6 * S, 6 * S, 5.8 * S, 'deer', hs=.9)                    # the shoulder
    f.blob(36 * S, 25.4 * S, 12 * S, 2.4 * S, 'white', base=1.2 * S, hs=.6)      # the pale belly
    f.cap(50 * S, 20 * S, 56.6 * S, 21 * S, 3.4 * S, 2.6 * S, 'deer', base=.8 * S)   # the neck laid out flat
    f.cap(58.2 * S, 19 * S, 53 * S, 15.2 * S, 2.3 * S, 1.3 * S, 'deer', base=.6 * S)   # the big ear, flat on the grass, leaf-shaped
    f.blob(63.6 * S, 23.4 * S, 2 * S, .9 * S, 'white', base=1.6 * S)   # the pale chin
    f.blob(60.6 * S, 21.4 * S, 4.4 * S, 3 * S, 'deer', base=1.2 * S, rot=.05)  # the head on its cheek
    f.cap(63.4 * S, 22 * S, 66 * S, 22.6 * S, 2 * S, 1.4 * S, 'deer', base=1.2 * S)    # the muzzle
    f.blob(16.6 * S, 18.6 * S, 2.2 * S, 1.8 * S, 'white', base=1.6 * S)          # the tail, white
    for (ax, ay, bx, by, r0) in ((49.6, 24, 57.2, 30.6, 1.7), (47.6, 25, 53, 32.8, 1.7), (24.4, 24, 16.4, 30.8, 2.1), (27, 25, 22.4, 33.2, 2.1)):   # the legs, stiff
        f.cap(ax * S, ay * S, bx * S, by * S, r0 * S, 1.1 * S, 'deer', base=.3 * S)
        f.blob(bx * S, by * S, 1.3 * S, 1.1 * S, 'hoof', base=.6 * S)
def deer(S, toned):
    W, Hh = 72, 40; z = Z(W, Hh, S); c = z.c
    if toned: blood_pool(c, 56 * S, 24.4 * S, 6 * S, 2.2 * S, 2.2, dry=True)   # under the throat: a dark patch, dried
    else: blood_pool(c, 37 * S, 27.4 * S, 15 * S, 4 * S, 1.3)
    ground_shadow(c, 37 * S, 27 * S, 21 * S, 5 * S, a=90)
    if not toned: spill(z)
    if not toned:   # the ring first, so the legs lie over the pieces at their feet
        f = z.F()
        for k, (kind, rx, ry) in enumerate(RING):
            x, y = ring_pos(k); organ(f, S, x, y, rx, ry, kind, rot=(k * .7) % 1.2 - .6)
            blood_pool(c, (x + .6) * S, (y + 1.6) * S, (rx + .6) * S, (ry * .5 + .3) * S, k * 1.7, glint=False)
        f.render(c, OMAT)
        organ_detail(z)
    f = z.F(); deer_body(z, f, toned); f.render(c, {'deer': DEERF, 'white': WHITEF, 'hoof': HOOF})
    # the face: the eye open and dull, the nostril, the ear's inside
    z.blk(61.2, 20.4, (26, 18, 20)); z.blk(66 + (1 / S if S > 1 else 0), 22.2, NOSE)
    if S > 1:
        c.p(61.2 * S + 1, 20.4 * S, (120, 120, 130)); c.p(61.2 * S - 1, 20.4 * S + 1, DEERF[1])
        for k_ in range(3):   # the ear's pale inside, its dark rim
            curve(c, [((57.2 - k_ * .2) * S, (18.2 + k_ * .5) * S), ((54 - k_ * .3) * S, (16 + k_ * .5) * S)], lambda x, y, i, n, k_=k_: c.p(x, y, (214, 168, 156) if k_ == 1 else (180, 120, 112)))
        curve(c, [(58 * S, 17.4 * S), (53.6 * S, 14.2 * S)], lambda x, y, i, n: c.p(x, y, DEERF[0]))
        c.p(64 * S, 23 * S, BLOOD[1]); c.p(65 * S, 23.6 * S, BLOOD[2])   # blood at the mouth
        fur(z)
    else: z.blk(55.8, 16.8, (176, 112, 108)); z.blk(56.8, 17.4, (176, 112, 108))
    if not toned: opening(z)
    else:   # whole; only the throat dark where it bled
        for x in (54, 55, 56):
            for y in (21, 22): z.p(x, y, BLOOD[1]) if S == 1 else [c.p(x * S + u, y * S + v, BLOOD[1] if (u + v) % 3 else BLOOD[0]) for u in range(S) for v in range(S)]
    drop_shadow(c, S, S, 90); outline2(c, lit=True)
    nm = 'g_deer_open' + ('_t' if toned else '') + ('_cu' if S > 1 else '')
    done(nm, c, 36 * S, 30 * S)
def fur(z):
    """fur at close-up size: short strokes along the body's lie, lighter on the back, darker in the shade; the belly's edge in tufts"""
    c, S = z.c, z.S
    for k in range(26):
        x0 = 18 + (k * 37 % 36); y0 = 15.6 + ((k * 13) % 9) * .9
        lit = y0 < 19
        curve(c, [(x0 * S, y0 * S), ((x0 + 1.6) * S, (y0 + .5) * S)], lambda x, y, i, n, lit=lit: c.p(x, y, DEERF[4] if lit and i < n - 1 else DEERF[1]) if c.px[x, y][3] > 200 and c.px[x, y][:3] in DEERF else None)
    pts = [(X, Y) for Y in range(c.H - 1) for X in range(c.W) if c.px[X, Y][3] > 200 and c.px[X, Y][:3] in DEERF and c.px[X, Y + 1][3] > 200 and c.px[X, Y + 1][:3] in DEERF]
    for X, Y in pts:   # where one tone meets the next, fur tips of each reach over the border (borders wander, they don't band)
        a_, b_ = DEERF.index(c.px[X, Y][:3]), DEERF.index(c.px[X, Y + 1][:3])
        if a_ != b_ and H(X, Y, 11) < .45:
            L = 1 + int(H(X, Y, 12) * 3)
            for k in range(L):
                q = (X + (k // 2), Y + 1 + k)
                if 0 <= q[0] < c.W and 0 <= q[1] < c.H and c.px[q][:3] in DEERF and c.px[q][3] > 200: c.p(q[0], q[1], DEERF[a_])
    for x in range(25 * S, 47 * S, 3):   # the pale belly's edge in tufts
        y = int(23.6 * S + (x % 7 > 3)); c.p(x, y, WHITEF[3]); c.p(x + 1, y + 1, WHITEF[2])
def opening(z):
    """opened from the throat to the tail along the belly: the far lip straight, the near lip torn; emptied, the ribs as ridges"""
    c, S = z.c, z.S
    x0_, x1_ = 22, 54
    top = lambda x: 23.4 + (x - 22) * .02   # the far lip: straight
    bot = lambda x: top(x) + .4 + 2.6 * max(0, math.sin(math.pi * (x - x0_) / (x1_ - x0_))) ** .7 + (.5 * math.sin(x * 1.7) if S > 1 else 0)   # the near lip: torn
    for X in range(x0_ * S, x1_ * S):
        x = X / S; t0 = int(round(top(x) * S)); b0 = int(round(bot(x) * S))
        for Y in range(t0, b0 + 1):
            d = (Y - t0) / max(1, b0 - t0)
            c.p(X, Y, OUT if d < .3 else BLOOD[0] if d < .55 else MEAT[0] if d < .8 else MEAT[1])
        c.p(X, t0 - 1, DEERF[0])
        if S > 1:
            c.p(X, t0, FAT[1] if H(X, 2, 9) < .6 else MEAT[1])   # the fat under the hide, broken
            if H(X, 3, 9) < .4: c.p(X, b0 + 1, WHITEF[1])   # the belly's fur torn back, in places
            elif H(X, 4, 9) < .3: c.p(X, b0 + 1, (178, 120, 116))   # the hide's pink underside
    for k, (xr, lean) in enumerate(((27.5, .5), (31.4, .7), (36.2, .6), (40.6, .8), (46.4, .5))):   # the ribs, curved ridges of red under the dark, apart unevenly
        y0_, y1_ = top(xr) + .5, bot(xr) - .2
        curve(c, [(xr * S, y0_ * S), ((xr + lean) * S, ((y0_ + y1_) / 2) * S), ((xr + lean * 2.2) * S, y1_ * S)],
              lambda x, y, i, n: (c.p(x, y, MEAT[2] if i < n * .7 else MEAT[1]), c.p(x + 1, y, MEAT[0]) if S > 1 else None))
    if S > 1:
        c.p(33 * S, int(bot(33) * S) - 2, MEAT[5]); c.p(43 * S, int(bot(43) * S) - 2, MEAT[4])
def organ_detail(z):
    """what the close-up shows of each piece: the heart's vessels and fat, lobes on the lungs and the liver, the kidney's notch,
    the stomach's folds, the gut's coils, a wet light on each; the world sprite gets one glint each"""
    c, S = z.c, z.S
    for k, (kind, rx, ry) in enumerate(RING):
        x, y = ring_pos(k); X, Y = x * S, y * S; R = OMAT[kind]
        if S == 1: c.p(X - rx * .4, Y - ry * .5, R[5]); continue
        if kind == 'heart':
            for dy in range(3): c.p(X + rx * S * .2, Y + ry * S - 1 + dy, HEART[1] if dy < 2 else HEART[0])   # its point
            for dx, col in ((-1, BONE[3]), (0, BONE[2]), (1, (150, 40, 50)), (2, (110, 30, 46))):
                for dy in range(3): c.p(X + dx * 1.5 - 1, Y - ry * S + 1 - dy, col)
            curve(c, [(X - rx * S * .6, Y - ry * S * .3), (X + rx * S * .5, Y - ry * S * .45)], lambda x_, y_, i, n: c.p(x_, y_, FAT[2]))   # the fat band
            curve(c, [(X - 1, Y - ry * S * .3), (X + 1, Y + ry * S * .6)], lambda x_, y_, i, n: c.p(x_, y_, HEART[1]))   # its vessel
        elif kind in ('lung', 'liver'):
            curve(c, [(X - rx * S * .2, Y - ry * S * .9), (X + rx * S * .1, Y + ry * S * .8)], lambda x_, y_, i, n: c.p(x_, y_, R[1]))
        elif kind == 'kidney':
            c.p(X + rx * S * .5, Y, R[0]); c.p(X + rx * S * .5 - 1, Y, R[1])
        elif kind == 'stom':
            for j in range(3): curve(c, [(X - rx * S * .7 + j * 3, Y - ry * S * .5), (X - rx * S * .4 + j * 3, Y + ry * S * .6)], lambda x_, y_, i, n: c.p(x_, y_, R[1]))
        elif kind == 'gut':   # coiled tube: the crease between the coils dark, each coil's top lit
            pts = [(X + math.cos(a) * rx * S * (.25 + a / 14) , Y + math.sin(a) * ry * S * (.25 + a / 14)) for a in [i_ * .5 for i_ in range(13)]]
            curve(c, pts, lambda x_, y_, i, n: (c.p(x_, y_, R[0]), c.p(x_, y_ - 1, R[4]) if i % 3 else None))
        elif kind == 'blad':
            curve(c, [(X - 2, Y - 1), (X + 1, Y + 1), (X + 3, Y)], lambda x_, y_, i, n: c.p(x_, y_, (176, 96, 96)))
        c.p(X - rx * S * .4, Y - ry * S * .5, R[5]); c.p(X - rx * S * .4 + 1, Y - ry * S * .5, R[4])   # wet


# ============================== the rabbit, opened like a purse, its fur everywhere
TUFTS = [(-8, 5.4, 1), (-5.6, 6.2, 2), (-3, 5.8, 0), (-.6, 6.6, 2), (2.2, 6, 1), (4.4, 6.8, 0), (6.8, 6.2, 1), (-1.8, 7.6, 0)]   # one drift, below the belly it was opened from
def rabbit(S, toned):
    W, Hh = 40, 24; z = Z(W, Hh, S); c = z.c; cx, cy = 20, 14
    if not toned: blood_pool(c, (cx + 1) * S, (cy + 2.4) * S, 7 * S, 2.6 * S, 3.1)
    else: blood_pool(c, (cx + 4) * S, (cy + 2) * S, 3 * S, 1.4 * S, 3.1, dry=True)
    ground_shadow(c, cx * S, (cy + 2) * S, 8 * S, 2.4 * S)
    for k, (dx, dy, v) in enumerate(TUFTS if not toned else TUFTS[:3]):   # tufts of fur, as if it burst: small gathered clumps, strands at their ends
        tx, ty = (cx + dx) * S, (cy + dy) * S
        if S == 1:   # at world size a tuft is one gathered clump: a lit pixel and its shade
            c.p(tx, ty, TUFT[4]); c.p(tx + 1, ty, TUFT[2]); c.p(tx + (1 if v else 0), ty + 1, TUFT[1]) if v == 2 else None; continue
        for dy in range(-1, 2):   # a wisp: a small soft knot of fur, its hairs drawn out long one way, lit on top
            for dx in range(-2, 3):
                if (dx / 2.4) ** 2 + (dy / 1.4) ** 2 > 1: continue
                c.p(tx + dx, ty + dy, TUFT[4] if dy < 0 else TUFT[3])
        a = (-.3 if k % 2 else .25) + (k % 3) * .15
        for j in range(3 + v):
            L = 5 + j * 1.6 + (k % 2) * 2
            curve(c, [(tx + 1, ty + j * .7 - 1), (tx + 1 + math.cos(a) * L * .6, ty + j * .7 - 1 + math.sin(a) * L * .4 - .6), (tx + 1 + math.cos(a) * L, ty + j * .7 + math.sin(a) * L * .5)],
                  lambda x, y, i, n, j=j: c.p(x, y, TUFT[4] if j == 0 and i < n * .6 else TUFT[3] if i < n - 1 else TUFT[2]))
    f = z.F()
    f.blob((cx - 1) * S, cy * S, 6.4 * S, 3.6 * S, 'fur', hs=.9)              # the body on its side
    f.blob((cx + 5.4) * S, (cy - 1.4) * S, 2.8 * S, 2.3 * S, 'fur', base=.8 * S)  # the head
    f.cap((cx + 5) * S, (cy - 3) * S, (cx + 2.6) * S, (cy - 6) * S, 1 * S, .8 * S, 'fur', base=1.6 * S)   # the ears laid back
    f.cap((cx + 6.2) * S, (cy - 3) * S, (cx + 4.4) * S, (cy - 6.4) * S, .9 * S, .7 * S, 'fur', base=1.2 * S)
    f.blob((cx - 7) * S, (cy - .8) * S, 1.6 * S, 1.4 * S, 'white', base=1.4 * S)   # the scut
    f.cap((cx - 4) * S, (cy + 2.6) * S, (cx - 8) * S, (cy + 4) * S, 1.1 * S, .8 * S, 'fur', base=.4 * S)   # the hind legs out
    f.cap((cx + 3) * S, (cy + 2.4) * S, (cx + 6) * S, (cy + 4) * S, .8 * S, .6 * S, 'fur', base=.4 * S)
    f.blob((cx - 1) * S, (cy + 2.2) * S, 4.6 * S, 1.2 * S, 'white', base=1 * S, hs=.5)   # the pale belly
    f.render(c, {'fur': RABF, 'white': WHITEF})
    z.blk(cx + 6.4, cy - 2, (20, 14, 16))   # the eye
    if S > 1:
        c.p((cx + 6.4) * S + 1, (cy - 2) * S, (110, 110, 120))
        curve(c, [((cx + 4.8) * S, (cy - 4) * S), ((cx + 3) * S, (cy - 5.6) * S)], lambda x, y, i, n: c.p(x, y, EARP))   # the ear's pink inside
        c.p((cx + 7.6) * S, (cy - 1) * S, (150, 90, 96))   # the nose
        for k in range(14):   # fur strokes along its lie
            x0 = cx - 6 + (k * 7 % 11); y0 = cy - 2.6 + (k * 5 % 4) * .8
            curve(c, [(x0 * S, y0 * S), ((x0 + 1.2) * S, (y0 + .4) * S)], lambda x, y, i, n, y0=y0: c.p(x, y, RABF[4] if y0 < cy - 1.4 else RABF[1]) if c.px[x, y][:3] in RABF else None)
    if not toned:   # opened like a purse: the belly split, the fur folded back above and below it, the insides bulging out whole
        f = z.F()
        for k, (gx, gy_, rx, ry, m, rot) in enumerate(((cx - 3.2, cy + 1.6, 1.9, 1.3, 'gut', 0), (cx - .6, cy + 2.4, 2.4, .9, 'liver', .5), (cx + 1.3, cy + 1.5, 1.7, 1.2, 'gut', 0),
                                                   (cx - 2, cy + 2.8, 1.6, 1, 'gut', 0), (cx + .6, cy + 3, 1.5, 1, 'lung', 0), (cx - 1.4, cy + 1.6, 1.2, .9, 'gut', 0))):
            f.blob(gx * S, gy_ * S, rx * S, ry * S, m, base=(2.4 + (k == 5)) * S, hs=.9, rot=rot)
        f.render(c, {'gut': GUT, 'liver': LIVER, 'lung': LUNG})
        for X in range(int((cx - 5.2) * S), int((cx + 3.4) * S)):   # the two flaps: fur above, its pink underside showing at the fold below
            x = X / S; t_ = (x - (cx - 5.2)) / 8.6; h = math.sin(math.pi * t_)
            yt = (cy + .5 - h * .5) * S; yb = (cy + 3.6 + h * .5) * S
            c.p(X, yt, RABF[1]); c.p(X, yt - 1, RABF[3]) if S > 1 else None
            c.p(X, yb, (178, 120, 116) if S > 1 else RABF[1]); c.p(X, yb + 1, WHITEF[2]) if S > 1 else None
        if S > 1:
            for gx in (cx - 3.6, cx - 2.6, cx + 1, cx + 2):   # the coils' creases
                curve(c, [(gx * S, (cy + 1) * S), ((gx + .5) * S, (cy + 2) * S)], lambda x, y, i, n: c.p(x, y, GUT[0]))
            c.p((cx - 1.4) * S, (cy + 1.4) * S, LIVER[5]); c.p((cx - 3.6) * S, (cy + 1) * S, GUT[5]); c.p((cx + 1) * S, (cy + 1) * S, GUT[5])
    drop_shadow(c, S, S, 90); outline2(c, lit=True)
    done('g_rabbit' + ('_t' if toned else '') + ('_cu' if S > 1 else ''), c, 20 * S, 16 * S)


# ============================== the ribcage standing on its spine at the end of its drag, picked almost clean
def ribs(S, toned):
    W, Hh = 44, 36; z = Z(W, Hh, S); c = z.c; cx, gy = 22, 31
    if not toned: blood_pool(c, cx * S, (gy + 1) * S, 11 * S, 2.6 * S, 2.6)
    else: blood_pool(c, cx * S, (gy + .6) * S, 9 * S, 2.6 * S, 2.6, dry=True, glint=False)
    ground_shadow(c, cx * S, (gy + .6) * S, 10 * S, 2 * S)
    if toned:   # what is left: a flattened dark patch, tufts of hair, one knuckle of spine
        for k, (dx, dy) in enumerate(((-7, -1), (5, -2), (8, 1), (-3, 2))):
            tx, ty = (cx + dx) * S, (gy + dy) * S
            for j in range(3): curve(c, [(tx, ty), (tx + math.cos(-1 + j * .9) * 1.6 * S, ty + math.sin(-1 + j * .9) * 1.2 * S)], lambda x, y, i, n, j=j: c.p(x, y, DEERF[4] if j == 0 else DEERF[2]))
        f = z.F(); f.blob((cx + 1) * S, (gy - .6) * S, 1.6 * S, 1.2 * S, 'bone', base=.4 * S); f.render(c, {'bone': BONE})
        drop_shadow(c, S, S, 80); outline2(c, lit=True); done('g_ribs_t' + ('_cu' if S > 1 else ''), c, 22 * S, 31 * S); return
    f = z.F()
    f.cap(cx * S, (gy - 1) * S, (cx + .4) * S, (gy - 20) * S, 1.5 * S, 1.3 * S, 'bone', base=.2 * S)   # the spine standing up its middle
    f.blob(cx * S, (gy - .6) * S, 2.6 * S, 1.2 * S, 'bone', base=.1 * S)
    f.render(c, {'bone': BONE})
    for Y in range(0, int((gy - 20.4) * S)):   # its top snapped off flat, splintered
        for X in range(c.W): c.px[X, Y] = (0, 0, 0, 0) if c.px[X, Y][:3] in BONE else c.px[X, Y]
    for u, h_ in ((-1.2, .6), (-.4, 1.4), (.4, .4), (1.2, 1)):
        for v in range(int(h_ * S) + 1): c.p((cx + .2 + u) * S, (gy - 20.4) * S - v, BONE[4] if v == int(h_ * S) else BONE[2])
    # the ribs: out from the spine and down round, each a little steeper than the one above; the two sides not a mirror (one is
    # broken short), the far side a shade darker
    RB = {-1: ((20, 6.4, 1.2), (17.2, 8.6, 2.6), (14.4, 9.8, 4.4), (11.6, 9.2, 6.2), (8.8, 8.4, 8), (6.2, 6.4, 9.4)),
          1: ((20.4, 5.6, 1.6), (17.6, 8.2, 3), (14.6, 6.2, 4.8), (11.8, 9.6, 6.6), (9.2, 8.8, 8.4), (6.4, 7, 9.8))}
    for side in (-1, 1):
        far = side > 0
        for k, (hy, L, drop) in enumerate(RB[side]):
            pts = [((cx + side * (1 + L * math.sin(t * 1.5))) * S, (gy - hy - 1.4 * math.sin(t * 2.4) + drop * t * t) * S) for t in [i_ / 8 for i_ in range(9)]]
            def rib(x, y, i, n, far=far):
                for u in range(max(1, int(S) - 1)):
                    col = (BONE[2] if u == 0 else BONE[1]) if far else (BONE[4] if u == 0 else BONE[3] if u < S - 2 else BONE[2])
                    if i > n - 2: col = BONE[1]
                    c.p(x, y + u, col)
            curve(c, pts, rib)
            if far and k == 2: c.p(pts[-1][0] + side * S * .4, pts[-1][1], BONE[4])   # the broken one's splintered end
    if S > 1:   # the vertebrae up the spine
        for k in range(9): c.p(cx * S - 1, (gy - 3 - k * 2) * S, BONE[1]); c.p(cx * S + 2, (gy - 3 - k * 2) * S, BONE[0])
    # what's left on it: strings of red hanging off the ribs, a scrap caught where the ribs meet the spine, the sinew pale
    for k, (x, y, L) in enumerate(((cx - 5.6, gy - 15.2, 3), (cx + 4.6, gy - 11, 4.4), (cx - 8.2, gy - 8.8, 2.4), (cx + 7.4, gy - 6, 2), (cx - 2.6, gy - 18.6, 1.6))):
        curve(c, [(x * S, y * S), ((x + .3) * S, (y + L * .6) * S), ((x + .1) * S, (y + L) * S)], lambda x_, y_, i, n: (c.p(x_, y_, MEAT[2] if i < n * .5 else MEAT[1]), c.p(x_ + 1, y_, MEAT[0]) if S > 1 else None))
        for dx in range(int(S)): c.p(x * S + dx, (y + L) * S + 1, BLOOD[1])
    f = z.F(); f.blob((cx + 1.6) * S, (gy - 4) * S, 1.6 * S, .9 * S, 'meat', base=4 * S, rot=.3); f.blob((cx - 1.4) * S, (gy - 12) * S, 1.2 * S, .8 * S, 'meat', base=4 * S, rot=-.4)
    f.render(c, {'meat': [MEAT[0], MEAT[0], MEAT[1], MEAT[2], MEAT[3], MEAT[4]]})
    if S > 1:
        curve(c, [((cx + 3) * S, (gy - 4.2) * S), ((cx + 4.4) * S, (gy - 3) * S)], lambda x_, y_, i, n: c.p(x_, y_, FAT[2]))
        c.p((cx + 1) * S, (gy - 4.4) * S, MEAT[5]); c.p((cx - 1.8) * S, (gy - 12.4) * S, MEAT[5])
    drop_shadow(c, S, S, 80); outline2(c, lit=True)
    done('g_ribs' + ('_cu' if S > 1 else ''), c, 22 * S, 31 * S)


# ============================== the cold house: a timber rack of hooks, two skinned carcasses, and on the third hook a child's coat
# (audit, STORY_PLAN 8.3: no child is ever shown hurt) a small wool coat on a wooden hanger, Agnes's blue ribbon tied on the hook
COAT = ramp('#4e5a4c', spread=.75); RIBN = ramp('#5c6a84', spread=.45)   # a dark, faded green wool apart from the meat; a dusty blue
def hooks(S, toned):
    r_ = lambda a, b=None, st=1: range(int(round(a))) if b is None else range(int(round(a)), int(round(b)), max(1, int(round(st))))
    W, Hh = 64, 84; z = Z(W, Hh, S); c = z.c; gy = 80
    # (t375, hard limit) the third shape is Ruth, a child: no blood on, from or under it at any level. The pool lies under the
    # two carcasses only and ends well short of the bundle's column (x 41-53)
    if not toned: blood_pool(c, 24.5 * S, (gy + 1) * S, 13 * S, 2.4 * S, 1.9, lobes=(.12, .07))
    else: blood_pool(c, 24.5 * S, (gy + 1) * S, 11 * S, 2.1 * S, 1.9, dry=True, glint=False, lobes=(.12, .07))
    ground_shadow(c, 32 * S, (gy + 1) * S, 26 * S, 2.4 * S)
    f = z.F()
    for px_ in (5, 57):   # the posts and the beam
        f.poly([(px_ * S, 6 * S), ((px_ + 3) * S, 6 * S), ((px_ + 3) * S, gy * S), (px_ * S, gy * S)], 'wood', base=.4 * S, hs=.6)
    f.poly([(3 * S, 3 * S), (61 * S, 3 * S), (61 * S, 7 * S), (3 * S, 7 * S)], 'wood', base=2 * S, hs=.6)
    f.render(c, {'wood': WOOD})
    for x in r_(3 * S, 61 * S): c.p(x, 3 * S, WOOD[4]); c.p(x, 7 * S - 1, WOOD[1])
    if S > 1:
        for x0, L in ((9, 10), (24, 14), (44, 9)): curve(c, [(x0 * S, 5 * S), ((x0 + L) * S, 5 * S + 1)], lambda x, y, i, n: c.p(x, y, WOOD[1]))   # grain
    f = z.F(); shapes = [(17, 'meat'), (32, 'meat'), (47, 'coat')]
    if toned: shapes = [(17, 'sack'), (32, 'sack'), (47, 'coat')]
    for hx, kind in shapes:
        if kind == 'meat':   # a side hung by the hind leg: narrow at the hock on the hook, the haunch, widest low at the ribs, the foreshank out to one side
            v = 0 if hx < 25 else 1; w = (1, .86)[v]; sg = (-1, 1)[v]; L = (0, 2.4)[v]
            P_ = [(hx - 1, 14), (hx + 1.2, 14), (hx + 2.6 * w, 21), (hx + 4.6 * w, 30), (hx + 6 * w, 41 + L), (hx + 5.4 * w, 49 + L), (hx + 2.4 * w, 53.6 + L),
                  (hx - 2.4 * w, 54 + L), (hx - 5.4 * w, 49 + L), (hx - 6.2 * w, 40 + L), (hx - 4.6 * w, 30), (hx - 2.4 * w, 21)]
            f.poly([(x * S, y * S) for x, y in P_], 'meat', base=.5 * S, hs=1.1)
            f.cap((hx + sg * 3.6) * S, (50.4 + L) * S, (hx + sg * 7) * S, (56 + L) * S, 1.6 * S, 1.1 * S, 'meat', base=1.4 * S)   # the foreshank stub
        elif kind == 'coat':   # a small coat hung on a hanger: shoulders, a little flare to the hem, the sleeves hanging at its sides
            P_ = [(hx - 1.8, 16.6), (hx + 1.8, 16.6), (hx + 4.6, 18), (hx + 5, 24), (hx + 5.8, 35.4), (hx - 5.8, 35.4), (hx - 5, 24), (hx - 4.6, 18)]
            f.poly([(x * S, y * S) for x, y in P_], 'coat', base=.6 * S, hs=.9)
            for sg in (-1, 1): f.cap((hx + sg * 4.6) * S, 18.6 * S, (hx + sg * 5.9) * S, 30.6 * S, 1.5 * S, 1.3 * S, 'coat', base=1 * S)
        else:   # wrapped in sacking and tied (toned: the carcasses under sacking)
            f.blob(hx * S, 36 * S, 5.4 * S, 17 * S, 'sack', hs=.8)
            f.blob(hx * S, 21 * S, 4.4 * S, 4 * S, 'sack', base=1 * S)
    f.render(c, {'meat': [MEAT[0], MEAT[1], MEAT[2], MEAT[3], FAT[2], FAT[4]], 'sack': SACK, 'coat': COAT})
    for hx, kind in shapes:
        for y in r_(7 * S, 13 * S): c.p(hx * S, y, IRON[3]); c.p(hx * S + 1, y, IRON[1]) if S > 1 else None   # the hook's shank
        curve(c, [(hx * S, 12 * S), ((hx + 1.4) * S, 13.6 * S), (hx * S, 15 * S)], lambda x, y, i, n: c.p(x, y, IRON[4] if i < 2 else IRON[2]))
        if kind == 'meat':
            v = 0 if hx < 25 else 1; w = (1, .86)[v]; L = (0, 2.4)[v]; bx_ = hx - (3.4, -3)[v] * w   # the backbone down one edge
            curve(c, [(bx_ * S, 24 * S), ((bx_ - .4) * S, (52 + L) * S)], lambda x, y, i, n: (c.p(x, y, FAT[3]), c.p(x + 1, y, FAT[1]) if S > 1 else None))
            for k, y0 in enumerate((34, 37.4, 40.6, 43.6, 46.4) if v == 0 else (35.4, 38.2, 41.6, 44.4, 47.8, 50.4)):   # the ribs fanned out from it, each a little steeper
                ex_ = hx + (5.4 if v == 0 else -5) * w; ang = .12 + k * .09
                curve(c, [(bx_ * S, y0 * S), (((bx_ + ex_) / 2) * S, (y0 + ang * 6) * S), (ex_ * S, (y0 + ang * 14) * S)],
                      lambda x, y_, i, n: (c.p(x, y_, FAT[2] if i < n - 2 else FAT[1]), c.p(x, y_ + 1, MEAT[0]) if S > 1 else None) if c.px[x, y_][3] > 200 else None)
            curve(c, [((hx + (1, -1)[v]) * S, 22 * S), ((hx + (2.4, -2)[v]) * S, 31 * S)], lambda x, y, i, n: c.p(x, y, FAT[2]) if c.px[x, y][3] > 200 else None)   # the seam between the haunch's muscles
            if S > 1:
                for dx, dy, col in ((-1, 0, BONE[3]), (0, 0, BONE[4]), (1, 0, BONE[2]), (-1, 1, BONE[2]), (0, 1, BONE[3]), (1, 1, BONE[1])): c.p(hx * S + dx, 15.6 * S + dy, col)   # the hock's bone where the hook goes through
                for u in r_(-2, 3): c.p((hx + (-7, 7)[v]) * S + u * .6, (56 + L) * S + u * .5, (150, 104, 100) if abs(u) < 1 else MEAT[0])   # the foreshank's cut end
                c.p((hx - 2) * S, 40 * S, MEAT[5]); c.p((hx + 2) * S, 27 * S, MEAT[5])   # wet
            curve(c, [(hx * S, (54.6 + L) * S), ((hx + .2) * S, (62 + L) * S), ((hx - .2) * S, 72 * S), (hx * S, 79.4 * S)],   # one run from it down into the pool
                  lambda x, y, i, n: c.p(x, y, BLOOD[2] if i % 9 else BLOOD[1]) if not (n * .55 < i < n * .55 + 2 * S) else None)
        elif kind == 'coat':
            curve(c, [((hx - 6.4) * S, 17.2 * S), (hx * S, 15.8 * S), ((hx + 6.4) * S, 17.2 * S)], lambda x, y, i, n: (c.p(x, y, WOOD[4] if i < n * .5 else WOOD[3]), c.p(x, y + 1, WOOD[1])))   # the hanger's wooden bar, showing past the shoulders
            for sg in (-1, 1):   # the collar, turned down: a lighter wedge each side of the neck with a dark edge
                for k in range(3):
                    for u in range(3 - k): c.p((hx + sg * (1 + u)) * S, (16.9 + k * .7) * S, COAT[4] if u < 2 - k else COAT[1])
            if S > 1:
                for k in range(4):   # its buttons, two pixels, a lit top
                    bx_, by_ = int(hx * S) - 1, int((20.5 + k * 3.6) * S)
                    c.p(bx_, by_, (232, 220, 186)); c.p(bx_ + 1, by_, (200, 184, 146)); c.p(bx_, by_ + 1, (176, 160, 122)); c.p(bx_ + 1, by_ + 1, (120, 104, 78))
            else:
                for k in range(3): c.p(hx * S, (21 + k * 4.4) * S, (190, 176, 140))
                curve(c, [((hx - 2) * S, 22 * S), ((hx - 2.6) * S, 34 * S)], lambda x, y, i, n: c.p(x, y, COAT[1]) if c.px[x, y][3] > 200 else None)   # a fold
            for dx, dy, k in ((-2, 9, 3), (-1, 9, 4), (1, 9, 3), (2, 9, 2), (-2, 10, 2), (-1, 10, 1), (0, 9.5, 1), (1, 10, 2), (2, 10, 1), (-1, 11.4, 2), (-1.6, 12.6, 1), (1, 11.4, 2), (1.8, 12.6, 1)):
                c.p((hx + dx) * S, dy * S, RIBN[k])   # the blue ribbon tied in a bow round the hook's shank, its tails hanging
        else:
            for y in (24, 33, 44, 52):   # tied round with cord
                curve(c, [((hx - 5) * S, y * S), (hx * S, (y + .8) * S), ((hx + 5) * S, y * S)], lambda x, y_, i, n: c.p(x, y_, SACK[0] if S == 1 else (SACK[1] if i % 3 else SACK[0])) if c.px[x, y_][3] > 200 else None)
            if S > 1:
                curve(c, [((hx - 1) * S, 22 * S), ((hx - 1.6) * S, 50 * S)], lambda x, y, i, n: c.p(x, y, SACK[1]))   # the seam
                curve(c, [((hx + 2) * S, 27 * S), ((hx + 3) * S, 40 * S)], lambda x, y, i, n: c.p(x, y, SACK[4]))   # a fold catching the light
            if not toned or hx != 47:
                pass
            if not toned:   # the bare feet out of the bottom, chibi-small, the toes (t375: no soak, no blood: this is a child)
                for fx_ in (hx - 1.6, hx + 1.4):
                    for y in r_(53 * S, 57 * S):
                        for u in r_(int(1.6 * S)): c.p(fx_ * S + u, y, SKIN[3] if u < S * .6 else SKIN[2])
                    for u in r_(int(1.6 * S)): c.p(fx_ * S + u, 57 * S, SKIN[1])
                    if S > 1:
                        for t_ in r_(3): c.p(fx_ * S + t_, 57 * S + 1, SKIN[2])   # the toes
            elif hx != 47:   # toned: the sacking dark where it soaked, nothing showing (never on the third, the child)
                for y in r_(42 * S, 53 * S):
                    for x in r_((hx - 5) * S, (hx + 5) * S):
                        if c.px[x, y][3] > 200 and y > (46 - math.sin(x / S * 1.1)) * S: c.p(x, y, (84, 52, 40) if (x + y) % 5 else (66, 40, 32))
    drop_shadow(c, int(round(S)), int(round(S)), 80); outline2(c, lit=True)
    if S > 1: done('g_hooks' + ('_t' if toned else '') + '_cu', c, 32 * S, 80 * S); return
    done('g_hooks' + ('_t' if toned else ''), c, 32 * S, 80 * S, foot=(-0.95, -0.3, 0.95, 0))


import sys as _sys
_pick = _sys.argv[1:]   # (t375) e.g. `gore4.py hooks` redraws only the rack
for fn, S in ((deer, 2), (rabbit, 4), (ribs, 3), (hooks, 1.5)):
    if _pick and fn.__name__ not in _pick: continue
    for toned in (False, True): fn(1, toned); fn(S, toned)
d = json.load(open('spr/lpc/objects.json')); d.update(SPR); json.dump(d, open('spr/lpc/objects.json', 'w')); print('ok', list(SPR))
