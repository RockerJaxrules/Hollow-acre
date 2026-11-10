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
OX = hexr(['#4a2210', '#6e3414', '#94491a', '#b46226', '#cc7e3a'])
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
    I = Icon()
    fill(I, [(4, 15), (8, 9), (16, 7), (24, 8), (28, 13), (19, 16), (9, 17)], IR[5])     # the top, a broad tilted plane
    fill(I, [(4, 15), (9, 17), (10, 25), (4, 22)], IR[4])                                 # the left face
    fill(I, [(9, 17), (19, 16), (21, 26), (14, 28), (10, 25)], IR[3])                     # the front
    fill(I, [(19, 16), (28, 13), (28, 20), (25, 25), (21, 26)], IR[2])                    # the right, in shade
    for (x, y) in ((8, 10), (9, 9), (10, 9), (11, 8), (12, 8), (13, 8), (7, 11), (6, 12), (5, 13)):
        I.P(x, y, IR[6])                                                                  # lit top-left edge
    for x in range(9, 19): I.P(x, 17 if x < 14 else 16, IR[6] if x < 13 else IR[5])        # the ridge to the front face
    for (x, y) in ((20, 15), (22, 14), (24, 14), (26, 13)): I.P(x, y, IR[4])
    # oxide: ragged patches round two cracks, bleeding down the faces below them, lit a step where they face the light
    for (x, y, k) in ((14, 10, 2), (15, 10, 3), (15, 11, 2), (16, 11, 1), (14, 11, 3), (13, 11, 2), (16, 12, 2), (15, 12, 1),
                      (15, 17, 2), (15, 18, 1), (16, 18, 2), (16, 19, 1), (15, 20, 1), (16, 21, 0), (16, 22, 1), (15, 23, 0),
                      (22, 11, 2), (23, 11, 3), (23, 12, 2), (24, 12, 1), (23, 16, 1), (24, 17, 1), (24, 18, 0), (23, 19, 0), (24, 20, 0),
                      (6, 17, 2), (7, 18, 1), (6, 19, 1), (7, 20, 0)):
        I.P(x, y, OX[k + 1] if y < 16 else OX[k])
    for (x, y) in ((15, 13), (16, 14), (16, 15), (23, 13), (24, 14), (24, 15)):
        I.P(x, y, IR[0])                                                                  # the cracks the rust comes out of
    for (x, y) in ((10, 12), (19, 10), (12, 21), (25, 18)):                              # silver glints of metal standing proud
        I.P(x, y, SV[3]); I.P(x + 1, y, SV[2]); I.P(x, y + 1, SV[1]); I.P(x + 1, y + 1, SV[0])
    I.P(20, 9, SV[2])
    return I.done(rim=True)


R16 = {'iron': iron}

if __name__ == '__main__':
    for n in (sys.argv[1:] or R16):
        R16[n]().save(f'out/r16_{n}.png')
    print('ok', len(sys.argv[1:] or R16))
