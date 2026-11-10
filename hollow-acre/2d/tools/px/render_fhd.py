"""Render the hand-drawn cabin furniture (furn_hd.js): python3 render_fhd.py [kind ...] -> out/hd_<kind>_<view>.png"""
import sys
from run import run
SZ = {'bookcase': {'S': (52, 82), 'E': (25, 82), 'N': (52, 82)}, 'desk': {'S': (58, 56), 'E': (34, 82), 'N': (58, 56), 'W': (34, 82)},
      'table': {'S': (56, 50), 'E': (36, 62), 'N': (56, 50)}, 'clock': {'S': (20, 62), 'E': (16, 62), 'N': (20, 62)},
      'keg': {'S': (40, 32), 'E': (30, 50), 'N': (40, 32), 'W': (30, 50)}, 'cradle': {'S': (38, 34), 'E': (28, 54), 'W': (28, 54), 'N': (38, 34)},
      'piano': {'S': (72, 58), 'E': (44, 100), 'N': (72, 58)}, 'chess': {'S': (44, 44), 'E': (44, 44), 'N': (44, 44)},
      'globe': {'S': (24, 34), 'E': (24, 34), 'N': (24, 34)}, 'candles': {'S': (28, 46), 'E': (22, 46)}, 'lamp': {'S': (22, 42)},
      'crates': {'S': (46, 40), 'E': (46, 40), 'N': (46, 40), 'W': (46, 40)}, 'jars': {'S': (52, 87), 'E': (18, 121), 'N': (52, 87)},
      'rocker': {'S': (32, 48), 'E': (44, 46), 'N': (32, 48)},
      'rug': {'S': (84, 52), 'R': (52, 84)},
      'wardrobe': {'S': (56, 100)}, 'cabinet': {'S': (46, 92)}, 'stove': {'S': (44, 58)}, 'counter': {'S': (100, 48)}, 'kcounter': {'S': (76, 52)},
      'cans': {'S': (64, 82)}, 'mail': {'S': (64, 70)}, 'parts': {'S': (64, 82)},
      'filecab': {'S': (28, 52)}, 'schooldesk': {'S': (30, 36)}, 'stool': {'S': (24, 30)}, 'pew': {'S': (124, 46), 'N': (124, 46)}, 'toolbox': {'S': (36, 44)}, 'coffin': {'S': (40, 66)},
      'barrel': {'S': (30, 34)}, 'crate': {'S': (30, 32)}, 'sacks': {'S': (36, 36)}, 'hay': {'S': (46, 36)}, 'firewood': {'S': (42, 30)}, 'choppingblock': {'S': (40, 40)}, 'bucket': {'S': (22, 26)}, 'anvil': {'S': (36, 28)},
      'mailbox': {'S': (32, 46)}, 'trashcan': {'S': (22, 32)}, 'drum': {'S': (22, 32)}, 'tyres': {'S': (30, 34)}, 'lumber': {'S': (48, 26)}, 'ladder': {'S': (20, 36)},
      'signpost': {'S': (40, 46)}, 'lamp_st': {'S': (16, 82)}, 'parkbench': {'S': (62, 44)}, 'planter': {'S': (44, 34)}, 'birdbath': {'S': (30, 40)}, 'board': {'S': (64, 58)},
      'well': {'S': (64, 74)}, 'cart': {'S': (84, 56)}, 'hydrant': {'S': (20, 30)},
      'mirror': {'S': (22, 32)}, 'painting_a': {'S': (36, 26)}, 'painting_b': {'S': (30, 34)}, 'calendar': {'S': (26, 34)}, 'photowall': {'S': (46, 32)}, 'coatpegs': {'S': (48, 44)},
      'poster_lost': {'S': (30, 40)}, 'poster_fair': {'S': (30, 40)}, 'poster_seeds': {'S': (30, 40)}, 'hangplant': {'S': (30, 40)}, 'plant': {'S': (34, 48)}, 'plant2': {'S': (40, 78)},
      'sawhorse': {'S': (64, 40)}, 'chickcrate': {'S': (46, 34)}, 'feedbins': {'S': (96, 46)}, 'mailsacks': {'S': (36, 30)}, 'produce': {'S': (96, 64)}, 'seedrack': {'S': (46, 76)},
      'tank': {'S': (66, 50)}, 'toolwall': {'S': (80, 46)}, 'saddle': {'S': (46, 46)}, 'shovels': {'S': (34, 58)}, 'rods': {'S': (32, 64)}, 'bar': {'S': (110, 52)}, 'hearth': {'S': (60, 88)}, 'altar': {'S': (76, 64)}, 'blackboard': {'S': (72, 46)}, 'candycase': {'S': (70, 58)}, 'chairstack': {'S': (44, 70)}, 'bottles': {'S': (30, 22)}, 'papers': {'S': (40, 22)}, 'knit': {'S': (22, 22)}, 'drawings': {'S': (84, 54)}, 'mapboard': {'S': (56, 40)}, 'sign_open': {'S': (40, 26)}, 'fishmount': {'S': (54, 26)}, 'netwall': {'S': (60, 36)}, 'lures': {'S': (46, 40)}, 'cat': {'S': (40, 28)}, 'forgehearth': {'S': (92, 110)}, 'quench': {'S': (60, 34)}, 'grindstone': {'S': (46, 50)}, 'hoist': {'S': (40, 70)}, 'lathe': {'S': (76, 50)}, 'cellar': {'S': (42, 30)}, 'trapdoor': {'S': (46, 34)}, 'indrum': {'S': (24, 36)}, 'drum_blue': {'S': (24, 36)}, 'tbooks': {'S': (22, 14)}, 'tcandle': {'S': (12, 18)}, 'tlamp': {'S': (16, 22)}, 'tmug': {'S': (16, 14)}, 'tplate': {'S': (20, 12)}, 'tvase': {'S': (24, 28)}, 'wboat': {'S': (80, 36)}, 'wrack': {'S': (70, 60)}, 'wrope': {'S': (26, 16)}, 'wtrap': {'S': (32, 24)}, 'wstall': {'S': (92, 84)}, 'wbell': {'S': (64, 104)}, 'rumple': {'S': (56, 40)}, 'stain': {'S': (60, 30)}, 'innporch': {'S': (216, 118)}, 'innrail': {'S': (216, 26)}, 'innsteps': {'S': (40, 30)}, 'innstoop': {'S': (44, 26)}, 'wnets': {'S': (78, 66)}, 'wlamp': {'S': (28, 86)}, 'fenceh': {'S': (72, 24)}, 'fencev': {'S': (14, 68)}, 'pickh': {'S': (64, 25)}, 'pickv': {'S': (14, 68)}}
NIGHT = {'wlamp', 'tlamp', 'desk', 'table', 'candles', 'lamp', 'stove', 'lamp_st', 'mirror'}
kinds = sys.argv[1:] or list(SZ)
for k in kinds:
    for v, (w, h) in SZ[k].items():
        run('furn_hd.js', {'name': f'hd_{k}_{v}', 'w': w, 'h': h, 'kind': k, 'view': v}, (w, h))
        if v == 'S' and k in NIGHT: run('furn_hd.js', {'name': f'hd_{k}_S_night', 'w': w, 'h': h, 'kind': k, 'view': v, 'night': 1}, (w, h))
    print('rendered', k)
