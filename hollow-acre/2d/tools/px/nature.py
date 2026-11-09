"""Every nature sprite in Hollow Acre, made the approved way: a 3D blockout scene (blockout.py, 30-degree camera)
and the hand finish (finish.py), then built with grid.py. Nothing here comes from outside art.

    python3 nature.py                 # render and finish every sprite into blockouts/gen/ and nature/gen/
    python3 nature.py maple_red oak   # only the names that contain one of these words
    python3 nature.py --install       # also copy the PNGs into the game (old files backed up) and update the meta
    HA_BUILD=/path/to/build/copy python3 nature.py --install    # and into the build copy as well

A sprite is a recipe: a builder (broadleaf, pine, bush, rock, stump, dead) with a shape template, a palette and a
target height. Shape variants come from a seed (jitter) and a mirror; colour variants are palette swaps.
"""
import sys, os, json, math, random, subprocess, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.abspath(os.path.join(HERE, '..', '..'))
GEN = os.path.join(HERE, 'blockouts', 'gen'); OUT = os.path.join(HERE, 'nature', 'gen')
os.makedirs(GEN, exist_ok=True); os.makedirs(OUT, exist_ok=True)
SHADOW = '#32212599'

# ---------------------------------------------------------------- palettes (dark -> light; shades sink to plum/blue)
LEAF = {
    'orange': (['#3a1530', '#6e2433', '#a23c2e', '#c05a34', '#dc8a4a', '#e6a65e'], ['#2c1022', '#5a1e2c']),
    'red':    (['#2e0f26', '#5a1a2e', '#86232f', '#ad3631', '#cc5a3c', '#dc8058'], ['#240a1e', '#4c1428']),
    'gold':   (['#3a2228', '#6a3e2e', '#9a682e', '#c4973a', '#dcbc52', '#e8d27a'], ['#2a1820', '#583424']),
    'green':  (['#14202a', '#203a32', '#2e5636', '#4a763c', '#6e9a48', '#92b65e'], ['#0e1820', '#1c3028']),
    'russet': (['#2e1626', '#582830', '#843e2e', '#a65c30', '#c48444', '#d8a45c'], ['#22101e', '#4a2028']),
    'willow': (['#1e2228', '#34402e', '#56643a', '#7e8a40', '#a4ac52', '#c4c470'], ['#161a20', '#2c3428']),
    'pine':   (['#0c1820', '#142a2a', '#1e4034', '#2c5a3c', '#447446', '#5e8c50'], ['#08121a', '#122426']),
    'larch':  (['#24122a', '#43242e', '#6a3c2e', '#8e5a30', '#ae7a3a', '#c69a52'], ['#1a0c1c', '#361c26']),
    'holly':  (['#0e1a22', '#16302c', '#1e4632', '#2c5e38', '#3e7440', '#58904c'], ['#0a141c', '#142a26']),
    'juniper': (['#141c2a', '#1e3036', '#2a4642', '#3c5e4e', '#567a5e', '#74967a'], ['#10161e', '#1c2a30']),
    'sumac':  (['#2c0e22', '#561428', '#821e2a', '#aa302c', '#c84c34', '#da7048'], ['#200a1a', '#461024']),
    'stone':  (['#1c1a24', '#34303c', '#524a56', '#746a70', '#968a88', '#b4a89e'], ['#16141c', '#2c2832']),
}
BARK = {'brown': ['#2a1c26', '#4a3230', '#6e4e3c', '#957258'], 'grey': ['#221e26', '#3e3a40', '#625a5c', '#8a807a'],
        'birch': ['#3a3440', '#6e6a72', '#aaa4a6', '#d6d0c6'], 'pine': ['#24161e', '#432a26', '#664232', '#8a5e44']}
GRAIN = ['#5a3a2c', '#86603e', '#a8804e', '#c4a066']
FRUIT = {'apple': ['#5a1020', '#a82a2a', '#e0645a'], 'holly': ['#5a0e1a', '#b0202a', '#e85a50'],
         'elder': ['#140c1e', '#2e1a3a', '#5a3a6a'], 'juniper': ['#28324a', '#4a5a7a', '#8a9ab8'],
         'sumac': ['#3a0a18', '#7a1424', '#b42a30']}

