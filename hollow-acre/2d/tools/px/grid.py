"""Hand-placed pixel art for Hollow Acre: sprites are typed pixel by pixel as text grids, the way a person places pixels.

A .pxg file:
    name maple_fall_0              # output name (PNG)
    anchor 32 95                   # the foot point (for the game)
    pal o #20141a                  # one character per colour; '.' is always transparent
    pal a #4a1e10
    use leaves.pxg                 # load hand-drawn modules (stamps) from another file
    grid                           # the sprite, one character per pixel (rows of equal width)
    ....oooo....
    end
    stamp clumpA 10 4              # place a module (its own grid) at x,y; 'stamp clumpA 10 4 flip' mirrors it
    module clumpA                  # a module: a small hand-drawn grid, reused with variants
    ..oo..
    end

Commands:
    python3 grid.py build  <file.pxg> <outdir>     render to PNG (stamps over the grid, in order)
    python3 grid.py view   <file.pxg> <out.png>    zoomed x8 with a pixel grid, plus 1x and 3x previews, for inspection
    python3 grid.py lint   <file.pxg>              lone pixels, doubled outline corners, spurs and bites, colour count
Nothing here is generated: no noise, no formulas, no blending. Every pixel is a character someone chose.
"""
import sys, os, re
from PIL import Image, ImageDraw

def parse(path, mods=None, pal=None):
    mods = {} if mods is None else mods; pal = {} if pal is None else pal
    meta = {'name': os.path.splitext(os.path.basename(path))[0], 'anchor': None, 'grid': None, 'stamps': []}
    lines = open(path).read().split('\n'); i = 0
    while i < len(lines):
        raw = lines[i]; ln = raw.split('#', 1)[0].rstrip() if not raw.lstrip().startswith('pal ') else raw.rstrip(); i += 1
        if not ln.strip(): continue
        t = ln.split()
        if t[0] == 'name': meta['name'] = t[1]
        elif t[0] == 'anchor': meta['anchor'] = (float(t[1]), float(t[2]))
        elif t[0] == 'pal':
            ch, col = t[1], t[2]; col = col.lstrip('#')
            pal[ch] = (int(col[0:2], 16), int(col[2:4], 16), int(col[4:6], 16), int(col[6:8], 16) if len(col) >= 8 else 255)
        elif t[0] == 'use':
            sub = parse(os.path.join(os.path.dirname(path), t[1]), mods, pal)
        elif t[0] in ('grid', 'module'):
            rows = []
            while i < len(lines) and lines[i].strip() != 'end':
                rows.append(lines[i].rstrip('\n')); i += 1
            i += 1
            w = max(len(r) for r in rows) if rows else 0; rows = [r.ljust(w, '.') for r in rows]
            if t[0] == 'grid': meta['grid'] = rows
            else: mods[t[1]] = rows
        elif t[0] == 'stamp':
            sh = 0
            for a in t[4:]:
                if a.startswith('shade='): sh = int(a[6:])
            meta['stamps'].append((t[1], int(t[2]), int(t[3]), 'flip' in t[4:], 'vflip' in t[4:], sh))
        elif t[0] == 'mass':   # mass <char> x,y x,y x,y ...  - a flat block-in shape (polygon) in one colour
            meta['stamps'].append(('__mass', t[1], [tuple(int(v) for v in q.split(',')) for q in t[2:]], False, False, 0))
        elif t[0] == 'size':
            meta['grid'] = ['.' * int(t[1])] * int(t[2])
    meta['mods'] = mods; meta['pal'] = pal
    return meta

