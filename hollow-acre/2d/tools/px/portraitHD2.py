"""High-detail talking portraits (128x128, seven expressions) for the young adult women of Marrow Hollow, second pass, in the
manner of the farming-game portraits the player pointed at: the head turned a little (three-quarter), big and filling the
frame; a short neck and soft sloping shoulders; hair built from shaded locks with a sheen, falling over the shoulders; cel
shading in a few strong tones with dark coloured outlines; a low neckline with natural soft curves and cleavage.
Output: out/portraits_hd.png (seven frames per row) + out/portraits_hd.json"""
import sys, json, math, colorsys
from PIL import Image
src = open('chibi2.py').read(); ns = {}; exec(src[:src.index('# player base colours')].split('from run import run')[1], ns); NPC = ns['NPC']
W = H = 128
EXS = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'scared', 'wrong']
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def ramp(h):
    """six tones: 0 line, 1 deep shadow, 2 shadow, 3 base, 4 light, 5 highlight; shadows drift toward violet, lights toward warm"""
    r, g, b = [v / 255 for v in hexc(h)]; hh, ss, vv = colorsys.rgb_to_hsv(r, g, b); out = []
    for t, dh, ds, dv in ((-1, -.05, .35, -.72), (-.66, -.035, .22, -.44), (-.33, -.018, .1, -.2), (0, 0, 0, 0), (.33, .012, -.1, .14), (.66, .022, -.22, .3)):
        out.append(tuple(int(c * 255) for c in colorsys.hsv_to_rgb((hh + dh) % 1, min(1, max(0, ss + ds * (1 if ss > .08 else .2))), min(1, max(0, vv * (1 + dv))))))
    return out
def mix(a, b, t): return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))
def clamp(v, a, b): return max(a, min(b, v))
def hsh(x, y, s=0):
    n = math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return n - math.floor(n)
def seg(x0, y0, x1, y1):
    n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
    return [(round(x0 + (x1 - x0) * i / n), round(y0 + (y1 - y0) * i / n)) for i in range(n + 1)]
def curve(pts, steps=40):
    out = []
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        for x, y in seg(x0, y0, x1, y1): out.append((x, y))
    return out