# ---------------------------------------------------------------- shape templates (world units = pixels)
MAPLE = [(-4, 92, -14, 22), (22, 82, -8, 20), (-26, 78, -4, 19), (12, 71, 10, 21), (-16, 67, 12, 18), (30, 65, 2, 15),
         (-34, 65, 0, 13)]
OAK = [(x * 1.25, y * .9, z, r * 1.05) for x, y, z, r in MAPLE] + [(46, 62, -6, 14), (-48, 64, -8, 13), (0, 70, 16, 16)]
APPLE = [(0, 74, -8, 20), (18, 66, 0, 17), (-18, 66, 0, 17), (8, 55, 10, 16), (-10, 54, 10, 15), (0, 84, 4, 13)]
BIRCH = [(0, 128, -4, 12), (-8, 115, 2, 13), (9, 106, -2, 12), (-7, 96, 6, 12), (7, 88, 4, 11), (-9, 80, 0, 10), (5, 74, 8, 9)]
WILLOW_TOP = [(0, 96, -8, 24), (-26, 90, 0, 20), (26, 90, 0, 20), (0, 84, 12, 20)]
WILLOW_HANG = [(-42, 62, -4), (42, 62, -4), (-32, 58, 12), (32, 58, 12), (-14, 54, 20), (14, 54, 20), (0, 56, 22),
               (-38, 66, -16), (38, 66, -16)]
BUSH = [(0, 13, -2, 13), (-11, 10, 3, 10), (11, 10, 3, 10), (2, 8, 8, 9)]


def jit(tpl, seed, amt=3, ramt=2, mirror=False):
    R = random.Random(seed); out = []
    for t in tpl:
        x, y, z, r = t[0], t[1], t[2], t[3]
        out.append(((-x if mirror else x) + R.uniform(-amt, amt), y + R.uniform(-amt, amt), z + R.uniform(-amt, amt),
                    r + R.uniform(-ramt, ramt)))
    return out


def leafmat(): return {'chars': '12345', 'ambient': .14, 'shade': .5, 'hi': '6', 'hi_at': .86}


def broadleaf(bundles, s=1.0, trunk=(7, 46), fork=True, lumps=(2.0, 1.0)):
    sh = [{'type': 'cylinder', 'c': [0, 0, 0], 'r': trunk[0] * s, 'h': trunk[1] * s, 'mat': 'bark', 'flare': 2 * s}]
    if fork:
        sh += [{'type': 'branch', 'a': [0, trunk[1] * .74 * s, 0], 'b': [-17 * s, (trunk[1] + 16) * s, 4 * s], 'r0': trunk[0] * .78 * s, 'r1': 2.5 * s, 'mat': 'bark'},
               {'type': 'branch', 'a': [s, trunk[1] * .82 * s, 0], 'b': [19 * s, (trunk[1] + 20) * s, 2 * s], 'r0': trunk[0] * .7 * s, 'r1': 2.5 * s, 'mat': 'bark'}]
    rr = trunk[0] * s
    sh += [{'type': 'branch', 'a': [-rr * .4, 8 * s, 0], 'b': [-rr * 1.6, 0, 3 * s], 'r0': rr * .64, 'r1': rr * .3, 'mat': 'bark', 'bias': -.14},
           {'type': 'branch', 'a': [rr * .4, 8 * s, 0], 'b': [rr * 1.6, 0, 4 * s], 'r0': rr * .64, 'r1': rr * .3, 'mat': 'bark', 'bias': -.14},
           {'type': 'branch', 'a': [0, 7 * s, rr * .4], 'b': [s, 0, rr * 1.3], 'r0': rr * .57, 'r1': rr * .28, 'mat': 'bark', 'bias': -.1}]
    for x, y, z, r in bundles:
        sh.append({'type': 'sphere', 'c': [x * s, y * s, z * s], 'r': r * s, 'mat': 'leaf', 'lumps': lumps[0], 'lumpfreq': .42,
                   'lumps2': lumps[1], 'lumpfreq2': 1.0})
    return sh, {'leaf': leafmat(), 'bark': {'chars': 'WVUT', 'ambient': .32, 'shade': .45}}


