"""#255 the farm's tractor: an old red row-crop tractor, drawn by hand in code (no outside art). Three views (side, front,
back; the other side is the side view flipped), each in two layers so the farmer can sit IN it: the 'under' layer is
drawn first, then the farmer on the seat, then the 'over' layer (whatever is nearer the eye than the driver: the near
rear wheel and fender from the side, the hood and steering wheel from the front, the big rear wheels and seat back from
behind). Lit from the top left, hue-shifted ramps, a dark outline only on the outer silhouette.
Run: python3 tractor_art.py [--install <scratchpad>]"""
import sys, os, json, math
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
R = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)

OL = (30, 14, 10, 255)
RED = [(200, 92, 58, 255), (168, 64, 42, 255), (138, 46, 32, 255), (100, 30, 24, 255), (62, 18, 16, 255)]   # hi, light, mid, dark, deepest
TYRE = [(78, 70, 62, 255), (58, 52, 46, 255), (40, 36, 32, 255), (24, 21, 19, 255)]
RIM = [(214, 196, 150, 255), (176, 156, 112, 255), (128, 110, 76, 255), (84, 70, 48, 255)]
MET = [(150, 150, 156, 255), (110, 110, 118, 255), (74, 74, 82, 255), (44, 44, 50, 255)]
RUST = (122, 70, 40, 255)
SEAT = [(120, 96, 70, 255), (86, 66, 48, 255), (56, 42, 32, 255)]

class C:
    def __init__(s, w, h): s.im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); s.p = s.im.load(); s.w, s.h = w, h
    def px(s, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < s.w and 0 <= y < s.h: s.p[x, y] = c
    def get(s, x, y): return s.p[x, y] if 0 <= x < s.w and 0 <= y < s.h else (0, 0, 0, 0)
    def rect(s, x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): s.px(x, y, c)
    def outline(s, col=OL):
        src = s.im.copy(); sp = src.load(); add = []
        for y in range(s.h):
            for x in range(s.w):
                if sp[x, y][3] == 255: continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    xx, yy = x + dx, y + dy
                    if 0 <= xx < s.w and 0 <= yy < s.h and sp[xx, yy][3] == 255 and sp[xx, yy] != col: add.append((x, y)); break
        for x, y in add: s.p[x, y] = col

def wheel_side(c, cx, cy, r, rim_r, dark=False, lugs=14):
    """a wheel seen from the side: a lugged tyre, a dished rim, a hub; lit top-left"""
    for y in range(cy - r - 1, cy + r + 2):
        for x in range(cx - r - 1, cx + r + 2):
            d = math.hypot(x - cx, y - cy)
            if d > r + .3: continue
            a = math.atan2(y - cy, x - cx)
            lit = -(math.cos(a) * .7 + math.sin(a) * .7)   # +1 toward the top-left
            if d > rim_r:
                k = 1 if lit > .35 else 2 if lit > -.4 else 3
                # lugs: notches around the outer ring
                if d > r - 3 and (int((a + math.pi) / (2 * math.pi) * lugs * 2) % 2 == 0): k = min(3, k + 1)
                if d > r - .9 and lit > .5: k = 0
                col = TYRE[k]
            else:
                k = 0 if lit > .55 and d > rim_r - 2 else 1 if lit > -.2 else 2
                if d < rim_r * .45: k = 2 if lit < .3 else 1
                if d < 2.2: k = 3
                col = RIM[k]
            if dark: col = tuple(int(v * .62) for v in col[:3]) + (255,)
            c.px(x, y, col)
    # wheel nuts on the hub
    for i in range(5):
        a = i / 5 * math.tau - .4
        c.px(cx + math.cos(a) * rim_r * .55, cy + math.sin(a) * rim_r * .55, RIM[3] if not dark else (40, 34, 24, 255))

def tyre_edge(c, x0, y0, w, h, dark=False):
    """a big tyre seen edge-on (front or back view): a tall rounded slab with chevron lugs, lit on its left"""
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w):
            # rounded top and bottom
            t = (y - y0) / max(1, h - 1); e = abs(t - .5) * 2
            inset = int(max(0, (e - .78) / .22 * (w * .35))) if e > .78 else 0
            if x < x0 + inset or x > x0 + w - 1 - inset: continue
            u = (x - x0) / max(1, w - 1)
            k = 1 if u < .3 else 2 if u < .8 else 3
            # chevrons: a V of lugs every 6 rows
            ph = (y - y0 + abs(u - .5) * 8) % 6
            if ph < 2: k = max(0, k - 1)
            col = TYRE[k]
            if dark: col = tuple(int(v * .7) for v in col[:3]) + (255,)
            c.px(x, y, col)

