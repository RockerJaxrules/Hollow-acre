"""The husk's body skin without the briefs MetaHuman bakes into it, in its colour and in its normal map.

The cloth (grey, and the blue-grey waistband) is found in the colour by its lack of colour against the skin. There the
colour is filled with the skin around it (spread smoothly in) plus a fine pore grain, and the normal map's cloth folds and
seams are laid flat (the same grain as a faint bump). Saved/Generated/Husk/T_Body_BC.png and T_Body_N.png (exported by
Scripts/husk_export_textures.py) -> SourceArt/T_HuskBodyC.png and T_HuskBodyN.png (4096).
Run with Python 3 + numpy + Pillow: python hollow-acre/unreal/tools/husk_skin.py
"""
import os

import numpy as np
from PIL import Image, ImageFilter

Image.MAX_IMAGE_PIXELS = None
HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.join(HERE, '..', 'HollowAcre')
GEN = os.path.join(PROJ, 'Saved', 'Generated', 'Husk')
OUT_C = os.path.join(PROJ, 'SourceArt', 'T_HuskBodyC.png')
OUT_N = os.path.join(PROJ, 'SourceArt', 'T_HuskBodyN.png')
SIZE = 4096


def blur(a, r):
    """Gaussian blur of a 0..1 float image (one channel)."""
    return np.asarray(Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r)), np.float32) / 255


def blurf(a, r):
    """Gaussian blur keeping float precision (for small signed values): separable, wrapping at the edges."""
    n = int(np.ceil(r * 3))
    w = np.exp(-0.5 * (np.arange(-n, n + 1) / r) ** 2)
    w /= w.sum()
    for ax in (0, 1):
        a = sum(wi * np.roll(a, i - n, ax) for i, wi in enumerate(w))
    return a.astype(np.float32)


def grain(shape, seed=7):
    """Fine skin grain: two octaves of smoothed noise, about -1..1."""
    rng = np.random.default_rng(seed)
    g = blurf(rng.standard_normal(shape).astype(np.float32), 1.0) * 1.6
    g += blurf(rng.standard_normal(shape).astype(np.float32), 3.0) * 2.5
    return g / max(float(np.abs(g).max()), 1e-6) * 2.0


def main():
    im = np.asarray(Image.open(os.path.join(GEN, 'T_Body_BC.png')).convert('RGB').resize((SIZE, SIZE), Image.LANCZOS), np.float32) / 255
    H, W, _ = im.shape
    mx, mn = im.max(-1), im.min(-1)
    sat = (mx - mn) / np.maximum(mx, 1e-3)
    cloth = (sat < 0.16) | (im[..., 2] > im[..., 0] + 0.02)          # grey cloth, and the blue-grey waistband
    cloth = np.asarray(Image.fromarray((cloth * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))) > 127
    print('cloth: %.1f%% of the texture' % (cloth.mean() * 100))
    g = grain((H, W))

    # colour: the skin spread smoothly into the gaps (at an eighth of the size: it is only the broad colour), grained
    q = (W // 8, H // 8)
    s = np.asarray(Image.fromarray((im * 255).astype(np.uint8)).resize(q, Image.BOX), np.float32) / 255
    skin_small = np.asarray(Image.fromarray((~cloth * 255).astype(np.uint8)).resize(q, Image.BOX), np.float32) / 255
    num = np.stack([blurf(s[..., c] * skin_small, 20) for c in range(3)], -1)
    den = blurf(skin_small, 20)[..., None]
    fill_small = num / np.maximum(den, 1e-3)
    fill = np.stack([np.asarray(Image.fromarray(fill_small[..., c].astype(np.float32), 'F').resize((W, H), Image.BICUBIC), np.float32)
                     for c in range(3)], -1)
    fill = fill * (1.0 + 0.02 * g[..., None])
    soft = blur(cloth.astype(np.float32), 2)[..., None]               # a soft seam into the real skin
    out = im * (1 - soft) + np.clip(fill, 0, 1) * soft
    Image.fromarray(np.clip(out * 255, 0, 255).astype(np.uint8)).save(OUT_C)
    print('wrote', OUT_C)

    # normal: the folds and seams laid flat (a wider margin: the seams' ridges reach past the cloth's colour)
    n = np.asarray(Image.open(os.path.join(GEN, 'T_Body_N.png')).convert('RGB').resize((W, H), Image.BOX), np.float32) / 255
    wide = np.asarray(Image.fromarray((cloth * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(15))) > 127
    k = blur(wide.astype(np.float32), 4)[..., None]
    gx = np.roll(g, -1, 1) - np.roll(g, 1, 1)
    gy = np.roll(g, -1, 0) - np.roll(g, 1, 0)
    flat = np.stack([0.5 - gx * 0.03, 0.5 - gy * 0.03, np.ones_like(g)], -1)
    v = n * 2 - 1
    v = v * (1 - k) + (flat * 2 - 1) * k
    v /= np.maximum(np.linalg.norm(v, axis=-1, keepdims=True), 1e-4)
    Image.fromarray(np.clip((v * 0.5 + 0.5) * 255 + 0.5, 0, 255).astype(np.uint8)).save(OUT_N)
    print('wrote', OUT_N)


if __name__ == '__main__':
    main()
