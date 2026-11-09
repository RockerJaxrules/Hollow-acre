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
if os.environ.get('WALK_FPS'): CL['walk'] = CL['walk'][:4] + (float(os.environ['WALK_FPS']) * 3 / 2.6, 3)   # an older build's walk rate
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
    parts = [*bg, ov, ch]; track = None
    if clip in ('walk', 'run') and d == 'E':
        # ground track at 4x: one cycle and one frame more, each frame's legs on its own line, shifted by the distance really
        # travelled; the pixels touching the ground marked red and their world x printed, so a sliding foot shows as numbers
        step = CL[clip][5] * 32 / fps; N = n + 1; TS = 4; LH = 28 * TS + 6
        tr = Image.new('RGBA', (int(48 + step * N + 70) * TS, N * LH + 4), (40, 52, 34, 255)); td = ImageDraw.Draw(tr)
        for i in range(N):
            fr_ = frs[i % n]; legs = fr_.crop((0, 36, 48, 64)); x = int(round(step * i)) * TS; y = i * LH + 2
            for gx in range(0, tr.width, TS * 2): td.line((gx, y, gx, y + LH - 4), fill=(50, 64, 42, 255))
            tr.alpha_composite(legs.resize((48 * TS, 28 * TS), Image.NEAREST), (x, y))
            a = np.asarray(fr_)[:, :, 3] > 0; ys = np.nonzero(a.any(axis=1))[0]; low = ys.max()
            cols = np.nonzero(a[low])[0]
            for cx_ in cols: td.rectangle((x + cx_ * TS, y + (low - 36) * TS, x + cx_ * TS + TS - 1, y + (low - 36) * TS + TS - 1), fill=(230, 40, 40, 255))
            # contact runs (each boot), in world px
            runs = []; st = None
            for k_, cx_ in enumerate(cols):
                if st is None: st = cx_
                if k_ == len(cols) - 1 or cols[k_ + 1] != cx_ + 1: runs.append((st, cx_)); st = None
            wx = ', '.join(f'{a_ + step * i:.0f}-{b_ + step * i:.0f}' for a_, b_ in runs)
            td.text((int(48 + step * N) * TS + 8, y + LH // 2 - 6), f'f{i % n + 1}: ground {wx}', fill=(255, 255, 255, 255))
        td.text((4, tr.height - 12), f'{step:.1f} px travelled per frame', fill=(255, 255, 255, 255))
        track = tr
    W = sum(p.width for p in parts) + 8 * len(parts); H = max(p.height for p in parts) + 18
    blk = Image.new('RGBA', (W, H), (16, 16, 16, 255)); x = 0
    ImageDraw.Draw(blk).text((4, 2), f'{label} {clip} facing {d}', fill=(255, 255, 255, 255))
    for p in parts: blk.alpha_composite(p, (x, 16)); x += p.width + 8
    if track is not None:   # the ground track on its own row under the frames
        tb = Image.new('RGBA', (max(blk.width, track.width), blk.height + track.height + 18), (16, 16, 16, 255))
        tb.alpha_composite(blk, (0, 0)); ImageDraw.Draw(tb).text((4, blk.height + 2), 'GROUND TRACK (facing right): a planted foot keeps the same red ground x from line to line', fill=(255, 255, 255, 255))
        tb.alpha_composite(track, (0, blk.height + 16)); blk = tb
    blocks.append(blk)
W = max(b.width for b in blocks); H = sum(b.height for b in blocks)
sheet_out = Image.new('RGBA', (W, H), (16, 16, 16, 255)); y = 0
for b in blocks: sheet_out.alpha_composite(b, (0, y)); y += b.height
sheet_out.convert('RGB').save(f'{out}/{clip}_motion.png')
print('ok', out)
