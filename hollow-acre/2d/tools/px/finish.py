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
# 1a. one dome lit from the top-left (judge, three rounds: "a pile of balls, each lobe with its own full highlight"):
#     the top two steps survive only toward the crown's top-left; further right or lower they step down one or two
if leaf and conf.get('hi_zone', True) and conf.get('tufts', True) and len(leaf) >= 5:
    pts = [(x, y) for y in range(H) for x in range(W) if rows[y][x] in leaf]
    if pts:
        x0 = min(p[0] for p in pts); x1 = max(p[0] for p in pts); y0 = min(p[1] for p in pts); y1 = max(p[1] for p in pts)
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2; rx, ry = max(1, (x1 - x0) / 2), max(1, (y1 - y0) / 2)
        for (x, y) in pts:
            c = rows[y][x]; i = leaf.index(c)
            if i < len(leaf) - 2: continue
            d = (x - cx) / rx * .62 + (y - cy) / ry * .78   # how far toward the shaded bottom-right
            if d > .55: rows[y][x] = leaf[max(0, i - 2)]
            elif d > .12: rows[y][x] = leaf[i - 1]
# 1b. the lit zone stays clean (judge: "each clump's lit top one clean shape with 2-3 placed highlight leaves"): shards
#     of the top steps under lit_merge pixels melt into their clump, then a majority pass rounds the lit shapes off
LM = conf.get('lit_merge', 0)
if leaf and LM:
    lit = leaf[-3:]
    for _ in range(3):
        for c, comp in components():
            if c not in lit or len(comp) >= LM: continue
            nb = Counter(at(x + dx, y + dy) for x, y in comp for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
                         if at(x + dx, y + dy) in leaf and at(x + dx, y + dy) != c)
            if nb:
                r = nb.most_common(1)[0][0]
                for x, y in comp: rows[y][x] = r
    for _ in range(2):
        new = [r[:] for r in rows]
        for y in range(1, H - 1):
            for x in range(1, W - 1):
                c = rows[y][x]
                if c not in lit: continue
                nb = Counter(at(x + dx, y + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if (dx or dy))
                m, k = nb.most_common(1)[0]
                if m != c and m in lit and k >= 5: new[y][x] = m
        rows = new
    # 2-3 highlight leaves on each big lit clump, toward its top-left: a small pointed leaf of the top step
    top = leaf[-1]
    for c, comp in components():
        if c != leaf[-2] or len(comp) < 30: continue
        xs = sorted(comp, key=lambda p: p[0] + p[1])   # top-left first
        n = 0
        for (x, y) in xs[len(xs) // 6::max(1, len(xs) // 5)]:
            if n >= (3 if len(comp) > 80 else 2): break
            cells = [(x, y), (x + 1, y), (x - 1, y + 1), (x, y + 1), (x + 1, y + 1), (x, y + 2)] if hsh(x, y) % 2 else [(x, y), (x + 1, y), (x + 1, y + 1), (x + 2, y + 1), (x + 1, y + 2)]
            if all(at(a, b) == c for a, b in cells):
                for a, b in cells: rows[b][a] = top
                n += 1
# 2. leaf shapes on the light/shade borders: a small pointed leaf of the lighter step hanging into the darker one
#    (3 px wide, 1 px tip), at uneven spacing, never on a lattice; now and then a dark gap biting up into the light
placed = [[False] * W for _ in range(H)]
for y in (range(1, H - 3) if leaf and conf.get('tufts', True) else ()):
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
if leaf and conf.get('tips', True):
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
if leaf and conf.get('deep_edge', True):
    deep = leaf[0]
    for y in range(H):
        for x in range(W):
            if rows[y][x] == deep and at(x, y + 1) in leaf and at(x, y + 2) in leaf: rows[y][x] = leaf[1]
    for y in range(H):
        for x in range(W):
            if rows[y][x] in leaf and at(x, y + 1) not in leaf: rows[y][x] = deep
# 3b. the underside is clumps too, not a flat dark skirt (judge): a row of dim clumps along the bottom of the crown,
#     each with a faint lit top-left and the deepest step only in the gaps between them and along the rim
if leaf and conf.get('under_clumps', True) and len(leaf) >= 4 and conf.get('tufts', True):
    bot = {}
    for x in range(W):
        ys_ = [y for y in range(H) if rows[y][x] in leaf]
        if ys_: bot[x] = ys_[-1]
    dark = (leaf[0], leaf[1])
    x = min(bot) + 3 if bot else W
    while x < (max(bot) - 3 if bot else 0):
        w = 7 + hsh(x, 31) % 9; h = 4 + hsh(x, 32) % 4   # uneven sizes: not a row of piped icing
        xc = x + w // 2
        if xc in bot and hsh(x, 34) % 5:   # now and then a gap in the row
            yc = bot[xc] - h + 1 - hsh(x, 35) % 3
            for yy in range(yc - h, yc + h + 1):
                for xx in range(xc - w // 2, xc + w // 2 + 1):
                    if not (0 <= xx < W and 0 <= yy < H): continue
                    e = ((xx - xc) / (w / 2)) ** 2 + ((yy - yc) / h) ** 2
                    if e > 1 or rows[yy][xx] not in dark or at(xx, yy + 1) not in leaf: continue
                    if e > .72 and yy > yc: rows[yy][xx] = leaf[0]            # the gap under the clump
                    elif (xx - xc) + (yy - yc) * 1.4 < -1.5: rows[yy][xx] = leaf[2]   # its dim lit top-left
                    else: rows[yy][xx] = leaf[1]
        x += max(4, w - 4 + hsh(x, 33) % 6)   # some overlap, some don't
BS = conf.get('bark_style', 'grooves')
if bark and BS == 'birch':
    # 6b. birch: pale bark with short dark horizontal marks (lenticels) and a few dark patches
    def darker(c): i = bark.index(c); return bark[max(0, i - 1)]
    for y in range(H):
        x = 0
        while x < W:
            if rows[y][x] in bark and hsh(x, y) % 9 == 0 and at(x - 1, y) in bark:
                n = 2 + hsh(y, x) % 3
                for k in range(n):
                    if at(x + k, y) in bark: rows[y][x + k] = bark[0] if k else darker(rows[y][x + k])
                x += n + 3
            else: x += 1
if bark and BS == 'grooves':
    # 6. bark: broken vertical grooves one step darker, a lit edge on the left, one knot
    cols = {}
    for x in range(W):
        ys_ = [y for y in range(H) if rows[y][x] in bark]
        if ys_: cols[x] = ys_
    xs_ = sorted(cols)
    def darker(c): i = bark.index(c); return bark[max(0, i - 1)]
    def lighter(c): i = bark.index(c); return bark[min(len(bark) - 1, i + 1)]
    TS = sum(ord(ch) * (i + 3) for i, ch in enumerate(conf.get('name', ''))) % 89   # each tree its own bark
    for x in xs_:
        ys_ = cols[x]
        if at(x - 1, ys_[len(ys_) // 2]) not in bark or at(x + 1, ys_[len(ys_) // 2]) not in bark: continue
        if hsh(x + TS, 1) % 3 == 0:            # a groove: long runs that wander a pixel left or right, not a dashed zipper
            y = ys_[0] + hsh(x + TS, 2) % 4; gx = x
            while y < ys_[-1] - 1:
                n = 6 + hsh(x + TS, y) % 9
                for k in range(n):
                    if k and hsh(gx + TS, y + k) % 7 == 0 and at(gx + (1 if hsh(y + k, TS) % 2 else -1), y + k) in bark:
                        gx += 1 if hsh(y + k, TS) % 2 else -1
                    if at(gx, y + k) in bark: rows[y + k][gx] = darker(rows[y + k][gx])
                    if at(gx - 1, y + k) in bark and at(gx - 2, y + k) in bark and hsh(gx + k, y + TS) % 2 == 0:
                        rows[y + k][gx - 1] = lighter(rows[y + k][gx - 1])   # the ridge beside it catches the light
                y += n + 1 + hsh(y, x + TS) % 3
    if xs_:                                    # lit edge: the second column from the left, broken
        for y in cols[xs_[0] + 1] if xs_[0] + 1 in cols else []:   # a solid lit edge, and a broken second column
            if at(xs_[0] + 1, y) in bark: rows[y][xs_[0] + 1] = lighter(rows[y][xs_[0] + 1])
            if hsh(y, 9 + TS) % 3 == 0 and at(xs_[0] + 2, y) in bark: rows[y][xs_[0] + 2] = lighter(rows[y][xs_[0] + 2])
        kx = xs_[len(xs_) // 2 - 1]; kys = cols[kx]; ky = kys[len(kys) * 3 // 5] if kys else 0
        if kys and all(at(kx + dx, ky + dy) in bark for dx in (-1, 0, 1, 2) for dy in (-1, 0, 1, 2)):
            for dx, dy in ((0, 0), (1, 0), (0, 1), (1, 1)): rows[ky + dy][kx + dx] = bark[0]
            for dx, dy in ((0, -1), (1, -1), (-1, 0), (-1, 1)): rows[ky + dy][kx + dx] = lighter(rows[ky + dy][kx + dx])
if bark and leaf:
    for x in range(W):
        for y in range(H):
            if rows[y][x] in bark and at(x, y - 1) in leaf:   # the crown's shadow across the top of the trunk
                for k in range(3 + hsh(x, 41) % 2):
                    if at(x, y + k) in bark: rows[y + k][x] = bark[0]
                for k in range(3 + hsh(x, 41) % 2, 7 + hsh(x, 42) % 3):
                    if at(x, y + k) in bark and bark.index(rows[y + k][x]) > 1: rows[y + k][x] = bark[1]
# 8. end grain on a cut top (stumps, logs): growth rings round the middle, foreshortened, and one crack
RG = conf.get('rings')
if RG:
    pts = [(x, y) for y in range(H) for x in range(W) if rows[y][x] in RG]
    if pts:
        cx = sum(p[0] for p in pts) / len(pts); cy = sum(p[1] for p in pts) / len(pts)
        for x, y in pts:
            d = ((x - cx) ** 2 + ((y - cy) * 2) ** 2) ** .5
            if int(d) % 3 == 2: rows[y][x] = RG[max(0, RG.index(rows[y][x]) - 1)]
        for x in range(int(cx), W):
            if at(x, int(cy)) in RG and hsh(x, 5) % 5: rows[int(cy)][x] = RG[0]
# 9. fruit and berries in the foliage (apples, holly, elder): small lit balls, never on the bottom edge
FR = conf.get('fruit')
if FR and leaf:
    fx = FR['chars']; size = FR.get('size', 2); n = 0; i = 0; got = []
    while n < FR.get('n', 8) and i < 3000:
        i += 1; x = 3 + hsh(i, 31) * 131 % (W - 6); y = 3 + hsh(i, 37) * 151 % (H - 6)
        if not all(at(x + a, y + b) in leaf for a in range(-1, size + 1) for b in range(-1, size + 3)): continue
        if any(abs(x - gx) + abs(y - gy) < FR.get('gap', 6) for gx, gy in got): continue
        if size == 3:          # an apple: a lit ball, light top-left, dark bottom-right
            for (a, b), ch in zip([(0, 0), (1, 0), (2, 0), (0, 1), (1, 1), (2, 1), (0, 2), (1, 2), (2, 2)], [2, 1, 1, 1, 1, 0, 1, 0, 0]):
                if not (a, b) in ((0, 0), (2, 2)) or ch: rows[y + b][x + a] = fx[ch]
            rows[y - 1][x + 1] = bark[0] if bark else fx[0]      # a stalk
        elif size == 2:
            rows[y][x] = fx[2]; rows[y][x + 1] = fx[1]; rows[y + 1][x] = fx[1]; rows[y + 1][x + 1] = fx[0]
        else:
            rows[y][x] = fx[2]; rows[y][x + 1] = fx[1]; rows[y + 1][x] = fx[0]
        got.append((x, y)); n += 1
# 7. fallen leaves round the foot of the tree (it's autumn): small 2-3 px leaves, darker inside the shadow
LT = conf.get('litter')
if LT:
    solid = [(x, y) for y in range(H) for x in range(W) if rows[y][x] not in '.s']
    by = max(y for x, y in solid); low = [x for x, y in solid if y >= by - 2]; bx = sum(low) // max(1, len(low))
    n = 0; i = 0
    while n < LT.get('n', 14) and i < 400:
        i += 1
        dx = (hsh(i, 21) % (2 * LT.get('rx', 30) + 1)) - LT.get('rx', 30); dy = (hsh(i, 22) % (2 * LT.get('ry', 9) + 1)) - LT.get('ry', 9) // 2
        if (dx / LT.get('rx', 30)) ** 2 + (dy / LT.get('ry', 9)) ** 2 > 1: continue
        x, y = bx + dx, by + dy
        shape = [[(1, -1), (2, -1), (0, 0), (1, 0), (2, 0), (3, 0), (1, 1), (2, 1)], [(0, -1), (1, -1), (0, 0), (1, 0), (2, 0), (2, 1), (3, 1)],
                 [(2, -1), (3, -1), (1, 0), (2, 0), (3, 0), (0, 1), (1, 1)]][hsh(i, 23) % 3]   # 4x3 leaves, two-tone (below)
        if not all(0 <= x + a < W and 0 <= y + b < H and rows[y + b][x + a] in '.s' for a, b in shape): continue
        if any(at(x + a + ex, y + b + ey) not in '.s' for a, b in shape for ex in (-1, 0, 1) for ey in (-1, 0, 1)): continue
        cols = LT.get('cols', 'abcd')     # their own palette letters, so the outline skips them (no ring round a leaf)
        inshade = rows[y][x] == 's'
        c = cols[(hsh(i, 24) % (len(cols) - 1))] if inshade else cols[1 + hsh(i, 24) % (len(cols) - 1)]
        for a, b in shape: rows[y + b][x + a] = c
        lt = cols[min(len(cols) - 1, cols.index(c) + 1)]; dk = cols[max(0, cols.index(c) - 1)]
        a0, b0 = min(shape, key=lambda p: p[0] + p[1] * 2); rows[y + b0][x + a0] = lt   # lit top-left
        a1, b1 = max(shape, key=lambda p: p[0] + p[1] * 2); rows[y + b1][x + a1] = dk   # dark tip
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
