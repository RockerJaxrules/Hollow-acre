"""Render the hand-drawn cabin furniture (furn_hd.js): python3 render_fhd.py [kind ...] -> out/hd_<kind>_<view>.png"""
import sys
from run import run
SZ = {'bookcase': {'S': (52, 82), 'E': (25, 82), 'N': (52, 82)}, 'desk': {'S': (58, 48), 'E': (32, 84), 'N': (58, 48)},
      'table': {'S': (56, 44), 'E': (36, 62), 'N': (56, 44)}, 'clock': {'S': (20, 62), 'E': (16, 62), 'N': (20, 62)},
      'keg': {'S': (40, 32), 'E': (30, 32), 'N': (40, 32)}, 'cradle': {'S': (38, 34), 'E': (26, 38), 'W': (26, 38), 'N': (38, 34)},
      'piano': {'S': (72, 58), 'E': (56, 100), 'N': (72, 58)}, 'chess': {'S': (44, 44), 'E': (44, 44), 'N': (44, 44)},
      'globe': {'S': (24, 34), 'E': (24, 34), 'N': (24, 34)}, 'candles': {'S': (28, 46), 'E': (22, 46)}, 'lamp': {'S': (22, 42)}}
NIGHT = {'desk', 'table', 'candles', 'lamp'}
kinds = sys.argv[1:] or list(SZ)
for k in kinds:
    for v, (w, h) in SZ[k].items():
        run('furn_hd.js', {'name': f'hd_{k}_{v}', 'w': w, 'h': h, 'kind': k, 'view': v}, (w, h))
        if v == 'S' and k in NIGHT: run('furn_hd.js', {'name': f'hd_{k}_S_night', 'w': w, 'h': h, 'kind': k, 'view': v, 'night': 1}, (w, h))
    print('rendered', k)
