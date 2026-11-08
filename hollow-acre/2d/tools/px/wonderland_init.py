"""Wonderland-horror pipeline startup: verifies the tools, builds the 32x32 wall block under the 1:1 orthographic stack,
computes and validates the hue-shifted palettes, demonstrates the dithered 1-2 px drop shadow, and lays out the regional
blueprint on a coordinate grid (1 character = 4x4 tiles). Run from hollow-acre/2d. Outputs go to tools/px/out/init/."""
import os, sys, json, math, colorsys, importlib
OUT = 'tools/px/out/init'; os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- 1. tool status
status = {}
for mod in ['PIL', 'numpy', 'matplotlib', 'imageio', 'sklearn', 'png']:
    try: m = importlib.import_module(mod); status[mod] = 'OK ' + str(getattr(m, '__version__', ''))
    except Exception as e: status[mod] = 'MISSING ' + str(e)
import numpy as np
from PIL import Image
sys.path.insert(0, 'tools/px')
from pipeline import upscale, save_gif
# a live round-trip through every library, not just an import
_a = np.zeros((4, 4, 4), np.uint8); _a[..., 3] = 255; Image.fromarray(_a).save(f'{OUT}/_probe.png')
status['roundtrip'] = 'OK' if np.array(Image.open(f'{OUT}/_probe.png')).shape == (4, 4, 4) else 'FAIL'

# ---------------------------------------------------------------- 3. palettes (hue-shifted: cold violet/blue shadows -> warm yellow/cyan lights)
RAMPS = {
 'mad_nature':      ['#120e1f', '#1e2333', '#233b3a', '#2f5537', '#4c7136', '#77913a', '#a8b146', '#dcd46e'],
 'masonry_stone':   ['#141220', '#26233a', '#3b3a52', '#545469', '#737482', '#96958f', '#bab399', '#e2d6b0'],
 'masonry_timber':  ['#170f1d', '#2a1726', '#43212b', '#5f2f2c', '#7e452f', '#9f6236', '#c2873f', '#e4b75a'],
 'underglow_ghost': ['#0e0b24', '#181a4a', '#173f6b', '#136a85', '#1b9a92', '#3fd1a0', '#8ef5b4', '#e6ffd2'],
 'underglow_toadstool': ['#170a24', '#33113f', '#561a59', '#7e2a6e', '#a8417d', '#d16a88', '#f09a96', '#ffd2a8'],
}
def hsv(h):
    r, g, b = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]; H, S, V = colorsys.rgb_to_hsv(r, g, b); return H * 360, S, V
def warmth(hdeg):   # +1 at yellow (55 deg), -1 at violet-blue (235 deg)
    return math.cos(math.radians(hdeg - 55))
pal_report = {}
for name, R in RAMPS.items():
    hs = [hsv(c) for c in R]; vals = [v for _, _, v in hs]; warm = [round(warmth(h), 2) for h, _, _ in hs]
    pal_report[name] = {'hex': R, 'hue_deg': [round(h) for h, _, _ in hs], 'value': [round(v, 2) for v in vals], 'warmth': warm,
                        'value_rises': all(b > a for a, b in zip(vals, vals[1:])),
                        'shadow_cold_highlight_warm': warm[0] < warm[-1] and warm[0] < 0.2}

# ---------------------------------------------------------------- 2. the 32x32 wall block (1:1 orthographic stack)
# A wall 1/4 tile thick and 3/4 tile tall: thickness 8 px seen from straight above = an 8 px top lip; height 24 px = a 24 px facade.
# Rows: 0 back-edge outline | 1-6 lip surface | 7 lip front bevel (warm light) | 8 lip-cast shadow (cold) | 9-30 masonry courses | 31 contact line.
S = RAMPS['masonry_stone']; NAT = RAMPS['mad_nature']
grid = [[0] * 32 for _ in range(32)]
for y in range(32):
    for x in range(32):
        if y == 0: v = 1                                        # back edge of the cap, cold
        elif y <= 6:                                            # the cap seen from above: lit, warm, a little worn
            v = 6 if (x + y) % 7 else 5
            if y == 1: v = 5
        elif y == 7: v = 7                                      # the front bevel catches the light
        elif y == 8: v = 2                                      # the lip's shadow on the face, cold and violet
        elif y == 31: v = 0                                     # contact line, darkest
        else:
            fy = y - 9; course = fy // 6; r = fy % 6; off = 5 if course % 2 else 0; bx = (x + off) % 11
            if r == 5 or bx == 10: v = 2                        # mortar, cool
            elif r == 0: v = 5                                  # each stone's lit top
            elif r == 4: v = 3                                  # each stone's cool underside
            else: v = 4 if x < 22 else 3                        # light from the upper left: faces go cooler to the right
        grid[y][x] = v
for (x, y) in [(3, 3), (4, 3), (4, 4), (12, 5), (25, 2), (26, 2), (2, 12), (2, 13), (30, 26)]:   # moss bleeding onto the stone
    grid[y][x] = 'N'
