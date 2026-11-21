"""Snow-laden subalpine spruces for the ending drive, our own work (Blender, run in the background).

References (study only, never shipped; _references/environment/, sources in SOURCES.txt): snowy spruce and fir stands
and Engelmann spruce on a Colorado mountainside. What they show, and what this builds:
  - narrow spire crowns (width about a quarter of the height), ragged rather than perfect cones;
  - branches in whorls: rising near the top, level in the middle, drooping lower down, more so under snow, the tips
    turning up a little;
  - every branch carries its own pad of snow along its top (lumpy, sometimes broken), with dark gaps between the tiers;
  - the leader is thin with little blobs of snow; grey trunks show beneath the crowns.

Two parts:
  1. A spruce spray (a shoot with side shoots and thousands of four-sided needles) is modelled in full and rendered
     from above into card textures: colour + alpha for the bare underside, colour + alpha for the snow-dusted top, and
     a normal map for each (how foliage cards are made from a detailed model).
  2. Trees are built from those cards: a tapered trunk, whorls of branches (wood tubes), cards along each branch (the
     top and the underside as separate one-sided faces, so each gets its own texture and a normal bent out of the
     crown for volume), and a lumpy snow pad along each branch.

Run:  blender -b --factory-startup --python spruce.py -- <HollowAcre/Saved/Generated> <HollowAcre/SourceArt> [preview dir]
Writes Spruce_<n>.obj (Unreal frame in cm, Y mirrored like the other generators; material slots bark, needles_top,
needles_under, snow), spruce.json (the variants' heights) and T_Spray{C,N,SnowC,SnowN}.png.
"""
import json
import math
import os
import random
import sys

import bpy
import numpy as np

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
GEN = os.path.abspath(ARGS[0] if ARGS else '.')
ART = os.path.abspath(ARGS[1] if len(ARGS) > 1 else '.')
PREVIEW = os.path.abspath(ARGS[2]) if len(ARGS) > 2 and not ARGS[2].startswith('--') else None

SPRAY_L, SPRAY_W = 60.0, 30.0            # cm the card texture covers (2:1)
TEX = (2048, 1024)
VARIANTS = [(450, 3), (800, 11), (1150, 23), (1500, 37), (1800, 41), (2150, 53), (2500, 67)]   # height (cm), seed
Z = np.array([0.0, 0.0, 1.0])


def nrm(v):
    v = np.asarray(v, float)
    n = np.linalg.norm(v, axis=-1, keepdims=True)
    return v / np.maximum(n, 1e-9)


def lerp(a, b, t):
    return a + (b - a) * t


# =====================================================================================================================
# 1. the spray, modelled and rendered into card textures
# =====================================================================================================================
def spray_shoots(r):
    """Shoots (p0, p1, order): a main axis, alternate side shoots at 48-62 degrees in a flat fan whose outline swells
    to a third of the way along and narrows to the tip, and short third-order shoots on the longer side shoots."""
    shoots = []
    main = 57.0
    p0 = np.array([0.5, 0.0, 0.0])
    shoots.append((p0, p0 + np.array([main, 0, 0]), 0))
    x, side = 2.0, 1
    while x < main - 2.0:
        u = x / main
        L = 26.5 * u ** 0.3 * (1 - u) ** 0.6 * r.uniform(0.82, 1.06)
        a = math.radians(r.uniform(50, 60))
        d = nrm([math.cos(a), side * math.sin(a), r.uniform(-0.04, 0.08)])
        b = p0 + np.array([x, 0, 0])
        shoots.append((b, b + d * L, 1))
        if L > 6:
            perp = nrm([-d[1], d[0], 0.0])
            y, s2 = 2.2, 1
            while y < L - 1.5:
                l2 = min(7.0, (L - y) * 0.55 * r.uniform(0.75, 1.1))
                a2 = math.radians(r.uniform(42, 56))
                d2 = nrm(d * math.cos(a2) + perp * s2 * math.sin(a2) + np.array([0, 0, r.uniform(-0.03, 0.06)]))
                bb = b + d * y
                shoots.append((bb, bb + d2 * l2, 2))
                y += r.uniform(2.1, 3.0)
                s2 = -s2
        x += r.uniform(2.3, 3.3)
        side = -side
    return shoots


