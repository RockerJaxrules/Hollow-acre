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
    # 'Late asters, goldenrod and one red maple leaf, tied with twine': lilac star-heads with yellow eyes, two goldenrod plumes
    # arching out at the back, one five-pointed red leaf, the stems gathered in a twine wrap and fanning out below it
    I = Icon()
    ST = [(0x2c, 0x3a, 0x1c), (0x44, 0x58, 0x28), (0x5e, 0x76, 0x34), (0x7a, 0x92, 0x44)]
    GR = [(0x6e, 0x50, 0x10), (0xa8, 0x82, 0x1a), (0xd8, 0xb0, 0x2c), (0xf2, 0xd8, 0x5a)]
    AS = [(0x3a, 0x26, 0x5a), (0x5e, 0x44, 0x8c), (0x86, 0x6a, 0xb8), (0xb4, 0x9c, 0xdc)]
    for (x0, y0, x1, y1) in ((15, 22, 9, 8), (15, 22, 13, 11), (16, 22, 17, 6), (16, 22, 21, 10), (16, 22, 23, 6), (15, 22, 18, 14), (15, 22, 7, 15)):
        n = max(abs(x1 - x0), abs(y1 - y0))
        for i in range(n + 1):
            I.P(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, ST[2] if i % 3 else ST[1])                    # stems up to each head
    for (x0, x1) in ((15, 11), (15, 14), (16, 17), (16, 20)):
        for i in range(8):
            I.P(x0 + (x1 - x0) * i / 7, 23 + i, ST[2] if i < 5 else ST[1]); I.P(x0 + (x1 - x0) * i / 7 + 1, 23 + i, ST[1])   # stems fanning below
    for (pts, flip) in (([(16, 13), (19, 9), (22, 6), (24, 3)], 1), ([(14, 13), (11, 10), (8, 6), (6, 4)], -1)):
        for i in range(len(pts) - 1):                                                                        # goldenrod plumes
            (ax, ay), (bx, by) = pts[i], pts[i + 1]
            for j in range(5):
                t = j / 5; x = ax + (bx - ax) * t; y = ay + (by - ay) * t
                I.P(x, y, GR[2]); I.P(x + flip, y, GR[3] if flip < 0 else GR[1]); I.P(x, y + 1, GR[1]); I.P(x + flip * 2, y + 1, GR[2] if (i + j) % 2 else GR[0])
    for (cx, cy) in ((10, 9), (16, 6), (21, 10), (13, 13), (18, 14)):                                      # asters: ray petals round a yellow eye
        for y in range(cy - 3, cy + 4):
            for x in range(cx - 3, cx + 4):
                dx, dy = x + .5 - (cx + .5), y + .5 - (cy + .5); d = math.hypot(dx, dy)
                if d < 2.9:
                    a = math.atan2(dy, dx); ray = math.cos(a * 4) > -.2
                    if d > 2.1 and not ray: continue
                    lit = dx + dy < 0
                    I.P(x, y, AS[3] if lit and d > 1 else AS[2] if lit or d < 1.6 else AS[1])
        I.P(cx, cy, (0xf0, 0xc0, 0x40)); I.P(cx + 1, cy, (0xc8, 0x8a, 0x24)); I.P(cx, cy + 1, (0xc8, 0x8a, 0x24))
    LF = [(0x5a, 0x14, 0x12), (0x8e, 0x22, 0x18), (0xbe, 0x36, 0x20), (0xe2, 0x5a, 0x30)]
    leaf = [(5, 17), (3, 13), (6, 14), (6, 10), (9, 13), (11, 11), (11, 15), (13, 15), (11, 18), (8, 19)]   # five points
    n = len(leaf)
    for y in range(9, 21):
        xs = []
        for i in range(n):
            (ax, ay), (bx, by) = leaf[i], leaf[(i + 1) % n]
            if (ay <= y + .5 < by) or (by <= y + .5 < ay): xs.append(ax + (y + .5 - ay) * (bx - ax) / (by - ay))
        xs.sort()
        for a, b in zip(xs[::2], xs[1::2]):
            for x in range(int(round(a)), int(round(b))):
                I.P(x, y, LF[3] if (x - 8) + (y - 15) < -3 else LF[2] if (x - 8) + (y - 15) < 2 else LF[1])
    for (x, y) in ((8, 15), (7, 14), (9, 14), (8, 16), (7, 17)): I.P(x, y, LF[0])                           # its veins
    TW = [(0x6a, 0x52, 0x34), (0x9c, 0x80, 0x56), (0xc8, 0xac, 0x7c)]
    for y in range(21, 24):                                                                                  # the twine wrap
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


R16 = {'iron': iron, 'bouquet': bouquet, 'ironnode': ironnode}

if __name__ == '__main__':
    for n in (sys.argv[1:] or R16):
        R16[n]().save(f'out/r16_{n}.png')
    print('ok', len(sys.argv[1:] or R16))
