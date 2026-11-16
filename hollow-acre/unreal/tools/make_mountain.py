"""Generates the mountain for the ending drive (all our own work): a road that winds and climbs up a mountainside, a
rock-and-snow cliff on the uphill (left) side, a drop into the valley on the right with a guardrail and snow poles,
snow-laden pines, and big peaks in the distance. Scripts/build_drive.py imports the result.

Writes (Unreal frame: X forward at the start, Y right, Z up; meshes in centimetres):
  HollowAcre/Saved/Generated/Terrain_Road.obj   the road corridor: road bed, snow banks, cliff, drop (UV in 4 m units)
  HollowAcre/Saved/Generated/Road.obj           the road surface ribbon (U across, V along every 7 m)
  HollowAcre/Saved/Generated/Guardrail.obj, GuardPost.obj   the W-beam guardrail and its post (make_roadside.py)
  HollowAcre/Saved/Generated/Terrain_Far.obj    the valley floor and the peaks around it
  HollowAcre/Saved/Generated/mountain.json      the car's path, and transforms for trees, poles, guardrail posts and rails
                                                (trees: x, y, z, yaw, scale, spruce variant; the spruces themselves are
                                                made by tools/blender/spruce.py)
  HollowAcre/SourceArt/T_Snow*.png, T_Rock*.png, T_RoadSnow.png   tiling textures (colour + normal maps)

Run with Python 3 + numpy + Pillow:  python hollow-acre/unreal/tools/make_mountain.py
"""
import json
import math
import os
import random

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.join(HERE, '..', 'HollowAcre')
GEN = os.path.join(PROJ, 'Saved', 'Generated')
ART = os.path.join(PROJ, 'SourceArt')
SEED = 11

# ---------------- the road ----------------
LENGTH = 1600.0      # m of road
DS = 2.0             # m between road samples
HALF = 3.5           # road half-width (m), one lane each way
LANE = -1.75         # the car drives in the right lane (negative d = right of the centre line)
CAR_START = 60.0     # m along the road where the scene opens
CRASH_S = 590.0      # Part 2's opening: where the creature rams the car off the road (m along it)
CRASH_CLEAR = (562.0, 652.0, -230.0)  # the avalanche chute below it, bare of trees (s from, s to, d down to)
FALL_S = (566.0, 646.0)               # where the chute's shape is full strength (it blends out over 40 m either side)
REACH = 120.0        # m of corridor terrain on the uphill side
REACH_DOWN = 230.0   # m on the downhill side: all the way down to the valley floor (the corridor is what collides)
FLOOR_DROP = 175.0   # the valley floor lies this far below the road's mean height (build_far)
FLOOR_BASE = 0.0     # set in main()


def curvature(s):    # 1/m, positive turns right
    return 0.0042 * math.sin(s / 210.0 + 0.3) + 0.0022 * math.sin(s / 85.0 + 1.1)


def elevation(s):    # m, a steady climb with gentle swells
    return 0.065 * s + 2.5 * math.sin(s / 140.0)


def road_samples():
    n = int(LENGTH / DS) + 1
    xs, ys, th = [0.0], [0.0], [0.0]
    for i in range(1, n):
        s = (i - 0.5) * DS
        t = th[-1] + curvature(s) * DS
        xs.append(xs[-1] + math.cos(t) * DS)
        ys.append(ys[-1] + math.sin(t) * DS)
        th.append(t)
    return np.array(xs), np.array(ys), np.array(th), np.arange(n) * DS


# ---------------- noise ----------------
rng = np.random.default_rng(SEED)
PERM = rng.permutation(4096)


def vnoise(x, y):
    """Value noise in [-1, 1], vectorised."""
    xi, yi = np.floor(x).astype(np.int64), np.floor(y).astype(np.int64)
    xf, yf = x - xi, y - yi
    u, v = xf * xf * (3 - 2 * xf), yf * yf * (3 - 2 * yf)

    def h(a, b):
        return PERM[(PERM[(a & 4095)] + b) & 4095] / 2047.5 - 1.0
    return ((h(xi, yi) * (1 - u) + h(xi + 1, yi) * u) * (1 - v) + (h(xi, yi + 1) * (1 - u) + h(xi + 1, yi + 1) * u) * v)


