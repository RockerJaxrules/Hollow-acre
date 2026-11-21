"""Hollow Acre building kit: every building in the valley is drawn from a spec through this one generator, so they
all share a style (3/4 view, light from the upper left, hue-shifted locked palettes, ordered dither, hard alpha, darkest-ramp
outlines) but no two are the same.

A spec says: width in tiles, depth in tiles, storeys, wall material and colour, roof type and material, trim, where the door and
windows go, and the extras: porch, chimneys, shutters, flower boxes, awning, sign, gutters, ivy, moss, wear, boarded windows.
Layers are drawn in the guide's order: form -> material -> wear -> life -> horror.
Output: <name>.png (day) and <name>_n.png (night: windows lit, one of them sometimes not empty), plus metadata for objects.json.
"""
import colorsys, math, random
import numpy as np
from PIL import Image
from pipeline import BAYER4

TILE = 32
OUTLINE_K = .55          # outline = darkest ramp step pulled further toward violet-black


def ramp(hexc, n=6, spread=.9, sat=1.0):
    """Hue-shifted ramp, darkest first: shadows lean violet/blue, lights lean warm yellow."""
    r, g, b = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]; h, s, v = colorsys.rgb_to_hsv(r, g, b); out = []
    for i in range(n):
        t = i / (n - 1) - .55; tgt = .72 if t < 0 else .13; d = ((tgt - h + .5) % 1) - .5; hh = (h + d * min(1, abs(t) * .5)) % 1
        ss = max(0, min(1, s * sat * (1 - t * .35))); vv = max(0, min(1, v * (1 + t * spread)))
        out.append(tuple(int(round(c * 255)) for c in colorsys.hsv_to_rgb(hh, ss, vv)))
    return out


def darker(c, k=OUTLINE_K):
    h, s, v = colorsys.rgb_to_hsv(*[x / 255 for x in c]); h = (h + (((.75 - h + .5) % 1) - .5) * .4) % 1
    return tuple(int(round(x * 255)) for x in colorsys.hsv_to_rgb(h, min(1, s * 1.1 + .1), v * k))


# ---------- the material library (base colours; ramps are built from these)
WALLS = {
    'white': '#d8d4c8', 'cream': '#dccca4', 'sage': '#9aac8a', 'blue': '#8aa2b8', 'mustard': '#c8a456', 'oxblood': '#8a3c34',
    'grey': '#9a9a98', 'green': '#5e7a5c', 'rose': '#c49088', 'teal': '#6a9496',
    'brick_red': '#9a4a38', 'brick_brown': '#7a5038', 'brick_yellow': '#c4a46c',
    'stone_grey': '#8c8a84', 'stone_honey': '#b49a6c', 'log': '#7a5638', 'plaster': '#d6ccb4'}
ROOFS = {'slate': '#4c5464', 'shingle_brown': '#6e5040', 'shingle_grey': '#5c5a58', 'shingle_red': '#8a4438',
         'tin_green': '#5a7458', 'tin_red': '#8e4a3a', 'tin_rust': '#7a5a46', 'thatch': '#a8884e', 'tile_red': '#a4523c'}
TRIMS = {'white': '#e8e4da', 'cream': '#e4d6b0', 'green': '#3e5a40', 'black': '#2e2c30', 'red': '#8a3a32', 'blue': '#3c4e68', 'brown': '#5c4030'}
DOORS = {'red': '#9a3a30', 'green': '#3e6a4c', 'blue': '#3e5878', 'black': '#2a2a30', 'oak': '#8a6040', 'yellow': '#c8a040', 'teal': '#3e7a7a'}
GLASS_DAY = ['#20283a', '#34445a', '#5a7088', '#9ab4c8']
GLASS_NIGHT = ['#5a3a1e', '#a8642a', '#e6a24a', '#f8dc8a']
CURTAINS = ['#a84a3c', '#d8c8a0', '#5a7a5a', '#8a6a9a', '#c8a050', '#4a6488']
STONE = '#8a867e'; GREEN_MOSS = '#5a7238'; IVY = '#3e6a34'; FLOWERS = ['#d84a5a', '#e8c848', '#f0ece0', '#c86ac0', '#e88a3a']
SIGN = '#6a4a30'


FONT = {  # 3x5 capitals and digits, rows top to bottom as bit strings
 'A':['010','101','111','101','101'],'B':['110','101','110','101','110'],'C':['011','100','100','100','011'],'D':['110','101','101','101','110'],
 'E':['111','100','110','100','111'],'F':['111','100','110','100','100'],'G':['011','100','101','101','011'],'H':['101','101','111','101','101'],
 'I':['111','010','010','010','111'],'J':['001','001','001','101','010'],'K':['101','101','110','101','101'],'L':['100','100','100','100','111'],
 'M':['101','111','111','101','101'],'N':['101','111','111','111','101'],'O':['010','101','101','101','010'],'P':['110','101','110','100','100'],
 'Q':['010','101','101','110','011'],'R':['110','101','110','101','101'],'S':['011','100','010','001','110'],'T':['111','010','010','010','010'],
 'U':['101','101','101','101','111'],'V':['101','101','101','101','010'],'W':['101','101','111','111','101'],'X':['101','101','010','101','101'],
 'Y':['101','101','010','010','010'],'Z':['111','001','010','100','111'],'&':['010','101','010','101','011'],"'":['010','010','000','000','000'],
 '0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['110','001','010','100','111'],'3':['110','001','010','001','110'],
 '4':['101','101','111','001','001'],'5':['111','100','110','001','110'],'6':['011','100','111','101','111'],'7':['111','001','010','010','010'],
 '8':['111','101','111','101','111'],'9':['111','101','111','001','110'],'.':['000','000','000','000','010'],' ':['000','000','000','000','000']}
def text_w(t): return len(t) * 4 - 1
def draw_text(cv, x, y, t, col, shadow=None):
    for ch in t.upper():
        g = FONT.get(ch, FONT[' '])
        for r, row in enumerate(g):
            for c_, bit in enumerate(row):
                if bit == '1':
                    if shadow: cv.p(x + c_ + 1, y + r + 1, shadow)
                    cv.p(x + c_, y + r, col)
        x += 4


