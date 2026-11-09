"""Grandpa's place as you find it, and as Nell first mends it. All drawn here by code, in the cabin's own palette (the kit's
wood, cream, slate, brick, glass and moss ramps), lit from the upper left:
  cabin_s0  a one-room shack: a sagging hip roof of weathered slate with shingles gone (rafters showing) and moss, a tarp
            weighted with stones, a cracked chimney leaning off true, one window boarded, the other cracked, a plank missing,
            the door hung crooked, a broken step, weeds along the stone footing;
  cabin_s1  the same shack mended: new red cedar shingles, a straight chimney with a cap, both windows glazed with green
            shutters and flower boxes, sound boards painted, a new step and a lantern by the door.
  Night versions light the windows (the shack's light leaks through the boards and the crack).
Also: the run-down inside (room_cabin0): broken floorboards, a bucket under the leak and the stain round it, damp streaks and
mould, cobwebs in the corners, the right window boarded, leaves blown in under the door."""
import json, math, shutil
from PIL import Image
OBJ = 'spr/lpc/obj/'
HEX = lambda h: (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16))
P = {k: [HEX(c) for c in v] for k, v in dict(
    wood=['#24180f', '#3d2a1c', '#5c3f29', '#7d5636', '#9e7146', '#bf9361'],
    grey=['#2a2622', '#45403a', '#635c52', '#817869', '#9d9482', '#b8b09c'],   # weathered boards
    cream=['#5a4d3b', '#8a7a5e', '#b8a682', '#ddd0ac'],
    slate=['#191b26', '#262a38', '#363d50', '#4a5369', '#626d86', '#828ca3'],
    cedar=['#2e1210', '#4a1c16', '#6a2a1e', '#8a3a26', '#a64e32', '#c06a46'],
    brick=['#2e1214', '#4d1c1d', '#6e2a25', '#913b31', '#b25645', '#cc7a60'],
    stone=['#232126', '#3a373e', '#56525a', '#757079', '#958f96', '#b5afb3'],
    glass=['#0f1420', '#1a2438', '#283a57', '#3c5677', '#6487a8', '#a4c4d8'],
    lit=['#5a2c0e', '#9a5320', '#d3863a', '#f0b65c', '#fbdc8f', '#fff4c6'],
    moss=['#1f2a14', '#33441f', '#4d6230', '#6c8243'],
    sage=['#222b1b', '#36452b', '#4f633e', '#6d8355', '#90a674', '#b6c69a'],
    tarp=['#1c2c3a', '#2c4458', '#3e5e78', '#577a94'],
    red=['#2e1214', '#4d1c1d', '#6e2a25', '#913b31', '#b25645', '#cc7a60'],
    brass=['#4a3410', '#8a6420', '#c99a3a', '#efd27a']).items()}
OUT = (20, 14, 22)
H = lambda x, y, s=0: (math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453) % 1


class C:
    def __init__(s, W, Hh): s.W, s.H = W, Hh; s.im = Image.new('RGBA', (W, Hh), (0, 0, 0, 0)); s.px = s.im.load()
    def p(s, x, y, c, a=255):
        x, y = int(x), int(y)
        if 0 <= x < s.W and 0 <= y < s.H:
            if a >= 255: s.px[x, y] = (*c[:3], 255)
            else:
                o = s.px[x, y]; t = a / 255
                s.px[x, y] = (round(o[0] + (c[0] - o[0]) * t), round(o[1] + (c[1] - o[1]) * t), round(o[2] + (c[2] - o[2]) * t), max(o[3], a))
    def r(s, x, y, w, h, c, a=255):
        for j in range(int(h)):
            for i in range(int(w)): s.p(x + i, y + j, c, a)
    def get(s, x, y): return s.px[int(x), int(y)] if 0 <= x < s.W and 0 <= y < s.H else (0, 0, 0, 0)
    def outline(s):
        a = [[s.px[x, y][3] > 200 for x in range(s.W)] for y in range(s.H)]; out = []
        for y in range(s.H):
            for x in range(s.W):
                if a[y][x]: continue
                if (x > 0 and a[y][x - 1]) or (x < s.W - 1 and a[y][x + 1]) or (y > 0 and a[y - 1][x]) or (y < s.H - 1 and a[y + 1][x]): out.append((x, y))
        for x, y in out: s.px[x, y] = (*OUT, 255)