def spray_meshes(r):
    """Needles (4-sided, pointing forward and sweeping up from below, as on a spruce shoot), twigs, and snow lumps on
    top of the shoots. Returns {name: (verts, faces, per-face colour)}."""
    shoots = spray_shoots(r)
    nv, nf, nc = [], [], []
    tv, tf = [], []
    for p0, p1, order in shoots:
        ax = p1 - p0
        Ls = float(np.linalg.norm(ax))
        ax = ax / Ls
        up = nrm(Z - ax * ax[2])
        side = np.cross(ax, up)
        n = int(Ls * 11.0)
        for i in range(n):
            t = (i + r.random()) / n
            base = p0 + ax * Ls * t
            phi = i * 2.39996 + r.uniform(-0.3, 0.3)
            rad = nrm(up * math.cos(phi) + side * math.sin(phi) + up * 0.55)
            a = math.radians(r.uniform(45, 70))
            d = nrm(ax * math.cos(a) + rad * math.sin(a))
            ln = r.uniform(1.5, 2.3) * (0.7 + 0.3 * min(1.0, (1 - t) * 4)) * (1.0 if order < 2 else 0.85)
            e1 = nrm(np.cross(d, up if abs(np.dot(d, up)) < 0.95 else side))
            e2 = np.cross(e1, d)
            w = 0.036
            k = len(nv)
            # two segments: the needle curves a little upward toward its tip
            mid = base + d * ln * 0.5 + up * ln * 0.05
            tip = base + d * ln + up * ln * 0.16
            nv += [base + e1 * w, base + e2 * w, base - e1 * w, base - e2 * w,
                   mid + e1 * w * 0.8, mid + e2 * w * 0.8, mid - e1 * w * 0.8, mid - e2 * w * 0.8, tip]
            for q in range(4):
                a0, a1 = k + q, k + (q + 1) % 4
                nf += [(a0, a1, a1 + 4), (a0, a1 + 4, a0 + 4), (a0 + 4, a1 + 4, k + 8)]
            # older needles toward the base of the spray are darker; each needle a little different
            shade = r.uniform(0.8, 1.22) * (0.8 + 0.2 * (p0[0] + Ls * t) / 60.0)
            c = (0.034 * shade, 0.058 * shade, 0.042 * shade * r.uniform(0.9, 1.15))
            nc += [c] * 12
        # the twig: a thin 5-sided tube
        rad0 = (0.22, 0.13, 0.08)[order]
        k = len(tv)
        for j in range(2):
            c = p0 if j == 0 else p1
            rr = rad0 if j == 0 else rad0 * 0.5
            for s in range(5):
                q = 2 * math.pi * s / 5
                tv.append(c + (up * math.cos(q) + side * math.sin(q)) * rr)
        for s in range(5):
            a0, a1 = k + s, k + (s + 1) % 5
            tf += [(a0, a1, a1 + 5), (a0, a1 + 5, a0 + 5)]
    # snow lumps along the top of the main axis and the inner part of the side shoots
    sv, sf = [], []

    def lump(c, along, rb):
        """Settled snow: flattened and drawn out along the shoot, smoothly uneven (no facets), low enough that the
        needle tips round its edge poke through."""
        k = len(sv)
        sideways = nrm(np.cross(Z, along))
        rings, segs = 7, 12
        ph0, ph1, ph2 = r.uniform(0, 6.3), r.uniform(0, 6.3), r.uniform(0, 6.3)
        stretch = r.uniform(1.3, 2.0)
        for i in range(rings + 1):
            th = math.pi * i / rings
            for j in range(segs):
                ph = 2 * math.pi * j / segs
                wob = 1 + 0.16 * math.sin(3 * ph + ph0) * math.sin(2 * th + ph1) + 0.08 * math.sin(5 * ph + 2 * th + ph2)
                p = (along * math.cos(th) * rb * stretch + (sideways * math.cos(ph) + Z * math.sin(ph) * 0.42) * math.sin(th) * rb) * wob
                sv.append(c + p)
        for i in range(rings):
            for j in range(segs):
                a, b = k + i * segs + j, k + i * segs + (j + 1) % segs
                sf.extend([(a, b, b + segs), (a, b + segs, a + segs)])

    for p0, p1, order in shoots:
        if order == 2:
            continue
        ax = p1 - p0
        Ls = float(np.linalg.norm(ax))
        ax = ax / Ls
        t0, t1, step = (0.04, 0.84, 1.8) if order == 0 else (0.1, 0.62, 2.2)
        t = t0 + r.uniform(0, 0.03)
        while t < t1:
            if order == 0 or r.random() < 0.7:
                rb = r.uniform(1.3, 2.4) if order == 0 else r.uniform(0.9, 1.7)
                rb *= 0.6 + 0.4 * (1 - t)
                sv_c = p0 + ax * Ls * t + np.array([r.uniform(-0.5, 0.5), r.uniform(-0.5, 0.5), 0.35 + rb * 0.12])
                lump(sv_c, ax, rb)
            t += step / Ls * r.uniform(0.8, 1.25)
    return {'needles': (nv, nf, nc), 'twigs': (tv, tf, None), 'snow': (sv, sf, None)}


