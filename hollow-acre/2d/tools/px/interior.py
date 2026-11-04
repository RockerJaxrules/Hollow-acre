import sys, json
sys.path.insert(0, '.')
from run import run
ROOMS = {
  'cabin':  dict(w=9, d=6, door=4.5, theme='cabin', windows=[[2, 0], [7, 0]]),
  'store':  dict(w=9, d=6, door=4.5, theme='store', windows=[[1.4, 0], [7.6, 0]]),
  'church': dict(w=10, d=8, door=5, theme='church', windows=[[1.5, 0, 22, 8, 50], [3.8, 0, 22, 8, 50], [6.2, 0, 22, 8, 50], [8.5, 0, 22, 8, 50]]),
  'garage': dict(w=9, d=6, door=6.8, theme='garage', windows=[[2, 0, 30, 8, 26]]),
  'mine': dict(w=11, d=8, door=5.5, theme='mine', windows=[]),
  'greenhouse': dict(w=9, d=6, door=4.5, theme='glass', windows=[]),
}
FURN = {'bed': (56, 76), 'table': (56, 44), 'chair': (22, 38), 'stove': (44, 58), 'shelf_books': (52, 82, dict(goods='books')), 'shelf_jars': (52, 82, dict(goods='jars')),
  'shelf_cans': (64, 82, dict(goods='cans')), 'shelf_tools': (64, 66, dict(goods='tools', step=20)), 'rug': (84, 52), 'counter': (100, 48), 'crates': (46, 40), 'pew': (124, 40),
  'altar': (76, 64), 'bench': (84, 62), 'cellar': (42, 30), 'mirror': (22, 32), 'clock': (20, 62), 'car': (124, 72), 'candles': (40, 24), 'desk': (58, 48), 'keg': (26, 32)}
NIGHT = {'table', 'stove', 'altar', 'candles', 'desk', 'mirror'}
only = sys.argv[1:]; meta = {}
for n, r in ROOMS.items():
    if only and n not in only and 'rooms' not in only: continue
    W, H = r['w'] * 32 + 24, 100 + r['d'] * 32 + 12
    for night in (False, True):
        nm = 'room_' + n + ('_n' if night else '')
        meta[nm] = run('interior.js', dict(name=nm, kind='room', w=W, h=H, room=r, night=night, seed=len(n)), (W, H)); meta[nm]['room'] = r; print(nm, meta[nm])
for n, spec in FURN.items():
    if only and n not in only and 'furn' not in only: continue
    w, h = spec[0], spec[1]; ex = spec[2] if len(spec) > 2 else {}
    kind = n.split('_')[0]
    for night in ((False, True) if n in NIGHT else (False,)):
        nm = 'in_' + n + ('_n' if night else '')
        meta[nm] = run('interior.js', dict(dict(name=nm, kind=kind, w=w, h=h, night=night, seed=len(n)), **ex), (w, h)); print(nm, meta[nm])
old = {}
try: old = json.load(open('out/interior_meta.json'))
except Exception: pass
old.update(meta); json.dump(old, open('out/interior_meta.json', 'w'))
