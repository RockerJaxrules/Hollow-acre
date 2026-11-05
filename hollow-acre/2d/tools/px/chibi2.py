"""Render characters with chibi2.js. NPCs: one composite sheet each. Player: one sheet per part/variant, composed in the game."""
import sys, json
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, '.')
from run import run
_src = open('chibi.py').read(); _ns = {}; exec(_src[_src.index('CAST = {'):_src.index('VARIANTS =')], _ns); OLD = _ns['CAST']
NPC = {k: dict(v) for k, v in OLD.items() if not k.startswith('farmer') and k != 'hollow'}
# player base colours: every recolourable region has its own base ramp
BASE = dict(skin='#e8b48c', hair='#6a4224', eye='#3a5a7a', shirt='#b8402c', pants='#3a4e7a', shoes='#3a2618', extra='#6a7a3a', hatColor='#8a5a2a')
OUTFITS = ['tee', 'flannel', 'overalls', 'jacket', 'dress']
HAIRS = ['short', 'long', 'bun', 'spiky', 'bangs', 'ponytail', 'curly', 'buzz', 'braids']
BEARDS = ['stubble', 'moustache', 'full']
HATS = ['cap', 'straw', 'beanie', 'cowboy']
TOOLS = ['', 'hoe', 'can', 'pick', 'axe']
JOBS = []
for n, look in NPC.items(): JOBS.append((n, dict(look), None, 'all'))
for t in TOOLS:
    sfx = '_' + t if t else ''
    JOBS.append(('farmer' + sfx, dict(BASE, outfit='flannel', hairStyle='short'), t or None, 'all'))
    for o in OUTFITS: JOBS.append((f'pl_body_{o}{sfx}', dict(BASE, outfit=o, hairStyle='bald'), t or None, 'body'))
    if t: JOBS.append((f'pl_toolf{sfx}', dict(BASE, hairStyle='bald'), t, 'toolf'))
for v, t in (('', 'hoe'), ('_can', 'can')):   # head parts follow the head, which moves the same for every swing tool
    for h in HAIRS: JOBS.append((f'pl_hair_{h}{v}', dict(BASE, hairStyle=h), t, 'hair'))
    for b in BEARDS: JOBS.append((f'pl_beard_{b}{v}', dict(BASE, hairStyle='bald', beard=b), t, 'beard'))
    for h in HATS: JOBS.append((f'pl_hat_{h}{v}', dict(BASE, hairStyle='bald', hat=h), t, 'hat'))
    JOBS.append((f'pl_glasses{v}', dict(BASE, hairStyle='bald', glasses=True), t, 'glasses'))
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
