import sys, numpy as np
from PIL import Image
from portrait4 import portrait
from chars4 import CH
ids = sys.argv[1].split(',') if len(sys.argv) > 1 else list(CH)
exs = sys.argv[2].split(',') if len(sys.argv) > 2 else ['neutral']
sc = int(sys.argv[3]) if len(sys.argv) > 3 else 2
out = Image.new('RGBA', (128 * len(exs) * sc, 128 * len(ids) * sc), (0, 0, 0, 255))
bg = Image.new('RGBA', (128, 128))
g = np.zeros((128, 128, 4), np.uint8)
for y in range(128): g[y, :] = (int(217 - 31 * y / 127), int(168 - 39 * y / 127), int(104 - 30 * y / 127), 255)
bg = Image.fromarray(g)
for r, i in enumerate(ids):
    for c, e in enumerate(exs):
        im = Image.fromarray(portrait(CH[i], e)); b = bg.copy(); b.alpha_composite(im)
        out.paste(b.resize((128 * sc, 128 * sc), Image.NEAREST), (c * 128 * sc, r * 128 * sc))
out.save(sys.argv[4] if len(sys.argv) > 4 else '../p4prev.png'); print('saved')
