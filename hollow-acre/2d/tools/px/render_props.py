"""Render the hand-drawn outdoor props (props_hd.js, spliced into furn_hd.js's kit):
python3 render_props.py [kind ...] -> out/hd_<kind>_S.png; then python3 install_fhd.py <kind>... installs them by SPR name."""
import os, sys
from run import run
D = os.path.dirname(os.path.abspath(__file__))
SZ = {'o_tyres': (40, 34), 'o_drum': (22, 32), 'o_crate': (30, 32), 'o_lumber': (48, 26), 'o_ladder': (28, 30), 'o_wheel': (46, 52),
      'o_firewood': (42, 30), 'o_trash': (22, 32), 'o_birdbath': (30, 40), 'o_signpost': (40, 46), 'o_hay': (46, 36), 'o_parkbench': (62, 44), 'o_pumpkin': (26, 22), 'o_clothesline': (112, 70), 'b_boot': (58, 40)}
src = open(os.path.join(D, 'furn_hd.js')).read().split('\n')
cut = next(i for i, l in enumerate(src) if l.startswith('const flat=flatten('))
builder = os.path.join(D, 'out', '_props_builder.js')
open(builder, 'w').write('\n'.join(src[:cut]) + '\n' + open(os.path.join(D, 'props_hd.js')).read() + '\n' + '\n'.join(src[cut:]))
for k in (sys.argv[1:] or list(SZ)):
    w, h = SZ[k]
    run(builder, {'name': f'hd_{k}_S', 'w': w, 'h': h, 'kind': k, 'view': 'S'}, (w, h))
    print('rendered', k)
