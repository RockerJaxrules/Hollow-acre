"""Props in Hollow Acre made the approved way (3D blockout at 30 degrees + the hand finish), drawn from scratch:
the four crafting benches, the furnace and the mine lift (they replace the LPC-derived ones).

    python3 blockprops.py [names...] [--install]          (HA_BUILD=/build/copy also installs into the build copy)

A prop is a list of parts in world units (1 = 1 px): box, cyl (any axis), ball, ring (a wheel facing you), rod (a
tapered capsule). x runs right, y up, z toward the viewer. Each part names a material; materials carry a ramp, an
optional world-space pattern (planks, bricks, bars) and a bevel (the lit rim along the front edge of top faces).
"""
import sys, os, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from nature import install, SHADOW   # same install (backup, meta, build copy)
GEN = os.path.join(HERE, 'blockouts', 'gen'); OUT = os.path.join(HERE, "blockprops_gen")
os.makedirs(GEN, exist_ok=True); os.makedirs(OUT, exist_ok=True)

RAMPS = {
    'wood':   ['#2e1c1c', '#4e3026', '#734a30', '#98683c', '#b8864c'],
    'dkwood': ['#1e1418', '#34221e', '#4e3426', '#6c4a32', '#8a6440'],
    'paint':  ['#1a2628', '#2a4036', '#3c5a46', '#547656', '#76966a'],
    'iron':   ['#16161e', '#2a2a34', '#45454f', '#686a76', '#9296a2'],
    'stone':  ['#1c1a24', '#34303c', '#524a56', '#746a70', '#968a88'],
    'clay':   ['#3a1a1e', '#6a2a24', '#9a4430', '#c0643c', '#d88a58'],
    'cloth':  ['#3a2e28', '#5e4a3a', '#86704e', '#a89064', '#c4ae80'],
    'leather': ['#2e1416', '#4e2420', '#783a2a', '#9c5634', '#bc7a4a'],
    'leaf':   ['#14202a', '#203a32', '#2e5636', '#4a763c', '#6e9a48'],
    'soot':   ['#120c10', '#1e1418', '#2a1c1c', '#3a2620', '#4a3226'],
    'fire':   ['#7a2a14', '#c4521c', '#f08a2a', '#ffc04e', '#ffe08a'],
    'rope':   ['#3a2a20', '#5e4630', '#86683e', '#a8884e', '#c4a466'],
    'steel':  ['#1c1e26', '#343844', '#565c6a', '#868c9a', '#c0c6d0'],
}
OUTLINE = ['#140e12', '#2e2226']
POOL = 'ABCDEFGHIJKLMNPQRTUVWXYZbcdefghijklmnpqrtuvw0123456789!$%&*=@?^~;:<>#"\'(),/[]_`{|}' + 'αβγδεζηθικλμνξπρστυφχψωΓΔΘΛΞΠΣΦΨΩ'   # free for materials ('O' 'o' 's' '.' '-' '+' are taken)


def box(x0, y0, z0, x1, y1, z1, m, **k): return dict(type='box', min=[x0, y0, z0], max=[x1, y1, z1], mat=m, **k)
def cyl(x, y, z, r, h, m, axis='y', **k): return dict(type='cylinder', c=[x, y, z], r=r, h=h, mat=m, axis=axis, **k)
def ball(x, y, z, r, m, rr=None, **k):
    d = dict(type='ellipsoid' if rr else 'sphere', c=[x, y, z], mat=m, **k)
    if rr: d['rr'] = rr
    else: d['r'] = r
    return d
def ring(x, y, z, R, r, m, **k): return dict(type='torus', c=[x, y, z], R=R, r=r, mat=m, **k)
def rod(a, b, r0, r1, m, **k): return dict(type='branch', a=a, b=b, r0=r0, r1=r1, mat=m, **k)


