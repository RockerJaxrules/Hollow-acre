"""A tiny 3D blockout renderer for references (the Dead Cells / "3D to pixel" method), written for Hollow Acre.

Simple solid shapes (spheres, ellipsoids, cylinders, boxes; foliage spheres get a lumpy leaf surface) are ray-marched
in the LPC projection: orthographic, top-down at about 60 degrees, with height and depth both drawn at 3/4 (a cube's top
is 32 wide by 24 high). Light comes from above, slightly left and front. Shading is toon: n.L quantised into the
material's ramp steps, darkened where the shape shadows itself (shadows between leaf bundles) and in creases. The ground
gets the cast shadow. The output is a reference, not the art: a PNG to look at, and a .pxg grid (ramp digits per
material) that the hand pass starts from.

    python3 blockout.py scene.json out_prefix
scene.json: {"size":[W,H], "origin":[ox,oy] (screen position of world 0,0,0), "materials":{"leaf":{"chars":"12345"},
"bark":{"chars":"VUT"}}, "shapes":[{"type":"sphere","c":[x,y,z],"r":r,"mat":"leaf","lumps":1.2}, {"type":"cylinder",
"c":[x,0,z],"r":r,"h":h,"mat":"bark","flare":3}, {"type":"box","min":[..],"max":[..],"mat":"wall"}]}
"""
import sys, json, math
import numpy as np

def sdf_scene(P, shapes):
    """signed distance to the nearest shape, and which shape it is"""
    d = np.full(P.shape[0], 1e9); idx = np.full(P.shape[0], -1)
    for i, s in enumerate(shapes):
        t = s['type']
        if t in ('sphere', 'ellipsoid'):
            c = np.array(s['c'], float); r = np.array(s.get('rr', [s.get('r', 1)] * 3), float)
            q = (P - c) / r; k = np.linalg.norm(q, axis=1); di = (k - 1) * r.min()
            L = s.get('lumps', 0)
            if L:   # a leafy surface: overlapping bumps, the size of a small leaf clump
                f = s.get('lumpfreq', .55); X, Y, Z = P[:, 0], P[:, 1], P[:, 2]
                di = di - L * (np.sin(X * f + 1.3) * np.sin(Y * f * 1.1 + .7) * np.sin(Z * f * .9 + 2.1) * .5 + .5)
        elif t == 'cylinder':
            c = np.array(s['c'], float); h = s['h']; r = s['r']
            y = P[:, 1] - c[1]; rad = np.hypot(P[:, 0] - c[0], P[:, 2] - c[2])
            fl = s.get('flare', 0); rr = r + fl * np.clip(1 - y / max(1, h * .25), 0, 1) ** 2
            dx = rad - rr; dy = np.maximum(-y, y - h)
            di = np.minimum(np.maximum(dx, dy), 0) + np.hypot(np.maximum(dx, 0), np.maximum(dy, 0))
        elif t == 'box':
            mn = np.array(s['min'], float); mx = np.array(s['max'], float); c = (mn + mx) / 2; e = (mx - mn) / 2
            q = np.abs(P - c) - e; di = np.linalg.norm(np.maximum(q, 0), axis=1) + np.minimum(q.max(axis=1), 0)
        else: continue
        m = di < d; d[m] = di[m]; idx[m] = i
    return d, idx