CH = {0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 'N': 'n'}
wall_txt = [''.join(CH[v] for v in row) for row in grid]
def rgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
wall = np.zeros((32, 32, 4), np.uint8)
for y in range(32):
    for x in range(32):
        v = grid[y][x]; wall[y, x, :3] = rgb(NAT[4] if v == 'N' else S[v]); wall[y, x, 3] = 255

# the cube rule, demonstrated: a 1x1x1 cube is a 32x32 top stacked on a 32x32 front (32x64); a 2-tile-tall wall keeps its 8 px lip
cube = np.zeros((64, 32, 4), np.uint8)
for y in range(64):
    for x in range(32):
        if y < 32: v = 6 if y else 1
        else: v = 4 if x < 22 else 3
        if y == 31: v = 7
        if y == 32: v = 2
        if y == 63: v = 0
        cube[y, x, :3] = rgb(S[v]); cube[y, x, 3] = 255
tall = np.zeros((72, 32, 4), np.uint8); tall[:8] = wall[:8]
for y in range(8, 72):
    src = 9 + ((y - 9) % 22) if 8 < y < 71 else (8 if y == 8 else 31); tall[y] = wall[src]

# ---------------------------------------------------------------- drop shadow: 2 px down, 2 px right, checkerboard dither, hard alpha
SHADOW = rgb(S[0])
demo = np.zeros((48, 48, 4), np.uint8)
blk = wall[::2, ::2]          # a 16x16 block standing in the demo
for y in range(16):
    for x in range(16):
        sy, sx = 18 + y + 2, 12 + x + 2
        if (sx + sy) % 2 == 0: demo[sy, sx, :3] = SHADOW; demo[sy, sx, 3] = 255
demo[18:34, 12:28] = blk
shadow_ok = set(np.unique(demo[..., 3]).tolist()) <= {0, 255}

