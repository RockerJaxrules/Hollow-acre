"""Every building in Hollow Acre through the blockout method: the same specs as tools/ase/buildings.lua (dumped to
JSON), built as 3D scenes (30-degree camera, our own house kit) and hand-finished. Keeps each building's colours,
windows, doors, porch, signs and wear, and writes the same metadata the game uses (door width and offset, steps,
chimney position for the smoke). Night sprites (<name>_n) light the windows.

    python3 town3d.py specs.json [names...] [--install]      (HA_BUILD=/build/copy installs into the build copy too)

Plan units are the 2D builder's pixels: x across, heights as they appear on screen. Heights become 3D by / cos(30),
so a wall keeps its on-screen height; depth z runs toward the viewer, the front wall stands at z = 0.
"""
import sys, os, json, math, re, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from nature import install, SHADOW
from blockprops import POOL
GEN = os.path.join(HERE, 'blockouts', 'town'); OUT = os.path.join(HERE, 'town3d_gen')
os.makedirs(GEN, exist_ok=True); os.makedirs(OUT, exist_ok=True)
CY = math.cos(math.radians(30))

# ---------------------------------------------------------------- palette: the 2D builder's own colours
PAL = dict(re.findall(r"\{'([A-Za-z0-9]+)','(#[0-9a-f]{6})'\}", open(os.path.join(HERE, '..', 'ase', 'bkit.lua')).read()))
def R(prefix, idx): return [PAL[f'{prefix}{i}'] for i in idx]
WALLS = {k: R(p, (1, 2, 4, 5, 6)) for k, p in dict(honey='w', white='ww', sage='sg', blue='bb', oxblood='ox', mustard='mu', brick='bk',
                                                    stone='s', log='lg', plaster='pl').items()}
ROOFS = {k: R(p, (1, 2, 3, 4, 6)) for k, p in dict(scallop='r', slate='sl', shingle='sh', tin='tn', thatch='th', plum='pr', asphalt='as',
                                                    brown='bn', teal='tl').items()}
ROOFS['tin'] = R('tn', (1, 2, 3, 4, 5))   # tin catches the light hardest: keep its top step down
TRIMS = {k: R(p, (1, 2, 3, 4, 5)) for k, p in dict(cream='t', green='dg', black='bt').items()}
DOORS = {'teal': R('d', range(1, 6)), 'red': R('dr', range(1, 6)), 'green': R('dg', range(1, 6)), 'black': R('bt', range(1, 6)),
         'oak': R('w', range(2, 7))}
MISC = {
    'found': WALLS['stone'], 'glass': R('g', (1, 2, 3, 4, 5)), 'dark': ['#07080c', '#0c0e14', '#12141c', '#1a1d28', '#262a36'],
    'tar': ['#0e0e12', '#16161c', '#1e1e26', '#282832', '#34343e'],
    'lit': ['#6a3a1a', '#b8742a', '#e8a83e', '#fbe08a', '#fff4c8'], 'wood': R('w', (2, 3, 4, 5, 6)), 'deck': R('k', (1, 2, 3, 4, 5)),
    'iron': R('m', (1, 2, 3, 4)) + ['#b8bcc8'], 'leaf': R('v', (1, 2, 3, 4, 5)), 'flower': R('f', (1, 2, 3, 4)) + ['#f0a890'],
    'skin': ['#3a2a2a', '#6a5450', '#a89088', '#c8b8b0', '#ece2da'], 'shadowman': ['#050407', '#08070b', '#0b0a0f', '#0e0d13', '#121017'],
    'awnA': R('dr', range(1, 6)), 'awnB': R('t', range(1, 6)), 'signb': R('w', (2, 3, 4, 5, 6)),
    'stained': ['#14101c', '#a82430', '#2450a8', '#d8aa3a', '#3a8a5a'],
    'stA': ['#3a0a14', '#6e1420', '#a82430', '#d84a44', '#f08a6a'], 'stB': ['#0a1a3a', '#14306a', '#2450a8', '#4a7ad8', '#8ab0f0'],
    'stC': ['#3a2a08', '#6a4a10', '#a87a1c', '#d8aa3a', '#f0d27a'], 'blood': ['#1e0408', '#3a080e', '#5a0e14', '#781a1a', '#922424'],
}
CURT = {'t4': TRIMS['cream'], 'f2': MISC['flower'], 'v4': MISC['leaf'], 'f3': MISC['flower']}
OUTLINE = ['#1d1018', '#2c1820']


def Y(v): return v / CY    # an on-screen height -> 3D height