def emission_mat(name, kind, color=(1, 1, 1), ao_floor=0.35):
    """A flat-colour material for baking: albedo x ambient occlusion, or the surface normal for the normal map."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    em = nt.nodes.new('ShaderNodeEmission')
    nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
    if kind == 'normal':
        geo = nt.nodes.new('ShaderNodeNewGeometry')
        vm = nt.nodes.new('ShaderNodeVectorMath')
        vm.operation = 'MULTIPLY_ADD'
        vm.inputs[1].default_value = (0.5, -0.5, 0.5)      # green flipped: Unreal's normal maps (V runs down the image)
        vm.inputs[2].default_value = (0.5, 0.5, 0.5)
        nt.links.new(geo.outputs['Normal'], vm.inputs[0])
        nt.links.new(vm.outputs['Vector'], em.inputs['Color'])
        return m
    ao = nt.nodes.new('ShaderNodeAmbientOcclusion')
    ao.inputs['Distance'].default_value = 1.2
    ao.samples = 16
    mr = nt.nodes.new('ShaderNodeMapRange')
    mr.inputs['To Min'].default_value = ao_floor
    nt.links.new(ao.outputs['AO'], mr.inputs['Value'])
    mul = nt.nodes.new('ShaderNodeMix')
    mul.data_type = 'RGBA'
    mul.blend_type = 'MULTIPLY'
    mul.inputs['Factor'].default_value = 1.0
    if kind == 'attr':
        at = nt.nodes.new('ShaderNodeAttribute')
        at.attribute_name = 'col'
        nt.links.new(at.outputs['Color'], mul.inputs['A'])
    else:
        mul.inputs['A'].default_value = (*color, 1.0)
    nt.links.new(mr.outputs['Result'], mul.inputs['B'])
    nt.links.new(mul.outputs['Result'], em.inputs['Color'])
    return m


def make_obj(name, verts, faces, smooth=False, colors=None):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], [tuple(f) for f in faces])
    if smooth:
        me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    if colors is not None:
        attr = me.color_attributes.new('col', 'FLOAT_COLOR', 'CORNER')
        flat = []
        for poly in me.polygons:
            c = colors[poly.index]
            flat += [c[0], c[1], c[2], 1.0] * poly.loop_total
        attr.data.foreach_set('color', flat)
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def box_blur(a, rad):
    """Separable box blur by cumulative sums (edges clamped)."""
    for axis in (0, 1):
        pad = [(0, 0)] * a.ndim
        pad[axis] = (rad + 1, rad)
        c = np.cumsum(np.pad(a, pad, mode='edge'), axis=axis)
        hi = np.take(c, np.arange(2 * rad + 1, c.shape[axis]), axis=axis)
        lo = np.take(c, np.arange(0, c.shape[axis] - 2 * rad - 1), axis=axis)
        a = (hi - lo) / (2 * rad + 1)
    return a


def dilate_png(path, flat=None):
    """Fill the transparent part of a card texture with the nearby colour (or a flat normal), so mipmaps don't bleed
    black into the edges of the needles."""
    img = bpy.data.images.load(path)
    w, h = img.size
    px = np.empty(w * h * 4, np.float32)
    img.pixels.foreach_get(px)
    px = px.reshape(h, w, 4)
    rgb, a = px[..., :3].copy(), px[..., 3]
    solid = a > 0.02
    if flat is not None:
        rgb[~solid] = flat
    else:
        out = rgb.copy()
        filled = solid.copy()
        for rad in (3, 12, 48, 160):
            num = box_blur(rgb * a[..., None], rad)
            den = box_blur(a, rad)
            m = (~filled) & (den > 1e-4)
            out[m] = (num / np.maximum(den, 1e-6)[..., None])[m]
            filled |= m
        out[~filled] = rgb[solid].mean(0)
        rgb = out
    px[..., :3] = rgb
    img.pixels.foreach_set(px.ravel())
    img.filepath_raw = path
    img.file_format = 'PNG'
    img.save()
    bpy.data.images.remove(img)


def render_spray():
    r = random.Random(4)
    parts = spray_meshes(r)
    scene = bpy.context.scene
    obs = {}
    for name, (v, f, c) in parts.items():
        obs[name] = make_obj('spray_' + name, v, f, smooth=(name != 'needles'), colors=c)
    print('spray: %d needles, %d snow lumps' % (len(parts['needles'][1]) // 12, len(parts['snow'][1]) // 168))
    m_needle = emission_mat('bake_needles', 'attr', ao_floor=0.3)
    m_twig = emission_mat('bake_twig', 'flat', (0.16, 0.085, 0.045), 0.3)
    m_snow = emission_mat('bake_snow', 'flat', (0.86, 0.88, 0.92), 0.62)
    m_norm = emission_mat('bake_normal', 'normal')

    cam = bpy.data.cameras.new('cam')
    cam.type = 'ORTHO'
    cam.ortho_scale = SPRAY_L
    co = bpy.data.objects.new('cam', cam)
    co.location = (SPRAY_L / 2, 0.0, 50.0)
    scene.collection.objects.link(co)
    scene.camera = co
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 24
    scene.cycles.use_denoising = False
    scene.cycles.max_bounces = 0
    scene.render.film_transparent = True
    scene.render.resolution_x, scene.render.resolution_y = TEX
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.color_depth = '8'
    scene.world = bpy.data.worlds.new('w')

    def shoot(path, snow, normals):
        obs['snow'].hide_render = not snow
        for name, ob in obs.items():
            ob.data.materials.clear()
            ob.data.materials.append(m_norm if normals else {'needles': m_needle, 'twigs': m_twig, 'snow': m_snow}[name])
        scene.view_settings.view_transform = 'Raw' if normals else 'Standard'
        scene.view_settings.look = 'None'
        scene.render.filepath = path
        bpy.ops.render.render(write_still=True)
        dilate_png(path, flat=(0.5, 0.5, 1.0) if normals else None)
        print('wrote', path)

    shoot(os.path.join(ART, 'T_SprayC.png'), False, False)
    shoot(os.path.join(ART, 'T_SpraySnowC.png'), True, False)
    shoot(os.path.join(ART, 'T_SprayN.png'), False, True)
    shoot(os.path.join(ART, 'T_SpraySnowN.png'), True, True)
    for ob in list(obs.values()) + [co]:
        bpy.data.objects.remove(ob)


# =====================================================================================================================
# 2. the trees
# =====================================================================================================================
class Acc:
    """Geometry by material: positions, normals, UVs, triangles (Unreal frame, cm; a triangle's naive cross product
    points out of the surface)."""

    def __init__(self):
        self.g = {}

    def add(self, mat, P, N, UV, T):
        g = self.g.setdefault(mat, [[], [], [], [], 0])
        g[0].append(np.asarray(P, float).reshape(-1, 3))
        g[1].append(np.asarray(N, float).reshape(-1, 3))
        g[2].append(np.asarray(UV, float).reshape(-1, 2))
        g[3].append(np.asarray(T, np.int64).reshape(-1, 3) + g[4])
        g[4] += len(g[0][-1])

    def arrays(self, mat):
        g = self.g[mat]
        return np.concatenate(g[0]), np.concatenate(g[1]), np.concatenate(g[2]), np.concatenate(g[3])

    def tris(self):
        return sum(sum(len(t) for t in g[3]) for g in self.g.values())

    def write(self, path):
        with open(path, 'w', newline='\n') as fh:
            fh.write('# generated by hollow-acre/unreal/tools/blender/spruce.py\n')
            vo = 0
            for mat in self.g:
                P, N, UV, T = self.arrays(mat)
                fh.write('usemtl %s\n' % mat)
                fh.write(''.join('v %.2f %.2f %.2f\n' % (x, -y, z) for x, y, z in P))
                fh.write(''.join('vn %.4f %.4f %.4f\n' % (x, -y, z) for x, y, z in N))
                fh.write(''.join('vt %.4f %.4f\n' % (u, v) for u, v in UV))
                T = T + vo + 1
                # Unreal mirrors Y on import, so reverse the winding to keep faces pointing out
                fh.write(''.join('f %d/%d/%d %d/%d/%d %d/%d/%d\n' % (c, c, c, b, b, b, a, a, a) for a, b, c in T))
                vo += len(P)


def grid_tris(rows, cols, wrap=False):
    t = []
    cc = cols if wrap else cols - 1
    for i in range(rows - 1):
        for j in range(cc):
            a, b = i * cols + j, i * cols + (j + 1) % cols
            c, d = a + cols, b + cols
            t += [(a, c, b), (b, c, d)]
    return np.array(t, np.int64)


def orient(P, T, ref):
    """Flip triangles whose naive cross product points against ref (a vector, or one per vertex)."""
    a, b, c = P[T[:, 0]], P[T[:, 1]], P[T[:, 2]]
    fn = np.cross(b - a, c - a)
    rv = ref if np.ndim(ref) == 1 else (ref[T[:, 0]] + ref[T[:, 1]] + ref[T[:, 2]])
    flip = np.einsum('ij,ij->i', fn, np.broadcast_to(rv, fn.shape)) < 0
    T = T.copy()
    T[flip] = T[flip][:, ::-1]
    return T


def frames(pts):
    """Tangent, horizontal side and up vectors along a polyline."""
    tan = nrm(np.gradient(pts, axis=0))
    side = np.cross(tan, Z)
    bad = np.linalg.norm(side, axis=1) < 1e-3
    side[bad] = [1.0, 0.0, 0.0]
    side = nrm(side)
    up = nrm(np.cross(side, tan))
    return tan, side, up


def tube(pts, radii, sides, v_per_cm=0.01):
    tan, side, up = frames(pts)
    ang = np.linspace(0, 2 * np.pi, sides, endpoint=False)
    ring = np.cos(ang)[None, :, None] * side[:, None, :] + np.sin(ang)[None, :, None] * up[:, None, :]
    P = pts[:, None, :] + ring * radii[:, None, None]
    s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(pts, axis=0), axis=1))])
    UV = np.stack(np.broadcast_arrays(np.arange(sides)[None, :] / sides, s[:, None] * v_per_cm), -1)
    P, N, UV = P.reshape(-1, 3), ring.reshape(-1, 3), UV.reshape(-1, 2)
    T = orient(P, grid_tris(len(pts), sides, wrap=True), N)
    return P, N, UV, T


def card(acc, base, f, Lc, wc, roll, sag, axis_xy):
    """One spray card: the top face (snow-dusted texture) and the underside (bare needles), each one-sided with a
    normal bent out of the crown so the tree shades as a volume, not as flat planes."""
    f = nrm(f)
    s = np.cross(f, Z)
    s = nrm(s) if np.linalg.norm(s) > 1e-3 else np.array([0.0, 1.0, 0.0])
    n = np.cross(s, f)
    if n[2] < 0:
        s, n = -s, -n
    cr, sr = math.cos(roll), math.sin(roll)
    s, n = s * cr + n * sr, n * cr - s * sr
    U, V = np.meshgrid(np.linspace(0, 1, 4), np.linspace(0, 1, 3), indexing='ij')
    y = (V - 0.5) * wc
    zoff = -sag * (((2 * (V - 0.5)) ** 2) * wc * 0.22 + U ** 2 * Lc * 0.1)
    P = (base + f * (U * Lc)[..., None] + s * y[..., None] + n * zoff[..., None]).reshape(-1, 3)
    UV = np.stack([U, V], -1).reshape(-1, 2)
    T = grid_tris(4, 3)
    rad = P - np.array([axis_xy[0], axis_xy[1], 0.0])
    rad[:, 2] = 0
    rad = nrm(rad)
    top = nrm(0.5 * n + 0.5 * nrm(rad + 0.6 * Z))
    bot = nrm(-0.5 * n + 0.5 * nrm(rad - 0.25 * Z))
    # snow only settles on sprays that lie fairly flat; steep and hanging ones show bare needles on both faces
    acc.add('needles_top' if n[2] > 0.5 else 'needles_under', P, top, UV, orient(P, T, n))
    acc.add('needles_under', P, bot, UV, orient(P, T, -n))


def waves(r, n, lam):
    """A smooth 3-D noise of n plane waves (wavelengths lam, cm): returns f(P) -> values in about -1..1."""
    W, Ph = [], []
    for i in range(n):
        d = nrm(np.array([r.gauss(0, 1), r.gauss(0, 1), r.gauss(0, 1)]))
        W.append(d * 2 * np.pi / lam[i % len(lam)])
        Ph.append(r.uniform(0, 2 * np.pi))
    W, Ph = np.array(W), np.array(Ph)
    norm = math.sqrt(n / 2.0)
    return lambda P: np.sin(np.asarray(P) @ W.T + Ph).sum(-1) / norm


def pad(acc, r, cen, hw, ht, along_cm0):
    """A pad of settled snow along a centreline (m,3): half-width hw and height ht per sample. Not a pillow (blind
    judges: "the snow on the trees looks like cotton balls"): snow on a spruce lies as a slab on the spray, its top
    broad and nearly flat, wind-rippled and lumpy where clumps fell onto it; its sides steep and ragged, broken off in
    chunks, the widest a little below the top (a lip that throws a hard shadow line under it); cut back underneath,
    where the needles' tips stick out of it."""
    tan, side, up = frames(cen)
    m, k = len(cen), 18
    th = np.linspace(0, 2 * np.pi, k, endpoint=False)

    def smooth_noise(n, amp):
        v = np.array([r.uniform(-1, 1) for _ in range(n + 4)])
        return 1 + amp * np.convolve(v, [0.1, 0.25, 0.3, 0.25, 0.1], 'valid')

    c, sn = np.cos(th), np.sin(th)
    # the section: a flat top, square shoulders, steep sides, the widest at 0.35 of the height, cut in underneath
    sy = np.sign(c) * np.abs(c) ** 0.55
    sz = np.where(sn > 0, np.abs(sn) ** 0.45, -0.3 * np.abs(sn) ** 0.8)
    wide = np.where(sn > 0, 1.0 - 0.13 * np.clip((sz - 0.35) / 0.65, 0, 1) ** 2, 1.0 - 0.32 * np.abs(sn))
    # each side's reach wanders along the branch on its own (broken off in chunks); the top rises and sinks in lumps
    rl, rr = smooth_noise(m, 0.45), smooth_noise(m, 0.45)
    reach = np.where(c[None, :] >= 0, rl[:, None], rr[:, None])
    top = smooth_noise(m, 0.35)[:, None]
    cy = sy[None, :] * wide[None, :] * hw[:, None] * reach
    cz = (sz[None, :] * np.where(sn[None, :] > 0, top, 1.0)) * ht[:, None]
    P = cen[:, None, :] + side[:, None, :] * cy[..., None] + up[:, None, :] * cz[..., None]
    # broken, lumpy surface: displaced along the section's outward direction by a few cm of noise (clumps on the top,
    # ragged chunks on the sides), scaled to the pad's size
    o = side[:, None, :] * (sy * 1.0)[None, :, None] + up[:, None, :] * (sz * 1.6)[None, :, None]
    o = nrm(o)
    f_lump, f_chunk, f_grain = waves(r, 9, (13.0, 17.0, 11.0)), waves(r, 9, (5.0, 6.5, 4.2)), waves(r, 7, (2.2, 2.8))
    size = np.minimum(hw, 2.2 * ht)[:, None]
    sidew = np.clip(np.abs(c), 0, 1)[None, :] ** 0.7
    amp_l = size * (0.09 + 0.05 * sidew)
    amp_c = size * (0.02 + 0.05 * sidew)
    amp_g = np.minimum(size * 0.01, 0.25)
    d = amp_l * f_lump(P) + amp_c * f_chunk(P) + amp_g * f_grain(P)
    P = P + o * d[..., None]
    # normals from the surface itself (finite differences round the ring and along it), pointing away from the centre
    dth = np.roll(P, -1, axis=1) - np.roll(P, 1, axis=1)
    dl = np.gradient(P, axis=0)
    N = nrm(np.cross(dth, dl))
    out = P - cen[:, None, :]
    flip = np.einsum('ijk,ijk->ij', N, out) < 0
    N[flip] *= -1
    N[np.linalg.norm(out, axis=2) < 1e-3] = Z
    s = along_cm0 + np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(cen, axis=0), axis=1))])
    UV = np.stack(np.broadcast_arrays(np.arange(k)[None, :] / k * 0.6, s[:, None] / 100.0), -1)
    P, N, UV = P.reshape(-1, 3), N.reshape(-1, 3), UV.reshape(-1, 2)
    acc.add('snow', P, N, UV, orient(P, grid_tris(m, k, wrap=True), N))


