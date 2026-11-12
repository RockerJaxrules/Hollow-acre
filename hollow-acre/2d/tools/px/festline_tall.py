"""The festival lantern string and bunting hung at chest height (owner: "this is too low"): the poles were as tall as the
farmer, so you walked through the lanterns. This lifts them: the posts are drawn 52 px taller (each post column repeated
from a clean row of the old post), the string and its lanterns stay at the top, so the lowest lantern clears a farmer's
head by a hand. Run: python3 festline_tall.py <root> [<root> ...] (each root has spr/lpc/obj and spr/lpc/objects.json)."""
import sys, os, json
from PIL import Image
LIFT = 52
SRC = {'f_lanterns': 42, 'f_bunting': 40}     # the last row of the string's art; below it there are only the posts
def lift(im, cut):
    W, H = im.size; p = im.load()
    out = Image.new('RGBA', (W, H + LIFT), (0, 0, 0, 0)); q = out.load()
    for y in range(cut + 1):
        for x in range(W): q[x, y] = p[x, y]
    for y in range(cut + 1, H):
        for x in range(W): q[x, y + LIFT] = p[x, y]
    ref = cut + 6                                   # a clean row of post below the string
    for y in range(cut + 1, cut + 1 + LIFT):
        for x in range(W):
            if p[x, ref][3]: q[x, y] = p[x, ref]
    return out
if __name__ == '__main__':
    roots = sys.argv[1:]
    for root in roots:
        meta_p = os.path.join(root, 'spr', 'lpc', 'objects.json'); meta = json.load(open(meta_p))
        for k, cut in SRC.items():
            path = os.path.join(root, 'spr', 'lpc', 'obj', k + '.png'); im = Image.open(path).convert('RGBA')
            if im.height != 64: print(k, 'already lifted in', root); continue
            bak = os.path.join(root, 'spr', 'lpc', 'obj', k + '_low.png')
            if not os.path.exists(bak): im.save(bak)
            out = lift(im, cut); out.save(path)
            m = meta[k]; m['fh'] = out.height; m['ay'] = m['ay'] + LIFT
            print(k, im.size, '->', out.size, 'ay', m['ay'])
        json.dump(meta, open(meta_p, 'w'), indent=0)
