"""Furniture, props and decorations for Hollow Acre as 3D blockouts with four facings (owner: everything rotatable except
wall pieces or where it makes no sense; benches and furnaces too). Each piece is built once in model space, front toward
the viewer (+z), and turned by exact quarter turns: S (as built), E (its front to the right), N (its back to us). West is
the east view mirrored in the game. Same renderer and hand finish as blockprops.py.

    python3 furn3d.py [names...]          renders into furn3d_gen/png/<name>{,_e,_n}.png and furn3d_gen/meta.json
"""
import sys, os, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from blockprops import box, cyl, ball, ring, rod, RAMPS, OUTLINE, POOL, MATDEF
from nature import SHADOW
GEN = os.path.join(HERE, 'blockouts', 'gen_furn'); OUT = os.path.join(HERE, 'furn3d_gen'); os.makedirs(GEN, exist_ok=True); os.makedirs(os.path.join(OUT, 'png'), exist_ok=True)


def _rp(x, z, k):
    """a point (x, z) turned k quarter turns so the model's front (+z) swings to +x (east) at k=1"""
    for _ in range(k % 4): x, z = z, -x
    return x, z


def turn(parts, k):
    k %= 4
    if not k: return [dict(p) for p in parts]
    out = []
    for p in parts:
        q = dict(p); t = p['type']
        if t == 'box':
            (x0, y0, z0), (x1, y1, z1) = p['min'], p['max']
            a = _rp(x0, z0, k); b = _rp(x1, z1, k)
            q['min'] = [min(a[0], b[0]), y0, min(a[1], b[1])]; q['max'] = [max(a[0], b[0]), y1, max(a[1], b[1])]
        elif t == 'branch':
            for key in ('a', 'b'):
                x, z = _rp(p[key][0], p[key][2], k); q[key] = [x, p[key][1], z]
        else:
            x, z = _rp(p['c'][0], p['c'][2], k); q['c'] = [x, p['c'][1], z]
        odd = k % 2 == 1
        if odd and t == 'cylinder' and p.get('axis', 'y') in ('x', 'z'): q['axis'] = 'z' if p.get('axis') == 'x' else 'x'
        if odd and t == 'torus': q['axis'] = 'x' if p.get('axis', 'z') != 'x' else 'z'
        if odd and 'rr' in p: q['rr'] = [p['rr'][2], p['rr'][1], p['rr'][0]]
        if odd and p.get('pattern') and p['pattern'][0] == 'planks' and p['pattern'][2] in ('x', 'z'):
            pt = list(p['pattern']); pt[2] = 'z' if pt[2] == 'x' else 'x'; q['pattern'] = pt
        out.append(q)
    return out


from furn3d_pieces import PIECES   # name -> (builder, rotatable, canvas)


def render(name, parts, size, suffix=''):
    used = []
    for p in parts:
        if p['mat'] not in used: used.append(p['mat'])
    mats, pal, k = {}, {}, 0
    for m in used:
        d = MATDEF.get(m, {}); ramp = RAMPS[d.get('ramp', m)]; ch = POOL[k:k + len(ramp)]; k += len(ramp)
        mats[m] = {'chars': ch, 'ambient': d.get('ambient', .22), 'shade': .5, 'bevel': m not in ('fire', 'soot', 'leaf', 'cloth', 'glass')}
        if 'emit' in d: mats[m]['emit'] = d['emit']
        pal.update(dict(zip(ch, ramp)))
    pal['s'] = SHADOW
    Wd, Hd = size
    nm = name + suffix
    scene = {'size': [Wd, Hd], 'origin': [Wd // 2, Hd - 16], 'elev': 30, 'materials': mats, 'palette': pal, 'shapes': parts,
             'gamma': 1.15, 'shadow_light': [-.13, 1, -.12], 'light': [-.4, 1.0, .5]}
    sp = os.path.join(GEN, nm); json.dump(scene, open(sp + '.json', 'w'))
    fin = {'name': nm, 'anchor': [Wd // 2, Hd - 16], 'leaf': '', 'bark': '', 'palette': pal, 'outline': OUTLINE, 'min_cluster': 3,
           'tips': False, 'tufts': False, 'deep_edge': False}
    json.dump(fin, open(sp + '_finish.json', 'w'))
    subprocess.run([sys.executable, os.path.join(HERE, 'blockout.py'), sp + '.json', sp], check=True, capture_output=True)
    pxg = os.path.join(OUT, nm + '.pxg')
    subprocess.run([sys.executable, os.path.join(HERE, 'finish.py'), sp + '.grid.txt', pxg, sp + '_finish.json'], check=True, capture_output=True)
    bd = os.path.join(OUT, 'png')
    subprocess.run([sys.executable, os.path.join(HERE, 'grid.py'), 'build', pxg, bd], check=True, capture_output=True)
    from PIL import Image
    p = os.path.join(bd, nm + '.png'); im = Image.open(p); bb = im.getbbox(); ax, ay = Wd // 2, Hd - 16
    im = im.crop((max(0, bb[0] - 1), max(0, bb[1] - 1), min(im.width, bb[2] + 1), min(im.height, bb[3] + 1))); im.save(p)
    return p, ax - max(0, bb[0] - 1), ay - max(0, bb[1] - 1), im.size


def make(name):
    fn, rot, size = PIECES[name]; parts = fn(); meta = {}
    for k, suf in ((0, ''), (1, '_e'), (2, '_n'), (3, '_w')) if rot else ((0, ''),):
        p, ax, ay, sz = render(name, turn(parts, k), size, suf); meta[name + suf] = dict(ax=ax, ay=ay, w=sz[0], h=sz[1])
    return meta



if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    mp = os.path.join(OUT, 'meta.json'); M = json.load(open(mp)) if os.path.exists(mp) else {}
    for name in PIECES:
        if args and name not in args: continue
        m = make(name); M.update(m); print(name, m)
    json.dump(M, open(mp, 'w'), indent=0)