def interp(pts, t):
    s = np.linspace(0, 1, len(pts))
    return np.stack([np.interp(t, s, pts[:, i]) for i in range(3)], -1)


def snow_pad(acc, r, pts, L, hw_max, t0, t1, thick, inner_taper=0.25):
    """A pad of snow along part of a branch (t0..t1 of its path), sometimes broken where some fell off; thin near the
    branch's base."""
    segs = [(t0, t1)]
    if L > 70 and r.random() < 0.4:
        g = r.uniform(t0 + 0.25, t1 - 0.2)
        gw = r.uniform(0.05, 0.11)
        segs = [(t0, g - gw / 2), (g + gw / 2, t1)]
    for ta, tb in segs:
        if tb - ta < 0.08:
            continue
        m = max(7, min(34, int(L * (tb - ta) / 3.5)))
        tt = np.linspace(ta, tb, m)
        cen = interp(pts, tt) + Z * 1.2
        x = (tt - t0) / max(1e-3, t1 - t0)
        # (its ends broken off short, not rounded to a point: full width until close to the end, then a steep fall)
        prof = np.clip(2.4 * np.sin(np.pi * (tt - ta) / (tb - ta)), 0, 1) ** 0.6
        prof[0] = prof[-1] = 0.0
        prof *= np.clip(x / inner_taper, 0.35, 1.0) * (1 - 0.3 * x)
        hw = hw_max * prof
        pad(acc, r, cen, hw, hw * thick * 0.75, ta * L)


