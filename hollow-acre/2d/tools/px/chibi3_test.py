"""Render a few looks with chibi3.js for review."""
import sys, json
sys.path.insert(0, '.')
from run import run
exec(open('chibi2.py').read().split('# player base colours')[0].split('from run import run')[1])
looks = sys.argv[1:] or ['mae', 'hollis', 'agnes', 'otto', 'june', 'pip', 'ida', 'silas']
for n in looks:
    m = run('chibi3.js', dict(name='t3_' + n, look=NPC[n], tool=None, part='all', seed=len(n)), (48 * 9, 64 * 29))
    print(n, 'ok' if m else 'FAILED')
