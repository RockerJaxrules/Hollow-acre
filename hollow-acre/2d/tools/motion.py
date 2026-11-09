"""Show an animation's MOTION in still images, for judges who can only look at pictures, and as GIFs for the owner.
python3 motion.py <capture dir> <clip> <frames> <seconds per cycle> <out dir> [scale]
  the capture dir holds <clip>_<S|E|N|W>_<k>.png (tanim3.js)
Writes, per facing:
  <clip>_<dir>.gif         the animation at its real speed, looping (for the owner)
  <clip>_<dir>_onion.png   every frame laid over one picture: the still background once, each frame's moving pixels on top,
                           early frames faint and cool, late frames strong and warm, with the frame numbers where each moved,
                           so the PATH of a swing (which way the tool travels, where it lands) is visible at a glance
and <clip>_motion.png: the four facings, each as a filmstrip followed by its onion skin."""
import sys, os
from PIL import Image, ImageDraw
import numpy as np
cap, clip, nf, cyc, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
scale = int(sys.argv[6]) if len(sys.argv) > 6 else 1
os.makedirs(out, exist_ok=True)
DIRS = ['S', 'E', 'N', 'W']
# frame tints from cool (early) to warm (late)
def tint(i, n):
    t = i / max(1, n - 1)
    return (int(60 + 195 * t), int(140 + 60 * (1 - abs(t - .5) * 2)), int(255 - 205 * t))
rows = []
for d in DIRS:
    fr = [np.asarray(Image.open(f'{cap}/{clip}_{d}_{k}.png').convert('RGB')).astype(np.int16) for k in range(nf)]
    h, w = fr[0].shape[:2]
    # GIF at real speed (frame time = cycle / frames), 3 cycles
    ims = [Image.fromarray(f.astype(np.uint8)).resize((w * scale, h * scale), Image.NEAREST) for f in fr]
    ims[0].save(f'{out}/{clip}_{d}.gif', save_all=True, append_images=ims[1:], duration=int(cyc / nf * 1000), loop=0)
    # the tool's path: each frame was also captured with the tool hidden, so the difference is exactly the tool (and the fists
    # and sparks on it). Drawn over the first frame's scene, early frames cool, late frames warm, numbered at the tool's far end.
    if os.path.exists(f'{cap}/{clip}_{d}_0_nt.png'):
        nt = [np.asarray(Image.open(f'{cap}/{clip}_{d}_{k}_nt.png').convert('RGB')).astype(np.int16) for k in range(nf)]
        canvas = (nt[0] * .7).astype(np.int16); labels = []
        cy, cx = h * .62, w / 2   # roughly the player's middle
        for i in range(nf):
            m = np.abs(fr[i] - nt[i]).sum(axis=2) > 40
            col = np.array(tint(i, nf))
            canvas[m] = (fr[i][m] * .45 + col * .55).astype(np.int16)
            ys, xs = np.nonzero(m)
            if len(xs):
                dd = (xs - cx) ** 2 + (ys - cy) ** 2; j = int(dd.argmax()); labels.append((i + 1, int(xs[j]), int(ys[j])))
        on = Image.fromarray(np.clip(canvas, 0, 255).astype(np.uint8)).resize((w * 2, h * 2), Image.NEAREST)
        dr = ImageDraw.Draw(on)
        for n, x, y in labels:
            dr.rectangle((x * 2 + 1, y * 2 - 11, x * 2 + 9, y * 2 - 1), fill=(0, 0, 0)); dr.text((x * 2 + 2, y * 2 - 12), str(n), fill=tint(n - 1, nf))
        on.save(f'{out}/{clip}_{d}_onion.png')
        strip = Image.new('RGB', (w * nf + on.width + 12, max(h, on.height)), (16, 16, 16))
        for i, f in enumerate(fr):
            strip.paste(Image.fromarray(f.astype(np.uint8)), (i * w, 0)); ImageDraw.Draw(strip).text((i * w + 3, 2), str(i + 1), fill=(255, 255, 255))
        strip.paste(on, (w * nf + 12, 0)); rows.append(strip); continue
    # onion skin
    med = np.median(np.stack(fr), axis=0).astype(np.int16)
    base = (med * .55).astype(np.int16)        # the still world dimmed so the motion stands out
    canvas = base.copy()
    labels = []
    for i, f in enumerate(fr):
        diff = np.abs(f - med).sum(axis=2) > 60
        a = .45 + .5 * i / max(1, nf - 1)
        col = np.array(tint(i, nf))
        mixed = (f * .6 + col * .4)
        canvas[diff] = (canvas[diff] * (1 - a) + mixed[diff] * a).astype(np.int16)
        ys, xs = np.nonzero(diff)
        if len(xs): labels.append((i + 1, int(xs.mean()), int(ys.min())))
    on = Image.fromarray(np.clip(canvas, 0, 255).astype(np.uint8)).resize((w * 2, h * 2), Image.NEAREST)
    dr = ImageDraw.Draw(on)
    for n, x, y in labels:
        dr.text((x * 2 + 2, max(0, y * 2 - 10)), str(n), fill=tint(n - 1, nf))
    on.save(f'{out}/{clip}_{d}_onion.png')
    strip = Image.new('RGB', (w * nf + on.width + 12, max(h, on.height)), (16, 16, 16))
    for i, f in enumerate(fr):
        im = Image.fromarray(f.astype(np.uint8)); strip.paste(im, (i * w, 0))
        ImageDraw.Draw(strip).text((i * w + 3, 2), str(i + 1), fill=(255, 255, 255))
    strip.paste(on, (w * nf + 12, 0))
    rows.append(strip)
W = max(r.width for r in rows); Hs = sum(r.height for r in rows) + 6 * len(rows)
sheet = Image.new('RGB', (W, Hs), (16, 16, 16)); y = 0
for r in rows: sheet.paste(r, (0, y)); y += r.height + 6
sheet.save(f'{out}/{clip}_motion.png')
print('ok', out)