W, HH, G, CX = 172, 150, 146, 86
WX0, WX1 = 14, 158          # the front wall
EAVE = 80                   # the roof's front edge
def shack(mended, night):
    c = C(W, HH); R = P['cedar'] if mended else P['slate']; WD = P['wood'] if mended else P['grey']
    sag = (lambda x: 0) if mended else (lambda x: 3.2 * math.sin(math.pi * max(0, min(1, (x - 50) / 72))))
    # ---- the chimney behind the roof (drawn first, the roof covers its foot)
    chx, lean = 118, (0 if mended else .12)
    for y in range(4, 46):
        off = int((46 - y) * lean)
        for i in range(14):
            x = chx + i + off; row = y // 4; joint = (i + (row % 2) * 3) % 7 == 0 or y % 4 == 0
            k = 3 if i < 4 else 2 if i < 10 else 1
            if joint: k = 0 if i > 9 else 1
            if not mended and H(i, y, 3) > .9: k = max(0, k - 2)                 # cracked, sooted bricks
            c.p(x, y, P['brick'][k + (1 if i < 4 else 0)])
    if mended: c.r(chx - 1, 2, 16, 3, P['stone'][4]); c.r(chx - 1, 4, 16, 1, P['stone'][2])        # a cap
    else:
        for i in range(4): c.px[chx + int(42 * lean) + 10 + i, 4] = (0, 0, 0, 0); c.px[chx + int(42 * lean) + 11 + i, 5] = (0, 0, 0, 0)   # bricks gone off the top
    # ---- the hip roof: front plane, the left hip lit, the right hip in shade; shingle rows staggered
    ridge0, ridge1, top = 52, 120, 16
    for y in range(top, EAVE + 1):
        t = (y - top) / (EAVE - top); xl = ridge0 - (ridge0 - 6) * t; xr = ridge1 + (W - 6 - ridge1) * t
        for x in range(int(xl), int(xr) + 1):
            yy = y - sag(x) * (1 - t)
            if yy < top - .5: continue
            plane = 'L' if x < ridge0 - (ridge0 - 6) * t + (ridge0 - xl) * 0 and False else None
            # which plane: left hip if left of the line from ridge0 to eave corner, right hip likewise
            left_hip = x < ridge0 - (ridge0 - 6 - 30) * t - 0 and x < xl + (ridge0 - xl) * .0 + 34 * t
            right_hip = x > xr - 34 * t
            row = int((y - top) // 5); j = (x + (row % 2) * 6) % 12
            k = 3 if not (left_hip or right_hip) else (4 if left_hip else 1)
            if (y - top) % 5 == 4: k = max(0, k - 2)            # the shadow under each course
            elif j == 0: k = max(0, k - 1)                      # joints between shingles
            elif (y - top) % 5 == 0: k = min(5, k + 1)          # each course's lit top edge
            if not mended and H(x // 6, row, 5) > .78: k = max(0, k - 1)       # weathered, mismatched slates
            c.p(x, y, R[k])
        # the lit hip edge and the ridge line
    for t10 in range(0, 101):
        t = t10 / 100; y = top + (EAVE - top) * t
        c.p(ridge0 - (ridge0 - 6) * t + 34 * t, y, R[5]); c.p(ridge1 + (W - 6 - ridge1) * t - 34 * t, y, R[0])
    for x in range(ridge0, ridge1 + 1): c.p(x, top + sag(x), R[5])
    if not mended:
        # shingles gone: the dark under the roof, rafters across it
        for (hx, hy, hw, hh) in ((70, 38, 16, 9), (124, 58, 12, 7), (36, 62, 9, 6)):
            for y in range(hy, hy + hh):
                for x in range(hx, hx + hw):
                    if abs((x - hx - hw / 2) / (hw / 2)) ** 2 + abs((y - hy - hh / 2) / (hh / 2)) ** 2 > 1 + (H(x, y) - .5) * .5: continue
                    c.p(x, y, (14, 10, 12) if (x - hx) % 6 else P['wood'][2])
        # moss in the gutters and on the north side
        for i in range(70):
            x = 12 + H(i, 1) * 148; y = EAVE - 2 - H(i, 2) * 26 * (1 if x > 90 else .5)
            if c.get(x, y)[3] > 200: c.p(x, y, P['moss'][1 + int(H(i, 3) * 3)])
        # a tarp over the worst of it, weighted with stones
        for y in range(44, 58):
            for x in range(92, 116):
                k = 2 if (x + y) % 9 else 1
                if x < 94 or y < 46: k = 3
                c.p(x + (y - 44) * .2, y, P['tarp'][k])
        for sx_ in (93, 113): c.r(sx_, 43, 4, 3, P['stone'][3]); c.r(sx_, 43, 4, 1, P['stone'][5])
    # ---- the eave: a cream fascia board, and the shadow it throws on the wall
    for x in range(8, W - 8):
        for j in range(3): c.p(x, EAVE + j - sag(x) * .3, P['cream'][3 - j] if not (not mended and H(x // 9, 7) > .8) else P['cream'][1])
    # ---- the front wall: horizontal boards lit from the left, darker into the right
    for y in range(EAVE + 3, G - 6):
        for x in range(WX0, WX1):
            u = (x - WX0) / (WX1 - WX0); row = (y - EAVE - 3) // 6; inrow = (y - EAVE - 3) % 6
            k = 3 if u < .5 else 2
            if inrow == 0: k = 4
            if inrow == 5: k = 1
            if (x + row * 17) % 38 == 0: k = 1                                     # board ends
            if y < EAVE + 7: k = max(0, k - 2)                                     # under the eave
            if not mended and H(x // 5, row, 9) > .86: k = max(1, k - 1)           # rot and stains
            c.p(x, y, WD[k])
    # corner boards
    for y in range(EAVE + 3, G - 6):
        for (x0, w, k) in ((WX0 - 2, 4, 3), (WX1 - 2, 4, 1)): c.r(x0, y, w, 1, P['cream'][k] if mended else P['grey'][k + 1])
    if not mended:
        # a board gone (the dark inside shows), another nailed over a hole crooked
        c.r(118, 112, 24, 4, (16, 12, 14)); c.r(118, 116, 24, 1, P['grey'][1])
        for i in range(18): c.p(26 + i, 126 + i * .12, P['wood'][3]); c.p(26 + i, 127 + i * .12, P['wood'][2]); c.p(26 + i, 128 + i * .12, P['wood'][1])
        c.p(27, 127, P['stone'][4]); c.p(42, 129, P['stone'][4])
        for i in range(10): c.p(64 + i * .4, 92 + i, P['grey'][0])                  # a crack running down a board
    # ---- windows
    def window(cx_, boarded=False, broken=False):
        x0, y0, w, h = cx_ - 11, 92, 22, 22
        c.r(x0 - 2, y0 - 2, w + 4, h + 4, P['cream'][1] if not mended else P['cream'][2])
        c.r(x0 - 1, y0 - 1, w + 2, 1, P['cream'][3]); c.r(x0 - 1, y0 - 1, 1, h + 2, P['cream'][3])
        G_ = P['lit'] if night else P['glass']
        for y in range(y0, y0 + h):
            for x in range(x0, x0 + w):
                k = 2 if night else (1 if (y - y0) > h * .55 else 2)
                if not night and (x - x0) + (y0 + h - y) in (8, 9, 16): k = 4                    # a reflection streak
                if night: k = 4 if (x - x0 - w / 2) ** 2 + (y - y0 - h / 2) ** 2 < 40 else 3
                c.p(x, y, G_[k])
        c.r(cx_ - 1, y0, 2, h, P['cream'][2]); c.r(x0, y0 + h // 2 - 1, w, 2, P['cream'][2])          # the cross
        c.r(x0 - 3, y0 + h + 2, w + 6, 2, P['cream'][3] if mended else P['grey'][4])                   # sill
        if broken and not night:
            for (dx, dy) in ((3, 4), (4, 5), (5, 5), (6, 7), (4, 8), (3, 9), (7, 3), (8, 2)): c.p(x0 + dx, y0 + dy, P['glass'][5])
            c.r(x0 + 2, y0 + 12, 6, 6, (12, 10, 14))
        if broken and night:
            c.r(x0 + 2, y0 + 12, 6, 6, P['lit'][5])
        if boarded:
            for (yy, a) in ((y0 + 2, .18), (y0 + 9, -.1), (y0 + 16, .12)):
                for i in range(-3, w + 4):
                    yb = yy + i * a
                    for j in range(4):
                        k = [4, 3, 3, 1][j]
                        c.p(x0 + i, yb + j, P['grey'][k])
                c.p(x0 - 1, yy + 1, P['stone'][4]); c.p(x0 + w + 1, yy + 1 + w * a, P['stone'][4])
            if night:
                for (yy) in (y0 + 7, y0 + 14):
                    for i in range(2, w - 2):
                        if H(i, yy) > .3: c.p(x0 + i, yy, P['lit'][4])
        if mended:
            for (sx_, d) in ((x0 - 9, 1), (x0 + w + 3, -1)):        # shutters
                for y in range(y0 - 2, y0 + h + 2):
                    for i in range(6): c.p(sx_ + i, y, P['sage'][3 - (1 if i == (5 if d > 0 else 0) else 0) + (1 if (y - y0) % 5 == 0 else 0)])
            for i in range(w + 4):                                   # a flower box
                for j in range(5): c.p(x0 - 2 + i, y0 + h + 4 + j, P['wood'][3 if j == 0 else 2 if j < 4 else 1])
                if i % 3 == 0: c.p(x0 - 2 + i, y0 + h + 3, P['red'][4] if (i // 3) % 2 else P['brass'][3]); c.p(x0 - 2 + i, y0 + h + 2, P['sage'][4])
    window(40, boarded=not mended); window(132, broken=not mended)
    # ---- the door, hung crooked on the shack
    dx0, dy0, dw, dh = CX - 12, 102, 24, G - 6 - 102
    c.r(dx0 - 3, dy0 - 3, dw + 6, dh + 3, P['cream'][2] if mended else P['grey'][3])
    c.r(dx0 - 3, dy0 - 3, dw + 6, 1, P['cream'][3] if mended else P['grey'][4])
    sk = 0 if mended else 1
    c.r(dx0, dy0, dw, dh, (14, 10, 12))
    for y in range(dy0, dy0 + dh):
        for x in range(dx0 + sk * (1 if y > dy0 + dh // 2 else 0), dx0 + dw - (0 if mended else 1)):
            u = (x - dx0) / dw; k = 3 if u < .45 else 2
            if (x - dx0) in (4, 19) or (y - dy0) in (5, 18, 22, 35): k = max(1, k - 1)
            c.p(x, y, P['wood'][k + (1 if mended else 0)] if mended else P['wood'][k])
    c.r(dx0 + dw - 6, dy0 + dh // 2, 2, 2, P['brass'][3 if mended else 1])
    if mended:   # a lantern by the door
        c.r(dx0 + dw + 6, dy0 + 2, 5, 7, P['lit'][4] if night else P['brass'][2]); c.r(dx0 + dw + 6, dy0 + 2, 5, 1, P['wood'][1]); c.r(dx0 + dw + 8, dy0, 1, 2, P['wood'][1])
    # ---- the stone footing, the step
    for y in range(G - 6, G + 1):
        for x in range(WX0 - 2, WX1 + 2):
            j = (x + (y // 3) * 5) % 10; k = 3 if j else 1
            if y == G - 6: k = 4
            if y > G - 2: k = 1
            c.p(x, y, P['stone'][k])
    for (y, w, k) in ((G - 5, 36, 4), (G - 2, 40, 3)):
        for x in range(CX - w // 2, CX + w // 2):
            if not mended and y == G - 5 and CX + 2 < x < CX + 10: continue       # a broken tread
            c.p(x, y, P['wood'][k] if mended else P['grey'][k]); c.p(x, y + 1, P['wood'][k - 2] if mended else P['grey'][k - 2]); c.p(x, y + 2, P['wood'][1])
    c.outline()
    # ---- grounding: dark where it meets the earth; weeds up the footing on the shack, flowers by the mended one's step
    for x in range(WX0 - 3, WX1 + 3):
        p = c.get(x, G)
        if p[3] == 255: c.px[x, G] = (round(p[0] * .6), round(p[1] * .6), round(p[2] * .6), 255)
    if not mended:
        for i in range(40):
            x = WX0 + H(i, 7) * (WX1 - WX0); h = 2 + int(H(i, 8) * 7)
            for j in range(h): c.p(x + (j // 3) * (1 if H(i, 9) > .5 else -1), G - j, P['moss'][3 if j < 2 else 2])
    else:
        for x in (CX - 24, CX - 28, CX + 23, CX + 27):
            c.p(x, G - 2, P['sage'][3]); c.p(x, G - 3, P['red'][4]); c.p(x + 1, G - 3, P['brass'][3])
    return c


SPR = {}
for mended in (0, 1):
    for night in (0, 1):
        nm = 'cabin_s%d' % mended + ('_n' if night else '')
        c = shack(bool(mended), bool(night)); c.im.save(OBJ + nm + '.png')
        SPR[nm] = {'src': f'spr/lpc/obj/{nm}.png', 'fw': W, 'fh': HH, 'ax': CX, 'ay': G, 'foot': [-2.3, -2.8, 2.3, 0]}
        if not night: SPR[nm].update({'bw': 4.6, 'chim': [118 + 7 - CX + (0 if mended else 5), 2 - G]})
        print(nm)


# ---------------------------------------------------------------- the run-down inside
SRC = '/home/user/Minecraftbot/hollow-acre/2d/tools/px/out/'
def rundown(night):
    im = Image.open(SRC + ('room_cabin0_n.png' if night else 'room_cabin0.png')).convert('RGBA'); c = C(im.width, im.height); c.im = im; c.px = im.load()
    SIDE, TOP = 12, 100
    fx = lambda m: int(SIDE + m * 32); fy = lambda m: int(TOP + m * 32)
    # broken boards: holes into the dark under the floor, splintered at the ends
    for (mx, mz, w) in ((2.0, 4.3, 22), (4.3, 5.1, 18), (.6, 3.4, 14)):
        x0, y0 = fx(mx), fy(mz)
        for y in range(y0, y0 + 5):
            for x in range(x0 + (1 if y in (y0, y0 + 4) else 0), x0 + w - (2 if y in (y0, y0 + 4) else 0)):
                c.p(x, y, (10, 7, 8) if y > y0 else (30, 20, 16))
        for i in range(3): c.p(x0 - 1 - i, y0 + 1 + i % 2, P['wood'][4]); c.p(x0 + w + i, y0 + 2 - i % 2, P['wood'][4])
    # the leak: a stain on the boards, a tin bucket catching it
    bx, by = fx(3.7), fy(2.3)
    for y in range(by - 10, by + 12):
        for x in range(bx - 20, bx + 22):
            d = ((x - bx) / 20) ** 2 + ((y - by) / 10) ** 2
            if d < 1: c.p(x, y, (20, 14, 12), int(70 * (1 - d)))
    for y in range(by - 9, by + 1):
        for x in range(bx - 6, bx + 7):
            u = (x - bx) / 6; k = 4 if u < -.3 else 3 if u < .3 else 2
            c.p(x, y, P['stone'][k])
    for x in range(bx - 6, bx + 7): c.p(x, by - 9, P['stone'][5]); c.p(x, by - 8, P['glass'][3] if abs(x - bx) < 5 else P['stone'][2])
    for x in range(bx - 7, bx + 8): c.p(x, by + 1, (14, 10, 10))
    # damp running down the walls from the roof, mould at the foot of it, cobwebs in the corners
    for (mx, ln) in ((.8, 70), (3.7, 54), (5.4, 80)):
        x0 = fx(mx)
        for y in range(12, ln):
            for dx in range(-2, 3):
                if H(dx, y // 3, mx) > .5 - abs(dx) * .1: c.p(x0 + dx + math.sin(y * .2) * .8, y, (24, 30, 18), 70)
        for i in range(10): c.p(x0 + (H(i, 4, mx) - .5) * 10, ln + (H(i, 5, mx) - .5) * 6, P['moss'][1 + i % 2])
    for (cx_, sgn) in ((SIDE + 1, 1), (im.width - SIDE - 2, -1)):
        for a in range(6):
            ang = a / 5 * math.pi / 2
            for t in range(22):
                x = cx_ + sgn * math.cos(ang) * t; y = 13 + math.sin(ang) * t * .9
                c.p(x, y, (220, 220, 210), 110)
        for rr in (6, 11, 16, 21):
            for a in range(40):
                ang = a / 39 * math.pi / 2; x = cx_ + sgn * math.cos(ang) * rr; y = 13 + math.sin(ang) * rr * .9 + math.sin(a * .8) * .5
                c.p(x, y, (220, 220, 210), 80)
    # the right window boarded over from inside
    wx = fx(4.6)
    for (yy, a) in ((34, .12), (46, -.08), (58, .1)):
        for i in range(-16, 17):
            for j in range(5): c.p(wx + i, yy + i * a + j, P['grey'][[4, 3, 3, 2, 1][j]])
    # leaves blown in under the door, grit in the corners
    door = fx(3)
    # (owner: "too gritty") each leaf a 4x3 shape with a lit top edge and a dark lower one, in small groups, no loose specks
    LEAVES = [((110, 60, 30), (150, 80, 30), (70, 38, 22)), ((140, 104, 40), (180, 140, 56), (88, 64, 28)), ((96, 72, 44), (124, 96, 58), (62, 46, 30))]
    for g in range(5):
        gx = door + (H(g, 11) - .5) * 60; gy = fy(5.6) + (H(g, 12) - .5) * 14
        for k in range(2 + (g % 2)):
            x = int(gx + (H(g * 7 + k, 15) - .5) * 12); y = int(gy + (H(g * 7 + k, 16) - .5) * 6); body, lit, dk = LEAVES[(g + k) % 3]
            for (dx, dy) in ((1, 0), (2, 0), (0, 1), (1, 1), (2, 1), (3, 1), (1, 2), (2, 2)): c.p(x + dx, y + dy, body)
            c.p(x + 1, y, lit); c.p(x, y + 1, lit); c.p(x + 2, y + 2, dk); c.p(x + 3, y + 1, dk); c.p(x + 4, y + 2, dk)
    return im
for night in (0, 1):
    nm = 'room_cabin0' + ('_n' if night else ''); rundown(bool(night)).save(OBJ + nm + '.png')
    SPR[nm] = {'src': f'spr/lpc/obj/{nm}.png', 'fw': 216, 'fh': 304, 'ax': 0, 'ay': 0, 'foot': [0, 0, 0, 0], 'side': 12, 'top': 100,
               'room': {'w': 6, 'd': 6, 'door': 3, 'theme': 'cabin', 'windows': [[1.4, 0], [4.6, 0]]}}
for night in (0, 1):
    nm = 'room_cabin0m' + ('_n' if night else ''); shutil.copy(SRC + nm + '.png', OBJ + nm + '.png')
    SPR[nm] = {'src': f'spr/lpc/obj/{nm}.png', 'fw': 216, 'fh': 304, 'ax': 0, 'ay': 0, 'foot': [0, 0, 0, 0], 'side': 12, 'top': 100,
               'room': {'w': 6, 'd': 6, 'door': 3, 'theme': 'home', 'paper': 'mustard', 'windows': [[1.4, 0], [4.6, 0]]}}
d = json.load(open('spr/lpc/objects.json')); d.update(SPR); json.dump(d, open('spr/lpc/objects.json', 'w')); print('ok')