def hanging(acc, r, at, fwd, hs, lc, axis_xy):
    s_ = 1 if r.random() < 0.5 else -1
    d = nrm(fwd * r.uniform(0.35, 0.7) + hs * s_ * r.uniform(0.1, 0.5) - Z * r.uniform(0.6, 1.0))
    card(acc, at - Z * 2.0, d, lc, lc * 0.5, math.radians(r.uniform(60, 100)) * s_, r.uniform(0.2, 0.6), axis_xy)


def branch(acc, r, origin, az, L, u, trunk_r, axis_xy):
    """One branch from the trunk: its path (rising near the top, drooping lower down under the snow, the tip turning up
    a little), the wood, and a flat fan of secondary branches spreading alternately to each side, each with its sprays
    and its snow; a pad of snow along the top of the branch itself."""
    e0 = math.radians(lerp(36, -16, u ** 0.8) + r.uniform(-7, 7))
    droop = math.radians(lerp(4, 36, u))
    tipup = math.radians(lerp(0, 15, u))
    n = max(4, min(10, int(L / 14) + 3))
    ts = np.linspace(0, 1, n)
    hd = np.array([math.cos(az), math.sin(az), 0.0])
    p = origin + hd * trunk_r
    pts = [p]
    wander = r.uniform(-0.25, 0.25)
    for t in ts[1:]:
        e = e0 - droop * t + 2 * tipup * t * t
        a = az + wander * t
        d = np.array([math.cos(e) * math.cos(a), math.cos(e) * math.sin(a), math.sin(e)])
        p = p + d * (L / (n - 1))
        pts.append(p)
    pts = np.array(pts)
    rad = (0.5 + L / 120.0) * (1 - 0.8 * ts)
    acc.add('bark', *tube(pts, rad, 5))
    tan = nrm(np.gradient(pts, axis=0))

    Lc = min(64.0, max(18.0, 0.55 * L + 10)) * r.uniform(0.88, 1.1)      # spray size on this branch
    if L < 28:
        card(acc, pts[0], tan[-1] + Z * 0.1, L + 10, (L + 10) * 0.5, r.uniform(-0.3, 0.3), r.uniform(0.3, 1.0), axis_xy)
        if L > 14:
            snow_pad(acc, r, pts, L, max(3.0, 0.22 * L), 0.15, 0.85, r.uniform(0.6, 0.85))
        return
    t_tip = max(0.2, 1 - 0.55 * Lc / L)
    card(acc, interp(pts, t_tip), interp(tan, 1.0), Lc, Lc * 0.5, r.uniform(-0.25, 0.25), r.uniform(0.4, 1.0), axis_xy)

    # the fan: secondary branches alternately to each side, long near the trunk and short toward the tip, spreading
    # at 50-68 degrees and drooping at their tips
    t = r.uniform(14, 24) / L
    side = 1 if r.random() < 0.5 else -1
    while t < t_tip + 0.05:
        P0 = interp(pts, t)
        fwd = nrm(interp(tan, t))
        hs = nrm(np.cross(fwd, Z))
        rem = 1 - t
        l2 = min(0.5 * L, 0.42 * L * rem ** 0.8 + 10) * r.uniform(0.75, 1.1)
        ang = math.radians(r.uniform(50, 68))
        d2 = nrm(fwd * math.cos(ang) + hs * side * math.sin(ang) - Z * math.sin(math.radians(r.uniform(3, 12))))
        q1 = P0 + d2 * l2 * 0.5 - Z * l2 * 0.04
        q2 = P0 + d2 * l2 - Z * l2 * r.uniform(0.08, 0.2)
        sec = np.array([P0, q1, q2])
        acc.add('bark', *tube(sec, np.array([1.0, 0.6, 0.25]) * (0.3 + l2 / 250.0), 4))
        stan = nrm(q2 - q1)
        lc = min(Lc, l2 * 1.0 + 12) * r.uniform(0.88, 1.06)
        card(acc, interp(sec, max(0.0, 1 - 0.7 * lc / l2)), stan, lc, lc * 0.5, r.uniform(-0.35, 0.35), r.uniform(0.4, 1.0), axis_xy)
        shs = nrm(np.cross(stan, Z))
        for tt, k in ((0.3, 45), (0.55, 90)):
            if l2 > k:
                s3 = 1 if r.random() < 0.5 else -1
                a3 = math.radians(r.uniform(25, 45))
                d3 = nrm(stan * math.cos(a3) + shs * s3 * math.sin(a3) - Z * 0.1)
                card(acc, interp(sec, tt), d3, lc * 0.8, lc * 0.4, r.uniform(-0.35, 0.35), r.uniform(0.4, 1.0), axis_xy)
        # hanging sprays below (more on the lower, older branches): they fill the side view between the tiers, the
        # way a real crown reads as a dark mass with white on top
        if r.random() < lerp(0.3, 0.9, u):
            hanging(acc, r, interp(sec, 0.5), stan, shs, lc * r.uniform(0.4, 0.62), axis_xy)
        if l2 > 32 and r.random() < 0.85:
            snow_pad(acc, r, sec, l2, min(15.0, 0.24 * lc + 2.5) * r.uniform(0.85, 1.15), 0.1, r.uniform(0.72, 0.92),
                     r.uniform(0.65, 0.9), inner_taper=0.15)
        side = -side
        t += r.uniform(14, 22) / L

    # the pad of snow along the branch: from a little way out from the trunk most of the way along
    snow_pad(acc, r, pts, L, min(24.0, max(5.0, 0.34 * Lc)) * r.uniform(0.85, 1.15), r.uniform(0.08, 0.16),
             r.uniform(0.74, 0.95), r.uniform(0.7, 0.95))


