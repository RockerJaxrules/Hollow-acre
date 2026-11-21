"""#198 round 8: the judges' standing first fixes on icons still under 6.
  coat     - "reads as a shirt": a long coat to the knee, the collar turned up, lapels, a double row of buttons, a lit rim
  corn     - "the dotted kernel grid reads as speckle": staggered 2x2 kernels with dark seams, the husk dried to straw
  chicory  - "a mirrored V": three heads at three heights, square-tipped petals, one leaf
  bouquet  - "single-pixel purple specks": three asters as round heads lit top-left, two wheat ears, a red maple leaf, twine
  bait     - "the label dots read as a face": a plain label band; the worms segmented
    python3 icons198e.py -> out/r8_<name>.png
"""
import math, sys
from PIL import Image
sys.path.insert(0, '.')
from icons198 import Icon, RAMPS, hexr, sh
import icons198c as C

OBJ = C.OBJ


def coat():
    I = Icon(); CO = hexr(['#24140e', '#3a2016', '#54301e', '#6e4228', '#8a5634', '#a46c42', '#bc8656'])
    def body(x, y):
        return CO[3] if x < 14 else CO[2]
    I.poly([(10, 4), (16, 7), (22, 4), (26, 7), (27, 21), (24, 21), (24, 30), (8, 30), (8, 21), (5, 21), (6, 7)], 'le', .5)
    for y in range(32):                                                    # the body: lit on the left, a fold down the right
        for x in range(32):
            if I.p[x, y][3]:
                k = 4 if x < 11 else 3 if x < 16 else 2 if x < 22 else 1
                if y > 21 and x in (12, 20): k = max(0, k - 1)
                I.P(x, y, CO[k])
    I.poly([(10, 4), (16, 9), (16, 17), (12, 9)], 'le', .9)                 # the left lapel, catching the light
    I.poly([(22, 4), (16, 9), (16, 17), (20, 9)], 'le', .35)                # the right lapel, in shadow
    for (x, y) in ((10, 3), (11, 3), (21, 3), (22, 3), (10, 4), (22, 4)):
        I.P(x, y, CO[5])                                                    # the collar turned up
    for y in range(17, 30):
        I.P(16, y, CO[0])                                                   # where the fronts meet
    for y in (18, 22, 26):
        I.P(14, y, RAMPS['br'][5]); I.P(18, y, RAMPS['br'][4])              # a double row of brass buttons
    for y in range(8, 21):
        I.P(6 if y < 20 else 5, y, CO[6])                                   # the rim of light down the left sleeve
    return I.done()


def corn():
    I = Icon(); K = hexr(['#5a3c10', '#8a6418', '#b88a22', '#d8aa36', '#ecc858', '#f8e48a'])
    for (pts, l) in (([(4, 29), (7, 16), (13, 23)], .55), ([(4, 29), (18, 26), (12, 21)], .35)):
        I.poly(pts, 'bu', l)                                                # the husk, dried to straw, peeled back
    ox, oy = 9.5, 23.5
    for y in range(32):
        for x in range(32):
            u = ((x + .5 - ox) - (y + .5 - oy)) * .7071; v = ((x + .5 - ox) + (y + .5 - oy)) * .7071
            if u < 0 or u > 20: continue
            half = 4.4 * math.sin(math.pi * min(1, (u + 1.5) / 22.5) ** .75)
            if abs(v) > half: continue
            row = math.floor((v + 12) / 2.2); col = math.floor((u + (row % 2) * 1.1) / 2.2)
            cu = (u + (row % 2) * 1.1) - col * 2.2; cv = (v + 12) - row * 2.2
            seam = cu > 1.65 or cv > 1.65
            lit = .95 - (v + half) / (2 * half + .01) * .55 - u * .012
            k = 0 if seam else max(1, min(5, int(lit * 5 + .5)))
            if not seam and cu < .7 and cv < .7: k = min(5, k + 1)          # each kernel's own glint, top-left
            I.P(x, y, K[k])
    return I.done()


