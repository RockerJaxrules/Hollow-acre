"""Hollow Acre portraits, fourth generation.
Every portrait is painted as smooth shapes at four times the final size (faces, locks of hair, cloth, eyes, lips), each shape tagged
with a material and a light value. The picture is then reduced to 128 px: each final pixel takes the material that covers most of it
(thin dark lines such as lashes and brows win at a quarter coverage), and its light picks one colour from that material's hand-tuned
ramp. A coloured outline goes round the silhouette, and hair casts a shadow on the face. Nothing here is traced or generated:
all shapes are written below."""
import sys, json, math, colorsys
import numpy as np
from PIL import Image, ImageDraw

S = 4; N = 128; NS = N * S
_yy, _xx = np.mgrid[0:NS, 0:NS]
X = (_xx + .5) / S; Y = (_yy + .5) / S
LV = np.array([-.5, -.62, .6]); LV = LV / np.linalg.norm(LV)

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def mix(a, b, t): return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))
def sstep(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
def gauss(x, y, cx, cy, sx, sy): return np.exp(-(((X - cx) / sx) ** 2 + ((Y - cy) / sy) ** 2)) if x is None else 0

def _toward(h, t, a):
    d = ((t - h + .5) % 1) - .5; return (h + d * a) % 1
def skin_ramp(base):
    r, g, b = [c / 255 for c in (hexc(base) if isinstance(base, str) else base)]
    h, sa, v = colorsys.rgb_to_hsv(r, g, b)
    def hv(dh, ks, kv): rr, gg, bb = colorsys.hsv_to_rgb((h + dh) % 1, min(1, sa * ks), min(1, v * kv)); return (int(rr * 255), int(gg * 255), int(bb * 255))
    B = hexc(base) if isinstance(base, str) else base
    return [hv(-.05, 2.0, .5), hv(-.035, 1.8, .68), hv(-.018, 1.42, .85), tuple(B), mix(B, (255, 242, 226), .28), mix(B, (255, 248, 236), .55)]
def ramp(base, n=6, dark=.36, light=1.32, shade_hue=.98, shade_amt=.22, lit_amt=.18, sat=1.0, base_i=3):
    """a hue-shifted ramp, the base colour sitting at index base_i: shadows turn toward shade_hue and get richer,
    lights turn toward warm yellow and soften"""
    r, g, b = [c / 255 for c in (hexc(base) if isinstance(base, str) else base)]
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    out = []
    for i in range(n):
        if i <= base_i: f = dark + (1 - dark) * i / base_i
        else: f = 1 + (light - 1) * (i - base_i) / (n - 1 - base_i)
        k = f - 1
        hh = _toward(h, shade_hue, shade_amt * -k / (1 - dark)) if k < 0 else _toward(h, .14, lit_amt * k / (light - 1 + 1e-6))
        ss = s * sat * (1 + .3 * max(0, -k)) * (1 - .55 * max(0, k) / (light - 1 + 1e-6) * .7)
        vv = v * f if k <= 0 else min(1, v * (1 + k * 1.15) + (1 - v) * min(1, k / (light - 1 + 1e-6)) * .55 * v)
        rr, gg, bb = colorsys.hsv_to_rgb(hh, min(1, max(0, ss)), min(1, max(0, vv)))
        out.append((int(rr * 255), int(gg * 255), int(bb * 255)))
    return out

# ---------------------------------------------------------------- shapes
def poly(pts):
    im = Image.new('L', (NS, NS), 0); ImageDraw.Draw(im).polygon([(x * S, y * S) for x, y in pts], fill=255)
    return np.asarray(im) > 127
def ell(cx, cy, rx, ry, rot=0):
    if rot:
        c, s = math.cos(rot), math.sin(rot); dx, dy = X - cx, Y - cy
        return ((dx * c + dy * s) / rx) ** 2 + ((-dx * s + dy * c) / ry) ** 2 <= 1
    return ((X - cx) / rx) ** 2 + ((Y - cy) / ry) ** 2 <= 1
def bez(P, n=48):
    P = np.array(P, float); t = np.linspace(0, 1, n)[:, None]
    if len(P) == 2: pts = (1 - t) * P[0] + t * P[1]
    elif len(P) == 3: pts = (1 - t) ** 2 * P[0] + 2 * (1 - t) * t * P[1] + t * t * P[2]
    else: pts = (1 - t) ** 3 * P[0] + 3 * (1 - t) ** 2 * t * P[1] + 3 * (1 - t) * t * t * P[2] + t ** 3 * P[3]
    return pts
def tangents(pts):
    d = np.gradient(pts, axis=0); d /= np.maximum(1e-6, np.linalg.norm(d, axis=1))[:, None]; return d
def widths(n, w):
    """w: a list of widths spread evenly along the stroke"""
    t = np.linspace(0, 1, n); return np.interp(t, np.linspace(0, 1, len(w)), w)
def ribbon(pts, w):
    """a tapered stroke: (whole shape, the half on the left of travel, the half on the right, centre line)"""
    T = tangents(pts); Nn = np.stack([-T[:, 1], T[:, 0]], 1); W = widths(len(pts), w)[:, None] / 2
    L = pts + Nn * W; R = pts - Nn * W
    whole = poly(list(map(tuple, L)) + list(map(tuple, R[::-1])))
    left = poly(list(map(tuple, L)) + list(map(tuple, pts[::-1])))
    right = poly(list(map(tuple, pts)) + list(map(tuple, R[::-1])))
    return whole, left, right, Nn
def stroke(pts, w): return ribbon(np.array(pts, float), w)[0]
def shift(m, dx, dy):
    """move a mask by (dx, dy) final pixels"""
    dx, dy = int(round(dx * S)), int(round(dy * S)); o = np.zeros_like(m)
    ys = slice(max(0, dy), NS + min(0, dy)); yd = slice(max(0, -dy), NS + min(0, -dy))
    xs = slice(max(0, dx), NS + min(0, dx)); xd = slice(max(0, -dx), NS + min(0, -dx))
    o[ys, xs] = m[yd, xd]; return o
def grow(m, r):
    o = m.copy()
    for dx in range(-r, r + 1):
        for dy in range(-r, r + 1):
            if dx * dx + dy * dy <= r * r: o |= np.roll(np.roll(m, dy, 0), dx, 1)
    return o

# ---------------------------------------------------------------- the canvas: material + light, painted back to front
class Canvas:
    def __init__(s, pal):
        s.mat = np.zeros((NS, NS), np.int16); s.lit = np.zeros((NS, NS), np.float32); s.pal = pal
    def put(s, mask, name, lit):
        mid = s.pal.id(name); s.mat[mask] = mid
        s.lit[mask] = lit[mask] if isinstance(lit, np.ndarray) else lit
    def add(s, mask, name, d):
        """change the light of what is already there, only where it is this material"""
        m = mask & (s.mat == s.pal.id(name)); s.lit[m] += (d[m] if isinstance(d, np.ndarray) else d)
    def where(s, name): return s.mat == s.pal.id(name)

class Palette:
    def __init__(s): s.names = ['bg']; s.ramps = [None]; s.prio = [1.0]; s.thr = [None]; s.outline = [False]
    def define(s, name, rmp, prio=1.0, thr=None, outline=True):
        if name in s.names: i = s.names.index(name); s.ramps[i] = rmp; s.prio[i] = prio; s.thr[i] = thr; s.outline[i] = outline; return
        s.names.append(name); s.ramps.append(rmp); s.prio.append(prio); s.thr.append(thr); s.outline.append(outline)
    def id(s, name): return s.names.index(name)

THR6 = [.2, .34, .47, .64, .82]
def reduce(cv):
    """4x canvas -> 128 px RGBA with priority majority and ramp lookup"""
    best = np.zeros((N, N)); bid = np.zeros((N, N), int); blit = np.zeros((N, N))
    for i in np.unique(cv.mat):
        m = cv.mat == i
        cnt = m.reshape(N, S, N, S).sum((1, 3)).astype(float)
        sc = cnt * (cv.pal.prio[i] if i else .9)
        up = sc > best
        l = (cv.lit * m).reshape(N, S, N, S).sum((1, 3)) / np.maximum(cnt, 1)
        best[up] = sc[up]; bid[up] = i; blit[up] = l[up]
    out = np.zeros((N, N, 4), np.uint8)
    for i in np.unique(bid):
        if i == 0: continue
        m = bid == i; R = cv.pal.ramps[i]; thr = cv.pal.thr[i] or (THR6 if len(R) == 6 else list(np.linspace(0, 1, len(R) + 1)[1:-1]))
        k = np.digitize(blit[m], thr); k = np.clip(k, 0, len(R) - 1)
        out[m, :3] = np.array(R)[k]; out[m, 3] = 255
    return out, bid, blit

def outline(img, bid, pal):
    a = img[:, :, 3] > 0
    nb = np.zeros_like(a)
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nb |= ~np.roll(np.roll(a, dy, 0), dx, 1)
    edge = a & nb
    edge[0, :] = edge[-1, :] = False; edge[:, 0] = edge[:, -1] = False
    edge[-1, :] = False
    for i in np.unique(bid[edge]):
        if not pal.outline[i]: continue
        m = edge & (bid == i); c = pal.ramps[i][0]
        img[m, :3] = np.array(mix(c, (30, 10, 18), .62))
    hid = [pal.names.index(n) for n in ('hair', 'hairtip', 'beard') if n in pal.names]
    sid = [pal.names.index(n) for n in ('skin', 'blush', 'shadow') if n in pal.names]
    hm = np.isin(bid, hid); sm = np.isin(bid, sid)
    near = np.zeros_like(hm)
    for dx, dy in ((1, 0), (-1, 0), (0, 1)):
        near |= np.roll(np.roll(sm, dy, 0), dx, 1)
    con = hm & near
    for i in hid:
        m = con & (bid == i); R = pal.ramps[i]
        cur = np.full(bid.shape, 2)
        for ri, rc in enumerate(R): cur[(img[:, :, 0] == rc[0]) & (img[:, :, 1] == rc[1]) & (img[:, :, 2] == rc[2])] = ri
        k = np.clip(cur - 2, 0, len(R) - 1)
        img[m, :3] = np.array(R)[k[m]]
    return img

# ---------------------------------------------------------------- lighting helpers
def sphere_lit(cx, cy, rx, ry, flat=.8, amb=.42, k=.42):
    nx = (X - cx) / rx; ny = (Y - cy) / ry; r2 = nx * nx + ny * ny
    nz = np.sqrt(np.clip(1 - r2 * flat, .04, 1)); L = np.sqrt(nx * nx + ny * ny + nz * nz)
    ndl = (nx * LV[0] + ny * LV[1] + nz * LV[2]) / L
    return amb + k * ndl
def G(cx, cy, sx, sy): return np.exp(-(((X - cx) / sx) ** 2 + ((Y - cy) / sy) ** 2))

CX = 64
BO = 4.0     # how much lower than the old layout the shoulders sit
EXPRS = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'scared', 'wrong', 'love', 'laugh', 'cry', 'smug', 'think']
VARIANTS = ['day', 'night', 'wet']

def wave_pts(pts, amp, freq, phase=0.0, axis=0):
    if not amp: return pts
    t = np.linspace(0, 1, len(pts)); q = pts.copy()
    q[:, axis] += amp * np.sin(t * math.pi * 2 * freq + phase) * np.clip(t * 3, 0, 1)
    return q