def spruce(H, seed, clear=0.0):
    """clear: an old forest spruce whose lower branches have died in the shade: no live branches below this height (cm),
    only dead stubs on the bare trunk."""
    r = random.Random(seed)
    acc = Acc()
    zc = max(H * r.uniform(0.02, 0.08), clear)
    # crown radius at the base: young trees broad (about half as wide as tall), old ones narrow spires
    R = H * lerp(0.2, 0.13, min(1.0, (H - 450) / 2050.0)) * r.uniform(0.92, 1.1)
    r0 = max(4.0, H / 70.0)
    lean = (r.uniform(-1, 1) * 0.006 * H, r.uniform(-1, 1) * 0.006 * H)

    def axis(z):
        u = z / H
        return np.array([lean[0] * u * u, lean[1] * u * u, z])

    def trunk_r(z):
        return max(0.6, r0 * (1 - z / H) ** 0.9)

    zs = np.linspace(-60, H, 26)
    acc.add('bark', *tube(np.array([axis(z) for z in zs]), np.array([trunk_r(max(z, 0)) for z in zs]), 10))
    if clear > 0:
        rs = random.Random(seed * 7 + 1)
        zz = clear - rs.uniform(15, 35)
        while zz > 45:
            for j in range(rs.choice((2, 3, 3, 4))):
                az = rs.uniform(0, 2 * math.pi)
                L = rs.uniform(10, 50) * (0.45 + 0.55 * zz / clear)       # shorter, more broken nearer the ground
                e = math.radians(rs.uniform(-28, 4))
                d = np.array([math.cos(e) * math.cos(az), math.cos(e) * math.sin(az), math.sin(e)])
                p0 = axis(zz) + np.array([math.cos(az), math.sin(az), 0.0]) * trunk_r(zz) * 0.9
                bend = np.array([rs.uniform(-1, 1), rs.uniform(-1, 1), rs.uniform(-1.5, 0.3)]) * L * 0.08
                pts = np.array([p0, p0 + d * L * 0.5 + bend, p0 + d * L + bend * 1.6])
                acc.add('bark', *tube(pts, np.array([1.0, 0.65, 0.3]) * (0.7 + L / 45.0), 4))
                if L > 30 and rs.random() < 0.6:     # a dead twig off it
                    q0 = pts[1]
                    a2 = az + rs.choice((-1, 1)) * rs.uniform(0.6, 1.1)
                    q1 = q0 + np.array([math.cos(a2), math.sin(a2), -0.25]) * L * rs.uniform(0.25, 0.45)
                    acc.add('bark', *tube(np.array([q0, (q0 + q1) / 2, q1]), np.array([0.5, 0.35, 0.15]), 3))
            zz -= rs.uniform(22, 42)

    z, k = H - r.uniform(18, 28), 0
    top_whorl = z
    while z > zc:
        u = (H - z) / (H - zc)
        crown = 10 + R * u ** 0.92 * r.uniform(0.85, 1.12)
        nb = r.choice((4, 5, 5, 6)) if u > 0.05 else 3
        a0 = k * 2.39996 + r.uniform(-0.4, 0.4)
        o = axis(z)
        for j in range(nb):
            az = a0 + j * 2 * math.pi / nb + r.uniform(-0.3, 0.3)
            L = crown * r.uniform(0.78, 1.08)
            if r.random() < 0.07 and u > 0.3:
                L *= r.uniform(0.35, 0.6)
            branch(acc, r, o, az, L, u, trunk_r(z), o[:2])
        sp = (18 + 30 * min(1.0, u * 2.5)) * r.uniform(0.85, 1.2)
        for j in range(r.choice((0, 1, 1, 2))):
            zi = z - sp * r.uniform(0.35, 0.65)
            ui = (H - zi) / (H - zc)
            if zi > zc:
                oi = axis(zi)
                branch(acc, r, oi, r.uniform(0, 2 * math.pi), (10 + R * ui ** 0.92) * r.uniform(0.4, 0.65), ui, trunk_r(zi), oi[:2])
        z -= sp
        k += 1

    # the leader: a thin shoot above the top whorl with small sprays turned up round it and lumps of snow on it
    lead = np.array([axis(top_whorl), axis(H)])
    for i in range(r.randint(3, 5)):
        zz = lerp(top_whorl, H - 12, r.random())
        a = r.uniform(0, 2 * math.pi)
        d = nrm([math.cos(a) * 0.45, math.sin(a) * 0.45, 1.0])
        lc = r.uniform(14, 24)
        card(acc, axis(zz), d, lc, lc * 0.5, 0.0, 0.3, axis(zz)[:2])
    for i in range(r.randint(1, 3)):
        zz = lerp(top_whorl, H - 6, r.random())
        c = axis(zz)
        cen = np.array([c - [0, 0, 3.5], c + [0, 0, 3.5]])
        cen = interp(cen, np.linspace(0, 1, 5))
        hw = np.sin(np.linspace(0, np.pi, 5)) ** 0.5 * r.uniform(2.5, 4.5)
        pad(acc, r, cen, hw, hw * 0.9, 0.0)
    return acc


