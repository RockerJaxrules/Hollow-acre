"""The strangers the Hollow leaves in the fields (gore3.py's g_p_* remains), built with the same chibi model as the townsfolk:
chibi3.js through run.py, exactly like chibi3.py renders the cast. Their skin is a shade paler than the town's (no blood in it).
Writes out/str_<name>.png (full sheets) and copies them to strangers/ so gore3.py can lay their frames out without LibreSprite.
  hiker    a hitchhiker in an olive jacket over a plaid shirt, jeans, near-black hair (a value step off the jacket); gore3 lays
           the back view face-down and turns the head on its cheek with the side frame's head
  hunter   an orange cap, an olive jacket over a pale undershirt, jeans (gore3 uses the sitting frame, front)
  surveyor shorts, grey wool socks and brown work boots (gore3 keeps the shoes and the lower legs)
  coat     a long tan coat buttoned to the chin (light enough to stand off the grass) (the shirt is the coat's colour, so the front reads closed) (gore3 keeps the coat from the shoulders to the hem)
  lantern  a tee, bare forearms (gore3 keeps one fist and a little of the arm)
Run from tools/px: python3 strangers3.py"""
import os, shutil, sys
sys.path.insert(0, '.')
from run import run
from concurrent.futures import ThreadPoolExecutor
PALE = '#dcbca6'
LOOKS = {
  'hiker': dict(skin=PALE, hair='#2e2218', hairStyle='short', outfit='jacket', extra='#5c5a3c', shirt='#8a4a2c', pattern='plaid', pants='#3e4a66', shoes='#4a3020'),
  'hunter': dict(skin=PALE, hair='#6e4e30', hairStyle='short', outfit='jacket', extra='#545a3a', shirt='#c8c0ac', pants='#3e4a66', shoes='#3a2618',
                 hat='cap', hatColor='#d8641e', build='broad'),
  'surveyor': dict(skin=PALE, hair='#3a2a24', hairStyle='crop', outfit='tee', shirt='#d8b02a', pants='#7a6a48', shoes='#7e5232', shorts=True, socks='#8a8276', build='tall'),
  'coat': dict(skin=PALE, hair='#2a2018', hairStyle='short', outfit='longcoat', extra='#9a845a', shirt='#9a845a', collar=True, pants='#3a3a30', shoes='#2a2010'),
  'lantern': dict(skin=PALE, hair='#7a5a3a', hairStyle='short', outfit='tee', shirt='#4a5a6a', pants='#3a3a40', shoes='#2a2018'),
}
D = os.path.dirname(os.path.abspath(__file__)); KEEP = os.path.join(D, 'strangers'); os.makedirs(KEEP, exist_ok=True)
def go(n):
    m = run('chibi3.js', dict(name='str_' + n, look=dict(LOOKS[n]), tool=None, part='all', seed=len(n)), (48 * 9, 64 * 29))
    if n == 'hunter':   # his cap on its own, for the toned-down version (left at the foot of the tree)
        run('chibi3.js', dict(name='str_hunter_cap', look=dict(LOOKS[n]), tool=None, part='hat', seed=len(n)), (48 * 9, 64 * 29))
    return n, m
if __name__ == '__main__':
    with ThreadPoolExecutor(5) as ex:
        for n, m in ex.map(go, LOOKS):
            print(n, 'ok' if m else 'FAILED', flush=True)
    for f in os.listdir(os.path.join(D, 'out')):
        if f.startswith('str_') and f.endswith('.png'): shutil.copy(os.path.join(D, 'out', f), os.path.join(KEEP, f))
