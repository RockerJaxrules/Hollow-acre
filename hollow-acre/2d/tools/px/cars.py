"""Our own cars (no outside models): a 1980s sedan and the sheriff's cruiser, built from boxes and wheels in the
3D blockout (30-degree camera) and finished by finish.py. Replaces the sprites rendered from a downloaded car kit.

    python3 cars.py [names...] [--install]        (HA_BUILD=/build/copy installs into the build copy too)

car_east      7 frames, the intro drive: heading east, the nose swinging toward you (yaw 0 .. 0.9 rad)
car_beaten    the same sedan after the crash, dented and rusting, parked (frame sheet, frame 0 used)
car_wreck     nose-down in the ditch, crumpled, bits of trim on the road; car_wreck_n with its headlights still on
police        the sheriff's cruiser, angled; police_blocks: the cruiser up on cinder blocks in the garage, no wheels
"""
import sys, os, json, math, subprocess, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from nature import install, SHADOW
from blockprops import RAMPS, OUTLINE, POOL, box, cyl
GEN = os.path.join(HERE, 'blockouts', 'gen'); OUT = os.path.join(HERE, 'cars_gen'); os.makedirs(OUT, exist_ok=True)
S = 2.1   # model units -> pixels
RAMPS = dict(RAMPS)
RAMPS.update({
    'red':    ['#2a0e14', '#4e1820', '#7a2428', '#a43a32', '#c85a44'],
    'rust':   ['#2a1410', '#4a2418', '#6e3a1e', '#8e5428', '#a86e34'],
    'glass':  ['#121822', '#1e2a3e', '#2e4660', '#4e6e8a', '#86a2b6'],
    'chrome': ['#26262e', '#46485a', '#767a88', '#a8aeba', '#d6dae2'],
    'tire':   ['#0c0a0e', '#16141a', '#211e26', '#2c2832', '#38343e'],
    'lamp':   ['#6a6248', '#a89c70', '#d8cc98', '#f2e8bc', '#fffbe0'],
    'tail':   ['#3a0a10', '#6a1418', '#a42020', '#d83a30', '#ff6a50'],
    'black':  ['#0e0e14', '#1a1a22', '#272834', '#363848', '#4a4c5e'],
    'white':  ['#3a3a44', '#6a6a76', '#9c9ca6', '#c8c8ce', '#ececf0'],
    'lred':   ['#5a0a10', '#a01818', '#e02a2a', '#ff6a5a', '#ffb0a0'],
    'lblue':  ['#0a1a5a', '#1838a0', '#2a64e0', '#5a9aff', '#a0c8ff'],
    'block':  ['#2a2830', '#46424c', '#646068', '#868088', '#a69e9e'],
})


def wedge_planes(front=True):
    # windscreen / rear window slopes on the cabin box (cabin centre is (-2, 19.5, 0))
    return [[0.795, 0.606, 0, 7.3], [-0.868, 0.496, 0, 8.8]]