def willow(s=1.0, seed=0):
    sh, mats = broadleaf(jit(WILLOW_TOP, seed), s, trunk=(9, 60), fork=True)
    R = random.Random(seed)
    for x, y, z in WILLOW_HANG:   # hanging curtains of leaves
        sh.append({'type': 'ellipsoid', 'c': [x * s, y * s, z * s], 'rr': [8 * s, (22 + R.uniform(-3, 4)) * s, 8 * s], 'mat': 'leaf',
                   'lumps': 1.4, 'lumpfreq': .7, 'lumps2': .9, 'lumpfreq2': 1.3, 'stepdown': .8})
    return sh, mats


def birch(s=1.0, seed=0, mirror=False):
    sh = [{'type': 'cylinder', 'c': [0, 0, 0], 'r': 4.5 * s, 'h': 118 * s, 'mat': 'bark', 'flare': 1.5 * s},
          {'type': 'branch', 'a': [0, 70 * s, 0], 'b': [-12 * s, 92 * s, 4 * s], 'r0': 2.6 * s, 'r1': 1.4 * s, 'mat': 'bark'},
          {'type': 'branch', 'a': [0, 78 * s, 0], 'b': [12 * s, 100 * s, 2 * s], 'r0': 2.4 * s, 'r1': 1.4 * s, 'mat': 'bark'}]
    for x, y, z, r in jit(BIRCH, seed, 2, 1.5, mirror):
        sh.append({'type': 'sphere', 'c': [x * s, y * s, z * s], 'r': r * s, 'mat': 'leaf', 'lumps': 1.6, 'lumpfreq': .5,
                   'lumps2': 1.0, 'lumpfreq2': 1.1})
    return sh, {'leaf': leafmat(), 'bark': {'chars': 'WVUT', 'ambient': .45, 'shade': .35}}


def pine(tiers, s=1.0, seed=0, trunk=12):
    R = random.Random(seed)
    sh = [{'type': 'cylinder', 'c': [0, 0, 0], 'r': 4.5 * s, 'h': (trunk + 10) * s, 'mat': 'bark', 'flare': 2 * s}]
    for r, y, h in tiers:
        cx, cz = R.uniform(-1.5, 1.5) * s, R.uniform(-1, 1) * s
        sh.append({'type': 'cone', 'c': [cx, y * s, cz], 'r': r * s, 'h': h * s, 'mat': 'leaf',
                   'lumps': 1.8, 'lumpfreq': .7, 'lumps2': 1.0, 'lumpfreq2': 1.3, 'stepdown': .7, 'seed': R.random() * 9})
        # drooping branch tips round the hem: they step the silhouette out at every tier (a pine, not a cone)
        n = int(r / 3.2) + 4; a0 = R.random() * 6.3
        for k in range(n):
            a = a0 + k * 6.283 / n + R.uniform(-.2, .2); rr_ = r * R.uniform(.92, 1.04) * s
            sh.append({'type': 'ellipsoid', 'c': [cx + math.sin(a) * rr_, (y - 1.5) * s, cz + math.cos(a) * rr_],
                       'rr': [max(3, r * .16) * s, 2.6 * s, max(3, r * .16) * s], 'mat': 'leaf', 'lumps': .6, 'lumpfreq': 1.0, 'stepdown': .8})
    m = leafmat(); m['ambient'] = .06; m['shade'] = .85   # each skirt shades the one below: the tiers read
    return sh, {'leaf': m, 'bark': {'chars': 'WVUT', 'ambient': .3, 'shade': .5}}


def bush(tpl, s=1.0, seed=0, mirror=False, rr=None):
    sh = []
    for x, y, z, r in jit(tpl, seed, 1.5, 1.2, mirror):
        e = {'type': 'ellipsoid' if rr else 'sphere', 'c': [x * s, y * s, z * s], 'mat': 'leaf', 'lumps': 1.3, 'lumpfreq': .6,
             'lumps2': .8, 'lumpfreq2': 1.2, 'stepdown': .85}
        if rr: e['rr'] = [r * s * rr[0], r * s * rr[1], r * s * rr[2]]
        else: e['r'] = r * s
        sh.append(e)
    return sh, {'leaf': leafmat()}


