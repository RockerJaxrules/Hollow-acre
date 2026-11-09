"""The everyday props through the blockout method (3D scene at 30 degrees + the hand finish), drawn from scratch:
barrels, crates, sacks, hay, firewood, lamps, mailboxes, benches, pumpkins, fences, walls, graves, the fountain, the well...

    python3 props3d.py [names...] [--install]        (HA_BUILD=/build/copy installs into the build copy too)
"""
import sys, os, json, math, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from nature import install, SHADOW
from blockprops import POOL, RAMPS as R0, box, cyl, ball, ring, rod
GEN = os.path.join(HERE, 'blockouts', 'props3d'); OUT = os.path.join(HERE, 'props3d_gen'); os.makedirs(GEN, exist_ok=True); os.makedirs(OUT, exist_ok=True)
RAMPS = dict(R0)
RAMPS.update({
    'grain': ['#5a3a2c', '#86603e', '#a8804e', '#c4a066', '#dcbc80'], 'straw': ['#4a3416', '#7a5a22', '#a8822e', '#cca440', '#e4c464'],
    'pump': ['#4a1a10', '#8a3414', '#c4581c', '#e8842c', '#f8b050'], 'pumpw': ['#5a5248', '#8a8274', '#b8b0a0', '#d8d0c0', '#f0eadc'],
    'red': ['#2a0a10', '#5a1418', '#8e2420', '#b83a2c', '#d85a40'], 'blue': ['#101a2e', '#1c2e4e', '#2e4a72', '#466a94', '#6a8eb4'],
    'cap': ['#3a0a10', '#7a1418', '#b02a24', '#d84a34', '#ec7a5a'], 'white': ['#4a4650', '#7a767e', '#a8a4a8', '#d0ccc8', '#ecE8e2'],
    'water': ['#0a1a2a', '#123048', '#1c4a68', '#2e6a8a', '#5a96b0'], 'glass': ['#121822', '#1e2a3e', '#2e4660', '#4e6e8a', '#86a2b6'],
    'lamp': ['#6a5a3a', '#a89058', '#d8c07a', '#f2e0a0', '#fff6d8'], 'soil': ['#140c0a', '#24160e', '#382416', '#4c3220', '#62422c'],
    'hedge': ['#0e1a14', '#18301e', '#244628', '#345e32', '#4a783e'], 'flower': ['#4a1626', '#7e2434', '#b0464a', '#d77a68', '#f0a890'],
    'stem': ['#1e1a10', '#3a3018', '#5a4a24', '#7a6a34', '#9a8a48'], 'black': ['#0e0c10', '#1a181e', '#28252c', '#38343c', '#4a4650'],
    'paper': ['#5a5248', '#8a8274', '#b8b0a0', '#d8d0c0', '#f0eadc'], 'fire': ['#7a2a14', '#c4521c', '#f08a2a', '#ffc04e', '#ffe08a'],
})
MATDEF = {'fire': {'emit': 2, 'ambient': 1}, 'lamp': {'emit': 3, 'ambient': 1, 'glow': True}}


def logs(n_bottom, r=4.6, ln=34):
    P = []; row = 0; y = r
    while n_bottom > 0:
        for i in range(n_bottom):   # the sawn ends face you
            x = (i - (n_bottom - 1) / 2) * r * 2.05
            P.append(cyl(x, y, -ln / 2, r, ln, 'wood', axis='z', topmat='grain', top_axis=2, top_at=.75))
        n_bottom -= 1; y += r * 1.75; row += 1
    return P


def staves(r, h, m='wood'):   # a barrel: staves, a little belly, iron hoops, a lid
    return [cyl(0, 0, 0, r, h, m, flare=-1.5, pattern=['bars', 4, 'x', 1], topmat='grain', top_at=.8),
            cyl(0, h * .18, 0, r + .5, 1.8, 'iron'), cyl(0, h * .78, 0, r + .5, 1.8, 'iron')]


