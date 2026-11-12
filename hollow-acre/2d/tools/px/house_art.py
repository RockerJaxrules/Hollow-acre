"""#252 house expansion art: a long dining table (built from the installed table: one top, two legs, a run of place settings
and a pair of candles in the middle), a runner rug laid east-west, and the attic's roof slopes (a gable end: the two
slopes of the roof cut the top corners of the back wall, boarded, with the last rafter along each slope and a ridge
beam). Run: python3 house_art.py [--install]"""
import sys, os, json
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
R = os.path.abspath(os.path.join(HERE, '..', '..'))
OBJ = os.path.join(R, 'spr', 'lpc', 'obj')
OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)

def longtable():
    t = Image.open(os.path.join(OBJ, 'in_table.png')).convert('RGBA'); W, H = t.size
    L, Rr = 20, 21; mid0, mid1 = 31, 35            # a clean run of planks between the candle and the bowl
    n = 124 - L - Rr
    out = Image.new('RGBA', (L + n + Rr, H), (0, 0, 0, 0))
    out.paste(t.crop((0, 0, L, H)), (0, 0))
    # the middle: long planks (each row continued from one clean column), with a joint here and there, never on a beat
    src = t.load(); op = out.load()
    rows = [y for y in range(H)]
    for y in rows:
        for k in range(n):
            op[L + k, y] = src[33, y]
    seams = {}
    import random
    rnd = random.Random(7)
    for y in range(2, 38):
        if src[33, y][3] and src[33, y] != src[33, y - 1]: seams[y] = True
    for y0 in range(3, 36, 5):
        x = L + rnd.randint(4, 18)
        while x < L + n - 3:
            for yy in range(y0, min(y0 + 4, 37)):
                r, g, b, a = op[x, yy]
                if a: op[x, yy] = (max(0, r - 34), max(0, g - 28), max(0, b - 20), a)
            x += rnd.randint(19, 37)
    out.paste(t.crop((W - Rr, 0, W, H)), (L + n, 0))
    # the place settings along the front edge: plates copied from the table's own plate, spaced unevenly like a laid table
    plate = t.crop((7, 27, 18, 34))
    for x in (28, 50, 80):
        out.alpha_composite(plate, (x, 27))
    # two candles at the middle (the table's own candle, moved), a little apart
    cand = t.crop((24, 6, 31, 26))
    for x in (54, 64):
        out.alpha_composite(cand, (x, 6))
    # a stain: wine, one ragged ring, off centre
    px = out.load()
    for (x, y) in [(86, 18), (87, 18), (88, 19), (88, 20), (87, 21), (85, 21), (84, 20), (84, 19), (89, 21)]:
        r, g, b, a = px[x, y]
        if a: px[x, y] = (max(0, r - 38), max(0, g - 44), max(0, b - 30), a)
    return out

def runner_h():
    r = Image.open(os.path.join(OBJ, 'in_runner.png')).convert('RGBA')
    return r.rotate(90, expand=True)