def sedan(paint='red', police=False, beaten=False, wheels=True, lights=False, crumple=0):
    P = []
    if crumple:   # the front end folded in the crash, the rest only dented
        P += [box(-32, 4, -13, 14, 15, 13, paint, round=3, lumps=.5, lumpfreq=.35, stepdown=.85),
              box(12, 3, -13.5, 30, 14, 13.5, paint, round=3, lumps=crumple * 1.6, lumpfreq=.2, stepdown=.7, seed=3,
                  planes=[[.55, 1, 0, 5.2], [.5, -1, .2, 6.5]])]   # big soft dents and a fold, never a dotted quilt
    else:
        P.append(box(-32, 4, -13, 32, 15, 13, paint, round=3))
    cab = box(-15, 14, -11.5, 11, 25, 11.5, 'glass', round=2, planes=wedge_planes())
    if beaten or crumple: cab.update(pattern=['bars', 5, 'x', 1])   # a crazed windscreen
    P.append(cab)
    P.append(box(-15, 23.4, -11.6, 11, 25.4, 11.6, 'white' if police else paint, round=.8, c=[-2, 19.5, 0],
                 planes=[[0.795, 0.606, 0, 7.6], [-0.868, 0.496, 0, 9.1]]))                               # roof, following the slopes
    P.append(box(-4, 14, -11.8, -2, 24.5, 11.8, paint))                                                    # B pillar
    for zs in (1, -1):   # A and C pillars: slabs along the slopes
        z0, z1 = (10.2, 11.8) if zs > 0 else (-11.8, -10.2)
        P.append(box(1, 14, z0, 11.6, 25, z1, paint, c=[-2, 19.5, 0], planes=[[0.795, 0.606, 0, 7.3], [-0.795, -0.606, 0, -5.7]]))
        P.append(box(-15.6, 14, z0, -6, 25, z1, paint, c=[-2, 19.5, 0], planes=[[-0.868, 0.496, 0, 8.8], [0.868, -0.496, 0, -7.2]]))
    if police:   # white doors and roof, a light bar, a push bar
        P.append(box(-15, 5.5, -13.15, 12, 14, 13.15, 'white', round=1))
        P += [box(-6, 25.6, -8, -2, 27.6, 0, 'lred'), box(-6, 25.6, 0, -2, 27.6, 8, 'lblue'),
              box(34, 4, -9, 36, 12, -7, 'chrome'), box(34, 4, 7, 36, 12, 9, 'chrome'), box(34.5, 6, -9, 35.5, 7.5, 9, 'chrome')]
    for x in (-20, 20):
        if wheels: P.append(cyl(x, 5.6, -13.4, 7.2, 26.8, 'tire', axis='z'))   # the dark wheel arch behind each wheel
        if wheels:
            P += [cyl(x, 5.6, 10.4, 5.6, 3.4, 'tire', axis='z'), cyl(x, 5.6, -13.8, 5.6, 3.4, 'tire', axis='z')]
            if not (beaten and x > 0): P.append(cyl(x, 5.6, 13.6, 3, .5, 'chrome', axis='z'))           # hubcap (one lost)
    P += [box(31.5, 4, -13.5, 34, 8.6, 13.5, 'chrome', round=1), box(-34, 4, -13.5, -31.5, 8.6, 13.5, 'chrome', round=1),
          box(32, 8.6, -6, 32.9, 12, 6, 'black')]                                                          # bumpers, grille
    for zs in (1, -1):
        P += [box(32, 9.4, 7 * zs if zs > 0 else -12, 33.2, 12.2, 12 if zs > 0 else -7, 'lamp_on' if lights else 'lamp'),
              box(-33.2, 10, 8 if zs > 0 else -12.5, -32, 13, 12.5 if zs > 0 else -8, 'tail'),
              box(-3.3, 5, 12.9 * zs if zs > 0 else -13.15, -2.7, 14.5, 13.15 if zs > 0 else -12.9, 'black'),   # door seams
              box(9.6, 5, 12.9 * zs if zs > 0 else -13.15, 10.2, 14.5, 13.15 if zs > 0 else -12.9, 'black'),
              box(5, 11.6, 12.9 if zs > 0 else -13.3, 7.5, 12.4, 13.3 if zs > 0 else -12.9, 'chrome'),            # handles
              box(-30, 10.6, 12.95 if zs > 0 else -13.2, 30, 11.2, 13.2 if zs > 0 else -12.95, 'chrome'),         # trim strip
              box(8, 15, 11.5 if zs > 0 else -14, 10, 17, 14 if zs > 0 else -11.5, paint)]                        # mirrors
    if beaten:   # rust patches and a dent
        from blockprops import ball
        P += [ball(-26, 9, 12.6, 0, 'rust', rr=[4, 2.5, 1]), ball(14, 6.5, 12.7, 0, 'rust', rr=[5, 1.8, 1]),
              ball(-8, 15.3, 0, 0, 'rust', rr=[3, .8, 4]), ball(26, 14.6, -4, 0, 'rust', rr=[3, .8, 3])]
    return [dict(p, **{k: [v * S for v in p[k]] for k in ('min', 'max', 'c') if k in p},
                 **({'r': p['r'] * S} if 'r' in p else {}), **({'h': p['h'] * S} if 'h' in p else {}),
                 **({'round': p['round'] * S} if 'round' in p else {}),
                 **({'planes': [pl[:3] + [pl[3] * S] for pl in p['planes']]} if 'planes' in p else {}),
                 **({'rr': [v * S for v in p['rr']]} if 'rr' in p else {})) for p in P]


