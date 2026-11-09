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
HI = conf.get('hi', '')
if HI: leaf = leaf + HI      # the highlight is the top step of the leaf ramp
def at(x, y): return rows[y][x] if 0 <= x < W and 0 <= y < H else '.'
# 0. small clusters (under min_cluster pixels) melt into their surroundings: no pits, rings or speckle
def components():
    seen = [[False] * W for _ in range(H)]; out = []
    for y0 in range(H):
        for x0 in range(W):
            c = rows[y0][x0]
            if seen[y0][x0] or c in '.s': continue
            st = [(x0, y0)]; seen[y0][x0] = True; comp = []
            while st:
                x, y = st.pop(); comp.append((x, y))
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < W and 0 <= ny < H and not seen[ny][nx] and rows[ny][nx] == c:
                        seen[ny][nx] = True; st.append((nx, ny))
            out.append((c, comp))
    return out
MINC = conf.get('min_cluster', 8)
for _ in range(3):
    for c, comp in components():
        if len(comp) >= MINC: continue
        nb = Counter(at(x + dx, y + dy) for x, y in comp for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
                     if at(x + dx, y + dy) not in ('.', 's', c))
        if nb:
            r = nb.most_common(1)[0][0]
            for x, y in comp: rows[y][x] = r
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
def hsh(a, b): return (a * 73856093 ^ b * 19349663) % 97
# 2. leaf shapes on the light/shade borders: a small pointed leaf of the lighter step hanging into the darker one
#    (3 px wide, 1 px tip), at uneven spacing, never on a lattice; now and then a dark gap biting up into the light
placed = [[False] * W for _ in range(H)]
for y in range(1, H - 3):
    for x in range(2, W - 2):
        c = rows[y][x]; below = at(x, y + 1)
        if c not in leaf or below not in leaf or leaf.index(c) <= leaf.index(below): continue
        if at(x, y + 2) != below or at(x, y + 3) not in leaf: continue          # the dark side must be deep enough
        if hsh(x, y) % conf.get('tuft_odds', 5): continue
        if any(placed[yy][xx] for yy in range(max(0, y - 2), min(H, y + 3)) for xx in range(max(0, x - 3), min(W, x + 4))): continue
        if hsh(y, x) % 4 == 0 and at(x, y - 1) == c and at(x, y - 2) == c:   # a gap between leaves
            rows[y][x] = below; rows[y - 1][x] = below
        else:
            for dx in (-1, 0, 1):
                if at(x + dx, y + 1) == below: rows[y + 1][x + dx] = c
            if at(x, y + 2) == below: rows[y + 2][x] = c
        placed[y][x] = True
if conf.get('tips', True):
    top = {}
    for x in range(W):
        for y in range(H):
            if rows[y][x] in leaf: top[x] = y; break
    x = 2
    while x < W - 2:
        if x in top and top.get(x - 1) is not None and top.get(x + 1) is not None:
            y = top[x]; c = rows[y][x]; k = hsh(x, 7) % 3
            if k < 2 and y >= 2:   # a pointed leaf: 3 px base, 1 px tip
                for dx in (-1, 0, 1):
                    if rows[y - 1][x + dx] == '.': rows[y - 1][x + dx] = rows[top[x + dx]][x + dx] if (x + dx) in top else c
                if rows[y - 2][x] == '.': rows[y - 2][x] = c
            else:                  # a notch between leaves
                rows[y][x] = '.'
        x += 4 + hsh(x, 3) % 4
    for side in (1, -1):           # the same along the left and right edges of the crown
        y = 2
        while y < H - 2:
            xs_ = [x for x in range(W) if rows[y][x] in leaf]
            if xs_:
                x = xs_[-1] if side > 0 else xs_[0]
                if 0 < x + 2 * side < W and rows[y][x + side] == '.' and at(x, y - 1) in leaf and at(x, y + 1) in leaf:
                    c = rows[y][x]
                    if hsh(y, 11 + side) % 3 < 2:
                        for dy in (-1, 0, 1):
                            if rows[y + dy][x + side] == '.' and at(x, y + dy) in leaf: rows[y + dy][x + side] = rows[y + dy][x]
                        rows[y][x + 2 * side] = c
                    else:
                        rows[y][x] = '.'
            y += 4 + hsh(y, 5) % 4
deep = leaf[0]
for y in range(H):
    for x in range(W):
        if rows[y][x] == deep and at(x, y + 1) in leaf and at(x, y + 2) in leaf: rows[y][x] = leaf[1]
for y in range(H):
    for x in range(W):
        if rows[y][x] in leaf and at(x, y + 1) not in leaf: rows[y][x] = deep
