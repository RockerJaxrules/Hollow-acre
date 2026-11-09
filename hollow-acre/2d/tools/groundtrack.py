"""Ground track of a walk or run cycle, for judges who only see pictures: each frame drawn on its own line, shifted by how
far the character really travels in that frame, over a pixel grid, so a planted foot should stay on the same column
while the body passes over it (a foot that drifts is sliding).
python3 groundtrack.py <sheet.png> <row> <frames 1..n> <tiles per second> <frames per second> <out.png> [scale]
  e.g. the farmer's run facing right: farmer.png 7 8 5 18 run_E_track.png 4   (32 px per tile)"""
import sys
from PIL import Image, ImageDraw
sheet, row, n, tps, fps, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5]), sys.argv[6]
sc = int(sys.argv[7]) if len(sys.argv) > 7 else 4
im = Image.open(sheet).convert('RGBA')
step = tps * 32 / fps                      # px travelled per frame
cycles = 2; N = n * cycles
W = int(48 + step * N + 8); H = 64
canvas = Image.new('RGBA', (W * sc, H * N * sc // 2 + 20), (40, 52, 34, 255))
d = ImageDraw.Draw(canvas)
rowh = H * sc // 2
for i in range(N):
    f = 1 + i % n
    fr = im.crop((f * 48, row * 64, f * 48 + 48, row * 64 + 64))
    # keep only the legs and feet (the bottom half): the planted foot is what we track
    legs = fr.crop((0, 32, 48, 64)).resize((48 * sc, 32 * sc), Image.NEAREST)
    x = int(round(step * i)) * sc; y = i * rowh + 10
    for gx in range(0, W * sc, 4 * sc): d.line((gx, y, gx, y + rowh - 2), fill=(52, 66, 44, 255))
    canvas.alpha_composite(legs, (x, y))
    d.text((2, y + 2), str(f), fill=(255, 255, 255, 255))
canvas.save(out)
print('ok', out, f'{step:.1f} px per frame')
