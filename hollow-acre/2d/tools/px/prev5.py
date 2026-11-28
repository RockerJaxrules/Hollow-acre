import sys, numpy as np
from PIL import Image
from portrait4 import portrait
from chars4 import CH
# prev5.py ids exprs vars scale out
ids = sys.argv[1].split(','); exs = sys.argv[2].split(','); vs = sys.argv[3].split(','); sc = int(sys.argv[4])
g = np.zeros((128, 128, 4), np.uint8)
for y in range(128): g[y, :] = (int(217 - 31 * y / 127), int(168 - 39 * y / 127), int(104 - 30 * y / 127), 255)
bg = Image.fromarray(g); cells = [(i, e, v) for i in ids for v in vs for e in exs]; cols = len(exs)
out = Image.new('RGBA', (128 * cols * sc, 128 * (len(cells) // cols) * sc))
for k, (i, e, v) in enumerate(cells):
    b = bg.copy(); b.alpha_composite(Image.fromarray(portrait(CH[i], e, v)))
    out.paste(b.resize((128 * sc, 128 * sc), Image.NEAREST), ((k % cols) * 128 * sc, (k // cols) * 128 * sc))
out.save(sys.argv[5]); print('saved', out.size)
