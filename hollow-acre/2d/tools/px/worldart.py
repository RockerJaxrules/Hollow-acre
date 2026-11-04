import sys, json
sys.path.insert(0, '.')
from run import run
from PIL import Image
J = [  # name, kind, w, h, extra
  ('cliff', 'cliff', 64, 60, dict(noOutline=True)),
  *[(f'falls_{f}', 'falls', 40, 64, dict(f=f, noOutline=True)) for f in range(4)],
  ('cbridge', 'cbridge', 300, 236, {}), ('cbridge_n', 'cbridge', 300, 236, dict(night=True)),
  ('footbridge', 'footbridge', 100, 50, {}), ('dock', 'dock', 70, 140, {}), ('cportal', 'cportal', 236, 300, {}),
  ('barn', 'barn', 230, 190, {}), ('barn_n', 'barn', 230, 190, dict(night=True)), ('silo', 'silo', 56, 190, {}),
  ('windpump', 'windpump', 48, 170, {}), *[(f'blades_{f}', 'blades', 44, 44, dict(f=f)) for f in range(4)],
  *[(f'chicken_{f}', 'chicken', 16, 16, dict(f=f)) for f in range(3)], *[(f'butterfly_{f}', 'butterfly', 10, 7, dict(f=f, noOutline=True)) for f in range(2)],
  ('mailbox', 'mailbox', 30, 46, {}),
  *[(f'maple_{l}', 'maple', 120, 150, dict(leaf=l, seed=3 + i)) for i, l in enumerate(['orange', 'red', 'gold', 'green'])],
  *[(f'bush_{l}', 'bush', 50, 40, dict(leaf=l, seed=11 + i, berries=(l == 'green'))) for i, l in enumerate(['green', 'red', 'gold'])],
  *[(f'tgrass_{f}', 'tallgrass', 36, 26, dict(f=f, noOutline=True)) for f in range(2)],
  *[(f'tgold_{f}', 'tallgrass', 36, 26, dict(f=f, leaf='gold', noOutline=True)) for f in range(2)], ('decor', 'decor', 128, 16, dict(noOutline=True)),
]
only = sys.argv[1:]
for n, k, w, h, ex in J:
    if only and not any(n.startswith(o) for o in only): continue
    print(n, run('worldart.js', dict(dict(name=n, kind=k, w=w, h=h, seed=len(n)), **ex), (w, h)))
# animated strips
for base, nf in (('falls', 4), ('blades', 4), ('chicken', 3), ('butterfly', 2), ('tgrass', 2), ('tgold', 2)):
    fr = [Image.open(f'out/{base}_{i}.png') for i in range(nf)]
    s = Image.new('RGBA', (fr[0].width * nf, fr[0].height))
    for i, f in enumerate(fr): s.paste(f, (i * f.width, 0))
    s.save(f'out/{base}.png')
