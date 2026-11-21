"""Item icons through the blockout method: a small 3D model per item, a closer camera, no ground shadow, the hand
finish (clean clusters, one outline). 32x32 like the hand-coded icons they replace.

    python3 icons3d.py [names...] [--install]
"""
import sys, os, json, math, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from nature import install
from blockprops import POOL
GEN = os.path.join(HERE, 'blockouts', 'icons'); OUT = os.path.join(HERE, 'icons3d_gen'); os.makedirs(GEN, exist_ok=True); os.makedirs(OUT, exist_ok=True)
RAMPS = {
    'pumpkin': ['#4a1a10', '#8a3414', '#c4581c', '#e8842c', '#f8b050'], 'stem': ['#1e1a10', '#3a3018', '#5a4a24', '#7a6a34', '#9a8a48'],
    'leaf': ['#14281a', '#1e4424', '#2e6a30', '#4a8e3a', '#76b24a'], 'turnipw': ['#5a4a58', '#8a7a86', '#bcb0b4', '#e2dad6', '#f8f4ee'],
    'turnipp': ['#2a1030', '#4e1a4e', '#7a2a6e', '#a4428a', '#c868a4'], 'bark': ['#2a1c1a', '#4a3024', '#6e4a30', '#946a40', '#b48a54'],
    'grain': ['#6a4628', '#946a3c', '#b88c52', '#d6ac6c', '#ecc888'], 'stone': ['#1e1c26', '#3a3644', '#5a5462', '#807a84', '#aaa4a8'],
    'egg': ['#6a5a48', '#a89478', '#d0c0a0', '#ece0c4', '#fbf6e8'], 'iron': ['#16161e', '#30323c', '#545864', '#8a909c', '#d0d6e0'],
    'wood': ['#2e1c16', '#52321e', '#7a4e2a', '#a06c38', '#c48c4c'],
}


def rot_y(pts, a):
    return [[x * math.cos(a) + z * math.sin(a), y, -x * math.sin(a) + z * math.cos(a)] for x, y, z in pts]


def pumpkin():
    P = []
    for k in range(8):   # ribs: distinct lobes round the middle, creases between them
        a = k * 2 * math.pi / 8 + .2; P.append(dict(type='ellipsoid', c=[math.sin(a) * 6.2, 8, math.cos(a) * 6.2], rr=[4.6, 7.2, 4.6], mat='pumpkin'))
    P += [dict(type='branch', a=[0, 13, 0], b=[1.8, 19, -.5], r0=1.7, r1=1.2, mat='stem'),
          dict(type='ellipsoid', c=[-3.8, 15, 1.5], rr=[3.4, 1, 2.4], mat='leaf')]
    return P, dict(elev=30)


def turnip():
    return [dict(type='sphere', c=[0, 9, 0], r=7.5, mat='turnipw', topmat='turnipp', top_at=.15),
            dict(type='branch', a=[0, 2, 0], b=[0, -3, 1], r0=1.6, r1=.5, mat='turnipw'),
            dict(type='ellipsoid', c=[-3, 20, 0], rr=[2.2, 5.5, 1.2], mat='leaf'), dict(type='ellipsoid', c=[2.5, 21, .5], rr=[2.2, 6, 1.2], mat='leaf'),
            dict(type='ellipsoid', c=[0, 22, -1], rr=[2, 6, 1.2], mat='leaf')], dict(elev=30, scale=.85)


def wood():
    P = []
    for (y, z) in ((4, 3.5), (4, -7.5), (12.5, -2)):   # three logs lying lengthwise, the sawn ends to the right
        P.append(dict(type='cylinder', c=[-12, y, z], r=4.6, h=24, mat='bark', axis='x', topmat='grain', top_axis=0, top_at=.8))
    return P, dict(elev=30, rotate=dict(yaw=-22), scale=1.0)


def stone():
    cuts = [[.2, 1, .1, .6], [1, .2, .3, .78], [-1, .3, .2, .8], [.3, .1, 1, .8], [-.4, .2, -1, .8], [.8, .4, -.7, .82]]
    return [dict(type='ellipsoid', c=[0, 7, 0], rr=[11, 8, 9], mat='stone', cuts=cuts)], dict(elev=35)


