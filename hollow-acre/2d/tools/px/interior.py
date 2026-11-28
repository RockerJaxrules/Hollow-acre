import sys, json
sys.path.insert(0, '.')
from run import run
ROOMS = {
  'cabin':  dict(w=9, d=6, door=4.5, theme='cabin', windows=[[2, 0], [7, 0]]),
  # ---- the shops, each its own room now, with a door at the back to where the keeper lives
  'shop_store2': dict(w=13, d=8, door=6.5, theme='store', windows=[[1.6, 0], [4.6, 0], [8.4, 0], [11.4, 0]], doors=[[6.5, 'bark']], mat='red'),
  'shop_garage2': dict(w=12, d=7, door=6.8, theme='garage', windows=[[4.2, 0, 30, 8, 26]], doors=[[11.3, 'slate']]),
  'shop_forge2': dict(w=11, d=7, door=6.8, theme='home', wall='log', paper='bark', floor='flag', wains='none', windows=[[2, 0], [5, 0]], doors=[[9.6, 'bark']], mat='rust'),
  'shop_carp2': dict(w=11, d=7, door=4, theme='home', wall='panel', floor='wide', floorK=[0.8, 0.82, 0.9], windows=[[2, 0], [6, 0]], doors=[[9.6, 'bark']], mat='mustard'),
  'shop_feed2': dict(w=11, d=7, door=4, theme='home', wall='log', floor='wide', windows=[[2, 0], [6, 0]], doors=[[9.6, 'bark']], mat='sage'),
  'shop_bait2': dict(w=9, d=6, door=4, theme='home', wall='panel', floor='painted', paint='blue', windows=[[2, 0], [6, 0]], mat='blue'),
  'shop_lusk2': dict(w=10, d=6, door=6.8, theme='home', wall='plaster', paper='mustard', floor='checker', chk='bark', windows=[[3.6, 0], [8.0, 0]], doors=[[9.3, 'red']], mat='red'),
  'shop_harlow2': dict(w=14, d=8, door=6.5, theme='home', wall='damask', paper='red', floor='parquet', wains='bead', windows=[[1.6, 0], [4.6, 0], [9.4, 0]], doors=[[12.9, 'bark']], mat='mustard'),
  # ---- the shops again, bigger and busier (#152): room for aisles, displays and a corner to sit in
  'shop_store3': dict(w=18, d=11, door=9, theme='store', windows=[[2.6, 0], [6.8, 0], [11.2, 0]], doors=[[15.6, 'bark']], mat='red'),
  'shop_garage3': dict(w=15, d=9, door=7.5, theme='garage', windows=[[4.2, 0, 30, 8, 26], [9.6, 0, 30, 8, 26]], doors=[[13.6, 'slate']]),
  'shop_forge3': dict(w=15, d=9, door=7.5, theme='home', wall='log', paper='bark', floor='flag', wains='none', windows=[[5.6, 0], [9.4, 0]], doors=[[13.4, 'bark']], mat='rust'),
  'shop_carp3': dict(w=15, d=9, door=7.5, theme='home', wall='panel', floor='wide', floorK=[0.8, 0.82, 0.9], windows=[[2.4, 0], [6.6, 0], [10.4, 0]], doors=[[13.4, 'bark']], mat='mustard'),
  'shop_feed3': dict(w=15, d=9, door=7.5, theme='home', wall='log', floor='wide', windows=[[2.4, 0], [6.6, 0], [10.4, 0]], doors=[[13.4, 'bark']], mat='sage'),
  'shop_bait3': dict(w=12, d=8, door=6, theme='home', wall='panel', floor='painted', paint='blue', windows=[[2.4, 0], [6, 0], [9.6, 0]], mat='blue'),
  'shop_harlow3': dict(w=17, d=10, door=8.5, theme='home', wall='damask', paper='red', floor='parquet', wains='bead', windows=[[2.2, 0], [5.8, 0], [10.6, 0]], doors=[[15.2, 'bark']], mat='mustard'),
  'shop_lusk3': dict(w=13, d=8, door=6.5, theme='home', wall='plaster', paper='mustard', floor='checker', chk='bark', windows=[[2.4, 0], [6.6, 0]], doors=[[11.4, 'red']], mat='red'),
  'tavern': dict(w=16, d=9, door=8, theme='home', wall='panel', floor='wide', wains='bead', windows=[[2.4, 0], [6.4, 0], [12.6, 0]], mat='red'),
  # ---- hidden rooms under the houses (#154)
  'undercroft': dict(noDress=True, w=8, d=5, door=4, theme='home', wall='plaster', paper='slate', floor='flag', flagRamp='slate', wains='none', windows=[], mat='slate'),
  'cellar_agnes': dict(noDress=True, w=8, d=5, door=4, theme='home', wall='plaster', paper='slate', floor='flag', wains='none', windows=[], mat='rust'),
  'cellar_hale': dict(noDress=True, w=8, d=5, door=4, theme='home', wall='fieldstone', floor='planks', windows=[], mat='slate'),
  # ---- the house grows (#252): a cellar under the floor, a dining room on the side, an upstairs, an attic under the roof
  'cabin_cellar': dict(noDress=True, w=8, d=5, door=4, theme='home', wall='fieldstone', floor='flag', wains='none', windows=[], mat='slate'),
  'cabin_dining': dict(w=8, d=6, door=4, theme='home', wall='panel', floor='parquet', wains='bead', windows=[[2, 0], [6, 0]], mat='red'),
  'cabin_up': dict(w=10, d=6, door=5, theme='home', wall='stripe', paper='sage', floor='wide', windows=[[2, 0], [6.2, 0]], doors=[[9.0, 'slate']], mat='blue'),
  'cabin3': dict(w=16, d=7, door=8, theme='home', paper='mustard', windows=[[6.0, 0], [10.8, 0]], doors=[[1.0, 'bark'], [14.9, 'bark']]),
  'cabin_attic': dict(noDress=True, w=9, d=5, door=4.5, theme='home', wall='log', floor='planks', wains='none', windows=[[4.5, 0]], sunY=30, mat='rust'),
  'cellar_dunn': dict(noDress=True, w=8, d=5, door=4, theme='home', wall='plaster', paper='mustard', floor='flag', wains='none', windows=[], mat='slate'),
  # ---- where the keepers live
  'priv_store': dict(w=7, d=5, door=3.5, theme='home', wall='stripe', paper='rust', floor='planks', windows=[[2, 0], [5.2, 0]], mat='rust'),
  'priv_garage': dict(w=7, d=5, door=3.5, theme='home', wall='panel', floor='wide', windows=[[4.3, 0]], sunY=40, mat='slate'),
  'priv_forge': dict(noDress=True, w=7, d=5, door=3.5, theme='home', wall='log', floor='packflag', soot=[[5.9, 1.3, 26], [6.1, 4.2, 22]], windows=[[2, 0]], mat='rust'),
  'priv_carp': dict(w=7, d=5, door=3.5, theme='home', wall='panel', floor='wide', windows=[[3.5, 0]], sunY=58, mat='mustard'),
  'priv_feed': dict(w=7, d=5, door=3.5, theme='home', wall='log', floor='planks', windows=[[2, 0], [5, 0]], sunY=40, mat='sage'),
  'priv_lusk': dict(w=7, d=5, door=3.5, theme='home', wall='plaster', paper='bark', floor='checker', chk='bark', windows=[[3.6, 0]], sunY=36, mat='red'),
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
  'chapel': dict(w=8, d=7, door=4, theme='home', wall='panel', floor='ashlar', windows=[[4, 0, 22, 8, 50]], lancet=True, noSun=True, noDress=True, whitewash=True, wains='planks', sunY=60, sunSk=0.3, mat='red'),
  'church': dict(w=10, d=8, door=5, theme='church', windows=[[1.5, 0, 22, 8, 50], [3.8, 0, 22, 8, 50], [6.2, 0, 22, 8, 50], [8.5, 0, 22, 8, 50]]),
  'garage': dict(w=9, d=6, door=6.8, theme='garage', windows=[[2, 0, 30, 8, 26]]),
  'mine': dict(w=11, d=8, door=5.5, theme='mine', windows=[]),
  'greenhouse': dict(w=9, d=6, door=4.5, theme='glass', windows=[]),
  'home_agnes': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='damask', paper='rust', floor='painted', paint='slate', wains='bead', doors=[[8.35, 'bark']], mat='red'),
  'home_hale': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='panel', floor='parquet', doors=[[8.35, 'bark']], mat='curtain'),
  'home_dunn': dict(windows=[[2, 0], [6, 0]], sunY=44, w=9, d=6, door=4, theme='home', wall='plaster', paper='mustard', floor='wide', doors=[[8.35, 'slate']], mat='sage'),
  'home_cora': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='stripe', paper='sage', floor='parquet', wains='bead', doors=[[8.35, 'teal']], mat='blue'),
  'home_june': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='stripe', paper='rust', floor='wide', doors=[[8.35, 'red']], mat='mustard'),
  'home_otto': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='panel', floor='wide', doors=[[8.35, 'teal']], mat='blue'),
  'home_silas': dict(windows=[[4.6, 0]], sunY=44, w=9, d=6, door=4, theme='home', wall='damask', paper='slate', floor='flag', flagRamp='slate', doors=[[8.35, 'slate']], mat='red'),
  'home_quill': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='stripe', paper='sage', floor='planks', wains='bead', doors=[[8.35, 'sage']], mat='rust'),
  'home_fenn': dict(windows=[[2.6, 0, 40, 8, 34]], w=9, d=6, door=4, theme='home', wall='plaster', floor='flag', doors=[[8.35, 'bark']], mat='mustard'),
  'home_thorne': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='log', floor='wide', doors=[[8.35, 'bark']], mat='rust'),
  'home_ashby': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='stripe', paper='blue', floor='checker', chk='blue', doors=[[8.35, 'slate']], mat='red'),
  'home_vale': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='damask', paper='sage', floor='parquet', wains='bead', doors=[[8.35, 'sage']], mat='rust'),
  'home_kerrigan': dict(windows=[[4.0, 0]], w=9, d=6, door=4, theme='home', wall='panel', floor='painted', paint='slate', wear='soft', doors=[[8.35, 'bark']], mat='mustard'),
  'home_pike': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='log', floor='wide', doors=[[8.35, 'teal']], mat='blue'),
  'home_ward': dict(windows=[[2, 0], [6, 0]], w=9, d=6, door=4, theme='home', wall='plaster', paper='mustard', floor='parquet', doors=[[8.35, 'red']], mat='sage'),
  # ---- out in the new land
  'rg_office': dict(w=8, d=6, door=4, theme='home', wall='stripe', paper='mustard', floor='checker', chk='red', windows=[[1.8, 0], [6.2, 0]], mat='red'),
  'rg_room6': dict(w=7, d=5, door=3.5, theme='home', wall='damask', paper='sage', floor='wide', windows=[[3.5, 0]], mat='curtain'),
  'rg_dorm': dict(w=14, d=8, door=7, theme='home', wall='plaster', paper='slate', floor='wide', wains='bead', windows=[[1.8, 0], [4.8, 0], [9.2, 0], [12.2, 0]], mat='slate'),
  'rg_hut': dict(w=6, d=5, door=3, theme='home', wall='log', floor='planks', windows=[[4.6, 0]], mat='sage'),
  'rg_ranger': dict(w=9, d=6, door=4.5, theme='home', wall='log', floor='wide', windows=[[1.6, 0], [7.9, 0]], noDress=True, mat='sage'),
  'rg_lookout': dict(w=6, d=5, door=3, theme='home', wall='panel', floor='wide', windows=[[.9, 0], [2.3, 0], [3.7, 0], [5.1, 0]], mat='sage'),
  # ---- the back rooms of the houses: where they sleep, and keep what they don't show visitors
  'back_agnes': dict(w=7, d=5, door=3.5, theme='home', wall='stripe', paper='sage', floor='painted', paint='blue', windows=[[3.5, 0]], mat='rust'),
  'back_hale': dict(w=7, d=5, door=3.5, theme='home', wall='panel', floor='wide', windows=[[1.6, 0], [4.3, 0]], mat='curtain'),
  'back_dunn': dict(w=7, d=5, door=3.5, theme='home', wall='plaster', paper='slate', floor='planks', windows=[[5.2, 0]], mat='slate'),
  'back_cora': dict(w=7, d=5, door=3.5, theme='home', wall='stripe', paper='rust', floor='parquet', windows=[[2, 0], [5.2, 0]], mat='blue'),
  'back_june': dict(w=7, d=5, door=3.5, theme='home', wall='stripe', paper='sage', floor='wide', windows=[[3.5, 0]], mat='mustard'),
  'back_otto': dict(w=7, d=5, door=3.5, theme='home', wall='log', floor='planks', windows=[[2, 0]], mat='blue'),
  'back_silas': dict(w=7, d=5, door=3.5, theme='home', wall='plaster', paper='slate', floor='flag', windows=[[5.2, 0]], mat='slate'),
  'back_quill': dict(w=7, d=5, door=3.5, theme='home', wall='stripe', paper='blue', floor='planks', windows=[[2, 0], [5.2, 0]], mat='sage'),
  'back_fenn': dict(w=7, d=5, door=3.5, theme='home', wall='panel', floor='wide', windows=[[2.6, 0]], sunY=30, noDress=True, mat='mustard'),
  'back_thorne': dict(w=7, d=5, door=3.5, theme='home', wall='log', floor='flag', windows=[[2, 0]], mat='rust'),
  'back_vale': dict(w=7, d=5, door=3.5, theme='home', wall='damask', paper='red', floor='parquet', windows=[[2, 0], [5.2, 0]], mat='red'),
  'back_kerrigan': dict(w=7, d=5, door=3.5, theme='home', wall='log', floor='wide', windows=[[5.2, 0]], mat='sage'),
  'back_pike': dict(w=7, d=5, door=3.5, theme='home', wall='panel', floor='planks', windows=[[2, 0], [5.2, 0]], mat='blue'),
}
FURN = {'bed': (56, 76, dict(stain=True)), 'bed_b': (56, 76, dict(v='blue')), 'bed_c': (56, 76, dict(v='wool', blanket='sage')), 'bed_d': (56, 76, dict(v='iron', blanket='mustard')), 'bed_e': (56, 76, dict(v='wool', blanket='rust')), 'table': (56, 44), 'chair': (22, 38), 'stove': (44, 58), 'shelf_books': (52, 82, dict(goods='books')), 'shelf_jars': (52, 82, dict(goods='jars')),
  'shelf_cans': (64, 82, dict(goods='cans')), 'shelf_tools': (64, 66, dict(goods='tools', step=20)), 'shelf_parts': (64, 82, dict(goods='parts')), 'shelf_mail': (64, 70, dict(goods='mail', step=16)), 'rocker': (28, 44), 'cradle': (36, 30), 'piano': (72, 58), 'chess': (40, 44), 'blackboard': (72, 46), 'schooldesk': (30, 36), 'globe': (24, 34), 'mailsacks': (36, 30), 'netwall': (60, 36), 'rods': (32, 64), 'coffin': (40, 66), 'shovels': (34, 58), 'filecab': (28, 52), 'mapboard': (56, 40), 'photowall': (46, 32), 'knit': (22, 22), 'tires': (30, 40), 'drum': (24, 36), 'drum_blue': (24, 36, dict(blue=True)), 'toolbox': (36, 40), 'hoist': (40, 70), 'rug': (84, 52), 'bar': (110, 52), 'stool': (18, 30), 'counter': (100, 48), 'crates': (46, 40), 'pew': (124, 40),
  'kcounter': (76, 52), 'hearth': (60, 88), 'chairE': (22, 38), 'chairN': (22, 38), 'shelfE': (25, 104), 'shelfN': (52, 82), 'rug_b': (84, 52, dict(rv='blue')), 'rug_c': (84, 52, dict(rv='rag')), 'rug_d': (84, 52, dict(rv='sage')), 'rug_r': (52, 84), 'altar': (76, 64), 'bench': (84, 62), 'cellar': (42, 30), 'mirror': (22, 32), 'clock': (20, 62), 'car': (124, 72), 'candles': (40, 24), 'desk': (58, 48), 'keg': (26, 32), 'rockS': (32, 48), 'rockE': (44, 46), 'rockN': (32, 48), 'oillamp': (22, 42)}
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
