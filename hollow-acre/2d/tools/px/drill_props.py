"""Drill 12: a crate, a barrel and a lamp post through the blockout, then the material pass (propdetail.py); each one
is set beside the drawn sprite it has to beat.   python3 drill_props.py [names...] -> drills/props_v<N>.png
"""
import sys, os, json, math, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from blockprops import POOL, box, cyl, rod
import propdetail
GEN = os.path.join(HERE, 'blockouts', 'drills'); OUT = os.path.join(HERE, 'drills'); os.makedirs(GEN, exist_ok=True); os.makedirs(OUT, exist_ok=True)
GAME = os.path.abspath(os.path.join(HERE, '..', '..'))
RAMPS = {   # more contrast than the first try: near-black darks, warm lights
    'wood':  ['#1e100c', '#3e2414', '#68401f', '#94642f', '#c08b4c'],
    'dkwood': ['#140a08', '#2a170e', '#432616', '#5e3820', '#7a4c2c'],
    'brace': ['#4a2e16', '#6e4824', '#94683a', '#b88a52', '#d6a866'],
    'stave': ['#2a160e', '#5a3418', '#8e5e30', '#c08e50', '#e2b878'],
    'lid':   ['#2a180e', '#4e3018', '#7a5028', '#a2733e', '#c49456'],
    'iron':  ['#0a0a0e', '#16161c', '#24242c', '#383a44', '#6a6e7a'],
    'black': ['#08070a', '#121016', '#1c1a22', '#2a2732', '#3e3a48'],
    'glow':  ['#7a4a1a', '#c08030', '#e8b050', '#f8d880', '#fff4c8'],
}
DRILLS = {
    'crate': dict(parts=lambda: [box(-13, 0, -11, 13, 23, 11, 'wood', pattern=['planks', 6, 'y']),
                                 box(-13, 23, -11, 13, 25, 11, 'wood', pattern=['planks', 5, 'z']),
                                 box(-13.5, 0, 10.5, -10.5, 24, 11.6, 'dkwood'), box(10.5, 0, 10.5, 13.5, 24, 11.6, 'dkwood'),
                                 box(-13.5, 21, 10.5, 13.5, 24, 11.6, 'dkwood'), box(-13.5, 0, 10.5, 13.5, 3, 11.6, 'dkwood'),
                                 rod([-10, 3.5, 11.15], [10, 20.5, 11.15], 1.0, 1.0, 'brace'),
                                 dict(type='sphere', c=[-9.6, 4.2, 12.0], r=.7, mat='dkwood'), dict(type='sphere', c=[9.6, 19.8, 12.0], r=.7, mat='dkwood')],
                  elev=18, rules=[{'do': 'streaks', 'mat': 'wood', 'dir': 'h', 'every': 9, 'len': (2, 3), 'step': -1},
                         {'do': 'nails', 'mat': 'dkwood'}, {'do': 'grass'}]),
    'barrel': dict(parts=lambda: [dict(type='ellipsoid', c=[0, 14, 0], rr=[13.5, 19, 13.5], mat='stave', planes=[[0, 1, 0, 13.5], [0, -1, 0, 14]],
                                       pattern=['bars', 5, 'x', 1], topmat='lid', top_at=.7),
                                  dict(type='ellipsoid', c=[0, 14, 0], rr=[13.9, 19.4, 13.9], mat='iron', planes=[[0, 1, 0, -6.5], [0, -1, 0, 9]]),
                                  dict(type='ellipsoid', c=[0, 14, 0], rr=[13.9, 19.4, 13.9], mat='iron', planes=[[0, 1, 0, 9], [0, -1, 0, -6.8]])],
                   elev=18, rules=[{'do': 'litside', 'mats': ['stave', 'iron']}, {'do': 'streaks', 'mat': 'stave', 'dir': 'v', 'every': 11, 'len': (2, 4), 'step': 1},
                          {'do': 'streaks', 'mat': 'lid', 'dir': 'h', 'every': 7, 'len': (3, 5), 'step': -1},
                          {'do': 'rim', 'mat': 'iron'}, {'do': 'grass'}]),
    'lamp': dict(elev=18, parts=lambda: [box(-5, 0, -5, 5, 8, 5, 'black'), cyl(0, 8, 0, 1.9, 62, 'black')]
                               + [cyl(0, y, 0, 2.7, 1.3, 'black') for y in (22, 36, 50, 62)]
                               + [box(-6.5, 70, -6.5, 6.5, 72, 6.5, 'black'), box(-5.5, 72, -5.5, 5.5, 86, 5.5, 'glow'),
                                  box(-.7, 72, 5, .7, 86, 6, 'black'), box(-.7, 72, -6, .7, 86, -5, 'black'), box(-6, 72, -.7, -5, 86, .7, 'black'), box(5, 72, -.7, 6, 86, .7, 'black'),
                                  box(-6.5, 86, -6.5, 6.5, 88, 6.5, 'black'),
                                  box(-7, 88, -7, 7, 95, 7, 'black', c=[0, 88, 0], planes=[[.8, .6, 0, 5.6], [-.8, .6, 0, 5.6], [0, .6, .8, 5.6], [0, .6, -.8, 5.6]]),
                                  cyl(0, 94, 0, 1, 4, 'black')],
                 rules=[{'do': 'litside', 'mats': ['black']}, {'do': 'rim', 'mat': 'black'}, {'do': 'grass'}], glow=True),
}


