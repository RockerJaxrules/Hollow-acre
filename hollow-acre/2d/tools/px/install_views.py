"""Install rendered furn3d views into the game: python3 install_views.py <name> [<name>...] [--views=_e,_bk,_w] [--front]
Copies furn3d_gen/png/<name><suffix>.png into spr/lpc/obj of the repo and the scratch build, backs up any sprite it
replaces in spr/backup_v2/furn3d/, and writes the anchor into objects.json (the scratch build's, which sync copies over)."""
import sys, os, json, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.abspath(os.path.join(HERE, '..', '..'))
BUILD = os.environ.get('HA_SCRATCH', '/tmp/claude-0/-home-user-Minecraftbot/f193b802-e794-5104-89ce-994e8f157fdf/scratchpad')
args = [a for a in sys.argv[1:] if not a.startswith('--')]
views = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--views=')), '_e,_bk,_w').split(',')
if '--front' in sys.argv: views = [''] + views
M = json.load(open(os.path.join(HERE, 'furn3d_gen', 'meta.json')))
mp = os.path.join(BUILD, 'spr', 'lpc', 'objects.json'); O = json.load(open(mp))
bak = os.path.join(GAME, 'spr', 'backup_v2', 'furn3d'); os.makedirs(bak, exist_ok=True)
for n in args:
    for v in views:
        nm = n + v; src = os.path.join(HERE, 'furn3d_gen', 'png', nm + '.png')
        if nm not in M or not os.path.exists(src): print('missing', nm); continue
        for root in (GAME, BUILD):
            dst = os.path.join(root, 'spr', 'lpc', 'obj', nm + '.png')
            if root == GAME and os.path.exists(dst) and not os.path.exists(os.path.join(bak, nm + '.png')): shutil.copy(dst, os.path.join(bak, nm + '.png'))
            shutil.copy(src, dst)
        m = M[nm]; e = O.get(nm, {'src': f'spr/lpc/obj/{nm}.png', 'foot': [0, 0, 0, 0]}); e.update(fw=m['w'], fh=m['h'], ax=float(m['ax']), ay=float(m['ay'])); O[nm] = e
        print('installed', nm)
json.dump(O, open(mp, 'w'))