def render(name, C, ex):
    px = [[None] * W for _ in range(H)]
    def P(x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < W and 0 <= y < H and c is not None: px[y][x] = c
    def G(x, y):
        x, y = int(round(x)), int(round(y)); return px[y][x] if 0 <= x < W and 0 <= y < H else None
    SK = ramp(C.get('skin', '#e8b48c')); HR = ramp(C.get('hair', '#6a4224')); EY = ramp(C.get('eye', '#3a6a9a'))
    SH = ramp(C.get('shirt', '#b8402c')); EX = ramp(C.get('extra', '#6a7a3a')); AC = ramp(C.get('acc', '#c83a5a'))
    OUT = C.get('outfit') or ('dress' if C.get('skirt') else 'tee'); PAT = C.get('pattern') or ''; st = C.get('hairStyle', 'long')
    wrong = ex == 'wrong'
    if wrong: SK = [mix(c, (140, 150, 160), .4) for c in SK]
    # ---------------------------------------------------------------- the head: turned a little to the viewer's right
    AX, CHIN = 66, 90
    def xl(y):   # the near (left) contour of the face
        if y < 62: return 37 + max(0, 44 - y) * .4
        return 37 + (AX - 1 - 37) * ((y - 62) / (CHIN - 62)) ** 1.55
    def xr(y):   # the far (right) contour: the cheek closer to the nose, the jaw shorter
        if y < 58: return 92 - max(0, 44 - y) * .34
        return 92 - (92 - (AX + 3)) * ((y - 58) / (CHIN - 58)) ** 1.25
    # ---------------------------------------------------------------- hair: locks fanning out from a source, a dark seam between them, a sheen
    def lock_tone(x, y, src, n, base=3, wave=0.0, sheen=None):
        th = math.atan2(x - src[0], y - src[1]) + (math.sin(y * .2 + x * .04) * wave)
        f = (th * n / math.pi) % 1; k = base
        if f < .1: k = base - 2
        elif f < .32: k = base - 1
        elif f > .74: k = base + 1
        if sheen:
            r = math.hypot(x - sheen[0], y - sheen[1]); j = sheen[2] + math.sin(th * n * 2) * 2.5
            if j < r < j + 6 and f > .2 and y < 52: k = min(5, k + 2 if r < j + 3 else k + 1)
        if x > AX + 18: k -= 1
        return HR[clamp(k, 0, 5)]
    skull = lambda x, y: ((x - 65) / 34) ** 2 + ((y - 46) / 33) ** 2 <= 1
    SHEEN = (60, 54, 24)
    def hair_back():
        for y in range(H):
            for x in range(W):
                m = False
                if skull(x, y) and y < 64: m = True
                if st in ('long', 'wavy'):
                    l = 25 - (y - 44) * .05 + 3 * math.sin(y * .21); r = 106 + (y - 44) * .06 + 3 * math.sin(y * .21 + 1)
                    tip = 124 - 5 * abs(math.sin(x * .4))
                    if 44 <= y < tip and l < x < r: m = True
                if st == 'bun' and ((x - 66) / 15) ** 2 + ((y - 13) / 12) ** 2 <= 1: m = True
                if st == 'ponytail':
                    pcx = 100 + math.sin((y - 40) / 70 * 2.0) * 5; pw = 9 - abs(y - 70) / 10
                    if 34 < y < 112 and abs(x - pcx) < pw: m = True
                if m:
                    src = (78, 12) if st in ('long', 'wavy') else (66, 13) if st == 'bun' else (52, 14) if st == 'ponytail' else (66, 16)
                    P(x, y, lock_tone(x, y, src, 7 if st == 'wavy' else 9, 2 if not skull(x, y) else 3, .07 if st == 'wavy' else 0, SHEEN))
    def hair_front():
        for y in range(4, 100):
            for x in range(W):
                m = False; src = (66, 14)
                if st in ('long', 'wavy'):
                    src = (78, 12)
                    fringe = (27 + (78 - x) * .3 + 2 * math.sin(x * .6)) if x < 78 else (28 + (x - 78) * .7)
                    if skull(x, y) and y < fringe: m = True
                    if 42 <= y < 98 and xl(y) - 7 < x < xl(y) + 1: m = True
                    if 42 <= y < 92 and xr(y) - 2 < x < xr(y) + 6: m = True
                elif st == 'bun':
                    src = (66, 13)
                    hl = 29 + ((x - 66) / 30) ** 2 * 20
                    if skull(x, y) and y < hl: m = True
                    if 40 <= y < 62 and (xl(y) - 5 < x < xl(y) + 2 or xr(y) - 1 < x < xr(y) + 5): m = True
                elif st == 'ponytail':
                    src = (52, 14)
                    fringe = (26 + (x - 52) * .42 + 2 * math.sin(x * .7)) if x > 52 else 27
                    if skull(x, y) and y < fringe: m = True
                    if 40 <= y < 64 and (xl(y) - 5 < x < xl(y) + 2 or xr(y) - 1 < x < xr(y) + 5): m = True
                else:   # braids: a centre parting, smooth over the ears
                    src = (66, 16)
                    hl = 28 + ((x - 66) / 28) ** 2 * 22
                    if skull(x, y) and y < hl: m = True
                    if 40 <= y < 66 and (xl(y) - 5 < x < xl(y) + 2 or xr(y) - 1 < x < xr(y) + 5): m = True
                if m: P(x, y, lock_tone(x, y, src, 9, 3, .07 if st == 'wavy' else 0, SHEEN))
        if st == 'bun':   # loose strands at the temples
            for s in (-1, 1):
                pts = [(66 + s * (25 + math.sin(j * .5) * 2), 34 + j * 2.6) for j in range(16)]
                for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
                    for x, y in seg(x0, y0, x1, y1): P(x, y, HR[4 if s < 0 else 3]); P(x + s, y, HR[1])
    def hair_over_shoulders():
        if st in ('long', 'wavy'):   # the ends fall in front of the shoulders
            for y in range(84, 126):
                for x in range(W):
                    for (a, b) in ((14, 30), (100, 114)):
                        aa = a + 3 * math.sin(y * .21); bb = b + 3 * math.sin(y * .21 + 1) - (y - 84) * .05
                        tip = 124 - 6 * abs(math.sin(x * .45))
                        if aa < x < bb and y < tip: P(x, y, lock_tone(x, y, (78, 12), 9, 3, .07 if st == 'wavy' else 0))
        if st == 'ponytail':
            for x in range(94, 106): P(x, 44, AC[3]); P(x, 45, AC[2])
        if st == 'braids':
            for s in (-1, 1):
                for y in range(58, 128):
                    cx = 66 + s * (31 + (y - 58) * .06); lobe = (y // 7) % 2; f = (y % 7) / 7
                    w = 5.5 - abs(f - .5) * 3
                    for x in range(int(cx - w), int(cx + w) + 1):
                        u = (x - cx) / w; k = 3 + (1 if (u < 0) == bool(lobe) else -1) - (1 if abs(u) > .75 else 0)
                        if f < .12: k = 1
                        P(x, y, HR[clamp(k, 0, 5)])
    # ---------------------------------------------------------------- the body: neck, soft sloping shoulders, chest, the bust's soft curves
    BN, BF = (49, 128, 17.5), (84, 128, 16)       # near and far breast: centre x, y, radius (the lower halves are out of frame)
    def body():
        for y in range(CHIN - 10, H):
            nl = 57 if y < 95 else 57 - 45 * min(1, ((y - 95) / 19)) ** .6
            nr = 76 if y < 96 else 76 + 43 * min(1, ((y - 96) / 20)) ** .6
            for x in range(int(nl), int(nr) + 1):
                k = 3
                if y < 97:
                    k = 4 if x < 60 else 2 if x > 72 else 3
                    if y < CHIN + 5: k = 2 if x > 58 else 3            # the jaw's shadow on the neck
                else:
                    k = 4 if x < 60 else 3
                    if x > 92: k = 2
                    for (cx, cy, r) in (BN, BF):
                        dx, dy = (x - cx) / r, (y - cy) / r; d2 = dx * dx + dy * dy
                        if d2 < 1:
                            l = -.55 * dx - .8 * dy + .4 * math.sqrt(1 - d2)
                            k = 5 if l > .72 else 4 if l > .42 else 3 if l > .12 else 2
                            if d2 > .8 and dx > .2: k = 1
                    if abs(x - 67 + (y - 112) * .06) < 1.2 and y > 112: k = 0 if y > 117 else 1        # the cleavage
                    elif abs(x - 67 + (y - 112) * .06) < 2.6 and y > 110: k = min(k, 2)
                P(x, y, SK[k])
        for (x0, y0, x1, y1) in ((60, 101, 32, 106), (74, 101, 99, 105)):    # collarbones
            for x, y in seg(x0, y0, x1, y1): P(x, y, SK[4]); P(x, y + 1, SK[2])
    def neckline_y(x):
        cn = BN[1] - math.sqrt(max(0, BN[2] ** 2 - (x - BN[0]) ** 2)) * .62 + 1
        cf = BF[1] - math.sqrt(max(0, BF[2] ** 2 - (x - BF[0]) ** 2)) * .62 + 1
        if x < BN[0] - BN[2] + 3: return 117 - (BN[0] - BN[2] + 3 - x) * .95
        if x > BF[0] + BF[2] - 3: return 118 - (x - (BF[0] + BF[2] - 3)) * .95
        return min(cn if abs(x - BN[0]) <= BN[2] else 200, cf if abs(x - BF[0]) <= BF[2] else 200)
    def clothes():
        layer = OUT in ('cardigan', 'jacket', 'longcoat')
        for y in range(94, H):
            nl = 57 - 45 * min(1, max(0, (y - 95) / 19)) ** .6; nr = 76 + 43 * min(1, max(0, (y - 96) / 20)) ** .6
            for x in range(int(nl) - 1, int(nr) + 2):
                cy = neckline_y(x)
                if y < cy: continue
                R = SH; k = 3
                if x < 52: k = 4
                if x > 90: k = 2
                for (cx, cyy, r) in (BN, BF):
                    dx, dy = (x - cx) / (r + 2), (y - cyy) / (r + 2); d2 = dx * dx + dy * dy
                    if d2 < 1:
                        l = -.5 * dx - .75 * dy + .45 * math.sqrt(1 - d2); k = 4 if l > .55 else 3 if l > .22 else 2
                if PAT == 'plaid' and ((x // 6) % 3 == 0 or (y // 6) % 3 == 0): k = max(1, k - 1)
                if PAT == 'dots' and x % 8 == 4 and y % 8 == 4: k = 5
                if PAT == 'stripes' and (y // 4) % 2: k = max(1, k - 1)
                if layer:
                    lap = (30 - (y - 100) * .1) if x < 66 else (102 + (y - 100) * .1)
                    if x < lap or x > lap + 0 and x > 101 + (y - 100) * .1:
                        R = EX; k = 4 if x < 40 else 3 if x < 100 else 2
                        if abs(x - lap) < 1.2: k = 0 if x > 66 else 5
                if y < cy + 1.3: c = R[0]                    # the neckline's edge
                elif y < cy + 2.6 and x < 90: c = R[5 if x < 60 else 4]
                else: c = R[clamp(k, 0, 5)]
                P(x, y, c)
        # folds: the cloth gathered over the bust and pulled toward the shoulders
        for (x0, y0, x1, y1) in ((30, 119, 20, 110), (100, 120, 108, 112), (34, 125, 27, 118)):
            for x, y in seg(x0, y0, x1, y1):
                if G(x, y) and G(x, y) in SH: P(x, y, SH[2])
        if OUT == 'shirt':   # the collar standing open either side of the neckline
            for s in (-1, 1):
                pts = [(66 + s * 11, 98), (66 + s * 26, 106), (66 + s * 22, 113)]
                for i in range(12):
                    for x, y in seg(66 + s * (11 + i), 98 + i * .6, 66 + s * (18 + i * .6), 108 + i * .4):
                        P(x, y, (246, 242, 236) if s < 0 else (222, 216, 220))
                for x, y in seg(66 + s * 11, 98, 66 + s * 29, 106): P(x, y, (90, 80, 96))
    # ---------------------------------------------------------------- the face
    def face():
        for y in range(22, CHIN + 1):
            a, b = xl(y), xr(y)
            for x in range(int(math.ceil(a)), int(b) + 1):
                k = 3
                if ((x - (a + 8)) / 13) ** 2 + ((y - 54) / 22) ** 2 < 1: k = 4      # the lit cheek and temple
                if ((x - (a + 7)) / 5) ** 2 + ((y - 54) / 6) ** 2 < 1: k = 5
                if x > b - 4: k = 2
                if y > CHIN - 4: k = 2 if x > AX - 2 else 3
                if AX + 2 < x < AX + 6 and 70 < y < 74: k = 2                          # under the nose
                P(x, y, SK[k])
            P(b, y, SK[1] if y > 60 else None)                       # the far jaw, drawn as a line
        for (cx, cy, rx, ry, t) in ((48, 70, 7, 3.2, .42), (84, 67, 4, 2.6, .32)):   # blush
            for y in range(int(cy - ry), int(cy + ry) + 1):
                for x in range(int(cx - rx), int(cx + rx) + 1):
                    d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
                    if d < 1 and G(x, y): P(x, y, mix(G(x, y), (240, 120, 128), t * (1 - d) + (.15 if ex == 'happy' else 0)))
        # the nose: a lit bridge, the tip, a shadow below and to the right
        for y in range(58, 68): P(AX, y, SK[4] if y < 66 else None)
        for x, y, k in ((AX + 1, 68, 2), (AX + 2, 68, 2), (AX + 3, 67, 2), (AX, 69, 2), (AX - 1, 68, 3), (AX + 1, 69, 1), (AX - 2, 69, 3)): P(x, y, SK[k])
    LASH = (36, 18, 30); WHITE = (250, 246, 242); WHITE2 = (214, 204, 214)
    def eye(ecx, ecy, A, s):
        if wrong:
            for y in range(ecy - 6, ecy + 6):
                for x in range(ecx - A, ecx + A + 1):
                    if ((x - ecx) / (A + .3)) ** 2 + ((y - ecy) / 5.4) ** 2 <= 1: P(x, y, (8, 4, 8))
            P(ecx, ecy, (210, 30, 30)); P(ecx + 1, ecy, (160, 20, 20)); return
        if ex == 'happy':
            pts = [(ecx + i, ecy + 1 - round(math.cos(i / A * 1.45) * 3.4)) for i in range(-A, A + 1)]
            for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
                for x, y in seg(x0, y0, x1, y1): P(x, y, LASH); P(x, y + 1, LASH); P(x, y + 2, SK[2])
            for i in range(4): P(ecx + s * (A + 1 + i), ecy - 1 - i, LASH)
            return
        wide = ex in ('surprised', 'scared'); narrow = ex == 'angry'
        top = ecy - (6 if wide else 3 if narrow else 5); bot = ecy + (4 if wide else 3)
        U = {}; L = {}
        for x in range(ecx - A, ecx + A + 1):
            t = (x - ecx) / A
            U[x] = round(top + t * t * (2.5 if narrow else 4) - s * t * 1.3); L[x] = round(bot - t * t * 2.6)
        for x in U:
            for y in range(U[x] + 1, L[x] + 1): P(x, y, WHITE2 if y <= U[x] + 1 else WHITE)
        ir = (3.4 if wide else 4.8) * (A / 7); icx = ecx + (1 if s > 0 else 0); icy = ecy + (1 if ex == 'sad' else 0)
        for y in range(int(icy - 6), int(icy + 7)):
            for x in range(int(icx - 6), int(icx + 7)):
                if x not in U or y <= U[x] or y > L[x]: continue
                d = math.hypot((x - icx) / (A / 7), y - icy)
                if d > (3.4 if wide else 4.8): continue
                k = 0 if d > (2.5 if wide else 3.8) else (1 if y < icy - 1 else 3 if y > icy + 1 else 2)
                P(x, y, EY[k])
        pr = 1.2 if ex == 'scared' else 2
        for y in range(int(icy - 3), int(icy + 4)):
            for x in range(int(icx - 3), int(icx + 4)):
                if x in U and U[x] < y <= L[x] and math.hypot(x - icx, y - icy) <= pr: P(x, y, (14, 10, 22))
        for dx, dy in ((-2, -2), (-1, -2), (-2, -1)): P(icx + dx, icy + dy, (255, 255, 255))
        P(icx + 2, icy + 2, mix(EY[5], WHITE, .4))
        xs = sorted(U)
        for x0, x1 in zip(xs, xs[1:]):
            for x, y in seg(x0, U[x0], x1, U[x1]):
                P(x, y, LASH); P(x, y - 1, LASH if abs(x - ecx) > 1 else mix(SK[2], (110, 66, 110), .5))
                P(x, y - 2, mix(SK[3], (146, 92, 140), .45))
        ox = ecx + s * A
        for i in range(4): P(ox + s * i, U[ox] - 1 - i, LASH); P(ox + s * i, U[ox] - i, LASH)
        for x0, x1 in zip(xs, xs[1:]):
            for x, y in seg(x0, L[x0] + 1, x1, L[x1] + 1): P(x, y, SK[2])
        P(ox, L[ox], LASH)
        if ex == 'scared':
            for j in range(5): P(98, 34 + j, (180, 220, 250))
    def brows():
        for (x0, x1, y0, s) in ((41, 59, 46, -1), (72, 87, 45, 1)):
            for i in range(17):
                t = i / 16; x = x0 + (x1 - x0) * t if s < 0 else x0 + (x1 - x0) * t
                inner = (1 - t) if s < 0 else t
                y = y0 - math.sin(t * math.pi) * 3
                if ex == 'angry': y += inner * 3.5 - 1
                if ex in ('sad', 'scared'): y -= inner * 3.5
                if ex == 'surprised': y -= 3
                P(x, y, HR[0]); P(x, y + 1, HR[1] if (inner > .3) else None)
    L1, L2, L3, LH = (130, 24, 50), (186, 50, 78), (220, 94, 112), (255, 186, 194)
    def mouth():
        mx, my = AX + 1, 78
        if wrong:
            for i in range(-12, 12):
                yy = my + round((i / 12) ** 2 * -5) + 1
                P(mx + i, yy, (40, 8, 14)); P(mx + i, yy - 1, (236, 230, 220) if i % 2 else (40, 8, 14)); P(mx + i, yy + 1, (40, 8, 14))
            return
        if ex == 'happy':
            for i in range(-8, 9):
                t = i / 8; up = my - 1 - round(t * t * 3); lo = my + 4 - round(t * t * 5)
                P(mx + i, up, L1)
                for y in range(up + 1, lo + 1): P(mx + i, y, (248, 244, 236) if y <= up + 2 else (110, 30, 46))
                P(mx + i, lo + 1, L2 if abs(i) < 7 else None)
            P(mx - 9, my - 4, SK[2]); P(mx + 9, my - 4, SK[2]); return
        if ex in ('surprised', 'scared'):
            for y in range(my - 3, my + 4):
                for x in range(mx - 4, mx + 5):
                    d = ((x - mx) / 4) ** 2 + ((y - my) / 3.6) ** 2
                    if d <= 1: P(x, y, L2 if d > .55 else (90, 24, 40))
            return
        bend = 2 if ex == 'sad' else 0 if ex == 'angry' else -1
        for i in range(-7, 8):
            t = i / 7; ln = my + round(t * t * bend)
            top = my - 2 + round(t * t * 1.5); bot = my + 3 - round(t * t * 2.5)
            for y in range(top, ln): P(mx + i, y, L2)
            P(mx + i, ln, L1)
            for y in range(ln + 1, bot + 1): P(mx + i, y, L3 if y == ln + 2 and abs(i) < 5 else L2)
        for x in (mx - 3, mx - 2): P(x, my + 2, LH)
        P(mx - 8, my - 1, SK[2]); P(mx + 8, my - 1, SK[2])
    # ---------------------------------------------------------------- accessories
    def extras():
        acc = C.get('accessory')
        if acc == 'necklace':
            pts = curve([(58, 99), (60, 106), (66, 111), (73, 106), (75, 99)])
            for x, y in pts: P(x, y, AC[4])
            for y in range(111, 118):
                for x in range(63, 70):
                    if ((x - 66) / 2.8) ** 2 + ((y - 114) / 3.4) ** 2 <= 1: P(x, y, AC[5] if x < 66 else AC[3])
            P(65, 112, (255, 255, 255))
        if acc == 'headband':
            for i in range(-32, 33):
                y = 27 + (i / 32) ** 2 * 13
                for j in range(4): P(65 + i, y + j, AC[5 if j == 0 else 4 if j == 1 else 2])
        if acc == 'flower':
            fx, fy = 40, 34
            for a in range(5):
                an = a / 5 * math.pi * 2
                for r in range(6):
                    for w in (-1, 0, 1): P(fx + math.cos(an) * r - math.sin(an) * w, fy + math.sin(an) * r + math.cos(an) * w, AC[5 if r < 3 else 3])
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1): P(fx + dx, fy + dy, (250, 220, 90))
        if C.get('glasses'):
            FR = (64, 42, 58)
            for (gx, gy, rx, ry) in ((51, 57, 10, 8), (79, 56, 8, 8)):
                for a in range(0, 360, 3):
                    an = math.radians(a); P(gx + math.cos(an) * rx, gy + math.sin(an) * ry, FR)
                P(gx - rx + 3, gy - ry + 3, (255, 255, 255)); P(gx - rx + 4, gy - ry + 3, (230, 240, 250))
            for x in range(61, 71): P(x, 54, FR)
            for x, y in seg(41, 56, 34, 58): P(x, y, FR)
        if C.get('hat') == 'cap':
            HC = ramp(C.get('hatColor', '#3a5a8a'))
            for y in range(4, 36):
                for x in range(W):
                    if ((x - 66) / 37) ** 2 + ((y - 34) / 27) ** 2 <= 1 and y < 34:
                        k = 4 if x < 52 else 3 if x < 82 else 2
                        if (x - 66) % 15 == 0 and y < 30: k = 1
                        P(x, y, HC[k])
            for x in range(30, 104):
                for j in range(4): P(x, 33 + j - (1 if 40 < x < 92 else 0), HC[1 if j > 1 else 2])
    # ---------------------------------------------------------------- draw in order, then outline in a dark tone of whatever it borders
    hair_back(); body(); clothes(); face(); eye(52, 57, 8, -1); eye(79, 56, 6, 1); brows(); mouth(); hair_front(); extras(); hair_over_shoulders()
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0)); o = out.load()
    for y in range(H):
        for x in range(W):
            if px[y][x]: o[x, y] = px[y][x] + (255,)
    for y in range(H):
        for x in range(W):
            if px[y][x]: continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                c = G(x + dx, y + dy)
                if c:
                    r, g, b = c; hh, ss, vv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
                    rr, gg, bb = colorsys.hsv_to_rgb((hh - .03) % 1, min(1, ss * 1.1 + .2), max(.1, vv * .3))
                    o[x, y] = (int(rr * 255), int(gg * 255), int(bb * 255), 255); break
    return out

if __name__ == '__main__':
    names = sys.argv[1:] or ['nell', 'june', 'cora', 'ida', 'tess', 'iris', 'della', 'maud']
    sheet = Image.new('RGBA', (W * len(EXS), H * len(names)), (0, 0, 0, 0))
    for j, n in enumerate(names):
        for i, ex in enumerate(EXS): sheet.alpha_composite(render(n, NPC[n], ex), (i * W, j * H))
        print(n, 'ok', flush=True)
    sheet.save('out/portraits_hd.png'); json.dump({'ids': names, 'pw': W, 'ph': H, 'expr': EXS}, open('out/portraits_hd.json', 'w'))
