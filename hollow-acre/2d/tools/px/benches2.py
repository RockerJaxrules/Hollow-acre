"""Render the redrawn yard workbenches (benches2.js) and register them as objects."""
import sys, json, shutil
sys.path.insert(0, '.')
from run import run
from PIL import Image
B = {'bench_farm': (64, 64), 'bench_furn': (64, 62), 'bench_weapon': (64, 66), 'bench_armor': (72, 62), 'furnace': (48, 68), 'bench_brew': (64, 64), 'bench_press': (60, 66), 'bench_still': (68, 70)}
only = sys.argv[1:] or list(B)
objs = json.load(open('../spr/lpc/objects.json'))
for n in only:
    w, h = B[n]
    m = run('benches2.js', dict(name='b2_' + n, kind=n, w=w, h=h, seed=len(n)), (w, h))
    print(n, 'ok' if m else 'FAILED')
    shutil.copy(f'out/b2_{n}.png', f'../spr/lpc/obj/{n}.png')
    objs[n] = dict(src=f'spr/lpc/obj/{n}.png', fw=w, fh=h, ax=w / 2, ay=h - 3, foot=objs.get(n, {}).get('foot', [0, 0, 0, 0]))
json.dump(objs, open('../spr/lpc/objects.json', 'w'), indent=0)
