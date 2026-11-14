"""Install hand-drawn station art (benches2.js output) with its turned views:
python3 install_hand.py <name>... [--front-only]
out/b2_<name>.png -> <name>.png, out/b2_<name>_E.png -> <name>_e.png, out/b2_<name>_N.png -> <name>_bk.png (the left view is the
right view mirrored by the game). The art it replaces goes to spr/backup_v2/bench3d/ first."""
import sys, os, json, shutil
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.abspath(os.path.join(HERE, '..', '..'))
BUILD = os.environ.get('HA_SCRATCH', '/tmp/claude-0/-home-user-Minecraftbot/f193b802-e794-5104-89ce-994e8f157fdf/scratchpad')
names = [a for a in sys.argv[1:] if not a.startswith('--')]; front_only = '--front-only' in sys.argv
mp = os.path.join(BUILD, 'spr', 'lpc', 'objects.json'); O = json.load(open(mp))
bak = os.path.join(GAME, 'spr', 'backup_v2', 'bench3d'); os.makedirs(bak, exist_ok=True)
for n in names:
    pairs = [(f'b2_{n}', n)] + ([] if front_only else [(f'b2_{n}_E', n + '_e'), (f'b2_{n}_N', n + '_bk')] + ([(f'b2_{n}_W', n + '_w')] if os.path.exists(os.path.join(HERE, 'out', f'b2_{n}_W.png')) else []))
    for src, dst in pairs:
        sp = os.path.join(HERE, 'out', src + '.png'); im = Image.open(sp)
        for root in (GAME, BUILD):
            d = os.path.join(root, 'spr', 'lpc', 'obj', dst + '.png')
            if root == GAME and os.path.exists(d) and not os.path.exists(os.path.join(bak, dst + '.png')): shutil.copy(d, os.path.join(bak, dst + '.png'))
            shutil.copy(sp, d)
        e = O.get(dst, {'src': f'spr/lpc/obj/{dst}.png', 'foot': O.get(n, {}).get('foot', [0, 0, 0, 0])})
        e.update(fw=im.width, fh=im.height, ax=im.width / 2, ay=im.height - 3); O[dst] = e
        print('installed', dst, im.size)
json.dump(O, open(mp, 'w'))