def rock(parts, seed=0):
    sh = []
    R = random.Random(seed)
    for i, (x, y, z, a, b, c) in enumerate(parts):
        cuts = [[R.uniform(-.4, .4), 1, R.uniform(-.3, .5), R.uniform(.55, .7)]]            # a flat-ish top
        for k in range(5):                                                                  # side planes
            ang = k * 1.25 + R.uniform(-.3, .3)
            cuts.append([math.sin(ang), R.uniform(-.1, .5), math.cos(ang), R.uniform(.72, .86)])
        sh.append({'type': 'ellipsoid', 'c': [x, y, z], 'rr': [a, b, c], 'mat': 'leaf', 'cuts': cuts, 'lumps': .5, 'lumpfreq': .35,
                   'stepdown': .85, 'seed': seed + i})
    m = {'chars': '12345', 'ambient': .18, 'shade': .6, 'hi': '6', 'hi_at': .84}
    return sh, {'leaf': m}


def stump(r=9, h=8, s=1.0):
    sh = [{'type': 'cylinder', 'c': [0, 0, 0], 'r': r * s, 'h': h * s, 'mat': 'bark', 'flare': 3 * s, 'topmat': 'grain', 'top_at': .75}]
    sh += [{'type': 'branch', 'a': [-r * .5 * s, 4 * s, 0], 'b': [-r * 1.5 * s, 0, 3 * s], 'r0': r * .4 * s, 'r1': r * .18 * s, 'mat': 'bark', 'bias': -.1},
           {'type': 'branch', 'a': [r * .5 * s, 4 * s, 0], 'b': [r * 1.6 * s, 0, 2 * s], 'r0': r * .4 * s, 'r1': r * .18 * s, 'mat': 'bark', 'bias': -.1}]
    return sh, {'bark': {'chars': 'WVUT', 'ambient': .3, 'shade': .45}, 'grain': {'chars': 'PQRS', 'ambient': .35, 'shade': .3}}


def dead(s=1.0, seed=0, trunk=(8, 56), levels=3, spread=1.0, broken=False):
    R = random.Random(seed)
    sh = [{'type': 'cylinder', 'c': [0, 0, 0], 'r': trunk[0] * s, 'h': trunk[1] * s, 'mat': 'bark', 'flare': 3 * s}]

    def grow(a, ang, tilt, ln, r0, lv):
        dx = math.sin(ang) * math.sin(tilt); dz = math.cos(ang) * math.sin(tilt) * .5; dy = math.cos(tilt)
        b = [a[0] + dx * ln * s * spread, a[1] + dy * ln * s, a[2] + dz * ln * s]
        r1 = max(1.7, r0 * .62)
        sh.append({'type': 'branch', 'a': a, 'b': b, 'r0': r0 * s, 'r1': r1 * s, 'mat': 'bark'})
        if lv > 1:
            for k in range(2 + (R.random() < .4)):
                grow(b, ang + R.uniform(-1.0, 1.0), min(1.25, tilt + R.uniform(-.1, .45)), ln * R.uniform(.6, .78), r1, lv - 1)
    if broken:   # a snapped trunk: stubs of old limbs and splinters standing up from the break
        grow([0, trunk[1] * .55 * s, 0], -1.4, 1.1, 14, 3.4, 1); grow([0, trunk[1] * .78 * s, 0], 1.6, 1.0, 11, 3, 1)
        for k, (dx, hgt) in enumerate([(-3, 10), (0, 16), (3, 7), (1.5, 12)]):
            sh.append({'type': 'branch', 'a': [dx * s, trunk[1] * s - 2, 0], 'b': [dx * 1.3 * s, (trunk[1] + hgt) * s, R.uniform(-1, 1)], 'r0': 2.4 * s, 'r1': .6, 'mat': 'bark'})
    else:
        top = [0, trunk[1] * s, 0]
        for k in range(4):
            grow(top, -1.7 + k * 1.15 + R.uniform(-.25, .25), .45 + R.uniform(0, .4), 36 * R.uniform(.85, 1.1), trunk[0] * .72, levels)
    sh += [{'type': 'branch', 'a': [-trunk[0] * .4 * s, 8 * s, 0], 'b': [-trunk[0] * 1.6 * s, 0, 3 * s], 'r0': trunk[0] * .6 * s, 'r1': 2 * s, 'mat': 'bark', 'bias': -.12},
           {'type': 'branch', 'a': [trunk[0] * .4 * s, 8 * s, 0], 'b': [trunk[0] * 1.6 * s, 0, 4 * s], 'r0': trunk[0] * .6 * s, 'r1': 2 * s, 'mat': 'bark', 'bias': -.12}]
    return sh, {'bark': {'chars': 'WVUT', 'ambient': .3, 'shade': .4}}


