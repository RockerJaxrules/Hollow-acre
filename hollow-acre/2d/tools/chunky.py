"""Stardew-style chunky pixels: halve every sprite with a majority vote per 2x2 block, give it a bold dark hue-shifted outline at that
resolution, push contrast a little (lit tops lighter, shadows cooler), then double it back up with nearest-neighbour so each art pixel is 2x2."""
import sys, numpy as np
from PIL import Image
def chunk(im, outline=True, punch=1.0):
    a = np.asarray(im.convert('RGBA')).astype(np.int32); H, W = a.shape[:2]
    H2, W2 = (H + 1) // 2, (W + 1) // 2
    pad = np.zeros((H2 * 2, W2 * 2, 4), np.int32); pad[:H, :W] = a
    blk = pad.reshape(H2, 2, W2, 2, 4).transpose(0, 2, 1, 3, 4).reshape(H2, W2, 4, 4)
    out = np.zeros((H2, W2, 4), np.uint8)
    op = blk[..., 3] > 127
    n = op.sum(-1)
    for y in range(H2):
        for x in range(W2):
            k = n[y, x]
            if k < 2: continue
            px = blk[y, x][op[y, x]][:, :3]
            # majority colour; ties go to the darker one so edges and outlines survive
            keys = [tuple(p) for p in px]; best = max(set(keys), key=lambda c: (keys.count(c), -sum(c)))
            out[y, x, :3] = best; out[y, x, 3] = 255
    rgb = out[..., :3].astype(np.float32)
    if punch != 1.0:
        m = rgb.mean(-1, keepdims=True); rgb = np.clip(m + (rgb - m) * punch, 0, 255)
        lum = rgb.mean(-1, keepdims=True) / 255.0
        rgb = np.clip((rgb - 128) * 1.08 + 128, 0, 255)
        rgb[..., 2:3] += (0.5 - lum) * 10; rgb[..., 0:1] -= (0.5 - lum) * 6
        out[..., :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    if outline:
        alpha = out[..., 3] > 0; o = out.copy()
        for y in range(H2):
            for x in range(W2):
                if alpha[y, x]: continue
                nb = None
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < H2 and 0 <= xx < W2 and alpha[yy, xx]: nb = out[yy, xx]; break
                if nb is not None:
                    r, g, b = nb[:3].astype(int); o[y, x] = (max(16, r * .3), max(10, g * .24), max(20, b * .34), 255)
        out = o
    big = Image.fromarray(out, 'RGBA').resize((W2 * 2, W2 and H2 * 2), Image.NEAREST).crop((0, 0, W, H))
    return big
if __name__ == '__main__':
    for p in sys.argv[1:]:
        chunk(Image.open(p), punch=1.12).save(p.replace('.png', '_ck.png'))