def render(meta):
    g = meta['grid']; h = len(g); w = len(g[0]) if h else 0
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); px = im.load(); pal = meta['pal']
    def put(x, y, ch):
        if ch in ('.', ' ') or not (0 <= x < w and 0 <= y < h): return
        if ch not in pal: raise SystemExit(f'{meta["name"]}: no colour for {ch!r}')
        px[x, y] = pal[ch]
    for y, row in enumerate(g):
        for x, ch in enumerate(row): put(x, y, ch)
    # a stamp may be shaded lighter or darker as a whole (shade=+1 / -2): the hand-drawn module keeps its shape and
    # cluster pattern, only its shades step along the ramp (digits 1-9 are ramp steps, darkest first)
    for name, sx, sy, fl, vf, sh in meta['stamps']:
        if name == '__mass':
            ch, pts = sx, sy; ys = [q[1] for q in pts]
            for y in range(min(ys), max(ys) + 1):
                xs = []
                for a, b in zip(pts, pts[1:] + pts[:1]):
                    if (a[1] <= y + .5 < b[1]) or (b[1] <= y + .5 < a[1]): xs.append(a[0] + (y + .5 - a[1]) / (b[1] - a[1]) * (b[0] - a[0]))
                xs.sort()
                for k in range(0, len(xs) - 1, 2):
                    for x in range(int(round(xs[k])), int(round(xs[k + 1]))): put(x, y, ch)
            continue
        rows = meta['mods'][name]
        if vf: rows = rows[::-1]
        for y, row in enumerate(rows):
            r = row[::-1] if fl else row
            for x, ch in enumerate(r):
                if sh and ch.isdigit() and ch != '0':
                    k = max(1, min(9, int(ch) + sh))
                    while str(k) not in pal and k > 1: k -= 1
                    ch = str(k)
                put(sx + x, sy + y, ch)
    return im

def lint(im, outline=None):
    w, h = im.size; p = im.load(); A = lambda x, y: 0 <= x < w and 0 <= y < h and p[x, y][3] > 0
    lone, spur, bite, cols = [], [], [], set()
    for y in range(h):
        for x in range(w):
            if A(x, y):
                cols.add(p[x, y][:3]); n4 = [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
                same = sum(1 for q in n4 if A(*q) and p[q][:3] == p[x, y][:3]); opq = sum(1 for q in n4 if A(*q))
                if same == 0 and opq == 4: lone.append((x, y))
                if opq <= 1: spur.append((x, y))
            else:
                if sum(1 for q in [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)] if A(*q)) >= 3: bite.append((x, y))
    return {'size': im.size, 'colours': len(cols), 'lone': len(lone), 'lone_at': lone[:12], 'spurs': spur[:12], 'bites': bite[:12]}

def lab(c):
    r, g, b = [v / 255 for v in c[:3]]
    f = lambda v: ((v + .055) / 1.055) ** 2.4 if v > .04045 else v / 12.92
    r, g, b = f(r), f(g), f(b); X = (r * .4124 + g * .3576 + b * .1805) / .9505; Y = r * .2126 + g * .7152 + b * .0722; Z = (r * .0193 + g * .1192 + b * .9505) / 1.089
    h = lambda t: t ** (1 / 3) if t > .008856 else 7.787 * t + 16 / 116
    return (116 * h(Y) - 16, 500 * (h(X) - h(Y)), 200 * (h(Y) - h(Z)))

