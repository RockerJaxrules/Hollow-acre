"""Render only the turned views of the hand-drawn stations (benches2.js): python3 render_b2views.py [name ...] -> out/b2_<name>_E/_N.png"""
import sys
from run import run
E = {'bench_farm': (44, 76), 'bench_furn': (44, 96), 'bench_weapon': (48, 100), 'bench_armor': (52, 104), 'furnace': (40, 68)}
N = {'bench_farm': (64, 64), 'bench_furn': (64, 62), 'bench_weapon': (64, 66), 'bench_armor': (72, 62), 'furnace': (48, 68)}
for n in sys.argv[1:] or list(E):
    for v, sz in (('E', E[n]), ('N', N[n])) + ((('W', E[n]),) if n in ('bench_armor', 'bench_furn', 'bench_weapon') else ()):
        m = run('benches2.js', dict(name=f'b2_{n}_{v}', kind=n, w=sz[0], h=sz[1], seed=len(n), view=v), sz)
        print(n, v, 'ok' if m else 'FAILED')
