"""The material pass for small props, after finish.py: what the drawn props have and a render does not.

    rules = [{'do': 'streaks', 'mat': 'wood', 'dir': 'v'|'h', 'every': 3, 'len': (2, 5), 'step': -1},
             {'do': 'nails', 'mat': 'dkwood'},              # a dark dot at the corners of a frame material
             {'do': 'rim', 'mat': 'iron'},                  # the top edge of a metal band catches the light
             {'do': 'litside', 'mats': [...]},              # round things: one step lighter on the left third
             {'do': 'grass'}]                               # small grass ticks along the foot, so it sits in the ground
    apply(pxg_in, pxg_out, rules, mats)   mats = {material: 'letters dark->light'}
"""
import re


def hsh(a, b): return (a * 73856093 ^ b * 19349663) % 97


def apply(pin, pout, rules, mats, grass_cols=('#1f4420', '#2f6428', '#438232')):
    src = open(pin, encoding='utf-8').read()
    a = src.index('\ngrid\n') + 6; b = src.index('\nend', a)
    rows = [list(r) for r in src[a:b].split('\n')]; H = len(rows); W = max(len(r) for r in rows)
    rows = [r + ['.'] * (W - len(r)) for r in rows]
    def at(x, y): return rows[y][x] if 0 <= x < W and 0 <= y < H else '.'
    def step(ch, mat, d):
        L = mats[mat]; i = L.index(ch); return L[max(0, min(len(L) - 1, i + d))]
    extra_pal = []
    for R in rules:
        do = R['do']
        if do == 'streaks':   # grain / stave streaks, never on the silhouette edge
            L = mats[R['mat']]; ev = R.get('every', 3); lo, hi = R.get('len', (2, 5)); d = R.get('step', -1)
            if R.get('dir', 'h') == 'h':
                for y in range(H):
                    x = 0
                    while x < W:
                        if at(x, y) in L and hsh(x, y * 7) % ev == 0 and at(x - 1, y) in L:
                            n = lo + hsh(y, x) % (hi - lo + 1)
                            for k in range(n):
                                if at(x + k, y) in L and at(x + k + 1, y) in L: rows[y][x + k] = step(rows[y][x + k], R['mat'], d)
                            x += n + 2
                        else: x += 1
            else:
                for x in range(W):
                    y = 0
                    while y < H:
                        if at(x, y) in L and hsh(x * 5, y) % ev == 0 and at(x, y - 1) in L:
                            n = lo + hsh(x, y) % (hi - lo + 1)
                            for k in range(n):
                                if at(x, y + k) in L and at(x, y + k + 1) in L: rows[y + k][x] = step(rows[y + k][x], R['mat'], d)
                            y += n + 2
                        else: y += 1
        elif do == 'nails':   # where a frame board turns a corner, a nail head
            L = mats[R['mat']]
            for y in range(1, H - 1):
                for x in range(1, W - 1):
                    if at(x, y) in L:
                        h = sum(1 for dx in (-1, 1) if at(x + dx, y) in L); v = sum(1 for dy in (-1, 1) if at(x, y + dy) in L)
                        if h >= 1 and v >= 1 and (at(x - 1, y) not in L or at(x + 1, y) not in L) and (at(x, y - 1) not in L or at(x, y + 1) not in L):
                            rows[y][x] = L[0]
        elif do == 'rim':     # the upper edge of a metal band is lit
            L = mats[R['mat']]
            for y in range(1, H):
                for x in range(W):
                    if at(x, y) in L and at(x, y - 1) not in L: rows[y][x] = L[-1]
        elif do == 'litside':   # round things: the left third one step lighter, the right sixth one step darker
            for m in R['mats']:
                L = mats[m]
                for y in range(H):
                    xs = [x for x in range(W) if at(x, y) in L]
                    if len(xs) < 5: continue
                    x0, x1 = xs[0], xs[-1]; w = x1 - x0
                    for x in xs:
                        u = (x - x0) / max(1, w)
                        if u < .3: rows[y][x] = step(rows[y][x], m, 1)
                        elif u > .84: rows[y][x] = step(rows[y][x], m, -1)
        elif do == 'grass':     # small grass ticks along the foot of the object
            foot = {}
            for x in range(W):
                for y in range(H - 1, -1, -1):
                    if at(x, y) not in '.s': foot[x] = y; break
            ys = sorted(foot.values()); base = ys[len(ys) * 3 // 4] if ys else H - 1
            g = ['§', '¶', '¤']   # three letters of their own for the greens
            for k, c in enumerate(grass_cols): extra_pal.append((g[k], c))
            for x in range(W):
                if x in foot and abs(foot[x] - base) <= 1 and hsh(x, 3) % 2 == 0:
                    h = 1 + hsh(x, 5) % 2
                    for k in range(h):
                        yy = foot[x] - k
                        if 0 <= yy < H: rows[yy][x] = g[2 if k == h - 1 else 1]
                    if foot[x] + 1 < H and rows[foot[x] + 1][x] in '.s': rows[foot[x] + 1][x] = g[0]
    grid = '\n'.join(''.join(r) for r in rows)
    out = src[:a] + grid + src[b:]
    if extra_pal:
        i = out.index('\ngrid\n'); out = out[:i] + ''.join(f'\npal {c} {v}' for c, v in extra_pal) + out[i:]
    open(pout, 'w', encoding='utf-8').write(out)