def table(w=26, d=10, h=24, top=4, wood='wood', leg='wood', shelf=True):
    p = [box(-w, h, -d, w, h + top, d, wood, pattern=['planks', 5, 'z'])]
    for x in (-w + 1, w - 5):
        for z in (-d + 1, d - 5): p.append(box(x, 0, z, x + 4, h, z + 4, leg))
    if shelf: p.append(box(-w + 2, 5, -d + 2, w - 2, 7, d - 2, leg, pattern=['planks', 6, 'x']))
    return p


def bench_farm():
    P = table(26, 10, 24, 4, 'paint', 'paint')
    P += [box(-26, 28, -10, 26, 54, -7, 'paint', pattern=['planks', 6, 'y']),          # back panel
          box(-26, 44, -10, 26, 46, -2, 'paint'),                                      # upper shelf
          box(-20, 28, -4, -4, 31, 6, 'wood'),                                          # seed tray
          ]
    for i in range(5):                                                                  # sprouts in the tray
        for k in range(2): P.append(ball(-18 + i * 3.2, 32, -1.5 + k * 4.5, 1.3, 'leaf'))
    for x in (-16, 0, 15):                                                              # pots on the shelf
        P += [cyl(x, 46, -6, 3.2, 4.5, 'clay'), ball(x, 52, -6, 3, 'leaf')]
    P += [cyl(14, 28, 2, 4, 5.5, 'clay'), ball(14, 36, 2, 4, 'leaf', lumps=.6, lumpfreq=1.2),   # potted plant
          ball(-12, 11, 0, 0, 'cloth', rr=[7, 5, 5.5]),                                 # seed sack under the table
          cyl(8, 7, 2, 3, 3, 'clay'), cyl(14, 7, 1, 3, 3, 'clay'), cyl(11, 10, 1.5, 3, 3, 'clay')]
    return P


def bench_furn():
    P = table(27, 10, 22, 5, 'wood', 'dkwood')
    P += [box(-27, 27, -10, 27, 50, -7, 'dkwood', pattern=['planks', 7, 'y']),
          box(-20, 34, -7, 2, 40, -6, 'steel'), box(-23, 33, -7, -18, 41, -5, 'wood'),  # a saw on the wall
          box(8, 31, -7, 10, 46, -6, 'steel'), box(8, 44, -7, 18, 46, -6, 'steel'),     # a square
          box(-27, 16, 8, -19, 27, 13, 'iron'), cyl(-23, 20, 13, 1.2, 4, 'iron', axis='z'),   # vice
          box(4, 27, -2, 16, 30, 3, 'wood'), box(8, 30, -1, 11, 33, 2, 'dkwood'),       # a plane
          box(-14, 27, 2, -4, 28.5, 6, 'wood'),                                         # a board being worked
          box(-2, 42, -7, 0, 48, -6, 'dkwood'), box(-4, 47, -7, 2, 50, -5, 'iron'),     # a hammer on the wall
          box(20, 36, -7, 21, 46, -6, 'steel'), box(23, 37, -7, 24, 46, -6, 'steel'), box(19, 44, -7, 25, 47, -6, 'wood'),   # chisels
          ball(-8, 29, 7, 1.2, 'cloth'), ball(-5, 29, 8, 1, 'cloth'), ball(0, 29, 6, 1.2, 'cloth'),     # shavings
          box(-24, 7, -6, 24, 10, 4, 'wood', pattern=['planks', 3, 'y'])]               # planks on the shelf
    return P


