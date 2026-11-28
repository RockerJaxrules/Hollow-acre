"""Blood that behaves as a liquid (the owner: "blood is a liquid: it smears, it drips, it puddles"): the textures for the
decals the game lays where blood lands (BloodFX.cpp), each one grown over time rather than appearing whole.

Each texture's channels (linear, not colour):
  R  how much blood is there (its shape, soft at the edge)
  G  when it gets there (0 first .. 1 last): the material shows only what has arrived by its Grow, so a run crawls down,
     a smear drags out, a pool spreads, a splat flies out from its middle
  B  how thick it is (thick: darker and glossier)

T_BloodSplat  a drop hitting a surface: a blob with a ragged rim, satellite droplets and a few spatter streaks flung out
T_BloodRun    a drip running down a wall (top at the top of the image), a little wavy, a bead at its tip
T_BloodSmear  a hand dragged through it (left to right): four claw-wide streaks, broken and thinning out
T_BloodPool   a pool spreading on snow: lobed and uneven, thick in its middle, soaking out at its edge

Run: python make_blood_decals.py <SourceArt dir>"""
import os
import sys

import numpy as np
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
RNG = np.random.default_rng(23)


def noise(h, w, scale, octaves=4, seed=0):
    """Smooth value noise 0..1."""
    r = np.random.default_rng(seed)
    out = np.zeros((h, w))
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        s = max(2, int(scale * 2 ** o))
        g = r.random((s + 1, s + 1))
        ys = np.linspace(0, s, h, endpoint=False)
        xs = np.linspace(0, s, w, endpoint=False)
        y0, x0 = ys.astype(int), xs.astype(int)
        fy, fx = ys - y0, xs - x0
        fy, fx = fy * fy * (3 - 2 * fy), fx * fx * (3 - 2 * fx)
        a = g[y0][:, x0]
        b = g[y0][:, x0 + 1]
        c = g[y0 + 1][:, x0]
        d = g[y0 + 1][:, x0 + 1]
        v = (a * (1 - fx) + b * fx) * (1 - fy)[:, None] + (c * (1 - fx) + d * fx) * fy[:, None]
        out += v * amp
        tot += amp
        amp *= 0.5
    return out / tot


def soft(x, edge):
    return np.clip(x / edge, 0, 1)


def save(name, R, G, B):
    img = np.stack([np.clip(R, 0, 1), np.clip(G, 0, 1), np.clip(B, 0, 1)], axis=-1)
    Image.fromarray((img * 255 + 0.5).astype(np.uint8), 'RGB').save(os.path.join(OUT, name + '.png'))
    print('blood: wrote %s.png %dx%d' % (name, img.shape[1], img.shape[0]))


def splat(n=512):
    y, x = np.mgrid[0:n, 0:n] / n - 0.5
    r = np.hypot(x, y)
    a = np.arctan2(y, x)
    rim = 0.17 + 0.05 * (noise(n, n, 6, seed=1) - 0.5) + 0.03 * np.sin(a * 7 + 1.3) + 0.02 * np.sin(a * 13)
    R = soft(rim - r, 0.012)
    G = np.clip(r / 0.48, 0, 1)
    # satellite droplets and spatter streaks flung out from the middle
    for k in range(26):
        ang = RNG.uniform(0, 2 * np.pi)
        d = RNG.uniform(0.2, 0.44)
        cx, cy = np.cos(ang) * d, np.sin(ang) * d
        rad = RNG.uniform(0.006, 0.022) * (1.2 - d)
        # stretched along the throw
        u = (x - cx) * np.cos(ang) + (y - cy) * np.sin(ang)
        v = -(x - cx) * np.sin(ang) + (y - cy) * np.cos(ang)
        drop = soft(1 - np.hypot(u / (rad * RNG.uniform(1.4, 3.2)), v / rad), 0.15)
        R = np.maximum(R, drop)
    for k in range(7):
        ang = RNG.uniform(0, 2 * np.pi)
        u = x * np.cos(ang) + y * np.sin(ang)
        v = -x * np.sin(ang) + y * np.cos(ang)
        streak = soft(0.006 - np.abs(v) * (1.0 + 4 * np.clip(u - 0.15, 0, 1)), 0.003) * (u > 0.12) * (u < RNG.uniform(0.3, 0.46))
        R = np.maximum(R, streak)
    B = np.clip(1.0 - r / 0.2, 0, 1) * R
    save('T_BloodSplat', R, G, B)


def run(w=128, h=1024):
    y, x = np.mgrid[0:h, 0:w] / np.array([h, w], float)[:, None, None]
    wav = 0.5 + 0.06 * np.sin(y * 9.0 + 1.0) + 0.04 * (noise(h, 1, 5, seed=4)[:, :1] - 0.5)
    width = 0.09 + 0.05 * (1 - y) + 0.04 * noise(h, 1, 7, seed=5)[:, :1]
    R = soft(width - np.abs(x - wav), 0.02)
    # the bead at the tip (it gathers there before it runs on)
    tip = 0.93
    bead = soft(1 - np.hypot((x - wav) / 0.2, (y - tip) / 0.035), 0.2)
    R = np.maximum(R * (y < tip), bead)
    G = np.clip(y / 0.96, 0, 1)
    B = np.clip(0.35 + 0.65 * bead + 0.2 * (1 - y), 0, 1) * R
    save('T_BloodRun', R, G, B)


def smear(w=1024, h=256):
    y, x = np.mgrid[0:h, 0:w] / np.array([h, w], float)[:, None, None]
    R = np.zeros((h, w))
    B = np.zeros((h, w))
    for k, cy in enumerate((0.22, 0.42, 0.6, 0.78)):
        c = cy + 0.03 * np.sin(x * 6 + k) + 0.02 * (noise(1, w, 9, seed=10 + k)[0] - 0.5)
        width = 0.055 * (1 - 0.6 * x) + 0.015 * noise(1, w, 13, seed=20 + k)[0]
        streak = soft(width - np.abs(y - c), 0.02)
        breakup = soft(noise(h, w, 18, seed=30 + k) - (0.25 + 0.55 * x), 0.08)       # drying out and breaking up as it goes
        streak = streak * breakup
        R = np.maximum(R, streak)
        B = np.maximum(B, streak * (1 - x))
    # where the hand first landed: a full palm print of it
    palm = soft(1 - np.hypot((x - 0.06) / 0.07, (y - 0.5) / 0.38), 0.25)
    R = np.maximum(R, palm)
    B = np.maximum(B, palm)
    G = np.clip(x / 0.97, 0, 1)
    save('T_BloodSmear', R, G, B)


def pool(n=512):
    y, x = np.mgrid[0:n, 0:n] / n - 0.5
    r = np.hypot(x, y)
    a = np.arctan2(y, x)
    lobes = 0.36 + 0.06 * np.sin(a * 3 + 0.4) + 0.04 * np.sin(a * 5 + 2.0) + 0.06 * (noise(n, n, 4, seed=40) - 0.5)
    R = soft(lobes - r, 0.03)
    # soaking out into the snow at the edge: thinner, more broken
    R = R * (0.55 + 0.45 * soft(lobes - r - 0.04, 0.03)) + 0.25 * soft(lobes + 0.04 - r, 0.03) * noise(n, n, 22, seed=41)
    G = np.clip(r / lobes / 1.05 + 0.08 * (noise(n, n, 8, seed=42) - 0.5), 0, 1)
    B = np.clip(1 - r / (lobes * 0.8), 0, 1) * R
    save('T_BloodPool', R, G, B)


os.makedirs(OUT, exist_ok=True)
splat()
run()
smear()
pool()
