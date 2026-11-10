"""Render the hand-drawn cabin furniture (furn_hd.js): python3 render_fhd.py [kind ...] -> out/hd_<kind>_<view>.png"""
import sys
from run import run
SZ = {'bookcase': {'S': (52, 82), 'E': (25, 82), 'N': (52, 82)}, 'desk': {'S': (58, 56), 'E': (34, 82), 'N': (58, 56)},
      'table': {'S': (56, 50), 'E': (36, 62), 'N': (56, 50)}, 'clock': {'S': (20, 62), 'E': (16, 62), 'N': (20, 62)},
      'keg': {'S': (40, 32), 'E': (30, 32), 'N': (40, 32), 'W': (30, 32)}, 'cradle': {'S': (38, 34), 'E': (26, 52), 'W': (26, 52), 'N': (38, 34)},
      'piano': {'S': (72, 58), 'E': (56, 100), 'N': (72, 58)}, 'chess': {'S': (44, 44), 'E': (44, 44), 'N': (44, 44)},
      'globe': {'S': (24, 34), 'E': (24, 34), 'N': (24, 34)}, 'candles': {'S': (28, 46), 'E': (22, 46)}, 'lamp': {'S': (22, 42)},
      'crates': {'S': (46, 40), 'E': (46, 40), 'N': (46, 40)}, 'jars': {'S': (52, 82), 'E': (25, 82), 'N': (52, 82)},
      'rocker': {'S': (32, 48), 'E': (44, 46), 'N': (32, 48)},
      'rug': {'S': (84, 52), 'R': (52, 84)},
      'wardrobe': {'S': (56, 100)}, 'cabinet': {'S': (46, 92)}, 'stove': {'S': (44, 58)}, 'counter': {'S': (100, 48)}, 'kcounter': {'S': (76, 52)},
      'cans': {'S': (64, 82)}, 'mail': {'S': (64, 70)}, 'parts': {'S': (64, 82)},
      'filecab': {'S': (28, 52)}, 'schooldesk': {'S': (30, 36)}, 'stool': {'S': (18, 30)}, 'pew': {'S': (124, 44)}, 'toolbox': {'S': (36, 44)}, 'coffin': {'S': (40, 66)}}
NIGHT = {'desk', 'table', 'candles', 'lamp', 'stove'}
kinds = sys.argv[1:] or list(SZ)
for k in kinds:
    for v, (w, h) in SZ[k].items():
        run('furn_hd.js', {'name': f'hd_{k}_{v}', 'w': w, 'h': h, 'kind': k, 'view': v}, (w, h))
        if v == 'S' and k in NIGHT: run('furn_hd.js', {'name': f'hd_{k}_S_night', 'w': w, 'h': h, 'kind': k, 'view': v, 'night': 1}, (w, h))
    print('rendered', k)