def bench_weapon():
    P = table(27, 10, 22, 5, 'dkwood', 'dkwood')
    P += [box(-4, 27, -10, -1, 54, -6, 'dkwood'), box(22, 27, -10, 25, 54, -6, 'dkwood'), box(-4, 50, -10, 25, 53, -6, 'dkwood'),
          box(-4, 38, -10, 25, 40, -7, 'dkwood'),                                       # the rack
          box(6, 30, -6, 8, 50, -5, 'steel'), box(3, 30, -6, 11, 32, -5, 'iron'), box(6, 26, -6, 8, 30, -5, 'leather'),  # a blade
          rod([17, 28, -6], [17, 50, -6], 1, 1, 'wood'), box(13, 44, -7, 21, 50, -5, 'steel'),          # an axe
          cyl(-16, 36, -2, 9, 3, 'stone', axis='z'), cyl(-16, 36, 1, 1.4, 4, 'iron', axis='z'),         # grindstone
          box(-27, 27, -6, -6, 30, 4, 'dkwood'),
          box(6, 27, 2, 18, 29, 6, 'iron'), box(9, 29, 3, 15, 31, 5, 'iron'),           # an anvil block
          box(-20, 7, -4, -8, 10, 4, 'iron'), box(-6, 7, -4, 6, 10, 4, 'iron')]         # ingots on the shelf
    return P


def bench_armor():
    P = table(24, 10, 22, 5, 'wood', 'dkwood')
    P = [dict(p, c=[p['c'][0] + 8] + p['c'][1:]) if 'c' in p else dict(p, min=[p['min'][0] + 8] + p['min'][1:], max=[p['max'][0] + 8] + p['max'][1:]) for p in P]
    P += [rod([-26, 0, 0], [-26, 34, 0], 1.6, 1.4, 'dkwood'),                            # dress form on a stand
          rod([-26, 2, 0], [-32, 0, 4], 1.4, 1, 'dkwood'), rod([-26, 2, 0], [-20, 0, 4], 1.4, 1, 'dkwood'),
          ball(-26, 36, 0, 0, 'leather', rr=[8, 5, 6]), ball(-26, 41, 0, 0, 'leather', rr=[6, 4, 5]),   # hips, waist
          ball(-26, 47, 0, 0, 'leather', rr=[9.5, 5.5, 6]), cyl(-26, 51, 0, 2, 3, 'dkwood'),            # chest, neck
          box(-30, 34, 5, -22, 50, 6.5, 'iron', pattern=['bars', 2, 'x', 1]),                          # a mail panel
          ball(16, 30, -3, 4.5, 'iron'), cyl(16, 27, -3, 4.8, 3, 'iron'),                                # a helmet
          cyl(26, 6, 6, 7, 2, 'wood', axis='z'), cyl(26, 6, 8, 2, 1, 'iron', axis='z'),                  # a shield leaning
          cyl(-2, 29, 2, 3, 22, 'leather', axis='x'),                                   # a roll of leather
          box(4, 27, -6, 22, 28, -2, 'leather'), box(20, 27, 0, 26, 30, 4, 'iron'),     # a hide, a box of rivets
          box(-12, 7, -4, 26, 11, 4, 'leather')]                                        # folded hides on the shelf
    return P


def furnace():
    P = [box(-16, 0, -12, 16, 30, 12, 'stone', pattern=['bricks', 4]),
         box(-18, 28, -14, 18, 32, 14, 'stone'),                                         # a ledge
         cyl(0, 32, -3, 7, 30, 'stone', pattern=['bricks', 4]), cyl(0, 61, -3, 8, 3, 'iron'),   # chimney + cap
         box(-9, 2, 11, 9, 17, 13, 'soot'), box(-7, 3, 12, 7, 13, 13.5, 'fire'),        # the mouth and its fire
         box(-10, 17, 11, 10, 19, 13.5, 'iron')]                                         # lintel
    return P


