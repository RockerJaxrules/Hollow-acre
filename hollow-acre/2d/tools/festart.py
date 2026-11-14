"""Festival dressing for the town square, drawn by code with the depth rules (lit tops, hue-shifted ramps, shadows, outlines):
  f_bunting   two striped poles with a sagging line of triangle flags between them
  f_lanterns  two posts with a string of paper lanterns (glowing) between them
  f_floor     a wooden dance floor laid on the ground (flat), boards lit along their top edges
  f_scale     the weigh-in scale: a timber frame, a hanging iron pan, a big ribbon
  f_ringtoss  the ring toss: a board of pegs on trestles, rope rings hanging off it
Writes spr/lpc/obj/f_*.png and objects.json."""
import json, math, colorsys
from PIL import Image
def ramp(hexc, n=6, spread=.85):
    r, g, b = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]; h, s, v = colorsys.rgb_to_hsv(r, g, b); out = []
    for i in range(n):
        t = i / (n - 1) - .55; tgt = .72 if t < 0 else .12; d = ((tgt - h + .5) % 1) - .5; hh = (h + d * min(1, abs(t) * .45)) % 1
        out.append(tuple(round(c * 255) for c in colorsys.hsv_to_rgb(hh, max(0, min(1, s * (1 - t * .4))), max(0, min(1, v * (1 + t * spread))))))
    return out
