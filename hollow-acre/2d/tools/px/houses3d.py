"""Buildings through the blockout method (3D scene at 30 degrees + the hand finish), our own house kit.

    python3 houses3d.py [names...] [--install]        (HA_BUILD=/build/copy installs into the build copy too)

Units are pixels. x runs right, y up, z toward the viewer; the front wall stands at z = 0 and the sprite's anchor is the
middle of the front wall's foot, like the hand-drawn buildings it replaces. Each building also gets a night sprite
(<name>_n) with its windows lit from inside.
"""
import sys, os, json, math, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from nature import install, SHADOW
from blockprops import POOL, box, cyl
GEN = os.path.join(HERE, 'blockouts', 'gen'); OUT = os.path.join(HERE, 'houses3d_gen'); os.makedirs(OUT, exist_ok=True)

RAMPS = {
    'siding':  ['#3a3640', '#5e5a62', '#8a8488', '#b0a8a4', '#cec4b8'],
    'trim':    ['#4a4648', '#7a7470', '#a8a098', '#d0c8bc', '#ece4d6'],
    'slate':   ['#101016', '#1a1a22', '#262630', '#34343e', '#46464f'],
    'curtain': ['#3a1418', '#5e2024', '#843230', '#a84a3e', '#c26a52'],
    'brick':   ['#2a1414', '#4a2220', '#6a3428', '#8a4a34', '#a66444'],
    'stone':   ['#1c1a24', '#34303c', '#524a56', '#746a70', '#968a88'],
    'glass':   ['#0e121e', '#18223a', '#26365a', '#3a5478', '#6a88a6'],
    'lit':     ['#6a3a1a', '#b4642a', '#e8a048', '#ffd27a', '#fff0c0'],
    'shutter': ['#10201c', '#1a3228', '#264638', '#365c48', '#4a745a'],
    'door':    ['#260e10', '#461618', '#6a2220', '#8e302a', '#ac4a3a'],
    'wood':    ['#2e1c1c', '#4e3026', '#734a30', '#98683c', '#b8864c'],
    'moss':    ['#18241a', '#243820', '#344c28', '#466232', '#5a7a3e'],
    'iron':    ['#16161e', '#2a2a34', '#45454f', '#686a76', '#9296a2'],
}
OUTLINE = ['#120e14', '#2a2228']


def hip_roof(x0, x1, z0, z1, y0, rise, m, over=8, **k):
    """a hip roof over the rectangle x0..x1, z0..z1 (eaves `over` px out), rising `rise` px; all four faces slope"""
    X0, X1, Z0, Z1 = x0 - over, x1 + over, z0 - over, z1 + over
    hz = (Z1 - Z0) / 2; c = [(X0 + X1) / 2, y0 + rise / 2, (Z0 + Z1) / 2]; hx = (X1 - X0) / 2
    L = math.hypot(hz, rise); nf = [0, hz / L, rise / L]
    d = nf[1] * (-rise / 2) + nf[2] * hz
    ns = [rise / L, hz / L, 0]; ds = ns[0] * hx + ns[1] * (-rise / 2)
    planes = [[0, nf[1], nf[2], d], [0, nf[1], -nf[2], d], [ns[0], ns[1], 0, ds], [-ns[0], ns[1], 0, ds]]
    return dict(type='box', min=[X0, y0, Z0], max=[X1, y0 + rise, Z1], mat=m, c=c, planes=planes,
                pattern=['bricks', 4, 'x', 1], **k)


def gable_dormer(cx, y0, zf, w, h, roofm, wallm, trim, glass):
    P = [box(cx - w / 2, y0, zf - 14, cx + w / 2, y0 + h, zf, wallm, pattern=['planks', 5, 'y'])]
    hw = w / 2 + 3; rise = hw * .8; L = math.hypot(hw, rise)
    c = [cx, y0 + h + rise / 2, zf - 7]
    P.append(dict(type='box', min=[cx - hw, y0 + h, zf - 16], max=[cx + hw, y0 + h + rise, zf + 2], mat=roofm, c=c,
                  planes=[[rise / L, hw / L, 0, (rise * hw - hw * rise / 2) / L], [-rise / L, hw / L, 0, (rise * hw - hw * rise / 2) / L]]))
    P += window(cx, y0 + 3, zf, w - 8, h - 6, trim, glass, shutters=None, mull=False)
    return P


