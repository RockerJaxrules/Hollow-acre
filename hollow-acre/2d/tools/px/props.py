import sys, json
sys.path.insert(0, '.')
from run import run
PROPS = {  # name: (kind, w, h, night_variant)
  'fence_h': ('fence_h', 72, 24, False), 'fence_v': ('fence_v', 14, 68, False),
  'picket_h': ('picket_h', 64, 25, False), 'picket_v': ('picket_v', 14, 68, False),
  'lamp': ('lamp', 16, 82, True), 'phone_booth': ('booth', 34, 70, True), 'board': ('board', 64, 58, False),
  'gas_pump': ('pump', 30, 76, True), 'signpost': ('signpost', 40, 46, False), 'barrel': ('barrel', 30, 34, False),
  'crate': ('crate', 30, 32, False), 'hay': ('hay', 46, 36, False), 'sacks': ('sacks', 36, 32, False),
  'cart': ('cart', 84, 56, False), 'firewood': ('firewood', 42, 30, False), 'well': ('well', 64, 74, False), 'rock_0': ('rock', 26, 22, False), 'rock_1': ('rock', 34, 28, False), 'weeds_0': ('weeds', 26, 22, False), 'weeds_1': ('weeds', 26, 22, False), 'twig': ('twig', 28, 16, False), 'stump_maple': ('stump', 30, 22, False), 'stump_pine': ('stump', 28, 22, False), 'stump_oak': ('stump', 30, 22, False), 'pumpkin': ('pumpkin', 26, 22, False), 'pumpkin_b': ('pumpkin', 24, 20, False), 'jack': ('pumpkin', 26, 22, False), 'jack_b': ('pumpkin', 26, 22, False), 'jack_c': ('pumpkin', 26, 22, False), 'deer_dead': ('deer', 64, 30, False), 'doornote': ('doornote', 10, 13, False), 'icon_hoe': ('icon', 20, 20, False), 'icon_can': ('icon', 20, 20, False), 'icon_pick': ('icon', 20, 20, False), 'icon_axe': ('icon', 20, 20, False), 'icon_seed': ('icon', 20, 20, False), 'icon_food': ('icon', 20, 20, False), 'ore_stone': ('ore', 28, 24, False), 'ore_copper': ('ore', 28, 24, False), 'ore_iron': ('ore', 30, 26, False), 'ore_coal': ('ore', 28, 24, False), 'ore_gem': ('ore', 26, 22, False), 'ladder': ('ladder', 20, 34, False),
}
STX = {'stump_maple': dict(r=6, bark=['#211712','#382720','#54392b','#71503a','#8f6b4d']), 'stump_pine': dict(r=5, resin=True, bark=['#1a0f0c','#2e1a14','#47281c','#5e3a28','#7a5038']),
       'stump_oak': dict(r=6, bark=['#2a160c','#3e2313','#62381c','#7c4b2c','#9a6a44']), 'pumpkin': dict(big=True), 'pumpkin_b': dict(pale=True), 'jack': dict(big=True, face=1), 'jack_b': dict(big=True, face=2), 'jack_c': dict(big=True, face=3)}
only = sys.argv[1:] or list(PROPS)
for n in only:
    k, w, h, nv = PROPS[n]
    for night in ([False, True] if nv else [False]):
        nm = n + ('_n' if night else '')
        print(nm, run('props.js', dict(name=nm, kind=k, w=w, h=h, night=night, seed=len(n), v=int(n[-1]) if n[-1].isdigit() else 0, ore=n.split('_')[1] if n.startswith('ore_') else None, icon=n.split('_')[1] if n.startswith('icon_') else None, **STX.get(n, {})), (w, h)))
