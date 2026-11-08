import sys, json
sys.path.insert(0, '.')
from run import run
ROOMS = {
  'cabin':  dict(w=9, d=6, door=4.5, theme='cabin', windows=[[2, 0], [7, 0]]),
  # ---- the shops, each its own room now, with a door at the back to where the keeper lives
  'shop_store2': dict(w=13, d=8, door=6.5, theme='store', windows=[[1.6, 0], [4.6, 0], [8.4, 0], [11.4, 0]], doors=[[6.5, 'bark']], mat='red'),
  'shop_garage2': dict(w=12, d=7, door=6.8, theme='garage', windows=[[4.2, 0, 30, 8, 26]], doors=[[11.3, 'slate']]),
  'shop_forge2': dict(w=11, d=7, door=6.8, theme='home', wall='plaster', paper='slate', floor='flag', wains='none', windows=[[2, 0], [5, 0]], doors=[[9.6, 'bark']], mat='rust'),
  'shop_carp2': dict(w=11, d=7, door=4, theme='home', wall='panel', floor='wide', windows=[[2, 0], [6, 0]], doors=[[9.6, 'bark']], mat='mustard'),
  'shop_feed2': dict(w=11, d=7, door=4, theme='home', wall='log', floor='planks', windows=[[2, 0], [6, 0]], doors=[[9.6, 'bark']], mat='sage'),
  'shop_bait2': dict(w=9, d=6, door=4, theme='home', wall='panel', floor='painted', paint='blue', windows=[[2, 0], [6, 0]], mat='blue'),
  'shop_lusk2': dict(w=10, d=6, door=6.8, theme='home', wall='plaster', paper='mustard', floor='checker', chk='red', windows=[[3.6, 0], [8.0, 0]], doors=[[9.3, 'red']], mat='red'),
  'shop_harlow2': dict(w=14, d=8, door=6.5, theme='home', wall='damask', paper='red', floor='parquet', wains='bead', windows=[[1.6, 0], [4.6, 0], [9.4, 0]], doors=[[12.9, 'bark']], mat='mustard'),
  # ---- where the keepers live
  'priv_store': dict(w=7, d=5, door=3.5, theme='home', wall='stripe', paper='rust', floor='parquet', windows=[[2, 0], [5.2, 0]], mat='rust'),
  'priv_garage': dict(w=7, d=5, door=3.5, theme='home', wall='panel', floor='wide', windows=[[5.4, 0]], mat='slate'),
  'priv_forge': dict(w=7, d=5, door=3.5, theme='home', wall='log', floor='flag', windows=[[2, 0]], mat='rust'),
  'priv_carp': dict(w=7, d=5, door=3.5, theme='home', wall='panel', floor='wide', windows=[[3.5, 0]], mat='mustard'),
  'priv_feed': dict(w=7, d=5, door=3.5, theme='home', wall='log', floor='planks', windows=[[2, 0], [5, 0]], mat='sage'),
  'priv_lusk': dict(w=7, d=5, door=3.5, theme='home', wall='plaster', paper='mustard', floor='checker', chk='red', windows=[[5.2, 0]], mat='red'),
  'priv_harlow': dict(w=7, d=5, door=3.5, theme='home', wall='damask', paper='red', floor='parquet', wains='bead', windows=[[2, 0], [5, 0]], mat='curtain'),
  'priv_ashby': dict(w=7, d=5, door=3.5, theme='home', wall='stripe', paper='blue', floor='checker', chk='blue', windows=[[2, 0], [5, 0]], mat='blue'),
  'cabin0': dict(w=6, d=6, door=3, theme='cabin', windows=[[1.4, 0], [4.6, 0]]),
  'cabin0m': dict(w=6, d=6, door=3, theme='home', paper='mustard', windows=[[1.4, 0], [4.6, 0]]),
  'cabin1': dict(w=9, d=6, door=4.5, theme='home', paper='mustard', windows=[[2, 0], [7, 0]]),
  'cabin2': dict(w=12, d=6, door=4.5, theme='home', paper='mustard', windows=[[2, 0], [7, 0], [10.5, 0]]),
  'store':  dict(w=13, d=8, door=6.5, theme='store', windows=[[1.6, 0], [4.6, 0], [8.4, 0], [11.4, 0]]),
  'home_rust': dict(w=8, d=6, door=4, theme='home', paper='rust', windows=[[2, 0], [6, 0]]),
  'home_blue': dict(w=8, d=6, door=4, theme='home', paper='blue', windows=[[2, 0], [6, 0]]),
  'home_sage': dict(w=8, d=6, door=4, theme='home', paper='sage', windows=[[2, 0], [6, 0]]),
  'church': dict(w=10, d=8, door=5, theme='church', windows=[[1.5, 0, 22, 8, 50], [3.8, 0, 22, 8, 50], [6.2, 0, 22, 8, 50], [8.5, 0, 22, 8, 50]]),
  'garage': dict(w=9, d=6, door=6.8, theme='garage', windows=[[2, 0, 30, 8, 26]]),
  'mine': dict(w=11, d=8, door=5.5, theme='mine', windows=[]),
  'greenhouse': dict(w=9, d=6, door=4.5, theme='glass', windows=[]),
  'home_agnes': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='damask', paper='rust', floor='painted', paint='slate', wains='bead', doors=[[8.35, 'bark']], mat='red'),
  'home_hale': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='panel', floor='parquet', doors=[[8.35, 'bark']], mat='curtain'),
  'home_dunn': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='plaster', paper='mustard', floor='wide', doors=[[8.35, 'slate']], mat='sage'),
  'home_cora': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='stripe', paper='sage', floor='checker', chk='sage', wains='bead', doors=[[8.35, 'teal']], mat='blue'),
  'home_june': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='stripe', paper='rust', floor='hex', doors=[[8.35, 'red']], mat='mustard'),
  'home_otto': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='panel', floor='wide', doors=[[8.35, 'teal']], mat='blue'),
  'home_silas': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='damask', paper='slate', floor='flag', doors=[[8.35, 'slate']], mat='red'),
  'home_quill': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='stripe', paper='sage', floor='planks', wains='bead', doors=[[8.35, 'sage']], mat='rust'),
  'home_fenn': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='plaster', floor='flag', doors=[[8.35, 'bark']], mat='mustard'),
  'home_thorne': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='log', floor='wide', doors=[[8.35, 'bark']], mat='rust'),
  'home_ashby': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='stripe', paper='blue', floor='checker', chk='blue', doors=[[8.35, 'slate']], mat='red'),
  'home_vale': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='damask', paper='sage', floor='hex', wains='bead', doors=[[8.35, 'sage']], mat='rust'),
  'home_kerrigan': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='panel', floor='painted', paint='rust', doors=[[8.35, 'bark']], mat='mustard'),
  'home_pike': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='log', floor='wide', doors=[[8.35, 'teal']], mat='blue'),
  'home_ward': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='plaster', paper='mustard', floor='parquet', doors=[[8.35, 'red']], mat='sage'),
}
FURN = {'bed': (56, 76), 'table': (56, 44), 'chair': (22, 38), 'stove': (44, 58), 'shelf_books': (52, 82, dict(goods='books')), 'shelf_jars': (52, 82, dict(goods='jars')),
  'shelf_cans': (64, 82, dict(goods='cans')), 'shelf_tools': (64, 66, dict(goods='tools', step=20)), 'shelf_parts': (64, 82, dict(goods='parts')), 'shelf_mail': (64, 70, dict(goods='mail', step=16)), 'rocker': (28, 44), 'cradle': (36, 30), 'piano': (72, 58), 'chess': (40, 44), 'blackboard': (72, 46), 'schooldesk': (30, 36), 'globe': (24, 34), 'mailsacks': (36, 30), 'netwall': (60, 36), 'rods': (32, 64), 'coffin': (40, 66), 'shovels': (34, 58), 'filecab': (28, 52), 'mapboard': (56, 40), 'photowall': (46, 32), 'knit': (22, 22), 'tires': (30, 40), 'drum': (24, 36), 'drum_blue': (24, 36, dict(blue=True)), 'toolbox': (36, 40), 'hoist': (40, 70), 'rug': (84, 52), 'counter': (100, 48), 'crates': (46, 40), 'pew': (124, 40),
  'kcounter': (76, 52), 'hearth': (60, 88), 'chairE': (22, 38), 'chairN': (22, 38), 'shelfE': (25, 104), 'shelfN': (52, 82), 'rug_r': (52, 84), 'altar': (76, 64), 'bench': (84, 62), 'cellar': (42, 30), 'mirror': (22, 32), 'clock': (20, 62), 'car': (124, 72), 'candles': (40, 24), 'desk': (58, 48), 'keg': (26, 32), 'rockS': (32, 48), 'rockE': (44, 46), 'rockN': (32, 48), 'oillamp': (22, 42)}
NIGHT = {'oillamp', 'hearth', 'table', 'stove', 'altar', 'candles', 'desk', 'mirror'}
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
    kind = 'drum' if n.startswith('drum') else 'rug' if n == 'rug_r' else n.split('_')[0]
    for night in ((False, True) if n in NIGHT else (False,)):
        nm = 'in_' + n + ('_n' if night else '')
        meta[nm] = run('interior.js', dict(dict(name=nm, kind=kind, w=w, h=h, night=night, seed=len(n)), **ex), (w, h)); print(nm, meta[nm])
old = {}
try: old = json.load(open('out/interior_meta.json'))
except Exception: pass
old.update(meta); json.dump(old, open('out/interior_meta.json', 'w'))