def window(cx, y0, zf, w, h, trim, glass, shutters='shutter', mull=True):
    P = [box(cx - w / 2 - 2, y0 - 2, zf - 1, cx + w / 2 + 2, y0 + h + 2, zf + 1.2, trim),          # frame
         box(cx - w / 2, y0, zf - 1, cx + w / 2, y0 + h, zf + 1.6, glass, **({'pattern': ['glint', 60]} if glass == 'glass' else {})),   # glass
         box(cx - w / 2, y0, zf, cx - w / 2 + w * .22, y0 + h, zf + 1.7, 'curtain'),                # curtains, drawn back
         box(cx + w / 2 - w * .22, y0, zf, cx + w / 2, y0 + h, zf + 1.7, 'curtain'),
         box(cx - w / 2 - 3, y0 - 3.5, zf - 1, cx + w / 2 + 3, y0 - 1.5, zf + 3, trim)]             # sill
    if mull: P += [box(cx - 1.2, y0, zf, cx + 1.2, y0 + h, zf + 2.2, trim), box(cx - w / 2, y0 + h / 2 - 1.2, zf, cx + w / 2, y0 + h / 2 + 1.2, zf + 2.2, trim)]
    if shutters:
        for s in (-1, 1):
            x = cx + s * (w / 2 + 5)
            P.append(box(x - 4, y0 - 1, zf - 1, x + 4, y0 + h + 1, zf + 1.5, shutters, pattern=['planks', 3, 'y', 1]))
    return P


def house_a(night=False):
    G = 'lit' if night else 'glass'
    W2, D, H1, H2 = 104, 62, 74, 146          # half width, depth, first-floor top, wall top
    P = [box(-W2 - 3, 0, -D - 3, W2 + 3, 9, 3, 'stone', pattern=['bricks', 4]),                              # foundation
         box(-W2, 9, -D, W2, H2, 0, 'siding', pattern=['planks', 5, 'y']),                                     # walls
         box(-W2 - 2, H1, -D - 1, W2 + 2, H1 + 6, 1.5, 'trim'),                                                # band between floors
         box(-W2 - 2, H2 - 4, -D - 1, W2 + 2, H2 + 1, 1.5, 'trim'),                                            # frieze
         box(-W2 - 2, 9, -D, -W2 + 3, H2, 1.5, 'trim'), box(W2 - 3, 9, -D, W2 + 2, H2, 1.5, 'trim'),          # corner boards
         hip_roof(-W2, W2, -D, 0, H2 + 1, 52, 'slate', over=10),
         box(64, H2 + 10, -34, 80, H2 + 72, -18, 'brick', pattern=['bricks', 3]), box(62, H2 + 70, -36, 82, H2 + 75, -16, 'stone')]   # chimney
    P += gable_dormer(0, H2 + 16, -12, 30, 24, 'slate', 'siding', 'trim', G)

    for x in (-62, 62):
        P += window(x, H1 + 14, 0, 30, 40, 'trim', G)                                                         # upstairs
        P += window(x, 22, 0, 30, 38, 'trim', G)                                                              # downstairs
    P += [box(-15, 9, -1, 15, 64, 2, 'trim'), box(-12, 9, -1, 12, 60, 2.6, 'door', pattern=['planks', 4, 'x', 1]),   # door
          box(-10, 44, 2.4, 10, 56, 3, G), box(7, 32, 2.6, 9, 34, 4, 'iron'),                                           # door light, knob
          box(-W2 - 2, 9, 0, W2 + 2, 13, 18, 'wood', pattern=['planks', 4, 'x']),                                     # porch floor
          box(-24, 0, 18, 24, 5, 26, 'wood', pattern=['planks', 4, 'x']), box(-24, 5, 18, 24, 9, 22, 'wood')]          # steps
    for x in (-W2, -44, 44, W2 - 2):
        P.append(cyl(x + 1, 13, 15, 2.6, 58, 'trim'))                                                          # posts
    P += [box(-W2 - 4, 70, -2, W2 + 4, 74, 20, 'slate', planes=[[0, .97, .25, 2.4]], c=[0, 72, 9]),          # porch roof
          box(-W2, 26, 14, -26, 28, 16, 'trim'), box(26, 26, 14, W2, 28, 16, 'trim')]                          # railings
    for x in list(range(-W2 + 6, -26, 7)) + list(range(30, W2, 7)):
        P.append(box(x, 13, 14.5, x + 1.4, 26, 15.5, 'trim'))                                                  # balusters
    P += [box(26, 40, 1, 34, 50, 4, 'iron')]                                                                   # mailbox
    return P


