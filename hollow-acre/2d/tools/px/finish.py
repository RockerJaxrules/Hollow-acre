"""The hand pass over a blockout reference: what renders and AI get wrong, done the pixel-artist way.
1. clean clusters: a lone speck takes the majority of its 3x3 neighbourhood (no stray pixels);
2. leaf texture only on the borders between light and shade: a small V of the lighter step reaching down into the
   darker side, a notch of the darker step biting up into the lighter side, every few pixels (interiors stay quiet);
3. the deepest step only along the bottom edge of the foliage;
4. one outline round the finished silhouette, a darker version of the colour beside it, lighter on the lit top-left;
5. the trunk darkened where the crown shades it.
    python3 finish.py ref.grid.txt out.pxg settings.json
"""
import sys, json
from collections import Counter
rows = [list(r) for r in open(sys.argv[1]).read().split('\n')]
H, W = len(rows), len(rows[0]); conf = json.load(open(sys.argv[3]))
leaf = conf['leaf']; bark = conf.get('bark', '')
def at(x, y): return rows[y][x] if 0 <= x < W and 0 <= y < H else '.'
for _ in range(2):
    new = [r[:] for r in rows]
    for y in range(H):
        for x in range(W):
            c = rows[y][x]
            if c in '.s': continue
            if c not in (at(x + 1, y), at(x - 1, y), at(x, y + 1), at(x, y - 1)):
                nb = Counter(at(x + dx, y + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if (dx or dy) and at(x + dx, y + dy) not in '.s')
                if nb: new[y][x] = nb.most_common(1)[0][0]
    rows = new
step = conf.get('tuft_step', 4)
for y in range(1, H - 3):
    for x in range(1, W - 3):
        c = rows[y][x]
        if c not in leaf: continue
        below = at(x, y + 1)
        if below in leaf and below != c and (x + y * 3) % step == 0:
            hi, lo = (c, below) if leaf.index(c) > leaf.index(below) else (below, c)
            for dx, dy in [(0, 0), (1, 1), (2, 0), (1, 2)]:
                if at(x + dx, y + 1 + dy) == lo: rows[y + 1 + dy][x + dx] = hi
            if at(x + 1, y - 1) == hi and (x // step) % 2: rows[y - 1][x + 1] = lo
deep = leaf[0]
for y in range(H):
    for x in range(W):
        if rows[y][x] == deep and at(x, y + 1) in leaf and at(x, y + 2) in leaf: rows[y][x] = leaf[1]
for y in range(H):
    for x in range(W):
        if rows[y][x] in leaf and at(x, y + 1) not in leaf: rows[y][x] = deep
if bark:
    for x in range(W):
        for y in range(H):
            if rows[y][x] in bark and at(x, y - 1) in leaf:
                for k in range(3):
                    if at(x, y + k) in bark: rows[y + k][x] = bark[0]
grid = '\n'.join(''.join(r) for r in rows)
pal = '\n'.join(f'pal {k} {v}' for k, v in conf['palette'].items())
open(sys.argv[2], 'w').write(f"""name {conf['name']}
anchor {conf['anchor'][0]} {conf['anchor'][1]}
{pal}
pal O {conf['outline'][0]}
pal o {conf['outline'][1]}
grid
{grid}
end
outline O o s
"""); print('ok')