def fbm(x, y, octaves=5, ridged=False):
    tot, amp, f, norm = 0.0, 1.0, 1.0, 0.0
    for o in range(octaves):
        n = vnoise(x * f + o * 17.3, y * f - o * 9.1)
        if ridged:
            n = 1.0 - np.abs(n)
            n = n * n
        tot = tot + n * amp
        norm += amp
        amp *= 0.5
        f *= 2.03
    return tot / norm


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def _chute_table():
    knots = [(0.0, 0.0), (2.5, 0.0), (7.0, 0.95), (36.0, 0.95), (37.5, 4.5), (43.0, 4.5), (45.0, 0.5), (55.0, 0.85),
             (120.0, 0.7), (175.0, 0.3), (215.0, 0.0), (REACH_DOWN + 10, 0.0)]
    x = np.arange(0.0, REACH_DOWN + 10.0, 0.25)
    slope = np.interp(x, [k[0] for k in knots], [k[1] for k in knots])
    return x, -np.concatenate([[0.0], np.cumsum((slope[1:] + slope[:-1]) / 2 * 0.25)])


CHUTE_X, CHUTE_H = _chute_table()


def chute(s, dn):
    """The avalanche chute below the crash (m relative to the road, negative): steep snow, a rock cliff band of about
    25 m whose foot wanders along the slope, a long steep slope, a runout; scaled to reach the valley floor."""
    off = fbm(s / 45.0 + 21, 3.0, 2) * 6.0
    h = np.interp(dn - off * smoothstep(5, 30, dn), CHUTE_X, CHUTE_H)
    total = np.asarray([elevation(float(q)) for q in np.ravel(s)]).reshape(np.shape(s)) - FLOOR_BASE
    return h * total / -CHUTE_H[-1]


def chute_weight(s):
    return smoothstep(FALL_S[0] - 40, FALL_S[0], s) * (1 - smoothstep(FALL_S[1], FALL_S[1] + 40, s))


def smax(a, b, k):
    """A smooth maximum (the ground eases onto the valley floor rather than creasing into it)."""
    return 0.5 * (a + b + np.sqrt((a - b) ** 2 + k * k))


def valley_floor(X, Y):
    """The valley floor's height (m) at world X, Y (m): the same as build_far's."""
    return FLOOR_BASE + fbm(X / 500, Y / 500, 3) * 25


def corridor_height(s, d):
    """Height (m) relative to the road at distance s along it and d across (d > 0 uphill/left, d < 0 downhill/right)."""
    s, d = np.asarray(s, float), np.asarray(d, float)
    h = -0.04 * (d / HALF) ** 2  # crown
    up = np.maximum(d - (HALF + 1.0), 0.0)
    dn = np.maximum(-d - (HALF + 1.0), 0.0)
    # uphill: a plough berm, then the cliff (steep for ~40 m), then a gentler slope; rock noise grows with height
    cliff = np.where(up < 2.5, 0.0, np.where(up < 45, 1.55 * (up - 2.5), 1.55 * 42.5 + 0.55 * (up - 45)))
    h = h + 0.9 * smoothstep(0, 2.0, up) * (d > 0) + cliff
    h = h + (fbm(s / 28, d / 28, 5) * 7.0 + fbm(s / 7, d / 7, 3) * 1.4) * smoothstep(2.5, 12, up)
    # the rock face: ledges where the strata outcrop (the snow settles on them), every 2-4.5 m of height, and broken
    # rock between them
    face = smoothstep(3.0, 7.0, up) * (1 - smoothstep(42, 60, up))
    step = 3.4 + 2.0 * fbm(s / 30 + 7, d / 25 + 3.0, 2)
    hh = h / step
    fl = np.floor(hh)
    # how strongly the strata show changes along the road and up the face (some stretches are just broken rock)
    strength = np.clip(0.35 + 0.9 * (fbm(s / 22 + 11, d / 18, 3) + 0.15), 0.0, 1.0)
    h = h + ((fl + smoothstep(0.35, 1.0, hh - fl)) * step - h) * strength * face
    h = h + fbm(s / 2.5 + 3, d / 2.5, 3) * 0.45 * face
    # downhill: a small berm by the guardrail, then the drop into the valley; below the crash, the chute
    drop = -0.55 * np.maximum(dn - 2.5, 0.0) ** 1.2
    w = chute_weight(s) * (d < 0)
    if np.any(w > 0):
        drop = drop * (1 - w) + chute(s, dn) * w
        # the road's crown curve keeps falling away far out from the road; in the chute only the road keeps it
        h = h + w * 0.04 * ((d / HALF) ** 2 - np.clip(d / HALF, -1.0, 1.0) ** 2)
    h = h + np.where(d < 0, 0.45 * smoothstep(0, 1.0, dn) - 0.45 * smoothstep(1.6, 3.2, dn) + drop, 0.0)
    h = h + fbm(s / 30 + 40, d / 30, 5) * (5.0 - 2.5 * w) * smoothstep(3, 30, dn)   # the chute's snow lies smoother
    # bumps and rolls in the chute's snow (the car bounces on them)
    h = h + fbm(s / 6 + 9, d / 6, 3) * 0.9 * w * smoothstep(3, 10, dn)
    return h


