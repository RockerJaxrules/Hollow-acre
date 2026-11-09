"""Install character sheets made by chibi3.py into one or more game trees.
Usage: python3 install_chars.py <log of the chibi3.py run> <backup folder name> <game root> [<more game roots>]
Only the sheets the run reports as 'ok' are installed. NPC and farmer sheets go to spr/lpc/, player layers (pl_*) to
spr/lpc/pl/. Each sheet's json keeps any extra keys it already had and takes the new meta. The first root's old
sheets are copied to spr/backup_v2/<backup folder name>/ first (old art is always kept)."""
import sys, json, shutil, os
log, bak, roots = sys.argv[1], sys.argv[2], sys.argv[3:]
here = os.path.dirname(os.path.abspath(__file__))
meta = json.load(open(os.path.join(here, 'out', 'chibi2_meta.json')))
names = [l.split()[0] for l in open(log) if l.strip().endswith(' ok')]
# KEEP_ROWS=4-7 keeps those sheet rows (64 px each) from the installed sheet: a clip that hasn't passed its judge yet stays as it is
KEEP = os.environ.get('KEEP_ROWS'); KEEP = tuple(int(v) for v in KEEP.split('-')) if KEEP else None
bdir = os.path.join(roots[0], 'spr', 'backup_v2', bak); os.makedirs(bdir, exist_ok=True)
n = 0
for name in names:
    m = meta.get(name)
    if not m: print('no meta for', name); continue
    sub = 'spr/lpc/pl' if name.startswith('pl_') else 'spr/lpc'
    old = os.path.join(roots[0], sub, name + '.png')
    if os.path.exists(old) and not os.path.exists(os.path.join(bdir, name + '.png')):
        shutil.copy(old, bdir); shutil.copy(old[:-4] + '.json', bdir)
    src = os.path.join(here, 'out', name + '.png')
    if KEEP and os.path.exists(old):
        from PIL import Image
        nw = Image.open(src).convert('RGBA'); od = Image.open(old).convert('RGBA'); y0, y1 = KEEP[0] * 64, (KEEP[1] + 1) * 64
        if od.size == nw.size:
            nw.paste(od.crop((0, y0, od.width, y1)), (0, y0)); src = os.path.join(here, 'out', '_splice.png'); nw.save(src)
    for r in roots:
        dst = os.path.join(r, sub); os.makedirs(dst, exist_ok=True)
        shutil.copy(src, os.path.join(dst, name + '.png'))
        jp = os.path.join(dst, name + '.json'); j = {}
        if os.path.exists(jp): j = json.load(open(jp))
        j.update(m); json.dump(j, open(jp, 'w'))
    n += 1
print('installed', n, 'sheets; old ones in', bdir)
