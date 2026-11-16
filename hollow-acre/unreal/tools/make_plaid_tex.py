"""Flannel, for the sleeves of the player's shirt in Part 2: the same red plaid flannel shirt the farmer wears in Part 1
(its default look: shirt #b8402c, plaid). A greyscale weave the material tints with the shirt's colour from the save:
light where the cloth is its colour, darker in the crossing bands of the plaid, with a twill weave and soft fuzz. One
tile repeats seamlessly. Writes SourceArt/T_Plaid.png.
Run: python hollow-acre/unreal/tools/make_plaid_tex.py
"""
import os

import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'HollowAcre', 'SourceArt', 'T_Plaid.png')
N = 1024


def bands(x):
    """The plaid's sett along one direction (0..1 across the tile): a wide dark band, a thin dark line, a thin light one."""
    v = np.ones_like(x)
    v = np.where((x % 1.0) < 0.36, 0.42, v)                                     # the wide dark band
    v = np.where(np.abs((x % 1.0) - 0.62) < 0.025, 0.55, v)                     # a thin dark line
    v = np.where(np.abs((x % 1.0) - 0.82) < 0.012, 1.25, v)                     # a thin light thread
    return v


def main():
    rng = np.random.default_rng(3)
    y, x = np.mgrid[0:N, 0:N] / N
    warp, weft = bands(x * 2), bands(y * 2)                                      # two setts across the tile
    plaid = np.sqrt(warp * weft)                                                 # crossings darkest, as woven
    twill = 0.93 + 0.07 * np.sign(np.sin((x + y) * N * np.pi / 3))              # the diagonal twill
    fuzz = np.asarray(Image.fromarray((rng.random((N, N)) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), np.float32) / 255
    v = plaid * twill * (0.92 + 0.16 * fuzz)
    v = np.clip(v / 1.25, 0, 1)
    Image.fromarray((v * 255).astype(np.uint8), 'L').save(OUT)
    print('wrote', OUT)


if __name__ == '__main__':
    main()