def ground(xs, ys, th, zr, s_arr, s, d):
    """World position (m) of the ground at road coordinate (s, d): the corridor, eased onto the valley floor."""
    X, Y, Z, t = frame_at(xs, ys, th, zr, s_arr, s, d)
    G = Z + corridor_height(s, d)
    G = np.where(np.asarray(d) < 0, smax(G, valley_floor(X, Y), 8.0), G)
    return X, Y, G, t


def across():
    """Corridor columns: fine across the road, growing outward to REACH on the valley side; every 0.6 m up the rock
    face (so its ledges show), then growing."""
    d, out, step = HALF + 1.0, [], 0.5
    inner = list(np.arange(-(HALF + 1.0), HALF + 1.0 + 1e-6, 0.75))
    while d < REACH_DOWN:
        step = min(step * 1.17, 1.2 if d < 62 else 4.0)       # fine enough for the chute's cliff band
        d += step
        out.append(min(d, REACH_DOWN))
    up, d, step = [], HALF + 1.0, 0.6
    while d < REACH:
        if d - (HALF + 1.0) > 52:
            step = min(step * 1.2, 9.0)
        d += step
        up.append(min(d, REACH))
    return sorted(set([-x for x in out] + inner + up))


def frame_at(xs, ys, th, zr, s_arr, s, d):
    """World position (m) of road coordinate (s, d)."""
    i = np.clip((np.asarray(s) / DS).astype(int), 0, len(xs) - 2)
    f = np.asarray(s) / DS - i
    x = xs[i] * (1 - f) + xs[i + 1] * f
    y = ys[i] * (1 - f) + ys[i + 1] * f
    t = th[i] * (1 - f) + th[i + 1] * f
    z = zr[i] * (1 - f) + zr[i + 1] * f
    # left of the heading (uphill) is (sin t, -cos t) in Unreal's Y-right frame
    return x + np.sin(t) * d, y - np.cos(t) * d, z, t


# ---------------- OBJ writing (Unreal reads OBJ with Y mirrored, so write -Y) ----------------
def write_obj(path, groups):
    """groups: list of (material, verts (N,3) m, uvs (N,2), tris (M,3) indices CCW seen from outside in Unreal coords)."""
    with open(path, 'w', newline='\n') as fh:
        fh.write('# generated by hollow-acre/unreal/tools/make_mountain.py\n')
        vo = 0
        for mat, v, uv, tris in groups:
            fh.write(f'usemtl {mat}\ns 1\n')  # one smoothing group: smooth shading
            fh.write(''.join(f'v {a * 100:.2f} {-b * 100:.2f} {c * 100:.2f}\n' for a, b, c in v))
            fh.write(''.join(f'vt {a:.4f} {b:.4f}\n' for a, b in uv))
            # mirroring Y flips handedness, so reverse the winding to keep faces pointing out
            fh.write(''.join(f'f {c + vo + 1}/{c + vo + 1} {b + vo + 1}/{b + vo + 1} {a + vo + 1}/{a + vo + 1}\n' for a, b, c in tris))
            vo += len(v)


