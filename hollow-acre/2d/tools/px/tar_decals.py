"""Street-wear decals for the blacktop, drawn with the tarmac generator's own code (ground2.py) but each on its own
transparent sprite, so the game can place them by world position along the street instead of baking them into the
192 px tile (where every distinct mark repeats every six tiles).
    python3 tar_decals.py OUT_DIR   -> tar_patch_a..d, tar_oil_a..c, tar_crack_a..e, tar_seal_a..c (+ meta.json)"""
import sys, os, math, random, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
from ground import Tile, N, HEX
import ground2 as g

KEY = HEX('#ff00ff')

def sprite(draw, seed):
    t = Tile(KEY); R = random.Random(seed); draw(t, R)
    im = Image.new('RGBA', (N, N))
    im.putdata([(0, 0, 0, 0) if c == KEY else c + (255,) for row in t.px for c in row])
    bb = im.getbbox(); return im.crop((bb[0] - 1, bb[1] - 1, bb[2] + 1, bb[3] + 1))

def patch(w, h, step=True):
    def d(t, R):
        x0, y0 = 96 - w // 2, 96 - h // 2
        ox, oy, w2, h2 = R.randint(4, w // 2), R.choice((-1, 1)) * R.randint(3, 5), R.randint(w // 2, w - 4), R.randint(h // 2, h)
        inside = lambda x, y: (0 <= x < w and 0 <= y < h) or (step and ox <= x < ox + w2 and oy <= y < oy + h2)
        for y in range(-6, h + 7):
            for x in range(-2, w + 2):
                if not inside(x, y): continue
                edge = not all(inside(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
                t.put(x0 + x, y0 + y, g.SNAKE if edge else g.PATCH)
        for k in range(int(w * h / 30)):   # the patch's own aggregate, a shade off
            x, y = R.randint(1, w - 2), R.randint(1, h - 2)
            if inside(x, y) and inside(x + 1, y) and inside(x, y + 1) and inside(x - 1, y - 1): t.put(x0 + x, y0 + y, g.TA_LO); t.put(x0 + x + 1, y0 + y, g.TA_LO)
    return d

def oil(L, W):
    """a drip where a car stood: one flat dark tone stretched along the lane, a ragged edge, a darker heart off-centre
    and a faint sheen on its upper-left rim; never a round blot (round dark ovals read as eyes)"""
    def d(t, R):
        blobs = [(R.uniform(-L * .45, L * .45), R.uniform(-W * .3, W * .3), R.uniform(W * .45, W * .8)) for _ in range(5)]
        blobs.append((L * .5, R.uniform(-1, 1), W * .35))                       # a thin tail where it ran
        body = set()
        for y in range(-W - 2, W + 3):
            for x in range(-L - 3, L + 4):
                if any(((x - bx) / (r * 2.1)) ** 2 + ((y - by) / r) ** 2 < 1 for bx, by, r in blobs) and R.random() > .04: body.add((x, y))
        hx, hy = blobs[0][0], blobs[0][1]
        for (x, y) in body:
            c = g.OIL
            if ((x - hx) / (W * .9)) ** 2 + ((y - hy) / (W * .4)) ** 2 < 1: c = g.OIL_DK
            elif (x - 1, y) not in body and (x, y - 1) not in body and R.random() < .5: c = g.OIL_SHEEN
            t.put(96 + x, 96 + y, c)
    return d


LIP_D = HEX('#3a3840')   # the broken edge's lit lip, a clear step above the road so the crack reads as a groove


def crack(steps, ang):
    """a groove that runs mostly one way (cracks follow the lane or cross it), turning gently, with a branch or two;
    dark line, lit lip on its lower side"""
    def d(t, R):
        a = ang; x, y = 96.0, 96.0; pts = []
        for i in range(steps):
            a += R.uniform(-.28, .28); a = ang + max(-.6, min(.6, a - ang)); x += math.cos(a); y += math.sin(a)
            pts.append((int(round(x)), int(round(y))))
            if i > 5 and R.random() < .06:
                bx, by, ba = x, y, a + R.choice((-1, 1)) * R.uniform(.6, 1.0)
                for j in range(R.randint(3, 7)):
                    ba += R.uniform(-.25, .25); bx += math.cos(ba); by += math.sin(ba); pts.append((int(round(bx)), int(round(by))))
        pts = list(dict.fromkeys(pts)); ps = set(pts)
        for (px, py) in pts:
            if (px, py + 1) not in ps: t.put(px, py + 1, LIP_D)
        for (px, py) in pts: t.put(px, py, g.SNAKE)
    return d


def seal(n):
    def d(t, R):
        a = R.uniform(0, 6.28); x, y = 96.0, 96.0; pts = []
        for i in range(n):
            a += R.uniform(-.3, .3); x += math.cos(a); y += math.sin(a); pts.append((int(round(x)), int(round(y))))
        pts = list(dict.fromkeys(pts))
        for (px, py) in pts: t.put(px, py, g.SNAKE); t.put(px + 1, py, g.SNAKE)
        for (px, py) in pts[3:8]: t.put(px, py - 1, g.SNAKE_HI)
    return d

SET = {'tar_patch_a': (patch(24, 13), 1), 'tar_patch_b': (patch(18, 11, False), 2), 'tar_patch_c': (patch(12, 10, False), 3), 'tar_patch_d': (patch(28, 10), 4),
       'tar_oil_a': (oil(9, 3), 5), 'tar_oil_b': (oil(5, 2), 6), 'tar_oil_c': (oil(13, 3), 7),
       'tar_crack_a': (crack(34, 0), 8), 'tar_crack_b': (crack(26, 1.4), 9), 'tar_crack_c': (crack(20, .3), 10), 'tar_crack_d': (crack(15, 1.7), 11), 'tar_crack_e': (crack(28, 3.3), 12),
       'tar_seal_a': (seal(24), 13), 'tar_seal_b': (seal(18), 14), 'tar_seal_c': (seal(30), 15)}

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True); meta = {}
    for name, (fn, seed) in SET.items():
        im = sprite(fn, seed); im.save(os.path.join(out, name + '.png'))
        meta[name] = {'src': f'spr/lpc/obj/{name}.png', 'fw': im.width, 'fh': im.height, 'ax': im.width / 2, 'ay': im.height / 2, 'foot': [0, 0, 0, 0]}
    json.dump(meta, open(os.path.join(out, 'meta.json'), 'w'), indent=1); print(len(meta), 'decals')
