"""The finish for Blender frames: hard alpha, one dark outline round the silhouette (a darker version of the colour
next to it, never pure black), and a sheet in the game's layout."""
import sys, os, json
from PIL import Image


def finish(im):
    im = im.convert('RGBA'); px = im.load(); W, H = im.size
    for y in range(H):
        for x in range(W):
            r, g, b, a = px[x, y]; px[x, y] = (r, g, b, 255) if a >= 128 else (0, 0, 0, 0)
    for y in range(H):   # a lone pixel with nothing beside it is a speck: drop it
        for x in range(W):
            if px[x, y][3] and not any(0 <= x + dx < W and 0 <= y + dy < H and px[x + dx, y + dy][3] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                px[x, y] = (0, 0, 0, 0)
    add = []
    for y in range(H):
        for x in range(W):
            if px[x, y][3]: continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                X, Y = x + dx, y + dy
                if 0 <= X < W and 0 <= Y < H and px[X, Y][3]:
                    r, g, b, _ = px[X, Y]; add.append((x, y, (int(r * .28), int(g * .22), int(b * .3), 255))); break
    for x, y, c in add: px[x, y] = c
    return im


if __name__ == '__main__':
    src, out = sys.argv[1], sys.argv[2]; clips = sys.argv[3:]
    order = [(c, d) for c in clips for d in ('N', 'W', 'S', 'E')]
    rows = []
    for c, d in order:
        fr = sorted([f for f in os.listdir(src) if f.startswith(f'{c}_{d}_') and f.endswith('.png') and '_n' not in f], key=lambda f: int(f.split('_')[-1][:-4]))
        if fr: rows.append([finish(Image.open(os.path.join(src, f))) for f in fr])
    FW, FH = rows[0][0].size; n = max(len(r) for r in rows)
    sheet = Image.new('RGBA', (FW * n, FH * len(rows)))
    for j, r in enumerate(rows):
        for i, f in enumerate(r): sheet.alpha_composite(f, (i * FW, j * FH))
    sheet.save(out); print(out, sheet.size)