def render(name):
    D = DRILLS[name]; parts = D['parts']()
    used = []
    for p in parts:
        for m in (p['mat'], p.get('topmat')):
            if m and m not in used: used.append(m)
    mats, pal, letters, k = {}, {}, {}, 0
    for m in used:
        ramp = RAMPS[m]; ch = POOL[k:k + len(ramp)]; k += len(ramp)
        mats[m] = {'chars': ch, 'ambient': .2, 'shade': .55}
        if m == 'glow': mats[m].update(emit=3, glow=True, ambient=1)
        pal.update(dict(zip(ch, ramp))); letters[m] = ch
    pal['s'] = '#32212599'
    W, H = 80, 130; scene = {'size': [W, H], 'origin': [W // 2, H - 20], 'elev': D.get('elev', 18), 'materials': mats, 'palette': pal, 'shapes': parts,
                             'gamma': 1.0, 'shadow_light': [-.13, 1, -.12], 'light': D.get('light', [-.55, .85, .85])}
    sp = os.path.join(GEN, name); json.dump(scene, open(sp + '.json', 'w'))
    fin = {'name': name, 'anchor': [W // 2, H - 20], 'leaf': '', 'bark': '', 'palette': pal, 'outline': ['#120a0c', '#1e1216'], 'min_cluster': 2,
           'tips': False, 'tufts': False, 'deep_edge': False}
    json.dump(fin, open(sp + '_finish.json', 'w'))
    subprocess.run([sys.executable, os.path.join(HERE, 'blockout.py'), sp + '.json', sp], check=True, capture_output=True)
    subprocess.run([sys.executable, os.path.join(HERE, 'finish.py'), sp + '.grid.txt', sp + '.pxg', sp + '_finish.json'], check=True, capture_output=True)
    propdetail.apply(sp + '.pxg', sp + '_d.pxg', D['rules'], letters)
    subprocess.run([sys.executable, os.path.join(HERE, 'grid.py'), 'build', sp + '_d.pxg', GEN], check=True, capture_output=True)
    from PIL import Image
    im = Image.open(os.path.join(GEN, name + '.png')).convert('RGBA'); bb = im.getbbox(); return im.crop(bb)


if __name__ == '__main__':
    from PIL import Image
    names = [a for a in sys.argv[1:]] or list(DRILLS)
    M = json.load(open(os.path.join(GAME, 'spr', 'lpc', 'objects.json')))
    pairs = []
    for n in names:
        new = render(n); old = Image.open(os.path.join(GAME, M[n]['src'])).convert('RGBA').crop((0, 0, M[n]['fw'], M[n]['fh']))
        w = old.width + new.width + 12; h = max(old.height, new.height) + 6
        c = Image.new('RGBA', (w, h), (74, 86, 52, 255)); c.alpha_composite(old, (3, h - old.height - 3)); c.alpha_composite(new, (old.width + 9, h - new.height - 3)); pairs.append(c)
    W = sum(p.width for p in pairs) + 8 * len(pairs); H = max(p.height for p in pairs)
    out = Image.new('RGBA', (W, H), (30, 30, 30, 255)); x = 0
    for p in pairs: out.alpha_composite(p, (x, H - p.height)); x += p.width + 8
    v = len([f for f in os.listdir(OUT) if f.startswith('props_v')]) + 1
    out.resize((W * 5, H * 5), Image.NEAREST).save(os.path.join(OUT, f'props_v{v}.png')); print(os.path.join(OUT, f'props_v{v}.png'))
