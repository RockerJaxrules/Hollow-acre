"""Wildlife, drawn here by code, animated: deer (a doe and a stag) that walk, graze, look up and bound away; rabbits that sit
and hop; red squirrels that run and sit up with a nut; robins that peck, hop and fly; mallards (drake and hen) that swim and
dabble; a fox that trots and sits. Side views facing right (the game flips them), and for everything that runs a front view
(coming toward you) and a back view (going away), so a deer bounding up the screen shows its white rump and raised tail, not
its side. Every body part is a lit volume, light from
the upper left, shading hue-shifted (shadows toward violet, light toward gold), the far legs darker than the near ones, a dark
outline round each frame. Writes spr/lpc/obj/wild_*.png sheets and their entries in objects.json."""
import json, math, colorsys
from PIL import Image
OBJ = 'spr/lpc/obj/'
OUTC = (30, 22, 26)
HASH = lambda x, y, s=0: (math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453) % 1
L = (-.55, -.65, .53); _n = math.sqrt(sum(v * v for v in L)); L = tuple(v / _n for v in L)


def ramp(hexc, n=6, spread=.9, hs=.07):
    r, g, b = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]; h, s, v = colorsys.rgb_to_hsv(r, g, b); out = []
    for i in range(n):
        t = i / (n - 1) - .55
        tgt = .72 if t < 0 else .13; d = ((tgt - h + .5) % 1) - .5; hh = (h + d * min(1, abs(t) * hs * 6)) % 1
        ss = max(0, min(1, s * (1 - t * .5))); vv = max(0, min(1, v * (1 + t * spread)))
        out.append(tuple(round(c * 255) for c in colorsys.hsv_to_rgb(hh, ss, vv)))
    return out