class Canvas:
    def __init__(s, W, H, seed=0):
        s.W, s.H = W, H; s.a = np.zeros((H, W, 4), dtype=np.uint8); s.rng = random.Random(seed); s.used = set()
    def p(s, x, y, c):
        x, y = int(x), int(y)
        if 0 <= x < s.W and 0 <= y < s.H: s.a[y, x, :3] = c; s.a[y, x, 3] = 255; s.used.add(tuple(c))
    def get(s, x, y):
        x, y = int(x), int(y)
        return tuple(s.a[y, x, :3]) if 0 <= x < s.W and 0 <= y < s.H and s.a[y, x, 3] else None
    def rect(s, x0, y0, x1, y1, c):
        for y in range(int(y0), int(y1) + 1):
            for x in range(int(x0), int(x1) + 1): s.p(x, y, c)
    def hline(s, x0, x1, y, c):
        for x in range(int(x0), int(x1) + 1): s.p(x, y, c)
    def vline(s, x, y0, y1, c):
        for y in range(int(y0), int(y1) + 1): s.p(x, y, c)
    def dither(s, x, y, light, R, lo=0, hi=None):
        """Pick a ramp step for a continuous light value with the 4x4 Bayer matrix (texture-free shading)."""
        hi = len(R) - 1 if hi is None else hi; v = lo + max(0, min(1, light)) * (hi - lo); b = int(v); f = v - b
        return R[min(hi, b + (1 if f > BAYER4[int(y) % 4, int(x) % 4] else 0))]
    def shade_over(s, x0, y0, x1, y1, f, amount):
        """Darken what's already drawn by one ramp-ish step where an ordered-dither mask allows (eave shadow, grime)."""
        for y in range(int(y0), int(y1) + 1):
            for x in range(int(x0), int(x1) + 1):
                c = s.get(x, y)
                if c is None: continue
                k = f(x, y) * amount
                if k > BAYER4[y % 4, x % 4]: s.p(x, y, darker(c, .78))
    def image(s): return Image.fromarray(s.a, 'RGBA')


