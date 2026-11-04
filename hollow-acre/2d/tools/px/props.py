import sys, json
sys.path.insert(0, '.')
from run import run
PROPS = {  # name: (kind, w, h, night_variant)
  'fence_h': ('fence_h', 72, 24, False), 'fence_v': ('fence_v', 14, 68, False),
  'picket_h': ('picket_h', 64, 25, False), 'picket_v': ('picket_v', 14, 68, False),
  'lamp': ('lamp', 16, 82, True), 'phone_booth': ('booth', 34, 70, True), 'board': ('board', 64, 58, False),
  'gas_pump': ('pump', 30, 76, True), 'signpost': ('signpost', 40, 46, False), 'barrel': ('barrel', 30, 34, False),
  'crate': ('crate', 30, 32, False), 'hay': ('hay', 46, 36, False), 'sacks': ('sacks', 36, 32, False),
  'cart': ('cart', 84, 56, False), 'firewood': ('firewood', 42, 30, False), 'well': ('well', 64, 74, False), 'rock_0': ('rock', 22, 18, False), 'rock_1': ('rock', 30, 22, False), 'weeds_0': ('weeds', 22, 18, False), 'weeds_1': ('weeds', 22, 18, False), 'twig': ('twig', 24, 12, False), 'ore_stone': ('ore', 24, 20, False), 'ore_copper': ('ore', 24, 20, False), 'ore_iron': ('ore', 26, 22, False), 'ore_coal': ('ore', 24, 20, False), 'ore_gem': ('ore', 22, 18, False), 'ladder': ('ladder', 20, 34, False),
}
only = sys.argv[1:] or list(PROPS)
for n in only:
    k, w, h, nv = PROPS[n]
    for night in ([False, True] if nv else [False]):
        nm = n + ('_n' if night else '')
        print(nm, run('props.js', dict(name=nm, kind=k, w=w, h=h, night=night, seed=len(n), v=int(n[-1]) if n[-1].isdigit() else 0, ore=n.split('_')[1] if n.startswith('ore_') else None), (w, h)))
