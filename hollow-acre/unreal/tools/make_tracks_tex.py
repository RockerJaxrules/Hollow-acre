"""Tyre tracks in snow, for the decal over the smashed gap in the guardrail (where something went over the edge before
you): two ruts of packed, darker snow with the tread pressed in, ragged at their edges, fading at both ends; the
colour is packed snow, the alpha is where the tracks are. Writes SourceArt/T_TyreTracks.png (U along the tracks,
V across them).
Run: python hollow-acre/unreal/tools/make_tracks_tex.py
"""
import os

import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'HollowAcre', 'SourceArt', 'T_TyreTracks.png')
W, H = 2048, 512          # U along the tracks (about 14 m), V across them (about 2.2 m)


def main():
    rng = np.random.default_rng(5)
    u = np.linspace(0, 1, W)[None, :]
    v = np.linspace(0, 1, H)[:, None]
    wobble = 0.02 * np.sin(u * 9.0 + 1.3) + 0.01 * np.sin(u * 23.0)
    noise = np.asarray(Image.fromarray((rng.random((H, W)) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)), np.float32) / 255
    a = np.zeros((H, W), np.float32)
    for c in (0.27, 0.73):                                    # two wheels about 1.5 m apart
        d = np.abs(v - (c + wobble)) / 0.085                  # each rut about 19 cm wide
        edge = 0.08 * (noise - 0.5)
        rut = np.clip((1.0 - d + edge) / 0.25, 0, 1)
        tread = 0.75 + 0.25 * (np.sin(u * W * 0.9) > 0.2)
        a = np.maximum(a, rut * tread)
    # snow thrown up along the ruts' edges, and the ends fading (the near end on the road, the far end over the edge)
    fade = np.clip(u / 0.12, 0, 1) * np.clip((1 - u) / 0.25, 0, 1)
    a = a * fade * (0.85 + 0.3 * (noise - 0.5))
    rgb = np.stack([0.62 + 0.05 * noise, 0.66 + 0.05 * noise, 0.72 + 0.05 * noise], -1)   # packed, shadowed snow
    img = np.concatenate([rgb, np.clip(a, 0, 1)[..., None]], -1)
    Image.fromarray((img * 255).astype(np.uint8), 'RGBA').save(OUT)
    print('wrote', OUT)


if __name__ == '__main__':
    main()
