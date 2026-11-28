"""Render the 64x64 talking portraits (portrait3.js) for every villager and pack them into out/portraits.png + portraits.json."""
import sys, json
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
sys.path.insert(0, '.')
from run import run
src = open('chibi2.py').read(); ns = {}; exec(src[:src.index('# player base colours')].split('from run import run')[1], ns); NPC = ns['NPC']
only = sys.argv[1:]
names = [n for n in NPC if not only or n in only]
EX = 7; PW = PH = 64
def go(n):
    return n, run('portrait3.js', dict(name=n + '_portrait3', look=dict(NPC[n]), seed=len(n)), (PW * EX, PH))
with ThreadPoolExecutor(8) as ex:
    for n, m in ex.map(go, names): print(n, 'ok' if m else 'FAILED', flush=True)
if not only:
    sheet = Image.new('RGBA', (PW * EX, PH * len(names)), (0, 0, 0, 0))
    for i, n in enumerate(names): sheet.alpha_composite(Image.open(f'out/{n}_portrait3.png').convert('RGBA'), (0, i * PH))
    sheet.save('out/portraits.png')
    json.dump({'ids': names, 'pw': PW, 'ph': PH, 'expr': ['neutral', 'happy', 'sad', 'angry', 'surprised', 'scared', 'wrong']}, open('out/portraits.json', 'w'))
    print('packed', len(names))