def body_rect(c, x0, y0, x1, y1, top_rows=2, light_left=True):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            k = 2
            if y - y0 < top_rows: k = 0 if y == y0 else 1
            elif y1 - y < 2: k = 3
            elif light_left and x - x0 < 2: k = 1
            elif x1 - x < 2: k = 3
            c.px(x, y, RED[k])

# ---------------------------------------------------------------- side view (facing east)
def side():
    W, H, G = 132, 108, 104
    under, over = C(W, H), C(W, H)
    shadow(under, 70, G, 62, 4)
    # the far wheels, peeking out behind and above (darker)
    wheel_side(under, 40, G - 31, 29, 17, dark=True)
    wheel_side(under, 109, G - 16, 15, 7, dark=True)
    # the frame and engine block under the hood
    under.rect(58, 66, 116, 80, MET[3])
    for x in range(60, 114, 9): under.rect(x, 69, x + 4, 76, MET[2])
    under.rect(58, 66, 116, 67, MET[2])
    # the front axle bracket
    under.rect(100, 78, 112, 84, MET[2]); under.rect(102, 80, 110, 82, MET[1])
    # the platform the driver's boots rest on
    under.rect(46, 62, 64, 66, MET[2]); under.rect(46, 62, 64, 62, MET[1])
    # the hood: a long rounded box, louvres down its side, the grille at the nose
    body_rect(under, 56, 44, 120, 66)
    for x in range(58, 121):   # a rounded top edge
        under.px(x, 43, RED[1] if x < 110 else RED[2])
    for x in range(118, 124):
        for y in range(46, 66): under.px(x, y, RED[3] if x > 120 else RED[2])
    for i, x in enumerate(range(78, 104, 6)):
        under.rect(x, 50, x + 2, 60, RED[4]); under.rect(x, 50, x, 60, RED[3])
    # the grille, at the front: bars
    for y in range(47, 66):
        under.px(124, y, MET[3] if y % 3 else MET[1]); under.px(125, y, MET[3])
    # a dented rust patch, and the maker's badge long gone (a pale rectangle where it was)
    under.rect(64, 56, 68, 58, RUST); under.px(65, 55, RUST); under.rect(108, 48, 113, 51, RED[1])
    # the exhaust stack and the air-cleaner stack, standing up off the hood
    under.rect(102, 16, 105, 43, MET[2]); under.rect(102, 16, 102, 43, MET[1]); under.rect(105, 16, 105, 43, MET[3])
    under.rect(101, 14, 106, 16, MET[3]); under.px(103, 13, OL)
    under.rect(88, 30, 91, 43, MET[1]); under.rect(87, 27, 92, 30, MET[2]); under.rect(87, 27, 92, 27, MET[0])
    # the steering column and the wheel, seen nearly edge-on, tilted toward the seat
    for i in range(10): under.px(66 - i * .55, 44 - i, MET[2])
    for i in range(-7, 8): under.px(60 + i * .9, 33 + i * .35, MET[3] if i > 3 else MET[1])
    # the seat: a pan on a spring post, and its tall back
    under.rect(28, 40, 46, 44, SEAT[1]); under.rect(28, 40, 46, 40, SEAT[0]); under.rect(44, 41, 46, 44, SEAT[2])
    under.rect(24, 24, 29, 42, SEAT[1]); under.rect(24, 24, 25, 42, SEAT[0]); under.rect(28, 24, 29, 42, SEAT[2])
    under.rect(34, 44, 37, 48, MET[2])
    # the drawbar and hitch at the back
    under.rect(2, 82, 14, 85, MET[2]); under.rect(2, 82, 14, 82, MET[1]); under.rect(2, 80, 5, 87, MET[3])
    # the near front wheel
    wheel_side(under, 106, G - 15, 15, 7)
    # (over the driver's legs) the near rear wheel, and its fender: a curved red shell over the top half
    wheel_side(over, 36, G - 31, 31, 18)
    for a in range(180, 361):
        t = math.radians(a)
        for rr in range(33, 38):
            x = 36 + math.cos(t) * rr; y = (G - 31) + math.sin(t) * rr
            if y > G - 31 - 2: continue
            k = 0 if rr == 37 and a < 300 else 1 if a < 250 else 2 if a < 320 else 3
            if rr == 33: k = 3
            over.px(x, y, RED[k])
    for c in (under, over): c.outline()
    return under.im, over.im

