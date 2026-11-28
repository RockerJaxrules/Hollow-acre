"""An old notebook page for Part 2's journal (the HUD draws her pages on it): ruled paper gone yellow-grey with age, its
fibres, foxing (small brown spots), a water stain's ring, a fold across it, its edges darkened, worn and a little torn
(alpha). Looked at: photographs of old pocket notebooks and ledgers kept in cabins (foxing, tide-line stains, soft
greyed edges). Writes <out>/T_JournalPaper.png (1024 x 1280, RGBA).
usage: python make_journal_paper.py <out dir>"""
import os
import sys

import numpy as np
from PIL import Image

W, H = 1024, 1280
rng = np.random.default_rng(31)


def blur(a, r):
    k = np.exp(-np.linspace(-2.5, 2.5, 2 * r + 1) ** 2)
    k /= k.sum()
    a = np.apply_along_axis(lambda v: np.convolve(v, k, mode='same'), 0, a)
    return np.apply_along_axis(lambda v: np.convolve(v, k, mode='same'), 1, a)


def fbm(octaves, base):
    out = np.zeros((H, W), np.float32)
    amp = 1.0
    for o in range(octaves):
        r = max(1, base >> o)
        n = rng.standard_normal((H // r + 2, W // r + 2)).astype(np.float32)
        n = np.array(Image.fromarray(n).resize((W, H), Image.BICUBIC))
        out += n * amp
        amp *= 0.55
    return out / 2.0


y, x = np.mgrid[0:H, 0:W].astype(np.float32)
paper = np.array([0.80, 0.75, 0.62], np.float32)
col = np.ones((H, W, 3), np.float32) * paper
# (its tone: mottled with age, fibres)
mott = fbm(5, 128)
col *= (1.0 + 0.045 * mott)[..., None]
fib = blur(rng.standard_normal((H, W)).astype(np.float32), 1)
col *= (1.0 + 0.03 * fib)[..., None]
# (edges greyed and darkened by handling)
ex = np.minimum(x, W - 1 - x) / W
ey = np.minimum(y, H - 1 - y) / H
edge = np.clip(np.minimum(ex, ey) * 9.0, 0, 1)
col *= (0.72 + 0.28 * edge ** 0.7)[..., None]
col[..., 2] *= (0.93 + 0.07 * edge)
# (foxing: small rust-brown spots)
for _ in range(70):
    cx, cy = rng.uniform(0, W), rng.uniform(0, H)
    r = rng.uniform(2, 9) if rng.random() < 0.85 else rng.uniform(10, 22)
    d = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
    m = np.clip(1.0 - d / r, 0, 1) ** 1.5 * rng.uniform(0.15, 0.4)
    col = col * (1 - m[..., None]) + np.array([0.45, 0.31, 0.18]) * m[..., None] * col.mean() / 0.7
# (a water stain: a tide line ring and a faint inside)
cx, cy, r = W * 0.72, H * 0.78, 190
d = np.sqrt((x - cx) ** 2 * 1.2 + (y - cy) ** 2)
wob = fbm(3, 64)
ring = np.exp(-((d - r * (1.0 + 0.09 * wob)) / 11.0) ** 2) * 0.2 + np.clip(1 - d / r, 0, 1) * 0.05
ring *= np.clip(1.0 + 0.8 * fbm(3, 24), 0.2, 2.0)
col *= (1.0 - 0.5 * np.clip(ring, 0, 1))[..., None] * np.array([1.0, 0.97, 0.9])
# (a fold across the middle: a soft crease, light above, shade below)
fy = H * 0.47 + 6 * np.sin(x / W * 3.0)
crease = np.exp(-((y - fy) / 3.0) ** 2)
col *= (1.0 - 0.10 * crease + 0.04 * np.exp(-((y - fy + 6) / 5.0) ** 2))[..., None]
# (ruled lines, faded blue, and the red margin)
for k in range(1, 24):
    ly = 120 + k * 46
    col *= (1.0 - 0.18 * np.exp(-((y - ly) / 1.1) ** 2) * (edge > 0.05))[..., None] * np.array([1.0, 1.0, 1.0])
    col[..., 0] -= 0.05 * np.exp(-((y - ly) / 1.1) ** 2) * (edge > 0.05)
col[..., 1:] *= (1.0 - 0.25 * np.exp(-((x - 120) / 1.2) ** 2))[..., None]
# (worn, a little torn: alpha nibbled at the edges)
nib = fbm(4, 16) * 0.012
a = np.clip((np.minimum(ex, ey) - 0.004 - np.abs(nib)) * 400.0, 0, 1)
img = np.dstack([np.clip(col, 0, 1), a]) * 255
out = sys.argv[1]
os.makedirs(out, exist_ok=True)
Image.fromarray(img.astype(np.uint8), 'RGBA').save(os.path.join(out, 'T_JournalPaper.png'))
print('wrote T_JournalPaper.png')