class Painter:
    def __init__(s, C, ex, var='day'):
        global LV, BO
        L0 = {'night': (-.5, -.25, .82)}.get(var, (-.5, -.62, .6)); LV = np.array(L0) / np.linalg.norm(L0)
        D = dict(face_w=25.0, chin=86.0, jaw_p=1.85, jaw_q=.5, jaw_taper=.26, eye_a=6.2, iris=4.1, eye_y=59.3, lash_w=1.12)
        T = {'man': dict(face_w=26.0, chin=88.0, jaw_p=2.5, jaw_q=.62, jaw_taper=.12, eye_a=5.1, iris=3.0, tilt=.15, lash_w=.55, wing=0, lashes=0, eye_y=59.6, brow_y=52.0, eye_open=.74,
                         brow_w=1.6, brow_arch=.5, lip_w=6.4, lip_up=1.3, lip_lo=1.9, nose=1.12, blush=.1, shoulder=58.0, neck_w=10.2, natural_lip=.5),
             'kid': dict(face_w=27.0, chin=80.5, jaw_p=2.6, jaw_q=.55, jaw_taper=.06, eye_a=7.5, iris=5.5, eye_y=62.2, tilt=.04, lash_w=.8, wing=0, lashes=0, nose=.55,
                         nose_y=68.4, mouth_y=73.8, brow_y=53.6, lip_w=4.4, lip_up=1.3, lip_lo=1.9, blush=.65, shoulder=41.0, neck_w=8.8, brow_w=1.0, natural_lip=.55, body_dy=-8.0),
             'elder': dict(eye_a=5.4, iris=3.4, tilt=0, lash_w=.85, wing=0, lashes=0, lip_up=1.6, lip_lo=2.2, blush=.25, age=.75, natural_lip=.45, jaw_q=.58)}.get(C.get('kind'), {})
        if C.get('kind') == 'oldman': T = dict({'man': 1} and {}, **{})
        base = dict(D); base.update(T)
        if C.get('kind') == 'oldman':
            base.update(face_w=26.0, chin=88.0, jaw_p=2.3, jaw_q=.6, jaw_taper=.14, eye_a=4.9, iris=2.9, tilt=.0, lash_w=.55, wing=0, lashes=0, eye_y=59.8, brow_y=51.6, eye_open=.72,
                        brow_w=1.7, brow_arch=.6, lip_w=6.2, lip_up=1.1, lip_lo=1.6, nose=1.2, blush=.1, shoulder=57.0, neck_w=9.6, natural_lip=.42, age=.85)
        C = dict(base, **C)
        BO = 4.0 + C.get('body_dy', 0.0)    # kids' shoulders sit closer under the chin
        if var == 'wet': C['vol'] = C.get('vol', 0) - 2.5
        s.C = C; s.ex = ex; s.var = var; s.pal = Palette(); s.cv = Canvas(s.pal); s.rng = np.random.RandomState(C.get('seed', 7))
        s.mk_palette()
    # ------------------------------------------------------------ colours
    def mk_palette(s):
        C, P = s.C, s.pal
        skin = C['skin']
        if s.ex == 'wrong': skin = mix(hexc(skin), (200, 200, 196), .55)
        s.SK = skin_ramp(skin)
        P.define('skin', s.SK)
        P.define('blush', skin_ramp(mix(hexc(skin) if isinstance(skin, str) else skin, (238, 118, 128), .3)))
        P.define('crease', [s.SK[1], s.SK[1], s.SK[2], s.SK[2], s.SK[2], s.SK[3]], prio=2.2, outline=False)
        P.define('nostril', [s.SK[0], s.SK[0], s.SK[1], s.SK[1], s.SK[1], s.SK[2]], prio=2.6, outline=False)
        P.define('cleave', [s.SK[0], s.SK[0], s.SK[1], s.SK[1], s.SK[1], s.SK[1]], prio=2.4, outline=False)
        mk = C.get('makeup')
        if mk: P.define('shadow', skin_ramp(mix(hexc(skin) if isinstance(skin, str) else skin, hexc(mk), .4)), outline=False)
        H = C['hair']; s.HR = ramp(H, 6, dark=.34, light=1.42, shade_hue=C.get('hair_shade_hue', .8 if C.get('cool_hair') else .99), shade_amt=C.get('hair_shade_amt', .3), lit_amt=.3, sat=1.32)
        P.define('hair', s.HR, thr=[.17, .31, .45, .62, .8])
        if C.get('tip'): P.define('hairtip', ramp(C['tip'], 6, dark=.38, light=1.3, shade_hue=.9, shade_amt=.25), thr=[.17, .31, .45, .62, .8])
        bc = C.get('brow') or mix(hexc(H), (30, 20, 20), .45)
        P.define('brow', ramp(bc, 4, dark=.55, light=1.15, base_i=2), prio=3.2, thr=[.3, .5, .75], outline=False)
        P.define('lash', [(28, 16, 24), (40, 24, 32), (58, 38, 44)], prio=4.2, thr=[.45, .8], outline=False)
        P.define('lidlow', [mix(s.SK[1], (60, 30, 40), .4), mix(s.SK[2], (80, 44, 54), .3)], prio=2.6, thr=[.5], outline=False)
        ey = C.get('eye', '#4a6a8a')
        if s.ex == 'wrong':
            P.define('sclera', [(10, 6, 10), (18, 10, 16), (26, 14, 22)], prio=1.2, thr=[.4, .7], outline=False)
            P.define('iris', [(120, 10, 12), (190, 24, 20), (250, 70, 50)], prio=2.0, thr=[.35, .65], outline=False)
        else:
            P.define('sclera', [mix(s.SK[2], (190, 180, 200), .5), (214, 208, 220), (238, 234, 236), (250, 248, 246)], prio=1.2, thr=[.4, .6, .78], outline=False)
            P.define('iris', ramp(ey, 5, dark=.32, light=1.5, shade_hue=.7, shade_amt=.15, lit_amt=.1, base_i=2), prio=1.6, thr=[.18, .38, .6, .8], outline=False)
        P.define('pupil', [(14, 10, 18), (24, 16, 28)], prio=3.0, thr=[.5], outline=False)
        P.define('glint', [(255, 255, 255)], prio=6.0, thr=[], outline=False)
        P.define('glint2', [(236, 240, 248)], prio=4.5, thr=[], outline=False)
        lip = C.get('lip', '#c0485a')
        if C.get('natural_lip') and not C.get('lip'): lip = '#%02x%02x%02x' % mix(hexc(C['skin']), (176, 74, 80), C['natural_lip'])
        if s.ex == 'wrong': lip = '#5a1622'
        P.define('lip', ramp(lip, 6, dark=.42, light=1.35, shade_hue=.95, shade_amt=.25, lit_amt=.25), thr=[.2, .33, .48, .66, .84], outline=False)
        P.define('lipline', [mix(hexc(lip), (40, 10, 20), .62), mix(hexc(lip), (60, 16, 26), .5)], prio=3.6, thr=[.5], outline=False)
        P.define('mouth', [(54, 14, 24), (88, 24, 36), (120, 40, 50)], prio=1.5, thr=[.35, .65], outline=False)
        P.define('teeth', [(214, 206, 204), (240, 236, 232), (252, 250, 246)] if C.get('teeth_v1') else [(176, 160, 156), (222, 212, 202), (238, 230, 218)], prio=1.8, thr=[.4, .7], outline=False)   # warm off-white, never the brightest thing on the face (judge)
        P.define('tooth_gap', [(150, 120, 120)], prio=3.0, thr=[], outline=False)
        P.define('tear', [(120, 170, 220), (190, 224, 250), (255, 255, 255)], prio=3.0, thr=[.4, .75], outline=False)
        for k in ('top', 'top2', 'top3', 'acc', 'acc2', 'frame', 'metal', 'cord', 'dot'):
            if C.get(k): P.define(k, ramp(C[k], 6, dark=.36, light=1.24, shade_hue=.75 if k.startswith('top') else .97, shade_amt=.2, lit_amt=.18, sat=1.12),
                                  prio=(4.0 if k in ('frame', 'cord') else 2.6 if k == 'metal' else 1.0), outline=k not in ('cord', 'metal'))
        P.define('blushline', [(214, 92, 108)], prio=3.0, thr=[], outline=False)
        P.define('vein', [(150, 20, 30), (220, 50, 50)], prio=3.4, thr=[.5], outline=False)
        P.define('rain', [(178, 206, 232)], prio=5.0, thr=[], outline=False)
        P.define('tongue', [(170, 60, 72), (214, 96, 104)], prio=1.6, thr=[.5], outline=False)
        bd = C.get('beard_c') or H
        P.define('beard', ramp(bd, 6, dark=.34, light=1.35, shade_hue=.99, shade_amt=.3, lit_amt=.25, sat=1.2), thr=[.17, .31, .45, .62, .8])
        P.define('stubble', [mix(c, mix(hexc(bd), (90, 100, 120), .4), .2 if i >= 3 else .26) for i, c in enumerate(s.SK)], prio=1.0, outline=False)
        P.define('wrinkle', [s.SK[1], s.SK[1], s.SK[2], s.SK[2], s.SK[2], s.SK[2]], prio=2.0, outline=False)
        if C.get('hatColor'): P.define('hatm', ramp(C['hatColor'], 6, dark=.36, light=1.26, shade_hue=.75, shade_amt=.2, lit_amt=.18, sat=1.1))
        P.define('collarw', ramp('#ecebe6', 6, dark=.55, light=1.08, shade_hue=.66, shade_amt=.2))
        P.define('badge', ramp('#d8b040', 6, dark=.4, light=1.35, shade_hue=.02, shade_amt=.2), prio=2.6)
        if C.get('hollow'):
            P.define('sclera', [(6, 4, 8), (12, 8, 14), (20, 12, 20)], prio=1.2, thr=[.4, .7], outline=False)
            P.define('iris', [(30, 26, 34), (44, 40, 50), (60, 56, 66)], prio=2.0, thr=[.35, .65], outline=False)
        if C.get('blind'):
            P.define('iris', [(170, 172, 168), (200, 202, 198), (226, 228, 224)], prio=1.6, thr=[.35, .65], outline=False)
        P.define('freckle', [mix(s.SK[2], (170, 90, 60), .25)], prio=1.6, thr=[], outline=False)
        P.define('glass', [(255, 255, 255)], prio=2.0, thr=[], outline=False)

    # ------------------------------------------------------------ geometry
    def face_hw(s, y):
        C = s.C; chin = C.get('chin', 87.0); top = 20.0; cy = 49.0; ry = cy - top; rx = C.get('face_w', 24.5)
        y = np.asarray(y, float); out = np.zeros_like(y)
        a = y <= 57
        out[a] = rx * np.sqrt(np.clip(1 - ((y[a] - cy) / ry) ** 2, 0, 1))
        b = ~a
        w0 = rx * math.sqrt(max(0, 1 - ((57 - cy) / ry) ** 2))
        t = np.clip((y[b] - 57) / (chin - 57), 0, 1)
        out[b] = w0 * (1 - t ** C.get('jaw_p', 2.1)) ** C.get('jaw_q', .55) * (1 - C.get('jaw_taper', .2) * t)
        return out
    def face_poly(s, grow_=0.0):
        chin = s.C.get('chin', 87.0); ys = np.linspace(20, chin, 90); hw = s.face_hw(ys) + grow_
        return [(CX + w, y) for w, y in zip(hw, ys)] + [(CX - w, y) for w, y in zip(hw[::-1], ys[::-1])]

    # ------------------------------------------------------------ hair locks
    def lock(s, P, w, out, tone=0.0, wave=None, mat='hair', soft=False, strands=True):
        pts = bez(P, 64)
        if wave: pts = wave_pts(pts, *wave)
        whole, left, right, Nn = ribbon(pts, w)
        avg = Nn.mean(0); lit_left = (avg[0] * LV[0] + avg[1] * LV[1]) > 0
        lightH = left if lit_left else right
        base = s.hair_lit()
        L = base + tone + s.rng.uniform(-.05, .05)
        L = np.where(lightH, L + .06, L - .07)
        nrm = avg / (np.linalg.norm(avg) + 1e-6) * (-1 if lit_left else 1)    # toward the shaded side
        seam = whole & ~shift(whole, -nrm[0] * .9, -nrm[1] * .9)
        L = np.where(seam, L - (.07 if soft else .15), L)
        rim = whole & ~shift(whole, nrm[0] * .8, nrm[1] * .8)
        L = np.where(rim & ~seam, L + .05, L)
        if strands and max(w) >= 4.5:
            Wd = widths(len(pts), w)[:, None] / 2
            for off, dl, t0, t1 in ((-.35 if lit_left else .35, -.17, .1 + s.rng.uniform(0, .15), .7 + s.rng.uniform(0, .2)),
                                    (.38 if lit_left else -.38, .09, .15, .55 + s.rng.uniform(0, .2))):
                a, b = int(t0 * 63), int(t1 * 63)
                sp = pts[a:b] + Nn[a:b] * Wd[a:b] * off * 2
                if len(sp) > 3:
                    sm = ribbon(sp, [.3, .62, .5, .2])[0] & whole
                    L = np.where(sm, L + dl, L)
        tip = None
        if mat == 'hair' and s.C.get('tip'):
            k = int(s.C.get('tip_t', .6) * 63)
            ty = pts[k][1]
            if ty > s.C.get('tip_y', 84) - 22:
                tip = ribbon(pts[k:], list(widths(len(pts), w)[k:][::max(1, (63 - k) // 4)]) or [1])[0] & whole
                dz = ribbon(pts[max(0, k - 5):k + 1], [max(w) * .9] * 3)[0] & whole & ~tip
                y_lo, y_hi = pts[max(0, k - 5)][1], pts[k][1]; reach = max(2.0, abs(y_hi - y_lo) + 2)
                ph = s.rng.uniform(0, 6.3)
                tongue = Y > y_hi - reach * np.clip(np.sin(X * .75 + ph) * 1.3, 0, 1)   # pointed pink tongues into the blonde
                tip = tip | (dz & tongue)
        out.append(dict(m=whole, L=L, mat=mat, tip=tip, sh=(nrm[0] * 1.0, nrm[1] * 1.0 + .5)))
        return whole
    def hair_lit(s):
        if getattr(s, '_hl', None) is not None: return s._hl
        C = s.C; hc = C.get('hair_c', (63, 44)); hr = C.get('hair_r', 34)
        lit = sphere_lit(hc[0], hc[1], hr, hr * 1.12, flat=.9, amb=.36, k=.44)
        lit = lit - .09 * sstep(68, 124, Y)
        d = np.sqrt((X - hc[0] + 2) ** 2 + ((Y - hc[1]) * 1.05) ** 2)
        sr = C.get('sheen_r', 22.0)
        sheen = .36 * np.exp(-((d - sr) / 1.7) ** 2) * sstep(56, 30, Y) * (1 - .6 * sstep(58, 92, X))
        if C.get('style') in ('long', 'wavy'):
            sheen = sheen + .2 * np.exp(-((Y - 76 - 2.5 * np.sin(X * .25)) / 2.2) ** 2) * (1 - .5 * sstep(CX, CX + 30, X))
        s._hl = lit + sheen
        return s._hl
    def paint_locks(s, locks):
        cv = s.cv; hid = [s.pal.id('hair')] + ([s.pal.id('hairtip')] if 'hairtip' in s.pal.names else [])
        for e in locks:
            if isinstance(e, tuple): e = dict(m=e[0], L=e[1], mat=e[2], tip=None, sh=None)
            m = e['m']
            if e.get('sh'):
                under = shift(m, *e['sh']) & ~m & np.isin(cv.mat, hid)
                cv.lit[under] -= .13
            if e['mat'] == 'hair' and s.C.get('tip') and e['tip'] is None and e.get('mass'):
                ty = s.C.get('tip_y', 84)
                tipm = m & (Y > ty + 3 * np.sin(X * .3))
                cv.put(m & ~tipm, 'hair', e['L']); cv.put(tipm, 'hairtip', e['L'] + .08)
            elif e['tip'] is not None:
                cv.put(m & ~e['tip'], 'hair', e['L']); cv.put(e['tip'], 'hairtip', e['L'] + .08)
            else:
                cv.put(m, e['mat'], e['L'])

    # ------------------------------------------------------------ body: neck, shoulders, chest (everything below the chin sits BO lower)
    def torso_poly(s):
        sw = s.C.get('shoulder', 55.0); o = BO
        nw = s.C.get('neck_w', 8.4)
        tr = bez([(nw + .6, 88 + o), (nw + 5.6, 99 + o), (30, 100 + o), (sw - 9, 105 + o)], 30)
        dl = bez([(sw - 9, 105 + o), (sw - 3, 107.5 + o), (sw + 1, 114 + o), (sw + 2, max(129 + o, 132))], 20)
        half = np.vstack([tr, dl])
        R = [(CX + x, y) for x, y in half]; L = [(CX - x, y) for x, y in half[::-1]]
        return L + R
    def body(s):
        C, cv = s.C, s.cv; o = BO
        tor = poly(s.torso_poly())
        nw = C.get('neck_w', 8.4); neck = poly([(CX - nw, 70), (CX + nw, 70), (CX + nw + .9, 92 + o), (CX - nw - .9, 92 + o)])
        skin_m = tor | neck
        lit = .62 - .12 * (X - CX) / 55 - .1 * sstep(38, 58, np.abs(X - CX))
        lit = lit + .1 * G(CX - 30, 104 + o, 10, 4)
        cv.put(skin_m, 'skin', lit)
        nl = .56 - .14 * sstep(CX - 6, CX + 9, X)
        cv.put(neck, 'skin', nl)
        for sg in (-1, 1):
            cb = bez([(CX + sg * 3, 100.5 + o), (CX + sg * 9, 98.2 + o), (CX + sg * 17, 98.6 + o), (CX + sg * 24, 98.0 + o)], 30)
            ridge = ribbon(cb, [.5, 1.2, 1.0, .4])[0]; below = ribbon(cb + np.array([0, 1.25]), [.4, 1.1, .9, .3])[0]
            cv.add(ridge, 'skin', .1 if sg < 0 else .05); cv.add(below, 'skin', -.12)
        cv.add(ell(CX + .5, 99.5 + o, 2.4, 1.6), 'skin', -.13)
        if C.get('kind') in ('man', 'oldman'):
            cv.add(ell(CX + .3, 85 + o * .5, 2.0, 2.6), 'skin', .07); cv.add(ell(CX + 1.2, 87.5 + o * .5, 1.8, 1.2), 'skin', -.1)
        for sg in (-1, 1):
            cv.add(stroke(bez([(CX + sg * 6.5, 80 + o * .5), (CX + sg * 4.5, 90 + o), (CX + sg * 1.6, 98.5 + o)], 20), [.3, .9, .4]), 'skin', -.06 if sg < 0 else -.09)
        s.skin_body = skin_m

    def bust(s):
        """young adult women: the bust under the neckline, lit as two soft forms"""
        C, cv = s.C, s.cv
        b = C.get('bust', 15.2); cy = C.get('bust_y', 117.0) + BO; sep = C.get('bust_sep', 12.9)
        bl = []; bm = []
        for sg in (-1, 1):
            m = ell(CX + sg * sep, cy, b, b * .94); bm.append(m)
            bl.append(sphere_lit(CX + sg * sep - 2, cy - 3, b * 1.1, b, flat=.95, amb=.47, k=.4))
        s.bust_m = bm[0] | bm[1]
        s.bust_lit = np.where(bm[0] & ~(bm[1] & (X > CX)), bl[0], np.where(bm[1], bl[1], 0))
        L = np.where(s.bust_m, s.bust_lit, cv.lit)
        cv.put(s.bust_m & cv.where('skin'), 'skin', L)
        top = cy - b * .94
        cv.add(s.bust_m, 'skin', -.4 * np.exp(-((X - CX - .3) / 2.4) ** 2) * sstep(top + 2, top + 7, Y))
        cv.put(stroke(bez([(CX + .25, top + 5.5), (CX - .15, top + 10), (CX + .3, max(129 + BO, 132))], 20), [.3, .8, 1.0]), 'cleave', .5)
        for sg in (-1, 1):   # the inner curve of each breast, meeting in a soft Y
            cv.put(stroke(bez([(CX + sg * .4, top + 7.5), (CX + sg * 2.2, top + 9.2), (CX + sg * 4.2, top + 12.6)], 12), [.6, .5, .2]), 'cleave', .5)
            cv.add(ell(CX + sg * (sep - 3.5), top + 4.5, 4.2, 2.2) & s.bust_m, 'skin', .07)
        for sg in (-1, 1):
            cv.add(ribbon(bez([(CX + sg * 3, top + 5.2), (CX + sg * (sep - 3), top - .4), (CX + sg * (sep + 8), top + 3.5)], 30), [.2, 1.0, .3])[0] & s.bust_m, 'skin', .07)

    def neckline(s):
        """the cut of the top: returns the mask of skin it leaves bare"""
        C = s.C; t = C.get('neck', 'scoop'); o = BO
        if t == 'crew':
            half = bez([(0, 99.6 + o), (6, 99.2 + o), (10, 96 + o), (12.2, 89 + o)], 24)
        elif t == 'v':
            half = bez([(0, 118 + o), (5, 110 + o), (10, 100 + o), (13.5, 90 + o)], 24)
        elif t == 'square':
            half = np.array([(0, 113 + o), (4, 112.8 + o), (17, 112.4 + o), (19.5, 104 + o), (21, 92 + o)])
        elif t == 'smallv':
            half = bez([(0, 105 + o), (4, 100 + o), (8, 95 + o), (11.5, 89 + o)], 20)
        elif t == 'plunge':
            half = bez([(0, 122 + o), (5, 112 + o), (11, 100 + o), (14.5, 90 + o)], 24)
        elif t == 'deepscoop':
            half = bez([(0, 119.5 + o), (9, 118.5 + o), (19.5, 111 + o), (23, 92 + o)], 30)
        elif t == 'tank':   # a tank top: a scoop at the front, straps, bare shoulders and arms
            half = bez([(0, 122 + o), (9, 121 + o), (20, 110 + o), (22.5, 92 + o)], 30)
            pts = [(CX - x, y) for x, y in half[::-1]] + [(CX + x, y) for x, y in half] + [(CX + half[-1][0], 60), (CX - half[-1][0], 60)]
            s.neck_half = half; bare = poly(pts)
            for sg in (-1, 1):
                if s.C.get('armholes'):   # the armhole curves down to the side seam; the arm beyond it is bare
                    bare |= poly([(CX + sg * 28.5, 60), (CX + sg * 28.5, 92 + o), (CX + sg * 30.5, 104 + o), (CX + sg * 34.5, 113 + o), (CX + sg * 37.5, 121 + o), (CX + sg * 38.5, 140), (CX + sg * 64, 140), (CX + sg * 64, 60)])
                else:
                    bare |= poly([(CX + sg * 28.5, 60), (CX + sg * 28.5, 92 + o), (CX + sg * 31, 104 + o), (CX + sg * 38, 113 + o), (CX + sg * 64, 114 + o), (CX + sg * 64, 60)])
            return bare
        elif t in ('tube', 'cami', 'offshoulder'):
            # strapless edges run right across the chest; the shoulders stay bare
            cen = {'tube': 114.5, 'cami': 116.5, 'offshoulder': 115}[t] + o; side = {'tube': 110, 'cami': 109.5, 'offshoulder': 107.5}[t] + o
            far = {'tube': 111, 'cami': 111, 'offshoulder': 106.5}[t] + o
            half = np.vstack([bez([(0, cen), (3, cen - 3.2), (7, side + .6), (13, side)], 14), bez([(13, side), (24, side - .4), (40, far), (62, far + (2 if t == 'offshoulder' else 6))], 20)])
            pts = [(CX - x, y) for x, y in half[::-1]] + [(CX + x, y) for x, y in half] + [(CX + 62, 40), (CX - 62, 40)]
            s.neck_half = half; bare = poly(pts)
            if t == 'cami':
                for sg in (-1, 1): bare &= ~stroke(bez([(CX + sg * 16.5, 92 + o), (CX + sg * 16, 101 + o), (CX + sg * 14.8, side + 1)], 12), [1.9, 1.9, 2.1])
            return bare
        elif t == 'sweetheart':
            half = np.vstack([bez([(0, 116.5 + o), (2.5, 113 + o), (5, 109.5 + o), (9, 108.5 + o)], 12), bez([(9, 108.5 + o), (15, 107.6 + o), (19, 108.5 + o), (20.5, 101 + o)], 14), [(21, 93 + o)]])
        else:
            half = bez([(0, 117 + o), (8, 116 + o), (17, 111 + o), (21.5, 92 + o)], 30)
        pts = [(CX - x, y) for x, y in half[::-1]] + [(CX + x, y) for x, y in half] + [(CX + half[-1][0], 60), (CX - half[-1][0], 60)]
        s.neck_half = half
        return poly(pts)

    def clothes(s):
        C, cv = s.C, s.cv; o = BO
        tor = poly(s.torso_poly())
        bare = s.neckline()
        cloth = tor & ~bare & (Y > 86 + o)
        dark = sum(hexc(C['top'])) < 200
        k = .1 if dark else .2
        lit = .6 - k * (X - CX) / 55 - .1 * sstep(40, 58, np.abs(X - CX)) + .07 * G(CX - 34, 106 + o, 12, 5)
        if C.get('allure') and getattr(s, 'bust_m', None) is not None:
            lit = np.where(s.bust_m, lit * .3 + (s.bust_lit + .02) * .7, lit)
            for sg in (-1, 1):
                f = stroke(bez([(CX + sg * 26, 112 + o), (CX + sg * 33, 116 + o), (CX + sg * 42, 124 + o)], 20), [.3, 1.2, .3])
                lit = np.where(f, lit - .12, lit)
        else:
            for sg in (-1, 1):
                f = stroke(bez([(CX + sg * 18, 110 + o), (CX + sg * 23, 117 + o), (CX + sg * 26, 128 + o)], 20), [.3, 1.0, .5])
                lit = np.where(f, lit - .1, lit)
                f2 = stroke(bez([(CX + sg * 40, 109 + o), (CX + sg * 36, 116 + o), (CX + sg * 37, 124 + o)], 20), [.3, .9, .3])
                lit = np.where(f2, lit - .08, lit)
        cv.put(cloth, 'top', lit)
        cv.add(cloth & ~shift(cloth, 0, 1.0), 'top', -.2)
        if C.get('pattern') == 'dots':
            dm = (((X + 1.5) % 6 - 3) ** 2 + ((Y + 1.5 + 3 * (np.floor((X + 1.5) / 6) % 2)) % 6 - 3) ** 2) < 1.1
            cv.put(cloth & dm, 'dot', lit)
        edge_sh = bare & shift(cloth, 0, -1.2) & ~cloth
        cv.add(edge_sh & tor, 'skin', -.12)
        sw = C.get('shoulder', 55.0)
        if C.get('sleeve', True) and C.get('neck') not in ('tube', 'cami', 'tank'):
            for sg in (-1, 1):
                hem = stroke(bez([(CX + sg * (sw - 7), 125 + o), (CX + sg * (sw - 3), 122 + o), (CX + sg * (sw + 2), 121.5 + o)], 16), [.6, 1.4, 1.2])
                cv.add(hem & tor, 'top', -.18)
        pat = C.get('pattern')
        if pat == 'plaid':
            pl = ((np.floor(X) % 7) < 1.3) | ((np.floor(Y + 2) % 7) < 1.3)
            cv.add(cloth & pl, 'top', -.11); cv.add(cloth & ((np.floor(X + 3) % 7) < .8), 'top', .07)
        half = s.neck_half
        trim_pts = np.array([(CX - x, y) for x, y in half[::-1]] + [(CX + x, y) for x, y in half])
        tw = C.get('trim_w', 1.3)
        tm = ribbon(trim_pts, [tw] * 5)[0] & tor
        if C.get('trim'):
            cv.put(tm & (Y > 86 + o), 'top3', lit + .08)
        else:
            cv.add(tm, 'top', -.07)
        s.cloth_m = cloth

    def over_layer(s):
        """cardigans, jackets, shirt collars and apron straps on top of the first layer"""
        C, cv = s.C, s.cv; kind = C.get('over'); sw = C.get('shoulder', 55.0); o = BO
        if not kind: return
        tor = poly(s.torso_poly())
        if kind in ('cardigan', 'jacket'):
            for sg in (-1, 1):
                inner = bez([(CX + sg * 13, 88 + o), (CX + sg * 19.5, 100 + o), (CX + sg * 25, 113 + o), (CX + sg * 28, max(129 + o, 132))], 30)
                pts = [(x, y) for x, y in inner] + [(CX + sg * (sw + 4), max(129 + o, 132)), (CX + sg * (sw + 4), 86 + o)]
                m = poly(pts) & tor
                if C.get('cardi_off'): m &= Y > (107 + o + 5 * sstep(30, 50, np.abs(X - CX)))
                lit = .58 - .2 * (X - CX) / 55 - .1 * sstep(40, 58, np.abs(X - CX)) + .06 * G(CX - 34, 104 + o, 12, 5)
                cv.put(m, 'top2', lit)
                e = ribbon(inner, [1.8] * 4)[0] & tor
                cv.add(e & m, 'top2', .12)
                cv.add(shift(m, -sg * 1.0, .6) & ~m & tor, 'top', -.14)
                cv.add(shift(m, -sg * 1.0, .6) & ~m & tor, 'skin', -.14)
                if kind == 'cardigan':
                    for by in (112, 123):
                        t_ = (by - o - 88) / 41; bx = CX + sg * (13 + 15 * t_ + 2.2)
                        cv.put(ell(bx, by, 1.1, 1.1), 'top3', .6)
                else:
                    lap = poly([(CX + sg * 13, 88 + o), (CX + sg * 21, 92 + o), (CX + sg * 22.5, 104 + o), (CX + sg * 18.8, 101 + o)]) & tor
                    cv.put(lap, 'top2', lit - .1)
                    cv.add(ribbon(bez([(CX + sg * 13, 88 + o), (CX + sg * 18.8, 101 + o)], 10), [.6, .6])[0], 'top2', -.15)
        if kind == 'collar':
            for sg in (-1, 1):
                col = poly([(CX + sg * 10.5, 86.5 + o), (CX + sg * 17, 89 + o), (CX + sg * 22, 99.5 + o), (CX + sg * 14.5, 96.5 + o), (CX + sg * 11.2, 92 + o)])
                cv.put(col, 'top', .74 - .1 * sg)
                cv.add(shift(col, 0, 1.0) & ~col & tor, 'top', -.15)
        if kind == 'apron':
            for sg in (-1, 1):
                st = stroke(bez([(CX + sg * 24, 92 + o), (CX + sg * 21.5, 108 + o), (CX + sg * 18.5, max(129 + o, 132))], 20), [4.2, 4.2, 4.6])
                cv.put(st & tor, 'top2', .66 - .12 * sg)
                cv.add(shift(st, sg * .9, 0) & ~st & tor, 'top', -.12)

    # ------------------------------------------------------------ the face
    def face(s):
        C, cv = s.C, s.cv
        # ears first, behind the face
        s.ear_m = np.zeros((NS, NS), bool)
        for sg in (-1, 1):
            ex_ = CX + sg * (C.get('face_w', 24.5) - .5)
            e = ell(ex_ + sg * 1.6, 61, 3.4, 6.2, rot=sg * .12)
            cv.put(e, 'skin', .5 - .1 * sg)
            cv.add(ell(ex_ + sg * 1.9, 61.5, 1.5, 3.6), 'skin', -.2)
            s.ear_m |= e
        fm = poly(s.face_poly())
        lit = sphere_lit(61.5, 52, 27, 50, flat=.72, amb=.44, k=.32)
        lit += .07 * G(55, 37, 8, 5)                                  # forehead
        lit += .1 * G(50, 64.5, 5, 3) + .04 * G(78, 64.5, 4, 3)       # cheekbones
        lit -= .07 * G(52, 56.5, 7, 2.6) + .09 * G(76.5, 56.5, 7, 2.6)  # under the brow ridge
        # the nose: a lit bridge, its right side and underside in shadow, a lit tip
        ns_ = C.get('nose', 1.0)
        lit += .1 * np.exp(-((X - 62.8) / .9) ** 2) * sstep(57, 60, Y) * sstep(68, 65, Y)
        lit -= .26 * G(66.0, 65.0, 1.2 * ns_, 4.2)
        lit -= .3 * G(64.6, 70.3, 3.4 * ns_, 1.0)
        lit += .14 * G(63.4, 67.4, 1.5 * ns_, 1.3)
        lit -= .06 * G(60.4, 68.6, 1.4, 1.2)
        lit -= .07 * G(64.5, 73, 1.5, 1.4)                            # the philtrum
        lit -= .17 * G(64.6, C.get('mouth_y', 76.5) + 4.6, 5, 1.2)    # under the lower lip
        lit += .07 * G(62.5, 84, 4, 2)                                # chin
        chin = C.get('chin', 87.0)
        hw_row = np.interp(Y, np.linspace(20, chin, 200), s.face_hw(np.linspace(20, chin, 200)))
        lit -= .06 * sstep(chin - 4, chin, Y)
        if C.get('kind') in ('man', 'oldman'):
            lit = lit - .1 * G(CX - 15.5, 73, 3.2, 4.5) - .14 * G(CX + 15.5, 73, 3.2, 4.5)
            lit = lit - .12 * G(CX - 11.5, 55.5, 7.5, 1.6) - .14 * G(CX + 11.5, 55.5, 7.5, 1.6) + .08 * G(CX - 11, 53.5, 6, 1.2)
            lit = lit - .14 * G(66.4, 64, 1.0, 4.4) + .08 * np.exp(-((X - 62.6) / .8) ** 2) * sstep(56, 59, Y) * sstep(68, 66, Y)
            lit = lit + .06 * G(CX - 19, 81, 3, 2) - .08 * G(CX, chin - 1.5, 3.5, 1.5) * 0 + .05 * G(CX - 1, chin - 3, 3, 1.6)
        cv.put(fm, 'skin', lit)
        s.face_m = fm; s.face_lit = lit
        # the head throws a shadow on the neck
        jaw_sh = shift(fm, 1.0, 3.0) & ~fm & s.skin_body
        cv.add(jaw_sh, 'skin', -.2)
        # blush
        bl = C.get('blush', .5) + {'happy': .35, 'love': .7, 'laugh': .45, 'cry': .3}.get(s.ex, 0) - (.4 if s.ex in ('scared', 'wrong') else 0)
        if bl > .2:
            for sg in (-1, 1):
                bm = ell(CX + sg * 14.5, 67.5, 4.6 * min(1.3, bl + .4), 2.4 * min(1.3, bl + .4)) & fm
                cv.put(bm, 'blush', lit)
                if s.ex == 'love':
                    for k in range(3):
                        bx = CX + sg * (11.5 + k * 2.6); cv.put(stroke([(bx + 1.0, 66.2), (bx - .6, 69.2)], [.7, .7]) & fm, 'blushline', .5)
        if C.get('freckles'):
            r = np.random.RandomState(11)
            for _ in range(C['freckles']):
                sg = r.choice([-1, 1]); fx = CX + sg * r.uniform(5, 19); fy = r.uniform(61.5, 69) - abs(fx - CX) * .06
                if abs(fx - CX) < 4: continue
                cv.put(ell(fx, fy, .5, .45), 'freckle', .5)

    def eye(s, sg):
        C, cv, ex = s.C, s.cv, s.ex
        ecx = CX + sg * C.get('eye_dx', 11.6); ecy = C.get('eye_y', 59.0); a = C.get('eye_a', 5.9)
        up, lo, tilt, inner_drop, iris_r, pup = 3.5, 2.1, C.get('tilt', .9), 0.0, C.get('iris', 3.8), 1.55
        look = (0.0, 0.0)
        if ex == 'happy': up, lo = 3.0, .9
        elif ex == 'sad': up, lo, tilt, look = 2.8, 2.0, -.5, (0, .9)
        elif ex == 'angry': up, lo, inner_drop = 2.8, 1.7, 1.5
        elif ex == 'surprised': up, lo, iris_r, pup = 4.4, 2.7, iris_r * .86, 1.15
        elif ex == 'scared': up, lo, iris_r, pup, look = 4.6, 2.8, iris_r * .74, .85, (1.1, 0)
        elif ex == 'wrong': up, lo, iris_r, pup = 4.0, 2.6, 1.9, 0
        up, lo = up * C.get('eye_open', 1) * C.get('eye_up', 1), lo * C.get('eye_open', 1) * C.get('eye_lo', 1)   # each face its own lids
        if C.get('hollow'): iris_r, pup = 1.1, 0
        if C.get('blind'): up, pup = up * .7, 0
        if C.get('heavy'): up = up * .82
        if ex == 'love': up, lo, iris_r, pup = 2.8, 1.0, iris_r * 1.08, 1.2
        elif ex == 'cry': up, lo, tilt, look = 2.4, 1.9, -.7, (0, .9)
        elif ex == 'smug': up, lo, look = 2.2, 1.9, (-1.1, .2)
        elif ex == 'think': up, lo, look = 3.3, 1.9, (1.3, -1.2)
        if ex == 'laugh':   # squeezed shut: a thick upward arc and a small flick
            u = np.linspace(-1, 1, 30); xs = ecx + sg * u * a; ys = ecy + 1.4 - 3.0 * (1 - u * u) ** .8 - tilt * (u + 1) / 2 * .6
            cv.put(ribbon(np.stack([xs, ys], 1), [.9, 1.7, 1.9, 1.3])[0], 'lash', .3)
            cv.put(stroke([(xs[-1], ys[-1]), (xs[-1] + sg * 1.6, ys[-1] - .7)], [1.3, .3]), 'lash', .3)
            cv.add(ribbon(np.stack([xs, ys + 2.4], 1), [.3, 1.0, .5])[0], 'skin', .08)
            return
        u = np.linspace(-1, 1, 41)
        xs = ecx + sg * u * a
        yu = ecy - up * (1 - u * u) ** C.get('eye_round', .72) * (1 - .14 * u) - tilt * (u + 1) / 2 + inner_drop * np.clip(-u, 0, 1) * .9 + inner_drop * .25   # eye_round: low = round, high = almond
        yl = ecy + lo * (1 - u * u) ** .85 - tilt * .55 * (u + 1) / 2
        if ex in ('happy', 'love'): yl = ecy + lo * (1 - u * u) ** .85 - tilt * .55 * (u + 1) / 2 - .9 * (1 - u * u)
        pts = list(zip(xs, yu)) + list(zip(xs[::-1], yl[::-1]))
        scl = poly(pts)
        order = np.argsort(xs); yux = np.interp(X, xs[order], yu[order])
        s_l = .45 + .38 * sstep(.2, 2.0, Y - yux)
        if C.get('makeup'):
            sh = poly(list(zip(xs, yu - .4)) + list(zip(xs[::-1], (yu - 2.9 - .5 * (1 - u * u))[::-1])))
            cv.put(sh & s.face_m, 'shadow', s.face_lit - .04)
        cv.put(scl, 'sclera', s_l)
        icx = ecx - sg * .35 + look[0]; icy = ecy + .25 + look[1]
        ir = ell(icx, icy, iris_r, iris_r * 1.04) & scl
        d = np.sqrt((X - icx) ** 2 + (Y - icy) ** 2)
        il = .3 + .45 * sstep(icy - iris_r, icy + iris_r * .8, Y) - .25 * sstep(iris_r - 1.0, iris_r - .2, d)
        il = il - .2 * sstep(1.6, .2, Y - yux)
        cv.put(ir, 'iris', il)
        if pup: cv.put(ell(icx, icy, pup, pup * 1.05) & scl, 'pupil', .3)
        if ex == 'wrong':
            cv.put(ell(icx, icy, .9, .9) & scl, 'iris', .9)
        elif C.get('hollow'): pass
        else:
            cv.put(ell(icx - 1.35, icy - 1.25, 1.1, 1.0) & scl, 'glint', 1)
            cv.put(ell(icx + 1.5, icy + 1.6, .6, .55) & scl, 'glint2', 1)
            if ex == 'love': cv.put((ell(icx + 1.3, icy - 1.5, .45, 1.3) | ell(icx + 1.3, icy - 1.5, 1.3, .45)) & scl, 'glint', 1)
            if ex == 'cry': cv.put(ribbon(np.stack([xs, yl - .5], 1), [.3, .8, .3])[0] & scl, 'glint2', 1)
        # the upper lash line, thicker toward the outer corner, with a short flick
        lw = C.get('lash_w', 1.0)
        lu = np.linspace(-.98, 1.0, 30); lx = ecx + sg * lu * a
        ly = ecy - up * (1 - lu * lu) ** .72 * (1 - .14 * lu) - tilt * (lu + 1) / 2 + inner_drop * np.clip(-lu, 0, 1) * .9 + inner_drop * .25
        lash = np.stack([lx, ly - .35], 1)
        cv.put(ribbon(lash, [.7 * lw, 1.2 * lw, 1.5 * lw, 1.9 * lw])[0], 'lash', .3)
        oc = (lx[-1], ly[-1] - .35)
        wing = C.get('wing', 1.0)
        if wing > 0: cv.put(stroke([oc, (oc[0] + sg * 1.6 * wing, oc[1] - .9 * wing), (oc[0] + sg * 2.8 * wing, oc[1] - 2.0 * wing)], [1.5 * lw, .9, .25]), 'lash', .3)
        for k, tt in enumerate((.35, .62, .85) if C.get('lashes', 1) else ()):
            j = int(tt * 29); bx, by = lx[j], ly[j] - .6
            cv.put(stroke([(bx, by), (bx + sg * (.6 + k * .4), by - 1.1 - k * .25)], [.7, .25]), 'lash', .3)
        # the lower lid: a soft line on the outer two thirds, and the crease above
        lu2 = np.linspace(-.1, 1.0, 20); lx2 = ecx + sg * lu2 * a
        ly2 = ecy + lo * (1 - lu2 * lu2) ** .85 - tilt * .55 * (lu2 + 1) / 2 + .45
        if ex in ('happy', 'love'): ly2 = ly2 - .9 * (1 - lu2 * lu2)
        cv.put(ribbon(np.stack([lx2, ly2], 1), [.2, .65, .8, .5])[0] & ~scl, 'lidlow', .4)
        cu = np.linspace(-.65, .95, 24); cxs = ecx + sg * cu * a * 1.02
        cys = ecy - up * (1 - cu * cu) ** .72 - tilt * (cu + 1) / 2 - 2.5 - .3 * (1 - cu * cu) + inner_drop * .6
        cv.put(ribbon(np.stack([cxs, cys], 1), [.2, .65, .6, .3])[0], 'crease', .5)
        if ex == 'happy':   # the cheek lifts under a smiling eye
            cv.add(ribbon(np.stack([lx2, ly2 + 1.6], 1), [.3, 1.0, .5])[0], 'skin', .08)
        if ex == 'cry':
            tx0 = ecx + sg * a * .25
            cv.put(stroke([(tx0, ecy + lo + .8), (tx0 + sg * .6, ecy + lo + 5), (tx0 + sg * .2, ecy + lo + 9), (tx0 + sg * .9, ecy + lo + 13)], [1.2, 1.0, .9, .5]), 'tear', .65)
        if ex == 'sad' and sg < 0:
            cv.put(ell(ecx - sg * -a * .6, ecy + lo + 2.6, .9, 1.3) | ell(ecx - sg * -a * .6, ecy + lo + 4.8, .7, 1.0), 'tear', .7)

    def brows(s):
        C, cv, ex = s.C, s.cv, s.ex
        by = C.get('brow_y', 50.6); bw = C.get('brow_w', 1.0)
        di, dp, do = 0.0, 0.0, 0.0
        if ex == 'angry': di, dp, do = 2.5, .6, -.4
        elif ex == 'sad': di, dp, do = -2.3, -.3, .8
        elif ex == 'surprised': di, dp, do = -2.6, -2.8, -1.8
        elif ex == 'scared': di, dp, do = -3.0, -2.0, -.6
        elif ex == 'happy': di, dp, do = -.8, -1.0, -.6
        elif ex == 'wrong': di, dp, do = -1.4, -1.6, -1.2
        elif ex == 'love': di, dp, do = -.9, -1.1, -.6
        elif ex == 'laugh': di, dp, do = -1.6, -1.6, -1.0
        elif ex == 'cry': di, dp, do = -2.8, -.4, 1.0
        side = {'smug': {-1: (-1.6, -2.4, -1.2), 1: (.8, .6, .2)}, 'think': {-1: (-1.2, -1.8, -.9), 1: (.6, .2, 0)}}.get(ex)
        for sg in (-1, 1):
            if side: di, dp, do = side[sg]
            ar = C.get('brow_arch', 1.0)
            P = [(CX + sg * 5.2, by + di), (CX + sg * 10, by - 2.4 * ar + (di + dp) / 2), (CX + sg * 15, by - 2.6 * ar + dp), (CX + sg * 20.2, by - .4 + do)]
            pts = bez(P, 40)
            whole, left, right, _ = ribbon(pts, [2.1 * bw, 1.9 * bw, 1.4 * bw, .5])
            cv.put(whole, 'brow', .45 + .2 * (X < CX))
            # the lower edge of the brow a step darker
            cv.add(whole & ~shift(whole, 0, -.7), 'brow', -.2)

    def nose(s):
        cv = s.cv; n = s.C.get('nose', 1.0)
        ny = s.C.get('nose_y', 69.7)
        cv.put(ell(CX - 2.5 * n, ny, .95, .55), 'nostril', .62)
        cv.put(ell(CX + 2.6 * n, ny, 1.05, .6), 'nostril', .3)

    def mouth(s):
        C, cv, ex = s.C, s.cv, s.ex
        mx, my = CX + .3, C.get('mouth_y', 76.5); hw = C.get('lip_w', 6.6); uh = C.get('lip_up', 2.2); lh = C.get('lip_lo', 2.9)
        u = np.linspace(-1, 1, 41); xs = mx + u * hw
        corner = {'neutral': .7, 'happy': 1.8, 'sad': -1.1, 'angry': -.7, 'surprised': 0, 'scared': -.9, 'wrong': 2.6, 'love': 1.3, 'laugh': 2.0, 'cry': -1.5, 'smug': .5, 'think': -.1}[ex]
        if ex == 'think': hw = hw * .6; mx = mx + 1.8; xs = mx + u * hw
        if ex == 'wrong': hw = hw * 1.55; xs = mx + u * hw
        line = my - corner * u * u + .15 * np.exp(-(u / .2) ** 2) - (C.get('smirk', 0) + (1.8 if ex == 'smug' else 0)) * np.clip(u, 0, 1) ** 2 * (0 if ex in ('sad', 'scared', 'wrong', 'cry') else 1)
        top = line - uh * (1 - u * u) ** .55 + .7 * np.exp(-(u / .16) ** 2) - .25 * np.exp(-((np.abs(u) - .32) / .14) ** 2)
        if ex in ('happy', 'scared', 'wrong', 'laugh', 'cry'):
            op = {'happy': 2.7, 'scared': 2.6, 'wrong': 4.2, 'laugh': 4.0 if C.get('teeth_v1') else 5.6, 'cry': 2.2}[ex]   # a laugh opens the jaw (judge: it read as the smile with the eyes shut)
            o_top = line - .2 * (1 - u * u)
            o_bot = line + op * (1 - u * u) ** .8
            if ex in ('scared', 'cry'): o_bot = line + op * (1 - u * u) ** .9 + .6 * np.sin(u * 7) * (1 - u * u)
            bot = o_bot + lh * .85 * (1 - u * u) ** .7
            up_lip = poly(list(zip(xs, top)) + list(zip(xs[::-1], o_top[::-1])))
            lo_lip = poly(list(zip(xs, o_bot)) + list(zip(xs[::-1], bot[::-1])))
            opening = poly(list(zip(xs, o_top)) + list(zip(xs[::-1], o_bot[::-1])))
            cv.put(opening, 'mouth', .4 + .3 * sstep(my + op * .6, my + op, Y))
            if C.get('teeth_v1'):   # (kept as it was for a face the owner asked us not to change)
                th = poly(list(zip(xs * 0 + xs, o_top)) + list(zip(xs[::-1], (o_top + 1.5 + (1.4 if ex == 'wrong' else 0) * (1 - u * u))[::-1])))
                cv.put(th & opening & (np.abs(X - mx) < hw * .82), 'teeth', .75 - .3 * sstep(hw * .4, hw * .8, np.abs(X - mx)))
            else:   # one continuous row of upper teeth, clear of the corners (two lone corner teeth read as fangs; judge)
                band = {'laugh': 2.4, 'wrong': 2.9}.get(ex, 2.0)
                th = poly(list(zip(xs, o_top - .4)) + list(zip(xs[::-1], (o_top + band * (1 - .3 * u * u))[::-1])))
                cv.put(th & opening & (np.abs(X - mx) < hw * .7), 'teeth', .78 - .14 * sstep(hw * .3, hw * .7, np.abs(X - mx)))
            if ex == 'laugh': cv.put(ell(mx, my + op - .4, hw * (.42 if C.get('teeth_v1') else .5), 1.5 if C.get('teeth_v1') else 2.1) & opening, 'tongue', .6)
            if ex == 'wrong':
                lo_t = poly(list(zip(xs, o_bot - 1.4 * (1 - u * u))) + list(zip(xs[::-1], o_bot[::-1])))
                cv.put(lo_t & opening & (np.abs(X - mx) < hw * .75), 'teeth', .6)
                for k in np.arange(-hw * .7, hw * .71, 1.55):
                    cv.put((np.abs(X - mx - k) < .22) & opening, 'tooth_gap', .5)
            cv.put(up_lip, 'lip', .34 + .08 * (X < mx))
            cv.put(lo_lip, 'lip', .58 + .22 * G(mx - 1.6, my + op + 1.2, 2.2, .9) + .06 * (X < mx))
            return
        if ex == 'surprised':
            cv.put(ell(mx, my + .9, 3.7, 3.5), 'lip', .55 + .2 * G(mx - 1.4, my + 2.8, 1.5, .8))
            cv.put(ell(mx, my + .9, 2.2, 2.2), 'mouth', .35 + .3 * sstep(my, my + 2.5, Y))
            cv.add(ell(mx, my - .3, 3.6, 1.7) & ~ell(mx, my + .9, 2.2, 2.2), 'lip', -.2)
            return
        if ex == 'angry': uh, lh = uh * .75, lh * .7
        bot = line + lh * (1 - u * u) ** .65
        up_lip = poly(list(zip(xs, top)) + list(zip(xs[::-1], line[::-1])))
        lo_lip = poly(list(zip(xs, line)) + list(zip(xs[::-1], bot[::-1])))
        cv.put(up_lip, 'lip', .36 + .08 * (X < mx))
        cv.put(lo_lip, 'lip', .56 + .26 * G(mx - 1.7, my + lh * .55, 2.3, .8) + .06 * (X < mx))
        ln = np.stack([np.concatenate([[xs[0] - .5], xs, [xs[-1] + .5]]), np.concatenate([[line[0] + .1], line, [line[-1] + .1]])], 1)
        cv.put(ribbon(ln, [.5, .9, 1.0, .9, .5])[0], 'lipline', .4)

    # ------------------------------------------------------------ hairstyles: lists of locks, back to front
    def mass(s, mask, out, d=-.16):
        hl = s.hair_lit(); out.append(dict(m=mask, L=hl + d + .05 * np.sin(X * 1.25 + 2.2 * np.sin(Y * .09)), mat='hair', tip=None, sh=None, mass=True))
    def hairline_cap(s, out, hl_pts):
        """the hair covering the skull above a hairline (pulled-back styles)"""
        xs = np.array([p[0] for p in hl_pts]); ys = np.array([p[1] for p in hl_pts]); o = np.argsort(xs)
        hy = np.interp(X, xs[o], ys[o], left=99, right=99)
        cap = ell(CX, 49, s.C.get('face_w', 24.5) + 3.6, 32.5) & (Y < hy)
        s.mass(cap, out, d=0)
    def style(s):
        C = s.C; st = C['style']; back, front = [], []; PX = CX + C.get('part', 2.0); vol = C.get('vol', 0.0); fw = C.get('face_w', 24.5)
        wav = (2.6, 1.5) if st == 'wavy' else None
        def W(j): return (wav[0], wav[1], j * 1.7) if wav else None
        if st in ('long', 'wavy', 'braids'):
            if st != 'braids':
                m = poly([(CX - fw - 5.5 - vol * .5, 44)] + [(CX + (fw + 5.5 + vol * .5) * math.cos(a), 49 - 33 * math.sin(a)) for a in np.linspace(math.pi, 0, 30)] +
                         [(CX + fw + 5.5 + vol * .5, 44), (CX + fw + 7 + vol, 80), (CX + fw + 10 + vol * 1.4, C.get('hair_end', 129)), (CX - fw - 10 - vol * 1.4, C.get('hair_end', 129)), (CX - fw - 7 - vol, 80)])
                s.mass(m, back)
                for sg in (-1, 1):
                    for j in range(4):
                        s.lock([(CX + sg * (fw + 1.5 + j), 48), (CX + sg * (fw + 5 + j * 1.6 + vol * .5), 74), (CX + sg * (fw + 4 + j + vol), 100), (CX + sg * (fw + 7 + j * 2.2 + vol * 1.4), 129)],
                               [5, 6.5, 6.5, 3], back, tone=-.1 + .03 * (j % 2), wave=W(j + 3))
            else:
                s.mass(ell(CX, 49, fw + 4.5, 32.5) & (Y < 66), back)
            # a hairline under everything, so no part of the crown shows skin
            dh = 3.2 if st == 'braids' else 0
            s.hairline_cap(front, [(CX - fw - .5, 60), (CX - fw + .6, 48 + dh * .5), (CX - fw + 3.6, 40 + dh), (CX - 15, 34 + dh), (CX - 8, 30.6 + dh), (CX, 29.6 + dh + (.8 if dh else 0)), (CX + 8, 30.6 + dh),
                                   (CX + 15, 34 + dh), (CX + fw - 3.6, 40 + dh), (CX + fw - .6, 48 + dh * .5), (CX + fw + .5, 60)])
            # the crown: locks fanning from the part over the skull
            for sg in (-1, 1):
                for j in (6, 5, 4, 3, 2, 1, 0):
                    s.lock([(PX + sg * .5, 20.5), (PX + sg * (5 + 2.2 * j), 18.6 + j * .5), (CX + sg * (fw - 1 + vol * .2), 23 + j * 3.6),
                            (CX + sg * (fw + 2.5 + vol * .3), 34 + j * 4.6)], [3.5, 7, 6, 2], front, tone=.03 - (j % 3) * .025)
            if st == 'braids':
                s.braids(front); return back, front
            tuck = C.get('tuck', 0)
            for sg in (-1, 1):
                tucked = tuck and sg == tuck
                for j in (4, 3, 2, 1, 0):
                    if tucked:
                        s.lock([(CX + sg * (fw - 4), 38 + j * 1.5), (CX + sg * (fw + 5), 52), (CX + sg * (fw + 4 + j), 80), (CX + sg * (fw + 7 + j * 2 + vol), C.get('hair_end', 129) - 2)],
                               [4.5, 6.5, 6, 2.5], back, tone=-.04 + .03 * (j % 2), wave=W(j))
                    else:
                        s.lock([(CX + sg * (fw - 2.5 - j * 1.1), 33 + j * 2.2), (CX + sg * (fw + 2 + j * .9 + vol * .3), 58), (CX + sg * (fw + 1 + j * 1.3 + vol * .6), 92),
                                (CX + sg * (fw + 4.5 + j * 2.2 + vol), C.get('hair_end', 129) - 3 + j * .6 - ((j % 2) * 2.5 if 'hair_end' in C else 0))], [4, 6.5, 6.5, 2], front, tone=.02 - .035 * (j % 3), wave=W(j))
                if tucked:   # the hair over the tucked ear sweeps behind it
                    s.lock([(PX + sg * 2, 22), (CX + sg * (fw - 4), 26), (CX + sg * (fw + 1), 38), (CX + sg * (fw + 3.5), 55)], [4, 7, 6, 2], front, tone=.0)
            if C.get('bangs') == 'blunt':
                for k in range(8):
                    xx = CX - 17 + k * 4.8; s.lock([(xx + 1, 24), (xx + .6, 36), (xx, 47 + (k % 2) * .8)], [5.2, 5, 4.2], front, tone=.03 - (k % 3) * .03)
            elif C.get('bangs') == 'side_swept':   # parted on the right, swept across the forehead to the left temple, above the glasses
                s.lock([(PX + 1, 21.5), (PX + 6, 26), (CX + fw - 3, 40), (CX + fw + 1, 58)], [3.5, 7, 6, 1.5], front, tone=-.03)
                s.lock([(PX - 1, 21.5), (CX + 3, 27.5), (CX - 11, 38), (CX - fw + .5, 55)], [4.5, 8.5, 7.5, 2.2], front, tone=-.01)
                s.lock([(PX - 1.5, 22.5), (CX + 1, 31), (CX - 9, 42.5), (CX - fw + 3.5, 52.5)], [3.5, 7.5, 6.5, 1.6], front, tone=.04)
                s.lock([(PX - .5, 23), (CX + 5, 31.5), (CX - 2, 41.5), (CX - 8.5, 48.5)], [3, 6.5, 5.5, 1.0], front, tone=.08)
                s.lock([(PX + .5, 23.5), (CX + 7.5, 33), (CX + 3.5, 42), (CX - 1, 47)], [2.5, 5, 4, .8], front, tone=.02)
            elif C.get('bangs') == 'curtain_long':
                for sg in (-1, 1):
                    s.lock([(PX + sg * 1.0, 21.5), (PX + sg * 9, 25), (CX + sg * 19, 36), (CX + sg * (fw + .5), 60)], [3.5, 7, 5.5, 1.2], front, tone=-.02)
                    s.lock([(PX + sg * .5, 22), (PX + sg * 5, 28), (CX + sg * 14.5, 40), (CX + sg * (fw - 4), 54)], [3.5, 7.5, 6.5, 1.6], front, tone=.02)
                    s.lock([(PX + sg * .2, 22.5), (PX + sg * 3, 31), (CX + sg * 10, 44), (CX + sg * 15.5, 52)], [3, 6.5, 5.5, 1.0], front, tone=.06)   # the innermost: down to the top of the frames
            elif C.get('bangs', 'curtain') == 'curtain':
                for sg in (-1, 1):
                    s.lock([(PX + sg * 1.0, 21.5), (PX + sg * 8, 24.5), (CX + sg * 18.5, 33), (CX + sg * (fw + .5), 58)], [3.5, 7, 5.5, 1.2], front, tone=-.01)
                    s.lock([(PX + sg * .4, 22), (PX + sg * 4.5, 27), (CX + sg * 13.5, 33.5), (CX + sg * (fw - 2.5), 50)], [3.5, 7.5, 6, 1.4], front, tone=.03)
        elif st in ('bun', 'ponytail'):
            hl = [(CX - fw - .5, 60), (CX - fw + .8, 50), (CX - fw + 3.8, 42), (CX - 15, 36), (CX - 8, 32.2), (CX, 31.0), (CX + 8, 32.2), (CX + 15, 36),
                  (CX + fw - 3.8, 42), (CX + fw - .8, 50), (CX + fw + .5, 60)]
            top = (CX + C.get('bun_dx', 0), C.get('bun_y', 13.5))
            if st == 'bun':
                bm = ell(top[0], top[1], 12.5, 10.2)
                back.append((bm, sphere_lit(top[0] - 1, top[1] - 1, 12, 10, flat=.9, amb=.34, k=.46) + .05 * np.sin(np.arctan2(Y - top[1], X - top[0]) * 5 + np.hypot(X - top[0], Y - top[1]) * .6), 'hair'))
                for k in range(3):
                    a0 = k * 2.1
                    pts = [(top[0] + (9 - k * 2.5) * math.cos(a0 + t), top[1] + (7.4 - k * 2) * math.sin(a0 + t)) for t in np.linspace(0, 3.6, 4)]
                    s.lock(pts, [2, 3.6, 3.2, 1], back, tone=.02)
            tail = C.get('tail')
            if tail == 'back_r':
                s.lock([(CX + 15, 24), (CX + fw + 10, 40), (CX + fw + 6, 78), (CX + fw + 11, 118)], [9, 11, 9, 3], back, tone=-.1)
            elif tail == 'high':
                s.lock([(CX + 2, 19), (CX + 18, 3), (CX + 36, 18), (CX + fw + 12, 64)], [8, 10, 8, 2.5], back, tone=-.05)
                s.lock([(CX + 4, 18), (CX + 22, 6), (CX + 32, 26), (CX + fw + 8, 56)], [5, 6, 5, 1.5], back, tone=.03)
            s.mass(ell(CX, 51, fw + 3, 18) & (Y > 44) & (Y < 72), back, d=-.22)   # the nape, seen past the neck
            s.hairline_cap(front, hl)
            # locks swept from the hairline up to the crown
            tgt = (top[0], top[1] + (3 if st == 'bun' else 7))
            for sg in (-1, 1):
                for k, (hx, hy) in enumerate(hl[:6] if sg < 0 else hl[::-1][:6]):
                    hy_ = hy + .8
                    mid = (hx + (hx - CX) * .12, (hy_ + tgt[1]) / 2 - 2)
                    s.lock([(hx, hy_), mid, (tgt[0] + sg * (2 + k * .7), tgt[1] + 2)], [2.2, 7.5, 6], front, tone=.03 - k * .012)
            if C.get('wisps', 0):
                for sg in (-1, 1):
                    s.lock([(CX + sg * (fw - 3.5), 40), (CX + sg * (fw + 1), 54), (CX + sg * (fw - 1), 68), (CX + sg * (fw + .5), 78)], [2.4, 3.0, 2.0, .6], front, tone=.08, soft=True, strands=False)
            fr = C.get('fringe')
            if fr == 'side':
                s.lock([(CX + 7, 24.5), (CX - 1, 29), (CX - 12, 33), (CX - fw + 1, 49)], [4.5, 8, 6, 1.4], front, tone=.02)
                s.lock([(CX + 10, 26), (CX + 3, 31), (CX - 5, 37), (CX - 12, 42)], [3.5, 6, 4, 1], front, tone=.05)
            elif fr == 'wispy':
                for k, xx in enumerate((-9, -3, 3, 9)):
                    s.lock([(CX + xx * .6, 25.5), (CX + xx * .9, 31), (CX + xx * 1.1 - 1.5, 38 + abs(xx) * .2)], [3.5, 4.2, .8], front, tone=.04 - k * .01)
            if tail == 'front_l':
                s.lock([(CX - fw + 2, 52), (CX - fw - 7, 76), (CX - fw - 2, 102), (CX - fw - 6, 128)], [8, 11, 10, 4], front, tone=.1)
                s.lock([(CX - fw + 3, 54), (CX - fw - 3, 78), (CX - fw + 1, 104), (CX - fw - 1, 128)], [4, 6, 6, 2], front, tone=.06)
        elif st in ('short', 'buzz', 'crop', 'spiky', 'curly', 'shaggy', 'sidepart', 'bangs', 'bob'):
            hl = [(CX - fw - .3, 57), (CX - fw + .8, 46), (CX - fw + 3.6, 38.5), (CX - 14, 33.8), (CX - 7, 31.8), (CX, 31.2), (CX + 7, 31.8), (CX + 14, 33.8),
                  (CX + fw - 3.6, 38.5), (CX + fw - .8, 46), (CX + fw + .3, 57)]
            if st == 'buzz': hl = [(x, y + (1.2 if abs(x - CX) < 18 else .4)) for x, y in hl]
            if st == 'bob':
                m = poly([(CX - fw - 4, 44)] + [(CX + (fw + 4) * math.cos(a), 49 - 32 * math.sin(a)) for a in np.linspace(math.pi, 0, 30)] + [(CX + fw + 4, 44), (CX + fw + 5, 86), (CX - fw - 5, 86)])
                s.mass(m, back)
            s.hairline_cap(front, hl)
            if st == 'buzz':
                front.append(dict(m=ell(CX, 49, fw + 3.4, 32.5) & (Y < np.interp(X, [p[0] for p in hl], [p[1] for p in hl], left=99, right=99)) & ((np.floor(X * 1.5) + np.floor(Y * 1.5)) % 3 == 0), L=s.hair_lit() - .14, mat='hair', tip=None, sh=None))
            elif st in ('short', 'sidepart', 'crop'):
                part = CX - 7 if st != 'crop' else CX
                for j in range(6):
                    tgt = (CX + (fw + 1.5) * (1 if j < 4 else -1), 33 + j * 2.4) if st == 'sidepart' else (CX + (fw + 1) * (1 if j % 2 else -1), 34 + j * 2)
                    s.lock([(part, 20.5 + j * .3), ((part + tgt[0]) / 2, 18 + j * .8), tgt], [4, 7, 3], front, tone=.03 - (j % 3) * .03)
                if st == 'short': s.lock([(CX - 6, 24), (CX + 2, 25), (CX + 8, 33)], [4, 6, 2], front, tone=.06)
                if st == 'crop':
                    for k in range(7):
                        xx = CX - 15 + k * 5; s.lock([(xx, 28), (xx + 1.5, 32.5), (xx + 2.5, 36.5)], [4, 3.5, .8], front, tone=.04 - (k % 2) * .05)
            elif st == 'spiky':
                for k in range(9):
                    a = math.pi * (.15 + .7 * k / 8); bx, by = CX - math.cos(a) * 14, 30 - math.sin(a) * 12
                    s.lock([(CX - math.cos(a) * 6, 30), (bx, by), (bx - math.cos(a) * 5, by - math.sin(a) * 6)], [7, 5, .6], front, tone=.04 - (k % 3) * .03)
                for k in range(6):
                    xx = CX - 13 + k * 5.2; s.lock([(xx, 28), (xx + 1, 34), (xx + 2.5, 40 + (k % 2) * 2.5)], [4.5, 3.5, .6], front, tone=.05 - (k % 2) * .05)
            elif st == 'curly':
                r_ = np.random.RandomState(4)
                for k in range(70):
                    a = r_.uniform(0, math.pi); rr = r_.uniform(.65, 1.08)
                    cx_ = CX + math.cos(a) * (fw + 3) * rr; cy_ = 46 - math.sin(a) * 30 * rr
                    if cy_ > 56: continue
                    front.append(dict(m=ell(cx_, cy_, 3.0, 2.8), L=sphere_lit(cx_ - .8, cy_ - .8, 3.2, 3.0, flat=.95, amb=.3, k=.5) + .1 * sstep(60, 20, Y) - .1 * (X > CX + 10), mat='hair', tip=None, sh=(.6, .8)))
            elif st == 'shaggy':
                for sg in (-1, 1):
                    for j in range(4):
                        s.lock([(CX + sg * (fw - 6 - j * 2), 30 + j), (CX + sg * (fw + 3 + j * .5), 50 + j * 2), (CX + sg * (fw + 1 + j), 64 + j * 2.5)], [5, 6, 1.5], front, tone=.02 - (j % 2) * .05)
                for k in range(7):
                    xx = CX - 15 + k * 5; s.lock([(xx + 2, 26), (xx, 36), (xx - 1.5, 42 + (k % 3) * 2)], [5, 4.5, .8], front, tone=.04 - (k % 2) * .05)
            elif st == 'bangs' or st == 'bob':
                if st == 'bob':
                    for sg in (-1, 1):
                        for j in range(4):
                            s.lock([(CX + sg * (fw - 8 - j * 2), 28 + j), (CX + sg * (fw + 3.5), 56), (CX + sg * (fw + 1 - j * 1.5), 84)], [5, 7, 4], front, tone=.02 - (j % 2) * .05)
                else:
                    for sg in (-1, 1):
                        for j in range(3):
                            s.lock([(CX + sg * (fw - 6 - j * 2), 30 + j), (CX + sg * (fw + 2.5), 50), (CX + sg * (fw + 1), 62 + j * 2)], [5, 6, 1.5], front, tone=.02 - (j % 2) * .05)
                for k in range(8):
                    xx = CX - 17 + k * 4.8; s.lock([(xx + 1, 25), (xx + .6, 36), (xx, 46.5 + (k % 2) * .8)], [5.2, 5, 4], front, tone=.04 - (k % 3) * .03)
        return back, front
    def braids(s, front):
        fw = s.C.get('face_w', 24.5)
        for sg in (-1, 1):
            path = bez([(CX + sg * (fw + .5), 56), (CX + sg * (fw + 5), 80), (CX + sg * (fw + 1.5), 102), (CX + sg * (fw + 4.5), 132)], 200)
            # the hair from the crown into the top of the braid
            s.lock([(CX + sg * (fw - 2), 40), (CX + sg * (fw + 3), 50), (CX + sg * (fw + 1), 60)], [6, 8, 6], front, tone=-.02)
            n = 18
            for k in range(n):
                t = k / (n - 1); i = int(t * 199); px_, py_ = path[i]
                side = 1 if k % 2 else -1
                rot = side * .55 * sg
                m = ell(px_ + side * .9, py_, 3.6 - t * .5, 2.3, rot=rot)
                L = sphere_lit(px_ + side * .9 - 1, py_ - 1, 3.8, 2.6, flat=.95, amb=.34, k=.48) - .12 * sstep(70, 128, py_) * np.ones_like(X)
                front.append((m, L, 'hair'))
    # ------------------------------------------------------------ accessories
    def headband(s):
        C = s.C; fw = C.get('face_w', 24.5)
        pts = bez([(CX - fw - 1.5, 47), (CX - fw + 2, 17), (CX + fw - 2, 17), (CX + fw + 1.5, 47)], 60)
        whole = ribbon(pts, [2.6, 3.2, 3.2, 2.6])[0]
        L = sphere_lit(CX - 3, 40, 30, 30, flat=.9, amb=.4, k=.42)
        s.cv.put(whole, 'acc', L)
        s.cv.add(whole & ~shift(whole, 0, -.8), 'acc', -.15)
        if C.get('knot'):
            s.cv.put(poly([(CX + fw - 4, 26), (CX + fw + 4, 20), (CX + fw + 2, 30)]), 'acc', L - .05)
    def cap(s):
        C, cv = s.C, s.cv; fw = C.get('face_w', 24.5)
        dome = ell(CX, 35, fw + 4.5, 19) & (Y < 35.5)
        L = sphere_lit(CX - 4, 30, fw + 6, 20, flat=.9, amb=.38, k=.45)
        cv.put(dome, 'acc', L)
        for sg in (-1, 1):
            cv.add(stroke(bez([(CX, 16.5), (CX + sg * 8, 20), (CX + sg * 13, 35)], 20), [.5, .9, .7]), 'acc', -.17)
        cv.put(ell(CX, 16.6, 1.8, 1.2), 'acc', .7)
        u = np.clip((X - CX) / (fw + 7), -1, 1)
        q = np.clip((X - CX) / (fw + 3.5), -1, 1)
        bt = 33.5 + 1.6 * (1 - q * q); bb = 36.2 + 8.6 * (1 - q * q) ** 1.15
        brim = (np.abs((X - CX) / (fw + 3.5)) < 1) & (Y > bt) & (Y < bb)
        cv.put(brim, 'acc', .26 + .08 * (X < CX) + .34 * sstep(bb - 1.6, bb - .2, Y))
        sh = (shift(brim, .5, 2.4) | shift(brim, .3, 4.5)) & ~brim & ~dome
        for m in ('skin', 'hair', 'blush'): cv.add(sh, m, -.22)
    def flower(s, fx, fy, r=2.3):
        cv = s.cv
        for k in range(5):
            a = k / 5 * math.pi * 2 - math.pi / 2
            cv.put(ell(fx + math.cos(a) * r * .8, fy + math.sin(a) * r * .8, r * .62, r * .62), 'acc', .55 + .2 * math.cos(a + 2.2))
        cv.put(ell(fx, fy, r * .38, r * .38), 'acc2', .7)
    def glasses(s):
        C, cv = s.C, s.cv; kind = C.get('glasses')
        if not kind: return
        ecy = C.get('eye_y', 59.0) + .4; dx = C.get('eye_dx', 11.6)
        rings = np.zeros((NS, NS), bool)
        for sg in (-1, 1):
            ecx = CX + sg * dx
            if kind == 'round':
                o = ell(ecx, ecy, 8.3, 7.7); i = ell(ecx, ecy, 7.4, 6.8); rings |= o & ~i
                arm_x = ecx + sg * 8.2
            else:
                ax, ay = np.abs(X - ecx), np.abs(Y - ecy - .2)
                def rr(hw, hh, r): return ((np.maximum(ax - (hw - r), 0) ** 2 + np.maximum(ay - (hh - r), 0) ** 2) <= r * r)
                if kind == 'tall':
                    ay = np.abs(Y - ecy - 1.2); o = rr(9.4, 8.2, 4.4); i = rr(7.9, 6.8, 3.4)
                else:
                    o = rr(9.6, 7.0, 3.0); i = rr(8.1, 5.6, 2.2)
                rings |= o & ~i
                arm_x = ecx + sg * 9.5
            cv.put(stroke([(arm_x, ecy - 2.5), (CX + sg * (C.get('face_w', 24.5) + 1), ecy - 3.2)], [1.0, .8]), 'frame', .4)
            gx, gy = ecx - 4.6, ecy - 2.6
            cv.put(stroke([(gx, gy + 1.6), (gx + 1.7, gy - .6)], [.55, .55]), 'glass', 1)
        cv.put(rings, 'frame', .45 + .25 * (Y < ecy - 3) - .1 * (X > CX))
        br = bez([(CX - dx + 7.6 if kind == 'round' else CX - dx + 9.4, ecy - 1.5), (CX, ecy - 3.4), (CX + dx - (7.6 if kind == 'round' else 9.4), ecy - 1.5)], 20)
        cv.put(ribbon(br, [1.0, 1.2, 1.0])[0], 'frame', .5)
    def earrings(s):
        C, cv = s.C, s.cv; kind = C.get('earrings'); fw = C.get('face_w', 24.5)
        if not kind: return
        for sg in (-1, 1):
            lx, ly = CX + sg * (fw + 1.6), 66.4
            if kind == 'stud': cv.put(ell(lx, ly, 1.1, 1.1), 'acc2', .7 - .15 * (X > lx))
            elif kind == 'hoop':
                cv.put(ell(lx, ly + 3.4, 2.9, 3.6) & ~ell(lx, ly + 3.4, 1.8, 2.5) & (Y > ly), 'metal', .72 - .2 * (X > lx))
            elif kind == 'stars':
                big = C.get('star_r', 1.9)
                for (sx_, sy_, r) in ((lx, ly + (1 if big > 2 else 0), big), (lx + sg * 1.4, ly - 6.2, big * .68)):
                    pts = [(sx_ + (r if k % 2 == 0 else r * .45) * math.cos(k * math.pi / 5 - math.pi / 2), sy_ + (r if k % 2 == 0 else r * .45) * math.sin(k * math.pi / 5 - math.pi / 2)) for k in range(10)]
                    cv.put(poly(pts), 'metal', (.75 - .3 * (Y > sy_ + .3)) if big > 2 else .75)
                cv.put(ell(lx + sg * .8, ly - 2.8, .8, .8), 'metal', .6)
    def necklace(s):
        C, cv = s.C, s.cv; kind = C.get('necklace')
        if not kind: return
        if kind == 'chain':
            pts = bez([(CX - 9.2, 90 + BO), (CX - 6, 105.5 + BO), (CX + 6, 105.5 + BO), (CX + 9.2, 90 + BO)], 40)
            cv.put(ribbon(pts, [.6, .75, .75, .6])[0], 'metal', .55 + .2 * (X < CX))
            cv.put(ell(CX, 107.6 + BO, 1.5, 2.0), 'metal', .45 + .4 * G(CX - .6, 106.8 + BO, .8, .8))
        elif kind == 'pearls':
            pts = bez([(CX - 9.4, 90 + BO), (CX - 5.5, 103 + BO), (CX + 5.5, 103 + BO), (CX + 9.4, 90 + BO)], 400)
            for k in range(0, 400, 26):
                px_, py_ = pts[k]; cv.put(ell(px_, py_, .95, .95), 'acc2', .5 + .35 * G(px_ - .35, py_ - .35, .45, .45))
        elif kind == 'cord':
            if C.get('cord_v'):
                by = C['cord_v'] + BO
                for sg in (-1, 1):
                    cv.put(ribbon(bez([(CX + sg * 9.2, 89 + BO), (CX + sg * 7.4, 97 + BO), (CX + sg * 3, by - 2.5), (CX, by)], 24), [.6, .7, .7, .6])[0], 'cord', .4)
                cv.put(ell(CX, by + 1.3, 1.2, 1.3), 'metal', .42 + .25 * G(CX - .5, by + .8, .6, .6))
            else:
                pts = bez([(CX - 9.0, 89 + BO), (CX - 5.5, 103.5 + BO), (CX + 5.5, 103.5 + BO), (CX + 9.0, 89 + BO)], 40)
                cv.put(ribbon(pts, [.6, .7, .7, .6])[0], 'cord', .4)
                cv.put(ell(CX, 105.4 + BO, 1.1, 1.4), 'metal', .7)
    def vein(s):
        vx, vy = CX + s.C.get('face_w', 25) + 1, 27
        for k in range(4):   # four bent bars around an empty centre: the cartoon mark for a throbbing temple
            a = k * math.pi / 2 + math.pi / 4; cx_, cy_ = vx + math.cos(a) * 3.2, vy + math.sin(a) * 3.2
            b = a + math.pi / 2
            s.cv.put(stroke([(cx_ + math.cos(b) * 2.6, cy_ + math.sin(b) * 2.6), (cx_ + math.cos(a) * 1.3, cy_ + math.sin(a) * 1.3), (cx_ - math.cos(b) * 2.6, cy_ - math.sin(b) * 2.6)], [1.3, 1.7, 1.3]), 'vein', .4)
    def rain(s):
        r = np.random.RandomState(5)
        m = np.zeros((NS, NS), bool)
        for _ in range(26):
            x0, y0, L = r.uniform(-10, 128), r.uniform(-10, 128), r.uniform(5, 11)
            m |= stroke([(x0, y0), (x0 + L * .32, y0 + L)], [.55, .55])
        s.cv.put(m, 'rain', 1)
        for _ in range(9):
            fx, fy = r.uniform(CX - 20, CX + 20), r.uniform(60, 82)
            s.cv.put(ell(fx, fy, .55, .7) & s.face_m, 'glint2', 1)
    def sweat(s):
        fw = s.C.get('face_w', 24.5)
        s.cv.put(ell(CX + fw - 4, 44, 1.2, 1.8) | poly([(CX + fw - 5.1, 43.6), (CX + fw - 4, 40.2), (CX + fw - 2.9, 43.6)]), 'tear', .7)
    def print_moon(s):
        cv = s.cv
        m = ell(CX - 1, 117, 3.6, 3.6) & ~ell(CX + .6, 115.8, 3.0, 3.0)
        cv.put(m & cv.where('top'), 'top3', .5)
        for (sx_, sy_) in ((CX + 4.5, 113), (CX + 6.4, 118.5), (CX + 2.6, 120.6)):
            cv.put(ell(sx_, sy_, .55, .55) & cv.where('top'), 'top3', .5)


    # ------------------------------------------------------------ age, beards
    def wrinkles(s):
        C, cv = s.C, s.cv; a = C.get('age', 0)
        if a <= 0: return
        ey = C.get('eye_y', 59.3); dx = C.get('eye_dx', 11.6); ea = C.get('eye_a', 5.9); fm = s.face_m
        for sg in (-1, 1):
            ox = CX + sg * (dx + ea + 1.2)
            for k, ang in enumerate((-.35, .05, .4)[:2 + (a > .6)]):
                cv.put(stroke([(ox, ey + ang * 2), (ox + sg * 2.6, ey + ang * 4.2 - .3)], [.6, .2]) & fm, 'wrinkle', .5)
            cv.put(stroke(bez([(CX + sg * (dx - ea * .7), ey + 4.2), (CX + sg * dx, ey + 5.4), (CX + sg * (dx + ea * .8), ey + 4.4)], 16), [.2, .6, .2]) & fm, 'wrinkle', .5)
            cv.put(stroke(bez([(CX + sg * 4.6, 69), (CX + sg * 8.2, 72.5), (CX + sg * 9.2, 78.5)], 20), [.4, .8, .3]) & fm, 'wrinkle', .5)
            if a > .55: cv.add(ell(CX + sg * 17, 80, 5, 3) & fm, 'skin', -.08)
        if a > .5:
            for yy in (37.5, 40.5):
                cv.put(stroke(bez([(CX - 9, yy + .6), (CX, yy - .4), (CX + 9, yy + .6)], 20), [.2, .55, .2]) & fm, 'wrinkle', .55)
    def beard(s):
        C, cv, ex = s.C, s.cv, s.ex; kind = C.get('beard')
        if not kind: return
        fm = s.face_m; mx, my = CX + .3, C.get('mouth_y', 76.5); chin = C.get('chin', 86); fw = C.get('face_w', 25)
        hl = s.hair_lit() if hasattr(s, 'hair_lit') else .5
        strands = .1 * np.sin(X * 2.1 + 2.2 * np.sin(Y * .3)) + .05 * np.sin(X * 5.3 + Y * .8)
        mouth_hole = ell(mx, my + (1.4 if ex in ('happy', 'laugh', 'scared', 'cry', 'surprised', 'wrong') else .6), C.get('lip_w', 6.4) + .8, 2.6 if ex in ('happy', 'laugh', 'scared', 'cry', 'wrong') else 2.0)
        if kind == 'stubble':
            ys = np.linspace(60, chin + 1, 60); hw = s.face_hw(ys)
            reg = poly([(CX + w + .3, y) for w, y in zip(hw, ys)] + [(CX - w - .3, y) for w, y in zip(hw[::-1], ys[::-1])]) & (Y > 66 + 3 * np.abs(X - CX) / fw * 0)
            reg &= ~((np.abs(X - CX) < 11) & (Y < my - 2.2)) | ((np.abs(X - CX) < 7.5) & (Y > my - 4.2) & (Y < my - 1.6))
            reg &= ~mouth_hole & (Y > 64.5 + 2.5 * (1 - np.abs(X - CX) / fw))
            cv.put(reg & fm, 'stubble', s.face_lit - .02)
            cv.put(reg & fm & (((np.floor(X) * 7 + np.floor(Y) * 13) % 11) == 0), 'stubble', s.face_lit - .18); return
        mo = None
        if kind in ('moustache', 'goatee', 'full'):
            mo = np.zeros((NS, NS), bool)
            for sg in (-1, 1):
                mo |= ribbon(bez([(mx + sg * .2, my - 2.7), (mx + sg * 4.5, my - 2.9), (mx + sg * 7.6, my - 1.4), (mx + sg * 8.6, my + 1.4)], 24), [2.4, 2.6, 2.0, .8])[0]
            cv.put(mo, 'beard', hl * 0 + .5 + strands - .08 * (X > CX))
        if kind == 'goatee':
            g = ell(mx, chin - 3.0, 4.2, 4.0) | ribbon(bez([(mx, my + 2.6), (mx, chin - 2)], 8), [3.2, 4.0])[0]
            cv.put(g & ~mouth_hole, 'beard', .48 + strands - .08 * (X > CX))
        if kind == 'full':
            yc = chin - 4.5; wc = float(s.face_hw(np.array([yc]))[0]) + 1.6; ys = np.linspace(58, yc + 8.6, 80)
            hw = np.where(ys < yc, s.face_hw(np.clip(ys, 20, chin)) + 1.6, wc * np.sqrt(np.clip(1 - ((ys - yc) / 8.8) ** 2, 0, 1)))
            out = [(CX + w, y) for w, y in zip(hw, ys)] + [(CX - w, y) for w, y in zip(hw[::-1], ys[::-1])]
            reg = poly(out) & (Y > 63 + 6.5 * np.clip(1 - np.abs(X - CX) / (fw + 2), 0, 1) ** 1.6)
            reg &= ~mouth_hole
            L = .6 + strands + .08 * sstep(70, 60, Y) - .16 * sstep(CX - 4, CX + 20, X) - .1 * sstep(chin - 1, chin + 6, Y) + .12 * G(CX - 8, chin - 4, 5, 4)
            cv.put(reg, 'beard', L)
            cv.add(reg & ~shift(reg, 0, 1.0), 'beard', -.12)
            for k in range(14):   # a few separate tufts break the bottom edge
                bx = CX - (wc - 2) + k * (2 * wc - 4) / 13; by = yc + 8.4 * math.sqrt(max(0, 1 - ((bx - CX) / wc) ** 2))
                cv.put(ribbon(bez([(bx, by - 4), (bx + (bx - CX) * .04, by + .5)], 8), [2.2, .4])[0], 'beard', .5 + .1 * (bx < CX))
            if mo is not None: cv.put(mo, 'beard', .56 + strands - .08 * (X > CX))
    # ------------------------------------------------------------ hats for everyone
    def hat2(s):
        C, cv = s.C, s.cv; h = C.get('hat'); fw = C.get('face_w', 25)
        if not h: return
        m = 'hatm' if 'hatm' in s.pal.names else 'acc'
        if h == 'cap':
            dome = ell(CX, 34, fw + 2.6, 21) & (Y < 35)
            L = sphere_lit(CX - 5, 24, fw + 4, 20, flat=.92, amb=.4, k=.46)
            cv.put(dome, m, L)
            front = ell(CX, 34, 11, 21) & dome
            cv.add(front, m, .05)
            for sg in (-1, 1): cv.add(stroke(bez([(CX + sg * 11, 15.5), (CX + sg * 12, 24), (CX + sg * 11.5, 35)], 20), [.5, .8, .6]) & dome, m, -.16)
            for sg in (-1, 1): cv.add(stroke(bez([(CX, 13.4), (CX + sg * 13, 18), (CX + sg * (fw + 1), 33)], 20), [.4, .7, .5]) & dome, m, -.1)
            cv.put(ell(CX, 13.6, 2.0, 1.3), m, .72)
            for k in range(2): cv.add(ell(CX - 4 + k * 8, 27, .7, .7) & dome, m, -.2)
            q = np.clip((X - CX) / (fw + 1.5), -1, 1); bt = 33 + 1.0 * (1 - q * q); bb = 35 + 6.6 * (1 - q * q) ** 1.1
            brim = (np.abs((X - CX) / (fw + 1.5)) < 1) & (Y > bt) & (Y < bb)
            cv.put(brim, m, .62 - .08 * (X > CX) - .4 * sstep(bt + 1.4, bt + 3.2, Y) + .16 * sstep(bb - 1.4, bb - .3, Y))
            cv.add(brim & ~shift(brim, 0, 1), m, .1)
            sh = (shift(brim, .5, 2.4) | shift(brim, .3, 4.8)) & ~brim & ~dome
        elif h == 'top':
            crown = poly([(CX - 15.5, 30), (CX - 14.5, 2), (CX + 14.5, 2), (CX + 15.5, 30)])
            cv.put(crown, m, .45 - .2 * sstep(CX - 12, CX + 15, X) + .12 * G(CX - 9, 10, 3, 12))
            cv.put(crown & (Y > 23) & (Y < 28), m, .2)
            brim = ell(CX, 31, 25, 3.6)
            cv.put(brim, m, .36 + .2 * (Y < 30.5)); sh = shift(brim, .4, 2.6) & ~brim & ~crown
        elif h == 'sheriff':
            crown = ell(CX, 24, 16.5, 13) & (Y < 31)
            L = sphere_lit(CX - 4, 18, 18, 14, flat=.9, amb=.4, k=.45)
            cv.put(crown, m, L); cv.add(ell(CX, 12, 3.5, 6) & crown, m, -.18)
            cv.put(crown & (Y > 26) & (Y < 30), m, .22)
            q = (X - CX) / 36.0; ytop = 30.5 - 5.5 * q * q; brim = (np.abs(q) < 1) & (Y > ytop) & (Y < ytop + 4.2 + 1.5 * (1 - q * q))
            cv.put(brim & ~crown, m, .42 + .2 * sstep(ytop + 3, ytop + 4.5, Y) - .1 * (X > CX)); sh = shift(brim, .4, 2.8) & ~brim & ~crown
        elif h == 'bucket':
            crown = ell(CX, 30, fw + 1, 15) & (Y < 31)
            cv.put(crown, m, sphere_lit(CX - 4, 22, fw + 2, 16, flat=.9, amb=.4, k=.42))
            band = poly([(CX - fw - 1, 30), (CX + fw + 1, 30), (CX + fw + 6, 38.5), (CX - fw - 6, 38.5)])
            cv.put(band, m, .32 + .22 * sstep(36, 38.5, Y) - .08 * (X > CX))
            for k in range(3): cv.add(stroke([(CX - fw - 2 - k * 1.5, 31 + k * 2.6), (CX + fw + 2 + k * 1.5, 31 + k * 2.6)], [.4, .4]) & band, m, -.08)
            sh = shift(band, .4, 2.6) & ~band & ~crown
        elif h == 'beanie':
            dome = ell(CX, 36, fw + 2.8, 22) & (Y < 39)
            L = sphere_lit(CX - 4, 26, fw + 4, 22, flat=.9, amb=.4, k=.42)
            cv.put(dome, m, L)
            cv.add(dome & ((np.floor(X) % 3) == 0) & (Y < 33), m, -.08)
            cuff = dome & (Y > 32)
            cv.put(cuff, m, L + .05); cv.add(cuff & ((np.floor(X) % 2) == 0), m, -.1); cv.add(cuff & ~shift(cuff, 0, -1), m, -.15)
            cv.put(ell(CX + 2, 13.5, 3.2, 2.6), m, .65)
            sh = shift(cuff, .3, 2.2) & ~dome
        else: return
        for mm in ('skin', 'hair', 'blush', 'shadow', 'crease', 'brow'):
            if mm in s.pal.names: cv.add(sh, mm, -.2)
    # ------------------------------------------------------------ menswear and the rest
    def wear(s):
        C, cv = s.C, s.cv; o = BO; sw = C.get('shoulder', 55.0); tor = poly(s.torso_poly()); w = C.get('wear') or ()
        if 'overalls' in w:
            bib = poly([(CX - 15, 109 + o), (CX + 15, 109 + o), (CX + 16, max(130 + o, 132)), (CX - 16, max(130 + o, 132))]) & tor
            L = .58 - .18 * (X - CX) / 40
            cv.put(bib, 'top2', L); cv.add(bib & ~shift(bib, 0, 1), 'top2', -.15)
            cv.add(stroke([(CX - 9, 115 + o), (CX + 9, 115 + o)], [.6, .6]) & bib, 'top2', -.12)
            for sg in (-1, 1):
                st = stroke(bez([(CX + sg * 21, 90 + o), (CX + sg * 19, 100 + o), (CX + sg * 13, 110 + o)], 16), [4.6, 4.4, 4.2])
                cv.put(st & tor, 'top2', .6 - .12 * sg); cv.add(shift(st, sg * .9, .4) & ~st & tor, 'top', -.12)
                cv.put(ell(CX + sg * 12.5, 110.5 + o, 1.8, 1.8), 'badge', .7)
        if 'vest' in w:
            for sg in (-1, 1):
                pts = [(CX + sg * 8, 92 + o), (CX + sg * 3, 118 + o), (CX + sg * 2.5, 132 + o), (CX + sg * (sw - 12), 132 + o), (CX + sg * (sw - 14), 112 + o), (CX + sg * 18, 92 + o)]
                m_ = poly(pts) & tor; cv.put(m_, 'top2', .55 - .18 * (X - CX) / 40)
                cv.add(ribbon(bez([(CX + sg * 8, 92 + o), (CX + sg * 3, 118 + o)], 12), [1.2, 1.2])[0] & m_, 'top2', .1)
                cv.add(shift(m_, -sg * 1, .5) & ~m_ & tor, 'top', -.14)
            for by in (112, 120): cv.put(ell(CX + 3.6, by + o, .9, .9), 'badge', .6)
        if 'coat' in w:
            for sg in (-1, 1):
                pts = [(CX + sg * 10, 88 + o), (CX + sg * 7, 112 + o), (CX + sg * 6, 132 + o), (CX + sg * (sw + 4), 132 + o), (CX + sg * (sw + 4), 86 + o)]
                m_ = poly(pts) & tor; L = .5 - .2 * (X - CX) / 55 + .06 * G(CX - 34, 104 + o, 12, 5)
                cv.put(m_, 'top2', L)
                lap = poly([(CX + sg * 10, 88 + o), (CX + sg * 19, 92 + o), (CX + sg * 16, 106 + o), (CX + sg * 7.5, 110 + o)]) & tor
                cv.put(lap, 'top2', L + .08); cv.add(lap & ~shift(lap, -sg, 0), 'top2', -.15)
                cv.add(shift(m_, -sg * 1, .5) & ~m_ & tor, 'top', -.15)
        if 'clerical' in w:
            cv.put(stroke(bez([(CX - 9.5, 90 + o), (CX, 93.5 + o), (CX + 9.5, 90 + o)], 16), [2.6, 2.6, 2.6]), 'collarw', .7)
            cv.put(poly([(CX - 2, 92 + o), (CX + 2, 92 + o), (CX + 2, 96.5 + o), (CX - 2, 96.5 + o)]), 'collarw', .8)
        if 'hood' in w:
            ring = ribbon(bez([(CX - 21, 96 + o), (CX - 13, 89 + o), (CX, 92 + o), (CX + 13, 89 + o), (CX + 21, 96 + o)], 40), [5, 6, 6, 6, 5])[0] & tor
            cv.put(ring, 'top', .5 + .12 * (X < CX)); cv.add(ring & ~shift(ring, 0, -1.2), 'top', -.18)
            for sg in (-1, 1): cv.put(stroke([(CX + sg * 4, 97 + o), (CX + sg * 4.5, 112 + o)], [.7, .6]), 'collarw', .6)
        if 'badge' in w:
            bx, by = CX - 20, 113 + o
            pts = [(bx + (3.6 if k % 2 == 0 else 1.6) * math.cos(k * math.pi / 5 - math.pi / 2), by + (3.6 if k % 2 == 0 else 1.6) * math.sin(k * math.pi / 5 - math.pi / 2)) for k in range(10)]
            cv.put(poly(pts), 'badge', .55 + .3 * G(bx - 1, by - 1, 1.6, 1.6))
        if 'bandana' in w:
            b = poly([(CX - 10.5, 90 + o), (CX + 10.5, 90 + o), (CX + 2, 105 + o), (CX - 1, 105 + o)])
            cv.put(b, 'acc', .55 + .15 * (X < CX)); cv.add(stroke([(CX - 6, 93 + o), (CX, 101 + o)], [.6, .4]), 'acc', -.18)
            cv.put(ell(CX + 8.5, 91.5 + o, 2.2, 1.8), 'acc', .5)
        if 'scarf' in w:
            sc = ribbon(bez([(CX - 14, 92 + o), (CX - 6, 97 + o), (CX + 6, 97 + o), (CX + 14, 92 + o)], 30), [6, 6.5, 6.5, 6])[0]
            cv.put(sc, 'acc', .5 + .15 * (X < CX)); cv.add(sc & (np.floor(X) % 4 == 0), 'acc', -.08)
            tail = ribbon(bez([(CX + 7, 97 + o), (CX + 9, 110 + o), (CX + 8, 126 + o)], 20), [5, 5, 4.6])[0]
            cv.put(tail, 'acc', .44); cv.add(tail & ~shift(tail, 0, -1) & (Y > 124 + o), 'acc', -.15)
        if 'knit' in w:
            cv.add(s.cloth_m & ((np.floor(X) % 3) == 0), 'top', -.07)
            cv.add(s.cloth_m & ((np.floor(Y + X * .0) % 6) == 0) & (Y > 120 + o), 'top', -.05)
        if 'stripes' in w:
            cv.add(s.cloth_m & ((np.floor(Y) % 6) < 2), 'top', -.13)
    # ------------------------------------------------------------ the whole portrait
    def paint(s):
        C, cv = s.C, s.cv
        back, front = s.style()
        s.paint_locks(back)
        s.body()
        if C.get('allure'): s.bust()
        s.clothes(); s.over_layer(); s.wear()
        if C.get('print') == 'moon': s.print_moon()
        s.necklace()
        s.face()
        cv.add(s.face_m & ~shift(s.face_m, 0, -1.0) & (Y > 68), 'skin', -.24)      # the jaw line
        s.earrings()
        for sg in (-1, 1): s.eye(sg)
        s.wrinkles(); s.brows(); s.nose(); s.mouth(); s.beard()
        before = cv.mat.copy()
        s.paint_locks(front)
        hm = (cv.mat != before) & ((cv.mat == s.pal.id('hair')) | (('hairtip' in s.pal.names) and (cv.mat == s.pal.id('hairtip')) if 'hairtip' in s.pal.names else False))
        sh = shift(hm, .7, 1.9) & ~hm
        for m in ('skin', 'blush', 'shadow', 'crease'):
            if m in s.pal.names: cv.add(sh, m, -.17)
        if C.get('cap'): s.cap()
        s.hat2()
        if C.get('headband'): s.headband()
        if C.get('flower_at'): s.flower(*C['flower_at'])
        s.glasses()
        if s.ex == 'scared': s.sweat()
        if s.ex == 'angry': s.vein()
        # the arms part from the body
        sw = C.get('shoulder', 55.0)
        for sg in (-1, 1):
            am = stroke(bez([(CX + sg * (sw - 12), 112 + BO), (CX + sg * (sw - 10.5), 120 + BO), (CX + sg * (sw - 9.5), max(129 + BO, 132))], 16), [.4, 1.0, 1.1])
            for m_ in ('skin', 'top', 'top2', 'dot'):
                if m_ in s.pal.names: cv.add(am, m_, -.17)
        if s.var == 'wet':
            for m_ in ('hair', 'hairtip'):
                if m_ in s.pal.names: cv.add(np.ones((NS, NS), bool), m_, -.1)
            for m_ in ('top', 'top2', 'top3', 'dot'):
                if m_ in s.pal.names: cv.add(np.ones((NS, NS), bool), m_, -.06)
            s.rain()
        if s.var == 'night':
            keep = np.isin(cv.mat, [s.pal.id(n) for n in ('glint', 'glint2', 'pupil', 'sclera', 'iris', 'lash', 'rain') if n in s.pal.names])
            cv.lit[~keep] = cv.lit[~keep] * .8 - .03 + .1 * G(CX - 34, 96, 26, 30)[~keep]   # a lantern held low on the left
        img, bid, blit = reduce(cv)
        img = outline(img, bid, s.pal)
        return img

def portrait(C, ex, var='day'): return Painter(C, ex, var).paint()