# ---------------------------------------------------------------- front view (facing the camera)
def front():
    W, H, G = 104, 108, 104
    under, over = C(W, H), C(W, H)
    shadow(under, 52, G, 50, 4)
    # the big rear wheels either side (behind the driver), and their fenders
    for x0 in (4, 82):
        tyre_edge(under, x0, 42, 18, 62)
        under.rect(x0 + 6, 70, x0 + 11, 76, RIM[2] if x0 < 50 else RIM[3])
    for x0 in (2, 80):
        for x in range(x0, x0 + 22):
            for y in range(36, 44):
                k = 0 if y == 36 else 1 if y < 39 else 2 if y < 42 else 3
                if x0 > 50 and k < 3: k += 1
                under.px(x, y, RED[k])
    # the rear axle housing between them
    under.rect(22, 70, 82, 78, MET[3]); under.rect(22, 70, 82, 71, MET[2])
    # the seat back and the seat
    under.rect(38, 26, 66, 42, SEAT[1]); under.rect(38, 26, 66, 27, SEAT[0]); under.rect(38, 26, 39, 42, SEAT[0]); under.rect(64, 28, 66, 42, SEAT[2])
    under.rect(36, 42, 68, 48, SEAT[2])
    # (over the driver) the hood coming toward you: its top in light, the grille face below, louvre shadows
    for y in range(50, 86):
        for x in range(36, 69):
            if y < 76:
                k = 1 if x < 42 else 2 if x < 62 else 3
                if y == 50: k = 0
                if 44 < x < 60 and y < 74 and (x - 44) % 5 == 0: k = 3
            else:
                k = 2 if x < 40 else 3 if x > 64 else 4
            over.px(x, y, RED[k])
    for y in range(77, 86, 2): over.rect(41, y, 63, y, MET[3])
    for x in range(41, 64, 4): over.rect(x, 77, x, 85, MET[2])
    over.rect(40, 76, 64, 76, MET[1])
    # headlamps, dead
    for cx in (34, 70):
        for y in range(56, 62):
            for x in range(cx - 3, cx + 4):
                if math.hypot(x - cx, (y - 59) * 1.2) <= 3.2: over.px(x, y, MET[1] if (x < cx and y < 59) else MET[3])
        over.px(cx - 1, 58, (170, 168, 140, 255))
    # the small front wheels, close together under the nose, on their axle
    over.rect(30, 90, 74, 93, MET[3]); over.rect(30, 90, 74, 90, MET[2])
    for x0 in (30, 64):
        tyre_edge(over, x0, 84, 10, 20)
    # the steering wheel, in front of the driver's chest, and the exhaust stack on the hood
    for t in range(0, 360, 6):
        a = math.radians(t)
        over.px(52 + math.cos(a) * 10, 44 + math.sin(a) * 3, MET[1] if math.sin(a) < 0 else MET[3])
    over.rect(51, 46, 53, 52, MET[2])
    over.rect(62, 18, 65, 50, MET[2]); over.rect(62, 18, 62, 50, MET[1]); over.rect(61, 16, 66, 18, MET[3])
    for c in (under, over): c.outline()
    return under.im, over.im

