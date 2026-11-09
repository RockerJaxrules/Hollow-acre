"""The cows, second pass (judge, animals 3/10: "the cows need a lit edge, a cool shade and knees").

Same layout, head and markings as world67.py's cows (they read well), with the body lit as a volume from the top-left
(four steps by surface normal: a lit rim on the upper-left edge, the base, a cool lilac shade on the lower right, a deep
step only along the belly line), and legs drawn as legs: a thick upper leg running into the body, a knee, a thin
cannon, a dark hoof with one lit pixel. Writes spr/lpc/obj/cow_1.png and cow_2.png (old ones kept in
spr/backup_v2/animals) with --install; otherwise previews into the folder given.

    python3 tools/px/cows2.py OUTDIR | --install        (run from hollow-acre/2d)
"""
import sys, os, math, random, shutil
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'world67.py')).read()
exec(src[:src.index('# ---- picket fence')])    # OUT, hexc, H, vnoise, Pic


def mix(a, b, t):
    a, b = hexc(a)[:3] if isinstance(a, str) else a[:3], hexc(b)[:3] if isinstance(b, str) else b[:3]
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3)) + (255,)


def cow(out, name, ramp, spot_ramp, belly, face, seed, white, belly_ramp=None):
    """ramp: rim, lit, base, shade (cool), deep; spot_ramp: lit, base, shade"""
    P = Pic(54, 34); random.seed(seed); P.ell_shadow(30, 31, 21, 2.6, 80)   # cast down-right
    HOOF = ('#4a3a34', '#2e221e', '#1e1614')

    def leg(x, near, hind):
        """a front leg has a knee (a knob at the front); a hind leg bends backward at the hock. Far legs one step darker"""
        R = ramp if near else (ramp[2], ramp[3], ramp[3], ramp[4], ramp[4])
        for y in range(19, 30):
            ww = 4 if near else 3
            if hind:
                if y < 22: xs, w = x, ww                 # the thigh, into the body
                elif y < 24: xs, w = x + 1, ww - 1       # the gaskin, slanting back
                elif y == 24: xs, w = x + 2, 3           # the hock: proud at the back (+x, the cow faces left)
                elif y < 27: xs, w = x + 2, 2            # the cannon, angled back under the hock
                else: xs, w = x + 1, 2
            else:
                if y < 23: xs, w = x, ww                 # the forearm
                elif y == 23: xs, w = x - 1, 4           # the knee: proud at the front
                else: xs, w = x, 2                       # the cannon
            for dx in range(w):
                X = xs + dx
                if y >= 28: c = HOOF[0] if (dx == 0 and y == 28) else HOOF[1] if y == 28 else HOOF[2]
                else:
                    c = R[1] if dx == 0 else R[2] if dx < w - 1 else R[3]
                    if ((hind and y == 24 and dx == w - 1) or (not hind and y == 23 and dx == 0)) and near: c = R[0]   # the joint catches light
                P.p(X, y, c)

    leg(18, False, False); leg(41, False, True)   # far legs, offset 4-5 px so each pair reads as two legs
    # the barrel, lit as a volume from the upper left: steps by the surface normal, not by height bands
    cx, cy, rx, ry = 29, 15.5, 15.5, 8.2
    Lx, Ly, Lz = -.5, -.62, .6
    for y in range(6, 26):
        for x in range(12, 47):
            u, v = (x + .5 - cx) / rx, (y + .5 - cy) / ry
            d = u * u + v * v
            if d > 1: continue
            nz = math.sqrt(1 - d); l = u * Lx + v * Ly + nz * Lz + .07 * math.sin(x * .55 + y * .9) + .05 * math.sin(x * 1.3 - y * .4)   # wandering borders, not stairs
            step = 0 if l > .78 else 1 if l > .5 else 2 if l > .12 else 3
            if v > .72 and d > .55: step = 4          # the deepest step only along the belly line
            c = ramp[step]
            if belly_ramp and v > .38 and step < 4: c = belly_ramp[min(2, max(0, step - 1))]   # the cream belly, lit the same way
            if spot_ramp:
                n = vnoise(x / 6.5, y / 4.2, seed) * .75 + vnoise(x / 2.5, y / 2.0, seed + 5) * .25
                if n > .58 and v < .86: c = spot_ramp[0 if step <= 1 else 1 if step == 2 else 2]
            P.p(x, y, c)
    # the lit rim: a broken line of the rim colour along the upper-left of the back
    for x in range(14, 40):
        yy = None
        for y in range(5, 26):
            if P.get(x, y)[3]: yy = y; break
        if yy is not None and (x < 33 or x % 3) : P.p(x, yy, ramp[0] if not (spot_ramp and P.get(x, yy)[:3] in (hexc(s)[:3] for s in spot_ramp)) else spot_ramp[0])
    # udder and teats
    for y in range(22, 26):
        for x in range(34, 39):
            if ((x - 36.5) / 2.6) ** 2 + ((y - 23) / 2.2) ** 2 <= 1: P.p(x, y, '#e8a4a0' if y < 24 else '#c88488')
    P.p(35, 26, '#b87478'); P.p(37, 26, '#b87478')
    leg(13, True, False); leg(37, True, True)
    # the tail down the rump, lit on its left, with a dark tuft
    # the tail hangs from the top of the rump against it, curving out a little, ending in a tuft at hock height
    for k, (tx, ty) in enumerate(((44, 9), (45, 10), (46, 11), (46, 12), (47, 13), (47, 14), (47, 15), (47, 16), (47, 17), (46, 18), (46, 19), (46, 20))):
        P.p(tx, ty, ramp[3])
    for tx, ty in ((45, 21), (46, 21), (47, 21), (45, 22), (46, 22), (46, 23)): P.p(tx, ty, '#2a201c')
    P.p(45, 21, '#4a3a34')
    # neck and head (the old ones, which read well), with the cool shade under the jaw
    for y in range(8, 18):
        for x in range(9, 16):
            if x - 9 > (17 - y) * .7 + 1: continue
            P.p(x, y, ramp[1] if y < 11 else ramp[2] if y < 14 else ramp[3])
    for y in range(5, 15):
        for x in range(3, 12):
            if ((x - 7.5) / 4.6) ** 2 + ((y - 9.5) / 4.8) ** 2 > 1: continue
            c = face if y < 12 else mix(face, ramp[3], .6)
            if (x - 7.5) + (y - 9.5) < -4: c = ramp[0]
            if spot_ramp and x > 9 and y < 8: c = spot_ramp[1]   # the head patch: the poll only, clear of the eye
            P.p(x, y, c)
    for y in range(11, 17):
        for x in range(1, 8):
            if ((x - 4) / 3.4) ** 2 + ((y - 13.8) / 2.9) ** 2 > 1: continue
            P.p(x, y, '#e8b4a4' if y < 15 else '#c8949a')
    P.p(2, 13, '#3a2020'); P.p(5, 13, '#3a2020'); P.p(3, 16, '#a07070')
    for ex, ey in ((6, 7), (7, 7), (8, 7), (6, 10), (7, 10), (8, 10), (5, 8), (5, 9), (9, 8), (9, 9)): P.p(ex, ey, ramp[1] if not white else ramp[1])   # a lighter patch round the eye
    for ex, ey in ((6, 8), (7, 8), (6, 9), (7, 9)): P.p(ex, ey, '#140c0c')   # the eye: 2x2, dark
    P.p(6, 8, '#d8d4d0')   # its glint
    for dx_, dy_ in ((14, 18), (14, 19), (15, 19), (14, 20)): P.p(dx_, dy_, ramp[3])   # the dewlap under the neck
    for hx_ in (38, 39, 40, 41): P.p(hx_, 7 if hx_ in (39, 40) else 8, ramp[1])   # the hip point on the rump
    for x, y in ((11, 6), (12, 6), (13, 7), (12, 7)): P.p(x, y, spot_ramp[1] if spot_ramp else face)
    P.p(13, 8, '#e8a4a0')
    for x, y in ((9, 3), (10, 3), (10, 4), (5, 3), (5, 4)): P.p(x, y, '#e8e0c8')
    P.p(10, 2, '#b8b098')
    # the outline: a darker version of the colour beside it (lighter on the lit top-left), never one flat black
    add = []
    for y in range(P.h):
        for x in range(P.w):
            if P.px[x, y][3]: continue
            for dx, dy in ((1, 0), (0, 1), (-1, 0), (0, -1)):
                q = P.get(x + dx, y + dy)
                if q[3] > 60:
                    k = .3 if (dx > 0 or dy > 0) else .18     # the neighbour is to the right/below: we sit on its top-left, a touch lighter
                    add.append((x, y, (int(q[0] * k + 20 * (1 - k) * .3), int(q[1] * k + 14 * (1 - k) * .3), int(q[2] * k + 26 * (1 - k) * .3), 255))); break
    for x, y, c in add: P.px[x, y] = c
    P.save(os.path.join(out, name + '.png'))


if __name__ == '__main__':
    inst = '--install' in sys.argv
    out = 'spr/lpc/obj' if inst else sys.argv[1]
    if inst:
        os.makedirs('spr/backup_v2/animals', exist_ok=True)
        for n in ('cow_1', 'cow_2'):
            bk = f'spr/backup_v2/animals/{n}_v1.png'
            if not os.path.exists(bk): shutil.copy(f'spr/lpc/obj/{n}.png', bk)
    os.makedirs(out, exist_ok=True)
    # white with black patches: rim, lit, base, cool lilac shade, deep lilac
    cow(out, 'cow_1', ('#e4e0da', '#d6d2cc', '#c4c0bc', '#9e98b2', '#7a7494'), ('#3a3438', '#242026', '#18141c'), '#e4ddd2', '#d6d2cc', 4, True)   # capped near 85%: a dusk farm
    # brown: rim, lit, base, cool plum-brown shade, deep
    cow(out, 'cow_2', ('#d6a672', '#c0905c', '#a47648', '#7a5650', '#563c46'), None, '#e2c8a4', '#b88454', 9, False, ('#b48a5c', '#94704c', '#6e5048'))   # belly: tan -> warm brown -> plum-brown
    print('cows written to', out)