def shift(parts, dx, dy=0):
    out = []
    for p in parts:
        q = dict(p)
        for k in ('min', 'max', 'c'):
            if k in q: q[k] = [q[k][0] + dx, q[k][1] + dy, q[k][2]]
        out.append(q)
    return out


def debris():
    from blockprops import ball
    return [dict(box(46, 0, 30, 58, 3, 36, 'chrome', round=1), world=True), dict(box(-50, 0, 40, -42, 4, 46, 'red', round=1), world=True),
            dict(ball(30, 1, 52, 0, 'glass', rr=[4, 1, 3]), world=True), dict(ball(-20, 1, 58, 0, 'glass', rr=[3, 1, 2]), world=True),
            dict(cyl(62, 5, 52, 5.6 * 2, 3 * 2, 'tire', axis='x'), world=True)]


MATDEF = {'lamp_on': {'ramp': 'lamp', 'emit': 3}, 'lred': {'emit': 2}, 'lblue': {'emit': 2}}
CARS = {
    'car_east':      dict(parts=lambda: sedan('red'), frames=[-f * .15 for f in range(7)], size=(180, 132), origin=(90, 96)),
    'car_beaten':    dict(parts=lambda: sedan('red', beaten=True), frames=[0.0], size=(180, 132), origin=(90, 96), sheet=7),
    'car_wreck':     dict(parts=lambda: shift(sedan('red', crumple=1.6), -33 * S, 3) + debris(), rot=dict(yaw=-62, pitch=-40, roll=8, pivot=[0, 0, 0]), size=(190, 190), origin=(95, 140)),
    'car_wreck_n':   dict(parts=lambda: shift(sedan('red', crumple=1.6, lights=True), -33 * S, 3) + debris(), rot=dict(yaw=-62, pitch=-40, roll=8, pivot=[0, 0, 0]), size=(190, 190), origin=(95, 140)),
    'police':        dict(parts=lambda: sedan('black', police=True), rot=dict(yaw=-150), size=(170, 140), origin=(85, 100), scale=.8),
    'police_blocks': dict(parts=lambda: [dict(p, **({'min': [p['min'][0], p['min'][1] + 7 * S, p['min'][2]], 'max': [p['max'][0], p['max'][1] + 7 * S, p['max'][2]]} if 'min' in p else {'c': [p['c'][0], p['c'][1] + 7 * S, p['c'][2]]})) for p in sedan('black', police=True, wheels=False)]
                          + [box(x * S - 4, 0, z * S - 4, x * S + 4, 7 * S + 1, z * S + 4, 'block') for x in (-20, 20) for z in (-10, 10)],
                          size=(170, 120), origin=(85, 92), scale=.8),
}


