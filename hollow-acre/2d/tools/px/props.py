import sys, json
sys.path.insert(0, '.')
from run import run
PROPS = {  # name: (kind, w, h, night_variant)
  'fence_h': ('fence_h', 72, 24, False), 'fence_v': ('fence_v', 14, 68, False),
  'picket_h': ('picket_h', 64, 25, False), 'picket_v': ('picket_v', 14, 68, False),
  'lamp': ('lamp', 16, 82, True), 'phone_booth': ('booth', 34, 70, True), 'board': ('board', 64, 58, False),
  'gas_pump': ('pump', 30, 76, True), 'signpost': ('signpost', 40, 46, False), 'barrel': ('barrel', 26, 30, False),
  'crate': ('crate', 27, 27, False), 'hay': ('hay', 46, 32, False), 'sacks': ('sacks', 34, 28, False),
  'cart': ('cart', 56, 36, False), 'well': ('well', 64, 74, False),
}
only = sys.argv[1:] or list(PROPS)
for n in only:
    k, w, h, nv = PROPS[n]
    for night in ([False, True] if nv else [False]):
        nm = n + ('_n' if night else '')
        print(nm, run('props.js', dict(name=nm, kind=k, w=w, h=h, night=night, seed=len(n)), (w, h)))
