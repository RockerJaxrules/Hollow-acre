"""#198 round 16.
  iron - 'Iron ore' icon (interim; r1: "maroon rust read as meat"; the stand-in's rust marks read as letters): a dark cool chunk
         with flat faces, silver metal glints standing out of it, and ragged orange-brown oxide bleeding DOWN from the cracks
         (rust is never a glyph or a block); its own shape, not the stone's
    python3 icons198k.py -> out/r16_<name>.png
"""
import math, sys
from PIL import Image
sys.path.insert(0, '.')
from icons198 import Icon, RAMPS, hexr, sh

IR = hexr(['#1a1a22', '#262632', '#363644', '#484858', '#5c5c6c', '#747484', '#8e8e9c'])
OX = hexr(['#3e2016', '#5c301c', '#7a4424', '#96592e', '#b0743c'])   # brown oxide, a step off copper's orange
SV = hexr(['#5a5e6a', '#9a9eaa', '#d0d4dc', '#f2f4f8'])


def fill(I, pts, c):
    n = len(pts); ys = [p[1] for p in pts]
    for y in range(int(min(ys)), int(max(ys)) + 1):
        xs = []
        for i in range(n):
            (ax, ay), (bx, by) = pts[i], pts[(i + 1) % n]
            if (ay <= y + .5 < by) or (by <= y + .5 < ay): xs.append(ax + (y + .5 - ay) * (bx - ax) / (by - ay))
        xs.sort()
        for a, b in zip(xs[::2], xs[1::2]):
            for x in range(int(round(a)), int(round(b))): I.P(x, y, c(x, y) if callable(c) else c)


def iron():
    # v2: its own shape (a low, wide, broken slab, not the stone's round chunk), darker and bluer than stone; the rust as two
    # coherent ragged patches round cracks with drips running DOWN the front; three silver glints standing proud
    I = Icon()
    fill(I, [(3, 16), (6, 11), (12, 9), (15, 10), (19, 8), (26, 10), (29, 15), (20, 18), (8, 19)], IR[5])     # top, broken skyline
    fill(I, [(3, 16), (8, 19), (9, 25), (4, 23)], IR[4])                                                        # left face
    fill(I, [(8, 19), (20, 18), (21, 26), (9, 25)], IR[3])                                                      # front
    fill(I, [(20, 18), (29, 15), (29, 21), (25, 25), (21, 26)], IR[2])                                          # right, in shade
    for (x, y) in ((6, 12), (7, 11), (8, 11), (9, 10), (10, 10), (11, 10), (5, 13), (4, 14), (4, 15), (16, 9), (17, 9), (18, 9)):
        I.P(x, y, IR[6])                                                                                      # lit top-left edges
    for x in range(8, 20): I.P(x, 19 if x < 14 else 18, IR[6] if x < 12 else IR[5])                           # the ridge
    for (x, y) in ((14, 10), (14, 11), (15, 12), (15, 13)): I.P(x, y, IR[1])                                  # the notch between the two crowns
    def patch(cx, cy, rx, ry, seed):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 + ((x * 7 + y * 13 + seed) % 5) * .07   # ragged edge
                if d < 1 and I.p[x, y][3]:
                    lit = (x - cx) + (y - cy) < -1
                    I.P(x, y, OX[4] if lit and d < .5 else OX[3] if lit or d < .45 else OX[2])
    patch(22.5, 12.4, 4.6, 2.0, 1); patch(10.6, 14.6, 3.8, 1.8, 3)                           # stains spread thin along the top
    for (x, y, k) in ((21, 18, 2), (21, 19, 1), (22, 19, 2), (21, 20, 1), (21, 21, 0), (22, 22, 1), (22, 23, 0),
                      (11, 19, 2), (11, 20, 1), (12, 21, 1), (11, 22, 0), (12, 23, 0), (24, 18, 1), (24, 19, 0), (25, 20, 0)):
        I.P(x, y, OX[k])                                                                                      # rust running down the faces
    for (x, y, w) in ((7, 11, 3), (17, 10, 3), (13, 21, 3), (24, 14, 2)):                                    # silver metal standing out of it
        for i in range(w):
            I.P(x + i, y, SV[3] if i == 0 else SV[2]); I.P(x + i, y + 1, SV[1] if i < w - 1 else SV[0])
        I.P(x + w, y + 1, IR[0]); I.P(x, y + 2, IR[1])                                                       # its cast shadow, lower right
    for (x, y) in ((22, 12), (23, 13), (10, 15), (11, 15)): I.P(x, y, OX[0])                                  # the cracks the rust bleeds from
    return I.done(rim=True)


