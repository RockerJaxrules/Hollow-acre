"""The dead deer (story: 'Something kept time'), redrawn in the living doe's style (judge, animals 3/10: "soft rendered
gradients; redraw side-on in the drawn style at cow scale with a flat-colour pool").

It lies on its right side, back to the top of the screen, pale belly and stiff legs toward the viewer, neck stretched,
head flat on the ground with the eye shut. Same lit-ellipse and limb primitives, palette and outline as fauna.py's doe,
so it reads as the same animal. A flat dark pool under it with a hard edge and one lit rim (no gradient, no stripes).

    python3 tools/dead_deer.py [--install]     (run from hollow-acre/2d; writes spr/lpc/obj/deer_dead.png)
"""
import sys, os, math, json, shutil
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fauna.py')).read()
exec(src[:src.index('# ---------------------------------------------------------------- rabbit')])   # ramp, C, ell, limb, DEER, PALE, ...

W, H = 64, 30
POOL = [(36, 6, 12), (66, 10, 18), (104, 22, 28)]   # flat: deep, body, a lit rim on the far edge (darker than grass)
WOUND = [(40, 6, 12), (110, 18, 26), (168, 52, 52), (214, 196, 178)]   # the hole, wet flesh, its lit lip, a rib


def limb2(c, pts, w, R, k=1.0):
    """a limb with real thickness across its direction (fauna.limb only widens along x, so a lying leg came out 1 px):
    lit on the side that faces up-left"""
    n = len(R)
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        L = max(1e-6, math.hypot(x1 - x0, y1 - y0)); nx, ny = -(y1 - y0) / L, (x1 - x0) / L
        if nx * -.6 + ny * -.8 < 0: nx, ny = -nx, -ny          # the normal that faces the light
        steps = max(2, int(L * 3))
        for i in range(steps + 1):
            t = i / steps; x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t; ww = w(t) if callable(w) else w
            for j in range(int(math.ceil(ww * 2)) + 1):
                o = -ww / 2 + j * .5
                if o > ww / 2: break
                u = (o + ww / 2) / max(.5, ww)                      # 1 on the lit side
                l = (.3 + .55 * u) * k
                c.p(x + nx * o, y + ny * o, R[max(0, min(n - 1, int(round(l * (n - 1)))))])


def pool(c):
    """thickest under the wound, run out down-right (the light is top-left), an uneven edge, two glossy patches"""
    for y in range(H):
        for x in range(W):
            a = math.atan2((y + .5 - 24.5) * 4, x + .5 - 31)
            rr = 1 + .14 * math.sin(3 * a + 1) + .09 * math.sin(5 * a + 2.2)
            d = ((x + .5 - 31) / 19) ** 2 + ((y + .5 - 24.5) / 4.4) ** 2
            d2 = ((x + .5 - 40) / 8) ** 2 + ((y + .5 - 27.5) / 2.2) ** 2   # where it ran down-right
            if d < rr * rr or d2 < 1:
                c.p(x, y, POOL[0] if (d > rr * rr * .66 and d2 >= .6) else POOL[1])
    for gx, gy in ((19, 22), (20, 22), (21, 22), (20, 23), (21, 23)): c.p(gx, gy, POOL[2])   # one wet highlight, top-left


def leg(c, hip, ang, ln1, ln2, bend, R, k):
    """a stiff leg at the doe's weight: thigh 3 px, a knee, cannon 2 px, a dark hoof"""
    kx, ky = hip[0] + math.sin(ang) * ln1, hip[1] + math.cos(ang) * ln1
    fx, fy = kx + math.sin(ang + bend) * ln2, ky + math.cos(ang + bend) * ln2
    limb2(c, [hip, (kx, ky)], lambda t: 3.2 - t * 1.0, R, k)
    limb2(c, [(kx, ky), (fx, fy)], 2.0, R, k)
    hx, hy = fx + math.sin(ang + bend) * 1.3, fy + math.cos(ang + bend) * 1.3
    for ox, oy in ((0, 0), (1, 0), (0, 1), (1, 1)): c.p(hx + ox, hy + oy, HOOF[1] if (ox + oy) else HOOF[0])