def render(name, cfg, yaw_extra=0.0):
    parts = cfg['parts']()
    if cfg.get('scale'):
        k = cfg['scale']
        parts = [dict(p, **{q: [v * k for v in p[q]] for q in ('min', 'max', 'c', 'rr') if q in p}, **{q: p[q] * k for q in ('r', 'h', 'round') if q in p},
                      **({'planes': [pl[:3] + [pl[3] * k] for pl in p['planes']]} if 'planes' in p else {})) for p in parts]
    used = []
    for p in parts:
        if p['mat'] not in used: used.append(p['mat'])
    mats, pal, k = {}, {}, 0
    for m in used:
        d = MATDEF.get(m, {}); ramp = RAMPS[d.get('ramp', m)]; ch = POOL[k:k + len(ramp)]; k += len(ramp)
        mats[m] = {'chars': ch, 'ambient': .2, 'shade': .55, 'bevel': m in (used[0], 'white', 'black', 'red')}
        if 'emit' in d: mats[m]['emit'] = d['emit']
        pal.update(dict(zip(ch, ramp)))
    pal['s'] = SHADOW
    W, H = cfg['size']; ox, oy = cfg['origin']
    rot = dict(cfg.get('rot', {})); rot['yaw'] = rot.get('yaw', 0) + math.degrees(yaw_extra)
    scene = {'size': [W, H], 'origin': [ox, oy], 'elev': 30, 'materials': mats, 'palette': pal, 'shapes': parts, 'gamma': 1.1,
             'shadow_light': [-.13, 1, -.12], 'light': [-.4, 1.0, .5], 'rotate': rot}
    sp = os.path.join(GEN, f'{name}_{int(yaw_extra * 100)}'); json.dump(scene, open(sp + '.json', 'w'))
    fin = {'name': name, 'anchor': [ox, oy], 'leaf': '', 'bark': '', 'palette': pal, 'outline': OUTLINE, 'min_cluster': 3,
           'tips': False, 'tufts': False, 'deep_edge': False}
    json.dump(fin, open(sp + '_finish.json', 'w'))
    subprocess.run([sys.executable, os.path.join(HERE, 'blockout.py'), sp + '.json', sp], check=True, capture_output=True)
    pxg = sp + '.pxg'
    subprocess.run([sys.executable, os.path.join(HERE, 'finish.py'), sp + '.grid.txt', pxg, sp + '_finish.json'], check=True, capture_output=True)
    bd = os.path.join(OUT, 'frames'); os.makedirs(bd, exist_ok=True)
    subprocess.run([sys.executable, os.path.join(HERE, 'grid.py'), 'build', pxg, bd], check=True, capture_output=True)
    from PIL import Image
    return Image.open(os.path.join(bd, name + '.png')).convert('RGBA')


def make(name):
    from PIL import Image
    cfg = CARS[name]; W, H = cfg['size']; ox, oy = cfg['origin']
    frames = cfg.get('frames')
    if frames is None:   # a single sprite: crop to the content, anchor follows
        im = render(name, cfg); bb = im.getbbox()
        im = im.crop((bb[0] - 1, bb[1] - 1, bb[2] + 1, bb[3] + 1)); p = os.path.join(OUT, name + '.png'); im.save(p)
        return p, ox - bb[0] + 1, oy - bb[1] + 1, im.size, None
    ims = [render(name, cfg, y) for y in frames]
    n = cfg.get('sheet', len(ims)); sheet = Image.new('RGBA', (W * n, H))
    for i in range(n): sheet.alpha_composite(ims[min(i, len(ims) - 1)], (i * W, 0))
    p = os.path.join(OUT, name + '.png'); sheet.save(p)
    return p, ox, oy, (W, H), {'yaw': {'S': [0, n]}}


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    for name in CARS:
        if args and not any(a == name for a in args): continue
        p, ax, ay, size, clips = make(name); print(name, size, 'anchor', ax, ay)
        if '--install' in sys.argv:
            install(name, p, ax, ay, size)
            if clips:   # frame sheets keep their clips
                for root in ['/'.join(HERE.split('/')[:-2])] + [r for r in os.environ.get('HA_BUILD', '').split(':') if r]:
                    mp = os.path.join(root, 'spr', 'lpc', 'objects.json'); M = json.load(open(mp)); M[name]['clips'] = clips; json.dump(M, open(mp, 'w'), indent=0)