if bark:
    # 6. bark: broken vertical grooves one step darker, a lit edge on the left, one knot
    cols = {}
    for x in range(W):
        ys_ = [y for y in range(H) if rows[y][x] in bark]
        if ys_: cols[x] = ys_
    xs_ = sorted(cols)
    def darker(c): i = bark.index(c); return bark[max(0, i - 1)]
    def lighter(c): i = bark.index(c); return bark[min(len(bark) - 1, i + 1)]
    for x in xs_:
        ys_ = cols[x]
        if at(x - 1, ys_[len(ys_) // 2]) not in bark or at(x + 1, ys_[len(ys_) // 2]) not in bark: continue
        if hsh(x, 1) % 3 == 0:                 # a groove: broken runs of 3-8 px
            y = ys_[0] + hsh(x, 2) % 4
            while y < ys_[-1] - 1:
                n = 3 + hsh(x, y) % 6
                for k in range(n):
                    if at(x, y + k) in bark: rows[y + k][x] = darker(rows[y + k][x])
                    if hsh(x + k, y) % 3 == 0 and at(x - 1, y + k) in bark and at(x - 2, y + k) in bark:
                        rows[y + k][x - 1] = lighter(rows[y + k][x - 1])   # a ridge catching the light beside it
                y += n + 2 + hsh(y, x) % 4
    if xs_:                                    # lit edge: the second column from the left, broken
        for y in cols[xs_[0] + 1] if xs_[0] + 1 in cols else []:
            if hsh(y, 9) % 4 and at(xs_[0] + 1, y) in bark: rows[y][xs_[0] + 1] = lighter(rows[y][xs_[0] + 1])
        kx = xs_[len(xs_) // 2 - 1]; kys = cols[kx]; ky = kys[len(kys) * 3 // 5] if kys else 0
        if kys and all(at(kx + dx, ky + dy) in bark for dx in (-1, 0, 1, 2) for dy in (-1, 0, 1, 2)):
            for dx, dy in ((0, 0), (1, 0), (0, 1), (1, 1)): rows[ky + dy][kx + dx] = bark[0]
            for dx, dy in ((0, -1), (1, -1), (-1, 0), (-1, 1)): rows[ky + dy][kx + dx] = lighter(rows[ky + dy][kx + dx])
    for x in range(W):
        for y in range(H):
            if rows[y][x] in bark and at(x, y - 1) in leaf:
                for k in range(3):
                    if at(x, y + k) in bark: rows[y + k][x] = bark[0]
# 7. fallen leaves round the foot of the tree (it's autumn): small 2-3 px leaves, darker inside the shadow
LT = conf.get('litter')
if LT and bark:
    bys = [(x, y) for y in range(H) for x in range(W) if rows[y][x] in bark]
    by = max(y for x, y in bys); bx = sum(x for x, y in bys if y >= by - 2) // max(1, len([1 for x, y in bys if y >= by - 2]))
    n = 0; i = 0
    while n < LT.get('n', 14) and i < 400:
        i += 1
        dx = (hsh(i, 21) % (2 * LT.get('rx', 30) + 1)) - LT.get('rx', 30); dy = (hsh(i, 22) % (2 * LT.get('ry', 9) + 1)) - LT.get('ry', 9) // 2
        if (dx / LT.get('rx', 30)) ** 2 + (dy / LT.get('ry', 9)) ** 2 > 1: continue
        x, y = bx + dx, by + dy
        shape = [[(0, 0), (1, 0)], [(0, 0), (1, 0), (1, -1)], [(0, 0), (1, 0), (2, 0), (1, -1)], [(0, 0), (1, 1), (1, 0)]][hsh(i, 23) % 4]
        if not all(0 <= x + a < W and 0 <= y + b < H and rows[y + b][x + a] in '.s' for a, b in shape): continue
        if any(at(x + a + ex, y + b + ey) in bark + leaf for a, b in shape for ex in (-1, 0, 1) for ey in (-1, 0, 1)): continue
        cols = LT.get('cols', 'abcd')     # their own palette letters, so the outline skips them (no ring round a leaf)
        inshade = rows[y][x] == 's'
        c = cols[(hsh(i, 24) % (len(cols) - 1))] if inshade else cols[1 + hsh(i, 24) % (len(cols) - 1)]
        for a, b in shape: rows[y + b][x + a] = c
        n += 1
grid = '\n'.join(''.join(r) for r in rows)
pal = '\n'.join(f'pal {k} {v}' for k, v in conf['palette'].items())
if LT:   # fallen leaves: a little duller and darker than the living crown (and distinct colours, so the outline,
         # which reads colours, never mistakes crown pixels for litter)
    def dull(hx):
        r, g, b = (int(hx[i:i + 2], 16) for i in (1, 3, 5)); m = (r + g + b) / 3
        return '#%02x%02x%02x' % tuple(max(0, min(255, int((v * .82 + m * .18) * .9))) for v in (r, g, b))
    pal += '\n' + '\n'.join(f'pal {c} {dull(conf["palette"][src])}' for c, src in zip(LT.get('cols', ''), LT.get('from', '')))
open(sys.argv[2], 'w').write(f"""name {conf['name']}
anchor {conf['anchor'][0]} {conf['anchor'][1]}
{pal}
pal O {conf['outline'][0]}
pal o {conf['outline'][1]}
grid
{grid}
end
outline O o s{conf.get('litter', {}).get('cols', '')}
"""); print('ok')