def body(c):
    by = 13
    # far legs first, in shade: the far hind cocked up and back, the far fore forward
    leg(c, (14, by + 3), -2.3, 5, 5, .5, DEERD, .7)
    leg(c, (33, by + 5), .55, 4.5, 4.5, -1.6, DEERD, .7)        # far fore: folded under the chest
    # one volume: ribcage and haunch as a single barrel lit from the top-left, belly pale only underneath
    ell(c, 25, by + 2, 13.5, 6.6, DEER, under=PALE, ut=.66)
    ell(c, 15.5, by + 1.6, 5.2, 5, DEER, k=.92)
    ell(c, 11, by + 1, 1.6, 2.2, PALE)                        # the tail, limp
    for y in range(by - 1, by + 5):                          # the wound: dark inside, wet flesh, a pale torn lip
        for x in range(21, 32):
            e = ((x + .5 - 26) / 6.2) ** 2 + ((y + .5 - (by + 2) - .25 * math.sin(x * 1.3)) / 1.7) ** 2   # long and ragged, not round
            if e > 1: continue
            col = WOUND[0] if e < .4 else WOUND[1]
            if e > .62 and y + .5 < by + 1.6: col = WOUND[2]                       # a torn lip, one colour (alternating read as teeth)
            c.p(x, y, col)
    for rx_, ry_ in ((24, by + 2), (25, by + 2), (26, by + 3)): c.p(rx_, ry_, WOUND[3])   # one pale rib in the dark
    # near legs: hind stretched back off the pool, fore stretched forward, different angles
    leg(c, (15, by + 6), -1.5, 5.5, 5.5, .35, DEER, .95)
    leg(c, (30, by + 6), .4, 4.5, 5, -1.7, DEER, .95)           # near fore: folded under, hoof tucked back: a gap before the head
    # the neck, thick (the doe's weight), along the ground; the head flat on its cheek, ears laid back, eye shut
    limb2(c, [(37, by + 1), (41.5, by + 2), (46, by + 2.5)], lambda t: 6.4 - t * 1.6, DEER)
    hx, hy = 51, by + 1
    ell(c, hx - 3.4, hy - 4.6, 1.7, 4.4, DEERD, rot=-.75)     # the far ear, behind
    ell(c, hx, hy, 4.6, 3.6, DEER)                             # the skull, lying on its cheek
    ell(c, hx + 5, hy + 1.2, 3.2, 2.3, DEER, under=PALE, ut=.4)   # the long muzzle
    for nx_, ny_ in ((8, .4), (8, 1.2), (7.2, 1.6), (8.6, .8)): c.p(hx + nx_, hy + ny_, (30, 20, 18))   # the dark nose, the doe's
    for ex, ey in ((0, -1), (1, -1), (0, 0), (1, 0)): c.p(hx + .4 + ex, hy - .6 + ey, (18, 10, 10))   # the eye, open and dull: 2x2 dark
    c.p(hx + .4, hy - 1.6, (70, 50, 46))   # a dull glint
    ell(c, hx - 2.4, hy - 4.2, 2.2, 5.0, DEER, rot=-.55)      # the near ear: big, angled back, the strongest deer cue
    ell(c, hx - 2.4, hy - 4.2, 1.0, 3.2, PALE, rot=-.55, k=.75)   # its pale inside, one shape (the ear is the deer cue)
    c.p(hx + 6.6, hy + 3.2, (150, 40, 44)); c.p(hx + 7.4, hy + 3.6, (110, 26, 32))


c = C(W, H)
pool(c)
d = C(W, H); body(d); d.outline()
c.im.alpha_composite(d.im)
OUT = 'spr/lpc/obj/deer_dead.png'
if '--install' in sys.argv:
    os.makedirs('spr/backup_v2/animals', exist_ok=True)
    bk = 'spr/backup_v2/animals/deer_dead_v1.png'
    if not os.path.exists(bk): shutil.copy(OUT, bk)
    c.im.save(OUT); print('installed', OUT)
else:
    c.im.save('/tmp/deer_dead_new.png' if len(sys.argv) < 2 else sys.argv[1]); print('preview written')
