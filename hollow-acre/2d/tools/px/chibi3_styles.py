import sys, json
sys.path.insert(0, '.')
from run import run
from concurrent.futures import ThreadPoolExecutor
STY=['short','crop','sidepart','bangs','shaggy','spiky','buzz','mohawk','topknot','curly','afro','wavy','bob','long','ponytail','bun','braids','pigtails','spacebuns']
HAIRS=['#6a4224','#14100e','#c85a24','#d8c27a','#3a2416','#9a5a2a','#8a2e1a','#b8823c','#3a4a6a','#5a2a5a','#2e6a4a','#d86a9a']
def go(i):
    st=STY[i];look=dict(skin='#f2cfb0',hair=HAIRS[i%len(HAIRS)],hairStyle=st,outfit='tee',shirt='#4f7a3e',pants='#3a4e7a',shoes='#3a2618')
    return st,run('chibi3.js',dict(name='t3s_'+st,look=look,tool=None,part='all',seed=3),(48*9,64*29))
with ThreadPoolExecutor(8) as ex:
    for st,m in ex.map(go,range(len(STY))):print(st,'ok' if m else 'FAILED')