def egg():
    return [dict(type='ellipsoid', c=[0, 9.5, 0], rr=[6.6, 9, 6.6], mat='egg')], dict(elev=30)


def axe():
    # built upright (handle up the y axis, head across x), then turned so the handle runs bottom-left to top-right
    return [dict(type='branch', a=[0, -15, 0], b=[0, 15, 0], r0=1.6, r1=1.4, mat='wood'),
            dict(type='box', min=[1, 7, -1.4], max=[11, 15, 1.4], mat='iron'),                  # the cheek
            dict(type='box', min=[9, 3, -1.2], max=[12.5, 19, 1.2], mat='iron', round=.6),      # the bit (edge)
            dict(type='box', min=[-4.5, 8.5, -1.8], max=[1, 13.5, 1.8], mat='iron')], dict(elev=15, rotate=dict(pitch=-38, pivot=[0, 0, 0]), oy=19)


ICONS = {'pumpkin': pumpkin, 'turnip': turnip, 'wood': wood, 'stone': stone, 'egg': egg, 'axe': axe}


def render(name):
    P, cam = ICONS[name]()
    k = cam.get('scale', 1.3)   # the model is drawn in a 24-unit box; this fills a 30 px slot
    def sc(p):
        q = dict(p)
        for key in ('c', 'min', 'max', 'a', 'b', 'rr'):
            if key in q: q[key] = [v * k for v in q[key]]
        for key in ('r', 'h', 'r0', 'r1', 'round'):
            if key in q: q[key] = q[key] * k
        return q
    P = [sc(p) for p in P]
    if 'rotate' in cam and 'pivot' in cam['rotate']: cam['rotate']['pivot'] = [v * k for v in cam['rotate']['pivot']]
    used = []
    for p in P:
        for m in (p['mat'], p.get('topmat')):
            if m and m not in used: used.append(m)
    mats, pal, k = {}, {}, 0
    for m in used:
        ramp = RAMPS[m]; ch = POOL[k:k + len(ramp)]; k += len(ramp)
        mats[m] = {'chars': ch, 'ambient': .25, 'shade': .4}; pal.update(dict(zip(ch, ramp)))
    W = H = 48; scene = {'size': [W, H], 'origin': [W // 2, int(cam.get('oy', 29) * 1.3) + 4], 'elev': cam.get('elev', 30), 'materials': mats, 'palette': pal,
                         'shapes': P, 'gamma': 1.05, 'noshadow': True, 'light': [-.5, 1.0, .6], 'rotate': cam.get('rotate', {})}
    sp = os.path.join(GEN, name); json.dump(scene, open(sp + '.json', 'w'))
    fin = {'name': 'icon32_' + name, 'anchor': [W // 2, 40], 'leaf': '', 'bark': '', 'palette': pal, 'outline': ['#140e14', '#2c2028'],
           'min_cluster': 2, 'tips': False, 'tufts': False, 'deep_edge': False}
    json.dump(fin, open(sp + '_finish.json', 'w'))
    subprocess.run([sys.executable, os.path.join(HERE, 'blockout.py'), sp + '.json', sp], check=True, capture_output=True)
    subprocess.run([sys.executable, os.path.join(HERE, 'finish.py'), sp + '.grid.txt', sp + '.pxg', sp + '_finish.json'], check=True, capture_output=True)
    subprocess.run([sys.executable, os.path.join(HERE, 'grid.py'), 'build', sp + '.pxg', OUT], check=True, capture_output=True)
    from PIL import Image
    p = os.path.join(OUT, 'icon32_' + name + '.png'); im = Image.open(p).convert('RGBA'); bb = im.getbbox()
    c = Image.new('RGBA', (32, 32)); w, h = bb[2] - bb[0], bb[3] - bb[1]
    if w > 32 or h > 32: print('  too big', name, w, h)
    c.alpha_composite(im.crop(bb), ((32 - w) // 2, max(0, (32 - h) // 2))); c.save(p)
    return p


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    for n in ICONS:
        if args and n not in args: continue
        p = render(n); print(p)
        if '--install' in sys.argv: install('icon32_' + n, p, 16, 16, (32, 32))
