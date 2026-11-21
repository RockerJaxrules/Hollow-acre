import sys
sys.path.insert(0, '.')
from run import run
for k in ['grass', 'forest', 'dirt', 'stone', 'water']:
    print(k, run('tiles.js', dict(name='tex_' + k, kind=k, seed=7, texOnly=True, per=192), (192, 192)))
