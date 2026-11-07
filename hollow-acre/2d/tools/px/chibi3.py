"""Render characters with chibi3.js (the third-generation model). NPCs: one composite sheet each. Player: one sheet per part/variant, composed in the game."""
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
# Wickham Crossing
NPC.update({
  'tess': dict(skin='#f2cfb0', hair='#c85a24', hairStyle='bun', outfit='dress', shirt='#e8e0d0', pants='#7a3a2e', apron=True, extra='#e8e0cc', shoes='#3a2618', accessory='scarf', acc='#c89a3a'),
  'hob': dict(skin='#d49a70', hair='#3a2416', hairStyle='crop', outfit='tee', shirt='#5a6a3e', apron=True, extra='#c8b898', pants='#4a3e2e', shoes='#2a1a10', beard='full'),
  'lyle': dict(skin='#e8b48c', hair='#9a9aa0', hairStyle='sidepart', outfit='vest', extra='#3a3a40', shirt='#e8e0d0', pants='#2e2e34', shoes='#1e1a18', glasses='square', beard='moustache'),
  'vera': dict(skin='#e8b48c', hair='#14100e', hairStyle='bob', outfit='hoodie', shirt='#7a4a8a', pants='#2a3a5a', shoes='#e0d8c8', accessory='necklace', acc='#e8e8f0'),
  'quinn': dict(skin='#c98c62', hair='#2a2018', hairStyle='short', outfit='longcoat', extra='#24222a', shirt='#e8e0d0', collar=True, pants='#24222a', shoes='#141218'),
  'nan': dict(skin='#b8784c', hair='#e8e4dc', hairStyle='braids', outfit='sweater', shirt='#3a5a4a', pattern='stripes', pants='#3a3a30', shoes='#2a2010', hat='bucket', hatColor='#3a5a8a'),
  'finn': dict(kid=True, skin='#b8784c', hair='#2a2018', hairStyle='curly', outfit='tee', shirt='#d8a030', pattern='stripes', pants='#3e6a9a', shoes='#3a2618'),
  'iris': dict(skin='#f6d8c0', hair='#d8c27a', hairStyle='ponytail', outfit='cardigan', extra='#c86a8a', shirt='#e8e0d0', pants='#7a4a8a', shoes='#3a2618', glasses='round', accessory='flower', acc='#e86a8a'),
  'moss': dict(skin='#d49a70', hair='#5a2a1a', hairStyle='shaggy', outfit='jacket', extra='#4f5a3a', shirt='#8a5a3a', pattern='plaid', pants='#3a3a30', shoes='#2a1a10', beard='stubble', hat='beanie', hatColor='#7a2e26'),
  'ada': dict(skin='#e0c4a8', hair='#e8e4dc', hairStyle='long', hairLen=12, outfit='dress', shirt='#4a4a50', pants='#3a3a40', shoes='#2a2018', hollowEyes=True, smile=False, accessory='scarf', acc='#5a2a5a'),
})
# out past town
NPC.update({
  'orla': dict(skin='#e8b48c', hair='#a8a098', hairStyle='bun', outfit='dress', shirt='#7a4a3a', pants='#5a6a3e', apron=True, extra='#e8e0cc', shoes='#3a2618', accessory='headband', acc='#c84a4a', eye='#3a6a3a'),
  'bram': dict(kid=True, skin='#f0c8a8', hair='#8a5a2a', hairStyle='shaggy', outfit='overalls', shirt='#d8603a', pattern='stripes', pants='#3e6a9a', shoes='#3a2618', eye='#3a6a3a'),
  'abel': dict(skin='#d49a70', hair='#6a5a4a', hairStyle='buzz', outfit='tee', shirt='#e8e0d0', apron=True, extra='#c8b898', pants='#4a3e2e', shoes='#2a1a10', beard='moustache', hat='cap', hatColor='#e0d8c8'),
  'della': dict(skin='#b8784c', hair='#2a1a14', hairStyle='braids', outfit='cardigan', extra='#8a6a9a', shirt='#e8e0d0', pants='#4a3e4e', shoes='#3a2618', glasses='round', accessory='necklace', acc='#f0d040'),
  'maud': dict(skin='#c98c62', hair='#5a2a1a', hairStyle='ponytail', outfit='jacket', extra='#5a4a3a', shirt='#8a8a90', pants='#3a3a40', shoes='#1e1a18', accessory='bandana', acc='#b83a2a'),
  'corwin': dict(skin='#e0c4a8', hair='#9a9aa0', hairStyle='shaggy', outfit='longcoat', extra='#3a4a5a', shirt='#c8b060', pants='#3a3a30', shoes='#2a2010', beard='stubble', hat='cap', hatColor='#c8a030'),
})

# Caitlyn runs the store now (id 'mae' so saves and scripts keep working): blonde with pink lengths, square black glasses, black tee, jeans, white sneakers
NPC['mae'] = dict(skin='#f3d2b8', hair='#e2c27e', hairTip='#e58fb0', tipDy=7, hairStyle='long', outfit='tee', shirt='#24222a', pants='#7a96bc', shoes='#e8e4dc',
                  glasses='square', accessory='necklace', acc='#d8dce4', eye='#6a8aa4')
# the young adult women: fitted low-cut tops (no scarves over the neckline), lashes, lipstick
ALLURE = {'nell': dict(outfit='tee', overalls=False, pants='#4a3e2e'), 'june': dict(accessory='necklace', acc='#e8c860'), 'cora': dict(accessory='necklace', acc='#e8e0f0'), 'ida': dict(),
          'tess': dict(accessory='necklace', acc='#e8c860'), 'iris': dict(), 'della': dict(), 'maud': dict(accessory='headband')}
for _k, _v in ALLURE.items(): NPC[_k].update(_v, allure=1)
# player base colours: every recolourable region has its own base ramp
BASE = dict(skin='#e8b48c', hair='#6a4224', eye='#3a5a7a', shirt='#b8402c', pants='#3a4e7a', shoes='#3a2618', extra='#6a7a3a', hatColor='#8a5a2a', acc='#c83a5a')
OUTFITS = ['tee', 'shirt', 'overalls', 'jacket', 'dress', 'hoodie', 'vest', 'sweater', 'tank', 'turtleneck', 'cardigan', 'openshirt', 'skirt', 'longcoat']
HAIRS = ['short', 'long', 'bun', 'spiky', 'bangs', 'ponytail', 'curly', 'buzz', 'braids', 'pigtails', 'wavy', 'mohawk', 'afro', 'bob', 'sidepart', 'shaggy', 'topknot', 'spacebuns', 'crop']
BEARDS = ['stubble', 'moustache', 'goatee', 'full']
HATS = ['cap', 'straw', 'beanie', 'cowboy', 'bucket']
GLASSES = ['round', 'square', 'shades']
ACCS = ['bow', 'flower', 'headband', 'scarf', 'bandana', 'necklace']
TOOLS = ['', 'hoe', 'can', 'pick', 'axe', 'rod']
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
    return n, run('chibi3.js', dict(name=n, look=look, tool=tool, part=part, seed=len(n)), (48 * 9, 64 * 29))
meta = {}
with ThreadPoolExecutor(8) as ex:
    for n, m in ex.map(go, JOBS): meta[n] = m; print(n, 'ok' if m else 'FAILED', flush=True)
old = {}
try: old = json.load(open('out/chibi2_meta.json'))
except Exception: pass
old.update(meta); json.dump(old, open('out/chibi2_meta.json', 'w'))
