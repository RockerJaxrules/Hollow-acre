import sys
sys.path.insert(0, '.')
from run import run
for k in (sys.argv[1:] or ['grass', 'forest', 'dirt', 'stone', 'water']):
    print(k, run('tiles.js', dict(name='t_' + k, kind=k, seed=7), (96, 192)))
