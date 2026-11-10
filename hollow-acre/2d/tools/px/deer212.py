"""The dead doe in the intro (#212, owner: "redesign ... the deer on the road"). A doe lying on her side across the lane, drawn by hand
in flat tones lit from the top-left: the flank lit, the spine a dark line, the pale belly toward you, the legs out stiff with dark hooves,
the neck flung back, the head with a closed eye and an ear, the white flag of the tail, and the blood under her neck, wet and dark.
Same size and anchor as the old sprite (64x30, 32/27).   python3 deer212.py -> out/deer212.png"""
from PIL import Image

W, H = 64, 30


def hexr(a):
    return [tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) for h in a]


FUR = hexr(['#24160e', '#3e2a1a', '#5a3e26', '#765434', '#926c44', '#ac8858'])
BELLY = hexr(['#9a8a6e', '#bcaa88', '#d8c8a6'])
HOOF = (26, 20, 18)
BLOOD = hexr(['#2e0606', '#4a0a0a', '#6a1410', '#8a2018'])

im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); px = im.load()


def P(x, y, c):
    if 0 <= x < W and 0 <= y < H:
        px[x, y] = c + (255,)


# the blood first: a dark pool under the neck and head, spreading on the wet road, one lit wet edge
for y in range(H):
    for x in range(W):
        d = ((x - 50) / 11) ** 2 + ((y - 25.5) / 3.2) ** 2
        if d < 1:
            P(x, y, BLOOD[1] if d > .5 else BLOOD[0])
for x in range(42, 58, 3):
    P(x, 23, BLOOD[3])
# the legs, stiff, out toward you: two hind (left), two fore (right), each a thin shank and a dark hoof
for (x0, y0, x1, y1) in ((19, 21, 12, 28), (23, 22, 18, 29), (38, 22, 44, 29), (42, 21, 49, 27)):
    n = max(abs(x1 - x0), abs(y1 - y0))
    for i in range(n + 1):
        x = round(x0 + (x1 - x0) * i / n); y = round(y0 + (y1 - y0) * i / n)
        P(x, y, FUR[3] if i < n - 1 else HOOF); P(x + 1, y, FUR[1] if i < n - 1 else HOOF)
# the body on its side: an oval, the flank lit top-left, the spine a dark line along the top, the belly pale below
for y in range(H):
    for x in range(W):
        d = ((x - 29) / 15) ** 2 + ((y - 16) / 8) ** 2
        if d > 1:
            continue
        l = -(x - 29) / 15 * .35 - (y - 16) / 8 * .8
        if ((x - 20) / 6.5) ** 2 + ((y - 14.5) / 5.5) ** 2 < 1: l += .25     # the haunch, round and lit
        if ((x - 38) / 5) ** 2 + ((y - 14) / 4.5) ** 2 < 1: l += .15         # the shoulder
        k = 5 if l > .6 else 4 if l > .25 else 3 if l > -.15 else 2
        if y > 20:
            k = None
        if k is None:
            P(x, y, BELLY[2] if y == 21 else BELLY[1] if y < 23 else BELLY[0])
        else:
            P(x, y, FUR[k])
import math
for x in range(17, 42):
    y = round(16 - 8 * math.sqrt(max(0, 1 - ((x - 29) / 15) ** 2)))
    P(x, y, FUR[1]); P(x, y + 1, FUR[2])                                   # the spine, a dark line along the top
for a in range(0, 14):                                                     # the haunch's rim, a soft darker curve
    x = round(20 + 6.5 * math.cos(a * .32 - 0.4)); y = round(14.5 + 5.5 * math.sin(a * .32 - 0.4))
    if 8 < y < 21: P(x, y, FUR[2])
# the neck flung back and the head lying on the road
for i in range(9):
    x = 43 + i; y = 15 + i // 2
    for j in range(4):
        P(x, y + j, FUR[4] if j == 0 else FUR[3] if j < 3 else FUR[1])
for y in range(H):
    for x in range(W):
        d = ((x - 55) / 5.2) ** 2 + ((y - 21) / 3.4) ** 2
        if d < 1:
            P(x, y, FUR[4] if y < 20 else FUR[3])
for x in range(58, 62):
    P(x, 22, FUR[1]); P(x, 21, FUR[3])
P(61, 22, (20, 14, 12))                       # the nose
P(55, 20, FUR[0]); P(56, 20, FUR[1])          # the closed eye
for (x, y) in ((51, 16), (50, 15), (51, 15), (49, 14)):
    P(x, y, FUR[2])                            # the ear, laid back
P(50, 14, BELLY[2])
# the tail: a short white flag at the rump
for (x, y) in ((12, 14), (12, 15), (13, 14), (13, 15), (13, 16)):
    P(x, y, BELLY[2])
P(12, 16, BELLY[0])

# a hue-shifted outline round it all
src = im.copy(); s = src.load()
for y in range(H):
    for x in range(W):
        if s[x, y][3]:
            continue
        for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            X, Y = x + dx, y + dy
            if 0 <= X < W and 0 <= Y < H and s[X, Y][3]:
                r, g, b, _ = s[X, Y]
                px[x, y] = (max(10, int(r * .32)), max(8, int(g * .26)), max(12, int(b * .3)), 255)
                break
im.save('out/deer212.png'); print('out/deer212.png', im.size)
