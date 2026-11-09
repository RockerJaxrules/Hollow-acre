"""Motion sheets for body animations straight from a character sheet (walk, run, idle, hurt, sit), for judges who only see
pictures, plus GIFs for the owner.
python3 sheetmotion.py <sheet.png> <clip> <out dir> [label]
Per facing: the frames at 4x, then an OUTLINE OVERLAY (every frame's outline in its own colour, cool = early, warm = late,
on one picture: the rise and fall, the arm swing and the stride are read at a glance), a WHAT MOVED map (frame 1 dimmed,
every pixel a later frame changes painted in that frame's colour), and for walk/run facing right a
GROUND TRACK (frames laid along the ground at their real travel: a planted foot should stay on its column).
GIFs: <clip>_<dir>.gif at the game's own speed."""
import sys, os
from PIL import Image, ImageDraw
import numpy as np
sheet, clip, out = sys.argv[1], sys.argv[2], sys.argv[3]
label = sys.argv[4] if len(sys.argv) > 4 else os.path.basename(sheet)[:-4]
os.makedirs(out, exist_ok=True)
CL = {'walk': (0, 9, 1, 8, 17 * 3 / 2.6, 3), 'run': (4, 9, 1, 8, 18 * 5 / 2.6, 5),   # the game's real rates: P.t runs at speed/2.6
      'idle': (8, 4, 0, 4, 3, 0), 'sit': (25, 3, 0, 3, 2, 0)}  # first row, frames in row, first frame, count, fps, tiles/s
ROWS = {'walk': 'NWSE', 'run': 'NWSE', 'idle': 'NWSE', 'sit': 'NWSE'}
im = Image.open(sheet).convert('RGBA')
SC = 4
def tint(i, n):
    t = i / max(1, n - 1)
    return (int(60 + 195 * t), int(140 + 60 * (1 - abs(t - .5) * 2)), int(255 - 205 * t), 255)
def frame(row, f): return im.crop((f * 48, row * 64, f * 48 + 48, row * 64 + 64))
if clip == 'hurt': specs = [('S', 20, 0, 6, 8)]
else:
    r0, nfr, f0, n, fps, tps = CL[clip]
    specs = [(d, r0 + i, f0, n, fps) for i, d in enumerate(ROWS[clip])]
blocks = []
for d, row, f0, n, fps in sorted(specs, key=lambda s: 'SENW'.index(s[0])):
    frs = [frame(row, f0 + k) for k in range(n)]
    big = [f.resize((48 * SC, 64 * SC), Image.NEAREST) for f in frs]
    bg = [Image.new('RGBA', b.size, (52, 74, 40, 255)) for b in big]
    for b, g in zip(big, bg): g.alpha_composite(b)
    bg[0].save(f'{out}/{clip}_{d}.gif', save_all=True, append_images=bg[1:] + (bg[1:-1][::-1] if clip == 'idle' else []), duration=int(1000 / fps), loop=0)
    # outline overlay
    ov = Image.new('RGBA', (48 * SC, 64 * SC), (24, 30, 22, 255)); px = ov.load()
    for i, f in enumerate(frs):
        a = np.asarray(f)[:, :, 3] > 0
        edge = a & ~(np.roll(a, 1, 0) & np.roll(a, -1, 0) & np.roll(a, 1, 1) & np.roll(a, -1, 1))
        ys, xs = np.nonzero(edge); col = tint(i, n)
        for y, x in zip(ys, xs):
            for dy in range(SC):
                for dx in range(SC): px[x * SC + dx, y * SC + dy] = col
    dr = ImageDraw.Draw(ov)
    for i in range(n): dr.rectangle((4 + i * 14, 4, 14 + i * 14, 14), fill=tint(i, n)); dr.text((6 + i * 14, 3), str(i + 1), fill=(0, 0, 0, 255))
    # what moved: the first frame dimmed, every pixel that differs from it in a later frame painted in that frame's colour
    # (for small motions like a breath, where outlines sit on top of each other)
    ch = Image.new('RGBA', (48 * SC, 64 * SC), (24, 30, 22, 255)); cp = ch.load()
    f0 = np.asarray(frs[0]).astype(int)
    for y in range(64):
        for x in range(48):
            if f0[y, x, 3]:
                g = int(f0[y, x, :3].mean() * .35) + 20
                for dy in range(SC):
                    for dx in range(SC): cp[x * SC + dx, y * SC + dy] = (g, g, g, 255)
    for i in range(1, n):
        fi = np.asarray(frs[i]).astype(int); dm = np.abs(fi - f0).sum(axis=2) > 0
        ys, xs = np.nonzero(dm); col = tint(i, n)
        for y, x in zip(ys, xs):
            for dy in range(SC):
                for dx in range(SC): cp[x * SC + dx, y * SC + dy] = col
    ImageDraw.Draw(ch).text((4, 4), 'changed vs frame 1', fill=(255, 255, 255, 255))
    parts = [*bg, ov, ch]
    if clip in ('walk', 'run') and d == 'E':
        step = CL[clip][5] * 32 / fps; N = n * 2
        tr = Image.new('RGBA', (int(48 + step * N + 8) * 2, N * 40 + 4), (40, 52, 34, 255)); td = ImageDraw.Draw(tr)
        for i in range(N):
            legs = frs[i % n].crop((0, 40, 48, 64)).resize((96, 48), Image.NEAREST); x = int(round(step * i)) * 2; y = i * 40 + 2
            for gx in range(0, tr.width, 8): td.line((gx, y, gx, y + 38), fill=(52, 66, 44, 255))
            tr.alpha_composite(legs, (x, y - 8))
        parts.append(tr)
    W = sum(p.width for p in parts) + 8 * len(parts); H = max(p.height for p in parts) + 18
    blk = Image.new('RGBA', (W, H), (16, 16, 16, 255)); x = 0
    ImageDraw.Draw(blk).text((4, 2), f'{label} {clip} facing {d}', fill=(255, 255, 255, 255))
    for p in parts: blk.alpha_composite(p, (x, 16)); x += p.width + 8
    blocks.append(blk)
W = max(b.width for b in blocks); H = sum(b.height for b in blocks)
sheet_out = Image.new('RGBA', (W, H), (16, 16, 16, 255)); y = 0
for b in blocks: sheet_out.alpha_composite(b, (0, y)); y += b.height
sheet_out.convert('RGB').save(f'{out}/{clip}_motion.png')
print('ok', out)