# ---------- wall materials
def wall_siding(cv, x0, y0, x1, y1, R, wear):
    rng = cv.rng
    for y in range(y0, y1 + 1):
        row = (y - y0) % 5; board = (y - y0) // 5
        tone = 3 if (math.sin(board * 91.7) * 43758.5) % 1 > .35 else 2
        for x in range(x0, x1 + 1):
            if row == 4: c = R[1]                                    # the shadow line under each board
            elif row == 0: c = R[4]                                  # the lit top edge of the board
            else: c = R[tone]
            cv.p(x, y, c)
        if row == 2 and rng.random() < .3 * wear:                    # paint wearing through on a board
            sx = rng.randint(x0 + 2, max(x0 + 3, x1 - 8)); cv.hline(sx, sx + rng.randint(2, 5), y, R[1])
    for b in range((y1 - y0) // 5 + 1):                              # board butt joints, staggered
        jx = x0 + 9 + (b * 37) % max(10, (x1 - x0 - 12))
        cv.vline(jx, y0 + b * 5 + 1, min(y1, y0 + b * 5 + 3), R[1])


def wall_brick(cv, x0, y0, x1, y1, R, wear, mortar):
    rng = cv.rng
    for y in range(y0, y1 + 1):
        course = (y - y0) // 4; r = (y - y0) % 4; off = 4 if course % 2 else 0
        for x in range(x0, x1 + 1):
            bx = (x - x0 + off) % 9
            if r == 3 or bx == 8: c = mortar[2] if (x + y) % 3 else mortar[1]
            else:
                bid = ((x - x0 + off) // 9) * 31 + course * 17; v = (math.sin(bid * 12.9898) * 43758.5453) % 1
                base = 2 if v < .45 else 3 if v < .85 else 1
                c = R[base + 1] if (r == 0 and bx < 7) else R[base] if bx < 7 or r < 2 else R[max(0, base - 1)]
            cv.p(x, y, c)
    for _ in range(int((x1 - x0) * (y1 - y0) / 900 * wear)):      # spalled, darker bricks
        bx = rng.randint(x0, x1 - 8); by = y0 + rng.randint(0, max(0, (y1 - y0) // 4 - 1)) * 4
        cv.rect(bx + 1, by, bx + 6, by + 2, R[1])


def wall_stone(cv, x0, y0, x1, y1, R, wear, mortar):
    rng = cv.rng; pts = []
    for _ in range(max(8, (x1 - x0) * (y1 - y0) // 30)):
        pts.append((rng.uniform(x0, x1), rng.uniform(y0, y1), rng.choice([1, 2, 2, 3, 3, 4])))
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            ds = sorted(((x - px) ** 2 + ((y - py) * 1.6) ** 2, i) for i, (px, py, _) in enumerate(pts))[:2]
            if math.sqrt(ds[1][0]) - math.sqrt(ds[0][0]) < 1.25: c = mortar[1]
            else:
                px, py, t = pts[ds[0][1]]; lit = .5 + ((px - x) + (py - y) * 1.2) / 14
                c = cv.dither(x, y, lit, R, max(0, t - 1), min(len(R) - 1, t + 1))
            cv.p(x, y, c)


def wall_log(cv, x0, y0, x1, y1, R, wear):
    for y in range(y0, y1 + 1):
        r = (y - y0) % 6
        for x in range(x0, x1 + 1):
            c = [R[1], R[3], R[4], R[3], R[2], R[0]][r]
            if r in (2, 3) and (x * 7 + y * 3) % 17 == 0: c = R[2]           # grain
            cv.p(x, y, c)
    for y in range(y0, y1 + 1, 6):                                          # log ends at the corners
        for ex in (x0 - 2, x1 + 2):
            for dy in range(5):
                for dx in range(-2, 3):
                    if dx * dx + (dy - 2) ** 2 <= 5: cv.p(ex + dx, y + dy, R[3] if dx * dx + (dy - 2) ** 2 < 2 else R[1])


def wall_timber(cv, x0, y0, x1, y1, R, wear, beam):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): cv.p(x, y, cv.dither(x, y, .62 - (y - y0) / (y1 - y0 + 1) * .15, R, 2, 4))
    for x in list(range(x0, x1 + 1, 14)) + [x1 - 2]:
        cv.rect(x, y0, x + 2, y1, beam[1]); cv.vline(x, y0, y1, beam[2])
    cv.rect(x0, (y0 + y1) // 2, x1, (y0 + y1) // 2 + 2, beam[1])
    for x in range(x0, x1 - 14, 28):                                        # braces
        for i in range(14):
            yy = (y0 + y1) // 2 - 2 - i * ((y1 - y0) // 2 - 4) / 14
            if yy > y0: cv.rect(x + 2 + i, yy, x + 3 + i, yy + 1, beam[1])


# ---------- roofs
def roof_texture(cv, x, y, y_top, y_eave, R, mat, row_seed, lit=1.0):
    """Colour of one roof pixel: courses of slates/shingles/ribs/thatch, lit in tiers from the ridge down, dithered only between tiers."""
    t = (y - y_top) / max(1, y_eave - y_top); light = (.86 - t * .5) * lit
    if mat in ('slate', 'shingle_brown', 'shingle_grey', 'shingle_red', 'tile_red'):
        ch = 4 if mat == 'slate' else 5; course = (y - y_top) // ch; r = (y - y_top) % ch
        cw = 9 if mat == 'slate' else 12
        off = int((math.sin(course * 7.31 + row_seed) * 43758.5453) % 1 * cw)    # each course offset differently, like real roofing
        cell = (x + off) // cw; bx = (x + off) % cw
        v = (math.sin((cell * 31 + course * 17 + row_seed) * 12.9898) * 43758.5453) % 1
        if r == ch - 1: return R[0] if light < .55 else R[1]                      # the shadow line under each course
        if bx == 0 and r < ch - 2: return R[1]                                   # short joints at the top of a course only
        if mat != 'slate' and r == ch - 2 and bx in (cw // 2, cw // 2 + 1) and v > .6: return R[1]   # the odd cracked tab
        lv = light + (v - .5) * .26 + (.12 if r == 0 else 0) - (.06 if r == ch - 2 else 0)
        if v > .93: lv -= .25                                                    # a few dark replacement tiles
        return cv.dither(x, y, lv, R, 1, 5)
    if mat.startswith('tin'):
        bx = x % 7
        if bx == 0: return R[min(5, 3 + (1 if light > .5 else 0))]
        if bx == 1: return R[2]
        if bx == 6: return R[1]
        rust = mat == 'tin_rust' and (math.sin((x // 7) * 7.1 + y * .9) * 43758.5) % 1 < .08
        return R[1] if rust else cv.dither(x, y, light, R, 1, 4)
    if mat == 'thatch':
        v = (math.sin((x * 3.1 + (y // 2) * 7.7) * 12.9898) * 43758.5453) % 1
        return cv.dither(x, y, light + (v - .5) * .5, R, 0, 5)
    return R[3]


def draw_roof(cv, spec, x0, x1, y_eave, R, mat, kind, depth_px, out, T=None, WR=None, wall_mat='white'):
    """The roof over the wall. Side-gable, hip, gambrel (seen from the long side), front gable, front gambrel, flat parapet.
    Every eave gets a fascia board in the trim colour and a dark line under it. Returns the highest roof y (for chimneys)."""
    W = x1 - x0; rh = int(depth_px); seed = spec.get('seed', 0); over = 5; T = T or R
    if kind in ('gable', 'hip', 'gambrel'):
        y_top = y_eave - rh; hipw = int(min(W * .28, rh * .95)) if kind == 'hip' else 0
        for y in range(y_top, y_eave - 2):
            t = (y - y_top) / max(1, rh); inset = int((1 - t) * hipw) if kind == 'hip' else 0
            xa, xb = x0 - over + inset, x1 + over - inset
            gb = y_top + int(rh * .42)
            for x in range(xa, xb + 1):
                if kind == 'hip' and x < xa + int(t * hipw) + 2: c = roof_texture(cv, x, y, y_top, y_eave, R, mat, seed, 1.12)        # lit hip end
                elif kind == 'hip' and x > xb - int(t * hipw) - 2: c = roof_texture(cv, x, y, y_top, y_eave, R, mat, seed, .55)      # shaded hip end
                elif kind == 'gambrel' and y < gb: c = roof_texture(cv, x, y, y_top, gb + rh // 2, R, mat, seed, 1.15)              # the shallow upper slope, catching light
                else: c = roof_texture(cv, x, y, y_top, y_eave, R, mat, seed)
                cv.p(x, y, c)
            cv.p(xa, y, out); cv.p(xb, y, out)
            if kind == 'hip': cv.p(xa + int(t * hipw) + 2, y, R[4]); cv.p(xb - int(t * hipw) - 2, y, R[0])   # the hip ridges
        ra, rb = x0 - over + hipw, x1 + over - hipw
        cv.hline(ra, rb, y_top - 1, out); cv.hline(ra, rb, y_top, R[5]); cv.hline(ra, rb, y_top + 1, R[4])   # ridge cap
        if kind == 'gambrel': cv.hline(x0 - over, x1 + over, y_top + int(rh * .42), R[1]); cv.hline(x0 - over, x1 + over, y_top + int(rh * .42) + 1, R[4])
        if kind == 'gable':                                             # barge boards at both ends
            for y in range(y_top, y_eave - 2):
                cv.p(x0 - over, y, out); cv.p(x0 - over + 1, y, T[4]); cv.p(x0 - over + 2, y, T[2])
                cv.p(x1 + over, y, out); cv.p(x1 + over - 1, y, T[3]); cv.p(x1 + over - 2, y, T[1])
        # the fascia along the eave and its shadow on the wall below
        cv.hline(x0 - over, x1 + over, y_eave - 2, T[5]); cv.hline(x0 - over, x1 + over, y_eave - 1, T[3]); cv.hline(x0 - over, x1 + over, y_eave, T[1]); cv.hline(x0 - over, x1 + over, y_eave + 1, out)
        cv.p(x0 - over, y_eave - 2, out); cv.p(x1 + over, y_eave - 2, out); cv.p(x0 - over, y_eave - 1, out); cv.p(x1 + over, y_eave - 1, out)
        return y_top
    if kind in ('frontgable', 'frontgambrel'):
        cx = (x0 + x1) / 2; half = W / 2 + over; ph = int(min(rh * .78, W * .4)); y_ap = y_eave - ph; back = int(rh * .42)
        def edge(x):                                                   # the gable's top edge at column x
            u = abs(x - cx) / half
            if kind == 'frontgable': return y_ap + u * ph
            return y_ap + (u * .9 * ph * .45 / .55 if u < .55 else ph * .45 * .9 + (u - .55) / .45 * ph * .55 * 1.1)
        # the roof planes running back from the gable edges (seen from above): left lit, right shaded
        for x in range(int(cx - half), int(cx + half) + 1):
            e = int(edge(x)); left = x < cx
            for y in range(e - back, e + 1):
                c = roof_texture(cv, x if left else int(2 * cx - x), y, e - back, e + back * .6, R, mat, seed, 1.08 if left else .55)
                cv.p(x, y, c)
            cv.p(x, e - back - 1, out)
        cv.vline(int(cx), y_ap - back, y_ap, R[5]); cv.vline(int(cx) + 1, y_ap - back, y_ap, R[0])         # the ridge going back
        # the gable wall itself, in the wall's material, with a vent or loft door
        for x in range(int(cx - half) + 3, int(cx + half) - 2):
            e = int(edge(x)) + 3
            for y in range(e, y_eave + 1):
                if WR:
                    row = (y - y_eave) % 5; c = WR[1] if row == 4 else WR[4] if row == 0 else WR[3 if x < cx + half * .7 else 2]
                    if wall_mat.startswith(('brick', 'stone')): c = WR[2 + ((x // 9 + y // 4) % 2)] if (y % 4) and (x % 9) else WR[1]
                    cv.p(x, y, c)
        # barge boards along both slopes
        for x in range(int(cx - half), int(cx + half) + 1):
            e = int(edge(x))
            for k, c in enumerate((out, T[5] if x < cx else T[3], T[4] if x < cx else T[2], T[2] if x < cx else T[1], out)): cv.p(x, e + k - 1, c)
        if kind == 'frontgable':
            vy = int(y_ap + ph * .45); cv.rect(int(cx) - 4, vy, int(cx) + 4, vy + 7, T[3])
            for yy in range(vy + 1, vy + 7, 2): cv.hline(int(cx) - 3, int(cx) + 3, yy, T[1])
            cv.hline(int(cx) - 5, int(cx) + 5, vy - 1, out); cv.hline(int(cx) - 5, int(cx) + 5, vy + 8, out); cv.vline(int(cx) - 5, vy, vy + 7, out); cv.vline(int(cx) + 5, vy, vy + 7, out)
        else:                                                          # the hayloft door and the hoist beam
            ly = int(y_ap + ph * .3); cv.rect(int(cx) - 8, ly, int(cx) + 8, ly + 16, T[1]); cv.rect(int(cx) - 7, ly + 1, int(cx) + 7, ly + 15, (60, 40, 30))
            for i in range(15): cv.p(int(cx) - 7 + i, ly + 1 + i, T[4]); cv.p(int(cx) + 7 - i, ly + 1 + i, T[4])
            cv.rect(int(cx) - 2, y_ap - 2, int(cx) + 2, y_ap + 1, (90, 70, 50)); cv.vline(int(cx), y_ap + 2, ly - 2, (60, 56, 52))
        cv.hline(int(cx - half), int(cx + half), y_eave + 1, out)
        return y_ap - back
    if kind == 'flat':                                                  # a parapet with coping, for shop fronts
        y_top = y_eave - 12
        for y in range(y_top + 2, y_eave):
            for x in range(x0 - 1, x1 + 2): cv.p(x, y, (WR or R)[2 if (y - y_top) % 4 else 1])
        cv.hline(x0 - 3, x1 + 3, y_top, T[5]); cv.hline(x0 - 3, x1 + 3, y_top + 1, T[3]); cv.hline(x0 - 3, x1 + 3, y_top - 1, out); cv.hline(x0 - 3, x1 + 3, y_top + 2, out)
        cv.hline(x0 - 1, x1 + 1, y_eave, out)
        return y_top
    return y_eave


def draw_window(cv, x, y, w, h, trim, glass, night, curtain, shutters, box, boarded, broken, rng, out, sh_col):
    T = trim
    if shutters:
        for sx in (x - 5, x + w + 1):
            cv.rect(sx, y, sx + 3, y + h, sh_col[2]); cv.vline(sx, y, y + h, sh_col[3]); cv.vline(sx + 3, y, y + h, sh_col[1])
            for yy in range(y + 1, y + h, 2): cv.hline(sx + 1, sx + 2, yy, sh_col[1])
            cv.rect(sx - 1, y - 1, sx + 4, y - 1, out); cv.rect(sx - 1, y + h + 1, sx + 4, y + h + 1, out)
    cv.rect(x - 2, y - 3, x + w + 1, y + h + 1, T[4]); cv.hline(x - 3, x + w + 2, y - 4, out); cv.vline(x - 3, y - 4, y + h + 2, out); cv.vline(x + w + 2, y - 4, y + h + 2, out)
    cv.hline(x - 2, x + w + 1, y - 3, T[5]); cv.vline(x + w + 1, y - 2, y + h + 1, T[2]); cv.hline(x - 2, x + w + 1, y - 1, T[3])
    G = glass
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            if night: c = cv.dither(xx, yy, .85 - (yy - y) / h * .35, G, 1, 3)
            else: c = G[1] if (xx - x) + (yy - y) < w * .7 else G[0]
            cv.p(xx, yy, c)
    if not night:                                                       # the sky in the glass
        cv.p(x + 1, y + 1, G[3]); cv.p(x + 2, y + 1, G[2]); cv.p(x + 1, y + 2, G[2]); cv.p(x + w - 3, y + h - 3, G[2])
    if curtain:
        for i in range(min(4, h - 2)): cv.hline(x, x + 2 - i // 2, y + i, curtain[3 if night else 2]); cv.hline(x + w - 3 + i // 2, x + w - 1, y + i, curtain[3 if night else 2])
        cv.hline(x, x + w - 1, y, curtain[1])
    cv.vline(x + w // 2, y, y + h - 1, T[3]); cv.hline(x, x + w - 1, y + h // 2, T[3])   # muntins
    if broken and not boarded:
        for i in range(4): cv.p(x + 2 + i, y + 2 + i % 2 + i, out)
        cv.p(x + 5, y + 1, G[0]); cv.p(x + w - 2, y + h - 2, G[0])
    if boarded:
        for i, yy in enumerate((y + 1, y + h // 2 + 1)):
            cv.rect(x - 2, yy + i, x + w + 2, yy + i + 2, (122, 92, 60)); cv.hline(x - 2, x + w + 2, yy + i, (150, 116, 78)); cv.hline(x - 2, x + w + 2, yy + i + 2, (78, 56, 38))
            cv.p(x - 1, yy + i + 1, (40, 36, 40)); cv.p(x + w + 1, yy + i + 1, (40, 36, 40))
    cv.rect(x - 2, y + h + 1, x + w + 2, y + h + 2, T[4]); cv.hline(x - 2, x + w + 2, y + h + 3, T[1])   # the sill and its shadow
    if box:
        cv.rect(x - 1, y + h + 3, x + w + 1, y + h + 6, (110, 74, 46)); cv.hline(x - 1, x + w + 1, y + h + 3, (140, 98, 62)); cv.hline(x - 1, x + w + 1, y + h + 6, (70, 46, 30))
        for i in range(x - 1, x + w + 2, 2):
            cv.p(i, y + h + 2, (70, 120, 56)); cv.p(i, y + h + 1, rng.choice([(70, 120, 56)] + [tuple(int(box[k:k + 2], 16) for k in (1, 3, 5)) for box in FLOWERS]))


def draw_door(cv, x, y_ground, w, h, col, trim, out, kind='panel', night=False, step=True):
    D = col; y = y_ground - h
    cv.rect(x - 2, y - 3, x + w + 1, y_ground, trim[4]); cv.hline(x - 2, x + w + 1, y - 3, trim[5]); cv.vline(x - 3, y - 4, y_ground, out); cv.vline(x + w + 2, y - 4, y_ground, out); cv.hline(x - 3, x + w + 2, y - 4, out)
    for yy in range(y, y_ground + 1):
        for xx in range(x, x + w):
            cv.p(xx, yy, cv.dither(xx, yy, .62 - (xx - x) / w * .3, D, 1, 3))
    if kind == 'panel':
        for py0, py1 in ((y + 2, y + h // 2 - 2), (y + h // 2 + 1, y_ground - 3)):
            for px0, px1 in ((x + 2, x + w // 2 - 2), (x + w // 2 + 1, x + w - 3)):
                cv.rect(px0, py0, px1, py1, D[2]); cv.hline(px0, px1, py0, D[1]); cv.vline(px0, py0, py1, D[1]); cv.hline(px0, px1, py1, D[3]); cv.vline(px1, py0, py1, D[3])
    elif kind == 'glass':
        G = [tuple(int(c[k:k + 2], 16) for k in (1, 3, 5)) for c in (GLASS_NIGHT if night else GLASS_DAY)]
        cv.rect(x + 2, y + 2, x + w - 3, y + h // 2 + 2, G[2 if night else 1]); cv.p(x + 3, y + 3, G[3])
    elif kind == 'double':
        cv.vline(x + w // 2, y, y_ground, out)
        for xx in (x + 2, x + w // 2 + 2): cv.rect(xx, y + 3, xx + w // 2 - 5, y_ground - 3, D[2])
    elif kind == 'barn':
        cv.vline(x + w // 2, y, y_ground, out)
        for half in ((x, x + w // 2), (x + w // 2, x + w)):
            for i in range(h):
                cv.p(half[0] + int(i * (w / 2) / h), y + i, D[4]); cv.p(half[1] - 1 - int(i * (w / 2) / h), y + i, D[4])
            cv.rect(half[0], y, half[1] - 1, y + 1, D[4]); cv.rect(half[0], y_ground - 1, half[1] - 1, y_ground, D[4])
    cv.p(x + w - 4, y + h // 2 + 1, (214, 180, 90)); cv.p(x + w - 4, y + h // 2 + 2, (120, 90, 40))   # the knob
    if step:
        cv.rect(x - 4, y_ground + 1, x + w + 3, y_ground + 3, (150, 146, 136)); cv.hline(x - 4, x + w + 3, y_ground + 1, (180, 176, 166)); cv.hline(x - 5, x + w + 4, y_ground + 4, out)


def build(spec):
    """Render one building. Returns (day Image, night Image, meta)."""
    rng = random.Random(spec.get('seed', 1)); wt = spec['w']; dt = spec.get('d', 3.3); storeys = spec.get('storeys', 1)
    wall_h = int(spec.get('wall_h', 70 if storeys == 1 else 118)); depth_px = int(dt * TILE * .74)
    W = int(wt * TILE); padx = 14; roofk = spec.get('roof', 'gable'); chim = spec.get('chimneys', [])
    extra_top = 40 if chim or spec.get('steeple') else 14
    if spec.get('steeple'): extra_top = int(spec['steeple'].get('h', 90))
    if spec.get('tower'): extra_top = spec['tower'].get('above', 30) + spec['tower'].get('spire', 64) + 14
    rh = depth_px if roofk not in ('frontgable', 'frontgambrel') else int(min(depth_px * .78, W * .4)) + int(depth_px * .42)
    H = extra_top + rh + wall_h + 12; FW = W + padx * 2
    out_imgs = []
    for night in (False, True):
        cv = Canvas(FW, H, spec.get('seed', 1)); cv.rng = random.Random(spec.get('seed', 1))
        WR = ramp(WALLS[spec['wall']]); RR = ramp(ROOFS[spec['roof_mat']], 6); TR = ramp(TRIMS[spec.get('trim', 'white')], 6, .6)
        DR = ramp(DOORS[spec.get('door_col', 'oak')], 5); SR = ramp(STONE, 5, .7); MR = ramp('#b4aa98', 4, .5)
        SHR = ramp(TRIMS[spec.get('shutter_col', spec.get('trim_dark', 'green'))], 5)
        out = darker(WR[0]); x0 = padx; x1 = padx + W - 1; y_ground = H - 6; y_wall_top = y_ground - wall_h
        # --- form + material: the wall
        mat = spec['wall']
        if mat.startswith('brick'): wall_brick(cv, x0, y_wall_top, x1, y_ground - 5, WR, spec.get('wear', .4), MR)
        elif mat.startswith('stone'): wall_stone(cv, x0, y_wall_top, x1, y_ground - 5, WR, spec.get('wear', .4), MR)
        elif mat == 'log': wall_log(cv, x0, y_wall_top, x1, y_ground - 5, WR, spec.get('wear', .4))
        elif mat == 'plaster': wall_timber(cv, x0, y_wall_top, x1, y_ground - 5, WR, spec.get('wear', .4), ramp('#4a3424', 4))
        else: wall_siding(cv, x0, y_wall_top, x1, y_ground - 5, WR, spec.get('wear', .4))
        if storeys > 1 and not mat.startswith(('brick', 'stone')):     # the band between floors
            yb = y_wall_top + (wall_h - 5) // 2; cv.rect(x0, yb, x1, yb + 2, TR[4]); cv.hline(x0, x1, yb + 3, TR[1])
        # corner boards and the foundation
        if not mat.startswith(('brick', 'stone')) and mat != 'log':
            for cx in (x0, x1 - 2): cv.rect(cx, y_wall_top, cx + 2, y_ground - 5, TR[4]); cv.vline(cx + 2, y_wall_top, y_ground - 5, TR[2])
        for y in range(y_ground - 4, y_ground + 1):
            for x in range(x0 - 1, x1 + 2): cv.p(x, y, cv.dither(x, y, .55 - (y - y_ground + 4) * .08 + ((x // 7 + y // 3) % 3) * .1, SR, 0, 4))
        cv.hline(x0 - 1, x1 + 1, y_ground - 4, SR[4]); cv.hline(x0 - 2, x1 + 2, y_ground + 1, out); cv.vline(x0 - 1, y_wall_top, y_ground, out); cv.vline(x1 + 1, y_wall_top, y_ground, out)
        # --- openings: windows and the door
        door = spec.get('door', {}); dw = door.get('w', 18); dh = door.get('h', 34)
        dx = int(x0 + W / 2 + door.get('dx', 0) * TILE - dw / 2)
        wins = spec.get('windows')
        if wins is None:
            n = max(2, int(wt // 2)); wins = []
            slots = [x0 + int((i + .5) * W / n) for i in range(n)]
            for s in slots:
                if abs(s - (dx + dw / 2)) < dw + 6: continue
                wins.append({'x': (s - x0) / TILE, 'row': 0})
                if storeys > 1: wins.append({'x': (s - x0) / TILE, 'row': 1})
            if storeys > 1: wins.append({'x': (dx + dw / 2 - x0) / TILE, 'row': 1})
        GD = [tuple(int(c[k:k + 2], 16) for k in (1, 3, 5)) for c in GLASS_DAY]; GN = [tuple(int(c[k:k + 2], 16) for k in (1, 3, 5)) for c in GLASS_NIGHT]
        curt = [ramp(c, 4) for c in CURTAINS]; lit_any = False
        for i, wspec in enumerate(wins):
            ww, wh = wspec.get('w', 14), wspec.get('h', 18 if storeys == 1 else 17)
            wx = int(x0 + wspec['x'] * TILE - ww / 2)
            wy = (y_ground - 5 - wh - 13) if wspec.get('row', 0) == 0 else (y_wall_top + 10)
            if storeys == 1: wy = y_wall_top + 14
            lit = night and not wspec.get('dark') and (rng.random() < .8)
            draw_window(cv, wx, wy, ww, wh, TR, GN if lit else GD, lit, curt[(i + spec.get('seed', 0)) % len(curt)] if wspec.get('curtain', True) else None,
                        spec.get('shutters', False), spec.get('boxes', False) and wspec.get('row', 0) == 0, wspec.get('boarded'), wspec.get('broken'), rng, out, SHR)
            if lit and spec.get('watcher') == i:                         # somebody standing in it, facing out
                for yy in range(wy + 3, wy + wh):
                    for xx in range(wx + 3, wx + ww - 3):
                        if (xx - (wx + ww / 2)) ** 2 / 4 + (yy - (wy + 6)) ** 2 / 6 < 1 or (yy > wy + 8 and abs(xx - (wx + ww / 2)) < 3): cv.p(xx, yy, (30, 20, 22))
            lit_any |= lit
        if not spec.get('tower'): draw_door(cv, dx, y_ground - 5, dw, dh, DR, TR, out, door.get('kind', 'panel'), night, True)
        # porch roof / awning over the door or across the front
        porch = spec.get('porch')
        if porch:
            px0 = x0 + 2 if porch.get('full') else dx - 10; px1 = x1 - 2 if porch.get('full') else dx + dw + 9; py = y_ground - 5 - dh - 8
            for y in range(py - 6, py + 1):
                for x in range(px0 - 2, px1 + 3): cv.p(x, y, roof_texture(cv, x, y, py - 6, py, RR, spec['roof_mat'], 7))
            cv.hline(px0 - 3, px1 + 3, py + 1, out); cv.hline(px0 - 2, px1 + 2, py - 7, RR[4])
            cv.shade_over(px0, py + 2, px1, py + 7, lambda x, y: 1 - (y - py - 2) / 6, 1.0)
            for postx in ([px0, px1] + ([x for x in range(px0 + 24, px1 - 10, 24)] if porch.get('full') else [])):
                cv.rect(postx, py + 2, postx + 1, y_ground - 4, TR[4]); cv.vline(postx + 2, py + 2, y_ground - 4, TR[1])
            if porch.get('rail'):
                for x in range(px0, px1):
                    if x < dx - 4 or x > dx + dw + 3:
                        cv.p(x, y_ground - 15, TR[4]); cv.p(x, y_ground - 14, TR[2])
                        if x % 3 == 0: cv.vline(x, y_ground - 13, y_ground - 5, TR[3])
            cv.rect(px0 - 1, y_ground - 4, px1 + 1, y_ground - 2, (128, 96, 66)); cv.hline(px0 - 1, px1 + 1, y_ground - 4, (156, 120, 84))
        awn = spec.get('awning')
        if awn:
            ax0 = x0 + 4; ax1 = x1 - 4; ay = y_wall_top + 6; A1 = ramp(awn[0], 4); A2 = ramp(awn[1], 4)
            for y in range(ay, ay + 9):
                for x in range(ax0, ax1 + 1):
                    stripe = ((x - ax0) // 6) % 2; R_ = A1 if stripe else A2; cv.p(x, y, R_[3 if y < ay + 2 else 2])
            for x in range(ax0, ax1 + 1, 6):
                for k in range(3): cv.p(x + k, ay + 9 + (1 if k == 1 else 0), (A1 if ((x - ax0) // 6) % 2 else A2)[1])
            cv.hline(ax0, ax1, ay - 1, out); cv.shade_over(ax0, ay + 10, ax1, ay + 14, lambda x, y: 1 - (y - ay - 10) / 5, 1)
        sign = spec.get('sign')
        if sign:
            sw = text_w(sign) + 10; sx0 = int(x0 + W / 2 - sw / 2); sy = y_wall_top + (1 if awn else 4)
            SR2 = ramp(SIGN, 5)
            cv.rect(sx0, sy, sx0 + sw, sy + 10, SR2[2]); cv.hline(sx0, sx0 + sw, sy, SR2[4]); cv.hline(sx0, sx0 + sw, sy + 1, SR2[3]); cv.hline(sx0, sx0 + sw, sy + 10, SR2[0])
            cv.vline(sx0, sy, sy + 10, out); cv.vline(sx0 + sw, sy, sy + 10, out); cv.hline(sx0, sx0 + sw, sy - 1, out); cv.hline(sx0, sx0 + sw, sy + 11, out)
            draw_text(cv, sx0 + 6, sy + 3, sign, (238, 220, 172), SR2[0])
            for bx in (sx0 + 3, sx0 + sw - 3): cv.p(bx, sy + 5, SR2[0])
        # --- the roof (over the wall), its eave shadow on the wall, gutters
        y_ridge = draw_roof(cv, spec, x0, x1, y_wall_top, RR, spec['roof_mat'], roofk, rh, out, TR, WR, mat)
        cv.shade_over(x0, y_wall_top + 2, x1, y_wall_top + 8, lambda x, y: 1 - (y - y_wall_top - 2) / 7, 1.0)
        if spec.get('gutter', True) and roofk in ('gable', 'hip', 'gambrel'):
            cv.hline(x0 - 3, x1 + 3, y_wall_top + 2, (110, 112, 118)); cv.hline(x0 - 3, x1 + 3, y_wall_top + 3, (64, 64, 72))
            gx = x1 - 1 if spec.get('seed', 0) % 2 else x0 + 1; cv.vline(gx, y_wall_top + 2, y_ground - 3, (96, 98, 104)); cv.vline(gx + 1, y_wall_top + 2, y_ground - 3, (60, 60, 68))
            cv.hline(gx - 1, gx + 2, y_ground - 3, (60, 60, 68))
        # dormers on a big roof
        for dm in spec.get('dormers', []):
            dcx = int(x0 + dm * TILE); dy = y_ridge + rh // 2 - 6
            cv.rect(dcx - 7, dy, dcx + 7, dy + 12, WR[3]); cv.hline(dcx - 7, dcx + 7, dy + 12, out)
            for i in range(9): cv.hline(dcx - 9 + i, dcx + 9 - i, dy - 1 - i, RR[2 if i < 7 else 4])
            cv.p(dcx, dy - 10, out)
            draw_window(cv, dcx - 4, dy + 2, 8, 8, TR, GN if night else GD, night, None, False, False, False, False, rng, out, SHR)
        # chimneys rising through the roof
        for ch in chim:
            ccx = int(x0 + ch.get('x', .2) * W); ctop = y_ridge - ch.get('h', 16); cbot = y_ridge + int(rh * ch.get('down', .5))
            CR = ramp(WALLS.get(ch.get('mat', 'brick_red'), '#9a4a38'))
            for y in range(ctop, cbot):
                for x in range(ccx - 5, ccx + 6):
                    course = (y - ctop) // 3; bx = (x + (2 if course % 2 else 0)) % 5
                    c = CR[1] if (y - ctop) % 3 == 2 or bx == 4 else (CR[3] if x < ccx else CR[2])
                    cv.p(x, y, c)
            cv.rect(ccx - 7, ctop - 3, ccx + 7, ctop - 1, SR[3]); cv.hline(ccx - 7, ccx + 7, ctop - 3, SR[4]); cv.hline(ccx - 8, ccx + 8, ctop - 4, out)
            cv.vline(ccx - 6, ctop - 1, cbot - 1, out); cv.vline(ccx + 6, ctop - 1, cbot - 1, out)
            cv.rect(ccx - 3, ctop - 4, ccx + 2, ctop - 4, (24, 20, 22))
            cv.shade_over(ccx + 6, ctop + 2, ccx + 14, cbot, lambda x, y: .9, 1)   # its shadow on the roof
        tw_ = spec.get('tower')
        if tw_:
            tcx = int(x0 + W / 2); tw2 = tw_.get('w', 38) // 2; ttop = y_ridge - tw_.get('above', 30); TWR = WR
            for y in range(ttop, y_ground - 4):
                for x in range(tcx - tw2, tcx + tw2 + 1):
                    row = (y - ttop) % 5; c = TWR[1] if row == 4 else TWR[4] if row == 0 else TWR[3 if x < tcx + tw2 * .4 else 2]
                    if mat.startswith(('brick', 'stone')): c = TWR[2 + ((x // 9 + y // 4) % 2)] if (y % 4) and (x % 9) else TWR[1]
                    cv.p(x, y, c)
            cv.vline(tcx - tw2 - 1, ttop, y_ground - 4, out); cv.vline(tcx + tw2 + 1, ttop, y_ground - 4, out)
            for cx_ in (tcx - tw2, tcx + tw2 - 1): cv.rect(cx_, ttop, cx_ + 1, y_ground - 5, TR[4])
            by = ttop + 8; cv.rect(tcx - 7, by, tcx + 7, by + 14, (28, 22, 26))                                   # the belfry and its louvres
            for yy in range(by + 2, by + 14, 3): cv.hline(tcx - 6, tcx + 6, yy, TR[2])
            cv.rect(tcx - 2, by + 4, tcx + 2, by + 9, (196, 160, 72)) if spec.get('bell', True) else None
            cv.hline(tcx - 8, tcx + 8, by - 1, out); cv.hline(tcx - 8, tcx + 8, by + 15, TR[4]); cv.hline(tcx - 8, tcx + 8, by + 16, out)
            ow = by + 26; cv.rect(tcx - 5, ow, tcx + 5, ow + 12, (28, 34, 50)); cv.vline(tcx, ow, ow + 12, TR[3]); cv.hline(tcx - 5, ow + 6, tcx + 5, TR[3]) if False else cv.hline(tcx - 5, tcx + 5, ow + 6, TR[3])
            cv.hline(tcx - 6, tcx + 6, ow - 1, out)
            for i in range(5): cv.hline(tcx - 5 + i, tcx + 5 - i, ow - 2 - i, TR[4])                          # pointed arch over the window
            draw_door(cv, tcx - 9, y_ground - 5, 18, 34, DR, TR, out, 'double', night, True)
            sp = tw_.get('spire', 64)
            for i in range(sp):
                hw = (tw2 + 3) * (i / sp)
                for x in range(int(tcx - hw), int(tcx + hw) + 1): cv.p(x, ttop - sp + i, RR[4] if x < tcx - hw * .2 else RR[2] if x < tcx + hw * .3 else RR[0])
                cv.p(int(tcx - hw) - 1, ttop - sp + i, out); cv.p(int(tcx + hw) + 1, ttop - sp + i, out)
            cv.hline(tcx - tw2 - 4, tcx + tw2 + 4, ttop, TR[5]); cv.hline(tcx - tw2 - 4, tcx + tw2 + 4, ttop + 1, out)
            cv.vline(tcx, ttop - sp - 9, ttop - sp, (210, 176, 84)); cv.hline(tcx - 3, tcx + 3, ttop - sp - 6, (210, 176, 84))
        # a steeple / bell tower
        st = spec.get('steeple')
        if st:
            scx = int(x0 + st.get('x', .5) * W); tw = st.get('w', 22); tb = y_ridge + rh // 2; tt = tb - st.get('tower', 44)
            for y in range(tt, tb):
                for x in range(scx - tw // 2, scx + tw // 2 + 1): cv.p(x, y, cv.dither(x, y, .7 - (x - scx + tw / 2) / tw * .4, WR, 1, 4))
            cv.vline(scx - tw // 2 - 1, tt, tb, out); cv.vline(scx + tw // 2 + 1, tt, tb, out)
            cv.rect(scx - 4, tt + 6, scx + 4, tt + 16, (30, 24, 28)); cv.p(scx, tt + 8, (200, 168, 80)); cv.rect(scx - 1, tt + 10, scx + 1, tt + 13, (200, 168, 80))   # the bell
            sp = st.get('spire', 46)
            for i in range(sp):
                hw = (tw // 2 + 2) * (i / sp)
                for x in range(int(scx - hw), int(scx + hw) + 1): cv.p(x, tt - sp + i, RR[3] if x < scx else RR[1])
            cv.vline(scx, tt - sp - 8, tt - sp, (200, 168, 80)); cv.hline(scx - 2, scx + 2, tt - sp - 5, (200, 168, 80))
        # --- wear: moss and stains, cracks; life: ivy, a lamp by the door; horror: scratches, a red ribbon
        if spec.get('moss'):
            for _ in range(int(W / 14 * spec['moss'])):
                mx = rng.randint(x0, x1); my = rng.randint(y_ridge + 2, y_wall_top - 2); MR2 = ramp(GREEN_MOSS, 4)
                for k in range(rng.randint(3, 9)):
                    px = mx + rng.randint(-3, 3); py = my + rng.randint(-1, 1)
                    if cv.get(px, py): cv.p(px, py, MR2[1 + (k % 3)])
        for _ in range(int(spec.get('wear', .4) * len(wins) * .8)):          # rain stains under the sills
            if not wins: break
            wv = rng.choice(wins); sx = int(x0 + wv['x'] * TILE + rng.randint(-3, 3))
            cv.shade_over(sx, y_wall_top + 20, sx + 1, y_wall_top + 20 + rng.randint(6, 16), lambda x, y: .7, 1)
        if spec.get('ivy'):
            IR = ramp(IVY, 5); side = spec['ivy']
            bx = x0 + 2 if side == 'left' else x1 - 14
            for _ in range(220):
                px = bx + rng.randint(0, 14) + int(rng.random() * 3); py = y_ground - 5 - int(abs(rng.gauss(0, wall_h * .45)))
                if cv.get(px, py): cv.p(px, py, IR[rng.choice([1, 2, 2, 3, 4])])
        if spec.get('scratches'):
            for k in range(4):
                for i in range(7): cv.p(dx - 6 + k * 2 + i // 3, y_ground - 26 + i * 2, out)
        if spec.get('ribbon'):
            cv.rect(dx + dw + 3, y_ground - 26, dx + dw + 5, y_ground - 24, (150, 20, 20)); cv.vline(dx + dw + 4, y_ground - 23, y_ground - 17, (120, 14, 14))
        if spec.get('lamp'):
            lx = dx + dw + 7; ly = y_ground - 5 - dh + 2
            cv.rect(lx, ly, lx + 3, ly + 5, (248, 212, 120) if night else (60, 58, 62)); cv.hline(lx - 1, lx + 4, ly - 1, (40, 38, 42)); cv.hline(lx, lx + 3, ly + 6, (40, 38, 42))
        out_imgs.append(cv.image())
    meta = {'fw': FW, 'fh': H, 'ax': FW / 2, 'ay': H - 3, 'foot': [-round(wt / 2, 2), -round(dt, 2), round(wt / 2, 2), 0], 'px': 1,
            'door': [round(spec.get('door', {}).get('dx', 0), 2)]}
    return out_imgs[0], out_imgs[1], meta
