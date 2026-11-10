"""Render the hand-drawn cabin furniture (furn_hd.js): python3 render_fhd.py [kind ...] -> out/hd_<kind>_<view>.png"""
import sys
from run import run
SZ = {'bookcase': {'S': (52, 82), 'E': (25, 82), 'N': (52, 82)}, 'desk': {'S': (58, 48), 'E': (40, 48), 'N': (58, 48)},
      'table': {'S': (56, 44), 'E': (36, 62), 'N': (56, 44)}, 'clock': {'S': (20, 62), 'E': (16, 62), 'N': (20, 62)},
      'keg': {'S': (30, 34), 'E': (34, 32), 'N': (30, 34)}, 'cradle': {'S': (38, 34), 'E': (26, 38), 'W': (26, 38), 'N': (38, 34)},
      'piano': {'S': (72, 58), 'E': (48, 58), 'N': (72, 58)}, 'chess': {'S': (44, 50), 'E': (44, 50), 'N': (44, 50)}}
NIGHT = {'desk', 'table'}
kinds = sys.argv[1:] or list(SZ)
for k in kinds:
    for v, (w, h) in SZ[k].items():
        run('furn_hd.js', {'name': f'hd_{k}_{v}', 'w': w, 'h': h, 'kind': k, 'view': v}, (w, h))
        if v == 'S' and k in NIGHT: run('furn_hd.js', {'name': f'hd_{k}_S_night', 'w': w, 'h': h, 'kind': k, 'view': v, 'night': 1}, (w, h))
    print('rendered', k)