PROPS = {
    'barrel': lambda: staves(11, 26),
    'drum': lambda: [cyl(0, 0, 0, 9.5, 26, 'blue', topmat='iron', top_at=.8), cyl(0, 6, 0, 10, 1.6, 'iron'), cyl(0, 19, 0, 10, 1.6, 'iron')],
    'crate': lambda: [box(-12, 0, -10, 12, 22, 10, 'wood', pattern=['planks', 5.5, 'y']),
                      box(-12.6, 0, 9.5, -9.6, 22.4, 10.6, 'dkwood'), box(9.6, 0, 9.5, 12.6, 22.4, 10.6, 'dkwood'),
                      box(-12.6, 19.4, 9.5, 12.6, 22.4, 10.6, 'dkwood'), box(-12.6, 0, 9.5, 12.6, 3, 10.6, 'dkwood'),
                      rod([-10, 3, 10.4], [10, 19.5, 10.4], 1.1, 1.1, 'dkwood')],
    'sacks': lambda: [ball(-6, 9, -2, 0, 'cloth', rr=[8, 10, 7], lumps=.6, lumpfreq=.5), ball(7, 8, 1, 0, 'cloth', rr=[8, 9, 7], lumps=.6, lumpfreq=.5),
                      rod([-6, 18, -2], [-6, 22, -2], 2.2, 1.2, 'cloth'), rod([7, 16, 1], [7, 20, 1], 2.2, 1.2, 'cloth'),
                      ring(-6, 17.5, -2, 2.6, .7, 'rope'), ring(7, 15.5, 1, 2.6, .7, 'rope')],
    'hay': lambda: [box(-21, 0, -13, 21, 26, 13, 'straw', round=3, lumps=1.0, lumpfreq=.9, stepdown=.8),
                    box(-21.5, 0, -6, 21.5, 26.5, -4.5, 'rope', round=3), box(-21.5, 0, 4.5, 21.5, 26.5, 6, 'rope', round=3)],
    'firewood': lambda: logs(4, 4.6, 13),
    'lamp': lambda: [cyl(0, 0, 0, 3.6, 4, 'black'), cyl(0, 4, 0, 1.6, 66, 'black'), box(-5, 70, -5, 5, 82, 5, 'lamp', round=1),
                     box(-6.5, 82, -6.5, 6.5, 84, 6.5, 'black'), box(-3, 84, -3, 3, 88, 3, 'black', round=1), box(-6, 68, -6, 6, 70, 6, 'black'),
                     box(-.6, 70, -5.4, .6, 82, 5.4, 'black'), box(-5.4, 70, -.6, 5.4, 82, .6, 'black')],
    'mailbox': lambda: [box(-2.5, 0, -2.5, 2.5, 34, 2.5, 'wood'), box(-7, 32, -12, 7, 40, 12, 'black'), cyl(0, 40, -12, 7, 24, 'black', axis='z'),
                        box(7, 36, -2, 8.5, 50, 0, 'red'), box(7, 46, -2, 8.5, 50, 5, 'red')],
    'hydrant': lambda: [cyl(0, 0, 0, 6.5, 3, 'red'), cyl(0, 3, 0, 5, 16, 'red'), ball(0, 19, 0, 5.2, 'red'), cyl(0, 23, 0, 1.6, 3, 'red'),
                        cyl(-9, 12, 0, 2.2, 4.5, 'red', axis='x'), cyl(4.5, 12, 0, 2.2, 4.5, 'red', axis='x'), cyl(0, 11, 3.8, 2.6, 3.5, 'iron', axis='z')],
    'parkbench': lambda: [box(-28, 14, -6, 28, 16, 6, 'wood', pattern=['planks', 3, 'z']), box(-28, 18, -8, 28, 32, -6, 'wood', pattern=['planks', 4.5, 'y']),
                          box(-26, 0, -7, -23, 16, 5, 'iron'), box(23, 0, -7, 26, 16, 5, 'iron'), box(-26, 16, -8.5, -23, 30, -6.5, 'iron'), box(23, 16, -8.5, 26, 30, -6.5, 'iron')],
    'pumpkin': lambda: [ball(math.sin(k * .785) * 5.2, 7, math.cos(k * .785) * 5.2, 0, 'pump', rr=[5.4, 7, 5.4]) for k in range(8)] + [rod([0, 12, 0], [1.5, 17, 0], 1.6, 1.1, 'stem')],
    'pumpkin_b': lambda: [ball(math.sin(k * .785) * 4.6, 6, math.cos(k * .785) * 4.6, 0, 'pumpw', rr=[4.8, 6, 4.8]) for k in range(8)] + [rod([0, 10, 0], [1.2, 14, 0], 1.4, 1, 'stem')],
    'jack': lambda: [ball(math.sin(k * .785) * 5.2, 7, math.cos(k * .785) * 5.2, 0, 'pump', rr=[5.4, 7, 5.4]) for k in range(8)]
                    + [rod([0, 12, 0], [1.5, 17, 0], 1.6, 1.1, 'stem'),
                       box(-5, 8.5, 9.4, -2, 11, 10.6, 'fire'), box(2, 8.5, 9.4, 5, 11, 10.6, 'fire'), box(-4.5, 3, 9.6, 4.5, 5.5, 10.6, 'fire')],
    'mushroom': lambda: [cyl(-5, 0, 0, 2.6, 9, 'white'), ball(-5, 10, 0, 0, 'cap', rr=[7, 4.5, 7]), cyl(6, 0, 3, 2, 6, 'white'), ball(6, 6.5, 3, 0, 'cap', rr=[5, 3.4, 5]),
                         ball(-7, 13.6, 2, 1.3, 'white'), ball(-2.5, 13.2, 3, 1.1, 'white'), ball(7, 9.6, 5, 1, 'white')],
    'planter': lambda: [box(-20, 0, -10, 20, 14, 10, 'wood', pattern=['planks', 4.5, 'y']), box(-18, 12, -8, 18, 15, 8, 'soil')]
                       + [ball(-14 + i * 7, 18 + (i % 2) * 2, (-1) ** i * 2.5, 0, 'leaf' if i % 2 else 'flower', rr=[4, 3.6, 4], lumps=.6, lumpfreq=1.2) for i in range(5)],
    'bucket': lambda: [cyl(0, 0, 0, 8, 16, 'iron', flare=-2, topmat='water', top_at=.8), ring(0, 18, 0, 8, .7, 'iron')],
    'choppingblock': lambda: [cyl(0, 0, 0, 12, 14, 'wood', flare=2, topmat='grain', top_at=.75), rod([3, 14, 2], [14, 30, 5], 1.4, 1.2, 'wood'),
                              box(-1, 12, -1, 7, 18, 4, 'iron', round=.5)],
    'anvil': lambda: [cyl(0, 0, 0, 10, 8, 'wood', topmat='grain', top_at=.75), box(-6, 8, -5, 6, 14, 5, 'iron'), box(-12, 14, -6, 10, 20, 6, 'iron', round=.8),
                      rod([10, 17, 0], [18, 17.5, 0], 3.2, .8, 'iron')],
    'fence_h': lambda: [box(x - 2.5, 0, -2.5, x + 2.5, 22, 2.5, 'wood', round=.6) for x in (-32, 0, 32)]
                       + [box(-35, y, -1, 35, y + 4, 1.5, 'wood', pattern=['planks', 22, 'x', 1]) for y in (7, 15)],
    'fence_v': lambda: [box(-2.5, 0, z - 2.5, 2.5, 22, z + 2.5, 'wood', round=.6) for z in (-30, 0, 30)]
                       + [box(-1, y, -33, 1.5, y + 4, 33, 'wood') for y in (7, 15)],
    'picket_h': lambda: [box(x - 1.8, 0, -1, x + 1.8, 18 + (2 if (x // 6) % 2 else 0), 1, 'white', c=[x, 10, 0], planes=[[.7, .7, 0, 9.5 + (1.4 if (x // 6) % 2 else 0)], [-.7, .7, 0, 9.5 + (1.4 if (x // 6) % 2 else 0)]])
                         for x in range(-30, 31, 6)] + [box(-31, y, -2, 31, y + 2.5, -1, 'white') for y in (5, 13)],
    'stonewall': lambda: [box(-34, 0, -8, 34, 24, 8, 'stone', round=2, pattern=['bricks', 5], lumps=.8, lumpfreq=.5, stepdown=.85),
                          box(-35, 22, -9, 35, 27, 9, 'stone', round=2, lumps=.6, lumpfreq=.6, stepdown=.85)],
    'hedge': lambda: [box(-34, 0, -10, 34, 30, 10, 'hedge', round=6, lumps=1.6, lumpfreq=.7, lumps2=.8, lumpfreq2=1.4, stepdown=.75)],
    'grave_0': lambda: [box(-14, 0, -5, 14, 24, 5, 'stone'), cyl(0, 24, -5, 14, 10, 'stone', axis='z'), box(-16, 0, -6, 16, 3, 7, 'stone'),
                        box(-1, 14, 5, 1, 30, 5.6, 'black'), box(-6, 23, 5, 6, 25, 5.6, 'black')],
    'grave_1': lambda: [box(-9, 0, -4, 9, 14, 4, 'stone'), cyl(0, 14, -4, 9, 8, 'stone', axis='z'), box(-4, 12, 4, 4, 13.5, 4.6, 'black')],
    'memorial': lambda: [box(-22, 0, -14, 22, 6, 14, 'stone', pattern=['bricks', 3]), box(-14, 6, -10, 14, 14, 10, 'stone'),
                         box(-8, 14, -6, 8, 86, 6, 'stone', planes=[[1, .06, 0, 7.4], [-1, .06, 0, 7.4]], c=[0, 50, 0]),
                         box(-8, 86, -6, 8, 100, 6, 'stone', c=[0, 86, 0], planes=[[.8, .6, 0, 6.4], [-.8, .6, 0, 6.4], [0, .6, .8, 4.8], [0, .6, -.8, 4.8]]),
                         box(-5, 26, 6, 5, 40, 7, 'paper')],
    'signpost': lambda: [box(-2.5, 0, -2.5, 2.5, 46, 2.5, 'wood'), box(-2, 36, 2, 22, 43, 3.5, 'wood', planes=[[.7, .7, 0, 23], [.7, -.7, 0, 23]], c=[0, 39.5, 2.8]),
                         box(-22, 26, 2, 2, 33, 3.5, 'wood', planes=[[-.7, .7, 0, 23], [-.7, -.7, 0, 23]], c=[0, 29.5, 2.8])],
    'phone_booth': lambda: [box(-14, 0, -14, 14, 3, 14, 'iron'), box(-13, 3, -13, 13, 62, 13, 'glass', pattern=['glint', 30]),
                            box(-14, 3, -14, -11, 64, 14, 'blue'), box(11, 3, -14, 14, 64, 14, 'blue'), box(-14, 3, 11, 14, 9, 14, 'blue'),
                            box(-14, 54, 11, 14, 64, 14, 'blue'), box(-15, 64, -15, 15, 68, 15, 'blue'), box(-9, 56, 13.8, 9, 62, 14.6, 'lamp')],
    'birdbath': lambda: [cyl(0, 0, 0, 7, 3, 'stone'), cyl(0, 3, 0, 3, 24, 'stone'), cyl(0, 27, 0, 12, 4, 'stone', flare=-3, topmat='water', top_at=.8)],
    'fountain': lambda: [cyl(0, 0, 0, 50, 4, 'stone'), ring(0, 9, 0, 0, 0, 'stone') if False else cyl(0, 4, 0, 47, 12, 'stone', pattern=['bricks', 4]),
                         cyl(0, 15, 0, 44, 1.5, 'water'), cyl(0, 4, 0, 6, 34, 'stone'), cyl(0, 38, 0, 16, 4, 'stone', flare=-4, topmat='water', top_at=.8),
                         cyl(0, 42, 0, 3, 14, 'stone'), ball(0, 58, 0, 4, 'stone')],
    'well': lambda: [cyl(0, 0, 0, 22, 18, 'stone', pattern=['bricks', 4], topmat='stone', top_at=.9), cyl(0, 17.5, 0, 17, 1, 'water'),
                     box(-24, 0, -2.5, -19, 56, 2.5, 'wood'), box(19, 0, -2.5, 24, 56, 2.5, 'wood'), cyl(-22, 46, 0, 1.6, 44, 'wood', axis='x'),
                     box(-30, 54, -16, 30, 70, 16, 'dkwood', c=[0, 62, 0], planes=[[0, .8, .6, 6.4], [0, .8, -.6, 6.4]], pattern=['bricks', 4]),
                     rod([0, 46, 0], [0, 30, 0], .5, .5, 'rope'), cyl(0, 24, 0, 4.5, 7, 'wood', flare=-1)],
}


def make(name):
    parts = PROPS[name]()
    used = []
    for p in parts:
        for m in (p['mat'], p.get('topmat')):
            if m and m not in used: used.append(m)
    mats, pal, k = {}, {}, 0
    for m in used:
        d = MATDEF.get(m, {}); ramp = RAMPS[m]; ch = POOL[k:k + len(ramp)]; k += len(ramp)
        mats[m] = {'chars': ch, 'ambient': d.get('ambient', .24), 'shade': .5, 'bevel': m in ('wood', 'dkwood', 'stone', 'iron', 'white', 'blue', 'black')}
        if 'emit' in d: mats[m]['emit'] = d['emit']
        if d.get('glow'): mats[m]['glow'] = True
        pal.update(dict(zip(ch, ramp)))
    pal['s'] = SHADOW
    xs = [abs(v) for p in parts for key in ('min', 'max', 'c') for v in ([p[key][0], p[key][2]] if key in p else [])] + [40]
    ys = [v for p in parts for key in ('max', 'c') for v in ([p[key][1]] if key in p else [])] + [p['c'][1] + p.get('h', 0) for p in parts if p['type'] == 'cylinder']
    Wd = int(2 * max(xs) + 60); Hd = int(max(ys) + 70)
    scene = {'size': [Wd, Hd], 'origin': [Wd // 2, Hd - 30], 'elev': 30, 'materials': mats, 'palette': pal, 'shapes': parts, 'gamma': 1.12,
             'shadow_light': [-.13, 1, -.12], 'light': [-.4, 1.0, .5]}
    sp = os.path.join(GEN, name); json.dump(scene, open(sp + '.json', 'w'))
    fin = {'name': name, 'anchor': [Wd // 2, Hd - 30], 'leaf': '', 'bark': '', 'palette': pal, 'outline': ['#140e12', '#2e2226'], 'min_cluster': 3,
           'tips': False, 'tufts': False, 'deep_edge': False}
    json.dump(fin, open(sp + '_finish.json', 'w'))
    subprocess.run([sys.executable, os.path.join(HERE, 'blockout.py'), sp + '.json', sp], check=True, capture_output=True)
    subprocess.run([sys.executable, os.path.join(HERE, 'finish.py'), sp + '.grid.txt', sp + '.pxg', sp + '_finish.json'], check=True, capture_output=True)
    subprocess.run([sys.executable, os.path.join(HERE, 'grid.py'), 'build', sp + '.pxg', OUT], check=True, capture_output=True)
    from PIL import Image
    p = os.path.join(OUT, name + '.png'); im = Image.open(p); bb = im.getbbox()
    im = im.crop((bb[0] - 1, bb[1] - 1, bb[2] + 1, bb[3] + 1)); im.save(p)
    return p, Wd // 2 - bb[0] + 1, Hd - 30 - bb[1] + 1, im.size


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    for name in PROPS:
        if args and name not in args: continue
        p, ax, ay, size = make(name); print(name, size, 'anchor', ax, ay, flush=True)
        if '--install' in sys.argv: install(name, p, ax, ay, size)