# ---------------------------------------------------------------- the sprites (name -> recipe)
def T(tiers, k=1.0): return [(r * k, y * k, h * k) for r, y, h in tiers]
# steep tiers (height about 1.25 x radius): from a raised camera only steep tiers leave a step at every hem
PINE_A = [(32, 10, 40), (27, 28, 34), (22, 44, 28), (16, 58, 22), (10, 70, 18), (5, 80, 14)]
PINE_B = [(30, 9, 38), (27, 26, 34), (21, 42, 27), (17, 55, 22), (11, 67, 18), (6, 77, 14)]
SPRUCE = [(22, 10, 30), (19, 24, 27), (16, 37, 23), (13.5, 49, 20), (11, 60, 17), (8, 70, 14), (5.5, 79, 11), (3, 87, 9)]
SPRITES = {
    'maple_orange': dict(build=lambda: broadleaf(jit(MAPLE, 1), 1.22), leaf='orange', bark='brown', litter=True),
    'maple_red':    dict(build=lambda: broadleaf(jit(MAPLE, 2, mirror=True), 1.22), leaf='red', bark='brown', litter=True),
    'maple_gold':   dict(build=lambda: broadleaf(jit(MAPLE, 3), 1.2), leaf='gold', bark='brown', litter=True),
    'maple_green':  dict(build=lambda: broadleaf(jit(MAPLE, 4, mirror=True), 1.2), leaf='green', bark='brown', litter=False),
    'oak_green':    dict(build=lambda: broadleaf(jit(OAK, 5), 1.1, trunk=(9, 42)), leaf='green', bark='brown', litter=False),
    'oak_russet':   dict(build=lambda: broadleaf(jit(OAK, 6, mirror=True), 1.1, trunk=(9, 42)), leaf='russet', bark='brown', litter=True),
    'tree_green':   dict(build=lambda: broadleaf(jit(MAPLE, 7), .82), leaf='green', bark='brown', litter=False),
    'tree_orange':  dict(build=lambda: broadleaf(jit(MAPLE, 8, mirror=True), .84), leaf='orange', bark='brown', litter=True),
    'apple_tree':   dict(build=lambda: broadleaf(jit(APPLE, 9), 1.15, trunk=(6, 36)), leaf='green', bark='brown', fruit='apple'),
    'apple_gold':   dict(build=lambda: broadleaf(jit(APPLE, 10, mirror=True), 1.15, trunk=(6, 36)), leaf='gold', bark='brown', fruit='apple', litter=True),
    'birch_green':  dict(build=lambda: birch(1.05, 11), leaf='green', bark='birch', bark_style='birch'),
    'birch_gold':   dict(build=lambda: birch(1.05, 12, True), leaf='gold', bark='birch', bark_style='birch', litter=True),
    'willow':       dict(build=lambda: willow(1.2, 13), leaf='willow', bark='brown', litter=True),
    'deadoak':      dict(build=lambda: dead(1.05, 14, (9, 50), 3), bark='grey'),
    'deadtree':     dict(build=lambda: dead(.72, 15, (7, 44), 3, .9), bark='grey'),
    'snag':         dict(build=lambda: dead(1.0, 16, (7, 96), 1, broken=True), bark='grey'),
    'pine_0':       dict(build=lambda: pine(PINE_A, 1.05, 17), leaf='pine', bark='pine'),
    'pine_1':       dict(build=lambda: pine(PINE_B, 1.05, 18), leaf='pine', bark='pine'),
    'pine_o0':      dict(build=lambda: pine(PINE_A, 1.05, 19), leaf='larch', bark='pine', litter=True),
    'pine_o1':      dict(build=lambda: pine(PINE_B, 1.05, 20), leaf='larch', bark='pine', litter=True),
    'spruce_0':     dict(build=lambda: pine(SPRUCE, 1.4, 21), leaf='pine', bark='pine'),
    'spruce_1':     dict(build=lambda: pine(SPRUCE[1:], 1.2, 22), leaf='pine', bark='pine'),
    'bush_green':   dict(build=lambda: bush(BUSH, 1.3, 23), leaf='green'),
    'bush_gold':    dict(build=lambda: bush(BUSH, 1.3, 24, True), leaf='gold', litter=True),
    'bush_red':     dict(build=lambda: bush(BUSH, 1.3, 25), leaf='red', litter=True),
    'holly':        dict(build=lambda: bush(BUSH, 1.35, 26, True), leaf='holly', fruit='holly'),
    'juniper':      dict(build=lambda: bush(BUSH, 1.3, 27, rr=(1.5, .7, 1.1)), leaf='juniper', fruit='juniper'),
    'elder':        dict(build=lambda: bush(BUSH, 1.35, 28), leaf='green', fruit='elder'),
    'sumac':        dict(build=lambda: bush([(0, 20, -4, 12), (-13, 15, 2, 10), (12, 17, 1, 10), (-4, 30, -6, 9), (7, 27, -2, 8), (2, 10, 8, 9)], 1.2, 29, rr=(1, 1.2, 1)), leaf='sumac', fruit='sumac', litter=True),
    'rock_0':       dict(build=lambda: rock([(0, 4, 0, 12, 9, 9)], 30), stone=True),
    'rock_1':       dict(build=lambda: rock([(0, 5, 0, 15, 11, 12), (9, 3, 7, 7, 5, 6)], 31), stone=True),
    'rg_outcrop':   dict(build=lambda: rock([(0, 20, -6, 34, 26, 22), (-38, 10, 4, 20, 13, 16), (36, 9, 6, 22, 12, 16), (14, 5, 18, 12, 7, 10)], 32), stone=True),
    'stump':        dict(build=lambda: stump(13, 10), bark='brown', rings=True),
    'stump_maple':  dict(build=lambda: stump(9, 8), bark='brown', rings=True),
    'stump_oak':    dict(build=lambda: stump(10, 7), bark='brown', rings=True),
    'stump_pine':   dict(build=lambda: stump(8, 9), bark='pine', rings=True),
}


