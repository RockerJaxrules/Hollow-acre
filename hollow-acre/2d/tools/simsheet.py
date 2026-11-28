"""Icon vs in-hand: per tool, the inventory icon at 4x, then the tool as held in each facing (cropped around the tool, 4x),
taken from captures with and without the tool (the difference is the tool), on the game's ground."""
import sys, numpy as np
from PIL import Image, ImageDraw
cap, out, R = sys.argv[1], sys.argv[2], sys.argv[3]   # R: a folder of the game's own toolbar icons (hoe.png axe.png pick.png can.png)
TOOLS = [('hoe', 'hoe', [2, 5]), ('axe', 'axe', [2, 5]), ('pick', 'pick', [2, 5]), ('water', 'can', [0, 4])]
rows = []
for clip, icon, frames in TOOLS:
    ic = Image.open(f'{R}/{icon}.png').convert('RGBA'); ic = ic.resize((ic.width * 4, ic.height * 4), Image.NEAREST)
    cells = [ic]
    for d in 'SENW':
        for k in frames:
            a = np.asarray(Image.open(f'{cap}/{clip}_{d}_{k}.png').convert('RGB')).astype(int); b = np.asarray(Image.open(f'{cap}/{clip}_{d}_{k}_nt.png').convert('RGB')).astype(int)
            m = np.abs(a - b).sum(axis=2) > 40; ys, xs = np.nonzero(m)
            if not len(xs): continue
            cx, cy = int(np.median(xs)), int(np.median(ys)); r = 20
            c = Image.fromarray(a.astype(np.uint8)).crop((cx - r, cy - r, cx + r, cy + r)).resize((160, 160), Image.NEAREST); cells.append(c)
    W = sum(c.width for c in cells) + 8 * len(cells); H = max(c.height for c in cells) + 18
    row = Image.new('RGB', (W, H), (20, 20, 20)); dr = ImageDraw.Draw(row); x = 0
    for i, c in enumerate(cells):
        bgc = Image.new('RGB', c.size, (58, 74, 44)); bgc.paste(c, (0, 0), c) if c.mode == 'RGBA' else None; row.paste(bgc if c.mode == 'RGBA' else c, (x, 16)); dr.text((x + 2, 2), 'ICON' if i == 0 else f'in hand {"SENW"[(i - 1) // 2] if i <= 8 else ""}', fill=(230, 230, 230)); x += c.width + 8
    rows.append(row)
W = max(r.width for r in rows); H = sum(r.height for r in rows) + 6 * len(rows)
o = Image.new('RGB', (W, H), (20, 20, 20)); y = 0
for r in rows: o.paste(r, (0, y)); y += r.height + 6
o.save(out); print('ok', o.size)