# ---------------------------------------------------------------- 4. regional blueprint (1 char = 4x4 tiles; x -96..208, z -60..116)
X0, Z0, C, ROWS = -96, -60, 76, 44
M = [[' '] * C for _ in range(ROWS)]
def cell(x, z): return int((x - X0) // 4), int((z - Z0) // 4)
def put(x, z, ch, keep=()):
    c, r = cell(x, z)
    if 0 <= c < C and 0 <= r < ROWS and M[r][c] not in keep: M[r][c] = ch
def line(pts, ch, w=0, keep=()):
    for (ax, az), (bx, bz) in zip(pts, pts[1:]):
        n = int(max(abs(bx - ax), abs(bz - az)) / 1.5) + 1
        for i in range(n + 1):
            x = ax + (bx - ax) * i / n; z = az + (bz - az) * i / n
            for d in range(-w, w + 1): put(x + d * 4, z, ch, keep); put(x, z + d * 4, ch, keep)
def blob(cx, cz, rx, rz, ch, wob=.18, seed=1, keep=()):
    for r in range(ROWS):
        for c in range(C):
            x, z = X0 + c * 4 + 2, Z0 + r * 4 + 2; a = math.atan2(z - cz, x - cx)
            k = 1 + wob * math.sin(a * 3 + seed) + wob * .6 * math.sin(a * 7 + seed * 2)
            if ((x - cx) / (rx * k)) ** 2 + ((z - cz) / (rz * k)) ** 2 <= 1 and M[r][c] not in keep: M[r][c] = ch
# woods and the northern ridge
blob(-70, 10, 30, 60, 't', seed=2); blob(126, -16, 40, 26, 't', seed=3); blob(196, 70, 30, 40, 't', seed=5); blob(-10, -56, 120, 8, 't', .1, 7)
blob(100, 96, 30, 14, 't', seed=9); blob(150, 104, 50, 12, 't', seed=11)
for x in range(-60, 124, 4): put(x, -46 + 3 * math.sin(x / 13), '^')                     # the ridge: cliffs you climb with stairs
for x in range(124, 172, 4): put(x, -44, '^'); put(x, -18, '^')                         # the quarry's cut walls
# water: Black Lake, the Weeping River down to the mill and the Tithe fen, the farm creek, Thimble Brook
blob(186, 30, 20, 13, '~', .12, 4)
line([(176, 44), (162, 56), (146, 70), (120, 74), (100, 84), (84, 102), (64, 108), (44, 104), (30, 100), (8, 104), (-14, 102), (-26, 100)], '~')
line([(-19, -40), (-19, -22), (-24, -6), (-33, 4), (-35, 15), (-30, 40), (-25, 64), (-26, 92)], '~')
line([(92, -36), (90, -10), (88, 14), (90, 30), (94, 52), (100, 84)], '~')
blob(-26, 100, 10, 7, '~', .25, 6)
# thickets: organic bramble belts instead of walls; each has a gap where a road or path gets through
line([(14, -40), (16, -20), (13, 0), (16, 20), (12, 44), (6, 70)], 'T', keep=('~',))
line([(84, -44), (86, -20), (84, 4)], 'T', keep=('~',))
for a in range(0, 360, 12): put(-26 + 14 * math.cos(math.radians(a)), 100 + 10 * math.sin(math.radians(a)), 'T', keep=('~',))
# fields
for x in range(-12, 12, 4):
    for z in range(-2, 26, 4): put(x, z, '%')
for x in range(36, 60, 4):
    for z in range(62, 82, 4): put(x, z, 'y')
# roads: Route 9, the winding main street, the lanes, Mill Road, the Wickham road, the woods path, the quarry track
line([(-96, -6), (-40, -6), (0, -6), (16, -6)], '.')
line([(16, -6), (26, -4), (36, -1), (44, 2), (52, 6), (60, 4), (70, -2), (80, -4)], ':', keep=('~',))
line([(40, 0), (36, 18), (44, 30), (56, 28), (66, 16), (60, 4)], ':', keep=('~',))
line([(48, -4), (50, -22)], ':')
line([(20, 10), (16, 30), (12, 50), (14, 62), (22, 84), (30, 100)], '.', keep=('~',))
line([(66, 16), (80, 26), (96, 40), (112, 48), (124, 50)], '.', keep=('~',))
line([(80, -4), (96, -8), (108, 6), (132, 4), (166, 18)], '.', keep=('~',))
line([(120, -6), (134, -22), (147, -34)], '.')
line([(46, 32), (47, 60), (47, 72)], '.')
line([(-26, 64), (-26, 86)], '.', keep=('~',))
# bridges and crossings where paths meet water
for (x, z) in [(14, -6), (88, 18), (92, 42), (30, 100), (128, 72), (-25, 72)]: put(x, z, '=')
# settlements: buildings, the church on its hill, the graveyard, ponds
for (x, z) in [(-2, -10), (8, -12), (-14, -10), (24, -10), (28, -2), (34, -8), (40, -6), (46, -9), (56, -9), (64, -6), (72, -8), (30, 12), (26, 22), (40, 24), (52, 24),
               (62, 22), (70, 12), (64, 30), (34, 36), (100, 46), (108, 44), (116, 44), (124, 42), (134, 44), (142, 46), (104, 58), (114, 58), (126, 58), (136, 58),
               (30, 98), (-25, 70), (178, 4), (40, 74)]: put(x, z, '#')
put(50, -28, '+'); put(124, 36, '+')
for x in range(58, 72, 4):
    for z in range(-40, -30, 4): put(x, z, 'g')
put(49, 36, 'o'); put(4, 4, 'o')
for (x, z) in [(36, -40), (40, -40), (36, -36), (40, -36)]: put(x, z, 'H')
for (x, z) in [(112, -4), (118, 2), (114, 8), (106, -12), (124, -2)]: put(x, z, '*')
put(22, -22, 'X')
# labels (see the key)
LABELS = [('1', 0, -18), ('2', -80, -6), ('3', 48, 8), ('4', 50, -34), ('5', 124, 30), ('6', 118, -20), ('7', 147, -30), ('8', 186, 22),
          ('9', 47, 66), ('A', 30, 94), ('B', -26, 104), ('C', -25, 62), ('D', 96, -12), ('E', 108, 14), ('F', -10, -38)]
for ch, x, z in LABELS: put(x, z, ch)
ascii_map = [''.join(r) for r in M]
assert all(len(r) == C for r in ascii_map)

# ---------------------------------------------------------------- outputs
Image.fromarray(upscale(wall, 12)).save(f'{OUT}/wall32_x12.png')
Image.fromarray(upscale(np.concatenate([np.pad(cube, ((8, 0), (0, 4), (0, 0))), np.pad(tall, ((0, 0), (0, 0), (0, 0)))], axis=1), 8)).save(f'{OUT}/cube_and_tall_x8.png')
Image.fromarray(upscale(demo, 10)).save(f'{OUT}/shadow_demo_x10.png')
sw = np.zeros((len(RAMPS) * 18, 8 * 18 + 2, 4), np.uint8)
for i, (n, R) in enumerate(RAMPS.items()):
    for j, h in enumerate(R): sw[i * 18 + 1:i * 18 + 17, j * 18 + 1:j * 18 + 17, :3] = rgb(h); sw[i * 18 + 1:i * 18 + 17, j * 18 + 1:j * 18 + 17, 3] = 255
Image.fromarray(upscale(sw, 4)).save(f'{OUT}/palettes_x4.png')
open(f'{OUT}/blueprint.txt', 'w').write('\n'.join(ascii_map) + '\n')
json.dump({'tools': status, 'palettes': pal_report, 'wall_rows': wall_txt, 'shadow_hard_alpha': shadow_ok}, open(f'{OUT}/init_report.json', 'w'), indent=1)
print(json.dumps({'tools': status, 'shadow_hard_alpha': shadow_ok,
                  'palettes': {k: {kk: v[kk] for kk in ('hue_deg', 'value_rises', 'shadow_cold_highlight_warm')} for k, v in pal_report.items()}}, indent=1))
print('WALL'); print('\n'.join(wall_txt)); print('MAP'); print('\n'.join(ascii_map))