def mine_lift():
    P = [box(-24, 0, -6, -18, 82, 0, 'wood', pattern=['planks', 20, 'y', 1]), box(18, 0, -6, 24, 82, 0, 'wood', pattern=['planks', 20, 'y', 1]),
         box(-28, 80, -7, 28, 86, 1, 'wood'),                                            # crossbeam
         ring(0, 70, -3, 8, 1.6, 'iron'), cyl(0, 70, -5, 2, 4, 'iron', axis='z'),        # the wheel
         rod([0, 62, -3], [0, 78, -3], .8, .8, 'iron'), rod([-7, 70, -3], [7, 70, -3], .8, .8, 'iron'),
         rod([0, 40, -1], [0, 62, -1], .7, .7, 'rope'),                                  # the cable
         box(-15, 0, -9, 15, 38, 9, 'cage', pattern=['bars', 4, 'x', 2]),                # the cage
         box(-16, 37, -10, 16, 41, 10, 'iron'), box(-16, 0, -10, 16, 3, 10, 'iron'),
         box(-24, 30, -6, 24, 32, 0, 'iron'), box(-24, 60, -6, 24, 62, 0, 'iron')]       # iron straps
    return P


SPRITES = {'bench_farm': bench_farm, 'bench_furn': bench_furn, 'bench_weapon': bench_weapon,
           'bench_armor': bench_armor, 'furnace': furnace, 'mine_lift': mine_lift}
MATDEF = {'fire': {'emit': 2, 'ambient': 1}, 'cage': {'ramp': 'iron', 'ambient': .2}, 'soot': {'ambient': .1}}


def make(name):
    parts = SPRITES[name]()
    used = []
    for p in parts:
        if p['mat'] not in used: used.append(p['mat'])
    mats, pal = {}, {}
    k = 0
    for m in used:
        d = MATDEF.get(m, {}); ramp = RAMPS[d.get('ramp', m)]; ch = POOL[k:k + len(ramp)]; k += len(ramp)
        mats[m] = {'chars': ch, 'ambient': d.get('ambient', .22), 'shade': .5, 'bevel': m not in ('fire', 'soot', 'leaf', 'cloth')}
        if 'emit' in d: mats[m]['emit'] = d['emit']
        pal.update(dict(zip(ch, ramp)))
    pal['s'] = SHADOW
    Wd, Hd = 100, 120
    scene = {'size': [Wd, Hd], 'origin': [Wd // 2, Hd - 16], 'elev': 30, 'materials': mats, 'palette': pal, 'shapes': parts,
             'gamma': 1.15, 'shadow_light': [-.13, 1, -.12], 'light': [-.4, 1.0, .5]}
    sp = os.path.join(GEN, name); json.dump(scene, open(sp + '.json', 'w'))
    fin = {'name': name, 'anchor': [Wd // 2, Hd - 16], 'leaf': '', 'bark': '', 'palette': pal, 'outline': OUTLINE, 'min_cluster': 3,
           'tips': False, 'tufts': False, 'deep_edge': False}
    json.dump(fin, open(sp + '_finish.json', 'w'))
    subprocess.run([sys.executable, os.path.join(HERE, 'blockout.py'), sp + '.json', sp], check=True, capture_output=True)
    pxg = os.path.join(OUT, name + '.pxg')
    subprocess.run([sys.executable, os.path.join(HERE, 'finish.py'), sp + '.grid.txt', pxg, sp + '_finish.json'], check=True, capture_output=True)
    bd = os.path.join(OUT, 'png'); os.makedirs(bd, exist_ok=True)
    subprocess.run([sys.executable, os.path.join(HERE, 'grid.py'), 'build', pxg, bd], check=True, capture_output=True)
    from PIL import Image
    p = os.path.join(bd, name + '.png'); im = Image.open(p); bb = im.getbbox(); ax, ay = Wd // 2, Hd - 16
    im = im.crop((max(0, bb[0] - 1), max(0, bb[1] - 1), min(im.width, bb[2] + 1), min(im.height, bb[3] + 1))); im.save(p)
    return p, ax - max(0, bb[0] - 1), ay - max(0, bb[1] - 1), im.size


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    for name in SPRITES:
        if args and not any(a in name for a in args): continue
        p, ax, ay, size = make(name); print(name, size, 'anchor', ax, ay)
        if '--install' in sys.argv: install(name, p, ax, ay, size)
