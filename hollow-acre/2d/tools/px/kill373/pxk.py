# pxk.py: the kit the kill's animals are drawn with (t373). Volume from a height field (every part a dome or a tube), light from
# the top left, then the hand finish: four hide tones as clusters with wandering borders, fur tips reaching over each border,
# no cluster under 6 px, one dark-brown outline, a pale lit edge on the top and left only. Hand detail goes in afterwards with px().
import numpy as np, math, random
from PIL import Image

def hx(c):
    c = c.lstrip('#'); return (int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16))

MAT = {
    'hide': ['#4a2220', '#7a3e2a', '#a8663a', '#cc8f50'],
    'hided': ['#3a1a1c', '#5e3024', '#844e30', '#a86c42'],   # the darker hide: the far side, the neck under the head
    'leg': ['#2c1616', '#4a2620', '#6c3c28', '#90583a'],     # Jersey points: the lower legs go dark
    'nose': ['#5a3038', '#8a5a5e', '#b88a86', '#dcb4a8', '#f2d4c6'],
    'horn': ['#3e3028', '#6e5e48', '#a8987a', '#d8ccae', '#f4ecd8'],
    'hoof': ['#1a1014', '#2e2228', '#4a3a40', '#6a585c'],
    'pink': ['#4a1e30', '#7a3a4c', '#ac6270', '#d4928e', '#f0bcb0'],
    'switch': ['#1e100c', '#341c14', '#52301e', '#704430'],
    'inner': ['#4a1e30', '#7a3a4c', '#a8606a', '#c88888'],
    'meat': ['#4a0e16', '#7a1c22', '#a43030', '#c64c40'],      # skinned: the muscle under the hide, wet
    'meatd': ['#360a12', '#5a1418', '#802426', '#a43838'],
    'fat': ['#8a7458', '#b8a07c', '#dccaa4', '#f0e6cc'],
}
REMAP = {}
LIT = {'hide': '#ecc58a', 'hided': '#c8945c', 'leg': '#a8704a', 'nose': '#f8e0d4', 'horn': '#fff8e8', 'hoof': '#7a6a6e', 'pink': '#f8d0c4',
       'switch': '#7a5038', 'inner': '#d8a0a0', 'meat': '#e8846a', 'meatd': '#c05a4c', 'fat': '#fff8e8'}
OL = '#2a140c'
L = np.array([-.55, -.62, .56]); L = L / np.linalg.norm(L)


def vnoise(w, h, per, seed):
    rng = np.random.RandomState(seed); gw, gh = w // per + 3, h // per + 3; G = rng.rand(gh, gw)
    ys, xs = np.mgrid[0:h, 0:w]; fx, fy = xs / per, ys / per; x0, y0 = fx.astype(int), fy.astype(int); tx, ty = fx - x0, fy - y0
    tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty)
    a = G[y0, x0]; b = G[y0, x0 + 1]; c = G[y0 + 1, x0]; d = G[y0 + 1, x0 + 1]
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty


class Spr:
    def __init__(s, w, h, seed=1):
        s.w, s.h = w, h; s.H = np.full((h, w), -1e9, np.float32); s.S = np.full((h, w), -1, np.int32); s.sh = []; s.seed = seed
        s.over = {}  # (x,y) -> colour, hand pixels drawn after the finish

    def _stamp(s, x0, y0, V, si):
        h, w = V.shape; X0, Y0 = max(0, x0), max(0, y0); X1, Y1 = min(s.w, x0 + w), min(s.h, y0 + h)
        if X1 <= X0 or Y1 <= Y0: return
        v = V[Y0 - y0:Y1 - y0, X0 - x0:X1 - x0]; Hs = s.H[Y0:Y1, X0:X1]; Ss = s.S[Y0:Y1, X0:X1]; m = v > Hs
        Hs[m] = v[m]; Ss[m] = si

    def add(s, **o):
        o.setdefault('mat', 'hide'); o['mat'] = REMAP.get(o['mat'], o['mat']); o.setdefault('base', 1.6); o.setdefault('gain', 3.0); s.sh.append(o); return len(s.sh) - 1

    def dome(s, cx, cy, rx, ry, z=0, top=None, **o):
        si = s.add(t='dome', **o); top = min(rx, ry) if top is None else top
        x0, y0 = int(math.floor(cx - rx)), int(math.floor(cy - ry)); x1, y1 = int(math.ceil(cx + rx)), int(math.ceil(cy + ry))
        ys, xs = np.mgrid[y0:y1 + 1, x0:x1 + 1]; d = ((xs + .5 - cx) / rx) ** 2 + ((ys + .5 - cy) / ry) ** 2
        V = np.where(d <= 1, z + top * np.sqrt(np.clip(1 - d, 0, 1)), -1e9); s._stamp(x0, y0, V, si); return si

    def tube(s, pts, r0, r1, z=0, z1=None, **o):
        si = s.add(t='tube', **o); z1 = z if z1 is None else z1
        seg = [math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]) for k in range(len(pts) - 1)]; Lt = sum(seg) or 1; acc = 0
        rm = max(r0, r1); x0, y0 = int(min(p[0] for p in pts) - rm - 2), int(min(p[1] for p in pts) - rm - 2)
        x1, y1 = int(max(p[0] for p in pts) + rm + 2), int(max(p[1] for p in pts) + rm + 2)
        ys, xs = np.mgrid[y0:y1 + 1, x0:x1 + 1]; V = np.full(xs.shape, -1e9, np.float32)
        for k in range(len(pts) - 1):
            n = max(1, int(math.ceil(seg[k] * 2)))
            for j in range(n + 1):
                u = j / n; a = (acc + seg[k] * u) / Lt; r = r0 + (r1 - r0) * a; zz = z + (z1 - z) * a
                cx = pts[k][0] + (pts[k + 1][0] - pts[k][0]) * u; cy = pts[k][1] + (pts[k + 1][1] - pts[k][1]) * u
                d = ((xs + .5 - cx) ** 2 + (ys + .5 - cy) ** 2) / (r * r); v = np.where(d <= 1, zz + r * np.sqrt(np.clip(1 - d, 0, 1)), -1e9)
                V = np.maximum(V, v)
            acc += seg[k]
        s._stamp(x0, y0, V, si); return si

    def blob(s, poly, z=0, top=10, R=12, **o):
        """a filled outline, rounded off over R px from its edge (a barrel with a straight back)"""
        from PIL import ImageDraw
        from scipy import ndimage
        si = s.add(t='blob', **o); x0, y0 = int(min(p[0] for p in poly)) - 2, int(min(p[1] for p in poly)) - 2
        x1, y1 = int(max(p[0] for p in poly)) + 3, int(max(p[1] for p in poly)) + 3
        im = Image.new('L', (x1 - x0, y1 - y0), 0); ImageDraw.Draw(im).polygon([(p[0] - x0, p[1] - y0) for p in poly], fill=1)
        M = np.array(im) > 0; D = ndimage.distance_transform_edt(M)
        u = np.clip(D / R, 0, 1); V = np.where(M, z + top * np.sqrt(1 - (1 - u) ** 2), -1e9); s._stamp(x0, y0, V, si); return si

    def px(s, x, y, w, h, c):
        for yy in range(y, y + h):
            for xx in range(x, x + w): s.over[(xx, yy)] = c

    # ---------------------------------------------------------------- the finish
    def finish(s, wob=.38, per=7, tufts=True, minc=6, lit=True, ol=OL, tuft_dir=(0, 1), skip_lit=(), crease=1.0, ol_skip=None):
        w, h = s.w, s.h; H, S = s.H, s.S; inside = S >= 0
        Hp = np.pad(H, 1, constant_values=-1e9); Sp = np.pad(S, 1, constant_values=-1)
        def nb(dx, dy):
            hh = Hp[1 + dy:1 + dy + h, 1 + dx:1 + dx + w]; ss = Sp[1 + dy:1 + dy + h, 1 + dx:1 + dx + w]
            return np.where(ss < 0, H - 2, hh), ss
        hl, sl = nb(-1, 0); hr, sr = nb(1, 0); hu, su = nb(0, -1); hd, sd = nb(0, 1)
        nx = (hl - hr) * .5; ny = (hu - hd) * .5; nz = np.ones_like(H)
        l = (nx * L[0] + ny * L[1] + nz * L[2]) / np.sqrt(nx * nx + ny * ny + nz * nz)
        N = vnoise(w, h, per, s.seed) - .5; N2 = vnoise(w, h, max(2, per // 2), s.seed + 7) - .5
        K = np.full((h, w), -1.0); T = np.full((h, w), -1, np.int32)
        for si, o in enumerate(s.sh):
            m = S == si
            if not m.any(): continue
            P = MAT[o['mat']]; k = o['base'] + (l[m] - .5) * o['gain'] + (N[m] + N2[m] * .5) * wob * 2 + o.get('shift', 0)
            if o.get('fn'): pass
            K[m] = k
        # creases: where a higher part lies over this one
        cr = np.zeros((h, w), bool)
        for (hh, ss) in ((hl, sl), (hr, sr), (hu, su), (hd, sd)):
            soft = np.array([bool(o.get('soft')) for o in s.sh] + [True])
            cr |= inside & (ss >= 0) & (ss != S) & (hh > H + .4) & ~soft[np.where(ss >= 0, ss, len(s.sh))]
        K = np.where(cr, K - 1.3 * crease, K)
        for si, o in enumerate(s.sh):
            m = S == si
            if not m.any(): continue
            n = len(MAT[o['mat']]); T[m] = np.clip(np.round(K[m]), 0, n - 1).astype(int)
        s.T = T; s._clusters(minc)
        if tufts: s._tufts(tuft_dir)
        s._clusters(3)
        # colours
        out = np.zeros((h, w, 4), np.uint8)
        for si, o in enumerate(s.sh):
            m = S == si
            if not m.any(): continue
            P = [hx(c) for c in MAT[o['mat']]]
            for t in range(len(P)):
                mm = m & (s.T == t); out[mm, :3] = P[t]; out[mm, 3] = 255
        # outline
        o_rgb = hx(ol); Ip = np.pad(inside, 1)
        adj = (Ip[1:-1, :-2] | Ip[1:-1, 2:] | Ip[:-2, 1:-1] | Ip[2:, 1:-1]) & ~inside
        if ol_skip is not None: adj &= ~ol_skip(np.mgrid[0:h, 0:w])
        out[adj, :3] = o_rgb; out[adj, 3] = 255
        s.ol_mask = adj
        # the lit edge: top and left edges that face the light, runs of 2+ only
        if lit:
            top = inside & ~Ip[:-2, 1:-1] & Ip[2:, 1:-1]
            left = inside & ~Ip[1:-1, :-2] & Ip[1:-1, 2:] & Ip[2:, 1:-1]
            e = top | left
            mats = np.array([o['mat'] for o in s.sh] + [''])
            for y in range(h):
                for x in range(w):
                    if not e[y, x]: continue
                    si = S[y, x]; o = s.sh[si]
                    if o['mat'] in skip_lit or o.get('nolit'): continue
                    if s.T[y, x] < 1: continue
                    # a run: a neighbour along the edge is lit edge too
                    if not ((x > 0 and e[y, x - 1]) or (x < w - 1 and e[y, x + 1]) or (y > 0 and e[y - 1, x]) or (y < h - 1 and e[y + 1, x])): continue
                    out[y, x, :3] = hx(LIT[o['mat']])
        for (x, y), c in s.over.items():
            if 0 <= x < w and 0 <= y < h:
                if c is None: out[y, x] = 0
                else: out[y, x, :3] = hx(c); out[y, x, 3] = 255
        s.img = out; return out

    def _clusters(s, minc):
        from scipy import ndimage
        T, S = s.T, s.S
        for it in range(2):
            for si in range(len(s.sh)):
                m = S == si
                if not m.any(): continue
                for t in np.unique(T[m]):
                    lab, n = ndimage.label(m & (T == t))
                    if n == 0: continue
                    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
                    for i, sz in enumerate(sizes):
                        if sz >= minc: continue
                        mm = lab == i + 1; dil = ndimage.binary_dilation(mm) & ~mm & m
                        if not dil.any(): continue
                        vals, cnt = np.unique(T[dil], return_counts=True); T[mm] = vals[np.argmax(cnt)]

    def _tufts(s, d):
        """fur tips: along each border between two tones of one part, now and then a tip of the upper tone reaches 2-3 px down
        over the lower one (or the darker one up into the light), tapered, at uneven spacing"""
        rnd = random.Random(s.seed * 31 + 5); T, S = s.T, s.S; h, w = T.shape; dx, dy = d
        marks = []
        for y in range(1, h - 3):
            for x in range(1, w - 1):
                si = S[y, x]
                if si < 0 or s.sh[si].get('notuft'): continue
                t = T[y, x]
                if S[y + 1, x] == si and T[y + 1, x] != t and abs(int(T[y + 1, x]) - int(t)) == 1:
                    if rnd.random() < .2: marks.append((x, y, t, T[y + 1, x], si))
        used = set()
        for (x, y, t, t2, si) in marks:
            if any((x + k, y) in used for k in range(-3, 4)): continue
            L1 = rnd.choice((2, 3, 3, 4)); up = t2 > t and rnd.random() < .5
            if up:  # a darker tip up into the light
                for k in range(L1):
                    yy = y - k; xx = x - int(round(dx * k * .5))
                    if 0 <= yy < h and 0 <= xx < w and S[yy, xx] == si and T[yy, xx] == t: T[yy, xx] = t2 if True else t
                    if k == 0 and 0 <= xx + 1 < w and S[yy, xx + 1] == si: T[yy, xx + 1] = t2
            else:
                for k in range(1, L1 + 1):
                    yy = y + k; xx = x + int(round(dx * k * .5))
                    if 0 <= yy < h and 0 <= xx < w and S[yy, xx] == si and T[yy, xx] == t2: T[yy, xx] = t
                    if k == 1 and 0 <= xx + 1 < w and S[yy, xx + 1] == si and T[yy, xx + 1] == t2: T[yy, xx + 1] = t
            used.add((x, y))


def save(img, path, scale=1, bg=None):
    im = Image.fromarray(img, 'RGBA')
    if bg is not None:
        b = Image.new('RGBA', im.size, bg); b.alpha_composite(im); im = b
    if scale != 1: im = im.resize((im.width * scale, im.height * scale), Image.NEAREST)
    im.save(path); return im


def grey(im):
    return im.convert('L').convert('RGB')


ALPH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()+,-:;=>?@[]^_{|}~'


def encode(img):
    """an RGBA picture as [w,h,palette,runs]: one letter per colour ('.' clear), a count after it when it repeats"""
    h, w = img.shape[:2]; pal = []; idx = {}; out = []
    flat = []
    for y in range(h):
        for x in range(w):
            r, g, b, a = img[y, x]
            if a < 128: flat.append('.'); continue
            c = '#%02x%02x%02x' % (r, g, b)
            if c not in idx: idx[c] = ALPH[len(pal)]; pal.append(c)
            flat.append(idx[c])
    assert len(pal) <= len(ALPH), len(pal)
    i = 0
    while i < len(flat):
        j = i
        while j < len(flat) and flat[j] == flat[i]: j += 1
        n = j - i; out.append(flat[i] + (str(n) if n > 1 else '')); i = j
    return w, h, pal, ''.join(out)


class SprX(Spr):
    """a Spr whose shapes are laid out again by a mapping (x, y) -> (x', y') with a scale k: a quarter turn re-drawn, so the light
    stays at the top left (rx and ry swap)"""
    def __init__(s, w, h, f, k, seed=1): Spr.__init__(s, w, h, seed); s.f = f; s.k = k
    def dome(s, cx, cy, rx, ry, z=0, top=None, **o):
        X, Y = s.f(cx, cy); k = s.k; return Spr.dome(s, X, Y, ry * k, rx * k, z * k, None if top is None else top * k, **o)
    def tube(s, pts, r0, r1, z=0, z1=None, **o):
        k = s.k; return Spr.tube(s, [s.f(x, y) for (x, y) in pts], r0 * k, r1 * k, z * k, None if z1 is None else z1 * k, **o)
    def blob(s, poly, z=0, top=10, R=12, **o):
        k = s.k; return Spr.blob(s, [s.f(x, y) for (x, y) in poly], z * k, top * k, R * k, **o)
    def px(s, x, y, w, h, c):
        return None
