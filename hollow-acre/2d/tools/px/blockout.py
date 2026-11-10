"""A tiny 3D blockout renderer for references (the Dead Cells / "3D to pixel" method), written for Hollow Acre.

Simple solid shapes (spheres, ellipsoids, cylinders, boxes; foliage spheres get a lumpy leaf surface) are ray-marched
with an orthographic camera tilted down about 30 degrees (the "elev" setting), so trees and walls stand up and the
ground is foreshortened, as in LPC and Stardew. Light comes from above, slightly left and front. Shading is toon: n.L quantised into the
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

ROT = None   # the whole model can be turned (yaw about y, pitch about z, roll about x) before it is rendered


def set_rotation(yaw=0, pitch=0, roll=0, pivot=(0, 0, 0)):
    global ROT
    if not (yaw or pitch or roll): ROT = None; return
    cy, sy_, cp, sp_, cr, sr = math.cos(yaw), math.sin(yaw), math.cos(pitch), math.sin(pitch), math.cos(roll), math.sin(roll)
    Ry = np.array([[cy, 0, sy_], [0, 1, 0], [-sy_, 0, cy]]); Rz = np.array([[cp, -sp_, 0], [sp_, cp, 0], [0, 0, 1]])
    Rx = np.array([[1, 0, 0], [0, cr, -sr], [0, sr, cr]])
    R = Ry @ Rz @ Rx; ROT = (R, np.array(pivot, float))


def sdf_scene(P, shapes):
    """signed distance to the nearest shape, and which shape it is"""
    PW = P
    if ROT is not None:   # world -> model space (rotations keep distances, so the SDF stays exact)
        R, pv = ROT; P = (P - pv) @ R + pv
    PM = P
    d = np.full(P.shape[0], 1e9); idx = np.full(P.shape[0], -1)
    for i, s in enumerate(shapes):
        P = PW if s.get('world') else PM   # 'world' parts (debris on the ground) don't turn with the model
        t = s['type']
        if t in ('sphere', 'ellipsoid'):
            c = np.array(s['c'], float); r = np.array(s.get('rr', [s.get('r', 1)] * 3), float)
            q = (P - c) / r; k = np.linalg.norm(q, axis=1); di = (k - 1) * r.min()
            for cut in s.get('cuts', []):   # flat faces sliced off (rocks): each cut is a plane normal and an offset
                nn = np.array(cut[:3], float); nn /= np.linalg.norm(nn)
                di = np.maximum(di, (P - c) @ nn - cut[3] * r.min())
        elif t == 'cone':    # base centre c, base radius r, height h (a pine tier)
            c = np.array(s['c'], float); h = s['h']; r = s['r']
            y = P[:, 1] - c[1]; rad = np.hypot(P[:, 0] - c[0], P[:, 2] - c[2])
            ca = h / math.hypot(h, r)
            di = np.maximum((rad - r * (1 - y / h)) * ca, -y)
        elif t == 'torus':     # a ring in the x-y plane (faces the viewer): centre c, ring radius R, tube radius r
            c = np.array(s['c'], float)
            if s.get('axis') == 'y':   # lying flat: a hoop round a barrel, a tyre on a stack
                q0 = np.hypot(P[:, 0] - c[0], P[:, 2] - c[2]) - s['R']; di = np.hypot(q0, P[:, 1] - c[1]) - s['r']
            elif s.get('axis') == 'x':   # turned a quarter: the ring stands in the z-y plane (a wheel seen from the side of a turned cart)
                q0 = np.hypot(P[:, 2] - c[2], P[:, 1] - c[1]) - s['R']; di = np.hypot(q0, P[:, 0] - c[0]) - s['r']
            else:
                q0 = np.hypot(P[:, 0] - c[0], P[:, 1] - c[1]) - s['R']; di = np.hypot(q0, P[:, 2] - c[2]) - s['r']
        elif t == 'cylinder':
            c = np.array(s['c'], float); h = s['h']; r = s['r']; ax = s.get('axis', 'y')
            if ax == 'y': y = P[:, 1] - c[1]; rad = np.hypot(P[:, 0] - c[0], P[:, 2] - c[2])
            elif ax == 'z': y = P[:, 2] - c[2]; rad = np.hypot(P[:, 0] - c[0], P[:, 1] - c[1])
            else: y = P[:, 0] - c[0]; rad = np.hypot(P[:, 1] - c[1], P[:, 2] - c[2])
            fl = s.get('flare', 0); rr = r + fl * np.clip(1 - y / max(1, h * .25), 0, 1) ** 2
            dx = rad - rr; dy = np.maximum(-y, y - h)
            di = np.minimum(np.maximum(dx, dy), 0) + np.hypot(np.maximum(dx, 0), np.maximum(dy, 0))
        elif t == 'branch':
            a = np.array(s['a'], float); b = np.array(s['b'], float); ab = b - a
            hh = np.clip(((P - a) @ ab) / (ab @ ab), 0, 1)
            di = np.linalg.norm(P - (a + hh[:, None] * ab), axis=1) - (s['r0'] + (s['r1'] - s['r0']) * hh)
        elif t == 'box':
            mn = np.array(s['min'], float); mx = np.array(s['max'], float); c = (mn + mx) / 2; e = (mx - mn) / 2
            rd = s.get('round', 0)
            q = np.abs(P - c) - (e - rd); di = np.linalg.norm(np.maximum(q, 0), axis=1) + np.minimum(q.max(axis=1), 0) - rd
        else: continue
        for pl in s.get('planes', []):   # flat cuts at an absolute distance from the shape's centre (windscreens, slopes)
            nn = np.array(pl[:3], float); nn /= np.linalg.norm(nn); cc = np.array(s.get('c') or ((np.array(s['min']) + np.array(s['max'])) / 2).tolist(), float)
            di = np.maximum(di, (P - cc) @ nn - pl[3])
        L = s.get('lumps', 0)
        if L:   # a leafy surface: overlapping bumps, the size of a small leaf clump
            f = s.get('lumpfreq', .55); X, Y, Z = P[:, 0] + s.get('seed', 0) * 7.3, P[:, 1], P[:, 2] + s.get('seed', 0) * 3.1
            di = di - L * (np.sin(X * f + 1.3) * np.sin(Y * f * 1.1 + .7) * np.sin(Z * f * .9 + 2.1) * .5 + .5)
            L2 = s.get('lumps2', 0)
            if L2:   # a second, finer octave: clumps of a few leaves (what gives LPC crowns their texture)
                f2 = s.get('lumpfreq2', 1.1)
                di = di - L2 * (np.sin(X * f2 + Z * .4 + .3) * np.sin(Y * f2 * 1.2 + X * .3 + 1.9) * np.sin(Z * f2 * .8 + 4.0) * .5 + .5)
        if s.get('stepdown'): di = di * s['stepdown']   # lumpy shapes over-estimate distance: march carefully
        m = di < d; d[m] = di[m]; idx[m] = i
    return d, idx

def render(scene):
    W, H = scene['size']; ox, oy = scene.get('origin', [W / 2, H - 8]); shapes = scene['shapes']
    rt = scene.get('rotate', {}); set_rotation(math.radians(rt.get('yaw', 0)), math.radians(rt.get('pitch', 0)),
                                               math.radians(rt.get('roll', 0)), rt.get('pivot', (0, 0, 0)))
    mats = scene['materials']
    # orthographic camera tilted down by `elev` degrees (30 reads like LPC and Stardew: trees stand up, the ground
    # is foreshortened; 45 looks down like a drone and shows too much crown top). screen x = X,
    # screen y = oy - k*(Y*cos e - Z*sin e). +Z comes toward the viewer (down the screen).
    e = math.radians(scene.get('elev', 30)); k = scene.get('scale', 1.0); ce, se = math.cos(e), math.sin(e)
    xs, ys = np.meshgrid(np.arange(W) + .5, np.arange(H) + .5)
    X = (xs - ox).ravel(); V = ((oy - ys) / k).ravel()
    U = np.array([0, ce, -se]); D = np.array([0, -se, -ce])
    t0 = 300.0
    P = np.stack([X, V * ce, -V * se], axis=1) - D[None, :] * t0
    hit = np.zeros(len(X), bool); hid = np.full(len(X), -1)
    alive = np.ones(len(X), bool)
    for _ in range(320):
        if not alive.any(): break
        d, idx = sdf_scene(P[alive], shapes)
        a = np.where(alive)[0]
        h = d < .05; hit[a[h]] = True; hid[a[h]] = idx[h]
        step = np.maximum(d, .04); P[a] += D * step[:, None]
        alive[a[h]] = False; alive[a[P[a][:, 1] < -2]] = False
    # normals by central differences
    ee = .25; out = np.zeros((H * W,), dtype=object); band = np.full(H * W, -1); mat = np.full(H * W, '', dtype=object)
    Lt = np.array(scene.get('light', [-.4, 1.0, .35]), float); Lt /= np.linalg.norm(Lt)
    hp = np.where(hit)[0]
    if len(hp):
        Q = P[hp]
        n = np.stack([sdf_scene(Q + [ee, 0, 0], shapes)[0] - sdf_scene(Q - [ee, 0, 0], shapes)[0],
                      sdf_scene(Q + [0, ee, 0], shapes)[0] - sdf_scene(Q - [0, ee, 0], shapes)[0],
                      sdf_scene(Q + [0, 0, ee], shapes)[0] - sdf_scene(Q - [0, 0, ee], shapes)[0]], axis=1)
        n /= np.linalg.norm(n, axis=1)[:, None] + 1e-9
        dome = scene.get('dome')   # shade a crown as one lit dome: bend each leaf normal toward the crown's envelope
        dm = np.zeros(len(hp), bool)
        if dome:
            dm = np.array([shapes[hid[i]].get('mat') == dome.get('mat', 'leaf') for i in hp])
            if dm.any():
                c_ = np.array(dome['c'], float); r_ = np.array(dome['rr'], float); w_ = dome.get('w', .6)
                ne = (Q[dm] - c_) / (r_ * r_); ne /= np.linalg.norm(ne, axis=1)[:, None] + 1e-9
                nb = n[dm] * (1 - w_) + ne * w_; n[dm] = nb / (np.linalg.norm(nb, axis=1)[:, None] + 1e-9)
        lam = np.clip(n @ Lt, 0, 1)
        # self-shadow: march toward the light; anything in the way darkens it (shadows between leaf bundles)
        R = Q + n * .6; sh = np.ones(len(hp))
        for _k in range(40):
            dd, _ = sdf_scene(R, shapes); sh = np.minimum(sh, np.clip(dd * 3, 0, 1)); R = R + Lt[None, :] * np.maximum(dd, .3)[:, None]
        # crease darkening (cheap ambient occlusion)
        ao = np.clip(sdf_scene(Q + n * 1.5, shapes)[0] / 1.5, 0, 1) * .5 + .5
        if dome and dm.any():   # inside one dome the lumps barely shadow each other: no dark seams between them
            ks = dome.get('seams', .3); sh[dm] = 1 - (1 - sh[dm]) * ks; ao[dm] = 1 - (1 - ao[dm]) * ks
        mname = {}; hiflag = set(); NRM = {}
        for j, i in enumerate(hp):
            s = shapes[hid[i]]; m = s['mat']
            if s.get('topmat') and n[j, s.get('top_axis', 1)] * s.get('top_sign', 1) > s.get('top_at', .8): m = s['topmat']
            M = mats[m]; ch = M['chars']; nk = len(ch)
            amb = M.get('ambient', 0); shw = M.get('shade', .65)
            vv = amb + (1 - amb) * lam[j] * ((1 - shw) + shw * sh[j]) * ao[j] + s.get('bias', 0)
            g = scene.get('gamma', 1.5)   # moodier: most of the volume sits in the middle and lower steps
            q = max(vv, 0) ** g
            b = int(np.clip(q * nk * 1.12, 0, nk - 1))
            if 'emit' in M and M.get('glow'):   # a lit window: an even warm glow, brighter toward the middle
                cx_ = (s['min'][0] + s['max'][0]) / 2 if 'min' in s else Q[j, 0]; hw_ = abs(s['max'][0] - s['min'][0]) / 2 if 'min' in s else 1
                b = min(nk - 1, M['emit'] + (1 if abs(Q[j, 0] - cx_) < hw_ * .45 else 0))
            elif 'emit' in M:   # fire, lit from inside: white-hot coals at the bottom, flame tongues licking up, dark above
                y0 = s.get('min', [0, Q[j, 1] - 4])[1]; hy = Q[j, 1] - y0; tongue = (math.sin(Q[j, 0] * 1.3 + 1) * 2.2 + 4.5)
                b = nk - 1 if hy < 2 else nk - 2 if hy < 3.5 else (M['emit'] if hy < tongue else 0)
            pat = M.get('pattern') or s.get('pattern')
            if pat:   # seams in world space, so they follow the surface in perspective
                X_, Y_, Z_ = Q[j]; a_ = np.abs(n[j]); face = int(np.argmax(a_))
                u, v = ((X_, Y_) if face == 2 else (Z_, Y_) if face == 0 else (X_, Z_))
                kind, sp = pat[0], pat[1]; seam = False
                if kind == 'planks':          # boards running along an axis, seams every sp
                    ax_ = {'x': X_, 'y': Y_, 'z': Z_}[pat[2]]; seam = (ax_ % sp) < 1
                elif kind == 'bricks':        # courses sp high, bricks 2 sp long, every other course offset
                    row = math.floor(v / sp); seam = (v % sp) < 1 or ((u + (row % 2) * sp) % (2 * sp)) < 1
                elif kind == 'bars':          # vertical bars sp apart (a cage)
                    seam = (u % sp) >= 1.2
                elif kind == 'mosaic':        # stained glass: small leaded cells, each its own colour step
                    cu, cv = math.floor(u / sp), math.floor(v / sp)
                    if (u % sp) < .9 or (v % sp) < .9: b = 0
                    else: b = 1 + (cu * 7 + cv * 13) % (nk - 1)
                elif kind == 'grain':         # wood grain: broken streaks along an axis, mostly a step darker, a few a step lighter
                    axn = pat[2]; along = {'x': X_, 'y': Y_, 'z': Z_}[axn]
                    uax = 'x' if face in (1, 2) else 'z'; across = v if uax == axn else u
                    row = math.floor(across / sp); seg = math.floor((along + row * 3.7) / (pat[3] if len(pat) > 3 else 7))
                    hh = ((row * 73856093) ^ (seg * 19349663) ^ 0x5bd1e995) % 100
                    if hh < 26: b = max(0, b - 1)
                    elif hh > 94: b = min(nk - 1, b + 1)
                elif kind == 'glint':         # a diagonal glint across glass (lighter, not darker)
                    if ((u - v) % sp) < 2.2: b = min(nk - 1, b + 2)
                if seam: b = max(0, b - pat[3] if len(pat) > 3 else b - 1)
            band[i] = b; mname[i] = m; NRM[i] = n[j]
            if 'hi' in M and q > M.get('hi_at', .9): hiflag.add(i)   # a small sunlit highlight
        # bevel: the front edge of every top face catches the light (the LPC rim), for materials that ask for it
        for i in list(mname):
            M = mats[mname[i]]
            if M.get('bevel') and NRM[i][1] > .7 and (i + W) in mname and NRM[i + W][1] < .4 and hid[i + W] == hid[i]:
                band[i] = min(len(M['chars']) - 1, band[i] + 1)
        for i, m in mname.items():
            mat[i] = mats[m]['hi'] if i in hiflag else mats[m]['chars'][band[i]]
    # cast shadow on the ground (y = 0) from the light
    shadow = np.zeros(H * W, bool)
    gm = ~hit
    if scene.get('noshadow'): gm[:] = False   # icons float on the slot, no ground under them
    if gm.any():
        idxs = np.where(gm)[0]; Xg = X[idxs]; Zg = -V[idxs] / se      # where the pixel's ray meets the ground
        G = np.stack([Xg, np.zeros_like(Xg) + .2, Zg], axis=1); occ = np.zeros(len(idxs), bool)
        Ls = np.array(scene.get('shadow_light', [-.35, 1.0, -.25]), float); Ls /= np.linalg.norm(Ls)
        for _k in range(80):
            dd, _ = sdf_scene(G, shapes); occ |= dd < .1; G = G + Ls[None, :] * np.maximum(dd, .5)[:, None]
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