def bouquet():
    # r18 (r16 split by slot: "the red shape reads as a poppy", "the goldenrod is a 2 px rod: a pencil or a wheat ear", "the
    # green under the twine is a solid wedge: a wrapper or a skirt", "too saturated"): a real maple leaf (five pointed lobes, a dark
    # midrib, rust-crimson), feathery goldenrod plumes of small gold clusters, separate cut stems below the twine, colours dulled
    I = Icon()
    ST = [(0x2e, 0x3a, 0x20), (0x48, 0x5a, 0x30), (0x64, 0x7a, 0x3e), (0x80, 0x96, 0x50)]   # a step lighter
    GR = [(0x6a, 0x50, 0x1a), (0x9a, 0x76, 0x26), (0xbe, 0x96, 0x34), (0xd8, 0xb4, 0x52)]   # ochre-gold
    AS = [(0x3c, 0x2c, 0x56), (0x5e, 0x4a, 0x84), (0x84, 0x6e, 0xae), (0xae, 0x9c, 0xd0)]
    LF = [(0x58, 0x1a, 0x16), (0x84, 0x2a, 0x1e), (0xaa, 0x3e, 0x26), (0xc6, 0x5c, 0x34)]
    TW = [(0x6a, 0x52, 0x34), (0x9c, 0x80, 0x56), (0xc8, 0xac, 0x7c)]
    def line(x0, y0, x1, y1, c, alt=None):
        n = max(1, int(max(abs(x1 - x0), abs(y1 - y0))))
        for i in range(n + 1):
            I.P(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, alt if (alt and i % 3 == 0) else c)
    for (x1, y1) in ((10, 9), (14, 12), (17, 6), (21, 10), (18, 14), (23, 5), (8, 6)):
        line(15.5, 21, x1, y1, ST[2], ST[1])                                           # stems up to each head
    for (x1, y1) in ((11, 29), (13.5, 30), (16, 30), (18.5, 29), (21, 28)):
        line(15.5, 24, x1, y1, ST[2]); I.P(x1, y1, ST[3])                              # separate cut stems below the twine, lit cut ends
    # goldenrod (r18: "two mirrored smooth arcs read as bananas or tongs"): two plumes of different lengths, each a stem with
    # knobbly clusters of florets along it, ochre-gold, the long one arching right, the short one leaning left
    for (pts, side) in (([(17, 14), (19.5, 10.5), (22, 7.5), (24, 5), (25, 2.5)], 1), ([(14, 14), (12, 11), (10.5, 8.5)], -1)):
        S = []
        for i in range(len(pts) - 1):
            (ax, ay), (bx, by) = pts[i], pts[i + 1]
            for j in range(4): t = j / 4; S.append((ax + (bx - ax) * t, ay + (by - ay) * t))
        S.append(pts[-1])
        for k_, (x, y) in enumerate(S):
            I.P(x, y, GR[1])                                                       # the stem
            if k_ < 2: continue
            if k_ % 2 == 0:                                                         # a knob of florets, alternating sides
                o = 1 if (k_ // 2) % 2 else -1
                for (ox, oy, c) in ((o, -1, GR[3]), (o, 0, GR[2]), (o * 2, -1, GR[2]), (0, -1, GR[3])):
                    I.P(x + ox, y + oy, c)
            else:
                I.P(x - side, y, GR[2])
    for (cx, cy) in ((10, 10), (16, 7), (21, 11), (14, 13), (18, 15)):              # asters: ray petals round a yellow eye
        for y in range(cy - 3, cy + 4):
            for x in range(cx - 3, cx + 4):
                dx, dy = x + .5 - (cx + .5), y + .5 - (cy + .5); d = math.hypot(dx, dy)
                if d < 2.9:
                    ang = math.atan2(dy, dx); ray = math.cos(ang * 4) > -.2
                    if d > 2.1 and not ray: continue
                    lit = dx + dy < 0
                    I.P(x, y, AS[3] if lit and d > 1 else AS[2] if lit or d < 1.6 else AS[1])
        I.P(cx, cy, (0xe8, 0xb8, 0x40)); I.P(cx + 1, cy, (0xb8, 0x80, 0x24)); I.P(cx, cy + 1, (0xb8, 0x80, 0x24))
    # the maple leaf, at the lower left, tucked behind the twine: five pointed lobes with notches, a dark midrib to each point
    leaf = [(7, 10), (8, 13), (11, 11.5), (10, 15), (12.5, 17), (9.5, 17), (9, 20), (7, 17.5), (3, 18.5), (5, 15), (2, 12.5), (6, 13)]
    n = len(leaf)
    for y in range(9, 22):
        xs = []
        for i in range(n):
            (ax, ay), (bx, by) = leaf[i], leaf[(i + 1) % n]
            if (ay <= y + .5 < by) or (by <= y + .5 < ay): xs.append(ax + (y + .5 - ay) * (bx - ax) / (by - ay))
        xs.sort()
        for xa, xb in zip(xs[::2], xs[1::2]):
            for x in range(int(round(xa)), int(round(xb))):
                v = (x - 7) + (y - 15)
                I.P(x, y, LF[3] if v < -4 else LF[2] if v < 1 else LF[1])
    for (tx, ty) in ((7, 10), (11, 11.5), (12.5, 17), (3, 18.5), (2, 12.5)):
        line(7.5, 17, tx + (7.5 - tx) * .25, ty + (17 - ty) * .25, LF[0])            # the midribs, stopping short of the points
    line(8, 18, 10, 22, LF[0])                                                         # its stalk, into the bunch
    for y in range(21, 24):                                                            # the twine wrap
        for x in range(13, 19):
            I.P(x, y, TW[2] if (x + y) % 3 == 0 else TW[1] if x < 17 else TW[0])
    for (x, y) in ((19, 23), (20, 24), (20, 25), (21, 26), (18, 24), (18, 25)): I.P(x, y, TW[1] if y < 25 else TW[0])   # its loose ends
    return I.done()


def ironnode():
    # the node the iron chunk comes from: the same dark slate, broken two-crowned top, brown oxide bleeding down, silver showing;
    # bigger and taller than the drop, sitting on the ground (bottom rows widest); drawn on 32x32 and cut to the node's 30x26
    I = Icon()
    fill(I, [(4, 14), (7, 9), (12, 6), (15, 8), (19, 5), (25, 7), (28, 12), (20, 16), (9, 17)], IR[5])
    fill(I, [(4, 14), (9, 17), (10, 25), (4, 23), (3, 19)], IR[4])
    fill(I, [(9, 17), (20, 16), (21, 26), (10, 25)], IR[3])
    fill(I, [(20, 16), (28, 12), (29, 19), (27, 24), (21, 26)], IR[2])
    for (x, y) in ((7, 10), (8, 9), (9, 8), (10, 7), (11, 7), (6, 11), (5, 12), (5, 13), (4, 14), (17, 6), (18, 6), (19, 6)):
        I.P(x, y, IR[6])
    for x in range(9, 20): I.P(x, 17 if x < 15 else 16, IR[6] if x < 13 else IR[5])
    for (x, y) in ((14, 8), (14, 9), (15, 10), (15, 11)): I.P(x, y, IR[1])
    def patch(cx, cy, rx, ry, seed):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 + ((x * 7 + y * 13 + seed) % 5) * .07
                if d < 1 and I.p[x, y][3]:
                    lit = (x - cx) + (y - cy) < -1
                    I.P(x, y, OX[4] if lit and d < .5 else OX[3] if lit or d < .45 else OX[2])
    patch(22.4, 10.6, 4.4, 2.0, 1); patch(10.6, 12.8, 3.8, 1.9, 3); patch(5.4, 19, 1.4, 2.4, 2)
    for (x, y, k) in ((22, 16, 2), (22, 17, 1), (23, 18, 2), (22, 19, 1), (22, 20, 0), (23, 21, 1), (23, 22, 0), (22, 23, 0),
                      (11, 17, 2), (11, 18, 1), (12, 19, 1), (11, 20, 0), (12, 21, 0), (12, 22, 0), (26, 15, 1), (26, 16, 0), (27, 17, 0), (27, 18, 0),
                      (5, 22, 1), (5, 23, 0), (6, 24, 0)):
        I.P(x, y, OX[k])
    for (x, y, w) in ((8, 10, 3), (17, 9, 3), (14, 21, 3), (24, 14, 2), (5, 16, 2)):
        for i in range(w):
            I.P(x + i, y, SV[3] if i == 0 else SV[2]); I.P(x + i, y + 1, SV[1] if i < w - 1 else SV[0])
        I.P(x + w, y + 1, IR[0]); I.P(x, y + 2, IR[1])
    for (x, y) in ((22, 11), (23, 11), (10, 13), (11, 13)): I.P(x, y, OX[0])
    im = I.done(rim=True); p = im.load()
    for y in range(22, 30):                                                                                  # the soft contact shadow, as the other nodes
        for x in range(32):
            if not p[x, y][3] and ((x + .5 - 16) / 13.5) ** 2 + ((y + .5 - 26.2) / 2.6) ** 2 < 1: p[x, y] = (8, 6, 10, 110)
    return im.crop((1, 3, 31, 29))


def pearl():
    # 'Reservoir pearl: from a mussel on the drawdown mud. Grey, faintly warm.' (the stand-in read as a white egg in a dish):
    # an open mussel shell lying on a slant, blue-black outside with a lit lip, its nacre inside pale silver-lilac with a pink
    # cast; the pearl grey and warm, lit top-left, a placed highlight, its shadow on the nacre below-right
    I = Icon()
    SH = hexr(['#141620', '#1e2230', '#2c3244', '#3e465c', '#56607a'])
    NA = hexr(['#7a7488', '#9e96ae', '#bcb4c8', '#d4ccd8', '#e8e2ea'])
    PE = hexr(['#4e4844', '#6e6662', '#8e8680', '#aaa29a', '#c6beb6', '#ded8d0', '#f6f2ec'])
    cx, cy, rx, ry, a = 15.5, 17.5, 13.0, 6.4, -.35
    ca, sa = math.cos(a), math.sin(a)
    def inside(x, y, oy=0.0, k=1.0):
        dx, dy = x + .5 - cx, y + .5 - cy - oy
        u, v = dx * ca + dy * sa, -dx * sa + dy * ca
        uu = u / (rx * k); vv = v / (ry * k * (1 - .45 * max(0, -uu)))      # a mussel: pointed at the hinge (left)
        return uu * uu + vv * vv, uu, vv
    for y in range(32):                                                     # the outer shell seen below the lip: a dark bowl
        for x in range(32):
            d, uu, vv = inside(x, y, 3.0)
            if d < 1:
                g = (int((uu + 1) * 5) % 3 == 0)                                # growth lines across it
                I.P(x, y, SH[0] if g else SH[1] if vv > .2 else SH[2])
    for y in range(32):
        for x in range(32):
            d, uu, vv = inside(x, y)
            if d >= 1: continue
            if d > .74:                                                     # the lip, lit along its far edge
                I.P(x, y, SH[4] if vv < -.3 and uu < .6 else SH[3] if vv < 0 else SH[2])
            else:                                                           # the nacre, cooler and greyer, a pink cast lower right
                t = .5 - .55 * vv - .2 * uu
                c = NA[3] if t > .8 else NA[2] if t > .45 else NA[1] if t > .15 else NA[0]
                if uu > .2 and vv > .05: c = (min(255, c[0] + 12), c[1] - 4, c[2] - 6)
                I.P(x, y, c)
    pcx, pcy, pr = 17.0, 14.8, 4.8
    for y in range(32):                                                     # the pearl's shadow on the nacre
        for x in range(32):
            if math.hypot(x + .5 - pcx - 1.6, (y + .5 - pcy - 2.0) * 1.4) < pr and I.p[x, y][3] and I.p[x, y][:3] not in SH:
                c = I.p[x, y]; I.P(x, y, (int(c[0] * .72), int(c[1] * .7), int(c[2] * .74)))
    for y in range(32):
        for x in range(32):
            nx, ny = (x + .5 - pcx) / pr, (y + .5 - pcy) / pr; d = nx * nx + ny * ny
            if d >= 1: continue
            l = .14 + .9 * sh(nx, ny, math.sqrt(1 - d))
            c = PE[max(0, min(5, int(l * 5.6)))]                              # grey, faintly warm: the top tone kept for the glint
            if nx + ny > .9 and d > .55: c = (0xb4, 0x9c, 0x9a)               # a warm reflected light off the nacre
            I.P(x, y, c)
    I.P(pcx - 2.5, pcy - 2.5, PE[6]); I.P(pcx - 1.5, pcy - 2.5, PE[5]); I.P(pcx - 2.5, pcy - 1.5, PE[5])   # the placed highlight
    return I.done()


R16 = {'iron': iron, 'bouquet': bouquet, 'ironnode': ironnode, 'pearl': pearl}

if __name__ == '__main__':
    for n in (sys.argv[1:] or R16):
        R16[n]().save(f'out/r16_{n}.png')
    print('ok', len(sys.argv[1:] or R16))
