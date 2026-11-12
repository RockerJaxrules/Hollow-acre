"""Under-top shadows that darken toward the floor read as a solid box (judge, furniture Nov 12: "the dark block under the
top reads as a solid box - the base of a chest"). This re-alphas the translucent shadow pixels under a piece's top so they
keep only a short band under the lip (the floor shows below it), leaving the opaque art and the bottom 3 rows (contact and cast) alone.

    python3 fix_undershade.py <sprite> [<sprite>...] [--install]     (sprites in ../../spr/lpc/obj; preview -> out/us_<sprite>.png)
"""
import sys, os, shutil
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.abspath(os.path.join(HERE, '..', '..'))
BUILD = os.environ.get('HA_SCRATCH', '/tmp/claude-0/-home-user-Minecraftbot/f193b802-e794-5104-89ce-994e8f157fdf/scratchpad')
names = [a for a in sys.argv[1:] if not a.startswith('--')]
for n in names:
    src = os.path.join(GAME, 'spr', 'lpc', 'obj', n + '.png'); im = Image.open(src).convert('RGBA'); W, H = im.size; px = im.load()
    base = H - 3
    for x in range(W):
        col = [y for y in range(H) if px[x, y][3] > 0 and px[x, y][3] < 255 and y < base]     # translucent shadow pixels above the contact rows
        if not col: continue
        y0 = min(col)
        for y in col:
            d = y - y0; a = [110, 70, 36][d] if d < 3 else 0                                   # a short band of shadow under the lip; below it the floor shows
            r, g, b, _ = px[x, y]; px[x, y] = (r, g, b, a)
    out = os.path.join(HERE, 'out', 'us_' + n + '.png'); im.save(out); print('preview', out)
    if '--install' in sys.argv:
        bak = os.path.join(GAME, 'spr', 'backup_v2', 'furn_pre_fam2'); os.makedirs(bak, exist_ok=True)
        if not os.path.exists(os.path.join(bak, n + '.png')): shutil.copy(src, os.path.join(bak, n + '.png'))
        for root in (GAME, BUILD): im.save(os.path.join(root, 'spr', 'lpc', 'obj', n + '.png'))
        print('installed', n)
