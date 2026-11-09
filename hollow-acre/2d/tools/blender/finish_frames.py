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
    for _ in range(2):   # clean clusters: a pixel no neighbour shares its colour with takes its neighbours' commonest colour
        fix = []
        for y in range(1, H - 1):
            for x in range(1, W - 1):
                c0 = px[x, y]
                if not c0[3] or (c0[0] > 200 and c0[1] > 150): continue   # never the glow
                nb = [px[x + dx, y + dy] for dx in (-1, 0, 1) for dy in (-1, 0, 1) if dx or dy]
                if any(n == c0 for n in nb): continue
                op = [n for n in nb if n[3]]
                if len(op) < 6: continue   # an edge or a thin line: leave it
                best = max(set(op), key=op.count)
                if op.count(best) >= 3: fix.append((x, y, best))
        for x, y, cc in fix: px[x, y] = cc
    rim = []   # a cool rim where the light (top left) catches the silhouette, so the body holds against night grass
    for y in range(H):
        for x in range(W):
            r, g, b, a = px[x, y]
            if not a or (r > 200 and g > 150): continue   # not the glow
            nx = ny = 0   # which way the silhouette faces here: toward its empty neighbours
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    if (dx or dy) and not (0 <= x + dx < W and 0 <= y + dy < H and px[x + dx, y + dy][3]): nx += dx; ny += dy
            n = (nx * nx + ny * ny) ** .5
            if n and (-nx - ny) / (1.4142 * n) >= .4:   # only edges that face the light (up and to the left)
                if r > b + 4:   # warm parts (the dry-wood sticks, the pumpkin skin): a warm lit edge, one pixel, so they stay wood
                    rim.append((x, y, (int(r * .5 + 176 * .5), int(g * .5 + 140 * .5), int(b * .5 + 100 * .5), 255))); continue
                rim.append((x, y, (int(r * .25 + 150 * .75), int(g * .25 + 140 * .75), int(b * .25 + 210 * .75), 255)))   # cool lavender
                X, Y = x - round(nx / n), y - round(ny / n)   # a second, softer pixel one step inside: the rim reads at 1x
                if 0 <= X < W and 0 <= Y < H and px[X, Y][3] and not (px[X, Y][0] > 200 and px[X, Y][1] > 150) and not (px[X, Y][0] > px[X, Y][2] + 4):
                    r2, g2, b2, _ = px[X, Y]; rim.append((X, Y, (int(r2 * .55 + 120 * .45), int(g2 * .55 + 112 * .45), int(b2 * .55 + 180 * .45), 255)))
    for x, y, c in rim: px[x, y] = c
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
