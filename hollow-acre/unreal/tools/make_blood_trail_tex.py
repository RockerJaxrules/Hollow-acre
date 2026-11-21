"""A blood trail in snow, for the decal at the smashed gap in the guardrail (the owner chose realistic gore there): a
pool where whoever went over lay, a smear dragged from it toward the edge (streaked along the drag, broken where the
body lifted, four claw-drag lines through it), drops and spatter round it; old blood, dark where thick, and the pink
halo blood leaves where it soaks into snow. U along the trail (about 5 m: the pool at the road's end), V across it
(about 1.25 m). Writes SourceArt/T_BloodTrail.png (sRGB colour, alpha where the blood is).
Run: python hollow-acre/unreal/tools/make_blood_trail_tex.py
"""
import os

import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'HollowAcre', 'SourceArt', 'T_BloodTrail.png')
W, H = 2048, 512                   # 410 px a metre either way


def blur(a, r):
    return np.asarray(Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r)), np.float32) / 255


def noise(rng, scale, sx=1.0, sy=1.0):
    """Smooth noise: random values on a coarse grid, resized up (sx, sy stretch it along u and v)."""
    gw, gh = max(2, int(W / scale / sx)), max(2, int(H / scale / sy))
    g = (rng.random((gh, gw)) * 255).astype(np.uint8)
    return np.asarray(Image.fromarray(g).resize((W, H), Image.BICUBIC), np.float32) / 255


def main():
    rng = np.random.default_rng(13)
    u = np.linspace(0, 1, W)[None, :]
    v = np.linspace(0, 1, H)[:, None]
    m = np.zeros((H, W), np.float32)
    # the pool, ragged at its edge
    pu, pv = 0.12, 0.5
    d = np.sqrt(((u - pu) * W / 125.0) ** 2 + ((v - pv) * H / 115.0) ** 2)
    pool = np.clip((1.0 - d + 0.35 * (noise(rng, 18) - 0.5)) / 0.15, 0, 1)
    m = np.maximum(m, pool)
    # the drag: from the pool to the edge, wavering, narrowing, streaked along its length, broken in places
    centre = 0.5 + 0.06 * np.sin(u * 7.0 + 0.4) + 0.025 * np.sin(u * 19.0)
    width = (0.2 - 0.11 * np.clip((u - 0.15) / 0.7, 0, 1)) * (0.85 + 0.3 * noise(rng, 60, 3, 1)[H // 2][None, :])
    band = np.clip((width / 2 - np.abs(v - centre)) / 0.015, 0, 1) * (u > 0.14) * np.clip((0.92 - u) / 0.12, 0, 1)
    streaks = noise(rng, 5, 30, 1)                    # long along u, fine across v
    broken = np.clip((noise(rng, 70, 2, 1) - 0.32) / 0.12, 0, 1)
    m = np.maximum(m, band * (0.35 + 0.65 * streaks) * (0.4 + 0.6 * broken))
    # claws dragged through it
    for off in (-0.05, -0.017, 0.017, 0.05):
        line = np.clip((0.005 - np.abs(v - centre - off)) / 0.003, 0, 1) * ((u > 0.3) & (u < 0.62))
        m = np.maximum(m, line * 0.9 * (0.6 + 0.4 * noise(rng, 8, 6, 1)))
    # drops and spatter, densest round the pool, a few strung along the drag
    yy, xx = np.mgrid[0:H, 0:W]
    for i in range(170):
        if i < 90:
            cu, cv = pu + rng.normal(0, 0.05), pv + rng.normal(0, 0.12)
        else:
            cu = rng.uniform(0.15, 0.95)
            cv = 0.5 + 0.06 * np.sin(cu * 7.0 + 0.4) + rng.normal(0, 0.09)
        r = rng.uniform(2.0, 10.0) * (1.4 if i < 20 else 1.0)
        cx, cy = cu * W, cv * H
        x0, x1, y0, y1 = int(max(0, cx - 3 * r)), int(min(W, cx + 3 * r)), int(max(0, cy - 3 * r)), int(min(H, cy + 3 * r))
        if x1 <= x0 or y1 <= y0:
            continue
        stretch = rng.uniform(1.0, 2.6)                 # flung: drawn out along the drag
        sub = np.sqrt(((xx[y0:y1, x0:x1] - cx) / (r * stretch)) ** 2 + ((yy[y0:y1, x0:x1] - cy) / r) ** 2)
        m[y0:y1, x0:x1] = np.maximum(m[y0:y1, x0:x1], np.clip((1.0 - sub) / 0.25, 0, 1) * rng.uniform(0.7, 1.0))
    # soaked into the snow round every mark: a soft, lighter halo
    halo = np.clip(blur(m, 6) * 1.6, 0, 1)
    thick = blur(m, 2) ** 1.5
    core = np.array([80, 8, 11], np.float32) / 255     # old, dark
    thin = np.array([128, 18, 20], np.float32) / 255
    pink = np.array([176, 64, 74], np.float32) / 255
    rgb = pink[None, None, :] * (1 - m[..., None]) + (thin[None, None, :] * (1 - thick[..., None]) + core[None, None, :] * thick[..., None]) * m[..., None]
    grain = noise(rng, 1.5)                           # the snow's grain showing through it
    alpha = np.clip(np.maximum(m * 0.97, halo * 0.38) * (0.78 + 0.22 * grain), 0, 1)
    img = np.concatenate([np.clip(rgb, 0, 1), alpha[..., None]], -1)
    Image.fromarray((img * 255).astype(np.uint8), 'RGBA').save(OUT)
    print('wrote', OUT)


if __name__ == '__main__':
    main()