WOOD = ramp('#8a5e36'); RED = ramp('#c8402a'); GOLD = ramp('#e0b040'); GREEN = ramp('#4a8a3a'); BLUE = ramp('#3a6aa8'); CREAM = ramp('#e8dcc0', spread=.5)
IRON = ramp('#6a6a72'); ROPE = ramp('#b49a6a', spread=.6); PAPER = [(150, 60, 40), (210, 100, 50), (246, 160, 70), (255, 214, 130), (255, 240, 190)]
OUT = (24, 14, 14)
class C:
    def __init__(s, W, H): s.W, s.H = W, H; s.im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); s.px = s.im.load()
    def p(s, x, y, c, a=255):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < s.W and 0 <= y < s.H: s.px[x, y] = (c[0], c[1], c[2], a)
    def rect(s, x0, y0, x1, y1, c):
        for y in range(int(y0), int(y1) + 1):
            for x in range(int(x0), int(x1) + 1): s.p(x, y, c)
    def shadow(s, cx, cy, rx, ry, a=140):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if 0 <= x < s.W and 0 <= y < s.H and s.px[x, y][3] == 0:
                    d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2
                    if d < 1: s.p(x, y, (10, 10, 8), int(a * (1 - d) + 25))
    def pole(s, x, top, bot, R, stripes=None):
        for y in range(top, bot):
            for i, xx in enumerate(range(x - 1, x + 2)):
                c = R[[4, 3, 1][i]]
                if stripes and ((y - top) // 4) % 2: c = stripes[[4, 3, 1][i]]
                s.p(xx, y, c)
        s.rect(x - 2, top - 2, x + 2, top - 1, GOLD[3]); s.p(x - 1, top - 2, GOLD[5])
    def outline(s):
        a = [[s.px[x, y][3] > 200 for x in range(s.W)] for y in range(s.H)]; pts = []
        for y in range(s.H):
            for x in range(s.W):
                if a[y][x] or s.px[x, y][3] > 100: continue
                if any(0 <= x + dx < s.W and 0 <= y + dy < s.H and a[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): pts.append((x, y))
        for x, y in pts: s.p(x, y, OUT)
SPR = {}
def save(n, c, ax, ay, foot=(0, 0, 0, 0)): c.im.save(f'spr/lpc/obj/{n}.png'); SPR[n] = {'src': f'spr/lpc/obj/{n}.png', 'fw': c.W, 'fh': c.H, 'ax': float(ax), 'ay': float(ay), 'foot': list(foot)}
# ---- bunting: 4 m between poles
W = 136; c = C(W, 64)
for x in (4, W - 5): c.shadow(x, 61, 4, 1.5)
c.pole(4, 6, 61, CREAM, RED); c.pole(W - 5, 6, 61, CREAM, RED)
for x in range(5, W - 5):
    t = (x - 5) / (W - 10); y = 8 + math.sin(t * math.pi) * 9; c.p(x, y, ROPE[3]); c.p(x, y + 1, ROPE[1])
    k = (x - 5) // 9
    if (x - 5) % 9 == 1:
        col = [RED, GOLD, GREEN, BLUE, CREAM][k % 5]
        for j in range(7):
            w = 3.5 - j * .5
            for i in range(int(-w), int(w) + 1): c.p(x + 3 + i, y + 2 + j, col[4 if i < 0 else 2 if i > 0 else 3])
c.outline(); save('f_bunting', c, W / 2, 61, foot=(-2.1, -0.1, 2.1, 0))
# ---- paper lanterns
c = C(W, 64)
for x in (4, W - 5): c.shadow(x, 61, 4, 1.5)
c.pole(4, 6, 61, WOOD); c.pole(W - 5, 6, 61, WOOD)
for x in range(5, W - 5):
    t = (x - 5) / (W - 10); y = 8 + math.sin(t * math.pi) * 8; c.p(x, y, (40, 30, 30))
    if (x - 5) % 14 == 7:
        for j in range(9):
            w = 3.6 * math.sin((j + .5) / 9 * math.pi)
            for i in range(int(-w), int(w) + 1):
                l = 4 if i < -1 else 3 if i < 1 else 2
                if j in (0, 8): l = 0
                if j % 3 == 2 and j < 8: l = max(0, l - 1)
                c.p(x + i, y + 2 + j, PAPER[l])
        c.p(x, y + 1, (40, 30, 30)); c.p(x, y + 11, (40, 30, 30))
c.outline(); save('f_lanterns', c, W / 2, 61, foot=(-2.1, -0.1, 2.1, 0))
# ---- dance floor, 5 m x 3 m, seen in 3/4: boards with lit top edges, a front edge
c = C(164, 64)
for y in range(4, 58):
    for x in range(4, 160):
        b = (y - 4) // 6; edge = (y - 4) % 6 == 0
        c.p(x, y, WOOD[4] if edge else WOOD[3] if (x // 40 + b) % 2 else WOOD[2])
        if (x + b * 17) % 40 == 0: c.p(x, y, WOOD[1])
c.rect(4, 58, 159, 61, WOOD[1]); c.rect(4, 62, 159, 62, WOOD[0])
for x in range(10, 160, 30): c.p(x, 59, IRON[4])
save('f_floor', c, 82, 60)
# ---- the weigh-in scale
c = C(48, 72); c.shadow(24, 69, 22, 3)
for x in (5, 42):
    for y in range(8, 70): c.p(x, y, WOOD[4]); c.p(x + 1, y, WOOD[3]); c.p(x + 2, y, WOOD[1])
c.rect(3, 6, 45, 8, WOOD[4]); c.rect(3, 9, 45, 11, WOOD[2])
c.rect(23, 12, 24, 30, IRON[3])
for i in range(12): c.p(24 - i * .9, 30 + i * 1.4, IRON[2]); c.p(24 + i * .9, 30 + i * 1.4, IRON[2])
for y in range(46, 52):
    w = 13 - (y - 46) * 1.2
    for x in range(int(24 - w), int(24 + w) + 1): c.p(x, y, IRON[4] if y == 46 else IRON[2] if x > 24 else IRON[3])
c.rect(17, 16, 31, 24, CREAM[3]); c.rect(17, 16, 31, 16, CREAM[5])
for i in range(3): c.p(20 + i * 4, 20, (30, 20, 20))
c.p(24, 18, RED[2]); c.p(24, 19, RED[2]); c.p(25, 20, RED[2])
for j in range(8): c.p(6 + j * .3, 14 + j, BLUE[3]); c.p(8 - j * .3, 14 + j, BLUE[2])   # a blue ribbon on the post
c.rect(5, 12, 9, 15, BLUE[4])
c.outline(); save('f_scale', c, 24, 69, foot=(-0.7, -0.3, 0.7, 0))
# ---- ring toss
c = C(56, 44); c.shadow(28, 41, 26, 2.6)
for x in (8, 46):
    for y in range(26, 42): c.p(x, y, WOOD[3]); c.p(x + 1, y, WOOD[1])
c.rect(4, 8, 52, 26, RED[2]); c.rect(4, 8, 52, 9, RED[4]); c.rect(4, 26, 52, 27, RED[0])
for (x, y) in ((12, 14), (22, 14), (32, 14), (42, 14), (17, 21), (27, 21), (37, 21)):
    c.rect(x, y - 3, x + 1, y, CREAM[4]); c.p(x + 1, y - 3, CREAM[2])
for (x, y) in ((22, 18), (37, 24)):
    for a in range(16): c.p(x + math.cos(a / 16 * 6.283) * 3, y + math.sin(a / 16 * 6.283) * 1.4, ROPE[3])
c.outline(); save('f_ringtoss', c, 28, 41, foot=(-0.8, -0.3, 0.8, 0))
d = json.load(open('spr/lpc/objects.json')); d.update(SPR); json.dump(d, open('spr/lpc/objects.json', 'w')); print('ok', list(SPR))