SPRITES = {'house_a': house_a}
MATDEF = {'lit': {'emit': 2, 'ambient': 1, 'glow': True}}


def render(name, night):
    parts = SPRITES[name](night)
    used = []
    for p in parts:
        if p['mat'] not in used: used.append(p['mat'])
    mats, pal, k = {}, {}, 0
    for m in used:
        d = MATDEF.get(m, {}); ramp = RAMPS[m]; ch = POOL[k:k + len(ramp)]; k += len(ramp)
        mats[m] = {'chars': ch, 'ambient': d.get('ambient', .24), 'shade': .5, 'bevel': m in ('trim', 'stone', 'wood', 'slate')}
        if 'emit' in d: mats[m]['emit'] = d['emit']
        if d.get('glow'): mats[m]['glow'] = True
        pal.update(dict(zip(ch, ramp)))
    pal['s'] = SHADOW
    Wd, Hd = 300, 300; ox, oy = 150, 262
    scene = {'size': [Wd, Hd], 'origin': [ox, oy], 'elev': 30, 'materials': mats, 'palette': pal, 'shapes': parts, 'gamma': 1.1,
             'shadow_light': [-.13, 1, -.12], 'light': [-.4, 1.0, .5]}
    sp = os.path.join(GEN, name + ('_n' if night else '')); json.dump(scene, open(sp + '.json', 'w'))
    fin = {'name': name + ('_n' if night else ''), 'anchor': [ox, oy], 'leaf': '', 'bark': '', 'palette': pal, 'outline': OUTLINE,
           'min_cluster': 3, 'tips': False, 'tufts': False, 'deep_edge': False}
    json.dump(fin, open(sp + '_finish.json', 'w'))
    subprocess.run([sys.executable, os.path.join(HERE, 'blockout.py'), sp + '.json', sp], check=True, capture_output=True)
    subprocess.run([sys.executable, os.path.join(HERE, 'finish.py'), sp + '.grid.txt', sp + '.pxg', sp + '_finish.json'], check=True, capture_output=True)
    subprocess.run([sys.executable, os.path.join(HERE, 'grid.py'), 'build', sp + '.pxg', OUT], check=True, capture_output=True)
    from PIL import Image
    p = os.path.join(OUT, fin['name'] + '.png'); im = Image.open(p); bb = im.getbbox()
    im = im.crop((bb[0] - 1, bb[1] - 1, bb[2] + 1, bb[3] + 1)); im.save(p)
    return p, ox - bb[0] + 1, oy - bb[1] + 1, im.size


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    for name in SPRITES:
        if args and not any(a == name for a in args): continue
        for night in (False, True):
            p, ax, ay, size = render(name, night); n = name + ('_n' if night else ''); print(n, size, 'anchor', ax, ay)
            if '--install' in sys.argv: install(n, p, ax, ay, size)
