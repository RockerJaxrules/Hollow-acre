import sys, json
sys.path.insert(0, '.')
from run import run
def size(c):
    y0 = c.get('top', 22); roofH = c.get('roofH', 82); wallH = c.get('wallH', 66)
    return (c['bw'] * 32 + 20, y0 + roofH - 5 + wallH + 9)
HOUSES = {
  'house_a': dict(bw=6, siding='white', roof='slate', trim='white', door='red', shutter='slate', wins=[1, 4], chimney=-1.5, seed=3, moss=True, porch=True, dormers=[1, 4], wallH=82, winY=10),
  'house_b': dict(bw=6, siding='mustard', roof='rust', trim='white', door='wood', shutter='sage', wins=[1, 4], chimney=1.4, seed=5, flowers=True, dormers=[2.5]),
  'house_c': dict(bw=5, siding='blue', roof='slate', trim='white', door='wood', shutter='slate', wins=[1, 3], chimney=None, seed=9, moss=True, gable=True, attic=True, flowers=True, top=70),
  'house_d': dict(bw=7, siding='sage', roof='bark', trim='cream', door='wood', shutter='rust', wins=[1, 5], chimney=-2, seed=11, moss=True, porch=True, wallH=82, winY=10),
  'cabin': dict(bw=6, siding='bark', roof='slate', trim='cream', door='wood', shutter='bark', wins=[1, 4], chimney=1.6, seed=21, moss=True, porch=True, wallH=82, winY=10, boarded=[4], dormers=[2.5], curtain='cream'),
  'store': dict(bw=10, siding='red', roof='bark', trim='cream', door='teal', shutters=False, wins=[1, 3, 6, 8], chimney=-2.2, seed=31, kind='brick', awning=True, sign='GENERAL STORE', wallH=74, winY=18),
  'garage': dict(bw=8, siding='stone', roof='slate', trim='stone', door='wood', shutters=False, wins=[0.15], chimney=None, seed=41, kind='stone', bigdoor=True, bigdoorX=-1.2, doorX=2.3, sign='GARAGE  REPAIRS', wallH=70, winY=14),
  'church': dict(hip=False, bw=10, siding='white', roof='slate', trim='white', door='wood', shutters=False, wins=[1, 2.6, 6.4, 8], chimney=None, seed=51, arched=True, steeple=True, wallH=96, winY=22, top=150, roofH=74, moss=True),
  'shop_forge': dict(bw=6, siding='stone', roof='slate', trim='stone', door='wood', shutters=False, wins=[1, 4], chimney=-1.6, seed=71, kind='stone', sign='ARMOURER  SMITH', wallH=72, winY=16),
  'shop_carp': dict(bw=6, siding='mustard', roof='bark', trim='cream', door='wood', shutters=False, wins=[1, 4], chimney=None, seed=73, awning=True, sign='HARTLEY CARPENTRY', wallH=70, winY=16),
  'shop_feed': dict(bw=6, siding='red', roof='slate', trim='white', door='wood', shutters=False, wins=[1, 4], chimney=None, seed=75, sign='FEED AND STOCK', wallH=70, winY=16, bigdoor=True, bigdoorX=-.2, doorX=1.9),
  'shop_bait': dict(bw=5, siding='blue', roof='slate', trim='white', door='teal', shutters=False, wins=[1, 3], chimney=None, seed=77, awning=True, sign='BAIT TACKLE', wallH=66, winY=16),
  'coop': dict(bw=3, siding='red', roof='slate', trim='white', door='wood', shutters=False, wins=[], chimney=None, seed=61, wallH=46, roofH=52, doorH=30),
}
only = sys.argv[1:] or list(HOUSES)
meta = {}
for n in only:
    for night in (False, True):
        c = dict(HOUSES[n], name=n + ('_n' if night else ''), night=night)
        m = run('house.js', c, size(c)); print(c['name'], m); meta[c['name']] = m
try: _old = json.load(open('out/houses_meta.json'))
except Exception: _old = {}
_old.update(meta); json.dump(_old, open('out/houses_meta.json', 'w'))
