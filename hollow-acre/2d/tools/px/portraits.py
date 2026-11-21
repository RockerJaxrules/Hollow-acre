"""Render talking portraits: for every character, a strip of head-and-shoulders busts in seven expressions."""
import sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, '.')
from run import run
src = open('chibi2.py').read(); ns = {}; exec(src[:src.index('JOBS = []')], ns); NPC = ns['NPC']
only = sys.argv[1:]
names = [n for n in NPC if not only or n in only]
EX = 7; PW = PH = 40
def go(n):
    return n, run('chibi2.js', dict(name=n + '_portrait', look=dict(NPC[n]), tool=None, part='all', seed=len(n), portraits=True), (PW * EX, PH))
with ThreadPoolExecutor(8) as ex:
    for n, m in ex.map(go, names): print(n, 'ok' if m else 'FAILED', flush=True)
