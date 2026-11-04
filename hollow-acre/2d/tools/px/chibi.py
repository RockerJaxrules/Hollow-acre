import sys, json
sys.path.insert(0, '.')
from run import run
CAST = {
  'farmer':  dict(skin='#e8b48c', hair='#6a4224', hairStyle='short', shirt='#b8402c', plaid=True, pants='#3a4e7a', shoes='#3a2618'),
  'mae':     dict(skin='#e0a884', hair='#b8b2aa', hairStyle='bun', shirt='#5a7a4a', skirt='#4a6a3e', apron=True, extra='#e8e0cc', shoes='#3a2618'),
  'hale':    dict(skin='#d8b498', hair='#c8c8c4', hairStyle='short', shirt='#24222a', coat=True, collar=True, pants='#24222a', shoes='#141218', hat='top'),
  'tobias':  dict(kid=True, skin='#eab890', hair='#8a4a1e', hairStyle='spiky', shirt='#4a6aa8', plaid=True, pants='#6a5a40', shoes='#4a3020'),
  'hollis':  dict(skin='#d09a78', hair='#2a2018', hairStyle='short', beard=True, shirt='#8a8a90', overalls='#3a5a8a', pants='#3a5a8a', shoes='#2a1a10', hat='cap', hatColor='#b83a2a'),
  'agnes':   dict(skin='#e6c0a8', hair='#e8e4dc', hairStyle='bun', shirt='#5a3a6a', skirt='#4a2e5a', glasses=True, shoes='#2a1a22'),
  'dunn':    dict(skin='#c8906c', hair='#3a2a1e', hairStyle='short', beard=True, shirt='#8a7a52', badge=True, pants='#4a3e2e', shoes='#2a1a10', hat='sheriff'),
  'ruth':    dict(kid=True, skin='#d8dce0', hair='#141018', hairStyle='long', hairLen=18, shirt='#e8e8ec', skirt='#d0d0da', shoes='#9a9aa6', hollowEyes=True, smile=False, eye='#050406'),
  'hollow':  dict(tall=True),
  'silas':   dict(skin='#c8a890', hair='#4a4440', hairStyle='short', beard=True, shirt='#3a3e34', coat=True, pants='#2e2a26', shoes='#1e1a16', hat='cap', hatColor='#2a2a2a'),
  'june':    dict(skin='#f0c4a0', hair='#c86a2a', hairStyle='long', hairLen=12, shirt='#3a5a8a', pants='#4a4a5a', shoes='#3a2618', hat='cap', hatColor='#3a5a8a'),
  'otto':    dict(skin='#d8a888', hair='#e0e0dc', hairStyle='short', beard=True, shirt='#c8a030', coat=True, pants='#3a3a30', shoes='#2a2010', hat='cap', hatColor='#c8a030'),
  'cora':    dict(skin='#e8c4a8', hair='#2a1a14', hairStyle='bun', shirt='#6a2a3a', skirt='#3a2a3a', glasses=True, shoes='#1a1012'),
  'wes':     dict(skin='#d09a78', hair='#d8b860', hairStyle='bangs', shirt='#e8e0d0', overalls='#4a5a6a', pants='#4a5a6a', shoes='#2a1a10'),
  'ida':     dict(skin='#ecc8b0', hair='#a88a6a', hairStyle='bun', shirt='#8aa0b8', skirt='#5a6a80', apron=True, extra='#f0ece0', shoes='#3a2a22'),
}
VARIANTS = {'farmer_hoe': ('farmer', 'hoe'), 'farmer_can': ('farmer', 'can'), 'farmer_pick': ('farmer', 'pick'), 'farmer_axe': ('farmer', 'axe')}
for _st in ('long', 'bun', 'spiky', 'bangs'):
    CAST['farmer_' + _st] = dict(CAST['farmer'], hairStyle=_st, hairLen=13)
    VARIANTS['farmer_' + _st + '_hoe'] = ('farmer_' + _st, 'hoe'); VARIANTS['farmer_' + _st + '_can'] = ('farmer_' + _st, 'can'); VARIANTS['farmer_' + _st + '_pick'] = ('farmer_' + _st, 'pick'); VARIANTS['farmer_' + _st + '_axe'] = ('farmer_' + _st, 'axe')
only = sys.argv[1:]
meta = {}
for n in list(CAST) + list(VARIANTS):
    if only and n not in only: continue
    base, tool = VARIANTS.get(n, (n, None)); look = CAST[base]
    fw, fh = (80, 160) if look.get('tall') else (48, 64)
    m = run('chibi.js', dict(name=n, look=look, tool=tool, seed=len(n)), (fw * 9, fh * 25)); meta[n] = m; print(n, m and (m['fw'], m['fh']))
old = {}
try: old = json.load(open('out/chibi_meta.json'))
except Exception: pass
old.update(meta); json.dump(old, open('out/chibi_meta.json', 'w'))