# ---------------------------------------------------------------- parts
def box(x0, y0, z0, x1, y1, z1, m, **k): return dict(type='box', min=[x0, y0, z0], max=[x1, y1, z1], mat=m, **k)
def cyl(x, y, z, r, h, m, axis='y', **k): return dict(type='cylinder', c=[x, y, z], r=r, h=h, mat=m, axis=axis, **k)
def rod(a, b, r0, r1, m, **k): return dict(type='branch', a=a, b=b, r0=r0, r1=r1, mat=m, **k)
def ell(x, y, z, rr, m, **k): return dict(type='ellipsoid', c=[x, y, z], rr=rr, mat=m, **k)


def slopes(c, half, rise, axis):
    """two roof planes rising `rise` over `half` either side of the ridge (axis 'x': ridge runs along x)"""
    L = math.hypot(half, rise); a, b = rise / L, half / L; d = (rise * half - half * rise / 2) / L
    return [[0, b, a, d], [0, b, -a, d]] if axis == 'x' else [[a, b, 0, d], [-a, b, 0, d]]


def hip(X0, X1, Z0, Z1, y0, rise, m, pat):
    c = [(X0 + X1) / 2, y0 + rise / 2, (Z0 + Z1) / 2]; hz = (Z1 - Z0) / 2
    pl = slopes(c, hz, rise, 'x'); L = math.hypot(hz, rise); hx = (X1 - X0) / 2
    pl += [[rise / L, hz / L, 0, (rise * hx - hz * rise / 2) / L], [-rise / L, hz / L, 0, (rise * hx - hz * rise / 2) / L]]
    return dict(type='box', min=[X0, y0, Z0], max=[X1, y0 + rise, Z1], mat=m, c=c, planes=pl, pattern=pat)


def ridge_x(X0, X1, Z0, Z1, y0, rise, m, pat=None):   # side gable: ridge left-right
    c = [(X0 + X1) / 2, y0 + rise / 2, (Z0 + Z1) / 2]
    return dict(type='box', min=[X0, y0, Z0], max=[X1, y0 + rise, Z1], mat=m, c=c, planes=slopes(c, (Z1 - Z0) / 2, rise, 'x'), **({'pattern': pat} if pat else {}))


def gable_shell(X0, X1, Z0, Z1, y0, rise, m, pat=None, t=5):
    """a front-gable roof as two thin slabs (ridge front-back), so the wall triangle under it shows from the front"""
    c = [(X0 + X1) / 2, y0 + rise / 2, (Z0 + Z1) / 2]; half = (X1 - X0) / 2
    L = math.hypot(half, rise); a, b = rise / L, half / L; d = (rise * half - half * rise / 2) / L
    out = []
    for sgn, xa, xb in ((1, c[0], X1), (-1, X0, c[0])):
        out.append(dict(type='box', min=[xa, y0, Z0], max=[xb, y0 + rise, Z1], mat=m, c=c,
                        planes=[[sgn * a, b, 0, d], [-sgn * a, -b, 0, -(d - t)]], **({'pattern': pat} if pat else {})))
    return out


def ridge_z(X0, X1, Z0, Z1, y0, rise, m, pat=None):   # front gable: ridge front-back, the triangle faces you
    c = [(X0 + X1) / 2, y0 + rise / 2, (Z0 + Z1) / 2]
    return dict(type='box', min=[X0, y0, Z0], max=[X1, y0 + rise, Z1], mat=m, c=c, planes=slopes(c, (X1 - X0) / 2, rise, 'z'), **({'pattern': pat} if pat else {}))


def wall_pattern(mat):
    if mat == 'brick': return ['bricks', 3]
    if mat == 'stone': return ['bricks', 5]
    if mat == 'log': return ['planks', 6, 'y', 2]
    if mat == 'plaster': return None
    return ['planks', 5, 'y']