# =====================================================================================================================
# preview: the trees rendered in Blender by daylight, to compare with the reference photos
# =====================================================================================================================
def preview(trees, path):
    scene = bpy.context.scene
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob)

    def tex_mat(name, col_png, nrm_png=None, color=None, rough=0.7):
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        nt = m.node_tree
        bsdf = nt.nodes['Principled BSDF']
        bsdf.inputs['Roughness'].default_value = rough
        if 'Specular IOR Level' in bsdf.inputs:
            bsdf.inputs['Specular IOR Level'].default_value = 0.25
        if col_png:
            im = nt.nodes.new('ShaderNodeTexImage')
            im.image = bpy.data.images.load(os.path.join(ART, col_png))
            nt.links.new(im.outputs['Color'], bsdf.inputs['Base Color'])
            nt.links.new(im.outputs['Alpha'], bsdf.inputs['Alpha'])
        else:
            bsdf.inputs['Base Color'].default_value = (*color, 1)
        return m

    mats = {'bark': tex_mat('bark', None, color=(0.09, 0.085, 0.08), rough=0.9),
            'needles_top': tex_mat('top', 'T_SpraySnowC.png', rough=0.85),
            'needles_under': tex_mat('under', 'T_SprayC.png', rough=0.85),
            'snow': tex_mat('snowm', None, color=(0.82, 0.84, 0.88), rough=0.6)}
    x = 0.0
    xs = []
    for H, acc in trees:
        xs.append(x)
        for mat in acc.g:
            P, N, UV, T = acc.arrays(mat)
            me = bpy.data.meshes.new(mat)
            me.from_pydata(P.tolist(), [], T.tolist())
            uv = me.uv_layers.new()
            uv.data.foreach_set('uv', UV[T.ravel()].ravel())
            me.normals_split_custom_set_from_vertices(N.tolist())
            me.materials.append(mats[mat])
            ob = bpy.data.objects.new(mat, me)
            ob.location = (x, 0, 0)
            scene.collection.objects.link(ob)
        x += H * 0.45 + 250
    width = x - 250
    gp = bpy.data.meshes.new('ground')
    gp.from_pydata([(-2000, -3000, 0), (width + 2000, -3000, 0), (width + 2000, 3000, 0), (-2000, 3000, 0)], [], [(0, 1, 2, 3)])
    gp.materials.append(mats['snow'])
    g = bpy.data.objects.new('ground', gp)
    scene.collection.objects.link(g)
    sun = bpy.data.lights.new('sun', 'SUN')
    sun.energy = 2.5
    so = bpy.data.objects.new('sun', sun)
    so.rotation_euler = (math.radians(50), 0, math.radians(30))
    scene.collection.objects.link(so)
    w = bpy.data.worlds.new('sky')
    w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.55, 0.62, 0.75, 1)
    w.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.2
    scene.world = w
    cam = bpy.data.cameras.new('c')
    cam.lens = 35
    cam.clip_start, cam.clip_end = 10, 100000
    co = bpy.data.objects.new('c', cam)
    hmax = max(H for H, _ in trees)
    co.location = (width / 2 - 200, -hmax * 1.25, 170)
    co.rotation_euler = (math.radians(90 + 14), 0, 0)
    scene.collection.objects.link(co)
    scene.camera = co
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 48
    scene.cycles.use_denoising = True
    scene.cycles.transparent_max_bounces = 48
    scene.render.film_transparent = False
    scene.render.resolution_x, scene.render.resolution_y = 1600, 1000
    scene.render.image_settings.color_mode = 'RGB'
    scene.view_settings.view_transform = 'AgX'
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print('preview', path)
    # close: the second tree from about road distance, eye height, looking up a little
    co.location = (xs[1] - 150, -900, 150)
    co.rotation_euler = (math.radians(90 + 20), 0, math.radians(-10))
    scene.render.resolution_x, scene.render.resolution_y = 1000, 1250
    scene.render.filepath = path.replace('.png', '_close.png')
    bpy.ops.render.render(write_still=True)
    print('preview', scene.render.filepath)


