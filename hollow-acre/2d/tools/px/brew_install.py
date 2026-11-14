"""Install the brewery's art (#234) into the game's sprites: the three stations from benches2.js (rendered to out/), the
oak cask (the wine cask with its WINE lettering planed off, so it can age whiskey too) and the item icons (brew_icons.py).

    python3 brew_install.py <game>/spr/lpc/obj <game>/spr/lpc/objects.json
"""
import sys, os, json, shutil
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brew_icons
obj, oj = sys.argv[1], sys.argv[2]
O = json.load(open(oj)); here = os.path.dirname(os.path.abspath(__file__))
for n in ('bench_brew', 'bench_press', 'bench_still'):
    src = os.path.join(here, 'out', f'b2_{n}.png'); im = Image.open(src); w, h = im.size
    shutil.copy(src, os.path.join(obj, f'{n}.png'))
    O[n] = {'src': f'spr/lpc/obj/{n}.png', 'fw': w, 'fh': h, 'ax': w / 2, 'ay': h - 3, 'foot': [0, 0, 0, 0]}
cask = Image.open(os.path.join(obj, 'in_caskwine.png')).convert('RGBA'); p = cask.load()
for y in range(12, 19):
    for x in range(cask.width):
        if p[x, y][:3] == (0xf4, 0xec, 0xd4): p[x, y] = p[x, 12]                         # plane the lettering back to the staves
cask.save(os.path.join(obj, 'cask_oak.png'))
O['cask_oak'] = dict(O['in_caskwine'], src='spr/lpc/obj/cask_oak.png')
for k, im in brew_icons.icons().items():
    im.save(os.path.join(obj, f'icon32_{k}.png'))
    O[f'icon32_{k}'] = {'src': f'spr/lpc/obj/icon32_{k}.png', 'fw': 32, 'fh': 32, 'ax': 16.0, 'ay': 32.0, 'foot': [0, 0, 0, 0], 'px': 'ase', 'chim': None}
json.dump(O, open(oj, 'w'))
print('installed the brewery: 3 stations, the oak cask,', len(brew_icons.icons()), 'icons')