def window(P, cx, ytop, w, h, wo, sp, night, i, F, Yw):
    """a window whose top sits `ytop` screen px below the wall top (the 2D builder's convention)"""
    top = F + Yw - Y(ytop); bot = top - Y(h); x0, x1 = cx - w / 2, cx + w / 2
    trim = 'trim'
    boarded, broken, dark = wo.get('boarded'), wo.get('broken'), wo.get('dark')
    lancet = wo.get('lancet')
    lp = [[.8, .6, 0, 0], [-.8, .6, 0, 0]] if lancet else None
    def lanc(d, yt):   # pointed tops: two planes meeting over the middle
        if not lancet: return d
        ext = (d['max'][0] - d['min'][0]) / 2; d['c'] = [cx, yt - ext, 0]
        d['planes'] = [[.7071, .7071, 0, ext * .7071], [-.7071, .7071, 0, ext * .7071]]
        return d
    P.append(lanc(box(x0 - 2, bot - 2, -1, x1 + 2, top + 2, 1.2, trim), top + 2))
    gm = 'dark' if (dark or boarded) else ('lit' if night else 'glass')
    if wo.get('stained') and not boarded:
        P.append(lanc(box(x0, bot, -1, x1, top, 1.6, 'stained' if not night else 'lit', **({'pattern': ['mosaic', 4]} if not night else {})), top))
    else:
        P.append(lanc(box(x0, bot, -1, x1, top, 1.6, gm, **({'pattern': ['glint', 60]} if gm == 'glass' else {})), top))
    curt = wo.get('curtain', True) is not False and not boarded and not lancet
    if curt:
        cm = 'curt%d' % ((i + sp.get('seed', 1)) % 3)
        P += [box(x0, bot, 0, x0 + w * .22, top, 1.7, cm), box(x1 - w * .22, bot, 0, x1, top, 1.7, cm)]
    if w >= 20 and not boarded and not lancet:
        P += [box(cx - 1.2, bot, 0, cx + 1.2, top, 2.2, trim), box(x0, (top + bot) / 2 - 1.2, 0, x1, (top + bot) / 2 + 1.2, 2.2, trim)]
    P.append(box(x0 - 3, bot - Y(3.5), -1, x1 + 3, bot - Y(1.5), 3, trim))                                           # sill
    if boarded:   # planks nailed across
        for k, (a, b) in enumerate(((.15, .38), (.48, .7), (.78, .95))):
            P.append(box(x0 - 3, bot + (top - bot) * a, 1.6, x1 + 3, bot + (top - bot) * b, 3.4, 'wood', pattern=['planks', 9, 'x', 1]))
    if broken and not boarded:   # a hole in the glass
        P.append(ell(cx + w * .15, bot + (top - bot) * .6, 1.8, [w * .2, (top - bot) * .2, .6], 'dark', lumps=1.2, lumpfreq=1.4))
    if wo.get('face') and not boarded:   # a pale face pressed to the glass
        P += [ell(cx - w * .1, bot + (top - bot) * .55, 2.0, [w * .14, (top - bot) * .2, .8], 'skin'),
              box(cx - w * .1 - 2.4, bot + (top - bot) * .58, 2.6, cx - w * .1 - .8, bot + (top - bot) * .62, 3, 'dark'),
              box(cx - w * .1 + .8, bot + (top - bot) * .58, 2.6, cx - w * .1 + 2.4, bot + (top - bot) * .62, 3, 'dark')]
    if wo.get('watcher') and not boarded:   # a figure standing back from the glass
        P += [ell(cx + w * .12, bot + (top - bot) * .5, 2.0, [w * .12, (top - bot) * .16, .6], 'shadowman'),
              ell(cx + w * .12, bot + (top - bot) * .15, 2.0, [w * .26, (top - bot) * .2, .6], 'shadowman')]
    if sp.get('shutters') and not lancet:
        for s in (-1, 1):
            x = cx + s * (w / 2 + 5)
            P.append(box(x - 4, bot - 1, -1, x + 4, top + 1, 1.5, 'shutter', pattern=['planks', 3, 'y', 1]))
    if wo.get('box'):   # a window box, with flowers or with whatever died in it
        P.append(box(x0 - 2, bot - Y(9), 1, x1 + 2, bot - Y(4), 6, 'wood'))
        dead = wo['box'] == 'dead'
        for k in range(int(w // 4) + 1):
            P.append(ell(x0 + k * 4 + 1, bot - Y(3), 4, [2.2, 2.2 if not dead else 1.2, 2], 'deck' if dead else ('flower' if k % 2 else 'leaf')))


def door(P, dcx, dw, dh, kind, col, F, night, sp):
    x0, x1 = dcx - dw / 2, dcx + dw / 2; top = F + Y(dh)
    P.append(box(x0 - 3, F, -1, x1 + 3, top + 3, 1.5, 'trim'))
    if kind == 'double':
        P += [box(x0, F, -1, dcx - .6, top, 2.4, 'door', pattern=['planks', 4, 'x', 1]), box(dcx + .6, F, -1, x1, top, 2.4, 'door', pattern=['planks', 4, 'x', 1])]
    elif kind == 'barn':
        P.append(box(x0, F, -1, x1, top, 2.4, 'door', pattern=['planks', 5, 'x', 1]))
        P += [rod([x0 + 2, F + 2, 2.8], [x1 - 2, top - 2, 2.8], 1.4, 1.4, 'door'), rod([x0 + 2, top - 2, 2.8], [x1 - 2, F + 2, 2.8], 1.4, 1.4, 'door'),
              box(x0, top - 3, 2.2, x1, top, 3, 'trim'), box(x0, F, 2.2, x1, F + 3, 3, 'trim')]
    else:
        P.append(box(x0, F, -1, x1, top, 2.4, 'door', pattern=['planks', 4, 'x', 1]))
    if kind == 'glass':
        P.append(box(x0 + 3, F + Y(dh * .45), 2.2, x1 - 3, top - 3, 2.8, 'lit' if night else 'glass', pattern=['glint', 60]))
    elif kind != 'barn':
        P.append(box(x0 + 3, top - Y(12), 2.2, x1 - 3, top - Y(4), 2.8, 'lit' if night else 'glass'))
    P.append(box(x1 - 6 if kind != 'double' else dcx + 1.5, F + Y(dh * .45), 2.6, (x1 - 4) if kind != 'double' else dcx + 3, F + Y(dh * .45) + 2, 4, 'iron'))
    if sp.get('ribbon'):
        P += [box(dcx - 1.5, top - Y(20), 2.6, dcx + 1.5, top - Y(6), 3.4, 'dark'), ell(dcx, top - Y(6), 3.2, [4, 2, 1], 'dark')]
    if sp.get('scratches'):
        for k in range(4):
            P.append(rod([x0 + 4 + k * 3, F + Y(dh * .3), 2.7], [x0 + 6 + k * 3, F + Y(dh * .62), 2.7], .5, .5, 'blood'))


def porch(P, px0, px1, F, roof_top, rail, steps_x):
    P.append(box(px0 - 2, F, 0, px1 + 2, F + 3, 20, 'deck', pattern=['planks', 4, 'x']))
    P.append(box(px0 - 2, 0, 18, px1 + 2, F, 20, 'deck'))
    for x in sorted(set([px0, px1 - 2] + ([px0 + (px1 - px0) / 3, px0 + 2 * (px1 - px0) / 3] if px1 - px0 > 110 else []))):
        P.append(cyl(x + 1, F + 3, 17, 2.4, roof_top - F - 3, 'trim'))
    P.append(box(px0 - 5, roof_top, -2, px1 + 5, roof_top + 4, 23, 'roof', c=[(px0 + px1) / 2, roof_top + 2, 10], planes=[[0, .97, .25, 2.4]]))
    if rail:
        sx0, sx1 = steps_x
        for a, b in ((px0, sx0), (sx1, px1)):
            if b - a < 6: continue
            P.append(box(a, F + Y(16), 15.5, b, F + Y(18), 17.5, 'trim'))
            for x in range(int(a) + 4, int(b) - 2, 6): P.append(box(x, F + 3, 16, x + 1.4, F + Y(16), 17, 'trim'))


def steps(P, cx, hw, F, z0, kind):
    m = 'found' if kind == 'stone' else 'deck'
    if kind == 'ramp':
        P.append(box(cx - hw, 0, z0, cx + hw, F, z0 + 14, 'deck', c=[cx, F / 2, z0 + 7], planes=[[0, .8, .6, 0]], pattern=['planks', 4, 'x']))
        return
    n = 2; sh = F / n
    for k in range(n):
        P.append(box(cx - hw, 0, z0, cx + hw, F - k * sh, z0 + 5 + k * 5, m, pattern=['planks', 4, 'x'] if m == 'deck' else None))


def build(name, sp, night):
    P = []
    W = sp['w'] * 32; x0, x1 = -W / 2, W / 2; kind = sp.get('kind', 'gable')
    wallH = sp.get('wallh', 70); F = Y(9); Yw = Y(wallH)
    wm = sp.get('wall', 'honey'); rm = sp.get('roof', 'scallop')
    if kind in ('hip', 'side') and not sp.get('roofd'): sp['roofd'] = int(max(50, min(84, W * .32)))
    D = sp.get('roofd', 64) if kind in ('hip', 'side', 'cross') else (56 if kind == 'flat' else int(min(W * .55, 84)))
    if sp.get('wing'):   # a garage wing to one side, lower, with its own roof
        wg = sp['wing']; ww = wg['w'] * 32; wh = Y(wg.get('h', 58))
        if wg.get('side') == 'left': wx0, wx1 = x0, x0 + ww; x0 = wx1 + 1
        else: wx0, wx1 = x1 - ww, x1; x1 = wx0 - 1
        P += [box(wx0, F, -D + 8, wx1, F + wh, 0, 'wall', pattern=wall_pattern(wm)),
              ridge_x(wx0 - 6, wx1 + 6, -D, 8, F + wh, 26, 'roof', ['bricks', 4]),
              box(wx0 + 9, F, -1, wx1 - 9, F + wh - Y(8), 2, 'trim', pattern=['planks', 7, 'y', 1]),
              box(wx0 - 4, 0, -D + 6, wx1 + 4, F, 2, 'found', pattern=['bricks', 4])]
    pat = wall_pattern(wm)
    P += [box(x0 - 4, 0, -D - 2, x1 + 4, F, 2, 'found', pattern=['bricks', 4]),
          box(x0, F, -D, x1, F + Yw, 0, 'wall', **({'pattern': pat} if pat else {}))]
    wood = wm not in ('brick', 'stone', 'log')
    if wood: P += [box(x0 - 1, F, -D, x0 + 4, F + Yw, 1.4, 'trim'), box(x1 - 4, F, -D, x1 + 1, F + Yw, 1.4, 'trim')]
    P.append(box(x0 - 2, F + Yw - Y(4), -D - 1, x1 + 2, F + Yw + 1, 1.5, 'trim'))
    if wallH >= 110: P.append(box(x0 - 2, F + Y(wallH * .5 - 3), -D - 1, x1 + 2, F + Y(wallH * .5 + 3), 1.5, 'trim'))   # band between floors
    top = F + Yw; roof_pat = ['bricks', 4] if rm != 'tin' else ['planks', 6, 'x', 1]
    ridge_y = top
    if kind == 'hip':
        rise = Y(.75 * sp['roofd'] - 5); P.append(hip(x0 - 10, x1 + 10, -D - 10, 10, top, rise, 'roof', roof_pat)); ridge_y = top + rise
    elif kind == 'side':
        rise = Y(.75 * sp['roofd'] - 5)
        P.append(ridge_x(x0 - 10, x1 + 10, -D - 10, 10, top, rise, 'roof', roof_pat))
        P.append(ridge_x(x0, x1, -D, 0, top, rise - 2, 'wall', pat))                                       # the gable ends
        ridge_y = top + rise
    elif kind in ('gable', 'church', 'barn'):
        rise = Y(W * .3)
        P += gable_shell(x0 - 8, x1 + 8, -D - 6, 8, top - 2, rise + 6, 'roof', roof_pat)
        P.append(ridge_z(x0, x1, -D, 0, top, rise, 'wall', pat))                                           # the gable faces you
        ridge_y = top + rise
        gw = sp.get('gablewin')
        if gw in ('loft', 'round', 'vent'):
            gy = top + rise * .35
            if gw == 'loft': P += [box(-12, gy - Y(10), -1, 12, gy + Y(14), 1.2, 'trim'), box(-10, gy - Y(8), -1, 10, gy + Y(12), 2.4, 'door', pattern=['planks', 4, 'x', 1])]
            elif gw == 'round': P += [cyl(0, gy + 6, -1, 9, 2.2, 'trim', axis='z'), cyl(0, gy + 6, -1, 7, 2.8, 'lit' if night else 'glass', axis='z')]
            else: P += [box(-8, gy, -1, 8, gy + Y(8), 1.6, 'dark', pattern=['planks', 2, 'y', 1])]
    elif kind == 'cross':
        rise = Y(.75 * sp.get('roofd', 64) - 5)
        P.append(hip(x0 - 10, x1 + 10, -D - 10, 10, top, rise, 'roof', roof_pat) if sp.get('hip') else ridge_x(x0 - 10, x1 + 10, -D - 10, 10, top, rise, 'roof', roof_pat))
        gw = W * sp.get('gablew', .42); g0, g1 = -gw / 2, gw / 2; grise = Y(gw * .34) + 6
        P += [box(g0, F, -10, g1, top, 10, 'wall', **({'pattern': pat} if pat else {})),
              ridge_z(g0, g1, -10, 10, top, grise, 'wall', pat)] + gable_shell(g0 - 6, g1 + 6, -16, 16, top - 2, grise + 5, 'roof', roof_pat)
        gwin = sp.get('gablewin', 'round')
        if gwin == 'round': P += [cyl(0, top + grise * .35 + 6, 9, 8, 2.2, 'trim', axis='z'), cyl(0, top + grise * .35 + 6, 9, 6, 2.8, 'lit' if night else 'glass', axis='z')]
        ridge_y = top + max(rise, grise)
    elif kind == 'flat':
        P += [box(x0, top, -D, x1, top + Y(8), 0, 'tar'),
              box(x0 - 2, top, -4, x1 + 2, top + Y(16), 0, 'wall', **({'pattern': pat} if pat else {})),       # front parapet
              box(x0 - 2, top, -D, x0 + 2, top + Y(12), 0, 'wall'), box(x1 - 2, top, -D, x1 + 2, top + Y(12), 0, 'wall'),
              box(x0 - 2, top, -D, x1 + 2, top + Y(12), -D + 4, 'wall'),
              box(x0 - 5, top + Y(16), -5, x1 + 5, top + Y(20), 1.5, 'trim')]
        ridge_y = top + Y(20)
    if kind == 'church':   # a bell tower at the front with a spire, the door at its foot
        tw = W * .22; t0, t1 = -tw / 2, tw / 2; th = ridge_y + Y(16)
        P += [box(t0, F, -6, t1, th, 12, 'wall', **({'pattern': pat} if pat else {})),
              hip(t0 - 4, t1 + 4, -10, 16, th, Y(sp.get('spire', 70)), 'roof', roof_pat),
              box(t0 - 2, th - Y(4), -7, t1 + 2, th, 13.5, 'trim'),
              box(-6, th - Y(26), 11, 6, th - Y(10), 13, 'dark'),                                             # the belfry
              box(-1, th + Y(sp.get('spire', 70)) - 2, 2, 1, th + Y(sp.get('spire', 70)) + Y(14), 4, 'iron'), box(-5, th + Y(sp.get('spire', 70)) + Y(6), 2, 5, th + Y(sp.get('spire', 70)) + Y(8), 4, 'iron')]
        ridge_y = th + Y(sp.get('spire', 70))
        tmp = []; door(tmp, 0, 24, 46, 'double', 'oak', F, night, sp)          # the church door, at the foot of the tower
        for q in tmp:
            for kk in ('min', 'max', 'c', 'a', 'b'):
                if kk in q: q[kk] = [q[kk][0], q[kk][1], q[kk][2] + 12]
        P += tmp + [cyl(0, th - Y(40), 12, 6, 1.6, 'trim', axis='z'), cyl(0, th - Y(40), 12.5, 4.6, 1.6, 'lit' if night else 'glass', axis='z')]   # a clock face
    # dormers on hip / side roofs
    for k, d in enumerate(sp.get('dormers') or []):
        if kind not in ('hip', 'side'): continue
        dcx = x0 + d['x'] * (x1 - x0); dw = d.get('w', 24); dh = Y(d.get('h', 22))
        zf = -10; y0 = top + Y(10)
        P += [box(dcx - dw / 2, y0 - 6, zf - 18, dcx + dw / 2, y0 + dh, zf, 'wall', **({'pattern': pat} if pat else {})),
              ridge_z(dcx - dw / 2, dcx + dw / 2, zf - 18, zf, y0 + dh, (dw / 2) * .85, 'wall', pat)] + gable_shell(dcx - dw / 2 - 3, dcx + dw / 2 + 3, zf - 20, zf + 2, y0 + dh - 1, (dw / 2 + 3) * .85 + 1, 'roof', t=3)
        P += [box(dcx - dw / 2 + 3, y0 + 2, zf - 1, dcx + dw / 2 - 3, y0 + dh - 3, zf + 1.4, 'lit' if night else 'glass'),
              box(dcx - dw / 2 + 1, y0, zf - 1, dcx + dw / 2 - 1, y0 + 2, zf + 2, 'trim')]
    # chimneys
    chim = None
    for k, ch in enumerate(sp.get('chimneys') or []):
        cx = x0 + ch['x'] * W; cx = max(x0 + 12, min(x1 - 12, cx)); m = 'brick' if ch.get('mat') == 'brick' else 'found'
        ztop = -D / 2 + 6; yt = ridge_y + Y(16) + (ch.get('dy', 0))
        P += [box(cx - 7, top - 4, ztop - 8, cx + 7, yt, ztop + 8, m, pattern=['bricks', 3]), box(cx - 9, yt - 3, ztop - 10, cx + 9, yt + 1, ztop + 10, 'found')]
        if chim is None: chim = [round(cx), round(-(yt * CY - ztop * .5))]
    # awning over the shop windows
    if sp.get('awning'):
        ay = top - Y(10)
        for k, x in enumerate(range(int(x0 + 6), int(x1 - 6), 7)):
            P.append(box(x, ay - Y(10), 0, min(x + 7, x1 - 6), ay, 16, 'awnA' if k % 2 else 'awnB', c=[x + 3.5, ay - Y(5), 8], planes=[[0, .8, .6, 3.5]]))
    proud = (W * sp.get('gablew', .42) / 2, 10) if kind == 'cross' else None
    def bring_forward(start):
        if not proud: return
        for q in P[start:]:
            xs = [q[k][0] for k in ('min', 'max', 'c', 'a') if k in q]
            if xs and all(abs(x) < proud[0] - 1 for x in xs):
                for k in ('min', 'max', 'c', 'a', 'b'):
                    if k in q: q[k] = [q[k][0], q[k][1], q[k][2] + proud[1]]
    mark = len(P)
    # windows
    for i, wo in enumerate(sp.get('windows') or []):
        ww, wh = wo.get('w', 24), wo.get('h', 26); cx = x0 + wo['x'] * 32
        ytop = wo['y'] if 'y' in wo else (18 + (10 if sp.get('awning') else 0))
        window(P, cx, ytop, ww, wh, wo, sp, night, i, F, Yw)
    # door, porch, steps, lantern
    meta = {}
    if not sp.get('nodoor'):
        d = sp.get('door') or {}; dw = d.get('w', 26); dh = d.get('h', 46); dcx = (x0 + x1) / 2 + d.get('dx', 0) * 32
        wide = d.get('kind') == 'barn' or dw >= 50
        home = (not wide) and not sp.get('sign') and sp.get('stoop', True) is not False and kind in ('gable', 'cross', 'hip', 'side') and wallH >= 60
        pr = sp.get('porch') or ({'rail': True} if home else None)
        door(P, dcx, dw, dh, d.get('kind'), d.get('col', 'teal'), F, night, sp)
        stone = wm in ('brick', 'stone')
        st = 'ramp' if wide else ('stone' if (stone and not pr) else 'wood')
        if pr:
            px0, px1 = (x0 + 4, x1 - 4) if pr.get('full') else (dcx - dw / 2 - 16, dcx + dw / 2 + 16)
            porch(P, px0, px1, F, F + Y(dh + 14), pr.get('rail'), (dcx - dw / 2 - 2, dcx + dw / 2 + 2))
            steps(P, dcx, dw / 2 + 4, F, 20, 'wood')
        else:
            steps(P, dcx, dw / 2 + 4, F, 2, st)
        if sp.get('lantern', True) is not False:
            lx = dcx + dw / 2 + 12
            P += [box(lx - 2, F + Y(dh - 8), 0, lx + 2, F + Y(dh - 6), 4, 'iron'), box(lx - 3, F + Y(dh - 18), 2, lx + 3, F + Y(dh - 8), 6, 'lit' if night else 'glass'),
                  box(lx - 3.5, F + Y(dh - 8), 1.5, lx + 3.5, F + Y(dh - 6.5), 6.5, 'iron')]
        meta = {'door_w': float(dw), 'door_dx': float(round(d.get('dx', 0) * 32) - 1), 'steps': st}
    bring_forward(mark)
    if sp.get('sign'):
        text = sp['sign']; sw = len(text) * 4 + 9
        sy = top - Y((-2 if sp.get('awning') else 6) + sp.get('signy', 0)) - Y(11)
        sz0 = proud[1] if proud else 0
        P.append(box(-sw / 2, sy, sz0, sw / 2, sy + Y(11), sz0 + 3, 'signb'))
        meta['_sign'] = (text, sy + Y(11) - 2, sz0 + 3)
    if sp.get('ivy'):   # ivy climbing one corner
        ix = x0 + 8 if sp['ivy'] == 'left' else x1 - 8
        for k in range(5):
            P.append(ell(ix + (k % 2) * (4 if sp['ivy'] == 'left' else -4), F + k * Yw * .17 + 6, 1.5, [9 - k, 9, 2.4], 'leaf', lumps=1.2, lumpfreq=.9))
    meta['chim'] = chim
    return P, meta


MATS = {'wall': None, 'roof': None, 'trim': None, 'door': None, 'shutter': None}


def render(name, sp, night):
    P, meta = build(name, json.loads(json.dumps(sp)), night)
    ramps = dict(MISC)
    ramps.update({'wall': WALLS[sp.get('wall', 'honey')], 'roof': ROOFS[sp.get('roof', 'scallop')], 'trim': TRIMS[sp.get('trim', 'cream')],
                  'door': DOORS[(sp.get('door') or {}).get('col', 'teal')], 'shutter': TRIMS.get(sp.get('shutters') or 'green', TRIMS['green']),
                  'curt0': CURT['t4'], 'curt1': CURT['f2'], 'curt2': CURT['v4'], 'brick': WALLS['brick']})
    used = []
    for p in P:
        if p['mat'] not in used: used.append(p['mat'])
    mats, pal, k = {}, {}, 0
    for m in used:
        ramp = ramps[m]; ch = POOL[k:k + len(ramp)]; k += len(ramp)
        mats[m] = {'chars': ch, 'ambient': .26, 'shade': .5, 'bevel': m in ('trim', 'found', 'deck', 'roof', 'signb')}
        if m == 'lit': mats[m].update(emit=2, glow=True)
        if m in ('dark', 'shadowman'): mats[m]['ambient'] = 0
        pal.update(dict(zip(ch, ramp)))
    pal['s'] = SHADOW
    W = int(sp['w'] * 32) + 80; Hh = int(Y(sp.get('wallh', 70)) + Y(sp['w'] * 32 * .45) + 160 + (Y(sp.get('spire', 70)) + 60 if sp.get('kind') == 'church' else 0))
    ox, oy = W // 2, Hh - 30
    scene = {'size': [W, Hh], 'origin': [ox, oy], 'elev': 30, 'materials': mats, 'palette': pal, 'shapes': P, 'gamma': 1.1,
             'shadow_light': [-.13, 1, -.12], 'light': [-.4, 1.0, .5]}
    fn = name + ('_n' if night else ''); spath = os.path.join(GEN, fn); json.dump(scene, open(spath + '.json', 'w'))
    fin = {'name': fn, 'anchor': [ox, oy], 'leaf': '', 'bark': '', 'palette': pal, 'outline': OUTLINE, 'min_cluster': 3,
           'tips': False, 'tufts': False, 'deep_edge': False}
    json.dump(fin, open(spath + '_finish.json', 'w'))
    subprocess.run([sys.executable, os.path.join(HERE, 'blockout.py'), spath + '.json', spath], check=True, capture_output=True)
    subprocess.run([sys.executable, os.path.join(HERE, 'finish.py'), spath + '.grid.txt', spath + '.pxg', spath + '_finish.json'], check=True, capture_output=True)
    subprocess.run([sys.executable, os.path.join(HERE, 'grid.py'), 'build', spath + '.pxg', OUT], check=True, capture_output=True)
    from PIL import Image, ImageDraw
    p = os.path.join(OUT, fn + '.png'); im = Image.open(p).convert('RGBA')
    if meta.get('_sign'):   # the lettering, in the 2D builder's own pixel font
        text, sy, sz = meta['_sign']; FONT = sign_font(); x = ox - (len(text) * 4 - 1) // 2; y = round(oy - (sy * CY - sz * .5)) + 1
        px = im.load(); hi = tuple(int(TRIMS['cream'][4][i:i + 2], 16) for i in (1, 3, 5)) + (255,); sh = tuple(int(MISC['signb'][0][i:i + 2], 16) for i in (1, 3, 5)) + (255,)
        for chx in text.upper():
            g = FONT.get(chx, FONT[' '])
            for r in range(5):
                for c in range(3):
                    if g[r][c] == '1':
                        if 0 <= x + c + 1 < im.width and 0 <= y + r + 1 < im.height: px[x + c + 1, y + r + 1] = sh
            for r in range(5):
                for c in range(3):
                    if g[r][c] == '1' and 0 <= x + c < im.width and 0 <= y + r < im.height: px[x + c, y + r] = hi
            x += 4
    bb = im.getbbox(); im = im.crop((bb[0] - 1, bb[1] - 1, bb[2] + 1, bb[3] + 1)); im.save(p)
    ax, ay = ox - bb[0] + 1, oy - bb[1] + 1
    return p, ax, ay, im.size, {k: v for k, v in meta.items() if not k.startswith('_')}


def sign_font():
    src = open(os.path.join(HERE, '..', 'ase', 'bkit.lua')).read(); a = src.index('B.FONT = {'); b = src.index('\n\n', a)
    F = {}
    for m in re.finditer(r"(?:\[\s*(['\"])(.)\1\s*\]|\b([A-Z]))\s*=\s*\{([^}]*)\}", src[a:b]):
        F[m.group(2) or m.group(3)] = re.findall(r"'([01]{3})'", m.group(4))
    return F


def install_meta(name, meta, root):
    mp = os.path.join(root, 'spr', 'lpc', 'objects.json'); M = json.load(open(mp))
    if name in M:
        for k, v in meta.items(): M[name][k] = v
        M[name]['px'] = 'blockout'
    json.dump(M, open(mp, 'w'), indent=0)


def install_from_sidecar(fn):
    j = json.load(open(os.path.join(OUT, fn + '.meta.json')))
    install(fn, os.path.join(OUT, fn + '.png'), j['ax'], j['ay'], tuple(j['size']))
    for root in ['/'.join(HERE.split('/')[:-2])] + [r for r in os.environ.get('HA_BUILD', '').split(':') if r]:
        install_meta(fn, j['meta'], root)


if __name__ == '__main__':
    specs = json.load(open(sys.argv[1])); args = [a for a in sys.argv[2:] if not a.startswith('--')]
    if '--install-only' in sys.argv:   # install what parallel render runs left behind (one writer for objects.json)
        for name in sorted(specs):
            if args and name not in args: continue
            for fn in (name, name + '_n'):
                if os.path.exists(os.path.join(OUT, fn + '.meta.json')): install_from_sidecar(fn); print('installed', fn)
        sys.exit(0)
    for name in sorted(specs):
        if args and name not in args: continue
        for night in (False, True):
            p, ax, ay, size, meta = render(name, specs[name], night); fn = name + ('_n' if night else '')
            json.dump({'ax': ax, 'ay': ay, 'size': list(size), 'meta': meta}, open(os.path.join(OUT, fn + '.meta.json'), 'w'))
            print(fn, size, 'anchor', ax, ay, meta, flush=True)
            if '--install' in sys.argv:
                install(fn, p, ax, ay, size)
                for root in ['/'.join(HERE.split('/')[:-2])] + [r for r in os.environ.get('HA_BUILD', '').split(':') if r]:
                    install_meta(fn, meta, root)