def grid_tris(rows, cols):
    t = []
    for r in range(rows - 1):
        for c in range(cols - 1):
            a, b, cc, dd = r * cols + c, r * cols + c + 1, (r + 1) * cols + c, (r + 1) * cols + c + 1
            t += [(a, cc, b), (b, cc, dd)]
    return np.array(t)


def build_corridor(xs, ys, th, zr, s_arr):
    cols = np.array(across())
    S, D = np.meshgrid(s_arr, cols, indexing='ij')
    X, Y, G, _ = ground(xs, ys, th, zr, s_arr, S, D)
    v = np.stack([X, Y, G], -1).reshape(-1, 3)
    uv = np.stack([S / 4.0, D / 4.0], -1).reshape(-1, 2)
    tris = grid_tris(len(s_arr), len(cols))
    # winding check: the first triangle must face up
    a, b, c = v[tris[0]]
    if np.cross(b - a, c - a)[2] < 0:
        tris = tris[:, ::-1]
    return v, uv, tris


TRACKS = (LANE - 0.74, LANE + 0.74, -LANE - 0.74, -LANE + 0.74)   # wheel paths (m across the road), each lane's pair


def ruts(S, D):
    """How far the packed snow is pressed down (m): 2-4 cm in the wheel paths, wandering a little along the road."""
    r = np.zeros_like(D)
    for i, c in enumerate(TRACKS):
        wob = 0.06 * np.sin(S / 17.0 + i * 1.7) + 0.04 * np.sin(S / 6.3 + i)
        depth = 0.03 + 0.01 * np.sin(S / 11.0 + i * 2.1)
        r += depth * np.exp(-((D - c - wob) / 0.17) ** 2)
    return r


def build_road(xs, ys, th, zr, s_arr):
    cols = np.linspace(-HALF, HALF, 29)
    S, D = np.meshgrid(s_arr, cols, indexing='ij')
    X, Y, Z, _ = frame_at(xs, ys, th, zr, s_arr, S, D)
    H = corridor_height(S, D) + 0.05 - ruts(S, D)   # deepest ruts stay above the terrain under the road
    v = np.stack([X, Y, Z + H], -1).reshape(-1, 3)
    uv = np.stack([(D + HALF) / (2 * HALF), S / 7.0], -1).reshape(-1, 2)
    tris = grid_tris(len(s_arr), len(cols))
    a, b, c = v[tris[0]]
    if np.cross(b - a, c - a)[2] < 0:
        tris = tris[:, ::-1]
    return v, uv, tris


def build_far(xs, ys, zr):
    """Valley floor and peaks on a coarse grid around the road; low near the road (hidden by the corridor and fog)."""
    cx, cy = xs.mean(), ys.mean()
    span, n = 14000.0, 140
    gx = np.linspace(cx - span / 2, cx + span / 2, n)
    gy = np.linspace(cy - span / 2, cy + span / 2, n)
    X, Y = np.meshgrid(gx, gy, indexing='ij')
    px, py = xs[::20], ys[::20]
    dist = np.min(np.hypot(X[..., None] - px, Y[..., None] - py), axis=-1)
    w = smoothstep(260, 1800, dist)
    peaks = fbm(X / 2600, Y / 2600, 6, ridged=True) * 1900 + fbm(X / 700, Y / 700, 4) * 160
    floor = valley_floor(X, Y)
    Z = floor + w * peaks
    v = np.stack([X, Y, Z], -1).reshape(-1, 3)
    uv = np.stack([X / 40.0, Y / 40.0], -1).reshape(-1, 2)
    tris = grid_tris(n, n)
    a, b, c = v[tris[0]]
    if np.cross(b - a, c - a)[2] < 0:
        tris = tris[:, ::-1]
    return v, uv, tris