def rafters(w=288, h=96):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); p = im.load()
    BD = [(26, 18, 12, 255), (36, 25, 16, 255), (46, 32, 20, 255)]       # roof boards, in the dark under the eaves
    BEAM = [(30, 20, 12, 255), (88, 60, 36, 255), (112, 78, 46, 255), (64, 43, 26, 255)]   # rafter: outline, face, lit edge, shade
    cx = w // 2; eave = 58; ridge = 4
    def slope_y(x):   # the underside of the roof at x
        d = abs(x - cx) / cx
        return ridge + (eave - ridge) * d
    for x in range(w):
        yb = int(slope_y(x))
        for y in range(0, yb):
            # boards run along the slope: banding by the distance from the slope line
            band = int((yb - y) / 4)
            c = BD[(band + (x // 37)) % 3] if (yb - y) % 4 else BD[0]
            p[x, y] = c
        # the last rafter along the slope, 5 px deep, lit on its lower edge
        for k in range(6):
            y = yb + k - 1
            if 0 <= y < h:
                p[x, y] = BEAM[0] if k in (0, 5) else BEAM[2] if k == 4 else BEAM[1] if k < 3 else BEAM[3]
    # the ridge beam end, square, where the two slopes meet
    for y in range(0, 12):
        for x in range(cx - 6, cx + 6):
            p[x, y] = BEAM[0] if x in (cx - 6, cx + 5) or y in (0, 11) else BEAM[1] if y < 8 else BEAM[3]
    for x in range(cx - 5, cx + 5): p[x, 10] = BEAM[2]
    # cobwebs where each rafter meets the wall
    import math
    for sx, sgn in ((2, 1), (w - 3, -1)):
        y0 = int(slope_y(sx)) + 5
        for i in range(5):
            a = math.radians(10 + i * 18)
            for r in range(3, 15):
                x = int(sx + sgn * r * math.cos(a)); y = int(y0 + r * math.sin(a))
                if 0 <= x < w and 0 <= y < h and (r % 3 or i % 2): p[x, y] = (150, 150, 140, 120)
        for r in (6, 11):
            for i in range(30):
                a = math.radians(10 + i * 2.5); x = int(sx + sgn * r * math.cos(a)); y = int(y0 + r * math.sin(a))
                if 0 <= x < w and 0 <= y < h: p[x, y] = (150, 150, 140, 90)
    return im

def placeset():
    # a place laid for someone: a pale plate, a cup, a folded napkin and a spoon, raised so it sits on a table top
    im = Image.new('RGBA', (18, 34), (0, 0, 0, 0)); p = im.load()
    def P(x, y, c):
        if 0 <= x < 18 and 0 <= y < 34: p[x, y] = c
    OUT, RIM, FACE, HI = (60, 50, 40, 255), (184, 176, 160, 255), (234, 228, 214, 255), (250, 248, 240, 255)
    for y in range(4, 10):
        for x in range(1, 12):
            u = (x - 6) / 5.5; v = (y - 6.5) / 3
            d = u * u + v * v
            if d <= 1.05: P(x, y, OUT if d > .8 else RIM if d > .45 else FACE)
    for x in range(4, 8): P(x, 5, HI)
    for y in range(2, 8):   # the cup, to the right
        for x in range(12, 16): P(x, y, OUT if x in (12, 15) or y in (2, 7) else FACE)
    P(16, 4, OUT); P(16, 5, OUT); P(13, 3, (120, 70, 40, 255)); P(14, 3, (120, 70, 40, 255))
    for x in range(2, 7): P(x, 10, (200, 186, 160, 255)); P(x, 11, (168, 150, 120, 255))   # the napkin
    for y in range(3, 10): P(0, y, (170, 170, 176, 255))   # a spoon
    return im
ART = {'in_longtable': longtable, 'in_runner_h': runner_h, 'in_rafters': rafters, 'in_placeset': placeset}
if __name__ == '__main__':
    for k, f in ART.items():
        im = f(); im.save(os.path.join(OUT, k + '.png'))
        big = im.resize((im.width * 4, im.height * 4), Image.NEAREST); bg = Image.new('RGBA', big.size, (70, 60, 50, 255)); bg.alpha_composite(big); bg.save(os.path.join(OUT, k + '_x4.png'))
        print(k, im.size)
    if '--install' in sys.argv:
        SP = sys.argv[sys.argv.index('--install') + 1] if len(sys.argv) > sys.argv.index('--install') + 1 else None
        for root in [R] + ([SP] if SP else []):
            meta_p = os.path.join(root, 'spr', 'lpc', 'objects.json'); meta = json.load(open(meta_p))
            for k in ART:
                im = Image.open(os.path.join(OUT, k + '.png')); im.save(os.path.join(root, 'spr', 'lpc', 'obj', k + '.png'))
                meta[k] = dict(src=f'spr/lpc/obj/{k}.png', fw=im.width, fh=im.height, ax=im.width / 2, ay=im.height - 3, foot=[0, 0, 0, 0])
            json.dump(meta, open(meta_p, 'w'), indent=0); print('installed into', root)