class C:
    def __init__(s, W, H): s.W, s.H = W, H; s.im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); s.px = s.im.load()
    def p(s, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < s.W and 0 <= y < s.H: s.px[x, y] = (c[0], c[1], c[2], 255)
    def outline(s):
        a = [[s.px[x, y][3] > 0 for x in range(s.W)] for y in range(s.H)]; out = []
        for y in range(s.H):
            for x in range(s.W):
                if a[y][x]: continue
                if (x > 0 and a[y][x - 1]) or (x < s.W - 1 and a[y][x + 1]) or (y > 0 and a[y - 1][x]) or (y < s.H - 1 and a[y + 1][x]): out.append((x, y))
        for x, y in out: s.px[x, y] = (*OUTC, 255)


def ell(c, cx, cy, rx, ry, R, rot=0.0, k=1.0, under=None, clipy=None, spots=None, ut=.45):
    """a lit ellipsoid seen from the side; 'under' is a second ramp for a pale belly/breast where the surface faces down"""
    n = len(R); cr, sr = math.cos(rot), math.sin(rot); m = max(rx, ry) + 1
    for y in range(int(cy - m) - 1, int(cy + m) + 2):
        if clipy is not None and y > clipy: continue
        for x in range(int(cx - m) - 1, int(cx + m) + 2):
            dx, dy = x + .5 - cx, y + .5 - cy; u = (dx * cr + dy * sr) / rx; v = (-dx * sr + dy * cr) / ry; d = u * u + v * v
            if d > 1: continue
            nz = math.sqrt(1 - d); nx = u * cr - v * sr; ny = u * sr + v * cr
            l = (max(0, nx * L[0] + ny * L[1] + nz * L[2]) * .95 + .08) * k
            RR = under if (under and ny > ut) else R
            if spots and HASH(x, y, spots) > .86: l -= .2
            c.p(x, y, RR[max(0, min(n - 1, int(round(l * (n - 1)))))])


def limb(c, pts, w, R, k=1.0):
    """a leg or neck through a list of points, lit across its width"""
    n = len(R)
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        steps = max(2, int(math.hypot(x1 - x0, y1 - y0) * 2))
        for i in range(steps + 1):
            t = i / steps; x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t; ww = w(t) if callable(w) else w
            for j in range(int(math.ceil(ww))):
                u = (j + .5) / ww; l = (.85 - .55 * u) * k
                c.p(x - ww / 2 + j, y, R[max(0, min(n - 1, int(round(l * (n - 1)))))])


SPR = {}
def sheet(name, W, H, G, clips):
    """clips: list of (clipname, [frame drawing functions]). Each frame is drawn, outlined, and laid out in its row."""
    rows = len(clips); cols = max(len(row[1]) for row in clips)
    out = Image.new('RGBA', (W * cols, H * rows), (0, 0, 0, 0)); meta = {}
    for r, row in enumerate(clips):
        cn, frames = row[0], row[1]; view = row[2] if len(row) > 2 else 'S'
        for i, fn in enumerate(frames):
            c = C(W, H); fn(c); c.outline(); out.alpha_composite(c.im, (i * W, r * H))
        meta.setdefault(cn, {})[view] = [r, len(frames)]
    out.save(OBJ + name + '.png')
    SPR[name] = {'src': f'spr/lpc/obj/{name}.png', 'fw': W, 'fh': H, 'ax': W / 2, 'ay': float(G), 'clips': meta, 'foot': [0, 0, 0, 0]}
    print(name, out.size)


# ---------------------------------------------------------------- deer
DEER = ramp('#a06c3c'); DEERD = ramp('#7a5030'); PALE = ramp('#e6d8bc', spread=.5); HOOF = ramp('#2e2420', 4); ANT = ramp('#cdb894', 5)
def deer(stag=False, pose='walk', f=0):
    """angles are from straight down; positive swings a leg forward (toward the head)"""
    def back_leg(c, hip, a, R, k):
        st = (hip[0] + 1.5, hip[1] + 4); hk = (st[0] + math.sin(a - .45) * 7, st[1] + math.cos(a - .45) * 7)
        hf = (hk[0] + math.sin(a + .15) * 8.5, hk[1] + math.cos(a + .15) * 8.5)
        limb(c, [st, hk], lambda t: 2.6 - t * .8, R, k); limb(c, [hk, hf], 1.5, R, k); c.p(hf[0], hf[1], HOOF[1]); c.p(hf[0] + 1, hf[1], HOOF[0])
    def front_leg(c, sh, a, R, k, bend=0):
        el = (sh[0] + math.sin(a) * 7, sh[1] + math.cos(a) * 7); kn = (el[0] + math.sin(a + bend) * 3, el[1] + math.cos(a + bend) * 3)
        hf = (kn[0] + math.sin(a - bend * .5) * 8, kn[1] + math.cos(a - bend * .5) * 8)
        limb(c, [sh, el], lambda t: 2.5 - t * .7, R, k); limb(c, [el, kn, hf], 1.5, R, k); c.p(hf[0], hf[1], HOOF[1]); c.p(hf[0] + 1, hf[1], HOOF[0])
    def draw(c):
        lift = 0; ph = f / 4 * 2 * math.pi; bend = 0
        if pose == 'walk': A = [.32 * math.sin(ph), .32 * math.sin(ph + math.pi), .32 * math.sin(ph + math.pi * .5), .32 * math.sin(ph + math.pi * 1.5)]
        elif pose == 'run':
            A, lift, bend = [([.55, .45, -.45, -.35], 0, .6), ([-.6, -.5, .6, .5], 2, 0), ([-.95, -.85, 1.0, .9], 4, -.2), ([.2, .1, -.1, -.2], 1, .3)][f]
        else: A = [.04, -.04, .02, -.03]
        by = 29 - lift
        # the far legs first, in shade
        back_leg(c, (16, by + 1), A[1], DEERD, .65); front_leg(c, (33, by + 3), A[3], DEERD, .65, bend)
        # the body: rump, barrel, chest, a haunch over the near hind leg
        ell(c, 15.5, by - 1.5, 6.5, 6.2, DEER, under=PALE, ut=.8); ell(c, 23.5, by + .2, 10, 5.6, DEER, under=PALE, ut=.8); ell(c, 31, by + .3, 5.6, 6.2, DEER, under=PALE, ut=.8)
        ell(c, 16, by + 1.5, 4.2, 5, DEER)
        tail_up = pose in ('alert', 'run')
        ell(c, 9.6 if not tail_up else 9.2, by - 5 if not tail_up else by - 7.5, 1.5 if not tail_up else 2.1, 2.4 if not tail_up else 3, PALE)
        back_leg(c, (14.5, by + 1), A[0], DEER, 1); front_leg(c, (31, by + 3), A[2], DEER, 1, bend)
        if pose == 'graze':
            limb(c, [(32, by - 2), (37, by + 4), (40, by + 9)], lambda t: 6 - t * 2.6, DEER)
            hy = by + 12 - f * .6
            ell(c, 41, hy, 3, 3.6, DEER, rot=.35); ell(c, 42.4, hy + 3.2, 2, 2.2, DEERD, rot=.3); c.p(42.6, hy + 5, (20, 14, 12)); c.p(41.8, hy - .8, (16, 10, 10))
            ell(c, 38, hy - 3, 1.2, 2.8, DEER, rot=-1.0)
            if stag:
                limb(c, [(39.5, hy - 3), (36, hy - 6), (34, hy - 10)], 1.6, ANT); limb(c, [(36.5, hy - 5.5), (38.5, hy - 9)], 1.2, ANT)
            return
        up = {'alert': -3.5, 'run': -1}.get(pose, math.sin(ph) * .7)
        nk = [(32, by - 3), (34.5, by - 8), (36, by - 12 + up)]
        limb(c, nk, lambda t: 6.4 - t * 2.4, DEER)
        hx, hy = 38.5, by - 14 + up
        ell(c, hx - 2.4, hy - 3.6, 1.3, 3.2, DEERD, rot=-.75)   # the far ear
        ell(c, hx, hy, 3.6, 3, DEER); ell(c, hx + 3.8, hy + 1.3, 3, 2, DEER, under=PALE, ut=.5); c.p(hx + 6.4, hy + 1, (24, 16, 14)); c.p(hx + 6.4, hy + 1.6, (40, 28, 24))
        c.p(hx + .4, hy - .6, (14, 8, 8)); c.p(hx - .3, hy - .6, (226, 214, 190))
        ell(c, hx - 1.2, hy - 4, 1.3, 3.2, DEER, rot=-.35 if pose == 'alert' else -.7)   # the near ear
        if stag:
            for s, R, k in ((1, ANT, .7), (0, ANT, 1)):
                bx, b0 = hx - .5 + s * 1.2, hy - 2.6
                limb(c, [(bx, b0), (bx - 3, b0 - 5), (bx - 3, b0 - 10), (bx - .5, b0 - 14), (bx + 3, b0 - 15.5)], lambda t: 1.9 - t * .7, R, k)
                limb(c, [(bx - 1.4, b0 - 2), (bx + 2, b0 - 3)], 1.2, R, k); limb(c, [(bx - 3, b0 - 7), (bx + 1, b0 - 9)], 1.2, R, k); limb(c, [(bx - 2, b0 - 11.5), (bx + 2, b0 - 13)], 1.1, R, k)
    return draw


# ---------------------------------------------------------------- rabbit
RAB = ramp('#8e7c62'); RABD = ramp('#6a5a46')
def rabbit(pose, f):
    def draw(c):
        G = 14; lift = {('hop', 1): 2, ('hop', 2): 4, ('hop', 3): 1}.get((pose, f), 0); st = 1.3 if (pose == 'hop' and f in (1, 2)) else 1
        bx = 8; by = 10 - lift
        if pose == 'hop' and f == 1: limb(c, [(5, by + 2), (2, by + 4)], 2, RABD)      # back legs kicking
        ell(c, bx - 1.5, by + .5, 4.2, 3.6, RAB, under=PALE); ell(c, bx + .5, by - .2, 5.5 * st, 3.8, RAB, under=PALE)
        ell(c, 2.6 - (st - 1) * 3, by - .8, 1.7, 1.7, PALE)
        hx, hy = bx + 5.2 * st, by - 2.8 - (.5 if (pose == 'sit' and f == 1) else 0)
        ell(c, hx - 1.4, hy - 4, 1.1, 3.3, RABD, rot=-.35); ell(c, hx - .6, hy - 4.3, 1.1, 3.4, RAB, rot=-.25)
        ell(c, hx, hy, 3, 2.6, RAB); c.p(hx + .8, hy - .6, (14, 10, 10)); c.p(hx + 2.8, hy + .4, (180, 120, 120) if f % 2 == 0 else (150, 100, 100))
        if lift < 3: c.p(bx + 4, by + 3.5, RAB[2]); c.p(bx + 5, by + 3.5, RAB[3])
    return draw


# ---------------------------------------------------------------- squirrel
SQ = ramp('#b4602a'); SQD = ramp('#8a4420')
def squirrel(pose, f):
    def draw(c):
        if pose == 'run':
            st = [1.0, 1.25, .9][f]; by = 10 - (1 if f == 1 else 0)
            for i in range(6):   # the tail streams out behind
                t = i / 5; ell(c, 5 - t * 4 - f * .5, by - 2 - t * 4 + math.sin(t * 3 + f) * 1.2, 2.6 + t * .6, 2.2 + t * .4, SQ if i % 2 else SQD)
            ell(c, 9, by, 4.6 * st, 2.8, SQ, under=PALE); ell(c, 13.5 + (st - 1) * 3, by - 1.5, 2.6, 2.2, SQ)
            c.p(14.2 + (st - 1) * 3, by - 2, (14, 10, 10)); ell(c, 12.5 + (st - 1) * 3, by - 4, .9, 1.4, SQD)
            limb(c, [(7, by + 2), (5 - f, by + 4)], 1.4, SQD); limb(c, [(11, by + 2), (12 + f, by + 4)], 1.4, SQD)
        else:
            for i in range(7):   # the tail up the back, curling over at the top
                t = i / 6; ell(c, 5 + math.sin(t * 2.6) * 2.2, 12 - t * 10, 2.6 + math.sin(t * 3) * .8, 2.3, SQ if i % 2 else SQD)
            ell(c, 9.5, 9, 3.2, 4.4, SQ, under=PALE); ell(c, 10.6, 3.8 + (.5 if f else 0), 2.5, 2.2, SQ)
            c.p(11.4, 3.2 + (.5 if f else 0), (14, 10, 10)); ell(c, 9.4, 1.4 + (.5 if f else 0), .8, 1.3, SQD)
            ell(c, 12, 7, 1.3, 1.2, ramp('#7a5028', 4)); limb(c, [(10, 12), (12, 13)], 1.4, SQD)
    return draw


# ---------------------------------------------------------------- robin
BR = ramp('#7a5c40'); BREAST = ramp('#d06a2c', 5)
def bird(pose, f):
    def draw(c):
        by = 6 - (1 if pose == 'hop' and f == 1 else 0)
        if pose == 'fly':
            ell(c, 6, 5, 3.4, 2, BR, under=BREAST); ell(c, 9, 4, 1.8, 1.7, BR); c.p(10.8, 4.2, (220, 170, 60))
            wy = -3 if f == 0 else 3
            for j in range(5): limb(c, [(5 + j * .3, 4.5), (3 + j, 4.5 + wy * (1 - j / 6))], 1.2, BR, .9)
            limb(c, [(3, 5), (0, 4)], 1.4, ramp('#4a3424', 4)); return
        ell(c, 5.5, by, 3.2, 2.4, BR, under=BREAST)
        limb(c, [(3, by - .5), (.5, by - 1.5)], 1.5, ramp('#4a3424', 4))
        hx, hy = (8.6, by - 2) if pose != 'peck' else (9, by + .5)
        ell(c, hx, hy, 1.9, 1.8, BR); c.p(hx + 1.9, hy + .3, (224, 176, 60)); c.p(hx + .4, hy - .4, (12, 8, 8))
        c.p(5, by + 2.5, (90, 70, 50)); c.p(6.5, by + 2.5, (90, 70, 50)); c.p(5, by + 3, (90, 70, 50)); c.p(6.5, by + 3, (90, 70, 50))
    return draw


# ---------------------------------------------------------------- mallard
GREYD = ramp('#9a9a92'); HEN = ramp('#8a6a44'); GREEN = ramp('#2e6a3a', 5, spread=1.1); CHEST = ramp('#6a3a2a', 5); BILL = ramp('#e0a830', 4)
def duck(drake, pose, f):
    def draw(c):
        WL = 10   # the waterline: nothing below it shows
        bob = (0, .6)[f % 2] if pose == 'swim' else 0
        body = GREYD if drake else HEN
        if pose == 'dabble':
            ell(c, 9, 8, 6.5, 3.2, body, rot=-.7, clipy=WL, spots=None if drake else 4); ell(c, 5, 3.5, 2, 1.5, ramp('#3a3a3a', 4) if drake else HEN, rot=-.9, clipy=WL)
            return
        ell(c, 9, 8 + bob, 7, 3.6, body, clipy=WL, spots=None if drake else 4)
        if drake: ell(c, 13.5, 7.6 + bob, 2.8, 2.6, CHEST, clipy=WL)
        limb(c, [(3, 7 + bob), (1.4, 5.4 + bob)], 2, ramp('#2a2a2a', 4) if drake else HEN)
        limb(c, [(13.5, 7 + bob), (14.5, 3.6 + bob)], 2.6, GREEN if drake else HEN)
        ell(c, 15, 2.8 + bob, 2.6, 2.3, GREEN if drake else HEN, spots=None if drake else 6)
        if drake:
            for x in range(13, 17): c.p(x, 5.4 + bob, (236, 236, 228))
        c.p(15.6, 2.2 + bob, (10, 8, 8)); limb(c, [(17.2, 3.4 + bob), (19.2, 3.9 + bob)], 1.6, BILL)
    return draw


# ---------------------------------------------------------------- fox
FOX = ramp('#c8642a'); FOXD = ramp('#9a4a1e'); BLK = ramp('#2a2224', 4)
def fox(pose, f):
    def draw(c):
        if pose == 'sit':
            ell(c, 7, 17, 6, 3, FOX, rot=.1); ell(c, 2, 18, 2, 1.6, PALE)
            ell(c, 15, 12, 4.5, 6, FOX, under=PALE); limb(c, [(17, 14), (18, 20)], 1.8, BLK)
            ell(c, 18, 5, 3.6, 3, FOX); ell(c, 21.4, 6.4, 2.2, 1.6, FOX, under=PALE); c.p(23.4, 6, (14, 10, 10)); c.p(18.6, 4.2, (14, 10, 10))
            for ex in (15.8, 18.2): ell(c, ex, 1.6, 1.1, 2.2, BLK if ex < 17 else FOXD)
            return
        ph = f / 4 * 2 * math.pi; by = 11 + (abs(math.sin(ph)) * -.8)
        for (hx, a, R, k) in ((12, math.sin(ph + math.pi) * .45, BLK, .6), (22, math.sin(ph) * .45, BLK, .6)): limb(c, [(hx, by + 2), (hx + math.sin(a) * 7, by + 9)], 1.8, R, k)
        ell(c, 6.5, by - 1, 7, 2.8, FOX, rot=.25); ell(c, 1, by + 1, 2.2, 1.8, PALE)   # the brush, white-tipped
        ell(c, 16, by, 8.5, 4, FOX, under=PALE)
        for (hx, a) in ((10, math.sin(ph) * .45), (20, math.sin(ph + math.pi) * .45)): limb(c, [(hx, by + 2), (hx + math.sin(a) * 7, by + 9)], 2, BLK, 1)
        ell(c, 26, by - 3, 3.6, 3, FOX); ell(c, 29.6, by - 1.8, 2.4, 1.6, FOX, under=PALE); c.p(31.8, by - 2.2, (14, 10, 10)); c.p(26.8, by - 4, (14, 10, 10))
        for ex in (23.8, 26.2): ell(c, ex, by - 6.6, 1.1, 2, BLK if ex < 25 else FOXD)
    return draw


# ---------------------------------------------------------------- front and back views, for running toward you and away
RUNF = [(0, (0, 6), (6, 0)), (2, (1, 2), (0, 0)), (4, (6, 6), (5, 5)), (1, (6, 0), (0, 6))]   # lift, front legs tuck, hind legs tuck
WALKF = [(0, (0, 2), (2, 0)), (0, (1, 1), (1, 1)), (0, (2, 0), (0, 2)), (0, (1, 1), (1, 1))]
def deer_fb(stag, pose, f, back):
    """seen from the front (toward you) or the back (away): legs reach and tuck in turn, the body bobs, a running deer's
    white tail flags up"""
    def draw(c):
        lift, ft, ht = (RUNF if pose == 'run' else WALKF)[f]; by = 29 - lift; cx = 27
        def leg(x, top, tuck, R, k, ground):
            hy = ground - tuck - lift * .4; kn = (x + (1 if x > cx else -1) * min(2, tuck * .4), (top + hy) / 2 - tuck * .2)
            limb(c, [(x, top), kn], lambda t: 2.6 - t * .8, R, k); limb(c, [kn, (x, hy)], 1.5, R, k); c.p(x, hy, HOOF[1]); c.p(x + 1, hy, HOOF[0])
        def antlers(y0, R):
            for sd in (-1, 1):
                b = (cx + sd * 2, y0); pts = [b, (cx + sd * 5, y0 - 4), (cx + sd * 8, y0 - 9), (cx + sd * 8.5, y0 - 13)]
                limb(c, pts, lambda t: 1.8 - t * .7, R); limb(c, [(cx + sd * 5.5, y0 - 5), (cx + sd * 3.5, y0 - 9)], 1.1, R); limb(c, [(cx + sd * 7.6, y0 - 9.5), (cx + sd * 11, y0 - 11)], 1.1, R)
        if not back:
            # coming toward you: the hind legs show behind the front ones, shorter and in shade; then the chest, the near legs, the head
            leg(cx - 2.5, by + 2, ht[0], DEERD, .62, 45); leg(cx + 2.5, by + 2, ht[1], DEERD, .62, 45)
            ell(c, cx, by - 1, 7.4, 6.4, DEER, under=PALE, ut=.7); ell(c, cx, by + 1.5, 6, 5.4, DEER, under=PALE, ut=.45)
            leg(cx - 4, by + 4, ft[0], DEER, 1, 47); leg(cx + 4, by + 4, ft[1], DEER, 1, 47)
            limb(c, [(cx, by - 2), (cx, by - 7), (cx, by - 10)], lambda t: 5.6 - t * 1.6, DEER)
            hy = by - 13
            for sd, R in ((-1, DEERD), (1, DEER)):
                ell(c, cx + sd * 5.2, hy - 3, 2.8, 1.3, R, rot=-sd * .45); c.p(cx + sd * 5.2, hy - 3, PALE[3])
            ell(c, cx, hy, 3.6, 3.8, DEER); ell(c, cx, hy + 2.6, 2.3, 2, PALE); c.p(cx, hy + 4, (24, 16, 14)); c.p(cx - 1, hy + 4, (40, 28, 24))
            for sd in (-1, 1): c.p(cx + sd * 2.2, hy - .8, (14, 8, 8)); c.p(cx + sd * 2.2 - sd, hy - 1.3, (226, 214, 190))
            if stag: antlers(hy - 3.2, ANT)
        else:
            # going away: the far front legs and the head first, then the rump with its white patch and tail, then the near hind legs
            leg(cx - 2.5, by + 2, ft[0], DEERD, .62, 45); leg(cx + 2.5, by + 2, ft[1], DEERD, .62, 45)
            limb(c, [(cx, by - 3), (cx, by - 8)], lambda t: 5 - t * 1.4, DEERD, .9)
            hy = by - 11.5
            if stag: antlers(hy - 2.4, ANT)
            ell(c, cx, hy, 3.2, 3.1, DEERD)
            for sd in (-1, 1): ell(c, cx + sd * 4.6, hy - 2.2, 2.6, 1.2, DEER, rot=-sd * .45)
            ell(c, cx, by, 7.2, 6.6, DEER, under=PALE, ut=.85); ell(c, cx, by - .4, 3.4, 4.2, PALE)
            if pose == 'run': ell(c, cx, by - 6.4, 1.9, 3.3, PALE); c.p(cx, by - 9, PALE[5])
            else: ell(c, cx, by - 3.6, 1.4, 2.2, DEERD)
            leg(cx - 4, by + 3, ht[0], DEER, 1, 47); leg(cx + 4, by + 3, ht[1], DEER, 1, 47)
    return draw


def rabbit_fb(f, back):
    def draw(c):
        lift = {1: 2, 2: 4, 3: 1}.get(f, 0); by = 11 - lift; cx = 10
        if not back:
            ell(c, cx, by, 3.8, 3.5, RAB, under=PALE, ut=.4)
            if lift < 3:
                for sd in (-1, 1): ell(c, cx + sd * 2.2, by + 3.2, 1.3, .9, PALE)
            ell(c, cx, by - 3.6, 2.8, 2.4, RAB)
            for sd, R in ((-1, RABD), (1, RAB)): ell(c, cx + sd * 1.3, by - 7.4, 1, 2.8, R, rot=sd * .18); c.p(cx + sd * 1.3, by - 7.4, (190, 140, 140))
            for sd in (-1, 1): c.p(cx + sd * 1.4, by - 4, (14, 10, 10))
            c.p(cx, by - 2.6, (190, 120, 120))
        else:
            ell(c, cx, by - 3.4, 2.7, 2.3, RABD)
            for sd in (-1, 1): ell(c, cx + sd * 1.3, by - 7.2, 1, 2.8, RAB, rot=sd * .18)
            ell(c, cx, by, 3.9, 3.6, RAB); ell(c, cx, by + .9, 1.6, 1.5, PALE)
            if lift < 3:
                for sd in (-1, 1): ell(c, cx + sd * 2.4, by + 3.3, 1.2, .9, RABD)
    return draw


def fox_fb(f, back):
    def draw(c):
        ph = f / 4 * 2 * math.pi; by = 11 + abs(math.sin(ph)) * -.8; cx = 17; sw = math.sin(ph)
        def leg(x, a, R, k, top, gy): limb(c, [(x, top), (x, gy - max(0, a) * 2.5)], 1.8, R, k)
        if not back:
            ell(c, cx + 3.6 + sw, by + 1.6, 2.4, 1.7, FOX, rot=.3); ell(c, cx + 5.4 + sw, by + 2.2, 1.1, 1, PALE)   # the brush, mostly hidden behind
            leg(cx - 1.4, -sw, BLK, .6, by + 2, 18); leg(cx + 1.4, sw, BLK, .6, by + 2, 18)
            ell(c, cx, by + .5, 4.6, 3.8, FOX, under=PALE, ut=.3)
            leg(cx - 2.4, sw, BLK, 1, by + 3, 20); leg(cx + 2.4, -sw, BLK, 1, by + 3, 20)
            hy = by - 4
            for sd, R in ((-1, BLK), (1, FOXD)): ell(c, cx + sd * 2.6, hy - 3.2, 1.1, 2, R, rot=sd * .3)
            ell(c, cx, hy, 3.4, 3, FOX); ell(c, cx, hy + 1.6, 1.9, 1.4, PALE); c.p(cx, hy + 2.6, (14, 10, 10))
            for sd in (-1, 1): c.p(cx + sd * 1.5, hy - .6, (14, 10, 10))
        else:
            leg(cx - 1.4, sw, BLK, .6, by + 2, 18); leg(cx + 1.4, -sw, BLK, .6, by + 2, 18)
            hy = by - 4; ell(c, cx, hy, 3.2, 2.8, FOXD)
            for sd in (-1, 1): ell(c, cx + sd * 2.4, hy - 3, 1.1, 2, BLK, rot=sd * .3)
            ell(c, cx, by, 4.8, 3.8, FOX)
            leg(cx - 2.6, -sw, BLK, 1, by + 3, 20); leg(cx + 2.6, sw, BLK, 1, by + 3, 20)
            tx = cx + sw * 2.4; ell(c, tx, by + 2.6, 2.2, 4, FOX, rot=sw * .3); ell(c, tx + sw * .8, by + 6, 1.5, 1.4, PALE)   # the brush swinging behind
    return draw


def squirrel_fb(f, back):
    def draw(c):
        by = 10 - (1 if f == 1 else 0); cx = 10
        tail = lambda: [ell(c, cx + math.sin(i * .9 + f) * 1.2, by - 1 - i * 1.6, 2.4 + i * .15, 2, SQ if i % 2 else SQD) for i in range(6)]
        if not back:
            tail(); ell(c, cx, by, 2.8, 2.8, SQ, under=PALE, ut=.2); ell(c, cx, by - 3, 2.2, 2, SQ)
            for sd in (-1, 1): ell(c, cx + sd * 1.6, by - 5, .7, 1.1, SQD); c.p(cx + sd * 1, by - 3.4, (14, 10, 10))
            for sd, up in ((-1, f % 2), (1, 1 - f % 2)): c.p(cx + sd * 1.6, by + 2.6 - up, SQD[1])
        else:
            for sd in (-1, 1): ell(c, cx + sd * 1.6, by - 4.6, .7, 1.1, SQD)
            ell(c, cx, by - 2.8, 2.1, 1.9, SQD); ell(c, cx, by, 2.9, 2.8, SQ)
            for sd, up in ((-1, f % 2), (1, 1 - f % 2)): c.p(cx + sd * 1.6, by + 2.6 - up, SQD[1])
            tail()
    return draw


sheet('wild_doe', 54, 50, 47, [('walk', [deer(False, 'walk', i) for i in range(4)]), ('run', [deer(False, 'run', i) for i in range(4)]), ('graze', [deer(False, 'graze', i) for i in range(2)]), ('alert', [deer(False, 'alert', 0)]),
      ('walk', [deer_fb(False, 'walk', i, False) for i in range(4)], 'F'), ('walk', [deer_fb(False, 'walk', i, True) for i in range(4)], 'B'),
      ('run', [deer_fb(False, 'run', i, False) for i in range(4)], 'F'), ('run', [deer_fb(False, 'run', i, True) for i in range(4)], 'B')])
sheet('wild_stag', 54, 50, 47, [('walk', [deer(True, 'walk', i) for i in range(4)]), ('run', [deer(True, 'run', i) for i in range(4)]), ('graze', [deer(True, 'graze', i) for i in range(2)]), ('alert', [deer(True, 'alert', 0)]),
      ('walk', [deer_fb(True, 'walk', i, False) for i in range(4)], 'F'), ('walk', [deer_fb(True, 'walk', i, True) for i in range(4)], 'B'),
      ('run', [deer_fb(True, 'run', i, False) for i in range(4)], 'F'), ('run', [deer_fb(True, 'run', i, True) for i in range(4)], 'B')])
sheet('wild_rabbit', 20, 16, 14, [('sit', [rabbit('sit', i) for i in range(2)]), ('hop', [rabbit('hop', i) for i in range(4)]),
      ('hop', [rabbit_fb(i, False) for i in range(4)], 'F'), ('hop', [rabbit_fb(i, True) for i in range(4)], 'B')])
sheet('wild_squirrel', 20, 16, 14, [('run', [squirrel('run', i) for i in range(3)]), ('sit', [squirrel('sit', i) for i in range(2)]),
      ('run', [squirrel_fb(i, False) for i in range(3)], 'F'), ('run', [squirrel_fb(i, True) for i in range(3)], 'B')])
sheet('wild_bird', 13, 11, 9, [('stand', [bird('stand', 0)]), ('peck', [bird('peck', 0)]), ('hop', [bird('hop', i) for i in range(2)]), ('fly', [bird('fly', i) for i in range(2)])])
sheet('wild_drake', 21, 13, 10, [('swim', [duck(True, 'swim', i) for i in range(2)]), ('dabble', [duck(True, 'dabble', 0)])])
sheet('wild_hen', 21, 13, 10, [('swim', [duck(False, 'swim', i) for i in range(2)]), ('dabble', [duck(False, 'dabble', 0)])])
sheet('wild_fox', 34, 22, 20, [('trot', [fox('trot', i) for i in range(4)]), ('sit', [fox('sit', 0)]),
      ('trot', [fox_fb(i, False) for i in range(4)], 'F'), ('trot', [fox_fb(i, True) for i in range(4)], 'B')])
d = json.load(open('spr/lpc/objects.json')); d.update(SPR); json.dump(d, open('spr/lpc/objects.json', 'w'))
