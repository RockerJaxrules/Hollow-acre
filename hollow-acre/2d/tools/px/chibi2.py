"""Render characters with chibi2.js. NPCs: one composite sheet each. Player: one sheet per part/variant, composed in the game."""
import sys, json
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, '.')
from run import run
_src = open('chibi.py').read(); _ns = {}; exec(_src[_src.index('CAST = {'):_src.index('VARIANTS =')], _ns); OLD = _ns['CAST']
NPC = {k: dict(v) for k, v in OLD.items() if not k.startswith('farmer') and k != 'hollow'}
# heavier designs: patterns, outfits and accessories give everyone a silhouette of their own
MORE = {
  'mae': dict(pattern='dots', accessory='headband', acc='#c84a4a'),
  'hale': dict(glasses='square'),
  'tobias': dict(pattern='stripes', accessory='bandana', acc='#d8a030'),
  'hollis': dict(pattern='plaid', accessory='bandana', acc='#b83a2a'),
  'agnes': dict(outfit='sweater', accessory='necklace', acc='#d8c8e8', glasses='round'),
  'dunn': dict(outfit='shirt', beard='moustache'),
  'ruth': dict(accessory='bow', acc='#e8e8f0'),
  'gideon': dict(outfit='tee', hairStyle='buzz', accessory='bandana', acc='#8a2a1a'),
  'nell': dict(pattern='plaid', accessory='headband', acc='#c8603a', hairStyle='ponytail'),
  'ezra': dict(outfit='vest', extra='#5a3a24', beard='goatee', plaid=False, pattern='plaid'),
  'pip': dict(pattern='stripes', hairStyle='spiky'),
  'silas': dict(beard='stubble', accessory='scarf', acc='#4a4a50'),
  'june': dict(outfit='shirt', accessory='scarf', acc='#c8a030', hairStyle='wavy'),
  'otto': dict(outfit='sweater', coat=False, pattern='stripes', shirt='#c8a030'),
  'cora': dict(accessory='scarf', acc='#6a2a3a', glasses='round', pattern='dots'),
  'wes': dict(pattern='stripes', accessory='bandana', acc='#3a5a8a'),
  'ida': dict(accessory='flower', acc='#e86a8a', pattern='dots'),
}
for k, v in MORE.items(): NPC[k].update(v)
# player base colours: every recolourable region has its own base ramp
BASE = dict(skin='#e8b48c', hair='#6a4224', eye='#3a5a7a', shirt='#b8402c', pants='#3a4e7a', shoes='#3a2618', extra='#6a7a3a', hatColor='#8a5a2a', acc='#c83a5a')
OUTFITS = ['tee', 'shirt', 'overalls', 'jacket', 'dress', 'hoodie', 'vest', 'sweater', 'tank', 'turtleneck', 'cardigan', 'openshirt', 'skirt', 'longcoat']
HAIRS = ['short', 'long', 'bun', 'spiky', 'bangs', 'ponytail', 'curly', 'buzz', 'braids', 'pigtails', 'wavy', 'mohawk', 'afro', 'bob', 'sidepart', 'shaggy', 'topknot', 'spacebuns', 'crop']
BEARDS = ['stubble', 'moustache', 'goatee', 'full']
HATS = ['cap', 'straw', 'beanie', 'cowboy', 'bucket']
GLASSES = ['round', 'square', 'shades']
ACCS = ['bow', 'flower', 'headband', 'scarf', 'bandana', 'necklace']
TOOLS = ['', 'hoe', 'can', 'pick', 'axe']
JOBS = []
for n, look in NPC.items(): JOBS.append((n, dict(look), None, 'all'))
for t in TOOLS:
    sfx = '_' + t if t else ''
    JOBS.append(('farmer' + sfx, dict(BASE, outfit='shirt', pattern='plaid', hairStyle='short'), t or None, 'all'))
    for o in OUTFITS: JOBS.append((f'pl_body_{o}{sfx}', dict(BASE, outfit=o, hairStyle='bald'), t or None, 'body'))
    if t: JOBS.append((f'pl_toolf{sfx}', dict(BASE, hairStyle='bald'), t, 'toolf'))
for v, t in (('', 'hoe'), ('_can', 'can')):   # head parts follow the head, which moves the same for every swing tool
    for h in HAIRS: JOBS.append((f'pl_hair_{h}{v}', dict(BASE, hairStyle=h), t, 'hair'))
    for b in BEARDS: JOBS.append((f'pl_beard_{b}{v}', dict(BASE, hairStyle='bald', beard=b), t, 'beard'))
    for h in HATS: JOBS.append((f'pl_hat_{h}{v}', dict(BASE, hairStyle='bald', hat=h), t, 'hat'))
    for gl in GLASSES: JOBS.append((f'pl_glasses_{gl}{v}', dict(BASE, hairStyle='bald', glasses=gl), t, 'glasses'))
    for a in ACCS: JOBS.append((f'pl_acc_{a}{v}', dict(BASE, hairStyle='short', accessory=a), t, 'acc'))
only = sys.argv[1:]
if only: JOBS = [j for j in JOBS if any(j[0] == o or (o.endswith('*') and j[0].startswith(o[:-1])) for o in only)]
def go(j):
    n, look, tool, part = j
    return n, run('chibi2.js', dict(name=n, look=look, tool=tool, part=part, seed=len(n)), (48 * 9, 64 * 29))
meta = {}
with ThreadPoolExecutor(8) as ex:
    for n, m in ex.map(go, JOBS): meta[n] = m; print(n, 'ok' if m else 'FAILED', flush=True)
old = {}
try: old = json.load(open('out/chibi2_meta.json'))
except Exception: pass
old.update(meta); json.dump(old, open('out/chibi2_meta.json', 'w'))