def render(scene):
    W, H = scene['size']; ox, oy = scene.get('origin', [W / 2, H - 8]); shapes = scene['shapes']
    mats = scene['materials']
    # screen pixel (x, y) <- world point on the ray (X, Y, Z) with x = X, y = oy - 0.75*Y + 0.75*Z  (LPC oblique)
    # rays run toward -Y/-Z equally (screen-invariant direction), from far above-front
    xs, ys = np.meshgrid(np.arange(W) + .5, np.arange(H) + .5)
    X = (xs - ox).ravel(); S = ((oy - ys) / .75).ravel()     # S = Y - Z along the ray
    D = np.array([0, -1, -1.0]) / math.sqrt(2)
    t0 = 200.0; P = np.stack([X, S / 2 + t0 / math.sqrt(2), -S / 2 + t0 / math.sqrt(2)], axis=1)
    hit = np.zeros(len(X), bool); hid = np.full(len(X), -1)
    alive = np.ones(len(X), bool)
    for _ in range(260):
        if not alive.any(): break
        d, idx = sdf_scene(P[alive], shapes)
        a = np.where(alive)[0]
        h = d < .05; hit[a[h]] = True; hid[a[h]] = idx[h]
        step = np.maximum(d, .04); P[a] += D * step[:, None]
        alive[a[h]] = False; alive[a[P[a][:, 1] < -2]] = False
    # normals by central differences
    e = .25; out = np.zeros((H * W,), dtype=object); band = np.full(H * W, -1); mat = np.full(H * W, '', dtype=object)
    Lt = np.array(scene.get('light', [-.45, 1.0, .55]), float); Lt /= np.linalg.norm(Lt)
    hp = np.where(hit)[0]
    if len(hp):
        Q = P[hp]
        n = np.stack([sdf_scene(Q + [e, 0, 0], shapes)[0] - sdf_scene(Q - [e, 0, 0], shapes)[0],
                      sdf_scene(Q + [0, e, 0], shapes)[0] - sdf_scene(Q - [0, e, 0], shapes)[0],
                      sdf_scene(Q + [0, 0, e], shapes)[0] - sdf_scene(Q - [0, 0, e], shapes)[0]], axis=1)
        n /= np.linalg.norm(n, axis=1)[:, None] + 1e-9
        lam = np.clip(n @ Lt, 0, 1)
        # self-shadow: march toward the light; anything in the way darkens it (shadows between leaf bundles)
        R = Q + n * .6; sh = np.ones(len(hp))
        for k in range(40):
            dd, _ = sdf_scene(R, shapes); sh = np.minimum(sh, np.clip(dd * 3, 0, 1)); R = R + Lt[None, :] * np.maximum(dd, .3)[:, None]
        # crease darkening (cheap ambient occlusion)
        ao = np.clip(sdf_scene(Q + n * 1.5, shapes)[0] / 1.5, 0, 1) * .5 + .5
        v = lam * (.35 + .65 * sh) * ao
        for j, i in enumerate(hp):
            s = shapes[hid[i]]; m = s['mat']; ch = mats[m]['chars']; k = len(ch)
            vv = v[j] + s.get('bias', 0)
            g = scene.get('gamma', 1.5)   # moodier: most of the volume sits in the middle and lower steps
            b = int(np.clip((max(vv, 0) ** g) * k * 1.12, 0, k - 1)); band[i] = b; mat[i] = ch[b]
    # cast shadow on the ground (y = 0) from the light
    shadow = np.zeros(H * W, bool)
    gm = ~hit
    if gm.any():
        idxs = np.where(gm)[0]; Xg = X[idxs]; Zg = -S[idxs]          # ground point: Y = 0, so Z = -S
        G = np.stack([Xg, np.zeros_like(Xg) + .2, Zg], axis=1); occ = np.zeros(len(idxs), bool)
        for k in range(60):
            dd, _ = sdf_scene(G, shapes); occ |= dd < .1; G = G + Lt[None, :] * np.maximum(dd, .5)[:, None]
        shadow[idxs[occ]] = True
    return W, H, mat.reshape(H, W), shadow.reshape(H, W)

if __name__ == '__main__':
    scene = json.load(open(sys.argv[1])); outp = sys.argv[2]
    W, H, mat, shadow = render(scene)
    rows = []
    for y in range(H):
        r = ''
        for x in range(W):
            c = mat[y, x]
            r += c if c else ('s' if shadow[y, x] else '.')
        rows.append(r)
    open(outp + '.grid.txt', 'w').write('\n'.join(rows))
    # a quick preview with the scene's palette
    from PIL import Image
    pal = {k: tuple(int(v.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)) + ((int(v.lstrip('#')[6:8], 16),) if len(v.lstrip('#')) > 6 else (255,))
           for k, v in scene.get('palette', {}).items()}
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); p = im.load()
    for y in range(H):
        for x in range(W):
            ch = rows[y][x]
            if ch != '.' and ch in pal: p[x, y] = pal[ch]
    im.save(outp + '.png'); print('ok', W, H)
