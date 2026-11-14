"""Show the Aseprite samples the way a player will see them: on grass, next to the player for scale, day and night,
and check every sample against the art rules (hard alpha, palette only). Usage: python3 preview.py <samples dir> <farmer.png> <out.png>"""
import sys, json
import numpy as np
from PIL import Image
d, farmer, outp = sys.argv[1], sys.argv[2], sys.argv[3]
names = ['sample_cottage', 'sample_maple', 'sample_well']
ims = {n: Image.open(f'{d}/{n}.png').convert('RGBA') for n in names}
ims['sample_cottage_n'] = Image.open(f'{d}/sample_cottage_n.png').convert('RGBA')
report = {}
for n, im in ims.items():
    a = np.array(im); al = set(np.unique(a[..., 3]).tolist()); cols = len(np.unique(a[a[..., 3] > 0][:, :3], axis=0))
    report[n] = {'size': im.size, 'alpha_values': sorted(al), 'hard_alpha': al <= {0, 255}, 'colours': cols}
print(json.dumps(report, indent=1))
fr = Image.open(farmer).convert('RGBA').crop((0, 0, 48, 64))       # the player's first frame, for scale
def scene(night):
    W, H = 640, 260; bg = Image.new('RGBA', (W, H), (34, 40, 58, 255) if night else (86, 112, 58, 255))
    px = bg.load()
    for y in range(H):                                              # a little grass texture so it reads like the game
        for x in range(0, W, 1):
            if (x * 7 + y * 13) % 29 == 0: px[x, y] = (60, 82, 44, 255) if not night else (26, 30, 46, 255)
            elif (x * 11 + y * 5) % 37 == 0: px[x, y] = (108, 138, 70, 255) if not night else (44, 50, 72, 255)
    gy = 240
    x = 16
    for n in (['sample_cottage_n'] if night else ['sample_cottage']) + ['sample_maple', 'sample_well']:
        im = ims[n]; bg.alpha_composite(im, (x, gy - im.height + 4)); x += im.width + 14
        if n.startswith('sample_cottage'): bg.alpha_composite(fr, (x - 70, gy - 60))
    return bg
top = scene(False); bot = scene(True)
both = Image.new('RGBA', (top.width, top.height * 2 + 6), (0, 0, 0, 255)); both.alpha_composite(top, (0, 0)); both.alpha_composite(bot, (0, top.height + 6))
both.resize((both.width * 2, both.height * 2), Image.NEAREST).save(outp)
print('preview', outp)