if __name__ == '__main__':
    bpy.ops.wm.read_factory_settings(use_empty=True)
    os.makedirs(GEN, exist_ok=True)
    os.makedirs(ART, exist_ok=True)
    if '--no-tex' not in sys.argv:
        render_spray()
    built = []
    meta = []
    stop_only = '--stop-only' in sys.argv
    for i, (H, seed) in enumerate([] if stop_only else VARIANTS):
        acc = spruce(H, seed)
        acc.write(os.path.join(GEN, 'Spruce_%d.obj' % i))
        meta.append({'name': 'Spruce_%d' % i, 'height_cm': H, 'tris': acc.tris()})
        print('Spruce_%d: %.1f m, %d triangles' % (i, H / 100, acc.tris()))
        built.append((H, acc))
    if stop_only:
        meta = [m for m in json.load(open(os.path.join(GEN, 'spruce.json'))) if m['name'] != 'Spruce_Stop']
    # the one that stops the crashing car (Part 2's opening): an old 23 m spruce, bare to 4.2 m (placed on its own by
    # the director, after the forest's variants so no forest tree uses it)
    acc = spruce(2300, 53, clear=420)
    acc.write(os.path.join(GEN, 'Spruce_Stop.obj'))
    meta.append({'name': 'Spruce_Stop', 'height_cm': 2300, 'tris': acc.tris()})
    print('Spruce_Stop: 23 m, bare to 4.2 m, %d triangles' % acc.tris())
    json.dump(meta, open(os.path.join(GEN, 'spruce.json'), 'w'), indent=1)
    if PREVIEW and not stop_only:
        os.makedirs(PREVIEW, exist_ok=True)
        preview([built[0], built[2], built[4], built[6]], os.path.join(PREVIEW, 'spruce_preview.png'))