def make(name, rec):
    shapes, mats = rec['build']()
    # canvas big enough for anything, origin near the bottom; cropped after the build
    xs = [abs(sh.get('c', sh.get('b', [0]))[0]) + (sh.get('r') or max(sh.get('rr', [0])) or 0) for sh in shapes]
    ys = [(sh.get('c', sh.get('b', [0, 0]))[1]) + (sh.get('h', 0) if sh['type'] in ('cone', 'cylinder') else (sh.get('r') or max(sh.get('rr', [0]) or [0]) or 0)) for sh in shapes]
    Wd = int(2 * max(xs) + 70); Hd = int(max(ys) * .9 + 60)
    pal = {}
    if 'leaf' in mats:
        L, outl = LEAF['stone' if rec.get('stone') else rec['leaf']]
        pal.update({str(i + 1): c for i, c in enumerate(L)})
    else:
        outl = ['#1a1418', '#3a2c2c']
    if 'bark' in mats: pal.update(dict(zip('WVUT', BARK[rec['bark']])))
    if 'grain' in mats: pal.update(dict(zip('PQRS', GRAIN)))
    pal['s'] = SHADOW
    scene = {'size': [Wd, Hd], 'origin': [Wd // 2, Hd - 22], 'elev': 30, 'materials': mats, 'palette': pal, 'shapes': shapes,
             'gamma': 1.3, 'shadow_light': [-.13, 1, -.12]}
    if rec.get('stone'): scene['gamma'] = 1.15
    sp = os.path.join(GEN, name); json.dump(scene, open(sp + '.json', 'w'))
    fin = {'name': name, 'anchor': [Wd // 2, Hd - 22], 'leaf': '12345' if 'leaf' in mats else '', 'bark': 'WVUT' if 'bark' in mats else '',
           'palette': pal, 'outline': outl, 'tuft_odds': 4, 'min_cluster': 8 if Hd > 80 else 4}
    if 'leaf' in mats: fin['hi'] = '6'; pal['6'] = (LEAF['stone' if rec.get('stone') else rec['leaf']][0])[5]
    if rec.get('stone'): fin.update({'tips': False, 'tufts': False, 'deep_edge': True})
    if rec.get('bark_style'): fin['bark_style'] = rec['bark_style']
    if rec.get('rings'): fin['rings'] = 'PQRS'
    if rec.get('fruit'):
        fc = FRUIT[rec['fruit']]; pal.update({'x': fc[0], 'y': fc[1], 'z': fc[2]})
        fin['fruit'] = {'chars': 'xyz', 'n': 9 if Hd > 70 else 5, 'size': 3 if rec['fruit'] == 'apple' else 1, 'gap': 11 if rec['fruit'] == 'apple' else 5}
    if rec.get('litter'): fin['litter'] = {'n': 18 if Hd > 80 else 6, 'rx': max(10, Wd // 4), 'ry': 9 if Hd > 80 else 4, 'cols': 'abcd', 'from': '2345'}
    json.dump(fin, open(sp + '_finish.json', 'w'))
    subprocess.run([sys.executable, os.path.join(HERE, 'blockout.py'), sp + '.json', sp], check=True, capture_output=True)
    pxg = os.path.join(OUT, name + '.pxg')
    subprocess.run([sys.executable, os.path.join(HERE, 'finish.py'), sp + '.grid.txt', pxg, sp + '_finish.json'], check=True, capture_output=True)
    bd = os.path.join(OUT, 'png'); os.makedirs(bd, exist_ok=True)
    subprocess.run([sys.executable, os.path.join(HERE, 'grid.py'), 'build', pxg, bd], check=True, capture_output=True)
    # crop to the content; the anchor moves with it
    from PIL import Image
    p = os.path.join(bd, name + '.png'); im = Image.open(p); bb = im.getbbox()
    ax, ay = Wd // 2, Hd - 22
    im = im.crop((max(0, bb[0] - 1), max(0, bb[1] - 1), min(im.width, bb[2] + 1), min(im.height, bb[3] + 1)))
    im.save(p)
    return p, ax - max(0, bb[0] - 1), ay - max(0, bb[1] - 1), im.size


def install(name, p, ax, ay, size):
    for root in [GAME] + [r for r in os.environ.get('HA_BUILD', '').split(':') if r]:   # HA_BUILD: the build copy too
        install_to(root, name, p, ax, ay, size)


def install_to(GAME, name, p, ax, ay, size):
    obj = os.path.join(GAME, 'spr', 'lpc', 'obj'); bak = os.path.join(GAME, 'spr', 'backup_lpc', 'obj')
    os.makedirs(bak, exist_ok=True)
    dst = os.path.join(obj, name + '.png')
    if os.path.exists(dst) and not os.path.exists(os.path.join(bak, name + '.png')): shutil.copy(dst, os.path.join(bak, name + '.png'))
    shutil.copy(p, dst)
    mp = os.path.join(GAME, 'spr', 'lpc', 'objects.json'); M = json.load(open(mp))
    e = M.get(name, {'src': f'spr/lpc/obj/{name}.png', 'foot': [0, 0, 0, 0]})
    e.update({'fw': size[0], 'fh': size[1], 'ax': float(ax), 'ay': float(ay)})
    M[name] = e; json.dump(M, open(mp, 'w'), indent=0)


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    for name, rec in SPRITES.items():
        if args and not any(a in name for a in args): continue
        p, ax, ay, size = make(name, rec)
        print(name, size, 'anchor', ax, ay)
        if '--install' in sys.argv: install(name, p, ax, ay, size)
