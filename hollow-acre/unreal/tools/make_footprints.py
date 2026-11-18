"""Footprint textures for the snow (decals in Part 2's play): a winter boot's print (the player's) and a long bare foot's
(the husk's: "Human feet, but too long, and too far apart", her journal). Each print is pressed into fresh snow: a
height field (the sole's tread pressed in, the toe deeper than the heel arch, a soft raised rim of pushed snow round it,
crumbled edges), turned into a tangent-space normal map and a mask (where the decal shows, with the rim fading out),
plus a darkening for the shadowed, compacted bottom.

How real prints read (photos of boot and bare-foot prints in fresh powder): sharp walls where the sole cut in, a
compacted floor that is smoother and a little greyer than the snow round it, lugs of the tread as small blocks, a lip
of loose snow kicked forward at the toe.

Writes <out dir>/T_Print<Kind>_N.png, T_Print<Kind>_M.png (R: mask, G: depth 0..1), 512 x 512, the print along +Y
(toe at the top). usage: python make_footprints.py <out dir>"""
import os
import sys

import numpy as np
from PIL import Image

N = 512


def field():
    y, x = np.mgrid[0:N, 0:N].astype(np.float32)
    return (x + 0.5) / N * 2 - 1, (y + 0.5) / N * 2 - 1      # -1..1, y down


def smooth(a, r):
    k = np.exp(-np.linspace(-2, 2, 2 * r + 1) ** 2)
    k /= k.sum()
    a = np.apply_along_axis(lambda v: np.convolve(v, k, mode='same'), 0, a)
    return np.apply_along_axis(lambda v: np.convolve(v, k, mode='same'), 1, a)


def noise(seed, scale):
    rng = np.random.default_rng(seed)
    n = rng.standard_normal((N, N)).astype(np.float32)
    return smooth(n, scale) * scale


def boot():
    x, y = field()
    # an outline: a boot sole about 30 x 11 cm in a 40 cm square: wide at the ball, narrow at the arch, round heel
    yy = -y                              # toe up
    half = np.where(yy > 0.15, 0.30 - 0.16 * np.clip((yy - 0.45) / 0.3, 0, 1) ** 2,
                    np.where(yy > -0.25, 0.22, 0.26 - 0.2 * np.clip((-yy - 0.5) / 0.25, 0, 1) ** 2))
    inside = (np.abs(x) < half) & (yy < 0.78) & (yy > -0.78)
    d = smooth(inside.astype(np.float32), 6)
    # the tread: lug blocks
    lug = ((np.sin(x * 38) > 0.2) & (np.sin(yy * 30) > -0.1)).astype(np.float32)
    depth = d * (0.75 + 0.18 * smooth(lug, 2)) * (1.0 + 0.15 * np.clip(yy, 0, 1))
    return depth, inside


def bare():
    x, y = field()
    yy = -y
    # a long, narrow foot (about 38 cm): a broad ball, the arch touching only on its outer side, a thin heel, and long
    # toes reaching out of the ball, splayed apart
    ball = ((x - 0.03) / 0.2) ** 2 + ((yy - 0.38) / 0.27) ** 2 < 1.0
    heel = (x / 0.145) ** 2 + ((yy + 0.6) / 0.24) ** 2 < 1.0
    arch = (x > -0.075 + 0.04 * np.exp(-((yy + 0.1) / 0.25) ** 2)) & (x < 0.16) & (yy > -0.62) & (yy < 0.38)
    toes = np.zeros_like(x, dtype=bool)
    for tx, ty, r in ((-0.13, 0.74, 0.06), (-0.04, 0.8, 0.055), (0.05, 0.79, 0.05), (0.13, 0.74, 0.046), (0.2, 0.66, 0.042)):
        toes |= ((x - tx) / r) ** 2 + ((yy - ty) / (r * 2.1)) ** 2 < 1.0
    inside = ball | heel | arch | toes
    d = smooth(inside.astype(np.float32), 5)
    depth = d * (0.8 + 0.25 * np.exp(-((yy - 0.38) / 0.2) ** 2))
    return depth, inside


def write(kind, depth, inside, out, seed):
    depth = np.clip(depth + noise(seed, 3) * 0.03 * smooth(inside.astype(np.float32), 10), 0, None)
    # the rim of pushed-up snow round it, and crumbles
    near = smooth(inside.astype(np.float32), 22)
    rim = np.clip(near - smooth(inside.astype(np.float32), 4), 0, 1) * 0.35
    h = -depth + rim + noise(seed + 1, 2) * 0.02 * near
    gy, gx = np.gradient(h * 18.0)
    nx, ny, nz = -gx, gy, np.ones_like(gx)
    l = np.sqrt(nx * nx + ny * ny + nz * nz)
    nrm = np.stack([nx / l, ny / l, nz / l], -1) * 0.5 + 0.5
    mask = np.clip(near * 1.6, 0, 1)
    Image.fromarray((nrm * 255).astype(np.uint8)).save(os.path.join(out, 'T_Print%s_N.png' % kind))
    m = np.stack([mask, np.clip(depth, 0, 1), np.zeros_like(mask)], -1)
    Image.fromarray((m * 255).astype(np.uint8)).save(os.path.join(out, 'T_Print%s_M.png' % kind))
    print('wrote', kind)


if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    write('Boot', *boot(), out, 11)
    write('Bare', *bare(), out, 23)