# ---------------- textures (tiling, our own) ----------------
def tile_noise(size, cells, seed):
    """Seamless value noise in [0, 1] at a given cell count."""
    g = np.random.default_rng(seed).random((cells, cells))
    g = np.vstack([g, g[:1]])
    g = np.hstack([g, g[:, :1]])
    img = Image.fromarray((g * 255).astype(np.uint8)).resize((size + size // cells, size + size // cells), Image.BICUBIC)
    return np.asarray(img, dtype=np.float32)[:size, :size] / 255.0


def tile_fbm(size, seed, base=4, octaves=6):
    tot, amp, norm = np.zeros((size, size), np.float32), 1.0, 0.0
    for o in range(octaves):
        tot += tile_noise(size, base * 2 ** o, seed + o) * amp
        norm += amp
        amp *= 0.5
    return tot / norm


def normal_map(h, strength):
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * strength
    dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * strength
    n = np.stack([-dx, -dy, np.ones_like(h)], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    return Image.fromarray(((n * 0.5 + 0.5) * 255).astype(np.uint8))


def save_rgb(arr, name):
    Image.fromarray(np.clip(arr * 255, 0, 255).astype(np.uint8)).save(os.path.join(ART, name))


def make_textures():
    os.makedirs(ART, exist_ok=True)
    N = 1024
    # snow: soft wind ripples and drifts, a faint cold sparkle
    h = tile_fbm(N, 1, base=3) * 0.7 + tile_fbm(N, 9, base=24, octaves=3) * 0.3
    tone = 0.80 + (h - 0.5) * 0.08
    sparkle = (np.random.default_rng(3).random((N, N)) > 0.9985) * 0.12
    save_rgb(np.stack([tone * 0.95 + sparkle, tone * 0.98 + sparkle, tone * 1.04 + sparkle], -1), 'T_Snow.png')
    normal_map(h, 6.0).save(os.path.join(ART, 'T_SnowN.png'))
    # rock: dark granite with strata, cracks and lichen-dark patches
    h = tile_fbm(N, 20, base=6) * 0.6 + tile_fbm(N, 30, base=32, octaves=3) * 0.4
    yy = np.arange(N)[:, None] / N
    strata = 0.5 + 0.5 * np.sin((yy * 9 + tile_fbm(N, 40, base=2, octaves=2) * 1.5) * 2 * math.pi)
    cracks = np.clip(1 - np.abs(tile_noise(N, 10, 50) - 0.5) * 40, 0, 1) * 0.5
    g = 0.36 + h * 0.18 + strata * 0.05 - cracks * 0.14   # sRGB: about 15-20 % reflectance once linear, like granite
    save_rgb(np.stack([g * 0.98, g, g * 1.04], -1), 'T_Rock.png')
    normal_map(h + strata * 0.15 - cracks * 0.4, 14.0).save(os.path.join(ART, 'T_RockN.png'))
    # the road: packed snow, two darker compacted tyre tracks per lane (where the ruts are), a little grit; U across
    # the road, V along. Alpha holds the roughness: glossy, icy ruts and dull loose snow between them
    W, H = 512, 1024
    u = (np.arange(W)[None, :] + 0.5) / W
    base = 0.62 + (tile_fbm(H, 60, base=8)[:, :W] - 0.5) * 0.1
    tracks = np.zeros((H, W), np.float32)
    for c in TRACKS:
        tracks += np.exp(-((u - (c + HALF) / (2 * HALF)) / 0.03) ** 2)
    tracks = np.clip(tracks, 0, 1)
    wobble = tile_fbm(H, 70, base=4)[:, :W]
    road = base - tracks * (0.22 + wobble * 0.08)
    grit = (np.random.default_rng(8).random((H, W)) > 0.996) * -0.25
    road = np.clip(road + grit, 0, 1)
    rough = np.clip(0.72 - tracks * (0.42 + (wobble - 0.5) * 0.3), 0.12, 0.85)
    Image.fromarray(np.clip(np.stack([road * 0.95, road * 0.97, road * 1.02, rough], -1) * 255, 0, 255).astype(np.uint8),
                    'RGBA').save(os.path.join(ART, 'T_RoadSnow.png'))


def main():
    global FLOOR_BASE
    os.makedirs(GEN, exist_ok=True)
    xs, ys, th, s_arr = road_samples()
    zr = np.array([elevation(s) for s in s_arr])
    FLOOR_BASE = float(zr.mean() - FLOOR_DROP)
    write_obj(os.path.join(GEN, 'Terrain_Road.obj'), [('terrain',) + build_corridor(xs, ys, th, zr, s_arr)])
    write_obj(os.path.join(GEN, 'Road.obj'), [('road',) + build_road(xs, ys, th, zr, s_arr)])
    write_obj(os.path.join(GEN, 'Terrain_Far.obj'), [('far',) + build_far(xs, ys, zr)])

    r = random.Random(SEED)
    out = {'path': [], 'trees': [], 'poles': [], 'posts': []}
    # the car's path: the right lane, every 2 m from the start of the scene
    for s in s_arr[s_arr >= CAR_START - 1e-6]:
        x, y, z, t = frame_at(xs, ys, th, zr, s_arr, s, LANE)
        out['path'].append([float(x) * 100, float(y) * 100, float(z + corridor_height(s, LANE)) * 100])
    # pines: below the road on the valley side and above the cliff, not on the cliff face or the road
    tries = 0
    while len(out['trees']) < 3400 and tries < 60000:
        tries += 1
        s = r.uniform(0, LENGTH)
        d = r.uniform(9, REACH - 4) if r.random() < 0.42 else -r.uniform(9, REACH_DOWN - 4)
        if 0 < d < 52 and r.random() > 0.08:  # the cliff face stays mostly bare
            continue
        if CRASH_CLEAR[0] < s < CRASH_CLEAR[1] and CRASH_CLEAR[2] < d < 0:   # the car's fall line in Part 2's opening
            continue
        x, y, z, t = ground(xs, ys, th, zr, s_arr, s, d)
        _, _, zs, _ = ground(xs, ys, th, zr, s_arr, s, d + (1.5 if d > 0 else -1.5))
        if abs(float(zs) - float(z)) / 1.5 > 1.25 and r.random() > 0.15:  # too steep to hold a tree
            continue
        # a spruce variant (4.5 to 25 m tall, tools/blender/spruce.py), mostly mid-sized, a few saplings and giants
        v = r.choices(range(7), weights=(1.0, 2.0, 3.0, 3.0, 3.0, 2.0, 1.5))[0]
        out['trees'].append([float(x) * 100, float(y) * 100, float(z - 0.3) * 100, r.uniform(0, 360), r.uniform(0.85, 1.15), v])
    # Part 2's opening: the crash point, and how far the car falls (to the valley floor below the chute)
    xi, yi, zi, ti = frame_at(xs, ys, th, zr, s_arr, CRASH_S, LANE)
    _, _, zf, _ = ground(xs, ys, th, zr, s_arr, CRASH_S + 12, -(REACH_DOWN - 10))
    out['crash'] = {'s': CRASH_S, 'start_cm': (CRASH_S - CAR_START) * 100, 'impact': [float(xi) * 100, float(yi) * 100, float(zi + corridor_height(CRASH_S, LANE)) * 100],
                    'fall_m': float(zi - zf)}
    print('crash: the road at %.1f m, the chute runs out at %.1f m: a %.0f m fall' % (zi, zf, zi - zf))
    # snow poles on both edges every 30 m
    for s in np.arange(10, LENGTH - 10, 30.0):
        for d in (HALF + 0.8, -(HALF + 1.6)):
            x, y, z, t = frame_at(xs, ys, th, zr, s_arr, s, d)
            out['poles'].append([float(x) * 100, float(y) * 100, float(z + corridor_height(s, d)) * 100, math.degrees(t), 1.0])
    # the guardrail (rail, snow on it, posts every 1.905 m) and its smashed-through gap
    import make_roadside
    make_roadside.build(xs, ys, th, zr, s_arr, out)
    json.dump(out, open(os.path.join(GEN, 'mountain.json'), 'w'))
    make_textures()
    print('mountain: path %d, trees %d, poles %d, posts %d' % tuple(len(out[k]) for k in ('path', 'trees', 'poles', 'posts')))


if __name__ == '__main__':
    main()