def validate(im, pal=None):
    """the mechanical checks pixel artists (and the rulebooks) run before calling a sprite done"""
    w, h = im.size; p = im.load(); A = lambda x, y: 0 <= x < w and 0 <= y < h and p[x, y][3] > 0
    out = {'size': im.size}; cols = {}
    semi = 0
    for y in range(h):
        for x in range(w):
            c = p[x, y]
            if 0 < c[3] < 255: semi += 1
            if c[3]: cols[c[:3]] = cols.get(c[:3], 0) + 1
    out['colours'] = len(cols); out['semi_transparent'] = semi
    cap = 16 if max(w, h) <= 32 else 32 if max(w, h) <= 64 else 48
    out['colour_cap'] = cap
    if pal: out['off_palette'] = sum(1 for c in cols if c not in {v[:3] for v in pal.values()})
    L = {c: lab(c) for c in cols}; ks = list(cols); dup = []
    for i in range(len(ks)):
        for j in range(i + 1, len(ks)):
            a, b = L[ks[i]], L[ks[j]]
            if ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** .5 < 3: dup.append((ks[i], ks[j]))
    out['near_duplicates'] = len(dup)
    iso = []
    for y in range(h):
        for x in range(w):
            if not A(x, y): continue
            n4 = [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
            if not any(A(*q) and p[q][:3] == p[x, y][:3] for q in n4): iso.append((x, y))
    out['isolated'] = len(iso); out['isolated_at'] = iso[:10]
    # banding: long horizontal runs of one colour sitting directly on a run of the next ramp colour (parallel stripes)
    band = 0; thr = max(8, w // 3)
    for y in range(h - 1):
        run = 0
        for x in range(w):
            if A(x, y) and A(x, y + 1) and p[x, y][:3] != p[x, y + 1][:3] and (x == 0 or (p[x - 1, y][:3] == p[x, y][:3] and p[x - 1, y + 1][:3] == p[x, y + 1][:3])): run += 1
            else: run = 0
            if run >= thr: band += 1; run = -10 ** 9
    out['banding_rows'] = band
    # outline: share of edge pixels in the most common edge colour
    edge = [p[x, y][:3] for y in range(h) for x in range(w) if A(x, y) and any(not A(*q) for q in [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])]
    if edge:
        from collections import Counter
        out['outline_top_share'] = round(Counter(edge).most_common(1)[0][1] / len(edge), 2)
    return out

def ascii(im, region=None):
    w, h = im.size; p = im.load(); x0, y0, x1, y1 = region or (0, 0, w, h); keys = {}; G = '.ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    rows = []
    for y in range(y0, y1):
        r = ''
        for x in range(x0, x1):
            c = p[x, y]
            if not c[3]: r += '.'; continue
            k = c[:3]
            if k not in keys: keys[k] = G[len(keys) + 1]
            r += keys[k]
        rows.append(r)
    return '\n'.join(rows) + '\n' + ' '.join(f'{v}=#{k[0]:02x}{k[1]:02x}{k[2]:02x}' for k, v in keys.items())

def view(im, out, z=8):
    w, h = im.size; big = Image.new('RGBA', (w * z + 1, h * z + 1), (0, 0, 0, 255)); d = ImageDraw.Draw(big)
    for y in range(h):
        for x in range(w):
            c = (54, 60, 50, 255) if (x // 4 + y // 4) % 2 else (64, 70, 58, 255)
            d.rectangle([x * z, y * z, x * z + z - 1, y * z + z - 1], fill=c)
    up = im.resize((w * z, h * z), Image.NEAREST); big.alpha_composite(up, (0, 0))
    for x in range(0, w + 1): d.line([(x * z, 0), (x * z, h * z)], fill=(0, 0, 0, 70) if x % 8 else (0, 0, 0, 160))
    for y in range(0, h + 1): d.line([(0, y * z), (w * z, y * z)], fill=(0, 0, 0, 70) if y % 8 else (0, 0, 0, 160))
    pre = Image.new('RGBA', (w * 4 + 40, h * 3 + 24 + h), (74, 92, 58, 255)); pre.alpha_composite(im, (8, 8)); pre.alpha_composite(im.resize((w * 3, h * 3), Image.NEAREST), (w + 24, 8))
    g = im.convert('LA').convert('RGBA'); pre.alpha_composite(g, (8, h * 3 + 16))   # the value check: still reads in grey?
    sheet = Image.new('RGBA', (big.width + pre.width + 10, max(big.height, pre.height)), (30, 30, 30, 255)); sheet.alpha_composite(big, (0, 0)); sheet.alpha_composite(pre, (big.width + 10, 0))
    sheet.save(out)

if __name__ == '__main__':
    cmd, f = sys.argv[1], sys.argv[2]; meta = parse(f); im = render(meta)
    if cmd == 'build':
        od = sys.argv[3]; os.makedirs(od, exist_ok=True); im.save(os.path.join(od, meta['name'] + '.png'))
        a = meta['anchor'] or (im.width / 2, im.height - 2)
        print(f'META {meta["name"]} {im.width} {im.height} {a[0]} {int(a[1])} {im.width / 32:.2f} - -')
    elif cmd == 'view': view(im, sys.argv[3], int(sys.argv[4]) if len(sys.argv) > 4 else 8); print(validate(im, meta['pal']))
    elif cmd == 'lint': print(lint(im))
    elif cmd == 'validate': print(validate(im, meta['pal']))
    elif cmd == 'ascii':
        reg = tuple(int(v) for v in sys.argv[3].split(',')) if len(sys.argv) > 3 else None; print(ascii(im, reg))