def chicory():
    I = Icon(); BL = hexr(['#1e2c52', '#2c406e', '#4a6aa8', '#6e90cc', '#9ab6e4', '#c4d6f2'])
    heads = ((9, 10), (17, 6), (24, 13))
    for (hx, hy) in heads:                                                  # stems to one root, of different lengths
        for t in range(40):
            f = t / 40; x = 16 + (hx - 16) * f; y = 29 - (29 - hy - 3) * f
            I.P(x, y, RAMPS['ol'][3]); I.P(x + 1, y, RAMPS['ol'][1])
    I.poly([(16, 24), (11, 20), (14, 25)], 'ol', .55)                         # one leaf
    for (hx, hy) in heads:
        for k in range(5):                                                  # five square-tipped petals
            a = -math.pi / 2 + k * 2 * math.pi / 5
            px, py = -math.sin(a), math.cos(a)
            for r in (1.5, 2.4, 3.3, 4.2):
                for w in (0, .9):                                           # each petal two pixels wide, square at the tip
                    x, y = hx + math.cos(a) * r + px * w, hy + math.sin(a) * r + py * w
                    lit = (math.cos(a) * -.6 + math.sin(a) * -.7) > -.2
                    I.P(x, y, BL[(5 if r < 2 else 4) if lit else (3 if r < 3 else 2)])
        I.P(hx, hy, BL[0]); I.P(hx + 1, hy, BL[1]); I.P(hx, hy + 1, BL[1])  # the dark centre
        I.P(hx - 1, hy - 2, BL[5])
    return I.done()


def bouquet():
    I = Icon(); PU = hexr(['#3a1c46', '#5a2c6a', '#7c4290', '#9c62ae', '#bc88c8', '#dab6e0'])
    tops = ((10, 8), (16, 5), (21, 9), (12, 13), (20, 14))
    for (x1, y1) in tops:
        for t in range(30):
            f = t / 30; I.P(16 + (x1 - 16) * f, 29 - (29 - y1) * f, RAMPS['ol'][3])
    for (cx, cy, r) in ((10, 8, 3.2), (16, 5, 3.4), (21, 9, 3.0)):          # three asters: round heads, lit top-left
        for y in range(int(cy - r) - 1, int(cy + r) + 2):
            for x in range(int(cx - r) - 1, int(cx + r) + 2):
                nx, ny = (x + .5 - cx) / r, (y + .5 - cy) / r; d = nx * nx + ny * ny
                if d < 1:
                    l = .2 + .8 * sh(nx, ny, math.sqrt(1 - d)); I.P(x, y, PU[min(5, int(l * 5 + .5))])
        I.P(cx, cy, RAMPS['yl'][5]); I.P(cx - 1, cy, RAMPS['yl'][4])        # the yellow eye
    for (x0, y0) in ((12, 13), (20, 14)):                                   # two wheat ears
        for j in range(5):
            I.P(x0, y0 - j * 1.2, RAMPS['yl'][4 if j % 2 else 3]); I.P(x0 + 1, y0 - j * 1.2 + .5, RAMPS['yl'][2])
    I.poly([(23, 19), (28, 16), (27, 21), (29, 23), (24, 22)], 'rd', .55)    # a red maple leaf tucked in
    for x in range(13, 20):
        I.P(x, 22, RAMPS['bu'][5] if x % 2 else RAMPS['bu'][3])              # twine
    return I.done()


def bait():
    I = C.load(OBJ + 'icon32_bait.png')
    src = I.im.copy(); s = src.load()
    for y in range(32):                                                     # the dotted label: the light dots painted over in the label's red
        for x in range(32):
            r, g, b, a = s[x, y]
            if a and r > 200 and g > 200 and b > 200 and 14 < y < 24:
                left = s[x - 1, y]
                I.p[x, y] = left if left[0] > left[1] + 40 else (0x8a, 0x22, 0x22, 255)
    for y in range(0, 14):                                                  # the worms: every other pixel a darker band
        for x in range(32):
            r, g, b, a = I.p[x, y]
            if a and r > 150 and g < 150 and (x + y) % 2 == 0:
                I.p[x, y] = (int(r * .78), int(g * .74), int(b * .74), a)
    return I.im


R8 = {'coat': coat, 'corn': corn, 'chicory': chicory, 'bouquet': bouquet, 'bait': bait}

if __name__ == '__main__':
    for n in (sys.argv[1:] or R8):
        R8[n]().save(f'out/r8_{n}.png')
    print('ok', len(sys.argv[1:] or R8))