# ---------------------------------------------------------------- back view (driving away)
def back():
    W, H, G = 104, 108, 104
    under, over = C(W, H), C(W, H)
    shadow(under, 52, G, 50, 4)
    # (beyond the driver) the hood running away from you, the stacks, the far front wheels' tops, the steering wheel
    for y in range(22, 50):
        for x in range(38, 67):
            k = 1 if x < 44 else 2 if x < 60 else 3
            if y == 22: k = 0
            under.px(x, y, RED[k])
    under.rect(58, 6, 61, 30, MET[2]); under.rect(58, 6, 58, 30, MET[1]); under.rect(57, 4, 62, 6, MET[3])
    under.rect(43, 14, 46, 24, MET[1]); under.rect(42, 12, 47, 14, MET[2])
    for x0 in (30, 66):
        tyre_edge(under, x0, 40, 9, 14, dark=True)
    for t in range(0, 360, 6):
        a = math.radians(t)
        under.px(52 + math.cos(a) * 10, 46 + math.sin(a) * 3, MET[2])
    # (nearer than the driver) the seat back, the rear axle, the big rear wheels and fenders, the hitch, a tail lamp
    over.rect(38, 52, 66, 66, SEAT[1]); over.rect(38, 52, 66, 53, SEAT[0]); over.rect(38, 52, 39, 66, SEAT[0]); over.rect(64, 54, 66, 66, SEAT[2])
    over.rect(46, 66, 58, 72, MET[2])
    over.rect(22, 72, 82, 82, MET[3]); over.rect(22, 72, 82, 73, MET[2])
    for x0 in (2, 84):
        tyre_edge(over, x0, 40, 18, 64)
    for x0 in (0, 82):
        for x in range(x0, x0 + 22):
            for y in range(34, 42):
                k = 0 if y == 34 else 1 if y < 37 else 2 if y < 40 else 3
                if x0 > 50 and k < 3: k += 1
                over.px(x, y, RED[k])
    over.rect(44, 86, 60, 90, MET[2]); over.rect(44, 86, 60, 86, MET[1]); over.rect(50, 90, 54, 96, MET[3])
    over.rect(70, 58, 73, 61, (110, 26, 20, 255)); over.px(70, 58, (170, 60, 40, 255))
    for c in (under, over): c.outline()
    return under.im, over.im

def shadow(c, cx, cy, rx, ry):
    for y in range(int(cy - ry), int(cy + ry) + 1):
        for x in range(int(cx - rx), int(cx + rx) + 1):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1: c.px(x, y, (16, 20, 12, 110))

def main():
    views = {'E': side(), 'S': front(), 'N': back()}
    out = {}
    for d, (u, o) in views.items():
        for lay, im in (('u', u), ('o', o)):
            k = f'tractor_{d}{lay}'; im.save(os.path.join(OUT, k + '.png')); out[k] = im
    # previews: each view with both layers, 4x, on grass
    prev = Image.new('RGBA', (sum(u.width for u, o in views.values()) * 4 + 40, 108 * 4), (64, 92, 48, 255)); x = 0
    for d, (u, o) in views.items():
        comp = u.copy(); comp.alpha_composite(o); big = comp.resize((comp.width * 4, comp.height * 4), Image.NEAREST); prev.alpha_composite(big, (x, 0)); x += big.width + 20
    prev.save(os.path.join(OUT, 'tractor_x4.png'))
    one = Image.new('RGBA', (sum(u.width for u, o in views.values()) + 10, 108), (64, 92, 48, 255)); x = 0
    for d, (u, o) in views.items():
        comp = u.copy(); comp.alpha_composite(o); one.alpha_composite(comp, (x, 0)); x += comp.width + 5
    one.save(os.path.join(OUT, 'tractor_x1.png'))
    if '--install' in sys.argv:
        SP = sys.argv[sys.argv.index('--install') + 1]
        for root in [R, SP]:
            meta_p = os.path.join(root, 'spr', 'lpc', 'objects.json'); meta = json.load(open(meta_p))
            for k, im in out.items():
                im.save(os.path.join(root, 'spr', 'lpc', 'obj', k + '.png'))
                meta[k] = dict(src=f'spr/lpc/obj/{k}.png', fw=im.width, fh=im.height, ax=im.width / 2, ay=104, foot=[0, 0, 0, 0])
            json.dump(meta, open(meta_p, 'w'), indent=0); print('installed into', root)
    print('ok', list(out))

if __name__ == '__main__':
    main()
