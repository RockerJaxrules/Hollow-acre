"""Hollow Acre pixel pipeline: the one place every new texture goes through.

Rules it enforces (the game's art rules, so nothing slips in that looks modern or muddy):
  - a LOCKED palette per asset: every pixel is one of a short list of colours, or fully transparent
  - HARD alpha: alpha is 0 or 255, never anything in between (no soft edges, no anti-aliasing)
  - shading by ORDERED DITHER (4x4 Bayer) between neighbouring palette steps, never by gradients
  - INTEGER scaling only (nearest neighbour; every source pixel becomes an exact k x k block)
  - grids are NumPy arrays of palette indices; -1 means transparent

Also here: palette extraction from a reference picture (k-means), indexed PNG output (pypng),
sprite sheets, animated GIF previews (imageio) and a contact sheet (matplotlib) for checking loops.
"""
import numpy as np
from PIL import Image

BAYER4 = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], dtype=float) / 16.0
T = -1   # transparent


def hexrgb(h):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


class Palette:
    """A locked, ordered palette: index 0 is darkest. Shading picks between neighbouring entries."""
    def __init__(self, name, colours):
        self.name = name; self.rgb = np.array([hexrgb(c) if isinstance(c, str) else c for c in colours], dtype=np.uint8)
    def __len__(self): return len(self.rgb)

    def ramp(self, light, x, y, lo=0, hi=None):
        """Ordered-dither a continuous light value 0..1 onto the palette steps lo..hi at pixel (x, y)."""
        hi = len(self) - 1 if hi is None else hi; v = lo + max(0.0, min(1.0, light)) * (hi - lo)
        base = int(np.floor(v)); frac = v - base
        return min(hi, base + (1 if frac > BAYER4[y % 4, x % 4] else 0))


def kmeans_palette(path, k=8, seed=0):
    """Pull the k dominant colours out of a reference image, darkest first (for locking a mood palette)."""
    from sklearn.cluster import KMeans
    im = np.array(Image.open(path).convert('RGBA')); px = im[im[..., 3] > 127][:, :3].astype(float)
    if len(px) > 40000: px = px[np.random.default_rng(seed).choice(len(px), 40000, replace=False)]
    km = KMeans(n_clusters=k, n_init=4, random_state=seed).fit(px); c = km.cluster_centers_.round().astype(int)
    return [tuple(int(v) for v in x) for x in sorted(c, key=lambda q: 0.299 * q[0] + 0.587 * q[1] + 0.114 * q[2])]


def to_rgba(grid, pal):
    """Index grid (-1 = transparent) to an RGBA array with hard alpha."""
    g = np.asarray(grid); out = np.zeros(g.shape + (4,), dtype=np.uint8)
    m = g >= 0; out[m, :3] = pal.rgb[g[m]]; out[m, 3] = 255; return out


def lock(rgba, pal, alpha_cut=128):
    """Force any RGBA image onto the palette with hard alpha (nearest colour, no dithering)."""
    a = np.asarray(rgba).astype(int); d = ((a[..., None, :3] - pal.rgb[None, None].astype(int)) ** 2).sum(-1)
    g = d.argmin(-1); g[a[..., 3] < alpha_cut] = T; return g


def upscale(rgba, k):
    """Integer scale: each pixel becomes an exact k x k block."""
    return np.kron(np.asarray(rgba), np.ones((k, k, 1), dtype=np.uint8))


def outline(grid, idx, where=None):
    """Draw a one-pixel outline of palette index idx round the opaque shape (4-neighbour), optionally only where(x,y)."""
    g = np.asarray(grid).copy(); op = g >= 0; H, W = g.shape
    edge = np.zeros_like(op)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        sh = np.zeros_like(op); ys = slice(max(dy, 0), H + min(dy, 0)); yd = slice(max(-dy, 0), H + min(-dy, 0))
        xs = slice(max(dx, 0), W + min(dx, 0)); xd = slice(max(-dx, 0), W + min(-dx, 0)); sh[yd, xd] = op[ys, xs]; edge |= sh
    edge &= ~op
    for y, x in zip(*np.nonzero(edge)):
        if where is None or where(x, y): g[y, x] = idx
    return g


def check(rgba, pal):
    """Verify the rules: hard alpha, palette-only colours. Returns (ok, report)."""
    a = np.asarray(rgba); alphas = set(np.unique(a[..., 3]).tolist()); op = a[a[..., 3] == 255][:, :3]
    used = {tuple(c) for c in np.unique(op.reshape(-1, 3), axis=0).tolist()} if len(op) else set()
    allowed = {tuple(c) for c in pal.rgb.tolist()}
    ok = alphas <= {0, 255} and used <= allowed
    return ok, {'alpha_values': sorted(alphas), 'colours_used': len(used), 'off_palette': sorted(used - allowed)}


def save_png(rgba, path):
    Image.fromarray(np.asarray(rgba), 'RGBA').save(path)


def save_indexed(grid, pal, path):
    """Write an indexed (palette) PNG with pypng; index 0 of the file is the transparent slot."""
    import png
    g = np.asarray(grid) + 1; plte = [(0, 0, 0)] + [tuple(int(v) for v in c) for c in pal.rgb]; trns = [0] + [255] * len(pal)
    w = png.Writer(width=g.shape[1], height=g.shape[0], palette=[p + (t,) for p, t in zip(plte, trns)], bitdepth=8)
    with open(path, 'wb') as f: w.write(f, g.astype(np.uint8).tolist())


def sheet(frames):
    """Frames side by side into one strip."""
    return np.concatenate([np.asarray(f) for f in frames], axis=1)


def save_gif(frames, path, k=8, ms=160, bg=(24, 22, 28)):
    import imageio.v2 as iio
    out = []
    for f in frames:
        f = upscale(f, k); b = np.empty(f.shape[:2] + (3,), dtype=np.uint8); b[:] = bg; m = f[..., 3] == 255; b[m] = f[m, :3]; out.append(b)
    iio.mimsave(path, out, duration=ms / 1000, loop=0)


def contact(frames, path, k=8, title=''):
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
    fig, ax = plt.subplots(1, len(frames), figsize=(2.6 * len(frames), 2.9), dpi=100); fig.patch.set_facecolor('#1a181e')
    for i, (a, f) in enumerate(zip(np.atleast_1d(ax), frames)):
        a.imshow(upscale(f, k), interpolation='nearest'); a.set_title(f'frame {i}', color='#ddd', fontsize=9); a.axis('off')
    if title: fig.suptitle(title, color='#eee', fontsize=10)
    fig.savefig(path, facecolor=fig.get_facecolor(), bbox_inches='tight'); plt.close(fig)
